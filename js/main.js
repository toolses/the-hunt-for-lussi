// ============================================================
// JAKTEN PÅ LUSSI — Entry point
// ============================================================

go("start");

// Ctrl+Shift+Q → jump to dev tool from any scene
document.addEventListener("keydown", (e) => {
  if (e.key === "Q" && e.ctrlKey && e.shiftKey) go("dev_tool");
});
