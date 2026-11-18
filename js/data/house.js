// Orange vs. the Pink Army: House builder data (plain data; VISION.md rule R3)
// ===== HOUSE =====
// A house is a side view on a grid of squares above the floor: wall squares painted in a material (each square
// costs stars), a background behind them, and furniture and decorations placed on the grid. Backgrounds, furniture
// and decorations are store items (items.js, sections hbg / hfurn / hdecor); wall materials are bought per square.
// Saved as { bg: item id, cells: { "col,row": material id }, items: [{ id, x, y }] } (x, y = top-left square).
const HGRID = { cols: 20, rows: 7, cell: 45, top: G - 7 * 45 }; // the grid sits on the floor line G
const HTILES = [
  { id: 'wood', name: 'Wood', c: '#d39a5e', c2: '#a96e3a', price: 2 },
  { id: 'plaster', name: 'Plaster', c: '#f3e6cf', c2: '#d9c8a9', price: 2 },
  { id: 'pink', name: 'Pink Paint', c: '#ffb3c7', c2: '#e88aa4', price: 2 },
  { id: 'brick', name: 'Brick', c: '#c8553d', c2: '#9e3a28', price: 3 },
  { id: 'stone', name: 'Stone', c: '#b4b4bd', c2: '#85858f', price: 3 },
  { id: 'roof', name: 'Roof', c: '#5b5f8f', c2: '#3f4270', price: 3 },
  { id: 'glass', name: 'Window', c: '#cdeeff', c2: '#7fc4ee', price: 4 }
];
const HTILE = Object.fromEntries(HTILES.map(t => [t.id, t]));
const HOUSE_MAX_ITEMS = 60;
