YOUTUBE GLOW V2.0 — COMPANION DASHBOARD

WHAT WORKS
- Responsive dashboard layout for desktop, Android, and iPhone-sized screens.
- Theme, lights/focus/ad-UI preferences, compact setting, taskbar/nav/player-button visibility preferences, and glow intensity controls.
- Settings persist locally in this browser using localStorage.
- Export/import settings as a JSON file to manually move preferences between devices.
- Installable PWA when hosted on HTTPS or localhost and the browser supports PWA installation.
- Preview panel reacts to settings, but playback controls in the preview are illustrative only.

WHAT IT DOES NOT DO
- This dashboard does not modify the official YouTube app or directly control YouTube playback.
- Browser-extension settings are stored separately from this dashboard's localStorage. Use export/import to move settings manually; automatic sync is not implemented.
- Service worker/PWA installation generally will not work when opening index.html directly as a file. Use a local web server or HTTPS hosting.

RUN ON PC
1. Open a terminal in the project folder.
2. Run: python -m http.server 8080
3. Open http://localhost:8080/companion-dashboard/ in your browser.
   If the server is started from inside companion-dashboard, use http://localhost:8080/ instead.

RUN ON PHONE
- For testing on the same Wi-Fi, start the server on your computer with python -m http.server 8080, then open http://YOUR-COMPUTER-LAN-IP:8080/companion-dashboard/ on your phone. Your firewall may need to allow local connections.
- For installable PWA features, deploy the companion-dashboard folder and shared folder together to an HTTPS static host; the relative shared schema path must remain valid. Add to Home Screen where offered.
- This is a local-first dashboard; settings are stored separately on each browser/device until manually exported/imported.
