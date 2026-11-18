# Architecture

How the code fits together. Update this at the end of every milestone.

## Files and load order

`index.html` holds the markup and loads one stylesheet and 31 classic scripts with `defer`, in this order. All scripts share one global scope (no modules), so top-level names must be unique across files, and top-level code may only use things defined in files loaded before it.

| # | File | What's in it |
|---|---|---|
| 1 | `js/core.js` | `$`, save (`SAVE_KEY`, `SET`, `BEST`, `PROG`, `ECO`, `CHR`, `migrate`, `loadSave`, `saveData`, `save`), seeded `rnd()`/`reseed`, canvas, `ctx` and `withCtx`, constants (`W`, `H`, `G`, `D`, `INK`), `FEEL`, sound (`sfx`, `noise`, `sfxHit`) |
| 2 | `js/input.js` | Actions (`ACT`), input slots (`INP`, `mkSlot`), `setA`, keyboard, touch stick and buttons, touch watchdog, gamepad polling, controller menu navigation |
| 3 | `js/data/moves.js` | Poses (`IDLE`, `HURT`…), `kf`/`lerpA`, player move table `A`, `ROUTE`, `SURGE`, `INFO` |
| 4 | `js/data/enemies.js` | Enemy moves `EA`, enemy types `T`, `TNAME`, `TTIP`; the loop that decorates every move with its `INFO` |
| 5 | `js/data/levels.js` | Level data: `CHUNKS` (width, props, encounter, gate, dusk, fireflies) and `LEVELS` (ordered chunk lists) |
| 6 | `js/data/items.js` | Cosmetics data (M10): `TABS` (Character screen tabs and their sections), `SECS` (section → slot), `EQ` (worn slots), `WHEEL_MAX`, `ITEMS`/`ITEM` (id, sec, slot, name, price, colors, `k` drawing style, `how` to unlock), `STANCES`, `FIGHTER0`, `FIGHTERS`, `STAR_DROP`, `STAR_BONUS` |
| 7 | `js/economy.js` | The one gate for stars and items (M10): `grantStars`, `spendStars`, `owns`, `grantItem`, `buyItem`, `checkUnlocks`, `openGift`, `runEnd`; fighters: `normFighter`, `fighter`, `curFighter`, `lookRaw`, `lookOf`, `saveFighter`, `deleteFighter`, `shade`; `giftPool` |
| 8 | `js/player.js` | Game-state globals (`PL`, `P`, `E`, `FX`, `wave`, `score`…), Surge stamina, `pick`, `F`/`F0`, `mkPlayer`, `use`, `addPlayer`, `tgt`, `init`, `updP` |
| 9 | `js/effects.js` | Effect spawners: `fxp`, `spark`, `ring`, `dust`, `txt`, `ghost` |
| 10 | `js/combat.js` | Hitboxes, `startAtk`/`tickAtk`/`endAtk`, blocking, grab/pummel/throw, hit weights and `impact`, `hurtE`/`hurtP`, `bowl`, `sep`, `groundY`, physics, pose helpers |
| 11 | `js/enemies.js` | `updE`, AI director, `aiThink`, boss framework, `spawn`, `makeQueue`, `nextWave` |
| 12 | `js/modes.js` | The mode interface and `ARCADE` (endless waves); `MODE` = the mode being played; co-op rules |
| 13 | `js/level.js` | `LEVEL` mode: `buildLevel`, `startLevel`, `continueLevel`, camera and walls (`levelWalls`), encounters, gates, level clear/fail, level HUD |
| 14 | `js/versus.js` | `VERSUS` mode: rounds, countdown, KO, timer, winner screen, player push-apart |
| 15 | `js/pickups.js` | Star pickups and gifts (M10): `PK`, `dropRoll`, `dropScan`, `pickTick`, `collect`, `collectAll`, drawing (`shuriken`, `giftBox`, `drawPickups`, `starHud`) |
| 16 | `js/net/rtc.js` | Online connection (M11): WebRTC data channels and the signaling-server talk (`NETCFG`, `RTC`, `rtcHost`, `rtcJoin`, `rtcSend`, `rtcClose`; callbacks `RTC.on.peer/msg/gone/err`). Knows nothing about the game. |
| 17 | `js/net/session.js` | Online room and lockstep (M11): `NET` state, `NETIN` slots, `maskOf`/`applyMask`, `simHash`, `netHost`/`netJoin`/`netLeave`, host and guest messages, `netStart`/`netStartLocal`, `netCmd` (again / continue / room), `netTick`/`netStep`, desync check |
| 18 | `js/ragdoll.js` | Verlet ragdoll, death poses, corpse settle and confetti dissolve, `drawRag`, `drawTatsu` |
| 19 | `js/scenery.js` | Level drawing only: parallax layers, props, the log gate, foreground grass, leaves and fireflies |
| 20 | `js/looks.js` | Drawing a fighter's look (M10): `drawLookUnder` (cape, hood), `drawLook` (legs, shoes, shirts, jackets, dresses, ties, gloves, scarf, hair, band, hat), `drawHat`, `drawHair`, `surgeCol`/`surgeExtra`, `VPOSE` poses, `lookPose` (stance, victory and pose-wheel blending), `cheering`, `drawWheel`, `drawItemIcon` |
| 21 | `js/render.js` | Gear, figures (`drawFig`), background, effects, HUD, `render()` |
| 22 | `js/ui/panels.js` | Training panels: move list, fighter info, feel sliders |
| 23 | `js/ui/training.js` | Training Room state (`TR`), dummies, hitbox and frame-data overlays, hotkeys |
| 24 | `js/ui/touch-layout.js` | Touch layout profiles and the layout editor |
| 25 | `js/ui/lobby.js` | Players screen: joining with controllers, touch, keyboard, keyboard 2; fighter picks (`lbLook`, `lbFighter`, `lbColor`, `lbHat`); `startMulti()` |
| 26 | `js/ui/online.js` | Online screen (M11): Host / Join, room code picker, room cards, mode and Start, online pause and results buttons (`onlineScreens`), YOU marker and waiting note (`onlineHud`) |
| 27 | `js/ui/bindings.js` | Settings > Buttons: key and controller button bindings |
| 28 | `js/ui/character.js` | Character screen and store (M10): four fighter slots, Body tab (height, head, lines, stance, delete), tabbed shelves with sections and None cards, try-on and buying, pose wheel picks, animated preview (stance, Surge demo, poses) |
| 29 | `js/ui/backup.js` | Settings > Save: Back up / Restore (code or file) |
| 30 | `js/selftest.js` | `selfTest()` determinism check |
| 31 | `js/main.js` | Screens, settings binding, screen fit, `update()` (one simulation step), `tick`/`loop`, boot. Loads last. |

