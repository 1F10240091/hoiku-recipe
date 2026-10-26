"""「喜んでた」評価 API。

献立に含まれる料理ごとに、子どもが喜んだかどうかを記録する。
レシピ一覧ではこの回数を表示し、多い順に並べ替えられる。
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Recipe, RecipeLike, SuggestedMeal, User
from app.routers.auth import get_current_user
from app.schemas import LikeToggleRequest, LikeToggleResponse, LikesSummary

router = APIRouter(prefix="/likes", tags=["likes"])


@router.get("", response_model=LikesSummary)
def list_likes(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> LikesSummary:
    rows = db.query(RecipeLike).filter(RecipeLike.user_id == user.id).all()
    counts: dict[str, int] = {}
    for row in rows:
        counts[row.recipe_id] = counts.get(row.recipe_id, 0) + 1
    return LikesSummary(
        liked=[{"meal_id": row.meal_id, "recipe_id": row.recipe_id} for row in rows],
        counts=counts,
    )


@router.post("/toggle", response_model=LikeToggleResponse)
def toggle_like(
    payload: LikeToggleRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> LikeToggleResponse:
    meal = (
        db.query(SuggestedMeal)
        .filter(SuggestedMeal.id == payload.meal_id, SuggestedMeal.user_id == user.id)
        .first()
    )
    if meal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="献立が見つかりません")

    recipe = db.query(Recipe).filter(Recipe.id == payload.recipe_id).first()
    if recipe is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="レシピが見つかりません")

    recipe_ids = [str(r) for r in (meal.ingredients or {}).get("recipe_ids", [])]
    if payload.recipe_id not in recipe_ids:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="この献立に含まれないレシピです")

    existing = (
        db.query(RecipeLike)
        .filter(
            RecipeLike.user_id == user.id,
            RecipeLike.meal_id == payload.meal_id,
            RecipeLike.recipe_id == payload.recipe_id,
        )
        .first()
    )
    liked = existing is None
    if existing is not None:
        db.delete(existing)
    else:
        db.add(
            RecipeLike(
                user_id=user.id,
                meal_id=payload.meal_id,
                recipe_id=payload.recipe_id,
            )
        )
    db.commit()

    count = (
        db.query(func.count(RecipeLike.id))
        .filter(RecipeLike.user_id == user.id, RecipeLike.recipe_id == payload.recipe_id)
        .scalar()
        or 0
    )
    return LikeToggleResponse(
        meal_id=payload.meal_id,
        recipe_id=payload.recipe_id,
        liked=liked,
        liked_count=int(count),
    )
