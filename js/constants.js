// ============================================================
// JAKTEN PÅ LUSSI — Constants & shared state
// ============================================================

const PLAYER_SPEED = 200;
let bgMusicPlaying = false;
let isMuted = false;

// ── Room search state ────────────────────────────────────────
let roomsSearched = {
  etasje2_stue: false, etasje2_mamma: false,
  etasje1_vetle: false, etasje1_ylva: false, etasje1_bad: false,
  nabolag_venn: false,   // outdoor search in the neighbour's street
};
function allRoomsSearched() {
  return Object.values(roomsSearched).every(function(v) { return v; });
}
function resetRoomsSearched() {
  for (var k in roomsSearched) roomsSearched[k] = false;
}

// ── Treat (godbiter) counter & persistence ────────────────────
let treatsCount = 0;
let collectedTreats = {};          // keys: "sceneKey_col_row"
function resetTreats() {
  treatsCount = 0;
  collectedTreats = {};
}

// ── Inventory ─────────────────────────────────────────────────
let inventory = [];

// ── Quest state ───────────────────────────────────────────────
let questState = {
  searchRooms: { active: true, current: 0, total: 6 },
  collectFish: { active: true, current: 0, total: 11 },
  waterQuest:  { active: true, step: "find_bowl" },
  lussiChase:  { active: false, status: "not_started" },
  // steps: "find_bowl" → "fill_water" → "place_bowl" → "done"
  // lussiChase statuses: "not_started" → "chasing" → "catchable" → "done"
};

function resetQuests() {
  inventory = [];
  questState.searchRooms.current = 0;
  questState.collectFish.current = 0;
  questState.waterQuest = { active: true, step: "find_bowl" };
  questState.lussiChase = { active: false, status: "not_started" };
}

// ── Room geometry (19×14 tile grid at 32px/tile) ─────────────
// Canvas: 800×600. Room: 608×448. Margins: 96px left/right, 76px top/bottom.
const ROOM_OX    = 96;   // left margin
const ROOM_OY    = 76;   // top margin
const ROOM_W     = 608;  // 19 tiles × 32px
const ROOM_H     = 448;  // 14 tiles × 32px
const WALL_V     = 32;   // side wall width (1 tile)
const BOT_WALL_H = 32;   // bottom wall height (1 tile)
const TOP_WALL_H = 96;   // top wall height (3 tiles)

// Tile coordinate helpers — always 32px-aligned
function tileX(col) { return ROOM_OX + col * 32; }
function tileY(row) { return ROOM_OY + row * 32; }

// Selected character — set on start screen
let selectedCharacter = "ylva";

// ── Save system state ────────────────────────────────────────
let lastScene = "etasje2_kjokken";        // updated by setupControls on scene entry
let customCharacterDataUrl = null;        // base64 dataUrl for custom character idle sprite
let customCharacterRunDataUrl = null;    // base64 dataUrl for custom character run sprite

// ── Custom character layer selections ────────────────────────
let characterLayers = {
  body:      1,  // 1–4
  eyes:      1,  // 1–6
  outfit:    1,  // 1–5
  hair:      1,  // style 1–6
  hairColor: 1,  // color 1–5
};
function resetCharacterLayers() {
  characterLayers = { body: 1, eyes: 1, outfit: 1, hair: 1, hairColor: 1 };
}

// ── Door positions (tile-aligned, 32px grid) ─────────────────
// Side wall doors: WALL_V wide × 64px tall (2 tiles)
// Bottom wall doors: 64px wide × BOT_WALL_H tall (2×1 tiles)
// Top wall gaps: 64px wide (2 tiles), handled via makeRoomLevel topGaps

// Gang
const GANG_VETLE_GAP_X  = tileX(4);   // top wall gap cols 6-7 → x=288
const GANG_BAD_DOOR_Y   = tileY(2);   // left wall, row 4 → y=204
const GANG_YLVA_DOOR_Y  = tileY(6);   // left wall, row 9 → y=364
const GANG_GATA_DOOR_Y  = tileY(10);  // right wall, row 10 → y=396

