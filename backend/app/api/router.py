from fastapi import APIRouter

from app.api.routes import auth, users, routes, vehicles, bins, monitoring, planning, classification, alerts

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
