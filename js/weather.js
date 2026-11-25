// StickFighters: weather in a campaign run: the big gusts of wind on the Snowy Peak (a biome with gust in
// data/themes.js). Every so often the wind picks up (a warning), then blows everyone back the way they came for a few
// seconds; the snow streaks sideways and the wind howls (audio.js).
// The gust is part of the game: it runs in the simulation from the level clock and rnd(), never from drawing.
// The drawing never changes the game and uses Math.random() only for cosmetic effects.
const GUST_WARN = 80, // frames of the wind picking up before it pushes
  GUST_LEN = 200, // frames it pushes for
  GUST_PUSH = 2.6; // px per frame at full strength (walking still gets you forward, slowly)
// Is the camera in a gusty biome, and not at a boss fight or in a scene?
function gustHere(ae) {
  if (!LV || !LV.segs || LV.cine || (ae && ae.boss)) return false;
  const sg = segAt(CAM.x + W / 2);
  return !!(sg && BIOMES[sg.b].gust);
}
// One step (level.js, through hazTick). rnd() is only used in a gusty biome.
function gustTick(ae) {
  if (!gustHere(ae)) {
    if (LV.gu) LV.gu.t0 = -9999;
    return;
  }
  const g = LV.gu || (LV.gu = { t0: -9999, next: LV.t + 360 + Math.floor(rnd() * 420) });
  if (LV.t >= g.next) {
    g.t0 = LV.t;
    g.next = LV.t + GUST_WARN + GUST_LEN + 600 + Math.floor(rnd() * 720);
    const lead = PL.find(p => p.st !== 'dead');
    if (lead) txt(lead.x, lead.y - 140, 'GUST!', '#7fc8ff', 26);
  }
  const s = gustPush();
  if (s <= 0) return;
  for (const f of [...PL, ...E]) {
    if (f.gone || f.dying || f.hide || (f.T && f.T.boss)) continue;
    if (f.st === 'cine' || f.st === 'dead' || f.st === 'held' || f.st === 'grab') continue;
    const air = f.y < f.gy - 2;
    f.x -= (s * GUST_PUSH * (air ? 1.5 : 1)) / Math.sqrt(f.s || 1);
  }
}
// How hard the gust pushes this frame: 0, rising to 1, then easing off at the end
function gustPush() {
  const g = LV && LV.gu;
  if (!g) return 0;
  const ph = LV.t - g.t0 - GUST_WARN;
  if (ph < 0 || ph >= GUST_LEN) return 0;
  return Math.min(1, ph / 30, (GUST_LEN - ph) / 40);
}
// For the drawing and the sound: 0..1, including the wind picking up before the push
function gustAmt() {
  const g = MODE === LEVEL && LV && LV.gu;
  if (!g) return 0;
  const ph = LV.t - g.t0;
  if (ph < 0 || ph >= GUST_WARN + GUST_LEN) return 0;
  return ph < GUST_WARN ? 0.35 * (ph / GUST_WARN) : 0.35 + 0.65 * gustPush();
}
// Drawn over the peak's falling snow (biomes.js drawSnowFg): snow streaking sideways and a pale haze
function drawGust() {
  const a = gustAmt();
  if (a <= 0) {
    for (let i = AMB.length - 1; i >= 0; i--) if (AMB[i].k === 'gust' && AMB[i].x < -80) AMB.splice(i, 1);
    if (!AMB.some(q => q.k === 'gust')) return;
  }
  if (live() && a > 0)
    for (let n = 0; n < a * 2.5 + Math.random(); n++)
      AMB.push({
        k: 'gust',
        x: W + 40 + Math.random() * 200,
        y: Math.random() * H,
        vx: -(14 + Math.random() * 14),
        vy: (Math.random() - 0.3) * 2,
        r: 1.5 + Math.random() * 2.5,
        l: 18 + Math.random() * 40
      });
  ctx.globalAlpha = 0.18 * a;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-30, -30, W + 60, H + 60);
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.lineCap = 'round';
  for (let i = AMB.length - 1; i >= 0; i--) {
    const q = AMB[i];
    if (q.k !== 'gust') continue;
    if (live()) {
      q.x += q.vx;
      q.y += q.vy + Math.sin((fr + i * 7) * 0.2) * 0.6;
    }
    // a streak of snow: a soft blue edge so it shows on the white, then the white
    ctx.beginPath();
    ctx.moveTo(q.x, q.y);
    ctx.lineTo(q.x + q.l, q.y - q.vy * 2);
    ctx.strokeStyle = 'rgba(120,150,190,0.5)';
    ctx.lineWidth = q.r + 2;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = q.r;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(q.x, q.y, q.r * 0.9, 0, 7);
    ctx.fill();
    if (q.x < -80) AMB.splice(i, 1);
  }
}
