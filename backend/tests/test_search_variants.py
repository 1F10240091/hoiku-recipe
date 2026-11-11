import pytest
from app.services.ingredient_search import keyword_matches, match_score


@pytest.mark.parametrize("query,text", [
    ("からあげ", "鶏の唐揚げ"), ("CHICKEN", "鶏肉の照り焼き"),
    ("ﾆﾝｼﾞﾝ", "人参サラダ"), ("たまねぎ", "玉葱スープ"),
    ("teriyaki", "鶏の照り焼き"), ("curry", "カレーライス"),
    ("鶏", "chicken soup"),
])
def test_keyword_variants(query, text):
    assert keyword_matches(query, text)


def test_literal_wildcards():
    assert not keyword_matches("%", "カレー")
    assert not keyword_matches("_", "カレー")


def test_english_ingredient():
    assert match_score("onion", "玉ねぎ") is not None


def test_search_api_variants(auth_client):
    for keyword in ["からあげ", "chicken", "ﾆﾝｼﾞﾝ"]:
        response = auth_client.get("/api/v1/recipe-master/search", params={"keyword": keyword})
        assert response.status_code == 200
        assert response.json()["total"] > 0


@pytest.mark.parametrize("katakana,japanese,english", [
    ("オニオン", "玉ねぎ", "onion"),
    ("エッグ", "卵", "egg"),
    ("スピナッチ", "ほうれん草", "spinach"),
    ("パンプキン", "南瓜", "pumpkin"),
    ("ソイソース", "醤油", "soy sauce"),
    ("ポテト", "じゃがいも", "potato"),
    ("キャロット", "人参", "carrot"),
    ("チキン", "鶏肉", "chicken"),
])
def test_katakana_english_aliases(katakana, japanese, english):
    for query, target in [(katakana, japanese), (english, katakana), (japanese, katakana)]:
        assert match_score(query, target) == 0
        assert keyword_matches(query, target + "の料理")


def test_halfwidth_katakana_alias():
    assert keyword_matches("ｵﾆｵﾝ", "玉葱スープ")
    assert match_score("ぽてと", "じゃがいも") == 0
