// StickFighters: Scenery for campaign runs: the sewer and castle looks (the woods are in scenery.js), their props,
// the transition props (catapult, pipes, rope and chasm, castle gate), and mixing two biomes' backgrounds where one
// runs into the next. Drawing only: it never changes the game, and uses Math.random() only for cosmetic effects.
// ===== BACKGROUNDS =====
const LOOKS = {
  woods: { bg: () => drawWoods(1), fg: () => drawWoodsFg() },
  sewer: { bg: () => drawSewer(), fg: () => drawSewerFg() },
  castle: { bg: () => drawCastle(), fg: () => drawCastleFg() },
  beach: { bg: () => drawBeach(), fg: () => drawBeachFg() },
  ship: { bg: () => drawShip(), fg: () => drawBeachFg() },
  cave: { bg: () => drawCave(), fg: () => drawSewerFg(1) }
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
// cave = 1: only the drips (no water channel)
function drawSewerFg(cave) {
  const cx = CAM.x,
    wy = H - 22;
  if (cave) return drips();
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
  drips();
}
function drips() {
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
// ===== CASTLE (inside the keep): the hall's stone wall right behind you, so banners, torches and shields hang on
// it; tall arched windows look out at the sky and far towers; a long carpet runs down the stone floor =====
function drawCastle() {
  const cx = CAM.x;
  paperBg();
  // the wall: stone courses that move with the floor (it's right behind the fighters)
  ctx.fillStyle = 'rgba(226,218,205,0.85)';
  ctx.fillRect(-30, -30, W + 60, G + 36);
  ctx.strokeStyle = 'rgba(150,140,128,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let y = G - 26, r = 0; y > -30; y -= 30, r++) {
    ctx.moveTo(-30, y);
    ctx.lineTo(W + 30, y);
    for (let x = -(cx % 70) + (r % 2) * 35 - 70; x < W + 70; x += 70) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 30);
    }
  }
  ctx.stroke();
  // tall windows every 560 px of the hall, looking out at the sky and the far towers
  const sp = 560,
    i0 = Math.floor((cx - 200) / sp),
    i1 = Math.floor((cx + W + 200) / sp);
  for (let i = i0; i <= i1; i++) {
    const wx = i * sp + 280 - cx,
      top = 70,
      bot = G - 120;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(wx - 46, bot);
    ctx.lineTo(wx - 46, top + 46);
    ctx.arc(wx, top + 46, 46, Math.PI, 0);
    ctx.lineTo(wx + 46, bot);
    ctx.closePath();
    const sky = ctx.createLinearGradient(0, top, 0, bot);
    sky.addColorStop(0, '#bcd4ee');
    sky.addColorStop(1, '#f6eedd');
    ctx.fillStyle = sky;
    ctx.fill();
    ctx.clip();
    // far towers through the glass, at a tenth of the speed
    ctx.fillStyle = '#d9d2e3';
    for (let k = -2; k <= 2; k++) {
      const tx = wx + k * 70 - ((cx * 0.1) % 70),
        th = 60 + hh(i * 7 + k) * 60;
      ctx.fillRect(tx - 14, bot - th, 28, th);
      ctx.fillStyle = '#ff6fb5';
      ctx.fillRect(tx, bot - th - 16, 12, 7);
      ctx.fillStyle = '#d9d2e3';
    }
    ctx.restore();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(wx - 46, bot);
    ctx.lineTo(wx - 46, top + 46);
    ctx.arc(wx, top + 46, 46, Math.PI, 0);
    ctx.lineTo(wx + 46, bot);
    ctx.closePath();
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wx, top);
    ctx.lineTo(wx, bot);
    ctx.moveTo(wx - 46, top + 90);
    ctx.lineTo(wx + 46, top + 90);
    ctx.stroke();
    inkRect(wx - 54, bot, 108, 10, '#e2dacd');
  }
  // ceiling beams
  ctx.fillStyle = '#8a6a48';
  ctx.fillRect(-30, -30, W + 60, 44);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-30, 14);
  ctx.lineTo(W + 30, 14);
  ctx.stroke();
  // stone floor and the carpet
  ctx.fillStyle = '#e4ddd2';
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.strokeStyle = '#cfc5b6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = -(cx % 60) - 60; x < W + 60; x += 60) {
    ctx.moveTo(x, G + 6);
    ctx.lineTo(x - 18, H);
  }
  ctx.stroke();
  ctx.fillStyle = '#c2185b';
  ctx.fillRect(-30, G + 14, W + 60, 16);
  ctx.fillStyle = '#ffd400';
  ctx.fillRect(-30, G + 16, W + 60, 2);
  ctx.fillRect(-30, G + 26, W + 60, 2);
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
  else if (k === 'trans-cannon') drawBigCannon(x);
  else if (drawPiratePropDone(k, x, s)) return;
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

