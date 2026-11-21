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
    trans = [];
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
    const c = { id: B.look + ch.length, x0: x, w, dusk: 0, flies: 0, props, biome: bi, ...extra };
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
      sign = chunk(B, bi, 900, [
        { k: 'sign', x: 300, t: B.name },
        ...scatter(B, 900, 3),
        ...(prev && prev.k === 'pipe' ? [{ k: 'trans-pipeout', x: 120 }] : [])
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
      const at = Math.round(w * (0.45 + R() * 0.15)),
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
        fits = Object.keys(TRANSITIONS).filter(k => {
          const nd = TRANSITIONS[k].needs;
          return !nd || nd.includes(bid) || nd.includes(nb);
        }),
        k = fits[ri(0, fits.length - 1)],
        T_ = TRANSITIONS[k],
        c = chunk(B, bi, k === 'rope' ? 600 : 900, [...scatter(B, 480, 2), { k: 'trans-' + k, x: 600 }]),
        t = { k, from: bid, to: nb, x: c.x0 + 600, done: 0 };
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
  PL.forEach((p, i) => {
    p.x = tr.nx + 220 - i * 60;
    p.gy = G;
  });
}
const ease = t => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
function cineTick() {
  const c = LV.cine,
    t = ++c.t,
    ps = PL.filter(p => p.st === 'cine');
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
    if (t === 62) {
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
  } else {
    e.y = -280;
    e.vy = 0;
    cineStart('jump', { e, line: ne.line });
  }
}
// Speech bubble over whoever is talking (world space, drawn by render.js after the fighters)
function drawSay() {
  const s = LV && LV.say;
  if (!s || !s.e || s.e.gone) return;
  const e = s.e,
    // beside the head, kept on screen (big bosses are taller than the screen allows above them)
    x = Math.max(CAM.x + 230, Math.min(CAM.x + W - 230, e.x - 40)),
    y = Math.max(168, e.y - 80 * e.s - 70),
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
