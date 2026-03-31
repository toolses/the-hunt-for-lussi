// ============================================================
// E2E: Scene navigation — all door/stair transitions
// ============================================================

const { test, expect } = require("@playwright/test");
const {
  initGame,
  waitForGameReady,
  getCurrentScene,
  goToScene,
  teleportPlayer,
  movePlayerTo,
  pressKeyFor,
  waitForScene,
  setGameState,
  startGameAs,
} = require("../helpers/game");

// Start each test with a fresh game (Ylva) and skip to the target scene
test.describe("Scene Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForGameReady(page);
    // Initialize game state without going through start screen
    await page.evaluate(() => {
      selectedCharacter = "ylva";
      resetRoomsSearched();
      resetTreats();
      resetQuests();
    });
  });

  test("Kitchen → Stue (arch door)", async ({ page }) => {
    await goToScene(page, "etasje2_kjokken");
    // Arch door is at ARCH_DOOR_X=352, ARCH_DOOR_Y=492
    await teleportPlayer(page, 384, 480);
    await movePlayerTo(page, 384, 510);
    await waitForScene(page, "etasje2_stue", 5000);
    expect(await getCurrentScene(page)).toBe("etasje2_stue");
  });

  test("Stue → Kitchen (top-left gap)", async ({ page }) => {
    await goToScene(page, "etasje2_stue", { fra: "etasje2_kjokken" });
    // Kjøkken gap is at STUE_KJK_GAP_X=160, top wall area ~y=76+96=172
    await teleportPlayer(page, 192, 190);
    await movePlayerTo(page, 192, 150);
    await waitForScene(page, "etasje2_kjokken", 5000);
    expect(await getCurrentScene(page)).toBe("etasje2_kjokken");
  });

  test("Stue → Mamma (top-right gap)", async ({ page }) => {
    await goToScene(page, "etasje2_stue", { fra: "" });
    // Mamma gap at STUE_MAMMA_GAP_X=512
    await teleportPlayer(page, 544, 190);
    await movePlayerTo(page, 544, 150);
    await waitForScene(page, "etasje2_mamma", 5000);
    expect(await getCurrentScene(page)).toBe("etasje2_mamma");
  });

  test("Mamma → Stue (arch door)", async ({ page }) => {
    await goToScene(page, "etasje2_mamma");
    // Arch doorway at (352, 492), 64x32. Walk into it from above.
    await teleportPlayer(page, 384, 470);
    await movePlayerTo(page, 384, 510);
    await waitForScene(page, "etasje2_stue", 5000);
    expect(await getCurrentScene(page)).toBe("etasje2_stue");
  });

  test("Stue → Gang (stairs down)", async ({ page }) => {
    await goToScene(page, "etasje2_stue", { fra: "" });
    // Stairs: makeStairs(480, 236, 704, 332) — center ~(592, 284)
    await teleportPlayer(page, 560, 280);
    await movePlayerTo(page, 592, 284);
    await waitForScene(page, "etasje1_gang", 8000);
    expect(await getCurrentScene(page)).toBe("etasje1_gang");
  });

  test("Gang → Stue (stairs up)", async ({ page }) => {
    await goToScene(page, "etasje1_gang", { fra: "" });
    // Stairs: makeStairs(480, 172, 704, 268) — center ~(592, 220)
    await teleportPlayer(page, 560, 220);
    await movePlayerTo(page, 592, 220);
    await waitForScene(page, "etasje2_stue", 8000);
    expect(await getCurrentScene(page)).toBe("etasje2_stue");
  });

  test("Gang → Ylva (left wall door)", async ({ page }) => {
    await goToScene(page, "etasje1_gang", { fra: "" });
    // GANG_YLVA_DOOR_Y = tileY(6) = 268. Left wall at x=96
    await teleportPlayer(page, 120, 300);
    await movePlayerTo(page, 85, 300);
    await waitForScene(page, "etasje1_ylva", 5000);
    expect(await getCurrentScene(page)).toBe("etasje1_ylva");
  });

  test("Ylva → Gang (right wall door)", async ({ page }) => {
    await goToScene(page, "etasje1_ylva", { fra: "" });
    // YLVA_GANG_DOOR_Y = tileY(7) = 300. Right wall at x=96+608-32=672
    await teleportPlayer(page, 660, 332);
    await movePlayerTo(page, 700, 332);
    await waitForScene(page, "etasje1_gang", 5000);
    expect(await getCurrentScene(page)).toBe("etasje1_gang");
  });

  test("Gang → Vetle (top wall gap)", async ({ page }) => {
    await goToScene(page, "etasje1_gang", { fra: "" });
    // GANG_VETLE_GAP_X = tileX(4) = 224
    await teleportPlayer(page, 256, 190);
    await movePlayerTo(page, 256, 150);
    await waitForScene(page, "etasje1_vetle", 5000);
    expect(await getCurrentScene(page)).toBe("etasje1_vetle");
  });

  test("Vetle → Gang (arch door)", async ({ page }) => {
    await goToScene(page, "etasje1_vetle", { fra: "" });
    await teleportPlayer(page, 384, 480);
    await movePlayerTo(page, 384, 510);
    await waitForScene(page, "etasje1_gang", 5000);
    expect(await getCurrentScene(page)).toBe("etasje1_gang");
  });

  test("Gang → Bad (left wall door)", async ({ page }) => {
    await goToScene(page, "etasje1_gang", { fra: "" });
    // GANG_BAD_DOOR_Y = tileY(2) = 140. Left wall
    await teleportPlayer(page, 120, 172);
    await movePlayerTo(page, 85, 172);
    await waitForScene(page, "etasje1_bad", 5000);
    expect(await getCurrentScene(page)).toBe("etasje1_bad");
  });

  test("Bad → Gang (right wall door)", async ({ page }) => {
    await goToScene(page, "etasje1_bad", { fra: "" });
    // BAD_GANG_DOOR_Y = tileY(9) = 364
    await teleportPlayer(page, 660, 396);
    await movePlayerTo(page, 700, 396);
    await waitForScene(page, "etasje1_gang", 5000);
    expect(await getCurrentScene(page)).toBe("etasje1_gang");
  });

  test("Gang → Gata (right wall door)", async ({ page }) => {
    await goToScene(page, "etasje1_gang", { fra: "" });
    // GANG_GATA_DOOR_Y = tileY(10) = 396
    await teleportPlayer(page, 660, 428);
    await movePlayerTo(page, 700, 428);
    await waitForScene(page, "gata", 5000);
    expect(await getCurrentScene(page)).toBe("gata");
  });

  test("Gata → Gang (house1 door)", async ({ page }) => {
    await goToScene(page, "gata");
    // Door trigger at pos(160, 300) rect(70,75)
    await teleportPlayer(page, 195, 350);
    await movePlayerTo(page, 195, 310);
    await waitForScene(page, "etasje1_gang", 5000);
    expect(await getCurrentScene(page)).toBe("etasje1_gang");
  });

  test("door cooldown prevents bounce-back", async ({ page }) => {
    // Go to stue from kjokken — should not immediately bounce back
    await goToScene(page, "etasje2_stue", { fra: "etasje2_kjokken" });
    const scene = await getCurrentScene(page);
    expect(scene).toBe("etasje2_stue");

    // Player spawns near the kjokken gap — verify we stay in stue
    await page.waitForTimeout(500);
    expect(await getCurrentScene(page)).toBe("etasje2_stue");
  });
});
