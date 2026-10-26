"""献立表 API（OCR 読み取り・一覧・詳細）。"""

import logging
from datetime import date

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import NurseryMenu, User
from app.routers.auth import get_current_user
from app.schemas import NurseryMenuCreate, NurseryMenuResponse
from app.services import ocr_ai

router = APIRouter(prefix="/menus", tags=["menus"])

logger = logging.getLogger(__name__)


@router.get("", response_model=list[NurseryMenuResponse])
def list_menus(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[NurseryMenu]:
    return db.query(NurseryMenu).filter(NurseryMenu.user_id == user.id).order_by(NurseryMenu.date.desc()).all()


@router.post("/upload", response_model=NurseryMenuResponse, status_code=status.HTTP_201_CREATED)
async def upload_menu(
    file: UploadFile = File(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> NurseryMenu:
    """献立表の PDF/画像をアップロードし、献立として保存する。

    OpenAI のマルチモーダル API だけで読み取る。
    """
    if file.content_type not in {"application/pdf", "image/png", "image/jpeg", "image/webp"}:
        raise HTTPException(status_code=415, detail="PDF・PNG・JPEG・WebPのみ対応しています")
    data = await file.read(15 * 1024 * 1024 + 1)
    if len(data) > 15 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="ファイルサイズは15MB以下にしてください")

    if not ocr_ai.is_available():
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY が設定されていません")
    try:
        entries = ocr_ai.extract_entries(
            filename=file.filename or "",
            content_type=file.content_type or "",
            data=data,
        )
    except ocr_ai.AIOCRError as exc:
        logger.warning("OpenAI による献立表解析に失敗しました: %s", exc)
        raise HTTPException(status_code=422, detail="献立表を解析できませんでした") from exc
    saved = _save_ai_entries(db, user, entries)
    if not saved:
        raise HTTPException(status_code=422, detail="献立表から献立を抽出できませんでした")
    return saved[0]


def _save_ai_entries(db: Session, user: User, entries: list[ocr_ai.AIMenuEntry]) -> list[NurseryMenu]:
    """AI の読み取り結果を日付ごとにまとめて保存する。

    同じ日付の献立が既にある場合は上書きする（同じ献立表を二重登録しないため）。
    """
    merged: dict[date, dict] = {}
    for entry in entries:
        menu_date = date.fromisoformat(entry.date) if entry.date else date.today()
        bucket = merged.setdefault(menu_date, {"meal_types": [], "dishes": []})
        if entry.meal_type and entry.meal_type not in bucket["meal_types"]:
            bucket["meal_types"].append(entry.meal_type)
        for dish in entry.dishes:
            if dish not in bucket["dishes"]:
                bucket["dishes"].append(dish)

    saved: list[NurseryMenu] = []
    for menu_date, bucket in merged.items():
        lines: list[str] = []
        if bucket["meal_types"]:
            lines.append(" / ".join(bucket["meal_types"]))
        lines.append("・".join(bucket["dishes"]))
        menu_text = "\n".join(lines)
        ingredients = {
            "dishes": bucket["dishes"],
            "meal_types": bucket["meal_types"],
            "engine": "openai",
        }
        menu = (
            db.query(NurseryMenu)
            .filter(NurseryMenu.user_id == user.id, NurseryMenu.date == menu_date)
            .first()
        )
        if menu is None:
            menu = NurseryMenu(user_id=user.id, date=menu_date, menu_text=menu_text, ingredients=ingredients)
            db.add(menu)
        else:
            menu.menu_text = menu_text
            menu.ingredients = ingredients
        saved.append(menu)

    db.commit()
    for menu in saved:
        db.refresh(menu)
    return saved


@router.post("", response_model=NurseryMenuResponse, status_code=status.HTTP_201_CREATED)
def create_menu(payload: NurseryMenuCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> NurseryMenu:
    menu = NurseryMenu(user_id=user.id, date=payload.date, menu_text=payload.menu_text, ingredients={})
    db.add(menu)
    db.commit()
    db.refresh(menu)
    return menu


@router.get("/{menu_id}", response_model=NurseryMenuResponse)
def get_menu(menu_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> NurseryMenu:
    menu = db.query(NurseryMenu).filter(NurseryMenu.id == menu_id, NurseryMenu.user_id == user.id).first()
    if menu is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="献立が見つかりません")
    return menu

