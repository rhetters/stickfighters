// StickFighters: driving (Downtown, and any place with `drive` in data/themes.js). Each player gets a car there: one
// of the models in data/cars.js, picked with rnd() so every device online gets the same, painted in the player's
// colour. Left and right drive, Jump hops, Punch or Kick honks a turbo burst. A car can't be hurt; driving into the
// pink army sends them flying (and the flying bodies bowl into others, combat.js). The car is the player's state
// (f.car, plain data); updP hands a player in a car to carTick instead of the usual moves.
// ===== GETTING IN AND OUT =====
// A sitting pose for the driver: hands forward on the wheel, knees bent
const SEAT = [4, 70, 70, 60, 80, 85, 0, 80, 5, 0];
function carGive(f) {
  f.car = { m: Math.floor(rnd() * CARS.length), tb: 0, tc: 0, sh: 0 };
  f.att = null;
  f.st = 'free';
  f.vx = 0;
  f.vy = 0;
}
function carTake(f) {
  f.car = null;
  f.vy = -6; // hops out
}
// Once a step: everyone in a driving place has a car, everyone out of one doesn't (a scene moving a player out of
// Downtown takes the car away as it starts; the car park scene hands them out itself)
function carsTick() {
  if (!LV || !LV.segs) return;
  for (const p of PL) {
    if (p.st === 'dead') continue;
    const drive = !!BIOMES[segAt(p.x).b].drive;
    if (p.st === 'cine') {
      if (p.car && LV.cine && LV.cine.k !== 'park' && LV.cine.k !== 'cars') p.car = null;
      continue;
    }
    if (drive && !p.car) {
      carGive(p);
      ring(p.x, G - 40, 50);
    } else if (!drive && p.car) carTake(p);
  }
}
// ===== DRIVING =====
const CAR_TURBO = 36, // frames a turbo burst lasts
  CAR_TURBO_CD = 110, // and before the next one
  CAR_HIT = 24; // frames before the same car can hit the same enemy again
