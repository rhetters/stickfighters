# Changelog

One short entry per release, newest first. Each finished milestone also has a branch (`m5`, `m6`, …).

## M13 in progress: the online leash, rope fix, calmer ADMIN hits (November 21, 2026)
- **Online campaign on a leash (to try out):** each player's screen now follows their own fighter. The group still moves together: anyone can fall up to half a screen behind the lead player's camera before its edge pushes them along, and when a fight starts, anyone outside its arena is brought in (with a ring). Teammates off your screen show as an arrow at the edge. The online house follows your own player too. Local play is unchanged (one shared screen).
- **Scenes with several players:** a player who finished their part early (the first one across the rope, out of the balloon, off the ladder…) made the next one skip theirs, so the second rope swinger froze in the air and then appeared on the far side. Each player now keeps their place in the scene.
- **ADMIN hits look normal:** instead of 9999-damage hits (whose spark filled the screen yellow), an admin hit now drops the enemy to 1 health first, so the normal hit finishes it.
- Version 40.

## M13 in progress: tower camera for co-op, short hair, helmets on flying bodies (November 21, 2026)
- **Launch tower camera with several players:** the view now frames everyone, in the air too, zooming out like the house camera (down to 60%). If even that can't fit everyone, it keeps the highest player in view and anyone off screen gets an arrow in their colour at the edge pointing to them. The zoom and rise are drawing only; walls and fights don't change.
- **The camera only moves over the platforms:** anywhere else it stays on the ground at full size, so jumping on flat ground no longer pans it up and down.
- **Three new hair styles** in the store, for Rhett: Short Hair, Buzz Cut and Side Part.
- **Bubble helmets stay on flying bodies** on the moon (knocked-out and ragdolling fighters, players and the Pink Army alike).
- The far rockets behind the Launch Base now look like rockets (pointed nose, fins, a stripe).
- Version 39.

## M13 in progress: ADMIN test mode (November 21, 2026)
- **ADMIN (temporary, for testing levels):** a new ADMIN: OFF/ON button in the TEST ONLY row on the Skills screen. While it's on, every hit a player lands finishes the enemy, so one punch beats anything, bosses included; a small ADMIN tag shows at the bottom of the screen. It's remembered on this device (outside the save) and never works online. It lives entirely in js/devtools.js, to be removed with the rest of the test tools.
- A menu test sometimes failed at random: it checked PRESS START at an instant when its blink had it hidden. It now checks the text is on screen, blink or not.
- Version 38.

## M13 in progress: cave torches, castle windows, a better catapult (November 21, 2026)
- **Treasure Cave torches** now stand on wooden stakes in the ground instead of floating (the cave has no wall to hang them on).
- **Castle hall:** the small windows are gone (they could land on top of the tall ones), and banners, torches and shields are no longer hung where a tall window is.
- **The catapult:** its bucket now rests low so everyone hops into it one after another and sits inside; the arm is pulled down, then swings up and over, carrying the riders in the bucket until it stops at the top and lets them fly. Before, the arm swung the wrong way and the riders only stood near it.
- Version 37.

## M13 in progress: moon gravity, a steeper mountain, tower camera, helmet fixes (November 20, 2026)
- **Low gravity on the moon:** jumps, launches and knock-ups float about twice as long and go a little higher (about a fifth). Up-and-down motion simply runs slower there, so every move still reaches the same places, only floatier.
- **The mountainside gets steeper as you climb:** it starts gentle and ends about twice as steep, with small changes along the way, and is steeper overall than before. The view now measures the slope from a little farther into the screen so the hill stays in view.
- **Launch tower camera:** the camera now follows you in mid-air too, instead of waiting until you land. It only moves when you get near the top or bottom of the screen, so small hops don't jiggle it.
- **Bubble helmets fit everything:** the helmet sits a little higher and is bigger, so afros, buns and mohawks fit inside. Tall or wide hats (party, chef, top hat, wizard, halo, propeller, cowboy, viking) get a bigger bubble still.
- The moon lander's glass dome sits on its body again.
- Version 36.

