// Orange vs. the Pink Army: Game modes. The combat engine knows nothing about waves, levels or score rules;
// a mode sets up the world and runs the rules on top of it (VISION.md rule R1).
// ===== MODES =====
// A mode is { id, update() once per simulation step while someone is alive, hud?(), fg?() foreground drawing }.
// Arcade: endless waves on one screen (the original game).
const ARCADE = {
  id: 'arcade',
  update() {
    reviveTick();
    if (
      queue.length &&
      --spawnT <= 0 &&
      E.filter(e => !e.dying).length < Math.min(8, 4 + (wave >> 1)) + (PL.length - 1) * 2
    ) {
      spawn(queue.shift());
      spawnT = 45;
    }
    if (!queue.length && !E.some(e => !e.dying)) {
      if (!cl) {
        cl = 110;
        bn('WAVE CLEAR!');
        for (const p of PL) if (p.st !== 'dead') p.hp = Math.min(p.max, p.hp + 30);
        score += wave * 50;
        grantStars(wave * STAR_BONUS.wavePer, 'wave');
        sfx(600, 0.3, 'square', 0.05, 400);
      } else if (--cl <= 0) nextWave();
    }
  }
};
ARCADE.revive = 1;
ARCADE.drops = 1; // enemies drop ninja stars
let MODE = ARCADE;
// ===== CO-OP RULES =====
// Enemies get 35% more health per extra player, and each fight gets about 30% more grunts per extra player.
const coopScale = () => (MODE.pvp || PL.length < 2 ? 1 : 1 + 0.35 * (PL.length - 1));
function coopExtra(q) {
  if (MODE.pvp || PL.length < 2) return;
  const n = Math.round(q.length * 0.3 * (PL.length - 1));
  for (let i = 0; i < n; i++) q.splice(Math.floor(rnd() * (q.length + 1)), 0, rnd() < 0.7 ? 'g' : 'r');
}
// A downed player gets back up (40% health) after a teammate stands next to them for 2 seconds.
function reviveTick() {
  if (PL.length < 2) return;
  for (const q of PL) {
    if (q.st !== 'dead' || q.left || (q.deadT || 0) < 40) continue;
    const near = PL.some(p => p !== q && p.st !== 'dead' && Math.abs(p.x - q.x) < 70 && p.y >= p.gy - 4);
    q.rv = near ? (q.rv || 0) + 1 : Math.max(0, (q.rv || 0) - 2);
    if (q.rv >= 120) {
      Object.assign(q, {
        st: 'getup',
        dt: 20,
        hp: Math.round(q.max * 0.4),
        deadT: 0,
        rv: 0,
        inv: 120,
        vx: 0,
        vy: 0,
        sp: 0
      });
      q.pose[9] = 0;
      txt(q.x, q.y - 110, 'REVIVED!', q.col, 22);
      ring(q.x, q.y - 40, 60);
      sfx(600, 0.3, 'triangle', 0.06, 500);
    }
  }
}
