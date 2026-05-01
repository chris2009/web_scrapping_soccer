# Football Data App — Claude Context

> **Instrucción permanente**: al final de cada sesión de trabajo, actualizar este archivo, `docs/project-memory.md` y los archivos de memoria en `~/.claude/projects/...` para que reflejen el estado real del proyecto.

## Stack

- **Backend**: Python 3.13, FastAPI, SQLAlchemy 2, uvicorn, passlib[bcrypt], python-jose
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, jose (JWT en middleware)
- **Database**: Supabase / PostgreSQL (sin PostgreSQL local)
- **Data source**: football-data.org API v4
- **Auth**: JWT HS256 firmado por FastAPI, verificado por Next.js middleware con jose
- **Entorno**: Windows 11 + WSL (bash). Siempre usar comandos WSL/Linux, nunca PowerShell.

## Arranque

```bash
cd /mnt/d/APRENDIZAJE/PROYECTOS/Scrapping_web/football-data-app
bash dev.sh   # arranca backend (8000) + frontend (3000) juntos
```

## Monorepo

```
football-data-app/
├── backend/
│   ├── app/
│   │   ├── api/          routes_health, routes_auth, routes_users,
│   │   │                 routes_competitions, routes_teams, routes_matches, routes_ingestion
│   │   ├── models/       country, competition, season, team (+ crest_url), venue,
│   │   │                 data_source, match, match_event, standing, ingestion_log, user
│   │   ├── schemas/      competition_schema, team_schema, match_schema,
│   │   │                 auth_schema, user_schema, ingestion_schema
│   │   ├── scrapers/     base_scraper, champions_league_scraper,
│   │   │                 football_data_org_scraper (genérico multi-liga)
│   │   ├── services/     auth_service, ingestion_service, match_service,
│   │   │                 competition_service, team_service
│   │   ├── config.py     Settings con JWT_SECRET, ADMIN_USERNAME/PASSWORD
│   │   ├── database.py   Engine con prepare_threshold=None (fix PgBouncer)
│   │   └── main.py       FastAPI + lifespan (seed admin al arrancar)
│   ├── sql/
│   │   ├── 001_create_tables.sql
│   │   ├── 002_create_indexes.sql
│   │   ├── 003_seed_initial_data.sql
│   │   ├── 004_cleanup_champions_league_pilot_matches.sql
│   │   ├── 005_add_team_crest.sql       → ALTER TABLE teams ADD COLUMN crest_url TEXT
│   │   └── 006_create_users.sql         → tabla users con roles
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── layout.tsx               Root layout mínimo (html+body)
│   │   ├── (main)/layout.tsx        Layout con sidebar (rutas protegidas)
│   │   ├── (main)/page.tsx          Dashboard
│   │   ├── (main)/competitions/     Catálogo con colores por liga
│   │   ├── (main)/teams/            Tabla de equipos
│   │   ├── (main)/matches/          Explorador con filtros + paginación + búsqueda
│   │   ├── (main)/ingestion/        Multi-liga (solo admin)
│   │   ├── (main)/users/            Gestión de usuarios (solo admin)
│   │   ├── login/                   Página de login (sin sidebar)
│   │   └── api/
│   │       ├── auth/login/          Proxy → FastAPI /auth/login, setea cookies
│   │       ├── auth/logout/         Limpia cookies
│   │       ├── users/               Proxy GET/POST → FastAPI /users
│   │       └── users/[id]/          Proxy PUT/DELETE → FastAPI /users/{id}
│   ├── components/
│   │   ├── Sidebar.tsx     Nav por rol, muestra username/role, logout
│   │   ├── MatchesTable.tsx  Paginación (10/20/30/40) + búsqueda en vivo + crests
│   │   ├── DashboardCards.tsx
│   │   ├── StatusBadge.tsx   Punto animado para Live
│   │   └── ...
│   ├── lib/
│   │   ├── api.ts          Cliente fetch a FastAPI
│   │   └── auth.ts         getAuthInfo() — lee cookie auth-info client-side
│   └── middleware.ts        Verifica JWT con jose, bloquea /users e /ingestion a no-admins
├── dev.sh                   Arranque único
├── CLAUDE.md                Este archivo
└── docs/project-memory.md
```

## Variables de entorno

