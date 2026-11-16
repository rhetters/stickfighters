# Orange vs. the Pink Army

A stick-figure beat-'em-up: you're the orange fighter holding off waves of the pink army. Plain HTML, CSS and JavaScript with no build step, so GitHub Pages serves it as-is.

**Play:** https://rhetters.github.io/stickfighters/

**Status:** M0–M8 done: the Wooded Trail level and Arcade waves are both playable. Next: M9, local multiplayer (versus and co-op on the TV). Full plan in [docs/ROADMAP.md](docs/ROADMAP.md).

## Modes

- **Play: Wooded Trail** walks you through a scrolling forest with 5 ambushes, a fallen log to smash, and a Captain at the end. Each fight you win is a checkpoint, so a KO lets you continue from there.
- **Arcade: Endless Waves** is the original game: waves on one screen, with a Captain every fifth wave.
- **Training Room** has dummies, hitboxes, frame data and the Feel / Moves / Info panels.

## Controls

| Action | Keyboard | Touch | Gamepad |
| --- | --- | --- | --- |
| Move | A / D or ← / → | Stick left/right | Left stick / d-pad |
| Aim up / down (picks the move) | W / S or ↑ / ↓ | Stick up/down | Left stick / d-pad |
| Jump (twice for a flip) | Space | JUMP | A |
| Punch / Kick | J / K | PUNCH / KICK | X / B |
| Surge (hold, or tap on/off: Settings → Surge button): run through enemies, super jump, Surge moves | Shift | SURGE | Bumpers / triggers |
| Grab | J + K together | PUNCH + KICK | X + B |
| Tornado Kick (blue meter full) | U | ULT | Y |
| Pause | Esc or P | II | Start |

**Touch layout:** Settings → Touch layout → **Customize** lets you drag every button and the stick where you want them, resize them, and save named layouts (Default and Left-handed are built in).

The **Training Room** (title screen) has spawnable dummies, hitbox and frame-data overlays, and three colored buttons at the top: **Feel** (**F**, live feel tuning), **Moves** (**M**, every combo) and **Info** (**I**, health, speed, damage, height and how to beat each enemy). Feel tuning covers hit-stop, screen shake, knockback, gravity, bounce and how long bodies stay.

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

## Test checklist (iPad and a keyboard computer)

- Title screen shows your best score; Settings keep their values after a reload.
- Wooded Trail: the camera stops for each fight, GO → appears after each, the log blocks the way until smashed, Continue after a KO, and the level-clear screen at the arch.
- Custom touch layouts still appear, and drag, resize, save and delete work.
- Combos from each Move List section (A–G), Surge moves, Winded, grab and all four throws, Tornado Kick.
- A Guard breaking, a Flanker leap, a Captain on wave 5 (enrages at about half health).
- Ragdolls, death poses, confetti cleanup.
- Training Room: spawn 1–6, hitboxes, frame data, speeds, freeze/step, Feel / Moves / Info.
- Gamepad works; rotate-to-landscape prompt; the game pauses when you switch apps.
- For developers: `index.html?selftest` shows the fingerprint in docs/ARCHITECTURE.md.

## For developers

Read [CLAUDE.md](CLAUDE.md) first. [docs/VISION.md](docs/VISION.md) has where the game is headed and the architecture rules, [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) the file map, [docs/CHANGELOG.md](docs/CHANGELOG.md) the history. Each finished milestone has its own branch (`m5`, `m6`, `m7`, …) so any version can be played, compared or restored.
