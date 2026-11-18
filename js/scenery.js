// Orange vs. the Pink Army: Scenery for levels: parallax layers, props, gate, foreground and ambient effects.
// Everything here is drawing only. It never changes the game and uses Math.random() only for cosmetic effects.
// ===== SCENERY: the Wooded Trail in the hand-drawn paper style =====
// Stable pseudo-random value in [0, 1) for scenery index i, so hills and trees stay put as you walk.
const hh = i => {
  let t = Math.imul((i | 0) ^ 0x9e3779b9, 0x85ebca6b);
  t ^= t >>> 13;
  t = Math.imul(t, 0xc2b2ae35);
  return ((t ^ (t >>> 16)) >>> 0) / 4294967296;
};
const hexRGB = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function mixC(a, b, t) {
  const A = hexRGB(a),
    B = hexRGB(b);
  return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')';
}
// Chunk values (dusk, fireflies) blend over the last 300 px of each chunk.
function chunkVal(x, k) {
  const c = LV.ch;
  for (let i = 0; i < c.length; i++) {
    const a = c[i];
    if (x < a.x0 + a.w || i === c.length - 1) {
      const n = c[i + 1],
        f = n ? Math.max(0, Math.min(1, (x - (a.x0 + a.w - 300)) / 300)) : 0;
      return a[k] + ((n ? n[k] : a[k]) - a[k]) * f;
    }
  }
  return 0;
}
// One parallax layer: items every `sp` px, scrolling at `f` times the camera speed.
function layer(f, sp, seed, draw) {
  const off = CAM.x * f,
    i0 = Math.floor((off - 200) / sp),
    i1 = Math.ceil((off + W + 200) / sp);
  for (let i = i0; i <= i1; i++) draw(i * sp + hh(i + seed) * sp * 0.6 - off, hh(i + seed * 3 + 7), i);
}
function drawWoods() {
  const cx = CAM.x,
    dk = chunkVal(cx + W / 2, 'dusk');
  ctx.fillStyle = '#fbfaf4';
  ctx.fillRect(-30, -30, W + 60, H + 60);
  const gx = -(cx % 30);
  ctx.drawImage(gridC, gx, 0, W, H);
  ctx.drawImage(gridC, gx + W, 0, W, H);
  // sky wash: soft blue morning, orange-violet dusk
  const sky = ctx.createLinearGradient(0, 0, 0, G);
  sky.addColorStop(0, mixC('#cfe4f5', '#7d68a8', dk));
  sky.addColorStop(1, mixC('#fff6dc', '#ffab73', dk));
  ctx.globalAlpha = 0.3 + dk * 0.32;
  ctx.fillStyle = sky;
  ctx.fillRect(-30, -30, W + 60, G + 36);
  ctx.globalAlpha = 1;
  // sun sinks as the trail goes on
  ctx.fillStyle = mixC('#ffe98a', '#ff8a5c', dk);
  ctx.beginPath();
  ctx.arc(690 - cx * 0.02, 80 + dk * 175, 40, 0, 7);
  ctx.fill();
  // far mountains (1/8 speed)
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-40, G);
  layer(0.12, 170, 11, (x, r) => ctx.lineTo(x, G - 70 - r * 120));
  ctx.lineTo(W + 40, G);
  ctx.closePath();
  ctx.fillStyle = mixC('#ece7f1', '#cdbfd6', dk);
  ctx.fill();
  ctx.strokeStyle = mixC('#cfc9d6', '#a99bb5', dk);
  ctx.lineWidth = 3;
  ctx.stroke();
  // rolling hills with small pines (1/3 speed)
  ctx.beginPath();
  ctx.moveTo(-40, G + 6);
  layer(0.32, 210, 23, (x, r) => ctx.lineTo(x, G - 22 - r * 46));
  ctx.lineTo(W + 40, G + 6);
  ctx.closePath();
  ctx.fillStyle = mixC('#e5eedb', '#cfc6c4', dk);
  ctx.fill();
  ctx.strokeStyle = mixC('#b9c9ae', '#a0939b', dk);
  ctx.stroke();
  layer(0.32, 95, 41, (x, r) => {
    if (r < 0.45) return;
    const h = 26 + r * 22,
      y = G - 18 - hh(Math.round(x)) * 4;
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.lineTo(x - h * 0.32, y);
    ctx.lineTo(x + h * 0.32, y);
    ctx.closePath();
    ctx.fillStyle = mixC('#d4e3c8', '#bdb1b4', dk);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  // tree line (0.6 speed)
  ctx.lineWidth = 2.5;
  layer(0.6, 150, 57, (x, r) => {
    const h = 70 + r * 50;
    ctx.strokeStyle = mixC('#a8b99f', '#8f8391', dk);
    ctx.beginPath();
    ctx.moveTo(x, G + 6);
    ctx.lineTo(x, G - h);
    ctx.stroke();
    ctx.fillStyle = mixC('#dbe8d0', '#c4b8bb', dk);
    for (const [dx, dy, rr] of [
      [-14, -h, 26],
      [14, -h - 6, 24],
      [0, -h - 26, 26]
    ]) {
      ctx.beginPath();
      ctx.arc(x + dx * (0.8 + r * 0.4), G + dy, rr * (0.8 + r * 0.4), 0, 7);
      ctx.fill();
      ctx.stroke();
    }
  });
  // ground: trail dirt, hatching and grass tufts move with the fighters
  ctx.fillStyle = mixC('#efe8d6', '#ddd0c5', dk);
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.strokeStyle = '#d4cab8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = -(cx % 24) - 24; x < W + 30; x += 24) {
    ctx.moveTo(x, G + 16);
    ctx.lineTo(x - 10, G + 30);
  }
  ctx.stroke();
  ctx.strokeStyle = '#8fae7e';
  layer(1, 46, 71, (x, r) => {
    if (r < 0.35) return;
    ctx.beginPath();
    for (const a of [-0.5, 0, 0.45]) {
      ctx.moveTo(x, G + 6);
      ctx.lineTo(x + a * 14, G - 4 - r * 8);
    }
    ctx.stroke();
  });
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-30, G + 6);
  ctx.lineTo(W + 30, G + 6);
  ctx.stroke();
  // props and gates live in the world, behind the fighters
  ctx.save();
  ctx.translate(-cx, 0);
  for (const c of LV.ch)
    for (const p of c.props) {
      const x = c.x0 + p.x;
      if (x > cx - 260 && x < cx + W + 260) drawProp(p, x, dk);
    }
  for (const g of LV.gates) drawGate(g);
  ctx.restore();
}
const BARK = '#6c5a4c';
function blob(pts, fill, stroke, lw) {
  ctx.fillStyle = fill;
  for (const [x, y, r] of pts) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 7);
    ctx.fill();
  }
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  for (const [x, y, r] of pts) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 7);
    ctx.stroke();
  }
  ctx.fillStyle = fill;
  for (const [x, y, r] of pts) {
    ctx.beginPath();
    ctx.arc(x, y, r - lw, 0, 7);
    ctx.fill();
  }
}
function drawProp(p, x, dk) {
  const s = p.s || 1,
    leaf = mixC('#cfe6c1', '#b9b4a6', dk * 0.8),
    gy = G + 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (p.k === 'tree') {
    ctx.strokeStyle = BARK;
    ctx.lineWidth = 4;
    ctx.fillStyle = mixC('#e3d4c1', '#c9b6a8', dk);
    ctx.beginPath();
    ctx.moveTo(x - 11 * s, gy);
    ctx.lineTo(x - 7 * s, gy - 130 * s);
    ctx.lineTo(x + 7 * s, gy - 130 * s);
    ctx.lineTo(x + 12 * s, gy);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, gy - 95 * s);
    ctx.lineTo(x + 30 * s, gy - 125 * s);
    ctx.stroke();
    blob(
      [
        [x - 34 * s, gy - 150 * s, 40 * s],
        [x + 30 * s, gy - 158 * s, 42 * s],
        [x, gy - 190 * s, 44 * s],
        [x + 50 * s, gy - 126 * s, 26 * s]
      ],
      leaf,
      '#5f6f58',
      3
    );
  } else if (p.k === 'birch') {
    ctx.fillStyle = '#f7f4ee';
    ctx.strokeStyle = BARK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(x - 6 * s, gy - 210 * s, 12 * s, 210 * s);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 7; i++) {
      const y = gy - (20 + i * 27) * s,
        r = hh(i + Math.round(x));
      ctx.beginPath();
      ctx.moveTo(x - 6 * s + r * 4, y);
      ctx.lineTo(x - 6 * s + r * 4 + 6, y);
      ctx.stroke();
    }
    blob(
      [
        [x - 16 * s, gy - 210 * s, 24 * s],
        [x + 14 * s, gy - 222 * s, 22 * s],
        [x, gy - 240 * s, 22 * s]
      ],
      mixC('#e6efc3', '#c6bea0', dk),
      '#7d8a5a',
      2.5
    );
  } else if (p.k === 'pine') {
    ctx.strokeStyle = BARK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x, gy - 40 * s);
    ctx.stroke();
    ctx.fillStyle = mixC('#c3dbbd', '#a9a8a0', dk);
    ctx.strokeStyle = '#4f6650';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const b = gy - (30 + i * 52) * s,
        w = (62 - i * 14) * s;
      ctx.beginPath();
      ctx.moveTo(x, b - 80 * s);
      ctx.lineTo(x - w, b);
      ctx.lineTo(x + w, b);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else if (p.k === 'bush') {
    blob(
      [
        [x - 26, gy - 12, 20],
        [x, gy - 22, 24],
        [x + 26, gy - 12, 20]
      ],
      leaf,
      '#5f6f58',
      3
    );
  } else if (p.k === 'rock') {
    ctx.fillStyle = '#e4dfd6';
    ctx.strokeStyle = '#7d7469';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 34, gy);
    ctx.lineTo(x - 26, gy - 26);
    ctx.lineTo(x - 4, gy - 38);
    ctx.lineTo(x + 22, gy - 30);
    ctx.lineTo(x + 34, gy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 4, gy - 38);
    ctx.lineTo(x + 2, gy - 18);
    ctx.stroke();
  } else if (p.k === 'stump') {
    ctx.fillStyle = '#e3d4c1';
    ctx.strokeStyle = BARK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(x - 22, gy - 30, 44, 30);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f1e6d4';
    ctx.beginPath();
    ctx.ellipse(x, gy - 30, 22, 7, 0, 0, 7);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, gy - 30, 11, 3.5, 0, 0, 7);
    ctx.stroke();
  } else if (p.k === 'fern') {
    ctx.strokeStyle = '#6f9a5e';
    ctx.lineWidth = 3;
    for (const a of [-1.1, -0.55, 0, 0.55, 1.1]) {
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.quadraticCurveTo(x + a * 26, gy - 46, x + a * 46, gy - 30 + Math.abs(a) * 12);
      ctx.stroke();
    }
  } else if (p.k === 'sign' || p.k === 'arch') {
    const arch = p.k === 'arch',
      hw = arch ? 110 : 66,
      top = arch ? gy - 190 : gy - 100;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.fillStyle = '#e3d4c1';
    for (const px of arch ? [x - hw + 12, x + hw - 12] : [x]) {
      ctx.beginPath();
      ctx.rect(px - 5, top, 10, gy - top);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = '#f6ecd9';
    ctx.beginPath();
    ctx.rect(x - hw, top - 6, hw * 2, 34);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = '900 ' + (arch ? 18 : 15) + 'px Impact,"Arial Black",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.t + (arch ? '  →' : ''), x, top + 11);
    ctx.textBaseline = 'alphabetic';
  }
}
// The fallen log: cracks show its damage, it shakes when hit, and it's gone once smashed.
function drawGate(g) {
  if (g.hp <= 0) return;
  const x = g.x + (g.hit > 0 ? Math.sin(g.hit * 2.2) * 3 : 0),
    gy = G + 6,
    dmg = 1 - g.hp / g.max;
  ctx.fillStyle = '#c9a27a';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x - 52, gy - 40, 104, 40, 18);
  else ctx.rect(x - 52, gy - 40, 104, 40);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e8cfa9';
  ctx.beginPath();
  ctx.ellipse(x - 40, gy - 20, 12, 19, 0, 0, 7);
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x - 40, gy - 20, 5, 9, 0, 0, 7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 20, gy - 30);
  ctx.lineTo(x + 40, gy - 30);
  ctx.moveTo(x - 10, gy - 14);
  ctx.lineTo(x + 34, gy - 14);
  ctx.stroke();
  // cracks grow with damage
  ctx.lineWidth = 3;
  const n = Math.floor(dmg * 5);
  for (let i = 0; i < n; i++) {
    const cx_ = x - 14 + i * 14;
    ctx.beginPath();
    ctx.moveTo(cx_, gy - 40);
    ctx.lineTo(cx_ + 6, gy - 26);
    ctx.lineTo(cx_ - 2, gy - 16);
    ctx.stroke();
  }
}
// Foreground: grass in front of the trail (faster than the fighters), falling leaves, fireflies at dusk.
const AMB = [];
let ambCam = 0;
function drawWoodsFg() {
  const cx = CAM.x,
    dk = chunkVal(cx + W / 2, 'dusk'),
    flies = chunkVal(cx + W / 2, 'flies'),
    dcam = cx - ambCam;
  ambCam = cx;
  ctx.lineCap = 'round';
  ctx.strokeStyle = mixC('#7fa46c', '#6b7a62', dk);
  ctx.lineWidth = 3.5;
  layer(1.3, 70, 91, (x, r) => {
    if (r < 0.3) return;
    const by = H - 4 - r * 6,
      h = 18 + r * 22;
    ctx.beginPath();
    for (const a of [-0.6, -0.2, 0.25, 0.65]) {
      ctx.moveTo(x, by);
      ctx.quadraticCurveTo(x + a * 10, by - h * 0.6, x + a * 22, by - h);
    }
    ctx.stroke();
  });
  if (!live()) return;
  const nl = AMB.filter(a => a.k === 'leaf').length,
    nf = AMB.filter(a => a.k === 'fly').length;
  if (nl < 10 && Math.random() < 0.05)
    AMB.push({
      k: 'leaf',
      x: Math.random() * (W + 200),
      y: -10,
      vx: -0.3 - Math.random() * 0.5,
      vy: 0.5 + Math.random() * 0.5,
      a: Math.random() * 6,
      va: (Math.random() - 0.5) * 0.1,
      c: ['#9cc27f', '#e0a84f', '#d97a4a'][Math.floor(Math.random() * 3)]
    });
  if (nf < 16 * flies && Math.random() < 0.08)
    AMB.push({
      k: 'fly',
      x: Math.random() * W,
      y: G - 30 - Math.random() * 190,
      ph: Math.random() * 6,
      l: 400
    });
  for (let i = AMB.length - 1; i >= 0; i--) {
    const a = AMB[i];
    a.x -= dcam * (a.k === 'leaf' ? 1.1 : 1);
    if (a.k === 'leaf') {
      a.x += a.vx + Math.sin(a.y * 0.03) * 0.6;
      a.y += a.vy;
      a.a += a.va;
      if (a.y > G + 4) a.vy = a.vx = a.va = 0;
      if (a.y > G + 4 && Math.random() < 0.004) a.gone = 1;
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.a);
      ctx.fillStyle = a.c;
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 3, 0, 0, 7);
      ctx.fill();
      ctx.restore();
    } else {
      a.ph += 0.05;
      a.x += Math.sin(a.ph * 0.7) * 0.4;
      a.y += Math.cos(a.ph) * 0.3;
      if (--a.l <= 0 || flies < 0.3) a.gone = 1;
      const gl = 0.5 + 0.5 * Math.sin(a.ph * 2.3);
      ctx.fillStyle = 'rgba(255,230,90,' + (0.35 * gl).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(a.x, a.y, 9, 0, 7);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,240,140,' + (0.6 + 0.4 * gl).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(a.x, a.y, 2.8, 0, 7);
      ctx.fill();
    }
    if (a.gone || a.x < -60 || a.x > W + 260) AMB.splice(i, 1);
  }
}
