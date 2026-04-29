# Football Data App — Claude Context

## Stack

- **Backend**: Python 3.13, FastAPI, SQLAlchemy 2, uvicorn
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS (App Router)
- **Database**: Supabase / PostgreSQL (no local Postgres needed)
- **ORM**: SQLAlchemy with psycopg3
- **Data source**: football-data.org API v4 (user has registered and has `X-Auth-Token`)
- **Environment**: Windows 11 + WSL (bash). Always use WSL/Linux commands, never PowerShell in instructions.

## Monorepo layout

```
football-data-app/
├── backend/          # FastAPI app
│   ├── app/
│   │   ├── api/          routes_*.py
│   │   ├── models/       SQLAlchemy ORM models
│   │   ├── schemas/      Pydantic schemas
│   │   ├── scrapers/     base_scraper.py, football_data_org_scraper.py, champions_league_scraper.py
│   │   ├── services/     ingestion_service.py, match_service.py, …
│   │   ├── config.py     Settings (pydantic-settings, reads .env)
│   │   ├── database.py   SQLAlchemy engine + get_db
│   │   └── main.py       FastAPI app, CORS, routers
│   ├── sql/          001_create_tables, 002_indexes, 003_seed, 004_cleanup_cl_pilot, 005_add_team_crest
│   ├── scripts/      seed_database.py, run_champions_league_ingestion.py
│   └── requirements.txt
├── frontend/
│   ├── app/          Next.js App Router pages
│   ├── components/   Header, Sidebar, MatchesTable, DashboardCards, …
│   ├── lib/api.ts    All fetch calls to FastAPI
│   └── types/        competition.ts, team.ts, match.ts
├── docs/
│   ├── project-memory.md
│   └── architecture.md
├── dev.sh            Single command to start both services (WSL)
└── CLAUDE.md         ← this file
```

## Environment variables

### backend/.env
```
DATABASE_URL=postgresql://postgres.<project>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_KEY=<service_role_key>
FOOTBALL_DATA_API_TOKEN=<token_from_football-data.org>
ALLOWED_ORIGINS=http://localhost:3000
```

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Starting the project (single command)

From the project root in WSL:
```bash
bash dev.sh
```
This starts backend (port 8000) + frontend (port 3000) together. Ctrl+C kills both.

## Backend routes

| Method | Path | Description |
|--------|------|-------------|
| GET | / | Service info |
| GET | /health | DB connectivity check |
| GET | /competitions | List competitions |
| GET | /teams | List teams |
| GET | /matches | All matches |
| GET | /matches/upcoming | Future matches |
| GET | /matches/results | Completed matches |
| POST | /ingestion/champions-league/run | Ingest current snapshot |
| POST | /ingestion/champions-league/reset-and-run | Delete stale + re-ingest |
| POST | /ingestion/champions-league/history/run?start_season=2022&end_season=2025 | football-data.org historical |

## football-data.org API

- Base URL: `https://api.football-data.org/v4/`
- Auth header: `X-Auth-Token: <token>`
- Free tier: recent seasons only; older seasons return 403 → skipped automatically
- Champions League code: `CL`
- Rate limit: 10 req/min on free tier → scraper uses 1.2s delay between requests
- The scraper is at `backend/app/scrapers/football_data_org_scraper.py`
- Ingestion service at `backend/app/services/ingestion_service.py`

## Data flow

1. Scraper fetches matches from football-data.org and normalizes to dict format
2. `IngestionService` resolves/creates Country → Competition → Season → Team → Venue → DataSource
3. Matches are upserted by `(data_source_id, external_match_id)` or natural key
4. FastAPI exposes data via REST
5. Next.js reads from `frontend/lib/api.ts` and renders pages

## Key decisions / constraints

- WSL may not reach Supabase direct host (IPv6 issue) → always use **Session Pooler** URL for `DATABASE_URL`
- Frontend dates are formatted with `America/Lima` timezone to avoid SSR/CSR hydration mismatch
- `suppressHydrationWarning` on `<html>` because browser extensions inject `class="hydrated"`
- Frontend uses `npm overrides.postcss=8.5.12` to avoid CVE in transitive postcss
- No local PostgreSQL; Supabase is the only DB
- Virtual environment must be activated before running Python commands: `source venv/bin/activate`
- Always `python -m pip`, never system pip

## Current scope status

Completed:
- Full monorepo scaffold (FastAPI + Next.js)
- Supabase schema (SQL scripts 001–004 run successfully)
- Champions League real ingestion via football-data.org API (token configured)
- Generic `FootballDataOrgScraper(code)` supporting CL, EL, PL, PD, BL1, SA, FL1
- Generic ingestion endpoint: `POST /ingestion/{code}/history/run`
- Team crest URLs stored and displayed in frontend (run `005_add_team_crest.sql` on Supabase)
- Frontend full redesign: dark sidebar, competition color badges, crests in match table, multi-league ingestion UI
- `prepare_threshold=None` fix for SQLAlchemy + psycopg3 + Supabase PgBouncer
- `dev.sh` single-command startup at project root
- Deduplication by external_match_id and natural key

Pending / next improvements:
- Run `backend/sql/005_add_team_crest.sql` on Supabase to enable crest storage
- Ingest Premier League, La Liga, Bundesliga via Ingestion page
- Standings page (football-data.org `/competitions/{code}/standings` endpoint)
- Live match polling for IN_PLAY status

## Collaboration rules

- Always commit after meaningful advances
- Update `docs/project-memory.md` when decisions or architecture changes
- Use WSL/Linux shell syntax in all instructions
- Do not commit .env files or real credentials
- Keep implementation focused; no speculative features
