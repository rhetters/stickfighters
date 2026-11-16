# Changelog

One short entry per milestone. Each finished milestone also has a branch (`m5`, `m6`, …).

## M7.5 · Restructure (no gameplay changes)
- Code split from one `index.html` into `css/style.css` and 15 scripts under `js/`, then reformatted. Cut and paste only.
- `?selftest` determinism check added. Fingerprint `39f01735`, unchanged through the split, reformat and comment fixes.
- Fixed: the Surge sparkle used the gameplay random generator inside the drawing code, so the gameplay random sequence could drift with screen refresh rate.
- Fixed old milestone numbers in code comments.
- Docs added: CLAUDE.md, VISION, ROADMAP, ARCHITECTURE, CHANGELOG.

## M7 · Enemy AI and roster v2
- AI director: attack tokens, standoff ring, ?! and chase when you phase through.
- New enemies: Guard (shield, guard meter, GUARD BREAK), Flanker (gets behind you), Captain mini-boss (waves 5/10/15, enrages at 55%, quake leap, summons).
- Boss framework: phases by health, health and poise bar, scripted attack picks.
- Training: spawn hotkeys 4–6; Feel / Moves / Info buttons at the top (F, M, I); Info panel with every fighter's stats and how to beat it.

## M6 · Custom touch layout
- Drag and resize every touch control, named profiles, Default and Left-handed built in.
- Fixed the stuck joystick when spamming touches; Surge button Hold or Toggle setting.

## M5 · Ragdoll, death poses, cleanup
- 13-point ragdolls, death poses by cause, confetti dissolve, 12-body cap, Bodies-stay slider, Tornado Kick redone with invulnerability.

## M4 · Collision and impact feel
- Mass and friction per type, hit weights, poise, bowling chains, wall splats, grab and throws, live Feel tuning.

## M3 · Surge
- Yellow stamina bar, Surge run with phasing, Surge jump/hop/slide, Surge strings.

## M2 · Combat engine and directional combos
- Every move in Combat Chart sections A–D, hit effects, juggle cap, damage scaling, move list.

## M1 · Input and mobile controls
- One input layer for keyboard, touch and gamepad; iPad and phone fit.

## M0 · Foundation
- Data-driven moves, seeded runs, title/pause/settings, Training Room.
