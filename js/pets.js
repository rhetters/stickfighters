// StickFighters: pets, a little companion that follows its fighter around (the pet slot, data/items.js). Looks
// only: where a pet is comes from the drawing (PETF), never from the game, and never changes it. A walker trots
// after you on the ground and sits when you stop; a flyer (fly) flutters over your shoulder. Drawn facing +x.
// ===== DRAWING ONE PET =====
// x, y = where its feet touch the ground (a flyer: the middle of its body); u = size (1 = beside a normal fighter);
// face = 1 or -1; t = how far through its walk; mv = moving; sit = sitting still
function drawPet(it, x, y, u, face, t, mv, sit) {
  const k = it.k,
    c = it.c,
    c2 = it.c2 || shade(c, -0.25),
    lw = 2.4 * u,
    sw = mv ? Math.sin(t) : 0, // the legs swing as it walks
    blob = (bx, by, rx, ry, col, rot = 0) => {
      ctx.beginPath();
      ctx.ellipse(bx, by, rx, ry, rot, 0, 7);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw;
      ctx.stroke();
    },
    leg = (lx, len, a, col = c2) => {
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw * 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lx, -len);
      ctx.lineTo(lx + Math.sin(a) * len * 0.5, 0);
      ctx.stroke();
      ctx.strokeStyle = col;
      ctx.lineWidth = lw * 1.4;
      ctx.stroke();
    },
    eye = (ex, ey, r = 1.7) => {
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(ex, ey, r * u, 0, 7);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ex + 0.5 * u, ey - 0.6 * u, r * 0.4 * u, 0, 7);
      ctx.fill();
    },
    nose = (nx, ny) => {
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(nx, ny, 1.8 * u, 1.4 * u, 0, 0, 7);
      ctx.fill();
    };
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(face, 1);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // a soft shadow under a walker
  if (!it.fly) {
    ctx.fillStyle = 'rgba(0,0,0,.12)';
    ctx.beginPath();
    ctx.ellipse(0, 1, 14 * u, 3 * u, 0, 0, 7);
    ctx.fill();
  }
  if (k === 'dog' || k === 'wolf') {
    const wolf = k === 'wolf',
      wag = Math.sin(t * 2 + (mv ? 0 : performance.now() / 90)) * 0.5;
    // tail
    ctx.save();
    ctx.translate(-12 * u, -14 * u);
    ctx.rotate(-0.9 + wag);
    blob(0, -6 * u, (wolf ? 4.5 : 2.6) * u, (wolf ? 9 : 7) * u, wolf ? c : c2);
    ctx.restore();
    if (sit) {
      leg(-6 * u, 7 * u, 0);
      blob(-4 * u, -10 * u, 10 * u, 9 * u, c);
      leg(5 * u, 11 * u, 0);
    } else {
      leg(-9 * u, 9 * u, -sw);
      leg(8 * u, 9 * u, sw);
      blob(0, -13 * u, 14 * u, 7.5 * u, c);
      leg(-6 * u, 9 * u, sw);
      leg(11 * u, 9 * u, -sw);
    }
    const hx = sit ? 7 * u : 13 * u,
      hy = sit ? -24 * u : -21 * u;
    // head, ears, snout
    if (wolf) {
      for (const ex of [-4, 3]) {
        ctx.beginPath();
        ctx.moveTo(hx + (ex - 3) * u, hy - 5 * u);
        ctx.lineTo(hx + ex * u, hy - 15 * u);
        ctx.lineTo(hx + (ex + 4) * u, hy - 5 * u);
        ctx.closePath();
        ctx.fillStyle = c;
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = lw;
        ctx.stroke();
      }
    }
    blob(hx, hy, 8.5 * u, 8 * u, c);
    blob(hx + 7 * u, hy + 3 * u, 5.5 * u, 4 * u, wolf ? '#f4efe6' : shade(c, 0.25));
    if (!wolf) blob(hx - 4 * u, hy + 2 * u, 3.6 * u, 7 * u, c2, 0.25); // floppy ear
    nose(hx + 11.5 * u, hy + 1.5 * u);
    eye(hx + 3 * u, hy - 2.5 * u);
    if (!wolf) {
      ctx.fillStyle = '#ff7f9e';
      ctx.beginPath();
      ctx.ellipse(hx + 8 * u, hy + 7.5 * u, 2 * u, 2.6 * u, 0, 0, Math.PI);
      ctx.fill();
    }
  } else if (k === 'cat') {
    const tw = Math.sin(performance.now() / 400) * 0.25;
    ctx.save();
    ctx.translate(-12 * u, -12 * u);
    ctx.rotate(tw);
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw * 3.4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-10 * u, -6 * u, -6 * u, -18 * u);
    ctx.stroke();
    ctx.strokeStyle = c;
    ctx.lineWidth = lw * 2;
    ctx.stroke();
    ctx.restore();
    if (sit) {
      blob(-3 * u, -10 * u, 9 * u, 10 * u, c);
      leg(5 * u, 9 * u, 0, c);
    } else {
      leg(-9 * u, 9 * u, -sw, c);
      leg(8 * u, 9 * u, sw, c);
      blob(0, -13 * u, 13 * u, 6.5 * u, c);
      leg(-6 * u, 9 * u, sw, c);
      leg(10 * u, 9 * u, -sw, c);
    }
    const hx = sit ? 6 * u : 12 * u,
      hy = sit ? -24 * u : -20 * u;
    for (const ex of [-5, 2]) {
      ctx.beginPath();
      ctx.moveTo(hx + (ex - 2) * u, hy - 4 * u);
      ctx.lineTo(hx + ex * u, hy - 13 * u);
      ctx.lineTo(hx + (ex + 5) * u, hy - 5 * u);
      ctx.closePath();
      ctx.fillStyle = c;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw;
      ctx.stroke();
    }
    blob(hx, hy, 8 * u, 7.5 * u, c);
    // stripes
    ctx.strokeStyle = c2;
    ctx.lineWidth = lw;
    for (const sx of [-3, 0, 3]) {
      ctx.beginPath();
      ctx.moveTo(hx + sx * u, hy - 7 * u);
      ctx.lineTo(hx + sx * u, hy - 3.5 * u);
      ctx.stroke();
    }
    eye(hx + 3.5 * u, hy - 0.5 * u);
    ctx.fillStyle = '#ff7f9e';
    ctx.beginPath();
    ctx.arc(hx + 7.5 * u, hy + 2.5 * u, 1.4 * u, 0, 7);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw * 0.5;
    for (const wy of [1.5, 4]) {
      ctx.beginPath();
      ctx.moveTo(hx + 6 * u, hy + wy * u);
      ctx.lineTo(hx + 14 * u, hy + (wy - 1) * u);
      ctx.stroke();
    }
  } else if (k === 'armadillo') {
    // runs fast enough and it rolls up into a ball
    if (mv && Math.abs(sw) >= 0 && it.rolling) {
      ctx.save();
      ctx.translate(0, -9 * u);
      ctx.rotate(t * 0.6);
      blob(0, 0, 9 * u, 9 * u, c);
      ctx.strokeStyle = c2;
      ctx.lineWidth = lw;
      for (const a of [0, 1.05, 2.1]) {
        ctx.beginPath();
        ctx.arc(0, 0, 8 * u, a, a + 1.3);
        ctx.stroke();
      }
      ctx.restore();
    } else {
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw * 2.2;
      ctx.beginPath();
      ctx.moveTo(-12 * u, -5 * u);
      ctx.lineTo(-20 * u, -2 * u);
      ctx.stroke();
      ctx.strokeStyle = c2;
      ctx.lineWidth = lw;
      ctx.stroke();
      leg(-7 * u, 5 * u, -sw, c2);
      leg(7 * u, 5 * u, sw, c2);
      // the shell, in bands
      ctx.beginPath();
      ctx.ellipse(0, -6 * u, 14 * u, 11 * u, 0, Math.PI, 0);
      ctx.closePath();
      ctx.fillStyle = c;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw;
      ctx.stroke();
      ctx.strokeStyle = c2;
      for (const bx of [-6, 0, 6]) {
        ctx.beginPath();
        ctx.moveTo(bx * u, -6 * u);
        ctx.quadraticCurveTo(bx * u + 1.5 * u, -12 * u, bx * u, -16.5 * u);
        ctx.stroke();
      }
      // head with a long snout and round ears
      blob(15 * u, -6 * u, 6 * u, 4.5 * u, shade(c, 0.2));
      blob(13 * u, -11 * u, 2.4 * u, 3.2 * u, shade(c, 0.2));
      nose(21 * u, -5.5 * u);
      eye(15 * u, -7.5 * u, 1.4);
    }
  } else if (k === 'bunny') {
    const hop = mv ? Math.abs(Math.sin(t)) * 6 * u : 0;
    ctx.translate(0, -hop);
    blob(-11 * u, -9 * u, 4 * u, 4 * u, '#ffffff');
    blob(-1 * u, -9 * u, 11 * u, 9 * u, c);
    blob(6 * u, -2 * u, 5 * u, 2.6 * u, c);
    const hx = 9 * u,
      hy = -20 * u,
      ear = Math.sin(performance.now() / 300) * 0.15;
    for (const [ex, a] of [
      [-2, -0.35 + ear],
      [2, -0.1 - ear]
    ]) {
      ctx.save();
      ctx.translate(hx + ex * u, hy - 5 * u);
      ctx.rotate(a);
      blob(0, -7 * u, 2.8 * u, 8 * u, c);
      ctx.beginPath();
      ctx.ellipse(0, -7 * u, 1.2 * u, 5.5 * u, 0, 0, 7);
      ctx.fillStyle = '#ffb3c7';
      ctx.fill();
      ctx.restore();
    }
    blob(hx, hy, 7 * u, 6.5 * u, c);
    eye(hx + 3 * u, hy - 1.5 * u);
    ctx.fillStyle = '#ff7f9e';
    ctx.beginPath();
    ctx.arc(hx + 6.8 * u, hy + 1.5 * u, 1.3 * u, 0, 7);
    ctx.fill();
  } else if (k === 'frog') {
    const hop = mv ? Math.abs(Math.sin(t * 0.8)) * 8 * u : 0;
    ctx.translate(0, -hop);
    blob(-6 * u, -4 * u, 7 * u, 4 * u, c2);
    blob(0, -9 * u, 12 * u, 8 * u, c);
    blob(1 * u, -5 * u, 8 * u, 3.5 * u, '#e9f5c0');
    for (const ex of [-2, 6]) {
      blob(ex * u, -17 * u, 4 * u, 4 * u, c);
      blob(ex * u + 0.6 * u, -17.5 * u, 2.3 * u, 2.3 * u, '#ffffff');
      eye(ex * u + 1 * u, -17.5 * u, 1.3);
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw * 0.8;
    ctx.beginPath();
    ctx.arc(5 * u, -10 * u, 5 * u, 0.3, 1.6);
    ctx.stroke();
  } else if (k === 'penguin') {
    const wd = mv ? Math.sin(t) * 0.18 : 0;
    ctx.rotate(wd);
    blob(-3 * u, -1 * u, 4.5 * u, 2 * u, '#ff9a1f');
    blob(4 * u, -1 * u, 4.5 * u, 2 * u, '#ff9a1f');
    blob(0, -13 * u, 10 * u, 13 * u, c);
    blob(2.5 * u, -12 * u, 6.5 * u, 10 * u, '#ffffff');
    blob(-6 * u, -13 * u, 3 * u, 8 * u, c, 0.3 + (mv ? Math.sin(t) * 0.4 : 0));
    eye(4 * u, -21 * u);
    ctx.beginPath();
    ctx.moveTo(7 * u, -20 * u);
    ctx.lineTo(13 * u, -18.5 * u);
    ctx.lineTo(7 * u, -17 * u);
    ctx.closePath();
    ctx.fillStyle = '#ff9a1f';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw * 0.8;
    ctx.stroke();
  } else if (k === 'dragon' || k === 'owl') {
    const flap = Math.sin(performance.now() / (k === 'owl' ? 110 : 90));
    if (k === 'dragon') {
      // tail with a spade on the end
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw * 3;
      ctx.beginPath();
      ctx.moveTo(-6 * u, 2 * u);
      ctx.quadraticCurveTo(-16 * u, 8 * u, -20 * u, 0);
      ctx.stroke();
      ctx.strokeStyle = c;
      ctx.lineWidth = lw * 1.6;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-20 * u, 0);
      ctx.lineTo(-25 * u, -4 * u);
      ctx.lineTo(-23 * u, 3 * u);
      ctx.closePath();
      ctx.fillStyle = c2;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw * 0.8;
      ctx.stroke();
    }
    // the far wing, the body, the near wing
    const wing = (sx, a) => {
      ctx.save();
      ctx.translate(sx, -4 * u);
      ctx.rotate(a);
      if (k === 'dragon') {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-6 * u, -16 * u);
        ctx.lineTo(-10 * u, -6 * u);
        ctx.lineTo(-16 * u, -9 * u);
        ctx.lineTo(-12 * u, 2 * u);
        ctx.closePath();
        ctx.fillStyle = c2;
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = lw;
        ctx.stroke();
      } else blob(-5 * u, -2 * u, 7 * u, 4 * u, c2, -0.3);
      ctx.restore();
    };
    wing(-2 * u, -0.3 - flap * 0.5);
    if (k === 'dragon') {
      blob(0, 0, 10 * u, 7 * u, c);
      blob(2 * u, 2.5 * u, 6 * u, 3.5 * u, '#ffe39a');
      blob(10 * u, -7 * u, 7 * u, 6 * u, c);
      blob(15 * u, -5 * u, 4.5 * u, 3.5 * u, c);
      for (const hx of [6, 9]) {
        ctx.beginPath();
        ctx.moveTo(hx * u, -12 * u);
        ctx.lineTo((hx - 2) * u, -17 * u);
        ctx.lineTo((hx + 1.5) * u, -12.5 * u);
        ctx.fillStyle = '#fff3c4';
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = lw * 0.7;
        ctx.stroke();
      }
      eye(12 * u, -8.5 * u);
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(18 * u, -6 * u, 0.9 * u, 0, 7);
      ctx.fill();
    } else {
      // an owl: a round body, its near wing at its side, then a big face
      blob(0, 0, 10 * u, 11 * u, c);
      blob(2 * u, 4 * u, 6 * u, 6 * u, shade(c, 0.35));
      ctx.save();
      ctx.translate(-5 * u, 2 * u);
      ctx.rotate(0.4 + flap * 0.5);
      blob(0, 0, 4 * u, 7.5 * u, c2);
      ctx.restore();
      blob(2.5 * u, -4.5 * u, 8 * u, 5.5 * u, shade(c, 0.45));
      for (const ex of [-1, 6]) {
        blob(ex * u, -5 * u, 3.6 * u, 3.6 * u, '#ffffff');
        eye(ex * u + 0.7 * u, -5 * u, 1.8);
      }
      ctx.beginPath();
      ctx.moveTo(2 * u, -2 * u);
      ctx.lineTo(4.5 * u, -2 * u);
      ctx.lineTo(3.2 * u, 1.5 * u);
      ctx.closePath();
      ctx.fillStyle = '#ffb21f';
      ctx.fill();
      for (const ex of [-4, 5]) {
        ctx.beginPath();
        ctx.moveTo(ex * u, -9 * u);
        ctx.lineTo((ex - 1) * u, -14 * u);
        ctx.lineTo((ex + 3) * u, -10 * u);
        ctx.fillStyle = c;
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = lw * 0.8;
        ctx.stroke();
      }
    }
    if (k === 'dragon') wing(4 * u, 0.2 + flap * 0.6);
  }
  ctx.restore();
}
// ===== FOLLOWING =====
// Each fighter's pet: where it is, which way it faces and how far through its walk (drawing state only)
const PETF = new WeakMap();
function petOf(f) {
  const L = f.look,
    it = L && L.pet;
  if (!it) return null;
  const s = f.s * (L.ht || 1),
    side = -f.face * 52 * s; // it keeps to the side behind you
  let q = PETF.get(f);
  if (!q || q.it !== it || Math.abs(q.x - f.x) > 700) {
    q = { it, x: f.x + side, y: it.fly ? f.y - 100 * s : f.gy, face: f.face, t: 0, vx: 0, mv: false, still: 0 };
    PETF.set(f, q);
  }
  if (!live()) return q;
  const tx = f.x + side,
    d = tx - q.x,
    far = Math.abs(d) > 16 * s,
    want = far ? Math.sign(d) * Math.min(Math.abs(d) * 0.1 + 1.5, 6 + Math.abs(f.vx)) : 0;
  q.vx += (want - q.vx) * 0.2;
  q.x += q.vx;
  q.mv = Math.abs(q.vx) > 0.35;
  q.face = q.mv ? Math.sign(q.vx) : f.face;
  q.t += q.mv ? Math.min(0.45, Math.abs(q.vx) * 0.09) : 0;
  q.still = q.mv ? 0 : q.still + 1;
  const ty = it.fly ? f.y - (95 + Math.sin(fr * 0.06) * 6) * s : f.gy;
  q.y += (ty - q.y) * (it.fly ? 0.12 : 0.3);
  q.roll = it.k === 'armadillo' && Math.abs(q.vx) > 5;
  return q;
}
// Draw a fighter's pet where it's got to (behind the fighters; render.js)
function drawPetOf(f) {
  if (f.hide || f.st === 'cine' || !f.look || !f.look.pet) return;
  const q = petOf(f);
  if (!q) return;
  const s = f.s * (f.look.ht || 1);
  lifted(q.x, () => drawPet(q.roll ? { ...q.it, rolling: 1 } : q.it, q.x, q.y, s, q.face, q.t, q.mv, q.still > 40));
}
