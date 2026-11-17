// Orange vs. the Pink Army: Level mode: a scrolling level built from chunk data (js/data/levels.js), with
// encounters, a breakable gate, checkpoints, and a level-complete screen.
// ===== LEVEL MODE (M8) =====
// Run-time copy of the level being played; the data in LEVELS/CHUNKS is never changed.
let LV = null;
function buildLevel(id) {
  const def = LEVELS[id],
    ch = [],
    encs = [],
    gates = [];
  let x = 0;
  for (const cid of def.chunks) {
    const c = CHUNKS[cid];
    ch.push({ id: cid, x0: x, w: c.w, dusk: c.dusk || 0, flies: c.flies || 0, props: c.props || [] });
    if (c.enc)
      encs.push({
        x: x + c.enc.at,
        lock: Math.max(0, x + c.enc.at - W / 2),
        lvl: c.enc.lvl || 1,
        max: c.enc.max || 4,
        list: c.enc.list.slice(),
        st: 0,
        q: []
      });
    if (c.gate) gates.push({ k: c.gate.k, x: x + c.gate.x, hp: c.gate.hp, max: c.gate.hp, hit: 0 });
    x += c.w;
  }
  // cp = index of the last cleared encounter (the checkpoint); -1 = the start of the level
  return { id, def, ch, encs, gates, len: x, cp: -1, t: 0, go: 0 };
}
// Sets up the simulation for the current LV (no screens), used by play and by the self-test.
function levelSim() {
  MODE = LEVEL;
  state = 'play';
  WW.l = 0;
  WW.r = LV.len;
  const cpE = LV.encs[LV.cp];
  CAM.x = cpE ? cpE.lock : 0;
  PL.forEach((p, i) => {
    p.x = CAM.x + 200 - i * 60;
    p.face = 1;
  });
  levelWalls();
  LV.go = 200;
}
function closePanels() {
  for (const id of ['moves', 'info', 'feel']) $(id).hidden = true;
  document.querySelectorAll('#tbtns button').forEach(b => b.classList.remove('on'));
}
function startLevel(id) {
  closePanels();
  newSeed();
  init();
  LV = buildLevel(id);
  levelSim();
  paused = false;
  releaseAll();
  show(null);
  bn(LV.def.name);
}
// After a KO: back to the last checkpoint with full health. Score and the level clock carry on.
function continueLevel() {
  const keep = { score, maxc, meter: PL[0].meter };
  init();
  score = keep.score;
  maxc = keep.maxc;
  PL[0].meter = keep.meter;
  LV.encs.forEach((e, i) => {
    if (i > LV.cp) {
      e.st = 0;
      e.q = [];
    }
  });
  levelSim();
  paused = false;
  releaseAll();
  show(null);
  bn('CONTINUE!');
}
// Walls for living fighters: the screen edges, or the gate if it is closer.
function levelWalls() {
  WB.l = CAM.x;
  WB.r = CAM.x + W;
  const g = LV.gates.find(g => g.hp > 0);
  if (g && g.x - 44 < WB.r) WB.r = g.x - 44;
}
function hurtGate(g, d) {
  g.hp -= d;
  g.hit = 10;
  spark(g.x - 30, G - 24, 22, '#ffd400');
  sfx(140, 0.12, 'square', 0.07, -60);
  noise(0.08, 0.08, 900);
  shake = Math.max(shake, 4);
  for (let i = 0; i < 4; i++)
    fxp({
      k: 'c',
      x: g.x - 30,
      y: G - 20,
      vx: -1 - rnd() * 3,
      vy: -2 - rnd() * 3,
      a: 0,
      va: rnd() - 0.5,
      l: 40,
      m: 40,
      c: '#a4794f'
    });
  if (g.hp <= 0) {
    g.hp = 0;
    for (let i = 0; i < 26; i++)
      fxp({
        k: 'c',
        x: g.x - 40 + rnd() * 80,
        y: G - 30 + rnd() * 20,
        vx: (rnd() - 0.5) * 8,
        vy: -3 - rnd() * 6,
        a: rnd() * 6,
        va: rnd() - 0.5,
        l: 70,
        m: 70,
        c: rnd() < 0.5 ? '#a4794f' : '#c9a27a'
      });
    ring(g.x, G - 20, 80);
    shake = Math.max(shake, 12);
    stop = Math.max(stop, 6);
    sfx(90, 0.4, 'sawtooth', 0.09, -40);
    txt(g.x, G - 90, 'SMASHED!', '#ff7a00', 26);
    score += 50;
    LV.go = 220;
  }
}
function levelTick() {
  LV.t++;
  reviveTick();
  if (LV.go > 0) LV.go--;
  const alive = PL.filter(p => p.st !== 'dead'),
    lead = Math.max(...alive.map(p => p.x)),
    ae = LV.encs.find(e => e.st === 1),
    ne = LV.encs.find(e => e.st === 0),
    g = LV.gates.find(g => g.hp > 0);
  if (g && g.hit > 0) g.hit--;
  if (!ae) {
    // the camera only moves forward, and stops at the next fight or in front of the gate
    let mx = LV.len - W;
    if (ne) mx = Math.min(mx, ne.lock);
    if (g) mx = Math.min(mx, g.x - W + 140);
    const d = Math.min(lead - W * 0.45, mx) - CAM.x;
    if (d > 0) CAM.x += Math.min(d, 1 + d * 0.08);
    if (ne && CAM.x >= ne.lock - 0.5) {
      ne.st = 1;
      ne.q = ne.list.slice();
      coopExtra(ne.q);
      wave = ne.lvl;
      spawnT = 30;
      LV.go = 0;
      bn(ne.list.includes('c') ? 'CAPTAIN AMBUSH!' : 'AMBUSH!');
      sfx(330, 0.25, 'square', 0.05, 200);
    }
  }
  levelWalls();
  if (ae) {
    if (ae.q.length && --spawnT <= 0 && E.filter(e => !e.dying).length < ae.max + PL.length - 1) {
      spawn(ae.q.shift());
      spawnT = 40;
    }
    if (!ae.q.length && !E.some(e => !e.dying)) {
      ae.st = 2;
      LV.cp = LV.encs.indexOf(ae);
      for (const p of alive) p.hp = Math.min(p.max, p.hp + 25);
      score += 100 * ae.lvl;
      bn(LV.encs.some(e => e.st === 0) ? 'CLEAR!' : 'TRAIL CLEAR!');
      LV.go = 220;
      sfx(600, 0.3, 'square', 0.05, 400);
    }
  }
  // the gate breaks under your attacks, and under enemies splatted into it
  if (g) {
    for (const p of alive) {
      const a = p.att;
      if (!a || a.gate || a.f < a.d.h[0] || a.f > a.d.h[1]) continue;
      if (ov(hbox(p), [g.x - 46, G - 44, g.x + 46, G + 6])) {
        a.gate = 1;
        hurtGate(g, Math.max(3, a.d.dmg || 0));
      }
    }
    for (const e of E)
      if (e.st === 'splat' && !e.gsp && Math.abs(e.x - (g.x - 68)) < 4) {
        e.gsp = 1;
        hurtGate(g, 12);
      }
  }
  for (const e of E) if (e.x < CAM.x - 120) e.gone = 1; // bodies left behind as the trail scrolls on
  if (!ne && !ae && lead > LV.len - 150) levelClear();
}
function fmtT(fr_) {
  const s = Math.floor(fr_ / 60);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
function levelClear() {
  state = 'clear';
  if (SELFTESTING) return;
  const id = LV.id,
    old = PROG[id] || {},
    tb = Math.max(0, 600 - Math.floor(LV.t / 60)) * 5;
  score += tb;
  const nb = !old.score || score > old.score,
    nt = !old.time || LV.t < old.time;
  PROG[id] = {
    done: 1,
    score: Math.max(score, old.score || 0),
    time: Math.min(LV.t, old.time || Infinity),
    combo: Math.max(maxc, old.combo || 0)
  };
  save();
  grantStars(old.done ? STAR_BONUS.level : STAR_BONUS.levelFirst, 'level');
  runEnd('c-st', { combo: maxc });
  sfx(520, 0.5, 'square', 0.05, 500);
  $('c-l1').textContent =
    'Time ' + fmtT(LV.t) + ' · Score ' + score + ' (time bonus ' + tb + ') · Best combo ' + maxc;
  $('c-l2').textContent =
    (nb ? 'New best score! ' : 'Best ' + PROG[id].score + '. ') +
    (nt ? 'New best time!' : 'Best time ' + fmtT(PROG[id].time) + '.');
  $('c-l3').textContent = 'Next: ' + LV.def.next;
  $('c-h1').textContent = 'LEVEL CLEAR!';
  $('b-next').textContent = 'PLAY AGAIN';
  // a moment to see your victory pose (M10) before the results
  bn('LEVEL CLEAR!');
  setTimeout(() => {
    if (state === 'clear' && MODE === LEVEL) show('s-clear');
  }, 1800);
}
function levelFail() {
  state = 'over';
  if (!SELFTESTING) runEnd('o-st', { combo: maxc });
  $('o-l1').textContent =
    LV.def.name +
    ' · Score ' +
    score +
    ' · ' +
    (LV.cp >= 0 ? 'checkpoint ' + (LV.cp + 1) + ' of ' + LV.encs.length : 'no checkpoint yet');
  $('o-l2').textContent = 'Continue from the last fight you won, or start the trail again.';
  $('b-cont').hidden = false;
  $('b-again').textContent = 'RESTART LEVEL';
  show('s-over');
}
// HUD: level name, a trail map with the fights, the gate and you, enemies left, and the GO arrow.
function levelHud() {
  ctx.fillText(LV.def.name, W / 2, 26);
  const bw = 230,
    bx = W / 2 - bw / 2,
    by = 38,
    X = x => bx + (bw * x) / LV.len,
    lead = Math.max(...PL.map(p => p.x));
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + bw, by);
  ctx.stroke();
  for (const e of LV.encs) {
    ctx.fillStyle = e.st === 2 ? '#7a6e80' : e.st === 1 ? '#e8212b' : '#ff4fa3';
    ctx.beginPath();
    ctx.arc(X(e.x), by, 5, 0, 7);
    ctx.fill();
  }
  for (const g of LV.gates) {
    ctx.fillStyle = g.hp > 0 ? '#a4794f' : '#d9d3c6';
    ctx.fillRect(X(g.x) - 4, by - 4, 8, 8);
  }
  ctx.fillStyle = INK;
  ctx.fillRect(bx + bw - 2, by - 10, 3, 10);
  ctx.fillStyle = '#ff7a00';
  ctx.beginPath();
  ctx.arc(Math.min(bx + bw, X(lead)), by, 6, 0, 7);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.stroke();
  const ae = LV.encs.find(e => e.st === 1);
  if (ae) {
    const n = ae.q.length + E.filter(e => !e.dying).length;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#e8212b';
    ctx.fillText(n + ' LEFT', W - 16, 58);
  } else if (LV.go > 0 && (fr >> 4) % 2 && state === 'play') {
    ctx.textAlign = 'right';
    ctx.font = '900 44px Impact,"Arial Black",sans-serif';
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';
    ctx.strokeText('GO →', W - 24, 230);
    ctx.fillStyle = '#ff7a00';
    ctx.fillText('GO →', W - 24, 230);
  }
}
const LEVEL = {
  id: 'level',
  drops: 1,
  update: levelTick,
  over: levelFail,
  bg: () => drawWoods(),
  fg: () => drawWoodsFg(),
  hud: levelHud,
  revive: 1
};
