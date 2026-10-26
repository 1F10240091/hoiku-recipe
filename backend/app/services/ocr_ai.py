"""OpenAI による献立表読み取りサービス。

従来の pypdf / easyocr による文字抽出ではなく、献立表の画像を
マルチモーダル LLM に直接渡し、日付・食事区分・料理名を構造化して受け取る。

- 画像（PNG/JPEG/WebP）はそのまま送信する。
- PDF は PyMuPDF でページ画像に変換して送信する（先頭数ページのみ）。
- API キー未設定・通信失敗・JSON 不正時は AIOCRError を送出する。

API キーはサーバー側の環境変数（AI_API_KEY）からのみ読み込む。
フロントエンドや API レスポンスに含めてはならない。
"""

from __future__ import annotations

import base64
import io
import json
import re
from dataclasses import dataclass, field

import httpx

from app.config import get_settings

MAX_FILE_BYTES = 15 * 1024 * 1024
MAX_IMAGE_WIDTH = 1600
_JSON_BLOCK = re.compile(r"\{.*\}", re.DOTALL)
_ISO_DATE = re.compile(r"^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$")
_MD_DATE = re.compile(r"^(\d{1,2})[-/月](\d{1,2})日?$")


class AIOCRError(RuntimeError):
    """AI 読み取りに失敗した場合のエラー。"""


@dataclass
class AIMenuEntry:
    """AI が読み取った 1 日分の献立。"""

    date: str | None
    meal_type: str | None
    dishes: list[str] = field(default_factory=list)


_PROMPT = """あなたは保育園の献立表を読み取るアシスタントです。
添付された献立表の画像から、記載されている献立を正確に抜き出してください。

ルール:
- 日付・曜日・昼食/夕食/おやつなどの区分を読み取る。
- 料理名は献立表の表記のまま、1品ずつに分ける。
- 箇条書きの記号や栄養値・アレルギー表記は料理名に含めない。
- 読み取れない項目は推測せず null にする。
- 年が書かれていない場合は今年（{year}年）として扱う。
- 出力は JSON のみ。前後に説明文や Markdown のコードフェンスを付けない。

出力形式:
{{"menus":[{{"date":"YYYY-MM-DD","meal_type":"昼食","dishes":["ごはん","鮭の塩焼き","みそ汁"]}}]}}
"""


def is_available() -> bool:
    """AI 読み取りが設定されているか。"""
    settings = get_settings()
    if settings.ai_provider.lower() == "gemini":
        return bool(settings.gemini_api_key.strip())
    return bool(settings.openai_api_key.strip())


def extract_entries(filename: str, content_type: str, data: bytes) -> list[AIMenuEntry]:
    """献立表の画像/PDFを AI に渡し、構造化された献立を返す。

    Raises:
        AIOCRError: API キー未設定、通信失敗、応答の解析失敗など。
    """
    settings = get_settings()
    provider = settings.ai_provider.lower()
    api_key = settings.gemini_api_key.strip() if provider == "gemini" else settings.openai_api_key.strip()
    if not api_key:
        raise AIOCRError("AI_API_KEY が設定されていません")

    if len(data) > MAX_FILE_BYTES:
        raise AIOCRError("ファイルサイズが大きすぎます（15MB 以下にしてください）")

    images = _to_png_images(filename, content_type, data, max_pages=settings.openai_max_pages)
    if not images:
        raise AIOCRError("読み取れる画像がありませんでした")

    from datetime import date as _date

    prompt = _PROMPT.format(year=_date.today().year)
    response_text = _request_gemini(api_key, prompt, images) if provider == "gemini" else _request(api_key, prompt, images)
    entries = parse_menus_json(response_text)
    if not entries:
        raise AIOCRError("AI が献立を認識できませんでした")
    return entries


