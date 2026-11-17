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
// ===== BUTTON BINDINGS =====
// Default keys and controller buttons for each action. Settings > Buttons changes them; changes are saved in
// SET.binds = { kb: {action: [keys]}, pad: {controllerType: {action: [button numbers]}} }.
// Controller buttons use the browser's standard layout: 0 bottom, 1 right, 2 left, 3 top face button, 4/5 bumpers,
// 6/7 triggers, 8 select/minus, 9 start/plus, 10/11 stick clicks, 12-15 d-pad up/down/left/right.
const BIND_ACTS = ['l', 'r', 'u', 'd', 'j', 'p', 'k', 's', 'x', 'pause'];
const KEYDEF = {
  l: ['arrowleft', 'a'],
  r: ['arrowright', 'd'],
  u: ['arrowup', 'w'],
  d: ['arrowdown', 's'],
  j: [' '],
  p: ['j'],
  k: ['k'],
  s: ['shift', 'l'],
  x: ['u'],
  pause: ['escape', 'p']
};
const PADDEF = {
  l: [14],
  r: [15],
  u: [12],
  d: [13],
  j: [0],
  p: [2],
  k: [1],
  s: [4, 5, 6, 7],
  x: [3],
  pause: [9]
};
let KEYS = {};
const kbBinds = () => (SET.binds && SET.binds.kb) || KEYDEF;
function applyBinds() {
  KEYS = {};
  const B = kbBinds();
  for (const a of BIND_ACTS) for (const k of B[a] || []) KEYS[k] = a;
}
applyBinds();
// Controller type: the same model of controller shares one mapping on this device.
const padType = g => (g.id || 'controller').toLowerCase().replace(/\s+/g, ' ').slice(0, 80);
const padFamily = g => {
  const id = (g && g.id) || '';
  if (/xbox|xinput|045e/i.test(id)) return 'xbox';
  if (/pro controller|joy-?con|nintendo|057e/i.test(id)) return 'switch';
  if (/dualshock|dualsense|playstation|054c|wireless controller/i.test(id)) return 'ps';
  return 'xbox';
};
const padBinds = g => (SET.binds && SET.binds.pad && SET.binds.pad[padType(g)]) || PADDEF;
// While the Buttons screen is waiting for a key or button: { dev: 'kb' | 'pad', a: action, t: start time }
let CAP = null;
addEventListener(
  'keydown',
  e => {
    if (!CAP || CAP.dev !== 'kb') return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const key = (e.key || '').toLowerCase();
    bindSwallow = key;
    if (key === 'escape' && CAP.a !== 'pause') return bindDone(null);
    bindDone(key);
  },
  true
);
// the key that was just captured must not also press the focused button when it comes back up
let bindSwallow = null;
addEventListener(
  'keyup',
  e => {
    if (bindSwallow && (e.key || '').toLowerCase() === bindSwallow) {
      bindSwallow = null;
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  },
  true
);
addEventListener('keydown', e => {
  if (CAP) return;
  const key = (e.key || '').toLowerCase(),
    a = KEYS[key];
  if (a === 'pause') {
    if (!e.repeat && (state === 'play' || state === 'train')) {
      togglePause();
      e.preventDefault();
    }
    return;
  }
  if (!a || !live() || e.metaKey || e.ctrlKey || e.altKey) return;
  kbDown.add(key);
  setA('kb', a, 1);
  e.preventDefault();
  unlockAudio();
});
addEventListener('keyup', e => {
  const key = (e.key || '').toLowerCase(),
    a = KEYS[key];
  if (!a || a === 'pause') return;
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
// gamepad (standard layout): left stick always moves and aims; every button follows the bindings above
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
let padPrev = [],
  padNav = { dir: '', t: 0 };
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
    padPrev = [];
    return;
  }
  const B = i => !!(g.buttons[i] && g.buttons[i].pressed),
    ax = i => g.axes[i] || 0,
    now = g.buttons.map(b => !!(b && b.pressed)),
    prev = padPrev,
    down = i => now[i] && !prev[i],
    M = padBinds(g),
    any = a => (M[a] || []).some(B);
  padPrev = now;
  if (CAP && CAP.dev === 'pad') {
    const i = now.findIndex((v, n) => v && !prev[n]);
    if (i >= 0 && performance.now() - CAP.t > 250) bindDone(i, g);
    else if (performance.now() - CAP.t > 6000) bindDone(null);
    return;
  }
  setA('gp', 'l', ax(0) < -0.4 || any('l'));
  setA('gp', 'r', ax(0) > 0.4 || any('r'));
  setA('gp', 'u', ax(1) < -0.5 || any('u'));
  setA('gp', 'd', ax(1) > 0.5 || any('d'));
  for (const a of ['j', 'p', 'k', 's', 'x']) setA('gp', a, any(a));
  // Start pauses; on the pause menu it resumes
  if ((M.pause || []).some(down)) {
    if (live()) pause(true);
    else if (paused && !$('s-pause').hidden) pause(false);
  }
  if (!live()) padMenu(g, now, down, ax);
}
// Controller menus: d-pad or stick moves between buttons, left/right changes sliders and lists,
// confirm (A) presses, back (B) goes back or resumes, Start on a menu presses the highlighted button.
function padMenu(g, now, down, ax) {
  const sw = padFamily(g) === 'switch',
    OK = sw ? 1 : 0,
    BACK = sw ? 0 : 1,
    dir =
      ax(1) < -0.5 || now[12]
        ? 'u'
        : ax(1) > 0.5 || now[13]
          ? 'd'
          : ax(0) < -0.5 || now[14]
            ? 'l'
            : ax(0) > 0.5 || now[15]
              ? 'r'
              : '',
    t = performance.now();
  if (dir !== padNav.dir) {
    padNav.dir = dir;
    padNav.t = t + 380;
    if (dir) navMove(dir);
  } else if (dir && t >= padNav.t) {
    padNav.t = t + 120;
    navMove(dir);
  }
  if (down(OK)) navPress();
  else if (down(BACK)) navBack();
  else if (down(9) && $('s-title') && !$('s-title').hidden) navPress();
}
function navScreen() {
  for (const id of SCREENS) {
    const el = $(id);
    if (el && !el.hidden && !$('ui').hidden) return el;
  }
  return null;
}
function navItems() {
  const sc = navScreen();
  if (!sc) return [];
  return [...sc.querySelectorAll('button, input, select')].filter(
    e => !e.disabled && e.offsetParent !== null && !e.closest('[hidden]')
  );
}
function navMove(dir) {
  document.body.classList.add('padnav');
  const L = navItems();
  if (!L.length) return;
  let i = L.indexOf(document.activeElement);
  const el = L[i];
  if (el && (dir === 'l' || dir === 'r')) {
    const s = dir === 'r' ? 1 : -1;
    if (el.type === 'range') {
      el.value = +el.value + s * (+el.step || (el.max - el.min) / 20);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    if (el.tagName === 'SELECT') {
      el.selectedIndex = (el.selectedIndex + s + el.options.length) % el.options.length;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
  }
  i = i < 0 ? 0 : (i + (dir === 'd' || dir === 'r' ? 1 : -1) + L.length) % L.length;
  L[i].focus({ preventScroll: true });
  L[i].scrollIntoView({ block: 'nearest' });
  sfx(440, 0.03, 'square', 0.02);
}
function navPress() {
  document.body.classList.add('padnav');
  const L = navItems(),
    el = L.includes(document.activeElement) ? document.activeElement : null;
  if (!el) return navMove('d');
  if (el.tagName === 'SELECT') return navMove('r');
  if (el.type === 'range' || el.type === 'text') return;
  el.click();
}
function navBack() {
  const sc = navScreen();
  if (!sc) return;
  if (sc.id === 's-pause') pause(false);
  else if (sc.id === 's-settings') $('b-back').click();
  else if (sc.id === 's-binds') $('bd-back').click();
}
