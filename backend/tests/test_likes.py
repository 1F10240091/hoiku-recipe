"""「喜んでた」評価 API のテスト。"""


def _create_child(client) -> str:
    res = client.post(
        "/api/v1/children",
        json={"name": "テスト児", "birth_date": "2022-06-01", "allergies": [], "preferences": []},
    )
    assert res.status_code == 201, res.text
    return res.json()["id"]


def _generate_meal(client, child_id: str) -> dict:
    res = client.post(
        "/api/v1/recipes/generate",
        json={"child_id": child_id, "menu_date": "2026-11-01", "days": 1},
    )
    assert res.status_code == 201, res.text
    meals = res.json()["meals"]
    assert meals
    assert meals[0]["ingredients"]["recipe_ids"]
    return meals[0]


def test_toggle_like_and_count(auth_client):
    child_id = _create_child(auth_client)
    meal = _generate_meal(auth_client, child_id)
    recipe_id = meal["ingredients"]["recipe_ids"][0]

    res = auth_client.post(
        "/api/v1/likes/toggle",
        json={"meal_id": meal["id"], "recipe_id": recipe_id},
    )
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["liked"] is True
    assert body["liked_count"] == 1

    res = auth_client.get("/api/v1/likes")
    assert res.status_code == 200
    summary = res.json()
    assert {"meal_id": meal["id"], "recipe_id": recipe_id} in summary["liked"]
    assert summary["counts"][recipe_id] == 1

    # もう一度押すと取り消し
    res = auth_client.post(
        "/api/v1/likes/toggle",
        json={"meal_id": meal["id"], "recipe_id": recipe_id},
    )
    assert res.status_code == 200
    assert res.json()["liked"] is False
    assert res.json()["liked_count"] == 0


def test_like_unknown_meal_rejected(auth_client):
    res = auth_client.get("/api/v1/recipe-master")
    recipe_id = res.json()[0]["id"]

    res = auth_client.post(
        "/api/v1/likes/toggle",
        json={"meal_id": "no-such-meal", "recipe_id": recipe_id},
    )
    assert res.status_code == 404


def test_like_recipe_not_in_meal_rejected(auth_client):
    child_id = _create_child(auth_client)
    meal = _generate_meal(auth_client, child_id)
    used_ids = set(meal["ingredients"]["recipe_ids"])

    res = auth_client.get("/api/v1/recipe-master")
    unused = next(r for r in res.json() if r["id"] not in used_ids)

    res = auth_client.post(
        "/api/v1/likes/toggle",
        json={"meal_id": meal["id"], "recipe_id": unused["id"]},
    )
    assert res.status_code == 400


def test_search_sort_by_liked(auth_client):
    child_id = _create_child(auth_client)
    meal = _generate_meal(auth_client, child_id)
    recipe_ids = meal["ingredients"]["recipe_ids"]

    # 1 品だけ「喜んでた」を付ける
    res = auth_client.post(
        "/api/v1/likes/toggle",
        json={"meal_id": meal["id"], "recipe_id": recipe_ids[1]},
    )
    assert res.status_code == 200
    assert res.json()["liked_count"] == 1

    res = auth_client.get(
        "/api/v1/recipe-master/search", params={"sort": "liked", "per_page": 100}
    )
    assert res.status_code == 200
    recipes = res.json()["recipes"]
    assert recipes[0]["id"] == recipe_ids[1]
    assert recipes[0]["liked_count"] == 1

    # 名前順では liked_count が付与される
    res = auth_client.get("/api/v1/recipe-master/search", params={"per_page": 100})
    assert res.status_code == 200
    assert all("liked_count" in r for r in res.json()["recipes"])
