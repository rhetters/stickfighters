# Combat chart

The design of every move: input, animation, effect and unlock tier. It's the reference for designing moves and the skill tree. The numbers the game actually uses (damage, frames, knockback) live in `js/data/moves.js`, and the in-game Moves panel is built from that data, so when a move changes, change the code and then update its row here.


## Notation

- **N** is neutral (no direction) or **F** holding toward the way you face. They behave the same, as you described.
- **U** and **D** are Up and Down held at the moment the attack is pressed. **P** is Punch, **K** is Kick, **J** is Jump, **S** is Surge held.
- A comma means the next press within the chain window (about 30 frames after the previous move). A new press can cancel in about halfway through a move.
- Changing direction mid-string starts that direction’s first move.
- **Effects:** Stagger (short flinch), Pop (small lift), Launch (airborne, juggle), Knockdown, Trip, Splat (bounces off a wall for extra damage), Bounce (ground bounce), Pushback.
- **Unlock:** Start means available at the beginning. Other values are tree branches (FST fists, LEG legs) and tiers.

## A. Ground: Neutral and Forward

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

## B. Ground: Up held

| Input | Move | Animation output | Effect | Unlock |
|---|---|---|---|---|
| U+P | Sky Jab | Lead arm at 45° upward, body stretches, heel lifts | Pop, hits airborne enemies | Start |
| U+P, P | High Cross | Opposite arm, same angle, shoulder rotates | Pop | Start |
| U+P, P, P | Rising Uppercut | Crouch, leap, full uppercut | Launch | Start |
| U+K | Sky Kick | Diagonal high kick with a small hop | Pop, anti-air | Start |
| U+K, K | Twin Sky Kick | Alternate leg, second hop | Pop | LEG-1 |
| U+K, K, K | Somersault Kick | Backflip, leg sweeps upward, brief invulnerability | Launch (higher) | LEG-2 |

## C. Ground: Down held

| Input | Move | Animation output | Effect | Unlock |
|---|---|---|---|---|
| D+P | Gut Punch | Crouch, low punch to the midsection | Stagger (low hit) | Start |
| D+P, P | Double Low Hook | Alternate arm, hook rises from crouch | Stagger | FST-1 |
| D+P, P, P | Ground Pound | Drop to one knee, overhand smash into floor, shock ring | Bounce, small area hit | FST-3 |
| D+K | Leg Sweep | Crouch, spin with leg extended low | Trip | Start |
| D+K, K | Reverse Sweep | Spin the other way | Trip again | LEG-1 |
| D+K, K, K | Axe Kick | Stand, leg rises overhead, heel drops | Bounce | LEG-3 |

## D. Air

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

