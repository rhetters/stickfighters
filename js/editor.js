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
      .map(q => ({ k: q.k, x: edNum(q.x, 0, w, 0), s: edNum((+q.s || 1) * 100, 60, 140, 100) / 100 })),
    foes = edArr(s.foes)
      .filter(q => q && typeof q === 'object' && typeof q.t === 'string' && edFoeOk(q.t, b))
      .slice(0, ED_LIM.foes)
      .map(q => ({ t: q.t, x: edNum(q.x, 0, w, 0) })),
    out = { w, plats, props, foes };
  if (foes.length) out.at = edNum(s.at, 0, w, Math.round(w / 2));
  return out;
}
// A whole level, checked (a missing or broken level becomes an empty one in the Wooded Trail)
function normLevel(L) {
  const s = L && typeof L === 'object' ? L : {},
    b = typeof s.b === 'string' && BIOMES[s.b] ? s.b : 'woods',
    name =
      String(typeof s.name === 'string' ? s.name : '')
        .toUpperCase()
        .replace(/[^A-Z0-9 !?'.-]/g, '')
        .trim()
        .slice(0, ED_LIM.name) || 'MY LEVEL',
    parts = edArr(s.parts)
      .slice(0, ED_LIM.parts)
      .map(p => normPart(p, b));
  return {
    id: typeof s.id === 'string' && /^[a-z0-9]{1,12}$/.test(s.id) ? s.id : edId(),
    name,
    b,
    parts: parts.length ? parts : [normPart({}, b)]
  };
}
// A new level id (not part of the game: Math.random is fine)
const edId = () => 'l' + Math.floor(Math.random() * 2176782336).toString(36);
// The saved levels are checked once when the game starts
EDIT.levels = edArr(EDIT.levels)
  .slice(0, ED_LIM.levels)
  .map(normLevel);
// ===== PLAYING A LEVEL =====
// The same shape as genRun's (run.js): a sign with the level's name, Rhett's parts, and an arch at the end.
// It's one biome, so it's drawn with that biome's look; his platforms are the terrain.
function buildCustom(L) {
  const B = BIOMES[L.b],
    ch = [],
    encs = [],
    plats = [];
  let x = 0;
  const chunk = (w, props) => {
    const c = { id: 'ed' + ch.length, look: B.look, x0: x, w, dusk: 0, flies: 0, props, biome: 0 };
    ch.push(c);
    x += w;
    return c;
  };
  chunk(900, [{ k: 'sign', x: 300, t: L.name }]);
  for (const p of L.parts) {
    const c = chunk(p.w, p.props.map(q => ({ ...q })));
    for (const q of p.plats) plats.push(edPlat(c.x0, q, B));
    if (p.foes.length)
      encs.push({
        x: c.x0 + p.at,
        lock: Math.max(0, c.x0 + p.at - W / 2),
        lvl: B.mix[0].at + 1,
        max: 4,
        list: p.foes.map(f => ({ t: f.t, x: c.x0 + f.x })),
        st: 0,
        q: []
      });
  }
  chunk(700, [{ k: 'arch', x: 420, t: L.name + ' CLEAR' }]);
  return {
    id: 'custom:' + L.id,
    def: { name: L.name, num: 0, next: 'Build another!' },
    custom: L.id,
    ch,
    encs,
    gates: [],
    segs: [{ b: L.b, x0: 0, x1: x }],
    trans: null,
    ramps: null,
    terr: plats.length ? { s: plats, w: [] } : null,
    haz: null,
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
  LV = buildCustom(src);
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