// Ylva room
const YLVA_GANG_DOOR_Y  = tileY(7);   // right wall, row 7 → y=300

// Bad room
const BAD_GANG_DOOR_Y   = tileY(9);   // right wall, row 9 → y=364

// Bottom arch door (centered, cols 8-10)
const ARCH_DOOR_X       = tileX(8);   // x=352
const ARCH_DOOR_Y       = ROOM_OY + ROOM_H - BOT_WALL_H;  // y=492

// Stue top-wall gaps
const STUE_KJK_GAP_X    = tileX(2);   // Kjøkken: cols 2-3 → x=160
const STUE_MAMMA_GAP_X  = tileX(13);  // Mamma: cols 13-14 → x=512

// ── Spawn positions ──────────────────────────────────────────
// Evaluated after kaplay() — vec2() is available.
const SPAWNS = {
  // Gang
  "etasje1_gang_default":             vec2(400, 380),
  "etasje1_gang_fra_gata":            vec2(ROOM_OX+ROOM_W-WALL_V-20, GANG_GATA_DOOR_Y+32),
  "etasje1_gang_fra_etasje2_stue":    vec2(590, 280),
  "etasje1_gang_fra_etasje1_ylva":    vec2(ROOM_OX+WALL_V+20, GANG_YLVA_DOOR_Y+32),
  "etasje1_gang_fra_etasje1_vetle":   vec2(GANG_VETLE_GAP_X+32, ROOM_OY+TOP_WALL_H+32),
  "etasje1_gang_fra_etasje1_bad":     vec2(ROOM_OX+WALL_V+20, GANG_BAD_DOOR_Y+32),

  // Ylva
  "etasje1_ylva_default":             vec2(400, 330),
  "etasje1_ylva_fra_etasje1_gang":    vec2(ROOM_OX+ROOM_W-WALL_V-20, YLVA_GANG_DOOR_Y+32),

  // Vetle
  "etasje1_vetle_default":            vec2(400, 330),
  "etasje1_vetle_fra_etasje1_gang":   vec2(ARCH_DOOR_X+32, ARCH_DOOR_Y-32),

  // Bad
  "etasje1_bad_default":              vec2(380, 330),
  "etasje1_bad_fra_etasje1_gang":     vec2(ROOM_OX+ROOM_W-WALL_V-20, BAD_GANG_DOOR_Y+32),

  // Stue
  "etasje2_stue_default":             vec2(360, 360),
  "etasje2_stue_fra_etasje1_gang":    vec2(590, 430),
  "etasje2_stue_fra_etasje2_mamma":   vec2(450, ROOM_OY+TOP_WALL_H+32),
  "etasje2_stue_fra_etasje2_kjokken": vec2(STUE_KJK_GAP_X+32, ROOM_OY+TOP_WALL_H+32),

  // Mamma
  "etasje2_mamma_default":            vec2(400, 330),
  "etasje2_mamma_fra_etasje2_stue":   vec2(ARCH_DOOR_X+32, ARCH_DOOR_Y-32),

  // Kjøkken
  "etasje2_kjokken_default":          vec2(400, 330),
  "etasje2_kjokken_fra_etasje2_stue": vec2(ARCH_DOOR_X+32, ARCH_DOOR_Y-32),

  // Gata
  "gata_default":                     vec2(195, 388),

  // Nabolaget (neighbour street)
  "nabolag_venn_default":             vec2(80, 430),
};

// ── Atmosphere ────────────────────────────────────────────────
// isNight is set once at startup by checkTimeOfDay() (called in main.js)
// and stays constant for the session (no live clock polling).
let isNight = false;

/**
 * Reads the device clock and sets isNight.
 * Night = 19:00 – 06:59. Call once before go("start").
 */
function checkTimeOfDay() {
  var h = new Date().getHours();
  isNight = (h >= 19 || h < 7);
}
