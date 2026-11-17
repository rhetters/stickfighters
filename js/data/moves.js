// Orange vs. the Pink Army: Player move table, poses, route tree, move info
// ===== MOVE TABLE & POSES (M0: data-driven; startup=h[0], active=h[1]-h[0]+1, recovery=d-h[1]) =====
// poses: [lean, frontArm shoulder, elbow, backArm shoulder, elbow, frontLeg hip, knee, backLeg hip, knee, spin]
const IDLE = [6, 35, 75, 20, 90, 18, 20, -18, 12, 0],
  HURT = [-20, -35, 40, 90, 50, 10, 35, -35, 25, 0],
  FLY = [0, 100, 10, -100, 10, 70, 90, -30, 90, 0],
  LIE = [0, 95, 0, -95, 0, 0, 0, -5, 0, 0],
  JUMP = [8, 140, 20, 120, 30, 55, 75, -10, 70, 0],
  FALL = [4, 100, 10, 80, 20, 25, 10, -25, 15, 0],
  DASH = [34, 60, 90, -30, 100, 60, 50, -70, 25, 0],
  TUCK = [20, 150, 30, 130, 40, 90, 110, 40, 110, 0];
const lerpA = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function kf(fr_, t) {
  for (let i = 1; i < fr_.length; i++) {
    if (t <= fr_[i][0]) {
      const a = fr_[i - 1],
        b = fr_[i];
      return lerpA(a[1], b[1], (t - a[0]) / (b[0] - a[0] || 1));
    }
  }
  return fr_[fr_.length - 1][1];
}
const J1 = [16, 92, 4, 25, 100, 28, 18, -24, 14, 0],
  C1 = [22, 30, 100, 96, 3, 30, 20, -30, 12, 0],
  K1 = [-14, 40, 80, 20, 90, 92, 4, -6, 12, 0],
  K2 = [-24, 60, 60, 40, 70, 125, 5, -5, 15, 0],
  UP = [8, 165, 5, 40, 90, 12, 10, -12, 5, 0],
  TW = [6, 90, 0, -90, 0, 80, 0, -80, 0];
