// ============================================================
// Unit tests for pure functions in constants.js
// ============================================================
// Run with: npm run test:unit

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

// Create a minimal sandbox with Kaplay globals, then evaluate
// constants.js wrapped in a function that returns all exports.
// This works around const/let not becoming sandbox properties.
function loadConstants() {
  const code = fs.readFileSync(
    path.join(__dirname, "../../js/constants.js"),
    "utf-8"
  );

  const wrapper = `(function() {
    ${code}
    return {
      PLAYER_SPEED, ROOM_OX, ROOM_OY, ROOM_W, ROOM_H,
      WALL_V, BOT_WALL_H, TOP_WALL_H,
      ARCH_DOOR_X, ARCH_DOOR_Y,
      tileX, tileY,
      roomsSearched, allRoomsSearched, resetRoomsSearched,
      resetTreats, resetQuests,
      SPAWNS,
      // Expose closures for mutable let-bindings
      getTreatsCount: function() { return treatsCount; },
      setTreatsCount: function(v) { treatsCount = v; },
      getCollectedTreats: function() { return collectedTreats; },
      getInventory: function() { return inventory; },
      getQuestState: function() { return questState; },
    };
  })()`;

  const sandbox = {
    vec2: (x, y) => ({ x, y }),
    console,
    play: () => {},
    Object,
  };
  vm.createContext(sandbox);
  return vm.runInContext(wrapper, sandbox);
}

describe("tileX / tileY", () => {
  it("tileX(0) returns ROOM_OX (96)", () => {
    const ctx = loadConstants();
    assert.equal(ctx.tileX(0), 96);
  });

  it("tileY(0) returns ROOM_OY (76)", () => {
    const ctx = loadConstants();
    assert.equal(ctx.tileY(0), 76);
  });

  it("tileX(col) increments by 32 per column", () => {
    const ctx = loadConstants();
    assert.equal(ctx.tileX(1), 128);
    assert.equal(ctx.tileX(5), 256);
    assert.equal(ctx.tileX(18), 672);
  });

  it("tileY(row) increments by 32 per row", () => {
    const ctx = loadConstants();
    assert.equal(ctx.tileY(1), 108);
    assert.equal(ctx.tileY(13), 492);
  });

  it("tileX(8) equals ARCH_DOOR_X (352)", () => {
    const ctx = loadConstants();
    assert.equal(ctx.tileX(8), ctx.ARCH_DOOR_X);
  });
});

describe("Room geometry constants", () => {
  it("room dimensions are correct", () => {
    const ctx = loadConstants();
    assert.equal(ctx.ROOM_OX, 96);
    assert.equal(ctx.ROOM_OY, 76);
    assert.equal(ctx.ROOM_W, 608);
    assert.equal(ctx.ROOM_H, 448);
    assert.equal(ctx.WALL_V, 32);
    assert.equal(ctx.BOT_WALL_H, 32);
    assert.equal(ctx.TOP_WALL_H, 96);
  });

  it("19 columns x 14 rows at 32px fill the room", () => {
    const ctx = loadConstants();
    assert.equal(19 * 32, ctx.ROOM_W);
    assert.equal(14 * 32, ctx.ROOM_H);
  });

  it("ARCH_DOOR_Y is at bottom wall position", () => {
    const ctx = loadConstants();
    assert.equal(ctx.ARCH_DOOR_Y, ctx.ROOM_OY + ctx.ROOM_H - ctx.BOT_WALL_H);
  });
});

describe("allRoomsSearched", () => {
  it("returns false when no rooms are searched", () => {
    const ctx = loadConstants();
    assert.equal(ctx.allRoomsSearched(), false);
  });

  it("returns false when some rooms are searched", () => {
    const ctx = loadConstants();
    ctx.roomsSearched.etasje2_stue = true;
    ctx.roomsSearched.etasje1_ylva = true;
    assert.equal(ctx.allRoomsSearched(), false);
  });

  it("returns true when all rooms are searched", () => {
    const ctx = loadConstants();
    for (const k in ctx.roomsSearched) ctx.roomsSearched[k] = true;
    assert.equal(ctx.allRoomsSearched(), true);
  });
});

describe("resetRoomsSearched", () => {
  it("sets all rooms to false", () => {
    const ctx = loadConstants();
    for (const k in ctx.roomsSearched) ctx.roomsSearched[k] = true;
    ctx.resetRoomsSearched();
    for (const k in ctx.roomsSearched) {
      assert.equal(ctx.roomsSearched[k], false, `${k} should be false`);
    }
  });
});

describe("resetTreats", () => {
  it("zeroes treatsCount and clears collectedTreats", () => {
    const ctx = loadConstants();
    ctx.setTreatsCount(7);
    ctx.resetTreats();
    assert.equal(ctx.getTreatsCount(), 0);
    assert.equal(Object.keys(ctx.getCollectedTreats()).length, 0);
  });
});

describe("resetQuests", () => {
  it("empties inventory", () => {
    const ctx = loadConstants();
    ctx.getInventory().push("full_vannskaal");
    ctx.resetQuests();
    assert.equal(ctx.getInventory().length, 0);
  });

  it("resets quest counters", () => {
    const ctx = loadConstants();
    const qs = ctx.getQuestState();
    qs.searchRooms.current = 4;
    qs.collectFish.current = 8;
    qs.waterQuest.step = "done";
    ctx.resetQuests();
    const qs2 = ctx.getQuestState();
    assert.equal(qs2.searchRooms.current, 0);
    assert.equal(qs2.collectFish.current, 0);
    assert.equal(qs2.waterQuest.step, "find_bowl");
  });
});

describe("SPAWNS", () => {
  it("has spawn positions for all scenes", () => {
    const ctx = loadConstants();
    const expected = [
      "etasje1_gang_default",
      "etasje1_ylva_default",
      "etasje1_vetle_default",
      "etasje1_bad_default",
      "etasje2_stue_default",
      "etasje2_mamma_default",
      "etasje2_kjokken_default",
      "gata_default",
    ];
    for (const key of expected) {
      assert.ok(ctx.SPAWNS[key], `Missing spawn: ${key}`);
      assert.equal(typeof ctx.SPAWNS[key].x, "number");
      assert.equal(typeof ctx.SPAWNS[key].y, "number");
    }
  });
});
