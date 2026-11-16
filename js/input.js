// Orange vs. the Pink Army: Input: every device goes through setA() into a player input slot
// ===== INPUT (M1) =====
// Every device (keyboard, touch, gamepad) calls setA(); nothing else reads raw input.
//   l r  move        u d  aim (the direction held when an attack is pressed picks the branch in M2)
//   j    jump        p k  punch / kick        s  Surge (hold)        x  ultimate
const ACT = ['l', 'r', 'u', 'd', 'j', 'p', 'k', 's', 'x'];
// One input slot per player (M4 groundwork for M9 multiplayer). Devices feed slot 0 today; M9 maps a second device to slot 1.
const mkSlot = () => {
  const I = {
    K: {},
    press: {},
    src: { kb: {}, tc: {}, gp: {} },
    AIM: { p: 'n', k: 'n' },
    SRG: { p: 0, k: 0 }
  };
  for (const a of ACT) I.K[a] = 0;
  return I;
};
const INP = [mkSlot(), mkSlot()],
  SRC = INP[0].src,
  HIST = [];
let fr = 0;
// K / press / AIM / SRG point at the slot of the player being updated (see use()); AIM = direction held when P/K was pressed
let K = INP[0].K,
  press = INP[0].press,
  AIM = INP[0].AIM,
  SRG = INP[0].SRG;
const SYM = { l: '←', r: '→', u: '↑', d: '↓', j: 'JUMP', p: 'P', k: 'K', s: 'SURGE', x: 'ULT' };
// Toggle mode (Settings > Surge button): each press flips Surge on/off and letting go does nothing.
function setA(src, a, on, slot) {
  const I = INP[slot || 0],
    S = I.src;
  on = on ? 1 : 0;
  if (S[src][a] === on) return;
  S[src][a] = on;
  let v = S.kb[a] || S.tc[a] || S.gp[a] ? 1 : 0;
  if (a === 's' && SET.surge === 'toggle') {
    if (on) I.sl = !I.sl;
    v = I.sl ? 1 : 0;
  }
  if (v === I.K[a]) return;
  I.K[a] = v;
  if (v) {
    I.press[a] = fr;
    if (a === 'p' || a === 'k') {
      I.AIM[a] = I.K.u ? 'u' : I.K.d ? 'd' : 'n';
      I.SRG[a] = I.K.s;
    }
    if (!slot) {
      HIST.push({ f: fr, a });
      if (HIST.length > 40) HIST.shift();
    }
  }
}
const kbDown = new Set(); // physical keys held, so W + ↑ both mapped to Up don't cancel each other
function releaseAll() {
  kbDown.clear();
  INP.forEach((I, n) => {
    I.sl = false;
    for (const s in I.src) for (const a of ACT) setA(s, a, 0, n);
  });
  if (typeof stickEnd === 'function' && sid !== null) stickEnd();
  document.querySelectorAll('.tb').forEach(b => {
    if (b._ids) b._ids.clear();
    b.classList.remove('on');
  });
}
const want = k => fr - (press[k] ?? -99) <= 12,
  eat = k => (press[k] = -99); // 12-frame input buffer
const live = () => (state === 'play' || state === 'train') && !paused;
function unlockAudio() {
  try {
    AC = AC || new AudioContext();
    if (AC.state === 'suspended') AC.resume();
  } catch (e) {}
}
addEventListener('pointerdown', unlockAudio, { passive: true });
// keyboard
const KEYS = {
  arrowleft: 'l',
  a: 'l',
  arrowright: 'r',
  d: 'r',
  arrowup: 'u',
  w: 'u',
  arrowdown: 'd',
  s: 'd',
  ' ': 'j',
  j: 'p',
  k: 'k',
  shift: 's',
  l: 's',
  u: 'x'
};
addEventListener('keydown', e => {
  const key = (e.key || '').toLowerCase();
  if (key === 'escape' || key === 'p') {
    if (!e.repeat && (state === 'play' || state === 'train')) {
      togglePause();
      e.preventDefault();
    }
    return;
  }
  const a = KEYS[key];
  if (!a || !live() || e.metaKey || e.ctrlKey || e.altKey) return;
  kbDown.add(key);
  setA('kb', a, 1);
  e.preventDefault();
  unlockAudio();
});
addEventListener('keyup', e => {
  const key = (e.key || '').toLowerCase(),
    a = KEYS[key];
  if (!a) return;
  kbDown.delete(key);
  setA(
    'kb',
    a,
    [...kbDown].some(k => KEYS[k] === a)
  );
});
addEventListener('blur', () => {
  releaseAll();
  if (live()) pause(true);
});
// touch: fixed stick in the corner (left/right = move, up/down = aim) + four buttons
const stick = $('stick'),
  knob = $('knob');
