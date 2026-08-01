"""献立表 API（OCR 読み取り・一覧・詳細）。"""

from datetime import date

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import NurseryMenu, User
from app.routers.auth import get_current_user
from app.schemas import NurseryMenuCreate, NurseryMenuResponse

router = APIRouter(prefix="/menus", tags=["menus"])

OCR_SERVICE = "ocr_service_placeholder"


@router.get("", response_model=list[NurseryMenuResponse])
def list_menus(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[NurseryMenu]:
    return db.query(NurseryMenu).filter(NurseryMenu.user_id == user.id).order_by(NurseryMenu.date.desc()).all()


@router.post("/upload", response_model=NurseryMenuResponse, status_code=status.HTTP_201_CREATED)
async def upload_menu(
    file: UploadFile = File(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> NurseryMenu:
    """献立表の PDF/画像をアップロードし、OCR でテキスト化して保存する。

    現在は OCR サービスの接続前のため、プレースホルダとして空の献立を保存する。
    OCR サービス（Xiaomi MiMo 等）の実装は今後のタスクで行う。
    """
    await file.read()
    if file.content_type not in {"application/pdf", "image/png", "image/jpeg"}:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="対応形式は PDF / PNG / JPEG のみです",
        )

    menu = NurseryMenu(
        user_id=user.id,
        date=date.today(),
        menu_text=f"(OCR 未実装: {OCR_SERVICE})",
        ingredients={},
    )
    db.add(menu)
    db.commit()
    db.refresh(menu)
    return menu


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
