// ============================================================
// SCENE: nabolag_venn — Naboens gate (neighbour's street)
//
// World: 1200 × 800 px (same dimensions as "gata")
// Two houses in a different arrangement, open central plaza,
// NPC friend Maya, interactive postboxes, a toy ball,
// and a Lussi hiding spot behind the far-right bush.
//
// Linked to "gata" via addTransitionZone on the LEFT edge.
// ============================================================

scene("nabolag_venn", function(args) {
  args = args || {};
  var spawnPos = (args.startPos) ? args.startPos : SPAWNS["nabolag_venn_default"];

  // ── Bakgrunn (litt annen grønnfarge enn gata) ────────────────
  makeDeco(-25,   0, 1225, 800, [62, 128, 52]);   // mørkere gress
  makeDeco(-25, 385, 1225,  75, [105, 95, 80]);   // fortau

  // ── Grensevegger ─────────────────────────────────────────────
  for (var bw of [[-57,0,32,800],[1200,0,32,800],[-25,-32,1225,32],[-25,800,1225,32]]) {
    add([rect(bw[2], bw[3]), pos(bw[0], bw[1]), opacity(0),
         area(), body({ isStatic: true, gravityScale: 0 }), "wall"]);
  }

  // ── Hus (annen rekkefølge/plassering enn gata) ───────────────
  // Hus 1 (blått) — samme fotavtrykk som gata hus 1
  makeSpriteDeco(  0, 0, "me_house_nb",  1.5);
  // Hus 2 (oransje) — plassert til høyre med mer åpen plass mellom
  makeSpriteDeco(660, 0, "me_house_nb2", 1.5);

  // ── Kollisjon rundt hus ───────────────────────────────────────
  function addWall(x, y, w, h) {
    add([rect(w, h), pos(x, y), opacity(0),
         area(), body({ isStatic: true, gravityScale: 0 }), "wall"]);
  }
  // Hus 1 (x=0–288, y=0–384) — gap ved x=165–235 (dør)
  addWall(  0, 372, 165, 15);
  addWall(235, 372,  53, 15);
  addWall(278,   0,  10, 372);
  // Hus 2 (x=660–900, y=0–360) — gap ved x=810–880 (dør)
  addWall(660, 348, 150, 15);
  addWall(880, 348, 120, 15);
  addWall(660,   0,  10, 348);
  addWall(990,   0,  10, 348);

  // ── Trær og hindringer ───────────────────────────────────────
  function makeObstacle(x, y, name, sc) {
    add([sprite(name), pos(x, y), scale(sc),
         area(), body({ isStatic: true, gravityScale: 0 }), z(8), "wall"]);
  }
  makeObstacle(390, 255, "me_tree_sm", 2);  // mellom husene
  makeObstacle(940, 270, "me_tree_sm", 2);  // høyre side

  // ── Busker langs nedre kant ───────────────────────────────────
  makeSpriteDeco( 90, 630, "me_bush_sm", 5);
  makeSpriteDeco(430, 620, "me_bush_lg", 4);
  makeSpriteDeco(700, 635, "me_bush_sm", 5);
  makeSpriteDeco(990, 625, "me_bush_lg", 4);   // Lussi gjemmer seg her

  // ── Player ───────────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, true, "nabolag_venn");
  setupGlobalUI();
  setupAtmosphere(player);
  sceneFadeIn();

  // Ambient lydbilde (barn som leker i bakgrunnen)
  try { play("amb_street_2", { loop: true, volume: 0.18 }); } catch (e) {}

  // Kameragrenser (identisk med gata)
  player.onUpdate(function() {
    setCamPos(vec2(
      Math.max(375, Math.min(800, camPos().x)),
      Math.max(300, Math.min(500, camPos().y))
    ));
  });

  // ── Postbokser ───────────────────────────────────────────────

  // Postboks 1 — ved hus 1 (grønn brevkasse)
  add([rect(14, 20), pos(152, 354), color(30, 110, 50), anchor("topleft"), z(9)]);
  add([rect(3, 28),  pos(160, 348), color(90, 90, 90),  anchor("topleft"), z(8)]);
  var pb1Done = false;
  addInteraction(
    { pos: vec2(159, 364) },
    function() { return !pb1Done; },
    function() { pb1Done = true; say("postbox_1"); }
  );

  // Postboks 2 — ved hus 2 (blå brevkasse)
  add([rect(14, 20), pos(810, 349), color(40, 80, 170), anchor("topleft"), z(9)]);
  add([rect(3, 28),  pos(818, 343), color(90, 90, 90),  anchor("topleft"), z(8)]);
  var pb2Done = false;
  addInteraction(
    { pos: vec2(817, 359) },
    function() { return !pb2Done; },
    function() { pb2Done = true; say("postbox_2"); }
  );

  // ── NPC: Maya (venninne) ──────────────────────────────────────
  var npc = add([
    sprite("vetle_idle_anim"),
    pos(480, 425),
    scale(2),
    anchor("center"),
    z(7),
    "npc_friend",
  ]);
  npc.play("idle_down");
  npc.flipX = true;   // vender mot venstre (mot gata-siden)

  // Navnelapp over NPC
  add([
    text("Maya", { size: 12 }),
    pos(480, 397),
    anchor("center"),
    color(255, 255, 200),
    opacity(0.95),
    z(11),
  ]);

  // Samhandlingsindikator — pulserer gul sirkel; sier dialogen på klikk
  var npcInteracted = false;
  addInteraction(
    npc,
    function() { return !npcInteracted; },
    function() {
      npcInteracted = true;
      say("emma_challenge");
      // Indikator vises igjen etter dialogens varighet
      wait(5, function() { npcInteracted = false; });
    }
  );

  // ── Fotball (spark inn i naboens hage!) ──────────────────────
  addSoccerBall(270, 468, player);

  // ── Sykkel (i oppkjørselen ved hus 1) ────────────────────────
  addBicycle(190, 380, player);

  // ── Søppeldunker langs fortauet ───────────────────────────────
  addTrashCan(550, 480);
  addTrashCan(840, 470);

  // ── Rampe (mellom de to husene) ───────────────────────────────
  addRamp(400, 430, player);

  // ── Mål: dunk fotballen inn i naboens hage ───────────────────
  // Målstolper ved hus 2 sin dørgang (gap x=810–880, y=348)
  add([rect(4, 22), pos(810, 326), color(255, 230, 50), anchor("topleft"), z(9)]);
  add([rect(4, 22), pos(876, 326), color(255, 230, 50), anchor("topleft"), z(9)]);
  add([rect(70, 4), pos(810, 326), color(255, 230, 50), anchor("topleft"), z(9)]);

  var goalScored = false;
  onUpdate(function() {
    if (goalScored) return;
    var balls = get("soccer_ball");
    for (var i = 0; i < balls.length; i++) {
      var b = balls[i];
      if (b.pos.x > 812 && b.pos.x < 876 && b.pos.y > 330 && b.pos.y < 352) {
        goalScored = true;
        say("goal_scored");
        try { play("lyd_jubel"); } catch(e) {}
        var flash = add([rect(width(), height()), pos(0, 0), color(255, 255, 100),
                         opacity(0.5), fixed(), z(900)]);
        var _ft = 0;
        flash.onUpdate(function() {
          _ft += dt();
          flash.opacity = Math.max(0, 0.5 - _ft * 1.5);
          if (_ft > 0.8) destroy(flash);
        });
      }
    }
  });

  // ── Lussi gjemmer seg bak busken til høyre ───────────────────
  // Triggerer roomsSearched["nabolag_venn"] og teller med i quest-loggen.
  // Lussi stikker av mot venstre (tilbake mot gata) ved oppdagelse.
  if (!roomsSearched["nabolag_venn"]) {
    addRoomLussi(
      "nabolag_venn",
      vec2(1000, 642),    // hidePos: bak busken
      vec2(1000, 614),    // indicatorPos: "?" flyter over busken
      vec2(0, 430),       // doorTarget: rømmer mot venstre kant
      player,
      70
    );
  }

  // ── Overgang tilbake til gata (venstre kant) ─────────────────
  addTransitionZone(player, -20, 330, 30, 430, "gata", vec2(1140, 440));

  // Scene-etikett (feilsøking)
  add([text("Nabolaget", { size: 14 }),
       pos(10, 10), fixed(), color(200, 200, 200), opacity(0.6), z(50)]);
});
