# Project Memory

## Purpose

Build a fullstack web application to collect, normalize, store and visualize football match data.

## Current project

- Repository folder: `football-data-app`.
- Frontend: Next.js with TypeScript, App Router and Tailwind CSS.
- Backend: Python with FastAPI.
- Database: Supabase/PostgreSQL.
- ORM: SQLAlchemy.
- First pilot competition: Champions League.
- Current ingestion mode: simulated Champions League source with normalized example data.

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
- Champions League simulated ingestion.
- Frontend dashboard, catalog pages, match explorer and ingestion panel.
- Project documentation.
- Supabase SQL scripts were executed by the user and the database tables were created.

Pending:

- Configure real `DATABASE_URL` in `backend/.env`.
- Install dependencies locally.
- Start backend and frontend.
- Push local git repository to GitHub after authentication is available.

## Next immediate step

Configure `backend/.env` with the real Supabase PostgreSQL `DATABASE_URL`, then start FastAPI and test `GET /health`.
