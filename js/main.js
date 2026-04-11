// ============================================================
// JAKTEN PÅ LUSSI — Entry point
// ============================================================

// Register Service Worker and set up Web Push support.
// Must run before go("start") so the SW is ready as early as possible.
initPushManager();

go("start");

// Ctrl+Shift+Q → jump to dev tool from any scene
document.addEventListener("keydown", (e) => {
  if (e.key === "Q" && e.ctrlKey && e.shiftKey) go("dev_tool");
});
