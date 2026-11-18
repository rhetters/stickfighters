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
| M11.5 | Rollback for online play (proposed) | Planned | L | M11 | Your presses act instantly online; others are predicted and corrected |
| M12 | XP, levels, skill tree | Next | L | M3, M8, M10 | Level-ups, skill points, tree screen |
| M13 | Levels 2–5, themes and procedural runs | Planned | XL | M8, M10, M12 | Sewer Entrance, Castle Stairs, Main Hall, Tower Top; runs assembled from a seed |
| M14 | Boss level | Planned | L | M13 | Multi-phase boss fight |
| M15 | Platforms and vertical layers (decision gate) | Optional | M–L | M8 | Optional: platforms and stairs |
| M16 | Polish, audio, balance, v1.0 release | Planned | L | M8–M15 | Release candidate |
| M17 | Level creator | Planned | L | M8, M13 | Rhett builds levels that join the procedural pools |
| M18 | House builder and visiting | Planned | L | M10, M11 | Build a house with stars, invite friends over |
| Someday | Cloud saves, Steam | Maybe | — | — | Desktop app, Steam Workshop, server-backed stars |

## Upcoming milestones

### M11.5 · Rollback for online play (proposed)

- Why: Versus at 58 ping felt laggy in the first real test. The direct-connection patch halved the delay; rollback removes most of the rest.
- How: your own presses take effect at once (with a small built-in delay of 1–2 frames). Other players are predicted to keep pressing what they last pressed; when their real presses arrive and differ, the game rewinds to that frame and replays up to now within the same screen refresh.
- Needs: saving and restoring the whole fight state every frame (fighters, enemies, ragdolls, the random seed, mode state), replays that don't repeat sounds and effects, and a limit on how far back it rewinds (about 8 frames).
- Ordering: before or after M12 is Ron and Rhett's call.

**Done when:** Versus between two houses at about 60 ping feels close to local, with no desyncs over a 10-minute match.

### M12 · XP, levels, skill tree

**Goal:** A reason to keep fighting. Ninja stars already exist, so respecs can cost stars from day one. Online play means skills and stats must be shared at the start of a match, the way looks are. Decide the unlock approach first (Open decisions, item 2).

- XP from kills (by enemy type), combo bonuses, variety bonuses (using many different moves), no-damage bonuses, and level clears.
- Level curve: XP needed per level = 100 × level^1.4, cap 30 for v1. One skill point per level, plus a bonus point every fifth level.
- Skill tree screen that works by touch and controller, with tooltips and a button to preview a move’s animation. Respec costs ninja stars.
- Starting style in character creation: Brawler, Kicker or Sprinter, which sets your first skill point.
- Stats system: HP, damage, Surge max, regen, and costs, all editable by skills. Progress lives in the save (with a save version, rule R6).

**Draft skill tree (five branches):**

| Branch | Tier 1 | Tier 2 | Tier 3 | Capstone |
|---|---|---|---|---|
| Fists | Hard Knuckles (+punch damage) | Low Hooks, Spike Fist | Ground Pound, Surge Barrage | Hundred Fists (Surge string) |
| Legs | Twin Sky Kick, Reverse Sweep | Somersault Kick, Scissor Kick | Axe Kick, Meteor Kick | Comet Barrage |
| Surge | Bigger bar, faster regen | Cheaper strings | Longer phase, air Surge hop | Endless Surge (brief unlimited Surge) |
| Body | More HP | Faster get-up, less stagger | Armor on heavy moves | Second Wind (one revive per level) |
| Fortune | Star magnet | Bonus XP | Treasure sense (hidden chests sparkle) | Lucky Streak (combo-based star bonus) |

**Done when:** Level-ups give points, spending them changes your moves and stats visibly, and everything saves.

### M13 · Levels 2–5, themes and procedural runs

| Level | Theme | Look | Gameplay twist |
|---|---|---|---|
| 2 | Sewer Entrance | Stone arches, pipes, dripping water, green-gray palette | Slick floor: bodies slide farther, bowling is stronger |
| 3 | Castle Stairs | Stone steps, torches, banners | Guards with shields; stair terrain if G1 says yes |
| 4 | Main Hall | Pillars, chandeliers, long carpet | Breakable props, swarm waves, a mini-boss |
| 5 | Tower Top | Open sky, wind, moving clouds | Narrow arena, Surge-focused enemies |

- Each level is a biome with its own layers, chunk pool, enemy mix and one new enemy variant.
- **Themes and procedural runs:** a theme is an ordered list of biomes (for example *Castle Siege* = Woods → Sewer → Castle Stairs → Spire). A run is generated from a seed: the biome order is fixed, but each biome's chunks are drawn from its pool with rules (no repeats, a difficulty curve, an occasional rest or treasure chunk, a few fixed landmark chunks like the castle gate). The same seed always makes the same run, so seeds can be shared.
- Co-op lobby: pick a player count, ready up, and a theme is drawn.

**Done when:** All four levels play in order with themed transitions, and the same seed always produces the same run.

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

### M18 · House builder and visiting

- A "House" section of the store opens your fighter on an open 2D grid. Drag across squares to build walls, charged in stars per square; buy backgrounds, furniture and decorations.
- A house is data (background, grid, tiles, items), saved with the profile.
- Invite friends into your house while you're in it: an online room like the ones from M11, where guests can look around and only the host edits.

**Done when:** You can build and decorate a house with stars, and a sibling can visit it from their iPad.

### Someday · Cloud saves and Steam

Kept possible, not planned: cloud saves; a desktop app on Steam with Steam Workshop for editor levels and server-owned stars and inventory (why rules R7 and R8 exist). Anything public-facing with kids' accounts raises privacy and moderation questions, so it stays family-only unless Ron decides otherwise.

## Open decisions

1. **Back moves.** Add Back+P Backfist and Back+K Back Kick, which hit behind you? Not in the combat chart yet.
2. **Unlock approach (decide before M12).** Today every move is unlocked, and each carries its tier (FST-1, LEG-2 and so on) so the skill tree can lock them. Start with the base strings and unlock the rest, or start with everything and unlock upgrades?
3. **Ultimate name.** The Tornado Kick keeps its own blue meter, separate from Surge. Rename it Typhoon?
4. **Rollback before or after M12.** Ron and Rhett's call.

Settled decisions (Surge, phasing, grab and throw, side-scrolling levels, blocking) are in the archive.

## Suggested next step

Decide whether rollback (M11.5) comes before M12. For M12, settle the unlock approach first (Open decisions, item 2).
