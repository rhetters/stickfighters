// StickFighters: the Desert theme. Its hazards and ropes are part of the game (they run in the simulation from the
// level clock and players' buttons, never from drawing): quicksand (LV.dz.qs), gaps in the Pyramid's floor (LV.dz.pits)
// with a rope over each (LV.dz.ropes), and the Pink Pharaoh's scarab swarms (LV.sw). The drawing (the dunes, the oasis,
// the inside of the Pyramid and its darkness and torches, the props, the mummies' shuffle) never changes the game and
// uses Math.random() only for cosmetic effects.
// ===== LAYOUT (from genRun in run.js; its own random numbers R) =====
const QS_DEEP = 60, // how far you sink before quicksand costs a heart
  QS_SINK = 0.26, // sinking per frame, standing in it
  QS_SLOW = 0.4, // walking speed in it
  QS_HOP = 20, // how much one tap of Jump climbs out
  PIT_W = 500, // a gap's width (too far to jump, even with a Surge jump; a rope swings you over)
  ROPE_IN = 120, // the ropes hang around this far in from the gap's near edge (a running jump reaches them)
  ROPE_GAP = 42, // between the ropes over one gap (one rope for each player, so nobody waits for a turn)
  PIT_FALL = 320, // how far below the floor a fall counts as gone
  ROPE_TOP = 400, // the ceiling (anchor) above the floor
  ROPE_LEN = 300, // the rope's length: its end hangs 100 above the floor
  ROPE_HAND = 80, // feet to hands, hanging (arms up)
  ROPE_GRIP = 46,
  ROPE_HOP = [4, 6.5], // the hop you push off with when you let go (sideways, up) // how close your hands must be to grab it
  SWARM_T = 330, // how long a scarab swarm chases
  SWARM_SPD = 3.4; // its speed (you can outrun it; a Surge run goes straight through it)
