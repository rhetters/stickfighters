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
  cave: { bg: () => drawCave(), fg: () => drawSewerFg(1) },
  meadow: { bg: () => drawMeadow(), fg: () => drawWoodsFg() },
  slope: { bg: () => drawSlope(), fg: () => {} },
  peak: { bg: () => drawPeak(), fg: () => drawSnowFg() },
  base: { bg: () => drawBase(), fg: () => {} },
  rocket: { bg: () => drawRocketIn(), fg: () => {} },
  moon: { bg: () => drawMoon(), fg: () => {} }
};
const lookOfSeg = s => LOOKS[BIOMES[s.b].look];
// The castle hall's tall windows: one every CASTLE_WIN px, centred halfway along. Things that hang on the wall
// (banners, torches, shields) are left out where a window is.
const CASTLE_WIN = 560,
  onWindow = (k, x) =>
    (k === 'banner' || k === 'torch' || k === 'shield') &&
    Math.abs((((x % CASTLE_WIN) + CASTLE_WIN) % CASTLE_WIN) - CASTLE_WIN / 2) < 46 + 34;
// ===== SLOPES (a climb biome; LV.ramps from run.js). Drawing only: the game itself stays on flat ground, and each
// thing is drawn raised by how high the ground under it is, measured from a point near the left of the screen
// (most of the screen is ahead of the players, so the hill goes up from there). render() turns it on per frame. =====
let slopeOn = false,
  slopeRef = 0;
