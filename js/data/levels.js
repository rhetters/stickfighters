// StickFighters: Level data (plain JSON-compatible objects; never code, VISION.md rule R3)
// ===== LEVELS =====
// A level is an ordered list of chunks. A chunk is one stretch of trail:
//   w      width in pixels (the screen is 900 wide)
//   dusk   0 = morning light, 1 = dusk; the sky blends between chunks as you walk
//   flies  1 = fireflies in this chunk
//   props  scenery drawn behind the fighters: { k: kind, x: position in the chunk, s: size, t: text }
//          kinds: tree, birch, pine, bush, rock, stump, fern, sign, arch
//   enc    an encounter: the camera stops so that x = at is the middle of the screen, and the list of enemies
//          drops in from the treetops, at most `max` fighting at once. lvl = toughness (same scale as Arcade waves).
//   gate   an obstacle that blocks the trail until broken: { k: 'log', x, hp }
// The planned level creator saves chunks in this same format, and procedural runs will pick chunks from pools.
const CHUNKS = {
  trailhead: {
    w: 1100,
    dusk: 0,
    props: [
      { k: 'tree', x: 60, s: 1.15 },
      { k: 'sign', x: 300, t: 'WOODED TRAIL' },
      { k: 'bush', x: 470 },
      { k: 'fern', x: 610 },
      { k: 'tree', x: 760, s: 0.95 },
      { k: 'rock', x: 990 }
    ],
    enc: { at: 820, lvl: 1, max: 3, list: ['g', 'g', 'g'] }
  },
  birches: {
    w: 1200,
    dusk: 0.1,
    props: [
      { k: 'birch', x: 120, s: 1 },
      { k: 'birch', x: 210, s: 0.8 },
      { k: 'bush', x: 420 },
      { k: 'birch', x: 700, s: 1.1 },
      { k: 'stump', x: 880 },
      { k: 'birch', x: 1080, s: 0.9 }
    ],
    enc: { at: 650, lvl: 1, max: 4, list: ['g', 'r', 'g', 'r', 'g'] }
  },
  fallenlog: {
    w: 1100,
    dusk: 0.25,
    props: [
      { k: 'pine', x: 90, s: 1.1 },
      { k: 'rock', x: 300 },
      { k: 'pine', x: 560, s: 0.9 },
      { k: 'fern', x: 760 },
      { k: 'pine', x: 1040, s: 1.2 }
    ],
    enc: { at: 380, lvl: 2, max: 4, list: ['g', 'u', 'g', 'g'] },
    gate: { k: 'log', x: 880, hp: 40 }
  },
  clearing: {
    w: 1300,
    dusk: 0.45,
    props: [
      { k: 'tree', x: 70, s: 1 },
      { k: 'stump', x: 380 },
      { k: 'fern', x: 520 },
      { k: 'bush', x: 820 },
      { k: 'tree', x: 1180, s: 1.2 }
    ],
    enc: { at: 650, lvl: 2, max: 4, list: ['f', 'g', 'r', 'f', 'b', 'g'] }
  },
  grove: {
    w: 1300,
    dusk: 0.75,
    flies: 1,
    props: [
      { k: 'pine', x: 60, s: 1.2 },
      { k: 'tree', x: 300, s: 1.1 },
      { k: 'rock', x: 560 },
      { k: 'tree', x: 1000, s: 1 },
      { k: 'pine', x: 1230, s: 1.3 }
    ],
    enc: { at: 700, lvl: 3, max: 5, list: ['u', 'g', 'f', 'b', 'g', 'c'] }
  },
  trailend: {
    w: 900,
    dusk: 0.9,
    flies: 1,
    props: [
      { k: 'bush', x: 140 },
      { k: 'pine', x: 360, s: 1 },
      { k: 'arch', x: 640, t: 'SEWER ENTRANCE' }
    ]
  }
};
// Versus arena: one screen, no fights scripted.
CHUNKS.arena = {
  w: 900,
  dusk: 0.35,
  props: [
    { k: 'tree', x: 40, s: 1.2 },
    { k: 'stump', x: 250 },
    { k: 'fern', x: 470 },
    { k: 'rock', x: 640 },
    { k: 'tree', x: 870, s: 1.1 }
  ]
};
const LEVELS = {
  woods1: {
    name: 'WOODED TRAIL',
    num: 1,
    theme: 'woods',
    next: 'Sewer Entrance (coming soon)',
    chunks: ['trailhead', 'birches', 'fallenlog', 'clearing', 'grove', 'trailend']
  },
  arena: { name: 'THE CLEARING', num: 0, theme: 'woods', next: '', chunks: ['arena'] }
};
