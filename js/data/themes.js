// StickFighters: Themes, biomes and transitions for generated campaign runs (plain data; VISION.md rule R3).
// A theme is three biomes in order, ending with a main boss. A run is generated from a seed by run.js: each biome
// gets a sign chunk, `fights` fight chunks drawn from its rules, and a transition into the next biome. The same seed
// always makes the same run. To add a theme: add its biomes here (and a look in scenery.js if it's a new look).
// ===== BIOMES =====
//   look     which scenery draws it (woods in scenery.js; sewer, castle, beach, ship, cave in biomes.js)
//   props    [kind, weight]: scenery kinds scattered in each chunk (sizes vary for trees)
//   w        [min, max] chunk width in pixels (the screen is 900 wide)
//   fights   fight chunks per biome (about 3 minutes of play)
//   mix      [{ at: toughness from, w: { enemy type: weight } }]: which enemies a fight draws, by toughness
//   mini     a rare mini-boss: enemy type, chance per fight, the lines it may say when it lands
//   slick    1 = slippery floor: knocked-back bodies slide farther
//   lowg     low gravity: up-and-down motion runs at this speed (jumps float and go a little higher)
//   helmet   1 = everyone wears a glass bubble helmet here (drawing only)
//   climb    [start, end]: how much the ground rises per pixel between fights, getting steeper from the start of
//            the biome to the end (fights stand on flat ledges); drawing only
//   dusk     [start, end] light over the biome (woods: morning to dusk)
//   prog     a level id this biome also completes (keeps old unlocks like the Ranger Hat working)
//   vents    steam vents in each fight (volcano.js): every few seconds they hiss, then blast anyone standing on one
//            high into the air (players ride it like a super jump; enemies are knocked flying)
//   rocks    lava rocks fall during fights: a glowing mark shows where, then the rock lands and hits everyone there
//   ledges   rock ledges in each fight (platforms; the army follows you up and down them), and pools of lava on the
//            floor between fights. Lava bounces you out with a little damage (it never knocks a player out)
//   descent  the biome opens with a climb down: ledges stepping down from the rim over a lava pool
//   enter    the transition that always leads into this biome
const BIOMES = {
  woods: {
    name: 'WOODED TRAIL',
    look: 'woods',
    prog: 'woods1',
    props: [
      ['tree', 3],
      ['birch', 2],
      ['pine', 3],
      ['bush', 2],
      ['rock', 1],
      ['stump', 1],
      ['fern', 2]
    ],
    w: [1000, 1300],
    fights: 5,
    dusk: [0, 0.85],
    mix: [
      { at: 1, w: { g: 6, r: 2 } },
      { at: 2, w: { g: 5, r: 3, u: 1, f: 1 } },
      { at: 3, w: { g: 4, r: 2, u: 1, f: 2, b: 1 } }
    ],
    mini: {
      t: 'mw',
      chance: 0.04,
      lines: ['WHO STOMPED IN MY WOODS?', 'TIME FOR A NAP!', 'I EAT TWIGS FOR BREAKFAST!']
    }
  },
  sewer: {
    name: 'SEWER TUNNELS',
    look: 'sewer',
    props: [
      ['pipe', 3],
      ['grate', 2],
      ['valve', 2],
      ['barrel', 2],
      ['moss', 2],
      ['ladder', 1]
    ],
    w: [1000, 1250],
    fights: 5,
    slick: 1,
    mix: [
      { at: 3, w: { g: 4, r: 3, f: 2, b: 1 } },
      { at: 4, w: { g: 3, r: 3, f: 2, b: 2, u: 1 } }
    ],
    mini: {
      t: 'ms',
      chance: 0.04,
      lines: ['YOU SMELL LIKE SOAP!', 'SPLASH ZONE!', 'NOBODY LEAVES MY SEWER!']
    }
  },
  castle: {
    name: 'CASTLE KEEP',
    look: 'castle',
    props: [
      ['banner', 3],
      ['torch', 3],
      ['pillar', 2],
      ['shield', 1]
    ],
    w: [1050, 1300],
    fights: 5,
    mix: [
      { at: 5, w: { g: 3, u: 3, f: 2, b: 1, r: 1 } },
      { at: 6, w: { g: 2, u: 3, f: 2, b: 2, r: 1 } }
    ],
    mini: {
      t: 'mc',
      chance: 0.04,
      lines: ['HALT! NONE SHALL PASS!', 'THE GENERAL SENDS HIS REGARDS!', 'GUARDS! ...OH, IT IS JUST ME.']
    }
  },
  beach: {
    name: 'SUNNY BEACH',
    look: 'beach',
    props: [
      ['palm', 4],
      ['shell', 2],
      ['starfish', 1],
      ['crate', 2],
      ['driftwood', 1],
      ['sandcastle', 1]
    ],
    w: [1000, 1300],
    fights: 5,
    mix: [
      { at: 1, w: { g: 6, r: 3 } },
      { at: 2, w: { g: 5, r: 3, f: 2, u: 1 } },
      { at: 3, w: { g: 4, r: 3, f: 2, u: 1, b: 1 } }
    ],
    mini: { t: 'mb', chance: 0.04, lines: ['NO SPLASHING ON MY BEACH!', 'SAND IN YOUR SHOES!', 'SURF IS UP... AND SO ARE MY FISTS!'] }
  },
  ship: {
    name: 'PIRATE SHIP',
    look: 'ship',
    props: [
      ['cannon', 2],
      ['barrel', 2],
      ['crate', 2],
      ['ropecoil', 1],
      ['anchor', 1],
      ['mast', 2]
    ],
    w: [1000, 1250],
    fights: 5,
    mix: [
      { at: 3, w: { g: 4, r: 2, f: 3, b: 1, u: 1 } },
      { at: 4, w: { g: 3, r: 2, f: 3, b: 2, u: 1 } }
    ],
    mini: { t: 'mf', chance: 0.04, lines: ['ALL HANDS ON DECK!', 'SWAB THIS!', 'THE CAPTAIN WILL HEAR OF THIS!'] }
  },
  cave: {
    name: 'TREASURE CAVE',
    look: 'cave',
    props: [
      ['stalagmite', 3],
      ['crystal', 3],
      ['chest', 2],
      ['staketorch', 2],
      ['coins', 2]
    ],
    w: [1050, 1300],
    fights: 5,
    mix: [
      { at: 5, w: { g: 3, f: 2, b: 2, u: 2, r: 1 } },
      { at: 6, w: { g: 2, f: 2, b: 2, u: 3, r: 1 } }
    ],
    mini: { t: 'mt', chance: 0.04, lines: ['MY SHINY! ALL MINE!', 'ECHO... ECHO... GO HOME!', 'NOBODY TOUCHES THE TREASURE!'] }
  },
  meadow: {
    name: 'ALPINE MEADOW',
    look: 'meadow',
    props: [
      ['pine', 3],
      ['flowers', 3],
      ['rock', 2],
      ['fence', 2],
      ['haybale', 1]
    ],
    w: [1000, 1300],
    fights: 5,
    mix: [
      { at: 1, w: { g: 6, r: 2, f: 1 } },
      { at: 2, w: { g: 5, r: 3, f: 2, u: 1 } },
      { at: 3, w: { g: 4, r: 3, f: 2, u: 1, b: 1 } }
    ],
    mini: { t: 'mh', chance: 0.04, lines: ['GET OFF MY HILL!', 'THE HILLS ARE ALIVE... WITH PUNCHING!', 'YODEL-AY-HEE-HOO!'] }
  },
  slope: {
    name: 'MOUNTAINSIDE',
    look: 'slope',
    props: [
      ['rock', 3],
      ['boulder', 2],
      ['cairn', 2],
      ['pine', 2],
      ['flowers', 1]
    ],
    w: [1600, 1900],
    fights: 4,
    climb: [0.13, 0.3],
    mix: [
      { at: 3, w: { g: 4, r: 3, f: 2, b: 1 } },
      { at: 4, w: { g: 3, r: 3, f: 2, b: 2, u: 1 } }
    ],
    mini: { t: 'mr', chance: 0.05, lines: ['ROCK AND ROLL!', 'WATCH YOUR STEP!', 'IT IS ALL DOWNHILL FROM HERE!'] }
  },
  peak: {
    name: 'SNOWY PEAK',
    look: 'peak',
    props: [
      ['snowpine', 3],
      ['snowman', 1],
      ['flag', 2],
      ['iceblock', 2],
      ['cairn', 1]
    ],
    w: [1050, 1300],
    fights: 5,
    slick: 1,
    mix: [
      { at: 5, w: { g: 3, u: 2, f: 2, b: 2, r: 1 } },
      { at: 6, w: { g: 2, u: 3, f: 2, b: 2, r: 1 } }
    ],
    mini: { t: 'mi', chance: 0.04, lines: ['BRRR! YOU ARE IN TROUBLE!', 'CHILL OUT!', 'SNOW WAY YOU GET PAST ME!'] }
  },
  base: {
    name: 'LAUNCH BASE',
    look: 'base',
    props: [
      ['radar', 2],
      ['fueltank', 2],
      ['crate', 2],
      ['cone', 2],
      ['lamp', 2]
    ],
    w: [1000, 1300],
    fights: 5,
    mix: [
      { at: 1, w: { g: 6, r: 2, f: 1 } },
      { at: 2, w: { g: 5, r: 3, f: 2, u: 1 } },
      { at: 3, w: { g: 4, r: 3, f: 2, u: 1, b: 1 } }
    ],
    mini: { t: 'mk', chance: 0.04, lines: ['NO TICKET, NO ROCKET!', 'THIS AREA IS OFF LIMITS!', 'T-MINUS ONE PUNCH!'] }
  },
  rocket: {
    name: 'THE ROCKET',
    look: 'rocket',
    props: [
      ['panel', 3],
      ['porthole', 3],
      ['tank', 2],
      ['crate', 1],
      ['plant', 1]
    ],
    w: [1000, 1250],
    fights: 5,
    mix: [
      { at: 3, w: { g: 4, r: 3, f: 2, b: 1 } },
      { at: 4, w: { g: 3, r: 3, f: 2, b: 2, u: 1 } }
    ],
    mini: { t: 'mx', chance: 0.04, lines: ['HOUSTON, YOU HAVE A PROBLEM!', 'STOWAWAYS!', 'BUCKLE UP!'] }
  },
  moon: {
    name: 'THE MOON',
    look: 'moon',
    helmet: 1,
    lowg: 0.65,
    props: [
      ['crater', 3],
      ['moonrock', 3],
      ['moonflag', 1],
      ['antenna', 2],
      ['lander', 1]
    ],
    w: [1050, 1300],
    fights: 5,
    mix: [
      { at: 5, w: { g: 3, u: 2, f: 2, b: 2, r: 1 } },
      { at: 6, w: { g: 2, u: 3, f: 2, b: 2, r: 1 } }
    ],
    mini: { t: 'mn', chance: 0.04, lines: ['ONE SMALL STEP... FOR YOUR DOOM!', 'NO AIR UP HERE, NO MERCY EITHER!', 'THE MOON IS MINE!'] }
  },
  jungle: {
    name: 'TIKI JUNGLE',
    look: 'jungle',
    vents: 1,
    props: [
      ['palm', 4],
      ['fern', 3],
      ['tikitorch', 3],
      ['tikistatue', 1],
      ['hibiscus', 2],
      ['rock', 1]
    ],
    w: [1000, 1300],
    fights: 5,
    mix: [
      { at: 1, w: { g: 6, r: 2, f: 1 } },
      { at: 2, w: { g: 5, r: 3, f: 2, u: 1 } },
      { at: 3, w: { g: 4, r: 3, f: 2, u: 1, b: 1 } }
    ],
    mini: { t: 'mj', chance: 0.04, lines: ['THIS IS MY JUNGLE, BUDDY!', 'ME BIG. YOU SMALL.', 'WHO WANTS A COCONUT... TO THE FACE?'] }
  },
  ashslope: {
    name: 'ASHY SLOPES',
    look: 'ash',
    rocks: 1,
    props: [
      ['rock', 2],
      ['boulder', 2],
      ['deadtree', 2],
      ['fumarole', 2],
      ['lavarock', 2]
    ],
    w: [1600, 1900],
    fights: 4,
    climb: [0.12, 0.28],
    mix: [
      { at: 3, w: { g: 4, r: 3, f: 2, b: 1 } },
      { at: 4, w: { g: 3, r: 3, f: 2, b: 2, u: 1 } }
    ],
    mini: { t: 'ma', chance: 0.05, lines: ['HOT ROCKS INCOMING!', 'ASH YOU LIKE IT!', 'THE MOUNTAIN IS ANGRY... AND SO AM I!'] }
  },
  crater: {
    name: 'THE CRATER',
    look: 'crater',
    ledges: 1,
    descent: 1,
    enter: 'rim',
    props: [
      ['obsidian', 3],
      ['magma', 3],
      ['tikihead', 1],
      ['lavafall', 2],
      ['crystal', 1]
    ],
    w: [1300, 1500],
    fights: 4,
    mix: [
      { at: 5, w: { g: 3, u: 2, f: 2, b: 2, r: 1 } },
      { at: 6, w: { g: 2, u: 3, f: 2, b: 2, r: 1 } }
    ],
    mini: { t: 'mv', chance: 0.05, lines: ['DINNER IS SERVED... HOT!', 'NOBODY LEAVES THE CRATER!', 'I EAT LAVA FOR BREAKFAST!'] }
  }
};
// ===== TRANSITIONS between biomes =====
// Each theme lists the ones it can use (THEMES[].trans); between two biomes one is picked at random among those.
//   cine   1 = a short scene plays (players ride it); 0 = you break through and walk on
//   gap    pixels of world between the two biomes (the rope swings over a chasm)
//   needs  only between these biomes (either side)
const TRANSITIONS = {
  catapult: { cine: 1, gap: 700 },
  cannon: { cine: 1, gap: 700, needs: ['ship'] },
  pipe: { cine: 1, gap: 700, needs: ['sewer'] },
  rope: { cine: 1, gap: 340 },
  gate: { cine: 0, gap: 0, hp: 60, needs: ['sewer', 'castle'] },
  balloon: { cine: 1, gap: 700 },
  gondola: { cine: 1, gap: 700 },
  climb: { cine: 1, gap: 700 },
  // the launch: jump up the platforms of the launch tower to the rocket, then blast off (tower: 1 builds the
  // platforms; the scene starts when someone stands on the top deck)
  launch: { cine: 1, gap: 700, needs: ['base'], tower: 1 },
  landing: { cine: 1, gap: 700, needs: ['moon'] },
  // the geyser: everyone stands on a giant steam vent and gets blasted up and over to the next biome
  geyser: { cine: 1, gap: 700, needs: ['jungle'] },
  // the crater's rim: everyone jumps in and lands on the top ledge of the climb down (the crater's enter)
  rim: { cine: 1, gap: 700, needs: ['crater'] }
};
// ===== THEMES =====
//   c      the theme's colour (its card on the Campaign screen)
//   trans  the transitions this theme can use between its biomes (TRANSITIONS)
//   boss   the main boss at the end: enemy type, how it arrives (intro: 'pencil' is drawn in, 'jump' leaps in and
//          knocks everyone down, 'beam' is beamed down from a flying saucer, 'erupt' bursts out of the lava), who comes
//          with it, and its lines
//          escape: at his last bit of health he stops the fight, says one of these pairs of lines, and the lava
//          rises: everyone climbs out of the crater on rock ledges and finishes him at the rim (top: what he says
//          when the first player gets there)
const THEMES = {
  castle: {
    name: 'CASTLE SIEGE',
    c: '#ff4fa3',
    biomes: ['woods', 'sewer', 'castle'],
    trans: ['catapult', 'pipe', 'rope', 'gate'],
    boss: {
      t: 'G',
      intro: 'pencil',
      adds: ['g', 'g', 'u', 'r', 'g', 'f'],
      lines: ['SO, YOU FINALLY MADE IT.', 'MY ARMY IS PINK AND PROUD!', 'THIS CASTLE IS MINE!']
    }
  },
  pirate: {
    name: 'PIRATE COVE',
    c: '#3ec5ff',
    biomes: ['beach', 'ship', 'cave'],
    trans: ['catapult', 'cannon', 'rope', 'balloon'],
    boss: {
      t: 'P',
      intro: 'jump',
      adds: ['g', 'r', 'f', 'g', 'b', 'f'],
      lines: ['ARRR! THAT TREASURE BE MINE!', 'YE CAME A LONG WAY FOR NOTHING!', 'PREPARE TO BE PLUNDERED!']
    }
  },
  mountain: {
    name: 'MOUNTAIN',
    c: '#7fbf5f',
    biomes: ['meadow', 'slope', 'peak'],
    trans: ['gondola', 'balloon', 'climb', 'rope'],
    boss: {
      t: 'Y',
      intro: 'jump',
      adds: ['g', 'r', 'b', 'g', 'u', 'f'],
      lines: ['WHO DARES CLIMB MY MOUNTAIN?', 'THE VIEW IS GREAT. ENJOY IT WHILE YOU CAN!', 'I AM THE KING OF THE PEAK!']
    }
  },
  space: {
    name: 'SPACE',
    c: '#8f7bff',
    biomes: ['base', 'rocket', 'moon'],
    trans: ['launch', 'landing'],
    boss: {
      t: 'Z',
      intro: 'beam',
      adds: ['g', 'f', 'u', 'r', 'b', 'f'],
      lines: ['GREETINGS, EARTHLINGS. GOODBYE, EARTHLINGS!', 'TAKE ME TO YOUR... NEVER MIND.', 'THIS MOON IS PINK NOW!']
    }
  },
  volcano: {
    name: 'VOLCANO',
    c: '#ff5a1f',
    biomes: ['jungle', 'ashslope', 'crater'],
    trans: ['geyser', 'rope', 'balloon', 'rim'],
    boss: {
      t: 'K',
      intro: 'erupt',
      adds: ['g', 'r', 'f', 'g', 'b', 'u'],
      lines: ['ALOHA... AND GOODBYE!', 'WHO DARES WAKE THE BIG TIKI?', 'THIS VOLCANO IS PINK TO THE CORE!'],
      escape: {
        lines: [
          ['TIME OUT! TIKI TIME OUT!', 'OOPS... I MAY HAVE LEFT THE VOLCANO ON.'],
          ['OKAY, OKAY! YOU WIN... ALMOST!', 'HOPE YOU LIKE IT HOT. BYE!'],
          ['STOP! MY GRASS SKIRT IS ON FIRE!', '...AND SO IS THE VOLCANO. SEE YA!']
        ],
        top: ['YOU MADE IT?! UH... NICE WEATHER?', 'NO FAIR! NO CLIMBING!', 'WAIT, I WAS JUST LEAVING!']
      }
    }
  }
};
