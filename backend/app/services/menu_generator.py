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


def generate_menus(
    *,
    child_name: str,
    start_date: date,
    days: int,
    allergies: list[str],
    preferences: list[str],
    nursery_menus: list[str],
    inventory: list[str],
) -> list[GeneratedMenu]:
    """指定日数分の夕食献立を生成する。

    Args:
        child_name: お子様の名前。
        start_date: 生成開始日。
        days: 生成する日数（1〜7）。
        allergies: アレルギー食材リスト。
        preferences: 好き嫌い（除外希望）リスト。
        nursery_menus: 保育園の昼食献立テキスト（重複回避用）。
        inventory: 冷蔵庫の在庫食材リスト。

    Returns:
        日付ごとの GeneratedMenu のリスト。
    """
    settings = get_settings()

    if settings.ai_api_key:
        try:
            return _generate_with_mimo(
                child_name=child_name,
                start_date=start_date,
                days=days,
                allergies=allergies,
                preferences=preferences,
                nursery_menus=nursery_menus,
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
    )


def _generate_rule_based(
    *,
    child_name: str,
    start_date: date,
    days: int,
    allergies: list[str],
    preferences: list[str],
    nursery_menus: list[str],
) -> list[GeneratedMenu]:
    """API キー未設定時のルールベース献立生成。

    アレルギー・好き嫌いを除外し、保育園の昼食と重複しない献立を
    プールから順に選ぶ。
    """
    excluded = [a.lower() for a in allergies + preferences]
    nursery_text = " ".join(nursery_menus)

    menu_texts: list[str] = []
    for item in _MENU_POOL:
        name = item["name"]
        # アレルギー・好き嫌いの食材を食材タグで判定（表記ゆれ対応）
        if any(any(_matches_ingredient(tag, ing) for tag in item["ingredients"]) for ing in excluded):
            continue
        if any(name_part in nursery_text for name_part in name.split("・")):
            continue
        menu_texts.append(name)

    if not menu_texts:
        menu_texts = ["白ごはん・具だくさん味噌汁・焼き魚"]

    result: list[GeneratedMenu] = []
    for i in range(days):
        d = start_date + timedelta(days=i)
        name = menu_texts[i % len(menu_texts)]
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


def _generate_with_mimo(
    *,
    child_name: str,
    start_date: date,
    days: int,
    allergies: list[str],
    preferences: list[str],
    nursery_menus: list[str],
    inventory: list[str],
) -> list[GeneratedMenu]:
    """Xiaomi MiMo（OpenAI 互換 API）で献立を生成する。"""
    settings = get_settings()

    system_prompt = (
        "あなたは保育園に通う 3〜6 歳児を持つ保護者向けに、夕食献立を提案する栄養士です。\n"
        "必ず JSON 配列のみを出力してください。料理名は箇条書き（・区切り）にします。\n"
        "出力形式: [{\"date\": \"YYYY-MM-DD\", \"menu_text\": \"献立名・料理1・料理2\"}]\n"
        "アレルギー食材・除外希望の食材を必ず使いません。"
    )

    user_prompt = (
        f"お子様: {child_name}\n"
        f"対象期間: {start_date} から {days} 日分\n"
        f"アレルギー: {allergies or 'なし'}\n"
        f"好き嫌い（除外希望）: {preferences or 'なし'}\n"
        f"保育園の昼食: {' / '.join(nursery_menus) or 'なし'}\n"
        f"冷蔵庫の在庫: {inventory or 'なし'}\n"
        f"保育園の昼食と重複しないバランスの良い夕食献立を {days} 日分生成してください。"
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
