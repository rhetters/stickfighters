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
| M16 | Polish, audio, balance, v1.0 release | Next | L | M8–M15 | Music for every theme and boss, a full sound pass, difficulty choices, a balance pass, a first-play tutorial; the game called 1.0 |
| M17 | Level creator | Planned | L | M8, M13 | Rhett builds levels that join the procedural pools |
| M18 | House builder and visiting | Done | L | M10, M11 | Build a house with stars, invite friends over |
| M11.5 | Rollback for online play (suggested before Steam) | Maybe | L | M11 | Your presses act instantly online; others are predicted and corrected |
| Someday | Cloud saves, Steam | Maybe | — | M11.5 (suggested) | Desktop app, Steam Workshop, server-backed stars |

## Upcoming milestones

### M16 · Polish, audio, balance, v1.0 release

Proposed November 23 (waiting on Ron's answers to the questions under Open decisions). The goal: the game that's there feels finished, with no new modes.

- **Music:** a loop for each theme (one per biome where it fits), the menus and the boss fights, plus a short victory tune. It changes with the action (quieter while walking, fuller in a fight, the boss's own track) and fades between them. Separate Music and Sound volumes in Settings (a save change, with a migration).
- **A full sound pass:** footsteps, jumps and landings, every enemy type and boss having its own grunt, the hazards (vents, lava, falling rocks, the geyser), menu taps, ninja stars, the ready stamp; ambient sound per biome (birds, waves, wind, a hum in space, bubbling lava).
- **Difficulty:** Easy, Normal and Hard for Story and Arcade (enemy health, damage and how many attack at once); online the host picks. Harder replays (+1) stack on top.
- **Balance pass:** measured with test bots playing every theme: how long a run takes, how much damage players take, stars and XP per run, so each theme is a little harder than the one before it and levelling stays steady. The numbers go to Ron before anything changes.
- **First-play tutorial:** a short guided start in the Training Room with picture prompts (move, jump, punch, kick, a combo, Surge, a grab), offered the first time someone plays; the move list also reachable from Pause.
- **Accessibility:** hit flashes and team colours that work with colour blindness, bigger text option (reduced screen shake and button remapping already exist).
- **Performance:** checked with 6 players and lots of enemies at iPad size; fewer effects automatically when the game slows down.
- **Version 1.0:** the title screen and version say 1.0; release notes in the CHANGELOG; Ron can make a release tag on GitHub.

**Done when:** every theme and boss has its music, the sound pass is in, the difficulty choices work alone, in co-op and online, the balance numbers have been reviewed with Ron, a new player can learn the basics from the tutorial, and 6 players run smoothly on the iPad.

### M17 · Level creator

- A mode for Rhett that edits a grid and saves a chunk or a whole level in the same data format the game uses.
- His levels can be played directly and can be added to the procedural pools.
- Levels are checked when loaded (sizes, known IDs only) and are never run as code (rule R3).

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

1. **M16 music:** made by the game itself (synthesized chiptune, nothing to download, Rhett can pick moods) or recorded tracks Ron finds (like the level-up sound; each one adds to the download and needs a license that allows it)?
2. **M16 difficulty:** Easy / Normal / Hard as proposed, and should Easy change anything else (more revives, slower enemies)?
3. **Back moves.** Add Back+P Backfist and Back+K Back Kick, which hit behind you? Not in the combat chart yet.

Settled decisions (Surge, phasing, grab and throw, side-scrolling levels, blocking) are in the archive.

## Suggested next step

M16: Ron answers the music and difficulty questions, then the music and sound pass first (the biggest change you'll hear), then difficulty and balance, the tutorial, and 1.0.
