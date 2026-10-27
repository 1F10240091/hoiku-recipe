"""Versioned standard allergen catalog shared with the frontend."""
import json
from pathlib import Path
import unicodedata

ALLERGEN_CATALOG = json.loads((Path(__file__).resolve().parent.parent / "data" / "allergens.json").read_text(encoding="utf-8"))


def normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKC", value).strip().casefold()
    return "".join(chr(ord(c) - 0x60) if "ァ" <= c <= "ヶ" else c for c in normalized)


_ALIAS_TO_NAME = {normalize_text(alias): item["name"] for item in ALLERGEN_CATALOG["items"] for alias in [item["name"], item["label"], *item["aliases"]]}


def canonical_allergen(value: str) -> str:
    """Map known exact labels to their standard name; preserve custom allergens."""
    return _ALIAS_TO_NAME.get(normalize_text(value), value.strip())


INGREDIENT_RULES = json.loads((Path(__file__).resolve().parent.parent / "data" / "allergen-ingredients.json").read_text(encoding="utf-8"))
_MATCH_TERMS = {
    item["name"]: tuple(dict.fromkeys(normalize_text(term) for term in [
        item["name"], item["label"], *item["aliases"],
        *INGREDIENT_RULES["related_ingredients"].get(item["name"], []),
    ])) for item in ALLERGEN_CATALOG["items"]
}


def matches_allergen(ingredient: str, target: str) -> bool:
    """Match standard labels, related foods and kana variants conservatively.

    Custom foods stay specific: registering udon does not mean registering wheat.
    A missing match is not proof that a product is free of an allergen.
    """
    if not ingredient.strip():
        return False
    name = canonical_allergen(ingredient)
    terms = _MATCH_TERMS.get(name, (normalize_text(ingredient),))
    normalized_target = normalize_text(target)
    return any(term in normalized_target for term in terms)
