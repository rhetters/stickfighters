# Roadmap

What's done, what's next, and what each upcoming milestone means. **This is the only file that tracks status:** the Status column below is the record, and no other document repeats it. History (what changed when) is in [CHANGELOG.md](CHANGELOG.md); the long-term direction and the architecture rules are in [VISION.md](VISION.md); how the code works is in [ARCHITECTURE.md](ARCHITECTURE.md); the move design is in [COMBAT.md](COMBAT.md).

Each milestone has an ID. Say "Start M12" or "change the scope of M12", and Claude builds against that milestone's **Done when**. Every milestone ends with a playable published build. When one is finished, its row here becomes Done and its detailed plan moves to [archive/roadmap-history.md](archive/roadmap-history.md), which is a frozen record and is never edited.

## Milestones

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
| M8 | Level framework, modes, Level 1: Wooded Trail | Done | L | M7.5 | Scrolling level with parallax layers; the wave game becomes Arcade mode |
| M9 | Local multiplayer: co-op and versus | Done | XL | M8 | Join with controllers on the TV, Smash-style versus arena, two-to-four-player co-op |
| M10 | Ninja stars, cosmetic store, character creation | Done | L | M8, M9 | Star drops, store by slot, create and dress your fighter (each player in local multiplayer), save backup |
| M11 | Online multiplayer (internet, cross-play) | Done | XL | M9, M10 | Host / Join with a room code; PC, iPad and phone together; co-op, Arcade and Versus |
| M12 | XP, levels, skill tree | Done | L | M3, M8, M10 | Level-ups, skill points, tree screen |
| M13 | Themes and procedural runs | Done | XL | M8, M10, M12 | Castle Siege, Pirate Cove, Mountain and Space generated from a seed, a Campaign screen, transitions per theme, platforms, mini-bosses, four main bosses |
| M14 | Boss level | Done | L | M13 | A look of its own for every boss, a slow-motion finale, a victory screen and harder replays, online rooms of 6, picture menus |
| M15 | Platforms, vertical layers and boss fights | Done | L | M13, M14 | The Volcano: steam vents, falling lava rocks, a climb down into the crater on ledges the pink army follows you up and down, and the Pink Tiki's lava escape |
| M16 | Polish, audio, balance | Next | L | M8–M15 | Music for every theme and boss, a full sound pass, difficulty choices, a balance pass, a first-play tutorial, a picture-menu character screen |
| M17 | Level creator | Planned | L | M8, M13 | Rhett builds levels that join the procedural pools |
| M18 | House builder and visiting | Done | L | M10, M11 | Build a house with stars, invite friends over |
| M11.5 | Rollback for online play (suggested before Steam) | Maybe | L | M11 | Your presses act instantly online; others are predicted and corrected |
| Someday | Cloud saves, Steam | Maybe | — | M11.5 (suggested) | Desktop app, Steam Workshop, server-backed stars |

## Upcoming milestones

### M16 · Polish, audio, balance

Decided by Ron (November 23): all of the below; no "1.0" (this is just another milestone). Music and sounds are made by the game itself; recorded ones can replace them later.

- **Music:** a loop for each theme, the menus and the boss fights, plus a short victory tune. It follows the action (quieter while walking, fuller in a fight, the boss's own track) and fades between them. Separate Music and Sound volumes in Settings (a save change, with a migration).
- **A full sound pass:** footsteps, jumps and landings, voices for enemies and bosses, the hazards, menu taps, ninja stars, the ready stamp; ambient sound per biome.
- **Difficulty:** Easy, Normal and Hard for Story and Arcade, more than enemy strength (on Easy: slower, fewer attackers at once, quicker revives, more hearts); online the host picks. Harder replays (+1) stack on top.
- **Balance pass:** test bots play every theme and measure run time, damage taken, stars and XP per run. The numbers go to Ron before anything changes.
- **First-play tutorial:** a guided start in the Training Room with picture prompts (move, jump, punch, kick, a combo, Surge, a grab), offered the first time; the move list also opens from Pause.
- **A new character screen** (asked by Ron): the fighter in a polaroid, a name box in the style of the rooms, the store as picture buttons (body part, then kind, then the items to buy), so lots more cosmetics stay tidy; skills on a corner of the frame, glowing when there are points to spend.
- **Accessibility:** hit flashes and team colours that work with colour blindness, a bigger text option (reduced screen shake and button remapping already exist).
- **Performance:** checked with 6 players and lots of enemies at iPad size; fewer effects automatically when the game slows down.

Built (version 54, see the CHANGELOG): the music and sound, the difficulty choices, the tutorial and MOVES on Pause, the new character screen, colour help and bigger text, the lower resolution for slow devices. Balance: test bots played every story on each difficulty; the numbers are with Ron, and nothing in the balance has changed yet.

**Done when:** every theme and boss has its music, the sound pass is in, the difficulty choices work alone, in co-op and online, the balance numbers have been reviewed with Ron, a new player can learn the basics from the tutorial, the new character screen is in, and 6 players run smoothly on the iPad.

### M17 · Level creator

- A mode for Rhett that edits a grid and saves a chunk or a whole level in the same data format the game uses.
- His levels can be played directly and can be added to the procedural pools.
- Levels are checked when loaded (sizes, known IDs only) and are never run as code (rule R3).

**Done when:** Rhett builds a level on the iPad, plays it, and sees his chunks appear in generated runs.

### M11.5 · Rollback for online play (suggested before Steam)

- Why: Versus at 58 ping felt laggy in the first real test. The direct-connection patch halved the delay; rollback removes most of the rest.
- How: your own presses take effect at once (with a small built-in delay of 1–2 frames). Other players are predicted to keep pressing what they last pressed; when their real presses arrive and differ, the game rewinds to that frame and replays up to now within the same screen refresh.
- Needs: saving and restoring the whole fight state every frame (fighters, enemies, ragdolls, the random seed, mode state), replays that don't repeat sounds and effects, and a limit on how far back it rewinds (about 8 frames).
- When: someday, before the move to Steam. It only helps online Versus between houses (not local play, same-house play or co-op against the computer), and it adds a little to every later change that adds gameplay state, so it waits until online Versus between houses is a regular thing.

**Done when:** Versus between two houses at about 60 ping feels close to local, with no desyncs over a 10-minute match.

### Someday · Cloud saves and Steam

Kept possible, not planned: cloud saves; a desktop app on Steam with Steam Workshop for editor levels and server-owned stars and inventory (why rules R7 and R8 exist). Anything public-facing with kids' accounts raises privacy and moderation questions, so it stays family-only unless Ron decides otherwise.

## Open decisions

1. **Back moves.** Add Back+P Backfist and Back+K Back Kick, which hit behind you? Not in the combat chart yet.

Settled decisions (Surge, phasing, grab and throw, side-scrolling levels, blocking) are in the archive.

## Suggested next step

M16: Ron and Rhett try it on the iPad (the music, the tutorial, the character screen, Easy for the younger ones) and decide on the balance numbers.