Nothing runs game code at load except data setup; boot (`checkUnlocks(); init(); applySet(); resize(); bindSettings(); syncTrain(); openTitle(); requestAnimationFrame(loop)`) is the last thing in `main.js`.

**Cache-busting:** every asset tag carries `?v=N`. Bump N on every release so iPads never mix old and new files.

## Simulation

- `loop()` (screen rate) accumulates time and calls `tick()` at a fixed 60 Hz; `tick()` calls `update()`. `render()` runs once per screen frame and must not change gameplay state or call `rnd()`.
- `update()` order: hit-stop/slow-mo, players (`updP` via `use(p)`), `director()`, enemies (`updE`), `bowl()`, `sep()`, star drops (`dropScan`, when `MODE.drops`) and pickups (`pickTick`), cleanup, `MODE.update()` (while someone is alive in play), effect aging.

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

localStorage key `orangeArmy.v1` (never change it) holds `{saveVersion, set, best, prog, eco, chr}`. `SET` holds settings, feel knobs and touch layouts; `BEST` the Arcade records; `PROG` level progress (`{woods1: {done, score, time, combo}}`). `SET.binds` holds custom keys and controller buttons (null = defaults; see `KEYDEF`/`PADDEF` in `input.js`). `ECO` (M10) = `{stars, got, own: [item ids], seen: [item ids]}`; `CHR` = `{cur, list: [fighter|null] x4}`, a fighter being `{name, col (a color item id), ht, head, lw, stance, eq: {hair, hat, band, scarf, tie, shirt, jacket, gloves, legs, shoes, surge}, wheel: [up to 4 pose ids]}`. `normFighter()` upgrades older fighters (`eq.trail` → `eq.surge`, `eq.pose` → first on the wheel). `migrate()` in `core.js` upgrades older saves one version at a time: v1 had no `saveVersion` and no `prog`; v2 had no `binds`; v3 had no `eco`/`chr`; v4 had three fighter slots. `loadSave()` copies a save into the live objects keeping only the expected shapes. Any new shape change bumps `SAVE_VERSION` and adds a step. Nothing is saved while the self-test runs.

Backups (Settings → Save) are `"OVPA-"` + base64 of the save's JSON. Restoring parses it as data, rejects newer versions, migrates it, keeps the old save under `orangeArmy.v1.before-restore`, writes it and reloads.

## Economy and looks (M10)

