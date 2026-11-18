// Orange vs. the Pink Army: Drawing a house, and House mode (walking around a house, alone or with visitors online)
// Drawing never calls rnd() or changes the game; the house's floors and stairs become terrain (terrain.js).
// ===== HOUSE DRAWING =====
// Square (c, r): c counts from the left edge of the land, r up from the floor (row 0 sits on the floor line G).
const HX = c => c * HGRID.cell,
  HY = r => G - (r + 1) * HGRID.cell; // top edge of row r
function houseBg(it) {
  const k = it ? it.k : 'paper';
  ctx.fillStyle = it ? it.c : '#fbfaf4';
  ctx.fillRect(-30, -30, W + 60, H + 60);
  if (k === 'stripes') {
    ctx.fillStyle = it.c2;
    for (let x = 0; x < W; x += 60) ctx.fillRect(x, 0, 30, G);
  } else if (k === 'grad' || k === 'sky') {
    const g = ctx.createLinearGradient(0, 0, 0, G);
    g.addColorStop(0, k === 'sky' ? '#8fd0ff' : it.c2);
    g.addColorStop(1, it.c);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, G);
    if (k === 'sky')
      for (const [x, y, s] of [
        [140, 70, 1],
        [480, 45, 1.3],
        [760, 95, 0.9]
      ]) {
        ctx.fillStyle = '#fff';
        for (const [dx, dy, r] of [
          [0, 0, 22],
          [24, -8, 26],
          [50, 0, 20]
        ]) {
          ctx.beginPath();
          ctx.arc(x + dx * s, y + dy * s, r * s, 0, 7);
          ctx.fill();
        }
      }
  } else if (k === 'night') {
    ctx.fillStyle = it.c2;
    for (let i = 0; i < 40; i++) {
      const x = (i * 197) % W,
        y = (i * 83) % (G - 40),
        tw = 1.5 + ((i * 7) % 3) + Math.sin(fr * 0.05 + i) * 0.6;
      ctx.fillRect(x, y, tw, tw);
    }
  }
  if (k === 'paper' || k === 'plain') {
    ctx.globalAlpha = k === 'paper' ? 1 : 0.35;
    ctx.drawImage(gridC, 0, 0, W, H);
    ctx.globalAlpha = 1;
  }
}
function houseTile(t, x, y, s) {
  ctx.fillStyle = t.c;
  ctx.fillRect(x, y, s, s);
  ctx.strokeStyle = t.c2;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (t.id === 'brick' || t.id === 'stone') {
    const n = t.id === 'brick' ? 3 : 2;
    for (let i = 1; i < n; i++) {
      ctx.moveTo(x, y + (s * i) / n);
      ctx.lineTo(x + s, y + (s * i) / n);
    }
    for (let i = 0; i < n; i++) {
      const o = i % 2 ? s / 2 : s / 4;
      ctx.moveTo(x + o, y + (s * i) / n);
      ctx.lineTo(x + o, y + (s * (i + 1)) / n);
    }
  } else if (t.id === 'wood') {
    ctx.moveTo(x + s / 3, y);
    ctx.lineTo(x + s / 3, y + s);
    ctx.moveTo(x + (2 * s) / 3, y);
    ctx.lineTo(x + (2 * s) / 3, y + s);
  } else if (t.id === 'roof') {
    for (let i = 1; i < 3; i++) {
      ctx.moveTo(x, y + (s * i) / 3);
      ctx.lineTo(x + s, y + (s * i) / 3);
    }
  } else if (t.id === 'glass') {
    ctx.moveTo(x + s / 2, y);
    ctx.lineTo(x + s / 2, y + s);
    ctx.moveTo(x, y + s / 2);
    ctx.lineTo(x + s, y + s / 2);
    ctx.strokeStyle = '#fff';
    ctx.moveTo(x + 6, y + 14);
    ctx.lineTo(x + 14, y + 6);
  }
  ctx.stroke();
}
// A rounded box with the ink outline every drawing in the game has
function houseBox(x, y, w, h, fill, r) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r || 4);
  else ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.stroke();
}
// One furniture or decoration item, filling the box (x, y, w, h) in pixels
function houseThing(it, x, y, w, h) {
  const c = it.c,
    c2 = it.c2 || shade(c, -0.25),
    k = it.k,
    b = y + h; // bottom
  ctx.lineCap = ctx.lineJoin = 'round';
  if (k === 'chair') {
    houseBox(x + w * 0.2, b - h * 0.5, w * 0.6, h * 0.12, c);
    houseBox(x + w * 0.62, b - h * 0.95, w * 0.12, h * 0.5, c);
    houseBox(x + w * 0.22, b - h * 0.4, w * 0.08, h * 0.4, c2);
    houseBox(x + w * 0.62, b - h * 0.4, w * 0.08, h * 0.4, c2);
  } else if (k === 'table') {
    houseBox(x + 2, b - h * 0.75, w - 4, h * 0.14, c);
    houseBox(x + w * 0.1, b - h * 0.62, w * 0.07, h * 0.62, c2);
    houseBox(x + w * 0.83, b - h * 0.62, w * 0.07, h * 0.62, c2);
  } else if (k === 'bed') {
    houseBox(x + 2, b - h * 0.45, w - 4, h * 0.3, '#ffffff');
    houseBox(x + w * 0.25, b - h * 0.55, w * 0.73, h * 0.25, c);
    houseBox(x + w * 0.05, b - h * 0.6, w * 0.18, h * 0.18, c2);
    houseBox(x, b - h * 0.95, w * 0.06, h * 0.95, '#a96e3a');
    houseBox(x + w * 0.94, b - h * 0.6, w * 0.06, h * 0.6, '#a96e3a');
  } else if (k === 'couch') {
    houseBox(x + 2, b - h * 0.85, w - 4, h * 0.45, c2, 10);
    houseBox(x + 2, b - h * 0.5, w - 4, h * 0.38, c, 8);
    houseBox(x, b - h * 0.62, w * 0.1, h * 0.5, c2, 6);
    houseBox(x + w * 0.9, b - h * 0.62, w * 0.1, h * 0.5, c2, 6);
  } else if (k === 'shelf') {
    houseBox(x + 2, y + 2, w - 4, h - 2, c);
    const cols = ['#e8212b', '#3ec5ff', '#ffd400', '#3fae4a', '#ff7a00', '#9b59ff'];
    for (let r = 0; r < 3; r++) {
      const sy = y + 6 + (r * (h - 8)) / 3,
        sh = (h - 8) / 3;
      ctx.fillStyle = INK;
      ctx.fillRect(x + 4, sy + sh - 3, w - 8, 3);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = cols[(i + r * 2) % 6];
        ctx.fillRect(
          x + 8 + i * ((w - 16) / 6),
          sy + sh * 0.25 + (i % 2) * 3,
          (w - 16) / 6 - 2,
          sh * 0.7 - 3 - (i % 2) * 3
        );
      }
    }
  } else if (k === 'lamp') {
    houseBox(x + w * 0.46, y + h * 0.35, w * 0.08, h * 0.6, '#555');
    houseBox(x + w * 0.25, b - h * 0.06, w * 0.5, h * 0.06, '#555');
    ctx.fillStyle = 'rgba(255,212,0,.18)';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.25, w * 0.8, 0, 7);
    ctx.fill();
    ctx.fillStyle = c;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.3, y + 4);
    ctx.lineTo(x + w * 0.7, y + 4);
    ctx.lineTo(x + w * 0.9, y + h * 0.35);
    ctx.lineTo(x + w * 0.1, y + h * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (k === 'tv') {
    houseBox(x + 2, y + h * 0.08, w - 4, h * 0.68, c, 6);
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#3ec5ff');
    g.addColorStop(1, '#9b59ff');
    ctx.fillStyle = g;
    ctx.fillRect(x + 10, y + h * 0.08 + 8, w - 20, h * 0.68 - 16);
    houseBox(x + w * 0.4, y + h * 0.76, w * 0.2, h * 0.16, '#555');
    houseBox(x + w * 0.25, b - h * 0.08, w * 0.5, h * 0.08, '#555');
  } else if (k === 'fridge') {
    houseBox(x + 4, y + 2, w - 8, h - 2, c, 8);
    ctx.fillStyle = INK;
    ctx.fillRect(x + 4, y + h * 0.35, w - 8, 3);
    ctx.fillRect(x + w - 14, y + h * 0.15, 4, h * 0.14);
    ctx.fillRect(x + w - 14, y + h * 0.45, 4, h * 0.2);
  } else if (k === 'plant' || k === 'tree') {
    const ph = k === 'tree' ? h * 0.22 : h * 0.4;
    houseBox(x + w * 0.25, b - ph, w * 0.5, ph, '#c8553d');
    ctx.fillStyle = c;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    const top = y + (k === 'tree' ? 4 : h * 0.15),
      n = k === 'tree' ? 7 : 5;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.45,
        len = (b - ph - top) * (0.7 + (i % 2) * 0.3);
      ctx.beginPath();
      ctx.ellipse(
        x + w / 2 + Math.cos(a) * len * 0.45,
        b - ph + Math.sin(a) * len * 0.6,
        w * 0.16,
        len * 0.35,
        a + Math.PI / 2,
        0,
        7
      );
      ctx.fill();
      ctx.stroke();
    }
  } else if (k === 'rug') {
    ctx.fillStyle = c;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, b - 5, w / 2 - 2, 7, 0, 0, 7);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = c2;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, b - 5, w / 2 - 14, 3, 0, 0, 7);
    ctx.stroke();
  } else if (k === 'picture' || k === 'poster') {
    houseBox(x + w * 0.12, y + h * 0.1, w * 0.76, h * 0.8, k === 'poster' ? '#fff' : '#a96e3a');
    ctx.fillStyle = c;
    ctx.fillRect(x + w * 0.12 + 5, y + h * 0.1 + 5, w * 0.76 - 10, h * 0.8 - 10);
    if (k === 'picture') {
      ctx.fillStyle = '#3fae4a';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.2, y + h * 0.82);
      ctx.lineTo(x + w * 0.45, y + h * 0.45);
      ctx.lineTo(x + w * 0.8, y + h * 0.82);
      ctx.fill();
    } else {
      // a little orange fighter on the poster
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      const cx = x + w / 2,
        cy = y + h * 0.35;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, 7);
      ctx.moveTo(cx, cy + 5);
      ctx.lineTo(cx, cy + 22);
      ctx.lineTo(cx - 7, cy + 34);
      ctx.moveTo(cx, cy + 22);
      ctx.lineTo(cx + 7, cy + 34);
      ctx.moveTo(cx - 9, cy + 8);
      ctx.lineTo(cx, cy + 12);
      ctx.lineTo(cx + 10, cy + 4);
      ctx.stroke();
    }
  } else if (k === 'clock') {
    ctx.fillStyle = c;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    const cx = x + w / 2,
      cy = y + h / 2,
      r = Math.min(w, h) * 0.36,
      t = fr / 60;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 7);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.sin(t / 12) * r * 0.5, cy - Math.cos(t / 12) * r * 0.5);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.sin(t) * r * 0.8, cy - Math.cos(t) * r * 0.8);
    ctx.stroke();
  } else if (k === 'fish') {
    houseBox(x + 2, y + h * 0.15, w - 4, h * 0.8, c, 6);
    ctx.fillStyle = '#ff7a00';
    const fx = x + w * (0.3 + 0.4 * (0.5 + 0.5 * Math.sin(fr * 0.02)));
    ctx.beginPath();
    ctx.ellipse(fx, y + h * 0.55, 7, 4, 0, 0, 7);
    ctx.moveTo(fx - 6, y + h * 0.55);
    ctx.lineTo(fx - 12, y + h * 0.48);
    ctx.lineTo(fx - 12, y + h * 0.62);
    ctx.fill();
  } else if (k === 'door') {
    houseBox(x + w * 0.12, y + 3, w * 0.76, h - 3, c, 6);
    ctx.fillStyle = '#ffd400';
    ctx.beginPath();
    ctx.arc(x + w * 0.72, y + h * 0.55, 3.5, 0, 7);
    ctx.fill();
    ctx.strokeStyle = c2;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + w * 0.22, y + h * 0.1, w * 0.56, h * 0.3);
  } else if (k === 'flag') {
    houseBox(x + w * 0.2, y + 2, w * 0.07, h - 2, '#555');
    const wv = Math.sin(fr * 0.1) * 3;
    ctx.fillStyle = c;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.27, y + 4);
    ctx.quadraticCurveTo(x + w * 0.55, y + 4 + wv, x + w * 0.92, y + 10);
    ctx.lineTo(x + w * 0.92, y + h * 0.3);
    ctx.quadraticCurveTo(x + w * 0.55, y + h * 0.3 - wv, x + w * 0.27, y + h * 0.36);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (k === 'balloon') {
    const bob = Math.sin(fr * 0.03) * 4,
      cx = x + w / 2,
      r = w * 0.42,
      cy = y + r + 2 + bob;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.55, cy + r * 0.75);
    ctx.lineTo(cx - w * 0.14, b - h * 0.16 + bob);
    ctx.moveTo(cx + r * 0.55, cy + r * 0.75);
    ctx.lineTo(cx + w * 0.14, b - h * 0.16 + bob);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.5, cy + r * 0.85);
    ctx.bezierCurveTo(cx - r * 1.3, cy + r * 0.2, cx - r * 1.1, cy - r * 1.1, cx, cy - r);
    ctx.bezierCurveTo(cx + r * 1.1, cy - r * 1.1, cx + r * 1.3, cy + r * 0.2, cx + r * 0.5, cy + r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = c2;
    for (const dx of [-0.55, 0.15]) ctx.fillRect(cx + dx * r, cy - r * 1.2, r * 0.4, r * 2.2);
    ctx.restore();
    ctx.stroke();
    houseBox(cx - w * 0.16, b - h * 0.16 + bob, w * 0.32, h * 0.15, '#a96e3a');
  } else if (k === 'trophy') {
    houseBox(x + w * 0.3, b - h * 0.15, w * 0.4, h * 0.13, '#8a5a33');
    houseBox(x + w * 0.45, b - h * 0.35, w * 0.1, h * 0.2, c);
    houseBox(x + w * 0.25, y + h * 0.12, w * 0.5, h * 0.4, c, 10);
  }
}
// Floors and stairs: what fighters stand on
function houseSolid(id, x, y, s) {
  ctx.strokeStyle = INK;
  ctx.lineJoin = 'round';
  if (id === 'floor') {
    ctx.fillStyle = '#c98a4f';
    ctx.fillRect(x, y + s - 7, s, 5);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + s - 1);
    ctx.lineTo(x + s, y + s - 1);
    ctx.stroke();
    return;
  }
  const d = s / 3,
    b = y + s,
    pts =
      id === 'stairR'
        ? [
            [x, b],
            [x, b - d],
            [x + d, b - d],
            [x + d, b - 2 * d],
            [x + 2 * d, b - 2 * d],
            [x + 2 * d, b - s],
            [x + s, b - s],
            [x + s, b]
          ]
        : [
            [x + s, b],
            [x + s, b - d],
            [x + 2 * d, b - d],
            [x + 2 * d, b - 2 * d],
            [x + d, b - 2 * d],
            [x + d, b - s],
            [x, b - s],
            [x, b]
          ];
  ctx.fillStyle = '#d39a5e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
