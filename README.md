# Jakten på Lussi

A top-down adventure game built with [Kaplay v3](https://kaplayjs.com/) where children explore a two-story house and the street outside to find their missing cat, Lussi.

## The Story

Ylva and Vetle wake up to discover that their cat Lussi hasn't eaten her food. The player picks one of the two children and explores the house — bedrooms, bathroom, kitchen, living room — before heading outside to the street where Lussi is hiding. But Lussi is quick! She escapes 5 times before getting tired enough to be caught.

## How to Play

- **Keyboard**: WASD or arrow keys to move
- **Touch/Mouse**: Tap or click where you want to walk
- **Doors**: Walk into door openings (marked with a bouncing yellow arrow) to move between rooms
- **Stairs**: Walk onto the staircase to move between floors

The game is optimized for **iPad in landscape orientation** but works on any modern browser.

## Game Flow

```
Start Screen (pick Ylva or Vetle)
  └─→ Kitchen (discover Lussi's untouched food bowl)
        └─→ Explore 2-floor house (7 rooms + 2 stairwells)
              └─→ Exit to the street
                    └─→ Chase Lussi (she escapes 5 times!)
                          └─→ Catch her → Victory!
```

### Scenes

| Scene | Description |
|-------|-------------|
| `start` | Character selection (Ylva or Vetle) |
| `etasje2_kjokken` | Kitchen — starting room, food bowl trigger |
| `etasje2_stue` | Living room — second floor hub with stairs |
| `etasje2_mamma` | Mother's bedroom |
| `etasje1_gang` | Hallway — first floor hub with stairs and exit |
| `etasje1_ylva` | Ylva's bedroom (hidden "MJAU!" zone) |
| `etasje1_vetle` | Vetle's bedroom |
| `etasje1_bad` | Bathroom |
| `gata` | Street — Lussi chase sequence |
| `vinn` | Victory screen |

## Technical Overview

### Engine & Setup

- **Kaplay v3** (v3001.0.19) loaded from CDN
- **Resolution**: 800x600 (4:3 aspect ratio — matches iPad perfectly)
- **Rendering**: `crisp: true` for sharp nearest-neighbor pixel art scaling
- **Physics**: Gravity disabled (top-down perspective)
- `pixelDensity: 1` to avoid unnecessary retina rendering overhead

### Room Scaling System

All house rooms are defined in an original 800x600 coordinate space, then scaled and centered via a set of constants and helper functions:

```js
const ROOM_S  = 0.765;  // Scale factor
const ROOM_W  = 612;    // Scaled width
const ROOM_H  = 459;    // Scaled height
const ROOM_OX = 94;     // X margin (centering)
const ROOM_OY = 71;     // Y margin (centering)

function rx(x) { return Math.round(ROOM_OX + x * ROOM_S); }
function ry(y) { return Math.round(ROOM_OY + y * ROOM_S); }
function rw(w) { return Math.round(w * ROOM_S); }
function rh(h) { return Math.round(h * ROOM_S); }
```

This means every room scene uses original coordinates (e.g., `makeDeco(rx(50), ry(80), rw(160), rh(120), ...)`), and the scaling can be adjusted by changing a single constant. `makeRoomShell(floorType)` generates the standard four walls and tiled floor.

### Character Animation System

Each playable character has three sprite sheets:
- **Idle** (static, 4 frames — one per direction)
- **Idle animation** (breathing, 6 frames x 4 directions = 24 frames)
- **Run animation** (6 frames x 4 directions = 24 frames)

The `setupControls()` function tracks movement state and direction, swapping between `_idle_anim` and `_run` sprites and calling `play("run_down")`, `play("idle_left")`, etc. A `currentAnim` tracker avoids redundant animation restarts.

### Lussi (Cat) Animation

Lussi uses `Cat_Grey.png` from the Cat_85_Animations pack — a 320x2944 sprite sheet with 32x32 frames (10 columns, 92 rows, 483 frames total). Only a subset of animations are used, chosen to avoid blank frames present in some sequences:

| Animation | Frames | Tag | Notes |
|-----------|--------|-----|-------|
| `idle` | 0–3 | Idle_1 | Standing, side view |
| `walk` | 32–39 | W_1 | 8 frames, clear leg movement |
| `run` | 212–217 | Run_2 | 6 frames, all populated (Run_1 has blank frames) |

### Chase Mechanic

When the player approaches Lussi on the street (within 60px), she flees:

1. Picks the escape spot **farthest from the player** from 15 predefined safe locations (skipping spots within 80px of her current position)
2. Switches to `run` animation and moves at 350px/sec
3. `flipX` is set once at flee start (not per-frame) to avoid directional jitter
4. On arrival, switches to `idle` and starts a **1.5-second cooldown**
5. After **5 escapes**, Lussi becomes catchable — UI shows "Lussi er sliten! Fang henne!"

### Door System

`makeDoorway(x, y, w, h, tag, label)` creates:
- A dark opening (near-black, 85% opacity)
- Light brown trim strips on each side
- A **bouncing yellow arrow** (▼) above the opening
- A label with dark pill background for readability

`onDoor()` connects door collisions to scene transitions with a 1-second cooldown to prevent bounce-back when arriving through the same door.

### iOS / iPad Optimizations

**HTML (`index.html`):**
- `viewport-fit=cover` + `maximum-scale=1.0` — fills screen, prevents pinch zoom
- `apple-mobile-web-app-capable` — fullscreen when added to home screen
- `overscroll-behavior: none` + `position: fixed` — prevents Safari bounce
- `touch-action: none` on canvas — disables double-tap zoom and long-press menu
- Portrait orientation overlay — shows "Snu iPaden sidelengs" message with animated icon (CSS-only, no JS)

**Audio (`game.js`):**
- iOS Safari blocks audio until user interaction
- On character selection tap, Kaplay's own `audioCtx` is checked and resumed if suspended
- Music starts only after the resume promise resolves

### Audio

| Sound | File | Trigger |
|-------|------|---------|
| Background music | `Track 1 (Let's Go).wav` | Character selection (loops) |
| Bowl voice-over | `lussi-bowl.m4a` | First approach to food bowl |

## Project Structure

```
the-hunt-for-lussi/
├── index.html                          # Entry point, CSS, iPad meta tags
├── game.js                             # All game logic (single file)
├── README.md
└── assets/
    ├── Cat_85_Animations/              # Lussi cat sprites
    │   ├── Cat_Grey.png                #   Used in-game (dark cat)
    │   ├── Cat_Ginger.png              #   Available alternative
    │   └── Cat_Grey_White.png          #   Available alternative
    ├── Modern_Interiors_Free_v2.2/     # Tileset pack
    │   └── Modern tiles_Free/
    │       ├── Characters_free/        #   Ylva (Amelia) & Vetle (Adam)
    │       │   ├── *_idle_16x16.png    #     Static directional frames
    │       │   ├── *_idle_anim_16x16.png #   Breathing animation
    │       │   └── *_run_16x16.png     #     Run animation
    │       └── Interiors_free/32x32/
    │           ├── Room_Builder_free_32x32.png  # Floors & walls
    │           └── Interiors_free_32x32.png     # Furniture
    ├── Music/
    │   └── Track 1 (Let's Go).wav      # Background music
    └── voice/
        └── lussi-bowl.m4a              # Kitchen bowl voice-over
```

## Running the Game

Serve the project directory with any static HTTP server:

```bash
# Using Node.js
npx serve .

# Using Python
python3 -m http.server 8000
```

Then open `http://localhost:8000` (or `http://localhost:3000` for `serve`) in a browser.

> **Note**: Opening `index.html` directly via `file://` will not work due to browser security restrictions on loading assets.

## Asset Credits

- **Modern Interiors** tileset by [LimeZu](https://limezu.itch.io/) (free version)
- **Cat_85_Animations** sprite pack
- Background music: "Track 1 (Let's Go)"
