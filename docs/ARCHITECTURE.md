# Architecture

How the code fits together: files, the simulation, and how each system works. Update it in the same change that alters any of this. Status and plans are in [ROADMAP.md](ROADMAP.md), history in [CHANGELOG.md](CHANGELOG.md), tests in [TESTING.md](TESTING.md).

## Files and load order

`index.html` holds the markup and loads one stylesheet and 35 classic scripts with `defer`, in this order. All scripts share one global scope (no modules), so top-level names must be unique across files, and top-level code may only use things defined in files loaded before it.

| # | File | What's in it |
|---|---|---|
| 1 | `js/core.js` | `$`, save (`SAVE_KEY`, `SET`, `BEST`, `PROG`, `ECO`, `CHR`, `migrate`, `loadSave`, `saveData`, `save`), seeded `rnd()`/`reseed`, canvas, `ctx` and `withCtx`, constants (`W`, `H`, `G`, `D`, `INK`), `FEEL`, sound (`sfx`, `noise`, `sfxHit`) |
| 2 | `js/input.js` | Actions (`ACT`), input slots (`INP`, `mkSlot`), `setA`, the input buffer (`wantIn`/`eatIn`), keyboard, touch stick and buttons, touch watchdog, gamepad polling, controller menu navigation |
| 3 | `js/data/moves.js` | Poses (`IDLE`, `HURT`…), `kf`/`lerpA`, player move table `A`, `ROUTE`, `SURGE`, `INFO` |
| 4 | `js/data/enemies.js` | Enemy moves `EA`, enemy types `T`, `TNAME`, `TTIP`; the loop that decorates every move with its `INFO` |
| 5 | `js/data/levels.js` | Level data: `CHUNKS` (width, props, encounter, gate, dusk, fireflies) and `LEVELS` (ordered chunk lists) |
| 6 | `js/data/items.js` | Cosmetics data: `TABS` (Character screen tabs and their sections), `SECS` (section → slot), `EQ` (worn slots), `WHEEL_MAX`, `ITEMS`/`ITEM` (id, sec, slot, name, price, colors, `k` drawing style, `how` to unlock), `STANCES`, `FIGHTER0`, `FIGHTERS`, `STAR_DROP`, `STAR_BONUS` |
| 7 | `js/data/house.js` | House builder data: `HGRID` (20 x 7 squares of 45 px standing on the floor line `G`), wall materials `HTILES`/`HTILE` (price per square), `HOUSE_MAX_ITEMS`. Backgrounds, furniture and decorations are store items in items.js (sections `hbg`, `hfurn`, `hdecor`, with `w`/`h` in squares and a drawing kind `k`) |
| 8 | `js/economy.js` | The one gate for stars and items: `grantStars`, `spendStars`, `owns`, `grantItem`, `buyItem`, `checkUnlocks`, `openGift`, `runEnd`; fighters: `normFighter`, `fighter`, `curFighter`, `lookRaw`, `lookOf`, `saveFighter`, `deleteFighter`, `shade`; `giftPool` |
| 9 | `js/player.js` | Game-state globals (`PL`, `E`, `FX`, `wave`, `score`…), Surge stamina (`canSurge`, `spend`, `wind`, `stamTick`, each taking the player), `pick`, `F`/`F0`, `mkPlayer`, `inputOf`, `tgt`, `init`, `updP(p)` |
| 10 | `js/effects.js` | Effect spawners: `fxp`, `spark`, `ring`, `dust`, `txt`, `ghost` |
| 11 | `js/combat.js` | Hitboxes, `startAtk`/`tickAtk`/`endAtk`, blocking, grab/pummel/throw, hit weights and `impact`, `hurtE`/`hurtP`, `bowl`, `sep`, `groundY`, physics, pose helpers |
| 12 | `js/terrain.js` | One-way floors and stairs any mode can switch on: `TERRAIN`, `terrainSet(list)`, `surfY`, `surfNear`, `surfCross`, `terrainStep(f, y0)` (called by `phys`), `terrainDrop(f)` |
| 13 | `js/enemies.js` | `updE`, AI director, `aiThink`, boss framework, `spawn`, `makeQueue`, `nextWave` |
| 14 | `js/modes.js` | The mode interface and `ARCADE` (endless waves); `MODE` = the mode being played; co-op rules |
| 15 | `js/level.js` | `LEVEL` mode: `buildLevel`, `startLevel`, `continueLevel`, camera and walls (`levelWalls`), encounters, gates, level clear/fail, level HUD |
| 16 | `js/versus.js` | `VERSUS` mode: rounds, countdown, KO, timer, winner screen, player push-apart |
| 17 | `js/pickups.js` | Star pickups and gifts: `PK`, `dropRoll`, `dropScan`, `pickTick`, `collect`, `collectAll`, drawing (`shuriken`, `giftBox`, `drawPickups`, `starHud`) |
| 18 | `js/net/rtc.js` | Online connection: WebRTC data channels and the signaling-server talk (`NETCFG`, `RTC`, `rtcHost`, `rtcJoin`, `rtcSend`, `rtcClose`; callbacks `RTC.on.peer/msg/gone/err`). Knows nothing about the game. |
| 19 | `js/net/session.js` | Online room and lockstep: `NET` state, `NETIN` slots, `maskOf`/`applyMask`, `simHash`, `netHost`/`netJoin`/`netLeave`, host and guest messages, `netStart`/`netStartLocal`, `netCmd` (again / continue / room), `netTick`/`netStep`, desync check |
| 20 | `js/ragdoll.js` | Verlet ragdoll, death poses, corpse settle and confetti dissolve, `drawRag`, `drawTatsu` |
| 21 | `js/scenery.js` | Level drawing only: parallax layers, props, the log gate, foreground grass, leaves and fireflies |
| 22 | `js/looks.js` | Drawing a fighter's look: `drawLookUnder` (cape, hood), `drawLook` (legs, shoes, shirts, jackets, dresses, ties, gloves, scarf, hair, band, hat), `drawHat`, `drawHair`, `surgeCol`/`surgeExtra`, `VPOSE` poses, `lookPose` (stance, victory and pose-wheel blending), `cheering`, `drawWheel`, `drawItemIcon` |
| 23 | `js/house.js` | Drawing a house (`drawHouse`, `houseBg`, `houseTile`, `houseThing`) and House mode (`HOUSE_MODE`, `startHouse(h)`, `HVIEW` = the house being visited) |
| 24 | `js/render.js` | Gear, figures (`drawFig`), background, effects, HUD, `render()` |
| 25 | `js/ui/panels.js` | Training panels: move list, fighter info, feel sliders |
| 26 | `js/ui/training.js` | Training Room state (`TR`), dummies, hitbox and frame-data overlays, hotkeys |
| 27 | `js/ui/touch-layout.js` | Touch layout profiles and the layout editor |
| 28 | `js/ui/lobby.js` | Players screen: joining with controllers, touch, keyboard, keyboard 2; fighter picks (`lbLook`, `lbFighter`, `lbColor`, `lbHat`); `startMulti()` |
| 29 | `js/ui/online.js` | Online screen: Host / Join, room code picker, room cards, mode and Start, online pause and results buttons (`onlineScreens`), YOU marker and waiting note (`onlineHud`) |
| 30 | `js/ui/bindings.js` | Settings > Buttons: key and controller button bindings |
| 31 | `js/ui/character.js` | Character screen and store: four fighter slots, Body tab (height, head, lines, stance, delete), tabbed shelves with sections and None cards, try-on and buying, pose wheel picks, animated preview (stance, Surge demo, poses) |
| 32 | `js/ui/house.js` | House screen: tabs (walls, furniture, decorations, background, erase), the palette (`housePal`, buying with the two-tap rule), one button per grid square (`houseCells`; drag paints), `houseAct`, WALK AROUND |
| 33 | `js/ui/backup.js` | Settings > Save: Back up / Restore (code or file) |
| 34 | `js/selftest.js` | `selfTest()` determinism check and the fingerprints it expects (`SELFTEST_EXPECT`) |
| 35 | `js/main.js` | Screens, settings binding, screen fit, `update()` (one simulation step), `tick`/`loop`, boot. Loads last. |

