// Orange vs. the Pink Army: Versus mode (M9). 2-4 players in a fixed arena, free-for-all, best of 3 rounds.
// Each round: countdown, 60 seconds, last one standing wins (or the most health when time runs out).
// ===== VERSUS (M9) =====
let VS = null;
function startVersus() {
  closePanels();
  newSeed();
  VS = { round: 1, wins: {}, phase: 'count', t: 0, time: 3600 };
  vsRound();
  paused = false;
  releaseAll();
  show(null);
}
function vsRound() {
  init();
  MODE = VERSUS;
  state = 'play';
  LV = buildLevel('arena');
  CAM.x = WB.l = WW.l = 0;
  WB.r = WW.r = W;
  const n = PL.length;
  PL.forEach((p, i) => {
    p.x = n === 1 ? W / 2 : 150 + (i * (W - 300)) / (n - 1);
    p.face = p.x < W / 2 ? 1 : -1;
  });
  Object.assign(VS, { phase: 'count', t: 0, time: 3600 });
}
function vsKO(w) {
  VS.phase = 'ko';
  VS.t = 0;
  slow = Math.max(slow, 60);
  VS.maxc = Math.max(VS.maxc || 0, maxc);
  if (w) VS.wins[w.slot] = (VS.wins[w.slot] || 0) + 1;
  bn(w ? w.name + ' WINS ROUND ' + VS.round + '!' : 'DRAW!');
  sfx(260, 0.5, 'sawtooth', 0.07, -120);
}
function vsNext() {
  const champ = PL.find(p => (VS.wins[p.slot] || 0) >= 2);
  if (champ) return vsEnd(champ);
  VS.round++;
  vsRound();
}
function vsEnd(w) {
  VS.phase = 'end';
  state = 'clear';
  $('c-h1').textContent = w.name + ' WINS!';
  $('c-l1').textContent = PL.map(p => 'P' + (p.slot + 1) + ' ' + p.name + ': ' + (VS.wins[p.slot] || 0)).join(
    ' · '
  );
  $('c-l2').textContent = 'Best combo ' + VS.maxc + ' hits';
  $('c-l3').textContent = '';
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
    const alive = PL.filter(p => p.st !== 'dead');
    if (--VS.time <= 0) {
      const best = Math.max(...alive.map(p => p.hp / p.max)),
        top = alive.filter(p => p.hp / p.max === best);
      bn('TIME!');
      return vsKO(top.length === 1 ? top[0] : null);
    }
    if (alive.length <= 1) vsKO(alive[0] || null);
  },
  // everyone went down at the same moment: a draw
  over() {
    if (VS.phase === 'fight') vsKO(null);
  },
  bg: () => drawWoods(),
  fg: () => drawWoodsFg(),
  hud: vsHud,
  wins: q => (VS ? VS.wins[q.slot] || 0 : 0)
};
