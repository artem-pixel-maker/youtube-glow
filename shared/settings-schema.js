/* Shared preference contract for YouTube Glow v2.0.
   Keep the schema aligned with dashboard and extension defaults. */
(function (root) {
  const defaults = Object.freeze({
    version: 2,
    theme: "purple",
    lights: true,
    focus: false,
    hideAdUi: false,
    intensity: 65,
    compact: false,
    showTaskbar: true,
    showNav: true,
    showPlayerTools: true,
    buttonX: null,
    buttonY: 42
  });
  const themes = Object.freeze({
    purple: "#a855f7",
    blue: "#3b82f6",
    pink: "#ec4899",
    green: "#22c55e",
    orange: "#f97316"
  });
  const api = { defaults, themes, normalize(input) {
    const out = { ...defaults, ...(input && typeof input === "object" ? input : {}) };
    if (!themes[out.theme]) out.theme = defaults.theme;
    out.intensity = Math.max(0, Math.min(100, Number(out.intensity) || 0));
    ["lights", "focus", "hideAdUi", "compact", "showTaskbar", "showNav", "showPlayerTools"].forEach(k => out[k] = Boolean(out[k]));
    if (out.buttonX !== null) out.buttonX = Math.max(0, Math.min(95, Number(out.buttonX) || 0));
    out.buttonY = Math.max(5, Math.min(90, Number(out.buttonY) || 42));
    return out;
  }};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.YHALSettings = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
