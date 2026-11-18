// Orange vs. the Pink Army: House screen: build walls, floors and stairs square by square, place furniture and
// decorations, pick a background. Everything placed costs stars and erasing gives them all back. The view shows
// 20 x 7 squares of a much bigger land and moves with the arrow buttons; the land grows as you build.
// Works with touch (tap or drag to paint), mouse, keyboard and controllers (every square in view is a button).
// ===== HOUSE SCREEN =====
const HS = {
  tab: 'walls',
  tile: 'wood',
  solid: 'floor',
  item: null,
  arm: null,
  paint: false,
  last: '',
  ox: 0,
  oy: 0
};
const HS_TABS = [
  ['walls', 'WALLS'],
  ['solids', 'FLOORS & STAIRS'],
  ['hfurn', 'FURNITURE'],
  ['hdecor', 'DECORATIONS'],
  ['hbg', 'BACKGROUND'],
  ['erase', 'ERASE']
];
const HS_HELP = {
  walls: 'Pick a material, then tap or drag. Walls are scenery behind you.',
  solids: 'Floors and stairs hold you up: jump onto them, walk up stairs, Down + Jump to drop through.',
  hfurn: 'Pick one, then tap where its bottom-left corner goes.',
  hdecor: 'Pick one, then tap where its bottom-left corner goes.',
  hbg: 'Tap a background to use it.',
  erase: 'Tap or drag to remove things. You get all their stars back.'
};
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
  houseMsg(HS_HELP[HS.tab]);
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
// How far the view can move: the land you've built on plus some room to grow
function houseLimits() {
  const e = houseExt(HOUSE);
  return {
    x: Math.max(0, Math.min(HGRID.maxCols, e.cols + HGRID.grow) - HGRID.viewCols),
    y: Math.max(0, Math.min(HGRID.maxRows, e.rows + HGRID.viewRows) - HGRID.viewRows) // a screen of sky above
  };
}
function housePan(dx, dy) {
  const L = houseLimits();
  HS.ox = Math.max(0, Math.min(L.x, HS.ox + dx));
  HS.oy = Math.max(0, Math.min(L.y, HS.oy + dy));
  houseDraw();
}
function houseDraw() {
  const s = HGRID.cell;
  withCtx($('hs-cv').getContext('2d'), () => {
    drawHouse(HOUSE, HS.ox * s, -HS.oy * s);
    // the current fighter stands at the left of the land
    if (HS.ox < 4 && HS.oy === 0) {
      const L = lookOf(curFighter()),
        S = (STANCES.find(t => t.id === L.stance) || STANCES[0]).p,
        f = { look: L, face: 1, s: 1, slot: 0, vx: 0 },
        o = {},
        x = 110 - HS.ox * s;
      drawFig(x, G, 1, S, L.ht, L.col, L.d2, 0, 1, L.lw, o, L.head, lookLayers(f, { face: 1, s: L.ht }, 1));
      drawLook(f, { ...o, face: 1, s: L.ht }, 1, 'front');
    }
  });
  $('hs-stars').textContent = ECO.stars;
  const L = houseLimits();
  $('hs-pos').textContent = 'Square ' + (HS.ox + 1) + ' · floor ' + (HS.oy + 1);
  $('hs-left').disabled = HS.ox <= 0;
  $('hs-right').disabled = HS.ox >= L.x;
  $('hs-down').disabled = HS.oy <= 0;
  $('hs-up').disabled = HS.oy >= L.y;
}
// One button per square in view, laid over the canvas; the view's bottom row sits on the floor line
function houseCells() {
  const box = $('hs-cells'),
    V = HGRID.viewRows,
    s = HGRID.cell;
  box.innerHTML = '';
  box.style.top = ((G - V * s) / H) * 100 + '%';
  box.style.height = ((V * s) / H) * 100 + '%';
  box.style.gridTemplateColumns = 'repeat(' + HGRID.viewCols + ', 1fr)';
  for (let vr = 0; vr < V; vr++)
    for (let vc = 0; vc < HGRID.viewCols; vc++) {
      const b = document.createElement('button');
      b.className = 'hcell';
      b.dataset.v = vc + ',' + (V - 1 - vr); // view column, view row counted up from the bottom
      b.setAttribute('aria-label', 'Square ' + (vc + 1) + ', row ' + (V - vr));
      // a tap acts on pointerdown; click only comes from a keyboard or controller (detail 0)
      b.onclick = e => {
        if (!e.detail) houseActV(b.dataset.v);
      };
      box.appendChild(b);
    }
}
function houseActV(v) {
  const [vc, vr] = v.split(',').map(Number);
  houseAct(HS.ox + vc, HS.oy + vr);
}
function houseAt(e) {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  return el && el.classList && el.classList.contains('hcell') ? el.dataset.v : '';
}
$('hs-cells').addEventListener('pointerdown', e => {
  const v = houseAt(e);
  if (!v) return;
  e.preventDefault();
  HS.paint = HS.tab === 'walls' || HS.tab === 'solids' || HS.tab === 'erase';
  HS.last = v;
  houseActV(v);
});
$('hs-cells').addEventListener('pointermove', e => {
  if (!HS.paint) return;
  const v = houseAt(e);
  if (!v || v === HS.last) return;
  HS.last = v;
  houseActV(v);
});
addEventListener('pointerup', () => (HS.paint = false));
addEventListener('pointercancel', () => (HS.paint = false));
// Paint one square of a layer (cells = walls, solids = floors and stairs): pay for the new piece, refund the old one
function housePaint(layer, list, k, id) {
  const old = HOUSE[layer][k];
  if (old === id) return false;
  if (Object.keys(HOUSE[layer]).length >= HOUSE_MAX_SQUARES)
    return !houseMsg('That’s as big as a house can get!');
  const t = list[id];
  if (!spendStars(t.price, 'house'))
    return !houseMsg('Not enough stars for ' + t.name + ' (' + t.price + ').');
  if (old) refundStars(list[old].price, 'house');
  HOUSE[layer] = { ...HOUSE[layer], [k]: id };
  return true;
}
// What a tap on square (c, r) does, by tab
function houseAct(c, r) {
  const k = c + ',' + r;
  let done = false;
  if (HS.tab === 'walls') done = housePaint('cells', HTILE, k, HS.tile);
  else if (HS.tab === 'solids') done = housePaint('solids', HSOLID, k, HS.solid);
  else if (HS.tab === 'erase') {
    const i = houseItemAt(c, r);
    if (i >= 0) refundStars(ITEM[HOUSE.items.splice(i, 1)[0].id].price || 0, 'house');
    else if (HOUSE.solids[k]) {
      refundStars(HSOLID[HOUSE.solids[k]].price, 'house');
      delete HOUSE.solids[k];
    } else if (HOUSE.cells[k]) {
      refundStars(HTILE[HOUSE.cells[k]].price, 'house');
      delete HOUSE.cells[k];
    } else return;
    sfx(200, 0.05, 'triangle', 0.03, -100);
    done = true;
  } else if (HS.tab === 'hfurn' || HS.tab === 'hdecor') {
    if (!HS.item) return houseMsg('Pick something below first.');
    if (HOUSE.items.length >= HOUSE_MAX_ITEMS)
      return houseMsg('Your house is full (' + HOUSE_MAX_ITEMS + ' things).');
    const d = ITEM[HS.item];
    if (d.price && !spendStars(d.price, d.id))
      return houseMsg('Not enough stars for ' + d.name + ' (' + d.price + ').');
    // the tapped square is the bottom-left corner of the item
    HOUSE.items.push({ id: d.id, x: Math.min(c, HGRID.maxCols - d.w), y: Math.min(r, HGRID.maxRows - d.h) });
    sfx(500, 0.06, 'square', 0.03, 200);
    done = true;
  }
  if (!done) return;
  if (HS.tab === 'walls' || HS.tab === 'solids') sfx(300, 0.04, 'square', 0.03, 100);
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
      houseMsg(HS_HELP[id]);
      houseTabs();
      housePal();
      $('hs-tabs')
        .querySelectorAll('button')
        [HS_TABS.findIndex(t => t[0] === id)].focus({ preventScroll: true });
    };
    box.appendChild(b);
  }
}
// The cards under the tabs: wall materials, floors and stairs, or the store items of that section
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
        t.price + ' a square',
        () => houseTile(t, 12, 2, 40),
        () => {
          HS.tile = t.id;
          housePal();
        }
      );
  if (HS.tab === 'solids')
    for (const t of HSOLIDS)
      card(
        HS.solid === t.id,
        true,
        t.name,
        t.price + ' a square',
        () => houseSolid(t.id, 12, 2, 40),
        () => {
          HS.solid = t.id;
          housePal();
        }
      );
  if (HS.tab === 'hbg')
    for (const it of ITEMS.filter(i => i.sec === 'hbg')) {
      const own = owns(it.id),
        on = HOUSE.bg === it.id;
      card(
        on,
        own,
        it.name,
        own ? (on ? 'IN USE' : 'Owned') : HS.arm === it.id ? 'Tap to buy' : howText(it),
        () => {
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
        },
        () => houseBgPick(it)
      );
    }
  if (HS.tab === 'hfurn' || HS.tab === 'hdecor')
    for (const it of ITEMS.filter(i => i.sec === HS.tab)) {
      const can = !!it.price || owns(it.id);
      card(
        HS.item === it.id,
        can,
        it.name,
        it.price ? it.price + ' each' : can ? 'Free' : howText(it),
        () => {
          const s = Math.min(56 / it.w, 48 / it.h);
          houseThing(it, 32 - (it.w * s) / 2, 50 - it.h * s, it.w * s, it.h * s);
        },
        () => {
          if (!can) return houseMsg(howText(it) + '.');
          HS.item = it.id;
          houseMsg(
            'Now tap where its bottom-left corner goes' + (it.price ? ' (' + it.price + ' stars).' : '.')
          );
          housePal();
        }
      );
    }
}
// Backgrounds are bought once (tap twice to buy), then used as often as you like
function houseBgPick(it) {
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
  HOUSE.bg = it.id;
  houseSave();
  housePal();
  houseDraw();
}
$('b-house').onclick = openHouse;
$('b-houseback').onclick = closeHouse;
$('hs-left').onclick = () => housePan(-5, 0);
$('hs-right').onclick = () => housePan(5, 0);
$('hs-up').onclick = () => housePan(0, 3);
$('hs-down').onclick = () => housePan(0, -3);
$('b-hvisit').onclick = () => {
  ROSTER = [];
  startHouse({ ...normHouse(HOUSE), name: 'MY HOUSE' });
};
