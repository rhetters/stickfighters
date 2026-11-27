# Combat chart

The design of every move: input, animation, effect and unlock tier. It's the reference for designing moves and the skill tree. The numbers the game actually uses (damage, frames, knockback) live in `js/data/moves.js`, and the in-game Moves panel is built from that data, so when a move changes, change the code and then update its row here.


## Notation

- **N** is neutral (no direction) or **F** holding toward the way you face. They behave the same, as you described.
- **U** and **D** are Up and Down held at the moment the attack is pressed. **P** is Punch, **K** is Kick, **J** is Jump, **S** is Surge held.
- A comma means the next press within the chain window (about 30 frames after the previous move). A new press can cancel in about halfway through a move.
- Changing direction mid-string starts that direction’s first move. Holding the other way (left/right) ends a string: once a move's hits are over its recovery is cut short and you turn, and the next press starts a fresh string facing that way. A string also ends at a move the skill tree hasn't unlocked yet.
- **Effects:** Stagger (short flinch), Pop (small lift), Launch (airborne, juggle), Knockdown, Trip, Splat (bounces off a wall for extra damage), Bounce (ground bounce), Pushback.
- **Unlock:** Start means every fighter has it. Otherwise it's the skill-tree node that unlocks it (branch: node; nodes above row 1 need points lower in that branch first). The tree itself is in `js/data/skills.js` and the M12 plan in ROADMAP.md.

## A. Ground: Neutral and Forward

| Input | Move | Animation output | Effect | Unlock |
|---|---|---|---|---|
| N+P | Jab | Lead arm snaps out, small step in, slight lean | Stagger | Start |
| N+P, P | Cross | Rear arm punch with hip twist, lunge forward | Stagger | Start |
| N+P, P, P | Haymaker | Arm winds back, crouch, big swing, body rotates, ends off-balance | Knockdown, Splat | Fists: Haymaker |
| N+K | Front Kick | Knee lifts, leg thrusts forward, lean back | Pushback | Start |
| N+K, K | High Kick | Opposite leg, higher arc | Stagger, Pop | Start |
| N+K, K, K | Flip Kick | Backflip with leg arc | Launch | Start |
| N+P, K | Knee Strike | Hop in, rising knee, hands pull down | Pop | Fists: Knee and Elbow (row 2) |
| N+P, P, K | Spin Back-Kick | 180° spin, rear leg thrust | Knockdown | Legs: Spin Back-Kick (row 2) |
| N+K, P | Palm Thrust | Step through the kick into an open-palm push | Pushback, Splat | Legs: Palm Thrust |
| N+K, K, P | Elbow Smash | Close step, elbow drives forward and down | Knockdown | Fists: Knee and Elbow (row 2) |

## B. Ground: Up held

| Input | Move | Animation output | Effect | Unlock |
|---|---|---|---|---|
| U+P | Sky Jab | Lead arm at 45° upward, body stretches, heel lifts | Pop, hits airborne enemies | Start |
| U+P, P | High Cross | Opposite arm, same angle, shoulder rotates | Pop | Start |
| U+P, P, P | Rising Uppercut | Crouch, leap, full uppercut | Launch | Start |
| U+K | Sky Kick | Diagonal high kick with a small hop | Pop, anti-air | Start |
| U+K, K | Twin Sky Kick | Alternate leg, second hop | Pop | Legs: Twin Kicks |
| U+K, K, K | Somersault Kick | Backflip, leg sweeps upward, brief invulnerability | Launch (higher) | Legs: Flips (row 2) |

## C. Ground: Down held

| Input | Move | Animation output | Effect | Unlock |
|---|---|---|---|---|
| D+P | Gut Punch | Crouch, low punch to the midsection | Stagger (low hit) | Start |
| D+P, P | Double Low Hook | Alternate arm, hook rises from crouch | Stagger | Fists: Low Hooks |
| D+P, P, P | Ground Pound | Drop to one knee, overhand smash into floor, shock ring | Bounce, small area hit | Fists: Ground Pound (row 3) |
| D+K | Leg Sweep | Crouch, spin with leg extended low | Trip | Start |
| D+K, K | Reverse Sweep | Spin the other way | Trip again | Legs: Twin Kicks |
| D+K, K, K | Axe Kick | Stand, leg rises overhead, heel drops | Bounce | Legs: Axe Kick (row 3) |

## D. Air

| Input | Move | Animation output | Effect | Unlock |
|---|---|---|---|---|
| J, then P | Air Jab | Tuck, quick lead jab | Stagger | Start |
| J, then P, P | Air Cross | Opposite arm | Stagger | Start |
| J, then P, P, P | Air Flurry | Three rapid jabs, fall slows slightly | Stagger | Fists: Air Fists (row 2) |
| J, then K | Flying Kick | Leg fully extended, body horizontal | Pushback | Start |
| J, then K, K | Scissor Kick (Bicycle Kick) | Both legs snap in sequence; you hang in the air and drive forward while it hits | Stagger | Legs: Scissor Kick |
| J, then D+K | Dive Kick | Diagonal dive, shock ring on landing. A hit bounces you up to dive again, but only three in a row: the third ends in a backflip away, and no more Dive Kicks until you land (J, then D+K turns into a Flying Kick) | Knockdown | Start |
| J, then D+P | Spike Fist | Both fists overhead, slam downward | Bounce | Fists: Air Fists (row 2) |
| J, then U+K | Rising Scissor | Upward diagonal kick, good for juggles | Pop | Legs: Flips (row 2) |

