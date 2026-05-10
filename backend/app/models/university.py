from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class University(Base):
    __tablename__ = "universities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    programs: Mapped[str] = mapped_column(String(1000), nullable=False)  # comma-separated values
    min_fee: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    max_fee: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    merit: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # Government / Private
    tier: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    is_scholarships: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_admission_open: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
