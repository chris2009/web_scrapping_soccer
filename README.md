# Football Data App

Fullstack monorepo for collecting, normalizing, storing and visualizing football match data.

The first phase implements a Champions League pilot with:

- FastAPI backend in Python.
- SQLAlchemy connection to Supabase/PostgreSQL.
- SQL scripts for normalized tables, indexes and seed data.
- Simulated Champions League ingestion flow.
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

## Local setup on Windows 11

Open the repository folder in VS Code:

```powershell
cd D:\APRENDIZAJE\PROYECTOS\Scrapping_web\football-data-app
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

```powershell
cd backend
copy .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` with your Supabase PostgreSQL connection string.

## 3. Run backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend URLs:

- API: `http://localhost:8000`
- Health: `http://localhost:8000/health`
- Docs: `http://localhost:8000/docs`

## 4. Configure frontend environment

Open a second VS Code terminal:

```powershell
cd frontend
copy .env.example .env.local
```

Confirm this value:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 5. Run frontend

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
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
7. Run the simulated Champions League ingestion.
8. View matches in the dashboard and matches explorer.

## Current scope

Implemented only the Champions League pilot. Future competitions should be added through new scraper/source adapters that emit the same normalized match format.

## Collaboration rules

- Keep project context in `docs/project-memory.md`.
- Update the memory file when decisions, setup details, implemented scope or next steps change.
- Update the relevant README when a change affects setup, usage, architecture or workflow.
- Commit every completed advance, change or improvement with a clear git message.

