// Orange vs. the Pink Army: Ninja stars, owned cosmetics and saved fighters (M10)
// ===== ECONOMY (VISION.md rule R7) =====
// Stars change only through grantStars / spendStars, and ownership only through grantItem / buyItem, so this file
// can one day ask a server instead of trusting the device. Nothing here changes how anyone fights (rule R8).
const RUN = { stars: 0, items: [] }; // what this run earned, for the results screen
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
// A gift from a Captain: one random item from the gift pool you don't own yet, or stars if you have them all.
// r is a number 0..1 from the drop's own seeded roll.
function openGift(r) {
  const pool = ITEMS.filter(i => i.how && i.how.drop && !owns(i.id));
  if (!pool.length) {
    grantStars(40, 'gift');
    return null;
  }
  const it = pool[Math.floor(r * pool.length) % pool.length];
  grantItem(it.id, 'gift');
  return it;
}
// ===== SAVED FIGHTERS =====
// Darker shade of a colour, for the far arm and leg.
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16),
    f = v => Math.max(0, Math.min(255, Math.round(v * (1 + k))));
  return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join('');
}
// A fighter with every field present and valid: unknown or unowned items are taken off, odd numbers clamped.
function normFighter(c) {
  const d = FIGHTER0,
    f = c && typeof c === 'object' ? c : {},
    eq = {};
  for (const s of SLOTS)
    if (s.id !== 'color') {
      const id = f.eq && f.eq[s.id];
      eq[s.id] = id && ITEM[id] && ITEM[id].slot === s.id && owns(id) ? id : d.eq[s.id];
    }
  const num = (v, lo, hi, def) =>
    typeof v === 'number' && isFinite(v) ? Math.max(lo, Math.min(hi, v)) : def;
  return {
    name:
      String(f.name || d.name)
        .toUpperCase()
        .replace(/[^A-Z0-9 !?.-]/g, '')
        .slice(0, 10)
        .trim() || d.name,
    col: ITEM[f.col] && ITEM[f.col].slot === 'color' && owns(f.col) ? f.col : d.col,
    head: Math.round(num(f.head, 0.8, 1.4, 1) * 10) / 10,
    lw: Math.round(num(f.lw, 5, 10, 7)),
    stance: STANCES.some(s => s.id === f.stance) ? f.stance : d.stance,
    eq
  };
}
const fighter = i => (CHR.list[i] ? normFighter(CHR.list[i]) : null);
const curFighter = () => fighter(CHR.cur) || normFighter(FIGHTER0);
// What the renderer needs to draw a fighter: colours and the item objects for each slot.
function lookOf(c) {
  const f = normFighter(c),
    col = ITEM[f.col].c,
    L = { col, d2: shade(col, -0.22), head: f.head, lw: f.lw, stance: f.stance, name: f.name };
  for (const s in f.eq) L[s] = f.eq[s] ? ITEM[f.eq[s]] : null;
  return L;
}
function saveFighter(i, c) {
  CHR.list[i] = normFighter(c);
  ecoSave(true);
}
// End of a run: bank anything still on the ground, check unlocks, and write the stars line for the results screen.
function runEnd(el, extra) {
  collectAll();
  const got = checkUnlocks(extra);
  ecoSave(true);
  const items = [...new Set(RUN.items)].map(id => ITEM[id].name);
  $(el).textContent =
    (RUN.stars
      ? '+' + RUN.stars + ' ninja stars (you have ' + ECO.stars + ')'
      : 'Ninja stars: ' + ECO.stars) + (items.length ? ' · NEW: ' + items.join(', ') + '!' : '');
  return got;
}
// The star counter in the HUD jumps a little when stars come in
const STARHUD = { bump: 0 };
