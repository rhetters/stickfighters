// StickFighters: Versus mode. 2-4 players in a fixed arena, free-for-all, best of 3 rounds.
// Each round: countdown, 60 seconds, last one standing wins (or the most health when time runs out).
// ===== VERSUS =====
let VS = null;
function startVersus() {
  closePanels();
  newSeed();
  VS = { round: 1, wins: {}, phase: 'count', t: 0, time: 3600, teams: ROSTER.some(r => r.team != null) };
  vsRound();
  paused = false;
  releaseAll();
  show(null);
}
function vsRound() {
  init();
  MODE = VERSUS;
  for (const p of PL) setBuild(p, true); // Versus: moves and ultimates count, boosts don't
  state = 'play';
  LV = buildLevel('arena');
  CAM.x = WB.l = WW.l = 0;
  WB.r = WW.r = W;
  // free-for-all: spread across the arena; teams: team 1 starts on the left, team 2 on the right
  const order = VS.teams ? [...PL].sort((a, b) => a.team - b.team || a.slot - b.slot) : PL,
    n = order.length;
  order.forEach((p, i) => {
    p.x = n === 1 ? W / 2 : 150 + (i * (W - 300)) / (n - 1);
    p.face = p.x < W / 2 ? 1 : -1;
  });
  Object.assign(VS, { phase: 'count', t: 0, time: 3600 });
}
// Who scores: a player in free-for-all, a team in 2v2
const vsKey = p => (VS.teams ? 'T' + p.team : 'P' + p.slot);
const vsName = p => (VS.teams ? 'TEAM ' + (p.team + 1) : p.name);
function vsKO(w) {
  VS.phase = 'ko';
  VS.t = 0;
  slow = Math.max(slow, 60);
  VS.maxc = Math.max(VS.maxc || 0, maxc);
  if (w) VS.wins[vsKey(w)] = (VS.wins[vsKey(w)] || 0) + 1;
  VS.lastW = w ? vsKey(w) : null; // the winner does their victory pose (looks.js)
  bn(w ? vsName(w) + ' WINS ROUND ' + VS.round + '!' : 'DRAW!');
  sfx(260, 0.5, 'sawtooth', 0.07, -120);
}
function vsNext() {
  const champ = PL.find(p => (VS.wins[vsKey(p)] || 0) >= 2);
  if (champ) return vsEnd(champ);
  VS.round++;
  vsRound();
}
function vsEnd(w) {
  VS.phase = 'end';
  state = 'clear';
  $('c-h1').textContent = vsName(w) + ' WINS!';
  $('c-l1').textContent = VS.teams
    ? [0, 1]
        .map(
          t =>
            'TEAM ' +
            (t + 1) +
            ' (' +
            PL.filter(p => p.team === t)
              .map(p => p.name)
              .join(' + ') +
            '): ' +
            (VS.wins['T' + t] || 0)
        )
        .join(' · ')
    : PL.map(p => 'P' + (p.slot + 1) + ' ' + p.name + ': ' + (VS.wins['P' + p.slot] || 0)).join(' · ');
  $('c-l2').textContent = 'Best combo ' + VS.maxc + ' hits';
  $('c-l3').textContent = '';
  runEnd('c-st', { vs: { rounds: VS.round, win: PL.filter(p => vsKey(p) === vsKey(w)) } });
  $('b-next').textContent = 'REMATCH';
  sfx(520, 0.5, 'square', 0.05, 500);
  show('s-clear');
}
function vsHud() {
  const s = Math.max(0, Math.ceil(VS.time / 60));
  ctx.fillText('ROUND ' + VS.round, W / 2, 26);
  ctx.font = '900 30px Impact,"Arial Black",sans-serif';
  ctx.fillStyle = s <= 10 && VS.phase === 'fight' && (fr >> 3) % 2 ? '#e8212b' : INK;
  ctx.fillText(String(s), W / 2 + 120, 30);
}
// Players push each other apart (unless phasing with Surge), so nobody stands inside an opponent.
function vsSep() {
  for (let i = 0; i < PL.length; i++)
    for (let j = i + 1; j < PL.length; j++) {
      const a = PL[i],
        b = PL[j];
      if (a.st === 'dead' || b.st === 'dead' || a.phase > 0 || b.phase > 0 || Math.abs(a.y - b.y) > 40)
        continue;
      const dx = b.x - a.x,
        o = 24 - Math.abs(dx);
      if (o > 0) {
        const s = dx >= 0 ? 1 : -1;
        a.x = Math.max(WB.l + 24, a.x - s * o * 0.5);
        b.x = Math.min(WB.r - 24, b.x + s * o * 0.5);
      }
    }
}
const VERSUS = {
  id: 'versus',
  pvp: 1,
  // runs before the simulation each step; true = everyone holds still (the countdown)
  pre() {
    if (VS.phase === 'count') {
      VS.t++;
      if (VS.t === 1) bn('ROUND ' + VS.round);
      if (VS.t === 75) bn('FIGHT!');
      if (VS.t >= 80) VS.phase = 'fight';
      return true;
    }
    if (VS.phase === 'ko' && ++VS.t > 150) vsNext();
    return VS.phase === 'end';
  },
  update() {
    vsSep();
    if (VS.phase !== 'fight') return;
    const alive = PL.filter(p => p.st !== 'dead'),
      sides = [...new Set(alive.map(vsKey))];
    if (--VS.time <= 0) {
      // time up: the side with the most health left (summed over a team) wins
      const hpOf = k => alive.filter(p => vsKey(p) === k).reduce((n, p) => n + p.hp / p.max, 0),
        best = Math.max(...sides.map(hpOf)),
        top = sides.filter(k => hpOf(k) === best);
      bn('TIME!');
      return vsKO(top.length === 1 ? alive.find(p => vsKey(p) === top[0]) : null);
    }
    if (sides.length <= 1) vsKO(alive[0] || null);
  },
  // everyone went down at the same moment: a draw
  over() {
    if (VS.phase === 'fight') vsKO(null);
  },
  bg: () => drawWoods(),
  fg: () => drawWoodsFg(),
  hud: vsHud,
  // after a KO nobody can move: the winner strikes their victory pose (patch 2, Rhett's request)
  locked: () => !!VS && (VS.phase === 'ko' || VS.phase === 'end'),
  wins: q => (VS ? VS.wins[vsKey(q)] || 0 : 0),
  team: q => (VS && VS.teams ? q.team + 1 : 0)
};
