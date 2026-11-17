// Orange vs. the Pink Army: Fighters, game state, Surge stamina, move picking, player creation and per-frame player update
// ===== FIGHTERS & GAME STATE =====
let PL = [],
  STM,
  P,
  E,
  FX,
  GH,
  camX = 0,
  camY = 0,
  wave,
  score,
  maxc,
  stop,
  slow,
  shake,
  zoom,
  cl,
  deadT,
  state = 'menu',
  banner,
  queue,
  spawnT;
const bn = t => (banner = { t: 70, m: 70, txt: t });
const infS = () => state === 'train' && TR.inf;
const canSurge = () => !STM.winded && (STM.v > 0 || infS());
function wind() {
  STM.v = 0;
  STM.winded = Math.round(SURGE.winded * 60);
  if (P && SET.surge === 'toggle') {
    const I = INP[P.slot];
    I.sl = false;
    I.K.s = 0;
  } // running dry switches toggled Surge off
  if (P) {
    txt(P.x, P.y - 110, 'WINDED!', '#e8a400', 22);
    P.running = 0;
  }
  sfx(150, 0.45, 'triangle', 0.08, -90);
}
function deny() {
  STM.flash = 24;
  sfx(90, 0.12, 'square', 0.05);
}
function spend(c) {
  if (infS()) return true;
  if (STM.winded || STM.v < c) {
    deny();
    return false;
  }
  STM.v -= c;
  STM.last = fr;
  if (STM.v <= 0) wind();
  return true;
}
function stamTick() {
  if (STM.flash > 0) STM.flash--;
  if (infS()) {
    STM.v = SURGE.max;
    STM.winded = 0;
    return;
  }
  if (STM.winded > 0) {
    if (--STM.winded === 0) STM.last = fr - SURGE.delay * 60;
    return;
  }
  if (!P.running && fr - STM.last > SURGE.delay * 60) STM.v = Math.min(SURGE.max, STM.v + SURGE.regen / 60);
}
// Picks the move for a button from the route table (aim + Surge captured at the press), and keeps strings going.
function pick(f, btn, chain, plain) {
  const air = f.y < G - 4,
    aim = AIM[btn] || 'n',
    sg = !plain && (SRG[btn] || K.s) && canSurge();
  const grp = ROUTE[(sg ? 's' : '') + (air ? 'a' : 'g')],
    tbl = grp[aim] || grp.n,
    key = (sg ? 's' : '') + (air ? 'a' : 'g') + aim;
  let seq = (chain && f.ckey === key ? f.seq : '') + btn;
  if (!tbl[seq]) seq = btn;
  let name = tbl[seq];
  if (!name) {
    name = grp.n[btn];
    seq = btn;
  }
  const mv = A[name];
  if (mv.cost && !spend(mv.cost)) return pick(f, btn, false, true);
  f.ckey = key;
  f.seq = seq;
  return mv;
}
function F(x, t, pl) {
  const e_ = F0(x, t, pl);
  e_.tk = t;
  return e_;
}
function F0(x, t, pl) {
  const T0 = pl ? { s: 1, col: '#ff7a00', d2: '#d85f00', hp: 100, m: 1, fr: 0.8, bnc: 0.35 } : T[t],
    hp = pl ? 100 : Math.round(T0.hp * (1 + wave * 0.08) * coopScale());
  return {
    x,
    y: G,
    vx: 0,
    vy: 0,
    face: pl ? 1 : -1,
    pl,
    T: T0,
    t: 0,
    st: 'free',
    pose: IDLE.slice(),
    s: T0.s,
    col: T0.col,
    d2: T0.d2,
    hp,
    max: hp,
    poise: T0.poise || 0,
    pmax: T0.poise || 0,
    gm: T0.guard || 0,
    bp: 1,
    noShield: 0,
    chase: 0,
    ch: 0,
    inv: 0,
    stun: 0,
    att: null,
    cd: 40 + rnd() * 40,
    flash: 0,
    sp: 0,
    spv: 0,
    off: (rnd() - 0.5) * 60,
    jug: 0,
    bh: new Set(),
    dt: 0,
    dying: 0,
    gone: 0,
    step: 0,
    jumps: 0,
    dcd: 0,
    last: -99,
    flip: 0
  };
}
// Players live in PL. P / STM / K... are bound to one player at a time by use(p); everything else reads them as before.
function mkPlayer(x, slot, col, d2) {
  const p = F(x, 0, 1);
  p.slot = slot;
  p.stm = { v: SURGE.max, last: -999, winded: 0, flash: 0 };
  Object.assign(p, { combo: 0, comboT: 0, meter: 0, hpT: 100 });
  if (col) {
    p.col = col;
    p.d2 = d2;
  }
  return p;
}
function use(p) {
  P = p;
  STM = p.stm;
  const I = INP[p.slot];
  K = I.K;
  press = I.press;
  AIM = I.AIM;
  SRG = I.SRG;
}
function addPlayer() {
  if (PL.length > 1) return PL[1];
  const p = mkPlayer(W / 2 - 90, 1, '#2fb5ff', '#1d86c4');
  PL.push(p);
  return p;
} // M9 (multiplayer) calls this when a second player joins
function tgt(e) {
  let b = null,
    bd = 1e9;
  for (const p of PL) {
    if (p.st === 'dead') continue;
    const d = Math.abs(p.x - e.x);
    if (d < bd) {
      bd = d;
      b = p;
    }
  }
  return b;
}
function init() {
  wave = 0;
  CAM.x = WB.l = WW.l = 0;
  WB.r = WW.r = W;
  MODE = ARCADE;
  const R = ROSTER.length ? ROSTER : [{ slot: 0 }];
  PL = R.map((r, i) => {
    // Looks (M10): a multiplayer player brings the look picked on the Players screen; one player uses the
    // current saved fighter. Looks are drawing only.
    const L = r.look || (ROSTER.length ? null : lookOf(curFighter())),
      p = mkPlayer(W / 2 + (i - (R.length - 1) / 2) * 80, r.slot, L ? L.col : r.col, L ? L.d2 : r.d2);
    p.look = L;
    p.name = r.name || (L && L.name) || 'ORANGE';
    p.team = r.team;
    return p;
  });
  PK = [];
  RUN.stars = 0;
  RUN.items = [];
  use(PL[0]);
  camX = camY = 0;
  E = [];
  FX = [];
  GH = [];
  score = maxc = stop = slow = shake = zoom = cl = deadT = 0;
  banner = null;
  queue = [];
  spawnT = 0;
}
// ===== PLAYER =====
// Kneeling block pose. It trembles harder as the Surge bar empties, and flinches when a hit is blocked.
function blockPose(f) {
  const weak = 1 - STM.v / SURGE.max,
    amp = 1 + weak * 7 + (f.blkT > 0 ? f.blkT * 0.8 : 0),
    j = Math.sin(f.t * 1.9) * amp,
    j2 = Math.cos(f.t * 2.3) * amp;
  return [
    10 + j * 0.6 - (f.blkT || 0) * 0.8,
    85 + j2,
    85 + j,
    65 - j2,
    105 - j,
    90,
    90 + j * 0.3,
    -15,
    75,
    0
  ];
}
function updP() {
  const f = P;
  f.t++;
  if (f.inv > 0) f.inv--;
  if (f.flash > 0) f.flash--;
  if (f.dcd > 0) f.dcd--;
  if (f.phase > 0) f.phase--;
  stamTick();
  if (f.sj > 0) {
    f.sj--;
    if (f.t % 2 === 0) ghost(f, '#ffd400');
  }
  if (f.comboT > 0 && --f.comboT === 0) f.combo = 0;
  let tp = f.pose,
    k = 0.3;
  if (f.st === 'dead') {
    f.deadT = (f.deadT || 0) + 1;
    if (f.y < G - 2) {
      f.sp += f.vx >= 0 ? 18 : -18;
      f.pose[9] = f.sp;
      tp = FLY;
    } else {
      f.pose[9] = 90;
      tp = LIE;
      f.vx *= 0.85;
    }
    if (f.deadT > 110 && PL.every(p => p.st === 'dead')) over();
  } else if (f.st === 'held') {
    // Grabbed by another player (Versus): mash punch, kick or jump to break free
    tp = HURT;
    f.vx = f.vy = 0;
    const g = f.held;
    if (want('p') || want('k') || want('j')) {
      eat('p');
      eat('k');
      eat('j');
      f.esc = (f.esc || 0) + 1;
      f.flash = 2;
    }
    if (!g || g.st !== 'grab' || g.gt !== f) {
      f.st = 'free';
      f.held = null;
      f.esc = 0;
    } else if (f.esc >= 6) {
      g.st = 'free';
      g.gt = null;
      g.vx = -g.face * 4;
      f.st = 'free';
      f.held = null;
      f.esc = 0;
      f.inv = 30;
      f.vx = g.face * 4;
      txt(f.x, f.y - 110, 'BROKE FREE!', f.col, 18);
      sfx(400, 0.12, 'square', 0.05, 200);
    }
  } else if (f.st === 'hurt') {
    tp = HURT;
    f.vx *= 0.92;
    if (--f.stun <= 0) f.st = 'free';
  } else if (f.st === 'fly') {
    tp = FLY;
    f.sp += f.spv;
    f.pose[9] = f.sp;
  } else if (f.st === 'down') {
    tp = LIE;
    f.pose[9] = 90;
    f.vx *= 0.8;
    if (--f.dt <= 0) {
      f.st = 'getup';
      f.dt = 14;
      f.pose[9] = 0;
    }
  } else if (f.st === 'getup') {
    tp = KNEEL;
    f.vx *= 0.8;
    if (--f.dt <= 0) f.st = 'free';
  } else if (f.st === 'grab') {
    const e = f.gt;
    f.vx *= 0.6;
    f.gd++;
    if (!e || e.gone || e.st !== 'held') f.st = 'free';
    else {
      tp = f.pt > 0 ? KNEE : GRB;
      k = 0.5;
      if (f.pt > 0) f.pt--;
      e.x = f.x + f.face * 32;
      e.y = f.y - 8;
      e.face = -f.face;
      const m = (K.r ? 1 : 0) - (K.l ? 1 : 0);
      if (want('k')) {
        eat('k');
        throwE(f, e, K.u ? 'u' : K.d ? 'd' : m && m !== f.face ? 'b' : 'f');
      } else if (want('p') && f.pt <= 0 && f.pum < 3) {
        eat('p');
        f.pum++;
        f.pt = 10;
        pummel(f, e);
      } else if (f.gd > 100) {
        e.st = 'hurt';
        e.stun = 8;
        e.held = null;
        e.vx = f.face * 4;
        f.st = 'free';
        f.vx = -f.face * 3;
        txt(e.x, e.y - 100 * e.s, 'ESCAPED', '#7a6e80', 16);
      }
    }
  } else if (f.st === 'slide') {
    tp = SLIDE;
    k = 0.5;
    f.vx *= 0.955;
    f.phase = 2;
    if (f.t % 2 === 0) ghost(f, '#ffd400');
    if (f.t % 3 === 0) dust(f.x, G, 1);
    const b = want('p') ? 'p' : want('k') ? 'k' : 0;
    if (b) {
      eat(b);
      startAtk(f, pick(f, b, false), b);
    } else if (--f.dt <= 0) f.st = 'free';
  } else if (f.st === 'atk') {
    tickAtk(f);
    if (f.tp) tp = f.tp;
    k = 0.6;
    f.vx *= f.y >= G ? 0.9 : 0.97;
    if (f.t % 2 === 0 && f.att && (f.att.d.cost || f.att.d.dmg >= 9 || f.att.d.dive))
      ghost(f, f.att.d.cost ? '#ffd400' : 0);
  }
  f.blk = 0;
  if (f.blkT > 0) f.blkT--;
  if (f.st === 'free') {
    const g = f.y >= G - 1,
      m = (K.r ? 1 : 0) - (K.l ? 1 : 0);
    // Block: Down + Surge, standing still on the ground. Drains Surge slowly while held (see blockHit).
    if (g && K.d && K.s && !m && !f.flip && canSurge()) {
      f.blk = 1;
      f.vx *= 0.6;
      if (!infS()) {
        STM.v -= SURGE.blockDrain / 60;
        STM.last = fr;
        if (STM.v <= 0) {
          wind();
          f.blk = 0;
        }
      }
    }
    if (g) {
      f.jumps = 0;
      f.hop = 0;
    }
    // Surge run: hold Surge + a direction. Faster, drains the bar, passes through enemy bodies.
    const run = K.s && m && canSurge();
    f.running = run ? 1 : 0;
    const spd = STM.winded ? 2.4 : run ? SURGE.runSpeed : 4;
    if (m) {
      f.face = m;
      f.vx += (m * spd - f.vx) * (run ? 0.25 : 0.3);
    } else f.vx *= g ? 0.78 : 0.97;
    if (run) {
      f.phase = 2;
      if (!infS()) {
        STM.v -= SURGE.runDrain / 60;
        STM.last = fr;
        if (STM.v <= 0) wind();
      }
      if (f.t % 3 === 0) ghost(f, '#ffd400');
      if (f.t % 2 === 0)
        fxp({
          k: 'l',
          x: f.x - f.face * (20 + rnd() * 40),
          y: f.y - 8 - rnd() * 72,
          len: 30 + rnd() * 50,
          dir: f.face,
          l: 9,
          m: 9
        });
      if (g && f.t % 6 === 0) dust(f.x, G, 1);
    }
    if (want('j') && K.s && canSurge() && (g || !f.hop) && spend(g ? SURGE.jumpCost : SURGE.hopCost)) {
      eat('j');
      if (g) {
        f.vy = -16.5;
        if (m) f.vx = m * Math.max(Math.abs(f.vx), 6);
        f.jumps = 1;
        f.sj = 26;
        ring(f.x, G, 40);
        dust(f.x, G, 8);
        sfx(380, 0.2, 'sawtooth', 0.05, 500);
      } else {
        f.hop = 1;
        f.flip = 0;
        f.vy = -5;
        f.vx = (m || f.face) * 12;
        if (m) f.face = m;
        f.phase = 16;
        f.sj = 16;
        ring(f.x, f.y - 35, 34);
        sfx(520, 0.15, 'sawtooth', 0.05, -200);
      }
    } else if (want('j') && f.jumps < 2) {
      eat('j');
      f.vy = f.jumps ? -11.5 : -13.5;
      if (f.jumps) {
        f.flip = 24;
        ring(f.x, f.y - 20, 26);
      }
      dust(f.x, f.y, 4);
      sfx(300, 0.12, 'square', 0.04, 300);
      f.jumps++;
    }
    const go = (def, btn) => {
      const n = near(f);
      if (!m && n) f.face = n.x > f.x ? 1 : -1;
      startAtk(f, def, btn);
    };
    if (want('p')) {
      eat('p');
      go(pick(f, 'p', fr - f.last < 30), 'p');
    } else if (want('k')) {
      eat('k');
      go(pick(f, 'k', fr - f.last < 30), 'k');
    } else if (want('d') && K.s && m && g && canSurge() && spend(SURGE.slideCost)) {
      eat('d');
      f.st = 'slide';
      f.dt = 24;
      f.face = m;
      f.vx = m * 11;
      f.running = 0;
      dust(f.x, G, 6);
      sfx(300, 0.2, 'sawtooth', 0.04, -200);
    } else if (want('x') && f.meter >= 100) {
      eat('x');
      f.meter = 0;
      go(A.tornado);
      f.inv = 999;
      f.vy = -6;
      zoom = 0.05;
      shake = 6;
      bn('TORNADO KICK!');
      sfx(150, 0.5, 'sawtooth', 0.07, 500);
    }
    if (f.st === 'free') {
      if (f.flip > 0) {
        f.flip--;
        f.pose[9] = f.flip > 0 ? (1 - f.flip / 24) * 360 : 0;
        tp = TUCK;
      } else
        tp = f.blk
          ? blockPose(f)
          : f.running && g
            ? runPose(f)
            : STM.winded && g && !m
              ? [TIRED[0] + Math.sin(f.t * 0.25) * 4, ...TIRED.slice(1)]
              : freePose(f);
    }
  }
  const imp = phys(f);
  if (imp > 6) dust(f.x, G, 4);
  if (f.st === 'fly' && imp > 0) {
    f.st = 'down';
    f.dt = 30;
    dust(f.x, G, 6);
    shake = Math.max(shake, 4);
  }
  smooth(f, tp, k);
  if (f.st === 'atk' && f.tp) f.pose[9] = tp[9];
  ragTick(f);
}
