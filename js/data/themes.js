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
//   dusk     [start, end] light over the biome (woods: morning to dusk)
//   prog     a level id this biome also completes (keeps old unlocks like the Ranger Hat working)
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
      ['window', 2],
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
      ['torch', 2],
      ['coins', 2]
    ],
    w: [1050, 1300],
    fights: 5,
    mix: [
      { at: 5, w: { g: 3, f: 2, b: 2, u: 2, r: 1 } },
      { at: 6, w: { g: 2, f: 2, b: 2, u: 3, r: 1 } }
    ],
    mini: { t: 'mt', chance: 0.04, lines: ['MY SHINY! ALL MINE!', 'ECHO... ECHO... GO HOME!', 'NOBODY TOUCHES THE TREASURE!'] }
  }
};
// ===== TRANSITIONS between biomes (one picked at random among those that fit) =====
//   cine   1 = a short scene plays (players ride it); 0 = you break through and walk on
//   gap    pixels of world between the two biomes (the rope swings over a chasm)
//   needs  only between these biomes (either side)
const TRANSITIONS = {
  catapult: { cine: 1, gap: 700 },
  cannon: { cine: 1, gap: 700, needs: ['ship'] },
  pipe: { cine: 1, gap: 700, needs: ['sewer'] },
  rope: { cine: 1, gap: 340 },
  gate: { cine: 0, gap: 0, hp: 60, needs: ['sewer', 'castle'] }
};
// ===== THEMES =====
//   c      the theme's colour (its card on the Campaign screen)
//   boss   the main boss at the end: enemy type, how it arrives (intro: 'pencil' is drawn in, 'jump' leaps in and
//          knocks everyone down), who comes with it, and the lines it may say
const THEMES = {
  castle: {
    name: 'CASTLE SIEGE',
    c: '#ff4fa3',
    biomes: ['woods', 'sewer', 'castle'],
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
    boss: {
      t: 'P',
      intro: 'jump',
      adds: ['g', 'r', 'f', 'g', 'b', 'f'],
      lines: ['ARRR! THAT TREASURE BE MINE!', 'YE CAME A LONG WAY FOR NOTHING!', 'PREPARE TO BE PLUNDERED!']
    }
  }
};
