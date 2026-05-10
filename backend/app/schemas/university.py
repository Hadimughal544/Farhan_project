from typing import List
from pydantic import BaseModel, Field


class UniversityCreate(BaseModel):
    name: str = Field(min_length=2)
    city: str = Field(min_length=2)
    programs: List[str]
    min_fee: float = Field(ge=0)
    max_fee: float = Field(ge=0)
    merit: float = Field(ge=1, le=100)
    type: str
    tier: int = Field(ge=1, le=3)
    is_scholarships: bool = False
    is_admission_open: bool = True


class UniversityUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2)
    city: str | None = Field(default=None, min_length=2)
    programs: List[str] | None = None
    min_fee: float | None = Field(default=None, ge=0)
    max_fee: float | None = Field(default=None, ge=0)
    merit: float | None = Field(default=None, ge=1, le=100)
    type: str | None = None
    tier: int | None = Field(default=None, ge=1, le=3)
    is_scholarships: bool | None = None
    is_admission_open: bool | None = None


class UniversityResponse(BaseModel):
    id: int
    name: str
    city: str
    programs: List[str]
    min_fee: float
    max_fee: float
    merit: float
    type: str
    tier: int
    is_scholarships: bool
    is_admission_open: bool

    class Config:
        orm_mode = True
