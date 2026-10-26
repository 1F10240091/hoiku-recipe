"""AI 献立読み取りの動作確認スクリプト。

API キーは backend/.env の AI_API_KEY から読み込む（引数やログには出さない）。

使い方:
    .venv\\Scripts\\python.exe scripts\\test_ai_ocr.py
    .venv\\Scripts\\python.exe scripts\\test_ai_ocr.py ..\\docs\\sample-nursery-menu.pdf
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.ocr_ai import AIOCRError, extract_entries, is_available  # noqa: E402


def main() -> int:
    if not is_available():
        print("AI_API_KEY が未設定です。backend/.env に設定してから再実行してください。")
        return 1

    path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[2] / "docs" / "sample-nursery-menu.pdf"
    if not path.exists():
        print(f"ファイルが見つかりません: {path}")
        return 1

    content_type = "application/pdf" if path.suffix.lower() == ".pdf" else "image/png"
    try:
        entries = extract_entries(path.name, content_type, path.read_bytes())
    except AIOCRError as exc:
        print(f"読み取りに失敗しました: {exc}")
        return 1

    print(f"読み取り結果: {len(entries)} 件")
    for entry in entries:
        print(f"  {entry.date or '日付なし'} / {entry.meal_type or '区分なし'}: {'・'.join(entry.dishes)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
