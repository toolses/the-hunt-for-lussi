// ============================================================
// JAKTEN PÅ LUSSI — Asset loading
// ============================================================

const ASSET = "assets/Modern_Interiors_Free_v2.2/Modern tiles_Free/";
const MI    = "assets/Modern_Interiors/";
const RB    = "assets/Room_Builder/";
const ME    = "assets/Modern_Exteriors/";
const CAT_ASSET = "assets/Cat_85_Animations/";

// ── Room Builder (Exact Custom Coordinates) ─────────────

// Floor
loadSpriteAtlas(RB + "Room_Builder_Floors_32x32.png", {
  "floor_center": { x: 192, y: 416, width: 32, height: 32 },
});

// Baseboard
loadSpriteAtlas(RB + "Room_Builder_baseboards_32x32.png", {
  "wall_baseboard": { x: 128, y: 64, width: 32, height: 32 },
});

// // Wall Top
// loadSpriteAtlas(RB + "Room_Builder_borders_32x32.png", {
//   "wall_top": { x: 224, y: 256, width: 32, height: 32 },
// });

// Wall Top
loadSpriteAtlas(RB + "Room_Builder_3d_walls_32x32.png", {
  "wall_top": { x: 352, y: 64, width: 32, height: 32 },
  "wall_top_shadow": { x: 352, y: 96, width: 32, height: 32 },
  "wall_top_corner-left": { x: 288, y: 32, width: 32, height: 32 },
  "wall_top_corner-right": { x: 448, y: 32, width: 32, height: 32 },
});

// Wall Bottom
loadSpriteAtlas(RB + "Room_Builder_borders_32x32.png", {
  "wall_bottom": { x: 224, y: 256, width: 32, height: 32 },
});

// Wall Face and Side Borders (Found in 3D walls sheet)
loadSpriteAtlas(RB + "Room_Builder_3d_walls_32x32.png", {
  "wall_face": { x: 384, y: 128, width: 32, height: 32 },
  "border_l":  { x: 320, y: 64, width: 32, height: 32 },
  "border_r":  { x: 416, y: 64, width: 32, height: 32 },
  "wall-left-side-top-1":  { x: 320, y: 32, width: 32, height: 32 },
  "wall-left-side-top-2":  { x: 288, y: 96, width: 32, height: 32 },
  "wall-right-side-top-1":  { x: 416, y: 32, width: 32, height: 32 },
  "wall-right-side-top-2":  { x: 448, y: 96, width: 32, height: 32 },
  "wall-corner-bottom-left":  { x: 320, y: 160, width: 32, height: 32 },
  "wall-corner-bottom-right":  { x: 416, y: 160, width: 32, height: 32 },
});

// ── Room Builder — floor shadows ─────────────────────────────
loadSpriteAtlas(RB + "Room_Builder_Floor_Shadows_32x32.png", {
  "shadow_t": { x: 0,  y: 0, width: 32, height: 32 },
  "shadow_l": { x: 32, y: 0, width: 32, height: 32 },
});

// ── Room Builder — arched entryways ──────────────────────────
loadSpriteAtlas(RB + "Room_Builder_Arched_Entryways_32x32.png", {
  "arch_tl": { x: 0,  y: 0,  width: 32, height: 32 },
  "arch_tc": { x: 32, y: 0,  width: 32, height: 32 },
  "arch_tr": { x: 64, y: 0,  width: 32, height: 32 },
  "arch_ml": { x: 0,  y: 32, width: 32, height: 32 },
  "arch_mc": { x: 32, y: 32, width: 32, height: 32 },
  "arch_mr": { x: 64, y: 32, width: 32, height: 32 },
});

