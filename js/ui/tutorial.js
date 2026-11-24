// StickFighters: the first-play tutorial, in the Training Room: a card at the top shows a picture of what to do and
// the button to press on whatever you play with (touch, keys or a controller), and moves on when you've done it.
// Offered the first time someone starts Story or Arcade (SET.tut), and from the Solo screen's LEARN tile.
// It only watches the game (never changes it), and runs offline only.
// ===== TUTORIAL =====
const TUT = { on: false, i: 0, t: 0, ok: 0, x0: 0, n: { p: 0, k: 0 }, seen: new WeakSet(), run: 0, end: 0, cb: 0, pc: 0 };
// The steps: a picture, a title, the buttons (actions), and when it's done
const TUT_STEPS = [
  { pic: 'move', name: 'MOVE', keys: [['l', 'r']], done: p => Math.abs(p.x - TUT.x0) > 170 },
  { pic: 'jump', name: 'JUMP', keys: [['j']], done: p => p.y < p.gy - 70 },
  { pic: 'punch', name: 'PUNCH THE DUMMY', keys: [['p']], done: () => TUT.n.p >= 3 },
  { pic: 'kick', name: 'KICK IT', keys: [['k']], done: () => TUT.n.k >= 2 },
  { pic: 'combo', name: 'A COMBO: KEEP HITTING', keys: [['p'], ['k']], done: () => TUT.cb >= 4 },
  { pic: 'surge', name: 'SURGE RUN: HOLD SURGE AND MOVE', keys: [['s'], ['l', 'r']], done: () => TUT.run > 40 },
  { pic: 'grab', name: 'GRAB: PUNCH + KICK TOGETHER', keys: [['p', 'k']], plus: 1, done: p => p.st === 'grab' }
];
function startTutorial() {
  SET.tut = 1;
  save();
  startTrain();
  Object.assign(TUT, { on: true, i: 0, t: 0, ok: 0, x0: PL[0].x, n: { p: 0, k: 0 }, seen: new WeakSet(), run: 0, end: 0, cb: 0, pc: 0 });
  document.body.classList.add('tut');
}
function stopTutorial() {
  TUT.on = false;
  document.body.classList.remove('tut');
}
// What you play with, and the name of an action's button on it
function tutDev() {
  if ($('wrap').classList.contains('touch-on')) return 'touch';
  if (typeof curPad === 'function' && curPad()) return 'pad';
  return 'kb';
}
const TOUCH_NAME = { l: '◀', r: '▶', u: '▲', d: '▼', j: 'JUMP', p: 'PUNCH', k: 'KICK', s: 'SURGE', x: 'ULT' };
function tutKey(a) {
  const d = tutDev();
  if (d === 'touch') return TOUCH_NAME[a] || a;
  if (d === 'pad') {
    const g = curPad(),
      B = (SET.binds && SET.binds.pad && SET.binds.pad[padType(g)]) || PADDEF;
    return btnName((B[a] || PADDEF[a])[0], g);
  }
  const B = kbBinds();
  return keyName((B[a] || KEYDEF[a])[0]);
}
// Each frame (from the main loop): watch the player, and move on when a step is done
function tutTick() {
  if (!TUT.on) return;
  if (state !== 'train') return stopTutorial();
  const p = PL[0];
  if (!p) return;
  TUT.t++;
  // count hits on the dummy by button
  if (p.att && p.att.hit.size && !TUT.seen.has(p.att)) {
    TUT.seen.add(p.att);
    if (p.att.b === 'p' || p.att.b === 'k') TUT.n[p.att.b]++;
  }
  TUT.run = p.running ? TUT.run + 1 : 0;
  // hits in a row during this step (a combo)
  const c = p.combo || 0;
  if (c > TUT.pc) TUT.cb += c - TUT.pc;
  else if (c < TUT.pc) TUT.cb = 0;
  TUT.pc = c;
  if (TUT.i >= TUT_STEPS.length) {
    if (++TUT.end > 330) stopTutorial();
    return;
  }
  if (TUT.ok) {
    if (++TUT.ok > 50) {
      TUT.i++;
      TUT.ok = 0;
      TUT.t = 0;
      TUT.x0 = p.x;
      TUT.n = { p: 0, k: 0 };
      TUT.cb = 0;
      if (TUT.i >= TUT_STEPS.length) sfx(880, 0.5, 'triangle', 0.07, 900);
    }
  } else if (TUT.t > 20 && TUT_STEPS[TUT.i].done(p)) {
    TUT.ok = 1;
    sfx(660, 0.15, 'triangle', 0.07, 400);
    sfx(990, 0.2, 'triangle', 0.05, 300);
  }
}
// The card at the top of the screen (drawing only)
function drawTutorial() {
  if (!TUT.on || state !== 'train') return;
  const done = TUT.i >= TUT_STEPS.length,
    s = TUT_STEPS[Math.min(TUT.i, TUT_STEPS.length - 1)],
    w = 470,
    h = 112,
    x = W / 2 - w / 2,
    y = 14 + (TUT.ok ? 0 : Math.max(0, 12 - TUT.t) * 3);
  ctx.save();
  ctx.fillStyle = 'rgba(28,22,38,.2)';
  ctx.fillRect(x + 5, y + 6, w, h);
  ctx.fillStyle = '#fffdf7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  // the picture, in a little frame
  ctx.fillStyle = '#eef4fb';
  ctx.fillRect(x + 10, y + 10, 92, 92);
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 10, y + 10, 92, 92);
  tutPic(done ? 'ready' : s.pic, x + 56, y + 56);
  ctx.textAlign = 'left';
  ctx.fillStyle = INK;
  const title = done ? "YOU'RE READY!" : s.name;
  ctx.font = '900 24px Impact,"Arial Black",sans-serif';
  const fs = Math.min(24, (24 * (w - 130)) / ctx.measureText(title).width); // long titles shrink to fit
  ctx.font = '900 ' + fs.toFixed(1) + 'px Impact,"Arial Black",sans-serif';
  ctx.fillText(title, x + 116, y + 42);
  if (done) {
    ctx.font = '800 16px "Trebuchet MS",sans-serif';
    ctx.fillText('Pause to leave, or keep training.', x + 116, y + 74);
  } else {
    // the buttons, as keycaps: alternatives with "or", together with "+"
    let kx = x + 116;
    const ky = y + 62;
    ctx.font = '900 17px "Trebuchet MS",sans-serif';
    s.keys.forEach((grp, gi) => {
      if (gi) kx = tutWord(s.pic === 'surge' ? '+' : 'then', kx, ky);
      grp.forEach((a, i) => {
        if (i) kx = tutWord(s.plus ? '+' : 'or', kx, ky);
        kx = tutCap(tutKey(a), kx, ky);
      });
    });
    // the steps so far, as dots
    for (let i = 0; i < TUT_STEPS.length; i++) {
      ctx.fillStyle = i < TUT.i || (i === TUT.i && TUT.ok) ? '#3ccf6e' : i === TUT.i ? '#ffd400' : '#e3dccf';
      ctx.beginPath();
      ctx.arc(x + 124 + i * 18, y + 98, 6, 0, 7);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  if (TUT.ok) {
    ctx.save();
    ctx.translate(x + w - 64, y + 56);
    ctx.rotate(-0.15);
    const k = Math.min(1, TUT.ok / 8);
    ctx.scale(k, k);
    ctx.font = '900 34px Impact,"Arial Black",sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 6;
    ctx.strokeText('NICE!', 0, 12);
    ctx.fillStyle = '#3ccf6e';
    ctx.fillText('NICE!', 0, 12);
    ctx.restore();
  }
  ctx.restore();
}
function tutWord(t, x, y) {
  ctx.fillStyle = '#7a6e80';
  ctx.font = '800 15px "Trebuchet MS",sans-serif';
  ctx.fillText(t, x + 4, y + 5);
  const n = x + ctx.measureText(t).width + 10;
  ctx.font = '900 17px "Trebuchet MS",sans-serif';
  return n;
}
function tutCap(t, x, y) {
  const w = Math.max(30, ctx.measureText(t).width + 18);
  ctx.fillStyle = '#ffd400';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y - 15, w, 28, 7);
  else ctx.rect(x, y - 15, w, 28);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.fillText(t, x + w / 2, y + 5);
  ctx.textAlign = 'left';
  return x + w + 6;
}
// The step's picture: a little stick figure doing it
function tutPic(k, cx, cy) {
  const col = (PL[0] && PL[0].col) || '#ff7a00',
    fig = (x, y, pose, s = 0.62, c = col, f = 1) => drawFig(x, y, f, pose, s, c, shade(c, -0.22), 0, 1, 6),
    arrow = (x1, y1, x2, y2) => {
      const a = Math.atan2(y2 - y1, x2 - x1);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2 - 8 * Math.cos(a - 0.5), y2 - 8 * Math.sin(a - 0.5));
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 8 * Math.cos(a + 0.5), y2 - 8 * Math.sin(a + 0.5));
      ctx.stroke();
    },
    t = fr;
  const P = STANCES[0].p;
  if (k === 'move') {
    fig(cx + Math.sin(t * 0.08) * 10, cy + 38, runPose({ t }));
    arrow(cx - 18, cy - 30, cx - 40, cy - 30);
    arrow(cx + 18, cy - 30, cx + 40, cy - 30);
  } else if (k === 'jump') {
    fig(cx, cy + 38 - Math.abs(Math.sin(t * 0.08)) * 22, P);
    arrow(cx + 30, cy + 10, cx + 30, cy - 30);
  } else if (k === 'punch' || k === 'kick' || k === 'combo' || k === 'grab') {
    const mv = k === 'kick' ? 'kick' : 'jab',
      u = (t % 40) / 40;
    fig(cx - 18, cy + 38, k === 'grab' ? kf(A.jab.k, 0.6) : kf(A[mv].k, u < 0.5 ? u * 2 : 1));
    fig(cx + 22, cy + 38, P, 0.62, '#ff4fa3', -1);
    if (k === 'combo')
      for (let i = 0; i < 3; i++) star4(cx - 20 + i * 18, cy - 34 + (i % 2) * 6, 6, '#ffd400');
    else if (u > 0.4 && k !== 'grab') star4(cx + 12, cy + (k === 'kick' ? 0 : -8), 8, '#ffd400');
  } else if (k === 'surge') {
    ctx.strokeStyle = '#ffd400';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - 44, cy - 6 + i * 14);
      ctx.lineTo(cx - 20, cy - 6 + i * 14);
      ctx.stroke();
    }
    fig(cx + 6, cy + 38, runPose({ t: t * 2 }));
  } else if (k === 'ready') {
    fig(cx, cy + 38, VPOSE['pose-flex'] ? VPOSE['pose-flex'](t) : P);
    star4(cx - 30, cy - 30, 7, '#ffd400');
    star4(cx + 32, cy - 24, 6, '#ffd400');
  }
}
// The first time someone starts Story or Arcade: learn the moves first, or just play
function tutOffer(go) {
  if (SET.tut) return go();
  SET.tut = 1;
  save();
  show('s-learn');
  $('ln-learn').onclick = startTutorial;
  $('ln-play').onclick = go;
  $('ln-learn').focus({ preventScroll: true });
}
$('b-learn').onclick = startTutorial;