// Quicksand in a fight (one patch to one side, for knocking enemies in) and between fights; a gap with a rope
// between the Pyramid's fights. es = the biome's fight encounters, in order.
function desertLayout(B, es, dz, R) {
  for (let i = 0; i < es.length; i++) {
    const e = es[i];
    if (B.quick) {
      const sd = R() < 0.5 ? -1 : 1,
        m = Math.round(e.x + sd * (230 + R() * 90)),
        h = Math.round(58 + R() * 22);
      dz.qs.push({ x0: m - h, x1: m + h });
    }
    if (!i) continue;
    const a = es[i - 1].lock + W + 60,
      b = e.lock - 60;
    if (B.quick && b - a >= 220) {
      const m = Math.round((a + b) / 2),
        h = Math.min(110, Math.round((b - a) / 2 - 50));
      dz.qs.push({ x0: m - h, x1: m + h });
    }
    if (B.pits && b - a >= PIT_W + 160) {
      const m = Math.round((a + b) / 2);
      dz.pits.push({ x0: m - PIT_W / 2, x1: m + PIT_W / 2 });
      dz.ropes.push(newRope(dz.pits.length - 1, 0, 1, m - PIT_W / 2));
    }
  }
}
// Rope k of n over gap p (whose near edge is at x0), hanging still
function newRope(p, k, n, x0) {
  return { p, k, x: Math.round(x0 + ROPE_IN + (k - (n - 1) / 2) * ROPE_GAP), y: G - ROPE_TOP, L: ROPE_LEN, a: 0, w: 0, by: -1 };
}
// One rope over each gap for each player in the party (2 players, 2 ropes side by side…). Made again (all hanging
// still) when the party grows, as soon as nobody is holding one.
function ropesFor(D) {
  const n = Math.max(1, Math.min(6, PL.length));
  if ((D.nr || 1) >= n || D.ropes.some(r => r.by >= 0)) return;
  D.nr = n;
  D.ropes = [];
  D.pits.forEach((pt, p) => {
    for (let k = 0; k < n; k++) D.ropes.push(newRope(p, k, n, pt.x0));
  });
}
// ===== WHERE THINGS ARE =====
// The hit that knocks out an enemy swallowed or fallen: exactly its health left (hit sparks and the number grow with
// the damage)
const finish = f => Math.max(1, Math.ceil(f.hp));
const deskOn = () => MODE === LEVEL && LV && LV.dz;
const pitAt = x => LV.dz.pits.some(p => x > p.x0 && x < p.x1);
const qsAt = x => LV.dz.qs.find(q => x > q.x0 && x < q.x1);
const swarmCount = () => (LV && LV.sw ? LV.sw.length : 0);
// A main boss (the Pharaoh, Kong…) never sinks or falls: one capital letter
const mainBoss = f => !f.pl && /^[A-Z]$/.test(f.tk || '');
// From phys() (combat.js), after moving: over a gap the floor is gone; an enemy walking about stops at the edge of a
// gap or of quicksand (knocked flying, it goes in)
function deskEdge(f, x0, y0) {
  const D = LV.dz;
  if (f.pl && f.sink > 0 && f.y >= G - 2) f.x = x0 + (f.x - x0) * QS_SLOW; // wading
  if (!f.pl && (f.st === 'free' || f.st === 'atk') && !mainBoss(f)) {
    const into = x => D.pits.some(p => x > p.x0 - 18 && x < p.x1 + 18) || D.qs.some(q => x > q.x0 - 10 && x < q.x1 + 10);
    if (into(f.x) && !into(x0)) {
      f.x = x0;
      f.vx = 0;
    }
  }
  // over a gap (or already down in one, kept between its walls) the floor is gone
  if (f.rope) return;
  if (y0 > G + 4) {
    const p = D.pits.find(p => x0 > p.x0 - 30 && x0 < p.x1 + 30);
    if (p) {
      f.x = Math.max(p.x0 + 12, Math.min(p.x1 - 12, f.x));
      f.gy = G + 4000;
    }
  } else if (f.gy >= G && pitAt(f.x)) f.gy = G + 4000;
}
// ===== EVERY STEP (hazTick in volcano.js) =====
function desertTick() {
  const D = MODE === LEVEL && LV.dz;
  if (D) {
    ropesFor(D);
    for (const r of D.ropes) {
      // a rope whose holder let go some other way (knocked out, a scene, left the game) is free again
      if (r.by >= 0 && !PL.some(p => p.slot === r.by && p.rope && D.ropes[p.rope.i] === r)) r.by = -1;
      if (r.by < 0) ropeSway(r);
    }
    for (const f of [...PL, ...E]) {
      if (f.st === 'cine' || f.gone || f.left) continue;
      // fell into a gap
      if (f.y > G + PIT_FALL) {
        if (f.pl) pitBack(f);
        else if (!f.dying && !f.corpse) natHit(f, finish(f), 0, 1); // knocked into a gap: out (it counts as a KO)
        else if (f.y > G + 900) f.gone = 1;
        continue;
      }
      const on = f.y >= G - 2 && f.gy === G && !f.rope,
        q = on ? qsAt(f.x) : null;
      if (f.pl && on && !q && !pitAt(f.x) && f.st !== 'dead') f.safeX = f.x; // the last solid ground
      if (q) quickIn(f, q);
      else if (f.sink) f.sink = Math.max(0, f.sink - 3);
    }
  }
  if (LV.sw) swarmTick();
}
// Someone in quicksand: a player sinks slowly (tapping Jump climbs out: deskP); all the way down costs a heart and
// pops them out at the edge. An enemy that lands in it while knocked about is swallowed (a mini-boss is spat out,
// hurt); one walking about never steps in (deskEdge).
function quickIn(f, q) {
  if (f.pl) {
    if (f.st === 'dead') return;
    f.sink = (f.sink || 0) + QS_SINK;
    if (f.sink >= QS_DEEP) {
      const lose = Math.min(Math.round(f.max / 5), Math.max(0, f.hp - 1)); // a heart, but never a knockout
      tally(f, 'taken', lose);
      f.hp -= lose;
      f.sink = 0;
      f.x = f.x - q.x0 < q.x1 - f.x ? q.x0 - 30 : q.x1 + 30;
      f.vy = -13;
      f.vx = 0;
      f.inv = Math.max(f.inv, 60);
      f.att = null;
      f.st = 'free';
      txt(f.x, f.y - 120, 'GLUG!', '#c98a2e', 24);
      sfx(150, 0.3, 'triangle', 0.06, -60);
      dust(f.x, G, 8);
    }
    return;
  }
  if (mainBoss(f)) return;
  if (f.dying || f.corpse) {
    f.sink = (f.sink || 0) + 0.8;
    if (f.sink > QS_DEEP) f.gone = 1;
    return;
  }
  if (f.st === 'free' && !f.sink) return;
  // caught: it struggles but can't get out
  f.sink = (f.sink || 0) + 0.55;
  f.stun = Math.max(f.stun || 0, 6);
  if (f.st === 'free' || f.st === 'atk') f.st = 'hurt';
  f.att = null;
  f.vx *= 0.5;
  if (f.sink >= QS_DEEP) {
    f.sink = 0;
    if (f.tk.length > 1) {
      // a mini-boss: spat back out, badly hurt
      natHit(f, Math.round(f.max / 3), -14, f.x < (q.x0 + q.x1) / 2 ? -1 : 1);
      f.x = f.x - q.x0 < q.x1 - f.x ? q.x0 - 40 : q.x1 + 40;
    } else {
      natHit(f, finish(f), 0, 1);
      f.sink = QS_DEEP * 0.6;
      txt(f.x, f.y - 90, 'GULP!', '#c98a2e', 22);
    }
  }
}
// A player fell into a gap: a heart lost (never a knockout), back on the last ledge they stood on
function pitBack(f) {
  const lose = f.st === 'dead' ? 0 : Math.min(Math.round(f.max / 5), Math.max(0, f.hp - 1));
  tally(f, 'taken', lose);
  f.hp -= lose;
  Object.assign(f, { x: f.safeX ?? f.x, y: G - 140, vx: 0, vy: 0, gy: G, st: f.st === 'dead' ? 'dead' : 'free' });
  f.att = null;
  f.rope = null;
  f.sink = 0;
  f.inv = Math.max(f.inv, 70);
  if (f.x < WB.l + 24 || f.x > WB.r - 24) f.x = Math.max(WB.l + 30, Math.min(WB.r - 30, f.x));
  ring(f.x, G - 60, 50);
  txt(f.x, G - 180, 'WHOOPS!', '#e8a33c', 24);
  sfx(330, 0.2, 'triangle', 0.05, -200);
}
// ===== ROPES =====
// A rope nobody holds swings back to hanging straight
function ropeSway(r) {
  r.w += -(0.7 / r.L) * Math.sin(r.a);
  r.w *= 0.97;
  r.a += r.w;
}
// The player's own step on a rope or in quicksand (from updP, before anything else they'd do). True = on a rope:
// nothing else happens this step. Hold Punch to grab a rope near your hands, Left / Right to swing, let go of Punch
// to fly off with the swing's speed.
function deskP(f, I, want, eat) {
  const D = LV.dz,
    K = I.K;
  // quicksand: each tap of Jump climbs part of the way out (a small hop)
  if (f.sink > 6 && !f.rope && f.st === 'free' && want('j')) {
    eat('j');
    f.sink = Math.max(0, f.sink - QS_HOP);
    f.vy = -5;
    dust(f.x, G, 4);
    sfx(380, 0.05, 'triangle', 0.03, 120);
  }
  if (f.rope) {
    const r = D.ropes[f.rope.i];
    if (!K.p || f.st === 'dead' || f.st === 'hurt') {
      // let go: fly off with the swing's speed, plus a little hop the way you're pushing (or facing)
      const m = (K.r ? 1 : 0) - (K.l ? 1 : 0) || f.face;
      r.by = -1;
      f.rope = null;
      f.st = f.st === 'dead' ? 'dead' : 'free';
      if (f.st === 'free') {
        f.vx += m * ROPE_HOP[0];
        f.vy = Math.min(f.vy, 0) - ROPE_HOP[1];
        f.face = m;
        f.fling = 1;
      }
      return false;
    }
    const m = (K.r ? 1 : 0) - (K.l ? 1 : 0),
      d = f.rope.d;
    // a pendulum: gravity pulls it back to hanging straight; Left / Right pump the swing
    r.w += -(0.7 / d) * Math.sin(r.a) + m * 0.0016;
    r.w *= 0.996;
    r.a = Math.max(-1.35, Math.min(1.35, r.a + r.w));
    if (Math.abs(r.a) >= 1.35) r.w *= -0.3;
    const hx = r.x + d * Math.sin(r.a),
      hy = r.y + d * Math.cos(r.a);
    f.vx = d * r.w * Math.cos(r.a);
    f.vy = -d * r.w * Math.sin(r.a);
    f.x = hx;
    f.y = hy + ROPE_HAND * f.s;
    f.gy = G;
    if (m) f.face = m;
    f.running = 0;
    smooth(f, [4 + r.a * 20, 172, 4, 168, 6, 18 - r.w * 300, 24, -14 - r.w * 300, 22, 0], 0.4);
    return true;
  }
  // grab: Punch pressed (or held, jumping into it) with your hands near a rope nobody holds
  if (f.st === 'free' && D.ropes.length && (K.p || want('p'))) {
    const hx = f.x,
      hy = f.y - ROPE_HAND * f.s;
    for (let i = 0; i < D.ropes.length; i++) {
      const r = D.ropes[i];
      if (r.by >= 0 || Math.abs(hx - r.x) > r.L + 40) continue;
      // the closest point on the rope to your hands
      const ux = Math.sin(r.a),
        uy = Math.cos(r.a),
        t = Math.max(60, Math.min(r.L, (hx - r.x) * ux + (hy - r.y) * uy)),
        px = r.x + ux * t,
        py = r.y + uy * t;
      if (Math.hypot(hx - px, hy - py) > ROPE_GRIP) continue;
      eat('p');
      r.by = f.slot;
      f.rope = { i, d: Math.max(t, r.L * 0.8) }; // hands slide down near the knot: a long swing
      // the swing starts with how you were moving across the rope
      r.w = (f.vx * Math.cos(r.a) - f.vy * Math.sin(r.a)) / t;
      f.att = null;
      f.sink = 0;
      sfx(520, 0.06, 'triangle', 0.04, 160);
      return deskP(f, I, want, eat);
    }
  }
  return false;
}
// ===== THE PHARAOH'S SCARABS =====
// A swarm flies out from the Pharaoh at the player he aimed at (e.tgx), chases them for a while and goes home. It
// stings whoever it touches now and then; a Surge run (or a Surge dodge) through it scatters it.
function swarmSend(f) {
  if (!LV || MODE !== LEVEL) return;
  const al = PL.filter(p => p.st !== 'dead' && p.st !== 'cine');
  if (!al.length) return;
  let tg = al[0];
  for (const p of al) if (Math.abs(p.x - (f.tgx ?? f.x)) < Math.abs(tg.x - (f.tgx ?? f.x))) tg = p;
  (LV.sw || (LV.sw = [])).push({ x: f.x + f.face * 40, y: f.y - 110 * f.s, t: 0, tg: tg.slot });
  sfx(900, 0.3, 'sawtooth', 0.02, -300);
  noise(0.4, 0.03, 3000);
}
function swarmTick() {
  for (const s of LV.sw) {
    s.t++;
    const p = PL.find(q => q.slot === s.tg && q.st !== 'dead') || PL.find(q => q.st !== 'dead');
    if (!p || s.t > SWARM_T) {
      s.t = SWARM_T + 1;
      continue;
    }
    const dx = p.x - s.x,
      dy = p.y - 45 - s.y,
      d = Math.hypot(dx, dy) || 1;
    s.x += (dx / d) * SWARM_SPD;
    s.y += (dy / d) * SWARM_SPD;
    for (const q of PL) {
      if (q.st === 'dead' || q.st === 'cine' || Math.abs(q.x - s.x) > 40 || Math.abs(q.y - 45 - s.y) > 46) continue;
      if (q.phase > 0 || (q.sj > 0 && inputOf(q).K.s)) {
        // a Surge run straight through: scattered
        s.t = SWARM_T + 1;
        spark(s.x, s.y, 30, '#3fb8a8');
        txt(s.x, s.y - 40, 'SCATTER!', '#2a8f84', 22);
        sfx(1200, 0.15, 'square', 0.03, -600);
        break;
      }
      if ((q.swT || 0) > LV.t) continue;
      q.swT = LV.t + 34;
      hurtP(q, { dmg: 4, kb: 3, ef: 'stagger' }, q.x < s.x ? -1 : 1);
    }
  }
  LV.sw = LV.sw.filter(s => s.t <= SWARM_T);
  if (!LV.sw.length) LV.sw = null;
}
// ===== THE MUMMIES' SHUFFLE (drawing a pose; the pose itself is kept with the enemy like any other) =====
function mummyPose(e) {
  const p = freePose(e).slice();
  if (e.y < e.gy - 4) return p;
  const sw = Math.sin(e.t * 0.12) * 6;
  p[1] = 96 + sw;
  p[2] = 6;
  p[3] = 86 - sw;
  p[4] = 6;
  return p;
}
// ===== DRAWING: the places =====
const DUNE = ['#f4dba0', '#ebc983', '#e0b56a'];
function dunes(f, sp, seed, h, c, y) {
  layer(f, sp, seed, (x, r) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x - sp, y);
    ctx.quadraticCurveTo(x - sp * 0.3, y - h * (0.6 + r * 0.6), x + sp * 0.2, y - h * (0.4 + r * 0.3));
    ctx.quadraticCurveTo(x + sp * 0.6, y - h * 0.2, x + sp, y);
    ctx.closePath();
    ctx.fill();
  });
}
function desertSun(x, y, r) {
  ctx.fillStyle = 'rgba(255,214,90,0.35)';
  ctx.beginPath();
  ctx.arc(x, y, r * 1.6, 0, 7);
  ctx.fill();
  ctx.fillStyle = '#ffd65a';
  ctx.strokeStyle = 'rgba(200,140,40,0.6)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 7);
  ctx.fill();
  ctx.stroke();
}
// Pyramids on the horizon (a slow layer)
function farPyramids(f, a) {
  layer(f, 520, 461, (x, r) => {
    if (r < 0.3) return;
    const h = 90 + r * 70;
    ctx.globalAlpha = a;
    ctx.fillStyle = '#e2b973';
    ctx.strokeStyle = 'rgba(150,100,50,0.6)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - h, G - 10);
    ctx.lineTo(x, G - 10 - h);
    ctx.lineTo(x + h, G - 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(170,120,60,0.35)';
    ctx.beginPath();
    ctx.moveTo(x, G - 10 - h);
    ctx.lineTo(x + h, G - 10);
    ctx.lineTo(x + h * 0.25, G - 10);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}
function sandFloor(c, rip) {
  ctx.fillStyle = c;
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.strokeStyle = rip;
  ctx.lineWidth = 2.5;
  layer(1, 70, 467, (x, r) => {
    const y = G + 20 + r * 50;
    ctx.beginPath();
    ctx.moveTo(x - 22, y);
    ctx.quadraticCurveTo(x, y - 6, x + 22, y);
    ctx.stroke();
  });
  groundLine();
}
// The Sand Dunes: a hot yellow sky, the sun, pyramids far off and rolling dunes
function drawSand() {
  paperBg();
  skyWash('#ffcf7a', '#fff3d6', 0.5);
  desertSun(720 - CAM.x * 0.01, 90, 38);
  farPyramids(0.06, 0.75);
  dunes(0.18, 340, 463, 90, 'rgba(235,201,131,0.55)', G + 6);
  dunes(0.4, 260, 465, 60, 'rgba(224,181,106,0.6)', G + 6);
  sandFloor('#f4dba0', '#d9b36a');
}
// The Oasis: palms around blue water, dunes behind
function drawOasis() {
  paperBg();
  skyWash('#9fd2ef', '#fff3d6', 0.45);
  desertSun(640 - CAM.x * 0.01, 80, 32);
  farPyramids(0.05, 0.5);
  dunes(0.15, 360, 471, 70, 'rgba(235,201,131,0.5)', G - 30);
  // the water (1/3 speed), with palms standing round it
  layer(0.33, 700, 473, (x, r) => {
    const w = 220 + r * 120;
    ctx.fillStyle = 'rgba(110,190,230,0.55)';
    ctx.strokeStyle = 'rgba(40,110,150,0.6)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(x, G - 6, w, 16, 0, 0, 7);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.moveTo(x - w * 0.4, G - 8);
    ctx.lineTo(x - w * 0.2, G - 8);
    ctx.moveTo(x + w * 0.1, G - 4);
    ctx.lineTo(x + w * 0.3, G - 4);
    ctx.stroke();
    for (const d of [-1, 1]) {
      const px = x + d * (w + 20);
      ctx.strokeStyle = 'rgba(120,90,60,0.5)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(px, G - 4);
      ctx.quadraticCurveTo(px + d * 14, G - 60, px + d * 6, G - 110 - r * 20);
      ctx.stroke();
      ctx.fillStyle = 'rgba(95,165,85,0.5)';
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i - 2) * 0.6;
        ctx.beginPath();
        ctx.ellipse(px + d * 6 + Math.cos(a) * 30, G - 112 - r * 20 + Math.sin(a) * 14 + 12, 34, 9, a, 0, 7);
        ctx.fill();
      }
    }
  });
  ctx.fillStyle = '#efd9a2';
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.strokeStyle = '#9cc77a';
  ctx.lineWidth = 2.5;
  layer(1, 57, 477, (x, r) => {
    if (r < 0.5) return;
    const y = G + 18 + r * 40;
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo(x - 7, y - 9);
    ctx.moveTo(x, y);
    ctx.lineTo(x + 1, y - 12);
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 8, y - 8);
    ctx.stroke();
  });
  groundLine();
}
// Inside the Pyramid: sandstone blocks, a painted band of hieroglyphs, a low ceiling with beams. The darkness and
// the torchlight go over everything (drawPyramidDark).
function drawPyramid() {
  paperBg();
  ctx.fillStyle = 'rgba(201,163,102,0.78)';
  ctx.fillRect(-30, -30, W + 60, G + 40);
  // the blocks (they move with the world)
  const ox = -(CAM.x % 120);
  ctx.strokeStyle = 'rgba(120,85,45,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let row = 0, y = G + 6; y > -40; row++, y -= 44) {
    ctx.moveTo(-30, y);
    ctx.lineTo(W + 30, y);
    for (let x = ox + (row % 2) * 60; x < W + 60; x += 120) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 44);
    }
  }
  ctx.stroke();
  // a painted band (1/1 speed): little figures, eyes and suns in a row
  const by = G - 250;
  ctx.fillStyle = 'rgba(231,203,140,0.9)';
  ctx.fillRect(-30, by - 30, W + 60, 60);
  ctx.strokeStyle = 'rgba(120,85,45,0.7)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(-40, by - 30, W + 80, 60);
  layer(1, 46, 479, (x, r, i) => {
    glyph(x, by, ((i % 5) + 5) % 5, 0.8);
  });
  // the ceiling and its beams
  const top = G - ROPE_TOP;
  ctx.fillStyle = 'rgba(140,100,55,0.85)';
  ctx.fillRect(-30, -40, W + 60, top + 40 - CAM.y * 0);
  ctx.strokeStyle = 'rgba(80,55,30,0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-30, top);
  ctx.lineTo(W + 30, top);
  ctx.stroke();
  ctx.fillStyle = '#a77a45';
  for (let x = -(CAM.x % 300) - 20; x < W + 40; x += 300) inkRect(x, top - 26, 40, 30, '#a77a45', 2.5);
  // the floor: big flagstones
  ctx.fillStyle = '#c2a06a';
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.strokeStyle = 'rgba(110,80,45,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = -(CAM.x % 90); x < W + 40; x += 90) {
    ctx.moveTo(x, G + 6);
    ctx.lineTo(x - 30, H);
  }
  ctx.moveTo(-30, G + 40);
  ctx.lineTo(W + 30, G + 40);
  ctx.stroke();
  groundLine();
}
// One hieroglyph at (x, y): 0 an eye, 1 a bird, 2 a sun, 3 an ankh, 4 wavy water
function glyph(x, y, k, a) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = '#5b3d24';
  ctx.fillStyle = '#5b3d24';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (k === 0) {
    ctx.ellipse(x, y, 11, 6, 0, 0, 7);
    ctx.moveTo(x + 3, y);
    ctx.arc(x, y, 3, 0, 7);
    ctx.moveTo(x - 4, y + 6);
    ctx.lineTo(x - 7, y + 13);
  } else if (k === 1) {
    ctx.ellipse(x, y + 2, 9, 6, -0.3, 0, 7);
    ctx.moveTo(x + 7, y - 2);
    ctx.lineTo(x + 10, y - 9);
    ctx.lineTo(x + 15, y - 8);
    ctx.moveTo(x - 2, y + 8);
    ctx.lineTo(x - 2, y + 14);
    ctx.moveTo(x + 3, y + 8);
    ctx.lineTo(x + 3, y + 14);
  } else if (k === 2) {
    ctx.arc(x, y, 8, 0, 7);
    ctx.moveTo(x - 13, y + 12);
    ctx.lineTo(x + 13, y + 12);
  } else if (k === 3) {
    ctx.ellipse(x, y - 8, 5, 6, 0, 0, 7);
    ctx.moveTo(x, y - 2);
    ctx.lineTo(x, y + 14);
    ctx.moveTo(x - 9, y + 2);
    ctx.lineTo(x + 9, y + 2);
  } else {
    for (let j = 0; j < 3; j++) {
      ctx.moveTo(x - 12, y - 6 + j * 6);
      for (let i = 0; i < 4; i++) ctx.lineTo(x - 9 + i * 6, y - 6 + j * 6 + (i % 2 ? 3 : -3));
    }
  }
  ctx.stroke();
  ctx.restore();
}
LOOKS.sand = { bg: () => drawSand(), fg: () => {} };
LOOKS.oasis = { bg: () => drawOasis(), fg: () => {} };
LOOKS.pyramid = { bg: () => drawPyramid(), fg: () => drawPyramidDark() };
// ===== DRAWING: in the world (drawLevelBg, behind the fighters): gaps, quicksand, ropes =====
function drawDesertWorld() {
  const D = LV.dz,
    l = viewX() - 60,
    r = viewX() + W / CAM.z + 60;
  for (const p of D.pits) {
    if (p.x1 < l || p.x0 > r) continue;
    const g = ctx.createLinearGradient(0, G, 0, G + 260);
    g.addColorStop(0, '#3a2a1e');
    g.addColorStop(1, '#0c0810');
    ctx.fillStyle = g;
    ctx.fillRect(p.x0, G + 2, p.x1 - p.x0, 900);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (const x of [p.x0, p.x1]) {
      ctx.moveTo(x, G + 6);
      ctx.lineTo(x, G + 900);
    }
    ctx.stroke();
    // a few stones crumbling off the edges
    ctx.fillStyle = '#8a6a44';
    for (const [x, y] of [
      [p.x0 + 14, G + 40],
      [p.x1 - 20, G + 70],
      [p.x0 + 30, G + 110]
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 7);
      ctx.fill();
    }
  }
  for (const q of D.qs) {
    if (q.x1 < l || q.x0 > r) continue;
    const cx = (q.x0 + q.x1) / 2,
      h = (q.x1 - q.x0) / 2;
    ctx.fillStyle = '#d7a95c';
    ctx.strokeStyle = '#9a6a2e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, G + 8, h + 8, 12, 0, 0, 7);
    ctx.fill();
    ctx.stroke();
    // slow swirls (cosmetic)
    ctx.strokeStyle = 'rgba(140,90,40,0.6)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const a = fr * 0.03 + i * 2.1;
      ctx.beginPath();
      ctx.ellipse(cx, G + 8, (h - 10) * (0.3 + i * 0.25), 6 * (0.4 + i * 0.25), 0, a, a + 2);
      ctx.stroke();
    }
  }
  for (let i = 0; i < D.ropes.length; i++) {
    const R = D.ropes[i];
    if (R.x + R.L < l || R.x - R.L > r) continue;
    const hold = PL.find(p => p.rope && p.rope.i === i),
      ex = R.x + R.L * Math.sin(R.a),
      ey = R.y + R.L * Math.cos(R.a);
    // the ring in the ceiling
    inkRect(R.x - 22, R.y - 14, 44, 16, '#a77a45', 3);
    ctx.strokeStyle = '#6b6f78';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(R.x, R.y + 6, 8, 0, 7);
    ctx.stroke();
    // the rope: inked, with a twist drawn along it, a knot at the end
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(R.x, R.y + 12);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.strokeStyle = hold ? '#e2b56a' : '#c9974e';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.strokeStyle = '#8a5f2c';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let t = 20; t < R.L; t += 14) {
      const x = R.x + t * Math.sin(R.a),
        y = R.y + t * Math.cos(R.a);
      ctx.moveTo(x - 3 * Math.cos(R.a), y + 3 * Math.sin(R.a) - 3);
      ctx.lineTo(x + 3 * Math.cos(R.a), y - 3 * Math.sin(R.a) + 3);
    }
    ctx.stroke();
    ctx.fillStyle = '#c9974e';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ex, ey, 8, 0, 7);
    ctx.fill();
    ctx.stroke();
    // a hint under a gap's first rope while nobody is on its ropes: hold Punch
    if (!R.k && !D.ropes.some(q => q.p === R.p && q.by >= 0) && Math.abs(PL[0] ? PL[0].x - R.x : 999) < 420 && (fr >> 5) % 2) {
      ctx.font = '900 16px Impact,"Arial Black",sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = INK;
      ctx.strokeText('HOLD PUNCH!', ex, ey + 32);
      ctx.fillStyle = '#ffd23f';
      ctx.fillText('HOLD PUNCH!', ex, ey + 32);
    }
  }
}
// A fighter sinking in quicksand is drawn lower, cut off at the sand (drawF in render.js)
function drawSunk(f) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(f.x - 200, f.y - 400, 400, 400 + 6);
  ctx.clip();
  ctx.translate(0, f.sink);
  f.skD = 1;
  drawF(f);
  f.skD = 0;
  ctx.restore();
  // sand heaped round them
  ctx.fillStyle = '#d7a95c';
  ctx.strokeStyle = '#9a6a2e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(f.x, f.y + 4, 22 * f.s, 7, 0, Math.PI, 0);
  ctx.fill();
  ctx.stroke();
}
// The scarab swarms (LEVEL.world, in front of the fighters): a buzzing cloud of beetles
function drawSwarms() {
  if (!LV || !LV.sw) return;
  for (const s of LV.sw) {
    const fade = Math.min(1, s.t / 12, (SWARM_T - s.t) / 20);
    ctx.save();
    ctx.globalAlpha = Math.max(0, fade);
    for (let i = 0; i < 16; i++) {
      const a = i * 2.4 + fr * (0.09 + (i % 3) * 0.03),
        rr = 10 + ((i * 7) % 24),
        x = s.x + Math.cos(a) * rr,
        y = s.y + Math.sin(a * 1.3) * rr * 0.7;
      ctx.fillStyle = i % 4 ? '#2a8f84' : '#d4a017';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, y, 5, 3.6, a, 0, 7);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 4 * Math.sin(a), y + 4 * Math.cos(a));
      ctx.lineTo(x + 4 * Math.sin(a), y - 4 * Math.cos(a));
      ctx.stroke();
    }
    ctx.restore();
  }
}
// ===== THE DARK INSIDE THE PYRAMID (LOOKS.pyramid.fg, over the world, under the HUD) =====
// Never too dark: the darkness tops out at DARK_MAX, every wall torch lights a wide circle (the run puts one every
// TORCH_GAP), and every player glows a little.
const DARK_MAX = 0.68,
  TORCH_GAP = 320;
