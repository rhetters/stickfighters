# Changelog

One short entry per milestone. Each finished milestone also has a branch (`m5`, `m6`, …).

## M11 patch: less lag online (November 17, 2026)
- Button presses now go straight from each device to every other device instead of round-tripping through the host, so the delay only covers one trip: about half the lag (at 58 ping, about 3 frames instead of 6; on the same Wi-Fi, 2). Guests connect to each other directly; if two guests can't, the host passes their buttons along.
- The pose wheel only shows on the screen of the player using it; everyone sees the pose. Keeping the direction held while letting go of the pose button no longer cancels the pose.
- A player who leaves an online match falls and dissolves into confetti in their own colors, at the same moment on every screen, then is gone from the fight (and from later rounds).
- Fingerprint checks also work when a guest is a little ahead of the host.
- Version 14.

## M11 fix: connecting between houses (November 17, 2026)
- The first real test failed everywhere ("No room with that code"). Room codes now travel through several free services at once (the PeerJS server and three public MQTT message boards); whichever gets through first wins, so one being down or blocked no longer stops play.
- A free relay (TURN) server is added for networks that won't connect devices directly.
- Clearer messages: "Looking for room…", "Found the room. Connecting…", and different messages for "no room answered" and "found the room but the networks blocked the connection", plus which online services could be reached. The host's room screen shows which services it's listening on.
- Version 13.

## M11 · Online multiplayer (internet, cross-play)
- Title → Multiplayer → Online: HOST A GAME gives a room code; JOIN picks the code with arrows (works with a controller). Up to 4 players, one per device, any mix of PC, iPad and phone, house to house over the internet.
- The room shows everyone's fighter (change yours with ◀ ▶); no two players share a color. The host picks Co-op Trail, Arcade or Versus and starts.
- Every device runs the same game and only button presses travel; the input delay adapts to the measured lag. Game versions must match, the host's feel settings are used, and a fingerprint check stops the match if a game drifts.
- A YOU marker shows your fighter at the start. The pause menu doesn't stop the match; only the host restarts or ends it. Guests leaving don't end the match; the host leaving sends everyone back.
- Built to swap parts later: connection (WebRTC), room, lockstep (see ARCHITECTURE.md), for matchmaking or Steam.
- Self-test fingerprints unchanged.

## M10 patch 2 (November 17, 2026)
- Clothes sit at the right depth: the far hand, sleeve and leg go behind the body and dresses; ties and scarves go under the near arm. Ties look like ties.
- Controller menus move the way you point (down from a fighter goes to the tabs below, right goes to the next fighter).
- Mohawk follows the head with more spikes. Halo and headphones no longer hide the hair.
- The Character shelves no longer jump back to the top when you tap an item.
- Pose wheel holds up to 8 poses, split evenly in a wheel that stays the same size; aim in 8 directions. Long names are shortened.
- Versus: after a KO nobody can move; the winner strikes their victory pose.
- Fixed: a Dive Kick bounced off a defeated enemy lying on the ground as if it hit a wall.
- iPad: PRESS START also says "or tap the screen", and a second check watches for controller buttons.
- Roadmap: network multiplayer moved up from M17 to M11 at Rhett's request; M11–M16 each moved down one.
- Self-test fingerprints unchanged.

## M10 patch (November 16, 2026): Rhett's 16 fixes
- Character screen tabs are now Body, Colors, Head (hair, hats, headbands), Neck (scarves, ties), Upper Body (shirts, jackets, gloves), Lower Body (pants, shorts, skirts, dresses, shoes), Surge and Poses. Sections scroll; wear one item from each section (pants, shorts, skirts and dresses are one at a time). Every section has a None card.
- New items: 9 hairstyles, 6 ties, 7 shirts, 6 jackets (including a hood and a hero cape), 16 pants/shorts/skirts/dresses, more gloves (mittens, hand wraps, work, driving, boxing) and shoes (sneakers, high-tops, sandals, fuzzy slippers, boots, cowboy boots). 143 items in all.
- Trails became Surge styles: they color the Surge glow, afterimages and sparkles (Lightning adds sparks, Hearts adds hearts). The Surge tab preview runs, punches and kicks with Surge on.
- Victory became Poses: put up to 4 on your pose wheel (the first is your victory pose). In a fight, hold T (keyboard), Select/View/minus (controller) or the POSE button (touch), aim with the stick or arrows, let go to strike the pose. Moving or attacking ends it. Twirl now really turns.
- Height setting (85%–115%), drawing only. Four fighter slots, and Delete this fighter (tap twice).
- No more spinning and arms-up in the preview: Body and clothes tabs show your stance, Poses shows the pose.
- Headphones fixed (the band goes over the head from the ear cup). Gifts show the item inside.
- Save version 5 (fourth fighter slot); older fighters keep their trail as their Surge style and their victory pose at the top of the wheel.
- Self-test fingerprints unchanged.

