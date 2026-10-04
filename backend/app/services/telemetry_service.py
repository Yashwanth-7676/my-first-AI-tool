import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.usage import UsageRecord


class TelemetryService:
    @staticmethod
    async def log_usage(
        db: AsyncSession,
        user_id: uuid.UUID,
        tokens_prompt: int,
        tokens_completion: int,
        model: str,
        endpoint: str,
    ) -> UsageRecord:
        """Persist token consumption metrics."""
        record = UsageRecord(
            user_id=user_id,
            tokens_prompt=tokens_prompt,
            tokens_completion=tokens_completion,
            model=model,
            endpoint=endpoint,
        )
        db.add(record)
        await db.commit()
        return record

    @staticmethod
    async def get_user_total_usage(
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> dict:
        """Calculate aggregate token consumption for a user."""
        stmt = (
            select(
                func.coalesce(func.sum(UsageRecord.tokens_prompt), 0),
                func.coalesce(func.sum(UsageRecord.tokens_completion), 0),
                func.count(UsageRecord.id),
            )
            .where(UsageRecord.user_id == user_id)
        )
        result = await db.execute(stmt)
        prompt_tokens, completion_tokens, request_count = result.one()
        return {
            "total_prompt_tokens": prompt_tokens,
            "total_completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
            "total_requests": request_count,
        }
