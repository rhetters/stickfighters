// StickFighters: Fighter progress: XP and levels, skill points, what a fighter's tree unlocks and boosts (buildOf),
// and banking a run's XP. The tree's data is in data/skills.js; the screen is ui/skills.js.
// Every move some node unlocks; a fighter can use one only after spending a point in that node.
const SK_LOCKED = new Set(SKN.flatMap(n => n.un || []));
// XP needed to go from level lv to lv + 1
const xpNeed = lv => Math.round((XP_RULES.base * Math.pow(lv, XP_RULES.exp)) / 10) * 10;
// Total XP to reach each level (index = level)
const XP_AT = [0, 0];
for (let lv = 1; lv < XP_RULES.cap; lv++) XP_AT.push(XP_AT[lv] + xpNeed(lv));
const XP_MAX = XP_AT[XP_RULES.cap];
function levelOf(xp) {
  let lv = 1;
  while (lv < XP_RULES.cap && xp >= XP_AT[lv + 1]) lv++;
  return lv;
}
// Skill points earned by a level: one per level from 2, plus a bonus at every fifth level
const pointsAt = lv => lv - 1 + Math.floor(lv / XP_RULES.bonusEvery);
const spentOf = sk => Object.values(sk).reduce((n, r) => n + r, 0);
// Points spent in one branch, counting only rows below `row`
const branchBelow = (sk, b, row) =>
  SKN.filter(n => n.b === b && n.row < row).reduce((t, n) => t + (sk[n.id] || 0), 0);
