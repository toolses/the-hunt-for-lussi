// ============================================================
// SCENE: character_creator — Lag din egen karakter
// Uses Character_Generator/kids layer sprites (body/eyes/outfit/hair).
// Canvas-composites row 3 (idle) and row 5 (walk) into custom_idle_anim + custom_run.
// ============================================================

scene("character_creator", function() {

  // ── Background (same style as start screen) ──────────────────
  add([rect(800, 600), pos(0, 0), color(20, 40, 80), fixed()]);
  for (var i = 0; i < 25; i++) {
    add([circle(rand(1, 3)), pos(rand(0, 800), rand(0, 600)),
         color(255, 255, 200), fixed(), opacity(rand(0.3, 0.9))]);
  }

  add([text("Lag din egen karakter", { size: 30, align: "center" }),
       pos(400, 42), anchor("center"), color(255, 240, 100), fixed(), z(10)]);

  // ── Preview (4 stacked sprites, front-facing from the walk row) ──
  // Sprite layout: even rows = small, odd rows = large.
  // Row 3 = full-size walk (24 frames): right(0-5), up(6-11), left(12-17), down(18-23).
  // Absolute frame for Row 3 Col 18 (first down/front pose) = 3*24+18 = 90.
  var PREV_FRAME = 90;
  var PREV_X = 400, PREV_Y = 175, PREV_SCALE = 2;
  var prevLayers = [
    add([sprite("gen_body_1",   { frame: PREV_FRAME }), pos(PREV_X, PREV_Y), scale(PREV_SCALE), anchor("center"), fixed(), z(5), "preview_layer"]),
    add([sprite("gen_eyes_1",   { frame: PREV_FRAME }), pos(PREV_X, PREV_Y), scale(PREV_SCALE), anchor("center"), fixed(), z(6), "preview_layer"]),
    add([sprite("gen_outfit_1", { frame: PREV_FRAME }), pos(PREV_X, PREV_Y), scale(PREV_SCALE), anchor("center"), fixed(), z(7), "preview_layer"]),
    add([sprite("gen_hair_1_1", { frame: PREV_FRAME }), pos(PREV_X, PREV_Y), scale(PREV_SCALE), anchor("center"), fixed(), z(8), "preview_layer"]),
  ];

  function updatePreview() {
    var cl = characterLayers;
    prevLayers[0].use(sprite("gen_body_"   + cl.body,                      { frame: PREV_FRAME }));
    prevLayers[1].use(sprite("gen_eyes_"   + cl.eyes,                      { frame: PREV_FRAME }));
    prevLayers[2].use(sprite("gen_outfit_" + cl.outfit,                    { frame: PREV_FRAME }));
    prevLayers[3].use(sprite("gen_hair_"   + cl.hair + "_" + cl.hairColor, { frame: PREV_FRAME }));
  }

  // ── Selector rows ─────────────────────────────────────────────
  // Layout: label left, arrow left, icon/text center, arrow right
  var SELECTORS = [
    { key: "body",      label: "Kropp",    min: 1, max: 4 },
    { key: "outfit",    label: "Antrekk",  min: 1, max: 5 },
    { key: "hair",      label: "Frisyre",  min: 1, max: 6 },
    { key: "hairColor", label: "Hårfarge", min: 1, max: 5 },
  ];

  var ROW_START_Y = 310;
  var ROW_H = 52;
  var LABEL_X = 140;
  var ARROW_L_X = 280;
  var VALUE_X = 400;
  var ARROW_R_X = 510;

  var valueLabels = {};

  function makeArrowBtn(x, y, symbol, onClick) {
    var btn = add([
      rect(44, 36, { radius: 6 }), pos(x, y), anchor("center"),
      color(60, 80, 130), area(), fixed(), z(10),
    ]);
    add([text(symbol, { size: 22 }), pos(x, y), anchor("center"), color(255, 255, 255), fixed(), z(11)]);
    btn.onHover(function()    { btn.color = rgb(90, 120, 190); });
    btn.onHoverEnd(function() { btn.color = rgb(60, 80, 130);  });
    btn.onClick(onClick);
    return btn;
  }

  SELECTORS.forEach(function(sel, i) {
    var y = ROW_START_Y + i * ROW_H;

    // Label
    add([text(sel.label + ":", { size: 18 }),
         pos(LABEL_X, y), anchor("right"), color(200, 220, 255), fixed(), z(10)]);

    // Value text
    var valLabel = add([text("" + characterLayers[sel.key], { size: 20 }),
                        pos(VALUE_X, y), anchor("center"), color(255, 255, 255), fixed(), z(10)]);
    valueLabels[sel.key] = valLabel;

    // Left arrow
    makeArrowBtn(ARROW_L_X, y, "←", function(key, min, max) {
      return function() {
        characterLayers[key] = characterLayers[key] <= min ? max : characterLayers[key] - 1;
        valueLabels[key].text = "" + characterLayers[key];
        updatePreview();
      };
    }(sel.key, sel.min, sel.max));

    // Right arrow
    makeArrowBtn(ARROW_R_X, y, "→", function(key, min, max) {
      return function() {
        characterLayers[key] = characterLayers[key] >= max ? min : characterLayers[key] + 1;
        valueLabels[key].text = "" + characterLayers[key];
        updatePreview();
      };
    }(sel.key, sel.min, sel.max));
  });

  // ── Hair color swatch display ──────────────────────────────────
  var HAIR_COLORS = ["#e8c46a", "#3d1f05", "#e05555", "#222222", "#dddddd"];
  var colorSwatch = add([
    rect(28, 28, { radius: 4 }),
    pos(VALUE_X + 60, ROW_START_Y + 3 * ROW_H),
    anchor("center"), fixed(), z(10),
  ]);
  function updateColorSwatch() {
    var hex = HAIR_COLORS[characterLayers.hairColor - 1];
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    colorSwatch.color = rgb(r, g, b);
  }
  updateColorSwatch();

  // Override hairColor arrow callbacks to also update swatch
  var origHairColorUpdate = valueLabels.hairColor;
  // (swatch updates automatically on next arrow click via the closure — patch onUpdate)
  onUpdate(function() { updateColorSwatch(); });

  // ── Status / loading message ───────────────────────────────────
  var statusMsg = add([text("", { size: 16, align: "center" }),
                       pos(400, 505), anchor("center"), color(255, 220, 100), fixed(), z(12)]);

  // ── Buttons ────────────────────────────────────────────────────
  // Back button
  var backBtn = add([
    rect(160, 50, { radius: 8 }), pos(160, 555), anchor("center"),
    color(70, 70, 100), area(), fixed(), z(10),
  ]);
  add([text("← Tilbake", { size: 18 }), pos(160, 555), anchor("center"),
       color(200, 200, 255), fixed(), z(11)]);
  backBtn.onHover(function()    { backBtn.color = rgb(100, 100, 150); });
  backBtn.onHoverEnd(function() { backBtn.color = rgb(70, 70, 100);   });
  backBtn.onClick(function() { go("start"); });

  // Done button
  var ferdigBtn = add([
    rect(200, 50, { radius: 8 }), pos(620, 555), anchor("center"),
    color(60, 140, 80), area(), fixed(), z(10),
  ]);
  add([text("Ferdig! →", { size: 20 }), pos(620, 555), anchor("center"),
       color(255, 255, 255), fixed(), z(11)]);
  ferdigBtn.onHover(function()    { ferdigBtn.color = rgb(80, 170, 100); });
  ferdigBtn.onHoverEnd(function() { ferdigBtn.color = rgb(60, 140, 80);  });
  var ferdigClicked = false;
  ferdigBtn.onClick(onFerdig);

  // ── Canvas compositing ─────────────────────────────────────────
  // Row 3 (odd = "large" sprites) extends 10px above the row boundary.
  // Capture y=86..127 (42px) so hair/head aren't clipped.
  var OVERFLOW = 10;          // px above the 32px row
  var FRAME_H  = 32 + OVERFLOW; // 42px per frame

  function compositeRow(layerSrcs, rowIndex, callback) {
    var canvas = document.createElement("canvas");
    canvas.width  = 768;
    canvas.height = FRAME_H;
    var ctx = canvas.getContext("2d");

    function drawNext(idx) {
      if (idx >= layerSrcs.length) {
        callback(canvas.toDataURL());
        return;
      }
      var img = new Image();
      img.onload = function() {
        var srcY = rowIndex * 32 - OVERFLOW;
        if (srcY < 0) srcY = 0;
        if (img.height > srcY) {
          ctx.drawImage(img, 0, srcY, 768, FRAME_H, 0, 0, 768, FRAME_H);
        }
        drawNext(idx + 1);
      };
      img.onerror = function() { drawNext(idx + 1); };
      img.src = layerSrcs[idx];
    }

    drawNext(0);
  }

  function onFerdig() {
    if (ferdigClicked) return;
    ferdigClicked = true;
    ferdigBtn.color = rgb(40, 100, 55);
    statusMsg.text = "Lager karakter...";

    var cl = characterLayers;
    var layers = [
      GEN + "Body_"        + cl.body    + "_kid_32x32.png",
      GEN + "Eyes_kids_32x32_" + cl.eyes + ".png",
      GEN + "Outfit_kid_"  + cl.outfit  + "_32x32.png",
      GEN + "Hairstyle_kid_" + cl.hair + "_32x32_" + cl.hairColor + ".png",
    ];

    // Row 3 = idle animation, Row 5 = walk/run cycle (legs move)
    compositeRow(layers, 3, function(idleDataUrl) {
      compositeRow(layers, 5, function(runDataUrl) {
        var idleAnimDef = {
          sliceX: 24,
          anims: {
            "idle_right": { from: 0,  to: 5,  loop: true, speed: 6 },
            "idle_up":    { from: 6,  to: 11, loop: true, speed: 6 },
            "idle_left":  { from: 12, to: 17, loop: true, speed: 6 },
            "idle_down":  { from: 18, to: 23, loop: true, speed: 6 },
          },
        };
        var runAnimDef = {
          sliceX: 24,
          anims: {
            "run_right":  { from: 0,  to: 5,  loop: true, speed: 10 },
            "run_up":     { from: 6,  to: 11, loop: true, speed: 10 },
            "run_left":   { from: 12, to: 17, loop: true, speed: 10 },
            "run_down":   { from: 18, to: 23, loop: true, speed: 10 },
          },
        };

        loadSprite("custom_idle_anim", idleDataUrl, idleAnimDef);
        loadSprite("custom_run",       runDataUrl,  runAnimDef);

        customCharacterDataUrl = idleDataUrl;
        customCharacterRunDataUrl = runDataUrl;
        saveCharacter(idleDataUrl, runDataUrl);

        wait(0.2, function() {
          selectedCharacter = "custom";
          resetGame();
          if (!bgMusicPlaying) {
            try {
              var ac = audioCtx;
              if (ac && ac.state === "suspended") {
                ac.resume().then(function() { play("bgmusic", { loop: true, volume: 0.1 }); });
              } else {
                play("bgmusic", { loop: true, volume: 0.1 });
              }
            } catch (e) {
              play("bgmusic", { loop: true, volume: 0.1 });
            }
            bgMusicPlaying = true;
          }
          saveGame();
          go("etasje2_kjokken");
        });
      });
    });
  }

});
