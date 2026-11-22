// StickFighters: Combat and collision: hitboxes, attacks, blocking, grabs/throws, hits, bowling, separation, physics, poses
// ===== COMBAT & COLLISION =====
const ov = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
function hbox(f) {
  const d = f.att.d,
    s = f.s,
    r = d.r * s * (f.pl && f.att.b === 'k' ? 1 + modOf(f, 'kr') : 1), // Long Legs (skill tree)
    fc = d.back ? -f.face : f.face;
  let x0 = fc > 0 ? f.x - 8 * s : f.x - r,
    x1 = fc > 0 ? f.x + r : f.x + 8 * s;
  if (d.omni) {
    x0 = f.x - r;
    x1 = f.x + r;
  }
  return [x0, f.y - (d.top || 84) * s, x1, f.y + (d.dive ? 44 : d.bot || 6)];
}
function markDone(n) {
  if (!DONE.has(n) && MOVELIST.some(s => s[1].some(r => r[1] === n))) {
    DONE.add(n);
    renderMoves();
  }
}
function startAtk(f, def, btn) {
  f.att = { d: def, f: 0, hit: new Set(), aim: btn ? inputOf(f).AIM[btn] : 'n', b: btn, pf: fr };
  f.st = 'atk';
  f.tp = null;
  if (f.pl) {
    const am = f.att.aim;
    LAST = {
      n: def.nm || def.n,
      key: def.n,
      ul: def.ul,
      aim: am === 'u' ? '↑' : am === 'd' ? '↓' : '·',
      su: def.h[0],
      ac: def.h[1] - def.h[0] + 1,
      rc: def.d - def.h[1],
      dmg: def.dmg,
      fx: def.fx,
      cost: def.cost,
      inf: def.d > 999
    };
    markDone(def.n);
    if (def.h !== NOHIT) sfx(200, 0.12, 'sawtooth', 0.03, 300);
  }
}
function endAtk(f, q) {
  f.att = null;
  f.pose[9] = 0;
  if (!q) f.st = 'free';
  f.last = fr;
  if (!f.pl && !f.T.boss) f.cd = f.T.cd + rnd() * 40;
  else if (f.inv > 100) f.inv = 45;
} // grace after an ultimate so a swing that started during it can't land
function tickAtk(f) {
  // enemies press nothing: their moves never read buttons, so they get the idle slot
  const a = f.att,
    d = a.d,
    I = f.pl ? inputOf(f) : NO_INPUT,
    K = I.K,
    press = I.press,
    want = k => wantIn(I, k),
    eat = k => eatIn(I, k);
  a.f++;
  f.tp = kf(d.k, Math.min(1, a.f / (d.kt || d.d)));
  if (f.pl && a.b && !a.chained && !d.cost && !d.air && a.f <= Math.min(5, d.h[0]) && f.y >= f.gy - 1) {
    const o = a.b === 'p' ? 'k' : 'p';
    if (want(o) && Math.abs(press[o] - a.pf) <= 3) {
      eat(o);
      endAtk(f, 1);
      tryGrab(f);
      return;
    }
  }
  if (d.hop && a.f === 1 && f.y >= f.gy - 1) {
    f.vy = d.hop;
    if (d.hopx) f.vx = f.face * d.hopx;
  }
  if (!f.pl && d.dive && a.f === 1) {
    const q = tgt(f);
    if (q) {
      f.face = q.x > f.x ? 1 : -1;
      a.tx = q.x;
    }
  }
  if (!f.pl && d.dive && a.tx != null && a.f < (d.diveAt || 0))
    f.vx = (a.tx - f.x) / Math.max(4, (d.diveAt || 0) - a.f + 6);
  if (d.airhop && a.f === 1) f.vy = d.airhop;
  if (d.flipAt && a.f === d.flipAt) f.face *= -1;
  if (d.iv && a.f >= d.iv[0] && a.f <= d.iv[1]) f.inv = Math.max(f.inv, 2);
  if (d.float) f.vy = Math.min(f.vy, 1.2);
  if (d.hang && a.f <= d.h[1]) f.vy = Math.min(f.vy, 0.3); // hangs in the air while its hits last
  if (d.lg && a.f === Math.max(1, d.h[0] - 3)) f.vx = f.face * d.lg * 1.6;
  if (d.lv && a.f >= d.h[0] && a.f <= d.h[1]) f.vx = f.face * d.lv;
  if (d.blink && a.f === 1 && f.pl) {
    const n = near(f);
    a.bs =
      n && (n.x - f.x) * f.face > 0
        ? Math.max(6, Math.min(d.dv[2], (Math.abs(n.x - f.x) + 42) / (d.dv[1] - d.dv[0] + 1)))
        : 0;
  }
  if (d.dv && a.f >= d.dv[0] && a.f <= d.dv[1]) f.vx = f.face * (a.bs || d.dv[2]);
  if (d.dv && a.f === d.dv[1] + 1) f.vx *= 0.15; // forced dashes brake when they end, so strings can follow
  if (d.ph && a.f >= d.ph[0] && a.f <= d.ph[1]) f.phase = 2;
  if (d.hover) {
    f.vy *= 0.8;
    f.vx = ((K.r ? 1 : 0) - (K.l ? 1 : 0)) * 3.5;
  }
  if (d.tatsu) {
    const m = (K.r ? 1 : 0) - (K.l ? 1 : 0),
      hy = f.gy - (d.rise ?? 46);
    if (a.f <= (d.riseF ?? 7)) f.vy = -6.5;
    else if (a.f < d.d - 4) f.vy = (hy - f.y) * 0.25;
    f.vx = f.face * (d.tv ?? 3.4) + m * 1.6;
    if (a.f % 4 === 0)
      fxp({
        k: 'l',
        x: f.x - f.face * (30 + rnd() * 20),
        y: f.y - 10 - rnd() * 50,
        len: 40 + rnd() * 30,
        dir: f.face,
        l: 9,
        m: 9
      });
    if (a.f % 10 === 0) {
      sfx(420, 0.12, 'triangle', 0.04, -260);
      noise(0.1, 0.04, 2400);
    }
  }
  const diving = d.dive && a.f >= (d.diveAt || 0);
  if (diving) {
    f.vx = f.pl ? f.face * (d.dvx || 8) : f.vx * 0.9;
    f.vy = Math.max(f.vy, d.dvy || 9);
  }
  if ((d.multi && a.f % (d.multi > 1 ? d.multi : 7) === 0) || (d.finalAt && a.f === d.finalAt)) a.hit.clear();
  if (d.pass && a.f % d.pass === 0 && a.f < d.d - 4) {
    // a dash that turns around and hits everyone again (Lightning Rush, Thunder Step)
    f.face *= -1;
    a.hit.clear();
    ultFx(f, d, 1);
  }
  if (d.fxk) ultFx(f, d, 0);
  if (d.boom) for (const b of d.boom) if (a.f === b[0]) shockwave(f, b);
  if (d.quake && a.f === d.h[0]) {
    ring(f.x, f.gy, d.r);
    dust(f.x - 60, f.gy, 6);
    dust(f.x + 60, f.gy, 6);
    shake = Math.max(shake, 8);
    camY += 4;
    sfx(55, 0.3, 'sine', 0.12);
  }
  if (d.ring && a.f === d.h[0]) ring(f.x + f.face * 50, f.y - 45, 60);
  if (a.f >= d.h[0] && a.f <= d.h[1]) {
    const hb = hbox(f);
    for (const e of f.pl ? (MODE.pvp ? [...E, ...foes(f)] : E) : PL) {
      if (
        a.hit.has(e) ||
        e.gone ||
        (!f.pl && e.st === 'down' && (!d.otg || e.otgU)) ||
        e.st === 'getup' ||
        e.st === 'held'
      )
        continue;
      if (!f.pl && (e.inv > 0 || e.st === 'dead')) continue;
      // a defeated enemy lying on the ground can't be hit (a Dive Kick used to bounce off the body like a wall)
      if (!e.pl && (e.dying || e.st === 'dead')) continue;
      if (e.pl && (e.inv > 0 || e.st === 'dead' || e.st === 'down' || e.st === 'getup')) continue;
      if (ov(hb, [e.x - 15 * e.s, e.y - 78 * e.s, e.x + 15 * e.s, e.y + 4])) {
        a.hit.add(e);
        const dr = d.omni ? (e.x >= f.x ? 1 : -1) : d.back ? -f.face : f.face;
        if (f.pl && blocks(e, f, d)) {
          block(e, d, dr, f);
          continue;
        }
        if (f.pl && e.pl) pvpHit(e, d, dr, f);
        else if (f.pl && e.st === 'down' && (!d.otg || e.otgU)) groundHit(e, d, dr, f);
        else if (f.pl) {
          hurtE(
            e,
            boost(
              f,
              d.spikeAt && a.f >= d.spikeAt
                ? { ...d, dmg: 7, lift: 10, kb: 4, st: 6, sh: 6, ef: 'bounce' }
                : d.finalAt && a.f >= d.finalAt
                  ? { ...d, dmg: d.fdmg || 10, lift: -10, kb: 9, w: 'H', ef: 'launch' }
                  : d,
              a.b
            ),
            dr,
            f
          );
        }
        if (f.pl) {
          if (diving && !d.area) {
            // bounce off and dive again; the third in a row before landing ends in a backflip away instead, and no
            // more Dive Kicks until you land (they could be chained endlessly on top of an enemy)
            f.dvc = (f.dvc || 0) + 1;
            if (f.dvc >= 3) {
              f.vy = -11;
              f.vx = -f.face * 6;
              f.jumps = 2;
              f.dvl = 1;
              endAtk(f);
              f.flip = 24;
              return;
            }
            f.vy = -8;
            f.vx = -f.face * 3;
            f.jumps = 1;
            endAtk(f);
            return;
          }
        } else hurtP(e, d, dr);
      }
    }
  }
  if (d.dive && a.f > (d.diveAt || 0) + 3 && f.y >= f.gy - 1) {
    ring(f.x, f.gy, d.area ? d.area : 60);
    dust(f.x, f.gy, d.area ? 16 : 8);
    shake = Math.max(shake, d.area ? 10 : 5);
    sfx(60, 0.2, 'sine', 0.12);
    if (d.area && !f.pl) {
      for (const q of PL) {
        if (q.st === 'dead' || q.y < q.gy - 24 || Math.abs(q.x - f.x) > d.area) continue;
        hurtP(q, { dmg: d.adm || 10, kb: 10, lift: -6 }, q.x >= f.x ? 1 : -1);
      }
      shake = Math.max(shake, 12);
    }
    if (d.area && f.pl && MODE.pvp)
      for (const q of foes(f)) {
        if (q.inv > 0 || q.st === 'dead' || q.y < q.gy - 24 || Math.abs(q.x - f.x) > d.area) continue;
        pvpHit(q, { dmg: d.adm || 12, kb: 9, lift: -7, ef: 'kd' }, q.x >= f.x ? 1 : -1, f);
      }
    if (d.area && f.pl)
      for (const e of E) {
        if (
          e.gone ||
          e.dying ||
          a.hit.has(e) ||
          e.st === 'down' ||
          e.y < e.gy - 60 ||
          Math.abs(e.x - f.x) > d.area
        )
          continue;
        hurtE(
          e,
          boost(
            f,
            { dmg: d.adm || 12, kb: 9, lift: -7, st: 7, sh: 9, ef: 'kd', fold: d.n === 'meteor' },
            a.b
          ),
          e.x >= f.x ? 1 : -1,
          null,
          f
        );
      }
    endAtk(f);
    return;
  }
  if (d.air && a.f > 2 && f.y >= f.gy - 1) {
    if (a.q) press[a.q] = fr;
    endAtk(f);
    return;
  } // air moves end when you land
  // Turning cancels the recovery: once a plain ground move's hits are over, holding the other way ends it at once
  if (f.pl && !d.cost && !d.air && d.ul !== 'Ult' && a.f > d.h[1] && f.y >= f.gy - 1) {
    const m = (K.r ? 1 : 0) - (K.l ? 1 : 0);
    if (m && m !== f.face) {
      if (a.q) press[a.q] = fr;
      endAtk(f);
      return;
    }
  }
  // Chain queue: a press any time after the move connects is held until the move can follow up (never dropped).
  if (f.pl && !d.dive && !d.hover && a.f >= d.h[0] && !a.q) {
    const b = want('p') ? 'p' : want('k') ? 'k' : 0;
    if (b) {
      eat(b);
      a.q = b;
    }
  }
  if (!d.dive && a.f >= d.d) {
    if (d.turn) f.face *= -1;
    if (a.q) press[a.q] = fr;
    endAtk(f);
    return;
  }
  if (a.q && (d.air || f.y >= f.gy - 1) && a.f >= d.d * d.cx) {
    const b = a.q,
      m = (K.r ? 1 : 0) - (K.l ? 1 : 0);
    if (d.turn) f.face *= -1;
    // holding the other way, or a string whose next move isn't unlocked: the chain ends here and the press starts a
    // fresh move from standing (facing the way you hold), so turning mid-string is never locked out
    const n = m && m !== f.face ? null : pick(f, b, true, false, true);
    if (!n) {
      press[b] = fr;
      endAtk(f);
      return;
    }
    endAtk(f, 1);
    startAtk(f, n, b);
    f.att.chained = 1;
  }
}
// Guards block hits that come from in front of them while they're ready. Low hits go under the shield, ultimates
// cut through, and hits from behind land. Each block drains the guard meter; empty = GUARD BREAK (dizzy, shield dropped 4 s).
function blocks(e, f, d) {
  if (!e.T.guard || e.noShield > 0 || e.dying) return false;
  if (!(e.st === 'free' || e.st === 'block')) return false;
  if (d.pierce || (d.top && d.top <= 60) || d.otg) return false;
  return (f.x - e.x) * e.face > 0;
}
function block(e, d, dr, src) {
  const w = wtOf(d);
  e.gm -= Math.max(2, d.dmg) * (w === 'H' ? 2 : w === 'M' ? 1.3 : 1);
  e.st = 'block';
  e.stun = 12;
  e.att = null;
  e.vx = (dr * (w === 'H' ? 4 : 2)) / (e.T.m || 1);
  e.lh = fr;
  spark(e.x + e.face * 16 * e.s, e.y - 50 * e.s, 14, '#bfefff');
  stop = Math.max(stop, 2);
  sfx(700, 0.06, 'square', 0.04, -200);
  noise(0.04, 0.05, 3000);
  src.combo++;
  src.comboT = 100;
  if (e.gm <= 0) {
    e.gm = 0;
    e.noShield = 240;
    e.st = 'hurt';
    e.stun = 80;
    e.broken = 90;
    txt(e.x, e.y - 118 * e.s, 'GUARD BREAK!', '#3ec5ff', 24);
    ring(e.x, e.y - 50 * e.s, 70);
    stop += 4;
    fxp({
      k: 'sh',
      x: e.x + e.face * 16 * e.s,
      y: e.y - 50 * e.s,
      vx: -e.face * 3,
      vy: -6,
      a: 0,
      va: 0.25 * -e.face,
      l: 70,
      m: 70,
      s: e.s
    });
    sfx(180, 0.3, 'sawtooth', 0.07, -90);
  } else txt(e.x, e.y - 104 * e.s, 'BLOCK', '#7a6e80', 15);
}
// Grab: reach 52 px in front, standing enemies only; a big enemy needs its poise broken first.
// Players this player can hit: in Versus everyone except themselves and their teammates (2v2).
const sameTeam = (a, b) => a.team != null && a.team === b.team;
const foes = f => PL.filter(q => q !== f && !sameTeam(q, f));
function tryGrab(f) {
  let tg = null;
  for (const e of MODE.pvp ? [...E, ...foes(f)] : E) {
    if (e.gone || e.dying || !(e.st === 'free' || e.st === 'hurt' || e.st === 'atk')) continue;
    if (e.pl && e.inv > 0) continue;
    const dx = (e.x - f.x) * f.face;
    if (dx > -6 && dx < 52 && Math.abs(e.y - f.y) < 24) {
      tg = e;
      break;
    }
  }
  if (tg && tg.pmax && tg.poise > 0 && !tg.broken) {
    startAtk(f, A.gwhiff, 0);
    txt(tg.x, tg.y - 118 * tg.s, 'TOO HEAVY!', '#e8212b', 18);
    tg.vx += f.face * 1.5;
    return;
  }
  if (!tg) {
    startAtk(f, A.gwhiff, 0);
    return;
  }
  f.st = 'grab';
  f.att = null;
  f.gt = tg;
  f.gd = 0;
  f.pum = 0;
  f.pt = 0;
  tg.st = 'held';
  tg.att = null;
  tg.vx = tg.vy = 0;
  tg.sp = 0;
  tg.pose[9] = 0;
  tg.held = f;
  markDone('grab');
  txt(tg.x, tg.y - 110 * tg.s, 'GRAB!', '#ff7a00', 20);
  sfx(260, 0.08, 'square', 0.05, -60);
  noise(0.05, 0.05, 1800);
  f.combo++;
  f.comboT = 100;
  maxc = Math.max(maxc, f.combo);
}
function pummel(f, e) {
  const dmg = Math.max(1, Math.round(4 * (f.combo < 4 ? 1 : Math.max(0.45, 1 - (f.combo - 3) * 0.04))));
  e.hp -= dmg;
  e.flash = 4;
  e.hs = 3;
  markDone('pummel');
  spark(e.x - f.face * 6, e.y - 40 * e.s, 14, '#fff3a0');
  txt(e.x, e.y - 95 * e.s, dmg, INK);
  impact('L', f.face, e.x, e.y - 40);
  f.combo++;
  f.comboT = 100;
  f.meter = Math.min(100, f.meter + 3);
  maxc = Math.max(maxc, f.combo);
  if (e.hp <= 0) throwE(f, e, 'f');
}
// Throws: K while holding. Forward/neutral and back throw the enemy as a projectile into the crowd; Up launches; Down slams.
function throwE(f, e, dir) {
  // Versus: throwing another player
  if (e.pl) {
    e.held = null;
    e.st = 'free';
    e.esc = 0;
    const mv = { f: 'tfwd', b: 'tback', u: 'tup', d: 'tslam' }[dir];
    if (dir === 'b') {
      f.face *= -1;
      e.x = f.x + f.face * 20;
    }
    startAtk(f, A[mv], 0);
    f.st = 'atk';
    e.inv = 0;
    pvpHit(
      e,
      dir === 'u'
        ? { dmg: 7, kb: 4, lift: -13, ef: 'launch', w: 'M' }
        : dir === 'd'
          ? { dmg: 11, kb: 5, ef: 'bounce', w: 'H' }
          : { dmg: 9, kb: 12, lift: -6, ef: 'splat', w: 'H' },
      f.face,
      f
    );
    return;
  }
  e.held = null;
  e.st = 'fly';
  e.y = f.y - 10;
  const mv = { f: 'tfwd', b: 'tback', u: 'tup', d: 'tslam' }[dir];
  if (dir === 'b') {
    f.face *= -1;
    e.x = f.x + f.face * 20;
  }
  startAtk(f, A[mv], 0);
  f.st = 'atk';
  const fc = f.face;
  if (dir === 'u') hurtE(e, boost(f, { dmg: 6, kb: 1, lift: -13, ef: 'launch', w: 'M' }, 't'), fc, null, f);
  else if (dir === 'd') {
    e.y = f.gy - 4;
    hurtE(e, boost(f, { dmg: 10, kb: 1, lift: -8, ef: 'bounce', w: 'H' }, 't'), fc, null, f);
    ring(e.x, f.gy, 70);
    dust(e.x, f.gy, 12);
  } else {
    hurtE(e, boost(f, { dmg: 8, kb: 12, lift: -5, ef: 'splat', w: 'H' }, 't'), fc, null, f);
    e.thrown = 1;
    e.ch = 0;
  }
}
// Hit weight: every hit is Light, Medium or Heavy. Weight sets hit-stop, shake, camera kick, zoom and sound.
const WT = {
  L: { st: 3, sh: 2, kx: 2, ky: 0, z: 0 },
  M: { st: 5, sh: 4, kx: 4, ky: 1, z: 0.008 },
  H: { st: 7, sh: 7, kx: 9, ky: 3, z: 0.03 }
};
const wtOf = d =>
  d.w || (d.dmg >= 10 || d.ef === 'launch' || d.ef === 'splat' ? 'H' : d.dmg >= 7 ? 'M' : 'L');
