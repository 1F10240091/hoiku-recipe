"""献立表 API（Gemini解析・一覧・詳細）。"""

import logging
from datetime import date

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from starlette.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.config import get_settings
from app.database import get_db
from app.models import NurseryMenu, User
from app.routers.auth import get_current_user
from app.schemas import NurseryMenuCreate, NurseryMenuResponse, NurseryMenuUpdate
from app.services import ocr_ai

router = APIRouter(prefix="/menus", tags=["menus"])

logger = logging.getLogger(__name__)


@router.get("", response_model=list[NurseryMenuResponse])
def list_menus(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[NurseryMenu]:
    return db.query(NurseryMenu).filter(NurseryMenu.user_id == user.id).order_by(NurseryMenu.date.asc()).all()


@router.post("/upload", response_model=NurseryMenuResponse | list[dict], status_code=status.HTTP_201_CREATED)
async def upload_menu(
    file: UploadFile = File(...), preview: bool = False, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """献立表の PDF/画像をアップロードし、献立として保存する。

    Gemini のマルチモーダル API だけで読み取る。
    """
    if file.content_type not in {"application/pdf", "image/png", "image/jpeg", "image/webp"}:
        raise HTTPException(status_code=415, detail="PDF・PNG・JPEG・WebPのみ対応しています")
    data = await file.read(4 * 1024 * 1024 + 1)
    if len(data) > 4 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="ファイルサイズは4MB以下にしてください")

    if not ocr_ai.is_available():
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY が設定されていません")
    try:
        # 画像変換と外部API呼び出しは同期処理なので、イベントループを塞がない。
        entries = await run_in_threadpool(
            ocr_ai.extract_entries,
            filename=file.filename or "",
            content_type=file.content_type or "",
            data=data,
        )
    except ocr_ai.AIOCRError as exc:
        logger.warning("Gemini による献立表解析に失敗しました: %s", exc)
        if "タイムアウト" in str(exc):
            raise HTTPException(
                status_code=504,
                detail="Geminiの解析に時間がかかっています。画像の解像度を下げるか、PDFを数ページずつに分けて再度お試しください。",
            ) from exc
        raise HTTPException(status_code=422, detail="献立表を解析できませんでした") from exc
    if preview:
        if not entries:
            raise HTTPException(status_code=422, detail="献立表から献立を抽出できませんでした")
        return [{"date": e.date, "meal_type": e.meal_type or "", "dishes": e.dishes, "ingredients": e.ingredients} for e in entries]
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
        bucket = merged.setdefault(menu_date, {"meal_types": [], "dishes": [], "foods": []})
        for food in entry.ingredients:
            if food not in bucket["foods"]:
                bucket["foods"].append(food)
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
            "engine": "gemini",
            "foods": bucket["foods"],
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


class ConfirmEntry(BaseModel):
    date: date
    meal_type: str = Field(default="", max_length=100)
    dishes: list[str] = Field(min_length=1, max_length=100)
    ingredients: list[str] = Field(default_factory=list, max_length=200)


class ConfirmMenus(BaseModel):
    entries: list[ConfirmEntry] = Field(min_length=1, max_length=62)


@router.post("/confirm", response_model=list[NurseryMenuResponse])
def confirm_menus(payload: ConfirmMenus, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if any(not any(d.strip() for d in e.dishes) for e in payload.entries):
        raise HTTPException(status_code=422, detail="料理名を入力してください")
    return _save_ai_entries(db, user, [ocr_ai.AIMenuEntry(date=e.date.isoformat(), meal_type=e.meal_type,
        dishes=[d.strip() for d in e.dishes if d.strip()], ingredients=e.ingredients) for e in payload.entries])


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


@router.put("/{menu_id}", response_model=NurseryMenuResponse)
def update_menu(
    menu_id: str, payload: NurseryMenuUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> NurseryMenu:
    menu = db.query(NurseryMenu).filter(NurseryMenu.id == menu_id, NurseryMenu.user_id == user.id).first()
    if menu is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="献立が見つかりません")
    menu.date = payload.date
    menu.menu_text = payload.menu_text
    menu.ingredients = {"foods": payload.foods if payload.foods is not None else (menu.ingredients or {}).get("foods", [])}
    db.commit()
    db.refresh(menu)
    return menu


@router.delete("/{menu_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu(menu_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    menu = db.query(NurseryMenu).filter(NurseryMenu.id == menu_id, NurseryMenu.user_id == user.id).first()
    if menu is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="献立が見つかりません")
    db.delete(menu)
    db.commit()

