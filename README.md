# Orange vs. the Pink Army

A stick-figure beat-'em-up: you're the orange fighter holding off waves of the pink army. Plain HTML, CSS and JavaScript with no build step, so GitHub Pages serves it as-is.

**Play:** https://rhetters.github.io/stickfighters/

This page is the player's guide. What's built and what's next is in [docs/ROADMAP.md](docs/ROADMAP.md).

## Modes

The title says **PRESS START**: press any key, button or tap.

- **Solo → Campaign: Wooded Trail** walks you through a scrolling forest with 5 ambushes, a fallen log to smash, and a Captain at the end. Each fight you win is a checkpoint, so a KO lets you continue from there.
- **Solo → Arcade** is the original game: waves on one screen, with a Captain every fifth wave.
- **Multiplayer → Local** opens the Players screen. Up to 4 players: controllers join by pressing any button (B leaves), or join with touch, the keyboard, or a second keyboard player (arrows + number pad; press 0 on the number pad). Then pick **Versus** (best of 3 rounds in The Clearing; free-for-all or teams, chosen with the Versus button, and tap TEAM on a card to switch sides; grab another player with punch + kick, mash to break free) or **Co-op** (Wooded Trail or Arcade; stand next to a downed teammate for 2 seconds to revive them).
- **Multiplayer → Online** plays house to house: one player hosts a room and shares its code (a word and a number); others pick the code with arrows and join. Up to 4 players, one per device, PC, iPad and phone together, in co-op, Arcade or Versus. Every device needs the same version of the game, so reload the page on all of them after an update.
- **Character** holds four saved fighters. Change the name, height, head size, line thickness and stance, and dress them from the tabs: Colors, Head (hair, hats, headbands), Neck (scarves, ties), Upper Body (shirts, jackets, gloves), Lower Body (pants, shorts, skirts, dresses, shoes), Surge (the color of your Surge) and Poses (up to 8 on your pose wheel; the first is your victory pose). Each shelf is also the store: tap an item to try it on, tap again to buy it with ninja stars. Delete a fighter from the Body tab. Defeated enemies drop the stars, and Captains drop gifts. Everything is looks only and never changes how you fight. In multiplayer, each player picks a fighter on the Players screen and can change their color and hat.
- **Back up your save** in Settings → Save: copy a code or save a file, and restore it on any device.
- **Training Room** has dummies, hitboxes, frame data and the Feel / Moves / Info panels.

## Controls

| Action | Keyboard | Touch | Gamepad |
| --- | --- | --- | --- |
| Move | A / D or ← / → | Stick left/right | Left stick / d-pad |
| Aim up / down (picks the move) | W / S or ↑ / ↓ | Stick up/down | Left stick / d-pad |
| Jump (twice for a flip) | Space | JUMP | A |
| Punch / Kick | J / K | PUNCH / KICK | X / B |
| Surge (hold, or tap on/off: Settings → Surge button): run through enemies, super jump, Surge moves | Shift | SURGE | Bumpers / triggers |
| Block (hits from the front cost Surge instead of health; drops when Surge runs out) | Shift + S, standing still | SURGE + stick down | Bumper + d-pad down |
| Grab | J + K together | PUNCH + KICK | X + B |
| Tornado Kick (blue meter full) | U | ULT | Y |
| Pose wheel (hold, aim, let go) | T | POSE (hold, aim with the stick) | Select / View / − |
| Pause | Esc or P | II | Start |

**Changing buttons:** Settings → **Buttons** lets you change the keyboard keys and controller buttons for every action. Tap + then press the key or button; tap a key to remove it. Controller mappings are saved per kind of controller (Switch, Xbox, PlayStation) on that device, so any controller of that kind uses them.

**Menus with a controller:** the d-pad or left stick moves the yellow highlight, A confirms, B goes back (on Switch controllers: A right, B bottom), and Start pauses and resumes.

**Touch layout:** Settings → Touch layout → **Customize** lets you drag every button and the stick where you want them, resize them, and save named layouts (Default and Left-handed are built in).

The **Training Room** (title screen) has spawnable dummies, hitbox and frame-data overlays, and three colored buttons at the top: **Feel** (**F**, live feel tuning), **Moves** (**M**, every combo) and **Info** (**I**, health, speed, damage, height and how to beat each enemy). Feel tuning (also in Settings, so it can be changed mid-match from the pause menu) covers hit-stop, screen shake, knockback, gravity, bounce and how long bodies stay.

## Enemies

| Enemy | What it does | How to beat it |
|---|---|---|
| Grunt | Basic puncher | Anything |
| Runner | Fast lunge from range | Interrupt it with quick hits |
| Brute | Heavy, has poise (blue bar) | Heavy hits to break poise, then launch or grab |
| Guard | Shield blocks hits from the front | Hit it from behind, sweep low, grab it, Tornado Kick, or smash the shield (GUARD BREAK) |
| Flanker | Sneaks or leaps behind you | Hits that cover both sides: Spin Back-Kick, sweeps, Whirlwind |
| Captain (boss, waves 5/10/15) | Slam, charge; enraged at 55% adds a quake leap and backup | Break its poise; jump the quake |

Only a few enemies attack at once; the rest circle at a distance waiting their turn. Surge-phasing through one confuses it (?!) and then it chases faster.

## For developers

Read [CLAUDE.md](CLAUDE.md) first. Each document has one job, so nothing has to be kept in sync in two places:

| File | What it's for |
|---|---|
| [docs/ROADMAP.md](docs/ROADMAP.md) | Status and plans: the only place that says what's done and what's next |
| [docs/VISION.md](docs/VISION.md) | Where the game is headed and the architecture rules (why the code is built this way) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the code works: files, load order, each system |
| [docs/COMBAT.md](docs/COMBAT.md) | The move design (combat chart) |
| [docs/TESTING.md](docs/TESTING.md) | Automated tests and the iPad checklist |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | What changed in each release |
| [docs/archive/](docs/archive/) | Frozen records (finished milestones' plans), never edited |

Each finished milestone also has a branch (`m5`, `m6`, …, `m11`) so any version can be played, compared or restored.