const A = {
  jab: {
    d: 15,
    h: [4, 8],
    dmg: 6,
    r: 46,
    kb: 3,
    st: 3,
    sh: 2,
    lg: 3,
    cx: 0.5,
    k: [
      [0, IDLE],
      [0.25, [-2, -15, 115, 45, 90, 20, 25, -22, 12, 0]],
      [0.5, J1],
      [0.8, J1],
      [1, IDLE]
    ]
  },
  cross: {
    d: 16,
    h: [5, 9],
    dmg: 7,
    r: 50,
    kb: 4,
    st: 3,
    sh: 3,
    lg: 4,
    cx: 0.5,
    k: [
      [0, IDLE],
      [0.25, [-4, 45, 90, -15, 115, 10, 30, -26, 10, 0]],
      [0.5, C1],
      [0.8, C1],
      [1, IDLE]
    ]
  },
  upper: {
    d: 24,
    h: [8, 13],
    dmg: 9,
    r: 42,
    kb: 3,
    lift: -10,
    st: 5,
    sh: 5,
    lg: 2,
    hop: -7,
    cx: 1,
    k: [
      [0, IDLE],
      [0.3, [-8, -20, 60, 30, 80, 45, 70, -30, 60, 0]],
      [0.55, UP],
      [0.8, UP],
      [1, IDLE]
    ]
  },
  kick: {
    d: 20,
    h: [7, 11],
    dmg: 8,
    r: 60,
    kb: 5,
    st: 4,
    sh: 3,
    lg: 3,
    cx: 0.55,
    k: [
      [0, IDLE],
      [0.3, [-6, 40, 80, 30, 80, 75, 100, -10, 10, 0]],
      [0.5, K1],
      [0.75, K1],
      [1, IDLE]
    ]
  },
  high: {
    d: 22,
    h: [8, 12],
    dmg: 9,
    r: 64,
    kb: 6,
    st: 4,
    sh: 4,
    lg: 3,
    cx: 0.55,
    k: [
      [0, IDLE],
      [0.3, [-8, 40, 80, 30, 80, 80, 110, -10, 10, 0]],
      [0.55, K2],
      [0.8, K2],
      [1, IDLE]
    ]
  },
  round: {
    d: 28,
    h: [10, 16],
    dmg: 13,
    r: 66,
    kb: 11,
    lift: -9,
    st: 7,
    sh: 7,
    lg: 5,
    hop: -6,
    cx: 1,
    k: [
      [0, IDLE],
      [0.2, [-8, 60, 70, -30, 80, 60, 90, -20, 40, 0]],
      [0.65, [-12, 70, 40, -60, 60, 100, 5, -15, 15, 300]],
      [0.85, [0, 60, 60, -30, 80, 60, 10, -15, 15, 360]],
      [1, [6, 35, 75, 20, 90, 18, 20, -18, 12, 360]]
    ]
  },
  apunch: {
    d: 16,
    h: [3, 10],
    dmg: 5,
    r: 52,
    kb: 3,
    st: 3,
    sh: 2,
    cx: 99,
    k: [
      [0, JUMP],
      [0.3, [18, 95, 3, 40, 90, 50, 50, -20, 50, 0]],
      [0.8, [18, 95, 3, 40, 90, 50, 50, -20, 50, 0]],
      [1, FALL]
    ]
  },
  dive: {
    d: 9999,
    h: [0, 9999],
    dmg: 11,
    r: 46,
    kb: 7,
    st: 6,
    sh: 5,
    dive: 1,
    k: [
      [0, [28, 60, 40, -40, 60, 55, 0, -15, 70, 0]],
      [1, [28, 60, 40, -40, 60, 55, 0, -15, 70, 0]]
    ]
  },
  tornado: {
    d: 56,
    h: [7, 52],
    w: 'L',
    dmg: 5,
    r: 82,
    kb: 4,
    lift: -5,
    st: 3,
    sh: 3,
    omni: 1,
    multi: 8,
    tatsu: 1,
    invul: 1,
    pierce: 1,
    finalAt: 46,
    top: 96,
    bot: 24,
    k: [
      [0, IDLE],
      [1, IDLE]
    ]
  }
};
// Route table: which move each input picks. M2 adds the up / down / Surge branches here, not in the player code.
// ROUTE (Combat Chart): branch -> direction held at the press -> press sequence -> move.
// g ground, a air, sg Surge ground, sa Surge air. n = neutral or forward, u = Up held, d = Down held.
const ROUTE = {
  g: {
    n: {
      p: 'jab',
      pp: 'cross',
      ppp: 'haymaker',
      k: 'kick',
      kk: 'high',
      kkk: 'round',
      pk: 'knee',
      ppk: 'spinback',
      kp: 'palmthr',
      kkp: 'elbow'
    },
    u: { p: 'skyjab', pp: 'highcross', ppp: 'upper', k: 'skykick', kk: 'twinsky', kkk: 'somer' },
    d: { p: 'gut', pp: 'lowhook', ppp: 'gpound', k: 'sweep', kk: 'rsweep', kkk: 'axe' }
  },
  a: {
    n: { p: 'apunch', pp: 'across', ppp: 'aflurry', k: 'flykick', kk: 'scissor' },
    u: { p: 'apunch', pp: 'across', ppp: 'aflurry', k: 'rscissor' },
    d: { p: 'spike', k: 'dive' }
  },
  sg: {
    n: { p: 'flash', pp: 'barrage', ppp: 'palm', k: 'rush', kk: 'whirl', kkk: 'meteor' },
    u: { p: 'phoenix', k: 'skycut' },
    d: { p: 'quake', k: 'psweep' }
  },
  sa: { n: { p: 'rave', k: 'comet' } }
};
// ----- Surge (M3) -----
const GRDP = [-6, 80, 60, 20, 90, 22, 28, -24, 18, 0],
  SLIDE = [-38, 70, 40, 120, 30, 85, 5, 5, 110, 0],
  TIRED = [28, 15, 15, 5, 20, 15, 25, -15, 20, 0],
  FLS2 = [20, 95, 3, -20, 60, 40, 30, -40, 20, 0],
  RK = [-20, 40, 80, 20, 90, 95, 0, -15, 20, 0],
  PCH = [-16, -50, 130, -40, 130, 35, 65, -30, 55, 0],
  PTH = [30, 92, 0, 86, 0, 40, 25, -40, 10, 0],
  DIVEP = [28, 60, 40, -40, 60, 55, 0, -15, 70, 0],
  PCR = [-8, -20, 60, 30, 80, 45, 70, -30, 60, 0],
  UP2 = [14, 170, 5, 60, 80, 30, 60, -20, 40, 0],
  SKY = [-10, 70, 40, -60, 60, 130, 5, -15, 15],
  QW = [10, 170, 10, 150, 20, 40, 60, -30, 50, 0],
  QS = [45, 40, 10, 35, 10, 95, 120, -45, 100, 0],
  PSW = [-30, 80, 40, 120, 30, 90, 0, 10, 115, 0],
  AP1 = [18, 95, 3, 40, 90, 50, 50, -20, 50, 0],
  AK = [0, 60, 60, 40, 70, 100, 5, -10, 60, 0],
  AK2 = [-10, 60, 60, 40, 70, 120, 5, -10, 60, 0];
