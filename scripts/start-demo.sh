#!/usr/bin/env bash
# scripts/start-demo.sh
# Starts Maxim Broadcast backend (and optionally frontend dev server).
# Prints the URL to access the app.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

PORT="${PORT:-4000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
NODE_ENV="${NODE_ENV:-production}"

# ── Helper ────────────────────────────────────────────────────────────────────
log() { echo -e "\033[1;36m[Maxim]\033[0m $*"; }
ok()  { echo -e "\033[1;32m[OK]\033[0m $*"; }
err() { echo -e "\033[1;31m[ERR]\033[0m $*" >&2; }

# ── Detect access URL ─────────────────────────────────────────────────────────
get_app_url() {
  if [[ -n "${CODESPACE_NAME:-}" ]]; then
    echo "https://${CODESPACE_NAME}-${PORT}.app.github.dev"
  else
    echo "http://localhost:${PORT}"
  fi
}

# ── Start backend ─────────────────────────────────────────────────────────────
start_backend() {
  log "Starting backend on port ${PORT}..."
  cd "${ROOT_DIR}/backend"

  # Copy env if not present
  if [[ ! -f .env ]]; then
    cp .env.example .env
  fi

  NODE_ENV="${NODE_ENV}" \
  PORT="${PORT}" \
  DEMO_MODE="true" \
  CODESPACE_MODE="true" \
    node src/index.js &

  BACKEND_PID=$!
  log "Backend PID: ${BACKEND_PID}"

  # Wait up to 15 s for backend to respond
  READY=0
  for i in $(seq 1 15); do
    if curl -sf "http://localhost:${PORT}/health" > /dev/null 2>&1; then
      ok "Backend is up!"
      READY=1
      break
    fi
    sleep 1
  done
  if [[ ${READY} -eq 0 ]]; then
    err "Backend did not start within 15 seconds."
    exit 1
  fi
}

# ── Start frontend dev server (development mode only) ─────────────────────────
start_frontend_dev() {
  if [[ "${NODE_ENV}" == "production" ]]; then
    log "Production mode: frontend is served by the backend at port ${PORT}."
    return
  fi

  log "Starting frontend dev server on port ${FRONTEND_PORT}..."
  cd "${ROOT_DIR}/frontend"
  VITE_API_URL="http://localhost:${PORT}" npm run dev -- --port "${FRONTEND_PORT}" &
  ok "Frontend dev PID: $!"
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
  local app_url
  app_url="$(get_app_url)"

  start_backend
  start_frontend_dev

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  🚀  Maxim Broadcast is running!"
  echo ""
  echo "  App URL : ${app_url}"
  echo "  Health  : ${app_url}/health"
  echo "  API     : ${app_url}/api"
  echo ""
  echo "  Demo credentials:"
  echo "    admin@demo.com  /  demo123  (Administrator)"
  echo "    demo@demo.com   /  demo123  (User)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Keep script alive while background jobs run
  wait
}

main
