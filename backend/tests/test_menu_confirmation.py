from app.services import ocr_ai


def test_preview_does_not_save_and_confirm_can_delete_one_day(auth_client, monkeypatch):
    monkeypatch.setattr(ocr_ai, "is_available", lambda: True)
    monkeypatch.setattr(ocr_ai, "extract_entries", lambda **kw: [
        ocr_ai.AIMenuEntry("2026-11-18", "昼食", ["カレー"], ["豚肉"]),
        ocr_ai.AIMenuEntry("2026-11-19", "昼食", ["焼き魚"], ["鮭"]),
    ])
    before = auth_client.get("/api/v1/menus").json()
    preview = auth_client.post("/api/v1/menus/upload?preview=true", files={"file": ("menu.png", b"test", "image/png")})
    assert preview.status_code == 201
    assert auth_client.get("/api/v1/menus").json() == before
    drafts = preview.json()
    drafts[0]["dishes"] = ["ポークカレー"]
    saved = auth_client.post("/api/v1/menus/confirm", json={"entries": drafts})
    assert saved.status_code == 200
    rows = saved.json()
    assert rows[0]["ingredients"]["foods"] == ["豚肉"]
    assert "ポークカレー" in rows[0]["menu_text"]
    assert auth_client.delete("/api/v1/menus/" + rows[0]["id"]).status_code == 204
    assert auth_client.get("/api/v1/menus/" + rows[1]["id"]).status_code == 200


def test_confirmation_rejects_missing_date_and_empty_dishes(auth_client):
    assert auth_client.post("/api/v1/menus/confirm", json={"entries": [{"date": "", "dishes": ["ごはん"]}]}).status_code == 422
    assert auth_client.post("/api/v1/menus/confirm", json={"entries": [{"date": "2026-11-18", "dishes": [" "]}]}).status_code == 422


def test_material_reading_is_optional():
    entries = ocr_ai.parse_menus_json('{"menus":[{"date":"2026-11-18","dishes":["カレー"],"ingredients":["豚肉","米"]},{"date":"2026-11-19","dishes":["ごはん"]}]}')
    assert entries[0].ingredients == ["豚肉", "米"]
    assert entries[1].ingredients == []


def test_confirm_replaces_same_day_and_edit_keeps_foods(auth_client):
    draft = {"date": "2026-11-18", "dishes": ["ごはん"], "ingredients": ["米"]}
    first = auth_client.post("/api/v1/menus/confirm", json={"entries": [draft]}).json()[0]
    draft["dishes"] = ["おにぎり"]
    second = auth_client.post("/api/v1/menus/confirm", json={"entries": [draft]}).json()[0]
    assert first["id"] == second["id"]
    updated = auth_client.put("/api/v1/menus/" + first["id"], json={"date": draft["date"], "menu_text": "おにぎりと汁物"})
    assert updated.json()["ingredients"]["foods"] == ["米"]


def test_stock_is_shown_for_quantity_confirmation(auth_client):
    child = auth_client.post("/api/v1/children", json={"name": "test", "allergies": [], "preferences": []}).json()
    generated = auth_client.post("/api/v1/recipes/generate", json={"child_id": child["id"], "menu_date": "2026-11-18", "days": 1})
    assert generated.status_code == 201
    needed = auth_client.get("/api/v1/shopping/list").json()["items"][0]
    auth_client.post("/api/v1/shopping/inventory", json={"name": needed["name"], "quantity": "少し"})
    result = auth_client.get("/api/v1/shopping/list").json()
    assert needed["name"] not in [item["name"] for item in result["items"]]
    assert needed["name"] in [item["name"] for item in result["inventory_checks"]]