Nothing runs game code at load except data setup; boot (`checkUnlocks(); init(); applySet(); resize(); bindSettings(); syncTrain(); openTitle(); requestAnimationFrame(loop)`) is the last thing in `main.js`.

Outside the game: `tools/tests/` (browser tests, run with `node tools/tests/run.js`) and `tools/bundle.py` (the single-file preview). Nothing in `tools/` is loaded by `index.html`.

**Cache-busting:** every asset tag carries `?v=N`. Bump N on every release so iPads never mix old and new files.

## Simulation

- `loop()` (screen rate) accumulates time and calls `tick()` at a fixed 60 Hz; `tick()` calls `update()`. `render()` runs once per screen frame and must not change gameplay state or call `rnd()`.
- `update()` order: hit-stop/slow-mo, players (`updP(p)` for each), `director()`, enemies (`updE`), `bowl()`, `sep()`, star drops (`dropScan`, when `MODE.drops`) and pickups (`pickTick`), cleanup, `MODE.update()` (while someone is alive in play), effect aging.

## Modes, world and camera

- A mode is an object: `update()` runs the rules each step; optional `over()` (KO handling), `bg()`, `fg()` (foreground, drawn over the fighters) and `hud()`. `ARCADE` and `LEVEL` exist; Training still uses `state === 'train'` with no mode rules.
- `CAM.x` is the world x of the screen's left edge. `render()` draws `bg()` in screen space, then the world (fighters, effects) shifted by `-CAM.x`, then `MODE.fg()`.
- `WB` = walls for living fighters (the screen, or a gate). `WW` = world edges for ragdolls. In Arcade and Training, `CAM.x = 0` and both equal the screen.
- A level (`LEVELS[id]`) is an ordered list of chunk ids; `buildLevel()` lays the chunks end to end and makes a run-time copy (`LV`) with encounters (`st` 0 waiting, 1 fighting, 2 done), gates and the checkpoint `cp`. Data is never changed at run time.
- The level camera only moves forward, and stops at the next encounter's lock position or in front of a gate. The ground is still flat (`groundY`).
- Gameplay randomness: `rnd()` only. `Math.random()` only for cosmetics (screen shake, Surge sparkle, noise buffer, unseeded run seed).

