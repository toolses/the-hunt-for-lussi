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
  letterbox: true,     // Bevarer aspektforhold på alle skjermstørrelser
  background: [30, 30, 50],
  gravity: 0,          // Top-down spill — ingen gravitasjon
  debug: false,
});

// ────────────────────────────────────────────────────────────
// KONSTANTER
// ────────────────────────────────────────────────────────────

const PLAYER_SPEED = 200;

// Startposisjoner per scene-overgang
const SPAWNS = {
  etasje1_default:    vec2(120, 300),
  etasje1_fra_gata:   vec2(90,  490),   // Nær utgangsdøren
  etasje1_fra_etasje2: vec2(810, 140), // Nær trappen opp
  etasje2_default:    vec2(120, 270),
  gata_default:       vec2(120, 480),   // Utenfor huset
};

// ────────────────────────────────────────────────────────────
// HJELPEFUNKSJONER (delt mellom scener)
// ────────────────────────────────────────────────────────────

/**
 * Lager en grå vegg med kollisjon.
 * TODO: replace with sprite("wall") / sprite("floor") when pixel art is ready
 */
function makeWall(x, y, w, h, col) {
  col = col || [110, 110, 120];
  return add([
    rect(w, h),
    pos(x, y),
    color(...col),
    area(),
    body({ isStatic: true }),
    "wall",
  ]);
}

/**
 * Lager en usynlig dekorativ gjenstand (gulv-element uten kollisjon).
 */
function makeDeco(x, y, w, h, col) {
  return add([
    rect(w, h),
    pos(x, y),
    color(...col),
  ]);
}

/**
 * Viser en midlertidig tekst-melding midt på skjermen.
 * Teksten forsvinner automatisk etter `duration` sekunder.
 * Bruker fixed() slik at den ikke påvirkes av kameraet.
 */
