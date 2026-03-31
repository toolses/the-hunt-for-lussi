const { test, expect } = require("@playwright/test");
const { waitForGameReady, goToScene, teleportPlayer, getPlayerPos, clickGameCoord } = require("../helpers/game");

test("debug faucet interaction", async ({ page }) => {
  test.setTimeout(30000);
  await page.goto("/");
  await waitForGameReady(page);
  await page.evaluate(() => {
    selectedCharacter = "ylva";
    resetRoomsSearched();
    resetTreats();
    resetQuests();
    // Set quest to fill_water step
    questState.waterQuest.step = "fill_water";
    inventory.push("tom_vannskaal");
  });
  await goToScene(page, "etasje2_kjokken");

  // Find faucet object position
  const faucetInfo = await page.evaluate(() => {
    var all = get("*");
    var faucet = null;
    for (var i = 0; i < all.length; i++) {
      var o = all[i];
      if (o.sprite && o.sprite === "kitchen_faucet") {
        faucet = { x: o.pos.x, y: o.pos.y };
      }
    }
    // Also find all circle objects (potential indicators)
    var circles = [];
    for (var i = 0; i < all.length; i++) {
      var o = all[i];
      if (o.radius !== undefined) {
        circles.push({ x: o.pos.x, y: o.pos.y, r: o.radius, opacity: o.opacity, z: o.z });
      }
    }
    return { faucet: faucet, circles: circles, step: questState.waterQuest.step };
  });
  console.log("Faucet info:", JSON.stringify(faucetInfo));

  // Teleport player close
  await teleportPlayer(page, 610, 362);
  await page.waitForTimeout(500);

  let pos = await getPlayerPos(page);
  console.log("Player pos:", JSON.stringify(pos));

  // Check player distance to faucet
  const dist = await page.evaluate(() => {
    var p = get("player")[0];
    // Find objects near the faucet area
    var all = get("*");
    var results = [];
    for (var i = 0; i < all.length; i++) {
      var o = all[i];
      if (o.pos && o.pos.x >= 630 && o.pos.x <= 670 && o.pos.y >= 310 && o.pos.y <= 345) {
        results.push({
          x: o.pos.x, y: o.pos.y,
          w: o.width, h: o.height,
          hasArea: !!o.c.area,
          opacity: o.opacity,
          z: o.z,
          tags: o.tags || []
        });
      }
    }
    return { playerPos: p ? {x: p.pos.x, y: p.pos.y} : null, nearFaucet: results };
  });
  console.log("Objects near faucet:", JSON.stringify(dist));

  // Try clicking the indicator
  await clickGameCoord(page, 656, 320);
  await page.waitForTimeout(500);

  const state = await page.evaluate(() => ({
    step: questState.waterQuest.step,
    inventory: [...inventory],
  }));
  console.log("After click:", JSON.stringify(state));
});
