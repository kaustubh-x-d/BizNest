import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Numeric, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base_class import Base

class SavedReport(Base):
    __tablename__ = "saved_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False
    )
    title: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    latitude: Mapped[float] = mapped_column(
        nullable=False
    )
    longitude: Mapped[float] = mapped_column(
        nullable=False
    )
    business_type: Mapped[str] = mapped_column(
        String(100), 
        nullable=False
    )
    budget: Mapped[float] = mapped_column(
        Numeric(15, 2), 
        nullable=False
    )
    
    # Store score parameters and sub-scores
    score_breakdown: Mapped[dict] = mapped_column(
        JSONB, 
        nullable=False
    )
    
    # Store LLM generated pros/cons/suggestions
    recommendations: Mapped[dict] = mapped_column(
        JSONB, 
        nullable=False
    )
    
    # Store nearby competitors cached metadata list
    competitors_metadata: Mapped[dict] = mapped_column(
        JSONB, 
        nullable=False
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=datetime.utcnow
    )

    # Relationships
    user = relationship("User", back_populates="saved_reports")
