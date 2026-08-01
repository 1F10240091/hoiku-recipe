"""AI 献立生成サービス。

Xiaomi MiMo（OpenAI 互換 Chat Completions API）を使い、保育園の昼食・
冷蔵庫の在庫・アレルギー・好き嫌いを考慮した夕食献立を生成する。

API キー未設定時は、ルールベースのフォールバックで献立を組み立てる。
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from datetime import date, timedelta

import httpx

from app.config import get_settings


@dataclass
class GeneratedMenu:
    """1 日分の生成献立。"""

    date: date
    menu_text: str
    dishes: list[str] = field(default_factory=list)
    engine: str = "rule_based"


# ルールベース用の夕食献立プール（アレルギー食材タグ付き）
_MENU_POOL: list[dict] = [
    {"name": "和風ハンバーグ・みそ汁・おひたし", "ingredients": ["ハンバーグ", "みそ", "豆腐", "ほうれん草"]},
    {"name": "鮭の塩焼き・野菜の煮物・ごはん", "ingredients": ["さけ", "ごはん"]},
    {"name": "カレーライス・コールスローサラダ", "ingredients": ["ごはん", "にんじん"]},
    {"name": "鶏の照り焼き・味噌汁・ごはん", "ingredients": ["鶏肉", "みそ", "ごはん"]},
    {"name": "肉じゃが・キャベツの浅漬け・ごはん", "ingredients": ["ごはん"]},
    {"name": "豚の生姜焼き・ほうれん草のごま和え・ごはん", "ingredients": ["豚肉", "ごはん", "ほうれん草", "ごま"]},
    {"name": "ハヤシライス・フルーツ", "ingredients": ["ごはん"]},
    {"name": "焼き鮭・小松菜のおひたし・豆腐の味噌汁・ごはん", "ingredients": ["さけ", "みそ", "豆腐", "ごはん"]},
    {"name": "野菜たっぷりうどん・いなりずし", "ingredients": ["うどん", "油揚げ"]},
    {"name": "豆腐ハンバーグ・ひじきの煮物・みそ汁・ごはん", "ingredients": ["豆腐", "みそ", "ごはん"]},
]

# 表記ゆれ（ひらがな⇔漢字⇔カタカナ）の同義語辞書
_SYNONYMS: dict[str, list[str]] = {
    "さけ": ["さけ", "鮭", "サーモン", "しゃけ"],
    "卵": ["卵", "たまご", "玉子", "エッグ"],
    "牛乳": ["牛乳", "乳", "バター", "チーズ", "ヨーグルト"],
    "小麦": ["小麦", "うどん", "パン", "麺"],
    "そば": ["そば", "蕎麦"],
    "大豆": ["大豆", "豆腐", "みそ", "味噌", "しょうゆ", "醤油", "油揚げ"],
    "落花生": ["落花生", "ピーナッツ", "ぴーなっつ"],
    "くるみ": ["くるみ", "胡桃"],
    "ごま": ["ごま", "ゴマ", "胡麻"],
}


def _matches_ingredient(ingredient: str, target: str) -> bool:
    """食材名（表記ゆれ対応）が対象文字列に含まれるか判定する。"""
    aliases = _SYNONYMS.get(ingredient.lower(), [ingredient])
    return any(alias in target for alias in aliases)


def _shared_dishes(dishes_a: list[str], dishes_b: list[str]) -> list[str]:
    """2 つの献立に共通して含まれる主菜レベルの料理を返す。

    「ごはん」のような毎回必ず付く主食・汁物は重複判定から除外し、
    主菜（メインのおかず）の重複だけを検出する。
    """
    ignore = {"ごはん", "白ごはん", "みそ汁", "味噌汁", "スープ", "おひたし"}
    a = {d for d in dishes_a if d not in ignore}
    b = {d for d in dishes_b if d not in ignore}
    return sorted(a & b)


def generate_menus(
    *,
    child_name: str,
    start_date: date,
    days: int,
    allergies: list[str],
    preferences: list[str],
    nursery_menus: list[str],
    yesterday_menu: str | None = None,
    inventory: list[str] | None = None,
) -> list[GeneratedMenu]:
    """指定日数分の夕食献立を生成する。

    Args:
        child_name: お子様の名前。
        start_date: 生成開始日。
        days: 生成する日数（1〜7）。
        allergies: アレルギー食材リスト。
        preferences: 好き嫌い（除外希望）リスト。
        nursery_menus: 保育園の昼食献立テキスト（重複回避用）。
        yesterday_menu: 前日の夕食献立テキスト。週の境目（日曜→月曜など）を
            またいでも漏れなく重複を避けるため、開始日前日の夕食を渡す。
        inventory: 冷蔵庫の在庫食材リスト。

    Returns:
        日付ごとの GeneratedMenu のリスト。
    """
    settings = get_settings()
    inventory = inventory or []

    if settings.ai_api_key:
        try:
            return _generate_with_mimo(
                child_name=child_name,
                start_date=start_date,
                days=days,
                allergies=allergies,
                preferences=preferences,
                nursery_menus=nursery_menus,
                yesterday_menu=yesterday_menu,
                inventory=inventory,
            )
        except Exception:
            # AI 接続失敗時はルールベースにフォールバック
            pass

    return _generate_rule_based(
        child_name=child_name,
        start_date=start_date,
        days=days,
        allergies=allergies,
        preferences=preferences,
        nursery_menus=nursery_menus,
        yesterday_menu=yesterday_menu,
    )


def _generate_rule_based(
    *,
    child_name: str,
    start_date: date,
    days: int,
    allergies: list[str],
    preferences: list[str],
    nursery_menus: list[str],
    yesterday_menu: str | None,
) -> list[GeneratedMenu]:
    """API キー未設定時のルールベース献立生成。

    アレルギー・好き嫌いを除外し、保育園の昼食および前日の夕食と
    重複しない献立をプールから順に選ぶ。
    """
    excluded = [a.lower() for a in allergies + preferences]
    nursery_text = " ".join(nursery_menus)
    yesterday_dishes = _extract_dishes(yesterday_menu) if yesterday_menu else []

    selected: list[str] = []
    for item in _MENU_POOL:
        name = item["name"]
        dishes = name.split("・")
        # アレルギー・好き嫌いの食材を食材タグで判定（表記ゆれ対応）
        if any(any(_matches_ingredient(tag, ing) for tag in item["ingredients"]) for ing in excluded):
            continue
        # 保育園の昼食と重複しない
        if any(name_part in nursery_text for name_part in dishes):
            continue
        # 前日の夕食と主菜が重複しない（週の境目をまたぐ場合も対象）
        if _shared_dishes(dishes, yesterday_dishes):
            continue
        # 今週内で既に選んだ献立と主菜が重複しない
        if any(_shared_dishes(dishes, prev.split("・")) for prev in selected):
            continue
        selected.append(name)

    if not selected:
        selected = ["白ごはん・具だくさん味噌汁・焼き魚"]

    result: list[GeneratedMenu] = []
    for i in range(days):
        d = start_date + timedelta(days=i)
        name = selected[i % len(selected)]
        dishes = name.split("・")
        result.append(
            GeneratedMenu(
                date=d,
                menu_text=f"{child_name} さんの夕食（{d}）\n{name}",
                dishes=dishes,
                engine="rule_based",
            )
        )
    return result


def _extract_dishes(menu_text: str) -> list[str]:
    """献立テキストから・区切りの料理名リストを取り出す。"""
    dishes: list[str] = []
    for line in menu_text.splitlines():
        line = line.strip()
        if not line or "：" in line:
            continue
        for part in line.split("・"):
            part = part.strip()
            if part and part not in dishes:
                dishes.append(part)
    return dishes


def _generate_with_mimo(
    *,
    child_name: str,
    start_date: date,
    days: int,
    allergies: list[str],
    preferences: list[str],
    nursery_menus: list[str],
    yesterday_menu: str | None,
    inventory: list[str],
) -> list[GeneratedMenu]:
    """Xiaomi MiMo（OpenAI 互換 API）で献立を生成する。"""
    settings = get_settings()

    system_prompt = (
        "あなたは保育園に通う 3〜6 歳児を持つ保護者向けに、夕食献立を提案する栄養士です。\n"
        "必ず JSON 配列のみを出力してください。料理名は箇条書き（・区切り）にします。\n"
        "出力形式: [{\"date\": \"YYYY-MM-DD\", \"menu_text\": \"献立名・料理1・料理2\"}]\n"
        "アレルギー食材・除外希望の食材を必ず使いません。\n"
        "保育園の昼食・前日の夕食・同じ週内の他の日と、主菜が重複しないようにします。"
    )

    user_prompt = (
        f"お子様: {child_name}\n"
        f"対象期間: {start_date} から {days} 日分\n"
        f"アレルギー: {allergies or 'なし'}\n"
        f"好き嫌い（除外希望）: {preferences or 'なし'}\n"
        f"保育園の昼食: {' / '.join(nursery_menus) or 'なし'}\n"
        f"前日の夕食（重複禁止）: {yesterday_menu or 'なし'}\n"
        f"冷蔵庫の在庫: {inventory or 'なし'}\n"
        f"保育園の昼食・前日の夕食と主菜が重複しないバランスの良い夕食献立を {days} 日分生成してください。"
    )

    payload = {
        "model": settings.ai_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.7,
        "max_completion_tokens": 1024,
    }

    headers = {
        "Authorization": f"Bearer {settings.ai_api_key}",
        "Content-Type": "application/json",
    }

    with httpx.Client(timeout=settings.ai_timeout_seconds) as client:
        resp = client.post(f"{settings.ai_base_url.rstrip('/')}/chat/completions", headers=headers, json=payload)
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]

    entries = _parse_mimo_response(content)
    menus: list[GeneratedMenu] = []
    for i, entry in enumerate(entries[:days]):
        d = start_date + timedelta(days=i)
        dishes = [d for d in str(entry.get("menu_text", "")).split("・") if d]
        menus.append(
            GeneratedMenu(
                date=d,
                menu_text=f"{child_name} さんの夕食（{d}）\n{entry.get('menu_text', '')}",
                dishes=dishes,
                engine="mimo",
            )
        )
    if not menus:
        raise RuntimeError("AI の出力を解析できませんでした")
    return menus


def _parse_mimo_response(content: str) -> list[dict]:
    """AI の出力から JSON 配列を抽出する。"""
    match = re.search(r"\[.*\]", content, re.DOTALL)
    if not match:
        return []
    try:
        data = json.loads(match.group(0))
        if isinstance(data, list):
            return [item for item in data if isinstance(item, dict)]
    except json.JSONDecodeError:
        return []
    return []
