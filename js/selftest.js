// Orange vs. the Pink Army: Determinism self-test (open the game with ?selftest)
// ===== SELF-TEST: open the game with ?selftest to check the simulation is deterministic =====
// Runs a fixed seed with scripted inputs and no drawing, then prints a fingerprint (hash) of the game state.
// The hash must be identical before and after any refactor. Cosmetic effects (FX) are not part of the hash.
let SELFTESTING = false;
function selfTest(n) {
  SELFTESTING = true;
  n = n || 3600;
  const keep = { feel: { ...FEEL }, surge: SET.surge, vol: SET.vol };
  Object.assign(FEEL, FEELDEF);
  SET.surge = 'hold';
  SET.vol = 0;
  releaseAll();
  reseed(20261116);
  fr = 0;
  init();
  state = 'play';
  nextWave();
  PL[0].hp = PL[0].max = 1e6;
  const seq = 'rrrrpprrkkjjllppkkuuppddkksrsrsppkkllrrjjpkpkuukk';
  const step = i => {
    const a = seq[(i >> 4) % seq.length],
      on = (i & 15) < 10;
    for (const b of ACT) setA('kb', b, b === a && on, 0);
    fr++;
    update();
  };
  for (let i = 0; i < n; i++) step(i);
  for (const t of ['u', 'f', 'c']) {
    const e = F(t === 'f' ? 120 : 700, t, 0);
    e.y = G;
    E.push(e);
  }
  for (let i = n; i < n + 1800; i++) step(i);
  for (const b of ACT) setA('kb', b, 0, 0);
  const r = v => (typeof v === 'number' ? Math.round(v * 1000) / 1000 : v),
    fx = f => [f.tk || 'P', r(f.x), r(f.y), r(f.vx), r(f.vy), r(f.hp), f.st, r(f.poise), r(f.gm), f.face];
  const snap = JSON.stringify({
    fr,
    SEED,
    wave,
    score,
    maxc,
    q: queue.length,
    P: PL.map(p => fx(p).concat([r(p.stm.v)])),
    E: E.map(fx)
  });
  let h = 2166136261;
  for (let i = 0; i < snap.length; i++) {
    h ^= snap.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const res = {
    hash: (h >>> 0).toString(16).padStart(8, '0'),
    wave,
    score,
    enemies: E.length,
    ticks: n + 1800
  };
  // Level run (M8): walk the Wooded Trail with the same scripted fighting, mostly moving right
  reseed(20261117);
  fr = 0;
  init();
  LV = buildLevel('woods1');
  levelSim();
  PL[0].hp = PL[0].max = 1e6;
  const seq2 = 'rrrrpprrkkrrjprrkkrsrrpkpkrruprrdkrr';
  for (let i = 0; i < 7200 && state === 'play'; i++) {
    const a = seq2[(i >> 4) % seq2.length],
      on = (i & 15) < 11;
    for (const b of ACT) setA('kb', b, b === a && on, 0);
    fr++;
    update();
  }
  for (const b of ACT) setA('kb', b, 0, 0);
  const snapL = JSON.stringify({
    fr,
    SEED,
    score,
    cam: r(CAM.x),
    cp: LV.cp,
    enc: LV.encs.map(e => e.st),
    gates: LV.gates.map(g => r(g.hp)),
    P: PL.map(fx),
    E: E.map(fx)
  });
  h = 2166136261;
  for (let i = 0; i < snapL.length; i++) {
    h ^= snapL.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  res.hashL = (h >>> 0).toString(16).padStart(8, '0');
  res.level =
    'cleared ' +
    (LV.cp + 1) +
    '/' +
    LV.encs.length +
    ' fights, ' +
    fmtT(LV.t) +
    (state === 'clear' ? ', finished' : '');
  SELFTESTING = false;
  Object.assign(FEEL, keep.feel);
  SET.surge = keep.surge;
  SET.vol = keep.vol;
  state = 'menu';
  init();
  return res;
}
