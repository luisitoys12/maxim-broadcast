#!/bin/bash
# Maxim Broadcast - macOS Build Script
# Builds .zip and optional .dmg package
# Copyright (c) 2026 EstacionKusMedia
# Usage: ./build-macos.sh [version]

set -e

VERSION="${1:-1.4.0}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PKG="maxim-broadcast-v${VERSION}-macos"

echo "=== Maxim Broadcast macOS Builder ==="
echo "Version: ${VERSION}"
echo ""

# Build frontend
echo "--- Building frontend ---"
cd "${SCRIPT_DIR}/frontend"
npm ci
npm run build
cd "${SCRIPT_DIR}"

# Build backend
echo "--- Preparing backend ---"
cd "${SCRIPT_DIR}/backend"
npm ci
cd "${SCRIPT_DIR}"

# Create macOS ZIP
echo "--- Creating macOS .zip ---"
rm -rf "${PKG}"
mkdir -p "${PKG}/backend" "${PKG}/frontend"

cp -r backend/src backend/package.json "${PKG}/backend/"
[ -f backend/.env.example ] && cp backend/.env.example "${PKG}/backend/.env.example"
cp -r frontend/dist/. "${PKG}/frontend/"
cp README.md RELEASE_NOTES.md INSTALL_GUIDE.md "${PKG}/" 2>/dev/null || true
[ -f assets/icon.png ] && cp assets/icon.png "${PKG}/"

cat > "${PKG}/start.command" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/backend"
[ ! -f .env ] && cp .env.example .env
npm install --omit=dev
node src/index.js &
sleep 2
open http://localhost:4000
echo "Maxim Broadcast is running at http://localhost:4000"
EOF
chmod +x "${PKG}/start.command"

zip -r "${PKG}.zip" "${PKG}"
rm -rf "${PKG}"
echo "Created: ${PKG}.zip"

# Build .dmg if hdiutil is available (macOS only)
if command -v hdiutil &> /dev/null; then
    echo "--- Building .dmg image ---"
    SCRIPT_PATH="installer/macos/create-dmg.sh"
    if [ -f "${SCRIPT_PATH}" ]; then
        bash "${SCRIPT_PATH}" "${VERSION}"
        echo "Created: maxim-broadcast-v${VERSION}-macos-universal.dmg"
    else
        echo "Warning: DMG script not found at ${SCRIPT_PATH}"
    fi
else
    echo "Note: hdiutil not available (not on macOS) — skipping .dmg"
fi

echo ""
echo "=== macOS build complete ==="
