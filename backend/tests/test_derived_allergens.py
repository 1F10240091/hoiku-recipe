"""Derived food names are checked independently of writing style."""
import pytest
from app.models import Recipe
from app.services.menu_generator import _matches_ingredient, _recipe_has_allergen


@pytest.mark.parametrize('food', ['うどん','ウドン','ｳﾄﾞﾝ','冷凍ウドン','パスタ','食パン','スパゲティ','スパゲッティ','そうめん','パン粉'])
def test_wheat_matches_derived_food_spellings(food):
    assert _matches_ingredient('小麦', food)
    assert _recipe_has_allergen(Recipe(name='test',ingredients=[{'name':food}]),['小麦'])


@pytest.mark.parametrize('food', ['ごはん','にんじん','米粉','じゃがいも'])
def test_unrelated_food_names_do_not_match_wheat(food):
    assert not _matches_ingredient('小麦', food)


def test_custom_udon_exclusion_does_not_become_a_wheat_diagnosis():
    assert _matches_ingredient('うどん','ウドン')
    assert not _matches_ingredient('うどん','パン')


def test_declared_components_remain_checked_for_unknown_products():
    recipe = Recipe(name='test',ingredients=[{'name':'独自のソース','components':['小麦']}])
    assert _recipe_has_allergen(recipe,['小麦'])


def test_wheat_profile_excludes_katakana_udon_from_generated_menu(auth_client):
    response = auth_client.post('/api/v1/children',json={'name':'test','allergies':[{'ingredient':'小麦'}]})
    assert response.status_code == 201
    child = response.json()
    recipe = auth_client.post('/api/v1/recipe-master',json={'name':'derived-udon-regression','meal_type':'main','ingredients':[{'name':'ウドン','quantity':'100','unit':'g'}]})
    assert recipe.status_code == 201
    auth_client.post('/api/v1/shopping/inventory',json={'name':'ウドン'})
    result=auth_client.post('/api/v1/recipes/generate',json={'child_id':child['id'],'menu_date':'2026-11-01','days':7})
    assert result.status_code == 201
    used={recipe_id for meal in result.json()['meals'] for recipe_id in meal['ingredients']['recipe_ids']}
    assert recipe.json()['id'] not in used
    master={recipe['id']:recipe for recipe in auth_client.get('/api/v1/recipe-master').json()}
    for recipe_id in used:
        assert not _recipe_has_allergen(Recipe(name=master[recipe_id]['name'],ingredients=master[recipe_id]['ingredients']),['小麦'])


@pytest.mark.parametrize('registered', ['小麦粉','薄力粉','強力粉'])
def test_existing_flour_allergies_also_exclude_udon(registered):
    assert _matches_ingredient(registered,'ウドン')
    assert _matches_ingredient(registered,'食パン')
    assert _matches_ingredient(registered,'パスタ')


def test_new_flour_registration_uses_wheat_category(auth_client):
    child=auth_client.post('/api/v1/children',json={'name':'test'}).json()
    url='/api/v1/children/'+child['id']+'/allergies'
    result=auth_client.post(url,json={'ingredient':'小麦粉'})
    assert result.status_code == 201
    assert result.json()['allergies'][0]['ingredient']=='小麦'
    assert len(auth_client.post(url,json={'ingredient':'小麦'}).json()['allergies'])==1