const rowOpen = (sk, n) => branchBelow(sk, n.b, n.row) >= ROW_NEEDS[n.row];
// Every node with points still has its row open (checked after a point is taken back)
const treeValid = sk => SKN.every(n => !sk[n.id] || rowOpen(sk, n));
// Can one more point go into node id? Returns '' if yes, otherwise why not (shown on the screen).
function canAdd(pr, id) {
  const n = SKNODE[id],
    r = pr.sk[id] || 0;
  if (r >= n.max) return 'That one is full.';
  if (spentOf(pr.sk) >= pointsAt(levelOf(pr.xp))) return 'No points left. Level up to earn more.';
  if (!rowOpen(pr.sk, n))
    return 'Spend ' + ROW_NEEDS[n.row] + ' points lower in ' + branchName(n.b) + ' first.';
  return '';
}
function canTake(pr, id) {
  if (!pr.sk[id]) return 'No points in that one.';
  const sk = { ...pr.sk, [id]: pr.sk[id] - 1 };
  return treeValid(sk) ? '' : 'Take back points from higher rows first.';
}
const branchName = id => SKB.find(b => b.id === id).name;
// The node that unlocks a move, as 'Fists: Haymaker' (empty for moves every fighter has)
function skillOf(move) {
  const n = SKN.find(n => n.un && n.un.includes(move));
  return n ? branchName(n.b) + ': ' + n.name : '';
}
const branchPts = (sk, b) => branchBelow(sk, b, 4);
// The step (0-2) of the ultimate a level gives, or -1 before the first
const ultStep = lv => ULT_LEVELS.filter(l => lv >= l).length - 1;
// A fighter's progress with every field valid (also used for fighters from other devices, which are trusted for
// shape only). Points over what the level allows, or rows that aren't open, reset the tree.
function normProg(p) {
  const src = p && typeof p === 'object' ? p : {},
    xp =
      typeof src.xp === 'number' && isFinite(src.xp) ? Math.max(0, Math.min(XP_MAX, Math.floor(src.xp))) : 0,
    sk = {};
  const s0 = src.sk && typeof src.sk === 'object' ? src.sk : {};
  for (const id of Object.keys(s0)) {
    const n = SKNODE[id],
      r = Math.floor(+s0[id]);
    if (n && r > 0) sk[id] = Math.min(n.max, r);
  }
  const ok = spentOf(sk) <= pointsAt(levelOf(xp)) && treeValid(sk),
    tree = ok ? sk : {},
    ult = SKB.some(b => b.id === src.ult && b.ult && branchPts(tree, b.id) > 0) ? src.ult : null;
  return { xp, sk: tree, ult };
}
// What a fighter's progress means in a fight: level, boosts (mod), locked moves and the ultimate's move.
// even = Versus: moves and the ultimate count, boosts don't.
const NOMOD = {};
function buildOf(pr, even) {
  const lv = levelOf(pr.xp),
    mod = {};
  if (!even)
    for (const [id, r] of Object.entries(pr.sk)) {
      const m = SKNODE[id].mod || {};
      for (const k in m) mod[k] = (mod[k] || 0) + m[k] * r;
    }
  const open = new Set(Object.keys(pr.sk).flatMap(id => SKNODE[id].un || [])),
    locked = new Set([...SK_LOCKED].filter(n => !open.has(n))),
    st = ultStep(lv),
    br = pr.ult && SKB.find(b => b.id === pr.ult);
  return { lv, mod, locked, ult: br && st >= 0 ? A[br.ult[st]] : null, ultB: br ? br.id : null };
}
// The self-test plays the game as it was before the tree: everything open, no boosts, the Tornado Kick
const FULL_BUILD = { lv: XP_RULES.cap, mod: NOMOD, locked: new Set(), ult: A.tornado, ultB: 'legs' };
// Puts a fight's XP into the saved fighters of the players on this device and reports what changed.
// who = [{fi (saved fighter index), xp}]; returns [{name, xp, from, to, pts, stars}]
function bankXP(who) {
  const out = [];
  for (const w of who) {
    const c = CHR.list[w.fi];
    if (!c || !(w.xp > 0)) continue;
    const f = normFighter(c),
      b = buildOf(f.prog),
      gain = Math.round(w.xp * (1 + (b.mod.xp || 0))),
      from = b.lv;
    f.prog.xp = Math.min(XP_MAX, f.prog.xp + gain);
    const to = levelOf(f.prog.xp);
    CHR.list[w.fi] = f;
    out.push({
      name: f.name,
      xp: gain,
      from,
      to,
      pts: pointsAt(to) - pointsAt(from),
      stars: b.mod.stars || 0
    });
  }
  ecoSave(true);
  return out;
}
// Gives a fighter in a fight its build (from p.prog, set by init()). even = Versus.
function setBuild(p, even) {
  p.bd = SELFTESTING ? FULL_BUILD : buildOf(p.prog || normProg(null), even);
  p.smax = SURGE.max + (p.bd.mod.smax || 0);
  p.stm.v = p.smax;
}
const modOf = (p, k) => (p.bd && p.bd.mod[k]) || 0;
// XP this fight has earned (shared by every player), counted as enemies are beaten
function xpScan() {
  for (const e of E) {
    if (!e.dying || e.xpd || !e.tk) continue;
    e.xpd = 1;
    RUN.xp += XP_KILL[e.tk] || 0;
  }
}
// Banks the fight's XP (plus bonuses) for the players on this device. Returns a line for the results screen.
function runXP(extra) {
  if (SELFTESTING || state === 'train') return '';
  const x = extra || {};
  let xp = RUN.xp;
  if (x.level) xp += XP_BONUS.level;
  if (x.wave) xp += XP_BONUS.wave * Math.max(0, x.wave - 1);
  RUN.xp = 0;
  // Versus: everyone gets XP for each round played, the winners a bonus
  const who = PL.filter(p => p.fi != null).map(p => ({
    fi: p.fi,
    xp: xp + (x.vs ? XP_BONUS.vsKO * x.vs.rounds + (x.vs.win.includes(p) ? XP_BONUS.vsWin : 0) : 0)
  }));
  const res = bankXP(who);
  RUN.last = res;
  return res
    .map(
      r =>
        (res.length > 1 ? r.name + ' ' : '') +
        '+' +
        r.xp +
        ' XP' +
        (r.to > r.from ? ' · LEVEL ' + r.to + '! +' + r.pts + ' skill point' + (r.pts > 1 ? 's' : '') : '')
    )
    .join(' · ');
}
// A player's hit with their skill-tree damage boost: b = the button ('p' punch, 'k' kick, 't' a throw)
function boost(f, d, b) {
  const m = f.pl ? modOf(f, b === 'p' ? 'pd' : b === 'k' ? 'kd' : b === 't' ? 'thr' : '') : 0;
  return m ? { ...d, dmg: d.dmg * (1 + m), exact: 1 } : d;
}
// How fast a player's hit fills their ultimate meter (Fighting Spirit, Fist and Kick Master)
function meterK(p, d) {
  const b = p.att && p.att.b;
  return 1 + modOf(p, b === 'p' ? 'pm' : b === 'k' ? 'km' : '');
}
