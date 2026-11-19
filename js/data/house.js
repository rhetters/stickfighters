// Orange vs. the Pink Army: House builder data (plain data; VISION.md rule R3)
// ===== HOUSE =====
// A house is a big side view built on squares: c counts from the left edge of the land, r up from the floor (row 0
// sits on the floor line G). Each square has layers, back to front: a wall material filling the square (scenery), a
// barrier (a floor along its bottom edge, or stairs; fighters stand on them, terrain.js), a fill (a material painted
// inside the stairs' outline), and a side wall (a barrier along its right edge nobody walks through). Barriers are
// drawn as black lines. Furniture and decorations are placed by their bottom-left square.
// Everything placed costs stars and erasing gives them all back; backgrounds are bought once (store items in
// items.js, sections hbg / hfurn / hdecor). The land grows as you build, up to maxCols x maxRows.
// Saved as { bg, cells, solids, fills, sides: { "c,r": id }, items: [{ id, x, y }] }.
const HGRID = { cell: 45, maxCols: 240, maxRows: 60, viewCols: 20, grow: 12 };
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
// Barriers. layer = where it's kept: solids (what you stand on) or sides (a side wall on the square's right edge)
const HSOLIDS = [
  { id: 'floor', name: 'Floor', price: 2, layer: 'solids' },
  { id: 'side', name: 'Side Wall', price: 2, layer: 'sides' },
  { id: 'stairR', name: 'Stairs \u2197', price: 3, layer: 'solids' },
  { id: 'stairL', name: 'Stairs \u2196', price: 3, layer: 'solids' },
  { id: 'spiralR', name: 'Spiral \u2197', price: 4, layer: 'solids' },
  { id: 'spiralL', name: 'Spiral \u2196', price: 4, layer: 'solids' }
];
const HSOLID = Object.fromEntries(HSOLIDS.map(t => [t.id, t]));
const isStair = id => !!id && id !== 'floor' && id !== 'side';
const HOUSE_MAX_ITEMS = 500,
  HOUSE_MAX_SQUARES = 8000;
