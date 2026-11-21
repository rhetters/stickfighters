# StickFighters

A stick-figure beat-'em-up: you're the orange fighter holding off waves of the pink army. Plain HTML, CSS and JavaScript with no build step, so GitHub Pages serves it as-is.

**Play:** https://rhetters.github.io/stickfighters/

This page is the player's guide. What's built and what's next is in [docs/ROADMAP.md](docs/ROADMAP.md).

## Modes

The title says **PRESS START**: press any key, button or tap.

- **Solo → Campaign: Castle Siege** is a new run every time, built from a random seed (set your own in Settings to replay one): the Wooded Trail, the Sewer Tunnels (a slippery floor) and the Castle Keep, about three minutes each, with a Captain at the end of the first two. Between them you're carried on at random: launched by a catapult, sliding down a pipe, swinging on a rope over a chasm, or smashing the castle gate. Once in a while a mini-boss leaps in and knocks everyone flat. At the end, the Pink General is drawn in by a pencil and comes to life. Each fight you win is a checkpoint, so a KO lets you continue from there.
- **Solo → Arcade** is the original game: waves on one screen, with a Captain every fifth wave.
- **Multiplayer → Local** opens the Players screen. Up to 4 players: controllers join by pressing any button (B leaves), or join with touch, the keyboard, or a second keyboard player (arrows + number pad; press 0 on the number pad). Then pick **Versus** (best of 3 rounds in The Clearing; free-for-all or teams, chosen with the Versus button, and tap TEAM on a card to switch sides; grab another player with punch + kick, mash to break free) or **Co-op** (Wooded Trail or Arcade; stand next to a downed teammate for 2 seconds to revive them).
- **Multiplayer → Online** plays house to house: one player hosts a room and shares its code (a word and a number); others pick the code with arrows and join. Up to 4 players, one per device, PC, iPad and phone together, in co-op, Arcade, Versus (free-for-all or teams: tap your card to pick a team) or the host's house. Every device needs the same version of the game, so reload the page on all of them after an update.
- **Customize → Character** holds four saved fighters. Change the name, height, head size, head type (**Donut**, a ring, or **Full**, filled in), line thickness and stance, and dress them from the tabs: Colors, Head (hair, hats, headbands), Neck (scarves, ties), Upper Body (shirts, jackets, gloves), Lower Body (pants, shorts, skirts, dresses, shoes), Surge (the color of your Surge) and Poses (up to 8 on your pose wheel; the first is your victory pose). Each shelf is also the store: tap an item to try it on, tap again to buy it with ninja stars. Delete a fighter from the Body tab. Defeated enemies drop the stars, and Captains drop gifts. Everything is looks only and never changes how you fight. In multiplayer, each player picks a fighter on the Players screen and can change their color and hat.
- **Customize → House** builds your house, as big as you like (even a little city): walls square by square, **barriers** (floors, side walls, stairs, spiral stairs and ladders, drawn as black lines), furniture and decorations piece by piece (each costs a few ninja stars), and a background. A wall painted on stairs fills just the steps. The D-pad moves around your land, which grows as you build, and **−** / **+** zoom out and in. Erase gives back every star, front first. **WALK AROUND** lets your fighter explore it: jump onto floors; walking keeps you on your level, holding **Up** while walking takes stairs going up that way and **Down** takes stairs going down; on ladders and spiral stairs **Up** climbs and **Down** goes down; press **Down + Jump** to drop through a floor; side walls stop you; **Esc** (or Start / II) goes straight back to the builder. With several players the camera zooms out to keep everyone on screen. Online, the host can pick **HOST'S HOUSE** so everyone visits.
- **Skills** (Customize → Character → SKILLS): each saved fighter earns XP for every enemy beaten (everyone in the fight gets it) and for clearing levels and Arcade waves, and levels up to 30. Each level gives a skill point (bonus points at 5, 10, 15, 20, 25 and 30) to spend in five branches: Fists, Legs, Surge, Body and Fortune. New fighters start with the basic moves; points unlock the rest and add small boosts. Tap a skill to see what it does and tap it again (or + ADD) to spend a point; TAKE BACK and RESET give points back for free. Each fighting branch ends in an **ULTIMATE** row: buy its first step at level 5, the next at 15 and the last at 30 (Legs ends with the Tornado Kick). You can have one branch's ultimate at a time; take those points back to switch. Leveling up mid-fight shows a golden pillar of light. In Versus your moves and ultimate count, but boosts don't, so a high level can't overpower a low one. A TEST row at the bottom (temporary, for testing) sets the level.
- **Back up your save** in Settings → Save: copy a code or save a file, and restore it on any device.
- **Training Room** has dummies, hitboxes, frame data and the Feel / Moves / Info panels.

