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
| M16 | Polish, audio, balance | Done | L | M8–M15 | Music for every theme and boss, a full sound pass, difficulty choices, a balance pass, a first-play tutorial, a picture-menu character screen |
| M17 | Level creator | Next | L | M8, M13 | Rhett builds levels and plays them alone, locally or online |
| M18 | House builder and visiting | Done | L | M10, M11 | Build a house with stars, invite friends over |
| M19 | The City | Next | L | M13, M15 | A sixth story: the suburbs, a car smash through the city streets, and the climb up a skyscraper to Pink Kong |
| M20 | Ron's list | Next | L | M18, M19 | Stages for Versus and Arcade, colours for every item, furniture for every room you can sit and lie on, car moves, a Unicorn |
| M21 | Ron's stage notes | Next | M | M20 | Smoother online play, your own Versus and Arcade maps, Solo Arcade picks a stage, stage fixes (Moon low gravity) |
| M22 | Ron's notes on version 79 | Next | M | M21 | Versus ends on the victory screen, one item per style (colours do the rest), the chest on the Customize page, City and Pink Kong fixes |
| M23 | House tools | Next | S | M18 | TOOLS in the house builder: rotate, flip and erase |
| M24 | Ron's notes on version 81 | Next | S | M23 | Combo counter fix, new City music, MOVE and DUPLICATE in the house builder |
| M25 | COLORS sub-categories | Next | S | M24 | COLORS asks Shirts / Jackets / Gloves first, with None beside the item being coloured |
| M26 | Ron's notes on version 83 | Next | S | M25 | Level creator top bar, NEW STORY / NEW ARENA / MY STORIES, RANDOM labels, online room fixes |
| M11.5 | Rollback for online play (suggested before Steam) | Maybe | L | M11 | Your presses act instantly online; others are predicted and corrected |
| Someday | Cloud saves, Steam | Maybe | — | M11.5 (suggested) | Desktop app, Steam Workshop, server-backed stars |

## Upcoming milestones

### M17 · Level creator

- A mode for Rhett that edits a grid and saves a chunk or a whole level in the same data format the game uses.
- His levels can be played directly: alone, locally or online with a room code.
- Levels are checked when loaded (sizes, known IDs only) and are never run as code (rule R3).

How it works (decided by Claude, November 24; Ron asked for its picture between CHARACTER and HOUSE on Customize):
- **LEVELS** on Customize opens Rhett's levels (up to 12) and NEW LEVEL, which asks for a place (any of the 15 biomes, shown as pictures of the real scenery).
- **The editor** shows the real scenery of that place with a grid over it, like the house builder: picture tools for **platforms** (tap or drag along a row, five heights), **enemies** (the six pink army types and the place's own mini-boss, dropped where you tap, up to 10 a fight), **scenery** (that place's props), the **fight flag** (where the fight locks the screen) and the **eraser**. A level is up to 6 parts; each part is 900 to 2400 pixels wide.
- **PLAY** plays the level right away from the editor (a sign at the start, an arch at the end) and comes back to it. Playing your own levels earns no stars or XP, so they can't be used to farm.
- **MY LEVELS** (asked by Ron after testing, replacing the first plan of starred parts turning up in stories): on the Story screen (Solo), the Players screen (Local) and in an online room, a MY LEVELS tile swaps the stories for the host's own levels, with a red sticker: no XP or ninja stars. Online the host's levels go to everyone in the room and the one picked goes with the start. Custom levels will never be offered in matchmaking; a room code means you're already playing with friends.
- **Checked when loaded:** sizes and counts are limited, only known places, enemy types and scenery are kept, everything else is dropped. Levels live in the save (a new save version).

- **More places, a boss and scenery layers** (asked by Ron and Rhett, November 25):
  - A level is up to 3 places (ADD A PLACE beside ADD A PART), each with up to 6 parts. Old levels become one place.
  - Transitions are never chosen in the editor: every transition is listed under the places it can carry you *into*
    (`TRANS_INTO` in data/themes.js, which stories use too), and between two places one of the arriving place's is
    picked at random from the level's seed, so every device online gets the same one.
  - One boss (any of the main bosses), only on the level's very last part.
  - Scenery on three layers: far background (small, drifting slower), background (as before) and foreground (in front
    of the fighters, see-through when someone is behind it).