## M13 in progress: Space, the launch tower's platforms, bubble helmets (November 20, 2026)
- **New theme, Space:** the Launch Base (desert sky, far launch towers, radar dishes, fuel tanks), inside The Rocket (a metal corridor with round windows on streaming stars) and The Moon (craters, the Earth in the sky, a flag, a lander). On the moon everyone, players and enemies alike, wears a glass bubble helmet. The Pink Alien (antennae) is beamed down from a flying saucer at the end. New mini-bosses: the Launch Guard, the Space Brute and the Moon Mauler.
- **Platforms up the launch tower:** at the end of the Launch Base you jump up girder platforms to the tower's top deck, and the camera rises with you. You can't walk in under the tower, so the only way up is jumping. Standing on the top deck starts the launch: everyone boards, a 3-2-1 countdown, lift-off, and the camera follows the rocket up.
- **The landing:** at the end of the rocket, everyone goes through the Moon Lander hatch, and the rocket comes down on the moon.
- The Campaign screen fits all four themes in a row.
- **Self-test fix:** the self-test could give a different fingerprint after a lot of play in the same session, because it started its frame count over but still remembered when buttons were last pressed. It now forgets them first. The fingerprints themselves are unchanged.
- Version 35.

## M13 in progress: Mountain, three new transitions, each theme its own transitions (November 20, 2026)
- **New theme, Mountain:** the Alpine Meadow (green hills under snowy peaks, wildflowers, fences, hay bales), the Mountainside and the Snowy Peak (falling snow, snowy pines, a snowman, flags, ice; the snow is slippery). The Pink Yeti (shaggy white fur and little horns, three phases, calls his climbers) leaps down at the end. New mini-bosses: the Hilltop Hulk, the Rock Roller and the Ice Giant.
- **Climbing the mountainside:** between fights the path goes diagonally uphill, and the far mountains sink below you as you climb. Each fight is on a flat ledge. The slope is only drawn: underneath, the game still plays on flat ground, so fighting works exactly as everywhere else.
- **Three new transitions:** a hot-air balloon (everyone climbs into the basket, it floats away and lands in the next area), a gondola (a cable car up to the next station) and a cliff climb (up a rope ladder, one after another).
- **Each theme has its own transitions:** Castle Siege: catapult, pipe, rope, gate. Pirate Cove: catapult, cannon, rope, balloon. Mountain: gondola, balloon, cliff climb, rope. Adding one to a theme is one word in its list.
- The Campaign screen fits three themes in a row.
- Self-test fingerprints unchanged.
- Version 34.

## M13 in progress: Pirate Cove, the Campaign screen, an opening scene (November 20, 2026)
- **New theme, Pirate Cove:** the Sunny Beach (palms, the sea, a far island, seagulls), the Pirate Ship (its rail, masts and sails, cannons, a plank deck) and the Treasure Cave (stalactites, glowing crystals, treasure chests, drips). Captain Pinkbeard (tricorn hat, three phases, calls his crew) leaps in at the end and knocks everyone down. New mini-bosses: the Beach Bully, the First Mate and the Cave Brute.
- **New transition:** the ship's cannon loads everyone in and fires them to the next biome (only next to the ship).
- **The Campaign screen:** Campaign (solo) and Co-op now open a screen with one card per theme: its three biomes, its boss and your best clear. Online, the host picks the theme in the room.
- **Every run opens with a scene:** the pencil draws each player in, one after another, and they come to life.
- **The castle is now inside the keep:** a stone wall right behind you (so banners, torches and shields hang on it), tall windows looking out at the sky, a carpet down the floor. The suits of armour are gone: they were grey stick figures and looked like a ghost left behind by the General's pencil sketch. The sketch itself is now cleared for good when any scene ends.
- **No line says "Orange"** any more (most players rename their fighter).
- A boss's speech bubble no longer shares the top of the screen with the CLEAR! banner.
- Self-test fingerprints unchanged.
- Version 33.

## M13 in progress: Castle Siege, the first generated campaign (November 20, 2026)
- **Campaign is now Castle Siege**, a new run every time from a random seed: the Wooded Trail, the Sewer Tunnels and the Castle Keep, about three minutes each, five fights per biome with a Captain at the end of the first two.
- **Transitions** between biomes, picked at random: a catapult launches everyone into the next biome, a pipe slide (into or out of the sewer), a rope swing over a chasm, or smashing the castle gate. Where you walk through (gate, rope), one biome's background fades into the next.
- **Mini-bosses** (rare, about one run in two): the Big Bruiser, the Sludge Brute or the Captain of the Guard leaps in, lands with a quake that knocks everyone down, and says something in a speech bubble.
- **The Pink General** waits at the end: everyone freezes while a pencil draws him in, he fills with colour, comes to life and talks, then fights in three phases, calling his army.
- **New scenery:** the sewer (arches, pipes, valves, a water channel, drips, a slippery floor) and the castle (towers with flags, the wall, banners, torches, windows, suits of armour).
- The fixed Wooded Trail stays in the game files for the self-test; getting through the woods in a run still counts for the Ranger Hat.
- Self-test fingerprints unchanged.
- Version 32.

