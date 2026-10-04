from typing import Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, description="User prompt or query")
    use_rag: bool = Field(default=True, description="Enable pgvector context retrieval")


class HealthResponse(BaseModel):
    status: str
    service: str
