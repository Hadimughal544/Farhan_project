from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database import Base


class SavedUniversity(Base):
    __tablename__ = "saved_universities"
    __table_args__ = (UniqueConstraint("user_id", "university_id", name="uq_saved_user_university"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    university_id: Mapped[int] = mapped_column(ForeignKey("universities.id"), nullable=False, index=True)
    note: Mapped[str] = mapped_column(String(300), nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
