"""献立表 API（OCR 読み取り・一覧・詳細）。"""

import logging
from datetime import date

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import NurseryMenu, User
from app.routers.auth import get_current_user
from app.schemas import NurseryMenuCreate, NurseryMenuResponse
from app.services import ocr_ai
from app.services.menu_parser import parse_menu_text
from app.services.ocr import OCRProcessingError, OCRUnsupportedError, extract_text

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

    AI_API_KEY が設定されていればマルチモーダル AI で読み取り、
    失敗した場合は従来の PDF テキスト抽出にフォールバックする。
    """
    data = await file.read()

    if ocr_ai.is_available():
        try:
            entries = ocr_ai.extract_entries(
                filename=file.filename or "",
                content_type=file.content_type or "",
                data=data,
            )
        except ocr_ai.AIOCRError as exc:
            logger.warning("AI 読み取りに失敗したため従来の OCR に切り替えます: %s", exc)
            entries = []
        if entries:
            saved = _save_ai_entries(db, user, entries)
            if saved:
                return saved[0]

    try:
        result = extract_text(filename=file.filename or "", content_type=file.content_type or "", data=data)
    except OCRUnsupportedError as exc:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail=str(exc)) from exc
    except OCRProcessingError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    dishes = _collect_dishes(result.text)
    menu = NurseryMenu(
        user_id=user.id,
        date=_date_from_text(result.text),
        menu_text=result.text,
        ingredients={"dishes": dishes, "engine": result.engine},
    )
    db.add(menu)
    db.commit()
    db.refresh(menu)
    return menu


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
            "engine": "mimo",
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


def _date_from_text(text: str) -> date:
    """従来 OCR のテキストから先頭の日付を取り出す（取れなければ今日）。"""
    entries = parse_menu_text(text)
    for entry in entries:
        if entry.month and entry.day:
            try:
                return date(date.today().year, entry.month, entry.day)
            except ValueError:
                continue
    return date.today()



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


def _collect_dishes(text: str) -> list[str]:
    """献立テキストから料理名のリストを収集する。"""
    dishes: list[str] = []
    for entry in parse_menu_text(text):
        for dish in entry.dishes:
            if dish not in dishes:
                dishes.append(dish)
    return dishes
