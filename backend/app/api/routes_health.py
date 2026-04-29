from fastapi import APIRouter
from sqlalchemy import text

from app.database import engine


router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict:
    database = {"configured": engine is not None, "connected": False}
    if engine is not None:
        try:
            with engine.connect() as connection:
                connection.execute(text("select 1"))
            database["connected"] = True
        except Exception as exc:
            database["error"] = str(exc)

    return {
        "status": "ok",
        "service": "football-data-api",
        "database": database,
    }

