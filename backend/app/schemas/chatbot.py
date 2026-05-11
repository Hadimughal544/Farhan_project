from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ChatbotMessageRequest(BaseModel):
    message: str = Field(min_length=2, max_length=500)


class ChatbotMessageResponse(BaseModel):
    reply: str
    source: str = Field(pattern="^(knowledge_base|refusal|not_found)$")
    timestamp: datetime


class ChatbotKnowledgeBaseCreate(BaseModel):
    question: str = Field(min_length=5, max_length=255)
    answer: str = Field(min_length=10, max_length=5000)
    category: str = Field(default="general", min_length=2, max_length=100)
    keywords: list[str] = Field(default_factory=list)
    is_active: bool = True
    display_order: int = Field(default=0, ge=0)


class ChatbotKnowledgeBaseUpdate(BaseModel):
    question: str | None = Field(default=None, min_length=5, max_length=255)
    answer: str | None = Field(default=None, min_length=10, max_length=5000)
    category: str | None = Field(default=None, min_length=2, max_length=100)
    keywords: list[str] | None = None
    is_active: bool | None = None
    display_order: int | None = Field(default=None, ge=0)


class ChatbotKnowledgeBaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question: str
    answer: str
    category: str
    keywords: list[str]
    is_active: bool
    display_order: int
    created_at: datetime
    updated_at: datetime
