# Backend

FastAPI backend for the football data application.

## Responsibilities

- Expose REST endpoints for competitions, teams and matches.
- Connect to Supabase/PostgreSQL through SQLAlchemy.
- Run the Champions League pilot ingestion.
- Store ingestion logs.
- Keep scraping/ingestion logic isolated from API routes.

## Main files

- `app/main.py`: FastAPI app, CORS and route registration.
- `app/config.py`: environment-based settings.
- `app/database.py`: SQLAlchemy engine and session dependency.
- `app/api/`: REST route modules.
- `app/models/`: SQLAlchemy models matching the SQL scripts.
- `app/schemas/`: Pydantic response schemas.
- `app/services/`: business logic and database operations.
- `app/scrapers/`: scraper/source adapters.
- `app/utils/logger.py`: logging setup.
- `sql/`: Supabase/PostgreSQL scripts.
- `scripts/`: CLI helpers for ingestion/seed.

## Environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required:

```text
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_SUPABASE_HOST:5432/postgres
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_ANON_OR_SERVICE_ROLE_KEY
APP_ENV=development
LOG_LEVEL=INFO
ALLOWED_ORIGINS=http://localhost:3000
```

`SUPABASE_URL` and `SUPABASE_KEY` are placeholders for future use with the official Supabase client. The current persistence layer uses SQLAlchemy and `DATABASE_URL`.

## Install and run

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET /health`
- `GET /competitions`
- `GET /teams`
- `GET /matches`
- `GET /matches/upcoming`
- `GET /matches/recent`
- `GET /matches/by-date?match_date=YYYY-MM-DD`
- `GET /matches/by-competition/{competition_id}`
- `GET /matches/by-team/{team_id}`
- `POST /ingestion/champions-league/run`

## Run ingestion from terminal

```bash
cd backend
source venv/bin/activate
python scripts/run_champions_league_ingestion.py
```

## Ingestion rules

The pilot uses a simulated scraper. Real sources should be added as new adapters under `app/scrapers/` and must:

- Prefer official APIs or allowed public sources.
- Respect robots.txt and terms of use.
- Use delays and conservative request patterns.
- Emit normalized match dictionaries.
- Avoid duplicates through source IDs and match natural keys.
