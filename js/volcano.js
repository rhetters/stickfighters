// StickFighters: the Volcano theme: its hazards (steam vents, falling lava rocks, pools of lava and the rising lava of
// the escape), its scenes (the geyser, the jump into the crater, the Pink Tiki bursting out of the lava, and his last
// stand), and its drawing (the jungle, the ashy slopes, the crater, their props, the rock ledges and the lava).
// The hazards are part of the game: they run in the simulation from the level clock and rnd(), never from drawing.
// The drawing never changes the game and uses Math.random() only for cosmetic effects.
// ===== HAZARDS =====
const VENT_T = 240, // a steam vent's cycle: it hisses (a warning), then blasts for a moment
  VENT_HISS = 70,
  VENT_BLAST = 18,
  ROCK_T = 75; // frames from a lava rock's glowing mark to it landing
// Hazards hurt enemies through the normal hit code, with nobody's name on the hit (no player's combo or stats)
const NATURE = { combo: 0, comboT: 0, meter: 0, x: 0, y: 0, vx: 0 };
function natHit(e, dmg, lift, dr) {
  NATURE.combo = 0;
  NATURE.x = e.x;
  NATURE.y = e.y;
  hurtE(e, { dmg, kb: 3, lift, ef: 'launch', pierce: 1, w: 'M' }, dr, null, NATURE);
}
// One step of the volcano's hazards (level.js, outside scenes). Other themes have none, and nothing here touches
// rnd() for them.
function hazTick(ae) {
  if (!LV.run) return;
  if (LV.haz && LV.haz.vents.length) ventTick();
  rockTick(ae);
  if (LV.esc) escTick(ae);
  if ((LV.haz && LV.haz.pools.length) || LV.esc) lavaTick();
}
// Steam vents: anyone standing on one when it blasts goes high into the air. Players ride it like a super jump;
// enemies are knocked flying (a little damage, never a knockout).
function ventTick() {
  for (const v of LV.haz.vents) {
    if (v.x < CAM.x - 60 || v.x > CAM.x + W + 60) continue;
    const ph = (LV.t + v.o) % VENT_T;
    if (ph < VENT_HISS || ph >= VENT_HISS + VENT_BLAST) continue;
    if (ph === VENT_HISS) sfx(160, 0.5, 'sawtooth', 0.04, 500);
    for (const f of [...PL, ...E]) {
      if (Math.abs(f.x - v.x) > 34 || f.y < G - 40 || (f.ventT || 0) > LV.t || f.gone || f.dying) continue;
      if (f.st === 'cine' || f.st === 'dead' || f.st === 'held' || f.st === 'grab') continue;
      f.ventT = LV.t + 40;
      if (f.pl) {
        if (f.st !== 'free' && f.st !== 'hurt') continue;
        f.st = 'free';
        f.att = null;
        f.vy = -19;
        f.surf = null;
        txt(f.x, f.y - 120, 'WHOOSH!', '#3ec5ff', 22);
      } else {
        if (f.hp <= 4) f.hp = 5; // a vent never knocks anyone out
        natHit(f, 4, -19, f.x < v.x ? -1 : 1);
      }
      dust(v.x, G, 6);
    }
  }
}
// Falling lava rocks (a fight in a biome with rocks): a glowing mark appears near a player, then the rock lands and
// hits everyone there
function rockTick(ae) {
  const on = ae && BIOMES[segAt(ae.x).b].rocks;
  if (!on && !LV.rk) return;
  const R = LV.rk || (LV.rk = { n: 100, list: [] });
  if (on && --R.n <= 0) {
    R.n = 90 + Math.floor(rnd() * 70);
    const al = PL.filter(p => p.st !== 'dead'),
      q = al[Math.floor(rnd() * al.length)];
    if (q) R.list.push({ x: Math.round(Math.max(WB.l + 40, Math.min(WB.r - 40, q.x + (rnd() - 0.5) * 220))), t: 0 });
  }
  for (const r of R.list)
    if (++r.t === ROCK_T) {
      for (const p of PL)
        if (p.st !== 'dead' && p.st !== 'cine' && Math.abs(p.x - r.x) < 46 && p.y > G - 70)
          hurtP(p, { dmg: 9, kb: 12 }, p.x < r.x ? -1 : 1);
      for (const e of E)
        if (!e.dying && !e.gone && e.st !== 'cine' && Math.abs(e.x - r.x) < 50 && e.y > G - 70)
          natHit(e, 12, -10, e.x < r.x ? -1 : 1);
      ring(r.x, G - 10, 70);
      dust(r.x - 20, G, 6);
      dust(r.x + 20, G, 6);
      for (let i = 0; i < 8; i++)
        fxp({
          k: 'c',
          x: r.x,
          y: G - 14,
          vx: (rnd() - 0.5) * 9,
          vy: -3 - rnd() * 5,
          a: 0,
          va: rnd() - 0.5,
          l: 40,
          m: 40,
          c: i % 2 ? '#ff7a00' : '#4a3a3e'
        });
      shake = Math.max(shake, 7);
      sfx(60, 0.35, 'sawtooth', 0.09, -30);
      noise(0.2, 0.1, 400);
    }
  R.list = R.list.filter(r => r.t < ROCK_T + 40);
  if (!on && !R.list.length) LV.rk = null;
}
// Lava (the pools on the crater floor, and the rising lava of the escape). It bounces anyone in it back out with a
// little damage. It never knocks a player out, and a knocked-out player it reaches is brought back up. Enemies can
// be finished off by it, and bodies sink into it.
function lavaTick() {
  const pools = LV.haz ? LV.haz.pools : [],
    L = LV.esc && LV.esc.on ? LV.esc : null;
  for (const f of [...PL, ...E]) {
    if (f.st === 'cine' || f.gone || f.left) continue;
    const deep = L && f.y >= L.y - 2,
      pool = !deep && f.gy >= G && f.y >= G - 3 && pools.some(p => f.x > p.x0 && f.x < p.x1);
    if (!deep && !pool) continue;
    const top = deep ? L.y : G;
    if (!f.pl && (f.dying || f.corpse)) {
      f.gone = 1; // sinks
      for (let i = 0; i < 4; i++)
        fxp({ k: 'd', x: f.x + (i - 1.5) * 10, y: top - 6, vx: 0, vy: -1.2, r: 5, l: 24, m: 24, c: '#cfc8d6' });
      continue;
    }
    if ((f.lavaT || 0) > LV.t) continue;
    f.lavaT = LV.t + 25;
    spark(f.x, top - 10, 24, '#ff7a00');
    sfx(240, 0.25, 'sawtooth', 0.05, -120);
    noise(0.15, 0.06, 1200);
    if (f.pl) {
      if (f.st === 'dead') {
        // brought back by the heat
        Object.assign(f, { st: 'free', hp: Math.round(f.max * 0.3), deadT: 0, rv: 0, inv: 90, sp: 0 });
        f.pose[9] = 0;
        txt(f.x, f.y - 120, 'HOT FOOT!', '#ff5a1f', 24);
      } else {
        const hd = Math.min(deep ? 10 : 6, Math.max(0, f.hp - 1));
        tally(f, 'taken', hd);
        f.hp -= hd;
        if (f.st === 'grab' && f.gt) {
          f.gt.st = 'hurt';
          f.gt.stun = 8;
          f.gt.held = null;
          f.gt = null;
        }
        f.st = 'free';
        txt(f.x, f.y - 120, 'HOT!', '#ff5a1f', 24);
      }
      f.att = null;
      f.lad = 0;
      f.surf = null;
      f.flash = 4;
      f.inv = Math.max(f.inv, 30);
      f.vx *= 0.3;
      f.vy = deep ? -21 : -17;
      f.y = Math.min(f.y, top - 1);
    } else {
      natHit(f, deep ? 14 : 8, deep ? -20 : -16, f.x < (WB.l + WB.r) / 2 ? 1 : -1);
      f.y = Math.min(f.y, top - 1);
    }
  }
}
// The boss's last stand (LEVEL.spare kept him at 1 health): everything stops, he has his say, ledges come out of the
// crater walls and the lava starts rising; he rides a lava spout up to the rim and waits there
function escapeStart(ae) {
  LV.escPend = 0;
  const b = ae && E.find(e => e.tk === ae.boss && !e.dying);
  if (!b) return;
  ae.q = [];
  b.bp = (BOSSPH[b.tk] || BOSSPH.c).length; // no more phases (or army calls) once his last stand starts
  for (const e of E)
    if (!e.dying && !e.gone) {
      e.st = 'cine';
      e.att = null;
      e.held = null;
    }
  for (const p of PL) p.gt = null;
  cineStart('tiki', { e: b, ae });
  banner = null;
}
// The rising lava once the escape is on: steadily, faster when it falls far behind the lowest player; more of the
// army comes down the ledges above you; and the boss has something to say to the first one up to the rim
function escTick(ae) {
  const L = LV.esc;
  if (!L.on) return;
  if (LV.say && LV.say.lt !== undefined && LV.t - LV.say.lt > 150) LV.say = null;
  if (LV.fin) {
    L.cool = Math.min(1, (L.cool || 0) + 0.01);
    return;
  }
  const al = PL.filter(p => p.st !== 'dead');
  if (!al.length) return;
  const low = Math.max(...al.map(p => p.y)),
    hi = Math.min(...al.map(p => p.y));
  L.y = Math.max(L.cap, L.y - (L.y - low > 300 ? 2.2 : 0.6));
  if (--L.sp <= 0) {
    L.sp = 220;
    const n = E.filter(x => !x.dying && !x.gone && !(ae && x.tk === ae.boss)).length,
      ups = L.s.filter(s => s.y1 < hi - 60 && s.y1 > L.top + 1);
    if (L.n < 8 && n < 2 + (PL.length >> 1) && ups.length) {
      const s = ups.reduce((a, b) => (b.y1 > a.y1 ? b : a)),
        m = F(Math.round((s.x1 + s.x2) / 2), rnd() < 0.6 ? 'g' : 'r', 0);
      m.y = s.y1 - 150;
      E.push(m);
      L.n++;
    }
  }
  if (!L.said && al.some(p => p.gy <= L.top + 1 && p.y >= p.gy - 2)) {
    L.said = 1;
    const b = ae && E.find(e => e.tk === ae.boss && !e.dying),
      top = THEMES[LV.run.theme].boss.escape.top;
    if (b) LV.say = { e: b, txt: top[L.pair % top.length], lt: LV.t };
  }
}
// ===== SCENES =====
function volcanoCine(c, t, ps) {
  if (c.k === 'geyser') {
    // everyone steps onto the giant vent; it rumbles, then blasts them up and over into the next biome
    const tr = c.tr;
    ps.forEach((p, i) => {
      if (t <= 30) {
        p.x = p.sx + (tr.x - 40 + i * 16 - p.sx) * ease(t / 30);
        p.y = G;
      } else if (t > 80 && t < 130) {
        if (t === 81) p.vy = -24 - i;
        p.vy += 0.35;
        p.y += p.vy;
        p.x += 2;
        p.pose = FLY.slice();
        p.pose[9] = (t - 80) * 14 * (i % 2 ? -1 : 1);
      }
    });
    if (t > 30 && t < 80) {
      shake = Math.max(shake, (t - 30) / 8);
      if (t % 8 === 0) sfx(70 + t, 0.15, 'sawtooth', 0.04);
    }
    if (t === 80) {
      ring(tr.x, G - 20, 140);
      ring(tr.x, G - 20, 80);
      shake = Math.max(shake, 16);
      sfx(200, 0.8, 'sawtooth', 0.09, 900);
      noise(0.6, 0.12, 600);
    }
    if (t === 130) {
      cineArrive(tr);
      ps.forEach((p, i) => {
        p.y = -260 - i * 50;
        p.vy = 0;
        p.pose[9] = 0;
      });
    }
    if (t > 130)
      ps.forEach(p => {
        if (p.st !== 'cine') return;
        p.vy += 0.7;
        p.y += p.vy;
        p.pose = FALL.slice();
        if (p.y >= G) {
          p.y = G;
          p.st = 'free';
          p.vx = 2;
          dust(p.x, G, 6);
          sfx(90, 0.2, 'sine', 0.08);
        }
      });
    if (t >= 130 && (t >= 260 || ps.every(p => p.st !== 'cine')) && t >= 175) cineEnd();
    return;
  }
  if (c.k === 'rim') {
    // at the crater's edge everyone jumps in, and drops onto the top ledge of the climb down
    const tr = c.tr,
      go = 30 + ps.length * 10 + 50,
      led = LV.terr.s[tr.land];
    ps.forEach((p, i) => {
      const j = 30 + i * 10;
      if (t <= 30) {
        p.x = p.sx + (tr.x - 20 - i * 26 - p.sx) * ease(t / 30);
        p.y = G;
        p.face = 1;
      } else if (t === j) {
        p.vy = -10;
        sfx(500 + i * 40, 0.1, 'square', 0.04, 200);
      } else if (t > j && t < go) {
        p.vy += 0.7;
        p.y += p.vy;
        p.x += 4;
        p.pose = p.vy < 0 ? JUMP.slice() : FALL.slice();
        if (p.y > G + 300) p.hide = 1;
      }
    });
    if (t === go) {
      cineArrive(tr);
      ps.forEach((p, i) => {
        p.hide = 0;
        p.x = led.x1 + 40 + i * 36;
        p.y = led.y1 - 360 - i * 30;
        p.vy = 3;
        p.gy = led.y1;
        p.surf = led;
      });
      CAM.y = Math.min(0, led.y1 - 110 - G - (70 - G));
    }
    if (t > go) {
      ps.forEach(p => {
        if (p.st !== 'cine') return;
        p.vy += 0.7;
        p.y += p.vy;
        p.pose = FALL.slice();
        if (p.y >= led.y1) {
          p.y = led.y1;
          p.vy = 0;
          p.st = 'free';
          dust(p.x, led.y1, 6);
          sfx(90, 0.2, 'sine', 0.08);
        }
      });
      levelCamUp(ownView() ? ps.filter(p => p.slot === NET.mySlot) : ps);
      if (t >= go + 70) cineEnd();
    }
    return;
  }
  if (c.k === 'erupt') {
    // the Tiki is under the lava: it bubbles and rumbles, then he bursts out and lands with a quake (the leap's end)
    if (t % 6 === 0) sfx(60 + (t % 30), 0.1, 'sawtooth', 0.04);
    shake = Math.max(shake, t / 15);
    if (t === 60) {
      const e = c.e;
      e.hide = 0;
      e.y = G - 1;
      e.vy = -24;
      c.k = 'jump';
      c.erupt = t;
      ring(e.x, G, 120);
      sfx(120, 0.7, 'sawtooth', 0.1, 400);
      for (const p of PL) if (p.st === 'cine') p.st = 'free';
    }
    return;
  }
  if (c.k === 'tiki') {
    // the last stand: everyone freezes, dizzy; he says his two lines; the lava rises and he rides it to the rim
    const e = c.e,
      X = c.ae.esc,
      pair = THEMES[LV.run.theme].boss.escape.lines[X.pair];
    if (t === 1) {
      shake = Math.max(shake, 14);
      ring(e.x, e.y - 60 * e.s, 160);
      sfx(90, 0.6, 'sawtooth', 0.1, -30);
      LV.say = { e, txt: pair[0], t };
    }
    // everyone frozen where they were settles onto their feet
    for (const f of [...ps, ...E])
      if (f.st === 'cine' && !f.dying && !(f === e && t >= 175)) {
        f.vx *= 0.85;
        phys(f);
        smooth(f, f.pl ? HURT : IDLE, 0.15);
        f.pose[9] *= 0.8;
        f.sp = 0;
        ragTick(f);
      }
    if (t === 100) LV.say = { e, txt: pair[1], t };
    if (t === 160) {
      LV.say = null;
      LV.esc = {
        on: 1,
        y: G + 40,
        cap: X.cap,
        top: X.top,
        perch: X.perch,
        s: X.s,
        pair: X.pair,
        grow: 0,
        n: 0,
        sp: 200,
        said: 0
      };
      terrainSet([...LV.terr.s, ...X.s], LV.terr.w);
      shake = Math.max(shake, 16);
      sfx(50, 1.2, 'sawtooth', 0.12, -20);
      noise(0.8, 0.14, 300);
      bn('THE LAVA IS RISING!');
    }
    if (LV.esc) LV.esc.grow = ease((t - 160) / 40);
    if (t === 175) {
      c.gx = e.x;
      c.gy = e.y;
      sfx(200, 0.8, 'sawtooth', 0.08, 700);
    }
    if (t > 175 && t <= 225) {
      const a = ease((t - 175) / 50);
      e.x = c.gx + (X.perch - c.gx) * a;
      e.y = c.gy + (X.top - c.gy) * a;
      e.pose = JUMP.slice();
      e.face = -1;
    }
    if (t === 225) {
      e.y = e.gy = X.top;
      e.surf = X.s[X.s.length - 1];
      e.vx = e.vy = 0;
      e.perch = 1;
      e.st = 'free';
      e.inv = 0;
      e.cd = 60;
      ring(e.x, e.y, 90);
    }
    if (t >= 240) {
      for (const f of E)
        if (f.st === 'cine') {
          f.st = 'free';
          f.cd = 30;
        }
      cineEnd();
      bn('CLIMB!');
    }
  }
}
// ===== DRAWING =====
LOOKS.jungle = { bg: () => drawJungle(), fg: () => drawWoodsFg() };
LOOKS.ash = { bg: () => drawAsh(), fg: () => drawAshFg() };
LOOKS.crater = { bg: () => drawCrater(), fg: () => drawAshFg(1) };
const LAVA = ['#ffd23f', '#ff9a1f', '#ff5a1f', '#d8341c'];
// World y to screen y in the background pass (the view can be raised and zoomed out over ledges)
const scrY = y => G + (y - G - CAM.y) * CAM.z;
// A volcano on the horizon: a cone with lava at its top running down, and a plume of smoke
function volcanoCone(x, by, k, a) {
  const h = 230 * k,
    w = 260 * k,
    tw = 46 * k;
  ctx.save();
  ctx.globalAlpha = a;
  // smoke rising and drifting (cosmetic, from the frame count)
  for (let i = 0; i < 6; i++) {
    const q = ((fr * 0.25 + i * 30) % 180) / 180,
      sx = x + Math.sin(i * 1.7 + q * 2) * 14 * k + q * 60 * k,
      sy = by - h - q * 170 * k,
      r = (16 + q * 36) * k;
    ctx.fillStyle = `rgba(150,140,150,${0.5 * (1 - q)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, 7);
    ctx.fill();
  }
  ctx.fillStyle = '#8c6a5c';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - w, by);
  ctx.lineTo(x - tw, by - h);
  ctx.quadraticCurveTo(x, by - h + 10 * k, x + tw, by - h);
  ctx.lineTo(x + w, by);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // lava at the top and two streams
  ctx.fillStyle = '#ff7a00';
  ctx.beginPath();
  ctx.moveTo(x - tw, by - h);
  ctx.quadraticCurveTo(x, by - h - 12 * k, x + tw, by - h);
  ctx.quadraticCurveTo(x, by - h + 12 * k, x - tw, by - h);
  ctx.fill();
  ctx.strokeStyle = '#ff7a00';
  ctx.lineWidth = 6 * k;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - tw * 0.5, by - h + 4);
  ctx.quadraticCurveTo(x - tw * 1.6, by - h * 0.55, x - tw * 2.4, by - h * 0.25);
  ctx.moveTo(x + tw * 0.4, by - h + 4);
  ctx.quadraticCurveTo(x + tw * 1.2, by - h * 0.6, x + tw * 1.9, by - h * 0.35);
  ctx.stroke();
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = 2 * k;
  ctx.stroke();
  ctx.restore();
}
// The Tiki Jungle: a warm sky, the volcano smoking far off, jungle behind, and grass
function drawJungle() {
  paperBg();
  skyWash('#ffbf8f', '#fff6e6', 0.45);
  volcanoCone(640 - CAM.x * 0.02, G - 20, 1, 0.55);
  // jungle (1/4 speed): trunks and big rounded leafy tops
  layer(0.25, 130, 211, (x, r) => {
    const h = 120 + r * 90;
    ctx.strokeStyle = 'rgba(110,90,70,0.45)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, G + 6);
    ctx.lineTo(x + 6, G - h + 30);
    ctx.stroke();
    ctx.fillStyle = r < 0.5 ? 'rgba(120,185,95,0.4)' : 'rgba(95,160,80,0.4)';
    ctx.strokeStyle = 'rgba(70,120,60,0.55)';
    ctx.lineWidth = 2.5;
    for (const [dx, dy, rr] of [
      [-30, 10, 40],
      [28, 6, 44],
      [0, -18, 50]
    ]) {
      ctx.beginPath();
      ctx.arc(x + 6 + dx, G - h + dy, rr * (0.8 + r * 0.4), 0, 7);
      ctx.fill();
      ctx.stroke();
    }
  });
  ctx.fillStyle = '#dbeac0';
  ctx.fillRect(-30, G + 6, W + 60, H);
  ctx.strokeStyle = '#8fbf6a';
  ctx.lineWidth = 2.5;
  layer(1, 41, 223, (x, r) => {
    const y = G + 16 + r * 50;
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo(x - 7, y - 8);
    ctx.moveTo(x, y);
    ctx.lineTo(x + 1, y - 11);
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 8, y - 7);
    ctx.stroke();
  });
  groundLine();
}
// The Ashy Slopes: the volcano close now, grey ash ground following the climb, a hazy orange sky
function drawAsh() {
  const cx = CAM.x,
    dy = Math.min(140, slopeRef * 0.12);
  paperBg();
  skyWash('#f2a37a', '#efe6e0', 0.5);
  volcanoCone(560 - cx * 0.03, G + 40 + dy * 0.5, 1.7, 0.5);
  // nearer dark ridges (1/3 speed), sinking a little as you climb
  layer(0.33, 280, 233, (x, r) => {
    const by = G + 30 + dy * 1.6;
    ctx.fillStyle = 'rgba(90,75,80,0.3)';
    ctx.strokeStyle = 'rgba(60,50,55,0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 200, by);
    ctx.lineTo(x - 50, by - 110 - r * 60);
    ctx.lineTo(x + 40, by - 80 - r * 40);
    ctx.lineTo(x + 200, by);
    ctx.fill();
    ctx.stroke();
  });
  const pts = [];
  for (let sx = -30; sx <= W + 30; sx += 15) pts.push([sx, G + 6 + upAt(cx + sx)]);
  ctx.fillStyle = '#c9c0bd';
  ctx.beginPath();
  ctx.moveTo(-30, H + 30);
  for (const [px, py] of pts) ctx.lineTo(px, py);
  ctx.lineTo(W + 30, H + 30);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(110,95,95,0.45)';
  ctx.lineWidth = 2;
  for (const d of [22, 50]) {
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py + d) : ctx.moveTo(px, py + d)));
    ctx.stroke();
  }
  // little glowing cracks in the ash
  ctx.strokeStyle = 'rgba(255,122,0,0.7)';
  ctx.lineWidth = 2;
  layer(1, 97, 239, (x, r) => {
    if (r < 0.55) return;
    const y = G + 24 + r * 40 + upAt(cx + x);
    ctx.beginPath();
    ctx.moveTo(x - 12, y);
    ctx.lineTo(x - 3, y - 4);
    ctx.lineTo(x + 4, y + 2);
    ctx.lineTo(x + 14, y - 3);
    ctx.stroke();
  });
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.stroke();
}
// Ash drifting down in front (the crater: glowing embers rising instead). Cosmetic, from the frame count.
function drawAshFg(up) {
  ctx.save();
  for (let i = 0; i < 26; i++) {
    const sp = 0.4 + hh(i * 7 + 3) * 0.6,
      u = hh(i * 13 + 1) * (W + 60) - CAM.x * 0.6 + Math.sin(fr * 0.02 + i) * 20,
      x = (((u % (W + 60)) + W + 60) % (W + 60)) - 30,
      y = up ? H - ((fr * sp + hh(i) * H) % (H + 40)) : ((fr * sp + hh(i) * H) % (H + 40)) - 20;
    ctx.fillStyle = up ? `rgba(255,${140 + (i % 3) * 30},40,0.7)` : 'rgba(110,100,105,0.45)';
    ctx.beginPath();
    ctx.arc(x, y, up ? 1.8 + (i % 3) * 0.6 : 2 + (i % 3), 0, 7);
    ctx.fill();
  }
  ctx.restore();
}
// The Crater: dark rock walls lit by lava from below; high above, the crater's mouth and the daylight
function drawCrater() {
  const z = CAM.z,
    top = scrY(G - 1250),
    g = ctx.createLinearGradient(0, top, 0, scrY(G));
  g.addColorStop(0, '#9a7a70');
  g.addColorStop(0.45, '#5e4040');
  g.addColorStop(1, '#3c2629');
  ctx.fillStyle = g;
  ctx.fillRect(-30, -30, W + 60, H + 60);
  // the crater's mouth: the sky above the rim, which curves up toward the sides
  if (top > -200) {
    const mx = W / 2 - ((CAM.x * 0.05) % 300) + 150,
      rim = x => top + 70 * z - Math.pow((x - mx) / (460 * z), 2) * 200 * z,
      pts = [];
    for (let x = -30; x <= W + 30; x += 20) pts.push([x, rim(x)]);
    const sky = ctx.createLinearGradient(0, top - 300 * z, 0, top + 70 * z);
    sky.addColorStop(0, '#9fcbea');
    sky.addColorStop(1, '#ffd9b0');
    ctx.fillStyle = sky;
    ctx.beginPath();
    ctx.moveTo(-30, -30);
    ctx.lineTo(W + 30, -30);
    for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    // smoke drifting out over the rim
    ctx.fillStyle = 'rgba(160,150,160,0.45)';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(mx - 220 * z + i * 140 * z, top - 40 * z + Math.sin(fr * 0.02 + i) * 8, 38 * z, 0, 7);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 0.12;
  const gx = -(CAM.x % 30);
  ctx.drawImage(gridC, gx, 0, W, H);
  ctx.drawImage(gridC, gx + W, 0, W, H);
  ctx.globalAlpha = 1;
  // rock strata on the walls (1/3 speed), with glowing cracks
  layer(0.33, 160, 251, (x, r) => {
    for (let j = 0; j < 4; j++) {
      const y = scrY(G - 120 - j * 300 - r * 120);
      if (y < -40 || y > H + 40) continue;
      ctx.strokeStyle = 'rgba(30,20,24,0.45)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x - 90, y);
      ctx.lineTo(x - 30, y - 14);
      ctx.lineTo(x + 20, y - 4);
      ctx.lineTo(x + 90, y - 18);
      ctx.stroke();
      if ((j + Math.floor(r * 10)) % 3 === 0) {
        ctx.strokeStyle = 'rgba(255,122,0,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 10, y + 6);
        ctx.lineTo(x - 2, y + 22);
        ctx.lineTo(x + 8, y + 30);
        ctx.stroke();
      }
    }
  });
  // the glow of the lava below
  const fy = scrY(G + 6),
    gl = ctx.createLinearGradient(0, fy, 0, fy - 320 * z);
  gl.addColorStop(0, 'rgba(255,110,30,0.35)');
  gl.addColorStop(1, 'rgba(255,110,30,0)');
  ctx.fillStyle = gl;
  ctx.fillRect(-30, fy - 320 * z, W + 60, 320 * z);
  // the floor: dark basalt with a glowing seam
  ctx.fillStyle = '#2f2226';
  ctx.fillRect(-30, fy, W + 60, H + 400);
  ctx.strokeStyle = 'rgba(255,122,0,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-30, fy + 14 * z);
  ctx.lineTo(W + 30, fy + 14 * z);
  ctx.stroke();
  ctx.strokeStyle = '#ffb27a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-30, fy);
  ctx.lineTo(W + 30, fy);
  ctx.stroke();
}
// A rock ledge (a platform, terrain.js): its top is the line you stand on. dx slides it (out of the wall, the escape).
function drawLedge(s, dx) {
  const x1 = s.x1 + dx,
    x2 = s.x2 + dx,
    y = s.y1,
    w = x2 - x1,
    n = Math.max(2, Math.round(w / 40));
  ctx.fillStyle = '#6e4d47';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1 - 4, y);
  ctx.lineTo(x2 + 4, y);
  // a jagged underside, deepest in the middle
  for (let i = n; i >= 0; i--) {
    const t = i / n,
      d = 16 + Math.sin(t * Math.PI) * 26 + ((i * 7 + Math.round(s.x1)) % 3) * 5;
    ctx.lineTo(x1 + w * t, y + d);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  inkRect(x1 - 4, y - 2, w + 8, 9, '#9c7a6a', 3);
  ctx.strokeStyle = 'rgba(255,122,0,0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1 + w * 0.3, y + 12);
  ctx.lineTo(x1 + w * 0.38, y + 22);
  ctx.lineTo(x1 + w * 0.34, y + 30);
  ctx.stroke();
}
// The rock ledges, drawn in front of the scenery (a lava fall or a stone tiki never covers a ledge)
function drawRockLedges() {
  if (LV.esc && LV.esc.on) drawEscLedges();
  for (const s of LV.terr.s) if (s.st === 'rock') drawLedge(s, 0);
}
// The escape's ledges: they slide out of the crater walls as the lava starts rising
function drawEscLedges() {
  const L = LV.esc,
    mid = L.perch - 300;
  ctx.save();
  ctx.globalAlpha = Math.min(1, L.grow * 2);
  for (const s of L.s) drawLedge(s, (1 - L.grow) * ((s.x1 + s.x2) / 2 < mid ? -500 : 500));
  ctx.restore();
}
// Steam vents on the ground (behind the fighters): a ring of rocks around a dark hole
function drawVents() {
  for (const v of LV.haz.vents) {
    if (v.x < CAM.x - 80 || v.x > CAM.x + W / CAM.z + 80) continue;
    const ph = (LV.t + v.o) % VENT_T;
    ctx.fillStyle = '#3a2c30';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(v.x, G + 8, 30, 7, 0, 0, 7);
    ctx.fill();
    ctx.stroke();
    for (const d of [-34, -22, 22, 34]) {
      ctx.fillStyle = '#9b8f8a';
      ctx.beginPath();
      ctx.ellipse(v.x + d, G + 6 - Math.abs(d) * 0.1, 9, 7, 0, 0, 7);
      ctx.fill();
      ctx.stroke();
    }
    // a warning glow while it hisses
    if (ph >= VENT_HISS - 40 && ph < VENT_HISS) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.3 * Math.sin(fr * 0.6)})`;
      ctx.beginPath();
      ctx.ellipse(v.x, G + 8, 26, 5, 0, 0, 7);
      ctx.fill();
    }
  }
}
// A puff of steam (cosmetic)
function steamPuff(x, y, r, a) {
  ctx.fillStyle = `rgba(255,255,255,${a})`;
  ctx.strokeStyle = `rgba(160,170,185,${a})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 7);
  ctx.fill();
  ctx.stroke();
}
// A column of steam or lava from (x, y0) up to y1
function spout(x, y0, y1, lava, w) {
  const h = y0 - y1;
  if (h <= 0) return;
  ctx.save();
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, lava ? '#ff5a1f' : 'rgba(255,255,255,0.9)');
  g.addColorStop(1, lava ? '#ffd23f' : 'rgba(255,255,255,0.4)');
  ctx.fillStyle = g;
  ctx.strokeStyle = lava ? INK : 'rgba(150,160,175,0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - w, y0);
  for (let i = 0; i <= 8; i++) ctx.lineTo(x - w * 0.8 + Math.sin(fr * 0.5 + i) * 4, y0 - (h * i) / 8);
  ctx.quadraticCurveTo(x, y1 - w, x + w * 0.8, y1);
  for (let i = 8; i >= 0; i--) ctx.lineTo(x + w * 0.8 + Math.sin(fr * 0.5 + i + 2) * 4, y0 - (h * i) / 8);
  ctx.lineTo(x + w, y0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
// Lava's surface from x0 to x1 at y, filled down to y2: wavy, bubbling, glowing (cool = crusted over)
function lavaBody(x0, x1, y, y2, cool) {
  const g = ctx.createLinearGradient(0, y, 0, Math.min(y2, y + 160));
  g.addColorStop(0, cool ? '#6a4a44' : LAVA[0]);
  g.addColorStop(0.2, cool ? '#4a3434' : LAVA[1]);
  g.addColorStop(1, cool ? '#3a2828' : LAVA[3]);
  ctx.fillStyle = g;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, y2);
  for (let x = x0; x <= x1; x += 12) ctx.lineTo(x, y + (cool ? 0 : Math.sin(x * 0.05 + fr * 0.08) * 3));
  ctx.lineTo(x1, y2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (cool) return;
  // bubbles popping (from the frame count)
  for (let x = Math.ceil(x0 / 70) * 70; x < x1 - 10; x += 70) {
    const q = ((fr + x * 3) % 90) / 90,
      bx = x + Math.sin(x) * 20;
    if (q < 0.7) {
      ctx.fillStyle = LAVA[0];
      ctx.beginPath();
      ctx.arc(bx, y + 8 - q * 6, 3 + q * 6, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
    }
  }
}
// In front of the fighters: lava pools, the rising lava, steam from the vents, falling rocks
function drawVolcanoFront() {
  if (!LV.run) return;
  const vx0 = viewX() - 60,
    vx1 = viewX() + W / CAM.z + 60;
  if (LV.haz)
    for (const p of LV.haz.pools) {
      if (p.x1 < vx0 || p.x0 > vx1) continue;
      // a pit in the floor with lava in it
      ctx.fillStyle = '#2a1c20';
      ctx.fillRect(p.x0 - 6, G + 4, p.x1 - p.x0 + 12, 80);
      lavaBody(p.x0, p.x1, G + 10, G + 84);
      const gl = ctx.createLinearGradient(0, G + 10, 0, G - 70);
      gl.addColorStop(0, 'rgba(255,140,40,0.3)');
      gl.addColorStop(1, 'rgba(255,140,40,0)');
      ctx.fillStyle = gl;
      ctx.fillRect(p.x0, G - 70, p.x1 - p.x0, 80);
    }
  if (LV.esc && LV.esc.on) {
    const L = LV.esc,
      bot = G + CAM.y + (H - G) / CAM.z + 80;
    const gl = ctx.createLinearGradient(0, L.y, 0, L.y - 140);
    gl.addColorStop(0, `rgba(255,120,30,${0.3 * (1 - (L.cool || 0))})`);
    gl.addColorStop(1, 'rgba(255,120,30,0)');
    ctx.fillStyle = gl;
    ctx.fillRect(vx0, L.y - 140, vx1 - vx0, 140);
    lavaBody(vx0, vx1, L.y, Math.max(bot, L.y + 100), L.cool > 0.6);
  }
  if (LV.haz)
    for (const v of LV.haz.vents) {
      if (v.x < vx0 || v.x > vx1) continue;
      const ph = (LV.t + v.o) % VENT_T;
      if (ph >= VENT_HISS - 40 && ph < VENT_HISS)
        for (let i = 0; i < 3; i++) {
          const q = ((ph + i * 13) % 40) / 40;
          steamPuff(v.x + (i - 1) * 8, G - q * 50, 5 + q * 8, 0.7 * (1 - q));
        }
      else if (ph >= VENT_HISS && ph < VENT_HISS + VENT_BLAST + 20) {
        const k = ph < VENT_HISS + VENT_BLAST ? 1 : 1 - (ph - VENT_HISS - VENT_BLAST) / 20;
        spout(v.x, G + 6, G - 260 * k, 0, 22);
        for (let i = 0; i < 4; i++) steamPuff(v.x + (i - 1.5) * 18, G - 250 * k - (i % 2) * 20, 18 + i * 3, 0.8 * k);
      }
    }
  if (LV.rk)
    for (const r of LV.rk.list)
      lifted(r.x, () => {
        if (r.t < ROCK_T) {
          // the glowing mark where it will land, and the rock coming down
          const k = r.t / ROCK_T;
          ctx.strokeStyle = `rgba(255,90,31,${0.4 + 0.5 * Math.abs(Math.sin(r.t * 0.25))})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(r.x, G + 6, 20 + k * 26, 5 + k * 5, 0, 0, 7);
          ctx.stroke();
          if (k > 0.45) {
            const y = G - 600 * (1 - k) / 0.55;
            ctx.strokeStyle = 'rgba(255,150,60,0.5)';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(r.x - 10, y - 70);
            ctx.lineTo(r.x, y - 10);
            ctx.stroke();
            ctx.fillStyle = '#4a3a3e';
            ctx.strokeStyle = INK;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(r.x, y - 14, 18, 0, 7);
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = '#ff7a00';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(r.x - 8, y - 20);
            ctx.lineTo(r.x, y - 12);
            ctx.lineTo(r.x + 7, y - 18);
            ctx.stroke();
          }
        } else {
          // a smouldering rock where it landed
          const a = 1 - (r.t - ROCK_T) / 40;
          ctx.globalAlpha = a;
          ctx.fillStyle = '#4a3a3e';
          ctx.strokeStyle = INK;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(r.x, G - 6, 20, 13, 0, 0, 7);
          ctx.fill();
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });
}
// The volcano's scenes, drawn over everything (drawCine in run.js)
function drawVolcanoCine(c) {
  const t = c.t;
  if (c.k === 'geyser') {
    const x = c.tr.x;
    if (t > 30 && t < 80)
      for (let i = 0; i < 4; i++) steamPuff(x + (i - 1.5) * 16, G - ((t * 3 + i * 17) % 60), 8 + i * 2, 0.7);
    if (t >= 80 && t < 150) {
      const k = t < 120 ? 1 : 1 - (t - 120) / 30;
      spout(x, G + 6, G - 700 * k, 0, 46);
    }
  } else if (c.k === 'erupt' || (c.k === 'jump' && c.erupt)) {
    // the lava he bursts out of
    const e = c.e,
      x = e.x,
      a = c.k === 'erupt' ? Math.min(1, t / 30) : Math.max(0, 1 - (t - c.erupt) / 60);
    if (a > 0) {
      ctx.save();
      ctx.globalAlpha = a;
      lavaBody(x - 90, x + 90, G + 2, G + 30);
      if (c.k === 'jump' && e.vy < 0) spout(x, G + 6, e.y - 20, 1, 36);
      ctx.restore();
    }
  } else if (c.k === 'tiki') {
    // stars over everyone's dizzy head; then the lava spout that carries him to the rim
    if (t < 160)
      for (const p of c.ps) {
        const hy = p.y - 112 * p.s;
        for (let i = 0; i < 3; i++) {
          const a = fr * 0.12 + (i * Math.PI * 2) / 3;
          star4(p.x + Math.cos(a) * 22, hy + Math.sin(a) * 6, 6, '#ffd23f');
        }
      }
    if (t > 170 && t <= 230 && LV.esc) spout(c.e.x, LV.esc.y + 10, c.e.y + 10, 1, 34);
  }
}
// The volcano's props (drawBiomeProp in biomes.js); false if k isn't one of them
function drawVolcanoProp(k, x, s) {
  const gy = G + 6;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  if (k === 'tikitorch') {
    // a bamboo pole with a burning bowl
    inkRect(x - 4, gy - 120 * s, 8, 120 * s, '#d9b36a', 2.5);
    ctx.beginPath();
    ctx.moveTo(x - 4, gy - 80 * s);
    ctx.lineTo(x + 4, gy - 80 * s);
    ctx.moveTo(x - 4, gy - 40 * s);
    ctx.lineTo(x + 4, gy - 40 * s);
    ctx.stroke();
    ctx.fillStyle = '#8a5a34';
    ctx.beginPath();
    ctx.moveTo(x - 14, gy - 128 * s);
    ctx.lineTo(x + 14, gy - 128 * s);
    ctx.lineTo(x + 7, gy - 116 * s);
    ctx.lineTo(x - 7, gy - 116 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    const f = Math.sin(fr * 0.3 + x) * 3;
    ctx.fillStyle = '#ff7a00';
    ctx.beginPath();
    ctx.moveTo(x - 10, gy - 128 * s);
    ctx.quadraticCurveTo(x - 8 + f, gy - 150 * s, x + f, gy - 162 * s);
    ctx.quadraticCurveTo(x + 10, gy - 146 * s, x + 10, gy - 128 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.ellipse(x + f * 0.5, gy - 138 * s, 4, 8, 0, 0, 7);
    ctx.fill();
  } else if (k === 'tikistatue') {
    // a carved wooden tiki, a little taller than you
    const h = 120 * s,
      w = 30 * s;
    inkRect(x - w, gy - h, w * 2, h, '#a4703e', 3);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - w, gy - h * 0.5);
    ctx.lineTo(x + w, gy - h * 0.5);
    ctx.stroke();
    // brows, eyes and a big mouth (top face), a smaller face below
    for (const [fy, k2] of [
      [gy - h * 0.78, 1],
      [gy - h * 0.26, 0.7]
    ]) {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - w * 0.75, fy - 10 * k2);
      ctx.lineTo(x - w * 0.15, fy - 4 * k2);
      ctx.moveTo(x + w * 0.75, fy - 10 * k2);
      ctx.lineTo(x + w * 0.15, fy - 4 * k2);
      ctx.stroke();
      ctx.fillStyle = '#fff8ee';
      ctx.beginPath();
      ctx.ellipse(x - w * 0.42, fy + 2, 6 * k2, 5 * k2, 0, 0, 7);
      ctx.ellipse(x + w * 0.42, fy + 2, 6 * k2, 5 * k2, 0, 0, 7);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.stroke();
      inkRect(x - w * 0.55, fy + 12 * k2, w * 1.1, 10 * k2, '#fff8ee', 2);
    }
  } else if (k === 'hibiscus') {
    // a leafy bush with red flowers
    ctx.fillStyle = '#7fbf5c';
    ctx.lineWidth = 2.5;
    for (const [dx, dy, r] of [
      [-18, -16, 20],
      [14, -18, 22],
      [0, -30, 22]
    ]) {
      ctx.beginPath();
      ctx.arc(x + dx * s, gy + dy * s, r * s, 0, 7);
      ctx.fill();
      ctx.stroke();
    }
    for (const [dx, dy] of [
      [-16, -22],
      [12, -30],
      [4, -12]
    ]) {
      ctx.fillStyle = '#ff4f6e';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(x + dx * s + Math.cos(a) * 5, gy + dy * s + Math.sin(a) * 5, 4, 0, 7);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath();
      ctx.arc(x + dx * s, gy + dy * s, 2.5, 0, 7);
      ctx.fill();
    }
  } else if (k === 'deadtree') {
    // a burnt tree: a dark trunk and bare branches
    ctx.strokeStyle = '#3a3034';
    ctx.lineWidth = 9 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + 6 * s, gy - 110 * s);
    ctx.moveTo(x + 4 * s, gy - 70 * s);
    ctx.lineTo(x - 26 * s, gy - 100 * s);
    ctx.moveTo(x + 6 * s, gy - 95 * s);
    ctx.lineTo(x + 34 * s, gy - 124 * s);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (k === 'fumarole') {
    // a mound of rock breathing smoke
    ctx.fillStyle = '#8f8285';
    ctx.beginPath();
    ctx.moveTo(x - 36 * s, gy);
    ctx.quadraticCurveTo(x - 20 * s, gy - 34 * s, x - 6 * s, gy - 36 * s);
    ctx.lineTo(x + 6 * s, gy - 36 * s);
    ctx.quadraticCurveTo(x + 20 * s, gy - 34 * s, x + 36 * s, gy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const q = ((fr * 0.6 + i * 25 + x) % 100) / 100;
      ctx.fillStyle = `rgba(170,160,168,${0.55 * (1 - q)})`;
      ctx.beginPath();
      ctx.arc(x + Math.sin(q * 4 + i) * 8, gy - 40 * s - q * 90, 7 + q * 16, 0, 7);
      ctx.fill();
    }
  } else if (k === 'lavarock') {
    // a dark boulder with glowing cracks
    ctx.fillStyle = '#4a3a3e';
    ctx.beginPath();
    ctx.moveTo(x - 30 * s, gy);
    ctx.lineTo(x - 26 * s, gy - 26 * s);
    ctx.lineTo(x - 4 * s, gy - 38 * s);
    ctx.lineTo(x + 24 * s, gy - 28 * s);
    ctx.lineTo(x + 32 * s, gy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,${110 + Math.round(Math.sin(fr * 0.08 + x) * 40)},20,0.9)`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 18 * s, gy - 22 * s);
    ctx.lineTo(x - 6 * s, gy - 14 * s);
    ctx.lineTo(x + 2 * s, gy - 26 * s);
    ctx.moveTo(x + 6 * s, gy - 8 * s);
    ctx.lineTo(x + 18 * s, gy - 18 * s);
    ctx.stroke();
  } else if (k === 'obsidian') {
    // black glassy spikes
    ctx.fillStyle = '#231c26';
    for (const [dx, h, w] of [
      [-14, 46, 12],
      [4, 64, 14],
      [20, 38, 10]
    ]) {
      ctx.beginPath();
      ctx.moveTo(x + (dx - w) * s, gy);
      ctx.lineTo(x + dx * s, gy - h * s);
      ctx.lineTo(x + (dx + w) * s, gy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + (dx - 3) * s, gy - h * 0.3 * s);
      ctx.lineTo(x + (dx - 1) * s, gy - h * 0.7 * s);
      ctx.stroke();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
    }
  } else if (k === 'magma') {
    // glowing cracks in the crater floor
    ctx.strokeStyle = '#ff7a00';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 40 * s, gy + 10);
    ctx.lineTo(x - 18 * s, gy + 4);
    ctx.lineTo(x, gy + 14);
    ctx.lineTo(x + 22 * s, gy + 6);
    ctx.lineTo(x + 44 * s, gy + 16);
    ctx.moveTo(x, gy + 14);
    ctx.lineTo(x + 6 * s, gy + 30);
    ctx.stroke();
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (k === 'tikihead') {
    // a giant stone tiki carved into the crater wall
    const h = 200 * s,
      w = 70 * s,
      y0 = gy - h;
    ctx.fillStyle = '#7a6a66';
    ctx.beginPath();
    ctx.moveTo(x - w, gy);
    ctx.lineTo(x - w * 0.9, y0 + 20);
    ctx.quadraticCurveTo(x, y0 - 16, x + w * 0.9, y0 + 20);
    ctx.lineTo(x + w, gy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.7, y0 + h * 0.3);
    ctx.lineTo(x - w * 0.1, y0 + h * 0.36);
    ctx.moveTo(x + w * 0.7, y0 + h * 0.3);
    ctx.lineTo(x + w * 0.1, y0 + h * 0.36);
    ctx.stroke();
    // eyes glowing from inside
    ctx.fillStyle = `rgba(255,${130 + Math.round(Math.sin(fr * 0.05) * 50)},30,0.9)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x - w * 0.4, y0 + h * 0.45, 12 * s, 9 * s, 0, 0, 7);
    ctx.ellipse(x + w * 0.4, y0 + h * 0.45, 12 * s, 9 * s, 0, 0, 7);
    ctx.fill();
    ctx.stroke();
    inkRect(x - w * 0.5, y0 + h * 0.66, w, h * 0.14, '#3a2c30', 3);
    ctx.strokeStyle = '#c8bcb6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 1; i < 5; i++) {
      ctx.moveTo(x - w * 0.5 + (w * i) / 5, y0 + h * 0.66 + 3);
      ctx.lineTo(x - w * 0.5 + (w * i) / 5, y0 + h * 0.8 - 3);
    }
    ctx.stroke();
  } else if (k === 'lavafall') {
    // lava pouring down the back wall from a crack high up
    const h = 260 * s,
      y0 = gy - h;
    inkRect(x - 26, y0 - 10, 52, 18, '#4a3a3e', 3);
    ctx.save();
    const g = ctx.createLinearGradient(0, y0, 0, gy);
    g.addColorStop(0, LAVA[0]);
    g.addColorStop(1, LAVA[2]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 12, y0);
    for (let i = 0; i <= 10; i++) ctx.lineTo(x - 12 + Math.sin(fr * 0.2 + i) * 2, y0 + (h * i) / 10);
    ctx.lineTo(x + 26, gy);
    for (let i = 10; i >= 0; i--) ctx.lineTo(x + 12 + Math.sin(fr * 0.2 + i + 3) * 2, y0 + (h * i) / 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = '#ffe9a0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const y = y0 + ((fr * 3 + i * 80) % h);
      ctx.moveTo(x - 4, y);
      ctx.lineTo(x - 2, y + 26);
    }
    ctx.stroke();
  } else if (k === 'trans-geyser') {
    // the giant vent: a big ring of rocks around a steaming hole
    ctx.fillStyle = '#3a2c30';
    ctx.beginPath();
    ctx.ellipse(x, gy + 4, 70, 14, 0, 0, 7);
    ctx.fill();
    ctx.stroke();
    for (const d of [-80, -60, -36, 36, 60, 80]) {
      ctx.fillStyle = '#9b8f8a';
      ctx.beginPath();
      ctx.ellipse(x + d, gy - 4 + Math.abs(d) * 0.05, 16, 13, 0, 0, 7);
      ctx.fill();
      ctx.stroke();
    }
    if (!riding('geyser'))
      for (let i = 0; i < 3; i++)
        steamPuff(x + (i - 1) * 20, gy - 20 - ((fr * 0.7 + i * 20) % 60), 10 + i * 3, 0.55);
  } else if (k === 'trans-rim') {
    // the edge of the crater: the ground stops, and beyond it the crater glows
    const g = ctx.createLinearGradient(0, gy, 0, gy + 200);
    g.addColorStop(0, '#ff9a1f');
    g.addColorStop(1, '#5e2a20');
    ctx.fillStyle = g;
    ctx.fillRect(x + 20, gy - 2, 1200, 400);
    ctx.fillStyle = 'rgba(255,140,40,0.25)';
    ctx.fillRect(x + 20, gy - 160, 1200, 160);
    ctx.fillStyle = '#8c7a76';
    ctx.beginPath();
    ctx.moveTo(x - 30, gy);
    ctx.lineTo(x + 30, gy);
    ctx.lineTo(x + 16, gy + 60);
    ctx.lineTo(x + 34, gy + 140);
    ctx.lineTo(x + 6, gy + 400);
    ctx.lineTo(x - 30, gy + 400);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // a little warning sign at the edge
    inkRect(x - 72, gy - 70, 6, 70, '#a4794f', 2);
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.moveTo(x - 69, gy - 104);
    ctx.lineTo(x - 45, gy - 66);
    ctx.lineTo(x - 93, gy - 66);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = '900 20px Impact,"Arial Black",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', x - 69, gy - 72);
  } else return false;
  return true;
}
