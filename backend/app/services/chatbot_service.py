from datetime import datetime, timezone
from difflib import SequenceMatcher
import re

from sqlalchemy.orm import Session

from app.models.chatbot_kb_entry import ChatbotKnowledgeEntry
from app.schemas.chatbot import (
    ChatbotKnowledgeBaseCreate,
    ChatbotKnowledgeBaseUpdate,
)


class ChatbotService:
    OUT_OF_SCOPE_REPLY = (
        "I'm designed specifically to assist with this platform and its university assessment features. "
        "Please ask questions related to the website or your assessment process."
    )
    NOT_FOUND_REPLY = (
        "I couldn't find the requested information in the current platform resources. "
        "Please contact the administrator or support team for further assistance."
    )

    DEFAULT_ENTRIES = [
        {
            "question": "How does the assessment work?",
            "answer": (
                "Go to Eligibility assessment from the dashboard, provide your academic details, budget, "
                "program interest, and university preferences, then submit. The platform evaluates your profile "
                "and generates recommendation matches."
            ),
            "category": "assessment",
            "keywords": ["assessment", "eligibility", "predict", "prediction", "workflow", "process"],
            "display_order": 1,
        },
        {
            "question": "How are universities recommended?",
            "answer": (
                "Recommendations are produced from your submitted profile inputs and the platform's institutional "
                "dataset. Matching considers merit, budget alignment, program availability, and selected preferences."
            ),
            "category": "recommendations",
            "keywords": ["recommend", "recommendation", "match", "strong match", "university", "shortlist"],
            "display_order": 2,
        },
        {
            "question": "How can I update my profile?",
            "answer": (
                "Open Profile from the navigation menu, edit your personal details, and save your changes. "
                "Updates are applied to your account immediately after successful submission."
            ),
            "category": "account",
            "keywords": ["profile", "update", "account", "edit profile"],
            "display_order": 3,
        },
        {
            "question": "How do I change my password?",
            "answer": (
                "Use the profile/account settings options available in the platform. If password controls are not "
                "visible for your account, contact support or an administrator for a secure reset."
            ),
            "category": "auth",
            "keywords": ["password", "reset", "login", "authentication", "change password"],
            "display_order": 4,
        },
        {
            "question": "What does Strong Match mean?",
            "answer": (
                "Strong Match indicates that your submitted profile aligns well with a university's expected merit, "
                "program criteria, and budget range in the current dataset."
            ),
            "category": "recommendations",
            "keywords": ["strong match", "match level", "confidence", "recommendation score"],
            "display_order": 5,
        },
        {
            "question": "How do I contact support?",
            "answer": (
                "Please use the platform's support or administrator contact channel available in your organization. "
                "If needed, an admin can assist with account access and platform-specific issues."
            ),
            "category": "support",
            "keywords": ["support", "help", "contact", "administrator", "admin"],
            "display_order": 6,
        },
    ]

    WEBSITE_SCOPE_KEYWORDS = {
        "website",
        "platform",
        "dashboard",
        "profile",
        "account",
        "login",
        "register",
        "password",
        "authentication",
        "assessment",
        "eligibility",
        "prediction",
        "recommendation",
        "recommend",
        "university",
        "universities",
        "match",
        "strong",
        "admin",
        "administration",
        "catalog",
        "feature",
        "features",
        "navigation",
        "support",
        "futurecampus",
        "advisor",
    }

    @staticmethod
    def _normalize_text(value: str) -> str:
        normalized = value.lower().strip()
        normalized = re.sub(r"[^a-z0-9\s]", " ", normalized)
        return re.sub(r"\s+", " ", normalized)

    @staticmethod
    def _tokenize(value: str) -> set[str]:
        normalized = ChatbotService._normalize_text(value)
        return {token for token in normalized.split(" ") if token}

    @staticmethod
    def _keywords_to_csv(keywords: list[str]) -> str:
        cleaned = []
        seen = set()
        for keyword in keywords:
            item = ChatbotService._normalize_text(keyword)
            if not item or item in seen:
                continue
            seen.add(item)
            cleaned.append(item)
        return ", ".join(cleaned)

    @staticmethod
    def _csv_to_keywords(value: str) -> list[str]:
        if not value:
            return []
        return [k.strip() for k in value.split(",") if k.strip()]

    @staticmethod
    def _is_in_scope(user_message: str) -> bool:
        message_tokens = ChatbotService._tokenize(user_message)
        if not message_tokens:
            return False
        if message_tokens.intersection(ChatbotService.WEBSITE_SCOPE_KEYWORDS):
            return True

        # Keep scope strict: allow only UI/workflow style intents when paired with platform language.
        phrase_hints = [
            "how do i",
            "where can i",
            "can i",
            "in this platform",
            "on this website",
            "in dashboard",
            "in profile",
        ]
        normalized = ChatbotService._normalize_text(user_message)
        return any(phrase in normalized for phrase in phrase_hints)

    @staticmethod
    def _score_entry(message: str, entry: ChatbotKnowledgeEntry) -> float:
        normalized_message = ChatbotService._normalize_text(message)
        message_tokens = ChatbotService._tokenize(message)

        question_text = ChatbotService._normalize_text(entry.question)
        keyword_tokens = set(ChatbotService._csv_to_keywords(entry.keywords))

        overlap = len(message_tokens.intersection(keyword_tokens))
        overlap_score = overlap / max(len(keyword_tokens), 1)

        question_similarity = SequenceMatcher(None, normalized_message, question_text).ratio()

        # Weighted blend: keywords dominate to keep responses deterministic and controlled.
        return (overlap_score * 0.7) + (question_similarity * 0.3)

    @staticmethod
    def ensure_default_entries(db: Session) -> None:
        has_entries = db.query(ChatbotKnowledgeEntry.id).first() is not None
        if has_entries:
            return

        for item in ChatbotService.DEFAULT_ENTRIES:
            db.add(
                ChatbotKnowledgeEntry(
                    question=item["question"],
                    answer=item["answer"],
                    category=item["category"],
                    keywords=ChatbotService._keywords_to_csv(item["keywords"]),
                    is_active=True,
                    display_order=item["display_order"],
                )
            )
        db.commit()

    @staticmethod
    def ask(db: Session, message: str) -> tuple[str, str]:
        ChatbotService.ensure_default_entries(db)

        if not ChatbotService._is_in_scope(message):
            return ChatbotService.OUT_OF_SCOPE_REPLY, "refusal"

        entries = (
            db.query(ChatbotKnowledgeEntry)
            .filter(ChatbotKnowledgeEntry.is_active == True)
            .order_by(ChatbotKnowledgeEntry.display_order.asc(), ChatbotKnowledgeEntry.updated_at.desc())
            .all()
        )

        if not entries:
            return ChatbotService.NOT_FOUND_REPLY, "not_found"

        scored = [(ChatbotService._score_entry(message, entry), entry) for entry in entries]
        scored.sort(key=lambda item: item[0], reverse=True)
        best_score, best_entry = scored[0]

        # High confidence threshold prevents hallucinations and enforces controlled responses.
        if best_score < 0.18:
            return ChatbotService.NOT_FOUND_REPLY, "not_found"

        return best_entry.answer, "knowledge_base"

    @staticmethod
    def list_entries(db: Session) -> list[ChatbotKnowledgeEntry]:
        ChatbotService.ensure_default_entries(db)
        return (
            db.query(ChatbotKnowledgeEntry)
            .order_by(ChatbotKnowledgeEntry.display_order.asc(), ChatbotKnowledgeEntry.updated_at.desc())
            .all()
        )

    @staticmethod
    def create_entry(db: Session, payload: ChatbotKnowledgeBaseCreate) -> ChatbotKnowledgeEntry:
        entry = ChatbotKnowledgeEntry(
            question=payload.question.strip(),
            answer=payload.answer.strip(),
            category=payload.category.strip().lower(),
            keywords=ChatbotService._keywords_to_csv(payload.keywords),
            is_active=payload.is_active,
            display_order=payload.display_order,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

    @staticmethod
    def update_entry(db: Session, entry_id: int, payload: ChatbotKnowledgeBaseUpdate) -> ChatbotKnowledgeEntry | None:
        entry = db.query(ChatbotKnowledgeEntry).filter(ChatbotKnowledgeEntry.id == entry_id).first()
        if not entry:
            return None

        if payload.question is not None:
            entry.question = payload.question.strip()
        if payload.answer is not None:
            entry.answer = payload.answer.strip()
        if payload.category is not None:
            entry.category = payload.category.strip().lower()
        if payload.keywords is not None:
            entry.keywords = ChatbotService._keywords_to_csv(payload.keywords)
        if payload.is_active is not None:
            entry.is_active = payload.is_active
        if payload.display_order is not None:
            entry.display_order = payload.display_order

        db.commit()
        db.refresh(entry)
        return entry

    @staticmethod
    def delete_entry(db: Session, entry_id: int) -> bool:
        entry = db.query(ChatbotKnowledgeEntry).filter(ChatbotKnowledgeEntry.id == entry_id).first()
        if not entry:
            return False
        db.delete(entry)
        db.commit()
        return True

    @staticmethod
    def serialize_entry(entry: ChatbotKnowledgeEntry) -> dict:
        return {
            "id": entry.id,
            "question": entry.question,
            "answer": entry.answer,
            "category": entry.category,
            "keywords": ChatbotService._csv_to_keywords(entry.keywords),
            "is_active": entry.is_active,
            "display_order": entry.display_order,
            "created_at": entry.created_at,
            "updated_at": entry.updated_at,
        }

    @staticmethod
    def response_timestamp() -> datetime:
        return datetime.now(timezone.utc)
