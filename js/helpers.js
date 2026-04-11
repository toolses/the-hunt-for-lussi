// ============================================================
// JAKTEN PÅ LUSSI — Shared helpers
// ============================================================

// ────────────────────────────────────────────────────────────
// ROOM CONSTRUCTION — Z-INDEX LAYERS
// ────────────────────────────────────────────────────────────
// z(0)  — floor tiles
// z(1)  — floor shadows (semi-transparent)
// z(5)  — wall faces, side walls, bottom wall
// z(7)  — player
// z(10) — 3D wall caps + arch overhangs (foreground, renders in front of player)
// z(11) — Lussi "?" indicator
// z(12) — furniture (above wall caps so it's never hidden)
// z(50) — rain drops (above game world, below UI)
// Note: night darkness overlay is an HTML <canvas> with CSS z-index 500,
//       not a Kaplay layer.  It sits above the entire game canvas.

// ────────────────────────────────────────────────────────────
// FLOOR SHADOWS
// ────────────────────────────────────────────────────────────

var gamePaused = false;   // set by pauseGame() / resume
var _rainSoundHandle = null;  // AudioPlay handle for looping rain ambient

/**
 * Places semi-transparent shadow tiles along the top and left inner
 * edges of the room (cast by the north and west walls).
 * x1,y1 = inner top-left corner; x2,y2 = inner bottom-right corner.
 */
function addFloorShadows(x1, y1, x2, y2) {
  var T = 32;
  // Top edge shadows (directly under baseboard row)
  for (var x = x1; x < x2; x += T) {
    add([sprite("shadow_t"), pos(x, y1), z(1), opacity(0.5)]);
  }
  // Left edge shadows
  for (var y = y1 + T; y < y2; y += T) {
    add([sprite("shadow_l"), pos(x1, y), z(1), opacity(0.5)]);
  }
}

// ────────────────────────────────────────────────────────────
// ROOM SHELL — makeRoomLevel / makeRoomShell
// ────────────────────────────────────────────────────────────

/**
 * Builds a complete room on a strict 32x32 grid.
 *
 *  Z-layer contract:
 *    z(0)  — floor tiles
 *    z(1)  — floor shadows (L-shape along north + west)
 *    z(5)  — wall faces, baseboards, side borders, bottom wall (collision)
 *    z(7)  — player
 *    z(10) — wall caps + arched entryways (player walks under)
 *    z(11) — Lussi "?" indicator
 *    z(12) — furniture (always above wall caps)
 *
 *  North wall = triple-stack:
 *    Row 1 (y0)     wall_3d cap    z(10)  NO collision (walk-under overhang)
 *    Row 2 (y0+32)  wall face      z(5)   collision
 *    Row 3 (y0+64)  baseboard      z(5)   collision
 *
 * @param {string} floorType  Sprite name for floor tiles (default: "floor_rb_wood")
 * @param {Array}  topGaps    [{x, w}] pixel ranges to skip in the top wall (door openings)
 */
function makeRoomLevel(floorType, topGaps, leftGaps, rightGaps, bottomGaps) {
  topGaps = topGaps || [];
  leftGaps = leftGaps || [];
  rightGaps = rightGaps || [];
  bottomGaps = bottomGaps || [];

  const T = 32;
  const cols = 19; // ROOM_W / T
  const rows = 14; // ROOM_H / T

  // Convert pixel gaps to tile rows/cols
  const gapCols = [];
  for (let g of topGaps) {
    let startCol = Math.round((g.x - ROOM_OX) / T);
    let endCol = startCol + Math.round(g.w / T);
    for (let i = startCol; i < endCol; i++) gapCols.push(i);
  }

  const leftGapRows = [];
  for (let g of leftGaps) {
    let startRow = Math.round((g.y - ROOM_OY) / T);
    let endRow = startRow + Math.round(g.h / T);
    for (let i = startRow; i < endRow; i++) leftGapRows.push(i);
  }

  const rightGapRows = [];
  for (let g of rightGaps) {
    let startRow = Math.round((g.y - ROOM_OY) / T);
    let endRow = startRow + Math.round(g.h / T);
    for (let i = startRow; i < endRow; i++) rightGapRows.push(i);
  }

  const bottomGapCols = [];
  for (let g of bottomGaps) {
    let startCol = Math.round((g.x - ROOM_OX) / T);
    let endCol = startCol + Math.round(g.w / T);
    for (let i = startCol; i < endCol; i++) bottomGapCols.push(i);
  }

  // 1. FLOOR
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows - 1; r++) {
      add([sprite("floor_center"), pos(ROOM_OX + c * T, ROOM_OY + r * T), z(0)]);
    }
  }

  // 1b. FLOOR UNDER BOTTOM-WALL GAPS
  for (let c of bottomGapCols) {
    add([sprite("floor_center"), pos(ROOM_OX + c * T, ROOM_OY + (rows - 1) * T), z(0)]);
  }

  // 2. SHADOWS
  for (let c = 1; c < cols - 1; c++) {
    add([sprite("shadow_t"), pos(ROOM_OX + c * T, ROOM_OY + 3 * T), z(1), opacity(0.5)]);
  }
  for (let r = 3; r < rows - 1; r++) {
    if (!leftGapRows.includes(r)) {
      add([sprite("shadow_l"), pos(ROOM_OX + T, ROOM_OY + r * T), z(1), opacity(0.5)]);
    }
  }

  // 3. NORTH WALL (Top)
  // Top corners (no shadow below these)
  add([sprite("wall_top_corner-left"), pos(ROOM_OX, ROOM_OY), z(10)]);
  add([sprite("wall_top_corner-right"), pos(ROOM_OX + (cols - 1) * T, ROOM_OY), z(10)]);
  // Side wall tops (rows 1–2, below corners)
  add([sprite("wall-left-side-top-1"), pos(ROOM_OX, ROOM_OY + T), z(5), area(), body({isStatic: true}), "wall"]);
  //add([sprite("wall-left-side-top-2"), pos(ROOM_OX, ROOM_OY + 2 * T), z(5), area(), body({isStatic: true}), "wall"]);
  add([sprite("wall-right-side-top-1"), pos(ROOM_OX + (cols - 1) * T, ROOM_OY + T), z(5), area(), body({isStatic: true}), "wall"]);
  //add([sprite("wall-right-side-top-2"), pos(ROOM_OX + (cols - 1) * T, ROOM_OY + 2 * T), z(5), area(), body({isStatic: true}), "wall"]);

  for (let c = 1; c < cols - 1; c++) {
    const x = ROOM_OX + c * T;

    if (!gapCols.includes(c)) {
      add([sprite("wall_top"), pos(x, ROOM_OY), z(10)]);
      add([sprite("wall_top_shadow"), pos(x, ROOM_OY + T), z(5), area(), body({isStatic: true}), "wall"]);
      // add([sprite("wall_face"), pos(x, ROOM_OY + T), z(5), area(), body({isStatic: true}), "wall"]);
      // add([sprite("wall_baseboard"), pos(x, ROOM_OY + 2 * T), z(5), area(), body({isStatic: true}), "wall"]);
    }

    // 4. SOUTH WALL (Bottom)
    if (!bottomGapCols.includes(c)) {
      add([sprite("wall_bottom"), pos(x, ROOM_OY + (rows - 1) * T), z(5), area(), body({isStatic: true}), "wall"]);
    }
  }

  // Bottom wall corners
  add([sprite("wall-corner-bottom-left"), pos(ROOM_OX, ROOM_OY + (rows - 1) * T), z(5), area(), body({isStatic: true}), "wall"]);
  add([sprite("wall-corner-bottom-right"), pos(ROOM_OX + (cols - 1) * T, ROOM_OY + (rows - 1) * T), z(5), area(), body({isStatic: true}), "wall"]);

  // 5. SIDE WALLS
  for (let r = 2; r < rows - 1; r++) {
    const y = ROOM_OY + r * T;

    // Left Wall
    if (!leftGapRows.includes(r)) {
      add([sprite("border_l"), pos(ROOM_OX, y), z(5), area(), body({isStatic: true}), "wall"]);
    }

    // Right Wall
    if (!rightGapRows.includes(r)) {
      add([sprite("border_r"), pos(ROOM_OX + (cols - 1) * T, y), z(5), area(), body({isStatic: true}), "wall"]);
    }
  }
}

