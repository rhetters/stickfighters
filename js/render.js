// Orange vs. the Pink Army: Drawing: gear, figures, background, effects, HUD, frame render
// Gear that tells the types apart at a glance: Guard shield, Flanker scarf, Captain helmet
function drawGear(f, o, a) {
  const s = f.s,
    fc = f.face;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (f.T.guard && f.noShield <= 0 && o.h) {
    const up = f.st === 'free' || f.st === 'block',
      x = up ? o.h[0] + fc * 3 * s : o.sh[0] + fc * 6 * s,
      y = up ? o.h[1] : o.sh[1] + 16 * s;
    ctx.fillStyle = '#9aa3b5';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - 6 * s, y - 20 * s, 12 * s, 40 * s, 6 * s);
    else ctx.rect(x - 6 * s, y - 20 * s, 12 * s, 40 * s);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#d8dde8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 14 * s);
    ctx.lineTo(x, y + 14 * s);
    ctx.stroke();
  }
  if (f.T.ai === 'flank' && o.hd) {
    const hx = o.hd[0],
      hy = o.hd[1],
      w = Math.sin(fr * 0.3) * 4;
    ctx.strokeStyle = '#7a1f55';
    ctx.lineWidth = 4 * s;
    ctx.beginPath();
    ctx.moveTo(hx - fc * 6 * s, hy);
    ctx.quadraticCurveTo(hx - fc * 18 * s, hy + w, hx - fc * 30 * s, hy + 3 + w * 1.6);
    ctx.stroke();
  }
  if (f.T.boss && o.hd) {
    const hx = o.hd[0],
      hy = o.hd[1],
      r = 9 * s;
    ctx.fillStyle = '#ffd400';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(hx - r, hy - r * 0.4);
    for (let i = 0; i <= 4; i++) {
      const px = hx - r + (i * r) / 2;
      ctx.lineTo(px, hy - r * (i % 2 ? 1.9 : 1.1));
    }
    ctx.lineTo(hx + r, hy - r * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}
function stars(x, y) {
  ctx.save();
  ctx.fillStyle = '#ffd400';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const a = fr * 0.15 + i * 2.1,
      sx = x + Math.cos(a) * 16,
      sy = y + Math.sin(a) * 5;
    ctx.beginPath();
    for (let j = 0; j < 10; j++) {
      const r = j % 2 ? 2.5 : 6,
        b = (j * Math.PI) / 5;
      ctx.lineTo(sx + Math.cos(b) * r, sy + Math.sin(b) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}
// ===== RENDER =====
function drawFig(x, y, face, p, s, col, col2, spin, alpha, lw, out) {
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
    head = Q(neck[0], neck[1], 180 - ln * 1.3, hr + 2);
  const kF = Q(x, hy, lH, th),
    fF = Q(kF[0], kF[1], lH - lK, sh),
    kB = Q(x, hy, rH, th),
    fB = Q(kB[0], kB[1], rH - rK, sh);
  const eA = Q(sho[0], sho[1], aS, ua),
    hA = Q(eA[0], eA[1], aS + aE, fa),
    eB = Q(sho[0], sho[1], bS, ua),
    hB = Q(eB[0], eB[1], bS + bE, fa);
  const cy = y - 30 * s;
  if (out) {
    const r = spin * face * D,
      c = Math.cos(r),
      sn = Math.sin(r),
      R = q => [x + (q[0] - x) * c - (q[1] - cy) * sn, cy + (q[0] - x) * sn + (q[1] - cy) * c];
    out.h = R(hA);
    out.hb = R(hB);
    out.f = R(fF);
    out.fb = R(fB);
    out.hd = R(head);
    out.sh = R(sho);
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, cy);
  ctx.rotate(spin * face * D);
  ctx.translate(-x, -cy);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = lw * Math.pow(s, 0.7);
  const L = (c, pts) => {
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  };
  L(col2, [sho, eB, hB]);
  L(col2, [[x, hy], kB, fB]);
  L(col, [[x, hy], neck]);
  L(col, [[x, hy], kF, fF]);
  L(col, [sho, eA, hA]);
  ctx.beginPath();
  ctx.arc(head[0], head[1], hr, 0, 7);
  ctx.stroke();
  ctx.restore();
}
function drawF(f) {
  let a = 1;
  if (f.pl && f.inv > 0 && f.inv < 900 && f.st !== 'dead' && Math.floor(f.t / 3) % 2) a = 0.45;
  if (f.pl && f.phase > 0) a = Math.min(a, 0.55);
  const lying = f.st === 'down' || (f.st === 'dead' && f.y >= G),
    fl = f.flash > 0;
  if (f.trail && f.trail.length > 1) {
    const t = f.trail;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = f.col;
    for (let i = 1; i < t.length; i++) {
      ctx.globalAlpha = 0.1 + (0.4 * i) / t.length;
      ctx.lineWidth = 4 + i * 2.4;
      ctx.beginPath();
      ctx.moveTo(t[i - 1][0], t[i - 1][1]);
      ctx.lineTo(t[i][0], t[i][1]);
      ctx.stroke();
    }
    ctx.restore();
  }
  const vib = f.hs > 0 && stop > 0 ? (Math.random() - 0.5) * 5 : 0;
  const R = f.rag,
    rOn = R && RS(f),
    rA = R ? (rOn ? R.blend : R.fade / 8) : 0;
  if (R && R.dis) a *= Math.max(0, 1 - R.dis / 32);
  if (R && rA > 0) drawRag(f, a * rA);
  if (f.att && f.att.d.tatsu) {
    drawTatsu(f, a, fl);
    return;
  }
  const o = {};
  if (!(rOn && R.blend >= 1))
    drawFig(
      f.x + vib,
      f.y + (lying ? 26 * f.s : 0),
      f.face,
      f.pose,
      f.s,
      fl ? INK : f.col,
      fl ? INK : f.d2,
      f.pose[9],
      a * (1 - rA),
      7,
      o
    );
  if (!f.dying && (f.st === 'down' || f.st === 'getup') && !(f.pl && f.st === 'dead'))
    stars(R ? R.p[0].x : f.x, (R ? R.p[0].y : f.y - 50 * f.s) - 16); // dazed
  const at = f.att;
  if (
    at &&
    (at.d.smear || at.d.dmg >= 9) &&
    at.f >= at.d.h[0] - 3 &&
    at.f <= at.d.h[1] + 2 &&
    f.tf !== fr &&
    o[at.d.limb || 'h']
  ) {
    f.tf = fr;
    (f.trail = f.trail || []).push([...o[at.d.limb || 'h'], fr]);
    if (f.trail.length > 8) f.trail.shift();
  }
  if (f.trail) f.trail = f.trail.filter(q => fr - q[2] < 8);
  if (!f.pl) {
    if (f.hp < f.max && !f.dying) {
      const w = 34 * f.s;
      ctx.fillStyle = INK;
      ctx.fillRect(f.x - w / 2 - 2, f.y - 98 * f.s - 2, w + 4, 7);
      ctx.fillStyle = '#ff4fa3';
      ctx.fillRect(f.x - w / 2, f.y - 98 * f.s, w * Math.max(0, f.hp / f.max), 3);
    }
    if (f.pmax && !f.dying) {
      const w = 34 * f.s,
        y = f.y - 98 * f.s + 6;
      ctx.fillStyle = INK;
      ctx.fillRect(f.x - w / 2 - 2, y, w + 4, 5);
      ctx.fillStyle = f.broken ? '#e8212b' : '#3ec5ff';
      ctx.fillRect(f.x - w / 2, y + 1, w * (f.broken ? f.broken / 150 : f.poise / f.pmax), 3);
    }
    if (f.broken > 0 && !f.dying && !RS(f) && f.st !== 'getup') stars(f.x, f.y - 88 * f.s);
    if (!(rOn && R.blend >= 1) && o.hd) drawGear(f, o, a);
    if (f.T.guard && !f.dying) {
      const w = 34 * f.s,
        y = f.y - 98 * f.s + (f.pmax ? 12 : 6);
      ctx.fillStyle = INK;
      ctx.fillRect(f.x - w / 2 - 2, y, w + 4, 5);
      ctx.fillStyle = f.noShield > 0 ? '#e8212b' : '#9aa3b5';
      ctx.fillRect(f.x - w / 2, y + 1, w * (f.noShield > 0 ? f.noShield / 240 : f.gm / f.T.guard), 3);
    }
    if (
      f.st === 'atk' &&
      f.att &&
      f.att.d.boss &&
      f.att.f < f.att.d.h[0] + (f.att.d.dive ? f.att.d.diveAt : 0)
    ) {
      ctx.save();
      ctx.globalAlpha = 0.35 + 0.25 * Math.sin(fr * 0.6);
      ctx.strokeStyle = '#e8212b';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(f.x, f.y - 50 * f.s, 40 * f.s, 62 * f.s, 0, 0, 7);
      ctx.stroke();
      if (f.att.d.area) {
        ctx.globalAlpha = 0.25 + 0.2 * Math.sin(fr * 0.5);
        ctx.fillStyle = '#e8212b';
        const tx = f.att.tx ?? f.x;
        ctx.beginPath();
        ctx.ellipse(tx, G + 3, f.att.d.area, 8, 0, 0, 7);
        ctx.fill();
      }
      ctx.restore();
    }
    if (f.st === 'atk' && f.att && f.att.f < f.att.d.h[0]) {
      ctx.font = '900 24px Impact,"Arial Black",sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e8212b';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      const y = f.y - 102 * f.s - (f.att.f % 6);
      ctx.strokeText('!', f.x, y);
      ctx.fillText('!', f.x, y);
    }
  }
}
function bg() {
  if (MODE.bg && state !== 'train') return MODE.bg();
  ctx.fillStyle = '#fbfaf4';
  ctx.fillRect(-30, -30, W + 60, H + 60);
  ctx.drawImage(gridC, 0, 0, W, H);
  const ox = -(P.x - W / 2) * 0.05;
  ctx.fillStyle = `hsl(${(wave * 47 + 20) % 360} 85% 82%)`;
  ctx.beginPath();
  ctx.arc(720 + ox, 95, 44, 0, 7);
  ctx.fill();
  ctx.strokeStyle = '#cfc9d6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-30, G);
  for (let i = 0; i <= 13; i++) ctx.lineTo(-30 + i * 80 + ox * 2, G - 30 - ((i * 37) % 5) * 18);
  ctx.lineTo(W + 30, G);
  ctx.stroke();
  ctx.strokeStyle = '#d7dbe6';
  for (let i = 0; i < 3; i++) {
    const x = ((fr * 0.12 + i * 330) % (W + 200)) - 100;
    ctx.beginPath();
    ctx.ellipse(x, 70 + i * 34, 50, 13, 0, 0, 7);
    ctx.stroke();
  }
  ctx.fillStyle = '#f0ece2';
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.strokeStyle = '#d9d3c6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = -10; x < W + 20; x += 24) {
    ctx.moveTo(x, G + 16);
    ctx.lineTo(x - 10, G + 30);
  }
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-30, G + 6);
  ctx.lineTo(W + 30, G + 6);
  ctx.stroke();
}
function drawFX(x) {
  const p = x.l / x.m;
  if (x.k === 's') {
    ctx.fillStyle = x.c;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = x.a + (i * Math.PI) / 8,
        r = (i % 2 ? x.r * 0.4 : x.r) * (0.5 + 0.5 * p);
      ctx.lineTo(x.x + Math.cos(a) * r, x.y + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (x.k === 'r') {
    ctx.globalAlpha = p;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x.x, x.y, 8 + x.r * (1 - p), 0, 7);
    ctx.stroke();
    ctx.globalAlpha = 1;
  } else if (x.k === 'sh') {
    ctx.save();
    ctx.globalAlpha = Math.min(1, p * 2);
    ctx.translate(x.x, x.y);
    ctx.rotate(x.a);
    ctx.fillStyle = '#9aa3b5';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.fillRect(-6 * x.s, -20 * x.s, 12 * x.s, 40 * x.s);
    ctx.strokeRect(-6 * x.s, -20 * x.s, 12 * x.s, 40 * x.s);
    ctx.restore();
  } else if (x.k === 'c') {
    ctx.save();
    ctx.globalAlpha = Math.min(1, p * 1.6);
    ctx.translate(x.x, x.y);
    ctx.rotate(x.a);
    ctx.fillStyle = x.c;
    ctx.fillRect(-3, -2, 6, 4);
    ctx.restore();
  } else if (x.k === 'b') {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.globalAlpha = p;
    for (let i = 0; i < 12; i++) {
      const a = x.a + (i * Math.PI) / 6,
        r1 = 24 + (1 - p) * 30,
        r2 = r1 + 18 * p + 6;
      ctx.beginPath();
      ctx.moveTo(x.x + Math.cos(a) * r1, x.y + Math.sin(a) * r1);
      ctx.lineTo(x.x + Math.cos(a) * r2, x.y + Math.sin(a) * r2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (x.k === 'l') {
    ctx.globalAlpha = p * 0.8;
    ctx.strokeStyle = '#e6b800';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x.x, x.y);
    ctx.lineTo(x.x - x.dir * x.len, x.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  } else if (x.k === 'd') {
    ctx.globalAlpha = p * 0.6;
    ctx.fillStyle = x.c || '#b9b2a8';
    ctx.beginPath();
    ctx.arc(x.x, x.y, x.r * (1.5 - p), 0, 7);
    ctx.fill();
    ctx.globalAlpha = 1;
  } else {
    ctx.globalAlpha = Math.min(1, p * 2);
    ctx.font = `900 ${x.sz}px Impact,"Arial Black",sans-serif`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.strokeText(x.t, x.x, x.y - (1 - p) * 30);
    ctx.fillStyle = x.c;
    ctx.fillText(x.t, x.x, x.y - (1 - p) * 30);
    ctx.globalAlpha = 1;
  }
}
function hud() {
  ctx.save();
  ctx.textAlign = 'left';
  hpT += (P.hp - hpT) * 0.1;
  ctx.fillStyle = INK;
  ctx.fillRect(14, 12, 264, 24);
  ctx.fillStyle = '#ff4fa3';
  ctx.fillRect(18, 16, (256 * Math.max(0, hpT)) / P.max, 16);
  ctx.fillStyle = '#ff7a00';
  ctx.fillRect(18, 16, (256 * Math.max(0, P.hp)) / P.max, 16);
  // Surge bar (yellow): flashes when low, red when you can't afford a move, refills from red while Winded
  const sv = STM.v / SURGE.max,
    bl = (fr >> 2) % 2,
    held = K.s && live();
  ctx.fillStyle = INK;
  ctx.fillRect(14, 40, 224, 16);
  ctx.fillStyle = STM.winded
    ? '#b8202c'
    : STM.flash > 0 && bl
      ? '#e8212b'
      : sv < 0.25 && bl
        ? '#fff3a0'
        : '#ffd400';
  ctx.fillRect(17, 43, STM.winded ? 218 * (1 - STM.winded / (SURGE.winded * 60)) : 218 * sv, 10);
  if (held && !STM.winded) {
    ctx.strokeStyle = '#ffd400';
    ctx.lineWidth = 2;
    ctx.strokeRect(11, 37, 230, 22);
  }
  ctx.font = '900 15px Impact,"Arial Black",sans-serif';
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  const sl = STM.winded ? 'WINDED' : 'SURGE';
  ctx.fillStyle = STM.winded ? '#e8212b' : held ? '#ffd400' : '#fff8ee';
  ctx.strokeText(sl, 248, 54);
  ctx.fillText(sl, 248, 54);
  // Ultimate meter (blue)
  ctx.fillStyle = INK;
  ctx.fillRect(14, 60, 184, 12);
  ctx.fillStyle = meter >= 100 && (fr >> 3) % 2 ? '#fff' : '#3ec5ff';
  ctx.fillRect(17, 63, (178 * meter) / 100, 6);
  if (meter >= 100) {
    ctx.font = '900 14px Impact,"Arial Black",sans-serif';
    ctx.fillStyle = '#3ec5ff';
    ctx.strokeText('U: TORNADO!', 206, 73);
    ctx.fillText('U: TORNADO!', 206, 73);
  }
  {
    const B = E.find(e => e.T.boss && !e.dying && !e.gone);
    if (B) {
      const bw = 360,
        bx = W / 2 - bw / 2,
        by = 108;
      ctx.fillStyle = INK;
      ctx.fillRect(bx - 3, by - 3, bw + 6, 20);
      ctx.fillStyle = '#ff4fa3';
      ctx.fillRect(bx, by, (bw * Math.max(0, B.hp)) / B.max, 14);
      ctx.fillStyle = INK;
      ctx.fillRect(bx - 3, by + 18, bw + 6, 8);
      ctx.fillStyle = B.broken ? '#e8212b' : '#3ec5ff';
      ctx.fillRect(bx, by + 20, bw * (B.broken ? B.broken / 150 : B.poise / B.pmax), 4);
      ctx.font = '900 15px Impact,"Arial Black",sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = INK;
      ctx.fillStyle = '#fff';
      const nm = B.T.boss + (B.bp > 1 ? '  (ENRAGED)' : '');
      ctx.strokeText(nm, W / 2, by + 12);
      ctx.fillText(nm, W / 2, by + 12);
      ctx.textAlign = 'left';
    }
  }
  if (PL[1]) {
    const q = PL[1];
    ctx.fillStyle = INK;
    ctx.fillRect(W - 200, 104, 186, 14);
    ctx.fillStyle = q.col;
    ctx.fillRect(W - 197, 107, (180 * Math.max(0, q.hp)) / q.max, 8);
    ctx.fillStyle = INK;
    ctx.fillRect(W - 200, 120, 186, 9);
    ctx.fillStyle = '#ffd400';
    ctx.fillRect(W - 197, 122, (180 * q.stm.v) / SURGE.max, 5);
    ctx.font = '900 13px Impact,"Arial Black",sans-serif';
    ctx.fillStyle = INK;
    ctx.textAlign = 'right';
    ctx.fillText('P2', W - 206, 116);
    ctx.textAlign = 'left';
  }
  ctx.textAlign = 'right';
  ctx.font = '900 26px Impact,"Arial Black",sans-serif';
  ctx.fillStyle = INK;
  if (state !== 'train') ctx.fillText(String(score).padStart(7, '0'), W - 16, 34);
  ctx.textAlign = 'center';
  ctx.font = '900 18px Impact,"Arial Black",sans-serif';
  if (MODE.hud && state !== 'train') MODE.hud();
  else
    ctx.fillText(
      state === 'train'
        ? 'TRAINING ROOM'
        : 'WAVE ' + wave + '  ·  ' + (queue.length + E.filter(e => !e.dying).length) + ' LEFT',
      W / 2,
      30
    );
  if (combo > 1) {
    const sz = 30 + Math.min(combo, 30) * 0.8 + (comboT > 95 ? 6 : 0);
    ctx.textAlign = 'right';
    ctx.font = `italic 900 ${sz}px Impact,"Arial Black",sans-serif`;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.strokeText(combo + ' HITS', W - 16, 88);
    ctx.fillStyle = '#ff7a00';
    ctx.fillText(combo + ' HITS', W - 16, 88);
    ctx.fillStyle = INK;
    ctx.fillRect(W - 16 - 100, 96, 100, 5);
    ctx.fillStyle = '#ff4fa3';
    ctx.fillRect(W - 16 - (100 * comboT) / 100, 96, (100 * comboT) / 100, 5);
  }
  if (banner && banner.t > 0) {
    banner.t--;
    const p = 1 - banner.t / banner.m,
      sc = 1 + (1 - Math.min(1, p * 5)) * 1.2;
    ctx.globalAlpha = Math.min(1, banner.t / 15);
    ctx.textAlign = 'center';
    ctx.font = `900 ${52 * sc}px Impact,"Arial Black",sans-serif`;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    ctx.lineJoin = 'round';
    ctx.strokeText(banner.txt, W / 2, 190);
    ctx.fillStyle = '#ff7a00';
    ctx.fillText(banner.txt, W / 2, 190);
  }
  ctx.restore();
}
function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  // Screen shake slider (and Reduce screen shake) scale ALL camera motion: random rattle, directional kick and zoom punch. 0 = perfectly still.
  const cm = FEEL.shake * (SET.calm ? 0.35 : 1),
    sk = shake * 1.6 * cm;
  ctx.translate(
    W / 2 + (Math.random() - 0.5) * sk + camX * cm,
    H / 2 + (Math.random() - 0.5) * sk + camY * cm
  );
  ctx.scale(1 + zoom * cm, 1 + zoom * cm);
  ctx.translate(-W / 2, -H / 2);
  bg();
  ctx.translate(-CAM.x, 0);
  for (const f of [...PL, ...E]) {
    const s = f.s * 16 * Math.max(0.4, 1 - (G - f.y) / 400);
    ctx.fillStyle = 'rgba(0,0,0,.14)';
    ctx.beginPath();
    ctx.ellipse(f.x, G + 6, s, 4, 0, 0, 7);
    ctx.fill();
  }
  for (const g of GH) {
    drawFig(g.x, g.y, g.face, g.pose, g.s, g.col, g.col, g.pose[9], (g.l / 9) * 0.35, 7);
  }
  for (const e of E) drawF(e);
  for (const p of PL) {
    use(p);
    if (K.s && live() && P.st !== 'dead' && !STM.winded) {
      const pul = 0.45 + 0.2 * Math.sin(fr * 0.4);
      drawFig(P.x, P.y, P.face, P.pose, P.s, '#ffd400', '#ffd400', P.pose[9], pul, 17);
      if (fr % 4 === 0)
        fxp({
          k: 'd',
          x: P.x + (Math.random() - 0.5) * 30,
          y: P.y - Math.random() * 70,
          vx: 0,
          vy: -1.4,
          r: 2 + Math.random() * 2,
          l: 16,
          m: 16,
          c: '#ffd400'
        });
    }
    drawF(P);
  }
  use(PL[0]);
  for (const x of FX) drawFX(x);
  if (state === 'train' && TR.boxes) drawBoxes();
  ctx.translate(CAM.x, 0);
  if (MODE.fg) MODE.fg();
  ctx.restore();
  if (state !== 'menu') hud();
  debugUI();
  shake *= 0.85;
  if (shake < 0.3) shake = 0;
  zoom *= 0.88;
  camX *= 0.78;
  camY *= 0.78;
  if (Math.abs(camX) < 0.2) camX = 0;
  if (Math.abs(camY) < 0.2) camY = 0;
}
