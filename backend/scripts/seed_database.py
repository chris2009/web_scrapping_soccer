from app.database import SessionLocal
from app.services.ingestion_service import IngestionService


def main() -> None:
    if SessionLocal is None:
        raise RuntimeError("DATABASE_URL is not configured")

    db = SessionLocal()
    try:
        result = IngestionService(db).run_champions_league_ingestion()
        print(f"Seed completed: {result}")
    finally:
        db.close()


if __name__ == "__main__":
    main()

