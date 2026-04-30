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

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service info |
| GET | `/health` | DB connectivity |
| GET | `/competitions` | List competitions |
| GET | `/teams` | List teams |
| GET | `/matches` | All matches (limit 100) |
| GET | `/matches/upcoming` | Upcoming matches |
| GET | `/matches/recent` | Completed matches |
| POST | `/ingestion/{code}/history/run` | Ingest any competition |
| POST | `/ingestion/champions-league/run` | CL snapshot ingestion |

Full interactive docs: `http://localhost:8000/docs`

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
