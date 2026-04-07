#!/bin/bash
# Maxim Broadcast - Linux Build Script
# Builds .tar.gz, .deb and AppImage packages
# Copyright (c) 2026 EstacionKusMedia
# Usage: ./build-linux.sh [version]

set -e

VERSION="${1:-1.4.0}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PKG="maxim-broadcast-v${VERSION}-linux-x64"

echo "=== Maxim Broadcast Linux Builder ==="
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

# Create tar.gz
echo "--- Creating .tar.gz ---"
rm -rf "${PKG}"
mkdir -p "${PKG}/backend" "${PKG}/frontend"

cp -r backend/src backend/package.json "${PKG}/backend/"
[ -f backend/.env.example ] && cp backend/.env.example "${PKG}/backend/.env.example"
cp -r frontend/dist/. "${PKG}/frontend/"
cp README.md RELEASE_NOTES.md INSTALL_GUIDE.md "${PKG}/" 2>/dev/null || true
[ -f assets/icon.png ] && cp assets/icon.png "${PKG}/"

cat > "${PKG}/start.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/backend"
[ ! -f .env ] && cp .env.example .env
npm install --omit=dev
node src/index.js
EOF
chmod +x "${PKG}/start.sh"

tar -czf "${PKG}.tar.gz" "${PKG}"
rm -rf "${PKG}"
echo "Created: ${PKG}.tar.gz"

# Build .deb package
if command -v dpkg-deb &> /dev/null; then
    echo "--- Building .deb package ---"
    DEB_DIR="deb-build"
    VER="${VERSION}"

    rm -rf "${DEB_DIR}"
    mkdir -p "${DEB_DIR}/DEBIAN"
    mkdir -p "${DEB_DIR}/usr/share/maxim-broadcast/backend"
    mkdir -p "${DEB_DIR}/usr/share/maxim-broadcast/frontend"
    mkdir -p "${DEB_DIR}/usr/share/applications"
    mkdir -p "${DEB_DIR}/usr/share/pixmaps"
    mkdir -p "${DEB_DIR}/usr/bin"

    cp -r backend/src backend/package.json "${DEB_DIR}/usr/share/maxim-broadcast/backend/"
    [ -f backend/.env.example ] && cp backend/.env.example "${DEB_DIR}/usr/share/maxim-broadcast/backend/.env.example"
    cp -r frontend/dist/. "${DEB_DIR}/usr/share/maxim-broadcast/frontend/"
    [ -f assets/icon.png ] && cp assets/icon.png "${DEB_DIR}/usr/share/pixmaps/maxim-broadcast.png"

    cat > "${DEB_DIR}/DEBIAN/control" << CTRL
Package: maxim-broadcast
Version: ${VER}
Architecture: amd64
Maintainer: EstacionKusMedia <luisitoys12@github.com>
Description: Software Profesional de Broadcast y TV Playout
 Panel web para produccion en vivo, streaming RTMP, gestion de escenas,
 biblioteca de medios y playout 24/7 con IA integrada.
Depends: nodejs (>= 18)
Homepage: https://github.com/luisitoys12/maxim-broadcast
CTRL

    cat > "${DEB_DIR}/usr/share/applications/maxim-broadcast.desktop" << DESKTOP
[Desktop Entry]
Name=Maxim Broadcast
Comment=Software Profesional de Broadcast
Exec=/usr/bin/maxim-broadcast
Icon=maxim-broadcast
Terminal=false
Type=Application
Categories=AudioVideo;Video;
DESKTOP

    cat > "${DEB_DIR}/usr/bin/maxim-broadcast" << 'BIN'
#!/bin/bash
cd /usr/share/maxim-broadcast/backend
[ ! -f .env ] && cp .env.example .env
npm install --omit=dev --prefix /usr/share/maxim-broadcast/backend
node src/index.js &
sleep 2
xdg-open http://localhost:4000 2>/dev/null || true
BIN
    chmod +x "${DEB_DIR}/usr/bin/maxim-broadcast"

    dpkg-deb --build "${DEB_DIR}" "maxim-broadcast-v${VERSION}-linux-amd64.deb"
    rm -rf "${DEB_DIR}"
    echo "Created: maxim-broadcast-v${VERSION}-linux-amd64.deb"
else
    echo "Note: dpkg-deb not available — skipping .deb package"
fi

echo ""
echo "=== Linux build complete ==="
