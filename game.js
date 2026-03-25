// ============================================================
// JAKTEN PÅ LUSSI — Kaplay v3 Proof of Concept
// ============================================================
// Greyboxing: Alle figurer er enkle fargede former (rect/circle).
// Se etter kommentarer merket "TODO: replace with sprite(...)"
// for å vite hvor pikselkunst skal settes inn later.
// ============================================================

kaplay({
  width: 800,
  height: 600,
  letterbox: true,        // Bevarer aspektforhold (4:3 — matcher iPad perfekt)
  background: [30, 30, 50],
  gravity: 0,             // Top-down spill — ingen gravitasjon
  debug: false,
  pixelDensity: 1,        // Ikke bruk devicePixelRatio — sparer GPU på retina-skjermer
  crisp: true,            // Skarp pikselkunst (nearest-neighbor skalering)
  touchToMouse: true,     // Mapp touch-events til mus-events automatisk
});

// ────────────────────────────────────────────────────────────
// iOS-LYDFIX: iOS Safari fryser AudioContext i bakgrunnen.
// Gjenoppta automatisk når appen kommer i forgrunnen igjen,
// ellers vil all lyd og musikk feile stille etter app-bytte
// eller skjermlock.
// ────────────────────────────────────────────────────────────
function _ensureAudio() {
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}
document.addEventListener("visibilitychange", function() { if (!document.hidden) _ensureAudio(); });
window.addEventListener("focus",              _ensureAudio);
window.addEventListener("pageshow",           _ensureAudio);
document.addEventListener("touchstart",       _ensureAudio, { passive: true });

// ────────────────────────────────────────────────────────────
// ASSETS — Tilesets og sprites fra Modern Interiors
// ────────────────────────────────────────────────────────────

const ASSET = "assets/Modern_Interiors_Free_v2.2/Modern tiles_Free/";

// Gulvfliser og vegger fra Room Builder (32x32 per tile, 17x23 grid)
loadSpriteAtlas(ASSET + "Interiors_free/32x32/Room_Builder_free_32x32.png", {
  // ── Brunt tregulv (seksjon rad 11-12) ──
  "floor_wood":    { x: 32,  y: 384, width: 32, height: 32 },  // Senter (ingen kant)
  "floor_wood_tl": { x: 0,   y: 352, width: 32, height: 32 },  // Topp-venstre hjørne
  "floor_wood_t":  { x: 32,  y: 352, width: 32, height: 32 },  // Topp-kant (vegg→gulv)
  "floor_wood_tr": { x: 64,  y: 352, width: 32, height: 32 },  // Topp-høyre hjørne
  "floor_wood_l":  { x: 0,   y: 384, width: 32, height: 32 },  // Venstre-kant
  "floor_wood_r":  { x: 64,  y: 384, width: 32, height: 32 },  // Høyre-kant
  // ── Mørkere tregulv (seksjon rad 13-14) — for gang/yttergang ──
  "floor_wood_dark":    { x: 32,  y: 448, width: 32, height: 32 },
  "floor_wood_dark_tl": { x: 0,   y: 416, width: 32, height: 32 },
  "floor_wood_dark_t":  { x: 32,  y: 416, width: 32, height: 32 },
  "floor_wood_dark_tr": { x: 64,  y: 416, width: 32, height: 32 },
  "floor_wood_dark_l":  { x: 0,   y: 448, width: 32, height: 32 },
  "floor_wood_dark_r":  { x: 64,  y: 448, width: 32, height: 32 },
  // ── Blått baderomsgulv ──
  "floor_bath":    { x: 288, y: 288, width: 32, height: 32 },
  // ── Grått steingulv ──
  "floor_stone":   { x: 288, y: 352, width: 32, height: 32 },
  // ── Vegg-ansikt (hvit/krem) ──
  "wall_face":     { x: 128, y: 352, width: 32, height: 32 },  // Solid vegg-farge
});

// Resterende atlas-møbler (sprites uten dedikert enkeltfil)
loadSpriteAtlas(ASSET + "Interiors_free/32x32/Interiors_free_32x32_cropped.png", {
  // Skrivebord med PC — ingen erstatning i Modern_Interiors/
  "computer_desk":    { x: 96,  y: 256,  width: 32,  height: 64 },  // PC-pult (1x2)
  // Kjøleskap — ingen erstatning i Modern_Interiors/
  "fridge":           { x: 96,  y: 160,  width: 32,  height: 64 },  // Kjøleskap (1x2) — hvit dør
  // Bokhylle — ingen erstatning i Modern_Interiors/
  "bookshelf_books":  { x: 160, y: 448,  width: 64,  height: 64 },  // Bokhylle m/bøker (2x2)
  // Teppe
  "rug":              { x: 128, y: 448,  width: 96,  height: 64 },  // Teppe (3x2)
});

// ── Enkeltmøbler fra Modern_Interiors (dedikerte spritesheets) ──────
const MI = "assets/Modern_Interiors/";
loadSprite("si_bed_single",    MI + "Bedroom/Bedroom_Singles_191.png");   // 16×48 — single bed
loadSprite("si_bed",           MI + "Bedroom/Bedroom_Singles_266.png");   // 32×48 — double bed
loadSprite("si_dresser",       MI + "Bedroom/Bedroom_Singles_392.png");   // 32×32
loadSprite("si_wardrobe",      MI + "Bedroom/Bedroom_Singles_520.png");   // 16×48 — wardrobe / closet
loadSprite("si_bathtub",       MI + "Bathroom/animated_bathtub_2.png", {
  sliceX: 4,
  anims: { splash: { from: 0, to: 3, speed: 4, loop: true } },
});
loadSprite("si_toilet",        MI + "Bathroom/Bathroom_Singles_50.png");  // 16×48
loadSprite("si_sink",          MI + "Bathroom/Bathroom_Singles_12.png");  // 32×48
loadSprite("si_washer",        MI + "Bathroom/Bathroom_Singles_89.png");  // 32×48
loadSprite("si_sofa",          MI + "LivingRoom/Living_Room_Singles_35.png");  // 32×32
loadSprite("si_coffee_table",  MI + "LivingRoom/Living_Room_Singles_107.png"); // 32×48
loadSprite("si_dining_table",  MI + "LivingRoom/Living_Room_Singles_53.png");  // 32×32
loadSprite("si_kitchen_table", MI + "Kitchen/Kitchen_Singles_165.png");   // 32×48

// ── Utendørs — Modern Exteriors (dedikerte spritesheets) ────
const ME = "assets/Modern_Exteriors/";
loadSprite("me_house",        ME + "24_Additional_Houses_Terraced_House_3_16x16.png");       // 192×256 — spillerens hus
loadSprite("me_house_nb",     ME + "24_Additional_Houses_One_Story_House_16x16.png");        // 256×224 — nabohus
loadSprite("me_house_nb2",    ME + "24_Additional_Houses_Terraced_House_Modular_6_16x16.png"); // 160×240 — nabohus 2
loadSprite("me_tree_sm",      ME + "ME_Singles_City_Props_16x16_Tree_3.png");                // 32×48
loadSprite("me_tree_md",      ME + "ME_Singles_City_Props_16x16_Tree_6.png");                // 32×64
loadSprite("me_tree_lg",      ME + "ME_Singles_City_Props_16x16_Tree_12.png");               // 48×64
loadSprite("me_bush_lg",      ME + "ME_Singles_Garden_16x16_Bush_22.png");                   // 48×32
loadSprite("me_bush_sm",      ME + "ME_Singles_Garden_16x16_Bush_14.png");                   // 32×16
loadSprite("me_trampoline",   ME + "ME_Singles_Villas_16x16_Villa_Yard_Toy_Trampoline_1.png"); // 48×80

// ── Lussi (Cat_Grey) — idle og løpe-animasjon ──────────────
// Spritesheet: 320x2944, 32x32 per frame, 10 kolonner
const CAT_ASSET = "assets/Cat_85_Animations/";
loadSprite("lussi", CAT_ASSET + "Cat_Grey.png", {
  sliceX: 10, sliceY: 92,
  anims: {
    "idle": { from: 0,   to: 3,   loop: true, speed: 6 },   // Idle_1 — alle frames synlige
    "walk": { from: 32,  to: 39,  loop: true, speed: 10 },  // W_1 — 8 frames, tydelig gange
    "run":  { from: 212, to: 217, loop: true, speed: 14 },  // Run_2 — 6 frames, alle synlige
  },
});

