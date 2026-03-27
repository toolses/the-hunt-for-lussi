// ============================================================
// JAKTEN PÅ LUSSI — Kaplay v3 — Init
// ============================================================

kaplay({
  width: 800,
  height: 600,
  letterbox: true,
  background: [30, 30, 50],
  gravity: 0,
  debug: false,
  pixelDensity: 2,
  crisp: true,
  touchToMouse: true,
});

// ── iOS audio fix: resume AudioContext when app comes back to foreground ──
function _ensureAudio() {
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}
document.addEventListener("visibilitychange", function() { if (!document.hidden) _ensureAudio(); });
window.addEventListener("focus",              _ensureAudio);
window.addEventListener("pageshow",           _ensureAudio);
document.addEventListener("touchstart",       _ensureAudio, { passive: true });