// ── Legacy Room Builder floors (from old atlas, for gang/trappehus) ──
loadSpriteAtlas(ASSET + "Interiors_free/32x32/Room_Builder_free_32x32.png", {
  "floor_wood":         { x: 32,  y: 384, width: 32, height: 32 },
  "floor_wood_tl":      { x: 0,   y: 352, width: 32, height: 32 },
  "floor_wood_t":       { x: 32,  y: 352, width: 32, height: 32 },
  "floor_wood_tr":      { x: 64,  y: 352, width: 32, height: 32 },
  "floor_wood_l":       { x: 0,   y: 384, width: 32, height: 32 },
  "floor_wood_r":       { x: 64,  y: 384, width: 32, height: 32 },
  "floor_wood_dark":    { x: 32,  y: 448, width: 32, height: 32 },
  "floor_wood_dark_tl": { x: 0,   y: 416, width: 32, height: 32 },
  "floor_wood_dark_t":  { x: 32,  y: 416, width: 32, height: 32 },
  "floor_wood_dark_tr": { x: 64,  y: 416, width: 32, height: 32 },
  "floor_wood_dark_l":  { x: 0,   y: 448, width: 32, height: 32 },
  "floor_wood_dark_r":  { x: 64,  y: 448, width: 32, height: 32 },
  "floor_bath":         { x: 288, y: 288, width: 32, height: 32 },
  "floor_stone":        { x: 288, y: 352, width: 32, height: 32 },
});

// ── Individual furniture sprites (Modern_Interiors/ — 32x32 grid) ──

// Bedroom
loadSprite("bed_single",  MI + "Bedroom/Bedroom_Singles_32x32_191_Single_Bed.png");       // 32x96  (1x3)
loadSprite("bed_queen",   MI + "Bedroom/Bedroom_Singles_32x32_266_Queen_Size_Bed.png");   // 64x96  (2x3)
loadSprite("drawer",      MI + "Bedroom/Bedroom_Singles_32x32_392_Drawer.png");           // 64x64  (2x2)
loadSprite("playmat",     MI + "Bedroom/Bedroom_Singles_32x32_453_Vetle_Playmat.png");    // 64x96  (2x3)
loadSprite("cabinet",     MI + "Bedroom/Bedroom_Singles_32x32_520_Cabinet.png");          // 32x80  (1x2.5)

// Bathroom
loadSprite("bathtub",     MI + "Bathroom/Bathroom_Singles_32x32_Bathtub.png");            // 64x96  (2x3)
loadSprite("bath_cabinet_1", MI + "Bathroom/Bathroom_Singles_32x32_Cabinet_1.png");       // 32x64  (1x2)
loadSprite("bath_cabinet_2", MI + "Bathroom/Bathroom_Singles_32x32_Cabinet_2.png");       // 32x64  (1x2)
loadSprite("sink",        MI + "Bathroom/Bathroom_Singles_32x32_Faucet.png");             // 64x96  (2x3)
loadSprite("toilet",      MI + "Bathroom/Bathroom_Singles_32x32_Toilet.png");             // 32x96  (1x3)
loadSprite("washer",      MI + "Bathroom/Bathroom_Singles_32x32_Washing_Machine.png");    // 64x96  (2x3)

// Living Room
loadSprite("fireplace",    MI + "LivingRoom/Living_Room_Singles_32x32_111_Fireplace.png");    // 64x96  (2x3)
loadSprite("coffee_table", MI + "LivingRoom/Living_Room_Singles_32x32_35_Coffee_Table.png");  // 64x64  (2x2)
loadSprite("living_drawer",MI + "LivingRoom/Living_Room_Singles_32x32_58_Drawer.png");        // 64x80  (2x2.5)

// Kitchen
loadSprite("fridge",          MI + "Kitchen/Kitchen_Singles_32x32_165_Fridge.png");               // 64x80  (2x2.5)
loadSprite("chair_right",     MI + "Kitchen/Kitchen_Singles_32x32_282_Chair_Facing_Right.png");   // 32x64  (1x2)
loadSprite("chair_left",      MI + "Kitchen/Kitchen_Singles_32x32_286_Chair_Facing_Left.png");    // 32x64  (1x2)
loadSprite("kitchen_table",   MI + "Kitchen/Kitchen_Singles_32x32_309_Table.png");                // 64x64  (2x2)
loadSprite("kitchen_faucet",  MI + "Kitchen/Kitchen_Singles_32x32_374_Faucet_Facing_Left.png");   // 32x80  (1x2.5)
loadSprite("cupboard",        MI + "Kitchen/Kitchen_Singles_32x32_Cupboard.png");                 // cupboard

