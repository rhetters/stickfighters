// StickFighters: Buttons screen (Settings > Buttons): change the keyboard keys and controller buttons
// for every action. The input layer (js/input.js) reads the result through KEYS and padBinds().
// ===== BUTTONS SCREEN =====
const ACTNAME = {
  l: 'Move left',
  r: 'Move right',
  u: 'Up / aim up',
  d: 'Down / aim down',
  j: 'Jump',
  p: 'Punch',
  k: 'Kick',
  s: 'Surge (+ Down = block)',
  x: 'Ultimate',
  e: 'Pose wheel (hold)',
  pause: 'Pause'
};
const KEYNAME = {
  ' ': 'Space',
  arrowleft: '←',
  arrowright: '→',
  arrowup: '↑',
  arrowdown: '↓',
  escape: 'Esc',
  shift: 'Shift',
  control: 'Ctrl',
  alt: 'Alt',
  enter: 'Enter',
  tab: 'Tab',
  backspace: 'Backspace',
  meta: 'Cmd'
};
const keyName = k => KEYNAME[k] || (k.length === 1 ? k.toUpperCase() : k[0].toUpperCase() + k.slice(1));
// Button names in each family's own labels (the browser numbers buttons by position, not by label)
const PADNAMES = {
  xbox: [
    'A',
    'B',
    'X',
    'Y',
    'LB',
    'RB',
    'LT',
    'RT',
    'View',
    'Menu',
    'L-stick',
    'R-stick',
    'D-pad ↑',
    'D-pad ↓',
    'D-pad ←',
    'D-pad →',
    'Home'
  ],
  switch: [
    'B',
    'A',
    'Y',
    'X',
    'L',
    'R',
    'ZL',
    'ZR',
    '−',
    '+',
    'L-stick',
    'R-stick',
    'D-pad ↑',
    'D-pad ↓',
    'D-pad ←',
    'D-pad →',
    'Home'
  ],
  ps: [
    '✕',
    '○',
    '□',
    '△',
    'L1',
    'R1',
    'L2',
    'R2',
    'Share',
    'Options',
    'L3',
    'R3',
    'D-pad ↑',
    'D-pad ↓',
    'D-pad ←',
    'D-pad →',
    'PS'
  ]
};
const btnName = (i, g) => PADNAMES[padFamily(g)][i] || 'Button ' + i;
function curPad() {
  const ps = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const p of ps) if (p && p.connected) return p;
  return null;
}
const BD = { dev: 'kb' };
function openBinds() {
  CAP = null;
  $('bd-msg').textContent = '';
  show('s-binds');
  renderBinds();
}
// The editable mapping for a device; the defaults are copied in the first time something changes.
function bindsFor(dev, g) {
  SET.binds = SET.binds || {};
  if (dev === 'kb') {
    if (!SET.binds.kb) SET.binds.kb = JSON.parse(JSON.stringify(KEYDEF));
    for (const a of BIND_ACTS) if (!(a in SET.binds.kb)) SET.binds.kb[a] = KEYDEF[a].slice();
    return SET.binds.kb;
  }
  SET.binds.pad = SET.binds.pad || {};
  const t = padType(g);
  if (!SET.binds.pad[t]) SET.binds.pad[t] = JSON.parse(JSON.stringify(PADDEF));
  for (const a of BIND_ACTS) if (!(a in SET.binds.pad[t])) SET.binds.pad[t][a] = PADDEF[a].slice();
  return SET.binds.pad[t];
}
function renderBinds() {
  const g = curPad(),
    pad = BD.dev === 'pad';
  $('bt-kb').classList.toggle('on', !pad);
  $('bt-pad').classList.toggle('on', pad);
  $('bd-pad').textContent = pad
    ? g
      ? (g.id || 'Controller').replace(/\(.*\)/, '').trim() +
        ': changes apply to every controller of this kind on this device. The left stick always moves and aims.'
      : 'No controller found. Connect one and press any button on it.'
    : 'Tap a key to remove it. + adds another key.';
  const M = pad ? (g ? padBinds(g) : null) : kbBinds(),
    list = $('bd-list');
  list.innerHTML = '';
  if (!M) return;
  for (const a of BIND_ACTS) {
    const row = document.createElement('div'),
      lab = document.createElement('span'),
      ch = document.createElement('span'),
      add = document.createElement('button');
    row.className = 'brow';
    lab.textContent = ACTNAME[a];
    ch.className = 'chips';
    const cur = (a in M ? M[a] : (pad ? PADDEF : KEYDEF)[a]) || [];
    for (const v of cur) {
      const b = document.createElement('button');
      b.className = 'chip';
      b.textContent = (pad ? btnName(v, g) : keyName(v)) + ' ×';
      b.title = 'Remove';
      b.onclick = () => {
        const E = bindsFor(BD.dev, g);
        E[a] = E[a].filter(x => x !== v);
        $('bd-msg').textContent = (pad ? btnName(v, g) : keyName(v)) + ' removed from ' + ACTNAME[a] + '.';
        bindSaved(a);
      };
      ch.appendChild(b);
    }
    if (!cur.length) {
      const n = document.createElement('i');
      n.textContent = 'none';
      ch.appendChild(n);
    }
    add.className = 'chip add';
    add.textContent = '+';
    add.title = 'Add a ' + (pad ? 'button' : 'key');
    add.dataset.act = a;
    add.onclick = () => bindStart(a);
    row.append(lab, ch, add);
    list.appendChild(row);
  }
}
function bindStart(a) {
  CAP = { dev: BD.dev, a, t: performance.now() };
  $('bd-msg').textContent =
    BD.dev === 'kb'
      ? 'Press a key for ' + ACTNAME[a] + ' (Esc cancels)'
      : 'Press a button on the controller for ' + ACTNAME[a] + ' (wait 6 seconds to cancel)';
}
// The input layer calls this with the key (text) or button (number) that was pressed, or null to cancel.
// A key or button belongs to one action at a time: it is taken away from any other action.
function bindDone(v, g) {
  const c = CAP;
  CAP = null;
  if (!c) return;
  if (v === null || v === undefined) {
    $('bd-msg').textContent = 'Cancelled.';
    return;
  }
  g = g || curPad();
  const E = bindsFor(c.dev, g);
  let moved = '';
  for (const a of BIND_ACTS)
    if (a !== c.a && (E[a] || []).includes(v)) {
      E[a] = E[a].filter(x => x !== v);
      moved = ACTNAME[a];
    }
  E[c.a] = E[c.a] || [];
  if (!E[c.a].includes(v)) E[c.a].push(v);
  $('bd-msg').textContent =
    (c.dev === 'kb' ? keyName(v) : btnName(v, g)) +
    ' now does ' +
    ACTNAME[c.a] +
    (moved ? ' (taken from ' + moved + ')' : '') +
    '.';
  bindSaved(c.a);
}
function bindSaved(a) {
  save();
  applyBinds();
  renderBinds();
  const add = a && document.querySelector('#bd-list .add[data-act="' + a + '"]');
  if (add) add.focus({ preventScroll: true });
}
$('o-binds').onclick = openBinds;
$('bt-kb').onclick = () => {
  BD.dev = 'kb';
  CAP = null;
  renderBinds();
};
$('bt-pad').onclick = () => {
  BD.dev = 'pad';
  CAP = null;
  renderBinds();
};
$('bd-reset').onclick = () => {
  const g = curPad();
  if (BD.dev === 'kb') {
    if (SET.binds) delete SET.binds.kb;
  } else if (g && SET.binds && SET.binds.pad) delete SET.binds.pad[padType(g)];
  $('bd-msg').textContent =
    'Back to the default ' + (BD.dev === 'kb' ? 'keys.' : 'buttons for this controller.');
  bindSaved();
};
$('bd-back').onclick = () => {
  CAP = null;
  show('s-settings');
};
addEventListener('gamepadconnected', () => {
  if (!$('s-binds').hidden) renderBinds();
});
// the yellow controller highlight hides again as soon as someone taps or clicks
addEventListener('pointerdown', () => document.body.classList.remove('padnav'), { passive: true });
