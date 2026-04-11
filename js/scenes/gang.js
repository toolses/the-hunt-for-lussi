// ============================================================
// SCENE: etasje1_gang — Gang + yttergang + trappehus (1. etasje hub)
// Connections: Bad (left wall), Ylva (left wall), Vetle (top wall),
//              Gata (right wall), trapp opp (stairwell)
// ============================================================

scene("etasje1_gang", function(args) {
  args = args || {};
  var fra      = args.fra || "";
  var spawnPos = SPAWNS["etasje1_gang_fra_" + fra] || SPAWNS["etasje1_gang_default"];

  // ── Room shell (top-wall gap for Vetle door at cols 6–8) ────
  makeRoomShell("floor_wood_dark",
    [{ x: GANG_VETLE_GAP_X, w: 64 }],
    [{ y: GANG_BAD_DOOR_Y, h: 64 }, { y: GANG_YLVA_DOOR_Y, h: 64 }],
    [{ y: GANG_GATA_DOOR_Y, h: 64 }]
  );

  // ── Trappehus — darker floor area on right side ─────────────
  // tileFloor(tileX(12), tileY(3), tileX(19), tileY(8), "floor_wood_dark");
  makeWall(tileX(12), tileY(3) - 8, ROOM_W - 12 * 32, 8);
  makeWall(tileX(12), tileY(8) - 8, ROOM_W - 12 * 32, 8);

  // ── Side wall door openings (dark overlay + trigger) ─────────
  makeSideWallDoor(ROOM_OX,                  GANG_BAD_DOOR_Y,  WALL_V, 64, "door_etasje1_bad");
  makeSideWallDoor(ROOM_OX,                  GANG_YLVA_DOOR_Y, WALL_V, 64, "door_etasje1_ylva");
  makeSideWallDoor(ROOM_OX + ROOM_W - WALL_V, GANG_GATA_DOOR_Y, WALL_V, 64, "door_gata");

  // ── Top wall door trigger (Vetle) — arch is drawn by makeRoomShell ─
  makeDoorway(GANG_VETLE_GAP_X, ROOM_OY, 64, TOP_WALL_H, "door_etasje1_vetle");

  // ── Trapp opp ────────────────────────────────────────────────
  makeStairs(tileX(12), tileY(3), tileX(19), tileY(6), "up", "stairs_up");
  makeTopWall(tileX(4), tileY(7), 14 * 32, false);

  // ── Player ───────────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false, "etasje1_gang");
  setupGlobalUI();
  setupAtmosphere(player);

  // ── Door transitions ─────────────────────────────────────────
  onDoor(player, "door_etasje1_bad",   "etasje1_bad",   "etasje1_gang", fra);
  onDoor(player, "door_etasje1_ylva",  "etasje1_ylva",  "etasje1_gang", fra);
  onDoor(player, "door_etasje1_vetle", "etasje1_vetle", "etasje1_gang", fra);
  onDoor(player, "stairs_up",          "etasje2_stue",  "etasje1_gang", fra);

  // ── Ytterdør — always accessible ─────────────────────────────
  var gataReady = (fra === "gata") ? false : true;
  if (!gataReady) wait(1, function() { gataReady = true; });

  if (allRoomsSearched()) {
    wait(0.5, function() {
      say("hint_check_outside");
    });
  }

  player.onCollide("door_gata", function() {
    if (!gataReady) return;
    go("gata", { fra: "etasje1_gang" });
  });

});