/** Backward-compatible alias for makeRoomLevel. */
function makeRoomShell(floorType, topGaps, leftGaps, rightGaps, bottomGaps) {
  makeRoomLevel(floorType, topGaps, leftGaps, rightGaps, bottomGaps);
}

// ────────────────────────────────────────────────────────────
// INTERNAL TOP WALL
// ────────────────────────────────────────────────────────────

/**
 * Draws a horizontal top-wall style divider inside a room.
 * Matches the visual of the room's north wall: cap tiles at z(10)
 * (render in front of player) + face tiles at z(5) with collision.
 *
 * @param {number}  x         Left edge in pixels (32px-aligned)
 * @param {number}  y         Y position in pixels (32px-aligned)
 * @param {number}  w         Width in pixels (multiple of 32)
 * @param {boolean} openLeft  If true, skip collision on the first tile (passage gap)
 */
function makeTopWall(x, y, w, openLeft) {
  var T = 32;
  for (var tx = x; tx < x + w; tx += T) {
    add([sprite("wall_top"), pos(tx, y), z(10)]);
    if (openLeft && tx === x) continue;
    add([sprite("wall_top_shadow"), pos(tx, y + T), z(5), area(), body({ isStatic: true }), "wall"]);
  }
}

// ────────────────────────────────────────────────────────────
// ARCH DOOR (bottom wall)
// ────────────────────────────────────────────────────────────

/**
 * Places a 3-tile (96px) arched doorway on the bottom wall.
 * Top row (arch_tl/tc/tr) sits one tile INSIDE the room above the door.
 * Mid row (arch_ml/mc/mr) sits at the bottom wall row.
 * Both at z=10 so the player (z=7) walks under them visually.
 *
 * @param {number} x  Left edge of arch (must be 32px-aligned, 96px fits between side walls)
 * @param {number} y  Bottom wall y (= ROOM_OY + ROOM_H - BOT_WALL_H)
 */
function makeArchDoor(x, y) {
  add([sprite("arch_tl"), pos(x,      y - 32), z(10), anchor("topleft")]);
  add([sprite("arch_tc"), pos(x + 32, y - 32), z(10), anchor("topleft")]);
  add([sprite("arch_tr"), pos(x + 64, y - 32), z(10), anchor("topleft")]);
  add([sprite("arch_ml"), pos(x,      y),      z(10), anchor("topleft")]);
  add([sprite("arch_mc"), pos(x + 32, y),      z(10), anchor("topleft")]);
  add([sprite("arch_mr"), pos(x + 64, y),      z(10), anchor("topleft")]);
}

// ────────────────────────────────────────────────────────────
// WALL & FLOOR TILE HELPERS
// ────────────────────────────────────────────────────────────

/**
 * Invisible collision-only wall rect (no visual).
 * Used for internal room partitions (e.g. stairwell dividers).
 */
function makeWall(x, y, w, h) {
  return add([
    rect(w, h),
    pos(x, y),
    opacity(0),
    area(),
    body({ isStatic: true, gravityScale: 0 }),
    "wall",
  ]);
}

/**
 * Fills a rectangular area with floor sprite tiles.
 * If useBorders=true and the sprite has _tl/_t/_tr/_l/_r variants,
 * those are applied along the edges automatically.
 */
function tileFloor(x1, y1, x2, y2, spriteName, useBorders) {
  var T = 32;
  for (var x = x1; x < x2; x += T) {
    for (var y = y1; y < y2; y += T) {
      var tile = spriteName;
      if (useBorders) {
        var isTop   = (y === y1);
        var isLeft  = (x === x1);
        var isRight = (x + T >= x2);
        if      (isTop && isLeft)  tile = spriteName + "_tl";
        else if (isTop && isRight) tile = spriteName + "_tr";
        else if (isTop)            tile = spriteName + "_t";
        else if (isLeft)           tile = spriteName + "_l";
        else if (isRight)          tile = spriteName + "_r";
      }
      add([sprite(tile), pos(x, y), z(0)]);
    }
  }
}

