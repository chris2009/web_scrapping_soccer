# Football Data App

Fullstack analytics platform for collecting, normalizing, storing and visualizing football match data from multiple competitions.

- **Backend**: FastAPI + SQLAlchemy + Supabase/PostgreSQL
- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS (App Router)
- **Data source**: football-data.org API v4
- **Auth**: cookie-based login protecting all frontend routes

## Project structure

```text
football-data-app/
|-- backend/
|   |-- app/          FastAPI application
|   |-- sql/          Database migration scripts
|   |-- scripts/      Utility scripts
|   `-- requirements.txt
|-- frontend/
|   |-- app/          Next.js App Router pages
|   |-- components/   UI components
|   |-- lib/          API client
|   `-- middleware.ts  Route protection
|-- docs/
|   `-- project-memory.md
|-- dev.sh            Single-command startup
`-- CLAUDE.md         AI session context
```

## Quick start (WSL)

```bash
cd /mnt/d/APRENDIZAJE/PROYECTOS/Scrapping_web/football-data-app
bash dev.sh
```

This starts both backend (port 8000) and frontend (port 3000) together. Press `Ctrl+C` to stop both.

---

## Full setup from scratch

### 1. Supabase — run SQL scripts in order

Open **Supabase SQL Editor** and run each file:

```text
backend/sql/001_create_tables.sql
backend/sql/002_create_indexes.sql
backend/sql/003_seed_initial_data.sql
backend/sql/004_cleanup_champions_league_pilot_matches.sql
```

Then run the migration to add team crest URLs (logos):

```sql
-- backend/sql/005_add_team_crest.sql
ALTER TABLE teams ADD COLUMN IF NOT EXISTS crest_url TEXT;
```

### 2. Configure backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```text
DATABASE_URL=postgresql://postgres.<project>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://<project>.supabase.co
FOOTBALL_DATA_API_TOKEN=<your_token_from_football-data.org>
```

> Use the **Session Pooler** URL for `DATABASE_URL` (not the direct host) to avoid IPv6 issues in WSL.

### 3. Configure frontend

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000

# Login credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=football2024
```

### 4. Install dependencies (first time only)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 5. Start everything

```bash
cd /mnt/d/APRENDIZAJE/PROYECTOS/Scrapping_web/football-data-app
bash dev.sh
```

---

## Login

Open `http://localhost:3000` — you will be redirected to the login page.

| Field    | Default value   |
|----------|-----------------|
| Username | `admin`         |
| Password | `football2024`  |

Change these values in `frontend/.env.local` before deploying.

---

## Supported competitions

| Code | Competition      |
|------|-----------------|
| CL   | Champions League |
| EL   | Europa League   |
| PL   | Premier League  |
| PD   | La Liga         |
| BL1  | Bundesliga      |
| SA   | Serie A         |
| FL1  | Ligue 1         |

To ingest any competition, go to `http://localhost:3000/ingestion`, select the league and season range, and click **Ingest**.

Or via API:

```bash
curl -X POST "http://127.0.0.1:8000/ingestion/PL/history/run?start_season=2023&end_season=2025"
```

---

## Backend API

### Accessing the interactive docs

FastAPI auto-generates interactive documentation — no extra setup needed.

| Interface | Local URL | Production URL |
|-----------|-----------|----------------|
| **Swagger UI** | `http://localhost:8000/docs` | `https://webscrappingsoccer-production.up.railway.app/docs` |
| **ReDoc** | `http://localhost:8000/redoc` | `https://webscrappingsoccer-production.up.railway.app/redoc` |
| **OpenAPI JSON** | `http://localhost:8000/openapi.json` | `https://webscrappingsoccer-production.up.railway.app/openapi.json` |

**How to authenticate in Swagger UI:**
1. Start the backend (`bash dev.sh`)
2. Open `http://localhost:8000/docs`
3. Run `POST /auth/login` with `{"username": "admin", "password": "football2024"}`
4. Copy the `access_token` from the response
5. Click **Authorize** (top right lock icon) → paste `Bearer <token>` in the `bearerAuth` field
6. All protected endpoints are now unlocked for testing

