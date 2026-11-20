// StickFighters: Effect spawners (sparks, rings, dust, text, ghosts)
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
// The burst when an ultimate starts: rings in its branch's colour and a short slow-motion moment
function ultBurst(f, u) {
  const br = SKB.find(b => b.ult && b.ult.includes(u.n)),
    c = br ? br.c : '#3ec5ff';
  fxp({ k: 'r', x: f.x, y: f.y - 45, r: 130, c, w: 7, l: 24, m: 24 });
  fxp({ k: 'r', x: f.x, y: f.y - 45, r: 80, l: 18, m: 18 });
  fxp({ k: 'b', x: f.x, y: f.y - 45, l: 14, m: 14, a: 0 });
  slow = Math.max(slow, 16);
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
