// StickFighters: Enemy moves (EA), enemy types (T), names and tips; decorates every move with its info
const EA = {
  pj: {
    d: 34,
    h: [19, 23],
    dmg: 6,
    r: 44,
    kb: 5,
    k: [
      [0, IDLE],
      [0.5, [-10, -30, 125, 45, 90, 18, 22, -20, 12, 0]],
      [0.6, [18, 94, 3, 25, 100, 28, 18, -24, 14, 0]],
      [0.8, [18, 94, 3, 25, 100, 28, 18, -24, 14, 0]],
      [1, IDLE]
    ]
  },
  lunge: {
    d: 30,
    h: [13, 22],
    dmg: 5,
    r: 40,
    kb: 5,
    lv: 9,
    k: [
      [0, IDLE],
      [0.4, [-14, -30, 125, 45, 90, 30, 40, -30, 30, 0]],
      [0.5, [30, 94, 3, 30, 90, 40, 30, -40, 20, 0]],
      [0.8, [30, 94, 3, 30, 90, 40, 30, -40, 20, 0]],
      [1, IDLE]
    ]
  },
  heavy: {
    d: 56,
    h: [32, 38],
    dmg: 14,
    r: 72,
    kb: 13,
    lift: -5,
    k: [
      [0, IDLE],
      [0.55, [-18, 170, 10, 150, 20, 20, 25, -25, 15, 0]],
      [0.68, [34, 70, 10, 65, 10, 35, 15, -30, 20, 0]],
      [0.85, [34, 70, 10, 65, 10, 35, 15, -30, 20, 0]],
      [1, IDLE]
    ]
  },
  bash: {
    d: 32,
    h: [16, 20],
    dmg: 6,
    r: 46,
    kb: 10,
    lg: 4,
    k: [
      [0, IDLE],
      [0.45, [-14, 40, 60, 20, 90, 25, 30, -25, 20, 0]],
      [0.55, [30, 90, 10, 30, 90, 40, 30, -35, 10, 0]],
      [0.8, [30, 90, 10, 30, 90, 40, 30, -35, 10, 0]],
      [1, IDLE]
    ]
  },
  slash: {
    d: 30,
    h: [12, 18],
    dmg: 7,
    r: 50,
    kb: 6,
    lv: 8,
    k: [
      [0, IDLE],
      [0.35, [-10, 40, 80, 30, 80, 75, 100, -10, 10, 0]],
      [0.45, [-18, 60, 60, 40, 70, 100, 5, -10, 20, 0]],
      [0.75, [-18, 60, 60, 40, 70, 100, 5, -10, 20, 0]],
      [1, IDLE]
    ]
  },
  cslam: {
    d: 62,
    h: [36, 42],
    dmg: 16,
    r: 84,
    kb: 13,
    lift: -6,
    boss: 1,
    k: [
      [0, IDLE],
      [0.55, [-20, 175, 10, 165, 10, 20, 30, -25, 20, 0]],
      [0.66, [42, 60, 10, 55, 10, 40, 20, -35, 20, 0]],
      [0.85, [42, 60, 10, 55, 10, 40, 20, -35, 20, 0]],
      [1, IDLE]
    ]
  },
  ccharge: {
    d: 58,
    h: [18, 46],
    dmg: 12,
    r: 50,
    kb: 12,
    lift: -4,
    dv: [18, 46, 8.5],
    boss: 1,
    k: [
      [0, IDLE],
      [0.3, [-20, -40, 90, -50, 90, 40, 70, -30, 60, 0]],
      [0.35, [38, 60, 40, -40, 60, 60, 40, -60, 20, 0]],
      [0.8, [38, 60, 40, -40, 60, 60, 40, -60, 20, 0]],
      [1, IDLE]
    ]
  },
  cquake: {
    d: 9999,
    kt: 30,
    h: [99, 99],
    dmg: 0,
    r: 0,
    kb: 0,
    hop: -13,
    dive: 1,
    diveAt: 20,
    dvx: 3,
    dvy: 13,
    area: 175,
    adm: 11,
    boss: 1,
    k: [
      [0, IDLE],
      [0.3, [10, 170, 10, 170, 10, 90, 110, 40, 110, 0]],
      [0.7, [30, 60, 40, -40, 60, 55, 0, -15, 70, 0]],
      [1, [30, 60, 40, -40, 60, 55, 0, -15, 70, 0]]
    ]
  }
};
// m = mass (knockback / sqrt(m), shoves and bowling scale with it), fr = ground friction, bnc = how much a landing bounces, poise = hits it soaks before breaking
const T = {
  g: {
    hp: 18,
    s: 1,
    spd: 1.4,
    col: '#ff4fa3',
    d2: '#d93a86',
    atk: 'pj',
    cd: 70,
    sc: 10,
    ar: 46,
    stop: 34,
    m: 1,
    fr: 0.82,
    bnc: 0.4
  },
  r: {
    hp: 12,
    s: 0.92,
    spd: 2.7,
    col: '#ff93c8',
    d2: '#e06aa4',
    atk: 'lunge',
    cd: 55,
    sc: 15,
    ar: 110,
    stop: 70,
    m: 0.8,
    fr: 0.86,
    bnc: 0.5
  },
  b: {
    hp: 75,
    s: 1.45,
    spd: 0.9,
    col: '#cf1f7c',
    d2: '#9e1260',
    atk: 'heavy',
    cd: 100,
    sc: 50,
    ar: 70,
    stop: 52,
    m: 2.2,
    fr: 0.7,
    bnc: 0.25,
    poise: 40
  },
  // guard: blocks hits from the front with a shield (guard meter breaks it). flank: gets behind you. boss: phases, health bar, scripted attacks.
  u: {
    hp: 34,
    s: 1.05,
    spd: 1.05,
    col: '#e23d8e',
    d2: '#b02a6e',
    atk: 'bash',
    cd: 80,
    sc: 30,
    ar: 48,
    stop: 40,
    m: 1.3,
    fr: 0.78,
    bnc: 0.35,
    guard: 24
  },
  f: {
    hp: 16,
    s: 0.88,
    spd: 3,
    col: '#ff6fb5',
    d2: '#d84a90',
    atk: 'slash',
    cd: 60,
    sc: 25,
    ar: 56,
    stop: 40,
    m: 0.8,
    fr: 0.86,
    bnc: 0.5,
    ai: 'flank'
  },
  c: {
    hp: 240,
    s: 1.75,
    spd: 1.1,
    col: '#b0125f',
    d2: '#7d0a43',
    atk: 'cslam',
    cd: 70,
    sc: 400,
    ar: 90,
    stop: 70,
    m: 3.2,
    fr: 0.65,
    bnc: 0.2,
    poise: 90,
    boss: 'CAPTAIN',
    ai: 'boss'
  },
  // Mini-bosses (rare, one per biome; data/themes.js) and the Castle Siege main boss. They use the Captain's moves.
  mw: {
    hp: 200,
    s: 1.85,
    spd: 1,
    col: '#c2185b',
    d2: '#880e4f',
    atk: 'cslam',
    cd: 80,
    sc: 300,
    ar: 90,
    stop: 70,
    m: 3.4,
    fr: 0.65,
    bnc: 0.2,
    poise: 100,
    boss: 'BIG BRUISER',
    ai: 'boss'
  },
  ms: {
    hp: 210,
    s: 1.8,
    spd: 1.15,
    col: '#9c3d7a',
    d2: '#6a2453',
    atk: 'cslam',
    cd: 75,
    sc: 320,
    ar: 90,
    stop: 70,
    m: 3.2,
    fr: 0.65,
    bnc: 0.2,
    poise: 90,
    boss: 'SLUDGE BRUTE',
    ai: 'boss'
  },
  mc: {
    hp: 230,
    s: 1.8,
    spd: 1.15,
    col: '#d81b60',
    d2: '#9c1145',
    atk: 'cslam',
    cd: 70,
    sc: 340,
    ar: 90,
    stop: 70,
    m: 3.2,
    fr: 0.65,
    bnc: 0.2,
    poise: 100,
    boss: 'CAPTAIN OF THE GUARD',
    ai: 'boss'
  },
  G: {
    hp: 520,
    s: 1.95,
    spd: 1.2,
    col: '#a0004f',
    d2: '#6b0035',
    atk: 'cslam',
    cd: 60,
    sc: 1500,
    ar: 100,
    stop: 75,
    m: 4.5,
    fr: 0.62,
    bnc: 0.15,
    poise: 140,
    boss: 'THE PINK GENERAL',
    ai: 'boss'
  }
};
const TNAME = {
  g: 'Grunt',
  r: 'Runner',
  b: 'Brute',
  u: 'Guard',
  f: 'Flanker',
  c: 'Captain',
  mw: 'Big Bruiser',
  ms: 'Sludge Brute',
  mc: 'Captain of the Guard',
  G: 'The Pink General'
};
// How to beat each type, shown in the training Info panel (I)
const TTIP = {
  g: 'GRUNT: the basic puncher. Anything works',
  r: 'RUNNER: lunges from far away. Interrupt it with quick hits or Surge past it',
  b: 'BRUTE: wear its blue poise down with heavy hits, then launch or grab it',
  u: 'GUARD: its shield blocks the front. Hit it from behind, sweep low, grab it, or smash the shield',
  f: 'FLANKER: it sneaks behind you. Spin Back-Kick, sweeps and Whirlwind hit both ways',
  c: 'CAPTAIN: break its poise with heavy hits. JUMP its quake leap!',
  mw: 'BIG BRUISER (woods mini-boss): a giant Brute. Break its poise, then juggle it',
  ms: 'SLUDGE BRUTE (sewer mini-boss): slippery floor, so keep your distance after it slams',
  mc: 'CAPTAIN OF THE GUARD (castle mini-boss): jump its quake leap and hit it from behind',
  G: 'THE PINK GENERAL: three phases, calls his army. Break his poise and save Surge for his rage'
};
for (const o of [A, EA])
  for (const k in o) {
    const i = INFO[k] || [k, 'Stagger', 'stagger', ''];
    Object.assign(o[k], { n: k, nm: i[0], fx: i[1], ef: i[2], ul: i[3], cost: o[k].cost || 0 });
  }