// Spillerkarakterer — idle (statisk retningsbilde, 4 frames)
loadSprite("ylva_idle", ASSET + "Characters_free/Amelia_idle_16x16.png", {
  sliceX: 4, sliceY: 1,
});
loadSprite("vetle_idle", ASSET + "Characters_free/Adam_idle_16x16.png", {
  sliceX: 4, sliceY: 1,
});

// Spillerkarakterer — idle animasjon (6 frames × 4 retninger = 24)
loadSprite("ylva_idle_anim", ASSET + "Characters_free/Amelia_idle_anim_16x16.png", {
  sliceX: 24, sliceY: 1,
  anims: {
    "idle_right": { from: 0,  to: 5,  loop: true, speed: 6 },
    "idle_up":    { from: 6,  to: 11, loop: true, speed: 6 },
    "idle_left":  { from: 12, to: 17, loop: true, speed: 6 },
    "idle_down":  { from: 18, to: 23, loop: true, speed: 6 },
  },
});
loadSprite("vetle_idle_anim", ASSET + "Characters_free/Adam_idle_anim_16x16.png", {
  sliceX: 24, sliceY: 1,
  anims: {
    "idle_right": { from: 0,  to: 5,  loop: true, speed: 6 },
    "idle_up":    { from: 6,  to: 11, loop: true, speed: 6 },
    "idle_left":  { from: 12, to: 17, loop: true, speed: 6 },
    "idle_down":  { from: 18, to: 23, loop: true, speed: 6 },
  },
});

// Spillerkarakterer — løpe-animasjon (6 frames × 4 retninger = 24)
loadSprite("ylva_run", ASSET + "Characters_free/Amelia_run_16x16.png", {
  sliceX: 24, sliceY: 1,
  anims: {
    "run_right": { from: 0,  to: 5,  loop: true, speed: 10 },
    "run_up":    { from: 6,  to: 11, loop: true, speed: 10 },
    "run_left":  { from: 12, to: 17, loop: true, speed: 10 },
    "run_down":  { from: 18, to: 23, loop: true, speed: 10 },
  },
});
loadSprite("vetle_run", ASSET + "Characters_free/Adam_run_16x16.png", {
  sliceX: 24, sliceY: 1,
  anims: {
    "run_right": { from: 0,  to: 5,  loop: true, speed: 10 },
    "run_up":    { from: 6,  to: 11, loop: true, speed: 10 },
    "run_left":  { from: 12, to: 17, loop: true, speed: 10 },
    "run_down":  { from: 18, to: 23, loop: true, speed: 10 },
  },
});

// Bakoverkompatible alias — brukes på startskjerm osv.
loadSprite("ylva", ASSET + "Characters_free/Amelia_idle_16x16.png", {
  sliceX: 4, sliceY: 1,
});
loadSprite("vetle", ASSET + "Characters_free/Adam_idle_16x16.png", {
  sliceX: 4, sliceY: 1,
});

// ── Lyd / musikk ────────────────────────────────────────────
loadSound("bgmusic", "assets/Music/Track 1 (Let's Go).wav");
loadSound("lyd_matskaal", "assets/voice/lussi-bowl.m4a");
loadSound("lyd_vetle_rom", "assets/Voice/vetle-rom.m4a");
loadSound("lyd_ylva_rom", "assets/Voice/ylva-rom.m4a");
loadSound("lyd_gaat_ut", "assets/Voice/har-lussi-gaat-ut.m4a");
loadSound("lyd_lussi_gjemt_inne", "assets/Voice/lussi-gjemt-seg-inne.m4a");

// ────────────────────────────────────────────────────────────
// KONSTANTER
// ────────────────────────────────────────────────────────────

const PLAYER_SPEED = 200;
let bgMusicPlaying = false;

// ── Innendørs Lussi-jakt — rom-status ───────────────────
let roomsSearched = {
  etasje2_stue: false, etasje2_mamma: false,
  etasje1_vetle: false, etasje1_ylva: false, etasje1_bad: false,
};
function allRoomsSearched() {
  return Object.values(roomsSearched).every(function(v) { return v; });
}
function resetRoomsSearched() {
  for (var k in roomsSearched) roomsSearched[k] = false;
}

// ── Rom-skalering (90 % av viewport, sentrert) ─────────────
const ROOM_OX = 94;    // X-offset (margin venstre/høyre)
const ROOM_OY = 71;    // Y-offset (margin topp/bunn)
const ROOM_S  = 0.765; // Skaleringsfaktor (0.9 × 0.85)
const ROOM_W  = 612;   // 800 * 0.765
const ROOM_H  = 459;   // 600 * 0.765
const WALL_T  = 18;    // Veggtykkelse (24 * 0.765 ≈ 18)

// Hjelpefunksjoner for å konvertere gamle 800×600-koordinater
function rx(x) { return Math.round(ROOM_OX + x * ROOM_S); }
function ry(y) { return Math.round(ROOM_OY + y * ROOM_S); }
function rw(w) { return Math.round(w * ROOM_S); }
function rh(h) { return Math.round(h * ROOM_S); }

// Standard yttervegger + gulv for et rom
function makeRoomShell(floorType) {
  tileFloor(ROOM_OX + WALL_T, ROOM_OY + WALL_T,
            ROOM_OX + ROOM_W - WALL_T, ROOM_OY + ROOM_H - WALL_T, floorType);
  makeWall(ROOM_OX, ROOM_OY, ROOM_W, WALL_T);                          // Topp
  makeWall(ROOM_OX, ROOM_OY + ROOM_H - WALL_T, ROOM_W, WALL_T);       // Bunn
  makeWall(ROOM_OX, ROOM_OY, WALL_T, ROOM_H);                          // Venstre
  makeWall(ROOM_OX + ROOM_W - WALL_T, ROOM_OY, WALL_T, ROOM_H);       // Høyre
}

// Valgt karakter — settes på startskjermen
let selectedCharacter = "ylva";

// Startposisjoner per scene-overgang
// Huset er 720x540 (90%) i begge etasjer, sentrert med 40px/30px margin.
const SPAWNS = {
  // Hub 1: Gang + yttergang + trappehus (1. etasje)
  "etasje1_gang_default":            vec2(rx(400), ry(400)),
  "etasje1_gang_fra_gata":           vec2(rx(700), ry(480)),
  "etasje1_gang_fra_etasje2_stue":   vec2(rx(550), ry(160)),
  "etasje1_gang_fra_etasje1_ylva":   vec2(rx(100), ry(340)),
  "etasje1_gang_fra_etasje1_vetle":  vec2(rx(300), ry(100)),
  "etasje1_gang_fra_etasje1_bad":    vec2(rx(100), ry(100)),

  // Ylva soverom
  "etasje1_ylva_default":            vec2(rx(400), ry(300)),
  "etasje1_ylva_fra_etasje1_gang":   vec2(rx(700), ry(300)),

  // Vetle soverom
  "etasje1_vetle_default":           vec2(rx(400), ry(300)),
  "etasje1_vetle_fra_etasje1_gang":  vec2(rx(400), ry(500)),

  // Bad
  "etasje1_bad_default":             vec2(rx(400), ry(300)),
  "etasje1_bad_fra_etasje1_gang":    vec2(rx(700), ry(350)),

  // Hub 2: Stue + korridor + trappehus (2. etasje)
  "etasje2_stue_default":            vec2(rx(350), ry(350)),
  "etasje2_stue_fra_etasje1_gang":   vec2(rx(550), ry(380)),
  "etasje2_stue_fra_etasje2_mamma":  vec2(rx(500), ry(100)),
  "etasje2_stue_fra_etasje2_kjokken": vec2(rx(150), ry(100)),

  // Mamma soverom
  "etasje2_mamma_default":           vec2(rx(400), ry(300)),
  "etasje2_mamma_fra_etasje2_stue":  vec2(rx(400), ry(500)),

  // Kjøkken
  "etasje2_kjokken_default":         vec2(rx(400), ry(300)),
  "etasje2_kjokken_fra_etasje2_stue": vec2(rx(400), ry(500)),

  // Gata (uforandret — utenfor huset)
  "gata_default":                    vec2(195, 388),  // Rett foran inngangsdøren til hus 1
};

// ────────────────────────────────────────────────────────────
// HJELPEFUNKSJONER (delt mellom scener)
// ────────────────────────────────────────────────────────────

/**
 * Lager en grå vegg med kollisjon.
 * TODO: replace with sprite("wall") / sprite("floor") when pixel art is ready
 */
function makeWall(x, y, w, h, col) {
  col = col || [240, 235, 225];  // Krem — ligner vegg-ansikt fra tileset
  return add([
    rect(w, h),
    pos(x, y),
    color(...col),
    area(),
    body({ isStatic: true, gravityScale: 0 }),
    "wall",
  ]);
}

