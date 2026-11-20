// StickFighters: Ninja star pickups and Captain gifts
// ===== PICKUPS =====
// Defeated enemies drop ninja stars (STAR_DROP in data/items.js); Captains also drop a gift with a random cosmetic.
// Pickups pop out, bounce, then fly to the nearest player. They never touch fighters, so the fight plays out the
// same with or without them. Their rolls come from their own hash of the seed and frame (dropRoll), never from
// rnd(), so adding them did not change the gameplay random sequence. Modes switch drops on with MODE.drops.
let PK = [];
function dropRoll(k) {
  let h = (SEED ^ Math.imul(fr + 1, 2654435761) ^ Math.imul(k + 7, 40503)) >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909) >>> 0;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
// Called once per simulation step: any enemy that just went down drops its stars.
function dropScan() {
  const combo = PL.reduce((m, p) => Math.max(m, p.combo || 0), 0);
  E.forEach((e, i) => {
    if (!e.dying || e.dropped || !e.tk) return;
    e.dropped = 1;
    const [lo, hi] = STAR_DROP[e.tk] || [1, 1],
      r = dropRoll(i),
      n = lo + Math.floor(r * (hi - lo + 1)) + Math.min(5, Math.floor(combo / 10)),
      bits = Math.min(n, 8);
    for (let b = 0; b < bits; b++) {
      const q = dropRoll(i * 31 + b + 1);
      PK.push({
        k: 's',
        x: e.x,
        y: e.y - 50 * e.s,
        vx: (q - 0.5) * 7,
        vy: -5 - q * 4,
        t: -b * 2,
        v: Math.floor(n / bits) + (b < n % bits ? 1 : 0),
        a: q * 6
      });
    }
    if (e.tk === 'c' || (e.tk === 'b' && dropRoll(i + 99) < 0.04)) {
      // the gift is chosen as it drops, so it can show what's inside (not something already on the ground)
      const ground = PK.filter(k => k.k === 'g').map(k => k.item),
        pool = SELFTESTING ? [] : giftPool().filter(it => !ground.includes(it.id)),
        it = pool.length ? pool[Math.floor(dropRoll(i + 555) * pool.length) % pool.length] : null;
      PK.push({ k: 'g', x: e.x, y: e.y - 60, vx: 0, vy: -8, t: -10, v: 0, a: 0, item: it ? it.id : null });
    }
  });
}
function pickTick() {
  for (const k of PK) {
    k.t++;
    k.a += 0.25;
    if (k.t < 26) {
      if (k.t < 0) continue;
      k.vy += 0.45;
      k.x += k.vx;
      k.y += k.vy;
      if (k.y > G - 8) {
        k.y = G - 8;
        k.vy *= -0.45;
        k.vx *= 0.7;
      }
      continue;
    }
    // fly to the nearest standing player (anyone, if everyone is down)
    let to = null,
      bd = 1e9;
    for (const p of PL) {
      const d = Math.abs(p.x - k.x) + (p.st === 'dead' ? 5000 : 0);
      if (d < bd) {
        bd = d;
        to = p;
      }
    }
    if (!to) continue;
    const tx = to.x - k.x,
      ty = to.y - 50 - k.y,
      d = Math.hypot(tx, ty),
      sp = Math.min(20, 2 + (k.t - 26) * 0.5);
    if (d < sp + 18 || k.t > 400) collect(k, to);
    else {
      k.x += (tx / d) * sp;
      k.y += (ty / d) * sp;
    }
  }
  PK = PK.filter(k => !k.done);
}
function collect(k, p) {
  k.done = 1;
  if (k.k === 's') {
    grantStars(k.v, 'drop');
    sfx(1200 + Math.min(600, (STARHUD.bump || 0) * 40), 0.05, 'triangle', 0.025, 400);
    fxp({ k: 'r', x: k.x, y: k.y, r: 14, l: 10, m: 10 });
  } else {
    const it = SELFTESTING ? null : openGift(k.item);
    txt(p.x, p.y - 130, it ? 'NEW: ' + it.name.toUpperCase() + '!' : '+40 STARS', '#ff7a00', 24);
    ring(p.x, p.y - 50, 70);
    sfx(660, 0.4, 'triangle', 0.06, 600);
  }
}
// End of a run: anything still on the ground flies into your pocket.
function collectAll() {
  for (const k of PK) if (!k.done) collect(k, PL[0]);
  PK = [];
}
// ===== DRAWING =====
function shuriken(x, y, r, a) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(a);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const q = i % 2 ? r * 0.38 : r,
      b = (i * Math.PI) / 4;
    ctx.lineTo(Math.cos(b) * q, Math.sin(b) * q);
  }
  ctx.closePath();
  ctx.fillStyle = '#c9ced8';
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(1.5, r * 0.22);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.18, 0, 7);
  ctx.fillStyle = '#fbfaf4';
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
// A gift shows the item inside, in a bubble (or a big ninja star when it's stars)
function giftDraw(k) {
  const y = k.y - 6 + Math.sin(fr * 0.15) * 3,
    it = k.item && ITEM[k.item];
  ctx.save();
  ctx.fillStyle = 'rgba(255,253,248,.92)';
  ctx.strokeStyle = '#ffd400';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(k.x, y, 23, 0, 7);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(k.x, y, 22, 0, 7);
  ctx.clip();
  if (it) drawItemIcon(it, k.x, y + 2, 40, (PL[0] && PL[0].col) || '#ff7a00');
  else shuriken(k.x, y, 14, fr * 0.05);
  ctx.restore();
  if ((fr >> 3) % 2) star4(k.x + 18, y - 18, 5, '#ffd400');
}
function drawPickups() {
  for (const k of PK) {
    if (k.t < 0) continue;
    if (k.k === 's') shuriken(k.x, k.y, 7, k.a);
    else giftDraw(k);
  }
}
// HUD: your ninja stars, next to the score
function starHud() {
  const b = STARHUD.bump > 0 ? STARHUD.bump-- : 0,
    x = W - 138,
    y = 25;
  shuriken(x - 8, y, 9 + b * 0.25, fr * 0.04);
  ctx.textAlign = 'right';
  ctx.font = '900 ' + (20 + b * 0.4) + 'px Impact,"Arial Black",sans-serif';
  ctx.fillStyle = INK;
  ctx.fillText(String(ECO.stars), x - 22, y + 8);
}
