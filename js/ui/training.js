// StickFighters: Training Room: dummies, hitbox/frame-data overlays, training hotkeys
// ===== TRAINING ROOM =====
const TR = { mortal: 0, inf: 0, boxes: 1, frames: 1, hist: 1, god: 1, passive: 1, ts: 1, freeze: 0, step: 0 };
function spawnDummy(t) {
  if (state !== 'train' || E.filter(x => !x.gone && !x.dying).length >= 8) return;
  const P = PL[0],
    dir = P.x < (WB.l + WB.r) / 2 ? 1 : -1,
    e = F(Math.max(WB.l + 60, Math.min(WB.r - 60, P.x + dir * (150 + rnd() * 60))), t, 0);
  if (!TR.mortal) e.hp = e.max = 9999;
  e.cd = 30;
  e.face = P.x > e.x ? 1 : -1;
  E.push(e);
}
function clearDummies() {
  E = [];
  FX.length = 0;
  GH.length = 0;
}
function drawBoxes() {
  ctx.save();
  ctx.lineWidth = 2;
  for (const f of [...PL, ...E]) {
    if (f.gone) continue;
    ctx.strokeStyle = '#2a7bff';
    ctx.strokeRect(f.x - 15 * f.s, f.y - 78 * f.s, 30 * f.s, 82 * f.s);
    if (f.att) {
      const d = f.att.d,
        on = f.att.f >= d.h[0] && f.att.f <= d.h[1],
        b = hbox(f);
      ctx.fillStyle = on ? 'rgba(232,33,43,.35)' : 'rgba(232,33,43,.08)';
      ctx.strokeStyle = on ? '#e8212b' : 'rgba(232,33,43,.4)';
      ctx.fillRect(b[0], b[1], b[2] - b[0], b[3] - b[1]);
      ctx.strokeRect(b[0], b[1], b[2] - b[0], b[3] - b[1]);
    }
  }
  ctx.restore();
}
function chip(x, y, t, bg, fg) {
  ctx.font = '900 12px "Trebuchet MS",sans-serif';
  const w = ctx.measureText(t).width + 12;
  ctx.fillStyle = bg;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, 20, 6);
  else ctx.rect(x, y, w, 20);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(t, x + 6, y + 10);
  return w + 4;
}
function debugUI() {
  const tOn = $('wrap').classList.contains('touch-on'),
    Y1 = tOn ? 86 : H - 60,
    Y2 = tOn ? 110 : H - 32;
  const tr = state === 'train',
    showH = (tr && TR.hist) || (state === 'play' && SET.hist),
    showF = tr && TR.frames,
    showS = tr && (TR.freeze || TR.ts < 1);
  if (!showH && !showF && !showS) return;
  ctx.save();
  if (showF) {
    let t = 'Punch or kick to see frame data';
    const a = PL[0].att;
    if (a) {
      const d = a.d,
        ph = a.f < d.h[0] ? 'startup' : a.f <= d.h[1] ? 'ACTIVE' : 'recovery';
      t =
        (d.nm || d.n) +
        ' [aim ' +
        (LAST ? LAST.aim : '·') +
        ']  ' +
        ph +
        ' ' +
        a.f +
        '/' +
        (d.d > 999 ? '–' : d.d) +
        '  ·  ' +
        d.dmg +
        ' dmg · ' +
        d.fx +
        (d.cost ? ' · ' + d.cost + ' Surge' : '');
    } else if (LAST)
      t =
        LAST.n +
        ' [aim ' +
        LAST.aim +
        ']  ' +
        (LAST.inf
          ? 'active until landing'
          : 'startup ' + LAST.su + ' · active ' + LAST.ac + ' · recovery ' + LAST.rc) +
        '  ·  ' +
        LAST.dmg +
        ' dmg · ' +
        LAST.fx +
        (LAST.cost ? ' · ' + LAST.cost + ' Surge' : '') +
        (LAST.ul === 'Tree' ? ' · ' + skillOf(LAST.key) : LAST.ul === 'Ult' ? ' · Ult' : '');
    chip(12, Y1, t, INK, '#fff');
  }
  if (showS)
    chip(W - 140, tOn ? 134 : H - 60, (TR.freeze ? 'FROZEN · ' : '') + TR.ts + 'x speed', '#e8212b', '#fff');
  if (showH) {
    const groups = [];
    for (const h of HIST) {
      const g = groups[groups.length - 1];
      if (g && g.f === h.f) g.a.push(h.a);
      else groups.push({ f: h.f, a: [h.a] });
    }
    let x = 12;
    const y = Y2;
    for (const g of groups.slice(-9)) {
      const atk = g.a.includes('p') || g.a.includes('k'),
        sg = g.a.includes('s');
      ctx.globalAlpha = Math.max(0.35, 1 - (fr - g.f) / 300);
      x += chip(
        x,
        y,
        g.a.map(a => SYM[a]).join('+'),
        atk ? '#ff7a00' : sg ? '#ffd400' : INK,
        sg && !atk ? INK : '#fff'
      );
    }
    ctx.globalAlpha = 1;
    let hx = W - 282;
    const yk = tOn ? 110 : y;
    for (const a of ['l', 'u', 'd', 'r', 'j', 'p', 'k', 's', 'x']) {
      const on = inputOf(PL[0]).K[a];
      ctx.fillStyle = on
        ? a === 's'
          ? '#ffd400'
          : a === 'p' || a === 'k'
            ? '#ff7a00'
            : '#3ec5ff'
        : 'rgba(28,22,38,.18)';
      ctx.fillRect(hx, yk, 28, 20);
      ctx.fillStyle = on ? INK : 'rgba(28,22,38,.6)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 10px "Trebuchet MS",sans-serif';
      ctx.fillText(a === 'j' ? 'JMP' : a === 'x' ? 'ULT' : a === 's' ? 'SRG' : SYM[a], hx + 14, yk + 10);
      hx += 30;
    }
  }
  ctx.restore();
}
