# Jakten på Lussi — Claude Instructions

## Project overview

See [README.md](README.md) for the full project description, including:
- Game story and mechanics (player-facing, in Norwegian)
- Changelog and version history
- Scene list and game flow
- Technical architecture (engine, room geometry, door system, Z-layers)
- Dialogue and voice-over system
- Audio asset table
- Running the game locally and dev shortcuts

## Key conventions

- **Language**: All in-game text, messages, and voice-overs are in Norwegian.
- **No build step**: Plain HTML + vanilla JS loaded via `<script>` tags in `index.html`. Script load order matters — `constants.js` → `assets.js` → `helpers.js` → `dialogue.js` → scenes.
- **Dialogue & VO**: Use `say("id")` from `js/dialogue.js` for any player-facing message. Never call `showMessage()` and `playVO()` separately in scene code. Add new entries to the `DIALOGUE` registry; set `vo: null` until the audio file exists.
- **Room geometry**: Use `tileX(col)` / `tileY(row)` for all positioned objects. Raw pixel math is a code smell here.
- **Sound loading**: All `loadSound()` calls live in `js/assets.js`. A sound must be loaded there before it can be referenced in `dialogue.js`.
- **Room search tracking**: `roomsSearched` in `constants.js` is the source of truth for which rooms have been cleared. `addRoomLussi()` in `helpers.js` sets entries to `true` — don't set them manually elsewhere.
- **Style**: `var` not `let`/`const` inside scene functions (matches existing codebase style). Top-level state in `constants.js` uses `let`.