// Move fields: d frames, h [first,last] active frame, dmg, r reach, kb knockback, lift launch, st hit-stop, sh shake, cost (Surge),
//  dv [from,to,speed] forced dash, ph [from,to] phase through bodies, hop/hopx rise, dive/diveAt/dvx/dvy dive, area landing blast,
//  omni hits both sides, multi re-hit every N frames, turn = end facing the other way, spikeAt = last hits slam down, cx = chain window
Object.assign(A, {
  flash: {
    d: 22,
    h: [7, 11],
    dmg: 8,
    r: 46,
    kb: 4,
    st: 4,
    sh: 3,
    omni: 1,
    dv: [1, 9, 14],
    ph: [1, 12],
    turn: 1,
    cx: 0.68,
    cost: 15,
    k: [
      [0, IDLE],
      [0.15, DASH],
      [0.4, DASH],
      [0.5, FLS2],
      [0.8, FLS2],
      [1, IDLE]
    ]
  },
  barrage: {
    d: 34,
    h: [4, 28],
    dmg: 3,
    r: 56,
    kb: 1.5,
    st: 2,
    sh: 2,
    multi: 4,
    lg: 2,
    cx: 0.85,
    cost: 20,
    k: [
      [0, IDLE],
      [0.1, J1],
      [0.2, C1],
      [0.3, J1],
      [0.4, C1],
      [0.5, J1],
      [0.6, C1],
      [0.7, J1],
      [0.8, C1],
      [1, IDLE]
    ]
  },
  palm: {
    d: 34,
    h: [15, 19],
    dmg: 14,
    r: 62,
    kb: 14,
    lift: -7,
    st: 9,
    sh: 10,
    ring: 1,
    lg: 4,
    cx: 1,
    cost: 30,
    k: [
      [0, IDLE],
      [0.4, PCH],
      [0.47, PTH],
      [0.75, PTH],
      [1, IDLE]
    ]
  },
  rush: {
    d: 22,
    h: [6, 12],
    dmg: 9,
    r: 62,
    kb: 8,
    st: 5,
    sh: 4,
    lv: 10,
    cx: 0.6,
    cost: 15,
    k: [
      [0, IDLE],
      [0.2, [-6, 40, 80, 30, 80, 75, 100, -10, 10, 0]],
      [0.35, RK],
      [0.7, RK],
      [1, IDLE]
    ]
  },
  whirl: {
    d: 36,
    h: [4, 32],
    dmg: 6,
    r: 72,
    kb: 5,
    lift: -5,
    st: 4,
    sh: 4,
    omni: 1,
    multi: 12,
    cx: 0.9,
    cost: 25,
    k: [
      [0, IDLE],
      [0.1, [...TW, 0]],
      [0.9, [...TW, 720]],
      [1, [6, 35, 75, 20, 90, 18, 20, -18, 12, 720]]
    ]
  },
  meteor: {
    d: 9999,
    kt: 24,
    h: [14, 9999],
    dmg: 12,
    r: 50,
    kb: 8,
    lift: -6,
    st: 6,
    sh: 6,
    hop: -12,
    hopx: 3,
    dive: 1,
    diveAt: 14,
    dvx: 9,
    dvy: 13,
    area: 120,
    adm: 12,
    cost: 35,
    k: [
      [0, IDLE],
      [0.2, TUCK],
      [0.5, [...TUCK.slice(0, 9), 360]],
      [0.6, DIVEP],
      [1, DIVEP]
    ]
  },
  phoenix: {
    d: 28,
    h: [3, 14],
    dmg: 10,
    r: 46,
    kb: 3,
    lift: -13,
    st: 6,
    sh: 6,
    hop: -13,
    hopx: 5,
    cx: 1,
    cost: 30,
    k: [
      [0, PCR],
      [0.15, UP2],
      [0.7, UP2],
      [1, FALL]
    ]
  },
  skycut: {
    d: 28,
    h: [4, 14],
    dmg: 10,
    r: 60,
    kb: 4,
    lift: -12,
    st: 6,
    sh: 6,
    hop: -12,
    hopx: 2,
    cx: 1,
    cost: 30,
    k: [
      [0, IDLE],
      [0.15, [-6, 60, 70, -30, 80, 60, 90, -20, 40, 0]],
      [0.55, [...SKY, 330]],
      [0.8, [...SKY, 360]],
      [1, [...FALL.slice(0, 9), 360]]
    ]
  },
  quake: {
    d: 32,
    h: [14, 18],
    dmg: 11,
    r: 115,
    kb: 5,
    lift: -8,
    st: 7,
    sh: 9,
    omni: 1,
    quake: 1,
    cx: 1,
    cost: 30,
    k: [
      [0, IDLE],
      [0.35, QW],
      [0.45, QS],
      [0.8, QS],
      [1, IDLE]
    ]
  },
  psweep: {
    d: 24,
    h: [2, 18],
    dmg: 6,
    r: 50,
    kb: 2,
    lift: -3,
    st: 3,
    sh: 3,
    dv: [1, 16, 10],
    ph: [1, 20],
    cx: 1,
    cost: 20,
    k: [
      [0, PSW],
      [0.85, PSW],
      [1, IDLE]
    ]
  },
  rave: {
    d: 34,
    h: [3, 30],
    dmg: 4,
    r: 56,
    kb: 2,
    lift: -2.5,
    st: 2,
    sh: 2,
    multi: 8,
    hover: 1,
    spikeAt: 26,
    cost: 25,
    k: [
      [0, JUMP],
      [0.15, AP1],
      [0.35, AK],
      [0.55, AP1],
      [0.75, AK2],
      [1, FALL]
    ]
  },
  comet: {
    d: 9999,
    h: [0, 9999],
    dmg: 13,
    r: 50,
    kb: 12,
    lift: -4,
    st: 7,
    sh: 6,
    dive: 1,
    dvx: 11,
    dvy: 10,
    cost: 25,
    k: [
      [0, DIVEP],
      [1, DIVEP]
    ]
  }
});
// Holding Surge swaps each branch to its Surge version. Direction = what was held when the button was pressed.
// ----- M2: directional moves (Combat Chart A-D) -----
const HAY0 = [-15, -80, 60, 40, 90, 20, 25, -30, 15, 0],
  HAY = [30, 100, 10, -40, 60, 40, 35, -40, 10, 0],
  HAY2 = [38, 60, 20, -50, 60, 45, 40, -40, 10, 0],
  KNEE = [20, 60, 60, 40, 80, 110, 150, -15, 10, 0],
  SBK0 = [10, 40, 80, 20, 90, 30, 40, -20, 20, 0],
  SBK = [-25, 40, 80, 20, 90, 15, 20, -100, 0, 0],
  PALM1 = [25, 90, 0, -20, 60, 35, 30, -35, 15, 0],
  ELB = [35, 105, -110, 40, 90, 30, 40, -30, 15, 0],
  SJ = [10, 140, 5, 30, 100, 25, 15, -20, 10, 0],
  HCX = [14, 30, 100, 140, 5, 30, 20, -30, 12, 0],
  SKK = [-20, 60, 60, 30, 80, 140, 10, -10, 20, 0],
  TSK = [-20, 60, 60, 30, 80, -10, 20, 140, 10, 0],
  SOM = [-10, 160, 20, 150, 20, 150, 10, 20, 90],
  CRCH = [30, 40, 80, 30, 90, 70, 110, -30, 90, 0],
  GUT = [30, 80, 10, 40, 90, 70, 110, -30, 90, 0],
  LHK = [30, 40, 80, 95, 30, 70, 110, -30, 90, 0],
  GP1 = [10, 170, 10, 160, 10, 60, 100, -20, 100, 0],
  GP2 = [55, 40, 10, 30, 10, 95, 130, -40, 110, 0],
  SWP = [20, 80, 40, 100, 40, 85, 0, -20, 120, 0],
  AX1 = [-20, 60, 60, 30, 80, 175, 0, -10, 10, 0],
  AX2 = [25, 60, 60, 30, 80, 60, 0, -10, 10, 0],
  AJ2 = [18, 40, 90, 95, 3, 50, 50, -20, 50, 0],
  FK = [-30, 60, 60, 30, 80, 92, 0, -20, 40, 0],
  SC1 = [-20, 60, 60, 30, 80, 100, 0, 20, 60, 0],
  SC2 = [-20, 60, 60, 30, 80, 20, 60, 100, 0, 0],
  SPK1 = [0, 175, 10, 175, 10, 50, 60, -20, 60, 0],
  SPK2 = [30, 60, 10, 60, 10, 50, 60, -20, 60, 0],
  RSC = [-25, 60, 60, 30, 80, 150, 0, -10, 60, 0],
  KNEEL = [30, 60, 40, 40, 40, 90, 150, -10, 120, 0],
  SPL = [0, 150, 10, -150, 10, 30, 0, -30, 0, 0];
