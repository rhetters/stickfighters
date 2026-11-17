# Vision

Why the game is built the way it is. Read this before designing anything new.

## Who's who

- **Rhett** (Ron's son) is the creative director. The game started from his request for an orange stick figure fighting an army of pink ones. He tests on his iPad and reports bugs. He asked for co-op and versus, ragdoll bodies and character customization. He loves fixed-arena versus games like *Boomerang Fu* and Smash, and would love a level creator.
- **Ron** is the producer. He likes campaign journeys, progression, and grinds whose rewards other players can see.
- **Players:** Ron's four kids, mostly on iPads, plus keyboard and Bluetooth controllers.
- **Art style:** hand-drawn stick figures on grid paper. Keep it and build on it.

## Where it's headed

This is the destination, not a promise to build it all soon.

1. **Campaign journeys.** Themed runs through a fixed order of biomes. Example: *Castle Siege* = Woods → Sewer entrance → Castle stairs → Spire. Inspired by *Ghouls 'n Ghosts* and WoW's Karazhan.
2. **Procedural co-op campaigns.** Choose co-op and a player count, everyone readies up in a lobby, and a theme is drawn. The biome order is fixed, but each biome is assembled from chunks by a seed, so no two runs match.
3. **Versus mode.** Smash and Boomerang Fu style fixed-arena brawls for 2–8 players.
4. **Local multiplayer on the TV.** An iPad mirrored or wired to the TV, Bluetooth controllers, and a "press any button to join" screen.
5. **Network multiplayer.** Each kid on their own iPad over home Wi-Fi, for co-op and versus.
6. **Ninja star economy.** Enemies drop ninja stars that buy cosmetics only, in a store organized by slot (head, shoes and so on). Purchases are saved, equipped in Character Creation, and visible to other players.
7. **XP and skill tree** (roadmap M11).
8. **House builder.** A grid where you drag out walls (charged in stars per square), add backgrounds, furniture and decorations, then invite friends to visit.
9. **Level creator** for Rhett. Its levels are playable directly and can join the procedural pools.
10. **Depth in 2D.** Parallax layers (foreground trees, far mountains, fighters in between) in the paper style.
11. **Maybe one day: Steam.** A desktop wrapper, Steam Workshop for levels, server-backed stars and items. Not a goal, but don't rule it out.

## Architecture rules

Cheap to follow now, expensive to add later.

| # | Rule | Why |
|---|---|---|
| R1 | **Engine and modes are separate.** The combat core (fighters, moves, physics, ragdolls, drawing) knows nothing about levels, shops, score rules or win conditions. Each mode (Arcade/Waves, Campaign, Versus, Training, House, Level Editor) sets up the world and rules on top of it. | Campaign and versus are different games on one engine; the house and editor are modes too. |
| R2 | **Deterministic simulation.** Fixed 60 Hz steps. Gameplay randomness only from the seeded `rnd()`; `Math.random()` only for cosmetic effects. The simulation never depends on drawing, real time or frame rate. | Network play (send inputs, every device runs the same game), procedural runs from one seed, replays, reproducible bugs and cheat detection all come from this. `?selftest` guards it. |
| R3 | **Everything is data.** Levels, chunks, themes, biomes, enemies, items, cosmetics, houses and editor output are plain JSON-compatible data in `js/data/`. The game never runs code from a level or house file. | Procedural generation, the level creator, sharing and safe user content. |
| R4 | **Every input goes through one gate per player.** Source → player slot → actions (`setA`). A source can be keyboard, touch, gamepad N, or later the network. | Local and network multiplayer become new sources, not rewrites. |
| R5 | **No hidden "current player."** Systems take the player as a parameter. Retire the `use(p)` global swap before multiplayer. | 2–8 players. |
| R6 | **One versioned save with migrations.** Keep the key `orangeArmy.v1`, add a `saveVersion` inside it and a `migrate(save)` that upgrades step by step. Add Back up / Restore when the economy arrives. | Safari can clear site data; hours of grind must survive. |
| R7 | **The economy has one gate.** Stars change only through `grantStars(amount, reason)` and `spendStars(amount, itemId)`; ownership only through one inventory module. | That module can later ask a server instead of trusting the device. |
| R8 | **Cosmetic only.** Store items never change stats. | Fair versus, harmless cheating, kid-friendly. |
| R9 | **The world isn't one screen.** A camera and world bounds arrive in M8 instead of hard-coded `W` everywhere. | Scrolling levels, co-op cameras, big arenas, houses. |
| R10 | **Touch first.** Every feature needs an iPad touch path, and every menu also works with a controller. | The kids play on iPads and the TV. |

## Milestone order (approved November 16, 2026)

M8 level framework and modes → M9 local multiplayer (TV, controllers, versus, co-op) → M10 ninja stars, cosmetic store and character creation → M11 XP and skill tree → M12 levels 2–5 and procedural runs → M13 boss → M14 platforms (optional) → M15 polish and v1.0 → M16 level creator → M17 network multiplayer → M18 house builder → someday cloud saves and Steam. Details in [ROADMAP.md](ROADMAP.md).
