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
- **Save system**: Two localStorage keys — `lussi_savegame` (game progress, cleared on new game) and `lussi_character` (custom character data, persists permanently). Call `saveGame()` after any state change (treat pickup, room search, quest step). Never call `localStorage` directly in scene code — use the helpers `saveGame()`, `loadGame()`, `saveCharacter()`, `loadCharacter()`, `resetGame()` in `helpers.js`. The custom character (layers + dataUrl) is never wiped by `resetGame()`.
- **Style**: `var` not `let`/`const` inside scene functions (matches existing codebase style). Top-level state in `constants.js` uses `let`.

## Keeping README.md up to date

`README.md` is the single source of documentation for players and developers. Update it whenever a change affects what's documented there:

- **New feature or gameplay mechanic** → add to the player-facing "Slik spiller du" / "Hva skal du gjøre?" / "Tips" sections (in Norwegian) and to the relevant technical section.
- **New scene, quest, or room** → update the scene list, project structure tree, and room/door descriptions.
- **New audio or dialogue entry** → add a row to the Audio table.
- **New asset file or sprite** → update the Project Structure tree and, if applicable, the Asset Credits section.
- **Architecture change** (new helper, new system, changed Z-layers, new UI element) → add or update the matching technical section.
- **Changelog** → append a bullet under the current version's section for every user-visible change (gameplay, audio, platform, UI). Group bullets under **Gameplay**, **Audio & Dialogue**, **Platform**, or **UI** sub-headings as appropriate.