function showMessage(msg, duration) {
  duration = duration || 3;

  // Fjern evt. eksisterende melding for å unngå opphoping
  every("tempMsg", destroy);

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
 * Lager selve spillerfiguren.
 * TODO: replace with sprite("ylva") or sprite("vetle") when pixel art is ready
 */
function makePlayer(spawnPos) {
  return add([
    rect(32, 32),
    pos(spawnPos),
    color(220, 50, 50),    // Rød = spilleren (Ylva/Vetle)
    area({ shape: new Rect(vec2(0), 32, 32) }),
    body(),
    anchor("center"),
    "player",
  ]);
}

/**
 * Kobler tastatur- og mus/touch-kontroller til spillerfiguren.
 * Returnerer en cleanup-funksjon (ikke nødvendig i Kaplay siden
 * scene-bytte rydder opp, men god praksis).
 */
function setupControls(player) {
  let touchActive = false;

  onMouseDown(() => { touchActive = true; });
  onMouseRelease(() => { touchActive = false; });

  // Hoved-loop: bevegelse + kamerafølging
  onUpdate(() => {
    let moved = false;

    // ── Tastaturkontroll (PC) ──────────────────────────────
    if (isKeyDown("left")  || isKeyDown("a"))  { player.move(-PLAYER_SPEED, 0); moved = true; }
    if (isKeyDown("right") || isKeyDown("d"))  { player.move(PLAYER_SPEED,  0); moved = true; }
    if (isKeyDown("up")    || isKeyDown("w"))  { player.move(0, -PLAYER_SPEED); moved = true; }
    if (isKeyDown("down")  || isKeyDown("s"))  { player.move(0,  PLAYER_SPEED); moved = true; }

    // ── Mus / Touch-kontroll (iPad / PC) ──────────────────
    // Spilleren beveger seg jevnt mot der brukeren trykker/holder.
    if (touchActive && !moved) {
      const worldMouse = toWorld(mousePos());
      const dist = worldMouse.dist(player.pos);
      if (dist > 8) {
        const dir = worldMouse.sub(player.pos).unit();
        player.move(dir.scale(PLAYER_SPEED));
      }
    }

    // ── Kamera følger spilleren ────────────────────────────
    camPos(player.pos);
  });
}

// ────────────────────────────────────────────────────────────
// SCENE: etasje1 — Første etasje (startscene)
// ────────────────────────────────────────────────────────────

scene("etasje1", (args) => {
  args = args || {};

  // Bestem startposisjon basert på hvilken scene vi kom fra
  let spawnPos;
  if (args.fra === "gata")    spawnPos = SPAWNS.etasje1_fra_gata;
  else if (args.fra === "etasje2") spawnPos = SPAWNS.etasje1_fra_etasje2;
  else                         spawnPos = SPAWNS.etasje1_default;

  // ── Bakgrunn (gulv) ──────────────────────────────────────
  // TODO: replace with tilemap("house_floor") when pixel art is ready
  makeDeco(32, 32, 836, 636, [210, 190, 160]); // Lyst gulv

  // ── Yttervegg (grense for rommet) ────────────────────────
  // TODO: replace with sprite("house_wall") tiles when pixel art is ready
  makeWall(0,   0,   900, 32);   // Topp
  makeWall(0,   668, 900, 32);   // Bunn
  makeWall(0,   0,   32,  700);  // Venstre
  makeWall(868, 0,   32,  700);  // Høyre

  // ── Innvendig vegg (deler stue og gang) ──────────────────
  // Åpning i veggen mellom x=200 og x=280 (dørpass)
  makeWall(32,  332, 168, 32);   // Venstre del av innvendig vegg
  makeWall(280, 332, 588, 32);   // Høyre del av innvendig vegg

  // ── Møbler / dekor (ingen kollisjon) ─────────────────────
  // TODO: replace with sprite("sofa"), sprite("table") etc. when pixel art is ready
  makeDeco(350, 80,  120, 60,  [90,  60,  40]);   // Brun sofa
  makeDeco(500, 60,  60,  40,  [140, 100, 60]);   // Sofabord
  makeDeco(680, 400, 80,  120, [80,  80,  200]);  // Blå bokhylle

  // ── Potespor (brune sirkler — kun dekor, ingen kollisjon) ─
  // TODO: replace with sprite("pawprint") when pixel art is ready
  const pawPositions = [
    [80, 460], [110, 440], [90, 410], [130, 390],
    [160, 360], [190, 340], [220, 310], [240, 280],
  ];
  for (const [px, py] of pawPositions) {
    add([
      circle(4),
      pos(px, py),
      color(101, 67, 33),  // Brun — gjørmete poteavtrykk
    ]);
  }

  // ── Mat-skål (blå sirkel — interaksjonshint) ─────────────
  // TODO: replace with sprite("food_bowl") when pixel art is ready
  const bowl = add([
    circle(12),
    pos(200, 200),
    color(50, 100, 220),
    area({ shape: new Circle(vec2(0), 12) }),
    anchor("center"),
    "bowl",
  ]);

  // Liten etikett for å hjelpe spilleren
  add([
    text("(matskål)", { size: 11 }),
    pos(200, 218),
    anchor("center"),
    color(80, 80, 180),
    opacity(0.7),
  ]);

  // ── Dør til gata (mørk brun firkant) ─────────────────────
  // TODO: replace with sprite("door_front") when pixel art is ready
  const doorGata = add([
    rect(32, 80),
    pos(0, 450),
    color(101, 67, 33),
    area(),
    anchor("topleft"),
    "door_gata",
  ]);
  add([
    text("Ut", { size: 12 }),
    pos(16, 490),
    anchor("center"),
    color(255, 230, 180),
    fixed(),
  ]);

  // ── Trapp opp (blå firkant) ───────────────────────────────
  // TODO: replace with sprite("stairs_up") when pixel art is ready
  const trappOpp = add([
    rect(68, 50),
    pos(800, 100),
    color(50, 100, 220),
    area(),
    anchor("topleft"),
    "stairs_up",
  ]);
  add([
    text("Opp ▲", { size: 12 }),
    pos(834, 125),
    anchor("center"),
    color(200, 230, 255),
  ]);

  // ── Spillerfigur ─────────────────────────────────────────
  const player = makePlayer(spawnPos);
  setupControls(player);

  // ── Kollisjon: mat-skål ───────────────────────────────────
  let bowlMsgShown = false;
  player.onCollideUpdate("bowl", () => {
    if (!bowlMsgShown) {
      bowlMsgShown = true;
      showMessage("Matskålen er tom...\nLussi har ikke spist på lenge!", 3);
      wait(4, () => { bowlMsgShown = false; }); // Tillat re-trigger etter 4 sek
    }
  });

  // ── Kollisjon: dør ut ────────────────────────────────────
  player.onCollide("door_gata", () => {
    go("gata", { fra: "etasje1" });
  });

  // ── Kollisjon: trapp opp ─────────────────────────────────
  player.onCollide("stairs_up", () => {
    go("etasje2", { fra: "etasje1" });
  });

  // ── UI: scene-etikett ────────────────────────────────────
  add([
    text("1. Etasje", { size: 14 }),
    pos(10, 10),
    fixed(),
    color(200, 200, 200),
    opacity(0.6),
    z(50),
  ]);
});

// ────────────────────────────────────────────────────────────
// SCENE: etasje2 — Andre etasje
// ────────────────────────────────────────────────────────────

scene("etasje2", (args) => {
  args = args || {};

  const spawnPos = SPAWNS.etasje2_default;

  // ── Bakgrunn ─────────────────────────────────────────────
  // TODO: replace with tilemap("house_floor_2") when pixel art is ready
  makeDeco(32, 32, 536, 436, [200, 185, 155]); // Litt mørkere gulv

  // ── Yttervegg ────────────────────────────────────────────
  makeWall(0,   0,   600, 32);   // Topp
  makeWall(0,   468, 600, 32);   // Bunn
  makeWall(0,   0,   32,  500);  // Venstre
  makeWall(568, 0,   32,  500);  // Høyre

  // ── Indre vegg (lager korridor-følelse) ──────────────────
  makeWall(200, 32, 32, 200);

  // ── Dekor / møbler ───────────────────────────────────────
  // TODO: replace with sprite("bed"), sprite("wardrobe") when pixel art is ready
  makeDeco(350, 60,  150, 100, [160, 100, 120]); // Seng
  makeDeco(50,  300, 100, 60,  [140, 110, 80]);  // Kommode

  // ── Trapp ned (blå firkant) ───────────────────────────────
  // TODO: replace with sprite("stairs_down") when pixel art is ready
  const trappNed = add([
    rect(50, 50),
    pos(32, 200),
    color(50, 100, 220),
    area(),
    anchor("topleft"),
    "stairs_down",
  ]);
  add([
    text("Ned ▼", { size: 12 }),
    pos(57, 225),
    anchor("center"),
    color(200, 230, 255),
  ]);

  // ── Usynlig "mjau"-sone ───────────────────────────────────
  // Plassert midt i rommet — en usynlig trigger.
  // TODO: play("meow") when audio asset is ready
  const meowSone = add([
    rect(80, 80),
    pos(300, 230),
    color(0, 0, 0),
    opacity(0),            // Fullstendig usynlig
    area(),
    anchor("topleft"),
    "meow_zone",
  ]);

  // ── Spillerfigur ─────────────────────────────────────────
  const player = makePlayer(spawnPos);
  setupControls(player);

  // ── Kollisjon: mjau-sone (én gang per besøk) ─────────────
  let meowTriggered = false;
  player.onCollide("meow_zone", () => {
    if (!meowTriggered) {
      meowTriggered = true;
      // TODO: play("meow") — legg til lydfil "meow.mp3" og lyd-loading når klar
      showMessage("MJAU!", 1);
    }
  });

  // ── Kollisjon: trapp ned ──────────────────────────────────
  player.onCollide("stairs_down", () => {
    go("etasje1", { fra: "etasje2" });
  });

  // ── UI: scene-etikett ────────────────────────────────────
  add([
    text("2. Etasje", { size: 14 }),
    pos(10, 10),
    fixed(),
    color(200, 200, 200),
    opacity(0.6),
    z(50),
  ]);
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

  // ── Lussi (katten — gul sirkel) ───────────────────────────
  // TODO: replace with animated sprite("lussi") when pixel art is ready
  const lussi = add([
    circle(16),
    pos(920, 500),
    color(255, 220, 0),    // Gul = Lussi
    area({ shape: new Circle(vec2(0), 16) }),
    anchor("center"),
    "lussi",
  ]);

  // Liten "pust"-animasjon for Lussi (skalerer opp/ned)
  let lussiScale = 1;
  let lussiScaleDir = 1;
  lussi.onUpdate(() => {
    lussiScale += lussiScaleDir * 0.3 * dt();
    if (lussiScale > 1.08) lussiScaleDir = -1;
    if (lussiScale < 0.92) lussiScaleDir =  1;
    lussi.scale = vec2(lussiScale);
  });

  // Spørsmålstegn over Lussi — frister spilleren
  add([
    text("?", { size: 20 }),
    pos(920, 476),
    anchor("center"),
    color(255, 255, 100),
    opacity(0.8),
  ]);

  // ── Dør tilbake til huset (brun firkant) ──────────────────
  // TODO: replace with sprite("door_back") when pixel art is ready
  const doorHjem = add([
    rect(32, 80),
    pos(0, 440),
    color(101, 67, 33),
    area(),
    anchor("topleft"),
    "door_etasje1",
  ]);
  add([
    text("Inn", { size: 12 }),
    pos(16, 480),
    anchor("center"),
    color(255, 230, 180),
  ]);

  // ── Spillerfigur ─────────────────────────────────────────
  const player = makePlayer(spawnPos);
  setupControls(player);

  // ── Kollisjon: ristende busk ──────────────────────────────
  let buskMsgShown = false;
  player.onCollide("busk", () => {
    if (!buskMsgShown) {
      buskMsgShown = true;
      showMessage("Åh, det var bare en fugl!", 3);
      wait(4, () => { buskMsgShown = false; });
    }
  });

  // ── Kollisjon: Lussi — VINNER! ────────────────────────────
  player.onCollide("lussi", () => {
    go("vinn");
  });

  // ── Kollisjon: dør hjem ───────────────────────────────────
  player.onCollide("door_etasje1", () => {
    go("etasje1", { fra: "gata" });
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

  // Lussi-representasjon (stor gul sirkel på vinnerskjermen)
  // TODO: replace with large sprite("lussi_happy") when pixel art is ready
  add([
    circle(40),
    pos(center().add(0, -40)),
    color(255, 220, 0),
    anchor("center"),
    fixed(),
  ]);

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
  knapp.onClick(() => { go("etasje1"); });

  // Alternativt: trykk hvilken som helst tast for å starte på nytt
  add([
    text("— eller trykk på hvilken som helst tast —", { size: 13, align: "center" }),
    pos(center().add(0, 210)),
    anchor("center"),
    color(160, 160, 200),
    fixed(),
    z(10),
  ]);

  onKeyPress(() => { go("etasje1"); });
  // Muse-klikk utenfor knappen starter også på nytt (etter litt forsinkelse)
  wait(1, () => {
    onMousePress(() => { go("etasje1"); });
  });
});

// ────────────────────────────────────────────────────────────
// START SPILLET
// ────────────────────────────────────────────────────────────

go("etasje1");
