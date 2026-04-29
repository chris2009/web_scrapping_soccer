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
- Frontend dependencies were patched and `npm audit` reports `found 0 vulnerabilities`.

Pending:

- Push local git repository to GitHub after authentication is available.
- Run frontend `npm run build` from WSL after dependency updates if it has not been run successfully in WSL yet.

## Latest validated milestone

Date: 2026-04-29

The application is running end-to-end locally:

1. Supabase PostgreSQL schema exists.
2. FastAPI connects to Supabase.
3. Champions League snapshot ingestion inserts/updates normalized semi-final data.
4. Next.js dashboard reads backend data and renders it in the browser.

## Important correction

The first pilot used fake mock fixtures to validate the pipeline. Those records included incorrect quarter-final fixtures. The ingestion adapter has been corrected to use a verified UEFA official semi-final snapshot, and the ingestion service removes stale records from the original `mock_champions_league_source` when the pilot ingestion is rerun.

If stale records remain in Supabase, use:

```bash
curl -X POST http://127.0.0.1:8000/ingestion/champions-league/reset-and-run
```

## Next immediate step

Configure `backend/.env` with the real Supabase PostgreSQL `DATABASE_URL`, then start FastAPI and test `GET /health`.

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
