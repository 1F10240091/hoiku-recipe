"""登録済みレシピから献立を提案するAPI。

保育園の昼食・冷蔵庫の在庫・アレルギー・好き嫌い・前日の夕食を考慮した
夕食献立を生成する。AIで新しいレシピは生成せず、DB内の登録済みレシピだけを使う。
"""

from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import RecipeLike, Child, InventoryItem, NurseryMenu, Recipe, SuggestedMeal, User
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
    recipes = (
        db.query(Recipe)
        .filter(or_(Recipe.is_official.is_(True), Recipe.is_public.is_(True), Recipe.owner_id == user.id))
        .all()
    )

    # 前日の夕食を取得（週の境目をまたぐ場合も重複を避けるため開始日前日の献立を探す）
    yesterday = (
        db.query(SuggestedMeal)
        .filter(SuggestedMeal.user_id == user.id, SuggestedMeal.date < payload.menu_date)
        .order_by(SuggestedMeal.date.desc())
        .first()
    )
    yesterday_menu = yesterday.menu_text if yesterday else None

    # 過去の園献立表と照合する場合でも、レシピの対象年齢は現在の子どもの月齢で判定する。
    # 将来日を指定した場合は、その開始日時点の月齢を使う。
    age_reference_date = max(payload.menu_date, date.today())
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
        child_age_months=_age_months(child.birth_date, age_reference_date),
    )

    if not generated or any(not menu.dishes for menu in generated):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="お子さんの対象月齢に合うレシピがありません。プロフィールの生年月日とレシピの対象年齢を確認してください。",
        )

    meals: list[SuggestedMeal] = []
    for menu in generated:
        recipe_ids = list(menu.recipe_ids)
        ingredients = {"dishes": menu.dishes, "engine": menu.engine, "recipe_ids": recipe_ids}
        # 以前の空提案が同じ日付にある場合は、再生成結果で補完する。
        existing = (
            db.query(SuggestedMeal)
            .filter(SuggestedMeal.user_id == user.id, SuggestedMeal.date == menu.date)
            .first()
        )
        if existing is not None:
            # 再提案した料理へ以前の評価を引き継がない。
            db.query(RecipeLike).filter(RecipeLike.meal_id == existing.id).delete(synchronize_session=False)
            existing.menu_text = menu.menu_text
            existing.ingredients = ingredients
            meal = existing
        else:
            meal = SuggestedMeal(
                user_id=user.id,
                date=menu.date,
                menu_text=menu.menu_text,
                ingredients=ingredients,
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