## Players

`ROSTER` (input.js) is the list of players in a multiplayer game: `{slot, dev, col, d2, name}` where `dev` is `touch`, `kb`, `kb2` or `pad:N`. It is empty in one-player games, and then every device drives Player 1 as before. `init()` builds `PL` from the roster. `devSlot(dev)` routes a device to its player's input slot (`INP[0..3]`); devices without a player are ignored. Each player carries its own `combo`, `comboT`, `meter` and `hpT`; `score` and `maxc` are shared. `MODE.pvp` (Versus) lets players' attacks hit other players through `pvpHit()`. Co-op rules live in modes.js: `coopScale()`, `coopExtra()`, `reviveTick()`. `MODE.pre()` can hold the simulation (the Versus countdown). There is no "current player" (rule R5): functions take the player, and `hurtE(e, d, dr, src, by)` separates the attacker whose momentum adds knockback (`src`) from the player credited with the combo (`by`; throws and flying bodies pass only `by`).

## Input

Keyboard keys and controller buttons come from bindings (`KEYS` built by `applyBinds()`, `padBinds(g)` per controller type). The left stick always moves and aims. When no game is running (menus, pause), `pollPad()` drives `padMenu()`: d-pad/stick moves focus through the visible screen's controls, confirm presses, back goes back or resumes. Switch controllers use A (right) to confirm and B (bottom) to go back.

