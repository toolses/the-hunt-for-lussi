// ============================================================
// SCENE: etasje2_stue — Stue + korridor + trappehus (2. etasje hub)
// Connections: Kjøkken (top wall left), Mamma (top wall right), trapp ned
// ============================================================

scene("etasje2_stue", function(args) {
  args = args || {};
  var fra      = args.fra || "";
  var spawnPos = SPAWNS["etasje2_stue_fra_" + fra] || SPAWNS["etasje2_stue_default"];

  // Two top-wall gaps: Kjøkken (cols 2–4) and Mamma (cols 13–15)
  makeRoomShell("floor_wood", [
    { x: STUE_KJK_GAP_X,   w: 64 },
    { x: STUE_MAMMA_GAP_X, w: 64 },
  ]);

  // ── Trappehus — internal wall at row 8, open left at col 10 ─
  makeTopWall(tileX(10), tileY(8), 8 * 32, false);
  makeWall(tileX(12), tileY(13) - 8, ROOM_W - 12 * 32, 8);

  // ── Top wall door triggers (arches drawn by makeRoomShell) ───
  makeDoorway(STUE_KJK_GAP_X,   ROOM_OY, 64, TOP_WALL_H, "door_etasje2_kjokken");
  makeDoorway(STUE_MAMMA_GAP_X, ROOM_OY, 64, TOP_WALL_H, "door_etasje2_mamma");

  // ── Trapp ned ────────────────────────────────────────────────
  makeStairs(tileX(12), tileY(5), tileX(19), tileY(8), "down", "stairs_down");

  // ── Furniture ────────────────────────────────────────────────
  makeSpriteDeco(tileX(7), tileY(0),  "fireplace",     1);
  makeSpriteDeco(tileX(10), tileY(8), "living_drawer", 1);
  makeSpriteDeco(tileX(2), tileY(10),  "coffee_table",  1);
  makeSpriteDeco(tileX(13), tileY(11),  "kitchen_table", 1);

  // ── Player ───────────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false, "etasje2_stue");
  setupGlobalUI();

  // ── Godbiter (treats) ────────────────────────────────────────
  addTreat(4,  5,  "stue");  // upper half, left area
  addTreat(4,  10, "stue");  // lower half, away from coffee table
  addTreat(9,  11, "stue");  // lower center

  // ── Lussi hides under the dining table ──────────────────────
  addRoomLussi("etasje2_stue",
    { x: tileX(3),  y: tileY(11) },
    { x: tileX(3),  y: tileY(10) },
    function() {
      // If Mamma's room is already searched, Lussi flees to the stairs instead
      return roomsSearched["etasje2_mamma"]
        ? { x: tileX(15), y: tileY(6) }
        : { x: STUE_MAMMA_GAP_X + 48, y: ROOM_OY };
    },
    player);

  onDoor(player, "door_etasje2_mamma",  "etasje2_mamma",  "etasje2_stue", fra);
  onDoor(player, "door_etasje2_kjokken","etasje2_kjokken","etasje2_stue", fra);
  onDoor(player, "stairs_down",          "etasje1_gang",   "etasje2_stue", fra);

});
