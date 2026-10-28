"""Pydantic スキーマ定義。"""

import re
from datetime import date, datetime
from typing import Annotated, Optional

from app.services.allergens import canonical_allergen

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator

# パスワード強度チェック: 8文字以上・英字・数字を含む
_PASSWORD_RE = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).{8,}$")


def validate_password_strength(value: str) -> str:
    if not _PASSWORD_RE.match(value):
        raise ValueError("パスワードは8文字以上で、英字と数字をそれぞれ1文字以上含めてください")
    if len(value.encode("utf-8")) > 72:
        raise ValueError("パスワードはUTF-8で72バイト以内にしてください")
    return value


def validate_username(value: str) -> str:
    name = value.strip()
    if not 1 <= len(name) <= 30:
        raise ValueError("ユーザーネームは1〜30文字で入力してください")
    return name


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --- 認証 ---
class RegisterRequest(BaseModel):
    username: str = Field(min_length=1, max_length=30)
    password: str = Field(min_length=8, max_length=72)

    @field_validator("username")
    @classmethod
    def check_username(cls, v: str) -> str:
        return validate_username(v)

    @field_validator("password")
    @classmethod
    def check_password(cls, v: str) -> str:
        return validate_password_strength(v)


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=30)
    password: str = Field(max_length=256)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(ORMModel):
    id: str
    username: str


class UserUpdate(BaseModel):
    username: Optional[str] = Field(default=None, min_length=1, max_length=30)
    password: Optional[str] = Field(default=None, min_length=8, max_length=72)

    @field_validator("username")
    @classmethod
    def check_username(cls, v: Optional[str]) -> Optional[str]:
        return validate_username(v) if v is not None else v

    @field_validator("password")
    @classmethod
    def check_password(cls, v: str | None) -> str | None:
        return validate_password_strength(v) if v is not None else None


# --- お子様 ---
class AllergyCreate(BaseModel):
    ingredient: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]


    @field_validator("ingredient")
    @classmethod
    def normalize_ingredient(cls, value: str) -> str:
        return canonical_allergen(value)


class AllergyResponse(ORMModel):
    id: str
    ingredient: str = Field(min_length=1, max_length=100)


class PreferenceCreate(BaseModel):
    ingredient: str = Field(min_length=1, max_length=100)
    mode: str = Field(default="exclude", pattern="^(exclude|improve)$")


class PreferenceResponse(ORMModel):
    id: str
    ingredient: str = Field(min_length=1, max_length=100)
    mode: str


class ChildCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    birth_date: Optional[date] = None
    allergies: list[AllergyCreate] = []
    preferences: list[PreferenceCreate] = []


class ChildUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    birth_date: Optional[date] = None


class ChildResponse(ORMModel):
    id: str
    name: str = Field(min_length=1, max_length=100)
    birth_date: Optional[date] = None
    allergies: list[AllergyResponse] = []
    preferences: list[PreferenceResponse] = []


# --- 献立表（OCR） ---
class NurseryMenuCreate(BaseModel):
    date: date
    menu_text: str


class NurseryMenuUpdate(BaseModel):
    date: date
    menu_text: str


class NurseryMenuResponse(ORMModel):
    id: str
    date: date
    menu_text: str
    ingredients: dict


# --- AI 献立提案 ---
class GenerateRequest(BaseModel):
    child_id: str
    menu_date: date
    days: int = Field(default=1, ge=1, le=7)


class MealResponse(ORMModel):
    id: str
    date: date
    menu_text: str
    ingredients: dict


class GenerateResponse(BaseModel):
    meals: list[MealResponse]


# --- レシピマスタ ---
class Ingredient(BaseModel):
    components: list[Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]] = Field(default_factory=list, max_length=30)
    name: str
    quantity: str = ""
    unit: str = ""


class RecipeCreate(BaseModel):
    image_data: str | None = Field(default=None, max_length=2_800_000)
    name: str = Field(min_length=1, max_length=100)
    meal_type: str = Field(default="main", pattern="^(main|side|soup|staple)$")
    ingredients: list[Ingredient] = []
    instructions: str = ""
    cook_time_minutes: int | None = Field(default=None, ge=1)
    cuisine: str = Field(default="和", min_length=1, max_length=20)
    age_min_months: int = Field(default=12, ge=0, le=216)
    age_max_months: int = Field(default=72, ge=0, le=216)
    is_public: bool = False


class RecipeUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    meal_type: str | None = Field(default=None, pattern="^(main|side|soup|staple)$")
    ingredients: list[Ingredient] | None = None
    instructions: str | None = None
    cook_time_minutes: int | None = Field(default=None, ge=1)
    cuisine: str | None = Field(default=None, min_length=1, max_length=20)
    age_min_months: int | None = Field(default=None, ge=0, le=216)
    age_max_months: int | None = Field(default=None, ge=0, le=216)
    is_public: bool | None = None


class RecipeResponse(ORMModel):
    has_image: bool = False
    id: str
    name: str
    meal_type: str
    ingredients: list[Ingredient]
    instructions: str
    cook_time_minutes: int | None
    liked_count: int = 0
    cuisine: str = "和"
    age_min_months: int = 12
    age_max_months: int = 72
    source_name: str | None = None
    source_url: str | None = None
    servings_note: str | None = None
    child_notes: str | None = None
    is_official: bool = True
    is_public: bool = False
    is_favorite: bool = False


class RecipeSearchResponse(BaseModel):
    recipes: list[RecipeResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class LikeToggleRequest(BaseModel):
    meal_id: str
    recipe_id: str


class LikeToggleResponse(BaseModel):
    meal_id: str
    recipe_id: str
    liked: bool
    liked_count: int


class LikesSummary(BaseModel):
    """ユーザーの「喜んでた」状態。

    liked: 押されている (meal_id, recipe_id) の組
    counts: レシピID → 喜ばれた回数
    """

    liked: list[dict[str, str]]
    counts: dict[str, int]


# --- 買い物リスト ---
class ShoppingGenerateRequest(BaseModel):
    child_id: str
    meal_id: str


class ShoppingItemResponse(ORMModel):
    id: str
    name: str
    quantity: Optional[str] = None


class ShoppingListResponse(BaseModel):
    items: list[ShoppingItemResponse]
    generated_at: datetime
