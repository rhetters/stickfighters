// StickFighters: Game shell (screens, settings), screen fit, simulation step update(), main loop and boot. Loads last.
// ===== GAME SHELL: title, pause, settings, save =====
let paused = false,
  back = 's-title',
  curSeed = 0,
  sawTouch = false,
  DPR = 1,
  gridDPR = 0;
const gridC = document.createElement('canvas'),
  coarseMQ = matchMedia('(pointer:coarse)'),
  portraitMQ = matchMedia('(orientation:portrait) and (pointer:coarse)');
const SCREENS = [
  's-title',
  's-online',
  's-char',
  's-house',
  's-lobby',
  's-pause',
  's-settings',
  's-binds',
  's-backup',
  's-over',
  's-clear'
];
function show(id) {
  for (const s of SCREENS) $(s).hidden = s !== id;
  $('ui').hidden = !id;
  if (id) {
    const b = $(id).querySelector('button');
    if (b && id !== 's-settings') b.focus({ preventScroll: true });
  } else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  $('wrap').classList.toggle('playing', !id && (state === 'play' || state === 'train'));
  $('wrap').classList.toggle('training', !id && state === 'train');
  if (NET.match && id) onlineScreens(id);
  else if (id === 's-pause' || id === 's-over' || id === 's-clear') onlineScreensReset();
}
function newSeed() {
  const s = String(SET.seed || '').trim();
  // online: everyone uses the seed the host chose
  if (typeof NET !== 'undefined' && NET.match) {
    curSeed = NET.seed >>> 0;
    reseed(curSeed);
    return;
  }
  curSeed = s
    ? /^\d+$/.test(s)
      ? +s >>> 0
      : [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7)
    : (Date.now() ^ Math.floor(Math.random() * 4294967296)) >>> 0;
  reseed(curSeed);
}
function openTitle() {
  $('moves').hidden = true;
  $('feel').hidden = true;
  $('info').hidden = true;
  document.querySelectorAll('#tbtns button').forEach(b => b.classList.remove('on'));
  state = 'menu';
  paused = false;
  releaseAll();
  ROSTER = [];
  applyTouchVis();
  document.body.classList.remove('train');
  $('trainpanel').hidden = true;
  newSeed();
  init();
  show('s-title');
  titleView();
}
function start() {
  $('moves').hidden = true;
  $('info').hidden = true;
  $('feel').hidden = true;
  document.querySelectorAll('#tbtns button').forEach(b => b.classList.remove('on'));
  newSeed();
  init();
  state = 'play';
  paused = false;
  releaseAll();
  show(null);
  nextWave();
}
function startTrain() {
  newSeed();
  init();
  state = 'train';
  paused = false;
  LAST = null;
  TR.freeze = 0;
  TR.ts = 1;
  syncTrain();
  releaseAll();
  document.body.classList.add('train');
  $('trainpanel').hidden = false;
  show(null);
  gridDPR = 0;
  resize();
  requestAnimationFrame(() => {
    gridDPR = 0;
    resize();
  });
  spawnDummy('g');
}
function pause(on) {
  if (state !== 'play' && state !== 'train') return;
  paused = on;
  if (on) {
    releaseAll();
    $('p-seed').textContent = 'Seed ' + curSeed + ' (enter it in Settings to replay the same spawns)';
    show('s-pause');
  } else show(null);
}
const togglePause = () => pause(!paused);
// A player pressing pause (Esc, a controller's Start, the pause button). Walking around your own house, that goes
// straight back to the house builder; automatic pauses (switching apps, turning the iPad) still show the menu.
function playerPause() {
  if (!paused && live() && MODE === HOUSE_MODE && !NET.match) return openHouse();
  togglePause();
}
function over() {
  if (state !== 'play') return;
  if (MODE.over) return MODE.over();
  $('b-cont').hidden = true;
  $('b-again').textContent = 'FIGHT AGAIN';
  state = 'over';
  const nb = score > BEST.score;
  BEST.score = Math.max(BEST.score, score);
  BEST.wave = Math.max(BEST.wave, wave);
  BEST.combo = Math.max(BEST.combo, maxc);
  save();
  runEnd('o-st', { combo: maxc, wave });
  $('o-l1').textContent = 'Wave ' + wave + ' · Score ' + score + ' · Best combo ' + maxc;
  $('o-l2').textContent = nb ? 'New best score!' : 'Best: ' + BEST.score;
  show('s-over');
}
function applyTouchVis() {
  $('wrap').classList.toggle(
    'touch-on',
    (SET.touch === 'on' || (SET.touch === 'auto' && (coarseMQ.matches || sawTouch))) &&
      !(ROSTER.length && devSlot('touch') < 0)
  );
}
function applySet() {
  const w = $('wrap');
  w.style.setProperty('--ts', SET.tsize);
  w.style.setProperty('--to', SET.topac);
  applyTouchVis();
  applyLayout();
}
addEventListener(
  'pointerdown',
  e => {
    if (e.pointerType === 'touch' && !sawTouch) {
      sawTouch = true;
      applyTouchVis();
    }
  },
  { passive: true }
);
function bindSettings() {
  const vol = $('o-vol');
  vol.value = Math.round(SET.vol * 100);
  vol.oninput = () => {
    SET.vol = vol.value / 100;
    save();
  };
  vol.onchange = () => sfx(260, 0.12, 'square', 0.06);
  const sel = $('o-touch');
  sel.value = SET.touch;
  sel.onchange = () => {
    SET.touch = sel.value;
    applySet();
    save();
  };
  for (const [id, key] of [
    ['o-tsize', 'tsize'],
    ['o-topac', 'topac']
  ]) {
    const el = $(id);
    el.value = SET[key];
    el.oninput = () => {
      SET[key] = parseFloat(el.value);
      applySet();
      save();
    };
  }
  fillProfiles();
  $('o-prof').onchange = () => {
    LAY.active = $('o-prof').value;
    saveLay();
    applyLayout();
  };
  $('o-edit').onclick = openEditor;
  {
    const el = $('o-surge');
    el.value = SET.surge || 'hold';
    el.onchange = () => {
      SET.surge = el.value;
      for (const I of INP) {
        I.sl = false;
        I.K.s = 0;
      }
      document.querySelector('.tb[data-a=s]').classList.remove('on');
      save();
    };
  }
  for (const [id, key] of [
    ['o-hist', 'hist'],
    ['o-calm', 'calm']
  ]) {
    const el = $(id);
    el.checked = !!SET[key];
    el.onchange = () => {
      SET[key] = el.checked ? 1 : 0;
      applySet();
      save();
    };
  }
  const sd = $('o-seed');
  sd.value = SET.seed;
  sd.oninput = () => {
    SET.seed = sd.value;
    save();
  };
}
$('b-start').onclick = start;
$('b-train').onclick = startTrain;
// ===== TITLE MENU =====
// First visit: a flashing PRESS START; any key, tap or controller button opens the menu.
// SOLO splits into CAMPAIGN | ARCADE and MULTIPLAYER into LOCAL | ONLINE, in place: the split row sits on top of
// the button it replaces, so the title and the other buttons never move or resize. Back folds it up again.
const TITLE = { ready: false, keepOpen: false };
const SPLITS = {
  solo: ['b-solo', 'solorow', 'b-level'],
  mp: ['b-mp', 'mprow', 'b-multi'],
  cust: ['b-cust', 'custrow', 'b-char']
};
function titleView() {
  $('press').hidden = TITLE.ready;
  $('tmenu').hidden = !TITLE.ready;
  for (const k in SPLITS) splitShow(k, TITLE.keepOpen, true);
  if (TITLE.ready) $(TITLE.keepOpen ? 'b-level' : 'b-solo').focus({ preventScroll: true });
}
function titleReveal() {
  if (TITLE.ready) return false;
  TITLE.ready = true;
  sfx(520, 0.15, 'square', 0.05, 400);
  titleView();
  return true;
}
function splitShow(k, open, quiet) {
  const [btn, row, first] = SPLITS[k];
  $(btn).style.visibility = open ? 'hidden' : '';
  $(row).hidden = !open;
  if (!quiet) $(open ? first : btn).focus({ preventScroll: true });
}
function splitOpen(k, poof) {
  for (const o in SPLITS) if (o !== k) splitShow(o, false, true);
  splitShow(k, true);
  if (poof) titlePoof(k);
}
// An orange puff of cloud where the button was, fading as its two buttons pop in (drawing only; skipped when the
// device asks for reduced motion)
const POOF = [
  [0, 0, 1.15, 0],
  [-0.62, 0.1, 0.8, 30],
  [0.6, -0.08, 0.85, 20],
  [-0.3, -0.38, 0.7, 50],
  [0.32, 0.36, 0.72, 40],
  [-0.95, -0.2, 0.5, 70],
  [0.98, 0.22, 0.55, 60],
  [0.05, 0.45, 0.6, 80]
];
function titlePoof(k) {
  const [btn, row] = SPLITS[k],
    slot = $(btn).parentElement;
  $(row).classList.remove('popin');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  void $(row).offsetWidth; // restart the pop-in animation
  $(row).classList.add('popin');
  const w = $(btn).offsetWidth,
    h = $(btn).offsetHeight,
    cloud = document.createElement('span');
  cloud.className = 'poof';
  cloud.setAttribute('aria-hidden', 'true');
  for (const [x, y, r, d] of POOF) {
    const p = document.createElement('i');
    p.style.cssText =
      'left:' +
      (50 + x * 40) +
      '%;top:' +
      (50 + y * 50) +
      '%;width:' +
      h * r * 1.5 +
      'px;height:' +
      h * r * 1.5 +
      'px;animation-delay:' +
      d +
      'ms';
    cloud.appendChild(p);
  }
  cloud.style.width = w + 'px';
  cloud.style.height = h + 'px';
  slot.appendChild(cloud);
  setTimeout(() => cloud.remove(), 700);
}
// Back on the title: fold whichever row is open. Returns true if something was folded.
function titleBack() {
  if (TITLE.keepOpen) return false;
  for (const k in SPLITS)
    if (!$(SPLITS[k][1]).hidden) {
      splitShow(k, false);
      return true;
    }
  return false;
}
const pressMode = () => !$('s-title').hidden && !$('ui').hidden && !TITLE.ready;
// used by the automated tests: open everything at once
// Opens the whole title menu at once (used by the tests in tools/tests to skip PRESS START)
function titleOpenAll() {
  TITLE.ready = TITLE.keepOpen = true;
  titleView();
}
$('b-solo').onclick = () => splitOpen('solo', true);
$('b-mp').onclick = () => splitOpen('mp', true);
$('b-cust').onclick = () => splitOpen('cust', true);
$('b-online').onclick = () => openOnline();
addEventListener('gamepadconnected', () => {
  if (pressMode()) titleReveal();
});
// A second check that doesn't depend on animation frames, in case the browser holds those back before the
// first touch (patch 2, iPad): any controller button or stick opens the title.
setInterval(() => {
  if (!pressMode() || !navigator.getGamepads) return;
  for (const g of navigator.getGamepads())
    if (g && (g.buttons.some(b => b && b.pressed) || g.axes.some(v => Math.abs(v) > 0.6))) {
      // the button that opened the title is still down: the menu must not also take it as a press
      padPrev[g.index] = g.buttons.map(b => !!(b && b.pressed));
      titleReveal();
    }
}, 150);
$('s-title').addEventListener('pointerdown', e => {
  if (pressMode()) {
    titleReveal();
    e.preventDefault();
  }
});
addEventListener(
  'keydown',
  e => {
    if (pressMode()) {
      titleReveal();
      e.preventDefault();
      e.stopImmediatePropagation();
    } else if (e.key === 'Escape' && !$('s-title').hidden && !$('ui').hidden) titleBack();
  },
  true
);
$('b-set1').onclick = () => {
  renderSetFeel();
  back = 's-title';
  show('s-settings');
};
$('b-resume').onclick = () => pause(false);
// Online: only the host restarts or ends a match, for everyone; a guest's MENU / QUIT leaves the room.
const netLeaveToTitle = () => {
  netLeave();
  openTitle();
};
const netOr = (fn, cmd) => () =>
  NET.match ? (NET.host ? netCmd(cmd) : cmd === 'room' && netLeaveToTitle()) : fn();
