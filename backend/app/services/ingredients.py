"""レシピで使われている食材のユーティリティ。"""

from sqlalchemy.orm import Session

from app.models import Recipe


def list_recipe_ingredient_names(db: Session) -> list[str]:
    """レシピマスタで使われている食材名を重複なく返す。"""
    names: set[str] = set()
    for recipe in db.query(Recipe).all():
        for item in recipe.ingredients or []:
            name = str(item.get("name", "")).strip()
            if name:
                names.add(name)
    return sorted(names)


def is_recipe_ingredient(db: Session, name: str) -> bool:
    """指定した食材名がレシピで使われているか判定する。"""
    return name.strip() in set(list_recipe_ingredient_names(db))
