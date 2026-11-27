// StickFighters: Rhett's levels (the level creator's data side; the screens are ui/editor.js). A level is plain data
// in the save (EDIT.levels, the format in data/editor.js). Every level goes through normLevel when it's loaded,
// shared or played: sizes and counts are limited, only known biomes, enemy types and scenery are kept, and nothing
// in it is ever run as code (VISION.md rule R3).
// ===== CHECKS =====
const edArr = a => (Array.isArray(a) ? a : []);
const edNum = (v, lo, hi, d) => {
  v = Math.round(+v);
  return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d;
};
const edFoeOk = (t, b) => ED_FOES.includes(t) || (!!BIOMES[b].mini && t === BIOMES[b].mini.t);
const edPropOk = (k, b) => BIOMES[b].props.some(p => p[0] === k);
// One part of a level in biome b, checked
function normPart(p, b) {
  const s = p && typeof p === 'object' ? p : {},
    w = edNum(s.w / ED_CELL, ED_LIM.cols[0], ED_LIM.cols[1], 20) * ED_CELL,
    sq = v => Math.round(v / ED_CELL) * ED_CELL,
    plats = edArr(s.plats)
      .filter(q => q && typeof q === 'object')
      .map(q => {
        const x1 = sq(edNum(q.x1, 0, w - ED_CELL, 0));
        return { x1, x2: sq(edNum(q.x2, x1 + ED_CELL, w, x1 + ED_CELL)), h: edNum(q.h, 1, ED_ROWS, 1) };
      })
      .filter(q => q.x2 > q.x1)
      .slice(0, ED_LIM.plats),
    props = edArr(s.props)
      .filter(q => q && typeof q === 'object' && typeof q.k === 'string' && edPropOk(q.k, b))
      .slice(0, ED_LIM.props)
      .map(q => ({
        k: q.k,
        x: edNum(q.x, 0, w, 0),
        s: edNum((+q.s || 1) * 100, 60, 140, 100) / 100,
        ...(q.l === 'f' || q.l === 'z' ? { l: q.l } : {})
      })),
    foes = edArr(s.foes)
      .filter(q => q && typeof q === 'object' && typeof q.t === 'string' && edFoeOk(q.t, b))
      .slice(0, ED_LIM.foes)
      .map(q => ({ t: q.t, x: edNum(q.x, 0, w, 0) })),
    out = { w, plats, props, foes };
  if (foes.length) out.at = edNum(s.at, 0, w, Math.round(w / 2));
  return out;
}
// One place of a level, checked (an unknown biome becomes the Wooded Trail; it always has at least one part)
function normPlace(pl) {
  const s = pl && typeof pl === 'object' ? pl : {},
    b = typeof s.b === 'string' && BIOMES[s.b] ? s.b : 'woods',
    parts = edArr(s.parts)
      .slice(0, ED_LIM.parts)
      .map(p => normPart(p, b));
  return { b, parts: parts.length ? parts : [normPart({}, b)] };
}
// A whole level, checked (a missing or broken level becomes an empty one in the Wooded Trail). A level from before
// places ({ b, parts }) becomes one place.
function normLevel(L) {
  const s = L && typeof L === 'object' ? L : {},
    places = (Array.isArray(s.places) ? s.places : [{ b: s.b, parts: s.parts }]).slice(0, ED_LIM.places).map(normPlace),
    name =
      String(typeof s.name === 'string' ? s.name : '')
        .toUpperCase()
        .replace(/[^A-Z0-9 !?'.-]/g, '')
        .trim()
        .slice(0, ED_LIM.name) || 'MY LEVEL';
  if (!places.length) places.push(normPlace({}));
  // a map: one place, one part a screen wide, no fight
  if (s.map) {
    places.length = 1;
    const p = places[0].parts[0];
    places[0].parts = [{ w: W, plats: p.plats.filter(q => q.x2 <= W), props: p.props.filter(q => q.x <= W), foes: [] }];
  }
  const out = {
      id: typeof s.id === 'string' && /^[a-z0-9]{1,12}$/.test(s.id) ? s.id : edId(),
      name,
      places
    },
    lp = edLastPart(out),
    bo = s.boss;
  if (s.map) out.map = 1;
  else if (bo && typeof bo === 'object' && ED_BOSSES.includes(bo.t))
    out.boss = { t: bo.t, x: Math.floor(edNum(bo.x, 0, lp.w - 1, lp.w / 2) / ED_CELL) * ED_CELL + ED_CELL / 2 };
  return out;
}
// The level's very last part (the only one a boss can go in)
const edLastPart = L => {
  const pl = L.places[L.places.length - 1];
  return pl.parts[pl.parts.length - 1];
};
// Every part of a level in order, with its place: [{ pl (place index), i (part index), p (the part), b (biome) }]
const edParts = L => L.places.flatMap((pl, k) => pl.parts.map((p, i) => ({ pl: k, i, p, b: pl.b })));
// A new level id (not part of the game: Math.random is fine)
const edId = () => 'l' + Math.floor(Math.random() * 2176782336).toString(36);
// Rhett's levels (Story's MY LEVELS) and maps (the stage rows' MY LEVELS) share one list
const edLevels = list => (list || EDIT.levels).filter(L => !L.map);
const edMaps = list => (list || EDIT.levels).filter(L => L.map);
// A map as one screen of level, for playing it as a stage (stages.js) and drawing it: its place's look, scenery and
// platforms from x 0 to W
function buildMap(L) {
  const pl = L.places[0],
    B = BIOMES[pl.b],
    p = pl.parts[0];
  return {
    id: 'map:' + L.id,
    def: { name: L.name, num: 0, next: '' },
    custom: L.id,
    ch: [{ id: 'map', look: B.look, x0: 0, w: W, dusk: 0, flies: 0, props: p.props.map(q => ({ ...q })), biome: 0 }],
    encs: [],
    gates: [],
    segs: [{ b: pl.b, x0: 0, x1: W }],
    trans: [],
    pch: [[0]],
    ramps: null,
    terr: { s: p.plats.map(q => edPlat(0, q, B)), w: [] },
    haz: null,
    run: null,
    len: W,
    cp: -1,
    t: 0,
    go: 0
  };
}
// The saved levels are checked once when the game starts (save version 18 already made old levels one place each)
EDIT.levels = edArr(EDIT.levels)
  .slice(0, ED_LIM.levels)
  .map(normLevel);
// ===== PLAYING A LEVEL =====
// The same shape as genRun's (run.js): for each place a sign (the level's name, then each place's name) and Rhett's
// parts, then a transition picked at random from the ones that carry you into the next place (TRANS_INTO; the seed
// makes it the same on every device online); after the last place an arch. A boss turns the last part's fight into
// a boss fight. LV.pch[place][part] = the index of that part's chunk (the editor draws a part with it).
function buildCustom(L, seed = 1) {
  const R = runRng(seed),
    ri = (a, b) => a + Math.floor(R() * (b - a + 1)),
    ch = [],
    encs = [],
    gates = [],
    segs = [],
    trans = [],
    pch = [],
    terr = { s: [], w: [] },
    haz = { vents: [], pools: [] };
  let x = 0;
  const chunk = (B, bi, w, props) => {
    const c = { id: 'ed' + ch.length, look: B.look, x0: x, w, dusk: 0, flies: 0, props, biome: bi };
    ch.push(c);
    x += w;
    return c;
  };
  L.places.forEach((pl, bi) => {
    const B = BIOMES[pl.b],
      seg = { b: pl.b, x0: x, x1: 0 },
      prev = trans[trans.length - 1],
      lastPl = bi === L.places.length - 1,
      // the crater after its rim: the place opens with the climb down, the sign at the bottom
      dn = prev && B.descent ? 1000 : 0,
      sign = chunk(B, bi, 900 + dn * 0.6, [
        { k: 'sign', x: 300 + dn * 0.85, t: bi ? B.name : L.name },
        ...(prev && OUTS[prev.k] ? [{ k: 'trans-' + prev.k + 'out', x: OUTS[prev.k] }] : [])
      ]);
    segs.push(seg);
    if (dn) prev.land = descentBuild(sign.x0, terr, haz);
    pch.push(
      pl.parts.map((p, pi) => {
        const c = chunk(B, bi, p.w, p.props.map(q => ({ ...q })));
        for (const q of p.plats) terr.s.push(edPlat(c.x0, q, B));
        const boss = lastPl && pi === pl.parts.length - 1 && L.boss;
        if (p.foes.length || boss) {
          const at = p.foes.length ? p.at : Math.max(W / 2, Math.min(p.w - W / 2, boss.x)),
            e = {
              x: c.x0 + at,
              lock: Math.max(0, c.x0 + at - W / 2),
              lvl: B.mix[0].at + 1,
              max: 4,
              list: p.foes.map(f => ({ t: f.t, x: c.x0 + f.x })),
              st: 0,
              q: []
            };
          if (boss) {
            // the boss arrives the way he does in his own story
            const bs = Object.values(THEMES).find(t => t.boss.t === boss.t).boss;
            Object.assign(e, { lvl: B.mix[0].at + 3, max: 5, boss: boss.t, intro: bs.intro, line: bs.lines[ri(0, bs.lines.length - 1)] });
          }
          encs.push(e);
        }
        return ch.length - 1;
      })
    );
    if (lastPl) {
      chunk(B, bi, 700, [{ k: 'arch', x: 420, t: L.name + ' CLEAR' }]);
      seg.x1 = x;
    } else {
      const nb = L.places[bi + 1].b,
        fits = TRANS_INTO[nb],
        k = fits[ri(0, fits.length - 1)],
        c = chunk(B, bi, transW(k), []),
        t = transBuild(k, c, pl.b, nb, terr, gates);
      x += TRANSITIONS[k].gap;
      seg.x1 = k === 'rope' ? t.x : x;
      t.nx = x;
      trans.push(t);
    }
  });
  return {
    id: 'custom:' + L.id,
    def: { name: L.name, num: 0, next: 'Build another!' },
    custom: L.id,
    ch,
    encs,
    gates,
    segs,
    trans,
    pch,
    ramps: null,
    terr: terr.s.length ? terr : null,
    haz: haz.pools.length ? haz : null,
    run: null,
    len: x,
    cp: -1,
    t: 0,
    go: 0
  };
}
// A platform of a part starting at x0, made of what suits the place (ED_PLAT)
const edPlat = (x0, q, B) => ({
  x1: x0 + q.x1,
  x2: x0 + q.x2,
  y1: G - q.h * ED_CELL,
  y2: G - q.h * ED_CELL,
  st: B.ledges ? 'rock' : ED_PLAT[edBiomeId(B)] || 'wood'
});
const edBiomeId = B => Object.keys(BIOMES).find(k => BIOMES[k] === B);
// Play one of Rhett's levels. It earns no stars or XP. from = 'edit' (trying it from the level creator: the end, QUIT
// and EDIT go back there) or 'menu' (picked under MY LEVELS on the Story screen, the Players screen or an online
// room, where the host's level is sent to everyone: the end shows the results, like a fixed level).
function startCustom(L, from = 'edit') {
  closePanels();
  newSeed();
  init();
  const src = normLevel(L);
  LV = buildCustom(src, curSeed);
  LV.src = src;
  LV.from = from;
  LV.stats = {};
  levelSim();
  paused = false;
  releaseAll();
  show(null);
  for (const p of PL) p.draw = 0;
  cineStart('drawin');
  bn(LV.def.name);
}