let darkCv = null;
function drawPyramidDark() {
  if (!LV.segs) return;
  const m = segMix(),
    dk = s => (s && BIOMES[s.b].dark ? 1 : 0),
    amt = DARK_MAX * (m.b ? dk(m.a) * (1 - m.f) + dk(m.b) * m.f : dk(m.a));
  if (amt < 0.02) return;
  const c = ctx.canvas;
  if (!darkCv || darkCv.width !== c.width || darkCv.height !== c.height) {
    darkCv = document.createElement('canvas');
    darkCv.width = c.width;
    darkCv.height = c.height;
  }
  const d = darkCv.getContext('2d'),
    vx = viewX(),
    z = CAM.z,
    sx = x => (x - vx) * z,
    sy = y => G + (y - G - CAM.y) * z,
    T0 = ctx.getTransform(),
    lift = CAM_OWN.includes('pyramid') ? 0 : -CAM.y * z, // drawLevelFg moved us by this; the lights are placed without it
    T = new DOMMatrix([T0.a, T0.b, T0.c, T0.d, T0.e - lift * T0.c, T0.f - lift * T0.d]),
    hole = (x, y, r) => {
      const g = d.createRadialGradient(x, y, r * 0.15, x, y, r);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.55, 'rgba(0,0,0,0.75)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      d.fillStyle = g;
      d.beginPath();
      d.arc(x, y, r, 0, 7);
      d.fill();
    };
  d.setTransform(1, 0, 0, 1, 0, 0);
  d.globalCompositeOperation = 'source-over';
  d.clearRect(0, 0, c.width, c.height);
  d.fillStyle = 'rgba(18,10,26,' + amt + ')';
  d.fillRect(0, 0, c.width, c.height);
  d.setTransform(T);
  d.globalCompositeOperation = 'destination-out';
  const torches = [];
  for (const ch of LV.ch)
    if (ch.x0 < vx + W / z + 400 && ch.x0 + ch.w > vx - 400)
      for (const p of ch.props) if (p.k === 'walltorch') torches.push([ch.x0 + p.x, G - 150 * (p.s || 1)]);
  const fl = Math.sin(fr * 0.31) * 6 + Math.sin(fr * 0.13) * 5;
  for (const [x, y] of torches) hole(sx(x), sy(y), (270 + fl) * z);
  for (const p of PL) if (!p.hide) hole(sx(p.x), sy(p.y - 45 * p.s), 175 * z);
  d.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(darkCv, 0, 0);
  ctx.restore();
  // a warm glow round each flame
  ctx.save();
  ctx.setTransform(T);
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, y] of torches) {
    const X = sx(x),
      Y = sy(y),
      g = ctx.createRadialGradient(X, Y, 4, X, Y, 120 * z);
    g.addColorStop(0, 'rgba(255,170,60,' + 0.32 * (amt / DARK_MAX) + ')');
    g.addColorStop(1, 'rgba(255,120,30,0)');
    ctx.fillStyle = g;
    ctx.fillRect(X - 130 * z, Y - 130 * z, 260 * z, 260 * z);
  }
  ctx.restore();
}
// ===== DRAWING: the Desert's props (drawBiomeProp in biomes.js). False = not one of ours =====
function drawDesertProp(k, x, s) {
  const gy = G + 6;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (k === 'cactus') {
    const h = 110 * s;
    inked(
      [
        [x, gy],
        [x, gy - h]
      ],
      22 * s,
      '#7dbf6a'
    );
    inked(
      [
        [x - 10 * s, gy - h * 0.45],
        [x - 30 * s, gy - h * 0.45],
        [x - 30 * s, gy - h * 0.75]
      ],
      13 * s,
      '#7dbf6a'
    );
    inked(
      [
        [x + 10 * s, gy - h * 0.6],
        [x + 28 * s, gy - h * 0.6],
        [x + 28 * s, gy - h * 0.85]
      ],
      12 * s,
      '#7dbf6a'
    );
    ctx.strokeStyle = '#4f8a45';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let y = gy - 14; y > gy - h + 8; y -= 16) {
      ctx.moveTo(x - 4, y);
      ctx.lineTo(x - 4, y - 6);
      ctx.moveTo(x + 4, y - 8);
      ctx.lineTo(x + 4, y - 14);
    }
    ctx.stroke();
  } else if (k === 'desertrock') {
    poly(
      [
        [x - 40 * s, gy],
        [x - 30 * s, gy - 30 * s],
        [x - 6 * s, gy - 44 * s],
        [x + 26 * s, gy - 34 * s],
        [x + 42 * s, gy]
      ],
      '#d8a46a',
      3
    );
    ctx.strokeStyle = 'rgba(140,90,50,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 24 * s, gy - 14 * s);
    ctx.lineTo(x + 30 * s, gy - 18 * s);
    ctx.stroke();
  } else if (k === 'skull') {
    // a cow skull with horns, half in the sand
    ctx.beginPath();
    ctx.ellipse(x, gy - 12 * s, 16 * s, 12 * s, 0, 0, 7);
    shapeDo('#fbf3e2', 2.5);
    for (const d of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + d * 12 * s, gy - 18 * s);
      ctx.quadraticCurveTo(x + d * 30 * s, gy - 24 * s, x + d * 34 * s, gy - 38 * s);
      ctx.quadraticCurveTo(x + d * 24 * s, gy - 26 * s, x + d * 10 * s, gy - 22 * s);
      shapeDo('#fbf3e2', 2.5);
    }
    ctx.fillStyle = INK;
    for (const d of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(x + d * 6 * s, gy - 13 * s, 3 * s, 0, 7);
      ctx.fill();
    }
  } else if (k === 'bones') {
    for (const [dx, a] of [
      [-12, 0.3],
      [12, -0.4]
    ]) {
      ctx.save();
      ctx.translate(x + dx * s, gy - 4);
      ctx.rotate(a);
      inked(
        [
          [-16 * s, 0],
          [16 * s, 0]
        ],
        6 * s,
        '#fbf3e2'
      );
      for (const e of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(e * 16 * s, -3, 4 * s, 0, 7);
        ctx.arc(e * 16 * s, 3, 4 * s, 0, 7);
        shapeDo('#fbf3e2', 2);
      }
      ctx.restore();
    }
  } else if (k === 'tumbleweed') {
    const r = 20 * s,
      a = fr * 0.02 + x;
    ctx.strokeStyle = '#a3814f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const b = a + i * 0.9;
      ctx.moveTo(x + Math.cos(b) * r, gy - r + Math.sin(b) * r);
      ctx.quadraticCurveTo(x, gy - r, x + Math.cos(b + 2.4) * r, gy - r + Math.sin(b + 2.4) * r);
    }
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, gy - r, r, 0, 7);
    ctx.stroke();
  } else if (k === 'sandpot' || k === 'urn') {
    const h = (k === 'urn' ? 62 : 44) * s,
      c = k === 'urn' ? '#4f9fb0' : '#c97a45';
    ctx.beginPath();
    ctx.moveTo(x - 9 * s, gy - h);
    ctx.quadraticCurveTo(x - 26 * s, gy - h * 0.55, x - 12 * s, gy);
    ctx.lineTo(x + 12 * s, gy);
    ctx.quadraticCurveTo(x + 26 * s, gy - h * 0.55, x + 9 * s, gy - h);
    ctx.closePath();
    shapeDo(c, 3);
    inkRect(x - 12 * s, gy - h - 6 * s, 24 * s, 7 * s, c, 2.5);
    ctx.strokeStyle = k === 'urn' ? '#ffd23f' : '#fbe3c2';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 17 * s, gy - h * 0.5);
    ctx.lineTo(x + 17 * s, gy - h * 0.5);
    ctx.stroke();
  } else if (k === 'reeds') {
    ctx.strokeStyle = '#5f9a4a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = -3; i <= 3; i++) {
      const tx = x + i * 7 * s + Math.sin(fr * 0.03 + i) * 3;
      ctx.moveTo(x + i * 4 * s, gy);
      ctx.quadraticCurveTo(x + i * 6 * s, gy - 40 * s, tx, gy - (60 + (i % 2) * 14) * s);
    }
    ctx.stroke();
    ctx.fillStyle = '#8a5a3c';
    for (const i of [-2, 1, 3]) {
      ctx.beginPath();
      ctx.ellipse(x + i * 7 * s, gy - (60 + (i % 2) * 14) * s, 3, 8, 0, 0, 7);
      ctx.fill();
    }
  } else if (k === 'tent') {
    ctx.beginPath();
    ctx.moveTo(x - 70 * s, gy);
    ctx.lineTo(x, gy - 80 * s);
    ctx.lineTo(x + 70 * s, gy);
    ctx.closePath();
    shapeDo('#f2e3c6', 3);
    ctx.strokeStyle = '#d96a4a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 46 * s, gy - 26 * s);
    ctx.lineTo(x + 46 * s, gy - 26 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 14 * s, gy);
    ctx.lineTo(x, gy - 44 * s);
    ctx.lineTo(x + 14 * s, gy);
    ctx.closePath();
    shapeDo('#7a4f2a', 2.5);
  } else if (k === 'camel') {
    // a sleepy camel lying down
    ctx.beginPath();
    ctx.ellipse(x, gy - 22 * s, 46 * s, 20 * s, 0, Math.PI, 0);
    ctx.lineTo(x + 46 * s, gy);
    ctx.lineTo(x - 46 * s, gy);
    ctx.closePath();
    shapeDo('#d8a76a', 3);
    ctx.beginPath();
    ctx.arc(x - 10 * s, gy - 40 * s, 16 * s, Math.PI, 0);
    shapeDo('#d8a76a', 3);
    inked(
      [
        [x + 40 * s, gy - 22 * s],
        [x + 56 * s, gy - 52 * s]
      ],
      11 * s,
      '#d8a76a'
    );
    ctx.beginPath();
    ctx.ellipse(x + 64 * s, gy - 56 * s, 13 * s, 8 * s, 0.2, 0, 7);
    shapeDo('#d8a76a', 3);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 64 * s, gy - 59 * s);
    ctx.lineTo(x + 70 * s, gy - 58 * s);
    ctx.stroke();
  } else if (k === 'well') {
    inkRect(x - 34 * s, gy - 40 * s, 68 * s, 40 * s, '#c9a36a', 3);
    for (const d of [-1, 1]) inkRect(x + d * 30 * s - 4, gy - 100 * s, 8, 60 * s, '#8a5a3c', 2.5);
    poly(
      [
        [x - 48 * s, gy - 98 * s],
        [x, gy - 124 * s],
        [x + 48 * s, gy - 98 * s]
      ],
      '#b85c3c',
      3
    );
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, gy - 98 * s);
    ctx.lineTo(x, gy - 60 * s);
    ctx.stroke();
    inkRect(x - 8, gy - 64 * s, 16, 14, '#8a5a3c', 2);
  } else if (k === 'hieroglyphs') {
    // a carved panel on the wall
    const w = 90 * s,
      h = 120 * s,
      y0 = gy - 60 - h;
    inkRect(x - w / 2, y0, w, h, '#e7cb8c', 3);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) glyph(x - w / 4 + (c * w) / 2, y0 + 22 + r * 36 * s, (r * 2 + c + Math.round(x)) % 5, 0.9);
  } else if (k === 'column') {
    const h = 260 * s,
      w = 34 * s;
    inkRect(x - w / 2, gy - h, w, h, '#dcc08a', 3);
    ctx.strokeStyle = 'rgba(120,85,45,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (const dx of [-w / 4, 0, w / 4]) {
      ctx.moveTo(x + dx, gy - h + 30);
      ctx.lineTo(x + dx, gy - 10);
    }
    ctx.stroke();
    // a lotus top
    ctx.beginPath();
    ctx.moveTo(x - w / 2, gy - h);
    ctx.quadraticCurveTo(x - w, gy - h - 30 * s, x - w * 0.9, gy - h - 40 * s);
    ctx.lineTo(x + w * 0.9, gy - h - 40 * s);
    ctx.quadraticCurveTo(x + w, gy - h - 30 * s, x + w / 2, gy - h);
    ctx.closePath();
    shapeDo('#7fbfa8', 3);
    inkRect(x - w * 0.6, gy - 14, w * 1.2, 14, '#c9a36a', 2.5);
  } else if (k === 'jackal') {
    // a black jackal statue sitting on a block
    inkRect(x - 30 * s, gy - 40 * s, 60 * s, 40 * s, '#dcc08a', 3);
    const b = gy - 40 * s;
    ctx.beginPath();
    ctx.moveTo(x - 20 * s, b);
    ctx.lineTo(x - 14 * s, b - 50 * s);
    ctx.lineTo(x + 6 * s, b - 64 * s);
    ctx.lineTo(x + 16 * s, b - 40 * s);
    ctx.lineTo(x + 22 * s, b);
    ctx.closePath();
    shapeDo('#2a2430', 3);
    ctx.beginPath();
    ctx.moveTo(x + 2 * s, b - 60 * s);
    ctx.lineTo(x + 4 * s, b - 90 * s);
    ctx.lineTo(x + 12 * s, b - 72 * s);
    ctx.lineTo(x + 30 * s, b - 66 * s);
    ctx.lineTo(x + 16 * s, b - 56 * s);
    ctx.closePath();
    shapeDo('#2a2430', 3);
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.arc(x + 12 * s, b - 68 * s, 2.5 * s, 0, 7);
    ctx.fill();
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 12 * s, b - 36 * s);
    ctx.lineTo(x + 14 * s, b - 36 * s);
    ctx.stroke();
  } else if (k === 'sarcophagus') {
    const h = 150 * s,
      w = 54 * s;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.42, gy);
    ctx.lineTo(x - w / 2, gy - h * 0.7);
    ctx.quadraticCurveTo(x - w / 2, gy - h, x, gy - h);
    ctx.quadraticCurveTo(x + w / 2, gy - h, x + w / 2, gy - h * 0.7);
    ctx.lineTo(x + w * 0.42, gy);
    ctx.closePath();
    shapeDo('#e5b844', 3);
    ctx.beginPath();
    ctx.arc(x, gy - h * 0.8, w * 0.3, 0, 7);
    shapeDo('#f2cfa0', 2.5);
    ctx.fillStyle = '#2f5fa8';
    for (let i = 0; i < 4; i++) ctx.fillRect(x - w * 0.4, gy - h * 0.6 + i * 14 * s, w * 0.8, 6 * s);
    ctx.fillStyle = INK;
    for (const d of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(x + d * 6 * s, gy - h * 0.82, 2.5 * s, 0, 7);
      ctx.fill();
    }
  } else if (k === 'walltorch') {
    // a torch on the wall: a bracket, a flame that flickers (cosmetic), lighting the dark round it
    const y = G - 150 * s;
    inkRect(x - 4, y, 8, 40, '#7a4f2a', 2.5);
    inkRect(x - 12, y + 34, 24, 8, '#6b6f78', 2.5);
    const f = Math.sin(fr * 0.4 + x) * 3;
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 2);
    ctx.quadraticCurveTo(x - 12, y - 14, x + f, y - 30);
    ctx.quadraticCurveTo(x + 12, y - 14, x + 10, y + 2);
    ctx.closePath();
    shapeDo('#ff9a1f', 2.5);
    ctx.fillStyle = '#ffe27a';
    ctx.beginPath();
    ctx.ellipse(x, y - 6, 4, 9, 0, 0, 7);
    ctx.fill();
  } else return false;
  return true;
}
// ===== DRAWING: the mummies' wrappings and the Pharaoh's clothes (drawBossParts / bossHead in bosslooks.js) =====
// Pale bands wound round a limb from a to b
function wraps(a, b, r, n) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    L = Math.hypot(dx, dy) || 1,
    nx = -dy / L,
    ny = dx / L,
    h = r * 0.42;
  ctx.strokeStyle = '#ffe3ef';
  ctx.lineWidth = Math.max(1.2, r * 0.13);
  ctx.beginPath();
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1),
      x = a[0] + dx * t,
      y = a[1] + dy * t;
    ctx.moveTo(x - nx * h + dx * 0.04, y - ny * h + dy * 0.04);
    ctx.lineTo(x + nx * h - dx * 0.04, y + ny * h - dy * 0.04);
  }
  ctx.stroke();
}
function desertParts(X, J, r, w, ph) {
  const M = X.has('mummy'),
    seg = (a, b, n) => a && b && wraps(a, b, r, n);
  if (M) {
    if (ph === 'back') seg(J.sh, J.eb, 2), seg(J.eb, J.hb, 2), seg(J.hp, J.kb, 2), seg(J.kb, J.fb, 2);
    else if (ph === 'mid') seg(J.nk, J.hp, 4);
    else if (ph === 'legs') seg(J.hp, J.kf, 2), seg(J.kf, J.f, 2);
    else if (ph === 'front') {
      seg(J.sh, J.ea, 2), seg(J.ea, J.h, 2);
      // a loose end of bandage trailing from the front wrist
      if (J.h && J.ea) {
        const u = unit(sub(J.h, J.ea)),
          t = Math.sin(fr * 0.2) * r * 0.3;
        ctx.strokeStyle = '#ffe3ef';
        ctx.lineWidth = r * 0.2;
        ctx.beginPath();
        ctx.moveTo(J.h[0] - u[0] * r * 0.4, J.h[1] - u[1] * r * 0.4);
        ctx.quadraticCurveTo(J.h[0] - u[0] * r - u[1] * r * 0.6, J.h[1] + r * 0.6, J.h[0] - u[0] * r * 1.3 + t, J.h[1] + r * 1.3);
        ctx.stroke();
      }
    }
  }
  // the Pharaoh: a wide collar of gold and blue at the neck
  if (ph === 'mid' && X.has('broadcollar') && J.nk && J.sh) {
    const c = [(J.nk[0] + J.sh[0]) / 2, (J.nk[1] + J.sh[1]) / 2];
    for (const [k, col] of [
      [1.05, '#2f5fa8'],
      [0.8, '#e5b844'],
      [0.55, '#3fb8a8']
    ]) {
      ctx.beginPath();
      ctx.ellipse(c[0], c[1] + r * 0.1, r * k * 1.15, r * k * 0.6, 0, 0, 7);
      shapeDo(col, w);
    }
  }
  // a white kilt with a gold belt and a striped front panel
  if (ph === 'legs' && X.has('shendyt') && J.hp && J.kf && J.kb) {
    const hp = J.hp,
      kn = Math.max(J.kf[1], J.kb[1]),
      len = Math.max(r * 1.3, (kn - hp[1]) * 0.85),
      fc = J.face;
    ctx.beginPath();
    ctx.moveTo(hp[0] - r * 0.9, hp[1] - r * 0.15);
    ctx.lineTo(hp[0] + r * 0.9, hp[1] - r * 0.15);
    ctx.lineTo(hp[0] + r * 1.3, hp[1] + len);
    ctx.lineTo(hp[0] - r * 1.3, hp[1] + len);
    ctx.closePath();
    shapeDo('#fbf6ea', w);
    ctx.beginPath();
    ctx.moveTo(hp[0] + fc * r * 0.1, hp[1]);
    ctx.lineTo(hp[0] + fc * r * 0.55, hp[1]);
    ctx.lineTo(hp[0] + fc * r * 0.75, hp[1] + len);
    ctx.lineTo(hp[0] - fc * r * 0.1, hp[1] + len);
    ctx.closePath();
    shapeDo('#e5b844', w * 0.8);
    ctx.strokeStyle = '#2f5fa8';
    ctx.lineWidth = Math.max(1, w * 0.6);
    ctx.beginPath();
    for (let i = 1; i < 4; i++) {
      const y = hp[1] + (len * i) / 4;
      ctx.moveTo(hp[0] + fc * r * 0.05, y);
      ctx.lineTo(hp[0] + fc * r * (0.55 + 0.05 * i), y);
    }
    ctx.stroke();
    inkRect(hp[0] - r * 0.95, hp[1] - r * 0.3, r * 1.9, r * 0.34, '#e5b844', w);
  }
  // the crook: a gold-and-blue striped staff with a curl at the top, in the front hand
  if (ph === 'front' && X.has('crook') && J.h) {
    const x = J.h[0],
      y = J.h[1],
      fc = J.face,
      top = y - r * 1.7;
    inked(
      [
        [x, y + r * 2.6],
        [x, top]
      ],
      r * 0.36,
      '#e5b844'
    );
    ctx.strokeStyle = '#2f5fa8';
    ctx.lineWidth = r * 0.36;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    for (let t = y + r * 2.4; t > top + r * 0.3; t -= r * 0.7) {
      ctx.moveTo(x, t);
      ctx.lineTo(x, t - r * 0.25);
    }
    ctx.stroke();
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK;
    ctx.lineWidth = r * 0.5;
    ctx.beginPath();
    ctx.arc(x + fc * r * 0.6, top, r * 0.6, Math.PI, fc > 0 ? Math.PI * 2.2 : -0.2 * Math.PI, fc < 0);
    ctx.stroke();
    ctx.strokeStyle = '#e5b844';
    ctx.lineWidth = r * 0.3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r * 0.3, 0, 7);
    shapeDo('#ff6fae', w * 0.8);
  }
}
// Head parts, in the head's frame (x forward, y down, r = the head's radius)
function desertHead(X, r, w) {
  if (X.has('mummy')) {
    // bandages wound round the head, with two glowing eyes peeking out
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.02, 0, 7);
    ctx.clip();
    ctx.strokeStyle = '#ffe3ef';
    ctx.lineWidth = r * 0.2;
    ctx.beginPath();
    for (const [y, t] of [
      [-0.75, 0.3],
      [-0.35, -0.2],
      [0.35, 0.25],
      [0.75, -0.15]
    ]) {
      ctx.moveTo(-r * 1.1, (y - t) * r);
      ctx.lineTo(r * 1.1, (y + t) * r);
    }
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#ffd23f';
    for (const x of [0.28, 0.68]) {
      ctx.beginPath();
      ctx.arc(x * r, -0.02 * r, r * 0.13, 0, 7);
      ctx.fill();
    }
  }
  if (X.has('nemes')) {
    // the striped headcloth: over the top and back of the head, the flaps hanging down to the shoulders
    ctx.beginPath();
    ctx.moveTo(0.95 * r, -0.4 * r);
    ctx.quadraticCurveTo(0.7 * r, -1.4 * r, -0.4 * r, -1.3 * r);
    ctx.quadraticCurveTo(-1.3 * r, -1.0 * r, -1.2 * r, 0.1 * r);
    ctx.lineTo(-1.05 * r, 1.8 * r);
    ctx.lineTo(-0.3 * r, 1.8 * r);
    ctx.lineTo(-0.35 * r, 0.1 * r);
    ctx.lineTo(-0.25 * r, -0.4 * r);
    ctx.closePath();
    ctx.closePath();
    ctx.save();
    shapeDo('#e5b844', w);
    ctx.clip();
    ctx.strokeStyle = '#2f5fa8';
    ctx.lineWidth = r * 0.16;
    ctx.beginPath();
    for (let i = -6; i < 8; i++) {
      ctx.moveTo(-1.4 * r, i * 0.32 * r);
      ctx.lineTo(1.0 * r, i * 0.32 * r - 0.5 * r);
    }
    ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(0.95 * r, -0.4 * r);
    ctx.quadraticCurveTo(0.7 * r, -1.4 * r, -0.4 * r, -1.3 * r);
    ctx.quadraticCurveTo(-1.3 * r, -1.0 * r, -1.2 * r, 0.1 * r);
    ctx.lineTo(-1.05 * r, 1.8 * r);
    ctx.lineTo(-0.3 * r, 1.8 * r);
    ctx.lineTo(-0.35 * r, 0.1 * r);
    ctx.lineTo(-0.25 * r, -0.4 * r);
    ctx.closePath();
    ctx.strokeStyle = INK;
    ctx.lineWidth = w;
    ctx.stroke();
    // a gold band over the brow and a little cobra at the front
    ctx.strokeStyle = '#d4a017';
    ctx.lineWidth = r * 0.18;
    ctx.beginPath();
    ctx.moveTo(-0.25 * r, -0.45 * r);
    ctx.lineTo(0.95 * r, -0.45 * r);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0.75 * r, -0.72 * r, 0.14 * r, 0.26 * r, 0.3, 0, 7);
    shapeDo('#3fb8a8', w * 0.7);
  }
  if (X.has('pharaohbeard')) {
    // the long narrow ceremonial beard
    ctx.beginPath();
    ctx.moveTo(0.5 * r, 0.75 * r);
    ctx.lineTo(0.85 * r, 0.7 * r);
    ctx.lineTo(0.95 * r, 1.65 * r);
    ctx.quadraticCurveTo(0.8 * r, 1.8 * r, 0.62 * r, 1.65 * r);
    ctx.closePath();
    shapeDo('#5b3d24', w * 0.8);
    ctx.strokeStyle = '#e5b844';
    ctx.lineWidth = Math.max(1, w * 0.5);
    ctx.beginPath();
    for (const y of [1.0, 1.25, 1.5]) {
      ctx.moveTo(0.58 * r, y * r);
      ctx.lineTo(0.9 * r, y * r);
    }
    ctx.stroke();
  }
}
