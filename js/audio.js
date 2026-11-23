// StickFighters: music, background sound and the sounds that follow what's on screen. Everything is made here with
// Web Audio (no recordings): the songs are data (data/music.js), played by a step sequencer that schedules notes a
// moment ahead. All of it runs from the frame loop (audioTick in main.js) and only looks at the game, so it never
// changes the simulation. Volumes: Music (SET.mus) and Sound (SET.vol) in Settings.
// ===== THE AUDIO OUTPUT =====
const AUD = { mus: null, amb: null, nb: null, on: false };
function audCtx() {
  AC = AC || new AudioContext();
  if (!AUD.mus) {
    AUD.mus = AC.createGain();
    AUD.mus.gain.value = 0;
    AUD.mus.connect(AC.destination);
    AUD.amb = AC.createGain();
    AUD.amb.gain.value = 0;
    AUD.amb.connect(AC.destination);
    AUD.nb = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
    const c = AUD.nb.getChannelData(0);
    for (let i = 0; i < c.length; i++) c[i] = Math.random() * 2 - 1;
  }
  return AC;
}
// Browsers start sound only after a tap or a key: the first one turns it on. Hidden page = quiet.
function audUnlock() {
  try {
    audCtx();
    if (AC.state !== 'running') AC.resume();
    AUD.on = true;
  } catch (e) {}
}
for (const ev of ['pointerdown', 'keydown', 'touchend']) addEventListener(ev, audUnlock, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (!AC) return;
  if (document.hidden) AC.suspend();
  else if (AUD.on) AC.resume();
});
// ===== INSTRUMENTS =====
const NOTE_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
function noteMidi(s) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(s);
  return m ? NOTE_PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (+m[3] + 1) * 12 : null;
}
// A chord name: root and the notes above it (R 3 5 7 9)
function chordOf(name) {
  const m = /^([A-G][#b]?)(.*)$/.exec(name),
    q = m[2],
    root = NOTE_PC[m[1][0]] + (m[1][1] === '#' ? 1 : m[1][1] === 'b' ? -1 : 0),
    min = /^m(?!aj)/.test(q),
    third = /sus4/.test(q) ? 5 : min ? 3 : 4,
    fifth = /dim/.test(q) ? 6 : 7,
    sev = /maj7/.test(q) ? 11 : /7/.test(q) ? 10 : null;
  return { root, iv: { R: 0, 3: third, 5: fifth, 7: sev === null ? 12 : sev, 8: 12, 9: 14 }, sev };
}
// one oscillator note with an envelope (attack, hold to the end, release)
function osc(t, f, d, v, type, out, a = 0.005, r = 0.06, det = 0) {
  const o = AC.createOscillator(),
    g = AC.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (det) o.detune.setValueAtTime(det, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + a);
  g.gain.setValueAtTime(v, t + Math.max(a, d - r));
  g.gain.linearRampToValueAtTime(0, t + d + r);
  o.connect(g);
  g.connect(out);
  o.start(t);
  o.stop(t + d + r + 0.02);
  return o;
}
// a struck note that dies away (decay seconds)
function ping(t, f, dec, v, type, out) {
  const o = AC.createOscillator(),
    g = AC.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0008, t + dec);
  o.connect(g);
  g.connect(out);
  o.start(t);
  o.stop(t + dec + 0.02);
  return o;
}
function filt(type, f, out, q = 0.8) {
  const b = AC.createBiquadFilter();
  b.type = type;
  b.frequency.value = f;
  b.Q.value = q;
  b.connect(out);
  return b;
}
function nz(t, d, v, type, f, out, q = 1) {
  const s = AC.createBufferSource(),
    g = AC.createGain();
  s.buffer = AUD.nb;
  s.loop = true;
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0008, t + d);
  s.connect(filt(type, f, g, q));
  g.connect(out);
  s.start(t, Math.random());
  s.stop(t + d + 0.02);
}
function sweep(t, f0, f1, d, v, type, out) {
  const o = ping(t, f0, d, v, type, out);
  o.frequency.exponentialRampToValueAtTime(f1, t + d);
}
const INS = {
  bass: (t, f, d, v, o) => (osc(t, f, d, 0.32 * v, 'triangle', o, 0.005, 0.05), osc(t, f / 2, d, 0.18 * v, 'sine', o)),
  pluck: (t, f, d, v, o) => ping(t, f, Math.min(0.35, d + 0.1), 0.07 * v, 'square', filt('lowpass', f * 3, o)),
  lead: (t, f, d, v, o) => {
    const lp = filt('lowpass', 2600, o);
    osc(t, f, d, 0.06 * v, 'square', lp, 0.01, 0.06);
    osc(t, f, d, 0.04 * v, 'square', lp, 0.01, 0.06, 7);
  },
  flute: (t, f, d, v, o) => {
    const n = osc(t, f, d, 0.13 * v, 'sine', o, 0.04, 0.08),
      l = AC.createOscillator(),
      lg = AC.createGain();
    l.frequency.value = 5.5;
    lg.gain.value = f * 0.008;
    l.connect(lg);
    lg.connect(n.frequency);
    l.start(t + 0.12);
    l.stop(t + d + 0.1);
    osc(t, f * 2, d, 0.015 * v, 'triangle', o, 0.04, 0.08);
  },
  brass: (t, f, d, v, o) => {
    const lp = AC.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(f * 1.5, t);
    lp.frequency.linearRampToValueAtTime(f * 6, t + 0.05);
    lp.frequency.linearRampToValueAtTime(f * 2.5, t + 0.25);
    lp.connect(o);
    osc(t, f, d, 0.06 * v, 'sawtooth', lp, 0.02, 0.08);
    osc(t, f, d, 0.04 * v, 'sawtooth', lp, 0.02, 0.08, 9);
  },
  organ: (t, f, d, v, o) => {
    for (const [k, a] of [
      [1, 0.06],
      [2, 0.035],
      [4, 0.015]
    ])
      osc(t, f * k, d, a * v, 'sine', o, 0.01, 0.04);
  },
  accordion: (t, f, d, v, o) => {
    const lp = filt('lowpass', 2200, o);
    osc(t, f, d, 0.045 * v, 'square', lp, 0.03, 0.06, -8);
    osc(t, f, d, 0.035 * v, 'sawtooth', lp, 0.03, 0.06, 8);
  },
  marimba: (t, f, d, v, o) => (ping(t, f, 0.45, 0.2 * v, 'sine', o), ping(t, f * 4, 0.08, 0.05 * v, 'sine', o)),
  bell: (t, f, d, v, o) => (ping(t, f, 1.4, 0.1 * v, 'sine', o), ping(t, f * 2.76, 0.5, 0.035 * v, 'sine', o)),
  arp: (t, f, d, v, o) => ping(t, f, 0.12, 0.05 * v, 'square', filt('lowpass', 3000, o)),
  pad: (t, f, d, v, o) => {
    const lp = filt('lowpass', 1100, o);
    osc(t, f, d, 0.035 * v, 'sawtooth', lp, 0.35, 0.5, -10);
    osc(t, f, d, 0.035 * v, 'sawtooth', lp, 0.35, 0.5, 10);
  }
};
// drums by letter
const DRUM = {
  k: (t, v, o) => sweep(t, 150, 42, 0.28, 0.55 * v, 'sine', o),
  s: (t, v, o) => (nz(t, 0.16, 0.22 * v, 'bandpass', 1800, o, 0.7), ping(t, 190, 0.1, 0.12 * v, 'triangle', o)),
  h: (t, v, o) => nz(t, 0.04, 0.07 * v, 'highpass', 7000, o),
  o: (t, v, o) => nz(t, 0.22, 0.06 * v, 'highpass', 6500, o),
  c: (t, v, o) => {
    for (let i = 0; i < 3; i++) nz(t + i * 0.012, 0.08, 0.14 * v, 'bandpass', 1400, o, 1.2);
  },
  B: (t, v, o) => sweep(t, 190, 150, 0.2, 0.3 * v, 'sine', o),
  b: (t, v, o) => sweep(t, 320, 270, 0.13, 0.26 * v, 'sine', o),
  t: (t, v, o) => sweep(t, 130, 80, 0.3, 0.35 * v, 'sine', o)
};
// ===== THE SEQUENCER =====
// A song's parts, read once: each bar a list of {tok, len} (len = steps held)
function songPrep(s) {
  if (s._p) return s._p;
  const bar = (s.beats || 4) * (s.div || 4);
  s._p = s.parts.map(p => {
    const bars = (p.mel || p.pat.split('|')).map(b => {
      const tk = b.trim().split(/\s+/);
      return tk.map((tok, i) => {
        let n = 1;
        while (tk[i + n] === '-') n++;
        return { tok, len: n };
      });
    });
    return { ...p, bars };
  });
  s._bar = bar;
  s._ch = s.prog.map(chordOf);
  return s._p;
}
function playStep(P, lvl) {
  const s = P.song,
    parts = songPrep(s),
    bar = s._bar,
    sd = 60 / s.bpm / (s.div || 4),
    bi = Math.floor(P.step / bar) % s.prog.length,
    si = P.step % bar,
    ch = s._ch[bi],
    t = P.t;
  for (const p of parts) {
    if (lvl < (p.lvl || 0) || (p.max !== undefined && lvl > p.max)) continue;
    const st = p.bars[bi % p.bars.length][si];
    if (!st || st.tok === '.' || st.tok === '-') continue;
    const v = p.v === undefined ? 1 : p.v,
      d = st.len * sd;
    if (p.ins === 'drums') {
      if (DRUM[st.tok]) DRUM[st.tok](t, v, P.g);
      continue;
    }
    const base = ((p.o === undefined ? 3 : p.o) + 1) * 12 + ch.root,
      ms = p.mel ? [noteMidi(st.tok)] : st.tok === 'c' ? [0, ch.iv[3], ch.iv[5]].map(k => base + k) : [base + ch.iv[st.tok]];
    for (const m of ms) if (m !== null && !isNaN(m)) INS[p.ins](t, hz(m), d, v, P.g);
  }
}
const MUS = { cur: null, want: undefined, old: [], lvl: 0 };
// Fade out what's playing and start a song (or nothing)
function musStart(id) {
  const t = AC.currentTime + 0.06;
  if (MUS.cur) {
    const g = MUS.cur.g.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(0, t + 0.7);
    MUS.old.push({ g: MUS.cur.g, end: t + 3 });
  }
  MUS.cur = null;
  if (!id || !MUSIC[id]) return;
  const g = AC.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(1, t + 0.5);
  g.connect(AUD.mus);
  MUS.cur = { id, song: MUSIC[id], g, t, step: 0, done: false };
}
// What should be playing: [song, intensity]
function musWant() {
  const sc = SHOWN;
  if (sc === 's-victory' || sc === 's-clear') return ['victory', 0];
  if (sc === 's-over') return ['over', 0];
  if (state === 'train') return ['training', 0];
  if ((state === 'play' || state === 'over' || state === 'clear') && MODE) {
    if (MODE.id === 'house') return ['training', 0];
    if (MODE.id === 'arcade') return ['arcade', 1];
    if (MODE.id === 'versus') return ['arcade', 2];
    if (MODE.id === 'level' && LV) {
      const ae = LV.encs.find(e => e.st === 1);
      if ((ae && ae.boss) || (LV.esc && !LV.fin)) return ['boss', 2];
      return [LV.run ? LV.run.theme : 'castle', ae ? 1 : 0];
    }
  }
  return ['menu', 0];
}
function musicTick() {
  const [id, lvl] = musWant();
  if (id !== MUS.want) {
    MUS.want = id;
    musStart(id);
  } else if (MUS.cur && MUS.cur.done) musStart(MUS.cur.song.then); // a jingle played through: what comes after it
  MUS.lvl = lvl;
  const P = MUS.cur,
    now = AC.currentTime;
  MUS.old = MUS.old.filter(o => (now > o.end ? (o.g.disconnect(), false) : true));
  // the volume: the Music setting, quieter while paused
  const want = (SET.mus === undefined ? 0.6 : SET.mus) * 0.5 * (paused || SHOWN === 's-pause' ? 0.35 : 1);
  AUD.mus.gain.setTargetAtTime(want, now, 0.1);
  if (!P || !P.song) return;
  if (P.t < now) P.t = now + 0.02; // after the page was in the background
  const sd = 60 / P.song.bpm / (P.song.div || 4),
    len = P.song.prog.length * (P.song.beats || 4) * (P.song.div || 4);
  while (P.t < now + 0.2 && !P.done) {
    playStep(P, lvl);
    P.t += sd;
    P.step++;
    if (P.song.once && P.step >= len) P.done = true;
  }
}
// ===== BACKGROUND SOUND (per place) =====
const AMBS = { src: null, f: null, g: null, look: null, t: 0 };
// what each place sounds like: wind (filtered noise, rising and falling), waves, a hum; and little events
const AMB_LOOK = {
  woods: { bed: ['bandpass', 500, 0.04, 0.08], ev: 'bird' },
  meadow: { bed: ['bandpass', 600, 0.05, 0.1], ev: 'bird' },
  jungle: { bed: ['bandpass', 3500, 0.02, 0.4], ev: 'bird' },
  castle: { bed: ['lowpass', 300, 0.05, 0.1], ev: 'crackle' },
  sewer: { bed: ['lowpass', 250, 0.05, 0.1], ev: 'drip' },
  cave: { bed: ['lowpass', 220, 0.05, 0.1], ev: 'drip' },
  beach: { bed: ['lowpass', 700, 0.1, 0.06], ev: 'gull' },
  ship: { bed: ['lowpass', 600, 0.09, 0.06], ev: 'creak' },
  slope: { bed: ['bandpass', 800, 0.08, 0.12], ev: null },
  peak: { bed: ['bandpass', 900, 0.1, 0.15], ev: null },
  base: { bed: ['lowpass', 120, 0.06, 0.02], ev: 'beep' },
  rocket: { bed: ['lowpass', 90, 0.1, 0.02], ev: 'beep' },
  moon: { bed: ['lowpass', 150, 0.04, 0.05], ev: null },
  ash: { bed: ['bandpass', 700, 0.08, 0.12], ev: 'rumble' },
  crater: { bed: ['lowpass', 200, 0.09, 0.05], ev: 'bubble' }
};
function ambLook() {
  if (state !== 'play' || !MODE || MODE.id !== 'level' || !LV) return null;
  if (LV.run) {
    const s = segAt(CAM.x + W / 2);
    return s && BIOMES[s.b] ? BIOMES[s.b].look : null;
  }
  return 'woods';
}
function ambEvent(k, t) {
  const o = AUD.amb,
    r = Math.random();
  if (k === 'bird') {
    const f = 2200 + r * 1600;
    for (let i = 0; i < 2 + ((r * 3) | 0); i++) sweep(t + i * 0.09, f, f * (1.2 + r * 0.3), 0.07, 0.05, 'sine', o);
  } else if (k === 'gull') {
    sweep(t, 1400, 900, 0.25, 0.04, 'triangle', o);
    sweep(t + 0.3, 1300, 850, 0.25, 0.03, 'triangle', o);
  } else if (k === 'drip') sweep(t, 1500 + r * 900, 700, 0.08, 0.06, 'sine', o);
  else if (k === 'crackle') for (let i = 0; i < 4; i++) nz(t + Math.random() * 0.2, 0.02, 0.05, 'highpass', 2500, o);
  else if (k === 'creak') sweep(t, 180, 140, 0.5, 0.05, 'sawtooth', filt('lowpass', 500, o));
  else if (k === 'beep') ping(t, r < 0.5 ? 1320 : 880, 0.12, 0.02, 'square', o);
  else if (k === 'rumble') sweep(t, 60, 40, 1.2, 0.12, 'sine', o);
  else if (k === 'bubble') for (let i = 0; i < 3; i++) sweep(t + i * 0.08, 120 + Math.random() * 80, 260, 0.07, 0.07, 'sine', o);
}
function ambTick() {
  const look = ambLook(),
    def = look && AMB_LOOK[look],
    now = AC.currentTime,
    want = def ? SET.vol * 0.9 * (paused ? 0.3 : 1) : 0;
  AUD.amb.gain.setTargetAtTime(want, now, 0.4);
  if (look !== AMBS.look) {
    AMBS.look = look;
    if (AMBS.src) {
      const g = AMBS.g;
      g.gain.setTargetAtTime(0, now, 0.3);
      const s = AMBS.src;
      setTimeout(() => {
        try {
          s.stop();
          g.disconnect();
        } catch (e) {}
      }, 1500);
      AMBS.src = null;
    }
    if (def) {
      const [type, f, v] = def.bed;
      AMBS.src = AC.createBufferSource();
      AMBS.src.buffer = AUD.nb;
      AMBS.src.loop = true;
      AMBS.g = AC.createGain();
      AMBS.g.gain.value = 0;
      AMBS.f = filt(type, f, AMBS.g, 0.7);
      AMBS.src.connect(AMBS.f);
      AMBS.g.connect(AUD.amb);
      AMBS.src.start();
    }
  }
  if (!def) return;
  // the bed rises and falls (gusts, waves)
  const [, f, v, sw] = def.bed,
    w = 0.5 + 0.5 * Math.sin(now * (look === 'beach' || look === 'ship' ? 0.9 : 0.35)) * Math.sin(now * 0.13 + 1);
  AMBS.g.gain.setTargetAtTime(v * (1 - sw + sw * 2 * w), now, 0.3);
  AMBS.f.frequency.setTargetAtTime(f * (0.8 + 0.4 * w), now, 0.3);
  if (def.ev && Math.random() < 0.006) ambEvent(def.ev, now + 0.02);
}
// ===== SOUNDS THAT FOLLOW THE SCREEN =====
// Footsteps, landings, knockouts and the bosses' voices, noticed from the fighters each frame (so the game itself
// doesn't need to know about them). Speech bubbles babble.
const SNDW = new WeakMap();
let lastSay = null;
function sndTick() {
  if (SET.vol <= 0 || !(state === 'play' || state === 'train')) return;
  const now = AC.currentTime;
  for (const f of [...PL, ...E]) {
    let m = SNDW.get(f);
    if (!m) SNDW.set(f, (m = { air: false, step: 0, ko: !!f.dying, vy: 0 }));
    if (f.st === 'cine' || f.hide) continue;
    const air = f.y < f.gy - 2,
      big = f.s || 1;
    if (m.air && !air && m.vy > 4) {
      // landing: a thud, heavier for big fighters and hard falls
      sweep(now, 110 / Math.sqrt(big), 60, 0.12, Math.min(0.18, 0.03 + m.vy * 0.008) * SET.vol, 'sine', AC.destination);
      if (m.vy > 10) nz(now, 0.08, 0.04 * SET.vol, 'lowpass', 600, AC.destination);
    }
    if (!air && f.pl && f.st === 'free' && Math.abs(f.vx) > 1.5) {
      m.step += Math.abs(f.vx);
      if (m.step > 52) {
        m.step = 0;
        nz(now, 0.035, 0.035 * SET.vol, 'bandpass', 900 + Math.random() * 400, AC.destination, 1.5);
      }
    }
    if (!f.pl && f.dying && !m.ko) {
      // an enemy knocked out: a little "oof", lower for the big ones
      const p = 320 / Math.sqrt(big);
      sweep(now, p, p * 0.55, 0.16, 0.05 * SET.vol, 'square', filt('lowpass', 1400, AC.destination));
    }
    m.ko = !!f.dying;
    m.air = air;
    m.vy = f.vy;
  }
  const say = LV && LV.say;
  if (say && say !== lastSay) babble(say.txt, say.e);
  lastSay = say;
}
// gibberish talk for a speech bubble: blips that rise and fall, deeper for a bigger speaker
function babble(txt, e) {
  const now = AC.currentTime,
    n = Math.min(14, Math.ceil(String(txt).length / 3)),
    base = 260 / Math.sqrt((e && e.s) || 1),
    out = filt('lowpass', 1800, AC.destination);
  for (let i = 0; i < n; i++) {
    const f = base * (0.85 + Math.random() * 0.5);
    osc(now + i * 0.075, f, 0.05, 0.05 * SET.vol, 'square', out, 0.005, 0.02);
  }
}
// Menu sounds: a tap on any button, a soft tick when a controller or keys move the highlight, a stamp
function uiTap(kind) {
  if (SET.vol <= 0 || !AC || AC.state !== 'running') return;
  const now = AC.currentTime,
    o = AC.destination,
    v = SET.vol;
  if (kind === 'move') ping(now, 1500, 0.04, 0.025 * v, 'sine', o);
  else if (kind === 'stamp') (nz(now, 0.09, 0.12 * v, 'lowpass', 900, o), sweep(now, 180, 90, 0.12, 0.12 * v, 'sine', o));
  else (ping(now, 880, 0.07, 0.04 * v, 'triangle', o), ping(now + 0.04, 1320, 0.06, 0.025 * v, 'triangle', o));
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('button');
  if (b && !b.disabled) uiTap(b.classList.contains('pready') ? 'stamp' : 'tap');
});
let uiMoveT = 0;
document.addEventListener('focusin', e => {
  if (!e.target.closest || !e.target.closest('#ui') || performance.now() - uiMoveT < 60 || audPointer) return;
  uiMoveT = performance.now();
  uiTap('move');
});
let audPointer = false;
addEventListener('pointerdown', () => (audPointer = true), { passive: true, capture: true });
addEventListener('keydown', () => (audPointer = false), { passive: true, capture: true });
// Each frame (main.js): music, background sound, and the sounds that follow the screen
function audioTick() {
  if (!AUD.on || !AC || AC.state !== 'running') return;
  try {
    musicTick();
    ambTick();
    sndTick();
  } catch (e) {}
}