/**
 * Lager en dekorativ gjenstand (gulv-element / møbel uten kollisjon).
 */
function makeDeco(x, y, w, h, col) {
  return add([
    rect(w, h),
    pos(x, y),
    color(...col),
  ]);
}

/**
 * Lager en dekorativ gjenstand med sprite fra tileset.
 * sc: uniform skaleringsfaktor (standard 1 = native størrelse).
 */
function makeSpriteDeco(x, y, spriteName, sc) {
  sc = sc || 1;
  return add([
    sprite(spriteName),
    pos(x, y),
    scale(sc),
    z(1),
  ]);
}

/**
 * Lager en dør-åpning med visuell markering og kollisjonssone.
 * tag: brukes som kollisjonsnavn (f.eks. "door_etasje1_gang")
 * label: tekst som vises i døråpningen (f.eks. "Gang →")
 */
function makeDoorway(x, y, w, h, tag, label) {
  // Mørk åpning — tydelig «hull i veggen»
  add([ rect(w, h), pos(x, y), color(30, 20, 10), opacity(0.85), z(-1) ]);

  // Lyse karmstriper langs sidene for dybde-effekt
  var trim = 3;
  add([ rect(trim, h), pos(x, y), color(160, 120, 70), z(0) ]);                // Venstre karm
  add([ rect(trim, h), pos(x + w - trim, y), color(160, 120, 70), z(0) ]);      // Høyre karm

  // Pulserende pil-indikator over døråpningen
  var arrow = add([
    text("▼", { size: 18 }),
    pos(x + w / 2, y - 14),
    anchor("center"),
    color(255, 220, 80),
    z(15),
  ]);
  // Bobb opp og ned
  arrow.onUpdate(() => {
    arrow.pos.y = y - 14 + Math.sin(time() * 3) * 4;
  });

  // Label med mørk bakgrunn for kontrast
  var labelW = label.length * 8 + 12;
  var labelH = 18;
  add([ rect(labelW, labelH, { radius: 4 }), pos(x + w / 2, y - 30),
        anchor("center"), color(0, 0, 0), opacity(0.6), z(14) ]);
  add([ text(label, { size: 12 }), pos(x + w / 2, y - 30),
        anchor("center"), color(255, 255, 255), z(15) ]);

  return add([ rect(w, h), pos(x, y), opacity(0), area(), anchor("topleft"), tag ]);
}

/**
 * Kobler dør-kollisjon med scene-overgang, med cooldown hvis spilleren
 * nettopp ankom fra den aktuelle scenen.
 */
function onDoor(player, tag, targetScene, fra, currentFra) {
  var ready = (currentFra === targetScene) ? false : true;
  if (!ready) wait(1, function() { ready = true; });
  player.onCollide(tag, function() {
    if (ready) go(targetScene, { fra: fra });
  });
}

/**
 * Tegner en trapp med synlige trappetrinn og rekkverk.
 * direction: "up" (trinn øverst) eller "down" (trinn nederst).
 * Returnerer kollisjonssonen som et spillobjekt.
 */
function makeStairs(x1, y1, x2, y2, direction, tag) {
  var stepCount = 8;
  var padding = 10;  // Innrykk fra stairwell-veggene
  var sy = y1 + padding;
  var sh = (y2 - y1) - padding * 2;
  var stepW = Math.floor((x2 - x1) / stepCount);

  for (var i = 0; i < stepCount; i++) {
    var sx = x1 + i * stepW;
    // Skygge: mørkere = lavere trinn, lysere = høyere (nærmere neste etasje)
    var shade;
    if (direction === "up") {
      shade = 60 + Math.floor(i * 12);  // Lysere mot høyre (opp)
    } else {
      shade = 60 + Math.floor((stepCount - 1 - i) * 12);  // Mørkere mot høyre (ned)
    }
    add([ rect(stepW - 2, sh), pos(sx, sy), color(shade, shade - 10, shade - 20), z(-5) ]);
    // Trinn-kant (lys stripe på venstre side av hvert trinn)
    add([ rect(2, sh), pos(sx, sy), color(shade + 40, shade + 30, shade + 20), z(-4) ]);
  }

  // Rekkverk (topp og bunn)
  var railH = 4;
  add([ rect(x2 - x1, railH), pos(x1, sy - railH), color(100, 70, 45), z(-3) ]);
  add([ rect(x2 - x1, railH), pos(x1, sy + sh), color(100, 70, 45), z(-3) ]);

  // Kollisjonssone
  return add([
    rect(x2 - x1, y2 - y1), pos(x1, y1), opacity(0),
    area(), anchor("topleft"), tag,
  ]);
}

/**
 * Fyller et rektangulært område med gulvfliser.
 * Hvis prefix er gitt (f.eks. "floor_wood"), brukes kant-varianter
 * (_tl, _t, _tr, _l, _r) langs veggene automatisk.
 * Ellers brukes bare spriteName for alle fliser.
 */
function tileFloor(x1, y1, x2, y2, spriteName, useBorders) {
  var T = 32;
  for (var x = x1; x < x2; x += T) {
    for (var y = y1; y < y2; y += T) {
      var tile = spriteName;
      if (useBorders) {
        var isTop = (y === y1);
        var isLeft = (x === x1);
        var isRight = (x + T >= x2);
        if (isTop && isLeft)       tile = spriteName + "_tl";
        else if (isTop && isRight) tile = spriteName + "_tr";
        else if (isTop)            tile = spriteName + "_t";
        else if (isLeft)           tile = spriteName + "_l";
        else if (isRight)          tile = spriteName + "_r";
      }
      add([sprite(tile), pos(x, y), z(-10)]);
    }
  }
}

/**
 * Viser en midlertidig tekst-melding midt på skjermen.
 * Teksten forsvinner automatisk etter `duration` sekunder.
 * Bruker fixed() slik at den ikke påvirkes av kameraet.
 */
function showMessage(msg, duration) {
  duration = duration || 3;

  // Fjern evt. eksisterende melding for å unngå opphoping
  get("tempMsg").forEach(destroy);

  const label = add([
    text(msg, { size: 22, align: "center" }),
    pos(center().add(0, 120)),
    anchor("center"),
    fixed(),
    color(255, 245, 200),
    z(100),
    "tempMsg",
  ]);

  wait(duration, () => {
    if (label.exists()) destroy(label);
  });

  return label;
}

/**
 * Legger til en gjemt Lussi i et rom med proximity-trigger og rømningsanimasjon.
 * roomKey:      nøkkel i roomsSearched (f.eks. "etasje1_ylva")
 * hidePos:      {x, y} der Lussi gjemmer seg (bak møbel)
 * indicatorPos: {x, y} der "?" vises (nær møbelkant)
 * doorTarget:   {x, y} der Lussi løper til (dør-posisjon)
 * player:       spillerobjektet
 * triggerDist:  avstand for proximity-trigger (standard 60)
 */
function addRoomLussi(roomKey, hidePos, indicatorPos, doorTarget, player, triggerDist) {
  if (roomsSearched[roomKey]) return;

  triggerDist = triggerDist || 60;

  // Lussi — gjemt bak møbel (z=0, møbler er z=1)
  var lussi = add([
    sprite("lussi"),
    pos(hidePos.x, hidePos.y),
    scale(1.5),
    anchor("center"),
    z(0),
    "roomLussi",
  ]);
  lussi.play("idle");
  lussi.flipX = (doorTarget.x < hidePos.x);

  // "?" indikator — synlig over møbler (z=2)
  var baseY = indicatorPos.y;
  var indicator = add([
    text("?", { size: 18 }),
    pos(indicatorPos.x, indicatorPos.y),
    anchor("center"),
    color(255, 255, 100),
    opacity(0.8),
    z(2),
  ]);
  indicator.onUpdate(function() {
    indicator.pos.y = baseY + Math.sin(time() * 3) * 3;
  });

  // Proximity-trigger
  var triggered = false;
  player.onUpdate(function() {
    if (triggered) return;
    if (player.pos.dist(lussi.pos) < triggerDist) {
      triggered = true;
      roomsSearched[roomKey] = true;

      // Lussi dukker opp
      lussi.z = 10;
      if (indicator.exists()) destroy(indicator);

      // Kort pause før hun stikker av
      wait(0.3, function() {
        lussi.play("run");
        lussi.flipX = (doorTarget.x < lussi.pos.x);
        showMessage("Mjau! Lussi stakk av!", 1.5);

        var speed = 280;
        var moveHandler = lussi.onUpdate(function() {
          var dir = vec2(doorTarget.x, doorTarget.y).sub(lussi.pos);
          if (dir.len() < 12) {
            moveHandler.cancel();
            if (lussi.exists()) destroy(lussi);
            return;
          }
          lussi.move(dir.unit().scale(speed));
        });
      });
    }
  });
}

