#!/bin/bash
# Maxim Broadcast - Windows Build Script
# Builds .zip portable package and .exe NSIS installer
# Copyright (c) 2026 EstacionKusMedia
# Usage: ./build-windows.sh [version]

set -e

VERSION="${1:-1.4.0}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PKG="maxim-broadcast-v${VERSION}-windows-x64"

echo "=== Maxim Broadcast Windows Builder ==="
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

# Create portable ZIP
echo "--- Creating portable ZIP ---"
rm -rf "${PKG}"
mkdir -p "${PKG}/backend" "${PKG}/frontend"

cp -r backend/src backend/package.json "${PKG}/backend/"
[ -f backend/.env.example ] && cp backend/.env.example "${PKG}/backend/.env.example"
cp -r frontend/dist/. "${PKG}/frontend/"
cp README.md RELEASE_NOTES.md INSTALL_GUIDE.md "${PKG}/" 2>/dev/null || true
[ -f assets/icon.png ] && cp assets/icon.png "${PKG}/"

cat > "${PKG}/start.bat" << 'EOF'
@echo off
title Maxim Broadcast
cd /d "%~dp0backend"
if not exist .env copy .env.example .env
echo Installing dependencies...
npm install --omit=dev
echo Starting Maxim Broadcast...
start /b node src/index.js
timeout /t 2 /nobreak >nul
start http://localhost:4000
echo Maxim Broadcast is running at http://localhost:4000
pause
EOF

zip -r "${PKG}.zip" "${PKG}"
rm -rf "${PKG}"
echo "Created: ${PKG}.zip"

# Build NSIS installer if makensis is available
if command -v makensis &> /dev/null; then
    echo "--- Building NSIS .exe installer ---"
    NSIS_SCRIPT="installer/windows/maxim-broadcast-installer.nsi"
    if [ -f "${NSIS_SCRIPT}" ]; then
        makensis -DVERSION="${VERSION}" "${NSIS_SCRIPT}"
        echo "Created: maxim-broadcast-v${VERSION}-windows-x64-setup.exe"
    else
        echo "Warning: NSIS script not found at ${NSIS_SCRIPT}"
    fi
else
    echo "Note: makensis not installed — skipping .exe installer"
    echo "      To build the .exe installer, install NSIS and run:"
    echo "      makensis installer/windows/maxim-broadcast-installer.nsi"
fi

echo ""
echo "=== Windows build complete ==="
