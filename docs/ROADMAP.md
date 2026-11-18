# Orange vs. the Pink Army: Development Roadmap

*Milestones M0–M18 and the Combat Chart · Draft 4: M0–M7.5 complete; milestones reordered on November 16, 2026 (multiplayer moved up) · November 16, 2026*

> This file is the roadmap of record. It started as the Claude Docs roadmap and was copied into the repo during the M7.5 restructure; update it at the end of every milestone. The long-term vision and the architecture rules are in [VISION.md](VISION.md).

## How to use this document

Each milestone has an ID. Say “Start M3” or “change the scope of M3” and I’ll build against that milestone’s Definition of Done. Every milestone ends with a playable published build and a short test checklist. The Combat Chart at the end is the source of truth for moves: we edit the chart first, and the code reads it as a move table.

**Why this order.** Input comes first because every combo depends on knowing which direction is held. Then the combat engine, then Surge (your stamina system), because Surge modifies moves. Collision feel and ragdoll come before levels and progression, since you called them the core of the game and there’s no point building five levels on combat that will change. Progression and the shop come once there’s a real level to earn XP in. Levels 2–6 come last, when the systems stop moving.

**Where things stand.** M0 to M11 are complete and playable, both in the preview and on GitHub Pages (rhetters.github.io/stickfighters, linked from Rhett's game site). M3 was built before M2, which caused no problems because Surge reads your aim directly. M6, the custom touch layout, was added mid-way at Rhett's request, so the milestones after it each moved down one. M11 (online multiplayer, moved up from M17 at Rhett's request) is built and waiting for a real house-to-house test; M12 (XP, levels and the skill tree) is next.

**Why this order after M7 (reordered November 16, 2026).** Ron and Rhett approved the order from the restructure plan. M8 builds the level framework so the world is no longer one screen and each game type is a separate "mode". Local multiplayer comes next (M9) so Rhett gets Smash-style versus early, and because network play later needs the same per-player groundwork. The ninja star store with character creation (M10) follows. Network play (M11) comes right after it (moved up from M17 on November 17 at Rhett's request; it only needs M9 and M10, and building it early means every later feature is made online-ready from the start). Then progression with the skill tree (M12), the rest of the campaign (M13–M16, ending in the v1.0 release), the level creator (M17) and the house builder (M18). The old numbers are listed under "Renumbering" below.

## Ground rules

- Plain HTML, CSS and JavaScript with no build step, served by GitHub Pages as-is (since M7.5 the code is split into `css/` and `js/` files; see [ARCHITECTURE.md](ARCHITECTURE.md)). No outside images or network. All art stays procedural, which suits stick figures. Sound is generated with WebAudio.
- Saves use localStorage: per device, not synced. M0 checks whether cross-device saves are possible.
- Jump gets its own button. Up now means “aim up” in combos, so W and ↑ can no longer jump.
- Fixed 60 Hz simulation. All frame data in the chart is in 60 fps frames.
- Clean tone, no blood. Impacts are dust, stars, rings, and pink poofs.

## Milestone overview

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

## Milestone details

### M0 · Foundation, training room, game shell

**Goal:** Make the project safe to grow, and give us tools to tune combat by eye.

- Reorganize the code into labeled sections: Input, Moves, Fighters, Physics, Render, Level, UI.
- Data-driven move table. Each move defines startup, active, and recovery frames, hitbox, damage, effect, pose keyframes, cancel window, and Surge cost. The existing moves move into it.
- Seeded random numbers so any bug or feel issue can be reproduced.
- Training room: dummy spawner, hitbox and hurtbox overlay, frame-data readout, input-history strip, slow motion and frame step.
- Game shell: title screen, pause, settings (volume, controls), save slot.

**Done when:** The current game plays the same but runs from the move table, and the training room shows boxes, frame data, and input history.

**Status: complete.** Shipped as planned: title, pause, settings, saved best score, seeded runs (the seed shows in the pause menu), and the training room with dummies, hitboxes, frame data, input history, slow motion, freeze and frame step. Moves and the inputs that pick them now live in data tables; M2 and M3 added each move's effect, unlock tier and Surge cost.

### M1 · Input system and mobile/iPad controls

**Goal:** One input layer that every later feature uses.

- Actions: Left, Right, Up, Down, Jump, Punch, Kick, Surge (hold). Keyboard, touch, and gamepad all feed the same actions.
- Tracks which direction is held at the moment an attack is pressed, a 12-frame buffer, and simultaneous presses.
- Keyboard: A/D or ←/→ move, W/↑ and S/↓ aim, Space jump, J punch, K kick, Shift Surge. iPad keyboards work the same.
- Touch: a floating stick on the left with Up and Down zones; Punch, Kick, Jump, and Surge on the right, each at least 64 px, multi-touch, adjustable size and opacity, left-hand mirror.
- Mobile/iPad: fit to screen with safe areas, sharp rendering on retina, no page scroll or zoom, rotate-to-landscape prompt, audio unlock on first tap, performance budget for older iPads and phones (capped particles, cached background).
- Gamepad via the Gamepad API (works in iOS Safari with Bluetooth pads).

**Done when:** You can move, jump, aim, and attack on phone, iPad, and keyboard, and the input history shows combos registering from touch.

**Status: complete, two device checks left.** All actions work on keyboard, touch (fixed stick in the corner, your choice) and gamepad, and the aim is recorded the instant you press Punch or Kick. Tested in desktop Chrome and in iPhone and iPad emulation. Still to do: a run on a real phone or iPad, and on a real gamepad. On an iPhone the buttons are 55 px, under the 64 px goal; Touch size in Settings enlarges them.

### M2 · Combat engine and directional combos

**Goal:** Build every non-Surge move in the Combat Chart (sections A–D).

- Fighter state machine: idle, move, attack, hitstun, launched, knockdown, get-up, Surge.
- Branch rule: the direction held when you press an attack picks the branch (Neutral/Forward, Up, Down, Air). Standing still and Left/Right behave the same.
- Strings: press the same or the other attack button inside the chain window to continue. Mixed finishers are supported.
- Animation library: anticipation, strike, follow-through, and recovery poses, with smears and trails on heavy moves.
- Hit effects: stagger, pop, launch, knockdown, trip, wall splat, ground bounce (full physics arrives in M4).
- Combo counter, damage scaling in long combos, and a juggle limit so nothing is infinite.

**Done when:** Every row in sections A–D is playable, hits correctly, and shows frame data in the training room.

**Status: complete.** All 30 moves in sections A–D work and land every hit of their strings, mixed finishers included. Also added: the hit effects in section F (basic Splat and Bounce; M4 adds the full physics), a juggle cap of 7, damage scaling in long combos (4% less per hit after the third, never below 45%), a get-up with protection, player knockdown, and motion smears on heavy moves. The training room's Move list (M key) ticks off every chart row as you land it. Every move is unlocked until M12 (see Open decisions).

### M3 · Surge (stamina) system

**Goal:** Add the yellow stamina bar and everything it powers.

- Name, bar, drain, regeneration, and a “Winded” state at zero (short lockout, slower movement).
- Surge run: faster movement that phases through enemy bodies (ghosted look, no body collision).
- Surge jump: higher, longer, with an air burst.
- Surge strings: Combat Chart section E. Holding Surge swaps each branch to its Surge version.
- Visuals: yellow afterimages, speed lines, bar flash when low.
- Every number is tunable (max, regen, costs) so the skill tree can change them in M12.

**Done when:** You can chain Surge run, phase through a crowd, and finish with Surge strings, with the bar draining and recovering predictably.

**Status: complete.** Built before M2. Bar values match the chart (100 max, 25 per second regen after 0.6 s, 1.5 s Winded). Changes from the plan: Surge Slide is Surge run + Down rather than S+D, so S+D+P and S+D+K stay free; the M1 placeholder dash was removed; phasing skips enemy bodies only; the blue Tornado meter stays separate. Presses during a long move now queue until the move can chain.

### M4 · Collision and impact feel

**Goal:** Make every interaction feel physical. This is the core of the game.

- Mass, friction, and bounce per fighter type. Momentum transfers on hits and on body-to-body collisions. Pushing into an enemy shoves them.
- Hit-stop scaled by hit weight (light 2–3 frames, medium 4–5, heavy 6–8), camera kick, and layered sound.
- Interactions: wall splat, ground bounce, bowling chains with damage falloff, launched enemies as projectiles, pile-ups, armor and poise on big enemies.
- Grab and throw: Punch + Kick together grabs an enemy in reach; a direction throws them, and a thrown enemy knocks over anyone they hit. Big enemies can't be grabbed until staggered. The moves are added to the combat chart once built.
- Juggle and knockdown rules with get-up protection, so combos are strong but never endless.
- Ground height is a function (groundY), so stairs and platforms can be added later without a rewrite.
- Groundwork for multiplayer (M9): the player becomes one entry in a list of fighters, each with its own input, Surge bar and HUD slot, and enemies pick a target instead of assuming one player.
- A feel-tuning pass with a checklist you approve.

**Done when:** Light, medium, and heavy hits feel clearly different, bowling chains behave predictably, and there’s no jitter or stuck bodies.

**Status: complete and signed off (all checklist items ticked; the screen shake slider was fixed so 0 means no camera motion).** Everything above is in the game and tested in the browser. The numbers:

- Hit-stop is 3, 5 or 7 frames for light, medium and heavy hits, plus 2 on a kill.
- Mass is 1 for a grunt, 0.8 for a runner and 2.2 for a brute. The same kick sends a runner 97 px, a grunt 62 px and a broken brute 20 px.
- Brute poise is 40. It regrows after 2 seconds without a hit, and a break lasts 2.5 seconds.
- Bowling damage drops 25% per link in the chain.
- Only one hit can land on a downed enemy per knockdown.
- A crowd packed onto you settles to 0.04 px of wobble.

You can tune the feel live in the training room (Feel, T key): hit-stop, shake, knockback, gravity and bounce. Also fixed: Flash Strike now brakes just behind its target, so Barrage connects.

**Feel checklist.** Tick each item you're happy with; anything unticked gets tuned before M5.

- [x] Jab, cross and haymaker each feel clearly lighter or heavier than the last
- [x] Heavy hits (haymaker, flip kick, Shockwave Palm) freeze and kick the screen enough, without feeling sluggish
- [x] Runners fly further than grunts; brutes barely move until their poise breaks
- [x] Breaking a brute's poise feels like a payoff (BREAK, dizzy stars, then free to juggle or grab)
- [x] Grab (J and K together) never fires by accident during fast J, K strings
- [x] A forward throw into a crowd bowls them over in a way you can predict
- [x] Walking into enemies shoves them, and crowds don't jitter or stack
- [x] Wall splats and floor bounces read clearly
- [x] Light snap, medium thump and heavy boom sound distinct

### M5 · Ragdoll, death poses, cleanup

**Goal:** Bodies that move and settle convincingly, kept clean.

- Physics skeleton (about 14 joints with limits) that blends from the animated pose into ragdoll on launch or death. The hit direction drives the motion.
- Settle detection and friction, so bodies slide, flop, and stop.
- Death poses chosen by how the enemy died (see the pose list below).
- Cleanup: bodies hold for a few seconds, then dissolve into pink confetti puffs. A cap of about 12 bodies keeps performance steady.
- Dazed look for non-lethal knockdowns: orbiting stars over the head.

**Death poses:** face-down sprawl, spread-eagle on back, curled on side, slumped against the wall (after a splat), kneeling then toppling forward, legs-up against a wall, face-plant with legs in the air, folded in half (after Meteor Kick).

**Done when:** Every hit type produces a believable ragdoll, death poses vary by cause, and 50 kills in a row stay smooth.

**Status: complete.** Every knocked-down, launched, splatted or killed fighter (you included) is now a 13-point physics ragdoll. While alive, its middle is pinned to the gameplay body, so juggles, hitboxes and bowling are unchanged and only the limbs flail. Dead bodies are released, tumble, settle, ease into a death pose, hold about 2.5 seconds, then puff into pink confetti.

| How they died | Death pose |
|---|---|
| Light finishing hit while standing | Kneels, then topples forward |
| Launch or Pop | Spread-eagle on back |
| Trip (sweeps) | Curled on side |
| Bounce (Axe Kick, Spike Fist, Slam, Ground Pound, Quake Fist) | Face-plant, legs up |
| Meteor Kick | Folded in half |
| Splat into the wall | Slumped against the wall |
| Knocked into the wall | Legs up the wall |
| Any other knockdown | Face-down sprawl |

Also done:

- Pop shows a brief limp ragdoll and lands on its feet.
- Non-lethal knockdowns show dazed stars, and the body crossfades back into animation on get-up.
- Flying bodies shove settled ones into new poses (pile-ups).
- At most 12 bodies stay on screen; the oldest dissolves first.
- Tested: 56 kills in a row cost about 0.3 ms of physics and 0.7 ms of drawing per frame (the budget at 60 fps is 16.7 ms).
- The training room has a **Killable dummies** checkbox, and each settled body names its death pose.

Fixed along the way: a grab no longer fires by accident from the third press of a string (K, K, P).

### M6 · Custom touch layout (added at Rhett's request)

**Goal:** Let each player put the touch controls where their thumbs want them, on any phone or iPad.

- In Settings, right under Touch opacity, **Touch layout** replaces the old Left-hand layout checkbox. It's a profile picker plus a **Customize** button.
- Customize opens an editor over the game. Drag the stick or any button anywhere. Tap one to select it, then drag its yellow corner or use the Size slider to resize it. Controls can't be dragged off the screen.
- Profiles: **Default** and **Left-handed** are built in and can't be changed or deleted. Saving over a built-in asks for a name, such as "Rhett". **Save as new** makes another profile, **Delete** (tap twice) removes a custom one, **Default positions** resets the editor, and **Cancel** discards changes.
- Positions and sizes are stored as fractions of the game area, so a layout made on the iPad also fits a phone. Built-in layouts keep thumb-sized minimums (stick 96 px, buttons 52 px); custom ones can go smaller. Layouts save on the device.

**Done when:** You can rearrange and resize every control on an iPad, save it as a named profile, switch profiles from Settings, and get the defaults back.

**Status: complete.** Tested in iPad and phone emulation: drag, corner and slider resize, naming, switching, Left-handed, reset, two-tap delete, cancel, and that a moved button still works in a game and survives a reload. Also on GitHub (main and an m6 branch).

**Added to M6:**

- **Stuck joystick fixed.** Rhett saw it on the iPad: spamming punch/kick while moving the stick could freeze the stick. Cause: if a touch ended before the stick could lock onto it, the lock failed after the stick had already been claimed by that finger, so it ignored every later touch. Lock failures are now caught, a new finger always takes over, and a watchdog frees the stick or any button left with no finger on it. Reproduced, then verified with 8 seconds of stick and button spamming.
- **Surge button setting:** Hold (push and hold, the default) or Toggle (tap on, tap off). In Toggle the SURGE button stays lit while on, and running out of Surge switches it off. Works for touch, keyboard and gamepad.

### M7 · Enemy AI and roster v2

**Goal:** Enemies that make the new combat interesting.

- Roster: Grunt, Runner, Brute (existing), plus Guard (blocks, must be broken), Flanker (circles behind), and a Mini-boss template.
- AI director: attack tokens, surround spacing, clear telegraphs, and reactions to your Surge phasing (they turn and chase).
- Enemies use the same hit, stun, and ragdoll systems as you.
- Boss framework: phases, health bar, scripted attacks.

**Done when:** Each enemy type demands a different answer from the chart.

**Status: complete.** In the preview and on GitHub (main and an m7 branch). Tested with an automated suite: Guard blocks front hits but not hits from behind, low hits, grabs or the Tornado Kick, and breaks under heavy hits; Flanker gets behind and attacks from the back; no more than two enemies attack at once; phasing through an enemy triggers ?! and a chase; the Captain switches to phase 2 at 55% health; the quake hits a grounded player but not a jumping one. All earlier test suites still pass.

**What each enemy asks of you:**

| Enemy | Behavior | Answer from the chart |
|---|---|---|
| Grunt | Basic puncher | Anything works |
| Runner | Fast lunge from range | Interrupt with quick hits, or Surge past it |
| Brute | Heavy, poise bar (blue) | Heavy hits break poise, then launch or grab |
| Guard (new) | Shield blocks hits from the front; gray guard meter | Hit from behind (Surge through it), sweep low, grab and throw, Tornado Kick, or drain the meter with heavy hits for a GUARD BREAK (dizzy, shield dropped for 4 s). A thrown enemy bounces off its shield. |
| Flanker (new) | Fast; runs or leaps over you to attack from behind | Two-sided moves: Spin Back-Kick, sweeps, Whirlwind; turn and face it |
| Captain (mini-boss, waves 5, 10, 15) | Crowned boss with a health bar and poise. Overhead slam, long charge. Below 55%: ENRAGED, faster, adds a Quake Leap (red ring on the floor) and calls two grunts | Break poise with heavy hits, punish after the charge, jump the quake |

**AI director:** each player has a few attack tokens (2, rising to 3 after wave 5 and 4 after wave 9). Enemies holding one move in and attack; the rest hold a ring 110–260 px out and wait. Bosses always attack. Phasing through an enemy with Surge makes it pause (?!), then chase at 1.6× speed for a second.

**Also added:** a training **Info** panel (**I**) with a card for Orange and every enemy: how to beat it, health, speed, damage per attack, height, weight, poise and guard. Three colored buttons at the top of the Training Room, **Feel** (blue, **F**; was T), **Moves** (orange, **M**) and **Info** (green, **I**), replace the old panel buttons and work by touch. The score is hidden in training to make room. Spawn buttons and hotkeys 4 (Guard), 5 (Flanker) and 6 (Captain). The boss template (phases by health, enter-phase script, health and poise bar, scripted attack picks) is ready for the M14 Pink General. First-time pop-up tips were tried and removed in favor of the Info panel.

### M7.5 · Restructure (no gameplay changes)

**Goal:** Make the project easy to review and safe to grow before the level framework.

- Split the single `index.html` into `css/style.css` and 15 classic scripts under `js/` (cut and paste, no renames), then reformatted with Prettier in its own commit.
- Added `?selftest`: a fixed seed and scripted inputs run 5,400 frames with no drawing and print a fingerprint of the game state. It must not change during a refactor.
- Fixed one determinism leak: the Surge sparkle was drawn with the gameplay random generator inside the drawing code, so a 120 Hz iPad screen consumed it at a different rate. It now uses a cosmetic-only random.
- Fixed old milestone numbers in code comments.
- Docs now live in the repo: CLAUDE.md, docs/VISION.md, docs/ROADMAP.md, docs/ARCHITECTURE.md, docs/CHANGELOG.md.

**Status: complete.** Self-test fingerprint `39f01735` before and after every step.

### M8 · Level framework, modes, and Level 1: Wooded Trail (vertical slice)

**Goal:** Turn waves into levels, prove the whole loop on one polished level, and lay the groundwork the vision needs (see [VISION.md](VISION.md), rules R1, R3 and R9).

- **Modes:** a small mode interface (set up the world, run the rules, decide when it's over, show results). The current wave game moves into an **Arcade** mode; Training becomes a mode too.
- **Camera and world bounds:** the world is wider than the screen. Physics, spawns, drawing and ragdoll wall checks use the world's edges instead of the screen's.
- **A level is an ordered list of chunks.** A chunk is a data file: width, ground shape, spawn points or an encounter budget, props, background layers, entry and exit. M8's list is handmade; M13 adds a generator. The format is designed so the M17 level creator can save to it.
- **Parallax layers** in the paper style: a list of layers with depth, plus optional foreground layers in front of the fighters (trees, grass).
- Encounters use the M7 AI director with a difficulty budget per chunk.
- “GO →” prompts, checkpoints, level-complete screen.
- Level 1: trees, drifting leaves, fireflies, a log obstacle, four to five encounters.
- **Decision gate G1:** keep levels flat, or commit to platforms (see M15).

**Done when:** Level 1 is playable start to finish on iPad, phone and desktop, Arcade mode still plays as before, and the self-test passes.

**Status: complete.** The title screen now offers **Play: Wooded Trail** and **Arcade: Endless Waves**.

- **Modes:** Arcade (the original waves) and Level are separate modes on the same combat engine. Training is unchanged.
- **The trail:** six chunks, 6,900 px long: Trailhead, Birches, Fallen Log, Clearing, Grove, Trail End. The camera follows you forward only and stops for each of the 5 ambushes (enemies leap down from the treetops). You can't leave the screen during a fight. After a fight: +25 health, a checkpoint, and a flashing GO →.
- **Fights:** 3 grunts; grunts and runners; a Guard with grunts; Flankers, a runner and a Brute; then the Grove finale with a Guard, a Flanker, a Brute and the Captain. Enemies get tougher as you go.
- **The fallen log** blocks the trail after the third fight. Punch and kick it (or splat an enemy into it) until it smashes.
- **Continue:** a KO in the level offers Continue from the last fight you won (full health, score kept) or Restart.
- **Level clear:** walking through the Sewer Entrance arch shows time, score (with a time bonus) and best combo, and saves your best score and time.
- **Scenery:** paper-style parallax (far mountains, hills with pines, a tree line), trees, birches, pines, bushes, rocks, stumps, ferns, signs, foreground grass, falling leaves, a sky that goes from morning to dusk, and fireflies in the Grove.
- **HUD:** level name with a trail map (fights, the log, you), enemies left, and the GO arrow.
- **Save version 2:** the save now records level progress. Old saves load with every setting, best score and touch layout intact.
- **Self-test:** a second fingerprint plays the Wooded Trail with scripted inputs (`8c67f67e`); the Arcade fingerprint is unchanged (`39f01735`).
- **Decision gate G1 (platforms):** still open. The trail is flat; M15 decides on platforms.


**Combat patch (after M8, at Rhett's request):**

- **Block:** Down + Surge while standing still. Kneeling guard that shakes harder as the Surge bar empties. Blocked hits from the front cost Surge (2× the hit's damage) with a small pushback and no stun; holding the block drains 8 Surge per second. When Surge runs out you're Winded, the block drops, and hits land normally. Hits from behind are never blocked.
- **Ground hits:** a knocked-down enemy can be hit by any move. Half damage and a ragdoll flop, but no extra down time and no juggle count, so it stands up when its original knockdown ends. A finishing hit on the ground kills it normally.
- Self-test fingerprints are now Arcade `c87c9470`, Level `21292ab5`.
### M9 · Local multiplayer: co-op and versus

**Goal:** Up to four people play on one screen (the TV setup): together through levels, or against each other in an arena.

**Stage A: one player per input, with no hidden "current player"**

- Every system takes the player it works on, instead of the old global swap (rule R5). Combo counter, meter and HUD become per player. The self-test fingerprint must stay the same for one player.
- Each input slot has a source: keyboard, touch, or gamepad 1–4 (and later the network).

**Stage B: join screen and the TV setup**

- "Press any button to join," like Smash: browsers only see a controller after a button is pressed, so pressing one is how you join. Switch Pro Controllers and Joy-Cons pair with iPadOS 16 and later.
- Each player picks a color. Every menu works with a controller.
- Keyboard fallback for two: Player 1 on WASD, Space, J, K, Shift; Player 2 on the arrows and numpad (0 jump, 1 punch, 2 kick, 3 Surge).
- Check AirPlay mirroring delay against a wired HDMI adapter; fighting games are sensitive to delay.

**Stage C: versus (Rhett's Smash-style mode)**

- Fixed arena, 2–4 players (8 later), free-for-all or teams. Best of 3 rounds, round timer, round-start countdown and slow motion on the final KO.
- Tighter rules than co-op: juggle cap of 4, stronger damage scaling, get-up protection.
- Needs a way to defend, such as holding Back to block with a parry on a well-timed press (see Open decisions).
- Equal stats for now; after M10 and M12, players can bring their skills and look, with a Fair-mode switch.

**Stage D: local co-op**

- A player can join mid-level. The camera zooms out to keep everyone in view.
- Enemies spread their attacks across players; enemy count and health scale with the number of players.
- No friendly fire in co-op. A knocked-out player is revived when a partner stands next to them; if everyone is down, the level fails.
- Each player earns their own XP and ninja stars once those exist.

**Done when:** Two to four players finish Level 1 together on one screen, a best-of-3 versus match plays start to finish on controllers, and the self-test is unchanged for one player.

**Status: complete** (pending Rhett's test with real controllers on the iPad and TV).

- **Players screen** (title → Multiplayer): up to 4 players. Controllers join by pressing any button and leave with B; you can also join with the touch screen, the keyboard, or a second keyboard player (arrows and number pad, press 0 on the number pad to join). Colors by slot: Orange, Blue, Green, Purple.
- **Per player:** each player has their own input slot, health, Surge, blue meter, combo counter and Winded state. In multiplayer the HUD shows a compact row per player. Touch controls hide when nobody joined with touch, so they don't cover the TV picture. Any controller's Start pauses.
- **Versus:** The Clearing arena, 2–4 players, free-for-all, best of 3 rounds: countdown, 60-second rounds, last one standing (or the most health when time runs out), slow-motion KO, winner screen and Rematch. Light hits stagger briefly so strings connect; launches and knockdowns give protection until you're back up (no juggles in versus yet); long combos scale down faster than against the army. Block works in versus. Equal stats for everyone. Players push each other apart unless they're phasing with Surge.
- **Co-op:** Wooded Trail and Arcade with 2–4 players. No friendly fire. Enemies get 35% more health and about 30% more grunts per extra player, and more can fight at once. A downed player is revived (40% health) when a teammate stands next to them for 2 seconds; if everyone is down, Continue works as before. The camera follows the player furthest along; players who fall behind are pushed along by the left edge of the screen.
- **Choices made (Rhett can change them):** versus is last-one-standing with a health bar, free-for-all only (no 2v2 yet), and co-op revive is "stand next to them for 2 seconds".
- **Not yet:** juggles in versus, per-player character looks (comes with M10).

**Post-M9 patch:** title PRESS START → SOLO (Campaign | Arcade) · MULTIPLAYER (Local | Online placeholder) · Character (placeholder) · Training Room · Settings; Feel sliders in Settings for mid-match tuning; grabbing and throwing players in Versus (mash to break free; grabs beat blocks); Versus teams (free-for-all or teams, picked in the lobby).
- Self-test fingerprints unchanged (one player): Arcade `c87c9470`, Level `21292ab5`.

### M10 · Ninja stars, cosmetic store, character creation

**Goal:** Collect stars, spend them on your look, and make the fighter yours. Merges the old "items and shop" and "character creation" milestones.

- Ninja stars drop from defeated enemies (Grunt 1–2, Runner 2–3, Brute 8–12, more for Guards, Flankers and Captains), with a bonus at high combo counts and a magnet pickup arc. They're credited at the end of a run through one function (rule R7).
- **Store items are cosmetic only** (rule R8): heads and hats, headbands, scarves, gloves, shoes, colors, trails, victory poses. The store is organized by slot. Some items are fixed unlocks (beat a level, land a combo) and some are random drops.
- Changed from the original shop plan: gear that changed stats, charms and bought consumables are out of the store, so purchases never make anyone stronger. Health and Surge pickups can still appear in levels as part of play.
- Character creation: name, body color (swatches that always contrast with the pink army), head ring size, line thickness, idle stance, and equipping owned cosmetics. Live preview, randomize, three save slots. (A starting style that sets your first skill point is added in M12, with the skill tree.)
- Accessories attach to joints and follow the ragdoll. In multiplayer, each player's look is shared as item IDs and drawn by every device.
- **Character creation in local multiplayer** (like Mario Kart): on the Players screen, each player picks or customizes their own fighter with their own controller (or touch), side by side, before Versus or Co-op. Their name and look carry into the match, the HUD and the winner screen. Each player can load a saved fighter or tweak one for that session.
- Save version and migrations, plus **Back up / Restore save** (a file or a text code), so hours of grinding survive Safari clearing data.

**Done when:** Stars drop and collect, you can buy and equip cosmetics, create and load fighters that look right in every move and death pose, and a backup restores on another device.

**Status: complete** (pending Rhett's test on the iPad).

- **Ninja stars:** defeated enemies drop them (Grunt 1–2, Runner 2–3, Flanker 3–5, Guard 4–6, Brute 8–12, Captain 20–30, plus 1 for every 10 hits of combo, up to 5). They pop out, bounce, then fly to the nearest player and go straight into your wallet. Wave clears (Arcade) and level clears (50 the first time, 20 after) give more. A shuriken counter sits next to the score; the results screen shows what the run earned. No stars in Versus or the Training Room. One wallet per device, shared by every fighter.
- **Gifts:** a Captain always drops a gift box (a Brute sometimes does): a random item from the gift-only set that you don't own yet, or 40 stars once you have them all.
- **Character screen** (title → Character): three saved fighters (tabs at the top). Body tab: name (or RANDOM for a random look and name), head size, line thickness, stance (Classic, Boxer, Low, Loose). Shelves: Colors (6 free, 6 to buy), Hats (12), Bands (6), Scarves (6), Gloves (5), Shoes (5), Trails (6, the color of the swoosh on big hits) and Victory poses (7). Every shelf is also the store: tap something you own to wear it (tap again to take it off); tap something you don't own to try it on, then tap again to buy it. Prices run from 25 to 300 stars. A live preview shows your stance, a roundhouse (with your trail) and your victory pose.
- **Unlocks:** Ranger Hat (clear the Wooded Trail), Gold Band (20-hit combo), Halo (Arcade wave 10), Champion pose (win a Versus match). Older saves get what they already earned the first time M10 loads.
- **Looks in the game:** hats, bands, scarves, gloves and shoes follow the body in every move, in ragdolls and death poses, and in the Tornado Kick. Victory poses play when you clear a level (the results wait a moment so you see it) and for the winner of each Versus round.
- **Players screen (Mario Kart style):** each player picks one of the saved fighters or plays as a guest, and can change color and hat for that session: with their controller (left/right = fighter, top button = color, left button = hat) or by tapping their card. No two players get the same color, and names that match get a number.
- **Back up / Restore** (Settings → Save): the whole save as a text code to copy, or a file to keep. Restoring reads it as data only, shows what's in it, asks for a second press, keeps a copy of the old save, then reloads.
- **Save version 4** adds the wallet, owned items and fighters, migrating from every older version.
- **M10 patch (Rhett's 16 fixes, November 16):** tabs became Body, Colors, Head (hair, hats, bands), Neck (scarves, ties), Upper Body (shirts, jackets, gloves), Lower Body (pants, shorts, skirts, dresses, shoes), Surge and Poses, each with a None card; 143 items. Trails became Surge styles (the glow and afterimages when you use Surge). Victory poses became a **pose wheel**: up to 4 poses (the first is the victory pose); hold T, Select or POSE in a fight, aim, let go. Height setting, four fighter slots, delete a fighter, gifts show the item inside, headphones fixed, no more spinning in the preview. Save version 5.
- Self-test fingerprints unchanged: Arcade `c87c9470`, Level `21292ab5`. Star drops use their own seeded roll, not the gameplay random sequence.

### M11 · Online multiplayer (internet, cross-play)

*Moved up from M17 on November 17, 2026 at Rhett's request. It only needs M9 (players in slots, inputs through `setA`) and M10 (looks are shared at the start of a match), and doing it early means every later feature is built and tested with online play in mind instead of retrofitted. Widened the same day from home Wi-Fi to the internet (house to house) with cross-play between PCs, iPads and phones.*

- **Host / Join.** One player hosts and gets a room code (a word and a number, like COMET-76); others pick the code with arrows (no typing, so controllers work) and join. Up to 4 players, one per device. The room shows everyone's fighter; each player changes theirs with ◀ ▶. The host picks Co-op Trail, Arcade or Versus and starts.
- **Any device with any device.** It runs in the browser, so PC, iPad and phone mix freely.
- **Three layers**, so matchmaking or Steam can replace one without the others: the *connection* (`net/rtc.js`: WebRTC data channels, found through the free public PeerJS signaling server, spoken to in plain JavaScript; STUN for home routers), the *room* (who's in, fighters, mode, version check; the host decides) and *lockstep* (every device runs the same simulation and only button presses travel, rule R2).
- **Lockstep, direct (patched November 17):** each device sends its buttons for frame f + D straight to every other device (guests connect to each other; the host passes buttons along where two guests can't). D covers one trip between the slowest pair (2–10 frames; about 3 at 58 ping). The first version routed everything through the host and needed twice the delay.
- **Next for lag: rollback (M11.5).** Play your own presses instantly, predict the others, and quietly replay a few frames when the real presses arrive; Versus should feel close to local.
- **Same rules everywhere:** the host's seed and feel settings are used for the match; the game version must match to join; a fingerprint of the game state is compared every 2 seconds and the match stops if anyone drifts.
- **Leaving:** if a guest leaves, the match goes on (their fighter stands still); if the host leaves, everyone returns to the online screen. The pause menu doesn't stop an online match; only the host can restart it or end it for everyone. After a match the host chooses Play again / Continue / Back to the room.
- **Not yet:** a TURN relay for strict networks (some school, office or cellular networks block direct connections; add one to `NETCFG.ice` if a house can't connect); rollback for snappier Versus; more than one player per device online; public matchmaking with strangers (needs our own server and kid-safety decisions; see VISION.md).

**Done when:** Two devices in different houses finish Level 1 together over the internet, and a Versus match is playable.

**Status: built** (November 17, 2026). First real test: no device could join ("No room with that code"); fixed the same evening by sending room codes through several services at once (PeerJS plus public MQTT message boards), adding a free relay server and clearer messages. Waiting for the next real test. Tested here with two to three browsers on one machine through a local copy of the signaling server: joining, wrong codes, full rooms, co-op, Arcade, Versus, restarts, leaving and a deliberately broken game being caught. Still needs the real test between two houses (and an iPad with a PC). Self-test fingerprints unchanged.

### M11.5 · Rollback for online play (proposed)

- Proposed November 17 after the first real online test: Versus at 58 ping felt laggy. The direct-connection patch halved the delay; rollback removes most of the rest.
- How: your own presses take effect at once (with a small built-in delay of 1–2 frames). Other players are predicted to keep pressing what they last pressed; when their real presses arrive and differ, the game rewinds to that frame and replays up to now within the same screen refresh.
- Needs: saving and restoring the whole fight state every frame (fighters, enemies, ragdolls, the random seed, mode state), replays that don't repeat sounds and effects, and a limit on how far back it rewinds (about 8 frames).
- Ordering: before or after M12 is Ron and Rhett's call.

**Done when:** Versus between two houses at about 60 ping feels close to local, with no desyncs over a 10-minute match.

### M12 · XP, levels, skill tree

**Goal:** A reason to keep fighting. (Moved after the store and character creation on November 16 at Rhett's request; ninja stars already exist by then, so respecs can cost stars from day one.)

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

- Boss arena (working name: The Pink General), built on the M7 boss framework: three phases, clear telegraphs, summons from the army, and a health bar.
- Finishing blow in slow motion with a special death pose.
- Victory screen and a New Game+ hook.

**Done when:** The boss is beatable with any build, alone or in co-op, and hard to beat without learning the combat.

### M15 · Platforms and vertical layers (optional)

A short prototype first: jump-through platforms, real stairs, and vertical camera movement. The test is whether it keeps combat readable. If yes, we add it to Levels 3–5 and to the chunk format. If no, we keep the stair look as scenery. M4’s groundY function means either choice is cheap, once the remaining direct ground checks are routed through it.

### M16 · Polish, audio, balance, v1.0 release

- Music and ambient sound per level, full sound pass.
- Difficulty settings, balance pass on XP, stars, and enemy health.
- Accessibility: control remapping, color-blind-safe hit flashes, reduced screen shake option.
- Performance pass on phones and iPads, final tutorial and move list screen.

### M17 · Level creator

- A mode for Rhett that edits a grid and saves a chunk or a whole level in the same data format the game uses.
- His levels can be played directly and can be added to the procedural pools.
- Levels are checked when loaded (sizes, known IDs only) and are never run as code (rule R3).

**Done when:** Rhett builds a level on the iPad, plays it, and sees his chunks appear in generated runs.

### M18 · House builder and visiting

- A "House" section of the store opens your fighter on an open 2D grid. Drag across squares to build walls, charged in stars per square; buy backgrounds, furniture and decorations.
- A house is data (background, grid, tiles, items), saved with the profile.
- Invite friends into your house while you're in it: a host-based network session using M11, where guests can look around and only the host edits.

**Done when:** You can build and decorate a house with stars, and a sibling can visit it from their iPad.

### Someday · Cloud saves and Steam

Kept possible, not planned: cloud saves; a desktop app on Steam with Steam Workshop for editor levels and server-owned stars and inventory (why rules R7 and R8 exist). Anything public-facing with kids' accounts raises privacy and moderation questions, so it stays family-only unless Ron decides otherwise.

### Renumbering (November 16, 2026; updated November 17: network play moved up to M11, so M11–M16 each moved down one)

| Milestone | Old number | New number |
|---|---|---|
| Level framework, Level 1 | M8 | M8 |
| Multiplayer (local) | M12 Stages A–B | M9 |
| XP and skill tree | M9 | M12 (after the store and network play, at Rhett's request) |
| Ninja stars, shop | M10 | M10 (merged, cosmetics only) |
| Character creation | M11 | M10 (merged) |
| Levels 2–5 | M13 | M13 (plus procedural runs) |
| Boss level | M14 | M14 |
| Platforms (optional) | M15 | M15 |
| Polish and release | M16 | M16 |
| Level creator | new | M17 |
| Online multiplayer | M12 Stage C | M11 (home Wi-Fi, WebRTC; moved up from M17 on November 17) |
| House builder | new | M18 |

## Combat Chart

### Notation

- **N** is neutral (no direction) or **F** holding toward the way you face. They behave the same, as you described.
- **U** and **D** are Up and Down held at the moment the attack is pressed. **P** is Punch, **K** is Kick, **J** is Jump, **S** is Surge held.
- A comma means the next press within the chain window (about 30 frames after the previous move). A new press can cancel in about halfway through a move.
- Changing direction mid-string starts that direction’s first move.
- **Effects:** Stagger (short flinch), Pop (small lift), Launch (airborne, juggle), Knockdown, Trip, Splat (bounces off a wall for extra damage), Bounce (ground bounce), Pushback.
- **Unlock:** Start means available at the beginning. Other values are tree branches (FST fists, LEG legs) and tiers.

### A. Ground: Neutral and Forward

| Input | Move | Animation output | Effect | Unlock |
|---|---|---|---|---|
| N+P | Jab | Lead arm snaps out, small step in, slight lean | Stagger | Start |
| N+P, P | Cross | Rear arm punch with hip twist, lunge forward | Stagger | Start |
| N+P, P, P | Haymaker | Arm winds back, crouch, big swing, body rotates, ends off-balance | Knockdown, Splat | FST-1 |
| N+K | Front Kick | Knee lifts, leg thrusts forward, lean back | Pushback | Start |
| N+K, K | High Kick | Opposite leg, higher arc | Stagger, Pop | Start |
| N+K, K, K | Flip Kick | Backflip with leg arc | Launch | Start |
| N+P, K | Knee Strike | Hop in, rising knee, hands pull down | Pop | FST-2 |
| N+P, P, K | Spin Back-Kick | 180° spin, rear leg thrust | Knockdown | LEG-2 |
| N+K, P | Palm Thrust | Step through the kick into an open-palm push | Pushback, Splat | LEG-1 |
| N+K, K, P | Elbow Smash | Close step, elbow drives forward and down | Knockdown | FST-2 |

### B. Ground: Up held

| Input | Move | Animation output | Effect | Unlock |
|---|---|---|---|---|
| U+P | Sky Jab | Lead arm at 45° upward, body stretches, heel lifts | Pop, hits airborne enemies | Start |
| U+P, P | High Cross | Opposite arm, same angle, shoulder rotates | Pop | Start |
| U+P, P, P | Rising Uppercut | Crouch, leap, full uppercut | Launch | Start |
| U+K | Sky Kick | Diagonal high kick with a small hop | Pop, anti-air | Start |
| U+K, K | Twin Sky Kick | Alternate leg, second hop | Pop | LEG-1 |
| U+K, K, K | Somersault Kick | Backflip, leg sweeps upward, brief invulnerability | Launch (higher) | LEG-2 |

### C. Ground: Down held

| Input | Move | Animation output | Effect | Unlock |
|---|---|---|---|---|
| D+P | Gut Punch | Crouch, low punch to the midsection | Stagger (low hit) | Start |
| D+P, P | Double Low Hook | Alternate arm, hook rises from crouch | Stagger | FST-1 |
| D+P, P, P | Ground Pound | Drop to one knee, overhand smash into floor, shock ring | Bounce, small area hit | FST-3 |
| D+K | Leg Sweep | Crouch, spin with leg extended low | Trip | Start |
| D+K, K | Reverse Sweep | Spin the other way | Trip again | LEG-1 |
| D+K, K, K | Axe Kick | Stand, leg rises overhead, heel drops | Bounce | LEG-3 |

### D. Air

| Input | Move | Animation output | Effect | Unlock |
|---|---|---|---|---|
| J, then P | Air Jab | Tuck, quick lead jab | Stagger | Start |
| J, then P, P | Air Cross | Opposite arm | Stagger | Start |
| J, then P, P, P | Air Flurry | Three rapid jabs, fall slows slightly | Stagger | FST-2 |
| J, then K | Flying Kick | Leg fully extended, body horizontal | Pushback | Start |
| J, then K, K | Scissor Kick | Both legs snap in sequence | Stagger | LEG-1 |
| J, then D+K | Dive Kick | Diagonal dive, shock ring on landing | Knockdown | Start |
| J, then D+P | Spike Fist | Both fists overhead, slam downward | Bounce | FST-2 |
| J, then U+K | Rising Scissor | Upward diagonal kick, good for juggles | Pop | LEG-2 |

### E. Surge (hold S; costs yellow stamina)

| Input | Move | Animation output | Effect | Cost |
|---|---|---|---|---|
| S+Left/Right | Surge Run | Lean 35°, long strides, yellow afterimages | Phase through enemies | drains ~20/s |
| S+J | Surge Jump | Deep crouch, burst upward, tuck or flip | Higher and longer jump | 15 |
| S+J (in air) | Surge Hop | Horizontal air burst | Phase through enemies | 15 |
| Surge run + D | Surge Slide | Low slide under and through enemies | Phase | 10 |
| S+P | Flash Strike | Dash through the target, strike on exit, land behind facing back | Stagger, repositions you | 15 |
| S+P, P | Barrage | Five or six rapid alternating jabs with ghosted arms | Multi-hit, Pushback | 20 |
| S+P, P, P | Shockwave Palm | Brief charge stance, double-palm thrust, ring | Launch, Splat | 30 |
| S+K | Rush Kick | Lunging kick with a streak | Pushback | 15 |
| S+K, K | Whirlwind | Two full spinning rotations | Pop, hits both sides | 25 |
| S+K, K, K | Meteor Kick | Leap, diagonal slam, large shock ring | Knockdown, area hit | 35 |
| S+U+P | Phoenix Fist | Rising dash uppercut, yellow streak | Launch with guaranteed follow-up | 30 |
| S+U+K | Sky Cutter | Rising flip kick | Launch | 30 |
| S+D+P | Quake Fist | Slam fist into ground, ring both sides | Bounce, area hit | 30 |
| S+D+K | Phase Sweep | Slide through enemies while sweeping | Trips everyone in path | 20 |
| S+J, then P | Air Rave | Four hovering aerial hits | Spike | 25 |
| S+J, then K | Comet Kick | Surge dive, longer reach | Splat, Knockdown | 25 |
| S+Down (standing still) | Block | Kneel with arms up; trembles harder as Surge drains | Hits from the front cost Surge (2× the hit's damage) instead of health, no stun; holding drains 8/s; when Surge runs out you're Winded and hits land | 8/s + per hit |

**Stamina starting values:** max 100, regen 25 per second after a 0.6 second delay, empty bar means a 1.5 second Winded state. All tunable.

### F. Hit effect to ragdoll mapping (used in M4 and M5)

| Effect | Ragdoll response |
|---|---|
| Stagger | None, flinch pose only |
| Pop | Brief limp pose while rising |
| Launch | Full ragdoll tumble, steered by hit direction |
| Knockdown | Ragdoll slide, settles on the ground, then get-up |
| Splat | Pinned to the wall for a moment, then slides down |
| Bounce | Hits the floor, rebounds once, then settles |

### G. Grab and throw (Punch + Kick together, added in M4)

| Input | Move | Animation output | Effect |
|---|---|---|---|
| P+K within 3 frames | Grab | Both arms reach and clamp; the enemy is lifted off its feet | Holds them. Brutes only after their poise breaks (otherwise "TOO HEAVY") |
| then P | Knee | Short knee into the held enemy, up to 3 times | Light hits |
| then K, or toward + K | Forward Throw | Wind back, heave forward | Enemy becomes a projectile: Splat, bowls others over |
| then away + K | Back Throw | Turn and toss behind | Same as forward, behind you |
| then ↑ + K | Up Throw | Crouch, lift overhead | Launch |
| then ↓ + K | Slam | Lift overhead, drop to one knee, slam | Bounce, shock ring |
| hold too long (1.7 s) | Escape | The enemy breaks free | None |

## Open decisions

1. **Name of the stamina button.** Decided: **Surge**, with a yellow bar.
2. **Phasing rules.** Decided: phasing skips enemy bodies only, so you can still be hit while running through. A skill in M12 could add dodging attacks.
3. **Ultimate.** Decided for now: the Tornado Kick keeps its own blue meter, separate from Surge. Renaming it Typhoon is still open.
4. **Back moves.** Add Back+P Backfist and Back+K Back Kick, which hit behind you? Not in the chart yet.
5. **Grab and throw.** Decided: yes, built in M4. Punch + Kick together grabs, and a throw sends the enemy into others.
6. **Unlock approach.** For now every move is unlocked, and each carries its tier (FST-1, LEG-2 and so on) so M12 can lock them. Decide before M12: start with base strings and unlock the rest, or start with everything and unlock upgrades?
7. **Level style.** I assumed side-scrolling levels with “GO →” prompts, rather than single-screen arenas. Decide before M8.
8. **Defense for versus.** Decided (combat patch, November 16): hold **Down + Surge** while standing still to block. Hits from the front cost Surge instead of health with no stun or dizziness; the kneeling pose trembles more as Surge drains; when Surge runs out you're Winded and hits land. Hits from behind always land.

## Suggested next step

First, test M11 for real: host on one device and join from another house (and try an iPad with a PC). Then **M12**: XP, levels and the skill tree, with the starting style added to character creation. Decide the unlock approach first (Open decisions, item 6). Online play means skills and stats must be shared at the start of a match, like looks are.
