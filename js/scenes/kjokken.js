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
  makeSpriteDeco(tileX(2), tileY(4), "kitchen_table",    1);
  var cupboardObj = makeSpriteDeco(tileX(10), tileY(3), "cupboard",       1);
  var faucetObj   = makeSpriteDeco(tileX(17), tileY(8), "kitchen_faucet", 1);

  // ── Food bowl (static decoration) ──────────────────────────
  var bowlPos = vec2(tileX(6) + 8, tileY(3) + 12);
  add([text("Lussis matskål", { size: 10 }), pos(bowlPos.x, bowlPos.y - 18), anchor("center"), color(255, 245, 200), z(7)]);
  add([circle(12), pos(bowlPos), color(0, 0, 0),     anchor("center"), z(6)]);
  add([circle(10), pos(bowlPos), color(140, 100, 50), anchor("center"), z(7)]);

  // ── Water bowl spot (next to food bowl) ────────────────────
  var waterSpot = vec2(bowlPos.x + 32, bowlPos.y);
  var waterSpotObj = add([pos(waterSpot)]);

  // Draw permanent water bowl if quest is already done
  if (questState.waterQuest.step === "done") {
    add([circle(12), pos(waterSpot), color(0, 0, 0),     anchor("center"), z(6)]);
    add([circle(10), pos(waterSpot), color(80, 170, 240), anchor("center"), z(7)]);
    add([text("💧", { size: 10 }), pos(waterSpot.x, waterSpot.y - 18), anchor("center"), z(7)]);
  }

  // ── Player ───────────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false, "etasje2_kjokken");
  setupGlobalUI();
  setupAtmosphere(player);

  // ── Interaction 1: Cupboard → find empty bowl ─────────────
  addInteraction(cupboardObj, function() {
    return questState.waterQuest.step === "find_bowl";
  }, function() {
    inventory.push("tom_vannskaal");
    questState.waterQuest.step = "fill_water";
    say("water_bowl_found");
    saveGame();
  });

  // ── Interaction 2: Faucet → fill with water ───────────────
  addInteraction(faucetObj, function() {
    return questState.waterQuest.step === "fill_water";
  }, function() {
    var idx = inventory.indexOf("tom_vannskaal");
    if (idx > -1) inventory.splice(idx, 1);
    inventory.push("full_vannskaal");
    questState.waterQuest.step = "place_bowl";
    say("water_bowl_filled");
    saveGame();
  });

  // ── Interaction 3: Floor spot → place water bowl ──────────
  addInteraction(waterSpotObj, function() {
    return questState.waterQuest.step === "place_bowl";
  }, function() {
    var idx = inventory.indexOf("full_vannskaal");
    if (idx > -1) inventory.splice(idx, 1);
    questState.waterQuest.step = "done";
    // Draw permanent water bowl
    add([circle(12), pos(waterSpot), color(0, 0, 0),     anchor("center"), z(6)]);
    add([circle(10), pos(waterSpot), color(80, 170, 240), anchor("center"), z(7)]);
    add([text("💧", { size: 10 }), pos(waterSpot.x, waterSpot.y - 18), anchor("center"), z(7)]);
    say("water_bowl_done");
    saveGame();
  });

  onDoor(player, "door_etasje2_stue", "etasje2_stue", "etasje2_kjokken", fra);

});
