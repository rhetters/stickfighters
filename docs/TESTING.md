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
| `menu2test`, `navtest` | Title menu with a controller, directional menu navigation |
| `m10test` | Stars, store, saved fighters, save migration, pose wheel |
| `m18test` | House builder: Customize menu, prices per square and per piece, full refunds when erasing, floors and stairs, the land growing, the view moving and zooming, the camera zooming out to keep two far-apart players on screen, save version 7 (upgraded from 5 and 6), and walking around: passing through stairs from the floor, landing on them, climbing onto a floor, dropping through it; visiting online |
| `spam` | Fast touch spamming on a phone-sized screen |
| `nettest`, `nettest2`, `nettest3`, `netlag` | Online: rooms, joining, every mode, leaving, direct links and a blocked link, desync detection, 100 ms of simulated lag |

The online tests start local copies of the signaling server (`sigserver.js`) and an MQTT broker (`mqttbroker.js`) and point the game at them with `?signal=` and `?mqtt=`, so they never touch the internet. `netlag` checks the game keeps full speed under lag; on a very busy computer it can fail on speed alone, so rerun it on its own before treating that as a real failure.

To add a test: copy a similar one, keep the `ok(condition, 'what it means')` lines and the final `ALL PASS`, and add its name to the list in `run.js`.

## The single-file preview

`python3 tools/bundle.py . out.html` stitches the game into one HTML file (used for the Claude preview). The repo itself is what GitHub Pages serves.

## On an iPad (and a keyboard computer)

- Title screen shows your best score; Settings keep their values after a reload.
- Wooded Trail: the camera stops for each fight, GO → appears after each, the log blocks the way until smashed, Continue after a KO, and the level-clear screen at the arch.
- Custom touch layouts still appear, and drag, resize, save and delete work.
- Combos from each Moves panel section (A–G), Surge moves, Winded, grab and all four throws, Tornado Kick.
- Block (Surge + down, standing still): kneels and shakes harder as Surge drains; hits from behind and hits after Surge runs out land. Hitting a downed enemy flops it around and it still gets up on time.
- A Guard breaking, a Flanker leap, a Captain on wave 5 (enrages at about half health).
- Ragdolls, death poses, confetti cleanup.
- Character: try on and buy an item, the pose wheel in a fight (hold POSE, aim, let go), stars dropping and flying to you.
- House: drag walls with a finger, build a tall tower with floors and stairs, climb it in WALK AROUND, erase (stars come back), and visit a host's house online.
- Training Room: spawn 1–6, hitboxes, frame data, speeds, freeze/step, Feel / Moves / Info.
- Gamepad works; rotate-to-landscape prompt; the game pauses when you switch apps.
- Multiplayer: 2+ controllers join on the Players screen, each controls its own fighter, Versus plays to a winner, co-op revive works. Try the TV with AirPlay and with an HDMI adapter.
- Online: host on one device and join from another (ideally another house, and an iPad with a PC); play co-op and Versus; a guest leaving dissolves on both screens.
- No errors in the browser console on load, in play, and in the Training Room.