## M12 done (November 20, 2026)
- **M12 (XP, levels, skill tree) is done.** The level-up sound is a little quieter.
- Version 31.

## M12 in progress: a real level-up sound (November 20, 2026)
- Leveling up plays Ron's pick, "Level Up 2" by yodguard (Pixabay), instead of the four beeps. It follows the Volume setting and works offline and in the preview.
- Version 30.

## M12 in progress: turning mid-combo, three fixes (November 20, 2026)
- **Turning mid-combo is instant again.** Why it felt locked: with Haymaker not yet unlocked, a third punch started the string over (Jab, Cross, Jab, Cross…), so mashing kept you chained, and a chained move never looked at the direction you held. Now a string ends at a move you haven't unlocked (like it used to end at Haymaker), and holding the other way ends any string: once a move's hits are over you turn at once and the next press faces the new way. Turning used to wait for the whole string; now it takes about a tenth of a second.
- **Character preview** moves again after coming back from Skills.
- **Room codes** step through their words in alphabetical order.
- Gameplay change: self-test fingerprints are now Arcade 1b77eddf, Level 365c11ac.
- Version 29.

## M12 in progress: ultimates bought with points, level-up celebration, no more slowdown (November 20, 2026)
- **Level up mid-fight:** a golden pillar of light, rising sparkles, LEVEL UP! and a chime, the moment a kill lifts you to the next level.
- **Ultimates cost points:** each fighting branch has an ULTIMATE row of three steps (level 5, 15, 30), each bought with a point. One branch's ultimate at a time; take the points back to switch. Skipping it never blocks that branch's moves.
- **Slowdown fixed:** the slowdown with ultimates and big group hits was the game freezing for a moment on every hit (hit-stop) plus a slow-motion moment on ultimates. Ultimates no longer freeze the game, the slow-motion is gone, and hit-stop and screen shake now start off (bodies stay 1 second). Online they're always off and the Feel sliders are locked during a match.
- **Ultimate look:** no big name banner; every ultimate starts with colored rings, more at each step, and the level-30 step adds a ground ring and zoom.
- **Pace:** XP for the next level is now 60 × level^1.6 (about 2-3 Wooded Trail clears to level 5, 55 to 15, 340 to 30). Some fighters may drop a level; if a tree then has more points than allowed, its points come back to spend again.
- Save version 13. Self-test fingerprints unchanged (it plays with the old feel).
- Version 28.

## M12 in progress: XP, levels and the skill tree (November 19, 2026)
- **M18 (house builder) is done.**
- **XP and levels:** each saved fighter earns XP for every enemy beaten (shared by everyone in the fight), plus bonuses for clearing a level, Arcade waves and Versus rounds and wins. Levels go up to 30; XP shows on the results screen with any level-up.
- **Skill tree** (Customize → Character → SKILLS): five branches (Fists, Legs, Surge, Body, Fortune), four rows each. Points unlock moves (new fighters start with the basics, so moves are earned back) and small boosts that add up over many levels. Respec is free: take back any point a higher row doesn't need, or RESET everything.
- **Ultimates:** the Tornado Kick is no longer for everyone. Pick a branch with a point in it: Fists (Flurry, Hundred Fists, Comet Fist), Legs (Spin Kick, Twisting Kick, Tornado Kick), Surge (Surge Dash, Lightning Rush, Thunder Step) or Body (Shoulder Charge, Quake Stomp, Earthshaker), opening at levels 5, 15 and 30, each with a colour burst and a slow-motion moment.
- **Versus:** moves and ultimates count, boosts don't.
- **Testing:** a temporary TEST row on the Skills screen sets the level (one file, `js/devtools.js`).
- Training Room: the Moves panel shows which skill unlocks each locked move.
- Save version 12 (fighters gain their progress; everyone starts at level 1). Self-test fingerprints unchanged (it plays with everything open).
- Version 27.

