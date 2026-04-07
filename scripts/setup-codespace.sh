#!/usr/bin/env bash
# scripts/setup-codespace.sh
# Automatic initialization script for GitHub Codespaces.
# Installs all dependencies, seeds demo data, builds frontend,
# starts the app, and prints the access URL.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

PORT="${PORT:-4000}"

# ── Colours ───────────────────────────────────────────────────────────────────
log()  { echo -e "\033[1;34m[setup]\033[0m $*"; }
ok()   { echo -e "\033[1;32m[OK]\033[0m $*"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $*"; }
err()  { echo -e "\033[1;31m[ERR]\033[0m $*" >&2; }

# ── Step 1: Install backend dependencies ─────────────────────────────────────
log "Installing backend dependencies..."
cd "${ROOT_DIR}/backend"
npm ci --prefer-offline 2>/dev/null || npm install
ok "Backend dependencies installed."

# ── Step 2: Install frontend dependencies ────────────────────────────────────
log "Installing frontend dependencies..."
cd "${ROOT_DIR}/frontend"
npm ci --prefer-offline 2>/dev/null || npm install
ok "Frontend dependencies installed."

# ── Step 3: Build frontend for production ────────────────────────────────────
log "Building frontend..."
cd "${ROOT_DIR}/frontend"
npm run build
ok "Frontend built."

# ── Step 4: Configure backend .env ───────────────────────────────────────────
log "Configuring backend environment..."
cd "${ROOT_DIR}/backend"
if [[ ! -f .env ]]; then
  cp .env.example .env
fi

# Apply Codespaces-specific settings
# NOTE: The JWT_SECRET below is intentionally public — it is ONLY for demo/Codespaces use.
#       Never use this value in a production deployment.
{
  echo "NODE_ENV=production"
  echo "PORT=${PORT}"
  echo "DEMO_MODE=true"
  echo "CODESPACE_MODE=true"
  echo "JWT_SECRET=demo-secret-key-only-not-for-production"
  echo "LOG_LEVEL=info"
  if [[ -n "${CODESPACE_NAME:-}" ]]; then
    echo "FRONTEND_URL=https://${CODESPACE_NAME}-${PORT}.app.github.dev"
  else
    echo "FRONTEND_URL=http://localhost:${PORT}"
  fi
} >> .env
ok "Backend .env configured."

# ── Step 5: Start backend (background) ───────────────────────────────────────
log "Starting backend server on port ${PORT}..."
cd "${ROOT_DIR}/backend"
node src/index.js &
BACKEND_PID=$!

# Wait up to 20 seconds for backend to be healthy
for i in $(seq 1 20); do
  if curl -sf "http://localhost:${PORT}/health" > /dev/null 2>&1; then
    ok "Backend is healthy (PID ${BACKEND_PID})."
    break
  fi
  if [[ $i -eq 20 ]]; then
    err "Backend did not start within 20 seconds."
    kill "${BACKEND_PID}" 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

# ── Step 6: Seed demo data ────────────────────────────────────────────────────
log "Seeding demo data..."
node "${SCRIPT_DIR}/generate-demo-data.js" "http://localhost:${PORT}"

# ── Step 7: Stop background server (Codespaces will run it via start-demo.sh) ─
log "Stopping temporary server (Codespaces will restart via start-demo.sh)..."
kill "${BACKEND_PID}" 2>/dev/null || true
wait "${BACKEND_PID}" 2>/dev/null || true

# ── Done ─────────────────────────────────────────────────────────────────────
APP_URL="http://localhost:${PORT}"
if [[ -n "${CODESPACE_NAME:-}" ]]; then
  APP_URL="https://${CODESPACE_NAME}-${PORT}.app.github.dev"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅  Maxim Broadcast Codespace setup complete!"
echo ""
echo "  To start the app, run:"
echo "    bash scripts/start-demo.sh"
echo ""
echo "  Or open the app at:"
echo "    ${APP_URL}"
echo ""
echo "  Demo credentials:"
echo "    admin@demo.com / demo123  (Administrator)"
echo "    demo@demo.com  / demo123  (User)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
