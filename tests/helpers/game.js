// ============================================================
// Shared test helpers for Jakten på Lussi E2E tests
// ============================================================

const { expect } = require("@playwright/test");

/**
 * Wait for the Kaplay engine to be fully loaded and ready.
 * Checks that the `rect` global function exists (injected by kaplay()).
 */
async function waitForGameReady(page) {
  await page.waitForFunction(() => typeof rect === "function", null, {
    timeout: 15000,
  });
  // Give assets a moment to start loading
  await page.waitForTimeout(1000);
}

/**
 * Get the canvas element's bounding box for coordinate mapping.
 * Kaplay uses letterbox mode so the canvas may be offset.
 */
async function getCanvasBounds(page) {
  return page.evaluate(() => {
    const c = document.querySelector("canvas");
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
}

/**
 * Click at game-world coordinates on the canvas.
 * Maps 800x600 game coords to actual canvas pixel position,
 * accounting for Kaplay's letterbox scaling.
 */
async function clickGameCoord(page, gx, gy) {
  const bounds = await getCanvasBounds(page);
  if (!bounds) throw new Error("Canvas not found");
  // Kaplay letterbox: scale to fit while maintaining 800x600 aspect ratio
  const gameW = 800, gameH = 600;
  const scale = Math.min(bounds.width / gameW, bounds.height / gameH);
  const vpW = gameW * scale;
  const vpH = gameH * scale;
  const offsetX = (bounds.width - vpW) / 2;
  const offsetY = (bounds.height - vpH) / 2;
  const cx = bounds.x + offsetX + gx * scale;
  const cy = bounds.y + offsetY + gy * scale;
  await page.mouse.click(cx, cy);
}

/**
 * Start the game as a specific character by clicking the button.
 * Buttons are at center().add(offset, 100) = (400+offset, 400):
 *   Ylva:  center().add(-215, 100) = (185, 400)
 *   Vetle: center().add(0,   100) = (400, 400)
 */
async function startGameAs(page, character) {
  await waitForGameReady(page);
  // Wait for start scene to render
  await page.waitForTimeout(500);

  if (character === "ylva") {
    await clickGameCoord(page, 185, 400);
  } else {
    await clickGameCoord(page, 400, 400);
  }

  // Wait for scene transition
  await page.waitForTimeout(1500);
}

/**
 * Get the current scene name. Kaplay v3 exposes getSceneName().
 * Falls back to checking a window variable if needed.
 */
async function getCurrentScene(page) {
  return page.evaluate(() => {
    if (typeof getSceneName === "function") return getSceneName();
    return null;
  });
}

/**
 * Wait until the scene changes to the expected name.
 */
async function waitForScene(page, sceneName, timeout = 10000) {
  await page.waitForFunction(
    (name) => {
      if (typeof getSceneName === "function") return getSceneName() === name;
      return false;
    },
    sceneName,
    { timeout }
  );
}

/**
 * Read all important game state in a single evaluate call.
 */
async function getGameState(page) {
  return page.evaluate(() => ({
    scene: typeof getSceneName === "function" ? getSceneName() : null,
    selectedCharacter,
    roomsSearched: { ...roomsSearched },
    allRoomsSearched: allRoomsSearched(),
    treatsCount,
    collectedTreats: { ...collectedTreats },
    inventory: [...inventory],
    questState: JSON.parse(JSON.stringify(questState)),
  }));
}

/**
 * Read the current character layer selections.
 */
async function getCharacterLayers(page) {
  return page.evaluate(() => ({ ...characterLayers }));
}

/**
 * Teleport the player directly to a position (for fast test setup).
 */
async function teleportPlayer(page, x, y) {
  await page.evaluate(
    ([px, py]) => {
      const p = get("player")[0];
      if (p) {
        p.pos.x = px;
        p.pos.y = py;
      }
    },
    [x, y]
  );
}

/**
 * Get the player's current position.
 */
async function getPlayerPos(page) {
  return page.evaluate(() => {
    const p = get("player")[0];
    return p ? { x: p.pos.x, y: p.pos.y } : null;
  });
}

/**
 * Hold a key down for a specific duration.
 */
async function pressKeyFor(page, key, ms) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

/**
 * Move the player toward a target position using keyboard input.
 * Polls position and adjusts direction. Stops when close enough.
 */
async function movePlayerTo(page, targetX, targetY, timeout = 8000) {
  const start = Date.now();
  const threshold = 20;

  while (Date.now() - start < timeout) {
    const pos = await getPlayerPos(page);
    if (!pos) break;

    const dx = targetX - pos.x;
    const dy = targetY - pos.y;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) break;

    // Release all keys first
    await page.keyboard.up("ArrowLeft");
    await page.keyboard.up("ArrowRight");
    await page.keyboard.up("ArrowUp");
    await page.keyboard.up("ArrowDown");

    // Press toward the target
    if (Math.abs(dx) > threshold) {
      await page.keyboard.down(dx > 0 ? "ArrowRight" : "ArrowLeft");
    }
    if (Math.abs(dy) > threshold) {
      await page.keyboard.down(dy > 0 ? "ArrowDown" : "ArrowUp");
    }

    await page.waitForTimeout(100);
  }

  // Release all keys
  await page.keyboard.up("ArrowLeft");
  await page.keyboard.up("ArrowRight");
  await page.keyboard.up("ArrowUp");
  await page.keyboard.up("ArrowDown");
}

/**
 * Navigate directly to a scene via go() for isolated testing.
 * Optionally pass args (e.g. {fra: "etasje1_gang"}).
 */
async function goToScene(page, sceneName, args = {}) {
  await page.evaluate(
    ([name, a]) => go(name, a),
    [sceneName, args]
  );
  await page.waitForTimeout(800);
}

/**
 * Set game state directly for test setup (e.g. mark rooms as searched).
 */
async function setGameState(page, overrides) {
  await page.evaluate((o) => {
    if (o.selectedCharacter !== undefined)
      selectedCharacter = o.selectedCharacter;
    if (o.roomsSearched) {
      for (const k in o.roomsSearched) roomsSearched[k] = o.roomsSearched[k];
    }
    if (o.treatsCount !== undefined) treatsCount = o.treatsCount;
    if (o.collectedTreats) Object.assign(collectedTreats, o.collectedTreats);
    if (o.inventory) {
      inventory.length = 0;
      inventory.push(...o.inventory);
    }
    if (o.questState) {
      if (o.questState.waterQuest)
        Object.assign(questState.waterQuest, o.questState.waterQuest);
      if (o.questState.searchRooms)
        Object.assign(questState.searchRooms, o.questState.searchRooms);
      if (o.questState.collectFish)
        Object.assign(questState.collectFish, o.questState.collectFish);
    }
  }, overrides);
}

/**
 * Initialize the game for E2E testing: navigate, wait for ready,
 * and optionally start as a character.
 */
async function initGame(page, { character } = {}) {
  await page.goto("/");
  await waitForGameReady(page);
  if (character) {
    await startGameAs(page, character);
  }
}

/**
 * Count game objects with a specific tag.
 */
async function countByTag(page, tag) {
  return page.evaluate((t) => get(t).length, tag);
}

module.exports = {
  waitForGameReady,
  getCanvasBounds,
  clickGameCoord,
  startGameAs,
  getCurrentScene,
  waitForScene,
  getGameState,
  getCharacterLayers,
  teleportPlayer,
  getPlayerPos,
  pressKeyFor,
  movePlayerTo,
  goToScene,
  setGameState,
  initGame,
  countByTag,
};
