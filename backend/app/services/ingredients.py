"""レシピで使われている食材のユーティリティ。"""

from sqlalchemy.orm import Session

from app.models import Recipe
from app.services.allergens import ALLERGEN_CATALOG


def list_recipe_ingredient_names(db: Session, user_id: str | None = None, *, include_standard: bool = True) -> list[str]:
    """レシピマスタで使われている食材名を重複なく返す。"""
    names: set[str] = {item["name"] for item in ALLERGEN_CATALOG["items"]} if include_standard else set()
    query = db.query(Recipe)
    if user_id is not None:
        query = query.filter(Recipe.is_official.is_(True) | Recipe.is_public.is_(True) | (Recipe.owner_id == user_id))
    else:
        query = query.filter(Recipe.is_official.is_(True) | Recipe.is_public.is_(True))
    for recipe in query.all():
        for item in recipe.ingredients or []:
            name = str(item.get("name", "")).strip()
            if name:
                names.add(name)
    return sorted(names)


def is_recipe_ingredient(db: Session, name: str, user_id: str | None = None) -> bool:
    """指定した食材名がレシピで使われているか判定する。"""
    return name.strip() in set(list_recipe_ingredient_names(db, user_id))
