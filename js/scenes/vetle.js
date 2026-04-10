// ============================================================
// SCENE: etasje1_vetle — Vetle sitt soverom
// ============================================================

scene("etasje1_vetle", function(args) {
  args = args || {};
  var fra      = args.fra || "";
  var spawnPos = SPAWNS["etasje1_vetle_fra_" + fra] || SPAWNS["etasje1_vetle_default"];

  makeRoomShell("floor_wood", [], [], [], [{ x: ARCH_DOOR_X, w: 64 }]);

  // ── Door to gang (bottom wall gap) ──────────────────────────
  makeDoorway(ARCH_DOOR_X, ARCH_DOOR_Y, 64, BOT_WALL_H, "door_etasje1_gang");

  // ── Furniture ────────────────────────────────────────────────
  makeSpriteDeco(tileX(14), tileY(3), "bed_single",  1);
  makeSpriteDeco(tileX(1),  tileY(3), "drawer",      1);
  makeSpriteDeco(tileX(1),  tileY(9), "playmat",     1);
  makeSpriteDeco(tileX(8),  tileY(3), "cabinet",     1);

  // ── Player ───────────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false, "etasje1_vetle");
  setupGlobalUI();

  // ── Godbiter (treats) ────────────────────────────────────────
  addTreat(4,  7,  "vetle");
  addTreat(12, 7,  "vetle");
  addTreat(16, 10, "vetle");

  // ── Lussi hides behind the wardrobe ─────────────────────────
  addRoomLussi("etasje1_vetle",
    { x: tileX(8) + 16, y: tileY(3) + 40 },
    { x: tileX(8) + 16, y: tileY(3) - 8 },
    { x: ARCH_DOOR_X + 48, y: ARCH_DOOR_Y + 32 },
    player);

  wait(2, function() { say("enter_vetle"); });

  onDoor(player, "door_etasje1_gang", "etasje1_gang", "etasje1_vetle", fra);

});
