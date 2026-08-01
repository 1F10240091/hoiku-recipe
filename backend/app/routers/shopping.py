"""冷蔵庫の在庫・買い物リスト API。"""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InventoryItem, SuggestedMeal, User
from app.routers.auth import get_current_user
from app.schemas import ShoppingGenerateRequest, ShoppingItemResponse, ShoppingListResponse

router = APIRouter(prefix="/shopping", tags=["shopping"])


@router.get("/list", response_model=ShoppingListResponse)
def get_shopping_list(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ShoppingListResponse:
    return ShoppingListResponse(items=[], generated_at=datetime.utcnow())


@router.post("/generate", response_model=ShoppingListResponse, status_code=status.HTTP_201_CREATED)
def generate_shopping_list(
    payload: ShoppingGenerateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> ShoppingListResponse:
    """提案献立に必要な食材から、冷蔵庫の在庫にあるものを除いた不足食材リストを生成する。

    現在はプレースホルダとして空リストを返す。不足食材の自動判定は今後実装する。
    """
    meal = db.query(SuggestedMeal).filter(SuggestedMeal.id == payload.meal_id, SuggestedMeal.user_id == user.id).first()
    if meal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="提案献立が見つかりません")
    return ShoppingListResponse(items=[], generated_at=datetime.utcnow())


@router.get("/inventory", response_model=list[ShoppingItemResponse])
def list_inventory(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[InventoryItem]:
    return db.query(InventoryItem).filter(InventoryItem.user_id == user.id).all()


@router.post("/inventory", response_model=ShoppingItemResponse, status_code=status.HTTP_201_CREATED)
def add_inventory_item(
    name: str, quantity: str | None = None, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> InventoryItem:
    item = InventoryItem(user_id=user.id, name=name, quantity=quantity)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
