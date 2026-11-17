# Architecture

How the code fits together. Update this at the end of every milestone.

## Files and load order

`index.html` holds the markup and loads one stylesheet and 22 classic scripts with `defer`, in this order. All scripts share one global scope (no modules), so top-level names must be unique across files, and top-level code may only use things defined in files loaded before it.

| # | File | What's in it |
|---|---|---|
| 1 | `js/core.js` | `$`, save (`SAVE_KEY`, `SET`, `BEST`, `save`), seeded `rnd()`/`reseed`, canvas and constants (`W`, `H`, `G`, `D`, `INK`), `FEEL`, sound (`sfx`, `noise`, `sfxHit`) |
| 2 | `js/input.js` | Actions (`ACT`), input slots (`INP`, `mkSlot`), `setA`, keyboard, touch stick and buttons, touch watchdog, gamepad polling |
| 3 | `js/data/moves.js` | Poses (`IDLE`, `HURT`…), `kf`/`lerpA`, player move table `A`, `ROUTE`, `SURGE`, `INFO` |
| 4 | `js/data/enemies.js` | Enemy moves `EA`, enemy types `T`, `TNAME`, `TTIP`; the loop that decorates every move with its `INFO` |
| 5 | `js/data/levels.js` | Level data: `CHUNKS` (width, props, encounter, gate, dusk, fireflies) and `LEVELS` (ordered chunk lists) |
| 6 | `js/player.js` | Game-state globals (`PL`, `P`, `E`, `FX`, `wave`, `score`…), Surge stamina, `pick`, `F`/`F0`, `mkPlayer`, `use`, `addPlayer`, `tgt`, `init`, `updP` |
| 7 | `js/effects.js` | Effect spawners: `fxp`, `spark`, `ring`, `dust`, `txt`, `ghost` |
| 8 | `js/combat.js` | Hitboxes, `startAtk`/`tickAtk`/`endAtk`, blocking, grab/pummel/throw, hit weights and `impact`, `hurtE`/`hurtP`, `bowl`, `sep`, `groundY`, physics, pose helpers |
| 9 | `js/enemies.js` | `updE`, AI director, `aiThink`, boss framework, `spawn`, `makeQueue`, `nextWave` |
| 10 | `js/modes.js` | The mode interface and `ARCADE` (endless waves); `MODE` = the mode being played |
| 11 | `js/level.js` | `LEVEL` mode: `buildLevel`, `startLevel`, `continueLevel`, camera and walls (`levelWalls`), encounters, gates, level clear/fail, level HUD |
| 12 | `js/versus.js` | `VERSUS` mode: rounds, countdown, KO, timer, winner screen, player push-apart |
| 13 | `js/ragdoll.js` | Verlet ragdoll, death poses, corpse settle and confetti dissolve |
| 14 | `js/scenery.js` | Level drawing only: parallax layers, props, the log gate, foreground grass, leaves and fireflies |
| 15 | `js/render.js` | Gear, figures, background, effects, HUD, `render()` |
| 16 | `js/ui/panels.js` | Training panels: move list, fighter info, feel sliders |
| 17 | `js/ui/training.js` | Training Room state (`TR`), dummies, hitbox and frame-data overlays, hotkeys |
| 18 | `js/ui/touch-layout.js` | Touch layout profiles and the layout editor |
| 19 | `js/ui/lobby.js` | Players screen: joining with controllers, touch, keyboard, keyboard 2; `startMulti()` |
| 20 | `js/ui/bindings.js` | Settings > Buttons: key and controller button bindings |
| 21 | `js/selftest.js` | `selfTest()` determinism check |
| 22 | `js/main.js` | Screens, settings binding, screen fit, `update()` (one simulation step), `tick`/`loop`, boot. Loads last. |

Nothing runs game code at load except data setup; boot (`init(); applySet(); resize(); bindSettings(); syncTrain(); openTitle(); requestAnimationFrame(loop)`) is the last thing in `main.js`.

**Cache-busting:** every asset tag carries `?v=N`. Bump N on every release so iPads never mix old and new files.

## Simulation

- `loop()` (screen rate) accumulates time and calls `tick()` at a fixed 60 Hz; `tick()` calls `update()`. `render()` runs once per screen frame and must not change gameplay state or call `rnd()`.
- `update()` order: hit-stop/slow-mo, players (`updP` via `use(p)`), `director()`, enemies (`updE`), `bowl()`, `sep()`, cleanup, `MODE.update()` (while someone is alive in play), effect aging.

