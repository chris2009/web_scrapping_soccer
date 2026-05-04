# Project Memory

## Purpose

Build a fullstack web application to collect, normalize, store and visualize football match data.

## Current project

- Repository folder: `football-data-app`.
- User works in WSL/Linux shell. Provide bash commands, not PowerShell commands.
- User has pyenv in WSL with Python `3.13.0` available. If `python` is not found, use `pyenv local 3.13.0` before creating the virtual environment.
- Frontend: Next.js with TypeScript, App Router and Tailwind CSS.
- Frontend dependencies were upgraded to patched versions. Current target is Next.js `16.2.4`, React `19.2.5`, React DOM `19.2.5`, ESLint `9.39.4`, `eslint-config-next` `16.2.4`, and PostCSS `8.5.12`.
- Frontend `package.json` uses npm `overrides.postcss=8.5.12` so transitive dependencies do not pull a vulnerable PostCSS version.
- Frontend match dates are formatted with explicit `America/Lima` timezone to avoid server/client hydration mismatches.
- Backend: Python with FastAPI.
- Database: Supabase/PostgreSQL.
- ORM: SQLAlchemy.
- First pilot competition: Champions League.
- Current ingestion mode: Champions League UEFA official snapshot with normalized semi-final data.
- Supabase direct PostgreSQL connection string belongs in `DATABASE_URL`.
- `SUPABASE_URL` is the Supabase API URL, not the PostgreSQL connection string.
- No local PostgreSQL database is required while using Supabase.
- WSL may not reach Supabase direct connections because those resolve to IPv6. Prefer Supabase Session Pooler in `DATABASE_URL` for local WSL.
- Historical Champions League ingestion from 2020 onward uses football-data.org and requires `FOOTBALL_DATA_API_TOKEN`.
- `FOOTBALL_DATA_API_TOKEN` is obtained by registering at `https://www.football-data.org/`; it is not invented or generated locally.
- football-data.org can return `403 Restricted Resource` when a season/resource is not available in the user's plan.
- The football-data.org history ingestor skips restricted seasons and reports them in `skipped_seasons`.

## Supabase SQL scripts

Run these files in Supabase SQL Editor, in order:

1. `backend/sql/001_create_tables.sql`
2. `backend/sql/002_create_indexes.sql`
3. `backend/sql/003_seed_initial_data.sql`

## Core workflow

1. Ingestion source returns normalized match dictionaries.
2. Backend resolves or creates countries, competitions, seasons, teams, venues and data sources.
3. Backend upserts matches into PostgreSQL.
4. Backend records ingestion logs.
5. FastAPI exposes match, team and competition endpoints.
6. Next.js consumes FastAPI through `frontend/lib/api.ts`.
7. Dashboard and match explorer show stored data.

## Duplicate policy

Matches are deduplicated by:

- Primary source key: `(data_source_id, external_match_id)`.
- Natural match key: `(competition_id, season_id, home_team_id, away_team_id, match_date)`.

## Collaboration instructions

- Every meaningful advance, change or improvement must end with a git commit.
- Update this memory file whenever project context, decisions, setup, architecture or next steps change.
- Update the relevant README whenever commands, setup, usage or structure change.
- Use WSL/Linux shell commands in user-facing instructions.
- For backend Python installs, always use a virtual environment and `python -m pip`, not system `pip`.
- For frontend installs, use WSL npm only. If Windows npm and WSL npm are mixed, clean `node_modules` and `.next` from WSL and reinstall.
- If `npm run dev` is already running, browser F5 is enough. Restart Next.js only after dependency/env changes or if the dev server stopped.
- Do not store real credentials, private keys or secrets in the repository.
- Keep implementation focused on the current phase unless a new phase is explicitly requested.

## GitHub repository

- Remote repository intended by the user: `https://github.com/chris2009/web_scrapping_soccer.git`.
- Local git repository should use branch `main`.

## Current phase status

Completed:

