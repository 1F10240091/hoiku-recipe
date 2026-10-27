"""Regression tests for production blockers discovered during product review."""
import uuid
from datetime import date
from types import SimpleNamespace
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import Settings
from app.database import SessionLocal
from app.models import Recipe, RecipeLike, SuggestedMeal
from app.services.menu_generator import _matches_ingredient
from app.services.shopping_list import build_shopping_list
from app.services.ocr_ai import parse_menus_json


def other_client():
    client = TestClient(app)
    result = client.post("/api/v1/auth/register", json={"username": uuid.uuid4().hex[:20], "password": "product123"})
    client.headers["Authorization"] = "Bearer " + result.json()["access_token"]
    return client


def recipe(client, **overrides):
    data = {"name": "check-" + uuid.uuid4().hex[:12], "ingredients": [{"name": "private-ingredient-" + uuid.uuid4().hex[:8], "quantity": "80", "unit": "g"}], "instructions": "Cook thoroughly."}
    data.update(overrides)
    result = client.post("/api/v1/recipe-master", json=data)
    assert result.status_code == 201, result.text
    return result.json()


def test_private_recipe_ingredients_are_not_disclosed(auth_client):
    own = recipe(auth_client)
    stranger = other_client()
    ingredient = own["ingredients"][0]["name"]
    assert ingredient in auth_client.get("/api/v1/recipe-master/ingredients").json()
    assert ingredient not in stranger.get("/api/v1/recipe-master/ingredients").json()
    assert stranger.get("/api/v1/recipe-master/" + own["id"]).status_code == 404
    child = stranger.post("/api/v1/children", json={"name": "test"}).json()
    assert stranger.post(f"/api/v1/children/{child['id']}/allergies", json={"ingredient": ingredient}).status_code == 201


def test_delete_recipe_cleans_foreign_keys(auth_client):
    own = recipe(auth_client)
    assert auth_client.post(f"/api/v1/recipe-master/{own['id']}/favorite").status_code == 200
    with SessionLocal() as db:
        stored = db.query(Recipe).filter_by(id=own['id']).one()
        meal = SuggestedMeal(user_id=stored.owner_id, date=date(2026,12,5), menu_text="test", ingredients={"recipe_ids": [own['id']]})
        db.add(meal)
        db.flush()
        db.add(RecipeLike(user_id=stored.owner_id, meal_id=meal.id, recipe_id=own['id']))
        db.commit()
    assert auth_client.delete(f"/api/v1/recipe-master/{own['id']}").status_code == 204
    assert auth_client.get("/api/v1/recipe-master/favorites").json() == []


def test_regeneration_replaces_days_instead_of_duplicating(auth_client):
    child = auth_client.post("/api/v1/children", json={"name": "test"}).json()
    payload = {"child_id": child["id"], "menu_date": "2026-12-05", "days": 3}
    first = auth_client.post("/api/v1/recipes/generate", json=payload)
    second = auth_client.post("/api/v1/recipes/generate", json=payload)
    assert first.status_code == second.status_code == 201
    assert [m['id'] for m in first.json()['meals']] == [m['id'] for m in second.json()['meals']]
    assert len(auth_client.get("/api/v1/recipes").json()) == 3


@pytest.mark.parametrize('allergy,target', [('鮭','サーモン'), ('たまご','卵'), ('乳','チーズ'), ('ピーナッツ','落花生'), ('ゴマ','ごま油')])
def test_allergen_aliases_work_in_both_directions(allergy, target):
    assert _matches_ingredient(allergy, target)


def test_shopping_quantities_include_every_meal_and_keep_units():
    recipes = {'a': SimpleNamespace(name='A', ingredients=[{'name':'にんじん','quantity':'80','unit':'g'}]), 'b': SimpleNamespace(name='B',ingredients=[{'name':'にんじん','quantity':'0.5','unit':'本'}])}
    items = build_shopping_list(recipe_ids=['a','a','b'], recipes_by_id=recipes, inventory=[])
    assert {(i.quantity, i.unit) for i in items} == {('160','g'),('0.5','本')}


def test_ocr_does_not_save_unknown_date_as_today():
    assert parse_menus_json('{"menus":[{"date":null,"dishes":["ごはん"]}]}') == []
    assert parse_menus_json('{"menus":[{"date":"2026-02-31","dishes":["ごはん"]}]}') == []


def test_bcrypt_does_not_silently_truncate_passwords(client):
    result = client.post('/api/v1/auth/register', json={'username':'long-password-check','password':'a1' + 'あ'*25})
    assert result.status_code == 422


def test_untrusted_forwarded_header_cannot_reset_rate_limit():
    from test_security import _limited_app
    client = _limited_app(max_requests=1, fail=True)
    assert client.post('/api/v1/auth/login',headers={'x-forwarded-for':'1.1.1.1'}).status_code == 401
    assert client.post('/api/v1/auth/login',headers={'x-forwarded-for':'2.2.2.2'}).status_code == 429


@pytest.mark.parametrize('overrides', [ {'jwt_secret_key':'short'}, {'database_url':'sqlite:///bad.db'}, {'cors_origins':['http://app.example.com']}, {'rate_limit_enabled':False} ])
def test_production_rejects_unsafe_configuration(overrides):
    data = dict(environment='production', jwt_secret_key='7b32a192e44c4a02999ef2f678e74e2a',database_url='postgresql+psycopg://user:password@localhost/hoiku',cors_origins=['https://app.example.com'],rate_limit_enabled=True)
    data.update(overrides)
    with pytest.raises(ValueError):
        Settings(_env_file=None, **data)


def test_shared_rate_limit_is_atomic_across_requests():
    from app.database import engine
    from app.services.rate_limit import consume_budget
    if engine.dialect.name != "postgresql":
        pytest.skip("Production PostgreSQL only")
    from concurrent.futures import ThreadPoolExecutor
    key = uuid.uuid4().hex
    with ThreadPoolExecutor(max_workers=8) as executor:
        allowed = list(executor.map(lambda _: consume_budget(key, "/login", "test-secret", 5, 60), range(12)))
    assert sum(allowed) == 5
    assert consume_budget(key + "other", "/login", "test-secret", 5, 60)


def test_health_checks_database(client):
    assert client.get("/health").status_code == 200


def test_recipe_invalid_month_range_rejected(auth_client):
    own = recipe(auth_client)
    assert auth_client.put('/api/v1/recipe-master/' + own['id'], json={'age_min_months': 100}).status_code == 422
    assert auth_client.get('/api/v1/recipe-master/' + own['id']).json()['age_min_months'] == 12


def test_rename_recipe_collision_is_a_conflict(auth_client):
    first, second = recipe(auth_client), recipe(auth_client)
    response = auth_client.put('/api/v1/recipe-master/' + second['id'], json={'name': first['name']})
    assert response.status_code == 409
    assert auth_client.get('/api/v1/recipe-master/' + second['id']).json()['name'] == second['name']
