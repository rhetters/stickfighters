// StickFighters: driving (Downtown, and any place with `drive` in data/themes.js). Each player gets a car there: one
// of the models in data/cars.js, picked with rnd() so every device online gets the same, painted in the player's
// colour. Left and right drive, Jump hops, Punch or Kick honks a turbo burst. A car can't be hurt; driving into the
// pink army sends them flying (and the flying bodies bowl into others, combat.js). The car is the player's state
// (f.car, plain data); updP hands a player in a car to carTick instead of the usual moves.
// ===== GETTING IN AND OUT =====
// A sitting pose for the driver: hands forward on the wheel, knees bent
const SEAT = [4, 70, 70, 60, 80, 85, 0, 80, 5, 0];
// Each player keeps the model they were first given for the whole run (carM), so a car handed back is their own
function carGive(f) {
  if (f.carM === undefined) f.carM = Math.floor(rnd() * CARS.length);
  f.car = { m: f.carM, tb: 0, tc: 0, sh: 0 };
  f.att = null;
  f.st = 'free';
  f.vx = 0;
  f.vy = 0;
}
function carTake(f) {
  f.car = null;
  f.vy = -6; // hops out
}
// Once a step: everyone in a driving place has a car, everyone out of one doesn't (a transition scene moving a
// player out of Downtown takes the car away as it starts; the car park scene hands them out itself; a boss's
// entrance leaves you in your car)
function carsTick() {
  if (!LV || !LV.segs) return;
  for (const p of PL) {
    if (p.st === 'dead') continue;
    const drive = !!BIOMES[segAt(p.x).b].drive;
    if (p.st === 'cine') {
      if (p.car && LV.cine && TRANSITIONS[LV.cine.k] && LV.cine.k !== 'park' && LV.cine.k !== 'cars') p.car = null;
      continue;
    }
    if (drive && !p.car) {
      carGive(p);
      ring(p.x, G - 40, 50);
    } else if (!drive && p.car) carTake(p);
  }
}
// ===== DRIVING =====
// Left / Right drive, Jump hops (and once more in the air), holding Surge goes faster and hits harder (the car's
// outline glows), Punch headbutts with the hood and Kick with the trunk (that end of the car bumps up), and ULT, with
// a full meter, does the model's own move (CAR_ULTS). Anything a moving car drives into is sent flying.
const CAR_HIT = 24, // frames before the same car can hit the same enemy again
  CAR_BUMP = 16, // a hood or trunk bump's frames
  CAR_BUMP_CD = 24, // and before the next one
  CAR_SURGE = 1.5; // Surge: top speed, and damage, times this