// ────────────────────────────────────────────────────────────
// DOOR HELPERS
// ────────────────────────────────────────────────────────────

/**
 * Invisible trigger-only doorway (no visual).
 * Used for top-wall and bottom-wall doors — arch sprites provide the visual.
 */
function makeDoorway(x, y, w, h, tag) {
  return add([rect(w, h), pos(x, y), opacity(0), area(), anchor("topleft"), tag]);
}

/**
 * Side wall door opening: dark overlay + invisible trigger.
 * Used for left/right wall doors where no arch sprite is available.
 */
function makeSideWallDoor(x, y, w, h, tag) {
  // Just an invisible collision area to trigger the scene change
  return add([rect(w, h), pos(x, y), opacity(0), area(), anchor("topleft"), tag]);
}

/**
 * Connects a door collision tag to a scene transition.
 * Adds a 1-second cooldown when arriving through the same door
 * to prevent immediate bounce-back.
 */
function onDoor(player, tag, targetScene, fra, currentFra) {
  var ready = (currentFra === targetScene) ? false : true;
  if (!ready) wait(1, function() { ready = true; });
  player.onCollide(tag, function() {
    if (ready) go(targetScene, { fra: fra });
  });
}

// ────────────────────────────────────────────────────────────
// STAIRCASE
// ────────────────────────────────────────────────────────────

/**
 * Draws a staircase with shaded steps and handrails.
 * direction: "up" (lighter toward right) or "down" (lighter toward left).
 * Returns the collision zone as a game object.
 */
function makeStairs(x1, y1, x2, y2, direction, tag) {
  var stepCount = 8;
  var padding   = 10;
  var sy = y1 + padding;
  var sh = (y2 - y1) - padding * 2;
  var stepW = Math.floor((x2 - x1) / stepCount);

  for (var i = 0; i < stepCount; i++) {
    var sx = x1 + i * stepW;
    var shade = (direction === "up")
      ? 60 + Math.floor(i * 12)
      : 60 + Math.floor((stepCount - 1 - i) * 12);
    add([rect(stepW - 2, sh), pos(sx, sy), color(shade, shade - 10, shade - 20), z(2)]);
    add([rect(2, sh),         pos(sx, sy), color(shade + 40, shade + 30, shade + 20), z(3)]);
  }
  var railH = 4;
  add([rect(x2 - x1, railH), pos(x1, sy - railH), color(100, 70, 45), z(4)]);
  add([rect(x2 - x1, railH), pos(x1, sy + sh),    color(100, 70, 45), z(4)]);

  return add([rect(x2 - x1, y2 - y1), pos(x1, y1), opacity(0),
              area(), anchor("topleft"), tag]);
}

// ────────────────────────────────────────────────────────────
// DECORATION HELPERS
// ────────────────────────────────────────────────────────────

/**
 * Colored rectangle decoration (no collision).
 * Used for bench strips, road/grass fills, etc.
 */
function makeDeco(x, y, w, h, col) {
  return add([rect(w, h), pos(x, y), color(...col)]);
}

/**
 * Sprite decoration at z(12) — above wall caps (z=10) so furniture
 * is never hidden behind wall overhangs.
 * sc: scale factor (default 1).
 */
function makeSpriteDeco(x, y, spriteName, sc) {
  sc = sc || 1;
  return add([
    sprite(spriteName),
    pos(x, y),
    scale(sc),
    anchor("topleft"),
    z(12),
  ]);
}

/**
 * Places a collectable treat (godbiter) at tile (col, row).
 * sceneKey: short scene identifier (e.g. "ylva") used to persist
 * collection state — treats stay gone when the player re-enters the room.
 * Renders as a golden circle with a gentle bob animation.
 * Tag: "treat" — player collision is wired in setupControls.
 */
function addTreat(col, row, sceneKey) {
  var key = (sceneKey || "?") + "_" + col + "_" + row;
  if (collectedTreats[key]) return;   // already picked up this run

  var baseX = tileX(col) + 16;
  var baseY = tileY(row) + 16;
  var bobPhase = Math.random() * Math.PI * 2;
  var t = add([
    text("🐟", { size: 18 }),
    pos(baseX, baseY),
    anchor("center"),
    z(7),
    "treat",
    { _baseY: baseY, _phase: bobPhase, _key: key },
  ]);
  t.onUpdate(function() {
    t._phase += dt() * 2.5;
    t.pos.y = t._baseY + Math.sin(t._phase) * 3;
  });
  return t;
}

// ────────────────────────────────────────────────────────────
// CLICKABLE INTERACTION INDICATOR
// ────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────
// SAVE SYSTEM — localStorage persistence
// ────────────────────────────────────────────────────────────

/**
 * Saves current game progress to localStorage.
 * Triggered after collecting treats, searching rooms, and quest steps.
 */
function saveGame() {
  try {
    var data = {
      questState:        JSON.parse(JSON.stringify(questState)),
      inventory:         inventory.slice(),
      roomsSearched:     Object.assign({}, roomsSearched),
      treatsCount:       treatsCount,
      collectedTreats:   Object.assign({}, collectedTreats),
      selectedCharacter: selectedCharacter,
      lastScene:         lastScene,
    };
    localStorage.setItem("lussi_savegame", JSON.stringify(data));
    console.log("Progress saved! Scene:", lastScene);
    showSaveIndicator();
  } catch(e) {
    console.warn("Kunne ikke lagre:", e);
  }
}

/**
 * Loads game progress from localStorage.
 * Returns true if save found, false otherwise.
 */