// extra fields: top/bot hitbox height (low moves hit low, Up moves reach high), flipAt/back turn and hit behind, iv invulnerable frames,
//  air = air move (chains in the air, ends on landing), airhop rise in the air, float slows the fall, smear = motion trail, limb = which limb trails
Object.assign(A, {
  haymaker: {
    d: 30,
    h: [13, 17],
    dmg: 12,
    r: 58,
    kb: 12,
    st: 7,
    sh: 7,
    lg: 4,
    cx: 1,
    smear: 1,
    k: [
      [0, IDLE],
      [0.35, HAY0],
      [0.5, HAY],
      [0.75, HAY2],
      [1, IDLE]
    ]
  },
  knee: {
    d: 20,
    h: [6, 10],
    dmg: 8,
    r: 40,
    kb: 3,
    lift: -6,
    st: 5,
    sh: 4,
    lg: 4,
    hop: -3,
    cx: 0.6,
    limb: 'f',
    k: [
      [0, IDLE],
      [0.25, [0, 50, 70, 40, 80, 60, 90, -15, 10, 0]],
      [0.4, KNEE],
      [0.7, KNEE],
      [1, IDLE]
    ]
  },
  spinback: {
    d: 26,
    h: [10, 14],
    dmg: 11,
    r: 66,
    kb: 11,
    st: 6,
    sh: 6,
    flipAt: 5,
    back: 1,
    turn: 1,
    lg: 2,
    cx: 1,
    smear: 1,
    limb: 'fb',
    k: [
      [0, IDLE],
      [0.2, SBK0],
      [0.38, SBK],
      [0.7, SBK],
      [1, IDLE]
    ]
  },
  palmthr: {
    d: 20,
    h: [7, 11],
    dmg: 8,
    r: 54,
    kb: 11,
    st: 5,
    sh: 5,
    lg: 5,
    cx: 0.6,
    ring: 1,
    k: [
      [0, IDLE],
      [0.25, [-6, -20, 120, 30, 80, 20, 25, -25, 12, 0]],
      [0.4, PALM1],
      [0.75, PALM1],
      [1, IDLE]
    ]
  },
  elbow: {
    d: 24,
    h: [8, 12],
    dmg: 11,
    r: 42,
    kb: 6,
    st: 6,
    sh: 6,
    lg: 5,
    cx: 1,
    smear: 1,
    k: [
      [0, IDLE],
      [0.3, [-6, 150, -60, 40, 90, 25, 30, -25, 12, 0]],
      [0.45, ELB],
      [0.75, ELB],
      [1, IDLE]
    ]
  },
  skyjab: {
    d: 15,
    h: [4, 8],
    dmg: 6,
    r: 46,
    kb: 2,
    lift: -5,
    st: 3,
    sh: 2,
    top: 135,
    cx: 0.5,
    k: [
      [0, IDLE],
      [0.25, [-2, -15, 115, 45, 90, 20, 25, -22, 12, 0]],
      [0.5, SJ],
      [0.8, SJ],
      [1, IDLE]
    ]
  },
  highcross: {
    d: 16,
    h: [5, 9],
    dmg: 7,
    r: 48,
    kb: 2,
    lift: -5,
    st: 3,
    sh: 3,
    top: 135,
    cx: 0.5,
    limb: 'hb',
    k: [
      [0, IDLE],
      [0.25, [-4, 45, 90, -15, 115, 10, 30, -26, 10, 0]],
      [0.5, HCX],
      [0.8, HCX],
      [1, IDLE]
    ]
  },
  skykick: {
    d: 20,
    h: [6, 11],
    dmg: 8,
    r: 58,
    kb: 3,
    lift: -6,
    st: 4,
    sh: 3,
    top: 145,
    hop: -4,
    cx: 0.55,
    limb: 'f',
    k: [
      [0, IDLE],
      [0.25, [-6, 40, 80, 30, 80, 75, 100, -10, 10, 0]],
      [0.45, SKK],
      [0.75, SKK],
      [1, IDLE]
    ]
  },
  twinsky: {
    d: 20,
    h: [6, 11],
    dmg: 8,
    r: 58,
    kb: 3,
    lift: -6,
    st: 4,
    sh: 3,
    top: 145,
    hop: -5,
    cx: 0.55,
    limb: 'fb',
    k: [
      [0, IDLE],
      [0.25, [-6, 40, 80, 30, 80, 10, 30, 75, 100, 0]],
      [0.45, TSK],
      [0.75, TSK],
      [1, IDLE]
    ]
  },
  somer: {
    d: 30,
    h: [5, 14],
    dmg: 11,
    r: 56,
    kb: 4,
    lift: -12,
    st: 7,
    sh: 6,
    top: 150,
    hop: -9,
    iv: [1, 14],
    cx: 1,
    smear: 1,
    limb: 'f',
    k: [
      [0, IDLE],
      [0.15, CRCH],
      [0.45, [...SOM, -200]],
      [0.75, [-10, 160, 20, 150, 20, 60, 10, 20, 90, -330]],
      [1, [...FALL.slice(0, 9), -360]]
    ]
  },
  gut: {
    d: 15,
    h: [5, 8],
    dmg: 6,
    r: 46,
    kb: 3,
    st: 3,
    sh: 2,
    top: 55,
    cx: 0.5,
    k: [
      [0, IDLE],
      [0.3, CRCH],
      [0.5, GUT],
      [0.8, GUT],
      [1, IDLE]
    ]
  },
  lowhook: {
    d: 16,
    h: [5, 9],
    dmg: 6,
    r: 46,
    kb: 3,
    st: 3,
    sh: 3,
    top: 60,
    cx: 0.5,
    limb: 'hb',
    k: [
      [0, CRCH],
      [0.3, [30, 40, 80, 10, 110, 70, 110, -30, 90, 0]],
      [0.5, LHK],
      [0.8, LHK],
      [1, CRCH]
    ]
  },
  gpound: {
    d: 30,
    h: [12, 15],
    dmg: 10,
    r: 80,
    kb: 3,
    st: 7,
    sh: 8,
    omni: 1,
    quake: 1,
    top: 60,
    cx: 1,
    smear: 1,
    k: [
      [0, CRCH],
      [0.3, GP1],
      [0.42, GP2],
      [0.8, GP2],
      [1, IDLE]
    ]
  },
  sweep: {
    d: 20,
    h: [6, 11],
    dmg: 6,
    r: 64,
    kb: 2,
    st: 4,
    sh: 3,
    top: 35,
    cx: 0.55,
    limb: 'f',
    k: [
      [0, IDLE],
      [0.25, CRCH],
      [0.45, SWP],
      [0.75, SWP],
      [1, CRCH]
    ]
  },
  rsweep: {
    d: 22,
    h: [6, 12],
    dmg: 6,
    r: 64,
    kb: 2,
    st: 4,
    sh: 3,
    top: 35,
    omni: 1,
    cx: 0.6,
    limb: 'f',
    k: [
      [0, CRCH],
      [0.3, [...SWP.slice(0, 9), -180]],
      [0.6, [...SWP.slice(0, 9), -360]],
      [1, [...CRCH.slice(0, 9), -360]]
    ]
  },
  axe: {
    d: 28,
    h: [13, 17],
    dmg: 11,
    r: 56,
    kb: 3,
    st: 7,
    sh: 7,
    top: 120,
    cx: 1,
    smear: 1,
    limb: 'f',
    k: [
      [0, IDLE],
      [0.35, AX1],
      [0.5, AX2],
      [0.75, AX2],
      [1, IDLE]
    ]
  },
  across: {
    d: 16,
    h: [3, 9],
    dmg: 5,
    r: 52,
    kb: 3,
    st: 3,
    sh: 2,
    air: 1,
    cx: 0.55,
    limb: 'hb',
    k: [
      [0, JUMP],
      [0.3, AJ2],
      [0.8, AJ2],
      [1, FALL]
    ]
  },
  aflurry: {
    d: 22,
    h: [3, 18],
    dmg: 3,
    r: 54,
    kb: 1.5,
    st: 2,
    sh: 2,
    multi: 5,
    air: 1,
    float: 1,
    cx: 1,
    k: [
      [0, JUMP],
      [0.15, AP1],
      [0.3, AJ2],
      [0.45, AP1],
      [0.6, AJ2],
      [0.75, AP1],
      [1, FALL]
    ]
  },
  flykick: {
    d: 22,
    h: [4, 16],
    dmg: 8,
    r: 58,
    kb: 5,
    st: 4,
    sh: 4,
    air: 1,
    cx: 0.6,
    limb: 'f',
    k: [
      [0, JUMP],
      [0.2, FK],
      [0.85, FK],
      [1, FALL]
    ]
  },
  scissor: {
    d: 20,
    h: [3, 14],
    dmg: 5,
    r: 56,
    kb: 3,
    st: 3,
    sh: 3,
    multi: 6,
    air: 1,
    lg: 3,
    cx: 1,
    limb: 'f',
    k: [
      [0, FK],
      [0.3, SC1],
      [0.55, SC2],
      [0.8, SC1],
      [1, FALL]
    ]
  },
  spike: {
    d: 24,
    h: [7, 16],
    dmg: 10,
    r: 50,
    kb: 3,
    st: 6,
    sh: 6,
    air: 1,
    bot: 40,
    smear: 1,
    k: [
      [0, JUMP],
      [0.3, SPK1],
      [0.45, SPK2],
      [0.85, SPK2],
      [1, FALL]
    ]
  },
  rscissor: {
    d: 20,
    h: [3, 12],
    dmg: 7,
    r: 54,
    kb: 2,
    lift: -7,
    st: 4,
    sh: 3,
    air: 1,
    top: 150,
    airhop: -4,
    cx: 1,
    limb: 'f',
    k: [
      [0, JUMP],
      [0.3, RSC],
      [0.8, RSC],
      [1, FALL]
    ]
  }
});
Object.assign(A.apunch, { air: 1, cx: 0.55, bot: 20 });
// ----- M4: grab and throw (no hitbox of their own; the throw applies its effect directly) -----
const GRB = [10, 95, 15, 85, 15, 25, 20, -25, 15, 0],
  HLD = [-10, 150, 30, 150, 30, 20, 10, -15, 10, 0],
  NOHIT = [99, 99];
