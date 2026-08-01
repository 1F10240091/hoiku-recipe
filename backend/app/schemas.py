"""Pydantic スキーマ定義。"""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --- 認証 ---
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    display_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(ORMModel):
    id: str
    email: EmailStr
    display_name: Optional[str] = None


# --- お子様 ---
class AllergyCreate(BaseModel):
    ingredient: str


class PreferenceCreate(BaseModel):
    ingredient: str
    mode: str = "exclude"


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
    allergies: list[AllergyCreate] = []
    preferences: list[PreferenceCreate] = []


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


class RecipeResponse(ORMModel):
    id: str
    date: date
    menu_text: str
    ingredients: dict


class GenerateResponse(BaseModel):
    meals: list[RecipeResponse]


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
