// StickFighters: the City story's places (drawing), its two transition scenes and Pink Kong's throw. Suburban
// Street (burbs): houses, lawns and picket fences. Downtown (city): the street everyone drives down (cars.js), shops
// and the skyline. The Skyscraper (tower): the climb up its fire escape (a climb biome, like the Mountainside: the
// game stays on flat ground and the drawing rises), the windows sliding by as you go up, Pink Kong on the roof.
LOOKS.burbs = { bg: () => drawBurbs(), fg: () => drawWoodsFg() };
LOOKS.city = { bg: () => drawCity(), fg: () => {} };
LOOKS.tower = { bg: () => drawTower(), fg: () => {} };
// ===== SUBURBAN STREET =====
const HOUSE_COLS = ['#f7d9c4', '#d9e8f5', '#fbeeb8', '#dcefd6', '#f2d6e6', '#e9e0f7'];
function drawBurbs() {
  paperBg();
  skyWash('#a7d3f2', '#f6f8ec', 0.4);
  // the next street over (1/8 speed): little roofs and treetops
  layer(0.12, 120, 301, (x, r) => {
    ctx.fillStyle = 'rgba(160,170,190,0.25)';
    ctx.beginPath();
    ctx.moveTo(x - 40, G - 70);
    ctx.lineTo(x, G - 100 - r * 20);
    ctx.lineTo(x + 40, G - 70);
    ctx.lineTo(x + 40, G - 30);
    ctx.lineTo(x - 40, G - 30);
    ctx.fill();
  });
  // the houses across the street (1/3 speed): walls, a roof, a door and windows, a chimney now and then
  layer(0.35, 290, 307, (x, r, i) => {
    const w = 170 + r * 50,
      h = 96 + r * 30,
      by = G - 18,
      c = HOUSE_COLS[((i % HOUSE_COLS.length) + HOUSE_COLS.length) % HOUSE_COLS.length];
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(70,60,80,0.7)';
    if (r > 0.6) inkRect(x + w * 0.22, by - h - 52, 18, 40, '#c9a48e', 2.5);
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.rect(x - w / 2, by - h, w, h);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = r < 0.5 ? '#b85c5c' : '#6f7d99';
    ctx.beginPath();
    ctx.moveTo(x - w / 2 - 14, by - h);
    ctx.lineTo(x, by - h - 56 - r * 14);
    ctx.lineTo(x + w / 2 + 14, by - h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    inkRect(x - 14, by - 46, 28, 46, '#8a5a3c', 2.5);
    for (const d of [-1, 1]) {
      inkRect(x + d * w * 0.3 - 16, by - h + 26, 32, 28, '#e8f4ff', 2.5);
      ctx.beginPath();
      ctx.moveTo(x + d * w * 0.3, by - h + 26);
      ctx.lineTo(x + d * w * 0.3, by - h + 54);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  // lawn, then the sidewalk the street is on
  ctx.fillStyle = '#d4ebc2';
  ctx.fillRect(-30, G - 18, W + 60, 24);
  ctx.fillStyle = '#e6e2dc';
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.strokeStyle = 'rgba(120,110,120,0.45)';
  ctx.lineWidth = 2;
  layer(1, 70, 311, x => {
    ctx.beginPath();
    ctx.moveTo(x, G + 6);
    ctx.lineTo(x - 18, G + 60);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.moveTo(-30, G + 60);
  ctx.lineTo(W + 30, G + 60);
  ctx.stroke();
  groundLine();
}
// ===== DOWNTOWN =====
function drawCity() {
  paperBg();
  skyWash('#b9d3ef', '#f4f1ea', 0.42);
  // the skyline far off (1/10 speed): tall towers, a few lit windows
  layer(0.1, 110, 321, (x, r) => {
    const h = 160 + r * 170,
      w = 60 + r * 40;
    ctx.fillStyle = 'rgba(150,160,185,0.35)';
    ctx.strokeStyle = 'rgba(110,120,150,0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x - w / 2, G - 30 - h, w, h);
    ctx.fill();
    ctx.stroke();
    if (r > 0.7) {
      ctx.beginPath();
      ctx.moveTo(x, G - 30 - h);
      ctx.lineTo(x, G - 60 - h);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,240,170,0.6)';
    for (let k = 0; k < 6; k++) {
      const q = hh(k * 7 + x * 0.01);
      if (q < 0.5) continue;
      ctx.fillRect(x - w / 2 + 8 + (k % 3) * (w / 3.2), G - 20 - h + 20 + Math.floor(k / 3) * 40, 8, 10);
    }
  });
  // shops along the street (2/5 speed): a front, an awning, a sign and a big window
  layer(0.4, 240, 331, (x, r, i) => {
    const w = 200,
      h = 150 + r * 60,
      by = G - 14,
      c = ['#f4c7c3', '#cfe0f5', '#f7e2a8', '#d5ecd0', '#e8d5f2'][((i % 5) + 5) % 5];
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = 'rgba(60,50,70,0.75)';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.rect(x - w / 2, by - h, w, h);
    ctx.fill();
    ctx.stroke();
    // upstairs windows
    for (let k = 0; k < 3; k++) inkRect(x - w / 2 + 22 + k * 56, by - h + 16, 34, 30, '#e8f4ff', 2);
    // the awning, striped
    const ay = by - 96;
    for (let k = 0; k < 8; k++) {
      ctx.fillStyle = k % 2 ? '#fff8ec' : r < 0.5 ? '#e8504a' : '#3f8fd8';
      ctx.beginPath();
      ctx.moveTo(x - w / 2 + k * 25, ay);
      ctx.lineTo(x - w / 2 + (k + 1) * 25, ay);
      ctx.lineTo(x - w / 2 + (k + 1) * 25 + 4, ay + 22);
      ctx.lineTo(x - w / 2 + k * 25 + 4, ay + 22);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeRect(x - w / 2, ay, w + 4, 22);
    inkRect(x - w / 2 + 16, ay + 30, 110, 54, '#e8f4ff', 2.5);
    inkRect(x + 44, ay + 30, 34, 66, '#8a6a5c', 2.5);
    ctx.globalAlpha = 1;
  });
  // the sidewalk and its curb, then the road with its middle line
  ctx.fillStyle = '#e8e3dc';
  ctx.fillRect(-30, G - 14, W + 60, 20);
  ctx.fillStyle = '#c9c4cf';
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.strokeStyle = 'rgba(90,85,100,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-30, G - 14);
  ctx.lineTo(W + 30, G - 14);
  ctx.stroke();
  ctx.strokeStyle = '#fff8ec';
  ctx.lineWidth = 5;
  layer(1, 90, 337, x => {
    ctx.beginPath();
    ctx.moveTo(x - 24, G + 52);
    ctx.lineTo(x + 24, G + 52);
    ctx.stroke();
  });
  groundLine();
}
// ===== THE SKYSCRAPER =====
// The tower's wall is part of the climb: a window at height A above the street shows at G - A + (how high you've
// climbed), so the windows slide down past you as you go up the fire escape.
const TOWER_ROW = 120;
function drawTower() {
  const cx = CAM.x,
    up = slopeRef,
    dy = Math.min(320, up * 0.35);
  paperBg();
  skyWash('#9cc8f0', '#eef5fb', 0.5);
  // the city far below, sinking as you climb
  layer(0.08, 100, 341, (x, r) => {
    const h = 120 + r * 160;
    ctx.fillStyle = 'rgba(150,160,185,0.3)';
    ctx.fillRect(x - 30, G + 20 + dy - h, 60, h + 400);
  });
  // a cloud or two drifting by up here
  layer(0.05, 420, 343, (x, r) => {
    if (r < 0.4) return;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.ellipse(x, 90 + r * 60 + dy * 0.3, 60, 16, 0, 0, 7);
    ctx.ellipse(x + 30, 80 + r * 60 + dy * 0.3, 36, 14, 0, 0, 7);
    ctx.fill();
  });
  // the tower's wall: one panel per 200 px, rows of windows by height
  const x0 = Math.floor((cx - 40) / 200) * 200;
  for (let wx = x0; wx < cx + W + 200; wx += 200) {
    const sx = wx - cx;
    ctx.fillStyle = '#e6e1ea';
    ctx.fillRect(sx, -30, 200, H + 60);
    ctx.strokeStyle = 'rgba(110,100,125,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, -30);
    ctx.lineTo(sx, H + 30);
    ctx.stroke();
    const r0 = Math.floor((up - 80) / TOWER_ROW) - 1;
    for (let row = r0; row < r0 + 7; row++) {
      const y = G - row * TOWER_ROW + up - 100;
      if (y < -90 || y > H + 10) continue;
      for (const k of [0, 1]) {
        const lit = hh(row * 13 + wx * 0.07 + k) > 0.7;
        inkRect(sx + 26 + k * 92, y, 58, 70, lit ? '#fff3b0' : '#cfe3f5', 2.5);
        ctx.strokeStyle = 'rgba(28,22,38,0.4)';
        ctx.beginPath();
        ctx.moveTo(sx + 55 + k * 92, y);
        ctx.lineTo(sx + 55 + k * 92, y + 70);
        ctx.stroke();
      }
    }
  }
  // the fire escape: a grated walkway following the climb, with its railing
  const pts = [];
  for (let sx = -30; sx <= W + 30; sx += 15) pts.push([sx, G + 6 + upAt(cx + sx)]);
  ctx.fillStyle = 'rgba(70,64,80,0.12)';
  ctx.beginPath();
  ctx.moveTo(-30, H + 30);
  for (const [px, py] of pts) ctx.lineTo(px, py);
  ctx.lineTo(W + 30, H + 30);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5d5668';
  ctx.lineWidth = 3;
  layer(1, 32, 347, x => {
    const y = G + 6 + upAt(cx + x);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 38);
    ctx.moveTo(x, y);
    ctx.lineTo(x + 16, y + 22);
    ctx.stroke();
  });
  ctx.lineWidth = 3;
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py - 38) : ctx.moveTo(px, py - 38)));
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.stroke();
}
// ===== SCENERY =====
// The City's props (drawBiomeProp in biomes.js hands them here); false = not one of ours
function drawCityProp(k, x, s) {
  const gy = G + 6;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (k === 'mailbox') {
    inkRect(x - 3, gy - 70 * s, 6, 70 * s, '#8a6a5c', 2.5);
    ctx.fillStyle = '#5b8fd8';
    ctx.beginPath();
    ctx.moveTo(x - 20 * s, gy - 70 * s);
    ctx.lineTo(x - 20 * s, gy - 92 * s);
    ctx.arc(x, gy - 92 * s, 20 * s, Math.PI, 0);
    ctx.lineTo(x + 20 * s, gy - 70 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    inkRect(x + 18 * s, gy - 104 * s, 5, 18, '#e8504a', 2);
  } else if (k === 'picket') {
    // a stretch of white picket fence
    const n = 6,
      w = 22 * s;
    ctx.fillStyle = '#fffdf6';
    for (let i = 0; i < n; i++) {
      const px = x - (n * w) / 2 + i * w;
      ctx.beginPath();
      ctx.moveTo(px + 3, gy);
      ctx.lineTo(px + 3, gy - 50 * s);
      ctx.lineTo(px + w / 2, gy - 62 * s);
      ctx.lineTo(px + w - 3, gy - 50 * s);
      ctx.lineTo(px + w - 3, gy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    inkRect(x - (n * w) / 2, gy - 40 * s, n * w, 7, '#fffdf6', 2.5);
  } else if (k === 'hedge') {
    blob(
      [
        [x - 34 * s, gy - 26 * s, 28 * s],
        [x, gy - 34 * s, 32 * s],
        [x + 34 * s, gy - 26 * s, 28 * s]
      ],
      '#a8d08f',
      '#5f8f4f',
      3
    );
  } else if (k === 'streetlamp') {
    inkRect(x - 4, gy - 190 * s, 8, 190 * s, '#5d5668', 2.5);
    ctx.beginPath();
    ctx.moveTo(x, gy - 186 * s);
    ctx.quadraticCurveTo(x + 30 * s, gy - 206 * s, x + 44 * s, gy - 186 * s);
    ctx.stroke();
    ctx.fillStyle = '#fff3b0';
    ctx.beginPath();
    ctx.ellipse(x + 44 * s, gy - 180 * s, 12 * s, 7 * s, 0, 0, 7);
    ctx.fill();
    ctx.stroke();
  } else if (k === 'hydrant') {
    ctx.fillStyle = '#e8504a';
    ctx.beginPath();
    ctx.moveTo(x - 12 * s, gy);
    ctx.lineTo(x - 12 * s, gy - 34 * s);
    ctx.arc(x, gy - 34 * s, 12 * s, Math.PI, 0);
    ctx.lineTo(x + 12 * s, gy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    inkRect(x - 18 * s, gy - 30 * s, 36 * s, 8, '#e8504a', 2.5);
  } else if (k === 'trashcan') {
    inkRect(x - 18 * s, gy - 48 * s, 36 * s, 48 * s, '#8fa0a8', 2.5);
    inkRect(x - 21 * s, gy - 54 * s, 42 * s, 8, '#7a8a92', 2.5);
    ctx.beginPath();
    for (const d of [-8, 0, 8]) {
      ctx.moveTo(x + d * s, gy - 42 * s);
      ctx.lineTo(x + d * s, gy - 6);
    }
    ctx.stroke();
  } else if (k === 'trafficlight') {
    inkRect(x - 4, gy - 200 * s, 8, 200 * s, '#5d5668', 2.5);
    inkRect(x - 14 * s, gy - 250 * s, 28 * s, 64 * s, '#3a3442', 2.5);
    // red, yellow, green: which is lit goes round (drawing only, from the frame count)
    const on = Math.floor(fr / 150) % 3;
    ['#ff5a4f', '#ffd23f', '#4fd26a'].forEach((c, i) => {
      ctx.fillStyle = on === i ? c : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(x, gy - 238 * s + i * 20 * s, 7 * s, 0, 7);
      ctx.fill();
      ctx.stroke();
    });
  } else if (k === 'bench') {
    inkRect(x - 44 * s, gy - 36 * s, 88 * s, 8, '#b98a5c', 2.5);
    inkRect(x - 44 * s, gy - 62 * s, 88 * s, 8, '#b98a5c', 2.5);
    ctx.beginPath();
    for (const d of [-36, 36]) {
      ctx.moveTo(x + d * s, gy - 28 * s);
      ctx.lineTo(x + d * s, gy);
      ctx.moveTo(x + d * s, gy - 36 * s);
      ctx.lineTo(x + d * s, gy - 62 * s);
    }
    ctx.stroke();
  } else if (k === 'newsbox') {
    inkRect(x - 16 * s, gy - 56 * s, 32 * s, 44 * s, '#3f8fd8', 2.5);
    inkRect(x - 10 * s, gy - 50 * s, 20 * s, 14 * s, '#e8f4ff', 2);
    ctx.beginPath();
    ctx.moveTo(x - 12 * s, gy - 12 * s);
    ctx.lineTo(x - 12 * s, gy);
    ctx.moveTo(x + 12 * s, gy - 12 * s);
    ctx.lineTo(x + 12 * s, gy);
    ctx.stroke();
  } else if (k === 'acunit') {
    inkRect(x - 32 * s, gy - 46 * s, 64 * s, 46 * s, '#d9d4de', 2.5);
    ctx.beginPath();
    for (let i = 1; i < 6; i++) {
      ctx.moveTo(x - 26 * s, gy - 46 * s + i * 7 * s);
      ctx.lineTo(x + 26 * s, gy - 46 * s + i * 7 * s);
    }
    ctx.stroke();
  } else if (k === 'pottedplant') {
    ctx.fillStyle = '#c97a4a';
    ctx.beginPath();
    ctx.moveTo(x - 16 * s, gy - 30 * s);
    ctx.lineTo(x + 16 * s, gy - 30 * s);
    ctx.lineTo(x + 11 * s, gy);
    ctx.lineTo(x - 11 * s, gy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    blob(
      [
        [x - 10 * s, gy - 44 * s, 14 * s],
        [x + 10 * s, gy - 46 * s, 14 * s],
        [x, gy - 58 * s, 15 * s]
      ],
      '#a8d08f',
      '#5f8f4f',
      2.5
    );
  } else if (k === 'satdish') {
    inkRect(x - 3, gy - 50 * s, 6, 50 * s, '#8a8494', 2.5);
    ctx.fillStyle = '#eef0f4';
    ctx.beginPath();
    ctx.ellipse(x - 6 * s, gy - 70 * s, 26 * s, 14 * s, -0.6, 0, 7);
    ctx.fill();
    ctx.stroke();
  } else if (k === 'watertank') {
    for (const d of [-26, 26]) {
      ctx.beginPath();
      ctx.moveTo(x + d * s, gy);
      ctx.lineTo(x + d * 0.7 * s, gy - 60 * s);
      ctx.stroke();
    }
    inkRect(x - 34 * s, gy - 130 * s, 68 * s, 70 * s, '#c9a07a', 2.5);
    ctx.fillStyle = '#a97f5c';
    ctx.beginPath();
    ctx.moveTo(x - 38 * s, gy - 130 * s);
    ctx.lineTo(x, gy - 156 * s);
    ctx.lineTo(x + 38 * s, gy - 130 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (k === 'antenna') {
    ctx.beginPath();
    ctx.moveTo(x - 20 * s, gy);
    ctx.lineTo(x, gy - 170 * s);
    ctx.lineTo(x + 20 * s, gy);
    ctx.moveTo(x - 12 * s, gy - 60 * s);
    ctx.lineTo(x + 12 * s, gy - 60 * s);
    ctx.moveTo(x - 7 * s, gy - 110 * s);
    ctx.lineTo(x + 7 * s, gy - 110 * s);
    ctx.stroke();
    ctx.fillStyle = Math.floor(fr / 30) % 2 ? '#ff5a4f' : '#7a2020';
    ctx.beginPath();
    ctx.arc(x, gy - 174 * s, 6, 0, 7);
    ctx.fill();
    ctx.stroke();
  } else if (k === 'trans-cars') drawCarPark(x);
  else if (k === 'trans-park') drawTowerDoor(x);
  else return false;
  return true;
}
// The car park: a concrete garage with a big door and a sign; everyone walks in
function drawCarPark(x) {
  const gy = G + 6;
  inkRect(x - 150, gy - 230, 300, 230, '#d6d1cc', 3);
  for (let i = 0; i < 3; i++) inkRect(x - 130, gy - 216 + i * 46, 260, 30, '#b9b3ae', 2.5);
  inkRect(x - 70, gy - 96, 140, 96, '#4a4452', 3);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 1; i < 6; i++) {
    ctx.moveTo(x - 68, gy - 96 + i * 16);
    ctx.lineTo(x + 68, gy - 96 + i * 16);
  }
  ctx.stroke();
  inkRect(x - 60, gy - 290, 120, 44, '#3f8fd8', 3);
  ctx.fillStyle = '#fff';
  ctx.font = '900 26px Impact,"Arial Black",sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('P', x - 34, gy - 258);
  ctx.font = '900 16px Impact,"Arial Black",sans-serif';
  ctx.fillText('PARKING', x + 14, gy - 262);
}
// The skyscraper's front door: glass doors under an awning, the tower going up out of sight
function drawTowerDoor(x) {
  const gy = G + 6;
  inkRect(x - 170, -40, 340, gy + 40, '#e6e1ea', 3);
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) inkRect(x - 150 + c * 78, 20 + r * 90, 56, 64, '#cfe3f5', 2.5);
  inkRect(x - 60, gy - 120, 120, 120, '#bfe0f7', 3);
  ctx.beginPath();
  ctx.moveTo(x, gy - 120);
  ctx.lineTo(x, gy);
  ctx.stroke();
  ctx.fillStyle = '#ffb400';
  ctx.beginPath();
  ctx.moveTo(x - 90, gy - 128);
  ctx.lineTo(x + 90, gy - 128);
  ctx.lineTo(x + 76, gy - 150);
  ctx.lineTo(x - 76, gy - 150);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = '900 16px Impact,"Arial Black",sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TOWER', x, gy - 133);
}
// ===== THE SCENES =====
// cars: everyone walks into the car park, then drives out into Downtown, each in their own car.
// park: everyone pulls up at the skyscraper, hops out (the cars stay parked) and runs in the door.
// Returns false for any other scene (run.js goes on to the volcano's).
function cityCine(c, t, ps) {
  if (c.k === 'cars') {
    const tr = c.tr;
    ps.forEach((p, i) => {
      if (t <= 40) {
        p.x = p.sx + (tr.x - 30 - i * 20 - p.sx) * ease(t / 30);
        p.face = 1;
      }
      if (t === 40 + i * 8 && !p.hide) {
        p.hide = 1;
        sfx(500 - i * 40, 0.1, 'square', 0.04);
      }
    });
    if (t === 80) {
      cineArrive(tr);
      ps.forEach(p => (p.hide = 1));
    }
    ps.forEach((p, i) => {
      if (t === 90 + i * 16) {
        // out they drive, honking
        p.hide = 0;
        p.x = tr.nx + 60;
        p.y = G;
        carGive(p);
        p.vx = 9;
        p.face = 1;
        sfx(440, 0.14, 'square', 0.05);
        sfx(554, 0.14, 'square', 0.05);
      }
    });
    if (t >= 90 + ps.length * 16 + 30) {
      cineEnd();
      bn('DRIVE!');
    }
    return true;
  }
  if (c.k === 'park') {
    const tr = c.tr;
    if (!c.parked) c.parked = [];
    ps.forEach((p, i) => {
      const stop = tr.x - 150 - i * 150;
      if (t <= 40 && p.car) {
        p.x = p.sx + (stop - p.sx) * ease(t / 40);
        p.face = 1;
        p.y = G;
      }
      if (t === 34 && i === 0) {
        // brakes
        sfx(1300, 0.35, 'sawtooth', 0.03, -500);
        noise(0.3, 0.06, 2500);
      }
      if (t === 50 + i * 10 && p.car) {
        // out they hop; the car stays where it stopped
        c.parked.push({ x: p.x, face: p.face, m: p.car.m, col: p.col });
        p.car = null;
        p.y = G - 40;
        sfx(600 + i * 60, 0.08, 'square', 0.04, 200);
      }
      if (t > 50 + i * 10 && t <= 110 && !p.hide) {
        p.y = Math.min(G, p.y + 6);
        p.x += Math.max(1.5, (tr.x - p.x) * 0.08);
        p.face = 1;
        if (p.x >= tr.x - 20) {
          p.hide = 1;
          sfx(400, 0.08, 'square', 0.03);
        }
      }
    });
    if (t === 120) {
      cineArrive(tr);
      ps.forEach(p => (p.hide = 1));
      c.parked = [];
    }
    ps.forEach((p, i) => {
      if (t === 126 + i * 10) {
        p.hide = 0;
        p.car = null;
        p.y = G;
        p.st = 'free';
        ring(p.x, G - 45, 36);
        sfx(520 + i * 60, 0.1, 'square', 0.04, 200);
      }
    });
    if (t >= 126 + ps.length * 10 + 30) {
      cineEnd();
      bn('CLIMB THE TOWER!');
    }
    return true;
  }
  return false;
}
// The scenes' own pieces (drawCine in run.js): the cars left parked at the skyscraper. False = none here.
function drawCityCine(c) {
  if (c.k !== 'park' || !c.parked) return false;
  for (const q of c.parked) drawCar({ x: q.x, y: G, face: q.face, col: q.col, vy: 0, car: { m: q.m, tb: 0, sh: 0 } }, 1);
  return true;
}
// ===== PINK KONG'S THROW =====
// A move with `drop` (data/enemies.js) throws something that falls where the thrower aimed (e.tgx), with a shadow
// first, landing like the volcano's lava rocks (LV.rk in volcano.js): it hits everyone under it, players and the pink
// army alike.
function dropThrow(f, k) {
  if (!LV || MODE !== LEVEL) return;
  const R = LV.rk || (LV.rk = { n: 1e9, list: [] }),
    x = Math.round(Math.max(WB.l + 40, Math.min(WB.r - 40, f.tgx === undefined ? f.x + f.face * 250 : f.tgx)));
  R.list.push({ x, t: 25, k });
  sfx(220, 0.25, 'sawtooth', 0.05, 120);
}
// An air conditioner coming down (y = its bottom), or (landed) lying smashed on the roof
function drawDropAC(x, y, landed) {
  ctx.save();
  ctx.translate(x, y);
  if (landed) ctx.rotate(0.12);
  inkRect(-30, -40, 60, 40, '#d9d4de', 3);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 1; i < 5; i++) {
    ctx.moveTo(-24, -40 + i * 8);
    ctx.lineTo(24, -40 + i * 8);
  }
  ctx.stroke();
  ctx.restore();
}
