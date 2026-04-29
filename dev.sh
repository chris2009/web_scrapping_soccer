#!/usr/bin/env bash
# Start backend (FastAPI) and frontend (Next.js) together.
# Run from the project root: bash dev.sh
# Press Ctrl+C to stop both services.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BACKEND_DIR="$ROOT/backend"
FRONTEND_DIR="$ROOT/frontend"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RESET='\033[0m'

log() { echo -e "${CYAN}[dev]${RESET} $*"; }
err() { echo -e "${RED}[dev]${RESET} $*" >&2; }

# Validate directories
[[ -d "$BACKEND_DIR" ]] || { err "backend/ not found"; exit 1; }
[[ -d "$FRONTEND_DIR" ]] || { err "frontend/ not found"; exit 1; }

# Validate backend venv
if [[ ! -f "$BACKEND_DIR/venv/bin/activate" ]]; then
    err "Backend venv not found. Create it first:"
    err "  cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Validate frontend node_modules
if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
    log "node_modules not found — running npm install..."
    (cd "$FRONTEND_DIR" && npm install)
fi

cleanup() {
    log "Shutting down..."
    [[ -n "${BACKEND_PID:-}" ]] && kill "$BACKEND_PID" 2>/dev/null || true
    [[ -n "${FRONTEND_PID:-}" ]] && kill "$FRONTEND_PID" 2>/dev/null || true
    wait 2>/dev/null || true
    log "Done."
}
trap cleanup EXIT INT TERM

# Start backend
log "Starting backend on http://localhost:8000 ..."
(
    cd "$BACKEND_DIR"
    # shellcheck disable=SC1091
    source venv/bin/activate
    python -m uvicorn app.main:app --reload --port 8000 2>&1 | sed "s/^/${GREEN}[backend]${RESET} /"
) &
BACKEND_PID=$!

# Small delay so backend port is likely bound before frontend starts
sleep 1

# Start frontend
log "Starting frontend on http://localhost:3000 ..."
(
    cd "$FRONTEND_DIR"
    npm run dev 2>&1 | sed "s/^/${CYAN}[frontend]${RESET} /"
) &
FRONTEND_PID=$!

log "Both services running. Press Ctrl+C to stop."
log "  Backend  → http://localhost:8000"
log "  Frontend → http://localhost:3000"
log "  API docs → http://localhost:8000/docs"

wait "$BACKEND_PID" "$FRONTEND_PID"