/**
 * Lager selve spillerfiguren med valgt karakter-sprite.
 */
// Retningsnavn for animasjoner
const DIR_NAMES = ["right", "up", "left", "down"];

function makePlayer(spawnPos) {
  var p = add([
    sprite(selectedCharacter + "_idle_anim"),
    pos(spawnPos),
    scale(2),              // 16x32 → 32x64
    area({ shape: new Rect(vec2(0, 11), 10, 10) }), // Hitbox ved føttene (bunn flukter med visuell bunn)
    body({ gravityScale: 0 }),
    anchor("center"),
    z(10),
    "player",
  ]);
  // Intern state for animasjonsbytte
  p.dirIndex = 3;       // 0=høyre, 1=opp, 2=venstre, 3=ned
  p.isMoving = false;
  p.currentAnim = "";
  p.play("idle_down");
  p.currentAnim = "idle_down";
  return p;
}

/**
 * Kobler tastatur- og mus/touch-kontroller til spillerfiguren.
 * Returnerer en cleanup-funksjon (ikke nødvendig i Kaplay siden
 * scene-bytte rydder opp, men god praksis).
 */
function setupControls(player, followCamera) {
  let touchActive = false;

  onMouseDown(() => { touchActive = true; });
  onMouseRelease(() => { touchActive = false; });

  // Retninger: 0=høyre, 1=opp, 2=venstre, 3=ned
  // Hoved-loop: bevegelse + animasjon + kamerafølging
  onUpdate(() => {
    let moved = false;
    let dx = 0, dy = 0;

    // ── Tastaturkontroll (PC) ──────────────────────────────
    if (isKeyDown("left")  || isKeyDown("a"))  { dx -= PLAYER_SPEED; }
    if (isKeyDown("right") || isKeyDown("d"))  { dx += PLAYER_SPEED; }
    if (isKeyDown("up")    || isKeyDown("w"))  { dy -= PLAYER_SPEED; }
    if (isKeyDown("down")  || isKeyDown("s"))  { dy += PLAYER_SPEED; }

    if (dx !== 0 || dy !== 0) {
      player.move(dx, dy);
      moved = true;
      if (Math.abs(dx) >= Math.abs(dy)) {
        player.dirIndex = dx > 0 ? 0 : 2;
      } else {
        player.dirIndex = dy > 0 ? 3 : 1;
      }
    }

    // ── Mus / Touch-kontroll (iPad / PC) ──────────────────
    if (touchActive && !moved) {
      const worldMouse = toWorld(mousePos());
      const dist = worldMouse.dist(player.pos);
      if (dist > 8) {
        const dir = worldMouse.sub(player.pos).unit();
        player.move(dir.scale(PLAYER_SPEED));
        moved = true;
        if (Math.abs(dir.x) >= Math.abs(dir.y)) {
          player.dirIndex = dir.x > 0 ? 0 : 2;
        } else {
          player.dirIndex = dir.y > 0 ? 3 : 1;
        }
      }
    }

    // ── Animasjonsbytte ──────────────────────────────────
    var dirName = DIR_NAMES[player.dirIndex];
    if (moved) {
      var wantAnim = "run_" + dirName;
      if (player.currentAnim !== wantAnim) {
        player.use(sprite(selectedCharacter + "_run"));
        player.play(wantAnim);
        player.currentAnim = wantAnim;
        player.isMoving = true;
      }
    } else {
      var wantIdle = "idle_" + dirName;
      if (player.currentAnim !== wantIdle) {
        player.use(sprite(selectedCharacter + "_idle_anim"));
        player.play(wantIdle);
        player.currentAnim = wantIdle;
        player.isMoving = false;
      }
    }

    // ── Kamera ────────────────────────────────────────────
    if (followCamera) camPos(player.pos);
    else camPos(vec2(400, 300));
  });
}

// ────────────────────────────────────────────────────────────
// SCENE: etasje1_gang — Gang, yttergang og trappehus (1. etasje hub)
// Dører til: Bad, Vetle soverom, Ylva soverom, Gata, Trapp opp
// ────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════
// 1. ETASJE — INDIVIDUELLE ROM-SCENER
// ═══════════════════════════════════════════════════════════

scene("etasje1_gang", (args) => {
  args = args || {};
  var fra = args.fra || "";

  var spawnPos = SPAWNS["etasje1_gang_fra_" + fra] || SPAWNS.etasje1_gang_default;

  // ── Gulv + yttervegger ──────────────────────────────────────
  makeRoomShell("floor_wood_dark");
  // Trappehus (høyre side, litt mørkere)
  tileFloor(rx(520), ry(80), rx(776), ry(360), "floor_wood_dark");

  // ── Trappehus-vegger ────────────────────────────────────────
  makeWall(rx(520), ry(72),  rw(256), rh(16));   // Topp-vegg
  makeWall(rx(520), ry(352), rw(256), rh(16));   // Bunn-vegg

  // ── Dører ───────────────────────────────────────────────────
  makeDoorway(ROOM_OX, ry(60), WALL_T, rh(80), "door_etasje1_bad", "Bad");
  makeDoorway(ROOM_OX, ry(280), WALL_T, rh(80), "door_etasje1_ylva", "Ylva");
  makeDoorway(rx(250), ROOM_OY, rw(80), WALL_T, "door_etasje1_vetle", "Vetle");
  makeDoorway(ROOM_OX + ROOM_W - WALL_T, ry(440), WALL_T, rh(80), "door_gata", "Ut →");

  // ── Trapp opp (øvre halvdel av trappehus) ───────────────────
  makeStairs(rx(520), ry(88), rx(776), ry(216), "up", "stairs_up");
  add([ text("Opp ▲", { size: 14 }), pos(rx(648), ry(152)),
        anchor("center"), color(200, 230, 255), z(1) ]);
  add([ text("Repos", { size: 10 }), pos(rx(648), ry(290)),
        anchor("center"), color(120, 110, 100), opacity(0.4) ]);

  // ── Rom-etiketter ───────────────────────────────────────────
  add([ text("Gang", { size: 12 }), pos(rx(300), ry(400)), anchor("center"),
        color(120, 110, 100), opacity(0.4) ]);
  add([ text("Trapp", { size: 11 }), pos(rx(648), ry(210)), anchor("center"),
        color(120, 110, 100), opacity(0.4) ]);

  // ── Spillerfigur ────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false);

  // ── Kollisjon: dører ────────────────────────────────────────
  onDoor(player, "door_etasje1_bad",   "etasje1_bad",   "etasje1_gang", fra);
  onDoor(player, "door_etasje1_ylva",  "etasje1_ylva",  "etasje1_gang", fra);
  onDoor(player, "door_etasje1_vetle", "etasje1_vetle", "etasje1_gang", fra);
  onDoor(player, "stairs_up",          "etasje2_stue",  "etasje1_gang", fra);

  // ── Ytterdør — sperret til alle rom er sjekket ─────────────
  var gataReady = (fra === "gata") ? false : true;
  if (!gataReady) wait(1, function() { gataReady = true; });

  if (allRoomsSearched()) {
    wait(0.5, function() {
      showMessage("Kanskje Lussi har gått ut?", 3);
      play("lyd_gaat_ut");
    });
  }

  player.onCollide("door_gata", function() {
    if (!gataReady) return;
    if (allRoomsSearched()) {
      go("gata", { fra: "etasje1_gang" });
    } else {
      showMessage("Kanskje Lussi har gjemt seg\ni ett av rommene?", 3);
      play("lyd_lussi_gjemt_inne");
    }
  });

  // ── UI ──────────────────────────────────────────────────────
  var searched = Object.values(roomsSearched).filter(function(v) { return v; }).length;
  add([ text("Rom: " + searched + "/5", { size: 13 }), pos(780, 10), fixed(),
        anchor("topright"), color(255, 255, 100), opacity(0.7), z(50) ]);
  add([ text("1. Etasje — Gang", { size: 14 }), pos(10, 10), fixed(),
        color(200, 200, 200), opacity(0.6), z(50) ]);
});

// ────────────────────────────────────────────────────────────
// SCENE: etasje1_ylva — Ylva sitt soverom
// ────────────────────────────────────────────────────────────

