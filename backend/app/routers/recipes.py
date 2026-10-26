"""AI 献立提案 API。

保育園の昼食・冷蔵庫の在庫・アレルギー・好き嫌い・前日の夕食を考慮した
夕食献立を生成する。AI エンジンは Xiaomi MiMo（OpenAI 互換 API）を使用し、
API キー未設定時はルールベースにフォールバックする。
"""

from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Child, InventoryItem, NurseryMenu, Recipe, SuggestedMeal, User
from app.routers.auth import get_current_user
from app.schemas import GenerateRequest, GenerateResponse, MealResponse
from app.services.menu_generator import generate_menus

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.get("", response_model=list[MealResponse])
def list_recipes(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[SuggestedMeal]:
    return db.query(SuggestedMeal).filter(SuggestedMeal.user_id == user.id).order_by(SuggestedMeal.date.desc()).all()


@router.post("/generate", response_model=GenerateResponse, status_code=status.HTTP_201_CREATED)
def generate_recipe(
    payload: GenerateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> GenerateResponse:
    child = db.query(Child).filter(Child.id == payload.child_id, Child.user_id == user.id).first()
    if child is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="お子様が見つかりません")

    allergies = [a.ingredient for a in child.allergies]
    preferences = [p.ingredient for p in child.preferences if p.mode == "exclude"]

    end_date = payload.menu_date + timedelta(days=payload.days - 1)
    nursery_menus = [
        m.menu_text
        for m in db.query(NurseryMenu)
        .filter(NurseryMenu.user_id == user.id, NurseryMenu.date >= payload.menu_date, NurseryMenu.date <= end_date)
        .all()
    ]
    inventory = [item.name for item in db.query(InventoryItem).filter(InventoryItem.user_id == user.id).all()]

    # レシピマスタを DB から取得（アレルゲン照合・選定の真実源）
    recipes = db.query(Recipe).all()

    # 前日の夕食を取得（週の境目をまたぐ場合も重複を避けるため開始日前日の献立を探す）
    yesterday = (
        db.query(SuggestedMeal)
        .filter(SuggestedMeal.user_id == user.id, SuggestedMeal.date < payload.menu_date)
        .order_by(SuggestedMeal.date.desc())
        .first()
    )
    yesterday_menu = yesterday.menu_text if yesterday else None

    generated = generate_menus(
        child_name=child.name,
        start_date=payload.menu_date,
        days=payload.days,
        allergies=allergies,
        preferences=preferences,
        nursery_menus=nursery_menus,
        yesterday_menu=yesterday_menu,
        inventory=inventory,
        recipes=recipes,
        child_age_months=_age_months(child.birth_date, payload.menu_date),
    )

    meals: list[SuggestedMeal] = []
    for menu in generated:
        recipe_ids = list(menu.recipe_ids)
        if menu.dish_details:
            # AI が新しく考案した料理をレシピ一覧に登録する（同名は再利用）
            recipe_ids = []
            for detail in menu.dish_details:
                recipe = db.query(Recipe).filter(Recipe.name == detail["name"]).first()
                if recipe is None:
                    recipe = Recipe(
                        name=detail["name"],
                        meal_type=detail["meal_type"],
                        ingredients=detail["ingredients"],
                        instructions=detail["instructions"],
                        cook_time_minutes=detail["cook_time_minutes"],
                    )
                    db.add(recipe)
                    db.flush()
                recipe_ids.append(recipe.id)

        meal = SuggestedMeal(
            user_id=user.id,
            date=menu.date,
            menu_text=menu.menu_text,
            ingredients={"dishes": menu.dishes, "engine": menu.engine, "recipe_ids": recipe_ids},
        )
        db.add(meal)
        meals.append(meal)
    db.commit()
    for meal in meals:
        db.refresh(meal)

    return GenerateResponse(meals=meals)


def _age_months(birth_date: date | None, on: date) -> int | None:
    """生年月から対象日時点の月齢を求める（日は 01 固定で保持している）。"""
    if birth_date is None:
        return None
    months = (on.year - birth_date.year) * 12 + (on.month - birth_date.month)
    if on.day < birth_date.day:
        months -= 1
    return max(months, 0)


@router.get("/{meal_id}", response_model=MealResponse)
def get_recipe(meal_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> SuggestedMeal:
    meal = db.query(SuggestedMeal).filter(SuggestedMeal.id == meal_id, SuggestedMeal.user_id == user.id).first()
    if meal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="提案献立が見つかりません")
    return meal
