"""AI が考案した献立をレシピ一覧へ登録する処理のテスト。"""

import uuid
from datetime import date

import app.routers.recipes as recipes_router
from app.services.menu_generator import (
    GeneratedMenu,
    _format_age,
    _normalize_dish_detail,
)


def _create_child(client) -> str:
    res = client.post(
        "/api/v1/children",
        json={"name": "AIテスト児", "birth_date": "2022-06-01", "allergies": [], "preferences": []},
    )
    assert res.status_code == 201, res.text
    return res.json()["id"]


def test_format_age():
    assert _format_age(50) == "4歳2か月"
    assert _format_age(12) == "1歳0か月"
    assert _format_age(None) == "年齢未設定"


def test_normalize_dish_detail_accepts_string_and_dict():
    assert _normalize_dish_detail("焼き鮭") == {
        "name": "焼き鮭",
        "meal_type": "main",
        "ingredients": [],
        "instructions": "",
        "cook_time_minutes": None,
    }

    detail = _normalize_dish_detail(
        {
            "name": "野菜スープ",
            "meal_type": "soup",
            "ingredients": [{"name": "にんじん", "quantity": "30", "unit": "g"}, "玉ねぎ"],
            "instructions": "煮る。",
            "cook_time_minutes": "15",
        }
    )
    assert detail is not None
    assert detail["name"] == "野菜スープ"
    assert detail["meal_type"] == "soup"
    assert detail["cook_time_minutes"] == 15
    assert detail["ingredients"][0] == {"name": "にんじん", "quantity": "30", "unit": "g"}
    assert detail["ingredients"][1] == {"name": "玉ねぎ", "quantity": "", "unit": ""}


def test_generate_registers_ai_dishes_in_recipe_master(auth_client, monkeypatch):
    suffix = uuid.uuid4().hex[:6]
    main_name = f"AI鮭の焼き物{suffix}"
    soup_name = f"AI野菜スープ{suffix}"

    def fake_generate(**_kwargs):
        return [
            GeneratedMenu(
                date=date(2026, 12, 1),
                menu_text=f"AIテスト児 さんの夕食（2026-12-01）\n{main_name}・{soup_name}",
                dishes=[main_name, soup_name],
                engine="mimo_freeform",
                recipe_ids=[],
                dish_details=[
                    {
                        "name": main_name,
                        "meal_type": "main",
                        "ingredients": [{"name": "鮭", "quantity": "80", "unit": "g"}],
                        "instructions": "焼く。",
                        "cook_time_minutes": 15,
                    },
                    {
                        "name": soup_name,
                        "meal_type": "soup",
                        "ingredients": [{"name": "にんじん", "quantity": "30", "unit": "g"}],
                        "instructions": "煮る。",
                        "cook_time_minutes": 10,
                    },
                ],
            )
        ]

    monkeypatch.setattr(recipes_router, "generate_menus", fake_generate)

    child_id = _create_child(auth_client)
    res = auth_client.post(
        "/api/v1/recipes/generate",
        json={"child_id": child_id, "menu_date": "2026-12-01", "days": 1},
    )
    assert res.status_code == 201, res.text
    meal = res.json()["meals"][0]
    recipe_ids = meal["ingredients"]["recipe_ids"]
    assert len(recipe_ids) == 2

    # レシピ一覧に登録され、材料も保存されている
    res = auth_client.get("/api/v1/recipe-master/search", params={"keyword": suffix})
    assert res.status_code == 200
    body = res.json()
    assert body["total"] == 2
    names = {r["name"] for r in body["recipes"]}
    assert names == {main_name, soup_name}
    main = next(r for r in body["recipes"] if r["name"] == main_name)
    assert main["meal_type"] == "main"
    assert main["ingredients"][0]["name"] == "鮭"
    assert main["cook_time_minutes"] == 15

    # もう一度生成しても同じレシピを再利用し、重複登録しない
    res = auth_client.post(
        "/api/v1/recipes/generate",
        json={"child_id": child_id, "menu_date": "2026-12-01", "days": 1},
    )
    assert res.status_code == 201
    assert res.json()["meals"][0]["ingredients"]["recipe_ids"] == recipe_ids

    res = auth_client.get("/api/v1/recipe-master/search", params={"keyword": suffix})
    assert res.json()["total"] == 2
