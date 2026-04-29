from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes_competitions import router as competitions_router
from app.api.routes_health import router as health_router
from app.api.routes_ingestion import router as ingestion_router
from app.api.routes_matches import router as matches_router
from app.api.routes_teams import router as teams_router
from app.config import get_settings
from app.utils.logger import configure_logging, get_logger


configure_logging()
settings = get_settings()
logger = get_logger(__name__)

app = FastAPI(
    title="Football Data API",
    description="API for collecting, normalizing, storing and visualizing football match data.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["root"])
def root() -> dict:
    return {
        "service": "football-data-api",
        "status": "running",
        "health": "/health",
        "docs": "/docs",
        "openapi": "/openapi.json",
    }


@app.exception_handler(RuntimeError)
async def runtime_error_handler(_: Request, exc: RuntimeError):
    logger.error("Runtime error: %s", exc)
    return JSONResponse(status_code=503, content={"detail": str(exc)})


app.include_router(health_router)
app.include_router(competitions_router)
app.include_router(teams_router)
app.include_router(matches_router)
app.include_router(ingestion_router)
