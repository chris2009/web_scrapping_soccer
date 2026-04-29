# Frontend

Next.js frontend for the football data dashboard.

## Stack

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- `fetch` service layer in `lib/api.ts`.
- Lucide icons.

## Main files

- `app/layout.tsx`: shared layout with header and navigation.
- `app/page.tsx`: dashboard.
- `app/competitions/page.tsx`: competition list.
- `app/teams/page.tsx`: team list.
- `app/matches/page.tsx`: match explorer with filters.
- `app/ingestion/page.tsx`: Champions League pilot ingestion panel.
- `components/`: reusable UI components.
- `lib/api.ts`: FastAPI client.
- `types/`: shared frontend types.

## Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Expected value:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Install and run

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

The backend must be running on `http://localhost:8000` for live data.