function impact(w, dr, x, y, kill, ult) {
  const t = WT[w];
  // an ultimate's many hits don't freeze the whole game (each enemy still flinches)
  if (!ult) stop = Math.max(stop, Math.round((t.st + (kill ? 2 : 0)) * FEEL.hitstop));
  shake = Math.max(shake, t.sh);
  camX += dr * t.kx;
  camY += t.ky;
  if (t.z) zoom = Math.max(zoom, t.z);
  sfxHit(w);
  if (w === 'H') fxp({ k: 'b', x, y, l: 9, m: 9, a: rnd() * 6 });
}
// Hit effects (Combat Chart F): stagger, push, pop, launch, kd (knockdown), trip, splat, bounce.
const JUGMAX = 7,
  EFVY = { pop: -5, launch: -10, kd: -4, trip: -4, splat: -3 };
// src = the attacker whose momentum adds to the knockback (none for throws, flying bodies and shockwaves);
// by = the player who gets the combo and meter (src when not given).
function hurtE(e, d, dr, src, by) {
  if (e.dying) return;
  const ap = by || src,
    w = wtOf(d),
    raw = d.dmg * (ap.combo < 4 ? 1 : Math.max(0.45, 1 - (ap.combo - 3) * 0.04)), // long combos deal less per hit
    dmg = Math.max(1, d.exact ? raw : Math.round(raw)); // skill-tree boosts keep their fractions so small ones count
  if (fr - (e.lh || -999) > 60) e.jug = 0;
  e.lh = fr;
  if (src && src.pl) {
    e.ch = 0;
    e.thrown = 0;
  }
  if (e.st === 'down') e.otgU = 1; // one hit on a downed enemy per knockdown
  tally(ap, 'dealt', Math.min(dmg, Math.max(0, e.hp)));
  e.hp -= dmg;
  if (e.hp <= 0 && MODE.spare && MODE.spare(e)) e.hp = 1; // a mode can keep someone standing (the volcano's last stand)
  e.flash = 4;
  e.hs = WT[w].st;
  let ef = d.ef || 'stagger';
  const air = e.y < e.gy - 6 || e.st === 'fly' || e.st === 'splat';
  const ef0 = ef;
  if (e.hp <= 0) {
    e.dying = 1;
    e.ddir = dr;
    tally(ap, 'kos', 1);
    if (MODE.onKill) MODE.onKill(e, ap);
    e.dk = d.fold
      ? 'fold'
      : ef === 'launch' || ef === 'pop'
        ? 'back'
        : ef === 'trip'
          ? 'curl'
          : ef === 'bounce'
            ? 'plant'
            : 'sprawl';
    if ((ef === 'stagger' || ef === 'push') && !air && w !== 'H' && e.st !== 'held') {
      e.dk = 'kneel';
      e.st = 'kneel';
      e.dt = 22;
      e.att = null;
      e.vx = dr * 1.5;
      e.face = -dr;
      ef = 'none';
    } else if (ef === 'stagger' || ef === 'push') ef = 'kd';
  }
  // Poise: big enemies soak hits until it breaks; heavy hits wear it down faster. Broken = dizzy, grabbable, launchable.
  let arm = false;
  if (e.pmax && !e.broken && e.hp > 0) {
    e.poise -= dmg * (w === 'H' ? 1.6 : w === 'M' ? 1.2 : 1);
    e.pr = fr;
    if (e.poise <= 0) {
      e.poise = 0;
      e.broken = 150;
      txt(e.x, e.y - 118 * e.s, 'BREAK!', '#3ec5ff', 26);
      ring(e.x, e.y - 50 * e.s, 80);
      stop += 3;
      if (ef === 'stagger' || ef === 'push') ef = 'dizzy';
    } else arm = !d.pierce;
  }
  const m = e.T.m || 1,
    ks = FEEL.kb / Math.sqrt(m),
    carry = src && !d.dv && Math.sign(src.vx) === dr ? (src.vx * 0.35) / m : 0; // a moving attacker hits harder (dash-through moves pass through instead)
  if (ef === 'none') {
  } else if (arm) e.vx += dr * d.kb * 0.2 * ks;
  else if (ef === 'dizzy') {
    e.st = 'hurt';
    e.att = null;
    e.stun = 90;
    e.vx = dr * 2;
  } else {
    if (air && (ef === 'stagger' || ef === 'push')) ef = 'pop'; // anything that connects in the air keeps them up
    if (ef === 'stagger' || ef === 'push') {
      e.st = 'hurt';
      e.att = null;
      e.stun = 12 + (d.st || 3) * 2 + (ef === 'push' ? 4 : 0);
      e.vx = dr * d.kb * (ef === 'push' ? 1.3 : 1) * ks + carry;
    } else {
      const capped = e.jug >= JUGMAX;
      e.jug++;
      e.st = 'fly';
      e.ft = 0;
      e.att = null;
      e.bh = new Set();
      e.pop = ef === 'pop' && !e.dying ? 1 : 0;
      e.gb = ef === 'bounce' ? 1 : 0;
      e.splat = ef === 'splat' ? 1 : 0;
      e.vx =
        dr *
          (ef === 'pop' ? d.kb * 0.4 : ef === 'trip' ? d.kb * 0.5 : d.kb + (ef === 'launch' ? 0 : 2)) *
          ks +
        carry;
      let vy = d.lift != null ? d.lift : ef === 'bounce' ? (air ? 11 : 3) : EFVY[ef];
      if (capped) {
        vy = Math.max(vy, 3);
        e.pop = 0;
      } // juggle limit: no more lift, they drop
      e.vy = vy / Math.pow(m, 0.25);
      e.spv = dr * (ef === 'trip' ? 26 : 12 + rnd() * 8);
      e.sp = e.pose[9] = 0;
      e.y -= 2;
    }
  }
  if (RS(e) || e.rag) e.ri = { dr, ef: ef0 === 'push' ? 'kd' : ef0 };
  const px = e.x - dr * 6,
    py = e.y - 42 * e.s;
  spark(px, py, 10 + d.dmg * 2.2, w === 'H' ? '#ffd400' : '#fff3a0');
  if (w !== 'L') ring(px, py, w === 'H' ? 55 : 35);
  txt(e.x, e.y - 95 * e.s, Math.round(dmg), INK);
  impact(w, dr, px, py, e.hp <= 0, ap.att && ap.att.d.ul === 'Ult');
  ap.combo++;
  ap.comboT = 100;
  ap.meter = Math.min(100, ap.meter + 4 * meterK(ap, d));
  maxc = Math.max(maxc, ap.combo);
  tally(ap, 'combo', ap.combo);
  const cw = { 5: 'NICE!', 10: 'GREAT!', 20: 'AMAZING!', 35: 'UNSTOPPABLE!', 50: 'GODLIKE!' }[ap.combo];
  if (cw) txt(ap.x, ap.y - 120, cw, '#ff7a00', 26);
  if (e.hp <= 0) {
    const sc = Math.round(e.T.sc * (1 + ap.combo * 0.1));
    score += sc;
    ap.meter = Math.min(100, ap.meter + 6);
    txt(e.x, e.y - 120 * e.s, '+' + sc, '#ff4fa3', 20);
    if (!queue.length && E.every(x => x.dying)) slow = Math.max(slow, 55);
  }
}
// Versus: a player's attack on another player. Light hits stagger briefly so strings connect; launches and
// knockdowns send them flying with protection until they're back up (no juggles in versus yet). Long combos scale
// down faster than against the army. Block (Down + Surge) works the same as against enemies.
function pvpHit(q, d, dr, f) {
  if (q.blk && dr === -q.face && q.st === 'free') return blockHit(q, d, dr);
  const w = wtOf(d),
    sc = f.combo < 3 ? 1 : Math.max(0.35, 1 - (f.combo - 2) * 0.08),
    dmg = Math.max(1, Math.round((d.dmg || 4) * sc)),
    ef = d.ef || 'stagger',
    big = (d.kb || 0) >= 11 || w === 'H' || ['launch', 'kd', 'trip', 'splat', 'bounce'].includes(ef);
  if (q.st === 'grab' && q.gt) {
    q.gt.st = 'hurt';
    q.gt.stun = 8;
    q.gt.held = null;
    q.gt = null;
  }
  f.combo++;
  f.comboT = 100;
  f.meter = Math.min(100, f.meter + 4);
  maxc = Math.max(maxc, f.combo);
  q.hp -= dmg;
  q.flash = 4;
  q.hs = WT[w].st;
  q.combo = q.comboT = 0;
  q.att = null;
  q.running = q.flip = 0;
  q.pose[9] = 0;
  impact(w, dr, q.x, q.y - 45, false, f.att && f.att.d.ul === 'Ult');
  txt(q.x, q.y - 95, dmg, f.col);
  if (q.hp <= 0) {
    Object.assign(q, { hp: 0, st: 'dead', dk: 'back', ddir: dr, vx: dr * 6, vy: -9, sp: 0, deadT: 0 });
    q.ri = { dr, ef: 'launch' };
    slow = 80;
    return;
  }
  if (big) {
    Object.assign(q, {
      st: 'fly',
      vx: dr * Math.max(6, (d.kb || 8) * 0.7),
      vy: d.lift && d.lift < 0 ? Math.min(-6, d.lift) : -7,
      spv: dr * 14,
      sp: 0,
      inv: 100
    });
    q.ri = { dr, ef: 'launch' };
    return;
  }
  q.st = 'hurt';
  q.stun = d.st || 14;
  q.vx = dr * (d.kb || 4) * 0.8;
  q.vy = -2;
  q.inv = 6;
}
// Ground hits (combat patch): a downed enemy can still be hit. Half damage and a ragdoll flop, but the hit never
// adds down time or juggle count, so it gets up when its knockdown runs out. A finishing hit uses the normal path.
function groundHit(e, d, dr, src) {
  if (e.dying) return;
  const dmg = Math.max(1, Math.round((d.dmg || 4) * 0.5));
  if (e.hp - dmg <= 0) return hurtE(e, { ...d, ef: 'kd' }, dr, src);
  e.hp -= dmg;
  e.flash = 4;
  e.hs = 3;
  e.lh = fr;
  e.vx += (dr * 2) / (e.T.m || 1);
  e.ri = { dr, ef: wtOf(d) === 'H' ? 'launch' : 'kd' };
  spark(e.x, e.y - 18, 14, '#ffd400');
  sfxHit('L');
  stop = Math.max(stop, 2);
  const ap = src;
  ap.combo++;
  ap.comboT = 100;
  maxc = Math.max(maxc, ap.combo);
}
// Block (combat patch): hold Down + Surge while standing still. Hits from the front cost Surge instead of health,
// with no stun. When the bar runs out you're Winded, the block drops, and hits land again.
function blockHit(q, d, dr) {
  const S = q.stm,
    cost = Math.max(6, (d.dmg || d.adm || 6) * 2);
  q.vx = dr * Math.min(6, 1.5 + (d.kb || 4) * 0.35);
  q.blkT = 10;
  spark(q.x - dr * 16, q.y - 46, 16, '#ffd400');
  txt(q.x, q.y - 112, 'BLOCK', '#e8a400', 15);
  sfx(520, 0.07, 'square', 0.05, -250);
  noise(0.05, 0.06, 2500);
  stop = Math.max(stop, 3);
  shake = Math.max(shake, 3);
  if (infS()) return;
  S.v -= cost;
  S.last = fr;
  if (S.v <= 0) {
    S.v = 0;
    wind(q);
    q.blk = 0;
  }
}
function hurtP(q, d, dr) {
  if (q.blk && dr === -q.face && q.st === 'free' && !q.inv) return blockHit(q, d, dr);
  if (state === 'train' && TR.god) return;
  if (q.inv > 0 || q.st === 'dead' || (q.att && q.att.d.invul)) return;
  if (q.st === 'grab' && q.gt) {
    const g = q.gt;
    if (g.st === 'held') {
      g.st = 'hurt';
      g.stun = 8;
      g.held = null;
    }
    q.gt = null;
  } // getting hit lets go
  const hd = d.dmg * (1 - modOf(q, 'arm')) * (1 + 0.2 * hardScale()); // Tough Skin, Thick Skin (skill tree)
  tally(q, 'taken', Math.min(hd, Math.max(0, q.hp)));
  q.hp -= hd;
  q.inv = 65;
  q.flash = 4;
  q.hs = 7;
  q.combo = 0;
  q.comboT = 0;
  q.att = null;
  q.pose[9] = 0;
  q.flip = 0;
  q.running = 0;
  stop = Math.max(stop, Math.round(7 * FEEL.hitstop));
  shake = 9;
  camX += dr * 7;
  spark(q.x, q.y - 45, 26, '#ff4fa3');
  sfxHit('M');
  sfx(90, 0.25, 'sawtooth', 0.07, -50);
  q.ri = { dr, ef: d.kb >= 12 ? 'launch' : 'kd' };
  if (q.hp <= 0 && modOf(q, 'sw') && !q.swUsed) {
    // Second Wind (skill tree): once a fight, a knockout becomes a knockdown with some health back
    q.swUsed = 1;
    q.hp = 30;
    q.st = 'fly';
    q.vx = dr * 7;
    q.vy = -7;
    q.spv = dr * 14;
    q.sp = 0;
    q.inv = 110;
    txt(q.x, q.y - 120, 'SECOND WIND!', '#47b34a', 26);
    ring(q.x, q.y - 45, 80);
    return;
  }
  if (q.hp <= 0) {
    q.hp = 0;
    q.st = 'dead';
    q.dk = 'back';
    q.ddir = dr;
    q.vx = dr * 6;
    q.vy = -9;
    q.sp = 0;
    slow = 80;
    q.deadT = 0;
    return;
  }
  if (d.kb >= 12) {
    q.st = 'fly';
    q.vx = dr * 7;
    q.vy = -7;
    q.spv = dr * 14;
    q.sp = 0;
    q.inv = 110;
    return;
  }
  q.st = 'hurt';
  q.stun = 18;
  q.vx = dr * d.kb;
  q.vy = d.lift ? -5 : -3;
}
// Bodies as projectiles: a flying enemy knocks down whoever it hits. Each link in the chain hits 25% softer.
// Momentum is shared by mass; a heavy target with poise stops the projectile cold. Falling bodies crush; downed bodies make a pile-up.
function bowl() {
  // whoever gets the combo and meter when a flying body hits another: Player 1 (it isn't tracked who sent it flying)
  const cred = PL[0];
  for (const a of E) {
    if (a.st !== 'fly' || a.gone || a.corpse) continue;
    const sp = Math.abs(a.vx),
      fall = a.vy > 7;
    if (sp < (a.thrown ? 3 : 4) && !fall) continue;
    for (const b of E) {
      if (b === a || b.gone || b.st === 'held' || a.bh.has(b)) continue;
      const dx = b.x - a.x,
        dy = b.y - a.y;
      if (b.st === 'down') {
        if (Math.abs(dx) < 30 && Math.abs(dy) < 24 && sp >= 4) {
          a.bh.add(b);
          b.vx += (a.vx * 0.4) / b.T.m;
          if (b.rag) {
            b.ri = { dr: Math.sign(a.vx), ef: 'kd' };
            b.ct = 0;
          }
          a.vy = Math.min(a.vy, -5);
          a.vx *= 0.6;
          dust(b.x, b.gy, 4);
          sfx(90, 0.08, 'sine', 0.08);
        }
        continue;
      }
      if (b.st === 'fly' || b.st === 'getup' || b.st === 'splat') continue;
      if (fall && Math.abs(dx) < 26 && dy > 20 && dy < 75) {
        a.bh.add(b);
        hurtE(b, { dmg: 6, kb: 2, lift: -3, ef: 'kd', w: 'M' }, Math.sign(dx) || 1, null, cred);
        b.ch = (a.ch || 0) + 1;
        a.vy = -4;
        txt(b.x, b.y - 100, 'CRUSH!', '#ff7a00', 20);
        continue;
      }
      if (Math.abs(dx) < 28 && Math.abs(dy) < 60 && Math.sign(dx) === Math.sign(a.vx)) {
        a.bh.add(b);
        const ch = a.ch || 0,
          dir = Math.sign(a.vx),
          ma = a.T.m,
          mb = b.T.m;
        const dmg = Math.max(2, Math.round((4 + sp * 0.7) * ma * (a.thrown ? 1.4 : 1) * Math.pow(0.75, ch)));
        if (blocks(b, a, { dmg, top: 84 })) {
          block(b, { dmg: dmg * 1.5, w: 'H' }, dir, cred);
          a.vx *= -0.35;
          continue;
        }
        hurtE(
          b,
          { dmg, kb: Math.min(12, sp * 0.8 * ma), lift: -5, ef: 'kd', w: dmg >= 10 ? 'H' : 'M' },
          dir,
          null,
          cred
        );
        if (b.st === 'fly') {
          b.ch = ch + 1;
          b.thrown = 0;
          a.vx *= ma / (ma + mb);
        } else {
          a.vx *= -0.3;
          spark(b.x - dir * 14, b.y - 45 * b.s, 16, '#fff3a0');
        }
        txt(b.x, b.y - 104 * b.s, ch ? 'CHAIN x' + (ch + 2) : 'STRIKE!', '#ff7a00', 20);
        score += 10 * (ch + 1);
      }
    }
  }
}
function sep() {
  const all = E.filter(
    e => (e.st === 'free' || e.st === 'atk' || e.st === 'hurt' || e.st === 'getup') && !e.gone
  );
  for (let i = 0; i < all.length; i++) {
    const a = all[i];
    for (let j = i + 1; j < all.length; j++) {
      const b = all[j];
      if (Math.abs(a.y - b.y) > 40) continue;
      const m = (a.s + b.s) * 9,
        dx = b.x - a.x;
      if (Math.abs(dx) < m) {
        const o = (m - Math.abs(dx)) * 0.5,
          s = dx >= 0 ? 1 : -1,
          ma = a.T.m,
          mb = b.T.m;
        a.x -= (s * o * mb) / (ma + mb);
        b.x += (s * o * ma) / (ma + mb);
      }
    }
    for (const p of PL) {
      if (p.st === 'dead' || p.phase > 0 || p.st === 'grab' || Math.abs(a.y - p.y) > 45) continue;
      const m = 10 + 14 * a.s,
        dx = a.x - p.x;
      if (Math.abs(dx) < m) {
        const o = (m - Math.abs(dx)) * 0.6,
          s = dx >= 0 ? 1 : -1,
          ma = a.T.m,
          canMove = p.st === 'free' || p.st === 'atk';
        a.x += s * o * (canMove ? 1 / (ma + 1) : 1);
        if (canMove) p.x -= (s * o * ma) / (ma + 1);
        if (Math.sign(p.vx) === s && Math.abs(p.vx) > 1 && a.st !== 'atk') a.vx += (p.vx * 0.12) / ma;
      }
    }
  }
}
// The floor line under x (ragdolls still use only this; fighters stand on f.gy, see terrain.js).
const groundY = x => G;
function phys(f) {
  // low gravity (the moon): the up-and-down motion runs slower, so jumps and launches float, and reach a little higher
  const lg = lowG(f);
  if (!(f.att && (f.att.d.hover || f.att.d.tatsu))) f.vy += 0.7 * FEEL.grav * (lg < 1 ? lg * 0.85 : 1);
  const x0 = f.x,
    y0 = f.y;
  f.x += f.vx;
  f.y += f.vy * lg;
  let imp = 0;
  if (TERRAIN.n) terrainStep(f, x0, y0);
  else f.gy = G;
  const gy = f.gy;
  if (f.y >= gy) {
    if (f.vy > 0) imp = f.vy;
    f.y = gy;
    f.vy = 0;
  }
  f.x = Math.max(WB.l + 24, Math.min(WB.r - 24, f.x));
  return imp;
}
function freePose(f) {
  if (f.y < f.gy - 4) return f.vy < -1 ? JUMP : FALL;
  if (Math.abs(f.vx) > 0.9) {
    const ph = f.t * (f.pl ? 0.3 : 0.22),
      c = Math.cos(ph),
      n = Math.sin(ph);
    return [
      14,
      35 - n * 45,
      70,
      35 + n * 45,
      70,
      n * 50,
      25 + Math.max(0, c) * 60,
      -n * 50,
      25 + Math.max(0, -c) * 60,
      0
    ];
  }
  const b = Math.sin(f.t * 0.1) * 3;
  return [
    IDLE[0] + b / 2,
    IDLE[1] + b,
    IDLE[2] - b,
    IDLE[3] - b,
    IDLE[4] + b,
    IDLE[5],
    IDLE[6] + b,
    IDLE[7],
    IDLE[8] - b,
    0
  ];
}
function runPose(f) {
  const ph = f.t * 0.42,
    c = Math.cos(ph),
    n = Math.sin(ph);
  return [
    35,
    60 - n * 70,
    80,
    60 + n * 70,
    80,
    n * 70,
    30 + Math.max(0, c) * 80,
    -n * 70,
    30 + Math.max(0, -c) * 80,
    0
  ];
}
const smooth = (f, tp, k) => {
  for (let i = 0; i < 9; i++) f.pose[i] += (tp[i] - f.pose[i]) * k;
};
function near(f) {
  let b = null,
    bd = 150;
  for (const e of E) {
    if (e.dying || e.gone) continue;
    const d = Math.abs(e.x - f.x);
    if (d < bd) {
      bd = d;
      b = e;
    }
  }
  return b;
}
// An ultimate's shockwave: [frame, radius, damage, launch?] hits everyone on the ground within reach
function shockwave(f, [, r, dmg, up]) {
  ring(f.x, f.gy, r);
  ring(f.x, f.gy, r * 0.6);
  dust(f.x - r * 0.4, f.gy, 6);
  dust(f.x + r * 0.4, f.gy, 6);
  shake = Math.max(shake, up ? 14 : 10);
  camY += 5;
  sfx(up ? 45 : 60, 0.35, 'sine', 0.14);
  const hit = up
    ? { dmg, kb: 8, lift: -12, st: 8, sh: 10, ef: 'launch', w: 'H' }
    : { dmg, kb: 7, lift: -7, st: 7, sh: 9, ef: 'kd', w: 'H' };
  if (MODE.pvp)
    for (const q of foes(f)) {
      if (q.inv > 0 || q.st === 'dead' || q.y < q.gy - 24 || Math.abs(q.x - f.x) > r) continue;
      pvpHit(q, hit, q.x >= f.x ? 1 : -1, f);
    }
  for (const e of E) {
    if (e.gone || e.dying || e.st === 'down' || e.y < e.gy - 60 || Math.abs(e.x - f.x) > r) continue;
    hurtE(e, hit, e.x >= f.x ? 1 : -1, null, f);
  }
}
