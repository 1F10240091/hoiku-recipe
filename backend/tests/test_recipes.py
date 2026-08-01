"""レシピマスタ API のテスト。"""


def test_seed_recipes_loaded(auth_client):
    res = auth_client.get("/api/v1/recipe-master")
    assert res.status_code == 200
    assert len(res.json()) > 0
    names = {r["name"] for r in res.json()}
    assert "ごはん" in names
    assert "みそ汁" in names


def test_create_and_get_recipe(auth_client):
    res = auth_client.post(
        "/api/v1/recipe-master",
        json={
            "name": "テストカレー",
            "meal_type": "main",
            "ingredients": [{"name": "豚肉", "quantity": "150", "unit": "g"}],
            "instructions": "煮る。",
            "cook_time_minutes": 30,
        },
    )
    assert res.status_code == 201
    recipe_id = res.json()["id"]

    res = auth_client.get(f"/api/v1/recipe-master/{recipe_id}")
    assert res.status_code == 200
    assert res.json()["name"] == "テストカレー"


def test_duplicate_recipe_rejected(auth_client):
    auth_client.post("/api/v1/recipe-master", json={"name": "重複レシピ", "meal_type": "main"})
    res = auth_client.post("/api/v1/recipe-master", json={"name": "重複レシピ", "meal_type": "main"})
    assert res.status_code == 409
