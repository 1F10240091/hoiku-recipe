"""menu_generator サービスの単体テスト。"""

from app.models import Recipe
from app.services.menu_generator import _matches_ingredient, _recipe_has_allergen, _shared_names


def _recipe(name: str, ingredients: list[dict]) -> Recipe:
    return Recipe(name=name, meal_type="main", ingredients=ingredients)


def test_matches_ingredient_synonyms():
    # 表記ゆれ（ひらがな⇔漢字⇔カタカナ）が一致する
    assert _matches_ingredient("さけ", "鮭の塩焼き")
    assert _matches_ingredient("卵", "だし巻き玉子")
    assert _matches_ingredient("大豆", "肉じゃが（みそ風味）")
    assert _matches_ingredient("牛乳", "バター炒め")
    # 一致しない場合
    assert not _matches_ingredient("卵", "鶏肉の唐揚げ")
    assert not _matches_ingredient("そば", "うどん")


def test_recipe_has_allergen():
    recipe = _recipe("オムライス", [{"name": "卵"}, {"name": "ケチャップ"}])
    assert _recipe_has_allergen(recipe, ["卵"])
    assert not _recipe_has_allergen(recipe, ["大豆"])

    safe = _recipe("肉じゃが", [{"name": "牛肉"}, {"name": "じゃがいも"}])
    assert not _recipe_has_allergen(safe, ["卵", "乳"])


def test_shared_names_ignores_basics():
    assert _shared_names(["カレーライス"], ["カレーライス"])
    # 基本の主食・汁物は重複判定の対象外
    assert not _shared_names(["ごはん"], ["ごはん"])
    assert not _shared_names(["みそ汁"], ["みそ汁"])
    assert not _shared_names(["カレーライス", "ごはん"], ["ハンバーグ", "ごはん"])
