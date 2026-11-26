// StickFighters: Settings and save, seeded random, screen constants, feel knobs, sound
// ===== SETTINGS & SAVE =====
const $ = id => document.getElementById(id);
// The game's version. Online play only connects devices with the same version (their games must play out
// identically). Bump it with the ?v= cache-buster in index.html on every release.
const GAME_VERSION = 73;
const SAVE_KEY = 'orangeArmy.v1';
const DEF = {
  vol: 1,
  mus: 0.6,
  diff: 1, // Easy, Normal, Hard (data/difficulty.js), for Story and Arcade
  tut: 0, // 1 once the tutorial has been offered
  cb: 0, // colour help: each player's number (and team shape) over their head
  big: 0, // bigger text in the menus and on the player bars
  tsize: 1,
  topac: 0.75,
  lay: null,
  surge: 'hold',
  touch: 'auto',
  hist: 0,
  calm: 0,
  seed: '',
  binds: null
};
let SET = { ...DEF },
  BEST = { score: 0, wave: 0, combo: 0 },
  PROG = {},
  LAST = null;
// Ninja stars and owned cosmetics. Change these only through economy.js (grantStars, spendStars, grantItem).
//   stars = wallet, got = stars ever earned, own = item ids owned, seen = item ids already shown as NEW
const ECO = { stars: 0, got: 0, own: [], seen: [] };
// Saved fighters: four slots, cur = the one Player 1 uses. A slot is null until it's created.
const CHR = { cur: 0, list: [null, null, null, null] };
// The house (see data/house.js for its shape). Checked with normHouse() before it's used.
const HOUSE = {
  bg: 'hbg-paper',
  cells: {},
  solids: {},
  floors: {},
  fills: {},
  climbs: {},
  sides: {},
  items: []
};
// Rhett's levels (the level creator; data/editor.js has the format). Checked with normLevel (editor.js) when loaded.
const EDIT = { levels: [] };
// The save keeps one key forever and carries a version. migrate() upgrades older saves one step at a time.
//   v1 (no saveVersion): { set, best }
//   v2: adds prog = { levelId: { done, score, time, combo } }
//   v3: adds set.binds = custom keys and controller buttons (null = defaults)
//   v4: adds eco = { stars, got, own, seen } and chr = { cur, list: [fighter|null] x3 }
//   v5: a fourth fighter slot; fighters gain ht and wheel (normFighter upgrades old fighters)
//   v6: adds house = { bg, cells, items }
//   v7: the house grows: rows count up from the floor (v6 counted 7 rows down from the top) and squares can hold
//       solids; normHouse() turns the rows over for a house marked flip7
//   v8: barriers: house.fills (material inside stairs) and house.sides (side walls)
//   v9: ladders and spiral stairs (now climbed straight up) live in house.climbs; old spiralR / spiralL move there
//   v10: floors get their own layer (house.floors), so a floor and stairs can share a square
//   v11: fighters gain headType ('donut' = the ring head they always had, or 'full')
//   v12: fighters gain prog = { xp, sk (skill points by node id), ult (the branch whose ultimate they use) }
//   v13: ultimates are bought as skill-tree nodes, so prog.ult goes; hit-stop and screen shake off, bodies stay 1 s
//   v14: settings gain mus (the Music volume; vol is now the Sound volume), diff (the difficulty, 1 = Normal) and
//        tut (the tutorial was offered; a save from before has played already, so it starts at 1), cb (colour
//        help) and big (bigger text); cb and big start off from the defaults
//   v15: fighters gain eq.face (glasses, shades, masks…; nothing worn to start)
//   v16: fighters gain eq.pet (a pet that follows you; none to start)
//   v17: adds edit = { levels: [] } (Rhett's levels from the level creator)
//   v18: a level's place and parts ({ b, parts }) become places: [{ b, parts }] (up to three places in a level)
const SAVE_VERSION = 18;
function migrate(s) {
  if (!s.saveVersion) {
    s.prog = s.prog || {};
    s.saveVersion = 2;
  }
  if (s.saveVersion === 2) {
    if (s.set) s.set.binds = s.set.binds || null;
    s.saveVersion = 3;
  }
  if (s.saveVersion === 3) {
    s.eco = s.eco || { stars: 0, got: 0, own: [], seen: [] };
    s.chr = s.chr || { cur: 0, list: [null, null, null] };
    s.saveVersion = 4;
  }
  if (s.saveVersion === 4) {
    if (s.chr && Array.isArray(s.chr.list)) while (s.chr.list.length < 4) s.chr.list.push(null);
    s.saveVersion = 5;
  }
  if (s.saveVersion === 5) {
    s.house = s.house || { bg: 'hbg-paper', cells: {}, items: [] };
    s.saveVersion = 6;
  }
  if (s.saveVersion === 6) {
    if (s.house) s.house.flip7 = 1;
    s.saveVersion = 7;
  }
  if (s.saveVersion === 7) {
    if (s.house) Object.assign(s.house, { fills: s.house.fills || {}, sides: s.house.sides || {} });
    s.saveVersion = 8;
  }
  if (s.saveVersion === 8) {
    const h = s.house;
    if (h) {
      h.climbs = h.climbs || {};
      for (const k in h.solids || {})
        if (/^spiral/.test(h.solids[k])) {
          h.climbs[k] = 'spiral';
          delete h.solids[k];
          if (h.fills) delete h.fills[k];
        }
    }
    s.saveVersion = 9;
  }
  if (s.saveVersion === 9) {
    const h = s.house;
    if (h) {
      h.floors = h.floors || {};
      for (const k in h.solids || {})
        if (h.solids[k] === 'floor') {
          h.floors[k] = 'floor';
          delete h.solids[k];
        }
    }
    s.saveVersion = 10;
  }
  if (s.saveVersion === 10) {
    if (s.chr && Array.isArray(s.chr.list))
      for (const f of s.chr.list) if (f && !f.headType) f.headType = 'donut';
    s.saveVersion = 11;
  }
  if (s.saveVersion === 11) {
    if (s.chr && Array.isArray(s.chr.list))
      for (const f of s.chr.list) if (f && !f.prog) f.prog = { xp: 0, sk: {}, ult: null };
    s.saveVersion = 12;
  }
  if (s.saveVersion === 12) {
    if (s.chr && Array.isArray(s.chr.list)) for (const f of s.chr.list) if (f && f.prog) delete f.prog.ult;
    if (s.set && s.set.feel)
      Object.assign(s.set.feel, { hitstop: 0, shake: 0, body: Math.min(1, +s.set.feel.body || 1) });
    s.saveVersion = 13;
  }
  if (s.saveVersion === 13) {
    if (s.set && typeof s.set.mus !== 'number') s.set.mus = 0.6;
    if (s.set && typeof s.set.diff !== 'number') s.set.diff = 1;
    if (s.set) s.set.tut = 1;
    s.saveVersion = 14;
  }
  if (s.saveVersion === 14) {
    if (s.chr && Array.isArray(s.chr.list))
      for (const f of s.chr.list) if (f && f.eq && typeof f.eq === 'object' && !('face' in f.eq)) f.eq.face = null;
    s.saveVersion = 15;
  }
  if (s.saveVersion === 15) {
    if (s.chr && Array.isArray(s.chr.list))
      for (const f of s.chr.list) if (f && f.eq && typeof f.eq === 'object' && !('pet' in f.eq)) f.eq.pet = null;
    s.saveVersion = 16;
  }
  if (s.saveVersion === 16) {
    s.edit = { levels: [] };
    s.saveVersion = 17;
  }
  if (s.saveVersion === 17) {
    // a level becomes a list of places (it had one place: b and its parts)
    if (s.edit && Array.isArray(s.edit.levels))
      s.edit.levels = s.edit.levels.map(L =>
        L && typeof L === 'object' && !Array.isArray(L.places) ? { id: L.id, name: L.name, places: [{ b: L.b, parts: L.parts }] } : L
      );
    s.saveVersion = 18;
  }
  return s;
}
// Copies a loaded save into the live objects, keeping only the shapes we expect (a save is data, never code).
function loadSave(s) {
  if (s.set && typeof s.set === 'object') Object.assign(SET, s.set);
  if (s.best && typeof s.best === 'object') Object.assign(BEST, s.best);
  if (s.prog && typeof s.prog === 'object') Object.assign(PROG, s.prog);
  const e = s.eco || {},
    ids = a => (Array.isArray(a) ? a.filter(x => typeof x === 'string').slice(0, 500) : []);
  ECO.stars = Math.max(0, Math.floor(+e.stars || 0));
  ECO.got = Math.max(ECO.stars, Math.floor(+e.got || 0));
  ECO.own = ids(e.own);
  ECO.seen = ids(e.seen);
  const c = s.chr || {};
  CHR.list = [0, 1, 2, 3].map(i => (c.list && c.list[i] && typeof c.list[i] === 'object' ? c.list[i] : null));
  CHR.cur = [0, 1, 2, 3].includes(c.cur) ? c.cur : 0;
  const h = s.house || {};
  HOUSE.bg = typeof h.bg === 'string' ? h.bg : 'hbg-paper';
  HOUSE.cells = h.cells && typeof h.cells === 'object' && !Array.isArray(h.cells) ? h.cells : {};
  HOUSE.items = Array.isArray(h.items) ? h.items : [];
  const map = o => (o && typeof o === 'object' && !Array.isArray(o) ? o : {});
  HOUSE.solids = map(h.solids);
  HOUSE.fills = map(h.fills);
  HOUSE.sides = map(h.sides);
  HOUSE.climbs = map(h.climbs);
  HOUSE.floors = map(h.floors);
  if (h.flip7) HOUSE.flip7 = 1;
  EDIT.levels = s.edit && Array.isArray(s.edit.levels) ? s.edit.levels : []; // checked by editor.js
}
try {
  loadSave(migrate(JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')));
} catch (e) {}
const saveData = () => ({
  saveVersion: SAVE_VERSION,
  set: SET,
  best: BEST,
  prog: PROG,
  eco: ECO,
  chr: CHR,
  house: HOUSE,
  edit: EDIT
});
const save = () => {
  try {
    if (typeof SELFTESTING !== 'undefined' && SELFTESTING) return;
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData()));
  } catch (e) {}
};
// ===== SEEDED RANDOM: same seed = same spawns, AI rolls and particle noise =====
let SEED = 1;
const reseed = s => {
  SEED = s >>> 0;
};
function rnd() {
  SEED = (SEED + 0x6d2b79f5) >>> 0;
  let t = SEED;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
// Effects' own random numbers (particles, sparks, debris, speed lines): never rnd(), so whether effects are shown
// can't change the game. (Rollback will re-play frames with effects off, SIM.mute; the game must come out the same.)
let FXSEED = 7;
function fxr() {
  FXSEED = (FXSEED + 0x6d2b79f5) >>> 0;
  let t = FXSEED;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
// The simulation's switches. mute: effects and sounds do nothing (fxp, ghost, sfx, noise, sfxHit check it), for
// re-playing frames that were already shown. The camera's shake, kick and zoom (shake, camX, camY, zoom) are only
// looks too, but they're set in many places: a re-play saves them first and puts them back after.
const SIM = { mute: 0 };
const cv = document.getElementById('c'),
  W = 900,
  H = 420,
  G = 345,
  D = Math.PI / 180,
  INK = '#1c1626';
// The drawing context. Usually the game canvas; the character preview and store icons point it at their own
// canvas for a moment (withCtx), so every drawing function works on any canvas.
let ctx = cv.getContext('2d');
function withCtx(c2, fn) {
  const keep = ctx;
  ctx = c2;
  try {
    fn();
  } finally {
    ctx = keep;
  }
}
// World. CAM.x = world x of the screen's left edge. WB = walls for living fighters (the screen, or a gate such
// as the fallen log). WW = the whole world's edges, used by ragdolls. In Arcade and Training all three are the screen.
const CAM = { x: 0, y: 0, z: 1 }, // y < 0 = looking up, z < 1 = zoomed out (the house; other modes keep 0, 0, 1)
  WB = { l: 0, r: W },
  WW = { l: 0, r: W };
// World space as the camera sees it: (cx, cy) at zoom z, zooming about the floor line so the floor stays put at z 1
// The left edge of the view in the world. In a level the game's own camera (CAM.x, which walls and fights use)
// stays put and a zoomed-out view (CAM.z < 1, drawing only) widens around its middle; other modes set CAM.x to the
// view's edge themselves.
const viewX = () => (MODE === LEVEL && CAM.z < 1 ? CAM.x + (W - W / CAM.z) / 2 : CAM.x);
function camApply(cx, cy, z) {
  ctx.translate(0, G);
  ctx.scale(z, z);
  ctx.translate(-cx, -G - cy);
}
// Feel knobs (training room > Feel). Saved per device.
// Feel knobs. Hit-stop (the freeze on each hit) and screen shake start off; body = seconds a settled body stays before
// the confetti. Online they're fixed (net/session.js).
const FEEL = { hitstop: 0, shake: 0, kb: 1, grav: 1, bounce: 1, body: 1 };
let NB;
function noise(d, v, hp) {
  if (SIM.mute) return;
  if (SET.vol <= 0) return;
  try {
    AC = AC || new AudioContext();
    if (!NB) {
      NB = AC.createBuffer(1, (AC.sampleRate * 0.5) | 0, AC.sampleRate);
      const c = NB.getChannelData(0);
      for (let i = 0; i < c.length; i++) c[i] = Math.random() * 2 - 1;
    }
    const n = AC.currentTime,
      s = AC.createBufferSource(),
      f = AC.createBiquadFilter(),
      g = AC.createGain();
    s.buffer = NB;
    f.type = 'highpass';
    f.frequency.value = hp;
    g.gain.setValueAtTime(Math.max(0.002, v * SET.vol), n);
    g.gain.exponentialRampToValueAtTime(0.0005, n + d);
    s.connect(f);
    f.connect(g);
    g.connect(AC.destination);
    s.start();
    s.stop(n + d);
  } catch (e) {}
}
// Layered hit sounds: light = snap, medium = snap + thump, heavy = crunch + deep boom
function sfxHit(w) {
  if (SIM.mute) return;
  if (w === 'L') {
    noise(0.05, 0.06, 2600);
    sfx(260, 0.06, 'square', 0.035, -130);
  } else if (w === 'M') {
    noise(0.08, 0.08, 1300);
    sfx(160, 0.1, 'square', 0.05, -80);
    sfx(110, 0.13, 'sine', 0.11, -60);
  } else {
    noise(0.16, 0.12, 450);
    sfx(120, 0.14, 'sawtooth', 0.06, -70);
    sfx(70, 0.3, 'sine', 0.17, -40);
  }
}
// A recorded sound from data/sounds.js, decoded once, at volume v × the Volume setting
const SND_BUF = {};
function playSnd(name, v = 1) {
  if (SET.vol <= 0 || !SND[name]) return;
  try {
    AC = AC || new AudioContext();
    if (!SND_BUF[name]) {
      const bin = atob(SND[name]),
        u = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      SND_BUF[name] = AC.decodeAudioData(u.buffer);
    }
    SND_BUF[name].then(
      buf => {
        const s = AC.createBufferSource(),
          g = AC.createGain();
        s.buffer = buf;
        g.gain.value = v * SET.vol;
        s.connect(g);
        g.connect(AC.destination);
        s.start();
      },
      () => {}
    );
  } catch (e) {}
}
let AC;
function sfx(f, d, t = 'square', v = 0.05, s = 0) {
  if (SIM.mute) return;
  if (SET.vol <= 0) return;
  try {
    AC = AC || new AudioContext();
    const n = AC.currentTime,
      o = AC.createOscillator(),
      g = AC.createGain();
    o.type = t;
    o.frequency.setValueAtTime(f, n);
    if (s) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + s), n + d);
    g.gain.setValueAtTime(Math.max(0.002, v * SET.vol), n);
    g.gain.exponentialRampToValueAtTime(0.0005, n + d);
    o.connect(g);
    g.connect(AC.destination);
    o.start();
    o.stop(n + d);
  } catch (e) {}
}
