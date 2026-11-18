// Orange vs. the Pink Army: House builder data (plain data; VISION.md rule R3)
// ===== HOUSE =====
// A house is a big side view built on squares: c counts from the left edge of the land, r up from the floor (row 0
// sits on the floor line G). Each square can hold a wall material (scenery behind you) and a solid (a floor line or
// stairs, which fighters stand on; terrain.js). Furniture and decorations are placed by their bottom-left square.
// Everything placed costs stars and erasing gives them all back; backgrounds are bought once (store items in
// items.js, sections hbg / hfurn / hdecor). The land grows as you build, up to maxCols x maxRows.
// Saved as { bg, cells: { "c,r": material }, solids: { "c,r": solid }, items: [{ id, x, y }] }.
const HGRID = { cell: 45, maxCols: 240, maxRows: 60, viewCols: 20, viewRows: 7, grow: 12 };
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
// Solids: floor = a line along the bottom of the square; stairs rise across the square to the right or the left
const HSOLIDS = [
  { id: 'floor', name: 'Floor', price: 2 },
  { id: 'stairR', name: 'Stairs \u2197', price: 3 },
  { id: 'stairL', name: 'Stairs \u2196', price: 3 }
];
const HSOLID = Object.fromEntries(HSOLIDS.map(t => [t.id, t]));
const HOUSE_MAX_ITEMS = 500,
  HOUSE_MAX_SQUARES = 8000;