function loadGame() {
  try {
    var raw = localStorage.getItem("lussi_savegame");
    if (!raw) return false;
    var d = JSON.parse(raw);
    Object.assign(questState.searchRooms, d.questState.searchRooms);
    Object.assign(questState.collectFish, d.questState.collectFish);
    questState.waterQuest = d.questState.waterQuest;
    questState.lussiChase = d.questState.lussiChase;
    inventory.length = 0;
    for (var i = 0; i < d.inventory.length; i++) inventory.push(d.inventory[i]);
    Object.assign(roomsSearched,   d.roomsSearched   || {});
    Object.assign(collectedTreats, d.collectedTreats || {});
    treatsCount       = d.treatsCount       || 0;
    selectedCharacter = d.selectedCharacter || "ylva";
    lastScene         = d.lastScene         || "etasje2_kjokken";
    if (selectedCharacter === "custom") loadCharacter();
    return true;
  } catch(e) {
    console.warn("Kunne ikke laste lagret spill:", e);
    return false;
  }
}

/**
 * Saves custom character sprite to localStorage.
 * Called after character creation compositing.
 */
function saveCharacter(dataUrl, runDataUrl) {
  try {
    var data = {
      characterLayers:           Object.assign({}, characterLayers),
      customCharacterDataUrl:    dataUrl,
      customCharacterRunDataUrl: runDataUrl || null,
    };
    localStorage.setItem("lussi_character", JSON.stringify(data));
  } catch(e) {
    console.warn("Kunne ikke lagre karakter:", e);
  }
}

/**
 * Loads custom character sprite from localStorage.
 * Returns true if successful, false otherwise.
 */
function loadCharacter() {
  try {
    var raw = localStorage.getItem("lussi_character");
    if (!raw) return false;
    var d = JSON.parse(raw);
    Object.assign(characterLayers, d.characterLayers);
    customCharacterDataUrl = d.customCharacterDataUrl;
    customCharacterRunDataUrl = d.customCharacterRunDataUrl || null;
    var idleAnimDef = {
      sliceX: 24,
      anims: {
        "idle_right": { from: 0,  to: 5,  loop: true, speed: 6 },
        "idle_up":    { from: 6,  to: 11, loop: true, speed: 6 },
        "idle_left":  { from: 12, to: 17, loop: true, speed: 6 },
        "idle_down":  { from: 18, to: 23, loop: true, speed: 6 },
      },
    };
    var runAnimDef = {
      sliceX: 24,
      anims: {
        "run_right":  { from: 0,  to: 5,  loop: true, speed: 10 },
        "run_up":     { from: 6,  to: 11, loop: true, speed: 10 },
        "run_left":   { from: 12, to: 17, loop: true, speed: 10 },
        "run_down":   { from: 18, to: 23, loop: true, speed: 10 },
      },
    };
    loadSprite("custom_idle_anim", customCharacterDataUrl, idleAnimDef);
    // Use separate run strip if available, otherwise fall back to idle strip
    var runSrc = customCharacterRunDataUrl || customCharacterDataUrl;
    loadSprite("custom_run", runSrc, runAnimDef);
    return true;
  } catch(e) {
    console.warn("Kunne ikke laste karakter:", e);
    return false;
  }
}

/**
 * Resets game progress — clears lussi_savegame but never touches lussi_character.
 * Used when starting a new game.
 */
function resetGame() {
  try { localStorage.removeItem("lussi_savegame"); } catch(e) {}
  lastScene = "etasje2_kjokken";
  resetRoomsSearched();
  resetTreats();
  resetQuests();
}

/**
 * Shows a brief "💾 Lagret!" indicator in top-right corner.
 * Fades out after 2 seconds.
 */
function showSaveIndicator() {
  var ind = add([
    text("💾 Lagret!", { size: 14 }),
    pos(width() - 12, 8),
    anchor("topright"),
    color(180, 255, 180),
    opacity(1),
    fixed(),
    z(100),
  ]);
  var elapsed = 0;
  ind.onUpdate(function() {
    elapsed += dt();
    if (elapsed > 1.5) ind.opacity = Math.max(0, 1 - (elapsed - 1.5) * 2);
    if (elapsed > 2.0) destroy(ind);
  });
}

/**
 * Adds a pulsing clickable indicator near `parentObj`.
 * Visible only when the player is within 64px AND `condition()` is true.
 * On click, calls `onInteract()`.
 *
 * @param parentObj   Game object with .pos (e.g. from makeSpriteDeco)
 * @param condition   Function returning true when interaction is available
 * @param onInteract  Callback executed on click
 * @returns           The indicator game object
 */
function addInteraction(parentObj, condition, onInteract) {
  var indicator = add([
    circle(12),
    color(255, 230, 50),
    pos(parentObj.pos.x + 16, parentObj.pos.y - 12),
    anchor("center"),
    area(),
    z(15),
    opacity(0),
  ]);

  indicator.onUpdate(function() {
    if (!condition()) {
      indicator.opacity = 0;
      return;
    }
    // Always visible when condition met; pulse animation
    indicator.opacity = 0.55 + Math.sin(time() * 5) * 0.45;
    var s = 1 + Math.sin(time() * 3) * 0.15;
    indicator.scale = vec2(s);
  });

  indicator.onClick(function() {
    var p = get("player")[0];
    if (!p) return;
    if (indicator.opacity > 0 && p.pos.dist(parentObj.pos) < 64) {
      onInteract();
    }
  });

  return indicator;
}

// ────────────────────────────────────────────────────────────
// MESSAGES
// ────────────────────────────────────────────────────────────

/**
 * Shows a centered message for `duration` seconds (default 3).
 * Removes any existing message first to prevent stacking.
 */
function showMessage(msg, duration) {
  duration = duration || 3;
  get("tempMsg").forEach(destroy);
  var label = add([
    text(msg, { size: 16, align: "center" }),
    pos(center().add(0, 120)),
    anchor("center"),
    fixed(),
    color(255, 245, 200),
    z(100),
    "tempMsg",
  ]);
  wait(duration, function() { if (label.exists()) destroy(label); });
  return label;
}

// ────────────────────────────────────────────────────────────
// HIDDEN LUSSI (room search mechanic)
// ────────────────────────────────────────────────────────────

