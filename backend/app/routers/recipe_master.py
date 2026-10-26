"""レシピマスタ API（一覧・検索・作成・更新・削除）。"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Recipe, RecipeLike
from app.routers.auth import get_current_user
from app.schemas import RecipeCreate, RecipeResponse, RecipeSearchResponse, RecipeUpdate
from app.services.ingredients import list_recipe_ingredient_names

router = APIRouter(prefix="/recipe-master", tags=["recipe-master"])


def _like_counts(db: Session, user_id: str) -> dict[str, int]:
    rows = (
        db.query(RecipeLike.recipe_id, func.count(RecipeLike.id))
        .filter(RecipeLike.user_id == user_id)
        .group_by(RecipeLike.recipe_id)
        .all()
    )
    return {recipe_id: int(count) for recipe_id, count in rows}


def _to_response(recipe: Recipe, counts: dict[str, int]) -> RecipeResponse:
    response = RecipeResponse.model_validate(recipe)
    return response.model_copy(update={"liked_count": counts.get(recipe.id, 0)})


@router.get("", response_model=list[RecipeResponse])
def list_recipes(
    meal_type: str | None = None, user=Depends(get_current_user), db: Session = Depends(get_db)
) -> list[RecipeResponse]:
    query = db.query(Recipe)
    if meal_type:
        query = query.filter(Recipe.meal_type == meal_type)
    counts = _like_counts(db, user.id)
    return [_to_response(r, counts) for r in query.order_by(Recipe.name).all()]


@router.get("/search", response_model=RecipeSearchResponse)
def search_recipes(
    keyword: str | None = Query(default=None, description="レシピ名・作り方の部分一致検索"),
    meal_type: str | None = Query(default=None, description="main | side | soup | staple"),
    ingredient: str | None = Query(default=None, description="材料名の部分一致検索"),
    max_cook_time: int | None = Query(default=None, ge=1, description="最大調理時間（分）"),
    sort: str = Query(default="name", pattern="^(name|liked)$", description="name | liked（喜ばれた順）"),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RecipeSearchResponse:
    query = db.query(Recipe)

    if keyword:
        like = f"%{keyword}%"
        query = query.filter(Recipe.name.like(like) | Recipe.instructions.like(like))
    if meal_type:
        query = query.filter(Recipe.meal_type == meal_type)
    if max_cook_time is not None:
        query = query.filter(Recipe.cook_time_minutes <= max_cook_time)

    recipes = query.all()

    # 材料は JSON の Unicode エスケープで保存されるため LIKE 不可。
    # デコードしてから Python 側で部分一致フィルタする。
    if ingredient:
        needle = ingredient.lower()
        recipes = [
            r
            for r in recipes
            if any(needle in ing.get("name", "").lower() for ing in r.ingredients)
        ]

    counts = _like_counts(db, user.id)
    if sort == "liked":
        recipes.sort(key=lambda r: (-counts.get(r.id, 0), r.name))
    else:
        recipes.sort(key=lambda r: r.name)

    total = len(recipes)
    total_pages = (total + per_page - 1) // per_page if total else 0
    start = (page - 1) * per_page
    page_items = recipes[start : start + per_page]

    return RecipeSearchResponse(
        recipes=[_to_response(r, counts) for r in page_items],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


@router.get("/ingredients", response_model=list[str])
def list_ingredients(user=Depends(get_current_user), db: Session = Depends(get_db)) -> list[str]:
    """レシピで使われている食材名の一覧（重複なし）。アレルギー登録の選択肢に使う。"""
    return list_recipe_ingredient_names(db)


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
