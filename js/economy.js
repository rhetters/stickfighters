// StickFighters: Ninja stars, owned cosmetics and saved fighters
// ===== ECONOMY (VISION.md rule R7) =====
// Stars change only through grantStars / spendStars, and ownership only through grantItem / buyItem, so this file
// can one day ask a server instead of trusting the device. Nothing here changes how anyone fights (rule R8).
const RUN = { stars: 0, items: [], xp: 0, last: [] }; // what this run earned, for the results screen
let ecoTimer = 0;
// Saving after every star would write the save many times a second, so wait a moment and save once.
function ecoSave(now) {
  clearTimeout(ecoTimer);
  if (now) save();
  else ecoTimer = setTimeout(save, 1500);
}
function grantStars(n, reason) {
  n = Math.floor(n);
  if (SELFTESTING || !(n > 0)) return 0;
  ECO.stars += n;
  ECO.got += n;
  RUN.stars += n;
  STARHUD.bump = 12;
  ecoSave();
  return n;
}
function spendStars(n, itemId) {
  n = Math.floor(n);
  if (!(n > 0) || ECO.stars < n) return false;
  ECO.stars -= n;
  ecoSave(true);
  return true;
}
const owns = id => !!ITEM[id] && (!!(ITEM[id].how && ITEM[id].how.free) || ECO.own.includes(id));
function grantItem(id, reason) {
  if (SELFTESTING || !ITEM[id] || owns(id)) return false;
  ECO.own.push(id);
  RUN.items.push(id);
  ecoSave(true);
  return true;
}
// The store: only items with a price can be bought.
function buyItem(id) {
  const it = ITEM[id];
  if (!it || !it.price || it.how || owns(id)) return false;
  if (!spendStars(it.price, id)) return false;
  return grantItem(id, 'store');
}
// How to get an item, in words, for the store.
function howText(it) {
  const h = it.how || {};
  if (h.free) return 'Free';
  if (h.lvl) return 'Clear ' + ((LEVELS[h.lvl] && LEVELS[h.lvl].name) || 'the level') + ' to unlock';
  if (h.combo) return 'Land a ' + h.combo + '-hit combo to unlock';
  if (h.wave) return 'Reach wave ' + h.wave + ' in Arcade to unlock';
  if (h.vs) return 'Win a Versus match to unlock';
  if (h.drop) return 'Found in gifts that Captains drop';
  return it.price + ' stars';
}
// Fixed unlocks. Runs at boot (so older saves get what they already earned) and at the end of every run.
// `extra` = this run's numbers ({ combo, vs }). Returns the ids unlocked just now.
function checkUnlocks(extra) {
  const x = extra || {},
    got = [];
  for (const it of ITEMS) {
    const h = it.how;
    if (!h || h.free || h.drop || owns(it.id)) continue;
    const ok =
      (h.lvl && PROG[h.lvl] && PROG[h.lvl].done) ||
      (h.combo && Math.max(BEST.combo || 0, x.combo || 0) >= h.combo) ||
      (h.wave && Math.max(BEST.wave || 0, x.wave || 0) >= h.wave) ||
      (h.vs && x.vs);
    if (ok && grantItem(it.id, 'unlock')) got.push(it.id);
  }
  return got;
}
const giftPool = () => ITEMS.filter(i => i.how && i.how.drop && !owns(i.id));
// A gift from a Captain: the item chosen when it dropped (pickups.js), or 40 stars if there was none left to give
// or you got it some other way meanwhile.
function openGift(id) {
  if (!id || owns(id)) {
    grantStars(40, 'gift');
    return null;
  }
  grantItem(id, 'gift');
  return ITEM[id];
}
// ===== SAVED FIGHTERS =====
// Darker shade of a colour, for the far arm and leg.
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16),
    f = v => Math.max(0, Math.min(255, Math.round(v * (1 + k))));
  return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join('');
}
// A fighter with every field present and valid: unknown or unowned items are taken off, odd numbers clamped.
// Older fighters: eq.trail became eq.surge, and eq.pose (one victory pose) became the pose wheel.
// any = accept items without checking ownership (fighters from other devices in online play)
function normFighter(c, any) {
  const d = FIGHTER0,
    f = c && typeof c === 'object' ? c : {},
    fe = (f.eq && typeof f.eq === 'object' && f.eq) || {},
    ok = (id, slot) => !!id && !!ITEM[id] && ITEM[id].slot === slot && (any || owns(id)),
    eq = {};
  for (const s of EQ) {
    const id = s === 'surge' && !('surge' in fe) ? fe.trail : fe[s];
    eq[s] = ok(id, s) ? id : null;
  }
  const w0 = Array.isArray(f.wheel) ? f.wheel : fe.pose ? [fe.pose, ...d.wheel] : d.wheel,
    wheel = [...new Set(w0)].filter(id => ok(id, 'pose')).slice(0, WHEEL_MAX);
  const num = (v, lo, hi, def) =>
    typeof v === 'number' && isFinite(v) ? Math.max(lo, Math.min(hi, v)) : def;
  return {
    name:
      String(f.name || d.name)
        .toUpperCase()
        .replace(/[^A-Z0-9 !?.-]/g, '')
        .slice(0, 10)
        .trim() || d.name,
    col: ok(f.col, 'color') ? f.col : d.col,
    ht: Math.round(num(f.ht, 0.85, 1.15, 1) * 20) / 20,
    head: Math.round(num(f.head, 0.8, 1.4, 1) * 10) / 10,
    headType: HEAD_TYPES.some(t => t[0] === f.headType) ? f.headType : d.headType,
    lw: Math.round(num(f.lw, 5, 10, 7)),
    stance: STANCES.some(s => s.id === f.stance) ? f.stance : d.stance,
    eq,
    wheel: wheel.length ? wheel : ['pose-flex'],
    prog: normProg(f.prog)
  };
}
// A house with every field valid: unknown squares, materials, solids and items dropped, everything kept on the land.
// any = accept unlock-only items without checking ownership (a host's house shown to visitors online).
// A house marked flip7 (saved before version 7) has its rows turned over: they used to count 7 rows down from the top.
function normHouse(h, any) {
  const src = h && typeof h === 'object' ? h : {},
    flip = !!src.flip7,
    out = { bg: 'hbg-paper', cells: {}, solids: {}, floors: {}, fills: {}, climbs: {}, sides: {}, items: [] },
    inLand = (c, r) => c >= 0 && r >= 0 && c < HGRID.maxCols && r < HGRID.maxRows,
    squares = (o, ok, dst) => {
      const o0 = o && typeof o === 'object' ? o : {};
      for (const k of Object.keys(o0).slice(0, HOUSE_MAX_SQUARES)) {
        const m = /^(\d+),(\d+)$/.exec(k);
        if (!m || !ok[o0[k]]) continue;
        const c = +m[1],
          r = flip ? 6 - +m[2] : +m[2];
        if (inLand(c, r)) dst[c + ',' + r] = o0[k];
      }
    };
  if (ITEM[src.bg] && ITEM[src.bg].sec === 'hbg' && (any || owns(src.bg))) out.bg = src.bg;
  squares(src.cells, HTILE, out.cells);
  const solidOk = Object.fromEntries(HSOLIDS.filter(t => t.layer === 'solids').map(t => [t.id, t])),
    sideOk = { side: HSOLID.side },
    climbOk = { spiral: HSOLID.spiral, ladder: HSOLID.ladder };
  squares(src.solids, solidOk, out.solids);
  squares(src.sides, sideOk, out.sides);
  squares(src.climbs, climbOk, out.climbs);
  squares(src.floors, { floor: HSOLID.floor }, out.floors);
  squares(src.solids, { floor: HSOLID.floor }, out.floors); // floors kept with the stairs before version 10
  squares(src.fills, HTILE, out.fills);
  // a fill only makes sense inside stairs
  for (const k in out.fills) if (!isStair(out.solids[k])) delete out.fills[k];
  for (const it of Array.isArray(src.items) ? src.items.slice(0, HOUSE_MAX_ITEMS) : []) {
    const d = it && ITEM[it.id];
    if (!d || (d.sec !== 'hfurn' && d.sec !== 'hdecor') || !(any || d.price || owns(d.id))) continue;
    const y0 = Math.floor(+it.y || 0),
      x = Math.max(0, Math.min(HGRID.maxCols - d.w, Math.floor(+it.x || 0))),
      y = Math.max(0, Math.min(HGRID.maxRows - d.h, flip ? 7 - (y0 + d.h) : y0));
    out.items.push({ id: d.id, x, y });
  }
  return out;
}
// Stars given back for something taken back (erasing in the house). Not counted as stars earned.
function refundStars(n, reason) {
  n = Math.floor(n);
  if (!(n > 0)) return 0;
  ECO.stars += n;
  ecoSave();
  return n;
}
const fighter = i => (CHR.list[i] ? normFighter(CHR.list[i]) : null);
const curFighter = () => fighter(CHR.cur) || normFighter(FIGHTER0);
// What the renderer needs to draw a fighter: colours, sizes, the item object for each slot, and the pose wheel.
// lookRaw skips the ownership check (the store's try-on preview); everything in the game uses lookOf.
function lookRaw(f) {
  const col = ITEM[f.col].c,
    L = {
      col,
      d2: shade(col, -0.22),
      ht: f.ht,
      head: f.head,
      hfull: f.headType === 'full',
      lw: f.lw,
      stance: f.stance,
      name: f.name
    };
  for (const s of EQ) L[s] = f.eq[s] ? ITEM[f.eq[s]] : null;
  L.wheel = f.wheel.map(id => ITEM[id]).filter(Boolean);
  L.pose = L.wheel[0] || ITEM['pose-flex'];
  return L;
}
const lookOf = c => lookRaw(normFighter(c));
function saveFighter(i, c) {
  CHR.list[i] = normFighter(c);
  ecoSave(true);
}
// Delete a saved fighter. If it was the current one, the first fighter left becomes current.
function deleteFighter(i) {
  CHR.list[i] = null;
  if (CHR.cur === i) {
    const n = CHR.list.findIndex(Boolean);
    CHR.cur = n < 0 ? 0 : n;
  }
  ecoSave(true);
}
// End of a run: bank anything still on the ground, check unlocks, and write the stars line for the results screen.
function runEnd(el, extra) {
  collectAll();
  const xpLine = runXP(extra),
    lucky = RUN.last.reduce((m, r) => Math.max(m, r.stars), 0); // Fortune: the luckiest player's bonus
  if (lucky && RUN.stars) grantStars(Math.round(RUN.stars * lucky), 'fortune');
  const got = checkUnlocks(extra);
  ecoSave(true);
  const items = [...new Set(RUN.items)].map(id => ITEM[id].name);
  $(el).textContent =
    (RUN.stars
      ? '+' + RUN.stars + ' ninja stars (you have ' + ECO.stars + ')'
      : 'Ninja stars: ' + ECO.stars) +
    (items.length ? ' · NEW: ' + items.join(', ') + '!' : '') +
    (xpLine ? ' · ' + xpLine : '');
  return got;
}
// The star counter in the HUD jumps a little when stars come in
const STARHUD = { bump: 0 };
