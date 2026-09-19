import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.router import api_router
from app.core.config import settings
from app.db.database import engine

# Setup logging
logging.basicConfig(
    level=logging.INFO if settings.ENVIRONMENT != "debug" else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("wastewise")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context for startup and shutdown management."""
    logger.info("Starting up WasteWise AI Backend API...")
    yield
    logger.info("Shutting down WasteWise AI Backend API...")
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description=(
        "WasteWise AI - AI-Powered Waste Management & Recycling Optimizer.\n\n"
        "Backend authentication and role-based access control service.\n\n"
        "**Supported Roles:**\n"
        "- `ADMIN`: Waste Manager / System Admin\n"
        "- `DRIVER`: Driver / Field Worker\n"
        "- `ANALYST`: Analyst / Supervisor\n"
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=getattr(exc, "headers", None),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Format clean, safe validation error messages
    error_messages = []
    for error in exc.errors():
        field = " -> ".join([str(loc) for loc in error.get("loc", [])])
        msg = error.get("msg")
        error_messages.append(f"{field}: {msg}")

    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "errors": error_messages,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server error: {exc}")
    # Never leak raw stack traces or internal DB credentials
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )


# Health Check Endpoints
@app.get(
    "/health",
    tags=["System"],
    summary="Health check",
    description="Basic service liveness probe.",
)
async def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
    }


@app.get(
    "/health/db",
    tags=["System"],
    summary="Database health check",
    description="Verifies asynchronous connectivity to PostgreSQL.",
)
async def health_check_db():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "database": "disconnected", "detail": "Database connection unavailable"},
        )


# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)
