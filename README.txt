YOUTUBE HIGHLIGHTS & AMBIENT LIGHTS v2.0 — UNIVERSAL EDITION

PROJECT LAYOUT
- shared/settings-schema.js: common defaults, theme colors, and normalization rules.
- desktop-extension/: desktop Chromium/Chrome extension. Preserves the existing v1.3 feature set and uses shared settings defaults.
- android-browser-extension/: mobile-targeted MV3 build matching both youtube.com and m.youtube.com. Intended for a compatible extension-capable Android browser (not Chrome for Android itself).
- companion-dashboard/: responsive local-first dashboard/PWA for PC, Android, and iPhone screen sizes.
- ios-notes/: iOS/Safari platform notes.

WHAT IS FUNCTIONAL NOW
DESKTOP EXTENSION
- Existing floating Glow panel, draggable floating button, move arrows/reset, lights, focus mode, visible ad UI hiding, custom taskbar, left-nav tools, below-player controls, keyboard shortcuts, playback controls, color tiers only when subscriber counts are explicitly visible, and settings stored locally with chrome.storage.local.
- Theme, compact mode, taskbar/nav/player tool visibility preferences remain available.
- It runs only on supported YouTube webpages, not inside the native YouTube app.

ANDROID BROWSER BUILD
- Same code/features are packaged with mobile CSS refinements and URL matches for youtube.com and m.youtube.com.
- It is not a universal Android install package. Mobile extension support and installation depend on the chosen browser/version. Firefox Android is an extension-capable option; verify current compatibility and any signing/installation requirements before relying on it.
- Some selectors are desktop-oriented and YouTube mobile DOM changes often. Treat mobile page injection as a test build until verified on the target browser/device.

COMPANION DASHBOARD
- Fully responsive web dashboard with working local settings, accent colors, toggles, glow intensity, reset, JSON export/import, and a reactive design preview.
- Preferences are stored in that browser's localStorage.
- Preview playback controls are mockups only. The dashboard does not control YouTube playback or alter the native YouTube app.
- Dashboard preferences do NOT automatically synchronize with extension settings. Use JSON export/import to move preferences manually between devices/builds.
- PWA installation requires HTTPS or localhost. Opened as file://, it still displays, but service-worker/PWA features may not run.

IOS / IPHONE
- The responsive dashboard is usable in Safari and can be added to the Home Screen when hosted over HTTPS.
- This package does not include a signed Safari Web Extension app/Xcode project. Safari extension distribution is a separate Apple-platform build; this dashboard alone cannot inject controls into the YouTube iOS app.

INSTALL DESKTOP EXTENSION (CHROME / CHROMIUM)
1. Extract the ZIP and open chrome://extensions.
2. Enable Developer mode.
3. Click Load unpacked and choose the desktop-extension folder (it contains manifest.json).
4. Refresh any open YouTube tab.
5. Open the floating ✦ control to configure settings.

ANDROID BROWSER EXTENSION TEST BUILD
1. Use a browser/version that supports compatible extensions; Chrome for Android generally does not load desktop Chrome extensions.
2. Follow that browser's official add-on installation/developer-testing method. This folder is an unpacked MV3 source package, not an APK or a signed public add-on.
3. Test youtube.com and m.youtube.com, refresh after installation, and expect mobile selectors may need further adjustment.

RUN THE COMPANION DASHBOARD ON PC
1. Install Python 3 if needed.
2. Open a terminal in the extracted project root (the folder containing this README).
3. Run: python -m http.server 8080
4. Open http://localhost:8080/companion-dashboard/

OPEN THE DASHBOARD ON A PHONE FOR LOCAL TESTING
1. Connect phone and computer to the same Wi-Fi.
2. Run the same server command on the computer.
3. Find the computer's LAN IP address and open http://COMPUTER-LAN-IP:8080/companion-dashboard/ on the phone. Local firewall settings may need to allow the connection.
4. For a real installable PWA, host the project over HTTPS while preserving the companion-dashboard/ and shared/ folder paths, then use the browser's Add to Home Screen / Install option if available.

SETTINGS / PRIVACY
- No login, analytics, or remote server is included.
- Extension settings use browser extension local storage. Dashboard settings use localStorage. They are separate stores by design.
- Export creates a JSON file on your device; import reads the selected file locally.

KNOWN LIMITATIONS
- YouTube may change its DOM, so extension selectors can break and require maintenance.
- Hiding visible ad-related UI does not guarantee all ads disappear and does not bypass YouTube restrictions.
- Subscriber counts are not reliably shown in the subscriptions feed; names are not assigned guessed counts.
- No automatic cross-device sync, no native YouTube-app integration, and no signed iOS extension are included.
