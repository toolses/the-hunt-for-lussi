// ============================================================
// E2E: Treat collection & persistence
// ============================================================

const { test, expect } = require("@playwright/test");
const {
  waitForGameReady,
  goToScene,
  teleportPlayer,
  movePlayerTo,
  pressKeyFor,
  getGameState,
  waitForScene,
  countByTag,
} = require("../helpers/game");

/**
 * Walk the player through a treat at (col, row) to pick it up.
 * Teleport to the left, then walk right through the treat position.
 */
async function collectTreat(page, col, row) {
  const tx = 96 + col * 32 + 16;
  const ty = 76 + row * 32 + 16;
  // Teleport well to the left of the treat, then walk right through it
  await teleportPlayer(page, tx - 50, ty);
  await page.waitForTimeout(100);
  await pressKeyFor(page, "ArrowRight", 600);
  await page.waitForTimeout(200);
}

test.describe("Treat Collection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForGameReady(page);
    await page.evaluate(() => {
      selectedCharacter = "ylva";
      resetRoomsSearched();
      resetTreats();
      resetQuests();
    });
  });

  test("collecting a treat increments treatsCount", async ({ page }) => {
    await goToScene(page, "etasje1_ylva");

    const treatCount = await countByTag(page, "treat");
    expect(treatCount).toBe(3);

    // Treat at tile (5, 9)
    await collectTreat(page, 5, 9);

    const state = await getGameState(page);
    expect(state.treatsCount).toBeGreaterThanOrEqual(1);
  });

  test("treats persist across scene transitions", async ({ page }) => {
    await goToScene(page, "etasje1_ylva");
    await collectTreat(page, 5, 9);

    const stateAfterCollect = await getGameState(page);
    const countAfter = stateAfterCollect.treatsCount;
    expect(countAfter).toBeGreaterThanOrEqual(1);

    // Leave to gang and come back
    await goToScene(page, "etasje1_gang");
    await page.waitForTimeout(300);
    await goToScene(page, "etasje1_ylva");
    await page.waitForTimeout(500);

    const stateAfterReturn = await getGameState(page);
    expect(stateAfterReturn.treatsCount).toBe(countAfter);

    const newTreatCount = await countByTag(page, "treat");
    expect(newTreatCount).toBeLessThan(3);
  });

  test("quest fish counter updates", async ({ page }) => {
    await goToScene(page, "etasje1_ylva");
    await collectTreat(page, 5, 9);

    const state = await getGameState(page);
    expect(state.questState.collectFish.current).toBe(state.treatsCount);
  });

  test("all 11 treats can be collected across rooms", async ({ page }) => {
    test.setTimeout(60000);

    const treatLocations = [
      { scene: "etasje1_ylva", treats: [[5, 9], [15, 8], [11, 6]] },
      { scene: "etasje1_vetle", treats: [[4, 7], [12, 7], [16, 10]] },
      { scene: "etasje2_stue", treats: [[4, 5], [4, 10], [9, 11]] },
      { scene: "etasje2_mamma", treats: [[6, 7], [15, 9]] },
    ];

    for (const room of treatLocations) {
      await goToScene(page, room.scene);
      for (const [col, row] of room.treats) {
        await collectTreat(page, col, row);
      }
    }

    const state = await getGameState(page);
    expect(state.treatsCount).toBe(11);
    expect(state.questState.collectFish.current).toBe(11);
  });
});
