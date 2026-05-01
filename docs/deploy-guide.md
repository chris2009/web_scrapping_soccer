# Guía de Deploy: FastAPI (Railway) + Next.js (Vercel)

Cuando tu proyecto tiene un backend Python (FastAPI) y un frontend Next.js,
**no puedes deployar todo en Vercel** porque Vercel es una plataforma serverless
optimizada para JavaScript/TypeScript. Python con uvicorn requiere un servidor persistente.

La solución: **dos plataformas complementarias y gratuitas**.

| Servicio | Plataforma | Por qué |
|---------|-----------|---------|
| Backend FastAPI | Railway | Soporta servidores Python persistentes |
| Frontend Next.js | Vercel | Plataforma nativa de Next.js |

---

## Estructura del repositorio esperada

```
mi-proyecto/
├── backend/              ← FastAPI
│   ├── app/
│   │   └── main.py       ← app = FastAPI(...)
│   ├── requirements.txt
│   ├── Procfile          ← comando de inicio para Railway
│   └── railway.toml      ← configuración de Railway
├── frontend/             ← Next.js
│   ├── app/
│   ├── package.json
│   └── proxy.ts          ← protección de rutas (Next.js 16+)
└── vercel.json           ← configuración de Vercel (mínima)
```

---

## Parte 1 — Preparar el código

### 1.1 Archivo `backend/Procfile`

Railway necesita saber cómo arrancar el servidor:

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

> `$PORT` es asignado automáticamente por Railway. No pongas un número fijo.

### 1.2 Archivo `backend/railway.toml`

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
```

### 1.3 Archivo `vercel.json` (en la raíz)

```json
{}
```

Solo un JSON vacío. La configuración va en la UI de Vercel, no aquí.

### 1.4 Base de datos — formato de la URL

Supabase tiene dos modos de conexión. Elige el correcto según el entorno:

| Entorno | Tipo | Puerto | URL format |
|---------|------|--------|-----------|
| Local / Railway | Session Pooler | **5432** | `postgresql://postgres.<proj>:<pass>@aws-0-<region>.pooler.supabase.com:5432/postgres` |
| Vercel (serverless) | Transaction Pooler | **6543** | `postgresql://postgres.<proj>:<pass>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true` |

Railway es servidor persistente → usa puerto **5432**.

### 1.5 Variables compartidas críticas

`JWT_SECRET` debe ser **idéntico** en Railway y en Vercel.
Si son diferentes, el login falla aunque las credenciales sean correctas
(Railway firma el token, Vercel lo verifica — necesitan la misma clave).

Genera un valor seguro y úsalo en los dos:

```
mi-app-2026-jwt-secreto-xK9mQpR7vNwJ4sL8
```

---

## Parte 2 — Deploy del Backend en Railway

### 2.1 Crear cuenta

Ve a **railway.app** → Sign in with GitHub.

### 2.2 Conectar GitHub

Railway → Account Settings → Connected Accounts → GitHub → **Configure** →
selecciona **All repositories** o el repo específico → Save.

### 2.3 Crear proyecto

Railway → **New Project** → **Deploy from GitHub repo** →
selecciona tu repositorio.

### 2.4 Configurar el servicio

Una vez creado el servicio, haz clic en él y configura:

**Settings → Service:**
- **Root Directory**: `backend`

**Settings → Deploy:**
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 2.5 Agregar variables de entorno

Railway → tu servicio → **Variables** → Add Variable:

```
DATABASE_URL         = postgresql://postgres.<proj>:<pass>@...5432/postgres
FOOTBALL_DATA_API_TOKEN = tu_token_aqui
JWT_SECRET           = mi-app-2026-jwt-secreto-xK9mQpR7vNwJ4sL8
ADMIN_USERNAME       = admin
ADMIN_PASSWORD       = tu_password_seguro
ALLOWED_ORIGINS      = https://tu-app.vercel.app
```

> `ALLOWED_ORIGINS` es para CORS — debe ser la URL exacta de tu frontend en Vercel.
> Si aún no la tienes, ponla después de deployar Vercel.

### 2.6 Generar dominio público

Railway → tu servicio → **Settings → Networking → Generate Domain**

- Puerto: el que usa tu app (uvicorn por defecto usa **8080**)
- Railway te dará una URL tipo: `https://mi-app-production.up.railway.app`

Guarda esa URL — la necesitas para Vercel.

### 2.7 Verificar que funciona

Abre en el browser:
```
https://mi-app-production.up.railway.app/health
```

Debe responder JSON con `status: ok`. Si lo hace, el backend está listo.

---

## Parte 3 — Deploy del Frontend en Vercel

### 3.1 Crear cuenta

Ve a **vercel.com** → Sign in with GitHub.