### backend/.env
```
DATABASE_URL=postgresql://postgres.<proj>:<pass>@aws-0-<region>.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://<proj>.supabase.co
FOOTBALL_DATA_API_TOKEN=<token_football-data.org>
JWT_SECRET=change-this-secret-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=football2024
```

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:8000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=football2024
JWT_SECRET=change-this-secret-in-production
```

> `JWT_SECRET` debe ser idéntico en backend y frontend para que el middleware pueda verificar el JWT.

## Usuarios de prueba

| Username | Password      | Rol   | Acceso |
|----------|--------------|-------|--------|
| `admin`  | `football2024` | admin | Todo — incluyendo Ingestion y User Management |

Crear usuarios adicionales desde `http://localhost:3000/users` (admin requerido).

## Flujo de autenticación

```
Login → Next.js /api/auth/login → FastAPI POST /auth/login (bcrypt verify)
      → JWT firmado HS256 24h
      → cookie httpOnly auth-token (middleware lo verifica con jose)
      → cookie readable auth-info = base64({username, role}) (Sidebar lo lee)

User Management → Next.js /api/users/* → lee auth-token httpOnly → reenvía JWT
               → FastAPI /users con Authorization: Bearer
               → require_admin dependency verifica rol
```

## Rutas del API (FastAPI)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | — | Estado de conexión a DB |
| POST | `/auth/login` | — | Login, devuelve JWT |
| GET | `/auth/me` | JWT | Usuario actual |
| GET | `/users` | Admin | Lista usuarios |
| POST | `/users` | Admin | Crear usuario |
| PUT | `/users/{id}` | Admin | Editar usuario |
| DELETE | `/users/{id}` | Admin | Eliminar usuario |
| GET | `/matches` | — | Partidos (limit 100, desc) |
| POST | `/ingestion/{code}/history/run` | — | Ingestar liga |

Códigos de liga: `CL, EL, PL, PD, BL1, SA, FL1`

## Deploy en producción

| Servicio | Plataforma | URL |
|---------|-----------|-----|
| Frontend Next.js | Vercel | `https://web-scrapping-soccer.vercel.app` |
| Backend FastAPI | Railway | `https://webscrappingsoccer-production.up.railway.app` |

- **Vercel**: Root Directory = `frontend`. Variables: `NEXT_PUBLIC_API_URL` (Railway URL), `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`.
- **Railway**: Root Directory = `backend`. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Variables: `DATABASE_URL` (Session Pooler port 5432), `FOOTBALL_DATA_API_TOKEN`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ALLOWED_ORIGINS`.
- **Crítico**: `JWT_SECRET` debe ser idéntico en Railway y Vercel. Si difieren, el login hace loop infinito.
- Ver guía completa: `docs/deploy-guide.md`
- `proxy.ts` (antes `middleware.ts`) — Next.js 16 renombró la convención, la función exportada también debe llamarse `proxy`.

## SQL pendientes en Supabase

Ejecutar en orden en el SQL Editor:
1. `001_create_tables.sql` ✅ ejecutado
2. `002_create_indexes.sql` ✅ ejecutado
3. `003_seed_initial_data.sql` ✅ ejecutado
4. `004_cleanup_champions_league_pilot_matches.sql` ✅ ejecutado
5. `005_add_team_crest.sql` — ejecutar si no se hizo aún
6. `006_create_users.sql` ✅ ejecutado
7. `007_add_user_avatar.sql` — ejecutar si no se hizo aún

## Decisiones técnicas clave

| Decisión | Motivo |
|----------|--------|
| `prepare_threshold=None` en SQLAlchemy engine | Fix `DuplicatePreparedStatement` con Supabase PgBouncer |
| Session Pooler URL en `DATABASE_URL` | WSL no alcanza IPv6 (host directo de Supabase) |
| `suppressHydrationWarning` en `<html>` y `<form>` login | Extensiones de browser (Psono, etc.) inyectan atributos antes de React |
| Timezone `America/Lima` en fechas | Evita mismatch SSR/CSR |
| Proxy routes Next.js para user CRUD | `auth-token` es httpOnly → no legible en browser → proxy lee server-side |
| `jose` en middleware | Compatible con Edge runtime (jsonwebtoken no lo es) |
| Route group `(main)/` | Permite que `/login` tenga layout diferente (sin sidebar) |

## Reglas de colaboración

- **Siempre** al terminar una sesión: actualizar CLAUDE.md, `docs/project-memory.md` y archivos de memoria en `~/.claude/projects/...`
- Hacer commit de cada avance significativo con mensaje claro
- Usar comandos WSL/Linux en todas las instrucciones
- No commitear `.env` ni credenciales reales
- No instalar dependencias fuera del virtualenv Python