$('b-restart').onclick = () => {
  if (NET.match) return NET.host && netCmd('again');
  if (state === 'train') startTrain();
  else if (MODE === LEVEL) startLevel(LV.id);
  else if (MODE === VERSUS) startVersus();
  else if (MODE === HOUSE_MODE) startHouse(HVIEW);
  else start();
};
$('b-set2').onclick = () => {
  renderSetFeel();
  back = 's-pause';
  show('s-settings');
};
$('b-quit').onclick = netOr(() => (MODE === HOUSE_MODE ? openHouse() : openTitle()), 'room');
$('b-back').onclick = () => show(back);
$('b-again').onclick = netOr(() => (MODE === LEVEL ? startLevel(LV.id) : start()), 'again');
$('b-cont').onclick = netOr(continueLevel, 'cont');
$('b-level').onclick = () => startLevel('woods1');
$('b-next').onclick = netOr(() => (MODE === VERSUS ? startVersus() : startLevel(LV.id)), 'again');
$('b-title2').onclick = netOr(openTitle, 'room');
$('b-title').onclick = netOr(openTitle, 'room');
$('pausebtn').onclick = () => playerPause();
// Pose wheel on touch: hold POSE, aim with the stick, let go to strike the pose
{
  const pb = $('posebtn'),
    on = v => e => {
      e.preventDefault();
      pb.classList.toggle('on', v);
      setA('tc', 'e', v);
    };
  pb.addEventListener('pointerdown', on(1));
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) pb.addEventListener(ev, on(0));
  pb.addEventListener('pointerdown', e => pb.setPointerCapture && pb.setPointerCapture(e.pointerId));
}
// training panel + hotkeys (1/2/3 spawn, 0 clear, H boxes, [ ] speed, \ freeze, . step)
function syncTrain() {
  document
    .querySelectorAll('[data-ts]')
    .forEach(b => b.classList.toggle('on', parseFloat(b.dataset.ts) === TR.ts));
  $('t-freeze').classList.toggle('on', !!TR.freeze);
}
document.querySelectorAll('[data-sp]').forEach(b => (b.onclick = () => spawnDummy(b.dataset.sp)));
$('t-clear').onclick = clearDummies;
$('t-moves').onclick = toggleMoves;
$('t-feel').onclick = toggleFeel;
$('t-info').onclick = toggleInfo;
$('t-exit').onclick = openTitle;
['boxes', 'frames', 'hist', 'god', 'passive', 'inf', 'mortal'].forEach(k => {
  const el = $('t-' + k);
  el.onchange = () => {
    TR[k] = el.checked ? 1 : 0;
  };
});
document.querySelectorAll('[data-ts]').forEach(
  b =>
    (b.onclick = () => {
      TR.ts = parseFloat(b.dataset.ts);
      syncTrain();
    })
);
$('t-freeze').onclick = () => {
  TR.freeze ^= 1;
  syncTrain();
};
$('t-step').onclick = () => {
  TR.freeze = 1;
  TR.step = 1;
  syncTrain();
};
$('trainpanel').addEventListener('click', e => {
  if (e.target.blur) e.target.blur();
});
addEventListener('keydown', e => {
  if (state !== 'train' || paused || e.repeat || CAP || KEYS[(e.key || '').toLowerCase()]) return;
  const k = e.key;
  if (k === 'm' || k === 'M') toggleMoves();
  else if (k === 'f' || k === 'F') toggleFeel();
  else if (k === 'i' || k === 'I') toggleInfo();
  else if (k === '1') spawnDummy('g');
  else if (k === '2') spawnDummy('r');
  else if (k === '3') spawnDummy('b');
  else if (k === '4') spawnDummy('u');
  else if (k === '5') spawnDummy('f');
  else if (k === '6') spawnDummy('c');
  else if (k === '0') clearDummies();
  else if (k === 'h' || k === 'H') {
    TR.boxes ^= 1;
    $('t-boxes').checked = !!TR.boxes;
  } else if (k === '[') {
    TR.ts = TR.ts > 0.25 ? TR.ts / 2 : 0.25;
    syncTrain();
  } else if (k === ']') {
    TR.ts = TR.ts < 1 ? TR.ts * 2 : 1;
    syncTrain();
  } else if (k === '\\') {
    TR.freeze ^= 1;
    syncTrain();
  } else if (k === '.') {
    TR.freeze = 1;
    TR.step = 1;
    syncTrain();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && live()) pause(true);
});
function update() {
  const hold = () => {
    for (const I of INP) for (const a in I.press) I.press[a]++;
    for (const p of PL) if (p.att) p.att.pf++;
  }; // input buffers don't expire during hit-stop
  for (const f of [...PL, ...E]) if (f.hs > 0) f.hs--;
  if (stop > 0) {
    stop--;
    hold();
    return;
  }
  if (slow > 0) {
    slow--;
    if (fr % 3) {
      hold();
      return;
    }
  }
  if (MODE.pre && MODE.pre()) return;
  for (const p of PL) updP(p);
  director();
  for (const e of E) updE(e);
  bowl();
  sep();
  if (MODE.drops && state === 'play') dropScan();
  pickTick();
  E = E.filter(e => !e.gone);
  {
    const cs = E.filter(e => e.corpse && e.rag && !e.rag.dis);
    if (cs.length > 12) {
      cs.sort((a, b) => b.ct - a.ct);
      for (const c of cs.slice(0, cs.length - 12)) c.rag.dis = 1;
    }
  } // body cap
  for (const e of E) {
    if (e.corpse) continue;
    if (!isFinite(e.x) || !isFinite(e.y)) {
      e.x = (WB.l + WB.r) / 2;
      e.y = G;
      e.vx = e.vy = 0;
      e.st = 'down';
      e.dt = 20;
    }
    if (e.st === 'fly') {
      if (++e.ft > 400) {
        e.st = 'down';
        e.dt = 20;
        e.y = G;
      }
    } else e.ft = 0;
  } // safety net: nothing stays stuck
  if (PL.some(p => p.st !== 'dead') && state === 'play') MODE.update();
  for (const x of FX) {
    x.l--;
    if (x.k === 'sh') {
      x.x += x.vx;
      x.vy += 0.5;
      x.y = Math.min(G - 6, x.y + x.vy);
      x.a += x.va;
      if (x.y >= G - 6) {
        x.vx *= 0.8;
        x.va *= 0.7;
      }
    }
    if (x.k === 'd') {
      x.x += x.vx;
      x.y += x.vy;
    } else if (x.k === 'c') {
      x.x += x.vx;
      x.y += x.vy;
      x.vy += 0.08;
      x.vx *= 0.97;
      x.a += x.va;
    }
  }
  FX = FX.filter(x => x.l > 0);
  for (const g of GH) g.l--;
  GH = GH.filter(g => g.l > 0);
}
// ===== SCREEN FIT: sharp canvas on retina, cached grid layer =====
function buildGrid() {
  gridC.width = cv.width;
  gridC.height = cv.height;
  const g = gridC.getContext('2d');
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  g.strokeStyle = '#e3e9f2';
  g.lineWidth = 1;
  g.beginPath();
  for (let x = 0; x <= W; x += 30) {
    g.moveTo(x, 0);
    g.lineTo(x, H);
  }
  for (let y = 0; y <= H; y += 30) {
    g.moveTo(0, y);
    g.lineTo(W, y);
  }
  g.stroke();
}
function resize() {
  const w = $('wrap');
  w.style.setProperty('--wh', w.clientHeight + 'px');
  applyLayout(ED ? ED.draft : null);
  if (document.body.classList.contains('train')) {
    const tp = $('trainpanel');
    document.body.style.setProperty('--ph', tp.offsetHeight + 28 + 'px');
  }
  const d = Math.max(1, Math.min(2, (cv.clientWidth / W) * (window.devicePixelRatio || 1)));
  if (d !== gridDPR) {
    DPR = d;
    cv.width = Math.round(W * d);
    cv.height = Math.round(H * d);
    buildGrid();
    gridDPR = d;
  }
}
addEventListener('resize', resize);
if (window.ResizeObserver) {
  const ro = new ResizeObserver(() => {
    gridDPR = 0;
    resize();
  });
  ro.observe(cv);
  ro.observe($('trainpanel'));
}
// ===== MAIN LOOP: fixed 60 Hz simulation =====
let last = performance.now(),
  acc = 0;
