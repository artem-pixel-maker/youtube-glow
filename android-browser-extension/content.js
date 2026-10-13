(() => {
  "use strict";
  if (window.__yhalInstalled) return;
  window.__yhalInstalled = true;

  const ROOT_ID = "yhal-root";
  const NAV_ID = "yhal-custom-nav";
  const PLAYER_ID = "yhal-player-tools";
  const FOCUS_CLASS = "yhal-focus-mode";
  const LIGHTS_CLASS = "yhal-lights-on";
  const AD_CLASS = "yhal-hide-ad-ui";
  const TASKBAR_ID = "yhal-taskbar";

  let settings = window.YHALSettings ? { ...window.YHALSettings.defaults } : { lights: true, focus: false, hideAdUi: false, intensity: 65, buttonX: null, buttonY: 42, theme: "purple", showTaskbar: true, showNav: true, showPlayerTools: true, compact: false };
  let toastTimer = null;
  const $ = (selector, root = document) => root.querySelector(selector);

  function getVideo() {
    return $("video.html5-main-video") || $("video");
  }
  function typing(target) {
    return !!target && (["input", "textarea"].includes(target.tagName?.toLowerCase()) || target.isContentEditable);
  }
  function toast(message) {
    let node = $("#yhal-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "yhal-toast";
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("show"), 1400);
  }
  async function save() {
    try { await chrome.storage.local.set({ yhalSettings: settings }); } catch (_) {}
  }
  function apply() {
    document.documentElement.classList.toggle(LIGHTS_CLASS, !!settings.lights);
    document.documentElement.classList.toggle(FOCUS_CLASS, !!settings.focus);
    document.documentElement.classList.toggle(AD_CLASS, !!settings.hideAdUi);
    document.documentElement.style.setProperty("--yhal-light-intensity", String(settings.intensity / 100));
    const palettes = window.YHALSettings?.themes || { purple: "#a855f7", blue: "#3b82f6", pink: "#ec4899", green: "#22c55e", orange: "#f97316" };
    document.documentElement.style.setProperty("--yhal-accent", palettes[settings.theme] || palettes.purple);
    document.documentElement.classList.toggle("yhal-compact", !!settings.compact);
    const taskbar = $("#" + TASKBAR_ID); if (taskbar) taskbar.hidden = !settings.showTaskbar;
    const nav = $("#" + NAV_ID); if (nav) nav.hidden = !settings.showNav;
    const playerTools = $("#" + PLAYER_ID); if (playerTools) playerTools.hidden = !settings.showPlayerTools;
    const floatingRoot = $("#" + ROOT_ID);
    if (floatingRoot) {
      if (Number.isFinite(settings.buttonX)) {
        floatingRoot.style.left = `${Math.max(0, Math.min(95, settings.buttonX))}vw`;
        floatingRoot.style.right = "auto";
      } else {
        floatingRoot.style.left = "auto";
        floatingRoot.style.right = "18px";
      }
      floatingRoot.style.top = `${Math.max(5, Math.min(90, settings.buttonY))}vh`;
    }
    const root = $("#" + ROOT_ID);
    if (root) {
      root.querySelector("#yhal-lights")?.classList.toggle("is-active", settings.lights);
      root.querySelector("#yhal-focus")?.classList.toggle("is-active", settings.focus);
      root.querySelector("#yhal-ads")?.classList.toggle("is-active", settings.hideAdUi);
      const slider = root.querySelector("#yhal-intensity");
      if (slider) slider.value = String(settings.intensity);
      const value = root.querySelector("#yhal-intensity-value");
      if (value) value.textContent = `${settings.intensity}%`;
      const theme = root.querySelector("#yhal-theme"); if (theme) theme.value = settings.theme || "purple";
      const compact = root.querySelector("#yhal-compact"); if (compact) compact.checked = !!settings.compact;
      const showTaskbar = root.querySelector("#yhal-show-taskbar"); if (showTaskbar) showTaskbar.checked = settings.showTaskbar !== false;
      const showNav = root.querySelector("#yhal-show-nav"); if (showNav) showNav.checked = settings.showNav !== false;
      const showPlayer = root.querySelector("#yhal-show-player"); if (showPlayer) showPlayer.checked = settings.showPlayerTools !== false;
      const status = root.querySelector("#yhal-status");
      if (status) status.textContent = settings.lights ? "Ambient lights are on" : "Ambient lights are off";
    }
    $("#yhal-custom-nav")?.querySelector('[data-yhal="focus"]')?.classList.toggle("yhal-nav-active", settings.focus);
    $("#yhal-custom-nav")?.querySelector('[data-yhal="lights"]')?.classList.toggle("yhal-nav-active", settings.lights);
  }
  async function load() {
    try {
      const stored = await chrome.storage.local.get("yhalSettings");
      if (stored.yhalSettings) settings = window.YHALSettings ? window.YHALSettings.normalize({ ...settings, ...stored.yhalSettings }) : { ...settings, ...stored.yhalSettings };
    } catch (_) {}
    apply();
  }
  function toggle(key) {
    settings[key] = !settings[key];
    apply(); save();
    const labels = { lights: "Ambient lights", focus: "Focus mode", hideAdUi: "Hide ad UI" };
    toast(`${labels[key] || key}: ${settings[key] ? "on" : "off"}`);
  }
  function seek(seconds) {
    const v = getVideo();
    if (!v) return toast("No video player found");
    v.currentTime = Math.max(0, Math.min(Number.isFinite(v.duration) ? v.duration : Infinity, v.currentTime + seconds));
    toast(`${seconds > 0 ? "+" : ""}${seconds}s`);
  }
  function playPause() {
    const v = getVideo();
    if (!v) return toast("No video player found");
    if (v.paused) v.play().catch(() => {}); else v.pause();
  }
  function cycleSpeed() {
    const v = getVideo();
    if (!v) return;
    const speeds = [1, 1.25, 1.5, 1.75, 2];
    v.playbackRate = speeds.find(s => s > v.playbackRate + .01) ?? 1;
    toast(`Playback speed: ${v.playbackRate}×`);
  }

  function buildPanel() {
    if ($("#" + ROOT_ID) || !document.body) return;
    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.innerHTML = `
      <button id="yhal-tab" type="button" title="Open YouTube Glow" aria-label="Open YouTube Glow">✦</button>
      <section id="yhal-panel" aria-label="YouTube Glow controls">
        <header class="yhal-header"><div class="yhal-brand-mark">✦</div><div class="yhal-heading"><strong>YouTube Glow</strong><span>Highlights & Ambient Lights</span></div><button id="yhal-close" class="yhal-icon-button" type="button" aria-label="Close">×</button></header>
        <div class="yhal-move-tools">
          <span>Move floating button</span>
          <div><button type="button" data-move="left">←</button><button type="button" data-move="right">→</button><button type="button" data-move="up">↑</button><button type="button" data-move="down">↓</button><button type="button" data-move="reset">Reset</button></div>
        </div>
        <nav class="yhal-tabs" aria-label="Panel pages"><button type="button" data-tab="home" class="active">Home</button><button type="button" data-tab="settings">Settings</button><button type="button" data-tab="shortcuts">Shortcuts</button></nav>
        <div class="yhal-page active" data-page="home">
        <div class="yhal-status" id="yhal-status">Ambient lights are on</div>
        <div class="yhal-controls">
          <button id="yhal-lights" class="yhal-control is-active" type="button"><span>✧</span><span><b>Ambient lights</b><small>Purple glow around video</small></span><i></i></button>
          <button id="yhal-focus" class="yhal-control" type="button"><span>◐</span><span><b>Focus mode</b><small>Hide recommendations/comments</small></span><i></i></button>
          <button id="yhal-ads" class="yhal-control" type="button"><span>⊘</span><span><b>Hide ad UI</b><small>Hide visible ad containers</small></span><i></i></button>
        </div>
        <label class="yhal-slider-label" for="yhal-intensity"><span>Glow intensity</span><strong id="yhal-intensity-value">65%</strong></label>
        <input id="yhal-intensity" type="range" min="0" max="100" value="65">
        <div class="yhal-divider"></div><div class="yhal-section-title">Playback controls</div>
        <div class="yhal-playback"><button data-do="back">−10s</button><button data-do="play">▶ / ❚❚</button><button data-do="forward">+10s</button><button data-do="speed">Speed</button></div>
        </div>
        <div class="yhal-page" data-page="settings">
          <div class="yhal-section-title">Appearance</div>
          <label class="yhal-setting-row"><span>Accent color</span><select id="yhal-theme"><option value="purple">Purple</option><option value="blue">Blue</option><option value="pink">Pink</option><option value="green">Green</option><option value="orange">Orange</option></select></label>
          <label class="yhal-setting-row"><span>Compact panel</span><input id="yhal-compact" type="checkbox"></label>
          <div class="yhal-divider"></div><div class="yhal-section-title">Custom YouTube interface</div>
          <label class="yhal-setting-row"><span>Show custom taskbar</span><input id="yhal-show-taskbar" type="checkbox"></label>
          <label class="yhal-setting-row"><span>Show left-nav tools</span><input id="yhal-show-nav" type="checkbox"></label>
          <label class="yhal-setting-row"><span>Show video buttons</span><input id="yhal-show-player" type="checkbox"></label>
          <p class="yhal-note">These options only change this extension's controls on YouTube. Settings are stored locally in this browser.</p>
          <div class="yhal-settings-transfer"><button type="button" id="yhal-export-settings" class="yhal-secondary-button">Export settings JSON</button><button type="button" id="yhal-import-settings" class="yhal-secondary-button">Import settings JSON</button><input type="file" id="yhal-import-file" accept="application/json,.json" hidden></div>
          <button type="button" id="yhal-reset-settings" class="yhal-secondary-button">Reset extension settings</button>
        </div>
        <div class="yhal-page" data-page="shortcuts"><div class="yhal-section-title">Keyboard shortcuts</div>
          <div class="yhal-shortcut-row"><span>Ambient lights</span><kbd>Alt</kbd> + <kbd>L</kbd></div><div class="yhal-shortcut-row"><span>Focus mode</span><kbd>Alt</kbd> + <kbd>H</kbd></div><div class="yhal-shortcut-row"><span>Seek backward / forward</span><kbd>Alt</kbd> + <kbd>←</kbd> / <kbd>→</kbd></div><div class="yhal-shortcut-row"><span>Volume</span><kbd>Alt</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd></div><div class="yhal-shortcut-row"><span>Playback speed</span><kbd>Alt</kbd> + <kbd>S</kbd></div>
        </div><footer>Private local extension · settings saved in this browser</footer>
      </section>`;
    document.body.appendChild(root);
    const floatingTab = root.querySelector("#yhal-tab");
    let dragStart = null;
    floatingTab.addEventListener("pointerdown", event => {
      if (event.button !== 0) return;
      dragStart = { x: event.clientX, y: event.clientY, moved: false, left: root.getBoundingClientRect().left, top: root.getBoundingClientRect().top };
      floatingTab.setPointerCapture(event.pointerId);
    });
    floatingTab.addEventListener("pointermove", event => {
      if (!dragStart) return;
      const dx = event.clientX - dragStart.x, dy = event.clientY - dragStart.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) dragStart.moved = true;
      if (!dragStart.moved) return;
      const nx = Math.max(0, Math.min(window.innerWidth - 46, dragStart.left + dx));
      const ny = Math.max(0, Math.min(window.innerHeight - 46, dragStart.top + dy));
      root.style.left = `${nx}px`; root.style.right = "auto"; root.style.top = `${ny}px`;
      settings.buttonX = (nx / Math.max(1, window.innerWidth)) * 100;
      settings.buttonY = (ny / Math.max(1, window.innerHeight)) * 100;
    });
    floatingTab.addEventListener("pointerup", () => {
      if (!dragStart) return;
      const moved = dragStart.moved;
      dragStart = null;
      if (moved) { save(); return; }
      root.classList.toggle("panel-open");
    });
    root.querySelector("#yhal-close").addEventListener("click", () => root.classList.remove("panel-open"));
    root.querySelectorAll("[data-move]").forEach(button => button.addEventListener("click", () => {
      const step = 4;
      const direction = button.dataset.move;
      if (direction === "reset") { settings.buttonX = null; settings.buttonY = 42; }
      else {
        const rect = root.getBoundingClientRect();
        if (!Number.isFinite(settings.buttonX)) settings.buttonX = Math.max(0, Math.min(95, (rect.left / Math.max(1, window.innerWidth)) * 100));
        if (direction === "left") settings.buttonX -= step;
        if (direction === "right") settings.buttonX += step;
        if (direction === "up") settings.buttonY -= step;
        if (direction === "down") settings.buttonY += step;
        settings.buttonX = Math.max(0, Math.min(95, settings.buttonX));
        settings.buttonY = Math.max(5, Math.min(90, settings.buttonY));
      }
      apply(); save();
    }));
    root.querySelector("#yhal-lights").addEventListener("click", () => toggle("lights"));
    root.querySelector("#yhal-focus").addEventListener("click", () => toggle("focus"));
    root.querySelector("#yhal-ads").addEventListener("click", () => toggle("hideAdUi"));
    root.querySelector("#yhal-intensity").addEventListener("input", e => {
      settings.intensity = Number(e.target.value); apply(); save();
    });
    root.querySelector('[data-do="back"]').addEventListener("click", () => seek(-10));
    root.querySelector('[data-do="forward"]').addEventListener("click", () => seek(10));
    root.querySelector('[data-do="play"]').addEventListener("click", playPause);
    root.querySelector('[data-do="speed"]').addEventListener("click", cycleSpeed);
    root.querySelectorAll("[data-tab]").forEach(button => button.addEventListener("click", () => {
      root.querySelectorAll("[data-tab]").forEach(b => b.classList.toggle("active", b === button));
      root.querySelectorAll("[data-page]").forEach(page => page.classList.toggle("active", page.dataset.page === button.dataset.tab));
    }));
    root.querySelector("#yhal-theme").addEventListener("change", e => { settings.theme = e.target.value; apply(); save(); });
    root.querySelector("#yhal-compact").addEventListener("change", e => { settings.compact = e.target.checked; apply(); save(); });
    root.querySelector("#yhal-show-taskbar").addEventListener("change", e => { settings.showTaskbar = e.target.checked; apply(); save(); });
    root.querySelector("#yhal-show-nav").addEventListener("change", e => { settings.showNav = e.target.checked; apply(); save(); });
    root.querySelector("#yhal-show-player").addEventListener("change", e => { settings.showPlayerTools = e.target.checked; apply(); save(); });
    root.querySelector("#yhal-export-settings").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify({ app: "YouTube Highlights and Ambient Lights", version: 2, settings }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob); const link = document.createElement("a");
      link.href = url; link.download = "youtube-glow-settings.json"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast("Settings exported");
    });
    root.querySelector("#yhal-import-settings").addEventListener("click", () => root.querySelector("#yhal-import-file").click());
    root.querySelector("#yhal-import-file").addEventListener("change", async event => {
      const file = event.target.files?.[0]; if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        const incoming = data.settings || data.yhalSettings || data;
        settings = window.YHALSettings ? window.YHALSettings.normalize({ ...settings, ...incoming }) : { ...settings, ...incoming };
        apply(); await save(); toast("Settings imported");
      } catch (_) { toast("Invalid settings JSON"); }
      event.target.value = "";
    });
    root.querySelector("#yhal-reset-settings").addEventListener("click", async () => {
      settings = window.YHALSettings ? { ...window.YHALSettings.defaults } : { lights: true, focus: false, hideAdUi: false, intensity: 65, buttonX: null, buttonY: 42, theme: "purple", showTaskbar: true, showNav: true, showPlayerTools: true, compact: false };
      apply(); await save(); toast("Settings reset");
    });
    apply();
  }

  // Add helpful buttons to YouTube's actual left navigation, not just the extension popup.
  function buildCustomNav() {
    const nav = $("#guide-content") || $("ytd-guide-renderer #items");
    if (!nav || $("#" + NAV_ID)) return;
    const wrap = document.createElement("div");
    wrap.id = NAV_ID;
    wrap.hidden = settings.showNav === false;
    wrap.innerHTML = `
      <div class="yhal-nav-heading">YOUR TOOLS</div>
      <button type="button" data-yhal="lights"><span>✧</span> Ambient lights</button>
      <button type="button" data-yhal="focus"><span>◐</span> Focus mode</button>
      <button type="button" data-yhal="panel"><span>✦</span> Glow controls</button>`;
    wrap.querySelector('[data-yhal="lights"]').addEventListener("click", () => toggle("lights"));
    wrap.querySelector('[data-yhal="focus"]').addEventListener("click", () => toggle("focus"));
    wrap.querySelector('[data-yhal="panel"]').addEventListener("click", () => $("#" + ROOT_ID)?.classList.add("panel-open"));
    nav.appendChild(wrap);
    apply();
  }

  // Add compact controls alongside the player controls on watch pages.
  function buildPlayerTools() {
    const host = $("#below") || $("#below-the-fold");
    if (!host || $("#" + PLAYER_ID) || !location.pathname.startsWith("/watch")) return;
    const tools = document.createElement("div");
    tools.id = PLAYER_ID;
    tools.hidden = settings.showPlayerTools === false;
    tools.innerHTML = `<button data-do="lights">✧ Lights</button><button data-do="focus">◐ Focus</button><button data-do="back">−10s</button><button data-do="play">▶ / ❚❚</button><button data-do="forward">+10s</button><button data-do="speed">1× Speed</button>`;
    tools.querySelector('[data-do="lights"]').addEventListener("click", () => toggle("lights"));
    tools.querySelector('[data-do="focus"]').addEventListener("click", () => toggle("focus"));
    tools.querySelector('[data-do="back"]').addEventListener("click", () => seek(-10));
    tools.querySelector('[data-do="play"]').addEventListener("click", playPause);
    tools.querySelector('[data-do="forward"]').addEventListener("click", () => seek(10));
    tools.querySelector('[data-do="speed"]').addEventListener("click", cycleSpeed);
    host.prepend(tools);
  }

  function buildTaskbar() {
    if ($("#" + TASKBAR_ID) || !document.body) return;
    const bar = document.createElement("div");
    bar.id = TASKBAR_ID;
    bar.hidden = settings.showTaskbar === false;
    bar.innerHTML = `<div class="yhal-taskbar-brand">✦ <span>GLOW</span></div><button data-task="lights">✧ Lights</button><button data-task="focus">◐ Focus</button><button data-task="back">−10s</button><button data-task="play">▶ / ❚❚</button><button data-task="forward">+10s</button><button data-task="speed">↗ Speed</button><button data-task="settings">⚙ Settings</button><button data-task="hide">×</button>`;
    bar.querySelector('[data-task="lights"]').addEventListener("click", () => toggle("lights"));
    bar.querySelector('[data-task="focus"]').addEventListener("click", () => toggle("focus"));
    bar.querySelector('[data-task="back"]').addEventListener("click", () => seek(-10));
    bar.querySelector('[data-task="play"]').addEventListener("click", playPause);
    bar.querySelector('[data-task="forward"]').addEventListener("click", () => seek(10));
    bar.querySelector('[data-task="speed"]').addEventListener("click", cycleSpeed);
    bar.querySelector('[data-task="settings"]').addEventListener("click", () => { $("#" + ROOT_ID)?.classList.add("panel-open"); $("#" + ROOT_ID)?.querySelector('[data-tab="settings"]')?.click(); });
    bar.querySelector('[data-task="hide"]').addEventListener("click", () => { settings.showTaskbar = false; bar.hidden = true; save(); });
    document.body.appendChild(bar);
  }

  // Subscriber counts are not consistently shown in the subscriptions feed.
  // Only animate a channel name when a count is actually present in that card's rendered text.
  function parseCount(text) {
    if (!text) return null;
    const s = text.toLowerCase().replace(/,/g, "").replace(/\s+/g, " ");
    // Require an explicit subscriber label so view counts are never mistaken for subscribers.
    const m = s.match(/(\d+(?:\.\d+)?)\s*(million|m|thousand|k)?\s*(?:subscribers?|subs)\b/i);
    if (!m) return null;
    const n = Number(m[1]);
    if (!Number.isFinite(n)) return null;
    const unit = (m[2] || "").toLowerCase();
    if (unit === "million" || unit === "m") return n * 1_000_000;
    if (unit === "thousand" || unit === "k") return n * 1_000;
    return n;
  }
  function tierFor(count) {
    if (count >= 100_000_000) return "blue";
    if (count >= 10_000_000) return "green";
    if (count >= 1_000_000) return "red";
    if (count >= 100_000) return "purple";
    if (count >= 10_000) return "gray";
    if (count >= 1_000) return "cyan";
    if (count >= 100) return "silver";
    return "small";
  }
  function colorSubscriberNames() {
    const cards = document.querySelectorAll("ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer, ytd-playlist-video-renderer");
    cards.forEach(card => {
      const text = card.innerText || "";
      const count = parseCount(text);
      const title = card.querySelector("#channel-name a, ytd-channel-name a, #text.ytd-channel-name, .ytd-channel-name a");
      if (!title) return;
      if (count === null) {
        title.removeAttribute("data-yhal-tier");
        title.classList.remove("yhal-tier-name");
        title.removeAttribute("title");
        return;
      }
      const tier = tierFor(count);
      title.dataset.yhalTier = tier;
      title.classList.add("yhal-tier-name");
      title.title = `YouTube Glow tier: ${tier} (${count.toLocaleString()} subscribers detected on page)`;
    });
  }

  function handleMessage(message) {
    if (!message || message.source !== "yhal-popup") return;
    if (message.action === "toggle") toggle(message.key);
    if (message.action === "seek") seek(message.seconds);
    if (message.action === "playPause") playPause();
    if (message.action === "speed") cycleSpeed();
    if (message.action === "openPanel") $("#" + ROOT_ID)?.classList.add("panel-open");
  }
  chrome.runtime.onMessage.addListener(handleMessage);

  document.addEventListener("keydown", event => {
    if (!event.altKey || event.ctrlKey || event.metaKey || typing(event.target)) return;
    const key = event.key.toLowerCase();
    if (key === "l") { event.preventDefault(); toggle("lights"); }
    else if (key === "h") { event.preventDefault(); toggle("focus"); }
    else if (key === "arrowleft") { event.preventDefault(); seek(-10); }
    else if (key === "arrowright") { event.preventDefault(); seek(10); }
    else if (key === "arrowup" || key === "arrowdown") {
      const v = getVideo();
      if (v) { event.preventDefault(); v.volume = Math.max(0, Math.min(1, v.volume + (key === "arrowup" ? .05 : -.05))); toast(`Volume: ${Math.round(v.volume * 100)}%`); }
    } else if (key === "s") { event.preventDefault(); cycleSpeed(); }
  });

  let scheduled = false;
  function refreshPageFeatures() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      buildPanel();
      buildTaskbar();
      buildCustomNav();
      buildPlayerTools();
      colorSubscriberNames();
    });
  }
  const observer = new MutationObserver(refreshPageFeatures);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  load().finally(refreshPageFeatures);
})();