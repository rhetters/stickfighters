// StickFighters: the level creator's limits and choices (plain data; VISION.md rule R3). Rhett's levels are data
// too (editor.js checks every one when it's loaded and never runs anything from it).
// A level: { id, name, places: [place], boss? }
// A place (one of the 15 biomes in data/themes.js; a transition picked at random carries you to the next one):
//   b      the biome's id
//   parts  [part], played left to right
// A part (one stretch of a place):
//   w      width in pixels (a whole number of grid squares)
//   plats  platforms: [{ x1, x2, h }], x in pixels from the part's start, h = how many squares above the ground
//   props  scenery: [{ k (one of the place's props), x, s (size), l (layer: 'z' far background, 'f' foreground;
//          none = background, behind the fighters) }]
//   foes   the fight's enemies: [{ t (an enemy type), x }]; they drop in over x when the fight starts
//   at     the fight flag: where the fight stops the screen (only with foes)
// boss: { t (one of ED_BOSSES), x } in the level's very last part (the last part of its last place); its fight is
//   that part's fight
const ED_LIM = { levels: 12, places: 3, parts: 6, cols: [15, 40], plats: 12, foes: 10, props: 16, name: 16 };
const ED_CELL = 60; // a grid square, in pixels
const ED_ROWS = 5; // platforms go 1 to 5 squares above the ground
// The pink army types you can place (and each place's own mini-boss, BIOMES[b].mini.t)
const ED_FOES = ['g', 'r', 'u', 'b', 'f', 'c'];
// The main bosses you can put at the end of a level (each story's boss; they arrive the way they do in their story)
const ED_BOSSES = ['G', 'P', 'Y', 'Z', 'K'];
// Scenery layers, back to front: far background (small and drifting slower), background, foreground (in front of the
// fighters; see-through while someone is behind it)
const ED_LAYERS = [
  ['z', 'FAR BACK'],
  ['b', 'BACK'],
  ['f', 'FRONT']
];
// What a place's platforms are made of (biomes.js drawPlatforms; any other place: wooden planks)
const ED_PLAT = {
  sewer: 'stone',
  castle: 'stone',
  cave: 'stone',
  slope: 'stone',
  ashslope: 'stone',
  peak: 'ice',
  base: 'metal',
  rocket: 'metal',
  moon: 'metal',
  crater: 'rock'
};
