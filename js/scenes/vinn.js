// ============================================================
// SCENE: vinn — Vinnerskjerm
// ============================================================

scene("vinn", function() {
  add([rect(800, 600), pos(0, 0), color(20, 40, 80), fixed()]);

  for (var i = 0; i < 30; i++) {
    add([circle(rand(1, 3)), pos(rand(0, 800), rand(0, 600)),
         color(255, 255, 200), fixed(), opacity(rand(0.4, 1.0))]);
  }

  var winChar = add([
    sprite(selectedCharacter + "_idle_anim"),
    pos(center().add(-60, -40)),
    scale(3), anchor("center"), fixed(), z(5),
  ]);
  winChar.play("idle_right");
  winChar.onUpdate(function() {
    winChar.pos.y = center().y - 40 + Math.sin(time() * 1.5) * 4;
  });

  var heart = add([
    text("♥", { size: 28 }),
    pos(center().add(0, -50)),
    anchor("center"), color(255, 80, 100), fixed(), z(6),
  ]);
  heart.onUpdate(function() {
    heart.pos.y = center().y - 50 + Math.sin(time() * 2) * 6;
  });

  var winLussi = add([
    sprite("lussi"),
    pos(center().add(60, -40)),
    scale(3), anchor("center"), fixed(), z(5),
  ]);
  winLussi.play("idle");
  winLussi.flipX = true;
  winLussi.onUpdate(function() {
    winLussi.pos.y = center().y - 40 + Math.sin(time() * 1.5 + 1) * 4;
  });

  add([text("Du fant Lussi!", { size: 48, align: "center" }),
       pos(center().add(0, 40)), anchor("center"), color(255, 240, 100), fixed(), z(10)]);
  add([text("Barna Ylva og Vetle er så glade!", { size: 20, align: "center" }),
       pos(center().add(0, 100)), anchor("center"), color(200, 220, 255), fixed(), z(10)]);

  var knapp = add([
    rect(260, 48), pos(center().add(0, 160)),
    color(60, 130, 60), anchor("center"), area(), fixed(), z(10), "restartKnapp",
  ]);
  add([text("Spill på nytt", { size: 22, align: "center" }),
       pos(center().add(0, 160)), anchor("center"), color(255, 255, 255), fixed(), z(11)]);

  knapp.onHover(function()    { knapp.color = rgb(80, 180, 80);  });
  knapp.onHoverEnd(function() { knapp.color = rgb(60, 130, 60); });
  knapp.onClick(function()    { go("start"); });
});
