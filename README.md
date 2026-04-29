# Football Data App

Fullstack monorepo for collecting, normalizing, storing and visualizing football match data.

The first phase implements a Champions League pilot with:

- FastAPI backend in Python.
- SQLAlchemy connection to Supabase/PostgreSQL.
- SQL scripts for normalized tables, indexes and seed data.
- Champions League ingestion flow based on a verified UEFA official snapshot.
- Next.js frontend with TypeScript, App Router and Tailwind CSS.

## Project structure

```text
football-data-app/
|-- backend/
|   |-- app/
|   |-- sql/
|   |-- scripts/
|   |-- requirements.txt
|   |-- .env.example
|   `-- README.md
|-- frontend/
|   |-- app/
|   |-- components/
|   |-- lib/
|   |-- types/
|   |-- package.json
|   |-- .env.example
|   `-- README.md
|-- docs/
|   |-- architecture.md
|   `-- project-memory.md
|-- .gitignore
`-- README.md
```

## Local setup with WSL

Open the repository folder in VS Code:

```bash
cd /mnt/d/APRENDIZAJE/PROYECTOS/Scrapping_web/football-data-app
code .
```

## 1. Create Supabase tables

In Supabase SQL Editor, run these scripts in order:

```text
backend/sql/001_create_tables.sql
backend/sql/002_create_indexes.sql
backend/sql/003_seed_initial_data.sql
```

## 2. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` with your Supabase PostgreSQL connection string.

For WSL, use the Supabase **Session Pooler** connection string in `DATABASE_URL`:

```text
DATABASE_URL=postgresql://postgres.fdnyhwywhrpuhfwfhalj:YOUR_REAL_PASSWORD@aws-0-YOUR_REGION.pooler.supabase.com:5432/postgres
```

Do not use the direct `db.fdnyhwywhrpuhfwfhalj.supabase.co` connection if WSL reports `Network is unreachable`, because that direct host resolves to IPv6.

Do not put the database connection string in `SUPABASE_URL`. `SUPABASE_URL` is the project API URL:

```text
SUPABASE_URL=https://fdnyhwywhrpuhfwfhalj.supabase.co
```

You do not need a local PostgreSQL database for this project if you are using Supabase.

## 3. Run backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Backend URLs:

- API: `http://localhost:8000`
- Root: `http://localhost:8000/`
- Health: `http://localhost:8000/health`
- Docs: `http://localhost:8000/docs`

## 4. Configure frontend environment

Open a second VS Code terminal:

```bash
cd frontend
cp .env.example .env.local
```

Confirm this value:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 5. Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

## Expected flow

1. Run SQL scripts in Supabase.
2. Configure `backend/.env`.
3. Start FastAPI on `http://localhost:8000`.
4. Start Next.js on `http://localhost:3000`.
5. Test `GET http://localhost:8000/health`.
6. Open the frontend ingestion page.
7. Run the Champions League pilot ingestion.
8. View matches in the dashboard and matches explorer.

## Next steps after creating Supabase tables

You already completed the database creation step if the SQL scripts ran successfully in Supabase.

Continue with:

```bash
cd /mnt/d/APRENDIZAJE/PROYECTOS/Scrapping_web/football-data-app/backend
cp .env.example .env
```

Then edit `backend/.env` and replace `DATABASE_URL` with your Supabase PostgreSQL connection string.

For WSL, use the Session Pooler string from Supabase:

```text
DATABASE_URL=postgresql://postgres.fdnyhwywhrpuhfwfhalj:YOUR_REAL_PASSWORD@aws-0-YOUR_REGION.pooler.supabase.com:5432/postgres
```

Replace `YOUR_REAL_PASSWORD` with the database password configured in Supabase.
Replace `YOUR_REGION` with the region shown by Supabase in the pooler connection string.

After that, install and run the backend:

```bash
python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

In a second terminal, run the frontend:

```bash
cd /mnt/d/APRENDIZAJE/PROYECTOS/Scrapping_web/football-data-app/frontend
cp .env.example .env.local
npm install
npm audit
npm run dev
```

Then open:

- `http://localhost:8000/health`
- `http://localhost:8000/docs`
- `http://localhost:3000`

If `http://localhost:8000/` returns a JSON object with `service`, `status`, `health` and `docs`, the FastAPI server is running.

## WSL Python troubleshooting

If `python` fails with a pyenv message like `pyenv: python: command not found`, select the installed pyenv version first:

```bash
pyenv local 3.13.0
python --version
```

Then create the virtual environment again:

```bash
cd /mnt/d/APRENDIZAJE/PROYECTOS/Scrapping_web/football-data-app/backend
python -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

If `python3 -m venv venv` says that venv support is missing, install the WSL packages:

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip python3-full
```

Do not install dependencies with system `pip` outside the virtual environment.

## Frontend dependency security

Before compiling or deploying the frontend, run:

```bash
cd /mnt/d/APRENDIZAJE/PROYECTOS/Scrapping_web/football-data-app/frontend
npm install
npm audit
npm run build
```

The expected audit result is:

```text
found 0 vulnerabilities
```

If `npm run build` fails with a permissions error after mixing Windows npm and WSL npm, clean generated dependencies from WSL:

```bash
rm -rf node_modules .next
npm install
npm run build
```

## Supabase IPv6 troubleshooting

If `/health` returns `database.configured=true` but `database.connected=false` with `Network is unreachable` and an IPv6 address, your WSL network cannot reach the direct Supabase database host.

Fix it by using the Supabase Session Pooler:

1. Open Supabase Dashboard.
2. Go to your project.
3. Click `Connect`.
4. Choose `Connection pooling`.
5. Copy the **Session pooler** connection string, port `5432`.
6. Paste it in `backend/.env` as `DATABASE_URL`.

The Session Pooler format is similar to:

```text
DATABASE_URL=postgresql://postgres.fdnyhwywhrpuhfwfhalj:YOUR_REAL_PASSWORD@aws-0-YOUR_REGION.pooler.supabase.com:5432/postgres
```

Keep this separate:

```text
SUPABASE_URL=https://fdnyhwywhrpuhfwfhalj.supabase.co
```

## Current scope

Implemented only the Champions League pilot. Future competitions should be added through new scraper/source adapters that emit the same normalized match format.

## Current local status

Validated locally in WSL:

- Supabase tables were created with the SQL scripts in `backend/sql`.
- FastAPI is running on `http://127.0.0.1:8000`.
- `GET /health` returns `database.connected=true`.
- Champions League ingestion uses a UEFA official snapshot for the current 2025/2026 semi-final phase.
- Next.js frontend is running on `http://localhost:3000`.
- Frontend dependency audit was fixed before build: `npm audit` reports `found 0 vulnerabilities`.

To refresh the pilot data after backend changes:

```bash
curl -X POST http://127.0.0.1:8000/ingestion/champions-league/run
```

Then refresh `http://localhost:3000`.

## Collaboration rules

- Keep project context in `docs/project-memory.md`.
- Update the memory file when decisions, setup details, implemented scope or next steps change.
- Update the relevant README when a change affects setup, usage, architecture or workflow.
- Commit every completed advance, change or improvement with a clear git message.
- Use WSL/Linux shell commands in instructions, not PowerShell commands.