// ===== BEACH: bright sky, the sea with waves on the horizon, a far island, sand =====
function seaBand(y0, cx) {
  ctx.fillStyle = '#b8e0f0';
  ctx.fillRect(-30, y0, W + 60, G - y0 + 6);
  ctx.strokeStyle = '#7fbfd8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let r = 0; r < 4; r++)
    for (let i = -1; i < 12; i++) {
      const x = i * 90 - ((cx * (0.1 + r * 0.05) + fr * 0.3 + r * 40) % 90),
        y = y0 + 14 + r * 18;
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 15, y - 5, x + 30, y);
    }
  ctx.stroke();
  ctx.strokeStyle = '#5fa8c4';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-30, y0);
  ctx.lineTo(W + 30, y0);
  ctx.stroke();
}
function drawBeach() {
  const cx = CAM.x;
  paperBg();
  const sky = ctx.createLinearGradient(0, 0, 0, G);
  sky.addColorStop(0, '#9fd3f5');
  sky.addColorStop(1, '#fff6dc');
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = sky;
  ctx.fillRect(-30, -30, W + 60, G + 36);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffe98a';
  ctx.beginPath();
  ctx.arc(700 - cx * 0.02, 80, 40, 0, 7);
  ctx.fill();
  // a far island with a palm, then the sea
  const hy = G - 110;
  layer(0.08, 700, 5, x => {
    ctx.fillStyle = '#d7e8c8';
    ctx.strokeStyle = '#9fbf8f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(x, hy, 90, 22, 0, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, hy - 20);
    ctx.lineTo(x + 6, hy - 60);
    ctx.stroke();
  });
  seaBand(hy, cx);
  // wet sand, then dry sand
  ctx.fillStyle = '#e9d9ad';
  ctx.fillRect(-30, G - 30, W + 60, 36);
  ctx.fillStyle = '#f5e7c0';
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.fillStyle = '#dcc690';
  layer(1, 37, 61, (x, r) => {
    ctx.beginPath();
    ctx.arc(x, G + 14 + r * 40, 1.6, 0, 7);
    ctx.fill();
  });
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-30, G + 6);
  ctx.lineTo(W + 30, G + 6);
  ctx.stroke();
}
// Seagulls drifting over the beach and the ship
function drawBeachFg() {
  if (!live()) return;
  if (AMB.filter(a => a.k === 'gull').length < 3 && Math.random() < 0.01)
    AMB.push({ k: 'gull', x: W + 40, y: 40 + Math.random() * 120, vx: -1 - Math.random(), ph: Math.random() * 6 });
  for (let i = AMB.length - 1; i >= 0; i--) {
    const a = AMB[i];
    if (a.k !== 'gull') continue;
    a.x += a.vx;
    a.ph += 0.15;
    const f = Math.sin(a.ph) * 5;
    ctx.strokeStyle = '#5a5560';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(a.x - 12, a.y - f);
    ctx.quadraticCurveTo(a.x - 6, a.y - 6, a.x, a.y);
    ctx.quadraticCurveTo(a.x + 6, a.y - 6, a.x + 12, a.y - f);
    ctx.stroke();
    if (a.x < -40) AMB.splice(i, 1);
  }
}
// ===== SHIP: the sea all around, the ship's rail right behind you, a plank deck =====
function drawShip() {
  const cx = CAM.x;
  paperBg();
  const sky = ctx.createLinearGradient(0, 0, 0, G);
  sky.addColorStop(0, '#a9d4f2');
  sky.addColorStop(1, '#fff3da');
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = sky;
  ctx.fillRect(-30, -30, W + 60, G + 36);
  ctx.globalAlpha = 1;
  seaBand(G - 150, cx);
  // the rail: a top rail and balusters, moving with the deck
  const ry = G - 70;
  ctx.fillStyle = '#b88a5e';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.fillRect(-30, ry - 10, W + 60, 12);
  ctx.beginPath();
  ctx.moveTo(-30, ry - 10);
  ctx.lineTo(W + 30, ry - 10);
  ctx.moveTo(-30, ry + 2);
  ctx.lineTo(W + 30, ry + 2);
  ctx.stroke();
  ctx.fillStyle = '#c99c6e';
  for (let x = -(cx % 40) - 40; x < W + 40; x += 40) {
    ctx.fillRect(x, ry + 2, 10, G - ry + 4);
    ctx.strokeRect(x, ry + 2, 10, G - ry + 4);
  }
  // the hull side below the rail line, then the deck planks
  ctx.fillStyle = '#d9b48a';
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.strokeStyle = '#b88a5e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let y = G + 18; y < H; y += 14) {
    ctx.moveTo(-30, y);
    ctx.lineTo(W + 30, y);
  }
  for (let x = -(cx % 120) - 120; x < W + 120; x += 120) {
    ctx.moveTo(x, G + 6);
    ctx.lineTo(x, H);
  }
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-30, G + 6);
  ctx.lineTo(W + 30, G + 6);
  ctx.stroke();
}
// ===== CAVE: rock walls, stalactites, glowing crystals in the dark =====
function drawCave() {
  const cx = CAM.x;
  paperBg();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#7c7388';
  ctx.fillRect(-30, -30, W + 60, G + 36);
  ctx.globalAlpha = 1;
  // far rock lumps (1/4 speed)
  layer(0.25, 140, 19, (x, r) => {
    ctx.fillStyle = 'rgba(70,62,84,0.16)';
    ctx.beginPath();
    ctx.ellipse(x, G - 10, 50 + r * 30, 40 + r * 50, 0, Math.PI, 0);
    ctx.fill();
  });
  // glowing crystals in the far wall
  layer(0.4, 230, 37, (x, r) => {
    const y = G - 120 - r * 120;
    ctx.fillStyle = 'rgba(140,220,255,0.18)';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#9fe0ff';
    ctx.strokeStyle = '#4a7fa0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 14);
    ctx.lineTo(x + 7, y);
    ctx.lineTo(x, y + 12);
    ctx.lineTo(x - 7, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
  // stalactites from the ceiling (0.7 speed)
  ctx.fillStyle = '#bdb3c8';
  ctx.strokeStyle = '#6b6178';
  ctx.lineWidth = 3;
  ctx.fillRect(-30, -30, W + 60, 48);
  layer(0.7, 70, 47, (x, r) => {
    const h = 30 + r * 60;
    ctx.beginPath();
    ctx.moveTo(x - 14, 16);
    ctx.lineTo(x, 16 + h);
    ctx.lineTo(x + 14, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
  // rocky floor
  ctx.fillStyle = '#cfc6d6';
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.fillStyle = '#b5abc0';
  layer(1, 44, 83, (x, r) => {
    ctx.beginPath();
    ctx.ellipse(x, G + 20 + r * 30, 10 + r * 8, 4, 0, 0, 7);
    ctx.fill();
  });
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-30, G + 6);
  ctx.lineTo(W + 30, G + 6);
  ctx.stroke();
}
// The ship's big cannon (the cannon transition loads everyone into it)
function drawBigCannon(x) {
  const gy = G + 6;
  inkRect(x - 90, gy - 40, 120, 30, '#8a6a48', 4);
  ctx.fillStyle = '#e8cfa9';
  ctx.strokeStyle = INK;
  for (const wx of [x - 70, x + 10]) {
    ctx.beginPath();
    ctx.arc(wx, gy - 10, 16, 0, 7);
    ctx.fill();
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(x - 30, gy - 56);
  ctx.rotate(-0.45);
  inkRect(-60, -24, 160, 48, '#4a4252', 4);
  inkRect(92, -30, 16, 60, '#3a3442', 4);
  ctx.restore();
}
// Beach, ship and cave props; returns true when it drew one
function drawPiratePropDone(k, x, s) {
  const gy = G + 6;
  if (k === 'palm') {
    ctx.strokeStyle = '#8a6a48';
    ctx.lineWidth = 10 * s;
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.quadraticCurveTo(x + 10 * s, gy - 100 * s, x + 30 * s, gy - 200 * s);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.stroke();
    const tx = x + 30 * s,
      ty = gy - 200 * s;
    ctx.fillStyle = '#9fcf7f';
    ctx.strokeStyle = '#4f7f3f';
    ctx.lineWidth = 3;
    for (const a of [-2.6, -2, -1.2, -0.5, 0.2]) {
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.quadraticCurveTo(tx + Math.cos(a) * 60 * s, ty + Math.sin(a) * 40 * s - 20, tx + Math.cos(a) * 90 * s, ty + Math.sin(a) * 30 * s + 30);
      ctx.quadraticCurveTo(tx + Math.cos(a) * 40 * s, ty + Math.sin(a) * 20 * s, tx, ty);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = '#8a6a48';
    for (const [dx, dy] of [
      [-6, 8],
      [6, 10]
    ]) {
      ctx.beginPath();
      ctx.arc(tx + dx, ty + dy, 6, 0, 7);
      ctx.fill();
    }
  } else if (k === 'shell') {
    ctx.fillStyle = '#ffd6c8';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 14, gy);
    ctx.quadraticCurveTo(x, gy - 26, x + 14, gy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    for (const d of [-7, 0, 7]) {
      ctx.moveTo(x, gy - 2);
      ctx.lineTo(x + d, gy - 16);
    }
    ctx.stroke();
  } else if (k === 'starfish') {
    ctx.fillStyle = '#ff9a5c';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5,
        r = i % 2 ? 6 : 15;
      ctx.lineTo(x + Math.cos(a) * r, gy - 14 + Math.sin(a) * r * 0.9);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (k === 'crate') {
    inkRect(x - 26 * s, gy - 52 * s, 52 * s, 52 * s, '#d9b48a');
    ctx.beginPath();
    ctx.moveTo(x - 26 * s, gy - 52 * s);
    ctx.lineTo(x + 26 * s, gy);
    ctx.moveTo(x + 26 * s, gy - 52 * s);
    ctx.lineTo(x - 26 * s, gy);
    ctx.stroke();
  } else if (k === 'driftwood') {
    ctx.strokeStyle = '#a4794f';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(x - 50, gy - 4);
    ctx.lineTo(x + 40, gy - 8);
    ctx.lineTo(x + 60, gy - 24);
    ctx.stroke();
  } else if (k === 'sandcastle') {
    inkRect(x - 30, gy - 30, 60, 30, '#f0d79a');
    inkRect(x - 12, gy - 54, 24, 24, '#f0d79a');
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.moveTo(x, gy - 54);
    ctx.lineTo(x, gy - 74);
    ctx.stroke();
    ctx.fillStyle = '#ff4fa3';
    ctx.beginPath();
    ctx.moveTo(x, gy - 74);
    ctx.lineTo(x + 14, gy - 68);
    ctx.lineTo(x, gy - 62);
    ctx.fill();
  } else if (k === 'cannon') {
    inkRect(x - 30, gy - 24, 56, 18, '#8a6a48');
    ctx.fillStyle = '#e8cfa9';
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.arc(x - 16, gy - 6, 10, 0, 7);
    ctx.arc(x + 14, gy - 6, 10, 0, 7);
    ctx.fill();
    ctx.stroke();
    inkRect(x - 40, gy - 48, 80, 26, '#4a4252');
    inkRect(x + 36, gy - 52, 10, 34, '#3a3442');
  } else if (k === 'ropecoil') {
    ctx.strokeStyle = '#b88a5e';
    ctx.lineWidth = 5;
    for (const r of [8, 16, 24]) {
      ctx.beginPath();
      ctx.ellipse(x, gy - 8, r, r * 0.35, 0, 0, 7);
      ctx.stroke();
    }
  } else if (k === 'anchor') {
    ctx.strokeStyle = '#4a4252';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(x, gy - 100);
    ctx.lineTo(x, gy - 10);
    ctx.moveTo(x - 20, gy - 80);
    ctx.lineTo(x + 20, gy - 80);
    ctx.moveTo(x - 30, gy - 30);
    ctx.quadraticCurveTo(x, gy, x + 30, gy - 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, gy - 108, 9, 0, 7);
    ctx.stroke();
  } else if (k === 'mast') {
    // a mast with its sail, rising out of the deck
    inkRect(x - 9, -30, 18, gy + 30, '#a4794f');
    ctx.fillStyle = '#fffaf0';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 110, 40);
    ctx.quadraticCurveTo(x, 70, x + 110, 40);
    ctx.lineTo(x + 100, 180);
    ctx.quadraticCurveTo(x, 205, x - 100, 180);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ff4fa3';
    ctx.beginPath();
    ctx.arc(x, 115, 22, 0, 7);
    ctx.fill();
  } else if (k === 'stalagmite') {
    ctx.fillStyle = '#bdb3c8';
    ctx.strokeStyle = '#6b6178';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 22 * s, gy);
    ctx.lineTo(x, gy - 90 * s);
    ctx.lineTo(x + 22 * s, gy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (k === 'crystal') {
    ctx.fillStyle = 'rgba(140,220,255,0.25)';
    ctx.beginPath();
    ctx.arc(x, gy - 30, 40, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#9fe0ff';
    ctx.strokeStyle = '#4a7fa0';
    ctx.lineWidth = 2.5;
    for (const [dx, h] of [
      [-12, 40],
      [0, 64],
      [12, 46]
    ]) {
      ctx.beginPath();
      ctx.moveTo(x + dx - 7, gy);
      ctx.lineTo(x + dx, gy - h * s);
      ctx.lineTo(x + dx + 7, gy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else if (k === 'chest') {
    inkRect(x - 28, gy - 34, 56, 34, '#a4794f');
    ctx.fillStyle = '#ffd400';
    ctx.beginPath();
    ctx.ellipse(x, gy - 34, 26, 10, 0, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    inkRect(x - 5, gy - 26, 10, 10, '#ffd400', 2);
  } else if (k === 'coins') {
    ctx.fillStyle = '#ffd400';
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    for (const [dx, dy] of [
      [-10, 0],
      [0, -6],
      [10, 0],
      [-4, -12],
      [6, -16]
    ]) {
      ctx.beginPath();
      ctx.ellipse(x + dx, gy - 4 + dy, 7, 4, 0, 0, 7);
      ctx.fill();
      ctx.stroke();
    }
  } else return false;
  return true;
}
