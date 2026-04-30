from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    username: str
    email: str | None = None
    password: str
    role: Literal["admin", "user"] = "user"

    @field_validator("username")
    @classmethod
    def username_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("username cannot be empty")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("password must be at least 6 characters")
        return v


class UserUpdate(BaseModel):
    email: str | None = None
    password: str | None = None
    role: Literal["admin", "user"] | None = None
    is_active: bool | None = None
    avatar_url: str | None = None


class UserRead(BaseModel):
    id: int
    username: str
    email: str | None
    role: str
    is_active: bool
    avatar_url: str | None = None
    created_at: datetime
    updated_at: datetime
