"""レシピマスタ API（一覧・作成・更新・削除）。"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Recipe
from app.routers.auth import get_current_user
from app.schemas import RecipeCreate, RecipeResponse, RecipeUpdate

router = APIRouter(prefix="/recipe-master", tags=["recipe-master"])


@router.get("", response_model=list[RecipeResponse])
def list_recipes(
    meal_type: str | None = None, user=Depends(get_current_user), db: Session = Depends(get_db)
) -> list[Recipe]:
    query = db.query(Recipe)
    if meal_type:
        query = query.filter(Recipe.meal_type == meal_type)
    return query.order_by(Recipe.name).all()


@router.post("", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
def create_recipe(payload: RecipeCreate, user=Depends(get_current_user), db: Session = Depends(get_db)) -> Recipe:
    if db.query(Recipe).filter(Recipe.name == payload.name).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="同じ名前のレシピが既に存在します")
    recipe = Recipe(
        name=payload.name,
        meal_type=payload.meal_type,
        ingredients=[i.model_dump() for i in payload.ingredients],
        instructions=payload.instructions,
        cook_time_minutes=payload.cook_time_minutes,
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe(recipe_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)) -> Recipe:
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if recipe is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="レシピが見つかりません")
    return recipe


@router.put("/{recipe_id}", response_model=RecipeResponse)
def update_recipe(
    recipe_id: str, payload: RecipeUpdate, user=Depends(get_current_user), db: Session = Depends(get_db)
) -> Recipe:
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if recipe is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="レシピが見つかりません")

    if payload.name is not None:
        recipe.name = payload.name
    if payload.meal_type is not None:
        recipe.meal_type = payload.meal_type
    if payload.ingredients is not None:
        recipe.ingredients = [i.model_dump() for i in payload.ingredients]
    if payload.instructions is not None:
        recipe.instructions = payload.instructions
    if payload.cook_time_minutes is not None:
        recipe.cook_time_minutes = payload.cook_time_minutes
    db.commit()
    db.refresh(recipe)
    return recipe


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(recipe_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if recipe is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="レシピが見つかりません")
    db.delete(recipe)
    db.commit()
