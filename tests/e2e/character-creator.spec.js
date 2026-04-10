// ============================================================
// E2E: Character Creator scene
// ============================================================

const { test, expect } = require("@playwright/test");
const {
  waitForGameReady,
  clickGameCoord,
  getCurrentScene,
  waitForScene,
  getGameState,
  getCharacterLayers,
  goToScene,
  setGameState,
} = require("../helpers/game");

// Button/arrow coordinates derived from character_creator.js layout:
//   ROW_START_Y=310, ROW_H=52, ARROW_L_X=280, ARROW_R_X=510
const ROWS = {
  body:      { y: 310 },
  outfit:    { y: 362 },
  hair:      { y: 414 },
  hairColor: { y: 466 },
};
const ARROW_L = 280;
const ARROW_R = 510;
const BTN_BACK   = { x: 160, y: 555 };
const BTN_FERDIG = { x: 620, y: 555 };

test.describe("Character Creator Scene", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForGameReady(page);
    // Reset layers to known defaults before each test
    await page.evaluate(() => resetCharacterLayers());
  });

  // ── Navigation ────────────────────────────────────────────────

  test("'Lag din egen' button on start screen navigates to character_creator", async ({ page }) => {
    // "Lag din egen" button: center().add(215, 100) = (615, 400)
    await clickGameCoord(page, 615, 400);
    await waitForScene(page, "character_creator");
    expect(await getCurrentScene(page)).toBe("character_creator");
  });

  test("'Tilbake' button returns to start scene", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    await clickGameCoord(page, BTN_BACK.x, BTN_BACK.y);
    await waitForScene(page, "start");
    expect(await getCurrentScene(page)).toBe("start");
  });

  // ── Default state ─────────────────────────────────────────────

  test("characterLayers start at their defaults", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    const layers = await getCharacterLayers(page);
    expect(layers.body).toBe(1);
    expect(layers.eyes).toBe(1);
    expect(layers.outfit).toBe(1);
    expect(layers.hair).toBe(1);
    expect(layers.hairColor).toBe(1);
  });

  // ── Right-arrow cycling ───────────────────────────────────────

  test("right arrow increments body", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    await clickGameCoord(page, ARROW_R, ROWS.body.y);
    const layers = await getCharacterLayers(page);
    expect(layers.body).toBe(2);
  });

  test("right arrow wraps body from max (4) back to 1", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    await page.evaluate(() => { characterLayers.body = 4; });
    await clickGameCoord(page, ARROW_R, ROWS.body.y);
    const layers = await getCharacterLayers(page);
    expect(layers.body).toBe(1);
  });

  test("right arrow increments outfit", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    await clickGameCoord(page, ARROW_R, ROWS.outfit.y);
    const layers = await getCharacterLayers(page);
    expect(layers.outfit).toBe(2);
  });

  test("right arrow wraps outfit from max (5) back to 1", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    await page.evaluate(() => { characterLayers.outfit = 5; });
    await clickGameCoord(page, ARROW_R, ROWS.outfit.y);
    const layers = await getCharacterLayers(page);
    expect(layers.outfit).toBe(1);
  });

  test("right arrow increments hair style", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    await clickGameCoord(page, ARROW_R, ROWS.hair.y);
    const layers = await getCharacterLayers(page);
    expect(layers.hair).toBe(2);
  });

  test("right arrow wraps hair from max (6) back to 1", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    await page.evaluate(() => { characterLayers.hair = 6; });
    await clickGameCoord(page, ARROW_R, ROWS.hair.y);
    const layers = await getCharacterLayers(page);
    expect(layers.hair).toBe(1);
  });

  test("right arrow increments hair color", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    await clickGameCoord(page, ARROW_R, ROWS.hairColor.y);
    const layers = await getCharacterLayers(page);
    expect(layers.hairColor).toBe(2);
  });

  test("right arrow wraps hair color from max (5) back to 1", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    await page.evaluate(() => { characterLayers.hairColor = 5; });
    await clickGameCoord(page, ARROW_R, ROWS.hairColor.y);
    const layers = await getCharacterLayers(page);
    expect(layers.hairColor).toBe(1);
  });

  // ── Left-arrow cycling ────────────────────────────────────────

  test("left arrow decrements body", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    await page.evaluate(() => { characterLayers.body = 3; });
    await clickGameCoord(page, ARROW_L, ROWS.body.y);
    const layers = await getCharacterLayers(page);
    expect(layers.body).toBe(2);
  });

  test("left arrow wraps body from min (1) to max (4)", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    // body starts at 1 (from resetCharacterLayers)
    await clickGameCoord(page, ARROW_L, ROWS.body.y);
    const layers = await getCharacterLayers(page);
    expect(layers.body).toBe(4);
  });

  test("left arrow wraps hair color from min (1) to max (5)", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    await clickGameCoord(page, ARROW_L, ROWS.hairColor.y);
    const layers = await getCharacterLayers(page);
    expect(layers.hairColor).toBe(5);
  });

  // ── "Ferdig!" — character composition ────────────────────────

  test("Ferdig! sets selectedCharacter to 'custom' and navigates to kitchen", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    await clickGameCoord(page, BTN_FERDIG.x, BTN_FERDIG.y);
    await waitForScene(page, "etasje2_kjokken", 15000);

    const state = await getGameState(page);
    expect(state.selectedCharacter).toBe("custom");
    expect(state.scene).toBe("etasje2_kjokken");
  });

  test("Ferdig! resets game state before starting", async ({ page }) => {
    // Dirty the state first
    await page.evaluate(() => {
      treatsCount = 7;
      roomsSearched.etasje2_stue = true;
      roomsSearched.etasje1_ylva = true;
      questState.waterQuest.step = "done";
      inventory.push("kattemat");
    });

    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    await clickGameCoord(page, BTN_FERDIG.x, BTN_FERDIG.y);
    await waitForScene(page, "etasje2_kjokken", 15000);

    const state = await getGameState(page);
    expect(state.treatsCount).toBe(0);
    expect(state.roomsSearched.etasje2_stue).toBe(false);
    expect(state.roomsSearched.etasje1_ylva).toBe(false);
    expect(state.questState.waterQuest.step).toBe("find_bowl");
    expect(state.inventory).toEqual([]);
  });

  test("Ferdig! registers custom_idle_anim and custom_run sprites", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    await clickGameCoord(page, BTN_FERDIG.x, BTN_FERDIG.y);
    await waitForScene(page, "etasje2_kjokken", 15000);

    const spritesLoaded = await page.evaluate(() => {
      try {
        return getSprite("custom_idle_anim") != null && getSprite("custom_run") != null;
      } catch (e) {
        return false;
      }
    });
    expect(spritesLoaded).toBe(true);
  });

  test("Ferdig! composes the selected layers into the custom sprite", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");

    // Select non-default layers before compositing
    await page.evaluate(() => {
      characterLayers.body      = 3;
      characterLayers.outfit    = 4;
      characterLayers.hair      = 2;
      characterLayers.hairColor = 3;
    });

    await clickGameCoord(page, BTN_FERDIG.x, BTN_FERDIG.y);
    await waitForScene(page, "etasje2_kjokken", 15000);

    // The composited sprite must exist and have the correct frame count.
    // getSprite() returns a Kaplay Asset wrapper; frames live in .data.frames.
    const spriteFrameCount = await page.evaluate(() => {
      try {
        const s = getSprite("custom_idle_anim");
        if (!s) return 0;
        const data = s.data !== undefined ? s.data : s;
        return Array.isArray(data.frames) ? data.frames.length : 0;
      } catch (e) {
        return 0;
      }
    });
    expect(spriteFrameCount).toBe(24);
  });

  // ── Preview rendering ─────────────────────────────────────────
  //
  // Strategy: draw the WebGL game canvas onto an offscreen 2D canvas inside
  // page.evaluate() during a requestAnimationFrame callback (while the WebGL
  // framebuffer is still live), then read pixel data from the preview region.
  //
  // Preview center: game coords (400, 185), frame 96×96 game px (32px × scale 3).
  //   Upper half: y 137–185 → head / hair area
  //   Lower half: y 185–233 → body / outfit area
  //
  // Background colour: rgb(20, 40, 80).  Any pixel clearly different from that
  // counts as a "character pixel."
  //
  // Bug baseline: when only hair renders, the lower half has ≈0 character pixels.

  async function readPreviewPixels(page) {
    return page.evaluate(() => {
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          const canvas = document.querySelector("canvas");
          if (!canvas) { resolve(null); return; }

          const off = document.createElement("canvas");
          off.width = 800;
          off.height = 600;
          const ctx = off.getContext("2d");
          try {
            ctx.drawImage(canvas, 0, 0, 800, 600);
          } catch (e) {
            resolve({ error: e.message });
            return;
          }

          // Preview: center (400, 185), half-size 48 px
          const cx = 400, cy = 185, r = 48;

          function countCharPixels(x0, y0, w, h) {
            const d = ctx.getImageData(x0, y0, w, h).data;
            let n = 0;
            for (let i = 0; i < d.length; i += 4) {
              if (d[i + 3] < 10) continue; // transparent
              // Background is rgb(20,40,80) — sum of absolute differences
              const diff = Math.abs(d[i] - 20) + Math.abs(d[i + 1] - 40) + Math.abs(d[i + 2] - 80);
              if (diff > 60) n++;
            }
            return n;
          }

          resolve({
            upper: countCharPixels(cx - r, cy - r, r * 2, r), // hair / head half
            lower: countCharPixels(cx - r, cy,     r * 2, r), // body / outfit half
          });
        });
      });
    });
  }

  test("preview contains character pixels in both upper and lower halves", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    await page.waitForTimeout(800); // let Kaplay render a few frames

    const pixels = await readPreviewPixels(page);
    expect(pixels).not.toBeNull();
    expect(pixels.error).toBeUndefined();

    // Hair / head area (upper half) must have character pixels
    expect(pixels.upper).toBeGreaterThan(50);
    // Body / outfit area (lower half) must also have character pixels.
    // This assertion FAILS when only the hair is rendered (the original bug).
    expect(pixels.lower).toBeGreaterThan(50);
  });

  test("preview still shows full character after cycling selectors", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    await page.waitForTimeout(500);

    // Cycle body and outfit once each (calls updatePreview internally)
    await clickGameCoord(page, ARROW_R, ROWS.body.y);
    await clickGameCoord(page, ARROW_R, ROWS.outfit.y);
    await page.waitForTimeout(400);

    const pixels = await readPreviewPixels(page);
    expect(pixels).not.toBeNull();
    expect(pixels.upper).toBeGreaterThan(50);
    expect(pixels.lower).toBeGreaterThan(50);
  });

  test("custom character player exists in kitchen after Ferdig!", async ({ page }) => {
    await goToScene(page, "character_creator");
    await waitForScene(page, "character_creator");
    await clickGameCoord(page, BTN_FERDIG.x, BTN_FERDIG.y);
    await waitForScene(page, "etasje2_kjokken", 15000);

    const playerExists = await page.evaluate(() => get("player").length === 1);
    expect(playerExists).toBe(true);
  });
});
