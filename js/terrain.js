// StickFighters: Terrain: floors, stairs and walls above the ground line G. Any mode can set it (the
// house does today; levels with platforms and stairs can use the same thing). With no terrain everyone stands on G.
// ===== TERRAIN =====
// A surface is a line { x1, x2, y1, y2 } (x1 < x2): flat when y1 === y2 (a floor), a ramp otherwise (stairs).
// The rules, like most platformers: going up, or walking into a surface from the ground, passes through it; falling
// onto it from above lands on it. Walking along a floor (or the ground) you stay on that level: holding Up while
// walking onto stairs that go up that way takes them, and holding Down takes stairs that go down that way. On stairs
// you follow them to their end and carry on onto a floor at that height; with nothing there, you fall.
// Down + Jump drops through. Each fighter keeps f.gy = the height it stands on.
// A wall { x, y1, y2 } (y1 < y2) is a vertical line nobody walks or flies through, from either side.
// A climb { x, y1, y2 } (a ladder or spiral stairs; x = its middle) is climbed with Up and Down: hold Up or Down
// beside it to get on, Jump or walk away sideways to get off. Climbs stacked one above another join into one.
const TERRAIN = { n: 0, cell: 45, b: new Map(), w: new Map(), c: new Map() }; // by column, for quick lookup
const T_HALF = 14; // half a fighter's width: how close a wall lets a fighter's middle come
function terrainSet(list, walls, climbs) {
  const add = (m, c, v) => (m.has(c) ? m.get(c).push(v) : m.set(c, [v]));
  TERRAIN.b = new Map();
  TERRAIN.w = new Map();
  TERRAIN.c = new Map();
  TERRAIN.n = list.length + (walls ? walls.length : 0) + (climbs ? climbs.length : 0);
  // join climbs in the same column that touch end to end
  const cs = [...(climbs || [])].sort((a, b) => a.x - b.x || a.y1 - b.y1),
    runs = [];
  for (const k of cs) {
    const last = runs[runs.length - 1];
    if (last && last.x === k.x && Math.abs(last.y2 - k.y1) < 0.5) last.y2 = k.y2;
    else runs.push({ ...k });
  }
  for (const r of runs) add(TERRAIN.c, Math.floor(r.x / TERRAIN.cell), r);
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
const isRamp = s => s.y1 !== s.y2;
const rise = s => (s.y2 < s.y1 ? 1 : -1); // which way stairs go up: 1 = to the right
// Stairs a fighter walking in direction d can step onto at its feet (x, y): with Up, stairs that go up that way;
// with Down (cl < 0), stairs that go down that way. They must carry on in that direction from here.
function rampToTake(x, y, d, cl, tol, not) {
  if (!d || !cl) return null;
  for (const s of surfAt(x))
    if (
      s !== not &&
      isRamp(s) &&
      rise(s) * d * cl > 0 &&
      x + d * 0.5 >= s.x1 &&
      x + d * 0.5 <= s.x2 &&
      Math.abs(surfY(s, x) - y) <= tol
    )
      return s;
  return null;
}
// Where walking carries on when the surface you stood on ends: a floor at about the same height, or more of the same
// stairs (the same way up). Other stairs are only taken with Up or Down (rampToTake).
function surfNext(x, y, tol, cur) {
  let best = null,
    bd = 1e9;
  for (const s of surfAt(x)) {
    if (s === cur || (isRamp(s) && !(cur && isRamp(cur) && rise(cur) === rise(s)))) continue;
    const d = Math.abs(surfY(s, x) - y);
    if (d <= tol && d < bd) {
      best = s;
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
    if (y0 <= sy + 0.5 && y1 >= sy && (best === null || sy < surfY(best, x))) best = s;
  }
  return best;
}
// The climb a fighter at (x, y) can use (its feet within its height, near its middle), or null
function climbAt(x, y) {
  for (const r of TERRAIN.c.get(Math.floor(x / TERRAIN.cell)) || [])
    if (Math.abs(x - r.x) <= 20 && y >= r.y1 - 0.5 && y <= r.y2 + 0.5) return r;
  return null;
}
// Up or Down with no sideways input: the way to walk to take stairs going up (cl 1) or down (cl -1) from the feet
// (x, y), or 0 if there are none. On stairs (cur), along them. Looks a little either side, for stairs that start
// just beside you.
function terrainRampDir(x, y, cl, cur) {
  if (cur && isRamp(cur)) return cl * rise(cur); // already on stairs: keep going along them
  for (const d of [1, -1]) for (const dx of [0, 8, 16]) if (rampToTake(x + d * dx, y, d, cl, 10)) return d;
  return 0;
}
const CLIMB_SPEED = 3;
// On a ladder or spiral stairs: move up or down it, stop at its ends; jumping or walking away gets you off.
// Returns true when it took care of this step.
function terrainLadder(f, y0) {
  if (!TERRAIN.c.size) return false;
  if (!f.lad && f.cl && f.vy >= -1) {
    const r = climbAt(f.x, y0);
    // get on only to go somewhere: up from below its top, or down from above its bottom
    if (r && ((f.cl > 0 && y0 > r.y1 + 0.5) || (f.cl < 0 && y0 < r.y2 - 0.5))) f.lad = 1;
  }
  if (!f.lad) return false;
  const r = climbAt(f.x, y0);
  if (!r || f.vy < -1) {
    f.lad = 0;
    return false;
  }
  const y = Math.max(r.y1, Math.min(r.y2, y0 - f.cl * CLIMB_SPEED));
  f.y = f.gy = y;
  f.vy = 0;
  f.x += (r.x - f.x) * (f.cl ? 0.3 : 0); // climbing pulls you to the middle of the ladder
  return true;
}
// One physics step's terrain check (called by phys between moving and landing). x0, y0 = position before the move.
// f.surf = the surface the fighter stands on (null on the ground, a ladder or in the air).
function terrainStep(f, x0, y0) {
  if (f.drop > 0) f.drop--;
  terrainWalls(f, x0);
  if (terrainLadder(f, y0)) return (f.surf = null);
  const was = f.gy,
    onSurf = was < G && y0 >= was - 0.5,
    onAny = y0 >= was - 0.5,
    tol = Math.abs(f.vx) + 6,
    d = Math.sign(f.x - x0),
    put = s => {
      f.surf = s;
      f.gy = s ? surfY(s, f.x) : G;
      if (s) f.y = Math.max(f.y, f.gy); // stick to stairs going down; the landing check puts us on them
    };
  if (onSurf && f.vy >= 0) {
    // walking along: Up or Down can turn onto stairs; otherwise stay on what you're on, then carry on onto a floor at
    // the same height or more of the same stairs; nothing there and you fall
    const cur = f.surf;
    let s = rampToTake(f.x, was, d, f.cl, tol, cur);
    if (!s && cur && f.x >= cur.x1 && f.x <= cur.x2) s = cur;
    if (!s) s = surfNext(f.x, was, tol, cur);
    put(s);
  } else if (onAny && f.vy >= 0 && f.cl > 0 && !f.drop) {
    // on the ground, holding Up while walking into stairs going up that way: step onto them
    const s = rampToTake(f.x, was, d, 1, tol);
    if (s) put(s);
  } else if (f.vy > 0 && !f.drop && y0 < was - 0.5) put(surfCross(f.x, y0, f.y));
  else if (f.vy < 0) put(null);
}
// Walls: a fighter whose body overlaps a wall's height can't cross its line this step. A body counts as T_TALL high
// (a fighter is drawn about 80 tall), so a gap two house squares high (90, like a door) can be walked through.
const T_TALL = 84;
function terrainWalls(f, x0) {
  if (!TERRAIN.w.size || f.x === x0) return;
  const top = f.y - T_TALL * (f.s || 1),
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
  if (f.gy >= G || (f.surf && f.surf.solid)) return false; // a solid floor (the Skyscraper's) can't be dropped through
  f.drop = 12;
  f.gy = G;
  f.surf = null;
  f.y += 1;
  return true;
}
