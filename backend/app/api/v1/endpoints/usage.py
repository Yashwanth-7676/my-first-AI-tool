from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.entities import User
from app.services.telemetry_service import TelemetryService

router = APIRouter()


class UsageSummaryResponse(BaseModel):
    total_prompt_tokens: int
    total_completion_tokens: int
    total_tokens: int
    total_requests: int


class ModelUsageItem(BaseModel):
    model: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    requests: int
    percentage: float


class RecentActivityItem(BaseModel):
    id: str
    model: str
    endpoint: str
    tokens_prompt: int
    tokens_completion: int
    total_tokens: int
    timestamp: str


class KnowledgeStats(BaseModel):
    total_documents: int
    total_chunks: int


class UsageAnalyticsResponse(BaseModel):
    summary: UsageSummaryResponse
    model_breakdown: list[ModelUsageItem]
    recent_activity: list[RecentActivityItem]
    knowledge_stats: KnowledgeStats


@router.get("/summary", response_model=UsageSummaryResponse)
async def get_usage_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve token metrics and request analytics for the authenticated user."""
    summary = await TelemetryService.get_user_total_usage(db, current_user.id)
    return summary


@router.get("/analytics", response_model=UsageAnalyticsResponse)
async def get_usage_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve deep telemetry analytics including model breakdowns and recent logs."""
    return await TelemetryService.get_user_analytics(db, current_user.id)

