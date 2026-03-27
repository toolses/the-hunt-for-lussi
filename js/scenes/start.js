// ============================================================
// SCENE: start — Startskjerm med karaktervalg
// ============================================================

scene("start", function() {
  add([rect(800, 600), pos(0, 0), color(20, 40, 80), fixed()]);

  for (var i = 0; i < 30; i++) {
    add([circle(rand(1, 3)), pos(rand(0, 800), rand(0, 600)),
         color(255, 255, 200), fixed(), opacity(rand(0.4, 1.0))]);
  }

  // Lussi (pust-animasjon)
  var lussiStart = add([
    sprite("lussi"), pos(center().add(0, -100)),
    scale(3), anchor("center"), fixed(), z(5),
  ]);
  lussiStart.play("idle");
  var breathScale = 1, breathDir = 1;
  lussiStart.onUpdate(function() {
    breathScale += breathDir * 0.3 * dt();
    if (breathScale > 1.08) breathDir = -1;
    if (breathScale < 0.92) breathDir = 1;
    lussiStart.scale = vec2(3 * breathScale);
  });

  add([text("Jakten på Lussi", { size: 42, align: "center" }),
       pos(center().add(0, -30)), anchor("center"), color(255, 240, 100), fixed(), z(10)]);
  add([text("Hvem vil du spille som?", { size: 18, align: "center" }),
       pos(center().add(0, 30)), anchor("center"), color(200, 220, 255), fixed(), z(10)]);

  // ── Ylva-knapp ───────────────────────────────────────────────
  var ylvaBtn = add([
    rect(180, 64), pos(center().add(-110, 100)),
    color(140, 80, 120), anchor("center"), area(), fixed(), z(10), "ylvaBtn",
  ]);
  add([sprite("ylva", { frame: 3 }), pos(center().add(-140, 100)),
       scale(2), anchor("center"), fixed(), z(11)]);
  add([text("Ylva", { size: 20 }), pos(center().add(-90, 100)),
       anchor("center"), color(255, 255, 255), fixed(), z(11)]);

  // ── Vetle-knapp ──────────────────────────────────────────────
  var vetleBtn = add([
    rect(180, 64), pos(center().add(110, 100)),
    color(60, 100, 140), anchor("center"), area(), fixed(), z(10), "vetleBtn",
  ]);
  add([sprite("vetle", { frame: 3 }), pos(center().add(80, 100)),
       scale(2), anchor("center"), fixed(), z(11)]);
  add([text("Vetle", { size: 20 }), pos(center().add(130, 100)),
       anchor("center"), color(255, 255, 255), fixed(), z(11)]);

  ylvaBtn.onHover(function()    { ylvaBtn.color  = rgb(180, 100, 150); });
  ylvaBtn.onHoverEnd(function() { ylvaBtn.color  = rgb(140, 80, 120);  });
  vetleBtn.onHover(function()   { vetleBtn.color = rgb(80, 130, 180);  });
  vetleBtn.onHoverEnd(function(){ vetleBtn.color = rgb(60, 100, 140);  });

  function startGame(character) {
    selectedCharacter = character;
    resetRoomsSearched();
    resetTreats();
    if (!bgMusicPlaying) {
      try {
        var ctx = audioCtx;
        if (ctx && ctx.state === "suspended") {
          ctx.resume().then(function() { play("bgmusic", { loop: true, volume: 0.1 }); });
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

  ylvaBtn.onClick(function()  { startGame("ylva");  });
  vetleBtn.onClick(function() { startGame("vetle"); });

  add([text("— velg karakter for å starte —", { size: 13, align: "center" }),
       pos(center().add(0, 170)), anchor("center"), color(160, 160, 200), fixed(), z(10)]);
});
