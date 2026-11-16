// Orange vs. the Pink Army: Settings and save, seeded random, screen constants, feel knobs, sound
// ===== SETTINGS & SAVE (M0) =====
const $ = id => document.getElementById(id);
const SAVE_KEY = 'orangeArmy.v1';
const DEF = {
  vol: 1,
  tsize: 1,
  topac: 0.75,
  lay: null,
  surge: 'hold',
  touch: 'auto',
  hist: 0,
  calm: 0,
  seed: ''
};
let SET = { ...DEF },
  BEST = { score: 0, wave: 0, combo: 0 },
  LAST = null;
try {
  const s = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
  if (s.set) Object.assign(SET, s.set);
  if (s.best) Object.assign(BEST, s.best);
} catch (e) {}
const save = () => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ set: SET, best: BEST }));
  } catch (e) {}
};
// ===== SEEDED RANDOM (M0): same seed = same spawns, AI rolls and particle noise =====
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
const cv = document.getElementById('c'),
  ctx = cv.getContext('2d'),
  W = 900,
  H = 420,
  G = 345,
  D = Math.PI / 180,
  INK = '#1c1626';
// World (M8). CAM.x = world x of the screen's left edge. WB = walls for living fighters (the screen, or a gate such
// as the fallen log). WW = the whole world's edges, used by ragdolls. In Arcade and Training all three are the screen.
const CAM = { x: 0 },
  WB = { l: 0, r: W },
  WW = { l: 0, r: W };
// Feel knobs (training room > Feel). Saved per device.
const FEEL = { hitstop: 1, shake: 1, kb: 1, grav: 1, bounce: 1, body: 2.5 }; // body = seconds a settled body stays before the confetti
let NB;
function noise(d, v, hp) {
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
let AC;
function sfx(f, d, t = 'square', v = 0.05, s = 0) {
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
