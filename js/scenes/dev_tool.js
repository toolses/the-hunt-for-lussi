// ============================================================
// DEV TOOL — Spritesheet coordinate finder
// ============================================================

scene("dev_tool", () => {
  const sheets = [
    { key: "raw_walls",      label: "Walls" },
    { key: "raw_floors",     label: "Floors" },
    { key: "raw_borders",    label: "Borders" },
    { key: "raw_3d",         label: "3D Walls" },
    { key: "raw_baseboards", label: "Baseboards" },
    { key: "raw_arches",     label: "Arched Entryways" },
  ];
  let currentIdx = 0;
  let clickedTileX = -1;
  let clickedTileY = -1;

  // Render the spritesheet at 1:1
  const sheet = add([
    sprite(sheets[0].key),
    pos(0, 0),
    z(0),
  ]);

  function switchSheet(idx) {
    currentIdx = idx;
    sheet.use(sprite(sheets[idx].key));
    clickedTileX = -1;
    clickedTileY = -1;
  }

  // Keys 1-5 to switch sheets
  for (let i = 0; i < sheets.length; i++) {
    onKeyPress(String(i + 1), () => switchSheet(i));
  }

  // Arrow keys to cycle
  onKeyPress("left",  () => switchSheet((currentIdx - 1 + sheets.length) % sheets.length));
  onKeyPress("right", () => switchSheet((currentIdx + 1) % sheets.length));

  // Click to pick a tile
  onClick(() => {
    const mx = mousePos().x;
    const my = mousePos().y;
    clickedTileX = Math.floor(mx / 32) * 32;
    clickedTileY = Math.floor(my / 32) * 32;
  });

  // Draw overlay
  onDraw(() => {
    const sw = width();
    const sh = height();

    // Grid lines
    for (let x = 0; x <= sw; x += 32) {
      drawLine({ p1: vec2(x, 0), p2: vec2(x, sh), width: 1, color: rgb(255, 255, 0), opacity: 0.3 });
    }
    for (let y = 0; y <= sh; y += 32) {
      drawLine({ p1: vec2(0, y), p2: vec2(sw, y), width: 1, color: rgb(255, 255, 0), opacity: 0.3 });
    }

    // Highlight clicked tile
    if (clickedTileX >= 0) {
      drawRect({
        pos: vec2(clickedTileX, clickedTileY),
        width: 32,
        height: 32,
        color: rgb(255, 0, 0),
        opacity: 0.35,
      });
      drawRect({
        pos: vec2(clickedTileX, clickedTileY),
        width: 32,
        height: 32,
        fill: false,
        outline: { width: 2, color: rgb(255, 0, 0) },
      });
    }

    // Info bar background
    const barY = sh - 48;
    drawRect({ pos: vec2(0, barY), width: sw, height: 48, color: rgb(0, 0, 0), opacity: 0.85 });

    // Sheet name
    drawText({
      text: `[${currentIdx + 1}/${sheets.length}] ${sheets[currentIdx].label}  |  Keys: 1-${sheets.length} / ← →`,
      pos: vec2(8, barY + 4),
      size: 16,
      color: rgb(200, 200, 200),
    });

    // Coordinates
    const coordText = clickedTileX >= 0
      ? `COORDS:  x: ${clickedTileX},  y: ${clickedTileY}`
      : `Click a tile to get coordinates`;
    drawText({
      text: coordText,
      pos: vec2(8, barY + 24),
      size: 18,
      color: rgb(255, 255, 0),
    });

    // Mouse position (live)
    const mx = Math.floor(mousePos().x / 32) * 32;
    const my = Math.floor(mousePos().y / 32) * 32;
    drawText({
      text: `Mouse: ${mx}, ${my}`,
      pos: vec2(sw - 160, barY + 24),
      size: 16,
      color: rgb(150, 255, 150),
    });
  });
});
