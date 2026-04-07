#!/bin/bash
# Maxim Broadcast - Linux Package Builder
# Creates .deb, .rpm, and AppImage packages
# Copyright (c) 2026 EstacionKusMedia

set -e

VERSION="1.4.0"
ARCH="amd64"
BUILD_DIR="../../build"

echo "=== Maxim Broadcast Linux Package Builder ==="
echo "Version: ${VERSION}"
echo "Architecture: ${ARCH}"

# Build DEB package
build_deb() {
    echo "--- Building DEB package ---"
    
    DEB_DIR="maxim-broadcast_${VERSION}_${ARCH}"
    mkdir -p "${DEB_DIR}/DEBIAN"
    mkdir -p "${DEB_DIR}/usr/bin"
    mkdir -p "${DEB_DIR}/usr/lib/maxim-broadcast"
    mkdir -p "${DEB_DIR}/usr/share/applications"
    mkdir -p "${DEB_DIR}/usr/share/icons/hicolor/256x256/apps"
    mkdir -p "${DEB_DIR}/usr/share/maxim-broadcast"

    cat > "${DEB_DIR}/DEBIAN/control" << CONTROL
Package: maxim-broadcast
Version: ${VERSION}
Section: video
Priority: optional
Architecture: ${ARCH}
Depends: libavcodec59 | libavcodec-extra59, libavformat59, libavutil57, libswscale6, libswresample4, libx264-163 | libx264-164, libcurl4, libmbedtls14, libgl1, libqt6core6, libqt6gui6, libqt6widgets6, nodejs (>= 18.0)
Maintainer: EstacionKusMedia <cushmediagroup@gmail.com>
Homepage: https://github.com/luisitoys12/maxim-broadcast
Description: Maxim Broadcast - Plataforma Profesional de Produccion Audiovisual
 Software avanzado de produccion en vivo basado en OBS Studio con
 inteligencia artificial, editor dual, multi-camara y automatizacion
 inteligente. Compatible con todos los plugins de OBS Studio.
CONTROL

    cat > "${DEB_DIR}/DEBIAN/postinst" << 'POSTINST'
#!/bin/bash
update-desktop-database /usr/share/applications 2>/dev/null || true
gtk-update-icon-cache /usr/share/icons/hicolor 2>/dev/null || true
ldconfig
POSTINST
    chmod 755 "${DEB_DIR}/DEBIAN/postinst"

    cp maxim-broadcast.desktop "${DEB_DIR}/usr/share/applications/"
    
    dpkg-deb --build "${DEB_DIR}"
    mv "${DEB_DIR}.deb" "maxim-broadcast-${VERSION}-linux-${ARCH}.deb"
    rm -rf "${DEB_DIR}"
    
    echo "DEB package created: maxim-broadcast-${VERSION}-linux-${ARCH}.deb"
}

# Build RPM package
build_rpm() {
    echo "--- Building RPM package ---"
    
    RPM_ARCH="x86_64"
    
    cat > maxim-broadcast.spec << SPEC
Name:           maxim-broadcast
Version:        ${VERSION}
Release:        1%{?dist}
Summary:        Plataforma Profesional de Produccion Audiovisual
License:        GPLv2
URL:            https://github.com/luisitoys12/maxim-broadcast
Source0:        %{name}-%{version}.tar.gz

BuildRequires:  cmake >= 3.22, gcc-c++, qt6-qtbase-devel
Requires:       ffmpeg-libs, qt6-qtbase, nodejs >= 18

%description
Software avanzado de produccion en vivo basado en OBS Studio con
inteligencia artificial, editor dual, multi-camara y automatizacion
inteligente. Compatible con todos los plugins de OBS Studio.

%install
mkdir -p %{buildroot}/usr/bin
mkdir -p %{buildroot}/usr/lib/maxim-broadcast
mkdir -p %{buildroot}/usr/share/applications
mkdir -p %{buildroot}/usr/share/maxim-broadcast

%files
/usr/bin/maxim-broadcast
/usr/lib/maxim-broadcast/
/usr/share/applications/maxim-broadcast.desktop
/usr/share/maxim-broadcast/
SPEC

    rpmbuild -ba maxim-broadcast.spec 2>/dev/null || echo "RPM build requires rpmbuild - skipping"
    rm -f maxim-broadcast.spec
    
    echo "RPM spec created for maxim-broadcast-${VERSION}"
}

# Build AppImage
build_appimage() {
    echo "--- Building AppImage ---"
    
    APPDIR="MaximBroadcast.AppDir"
    mkdir -p "${APPDIR}/usr/bin"
    mkdir -p "${APPDIR}/usr/lib"
    mkdir -p "${APPDIR}/usr/share/applications"
    mkdir -p "${APPDIR}/usr/share/icons/hicolor/256x256/apps"

    cat > "${APPDIR}/AppRun" << 'APPRUN'
#!/bin/bash
SELF=$(readlink -f "$0")
HERE=${SELF%/*}
export PATH="${HERE}/usr/bin:${PATH}"
export LD_LIBRARY_PATH="${HERE}/usr/lib:${LD_LIBRARY_PATH}"
exec "${HERE}/usr/bin/maxim-broadcast" "$@"
APPRUN
    chmod +x "${APPDIR}/AppRun"

    cp maxim-broadcast.desktop "${APPDIR}/"
    
    echo "AppDir created: ${APPDIR}"
    echo "Run linuxdeploy to create final AppImage"
}

case "${1:-all}" in
    deb) build_deb ;;
    rpm) build_rpm ;;
    appimage) build_appimage ;;
    all) build_deb; build_rpm; build_appimage ;;
    *) echo "Usage: $0 {deb|rpm|appimage|all}" ;;
esac

echo "=== Build complete ==="