/**
 * Adds a hidden Lussi to a room. When the player comes close she
 * reveals herself and flees toward `doorTarget`.
 *
 * @param {string} roomKey      Key in roomsSearched
 * @param {{x,y}}  hidePos      Where Lussi hides (behind furniture)
 * @param {{x,y}}  indicatorPos Where the "?" floats (above furniture)
 * @param {{x,y}}  doorTarget   Position Lussi runs to when triggered
 * @param          player       Player game object
 * @param {number} triggerDist  Proximity to trigger (default 60)
 */
function addRoomLussi(roomKey, hidePos, indicatorPos, doorTarget, player, triggerDist) {
  if (roomsSearched[roomKey]) return;
  triggerDist = triggerDist || 60;

  var lussi = add([
    sprite("lussi"),
    pos(hidePos.x, hidePos.y),
    scale(1.5),
    anchor("center"),
    z(0),
    "roomLussi",
  ]);
  lussi.play("idle");
  lussi.flipX = (doorTarget.x < hidePos.x);

  var baseY = indicatorPos.y;
  var indicator = add([
    text("?", { size: 18 }),
    pos(indicatorPos.x, indicatorPos.y),
    anchor("center"),
    color(255, 255, 100),
    opacity(0.8),
    z(11),
  ]);
  indicator.onUpdate(function() {
    indicator.pos.y = baseY + Math.sin(time() * 3) * 3;
  });

  var triggered = false;
  player.onUpdate(function() {
    if (triggered) return;
    if (player.pos.dist(lussi.pos) < triggerDist) {
      triggered = true;
      roomsSearched[roomKey] = true;
      questState.searchRooms.current =
        Object.values(roomsSearched).filter(function(v) { return v; }).length;
      saveGame();
      lussi.z = 10;
      if (indicator.exists()) destroy(indicator);

      wait(0.3, function() {
        var target = (typeof doorTarget === "function") ? doorTarget() : doorTarget;
        lussi.play("run");
        lussi.flipX = (target.x < lussi.pos.x);
        var speed = 280;
        var moveHandler = lussi.onUpdate(function() {
          var dir = vec2(target.x, target.y).sub(lussi.pos);
          if (dir.len() < 12) {
            moveHandler.cancel();
            if (lussi.exists()) destroy(lussi);
            return;
          }
          lussi.move(dir.unit().scale(speed));
        });
      });
    }
  });
}

// ────────────────────────────────────────────────────────────
// PLAYER
// ────────────────────────────────────────────────────────────

const DIR_NAMES = ["right", "up", "left", "down"];

/**
 * Creates the player sprite at `spawnPos`.
 * z(7): renders above floor/walls (z≤5) but below arch overhangs (z=10).
 */
function makePlayer(spawnPos) {
  // Built-in sprites are 16×16 base @scale2 → 32px on screen.
  // Custom sprites are 32×42 base (32px + 10px overflow for hair) @scale1 → same 32px on screen.
  var isCustom  = selectedCharacter === "custom";
  var charScale = isCustom ? 1 : 2;
  // Hitbox on feet area, same world footprint for both:
  //   built-in 16×16 @scale2: Rect(2,10,12,6) → 24×12 world
  //   custom   32×42 @scale1: Rect(4,33,24,9) → 24×9 world
  var hitbox = isCustom
    ? new Rect(vec2(4, 33), 24, 9)
    : new Rect(vec2(2, 10), 12, 6);

  var p = add([
    sprite(selectedCharacter + "_idle_anim"),
    pos(spawnPos),
    scale(charScale),
    area({ shape: hitbox }),
    body({ gravityScale: 0 }),
    anchor("center"),
    z(7),
    "player",
  ]);
  p.dirIndex   = 3;
  p.isMoving   = false;
  p.currentAnim = "";
  p.play("idle_down");
  p.currentAnim = "idle_down";
  return p;
}

/**
 * Wires keyboard + touch/mouse controls to `player`.
 * If `followCamera` is true, camera tracks the player (used in gata scene).
 * sceneName: the current scene key, used to track lastScene for save/resume.
 */
function setupControls(player, followCamera, sceneName) {
  var touchActive = false;
  onMouseDown(function()    { touchActive = true;  });
  onMouseRelease(function() { touchActive = false; });

  // Track which scene we're in
  if (sceneName) lastScene = sceneName;

  onUpdate(function() {
    if (gamePaused) return;
    var moved = false;
    var dx = 0, dy = 0;

    if (isKeyDown("left")  || isKeyDown("a")) dx -= PLAYER_SPEED;
    if (isKeyDown("right") || isKeyDown("d")) dx += PLAYER_SPEED;
    if (isKeyDown("up")    || isKeyDown("w")) dy -= PLAYER_SPEED;
    if (isKeyDown("down")  || isKeyDown("s")) dy += PLAYER_SPEED;

    if (dx !== 0 || dy !== 0) {
      player.move(dx, dy);
      moved = true;
      if (Math.abs(dx) >= Math.abs(dy)) {
        player.dirIndex = dx > 0 ? 0 : 2;
      } else {
        player.dirIndex = dy > 0 ? 3 : 1;
      }
    }

    if (touchActive && !moved) {
      var worldMouse = toWorld(mousePos());
      var dist = worldMouse.dist(player.pos);
      if (dist > 8) {
        var dir = worldMouse.sub(player.pos).unit();
        player.move(dir.scale(PLAYER_SPEED));
        moved = true;
        if (Math.abs(dir.x) >= Math.abs(dir.y)) {
          player.dirIndex = dir.x > 0 ? 0 : 2;
        } else {
          player.dirIndex = dir.y > 0 ? 3 : 1;
        }
      }
    }

    var dirName = DIR_NAMES[player.dirIndex];
    if (moved) {
      var wantAnim = "run_" + dirName;
      if (player.currentAnim !== wantAnim) {
        player.use(sprite(selectedCharacter + "_run"));
        player.play(wantAnim);
        player.currentAnim = wantAnim;
        player.isMoving = true;
      }
    } else {
      var wantIdle = "idle_" + dirName;
      if (player.currentAnim !== wantIdle) {
        player.use(sprite(selectedCharacter + "_idle_anim"));
        player.play(wantIdle);
        player.currentAnim = wantIdle;
        player.isMoving = false;
      }
    }

    if (followCamera) camPos(player.pos);
    else              camPos(vec2(400, 300));
  });

  // Treat pickup — proximity-based (treats have no body/area)
  player.onUpdate(function() {
    if (gamePaused) return;
    var treats = get("treat");
    for (var i = 0; i < treats.length; i++) {
      var t = treats[i];
      if (player.pos.dist(t.pos) < 28) {
        collectedTreats[t._key] = true;
        destroy(t);
        treatsCount++;
        questState.collectFish.current = treatsCount;
        try { play("lyd_pling"); } catch(e) {}
        saveGame();
      }
    }
  });
}

