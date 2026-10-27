"""レシピマスタのシード投入。"""

from sqlalchemy.orm import Session

from app.models import Recipe
from app.services.seed_data import RETIRED_RECIPE_NAMES, SEED_RECIPES


# 旧データでは出典をレシピ名に付けていた。既存行を改名してIDを保ち、
# いいね・献立などの関連データを引き継ぐ。
LEGACY_SOURCE_SUFFIXES = {
    "千葉市 保育所のおすすめ副菜レシピ": "（千葉市保育所）",
    "千葉市 保育所の副菜レシピ": "（千葉市保育所）",
    "松阪市保育園給食レシピ集": "（松阪市保育園）",
    "板橋区立保育園給食レシピ": "（板橋区立保育園）",
    "新座市立栄保育園 給食人気メニュー": "（新座市立栄保育園）",
}


def seed_recipes(db: Session) -> int:
    """運営レシピを更新し、未整備の旧テンプレートを非公開にする。"""
    existing = {r.name: r for r in db.query(Recipe).all()}
    for name in RETIRED_RECIPE_NAMES:
        recipe = existing.get(name)
        if recipe is not None and recipe.owner_id is None:
            recipe.is_public = False
            recipe.is_official = False
    added = 0
    for data in SEED_RECIPES:
        recipe = existing.get(data["name"])
        suffix = LEGACY_SOURCE_SUFFIXES.get(data.get("source_name"))
        legacy_name = f"{data['name']}{suffix}" if suffix else None
        legacy_recipe = existing.get(legacy_name) if legacy_name else None
        if recipe is None and legacy_recipe is not None and legacy_recipe.owner_id is None:
            legacy_recipe.name = data["name"]
            existing.pop(legacy_name, None)
            existing[data["name"]] = legacy_recipe
            recipe = legacy_recipe
        elif recipe is not None and legacy_recipe is not None and legacy_recipe.owner_id is None:
            # すでに同名行がある場合は旧シードを一覧から外し、重複を避ける。
            legacy_recipe.is_public = False
            legacy_recipe.is_official = False
        if recipe is not None:
            if recipe.owner_id is not None:
                continue
            recipe.meal_type = data["meal_type"]
            recipe.ingredients = data["ingredients"]
            recipe.instructions = data["instructions"]
            recipe.cook_time_minutes = data["cook_time_minutes"]
            recipe.cuisine = data.get("cuisine", "和")
            recipe.age_min_months = data.get("age_min_months", 12)
            recipe.age_max_months = data.get("age_max_months", 72)
            recipe.source_name = data.get("source_name")
            recipe.source_url = data.get("source_url")
            recipe.servings_note = data.get("servings_note")
            recipe.child_notes = data.get("child_notes")
            recipe.is_official = bool(recipe.source_url)
            recipe.is_public = True
            continue
        recipe = Recipe(
            name=data["name"],
            meal_type=data["meal_type"],
            ingredients=data["ingredients"],
            instructions=data["instructions"],
            cook_time_minutes=data["cook_time_minutes"],
            cuisine=data.get("cuisine", "和"),
            age_min_months=data.get("age_min_months", 12),
            age_max_months=data.get("age_max_months", 72),
            source_name=data.get("source_name"),
            source_url=data.get("source_url"),
            servings_note=data.get("servings_note"),
            child_notes=data.get("child_notes"),
            is_official=bool(data.get("source_url")),
            is_public=True,
        )
        db.add(recipe)
        existing[data["name"]] = recipe
        added += 1
    db.commit()
    return added
