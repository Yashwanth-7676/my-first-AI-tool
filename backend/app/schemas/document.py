import uuid
from pydantic import BaseModel, Field


class DocumentCreateText(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)


class DocumentResponse(BaseModel):
    id: uuid.UUID
    title: str

    class Config:
        from_attributes = True