// ── Exterior sprites ──────────────────────────────────────────
loadSprite("me_house",      ME + "24_Additional_Houses_Terraced_House_3_16x16.png");
loadSprite("me_house_nb",   ME + "24_Additional_Houses_One_Story_House_16x16.png");
loadSprite("me_house_nb2",  ME + "24_Additional_Houses_Terraced_House_Modular_6_16x16.png");
loadSprite("me_tree_sm",    ME + "ME_Singles_City_Props_16x16_Tree_3.png");
loadSprite("me_tree_md",    ME + "ME_Singles_City_Props_16x16_Tree_6.png");
loadSprite("me_tree_lg",    ME + "ME_Singles_City_Props_16x16_Tree_12.png");
loadSprite("me_bush_lg",    ME + "ME_Singles_Garden_16x16_Bush_22.png");
loadSprite("me_bush_sm",    ME + "ME_Singles_Garden_16x16_Bush_14.png");
loadSprite("me_trampoline", ME + "ME_Singles_Villas_16x16_Villa_Yard_Toy_Trampoline_1.png");

// ── Lussi (Cat_Grey) ──────────────────────────────────────────
loadSprite("lussi", CAT_ASSET + "Cat_Grey.png", {
  sliceX: 10, sliceY: 92,
  anims: {
    "idle": { from: 0,   to: 3,   loop: true, speed: 6  },
    "walk": { from: 32,  to: 39,  loop: true, speed: 10 },
    "run":  { from: 212, to: 217, loop: true, speed: 14 },
  },
});

// ── Player characters ─────────────────────────────────────────
loadSprite("ylva_idle",      ASSET + "Characters_free/Amelia_idle_16x16.png",      { sliceX: 4 });
loadSprite("vetle_idle",     ASSET + "Characters_free/Adam_idle_16x16.png",         { sliceX: 4 });
loadSprite("ylva_idle_anim", ASSET + "Characters_free/Amelia_idle_anim_16x16.png", {
  sliceX: 24,
  anims: {
    "idle_right": { from: 0,  to: 5,  loop: true, speed: 6 },
    "idle_up":    { from: 6,  to: 11, loop: true, speed: 6 },
    "idle_left":  { from: 12, to: 17, loop: true, speed: 6 },
    "idle_down":  { from: 18, to: 23, loop: true, speed: 6 },
  },
});
loadSprite("vetle_idle_anim", ASSET + "Characters_free/Adam_idle_anim_16x16.png", {
  sliceX: 24,
  anims: {
    "idle_right": { from: 0,  to: 5,  loop: true, speed: 6 },
    "idle_up":    { from: 6,  to: 11, loop: true, speed: 6 },
    "idle_left":  { from: 12, to: 17, loop: true, speed: 6 },
    "idle_down":  { from: 18, to: 23, loop: true, speed: 6 },
  },
});
loadSprite("ylva_run", ASSET + "Characters_free/Amelia_run_16x16.png", {
  sliceX: 24,
  anims: {
    "run_right": { from: 0,  to: 5,  loop: true, speed: 10 },
    "run_up":    { from: 6,  to: 11, loop: true, speed: 10 },
    "run_left":  { from: 12, to: 17, loop: true, speed: 10 },
    "run_down":  { from: 18, to: 23, loop: true, speed: 10 },
  },
});
loadSprite("vetle_run", ASSET + "Characters_free/Adam_run_16x16.png", {
  sliceX: 24,
  anims: {
    "run_right": { from: 0,  to: 5,  loop: true, speed: 10 },
    "run_up":    { from: 6,  to: 11, loop: true, speed: 10 },
    "run_left":  { from: 12, to: 17, loop: true, speed: 10 },
    "run_down":  { from: 18, to: 23, loop: true, speed: 10 },
  },
});
// Aliases used on start screen
loadSprite("ylva",  ASSET + "Characters_free/Amelia_idle_16x16.png", { sliceX: 4 });
loadSprite("vetle", ASSET + "Characters_free/Adam_idle_16x16.png",   { sliceX: 4 });

// ── Character Generator — kids layer sprites ──────────────────
const GEN = "assets/Character_Generator/kids/";

