// StickFighters: Versus and Arcade stages (plain data; stages.js builds and draws them). One screen each (W wide,
// the floor at G). Their layouts are borrowed from the best-liked fighting-game stages; the look is the game's own.
//   tag     its short name on the room's tile
//   look    the place it looks like (LOOKS in biomes.js; 'paper' = the plain notebook page Arcade always had)
//   plats   platforms you can jump up through and stand on: [x1, x2, height above the floor]
//   move    a platform that moves: { i: which one, ax: 'x' or 'y', a: how far each way, p: frames for a round trip }
const STAGES = [
  { id: 'paper', tag: 'PAPER', name: 'NOTEBOOK', look: 'paper', plats: [] },
  { id: 'clearing', tag: 'WOODS', name: 'THE CLEARING', look: 'woods', plats: [] },
  // three platforms: two low at the sides, one high in the middle
  {
    id: 'treehouse',
    tag: 'TREES',
    name: 'TREEHOUSE',
    look: 'meadow',
    plats: [
      [150, 330, 105],
      [570, 750, 105],
      [360, 540, 210]
    ]
  },
  // two low platforms out at the sides, open in the middle
  {
    id: 'yard',
    tag: 'CASTLE',
    name: 'CASTLE YARD',
    look: 'castle',
    plats: [
      [90, 280, 110],
      [620, 810, 110]
    ]
  },
  // one platform that drifts slowly from side to side
  { id: 'rooftop', tag: 'ROOF', name: 'ROOFTOP', look: 'city', plats: [[350, 550, 130]], move: { i: 0, ax: 'x', a: 230, p: 600 } },
  // a big ship of decks at different heights
  {
    id: 'ship',
    tag: 'SHIP',
    name: 'PIRATE SHIP',
    look: 'ship',
    plats: [
      [30, 250, 95],
      [650, 870, 95],
      [300, 600, 185],
      [390, 510, 260]
    ]
  },
  // two side platforms and a top one that floats up and down
  {
    id: 'moonbase',
    tag: 'MOON',
    name: 'MOON BASE',
    look: 'moon',
    plats: [
      [120, 300, 110],
      [600, 780, 110],
      [360, 540, 200]
    ],
    move: { i: 2, ax: 'y', a: 45, p: 420 }
  }
];
const STAGE = Object.fromEntries(STAGES.map(s => [s.id, s]));
