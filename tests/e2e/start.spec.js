// ============================================================
// E2E: Start screen & character selection
// ============================================================

const { test, expect } = require("@playwright/test");
const {
  initGame,
  waitForGameReady,
  getCurrentScene,
  getGameState,
  clickGameCoord,
  waitForScene,
} = require("../helpers/game");

test.describe("Start Screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForGameReady(page);
  });

  test("loads on the start scene", async ({ page }) => {
    const scene = await getCurrentScene(page);
    expect(scene).toBe("start");
  });

  test("selecting Ylva starts the game in kitchen", async ({ page }) => {
    // Ylva button: center().add(-215, 100) = (185, 400)
    await clickGameCoord(page, 185, 400);
    await waitForScene(page, "etasje2_kjokken");

    const state = await getGameState(page);
    expect(state.selectedCharacter).toBe("ylva");
    expect(state.scene).toBe("etasje2_kjokken");
  });

  test("selecting Vetle starts the game in kitchen", async ({ page }) => {
    // Vetle button: center().add(0, 100) = (400, 400)
    await clickGameCoord(page, 400, 400);
    await waitForScene(page, "etasje2_kjokken");

    const state = await getGameState(page);
    expect(state.selectedCharacter).toBe("vetle");
    expect(state.scene).toBe("etasje2_kjokken");
  });

  test("game state is reset on start", async ({ page }) => {
    // Dirty the state first
    await page.evaluate(() => {
      treatsCount = 5;
      roomsSearched.etasje2_stue = true;
      questState.waterQuest.step = "done";
      inventory.push("full_vannskaal");
    });

    // Start the game
    await clickGameCoord(page, 185, 400);
    await waitForScene(page, "etasje2_kjokken");

    const state = await getGameState(page);
    expect(state.treatsCount).toBe(0);
    expect(state.roomsSearched.etasje2_stue).toBe(false);
    expect(state.questState.waterQuest.step).toBe("find_bowl");
    expect(state.inventory).toEqual([]);
  });
});
