"""AI 献立提案 API。

保育園の昼食・冷蔵庫の在庫・アレルギー・好き嫌いを考慮した夕食献立を生成する。
AI エンジン（Xiaomi MiMo）の接続は今後のタスクで行い、現在はプレースホルダを返す。
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Child, SuggestedMeal, User
from app.routers.auth import get_current_user
from app.schemas import GenerateRequest, RecipeResponse

router = APIRouter(prefix="/recipes", tags=["recipes"])

AI_ENGINE = "xiaomi_mimo_placeholder"


@router.get("", response_model=list[RecipeResponse])
def list_recipes(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[SuggestedMeal]:
    return db.query(SuggestedMeal).filter(SuggestedMeal.user_id == user.id).order_by(SuggestedMeal.date.desc()).all()


@router.post("/generate", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
def generate_recipe(payload: GenerateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> SuggestedMeal:
    child = db.query(Child).filter(Child.id == payload.child_id, Child.user_id == user.id).first()
    if child is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="お子様が見つかりません")

    menu_text = _build_placeholder_menu(child, payload.menu_date)
    meal = SuggestedMeal(user_id=user.id, date=payload.menu_date, menu_text=menu_text, ingredients={})
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal


@router.get("/{meal_id}", response_model=RecipeResponse)
def get_recipe(meal_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> SuggestedMeal:
    meal = db.query(SuggestedMeal).filter(SuggestedMeal.id == meal_id, SuggestedMeal.user_id == user.id).first()
    if meal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="提案献立が見つかりません")
    return meal


def _build_placeholder_menu(child: Child, menu_date: object) -> str:
    """AI 接続前のプレースホルダ献立を返す。

    実際には以下を考慮して Xiaomi MiMo に生成させる：
    - 保育園の昼食（食材の重複回避）
    - アレルギー食材の除外
    - 好き嫌いの「除外」または「改善優先」
    - 冷蔵庫の在庫の活用
    """
    return (
        f"{child.name} さんの夕食（{menu_date}）\n"
        f"プレースホルダ献立: 和風ハンバーグ / みそ汁 / おひたし\n"
        f"(AI エンジン: {AI_ENGINE} 未実装)"
    )