// ────────────────────────────────────────────────────────────
// PAUSE MENU
// ────────────────────────────────────────────────────────────

/** Flips isMuted and adjusts global Kaplay volume accordingly. */
function toggleMute() {
  isMuted = !isMuted;
  volume(isMuted ? 0 : 1);
}

/**
 * Darkens the screen and shows Resume / Home buttons.
 * Sets gamePaused=true so setupControls ignores input.
 * Tagged "pause_overlay" — destroyed on resume.
 */
function pauseGame() {
  if (gamePaused) return;
  gamePaused = true;

  // Dark overlay
  add([
    rect(width(), height()),
    pos(0, 0),
    color(0, 0, 0),
    opacity(0.65),
    fixed(),
    z(200),
    "pause_overlay",
  ]);

  add([
    text("PAUSE", { size: 36, align: "center" }),
    pos(400, 170),
    anchor("center"),
    color(255, 255, 255),
    fixed(),
    z(201),
    "pause_overlay",
  ]);

  // FORTSETT (Resume) button
  var fortsettBtn = add([
    rect(260, 72, { radius: 12 }),
    pos(400, 270),
    anchor("center"),
    color(60, 150, 80),
    area(),
    fixed(),
    z(201),
    "pause_overlay",
  ]);
  add([
    text("FORTSETT", { size: 26 }),
    pos(400, 270),
    anchor("center"),
    color(255, 255, 255),
    fixed(),
    z(202),
    "pause_overlay",
  ]);
  fortsettBtn.onHover(function()    { fortsettBtn.color = rgb(80, 180, 100); });
  fortsettBtn.onHoverEnd(function() { fortsettBtn.color = rgb(60, 150, 80);  });
  fortsettBtn.onClick(function() {
    get("pause_overlay").forEach(destroy);
    gamePaused = false;
  });

  // HJEM (Home) button
  var hjemBtn = add([
    rect(260, 72, { radius: 12 }),
    pos(400, 365),
    anchor("center"),
    color(160, 70, 60),
    area(),
    fixed(),
    z(201),
    "pause_overlay",
  ]);
  add([
    text("HJEM", { size: 26 }),
    pos(400, 365),
    anchor("center"),
    color(255, 255, 255),
    fixed(),
    z(202),
    "pause_overlay",
  ]);
  hjemBtn.onHover(function()    { hjemBtn.color = rgb(190, 90, 80); });
  hjemBtn.onHoverEnd(function() { hjemBtn.color = rgb(160, 70, 60); });
  hjemBtn.onClick(function() {
    gamePaused = false;
    saveGame();
    go("start");
  });

  // TILLAT VARSLINGER (Notifications) button
  var notifBtn = add([
    rect(260, 72, { radius: 12 }),
    pos(400, 460),
    anchor("center"),
    color(60, 100, 160),
    area(),
    fixed(),
    z(201),
    "pause_overlay",
  ]);
  add([
    text("🔔 Tillat Varslinger", { size: 20 }),
    pos(400, 460),
    anchor("center"),
    color(255, 255, 255),
    fixed(),
    z(202),
    "pause_overlay",
  ]);
  notifBtn.onHover(function()    { notifBtn.color = rgb(80, 130, 200); });
  notifBtn.onHoverEnd(function() { notifBtn.color = rgb(60, 100, 160); });
  notifBtn.onClick(function() {
    get("pause_overlay").forEach(destroy);
    gamePaused = false;
    requestNotificationPermission();
  });
}

// ────────────────────────────────────────────────────────────
// GLOBAL UI — quest log + inventory bar
// ────────────────────────────────────────────────────────────

/**
 * Adds a fixed UI overlay with:
 *   - Quest log   (top-left)
 *   - Inventory   (bottom-center)
 * Call once per game scene (not on start/vinn screens).
 */
