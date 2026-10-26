"""AI 献立生成サービス。

レシピマスタ（DB）に登録された料理から、保育園の昼食・冷蔵庫の在庫・
アレルギー・好き嫌い・前日の夕食を考慮した夕食献立を選定する。

選定方式:
- Xiaomi MiMo（OpenAI 互換 API）が利用可能なら、レシピカタログと制約を
  渡して「どのレシピを選ぶか」を決めさせる。
- API キー未設定時はルールベースで DB から順に選定する。
- どちらの場合も選定結果を DB の食材情報と照合し、アレルゲンが
  含まれないことを最終確認する。
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass, field
from datetime import date, timedelta

import httpx

from app.config import get_settings
from app.models import Recipe

logger = logging.getLogger(__name__)


@dataclass
class GeneratedMenu:
    """1 日分の生成献立。"""

    date: date
    menu_text: str
    dishes: list[str] = field(default_factory=list)
    engine: str = "rule_based"
    recipe_ids: list[str] = field(default_factory=list)
    # AI が新規に考案した料理の詳細（name/meal_type/ingredients/instructions/cook_time_minutes）。
    # DB 登録後に recipe_ids が埋まる。
    dish_details: list[dict] = field(default_factory=list)


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

# 献立を構成する際の標準的な組み合わせ（主菜・汁物・副菜・主食）
_DEFAULT_SOUP = "みそ汁"
_DEFAULT_SIDE = "おひたし"
_DEFAULT_STAPLE = "ごはん"


def _matches_ingredient(ingredient: str, target: str) -> bool:
    """食材名（表記ゆれ対応）が対象文字列に含まれるか判定する。"""
    aliases = _SYNONYMS.get(ingredient.lower(), [ingredient])
    return any(alias in target for alias in aliases)


def _recipe_has_allergen(recipe: Recipe, allergens: list[str]) -> bool:
    """レシピの使用食品にアレルゲンが含まれるか判定する。"""
    if not allergens:
        return False
    recipe_ingredients = " ".join(str(i.get("name", "")) for i in recipe.ingredients)
    return any(_matches_ingredient(a, recipe_ingredients) for a in allergens)


def _shared_names(a: list[str], b: list[str]) -> bool:
    """2 つの料理名リストに共通する主菜レベルの料理があるか判定する。"""
    ignore = {"ごはん", "白ごはん", "みそ汁", "味噌汁", "スープ", "おひたし"}
    sa = {d for d in a if d not in ignore}
    sb = {d for d in b if d not in ignore}
    return bool(sa & sb)


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
    recipes: list[Recipe] | None = None,
    child_age_months: int | None = None,
) -> list[GeneratedMenu]:
    """指定日数分の夕食献立をレシピマスタから選定する。

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
        recipes: レシピマスタ。None の場合は DB から全件取得する。

    Returns:
        日付ごとの GeneratedMenu のリスト。
    """
    settings = get_settings()
    inventory = inventory or []
    recipe_list = recipes if recipes is not None else []

    if settings.ai_api_key:
        try:
            return _generate_freeform_with_mimo(
                child_name=child_name,
                child_age_months=child_age_months,
                start_date=start_date,
                days=days,
                allergies=allergies,
                preferences=preferences,
                nursery_menus=nursery_menus,
                yesterday_menu=yesterday_menu,
                inventory=inventory,
            )
        except Exception as exc:  # noqa: BLE001 - AI 失敗時は必ずルールベースへ
            logger.warning("AI 献立生成に失敗したためルールベースに切り替えます: %s", exc)

    return _generate_rule_based(
        child_name=child_name,
        start_date=start_date,
        days=days,
        allergies=allergies,
        preferences=preferences,
        nursery_menus=nursery_menus,
        yesterday_menu=yesterday_menu,
        recipes=recipe_list,
        inventory=inventory,
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
    recipes: list[Recipe],
    inventory: list[str] | None = None,
) -> list[GeneratedMenu]:
    """レシピマスタからルールベースで献立を選定する。

    アレルギー・好き嫌いを除外し、保育園の昼食・前日の夕食・今週内の
    既選献立と主菜が重複しない組み合わせを順に選ぶ。
    在庫がある食材を使うレシピを優先的に選ぶ。
    """
    inventory = inventory or []
    inventory_lower = {inv.lower() for inv in inventory}
    allergens = [a.lower() for a in allergies + preferences]
    nursery_text = " ".join(nursery_menus)
    yesterday_dishes = _extract_dishes(yesterday_menu) if yesterday_menu else []

    mains = [r for r in recipes if r.meal_type == "main"]
    soup = next((r for r in recipes if r.meal_type == "soup" and not _recipe_has_allergen(r, allergens)), None)
    sides = [r for r in recipes if r.meal_type == "side" and not _recipe_has_allergen(r, allergens)]
    staple = next((r for r in recipes if r.meal_type == "staple" and not _recipe_has_allergen(r, allergens)), None)

    def _uses_inventory(recipe: Recipe) -> int:
        """レシピが在庫食材をいくつ使っているかカウント（優先度用）。"""
        return sum(1 for ing in recipe.ingredients if ing.get("name", "").lower() in inventory_lower)

    # 在庫を使うレシピを優先するため、主菜をスコア順にソート
    scored_mains = []
    for main in mains:
        if _recipe_has_allergen(main, allergens):
            continue
        if any(_matches_ingredient(main.name, part) for part in nursery_text.split("・")):
            continue
        score = _uses_inventory(main)
        scored_mains.append((score, main))
    scored_mains.sort(key=lambda x: -x[0])  # 在庫使用数が多い順

    selected: list[list[Recipe]] = []
    for score, main in scored_mains:
        if _shared_names([main.name], yesterday_dishes):
            continue
        if any(_shared_names([main.name], [prev[0].name]) for prev in selected):
            continue
        combo = [main]
        if soup:
            combo.append(soup)
        if sides:
            # 副菜も在庫使用数でソートして選ぶ
            scored_sides = [( _uses_inventory(s), s) for s in sides]
            scored_sides.sort(key=lambda x: -x[0])
            combo.append(scored_sides[len(selected) % len(scored_sides)][1])
        if staple and staple.name != main.name:
            combo.append(staple)
        selected.append(combo)

    if not selected:
        # すべての主菜が使えない場合は、アレルゲン判定済みの最小構成で代替
        fallback = [r for r in recipes if not _recipe_has_allergen(r, allergens)]
        combo = [fallback[0]] if fallback else []
        selected = [combo] * days

    result: list[GeneratedMenu] = []
    for i in range(days):
        d = start_date + timedelta(days=i)
        combo = selected[i % len(selected)]
        dishes = [r.name for r in combo]
        result.append(
            GeneratedMenu(
                date=d,
                menu_text=f"{child_name} さんの夕食（{d}）\n{'・'.join(dishes)}",
                dishes=dishes,
                engine="rule_based",
                recipe_ids=[r.id for r in combo],
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


def _generate_freeform_with_mimo(
    *,
    child_name: str,
    child_age_months: int | None,
    start_date: date,
    days: int,
    allergies: list[str],
    preferences: list[str],
    nursery_menus: list[str],
    yesterday_menu: str | None,
    inventory: list[str],
) -> list[GeneratedMenu]:
    """年齢に適した日本の献立を AI に新規生成させる（レシピDBに依存しない）。

    返す GeneratedMenu の dish_details に、材料・作り方まで含めた料理情報が入る。
    DB へのレシピ登録は呼び出し側（routers/recipes.py）が行う。
    """
    settings = get_settings()
    age_text = _format_age(child_age_months)

    system_prompt = (
        "あなたは日本の保育園児をもつ家庭向けの管理栄養士です。\n"
        "指定された年齢の子どもが食べやすい、日本の家庭料理の夕食献立を新しく考案してください。\n"
        "レシピ候補リストはありません。一般的な日本の家庭料理（和食中心）で自由に考えてください。\n"
        "必ず JSON 配列のみを出力し、前後に説明文やコードフェンスを付けないでください。\n"
        "出力形式:\n"
        '[{"date":"YYYY-MM-DD","dishes":['
        '{"name":"料理名","meal_type":"main|side|soup|staple",'
        '"ingredients":[{"name":"食材","quantity":"100","unit":"g"}],'
        '"instructions":"簡単な作り方","cook_time_minutes":20}]}]\n'
        "制約:\n"
        "- アレルギー食材・除外希望の食材は絶対に使わない（調味料・ソース・隠し味も含む）\n"
        "- 冷蔵庫の在庫食材を優先して使う\n"
        "- 保育園の昼食と主菜を重複させない\n"
        "- 前日の夕食と主菜を重複させない\n"
        "- 1日 = 主菜1・副菜1・汁物1・主食1（必ず4品）\n"
        "- 年齢に合わせて薄味・やわらかめ・食べやすい大きさにする\n"
        "- 材料は1人分の分量と単位を書く\n"
        "- 同じ料理を期間内で繰り返さない"
    )

    user_prompt = (
        f"お子様: {child_name}（{age_text}）\n"
        f"対象期間: {start_date} から {days} 日分\n"
        f"アレルギー: {allergies or 'なし'}\n"
        f"好き嫌い（除外希望）: {preferences or 'なし'}\n"
        f"保育園の昼食: {' / '.join(nursery_menus) or 'なし'}\n"
        f"前日の夕食（重複禁止）: {yesterday_menu or 'なし'}\n"
        f"冷蔵庫の在庫: {inventory or 'なし'}\n"
        f"{age_text}の子どもに適した日本の夕食を {days} 日分考案し、JSON で出力してください。"
    )

    payload = {
        "model": settings.ai_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.8,
        "max_completion_tokens": 6000,
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
    excluded = [a.lower() for a in allergies + preferences]

    menus: list[GeneratedMenu] = []
    for i, entry in enumerate(entries[:days]):
        d = start_date + timedelta(days=i)
        details = []
        for raw in entry.get("dishes", []):
            detail = _normalize_dish_detail(raw)
            if detail is None:
                continue
            # 料理名だけでなく材料名も照合し、アレルゲンを含む料理は落とす
            searchable = detail["name"] + " " + " ".join(ing["name"] for ing in detail["ingredients"])
            if any(_matches_ingredient(a, searchable) for a in excluded):
                logger.warning("AI が除外対象を含む料理を返したため除外しました: %s", detail["name"])
                continue
            details.append(detail)
        if not details:
            continue
        names = [x["name"] for x in details]
        menus.append(
            GeneratedMenu(
                date=d,
                menu_text=f"{child_name} さんの夕食（{d}）\n{'・'.join(names)}",
                dishes=names,
                engine="mimo_freeform",
                recipe_ids=[],
                dish_details=details,
            )
        )

    if not menus:
        raise RuntimeError("AI の出力を解析できませんでした")
    return menus


def _normalize_dish_detail(raw: object) -> dict | None:
    """AI が返した 1 品分の情報を正規化する。旧形式（文字列）も受け付ける。"""
    if isinstance(raw, str):
        name = raw.strip()
        if not name:
            return None
        return {
            "name": name,
            "meal_type": "main",
            "ingredients": [],
            "instructions": "",
            "cook_time_minutes": None,
        }
    if not isinstance(raw, dict):
        return None

    name = str(raw.get("name", "")).strip()
    if not name:
        return None

    meal_type = str(raw.get("meal_type", "main")).strip()
    if meal_type not in {"main", "side", "soup", "staple"}:
        meal_type = "main"

    ingredients: list[dict] = []
    raw_ingredients = raw.get("ingredients")
    if isinstance(raw_ingredients, list):
        for item in raw_ingredients:
            if isinstance(item, str):
                ingredient_name = item.strip()
                if ingredient_name:
                    ingredients.append({"name": ingredient_name, "quantity": "", "unit": ""})
            elif isinstance(item, dict):
                ingredient_name = str(item.get("name", "")).strip()
                if ingredient_name:
                    ingredients.append(
                        {
                            "name": ingredient_name,
                            "quantity": str(item.get("quantity", "") or ""),
                            "unit": str(item.get("unit", "") or ""),
                        }
                    )

    cook_time = raw.get("cook_time_minutes")
    try:
        cook_time_minutes = int(cook_time) if cook_time is not None else None
    except (TypeError, ValueError):
        cook_time_minutes = None

    return {
        "name": name,
        "meal_type": meal_type,
        "ingredients": ingredients,
        "instructions": str(raw.get("instructions", "") or ""),
        "cook_time_minutes": cook_time_minutes,
    }


def _format_age(months: int | None) -> str:
    if months is None or months < 0:
        return "年齢未設定"
    years, rest = divmod(months, 12)
    return f"{years}歳{rest}か月"


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