## Controls

| Action | Keyboard | Touch | Gamepad |
| --- | --- | --- | --- |
| Move | A / D or ← / → | Stick left/right | Left stick / d-pad |
| Aim up / down (picks the move) | W / S or ↑ / ↓ | Stick up/down | Left stick / d-pad |
| Jump (twice for a flip; Down + Jump drops through a floor) | Space | JUMP | A |
| Punch / Kick | J / K | PUNCH / KICK | X / B |
| Surge (hold, or tap on/off: Settings → Surge button): run through enemies, super jump, Surge moves | Shift | SURGE | Bumpers / triggers |
| Block (hits from the front cost Surge instead of health; drops when Surge runs out) | Shift + S, standing still | SURGE + stick down | Bumper + d-pad down |
| Grab | J + K together | PUNCH + KICK | X + B |
| Ultimate (blue meter full; pick it on the Skills screen) | U | ULT | Y |
| Pose wheel (hold, aim, let go) | T | POSE (hold, aim with the stick) | Select / View / − |
| Pause | Esc or P | II | Start |

**Changing buttons:** Settings → **Buttons** lets you change the keyboard keys and controller buttons for every action. Tap + then press the key or button; tap a key to remove it. Controller mappings are saved per kind of controller (Switch, Xbox, PlayStation) on that device, so any controller of that kind uses them.

**Menus with a controller:** the d-pad or left stick moves the yellow highlight, A confirms, B goes back (on Switch controllers: A right, B bottom), and Start pauses and resumes. On a keyboard, Esc goes back out of menus like Settings.

**Touch layout:** Settings → Touch layout → **Customize** lets you drag every button and the stick where you want them, resize them, and save named layouts (Default and Left-handed are built in).

The **Training Room** (title screen) has spawnable dummies, hitbox and frame-data overlays, and three colored buttons at the top: **Feel** (**F**, live feel tuning), **Moves** (**M**, every combo) and **Info** (**I**, health, speed, damage, height and how to beat each enemy). Feel tuning (also in Settings, so it can be changed mid-match from the pause menu) covers hit-stop, screen shake, knockback, gravity, bounce and how long bodies stay.

## Enemies

| Enemy | What it does | How to beat it |
|---|---|---|
| Grunt | Basic puncher | Anything |
| Runner | Fast lunge from range | Interrupt it with quick hits |
| Brute | Heavy, has poise (blue bar) | Heavy hits to break poise, then launch or grab |
| Guard | Shield blocks hits from the front | Hit it from behind, sweep low, grab it, an ultimate, or smash the shield (GUARD BREAK) |
| Flanker | Sneaks or leaps behind you | Hits that cover both sides: Spin Back-Kick, sweeps, Whirlwind |
| Captain (boss, waves 5/10/15) | Slam, charge; enraged at 55% adds a quake leap and backup | Break its poise; jump the quake |
| Mini-bosses (rare): Big Bruiser, Sludge Brute, Captain of the Guard | A giant from the biome that leaps in and knocks everyone down | Like the Captain: break its poise, jump the quake |
| The Pink General (end of Castle Siege) | Three phases: angrier at 2/3 and 1/3 health, calling his army each time | Break his poise, save Surge for his rage |

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
