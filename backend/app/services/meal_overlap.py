"""Conservative main-ingredient hints for variety, never allergy decisions."""

from app.services.ingredient_search import normalize


GROUPS = {
    "chicken": ("鶏", "とり肉", "とりにく", "チキン", "chicken"),
    "pork": ("豚", "ぶた", "ポーク", "pork"),
    "beef": ("牛肉", "牛ひき", "牛挽", "ビーフ", "beef"),
    "fish": ("鮭", "さけ", "しゃけ", "サーモン", "鯖", "さば", "鱈", "たら", "鯵", "あじ", "いわし", "ぶり", "まぐろ", "ツナ", "白身魚", "salmon", "mackerel"),
    "egg": ("卵", "玉子", "たまご", "オムレツ", "オムライス", "egg"),
    "tofu": ("豆腐", "とうふ", "厚揚げ", "納豆", "tofu"),
}


def ingredient_groups(text: str) -> set[str]:
    value = normalize(text)
    return {group for group, aliases in GROUPS.items() if any(normalize(alias) in value for alias in aliases)}


def main_groups(recipe) -> set[str]:
    # A named main ingredient takes priority over binders and seasonings.
    named = ingredient_groups(recipe.name)
    if named:
        return named
    for ingredient in recipe.ingredients:
        groups = ingredient_groups(ingredient.get("name", ""))
        if groups:
            return groups
    return set()


def lunch_groups(text: str, recipes: list) -> set[str]:
    groups = ingredient_groups(text)
    for recipe in recipes:
        if recipe.meal_type == "main" and normalize(recipe.name) in normalize(text):
            groups.update(main_groups(recipe))
    return groups