## M10 · Ninja stars, cosmetic store, character creation
- Ninja stars drop from defeated enemies (more for tough ones and big combos), fly to you and go in your wallet; wave and level clears give more. A star counter sits next to the score, and the results screen shows what you earned.
- Captains drop gifts with a random gift-only item.
- Character screen: three saved fighters with name, head size, line thickness and stance, plus shelves (Colors, Hats, Bands, Scarves, Gloves, Shoes, Trails, Victory poses) that are also the store: tap to try on, tap again to buy. 59 items, all looks only. Unlocks for clearing the Wooded Trail, a 20-hit combo, Arcade wave 10 and winning a Versus match.
- Looks follow the body in every move, ragdoll, death pose and the Tornado Kick. Victory poses on level clear and for Versus round winners.
- Players screen: each player picks a saved fighter or guest, and changes color and hat with their own controller or by tapping. No shared colors.
- Settings → Save: Back up / Restore with a code or a file.
- Save version 4 (wallet, items, fighters), migrating from all older saves; earned unlocks are granted on first load.
- Self-test fingerprints unchanged: Arcade `c87c9470`, Level `21292ab5`.

## Roadmap: M10 and M11 swapped (November 16, 2026)
- At Rhett's request: M10 is now ninja stars, the cosmetic store and character creation (including per-player looks in local multiplayer); M11 is XP, levels and the skill tree.
- The starting style (Brawler, Kicker or Sprinter), which sets your first skill point, moves from character creation to M11 with the skill tree. Respecs costing stars works from day one, since stars come first.

## Menu fixes (November 16, 2026)
- Title menu is now SOLO (splits into Campaign | Arcade) and MULTIPLAYER (splits into Local | Online; Online is a placeholder for M17), then Character, Training Room, Settings.
- The split row sits on top of the button it replaces, so the title and other buttons no longer move or resize.
- Fixed: a controller's Start on the PRESS START screen didn't open the menu on iPad. Now any button, stick movement, or the controller connecting opens it.
- Roadmap: character creation in local multiplayer (each player customizes their look, Mario Kart style) added to M11.

## Post-M9 patch (November 16, 2026)
- Title: flashing PRESS START, then PLAY (splits into Campaign / Arcade / Multiplayer side by side), Character (placeholder for M11), Training Room, Settings. Stats and controls text removed from the title.
- Settings: all six Feel sliders (hit-stop, shake, knockback, gravity, bounce, bodies stay), adjustable mid-match from the pause menu.
- Versus: grab another player (punch + kick), knee, four throws; the held player mashes to break free. A grab gets through a block.
- Versus 2v2 (or 2v1, 3v1) teams: no friendly fire, team wins, teams start on opposite sides. Lobby toggle Versus: Free-for-all / Teams, TEAM button on each card.
- Self-test fingerprints unchanged.

## M9 · Local multiplayer: co-op and versus
- Players screen: up to 4 players join with controllers (any button; B leaves), touch, keyboard or a second keyboard player.
- Per-player input slots, health, Surge, meter, combo and HUD rows. Any controller pauses; touch controls hide when nobody uses touch.
- Versus: The Clearing, 2-4 players, best of 3, 60-second rounds, countdown, KO slow motion, winner screen, rematch. Block works.
- Co-op: Wooded Trail and Arcade; enemies scale with players; revive a teammate by standing next to them for 2 seconds.
- Self-test fingerprints unchanged for one player (Arcade `c87c9470`, Level `21292ab5`).

## Buttons and controller menus (November 16, 2026)
- Settings > Buttons: change keyboard keys and controller buttons for every action, including Pause. Controller mappings are saved per controller type, with Xbox, Switch and PlayStation button names.
- Fixed: after pressing Start on a controller, the pause menu couldn't be used with the controller. Every menu now works with a controller (d-pad/stick, confirm, back, Start resumes).
- Save version 3 (adds button bindings), migrating from version 2 and older.
- Self-test fingerprints unchanged.

## Combat patch (November 16, 2026)
- Block: Down + Surge, standing still. Hits from the front cost Surge instead of health, no stun; the kneeling pose trembles more as Surge drains; Winded when it runs out, then hits land.
- Ground hits: downed enemies can be hit (half damage, ragdoll flop) without extending their knockdown.
- Self-test fingerprints: Arcade `c87c9470`, Level `21292ab5`.

## M8 · Level framework and Level 1: Wooded Trail
- Modes: Arcade and Level run on the same engine. Title: Play Wooded Trail / Arcade: Endless Waves.
- Wooded Trail: 6 chunks, 5 ambushes, a breakable fallen log, checkpoints with Continue, level-clear screen with time bonus.
- Paper-style parallax scenery, morning-to-dusk sky, falling leaves, fireflies, foreground grass. Trail map in the HUD.
- Save version 2 (level progress) with migration from old saves.
- Self-test fingerprints: Arcade `39f01735` (unchanged), Level `8c67f67e`.

## Roadmap reorder (November 16, 2026)
- Approved by Ron and Rhett: local multiplayer moves up to M9; XP and skill tree M10; ninja stars, cosmetic store and character creation merged into M11 (store items are cosmetic only); new milestones for the level creator (M16), network play (M17) and the house builder (M18). Old-to-new numbers are in ROADMAP.md.
- Rhett checked M7.5 on his iPad: all good.

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
