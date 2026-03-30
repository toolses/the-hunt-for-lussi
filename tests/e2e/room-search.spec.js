// ============================================================
// E2E: Room search quest — Lussi encounters in all 5 rooms
// ============================================================

const { test, expect } = require("@playwright/test");
const {
  waitForGameReady,
  goToScene,
  teleportPlayer,
  getGameState,
  setGameState,
  countByTag,
} = require("../helpers/game");

test.describe("Room Search Quest", () => {
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

  // Lussi hide positions per room (from scene files)
  const roomLussiPositions = {
    etasje2_stue: { x: 400, y: 300 },   // under dining table area
    etasje2_mamma: { x: 300, y: 300 },   // under bed
    etasje1_ylva: { x: 300, y: 280 },    // behind bookshelf
    etasje1_vetle: { x: 300, y: 280 },   // behind wardrobe
    etasje1_bad: { x: 300, y: 280 },     // behind bathtub
  };

  test("Lussi triggers in stue", async ({ page }) => {
    await goToScene(page, "etasje2_stue");
    const lussiCount = await countByTag(page, "roomLussi");
    expect(lussiCount).toBe(1);

    // Get Lussi's actual position and walk toward it
    const lussiPos = await page.evaluate(() => {
      const l = get("roomLussi")[0];
      return l ? { x: l.pos.x, y: l.pos.y } : null;
    });
    expect(lussiPos).not.toBeNull();

    await teleportPlayer(page, lussiPos.x - 40, lussiPos.y);
    await page.waitForTimeout(200);
    await teleportPlayer(page, lussiPos.x - 20, lussiPos.y);
    await page.waitForTimeout(1500); // wait for flee animation

    const state = await getGameState(page);
    expect(state.roomsSearched.etasje2_stue).toBe(true);
  });

  test("Lussi triggers in mamma", async ({ page }) => {
    await goToScene(page, "etasje2_mamma");
    const lussiPos = await page.evaluate(() => {
      const l = get("roomLussi")[0];
      return l ? { x: l.pos.x, y: l.pos.y } : null;
    });
    expect(lussiPos).not.toBeNull();

    await teleportPlayer(page, lussiPos.x, lussiPos.y + 20);
    await page.waitForTimeout(1500);

    const state = await getGameState(page);
    expect(state.roomsSearched.etasje2_mamma).toBe(true);
  });

  test("Lussi triggers in ylva", async ({ page }) => {
    await goToScene(page, "etasje1_ylva");
    const lussiPos = await page.evaluate(() => {
      const l = get("roomLussi")[0];
      return l ? { x: l.pos.x, y: l.pos.y } : null;
    });
    expect(lussiPos).not.toBeNull();

    await teleportPlayer(page, lussiPos.x, lussiPos.y + 20);
    await page.waitForTimeout(1500);

    const state = await getGameState(page);
    expect(state.roomsSearched.etasje1_ylva).toBe(true);
  });

  test("Lussi triggers in vetle", async ({ page }) => {
    await goToScene(page, "etasje1_vetle");
    const lussiPos = await page.evaluate(() => {
      const l = get("roomLussi")[0];
      return l ? { x: l.pos.x, y: l.pos.y } : null;
    });
    expect(lussiPos).not.toBeNull();

    await teleportPlayer(page, lussiPos.x, lussiPos.y + 20);
    await page.waitForTimeout(1500);

    const state = await getGameState(page);
    expect(state.roomsSearched.etasje1_vetle).toBe(true);
  });

  test("Lussi triggers in bad", async ({ page }) => {
    await goToScene(page, "etasje1_bad");
    const lussiPos = await page.evaluate(() => {
      const l = get("roomLussi")[0];
      return l ? { x: l.pos.x, y: l.pos.y } : null;
    });
    expect(lussiPos).not.toBeNull();

    await teleportPlayer(page, lussiPos.x, lussiPos.y + 20);
    await page.waitForTimeout(1500);

    const state = await getGameState(page);
    expect(state.roomsSearched.etasje1_bad).toBe(true);
  });

  test("quest counter increments as rooms are searched", async ({ page }) => {
    const rooms = ["etasje2_stue", "etasje2_mamma", "etasje1_ylva", "etasje1_vetle", "etasje1_bad"];

    for (let i = 0; i < rooms.length; i++) {
      await goToScene(page, rooms[i]);
      const lussiPos = await page.evaluate(() => {
        const l = get("roomLussi")[0];
        return l ? { x: l.pos.x, y: l.pos.y } : null;
      });

      if (lussiPos) {
        await teleportPlayer(page, lussiPos.x, lussiPos.y + 20);
        await page.waitForTimeout(1500);
      }

      const state = await getGameState(page);
      expect(state.questState.searchRooms.current).toBe(i + 1);
    }
  });

  test("Lussi does not appear in already-searched room", async ({ page }) => {
    await setGameState(page, {
      roomsSearched: { etasje2_stue: true },
    });
    await goToScene(page, "etasje2_stue");

    const lussiCount = await countByTag(page, "roomLussi");
    expect(lussiCount).toBe(0);
  });

  test("gata has no Lussi when rooms not all searched", async ({ page }) => {
    await goToScene(page, "gata");
    await page.waitForTimeout(1000);

    const lussiCount = await countByTag(page, "lussi");
    expect(lussiCount).toBe(0);

    const state = await getGameState(page);
    expect(state.allRoomsSearched).toBe(false);
  });

  test("gata has Lussi when all rooms searched", async ({ page }) => {
    await setGameState(page, {
      roomsSearched: {
        etasje2_stue: true,
        etasje2_mamma: true,
        etasje1_ylva: true,
        etasje1_vetle: true,
        etasje1_bad: true,
      },
    });
    await goToScene(page, "gata");
    await page.waitForTimeout(500);

    const lussiCount = await countByTag(page, "lussi");
    expect(lussiCount).toBe(1);
  });
});
