# Orange vs. the Pink Army

A stick-figure beat-'em-up: you're the orange fighter holding off waves of the pink army. Built as one self-contained HTML page (no build step, no dependencies), so GitHub Pages serves `index.html` as-is.

**Play:** https://rhetters.github.io/stickfighters/ (once Pages is enabled: Settings → Pages → Deploy from a branch → `main` / root)

## Controls

| Action | Keyboard | Touch | Gamepad |
| --- | --- | --- | --- |
| Move | A / D or ← / → | Stick left/right | Left stick / d-pad |
| Aim up / down (picks the move) | W / S or ↑ / ↓ | Stick up/down | Left stick / d-pad |
| Jump (twice for a flip) | Space | JUMP | A |
| Punch / Kick | J / K | PUNCH / KICK | X / B |
| Surge (hold): run through enemies, super jump, Surge moves | Shift | SURGE | Bumpers / triggers |
| Grab | J + K together | PUNCH + KICK | X + B |
| Tornado Kick (blue meter full) | U | ULT | Y |
| Pause | Esc or P | II | Start |

**Touch layout:** Settings → Touch layout → **Customize** lets you drag every button and the stick where you want them, resize them, and save named layouts (Default and Left-handed are built in).

The **Training Room** (title screen) has spawnable dummies, hitbox and frame-data overlays, a move list with every combo (**M**), and live feel tuning (**T**): hit-stop, screen shake, knockback, gravity, bounce and how long bodies stay.

## Milestones

| ID | Milestone | Status |
| --- | --- | --- |
| M0 | Foundation, training room, game shell | Done |
| M1 | Input system, mobile/iPad controls | Done |
| M2 | Combat engine, directional combos | Done |
| M3 | Surge (stamina) system | Done |
| M4 | Collision and impact feel, grab and throw | Done |
| M5 | Ragdoll, death poses, cleanup | Done |
| M6 | Custom touch layout (drag, resize, profiles) | Done |
| M7 | Enemy AI and roster v2 | Next |
| M8 | Level framework, Level 1: Wooded Trail | Planned |
| M9 | XP, levels, skill tree | Planned |
| M10 | Ninja stars, items, shop | Planned |
| M11 | Character creation | Planned |
| M12 | Multiplayer: co-op and versus | Planned |
| M13 | Levels 2–5 | Planned |
| M14 | Boss level | Planned |
| M15 | Platforms and vertical layers (optional) | Planned |
| M16 | Polish, audio, balance, release | Planned |

Each finished milestone gets its own branch (`m5`, `m6`, …) pointing at that version, so any milestone can be played, compared or restored.
