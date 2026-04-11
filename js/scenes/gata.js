// ============================================================
// SCENE: gata — Utenfor huset (Lussi chase sequence)
// ============================================================

scene("gata", function(args) {
  args = args || {};
  var spawnPos = SPAWNS["gata_default"];

  // ── Bakgrunn ─────────────────────────────────────────────────
  makeDeco(-25,   0, 1225, 800, [75, 145, 65]);
  makeDeco(-25, 380, 1225,  80, [110, 100, 88]);

  // ── Grensevegger ─────────────────────────────────────────────
  for (var bw of [[-57,0,32,800],[1200,0,32,800],[-25,-32,1225,32],[-25,800,1225,32]]) {
    add([rect(bw[2], bw[3]), pos(bw[0], bw[1]), opacity(0),
         area(), body({ isStatic: true, gravityScale: 0 }), "wall"]);
  }

  // ── Hus ──────────────────────────────────────────────────────
  makeSpriteDeco(0,   0, "me_house",    1.5);
  makeSpriteDeco(440, 0, "me_house_nb2",1.5);
  makeSpriteDeco(790, 0, "me_house_nb", 1.5);

  // ── Kollisjon rundt hus ───────────────────────────────────────
  function addWall(x, y, w, h) {
    add([rect(w, h), pos(x, y), opacity(0), area(), body({ isStatic: true, gravityScale: 0 }), "wall"]);
  }
  // Hus 1 (x=0–288, y=0–384) — gap ved x=160–230 (inngangsdør)
  addWall(  0, 372, 160, 15);
  addWall(230, 372,  58, 15);
  addWall(278,   0,  10, 372);
  // Hus 2 (x=440–680, y=0–360)
  addWall(440, 348, 240, 15);
  addWall(440,   0,  10, 348);
  addWall(670,   0,  10, 348);
  // Hus 3 (x=790–1174, y=0–336)
  addWall(790, 324, 384, 15);
  addWall(790,   0,  10, 324);
  addWall(1164, 0,   10, 324);

  // ── Sprite-hindringer (trær i gap mellom husene) ─────────────
  function makeObstacle(x, y, name, sc) {
    add([sprite(name), pos(x, y), scale(sc),
         area(), body({ isStatic: true, gravityScale: 0 }), z(8), "wall"]);
  }
  makeObstacle(299, 255, "me_tree_sm", 2);
  makeObstacle(690, 265, "me_tree_sm", 2);

  // ── Trampoline ───────────────────────────────────────────────
  var trampoline = makeSpriteDeco(307, 50, "me_trampoline", 1.5);
  trampoline.z = 5;

  // ── Busker langs nedre kant ───────────────────────────────────
  makeSpriteDeco(150, 625, "me_bush_lg", 4);
  makeSpriteDeco(440, 635, "me_bush_sm", 5);
  makeSpriteDeco(675, 625, "me_bush_lg", 4);
  makeSpriteDeco(925, 635, "me_bush_sm", 5);

  // ── Dør hjem ─────────────────────────────────────────────────
  add([rect(70, 75), pos(160, 300), color(0,0,0), opacity(0),
       area(), anchor("topleft"), "door_etasje1"]);

  // ── Player ───────────────────────────────────────────────────
  var player = makePlayer(spawnPos);
  setupControls(player, true, "gata");
  setupGlobalUI();
  setupAtmosphere(player);
  toggleRain(true);

  // Kameragrenser
  player.onUpdate(function() {
    setCamPos(vec2(
      Math.max(375, Math.min(800, camPos().x)),
      Math.max(300, Math.min(500, camPos().y))
    ));
  });

  // ── Trampolineffekt ───────────────────────────────────────────
  var TRAM_X1=310, TRAM_X2=376, TRAM_Y1=72, TRAM_Y2=160;
  var tramPhase=0, tramActive=false;
  player.onUpdate(function() {
    var onTram = player.pos.x>TRAM_X1 && player.pos.x<TRAM_X2 &&
                 player.pos.y>TRAM_Y1 && player.pos.y<TRAM_Y2;
    if (onTram) {
      var prev = tramPhase;
      tramPhase += dt() * 8;
      var db = Math.abs(Math.sin(tramPhase)) - Math.abs(Math.sin(prev));
      player.pos.y -= db * 20;
      var b = Math.abs(Math.sin(tramPhase));
      player.scale.x = 2 - b * 0.35;
      player.scale.y = 2 + b * 0.50;
    } else if (tramActive) {
      player.scale = vec2(2, 2);
      tramPhase = 0;
    }
    tramActive = onTram;
  });

  // ── Lussi only appears once all rooms have been searched ──────
  if (allRoomsSearched()) {

    // Activate the Lussi chase quest
    questState.lussiChase.active = true;
    questState.lussiChase.status = "chasing";
    saveGame();

    // ── Potespor fra inngangsdøren til gjemmestedet ─────────────
    var paws = [
      [130,388],[133,398],[138,409],
      [155,420],[210,428],[295,432],
      [390,433],[490,432],[590,430],
      [690,432],[795,438],[890,448],
      [960,460],[990,478],[1005,498],
      [1010,528],[1012,560],[1010,595],[1003,630],[1001,658],
    ];
    for (var p of paws) {
      add([circle(4), pos(p[0], p[1]), color(101, 67, 33)]);
    }

    // ── Lussi (gjemmer seg bak busken til høyre) ────────────────
    var lussi = add([
      sprite("lussi"),
      pos(1005, 675),
      scale(2),
      area({ shape: new Rect(vec2(4, 4), 24, 24) }),
      anchor("center"),
      z(0),
      "lussi",
    ]);
    lussi.play("idle");
    lussi.currentAnim = "idle";
    lussi.flipX = true;

    // ── Chase mechanic ──────────────────────────────────────────
    var lussiEscapes = 0;
    var LUSSI_ESCAPES_NEEDED = (treatsCount >= questState.collectFish.total) ? 1 : 3;
    var lussiRunning  = false;
    var lussiCatchable = false;
    var lussiCooldown  = false;

    var escapeSpots = [
      vec2(200,420), vec2(370,415), vec2(560,430), vec2(750,420), vec2(1000,430),
      vec2(110,510), vec2(310,530), vec2(560,510), vec2(760,525), vec2(1050,500),
      vec2(200,640), vec2(480,625), vec2(710,645), vec2(940,630),
    ];

    var lussiIndicator = add([
      text("?", { size: 20 }),
      pos(lussi.pos.x, lussi.pos.y - 28),
      anchor("center"),
      color(255, 255, 100),
      opacity(0.8),
      z(11),
    ]);

    function updateEscapeUI() {
      if (lussiCatchable) {
        lussiIndicator.text = "!";
        lussiIndicator.color = rgb(100, 255, 100);
      }
    }
    updateEscapeUI();

    function lussiFleeFrom(playerPos) {
      if (lussiRunning || lussiCooldown) return;
      lussiRunning = true;
      lussiEscapes++;
      lussi.z = 10;

      var candidates = [];
      for (var i = 0; i < escapeSpots.length; i++) {
        var d    = escapeSpots[i].dist(playerPos);
        var from = escapeSpots[i].dist(lussi.pos);
        if (from < 80 || d < 150) continue;
        candidates.push({ spot: escapeSpots[i], score: d + from * 0.5 });
      }
      candidates.sort(function(a, b) { return b.score - a.score; });
      var topN = candidates.slice(0, Math.min(5, candidates.length));
      var pick = topN.length > 0 ? topN[Math.floor(Math.random() * topN.length)] : candidates[0];
      var target = pick ? pick.spot : escapeSpots[Math.floor(Math.random() * escapeSpots.length)];

      lussi.play("run"); lussi.currentAnim = "run";
      lussi.flipX = (target.x < lussi.pos.x);
      say("lussi_fled");

      var moveUpdate = lussi.onUpdate(function() {
        var dir = target.sub(lussi.pos);
        if (dir.len() < 8) {
          moveUpdate.cancel();
          lussiRunning = false;
          lussi.play("idle"); lussi.currentAnim = "idle";
          lussiCooldown = true;
          wait(1.5, function() { lussiCooldown = false; });
          if (lussiEscapes >= LUSSI_ESCAPES_NEEDED) {
            lussiCatchable = true;
            questState.lussiChase.status = "catchable";
            saveGame();
          }
          updateEscapeUI();
          return;
        }
        lussi.move(dir.unit().scale(350));
        lussiIndicator.pos = vec2(lussi.pos.x, lussi.pos.y - 28);
      });
    }

    lussi.onUpdate(function() {
      lussiIndicator.pos = vec2(lussi.pos.x, lussi.pos.y - 28);
    });

    // ── Kollisjon: Lussi ────────────────────────────────────────
    player.onCollide("lussi", function() {
      if (lussiRunning || lussiCooldown) return;
      if (lussiCatchable) {
        questState.lussiChase.status = "done";
        saveGame();
        go("vinn");
      }
      else lussiFleeFrom(player.pos);
    });
    player.onUpdate(function() {
      if (!lussiRunning && !lussiCatchable && !lussiCooldown && lussi.pos.dist(player.pos) < 60) {
        lussiFleeFrom(player.pos);
      }
    });

    add([text("Finn Lussi!", { size: 13 }), pos(10, 30), fixed(), color(255,230,100), opacity(0.8), z(50)]);

  } else {
    // Lussi is not outside yet — hint to check rooms
    wait(0.5, function() {
      say("lussi_not_outside");
    });
  }

  // ── Kollisjon: dør hjem ───────────────────────────────────────
  player.onCollide("door_etasje1", function() {
    go("etasje1_gang", { fra: "gata" });
  });

  add([text("Gata", { size: 14 }), pos(10, 10), fixed(), color(200,200,200), opacity(0.6), z(50)]);
});
