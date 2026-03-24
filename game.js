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

// Møbler fra Interiors-tileset (32x32 per tile, 512x2848)
loadSpriteAtlas(ASSET + "Interiors_free/32x32/Interiors_free_32x32.png", {
  // Senger (øverst i tileset)
  "bed_green":    { x: 32,  y: 0,    width: 64,  height: 96 },  // Grønn seng (2x3)
  "bed_teal":     { x: 160, y: 0,    width: 96,  height: 96 },  // Blågrønn seng m/ramme (3x3)
  // Sofa (rad 72-73, y=2304)
  "sofa":         { x: 32,  y: 2304, width: 96,  height: 64 },  // Sofa (3x2)
  // Bord (rad 10, y=320)
  "table_sm":     { x: 0,   y: 320,  width: 64,  height: 64 },  // Lite bord (2x2)
  // Rug/teppe (rad 14, y=448)
  "rug":          { x: 128, y: 448,  width: 96,  height: 64 },  // Teppe (3x2)
  // Bokhylle (rad 12-13, y=384)
  "bookshelf_sm": { x: 64,  y: 384,  width: 64,  height: 64 },  // Bokhylle (2x2)
  // Garderobe/skap (rad 57-58, y=1824)
  "wardrobe":     { x: 0,   y: 1824, width: 64,  height: 64 },  // Garderobe
  // Kommode (rad 10, y=320)
  "dresser":      { x: 128, y: 320,  width: 64,  height: 32 },  // Kommode/benk
});

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

// ────────────────────────────────────────────────────────────
// KONSTANTER
// ────────────────────────────────────────────────────────────

