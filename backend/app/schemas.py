"""Pydantic スキーマ定義。"""

import re
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

# パスワード強度チェック: 8文字以上・英字・数字を含む
_PASSWORD_RE = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).{8,}$")


def validate_password_strength(value: str) -> str:
    if not _PASSWORD_RE.match(value):
        raise ValueError("パスワードは8文字以上で、英字と数字をそれぞれ1文字以上含めてください")
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
    password: str = Field(min_length=8)

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
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(ORMModel):
    id: str
    username: str


class UserUpdate(BaseModel):
    username: Optional[str] = Field(default=None, min_length=1, max_length=30)
    password: Optional[str] = Field(default=None, min_length=8)

    @field_validator("username")
    @classmethod
    def check_username(cls, v: Optional[str]) -> Optional[str]:
        return validate_username(v) if v is not None else v

    @field_validator("password")
    @classmethod
    def check_password(cls, v: str) -> str:
        return validate_password_strength(v)


# --- お子様 ---
class AllergyCreate(BaseModel):
    ingredient: str


class AllergyResponse(ORMModel):
    id: str
    ingredient: str


class PreferenceCreate(BaseModel):
    ingredient: str
    mode: str = "exclude"


class PreferenceResponse(ORMModel):
    id: str
    ingredient: str
    mode: str


class ChildCreate(BaseModel):
    name: str
    birth_date: Optional[date] = None
    allergies: list[AllergyCreate] = []
    preferences: list[PreferenceCreate] = []


class ChildUpdate(BaseModel):
    name: Optional[str] = None
    birth_date: Optional[date] = None


class ChildResponse(ORMModel):
    id: str
    name: str
    birth_date: Optional[date] = None
    allergies: list[AllergyResponse] = []
    preferences: list[PreferenceResponse] = []


# --- 献立表（OCR） ---
class NurseryMenuCreate(BaseModel):
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
    name: str
    quantity: str = ""
    unit: str = ""


class RecipeCreate(BaseModel):
    name: str
    meal_type: str = "main"
    ingredients: list[Ingredient] = []
    instructions: str = ""
    cook_time_minutes: int | None = Field(default=None, ge=1)


class RecipeUpdate(BaseModel):
    name: str | None = None
    meal_type: str | None = None
    ingredients: list[Ingredient] | None = None
    instructions: str | None = None
    cook_time_minutes: int | None = Field(default=None, ge=1)


class RecipeResponse(ORMModel):
    id: str
    name: str
    meal_type: str
    ingredients: list[Ingredient]
    instructions: str
    cook_time_minutes: int | None
    liked_count: int = 0


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
