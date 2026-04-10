// ============================================================
// SCENE: etasje1_ylva — Ylva sitt soverom
// ============================================================

scene("etasje1_ylva", function(args) {
  args = args || {};
  var fra      = args.fra || "";
  var spawnPos = SPAWNS["etasje1_ylva_fra_" + fra] || SPAWNS["etasje1_ylva_default"];

  makeRoomShell("floor_wood", [], [], [{ y: YLVA_GANG_DOOR_Y, h: 64 }]);

  // ── Door to gang (right side wall) ──────────────────────────
  makeSideWallDoor(ROOM_OX + ROOM_W - WALL_V, YLVA_GANG_DOOR_Y, WALL_V, 64, "door_etasje1_gang");

  // ── Furniture ────────────────────────────────────────────────
  makeSpriteDeco(tileX(13), tileY(3), "bed_single",  1);
  makeSpriteDeco(tileX(1),  tileY(3), "cabinet",     1);
  makeSpriteDeco(tileX(3),  tileY(3), "drawer",      1);
  makeSpriteDeco(tileX(8),  tileY(3), "living_drawer", 1);

  // ── Player ───────────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false, "etasje1_ylva");
  setupGlobalUI();

  // ── Godbiter (treats) ────────────────────────────────────────
  addTreat(5,  9,  "ylva");
  addTreat(15, 8,  "ylva");
  addTreat(11, 6,  "ylva");

  // ── Lussi hides behind the bookshelf ────────────────────────
  addRoomLussi("etasje1_ylva",
    { x: tileX(9),  y: tileY(3) + 40 },
    { x: tileX(9),  y: tileY(3) - 8 },
    { x: ROOM_OX + ROOM_W, y: YLVA_GANG_DOOR_Y + 32 },
    player);

  wait(2, function() { say("enter_ylva"); });

  onDoor(player, "door_etasje1_gang", "etasje1_gang", "etasje1_ylva", fra);

});
