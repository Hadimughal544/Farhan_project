from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.chatbot import (
    ChatbotKnowledgeBaseCreate,
    ChatbotKnowledgeBaseResponse,
    ChatbotKnowledgeBaseUpdate,
    ChatbotMessageRequest,
    ChatbotMessageResponse,
)
from app.services.chatbot_service import ChatbotService

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/message", response_model=ChatbotMessageResponse)
def chatbot_message(payload: ChatbotMessageRequest, db: Session = Depends(get_db)):
    reply, source = ChatbotService.ask(db, payload.message)
    return {
        "reply": reply,
        "source": source,
        "timestamp": ChatbotService.response_timestamp(),
    }


@router.get("/knowledge-base", response_model=list[ChatbotKnowledgeBaseResponse])
def list_knowledge_base(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")

    entries = ChatbotService.list_entries(db)
    return [ChatbotService.serialize_entry(entry) for entry in entries]


@router.post("/knowledge-base", response_model=ChatbotKnowledgeBaseResponse, status_code=status.HTTP_201_CREATED)
def create_knowledge_base_entry(
    payload: ChatbotKnowledgeBaseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")

    entry = ChatbotService.create_entry(db, payload)
    return ChatbotService.serialize_entry(entry)


@router.put("/knowledge-base/{entry_id}", response_model=ChatbotKnowledgeBaseResponse)
def update_knowledge_base_entry(
    entry_id: int,
    payload: ChatbotKnowledgeBaseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")

    entry = ChatbotService.update_entry(db, entry_id, payload)
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge entry not found")
    return ChatbotService.serialize_entry(entry)


@router.delete("/knowledge-base/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_knowledge_base_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")

    deleted = ChatbotService.delete_entry(db, entry_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge entry not found")
