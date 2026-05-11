from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database import Base


class MeritTrend(Base):
    __tablename__ = "merit_trends"
    __table_args__ = (UniqueConstraint("university_id", "year", name="uq_merit_university_year"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    university_id: Mapped[int] = mapped_column(ForeignKey("universities.id"), nullable=False, index=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    opening_merit: Mapped[float] = mapped_column(Float, nullable=False)
    closing_merit: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
