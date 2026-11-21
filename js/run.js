// StickFighters: Campaign runs: a theme (data/themes.js) generated from a seed into one long level that level.js
// plays, with transitions between biomes and boss intros played as short scenes (LV.cine) inside the simulation.
// Everything here is deterministic: the layout comes from its own random stream seeded by the run's seed, and the
// scenes move fighters by frame count, so every device online sees the same run.
// ===== GENERATOR =====
// A separate random stream for the layout, so building a run never shifts the fight's random numbers
function runRng(seed) {
  let s = (seed ^ 0x5bd1e995) >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// The catapult's arm angle at scene frame t (0 = at rest; the bucket end is down low so you can hop in): pulled
// down a little more from 45, then flung from 62 until the bucket is up high (where the riders let go, at 67)
const catArm = t => (t < 45 ? 0.5 : t < 62 ? 0.5 + ((t - 45) / 17) * 0.15 : Math.max(-1.3, 0.65 - (t - 62) * 0.4));
// Where the middle of the catapult's bucket is at scene frame t (the scene puts the riders there)
function catBucket(x, t) {
  const r = -catArm(t),
    lx = -108,
    ly = -14;
  return [x + lx * Math.cos(r) - ly * Math.sin(r), G + 6 - 84 + lx * Math.sin(r) + ly * Math.cos(r)];
}
// Transitions that leave something at the start of the next biome (its prop 'trans-<k>out' at this x)
const OUTS = { pipe: 120, balloon: 300, gondola: 200, landing: 300 };
// Builds a run: the same shape as buildLevel() (level.js) plus segs (one per biome), trans (transitions) and run.
function genRun(themeId, seed) {
  const th = THEMES[themeId],
    R = runRng(seed),
    ri = (a, b) => a + Math.floor(R() * (b - a + 1)),
    pickW = w => {
      // w: [[item, weight]] or { item: weight }
      const e = Array.isArray(w) ? w : Object.entries(w),
        tot = e.reduce((t, [, n]) => t + n, 0);
      let r = R() * tot;
      for (const [k, n] of e) if ((r -= n) < 0) return k;
      return e[e.length - 1][0];
    },
    ch = [],
    encs = [],
    gates = [],
    segs = [],
    trans = [],
    ramps = [],
    terr = { s: [], w: [] };
  let x = 0;
  // scenery for a chunk: a few props spread across it
  const scatter = (B, w, n) => {
    const props = [];
    for (let i = 0; i < n; i++) {
      const k = pickW(B.props),
        px = Math.round(((i + 0.2 + R() * 0.6) * w) / n);
      props.push({ k, x: px, s: Math.round((0.8 + R() * 0.5) * 100) / 100 });
    }
    return props;
  };
  const chunk = (B, bi, w, props, extra) => {
    const c = { id: B.look + ch.length, look: B.look, x0: x, w, dusk: 0, flies: 0, props, biome: bi, ...extra };
    ch.push(c);
    x += w;
    return c;
  };
  th.biomes.forEach((bid, bi) => {
    const B = BIOMES[bid],
      seg = { b: bid, x0: x, x1: 0 },
      last = bi === th.biomes.length - 1,
      base = B.mix[0].at,
      n = B.fights + 2;
    segs.push(seg);
    // light over the biome (the woods go from morning to dusk)
    const light = i => (B.dusk ? B.dusk[0] + ((B.dusk[1] - B.dusk[0]) * i) / (n - 1) : 0);
    // 1. the biome's sign (and the pipe you pop out of, after a pipe slide)
    const prev = trans[trans.length - 1],
      sign = chunk(B, bi, B.climb ? 1400 : 900, [
        { k: 'sign', x: 300, t: B.name },
        ...scatter(B, 900, 3),
        // where the last scene lands you: the pipe you pop out of, the balloon or gondola station you arrive at
        ...(prev && OUTS[prev.k] ? [{ k: 'trans-' + prev.k + 'out', x: OUTS[prev.k] }] : [])
      ]);
    sign.dusk = light(0);
    // 2. the fights
    for (let k = 0; k < B.fights; k++) {
      const w = ri(B.w[0], B.w[1]),
        lvl = base + Math.floor(k / 2),
        mix = B.mix.filter(m => m.at <= lvl).pop() || B.mix[0],
        count = Math.min(8, 3 + Math.floor(k / 2) + bi),
        list = [];
      for (let i = 0; i < count; i++) list.push(pickW(mix.w));
      if (k === B.fights - 1 && !last) list.push('c'); // a Captain closes each biome
      const c = chunk(B, bi, w, scatter(B, w, ri(4, 6)));
      c.dusk = light(k + 1);
      c.flies = c.dusk > 0.6 ? 1 : 0;
      // on a climb, each fight's ledge is near the start of its chunk and the rest of the chunk goes uphill
      const at = B.climb ? Math.round(560 + R() * 120) : Math.round(w * (0.45 + R() * 0.15)),
        e = {
          x: c.x0 + at,
          lock: Math.max(0, c.x0 + at - W / 2),
          lvl,
          max: 3 + Math.min(2, bi),
          list,
          st: 0,
          q: []
        };
      if (B.mini && R() < B.mini.chance) {
        e.mini = B.mini.t;
        e.line = B.mini.lines[ri(0, B.mini.lines.length - 1)];
      }
      encs.push(e);
    }
    // the slopes of a climb: uphill from a screen into the biome to each fight's ledge, and on after it (drawing only;
    // starting a screen in keeps the slope out of view while the last biome's scenery still shows)
    if (B.climb) {
      const up = [];
      let s0 = sign.x0 + 900;
      for (const e of encs.slice(-B.fights)) {
        if (e.lock - 60 > s0) up.push([s0, e.lock - 60]);
        s0 = e.lock + W + 60;
      }
      if (x > s0) up.push([s0, x]);
      // in pieces of up to 200 px, each a little steeper the farther into the biome, with a small wobble
      const [k0, k1] = B.climb,
        a = up[0][0],
        b = up[up.length - 1][1];
      for (const [u0, u1] of up)
        for (let p = u0; p < u1; p += 200) {
          const q = Math.min(u1, p + 200),
            n = ramps.length;
          ramps.push({ x0: p, x1: q, k: k0 + ((k1 - k0) * ((p + q) / 2 - a)) / (b - a) + ((n * 7) % 5 - 2) * 0.006 });
        }
    }
    // 3. the main boss (last biome), or a transition into the next biome
    if (last) {
      const c = chunk(B, bi, 1300, scatter(B, 1300, 4)),
        at = 650,
        bs = th.boss;
      encs.push({
        x: c.x0 + at,
        lock: c.x0 + at - W / 2,
        lvl: base + 3,
        max: 5,
        list: bs.adds.slice(),
        st: 0,
        q: [],
        boss: bs.t,
        intro: bs.intro,
        line: bs.lines[ri(0, bs.lines.length - 1)]
      });
      chunk(B, bi, 700, [{ k: 'arch', x: 420, t: th.name + ' CLEAR' }]);
      seg.x1 = x;
    } else {
      const nb = th.biomes[bi + 1],
        fits = (th.trans || Object.keys(TRANSITIONS)).filter(k => {
          const nd = TRANSITIONS[k].needs;
          return !nd || nd.includes(bid) || nd.includes(nb);
        }),
        k = fits[ri(0, fits.length - 1)],
        T_ = TRANSITIONS[k],
        at = T_.tower ? 1110 : 600,
        c = chunk(B, bi, k === 'rope' ? 600 : T_.tower ? 1500 : 900, [
          ...scatter(B, 460, 2),
          { k: 'trans-' + k, x: at }
        ]),
        t = { k, from: bid, to: nb, x: c.x0 + at, done: 0 };
      if (T_.tower) {
        // the launch tower: platforms to jump up (each about half a jump higher), then the top deck by the rocket.
        // Walls under the deck and at the rocket keep you from walking (or falling) in under it.
        const o = c.x0;
        terr.s.push(
          { x1: o + 480, x2: o + 620, y1: G - 100, y2: G - 100 },
          { x1: o + 640, x2: o + 740, y1: G - 210, y2: G - 210 },
          { x1: o + 480, x2: o + 620, y1: G - 320, y2: G - 320 },
          { x1: o + 700, x2: o + 1055, y1: G - 430, y2: G - 430 }
        );
        terr.w.push({ x: o + 750, y1: G - 425, y2: G }, { x: o + 1058, y1: G - 700, y2: G });
        t.top = G - 430;
        t.deck = o + 760;
      }
      if (k === 'gate') gates.push({ k: 'door', x: t.x, hp: T_.hp, max: T_.hp, hit: 0, to: nb });
      // the gap between the biomes: a chasm for the rope, an unseen stretch for scenes that fly or slide you there
      x += T_.gap;
      seg.x1 = k === 'rope' ? t.x : x;
      t.nx = x; // where the next biome starts
      trans.push(t);
    }
  });
  return {
    id: 'run:' + themeId,
    def: { name: th.name, num: 0, theme: themeId, next: 'A new ' + th.name + ' run (a new seed)' },
    ch,
    encs,
    gates,
    segs,
    trans,
    ramps: ramps.length ? ramps : null,
    terr: terr.s.length ? terr : null,
    run: { theme: themeId, seed },
    len: x,
    cp: -1,
    t: 0,
    go: 0
  };
}
// The biome segment at world x
const segAt = x => (LV.segs ? LV.segs.find(s => x < s.x1) || LV.segs[LV.segs.length - 1] : null);
function startRun(themeId) {
  closePanels();
  newSeed();
  init();
  LV = genRun(themeId, curSeed);
  levelSim();
  paused = false;
  releaseAll();
  show(null);
  // the run opens with every player being drawn in by the pencil
  for (const p of PL) p.draw = 0;
  cineStart('drawin');
  bn(LV.def.name);
}
// Play the same level again: a campaign run gets a new run (new seed), a fixed level starts over
function replayLevel() {
  if (LV && LV.run) startRun(LV.run.theme);
  else startLevel(LV ? LV.id : 'woods1');
}
// A biome is behind you: it counts as done for anything tied to it (the Wooded Trail's Ranger Hat)
function biomeDone(bid) {
  const p = BIOMES[bid].prog;
  if (p && !SELFTESTING && !(PROG[p] && PROG[p].done)) {
    PROG[p] = { ...(PROG[p] || {}), done: 1 };
    save();
  }
}
// The next transition not yet passed, if any
const nextTrans = () => (LV.trans ? LV.trans.find(t => !t.done) : null);
// ===== SCENES (LV.cine): transitions and boss intros. Players ride them; nothing else moves. =====
function cineStart(k, o) {
  LV.cine = { k, t: 0, ...o };
  for (const p of PL)
    if (k !== 'jump' && p.st !== 'dead') {
      p.st = 'cine';
      p.att = null;
      p.vx = p.vy = 0;
      p.sx = p.x;
      p.sy = p.y;
    }
  LV.cine.ps = PL.filter(p => p.st === 'cine');
}
function cineEnd() {
  const c = LV.cine;
  LV.cine = null;
  // nobody keeps a pencil sketch once a scene is over
  for (const f of [...PL, ...E]) f.draw = f.ink = undefined;
  for (const p of PL) {
    p.hide = 0;
    if (p.st === 'cine') p.st = 'free';
  }
  if (c.k === 'drawin') bn(BIOMES[LV.segs[0].b].name);
  if (c.tr) {
    c.tr.done = 1;
    biomeDone(c.tr.from);
    bn(BIOMES[c.tr.to].name);
  }
  LV.go = 160;
}
// Puts players (and the camera) at the start of the next biome
function cineArrive(tr) {
  CAM.x = tr.nx;
  CAM.y = 0;
  CAM.z = 1;
  PL.forEach((p, i) => {
    p.x = tr.nx + 220 - i * 60;
    p.gy = G;
    p.surf = null;
  });
}
const ease = t => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
function cineTick() {
  const c = LV.cine,
    t = ++c.t,
    // the players in the scene, fixed when it starts: one who hops out early keeps their place in the order
    ps = c.ps && c.ps.length ? c.ps : PL.filter(p => p.st === 'cine');
  if (c.k === 'drawin') {
    // the run's opening: the pencil draws each player in turn, then they fill with colour
    PL.forEach((p, i) => {
      const s0 = 12 + i * 26;
      if (p.draw === undefined) return;
      p.draw = Math.max(0, Math.min(1, (t - s0) / 70));
      p.ink = Math.max(0, Math.min(1, (t - s0 - 70) / 20));
      if (t % 6 === 0 && p.draw > 0 && p.draw < 1) sfx(1800 + (t % 24) * 40, 0.03, 'triangle', 0.015);
      if (p.ink >= 1) {
        p.draw = p.ink = undefined;
        ring(p.x, p.y - 45, 40);
        sfx(520 + i * 80, 0.15, 'square', 0.05, 300);
      }
    });
    if (t >= 12 + PL.length * 26 + 110) cineEnd();
  } else if (c.k === 'catapult' || c.k === 'cannon') {
    // the catapult flings everyone out of its bucket; the cannon is loaded with everyone and fires them
    const tr = c.tr,
      can = c.k === 'cannon',
      bx = can ? tr.x - 70 : tr.x - 46;
    if (!can) {
      // the catapult: everyone hops into the bucket and rides it as the arm is pulled back and flung, then flies
      ps.forEach((p, i) => {
        const [kx, ky] = catBucket(tr.x, t),
          ox = (i - (ps.length - 1) / 2) * 12,
          oy = 28 - (i % 2) * 5;
        if (t <= 40) {
          const a = ease(Math.max(0, Math.min(1, (t - i * 4) / 30)));
          p.x = p.sx + (kx + ox - p.sx) * a;
          p.y = p.sy + (ky + oy - p.sy) * a - Math.sin(a * Math.PI) * 60;
          p.pose = [...TUCK];
        } else if (t <= 66) {
          p.x = kx + ox;
          p.y = ky + oy;
        } else if (t === 67) {
          p.vx = 7 + i * 0.6;
          p.vy = -24 - i;
        }
        if (t >= 67 && t < 100) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.55;
          p.pose[9] = (p.pose[9] + 24) % 360;
        }
        p.face = 1;
      });
      if (t === 62) {
        sfx(120, 0.4, 'sawtooth', 0.08, 500);
        noise(0.3, 0.1, 500);
        shake = Math.max(shake, 6);
      }
    } else
    ps.forEach((p, i) => {
      if (t <= 40) {
        // climb in
        const a = ease(t / 40);
        p.x = p.sx + (bx - 10 + i * 10 - p.sx) * a;
        p.y = p.sy + (G - 64 - p.sy) * a - Math.sin(a * Math.PI) * 40;
        p.pose = [...TUCK];
        if (can && a >= 1) p.hide = 1;
      } else if (t === 62) {
        if (can) {
          p.hide = 0;
          p.x = tr.x + 60;
          p.y = G - 90;
        }
        p.vx = (can ? 9 : 7) + i * 0.6;
        p.vy = (can ? -20 : -24) - i;
      } else if (t > 62 && t < 100) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.55;
        p.pose[9] = (p.pose[9] + 24) % 360;
      }
    });
    if (t === 62 && can) {
      sfx(can ? 70 : 120, 0.4, 'sawtooth', 0.08, 500);
      noise(can ? 0.5 : 0.3, can ? 0.16 : 0.1, can ? 200 : 500);
      shake = Math.max(shake, can ? 12 : 6);
      if (can) {
        ring(tr.x + 70, G - 90, 60);
        dust(tr.x + 70, G - 90, 10);
      }
    }
    if (t === 100) {
      cineArrive(tr);
      ps.forEach((p, i) => {
        p.y = -220 - i * 60;
        p.vx = 1.5;
        p.vy = 4;
        p.pose[9] = 0;
        p.st = 'free';
      });
    }
    if (t >= 150) cineEnd();
  } else if (c.k === 'pipe') {
    const tr = c.tr,
      px = tr.x;
    ps.forEach((p, i) => {
      const s0 = 20 + i * 10;
      if (t <= 20) p.x = p.sx + (px - 90 - i * 20 - p.sx) * ease(t / 20);
      else if (t > s0 && t <= s0 + 26) {
        // hop up and drop into the pipe
        const a = (t - s0) / 26,
          x0 = px - 90 - i * 20;
        p.x = x0 + (px - x0) * a;
        p.y = G - Math.sin(Math.min(1, a * 1.25) * Math.PI * 0.85) * 150 + (a > 0.8 ? (a - 0.8) * 300 : 0);
        p.pose = [...TUCK];
        if (a > 0.85 && !p.hide) {
          p.hide = 1;
          sfx(500 - i * 40, 0.15, 'square', 0.05, -300);
        }
      }
    });
    if (t === 110) {
      cineArrive(tr);
      ps.forEach(p => {
        p.x = tr.nx + 120;
        p.y = G - 100;
        p.hide = 1;
      });
    }
    ps.forEach((p, i) => {
      if (t === 116 + i * 10) {
        // pop out of the pipe in the new biome
        p.hide = 0;
        p.st = 'free';
        p.vx = 5 - i;
        p.vy = -12;
        sfx(700, 0.12, 'square', 0.05, 300);
        ring(p.x, G - 100, 30);
      }
    });
    if (t >= 170) cineEnd();
  } else if (c.k === 'rope') {
    const tr = c.tr,
      gap = TRANSITIONS.rope.gap,
      ax = tr.x + gap / 2,
      ay = G - 250,
      L = 205;
    ps.forEach((p, i) => {
      const s0 = 24 + i * 22;
      if (t <= 24) {
        p.x = p.sx + (tr.x - 30 - i * 40 - p.sx) * ease(t / 24);
        p.y = G;
      } else if (t > s0 && t <= s0 + 50) {
        // swing across the chasm
        const a = -0.95 + 1.9 * ease((t - s0) / 50);
        p.x = ax + Math.sin(a) * L;
        p.y = ay + Math.cos(a) * L + 70;
        p.rope = 1;
        p.pose = [-10, 160, 10, 150, 10, 30, 40, -10, 30, 0];
        if (t === s0 + 1) sfx(300, 0.3, 'triangle', 0.05, 200);
      } else if (t === s0 + 51) {
        p.rope = 0;
        p.st = 'free';
        p.vx = 5;
        p.vy = -5;
      }
    });
    const xs = PL.filter(p => p.st !== 'dead').map(p => p.x);
    if (xs.length) CAM.x += (Math.min(...xs) - 120 - CAM.x) * 0.08;
    if (t >= 24 + PL.length * 22 + 80) {
      PL.forEach(p => {
        if (p.st === 'dead' || p.st === 'cine') {
          p.x = tr.nx + 160;
          p.st = p.st === 'dead' ? 'dead' : 'free';
        }
        p.rope = 0;
      });
      cineEnd();
    }
  } else if (c.k === 'balloon' || c.k === 'gondola') {
    // everyone climbs into the balloon's basket (or the gondola's cabin); it rises away, and comes down at the start
    // of the next biome, where everyone hops out. c.vx, c.vy = where the basket or cabin is now (render.js draws it)
    const tr = c.tr,
      gon = c.k === 'gondola',
      o = OUTS[c.k];
    if (t === 1) {
      c.vx = tr.x;
      c.vy = gon ? G - 70 : G;
    }
    if (t <= 36) {
      ps.forEach((p, i) => {
        const a = ease(t / 36),
          tx = c.vx - 16 + i * 11;
        p.x = p.sx + (tx - p.sx) * a;
        p.y = p.sy + (G - 10 - p.sy) * a - Math.sin(a * Math.PI) * 30;
        if (gon && a >= 1) p.hide = 1;
      });
    } else if (t <= 150) {
      // up and away (the gondola along its cable)
      const u = t - 36;
      c.vx = tr.x + (gon ? u * 5 : u * u * 0.025);
      c.vy = (gon ? G - 70 : G) - (gon ? u * 3.4 : u * u * 0.045);
      if (t === 40) sfx(gon ? 220 : 160, 0.5, gon ? 'square' : 'sine', 0.04, 120);
    } else if (t <= 230) {
      // in the next biome: down to the landing spot
      if (t === 151) cineArrive(tr);
      const a = ease((t - 150) / 80),
        lx = tr.nx + o,
        ly = gon ? G - 70 : G;
      c.vx = gon ? lx - (1 - a) * 400 : lx - (1 - a) * 160;
      c.vy = ly - (1 - a) * (gon ? 240 : 420);
    }
    if (t > 36 && t <= 230)
      ps.forEach((p, i) => {
        p.x = c.vx - 16 + i * 11;
        p.y = c.vy - (gon ? -60 : 10);
        p.vx = p.vy = 0;
      });
    if (t === 230) {
      shake = Math.max(shake, 4);
      dust(c.vx, G, 6);
      sfx(140, 0.2, 'triangle', 0.06);
    }
    ps.forEach((p, i) => {
      if (t === 240 + i * 10) {
        // hop out
        p.hide = 0;
        p.y = G - 10;
        p.st = 'free';
        p.vx = 4 + i * 0.5;
        p.vy = -10;
        sfx(600 + i * 60, 0.1, 'square', 0.04, 200);
      }
    });
    if (t >= 240 + PL.length * 10 + 30) cineEnd();
  } else if (c.k === 'climb') {
    // a ladder up the cliff: everyone climbs it in turn and out of sight, then pulls up at the start of the next biome
    const tr = c.tr,
      lx = tr.x + 34,
      top = 24 + PL.length * 22 + 110;
    ps.forEach((p, i) => {
      const s0 = 24 + i * 22;
      if (t <= 24) {
        p.x = p.sx + (lx - 40 - i * 30 - p.sx) * ease(t / 24);
        p.y = G;
      } else if (t > s0 && t < top) {
        p.x += (lx - p.x) * 0.3;
        p.y = Math.max(-200, G - (t - s0) * 4);
        const k = Math.sin((t - s0) * 0.35) * 30;
        p.pose = [0, 170 + k, 30, 190 - k, 30, 10 - k, 40, -10 + k, 40, 0];
        p.face = 1;
      }
    });
    if (t === top) {
      cineArrive(tr);
      ps.forEach(p => (p.hide = 1));
    }
    ps.forEach((p, i) => {
      if (t === top + 6 + i * 12) {
        // over the edge and onto the ground
        p.hide = 0;
        p.x = tr.nx + 120 + i * 40;
        p.y = G;
        p.st = 'free';
        p.vx = 2;
        p.vy = -11;
        dust(p.x, G, 4);
        sfx(500 + i * 50, 0.1, 'square', 0.04, 200);
      }
    });
    if (t >= top + 6 + PL.length * 12 + 40) cineEnd();
  } else if (c.k === 'launch') {
    // everyone boards the rocket by the top deck; a countdown; lift-off (c.ry = how high the rocket has gone)
    const tr = c.tr,
      dx = tr.x - 60,
      dy = tr.top;
    if (t === 1) c.ry = 0;
    if (t <= 40)
      ps.forEach((p, i) => {
        const a = ease((t - i * 4) / 30);
        p.x = p.sx + (dx - p.sx) * a;
        p.y = p.sy + (dy - p.sy) * a - Math.sin(a * Math.PI) * 40;
        if (a >= 1 && !p.hide) {
          p.hide = 1;
          sfx(700 + i * 50, 0.08, 'square', 0.04);
        }
      });
    if (t === 50 || t === 80 || t === 110) {
      txt(tr.x, tr.top - 120, String((140 - t) / 30), '#ffd400', 40);
      sfx(440, 0.15, 'square', 0.05);
    }
    if (t >= 140 && t < 240) {
      if (t === 140) {
        txt(tr.x, tr.top - 120, 'LIFT OFF!', '#ff7a00', 36);
        sfx(60, 1.2, 'sawtooth', 0.12, 200);
        noise(1, 0.14, 300);
      }
      const u = t - 140;
      c.ry = u * u * 0.06;
      shake = Math.max(shake, u < 40 ? 6 : 2);
      if (t % 3 === 0) dust(tr.x + (rnd() - 0.5) * 60, G, 3);
      // the camera follows it up, back to full size
      CAM.y += (Math.max(-500, -c.ry) - CAM.y) * 0.1;
      CAM.z += (1 - CAM.z) * 0.1;
    }
    if (t === 240) {
      cineArrive(tr);
      PL.forEach(p => (p.hide = 1));
    }
    ps.forEach((p, i) => {
      if (t === 250 + i * 10) {
        // aboard: step out into the rocket's corridor
        p.hide = 0;
        p.x = tr.nx + 160 + i * 40;
        p.y = G;
        p.st = 'free';
        ring(p.x, G - 45, 36);
        sfx(520 + i * 60, 0.1, 'square', 0.04, 200);
      }
    });
    if (t >= 250 + PL.length * 10 + 30) cineEnd();
  } else if (c.k === 'landing') {
    // everyone goes through the hatch; the rocket comes down on the moon, and out they step
    const tr = c.tr,
      lx = tr.nx + OUTS.landing;
    if (t <= 36)
      ps.forEach((p, i) => {
        const a = ease((t - i * 4) / 28);
        p.x = p.sx + (tr.x - p.sx) * a;
        if (a >= 1 && !p.hide) {
          p.hide = 1;
          sfx(500 - i * 30, 0.1, 'square', 0.04, -200);
        }
      });
    if (t === 60) {
      cineArrive(tr);
      PL.forEach(p => (p.hide = 1));
    }
    if (t >= 60 && t <= 170) {
      const a = ease((t - 60) / 110);
      c.lx = lx;
      c.ly = (1 - a) * -520;
      if (t % 4 === 0) sfx(90, 0.1, 'sawtooth', 0.03);
      if (t === 170) {
        dust(lx - 50, G, 8);
        dust(lx + 50, G, 8);
        shake = Math.max(shake, 8);
        sfx(70, 0.4, 'sine', 0.12);
      }
    }
    ps.forEach((p, i) => {
      if (t === 190 + i * 12) {
        p.hide = 0;
        p.x = lx - 70;
        p.y = G;
        p.st = 'free';
        p.vx = -3 - i;
        p.vy = -7;
        sfx(600 + i * 60, 0.1, 'square', 0.04, 200);
      }
    });
    if (t >= 190 + PL.length * 12 + 40) cineEnd();
  } else if (c.k === 'beam') {
    // a flying saucer comes over, beams the boss down, says something, and flies off
    const e = c.e;
    if (t === 1) {
      c.ux = CAM.x + W + 120;
      c.uy = 60;
    }
    if (t <= 60) {
      c.ux += (e.x - c.ux) * 0.1;
      e.hide = 1;
    } else if (t <= 150) {
      e.hide = 0;
      c.beam = 1;
      e.y = G - 300 + 300 * ease((t - 60) / 90);
      if (t % 10 === 0) sfx(900 + ((t / 10) % 3) * 200, 0.08, 'sine', 0.03);
    }
    if (t === 150) {
      c.beam = 0;
      e.y = G;
      ring(e.x, G - 40, 120);
      shake = Math.max(shake, 8);
      sfx(120, 0.5, 'sawtooth', 0.08, -40);
      LV.say = { e, txt: c.line, t };
      for (const p of PL) if (p.st === 'cine') p.st = 'free';
    }
    if (t > 170) {
      c.ux += (t - 170) * 0.6;
      c.uy -= (t - 170) * 0.25;
    }
    if (t >= 220) {
      e.st = 'free';
      e.inv = 0;
      e.cd = 40;
      LV.say = null;
      cineEnd();
    }
  } else if (c.k === 'jump') {
    // a mini-boss leaps in, lands with a quake that knocks everyone down, and says something
    const e = c.e;
    if (!c.land) {
      e.vy += 0.9;
      e.y += e.vy;
      if (e.y >= G) {
        e.y = G;
        e.vy = 0;
        c.land = t;
        ring(e.x, G, 220);
        ring(e.x, G, 120);
        dust(e.x - 60, G, 8);
        dust(e.x + 60, G, 8);
        shake = Math.max(shake, 16);
        camY += 8;
        sfx(50, 0.6, 'sine', 0.2);
        noise(0.4, 0.14, 200);
        for (const p of PL)
          if (p.st !== 'dead') {
            const dr = p.x < e.x ? -1 : 1;
            p.att = null;
            p.st = 'fly';
            p.vx = dr * 6;
            p.vy = -7;
            p.spv = dr * 12;
            p.sp = 0;
            p.inv = 90;
          }
        LV.say = { e, txt: c.line, t: t };
      }
    } else if (t - c.land >= 150) {
      e.st = 'free';
      e.inv = 0;
      e.cd = 30;
      LV.say = null;
      cineEnd();
    }
  } else if (c.k === 'pencil') {
    // everyone freezes while a pencil draws the boss in; then he comes to life
    const e = c.e;
    e.draw = Math.min(1, t / 120);
    e.ink = t < 120 ? 0 : Math.min(1, (t - 120) / 30);
    if (t % 6 === 0 && t < 120) sfx(1800 + (t % 24) * 40, 0.03, 'triangle', 0.015);
    if (t === 150) {
      e.draw = e.ink = undefined;
      ring(e.x, e.y - 80 * e.s, 160);
      ring(e.x, e.y - 80 * e.s, 90);
      shake = Math.max(shake, 12);
      sfx(80, 0.8, 'sawtooth', 0.12, -30);
      LV.say = { e, txt: c.line, t };
      for (const p of PL) if (p.st === 'cine') p.st = 'free';
    }
    if (t >= 210) {
      e.st = 'free';
      e.inv = 0;
      e.cd = 40;
      LV.say = null;
      cineEnd();
    }
  }
}
// A boss or mini-boss arrives as its fight starts (level.js calls this instead of dropping it in)
function bossArrive(ne) {
  const t = ne.boss || ne.mini,
    e = F(CAM.x + W * (ne.boss ? 0.68 : 0.64), t, 0);
  e.st = 'cine';
  e.face = -1;
  e.inv = 999; // can't be hit until the scene ends
  E.push(e);
  banner = null; // the speech bubble owns the top of the screen now
  if (ne.intro === 'pencil') {
    e.y = G;
    e.draw = 0;
    cineStart('pencil', { e, line: ne.line });
  } else if (ne.intro === 'beam') {
    e.y = G - 300;
    e.hide = 1;
    cineStart('beam', { e, line: ne.line });
  } else {
    e.y = -280;
    e.vy = 0;
    cineStart('jump', { e, line: ne.line });
  }
}
// The moving basket or cabin of a balloon or gondola ride (world space, drawn over the riders so it hides their legs)
function drawCine() {
  const c = LV && LV.cine;
  if (!c) return;
  if (c.k === 'balloon' && c.vx !== undefined) drawBalloon(c.vx, c.vy);
  else if (c.k === 'gondola' && c.vx !== undefined) drawGondolaCab(c.vx, c.vy);
  else if (c.k === 'launch' && c.ry !== undefined) drawRocket(c.tr.x, G + 6 - c.ry, c.ry > 0);
  else if (c.k === 'landing' && c.lx !== undefined) drawRocket(c.lx, G + 6 + c.ly, c.ly < 0);
  else if (c.k === 'beam' && c.ux !== undefined) drawSaucer(c.ux, c.uy, c.beam ? c.e : null);
  else if (c.k === 'catapult' && c.t < 100) drawCatBowl(c.tr.x, c.t);
}
// Speech bubble over whoever is talking (world space, drawn by render.js after the fighters)
function drawSay() {
  const s = LV && LV.say;
  if (!s || !s.e || s.e.gone) return;
  const e = s.e,
    // beside the head, kept on screen (big bosses are taller than the screen allows above them)
    x = Math.max(CAM.x + 230, Math.min(CAM.x + W - 230, e.x - 40)),
    y = Math.max(168, e.y + upAt(e.x) - 80 * e.s - 70),
    age = LV.cine ? LV.cine.t - s.t : 0;
  ctx.save();
  ctx.font = '900 20px "Trebuchet MS",sans-serif';
  const w = Math.min(420, ctx.measureText(s.txt).width + 34),
    h = 46,
    pop = age < 8 ? 0.5 + age / 16 : 1;
  ctx.translate(x, y);
  ctx.scale(pop, pop);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-w / 2, -h, w, h, 18);
  else ctx.rect(-w / 2, -h, w, h);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-14, -2);
  ctx.lineTo(4, 26);
  ctx.lineTo(12, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillRect(-12, -6, 22, 6);
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s.txt, 0, -h / 2, w - 20);
  ctx.restore();
}
