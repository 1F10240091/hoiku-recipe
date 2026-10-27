"""AI 献立読み取り（ocr_ai）のテスト。

実 API は呼ばず、JSON 解析・日付正規化・フォールバックを検証する。
"""

from pathlib import Path

import pytest

from app.config import get_settings
from app.routers import menus
from app.services import ocr_ai

SAMPLE_PDF = Path(__file__).resolve().parent / "sample_menu.pdf"


def test_parse_menus_json_with_code_fence():
    text = '```json\n{"menus":[{"date":"2026-10-21","meal_type":"昼食","dishes":["ごはん","鮭の塩焼き"]}]}\n```'
    entries = ocr_ai.parse_menus_json(text)
    assert len(entries) == 1
    assert entries[0].date == "2026-10-21"
    assert entries[0].meal_type == "昼食"
    assert entries[0].dishes == ["ごはん", "鮭の塩焼き"]


def test_parse_menus_json_dedupes_and_skips_empty():
    text = '{"menus":[{"date":"2026-10-21","dishes":["ごはん","ごはん","","みそ汁"]},{"date":"2026-10-22","dishes":[]}]}'
    entries = ocr_ai.parse_menus_json(text)
    assert len(entries) == 1
    assert entries[0].dishes == ["ごはん", "みそ汁"]


def test_parse_menus_json_rejects_broken_json():
    assert ocr_ai.parse_menus_json("献立を読み取れませんでした") == []
    assert ocr_ai.parse_menus_json('{"menus": [}') == []


def test_parse_menus_json_handles_bare_list():
    entries = ocr_ai.parse_menus_json('[{"date":"2026-10-21","dishes":["ごはん"]}]')
    assert len(entries) == 1
    assert entries[0].dishes == ["ごはん"]


def test_normalize_date_variants():
    assert ocr_ai.normalize_date("2026-10-21") == "2026-10-21"
    assert ocr_ai.normalize_date("2026/10/21") == "2026-10-21"
    assert ocr_ai.normalize_date("10月21日").endswith("-10-21")
    assert ocr_ai.normalize_date("10/21").endswith("-10-21")
    assert ocr_ai.normalize_date("2026-02-31") is None
    assert ocr_ai.normalize_date(None) is None
    assert ocr_ai.normalize_date("来週") is None


def test_extract_entries_without_api_key(monkeypatch):
    settings = get_settings().model_copy(update={"gemini_api_key": ""})
    monkeypatch.setattr(ocr_ai, "get_settings", lambda: settings)
    with pytest.raises(ocr_ai.AIOCRError):
        ocr_ai.extract_entries("menu.png", "image/png", b"dummy")


def test_upload_uses_ai_result_and_saves_dates(auth_client, monkeypatch):
    entries = [
        ocr_ai.AIMenuEntry(date="2026-10-21", meal_type="昼食", dishes=["ごはん", "鮭の塩焼き"]),
        ocr_ai.AIMenuEntry(date="2026-10-22", meal_type="昼食", dishes=["ごはん", "鶏の照り焼き"]),
    ]
    monkeypatch.setattr(menus.ocr_ai, "is_available", lambda: True)
    monkeypatch.setattr(menus.ocr_ai, "extract_entries", lambda **_kwargs: entries)

    res = auth_client.post(
        "/api/v1/menus/upload",
        files={"file": ("menu.pdf", b"%PDF-1.4 dummy", "application/pdf")},
    )
    assert res.status_code == 201, res.text
    assert res.json()["date"] == "2026-10-21"
    assert res.json()["ingredients"]["engine"] == "gemini"

    dates = {m["date"] for m in auth_client.get("/api/v1/menus").json()}
    assert {"2026-10-21", "2026-10-22"} <= dates


def test_upload_upserts_same_date(auth_client, monkeypatch):
    entries = [ocr_ai.AIMenuEntry(date="2026-11-05", meal_type=None, dishes=["ごはん"])]
    monkeypatch.setattr(menus.ocr_ai, "is_available", lambda: True)
    monkeypatch.setattr(menus.ocr_ai, "extract_entries", lambda **_kwargs: entries)

    for _ in range(2):
        res = auth_client.post(
            "/api/v1/menus/upload",
            files={"file": ("menu.pdf", b"%PDF-1.4 dummy", "application/pdf")},
        )
        assert res.status_code == 201, res.text

    same_date = [m for m in auth_client.get("/api/v1/menus").json() if m["date"] == "2026-11-05"]
    assert len(same_date) == 1


def test_upload_ai_failure_is_reported(auth_client, monkeypatch):
    def _boom(**_kwargs):
        raise ocr_ai.AIOCRError("AI ダウン")

    monkeypatch.setattr(menus.ocr_ai, "is_available", lambda: True)
    monkeypatch.setattr(menus.ocr_ai, "extract_entries", _boom)

    if not SAMPLE_PDF.exists():
        pytest.skip("sample_menu.pdf がありません")

    res = auth_client.post(
        "/api/v1/menus/upload",
        files={"file": ("sample_menu.pdf", SAMPLE_PDF.read_bytes(), "application/pdf")},
    )
    assert res.status_code == 422, res.text


def test_pdf_conversion_is_bounded_and_rejects_extra_pages():
    import pymupdf
    from PIL import Image
    import io
    with pymupdf.open() as doc:
        doc.new_page(width=10000, height=10000)
        data = doc.tobytes()
    images = ocr_ai._pdf_to_pngs(data, 5)
    with Image.open(io.BytesIO(images[0])) as image:
        assert max(image.size) <= ocr_ai.MAX_IMAGE_WIDTH
    with pymupdf.open() as doc:
        doc.new_page()
        doc.new_page()
        data = doc.tobytes()
    with pytest.raises(ocr_ai.AIOCRError):
        ocr_ai._pdf_to_pngs(data, 1)


def test_corrupt_pdf_conversion_rejected():
    with pytest.raises(ocr_ai.AIOCRError):
        ocr_ai._pdf_to_pngs(b'not a PDF', 5)


def test_gemini_key_is_sent_in_header_only(monkeypatch):
    settings = get_settings().model_copy(update={'gemini_api_key':'test-secret'})
    monkeypatch.setattr(ocr_ai, 'get_settings', lambda: settings)
    class FakeClient:
        def __init__(self, **kwargs): pass
        def __enter__(self): return self
        def __exit__(self, *args): pass
        def post(self, url, *, json, headers):
            assert 'test-secret' not in url
            assert headers['x-goog-api-key'] == 'test-secret'
            class Response:
                status_code = 200
                def json(self): return {'candidates':[{'content':{'parts':[{'text':'{}'}]}}]}
            return Response()
    monkeypatch.setattr(ocr_ai.httpx, 'Client', FakeClient)
    assert ocr_ai._request_gemini('test-secret', 'test', [b'test-image']) == '{}'
