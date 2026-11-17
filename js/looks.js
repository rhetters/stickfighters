// Orange vs. the Pink Army: Drawing a fighter's look (M10): hats, headbands, scarves, gloves, shoes, trails,
// idle stances and victory poses. Drawing only: nothing here changes the game, and it never calls rnd().
// ===== LOOKS (M10) =====
// J = joint positions from whichever drawer drew the body (standing figure, ragdoll or Tornado Kick):
//   hd head centre, hr head radius, nk neck, h / hb front / back hand, f / fb front / back foot, face, s scale.
const LOOKK = new WeakMap(); // per-fighter blend amounts for the stance and the victory pose (drawing only)
function rainbow(i) {
  return 'hsl(' + ((i * 47 + fr * 6) % 360) + ' 90% 55%)';
}
// Draws in a frame fixed to the head: origin = point, x = the way you face, y = down along the neck.
function headFrame(J, at, fn) {
  let ux = J.hd[0] - J.nk[0],
    uy = J.hd[1] - J.nk[1];
  const d = Math.hypot(ux, uy) || 1;
  ux /= d;
  uy /= d;
  ctx.save();
  ctx.translate(at[0], at[1]);
  ctx.rotate(Math.atan2(ux, -uy));
  ctx.scale(J.face, 1);
  fn();
  ctx.restore();
}
function shapeDo(fill, lw) {
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.stroke();
}
function drawHat(it, r, w) {
  const c = it.c,
    c2 = it.c2 || INK,
    P = (pts, fill) => {
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0] * r, p[1] * r) : ctx.moveTo(p[0] * r, p[1] * r)));
      ctx.closePath();
      shapeDo(fill, w);
    },
    dome = (k, fill) => {
      ctx.beginPath();
      ctx.arc(0, 0, r * k, Math.PI + 0.12, -0.12);
      ctx.closePath();
      shapeDo(fill, w);
    },
    ell = (x, y, rx, ry, fill) => {
      ctx.beginPath();
      ctx.ellipse(x * r, y * r, rx * r, ry * r, 0, 0, 7);
      shapeDo(fill, w);
    };
  switch (it.id) {
    case 'hat-cap':
      ell(1.05, -0.2, 0.8, 0.2, shade(c, -0.25));
      dome(1.08, c);
      ell(0, -1.08, 0.16, 0.1, shade(c, -0.25));
      break;
    case 'hat-beanie':
      dome(1.12, c);
      P(
        [
          [-1.15, -0.05],
          [1.15, -0.05],
          [1.12, -0.42],
          [-1.12, -0.42]
        ],
        c2
      );
      ell(0, -1.3, 0.3, 0.3, c2);
      break;
    case 'hat-party':
      P(
        [
          [-0.75, -0.55],
          [0.75, -0.55],
          [0.1, -2.7]
        ],
        c
      );
      ctx.strokeStyle = c2;
      ctx.lineWidth = w * 1.4;
      ctx.beginPath();
      ctx.moveTo(-0.45 * r, -1.1 * r);
      ctx.lineTo(0.55 * r, -1.3 * r);
      ctx.moveTo(-0.2 * r, -1.75 * r);
      ctx.lineTo(0.38 * r, -1.9 * r);
      ctx.stroke();
      ell(0.1, -2.75, 0.28, 0.28, c2);
      break;
    case 'hat-headphones':
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.25, Math.PI + 0.35, -0.35);
      ctx.strokeStyle = INK;
      ctx.lineWidth = w * 3;
      ctx.stroke();
      ctx.strokeStyle = c2;
      ctx.lineWidth = w * 1.4;
      ctx.stroke();
      ell(-0.05, 0.05, 0.45, 0.62, c);
      ell(-0.05, 0.05, 0.2, 0.32, c2);
      break;
    case 'hat-chef':
      ell(-0.62, -1.55, 0.6, 0.6, c);
      ell(0.62, -1.55, 0.6, 0.6, c);
      ell(0, -1.85, 0.72, 0.72, c);
      P(
        [
          [-0.85, -0.55],
          [0.85, -0.55],
          [0.85, -1.3],
          [-0.85, -1.3]
        ],
        c
      );
      break;
    case 'hat-cowboy':
      P(
        [
          [-0.8, -0.8],
          [-0.72, -1.85],
          [-0.2, -1.65],
          [0.2, -1.65],
          [0.72, -1.85],
          [0.8, -0.8]
        ],
        c
      );
      P(
        [
          [-0.8, -0.82],
          [0.8, -0.82],
          [0.78, -1.08],
          [-0.78, -1.08]
        ],
        c2
      );
      ctx.beginPath();
      ctx.moveTo(-2 * r, -0.95 * r);
      ctx.quadraticCurveTo(0, -0.35 * r, 2 * r, -0.95 * r);
      ctx.quadraticCurveTo(0, -0.62 * r, -2 * r, -0.95 * r);
      shapeDo(c, w);
      break;
    case 'hat-top':
      P(
        [
          [-0.8, -0.9],
          [0.8, -0.9],
          [0.8, -2.75],
          [-0.8, -2.75]
        ],
        c
      );
      P(
        [
          [-0.8, -0.9],
          [0.8, -0.9],
          [0.8, -1.3],
          [-0.8, -1.3]
        ],
        c2
      );
      P(
        [
          [-1.35, -0.78],
          [1.35, -0.78],
          [1.35, -1.02],
          [-1.35, -1.02]
        ],
        c
      );
      break;
    case 'hat-wizard':
      ctx.beginPath();
      ctx.moveTo(-1.05 * r, -0.65 * r);
      ctx.lineTo(1.05 * r, -0.65 * r);
      ctx.quadraticCurveTo(0.4 * r, -2.2 * r, -1.3 * r, -3.1 * r);
      ctx.quadraticCurveTo(-0.6 * r, -2 * r, -1.05 * r, -0.65 * r);
      shapeDo(c, w);
      ell(0, -0.7, 1.55, 0.28, c);
      star4(0.15 * r, -1.55 * r, 0.32 * r, c2);
      star4(-0.55 * r, -2.2 * r, 0.22 * r, c2);
      break;
    case 'hat-ranger':
      P(
        [
          [-0.78, -0.75],
          [-0.55, -1.95],
          [0, -1.62],
          [0.55, -1.95],
          [0.78, -0.75]
        ],
        c
      );
      P(
        [
          [-0.78, -0.76],
          [0.78, -0.76],
          [0.74, -1.02],
          [-0.74, -1.02]
        ],
        c2
      );
      ell(0, -0.72, 1.85, 0.3, c);
      break;
    case 'hat-halo':
      ctx.beginPath();
      ctx.ellipse(0, -1.75 * r, 0.95 * r, 0.3 * r, 0, 0, 7);
      ctx.strokeStyle = INK;
      ctx.lineWidth = w * 3.2;
      ctx.stroke();
      ctx.strokeStyle = c;
      ctx.lineWidth = w * 1.6;
      ctx.stroke();
      break;
    case 'hat-viking':
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(sx * 0.7 * r, -0.75 * r);
        ctx.quadraticCurveTo(sx * 1.7 * r, -0.9 * r, sx * 1.55 * r, -2.1 * r);
        ctx.quadraticCurveTo(sx * 1.25 * r, -1.2 * r, sx * 0.55 * r, -1.1 * r);
        ctx.closePath();
        shapeDo(c2, w);
      }
      dome(1.12, c);
      P(
        [
          [-1.12, -0.12],
          [1.12, -0.12],
          [1.1, -0.42],
          [-1.1, -0.42]
        ],
        shade(c, -0.2)
      );
      break;
    case 'hat-propeller': {
      ctx.strokeStyle = INK;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(0, -1.05 * r);
      ctx.lineTo(0, -1.6 * r);
      ctx.stroke();
      const k = Math.cos(fr * 0.6);
      ell(0, -1.62, Math.max(0.12, Math.abs(k) * 1.2), 0.16, k > 0 ? c2 : shade(c2, -0.3));
      dome(1.08, c);
      ctx.beginPath();
      ctx.moveTo(0, -1.08 * r);
      ctx.lineTo(0, -0.1 * r);
      ctx.strokeStyle = c2;
      ctx.lineWidth = w * 1.6;
      ctx.stroke();
      break;
    }
  }
}
function star4(x, y, r, c) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4,
      q = i % 2 ? r * 0.4 : r;
    ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q);
  }
  ctx.closePath();
  ctx.fillStyle = c;
  ctx.fill();
}
// A thick line with an ink outline, in one colour or a rainbow
function inked(pts, w, c) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++)
      if (pts[i].length > 2) ctx.quadraticCurveTo(pts[i][0], pts[i][1], pts[i][2], pts[i][3]);
      else ctx.lineTo(pts[i][0], pts[i][1]);
  };
  path();
  ctx.strokeStyle = INK;
  ctx.lineWidth = w + 3;
  ctx.stroke();
  if (c === 'rainbow') {
    const g = ctx.createLinearGradient(pts[0][0], 0, pts[pts.length - 1][pts[pts.length - 1].length - 2], 0);
    for (let i = 0; i < 5; i++) g.addColorStop(i / 4, rainbow(i));
    ctx.strokeStyle = g;
  } else ctx.strokeStyle = c;
  path();
  ctx.lineWidth = w;
  ctx.stroke();
}
function drawLook(f, J, a) {
  const L = f.look;
  if (!L || !J.hd || !J.nk) return;
  const s = J.s,
    r = J.hr,
    w = 2.2 * Math.pow(s, 0.7),
    wv = Math.sin(fr * 0.22 + (f.slot || 0)) * 0.35;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (L.scarf)
    headFrame(J, J.nk, () => {
      // the tail hangs down when standing and streams out behind when moving fast
      const c = L.scarf.c,
        m = Math.min(1, Math.abs(f.vx || 0) / 6),
        ex = -(1.3 + 1.3 * m) * r,
        ey = (1.75 - 1.2 * m + wv * 0.6) * r,
        cx = -(0.9 + 0.5 * m) * r,
        cy = (0.35 + wv * 0.5) * r;
      inked(
        [
          [-0.3 * r, 0.25 * r],
          [cx, cy, ex, ey]
        ],
        0.5 * r,
        c
      );
      if (L.scarf.c2) {
        ctx.setLineDash([0.28 * r, 0.32 * r]);
        ctx.strokeStyle = L.scarf.c2;
        ctx.lineWidth = 0.5 * r;
        ctx.beginPath();
        ctx.moveTo(-0.5 * r, 0.27 * r);
        ctx.quadraticCurveTo(cx, cy, ex, ey);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.beginPath();
      ctx.ellipse(0, 0.25 * r, 0.75 * r, 0.32 * r, 0, 0, 7);
      shapeDo(c, w);
    });
  for (const [k, back] of [
    ['fb', 1],
    ['f', 0]
  ])
    if (L.shoes && J[k]) {
      const c = back ? shade(L.shoes.c, -0.2) : L.shoes.c,
        [x, y] = J[k];
      ctx.beginPath();
      ctx.ellipse(x + J.face * 3 * s, y - 1.5 * s, 7.5 * s, 4.2 * s, 0, 0, 7);
      shapeDo(c, w);
      if (L.shoes.c2 && f.vx && Math.abs(f.vx) > 1) {
        ctx.beginPath();
        ctx.moveTo(x - J.face * 4 * s, y - 4 * s);
        ctx.lineTo(x - J.face * (12 + Math.random() * 6) * s, y - 1.5 * s);
        ctx.lineTo(x - J.face * 4 * s, y + 1 * s);
        ctx.fillStyle = L.shoes.c2;
        ctx.fill();
      }
    }
  for (const [k, back] of [
    ['hb', 1],
    ['h', 0]
  ])
    if (L.gloves && J[k]) {
      const c = back ? shade(L.gloves.c, -0.2) : L.gloves.c,
        big = L.gloves.id !== 'gloves-white';
      ctx.beginPath();
      ctx.arc(J[k][0], J[k][1], (big ? 6.5 : 5) * s, 0, 7);
      shapeDo(c, w);
    }
  headFrame(J, J.hd, () => {
    if (L.band) {
      inked(
        [
          [-1.02 * r, -0.3 * r],
          [1.02 * r, -0.42 * r]
        ],
        0.36 * r,
        L.band.c
      );
      for (const k of [0, 1])
        inked(
          [
            [-0.95 * r, -0.32 * r],
            [-1.7 * r, (-0.35 + k * 0.4 + wv) * r, -2.5 * r, (-0.1 + k * 0.6 + wv * 1.5) * r]
          ],
          0.26 * r,
          L.band.c
        );
    }
    if (L.hat) drawHat(L.hat, r, w);
  });
  ctx.restore();
}
// The colour of each piece of a big hit's swoosh, by trail item
function trailCol(f, i, n) {
  const t = f.look && f.look.trail;
  if (!t) return f.col;
  if (t.c === 'rainbow') return rainbow(i);
  if (t.c === 'fire')
    return ['#e8212b', '#ff7a00', '#ffb000', '#ffd400'][Math.min(3, Math.floor((i / n) * 4))];
  if (t.c === 'ice') return ['#3ec5ff', '#8fdcff', '#d6f5ff'][Math.min(2, Math.floor((i / n) * 3))];
  if (t.c === 'hearts') return '#ff8fb8';
  return t.c;
}
function heart(x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.9);
  ctx.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.6, y - r * 1.3, x, y - r * 0.4);
  ctx.bezierCurveTo(x + r * 0.6, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9);
  ctx.fillStyle = '#e8212b';
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}
// ===== POSES =====
// Victory poses: pose arrays that move with time t (frames)
const VPOSE = {
  'pose-flex': t => {
    const p = Math.sin(t * 0.12) * 6;
    return [0, 95 + p, 80, -95 - p, -80, 22, 4, -22, 4, 0];
  },
  'pose-wave': t => {
    const q = Math.sin(t * 0.3);
    return [4, 155 + q * 12, 25 + q * 25, 15, 30, 16, 10, -16, 8, 0];
  },
  'pose-point': t => [-4 + Math.sin(t * 0.08) * 2, 150, 12, -35, 95, 14, 6, -16, 6, 0],
  'pose-bow': t => {
    const k = (1 - Math.cos(Math.min(1, (t % 150) / 60) * Math.PI)) / 2;
    return [8 + 47 * k, 25, 70, -20, 10, 8, 4, -8, 4, 0];
  },
  'pose-dance': t => {
    const s = Math.sin(t * 0.25),
      c = Math.cos(t * 0.25);
    return [
      s * 12,
      100 + s * 55,
      60,
      -100 + c * 55,
      -60,
      18 + s * 14,
      10 + Math.max(0, s) * 35,
      -18 + s * 14,
      10 + Math.max(0, -s) * 35,
      0
    ];
  },
  'pose-cheer': t => {
    const b = Math.abs(Math.sin(t * 0.18)) * 12;
    return [0, 122 - b * 0.5, 18, -122 + b * 0.5, -18, 18, 6, -18, 6, 0];
  },
  'pose-spin': t => {
    const w = Math.sin(t * 0.3);
    return [0, 90 + w * 10, 10, -90 + w * 10, -10, 6, 4, -6, 4, w * 22];
  }
};
// Is this fighter celebrating right now? Level clear, or the winner of a Versus round.
function cheering(f) {
  if (!f.pl || f.st === 'dead' || f.st === 'held') return false;
  if (state === 'clear' && MODE === LEVEL) return true;
  return (
    MODE === VERSUS && VS && (VS.phase === 'ko' || VS.phase === 'end') && VS.lastW && vsKey(f) === VS.lastW
  );
}
// The pose to draw: the game's pose, eased into the idle stance while standing still, or the victory pose.
function lookPose(f) {
  if (!f.look) return f.pose;
  const k = LOOKK.get(f) || { st: 0, v: 0, vt: 0 };
  LOOKK.set(f, k);
  const idle =
    f.st === 'free' && f.y >= G - 1 && Math.abs(f.vx) < 0.9 && !f.blk && !f.running && !f.flip && !f.pose[9];
  const win = cheering(f);
  k.st += ((idle && !win ? 1 : 0) - k.st) * 0.15;
  k.v += ((win ? 1 : 0) - k.v) * 0.12;
  k.vt = win ? k.vt + 1 : 0;
  let p = f.pose;
  if (k.st > 0.01) {
    const S = (STANCES.find(s => s.id === f.look.stance) || STANCES[0]).p;
    p = p.map((v, i) => (i < 9 ? v + (S[i] - IDLE[i]) * k.st : v));
  }
  if (k.v > 0.01) {
    const V = (VPOSE[f.look.pose && f.look.pose.id] || VPOSE['pose-flex'])(k.vt);
    p = p.map((v, i) => v + (V[i] - v) * (i === 9 ? (k.v > 0.5 ? 1 : 0) : k.v));
  }
  return p;
}
