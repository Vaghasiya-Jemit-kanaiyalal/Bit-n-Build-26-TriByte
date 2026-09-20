from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

# Configure async engine with fallback
db_url = settings.DATABASE_URL

try:
    if "sqlite" in db_url:
        engine = create_async_engine(db_url, echo=False, future=True)
    else:
        engine = create_async_engine(
            db_url,
            echo=(settings.ENVIRONMENT == "debug"),
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            future=True,
        )
except Exception:
    engine = create_async_engine("sqlite+aiosqlite:///./test.db", echo=False, future=True)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an AsyncSession with managed transaction lifecycle."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
