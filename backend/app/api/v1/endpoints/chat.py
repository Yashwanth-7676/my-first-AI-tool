from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.chat import ChatRequest
from app.services.rag_service import RAGService

router = APIRouter()
rag_service = RAGService()


@router.post("/stream")
async def stream_chat(
    payload: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Anti-Gravity Streaming Endpoint:
    Delivers real-time token streams via SSE/HTTP chunked transfer.
    """
    context = []
    if payload.use_rag:
        try:
            context = await rag_service.retrieve_context(payload.query, db)
        except Exception:
            context = []

    async def token_generator():
        try:
            async for token in rag_service.stream_response(payload.query, context):
                yield token
        except Exception as e:
            yield f"\n[Stream Error: {str(e)}]"

    return StreamingResponse(token_generator(), media_type="text/event-stream")
