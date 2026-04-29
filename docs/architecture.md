# Architecture

## Overview

The application is a monorepo with a Python API backend and a Next.js frontend.

```text
Source/API/Snapshot/Scraper
      ↓
Python ingestion adapter
      ↓
Normalized match dictionaries
      ↓
Ingestion service and SQLAlchemy upsert logic
      ↓
Supabase/PostgreSQL
      ↓
FastAPI REST endpoints
      ↓
Next.js dashboard
```

## Backend

FastAPI exposes REST endpoints and delegates database operations to services. SQLAlchemy is used for PostgreSQL persistence through `DATABASE_URL`, which should point to the Supabase database.

The backend is split into:

- `api`: HTTP route declarations.
- `models`: database entities.
- `schemas`: response contracts.
- `services`: business logic and queries.
- `scrapers`: ingestion source adapters.
- `sql`: database DDL and seed scripts.

## Frontend

Next.js uses the App Router. Server pages load initial dashboard/catalog data from FastAPI. Interactive pages use client components and the shared `lib/api.ts` service.

The UI includes:

- Dashboard summary.
- Competition list.
- Team list.
- Match table.
- Filters by competition, team and date.
- Champions League ingestion panel.

## Database model

The normalized schema includes:

- `countries`
- `competitions`
- `seasons`
- `teams`
- `venues`
- `matches`
- `match_events`
- `standings`
- `data_sources`
- `ingestion_logs`

`matches` stores competition, season, home/away teams, date/time, venue, country, round, stage, status, scores, source metadata, external match ID and update timestamps.

## Duplicate prevention

Two layers prevent duplicates:

- Database constraints:
  - `(data_source_id, external_match_id)`
  - `(competition_id, season_id, home_team_id, away_team_id, match_date)`
- Ingestion service upsert logic:
  - First searches by source and external ID.
  - Falls back to the natural match key.
  - Updates existing records when found.

## Adding competitions

To add a new competition:

1. Add or seed the competition row.
2. Create a scraper/source adapter under `backend/app/scrapers/`.
3. Make the adapter emit the normalized match format.
4. Add an ingestion service method.
5. Add an API route if manual triggering is needed.
6. Add frontend filters or pages only if the existing generic views are not enough.

## Source policy

Production scrapers should prefer official APIs or allowed public sources before HTML scraping. Any scraper must respect robots.txt, terms of use, rate limits and conservative delays.

The current Champions League pilot uses a UEFA official snapshot adapter. It is intentionally conservative: it does not crawl pages aggressively and it can be replaced later by an official API or a fully compliant source adapter.
