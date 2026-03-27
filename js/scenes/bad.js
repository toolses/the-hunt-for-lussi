// ============================================================
// SCENE: etasje1_bad — Baderom
// ============================================================

scene("etasje1_bad", function(args) {
  args = args || {};
  var fra      = args.fra || "";
  var spawnPos = SPAWNS["etasje1_bad_fra_" + fra] || SPAWNS["etasje1_bad_default"];

  makeRoomShell("floor_bath", [], [], [{ y: BAD_GANG_DOOR_Y, h: 64 }]);

  // ── Door to gang (right side wall) ──────────────────────────
  makeSideWallDoor(ROOM_OX + ROOM_W - WALL_V, BAD_GANG_DOOR_Y, WALL_V, 64, "door_etasje1_gang");

  // ── Furniture ────────────────────────────────────────────────
  makeSpriteDeco(tileX(1),  tileY(3), "bathtub",        1);
  makeSpriteDeco(tileX(14), tileY(3), "sink",           1);
  makeSpriteDeco(tileX(14), tileY(8), "toilet",         1);
  makeSpriteDeco(tileX(1),  tileY(8), "washer",         1);

  // ── Player ───────────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false);

  // ── Lussi hides behind the bathtub ───────────────────────────
  addRoomLussi("etasje1_bad",
    { x: tileX(2), y: tileY(3) + 48 },
    { x: tileX(2), y: tileY(3) - 8 },
    { x: ROOM_OX + ROOM_W, y: BAD_GANG_DOOR_Y + 32 },
    player);

  onDoor(player, "door_etasje1_gang", "etasje1_gang", "etasje1_bad", fra);

});