scene("etasje1_ylva", (args) => {
  args = args || {};
  var fra = args.fra || "";
  var spawnPos = SPAWNS["etasje1_ylva_fra_" + fra] || SPAWNS.etasje1_ylva_default;

  // ── Gulv og vegger ──────────────────────────────────────────
  makeRoomShell("floor_wood");

  // ── Dør til gang (høyre vegg) ───────────────────────────────
  makeDoorway(ROOM_OX + ROOM_W - WALL_T, ry(260), WALL_T, rh(80), "door_etasje1_gang", "Gang →");

  // ── Møbler ──────────────────────────────────────────────────
  makeSpriteDeco(rx(550), ry(220), "si_bed_single", 3); // Seng (16×48 → 48×144)
  makeSpriteDeco(rx(30),  ry(380), "si_wardrobe",   3); // Garderobe (16×48 → 48×144)
  makeSpriteDeco(rx(30),  ry(20),  "computer_desk", 2); // PC-pult — atlas
  makeSpriteDeco(rx(350), ry(25),  "bookshelf_books",2); // Bokhylle — atlas (64×64 → 128×128)

  // ── Spillerfigur ────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false);

  // ── Lussi gjemmer seg bak bokhyllen ────────────────────────
  addRoomLussi("etasje1_ylva",
    { x: rx(390), y: ry(80) },   // Bak bokhyllen
    { x: rx(420), y: ry(20) },   // "?" over bokhyllen
    { x: ROOM_OX + ROOM_W, y: ry(300) },  // Løper til døren (høyre vegg)
    player);

  // ── Kollisjon ───────────────────────────────────────────────
  onDoor(player, "door_etasje1_gang", "etasje1_gang", "etasje1_ylva", fra);

  // ── UI ──────────────────────────────────────────────────────
  add([ text("Ylva sitt soverom", { size: 14 }), pos(10, 10), fixed(),
        color(200, 200, 200), opacity(0.6), z(50) ]);
});

// ────────────────────────────────────────────────────────────
// SCENE: etasje1_vetle — Vetle sitt soverom
// ────────────────────────────────────────────────────────────

scene("etasje1_vetle", (args) => {
  args = args || {};
  var fra = args.fra || "";
  var spawnPos = SPAWNS["etasje1_vetle_fra_" + fra] || SPAWNS.etasje1_vetle_default;

  // ── Gulv og vegger ──────────────────────────────────────────
  makeRoomShell("floor_wood");

  // ── Dør til gang (bunn vegg) ────────────────────────────────
  makeDoorway(rx(360), ROOM_OY + ROOM_H - WALL_T, rw(80), WALL_T, "door_etasje1_gang", "Gang ↓");

  // ── Møbler ──────────────────────────────────────────────────
  makeSpriteDeco(rx(575), ry(50),  "si_bed_single",  3); // Seng (16×48 → 48×144)
  makeSpriteDeco(rx(50),  ry(50),  "computer_desk",  2); // Skrivebord — atlas
  makeSpriteDeco(rx(50),  ry(380), "bookshelf_books",2); // Bokhylle — atlas (64×64 → 128×128)
  makeSpriteDeco(rx(350), ry(50),  "si_wardrobe",    3); // Garderobe (16×48 → 48×144)

  // ── Spillerfigur ────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false);

  // ── Lussi gjemmer seg bak garderoben ───────────────────────
  addRoomLussi("etasje1_vetle",
    { x: rx(370), y: ry(100) },  // Bak garderoben
    { x: rx(400), y: ry(45) },   // "?" over garderoben
    { x: rx(400), y: ROOM_OY + ROOM_H + 10 },  // Løper til døren (bunn vegg)
    player);

  // ── Kollisjon ───────────────────────────────────────────────
  onDoor(player, "door_etasje1_gang", "etasje1_gang", "etasje1_vetle", fra);

  // ── UI ──────────────────────────────────────────────────────
  add([ text("Vetle sitt soverom", { size: 14 }), pos(10, 10), fixed(),
        color(200, 200, 200), opacity(0.6), z(50) ]);
});

// ────────────────────────────────────────────────────────────
// SCENE: etasje1_bad — Baderom
// ────────────────────────────────────────────────────────────

scene("etasje1_bad", (args) => {
  args = args || {};
  var fra = args.fra || "";
  var spawnPos = SPAWNS["etasje1_bad_fra_" + fra] || SPAWNS.etasje1_bad_default;

  // ── Gulv og vegger ──────────────────────────────────────────
  makeRoomShell("floor_bath");

  // ── Dør til gang (høyre vegg) ───────────────────────────────
  makeDoorway(ROOM_OX + ROOM_W - WALL_T, ry(300), WALL_T, rh(80), "door_etasje1_gang", "Gang →");

  // ── Møbler ──────────────────────────────────────────────────
  makeSpriteDeco(rx(50),  ry(50),  "si_bathtub", 4).play("splash"); // Badekar — animert
  makeSpriteDeco(rx(595), ry(50),  "si_sink",    2); // Vask (32×48 → 64×96)
  makeSpriteDeco(rx(590), ry(340), "si_toilet",  3); // Toalett (16×48 → 48×144)
  makeSpriteDeco(rx(50),  ry(340), "si_washer",  2); // Vaskemaskin (32×48 → 64×96)

  // ── Spillerfigur ────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false);

  // ── Lussi gjemmer seg bak badekaret ────────────────────────
  addRoomLussi("etasje1_bad",
    { x: rx(80), y: ry(100) },   // Bak badekaret
    { x: rx(110), y: ry(45) },   // "?" over badekaret
    { x: ROOM_OX + ROOM_W, y: ry(340) },  // Løper til døren (høyre vegg)
    player);

  // ── Kollisjon ───────────────────────────────────────────────
  onDoor(player, "door_etasje1_gang", "etasje1_gang", "etasje1_bad", fra);

  // ── UI ──────────────────────────────────────────────────────
  add([ text("Bad", { size: 14 }), pos(10, 10), fixed(),
        color(200, 200, 200), opacity(0.6), z(50) ]);
});

// ═══════════════════════════════════════════════════════════
// 2. ETASJE — INDIVIDUELLE ROM-SCENER
// ═══════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────
// SCENE: etasje2_stue — Stue, korridor og trappehus (2. etasje hub)
// Dører til: Kjøkken, Mamma soverom, Trapp ned
// ────────────────────────────────────────────────────────────

scene("etasje2_stue", (args) => {
  args = args || {};
  var fra = args.fra || "";
  var spawnPos = SPAWNS["etasje2_stue_fra_" + fra] || SPAWNS.etasje2_stue_default;

  // ── Gulv + yttervegger ──────────────────────────────────────
  makeRoomShell("floor_wood");
  // Trappehus (høyre side)
  tileFloor(rx(520), ry(200), rx(776), ry(440), "floor_wood_dark");

  // ── Trappehus-vegger ────────────────────────────────────────
  makeWall(rx(520), ry(192), rw(256), rh(16));   // Topp-vegg
  makeWall(rx(520), ry(432), rw(256), rh(16));   // Bunn-vegg

  // ── Dører ───────────────────────────────────────────────────
  makeDoorway(rx(100), ROOM_OY, rw(80), WALL_T, "door_etasje2_kjokken", "Kjøkken");
  makeDoorway(rx(400), ROOM_OY, rw(80), WALL_T, "door_etasje2_mamma", "Mamma");

  // ── Trapp ned (nedre halvdel av trappehus) ──────────────────
  makeStairs(rx(520), ry(316), rx(776), ry(432), "down", "stairs_down");
  add([ text("Ned ▼", { size: 14 }), pos(rx(648), ry(374)),
        anchor("center"), color(200, 230, 255), z(1) ]);
  add([ text("Repos", { size: 10 }), pos(rx(648), ry(256)),
        anchor("center"), color(120, 110, 100), opacity(0.4) ]);

  // ── Møbler ──────────────────────────────────────────────────
  makeSpriteDeco(rx(30),  ry(100), "bookshelf_books",  2  ); // Bokhylle — atlas (64×64 → 128×128)
  makeSpriteDeco(rx(80),  ry(450), "si_sofa",        3  ); // Sofa (32×32 → 96×96)
  makeSpriteDeco(rx(150), ry(300), "si_coffee_table",2  ); // Sofabord (32×48 → 64×96)
  makeSpriteDeco(rx(280), ry(180), "si_dining_table",3  ); // Spisebord (32×32 → 96×96)

  // ── Rom-etiketter ───────────────────────────────────────────
  add([ text("Stue", { size: 12 }), pos(rx(300), ry(300)), anchor("center"),
        color(120, 110, 100), opacity(0.4) ]);
  add([ text("Trapp", { size: 11 }), pos(rx(648), ry(256)), anchor("center"),
        color(120, 110, 100), opacity(0.4) ]);

  // ── Spillerfigur ────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false);

  // ── Lussi gjemmer seg under spisebordet ────────────────────
  addRoomLussi("etasje2_stue",
    { x: rx(310), y: ry(220) },  // Under spisebordet
    { x: rx(340), y: ry(175) },  // "?" over bordet
    { x: rx(440), y: ROOM_OY },  // Løper til Mammas dør (topp vegg)
    player);

  // ── Kollisjon: dører ────────────────────────────────────────
  onDoor(player, "door_etasje2_mamma",   "etasje2_mamma",   "etasje2_stue", fra);
  onDoor(player, "stairs_down",           "etasje1_gang",    "etasje2_stue", fra);

  // ── UI ──────────────────────────────────────────────────────
  add([ text("2. Etasje — Stue", { size: 14 }), pos(10, 10), fixed(),
        color(200, 200, 200), opacity(0.6), z(50) ]);
});

