// StickFighters: Versus and Arcade stages (data/stages.js). Builds the stage's platforms (terrain.js), moves a moving
// one each step (carrying whoever stands on it), and draws the stage: its place's look, then the platforms.
// ===== STAGES =====
let STAGE_SEL = '?'; // the stage picked for the next Versus or Arcade game ('?' = one picked from the game's seed)
const STG = { st: null, t: 0, s: [] }; // the stage being played, its time, its platforms
// Versus keeps the match's stage for every round (keep); a random pick comes from the seed, so online everyone gets
// the same stage without using up the game's random numbers
function stageStart(keep) {
  if (!keep || !STG.st) STG.st = STAGE[STAGE_SEL] || STAGES[(curSeed >>> 0) % STAGES.length];
  STG.t = 0;
  STG.s = STG.st.plats.map(([x1, x2, h]) => ({ x1, x2, y1: G - h, y2: G - h, st: 'stage', bx: x1, by: G - h }));
  terrainSet(STG.s);
}
function stageTick() {
  const M = STG.st && STG.st.move;
  if (!M || SELFTESTING) return;
  STG.t++;
  const s = STG.s[M.i],
    o = M.a * Math.sin((2 * Math.PI * STG.t) / M.p),
    dx = (M.ax === 'x' ? s.bx + o : s.bx) - s.x1,
    dy = (M.ax === 'y' ? s.by - o : s.by) - s.y1;
  s.x1 += dx;
  s.x2 += dx;
  s.y1 += dy;
  s.y2 += dy;
  // whoever stands on it rides along
  for (const f of [...PL, ...E])
    if (f.surf === s) {
      f.x += dx;
      f.y = s.y1;
      f.gy = s.y1;
    }
  terrainSet(STG.s);
}
// The stage's look, then its platforms. false = the plain notebook page (render.js draws it).
function stageBg() {
  const st = STG.st;
  if (!st || st.look === 'paper' || !LOOKS[st.look]) return false;
  stageLV(() => LOOKS[st.look].bg());
  for (const s of STG.s) stagePlat(s, st.look);
}
function stageFg() {
  const st = STG.st;
  if (st && st.look !== 'paper' && LOOKS[st.look]) stageLV(() => LOOKS[st.look].fg());
}
// Some looks read the level's scenery (the woods' trees); Arcade has no level, so they draw over the Versus arena's.
// Drawing only: LV is put back straight after.
let STAGE_ARENA = null;
function stageLV(draw) {
  if (LV) return draw();
  STAGE_ARENA = STAGE_ARENA || buildLevel('arena');
  LV = STAGE_ARENA;
  try {
    draw();
  } finally {
    LV = null;
  }
}
// A platform in its place's style: planks with grass (woods), stone (castle), a steel girder (city), a ship's deck,
// moon-base metal with lights
function stagePlat(s, look) {
  const w = s.x2 - s.x1,
    y = s.y1,
    st = {
      woods: ['#a96e3a', '#5aa04a'],
      meadow: ['#a96e3a', '#5aa04a'],
      castle: ['#b4b4bd', null],
      city: ['#6f7a8c', '#ffd400'],
      ship: ['#c98a4f', null],
      moon: ['#c9ccd6', '#3ec5ff']
    }[look] || ['#a96e3a', null];
  ctx.save();
  ctx.lineJoin = 'round';
  // its shadow on the floor
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.beginPath();
  ctx.ellipse(s.x1 + w / 2, G + 4, w / 2, 6, 0, 0, 7);
  ctx.fill();
  if (look === 'ship') {
    // a deck on posts
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(s.x1 + 14, y + 14);
    ctx.lineTo(s.x1 + 14, Math.min(G, y + 60));
    ctx.moveTo(s.x2 - 14, y + 14);
    ctx.lineTo(s.x2 - 14, Math.min(G, y + 60));
    ctx.stroke();
  }
  inkRect(s.x1, y, w, 16, st[0], 3);
  if (look === 'castle') {
    // stone blocks and battlements
    ctx.strokeStyle = 'rgba(28,22,38,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = s.x1 + 30; x < s.x2; x += 30) {
      ctx.moveTo(x, y + 2);
      ctx.lineTo(x, y + 14);
    }
    ctx.stroke();
  } else if (look === 'ship' || look === 'woods' || look === 'meadow') {
    ctx.strokeStyle = 'rgba(28,22,38,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x1 + 4, y + 8);
    ctx.lineTo(s.x2 - 4, y + 8);
    ctx.stroke();
  }
  if (st[1] && (look === 'woods' || look === 'meadow')) {
    // a grass top
    ctx.fillStyle = st[1];
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(s.x1 - 2, y + 2);
    for (let x = s.x1; x <= s.x2; x += 12) ctx.lineTo(x + 6, y - 5), ctx.lineTo(x + 12, y + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (st[1]) {
    // hazard stripes (city) or lights (moon)
    ctx.fillStyle = st[1];
    if (look === 'city') for (let x = s.x1 + 8; x < s.x2 - 10; x += 24) ctx.fillRect(x, y + 4, 12, 8);
    else
      for (let x = s.x1 + 16; x < s.x2 - 8; x += 36) {
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(performance.now() / 300 + x);
        ctx.beginPath();
        ctx.arc(x, y + 8, 3.5, 0, 7);
        ctx.fill();
      }
  }
  ctx.restore();
}
ARCADE.bg = stageBg;
ARCADE.fg = stageFg;
VERSUS.bg = stageBg;
VERSUS.fg = stageFg;