Object.assign(A, {
  grab: {
    d: 1,
    h: NOHIT,
    dmg: 0,
    r: 0,
    kb: 0,
    k: [
      [0, GRB],
      [1, GRB]
    ]
  },
  pummel: {
    d: 1,
    h: NOHIT,
    dmg: 4,
    r: 0,
    kb: 0,
    k: [
      [0, KNEE],
      [1, KNEE]
    ]
  },
  gwhiff: {
    d: 18,
    h: NOHIT,
    dmg: 0,
    r: 0,
    kb: 0,
    cx: 1,
    k: [
      [0, IDLE],
      [0.3, GRB],
      [0.7, GRB],
      [1, IDLE]
    ]
  },
  tfwd: {
    d: 18,
    h: NOHIT,
    dmg: 8,
    r: 0,
    kb: 0,
    cx: 1,
    k: [
      [0, GRB],
      [0.35, [-25, 150, 20, 140, 20, 30, 20, -30, 15, 0]],
      [0.6, [35, 80, 0, 70, 0, 40, 20, -40, 15, 0]],
      [1, IDLE]
    ]
  },
  tback: {
    d: 20,
    h: NOHIT,
    dmg: 8,
    r: 0,
    kb: 0,
    cx: 1,
    k: [
      [0, GRB],
      [0.4, [-20, 150, 20, 140, 20, 30, 20, -30, 15, 0]],
      [0.7, [30, 80, 0, 70, 0, 40, 20, -40, 15, 0]],
      [1, IDLE]
    ]
  },
  tup: {
    d: 20,
    h: NOHIT,
    dmg: 6,
    r: 0,
    kb: 0,
    cx: 1,
    k: [
      [0, GRB],
      [0.3, CRCH],
      [0.6, [5, 175, 0, 170, 0, 20, 10, -20, 10, 0]],
      [1, IDLE]
    ]
  },
  tslam: {
    d: 22,
    h: NOHIT,
    dmg: 10,
    r: 0,
    kb: 0,
    cx: 1,
    k: [
      [0, GRB],
      [0.35, [-5, 175, 0, 170, 0, 20, 10, -20, 10, 0]],
      [0.6, [45, 40, 10, 30, 10, 95, 120, -40, 100, 0]],
      [1, IDLE]
    ]
  }
});
for (const n of ['rsweep', 'axe', 'gpound', 'spike', 'quake']) A[n].otg = 1;
A.meteor.fold = 1;
for (const [n, b] of [
  ['across', 20],
  ['aflurry', 20],
  ['flykick', 30],
  ['scissor', 30],
  ['rave', 20]
])
  A[n].bot = b;