const PLAYER_SPEED = 200;
let bgMusicPlaying = false;

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
  "gata_default":                    vec2(120, 480),
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
  onDoor(player, "door_gata",          "gata",          "etasje1_gang", fra);
  onDoor(player, "stairs_up",          "etasje2_stue",  "etasje1_gang", fra);

  // ── UI ──────────────────────────────────────────────────────
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
  makeDeco(rx(676), ry(380), rw(100), rh(180), [160, 120, 140]); // Seng
  makeDeco(rx(50),  ry(480), rw(140), rh(70),  [140, 110, 80]);  // Kommode
  makeDeco(rx(50),  ry(50),  rw(120), rh(80),  [120, 100, 80]);  // Skrivebord
  makeDeco(rx(50),  ry(200), rw(80),  rh(100), [100, 80,  60]);  // Bokhylle

  // ── Usynlig "mjau"-sone ─────────────────────────────────────
  add([ rect(rw(120), rh(120)), pos(rx(350), ry(300)), color(0, 0, 0), opacity(0),
        area(), anchor("topleft"), "meow_zone" ]);

  // ── Spillerfigur ────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false);

  // ── Kollisjon ───────────────────────────────────────────────
  var meowTriggered = false;
  player.onCollide("meow_zone", function() {
    if (!meowTriggered) { meowTriggered = true; showMessage("MJAU!", 1); }
  });
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
  makeDeco(rx(676), ry(50),  rw(100), rh(180), [160, 100, 120]); // Seng
  makeDeco(rx(610), ry(60),  rw(60),  rh(60),  [120, 90,  70]);  // Nattbord
  makeDeco(rx(50),  ry(50),  rw(120), rh(80),  [100, 80,  60]);  // Skrivebord
  makeDeco(rx(50),  ry(400), rw(100), rh(120), [80,  80,  200]); // Bokhylle

  // ── Spillerfigur ────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false);

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
  makeDeco(rx(50),  ry(50),  rw(200), rh(90),  [180, 200, 210]); // Badekar
  makeDeco(rx(600), ry(50),  rw(120), rh(70),  [200, 210, 220]); // Vask
  makeDeco(rx(600), ry(350), rw(80),  rh(100), [220, 220, 230]); // Toalett
  makeDeco(rx(50),  ry(350), rw(120), rh(80),  [170, 185, 195]); // Vaskemaskin

  // ── Spillerfigur ────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false);

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
  makeDeco(rx(100), ry(476), rw(360), rh(90), [90, 60, 40]);    // Sofa
  makeDeco(rx(200), ry(340), rw(140), rh(80), [140, 100, 60]);  // Sofabord
  makeDeco(rx(30),  ry(100), rw(100), rh(180), [80, 80, 200]);  // Bokhylle
  makeDeco(rx(520), ry(480), rw(180), rh(80), [140, 100, 60]);  // Spisebord

  // ── Rom-etiketter ───────────────────────────────────────────
  add([ text("Stue", { size: 12 }), pos(rx(300), ry(300)), anchor("center"),
        color(120, 110, 100), opacity(0.4) ]);
  add([ text("Trapp", { size: 11 }), pos(rx(648), ry(256)), anchor("center"),
        color(120, 110, 100), opacity(0.4) ]);

  // ── Spillerfigur ────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false);

  // ── Kollisjon: dører ────────────────────────────────────────
  onDoor(player, "door_etasje2_kjokken", "etasje2_kjokken", "etasje2_stue", fra);
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
  makeDeco(rx(576), ry(50),  rw(200), rh(180), [160, 100, 120]); // Dobbeltseng
  makeDeco(rx(500), ry(50),  rw(70),  rh(80),  [120, 90,  70]);  // Nattbord
  makeDeco(rx(50),  ry(50),  rw(140), rh(80),  [120, 100, 80]);  // Kommode
  makeDeco(rx(50),  ry(350), rw(100), rh(120), [100, 80,  60]);  // Garderobe

  // ── Spillerfigur ────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false);

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
  makeDeco(rx(50),  ry(80),  rw(160), rh(120), [140, 100, 60]);  // Kjøkkenbord
  makeDeco(rx(50),  ry(400), rw(100), rh(120), [200, 200, 210]); // Kjøleskap
  makeDeco(rx(300), ry(30),  rw(160), rh(40),  [80, 60, 40]);    // Benk langs toppvegg

  // ── Mat-skål (ved bordet) ───────────────────────────────────
  add([ circle(14), pos(rx(260), ry(140)), color(50, 100, 220),
        area({ shape: new Rect(vec2(-14, -14), 28, 28) }),
        anchor("center"), "bowl" ]);
  add([ text("(matskål)", { size: 12 }), pos(rx(260), ry(162)),
        anchor("center"), color(80, 80, 180), opacity(0.7) ]);

  // ── Spillerfigur ────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, false);

  // ── Kollisjon ───────────────────────────────────────────────
  var bowlMsgShown = false;
  player.onCollideUpdate("bowl", function() {
    if (!bowlMsgShown) {
      bowlMsgShown = true;
      showMessage("Matskålen er tom...\nLussi har ikke spist på lenge!", 3);
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

  // ── Bakgrunn (gress og vei) ───────────────────────────────
  // TODO: replace with tilemap("outdoor_ground") when pixel art is ready
  makeDeco(0, 0, 1200, 800, [80, 140, 70]);   // Grønt gress
  makeDeco(0, 380, 1200, 80, [120, 110, 100]); // Grå vei midt på

  // ── Husfasade (venstre vegg — kant mot huset) ────────────
  // TODO: replace with sprite("house_facade") when pixel art is ready
  makeWall(0, 0, 32, 800, [130, 120, 110]);

  // ── Hekk/gjerde øverst og nederst ────────────────────────
  // TODO: replace with sprite("hedge") or sprite("fence") when pixel art is ready
  makeWall(32, 0,   1200, 32, [50, 100, 50]);  // Topp-hekk
  makeWall(32, 768, 1200, 32, [50, 100, 50]);  // Bunn-hekk

  // ── Høyregrense ──────────────────────────────────────────
  makeWall(1168, 0, 32, 800, [130, 120, 110]);

  // ── Trær og busker (statiske hindringer) ─────────────────
  // TODO: replace with sprite("tree") or sprite("bush_static") when pixel art is ready
  const treesAndHedges = [
    [200, 50,  60, 80],   // Tre
    [350, 40,  50, 70],   // Tre
    [550, 60,  55, 75],   // Tre
    [750, 45,  60, 80],   // Tre
    [950, 55,  50, 70],   // Tre
    [200, 640, 80, 60],   // Hekk nede
    [400, 650, 100, 50],  // Hekk nede
    [700, 640, 80, 60],   // Hekk nede
    [900, 650, 90, 50],   // Hekk nede
  ];
  for (const [tx, ty, tw, th] of treesAndHedges) {
    makeWall(tx, ty, tw, th, [34, 110, 34]);
  }

  // ── Gastein / søppelkasse (grå dekor) ────────────────────
  // TODO: replace with sprite("bin") when pixel art is ready
  makeWall(400, 410, 40, 40, [100, 100, 110]);
  makeWall(800, 420, 40, 40, [100, 100, 110]);

  // ── Ristende busk (animert) ───────────────────────────────
  // TODO: replace with animated sprite("shaking_bush") when pixel art is ready
  const ristendeBusk = add([
    rect(48, 48),
    pos(600, 290),
    color(34, 139, 34),
    area(),
    anchor("center"),
    rotate(0),
    "busk",
  ]);

  // Enkel vingle-animasjon: roterer frem og tilbake
  let shakeDir = 1;
  ristendeBusk.onUpdate(() => {
    ristendeBusk.angle += shakeDir * 45 * dt();
    if (ristendeBusk.angle >  14) shakeDir = -1;
    if (ristendeBusk.angle < -14) shakeDir =  1;
  });

  // ── Potespor videre i gata ────────────────────────────────
  // TODO: replace with sprite("pawprint") when pixel art is ready
  const pawsGata = [
    [80, 470], [120, 460], [150, 450], [200, 440],
    [270, 430], [340, 420], [420, 415], [500, 410],
    [580, 430], [660, 460], [740, 490], [820, 500],
  ];
  for (const [px, py] of pawsGata) {
    add([
      circle(4),
      pos(px, py),
      color(101, 67, 33),
    ]);
  }

  // ── Lussi (katten — Cat_Grey sprite) ──────────────────────
  const lussi = add([
    sprite("lussi"),
    pos(920, 500),
    scale(2),
    area({ shape: new Rect(vec2(4, 4), 24, 24) }),
    anchor("center"),
    z(10),
    "lussi",
  ]);
  lussi.play("idle");
  lussi.currentAnim = "idle";
  lussi.flipX = true;   // Starter vendt mot venstre (mot spilleren)

  // ── Jakt-mekanikk: Lussi stikker av minst 5 ganger ─────────
  let lussiEscapes = 0;
  const LUSSI_ESCAPES_NEEDED = 5;
  let lussiRunning = false;
  let lussiCatchable = false;
  let lussiCooldown = false;

  // Gyldige fluktsteder (unngår trær, vegger, veien)
  const escapeSpots = [
    vec2(150, 200), vec2(450, 180), vec2(700, 150),
    vec2(1000, 200), vec2(1100, 300), vec2(1050, 550),
    vec2(850, 680), vec2(500, 700), vec2(250, 650),
    vec2(150, 550), vec2(400, 300), vec2(650, 550),
    vec2(900, 350), vec2(300, 550), vec2(550, 500),
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

    // Velg en fluktposisjon langt fra både spilleren og Lussi
    var bestSpot = escapeSpots[0];
    var bestDist = 0;
    for (var i = 0; i < escapeSpots.length; i++) {
      var d = escapeSpots[i].dist(playerPos);
      var fromCurrent = escapeSpots[i].dist(lussi.pos);
      // Ignorer steder som er for nærme nåværende posisjon
      if (fromCurrent < 80) continue;
      var score = d + fromCurrent * 0.5;
      if (score > bestDist) { bestDist = score; bestSpot = escapeSpots[i]; }
    }

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

  // ── Dør tilbake til huset (brun firkant) ──────────────────
  // TODO: replace with sprite("door_back") when pixel art is ready
  const doorHjem = add([
    rect(32, 80),
    pos(32, 440),
    color(101, 67, 33),
    area(),
    anchor("topleft"),
    "door_etasje1",
  ]);
  add([
    text("Inn", { size: 12 }),
    pos(48, 480),
    anchor("center"),
    color(255, 230, 180),
  ]);

  // ── Spillerfigur ─────────────────────────────────────────
  const player = makePlayer(spawnPos);
  setupControls(player, true);

  // ── Kollisjon: ristende busk ──────────────────────────────
  let buskMsgShown = false;
  player.onCollide("busk", () => {
    if (!buskMsgShown) {
      buskMsgShown = true;
      showMessage("Åh, det var bare en fugl!", 3);
      wait(4, () => { buskMsgShown = false; });
    }
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

  // Alternativt: trykk hvilken som helst tast for å starte på nytt
  add([
    text("— eller trykk på hvilken som helst tast —", { size: 13, align: "center" }),
    pos(center().add(0, 210)),
    anchor("center"),
    color(160, 160, 200),
    fixed(),
    z(10),
  ]);

  onKeyPress(() => { go("start"); });
  wait(1, () => {
    onMousePress(() => { go("start"); });
  });
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
    if (!bgMusicPlaying) {
      // iOS Safari blokkerer lyd til bruker-interaksjon.
      // Lag en midlertidig AudioContext og resume den for å varme opp iOS audio.
      try {
        var Ctx = window.AudioContext || window["webkitAudioContext"];
        if (Ctx) {
          var tempCtx = new Ctx();
          tempCtx.resume().then(function() { tempCtx.close(); });
        }
      } catch(e) {}
      play("bgmusic", { loop: true, volume: 0.4 });
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
