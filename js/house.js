// StickFighters: Drawing a house, and House mode (walking around a house, alone or with visitors online)
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
function houseOval(cx, cy, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, 7);
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
  } else if (k === 'armchair') {
    houseBox(x + w * 0.08, b - h * 0.92, w * 0.84, h * 0.6, c2, 10); // the back
    houseBox(x + w * 0.04, b - h * 0.5, w * 0.92, h * 0.32, c, 8); // the seat
    houseBox(x, b - h * 0.62, w * 0.18, h * 0.5, c, 6); // arms
    houseBox(x + w * 0.82, b - h * 0.62, w * 0.18, h * 0.5, c, 6);
    houseBox(x + w * 0.1, b - h * 0.18, w * 0.1, h * 0.18, '#5a3a22', 2);
    houseBox(x + w * 0.8, b - h * 0.18, w * 0.1, h * 0.18, '#5a3a22', 2);
  } else if (k === 'beanbag') {
    houseOval(x + w / 2, b - h * 0.3, w * 0.48, h * 0.3, c);
    houseOval(x + w * 0.42, b - h * 0.52, w * 0.3, h * 0.24, shade(c, 0.15));
  } else if (k === 'fireplace') {
    houseBox(x, b - h * 0.9, w, h * 0.9, c, 4);
    // bricks
    ctx.strokeStyle = 'rgba(28,22,38,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let r = 1; r < 5; r++) {
      ctx.moveTo(x + 2, b - h * 0.9 + (r * h * 0.9) / 5);
      ctx.lineTo(x + w - 2, b - h * 0.9 + (r * h * 0.9) / 5);
    }
    ctx.stroke();
    houseBox(x - w * 0.04, b - h, w * 1.08, h * 0.12, '#8a5a33', 3); // the mantel
    houseBox(x + w * 0.22, b - h * 0.55, w * 0.56, h * 0.55, '#2b2533', 3);
    // the fire (it flickers)
    const fl = Math.sin(performance.now() / 120) * 0.08;
    for (const [fx, fh, col] of [
      [0.38, 0.32 + fl, '#ff7a00'],
      [0.52, 0.4 - fl, '#e8212b'],
      [0.62, 0.28 + fl, '#ffb000'],
      [0.5, 0.2, '#ffd400']
    ]) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x + w * (fx - 0.09), b - 3);
      ctx.quadraticCurveTo(x + w * fx, b - h * fh * 1.4, x + w * (fx + 0.09), b - 3);
      ctx.fill();
    }
  } else if (k === 'coffee') {
    houseBox(x + 4, b - h * 0.5, w - 8, h * 0.12, c);
    houseBox(x + w * 0.1, b - h * 0.4, w * 0.06, h * 0.4, c2);
    houseBox(x + w * 0.84, b - h * 0.4, w * 0.06, h * 0.4, c2);
    houseBox(x + w * 0.35, b - h * 0.62, w * 0.14, h * 0.12, '#ffffff', 3); // a mug
  } else if (k === 'piano') {
    houseBox(x + 2, b - h * 0.95, w - 4, h * 0.6, c, 6);
    houseBox(x + 2, b - h * 0.4, w - 4, h * 0.12, '#ffffff', 2); // the keys
    ctx.fillStyle = INK;
    for (let i = 1; i < 9; i++) if (i % 4 !== 3) ctx.fillRect(x + 2 + ((w - 4) * i) / 9 - 2, b - h * 0.4, 4, h * 0.07);
    houseBox(x + w * 0.08, b - h * 0.28, w * 0.07, h * 0.28, c);
    houseBox(x + w * 0.85, b - h * 0.28, w * 0.07, h * 0.28, c);
    houseBox(x + w * 0.4, b - h * 0.85, w * 0.2, h * 0.16, '#fff8ee', 2); // the music
  } else if (k === 'bunk') {
    for (const lv of [0, 1]) {
      const by0 = b - lv * h * 0.5;
      houseBox(x + 4, by0 - h * 0.2, w - 8, h * 0.1, '#ffffff', 3);
      houseBox(x + w * 0.25, by0 - h * 0.26, w * 0.72, h * 0.1, c, 3);
      houseBox(x + w * 0.06, by0 - h * 0.28, w * 0.16, h * 0.08, '#ffffff', 3);
    }
    houseBox(x, b - h, w * 0.05, h, '#8a5a33', 2);
    houseBox(x + w * 0.95, b - h, w * 0.05, h, '#8a5a33', 2);
    // the ladder
    ctx.strokeStyle = '#8a5a33';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let r = 1; r < 5; r++) {
      ctx.moveTo(x + w * 0.82, b - (r * h) / 5);
      ctx.lineTo(x + w * 0.93, b - (r * h) / 5);
    }
    ctx.stroke();
  } else if (k === 'dresser') {
    houseBox(x + 3, b - h * 0.78, w - 6, h * 0.74, c, 4);
    for (let r = 0; r < 3; r++) {
      houseBox(x + 8, b - h * 0.74 + r * h * 0.23, w - 16, h * 0.19, shade(c, 0.1), 3);
      houseOval(x + w / 2, b - h * 0.645 + r * h * 0.23, 3, 3, '#ffd400');
    }
    houseBox(x + w * 0.62, b - h * 0.98, w * 0.18, h * 0.2, '#cdeeff', 3); // a little mirror
  } else if (k === 'wardrobe') {
    houseBox(x + 3, b - h * 0.98, w - 6, h * 0.95, c, 4);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, b - h * 0.94);
    ctx.lineTo(x + w / 2, b - h * 0.08);
    ctx.stroke();
    houseOval(x + w / 2 - 7, b - h * 0.5, 3, 5, '#ffd400');
    houseOval(x + w / 2 + 7, b - h * 0.5, 3, 5, '#ffd400');
  } else if (k === 'nightstand') {
    houseBox(x + w * 0.15, b - h * 0.55, w * 0.7, h * 0.52, c, 3);
    houseOval(x + w / 2, b - h * 0.32, 3, 3, '#ffd400');
    houseBox(x + w * 0.38, b - h * 0.85, w * 0.24, h * 0.3, '#ffd400', 6); // a little lamp
  } else if (k === 'toybox') {
    houseBox(x + w * 0.06, b - h * 0.62, w * 0.88, h * 0.6, c, 4);
    houseBox(x + w * 0.02, b - h * 0.72, w * 0.96, h * 0.14, shade(c, -0.2), 4);
    ctx.fillStyle = '#ffd400';
    ctx.font = '900 ' + Math.round(h * 0.3) + 'px Impact,"Arial Black",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TOYS', x + w / 2, b - h * 0.2);
  } else if (k === 'desk') {
    houseBox(x + 2, b - h * 0.72, w - 4, h * 0.12, c);
    houseBox(x + w * 0.6, b - h * 0.6, w * 0.36, h * 0.6, shade(c, -0.1), 3); // drawers
    houseBox(x + w * 0.06, b - h * 0.6, w * 0.06, h * 0.6, c);
    houseBox(x + w * 0.2, b - h * 1.05, w * 0.26, h * 0.3, '#2b2533', 3); // a computer
    houseBox(x + w * 0.23, b - h * 1.0, w * 0.2, h * 0.2, '#7fc4ee', 2);
  } else if (k === 'stove') {
    houseBox(x + 3, b - h * 0.5, w - 6, h * 0.5, c, 3);
    houseBox(x + w * 0.15, b - h * 0.4, w * 0.7, h * 0.28, '#2b2533', 3); // the oven window
    houseBox(x + 3, b - h * 0.58, w - 6, h * 0.08, '#6f6a78', 2);
    houseBox(x + w * 0.25, b - h * 0.78, w * 0.5, h * 0.18, '#8a8494', 3); // a pot
    houseBox(x + w * 0.18, b - h * 0.8, w * 0.64, h * 0.04, '#6f6a78', 2);
  } else if (k === 'ksink') {
    houseBox(x + 2, b - h * 0.48, w - 4, h * 0.48, c2, 3); // cupboards
    houseBox(x + 2, b - h * 0.52, w - 4, h * 0.06, '#d9d4de', 2); // the counter
    houseBox(x + w * 0.3, b - h * 0.52, w * 0.4, h * 0.05, '#9a96a2', 2); // the sink
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, b - h * 0.52);
    ctx.lineTo(x + w * 0.5, b - h * 0.7);
    ctx.lineTo(x + w * 0.42, b - h * 0.7);
    ctx.stroke();
    houseBox(x + w * 0.08, b - h * 0.96, w * 0.84, h * 0.3, '#c98a4f', 3); // the cabinet above
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, b - h * 0.96);
    ctx.lineTo(x + w * 0.5, b - h * 0.66);
    ctx.stroke();
  } else if (k === 'cupboard') {
    houseBox(x + 2, b - h * 0.85, w - 4, h * 0.85, c, 3);
    houseBox(x, b - h * 0.95, w, h * 0.12, '#d9d4de', 2);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, b - h * 0.82);
    ctx.lineTo(x + w / 2, b - 3);
    ctx.stroke();
    houseOval(x + w / 2 - 6, b - h * 0.5, 2.5, 4, '#ffd400');
    houseOval(x + w / 2 + 6, b - h * 0.5, 2.5, 4, '#ffd400');
  } else if (k === 'stool') {
    houseOval(x + w / 2, b - h * 0.62, w * 0.3, h * 0.08, c);
    houseBox(x + w * 0.3, b - h * 0.58, w * 0.06, h * 0.58, '#8a8494', 2);
    houseBox(x + w * 0.64, b - h * 0.58, w * 0.06, h * 0.58, '#8a8494', 2);
  } else if (k === 'microwave') {
    houseBox(x + 2, b - h * 0.6, w - 4, h * 0.56, c, 4);
    houseBox(x + w * 0.1, b - h * 0.5, w * 0.55, h * 0.38, '#2b2533', 3);
    for (let i = 0; i < 3; i++) houseOval(x + w * 0.8, b - h * 0.48 + i * h * 0.13, 3, 3, '#ffd400');
  } else if (k === 'dining') {
    houseBox(x + 2, b - h * 0.7, w - 4, h * 0.1, c2, 2); // the tablecloth
    houseBox(x + 2, b - h * 0.62, w - 4, h * 0.12, c);
    houseBox(x + w * 0.06, b - h * 0.5, w * 0.05, h * 0.5, c);
    houseBox(x + w * 0.89, b - h * 0.5, w * 0.05, h * 0.5, c);
    for (const px of [0.25, 0.5, 0.75]) houseOval(x + w * px, b - h * 0.75, w * 0.07, h * 0.04, '#ffffff'); // plates
  } else if (k === 'china') {
    houseBox(x + 3, b - h * 0.98, w - 6, h * 0.95, c, 4);
    houseBox(x + 8, b - h * 0.92, w - 16, h * 0.5, '#cdeeff', 3); // glass doors
    for (let r = 0; r < 2; r++)
      for (let i = 0; i < 3; i++)
        houseOval(x + 16 + i * ((w - 32) / 2), b - h * 0.78 + r * h * 0.22, 5, 7, ['#3ec5ff', '#ffffff', '#ff4fa3'][(i + r) % 3]);
    houseBox(x + 8, b - h * 0.38, w - 16, h * 0.32, shade(c, 0.1), 3);
  } else if (k === 'candles') {
    houseBox(x + w * 0.3, b - h * 0.1, w * 0.4, h * 0.08, c, 2);
    houseBox(x + w * 0.46, b - h * 0.5, w * 0.08, h * 0.42, c, 2);
    houseBox(x + w * 0.22, b - h * 0.5, w * 0.56, h * 0.05, c, 2);
    for (const cx of [0.27, 0.5, 0.73]) {
      houseBox(x + w * cx - 3, b - h * 0.75, 6, h * 0.25, '#ffffff', 2);
      ctx.fillStyle = '#ff7a00';
      ctx.beginPath();
      ctx.ellipse(x + w * cx, b - h * 0.82, 3, 5 + Math.sin(performance.now() / 150 + cx * 9), 0, 0, 7);
      ctx.fill();
    }
  } else if (k === 'toilet') {
    houseBox(x + w * 0.62, b - h * 0.95, w * 0.3, h * 0.45, c, 5); // the tank
    houseBox(x + w * 0.12, b - h * 0.55, w * 0.62, h * 0.12, c, 6); // the seat
    houseBox(x + w * 0.22, b - h * 0.45, w * 0.42, h * 0.45, c, 6); // the bowl
    houseBox(x + w * 0.7, b - h * 0.85, w * 0.1, h * 0.05, '#c0c0c8', 2);
  } else if (k === 'tub') {
    houseBox(x + 4, b - h * 0.7, w - 8, h * 0.6, c, 14);
    ctx.fillStyle = '#9fd8ff';
    ctx.fillRect(x + 8, b - h * 0.66, w - 16, h * 0.1);
    // bubbles
    for (const [bx, br] of [
      [0.2, 6],
      [0.3, 9],
      [0.45, 5],
      [0.62, 8],
      [0.78, 6]
    ])
      houseOval(x + w * bx, b - h * 0.72, br, br * 0.8, '#ffffff');
    houseBox(x + w * 0.12, b - h * 0.12, w * 0.06, h * 0.12, '#ffd400', 2); // feet
    houseBox(x + w * 0.82, b - h * 0.12, w * 0.06, h * 0.12, '#ffd400', 2);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.9, b - h * 0.7);
    ctx.lineTo(x + w * 0.9, b - h * 0.95);
    ctx.lineTo(x + w * 0.83, b - h * 0.95);
    ctx.stroke();
  } else if (k === 'bsink') {
    houseBox(x + w * 0.2, b - h * 0.95, w * 0.6, h * 0.36, '#cdeeff', 4); // the mirror
    houseBox(x + w * 0.08, b - h * 0.5, w * 0.84, h * 0.12, c, 6); // the basin
    houseBox(x + w * 0.4, b - h * 0.38, w * 0.2, h * 0.38, c, 3); // the stand
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, b - h * 0.5);
    ctx.lineTo(x + w * 0.5, b - h * 0.58);
    ctx.stroke();
  } else if (k === 'shower') {
    houseBox(x + 2, b - h * 0.98, w - 4, h * 0.96, 'rgba(205,238,255,0.55)', 4);
    houseBox(x, b - h * 0.06, w, h * 0.06, '#ffffff', 2);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.8, b - h * 0.98);
    ctx.lineTo(x + w * 0.8, b - h * 0.85);
    ctx.lineTo(x + w * 0.55, b - h * 0.85);
    ctx.stroke();
    houseOval(x + w * 0.5, b - h * 0.84, w * 0.12, h * 0.02, '#c0c0c8');
    ctx.strokeStyle = 'rgba(62,197,255,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.moveTo(x + w * (0.4 + i * 0.07), b - h * 0.8);
      ctx.lineTo(x + w * (0.35 + i * 0.08), b - h * 0.4);
    }
    ctx.stroke();
  } else if (k === 'trunk') {
    houseBox(x + 3, b - h * 0.6, w - 6, h * 0.58, c, 4);
    houseBox(x + 2, b - h * 0.78, w - 4, h * 0.22, shade(c, -0.15), 10);
    houseBox(x + w * 0.2, b - h * 0.78, w * 0.06, h * 0.76, '#ffd400', 1);
    houseBox(x + w * 0.74, b - h * 0.78, w * 0.06, h * 0.76, '#ffd400', 1);
    houseBox(x + w * 0.45, b - h * 0.62, w * 0.1, h * 0.14, '#ffd400', 2);
  } else if (k === 'boxes') {
    houseBox(x + 3, b - h * 0.45, w - 6, h * 0.44, c, 2);
    houseBox(x + 7, b - h * 0.82, w - 12, h * 0.37, shade(c, 0.08), 2);
    ctx.strokeStyle = '#a07a46';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, b - h * 0.45);
    ctx.lineTo(x + w / 2, b - h * 0.32);
    ctx.moveTo(x + w / 2, b - h * 0.82);
    ctx.lineTo(x + w / 2, b - h * 0.7);
    ctx.stroke();
  } else if (k === 'rocker') {
    houseBox(x + w * 0.6, b - h * 0.92, w * 0.12, h * 0.68, c, 3); // the back
    houseBox(x + w * 0.15, b - h * 0.32, w * 0.6, h * 0.07, c, 3); // the seat
    houseBox(x + w * 0.2, b - h * 0.25, w * 0.07, h * 0.18, c, 2);
    houseBox(x + w * 0.62, b - h * 0.25, w * 0.07, h * 0.18, c, 2);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x + w * 0.45, b - h * 0.6, h * 0.55, Math.PI * 0.3, Math.PI * 0.72); // the rocker
    ctx.stroke();
  } else if (k === 'mirror') {
    houseBox(x + w * 0.18, b - h * 0.98, w * 0.64, h * 0.82, c2, 20);
    houseBox(x + w * 0.25, b - h * 0.92, w * 0.5, h * 0.7, c, 16);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.35, b - h * 0.8);
    ctx.lineTo(x + w * 0.45, b - h * 0.86);
    ctx.stroke();
    houseBox(x + w * 0.3, b - h * 0.16, w * 0.06, h * 0.16, c2, 2);
    houseBox(x + w * 0.64, b - h * 0.16, w * 0.06, h * 0.16, c2, 2);
  } else if (k === 'cobweb') {
    ctx.strokeStyle = 'rgba(80,72,90,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const an = (i / 4) * (Math.PI / 2);
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(an) * w, y + Math.sin(an) * h);
    }
    for (const r of [0.3, 0.55, 0.8]) {
      ctx.moveTo(x + w * r, y);
      for (let i = 1; i <= 4; i++) {
        const an = (i / 4) * (Math.PI / 2);
        ctx.lineTo(x + Math.cos(an) * w * r, y + Math.sin(an) * h * r);
      }
    }
    ctx.stroke();
    houseOval(x + w * 0.5, y + h * 0.5, 3, 3, '#2b2533'); // a little spider
  } else if (k === 'teddy') {
    // a big stuffed bear sitting up: legs out front, round tummy with a heart, arms, head with ears and a muzzle
    const u = Math.min(w, h),
      cx = x + w / 2,
      teddy = (ex, ey, rx, ry, col) => {
        ctx.fillStyle = col;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(ex, ey, rx, ry, 0, 0, 7);
        ctx.fill();
        ctx.stroke();
      };
    teddy(cx - u * 0.3, b - u * 0.24, u * 0.13, u * 0.17, c); // arms
    teddy(cx + u * 0.3, b - u * 0.24, u * 0.13, u * 0.17, c);
    teddy(cx, b - u * 0.3, u * 0.3, u * 0.28, c); // tummy
    teddy(cx, b - u * 0.28, u * 0.17, u * 0.16, '#ffe0ef');
    teddy(cx - u * 0.24, b - u * 0.08, u * 0.15, u * 0.09, c); // feet
    teddy(cx + u * 0.24, b - u * 0.08, u * 0.15, u * 0.09, c);
    teddy(cx - u * 0.24, b - u * 0.08, u * 0.07, u * 0.05, c2);
    teddy(cx + u * 0.24, b - u * 0.08, u * 0.07, u * 0.05, c2);
    const hy = b - u * 0.7;
    teddy(cx - u * 0.2, hy - u * 0.18, u * 0.09, u * 0.09, c); // ears
    teddy(cx + u * 0.2, hy - u * 0.18, u * 0.09, u * 0.09, c);
    teddy(cx - u * 0.2, hy - u * 0.18, u * 0.045, u * 0.045, c2);
    teddy(cx + u * 0.2, hy - u * 0.18, u * 0.045, u * 0.045, c2);
    teddy(cx, hy, u * 0.24, u * 0.21, c); // head
    teddy(cx, hy + u * 0.07, u * 0.1, u * 0.075, '#ffe0ef'); // muzzle
    ctx.fillStyle = INK;
    for (const dx of [-0.09, 0.09]) {
      ctx.beginPath();
      ctx.arc(cx + dx * u, hy - u * 0.03, u * 0.025, 0, 7);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.ellipse(cx, hy + u * 0.045, u * 0.035, u * 0.025, 0, 0, 7);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, hy + u * 0.07, u * 0.035, 0.2, Math.PI - 0.2);
    ctx.stroke();
    // a heart on the tummy
    const hx = cx,
      hyy = b - u * 0.3,
      r = u * 0.06;
    ctx.fillStyle = '#e8212b';
    ctx.beginPath();
    ctx.moveTo(hx, hyy + r * 1.3);
    ctx.bezierCurveTo(hx - r * 2, hyy, hx - r, hyy - r * 1.3, hx, hyy - r * 0.4);
    ctx.bezierCurveTo(hx + r, hyy - r * 1.3, hx + r * 2, hyy, hx, hyy + r * 1.3);
    ctx.fill();
  } else if (k === 'trophy') {
    houseBox(x + w * 0.3, b - h * 0.15, w * 0.4, h * 0.13, '#8a5a33');
    houseBox(x + w * 0.45, y + h * 0.48, w * 0.1, h * 0.4, c);
    houseBox(x + w * 0.25, y + h * 0.12, w * 0.5, h * 0.4, c, 10);
  }
}
// Barriers are black lines. Stairs: the outline of their steps (or a spiral), rising to the right (R) or left (L).
// The step outline as points, from the bottom corner up to the top corner, for a square at (x, y) of size s
function stairPts(id, x, y, s) {
  const d = s / 3,
    b = y + s,
    up = [
      [0, 0],
      [0, d],
      [d, d],
      [d, 2 * d],
      [2 * d, 2 * d],
      [2 * d, s],
      [s, s]
    ];
  return up.map(([u, v]) => [id.endsWith('R') ? x + u : x + s - u, b - v]);
}
function houseSolid(id, x, y, s) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.beginPath();
  if (id === 'floor') {
    ctx.moveTo(x, y + s);
    ctx.lineTo(x + s, y + s);
  } else if (id === 'side') {
    ctx.moveTo(x + s, y);
    ctx.lineTo(x + s, y + s);
  } else if (id.startsWith('stair'))
    stairPts(id, x, y, s).forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  else if (id === 'ladder') {
    for (const u of [0.25, 0.75]) {
      ctx.moveTo(x + s * u, y);
      ctx.lineTo(x + s * u, y + s);
    }
    for (const v of [1 / 6, 1 / 2, 5 / 6]) {
      ctx.moveTo(x + s * 0.25, y + s * v);
      ctx.lineTo(x + s * 0.75, y + s * v);
    }
  } else {
    // spiral stairs, seen from the side: a centre post and steps fanning out to alternate sides as they climb
    const cx = x + s / 2;
    ctx.moveTo(cx, y);
    ctx.lineTo(cx, y + s);
    for (let i = 0; i < 4; i++) {
      const ty = y + s - (i + 0.5) * (s / 4),
        d = i % 2 ? -1 : 1;
      ctx.moveTo(cx, ty);
      ctx.lineTo(cx + d * s * 0.42, ty - s * 0.06);
      ctx.lineTo(cx + d * s * 0.42, ty + s * 0.06);
    }
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const t = i / 16,
        px = cx + Math.sin(t * Math.PI * 2) * s * 0.42,
        py = y + s - t * s;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
  }
  ctx.stroke();
}
// A material painted inside stairs: fills the area under the steps
function houseFill(t, sid, x, y, s) {
  ctx.save();
  ctx.beginPath();
  const pts = stairPts(sid, x, y, s);
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.lineTo(sid.endsWith('R') ? x + s : x, y + s);
  ctx.closePath();
  ctx.clip();
  houseTile(t, x, y, s);
  ctx.restore();
}
// The squares of a house as lists (keys parsed into numbers), remade whenever one of its layers changes
// (every save makes new layer objects)
const HCACHE = new WeakMap();
function houseLists(h) {
  let L = HCACHE.get(h.cells);
  if (
    !L ||
    L.of[0] !== h.solids ||
    L.of[1] !== h.fills ||
    L.of[2] !== h.sides ||
    L.of[3] !== h.climbs ||
    L.of[4] !== h.floors
  ) {
    const parse = o => Object.entries(o || {}).map(([k, v]) => [...k.split(',').map(Number), v]);
    L = {
      tiles: parse(h.cells),
      solids: parse(h.solids),
      fills: parse(h.fills),
      sides: parse(h.sides),
      climbs: parse(h.climbs),
      floors: parse(h.floors),
      of: [h.solids, h.fills, h.sides, h.climbs, h.floors]
    };
    HCACHE.set(h.cells, L);
  }
  return L;
}
// How much land a house uses (squares), so the walkable world and the editor grow as you build
function houseExt(h) {
  let cols = 0,
    rows = 0;
  const L = houseLists(h);
  for (const [c, r] of [...L.tiles, ...L.solids, ...L.floors, ...L.sides, ...L.climbs]) {
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
// The house's barriers as terrain: floors and stairs are surfaces, side walls are walls (terrain.js)
function houseTerrain(h) {
  const s = HGRID.cell,
    L = houseLists(h);
  return {
    surfaces: [...L.floors, ...L.solids].map(([c, r, id]) => {
      const x1 = c * s,
        lo = G - r * s,
        hi = lo - s;
      return id === 'floor'
        ? { x1, x2: x1 + s, y1: lo, y2: lo }
        : id === 'stairR'
          ? { x1, x2: x1 + s, y1: lo, y2: hi }
          : { x1, x2: x1 + s, y1: hi, y2: lo };
    }),
    walls: L.sides.map(([c, r]) => ({ x: (c + 1) * s, y1: G - (r + 1) * s, y2: G - r * s })),
    climbs: L.climbs.map(([c, r]) => ({ x: c * s + s / 2, y1: G - (r + 1) * s, y2: G - r * s }))
  };
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
  const sol = h.solids || {};
  for (const [c, r, t] of L.fills)
    if (seen(c, r, 1, 1) && sol[c + ',' + r]) houseFill(HTILE[t], sol[c + ',' + r], HX(c), HY(r), s);
  for (const [c, r, id] of L.solids) if (seen(c, r, 1, 1)) houseSolid(id, HX(c), HY(r), s);
  for (const [c, r] of L.floors) if (seen(c, r, 1, 1)) houseSolid('floor', HX(c), HY(r), s);
  for (const [c, r, id] of L.climbs) if (seen(c, r, 1, 1)) houseSolid(id, HX(c), HY(r), s);
  for (const [c, r] of L.sides) if (seen(c, r, 1, 1)) houseSolid('side', HX(c), HY(r), s);
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
  // online each screen follows its own player; locally the camera frames everyone
  const all = PL.filter(p => !p.left),
    mine = NET.match ? all.filter(p => p.slot === NET.mySlot) : [],
    ps = mine.length ? mine : all,
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
      ctx.fillText(HVIEW.name || 'MY HOUSE', W / 2, HUD_Y);
      ctx.font = '700 13px "Trebuchet MS",sans-serif';
      ctx.fillText(
        'Hold Up or Down to take stairs and ladders \u00b7 Down + Jump drops through a floor',
        W / 2,
        HUD_Y + 20
      );
    }
  }
};
// ===== USING FURNITURE =====
// In a house, Punch or Kick beside furniture with a use (data/items.js) sits on it or lies down on it; Punch or Kick
// again gets up. f.use = { k: 'sit' | 'lie', x, y, face } while using it.
const USE_POSE = {
  sit: [4, 30, 70, 20, 75, 88, 88, 84, 84, 0],
  lie: [0, 15, 20, -15, 20, 4, 6, -4, 6, 90]
};
function houseUseAt(f) {
  const s = HGRID.cell;
  for (const it of HVIEW.items) {
    const d = ITEM[it.id];
    if (!d || !d.use) continue;
    const x1 = it.x * s,
      x2 = (it.x + d.w) * s,
      fy = G - it.y * s;
    if (f.x >= x1 - 10 && f.x <= x2 + 10 && Math.abs(f.y - fy) < 4) return { it, d, x1, x2, fy };
  }
  return null;
}
function houseUse(f, I) {
  const press = wantIn(I, 'p') || wantIn(I, 'k');
  if (f.use) {
    const U = f.use;
    f.x = U.x;
    f.y = U.y;
    f.vx = f.vy = 0;
    f.face = U.face;
    f.att = null;
    smooth(f, USE_POSE[U.k], 0.25);
    f.pose[9] = USE_POSE[U.k][9]; // lying down: the whole body turned flat

    if (press) {
      eatIn(I, 'p');
      eatIn(I, 'k');
      f.use = null;
      f.pose[9] = 0;
      f.y = U.fy;
      f.vy = -4; // up you get
      sfx(500, 0.06, 'triangle', 0.03, 200);
    }
    return true;
  }
  if (!press || f.st !== 'free' || f.y < f.gy - 1) return false;
  const A = houseUseAt(f);
  if (!A) return false;
  eatIn(I, 'p');
  eatIn(I, 'k');
  const lie = A.d.use === 'lie',
    // one seat chairs and beds: the middle; a couch, a bench or a trunk: where you are on it
    x = lie || A.d.w === 1 ? (A.x1 + A.x2) / 2 : Math.max(A.x1 + 16, Math.min(A.x2 - 16, f.x));
  // lying: head on the pillow (beds have theirs on the left; a tub's tap is on the right)
  f.use = { k: A.d.use, x, y: lie ? A.fy + 2 : A.fy, fy: A.fy, face: lie ? -1 : f.face };
  f.vx = 0;
  sfx(lie ? 300 : 420, 0.08, 'triangle', 0.03, -100);
  return true;
}
function startHouse(h) {
  closePanels();
  newSeed();
  init();
  HVIEW = h;
  MODE = HOUSE_MODE;
  state = 'play';
  WB.r = WW.r = Math.max(W, (houseExt(h).cols + 3) * HGRID.cell);
  const T = houseTerrain(h);
  terrainSet(T.surfaces, T.walls, T.climbs);
  PL.forEach((p, i) => {
    p.x = 160 + i * 90;
    p.face = 1;
  });
  paused = false;
  releaseAll();
  show(null);
}
