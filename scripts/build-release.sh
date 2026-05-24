#!/bin/bash
# Local release build — mirrors what GitHub Actions does.
# Usage: ./scripts/build-release.sh 1.2.0
set -euo pipefail

VERSION="${1:-}"
if [[ -z "$VERSION" ]]; then
  echo "Usage: $0 <version>  (e.g. $0 1.2.0)"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Patching Version.swift to $VERSION"
sed -i '' \
  "s/let APP_VERSION = \".*\"/let APP_VERSION = \"$VERSION\"/" \
  Sources/Memories/Version.swift

echo "→ Building release binary"
swift build -c release

APP="Memories.app"
echo "→ Assembling $APP"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp .build/release/Memories "$APP/Contents/MacOS/"

cat > "$APP/Contents/Info.plist" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleIdentifier</key>
    <string>com.loiquan.memories</string>
    <key>CFBundleName</key>
    <string>Memories</string>
    <key>CFBundleDisplayName</key>
    <string>Memories</string>
    <key>CFBundleExecutable</key>
    <string>Memories</string>
    <key>CFBundleVersion</key>
    <string>${VERSION}</string>
    <key>CFBundleShortVersionString</key>
    <string>${VERSION}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSPrincipalClass</key>
    <string>NSApplication</string>
    <key>LSMinimumSystemVersion</key>
    <string>14.0</string>
</dict>
</plist>
PLIST

echo "→ Ad-hoc signing"
codesign --deep --force --sign - "$APP"

ZIPNAME="Memories-${VERSION}.zip"
echo "→ Creating $ZIPNAME"
zip -r "$ZIPNAME" "$APP"

echo ""
echo "✓ Done: $ROOT/$ZIPNAME"
echo "  Test it: open $APP"
echo "  To release: git tag v${VERSION} && git push origin v${VERSION}"
