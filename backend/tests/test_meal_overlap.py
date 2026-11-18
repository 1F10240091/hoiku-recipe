from datetime import date
from types import SimpleNamespace

from app.services.meal_overlap import ingredient_groups, main_groups
from app.services.menu_generator import generate_menus


def recipe(name, ingredient):
    return SimpleNamespace(id=name, name=name, meal_type="main", cuisine="和",
                           ingredients=[{"name": ingredient}])


def generate(recipes, **kwargs):
    return generate_menus(child_name="test", start_date=date(2026, 11, 18),
                          days=1, allergies=[], preferences=[], nursery_menus=[],
                          recipes=recipes, **kwargs)


def test_basics_and_seasonings_do_not_penalize():
    assert not ingredient_groups("ごはん 米 大豆 しょうゆ みそ にんじん")
    assert main_groups(recipe("鶏のつくね", "卵")) == {"chicken"}


def test_same_main_ingredient_loses_to_other_even_with_inventory():
    chicken = recipe("鶏の照り焼き", "鶏肉")
    pork = recipe("豚の生姜焼き", "豚肉")
    result = generate([chicken, pork], inventory=["鶏肉"],
                      nursery_menus_by_date={date(2026, 11, 18): "鶏の唐揚げ・ごはん"})
    assert result[0].recipe_ids == [pork.id]


def test_overlap_is_not_a_hard_exclusion():
    chicken = recipe("鶏の照り焼き", "鶏肉")
    result = generate([chicken], nursery_menus_by_date={date(2026, 11, 18): "鶏の唐揚げ"})
    assert result[0].recipe_ids == [chicken.id]


def test_other_dates_do_not_affect_today():
    chicken = recipe("鶏の照り焼き", "鶏肉")
    pork = recipe("豚の生姜焼き", "豚肉")
    result = generate([chicken, pork], nursery_menus_by_date={date(2026, 11, 19): "鶏の唐揚げ"})
    assert result[0].recipe_ids == [chicken.id]


def test_allergy_exclusion_wins_over_variety():
    chicken = recipe("鶏の照り焼き", "鶏肉")
    egg = recipe("卵焼き", "卵")
    result = generate_menus(child_name="test", start_date=date(2026, 11, 18),
                            days=1, allergies=["卵"], preferences=[],
                            nursery_menus=[], recipes=[egg, chicken],
                            nursery_menus_by_date={date(2026, 11, 18): "鶏の唐揚げ"})
    assert result[0].recipe_ids == [chicken.id]
