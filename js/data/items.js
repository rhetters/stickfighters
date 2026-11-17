// Orange vs. the Pink Army: Cosmetics, colors, stances and star drops (plain data; VISION.md rules R3 and R8)
// ===== ITEMS (M10) =====
// Store items are cosmetic only: nothing here changes how a fighter plays.
// An item: { id (never rename it, saves keep it), slot, name, price in ninja stars, c / c2 colors, how }
//   how missing     = buy it in the store for `price`
//   how.free        = everyone owns it from the start
//   how.lvl         = unlocked by clearing that level      how.combo = by landing a combo that long
//   how.wave        = by reaching that Arcade wave         how.vs    = by winning a Versus match
//   how.drop        = only from gifts that Captains drop (random, one you don't own yet)
const SLOTS = [
  { id: 'color', name: 'Colors' },
  { id: 'hat', name: 'Hats' },
  { id: 'band', name: 'Bands' },
  { id: 'scarf', name: 'Scarves' },
  { id: 'gloves', name: 'Gloves' },
  { id: 'shoes', name: 'Shoes' },
  { id: 'trail', name: 'Trails' },
  { id: 'pose', name: 'Victory' }
];
const ITEMS = [
  // body colors: all of them stand out against the pink army
  { id: 'col-orange', slot: 'color', name: 'Orange', c: '#ff7a00', how: { free: 1 } },
  { id: 'col-sky', slot: 'color', name: 'Sky Blue', c: '#2fb5ff', how: { free: 1 } },
  { id: 'col-green', slot: 'color', name: 'Green', c: '#3ccf6e', how: { free: 1 } },
  { id: 'col-purple', slot: 'color', name: 'Purple', c: '#a36bff', how: { free: 1 } },
  { id: 'col-red', slot: 'color', name: 'Red', c: '#e8212b', how: { free: 1 } },
  { id: 'col-gold', slot: 'color', name: 'Gold', c: '#f2b600', how: { free: 1 } },
  { id: 'col-teal', slot: 'color', name: 'Teal', c: '#0fa39a', price: 40 },
  { id: 'col-lime', slot: 'color', name: 'Lime', c: '#8cc800', price: 40 },
  { id: 'col-navy', slot: 'color', name: 'Navy', c: '#2a55c9', price: 40 },
  { id: 'col-cyan', slot: 'color', name: 'Cyan', c: '#00bcd4', price: 40 },
  { id: 'col-brown', slot: 'color', name: 'Brown', c: '#8a5a2b', price: 60 },
  { id: 'col-slate', slot: 'color', name: 'Slate', c: '#4a5262', price: 80 },
  // hats
  { id: 'hat-cap', slot: 'hat', name: 'Ball Cap', c: '#e8212b', price: 40 },
  { id: 'hat-beanie', slot: 'hat', name: 'Beanie', c: '#2a55c9', c2: '#ffd400', price: 40 },
  { id: 'hat-party', slot: 'hat', name: 'Party Hat', c: '#3ccf6e', c2: '#ffd400', price: 60 },
  { id: 'hat-headphones', slot: 'hat', name: 'Headphones', c: '#1c1626', c2: '#ff7a00', price: 80 },
  { id: 'hat-chef', slot: 'hat', name: 'Chef Hat', c: '#ffffff', price: 90 },
  { id: 'hat-cowboy', slot: 'hat', name: 'Cowboy Hat', c: '#a8743e', c2: '#6b4420', price: 120 },
  { id: 'hat-top', slot: 'hat', name: 'Top Hat', c: '#2b2533', c2: '#e8212b', price: 150 },
  { id: 'hat-wizard', slot: 'hat', name: 'Wizard Hat', c: '#4a3cb8', c2: '#ffd400', price: 220 },
  { id: 'hat-ranger', slot: 'hat', name: 'Ranger Hat', c: '#5f8a3a', c2: '#3d5c24', how: { lvl: 'woods1' } },
  { id: 'hat-halo', slot: 'hat', name: 'Halo', c: '#ffd400', how: { wave: 10 } },
  { id: 'hat-viking', slot: 'hat', name: 'Viking Helmet', c: '#9aa3b5', c2: '#f4ead2', how: { drop: 1 } },
  { id: 'hat-propeller', slot: 'hat', name: 'Propeller Cap', c: '#ff7a00', c2: '#2fb5ff', how: { drop: 1 } },
  // headbands: a band and two tails that flutter behind
  { id: 'band-red', slot: 'band', name: 'Red Band', c: '#e8212b', price: 25 },
  { id: 'band-blue', slot: 'band', name: 'Blue Band', c: '#2a55c9', price: 25 },
  { id: 'band-white', slot: 'band', name: 'White Band', c: '#ffffff', price: 35 },
  { id: 'band-black', slot: 'band', name: 'Ninja Band', c: '#2b2533', price: 50 },
  { id: 'band-gold', slot: 'band', name: 'Gold Band', c: '#ffd400', how: { combo: 20 } },
  { id: 'band-rainbow', slot: 'band', name: 'Rainbow Band', c: 'rainbow', how: { drop: 1 } },
  // scarves
  { id: 'scarf-red', slot: 'scarf', name: 'Red Scarf', c: '#e8212b', price: 50 },
  { id: 'scarf-blue', slot: 'scarf', name: 'Blue Scarf', c: '#2a55c9', price: 50 },
  { id: 'scarf-green', slot: 'scarf', name: 'Green Scarf', c: '#3ccf6e', price: 50 },
  { id: 'scarf-stripe', slot: 'scarf', name: 'Striped Scarf', c: '#ffffff', c2: '#e8212b', price: 100 },
  { id: 'scarf-gold', slot: 'scarf', name: 'Gold Scarf', c: '#ffd400', price: 250 },
  { id: 'scarf-royal', slot: 'scarf', name: 'Royal Scarf', c: '#6a2fc9', c2: '#ffd400', how: { drop: 1 } },
  // gloves
  { id: 'gloves-white', slot: 'gloves', name: 'White Gloves', c: '#ffffff', price: 30 },
  { id: 'gloves-red', slot: 'gloves', name: 'Red Boxing Gloves', c: '#e8212b', price: 60 },
  { id: 'gloves-blue', slot: 'gloves', name: 'Blue Boxing Gloves', c: '#2a55c9', price: 60 },
  { id: 'gloves-gold', slot: 'gloves', name: 'Gold Gloves', c: '#ffd400', price: 250 },
  { id: 'gloves-slime', slot: 'gloves', name: 'Slime Gloves', c: '#8cc800', how: { drop: 1 } },
  // shoes
  { id: 'shoes-red', slot: 'shoes', name: 'Red Sneakers', c: '#e8212b', price: 30 },
  { id: 'shoes-blue', slot: 'shoes', name: 'Blue Sneakers', c: '#2a55c9', price: 30 },
  { id: 'shoes-black', slot: 'shoes', name: 'Black Boots', c: '#2b2533', price: 50 },
  { id: 'shoes-gold', slot: 'shoes', name: 'Gold Shoes', c: '#ffd400', price: 250 },
  { id: 'shoes-rocket', slot: 'shoes', name: 'Rocket Shoes', c: '#9aa3b5', c2: '#ff7a00', how: { drop: 1 } },
  // trails: the colour of the swoosh behind big hits
  { id: 'trail-ink', slot: 'trail', name: 'Ink Trail', c: '#1c1626', price: 60 },
  { id: 'trail-fire', slot: 'trail', name: 'Fire Trail', c: 'fire', price: 150 },
  { id: 'trail-ice', slot: 'trail', name: 'Ice Trail', c: 'ice', price: 150 },
  { id: 'trail-gold', slot: 'trail', name: 'Gold Trail', c: '#ffd400', price: 200 },
  { id: 'trail-rainbow', slot: 'trail', name: 'Rainbow Trail', c: 'rainbow', price: 300 },
  { id: 'trail-hearts', slot: 'trail', name: 'Heart Trail', c: 'hearts', how: { drop: 1 } },
  // victory poses: shown when you clear a level or win a Versus round
  { id: 'pose-flex', slot: 'pose', name: 'Flex', how: { free: 1 } },
  { id: 'pose-wave', slot: 'pose', name: 'Wave', price: 40 },
  { id: 'pose-point', slot: 'pose', name: 'Point to the Sky', price: 60 },
  { id: 'pose-bow', slot: 'pose', name: 'Bow', price: 60 },
  { id: 'pose-dance', slot: 'pose', name: 'Dance', price: 120 },
  { id: 'pose-cheer', slot: 'pose', name: 'Champion', how: { vs: 1 } },
  { id: 'pose-spin', slot: 'pose', name: 'Twirl', how: { drop: 1 } }
];
const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));
// Idle stances (cosmetic: only how you stand while waiting). Same pose format as moves.js.
const STANCES = [
  { id: 'classic', name: 'Classic', p: [6, 35, 75, 20, 90, 18, 20, -18, 12, 0] },
  { id: 'boxer', name: 'Boxer', p: [10, 50, 110, 30, 125, 22, 26, -22, 18, 0] },
  { id: 'low', name: 'Low', p: [20, 40, 95, 25, 105, 38, 60, -32, 48, 0] },
  { id: 'loose', name: 'Loose', p: [0, 12, 25, -8, 30, 12, 8, -12, 6, 0] }
];
// A new fighter (and the look of anyone without a saved fighter)
const FIGHTER0 = {
  name: 'ORANGE',
  col: 'col-orange',
  head: 1,
  lw: 7,
  stance: 'classic',
  eq: { hat: null, band: null, scarf: null, gloves: null, shoes: null, trail: null, pose: 'pose-flex' }
};
// Ninja stars dropped per enemy type [min, max]; plus 1 more for every 10 hits of combo (up to 5 more)
const STAR_DROP = { g: [1, 2], r: [2, 3], b: [8, 12], u: [4, 6], f: [3, 5], c: [20, 30] };
// Stars for finishing things
const STAR_BONUS = { levelFirst: 50, level: 20, wavePer: 1 };
