// ============================================================
// SCENE: etasje2_mamma — Mamma sitt soverom
// ============================================================

scene("etasje2_mamma", function(args) {
  args = args || {};
  var fra      = args.fra || "";
  var spawnPos = SPAWNS["etasje2_mamma_fra_" + fra] || SPAWNS["etasje2_mamma_default"];

  makeRoomShell("floor_wood", [], [], [], [{ x: ARCH_DOOR_X, w: 64 }]);

  // ── Door to stue (bottom wall gap) ──────────────────────────
  makeDoorway(ARCH_DOOR_X, ARCH_DOOR_Y, 64, BOT_WALL_H, "door_etasje2_stue");

  // ── Furniture ────────────────────────────────────────────────
  makeSpriteDeco(tileX(12), tileY(3), "bed_queen",  1);
  makeSpriteDeco(tileX(1),  tileY(3), "drawer",     1);
  makeSpriteDeco(tileX(1),  tileY(8), "cabinet",    1);

  // ── Player ───────────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false);
  setupGlobalUI();

  // ── Godbiter (treats) ────────────────────────────────────────
  addTreat(6,  7,  "mamma");  // center of room
  addTreat(15, 9,  "mamma");  // lower right

  // ── Lussi hides under the bed ────────────────────────────────
  addRoomLussi("etasje2_mamma",
    { x: tileX(13), y: tileY(3) + 48 },
    { x: tileX(13), y: tileY(3) - 8 },
    { x: ARCH_DOOR_X + 48, y: ARCH_DOOR_Y + 32 },
    player);

  onDoor(player, "door_etasje2_stue", "etasje2_stue", "etasje2_mamma", fra);

});
