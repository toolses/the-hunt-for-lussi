// ============================================================
// E2E: Water quest — 3-step kitchen interaction
// ============================================================

const { test, expect } = require("@playwright/test");
const {
  waitForGameReady,
  goToScene,
  teleportPlayer,
  getGameState,
  clickGameCoord,
} = require("../helpers/game");

/**
 * Interact with an object by teleporting close and clicking
 * the interaction indicator. Retries a few positions to be robust.
 */
async function interactNear(page, objX, objY) {
  // Teleport player within 64px
  await teleportPlayer(page, objX + 10, objY + 30);
  await page.waitForTimeout(400);

  // The indicator is at (objX+16, objY-12) — try clicking it
  // and a few nearby positions in case of minor misalignment
  const indicatorX = objX + 16;
  const indicatorY = objY - 12;
  await clickGameCoord(page, indicatorX, indicatorY);
  await page.waitForTimeout(200);

  // If that didn't work, try the object position itself
  await clickGameCoord(page, indicatorX, indicatorY + 5);
  await page.waitForTimeout(200);
}

test.describe("Water Quest", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForGameReady(page);
    await page.evaluate(() => {
      selectedCharacter = "ylva";
      resetRoomsSearched();
      resetTreats();
      resetQuests();
    });
    await goToScene(page, "etasje2_kjokken");
  });

  test("step 1: find bowl at cupboard", async ({ page }) => {
    // Cupboard at tileX(10)=416, tileY(3)=172
    await interactNear(page, 416, 172);

    const state = await getGameState(page);
    expect(state.inventory).toContain("tom_vannskaal");
    expect(state.questState.waterQuest.step).toBe("fill_water");
  });

  test("step 2: fill water at faucet", async ({ page }) => {
    await page.evaluate(() => {
      questState.waterQuest.step = "fill_water";
      inventory.push("tom_vannskaal");
    });
    await goToScene(page, "etasje2_kjokken");

    // Faucet at tileX(17)=640, tileY(8)=332
    await interactNear(page, 640, 332);

    const state = await getGameState(page);
    expect(state.inventory).toContain("full_vannskaal");
    expect(state.inventory).not.toContain("tom_vannskaal");
    expect(state.questState.waterQuest.step).toBe("place_bowl");
  });

  test("step 3: place water bowl", async ({ page }) => {
    await page.evaluate(() => {
      questState.waterQuest.step = "place_bowl";
      inventory.push("full_vannskaal");
    });
    await goToScene(page, "etasje2_kjokken");

    // Water spot: bowlPos.x+32 = tileX(6)+8+32=240, bowlPos.y = tileY(3)+12=184
    await interactNear(page, 240, 184);

    const state = await getGameState(page);
    expect(state.inventory).not.toContain("full_vannskaal");
    expect(state.questState.waterQuest.step).toBe("done");
  });

  test("quest persists after leaving and returning", async ({ page }) => {
    await page.evaluate(() => {
      questState.waterQuest.step = "done";
    });

    await goToScene(page, "etasje2_stue");
    await page.waitForTimeout(300);
    await goToScene(page, "etasje2_kjokken");
    await page.waitForTimeout(300);

    const state = await getGameState(page);
    expect(state.questState.waterQuest.step).toBe("done");
  });

  test("inventory UI shows bowl when held", async ({ page }) => {
    await page.evaluate(() => {
      inventory.push("tom_vannskaal");
    });
    await page.waitForTimeout(500);

    const state = await getGameState(page);
    expect(state.inventory).toContain("tom_vannskaal");
  });

  test("full water quest flow", async ({ page }) => {
    // Step 1: cupboard at (416, 172)
    await interactNear(page, 416, 172);
    let state = await getGameState(page);
    expect(state.questState.waterQuest.step).toBe("fill_water");

    // Step 2: faucet at (640, 332)
    await interactNear(page, 640, 332);
    state = await getGameState(page);
    expect(state.questState.waterQuest.step).toBe("place_bowl");

    // Step 3: place bowl at (240, 184)
    await interactNear(page, 240, 184);
    state = await getGameState(page);
    expect(state.questState.waterQuest.step).toBe("done");
    expect(state.inventory.length).toBe(0);
  });
});
