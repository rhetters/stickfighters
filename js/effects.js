// Orange vs. the Pink Army: Effect spawners (sparks, rings, dust, text, ghosts)
// ===== EFFECTS =====
function fxp(o) {
  if (FX.length > 150) FX.shift();
  FX.push(o);
} // particle cap for phones
const spark = (x, y, r, c) => fxp({ k: 's', x, y, r, c, l: 10, m: 10, a: rnd() * 6 });
const ring = (x, y, r) => fxp({ k: 'r', x, y, r, l: 16, m: 16 });
const dust = (x, y, n) => {
  for (let i = 0; i < n; i++)
    fxp({
      k: 'd',
      x: x + (rnd() - 0.5) * 20,
      y: y - 2,
      vx: (rnd() - 0.5) * 3,
      vy: -rnd() * 1.5,
      r: 3 + rnd() * 4,
      l: 20,
      m: 20
    });
};
const txt = (x, y, t, c, sz = 16) => fxp({ k: 't', x, y, t, c, sz, l: 40, m: 40 });
const ghost = (f, c) =>
  GH.push({ x: f.x, y: f.y, face: f.face, pose: f.pose.slice(), s: f.s, col: c || f.col, l: 9, own: f });
