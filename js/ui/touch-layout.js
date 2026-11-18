// Orange vs. the Pink Army: Touch controls layout, profiles and the layout editor
// ===== TOUCH LAYOUT: every control's centre (x, y) and size are fractions of the game area, so a layout fits any screen =====
const CTL = ['stick', 'x', 'j', 's', 'p', 'k'],
  CTLNAME = { stick: 'Stick', x: 'ULT', j: 'JUMP', s: 'SURGE', p: 'PUNCH', k: 'KICK' };
const LDEF = {
  stick: { x: 0.105, y: 0.785, s: 0.37 },
  x: { x: 0.866, y: 0.716, s: 0.16 },
  j: { x: 0.95, y: 0.716, s: 0.16 },
  s: { x: 0.782, y: 0.894, s: 0.16 },
  p: { x: 0.866, y: 0.894, s: 0.16 },
  k: { x: 0.95, y: 0.894, s: 0.16 }
};
const mirrorL = L => Object.fromEntries(Object.entries(L).map(([k, c]) => [k, { ...c, x: 1 - c.x }]));
const BUILTIN = { Default: LDEF, 'Left-handed': mirrorL(LDEF) };
const LAY = SET.lay || { active: SET.mirror ? 'Left-handed' : 'Default', custom: {} };
SET.lay = LAY;
delete SET.mirror; // older saves: Left-hand layout becomes the Left-handed profile
const EDITING = () => $('wrap').classList.contains('editing');
const cloneL = L => JSON.parse(JSON.stringify(L));
function getProf(n) {
  return BUILTIN[n] || LAY.custom[n] || LDEF;
}
function saveLay() {
  SET.lay = LAY;
  save();
  fillProfiles();
}
function fillProfiles() {
  const names = [...Object.keys(BUILTIN), ...Object.keys(LAY.custom)];
  if (!names.includes(LAY.active)) LAY.active = 'Default';
  for (const id of ['o-prof', 'le-prof']) {
    const el = $(id);
    el.innerHTML = '';
    for (const n of names) {
      const o = document.createElement('option');
      o.value = n;
      o.textContent = n + (BUILTIN[n] ? ' (built-in)' : '');
      el.appendChild(o);
    }
    el.value = ED && id === 'le-prof' ? ED.prof : LAY.active;
  }
}
const ctlEl = id => (id === 'stick' ? $('stick') : document.querySelector('.tb[data-a=' + id + ']'));
function ctlPx(c, ww, wh, mn) {
  const sz = Math.max(mn || 36, Math.min(wh * 0.75, c.s * wh * SET.tsize));
  let x = c.x * ww - sz / 2,
    y = c.y * wh - sz / 2;
  x = Math.max(2, Math.min(ww - sz - 2, x));
  y = Math.max(2, Math.min(wh - sz - 2, y));
  return { x, y, sz };
}
// built-in layouts keep thumb-sized minimums (stick 96 px, buttons 52 px); custom layouts can go smaller
function applyLayout(L) {
  const builtin =
    (!L && BUILTIN[LAY.active]) ||
    (L && ED && BUILTIN[ED.prof] && JSON.stringify(L) === JSON.stringify(BUILTIN[ED.prof]));
  L = L || getProf(LAY.active);
  const w = $('wrap'),
    ww = w.clientWidth,
    wh = w.clientHeight;
  if (!ww || !wh) return;
  for (const id of CTL) {
    const el = ctlEl(id),
      { x, y, sz } = ctlPx(L[id], ww, wh, builtin ? (id === 'stick' ? 96 : 52) : 36);
    Object.assign(el.style, { left: x + 'px', top: y + 'px', width: sz + 'px', height: sz + 'px' });
    if (id !== 'stick') el.style.fontSize = Math.max(9, Math.min(22, sz * 0.17)) + 'px';
  }
  if (ED) placeHandle();
}
// ----- editor: drag to move, yellow corner or slider to resize, profiles -----
let ED = null;
function openEditor() {
  ED = { prof: LAY.active, draft: cloneL(getProf(LAY.active)), sel: null, back: back };
  releaseAll();
  $('wrap').classList.add('editing');
  $('ui').hidden = true;
  $('layed').hidden = false;
  $('le-namebox').hidden = true;
  $('le-del').dataset.armed = '';
  knob.style.transform = '';
  fillProfiles();
  selectCtl(null);
  applyLayout(ED.draft);
}
function closeEditor() {
  $('wrap').classList.remove('editing');
  $('layed').hidden = true;
  document.querySelectorAll('[data-ctl].sel').forEach(e => e.classList.remove('sel'));
  ED = null;
  applyLayout();
  fillProfiles();
  show('s-settings');
}
function selectCtl(id) {
  if (!ED) return;
  ED.sel = id;
  document.querySelectorAll('[data-ctl]').forEach(e => e.classList.toggle('sel', e.dataset.ctl === id));
  const sl = $('le-size');
  sl.disabled = !id;
  $('le-hint').textContent = id
    ? CTLNAME[id] + ' selected. Drag it, or drag the yellow corner to resize.'
    : 'Drag a control to move it. Tap one, then drag the yellow corner (or the slider) to resize.';
  if (id) {
    const wh = $('wrap').clientHeight;
    sl.value = Math.round(ED.draft[id].s * wh * SET.tsize);
  }
  placeHandle();
}
function placeHandle() {
  const rh = $('rh');
  if (!ED || !ED.sel) {
    rh.classList.remove('on');
    return;
  }
  const el = ctlEl(ED.sel);
  rh.classList.add('on');
  rh.style.left = el.offsetLeft + el.offsetWidth * 0.85 + 'px';
  rh.style.top = el.offsetTop + el.offsetHeight * 0.85 + 'px';
}
function updEdButtons() {
  const custom = !BUILTIN[ED.prof];
  $('le-del').disabled = !custom;
  $('le-save').textContent = custom ? 'Save layout' : 'Save as my layout';
}
(function () {
  const T = $('touch');
  let drag = null;
  T.addEventListener(
    'pointerdown',
    e => {
      if (!ED) return;
      const w = $('wrap').getBoundingClientRect(),
        ww = $('wrap').clientWidth,
        wh = $('wrap').clientHeight;
      if (e.target.id === 'rh') {
        const c = ED.draft[ED.sel],
          cx = w.left + c.x * ww,
          cy = w.top + c.y * wh;
        drag = { kind: 'size', id: ED.sel, cx, cy };
      } else {
        const el = e.target.closest('[data-ctl]');
        if (!el) {
          selectCtl(null);
          return;
        }
        const id = el.dataset.ctl,
          c = ED.draft[id];
        selectCtl(id);
        drag = { kind: 'move', id, ox: e.clientX - (w.left + c.x * ww), oy: e.clientY - (w.top + c.y * wh) };
      }
      T.setPointerCapture(e.pointerId);
      drag.pid = e.pointerId;
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );
  T.addEventListener(
    'pointermove',
    e => {
      if (!ED || !drag || e.pointerId !== drag.pid) return;
      const w = $('wrap').getBoundingClientRect(),
        ww = $('wrap').clientWidth,
        wh = $('wrap').clientHeight,
        c = ED.draft[drag.id];
      if (drag.kind === 'move') {
        c.x = Math.max(0, Math.min(1, (e.clientX - drag.ox - w.left) / ww));
        c.y = Math.max(0, Math.min(1, (e.clientY - drag.oy - w.top) / wh));
      } else {
        const sz = Math.max(Math.abs(e.clientX - drag.cx), Math.abs(e.clientY - drag.cy)) / 0.35;
        c.s = Math.max(36, Math.min(wh * 0.75, sz)) / (wh * SET.tsize);
        $('le-size').value = Math.round(c.s * wh * SET.tsize);
      }
      applyLayout(ED.draft);
    },
    true
  );
  const up = e => {
    if (drag && e.pointerId === drag.pid) {
      drag = null;
      const ww = $('wrap').clientWidth,
        wh = $('wrap').clientHeight;
      for (const id of CTL) {
        const c = ED.draft[id],
          p = ctlPx(c, ww, wh);
        c.x = (p.x + p.sz / 2) / ww;
        c.y = (p.y + p.sz / 2) / wh;
      }
    }
  }; // snap back inside the screen
  T.addEventListener('pointerup', up, true);
  T.addEventListener('pointercancel', up, true);
  $('le-size').oninput = () => {
    if (!ED || !ED.sel) return;
    const wh = $('wrap').clientHeight;
    ED.draft[ED.sel].s = parseFloat($('le-size').value) / (wh * SET.tsize);
    applyLayout(ED.draft);
  };
  $('le-prof').onchange = () => {
    ED.prof = $('le-prof').value;
    ED.draft = cloneL(getProf(ED.prof));
    $('le-del').dataset.armed = '';
    selectCtl(null);
    applyLayout(ED.draft);
    updEdButtons();
  };
  $('le-reset').onclick = () => {
    ED.draft = cloneL(LDEF);
    selectCtl(null);
    applyLayout(ED.draft);
    $('le-hint').textContent = 'Back to the default positions. Save to keep them.';
  };
  $('le-cancel').onclick = closeEditor;
  const askName = () => {
    $('le-namebox').hidden = false;
    const n = $('le-name');
    n.value = '';
    n.focus();
  };
  $('le-new').onclick = askName;
  $('le-name-x').onclick = () => {
    $('le-namebox').hidden = true;
  };
  $('le-name-ok').onclick = () => {
    let n = $('le-name').value.trim().replace(/[<>]/g, '') || 'My layout';
    if (BUILTIN[n]) n += ' 2';
    let m = n,
      i = 2;
    while (LAY.custom[m] && m !== ED.prof) m = n + ' ' + i++;
    LAY.custom[m] = cloneL(ED.draft);
    LAY.active = m;
    saveLay();
    closeEditor();
  };
  $('le-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') $('le-name-ok').click();
    e.stopPropagation();
  });
  $('le-save').onclick = () => {
    if (BUILTIN[ED.prof]) {
      askName();
      $('le-name').value = 'My layout';
      return;
    }
    LAY.custom[ED.prof] = cloneL(ED.draft);
    LAY.active = ED.prof;
    saveLay();
    closeEditor();
  };
  $('le-del').onclick = () => {
    const b = $('le-del');
    if (BUILTIN[ED.prof]) return;
    if (!b.dataset.armed) {
      b.dataset.armed = '1';
      b.textContent = 'Tap again to delete';
      b.classList.add('warn');
      return;
    }
    delete LAY.custom[ED.prof];
    if (LAY.active === ED.prof) LAY.active = 'Default';
    b.dataset.armed = '';
    b.textContent = 'Delete';
    b.classList.remove('warn');
    saveLay();
    ED.prof = LAY.active;
    ED.draft = cloneL(getProf(ED.prof));
    fillProfiles();
    selectCtl(null);
    applyLayout(ED.draft);
    updEdButtons();
  };
  const _open = openEditor;
  openEditor = function () {
    _open();
    updEdButtons();
  };
})();
