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

  // Helper function for playing background music
  function startBgMusic() {
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
  }

  // Check localStorage for save game and custom character
  var hasSave      = !!localStorage.getItem("lussi_savegame");
  var hasCustomChar = !!localStorage.getItem("lussi_character");

  // ── LAYOUT A: Save exists (Resume / New Game) ────────────────
  if (hasSave) {
    add([text("Hvem vil du spille som?", { size: 18, align: "center" }),
         pos(center().add(0, 30)), anchor("center"), color(200, 220, 255), fixed(), z(10)]);

    // Continue button (large, green)
    var fortsettBtn = add([
      rect(280, 70, { radius: 8 }), pos(center().add(0, 100)),
      color(80, 160, 100), anchor("center"), area(), fixed(), z(10),
    ]);
    add([text("Fortsett reisen  ▶", { size: 24, align: "center" }),
         pos(center().add(0, 100)), anchor("center"), color(255, 255, 255), fixed(), z(11)]);
    fortsettBtn.onHover(function()    { fortsettBtn.color = rgb(110, 190, 130); });
    fortsettBtn.onHoverEnd(function() { fortsettBtn.color = rgb(80, 160, 100);  });
    fortsettBtn.onClick(function() {
      if (loadGame()) {
        startBgMusic();
        if (selectedCharacter === "custom") {
          wait(0.2, function() { go(lastScene, { fra: "" }); });
        } else {
          go(lastScene, { fra: "" });
        }
      }
    });

    // New game button (smaller)
    var nyttBtn = add([
      rect(200, 50, { radius: 8 }), pos(center().add(0, 185)),
      color(100, 100, 140), anchor("center"), area(), fixed(), z(10),
    ]);
    add([text("Nytt Spill", { size: 18, align: "center" }),
         pos(center().add(0, 185)), anchor("center"), color(200, 200, 255), fixed(), z(11)]);
    nyttBtn.onHover(function()    { nyttBtn.color = rgb(130, 130, 170); });
    nyttBtn.onHoverEnd(function() { nyttBtn.color = rgb(100, 100, 140);  });
    nyttBtn.onClick(function() {
      resetGame();
      go("start");  // Re-enter scene to show Layout B or C
    });

  // ── LAYOUT C: No save, custom character exists ────────────────
  } else if (hasCustomChar) {
    add([text("Hvem vil du spille som?", { size: 18, align: "center" }),
         pos(center().add(0, 30)), anchor("center"), color(200, 220, 255), fixed(), z(10)]);

    // Four buttons in 2×2 grid
    // Ylva (top-left)
    var ylvaBtn = add([
      rect(140, 60, { radius: 6 }), pos(center().add(-150, 90)),
      color(140, 80, 120), anchor("center"), area(), fixed(), z(10),
    ]);
    add([sprite("ylva", { frame: 3 }), pos(center().add(-175, 90)),
         scale(1.5), anchor("center"), fixed(), z(11)]);
    add([text("Ylva", { size: 16 }), pos(center().add(-125, 90)),
         anchor("center"), color(255, 255, 255), fixed(), z(11)]);
    ylvaBtn.onHover(function()    { ylvaBtn.color = rgb(180, 100, 150); });
    ylvaBtn.onHoverEnd(function() { ylvaBtn.color = rgb(140, 80, 120);  });
    ylvaBtn.onClick(function() { startGameStandard("ylva"); });

    // Vetle (top-right)
    var vetleBtn = add([
      rect(140, 60, { radius: 6 }), pos(center().add(150, 90)),
      color(60, 100, 140), anchor("center"), area(), fixed(), z(10),
    ]);
    add([sprite("vetle", { frame: 3 }), pos(center().add(125, 90)),
         scale(1.5), anchor("center"), fixed(), z(11)]);
    add([text("Vetle", { size: 16 }), pos(center().add(175, 90)),
         anchor("center"), color(255, 255, 255), fixed(), z(11)]);
    vetleBtn.onHover(function()    { vetleBtn.color = rgb(80, 130, 180);  });
    vetleBtn.onHoverEnd(function() { vetleBtn.color = rgb(60, 100, 140);  });
    vetleBtn.onClick(function() { startGameStandard("vetle"); });

    // Custom character button (bottom-left)
    var customBtn = add([
      rect(140, 60, { radius: 6 }), pos(center().add(-150, 175)),
      color(80, 120, 100), anchor("center"), area(), fixed(), z(10),
    ]);
    add([text("Din figur", { size: 16 }), pos(center().add(-150, 175)),
         anchor("center"), color(255, 255, 255), fixed(), z(11)]);
    customBtn.onHover(function()    { customBtn.color = rgb(110, 150, 130); });
    customBtn.onHoverEnd(function() { customBtn.color = rgb(80, 120, 100);  });
    customBtn.onClick(function() {
      loadCharacter();
      selectedCharacter = "custom";
      resetGame();
      saveGame();
      startBgMusic();
      go("etasje2_kjokken");
    });

    // New character button (bottom-right)
    var lagnyBtn = add([
      rect(140, 60, { radius: 6 }), pos(center().add(150, 175)),
      color(60, 110, 90), anchor("center"), area(), fixed(), z(10),
    ]);
    add([text("Ny figur", { size: 16 }), pos(center().add(150, 175)),
         anchor("center"), color(255, 255, 255), fixed(), z(11)]);
    lagnyBtn.onHover(function()    { lagnyBtn.color = rgb(80, 150, 120); });
    lagnyBtn.onHoverEnd(function() { lagnyBtn.color = rgb(60, 110, 90);  });
    lagnyBtn.onClick(function() { go("character_creator"); });

  // ── LAYOUT B: No save, no custom character (standard 3-button) ───
  } else {
    add([text("Hvem vil du spille som?", { size: 18, align: "center" }),
         pos(center().add(0, 30)), anchor("center"), color(200, 220, 255), fixed(), z(10)]);

    // Three buttons
    // Ylva (left)
    var ylvaBtn = add([
      rect(165, 64), pos(center().add(-215, 100)),
      color(140, 80, 120), anchor("center"), area(), fixed(), z(10),
    ]);
    add([sprite("ylva", { frame: 3 }), pos(center().add(-245, 100)),
         scale(2), anchor("center"), fixed(), z(11)]);
    add([text("Ylva", { size: 20 }), pos(center().add(-200, 100)),
         anchor("center"), color(255, 255, 255), fixed(), z(11)]);
    ylvaBtn.onHover(function()    { ylvaBtn.color = rgb(180, 100, 150); });
    ylvaBtn.onHoverEnd(function() { ylvaBtn.color = rgb(140, 80, 120);  });
    ylvaBtn.onClick(function() { startGameStandard("ylva"); });

    // Vetle (center)
    var vetleBtn = add([
      rect(165, 64), pos(center().add(0, 100)),
      color(60, 100, 140), anchor("center"), area(), fixed(), z(10),
    ]);
    add([sprite("vetle", { frame: 3 }), pos(center().add(-30, 100)),
         scale(2), anchor("center"), fixed(), z(11)]);
    add([text("Vetle", { size: 20 }), pos(center().add(22, 100)),
         anchor("center"), color(255, 255, 255), fixed(), z(11)]);
    vetleBtn.onHover(function()    { vetleBtn.color = rgb(80, 130, 180);  });
    vetleBtn.onHoverEnd(function() { vetleBtn.color = rgb(60, 100, 140);  });
    vetleBtn.onClick(function() { startGameStandard("vetle"); });

    // "Lag din egen" (right)
    var lagenBtn = add([
      rect(165, 64), pos(center().add(215, 100)),
      color(60, 110, 90), anchor("center"), area(), fixed(), z(10),
    ]);
    add([text("✏ Lag din\n  egen", { size: 16, align: "center" }),
         pos(center().add(215, 100)), anchor("center"), color(255, 255, 255), fixed(), z(11)]);
    lagenBtn.onHover(function()    { lagenBtn.color = rgb(80, 150, 120); });
    lagenBtn.onHoverEnd(function() { lagenBtn.color = rgb(60, 110, 90);  });
    lagenBtn.onClick(function() { go("character_creator"); });
  }

  // Shared function for standard character start
  function startGameStandard(character) {
    selectedCharacter = character;
    resetGame();
    saveGame();
    startBgMusic();
    go("etasje2_kjokken");
  }

  add([text("— velg karakter for å starte —", { size: 13, align: "center" }),
       pos(center().add(0, 260)), anchor("center"), color(160, 160, 200), fixed(), z(10)]);
});
