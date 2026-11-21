# Testing

Two kinds of checks: automated browser tests that run in a minute or two on a computer, and a hands-on checklist on a real iPad (touch, AirPlay and feel can't be tested automatically).

## Automated tests (`tools/tests`)

Needs [Node.js](https://nodejs.org) and Playwright with Chromium (`npm install -g playwright && npx playwright install chromium`). These are development tools only: the game never loads them, and GitHub Pages serves them as plain files nobody visits.

```
node tools/tests/run.js            # everything
node tools/tests/run.js net m10    # only tests whose name contains "net" or "m10"
```

Each test opens `index.html` from disk in a headless browser, plays scripted inputs and checks the result. Screenshots go to `tools/tests/out/shots` (ignored by git). Run everything before merging a change to `main`.

| Test | What it checks |
|---|---|
| `names` | No two game files define the same top-level name (they share one global scope) |
| `selftest` | Determinism: `index.html?selftest` twice, both must say MATCH (the expected fingerprints are `SELFTEST_EXPECT` in `js/selftest.js`) |
| `m4test` | Hit weight, poise, grab and throws, bowling, a second player |
| `m5test` | Ragdolls, death poses, confetti cleanup |
| `m6test` | Custom touch layout editor and profiles |
| `m7test`, `m7ui` | Enemy AI, Guard, Flanker, Captain; Training Room panels |
| `m8test` | Wooded Trail: camera, encounters, gate, checkpoints, level clear |
| `cptest` | Blocking and Winded |
| `bindtest` | Settings → Buttons for keys and controllers |
| `m9lobby`, `m9vs`, `pm9test` | Players screen, Versus, co-op, teams, player grabs |
| `menu2test`, `navtest` | Title menu with a controller (and its orange poof), the title art, Settings scrolling from its top, Esc backing out of Settings, the multiplayer drawing, directional menu navigation |
| `m10test` | Stars, store, saved fighters, save migration, pose wheel |
| `m18test` | Menu highlight (nothing lit until navigated), house builder: Customize menu, prices and full refunds, barriers and layering (fills inside stairs, erase front to back, floor and side wall in one square), the full-frame editor, the land growing, moving and zooming, saving at the current version (upgraded from 5), walking around (Esc returns to the builder, passing through stairs, Up to climb, staying on your level, Up / Down taking stairs going that way (including where two staircases meet), floors and stairs sharing a square, gloves and shoes following line width, ladders and spiral stairs, landing, dropping through, poses on an upper floor, side walls stop you), the camera keeping far-apart players on screen, head types (save version 11, full heads filled); online: visiting the host's house, Versus teams, the room fitting without a scroll bar |
| `m12test` | Room code words in A-Z order, turning around mid-string, the Character preview moving again after Skills, XP and levels, points and rows, taking points back and reset, untrusted trees, locked moves (a string starts over), boosts adding up per rank, Versus without boosts, ultimate steps bought in order at levels 5 / 15 / 30 in one branch at a time (other branches' moves stay open), ULT starting it, an ultimate's hits barely freezing the game even with hit-stop on, a bigger Surge bar, Second Wind once, XP banked at the end of a run, save versions 12 and 13, hit-stop and shake off by default, the Skills screen (tap twice, ADD, TAKE BACK, RESET, branch tabs, buying Flurry, fits without scrolling, Esc) |
| `devtest` | The temporary TEST row on the Skills screen (delete with `js/devtools.js`) |
| `m13test` | Campaign runs: the same seed makes the same run, Castle Siege's biomes and boss, all four transitions coming up (the pipe only by the sewer), mini-bosses rare, two runs played through every scene, the results, the woods counting as the Wooded Trail, the pencil intro (frozen, the boss can't be hit, then talks), a mini-boss's jump knocking everyone down, the slick sewer floor, PLAY AGAIN making a new run and replaying every scene after a clear; Pirate Cove (biomes, Captain Pinkbeard, the cannon only by the ship, a run played through); no line says ORANGE; the opening draw-in leaving no sketch behind; the Campaign screen (a card per theme, BACK, a card starting its theme); Mountain (biomes, the Pink Yeti, each theme using only its own transitions, all four Mountain transitions coming up, slopes only on the mountainside and never under a fight, two runs played through with the balloon, gondola and cliff climb, the slope being drawing only: the same play with or without it); Space (biomes, launch then landing, the Pink Alien, platforms only there; the tower climbed with ordinary jumps platform by platform, the camera rising, the top deck starting the launch, no way in under the tower; a run played through with the launch, landing and beam-down; helmets only on the moon; the tower camera keeping you in view mid-air; low gravity on the moon (longer, slightly higher jumps); the mountainside getting steeper as you climb) |
| `spam` | Fast touch spamming on a phone-sized screen |
| `nettest`, `nettest2`, `nettest3`, `netlag` | Online: the fixed feel (no hit-stop or shake, bodies 1 s), rooms, joining, every mode, leaving, direct links and a blocked link, desync detection, 100 ms of simulated lag |

The online tests start local copies of the signaling server (`sigserver.js`) and an MQTT broker (`mqttbroker.js`) and point the game at them with `?signal=` and `?mqtt=`, so they never touch the internet. `netlag` checks the game keeps full speed under lag, with messages arriving out of order (it once caught a start-of-match freeze).

To add a test: copy a similar one, keep the `ok(condition, 'what it means')` lines and the final `ALL PASS`, and add its name to the list in `run.js`.

## The single-file preview

`python3 tools/bundle.py . out.html` stitches the game into one HTML file (used for the Claude preview). The repo itself is what GitHub Pages serves.

## On an iPad (and a keyboard computer)

- Title screen shows your best score; Settings keep their values after a reload.
- Campaign (Castle Siege): the camera stops for each fight, GO → after each, each transition (catapult, pipe, rope, castle gate) looks right and nobody gets stuck, a mini-boss's leap and speech bubble, the Pink General being drawn in, Continue after a KO, and CASTLE SIEGE CLEAR at the end. Try it online too.
- Custom touch layouts still appear, and drag, resize, save and delete work.
- Combos from each Moves panel section (A–G), Surge moves, Winded, grab and all four throws, Tornado Kick.
- Block (Surge + down, standing still): kneels and shakes harder as Surge drains; hits from behind and hits after Surge runs out land. Hitting a downed enemy flops it around and it still gets up on time.
- A Guard breaking, a Flanker leap, a Captain on wave 5 (enrages at about half health).
- Ragdolls, death poses, confetti cleanup.
- Skills: use TEST to reach level 5, 15 and 30; spend and take back points; buy each branch's ultimate steps and try them in Arcade (each should look and feel rewarding, with no slowdown); level up mid-fight and watch the golden pillar; check locked moves don't come out and come out once unlocked; finish a run and see the XP line and level-up on the results screen.
- Character: switch the head between Donut and Full, try on and buy an item, the pose wheel in a fight (hold POSE, aim, let go), stars dropping and flying to you.
- House: drag walls with a finger, build a tall tower with floors and stairs, climb it in WALK AROUND, erase (stars come back), and visit a host's house online.
- Training Room: spawn 1–6, hitboxes, frame data, speeds, freeze/step, Feel / Moves / Info.
- Gamepad works; rotate-to-landscape prompt; the game pauses when you switch apps.
- Multiplayer: 2+ controllers join on the Players screen, each controls its own fighter, Versus plays to a winner, co-op revive works. Try the TV with AirPlay and with an HDMI adapter.
- Online: host on one device and join from another (ideally another house, and an iPad with a PC); play co-op and Versus; a guest leaving dissolves on both screens.
- No errors in the browser console on load, in play, and in the Training Room.
