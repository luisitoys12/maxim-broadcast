#!/bin/bash
# Maxim Broadcast - macOS DMG Creator
# Copyright (c) 2026 EstacionKusMedia

set -e

APP_NAME="Maxim Broadcast"
VERSION="1.4.0"
DMG_NAME="maxim-broadcast-${VERSION}-macos-universal"
BUILD_DIR="../../build"

echo "=== Maxim Broadcast DMG Builder ==="
echo "Version: ${VERSION}"

# Create temp directory for DMG contents
TEMP_DIR=$(mktemp -d)
mkdir -p "${TEMP_DIR}/${APP_NAME}.app/Contents/MacOS"
mkdir -p "${TEMP_DIR}/${APP_NAME}.app/Contents/Resources"
mkdir -p "${TEMP_DIR}/${APP_NAME}.app/Contents/Frameworks"
mkdir -p "${TEMP_DIR}/${APP_NAME}.app/Contents/PlugIns/obs-plugins"

# Copy Info.plist
cat > "${TEMP_DIR}/${APP_NAME}.app/Contents/Info.plist" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>Maxim Broadcast</string>
    <key>CFBundleDisplayName</key>
    <string>Maxim Broadcast</string>
    <key>CFBundleIdentifier</key>
    <string>com.estacionkusmedia.maxim-broadcast</string>
    <key>CFBundleVersion</key>
    <string>${VERSION}</string>
    <key>CFBundleShortVersionString</key>
    <string>${VERSION}</string>
    <key>CFBundleExecutable</key>
    <string>maxim-broadcast</string>
    <key>CFBundleIconFile</key>
    <string>maxim-broadcast.icns</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>LSMinimumSystemVersion</key>
    <string>11.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSCameraUsageDescription</key>
    <string>Maxim Broadcast needs camera access for video capture and streaming.</string>
    <key>NSMicrophoneUsageDescription</key>
    <string>Maxim Broadcast needs microphone access for audio capture and streaming.</string>
    <key>NSScreenCaptureUsageDescription</key>
    <string>Maxim Broadcast needs screen capture access for recording and streaming.</string>
</dict>
</plist>
PLIST

# Copy built files
if [ -d "${BUILD_DIR}" ]; then
    cp -R "${BUILD_DIR}/Maxim Broadcast.app/Contents/MacOS/"* "${TEMP_DIR}/${APP_NAME}.app/Contents/MacOS/" 2>/dev/null || true
    cp -R "${BUILD_DIR}/Maxim Broadcast.app/Contents/Resources/"* "${TEMP_DIR}/${APP_NAME}.app/Contents/Resources/" 2>/dev/null || true
    cp -R "${BUILD_DIR}/Maxim Broadcast.app/Contents/Frameworks/"* "${TEMP_DIR}/${APP_NAME}.app/Contents/Frameworks/" 2>/dev/null || true
fi

# Create DMG
hdiutil create -volname "${APP_NAME}" \
    -srcfolder "${TEMP_DIR}" \
    -ov -format UDZO \
    "${DMG_NAME}.dmg"

# Cleanup
rm -rf "${TEMP_DIR}"

echo "=== DMG created: ${DMG_NAME}.dmg ==="
