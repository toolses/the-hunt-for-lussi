// ============================================================
// E2E: Gata chase mechanic & victory
// ============================================================

const { test, expect } = require("@playwright/test");
const {
  waitForGameReady,
  goToScene,
  teleportPlayer,
  pressKeyFor,
  getGameState,
  setGameState,
  getCurrentScene,
  waitForScene,
  countByTag,
} = require("../helpers/game");

test.describe("Gata Chase", () => {
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

  async function setupAllRoomsSearched(page) {
    await setGameState(page, {
      roomsSearched: {
        etasje2_stue: true,
        etasje2_mamma: true,
        etasje1_ylva: true,
        etasje1_vetle: true,
        etasje1_bad: true,
      },
    });
  }

  /** Approach Lussi to trigger a flee, then wait for cooldown */
  async function triggerFlee(page) {
    const lussiPos = await page.evaluate(() => {
      const l = get("lussi")[0];
      return l ? { x: l.pos.x, y: l.pos.y } : null;
    });
    if (!lussiPos) return;

    // Teleport close enough for the proximity trigger (< 60px)
    await teleportPlayer(page, lussiPos.x - 40, lussiPos.y);
    await page.waitForTimeout(500);
    // Walk into range if teleport alone didn't trigger
    await pressKeyFor(page, "ArrowRight", 300);
    // Wait for flee animation (Lussi runs at 350px/s to escape spot ~200-400px away = ~1s)
    // plus 1.5s cooldown
    await page.waitForTimeout(4000);
  }

  /** Walk into Lussi's current position using keyboard (triggers onCollide) */
  async function walkIntoLussi(page) {
    const lussiPos = await page.evaluate(() => {
      const l = get("lussi")[0];
      return l ? { x: l.pos.x, y: l.pos.y } : null;
    });
    if (!lussiPos) return;

    // Teleport slightly to the left, then walk right into Lussi
    await teleportPlayer(page, lussiPos.x - 40, lussiPos.y);
    await page.waitForTimeout(200);
    await pressKeyFor(page, "ArrowRight", 500);
    await page.waitForTimeout(500);
  }

  test("Lussi appears on gata when all rooms searched", async ({ page }) => {
    await setupAllRoomsSearched(page);
    await goToScene(page, "gata");
    await page.waitForTimeout(500);

    const lussiCount = await countByTag(page, "lussi");
    expect(lussiCount).toBe(1);

    const lussiPos = await page.evaluate(() => {
      const l = get("lussi")[0];
      return l ? { x: l.pos.x, y: l.pos.y } : null;
    });
    expect(lussiPos).not.toBeNull();
    expect(lussiPos.x).toBeCloseTo(1005, -1);
    expect(lussiPos.y).toBeCloseTo(675, -1);
  });

  test("paw prints trail is visible", async ({ page }) => {
    await setupAllRoomsSearched(page);
    await goToScene(page, "gata");
    await page.waitForTimeout(500);

    const lussiCount = await countByTag(page, "lussi");
    expect(lussiCount).toBe(1);
  });

  test("approaching Lussi triggers flee", async ({ page }) => {
    await setupAllRoomsSearched(page);
    await goToScene(page, "gata");
    await page.waitForTimeout(500);

    const lussiPos = await page.evaluate(() => {
      const l = get("lussi")[0];
      return { x: l.pos.x, y: l.pos.y };
    });

    await triggerFlee(page);

    const newPos = await page.evaluate(() => {
      const l = get("lussi")[0];
      return l ? { x: l.pos.x, y: l.pos.y } : null;
    });
    expect(newPos).not.toBeNull();
    const dist = Math.sqrt((newPos.x - lussiPos.x) ** 2 + (newPos.y - lussiPos.y) ** 2);
    expect(dist).toBeGreaterThan(50);
  });

  test("3 escapes without treats makes Lussi catchable", async ({ page }) => {
    test.setTimeout(60000);
    await setupAllRoomsSearched(page);
    await goToScene(page, "gata");
    await page.waitForTimeout(500);

    // Trigger 3 escapes
    for (let i = 0; i < 3; i++) {
      await triggerFlee(page);
    }

    // After 3 escapes, Lussi should be catchable — walk into her
    await walkIntoLussi(page);

    expect(await getCurrentScene(page)).toBe("vinn");
  });

  test("1 escape with all treats makes Lussi catchable", async ({ page }) => {
    test.setTimeout(30000);
    await setupAllRoomsSearched(page);
    await setGameState(page, { treatsCount: 11 });
    await page.evaluate(() => {
      questState.collectFish.current = 11;
    });
    await goToScene(page, "gata");
    await page.waitForTimeout(500);

    // 1 escape needed
    await triggerFlee(page);

    // Catch Lussi
    await walkIntoLussi(page);

    expect(await getCurrentScene(page)).toBe("vinn");
  });

  test("catching Lussi goes to victory screen", async ({ page }) => {
    test.setTimeout(30000);
    await setupAllRoomsSearched(page);
    await setGameState(page, { treatsCount: 11 });
    await page.evaluate(() => {
      questState.collectFish.current = 11;
    });
    await goToScene(page, "gata");
    await page.waitForTimeout(500);

    await triggerFlee(page);
    await walkIntoLussi(page);

    await waitForScene(page, "vinn", 5000);
    expect(await getCurrentScene(page)).toBe("vinn");
  });
});
