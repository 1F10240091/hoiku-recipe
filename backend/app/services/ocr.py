"""OCR サービス。

保育園から配布される献立表（PDF / 画像）からテキストを抽出する。
- PDF: pypdf によるテキスト抽出（デジタル生成の PDF 向け）
- 画像: easyocr による日本語 OCR（スキャン画像向け、遅延ロード）

将来の AI 連携（Xiaomi MiMo）に差し替えられるよう、共通インターフェースを
持たせる。
"""

from __future__ import annotations

import io
from dataclasses import dataclass

ALLOWED_PDF_TYPES = {"application/pdf"}
ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}


class OCRUnsupportedError(ValueError):
    """対応していないファイル形式を受け取った場合のエラー。"""


class OCRProcessingError(RuntimeError):
    """OCR 処理中に失敗した場合のエラー。"""


@dataclass
class OCRResult:
    """OCR 抽出結果。"""

    text: str
    engine: str
    raw_pages: list[str] | None = None


def extract_text(filename: str, content_type: str, data: bytes) -> OCRResult:
    """ファイル内容からテキストを抽出する。

    Args:
        filename: アップロードされたファイル名。
        content_type: MIME タイプ。
        data: ファイルのバイト列。

    Returns:
        OCRResult: 抽出結果。

    Raises:
        OCRUnsupportedError: 対応形式でない場合。
        OCRProcessingError: 抽出処理に失敗した場合。
    """
    if content_type in ALLOWED_PDF_TYPES or filename.lower().endswith(".pdf"):
        return _extract_from_pdf(data)
    if content_type in ALLOWED_IMAGE_TYPES or _is_image_filename(filename):
        return _extract_from_image(data)
    raise OCRUnsupportedError(f"対応していないファイル形式です: {content_type or filename}")


def _is_image_filename(filename: str) -> bool:
    return filename.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))


def _extract_from_pdf(data: bytes) -> OCRResult:
    try:
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(data))
        pages = [(page.extract_text() or "") for page in reader.pages]
        text = "\n".join(pages).strip()
    except Exception as exc:  # noqa: BLE001 - 原因に応じて変換する
        raise OCRProcessingError(f"PDF のテキスト抽出に失敗しました: {exc}") from exc

    if not text:
        # スキャン画像 PDF の場合、最初のページを画像として OCR を試みる。
        return _extract_from_image(data, source_pdf=True)
    return OCRResult(text=text, engine="pypdf", raw_pages=pages)


def _extract_from_image(data: bytes, source_pdf: bool = False) -> OCRResult:
    try:
        from PIL import Image
        import numpy as np
        import easyocr

        image = Image.open(io.BytesIO(data))
        if image.mode != "RGB":
            image = image.convert("RGB")
        array = np.array(image)

        # モデルは初回呼び出し時にダウンロードされる。遅延ロードで必要な時のみ起動する。
        reader = easyocr.Reader(["ja", "en"], gpu=False, verbose=False)
        lines = reader.readtext(array, detail=0, paragraph=True)
        text = "\n".join(line.strip() for line in lines if line.strip())
    except ImportError as exc:
        raise OCRProcessingError(
            "画像 OCR の依存ライブラリ（easyocr / Pillow / numpy）がインストールされていません。"
            " `pip install easyocr` を実行してください。"
        ) from exc
    except Exception as exc:  # noqa: BLE001
        raise OCRProcessingError(f"画像の OCR 処理に失敗しました: {exc}") from exc

    if not text and source_pdf:
        return OCRResult(text="(スキャン画像からはテキストを抽出できませんでした)", engine="easyocr")
    return OCRResult(text=text, engine="easyocr")
