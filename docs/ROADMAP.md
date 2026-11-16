# Orange vs. the Pink Army: Development Roadmap

*Milestones M0–M16 and the Combat Chart · Draft 3: M0–M7 complete, plus the M7.5 restructure · November 16, 2026*

> This file is the roadmap of record. It started as the Claude Docs roadmap and was copied into the repo during the M7.5 restructure; update it at the end of every milestone. The long-term vision and the architecture rules are in [VISION.md](VISION.md).

## How to use this document

Each milestone has an ID. Say “Start M3” or “change the scope of M3” and I’ll build against that milestone’s Definition of Done. Every milestone ends with a playable published build and a short test checklist. The Combat Chart at the end is the source of truth for moves: we edit the chart first, and the code reads it as a move table.

**Why this order.** Input comes first because every combo depends on knowing which direction is held. Then the combat engine, then Surge (your stamina system), because Surge modifies moves. Collision feel and ragdoll come before levels and progression, since you called them the core of the game and there’s no point building five levels on combat that will change. Progression and the shop come once there’s a real level to earn XP in. Levels 2–6 come last, when the systems stop moving.

**Where things stand.** M0 to M7 are complete and playable, both in the preview and on GitHub Pages (rhetters.github.io/stickfighters, linked from Rhett's game site). M3 was built before M2, which caused no problems because Surge reads your aim directly. M6, the custom touch layout, was added mid-way at Rhett's request, so the milestones after it each moved down one. M8 is next.

**Why multiplayer is M12.** Milestones are numbered in build order. Multiplayer comes after M11 because co-op needs levels (M8) and enemies that can target two players (M7), and versus needs distinct fighters (M11). It comes before Levels 2–5 (M13) so those levels are designed with co-op in mind. The groundwork for a second player is folded into M4, so M12 is not a rewrite.

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
| M8 | Level framework and Level 1: Wooded Trail | Next | L | M7 | Scrolling level, themes, encounters (vertical slice) |
| M9 | XP, levels, skill tree | Planned | L | M3, M8 | Level-ups, skill points, tree screen |
| M10 | Ninja stars, items, shop | Planned | M | M9 | Drops, unlockable items, shop |
| M11 | Character creation | Planned | M | M9 | Create and save your fighter |
| M12 | Multiplayer: co-op and versus | Planned | XL | M7, M8, M11 | Two-player co-op through levels, 1v1 versus, online co-op prototype |
| M13 | Levels 2–5 | Planned | XL | M8, M10, M12 | Sewer Entrance, Castle Stairs, Main Hall, Tower Top |
| M14 | Boss level | Planned | L | M13 | Multi-phase boss fight |
| M15 | Platforms and vertical layers (decision gate) | Optional | M–L | M4, M8 | Optional: platforms and stairs |
| M16 | Polish, audio, balance, release | Planned | L | all | Release candidate |

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

**Status: complete.** All 30 moves in sections A–D work and land every hit of their strings, mixed finishers included. Also added: the hit effects in section F (basic Splat and Bounce; M4 adds the full physics), a juggle cap of 7, damage scaling in long combos (4% less per hit after the third, never below 45%), a get-up with protection, player knockdown, and motion smears on heavy moves. The training room's Move list (M key) ticks off every chart row as you land it. Every move is unlocked until M9 (see Open decisions).

### M3 · Surge (stamina) system

**Goal:** Add the yellow stamina bar and everything it powers.

- Name, bar, drain, regeneration, and a “Winded” state at zero (short lockout, slower movement).
- Surge run: faster movement that phases through enemy bodies (ghosted look, no body collision).
- Surge jump: higher, longer, with an air burst.
- Surge strings: Combat Chart section E. Holding Surge swaps each branch to its Surge version.
- Visuals: yellow afterimages, speed lines, bar flash when low.
- Every number is tunable (max, regen, costs) so the skill tree can change them in M9.

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
- Groundwork for multiplayer (M12): the player becomes one entry in a list of fighters, each with its own input, Surge bar and HUD slot, and enemies pick a target instead of assuming one player.
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

### M8 · Level framework and Level 1: Wooded Trail (vertical slice)

**Goal:** Turn waves into levels, and prove the whole loop on one polished level.

- Scrolling camera, world width, “GO →” prompts, encounter triggers, checkpoints, level-complete screen.
- Theme system: palette, three parallax layers, ground style, props, ambient particles, and smooth background changes between sections.
- Level 1: trees, drifting leaves, fireflies, a log obstacle, four to five encounters.
- **Decision gate G1:** keep levels flat, or commit to platforms (see M15).

**Done when:** Level 1 is playable start to finish on phone and desktop.

### M9 · XP, levels, skill tree

**Goal:** A reason to keep fighting.

- XP from kills (by enemy type), combo bonuses, variety bonuses (using many different moves), no-damage bonuses, and level clears.
- Level curve: XP needed per level = 100 × level^1.4, cap 30 for v1. One skill point per level, plus a bonus point every fifth level.
- Skill tree screen that works by touch, with tooltips and a button to preview a move’s animation. Respec costs ninja stars.
- Stats system: HP, damage, Surge max, regen, and costs, all editable by skills.

**Draft skill tree (five branches):**

| Branch | Tier 1 | Tier 2 | Tier 3 | Capstone |
|---|---|---|---|---|
| Fists | Hard Knuckles (+punch damage) | Low Hooks, Spike Fist | Ground Pound, Surge Barrage | Hundred Fists (Surge string) |
| Legs | Twin Sky Kick, Reverse Sweep | Somersault Kick, Scissor Kick | Axe Kick, Meteor Kick | Comet Barrage |
| Surge | Bigger bar, faster regen | Cheaper strings | Longer phase, air Surge hop | Endless Surge (brief unlimited Surge) |
| Body | More HP | Faster get-up, less stagger | Armor on heavy moves | Second Wind (one revive per level) |
| Fortune | Star magnet | Bonus XP, shop discount | Extra item slot | Lucky Streak (combo-based star bonus) |

**Done when:** Level-ups give points, spending them changes your moves and stats visibly, and everything saves.

### M10 · Ninja stars, items, shop

**Goal:** Collect, unlock, and buy.

- Ninja stars drop from defeated enemies (Grunt 1–2, Runner 2–3, Brute 8–12), with a bonus at high combo counts and a magnet pickup arc.
- Items found in levels (chests, breakable props, hidden spots) unlock into the shop. The shop is open between levels and from the pause menu.
- Item types: consumables (health, Surge refill, XP scroll), gear (headband, gloves, boots with stat changes and visuals), and charms (passive effects like stronger bowling).
- Inventory, equip slots, and a quick-use slot.
- Economy curve checked so the shop stays a choice, not a chore.

**Done when:** Stars drop and collect, items unlock in Level 1, and you can buy and equip them.

### M11 · Character creation

**Goal:** Make the fighter yours.

- Name, body color (swatches that always contrast with the pink army), head ring size, line thickness, accessories (headband, scarf, hat, wristbands), and idle stance.
- Starting style: Brawler, Kicker, or Sprinter, which sets your first skill point.
- Live preview playing idle and sample moves, randomize button, three save slots.
- Cosmetic unlocks bought with ninja stars. Accessories attach to joints and follow the ragdoll.

**Done when:** You can create, save, and load fighters, and they look right in every move and death pose.

### M12 · Multiplayer: co-op and versus

**Goal:** Two people fight through the levels together or against each other, first on one screen, then online. It's built in three stages, each ending with a playable build.

**Stage A: local co-op on one screen**

- A second player joins any time by pressing a button on a second gamepad or the second keyboard layout. Player 2 gets their own color and their own health and Surge bars.
- Controls: two gamepads is the recommended setup. The keyboard fallback is Player 1 on WASD, Space, J, K, Shift, and Player 2 on the arrows and numpad (0 jump, 1 punch, 2 kick, 3 Surge). Many keyboards drop keys when several are held at once, which is why gamepads come first. Phones and iPads have one set of touch controls each, so they play together through Stage C.
- The camera keeps both players in view, zooming out a little when they spread apart.
- Enemies choose a target and share attacks between players. Enemy count and health go up about 60% with two players.
- No friendly fire in co-op. Both players' hits add to one shared combo counter, with a bonus for juggling the same enemy.
- A knocked-out player stays down for 10 seconds and is revived when their partner stands next to them. If both are down, the level fails.
- Each player earns their own XP and ninja stars.

**Stage B: versus (1v1)**

- Best of 3 rounds in an arena using any unlocked level's theme, with a 60-second round timer. Health and Surge reset each round.
- Each player picks a saved fighter (M11) with their skills and gear, or plays Fair mode with equal stats.
- Tighter rules than co-op: a juggle cap of 4, stronger damage scaling, get-up protection, a round-start countdown and slow motion on the KO.
- Versus needs a way to defend, such as a block (see Open decisions).

**Stage C: online (prototype first, then decide)**

- Uses the published page's shared-room feature, which lets people who have the page open exchange messages live. The host's game runs the fight; the other player sends their inputs and receives the game state about 20 times a second.
- Players join with the page link and a room code. The page is private until you share it, so the second player needs access.
- Room messages can arrive late or not at all, so this is measured first. Co-op can absorb some lag; versus needs tight timing. If lag is too high, online stays co-op only.

**Done when:** Two players finish Level 1 together on one screen, a best-of-3 versus match plays start to finish on two gamepads, and the online prototype has a measured lag figure and a keep-or-drop decision.

### M13 · Levels 2–5

| Level | Theme | Look | Gameplay twist |
|---|---|---|---|
| 2 | Sewer Entrance | Stone arches, pipes, dripping water, green-gray palette | Slick floor: bodies slide farther, bowling is stronger |
| 3 | Castle Stairs | Stone steps, torches, banners | Guards with shields; stair terrain if G1 says yes |
| 4 | Main Hall | Pillars, chandeliers, long carpet | Breakable props, swarm waves, a mini-boss |
| 5 | Tower Top | Open sky, wind, moving clouds | Narrow arena, Surge-focused enemies |

Each level adds its own theme, encounter scripts, items, and one new enemy variant.

**Done when:** All four are playable in order with themed transitions.

### M14 · Boss level

- Boss arena (working name: The Pink General), three phases, clear telegraphs, summons from the army, and a health bar.
- Finishing blow in slow motion with a special death pose.
- Victory screen and a New Game+ hook.

**Done when:** The boss is beatable with any build and hard to beat without learning the combat.

### M15 · Platforms and vertical layers (optional)

A short prototype first: jump-through platforms, real stairs, and vertical camera movement. The test is whether it keeps combat readable. If yes, we add it to Levels 3–5. If no, we keep the stair look as scenery. M4’s groundY function means either choice is cheap.

### M16 · Polish, audio, balance, release

- Music and ambient sound per level, full sound pass.
- Difficulty settings, balance pass on XP, stars, and enemy health.
- Accessibility: control remapping, color-blind-safe hit flashes, reduced screen shake option.
- Performance pass on phones and iPads, final tutorial and move list screen.

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
2. **Phasing rules.** Decided: phasing skips enemy bodies only, so you can still be hit while running through. A skill in M9 could add dodging attacks.
3. **Ultimate.** Decided for now: the Tornado Kick keeps its own blue meter, separate from Surge. Renaming it Typhoon is still open.
4. **Back moves.** Add Back+P Backfist and Back+K Back Kick, which hit behind you? Not in the chart yet.
5. **Grab and throw.** Decided: yes, built in M4. Punch + Kick together grabs, and a throw sends the enemy into others.
6. **Unlock approach.** For now every move is unlocked, and each carries its tier (FST-1, LEG-2 and so on) so M9 can lock them. Decide before M9: start with base strings and unlock the rest, or start with everything and unlock upgrades?
7. **Level style.** I assumed side-scrolling levels with “GO →” prompts, rather than single-screen arenas. Decide before M8.
8. **Defense for versus.** Versus needs a way to block or avoid hits, such as holding Back to block, with a parry on a well-timed press. It would also help against bosses. Decide before M12 Stage B.

## Suggested next step

Next is **M8**, the level framework and Level 1: Wooded Trail. It turns the waves into a scrolling level with themed scenery, encounters and checkpoints, using the M7 roster.