def parse_menus_json(text: str) -> list[AIMenuEntry]:
    """AI の応答テキストから献立エントリを抽出する（テスト用に公開）。"""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```[a-zA-Z]*\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    match = _JSON_BLOCK.search(cleaned)
    payload = None
    for candidate in filter(None, (cleaned, match.group(0) if match else None)):
        try:
            payload = json.loads(candidate)
            break
        except json.JSONDecodeError:
            continue
    if payload is None:
        return []

    raw_menus = payload.get("menus") if isinstance(payload, dict) else payload
    if not isinstance(raw_menus, list):
        return []

    entries: list[AIMenuEntry] = []
    for item in raw_menus:
        if not isinstance(item, dict):
            continue
        dishes = _normalize_dishes(item.get("dishes"))
        if not dishes:
            continue
        entries.append(
            AIMenuEntry(
                date=normalize_date(item.get("date")),
                meal_type=_clean_text(item.get("meal_type")),
                dishes=dishes,
            )
        )
    return entries


def normalize_date(value: object) -> str | None:
    """AI が返した日付表記を YYYY-MM-DD に正規化する。"""
    text = _clean_text(value)
    if not text:
        return None
    text = text.replace("年", "-").replace("月", "-").replace("日", "").strip()
    iso = _ISO_DATE.match(text)
    if iso:
        year, month, day = (int(x) for x in iso.groups())
        return _format_date(year, month, day)
    md = _MD_DATE.match(text)
    if md:
        from datetime import date as _date

        month, day = (int(x) for x in md.groups())
        return _format_date(_date.today().year, month, day)
    return None


def _format_date(year: int, month: int, day: int) -> str | None:
    from datetime import date as _date

    try:
        return _date(year, month, day).isoformat()
    except ValueError:
        return None


def _normalize_dishes(value: object) -> list[str]:
    if isinstance(value, str):
        raw_items = re.split(r"[・、,，\n]+", value)
    elif isinstance(value, list):
        raw_items = [str(v) for v in value]
    else:
        return []

    dishes: list[str] = []
    for item in raw_items:
        name = _clean_text(item)
        if name and name not in dishes:
            dishes.append(name)
    return dishes


def _clean_text(value: object) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _request(api_key: str, prompt: str, images: list[bytes]) -> str:
    settings = get_settings()
    model = settings.openai_model.strip()
    content: list[dict] = []
    for image in images:
        content.append(
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{base64.b64encode(image).decode('ascii')}"},
            }
        )
    content.append({"type": "text", "text": prompt})

    payload = {
        "model": model,
        "messages": [{"role": "user", "content": content}],
        "temperature": 0,
        "max_tokens": 1200,
        "stream": False,
    }
    payload["response_format"] = {"type": "json_object"}
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    url = f"{settings.openai_base_url.rstrip('/')}/chat/completions"

    try:
        with httpx.Client(timeout=settings.ai_timeout_seconds) as client:
            response = client.post(url, json=payload, headers=headers)
    except httpx.HTTPError as exc:
        raise AIOCRError(f"AI への接続に失敗しました（{type(exc).__name__}）") from exc

    if response.status_code >= 400:
        # 応答本文にキーが混ざる可能性に備えて必ず伏せる
        snippet = response.text[:200].replace(api_key, "***")
        raise AIOCRError(f"AI API がエラーを返しました（{response.status_code}）: {snippet}")

    try:
        data = response.json()
        message_content = data["choices"][0]["message"]["content"]
    except (ValueError, KeyError, IndexError, TypeError) as exc:
        raise AIOCRError("AI の応答形式が不正です") from exc

    if isinstance(message_content, list):
        message_content = "".join(
            part.get("text", "") for part in message_content if isinstance(part, dict)
        )
    if not isinstance(message_content, str) or not message_content.strip():
        raise AIOCRError("AI の応答が空でした")
    return message_content


def _request_gemini(api_key: str, prompt: str, images: list[bytes]) -> str:
    """Gemini APIへ画像と短いJSON抽出指示を送る。"""
    settings = get_settings()
    parts: list[dict] = [{"text": prompt}]
    for image in images:
        parts.append({"inline_data": {"mime_type": "image/png", "data": base64.b64encode(image).decode("ascii")}})
    payload = {
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {
            "temperature": 0,
            "maxOutputTokens": 1200,
            "responseMimeType": "application/json",
        },
    }
    url = f"{settings.gemini_base_url.rstrip('/')}/models/{settings.gemini_model}:generateContent?key={api_key}"
    try:
        with httpx.Client(timeout=settings.ai_timeout_seconds) as client:
            response = client.post(url, json=payload)
    except httpx.HTTPError as exc:
        raise AIOCRError(f"Gemini への接続に失敗しました（{type(exc).__name__}）") from exc
    if response.status_code >= 400:
        snippet = response.text[:200].replace(api_key, "***")
        raise AIOCRError(f"Gemini API がエラーを返しました（{response.status_code}）: {snippet}")
    try:
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (ValueError, KeyError, IndexError, TypeError) as exc:
        raise AIOCRError("Gemini の応答形式が不正です") from exc


def _to_png_images(filename: str, content_type: str, data: bytes, max_pages: int) -> list[bytes]:
    """PDF/画像を PNG バイト列のリストに変換する。"""
    is_pdf = content_type == "application/pdf" or filename.lower().endswith(".pdf")
    if is_pdf:
        return _pdf_to_pngs(data, max_pages)
    return [_shrink_image(data)]


def _pdf_to_pngs(data: bytes, max_pages: int) -> list[bytes]:
    try:
        import pymupdf
    except ImportError:  # 旧バージョン互換
        try:
            import fitz as pymupdf  # type: ignore[no-redef]
        except ImportError as exc:
            raise AIOCRError("PDF の画像化には pymupdf が必要です") from exc

    try:
        document = pymupdf.open(stream=data, filetype="pdf")
    except Exception as exc:  # noqa: BLE001
        raise AIOCRError(f"PDF を開けませんでした: {type(exc).__name__}") from exc

    images: list[bytes] = []
    try:
        for page_index in range(min(len(document), max(1, max_pages))):
            pixmap = document[page_index].get_pixmap(dpi=200)
            images.append(_shrink_image(pixmap.tobytes("png")))
    finally:
        document.close()
    return images


def _shrink_image(data: bytes) -> bytes:
    """長辺が大きすぎる画像を縮小し、PNG に統一する。"""
    try:
        from PIL import Image
    except ImportError as exc:
        raise AIOCRError("画像処理には Pillow が必要です") from exc

    try:
        image = Image.open(io.BytesIO(data))
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")
        if image.width > MAX_IMAGE_WIDTH:
            ratio = MAX_IMAGE_WIDTH / image.width
            image = image.resize((MAX_IMAGE_WIDTH, max(1, int(image.height * ratio))))
        buffer = io.BytesIO()
        image.save(buffer, format="PNG", optimize=True)
        return buffer.getvalue()
    except Exception as exc:  # noqa: BLE001
        raise AIOCRError(f"画像の変換に失敗しました: {type(exc).__name__}") from exc
