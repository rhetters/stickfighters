// Orange vs. the Pink Army: Game modes. The combat engine knows nothing about waves, levels or score rules;
// a mode sets up the world and runs the rules on top of it (VISION.md rule R1).
// ===== MODES (M8) =====
// A mode is { id, update() once per simulation step while someone is alive, hud?(), fg?() foreground drawing }.
// Arcade: endless waves on one screen (the original game).
const ARCADE = {
  id: 'arcade',
  update() {
    if (queue.length && --spawnT <= 0 && E.filter(e => !e.dying).length < Math.min(8, 4 + (wave >> 1))) {
      spawn(queue.shift());
      spawnT = 45;
    }
    if (!queue.length && !E.some(e => !e.dying)) {
      if (!cl) {
        cl = 110;
        bn('WAVE CLEAR!');
        for (const p of PL) if (p.st !== 'dead') p.hp = Math.min(p.max, p.hp + 30);
        score += wave * 50;
        sfx(600, 0.3, 'square', 0.05, 400);
      } else if (--cl <= 0) nextWave();
    }
  }
};
let MODE = ARCADE;