// ────────────────────────────────────────────────────────────
// SCENE: etasje2_mamma — Mamma sitt soverom
// ────────────────────────────────────────────────────────────

scene("etasje2_mamma", (args) => {
  args = args || {};
  var fra = args.fra || "";
  var spawnPos = SPAWNS["etasje2_mamma_fra_" + fra] || SPAWNS.etasje2_mamma_default;

  // ── Gulv og vegger ──────────────────────────────────────────
  makeRoomShell("floor_wood");

  // ── Dør til stue (bunn vegg) ────────────────────────────────
  makeDoorway(rx(360), ROOM_OY + ROOM_H - WALL_T, rw(80), WALL_T, "door_etasje2_stue", "Stue ↓");

  // ── Møbler ──────────────────────────────────────────────────
  makeSpriteDeco(rx(490), ry(50),  "si_bed",      3); // Seng (32×48 → 96×144)
  makeSpriteDeco(rx(50),  ry(50),  "si_dresser",  3); // Kommode (32×32 → 96×96)
  makeSpriteDeco(rx(50),  ry(350), "si_wardrobe", 3); // Garderobe (16×48 → 48×144)

  // ── Spillerfigur ────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false);

  // ── Lussi gjemmer seg under sengen ─────────────────────────
  addRoomLussi("etasje2_mamma",
    { x: rx(520), y: ry(120) },  // Under sengen
    { x: rx(550), y: ry(45) },   // "?" over sengen
    { x: rx(400), y: ROOM_OY + ROOM_H + 10 },  // Løper til døren (bunn vegg)
    player);

  // ── Kollisjon ───────────────────────────────────────────────
  onDoor(player, "door_etasje2_stue", "etasje2_stue", "etasje2_mamma", fra);

  // ── UI ──────────────────────────────────────────────────────
  add([ text("Mamma sitt soverom", { size: 14 }), pos(10, 10), fixed(),
        color(200, 200, 200), opacity(0.6), z(50) ]);
});

// ────────────────────────────────────────────────────────────
// SCENE: etasje2_kjokken — Kjøkken
// ────────────────────────────────────────────────────────────

scene("etasje2_kjokken", (args) => {
  args = args || {};
  var fra = args.fra || "";
  var spawnPos = SPAWNS["etasje2_kjokken_fra_" + fra] || SPAWNS.etasje2_kjokken_default;

  // ── Gulv og vegger ──────────────────────────────────────────
  makeRoomShell("floor_wood");

  // ── Dør til stue (bunn vegg) ────────────────────────────────
  makeDoorway(rx(360), ROOM_OY + ROOM_H - WALL_T, rw(80), WALL_T, "door_etasje2_stue", "Stue ↓");

  // ── Møbler ──────────────────────────────────────────────────
  makeDeco(rx(736), ry(24),  rw(40),  rh(552), [80, 60, 40]);    // Benk langs høyre vegg
  makeSpriteDeco(rx(50),  ry(80),  "si_kitchen_table", 2); // Kjøkkenbord (32×48 → 64×96)
  makeSpriteDeco(rx(50),  ry(400), "fridge",            2); // Kjøleskap — atlas
  makeDeco(rx(300), ry(30),  rw(160), rh(40),  [80, 60, 40]);    // Benk langs toppvegg

  // ── Mat-skål (ved bordet) ───────────────────────────────────
  // Visuell skål
  add([ circle(14), pos(rx(260), ry(140)), color(50, 100, 220),
        anchor("center") ]);
  add([ text("(matskål)", { size: 12 }), pos(rx(260), ry(162)),
        anchor("center"), color(80, 80, 180), opacity(0.7) ]);
  // Skålens posisjon for avstandssjekk
  var bowlPos = vec2(rx(260), ry(140));

  // ── Spillerfigur ────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false);

  // ── Nærhet til matskålen (avstandsbasert trigger) ──────────
  var bowlMsgShown = false;
  var bowlVoicePlayed = false;
  var BOWL_RANGE = 60;
  player.onUpdate(function() {
    if (player.pos.dist(bowlPos) < BOWL_RANGE && !bowlMsgShown) {
      bowlMsgShown = true;
      showMessage("Matskålen er full...\nLussi har ikke spist på lenge!", 3);
      if (!bowlVoicePlayed) {
        play("lyd_matskaal");
        bowlVoicePlayed = true;
      }
      wait(4, function() { bowlMsgShown = false; });
    }
  });
  onDoor(player, "door_etasje2_stue", "etasje2_stue", "etasje2_kjokken", fra);

  // ── UI ──────────────────────────────────────────────────────
  add([ text("Kjøkken", { size: 14 }), pos(10, 10), fixed(),
        color(200, 200, 200), opacity(0.6), z(50) ]);
});

// ────────────────────────────────────────────────────────────
// SCENE: gata — Utenfor huset
// ────────────────────────────────────────────────────────────

