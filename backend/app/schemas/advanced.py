from datetime import datetime

from pydantic import BaseModel, Field


class ScholarshipRecommendationRequest(BaseModel):
    marks: float = Field(ge=0, le=100)
    income_range: str
    city: str
    degree_preference: str


class ScholarshipRecommendationResponse(BaseModel):
    title: str
    category: str
    reason: str


class CareerRecommendationRequest(BaseModel):
    interests: dict[str, int] = Field(default_factory=dict, description="Map of domain to score out of 10")
    skills: dict[str, int] = Field(default_factory=dict, description="Map of skill to score out of 10")
    personality: str = "balanced"


class CareerRecommendationResponse(BaseModel):
    best_degree: str
    future_scope: str
    expected_salary_pkr: str
    required_skills: list[str]


class RoadmapRequest(BaseModel):
    degree: str
    current_semester: int = Field(ge=1, le=8)


class RoadmapResponse(BaseModel):
    degree: str
    semester_roadmap: list[str]
    skills_roadmap: list[str]
    certifications: list[str]
    internship_guidance: list[str]


class SaveUniversityRequest(BaseModel):
    university_id: int
    note: str = ""


class SavedUniversityResponse(BaseModel):
    id: int
    university_id: int
    note: str
    created_at: datetime
    university_name: str


class MeritTrendCreate(BaseModel):
    university_id: int
    year: int = Field(ge=2000, le=2100)
    opening_merit: float = Field(ge=0, le=100)
    closing_merit: float = Field(ge=0, le=100)


class MeritTrendResponse(BaseModel):
    id: int
    university_id: int
    university_name: str
    year: int
    opening_merit: float
    closing_merit: float