function setupGlobalUI() {
  // ── Quest Log (top-left) ─────────────────────────────────

  var questBg = add([
    rect(280, 68, { radius: 6 }),
    pos(5, 5),
    fixed(),
    color(0, 0, 0),
    opacity(0.35),
    z(99),
  ]);

  var searchLabel = add([
    text("", { size: 14 }),
    pos(10, 10),
    fixed(),
    z(100),
  ]);
  searchLabel.onUpdate(function() {
    questState.searchRooms.current =
      Object.values(roomsSearched).filter(function(v) { return v; }).length;
    if (questState.searchRooms.current >= questState.searchRooms.total) {
      searchLabel.text = "✅ Alle rom sjekket!";
      searchLabel.color = rgb(150, 200, 150);
    } else {
      searchLabel.text = "🔍 Finn Lussi (" +
        questState.searchRooms.current + "/" +
        questState.searchRooms.total + " rom sjekket)";
      searchLabel.color = rgb(255, 255, 255);
    }
  });

  var fishLabel = add([
    text("", { size: 14 }),
    pos(10, 32),
    fixed(),
    z(100),
  ]);
  fishLabel.onUpdate(function() {
    questState.collectFish.current = treatsCount;
    if (questState.collectFish.current >= questState.collectFish.total) {
      fishLabel.text = "✅ Alle godbiter funnet!";
      fishLabel.color = rgb(150, 200, 150);
    } else {
      fishLabel.text = "🐟 Finn godbiter (" +
        questState.collectFish.current + "/" +
        questState.collectFish.total + ")";
      fishLabel.color = rgb(255, 255, 255);
    }
  });

  var bowlLabel = add([
    text("", { size: 14 }),
    pos(10, 54),
    fixed(),
    z(100),
  ]);
  bowlLabel.onUpdate(function() {
    var step = questState.waterQuest.step;
    if (step === "done") {
      bowlLabel.text = "✅ Vannskålen er klar!";
      bowlLabel.color = rgb(150, 200, 150);
    } else if (step === "find_bowl") {
      bowlLabel.text = "💧 Finn vannskålen";
      bowlLabel.color = rgb(255, 255, 255);
    } else if (step === "fill_water") {
      bowlLabel.text = "💧 Fyll vann";
      bowlLabel.color = rgb(255, 255, 255);
    } else if (step === "place_bowl") {
      bowlLabel.text = "💧 Sett ned vannet";
      bowlLabel.color = rgb(255, 255, 255);
    }
  });

  var chaseLabel = add([
    text("", { size: 14 }),
    pos(10, 76),
    fixed(),
    z(100),
  ]);
  chaseLabel.onUpdate(function() {
    var chase = questState.lussiChase;
    if (!chase.active) {
      chaseLabel.text = "";
      // Resize background to 3 lines when chase quest is hidden
      questBg.height = 68;
    } else if (chase.status === "done") {
      chaseLabel.text = "✅ Lussi er fanget!";
      chaseLabel.color = rgb(150, 200, 150);
      questBg.height = 90;
    } else if (chase.status === "catchable") {
      chaseLabel.text = "😺 Fang Lussi!";
      chaseLabel.color = rgb(100, 255, 100);
      questBg.height = 90;
    } else {
      chaseLabel.text = "😺 Prøv å fange Lussi!";
      chaseLabel.color = rgb(255, 255, 255);
      questBg.height = 90;
    }
  });

  // ── Inventory Bar (bottom-center) ────────────────────────

  add([
    rect(120, 36, { radius: 6 }),
    pos(400, 574),
    anchor("center"),
    fixed(),
    color(0, 0, 0),
    opacity(0.35),
    z(99),
  ]);

  var invSlot = add([
    text("", { size: 20 }),
    pos(400, 574),
    anchor("center"),
    fixed(),
    z(100),
  ]);
  invSlot.onUpdate(function() {
    if (inventory.includes("full_vannskaal")) {
      invSlot.text = "💧";
    } else if (inventory.includes("tom_vannskaal")) {
      invSlot.text = "🥣";
    } else {
      invSlot.text = "";
    }
  });

  // ── Time-of-day indicator (top-right, leftmost circle) ──
  add([
    circle(18),
    pos(width() - 140, 40),
    anchor("center"),
    color(50, 50, 70),
    opacity(0.8),
    fixed(),
    z(100),
  ]);
  var timeIcon = add([
    text("", { size: 14 }),
    pos(width() - 140, 40),
    anchor("center"),
    fixed(),
    z(101),
  ]);
  timeIcon.onUpdate(function() {
    timeIcon.text = isNight ? "🌙" : "☀️";
  });

  // ── Menu Button + Sound Button (top-right) ───────────────
  var menuBtn = add([
    circle(22),
    pos(width() - 90, 40),
    anchor("center"),
    color(50, 50, 70),
    opacity(0.8),
    area(),
    fixed(),
    z(100),
  ]);
  add([
    text("||", { size: 15 }),
    pos(width() - 90, 40),
    anchor("center"),
    color(220, 220, 255),
    fixed(),
    z(101),
  ]);
  menuBtn.onHover(function()    { menuBtn.opacity = 1.0; });
  menuBtn.onHoverEnd(function() { menuBtn.opacity = 0.8; });
  menuBtn.onClick(function() { pauseGame(); });

  var soundBtn = add([
    circle(22),
    pos(width() - 40, 40),
    anchor("center"),
    color(50, 50, 70),
    opacity(0.8),
    area(),
    fixed(),
    z(100),
  ]);
  var soundIcon = add([
    text("🔊", { size: 14 }),
    pos(width() - 40, 40),
    anchor("center"),
    fixed(),
    z(101),
  ]);
  soundIcon.onUpdate(function() {
    soundIcon.text = isMuted ? "🔇" : "🔊";
  });
  soundBtn.onHover(function()    { soundBtn.opacity = 1.0; });
  soundBtn.onHoverEnd(function() { soundBtn.opacity = 0.8; });
  soundBtn.onClick(function() { toggleMute(); });
}

// ────────────────────────────────────────────────────────────
// ATMOSPHERE — Night darkness + flashlight effect
// ────────────────────────────────────────────────────────────

/**
 * If isNight is true, layers a dark HTML canvas over the game canvas and
 * punches a soft circular "flashlight" hole that follows the player.
 *
 * The overlay is a separate <canvas> element (CSS z-index 500) drawn
 * using the 2D context's destination-out composite operation, which
 * genuinely removes pixels from the darkness so the live game canvas
 * shows through — no Kaplay blend mode hacks needed.
 *
 * Flicker: the hole radius oscillates ±2 % at ~10 Hz via sin(time()*10)
 * to simulate the unsteadiness of a real handheld flashlight.
 *
 * Cleanup: a sentinel game object's destroy() hook removes the HTML
 * canvas element when the scene changes (all scene objects are destroyed
 * by Kaplay's go() call).
 *
 * Call once per game scene, after makePlayer().  No-op during daytime.
 */
