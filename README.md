# Jakten på Lussi

A top-down pixel-art adventure game built with [Kaplay v3](https://kaplayjs.com/) where children explore a two-story house and the street outside to find their missing cat, Lussi. All in-game text and voice acting is in Norwegian.

---

## For spillere

### Historien

Ylva og Vetle våkner og oppdager at katten Lussi ikke har spist maten sin. Velg ett av barna og let gjennom hele huset — soverom, bad, stue og kjøkken — for å finne henne. Lussi er lur: hver gang du kommer nær, stikker hun av til nærmeste dør! Når du har lett gjennom alle rommene, smetter hun ut, og den ordentlige jakten begynner ute på gata.

### Slik spiller du

- **Tastatur**: WASD eller piltastene for å gå
- **Touch/mus**: Trykk eller klikk der du vil gå
- **Dører**: Gå gjennom døråpninger (buer eller mørke åpninger) for å bevege deg mellom rom
- **Trapper**: Gå opp på trappen for å bytte etasje
- **Pause**: Trykk på **||**-knappen øverst til høyre for å sette spillet på pause — velg "Fortsett" for å spille videre, eller "Hjem" for å lagre og gå tilbake til startskjermen
- **Lyd av/på**: Trykk på **høyttaler-ikonet** (🔊) øverst til høyre for å slå lyd av eller på

Spillet er optimalisert for **iPad i liggende retning**, men fungerer i alle moderne nettlesere.

### Hva skal du gjøre?

1. **Velg karakter** — Ylva eller Vetle — på startskjermen
2. **Let gjennom alle rommene** — finn Lussi gjemt bak møbler i alle 5 rommene i huset
3. **Fyll vannskålen** — på kjøkkenet: sjekk skapet, fyll skålen ved vasken, og sett den på Lussis plass
4. **Samle fiskegodbitene** — de ligger spredt rundt i rommene; samler du alle, blir Lussi lettere å fange
5. **Jakt Lussi ute** — når alle rommene er lett gjennom, åpnes ytterdøren; Lussi gjemmer seg bak en busk ute på gata
6. **Fang henne!** — hun stikker av noen ganger før hun blir sliten nok til å la seg ta

### Tips

- Lussi husker hvor hun har vært — hun løper ikke til et rom du allerede har lett gjennom
- Samle alle fiskegodbitene før du går ut; det reduserer antall ganger Lussi stikker av på gata
- Se etter **?** som svever over møblene — der gjemmer Lussi seg

---

## Changelog

### v0.1.0-alpha — 2026-04-07

First versioned alpha release.

**Gameplay**
- Two playable characters: Ylva and Vetle
- 5 searchable rooms across 2 floors (living room, mother's bedroom, Ylva's room, Vetle's room, bathroom)
- Lussi hides in each room and flees when approached; all 5 must be searched before going outside
- Street chase sequence: Lussi escapes multiple times before becoming catchable (fewer escapes if all fish treats collected)
- Lussi in the living room now flees to the stairs if Mamma's room has already been searched
- Water bowl quest: find the bowl in the kitchen cupboard, fill it at the faucet, place it at Lussi's spot
- Fish treat collection (11 treats across rooms) with persistent state between room visits
- Quest log HUD (top-left) and inventory bar (bottom-center)
- Pause menu (||) and mute toggle (🔊) buttons in top-right corner
- Victory screen on catching Lussi

**Audio & Dialogue**
- Norwegian voice acting for room entry (Ylva's room, Vetle's room) and water quest steps
- Centralised dialogue registry (`js/dialogue.js`): every on-screen message and its voice-over in one place
- Background music loop

**Platform**
- Optimised for iPad in landscape orientation (rotate prompt shown in portrait)
- iOS home-screen app support (`apple-mobile-web-app-capable`)

### v0.1.1-alpha — 2026-04-10

**Gameplay**
- New character creator scene: customise body type (4 options), outfit (5), hairstyle (6), and hair colour (5) using arrow buttons with a live front-facing preview
- Custom character is composited from layered sprites (body / eyes / outfit / hair) via the Canvas API and registered as a Kaplay animated sprite with idle and run cycles
- Custom character is saved permanently to `lussi_character` in localStorage — persists across sessions and is never wiped by "Nytt spill"
- Start screen shows a "Lag din egen karakter" button; resumed save with a custom character reloads the sprite without re-compositing

**UI**
- Hair colour selector shows a live colour swatch next to the numeric value

**Dev**
- E2E tests added for the character creator scene
- `.gitignore` updated to exclude debug spec files (`debug-*.spec.js`) and debug screenshot folders

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
├── js/
│   ├── init.js                    # kaplay() config + iOS AudioContext fix
│   ├── constants.js               # Room geometry, door positions, SPAWNS, room-search tracking
│   ├── assets.js                  # All loadSprite / loadSpriteAtlas / loadSound calls
│   ├── helpers.js                 # makeRoomLevel, makeArchDoor, makePlayer, addRoomLussi, etc.
│   ├── dialogue.js                # Dialogue registry + say() — every message and its VO in one place
│   ├── main.js                    # go("start") + Ctrl+Shift+Q dev-tool shortcut
│   └── scenes/
│       ├── start.js               # Start screen (resume / new game / character selection)
│       ├── character_creator.js   # Custom character builder (layer compositing)
│       ├── kjokken.js             # Kitchen (starting room, water bowl quest)
│       ├── stue.js                # 2F living room hub
│       ├── mamma.js               # Mother's bedroom
│       ├── gang.js                # 1F hallway hub
│       ├── ylva.js                # Ylva's bedroom
│       ├── vetle.js               # Vetle's bedroom
│       ├── bad.js                 # Bathroom
│       ├── gata.js                # Street / exterior (Lussi chase)
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
    └── Voice/                     # Norwegian voice clips (.m4a)
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

Helper functions: `tileX(col)` / `tileY(row)` for tile-aligned coordinates.

### Door System

Three door types connect rooms:

1. **Top-wall arch** — Gap in the north wall; arch sprites auto-placed by `makeRoomLevel`. Trigger via `makeDoorway()`.
2. **Bottom-wall arch** — `makeArchDoor()` places 6 arch sprites at z=10; `makeDoorway()` adds the collision trigger.
3. **Side-wall opening** — `makeSideWallDoor()` creates a dark overlay + collision trigger on left/right walls.

`onDoor()` connects all triggers to scene transitions with a 1-second cooldown to prevent bounce-back.

### Dialogue & Voice-Overs

All player-facing messages and their voice-over sounds are defined in `js/dialogue.js`:

```js
say("water_bowl_found");  // shows message + plays VO together
```

Each entry has `text`, `vo`, and `duration`. `vo: null` marks lines that still need audio recorded.

### Audio

| Sound key | File | Dialogue entry |
|-----------|------|----------------|
| `bgmusic` | `Track 1 (Let's Go).wav` | Background music (looped) |
| `vo_fant_skaal` | `vo_fant_skaal.m4a` | `water_bowl_found` |
| `vo_fyller_vann` | `vo_fyller_vann.m4a` | `water_bowl_filled` |
| `vo_vann_ferdig` | `vo_vann_ferdig.m4a` | `water_bowl_done` |
| `vo_lussi_gaat_ut` | `vo_lussi_gaat_ut.m4a` | `hint_check_outside` |
| `vo_lussi_ikke_ute` | `vo_lussi_ikke_ute.m4a` | `lussi_not_outside` |
| `lyd_vetle_rom` | `vetle-rom.m4a` | `enter_vetle` |
| `lyd_ylva_rom` | `ylva-rom.m4a` | `enter_ylva` |
| `lyd_matskaal` | `lussi-bowl.m4a` | *(not yet wired to a dialogue entry)* |
| `lyd_lussi_gjemt_inne` | `lussi-gjemt-seg-inne.m4a` | *(not yet wired to a dialogue entry)* |

### Character Animation

Two playable characters (Ylva and Vetle), each with three sprite sheets:
- **idle** — 4 frames (1 per direction), static pose
- **idle_anim** — 24 frames (4 directions × 6 frames), breathing animation
- **run** — 24 frames (4 directions × 6 frames), movement animation

`setupControls()` handles keyboard (WASD / arrows) and touch/mouse input.

### Pause Menu & Mute

Two icon buttons are placed in the top-right corner by `setupGlobalUI()` (present in all gameplay scenes):

| Button | Position | Action |
|--------|----------|--------|
| **Pause** (`||`) | `width() - 90, 40` | Opens `pauseGame()` overlay |
| **Sound** (🔊/🔇) | `width() - 40, 40` | Calls `toggleMute()` — flips `isMuted` and sets Kaplay `volume()` to 0 or 1 |

**Pause overlay** (`pauseGame()` in `helpers.js`):
- Sets `gamePaused = true` — player movement and treat pickup are blocked (`setupControls` short-circuits)
- Dark overlay (65% opacity) at z=200 covers the full screen
- **FORTSETT** (green) — destroys all `"pause_overlay"` objects, resumes play
- **HJEM** (red) — saves progress via `saveGame()`, then navigates to the start screen

All overlay elements are tagged `"pause_overlay"` for clean teardown on resume.

### Lussi (Cat) Animation

`Cat_Grey.png` — 320 × 2944, 32 × 32px per frame (10 columns × 92 rows):

| Animation | Frames | Notes |
|-----------|--------|-------|
| `idle` | 0–3 | Side view, breathing |
| `walk` | 32–39 | 8-frame walk cycle |
| `run` | 212–217 | 6-frame fast run |

### Save System (localStorage)

Game progress and custom character data are stored in the browser using two separate `localStorage` keys:

| Key | Contents | Lifetime |
|-----|----------|----------|
| `lussi_savegame` | Quest state, inventory, rooms searched, treats collected, selected character, last scene | Cleared on "Nytt Spill" |
| `lussi_character` | Custom character layers + composited sprite dataUrl | **Permanent** — survives new games |

**Auto-save triggers** — `saveGame()` is called automatically whenever:
- A fish treat is collected
- Lussi is found in a room (room search marked complete)
- A water bowl quest step is completed
- The Lussi chase status changes on the street

**Start screen behaviour:**
- **Save exists → Layout A**: "Fortsett reisen" (resumes from last scene) + "Nytt Spill" (clears progress, keeps custom character)
- **No save, custom character exists → Layout C**: Ylva / Vetle / "Din figur" (uses saved custom character) / "Ny figur" (opens character creator)
- **No save, no custom character → Layout B**: Ylva / Vetle / "Lag din egen" (standard 3-button layout)

**Custom character persistence** — The custom character sprite is composited from multiple PNG layers. The resulting base64 dataUrl is saved to `lussi_character` and is **never** cleared by `resetGame()`. On resume or "Din figur" selection, `loadCharacter()` calls `loadSprite()` with the stored dataUrl — no re-compositing needed.

**Robustness** — All localStorage reads/writes are wrapped in `try/catch` for Safari/iPad compatibility (quota errors, private browsing). A "💾 Lagret!" indicator briefly appears in the top-right corner after each save.

**Helper functions** (all in `js/helpers.js`):
- `saveGame()` — serialises progress to `lussi_savegame`
- `loadGame()` — restores progress; calls `loadCharacter()` if custom character
- `saveCharacter(dataUrl)` — persists custom character to `lussi_character`
- `loadCharacter()` — restores custom sprite from `lussi_character`
- `resetGame()` — removes `lussi_savegame` only, resets in-memory state
- `showSaveIndicator()` — fading "💾 Lagret!" UI overlay

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
