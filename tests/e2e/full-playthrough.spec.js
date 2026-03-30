// ============================================================
// E2E: Full playthrough — start to victory
// ============================================================

const { test, expect } = require("@playwright/test");
const {
  waitForGameReady,
  clickGameCoord,
  goToScene,
  teleportPlayer,
  pressKeyFor,
  getGameState,
  getCurrentScene,
  waitForScene,
  startGameAs,
} = require("../helpers/game");

/** Walk through a treat at (col, row) to pick it up */
async function collectTreat(page, col, row) {
  const tx = 96 + col * 32 + 16;
  const ty = 76 + row * 32 + 16;
  await teleportPlayer(page, tx - 50, ty);
  await page.waitForTimeout(100);
  await pressKeyFor(page, "ArrowRight", 600);
  await page.waitForTimeout(200);
}

/** Interact with an object by teleporting close and clicking indicator */
async function interactNear(page, objX, objY) {
  await teleportPlayer(page, objX + 10, objY + 30);
  await page.waitForTimeout(400);
  await clickGameCoord(page, objX + 16, objY - 12);
  await page.waitForTimeout(200);
  await clickGameCoord(page, objX + 16, objY - 7);
  await page.waitForTimeout(200);
}

/** Approach Lussi to trigger flee, wait for cooldown */
async function triggerFlee(page) {
  const lussiPos = await page.evaluate(() => {
    const l = get("lussi")[0];
    return l ? { x: l.pos.x, y: l.pos.y } : null;
  });
  if (!lussiPos) return;
  await teleportPlayer(page, lussiPos.x - 40, lussiPos.y);
  await page.waitForTimeout(500);
  await pressKeyFor(page, "ArrowRight", 300);
  await page.waitForTimeout(4000);
}

/** Walk into Lussi to trigger collision */
async function walkIntoLussi(page) {
  const lussiPos = await page.evaluate(() => {
    const l = get("lussi")[0];
    return l ? { x: l.pos.x, y: l.pos.y } : null;
  });
  if (!lussiPos) return;
  await teleportPlayer(page, lussiPos.x - 40, lussiPos.y);
  await page.waitForTimeout(200);
  await pressKeyFor(page, "ArrowRight", 500);
  await page.waitForTimeout(500);
}

test.describe("Full Playthrough", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForGameReady(page);
  });

  test("complete game as Ylva with all treats", async ({ page }) => {
    test.setTimeout(120000);

    // 1. Start as Ylva
    await startGameAs(page, "ylva");
    expect(await getCurrentScene(page)).toBe("etasje2_kjokken");

    // 2. Do water quest
    await interactNear(page, 416, 172); // cupboard
    let state = await getGameState(page);
    expect(state.questState.waterQuest.step).toBe("fill_water");

    await interactNear(page, 640, 332); // faucet
    state = await getGameState(page);
    expect(state.questState.waterQuest.step).toBe("place_bowl");

    await interactNear(page, 240, 184); // water spot
    state = await getGameState(page);
    expect(state.questState.waterQuest.step).toBe("done");

    // 3. Collect all treats
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

    state = await getGameState(page);
    expect(state.treatsCount).toBe(11);

    // 4. Search all 5 rooms
    const searchRooms = ["etasje2_stue", "etasje2_mamma", "etasje1_ylva", "etasje1_vetle", "etasje1_bad"];
    for (const room of searchRooms) {
      state = await getGameState(page);
      if (state.roomsSearched[room]) continue;

      await goToScene(page, room);
      const lussiPos = await page.evaluate(() => {
        const l = get("roomLussi")[0];
        return l ? { x: l.pos.x, y: l.pos.y } : null;
      });
      if (lussiPos) {
        await teleportPlayer(page, lussiPos.x, lussiPos.y + 20);
        await page.waitForTimeout(1500);
      }
    }

    state = await getGameState(page);
    expect(state.allRoomsSearched).toBe(true);

    // 5. Go to gata
    await goToScene(page, "gata");
    await page.waitForTimeout(500);

    // 6. Chase Lussi (1 escape with all treats)
    await triggerFlee(page);
    await walkIntoLussi(page);

    // 7. Victory
    expect(await getCurrentScene(page)).toBe("vinn");
  });

  test("complete game as Vetle without treats (3 escapes)", async ({ page }) => {
    test.setTimeout(120000);

    await startGameAs(page, "vetle");
    expect(await getCurrentScene(page)).toBe("etasje2_kjokken");

    // Search all rooms
    const searchRooms = ["etasje2_stue", "etasje2_mamma", "etasje1_ylva", "etasje1_vetle", "etasje1_bad"];
    for (const room of searchRooms) {
      await goToScene(page, room);
      const lussiPos = await page.evaluate(() => {
        const l = get("roomLussi")[0];
        return l ? { x: l.pos.x, y: l.pos.y } : null;
      });
      if (lussiPos) {
        await teleportPlayer(page, lussiPos.x, lussiPos.y + 20);
        await page.waitForTimeout(1500);
      }
    }

    const state = await getGameState(page);
    expect(state.allRoomsSearched).toBe(true);
    expect(state.treatsCount).toBe(0);

    // Go to gata — 3 escapes needed
    await goToScene(page, "gata");
    await page.waitForTimeout(500);

    for (let i = 0; i < 3; i++) {
      await triggerFlee(page);
    }

    await walkIntoLussi(page);
    expect(await getCurrentScene(page)).toBe("vinn");
  });

  test("replay from victory returns to start and works again", async ({ page }) => {
    test.setTimeout(60000);

    await page.evaluate(() => {
      selectedCharacter = "ylva";
      resetRoomsSearched();
      resetTreats();
      resetQuests();
    });
    await goToScene(page, "vinn");
    expect(await getCurrentScene(page)).toBe("vinn");

    // "Spill på nytt" button is at center().add(0, 160) = (400, 460)
    await page.waitForTimeout(1000);
    await clickGameCoord(page, 400, 460);
    await waitForScene(page, "start", 5000);

    expect(await getCurrentScene(page)).toBe("start");

    // Start a new game
    await startGameAs(page, "vetle");
    expect(await getCurrentScene(page)).toBe("etasje2_kjokken");

    const state = await getGameState(page);
    expect(state.selectedCharacter).toBe("vetle");
    expect(state.treatsCount).toBe(0);
    expect(state.allRoomsSearched).toBe(false);
  });
});
