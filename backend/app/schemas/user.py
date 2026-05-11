from datetime import datetime
from typing import Dict, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    gender: str | None = Field(default="unspecified", description="Optional gender used for avatar seed")


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    role: str
    gender: str | None
    avatar_url: str | None
    created_at: datetime


class UserProfileUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class AdmissionPredictionRequest(BaseModel):
    matric_pct: float = Field(ge=0, le=100)
    inter_pct: float = Field(ge=0, le=100)
    entry_test_score: float = Field(ge=0, le=100)
    eligibility_score: Optional[float] = Field(default=None, ge=0, le=100)
    budget: float = Field(ge=0)
    program: str
    university_tier: int = Field(ge=1, le=3)
    university_type: str


class AdmissionPredictionResponse(BaseModel):
    prediction: str
    confidence: float = Field(ge=0, le=1)
    chance_percent: float = Field(ge=0, le=100, description="Model probability for the predicted class (0–100%)")
    chance_breakdown: Dict[str, float] = Field(
        default_factory=dict,
        description="Per-class model probabilities as percentages (keys e.g. High, Medium, Low)",
    )
    input_data: dict


class AdminUserRoleUpdate(BaseModel):
    role: str = Field(pattern="^(admin|student)$")


class AdminBulkEmailRequest(BaseModel):
    send_to: str = Field(default="all", pattern="^(all|selected)$")
    user_ids: list[int] = Field(default_factory=list)
    subject: str = Field(min_length=2, max_length=180)
    body: str = Field(min_length=3, max_length=20000)


class AdminBulkEmailResponse(BaseModel):
    recipients: int
    subject: str
    skipped_users: int = 0
