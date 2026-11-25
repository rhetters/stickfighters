// StickFighters: Effect spawners (sparks, rings, dust, text, ghosts)
// ===== EFFECTS =====
function fxp(o) {
  if (SIM.mute) return;
  if (FX.length > 150) FX.shift();
  FX.push(o);
} // particle cap for phones
const spark = (x, y, r, c) => fxp({ k: 's', x, y, r, c, l: 10, m: 10, a: fxr() * 6 });
const ring = (x, y, r) => fxp({ k: 'r', x, y, r, l: 16, m: 16 });
const dust = (x, y, n) => {
  for (let i = 0; i < n; i++)
    fxp({
      k: 'd',
      x: x + (fxr() - 0.5) * 20,
      y: y - 2,
      vx: (fxr() - 0.5) * 3,
      vy: -fxr() * 1.5,
      r: 3 + fxr() * 4,
      l: 20,
      m: 20
    });
};
const txt = (x, y, t, c, sz = 16) => fxp({ k: 't', x, y, t, c, sz, l: 40, m: 40 });
const ghost = (f, c) =>
  SIM.mute ||
  GH.push({ x: f.x, y: f.y, face: f.face, pose: f.pose.slice(), s: f.s, col: c || f.col, l: 9, own: f });
// The burst when an ultimate starts: rings in its branch's colour, bigger and more of them at each step (the third,
// at level 30, is the grandest)
function ultBurst(f, u) {
  const br = SKB.find(b => b.ult && b.ult.includes(u.n)),
    c = br ? br.c : '#3ec5ff',
    step = br ? br.ult.indexOf(u.n) : 0,
    y = f.y - 45;
  for (let i = 0; i <= step + 1; i++)
    fxp({ k: 'r', x: f.x, y, r: 110 + i * 70, c: i % 2 ? INK : c, w: 7 - i, l: 22 + i * 6, m: 22 + i * 6 });
  fxp({ k: 'b', x: f.x, y, l: 14 + step * 4, m: 14 + step * 4, a: 0 });
  if (step === 2) {
    fxp({ k: 'r', x: f.x, y: f.gy, r: 320, c, w: 4, l: 40, m: 40 });
    shake = Math.max(shake, 8);
    zoom = Math.max(zoom, 0.08);
  }
}
// An ultimate's running effect: fist sparks, lightning bolts, or ground cracks (turn = a dash just turned around)
function ultFx(f, d, turn) {
  const a = f.att;
  if (d.fxk === 'bolt') {
    if (turn || a.f % 5 === 0) fxp({ k: 'z', x: f.x, y: f.gy, h: 120 + (a.f % 3) * 30, a: a.f, l: 8, m: 8 });
  } else if (d.fxk === 'fist') {
    if (a.f >= d.h[0] && a.f <= d.h[1] && a.f % (d.multi || 6) === 1)
      spark(f.x + f.face * (d.r - 10), f.y - 52 - (a.f % 2) * 10, 12, '#ffd28a');
  } else if (d.fxk === 'quake') {
    if (f.y >= f.gy - 1 && a.f % 6 === 0) dust(f.x, f.gy, 2);
  }
}
