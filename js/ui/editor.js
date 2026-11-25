// StickFighters: the level creator's screens (Customize → LEVELS). MY LEVELS lists Rhett's levels and NEW LEVEL;
// PICK A PLACE chooses a biome for a new one; the editor shows a part of the level with that place's real scenery and
// a grid over it, like the house builder: every square in view is a button (touch, mouse, keyboard and
// controllers). Tabs: PLATFORMS (tap or drag along a row), ENEMIES (drop one in where you tap), SCENERY, FLAG (where
// the fight stops the screen), ERASE, and PARTS (move between parts, add or delete one, its width, and the star
// that puts it in stories). PLAY plays the level and comes back here. Everything is saved as you go (EDIT.levels).
// ===== STATE =====
const EDS = { i: -1, part: 0, ox: 0, tab: 'plat', foe: 'g', prop: null, paint: false, last: '', del: 0, delPart: 0 };
const ED_TABS = [
  ['plat', 'PLATFORMS'],
  ['foe', 'ENEMIES'],
  ['prop', 'SCENERY'],
  ['flag', 'FLAG'],
  ['erase', 'ERASE'],
  ['parts', 'PARTS']
];
const ED_HELP = {
  plat: 'Tap or drag along a row to lay a platform.',
  foe: 'Pick an enemy, then tap where it drops in. Up to 10 in a fight.',
  prop: 'Pick some scenery, then tap where it goes.',
  flag: 'Tap where the fight should stop the screen.',
  erase: 'Tap or drag to take things away.',
  parts: 'A level is up to 6 parts. A part with a star can turn up in stories.'
};
const ED_COLS = W / ED_CELL; // squares across the view (15)
const edLevel = () => EDIT.levels[EDS.i];
const edPart = () => edLevel().parts[EDS.part];
function edSave() {
  EDIT.levels[EDS.i] = normLevel(edLevel());
  save();
}
function edMsg(t) {
  $('ed-msg').textContent = t || '';
}
// ===== DRAWING =====
// Draws part pi of level L with ox pixels scrolled into it, with the game's own scenery drawing (a level built
// just for the picture; the game's LV and camera are put back after). marks = the editor's markers and grid.
function edScene(L, pi, ox, marks) {
  const keepLV = LV,
    keepCam = { x: CAM.x, y: CAM.y, z: CAM.z };
  try {
    LV = buildCustom(L);
    const c = LV.ch[1 + pi];
    CAM.x = c.x0 + ox;
    CAM.y = 0;
    CAM.z = 1;
    ctx.save();
    drawLevelBg();
    ctx.restore();
    ctx.save();
    camApply(CAM.x, 0, 1);
    edFoes(L.parts[pi], c.x0);
    if (marks) edMarks(L.parts[pi], c);
    ctx.restore();
  } finally {
    LV = keepLV;
    Object.assign(CAM, keepCam);
  }
}
// Where something dropped in at x lands: the top platform under it, or the ground
function edLand(p, x) {
  let y = G;
  for (const q of p.plats) if (x >= q.x1 && x <= q.x2) y = Math.min(y, G - q.h * ED_CELL);
  return y;
}
// The enemies of a part, standing where they'll land (the game's own drawing, from a fighter made for the picture)
const ED_FAKE = {};
function edFoeFig(t) {
  if (!ED_FAKE[t]) {
    const keep = SEED;
    ED_FAKE[t] = F(0, t, 0);
    reseed(keep); // making one rolls the game's dice; put them back
  }
  return ED_FAKE[t];
}
function edFoes(p, x0) {
  for (const f of p.foes) {
    const e = edFoeFig(f.t),
      y = edLand(p, f.x);
    Object.assign(e, { x: x0 + f.x, y, gy: y, face: -1, st: 'free', flash: 0, hp: e.max, pmax: 0 });
    drawF(e);
  }
}
// The grid, the part's edges and the fight flag
function edMarks(p, c) {
  ctx.strokeStyle = 'rgba(28,22,38,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= p.w; x += ED_CELL) {
    ctx.moveTo(c.x0 + x, G - (ED_ROWS + 1) * ED_CELL);
    ctx.lineTo(c.x0 + x, G);
  }
  for (let r = 0; r <= ED_ROWS + 1; r++) {
    ctx.moveTo(c.x0, G - r * ED_CELL);
    ctx.lineTo(c.x0 + p.w, G - r * ED_CELL);
  }
  ctx.stroke();
  // the part's two ends
  ctx.strokeStyle = '#ff7a00';
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  for (const x of [c.x0, c.x0 + p.w]) {
    ctx.moveTo(x, -20);
    ctx.lineTo(x, G + 60);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  // the fight flag, and the screen the fight will stop on
  if (p.foes.length) {
    const fx = c.x0 + p.at;
    ctx.fillStyle = 'rgba(255,79,163,0.08)';
    ctx.fillRect(fx - W / 2, -20, W, G + 20);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fx, G);
    ctx.lineTo(fx, G - 90);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(fx + 1, G - 90);
    ctx.lineTo(fx + 34, G - 80);
    ctx.lineTo(fx + 1, G - 70);
    ctx.closePath();
    ctx.fillStyle = '#ff4fa3';
    ctx.fill();
    ctx.stroke();
  }
}
// The editor's view
function edDraw() {
  const k = $('ed-cv').getContext('2d');
  withCtx(k, () => edScene(edLevel(), EDS.part, EDS.ox, true));
  const p = edPart(),
    L = edLevel();
  $('ed-part').textContent = 'PART ' + (EDS.part + 1) + ' OF ' + L.parts.length + (p.pool ? ' ★' : '');
  $('ed-left').disabled = EDS.ox <= 0;
  $('ed-right').disabled = EDS.ox >= p.w - W;
}
// A level's picture for its tile: the start of its first part, cropped square
function edThumb(L) {
  const big = document.createElement('canvas');
  big.width = W;
  big.height = H;
  withCtx(big.getContext('2d'), () => edScene(L, 0, 0, false));
  return k => k.drawImage(big, 210, 0, 420, 420, 17, 17, 166, 166);
}
// ===== MY LEVELS =====
function openLevels() {
  closePanels();
  releaseAll();
  state = 'menu';
  const box = $('ed-list'),
    opts = [
      { k: 'new', label: 'NEW LEVEL', pic: () => edPlusPic(), pick: () => openPlaces() },
      ...EDIT.levels.map((L, i) => ({ k: 'lv' + i + ':' + JSON.stringify(L).length, label: L.name, pic: edThumb(L), pick: () => openEdit(i) }))
    ];
  box.innerHTML = '';
  for (const o of opts) {
    const b = document.createElement('button');
    b.className = 'ptile';
    b.innerHTML = '<span class="pimg chpic"></span><b></b>';
    b.querySelector('b').textContent = o.label;
    const cv = document.createElement('canvas');
    cv.width = cv.height = 200;
    withCtx(cv.getContext('2d'), () => {
      ctx.beginPath();
      ctx.roundRect(17, 17, 166, 166, 16);
      ctx.clip();
      o.pic(ctx);
    });
    b.querySelector('.pimg').style.setProperty('--ic', 'url(' + cv.toDataURL() + ')');
    b.onclick = o.pick;
    box.appendChild(b);
  }
  box.firstChild.disabled = EDIT.levels.length >= ED_LIM.levels;
  show('s-levels');
  box.firstChild.focus({ preventScroll: true });
}
function edPlusPic() {
  ctx.fillStyle = '#ffd400';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(100, 100, 46, 0, 7);
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(100, 74);
  ctx.lineTo(100, 126);
  ctx.moveTo(74, 100);
  ctx.lineTo(126, 100);
  ctx.stroke();
}
// ===== PICK A PLACE =====
const EDPLACE = {};
function openPlaces() {
  const box = $('ed-places');
  box.innerHTML = '';
  // five columns, one for each story, its three places from top to bottom
  const ths = Object.keys(THEMES);
  box.style.setProperty('--n', ths.length);
  for (let i = 0; i < 3; i++)
    for (const th of ths) {
      const b = THEMES[th].biomes[i];
      const t = document.createElement('button');
      t.className = 'ptile';
      t.innerHTML = '<span class="pimg chpic"></span><b></b>';
      t.querySelector('b').textContent = BIOMES[b].name;
      if (!EDPLACE[b]) {
        const draw = edThumb(normLevel({ b })),
          cv = document.createElement('canvas');
        cv.width = cv.height = 200;
        withCtx(cv.getContext('2d'), () => {
          ctx.beginPath();
          ctx.roundRect(17, 17, 166, 166, 16);
          ctx.clip();
          draw(ctx);
        });
        EDPLACE[b] = cv.toDataURL();
      }
      t.querySelector('.pimg').style.setProperty('--ic', 'url(' + EDPLACE[b] + ')');
      t.onclick = () => edNew(b);
      box.appendChild(t);
    }
  show('s-edpick');
  box.firstChild.focus({ preventScroll: true });
}
function edNew(b) {
  if (EDIT.levels.length >= ED_LIM.levels) return openLevels();
  EDIT.levels.push(normLevel({ b, name: 'LEVEL ' + (EDIT.levels.length + 1) }));
  save();
  openEdit(EDIT.levels.length - 1);
}
// ===== THE EDITOR =====
function openEdit(i, part = 0) {
  closePanels();
  releaseAll();
  state = 'menu';
  EDS.i = i;
  EDS.part = Math.min(part, edLevel().parts.length - 1);
  EDS.ox = Math.max(0, Math.min(EDS.ox, edPart().w - W));
  EDS.del = EDS.delPart = 0;
  const B = BIOMES[edLevel().b];
  if (!EDS.prop || !edPropOk(EDS.prop, edLevel().b)) EDS.prop = B.props[0][0];
  if (!edFoeOk(EDS.foe, edLevel().b)) EDS.foe = 'g';
  $('ed-name').value = edLevel().name;
  show('s-edit');
  edCells();
  edTabs();
  edPal();
  edDraw();
  edMsg(ED_HELP[EDS.tab]);
  $('ed-tabs').querySelector('.on').focus({ preventScroll: true });
}
// Back from playing a level (the pause menu's QUIT, the KO screen's EDIT, or the end of the level)
function edReturn() {
  const id = LV && LV.custom,
    i = EDIT.levels.findIndex(L => L.id === id);
  init();
  MODE = LEVEL;
  if (i < 0) return openLevels();
  openEdit(i, EDS.part);
}
// One button per square in view: 15 across, the ground row and 5 rows of platforms above it
function edCells() {
  const box = $('ed-cells'),
    R = ED_ROWS + 1;
  box.innerHTML = '';
  box.style.top = ((G - R * ED_CELL) / H) * 100 + '%';
  box.style.height = ((R * ED_CELL) / H) * 100 + '%';
  box.style.gridTemplateColumns = 'repeat(' + ED_COLS + ', 1fr)';
  box.style.gridTemplateRows = 'repeat(' + R + ', 1fr)';
  for (let vr = 0; vr < R; vr++)
    for (let vc = 0; vc < ED_COLS; vc++) {
      const b = document.createElement('button');
      b.className = 'hcell';
      b.dataset.v = vc + ',' + (R - 1 - vr); // view column, row counted up from the ground row (0)
      b.setAttribute('aria-label', 'Square ' + (vc + 1) + ', row ' + (R - vr));
      b.onclick = e => {
        if (!e.detail) edActV(b.dataset.v);
      };
      box.appendChild(b);
    }
}
function edActV(v) {
  const [vc, r] = v.split(',').map(Number),
    c = Math.floor(EDS.ox / ED_CELL) + vc;
  if (c * ED_CELL < edPart().w) edAct(c, r);
}
const edAt = e => {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  return el && el.classList && el.classList.contains('hcell') && el.parentNode.id === 'ed-cells' ? el.dataset.v : '';
};
$('ed-cells').addEventListener('pointerdown', e => {
  const v = edAt(e);
  if (!v) return;
  e.preventDefault();
  EDS.paint = EDS.tab === 'plat' || EDS.tab === 'erase';
  EDS.last = v;
  edActV(v);
});
$('ed-cells').addEventListener('pointermove', e => {
  if (!EDS.paint) return;
  const v = edAt(e);
  if (!v || v === EDS.last) return;
  EDS.last = v;
  edActV(v);
});
addEventListener('pointerup', () => (EDS.paint = false));
addEventListener('pointercancel', () => (EDS.paint = false));
// Square c (from the part's start), row r (0 = the ground row) with the current tool
function edAct(c, r) {
  const p = edPart(),
    x0 = c * ED_CELL,
    mid = x0 + ED_CELL / 2;
  if (EDS.tab === 'plat') {
    if (r < 1) return edMsg('Platforms go above the ground row.');
    if (!edPlatAdd(p, x0, r)) return edMsg('That’s as many platforms as a part can hold!');
  } else if (EDS.tab === 'foe') {
    if (p.foes.length >= ED_LIM.foes) return edMsg('A fight holds up to ' + ED_LIM.foes + ' enemies.');
    p.foes.push({ t: EDS.foe, x: mid });
    if (p.foes.length === 1) p.at = Math.max(W / 2, Math.min(p.w - W / 2, mid));
    sfx(330, 0.08, 'square', 0.04, 120);
  } else if (EDS.tab === 'prop') {
    if (p.props.length >= ED_LIM.props) return edMsg('That’s as much scenery as a part can hold!');
    p.props.push({ k: EDS.prop, x: mid, s: 1 });
  } else if (EDS.tab === 'flag') {
    if (!p.foes.length) return edMsg('Put some enemies in first: the flag is where their fight happens.');
    p.at = mid;
  } else if (EDS.tab === 'erase') {
    const n = JSON.stringify(p);
    p.foes = p.foes.filter(f => Math.floor(f.x / ED_CELL) !== c);
    p.props = p.props.filter(q => Math.floor(q.x / ED_CELL) !== c);
    if (r >= 1) edPlatCut(p, x0, r);
    if (!p.foes.length) delete p.pool;
    if (JSON.stringify(p) === n) return;
  } else return;
  edSave();
  edDraw();
}
// Lay one square of platform at row h, joining the platforms beside it in that row
function edPlatAdd(p, x0, h) {
  const x1 = x0,
    x2 = x0 + ED_CELL;
  if (p.plats.some(q => q.h === h && q.x1 <= x1 && q.x2 >= x2)) return true;
  const near = p.plats.filter(q => q.h === h && q.x2 >= x1 && q.x1 <= x2);
  if (!near.length && p.plats.length >= ED_LIM.plats) return false;
  const a = Math.min(x1, ...near.map(q => q.x1)),
    b = Math.max(x2, ...near.map(q => q.x2));
  p.plats = p.plats.filter(q => !near.includes(q));
  p.plats.push({ x1: a, x2: b, h });
  return true;
}
// Take one square out of a platform at row h (it may split in two)
function edPlatCut(p, x0, h) {
  const x2 = x0 + ED_CELL,
    out = [];
  for (const q of p.plats) {
    if (q.h !== h || q.x2 <= x0 || q.x1 >= x2) {
      out.push(q);
      continue;
    }
    if (q.x1 < x0) out.push({ x1: q.x1, x2: x0, h });
    if (q.x2 > x2) out.push({ x1: x2, x2: q.x2, h });
  }
  p.plats = out.slice(0, ED_LIM.plats);
}
// ===== TABS AND PIECES =====
function edTabs() {
  const box = $('ed-tabs');
  box.innerHTML = '';
  for (const [k, label] of ED_TABS) {
    const b = document.createElement('button');
    b.className = 'chtab' + (EDS.tab === k ? ' on' : '');
    b.textContent = label;
    b.dataset.k = k;
    b.onclick = () => {
      EDS.tab = k;
      EDS.del = EDS.delPart = 0;
      edTabs();
      edPal();
      edMsg(ED_HELP[k]);
      $('ed-tabs').querySelector('[data-k="' + k + '"]').focus({ preventScroll: true });
    };
    box.appendChild(b);
  }
}
// A piece to pick: a little canvas picture and a name
function edPiece(box, on, label, draw, pick, sub) {
  const b = document.createElement('button');
  b.className = 'chitem own' + (on ? ' on' : '');
  const cv = document.createElement('canvas');
  cv.width = 104;
  cv.height = 84;
  b.appendChild(cv);
  const nb = document.createElement('b');
  nb.textContent = label;
  b.appendChild(nb);
  if (sub) {
    const s = document.createElement('small');
    s.textContent = sub;
    b.appendChild(s);
  }
  if (draw)
    withCtx(cv.getContext('2d'), () => {
      ctx.scale(2, 2);
      draw();
    });
  b.onclick = pick;
  box.appendChild(b);
  return b;
}
// A button in the PARTS tab
function edBtn(box, label, fn, dis) {
  const b = document.createElement('button');
  b.className = 'btn alt edbtn';
  b.textContent = label;
  b.disabled = !!dis;
  b.onclick = fn;
  box.appendChild(b);
  return b;
}
function edPal() {
  const box = $('ed-pal'),
    L = edLevel(),
    B = BIOMES[L.b],
    p = edPart();
  box.innerHTML = '';
  box.className = EDS.tab === 'parts' ? 'edparts' : '';
  if (EDS.tab === 'foe') {
    const types = [...ED_FOES, ...(B.mini ? [B.mini.t] : [])];
    for (const t of types)
      edPiece(
        box,
        EDS.foe === t,
        TNAME[t],
        () => {
          const e = edFoeFig(t),
            s = Math.min(1, 0.62 / (T[t].s || 1));
          ctx.save();
          ctx.translate(26, 40);
          ctx.scale(s, s);
          Object.assign(e, { x: 0, y: 0, gy: 0, face: 1, st: 'free', flash: 0, hp: e.max, pmax: 0 });
          drawF(e);
          ctx.restore();
        },
        () => {
          EDS.foe = t;
          edPal();
          box.querySelector('.on').focus({ preventScroll: true });
        },
        t.length > 1 ? 'MINI-BOSS' : ''
      );
  } else if (EDS.tab === 'prop') {
    for (const [k] of B.props)
      edPiece(
        box,
        EDS.prop === k,
        k.toUpperCase(),
        () => {
          ctx.save();
          ctx.translate(26, 39);
          ctx.scale(0.2, 0.2);
          ctx.translate(0, -G);
          drawProp({ k, x: 0, s: 1 }, 0, 0);
          ctx.restore();
        },
        () => {
          EDS.prop = k;
          edPal();
          box.querySelector('.on').focus({ preventScroll: true });
        }
      );
  } else if (EDS.tab === 'parts') {
    edBtn(box, '◀ PART', () => edGoPart(-1), EDS.part <= 0);
    edBtn(box, 'PART ▶', () => edGoPart(1), EDS.part >= L.parts.length - 1);
    edBtn(box, '+ ADD A PART', edAddPart, L.parts.length >= ED_LIM.parts);
    edBtn(box, EDS.delPart ? 'TAP AGAIN TO DELETE' : 'DELETE THIS PART', edDelPart, L.parts.length <= 1).classList.toggle(
      'warn',
      !!EDS.delPart
    );
    edBtn(box, 'SHORTER', () => edWidth(-5), p.w <= ED_LIM.cols[0] * ED_CELL);
    edBtn(box, 'LONGER', () => edWidth(5), p.w >= ED_LIM.cols[1] * ED_CELL);
    const st = edBtn(box, p.pool ? '★ IN STORIES' : '☆ NOT IN STORIES', edStar, !p.foes.length);
    st.classList.toggle('on', !!p.pool);
    edBtn(box, EDS.del ? 'TAP AGAIN TO DELETE' : 'DELETE LEVEL', edDelLevel).classList.toggle('warn', !!EDS.del);
  } else {
    const k = EDS.tab;
    edMsg(ED_HELP[k]);
  }
}
function edGoPart(d) {
  EDS.part = Math.max(0, Math.min(edLevel().parts.length - 1, EDS.part + d));
  EDS.ox = 0;
  EDS.delPart = 0;
  edPal();
  edDraw();
}
function edAddPart() {
  const L = edLevel();
  if (L.parts.length >= ED_LIM.parts) return;
  L.parts.splice(EDS.part + 1, 0, normPart({}, L.b));
  edSave();
  edGoPart(1);
  edMsg('A new part, after the last one.');
}
function edDelPart() {
  const L = edLevel();
  if (L.parts.length <= 1) return;
  if (!EDS.delPart) {
    EDS.delPart = 1;
    return edPal();
  }
  L.parts.splice(EDS.part, 1);
  EDS.part = Math.min(EDS.part, L.parts.length - 1);
  EDS.ox = 0;
  EDS.delPart = 0;
  edSave();
  edPal();
  edDraw();
}
function edWidth(d) {
  const p = edPart();
  p.w = Math.max(ED_LIM.cols[0], Math.min(ED_LIM.cols[1], p.w / ED_CELL + d)) * ED_CELL;
  // anything past the new end goes
  p.plats = p.plats.filter(q => q.x1 < p.w).map(q => ({ ...q, x2: Math.min(q.x2, p.w) }));
  p.foes = p.foes.filter(f => f.x < p.w);
  p.props = p.props.filter(q => q.x < p.w);
  if (p.foes.length) p.at = Math.min(p.at, p.w - ED_CELL / 2);
  EDS.ox = Math.min(EDS.ox, Math.max(0, p.w - W));
  edSave();
  edPal();
  edDraw();
}
function edStar() {
  const p = edPart();
  if (!p.foes.length) return;
  if (p.pool) delete p.pool;
  else p.pool = 1;
  edSave();
  edPal();
  edDraw();
  edMsg(p.pool ? 'This part can now turn up in ' + BIOMES[edLevel().b].name + ' in stories!' : 'Kept out of stories.');
  $('ed-pal').querySelector('.edbtn.on, .edbtn:nth-child(7)').focus({ preventScroll: true });
}
function edDelLevel() {
  if (!EDS.del) {
    EDS.del = 1;
    return edPal();
  }
  EDIT.levels.splice(EDS.i, 1);
  EDS.i = -1;
  save();
  openLevels();
}
function edScroll(d) {
  EDS.ox = Math.max(0, Math.min(edPart().w - W, EDS.ox + d * 5 * ED_CELL));
  edDraw();
}
$('ed-left').onclick = () => edScroll(-1);
$('ed-right').onclick = () => edScroll(1);
$('ed-name').addEventListener('input', () => {
  edLevel().name = $('ed-name').value;
  edSave();
});
$('ed-name').addEventListener('change', () => ($('ed-name').value = edLevel().name));
$('ed-play').onclick = () => {
  edSave();
  startCustom(edLevel());
};
$('ed-back').onclick = () => {
  edSave();
  openLevels();
};
$('ed-lback').onclick = () => {
  openCust();
  $('b-levels').focus({ preventScroll: true });
};
$('ed-pback').onclick = () => openLevels();
$('b-levels').onclick = openLevels;