**Import into Postman:** Import → paste URL `http://localhost:8000/openapi.json` → all endpoints load automatically.

---

### Public endpoints — no authentication required

| Method | Path | Query params | Description |
|--------|------|-------------|-------------|
| GET | `/health` | — | Service status and DB connectivity |
| GET | `/competitions` | — | List all competitions |
| GET | `/competitions/{code}/standings` | — | League table from football-data.org |
| GET | `/teams` | — | List all teams (with crest URLs) |
| GET | `/matches` | `status`, `limit` (1–500, default 100) | All matches, optional status filter |
| GET | `/matches/upcoming` | `limit` (1–200, default 50) | Scheduled future matches |
| GET | `/matches/recent` | `limit` (1–200, default 50) | Completed matches, newest first |
| GET | `/matches/by-date` | `match_date` (YYYY-MM-DD, required) | Matches on a specific date |
| GET | `/matches/by-competition/{id}` | — | All matches for a competition |
| GET | `/matches/by-team/{id}` | — | All matches for a team (home or away) |
| GET | `/stats/top-teams` | `limit` (1–30, default 10) | Top teams by goals and wins |
| GET | `/stats/goals-timeline` | `team_id` (required) | Last 20 matches goals history |

### Auth endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | No | Returns JWT. Body: `{username, password}` |
| GET | `/auth/me` | Bearer JWT | Returns current user info |

### Ingestion endpoints (admin operation)

| Method | Path | Query params | Description |
|--------|------|-------------|-------------|
| POST | `/ingestion/champions-league/run` | — | CL snapshot from UEFA mock data |
| POST | `/ingestion/champions-league/history/run` | `start_season`, `end_season` (2020–2026) | CL historical ingestion |
| POST | `/ingestion/{code}/history/run` | `start_season`, `end_season` (2000–2026) | Any league historical ingestion |

Competition codes: `CL` `EL` `PL` `PD` `BL1` `SA` `FL1`

```bash
# Example: ingest Premier League seasons 2022–2024
curl -X POST "http://localhost:8000/ingestion/PL/history/run?start_season=2022&end_season=2024"
```

### Admin-only endpoints — requires `Authorization: Bearer <admin-JWT>`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users` | List all users |
| POST | `/users` | Create user. Body: `{username, email, password, role}` |
| PUT | `/users/{id}` | Update user. Body: any of `{email, password, role, is_active, avatar_url}` |
| DELETE | `/users/{id}` | Delete user (cannot delete own account) |

### MatchRead response schema

Every `/matches` endpoint returns objects with these fields:

```json
{
  "id": 1,
  "competition_name": "Premier League",
  "season_name": "2023",
  "home_team_name": "Arsenal",
  "home_team_crest": "https://crests.football-data.org/57.png",
  "away_team_name": "Chelsea",
  "away_team_crest": "https://crests.football-data.org/61.png",
  "match_date": "2024-03-15T15:00:00",
  "status": "FINISHED",
  "home_score": 2,
  "away_score": 1,
  "round": "28",
  "stage": "REGULAR_SEASON",
  "venue_name": "Emirates Stadium"
}
```

Possible `status` values: `SCHEDULED` · `IN_PLAY` · `FINISHED` · `POSTPONED` · `CANCELLED`

---

## WSL Python troubleshooting

If `python` is not found, set pyenv version first:

```bash
pyenv local 3.13.0
python --version
```

If venv support is missing:

```bash
sudo apt update && sudo apt install -y python3 python3-venv python3-pip python3-full
```

## Supabase IPv6 troubleshooting

If `/health` returns `database.connected=false` with an IPv6 address, use the **Session Pooler** URL in `DATABASE_URL`:

1. Supabase Dashboard → your project → **Connect** → **Connection pooling**
2. Copy the **Session pooler** string (port 5432)
3. Paste it as `DATABASE_URL` in `backend/.env`

---

## Collaboration rules

- Keep project context in `docs/project-memory.md` and `CLAUDE.md`.
- Commit every meaningful advance with a clear message.
- Use WSL/Linux shell commands in all instructions.
- Do not commit `.env` files or real credentials.
