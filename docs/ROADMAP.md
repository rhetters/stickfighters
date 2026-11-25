# Roadmap

What's done, what's next, and what each upcoming milestone means. **This is the only file that tracks status:** the Status column below is the record, and no other document repeats it. History (what changed when) is in [CHANGELOG.md](CHANGELOG.md); the long-term direction and the architecture rules are in [VISION.md](VISION.md); how the code works is in [ARCHITECTURE.md](ARCHITECTURE.md); the move design is in [COMBAT.md](COMBAT.md).

Each milestone has an ID. Say "Start M12" or "change the scope of M12", and Claude builds against that milestone's **Done when**. Every milestone ends with a playable published build. When one is finished, its row here becomes Done and its detailed plan moves to [archive/roadmap-history.md](archive/roadmap-history.md), which is a frozen record and is never edited.

## Milestones

| ID | Milestone | Status | Size | Needs | What you can play |
|---|---|---|---|---|---|
| M0 | Foundation, training room, game shell | Done | M | none | Title, pause, settings, hitbox view, input history |
| M1 | Input system and mobile/iPad controls | Done | M | M0 | Full control scheme on keyboard, touch, gamepad |
| M2 | Combat engine and directional combos | Done | XL | M1 | Neutral, Up, Down, and Air strings from the chart |
| M3 | Surge (stamina) system | Done | L | M2 | Yellow bar, Surge run with phasing, Surge jump, Surge strings |
| M4 | Collision and impact feel | Done | XL | M2, M3 | Weight, momentum, wall splat, bowling, juggles, grab and throw; ready for a second player |
| M5 | Ragdoll, death poses, cleanup | Done | L | M4 | Physics bodies, death poses, clean fade-out |
| M6 | Custom touch layout | Done | M | M1 | Drag and resize every touch control, saved layout profiles |
| M7 | Enemy AI and roster v2 | Done | L | M4, M5 | New enemy types, AI director, boss hooks |
| M7.5 | Restructure: files, docs, self-test | Done | M | M7 | Same game; code split into files, docs in the repo, `?selftest` determinism check |
| M8 | Level framework, modes, Level 1: Wooded Trail | Done | L | M7.5 | Scrolling level with parallax layers; the wave game becomes Arcade mode |
| M9 | Local multiplayer: co-op and versus | Done | XL | M8 | Join with controllers on the TV, Smash-style versus arena, two-to-four-player co-op |
| M10 | Ninja stars, cosmetic store, character creation | Done | L | M8, M9 | Star drops, store by slot, create and dress your fighter (each player in local multiplayer), save backup |
| M11 | Online multiplayer (internet, cross-play) | Done | XL | M9, M10 | Host / Join with a room code; PC, iPad and phone together; co-op, Arcade and Versus |
| M12 | XP, levels, skill tree | Done | L | M3, M8, M10 | Level-ups, skill points, tree screen |
| M13 | Themes and procedural runs | Done | XL | M8, M10, M12 | Castle Siege, Pirate Cove, Mountain and Space generated from a seed, a Campaign screen, transitions per theme, platforms, mini-bosses, four main bosses |
| M14 | Boss level | Done | L | M13 | A look of its own for every boss, a slow-motion finale, a victory screen and harder replays, online rooms of 6, picture menus |
| M15 | Platforms, vertical layers and boss fights | Done | L | M13, M14 | The Volcano: steam vents, falling lava rocks, a climb down into the crater on ledges the pink army follows you up and down, and the Pink Tiki's lava escape |
| M16 | Polish, audio, balance | Done | L | M8–M15 | Music for every theme and boss, a full sound pass, difficulty choices, a balance pass, a first-play tutorial, a picture-menu character screen |
| M17 | Level creator | Next | L | M8, M13 | Rhett builds levels that join the procedural pools |
| M18 | House builder and visiting | Done | L | M10, M11 | Build a house with stars, invite friends over |
| M11.5 | Rollback for online play (suggested before Steam) | Maybe | L | M11 | Your presses act instantly online; others are predicted and corrected |
| Someday | Cloud saves, Steam | Maybe | — | M11.5 (suggested) | Desktop app, Steam Workshop, server-backed stars |

## Upcoming milestones

### M17 · Level creator

- A mode for Rhett that edits a grid and saves a chunk or a whole level in the same data format the game uses.
- His levels can be played directly and can be added to the procedural pools.
- Levels are checked when loaded (sizes, known IDs only) and are never run as code (rule R3).

How it works (decided by Claude, November 24; Ron asked for its picture between CHARACTER and HOUSE on Customize):
- **LEVELS** on Customize opens Rhett's levels (up to 12) and NEW LEVEL, which asks for a place (any of the 15 biomes, shown as pictures of the real scenery).
- **The editor** shows the real scenery of that place with a grid over it, like the house builder: picture tools for **platforms** (tap or drag along a row, five heights), **enemies** (the six pink army types and the place's own mini-boss, dropped where you tap, up to 10 a fight), **scenery** (that place's props), the **fight flag** (where the fight locks the screen) and the **eraser**. A level is up to 6 parts; each part is 900 to 2400 pixels wide.
- **PLAY** plays the level right away from the editor (a sign at the start, an arch at the end) and comes back to it. Playing your own levels earns no stars or XP, so they can't be used to farm.
- **In stories:** a star on each part with a fight puts it in that place's pool. When a story is generated, each fight in that place has a chance of being one of Rhett's parts instead (his platforms, enemies and scenery). Online, the host's parts go to everyone with the start of the run.
- **Checked when loaded:** sizes and counts are limited, only known places, enemy types and scenery are kept, everything else is dropped. Levels live in the save (a new save version).

**Done when:** Rhett builds a level on the iPad, plays it, and sees his chunks appear in generated runs.

### M11.5 · Rollback for online play (suggested before Steam)

- Why: Versus at 58 ping felt laggy in the first real test. The direct-connection patch halved the delay; rollback removes most of the rest.
- How: your own presses take effect at once (with a small built-in delay of 1–2 frames). Other players are predicted to keep pressing what they last pressed; when their real presses arrive and differ, the game rewinds to that frame and replays up to now within the same screen refresh.
- Needs: saving and restoring the whole fight state every frame (fighters, enemies, ragdolls, the random seed, mode state), replays that don't repeat sounds and effects, and a limit on how far back it rewinds (about 8 frames).
- When: someday, before the move to Steam. It only helps online Versus between houses (not local play, same-house play or co-op against the computer), and it adds a little to every later change that adds gameplay state, so it waits until online Versus between houses is a regular thing.

**Done when:** Versus between two houses at about 60 ping feels close to local, with no desyncs over a 10-minute match.

### Someday · Cloud saves and Steam

Kept possible, not planned: cloud saves; a desktop app on Steam with Steam Workshop for editor levels and server-owned stars and inventory (why rules R7 and R8 exist). Anything public-facing with kids' accounts raises privacy and moderation questions, so it stays family-only unless Ron decides otherwise.

## Open decisions

1. **Back moves.** Add Back+P Backfist and Back+K Back Kick, which hit behind you? Not in the combat chart yet.

Settled decisions (Surge, phasing, grab and throw, side-scrolling levels, blocking) are in the archive.

## Suggested next step

M17: Rhett builds a level on the iPad, plays it, and stars a part to see it turn up in a story.