function setupAtmosphere(player) {
  if (!isNight) return;

  var gameCanvas = document.querySelector("canvas");

  var overlay = document.createElement("canvas");
  overlay.id = "night-overlay";
  overlay.width = 800;
  overlay.height = 600;
  overlay.style.position = "fixed";
  overlay.style.pointerEvents = "none";
  overlay.style.zIndex = "500";
  document.body.appendChild(overlay);

  var octx = overlay.getContext("2d");

  function _syncOverlayPos() {
    var r = gameCanvas.getBoundingClientRect();
    overlay.style.left   = r.left   + "px";
    overlay.style.top    = r.top    + "px";
    overlay.style.width  = r.width  + "px";
    overlay.style.height = r.height + "px";
  }
  _syncOverlayPos();

  onUpdate(function() {
    if (gamePaused) return;
    _syncOverlayPos();

    // Player screen position in the 800×600 logical canvas space.
    // camPos() returns the world point at the screen centre.
    var cam = camPos();
    var cx = player.pos.x - cam.x + 400;
    var cy = player.pos.y - cam.y + 300;

    // Subtle flicker: radius oscillates ±2 % at 10 Hz
    var flicker = 1 + Math.sin(time() * 10) * 0.02;
    var radius  = 130 * flicker;

    octx.clearRect(0, 0, 800, 600);

    // Deep darkness base
    octx.fillStyle = "rgba(0, 0, 10, 0.90)";
    octx.fillRect(0, 0, 800, 600);

    // Punch flashlight hole: radial gradient erases the darkness
    octx.globalCompositeOperation = "destination-out";
    var grad = octx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0,    "rgba(0,0,0,1)");    // fully clear at centre
    grad.addColorStop(0.55, "rgba(0,0,0,0.9)");  // still mostly clear
    grad.addColorStop(0.80, "rgba(0,0,0,0.35)"); // soft feathered edge
    grad.addColorStop(1,    "rgba(0,0,0,0)");    // fully dark at rim
    octx.fillStyle = grad;
    octx.fillRect(0, 0, 800, 600);

    octx.globalCompositeOperation = "source-over";
  });

  // Sentinel: remove HTML canvas when this scene ends
  add([
    fixed(),
    {
      destroy: function() {
        var el = document.getElementById("night-overlay");
        if (el) el.remove();
      }
    },
  ]);
}

// ────────────────────────────────────────────────────────────
// WEATHER — Rain
// ────────────────────────────────────────────────────────────

/**
 * Toggles falling rain.
 *
 * enable=true  — Spawns 80 semi-transparent raindrop objects (rect 1×10)
 *                falling diagonally at z(50), and starts the looping
 *                amb_rain ambient sound.
 * enable=false — Destroys all raindrop objects and stops the sound.
 *
 * Each raindrop resets to a random position above the screen when it
 * falls past the bottom or right edge.
 *
 * At night, rain is naturally visible only inside the flashlight beam
 * because the night overlay HTML canvas covers the rest of the game.
 *
 * Indoor muffled sound (near a window): future enhancement — call
 * toggleRain(false) in indoor scenes for now, or adjust _rainSoundHandle
 * volume to 0.08 and skip the visual spawn for an indoor-ambient feel.
 */
function toggleRain(enable) {
  if (enable) {
    // Clean up any leftover state (e.g. after a scene change without disable)
    if (_rainSoundHandle) {
      try { _rainSoundHandle.stop(); } catch (e) {}
      _rainSoundHandle = null;
    }
    get("rain_drop").forEach(destroy);

    // Spawn raindrop pool
    for (var i = 0; i < 80; i++) {
      add([
        rect(1, 10),
        pos(rand(0, width()), rand(0, height())),
        color(150, 180, 220),
        opacity(rand(0.25, 0.55)),
        fixed(),
        z(50),
        "rain_drop",
        {
          speed: rand(280, 420),   // pixels/second downward
          update: function() {
            if (gamePaused) return;
            this.pos.x += this.speed * 0.25 * dt();  // gentle diagonal
            this.pos.y += this.speed       * dt();
            if (this.pos.y > height() || this.pos.x > width()) {
              this.pos.x = rand(-40, width() * 0.85);
              this.pos.y = rand(-120, -10);
            }
          }
        },
      ]);
    }

    // Looping ambient rain sound
    try {
      _rainSoundHandle = play("amb_rain", { loop: true, volume: 0.3 });
    } catch (e) {
      // Sound file not yet added to assets/Audio/ — silently skip
    }

  } else {
    get("rain_drop").forEach(destroy);
    if (_rainSoundHandle) {
      try { _rainSoundHandle.stop(); } catch (e) {}
      _rainSoundHandle = null;
    }
  }
}

// ────────────────────────────────────────────────────────────
// SCENE TRANSITIONS — fade-to-black zone + fade-in
// ────────────────────────────────────────────────────────────

/**
 * Places an invisible collision zone (in world space) that, when the player
 * enters it, saves progress, fades the screen to black, then jumps to
 * `targetScene` with `{ startPos: targetPos }` so the new scene can spawn
 * the player at the correct entrance position.
 *
 * Follows the same first-arg convention as onDoor(player, …).
 */
function addTransitionZone(player, x, y, w, h, targetScene, targetPos) {
  var tag = "tz_" + targetScene;
  add([
    rect(w, h),
    pos(x, y),
    anchor("topleft"),
    opacity(0),
    area(),
    z(1),
    tag,
  ]);

  var transitioning = false;
  player.onCollide(tag, function() {
    if (transitioning || gamePaused) return;
    transitioning = true;
    gamePaused = true;
    saveGame();

    var fadeRect = add([
      rect(width(), height()),
      pos(0, 0),
      color(0, 0, 0),
      opacity(0),
      fixed(),
      z(999),
    ]);
    var elapsed = 0;
    fadeRect.onUpdate(function() {
      elapsed += dt();
      fadeRect.opacity = Math.min(1, elapsed / 0.35);
      if (elapsed >= 0.35) {
        gamePaused = false;
        go(targetScene, { startPos: targetPos });
      }
    });
  });
}

/**
 * Fades the screen from black to transparent at the start of a scene.
 * Call right after makePlayer() whenever arriving via addTransitionZone.
 */
function sceneFadeIn() {
  var fadeRect = add([
    rect(width(), height()),
    pos(0, 0),
    color(0, 0, 0),
    opacity(1),
    fixed(),
    z(999),
  ]);
  var elapsed = 0;
  fadeRect.onUpdate(function() {
    elapsed += dt();
    fadeRect.opacity = Math.max(0, 1 - elapsed / 0.35);
    if (elapsed >= 0.35) destroy(fadeRect);
  });
}