let sid = null;
function stickAt(e) {
  const r = stick.getBoundingClientRect(),
    R = r.width / 2;
  let dx = (e.clientX - (r.left + R)) / R,
    dy = (e.clientY - (r.top + R)) / R;
  const m = Math.hypot(dx, dy);
  if (m > 1) {
    dx /= m;
    dy /= m;
  }
  knob.style.transform = 'translate(' + dx * R * 0.5 + 'px,' + dy * R * 0.5 + 'px)';
  setA('tc', 'l', dx < -0.3);
  setA('tc', 'r', dx > 0.3);
  setA('tc', 'u', dy < -0.4);
  setA('tc', 'd', dy > 0.4);
}
function stickEnd() {
  sid = null;
  knob.style.transform = '';
  for (const a of ['l', 'r', 'u', 'd']) setA('tc', a, 0);
}
// Touch robustness (M6 fix): a touch can end before we lock onto it (fast spamming on iPad). The lock then throws, and the old code
// had already claimed the stick for a finger that would never lift, so the stick ignored every later touch. Now: the lock can't
// throw us out, a new finger always takes over a stick whose old finger is gone, and a watchdog frees anything left holding.
const grab = (el, id) => {
  try {
    el.setPointerCapture(id);
    return true;
  } catch (err) {
    return false;
  }
};
let sT = 0;
stick.addEventListener('pointerdown', e => {
  if (EDITING()) return;
  if (sid !== null && sid !== e.pointerId && stick.hasPointerCapture && stick.hasPointerCapture(sid)) return;
  if (!grab(stick, e.pointerId)) {
    stickEnd();
    return;
  }
  sid = e.pointerId;
  sT = performance.now();
  stickAt(e);
  e.preventDefault();
});
stick.addEventListener('pointermove', e => {
  if (e.pointerId === sid) {
    sT = performance.now();
    stickAt(e);
  }
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t =>
  stick.addEventListener(t, e => {
    if (e.pointerId === sid) stickEnd();
  })
);
document.querySelectorAll('.tb').forEach(b => {
  const a = b.dataset.a,
    ids = new Set();
  b.addEventListener('pointerdown', e => {
    if (EDITING()) return;
    e.preventDefault();
    if (!grab(b, e.pointerId)) {
      setA('tc', a, 1);
      setA('tc', a, 0);
      return;
    } // tap that already ended: still counts as a press
    ids.add(e.pointerId);
    setA('tc', a, 1);
    b.classList.add('on');
  });
  b._ids = ids;
  const off = e => {
    ids.delete(e.pointerId);
    if (!ids.size) {
      setA('tc', a, 0);
      b.classList.remove('on');
    }
  };
  if (a === 's') b.classList.add('surgebtn');
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => b.addEventListener(t, off));
});
// gamepad (standard mapping): stick/d-pad move+aim, A jump, X punch, B kick, bumpers/triggers Surge, Y ultimate, Start pause
let padStart = false;
// watchdog, every frame: release the stick or a button if the browser no longer has the finger that was holding it
function touchWatch() {
  {
    const sb = document.querySelector('.tb[data-a=s]');
    if (sb) sb.classList.toggle('latched', SET.surge === 'toggle' && !!INP[0].K.s);
  }
  if (
    sid !== null &&
    !(stick.hasPointerCapture && stick.hasPointerCapture(sid)) &&
    performance.now() - sT > 250
  )
    stickEnd();
  document.querySelectorAll('.tb').forEach(b => {
    const ids = b._ids;
    if (!ids || !ids.size) return;
    for (const id of [...ids]) if (!b.hasPointerCapture(id)) ids.delete(id);
    if (!ids.size) {
      setA('tc', b.dataset.a, 0);
      b.classList.remove('on');
    }
  });
}
function pollPad() {
  touchWatch();
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  let g = null;
  for (const p of pads)
    if (p && p.connected) {
      g = p;
      break;
    }
  if (!g) {
    for (const a of ACT) if (SRC.gp[a]) setA('gp', a, 0);
    return;
  }
  const B = i => !!(g.buttons[i] && g.buttons[i].pressed),
    ax = i => g.axes[i] || 0;
  setA('gp', 'l', ax(0) < -0.4 || B(14));
  setA('gp', 'r', ax(0) > 0.4 || B(15));
  setA('gp', 'u', ax(1) < -0.5 || B(12));
  setA('gp', 'd', ax(1) > 0.5 || B(13));
  setA('gp', 'j', B(0));
  setA('gp', 'p', B(2));
  setA('gp', 'k', B(1));
  setA('gp', 's', B(4) || B(5) || B(6) || B(7));
  setA('gp', 'x', B(3));
  const st = B(9);
  if (st && !padStart && (state === 'play' || state === 'train')) togglePause();
  padStart = st;
}
