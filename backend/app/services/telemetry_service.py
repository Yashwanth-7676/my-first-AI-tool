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

    @staticmethod
    async def get_user_analytics(
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> dict:
        """Comprehensive telemetry including model distribution, recent activity, and RAG stats."""
        # 1. Base Summary
        summary = await TelemetryService.get_user_total_usage(db, user_id)
        total_toks = summary["total_tokens"]

        # 2. Model Breakdown
        stmt_model = (
            select(
                UsageRecord.model,
                func.coalesce(func.sum(UsageRecord.tokens_prompt), 0),
                func.coalesce(func.sum(UsageRecord.tokens_completion), 0),
                func.count(UsageRecord.id),
            )
            .where(UsageRecord.user_id == user_id)
            .group_by(UsageRecord.model)
        )
        model_res = await db.execute(stmt_model)
        model_breakdown = []
        for model_name, p_tok, c_tok, reqs in model_res.all():
            m_total = p_tok + c_tok
            pct = round((m_total / total_toks * 100), 1) if total_toks > 0 else 0.0
            model_breakdown.append({
                "model": model_name,
                "prompt_tokens": p_tok,
                "completion_tokens": c_tok,
                "total_tokens": m_total,
                "requests": reqs,
                "percentage": pct,
            })

        # 3. Recent Activity (last 15 records)
        stmt_recent = (
            select(UsageRecord)
            .where(UsageRecord.user_id == user_id)
            .order_by(UsageRecord.timestamp.desc())
            .limit(15)
        )
        recent_res = await db.execute(stmt_recent)
        recent_activity = [
            {
                "id": str(r.id),
                "model": r.model,
                "endpoint": r.endpoint,
                "tokens_prompt": r.tokens_prompt,
                "tokens_completion": r.tokens_completion,
                "total_tokens": r.tokens_prompt + r.tokens_completion,
                "timestamp": r.timestamp.isoformat() if r.timestamp else "",
            }
            for r in recent_res.scalars().all()
        ]

        # 4. Knowledge Base Stats
        from app.models.entities import Document, DocumentChunk
        doc_count_res = await db.execute(select(func.count(Document.id)))
        chunk_count_res = await db.execute(select(func.count(DocumentChunk.id)))
        doc_count = doc_count_res.scalar() or 0
        chunk_count = chunk_count_res.scalar() or 0

        return {
            "summary": summary,
            "model_breakdown": model_breakdown,
            "recent_activity": recent_activity,
            "knowledge_stats": {
                "total_documents": doc_count,
                "total_chunks": chunk_count,
            },
        }
