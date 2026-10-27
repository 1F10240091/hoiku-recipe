from app.services.menu_generator import _recipe_has_allergen
from app.models import Recipe


def test_declared_components_are_checked_for_allergies():
    recipe = Recipe(name="ソース料理", meal_type="main", ingredients=[{"name":"調味ソース", "components":["小麦", "大豆"]}])
    assert _recipe_has_allergen(recipe, ["小麦"])
    assert _recipe_has_allergen(recipe, ["大豆"])
    assert not _recipe_has_allergen(recipe, ["卵"])


def test_child_delete_removes_registered_details(auth_client):
    result = auth_client.post('/api/v1/children',json={'name':'test', 'birth_date':'2023-01-01', 'allergies':[{'ingredient':'アーモンド'}], 'preferences':[{'ingredient':'きのこ'}]})
    assert result.status_code == 201
    child = result.json()
    assert auth_client.delete('/api/v1/children/' + child['id']).status_code == 204
    assert auth_client.get('/api/v1/children/' + child['id']).status_code == 404
    assert auth_client.get('/api/v1/children').json() == []


def test_child_birth_month_can_be_cleared(auth_client):
    child = auth_client.post('/api/v1/children',json={'name':'test','birth_date':'2023-01-01'}).json()
    updated = auth_client.put('/api/v1/children/' + child['id'],json={'name':'corrected','birth_date':None})
    assert updated.status_code == 200
    assert updated.json()['birth_date'] is None
    assert updated.json()['name'] == 'corrected'


def test_allergy_rejects_empty_but_accepts_custom_name(auth_client):
    child = auth_client.post('/api/v1/children',json={'name':'test'}).json()
    url = '/api/v1/children/' + child['id'] + '/allergies'
    assert auth_client.post(url,json={'ingredient':'   '}).status_code == 422
    response = auth_client.post(url,json={'ingredient':'  カシューナッツ  '})
    assert response.status_code == 201
    assert response.json()['allergies'][0]['ingredient'] == 'カシューナッツ'
    assert len(auth_client.post(url,json={'ingredient':'カシューナッツ'}).json()['allergies']) == 1


def test_recipe_components_persist(auth_client):
    response = auth_client.post('/api/v1/recipe-master',json={'name':'component-check','ingredients':[{'name':'ソース','components':['小麦','大豆']}]})
    assert response.status_code == 201
    result = auth_client.get('/api/v1/recipe-master/' + response.json()['id'])
    assert result.json()['ingredients'][0]['components'] == ['小麦','大豆']


def test_full_ingredient_browser_contains_only_visible_recipe_ingredients(auth_client):
    recipe = auth_client.post('/api/v1/recipe-master', json={
        'name': 'all-ingredients-browser-test',
        'ingredients': [{'name': '一覧専用の食材'}, {'name': '一覧専用の別食材'}],
    })
    assert recipe.status_code == 201
    recipes = auth_client.get('/api/v1/recipe-master').json()
    expected = {ingredient['name'] for recipe in recipes for ingredient in recipe['ingredients']}
    response = auth_client.get('/api/v1/recipe-master/ingredients', params={'recipe_only': True})
    assert response.status_code == 200
    assert set(response.json()) == expected
    assert len(response.json()) == len(expected)