## Modes, world and camera (M8)

- A mode is an object: `update()` runs the rules each step; optional `over()` (KO handling), `bg()`, `fg()` (foreground, drawn over the fighters) and `hud()`. `ARCADE` and `LEVEL` exist; Training still uses `state === 'train'` with no mode rules.
- `CAM.x` is the world x of the screen's left edge. `render()` draws `bg()` in screen space, then the world (fighters, effects) shifted by `-CAM.x`, then `MODE.fg()`.
- `WB` = walls for living fighters (the screen, or a gate). `WW` = world edges for ragdolls. In Arcade and Training, `CAM.x = 0` and both equal the screen.
- A level (`LEVELS[id]`) is an ordered list of chunk ids; `buildLevel()` lays the chunks end to end and makes a run-time copy (`LV`) with encounters (`st` 0 waiting, 1 fighting, 2 done), gates and the checkpoint `cp`. Data is never changed at run time.
- The level camera only moves forward, and stops at the next encounter's lock position or in front of a gate. The ground is still flat (`groundY`).
- Gameplay randomness: `rnd()` only. `Math.random()` only for cosmetics (screen shake, Surge sparkle, noise buffer, unseeded run seed).

## Players (M9)

`ROSTER` (input.js) is the list of players in a multiplayer game: `{slot, dev, col, d2, name}` where `dev` is `touch`, `kb`, `kb2` or `pad:N`. It is empty in one-player games, and then every device drives Player 1 as before. `init()` builds `PL` from the roster. `devSlot(dev)` routes a device to its player's input slot (`INP[0..3]`); devices without a player are ignored. Each player carries its own `combo`, `comboT`, `meter` and `hpT`; `score` and `maxc` are shared. `MODE.pvp` (Versus) lets players' attacks hit other players through `pvpHit()`. Co-op rules live in modes.js: `coopScale()`, `coopExtra()`, `reviveTick()`. `MODE.pre()` can hold the simulation (the Versus countdown). Still legacy: `use(p)` binds `P`/`K`/`STM` to the player being updated.

## Input

Keyboard keys and controller buttons come from bindings (`KEYS` built by `applyBinds()`, `padBinds(g)` per controller type). The left stick always moves and aims. When no game is running (menus, pause), `pollPad()` drives `padMenu()`: d-pad/stick moves focus through the visible screen's controls, confirm presses, back goes back or resumes. Switch controllers use A (right) to confirm and B (bottom) to go back.


Every device calls `setA(src, action, on, slot)`. Each slot (`INP[n]`) has `K` (held), `press` (frame pressed), `AIM` and `SRG` (direction and Surge captured at the press). `use(p)` points the globals `P`, `STM`, `K`, `press`, `AIM`, `SRG` at player `p`. This global swap is legacy (rule R5) and gets replaced by explicit player parameters before multiplayer.

## Save

localStorage key `orangeArmy.v1` (never change it) holds `{saveVersion, set, best, prog}`. `SET` holds settings, feel knobs and touch layouts; `BEST` the Arcade records; `PROG` level progress (`{woods1: {done, score, time, combo}}`). `SET.binds` holds custom keys and controller buttons (null = defaults; see `KEYDEF`/`PADDEF` in `input.js`). `migrate()` in `core.js` upgrades older saves one version at a time: v1 had no `saveVersion` and no `prog`; v2 had no `binds`. Any new shape change bumps `SAVE_VERSION` and adds a step.

## Self-test

Open the game with `?selftest`. It resets feel knobs to defaults, plays 3,600 frames of Arcade waves with scripted inputs, adds a Guard, Flanker and Captain, plays 1,800 more frames, and fingerprints positions, health, states, score, wave and the random generator. Then it plays up to 7,200 frames of the Wooded Trail with scripted inputs (it never saves progress) and fingerprints the level state. Run it before and after any refactor; the fingerprints must not change. A gameplay change is expected to change them: note the new values in the CHANGELOG.

Current fingerprints: Arcade `c87c9470`, Level `21292ab5` (since the combat patch).

## Still assuming a flat world

The ground is flat everywhere (`groundY` returns `G`), and several places compare against `G` directly (`f.y>=G-1`, `bowl`, `sep`, death poses). M14 (platforms) routes these through `groundY()` or an `onGround(f)` helper.