scene("gata", (args) => {
  args = args || {};

  const spawnPos = SPAWNS.gata_default;

  // ── Bakgrunn ──────────────────────────────────────────────
  makeDeco(-25,   0, 1225, 800, [75, 145, 65]);   // Grønt gress — nøyaktig fra venstre til høyre barriere
  makeDeco(-25, 380, 1225,  80, [110, 100, 88]);  // Grå vei

  // ── Usynlige grensevegger ─────────────────────────────────
  for (const [x, y, w, h] of [[-57,0,32,800],[1200,0,32,800],[-25,-32,1225,32],[-25,800,1225,32]]) {
    add([ rect(w, h), pos(x, y), opacity(0), area(), body({ isStatic: true, gravityScale: 0 }), "wall" ]);
  }

  // ── Hus ───────────────────────────────────────────────────
  makeSpriteDeco(0,   0, "me_house",    1.5); // Spillerens hus  (192×256 → 288×384)
  makeSpriteDeco(440, 0, "me_house_nb2",1.5); // Nabohus, midt   (160×240 → 240×360)
  makeSpriteDeco(790, 0, "me_house_nb", 1.5); // Nabohus, høyre  (256×224 → 384×336)

  // ── Usynlige kollisjonsvegger rundt hus ──────────────────
  function addWall(x, y, w, h) {
    add([rect(w, h), pos(x, y), opacity(0), area(), body({ isStatic: true, gravityScale: 0 }), "wall"]);
  }
  // Hus 1 (x=0–288, y=0–384) — døråpning ved x=160–230 (matcher door-trigger)
  addWall(  0, 372, 160, 15);  // Bunn, venstre for dør
  addWall(230, 372,  58, 15);  // Bunn, høyre for dør
  addWall(278,   0,  10, 372); // Høyre side
  // Hus 2 (x=440–680, y=0–360)
  addWall(440, 348, 240, 15);  // Bunn
  addWall(440,   0,  10, 348); // Venstre side
  addWall(670,   0,  10, 348); // Høyre side
  // Hus 3 (x=790–1174, y=0–336)
  addWall(790, 324, 384, 15);  // Bunn
  addWall(790,   0,  10, 324); // Venstre side
  addWall(1164,  0,  10, 324); // Høyre side

  // ── Sprite-hindringer ─────────────────────────────────────
  function makeObstacle(x, y, name, sc) {
    add([ sprite(name), pos(x, y), scale(sc),
          area(), body({ isStatic: true, gravityScale: 0 }), z(2), "wall" ]);
  }
  // Trær kun i gapene mellom husene (ikke oppå husene)
  // Gap1: x=288–440 | Gap2: x=680–790
  makeObstacle(299, 255, "me_tree_sm", 2); // 32×48 → 64×96 — mellom hus 1 og 2
  makeObstacle(690, 265, "me_tree_sm", 2); // 32×48 → 64×96 — mellom hus 2 og 3

  // Trampoline i hagen mellom hus 1 og 2
  makeSpriteDeco(307, 50, "me_trampoline", 1.5); // 48×80 → 72×120

  // Busker langs nedre kant (under veien — ingen kollisjon)
  makeSpriteDeco(150, 625, "me_bush_lg", 4);
  makeSpriteDeco(440, 635, "me_bush_sm", 5);
  makeSpriteDeco(675, 625, "me_bush_lg", 4);
  makeSpriteDeco(925, 635, "me_bush_sm", 5);

  // ── Potespor fra inngangsdøren og bort til busken der Lussi gjemmer seg ──
  const pawsGata = [
    [130, 388], [133, 398], [138, 409],          // Fra trappa ned til gata
    [155, 420], [210, 428], [295, 432],           // Bortover veien mot høyre
    [390, 433], [490, 432], [590, 430],
    [690, 432], [795, 438], [890, 448],           // Videre langs veien
    [960, 460], [990, 478], [1005, 498],          // Sving ned mot gresset
    [1010, 528], [1012, 560], [1010, 595], [1003, 630], [1001, 658], // Ned til busken
  ];
  for (const [px, py] of pawsGata) {
    add([ circle(4), pos(px, py), color(101, 67, 33) ]);
  }

  // ── Lussi (katten — gjemmer seg bak busken til høyre) ─────
  const lussi = add([
    sprite("lussi"),
    pos(1005, 675),
    scale(2),
    area({ shape: new Rect(vec2(4, 4), 24, 24) }),
    anchor("center"),
    z(0),          // Under busken (z=1) — skjult til hun stikker av
    "lussi",
  ]);
  lussi.play("idle");
  lussi.currentAnim = "idle";
  lussi.flipX = true;   // Vendt mot venstre (mot spilleren)

  // ── Jakt-mekanikk: Lussi stikker av minst 5 ganger ─────────
  let lussiEscapes = 0;
  const LUSSI_ESCAPES_NEEDED = 5;
  let lussiRunning = false;
  let lussiCatchable = false;
  let lussiCooldown = false;

  // Gyldige fluktsteder — veien (y~400-460) og nedre gress (y~480-700), unngår alle hus
  const escapeSpots = [
    vec2(200, 420), vec2(370, 415), vec2(560, 430), vec2(750, 420), vec2(1000, 430),
    vec2(110, 510), vec2(310, 530), vec2(560, 510), vec2(760, 525), vec2(1050, 500),
    vec2(200, 640), vec2(480, 625), vec2(710, 645), vec2(940, 630),
  ];

  // Spørsmålstegn / utropstegn over Lussi
  const lussiIndicator = add([
    text("?", { size: 20 }),
    pos(lussi.pos.x, lussi.pos.y - 28),
    anchor("center"),
    color(255, 255, 100),
    opacity(0.8),
    z(11),
  ]);

  // Teller-UI: viser hvor mange ganger Lussi har stukket av
  const escapeCounter = add([
    text("", { size: 13 }),
    pos(10, 50),
    fixed(),
    color(255, 200, 100),
    opacity(0.9),
    z(50),
  ]);

  function updateEscapeUI() {
    if (lussiCatchable) {
      escapeCounter.text = "Lussi er sliten! Fang henne!";
      lussiIndicator.text = "!";
      lussiIndicator.color = rgb(100, 255, 100);
    } else {
      var hearts = "";
      for (var i = 0; i < LUSSI_ESCAPES_NEEDED - lussiEscapes; i++) hearts += "♥";
      escapeCounter.text = "Lussi: " + hearts;
    }
  }
  updateEscapeUI();

  function lussiFleeFrom(playerPos) {
    if (lussiRunning || lussiCooldown) return;
    lussiRunning = true;
    lussiEscapes++;
    lussi.z = 10;  // Kom frem fra gjemmestedet — synlig nå

    // Velg en tilfeldig fluktposisjon blant de beste kandidatene
    var candidates = [];
    for (var i = 0; i < escapeSpots.length; i++) {
      var d = escapeSpots[i].dist(playerPos);
      var fromCurrent = escapeSpots[i].dist(lussi.pos);
      // Ignorer steder som er for nærme nåværende posisjon eller spilleren
      if (fromCurrent < 80) continue;
      if (d < 150) continue;
      candidates.push({ spot: escapeSpots[i], score: d + fromCurrent * 0.5 });
    }
    // Sorter etter score og velg tilfeldig blant topp 5
    candidates.sort(function(a, b) { return b.score - a.score; });
    var topN = candidates.slice(0, Math.min(5, candidates.length));
    var pick = topN.length > 0 ? topN[Math.floor(Math.random() * topN.length)] : candidates[0];
    var bestSpot = pick ? pick.spot : escapeSpots[Math.floor(Math.random() * escapeSpots.length)];

    // Fast fluktretning basert på startposisjon
    var fleeFlip = bestSpot.x < lussi.pos.x;

    // Bytt til løpe-animasjon
    lussi.play("run");
    lussi.currentAnim = "run";
    lussi.flipX = fleeFlip;

    showMessage("Mjau! Lussi stakk av!", 1.5);

    // Flytt Lussi mot målet
    var target = bestSpot;
    var speed = 350;
    var moveUpdate = lussi.onUpdate(() => {
      var dir = target.sub(lussi.pos);
      if (dir.len() < 8) {
        // Ankommet — tilbake til idle
        moveUpdate.cancel();
        lussiRunning = false;
        lussi.play("idle");
        lussi.currentAnim = "idle";

        // Cooldown så Lussi ikke trigges umiddelbart igjen
        lussiCooldown = true;
        wait(1.5, function() { lussiCooldown = false; });

        if (lussiEscapes >= LUSSI_ESCAPES_NEEDED) {
          lussiCatchable = true;
        }
        updateEscapeUI();
        return;
      }
      lussi.move(dir.unit().scale(speed));
      // Kun oppdater flipX basert på den faste fluktretningen (ikke per-frame)
      lussiIndicator.pos = vec2(lussi.pos.x, lussi.pos.y - 28);
    });
  }

  // Oppdater indikator-posisjon kontinuerlig
  lussi.onUpdate(() => {
    lussiIndicator.pos = vec2(lussi.pos.x, lussi.pos.y - 28);
  });

  // ── Dør tilbake til huset (usynlig kollisjonsboks ved inngangen til hus 1) ──
  const doorHjem = add([
    rect(70, 75),
    pos(160, 300),
    color(0, 0, 0),
    opacity(0),
    area(),
    anchor("topleft"),
    "door_etasje1",
  ]);

  // ── Spillerfigur ─────────────────────────────────────────
  const player = makePlayer(spawnPos);
  setupControls(player, true);

  // ── Kameragrenser: aldri vis utenfor barrierer ─────────────
  // Playbar sone: x=-25–1200, y=0–800. Viewport: 800×600.
  // Kamera-senter-grenser: x=[375,800], y=[300,500]
  player.onUpdate(() => {
    setCamPos(vec2(
      Math.max(375, Math.min(800, camPos().x)),
      Math.max(300, Math.min(500, camPos().y))
    ));
  });

  // ── Trampolineffekt: spretter opp/ned + squash-and-stretch ──
  // Trampolinen er på pos(307,50) scale=1.5 → 72×120 → sone x=310–376, y=72–160
  const TRAM_X1 = 310, TRAM_X2 = 376, TRAM_Y1 = 72, TRAM_Y2 = 160;
  let tramPhase = 0;
  let tramActive = false;

  player.onUpdate(() => {
    const onTram = player.pos.x > TRAM_X1 && player.pos.x < TRAM_X2 &&
                   player.pos.y > TRAM_Y1 && player.pos.y < TRAM_Y2;
    if (onTram) {
      const prevPhase = tramPhase;
      tramPhase += dt() * 8;
      // Delta-metode: legger til endringen per bilde — beholder naturlig bevegelse
      const db = Math.abs(Math.sin(tramPhase)) - Math.abs(Math.sin(prevPhase));
      player.pos.y -= db * 20;
      // Squash & stretch: smal+høy øverst, bred+lav nederst
      const b = Math.abs(Math.sin(tramPhase));
      player.scale.x = 2 - b * 0.35;
      player.scale.y = 2 + b * 0.50;
    } else if (tramActive) {
      player.scale = vec2(2, 2);
      tramPhase = 0;
    }
    tramActive = onTram;
  });

  // ── Kollisjon: Lussi — flukt eller fangst! ─────────────────
  player.onCollide("lussi", () => {
    if (lussiRunning || lussiCooldown) return;
    if (lussiCatchable) {
      go("vinn");
    } else {
      lussiFleeFrom(player.pos);
    }
  });

  // Også trigger flukt når spilleren kommer nærme (60px)
  player.onUpdate(() => {
    if (!lussiRunning && !lussiCatchable && !lussiCooldown && lussi.pos.dist(player.pos) < 60) {
      lussiFleeFrom(player.pos);
    }
  });

  // ── Kollisjon: dør hjem ───────────────────────────────────
  player.onCollide("door_etasje1", () => {
    go("etasje1_gang", { fra: "gata" });
  });

  // ── UI: scene-etikett ────────────────────────────────────
  add([
    text("Gata", { size: 14 }),
    pos(10, 10),
    fixed(),
    color(200, 200, 200),
    opacity(0.6),
    z(50),
  ]);

  // Tips-tekst
  add([
    text("Finn Lussi!", { size: 13 }),
    pos(10, 30),
    fixed(),
    color(255, 230, 100),
    opacity(0.8),
    z(50),
  ]);
});