function carTick(f, I) {
  const C = f.car,
    M = CARS[C.m],
    K = I.K;
  if (C.tc > 0) C.tc--;
  if (C.tb > 0) C.tb--;
  if (C.sh > 0) C.sh--;
  f.st = 'free';
  f.att = null;
  const dir = (K.r ? 1 : 0) - (K.l ? 1 : 0),
    ground = f.y >= f.gy - 1,
    surge = !!K.s, // holding Surge: a steady boost while held
    top = M.top * (C.tb > 0 ? 1.6 : surge ? 1.45 : 1);
  C.sg = surge && Math.abs(f.vx) > 2; // drawn with flames
  if (dir) f.face = dir;
  if (C.tb > 0) f.vx += (f.face * top - f.vx) * 0.3;
  else if (surge) f.vx += (f.face * top - f.vx) * 0.12;
  else if (dir) f.vx += dir * M.acc * (ground ? 1 : 0.4);
  else if (ground) f.vx *= 0.93;
  f.vx = Math.max(-top, Math.min(top, f.vx));
  if (ground && wantIn(I, 'j')) {
    eatIn(I, 'j');
    f.vy = -10.5;
    sfx(300, 0.12, 'square', 0.04, 200);
  }
  if (C.tc <= 0 && (wantIn(I, 'p') || wantIn(I, 'k'))) {
    eatIn(I, 'p');
    eatIn(I, 'k');
    C.tb = CAR_TURBO;
    C.tc = CAR_TURBO_CD;
    // the horn, then the burst
    sfx(440, 0.16, 'square', 0.05);
    sfx(554, 0.16, 'square', 0.05);
    noise(0.25, 0.06, 900);
  }
  const vx0 = f.vx,
    imp = phys(f);
  // a car is long: keep all of it inside the walls, and bounce off them
  const half = (M.body[M.body.length - 1][0] - M.body[0][0]) / 2;
  if (f.x - half < WB.l || f.x + half > WB.r) {
    f.x = Math.max(WB.l + half, Math.min(WB.r - half, f.x));
    if (Math.abs(vx0) > 3) C.sh = 8;
    f.vx = -vx0 * 0.25;
  }
  if (imp > 6) {
    C.sh = 6;
    dust(f.x, G, 4);
  }
  carRam(f, C, M);
  smooth(f, SEAT, 0.3);
}
// Driving into enemies: anyone in front of a moving car is sent flying, harder the faster it goes (turbo hits
// hardest). Credited to the driver like any hit, so the stars and XP are the usual.
function carRam(f, C, M) {
  const sp = Math.abs(f.vx);
  if (sp < 2.5) return;
  const dr = Math.sign(f.vx),
    nose = f.x + dr * (Math.max(...M.body.map(p => p[0])) - 6),
    turbo = C.tb > 0;
  for (const e of E) {
    if (e.dying || e.gone || e.corpse || e.st === 'cine' || (e.ram || 0) > fr) continue;
    const ahead = (e.x - f.x) * dr;
    if (ahead < -10 || Math.abs(e.x - nose) > 34 + sp * 2 || e.y < f.y - 120) continue;
    e.ram = fr + CAR_HIT;
    hurtE(
      e,
      {
        dmg: Math.round((12 + sp * 3) * (turbo ? 1.5 : 1)),
        kb: 9 + sp * (turbo ? 1.6 : 1.2),
        lift: -7 - sp * 0.6,
        ef: 'launch',
        w: 'H'
      },
      dr,
      f,
      f
    );
    f.vx *= 0.9;
    C.sh = 6;
    shake = Math.max(shake, turbo ? 10 : 6);
    ring(e.x, e.y - 40, 46);
    sfx(120, 0.2, 'sawtooth', 0.08, -60);
    noise(0.15, 0.1, 500);
  }
}
// An enemy's hit on a player in a car does nothing but rock it a little
function carBump(q) {
  q.car.sh = 8;
  sfx(200, 0.06, 'square', 0.03);
}
// ===== DRAWING =====
// The driver (drawn sitting, a bit smaller), then the car around them: the painted shell with the window cut out, the
// glass, wheels that turn as it moves, and the model's own bits. Drawing only: nothing here changes the game.
// empty = a parked car, nobody in it.
function drawCar(f, empty) {
  const C = f.car,
    M = CARS[C.m],
    fc = f.face,
    rock = C.sh > 0 ? Math.sin(C.sh * 1.7) * 0.03 : 0,
    col = f.col || '#3ec5ff',
    dark = mixC(col, '#1c1626', 0.35),
    k = 0.92; // the driver's size in the car
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.scale(fc, 1);
  ctx.rotate(rock - Math.max(-0.12, Math.min(0.12, f.vy * 0.012)));
  // the driver: drawn by the usual fighter drawing, moved into the seat
  if (!empty) {
    ctx.save();
    ctx.translate(M.seat[0], M.seat[1]);
    ctx.scale(k * fc, k);
    ctx.translate(-f.x, -f.y);
    f.car = null;
    try {
      drawF(f);
    } finally {
      f.car = C;
    }
    ctx.restore();
  }
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // the shell, with the window cut out so the driver shows
  ctx.beginPath();
  M.body.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  if (M.win) {
    M.win.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
  } else {
    // open top: cut the cockpit out
    ctx.rect(M.seat[0] - 26, M.body.reduce((a, p) => Math.min(a, p[1]), 0) - 2, 52, 20);
  }
  ctx.fillStyle = col;
  ctx.fill('evenodd');
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.stroke();
  if (M.win) {
    ctx.beginPath();
    M.win.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fillStyle = 'rgba(190,225,255,0.35)';
    ctx.fill();
    ctx.stroke();
    // a shine on the glass
    const [a, b] = [M.win[1], M.win[2]];
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(a[0] + 6, a[1] + 8);
    ctx.lineTo(a[0] + 14, b[1] + 2);
    ctx.stroke();
  }
  carExtras(M, col, dark);
  // a door line, a handle, lights
  const by = M.body[0][1],
    lo = Math.max(...M.body.map(p => p[0])),
    hi = Math.min(...M.body.map(p => p[0]));
  ctx.strokeStyle = dark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(M.seat[0] - 8, by - 4);
  ctx.lineTo(M.seat[0] - 8, by - 26);
  ctx.moveTo(M.seat[0] + 4, by - 20);
  ctx.lineTo(M.seat[0] + 12, by - 20);
  ctx.stroke();
  ctx.fillStyle = '#fff3b0';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(lo - 4, by - 18, 4, 6, 0, 0, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ff6b6b';
  ctx.beginPath();
  ctx.ellipse(hi + 4, by - 18, 3, 5, 0, 0, 7);
  ctx.fill();
  ctx.stroke();
  // wheels: they turn with how far the car has gone
  for (const [wx, wr] of M.wheels) {
    ctx.save();
    ctx.translate(wx, -wr);
    ctx.rotate((f.x / wr) * fc);
    ctx.fillStyle = '#2b2533';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, wr, 0, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#d9d4de';
    ctx.beginPath();
    ctx.arc(0, 0, wr * 0.48, 0, 7);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-wr * 0.48, 0);
    ctx.lineTo(wr * 0.48, 0);
    ctx.moveTo(0, -wr * 0.48);
    ctx.lineTo(0, wr * 0.48);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  // turbo or Surge: flames out the back (cosmetic: Math.random is fine in drawing)
  if (C.tb > 0 || C.sg) {
    const bx = f.x - fc * ((lo - hi) / 2 + 6);
    ctx.save();
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i ? '#ffd23f' : '#ff7a00';
      ctx.beginPath();
      ctx.moveTo(bx, f.y - 26 + i * 6);
      ctx.lineTo(bx - fc * (26 + Math.random() * 26 - i * 8), f.y - 20 + i * 4);
      ctx.lineTo(bx, f.y - 14 + i * 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}
// The bits that make each model its own
function carExtras(M, col, dark) {
  const top = M.body.reduce((a, p) => Math.min(a, p[1]), 0),
    lo = Math.max(...M.body.map(p => p[0])),
    hi = Math.min(...M.body.map(p => p[0])),
    by = M.body[0][1],
    X = new Set(M.extra),
    box = (x, y, w, h, c) => {
      ctx.fillStyle = c;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.fill();
      ctx.stroke();
    };
  if (X.has('spoiler')) {
    box(hi + 2, top + 20, 26, 6, dark);
    ctx.beginPath();
    ctx.moveTo(hi + 10, top + 26);
    ctx.lineTo(hi + 12, top + 30);
    ctx.stroke();
  }
  if (X.has('stripe')) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(hi + 6, by - 22);
    ctx.lineTo(lo - 8, by - 22);
    ctx.stroke();
  }
  if (X.has('bed')) box(hi + 4, by - 40, 60, 10, dark);
  if (X.has('rack')) {
    box(hi + 10, top - 8, 80, 5, '#8a8494');
    ctx.beginPath();
    ctx.moveTo(hi + 16, top - 3);
    ctx.lineTo(hi + 16, top);
    ctx.moveTo(hi + 84, top - 3);
    ctx.lineTo(hi + 84, top);
    ctx.stroke();
  }
  if (X.has('rollbar')) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(M.seat[0] - 30, top + 2);
    ctx.lineTo(M.seat[0] - 26, top - 30);
    ctx.lineTo(M.seat[0] + 22, top - 30);
    ctx.lineTo(M.seat[0] + 26, top + 2);
    ctx.stroke();
    ctx.strokeStyle = '#8a8494';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  if (X.has('spare')) {
    // the spare tyre on the back door, seen edge-on from the side: a tall rounded band with its tread, on a bracket
    const sx = hi - 13,
      sy = by - 50,
      sw = 13,
      sh = 32;
    box(hi - 3, sy + sh / 2 - 4, 4, 8, '#8a8494');
    ctx.fillStyle = '#2b2533';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 6);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#5a5262';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 1; i < 5; i++) {
      ctx.moveTo(sx + 3, sy + (sh * i) / 5);
      ctx.lineTo(sx + sw - 3, sy + (sh * i) / 5);
    }
    ctx.stroke();
  }
  if (X.has('taxisign')) {
    box(-14, top - 14, 28, 13, '#fff3b0');
    ctx.fillStyle = INK;
    ctx.font = '900 9px Impact,"Arial Black",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TAXI', 0, top - 4);
  }
  if (X.has('checks')) {
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? '#1c1626' : '#fff';
      ctx.fillRect(hi + 14 + i * 12, by - 30, 12, 6);
    }
  }
  if (X.has('cone')) {
    // a big ice cream cone on the roof
    ctx.fillStyle = '#e6b36a';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-34, top);
    ctx.lineTo(-26, top - 26);
    ctx.lineTo(-42, top - 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffd6ea';
    ctx.beginPath();
    ctx.arc(-34, top - 32, 11, 0, 7);
    ctx.fill();
    ctx.stroke();
  }
  if (X.has('serve')) box(hi + 20, top + 22, 52, 30, '#fff8ec');
  if (X.has('lights')) for (const x of [-12, 4, 20]) box(x, top - 8, 10, 7, '#fff3b0');
  if (X.has('round')) {
    ctx.strokeStyle = dark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, by - 6, 46, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }
}