Every device calls `setA(src, action, on, slot)`. Each slot (`INP[n]`) has `K` (held), `press` (frame pressed), `AIM` and `SRG` (direction and Surge captured at the press). The simulation reads a player's slot through `inputOf(p)`: `INP[p.slot]` offline, `NETIN[p.slot]` in an online match, or the idle `NO_INPUT` while `MODE.locked(p)`. A press stays usable for 12 frames (`wantIn(I, k)`) until a move uses it up (`eatIn(I, k)`).

## Save

localStorage key `orangeArmy.v1` (never change it) holds `{saveVersion, set, best, prog, eco, chr, house}` (version 7). `SET` holds settings, feel knobs and touch layouts; `BEST` the Arcade records; `PROG` level progress (`{woods1: {done, score, time, combo}}`). `SET.binds` holds custom keys and controller buttons (null = defaults; see `KEYDEF`/`PADDEF` in `input.js`). `ECO` = `{stars, got, own: [item ids], seen: [item ids]}`; `CHR` = `{cur, list: [fighter|null] x4}`, a fighter being `{name, col (a color item id), ht, head, lw, stance, eq: {hair, hat, band, scarf, tie, shirt, jacket, gloves, legs, shoes, surge}, wheel: [up to 8 pose ids]}`. Item ids are stored in saves, so an id is never renamed (the Surge styles still say `trail-`). `normFighter()` upgrades older fighters (`eq.trail` → `eq.surge`, `eq.pose` → first on the wheel). `migrate()` in `core.js` upgrades older saves one version at a time: v1 had no `saveVersion` and no `prog`; v2 had no `binds`; v3 had no `eco`/`chr`; v4 had three fighter slots; v5 had no `house`; v6 counted house rows from the top. `loadSave()` copies a save into the live objects keeping only the expected shapes. Any new shape change bumps `SAVE_VERSION` and adds a step. Nothing is saved while the self-test runs.

Backups (Settings → Save) are `"OVPA-"` + base64 of the save's JSON. Restoring parses it as data, rejects newer versions, migrates it, keeps the old save under `orangeArmy.v1.before-restore`, writes it and reloads.

## Economy and looks

- Stars change only in `grantStars`/`spendStars`, ownership only in `grantItem`/`buyItem` (`economy.js`). Writes are batched (`ecoSave`).
- `dropScan()` gives each newly dying enemy its stars once (`e.dropped`). Pickups (`PK`) bounce, then fly to the nearest player and are banked on touch. Their rolls come from `dropRoll()`, a hash of `SEED`, `fr` and the enemy's index that never advances `rnd()`, and pickups never touch fighters, so the fingerprints did not change. `collectAll()` banks what's left at the end of a run (`runEnd`).
- A player's look is `p.look` (from `lookOf()`): colors, head size, line width, stance and the item object per slot. It's drawing only: `drawFig` takes a head size and line width, then `drawLook` draws items on the joints it reports (`out.hd`, `nk`, `h`, `hb`, `f`, `fb`, `hr`). `drawRag` and `drawTatsu` report their own joints. `lookPose()` blends the idle stance and the victory pose at draw time; its blend state lives in a `WeakMap`, never on the fighter.
- Height (`look.ht`) scales only the drawing in `drawF` (ragdolls keep their size); hitboxes never change.
- Clothes are drawn in layers between the body's own lines: `drawFig(…, lay)` and `drawRag` call `lay.under/back/mid/legs` (from `lookLayers()`) after the far limbs, torso and head, and near leg; the caller then draws `drawLook(…, 'front')` over the near arm. So the far hand sits behind a dress and ties and scarves sit under the near arm.
- Pose wheel: action `e` (T, Select, touch POSE). While it's held on the ground `updP` keeps the player still and stores the aimed direction in `f.wheel.d` (eighths of a turn from up); letting go sets `f.emote = {d, at}` (`at` = the frame it was struck). `wheelSeg(d, n)` turns a direction into one of the n (up to 8) slices when drawing. A new left or right press (pressed at or after `at`; a direction still held from aiming doesn't count), jumping, Surge or attacking clears it. Nothing else reads these, so a fight plays the same with or without poses; `lookPose()` draws the pose from the fighter's wheel and `drawWheel()` the wheel. Older saved key/button bindings without `e` use its defaults.
- Online, `drawWheel()` runs only for the local player (`NET.mySlot`); the pose itself is shared through the simulation.
- The HUD's trailing health bar (`p.hpT`) and the Surge sparkles are updated in `updP`, never in `render()`.
- `MODE.locked(p)` (Versus after a KO) makes `inputOf(p)` return `NO_INPUT`, an idle slot, so the players can't move.
- Controller menus (`navMove`) pick the nearest control in the pressed direction by on-screen position.
- Surge afterimages (`GH`) remember their owner (`own`) so they can be drawn in the owner's Surge style.
- `withCtx(canvas2d, fn)` points every drawing function at another canvas (store icons, the character preview, Players screen cards).

