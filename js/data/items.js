// StickFighters: Cosmetics, colors, stances and star drops (plain data; VISION.md rules R3 and R8)
// ===== ITEMS =====
// Store items are cosmetic only: nothing here changes how a fighter plays.
// An item: { id (never rename it, saves keep it), sec (shelf section), name, price in ninja stars, c / c2 colors,
//   k (drawing style), how }
//   how missing     = buy it in the store for `price`
//   how.free        = everyone owns it from the start
//   how.lvl         = unlocked by clearing that level      how.combo = by landing a combo that long
//   how.wave        = by reaching that Arcade wave         how.vs    = by winning a Versus match
//   how.drop        = only from gifts that Captains drop (random, one you don't own yet)
// The character screen's parts of the body (picture tiles) and the kinds (sections) in each; pic = the kind whose
// first item is the part's picture
const TABS = [
  { id: 'body', name: 'Body', secs: [] },
  { id: 'colors', name: 'Colors', secs: ['color'] },
  { id: 'head', name: 'Head', secs: ['hair', 'hat', 'band'], pic: 'hat' },
  { id: 'neck', name: 'Neck', secs: ['scarf', 'tie'] },
  { id: 'upper', name: 'Upper Body', secs: ['shirt', 'jacket', 'gloves'] },
  { id: 'lower', name: 'Lower Body', secs: ['pants', 'shorts', 'skirt', 'dress', 'shoes'] },
  { id: 'surge', name: 'Surge', secs: ['surge'] },
  { id: 'poses', name: 'Poses', secs: ['pose'] }
];
// A section's slot: you wear one item per slot. Pants, shorts, skirts and dresses share the "legs" slot.
const SECS = {
  color: { name: 'Body color', slot: 'color' },
  hair: { name: 'Hair', slot: 'hair' },
  hat: { name: 'Hats', slot: 'hat' },
  band: { name: 'Headbands', slot: 'band' },
  scarf: { name: 'Scarves', slot: 'scarf' },
  tie: { name: 'Ties', slot: 'tie' },
  shirt: { name: 'Shirts', slot: 'shirt' },
  jacket: { name: 'Jackets', slot: 'jacket' },
  gloves: { name: 'Gloves', slot: 'gloves' },
  pants: { name: 'Pants', slot: 'legs', note: 'one of pants, shorts, skirts or dresses' },
  shorts: { name: 'Shorts', slot: 'legs' },
  skirt: { name: 'Skirts', slot: 'legs' },
  dress: { name: 'Dresses', slot: 'legs' },
  shoes: { name: 'Shoes', slot: 'shoes' },
  surge: { name: 'Surge style', slot: 'surge', note: 'the glow and afterimages when you use Surge' },
  pose: { name: 'Poses', slot: 'pose', note: 'up to 8 on your pose wheel; the first is your victory pose' },
  // House builder (sold on the House screen, not the Character screen). w / h = size in grid squares.
  hbg: { name: 'Backgrounds', slot: 'house' },
  hfurn: { name: 'Furniture', slot: 'house' },
  hdecor: { name: 'Decorations', slot: 'house' }
};
// The slots a fighter wears (colour and the pose wheel are kept separately)
const EQ = ['hair', 'hat', 'band', 'scarf', 'tie', 'shirt', 'jacket', 'gloves', 'legs', 'shoes', 'surge'];
const WHEEL_MAX = 8;
const ITEMS = [
  // body colors: all of them stand out against the pink army
  { id: 'col-orange', sec: 'color', name: 'Orange', c: '#ff7a00', how: { free: 1 } },
  { id: 'col-sky', sec: 'color', name: 'Sky Blue', c: '#2fb5ff', how: { free: 1 } },
  { id: 'col-green', sec: 'color', name: 'Green', c: '#3ccf6e', how: { free: 1 } },
  { id: 'col-purple', sec: 'color', name: 'Purple', c: '#a36bff', how: { free: 1 } },
  { id: 'col-red', sec: 'color', name: 'Red', c: '#e8212b', how: { free: 1 } },
  { id: 'col-gold', sec: 'color', name: 'Gold', c: '#f2b600', how: { free: 1 } },
  { id: 'col-teal', sec: 'color', name: 'Teal', c: '#0fa39a', price: 40 },
  { id: 'col-lime', sec: 'color', name: 'Lime', c: '#8cc800', price: 40 },
  { id: 'col-navy', sec: 'color', name: 'Navy', c: '#2a55c9', price: 40 },
  { id: 'col-cyan', sec: 'color', name: 'Cyan', c: '#00bcd4', price: 40 },
  { id: 'col-brown', sec: 'color', name: 'Brown', c: '#8a5a2b', price: 60 },
  { id: 'col-slate', sec: 'color', name: 'Slate', c: '#4a5262', price: 80 },
  // hair (drawn under a hat)
  { id: 'hair-short', sec: 'hair', name: 'Short Hair', c: '#4a3020', price: 30 },
  { id: 'hair-buzz', sec: 'hair', name: 'Buzz Cut', c: '#2b2533', price: 30 },
  { id: 'hair-sidepart', sec: 'hair', name: 'Side Part', c: '#8a5a2b', price: 40 },
  { id: 'hair-spiky', sec: 'hair', name: 'Spiky', c: '#2b2533', price: 40 },
  { id: 'hair-messy', sec: 'hair', name: 'Messy', c: '#6b4420', price: 40 },
  { id: 'hair-flat', sec: 'hair', name: 'Flat Top', c: '#2b2533', price: 40 },
  { id: 'hair-pony', sec: 'hair', name: 'Ponytail', c: '#e0b040', price: 60 },
  { id: 'hair-long', sec: 'hair', name: 'Long Hair', c: '#6b4420', price: 60 },
  { id: 'hair-bun', sec: 'hair', name: 'Bun', c: '#2b2533', price: 50 },
  { id: 'hair-pigtails', sec: 'hair', name: 'Pigtails', c: '#c0561c', price: 60 },
  { id: 'hair-afro', sec: 'hair', name: 'Afro', c: '#2b2533', price: 80 },
  { id: 'hair-mohawk', sec: 'hair', name: 'Mohawk', c: '#2fb5ff', price: 100 },
  // hats
  { id: 'hat-cap', sec: 'hat', name: 'Ball Cap', c: '#e8212b', price: 40 },
  { id: 'hat-beanie', sec: 'hat', name: 'Beanie', c: '#2a55c9', c2: '#ffd400', price: 40 },
  { id: 'hat-party', sec: 'hat', name: 'Party Hat', c: '#3ccf6e', c2: '#ffd400', price: 60 },
  { id: 'hat-headphones', sec: 'hat', name: 'Headphones', c: '#1c1626', c2: '#ff7a00', open: 1, price: 80 },
  { id: 'hat-chef', sec: 'hat', name: 'Chef Hat', c: '#ffffff', price: 90 },
  { id: 'hat-cowboy', sec: 'hat', name: 'Cowboy Hat', c: '#a8743e', c2: '#6b4420', price: 120 },
  { id: 'hat-top', sec: 'hat', name: 'Top Hat', c: '#2b2533', c2: '#e8212b', price: 150 },
  { id: 'hat-wizard', sec: 'hat', name: 'Wizard Hat', c: '#4a3cb8', c2: '#ffd400', price: 220 },
  { id: 'hat-ranger', sec: 'hat', name: 'Ranger Hat', c: '#5f8a3a', c2: '#3d5c24', how: { lvl: 'woods1' } },
  { id: 'hat-halo', sec: 'hat', name: 'Halo', c: '#ffd400', open: 1, how: { wave: 10 } },
  { id: 'hat-viking', sec: 'hat', name: 'Viking Helmet', c: '#9aa3b5', c2: '#f4ead2', how: { drop: 1 } },
  { id: 'hat-propeller', sec: 'hat', name: 'Propeller Cap', c: '#ff7a00', c2: '#2fb5ff', how: { drop: 1 } },
  // headbands: a band and two tails that flutter behind
  { id: 'band-red', sec: 'band', name: 'Red Band', c: '#e8212b', price: 25 },
  { id: 'band-blue', sec: 'band', name: 'Blue Band', c: '#2a55c9', price: 25 },
  { id: 'band-white', sec: 'band', name: 'White Band', c: '#ffffff', price: 35 },
  { id: 'band-black', sec: 'band', name: 'Ninja Band', c: '#2b2533', price: 50 },
  { id: 'band-gold', sec: 'band', name: 'Gold Band', c: '#ffd400', how: { combo: 20 } },
  { id: 'band-rainbow', sec: 'band', name: 'Rainbow Band', c: 'rainbow', how: { drop: 1 } },
  // scarves
  { id: 'scarf-red', sec: 'scarf', name: 'Red Scarf', c: '#e8212b', price: 50 },
  { id: 'scarf-blue', sec: 'scarf', name: 'Blue Scarf', c: '#2a55c9', price: 50 },
  { id: 'scarf-green', sec: 'scarf', name: 'Green Scarf', c: '#3ccf6e', price: 50 },
  { id: 'scarf-stripe', sec: 'scarf', name: 'Striped Scarf', c: '#ffffff', c2: '#e8212b', price: 100 },
  { id: 'scarf-gold', sec: 'scarf', name: 'Gold Scarf', c: '#ffd400', price: 250 },
  { id: 'scarf-royal', sec: 'scarf', name: 'Royal Scarf', c: '#6a2fc9', c2: '#ffd400', how: { drop: 1 } },
  // ties
  { id: 'tie-red', sec: 'tie', name: 'Red Tie', c: '#e8212b', k: 'tie', price: 30 },
  { id: 'tie-blue', sec: 'tie', name: 'Blue Tie', c: '#2a55c9', k: 'tie', price: 30 },
  { id: 'tie-stripe', sec: 'tie', name: 'Striped Tie', c: '#3ccf6e', c2: '#ffd400', k: 'tie', price: 60 },
  { id: 'tie-gold', sec: 'tie', name: 'Gold Tie', c: '#ffd400', k: 'tie', price: 150 },
  { id: 'tie-bow', sec: 'tie', name: 'Bow Tie', c: '#2b2533', k: 'bow', price: 40 },
  { id: 'tie-bowred', sec: 'tie', name: 'Red Bow Tie', c: '#e8212b', k: 'bow', price: 40 },
  // shirts
  { id: 'shirt-white', sec: 'shirt', name: 'White Tee', c: '#ffffff', k: 'tee', price: 30 },
  { id: 'shirt-red', sec: 'shirt', name: 'Red Tee', c: '#e8212b', k: 'tee', price: 30 },
  { id: 'shirt-blue', sec: 'shirt', name: 'Blue Tee', c: '#2a55c9', k: 'tee', price: 30 },
  { id: 'shirt-stripe', sec: 'shirt', name: 'Striped Tee', c: '#ffffff', c2: '#2a55c9', k: 'tee', price: 60 },
  { id: 'shirt-tank', sec: 'shirt', name: 'Tank Top', c: '#3ccf6e', k: 'tank', price: 40 },
  // secret: only from a code in the treasure chest, and not shown on the shelves until it's yours
  { id: 'shirt-rhett', sec: 'shirt', name: "Rhett's Shirt", c: '#2fa84f', k: 'tee', how: { code: 1 } },
  { id: 'shirt-long', sec: 'shirt', name: 'Long Sleeves', c: '#2b2533', k: 'long', price: 50 },
  { id: 'shirt-jersey', sec: 'shirt', name: 'Jersey', c: '#ffd400', c2: '#2a55c9', k: 'tee', price: 90 },
  // jackets
  { id: 'jacket-vest', sec: 'jacket', name: 'Denim Vest', c: '#4f78b8', k: 'vest', price: 60 },
  { id: 'jacket-hoodie', sec: 'jacket', name: 'Hoodie', c: '#9aa3b5', k: 'hoodie', price: 80 },
  { id: 'jacket-gi', sec: 'jacket', name: 'Karate Gi', c: '#ffffff', c2: '#2b2533', k: 'gi', price: 120 },
  { id: 'jacket-leather', sec: 'jacket', name: 'Leather Jacket', c: '#2b2533', k: 'coat', price: 150 },
  {
    id: 'jacket-varsity',
    sec: 'jacket',
    name: 'Varsity Jacket',
    c: '#e8212b',
    c2: '#ffffff',
    k: 'coat',
    price: 150
  },
  { id: 'jacket-cape', sec: 'jacket', name: 'Hero Cape', c: '#e8212b', c2: '#ffd400', k: 'cape', price: 200 },
  // gloves
  { id: 'gloves-white', sec: 'gloves', name: 'White Dots', c: '#ffffff', k: 'dot', price: 20 },
  { id: 'gloves-dotred', sec: 'gloves', name: 'Red Dots', c: '#e8212b', k: 'dot', price: 20 },
  {
    id: 'gloves-mitten',
    sec: 'gloves',
    name: 'Mittens',
    c: '#e8212b',
    c2: '#ffffff',
    k: 'mitten',
    price: 40
  },
  { id: 'gloves-wrap', sec: 'gloves', name: 'Hand Wraps', c: '#ffffff', k: 'wrap', price: 50 },
  { id: 'gloves-work', sec: 'gloves', name: 'Work Gloves', c: '#e8b02a', k: 'work', price: 50 },
  { id: 'gloves-drive', sec: 'gloves', name: 'Driving Gloves', c: '#7a4a22', k: 'drive', price: 70 },
  { id: 'gloves-red', sec: 'gloves', name: 'Red Boxing Gloves', c: '#e8212b', k: 'boxing', price: 60 },
  { id: 'gloves-blue', sec: 'gloves', name: 'Blue Boxing Gloves', c: '#2a55c9', k: 'boxing', price: 60 },
  { id: 'gloves-gold', sec: 'gloves', name: 'Gold Boxing Gloves', c: '#ffd400', k: 'boxing', price: 250 },
  { id: 'gloves-slime', sec: 'gloves', name: 'Slime Mitts', c: '#8cc800', k: 'mitten', how: { drop: 1 } },
  // pants, shorts, skirts, dresses (one at a time)
  { id: 'pants-jeans', sec: 'pants', name: 'Jeans', c: '#3d63a8', k: 'pants', price: 50 },
  { id: 'pants-black', sec: 'pants', name: 'Black Pants', c: '#2b2533', k: 'pants', price: 50 },
  { id: 'pants-khaki', sec: 'pants', name: 'Khakis', c: '#c9a86a', k: 'pants', price: 40 },
  {
    id: 'pants-track',
    sec: 'pants',
    name: 'Track Pants',
    c: '#e8212b',
    c2: '#ffffff',
    k: 'pants',
    price: 80
  },
  { id: 'pants-gi', sec: 'pants', name: 'Gi Pants', c: '#ffffff', k: 'pants', price: 60 },
  { id: 'shorts-blue', sec: 'shorts', name: 'Blue Shorts', c: '#2a55c9', k: 'shorts', price: 30 },
  {
    id: 'shorts-red',
    sec: 'shorts',
    name: 'Gym Shorts',
    c: '#e8212b',
    c2: '#ffffff',
    k: 'shorts',
    price: 30
  },
  { id: 'shorts-cargo', sec: 'shorts', name: 'Cargo Shorts', c: '#8a7a4a', k: 'shorts', price: 40 },
  {
    id: 'shorts-boxer',
    sec: 'shorts',
    name: 'Boxing Trunks',
    c: '#ffd400',
    c2: '#2b2533',
    k: 'shorts',
    price: 120
  },
  { id: 'skirt-blue', sec: 'skirt', name: 'Blue Skirt', c: '#2a55c9', k: 'skirt', price: 40 },
  {
    id: 'skirt-plaid',
    sec: 'skirt',
    name: 'Plaid Skirt',
    c: '#e8212b',
    c2: '#2b2533',
    k: 'skirt',
    price: 70
  },
  { id: 'skirt-tutu', sec: 'skirt', name: 'Tutu', c: '#b98cff', k: 'tutu', price: 90 },
  { id: 'dress-red', sec: 'dress', name: 'Red Dress', c: '#e8212b', k: 'dress', price: 80 },
  { id: 'dress-yellow', sec: 'dress', name: 'Sunny Dress', c: '#ffd400', k: 'dress', price: 80 },
  {
    id: 'dress-dots',
    sec: 'dress',
    name: 'Polka Dot Dress',
    c: '#2a55c9',
    c2: '#ffffff',
    k: 'dress',
    price: 120
  },
  { id: 'dress-gown', sec: 'dress', name: 'Royal Gown', c: '#6a2fc9', c2: '#ffd400', k: 'dress', price: 200 },
  // shoes
  { id: 'shoes-dot', sec: 'shoes', name: 'Black Dots', c: '#2b2533', k: 'dot', price: 20 },
  { id: 'shoes-red', sec: 'shoes', name: 'Red Sneakers', c: '#e8212b', k: 'sneaker', price: 30 },
  { id: 'shoes-blue', sec: 'shoes', name: 'Blue Sneakers', c: '#2a55c9', k: 'sneaker', price: 30 },
  {
    id: 'shoes-hightop',
    sec: 'shoes',
    name: 'High-Tops',
    c: '#e8212b',
    c2: '#ffffff',
    k: 'hightop',
    price: 60
  },
  { id: 'shoes-sandal', sec: 'shoes', name: 'Sandals', c: '#a8743e', k: 'sandal', price: 30 },
  { id: 'shoes-slipper', sec: 'shoes', name: 'Fuzzy Slippers', c: '#d9c8ff', k: 'slipper', price: 70 },
  { id: 'shoes-black', sec: 'shoes', name: 'Black Boots', c: '#2b2533', k: 'boot', price: 50 },
  {
    id: 'shoes-cowboy',
    sec: 'shoes',
    name: 'Cowboy Boots',
    c: '#a8743e',
    c2: '#6b4420',
    k: 'boot',
    price: 90
  },
  { id: 'shoes-gold', sec: 'shoes', name: 'Gold Sneakers', c: '#ffd400', k: 'sneaker', price: 250 },
  {
    id: 'shoes-rocket',
    sec: 'shoes',
    name: 'Rocket Shoes',
    c: '#9aa3b5',
    c2: '#ff7a00',
    k: 'boot',
    how: { drop: 1 }
  },
  // Surge styles: the glow and afterimages when you use Surge (the ids say "trail" for older saves)
  { id: 'trail-ink', sec: 'surge', name: 'Ink Surge', c: '#1c1626', price: 60 },
  { id: 'surge-toxic', sec: 'surge', name: 'Toxic Surge', c: '#62e000', price: 120 },
  { id: 'trail-fire', sec: 'surge', name: 'Fire Surge', c: 'fire', price: 150 },
  { id: 'trail-ice', sec: 'surge', name: 'Ice Surge', c: 'ice', price: 150 },
  { id: 'surge-shadow', sec: 'surge', name: 'Shadow Surge', c: '#6a2fc9', price: 150 },
  { id: 'trail-gold', sec: 'surge', name: 'Gold Surge', c: '#ff9f1a', price: 200 },
  { id: 'surge-bolt', sec: 'surge', name: 'Lightning Surge', c: 'bolt', price: 250 },
  { id: 'trail-rainbow', sec: 'surge', name: 'Rainbow Surge', c: 'rainbow', price: 300 },
  { id: 'trail-hearts', sec: 'surge', name: 'Heart Surge', c: 'hearts', how: { drop: 1 } },
  // poses: put up to 8 on your pose wheel (hold T, Select or POSE in a fight); the first is your victory pose
  { id: 'pose-flex', sec: 'pose', name: 'Flex', how: { free: 1 } },
  { id: 'pose-wave', sec: 'pose', name: 'Wave', how: { free: 1 } },
  { id: 'pose-thumbs', sec: 'pose', name: 'Thumbs Up', price: 30 },
  { id: 'pose-salute', sec: 'pose', name: 'Salute', price: 40 },
  { id: 'pose-point', sec: 'pose', name: 'Point to the Sky', price: 60 },
  { id: 'pose-bow', sec: 'pose', name: 'Bow', price: 60 },
  { id: 'pose-laugh', sec: 'pose', name: 'Laugh', price: 60 },
  { id: 'pose-sit', sec: 'pose', name: 'Sit Down', price: 80 },
  { id: 'pose-kneel', sec: 'pose', name: 'Ninja Kneel', price: 80 },
  { id: 'pose-dance', sec: 'pose', name: 'Dance', price: 120 },
  { id: 'pose-cheer', sec: 'pose', name: 'Champion', how: { vs: 1 } },
  { id: 'pose-spin', sec: 'pose', name: 'Twirl', how: { drop: 1 } },
  // House backgrounds: k = pattern
  { id: 'hbg-paper', sec: 'hbg', name: 'Grid Paper', k: 'paper', c: '#fbfaf4', how: { free: 1 } },
  { id: 'hbg-cream', sec: 'hbg', name: 'Cream', k: 'plain', c: '#f6e7c8', price: 40 },
  { id: 'hbg-mint', sec: 'hbg', name: 'Mint', k: 'plain', c: '#cdeedd', price: 40 },
  { id: 'hbg-stripes', sec: 'hbg', name: 'Stripes', k: 'stripes', c: '#ffe1ea', c2: '#ffc9d8', price: 80 },
  { id: 'hbg-sky', sec: 'hbg', name: 'Sky', k: 'sky', c: '#bfe6ff', c2: '#ffffff', price: 80 },
  { id: 'hbg-sunset', sec: 'hbg', name: 'Sunset', k: 'grad', c: '#ffcf6e', c2: '#ff7a8a', price: 120 },
  { id: 'hbg-night', sec: 'hbg', name: 'Starry Night', k: 'night', c: '#1d2350', c2: '#ffd400', price: 150 },
  // House furniture
  { id: 'hf-chair', sec: 'hfurn', name: 'Chair', k: 'chair', w: 1, h: 1, c: '#c98a4f', how: { free: 1 } },
  { id: 'hf-table', sec: 'hfurn', name: 'Table', k: 'table', w: 2, h: 1, c: '#a96e3a', how: { free: 1 } },
  { id: 'hf-bed', sec: 'hfurn', name: 'Bed', k: 'bed', w: 3, h: 1, c: '#3ec5ff', c2: '#ffffff', price: 100 },
  { id: 'hf-couch', sec: 'hfurn', name: 'Couch', k: 'couch', w: 3, h: 1, c: '#ff7a00', price: 120 },
  { id: 'hf-shelf', sec: 'hfurn', name: 'Bookshelf', k: 'shelf', w: 2, h: 3, c: '#8a5a33', price: 120 },
  { id: 'hf-lamp', sec: 'hfurn', name: 'Lamp', k: 'lamp', w: 1, h: 2, c: '#ffd400', price: 50 },
  { id: 'hf-tv', sec: 'hfurn', name: 'TV', k: 'tv', w: 2, h: 2, c: '#2a2a3a', price: 150 },
  { id: 'hf-door', sec: 'hfurn', name: 'Door', k: 'door', w: 1, h: 2, c: '#a96e3a', price: 30 },
  { id: 'hf-fridge', sec: 'hfurn', name: 'Fridge', k: 'fridge', w: 1, h: 3, c: '#eef3f6', price: 120 },
  // House decorations
  { id: 'hd-plant', sec: 'hdecor', name: 'Plant', k: 'plant', w: 1, h: 1, c: '#3fae4a', how: { free: 1 } },
  { id: 'hd-tree', sec: 'hdecor', name: 'Tall Plant', k: 'tree', w: 1, h: 2, c: '#2f8f3a', price: 60 },
  { id: 'hd-rug', sec: 'hdecor', name: 'Rug', k: 'rug', w: 3, h: 1, c: '#e8212b', c2: '#ffd400', price: 60 },
  { id: 'hd-picture', sec: 'hdecor', name: 'Picture', k: 'picture', w: 1, h: 1, c: '#3ec5ff', price: 40 },
  { id: 'hd-poster', sec: 'hdecor', name: 'Orange Poster', k: 'poster', w: 1, h: 2, c: '#ff7a00', price: 40 },
  { id: 'hd-clock', sec: 'hdecor', name: 'Clock', k: 'clock', w: 1, h: 1, c: '#ffffff', price: 50 },
  { id: 'hd-fish', sec: 'hdecor', name: 'Fish Tank', k: 'fish', w: 2, h: 1, c: '#7fd0ff', price: 150 },
  { id: 'hd-flag', sec: 'hdecor', name: 'Flag', k: 'flag', w: 1, h: 2, c: '#ff7a00', price: 30 },
  {
    id: 'hd-balloon',
    sec: 'hdecor',
    name: 'Hot Air Balloon',
    k: 'balloon',
    w: 3,
    h: 4,
    c: '#e8212b',
    c2: '#ffd400',
    price: 250
  },
  {
    id: 'hd-trophy',
    sec: 'hdecor',
    name: 'Gold Trophy',
    k: 'trophy',
    w: 1,
    h: 1,
    c: '#ffd400',
    how: { wave: 10 }
  }
];
for (const it of ITEMS) it.slot = SECS[it.sec].slot;
const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));
// Idle stances (cosmetic: only how you stand while waiting). Same pose format as moves.js.
// The treasure chest's codes (Character screen, ui/codes.js): four icons, by their place in CODE_ICONS, and the
// item each code gives. Four stars (what the chest starts on) gives Rhett's Shirt.
const CODE_ICONS = ['star', 'shuriken', 'heart', 'crown', 'bolt', 'flame', 'moon', 'drop'];
const CODES = [{ code: [0, 0, 0, 0], item: 'shirt-rhett' }];
const STANCES = [
  { id: 'classic', name: 'Classic', p: [6, 35, 75, 20, 90, 18, 20, -18, 12, 0] },
  { id: 'boxer', name: 'Boxer', p: [10, 50, 110, 30, 125, 22, 26, -22, 18, 0] },
  { id: 'low', name: 'Low', p: [20, 40, 95, 25, 105, 38, 60, -32, 48, 0] },
  { id: 'loose', name: 'Loose', p: [0, 12, 25, -8, 30, 12, 8, -12, 6, 0] }
];
// A new fighter (and the look of anyone without a saved fighter). ht = height (drawing only).
const FIGHTER0 = {
  name: 'ORANGE',
  col: 'col-orange',
  ht: 1,
  head: 1,
  headType: 'donut',
  lw: 7,
  stance: 'classic',
  eq: Object.fromEntries(EQ.map(s => [s, null])),
  wheel: ['pose-flex', 'pose-wave']
};
const FIGHTERS = 4; // saved fighter slots
// Head types: [id, name]. A donut head is a ring; a full head is filled with the fighter's colour.
const HEAD_TYPES = [
  ['donut', 'Donut'],
  ['full', 'Full']
];
// Ninja stars dropped per enemy type [min, max]; plus 1 more for every 10 hits of combo (up to 5 more)
const STAR_DROP = { g: [1, 2], r: [2, 3], b: [8, 12], u: [4, 6], f: [3, 5], c: [20, 30] };
// Stars for finishing things
const STAR_BONUS = { levelFirst: 50, level: 20, wavePer: 1 };