- **Five tiles at a time** on the Story screen, the Players screen and the online room: five stories, then `?` and MY
  LEVELS fixed on the right; under MY LEVELS five levels, then `?` (a random one of them) and STORIES. Up and down
  arrows left of the first tile page through them. The red sticker sits in the screen's bottom-right corner.

Built (versions 63 to 66, see the CHANGELOG): all of the above. Still to do: Rhett tries it on the iPad.

**Done when:** Rhett builds a level with a few places and a boss on the iPad, and plays it from MY LEVELS alone, on
Local and online.

### M19 · The City

Asked by Ron and Rhett (November 26). A sixth story, CITY, after the Volcano:
- **Suburban Street** (first place): houses, picket fences, mailboxes, lawns.
- **Downtown** (second place): everyone starts in a car (ten models, picked at random from the run's seed, painted
  in each player's colour) and is locked in it for the whole place. Left and right drive, jump hops, attack honks a
  turbo burst. Driving into the pink army sends them flying (ragdolls, bodies bowling into others); cars can't be
  hurt. Fights and rewards as usual (not more enemies than any place).
- **The Skyscraper** (last place): out of the cars at the tower's door, then one climb straight up its fire escapes
  (platforms and ladders, the camera rising with you). Each floor is an ambush with a locked hatch above until it's
  won; **Pink Kong** waits on the roof: chest pounds, roof-shaking leaps, air-conditioner units thrown at you.
- New transitions: the car park (into Downtown: everyone gets in) and the screech stop (into the Skyscraper:
  everyone hops out). Songs, mini-bosses, scenery, the level creator's places and boss, and the Story screen's tile.

Built (versions 75 and 76, see the CHANGELOG): all of the above. Still to do: the kids try the drive, the climb and
Pink Kong on the iPad.

**Done when:** the City story plays through on the iPad, solo, locally and online, and the kids enjoy the drive.

### M20 · Ron's list
Ron's notes after playing the City (November 26), all in one go: the victory screen for your own levels and the NO XP
sticker; furniture for every room and using it (sit, lie down); a door two squares high; the cars (double jump, hood
and trunk bumps, Surge glow and damage, a ULT per model, taking damage, the same car through a boss's entrance); the
Skyscraper's vanishing bodies; no grass in front of Suburban Street; DELETE THIS FIGHTER under the polaroid; a Unicorn;
Versus and Arcade stages (layouts from the best-liked fighting-game stages); and colours bought per item (save
version 19). The Big Pink Teddy came first (version 77).

Built (version 78, see the CHANGELOG). Still to do: the kids try it on the iPad.

### M21 · Ron's stage notes
Ron's notes after trying the stages (November 27): the online stutter (the screen freezing and jumping, with
different hosts); custom Versus maps in the level creator; Solo Arcade picking a stage like Versus, and its wave count
moved to the top right; the stage names (RANDOM, CITY, MEADOW); no spiky grass on the Meadow, a big oak on each side
of the Woods, one castle window, low gravity and helmets on the Moon; the rooms laid out like Story (stages under the
photos: five, RANDOM, MY LEVELS) with FREE-FOR-ALL / TEAMS on top.

Built (version 79, see the CHANGELOG). Still to do: play online between houses to check the stutter is gone, and the
kids try making maps on the iPad.

### M22 · Ron's notes on version 79
Ron's notes (November 27): Versus' old orange results; the dot on the colour tiles; grey stripes on plain items in a
colour; items that were only colours of another item (one per style now, Rainbow protected); the treasure chest on
the Customize page; Surge in the City's cars; Pink Kong's health bar and camera, everyone's view when someone reaches
the roof first, and the ending that skipped the slow motion.

Built (version 80, see the CHANGELOG). Still to do: the kids try it on the iPad.

### M23 · House tools
Ron's ask (November 27): a TOOLS tab in the house builder where ERASE was, with rotate, flip (mirror, so a chair can
face the other way) and erase.

