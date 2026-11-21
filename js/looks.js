// StickFighters: Drawing a fighter's look: hair, hats, headbands, scarves, ties, shirts, jackets,
// gloves, pants, skirts, dresses, shoes, Surge styles, idle stances, poses and the pose wheel.
// Drawing only: nothing here changes the game, and it never calls rnd().
// ===== LOOKS =====
// J = joint positions from whichever drawer drew the body (standing figure, ragdoll or Tornado Kick):
//   hd head centre, hr head radius, nk neck, sh shoulders, hp hips, ea/h front elbow/hand, eb/hb back elbow/hand,
//   kf/f front knee/foot, kb/fb back knee/foot, face, s scale, lw drawn line width, col body colour.
const LOOKK = new WeakMap(); // per-fighter blend amounts for the stance and poses (drawing only)
function rainbow(i) {
  return 'hsl(' + ((i * 47 + fr * 6) % 360) + ' 90% 55%)';
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const unit = v => {
  const d = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / d, v[1] / d];
};
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
// The radius hats, hair and bands are sized and placed by. They snap to the head's visible outer edge: the head's
// radius plus half its outline, less half the item's own ink line, so an item drawn at radius r covers the head's
// outline exactly, whatever the head size or line width.
function itemR(J) {
  if (!J.hw || !J.hs) return J.hr;
  return J.hr + J.hw / 2 - 1.1 * Math.pow(J.hs, 0.7);
}
// How much thicker (or thinner) this fighter's limbs are than the default line: gloves and shoes grow with it so
// they still cover the hands and feet (shirts, jackets, pants and ties already follow J.lw). 1 at the default.
const limbK = J => (J.lw && J.s ? Math.max(0.7, Math.min(1.7, J.lw / (7 * Math.pow(J.s, 0.7)))) : 1);
// Draws in a frame fixed to the head: origin = point, x = the way you face, y = down along the neck.
function headFrame(J, at, fn) {
  frameAt(at, unit(sub(J.hd, J.nk)), J.face, fn);
}
// A frame at a point whose "up" is the unit vector u; x points the way the fighter faces.
function frameAt(at, u, face, fn) {
  ctx.save();
  ctx.translate(at[0], at[1]);
  ctx.rotate(Math.atan2(u[0], -u[1]));
  ctx.scale(face, 1);
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
// A thick line with an ink outline, in one colour or a rainbow. Points can be [x,y] or [cx,cy,x,y] (a curve).
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
    const e = pts[pts.length - 1],
      g = ctx.createLinearGradient(pts[0][0], 0, e[e.length - 2], 0);
    for (let i = 0; i < 5; i++) g.addColorStop(i / 4, rainbow(i));
    ctx.strokeStyle = g;
  } else ctx.strokeStyle = c;
  path();
  ctx.lineWidth = w;
  ctx.stroke();
}
// Plain thick line (no outline) and a filled polygon with an outline
function seg(pts, w, c) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = c;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}
function poly(pts, fill, w) {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.closePath();
  shapeDo(fill, w);
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
      // the band goes over the top of the head from ear to ear (seen from the side: a tall narrow arch)
      // seen from the side, the ear-to-ear band runs straight up from the near ear cup over the top of the head
      inked(
        [
          [-0.05 * r, -0.3 * r],
          [-0.05 * r, -1.12 * r]
        ],
        0.4 * r,
        c
      );
      ell(-0.05, -1.14, 0.34, 0.18, c);
      ell(-0.05, 0.08, 0.36, 0.52, c);
      ell(-0.05, 0.08, 0.16, 0.26, c2);
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
// ===== HAIR =====
// Under a hat (capped) only the parts that hang below it are drawn.
function drawHair(it, r, w, capped, wv) {
  const c = it.c,
    dome = k => {
      ctx.beginPath();
      ctx.arc(0, 0, r * k, Math.PI + 0.08, -0.25);
      ctx.lineTo(r * 0.55, -r * 0.55);
      ctx.closePath();
      shapeDo(c, w);
    },
    tail = (pts, tw) =>
      inked(
        pts.map(p => p.map(v => v * r)),
        tw * r,
        c
      );
  switch (it.id) {
    case 'hair-short':
      // a close cap of hair over the top and back, with a short fringe at the front
      if (capped) return;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.2, Math.PI * 0.9, -0.32);
      ctx.lineTo(r * 0.78, -r * 0.42);
      ctx.lineTo(r * 0.55, -r * 0.62);
      ctx.arc(0, 0, r * 0.86, -0.85, Math.PI * 0.92, true);
      ctx.closePath();
      shapeDo(c, w);
      break;
    case 'hair-buzz':
      // very short: a thin cap that hugs the head
      if (capped) return;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.1, Math.PI * 0.95, -0.45);
      ctx.arc(0, 0, r * 0.93, -0.45, Math.PI * 0.95, true);
      ctx.closePath();
      shapeDo(c, w * 0.6);
      break;
    case 'hair-sidepart':
      // short at the back, swept up and over at the front
      if (capped) return;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.2, Math.PI * 0.9, Math.PI * 1.62);
      ctx.quadraticCurveTo(r * 0.7, -r * 1.65, r * 1.12, -r * 0.62);
      ctx.quadraticCurveTo(r * 0.75, -r * 0.6, r * 0.45, -r * 0.72);
      ctx.arc(0, 0, r * 0.86, -1.0, Math.PI * 0.92, true);
      ctx.closePath();
      shapeDo(c, w);
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = Math.max(1, w * 0.4);
      ctx.beginPath();
      ctx.moveTo(-r * 0.2, -r * 1.15);
      ctx.quadraticCurveTo(r * 0.3, -r * 1.3, r * 0.8, -r * 0.85);
      ctx.stroke();
      break;
    case 'hair-spiky':
      if (capped) return;
      ctx.beginPath();
      for (let i = 0; i <= 12; i++) {
        const a = Math.PI + 0.1 + (i / 12) * (Math.PI - 0.5),
          q = i % 2 ? 1.55 : 0.95;
        ctx.lineTo(Math.cos(a) * r * q, Math.sin(a) * r * q);
      }
      ctx.closePath();
      shapeDo(c, w);
      break;
    case 'hair-messy':
      if (capped) return;
      for (const [x, y, q] of [
        [-0.75, -0.45, 0.5],
        [-0.45, -0.85, 0.52],
        [0.05, -0.98, 0.5],
        [0.5, -0.75, 0.42]
      ]) {
        ctx.beginPath();
        ctx.arc(x * r, y * r, q * r, 0, 7);
        shapeDo(c, w);
      }
      break;
    case 'hair-flat':
      if (capped) return;
      poly(
        [
          [-1.02 * r, -0.2 * r],
          [-0.95 * r, -1.55 * r],
          [0.85 * r, -1.55 * r],
          [0.95 * r, -0.55 * r],
          [0.4 * r, -0.75 * r]
        ],
        c,
        w
      );
      break;
    case 'hair-mohawk': {
      // a strip of spikes that follows the curve of the head, tallest in the middle
      if (capped) return;
      const n = 11,
        a0 = Math.PI + 0.45,
        a1 = 2 * Math.PI - 0.3,
        st = (a1 - a0) / n;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a0) * r * 0.9, Math.sin(a0) * r * 0.9);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n,
          a = a0 + st * (i + 0.5),
          h = 1.3 + 0.38 * Math.sin(Math.PI * t);
        ctx.lineTo(Math.cos(a - st * 0.15) * r * h, Math.sin(a - st * 0.15) * r * h);
        ctx.lineTo(Math.cos(a0 + st * (i + 1)) * r * 1.02, Math.sin(a0 + st * (i + 1)) * r * 1.02);
      }
      ctx.arc(0, 0, r * 0.9, a1, a0, true);
      ctx.closePath();
      shapeDo(c, w * 0.45);
      break;
    }
    case 'hair-afro':
      if (capped) {
        ctx.beginPath();
        ctx.arc(-0.75 * r, 0, 0.75 * r, 0, 7);
        shapeDo(c, w);
        return;
      }
      ctx.beginPath();
      ctx.arc(-0.2 * r, -0.4 * r, 1.4 * r, Math.PI * 0.55, Math.PI * 1.97);
      ctx.closePath();
      shapeDo(c, w);
      break;
    case 'hair-pony':
      tail(
        [
          [-0.85, -0.5],
          [-1.9, -0.4 + wv, -1.7, 1.0 + wv]
        ],
        0.55
      );
      if (!capped) dome(1.1);
      break;
    case 'hair-long':
      poly(
        [
          [-1.05 * r, -0.35 * r],
          [-1.3 * r, (1.9 + wv * 0.3) * r],
          [-0.35 * r, 1.65 * r],
          [-0.45 * r, 0.1 * r]
        ],
        c,
        w
      );
      if (!capped) dome(1.1);
      break;
    case 'hair-bun':
      if (!capped) {
        ctx.beginPath();
        ctx.arc(-0.7 * r, -1.0 * r, 0.48 * r, 0, 7);
        shapeDo(c, w);
        dome(1.1);
      } else {
        ctx.beginPath();
        ctx.arc(-1.1 * r, -0.2 * r, 0.42 * r, 0, 7);
        shapeDo(c, w);
      }
      break;
    case 'hair-pigtails':
      tail(
        [
          [-0.8, -0.35],
          [-1.6, 0 + wv, -1.45, 1.2 + wv]
        ],
        0.42
      );
      tail(
        [
          [-0.3, -0.2],
          [-0.75, 0.5 + wv, -0.55, 1.45 + wv]
        ],
        0.42
      );
      if (!capped) dome(1.1);
      break;
  }
}
// ===== CLOTHES =====
// Under the body (drawn before it): capes.
function drawLookUnder(f, J, a) {
  const L = f.look;
  if (!L || !L.jacket || !J.sh || !J.hp) return;
  if (L.jacket.k === 'hoodie') {
    // the hood hangs behind the neck
    const u = unit(sub(J.sh, J.hp)),
      n = [J.face * -u[1], J.face * u[0]],
      r = J.hr || 9 * J.s;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.ellipse(J.nk[0] - n[0] * r * 0.55, J.nk[1] - n[1] * r * 0.55 + r * 0.15, r * 0.6, r * 0.75, 0, 0, 7);
    shapeDo(shade(L.jacket.c, -0.12), 1.5);
    ctx.restore();
    return;
  }
  if (L.jacket.k !== 'cape') return;
  const u = unit(sub(J.sh, J.hp)),
    n = [J.face * -u[1], J.face * u[0]],
    len = Math.hypot(...sub(J.sh, J.hp)) * 2.1,
    m = Math.min(1, Math.abs(f.vx || 0) / 6),
    wv = Math.sin(fr * 0.2 + (f.slot || 0)) * 4 * J.s,
    back = 18 * J.s + m * 26 * J.s,
    p = (k, b) => [J.sh[0] - u[0] * len * k - n[0] * b, J.sh[1] - u[1] * len * k - n[1] * b];
  ctx.save();
  ctx.globalAlpha = a;
  poly([p(0, -2 * J.s), p(0.15, 4 * J.s), p(1, back + wv), p(0.95, back * 0.4 + wv)], L.jacket.c, 2.2 * J.s);
  ctx.restore();
}
function sleeve(J, back, t, w, c) {
  const e = back ? J.eb : J.ea,
    h = back ? J.hb : J.h;
  if (!e || !h) return;
  inked(t <= 1 ? [J.sh, lerp2(J.sh, e, t)] : [J.sh, e, lerp2(e, h, t - 1)], w, c);
}
function drawShirt(it, J, front) {
  const lw = J.lw,
    c = it.c,
    k = it.k,
    sl = k === 'tank' ? 0 : k === 'long' ? 1.85 : 0.6;
  if (front === 0) {
    if (sl) sleeve(J, 1, sl, lw * 1.35, shade(c === '#ffffff' ? '#f0ece2' : c, -0.12));
    return;
  }
  if (front === 1) {
    inked([J.sh, J.hp], lw * (k === 'tank' ? 1.55 : 1.8), c);
    if (it.c2) {
      const u = unit(sub(J.sh, J.hp)),
        n = [-u[1], u[0]];
      if (it.id === 'shirt-jersey') {
        const m = lerp2(J.sh, J.hp, 0.45);
        ctx.fillStyle = it.c2;
        ctx.font = '900 ' + Math.round(lw * 1.5) + 'px Impact,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('1', m[0], m[1] + lw * 0.5);
      } else
        for (const t of [0.25, 0.5, 0.75]) {
          const m = lerp2(J.sh, J.hp, t);
          seg(
            [
              [m[0] - n[0] * lw, m[1] - n[1] * lw],
              [m[0] + n[0] * lw, m[1] + n[1] * lw]
            ],
            lw * 0.42,
            it.c2
          );
        }
    }
    return;
  }
  if (sl) sleeve(J, 0, sl, lw * 1.35, c);
}
function drawJacket(it, J, front) {
  const lw = J.lw,
    c = it.c,
    k = it.k,
    sl = k === 'vest' || k === 'cape' ? 0 : k === 'gi' ? 1.6 : 1.85,
    sc = it.id === 'jacket-varsity' ? it.c2 : c;
  if (k === 'cape') {
    if (front === 1) {
      ctx.beginPath();
      ctx.arc(J.nk[0], J.nk[1] + lw * 0.4, lw * 0.55, 0, 7);
      shapeDo(it.c2, 2);
    }
    return;
  }
  if (front === 0) {
    if (sl) sleeve(J, 1, sl, lw * 1.5, shade(sc, -0.15));
    return;
  }
  if (front === 2) {
    if (sl) sleeve(J, 0, sl, lw * 1.5, sc);
    return;
  }
  const u = unit(sub(J.sh, J.hp)),
    n = [J.face * -u[1], J.face * u[0]];
  inked([J.sh, lerp2(J.sh, J.hp, k === 'gi' ? 1.12 : 1.05)], lw * 2.15, c);
  const m0 = lerp2(J.sh, J.hp, 0.05),
    m1 = lerp2(J.sh, J.hp, 0.95),
    edge = t => [t[0] + n[0] * lw * 0.85, t[1] + n[1] * lw * 0.85];
  if (k === 'vest' || k === 'coat') seg([edge(m0), edge(m1)], lw * 0.35, shade(c, k === 'coat' ? 0.5 : -0.3));
  if (k === 'gi') {
    seg([edge(m0), lerp2(J.sh, J.hp, 0.5)], lw * 0.3, shade(c, -0.35));
    const b = lerp2(J.sh, J.hp, 0.9);
    inked(
      [
        [b[0] - n[0] * lw * 1.3, b[1] - n[1] * lw * 1.3],
        [b[0] + n[0] * lw * 1.3, b[1] + n[1] * lw * 1.3],
        [b[0] + n[0] * lw * 1.6 - u[0] * lw * 1.2, b[1] + n[1] * lw * 1.6 - u[1] * lw * 1.2]
      ],
      lw * 0.5,
      it.c2
    );
  }
}
// Pants, shorts, skirts, tutus and dresses (the "legs" slot)
// which = 'back' / 'front' (one pant leg) or 'over' (skirts, tutus, dresses)
function drawLegs(it, J, which) {
  const lw = J.lw,
    c = it.c,
    k = it.k;
  if (k === 'pants' || k === 'shorts') {
    for (const [kn, ft, back] of which === 'back' ? [[J.kb, J.fb, 1]] : [[J.kf, J.f, 0]]) {
      if (!kn || !ft) continue;
      const col = back ? shade(c === '#ffffff' ? '#f0ece2' : c, -0.12) : c;
      if (k === 'pants') {
        inked([J.hp, kn, lerp2(kn, ft, 0.8)], lw * 1.6, col);
        if (it.c2 && !back) seg([J.hp, kn, lerp2(kn, ft, 0.78)], lw * 0.35, it.c2);
      } else
        inked(
          [J.hp, lerp2(J.hp, kn, it.id === 'shorts-boxer' ? 0.62 : 0.8)],
          lw * (it.id === 'shorts-boxer' ? 2.3 : 1.85),
          col
        );
    }
    if (it.c2 && k === 'shorts' && which === 'front') seg([J.hp, lerp2(J.hp, J.sh, 0.08)], lw * 2.3, it.c2);
    return;
  }
  const u = unit(sub(J.sh, J.hp)),
    n = [-u[1], u[0]],
    th = Math.hypot(...sub(J.hp, J.kf || J.hp)) || 15 * J.s,
    P = (o, t, w) => [o[0] - u[0] * th * t + n[0] * w, o[1] - u[1] * th * t + n[1] * w];
  if (k === 'tutu') {
    const m = P(J.hp, -0.05, 0);
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * Math.PI * 2,
        q = i % 2 ? 0.75 : 1;
      ctx.lineTo(m[0] + Math.cos(a) * lw * 3 * q, m[1] + Math.sin(a) * lw * 1.1 * q);
    }
    ctx.closePath();
    shapeDo(c, 2);
    return;
  }
  const w = 2 * J.s,
    pts =
      k === 'skirt'
        ? [
            P(J.hp, -0.25, -lw * 1.15),
            P(J.hp, -0.25, lw * 1.15),
            P(J.hp, 0.85, lw * 2.6),
            P(J.hp, 0.85, -lw * 2.6)
          ]
        : [
            P(J.sh, 0, -lw * 1.1),
            P(J.sh, 0, lw * 1.1),
            P(lerp2(J.sh, J.hp, 0.6), 0, lw * 0.95),
            P(J.hp, it.id === 'dress-gown' ? 1.85 : 0.95, lw * (it.id === 'dress-gown' ? 3.6 : 3.1)),
            P(J.hp, it.id === 'dress-gown' ? 1.85 : 0.95, -lw * (it.id === 'dress-gown' ? 3.6 : 3.1)),
            P(lerp2(J.sh, J.hp, 0.6), 0, -lw * 0.95)
          ];
  poly(pts, c, w);
  if (it.c2) {
    ctx.fillStyle = it.c2;
    if (it.id === 'skirt-plaid')
      for (const t of [0.15, 0.45]) seg([P(J.hp, t, -lw * 1.8), P(J.hp, t, lw * 1.8)], lw * 0.3, it.c2);
    else if (it.id === 'dress-gown') seg([pts[3], pts[4]], lw * 0.5, it.c2);
    else
      for (const [t, q] of [
        [0.1, -0.6],
        [0.35, 0.7],
        [0.6, -1.2],
        [0.55, 1.4]
      ]) {
        const d = P(J.hp, t, lw * q);
        ctx.beginPath();
        ctx.arc(d[0], d[1], lw * 0.32, 0, 7);
        ctx.fill();
      }
  }
}
function drawTie(it, J) {
  const lw = J.lw,
    u = unit(sub(J.sh, J.hp)),
    n = [J.face * -u[1], J.face * u[0]],
    fw = (p, k) => [p[0] + n[0] * lw * k, p[1] + n[1] * lw * k],
    top = fw(lerp2(J.nk, J.hp, 0.06), 0.85);
  if (it.k === 'bow') {
    const a = fw(top, -0.1);
    poly(
      [
        a,
        [a[0] - u[0] * lw * 0.9 + n[0] * lw * 0.6, a[1] - u[1] * lw * 0.9 + n[1] * lw * 0.6],
        [a[0] + u[0] * lw * 0.9 + n[0] * lw * 0.6, a[1] + u[1] * lw * 0.9 + n[1] * lw * 0.6]
      ],
      it.c,
      1.6
    );
    poly(
      [
        a,
        [a[0] - u[0] * lw * 0.9 - n[0] * lw * 0.6, a[1] - u[1] * lw * 0.9 - n[1] * lw * 0.6],
        [a[0] + u[0] * lw * 0.9 - n[0] * lw * 0.6, a[1] + u[1] * lw * 0.9 - n[1] * lw * 0.6]
      ],
      it.c,
      1.6
    );
    return;
  }
  // a real tie: a knot, then a blade that widens and ends in a point, lying on the chest
  const sw = Math.sin(fr * 0.15) * 0.08,
    P = (t, k) => fw(lerp2(J.nk, J.hp, t), 0.85 + k + sw * t),
    // across = the direction across the chest (along the body's forward axis)
    ax = n,
    pt = (t, half) => [P(t, 0)[0] + ax[0] * half * lw, P(t, 0)[1] + ax[1] * half * lw];
  poly([pt(0.04, -0.32), pt(0.04, 0.32), pt(0.14, 0.2), pt(0.14, -0.2)], it.c, 1.6);
  const blade = [pt(0.14, -0.2), pt(0.14, 0.2), pt(0.52, 0.42), pt(0.6, 0), pt(0.52, -0.42)];
  poly(blade, it.c, 1.6);
  if (it.c2)
    for (const t of [0.24, 0.36, 0.48]) seg([pt(t - 0.03, -0.3), pt(t + 0.03, 0.3)], lw * 0.18, it.c2);
}
// ===== GLOVES AND SHOES =====
function drawGlove(it, J, back) {
  const e = back ? J.eb : J.ea,
    h = back ? J.hb : J.h;
  if (!h) return;
  const s = J.s * limbK(J),
    c = back ? shade(it.c, -0.2) : it.c,
    d = e ? unit(sub(h, e)) : [J.face, 0],
    nr = [-d[1], d[0]],
    at = k => [h[0] + d[0] * k * s, h[1] + d[1] * k * s],
    ang = Math.atan2(d[1], d[0]),
    w = 1.8 * Math.pow(J.s, 0.7),
    oval = (p, rx, ry, col) => {
      ctx.beginPath();
      ctx.ellipse(p[0], p[1], rx * s, ry * s, ang, 0, 7);
      shapeDo(col, w);
    },
    cuff = (k, half, col) =>
      inked(
        [
          [at(k)[0] - nr[0] * half * s, at(k)[1] - nr[1] * half * s],
          [at(k)[0] + nr[0] * half * s, at(k)[1] + nr[1] * half * s]
        ],
        2.6 * s,
        col
      );
  switch (it.k) {
    case 'boxing':
      cuff(-4, 4.5, '#ffffff');
      oval(at(2.5), 7.2, 6.4, c);
      oval([at(1)[0] + nr[0] * 5 * s * J.face, at(1)[1] + nr[1] * 5 * s * J.face], 2.8, 2.4, c);
      break;
    case 'mitten':
      cuff(-3.5, 4, it.c2 || shade(c, 0.4));
      oval([at(0.5)[0] + nr[0] * 3.5 * s * J.face, at(0.5)[1] + nr[1] * 3.5 * s * J.face], 2.6, 2, c);
      oval(at(2.2), 6, 4.4, c);
      break;
    case 'wrap':
      inked([at(-9), at(2)], 5 * s, c);
      for (const k of [-6, -2.5, 1])
        seg(
          [
            [at(k)[0] - nr[0] * 2.4 * s, at(k)[1] - nr[1] * 2.4 * s],
            [at(k + 1.6)[0] + nr[0] * 2.4 * s, at(k + 1.6)[1] + nr[1] * 2.4 * s]
          ],
          0.9,
          '#c9bfae'
        );
      break;
    case 'work':
      poly(
        [
          [at(-2)[0] - nr[0] * 4 * s, at(-2)[1] - nr[1] * 4 * s],
          [at(-2)[0] + nr[0] * 4 * s, at(-2)[1] + nr[1] * 4 * s],
          [at(-8)[0] + nr[0] * 5.5 * s, at(-8)[1] + nr[1] * 5.5 * s],
          [at(-8)[0] - nr[0] * 5.5 * s, at(-8)[1] - nr[1] * 5.5 * s]
        ],
        shade(c, -0.15),
        w
      );
      oval(at(2), 6, 5, c);
      break;
    case 'drive':
      oval(at(1.5), 5, 4, c);
      ctx.fillStyle = '#f4ead2';
      for (const k of [-1.6, 1.6]) {
        ctx.beginPath();
        ctx.arc(at(3.5)[0] + nr[0] * k * s, at(3.5)[1] + nr[1] * k * s, 1.1 * s, 0, 7);
        ctx.fill();
      }
      cuff(-2.5, 3.6, shade(c, -0.3));
      break;
    default:
      ctx.beginPath();
      ctx.arc(h[0], h[1], 5 * s, 0, 7);
      shapeDo(c, w);
  }
}
function drawShoe(f, it, J, back) {
  const ft = back ? J.fb : J.f,
    kn = back ? J.kb : J.kf;
  if (!ft) return;
  const s = J.s * limbK(J),
    c = back ? shade(it.c, -0.2) : it.c,
    w = 1.8 * Math.pow(J.s, 0.7);
  // boots and high-tops go up the shin; the foot itself stays level
  if ((it.k === 'boot' || it.k === 'hightop') && kn) {
    const top = lerp2(ft, kn, it.k === 'boot' ? 0.5 : 0.3);
    inked([ft, top], J.lw * 1.3, c);
    if (it.c2) inked([lerp2(ft, top, 0.8), top], J.lw * 1.3, it.c2);
  }
  frameAt(ft, [0, -1], J.face, () => {
    const el = (x, y, rx, ry, col) => {
      ctx.beginPath();
      ctx.ellipse(x * s, y * s, rx * s, ry * s, 0, 0, 7);
      shapeDo(col, w);
    };
    switch (it.k) {
      case 'sneaker':
      case 'hightop':
        el(3.5, -1.5, 7.5, 4, c);
        seg(
          [
            [-2.5 * s, 1.3 * s],
            [9.5 * s, 1.3 * s]
          ],
          1.6 * s,
          '#ffffff'
        );
        ctx.fillStyle = it.k === 'hightop' ? it.c2 : '#ffffff';
        ctx.beginPath();
        ctx.arc(4.5 * s, -3 * s, 1.3 * s, 0, 7);
        ctx.fill();
        break;
      case 'boot':
        el(3.5, -1.2, 7.8, 4.2, c);
        if (it.id === 'shoes-rocket' && Math.abs(f.vx || 0) > 1) {
          ctx.beginPath();
          ctx.moveTo(-3 * s, -3 * s);
          ctx.lineTo(-(11 + Math.random() * 7) * s, -0.5 * s);
          ctx.lineTo(-3 * s, 2 * s);
          ctx.fillStyle = it.c2;
          ctx.fill();
        }
        break;
      case 'sandal':
        seg(
          [
            [-3 * s, 1.8 * s],
            [9.5 * s, 1.8 * s]
          ],
          2.2 * s,
          shade(c, -0.25)
        );
        ctx.beginPath();
        ctx.arc(3.5 * s, 1.5 * s, 3.6 * s, Math.PI * 1.1, Math.PI * 1.9);
        ctx.strokeStyle = c;
        ctx.lineWidth = 2 * s;
        ctx.stroke();
        break;
      case 'slipper':
        el(6.5, -6.5, 1.6, 3.6, c);
        el(4, -6.5, 1.6, 3.6, c);
        el(3.5, -1.8, 9, 5, c);
        break;
      default:
        el(3, -1.5, 7, 4, c);
    }
  });
}
// ===== THE WHOLE LOOK =====
// The look is drawn in layers between the body's own lines (see drawFig's lay): phase 'back' after the far arm
// and leg, 'mid' after the torso and head, 'legs' after the near leg, 'front' after the near arm. No phase = all.
function lookLayers(f, extra, a) {
  const go = ph => o => drawLook(f, { ...o, ...extra }, a, ph);
  return {
    under: o => drawLookUnder(f, { ...o, ...extra }, a),
    back: go('back'),
    mid: go('mid'),
    legs: go('legs')
  };
}
function drawLook(f, J, a, ph) {
  const L = f.look;
  if (!L || !J.hd || !J.nk) return;
  if (!ph) {
    for (const p of ['back', 'mid', 'legs', 'front']) drawLook(f, J, a, p);
    return;
  }
  const s = J.s,
    r = itemR(J),
    w = 2.2 * Math.pow(s, 0.7),
    wv = Math.sin(fr * 0.22 + (f.slot || 0)) * 0.35,
    body = J.sh && J.hp,
    pants = L.legs && (L.legs.k === 'pants' || L.legs.k === 'shorts');
  J.lw = J.lw || 7 * Math.pow(s, 0.7);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (ph === 'back') {
    if (body && pants) drawLegs(L.legs, J, 'back');
    if (L.shoes) drawShoe(f, L.shoes, J, 1);
    if (body && L.shirt) drawShirt(L.shirt, J, 0);
    if (body && L.jacket) drawJacket(L.jacket, J, 0);
    if (L.gloves) drawGlove(L.gloves, J, 1);
  } else if (ph === 'mid') {
    if (body && L.shirt) drawShirt(L.shirt, J, 1);
    if (body && L.jacket) drawJacket(L.jacket, J, 1);
    lookHead(f, J, L, r, w, wv);
  } else if (ph === 'legs') {
    if (body && pants) drawLegs(L.legs, J, 'front');
    if (L.shoes) drawShoe(f, L.shoes, J, 0);
    if (body && L.legs && !pants) drawLegs(L.legs, J, 'over');
    if (body && L.tie) drawTie(L.tie, J);
    if (L.scarf) lookScarf(f, J, L, r, w, wv);
  } else {
    if (body && L.shirt) drawShirt(L.shirt, J, 2);
    if (body && L.jacket) drawJacket(L.jacket, J, 2);
    if (L.gloves) drawGlove(L.gloves, J, 0);
  }
  if (L.extra) drawBossParts(f, J, L, r, w, ph); // a main boss's own parts (bosslooks.js)
  ctx.restore();
}
function lookScarf(f, J, L, r, w, wv) {
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
}
function lookHead(f, J, L, r, w, wv) {
  headFrame(J, J.hd, () => {
    // halos and headphones don't cover the top of the head, so the hair stays
    if (L.hair) drawHair(L.hair, r, w, !!L.hat && !L.hat.open, wv);
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
}
// ===== SURGE STYLES =====
// The colour of Surge for a look (the glow, afterimages and sparkles); classic yellow without a style.
function surgeCol(L, i) {
  const t = L && L.surge;
  if (!t) return '#ffd400';
  if (t.c === 'rainbow') return rainbow(i);
  if (t.c === 'fire') return ['#e8212b', '#ff7a00', '#ffb000', '#ffd400'][(i >>> 0) % 4];
  if (t.c === 'ice') return ['#3ec5ff', '#8fdcff', '#d6f5ff'][(i >>> 0) % 3];
  if (t.c === 'bolt') return (i >>> 0) % 3 ? '#7df9ff' : '#ffffff';
  if (t.c === 'hearts') return '#ff5a7a';
  return t.c;
}
// Extra Surge decoration around a surging fighter: lightning sparks or hearts
function surgeExtra(f) {
  const t = f.look && f.look.surge;
  if (!t || (t.c !== 'bolt' && t.c !== 'hearts')) return;
  const s = f.s;
  if (t.c === 'hearts') {
    if (Math.random() < 0.3)
      heart(f.x + (Math.random() - 0.5) * 50 * s, f.y - Math.random() * 80 * s, 3 + Math.random() * 3);
    return;
  }
  ctx.save();
  ctx.strokeStyle = '#7df9ff';
  ctx.lineWidth = 2;
  for (let k = 0; k < 2; k++) {
    let x = f.x + (Math.random() - 0.5) * 40 * s,
      y = f.y - 90 * s * Math.random();
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i < 4; i++) {
      x += (Math.random() - 0.5) * 16;
      y += 6 + Math.random() * 6;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}
// ===== POSES =====
// Poses for the pose wheel and victories: pose arrays that move with time t (frames). A pose can set .sx, a
// horizontal squash used to fake turning on the spot (Twirl).
const VPOSE = {
  'pose-flex': t => {
    const p = Math.sin(t * 0.12) * 6;
    return [0, 95 + p, 80, -95 - p, -80, 22, 4, -22, 4, 0];
  },
  'pose-wave': t => {
    const q = Math.sin(t * 0.3);
    return [4, 155 + q * 12, 25 + q * 25, 15, 30, 16, 10, -16, 8, 0];
  },
  'pose-thumbs': t => {
    const q = Math.abs(Math.sin(t * 0.15)) * 6;
    return [2, 60 + q, 85, 15, 20, 12, 6, -12, 6, 0];
  },
  'pose-salute': t => [-2, 112, 128, -8, 12, 8, 2, -8, 2, 0],
  'pose-point': t => [-4 + Math.sin(t * 0.08) * 2, 150, 12, -35, 95, 14, 6, -16, 6, 0],
  'pose-bow': t => {
    const k = (1 - Math.cos(Math.min(1, (t % 150) / 60) * Math.PI)) / 2;
    return [8 + 47 * k, 25, 70, -20, 10, 8, 4, -8, 4, 0];
  },
  'pose-laugh': t => {
    const q = Math.sin(t * 0.6) * 4;
    return [-14 + q, 30, 100, 25, 100, 14, 8, -14, 8, 0];
  },
  'pose-sit': t => [-14 + Math.sin(t * 0.06) * 2, -25, 20, -40, 10, 90, 0, 82, 40, 0],
  'pose-kneel': t => [18, 70, 95, -15, 30, 80, 85, -35, 110, 0],
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
    const p = [0, 95, 8, -95, -8, 6, 4, -6, 4, 0];
    p.sx = Math.cos(t * 0.22);
    return p;
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
// The pose to draw: the game's pose, eased into the idle stance while standing still, or a pose (victory or the
// pose wheel's choice).
function lookPose(f) {
  if (!f.look) return f.pose;
  const k = LOOKK.get(f) || { st: 0, v: 0, vt: 0, id: null };
  LOOKK.set(f, k);
  const idle =
      f.st === 'free' &&
      f.y >= f.gy - 1 &&
      Math.abs(f.vx) < 0.9 &&
      !f.blk &&
      !f.running &&
      !f.flip &&
      !f.pose[9],
    W = f.look.wheel || [],
    em = f.emote && idle && W.length ? W[wheelSeg(f.emote.d, W.length)] : null,
    id = cheering(f) ? f.look.pose && f.look.pose.id : em ? em.id : null;
  if (id && id !== k.id) k.vt = 0;
  if (id) k.id = id;
  k.st += ((idle && !id ? 1 : 0) - k.st) * 0.15;
  k.v += ((id ? 1 : 0) - k.v) * 0.14;
  k.vt = id ? k.vt + 1 : k.vt;
  let p = f.pose;
  if (k.st > 0.01) {
    const S = (STANCES.find(s => s.id === f.look.stance) || STANCES[0]).p;
    p = p.map((v, i) => (i < 9 ? v + (S[i] - IDLE[i]) * k.st : v));
  }
  if (k.v > 0.01 && VPOSE[k.id]) {
    const V = VPOSE[k.id](k.vt),
      q = p.map((v, i) => v + (V[i] - v) * (i === 9 ? (k.v > 0.5 ? 1 : 0) : k.v));
    if (V.sx !== undefined) q.sx = 1 + (V.sx - 1) * k.v;
    p = q;
  }
  return p;
}
// Which of n wheel slices an aimed direction picks (d in eighths of a turn from up; slice 0 is at the top)
const wheelSeg = (d, n) => Math.round(((d || 0) * 45) / (360 / n)) % n;
// The pose wheel over a fighter holding the pose button: up to 8 slices, the first at the top, going clockwise.
// It stays the same size however many poses are on it; long names are cut short.
function drawWheel(f) {
  const W = (f.look && f.look.wheel) || [],
    n = Math.max(1, W.length),
    cx = f.x,
    cy = f.y - 160 * f.s,
    R = 80,
    r0 = 16,
    sel = wheelSeg(f.wheel.d, n),
    step = (Math.PI * 2) / n,
    maxW = n === 1 ? 120 : n <= 2 ? 100 : n <= 4 ? 70 : n <= 6 ? 50 : 40;
  ctx.save();
  ctx.lineJoin = 'round';
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + (i - 0.5) * step;
    ctx.beginPath();
    if (n === 1) ctx.arc(cx, cy, R, 0, 7);
    else {
      ctx.moveTo(cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0);
      ctx.arc(cx, cy, R, a0, a0 + step);
      ctx.arc(cx, cy, r0, a0 + step, a0, true);
      ctx.closePath();
    }
    ctx.fillStyle = i === sel ? 'rgba(255,212,0,.95)' : 'rgba(255,248,238,.9)';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.font = '900 ' + (n >= 6 ? 9 : 11) + 'px "Trebuchet MS",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = INK;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + i * step,
      rr = n === 1 ? R * 0.55 : (R + r0) / 2 + 8;
    let t = W[i] ? W[i].name.toUpperCase() : '—';
    if (ctx.measureText(t).width > maxW) {
      while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
      t += '…';
    }
    ctx.fillText(t, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.restore();
}
// ===== ITEM PICTURES =====
// A small picture of an item, centred at (cx, cy) in a box about sz wide, on whatever ctx is current.
// baseCol = the body colour to show it on. Used by the store shelves and by gifts on the ground.
function drawItemIcon(it, cx, cy, sz, baseCol) {
  const col = it.slot === 'color' ? it.c : baseCol,
    L = { col, d2: shade(col, -0.22), ht: 1, head: 1, lw: 7, stance: 'classic', wheel: [] };
  if (it.slot !== 'color' && it.slot !== 'pose') L[it.slot] = it;
  const f = { look: L, face: 1, s: 1, slot: 0, vx: it.slot === 'surge' ? 5 : 0, col };
  ctx.save();
  ctx.lineCap = 'round';
  if (it.slot === 'hair' || it.slot === 'hat' || it.slot === 'band') {
    const r = sz * 0.17,
      hy = cy + sz * 0.08,
      J = { hd: [cx, hy], nk: [cx, hy + r * 1.5], hr: r, face: 1, s: r / 9 };
    ctx.lineWidth = r * 0.55;
    ctx.strokeStyle = col;
    ctx.beginPath();
    ctx.moveTo(cx, hy + r * 1.2);
    ctx.lineTo(cx, hy + r * 2.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, hy, r, 0, 7);
    ctx.stroke();
    drawLook(f, J, 1);
    ctx.restore();
    return;
  }
  // a whole fighter, zoomed onto the part that matters
  const pz = it.slot === 'pose' ? VPOSE[it.id](24) : it.slot === 'surge' ? runPose({ t: 9 }) : STANCES[0].p,
    focus = { gloves: 'h', shoes: 'f', scarf: 'nk', tie: 'nk', shirt: 'mid', jacket: 'mid', legs: 'kn' }[
      it.slot
    ],
    sc = focus === 'h' || focus === 'f' ? sz / 50 : focus ? sz / 75 : sz / 105,
    o = {};
  withAlpha0(() => drawFig(0, 0, 1, pz, sc, col, L.d2, pz[9], 0, 7, o, 1));
  const fp = !focus
      ? [0, -42 * sc]
      : focus === 'mid'
        ? lerp2(o.sh, o.hp, 0.5)
        : focus === 'kn'
          ? lerp2(o.hp, o.kf, 0.9)
          : focus === 'h'
            ? lerp2(o.h, o.hb, 0.5)
            : focus === 'f'
              ? lerp2(o.f, o.fb, 0.5)
              : o[focus],
    x = cx - fp[0],
    y = cy - fp[1];
  ctx.beginPath();
  ctx.rect(cx - sz / 2, cy - sz * 0.42, sz, sz * 0.84);
  ctx.clip();
  if (it.slot === 'surge') {
    for (let g = 3; g >= 1; g--)
      drawFig(
        x - g * 9 * sc,
        y,
        1,
        pz,
        sc,
        surgeCol(L, g),
        surgeCol(L, g),
        0,
        0.25 + 0.12 * (3 - g),
        7,
        null,
        1
      );
    drawFig(x, y, 1, pz, sc, surgeCol(L, 0), surgeCol(L, 0), 0, 0.5, 15, null, 1);
  }
  const J = {};
  drawFig(x, y, 1, pz, sc, col, L.d2, pz[9], 1, 7, J, 1, lookLayers(f, { face: 1, s: sc }, 1), L.hfull);
  drawLook(f, { ...J, face: 1, s: sc, col }, 1, 'front');
  ctx.restore();
}
function withAlpha0(fn) {
  ctx.save();
  ctx.globalAlpha = 0;
  fn();
  ctx.restore();
}