// Bodies (sliceX:24, sliceY:8 = 768×256)
(function() {
  for (var b = 1; b <= 4; b++) {
    loadSprite("gen_body_" + b,
      GEN + "Body_" + b + "_kid_32x32.png",
      { sliceX: 24, sliceY: 8 });
  }
  // Eyes (sliceX:24, sliceY:6 = 768×192)
  for (var e = 1; e <= 6; e++) {
    loadSprite("gen_eyes_" + e,
      GEN + "Eyes_kids_32x32_" + e + ".png",
      { sliceX: 24, sliceY: 6 });
  }
  // Outfits (sliceX:24, sliceY:6 = 768×192)
  for (var o = 1; o <= 5; o++) {
    loadSprite("gen_outfit_" + o,
      GEN + "Outfit_kid_" + o + "_32x32.png",
      { sliceX: 24, sliceY: 6 });
  }
  // Hairstyles 6 styles × 5 colors (sliceX:24, sliceY:8 = 768×256)
  for (var h = 1; h <= 6; h++) {
    for (var c = 1; c <= 5; c++) {
      loadSprite("gen_hair_" + h + "_" + c,
        GEN + "Hairstyle_kid_" + h + "_32x32_" + c + ".png",
        { sliceX: 24, sliceY: 8 });
    }
  }
})();

// ── Dev tool: raw spritesheets ──────────────────────────────────
loadSprite("raw_walls",      RB + "Room_Builder_Walls_32x32.png");
loadSprite("raw_floors",     RB + "Room_Builder_Floors_32x32.png");
loadSprite("raw_borders",    RB + "Room_Builder_borders_32x32.png");
loadSprite("raw_3d",         RB + "Room_Builder_3d_walls_32x32.png");
loadSprite("raw_baseboards", RB + "Room_Builder_baseboards_32x32.png");
loadSprite("raw_arches",     RB + "Room_Builder_Arched_Entryways_32x32.png");

// ── Audio ──────────────────────────────────────────────────────
// Treat pickup sound — add the file to enable (e.g. assets/Sound/pling.wav):
// loadSound("lyd_pling", "assets/Sound/pling.wav");

// Background music (looping) — add the file to enable (e.g. assets/Music/Track 1 (Let's Go).wav):
loadSound("bgmusic",            "assets/Music/Track 1 (Let's Go).wav");

// Dialogue voice-overs — add the files to enable (e.g. assets/Voice/vo_fant_skaal.m4a):
loadSound("lyd_matskaal",       "assets/voice/lussi-bowl.m4a");
loadSound("lyd_vetle_rom",      "assets/Voice/vetle-rom.m4a");
loadSound("lyd_ylva_rom",       "assets/Voice/ylva-rom.m4a");
loadSound("vo_lussi_gaat_ut",          "assets/Voice/vo_lussi_gaat_ut.m4a");
loadSound("lyd_lussi_gjemt_inne", "assets/Voice/lussi-gjemt-seg-inne.m4a");
loadSound("vo_fant_skaal",        "assets/Voice/vo_fant_skaal.m4a");
loadSound("vo_fyller_vann",       "assets/Voice/vo_fyller_vann.m4a");
loadSound("vo_vann_ferdig",       "assets/Voice/vo_vann_ferdig.m4a");
loadSound("vo_lussi_ikke_ute",    "assets/Voice/vo_lussi_ikke_ute.m4a");

// ── Ambient audio placeholders ─────────────────────────────
// Place the audio files in assets/Audio/ to enable them.
loadSound("amb_rain",           "assets/Audio/amb_rain.mp3");
loadSound("amb_night_crickets", "assets/Audio/amb_night_crickets.mp3");
loadSound("amb_birds",          "assets/Audio/amb_birds.mp3");
loadSound("amb_street_2",       "assets/Audio/amb_street_2.mp3");
loadSound("lyd_bounce",         "assets/Audio/lyd_bounce.mp3");
loadSound("vo_venn_hilsen",     "assets/Voice/vo_venn_hilsen.m4a");

// ── Bicycle & physics sound placeholders ──────────────────────
// Place the audio files in assets/Audio/ to enable them.
loadSound("lyd_sykkel_ring",  "assets/Audio/lyd_sykkel_ring.mp3");
loadSound("lyd_sykkel_kost",  "assets/Audio/lyd_sykkel_kost.mp3");
loadSound("lyd_spark",        "assets/Audio/lyd_spark.mp3");
loadSound("lyd_hopp",         "assets/Audio/lyd_hopp.mp3");
loadSound("lyd_boks",         "assets/Audio/lyd_boks.mp3");
loadSound("lyd_jubel",        "assets/Audio/lyd_jubel.mp3");
