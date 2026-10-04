import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Uuid
from sqlalchemy.orm import relationship

from app.core.database import Base


class UsageRecord(Base):
    __tablename__ = "usage_records"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    tokens_prompt = Column(Integer, default=0, nullable=False)
    tokens_completion = Column(Integer, default=0, nullable=False)
    model = Column(String(100), nullable=False)
    endpoint = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="usage_records")
