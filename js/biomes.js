// StickFighters: Scenery for campaign runs: the sewer and castle looks (the woods are in scenery.js), their props,
// the transition props (catapult, pipes, rope and chasm, castle gate), and mixing two biomes' backgrounds where one
// runs into the next. Drawing only: it never changes the game, and uses Math.random() only for cosmetic effects.
// ===== BACKGROUNDS =====
const LOOKS = {
  woods: { bg: () => drawWoods(1), fg: () => drawWoodsFg() },
  sewer: { bg: () => drawSewer(), fg: () => drawSewerFg() },
  castle: { bg: () => drawCastle(), fg: () => drawCastleFg() }
};
const lookOfSeg = s => LOOKS[BIOMES[s.b].look];
// The paper and its grid, scrolling with the camera
function paperBg() {
  ctx.fillStyle = '#fbfaf4';
  ctx.fillRect(-30, -30, W + 60, H + 60);
  const gx = -(CAM.x % 30);
  ctx.drawImage(gridC, gx, 0, W, H);
  ctx.drawImage(gridC, gx + W, 0, W, H);
}
// Which biome(s) the camera sees: where two biomes meet without a scene between them (a smashed gate, the rope's
// chasm), the next one fades in over 600 px. f = how much of b shows.
function segMix() {
  const c = CAM.x + W / 2,
    S = LV.segs;
  let i = S.findIndex(s => c < s.x1);
  if (i < 0) i = S.length - 1;
  const a = S[i],
    nx = S[i + 1],
    pv = S[i - 1],
    span = (A, B) => [A.x1 - 300, B.x0 + 300];
  if (nx && nx.x0 - a.x1 < 500 && c > a.x1 - 300) {
    const [l, r] = span(a, nx);
    return { a, b: nx, f: (c - l) / (r - l) };
  }
  if (pv && a.x0 - pv.x1 < 500 && c < a.x0 + 300) {
    const [l, r] = span(pv, a);
    return { a: pv, b: a, f: (c - l) / (r - l) };
  }
  return { a, b: null, f: 0 };
}
let mixCv = null;
// Draws look b over what's there at strength f, through an offscreen canvas (looks set their own alpha)
function drawOver(fn, f) {
  if (!mixCv || mixCv.width !== cv.width || mixCv.height !== cv.height) {
    mixCv = document.createElement('canvas');
    mixCv.width = cv.width;
    mixCv.height = cv.height;
  }
  const c2 = mixCv.getContext('2d');
  c2.setTransform(1, 0, 0, 1, 0, 0);
  c2.clearRect(0, 0, mixCv.width, mixCv.height);
  c2.setTransform(ctx.getTransform());
  withCtx(c2, fn);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = Math.max(0, Math.min(1, f));
  ctx.drawImage(mixCv, 0, 0);
  ctx.restore();
}
// The level's background: a campaign run draws its biome's look (mixing two where they meet), then every prop
// and gate in view; a fixed level (the Wooded Trail) is all woods.
function drawLevelBg() {
  if (!LV.segs) return drawWoods();
  const m = segMix();
  lookOfSeg(m.a).bg();
  if (m.b && m.f > 0) drawOver(lookOfSeg(m.b).bg, m.f);
  const cx = CAM.x,
    dk = chunkVal(cx + W / 2, 'dusk');
  ctx.save();
  ctx.translate(-cx, 0);
  for (const c of LV.ch)
    if (c.x0 < cx + W + 400 && c.x0 + c.w > cx - 400)
      for (const p of c.props) {
        const x = c.x0 + p.x;
        if (x > cx - 360 && x < cx + W + 360) drawProp(p, x, dk);
      }
  for (const g of LV.gates) drawGate(g);
  ctx.restore();
}
function drawLevelFg() {
  if (!LV.segs) return drawWoodsFg();
  const m = segMix();
  lookOfSeg(m.f > 0.5 && m.b ? m.b : m.a).fg();
}
// ===== SEWER: brick arches, pipes along the wall, a stone walkway and a water channel in front =====
function drawSewer() {
  const cx = CAM.x;
  paperBg();
  const wash = ctx.createLinearGradient(0, 0, 0, G);
  wash.addColorStop(0, '#7f927f');
  wash.addColorStop(1, '#c7d3c2');
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = wash;
  ctx.fillRect(-30, -30, W + 60, G + 36);
  ctx.globalAlpha = 1;
  // far tunnel arches (1/6 speed)
  ctx.strokeStyle = '#a9b8a6';
  ctx.lineWidth = 3;
  ctx.fillStyle = 'rgba(70,90,72,0.18)';
  layer(0.16, 260, 13, x => {
    ctx.beginPath();
    ctx.moveTo(x - 90, G);
    ctx.lineTo(x - 90, G - 150);
    ctx.arc(x, G - 150, 90, Math.PI, 0);
    ctx.lineTo(x + 90, G);
    ctx.fill();
    ctx.stroke();
  });
  // brick courses on the tunnel wall (1/2 speed)
  ctx.strokeStyle = 'rgba(110,128,108,0.35)';
  ctx.lineWidth = 2;
  const off = (cx * 0.5) % 60;
  ctx.beginPath();
  for (let r = 0; r < 9; r++) {
    const y = G - 20 - r * 26;
    ctx.moveTo(-30, y);
    ctx.lineTo(W + 30, y);
    for (let x = -off + (r % 2) * 30 - 60; x < W + 60; x += 60) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 26);
    }
  }
  ctx.stroke();
  // a big pipe along the wall (0.6 speed), with joints
  const py = G - 150;
  ctx.fillStyle = '#b9c9bd';
  ctx.strokeStyle = '#5d6e60';
  ctx.lineWidth = 3;
  ctx.fillRect(-30, py - 14, W + 60, 28);
  ctx.beginPath();
  ctx.moveTo(-30, py - 14);
  ctx.lineTo(W + 30, py - 14);
  ctx.moveTo(-30, py + 14);
  ctx.lineTo(W + 30, py + 14);
  ctx.stroke();
  layer(0.6, 180, 31, x => {
    ctx.fillStyle = '#a3b5a7';
    ctx.fillRect(x - 8, py - 19, 16, 38);
    ctx.strokeRect(x - 8, py - 19, 16, 38);
  });
  // walkway
  ctx.fillStyle = '#dfe3d6';
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.strokeStyle = '#c3c9b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = -(cx % 48) - 48; x < W + 50; x += 48) {
    ctx.moveTo(x, G + 6);
    ctx.lineTo(x, G + 30);
  }
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-30, G + 6);
  ctx.lineTo(W + 30, G + 6);
  ctx.stroke();
}
// The water channel in front, with ripples, and drips falling from the ceiling
function drawSewerFg() {
  const cx = CAM.x,
    wy = H - 22;
  ctx.fillStyle = 'rgba(120,160,140,0.55)';
  ctx.fillRect(-30, wy, W + 60, 40);
  ctx.strokeStyle = 'rgba(70,110,95,0.7)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i < 9; i++) {
    const x = ((((i * 137 - cx * 1.2 + fr * 0.6) % (W + 120)) + W + 120) % (W + 120)) - 60;
    ctx.moveTo(x, wy + 10);
    ctx.quadraticCurveTo(x + 14, wy + 5, x + 28, wy + 10);
  }
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-30, wy);
  ctx.lineTo(W + 30, wy);
  ctx.stroke();
  if (!live()) return;
  if (AMB.filter(a => a.k === 'drip').length < 6 && Math.random() < 0.06)
    AMB.push({ k: 'drip', x: Math.random() * W, y: 0, vy: 2 + Math.random() * 2 });
  for (let i = AMB.length - 1; i >= 0; i--) {
    const a = AMB[i];
    if (a.k !== 'drip') continue;
    a.y += a.vy;
    a.vy += 0.15;
    ctx.fillStyle = 'rgba(120,170,150,0.85)';
    ctx.beginPath();
    ctx.ellipse(a.x, a.y, 2.5, 5, 0, 0, 7);
    ctx.fill();
    if (a.y > G + 4) AMB.splice(i, 1);
  }
}
// ===== CASTLE: far towers with flags, the castle wall with arrow slits, stone tiles =====
function drawCastle() {
  const cx = CAM.x;
  paperBg();
  const sky = ctx.createLinearGradient(0, 0, 0, G);
  sky.addColorStop(0, '#c9d6ea');
  sky.addColorStop(1, '#f3ecdc');
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = sky;
  ctx.fillRect(-30, -30, W + 60, G + 36);
  ctx.globalAlpha = 1;
  // far towers (1/8 speed)
  ctx.lineWidth = 3;
  layer(0.12, 230, 17, (x, r) => {
    const h = 150 + r * 110,
      w = 50 + r * 20;
    ctx.fillStyle = '#e6e2ea';
    ctx.strokeStyle = '#bdb5c6';
    ctx.beginPath();
    ctx.rect(x - w / 2, G - h, w, h);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.rect(x - w / 2 + i * (w / 2.5), G - h - 12, w / 5, 12);
      ctx.fill();
      ctx.stroke();
    }
    ctx.strokeStyle = '#9f95ad';
    ctx.beginPath();
    ctx.moveTo(x, G - h - 12);
    ctx.lineTo(x, G - h - 44);
    ctx.stroke();
    ctx.fillStyle = '#ff6fb5';
    ctx.beginPath();
    ctx.moveTo(x, G - h - 44);
    ctx.lineTo(x + 22 + Math.sin(fr * 0.08 + r * 6) * 3, G - h - 37);
    ctx.lineTo(x, G - h - 30);
    ctx.fill();
  });
  // the castle wall (0.45 speed): crenellations, stones and arrow slits
  const wt = G - 175;
  ctx.fillStyle = '#ece6dc';
  ctx.strokeStyle = '#a99f92';
  ctx.fillRect(-30, wt, W + 60, G - wt + 6);
  const off = (cx * 0.45) % 54;
  ctx.lineWidth = 3;
  for (let x = -off - 54; x < W + 60; x += 54) {
    ctx.fillRect(x, wt - 20, 30, 20);
    ctx.strokeRect(x, wt - 20, 30, 20);
  }
  ctx.beginPath();
  ctx.moveTo(-30, wt);
  ctx.lineTo(W + 30, wt);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(150,140,128,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let r = 0; r < 6; r++) {
    const y = wt + 26 + r * 26;
    ctx.moveTo(-30, y);
    ctx.lineTo(W + 30, y);
    for (let x = -((cx * 0.45) % 64) + (r % 2) * 32 - 64; x < W + 64; x += 64) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 26);
    }
  }
  ctx.stroke();
  layer(0.45, 200, 29, x => {
    ctx.fillStyle = '#5b5368';
    ctx.fillRect(x - 5, wt + 40, 10, 40);
  });
  // stone tiles
  ctx.fillStyle = '#e4ddd2';
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.strokeStyle = '#cfc5b6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = -(cx % 60) - 60; x < W + 60; x += 60) {
    ctx.moveTo(x, G + 6);
    ctx.lineTo(x - 18, H);
  }
  ctx.moveTo(-30, G + 34);
  ctx.lineTo(W + 30, G + 34);
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-30, G + 6);
  ctx.lineTo(W + 30, G + 6);
  ctx.stroke();
}
// Dust motes drifting in the light
function drawCastleFg() {
  if (!live()) return;
  if (AMB.filter(a => a.k === 'mote').length < 14 && Math.random() < 0.08)
    AMB.push({ k: 'mote', x: Math.random() * W, y: G - Math.random() * 260, ph: Math.random() * 6, l: 300 });
  for (let i = AMB.length - 1; i >= 0; i--) {
    const a = AMB[i];
    if (a.k !== 'mote') continue;
    a.ph += 0.03;
    a.x += Math.sin(a.ph) * 0.3 + 0.15;
    a.y -= 0.12;
    ctx.fillStyle = 'rgba(255,240,200,' + (0.5 + 0.4 * Math.sin(a.ph * 2)).toFixed(2) + ')';
    ctx.beginPath();
    ctx.arc(a.x, a.y, 2, 0, 7);
    ctx.fill();
    if (--a.l <= 0) AMB.splice(i, 1);
  }
}
// ===== PROPS =====
function inkRect(x, y, w, h, fill, lw) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw || 3;
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.stroke();
}
function drawBiomeProp(p, x) {
  const s = p.s || 1,
    gy = G + 6,
    k = p.k;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (k === 'pipe') {
    // a pipe coming down the wall and bending into the floor
    inkRect(x - 14 * s, gy - 230, 28 * s, 230, '#b7c8ba');
    inkRect(x - 19 * s, gy - 150, 38 * s, 14, '#a1b4a5');
    inkRect(x - 19 * s, gy - 60, 38 * s, 14, '#a1b4a5');
  } else if (k === 'grate') {
    inkRect(x - 34, gy - 120, 68, 74, '#5f6d62');
    ctx.strokeStyle = '#2f3a33';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 1; i < 5; i++) {
      ctx.moveTo(x - 34 + i * 13.6, gy - 120);
      ctx.lineTo(x - 34 + i * 13.6, gy - 46);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(120,170,150,0.7)';
    ctx.fillRect(x - 10, gy - 46, 20, 46);
  } else if (k === 'valve') {
    // a pipe with a wheel valve on it
    inkRect(x - 8, gy - 140, 16, 140, '#b7c8ba');
    ctx.strokeStyle = '#4e5d52';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(x, gy - 90, 6, 20 * s, 0, 0, 7);
    ctx.stroke();
    ctx.fillStyle = '#4e5d52';
    ctx.fillRect(x - 3, gy - 96, 6, 12);
  } else if (k === 'barrel') {
    ctx.fillStyle = '#c9a27a';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, gy - 34 * s, 24 * s, 34 * s, 0, 0, 7);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 23 * s, gy - 48 * s);
    ctx.lineTo(x + 23 * s, gy - 48 * s);
    ctx.moveTo(x - 23 * s, gy - 20 * s);
    ctx.lineTo(x + 23 * s, gy - 20 * s);
    ctx.stroke();
  } else if (k === 'moss') {
    blob(
      [
        [x - 16, gy - 6, 14 * s],
        [x + 6, gy - 10, 16 * s],
        [x + 24, gy - 5, 11 * s]
      ],
      '#a9c79b',
      '#5f7f55',
      2.5
    );
  } else if (k === 'ladder') {
    ctx.strokeStyle = '#7a6a58';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 16, gy);
    ctx.lineTo(x - 16, gy - 260);
    ctx.moveTo(x + 16, gy);
    ctx.lineTo(x + 16, gy - 260);
    for (let y = gy - 20; y > gy - 260; y -= 26) {
      ctx.moveTo(x - 16, y);
      ctx.lineTo(x + 16, y);
    }
    ctx.stroke();
  } else if (k === 'banner') {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 30, gy - 250);
    ctx.lineTo(x + 30, gy - 250);
    ctx.stroke();
    ctx.fillStyle = '#e2468f';
    ctx.beginPath();
    ctx.moveTo(x - 24, gy - 250);
    ctx.lineTo(x + 24, gy - 250);
    ctx.lineTo(x + 24, gy - 150 * s);
    ctx.lineTo(x, gy - 168 * s);
    ctx.lineTo(x - 24, gy - 150 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffd6ea';
    ctx.beginPath();
    ctx.arc(x, gy - 214, 10, 0, 7);
    ctx.fill();
  } else if (k === 'torch') {
    inkRect(x - 5, gy - 170, 10, 40, '#7a6a58');
    const fl = Math.sin(fr * 0.3 + x) * 3;
    ctx.fillStyle = '#ffb347';
    ctx.beginPath();
    ctx.moveTo(x - 10, gy - 170);
    ctx.quadraticCurveTo(x - 12, gy - 190, x + fl, gy - 206);
    ctx.quadraticCurveTo(x + 12, gy - 190, x + 10, gy - 170);
    ctx.fill();
    ctx.fillStyle = '#ffe28a';
    ctx.beginPath();
    ctx.ellipse(x, gy - 180, 4, 9, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,200,90,0.16)';
    ctx.beginPath();
    ctx.arc(x, gy - 185, 46, 0, 7);
    ctx.fill();
  } else if (k === 'pillar') {
    inkRect(x - 22, gy - 280, 44, 280, '#efe9df');
    inkRect(x - 30, gy - 290, 60, 16, '#e2dacd');
    inkRect(x - 30, gy - 16, 60, 16, '#e2dacd');
  } else if (k === 'window') {
    ctx.fillStyle = '#cfe0f2';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 22, gy - 150);
    ctx.lineTo(x - 22, gy - 210);
    ctx.arc(x, gy - 210, 22, Math.PI, 0);
    ctx.lineTo(x + 22, gy - 150);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, gy - 150);
    ctx.lineTo(x, gy - 230);
    ctx.moveTo(x - 22, gy - 190);
    ctx.lineTo(x + 22, gy - 190);
    ctx.stroke();
  } else if (k === 'armor') {
    // a suit of armour on a stand: a stick figure in grey plates
    drawFig(x, gy - 6, -1, IDLE, 1, '#8d8a96', '#8d8a96', 0, 0.9, 9);
    inkRect(x - 12, gy - 6, 24, 6, '#7a6a58');
  } else if (k === 'shield') {
    ctx.fillStyle = '#ff7a00';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 22, gy - 200);
    ctx.lineTo(x + 22, gy - 200);
    ctx.lineTo(x + 22, gy - 170);
    ctx.quadraticCurveTo(x, gy - 140, x, gy - 140);
    ctx.quadraticCurveTo(x, gy - 140, x - 22, gy - 170);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (k === 'trans-catapult') drawCatapult(x);
  else if (k === 'trans-pipe' || k === 'trans-pipeout') drawBigPipe(x, k === 'trans-pipeout');
  else if (k === 'trans-rope') drawChasm(x);
  else if (k === 'trans-gate') {
    /* the gate itself is drawn by drawGate */
  }
}
// The catapult: its arm swings when the scene fires (run.js, LV.cine)
function drawCatapult(x) {
  const gy = G + 6,
    c = LV.cine && LV.cine.k === 'catapult' ? LV.cine.t : 0,
    a = c < 45 ? -0.35 : c < 62 ? -0.35 - ((c - 45) / 17) * 0.25 : Math.min(1.1, -0.6 + (c - 62) * 0.25);
  inkRect(x - 80, gy - 30, 140, 20, '#c9a27a');
  ctx.fillStyle = '#e8cfa9';
  for (const wx of [x - 60, x + 40]) {
    ctx.beginPath();
    ctx.arc(wx, gy - 10, 16, 0, 7);
    ctx.fill();
    ctx.stroke();
  }
  inkRect(x - 6, gy - 90, 12, 64, '#a4794f');
  ctx.save();
  ctx.translate(x, gy - 84);
  ctx.rotate(-a);
  inkRect(-110, -6, 130, 12, '#a4794f');
  ctx.fillStyle = '#c9a27a';
  ctx.beginPath();
  ctx.arc(-108, -14, 22, 0, Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
// A big pipe sticking out of the floor; out = the one you pop out of in the next biome
function drawBigPipe(x, out) {
  const gy = G + 6;
  inkRect(x - 40, gy - 100, 80, 100, '#9fb4a3', 4);
  inkRect(x - 52, gy - 120, 104, 26, '#b7c8ba', 4);
  ctx.fillStyle = '#2f3a33';
  ctx.beginPath();
  ctx.ellipse(x, gy - 120, 44, 8, 0, 0, 7);
  ctx.fill();
  if (!out) {
    ctx.fillStyle = INK;
    ctx.font = '900 16px Impact,"Arial Black",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('↓ IN', x, gy - 132);
  }
}
// The chasm the rope swings over, with the rope hanging from a beam above it
function drawChasm(x) {
  const gy = G + 6,
    gap = TRANSITIONS.rope.gap,
    ax = x + gap / 2,
    ay = G - 250;
  ctx.fillStyle = '#4a4252';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, gy);
  for (let i = 0; i <= 8; i++) ctx.lineTo(x + (gap * i) / 8, gy + 18 + (i % 2) * 10);
  ctx.lineTo(x + gap, gy);
  ctx.lineTo(x + gap - 30, H + 40);
  ctx.lineTo(x + 30, H + 40);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  inkRect(ax - 70, ay - 16, 140, 14, '#a4794f');
  // the rope: to whoever is swinging, or hanging straight down
  ctx.strokeStyle = '#8a6a48';
  ctx.lineWidth = 4;
  const sw = PL.find(p => p.rope);
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  if (sw) ctx.lineTo(sw.x, sw.y - 70);
  else ctx.lineTo(ax, ay + 210);
  ctx.stroke();
}
// The castle gate between two biomes: wooden doors with iron bands under a stone arch. Cracks grow as it's hit;
// smashed, the doors lie in pieces and the arch stays.
function drawDoor(g) {
  const gy = G + 6,
    x = g.x + (g.hit > 0 ? Math.sin(g.hit * 2.2) * 3 : 0),
    dmg = 1 - g.hp / g.max;
  inkRect(g.x - 30, gy - 260, 60, 260, '#e2dacd', 4);
  ctx.fillStyle = '#e2dacd';
  ctx.beginPath();
  ctx.arc(g.x, gy - 250, 46, Math.PI, 0);
  ctx.fill();
  ctx.stroke();
  if (g.hp <= 0) {
    ctx.fillStyle = '#8a6a48';
    for (let i = 0; i < 4; i++) inkRect(g.x - 70 + i * 34, gy - 10 - (i % 2) * 6, 30, 10, '#8a6a48');
    return;
  }
  inkRect(x - 26, gy - 230, 52, 230, '#a4794f', 4);
  ctx.strokeStyle = '#4a4252';
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (const y of [gy - 190, gy - 110, gy - 40]) {
    ctx.moveTo(x - 26, y);
    ctx.lineTo(x + 26, y);
  }
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  for (let i = 0; i < Math.floor(dmg * 6); i++) {
    const cy = gy - 210 + i * 34;
    ctx.beginPath();
    ctx.moveTo(x - 20 + (i % 2) * 20, cy);
    ctx.lineTo(x - 8 + (i % 2) * 16, cy + 16);
    ctx.lineTo(x - 16 + (i % 2) * 20, cy + 28);
    ctx.stroke();
  }
}
