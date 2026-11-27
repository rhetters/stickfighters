// StickFighters: House screen: build walls and barriers (floors, side walls, stairs) square by square,
// place furniture and decorations, pick a background. Everything placed costs stars and erasing gives them all back.
// The house fills the whole frame; the buttons sit on top of it, and the tabs and pieces live on the floor below the
// building area. The land is much bigger than the view: the D-pad moves around it, - and + zoom, and it grows as you
// build. Works with touch (tap or drag to paint), mouse, keyboard and controllers (every square in view is a button).
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
  oy: 0,
  zi: 0, // zoom level: index into HS_ZOOM
  tool: 'erase' // TOOLS: rotate, flip or erase
};
const HS_FLOOR = 270; // where the floor line sits in the editor (lower than in play, to leave room for the pieces)
// Zoom levels for the editor: 1 = 20 x 6 squares, then 40 x 12 and 60 x 18 (every square in view is still a button)
const HS_ZOOM = [1, 1 / 2, 1 / 3];
const hsZ = () => HS_ZOOM[HS.zi],
  hsCols = () => Math.round(HGRID.viewCols / hsZ()),
  hsRows = () => Math.round(HS_FLOOR / HGRID.cell / hsZ());
const HS_TABS = [
  ['walls', 'WALLS'],
  ['solids', 'BARRIERS'],
  ['hfurn', 'FURNITURE'],
  ['hdecor', 'DECORATIONS'],
  ['hbg', 'BACKGROUND'],
  ['tools', 'TOOLS']
];
// TOOLS: turn a thing a quarter turn, mirror it so it faces the other way, or erase
const HS_TOOLS = [
  ['rotate', 'ROTATE', 'Tap a thing to turn it a quarter turn.'],
  ['flip', 'FLIP', 'Tap a thing to flip it so it faces the other way.'],
  ['erase', 'ERASE', 'Tap or drag to remove things, front first. You get all their stars back.']
];
const HS_HELP = {
  walls: 'Pick a material, then tap or drag. On stairs it fills just the steps.',
  solids:
    'Barriers hold you up or stop you. Hold Up or Down to climb stairs, ladders and spirals; Down + Jump drops through a floor.',
  hfurn: 'Pick one, then tap where its bottom-left corner goes.',
  hdecor: 'Pick one, then tap where its bottom-left corner goes.',
  hbg: 'Tap a background to use it.',
  tools: 'Pick a tool, then tap a thing in your house.'
};
const hsToolHelp = () => HS_TOOLS.find(t => t[0] === HS.tool)[2];
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
  openCust();
  $('b-house').focus({ preventScroll: true });
}
// How far the view can move: the land you've built on plus some room to grow
function houseLimits() {
  const e = houseExt(HOUSE);
  return {
    x: Math.max(0, Math.min(HGRID.maxCols, e.cols + HGRID.grow) - hsCols()),
    y: Math.max(0, Math.min(HGRID.maxRows, e.rows + hsRows()) - hsRows()) // a screen of sky above
  };
}
function housePan(dx, dy) {
  const L = houseLimits();
  HS.ox = Math.max(0, Math.min(L.x, HS.ox + dx));
  HS.oy = Math.max(0, Math.min(L.y, HS.oy + dy));
  houseDraw();
}
// The camera for the editor: square (ox, oy) at the bottom-left, with the floor line raised to HS_FLOOR
const hsCam = () => [HS.ox * HGRID.cell, -HS.oy * HGRID.cell + (G - HS_FLOOR) / hsZ(), hsZ()];
function houseDraw() {
  const s = HGRID.cell,
    [cx, cy, z] = hsCam();
  withCtx($('hs-cv').getContext('2d'), () => {
    drawHouse(HOUSE, cx, cy, z);
    ctx.save();
    camApply(cx, cy, z);
    // a faint line around every square in view, so you can see where taps land
    const c0 = HS.ox,
      r0 = HS.oy;
    ctx.strokeStyle = 'rgba(28,22,38,.12)';
    ctx.lineWidth = 1 / z;
    ctx.beginPath();
    for (let c = c0; c <= c0 + hsCols(); c++) {
      ctx.moveTo(c * s, G - r0 * s);
      ctx.lineTo(c * s, G - (hsRows() + r0) * s);
    }
    for (let r = r0; r <= r0 + hsRows(); r++) {
      ctx.moveTo(c0 * s, G - r * s);
      ctx.lineTo((c0 + hsCols()) * s, G - r * s);
    }
    ctx.stroke();
    // the current fighter stands at the left of the land
    if (HS.ox < 4 && HS.oy === 0) {
      const L = lookOf(curFighter()),
        S = (STANCES.find(t => t.id === L.stance) || STANCES[0]).p,
        f = { look: L, face: 1, s: 1, slot: 0, vx: 0 },
        o = {};
      drawFig(
        110,
        G,
        1,
        S,
        L.ht,
        L.col,
        L.d2,
        0,
        1,
        L.lw,
        o,
        L.head,
        lookLayers(f, { face: 1, s: L.ht }, 1),
        L.hfull
      );
      drawLook(f, { ...o, face: 1, s: L.ht }, 1, 'front');
    }
    ctx.restore();
  });
  $('hs-stars').textContent = ECO.stars;
  const L = houseLimits();
  $('hs-left').disabled = HS.ox <= 0;
  $('hs-right').disabled = HS.ox >= L.x;
  $('hs-down').disabled = HS.oy <= 0;
  $('hs-up').disabled = HS.oy >= L.y;
  $('hs-zout').disabled = HS.zi >= HS_ZOOM.length - 1;
  $('hs-zin').disabled = HS.zi <= 0;
}
// Zoom the editor out or in, keeping the view on the land
function houseZoom(d) {
  HS.zi = Math.max(0, Math.min(HS_ZOOM.length - 1, HS.zi + d));
  houseCells();
  housePan(0, 0);
}
// One button per square in view, laid over the canvas above the floor line
function houseCells() {
  const box = $('hs-cells'),
    V = hsRows();
  box.innerHTML = '';
  box.style.height = (HS_FLOOR / H) * 100 + '%';
  box.style.gridTemplateColumns = 'repeat(' + hsCols() + ', 1fr)';
  box.style.gridTemplateRows = 'repeat(' + V + ', 1fr)';
  for (let vr = 0; vr < V; vr++)
    for (let vc = 0; vc < hsCols(); vc++) {
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
  HS.paint = HS.tab === 'walls' || HS.tab === 'solids' || (HS.tab === 'tools' && HS.tool === 'erase');
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
// Paint one square of a layer (cells, fills, solids or sides): pay for the new piece, refund the one it replaces
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
  if (HS.tab === 'walls')
    // on stairs a material fills just the steps; anywhere else it fills the whole square behind
    done = isStair(HOUSE.solids[k])
      ? housePaint('fills', HTILE, k, HS.tile)
      : housePaint('cells', HTILE, k, HS.tile);
  else if (HS.tab === 'solids') {
    const t = HSOLID[HS.solid];
    done = housePaint(t.layer, HSOLID, k, t.id);
    // stairs replaced by a floor: their fill has nothing to fill any more
    if (done && HOUSE.fills[k] && !isStair(HOUSE.solids[k])) {
      refundStars(HTILE[HOUSE.fills[k]].price, 'house');
      HOUSE.fills = { ...HOUSE.fills };
      delete HOUSE.fills[k];
    }
  } else if (HS.tab === 'tools' && HS.tool !== 'erase') {
    const i = houseItemAt(c, r);
    if (i < 0) return houseMsg('Tap a piece of furniture or a decoration to ' + (HS.tool === 'flip' ? 'flip' : 'turn') + ' it.');
    const it = { ...HOUSE.items[i] },
      d = ITEM[it.id];
    if (HS.tool === 'flip') {
      if (it.f) delete it.f;
      else it.f = 1;
    } else {
      it.r = ((it.r || 0) + 1) % 4;
      if (!it.r) delete it.r;
      // it stays on the land
      const [w, h] = houseFoot(it, d);
      it.x = Math.min(it.x, HGRID.maxCols - w);
      it.y = Math.min(it.y, HGRID.maxRows - h);
    }
    HOUSE.items = HOUSE.items.map((q, k) => (k === i ? it : q));
    sfx(HS.tool === 'flip' ? 620 : 540, 0.06, 'triangle', 0.03, 150);
    done = true;
  } else if (HS.tab === 'tools') {
    // front to back: a thing, the stairs' fill, a side wall, a ladder or spiral stairs, a floor, stairs, the wall
    const i = houseItemAt(c, r),
      take = (layer, list) => {
        refundStars(list[HOUSE[layer][k]].price, 'house');
        HOUSE[layer] = { ...HOUSE[layer] };
        delete HOUSE[layer][k];
      };
    if (i >= 0) refundStars(ITEM[HOUSE.items.splice(i, 1)[0].id].price || 0, 'house');
    else if (HOUSE.fills[k]) take('fills', HTILE);
    else if (HOUSE.sides[k]) take('sides', HSOLID);
    else if (HOUSE.climbs[k]) take('climbs', HSOLID);
    else if (HOUSE.floors[k]) take('floors', HSOLID);
    else if (HOUSE.solids[k]) take('solids', HSOLID);
    else if (HOUSE.cells[k]) take('cells', HTILE);
    else return;
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
      [w, h] = houseFoot(it, ITEM[it.id]);
    if (c >= it.x && c < it.x + w && r >= it.y && r < it.y + h) return i;
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
      houseMsg(id === 'tools' ? hsToolHelp() : HS_HELP[id]);
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
const HS_ROOMS = [
  ['all', 'ALL'],
  ['living', 'LIVING'],
  ['bedroom', 'BEDROOM'],
  ['kitchen', 'KITCHEN'],
  ['dining', 'DINING'],
  ['bathroom', 'BATHROOM'],
  ['attic', 'ATTIC']
];
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
  if (HS.tab === 'tools')
    for (const [id, name, help] of HS_TOOLS)
      card(
        HS.tool === id,
        true,
        name,
        '',
        () => houseToolPic(id),
        () => {
          HS.tool = id;
          houseMsg(help);
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
  // Furniture by room: a little column of room buttons first (ALL shows everything)
  if (HS.tab === 'hfurn') {
    const r = document.createElement('div');
    r.className = 'hsrooms';
    for (const [id, name] of HS_ROOMS) {
      const b = document.createElement('button');
      b.textContent = name;
      b.className = (HS.room || 'all') === id ? 'on' : '';
      b.onclick = () => {
        HS.room = id;
        housePal();
      };
      r.appendChild(b);
    }
    box.appendChild(r);
  }
  if (HS.tab === 'hfurn' || HS.tab === 'hdecor')
    // a secret (a chest code) shows only once you have it
    for (const it of ITEMS.filter(
      i =>
        i.sec === HS.tab &&
        !(i.how && i.how.code && !owns(i.id)) &&
        (HS.tab !== 'hfurn' || !HS.room || HS.room === 'all' || i.room === HS.room)
    )) {
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
// The TOOLS pictures (in the card's 64 x 52 box): a chair with a turning arrow, a chair and its mirror image, an eraser
function houseToolPic(id) {
  const chair = ITEM['hf-chair'];
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.lineCap = ctx.lineJoin = 'round';
  if (id === 'rotate') {
    ctx.save();
    ctx.translate(32, 28);
    ctx.rotate(Math.PI / 2);
    houseThing(chair, -13, -13, 26, 26);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(32, 28, 21, -Math.PI * 0.9, -Math.PI * 0.2);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.moveTo(52, 14);
    ctx.lineTo(54, 25);
    ctx.lineTo(44, 21);
    ctx.fill();
  } else if (id === 'flip') {
    houseThing(chair, 6, 16, 22, 28);
    ctx.save();
    ctx.translate(58, 0);
    ctx.scale(-1, 1);
    houseThing(chair, 0, 16, 22, 28);
    ctx.restore();
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(32, 6);
    ctx.lineTo(32, 48);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    ctx.save();
    ctx.translate(32, 28);
    ctx.rotate(-0.5);
    houseBox(-18, -9, 22, 18, '#ff8fb0');
    houseBox(4, -9, 14, 18, '#3ec5ff');
    ctx.restore();
    ctx.strokeStyle = 'rgba(28,22,38,.5)';
    ctx.beginPath();
    ctx.moveTo(8, 46);
    ctx.lineTo(40, 46);
    ctx.stroke();
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
// the D-pad moves a quarter of the view across, or half of it up and down, each tap
$('hs-left').onclick = () => housePan(-Math.ceil(hsCols() / 4), 0);
$('hs-right').onclick = () => housePan(Math.ceil(hsCols() / 4), 0);
$('hs-up').onclick = () => housePan(0, Math.ceil(hsRows() / 2));
$('hs-down').onclick = () => housePan(0, -Math.ceil(hsRows() / 2));
$('hs-zout').onclick = () => houseZoom(1);
$('hs-zin').onclick = () => houseZoom(-1);
$('b-hvisit').onclick = () => {
  ROSTER = [];
  startHouse({ ...normHouse(HOUSE), name: 'MY HOUSE' });
};
