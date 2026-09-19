from fastapi import APIRouter

from app.api.routes import (
    alerts,
    auth,
    bins,
    classification,
    monitoring,
    planning,
    routes,
    settings,
    users,
    vehicles,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(users.router, prefix="/admin")
api_router.include_router(routes.router)
api_router.include_router(vehicles.router)
api_router.include_router(bins.router)
api_router.include_router(monitoring.router)
api_router.include_router(planning.router)
api_router.include_router(classification.router)
api_router.include_router(alerts.router)
api_router.include_router(settings.router)
