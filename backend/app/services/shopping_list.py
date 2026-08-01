"""買い物リスト生成サービス。

献立に含まれるレシピの使用食品を集計し、冷蔵庫の在庫にある食材を
差し引いた不足食材リストを生成する。
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field


@dataclass
class ShoppingItem:
    """不足食材 1 件。"""

    name: str
    quantity: str = ""
    unit: str = ""
    needed: str = ""
    source_recipes: list[str] = field(default_factory=list)


def build_shopping_list(*, recipe_ids: list[str], recipes_by_id: dict[str, object], inventory: list[str]) -> list[ShoppingItem]:
    """指定されたレシピの食材から不足食材リストを生成する。

    Args:
        recipe_ids: 献立で使用するレシピ ID のリスト。
        recipes_by_id: レシピ ID をキーとするレシピの辞書。
        inventory: 冷蔵庫にある食材名のリスト。

    Returns:
        不足食材のリスト（在庫にある食材は除外済み）。
    """
    # レシピごとの食材を集計
    needed_by_name: dict[str, dict] = {}
    source_by_name: dict[str, list[str]] = defaultdict(list)

    for recipe_id in recipe_ids:
        recipe = recipes_by_id.get(recipe_id)
        if recipe is None:
            continue
        recipe_name = getattr(recipe, "name", "?")
        for ing in getattr(recipe, "ingredients", []):
            name = ing.get("name", "")
            if not name:
                continue
            if name not in needed_by_name:
                needed_by_name[name] = {"name": name, "quantity": ing.get("quantity", ""), "unit": ing.get("unit", "")}
            source_by_name[name].append(recipe_name)

    # 在庫にある食材を除外（表記ゆれ対応のため部分一致で判定）
    def in_inventory(name: str) -> bool:
        lowered = name.lower()
        return any(lowered in inv.lower() or inv.lower() in lowered for inv in inventory if inv)

    items: list[ShoppingItem] = []
    for name, info in needed_by_name.items():
        if in_inventory(name):
            continue
        qty = info["quantity"]
        unit = info["unit"]
        items.append(
            ShoppingItem(
                name=name,
                quantity=qty,
                unit=unit,
                needed=f"{qty} {unit}".strip(),
                source_recipes=list(dict.fromkeys(source_by_name[name])),
            )
        )
    items.sort(key=lambda it: it.name)
    return items
