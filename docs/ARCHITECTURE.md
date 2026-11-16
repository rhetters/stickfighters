# Architecture

How the code fits together. Update this at the end of every milestone.

## Files and load order

`index.html` holds the markup and loads one stylesheet and 15 classic scripts with `defer`, in this order. All scripts share one global scope (no modules), so top-level names must be unique across files, and top-level code may only use things defined in files loaded before it.

| # | File | What's in it |
|---|---|---|
| 1 | `js/core.js` | `$`, save (`SAVE_KEY`, `SET`, `BEST`, `save`), seeded `rnd()`/`reseed`, canvas and constants (`W`, `H`, `G`, `D`, `INK`), `FEEL`, sound (`sfx`, `noise`, `sfxHit`) |
| 2 | `js/input.js` | Actions (`ACT`), input slots (`INP`, `mkSlot`), `setA`, keyboard, touch stick and buttons, touch watchdog, gamepad polling |
| 3 | `js/data/moves.js` | Poses (`IDLE`, `HURT`…), `kf`/`lerpA`, player move table `A`, `ROUTE`, `SURGE`, `INFO` |
| 4 | `js/data/enemies.js` | Enemy moves `EA`, enemy types `T`, `TNAME`, `TTIP`; the loop that decorates every move with its `INFO` |
| 5 | `js/player.js` | Game-state globals (`PL`, `P`, `E`, `FX`, `wave`, `score`…), Surge stamina, `pick`, `F`/`F0`, `mkPlayer`, `use`, `addPlayer`, `tgt`, `init`, `updP` |
| 6 | `js/effects.js` | Effect spawners: `fxp`, `spark`, `ring`, `dust`, `txt`, `ghost` |
| 7 | `js/combat.js` | Hitboxes, `startAtk`/`tickAtk`/`endAtk`, blocking, grab/pummel/throw, hit weights and `impact`, `hurtE`/`hurtP`, `bowl`, `sep`, `groundY`, physics, pose helpers |
| 8 | `js/enemies.js` | `updE`, AI director, `aiThink`, boss framework, `spawn`, `makeQueue`, `nextWave` |
| 9 | `js/ragdoll.js` | Verlet ragdoll, death poses, corpse settle and confetti dissolve |
| 10 | `js/render.js` | Gear, figures, background, effects, HUD, `render()` |
| 11 | `js/ui/panels.js` | Training panels: move list, fighter info, feel sliders |
| 12 | `js/ui/training.js` | Training Room state (`TR`), dummies, hitbox and frame-data overlays, hotkeys |
| 13 | `js/ui/touch-layout.js` | Touch layout profiles and the layout editor |
| 14 | `js/selftest.js` | `selfTest()` determinism check |
| 15 | `js/main.js` | Screens, settings binding, screen fit, `update()` (one simulation step), `tick`/`loop`, boot. Loads last. |

`init()` runs at the end of the `player.js` load, so `core`, `input` and both data files must load first. Boot (`applySet(); resize(); bindSettings(); syncTrain(); openTitle(); requestAnimationFrame(loop)`) is the last thing in `main.js`.

**Cache-busting:** every asset tag carries `?v=N`. Bump N on every release so iPads never mix old and new files.

## Simulation

- `loop()` (screen rate) accumulates time and calls `tick()` at a fixed 60 Hz; `tick()` calls `update()`. `render()` runs once per screen frame and must not change gameplay state or call `rnd()`.
- `update()` order: hit-stop/slow-mo, players (`updP` via `use(p)`), `director()`, enemies (`updE`), `bowl()`, `sep()`, cleanup, wave spawning, effect aging.
- Gameplay randomness: `rnd()` only. `Math.random()` only for cosmetics (screen shake, Surge sparkle, noise buffer, unseeded run seed).

## Input

Every device calls `setA(src, action, on, slot)`. Each slot (`INP[n]`) has `K` (held), `press` (frame pressed), `AIM` and `SRG` (direction and Surge captured at the press). `use(p)` points the globals `P`, `STM`, `K`, `press`, `AIM`, `SRG` at player `p`. This global swap is legacy (rule R5) and gets replaced by explicit player parameters before multiplayer.

## Save

localStorage key `orangeArmy.v1` (never change it) holds `{set, best}`. `SET` holds settings, feel knobs and touch layouts. There is no `saveVersion` yet; add it with `migrate()` before the save shape changes (rule R6).

## Self-test

Open the game with `?selftest`. It resets feel knobs to defaults, plays 3,600 frames of waves with scripted inputs, adds a Guard, Flanker and Captain, plays 1,800 more frames, then shows a fingerprint of positions, health, states, score, wave and the random generator. Run it before and after any refactor; the fingerprint must not change. A gameplay change is expected to change it: note the new value in the CHANGELOG.

Current fingerprint: `39f01735`.

## Known one-screen assumptions (for M8)

`W`, `G` and the `24 … W-24` clamp in physics assume one screen, as do spawn positions, ragdoll wall checks (`W-r`, `nearWall`) and several direct `G` comparisons (`f.y>=G-1`, `bowl`, `sep`, death poses). M8 routes these through a camera, world bounds and `groundY()`.
