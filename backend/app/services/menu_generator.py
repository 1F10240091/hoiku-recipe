"""登録済みレシピから献立を選定するサービス。

レシピマスタ（DB）に登録された料理から、保育園の昼食・冷蔵庫の在庫・
アレルギー・好き嫌い・前日の夕食を考慮した夕食献立を選定する。

AIで新規レシピを生成せず、DB内の全候補を条件判定・スコアリングする。
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
import unicodedata

from app.models import Recipe
from app.services.allergens import ALLERGEN_CATALOG, canonical_allergen


@dataclass
class GeneratedMenu:
    """1 日分の生成献立。"""

    date: date
    menu_text: str
    dishes: list[str]
    recipe_ids: list[str]
    engine: str = "rule_based"


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

# Keep display, registration and ingredient spellings aligned for all standard items.
for _item in ALLERGEN_CATALOG["items"]:
    _aliases = [_item["name"], _item["label"], *_item["aliases"]]
    for _key, _values in list(_SYNONYMS.items()):
        if canonical_allergen(_key) == _item["name"]:
            _aliases.extend(_values)
    _SYNONYMS[_item["name"]] = list(dict.fromkeys(_aliases))


def _matches_ingredient(ingredient: str, target: str) -> bool:
    """食材名（表記ゆれ対応）が対象文字列に含まれるか判定する。"""
    normalize = lambda value: unicodedata.normalize("NFKC", value).strip().casefold()
    ingredient, target = normalize(ingredient), normalize(target)
    if not ingredient:
        return False
    aliases = next((values for key, values in _SYNONYMS.items()
                    if ingredient == normalize(key) or ingredient in [normalize(v) for v in values]), [ingredient])
    return any(normalize(alias) in target for alias in aliases)


def _recipe_has_allergen(recipe: Recipe, allergens: list[str]) -> bool:
    """レシピの使用食品にアレルゲンが含まれるか判定する。"""
    if not allergens:
        return False
    recipe_ingredients = " ".join(" ".join([str(i.get("name", "")), *[str(component) for component in i.get("components", [])]]) for i in recipe.ingredients)
    return any(_matches_ingredient(a, recipe_ingredients) for a in allergens)


def _shared_names(a: list[str], b: list[str]) -> bool:
    """2つの献立に同じ料理が含まれているか判定する。"""
    basics = {"ごはん", "白ごはん", "みそ汁"}
    sa = set(a) - basics
    sb = set(b) - basics
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
    inventory = inventory or []
    recipe_list = recipes if recipes is not None else []

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
        child_age_months=child_age_months,
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
    child_age_months: int | None = None,
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

    age_eligible = [
        r for r in recipes
        if child_age_months is None
        or getattr(r, "age_min_months", 12) <= child_age_months <= getattr(r, "age_max_months", 72)
    ]
    mains = [r for r in age_eligible if r.meal_type == "main" and not _recipe_has_allergen(r, allergens)]
    soups = [r for r in age_eligible if r.meal_type == "soup" and not _recipe_has_allergen(r, allergens)]
    sides = [r for r in age_eligible if r.meal_type == "side" and not _recipe_has_allergen(r, allergens)]
    staples = [r for r in age_eligible if r.meal_type == "staple" and not _recipe_has_allergen(r, allergens)]

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
    for _, main in scored_mains:
        if _shared_names([main.name], yesterday_dishes):
            continue
        if any(_shared_names([main.name], [prev[0].name]) for prev in selected):
            continue
        combo = [main]
        cuisine = getattr(main, "cuisine", "和") or "和"
        same_soup = [s for s in soups if (getattr(s, "cuisine", "和") or "和") == cuisine]
        soup_options = same_soup or soups
        soup = next((s for s in soup_options if not _shared_names([main.name], [s.name])), None)
        if soup:
            combo.append(soup)
        same_sides = [s for s in sides if (getattr(s, "cuisine", "和") or "和") == cuisine]
        side_options = same_sides or sides
        if side_options:
            scored_sides = sorted(side_options, key=lambda s: -_uses_inventory(s))
            combo.append(scored_sides[len(selected) % len(scored_sides)])
        same_staples = [s for s in staples if (getattr(s, "cuisine", "和") or "和") == cuisine]
        staple_options = same_staples or staples
        staple = next((s for s in staple_options if s.name != main.name), None)
        if staple:
            combo.append(staple)
        selected.append(combo)

    if not selected:
        # すべての主菜が使えない場合は、アレルゲン判定済みの最小構成で代替
        fallback = [r for r in age_eligible if not _recipe_has_allergen(r, allergens)]
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