// The squares of a house as lists (keys parsed into numbers), remade whenever its cells or solids object changes
// (every save makes new ones)
const HCACHE = new WeakMap();
function houseLists(h) {
  let L = HCACHE.get(h.cells);
  if (!L || L.solidsOf !== h.solids) {
    const parse = o => Object.entries(o || {}).map(([k, v]) => [...k.split(',').map(Number), v]);
    L = { tiles: parse(h.cells), solids: parse(h.solids), solidsOf: h.solids };
    HCACHE.set(h.cells, L);
  }
  return L;
}
// How much land a house uses (squares), so the walkable world and the editor grow as you build
function houseExt(h) {
  let cols = 0,
    rows = 0;
  const L = houseLists(h);
  for (const [c, r] of [...L.tiles, ...L.solids]) {
    cols = Math.max(cols, c + 1);
    rows = Math.max(rows, r + 1);
  }
  for (const it of h.items) {
    const d = ITEM[it.id];
    cols = Math.max(cols, it.x + d.w);
    rows = Math.max(rows, it.y + d.h);
  }
  return { cols, rows };
}
// The house's floors and stairs as terrain surfaces (terrain.js)
function houseTerrain(h) {
  const s = HGRID.cell;
  return houseLists(h).solids.map(([c, r, id]) => {
    const x1 = c * s,
      lo = G - r * s,
      hi = lo - s;
    return id === 'floor'
      ? { x1, x2: x1 + s, y1: lo, y2: lo }
      : id === 'stairR'
        ? { x1, x2: x1 + s, y1: lo, y2: hi }
        : { x1, x2: x1 + s, y1: hi, y2: lo };
  });
}
// A whole house: the background fills the screen, the rest is drawn in world space seen from (cx, cy)
function drawHouse(h, cx, cy, z = 1) {
  houseBg(ITEM[h.bg]);
  const s = HGRID.cell,
    L = houseLists(h),
    vw = W / z,
    top = G + cy - G / z,
    bot = G + cy + (H - G) / z,
    c0 = Math.floor(cx / s) - 1,
    c1 = Math.ceil((cx + vw) / s) + 1,
    seen = (c, r, w, hh) => c + w >= c0 && c <= c1 && HY(r + hh - 1) < bot && HY(r) + s > top;
  ctx.save();
  camApply(cx, cy, z);
  for (const [c, r, t] of L.tiles) if (seen(c, r, 1, 1)) houseTile(HTILE[t], HX(c), HY(r), s);
  // floor
  ctx.fillStyle = '#d9b98f';
  ctx.fillRect(cx - 30, G, vw + 60, bot - G + 30);
  ctx.strokeStyle = '#b8956a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = Math.floor(cx / 90) * 90; x < cx + vw + 90; x += 90) {
    ctx.moveTo(x, G + 4);
    ctx.lineTo(x, bot);
  }
  ctx.moveTo(cx - 30, G + 38);
  ctx.lineTo(cx + vw + 30, G + 38);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.fillRect(cx - 30, G, vw + 60, 3);
  for (const it of h.items) {
    const d = ITEM[it.id];
    if (d && seen(it.x, it.y, d.w, d.h)) houseThing(d, HX(it.x), HY(it.y + d.h - 1), d.w * s, d.h * s);
  }
  for (const [c, r, id] of L.solids) if (seen(c, r, 1, 1)) houseSolid(id, HX(c), HY(r), s);
  ctx.restore();
}
// ===== HOUSE MODE =====
// Walk around a house: no enemies, no stars, nobody gets hurt. Floors and stairs are terrain, so you can climb the
// house; everything else is decoration. The camera follows your own fighter (drawing only: in House mode nothing
// in the simulation reads CAM).
let HVIEW = null; // the house being visited
// Everyone in the house stays on screen: the camera frames all players and zooms out as far as it must (down to
// 8%, enough for the whole land), and back in to normal size when they're together. One player: just follows them.
function houseCamera(snap) {
  const ps = PL.filter(p => !p.left),
    minX = Math.min(...ps.map(p => p.x)),
    maxX = Math.max(...ps.map(p => p.x)),
    top = Math.min(...ps.map(p => p.y - 130 * p.s)),
    bot = Math.max(...ps.map(p => p.y)),
    midX = (minX + maxX) / 2,
    midY = (top + bot) / 2,
    fitW = W / (maxX - minX + 360),
    fitH = (H / 2 - 20) / ((bot - top) / 2 + 40);
  let z = Math.max(0.08, Math.min(1, fitW, fitH)),
    cy = midY - G - (H / 2 - G) / z;
  if (cy > 0) {
    // near the floor: keep the floor at the bottom and make sure the highest player still fits
    cy = 0;
    z = Math.max(0.08, Math.min(z, (G - 20) / Math.max(1, G - top)));
  }
  const vw = W / z,
    cx = WB.r - WB.l <= vw ? (WB.l + WB.r - vw) / 2 : Math.max(WB.l, Math.min(WB.r - vw, midX - vw / 2)),
    k = snap ? 1 : 0.1;
  CAM.z += (z - CAM.z) * k;
  CAM.x += (cx - CAM.x) * k;
  CAM.y += (cy - CAM.y) * k;
}
const HOUSE_MODE = {
  id: 'house',
  update() {},
  bg() {
    houseCamera(fr < 2);
    drawHouse(HVIEW, CAM.x, CAM.y, CAM.z);
  },
  hud() {
    if (fr < 240) {
      ctx.fillStyle = INK;
      ctx.font = '900 18px "Trebuchet MS",sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(HVIEW.name || 'MY HOUSE', W / 2, 26);
      ctx.font = '700 13px "Trebuchet MS",sans-serif';
      ctx.fillText('Jump onto floors and stairs · Down + Jump drops through', W / 2, 104);
    }
  }
};
function startHouse(h) {
  closePanels();
  newSeed();
  init();
  HVIEW = h;
  MODE = HOUSE_MODE;
  state = 'play';
  WB.r = WW.r = Math.max(W, (houseExt(h).cols + 3) * HGRID.cell);
  terrainSet(houseTerrain(h));
  PL.forEach((p, i) => {
    p.x = 160 + i * 90;
    p.face = 1;
  });
  paused = false;
  releaseAll();
  show(null);
}
