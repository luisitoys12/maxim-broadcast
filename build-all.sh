#!/bin/bash
# Maxim Broadcast - Master Build Script
# Builds packages for all platforms
# Copyright (c) 2026 EstacionKusMedia
# Usage: ./build-all.sh [version]

set -e

VERSION="${1:-1.4.0}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLATFORM="$(uname -s)"

echo "╔══════════════════════════════════════════╗"
echo "║   Maxim Broadcast — Build All Platforms  ║"
echo "╚══════════════════════════════════════════╝"
echo "Version : ${VERSION}"
echo "Platform: ${PLATFORM}"
echo "Date    : $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo ""

# Build frontend once (shared across all packages)
echo "=== Step 1/4: Building frontend ==="
cd "${SCRIPT_DIR}/frontend"
npm ci
npm run build
cd "${SCRIPT_DIR}"

# Build backend once
echo "=== Step 2/4: Preparing backend ==="
cd "${SCRIPT_DIR}/backend"
npm ci
cd "${SCRIPT_DIR}"

echo "=== Step 3/4: Building platform packages ==="

# Linux packages (available on any Linux/CI runner)
if [ "${PLATFORM}" = "Linux" ]; then
    echo "--- Linux packages ---"
    bash "${SCRIPT_DIR}/build-linux.sh" "${VERSION}"
fi

# macOS packages (only on macOS)
if [ "${PLATFORM}" = "Darwin" ]; then
    echo "--- macOS packages ---"
    bash "${SCRIPT_DIR}/build-macos.sh" "${VERSION}"
fi

# Windows portable ZIP (cross-platform)
echo "--- Windows portable ZIP ---"
PKG_WIN="maxim-broadcast-v${VERSION}-windows-x64"
rm -rf "${PKG_WIN}"
mkdir -p "${PKG_WIN}/backend" "${PKG_WIN}/frontend"
cp -r backend/src backend/package.json "${PKG_WIN}/backend/"
[ -f backend/.env.example ] && cp backend/.env.example "${PKG_WIN}/backend/.env.example"
cp -r frontend/dist/. "${PKG_WIN}/frontend/"
cp README.md RELEASE_NOTES.md INSTALL_GUIDE.md "${PKG_WIN}/" 2>/dev/null || true
[ -f assets/icon.png ] && cp assets/icon.png "${PKG_WIN}/"

cat > "${PKG_WIN}/start.bat" << 'WEOF'
@echo off
title Maxim Broadcast
cd /d "%~dp0backend"
if not exist .env copy .env.example .env
npm install --omit=dev
start /b node src/index.js
timeout /t 2 /nobreak >nul
start http://localhost:4000
WEOF

zip -r "${PKG_WIN}.zip" "${PKG_WIN}"
rm -rf "${PKG_WIN}"
echo "Created: ${PKG_WIN}.zip"

# NSIS .exe installer (if makensis is available)
if command -v makensis &> /dev/null; then
    echo "--- Windows NSIS installer ---"
    makensis -DVERSION="${VERSION}" "installer/windows/maxim-broadcast-installer.nsi"
    echo "Created: maxim-broadcast-v${VERSION}-windows-x64-setup.exe"
fi

echo ""
echo "=== Step 4/4: Generating checksums ==="
sha256sum maxim-broadcast-v${VERSION}-*.zip \
          maxim-broadcast-v${VERSION}-*.deb \
          maxim-broadcast-v${VERSION}-*.tar.gz \
          maxim-broadcast-v${VERSION}-*.exe 2>/dev/null > SHA256SUMS.txt || true
[ -s SHA256SUMS.txt ] && cat SHA256SUMS.txt

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║          Build complete! ✓               ║"
echo "╚══════════════════════════════════════════╝"
ls -lh maxim-broadcast-v${VERSION}-* 2>/dev/null || true
