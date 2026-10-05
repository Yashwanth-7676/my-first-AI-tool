import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.entities import Document, User
from app.schemas.document import DocumentCreateText, DocumentResponse
from app.services.ingestion_service import IngestionService

router = APIRouter()
ingestion_service = IngestionService()


async def get_mock_user(db: AsyncSession) -> User:
    """Helper for testing: fetches or creates a baseline user."""
    stmt = select(User).limit(1)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            id=uuid.uuid4(),
            email="demo@yashai.dev",
            hashed_password="mock_hashed_secret",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user


@router.get("/", response_model=List[DocumentResponse])
async def list_documents(db: AsyncSession = Depends(get_db)):
    """Retrieve all indexed documents."""
    stmt = select(Document).order_by(Document.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/text", response_model=DocumentResponse)
async def upload_text_document(
    payload: DocumentCreateText,
    db: AsyncSession = Depends(get_db),
):
    """Ingest and vectorize a raw text document directly."""
    user = await get_mock_user(db)
    document = await ingestion_service.ingest_document(
        db=db,
        owner_id=user.id,
        title=payload.title,
        raw_text=payload.content,
    )
    return document


@router.post("/file", response_model=DocumentResponse)
async def upload_file_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Ingest plain text or markdown files."""
    user = await get_mock_user(db)
    content_bytes = await file.read()
    try:
        raw_text = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Only UTF-8 encoded text/markdown files are currently supported.")

    document = await ingestion_service.ingest_document(
        db=db,
        owner_id=user.id,
        title=file.filename or "Untitled Document",
        raw_text=raw_text,
    )
    return document


@router.delete("/{document_id}")
async def delete_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Delete an indexed document and its associated vector chunks."""
    stmt = select(Document).where(Document.id == document_id)
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(doc)
    await db.commit()
    return {"status": "success", "message": f"Document {document_id} deleted"}