Built (version 81, see the CHANGELOG). Still to do: the kids try it on the iPad.

### M24 · Ron's notes on version 81
Ron's notes (November 27): the combo counter's bar running through its number; City music more unique, in the spirit
of a quirky 90s adventure game's hometown theme, for each part; MOVE and DUPLICATE tools in the house builder.

Built (version 82, see the CHANGELOG). Still to do: hear the City songs on the iPad and say what to change.

### M25 · COLORS sub-categories
Ron's ask (November 27): a None button beside the item being coloured, and COLORS showing a kind's sub-categories
(Upper Body: Shirts, Jackets, Gloves) before the item and its colours.

Built (version 83, see the CHANGELOG). Still to do: the kids try it on the iPad.

### M26 · Ron's notes on version 83
Ron's notes (November 27): the level creator's help text over DONE and the name over the tabs, a name that didn't look
editable, DELETE hidden in PARTS; NEW STORY, NEW ARENA and MY STORIES; RANDOM instead of "?" on the story pickers;
the host re-picking the same thing unreadied everyone; the host's pick too faded for guests; "Tap READY?" left on the
Multiplayer screen after the room closed.

Built (version 84, see the CHANGELOG). Still to do: the kids try it on the iPad.

### M11.5 · Rollback for online play (suggested before Steam)

- Why: Versus at 58 ping felt laggy in the first real test. The direct-connection patch halved the delay; rollback removes most of the rest.
- How: your own presses take effect at once (with a small built-in delay of 1–2 frames). Other players are predicted to keep pressing what they last pressed; when their real presses arrive and differ, the game rewinds to that frame and replays up to now within the same screen refresh.
- Needs: saving and restoring the whole fight state every frame (fighters, enemies, ragdolls, the random seed, mode state), replays that don't repeat sounds and effects, and a limit on how far back it rewinds (about 8 frames).
- Ready already (November 25, from a combat review Ron brought): effects have their own random numbers (`fxr`) and a mute switch (`SIM.mute`, checked by the self-test), every fighter has a `uid`, and new state names other fighters by uid or index. The rules for making enemies are at the top of data/enemies.js.
- Still to do then: gather the game state outside the fighters (`slow`, `stop`, `score`, `maxc`, `queue`, `fr`, the seed, the mode's state, the input buffer that attacks write to) so it can be saved in one go; links between fighters held as objects today (`a.hit`, `e.bh`, `f.gt`, `tg.held`, `a.tx`) saved together in one pass or switched to uids; move definitions referred to by key; mode rules (`MODE.spare`, `MODE.onKill`) kept apart from the saved data; the camera's shake, kick and zoom saved and put back around a re-play; and a self-test that saves, plays, restores and re-plays to the same fingerprints.
- When: someday, before the move to Steam. It only helps online Versus between houses (not local play, same-house play or co-op against the computer), and it adds a little to every later change that adds gameplay state, so it waits until online Versus between houses is a regular thing.

**Done when:** Versus between two houses at about 60 ping feels close to local, with no desyncs over a 10-minute match.

### Someday · Cloud saves and Steam

Kept possible, not planned: cloud saves; a desktop app on Steam with Steam Workshop for editor levels and server-owned stars and inventory (why rules R7 and R8 exist). Anything public-facing with kids' accounts raises privacy and moderation questions, so it stays family-only unless Ron decides otherwise.

## Open decisions

1. **Back moves.** Add Back+P Backfist and Back+K Back Kick, which hit behind you? Not in the combat chart yet.

Settled decisions (Surge, phasing, grab and throw, side-scrolling levels, blocking) are in the archive.

## Suggested next step

M17: Rhett builds a level with a few places and a boss on the iPad, then plays it from MY LEVELS alone, on Local
and online.
