from fastapi import APIRouter

<<<<<<< HEAD
from app.api.routes import auth, users, routes, vehicles, bins, monitoring, planning
=======
from app.api.routes import auth, users, routes, vehicles, bins, monitoring, classification, alerts
>>>>>>> e05bea7aef8ef434e2efc3228d4368b0a9f9e4e4

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(users.router, prefix="/admin")
api_router.include_router(routes.router)
api_router.include_router(vehicles.router)
api_router.include_router(bins.router)
api_router.include_router(monitoring.router)
<<<<<<< HEAD
api_router.include_router(planning.router)
=======
api_router.include_router(classification.router)
api_router.include_router(alerts.router)
>>>>>>> e05bea7aef8ef434e2efc3228d4368b0a9f9e4e4
