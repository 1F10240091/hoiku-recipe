"""献立表（OCR・メニュー）API のテスト。"""

from pathlib import Path

SAMPLE_PDF = Path(__file__).resolve().parent / "sample_menu.pdf"


def _sample_pdf() -> bytes:
    # 最小限の PDF（1ページ）を生成
    from reportlab.pdfgen import canvas

    buf = BytesIO()
    c = canvas.Canvas(buf)
    c.drawString(100, 750, "2026年8月献立表")
    c.drawString(100, 720, "8/3 ごはん みそ汁 ハンバーグ")
    c.save()
    return buf.getvalue()


def test_create_and_get_menu(auth_client):
    res = auth_client.post(
        "/api/v1/menus",
        json={"date": "2026-08-03", "menu_text": "月曜日: ごはん みそ汁 鶏の唐揚げ"},
    )
    assert res.status_code == 201
    menu_id = res.json()["id"]

    res = auth_client.get(f"/api/v1/menus/{menu_id}")
    assert res.status_code == 200
    assert res.json()["date"] == "2026-08-03"


def test_list_menus_empty(auth_client):
    res = auth_client.get("/api/v1/menus")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_upload_unsupported_type_rejected(auth_client):
    res = auth_client.post(
        "/api/v1/menus/upload",
        files={"file": ("menu.txt", b"text", "text/plain")},
    )
    assert res.status_code == 415


def test_upload_corrupt_pdf_rejected(auth_client):
    res = auth_client.post(
        "/api/v1/menus/upload",
        files={"file": ("menu.pdf", b"not a real pdf", "application/pdf")},
    )
    assert res.status_code in (415, 422)


def test_get_unknown_menu_404(auth_client):
    res = auth_client.get("/api/v1/menus/unknown-id")
    assert res.status_code == 404


def test_upload_valid_pdf(auth_client):
    """テキスト埋め込み PDF の OCR 抽出が成功することを確認する回帰テスト。"""
    if not SAMPLE_PDF.exists():
        return  # 実 PDF が無い環境ではスキップ
    data = SAMPLE_PDF.read_bytes()
    res = auth_client.post(
        "/api/v1/menus/upload",
        files={"file": ("sample_menu.pdf", data, "application/pdf")},
    )
    assert res.status_code == 201
    assert res.json()["menu_text"]
    assert len(res.json()["ingredients"]["dishes"]) > 0
