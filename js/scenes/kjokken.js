// ============================================================
// SCENE: etasje2_kjokken — Kjøkken
// ============================================================

scene("etasje2_kjokken", function(args) {
  args = args || {};
  var fra      = args.fra || "";
  var spawnPos = SPAWNS["etasje2_kjokken_fra_" + fra] || SPAWNS["etasje2_kjokken_default"];

  makeRoomShell("floor_wood", [], [], [], [{ x: ARCH_DOOR_X, w: 64 }]);

  // ── Door to stue (bottom wall gap) ──────────────────────────
  makeDoorway(ARCH_DOOR_X, ARCH_DOOR_Y, 64, BOT_WALL_H, "door_etasje2_stue");

  // ── Furniture & benches ──────────────────────────────────────
  makeDeco(tileX(17), tileY(3), 32, ROOM_H - TOP_WALL_H - BOT_WALL_H, [80, 60, 40]);  // Benk langs høyre vegg
  makeSpriteDeco(tileX(1), tileY(10), "fridge",          1);
  makeSpriteDeco(tileX(2), tileY(4), "kitchen_table",          1);
  makeSpriteDeco(tileX(17), tileY(8), "kitchen_faucet",          1);

  // ── Food bowl ────────────────────────────────────────────────
  var bowlPos = vec2(tileX(6) + 8, tileY(3) + 12);
  add([text("Lussis matskål", { size: 10 }), pos(bowlPos.x, bowlPos.y - 18), anchor("center"), color(255, 245, 200), z(7)]);
  add([circle(12), pos(bowlPos), color(0, 0, 0),     anchor("center"), z(6)]);
  add([circle(10), pos(bowlPos), color(50, 100, 220), anchor("center"), z(7)]);

  // ── Player ───────────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false);

  // ── Proximity trigger: food bowl ─────────────────────────────
  var bowlMsgShown  = false;
  var bowlVoicePlayed = false;
  player.onUpdate(function() {
    if (player.pos.dist(bowlPos) < 60 && !bowlMsgShown) {
      bowlMsgShown = true;
      showMessage("Matskålen er full...\nLussi har ikke spist på lenge!", 3);
      if (!bowlVoicePlayed) {
        play("lyd_matskaal");
        bowlVoicePlayed = true;
      }
      wait(4, function() { bowlMsgShown = false; });
    }
  });

  onDoor(player, "door_etasje2_stue", "etasje2_stue", "etasje2_kjokken", fra);

});
