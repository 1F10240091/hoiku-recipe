"""レシピマスタのシード投入。"""

from sqlalchemy.orm import Session

from app.models import Recipe
from app.services.seed_data import SEED_RECIPES


def seed_recipes(db: Session) -> int:
    """既存のレシピを壊さず、未登録のレシピだけを追加する。"""
    existing = {r.name: r for r in db.query(Recipe).all()}
    added = 0
    for data in SEED_RECIPES:
        recipe = existing.get(data["name"])
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