### 3.2 Importar proyecto

Vercel → **Add New Project** → importa tu repo de GitHub.

### 3.3 Configurar Root Directory ⚠️

**Este es el paso más importante.** En la pantalla de configuración del proyecto,
antes de hacer Deploy, busca el campo **Root Directory** y escribe:

```
frontend
```

> Si no lo ves durante la importación, ve después a:
> **Settings → Build & Development Settings → Root Directory**

Esto le dice a Vercel que el proyecto Next.js está en `frontend/`, no en la raíz.

### 3.4 Agregar variables de entorno

En la misma pantalla de configuración (o después en Settings → Environment Variables):

```
NEXT_PUBLIC_API_URL  = https://mi-app-production.up.railway.app
JWT_SECRET           = mi-app-2026-jwt-secreto-xK9mQpR7vNwJ4sL8
ADMIN_USERNAME       = admin
ADMIN_PASSWORD       = tu_password_seguro
```

> `NEXT_PUBLIC_API_URL` debe tener `https://` al principio.
> `JWT_SECRET` debe ser **exactamente igual** al de Railway.

### 3.5 Deploy

Haz clic en **Deploy**. Vercel detecta Next.js automáticamente y construye el proyecto.

### 3.6 Actualizar ALLOWED_ORIGINS en Railway

Una vez que Vercel te dé la URL final (ej: `https://mi-app.vercel.app`),
vuelve a Railway → Variables → actualiza:

```
ALLOWED_ORIGINS = https://mi-app.vercel.app
```

Railway hace redeploy automático al guardar variables.

---

## Parte 4 — Verificación final

### Checklist

- [ ] Railway: `/health` responde 200
- [ ] Railway: variables configuradas incluyendo `ALLOWED_ORIGINS`
- [ ] Vercel: Root Directory = `frontend`
- [ ] Vercel: `NEXT_PUBLIC_API_URL` = URL de Railway con `https://`
- [ ] Vercel: `JWT_SECRET` = mismo valor que Railway
- [ ] Login funciona en la URL de Vercel
- [ ] El dashboard carga datos

### Flujo de una request en producción

```
Browser → Vercel (Next.js)
  ├── Páginas: /login, /, /matches  → renderizadas por Next.js
  ├── API routes: /api/auth/login   → Next.js llama a Railway
  │                                    Railway verifica credenciales
  │                                    Devuelve JWT firmado
  │                                    Next.js guarda cookie auth-token
  └── proxy.ts verifica cookie en cada request → redirige a /login si no hay token
```

---

## Parte 5 — Problemas comunes y soluciones

### Login redirige de vuelta a /login después de ingresar credenciales

**Causa**: `JWT_SECRET` diferente entre Railway y Vercel.
**Solución**: Copia el valor exacto de uno y pégalo en el otro. Redeploy Vercel.

### CORS error en el browser

**Causa**: `ALLOWED_ORIGINS` en Railway no incluye la URL de Vercel.
**Solución**: Railway → Variables → `ALLOWED_ORIGINS = https://tu-app.vercel.app`

### `TypeError: Invalid URL` o `Failed to parse URL`

**Causa**: `NEXT_PUBLIC_API_URL` no tiene `https://` al principio.
**Solución**: Vercel → Variables → `NEXT_PUBLIC_API_URL = https://tu-url.up.railway.app`

### 500 en el login

**Causa**: Railway no está corriendo o `NEXT_PUBLIC_API_URL` apunta a la URL incorrecta.
**Solución**: Verifica que Railway esté Online y que la URL sea correcta.

### Railway: `Build failed`

**Causa**: Root Directory no está configurado como `backend`.
**Solución**: Railway → Settings → Service → Root Directory = `backend` → Redeploy.

### Variables de entorno no se aplican en Vercel

**Causa**: Las variables `NEXT_PUBLIC_*` se hornean en el build. Cambiarlas no basta —
hay que hacer Redeploy.
**Solución**: Vercel → Deployments → botón `...` → Redeploy.

---

## Parte 6 — Actualizaciones de código

Cuando hagas push a `main`:
- **Railway**: redeploya automáticamente el backend
- **Vercel**: redeploya automáticamente el frontend

No hay que hacer nada manual para actualizaciones de código.

Para cambios de variables de entorno:
- **Railway**: redeploya automático al guardar
- **Vercel**: requiere Redeploy manual (Variables no cambian builds existentes)

---

## Resumen de URLs importantes

| Qué | URL |
|-----|-----|
| Frontend (producción) | `https://tu-app.vercel.app` |
| Backend API | `https://tu-app-production.up.railway.app` |
| Health check | `https://tu-app-production.up.railway.app/health` |
| API docs (Swagger) | `https://tu-app-production.up.railway.app/docs` |
