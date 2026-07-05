import uuid
from datetime import datetime
from sqlalchemy import String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        index=True, 
        nullable=False
    )
    password_hash: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    full_name: Mapped[str] = mapped_column(
        String(100), 
        nullable=False
    )
    budget_tier: Mapped[str] = mapped_column(
        String(50), 
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=datetime.utcnow
    )

    # Relationships
    saved_reports = relationship("SavedReport", back_populates="user", cascade="all, delete-orphan")