function carTick(f, I) {
  const C = f.car,
    M = CARS[C.m],
    K = I.K;
  if (C.tb > 0) C.tb--;
  if (C.sh > 0) C.sh--;
  if (C.bc > 0) C.bc--;
  f.st = 'free';
  f.att = null;
  const dir = (K.r ? 1 : 0) - (K.l ? 1 : 0),
    ground = f.y >= f.gy - 1,
    surge = !!K.s,
    top = M.top * (surge ? CAR_SURGE : 1);
  C.sg = surge; // drawn as the glowing outline, and flames when moving
  if (ground) C.dj = 0;
  if (C.ut > 0) carUlt(f, C, M);
  else {
    if (dir) f.face = dir;
    if (surge && (dir || Math.abs(f.vx) > 1)) f.vx += ((dir || f.face) * top - f.vx) * 0.12;
    else if (dir) f.vx += dir * M.acc * (ground ? 1 : 0.4);
    else if (ground) f.vx *= 0.93;
    f.vx = Math.max(-top, Math.min(top, f.vx));
    if (wantIn(I, 'j') && (ground || !C.dj)) {
      eatIn(I, 'j');
      if (!ground) {
        C.dj = 1; // the second hop, in the air
        ring(f.x, f.y - 20, 50);
      }
      f.vy = ground ? -10.5 : -9.5;
      sfx(ground ? 300 : 420, 0.12, 'square', 0.04, 200);
    }
    // Punch: the hood; Kick: the trunk
    for (const b of ['p', 'k'])
      if (!C.bc && wantIn(I, b)) {
        eatIn(I, b);
        C.bp = b;
        C.bt = CAR_BUMP;
        C.bc = CAR_BUMP_CD;
        sfx(b === 'p' ? 180 : 150, 0.12, 'square', 0.05, -60);
      }
    // ULT: the model's own move, with a full meter
    if (wantIn(I, 'x') && f.meter >= 100) {
      eatIn(I, 'x');
      f.meter = 0;
      C.ut = CAR_ULTS[M.ult].t;
      C.uf = 0;
      zoom = 0.05;
      shake = 6;
      txt(f.x, f.y - 150, CAR_ULTS[M.ult].name + '!', '#ffd400', 30);
      sfx(150, 0.5, 'sawtooth', 0.07, 500);
    }
  }
  if (C.bt > 0) carBumpTick(f, C, M);
  const vx0 = f.vx,
    imp = phys(f);
  // a car is long: keep all of it inside the walls, and bounce off them
  const half = (M.body[M.body.length - 1][0] - M.body[0][0]) / 2;
  if (f.x - half < WB.l || f.x + half > WB.r) {
    f.x = Math.max(WB.l + half, Math.min(WB.r - half, f.x));
    if (Math.abs(vx0) > 3) C.sh = 8;
    f.vx = -vx0 * (C.ut > 0 ? 1 : 0.25); // during an ULT it bounces straight back
  }
  if (imp > 6) {
    C.sh = 6;
    dust(f.x, f.gy, 4);
  }
  carRam(f, C, M);
  smooth(f, SEAT, 0.3);
}
// Hit everyone within r of (x, y) once (per CAR_HIT frames): sent flying away from that spot. Credited to the driver
// like any hit, so stars and XP are the usual.
function carSmash(f, x, y, r, dmg, dir) {
  let n = 0;
  for (const e of E) {
    if (e.dying || e.gone || e.corpse || e.st === 'cine' || (e.ram || 0) > fr) continue;
    if (Math.abs(e.x - x) > r || Math.abs(e.y - 40 - y) > r * 0.8 + 40) continue;
    e.ram = fr + CAR_HIT;
    const d = dir || Math.sign(e.x - x) || f.face;
    hurtE(e, { dmg: Math.round(dmg), kb: 10 + dmg * 0.12, lift: -8 - dmg * 0.06, ef: 'launch', w: 'H' }, d, f, f);
    ring(e.x, e.y - 40, 46);
    n++;
  }
  if (n) carHitFx(f);
  return n;
}
function carHitFx(f) {
  f.car.sh = 6;
  shake = Math.max(shake, 7);
  sfx(120, 0.2, 'sawtooth', 0.08, -60);
  noise(0.15, 0.1, 500);
}
// Driving into enemies: anyone in front of a moving car is sent flying, harder the faster it goes (Surge hits
// hardest)
function carRam(f, C, M) {
  const sp = Math.abs(f.vx);
  if (sp < 2.5) return;
  const dr = Math.sign(f.vx),
    nose = f.x + dr * (Math.max(...M.body.map(p => p[0])) - 6),
    boost = C.sg || C.ut > 0 ? CAR_SURGE : 1;
  for (const e of E) {
    if (e.dying || e.gone || e.corpse || e.st === 'cine' || (e.ram || 0) > fr) continue;
    const ahead = (e.x - f.x) * dr;
    if (ahead < -10 || Math.abs(e.x - nose) > 34 + sp * 2 || e.y < f.y - 120 || e.y > f.y + 40) continue;
    e.ram = fr + CAR_HIT;
    hurtE(
      e,
      { dmg: Math.round((12 + sp * 3) * boost), kb: 9 + sp * 1.2 * boost, lift: -7 - sp * 0.6, ef: 'launch', w: 'H' },
      dr,
      f,
      f
    );
    f.vx *= 0.9;
    carHitFx(f);
    ring(e.x, e.y - 40, 46);
  }
}
// The hood (Punch) or trunk (Kick) bump: that end lifts (drawCar) and, at its top, whoever is there is sent flying
function carBumpTick(f, C, M) {
  C.bt--;
  if (C.bt !== CAR_BUMP - 5) return;
  const front = C.bp === 'p',
    d = front ? f.face : -f.face,
    end = front ? Math.max(...M.body.map(p => p[0])) : -Math.min(...M.body.map(p => p[0]));
  carSmash(f, f.x + d * (end + 20), f.y - 30, 55, 24 * (C.sg ? CAR_SURGE : 1), d);
}
// ===== CAR ULTIMATES =====
// Each model's own ULT (CARS[].ult): name, frames (t), and what it does each frame (u = frames since it began).
// C.rot spins the car and C.tilt rears it up (drawing; set here so everyone online sees the same). The car can't be
// hurt meanwhile.
const CAR_ULTS = {
  bounce: {
    name: 'POGO HOP',
    t: 100,
    f: (f, C, u) => {
      // three big bounces, a shockwave at each landing
      const g = f.y >= f.gy - 1;
      if (g && u > 4 && f.vy >= 0 && C.uf < 3) {
        C.uf++;
        f.vy = -14;
        carSmash(f, f.x, f.y, 150, 30);
        ring(f.x, f.gy, 160);
        dust(f.x, f.gy, 10);
      } else if (u === 0) f.vy = -14;
    }
  },
  cruise: {
    name: 'CRUISE CONTROL',
    t: 80,
    f: (f, C, u) => {
      f.vx = f.face * 17;
      if (u % 6 === 0) carSmash(f, f.x + f.face * 60, f.y, 90, 32);
    }
  },
  nitro: {
    name: 'NITRO',
    t: 70,
    f: (f, C, u) => {
      C.tb = 2; // flames
      f.vx = f.face * 22;
      if (u % 4 === 0) carSmash(f, f.x + f.face * 70, f.y, 95, 36);
    }
  },
  bigair: {
    name: 'BIG AIR',
    t: 90,
    f: (f, C, u) => {
      if (u === 0) {
        f.vy = -19;
        C.uf = 0;
      }
      if (u > 8 && !C.uf && f.y >= f.gy - 1) {
        C.uf = 1;
        carSmash(f, f.x, f.y, 230, 45);
        ring(f.x, f.gy, 240);
        ring(f.x, f.gy, 140);
        dust(f.x - 60, f.gy, 10);
        dust(f.x + 60, f.gy, 10);
        shake = 14;
      }
    }
  },
  honk: {
    name: 'MEGA HONK',
    t: 90,
    f: (f, C, u) => {
      f.vx *= 0.8;
      if (u % 30 === 6) {
        carSmash(f, f.x, f.y, 300, 26);
        ring(f.x + f.face * 60, f.y - 40, 300);
        sfx(330, 0.3, 'square', 0.06);
        sfx(415, 0.3, 'square', 0.06);
      }
    }
  },
  roll: {
    name: 'BARREL ROLL',
    t: 80,
    f: (f, C, u) => {
      if (u === 0 || u === 40) f.vy = -9;
      f.vx = f.face * 11;
      C.rot = (u / 40) * Math.PI * 2 * f.face;
      if (u % 5 === 0) carSmash(f, f.x, f.y - 20, 110, 30);
    }
  },
  rush: {
    name: 'RUSH HOUR',
    t: 120,
    f: (f, C, u) => {
      // back and forth across the screen (it bounces off the walls)
      if (u === 0) f.vx = f.face * 18;
      f.vx = Math.sign(f.vx || f.face) * 18;
      f.face = Math.sign(f.vx);
      if (u % 4 === 0) carSmash(f, f.x + f.face * 60, f.y, 90, 28);
    }
  },
  sundae: {
    name: 'SUNDAE STORM',
    t: 110,
    f: (f, C, u) => {
      // scoops of ice cream fall all over the screen; each one lands with a splat
      f.vx *= 0.85;
      C.sc = C.sc || [];
      if (u % 7 === 0 && u < 90) C.sc.push({ x: WB.l + 40 + rnd() * (WB.r - WB.l - 80), t: 0, c: Math.floor(rnd() * 3) });
      for (const k of C.sc) k.t++;
      for (const k of C.sc)
        if (k.t === 24) {
          carSmash(f, k.x, f.gy, 55, 30, 0);
          ring(k.x, f.gy - 10, 50);
        }
      C.sc = C.sc.filter(k => k.t < 30);
      if (u === 109) C.sc = null;
    }
  },
  wheelie: {
    name: 'WHEELIE',
    t: 90,
    f: (f, C, u) => {
      // rears up on its back wheels and drives at them, then slams down
      C.tilt = u < 70 ? Math.min(1, u / 12) : Math.max(0, (90 - u) / 20);
      f.vx = u < 70 ? f.face * 10 : f.vx * 0.85;
      if (u < 70 && u % 5 === 0) carSmash(f, f.x + f.face * 70, f.y - 40, 90, 30);
      if (u === 78) {
        carSmash(f, f.x + f.face * 60, f.y, 200, 40);
        ring(f.x + f.face * 60, f.gy, 200);
        dust(f.x + f.face * 60, f.gy, 12);
        shake = 14;
      }
    }
  },
  spin: {
    name: 'SPIN CYCLE',
    t: 96,
    f: (f, C, u) => {
      // 360s, round and round, knocking away everyone close
      C.rot = (u / 12) * Math.PI * 2;
      f.vx *= 0.9;
      if (u % 24 === 0) f.vy = -5;
      if (u % 6 === 0) carSmash(f, f.x, f.y - 20, 120, 22);
    }
  }
};
function carUlt(f, C, M) {
  const U = CAR_ULTS[M.ult],
    u = U.t - C.ut;
  f.inv = Math.max(f.inv, 2);
  U.f(f, C, u);
  if (--C.ut <= 0) {
    C.rot = 0;
    C.tilt = 0;
    C.sc = null;
  }
}
// A hit on a car: the hit's damage (combat.js), then the car rocks and is pushed back a little, safe for a moment
function carHit(q, dr) {
  q.car.sh = 12;
  q.inv = 50;
  q.flash = 4;
  q.vx = dr * 4;
  if (q.y >= q.gy - 1) q.vy = -3;
  shake = 6;
  spark(q.x, q.y - 50, 20, '#ff4fa3');
  sfxHit('M');
  sfx(200, 0.08, 'square', 0.04);
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
  // a hood bump lifts the front (about the back wheel), a trunk bump the back (about the front wheel); a wheelie
  // rears right up; a spin or roll turns the whole car about its middle
  const bump = C.bt > 0 ? Math.sin((Math.PI * (CAR_BUMP - C.bt)) / CAR_BUMP) * 0.22 : 0,
    rear = C.tilt ? C.tilt * 0.6 : C.bp === 'p' ? bump : 0,
    tail = C.bp === 'k' && !C.tilt ? bump : 0;
  if (rear) {
    ctx.translate(M.wheels[0][0], 0);
    ctx.rotate(-rear);
    ctx.translate(-M.wheels[0][0], 0);
  } else if (tail) {
    ctx.translate(M.wheels[1][0], 0);
    ctx.rotate(tail);
    ctx.translate(-M.wheels[1][0], 0);
  }
  if (C.rot) {
    ctx.translate(0, -35);
    ctx.rotate(C.rot * fc);
    ctx.translate(0, 35);
  }
  // Surge: the car's outline glows in the driver's Surge colour (instead of the driver)
  if (!empty && C.sg) {
    ctx.beginPath();
    M.body.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.strokeStyle = surgeCol(f.look, fr >> 2);
    ctx.globalAlpha = 0.45 + 0.2 * Math.sin(fr * 0.4);
    ctx.lineWidth = 16;
    ctx.lineJoin = 'round';
    ctx.stroke();
    for (const [wx, wr] of M.wheels) {
      ctx.beginPath();
      ctx.arc(wx, -wr, wr + 4, 0, 7);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
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
  // a nitro, or Surge on the move: flames out the back (cosmetic: Math.random is fine in drawing)
  if (C.tb > 0 || (C.sg && Math.abs(f.vx) > 2)) {
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
  // the ice cream truck's SUNDAE STORM: scoops falling to where they'll land
  if (C.sc)
    for (const k of C.sc) {
      const y = f.gy - 520 + Math.min(1, k.t / 24) * 505;
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.ellipse(k.x, f.gy, 22 * Math.min(1, k.t / 24), 5, 0, 0, 7);
      ctx.fill();
      ctx.fillStyle = ['#ffb3c7', '#fff1d6', '#8a5a33'][k.c];
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(k.x, y - 14, 15, 0, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e8212b';
      ctx.beginPath();
      ctx.arc(k.x + 3, y - 30, 4, 0, 7);
      ctx.fill();
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
