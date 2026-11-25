// StickFighters: the level creator's limits and choices (plain data; VISION.md rule R3). Rhett's levels are data
// too (editor.js checks every one when it's loaded and never runs anything from it).
// A level: { id, name, b (a biome id from data/themes.js), parts: [part] }
// A part (one stretch of the level, played left to right):
//   w      width in pixels (a whole number of grid squares)
//   plats  platforms: [{ x1, x2, h }], x in pixels from the part's start, h = how many squares above the ground
//   props  scenery: [{ k (one of the biome's props), x, s (size) }]
//   foes   the fight's enemies: [{ t (an enemy type), x }]; they drop in over x when the fight starts
//   at     the fight flag: where the fight stops the screen (only with foes)
//   pool   1 = this part can turn up in generated stories through its biome (only with foes)
const ED_LIM = { levels: 12, parts: 6, cols: [15, 40], plats: 12, foes: 10, props: 16, name: 16, pool: 24 };
const ED_CELL = 60; // a grid square, in pixels
const ED_ROWS = 5; // platforms go 1 to 5 squares above the ground
// The pink army types you can place (and each place's own mini-boss, BIOMES[b].mini.t)
const ED_FOES = ['g', 'r', 'u', 'b', 'f', 'c'];
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
// The chance that a fight in a generated story is one of Rhett's parts for that biome (when he has any)
const ED_POOL_CHANCE = 0.4;
