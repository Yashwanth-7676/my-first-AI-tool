import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import ALGORITHM
from app.models.entities import User
from app.schemas.auth import TokenData

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,
)


async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Validate bearer token or resolve default development user."""
    if token:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
            user_id_str: str = payload.get("sub")
            if user_id_str:
                user_id = uuid.UUID(user_id_str)
                stmt = select(User).where(User.id == user_id)
                result = await db.execute(stmt)
                user = result.scalar_one_or_none()
                if user:
                    return user
        except Exception:
            pass

    # Seamless development fallback: Find or create a demo user
    stmt = select(User).where(User.email == "demo@yashai.local")
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            id=uuid.uuid4(),
            email="demo@yashai.local",
            hashed_password="demo_password_hash",
        )
        db.add(user)
        try:
            await db.commit()
            await db.refresh(user)
        except Exception:
            await db.rollback()
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
    return user
