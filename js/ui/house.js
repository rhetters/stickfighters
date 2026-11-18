// Orange vs. the Pink Army: House screen: build walls square by square, pick a background, buy and place
// furniture and decorations. Works with touch (tap or drag to paint), mouse, keyboard and controllers (every grid
// square is a button, so menu navigation reaches it).
// ===== HOUSE SCREEN =====
const HS = { tab: 'walls', tile: 'wood', item: null, arm: null, paint: false, last: '' };
const HS_TABS = [
  ['walls', 'WALLS'],
  ['hfurn', 'FURNITURE'],
  ['hdecor', 'DECORATIONS'],
  ['hbg', 'BACKGROUND'],
  ['erase', 'ERASE']
];
function houseMsg(t) {
  $('hs-msg').textContent = t || '';
}
function houseSave() {
  Object.assign(HOUSE, normHouse(HOUSE));
  ecoSave(true);
}
function openHouse() {
  closePanels();
  releaseAll();
  state = 'menu';
  Object.assign(HOUSE, normHouse(HOUSE));
  show('s-house');
  houseMsg('');
  houseCells();
  houseTabs();
  housePal();
  houseDraw();
  $('hs-tabs').querySelector('button').focus({ preventScroll: true });
}
function closeHouse() {
  HS.arm = null;
  show('s-title');
  titleView();
  splitOpen('cust');
  $('b-house').focus({ preventScroll: true });
}
function houseDraw() {
  const c = $('hs-cv');
  withCtx(c.getContext('2d'), () => {
    drawHouse(HOUSE);
    // the current fighter stands in the house
    const L = lookOf(curFighter()),
      S = (STANCES.find(s => s.id === L.stance) || STANCES[0]).p,
      f = { look: L, face: 1, s: 1, slot: 0, vx: 0 },
      o = {};
    drawFig(110, G, 1, S, L.ht, L.col, L.d2, 0, 1, L.lw, o, L.head, lookLayers(f, { face: 1, s: L.ht }, 1));
    drawLook(f, { ...o, face: 1, s: L.ht }, 1, 'front');
  });
  $('hs-stars').textContent = ECO.stars;
}
// One button per grid square, laid over the canvas
function houseCells() {
  const box = $('hs-cells');
  box.innerHTML = '';
  box.style.top = (HGRID.top / H) * 100 + '%';
  box.style.height = ((HGRID.rows * HGRID.cell) / H) * 100 + '%';
  box.style.gridTemplateColumns = 'repeat(' + HGRID.cols + ', 1fr)';
  for (let r = 0; r < HGRID.rows; r++)
    for (let c = 0; c < HGRID.cols; c++) {
      const b = document.createElement('button');
      b.className = 'hcell';
      b.dataset.k = c + ',' + r;
      b.setAttribute('aria-label', 'Square ' + (c + 1) + ', ' + (HGRID.rows - r));
      // a tap acts on pointerdown; click only comes from a keyboard or controller (detail 0)
      b.onclick = e => {
        if (!e.detail) houseAct(c, r);
      };
      box.appendChild(b);
    }
}
function houseAt(e) {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  return el && el.classList && el.classList.contains('hcell') ? el.dataset.k : '';
}
$('hs-cells').addEventListener('pointerdown', e => {
  const k = houseAt(e);
  if (!k) return;
  e.preventDefault();
  HS.paint = HS.tab === 'walls' || HS.tab === 'erase';
  HS.last = k;
  const [c, r] = k.split(',').map(Number);
  houseAct(c, r);
});
$('hs-cells').addEventListener('pointermove', e => {
  if (!HS.paint) return;
  const k = houseAt(e);
  if (!k || k === HS.last) return;
  HS.last = k;
  const [c, r] = k.split(',').map(Number);
  houseAct(c, r);
});
addEventListener('pointerup', () => (HS.paint = false));
addEventListener('pointercancel', () => (HS.paint = false));
// What a tap on square (c, r) does, by tab
function houseAct(c, r) {
  const k = c + ',' + r;
  if (HS.tab === 'walls') {
    if (HOUSE.cells[k] === HS.tile) return;
    const t = HTILE[HS.tile];
    if (!spendStars(t.price, 'house-' + t.id))
      return houseMsg('Not enough stars for ' + t.name + ' (' + t.price + ').');
    HOUSE.cells[k] = HS.tile;
    sfx(300, 0.04, 'square', 0.03, 100);
  } else if (HS.tab === 'erase') {
    const i = houseItemAt(c, r);
    if (i >= 0) HOUSE.items.splice(i, 1);
    else if (HOUSE.cells[k]) delete HOUSE.cells[k];
    else return;
    sfx(200, 0.05, 'triangle', 0.03, -100);
  } else if (HS.tab === 'hfurn' || HS.tab === 'hdecor') {
    if (!HS.item) return houseMsg('Pick something below first.');
    if (HOUSE.items.length >= HOUSE_MAX_ITEMS)
      return houseMsg('Your house is full (' + HOUSE_MAX_ITEMS + ' things).');
    const d = ITEM[HS.item];
    // the tapped square is the bottom-left corner of the item
    HOUSE.items.push({ id: d.id, x: Math.min(c, HGRID.cols - d.w), y: Math.max(0, r - d.h + 1) });
    sfx(500, 0.06, 'square', 0.03, 200);
  } else return;
  houseSave();
  houseDraw();
}
// The topmost item covering a square, or -1
function houseItemAt(c, r) {
  for (let i = HOUSE.items.length - 1; i >= 0; i--) {
    const it = HOUSE.items[i],
      d = ITEM[it.id];
    if (c >= it.x && c < it.x + d.w && r >= it.y && r < it.y + d.h) return i;
  }
  return -1;
}
function houseTabs() {
  const box = $('hs-tabs');
  box.innerHTML = '';
  for (const [id, name] of HS_TABS) {
    const b = document.createElement('button');
    b.className = 'chtab' + (HS.tab === id ? ' on' : '');
    b.textContent = name;
    b.onclick = () => {
      HS.tab = id;
      HS.arm = null;
      houseMsg(
        id === 'walls'
          ? 'Pick a material, then tap or drag on the grid. Each square costs stars.'
          : id === 'erase'
            ? 'Tap a thing or a wall square to remove it.'
            : id === 'hbg'
              ? 'Tap a background to use it.'
              : 'Pick one, then tap where its bottom-left corner goes.'
      );
      houseTabs();
      housePal();
      $('hs-tabs')
        .querySelectorAll('button')
        [HS_TABS.findIndex(t => t[0] === id)].focus({ preventScroll: true });
    };
    box.appendChild(b);
  }
}
// The cards under the tabs: wall materials, or the store items of that section
function housePal() {
  const box = $('hs-pal');
  box.innerHTML = '';
  const card = (on, own, name, note, draw, click) => {
    const b = document.createElement('button');
    b.className = 'chitem' + (own ? ' own' : '') + (on ? ' on' : '');
    b.innerHTML = '<canvas width="128" height="104"></canvas><b></b><small></small>';
    b.querySelector('b').textContent = name;
    b.querySelector('small').textContent = note;
    const k = b.querySelector('canvas').getContext('2d');
    k.setTransform(2, 0, 0, 2, 0, 0);
    withCtx(k, draw);
    b.onclick = click;
    box.appendChild(b);
  };
  if (HS.tab === 'walls')
    for (const t of HTILES)
      card(
        HS.tile === t.id,
        true,
        t.name,
        t.price + ' per square',
        () => houseTile(t, 12, 2, 40),
        () => {
          HS.tile = t.id;
          housePal();
        }
      );
  if (HS.tab === 'hfurn' || HS.tab === 'hdecor' || HS.tab === 'hbg')
    for (const it of ITEMS.filter(i => i.sec === HS.tab)) {
      const own = owns(it.id),
        on = HS.tab === 'hbg' ? HOUSE.bg === it.id : HS.item === it.id;
      card(
        on,
        own,
        it.name,
        own ? (on ? 'IN USE' : 'Owned') : HS.arm === it.id ? 'Tap to buy' : howText(it),
        () => {
          if (HS.tab === 'hbg') {
            ctx.save();
            ctx.beginPath();
            ctx.rect(4, 2, 56, 46);
            ctx.clip();
            ctx.scale(0.08, 0.12);
            houseBg(it);
            ctx.restore();
            ctx.strokeStyle = INK;
            ctx.lineWidth = 2;
            ctx.strokeRect(4, 2, 56, 46);
          } else {
            const s = Math.min(56 / it.w, 48 / it.h);
            houseThing(it, 32 - (it.w * s) / 2, 50 - it.h * s, it.w * s, it.h * s);
          }
        },
        () => housePick(it)
      );
    }
}
function housePick(it) {
  if (!owns(it.id)) {
    if (HS.arm !== it.id) {
      HS.arm = it.id;
      houseMsg(it.price ? 'Tap again to buy ' + it.name + ' for ' + it.price + ' stars.' : howText(it) + '.');
      return housePal();
    }
    HS.arm = null;
    if (!it.price || !buyItem(it.id)) {
      houseMsg(it.price ? 'Not enough stars for ' + it.name + '.' : howText(it) + '.');
      return housePal();
    }
    houseMsg('You bought ' + it.name + '!');
    sfx(700, 0.12, 'square', 0.05, 300);
  }
  if (it.sec === 'hbg') {
    HOUSE.bg = it.id;
    houseSave();
  } else {
    HS.item = it.id;
    if (owns(it.id)) houseMsg('Now tap where its bottom-left corner goes.');
  }
  housePal();
  houseDraw();
}
$('b-house').onclick = openHouse;
$('b-houseback').onclick = closeHouse;
$('b-hvisit').onclick = () => {
  ROSTER = [];
  startHouse({ ...normHouse(HOUSE), name: 'MY HOUSE' });
};
