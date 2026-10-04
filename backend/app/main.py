from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import engine, Base
from app.models.entities import User, Document, DocumentChunk
from app.models.usage import UsageRecord


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure vector extension if on Postgres, then create tables
    async with engine.begin() as conn:
        if not settings.USE_SQLITE:
            try:
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            except Exception:
                pass
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown: Clean up connection pools
    await engine.dispose()



app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["system"])
async def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME, "env": settings.ENV}