## Terrain (floors and stairs)

Every fighter has `f.gy`, the height it stands on: `G` (the floor line) or a surface from `terrain.js`. All ground checks use `f.gy` (`f.y >= f.gy - 1` = on the ground). A surface is a line `{x1, x2, y1, y2}`, flat or a stair ramp, kept by column for quick lookup. `phys(f)` moves the fighter, then `terrainStep(f, y0)`:
- standing on a surface and not jumping: follow the surface under the new x within `|vx| + 6` px (up and down stairs, onto a touching surface); none = walked off, fall;
- airborne and falling: land on the highest surface crossed this step (`surfCross`); a fighter on the floor walking into stairs is not airborne, so it passes through;
- going up: no collision (`f.gy = G` until landing). Down + Jump calls `terrainDrop(f)`, which ignores surfaces for 12 frames.
Modes switch it on with `terrainSet(list)`; `init()` clears it, so Arcade, the Trail and Versus are unchanged (fingerprints too). Ragdolls still fall to `G`. `CAM.y` lets the view look up (render translates by `-CAM.x, -CAM.y`).

## House

`HOUSE` (core.js, saved) = `{bg, cells: {"c,r": material}, solids: {"c,r": 'floor'|'stairR'|'stairL'}, items: [{id, x, y}]}`. Squares count `c` from the left of the land and `r` up from the floor (row 0 sits on `G`); an item is placed by its bottom-left square. The land is up to `HGRID.maxCols` x `maxRows` (240 x 60); the editor shows 20 x 7 squares and can move over what's built plus room to grow (`houseLimits`), and the walkable world is as wide as the house (`houseExt`). `normHouse(h, any)` (economy.js) is the only way a house is trusted: unknown materials, solids, items and off-land squares are dropped, positions kept on the land; a house saved before version 7 (`flip7`) has its rows turned over. Everything placed is paid with `spendStars` (walls and solids per square, furniture and decorations per piece) and erasing gives it back with `refundStars` (not counted as stars earned); backgrounds are bought once with `buyItem`. House mode turns the solids into terrain (`houseTerrain`), draws the house from cached lists (`houseLists`, remade when the cells or solids object changes) culled to the view, and moves the camera after your own fighter at draw time (`houseCamera`; nothing in House mode's simulation reads `CAM`). Online, `start` carries the host's house (`m.house`), so every device builds the same terrain.

## Self-test

Open the game with `?selftest`. It resets feel knobs to defaults, plays 3,600 frames of Arcade waves with scripted inputs, adds a Guard, Flanker and Captain, plays 1,800 more frames, and fingerprints positions, health, states, score, wave and the random generator. Then it plays up to 7,200 frames of the Wooded Trail with scripted inputs (it never saves progress) and fingerprints the level state. It shows MATCH when both equal `SELFTEST_EXPECT` in `js/selftest.js` (the one place the expected values are kept), CHANGED otherwise. A refactor must not change them. A gameplay change will: put the new values in `SELFTEST_EXPECT` and mention them in that CHANGELOG entry. `node tools/tests/run.js selftest` runs it (see TESTING.md).

