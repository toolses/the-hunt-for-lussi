const { test, expect } = require("@playwright/test");
const { waitForGameReady, goToScene, teleportPlayer, getPlayerPos, clickGameCoord } = require("../helpers/game");

test("debug faucet click attempts", async ({ page }) => {
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

  // Teleport player closer to faucet (within 64px)
  await teleportPlayer(page, 610, 362);
  await page.waitForTimeout(500);

  // Try multiple click positions around the indicator (656, 320)
  const attempts = [
    [656, 320], [656, 318], [654, 320], [658, 320],
    [656, 322], [650, 320], [660, 320], [656, 315],
    [656, 325], [652, 318], [660, 322],
  ];

  for (const [x, y] of attempts) {
    await clickGameCoord(page, x, y);
    await page.waitForTimeout(100);
    const step = await page.evaluate(() => questState.waterQuest.step);
    if (step !== "fill_water") {
      console.log(`Click at (${x}, ${y}) worked! Step: ${step}`);
      return;
    }
  }

  // If none worked, try clicking via evaluate directly
  console.log("Direct clicks failed. Trying evaluate-based interaction...");
  const result = await page.evaluate(() => {
    // Find the faucet indicator and trigger click programmatically
    var all = get("*");
    for (var i = 0; i < all.length; i++) {
      var o = all[i];
      if (o.radius === 12 && o.pos.x === 656 && Math.abs(o.pos.y - 320) < 5 && o.z === 15) {
        // Found the indicator - check if onClick handler exists
        console.log("Found indicator:", o.pos.x, o.pos.y, "opacity:", o.opacity);
        // Try triggering click
        if (o.onClick) {
          return "has onClick handler";
        }
        return "no onClick handler found";
      }
    }
    return "indicator not found";
  });
  console.log("Evaluate result:", result);

  const state = await page.evaluate(() => ({
    step: questState.waterQuest.step,
    inventory: [...inventory],
  }));
  console.log("Final state:", JSON.stringify(state));

  expect(state.step).toBe("place_bowl");
});
