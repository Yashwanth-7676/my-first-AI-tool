import uuid
from typing import List
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import Document, DocumentChunk
from app.services.rag_service import RAGService


class IngestionService:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200) -> None:
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", " ", ""],
        )
        self.rag_service = RAGService()

    async def ingest_document(
        self,
        db: AsyncSession,
        owner_id: uuid.UUID,
        title: str,
        raw_text: str,
    ) -> Document:
        """
        Chunks raw text, generates embeddings, and persists atomically
        into PostgreSQL with pgvector.
        """
        # 1. Create parent Document record
        document = Document(
            id=uuid.uuid4(),
            owner_id=owner_id,
            title=title,
        )
        db.add(document)
        await db.flush()  # Obtain document.id for chunks

        # 2. Chunk text
        chunks = self.splitter.split_text(raw_text)
        if not chunks:
            await db.commit()
            return document

        # 3. Generate embeddings concurrently
        embeddings_list = await self.rag_service.embeddings.aembed_documents(chunks)

        # 4. Create chunk records
        chunk_models = [
            DocumentChunk(
                id=uuid.uuid4(),
                document_id=document.id,
                content=chunk_text,
                chunk_index=i,
                embedding=embeddings_list[i],
            )
            for i, chunk_text in enumerate(chunks)
        ]
        db.add_all(chunk_models)
        await db.commit()
        await db.refresh(document)

        return document