## E. Surge (hold S; costs yellow stamina)

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

**Surge move unlocks:** Flash Strike and Rush Kick are Start. Surge: Low Surge opens Quake Fist and Phase Sweep, Surge Strings opens Barrage and Whirlwind, Rising Surge (row 2) opens Phoenix Fist and Sky Cutter, Air Surge (row 2) opens Air Rave and Comet Kick, Big Finishers (row 3) opens Shockwave Palm and Meteor Kick. A locked Surge move falls back to Flash Strike or Rush Kick (or the plain move in the air). Up Throw and Slam need Body: More Throws; without it they're a Forward Throw.

**Stamina starting values:** max 100, regen 25 per second after a 0.6 second delay, empty bar means a 1.5 second Winded state. All tunable.

## F. Hit effect to ragdoll mapping(used in M4 and M5)

| Effect | Ragdoll response |
|---|---|
| Stagger | None, flinch pose only |
| Pop | Brief limp pose while rising |
| Launch | Full ragdoll tumble, steered by hit direction |
| Knockdown | Ragdoll slide, settles on the ground, then get-up |
| Splat | Pinned to the wall for a moment, then slides down |
| Bounce | Hits the floor, rebounds once, then settles |

## F2. Enemy hits on players

An enemy move's effect (its row in the chart, `INFO` in data/moves.js) also sets how a **player** reacts, tuned for
players: Stagger (stunned, pushed back), Pushback (pushed back farther), Pop (popped up a little), Trip (feet swept,
down), Knockdown (down, then get up), Launch, Splat or Bounce (sent flying, then down). Knocked down or sent flying, a
player is safe until back up.

**Combo strings:** an enemy move with `chain` is part of a string. Between its hits the player is only safe for a
moment, so the next hit can land; a string stops after 2 / 3 / 4 hits (Easy / Normal / Hard) or 20 / 30 / 40% of the
player's health, or when a hit knocks them down. Any other hit gives the usual safe time. No enemy has a string yet:
they're for the theme enemies to come. The rules for making enemies are at the top of data/enemies.js.

**Thrown things:** an enemy move with `drop` (and `dropAt`, the frame it lets go) throws something that lands a
moment later where the enemy was aiming, with a shadow first, through the falling rocks (`LV.rk`): Pink Kong's Air
Conditioner Throw. His Chest Pound pushes back anyone close in front.

**Cars** (the City's Downtown): a car hitting an enemy at speed launches it; holding Surge drives faster and hits
half again as hard. Punch bumps the hood into whoever is in front, Kick the trunk into whoever is behind; Jump hops,
once more in the air; ULT (full meter) is each model's own move (CAR_ULTS in cars.js). Enemies hurt players in cars;
a knockout throws them out.

**Area hits** (quakes, slams) only reach fighters standing on the same level as the attacker.

## G. Grab and throw (Punch + Kick together)

| Input | Move | Animation output | Effect |
|---|---|---|---|
| P+K within 3 frames | Grab | Both arms reach and clamp; the enemy is lifted off its feet | Holds them. Brutes only after their poise breaks (otherwise "TOO HEAVY") |
| then P | Knee | Short knee into the held enemy, up to 3 times | Light hits |
| then K, or toward + K | Forward Throw | Wind back, heave forward | Enemy becomes a projectile: Splat, bowls others over |
| then away + K | Back Throw | Turn and toss behind | Same as forward, behind you |
| then ↑ + K | Up Throw | Crouch, lift overhead | Launch |
| then ↓ + K | Slam | Lift overhead, drop to one knee, slam | Bounce, shock ring |
| hold too long (1.7 s) | Escape | The enemy breaks free | None |

## H. Ultimates (ULT, when the blue meter is full)

Each step is bought with a skill point in that branch's ULTIMATE row (level 5, 15, 30, in order), and a fighter has one branch's ultimate at a time. Every ultimate starts with rings in the branch's colour (more and bigger at each step; the level-30 step adds a ground ring and a zoom), the fighter can't be hurt while it plays, and its hits don't freeze the game.

| Branch | Level 5 | Level 15 | Level 30 |
|---|---|---|---|
| Fists | Flurry: fast alternating punches, the last one launches | Hundred Fists: longer, walking forward, the last one launches | Comet Fist: leap, crash down fist-first, big shockwave |
| Legs | Spin Kick: one low spin, hits both sides | Twisting Kick: rising spin moving forward, last spin launches | Tornado Kick: high spinning kick across the screen |
| Surge | Surge Dash: phase dash through everyone, lightning | Lightning Rush: three dashes back and forth | Thunder Step: five dashes, then a thunderclap that launches everyone near |
| Body | Shoulder Charge: armored charge that bowls through | Quake Stomp: jump and stomp, area knockdown | Earthshaker: three stomps, each shockwave bigger, the last launches |
