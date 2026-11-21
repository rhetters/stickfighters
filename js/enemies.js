// StickFighters: Enemies: per-frame update, AI director, boss framework, spawning and waves
// ===== ENEMIES =====
// Is the floor under this fighter slippery? (a campaign run's biome: data/themes.js slick)
const slick = f => MODE === LEVEL && LV && LV.segs && BIOMES[segAt(f.x).b].slick;
function updE(e) {
  e.t++;
  if (e.st === 'cine') return; // a boss arriving (run.js) waits for its scene to end
  if (e.flash > 0) e.flash--;
  if (e.pmax) {
    if (e.broken > 0) {
      if (--e.broken === 0) e.poise = e.pmax;
    } else if (fr - (e.pr || 0) > 120) e.poise = Math.min(e.pmax, e.poise + 0.3);
  } else if (e.broken > 0) e.broken--;
  if (e.T.guard) {
    if (e.noShield > 0) {
      if (--e.noShield === 0) {
        e.gm = e.T.guard;
        txt(e.x, e.y - 104 * e.s, 'SHIELD UP', '#7a6e80', 14);
      }
    } else if (fr - (e.lh || 0) > 150) e.gm = Math.min(e.T.guard, e.gm + 0.08);
  }
  if (e.chase > 0) e.chase--;
  if (e.st === 'held') {
    if (!e.held || e.held.st !== 'grab') {
      e.st = 'hurt';
      e.stun = 10;
      e.held = null;
    } else {
      e.vx = e.vy = 0;
      smooth(e, HLD, 0.4);
      return;
    }
  }
  const T_ = e.T;
  let tp = e.pose,
    k = 0.3;
  if (e.st === 'fly') {
    if ((e.x < WB.l + 26 && e.vx < 0) || (e.x > WB.r - 26 && e.vx > 0)) {
      if (e.splat && Math.abs(e.vx) > 4) {
        if (e.dying) e.dk = 'slump';
        e.st = 'splat';
        e.dt = 22;
        e.x = e.x < (WB.l + WB.r) / 2 ? WB.l + 24 : WB.r - 24;
        e.face = e.x < (WB.l + WB.r) / 2 ? 1 : -1;
        e.vx = 0;
        e.vy = 0;
        e.splat = 0;
        e.sp = 0;
        e.pose[9] = 0;
        if (!e.dying) {
          e.hp -= 4;
          if (e.hp <= 0) {
            e.dying = 1;
            e.dk = 'slump';
            e.ddir = -e.face;
          }
        }
        txt(e.x + e.face * 40, e.y - 90, 'SPLAT!', '#ff7a00', 22);
        spark(e.x, e.y - 40, 30, '#ffd400');
        ring(e.x, e.y - 40, 50);
        shake = Math.max(shake, 8);
        stop = Math.max(stop, 5);
        sfx(70, 0.2, 'square', 0.09, -30);
      } else {
        if (e.dying) e.dk = 'legsup';
        e.vx *= e.dying ? -0.12 : -0.55;
        e.spv *= -0.7;
        spark(e.x < (WB.l + WB.r) / 2 ? WB.l + 26 : WB.r - 26, e.y - 40, 18, '#ffd400');
        shake = Math.max(shake, 4);
        sfx(80, 0.1, 'square', 0.06);
      }
    }
    if (e.st === 'fly') {
      e.sp += e.spv;
      e.pose[9] = e.sp;
      tp = FLY;
      e.vx *= 0.99;
    } else tp = SPL;
  } else if (e.st === 'splat') {
    tp = SPL;
    e.pose[9] = 0;
    e.vy = 0;
    if (--e.dt <= 0) {
      e.st = 'fly';
      e.vx = e.face * 1.5;
      e.spv = e.face * 6;
    }
  } else if (e.st === 'getup') {
    tp = KNEEL;
    e.vx *= 0.8;
    if (--e.dt <= 0) {
      e.st = 'free';
      e.cd = 25;
    }
  } else if (e.st === 'kneel') {
    tp = KNEEL;
    k = 0.4;
    e.vx *= 0.8;
    if (--e.dt <= 0) {
      e.rag = mkRag(e);
      ragHit(e.rag, e.face, 'kneel', e.s);
      e.st = 'down';
      e.corpse = 1;
    }
  } else if (e.st === 'down') {
    tp = LIE;
    e.pose[9] = 90;
    e.vx *= slick(e) ? 0.95 : T_.fr; // a slippery floor (sewer) lets bodies slide on
    if (e.dying) {
      e.corpse = 1;
    } else if (--e.dt <= 0) {
      {
        e.st = 'getup';
        e.dt = 16;
        e.pose[9] = 0;
        e.jug = 0;
        e.otgU = 0;
      }
    }
  } else if (e.st === 'block') {
    tp = GRDP;
    e.vx *= 0.8;
    if (--e.stun <= 0) e.st = 'free';
  } else if (e.st === 'hurt') {
    tp = HURT;
    e.vx *= slick(e) ? 0.95 : Math.min(0.9, T_.fr + 0.04);
    if (--e.stun <= 0) e.st = 'free';
  } else if (e.st === 'atk') {
    tickAtk(e);
    if (e.tp) tp = e.tp;
    k = 0.6;
    const d = e.att && e.att.d;
    if (!(d && d.lv && e.att.f >= d.h[0] && e.att.f <= d.h[1])) e.vx *= 0.85;
  } else {
    const Q = tgt(e); // nearest standing player
    if (e.y >= e.gy - 3 && Q && !(state === 'train' && TR.passive)) {
      aiThink(e, Q, T_);
    } else if (e.y >= e.gy - 3) e.vx *= 0.7;
    tp = freePose(e);
  }
  const imp = e.corpse ? 0 : phys(e);
  if (e.st === 'fly' && imp > 0) {
    if (e.gb) {
      e.gb = 0;
      e.vy = -7;
      e.y = e.gy - 1;
      e.vx *= 0.6;
      ring(e.x, e.gy, 44);
      dust(e.x, e.gy, 8);
      shake = Math.max(shake, 5);
      sfx(65, 0.15, 'sine', 0.12);
    } else if (e.pop && !e.dying) {
      e.pop = 0;
      e.st = 'hurt';
      e.stun = 10;
      e.sp = 0;
      e.pose[9] = 0;
      dust(e.x, e.gy, 3);
    } else if (imp > 5) {
      e.vy = -imp * T_.bnc * FEEL.bounce;
      e.y = e.gy - 1;
      e.vx *= 0.7;
      e.spv *= 0.6;
      dust(e.x, e.gy, 5);
      shake = Math.max(shake, 3);
      sfx(70, 0.12, 'sine', 0.1);
    } else {
      e.st = 'down';
      e.dt = e.dying ? 28 : 38;
      e.otgU = 0;
    }
  } else if (e.st === 'free' && imp > 6) {
    dust(e.x, e.gy, 5);
    shake = Math.max(shake, 2);
  }
  smooth(e, tp, k);
  ragTick(e);
}
// ===== AI DIRECTOR =====
// Attack tokens: only a few enemies may swing at each player at once (the nearest ones). The rest hold a ring around you,
// spread over both sides, waiting their turn. Bosses always have a token.
function director() {
  for (const q of PL) {
    if (q.st === 'dead') continue;
    const mine = E.filter(
      e => !e.dying && !e.gone && !e.T.boss && tgt(e) === q && (e.st === 'free' || e.st === 'atk')
    );
    const tokens = 2 + (wave > 5 ? 1 : 0) + (wave > 9 ? 1 : 0);
    mine.sort((a, b) => (b.st === 'atk') - (a.st === 'atk') || Math.abs(a.x - q.x) - Math.abs(b.x - q.x));
    mine.forEach((e, i) => {
      e.tok = i < tokens ? 1 : 0;
      e.slot = i - tokens;
    });
  }
  for (const e of E) if (e.T.boss) e.tok = 1;
}
function aiThink(e, Q, T_) {
  const side = Math.sign(Q.x - e.x) || 1;
  // Surge-phasing through an enemy confuses it for a moment, then it chases harder
  if (e.lastSide && side !== e.lastSide && Q.phase > 0 && Math.abs(Q.x - e.x) < 80) {
    e.cd = Math.max(e.cd, 22);
    e.chase = 60;
    txt(e.x, e.y - 100 * e.s, '?!', '#7a6e80', 18);
  }
  e.lastSide = side;
  e.face = side;
  if (e.cd > 0) e.cd--;
  const spd = T_.spd * (e.chase > 0 ? 1.6 : 1) * (e.bp > 1 ? 1.3 : 1),
    inRange = Math.abs(Q.x - e.x) <= T_.ar && Math.abs(Q.y - e.y) < 55;
  if (T_.ai === 'boss') return bossThink(e, Q, T_, spd);
  if (T_.ai === 'flank') {
    // get behind the target: aim for the spot at its back; if it's facing us up close, leap over it
    const behind = (e.x - Q.x) * Q.face < 0,
      goal = Q.x - Q.face * 58;
    if (!behind && Math.abs(Q.x - e.x) < 120 && e.y >= e.gy - 3 && !(e.hopT > 0)) {
      e.vy = -12.5;
      e.vx = side * 7.5;
      e.hopT = 80;
      sfx(500, 0.1, 'triangle', 0.03, 300);
    }
    if (e.hopT > 0) e.hopT--;
    if (behind && inRange && e.cd <= 0 && e.tok) return startAtk(e, EA[T_.atk]);
    if (e.y >= e.gy - 3) e.vx += (Math.sign(goal - e.x) * (Math.abs(goal - e.x) > 8 ? spd : 0) - e.vx) * 0.2;
    return;
  }
  if (inRange && e.cd <= 0 && e.tok) return startAtk(e, EA[T_.atk]);
  // no token: hold a standoff ring (110 px + 34 px per place in the queue) and sidestep a little
  const want = e.tok
    ? T_.stop
    : Math.min(260, 110 + Math.max(0, e.slot) * 34) + Math.sin(e.t * 0.03 + e.off) * 10;
  const dist = Math.abs(Q.x - e.x),
    dir = dist > want + 6 ? side : dist < want - 6 ? -side : 0;
  e.vx += (dir * spd * (dir === -side ? 0.6 : 1) - e.vx) * 0.2;
}
// ===== BOSS FRAMEWORK: phases by health, health bar, scripted attack patterns =====
const BOSSPH = {
  c: [
    { at: 1, cd: 1 },
    {
      at: 0.55,
      cd: 0.6,
      enter: e => {
        bn('CAPTAIN ENRAGED!');
        for (const x of [WB.l + 60, WB.r - 60]) {
          if (state === 'play') {
            const m = F(x, 'g', 0);
            m.y = -70;
            E.push(m);
          }
        }
      }
    }
  ]
};
// The Pink General: angrier and faster at two thirds and at one third of his health, calling his army each time
const bossCall = list => {
  if (state !== 'play') return;
  list.forEach((t, i) => {
    const m = F(i % 2 ? WB.l + 60 : WB.r - 60, t, 0);
    m.y = -70;
    E.push(m);
  });
};
BOSSPH.G = [
  { at: 1, cd: 1 },
  { at: 0.66, cd: 0.75, enter: () => (bn('THE GENERAL IS ANGRY!'), bossCall(['g', 'g', 'r'])) },
  { at: 0.33, cd: 0.5, enter: () => (bn('THE GENERAL IS FURIOUS!'), bossCall(['u', 'f', 'g', 'g'])) }
];
// Captain Pinkbeard: the same three phases, calling his crew
BOSSPH.P = [
  { at: 1, cd: 1 },
  { at: 0.66, cd: 0.75, enter: () => (bn('PINKBEARD IS ANGRY!'), bossCall(['g', 'f', 'r'])) },
  { at: 0.33, cd: 0.5, enter: () => (bn('PINKBEARD IS FURIOUS!'), bossCall(['b', 'f', 'g', 'g'])) }
];
// The Pink Yeti: the same three phases, calling his climbers
BOSSPH.Y = [
  { at: 1, cd: 1 },
  { at: 0.66, cd: 0.75, enter: () => (bn('THE YETI IS ANGRY!'), bossCall(['g', 'r', 'f'])) },
  { at: 0.33, cd: 0.5, enter: () => (bn('THE YETI IS FURIOUS!'), bossCall(['b', 'u', 'g', 'r'])) }
];
function bossThink(e, Q, T_, spd) {
  const ph = BOSSPH[e.tk] || BOSSPH.c,
    hpf = e.hp / e.max;
  if (e.bp < ph.length && hpf <= ph[e.bp].at) {
    const P2 = ph[e.bp];
    e.bp++;
    e.inv = 40;
    e.cd = 50;
    ring(e.x, e.y - 60 * e.s, 120);
    shake = Math.max(shake, 10);
    txt(e.x, e.y - 150, 'RAAAH!', '#e8212b', 26);
    sfx(90, 0.6, 'sawtooth', 0.1, -30);
    if (P2.enter) P2.enter(e);
  }
  const dist = Math.abs(Q.x - e.x);
  if (e.cd <= 0) {
    let mv = null;
    if (e.bp > 1 && dist > 110 && dist < 330 && rnd() < 0.45) mv = 'cquake';
    else if (dist > 190) mv = 'ccharge';
    else if (dist <= T_.ar) mv = 'cslam';
    if (mv) {
      e.cd = (T_.cd + rnd() * 40) * ph[e.bp - 1].cd;
      e.bm = mv;
      return startAtk(e, EA[mv]);
    }
  }
  const want = T_.stop;
  e.vx += ((dist > want ? Math.sign(Q.x - e.x) : 0) * spd - e.vx) * 0.15;
}
function spawn(t) {
  const e = F(rnd() < 0.5 ? WB.l + 50 + rnd() * 150 : WB.r - 50 - rnd() * 150, t, 0);
  e.y = -70;
  E.push(e);
}
function makeQueue(n) {
  const c = Math.min(24, 4 + n * 2),
    q = [];
  for (let i = 0; i < c; i++) q.push(n >= 2 && rnd() < 0.15 + n * 0.03 ? 'r' : 'g');
  const ins = (t, k) => {
    for (let i = 0; i < k; i++) q.splice(Math.floor(rnd() * (q.length + 1)), 0, t);
  };
  if (n >= 3) ins('b', Math.min(4, Math.floor((n - 1) / 2)));
  if (n >= 2) ins('u', Math.min(3, Math.floor(n / 2)));
  if (n >= 3) ins('f', Math.min(3, Math.floor((n - 1) / 2)));
  if (n % 5 === 0) q.push('c');
  return q;
}
function nextWave() {
  wave++;
  queue = makeQueue(wave);
  coopExtra(queue);
  bn(wave % 5 === 0 ? 'WAVE ' + wave + ': CAPTAIN!' : 'WAVE ' + wave);
  spawnT = 60;
  cl = 0;
}
