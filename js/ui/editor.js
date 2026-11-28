// StickFighters: the level creator's screens (Customize → LEVELS). MY LEVELS lists Rhett's levels and NEW LEVEL;
// PICK A PLACE chooses a biome for a new one (or for a new place in a level); the editor shows a part of the level
// with that place's real scenery and a grid over it, like the house builder: every square in view is a button (touch,
// mouse, keyboard and controllers). Tabs: PLATFORMS (tap or drag along a row), ENEMIES (drop one in where you tap),
// SCENERY (on one of three layers), FLAG (where the fight stops the screen), BOSS (only in the very last part), ERASE,
// and PARTS (move between parts, add a part or a place, delete one, a part's width). PLAY plays the level and comes
// back here. Everything is saved as you go (EDIT.levels).
// ===== STATE =====
// i: the level, pl: its place, part: the part in that place, ox: how far the view is scrolled into the part
const EDS = {
  i: -1,
  pl: 0,
  part: 0,
  ox: 0,
  tab: 'plat',
  foe: 'g',
  prop: null,
  layer: 'b',
  boss: 'G',
  adding: false,
  paint: false,
  last: '',
  del: 0,
  delPart: 0,
  delPlace: 0
};
const ED_TABS = [
  ['plat', 'PLATFORMS'],
  ['foe', 'ENEMIES'],
  ['prop', 'SCENERY'],
  ['flag', 'FLAG'],
  ['boss', 'BOSS'],
  ['erase', 'ERASE'],
  ['parts', 'PARTS']
];
const ED_HELP = {
  plat: 'Tap or drag along a row to lay a platform.',
  foe: 'Pick an enemy, then tap where it drops in. Up to 10 in a fight.',
  prop: 'Pick a layer and some scenery, then tap where it goes.',
  flag: 'Tap where the fight should stop the screen.',
  boss: 'Pick a boss, then tap where he waits. One boss, in the very last part.',
  erase: 'Tap or drag to take things away.',
  parts: 'A story is up to 3 places, each up to 6 parts.'
};
const ED_COLS = W / ED_CELL; // squares across the view (15)
const edLevel = () => EDIT.levels[EDS.i];
const edPlace = () => edLevel().places[EDS.pl];
const edPart = () => edPlace().parts[EDS.part];
// Is the part in view the level's very last one (where the boss goes)?
const edIsLast = () => edPart() === edLastPart(edLevel());
function edSave() {
  EDIT.levels[EDS.i] = normLevel(edLevel());
  save();
}
function edMsg(t) {
  $('ed-msg').textContent = t || '';
}
// ===== DRAWING =====
// Draws part pi of place pl of level L with ox pixels scrolled into it, with the game's own scenery drawing (a level
// built just for the picture; the game's LV and camera are put back after). marks = the editor's markers and grid.
function edScene(L, pl, pi, ox, marks) {
  const keepLV = LV,
    keepCam = { x: CAM.x, y: CAM.y, z: CAM.z },
    p = L.places[pl].parts[pi];
  try {
    LV = buildCustom(L);
    const c = LV.ch[LV.pch[pl][pi]];
    CAM.x = c.x0 + ox;
    CAM.y = 0;
    CAM.z = 1;
    ctx.save();
    drawLevelBg();
    ctx.restore();
    ctx.save();
    camApply(CAM.x, 0, 1);
    edFoes(p, c.x0);
    if (L.boss && p === edLastPart(L)) edBossFig(L.boss, p, c.x0);
    ctx.restore();
    ctx.save();
    drawFrontProps(0.75);
    ctx.restore();
    ctx.save();
    camApply(CAM.x, 0, 1);
    if (marks) edMarks(p, c);
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
// The boss, waiting where he was put
function edBossFig(bo, p, x0) {
  const e = edFoeFig(bo.t),
    y = edLand(p, bo.x);
  Object.assign(e, { x: x0 + bo.x, y, gy: y, face: -1, st: 'free', flash: 0, hp: e.max, pmax: 0 });
  drawF(e);
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
  const bo = edLevel() && p === edLastPart(edLevel()) && edLevel().boss,
    at = p.foes.length ? p.at : bo ? Math.max(W / 2, Math.min(p.w - W / 2, bo.x)) : null;
  if (at !== null) {
    const fx = c.x0 + at;
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
  withCtx(k, () => edScene(edLevel(), EDS.pl, EDS.part, EDS.ox, true));
  const p = edPart(),
    L = edLevel();
  $('ed-part').textContent =
    (L.places.length > 1 ? 'PLACE ' + (EDS.pl + 1) + ': ' : '') +
    BIOMES[edPlace().b].name +
    ' · PART ' +
    (EDS.part + 1) +
    ' OF ' +
    edPlace().parts.length;
  $('ed-left').disabled = EDS.ox <= 0;
  $('ed-right').disabled = EDS.ox >= p.w - W;
}
// A level's picture for its tile: the start of its first part, cropped square
function edThumb(L) {
  const big = document.createElement('canvas');
  big.width = W;
  big.height = H;
  withCtx(big.getContext('2d'), () => edScene(L, 0, 0, 0, false));
  return k => k.drawImage(big, 210, 0, 420, 420, 17, 17, 166, 166);
}
// The same picture as a tile's image (cached by the level's contents)
const EDTHUMB = new Map();
function edThumbURL(L) {
  const k = JSON.stringify(L);
  if (!EDTHUMB.has(k)) {
    const cv = document.createElement('canvas'),
      draw = edThumb(L);
    cv.width = cv.height = 200;
    withCtx(cv.getContext('2d'), () => {
      ctx.beginPath();
      ctx.roundRect(17, 17, 166, 166, 16);
      ctx.clip();
      draw(ctx);
    });
    if (EDTHUMB.size > 40) EDTHUMB.clear();
    EDTHUMB.set(k, cv.toDataURL());
  }
  return EDTHUMB.get(k);
}
// ===== MY LEVELS =====
function openLevels() {
  closePanels();
  releaseAll();
  state = 'menu';
  const box = $('ed-list'),
    opts = [
      { k: 'new', label: 'NEW STORY', pic: () => edPlusPic(), pick: () => openPlaces() },
      // a map: one screen for Versus and Arcade (a stage of your own)
      { k: 'newmap', label: 'NEW ARENA', pic: () => edPlusPic('#3ec5ff'), pick: () => openPlaces(false, true) },
      ...EDIT.levels.map((L, i) => ({
        k: 'lv' + i + ':' + JSON.stringify(L).length,
        label: (L.map ? 'ARENA: ' : '') + L.name,
        pic: edThumb(L),
        pick: () => openEdit(i)
      }))
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
  box.children[0].disabled = edLevels().length >= ED_LIM.levels;
  box.children[1].disabled = edMaps().length >= ED_LIM.maps;
  show('s-levels');
  box.firstChild.focus({ preventScroll: true });
}
function edPlusPic(col) {
  ctx.fillStyle = col || '#ffd400';
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
// For a new level, or (add) for a new place in the level being edited
const EDPLACE = {};
function openPlaces(add = false, map = false) {
  EDS.adding = add;
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
        const draw = edThumb(normLevel({ places: [{ b }] })),
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
      t.onclick = () => (add ? edAddPlace(b) : edNew(b, map));
      box.appendChild(t);
    }
  $('s-edpick').querySelector('h2').textContent = add ? 'ADD A PLACE' : map ? 'A PLACE FOR YOUR ARENA' : 'PICK A PLACE';
  show('s-edpick');
  box.firstChild.focus({ preventScroll: true });
}
function edNew(b, map) {
  if (map ? edMaps().length >= ED_LIM.maps : edLevels().length >= ED_LIM.levels) return openLevels();
  EDIT.levels.push(
    normLevel(
      map
        ? { places: [{ b }], name: 'ARENA ' + (edMaps().length + 1), map: 1 }
        : { places: [{ b }], name: 'STORY ' + (edLevels().length + 1) }
    )
  );
  save();
  openEdit(EDIT.levels.length - 1);
}
// ===== THE EDITOR =====
function openEdit(i, pl = 0, part = 0) {
  closePanels();
  releaseAll();
  state = 'menu';
  EDS.i = i;
  EDS.adding = false;
  EDS.pl = Math.min(pl, edLevel().places.length - 1);
  EDS.part = Math.min(part, edPlace().parts.length - 1);
  EDS.ox = Math.max(0, Math.min(EDS.ox, edPart().w - W));
  EDS.del = EDS.delPart = EDS.delPlace = 0;
  edPicks();
  $('ed-name').value = edLevel().name;
  show('s-edit');
  edCells();
  edTabs();
  edPal();
  edDraw();
  edMsg(ED_HELP[EDS.tab]);
  $('ed-tabs').querySelector('.on').focus({ preventScroll: true });
}
// The scenery and enemy picked must belong to the place in view
function edPicks() {
  const b = edPlace().b;
  if (!EDS.prop || !edPropOk(EDS.prop, b)) EDS.prop = BIOMES[b].props[0][0];
  if (!edFoeOk(EDS.foe, b)) EDS.foe = 'g';
}
// Back from trying a map in Arcade
function edReturnMap() {
  const id = STG.st.map.id,
    i = EDIT.levels.findIndex(L => L.id === id);
  STG.edit = false;
  init();
  MODE = LEVEL;
  if (i < 0) return openLevels();
  openEdit(i, 0, 0);
}
// Back from playing a level (the pause menu's QUIT, the KO screen's EDIT, or the end of the level)
function edReturn() {
  const id = LV && LV.custom,
    i = EDIT.levels.findIndex(L => L.id === id);
  init();
  MODE = LEVEL;
  if (i < 0) return openLevels();
  openEdit(i, EDS.pl, EDS.part);
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
  if (EDS.del) {
    // anything else keeps the story
    EDS.del = 0;
    edDelBtn();
  }
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
    p.props.push({ k: EDS.prop, x: mid, s: 1, ...(EDS.layer !== 'b' ? { l: EDS.layer } : {}) });
  } else if (EDS.tab === 'flag') {
    if (!p.foes.length) return edMsg('Put some enemies in first: the flag is where their fight happens.');
    p.at = mid;
  } else if (EDS.tab === 'boss') {
    if (!edIsLast()) return edMsg('The boss waits at the very end: he goes in the last part.');
    edLevel().boss = { t: EDS.boss, x: mid };
    sfx(160, 0.2, 'sawtooth', 0.05, -60);
  } else if (EDS.tab === 'erase') {
    const L = edLevel(),
      n = JSON.stringify(L);
    p.foes = p.foes.filter(f => Math.floor(f.x / ED_CELL) !== c);
    p.props = p.props.filter(q => Math.floor(q.x / ED_CELL) !== c);
    if (r >= 1) edPlatCut(p, x0, r);
    if (L.boss && edIsLast() && Math.floor(L.boss.x / ED_CELL) === c) delete L.boss;
    if (JSON.stringify(L) === n) return;
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
// A map has only platforms, scenery and erase (no fight, boss or more parts)
const ED_MAP_TABS = ['plat', 'prop', 'erase'];
const edTabList = () => (edLevel().map ? ED_TABS.filter(t => ED_MAP_TABS.includes(t[0])) : ED_TABS);
function edTabs() {
  const box = $('ed-tabs');
  box.innerHTML = '';
  if (!edTabList().some(t => t[0] === EDS.tab)) EDS.tab = 'plat';
  for (const [k, label] of edTabList()) {
    const b = document.createElement('button');
    b.className = 'chtab' + (EDS.tab === k ? ' on' : '');
    b.textContent = label;
    b.dataset.k = k;
    b.onclick = () => {
      EDS.tab = k;
      EDS.del = EDS.delPart = EDS.delPlace = 0;
      edTabs();
      edPal();
      edMsg(ED_HELP[k]);
      $('ed-tabs').querySelector('[data-k="' + k + '"]').focus({ preventScroll: true });
    };
    box.appendChild(b);
  }
}
// A piece to pick: a little canvas picture and a name
// An enemy or boss standing in its card's picture (52 x 42), scaled to fit whole: its outline is measured once by
// drawing it big on a spare canvas (heads, hats, hair and weapons all count)
const ED_FIG_BOX = {};
function edFigBox(t) {
  if (ED_FIG_BOX[t]) return ED_FIG_BOX[t];
  const cv = document.createElement('canvas');
  cv.width = cv.height = 400;
  withCtx(cv.getContext('2d'), () => edFigDraw(t, 200, 300, 1));
  const d = cv.getContext('2d').getImageData(0, 0, 400, 400).data;
  let x0 = 400,
    y0 = 400,
    x1 = 0,
    y1 = 0;
  for (let y = 0; y < 400; y++)
    for (let x = 0; x < 400; x++)
      if (d[(y * 400 + x) * 4 + 3] > 20) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  // nothing drawn: a sensible guess
  return (ED_FIG_BOX[t] = x1 < x0 ? { x0: 170, y0: 220, x1: 230, y1: 300 } : { x0, y0, x1: x1 + 1, y1: y1 + 1 });
}
function edFigDraw(t, x, y, s) {
  const e = edFoeFig(t);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  Object.assign(e, { x: 0, y: 0, gy: 0, face: 1, st: 'free', flash: 0, hp: e.max, pmax: 0 });
  drawF(e);
  ctx.restore();
}
function edFigPic(t) {
  const b = edFigBox(t),
    s = Math.min(1, 38 / (b.y1 - b.y0), 46 / (b.x1 - b.x0));
  // its feet's spot (200, 300 on the spare canvas) placed so the outline is centred in the picture
  edFigDraw(t, 26 - ((b.x0 + b.x1) / 2 - 200) * s, 41 - (b.y1 - 300) * s, s);
}
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
    B = BIOMES[edPlace().b],
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
        () => edFigPic(t),
        () => {
          EDS.foe = t;
          edPal();
          box.querySelector('.on').focus({ preventScroll: true });
        },
        t.length > 1 ? 'MINI-BOSS' : ''
      );
  } else if (EDS.tab === 'prop') {
    // the layer first: far background, background, foreground
    const lay = document.createElement('div');
    lay.className = 'edlayers';
    for (const [l, label] of ED_LAYERS) {
      const b = document.createElement('button');
      b.className = 'chtab' + (EDS.layer === l ? ' on' : '');
      b.textContent = label;
      b.dataset.l = l;
      b.onclick = () => {
        EDS.layer = l;
        edPal();
        box.querySelector('[data-l="' + l + '"]').focus({ preventScroll: true });
      };
      lay.appendChild(b);
    }
    box.appendChild(lay);
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
          box.querySelector('.chitem.on').focus({ preventScroll: true });
        }
      );
  } else if (EDS.tab === 'boss') {
    for (const t of ED_BOSSES)
      edPiece(
        box,
        !!L.boss && L.boss.t === t,
        TNAME[t],
        () => edFigPic(t),
        () => {
          EDS.boss = t;
          // a boss already in the level changes to this one
          if (L.boss) {
            L.boss.t = t;
            edSave();
            edDraw();
          }
          edPal();
          box.querySelector('.on, .chitem').focus({ preventScroll: true });
        },
        EDS.boss === t && !L.boss ? 'PICKED' : ''
      ).classList.toggle('pick', EDS.boss === t);
    if (L.boss)
      edBtn(box, 'NO BOSS', () => {
        delete L.boss;
        edSave();
        edPal();
        edDraw();
      });
    if (!edIsLast()) edBtn(box, 'GO TO THE LAST PART', edGoLast);
  } else if (EDS.tab === 'parts') {
    const all = edParts(L),
      n = all.findIndex(q => q.pl === EDS.pl && q.i === EDS.part);
    edBtn(box, '◀ PART', () => edGoPart(-1), n <= 0);
    edBtn(box, 'PART ▶', () => edGoPart(1), n >= all.length - 1);
    edBtn(box, '+ ADD A PART', edAddPart, edPlace().parts.length >= ED_LIM.parts);
    edBtn(box, '+ ADD A PLACE', () => openPlaces(true), L.places.length >= ED_LIM.places);
    edBtn(box, EDS.delPart ? 'TAP AGAIN TO DELETE' : 'DELETE THIS PART', edDelPart, edPlace().parts.length <= 1).classList.toggle(
      'warn',
      !!EDS.delPart
    );
    if (L.places.length > 1)
      edBtn(box, EDS.delPlace ? 'TAP AGAIN TO DELETE' : 'DELETE THIS PLACE', edDelPlace).classList.toggle('warn', !!EDS.delPlace);
    edBtn(box, 'SHORTER', () => edWidth(-5), p.w <= ED_LIM.cols[0] * ED_CELL);
    edBtn(box, 'LONGER', () => edWidth(5), p.w >= ED_LIM.cols[1] * ED_CELL);
  } else edMsg(ED_HELP[EDS.tab]);
  edDelBtn();
}
// To the part d parts on (across places: the last part of a place leads to the first of the next)
function edGoPart(d) {
  const all = edParts(edLevel()),
    n = all.findIndex(q => q.pl === EDS.pl && q.i === EDS.part),
    q = all[Math.max(0, Math.min(all.length - 1, n + d))];
  edGoTo(q.pl, q.i);
}
function edGoTo(pl, part) {
  EDS.pl = pl;
  EDS.part = part;
  EDS.ox = 0;
  EDS.delPart = EDS.delPlace = 0;
  edPicks();
  edPal();
  edDraw();
}
const edGoLast = () => {
  const L = edLevel();
  edGoTo(L.places.length - 1, L.places[L.places.length - 1].parts.length - 1);
  edMsg(ED_HELP.boss);
};
function edAddPart() {
  const P = edPlace();
  if (P.parts.length >= ED_LIM.parts) return;
  P.parts.splice(EDS.part + 1, 0, normPart({}, P.b));
  edSave();
  edGoTo(EDS.pl, EDS.part + 1);
  edMsg('A new part, after this one.');
}
// A new place after the one in view (from PICK A PLACE), with one empty part
function edAddPlace(b) {
  const L = edLevel();
  if (L.places.length >= ED_LIM.places) return openEdit(EDS.i, EDS.pl, EDS.part);
  L.places.splice(EDS.pl + 1, 0, normPlace({ b }));
  edSave();
  openEdit(EDS.i, EDS.pl + 1, 0);
  edMsg('A new place: ' + BIOMES[b].name + '. A transition will carry you here.');
}
function edDelPart() {
  const P = edPlace();
  if (P.parts.length <= 1) return;
  if (!EDS.delPart) {
    EDS.delPart = 1;
    return edPal();
  }
  P.parts.splice(EDS.part, 1);
  edSave();
  edGoTo(EDS.pl, Math.min(EDS.part, P.parts.length - 1));
}
function edDelPlace() {
  const L = edLevel();
  if (L.places.length <= 1) return;
  if (!EDS.delPlace) {
    EDS.delPlace = 1;
    return edPal();
  }
  L.places.splice(EDS.pl, 1);
  edSave();
  edGoTo(Math.min(EDS.pl, L.places.length - 1), 0);
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
// DELETE (top row, beside the name): the whole story or arena, after a second tap
function edDelBtn() {
  const b = $('ed-del');
  b.textContent = EDS.del ? 'TAP AGAIN TO DELETE' : edLevel().map ? 'DELETE ARENA' : 'DELETE STORY';
  b.classList.toggle('warn', !!EDS.del);
}
$('ed-del').onclick = () => edDelLevel();
function edDelLevel() {
  if (!EDS.del) {
    EDS.del = 1;
    edDelBtn();
    return edMsg('Tap it again to delete ' + edLevel().name + ' for good, or anything else to keep it.');
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
  // a map is tried in Arcade, on it (QUIT comes back here)
  if (edLevel().map) return edTryMap(edLevel());
  startCustom(edLevel(), 'edit');
};
$('ed-back').onclick = () => {
  edSave();
  openLevels();
};
$('ed-lback').onclick = () => {
  openCust();
  $('b-levels').focus({ preventScroll: true });
};
$('ed-pback').onclick = () => (EDS.adding ? openEdit(EDS.i, EDS.pl, EDS.part) : openLevels());
$('b-levels').onclick = openLevels;

// Try a map in Arcade (the level creator's PLAY); leaving the game comes back to the editor
function edTryMap(L) {
  STAGE_SEL = 'my:' + L.id;
  STG.net = null;
  STG.edit = true;
  MODE = ARCADE;
  start();
}