const SLOPE_REF = 200;
function altAt(x) {
  let a = 0;
  for (const r of LV.ramps) a += r.k * Math.max(0, Math.min(x, r.x1) - r.x0);
  return a;
}
let helmOn = false;
function slopeStart() {
  helmOn = !!(MODE === LEVEL && LV && LV.segs);
  slopeOn = !!(MODE === LEVEL && LV && LV.ramps);
  slopeRef = slopeOn ? altAt(CAM.x + SLOPE_REF) : 0;
}
// How far down (negative = up) to draw something standing at world x
const upAt = x => (slopeOn ? slopeRef - altAt(x) : 0);
// Draws fn() moved to the height of the ground at x
function lifted(x, fn) {
  const u = upAt(x);
  if (!u) return fn();
  ctx.save();
  ctx.translate(0, u);
  fn();
  ctx.restore();
}
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
  // the world's props in the same view as the fighters (zoomed out and raised on the launch tower)
  camApply(viewX(), CAM.y, CAM.z);
  if (LV.terr) drawPlatforms();
  for (const c of LV.ch)
    if (c.x0 < cx + W + 400 && c.x0 + c.w > cx - 400)
      for (const p of c.props) {
        const x = c.x0 + p.x;
        if (x > cx - 360 && x < cx + W + 360 && !(c.look === 'castle' && onWindow(p.k, x)))
          lifted(x, () => drawProp(p, x, dk));
      }
  for (const g of LV.gates) lifted(g.x, () => drawGate(g));
  if (LV.haz) drawVents();
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
  // tall windows every CASTLE_WIN px of the hall, looking out at the sky and the far towers
  const sp = CASTLE_WIN,
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
  } else if (k === 'staketorch') {
    // a torch on a wooden stake driven into the ground (the cave has no wall to hang one on)
    inkRect(x - 5, gy - 150, 10, 150, '#7a6a58');
    inkRect(x - 9, gy - 160, 18, 14, '#5e5044');
    const fl = Math.sin(fr * 0.3 + x) * 3;
    ctx.fillStyle = '#ffb347';
    ctx.beginPath();
    ctx.moveTo(x - 10, gy - 160);
    ctx.quadraticCurveTo(x - 12, gy - 180, x + fl, gy - 196);
    ctx.quadraticCurveTo(x + 12, gy - 180, x + 10, gy - 160);
    ctx.fill();
    ctx.fillStyle = '#ffe28a';
    ctx.beginPath();
    ctx.ellipse(x, gy - 170, 4, 9, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,200,90,0.16)';
    ctx.beginPath();
    ctx.arc(x, gy - 175, 46, 0, 7);
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
  else if (drawMountainTransDone(k, x)) return;
  else if (drawSpaceTransDone(k, x)) return;
  else if (drawPiratePropDone(k, x, s)) return;
  else if (drawMountainPropDone(k, x, s)) return;
  else if (drawSpacePropDone(k, x, s)) return;
  else if (drawVolcanoProp(k, x, s)) return;
  else if (k === 'trans-pipe' || k === 'trans-pipeout') drawBigPipe(x, k === 'trans-pipeout');
  else if (k === 'trans-rope') drawChasm(x);
  else if (k === 'trans-gate') {
    /* the gate itself is drawn by drawGate */
  }
}
// The catapult: its arm swings when the scene fires (run.js, LV.cine)
// The bucket's bowl, drawn again over the riders so they sit inside it
function drawCatBowl(x, t) {
  ctx.save();
  ctx.translate(x, G + 6 - 84);
  ctx.rotate(-catArm(t));
  ctx.fillStyle = '#c9a27a';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(-108, -14, 30, 0.15, Math.PI - 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
function drawCatapult(x) {
  const gy = G + 6,
    c = LV.cine && LV.cine.k === 'catapult' ? LV.cine.t : 0,
    a = catArm(c);
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
  // the bucket: its back half here, its front drawn over the riders (drawCatBowl)
  ctx.fillStyle = '#b08a62';
  ctx.beginPath();
  ctx.arc(-108, -14, 30, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  if (!c) drawCatBowl(x, 0);
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

// ===== MOUNTAIN: an alpine meadow under snowy peaks, the mountainside you climb, the snowy peak =====
// Far snowy peaks; dy moves them down as you climb (they're far, so they sink slowly)
function farPeaks(f, dy, col) {
  layer(f, 330, 23, (x, r) => {
    const h = 150 + r * 110,
      w = 170 + r * 70,
      by = G - 40 + dy;
    ctx.fillStyle = col;
    ctx.strokeStyle = '#a9b4c2';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - w, by);
    ctx.lineTo(x, by - h);
    ctx.lineTo(x + w, by);
    ctx.fill();
    ctx.stroke();
    // the snow cap
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x - w * 0.3, by - h * 0.7);
    ctx.lineTo(x, by - h);
    ctx.lineTo(x + w * 0.3, by - h * 0.7);
    ctx.lineTo(x + w * 0.12, by - h * 0.62);
    ctx.lineTo(x, by - h * 0.72);
    ctx.lineTo(x - w * 0.14, by - h * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
}
function skyWash(top, bot, a) {
  const sky = ctx.createLinearGradient(0, 0, 0, G);
  sky.addColorStop(0, top);
  sky.addColorStop(1, bot);
  ctx.globalAlpha = a;
  ctx.fillStyle = sky;
  ctx.fillRect(-30, -30, W + 60, H + 60);
  ctx.globalAlpha = 1;
}
function groundLine() {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-30, G + 6);
  ctx.lineTo(W + 30, G + 6);
  ctx.stroke();
}
function drawMeadow() {
  paperBg();
  skyWash('#a7d3f2', '#f6f8ec', 0.4);
  farPeaks(0.06, 0, '#dfe6ef');
  // green hills (1/4 speed)
  layer(0.25, 260, 29, (x, r) => {
    ctx.fillStyle = 'rgba(150,200,120,0.35)';
    ctx.strokeStyle = 'rgba(110,160,90,0.6)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(x, G + 10, 200 + r * 80, 70 + r * 50, 0, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  });
  ctx.fillStyle = '#e3f1cf';
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.fillStyle = '#c4dea6';
  layer(1, 41, 67, (x, r) => {
    ctx.beginPath();
    ctx.ellipse(x, G + 18 + r * 40, 6 + r * 6, 2.5, 0, 0, 7);
    ctx.fill();
  });
  groundLine();
}
// The mountainside: the ground is drawn following the slopes (upAt), with rock below it
function drawSlope() {
  const cx = CAM.x,
    dy = Math.min(140, slopeRef * 0.12);
  paperBg();
  skyWash('#94c3ea', '#eef3f6', 0.45);
  farPeaks(0.05, dy, '#e4e9f0');
  // a nearer ridge (1/3 speed), sinking a little faster as you climb
  layer(0.33, 300, 31, (x, r) => {
    const by = G + 30 + dy * 1.6;
    ctx.fillStyle = 'rgba(160,150,140,0.3)';
    ctx.strokeStyle = 'rgba(120,110,100,0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 200, by);
    ctx.lineTo(x - 60, by - 120 - r * 60);
    ctx.lineTo(x + 30, by - 90 - r * 40);
    ctx.lineTo(x + 200, by);
    ctx.fill();
    ctx.stroke();
  });
  // the hillside under the path
  const pts = [];
  for (let sx = -30; sx <= W + 30; sx += 15) pts.push([sx, G + 6 + upAt(cx + sx)]);
  ctx.fillStyle = '#e2dbcf';
  ctx.beginPath();
  ctx.moveTo(-30, H + 30);
  for (const [px, py] of pts) ctx.lineTo(px, py);
  ctx.lineTo(W + 30, H + 30);
  ctx.closePath();
  ctx.fill();
  // rock layers following the hill, and pebbles
  ctx.strokeStyle = 'rgba(150,135,120,0.45)';
  ctx.lineWidth = 2;
  for (const d of [22, 48]) {
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py + d) : ctx.moveTo(px, py + d)));
    ctx.stroke();
  }
  ctx.fillStyle = '#c4b9a8';
  layer(1, 53, 71, (x, r) => {
    ctx.beginPath();
    ctx.ellipse(x, G + 16 + r * 50 + upAt(cx + x), 5 + r * 6, 3, 0, 0, 7);
    ctx.fill();
  });
  // a sprinkle of grass at the edge of the path
  ctx.strokeStyle = '#8fae74';
  ctx.lineWidth = 2.5;
  layer(1, 37, 79, (x, r) => {
    if (r < 0.5) return;
    const y = G + 6 + upAt(cx + x);
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo(x - 7, y - 9);
    ctx.moveTo(x, y);
    ctx.lineTo(x + 1, y - 12);
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 8, y - 8);
    ctx.stroke();
  });
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.stroke();
}
function drawPeak() {
  paperBg();
  skyWash('#b9d6f0', '#ffffff', 0.45);
  farPeaks(0.05, 60, '#f1f4f8');
  // snowy drifts (1/3 speed)
  layer(0.3, 230, 43, (x, r) => {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.strokeStyle = 'rgba(150,175,200,0.6)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(x, G + 8, 160 + r * 80, 40 + r * 40, 0, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  });
  ctx.fillStyle = '#f6f9fc';
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.fillStyle = '#dbe6f0';
  layer(1, 47, 89, (x, r) => {
    ctx.beginPath();
    ctx.ellipse(x, G + 20 + r * 40, 14 + r * 10, 3, 0, 0, 7);
    ctx.fill();
  });
  groundLine();
}
// Falling snow in front
function drawSnowFg() {
  if (!live()) return;
  if (AMB.filter(a => a.k === 'snow').length < 40 && Math.random() < 0.4)
    AMB.push({ k: 'snow', x: Math.random() * (W + 200), y: -10, vx: -0.6 - Math.random() * 0.6, vy: 0.8 + Math.random() * 1.2, r: 1.5 + Math.random() * 2.5 });
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.strokeStyle = 'rgba(140,160,190,0.6)';
  ctx.lineWidth = 1;
  for (let i = AMB.length - 1; i >= 0; i--) {
    const a = AMB[i];
    if (a.k !== 'snow') continue;
    a.x += a.vx + Math.sin((fr + i * 13) * 0.05) * 0.4;
    a.y += a.vy;
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.r, 0, 7);
    ctx.fill();
    ctx.stroke();
    if (a.y > H + 10) AMB.splice(i, 1);
  }
}
// Meadow, mountainside and peak props; returns true when it drew one
function drawMountainPropDone(k, x, s) {
  const gy = G + 6;
  if (k === 'flowers') {
    const cols = ['#ff7eb6', '#ffd23f', '#ffffff', '#b48cff'];
    ctx.strokeStyle = '#6f9a58';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const fx = x - 24 + i * 12,
        h = 10 + ((i * 7) % 9);
      ctx.beginPath();
      ctx.moveTo(fx, gy);
      ctx.lineTo(fx + 1, gy - h);
      ctx.stroke();
      ctx.fillStyle = cols[i % 4];
      ctx.beginPath();
      ctx.arc(fx + 1, gy - h, 4, 0, 7);
      ctx.fill();
    }
  } else if (k === 'fence') {
    ctx.strokeStyle = '#8a6a48';
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (const dx of [-60, 0, 60]) {
      ctx.moveTo(x + dx, gy);
      ctx.lineTo(x + dx, gy - 46);
    }
    ctx.moveTo(x - 70, gy - 36);
    ctx.lineTo(x + 70, gy - 36);
    ctx.moveTo(x - 70, gy - 18);
    ctx.lineTo(x + 70, gy - 18);
    ctx.stroke();
  } else if (k === 'haybale') {
    ctx.fillStyle = '#f0d27a';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, gy - 26 * s, 34 * s, 26 * s, 0, 0, 7);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#c9a54a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, gy - 26 * s, 20 * s, 15 * s, 0, 0, 7);
    ctx.ellipse(x, gy - 26 * s, 8 * s, 6 * s, 0, 0, 7);
    ctx.stroke();
  } else if (k === 'boulder') {
    ctx.fillStyle = '#d6cfc3';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(x - 50 * s, gy);
    ctx.quadraticCurveTo(x - 56 * s, gy - 60 * s, x - 10 * s, gy - 74 * s);
    ctx.quadraticCurveTo(x + 46 * s, gy - 70 * s, x + 52 * s, gy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#a89e8f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 20 * s, gy - 50 * s);
    ctx.lineTo(x, gy - 34 * s);
    ctx.stroke();
  } else if (k === 'cairn') {
    ctx.fillStyle = '#cfc8bd';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    let y = gy;
    for (const w of [26, 21, 16, 11, 7]) {
      ctx.beginPath();
      ctx.ellipse(x, y - w * 0.45, w, w * 0.45, 0, 0, 7);
      ctx.fill();
      ctx.stroke();
      y -= w * 0.9;
    }
  } else if (k === 'snowpine') {
    // a pine with snow on its branches
    inkRect(x - 5 * s, gy - 30 * s, 10 * s, 30 * s, '#a4794f', 3);
    for (let i = 0; i < 3; i++) {
      const by = gy - 26 * s - i * 40 * s,
        w = (52 - i * 13) * s;
      ctx.fillStyle = '#9cc49a';
      ctx.strokeStyle = '#4f7f4f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - w, by);
      ctx.lineTo(x, by - 60 * s);
      ctx.lineTo(x + w, by);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(x - w * 0.9, by - 2);
      ctx.quadraticCurveTo(x, by - 16 * s, x + w * 0.9, by - 2);
      ctx.quadraticCurveTo(x, by - 6 * s, x - w * 0.9, by - 2);
      ctx.fill();
    }
  } else if (k === 'snowman') {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    for (const [dy, r] of [
      [22, 24],
      [62, 18],
      [92, 13]
    ]) {
      ctx.beginPath();
      ctx.arc(x, gy - dy, r, 0, 7);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = '#ff9a3c';
    ctx.beginPath();
    ctx.moveTo(x + 4, gy - 93);
    ctx.lineTo(x + 22, gy - 90);
    ctx.lineTo(x + 4, gy - 87);
    ctx.fill();
    ctx.fillStyle = INK;
    for (const dx of [-5, 5]) {
      ctx.beginPath();
      ctx.arc(x + dx - 2, gy - 98, 2, 0, 7);
      ctx.fill();
    }
    ctx.strokeStyle = '#ff4fa3';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x - 14, gy - 80);
    ctx.lineTo(x + 14, gy - 80);
    ctx.lineTo(x + 18, gy - 62);
    ctx.stroke();
  } else if (k === 'flag') {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x, gy - 120);
    ctx.stroke();
    const w = Math.sin(fr * 0.12 + x) * 5;
    ctx.fillStyle = '#ff4fa3';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, gy - 120);
    ctx.quadraticCurveTo(x + 22, gy - 116 + w, x + 46, gy - 108);
    ctx.quadraticCurveTo(x + 22, gy - 100 + w, x, gy - 96);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (k === 'iceblock') {
    ctx.fillStyle = 'rgba(180,225,250,0.85)';
    ctx.strokeStyle = '#4a7fa0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 30 * s, gy);
    ctx.lineTo(x - 26 * s, gy - 44 * s);
    ctx.lineTo(x + 8 * s, gy - 54 * s);
    ctx.lineTo(x + 30 * s, gy - 36 * s);
    ctx.lineTo(x + 28 * s, gy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.moveTo(x - 16 * s, gy - 36 * s);
    ctx.lineTo(x - 2 * s, gy - 42 * s);
    ctx.stroke();
  } else return false;
  return true;
}
// The transition this prop belongs to (its x), and whether its vehicle is away (riding now, or already gone)
const transAt = x => LV.trans && LV.trans.find(t => t.x === x);
const riding = k => LV.cine && LV.cine.k === k;
// A hot-air balloon: x = the basket's middle, y = the basket's bottom
function drawBalloon(x, y) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (const d of [-26, 26]) {
    ctx.moveTo(x + d, y - 46);
    ctx.lineTo(x + d * 1.6, y - 120);
  }
  ctx.stroke();
  // the envelope, in stripes
  const ey = y - 200;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - 40, y - 118);
  ctx.bezierCurveTo(x - 120, y - 170, x - 110, ey - 110, x, ey - 110);
  ctx.bezierCurveTo(x + 110, ey - 110, x + 120, y - 170, x + 40, y - 118);
  ctx.closePath();
  ctx.fillStyle = '#ff4fa3';
  ctx.fill();
  ctx.clip();
  ctx.fillStyle = '#ffd23f';
  for (const sx of [-60, 0, 60]) {
    ctx.beginPath();
    ctx.ellipse(x + sx, ey - 10, 14, 120, 0, 0, 7);
    ctx.fill();
  }
  ctx.restore();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 40, y - 118);
  ctx.bezierCurveTo(x - 120, y - 170, x - 110, ey - 110, x, ey - 110);
  ctx.bezierCurveTo(x + 110, ey - 110, x + 120, y - 170, x + 40, y - 118);
  ctx.closePath();
  ctx.stroke();
  // the basket
  inkRect(x - 32, y - 46, 64, 46, '#c99c6e', 4);
  ctx.strokeStyle = '#8a6a48';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 1; i < 4; i++) {
    ctx.moveTo(x - 32, y - 46 + i * 11.5);
    ctx.lineTo(x + 32, y - 46 + i * 11.5);
  }
  ctx.stroke();
}
// A gondola cabin hanging from its cable: x, y = where it hangs from the cable; the cabin's floor is 70 below
function drawGondolaCab(x, y) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y - 6);
  ctx.lineTo(x, y + 12);
  ctx.stroke();
  ctx.fillStyle = '#4a4252';
  ctx.beginPath();
  ctx.arc(x, y - 6, 7, 0, 7);
  ctx.fill();
  inkRect(x - 40, y + 12, 80, 58, '#ff4fa3', 4);
  for (const wx of [-30, 4]) inkRect(x + wx, y + 20, 26, 22, '#cfe9fb', 3);
}
// Cable up from a station at (x, y), going up-right (dir 1) or coming down from the left (dir -1)
function cableFrom(x, y, dir) {
  ctx.strokeStyle = '#4a4252';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + dir * 1400, y - 1400 * (dir > 0 ? 3.4 / 5 : 240 / 400));
  ctx.stroke();
}
function drawGondolaStation(x, dir, cab) {
  const gy = G + 6;
  // the tower and its roof
  inkRect(x - 70, gy - 150, 18, 150, '#a4794f', 4);
  inkRect(x + 52, gy - 150, 18, 150, '#a4794f', 4);
  inkRect(x - 90, gy - 170, 180, 22, '#8a6a48', 4);
  cableFrom(x, gy - 76, dir);
  if (cab) drawGondolaCab(x, gy - 76);
}
function drawMountainTransDone(k, x) {
  const gy = G + 6;
  if (k === 'trans-balloon') {
    const t = transAt(x);
    if (!(t && (t.done || riding('balloon')))) drawBalloon(x, gy);
  } else if (k === 'trans-balloonout') {
    if (!riding('balloon')) drawBalloon(x, gy);
  } else if (k === 'trans-gondola') {
    const t = transAt(x);
    drawGondolaStation(x, 1, !(t && (t.done || riding('gondola'))));
  } else if (k === 'trans-gondolaout') {
    drawGondolaStation(x, -1, !riding('gondola'));
  } else if (k === 'trans-climb') {
    // the cliff, with a rope ladder up it
    ctx.fillStyle = '#d6cdbf';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 10, gy);
    ctx.lineTo(x + 20, gy - 160);
    ctx.lineTo(x + 6, gy - 300);
    ctx.lineTo(x + 18, -40);
    ctx.lineTo(x + 1000, -40);
    ctx.lineTo(x + 1000, gy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(150,135,120,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 1; i < 6; i++) {
      ctx.moveTo(x + 60 + i * 40, gy - i * 55);
      ctx.lineTo(x + 140 + i * 40, gy - i * 55 - 20);
    }
    ctx.stroke();
    ctx.strokeStyle = '#a4794f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 24, gy);
    ctx.lineTo(x + 24, -40);
    ctx.moveTo(x + 44, gy);
    ctx.lineTo(x + 44, -40);
    for (let y = gy - 14; y > -40; y -= 22) {
      ctx.moveTo(x + 24, y);
      ctx.lineTo(x + 44, y);
    }
    ctx.stroke();
  } else return false;
  return true;
}