## Still assuming a flat world

Ragdolls, death poses, pickups and enemy AI still treat `G` as the only ground (no enemies appear where there is terrain yet). Levels with platforms would move ragdolls and pickups onto `terrain.js` and teach the AI to use stairs.

## Online play

Three layers, so each can be replaced on its own (matchmaking, Steam):

1. **Connection** (`net/rtc.js`). WebRTC data channels, reliable and ordered. Devices find each other through several free signaling routes at once (`NETCFG.peerjs`: the PeerJS cloud server; `NETCFG.mqtt`: public MQTT brokers over WebSocket, with a minimal MQTT 3.1.1 client in plain JS). Every signaling message goes by every route with a nonce, and copies are dropped (`RTC.seen`). A host listens as `orangearmy-<room code>` (MQTT topic `orangearmy/v1/orangearmy-<code>`); a guest sends an offer (repeated at 2.5 s and 6 s). No answer in 14 s = NOROOM; an answer but no open channel in 25 s = BLOCKED. `?signal=` and `?mqtt=` point the game at other servers (the tests run local copies). STUN in `NETCFG.ice`; TURN from `NETCFG.relay` (the Open Relay Project's public server; its login is made with `crypto.subtle` HMAC from a shared secret). `rtcDiag()` reports which services answered. Messages are JSON objects and are only ever parsed, never run.
2. **Room** (`net/session.js`). `NET.players` = `{slot, id, name, f (fighter), cid (color), rtt, left}`. Guests say `hello` with `GAME_VERSION` (core.js; bump it with `?v=`) and their fighter; the host replies `welcome` or `deny` (VERSION, FULL, PLAYING) and sends `room` updates. Fighters from other devices are checked with `normFighter(f, true)` (shape, not ownership); the host keeps colors unique.
3. **Lockstep (direct).** `start` carries the epoch, seed, mode, input delay D, the host's `FEEL` and the roster. Each device sends `{t:'i', e, f, s, m}` (its button mask for frame f + D, one bit per `ACT`) straight to every device it's connected to: the host to all guests, a guest to the host and to the guests it reaches directly (`NET.links`; the newer guest calls the older ones, `netMesh`/`rtcConnect`). Guests report their links to the host (`links`), and the host passes a guest's buttons to any guest without a direct link to it (and resends recent frames from `NET.hist` when a link breaks). Every device stores buttons in `NET.tab` and simulates frame f once it has them from every player still in (`netReady`/`netStep`): `applyMask()` feeds `NETIN[slot]` exactly like `setA`, `inputOf(p)` returns `NETIN` during a match, then `fr++; update()`. D = one trip between the two slowest players (`(rtt1 + rtt2) / 2`) + 1 frame, 2–10. `fr` starts at 0 for every match. Leaving: a guest's `bye` carries its last sent frame; the host announces `drop` (slot, first frame without them, and its copies of their recent buttons) and every device runs `playerLeft()` at exactly that frame: the fighter dies, leaves `ROSTER`, and its body dissolves (`corpseTick` with `f.left`) before it's removed from `PL`. Guests send `simHash()` every 120 frames; the host compares (keeping early ones in `NET.gh`) and a mismatch ends the match (`desync`). After a match, `cmd` (again / cont / room) comes from the host with the frame it was at, so a guest that's behind catches up first.

While `NET.match` is on: the main loop runs `netTick()` instead of `tick()` and never pauses; `devSlot()` maps every local device to `NET.mySlot`; `newSeed()` uses the host's seed; the pause menu hides Restart (guests) and Settings (everyone, so feel settings can't change mid-match).
