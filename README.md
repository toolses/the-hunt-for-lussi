# Jakten på Lussi

A top-down pixel-art adventure game built with [Kaplay v3](https://kaplayjs.com/) where children explore a two-story house and the street outside to find their missing cat, Lussi. All in-game text and voice acting is in Norwegian.

## The Story

Ylva and Vetle wake up to discover that their cat Lussi hasn't eaten her food. The player picks one of the two children and explores the house — bedrooms, bathroom, kitchen, living room — searching every room for the cat. Lussi is spotted hiding in each room and bolts for the door before they can reach her. Once every room has been searched, the front door unlocks and the chase continues outside on the street. But Lussi is fast — she escapes 5 times before getting tired enough to be caught!

## How to Play

- **Keyboard**: WASD or arrow keys to move
- **Touch/Mouse**: Tap or click where you want to walk
- **Doors**: Walk through door openings (arched or dark openings) to move between rooms
- **Stairs**: Walk onto the staircase to move between floors

The game is optimised for **iPad in landscape orientation** but works on any modern browser.

## Game Flow

```
Start Screen (pick Ylva or Vetle)
  └─→ Kitchen (2F — discover Lussi's untouched food bowl)
        └─→ Explore the house (5 searchable rooms across 2 floors)
              └─→ All rooms searched → front door unlocks
                    └─→ Street chase (Lussi escapes 5 times!)
                          └─→ Catch her → Victory!
```

### Scenes

| Scene | File | Description |
|-------|------|-------------|
| `start` | `js/scenes/start.js` | Character selection (Ylva or Vetle) |
| `etasje2_kjokken` | `js/scenes/kjokken.js` | Kitchen — starting room, food bowl trigger |
| `etasje2_stue` | `js/scenes/stue.js` | Living room — 2nd floor hub with stairs |
| `etasje2_mamma` | `js/scenes/mamma.js` | Mother's bedroom |
| `etasje1_gang` | `js/scenes/gang.js` | Hallway — 1st floor hub with stairs and front door |
| `etasje1_ylva` | `js/scenes/ylva.js` | Ylva's bedroom |
| `etasje1_vetle` | `js/scenes/vetle.js` | Vetle's bedroom |
| `etasje1_bad` | `js/scenes/bad.js` | Bathroom |
| `gata` | `js/scenes/gata.js` | Street — Lussi chase sequence |
| `vinn` | `js/scenes/vinn.js` | Victory screen |

### Room Search Progress

Five rooms must be searched before the front door unlocks: living room, mother's bedroom, Ylva's room, Vetle's room, and the bathroom. In each room, Lussi hides behind furniture — when the player gets close, she appears briefly, then bolts for the nearest door.

### Street Chase Mechanic

On the street, Lussi hides behind a bush. When the player approaches:
1. Lussi picks an escape spot scored by distance-from-player + 0.5 × distance-from-self
2. She picks randomly from the top 5 candidates and runs at 350 px/sec
3. After 5 escapes, she's tired — the next approach triggers victory
4. A heart counter (`♥♥♥♥♥`) tracks remaining escapes

---

## Technical Overview

### Engine & Setup

- **Kaplay v3** (v3001.0.19) loaded from CDN
- **Resolution**: 800 × 600 (4:3 — matches iPad)
- **Rendering**: `crisp: true` for sharp nearest-neighbor pixel art scaling, `pixelDensity: 2` for Retina
- **Physics**: Gravity disabled (top-down perspective)
- **No build step** — plain HTML + vanilla JS with `<script>` tags

### Project Structure

```
the-hunt-for-lussi/
├── index.html                     # Entry point — loads Kaplay + all JS in order
├── game.js                        # Legacy monolithic PoC (not loaded, kept for reference)
├── apple-touch-icon.png           # iOS home-screen icon
├── generate-icon.html             # Utility to generate the app icon
├── js/
│   ├── init.js                    # kaplay() config + iOS AudioContext fix
│   ├── constants.js               # Room geometry, door positions, SPAWNS, room-search tracking
│   ├── assets.js                  # All loadSprite / loadSpriteAtlas / loadSound calls
│   ├── helpers.js                 # makeRoomLevel, makeArchDoor, makePlayer, addRoomLussi, etc.
│   ├── main.js                    # go("start") + Ctrl+Shift+Q dev-tool shortcut
│   └── scenes/
│       ├── start.js               # Character selection screen
│       ├── kjokken.js             # Kitchen (starting room)
│       ├── stue.js                # 2F living room hub
│       ├── mamma.js               # Mother's bedroom
│       ├── gang.js                # 1F hallway hub
│       ├── ylva.js                # Ylva's bedroom
│       ├── vetle.js               # Vetle's bedroom
│       ├── bad.js                 # Bathroom
│       ├── gata.js                # Street / exterior
│       ├── vinn.js                # Victory screen
│       └── dev_tool.js            # Spritesheet coordinate finder (dev only)
├── README.md
└── assets/
    ├── Room_Builder/              # Tileset sheets (walls, floors, shadows, 3D caps, arches)
    ├── Cat_85_Animations/         # Lussi (Cat_Grey.png) + unused colour variants
    ├── Modern_Interiors_Free_v2.2/# LimeZu interior pack (characters + furniture atlas)
    ├── Modern_Interiors/          # Individual furniture PNGs (bedroom, bathroom, kitchen, living room)
    ├── Modern_Exteriors/          # Houses, trees, bushes, trampoline
    ├── Music/                     # "Track 1 (Let's Go).wav" — background loop
    └── Voice/                     # 5 Norwegian voice clips (.m4a)
```

### Room Construction

Rooms are built by `makeRoomLevel()` using a layered Z-index system:

| Z  | Layer       | Contents |
|----|-------------|----------|
|  0 | Floor       | Wood/tile sprites tiling the interior area |
|  1 | Shadows     | Semi-transparent shadow tiles along north + west walls |
|  5 | Walls       | Top wall (3 rows), side walls, bottom wall |
|  7 | Player/items| Player character, furniture sprites, room Lussi |
| 10 | Overhangs   | 3D wall-cap sprites + arch doorway sprites (render in front of player) |
| 11 | UI          | Lussi `?` indicator |

### Room Geometry

```
Canvas:  800 × 600
Room:    608 × 448  (19 × 14 tiles at 32px)
Offset:  ROOM_OX=96, ROOM_OY=76

Top wall:    96px (3 tiles)     Side walls: 32px (1 tile)
Bottom wall: 32px (1 tile)      Tile grid:  32 × 32px
```

Helper functions: `tileX(col)` / `tileY(row)` for tile-aligned coordinates, `rx(x)` / `ry(y)` for legacy scaled placement.

### Door System

Three door types connect rooms:

1. **Top-wall arch** — Gap in the north wall; arch sprites auto-placed by `makeRoomLevel`. Trigger via `makeDoorway()`.
2. **Bottom-wall arch** — `makeArchDoor()` places 6 arch sprites at z=10; `makeDoorway()` adds the collision trigger.
3. **Side-wall opening** — `makeSideWallDoor()` creates a dark overlay + collision trigger on left/right walls.

`onDoor()` connects all triggers to scene transitions with a 1-second cooldown to prevent bounce-back.

### Character Animation

Two playable characters (Ylva and Vetle), each with three sprite sheets:
- **idle** — 4 frames (1 per direction), static pose
- **idle_anim** — 24 frames (4 directions × 6 frames), breathing animation
- **run** — 24 frames (4 directions × 6 frames), movement animation

`setupControls()` handles keyboard (WASD / arrows) and touch/mouse input, switching between idle and run sprites based on movement.

### Lussi (Cat) Animation

`Cat_Grey.png` — 320 × 2944, 32 × 32px per frame (10 columns × 92 rows):

| Animation | Frames | Notes |
|-----------|--------|-------|
| `idle` | 0–3 | Side view, breathing |
| `walk` | 32–39 | 8-frame walk cycle |
| `run` | 212–217 | 6-frame fast run |

### Audio

| Sound | File | Usage |
|-------|------|-------|
| `bgmusic` | `Track 1 (Let's Go).wav` | Background music (looped, volume 0.1) |
| `lyd_matskaal` | `lussi-bowl.m4a` | Kitchen — "Food bowl is full" |
| `lyd_vetle_rom` | `vetle-rom.m4a` | Vetle's bedroom voice line |
| `lyd_ylva_rom` | `ylva-rom.m4a` | Ylva's bedroom voice line |
| `lyd_gaat_ut` | `har-lussi-gaat-ut.m4a` | "Maybe Lussi went outside" |
| `lyd_lussi_gjemt_inne` | `lussi-gjemt-seg-inne.m4a` | "Lussi might be hiding inside" |

### iOS / iPad Optimisations

- `apple-mobile-web-app-capable` for fullscreen home-screen app mode
- `viewport-fit=cover` + portrait overlay (CSS rotate prompt)
- `overscroll-behavior: none` + `position: fixed` prevents Safari bounce
- `touch-action: none` on canvas blocks double-tap zoom
- `audioCtx.resume()` called on first interaction and on `visibilitychange` / `focus` / `pageshow` to recover from iOS audio suspension

---

## Running the Game

Serve from any static HTTP server (`file://` won't load assets):

```bash
# Node.js
npx http-server . -p 8765

# Python
python3 -m http.server 8765
```

Then open `http://localhost:8765` in a browser.

### Dev Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+Q` | Open spritesheet coordinate finder (dev tool) |

**Quick scene jump** (paste in DevTools console after page load):
```js
selectedCharacter = "ylva"; go("etasje1_ylva", { fra: "" });
```

---

## Asset Credits

- **Modern Interiors** tileset by [LimeZu](https://limezu.itch.io/) (free version)
- **Modern Exteriors** tileset by [LimeZu](https://limezu.itch.io/) (free version)
- **Room Builder** tileset (walls, floors, shadows, arches, 3D caps)
- **Cat_85_Animations** sprite pack
- Background music: "Track 1 (Let's Go)"
