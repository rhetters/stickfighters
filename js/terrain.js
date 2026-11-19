// Orange vs. the Pink Army: Terrain: floors, stairs and walls above the ground line G. Any mode can set it (the
// house does today; levels with platforms and stairs can use the same thing). With no terrain everyone stands on G.
// ===== TERRAIN =====
// A surface is a line { x1, x2, y1, y2 } (x1 < x2): flat when y1 === y2 (a floor), a ramp otherwise (stairs).
// The rules, like most platformers: going up, or walking into a surface from the ground, passes through it; falling
// onto it from above lands on it; holding Up while walking into stairs steps onto them; standing on a surface,
// walking follows it (up and down stairs) and carries on onto a touching surface; walking off its end, you fall.
// Down + Jump drops through. Each fighter keeps f.gy = the height it stands on.
// A wall { x, y1, y2 } (y1 < y2) is a vertical line nobody walks or flies through, from either side.
const TERRAIN = { n: 0, cell: 45, b: new Map(), w: new Map() }; // surfaces and walls by column, for quick lookup
const T_HALF = 14; // half a fighter's width: how close a wall lets a fighter's middle come
function terrainSet(list, walls) {
  const add = (m, c, v) => (m.has(c) ? m.get(c).push(v) : m.set(c, [v]));
  TERRAIN.b = new Map();
  TERRAIN.w = new Map();
  TERRAIN.n = list.length + (walls ? walls.length : 0);
  for (const s of list)
    for (let c = Math.floor(s.x1 / TERRAIN.cell); c <= Math.floor((s.x2 - 0.01) / TERRAIN.cell); c++)
      add(TERRAIN.b, c, s);
  for (const w of walls || []) add(TERRAIN.w, Math.round(w.x / TERRAIN.cell), w);
}
const surfY = (s, x) => s.y1 + ((s.y2 - s.y1) * (x - s.x1)) / (s.x2 - s.x1);
function surfAt(x) {
  const c = Math.floor(x / TERRAIN.cell),
    out = [];
  for (const k of [c - 1, c, c + 1])
    for (const s of TERRAIN.b.get(k) || []) if (x >= s.x1 && x <= s.x2) out.push(s);
  return out;
}
// The surface height closest to y within tol (walking along), or null. ramps = only stairs (stepping on with Up);
// with climb, stairs win a tie with a floor at the same height, so Up turns you onto stairs that start from a floor.
function surfNear(x, y, tol, climb, ramps) {
  let best = null,
    bd = 1e9;
  for (const s of surfAt(x)) {
    if (ramps && s.y1 === s.y2) continue;
    const sy = surfY(s, x),
      d = Math.abs(sy - y) - (climb && s.y1 !== s.y2 ? 0.5 : 0);
    if (Math.abs(sy - y) <= tol && d < bd) {
      best = sy;
      bd = d;
    }
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
// One physics step's terrain check (called by phys between moving and landing). x0, y0 = position before the move.
function terrainStep(f, x0, y0) {
  if (f.drop > 0) f.drop--;
  terrainWalls(f, x0);
  const was = f.gy,
    onSurf = was < G && y0 >= was - 0.5,
    onAny = y0 >= was - 0.5,
    tol = Math.abs(f.vx) + 6;
  if (onSurf && f.vy >= 0) {
    const s = surfNear(f.x, was, tol, f.climb);
    if (s !== null) {
      f.gy = s;
      f.y = Math.max(f.y, s); // stick to the surface going down stairs; the landing check puts us on it
    } else f.gy = G; // walked off the end
  } else if (onAny && f.vy >= 0 && f.climb && !f.drop) {
    // on the ground, holding Up: step onto stairs that start at your feet
    const s = surfNear(f.x, was, tol, true, true);
    if (s !== null && s <= was) {
      f.gy = s;
      f.y = s;
    }
  } else if (f.vy > 0 && !f.drop && y0 < was - 0.5) {
    const s = surfCross(f.x, y0, f.y);
    f.gy = s === null ? G : s;
  } else if (f.vy < 0) f.gy = G;
}
// Walls: a fighter whose body overlaps a wall's height can't cross its line this step
function terrainWalls(f, x0) {
  if (!TERRAIN.w.size || f.x === x0) return;
  const top = f.y - 110 * (f.s || 1),
    c0 = Math.round(Math.min(x0, f.x) / TERRAIN.cell) - 1,
    c1 = Math.round(Math.max(x0, f.x) / TERRAIN.cell) + 1;
  for (let c = c0; c <= c1; c++)
    for (const w of TERRAIN.w.get(c) || []) {
      if (f.y <= w.y1 + 1 || top >= w.y2) continue;
      if (x0 <= w.x - T_HALF + 0.01 && f.x > w.x - T_HALF) {
        f.x = w.x - T_HALF;
        f.vx = Math.min(0, f.vx);
      } else if (x0 >= w.x + T_HALF - 0.01 && f.x < w.x + T_HALF) {
        f.x = w.x + T_HALF;
        f.vx = Math.max(0, f.vx);
      }
    }
}
// Drop through the surface you stand on (Down + Jump)
function terrainDrop(f) {
  if (f.gy >= G) return false;
  f.drop = 12;
  f.gy = G;
  f.y += 1;
  return true;
}