// ────────────────────────────────────────────────────────────
// SCENE: vinn — Vinnerskjerm
// ────────────────────────────────────────────────────────────

scene("vinn", () => {
  // Bakgrunn
  add([
    rect(800, 600),
    pos(0, 0),
    color(20, 40, 80),
    fixed(),
  ]);

  // Stjerner (dekor)
  for (let i = 0; i < 30; i++) {
    add([
      circle(rand(1, 3)),
      pos(rand(0, 800), rand(0, 600)),
      color(255, 255, 200),
      fixed(),
      opacity(rand(0.4, 1.0)),
    ]);
  }

  // Valgt karakter (venstre) — vendt mot Lussi
  const winChar = add([
    sprite(selectedCharacter + "_idle_anim"),
    pos(center().add(-60, -40)),
    scale(3),
    anchor("center"),
    fixed(),
    z(5),
  ]);
  winChar.play("idle_right");
  winChar.onUpdate(() => {
    winChar.pos.y = center().y - 40 + Math.sin(time() * 1.5) * 4;
  });

  // Hjerte mellom dem
  const heart = add([
    text("♥", { size: 28 }),
    pos(center().add(0, -50)),
    anchor("center"),
    color(255, 80, 100),
    fixed(),
    z(6),
  ]);
  heart.onUpdate(() => {
    heart.pos.y = center().y - 50 + Math.sin(time() * 2) * 6;
  });

  // Lussi (høyre) — vendt mot karakteren
  const winLussi = add([
    sprite("lussi"),
    pos(center().add(60, -40)),
    scale(3),
    anchor("center"),
    fixed(),
    z(5),
  ]);
  winLussi.play("idle");
  winLussi.flipX = true;
  winLussi.onUpdate(() => {
    winLussi.pos.y = center().y - 40 + Math.sin(time() * 1.5 + 1) * 4;
  });

  // Hovedtekst
  add([
    text("Du fant Lussi!", { size: 48, align: "center" }),
    pos(center().add(0, 40)),
    anchor("center"),
    color(255, 240, 100),
    fixed(),
    z(10),
  ]);

  // Undertekst
  add([
    text("Barna Ylva og Vetle er så glade!", { size: 20, align: "center" }),
    pos(center().add(0, 100)),
    anchor("center"),
    color(200, 220, 255),
    fixed(),
    z(10),
  ]);

  // Knapp: Spill på nytt
  const knapp = add([
    rect(260, 48),
    pos(center().add(0, 160)),
    color(60, 130, 60),
    anchor("center"),
    area(),
    fixed(),
    z(10),
    "restartKnapp",
  ]);

  add([
    text("Spill på nytt", { size: 22, align: "center" }),
    pos(center().add(0, 160)),
    anchor("center"),
    color(255, 255, 255),
    fixed(),
    z(11),
  ]);

  // Hov-effekt på knappen
  knapp.onHover(() => { knapp.color = rgb(80, 180, 80); });
  knapp.onHoverEnd(() => { knapp.color = rgb(60, 130, 60); });
  knapp.onClick(() => { go("start"); });
});

// ────────────────────────────────────────────────────────────
// SCENE: start — Startskjerm med karaktervalg
// ────────────────────────────────────────────────────────────

scene("start", () => {
  // Bakgrunn
  add([
    rect(800, 600),
    pos(0, 0),
    color(20, 40, 80),
    fixed(),
  ]);

  // Stjerner (dekor)
  for (let i = 0; i < 30; i++) {
    add([
      circle(rand(1, 3)),
      pos(rand(0, 800), rand(0, 600)),
      color(255, 255, 200),
      fixed(),
      opacity(rand(0.4, 1.0)),
    ]);
  }

  // Lussi (katte-sprite med pust-animasjon)
  const lussiStart = add([
    sprite("lussi"),
    pos(center().add(0, -100)),
    scale(3),
    anchor("center"),
    fixed(),
    z(5),
  ]);
  lussiStart.play("idle");
  let breathScale = 1, breathDir = 1;
  lussiStart.onUpdate(() => {
    breathScale += breathDir * 0.3 * dt();
    if (breathScale > 1.08) breathDir = -1;
    if (breathScale < 0.92) breathDir = 1;
    lussiStart.scale = vec2(3 * breathScale);
  });

  // Tittel
  add([
    text("Jakten på Lussi", { size: 42, align: "center" }),
    pos(center().add(0, -30)),
    anchor("center"),
    color(255, 240, 100),
    fixed(),
    z(10),
  ]);

  // Undertekst
  add([
    text("Hvem vil du spille som?", { size: 18, align: "center" }),
    pos(center().add(0, 30)),
    anchor("center"),
    color(200, 220, 255),
    fixed(),
    z(10),
  ]);

  // ── Karaktervalg-knapper ─────────────────────────────────

  // Ylva-knapp
  const ylvaBtn = add([
    rect(180, 64),
    pos(center().add(-110, 100)),
    color(140, 80, 120),
    anchor("center"),
    area(),
    fixed(),
    z(10),
    "ylvaBtn",
  ]);
  const ylvaSprite = add([
    sprite("ylva", { frame: 3 }),
    pos(center().add(-140, 100)),
    scale(2),
    anchor("center"),
    fixed(),
    z(11),
  ]);
  add([
    text("Ylva", { size: 20 }),
    pos(center().add(-90, 100)),
    anchor("center"),
    color(255, 255, 255),
    fixed(),
    z(11),
  ]);

  // Vetle-knapp
  const vetleBtn = add([
    rect(180, 64),
    pos(center().add(110, 100)),
    color(60, 100, 140),
    anchor("center"),
    area(),
    fixed(),
    z(10),
    "vetleBtn",
  ]);
  const vetleSprite = add([
    sprite("vetle", { frame: 3 }),
    pos(center().add(80, 100)),
    scale(2),
    anchor("center"),
    fixed(),
    z(11),
  ]);
  add([
    text("Vetle", { size: 20 }),
    pos(center().add(130, 100)),
    anchor("center"),
    color(255, 255, 255),
    fixed(),
    z(11),
  ]);

  // Hover-effekter
  ylvaBtn.onHover(() => { ylvaBtn.color = rgb(180, 100, 150); });
  ylvaBtn.onHoverEnd(() => { ylvaBtn.color = rgb(140, 80, 120); });
  vetleBtn.onHover(() => { vetleBtn.color = rgb(80, 130, 180); });
  vetleBtn.onHoverEnd(() => { vetleBtn.color = rgb(60, 100, 140); });

  // Klikk-handling
  function startGame(character) {
    selectedCharacter = character;
    resetRoomsSearched();
    if (!bgMusicPlaying) {
      // iOS Safari blokkerer lyd til bruker-interaksjon.
      // Resume Kaplay sin egen AudioContext under dette klikket/tappet.
      try {
        var ctx = audioCtx;
        if (ctx && ctx.state === "suspended") {
          ctx.resume().then(function() {
            play("bgmusic", { loop: true, volume: 0.1 });
          });
        } else {
          play("bgmusic", { loop: true, volume: 0.1 });
        }
      } catch(e) {
        play("bgmusic", { loop: true, volume: 0.1 });
      }
      bgMusicPlaying = true;  
    }
    go("etasje2_kjokken");
  }
  ylvaBtn.onClick(() => { startGame("ylva"); });
  vetleBtn.onClick(() => { startGame("vetle"); });

  // Instruksjoner
  add([
    text("— velg karakter for å starte —", { size: 13, align: "center" }),
    pos(center().add(0, 170)),
    anchor("center"),
    color(160, 160, 200),
    fixed(),
    z(10),
  ]);
});

// ────────────────────────────────────────────────────────────
// START SPILLET
// ────────────────────────────────────────────────────────────

go("start");