- Monorepo scaffold.
- Backend FastAPI structure.
- SQLAlchemy models.
- Supabase SQL scripts.
- REST endpoints for health, competitions, teams, matches and ingestion.
- Root API endpoint `GET /` returns a small service/status payload with links to `/health` and `/docs`.
- Champions League UEFA official snapshot ingestion.
- Frontend dashboard, catalog pages, match explorer and ingestion panel.
- Project documentation.
- Supabase SQL scripts were executed by the user and the database tables were created.
- Backend was started successfully from WSL.
- Backend `/health` confirmed `database.configured=true` and `database.connected=true`.
- Supabase connection from WSL works through Session Pooler in `DATABASE_URL`.
- Champions League snapshot ingestion was executed and dashboard data is visible.
- Frontend was started successfully on `http://localhost:3000`.
- Dashboard should show the current Champions League semi-final snapshot after rerunning the ingestion endpoint.
- Dashboard main table now shows all current pilot matches instead of only recent completed results.
- Backend includes `POST /ingestion/champions-league/reset-and-run` to delete stale Champions League 2025/2026 pilot matches and ingest the current official snapshot.
- Backend includes `POST /ingestion/champions-league/history/run?start_season=2020&end_season=2025` to ingest Champions League history through football-data.org.
- Frontend root layout uses `suppressHydrationWarning` because browser extensions can add `class="hydrated"` to `<html>` before React hydration.
- Frontend dependencies were patched and `npm audit` reports `found 0 vulnerabilities`.

- `FOOTBALL_DATA_API_TOKEN` is confirmed working: real Champions League history ingested successfully.
- `prepare_threshold=None` added to SQLAlchemy engine to fix `DuplicatePreparedStatement` with Supabase PgBouncer.
- Generic `FootballDataOrgScraper(competition_code)` added — supports CL, EL, PL, PD, BL1, SA, FL1.
- Generic ingestion endpoint added: `POST /ingestion/{code}/history/run?start_season&end_season`.
- Team `crest_url` column added to model. SQL migration: `backend/sql/005_add_team_crest.sql` (must be run on Supabase).
- Frontend fully redesigned: dark sidebar, competition color badges, team crests in match table, multi-league ingestion UI.
- `dev.sh` at project root starts backend + frontend together with one command.

- Status filter added to `/matches` page: pill buttons (All / Scheduled / Live / Finished / Postponed). Uses `GET /matches?status=` for the general endpoint; client-side filtering for specific endpoints (by-date, by-team, by-competition, upcoming, recent). Clear button resets the filter.
- Full architecture documentation added: `ARQUITECTURA_MANUAL.md` (detailed manual in Spanish, 12 sections including API catalog with all endpoints, params and response schemas) and `ARQUITECTURA_DRAWIO.xml` (draw.io diagram with all layers).
- `README.md` expanded with complete API catalog organized by auth level, Swagger UI access instructions and MatchRead response schema.

Pending:

- Run `backend/sql/005_add_team_crest.sql` on Supabase to enable crest URL storage.
- Ingest other competitions (PL, PD, BL1, SA, FL1) via Ingestion page in the UI.
- Push local git repository to GitHub after authentication is available.

## Latest validated milestone

Date: 2026-05-04

- Status filter (Scheduled / Live / Finished / Postponed) added to matches explorer.
- Complete architecture manual (`ARQUITECTURA_MANUAL.md`) and draw.io diagram (`ARQUITECTURA_DRAWIO.xml`) created.
- Full API catalog documented in README and manual, including Swagger UI access steps.

## Deploy en producción (2026-05-01)

- **Frontend**: Vercel — `https://web-scrapping-soccer.vercel.app` — Root Directory = `frontend`
- **Backend**: Railway — `https://webscrappingsoccer-production.up.railway.app` — Root Directory = `backend`
- Login funciona con JWT compartido entre Railway (firma) y Vercel (verifica)
- `JWT_SECRET` debe ser idéntico en ambas plataformas
- `NEXT_PUBLIC_API_URL` en Vercel apunta a la URL de Railway (con `https://`)
- `ALLOWED_ORIGINS` en Railway incluye la URL de Vercel
- `DATABASE_URL` en Railway usa Session Pooler (port 5432), no Transaction Pooler
- `middleware.ts` renombrado a `proxy.ts` + función exportada renombrada a `proxy` (Next.js 16)
- Guía de deploy en `docs/deploy-guide.md`

## Next immediate step

Ejecutar SQLs pendientes en Supabase: `005_add_team_crest.sql` y `007_add_user_avatar.sql`.
Luego ingestar ligas desde `https://web-scrapping-soccer.vercel.app/ingestion`.

Preferred WSL path:

```bash
cd /mnt/d/APRENDIZAJE/PROYECTOS/Scrapping_web/football-data-app
```

Expected backend database configuration:

```text
DATABASE_URL=postgresql://postgres.fdnyhwywhrpuhfwfhalj:YOUR_REAL_PASSWORD@aws-0-YOUR_REGION.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://fdnyhwywhrpuhfwfhalj.supabase.co
```

Use the exact Session Pooler host and region shown in Supabase Dashboard > Connect > Connection pooling.
