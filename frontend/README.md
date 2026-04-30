# Frontend — Football Data App

Next.js 16 dashboard con autenticación por roles, explorador de partidos y panel de ingesta multi-liga.

## Stack

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Next.js   | 16.2.4  | App Router, SSR, middleware |
| React     | 19.2.5  | UI |
| TypeScript | 5.7.2  | Tipado |
| Tailwind CSS | 3.4 | Estilos |
| jose      | 5.x     | Verificación JWT en middleware Edge |
| lucide-react | 0.468 | Iconos |

## Arranque

```bash
# Desde la raíz del monorepo (arranca backend + frontend juntos)
bash dev.sh

# Solo el frontend
cd frontend
npm install
npm run dev
```

Frontend disponible en `http://localhost:3000`  
El backend debe estar en `http://localhost:8000`

## Variables de entorno

Copia `.env.example` a `.env.local` y configura:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000

# Credenciales del administrador por defecto
ADMIN_USERNAME=admin
ADMIN_PASSWORD=football2024

# Debe coincidir con JWT_SECRET del backend
JWT_SECRET=change-this-secret-in-production
```

> Si no defines `ADMIN_USERNAME` / `ADMIN_PASSWORD`, el backend usa `admin` / `football2024`.

---

## Usuarios de prueba

El backend crea automáticamente el admin al arrancar si no existe ningún usuario.

| Username | Password      | Rol   | Descripción |
|----------|--------------|-------|-------------|
| `admin`  | `football2024` | Admin | Acceso completo |

Para crear más usuarios: ir a `http://localhost:3000/users` (solo visible para admins).

### Diferencias por rol

| Sección           | Admin | User |
|-------------------|:-----:|:----:|
| Dashboard         | ✅    | ✅   |
| Competitions      | ✅    | ✅   |
| Teams             | ✅    | ✅   |
| Matches           | ✅    | ✅   |
| Ingestion         | ✅    | ❌   |
| User Management   | ✅    | ❌   |

---

## Estructura de archivos

```text
frontend/
├── app/
│   ├── layout.tsx                  Root layout (html + body, sin sidebar)
│   ├── globals.css
│   ├── (main)/                     Grupo de rutas protegidas (con sidebar)
│   │   ├── layout.tsx              Layout con sidebar oscuro
│   │   ├── page.tsx                Dashboard — stat cards + últimos partidos
│   │   ├── competitions/page.tsx   Catálogo de competiciones con colores por liga
│   │   ├── teams/page.tsx          Tabla de equipos
│   │   ├── matches/page.tsx        Explorador con filtros, paginación y búsqueda
│   │   ├── ingestion/page.tsx      Panel multi-liga (solo admin)
│   │   └── users/page.tsx          Gestión de usuarios (solo admin)
│   ├── login/page.tsx              Página de login (sin sidebar)
│   └── api/
│       ├── auth/login/route.ts     Llama a FastAPI /auth/login, setea cookies
│       ├── auth/logout/route.ts    Limpia cookies
│       ├── users/route.ts          Proxy GET/POST → FastAPI /users
│       └── users/[id]/route.ts     Proxy PUT/DELETE → FastAPI /users/{id}
├── components/
│   ├── Sidebar.tsx         Sidebar oscuro, nav por rol, usuario logueado
│   ├── MatchesTable.tsx    Tabla con paginación, búsqueda y logos de clubs
│   ├── DashboardCards.tsx  Tarjetas de estadísticas con gradientes
│   ├── StatusBadge.tsx     Badge de estado con punto animado (Live)
│   ├── CompetitionSelector.tsx
│   ├── TeamSelector.tsx
│   ├── DateFilter.tsx
│   ├── LoadingState.tsx
│   └── ErrorState.tsx
├── lib/
│   ├── api.ts              Cliente fetch hacia FastAPI
│   └── auth.ts             getAuthInfo() — lee cookie auth-info (rol, username)
├── types/
│   ├── match.ts            Incluye home_team_crest / away_team_crest
│   ├── competition.ts
│   └── team.ts
└── middleware.ts            Verifica JWT con jose, protege rutas por rol
```

---

## Autenticación

### Flujo

```
1. Usuario envía credenciales en /login
2. Next.js API route → llama FastAPI POST /auth/login
3. FastAPI valida bcrypt + devuelve JWT firmado (HS256, 24h)
4. Se setean dos cookies:
   - auth-token (httpOnly) → para el middleware
   - auth-info  (readable) → para mostrar nombre/rol en UI
5. Middleware verifica auth-token en cada request
6. /users e /ingestion solo permiten rol "admin"
```

### Cookies

| Cookie     | httpOnly | Contenido |
|------------|:--------:|-----------|
| `auth-token` | ✅ | JWT completo (middleware lo verifica con jose) |
| `auth-info`  | ❌ | base64(JSON{username, role}) — lo lee el Sidebar |

### Llamadas a FastAPI protegidas (User Management)

Las páginas de gestión de usuarios NO llaman directamente a FastAPI desde el browser. Pasan por proxy routes de Next.js (`/api/users/*`) que leen el `auth-token` httpOnly del servidor y lo reenvían como `Authorization: Bearer` al backend.

---

## Decisiones técnicas relevantes

| Decisión | Motivo |
|----------|--------|
| `suppressHydrationWarning` en `<form>` del login | Extensión Psono (password manager) inyecta clase en el form antes de que React hidrate |
| `suppressHydrationWarning` en `<html>` | Extensiones de browser añaden `class="hydrated"` |
| Fechas con timezone `America/Lima` | Evita mismatch SSR/CSR por diferencia de zona horaria |
| Proxy routes para user management | El `auth-token` es httpOnly → el browser no puede leerlo → el proxy lo lee server-side |
| `jose` en middleware | El middleware corre en Edge runtime — jose es compatible, jsonwebtoken no |
| `npm overrides.postcss=8.5.12` | Evita CVE en postcss transitivo |
| `prepare_threshold: None` en SQLAlchemy | Evita `DuplicatePreparedStatement` con Supabase PgBouncer |

---

## Comandos útiles

```bash
# Instalar dependencias
npm install

# Correr en desarrollo
npm run dev

# Audit de seguridad
npm audit

# Build de producción
npm run build

# Limpiar si hay problemas de permisos (mezcla Windows/WSL)
rm -rf node_modules .next && npm install
```
