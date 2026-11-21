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
| M13 | Themes and procedural runs | Next | XL | M8, M10, M12 | Castle Siege (woods, sewer, castle) generated from a seed, transitions, mini-bosses, the Pink General |
| M14 | Boss level | Planned | L | M13 | Multi-phase boss fight |
| M15 | Platforms and vertical layers (decision gate) | Optional | M–L | M8 | Optional: platforms and stairs |
| M16 | Polish, audio, balance, v1.0 release | Planned | L | M8–M15 | Release candidate |
| M17 | Level creator | Planned | L | M8, M13 | Rhett builds levels that join the procedural pools |
| M18 | House builder and visiting | Done | L | M10, M11 | Build a house with stars, invite friends over |
| M11.5 | Rollback for online play (suggested before Steam) | Maybe | L | M11 | Your presses act instantly online; others are predicted and corrected |
| Someday | Cloud saves, Steam | Maybe | — | M11.5 (suggested) | Desktop app, Steam Workshop, server-backed stars |

## Upcoming milestones

### M13 · Themes and procedural runs (in progress)

**Goal:** the foundation for many themes and campaigns. Decided by Ron and Rhett (November 20): a theme is three biomes, about three minutes each; runs are generated from a seed; transitions between biomes are seamless and random (catapult, gate smash, pipe slide, rope swing); rare mini-bosses; main bosses arrive with an in-game scene (one leaps in and knocks everyone down and talks; another is drawn in by a pencil and comes to life). The first boss comes in M13; M14 builds more on it.

- **Castle Siege** (first theme): Wooded Trail → Sewer Tunnels (slippery floor) → Castle Keep, then the Pink General (drawn in by a pencil; three phases, calls his army).
- **Data, not code:** biomes, transitions and themes are data (`js/data/themes.js`). A new theme is new data plus, for a new look, its scenery.
- **Runs:** each biome is a sign, five fights from its own enemy mix (toughness rising, a Captain closing each biome but the last) and a transition. Scenery is scattered from the biome's props. The same seed always makes the same run.
- **Mini-bosses:** one per biome type (Big Bruiser, Sludge Brute, Captain of the Guard), about one run in two meets one.

**Done when:** Castle Siege plays through alone and online with every transition and both boss intros, and the same seed always makes the same run.

### M14 · Boss level

- Boss arena (working name: The Pink General), built on the boss framework the Captain uses: three phases, clear telegraphs, summons from the army, and a health bar.
- Finishing blow in slow motion with a special death pose.
- Victory screen and a New Game+ hook.

**Done when:** The boss is beatable with any build, alone or in co-op, and hard to beat without learning the combat.

### M15 · Platforms and vertical layers (optional)

A short prototype first: jump-through platforms, real stairs, and vertical camera movement. The test is whether it keeps combat readable. If yes, we add it to Levels 3–5 and to the chunk format. If no, we keep the stair look as scenery. `groundY()` (see ARCHITECTURE.md, "Still assuming a flat world") keeps either choice cheap.

### M16 · Polish, audio, balance, v1.0 release

- Music and ambient sound per level, full sound pass.
- Difficulty settings, balance pass on XP, stars, and enemy health.
- Accessibility: color-blind-safe hit flashes, a reduced screen shake option (button remapping is already done).
- Performance pass on phones and iPads, final tutorial and move list screen.

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

1. **Back moves.** Add Back+P Backfist and Back+K Back Kick, which hit behind you? Not in the combat chart yet.

Settled decisions (Surge, phasing, grab and throw, side-scrolling levels, blocking) are in the archive.

## Suggested next step

Finish M13 (Castle Siege) with Ron and Rhett's testing, then M14 (more bosses on the same foundation).
