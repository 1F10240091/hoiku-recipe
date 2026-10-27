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