## M18 in progress: last of the old name (November 19, 2026)
- A saved backup file is now named `stickfighters-save-<date>.json`. Older backup files (and backup codes, which still start with `OVPA-`) restore as before.
- Version 26.

## M18 in progress: head types, multiplayer art, tidy-up (November 19, 2026)
- **Customize → Character → Body:** a new **Head** setting: **Donut** (the ring head everyone had) or **Full** (filled in with your color). It shows everywhere your fighter does: fights, ragdolls, the Players screen, the house and online.
- **Multiplayer screens:** Rhett's campaign-and-versus drawing is behind the Players (Local) and Online screens, with paper behind the cards and notes so they stay easy to read.
- Tidy-up: the code was checked for unused functions and styles (none found besides a doubled comment, removed), and ARCHITECTURE, README and TESTING were checked against the code and corrected where they had fallen behind (the house land size, the terrain functions, the house tabs, the save version).
- Save version 11 (fighters gain a head type; old fighters keep the donut head). Self-test fingerprints unchanged.
- Version 25.

## M18 in progress: the game is now StickFighters (November 19, 2026)
- **New name:** the game is now **StickFighters** everywhere (title screen, browser tab, docs). Saves, backup codes and settings carry over untouched.
- **Title screen:** Rhett's new notebook drawing, with the StickFighters name in orange-to-pink at the top and the menu in the open space between the fighters.
- **Esc** backs out of Settings (and its Buttons page), also when Settings was opened from the pause menu.
- Self-test fingerprints unchanged.
- Version 24.

## M18 in progress: new title art, Settings fix (November 19, 2026)
- **Title screen:** Rhett's StickFighters picture is now the main menu art, with the menu in the space between the two fighters. The picture is shown whole; blurred edges fill the wider game frame.
- Fixed: on a short screen the top of **Settings** was cut off and couldn't be scrolled to. Settings now scrolls from the top (the same fix covers every centered menu screen).
- Self-test fingerprints unchanged.
- Version 23.

## M18 in progress: polish (November 19, 2026)
- **Online room** fits on the screen without a scroll bar, in every mode (Versus with teams too) and on phones in landscape.
- **House: WALK AROUND** — Esc (or Start / the pause button) goes straight back to the house builder instead of the pause menu.
- **Title menu:** pressing Solo, Multiplayer or Customize gives a little orange poof cloud where the button was while its two buttons pop in (skipped if the device asks for reduced motion).
- Self-test fingerprints unchanged.
- Version 22.

## M18 in progress: stairs done right, floors and stairs together, gloves and shoes (November 19, 2026)
- **Stairs:** walking left or right you stay on the level you're on, and stairs are ignored. Hold **Up** while walking to take stairs that go up that way, **Down** to take stairs that go down that way; once on stairs you follow them to the end. Walk off the end of a floor without Up or Down and you drop. Up or Down alone, beside stairs going that way, walks you onto them (where two staircases meet, Up picks the one going up).
- A **floor and stairs can share a square** now (floors have their own layer); erase takes the floor first, then the stairs.
- **Gloves and shoes** grow with the fighter's line thickness, so they cover thick hands and feet.
- Tests: the online pose check no longer fails when an enemy happens to hit the posing player.
- Save version 10. Self-test fingerprints unchanged.
- Version 21.

## M18 in progress: ladders, climbing and a few fixes (November 19, 2026)
- **Ladders** (new) and **spiral stairs** (now straight up and down) are climbed: hold Up to climb, Down to go down, let go to hang on; Jump or walk sideways to get off, or walk off the top onto a floor.
- **Stairs:** Up always walks up them and Down always walks down, whichever way you face. Down at the top of a staircase walks down it.
- Hats, hair and headbands now cover the head's outline: they reach its outer edge at any head size and line thickness.
- Fixed (online): a match could freeze at the start ("Waiting for the connection…") when another player's first button presses arrived before this device got the host's start message, most likely with 3 or 4 players. Early presses are now kept and used.
- Save version 9: ladders and spiral stairs are kept in their own layer; old spiral stairs move there.
- Self-test fingerprints unchanged.
- Version 20.

