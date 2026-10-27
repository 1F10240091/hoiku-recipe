"""Official list integrity, alias compatibility, persistence and ownership."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.allergens import ALLERGEN_CATALOG, canonical_allergen
from app.services.menu_generator import _recipe_has_allergen
from app.models import Recipe


def test_master_has_current_29_items():
    items = ALLERGEN_CATALOG['items']
    assert len(items) == len({item['name'] for item in items}) == 29
    assert sum(item['group']=='required' for item in items) == 9
    assert sum(item['group']=='recommended' for item in items) == 20
    required = {item['name'] for item in items if item['group']=='required'}
    assert required == {'えび','カシューナッツ','かに','くるみ','小麦','そば','卵','乳','落花生'}
    assert 'ピスタチオ' in {item['name'] for item in items}
    assert 'まつたけ' not in {item['name'] for item in items}


def test_catalog_requires_authentication(client):
    assert client.get('/api/v1/recipe-master/allergens').status_code == 401


def test_all_29_can_be_saved_and_removed_for_one_child(auth_client):
    catalog = auth_client.get('/api/v1/recipe-master/allergens')
    assert catalog.status_code == 200
    items = catalog.json()['items']
    child = auth_client.post('/api/v1/children',json={'name':'catalog-test'}).json()
    url = '/api/v1/children/'+child['id']+'/allergies'
    for item in items:
        result = auth_client.post(url,json={'ingredient':item['name']})
        assert result.status_code == 201, result.text
    saved = auth_client.get('/api/v1/children/'+child['id']).json()['allergies']
    assert {a['ingredient'] for a in saved} == {item['name'] for item in items}
    assert len(saved) == 29
    for item in saved:
        result = auth_client.delete(url+'/'+item['id'])
        assert result.status_code == 200
    assert result.json()['allergies'] == []


@pytest.mark.parametrize('item', ALLERGEN_CATALOG['items'], ids=lambda item: item['name'])
def test_standard_and_declared_aliases_are_filtered(item):
    for alias in [item['name'], *item['aliases']]:
        recipe = Recipe(name='test', ingredients=[{'name':'加工品', 'components':[alias]}])
        assert _recipe_has_allergen(recipe,[item['name']])


def test_known_alias_does_not_duplicate_existing_choice(auth_client):
    child = auth_client.post('/api/v1/children',json={'name':'test'}).json()
    url = '/api/v1/children/'+child['id']+'/allergies'
    for name in ['牛乳','乳','乳成分']:
        response = auth_client.post(url,json={'ingredient':name})
        assert response.status_code == 201
        assert len(response.json()['allergies']) == 1
        assert response.json()['allergies'][0]['ingredient'] == '乳'
    assert canonical_allergen('未知の食材') == '未知の食材'


def test_initial_child_allergies_deduplicate_aliases(auth_client):
    response=auth_client.post('/api/v1/children',json={'name':'test','allergies':[{'ingredient':'落花生'},{'ingredient':'ピーナッツ'}]})
    assert response.status_code == 201
    assert [a['ingredient'] for a in response.json()['allergies']] == ['落花生']


def test_cannot_change_other_users_standard_selection(auth_client, client):
    child = auth_client.post('/api/v1/children',json={'name':'private','allergies':[{'ingredient':'卵'}]}).json()
    other = TestClient(app)
    import uuid
    result=other.post('/api/v1/auth/register',json={'username':uuid.uuid4().hex[:20],'password':'test1234'})
    other.headers['Authorization']='Bearer '+result.json()['access_token']
    url='/api/v1/children/'+child['id']+'/allergies'
    assert other.post(url,json={'ingredient':'小麦'}).status_code == 404
    assert other.delete(url+'/'+child['allergies'][0]['id']).status_code == 404
    assert len(auth_client.get('/api/v1/children/'+child['id']).json()['allergies']) == 1
