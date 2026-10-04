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


@router.get("/summary", response_model=UsageSummaryResponse)
async def get_usage_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve token metrics and request analytics for the authenticated user."""
    summary = await TelemetryService.get_user_total_usage(db, current_user.id)
    return summary
