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
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-YOUR_REGION.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_ANON_OR_SERVICE_ROLE_KEY
APP_ENV=development
LOG_LEVEL=INFO
ALLOWED_ORIGINS=http://localhost:3000
```

For WSL, use the Supabase Session Pooler connection string in `DATABASE_URL`:

```text
DATABASE_URL=postgresql://postgres.fdnyhwywhrpuhfwfhalj:YOUR_REAL_PASSWORD@aws-0-YOUR_REGION.pooler.supabase.com:5432/postgres
```

`SUPABASE_URL` is not the database connection string. It is the Supabase API URL:

```text
SUPABASE_URL=https://fdnyhwywhrpuhfwfhalj.supabase.co
```

No local PostgreSQL database is required when using Supabase.

If `/health` shows `Network is unreachable` with an IPv6 address, the direct connection is not reachable from WSL. Replace `DATABASE_URL` with the Session Pooler connection string from Supabase Dashboard > Connect > Connection pooling.

`SUPABASE_URL` and `SUPABASE_KEY` are placeholders for future use with the official Supabase client. The current persistence layer uses SQLAlchemy and `DATABASE_URL`.

## Install and run

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

## WSL Python troubleshooting

If WSL shows `pyenv: python: command not found`, pyenv has Python installed but no local/global version selected.

Use:

```bash
pyenv local 3.13.0
python --version
python -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

If you are not using pyenv and `venv` support is missing:

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip python3-full
python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Do not run plain `pip install -r requirements.txt` before activating the virtual environment. Ubuntu blocks system-level pip installs with an `externally-managed-environment` error.

## Endpoints

- `GET /`
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

## Current local validation

The backend has been validated from WSL with Supabase:

- `GET /health` returns `database.configured=true`.
- `GET /health` returns `database.connected=true`.
- The direct Supabase IPv6 connection failed from WSL, so the working setup uses Supabase Session Pooler in `DATABASE_URL`.
- The Champions League mock ingestion has inserted pilot data into Supabase.

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