// ===== SPACE: the launch base, inside the rocket, the moon =====
// The launch base: desert sky, far launch towers, a fence; the camera can look up the launch tower (CAM.y < 0), so
// the ground sinks when it does
function drawBase() {
  const cy = CAM.y;
  paperBg();
  skyWash('#9ccbf0', '#fff1d6', 0.45);
  ctx.save();
  ctx.translate(0, -cy * 0.3);
  // far mesas and launch towers (slow)
  layer(0.08, 420, 61, (x, r) => {
    ctx.fillStyle = 'rgba(214,170,130,0.35)';
    ctx.strokeStyle = 'rgba(170,120,90,0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 160, G);
    ctx.lineTo(x - 120, G - 70 - r * 40);
    ctx.lineTo(x + 110, G - 70 - r * 40);
    ctx.lineTo(x + 150, G);
    ctx.fill();
    ctx.stroke();
  });
  layer(0.2, 520, 67, (x, r) => {
    ctx.strokeStyle = 'rgba(120,120,140,0.5)';
    ctx.lineWidth = 2;
    const h = 150 + r * 60;
    ctx.beginPath();
    ctx.moveTo(x - 14, G);
    ctx.lineTo(x - 8, G - h);
    ctx.lineTo(x + 8, G - h);
    ctx.lineTo(x + 14, G);
    for (let y = G - 20; y > G - h; y -= 20) {
      ctx.moveTo(x - 12, y);
      ctx.lineTo(x + 12, y - 20);
    }
    ctx.stroke();
    // the rocket standing beside its tower: body, pointed nose, two fins
    const rx = x + 34,
      rh = h * 0.85,
      rw = 11;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.moveTo(rx - rw, G);
    ctx.lineTo(rx - rw, G - rh + 22);
    ctx.quadraticCurveTo(rx - rw, G - rh + 4, rx, G - rh - 8);
    ctx.quadraticCurveTo(rx + rw, G - rh + 4, rx + rw, G - rh + 22);
    ctx.lineTo(rx + rw, G);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,79,163,0.45)';
    for (const d of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(rx + d * rw, G - 30);
      ctx.lineTo(rx + d * (rw + 10), G);
      ctx.lineTo(rx + d * rw, G - 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillRect(rx - rw, G - rh * 0.55, rw * 2, 5);
  });
  ctx.restore();
  const gy = G + (6 - cy) * CAM.z; // where the ground is on screen (the view can be raised and zoomed out)
  ctx.fillStyle = '#efe0c2';
  ctx.fillRect(-30, gy, W + 60, H + 400);
  // concrete pad lines
  ctx.strokeStyle = 'rgba(170,150,120,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = -(CAM.x % 160) - 160; x < W + 160; x += 160) {
    ctx.moveTo(x, gy);
    ctx.lineTo(x - 40, H + 30);
  }
  ctx.moveTo(-30, gy + 30);
  ctx.lineTo(W + 30, gy + 30);
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-30, gy);
  ctx.lineTo(W + 30, gy);
  ctx.stroke();
}
// Inside the rocket: a long metal corridor with round windows on space; stars stream past
function drawRocketIn() {
  const cx = CAM.x;
  paperBg();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#c9cfdc';
  ctx.fillRect(-30, -30, W + 60, G + 36);
  ctx.globalAlpha = 1;
  // wall panels and rivets (speed 1)
  ctx.strokeStyle = 'rgba(110,118,140,0.55)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let x = -(cx % 220) - 220; x < W + 220; x += 220) {
    ctx.moveTo(x, 40);
    ctx.lineTo(x, G);
  }
  ctx.moveTo(-30, 40);
  ctx.lineTo(W + 30, 40);
  ctx.moveTo(-30, G - 60);
  ctx.lineTo(W + 30, G - 60);
  ctx.stroke();
  // windows: a starfield streaming past behind round glass
  for (let x = -(cx % 440) - 440 + 110; x < W + 440; x += 440) {
    const wy = 150;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, wy, 56, 0, 7);
    ctx.fillStyle = '#1d2140';
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 18; i++) {
      const sx = x - 60 + ((i * 53 - fr * (1 + (i % 3)) - cx * 0.05) % 120 + 120) % 120,
        sy = wy - 56 + ((i * 37) % 112);
      ctx.fillRect(sx, sy, 2 + (i % 3), 2);
    }
    ctx.restore();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x, wy, 56, 0, 7);
    ctx.stroke();
    ctx.strokeStyle = '#9aa3b5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, wy, 62, 0, 7);
    ctx.stroke();
  }
  // the floor: metal grating
  ctx.fillStyle = '#b7bdcb';
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.strokeStyle = 'rgba(90,96,115,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = -(cx % 30) - 30; x < W + 30; x += 30) {
    ctx.moveTo(x, G + 6);
    ctx.lineTo(x - 20, H);
  }
  ctx.stroke();
  groundLine();
}
// The moon: a dark sky full of stars, the Earth, grey ground with craters
function drawMoon() {
  const cx = CAM.x;
  // the sky: lighter at the top so the scores stay easy to read, darkening down to the horizon
  const sky = ctx.createLinearGradient(0, 0, 0, G);
  sky.addColorStop(0, '#9da2c4');
  sky.addColorStop(0.35, '#4d5380');
  sky.addColorStop(1, '#23263f');
  ctx.fillStyle = sky;
  ctx.fillRect(-30, -30, W + 60, H + 60);
  ctx.globalAlpha = 0.18;
  const gx = -(cx % 30);
  ctx.drawImage(gridC, gx, 0, W, H);
  ctx.drawImage(gridC, gx + W, 0, W, H);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff';
  layer(0.03, 37, 97, (x, r) => ctx.fillRect(x, 90 + r * (G - 150), 1.5 + r * 2, 1.5 + r * 2));
  // the Earth
  const ex = 650 - cx * 0.01,
    ey = 150;
  ctx.fillStyle = '#5fb3ff';
  ctx.strokeStyle = '#cfe9ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(ex, ey, 42, 0, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#7fd07f';
  ctx.beginPath();
  ctx.ellipse(ex - 12, ey - 8, 14, 18, 0.5, 0, 7);
  ctx.ellipse(ex + 16, ey + 14, 10, 8, 0, 0, 7);
  ctx.fill();
  // far grey hills
  layer(0.2, 300, 101, (x, r) => {
    ctx.fillStyle = '#8b8fa3';
    ctx.strokeStyle = '#5f6378';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(x, G + 8, 180 + r * 80, 50 + r * 40, 0, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  });
  ctx.fillStyle = '#c3c6d1';
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.strokeStyle = '#a3a7b6';
  ctx.lineWidth = 2;
  layer(1, 90, 103, (x, r) => {
    ctx.beginPath();
    ctx.ellipse(x, G + 22 + r * 40, 16 + r * 14, 4 + r * 2, 0, 0, 7);
    ctx.stroke();
  });
  ctx.strokeStyle = '#f2f3f7';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-30, G + 6);
  ctx.lineTo(W + 30, G + 6);
  ctx.stroke();
}
// The launch tower's platforms (terrain) as steel girders, and the tower's frame behind them; the volcano's rock ledges
function drawPlatforms() {
  if (LV.esc && LV.esc.on) drawEscLedges();
  for (const s of LV.terr.s) {
    if (s.st === 'rock') {
      drawLedge(s, 0); // the volcano's rock ledges (volcano.js)
      continue;
    }
    const w = s.x2 - s.x1;
    inkRect(s.x1, s.y1, w, 12, '#ff9a3c', 3);
    ctx.strokeStyle = 'rgba(28,22,38,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = s.x1 + 10; x < s.x2 - 5; x += 20) {
      ctx.moveTo(x, s.y1 + 12);
      ctx.lineTo(x + 10, s.y1);
    }
    ctx.stroke();
    // little posts down to the ground
    ctx.strokeStyle = 'rgba(120,120,140,0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(s.x1 + 12, s.y1 + 12);
    ctx.lineTo(s.x1 + 12, G + 6);
    ctx.moveTo(s.x2 - 12, s.y1 + 12);
    ctx.lineTo(s.x2 - 12, G + 6);
    ctx.stroke();
  }
}
// A rocket standing at x (its middle) with its bottom at y; fire = flames under it
function drawRocket(x, y, fire) {
  const w = 110,
    h = 520;
  if (fire) {
    for (let i = 0; i < 3; i++) {
      const fl = 60 + Math.random() * 50 - i * 18;
      ctx.fillStyle = ['#ff7a00', '#ffd23f', '#fff6c8'][i];
      ctx.beginPath();
      ctx.moveTo(x - 34 + i * 10, y);
      ctx.quadraticCurveTo(x, y + fl * 1.6, x + 34 - i * 10, y);
      ctx.fill();
    }
  }
  // fins
  ctx.fillStyle = '#ff4fa3';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  for (const d of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + (d * w) / 2, y - 140);
    ctx.lineTo(x + d * (w / 2 + 50), y);
    ctx.lineTo(x + (d * w) / 2, y - 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // body and nose
  inkRect(x - w / 2, y - h + 100, w, h - 100, '#fbfaf4', 4);
  ctx.fillStyle = '#ff4fa3';
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y - h + 100);
  ctx.quadraticCurveTo(x - w / 2, y - h + 20, x, y - h - 40);
  ctx.quadraticCurveTo(x + w / 2, y - h + 20, x + w / 2, y - h + 100);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  inkRect(x - w / 2, y - 200, w, 20, '#ff4fa3', 3);
  inkRect(x - w / 2, y - 60, w, 20, '#3ec5ff', 3);
  // window and the door (at the top deck's height)
  ctx.fillStyle = '#cfe9fb';
  ctx.beginPath();
  ctx.arc(x, y - 330, 22, 0, 7);
  ctx.fill();
  ctx.stroke();
  inkRect(x - w / 2 + 6, y - 496, 34, 60, '#dfe3ea', 3);
  ctx.fillStyle = 'rgba(28,22,38,0.5)';
  ctx.font = '900 18px Impact,"Arial Black",sans-serif';
  ctx.textAlign = 'center';
  ctx.save();
  ctx.translate(x + 8, y - 250);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('PINK-1', 0, 6);
  ctx.restore();
}
// A flying saucer at (x, y); beaming = the fighter it beams down (a cone of light down to them)
function drawSaucer(x, y, beaming) {
  if (beaming) {
    const g = ctx.createLinearGradient(0, y, 0, G);
    g.addColorStop(0, 'rgba(160,255,200,0.6)');
    g.addColorStop(1, 'rgba(160,255,200,0.15)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 24, y + 10);
    ctx.lineTo(x - 90, G + 6);
    ctx.lineTo(x + 90, G + 6);
    ctx.lineTo(x + 24, y + 10);
    ctx.fill();
  }
  ctx.fillStyle = '#cfe9fb';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x, y - 12, 32, 26, 0, Math.PI, 0);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#9aa3b5';
  ctx.beginPath();
  ctx.ellipse(x, y, 80, 18, 0, 0, 7);
  ctx.fill();
  ctx.stroke();
  for (let i = -2; i <= 2; i++) {
    ctx.fillStyle = (fr >> 3) % 2 === (i & 1) ? '#ffd23f' : '#ff4fa3';
    ctx.beginPath();
    ctx.arc(x + i * 28, y + 2, 5, 0, 7);
    ctx.fill();
  }
}
function drawSpaceTransDone(k, x) {
  const gy = G + 6;
  if (k === 'trans-launch') {
    // the launch tower's frame, and the rocket (until it has left)
    // the tower: a braced steel frame under the top deck, up beside the rocket
    const o = x - 1110,
      l = o + 750,
      r = o + 1050;
    ctx.strokeStyle = '#8a8fa3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let y = gy; y > G - 430; y -= 86) {
      ctx.moveTo(l, y);
      ctx.lineTo(r, Math.max(G - 418, y - 86));
      ctx.moveTo(r, y);
      ctx.lineTo(l, Math.max(G - 418, y - 86));
      ctx.moveTo(l, y);
      ctx.lineTo(r, y);
    }
    ctx.moveTo(r - 10, G - 430);
    ctx.lineTo(r - 10, G - 560);
    ctx.lineTo(x - 40, G - 560);
    ctx.stroke();
    inkRect(l - 4, G - 425, 10, 431, '#9aa3b5', 2.5);
    inkRect(r - 6, G - 425, 10, 431, '#9aa3b5', 2.5);
    const t = transAt(x);
    if (!(t && (t.done || riding('launch')))) drawRocket(x, gy, false);
  } else if (k === 'trans-landing') {
    // the hatch to the landing module
    inkRect(x - 50, gy - 170, 100, 170, '#9aa3b5', 4);
    inkRect(x - 36, gy - 156, 72, 156, '#dfe3ea', 3);
    ctx.fillStyle = '#ffd23f';
    ctx.font = '900 16px Impact,"Arial Black",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MOON', x, gy - 120);
    ctx.fillText('LANDER', x, gy - 100);
    ctx.fillStyle = '#ff4fa3';
    ctx.beginPath();
    ctx.arc(x + 24, gy - 70, 6, 0, 7);
    ctx.fill();
  } else if (k === 'trans-landingout') {
    if (!riding('landing')) drawRocket(x, gy, false);
  } else return false;
  return true;
}
function drawSpacePropDone(k, x, s) {
  const gy = G + 6;
  if (k === 'radar') {
    inkRect(x - 6, gy - 90, 12, 90, '#9aa3b5', 3);
    ctx.save();
    ctx.translate(x, gy - 100);
    ctx.rotate(-0.5 + Math.sin(fr * 0.02 + x) * 0.3);
    ctx.fillStyle = '#fbfaf4';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 46, 18, 0, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(0, -30);
    ctx.stroke();
    ctx.restore();
  } else if (k === 'fueltank') {
    ctx.fillStyle = '#fbfaf4';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(x, gy - 50 * s, 56 * s, 44 * s, 0, 0, 7);
    ctx.fill();
    ctx.stroke();
    inkRect(x - 56 * s, gy - 54 * s, 112 * s, 10, '#ff4fa3', 2);
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.moveTo(x - 30 * s, gy - 10 * s);
    ctx.lineTo(x - 36 * s, gy);
    ctx.moveTo(x + 30 * s, gy - 10 * s);
    ctx.lineTo(x + 36 * s, gy);
    ctx.stroke();
  } else if (k === 'cone') {
    ctx.fillStyle = '#ff7a00';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 14, gy);
    ctx.lineTo(x, gy - 34);
    ctx.lineTo(x + 14, gy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 7, gy - 18, 14, 5);
  } else if (k === 'lamp') {
    inkRect(x - 4, gy - 180, 8, 180, '#9aa3b5', 2.5);
    inkRect(x - 22, gy - 196, 44, 18, '#fff6c8', 3);
  } else if (k === 'panel') {
    inkRect(x - 40, gy - 150, 80, 90, '#9aa3b5', 3);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = ((fr >> 4) + i) % 3 ? '#3ec5ff' : '#ffd23f';
      ctx.fillRect(x - 30 + (i % 3) * 22, gy - 138 + Math.floor(i / 3) * 22, 14, 10);
    }
    ctx.fillStyle = '#ff4fa3';
    ctx.beginPath();
    ctx.arc(x, gy - 78, 7, 0, 7);
    ctx.fill();
  } else if (k === 'porthole') {
    // a small round window low on the wall
    ctx.fillStyle = '#1d2140';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, gy - 110, 22, 0, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 8, gy - 116, 2, 2);
    ctx.fillRect(x + 6, gy - 104, 2, 2);
  } else if (k === 'tank') {
    inkRect(x - 18, gy - 90, 36, 90, '#cfe9fb', 3);
    inkRect(x - 18, gy - 90, 36, 14, '#9aa3b5', 3);
  } else if (k === 'plant') {
    inkRect(x - 14, gy - 26, 28, 26, '#c99c6e', 3);
    ctx.strokeStyle = '#4f8f4f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (const a of [-0.6, 0, 0.6]) {
      ctx.moveTo(x, gy - 26);
      ctx.quadraticCurveTo(x + a * 30, gy - 50, x + a * 40, gy - 64);
    }
    ctx.stroke();
  } else if (k === 'crater') {
    ctx.fillStyle = '#a9adbb';
    ctx.strokeStyle = '#7d8193';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, gy + 10, 46 * s, 10, 0, 0, 7);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#eceef3';
    ctx.beginPath();
    ctx.ellipse(x, gy + 10, 46 * s, 10, 0, Math.PI, 0);
    ctx.stroke();
  } else if (k === 'moonrock') {
    ctx.fillStyle = '#b2b5c2';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 24 * s, gy);
    ctx.lineTo(x - 18 * s, gy - 22 * s);
    ctx.lineTo(x + 4 * s, gy - 30 * s);
    ctx.lineTo(x + 24 * s, gy - 14 * s);
    ctx.lineTo(x + 26 * s, gy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (k === 'moonflag') {
    ctx.strokeStyle = '#eceef3';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x, gy - 130);
    ctx.lineTo(x + 60, gy - 130);
    ctx.stroke();
    inkRect(x, gy - 128, 60, 36, '#ff4fa3', 3);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + 30, gy - 110, 8, 0, 7);
    ctx.fill();
  } else if (k === 'antenna') {
    ctx.strokeStyle = '#eceef3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 20, gy);
    ctx.lineTo(x, gy - 110);
    ctx.lineTo(x + 20, gy);
    ctx.moveTo(x - 12, gy - 50);
    ctx.lineTo(x + 12, gy - 50);
    ctx.stroke();
    ctx.fillStyle = (fr >> 4) % 2 ? '#ff4fa3' : '#ffd23f';
    ctx.beginPath();
    ctx.arc(x, gy - 114, 6, 0, 7);
    ctx.fill();
  } else if (k === 'lander') {
    ctx.strokeStyle = '#eceef3';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 30, gy - 40);
    ctx.lineTo(x - 50, gy);
    ctx.moveTo(x + 30, gy - 40);
    ctx.lineTo(x + 50, gy);
    ctx.stroke();
    inkRect(x - 36, gy - 90, 72, 52, '#ffd23f', 3);
    ctx.fillStyle = '#cfe9fb';
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.arc(x, gy - 90, 20, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  } else return false;
  return true;
}
// A glass bubble helmet around a fighter's head (on the moon), big enough for the biggest hair and hats: centred a
// little above and behind the head (o.hr = the head's radius from drawFig)
// Hats that stand tall or wide get a bigger bubble: [how far up its centre moves, its radius], in head radii
const HELM_FIT = {
  'hat-party': [1.2, 3.1],
  'hat-chef': [1.1, 3],
  'hat-top': [1.1, 3],
  'hat-wizard': [1.5, 3.5],
  'hat-halo': [1, 2.9],
  'hat-propeller': [0.9, 2.8],
  'hat-cowboy': [0.6, 2.9],
  'hat-viking': [0.7, 2.9]
};
function drawHelmet(f, o) {
  if (!helmOn || !o.hd || !o.hr || !BIOMES[segAt(f.x).b].helmet) return;
  const fit = HELM_FIT[f.look && f.look.hat && f.look.hat.id] || [0.55, 2.5],
    hx = o.hd[0] - (f.face || 1) * 0.1 * o.hr,
    hy = o.hd[1] - fit[0] * o.hr,
    r = fit[1] * o.hr;
  ctx.save();
  ctx.fillStyle = 'rgba(200,230,255,0.22)';
  ctx.strokeStyle = 'rgba(70,110,150,0.9)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(hx, hy, r, 0, 7);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(hx, hy, r * 0.75, -2.6, -1.9);
  ctx.stroke();
  ctx.restore();
}
