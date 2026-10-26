"""AI 自由生成（レシピDB非依存）のリクエスト／解析ロジックのテスト。

実 API は呼ばず、httpx.Client を差し替えて検証する。
"""

import json as jsonlib
from datetime import date
from types import SimpleNamespace

import pytest

import app.services.menu_generator as menu_generator
from app.services.menu_generator import _generate_freeform_with_mimo


class _FakeResponse:
    def __init__(self, content: str) -> None:
        self._content = content

    def raise_for_status(self) -> None:
        return None

    def json(self) -> dict:
        return {"choices": [{"message": {"content": self._content}}]}


class _FakeClient:
    captured: dict = {}

    def __init__(self, **_kwargs) -> None:
        pass

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def post(self, url: str, headers: dict, json: dict):  # noqa: A002 - httpx と同じ引数名
        _FakeClient.captured = {"url": url, "headers": headers, "payload": json}
        entries = [
            {
                "date": "2026-11-01",
                "dishes": [
                    {
                        "name": "鮭の塩焼き",
                        "meal_type": "main",
                        "ingredients": [{"name": "鮭", "quantity": "80", "unit": "g"}],
                        "instructions": "焼く。",
                        "cook_time_minutes": 15,
                    },
                    {
                        "name": "卵焼き",
                        "meal_type": "side",
                        "ingredients": [{"name": "卵", "quantity": "1", "unit": "個"}],
                        "instructions": "焼く。",
                        "cook_time_minutes": 10,
                    },
                    {
                        "name": "みそ汁",
                        "meal_type": "soup",
                        "ingredients": [{"name": "豆腐", "quantity": "30", "unit": "g"}],
                        "instructions": "煮る。",
                        "cook_time_minutes": 10,
                    },
                    {
                        "name": "ごはん",
                        "meal_type": "staple",
                        "ingredients": [{"name": "米", "quantity": "80", "unit": "g"}],
                        "instructions": "炊く。",
                        "cook_time_minutes": 30,
                    },
                ],
            },
            {
                "date": "2026-11-02",
                "dishes": [
                    {
                        "name": "豚肉のしょうが焼き",
                        "meal_type": "main",
                        "ingredients": [{"name": "豚肉", "quantity": "80", "unit": "g"}],
                        "instructions": "焼く。",
                        "cook_time_minutes": 20,
                    }
                ],
            },
        ]
        return _FakeResponse(jsonlib.dumps(entries, ensure_ascii=False))


@pytest.fixture
def fake_ai(monkeypatch):
    monkeypatch.setattr(
        menu_generator,
        "get_settings",
        lambda: SimpleNamespace(
            ai_api_key="test-key",
            ai_model="mimo-v2.6-pro",
            ai_base_url="https://api.example.test/v1",
            ai_timeout_seconds=30,
        ),
    )
    monkeypatch.setattr(menu_generator.httpx, "Client", _FakeClient)
    yield


def test_freeform_ai_filters_allergens_and_keeps_details(fake_ai):
    menus = _generate_freeform_with_mimo(
        child_name="テスト児",
        child_age_months=52,
        start_date=date(2026, 11, 1),
        days=2,
        allergies=["卵"],
        preferences=[],
        nursery_menus=[],
        yesterday_menu=None,
        inventory=["にんじん"],
    )

    assert len(menus) == 2
    assert menus[0].date == date(2026, 11, 1)
    assert menus[1].date == date(2026, 11, 2)
    assert menus[0].engine == "mimo_freeform"

    # 卵を使う副菜は除外され、材料・作り方つきの詳細が残る
    first = menus[0]
    assert "卵焼き" not in first.dishes
    assert "鮭の塩焼き" in first.dishes
    assert len(first.dish_details) == 3
    salmon = next(d for d in first.dish_details if d["name"] == "鮭の塩焼き")
    assert salmon["ingredients"][0]["name"] == "鮭"
    assert salmon["instructions"] == "焼く。"
    assert salmon["cook_time_minutes"] == 15

    # リクエストに年齢・アレルギー・在庫が含まれ、API キーはヘッダーのみ
    captured = _FakeClient.captured
    assert captured["url"] == "https://api.example.test/v1/chat/completions"
    assert captured["headers"]["Authorization"] == "Bearer test-key"
    assert captured["payload"]["model"] == "mimo-v2.6-pro"
    messages = captured["payload"]["messages"]
    assert "4歳4か月" in messages[1]["content"]
    assert "卵" in messages[1]["content"]
    assert "にんじん" in messages[1]["content"]


def test_freeform_ai_raises_when_all_dishes_are_excluded(fake_ai, monkeypatch):
    class _AllExcludedClient(_FakeClient):
        def post(self, url, headers, json):  # noqa: A002
            entries = [
                {
                    "date": "2026-11-01",
                    "dishes": [
                        {
                            "name": "卵かけごはん",
                            "meal_type": "staple",
                            "ingredients": [{"name": "卵"}],
                        }
                    ],
                }
            ]
            return _FakeResponse(jsonlib.dumps(entries, ensure_ascii=False))

    monkeypatch.setattr(menu_generator.httpx, "Client", _AllExcludedClient)

    with pytest.raises(RuntimeError):
        _generate_freeform_with_mimo(
            child_name="テスト児",
            child_age_months=52,
            start_date=date(2026, 11, 1),
            days=1,
            allergies=["卵"],
            preferences=[],
            nursery_menus=[],
            yesterday_menu=None,
            inventory=[],
        )