## M18 in progress: barriers, a bigger building view, and fixes (November 19, 2026)
- House: **Floors & Stairs** is now **Barriers**, all drawn as black lines: a floor along a square's bottom edge, a **side wall** along its right edge (nobody walks or flies through it), stairs (just the steps) and **spiral stairs**. Walking into stairs from the floor passes through them; **hold Up** to step onto them and walk up.
- Layering: a wall painted on stairs fills only inside the steps (wood wall, then stairs, then stone = stone stairs in front of a wood wall). Erase goes front to back: the stone, then the stairs, then the wood.
- House builder fills the whole frame: help text top-left; stars, Walk Around and Done top-right; a D-pad bottom-left; zoom bottom-right; the tabs and pieces on the floor below the building area.
- Fixed: poses didn't show when standing on a floor or stairs. Fixed: the gold trophy had a gap.
- Online Versus now has **teams**: the host switches between free-for-all and teams, and each player taps their card to pick a team.
- Hats, hair and headbands now fit any head size and line thickness: they snap to the head's outer edge.
- Menus: no button is orange until it's highlighted (pressed, under the mouse, or picked with a controller or keyboard), so nothing looks chosen on an iPad until you tap it.
- Save version 8 (fills and side walls in the house). Self-test fingerprints unchanged.
- Version 19.

## M18 in progress: zoom (November 17, 2026)
- House builder: **−** and **+** zoom the view out and back in (20, 40 or 60 squares across). Every square is still tappable, and a faint grid shows where taps land.
- Walking around with several players (on one screen or online): the camera zooms out to keep everyone in view, even players at opposite ends of the land and at the top of the tallest building, and zooms back in when they come together.
- Self-test fingerprints unchanged (every other mode keeps the camera at normal size).
- Version 18.

## M18 in progress: a bigger house with floors and stairs (November 17, 2026)
- The land is now up to 240 squares wide and 60 tall, and grows as you build: towers, several houses, a little city. Arrow buttons move the view.
- New **Floors & Stairs** tab: a floor is a line along the bottom of a square; stairs rise to the right or the left. When you walk around, you jump onto them, walk up and down the stairs, and press Down + Jump to drop through. Walking into stairs from the floor below passes through them, like most platformers. The camera follows you up.
- Everything placed costs stars (walls and floors per square, furniture and decorations per piece), and **Erase gives back every star**. Backgrounds are still bought once.
- New: Hot Air Balloon, Door and Flag.
- Engine: floors and stairs are general terrain any mode can use (future levels with platforms), and the camera can move up. Arcade, the Trail and Versus are unchanged; self-test fingerprints unchanged.
- Save version 7: houses from version 16 are turned the right way up (rows now count up from the floor).
- Version 17.

## M18 · House builder and visiting (November 17, 2026)
- Title: **Customize** opens **Character | House**.
- House screen: a side view of your house on a 20 x 7 grid. Paint walls square by square in 7 materials (wood, plaster, pink paint, brick, stone, roof, window; 2 to 4 stars a square), tap or drag. 8 pieces of furniture and 8 decorations to buy once and place anywhere (chair, table and plant are free; the Gold Trophy unlocks at Arcade wave 10), 7 backgrounds, and Erase. Works with touch, mouse, keyboard and controllers.
- **Walk around** puts your fighter in your house. Online, the host can pick **Host's House** and everyone visits it.
- Save version 6 (adds the house); older saves upgrade with an empty house and keep everything else.
- New test that catches two files using the same top-level name, after one such clash was found while building this.
- Self-test fingerprints unchanged.
- Version 16.

## Cleanup (November 17, 2026)
- No gameplay change. The code no longer has a hidden "current player": every part of the game is handed the player it works on. This was the last big piece of old wiring and the groundwork rollback (M11.5) needs.
- Fixed: pressing Start on a controller at PRESS START sometimes also opened the Solo menu.
- The Surge sparkles and the trailing health bar now update with the game instead of with the screen, so they look the same on 60 Hz and 120 Hz screens.
- Removed unused code and styles; code comments describe the code instead of milestone history.
- The automated tests and the preview builder now live in the repo (`tools/`), with one command to run them all; the self-test checks its own expected fingerprints.
- Docs reorganized so each fact lives in one place: status only in ROADMAP, direction in VISION, code in ARCHITECTURE, moves in COMBAT, tests in TESTING, and README is the player's guide. Finished milestones' plans moved to a frozen archive.
- Self-test fingerprints unchanged (Arcade `c87c9470`, Level `21292ab5`).
- Version 15.

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