- Stars change only in `grantStars`/`spendStars`, ownership only in `grantItem`/`buyItem` (`economy.js`). Writes are batched (`ecoSave`).
- `dropScan()` gives each newly dying enemy its stars once (`e.dropped`). Pickups (`PK`) bounce, then fly to the nearest player and are banked on touch. Their rolls come from `dropRoll()`, a hash of `SEED`, `fr` and the enemy's index that never advances `rnd()`, and pickups never touch fighters, so the fingerprints did not change. `collectAll()` banks what's left at the end of a run (`runEnd`).
- A player's look is `p.look` (from `lookOf()`): colors, head size, line width, stance and the item object per slot. It's drawing only: `drawFig` takes a head size and line width, then `drawLook` draws items on the joints it reports (`out.hd`, `nk`, `h`, `hb`, `f`, `fb`, `hr`). `drawRag` and `drawTatsu` report their own joints. `lookPose()` blends the idle stance and the victory pose at draw time; its blend state lives in a `WeakMap`, never on the fighter.
- Height (`look.ht`) scales only the drawing in `drawF` (ragdolls keep their size); hitboxes never change.
- Clothes are drawn in layers between the body's own lines: `drawFig(…, lay)` and `drawRag` call `lay.under/back/mid/legs` (from `lookLayers()`) after the far limbs, torso and head, and near leg; the caller then draws `drawLook(…, 'front')` over the near arm. So the far hand sits behind a dress and ties and scarves sit under the near arm.
- Pose wheel: action `e` (T, Select, touch POSE). While it's held on the ground `updP` keeps the player still and stores the aimed direction in `f.wheel.d` (eighths of a turn from up); letting go sets `f.emote = {d}`. `wheelSeg(d, n)` turns a direction into one of the n (up to 8) slices when drawing. Moving, jumping, Surge or attacking clears it. Nothing else reads these, so a fight plays the same with or without poses; `lookPose()` draws the pose from the fighter's wheel and `drawWheel()` the wheel. Older saved key/button bindings without `e` use its defaults.
- `MODE.locked(p)` (Versus after a KO) makes `use(p)` read `NO_INPUT`, an idle slot, so the players can't move.
- Controller menus (`navMove`) pick the nearest control in the pressed direction by on-screen position.
- Surge afterimages (`GH`) remember their owner (`own`) so they can be drawn in the owner's Surge style.
- `withCtx(canvas2d, fn)` points every drawing function at another canvas (store icons, the character preview, Players screen cards).

## Self-test

Open the game with `?selftest`. It resets feel knobs to defaults, plays 3,600 frames of Arcade waves with scripted inputs, adds a Guard, Flanker and Captain, plays 1,800 more frames, and fingerprints positions, health, states, score, wave and the random generator. Then it plays up to 7,200 frames of the Wooded Trail with scripted inputs (it never saves progress) and fingerprints the level state. Run it before and after any refactor; the fingerprints must not change. A gameplay change is expected to change them: note the new values in the CHANGELOG.

Current fingerprints: Arcade `c87c9470`, Level `21292ab5` (since the combat patch; unchanged by M10).

## Still assuming a flat world

The ground is flat everywhere (`groundY` returns `G`), and several places compare against `G` directly (`f.y>=G-1`, `bowl`, `sep`, death poses). M15 (platforms) routes these through `groundY()` or an `onGround(f)` helper.

## Online play (M11)

Three layers, so each can be replaced on its own (matchmaking, Steam):

1. **Connection** (`net/rtc.js`). WebRTC data channels, reliable and ordered. Devices find each other through the public PeerJS signaling server (`NETCFG.signal`, spoken to directly; `?signal=ws://…` points the game at another one, which the tests use). A host registers as `orangearmy-<room code>`; a guest sends it an offer. STUN servers in `NETCFG.ice`; add a TURN server there if some network can't connect. Messages are JSON objects and are only ever parsed, never run.
2. **Room** (`net/session.js`). `NET.players` = `{slot, id, name, f (fighter), cid (color), rtt, left}`. Guests say `hello` with `GAME_VERSION` (core.js; bump it with `?v=`) and their fighter; the host replies `welcome` or `deny` (VERSION, FULL, PLAYING) and sends `room` updates. Fighters from other devices are checked with `normFighter(f, true)` (shape, not ownership); the host keeps colors unique.
3. **Lockstep.** `start` carries the epoch, seed, mode, input delay D, the host's `FEEL` and the roster. Each device sends `{t:'i', e, f, m}` (its button mask for frame f + D, one bit per `ACT`); the host collects them, and once a frame has everyone (players who left count as zero) sends `{t:'F', e, f, m:[…]}` to all and keeps a copy. Each device simulates a frame only from a bundle: `applyMask()` feeds `NETIN[slot]` exactly like `setA`, `use(p)` reads `NETIN` during a match, then `fr++; update()`. `fr` starts at 0 for every match. Guests send `simHash()` every 120 frames; a mismatch ends the match (`desync`). After a match, `cmd` (again / cont / room) comes from the host with the frame it was at, so a guest that's a few frames behind catches up first.

While `NET.match` is on: the main loop runs `netTick()` instead of `tick()` and never pauses; `devSlot()` maps every local device to `NET.mySlot`; `newSeed()` uses the host's seed; the pause menu hides Restart (guests) and Settings (everyone, so feel settings can't change mid-match).
