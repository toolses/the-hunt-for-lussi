const { test, expect } = require("@playwright/test");
const { waitForGameReady, goToScene, teleportPlayer, getCanvasBounds, clickGameCoord } = require("../helpers/game");

test("debug click coordinate mapping", async ({ page }) => {
  test.setTimeout(30000);
  await page.goto("/");
  await waitForGameReady(page);
  await page.evaluate(() => {
    selectedCharacter = "ylva";
    resetRoomsSearched();
    resetTreats();
    resetQuests();
    questState.waterQuest.step = "fill_water";
    inventory.push("tom_vannskaal");
  });
  await goToScene(page, "etasje2_kjokken");

  // Get canvas info
  const bounds = await getCanvasBounds(page);
  console.log("Canvas bounds:", JSON.stringify(bounds));

  const viewportSize = await page.viewportSize();
  console.log("Viewport:", JSON.stringify(viewportSize));

  // Get the internal game resolution and camera
  const gameInfo = await page.evaluate(() => ({
    width: width(),
    height: height(),
    camPosX: camPos().x,
    camPosY: camPos().y,
  }));
  console.log("Game info:", JSON.stringify(gameInfo));

  // Teleport player near faucet
  await teleportPlayer(page, 610, 362);
  await page.waitForTimeout(300);

  // Test: click at a known position and check what Kaplay receives
  // Add a click listener to check what mouse position Kaplay sees
  await page.evaluate(() => {
    window._lastClickPos = null;
    onMousePress(function() {
      window._lastClickPos = { screen: mousePos(), world: toWorld(mousePos()) };
    });
  });

  // Click at game coord (656, 320) — the indicator position
  await clickGameCoord(page, 656, 320);
  await page.waitForTimeout(200);

  const clickInfo = await page.evaluate(() => window._lastClickPos);
  console.log("Click received at:", JSON.stringify(clickInfo));

  // Now click at game coord (432, 160) — the cupboard indicator position (this one works)
  await clickGameCoord(page, 432, 160);
  await page.waitForTimeout(200);

  const clickInfo2 = await page.evaluate(() => window._lastClickPos);
  console.log("Click at cupboard indicator:", JSON.stringify(clickInfo2));

  // Compare: what the indicator itself thinks about clicks
  const indicatorCheck = await page.evaluate(() => {
    // Find faucet indicator
    var all = get("*");
    for (var i = 0; i < all.length; i++) {
      var o = all[i];
      if (o.radius === 12 && o.z === 15 && o.pos.x > 650 && o.pos.x < 660) {
        return {
          pos: { x: o.pos.x, y: o.pos.y },
          opacity: o.opacity,
          width: o.width,
          height: o.height,
          hasOnClick: typeof o.onClick === "function",
        };
      }
    }
    return "not found";
  });
  console.log("Faucet indicator:", JSON.stringify(indicatorCheck));
});
