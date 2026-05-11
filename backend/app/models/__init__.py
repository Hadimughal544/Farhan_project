from app.models.user import User
from app.models.chatbot_kb_entry import ChatbotKnowledgeEntry
from app.models.merit_trend import MeritTrend
from app.models.prediction_history import PredictionHistory
from app.models.saved_university import SavedUniversity
from app.models.university import University

__all__ = [
	"User",
	"ChatbotKnowledgeEntry",
	"University",
	"PredictionHistory",
	"SavedUniversity",
	"MeritTrend",
]
