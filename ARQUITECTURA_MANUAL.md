# Manual de Arquitectura — Football Data App

> Plataforma fullstack de analítica de fútbol con scraping web, almacenamiento en Supabase y autenticación por roles.

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura de Capas](#3-arquitectura-de-capas)
4. [Backend — FastAPI](#4-backend--fastapi)
5. [Frontend — Next.js](#5-frontend--nextjs)
6. [Base de Datos — Supabase / PostgreSQL](#6-base-de-datos--supabase--postgresql)
7. [Cómo Funciona el Scraping Web](#7-cómo-funciona-el-scraping-web)
8. [Cómo se Almacena en Supabase](#8-cómo-se-almacena-en-supabase)
9. [Autenticación y Autorización](#9-autenticación-y-autorización)
10. [Despliegue en Producción](#10-despliegue-en-producción)
11. [Flujo Completo de una Sesión de Usuario](#11-flujo-completo-de-una-sesión-de-usuario)
12. [Catálogo de la API REST](#12-catálogo-de-la-api-rest)

---

## 1. Visión General

Football Data App es una plataforma web que:

- **Hace scraping** de datos de partidos de fútbol desde la API pública `football-data.org`
- **Almacena** todos los resultados en PostgreSQL (Supabase)
- **Expone** los datos a través de una API REST (FastAPI)
- **Visualiza** estadísticas e historial de partidos con un dashboard (Next.js)
- **Controla el acceso** mediante JWT con roles (`admin` / `user`)

```
[football-data.org API]
        |
        | HTTP GET (scraping)
        v
[Backend FastAPI] ──── guarda/consulta ────> [Supabase PostgreSQL]
        |
        | JSON REST API
        v
[Frontend Next.js] ──── muestra ────> [Usuario en el navegador]
```

**¿Cada cuánto tiempo se hace el scraping?**

> **No hay scraping automático.** La ingesta de datos se dispara manualmente desde el panel de administración (ruta `/ingestion`). Un administrador selecciona la liga y el rango de temporadas, y pulsa "Ejecutar". No hay cron jobs, Celery ni APScheduler configurados. Esta decisión es apropiada para el volumen actual de datos y evita consumir el límite de llamadas de la API gratuita de football-data.org.

---

## 2. Stack Tecnológico

| Componente | Tecnología | Versión | Propósito |
|---|---|---|---|
| Backend API | FastAPI | 0.115+ | REST API, lógica de negocio |
| ORM | SQLAlchemy | 2.x | Mapeo objeto-relacional |
| Validación | Pydantic v2 | 2.x | Schemas de entrada/salida |
| Servidor ASGI | Uvicorn | latest | Servidor HTTP asíncrono |
| Base de datos | PostgreSQL (Supabase) | 15 | Persistencia de datos |
| Auth passwords | passlib + bcrypt | latest | Hash seguro (12 rondas) |
| Auth tokens | python-jose | latest | Generación/verificación JWT HS256 |
| Frontend | Next.js (App Router) | 16 | UI y server-side routing |
| UI Library | React | 19 | Componentes reactivos |
| Estilos | Tailwind CSS | 4 | Estilos utilitarios |
| Gráficas | Recharts | latest | Visualizaciones de datos |
| Auth frontend | jose | latest | Verificación JWT en edge |
| Deploy backend | Railway | — | Hosting Python/FastAPI |
| Deploy frontend | Vercel | — | Hosting Next.js (CDN global) |
| DB hosting | Supabase | — | PostgreSQL administrado |

---

## 3. Arquitectura de Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE PRESENTACIÓN                      │
│  Next.js 16 (App Router) en Vercel                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │Dashboard │ │Partidos  │ │Equipos   │ │Ingestion (admin) │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
│  Middleware: proxy.ts — verifica JWT en cada request            │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API (JSON / HTTPS)
┌──────────────────────────▼──────────────────────────────────────┐
│                        CAPA DE API                               │
│  FastAPI en Railway                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │/auth     │ │/matches  │ │/teams    │ │/ingestion        │   │
│  │/users    │ │/stats    │ │/compet.  │ │/health           │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
└──────────┬──────────────────────────────────┬───────────────────┘
           │ SQLAlchemy ORM                   │ HTTP requests
┌──────────▼────────────────┐    ┌────────────▼────────────────────┐
│    CAPA DE DATOS           │    │     FUENTE EXTERNA              │
│  Supabase PostgreSQL       │    │  football-data.org API v4       │
│  (Session Pooler :5432)    │    │  GET /competitions/{code}/      │
│                            │    │  matches?season=YYYY            │
└────────────────────────────┘    └─────────────────────────────────┘
```

---

## 4. Backend — FastAPI

### 4.1 Estructura de Directorios

```
backend/
├── app/
│   ├── main.py              # Punto de entrada, lifespan hooks, CORS
│   ├── config.py            # Settings desde variables de entorno (.env)
│   ├── database.py          # Engine SQLAlchemy + sessionmaker
│   ├── api/
│   │   ├── routes_auth.py       # POST /auth/login, dependencias JWT
│   │   ├── routes_users.py      # CRUD usuarios (solo admin)
│   │   ├── routes_competitions.py
│   │   ├── routes_teams.py
│   │   ├── routes_matches.py    # Filtros: fecha, competición, equipo
│   │   ├── routes_stats.py      # Top equipos, goles timeline, standings
│   │   ├── routes_ingestion.py  # Disparo manual del scraping
│   │   └── routes_health.py     # GET /health (Railway healthcheck)
│   ├── models/              # SQLAlchemy ORM models (tablas DB)
│   │   ├── competition.py
│   │   ├── season.py
│   │   ├── team.py
│   │   ├── match.py
│   │   ├── standing.py
│   │   ├── user.py
│   │   ├── ingestion_log.py
│   │   └── ...
│   ├── schemas/             # Pydantic: validación I/O de la API
│   ├── services/            # Lógica de negocio
│   │   ├── ingestion_service.py  # Orquesta el scraping y guardado
│   │   ├── auth_service.py
│   │   ├── match_service.py
│   │   └── ...
│   └── scrapers/            # Módulos de scraping
│       ├── base_scraper.py          # Clase abstracta BaseScraper
│       ├── football_data_org_scraper.py  # Scraper principal
│       └── champions_league_scraper.py  # Mock data UEFA
├── alembic/                 # Migraciones de base de datos
├── sql/                     # Scripts SQL de creación de tablas
├── requirements.txt
├── Procfile                 # railway: uvicorn app.main:app ...
└── railway.toml             # Config de deploy Railway
```

### 4.2 Flujo de una Request API

```
HTTP Request
    │
    ▼
FastAPI Router
    │
    ├── Dependencia: get_current_user()  ← verifica Bearer JWT
    │       └── require_admin()         ← verifica role == "admin"
    │
    ▼
Route Handler
    │
    ▼
Service Layer  (lógica de negocio)
    │
    ▼
SQLAlchemy Session  (queries a DB)
    │
    ▼
Supabase PostgreSQL
    │
    ▼
Pydantic Schema (serializa respuesta)
    │
    ▼
JSON Response
```

---

## 5. Frontend — Next.js

### 5.1 Estructura de Directorios

```
frontend/
├── app/
│   ├── layout.tsx             # Root layout (html, body)
│   ├── login/
│   │   └── page.tsx           # Página pública de login
│   └── (main)/                # Grupo de rutas protegidas
│       ├── layout.tsx         # Layout con Sidebar y logout
│       ├── page.tsx           # Dashboard principal
│       ├── competitions/page.tsx
│       ├── teams/page.tsx
│       ├── matches/page.tsx   # Tabla con filtros y paginación
│       ├── ingestion/page.tsx # Panel admin: lanzar scraping
│       └── users/page.tsx     # Gestión de usuarios (admin)
├── components/
│   ├── Sidebar.tsx            # Navegación por rol, logout
│   ├── MatchesTable.tsx       # Tabla paginada con búsqueda en vivo
│   ├── DashboardCards.tsx     # Tarjetas de estadísticas
│   ├── GoalsLineChart.tsx     # Gráfica de goles (Recharts)
│   ├── TopTeamsChart.tsx      # Gráfica top equipos
│   └── ...
├── lib/
│   ├── api.ts                 # Cliente HTTP → FastAPI backend
│   └── auth.ts                # Lee cookie auth-info (username, role)
├── types/                     # TypeScript interfaces
├── proxy.ts                   # Middleware Next.js (auth JWT en edge)
└── next.config.ts
```

### 5.2 Flujo de Autenticación Frontend

```
Usuario ingresa credenciales en /login
    │
    ▼
Next.js API Route: POST /api/auth/login
    │   (actúa como proxy para no exponer el backend directo)
    ▼
FastAPI: POST /auth/login
    │   valida usuario + contraseña con bcrypt
    ▼
Devuelve: { access_token, username, role }
    │
    ▼
Next.js guarda:
  ├── Cookie httpOnly "auth-token" = JWT completo (no legible por JS)
  └── Cookie legible "auth-info" = base64({ username, role })
    │
    ▼
Redirect a / (dashboard)
    │
    ▼
En cada request: proxy.ts verifica "auth-token" con jose.jwtVerify()
  ├── Inválido → redirect a /login y borra cookies
  └── Válido → extrae role, verifica permisos por ruta
```

### 5.3 Rutas y Permisos

| Ruta | Acceso |
|---|---|
| `/login` | Público |
| `/` (Dashboard) | Usuario autenticado |
| `/competitions` | Usuario autenticado |
| `/teams` | Usuario autenticado |
| `/matches` | Usuario autenticado |
| `/ingestion` | Solo `admin` |
| `/users` | Solo `admin` |

---

## 6. Base de Datos — Supabase / PostgreSQL

### 6.1 Esquema de Tablas

```
countries
├── id (PK)
├── name (UNIQUE)
└── code

competitions
├── id (PK)
├── name (UNIQUE)
├── slug (UNIQUE)
└── region

seasons
├── id (PK)
├── competition_id (FK → competitions)
├── name
├── year_start
└── year_end
    UNIQUE(competition_id, name)

teams
├── id (PK)
├── name
├── slug (UNIQUE)
├── country_id (FK → countries)
└── crest_url
    UNIQUE(name, country_id)

venues
├── id (PK)
├── name
├── city
└── country_id (FK → countries)
    UNIQUE(name, country_id)

data_sources
├── id (PK)
├── name (UNIQUE)           ← "football-data.org", "UEFA", etc.
├── base_url
├── is_official
└── is_active

matches  ← TABLA CENTRAL
├── id (PK)
├── competition_id (FK)
├── season_id (FK)
├── home_team_id (FK → teams)
├── away_team_id (FK → teams)
├── venue_id (FK → venues)
├── data_source_id (FK → data_sources)
├── match_date
├── round / stage
├── status                  ← SCHEDULED, IN_PLAY, FINISHED, etc.
├── home_score / away_score
├── external_match_id       ← ID original en la fuente externa
├── source_url
├── last_updated_at
└── created_at
    UNIQUE(competition_id, season_id, home_team_id, away_team_id, match_date)
    UNIQUE(data_source_id, external_match_id)

match_events
├── id (PK)
├── match_id (FK → matches CASCADE DELETE)
├── team_id (FK → teams)
├── minute
├── event_type              ← GOAL, YELLOW_CARD, RED_CARD, etc.
├── player_name
└── description

standings
├── id (PK)
├── competition_id (FK)
├── season_id (FK)
├── team_id (FK)
├── played / won / drawn / lost
├── goals_for / goals_against
├── points
└── last_updated_at
    UNIQUE(competition_id, season_id, team_id)

ingestion_logs  ← AUDITORÍA DE SCRAPING
├── id (PK)
├── competition_id (FK)
├── data_source_id (FK)
├── status                  ← "success", "partial", "error"
├── records_found
├── records_inserted
├── records_updated
├── error_message
├── started_at
└── finished_at

users
├── id (PK SERIAL)
├── username (UNIQUE)
├── email (UNIQUE)
├── password_hash           ← bcrypt 12 rondas
├── role                    ← CHECK('admin', 'user')
├── is_active
├── avatar_url
├── created_at
└── updated_at
```

### 6.2 Conexión a Supabase

Supabase ofrece dos modos de conexión:

| Modo | Puerto | Cuándo usar |
|---|---|---|
| Session Pooler | 5432 | Servidor persistente (Railway, local) |
| Transaction Pooler | 6543 + `?pgbouncer=true` | Serverless (Vercel Functions) |

**Configuración crítica para SQLAlchemy + PgBouncer:**
```python
# database.py
engine = create_engine(
    DATABASE_URL,
    connect_args={"prepare_threshold": None},  # Evita DuplicatePreparedStatement
    poolclass=NullPool,  # Solo en Vercel (serverless)
)
```

---

## 7. Cómo Funciona el Scraping Web

### 7.1 Diseño del Scraper

El scraping usa el **patrón Strategy** con una clase base abstracta:

```python
# base_scraper.py
class BaseScraper(ABC):
    @abstractmethod
    def fetch_matches(self, competition_code: str, season: int) -> list[dict]:
        """Retorna lista de partidos normalizados"""
        ...
```

Hay dos implementaciones concretas:

| Clase | Fuente | Uso |
|---|---|---|
| `FootballDataOrgScraper` | football-data.org API v4 | Histórico de todas las ligas |
| `ChampionsLeagueMockScraper` | Datos mock UEFA | Snapshot rápido de CL |

### 7.2 Scraper Principal: `FootballDataOrgScraper`

**Endpoint de la fuente externa:**
```
GET https://api.football-data.org/v4/competitions/{competition_code}/matches
    ?season={year}
Headers:
    X-Auth-Token: {FOOTBALL_DATA_API_TOKEN}
```

**Ligas soportadas y sus códigos:**

| Liga | Código |
|---|---|
| Champions League | `CL` |
| Europa League | `EL` |
| Premier League | `PL` |
| La Liga | `PD` |
| Bundesliga | `BL1` |
| Serie A | `SA` |
| Ligue 1 | `FL1` |

**Proceso interno del scraper:**

```
1. LLAMADA HTTP
   requests.get(url, headers={"X-Auth-Token": token})
       │
       ├── 403 Forbidden → temporada restringida (plan gratuito)
       │       └── retorna lista vacía, continúa con la siguiente
       └── 200 OK → parsea JSON

2. PARSEO Y NORMALIZACIÓN
   response.json()["matches"]  ← lista de objetos match de la API
       │
       ▼
   Para cada match:
   {
     "external_match_id": match["id"],          # ID en football-data.org
     "competition_name": match["competition"]["name"],
     "competition_code": match["competition"]["code"],
     "season_name": match["season"]["id"],
     "home_team_name": match["homeTeam"]["name"],
     "away_team_name": match["awayTeam"]["name"],
     "home_team_crest": match["homeTeam"]["crest"],
     "away_team_crest": match["awayTeam"]["crest"],
     "match_date": match["utcDate"],
     "status": match["status"],
     "home_score": match["score"]["fullTime"]["home"],
     "away_score": match["score"]["fullTime"]["away"],
     "round": match["matchday"],
     "stage": match["stage"],
   }

3. RATE LIMITING
   time.sleep(1.2)  ← pausa entre requests (límite API gratuita: 10 req/min)
```

### 7.3 Ciclo Completo de Ingesta

```
Admin en /ingestion
  selecciona: Liga = "PL" (Premier League)
              Temporada inicio = 2022
              Temporada fin   = 2024
    │
    ▼
POST /ingestion/PL/history/run?season_start=2022&season_end=2024
    │
    ▼
IngestionService.run_competition_history_ingestion("PL", 2022, 2024)
    │
    ├── Para cada temporada en [2022, 2023, 2024]:
    │       │
    │       ├── FootballDataOrgScraper.fetch_matches("PL", 2022)
    │       │       └── GET football-data.org/v4/competitions/PL/matches?season=2022
    │       │               └── retorna lista de 380 partidos normalizados
    │       │
    │       └── IngestionService._ingest_normalized_matches(matches)
    │               └── (ver sección 8)
    │
    ├── Crea ingestion_log con: competition, status, records_found/inserted/updated
    │
    └── Devuelve resumen: {"inserted": 380, "updated": 12, "errors": 0}
```

---

## 8. Cómo se Almacena en Supabase

### 8.1 Proceso de Guardado (Upsert)

El servicio `_ingest_normalized_matches()` implementa un guardado inteligente con **prevención de duplicados**:

```
Para cada partido normalizado recibido del scraper:
    │
    ▼
1. GET OR CREATE: data_source
   SELECT * FROM data_sources WHERE name = 'football-data.org'
   Si no existe → INSERT

2. GET OR CREATE: competition
   SELECT * FROM competitions WHERE slug = 'premier-league'
   Si no existe → INSERT {name, slug, region}

3. GET OR CREATE: season
   SELECT * FROM seasons WHERE competition_id = X AND name = '2022'
   Si no existe → INSERT {competition_id, name, year_start, year_end}

4. GET OR CREATE: country (del equipo)
   SELECT * FROM countries WHERE name = 'England'
   Si no existe → INSERT

5. GET OR CREATE: home_team
   SELECT * FROM teams WHERE slug = 'manchester-city'
   Si no existe → INSERT {name, slug, country_id, crest_url}

6. GET OR CREATE: away_team  (igual que home_team)

7. UPSERT: match
   SELECT * FROM matches WHERE
       (data_source_id = X AND external_match_id = '123456')
       OR
       (competition_id = X AND season_id = X AND
        home_team_id = X AND away_team_id = X AND match_date = '2022-08-05')

   ├── Si existe → UPDATE (score, status, last_updated_at)
   └── Si no existe → INSERT

8. Contadores: records_found++, records_inserted++ o records_updated++
```

### 8.2 Doble Verificación de Duplicados

Los partidos tienen **dos restricciones UNIQUE** para máxima robustez:

```sql
-- Por ID externo (más rápida, evita duplicados del mismo proveedor)
UNIQUE(data_source_id, external_match_id)

-- Por clave natural (evita duplicados entre distintos proveedores)
UNIQUE(competition_id, season_id, home_team_id, away_team_id, match_date)
```

### 8.3 Auditoría en `ingestion_logs`

Cada ejecución de scraping genera un registro de auditoría:

```sql
INSERT INTO ingestion_logs (
    competition_id,
    data_source_id,
    status,           -- 'success' | 'partial' | 'error'
    records_found,    -- total retornados por el scraper
    records_inserted, -- nuevos en la DB
    records_updated,  -- actualizados (score cambió, etc.)
    error_message,    -- NULL si todo ok
    started_at,
    finished_at
)
```

### 8.4 Diagrama de Flujo DB Completo

```
football-data.org API
        │
        │ JSON (lista de matches)
        ▼
FootballDataOrgScraper
        │
        │ lista[dict] normalizada
        ▼
IngestionService._ingest_normalized_matches()
        │
        ├──────────────────────────────────────────────┐
        │  GET OR CREATE por cada entidad referenciada  │
        │  (en orden para respetar FKs)                 │
        │                                               │
        │  data_sources ──► competitions ──► seasons    │
        │  countries ──► teams                          │
        │  countries ──► venues                         │
        └──────────────────────────────────────────────┘
        │
        │ UPSERT match con todos los IDs resueltos
        ▼
┌──────────────────────────────────────────┐
│           Supabase PostgreSQL            │
│                                          │
│  data_sources  competitions  seasons     │
│       │              │          │        │
│       └──────────────┼──────────┘        │
│                      │                   │
│  countries ──► teams │                   │
│       │          │   │                   │
│       └──► venues│   │                   │
│                  │   │                   │
│                  ▼   ▼                   │
│              MATCHES (tabla central)     │
│                  │                       │
│                  ├──► match_events       │
│                  ├──► standings          │
│                  └──► ingestion_logs     │
└──────────────────────────────────────────┘
```

---

## 9. Autenticación y Autorización

### 9.1 JWT HS256

**Algoritmo:** HMAC-SHA256 (simétrico — misma clave en backend y frontend)

**Payload del token:**
```json
{
  "sub": "admin",
  "user_id": 1,
  "role": "admin",
  "exp": 1746000000
}
```

**Variables críticas que deben ser idénticas en Railway y Vercel:**
```
JWT_SECRET=<clave-secreta-larga-y-aleatoria>
```

### 9.2 Flujo Completo de Auth

```
[Navegador]          [Next.js/Vercel]         [FastAPI/Railway]    [Supabase]
    │                      │                         │                  │
    │  POST /api/auth/login │                         │                  │
    │  {username, password} │                         │                  │
    │──────────────────────►│                         │                  │
    │                       │  POST /auth/login       │                  │
    │                       │  {username, password}   │                  │
    │                       │────────────────────────►│                  │
    │                       │                         │ SELECT user      │
    │                       │                         │─────────────────►│
    │                       │                         │◄─────────────────│
    │                       │                         │ bcrypt.verify()  │
    │                       │                         │ JWT HS256 sign   │
    │                       │◄────────────────────────│                  │
    │                       │  {access_token, role}   │                  │
    │  Set-Cookie: auth-token (httpOnly)               │                  │
    │  Set-Cookie: auth-info (base64)                  │                  │
    │◄──────────────────────│                         │                  │
    │                       │                         │                  │
    │  GET /matches         │                         │                  │
    │  Cookie: auth-token   │                         │                  │
    │──────────────────────►│                         │                  │
    │                       │ proxy.ts: jwtVerify()   │                  │
    │                       │──────┐                  │                  │
    │                       │◄─────┘ (edge, 0ms)      │                  │
    │                       │  GET /matches           │                  │
    │                       │  Authorization: Bearer  │                  │
    │                       │────────────────────────►│                  │
    │                       │                         │ get_current_user │
    │                       │                         │ decode JWT       │
    │                       │                         │ SELECT matches   │
    │                       │                         │─────────────────►│
    │                       │◄────────────────────────│                  │
    │◄──────────────────────│                         │                  │
```

---

## 10. Despliegue en Producción

### 10.1 Topología

```
Internet
    │
    ├──► https://web-scrapping-soccer.vercel.app  (CDN Global)
    │         Next.js App en Vercel
    │         Middleware edge: verifica JWT sin latencia
    │              │
    │              │ HTTPS API calls
    │              ▼
    └──► https://webscrappingsoccer-production.up.railway.app
              FastAPI + Uvicorn en Railway
              Healthcheck: GET /health
                   │
                   │ PostgreSQL TCP :5432
                   ▼
              Supabase PostgreSQL
              Session Pooler (PgBouncer)
              aws-0-{region}.pooler.supabase.com
```

### 10.2 Variables de Entorno por Plataforma

**Railway (Backend):**
```
DATABASE_URL=postgresql://postgres.xxx:pass@aws-0-xxx.pooler.supabase.com:5432/postgres
FOOTBALL_DATA_API_TOKEN=<token de football-data.org>
JWT_SECRET=<clave segura>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<contraseña segura>
ALLOWED_ORIGINS=https://web-scrapping-soccer.vercel.app
APP_ENV=production
```

**Vercel (Frontend):**
```
NEXT_PUBLIC_API_URL=https://webscrappingsoccer-production.up.railway.app
JWT_SECRET=<misma clave que Railway>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<misma contraseña que Railway>
```

### 10.3 Inicio Local (Desarrollo)

```bash
# Desde la raíz del proyecto
bash dev.sh
# Levanta backend en :8000 y frontend en :3000
# Ctrl+C detiene ambos
```

---

## 11. Flujo Completo de una Sesión de Usuario

### Escenario: Admin ingesta datos de Premier League 2023

```
1. Admin abre navegador → https://web-scrapping-soccer.vercel.app
2. Redirigido a /login (no hay cookie válida)
3. Ingresa: admin / football2024
4. Next.js llama POST /api/auth/login
5. FastAPI valida → genera JWT → Next.js guarda cookies
6. Redirigido a /
7. Dashboard muestra: partidos recientes, top equipos, gráfica de goles
   (datos cargados desde FastAPI → Supabase)

8. Admin navega a /ingestion
   middleware verifica role == "admin" ✓

9. Selecciona: Premier League, temporadas 2022-2023
10. Pulsa "Ejecutar Ingesta"
11. Frontend: POST /ingestion/PL/history/run?season_start=2022&season_end=2023

12. Backend:
    a. IngestionService itera temporadas [2022, 2023]
    b. FootballDataOrgScraper llama football-data.org:
       GET /v4/competitions/PL/matches?season=2022
       GET /v4/competitions/PL/matches?season=2023
       (pausa 1.2s entre llamadas)
    c. Para cada partido recibido:
       - Resuelve/crea competition, season, teams, venue en Supabase
       - Upsert del partido (evita duplicados)
    d. Guarda ingestion_log con resultado

13. Frontend muestra: "Insertados: 380, Actualizados: 0, Errores: 0"
14. Admin navega a /matches → ve los 760 nuevos partidos listados
15. Admin cierra sesión → cookies borradas
```

---

## 12. Catálogo de la API REST

La API se sirve desde FastAPI. En desarrollo está disponible en `http://localhost:8000`.

### Cómo acceder a la documentación interactiva (Swagger UI)

FastAPI genera automáticamente dos interfaces de documentación sin configuración adicional:

| Interfaz | URL local | URL producción | Descripción |
|---|---|---|---|
| **Swagger UI** | `http://localhost:8000/docs` | `https://webscrappingsoccer-production.up.railway.app/docs` | Interfaz visual para explorar y probar endpoints |
| **ReDoc** | `http://localhost:8000/redoc` | `https://webscrappingsoccer-production.up.railway.app/redoc` | Documentación de referencia más detallada |
| **OpenAPI JSON** | `http://localhost:8000/openapi.json` | `https://webscrappingsoccer-production.up.railway.app/openapi.json` | Esquema JSON estándar (importable en Postman) |

**Pasos para usar Swagger UI:**

1. Asegúrate de que el backend está corriendo (`bash dev.sh` o `uvicorn app.main:app --reload`)
2. Abre el navegador en `http://localhost:8000/docs`
3. Verás la lista completa de endpoints agrupados por módulo
4. Para endpoints protegidos (requieren JWT), haz clic en **Authorize** (candado arriba a la derecha)
5. Primero ejecuta `POST /auth/login` para obtener el `access_token`
6. Copia el token y pégalo en **Authorize** → campo `bearerAuth` → `Bearer <token>`
7. Ahora puedes probar cualquier endpoint protegido directamente desde el navegador

**Importar en Postman:**

1. Abre Postman → **Import**
2. Pega la URL: `http://localhost:8000/openapi.json`
3. Postman importa todos los endpoints automáticamente con sus schemas

> **Base URL producción:** `https://webscrappingsoccer-production.up.railway.app`

### Convenciones

| Aspecto | Detalle |
|---|---|
| Formato | JSON (`Content-Type: application/json`) |
| Auth | `Authorization: Bearer <JWT>` en el header |
| Errores | `{"detail": "mensaje"}` con código HTTP estándar |
| Fechas | ISO 8601 — `YYYY-MM-DDTHH:MM:SS` |

---

### 12.1 Health

#### `GET /health`
Verifica el estado del servicio y la conectividad con la base de datos. No requiere autenticación.

**Response `200 OK`:**
```json
{
  "status": "ok",
  "service": "football-data-api",
  "database": {
    "configured": true,
    "connected": true
  }
}
```

Si la DB no está disponible, `connected` es `false` y aparece `"error": "mensaje"`.

---

### 12.2 Autenticación (`/auth`)

#### `POST /auth/login`
Autentica al usuario y devuelve un JWT. No requiere autenticación previa.

**Request body:**
```json
{
  "username": "admin",
  "password": "football2024"
}
```

**Response `200 OK`:**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "username": "admin",
  "role": "admin"
}
```

**Errores:** `401` si las credenciales son incorrectas.

---

#### `GET /auth/me`
Devuelve los datos del usuario autenticado actualmente.

**Auth:** Bearer JWT requerido.

**Response `200 OK`:**
```json
{
  "user_id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin",
  "avatar_url": null
}
```

**Errores:** `401` si el token es inválido o expiró.

---

### 12.3 Competiciones (`/competitions`)

#### `GET /competitions`
Lista todas las competiciones registradas en la base de datos. No requiere autenticación.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "name": "Premier League",
    "slug": "premier-league",
    "region": "England"
  }
]
```

---

#### `GET /competitions/{code}/standings`
Obtiene la tabla de posiciones de una competición consultando directamente a football-data.org. No requiere autenticación.

**Path params:**
| Parámetro | Tipo | Descripción |
|---|---|---|
| `code` | string | Código de liga (`PL`, `PD`, `BL1`, `SA`, `FL1`, `CL`, `EL`) |

**Response `200 OK`:** JSON directo de la API de football-data.org con la tabla de posiciones.

**Errores:** `403` si la temporada no está disponible en el plan gratuito, `404` si el código no existe, `503` si la API externa no responde.

---

### 12.4 Equipos (`/teams`)

#### `GET /teams`
Lista todos los equipos registrados. No requiere autenticación.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "name": "Manchester City",
    "slug": "manchester-city",
    "country": "England",
    "crest_url": "https://crests.football-data.org/65.png"
  }
]
```

---

### 12.5 Partidos (`/matches`)

Todos los endpoints de partidos son **públicos** (no requieren autenticación).

#### `GET /matches`
Lista partidos con filtros opcionales.

**Query params:**
| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `status` | string \| null | `null` | Filtra por estado: `SCHEDULED`, `IN_PLAY`, `FINISHED`, `POSTPONED` |
| `limit` | int | `100` | Máximo de resultados (1–500) |

**Response `200 OK`:** Lista de objetos `MatchRead` (ver esquema completo en 12.8).

---

#### `GET /matches/upcoming`
Partidos futuros ordenados por fecha ascendente.

**Query params:**
| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `limit` | int | `50` | Máximo de resultados (1–200) |

---

#### `GET /matches/recent`
Partidos recientes finalizados, ordenados por fecha descendente.

**Query params:**
| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `limit` | int | `50` | Máximo de resultados (1–200) |

---

#### `GET /matches/by-date`
Partidos de una fecha específica.

**Query params:**
| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `match_date` | date | Sí | Formato `YYYY-MM-DD` |

**Ejemplo:** `GET /matches/by-date?match_date=2024-03-15`

---

#### `GET /matches/by-competition/{competition_id}`
Todos los partidos de una competición.

**Path params:**
| Parámetro | Tipo | Descripción |
|---|---|---|
| `competition_id` | int | ID interno de la competición |

---

#### `GET /matches/by-team/{team_id}`
Todos los partidos de un equipo (local o visitante).

**Path params:**
| Parámetro | Tipo | Descripción |
|---|---|---|
| `team_id` | int | ID interno del equipo |

---

### 12.6 Estadísticas (`/stats`)

Todos los endpoints de estadísticas son **públicos**.

#### `GET /stats/top-teams`
Top equipos por goles y victorias acumuladas.

**Query params:**
| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `limit` | int | `10` | Cantidad de equipos (1–30) |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "name": "Manchester City",
    "crest_url": "https://crests.football-data.org/65.png",
    "total_goals": 94,
    "total_wins": 28,
    "total_played": 38
  }
]
```

---

#### `GET /stats/goals-timeline`
Historial de goles de un equipo en sus últimos 20 partidos.

**Query params:**
| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `team_id` | int | Sí | ID interno del equipo |

**Response `200 OK`:**
```json
[
  { "date": "15/03/24", "scored": 3, "conceded": 1 },
  { "date": "08/03/24", "scored": 2, "conceded": 0 }
]
```

---

### 12.7 Ingesta de Datos (`/ingestion`)

Los endpoints de ingesta **no tienen protección JWT en el código** (son de administración interna).

#### `POST /ingestion/champions-league/run`
Ejecuta ingesta rápida de la Champions League con datos mock de UEFA (snapshot actual).

**Response `200 OK`:**
```json
{
  "status": "success",
  "competition": "Champions League",
  "records_found": 125,
  "records_inserted": 80,
  "records_updated": 45,
  "duration_seconds": 3.2
}
```

---

#### `POST /ingestion/champions-league/history/run`
Ingesta histórica de la Champions League desde football-data.org.

**Query params:**
| Parámetro | Tipo | Default | Rango | Descripción |
|---|---|---|---|---|
| `start_season` | int | `2020` | 2020–2026 | Temporada de inicio (año de comienzo) |
| `end_season` | int | `2025` | 2020–2026 | Temporada de fin |

---

#### `POST /ingestion/{competition_code}/history/run`
Ingesta histórica de cualquier liga soportada.

**Path params:**
| Parámetro | Tipo | Descripción |
|---|---|---|
| `competition_code` | string | `CL`, `EL`, `PL`, `PD`, `BL1`, `SA`, `FL1` |

**Query params:**
| Parámetro | Tipo | Default | Rango | Descripción |
|---|---|---|---|---|
| `start_season` | int | `2023` | 2000–2026 | Temporada de inicio |
| `end_season` | int | `2025` | 2000–2026 | Temporada de fin |

**Ejemplo cURL:**
```bash
curl -X POST \
  "http://localhost:8000/ingestion/PL/history/run?start_season=2022&end_season=2024"
```

**Errores:** `400` si el código de liga no es válido, `500` si falla la conexión con football-data.org.

---

### 12.8 Usuarios (`/users`) — Solo Admin

Todos los endpoints requieren **Bearer JWT con `role = "admin"`**.

#### `GET /users`
Lista todos los usuarios registrados.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "is_active": true,
    "avatar_url": null,
    "created_at": "2024-01-15T10:00:00"
  }
]
```

---

#### `POST /users`
Crea un nuevo usuario.

**Auth:** Admin JWT requerido.

**Request body:**
```json
{
  "username": "analista1",
  "email": "analista1@example.com",
  "password": "contraseña-segura",
  "role": "user"
}
```

**Response `201 Created`:** Objeto `UserRead` del usuario creado.

**Errores:** `409 Conflict` si el username ya existe.

---

#### `PUT /users/{user_id}`
Actualiza datos de un usuario existente. Solo se actualizan los campos enviados (campos `null` se ignoran).

**Path params:** `user_id` (int)

**Request body (todos opcionales):**
```json
{
  "email": "nuevo@example.com",
  "password": "nueva-contraseña",
  "role": "admin",
  "is_active": false,
  "avatar_url": "https://..."
}
```

**Response `200 OK`:** Objeto `UserRead` actualizado.

**Errores:** `404` si el usuario no existe.

---

#### `DELETE /users/{user_id}`
Elimina un usuario.

**Path params:** `user_id` (int)

**Response `204 No Content`**

**Errores:** `404` si no existe, `400` si el admin intenta eliminarse a sí mismo.

---

### 12.9 Esquema Completo — `MatchRead`

Todos los endpoints de `/matches` devuelven objetos con esta estructura:

```json
{
  "id": 1,
  "competition_id": 2,
  "competition_name": "Premier League",
  "season_id": 5,
  "season_name": "2023",
  "home_team_id": 10,
  "home_team_name": "Arsenal",
  "home_team_crest": "https://crests.football-data.org/57.png",
  "away_team_id": 11,
  "away_team_name": "Chelsea",
  "away_team_crest": "https://crests.football-data.org/61.png",
  "match_date": "2024-03-15T15:00:00",
  "round": "28",
  "stage": "REGULAR_SEASON",
  "status": "FINISHED",
  "home_score": 2,
  "away_score": 1,
  "venue_name": "Emirates Stadium",
  "country_name": "England",
  "source_name": "football-data.org",
  "source_url": null,
  "external_match_id": "462185",
  "last_updated_at": "2024-03-16T00:05:00"
}
```

---

### 12.10 Resumen Visual de Endpoints

```
PÚBLICO (sin auth)
├── GET  /health
├── POST /auth/login
├── GET  /competitions
├── GET  /competitions/{code}/standings
├── GET  /teams
├── GET  /matches                          ?status= &limit=
├── GET  /matches/upcoming                 ?limit=
├── GET  /matches/recent                   ?limit=
├── GET  /matches/by-date                  ?match_date=
├── GET  /matches/by-competition/{id}
├── GET  /matches/by-team/{id}
├── GET  /stats/top-teams                  ?limit=
├── GET  /stats/goals-timeline             ?team_id=
├── POST /ingestion/champions-league/run
├── POST /ingestion/champions-league/history/run  ?start_season= &end_season=
└── POST /ingestion/{code}/history/run     ?start_season= &end_season=

JWT REQUERIDO
└── GET  /auth/me

ADMIN JWT REQUERIDO
├── GET    /users
├── POST   /users
├── PUT    /users/{id}
└── DELETE /users/{id}
```

---

## Apéndice: Límites y Consideraciones

| Aspecto | Límite / Nota |
|---|---|
| football-data.org (plan gratuito) | 10 req/min; temporadas históricas restringidas pueden devolver 403 |
| JWT Expiration | 24 horas (configurable con `JWT_EXPIRE_HOURS`) |
| Paginación partidos | 10/20/30/40 registros por página |
| Rol admin por defecto | Creado en startup si no existe; credenciales en `.env` |
| Supabase free tier | 500 MB de almacenamiento, 2 GB transferencia/mes |
| Railway sleep | Plan gratuito puede poner a dormir el servicio tras inactividad |
