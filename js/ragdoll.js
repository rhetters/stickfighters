// Orange vs. the Pink Army: Ragdolls, death poses and corpse cleanup
// ===== RAGDOLL (M5) =====
// 13 points: 0 head, 1 neck, 2 shoulders, 3 mid-spine, 4 pelvis, 5/6 front elbow/hand, 7/8 back elbow/hand, 9/10 front knee/foot, 11/12 back knee/foot.
// Verlet physics: each point keeps its last position; segments hold their length; a few min-distance links stop elbows/knees folding flat.
// While alive the mid-spine is pinned to the gameplay body (so juggles, hitboxes and bowling are unchanged) and the limbs flail freely.
// Dead bodies are released, tumble, settle, then ease into a death pose chosen by how they died.
const RSEG = [
  [0, 1, 11],
  [1, 2, 3.1],
  [2, 3, 9.9],
  [3, 4, 13],
  [1, 4, 26, 1],
  [2, 4, 22.9, 1],
  [0, 4, 36.5, 1],
  [0, 2, 14, 1],
  [2, 5, 13],
  [5, 6, 13],
  [2, 7, 13],
  [7, 8, 13],
  [4, 9, 15],
  [9, 10, 15],
  [4, 11, 15],
  [11, 12, 15],
  [2, 6, 8, 2],
  [2, 8, 8, 2],
  [4, 10, 12, 2],
  [4, 12, 12, 2]
];
const RS = f => f.st === 'fly' || f.st === 'down' || f.st === 'splat' || f.st === 'dead' || f.corpse;
function figPts(x, y, face, p, s, spin) {
  const th = 15 * s,
    sh = 15 * s,
    ua = 13 * s,
    fa = 13 * s,
    to = 26 * s,
    hr = 9 * s,
    [ln, aS, aE, bS, bE, lH, lK, rH, rK] = p;
  const fy = (h, k) => th * Math.cos(h * D) + sh * Math.cos((h - k) * D),
    hy = y - Math.max(fy(lH, lK), fy(rH, rK));
  const Q = (px, py, a, l) => [px + Math.sin(a * D) * l * face, py + Math.cos(a * D) * l];
  const neck = Q(x, hy, 180 - ln, to),
    sho = Q(x, hy, 180 - ln, to * 0.88),
    head = Q(neck[0], neck[1], 180 - ln * 1.3, hr + 2),
    mid = Q(x, hy, 180 - ln, to * 0.5);
  const kF = Q(x, hy, lH, th),
    fF = Q(kF[0], kF[1], lH - lK, sh),
    kB = Q(x, hy, rH, th),
    fB = Q(kB[0], kB[1], rH - rK, sh);
  const eA = Q(sho[0], sho[1], aS, ua),
    hA = Q(eA[0], eA[1], aS + aE, fa),
    eB = Q(sho[0], sho[1], bS, ua),
    hB = Q(eB[0], eB[1], bS + bE, fa);
  const cy = y - 30 * s,
    r = spin * face * D,
    c = Math.cos(r),
    sn = Math.sin(r);
  return [head, neck, sho, mid, [x, hy], eA, hA, eB, hB, kF, fF, kB, fB].map(q => [
    x + (q[0] - x) * c - (q[1] - cy) * sn,
    cy + (q[0] - x) * sn + (q[1] - cy) * c
  ]);
}
function mkRag(f) {
  const lying = f.st === 'down' || f.st === 'kneel';
  const pts = figPts(f.x, f.y + (f.st === 'down' ? 26 * f.s : 0), f.face, f.pose, f.s, f.pose[9]);
  return { p: pts.map(([x, y]) => ({ x, y, px: x - f.vx, py: y - f.vy })), blend: 0, pin: 0 };
}
// A hit pushes different parts of the body depending on the effect, so the tumble reads the hit.
function ragHit(R, dr, ef, s) {
  const P_ = R.p,
    add = (ids, x, y) => {
      for (const i of ids) {
        P_[i].px -= x;
        P_[i].py -= y;
      }
    };
  R.set = 0;
  R.pt = 0;
  R.frozen = 0;
  if (ef === 'launch' || ef === 'pop') {
    add([0, 1, 2], dr * 3, -1.5);
    add([10, 12], -dr * 2, 1);
  } else if (ef === 'trip') {
    add([10, 12, 9, 11], dr * 5, -4);
    add([0, 1], -dr * 1.5, 1);
  } else if (ef === 'bounce') {
    add([0, 1, 2, 5, 6, 7, 8], dr * 1, 5);
  } else if (ef === 'kneel') {
    add([0, 1, 2, 3], dr * 2.2, -0.5);
  } else add([0, 1, 2, 5, 7], dr * 3.2, -1);
}
function ragStep(R, s) {
  const P_ = R.p,
    g = 0.7 * FEEL.grav;
  for (let i = 0; i < 13; i++) {
    const p = P_[i];
    const vx = (p.x - p.px) * 0.99,
      vy = (p.y - p.py) * 0.99;
    p.px = p.x;
    p.py = p.y;
    if (R.pin && i === 3) continue;
    p.x += vx;
    p.y += vy + g;
  }
  for (let it = 0; it < 5; it++) {
    for (const [a, b, L, kind] of RSEG) {
      const A_ = P_[a],
        B_ = P_[b],
        dx = B_.x - A_.x,
        dy = B_.y - A_.y,
        d = Math.hypot(dx, dy) || 0.001,
        len = L * s;
      if (kind === 2 && d >= len) continue; // min-distance only
      const wa = R.pin && a === 3 ? 0 : 1,
        wb = R.pin && b === 3 ? 0 : 1,
        w = wa + wb;
      if (!w) continue;
      const k = ((d - len) / d / w) * (kind === 1 ? 0.8 : 1);
      A_.x += dx * k * wa;
      A_.y += dy * k * wa;
      B_.x -= dx * k * wb;
      B_.y -= dy * k * wb;
    }
    for (let i = 0; i < 13; i++) {
      const p = P_[i],
        r = i === 0 ? 9 * s : 2.5,
        gy = groundY(p.x);
      if (p.y > gy - r) {
        const vy = p.y - p.py;
        p.y = gy - r;
        p.py = p.y + Math.max(0, vy) * 0.25;
        p.px = p.x - (p.x - p.px) * 0.7;
      } // floor: small bounce, friction
      if (p.x < WW.l + r) {
        p.x = WW.l + r;
        p.px = p.x + (p.x - p.px) * 0.3;
      } else if (p.x > WW.r - r) {
        p.x = WW.r - r;
        p.px = p.x + (p.x - p.px) * 0.3;
      }
    }
  }
}
// Death poses: [x, y] per point in body units, x along the fall direction (or away from the wall), y up = negative, pelvis on the ground.
const DPOSE = {
  sprawl: [
    [36, -10],
    [26, -5],
    [23, -4],
    [13, -4],
    [0, -4],
    [35, -2],
    [48, -2],
    [11, -2],
    [-1, -2],
    [-14, -3],
    [-29, -2],
    [-12, -2],
    [-22, -11]
  ],
  back: [
    [37, -10],
    [26, -6],
    [23, -5],
    [13, -4],
    [0, -4],
    [30, -15],
    [38, -26],
    [35, -3],
    [48, -3],
    [-8, -15],
    [-18, -5],
    [-15, -3],
    [-30, -3]
  ],
  curl: [
    [34, -14],
    [24, -11],
    [21, -10],
    [12, -8],
    [0, -6],
    [31, -3],
    [21, -5],
    [12, -4],
    [24, -3],
    [12, -14],
    [-2, -11],
    [11, -6],
    [-3, -4]
  ],
  slump: [
    [8, -41],
    [5, -31],
    [5, -28],
    [6, -18],
    [8, -5],
    [11, -17],
    [18, -7],
    [3, -16],
    [6, -4],
    [20, -13],
    [33, -5],
    [21, -8],
    [35, -3]
  ],
  kneel: [
    [29, -9],
    [20, -3],
    [18, -4],
    [10, -9],
    [0, -17],
    [30, -3],
    [42, -3],
    [8, -2],
    [-4, -2],
    [2, -3],
    [-13, -2],
    [-1, -3],
    [-16, -2]
  ],
  legsup: [
    [35, -9],
    [25, -3],
    [22, -3],
    [13, -9],
    [5, -16],
    [34, -2],
    [46, -2],
    [12, -2],
    [0, -2],
    [2, -30],
    [1, -45],
    [8, -29],
    [12, -42]
  ],
  plant: [
    [25, -9],
    [17, -5],
    [15, -7],
    [8, -14],
    [0, -24],
    [24, -3],
    [34, -2],
    [4, -3],
    [-6, -2],
    [-9, -35],
    [-20, -46],
    [-12, -31],
    [-26, -35]
  ],
  fold: [
    [34, -11],
    [24, -7],
    [21, -6],
    [12, -5],
    [0, -4],
    [27, -16],
    [34, -26],
    [30, -3],
    [42, -3],
    [8, -17],
    [14, -31],
    [4, -18],
    [12, -31]
  ]
};
const DPNAME = {
  sprawl: 'Face-down sprawl',
  back: 'Spread-eagle on back',
  curl: 'Curled on side',
  slump: 'Slumped against wall',
  kneel: 'Knelt, toppled forward',
  legsup: 'Legs up the wall',
  plant: 'Face-plant, legs up',
  fold: 'Folded in half'
};
// Bodies settle, ease into their death pose, hold, then puff into confetti. At most 12 bodies stay on screen.
function corpseTick(f, dissolve) {
  const R = f.rag;
  if (!R) return;
  f.ct = (f.ct || 0) + 1;
  f.vx = 0;
  if (!R.frozen) {
    ragStep(R, f.s);
    f.x = R.p[4].x;
  }
  if (!R.set) {
    let m = 0;
    for (const p of R.p) m += Math.abs(p.x - p.px) + Math.abs(p.y - p.py);
    if (m / 13 < 0.12 || f.ct > 90) {
      if (dissolve && FEEL.body < 0.5) {
        R.set = 1;
        R.frozen = 1;
        R.dis = 1;
      } else {
        R.set = 1;
        R.pt = 0;
        let k = f.dk || 'sprawl';
        const nearWall = R.p[4].x < WB.l + 110 || R.p[4].x > WB.r - 110;
        if ((k === 'slump' || k === 'legsup') && !nearWall) k = 'sprawl';
        const wallDir = R.p[4].x < (WB.l + WB.r) / 2 ? 1 : -1,
          dir = k === 'slump' || k === 'legsup' ? wallDir : f.ddir || f.face || 1,
          ax = k === 'slump' || k === 'legsup' ? (wallDir > 0 ? WB.l + 16 : WB.r - 16) : R.p[4].x;
        R.tpl = DPOSE[k].map(([x, y]) => ({ x: ax + x * dir * f.s, y: G + y * f.s }));
        R.pose = k;
        if (state === 'train') txt(R.p[4].x, G - 70, DPNAME[k], '#7a6e80', 14);
      }
    }
  } else if (!R.frozen) {
    R.pt++;
    const k = Math.min(0.2, R.pt * 0.007);
    for (let i = 0; i < 13; i++) {
      const p = R.p[i],
        t = R.tpl[i],
        dx = (t.x - p.x) * k,
        dy = (t.y - p.y) * k;
      p.x += dx;
      p.y += dy;
      p.px += dx;
      p.py += dy;
    }
    if (R.pt > 50) {
      for (let i = 0; i < 13; i++) {
        R.p[i].x = R.p[i].px = R.tpl[i].x;
        R.p[i].y = R.p[i].py = R.tpl[i].y;
      }
      R.frozen = 1;
      R.hold = 0;
    }
  } else if (dissolve && !R.dis && ++R.hold > FEEL.body * 60) R.dis = 1;
  if (R.dis) {
    R.dis++;
    if (R.dis % 3 === 0) {
      const q = R.p[(rnd() * 13) | 0];
      for (let i = 0; i < 3; i++)
        fxp({
          k: 'c',
          x: q.x,
          y: q.y,
          vx: (rnd() - 0.5) * 3,
          vy: -1 - rnd() * 2.5,
          a: rnd() * 6,
          va: (rnd() - 0.5) * 0.4,
          c: ['#ff4fa3', '#ff93c8', '#ffd1e8', '#ffffff'][(rnd() * 4) | 0],
          l: 34,
          m: 34
        });
    }
    if (R.dis > 32) {
      f.gone = 1;
      dust(R.p[3].x, G, 4);
    }
  }
}
function ragTick(f) {
  if (RS(f)) {
    if (!f.rag) {
      f.rag = mkRag(f);
      if (f.ri) ragHit(f.rag, f.ri.dr, f.ri.ef, f.s);
      f.ri = null;
    }
    const R = f.rag;
    R.fade = 0;
    R.blend = Math.min(1, R.blend + 0.34);
    if (f.ri) {
      ragHit(R, f.ri.dr, f.ri.ef, f.s);
      f.ri = null;
    }
    if (f.corpse || f.st === 'dead') {
      R.pin = 0;
      corpseTick(f, !f.pl);
      return;
    }
    // alive: pin the mid-spine to the gameplay body
    R.pin = 1;
    const m = R.p[3],
      tx = f.st === 'down' ? f.x : f.st === 'splat' ? f.x + f.face * 8 * f.s : f.x,
      ty = f.st === 'down' ? G - 5 * f.s : f.y - 30 * f.s;
    m.x = tx;
    m.y = ty;
    m.px = tx - f.vx;
    m.py = ty - f.vy;
    ragStep(R, f.s);
  } else if (f.rag) {
    f.rag.fade = (f.rag.fade || 9) - 1;
    if (f.rag.fade <= 0) f.rag = null;
  }
} // back to animation: crossfade over 8 frames
function drawRag(f, a) {
  const R = f.rag,
    Q = R.p,
    s = f.s,
    fl = f.flash > 0,
    c1 = fl ? INK : f.col,
    c2 = fl ? INK : f.d2,
    lk = f.look,
    lw = (lk ? lk.lw : 7) * Math.pow(s, 0.7),
    // a bigger head (character creation) sits further out along the neck
    hk = lk ? lk.head : 1,
    nx = Q[0].x - Q[1].x,
    ny = Q[0].y - Q[1].y,
    nd = Math.hypot(nx, ny) || 1,
    hx = Q[0].x + (nx / nd) * 9 * s * (hk - 1),
    hy = Q[0].y + (ny / nd) * 9 * s * (hk - 1),
    pt = i => [Q[i].x, Q[i].y],
    J = lk
      ? {
          hd: [hx, hy],
          hr: 9 * s * hk,
          nk: pt(1),
          sh: pt(2),
          hp: pt(4),
          ea: pt(5),
          h: pt(6),
          eb: pt(7),
          hb: pt(8),
          kf: pt(9),
          f: pt(10),
          kb: pt(11),
          fb: pt(12),
          face: f.face,
          s,
          lw,
          col: c1
        }
      : null;
  if (J) drawLookUnder(f, J, a);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = lw;
  const L = (c, ids) => {
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.moveTo(Q[ids[0]].x, Q[ids[0]].y);
    for (let i = 1; i < ids.length; i++) ctx.lineTo(Q[ids[i]].x, Q[ids[i]].y);
    ctx.stroke();
  };
  L(c2, [2, 7, 8]);
  L(c2, [4, 11, 12]);
  L(c1, [4, 3, 2, 1]);
  L(c1, [4, 9, 10]);
  L(c1, [2, 5, 6]);
  ctx.beginPath();
  ctx.arc(hx, hy, 9 * s * hk, 0, 7);
  ctx.stroke();
  ctx.restore();
  if (J) drawLook(f, J, a);
}
// Tornado Kick drawing: the fighter stays upright and turns around its own vertical axis, one leg locked straight out.
// The leg's sideways reach is cos(angle); when it swings behind the body it's drawn in the back colour, before the body.
function drawTatsu(f, a, fl) {
  const at = f.att,
    s = f.s,
    th0 = at.f * 0.52,
    th = (th0 - 0.38 * Math.sin(2 * th0)) * f.face,
    x = f.x,
    y = f.y,
    hipY = y - 26 * s,
    shY = y - 50 * s,
    c1 = fl ? INK : f.col,
    c2 = fl ? INK : f.d2,
    L = 30 * s,
    cs = Math.cos(th),
    sn = Math.sin(th);
  const leg = [x + cs * L, hipY + 2 * s],
    knee = [x + cs * L * 0.5, hipY + 1 * s],
    tk = [x - cs * 9 * s, hipY + 9 * s],
    tf = [x - cs * 1 * s, hipY + 21 * s],
    el = [x - cs * 13 * s, shY + 3 * s],
    hd = [x - cs * 22 * s, shY + 6 * s],
    el2 = [x + cs * 9 * s, shY + 8 * s],
    hd2 = [x + cs * 3 * s, shY + 15 * s];
  const lk = f.look,
    lw0 = lk ? lk.lw : 7,
    hk = lk ? lk.head : 1;
  const ln = (c, pts, w) => {
    ctx.strokeStyle = c;
    ctx.lineWidth = w || lw0 * Math.pow(s, 0.7);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  };
  // swirl: the foot's path over the last few frames, on a flat ellipse around the hips; split into back and front halves for depth
  const arc = front => {
    if (!front) {
      ctx.globalAlpha = a * 0.28;
      ctx.strokeStyle = '#3ec5ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x, hipY + 2 * s, L + 10 * s, 10 * s, 0, 0, 7);
      ctx.stroke();
    } // wind ring
    for (let k = 14; k >= 1; k--) {
      const t0 = th - f.face * k * 0.22,
        t1 = th - f.face * (k - 1) * 0.22;
      if (Math.sin(t1) * f.face >= 0 !== front) continue;
      const al = (1 - k / 15) * 0.95;
      for (const [ry, rx, col, w] of [
        [9 * s, L + 6 * s, '#3ec5ff', 15 - k * 0.9],
        [6 * s, L - 4 * s, '#ffffff', 8 - k * 0.5],
        [6 * s, 22 * s, '#bfefff', 6 - k * 0.35]
      ]) {
        const yy = rx === 22 * s ? shY + 5 * s : hipY + 2 * s;
        ctx.globalAlpha = a * al;
        ctx.strokeStyle = col;
        ctx.lineWidth = Math.max(1, w);
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(t0) * rx, yy + Math.sin(t0) * ry);
        ctx.lineTo(x + Math.cos(t1) * rx, yy + Math.sin(t1) * ry);
        ctx.stroke();
      }
    }
  };
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  arc(false);
  ctx.globalAlpha = a;
  const behind = sn * f.face < 0;
  if (behind) ln(c2, [[x, hipY], knee, leg]);
  ln(c2, [[x, hipY], tk, tf]);
  ln(c2, [[x, shY], el2, hd2]);
  ln(c1, [
    [x, hipY],
    [x + f.face * 2 * s, shY - 4 * s]
  ]);
  const hy0 = y - 64 * s - 9 * s * (hk - 1);
  ctx.beginPath();
  ctx.arc(x + f.face * 3 * s, hy0, 9 * s * hk, 0, 7);
  ctx.strokeStyle = c1;
  ctx.stroke();
  ln(c1, [[x, shY], el, hd]);
  if (!behind) ln(c1, [[x, hipY], knee, leg], (lw0 + 1.5) * Math.pow(s, 0.7));
  arc(true);
  ctx.restore();
  if (lk)
    drawLook(
      f,
      {
        hd: [x + f.face * 3 * s, hy0],
        hr: 9 * s * hk,
        nk: [x + f.face * 2 * s, shY - 4 * s],
        sh: [x, shY],
        hp: [x, hipY],
        ea: el,
        h: hd,
        eb: el2,
        hb: hd2,
        kf: knee,
        f: leg,
        kb: tk,
        fb: tf,
        face: f.face,
        s,
        lw: lw0 * Math.pow(s, 0.7),
        col: c1
      },
      a
    );
}
