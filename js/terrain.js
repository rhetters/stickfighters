// Orange vs. the Pink Army: Terrain: one-way floors and stairs above the ground line G. Any mode can set it (the
// house does today; levels with platforms and stairs can use the same thing). With no terrain everyone stands on G.
// ===== TERRAIN =====
// A surface is a line { x1, x2, y1, y2 } (x1 < x2): flat when y1 === y2, a stair ramp otherwise. The rules, like most
// platformers: going up, or walking into a surface from the ground, passes through it; falling onto it from above
// lands on it; standing on it, walking follows it (up and down stairs) and carries on onto a touching surface;
// walking off its end, you fall. Down + Jump drops through. Each fighter keeps f.gy = the height it stands on.
const TERRAIN = { n: 0, cell: 45, b: new Map() }; // b = surfaces by column, for quick lookup
function terrainSet(list) {
  TERRAIN.b = new Map();
  TERRAIN.n = list.length;
  for (const s of list)
    for (let c = Math.floor(s.x1 / TERRAIN.cell); c <= Math.floor((s.x2 - 0.01) / TERRAIN.cell); c++) {
      if (!TERRAIN.b.has(c)) TERRAIN.b.set(c, []);
      TERRAIN.b.get(c).push(s);
    }
}
const surfY = (s, x) => s.y1 + ((s.y2 - s.y1) * (x - s.x1)) / (s.x2 - s.x1);
function surfAt(x) {
  const c = Math.floor(x / TERRAIN.cell),
    out = [];
  for (const k of [c - 1, c, c + 1])
    for (const s of TERRAIN.b.get(k) || []) if (x >= s.x1 && x <= s.x2) out.push(s);
  return out;
}
// The surface height closest to y within tol (walking along), or null
function surfNear(x, y, tol) {
  let best = null;
  for (const s of surfAt(x)) {
    const sy = surfY(s, x);
    if (Math.abs(sy - y) <= tol && (best === null || Math.abs(sy - y) < Math.abs(best - y))) best = sy;
  }
  return best;
}
// The highest surface crossed falling from y0 to y1, or null
function surfCross(x, y0, y1) {
  let best = null;
  for (const s of surfAt(x)) {
    const sy = surfY(s, x);
    if (y0 <= sy + 0.5 && y1 >= sy && (best === null || sy < best)) best = sy;
  }
  return best;
}
// One physics step's terrain check (called by phys between moving and landing). y0 = feet height before the move.
function terrainStep(f, y0) {
  if (f.drop > 0) f.drop--;
  const was = f.gy,
    standing = was < G && y0 >= was - 0.5;
  if (standing && f.vy >= 0) {
    const s = surfNear(f.x, was, Math.abs(f.vx) + 6);
    if (s !== null) {
      f.gy = s;
      f.y = Math.max(f.y, s); // stick to the surface going down stairs; the landing check puts us on it
    } else f.gy = G; // walked off the end
  } else if (f.vy > 0 && !f.drop && y0 < was - 0.5) {
    const s = surfCross(f.x, y0, f.y);
    f.gy = s === null ? G : s;
  } else if (f.vy < 0) f.gy = G;
}
// Drop through the surface you stand on (Down + Jump)
function terrainDrop(f) {
  if (f.gy >= G) return false;
  f.drop = 12;
  f.gy = G;
  f.y += 1;
  return true;
}
