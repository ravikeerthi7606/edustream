from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime


class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Literal["student", "teacher"]


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Literal["student", "teacher"]


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class VideoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = ""
    subject: Optional[str] = ""


class VideoOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    subject: Optional[str]
    filename: str
    file_size: int
    duration: Optional[float]
    teacher_id: str
    teacher_name: str
    views: int
    created_at: datetime
    thumbnail_url: Optional[str] = None
    video_url: str


class PaginatedVideos(BaseModel):
    videos: list[VideoOut]
    total: int
    page: int
    per_page: int
    total_pages: int