function tick() {
  if (state === 'train' && TR.freeze && !TR.step) return;
  TR.step = 0;
  fr++;
  if (state === 'play' || state === 'train') update();
}
function loop(now) {
  const dt = Math.min(100, now - last);
  last = now;
  pollPad();
  if (portraitMQ.matches && live()) pause(true);
  if (NET.match) {
    // online: the match runs on everyone's buttons and never pauses; see net/session.js
    acc += dt;
    while (acc >= 16.67) {
      acc -= 16.67;
      netTick();
    }
  } else if (!paused) {
    acc += dt * (state === 'train' ? TR.ts : 1);
    while (acc >= 16.67) {
      acc -= 16.67;
      tick();
    }
  }
  render();
  requestAnimationFrame(loop);
}
checkUnlocks(); // older saves get what they already earned
// the house as saved, checked (and turned over if it was saved before version 7)
Object.assign(HOUSE, normHouse(HOUSE));
delete HOUSE.flip7;
init();
applySet();
resize();
bindSettings();
syncTrain();
openTitle();
if (/[?&]selftest/.test(location.search)) {
  const R = selfTest(),
    d = document.createElement('pre');
  d.id = 'selftest';
  d.textContent =
    'SELFTEST ' +
    R.hash +
    '  (ticks ' +
    R.ticks +
    ', wave ' +
    R.wave +
    ', score ' +
    R.score +
    ')  LEVEL ' +
    R.hashL +
    '  (' +
    R.level +
    ')  ' +
    (R.hash === SELFTEST_EXPECT.arcade && R.hashL === SELFTEST_EXPECT.level ? 'MATCH' : 'CHANGED');
  d.style.cssText =
    'position:fixed;left:8px;top:8px;z-index:99;background:#1c1626;color:#ffd400;padding:8px 12px;font:14px monospace;border-radius:6px';
  document.body.appendChild(d);
  console.log(d.textContent);
}
requestAnimationFrame(loop);