Object.assign(A.highcross, { lg: 3 });
Object.assign(A.twinsky, { lg: 3 });
Object.assign(A.upper, { lg: 3 });
Object.assign(A.somer, { lg: 2 });
Object.assign(A.flash, { blink: 1 });
Object.assign(A.upper, { top: 130 });
for (const n of [
  'kick',
  'high',
  'round',
  'rush',
  'whirl',
  'meteor',
  'skycut',
  'psweep',
  'comet',
  'dive',
  'tornado'
])
  A[n].limb = 'f';
// Every Surge number lives here so the skill tree (M11) can change them.
const SURGE = {
  max: 100,
  regen: 25,
  delay: 0.6,
  winded: 1.5,
  runDrain: 20,
  runSpeed: 7.5,
  jumpCost: 15,
  hopCost: 15,
  slideCost: 10,
  blockDrain: 8
};
// Chart name, effect shown in the readout, effect code used by the hit system, unlock tier (M11 gates tiers; everything is open until then).
const INFO = {
  jab: ['Jab', 'Stagger', 'stagger', 'Start'],
  cross: ['Cross', 'Stagger', 'stagger', 'Start'],
  haymaker: ['Haymaker', 'Knockdown, Splat', 'splat', 'FST-1'],
  kick: ['Front Kick', 'Pushback', 'push', 'Start'],
  high: ['High Kick', 'Stagger, Pop', 'pop', 'Start'],
  round: ['Flip Kick', 'Launch', 'launch', 'Start'],
  knee: ['Knee Strike', 'Pop', 'pop', 'FST-2'],
  spinback: ['Spin Back-Kick', 'Knockdown', 'kd', 'LEG-2'],
  palmthr: ['Palm Thrust', 'Pushback, Splat', 'splat', 'LEG-1'],
  elbow: ['Elbow Smash', 'Knockdown', 'kd', 'FST-2'],
  skyjab: ['Sky Jab', 'Pop, anti-air', 'pop', 'Start'],
  highcross: ['High Cross', 'Pop', 'pop', 'Start'],
  upper: ['Rising Uppercut', 'Launch', 'launch', 'Start'],
  skykick: ['Sky Kick', 'Pop, anti-air', 'pop', 'Start'],
  twinsky: ['Twin Sky Kick', 'Pop', 'pop', 'LEG-1'],
  somer: ['Somersault Kick', 'Launch (higher), invulnerable', 'launch', 'LEG-2'],
  gut: ['Gut Punch', 'Stagger (low)', 'stagger', 'Start'],
  lowhook: ['Double Low Hook', 'Stagger', 'stagger', 'FST-1'],
  gpound: ['Ground Pound', 'Bounce, small area', 'bounce', 'FST-3'],
  sweep: ['Leg Sweep', 'Trip', 'trip', 'Start'],
  rsweep: ['Reverse Sweep', 'Trip', 'trip', 'LEG-1'],
  axe: ['Axe Kick', 'Bounce', 'bounce', 'LEG-3'],
  apunch: ['Air Jab', 'Stagger', 'stagger', 'Start'],
  across: ['Air Cross', 'Stagger', 'stagger', 'Start'],
  aflurry: ['Air Flurry', 'Stagger, slows fall', 'stagger', 'FST-2'],
  flykick: ['Flying Kick', 'Pushback', 'push', 'Start'],
  scissor: ['Scissor Kick', 'Stagger', 'stagger', 'LEG-1'],
  dive: ['Dive Kick', 'Knockdown', 'kd', 'Start'],
  spike: ['Spike Fist', 'Bounce', 'bounce', 'FST-2'],
  rscissor: ['Rising Scissor', 'Pop', 'pop', 'LEG-2'],
  flash: ['Flash Strike', 'Stagger, ends behind', 'stagger', 'Start'],
  barrage: ['Barrage', 'Multi-hit', 'stagger', 'Start'],
  palm: ['Shockwave Palm', 'Launch, Splat', 'splat', 'Start'],
  rush: ['Rush Kick', 'Pushback', 'push', 'Start'],
  whirl: ['Whirlwind', 'Pop, both sides', 'pop', 'Start'],
  meteor: ['Meteor Kick', 'Knockdown, area', 'kd', 'Start'],
  phoenix: ['Phoenix Fist', 'Launch', 'launch', 'Start'],
  skycut: ['Sky Cutter', 'Launch', 'launch', 'Start'],
  quake: ['Quake Fist', 'Bounce, area', 'bounce', 'Start'],
  psweep: ['Phase Sweep', 'Trip', 'trip', 'Start'],
  rave: ['Air Rave', 'Spike', 'stagger', 'Start'],
  comet: ['Comet Kick', 'Splat', 'splat', 'Start'],
  bash: ['Shield Bash', 'Pushback', 'push', ''],
  slash: ['Flank Kick', 'Stagger', 'stagger', ''],
  cslam: ['Overhead Slam', 'Knockdown', 'kd', ''],
  ccharge: ['Charge', 'Knockdown', 'kd', ''],
  cquake: ['Quake Leap', 'Knockdown, area', 'kd', ''],
  tornado: ['Tornado Kick', 'Multi-hit, last spin launches', 'pop', 'Ult'],
  grab: ['Grab', 'Holds the enemy', 'stagger', 'Start'],
  pummel: ['Knee (while holding)', 'Light hits', 'stagger', 'Start'],
  gwhiff: ['Grab (missed)', 'Nothing in reach', 'stagger', ''],
  tfwd: ['Forward Throw', 'Splat, bowls others over', 'splat', 'Start'],
  tback: ['Back Throw', 'Splat, bowls others over', 'splat', 'Start'],
  tup: ['Up Throw', 'Launch', 'launch', 'Start'],
  tslam: ['Slam', 'Bounce', 'bounce', 'Start'],
  pj: ['Punch', 'Stagger', 'stagger', ''],
  lunge: ['Lunge', 'Stagger', 'stagger', ''],
  heavy: ['Overhead', 'Knockdown', 'kd', '']
};
