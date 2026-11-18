// Orange vs. the Pink Army: Online matches (M11): the room, and lockstep play over the connection in rtc.js
// ===== ONLINE SESSION (M11) =====
// Three layers, so matchmaking or Steam can replace one without the others (see docs/ARCHITECTURE.md):
//   connection  rtc.js: moves messages between devices
//   room        who's in (up to 4), their fighters, the mode; the host decides and tells everyone
//   lockstep    every device runs the same simulation (VISION.md rule R2) and only button presses travel.
// Lockstep: each device sends its buttons for frame f + D (D = input delay, set from the measured lag). The host
// gathers everyone's buttons for a frame and sends the bundle to all; every device, the host included, simulates
// frame f only when its bundle has arrived. Every 2 seconds the clients send a fingerprint of the game state to
// the host, which checks that everyone still matches.
const NET = {
  on: false, // in an online room
  host: false,
  code: '',
  mySlot: 0,
  players: [], // [{ slot, id, name, f (fighter), cid (colour id), rtt, left }]
  mode: 'level',
  match: false, // a match is running
  epoch: 0, // which match (messages from an older match are ignored)
  seed: 0,
  D: 4,
  simF: 0, // next frame to simulate
  sendF: 0, // next frame to send my buttons for
  conf: new Map(), // frame -> everyone's buttons (confirmed)
  tab: new Map(), // host: frame -> buttons received so far
  outF: 0, // host: next frame to send out
  hashes: new Map(), // host: frame -> its own fingerprint
  wait: 0, // frames spent waiting for a bundle
  feelKeep: null,
  pingT: 0
};
const NETIN = [mkSlot(), mkSlot(), mkSlot(), mkSlot()]; // what the simulation reads during an online match
const ROOM_WORDS = ['TIGER', 'PANDA', 'ROCKET', 'MANGO', 'NINJA', 'COMET', 'PIXEL', 'TACO'];
ROOM_WORDS.push('ZEBRA', 'LLAMA', 'WAFFLE', 'DRAGON', 'PICKLE', 'OTTER', 'BANANA', 'FALCON');
const MAX_ONLINE = 4;
// ===== FINGERPRINT =====
function simHash() {
  const r = v => (typeof v === 'number' ? Math.round(v * 1000) / 1000 : v),
    fx = f => [f.tk || 'P', r(f.x), r(f.y), r(f.vx), r(f.vy), r(f.hp), f.st, f.face],
    s = JSON.stringify([fr, SEED, score, wave, PL.map(fx), E.map(fx)]);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
// ===== BUTTONS AS NUMBERS =====
// One bit per action, in ACT order
function maskOf(K) {
  let m = 0;
  ACT.forEach((a, i) => K[a] && (m |= 1 << i));
  return m;
}
// Feed a frame's buttons into a simulation slot exactly like setA would (presses, aim, Surge strings)
function applyMask(I, m) {
  ACT.forEach((a, i) => {
    const v = (m >> i) & 1;
    if (v === I.K[a]) return;
    I.K[a] = v;
    if (v) {
      I.press[a] = fr;
      if (a === 'p' || a === 'k') {
        I.AIM[a] = I.K.u ? 'u' : I.K.d ? 'd' : 'n';
        I.SRG[a] = I.K.s;
      }
    }
  });
}
// ===== ROOM =====
const netSend = (id, m) => rtcSend(id, m);
const netAll = m => NET.players.forEach(p => p.id !== 'host' && !p.left && rtcSend(p.id, m));
const netMe = () => NET.players.find(p => p.slot === NET.mySlot);
function myFighter() {
  return curFighter();
}
// Fighters from other devices: checked for shape, but not for ownership (they own their own items)
function netLook(p) {
  const f = normFighter(p.f, true);
  f.col = p.cid || f.col;
  return lookRaw(f);
}
// The host keeps colours different: a later player whose colour is taken gets the next free one
function netColours() {
  const taken = [];
  for (const p of NET.players.filter(p => !p.left).sort((a, b) => a.slot - b.slot)) {
    let c = ITEM[p.f && p.f.col] ? p.f.col : 'col-orange';
    if (taken.includes(c)) c = ITEMS.find(i => i.slot === 'color' && !taken.includes(i.id)).id;
    p.cid = c;
    taken.push(c);
  }
}
function netRoomMsg() {
  return {
    t: 'room',
    code: NET.code,
    mode: NET.mode,
    players: NET.players.map(p => ({
      slot: p.slot,
      id: p.id,
      name: p.name,
      f: p.f,
      cid: p.cid,
      rtt: p.rtt,
      left: p.left
    }))
  };
}
function netRoomChanged() {
  netColours();
  netAll(netRoomMsg());
  if (typeof renderOnline === 'function') renderOnline();
}
function netReset() {
  Object.assign(NET, { on: false, host: false, code: '', players: [], match: false, mySlot: 0 });
  NET.conf.clear();
  NET.tab.clear();
  NET.hashes.clear();
  clearInterval(NET.pingT);
}
async function netHost() {
  netReset();
  for (let tries = 0; tries < 6; tries++) {
    const code =
      ROOM_WORDS[Math.floor(Math.random() * ROOM_WORDS.length)] + '-' + (10 + Math.floor(Math.random() * 90));
    try {
      await rtcHost(code);
      Object.assign(NET, { on: true, host: true, code, mySlot: 0, mode: 'level' });
      const f = myFighter();
      NET.players = [{ slot: 0, id: 'host', name: f.name, f, rtt: 0 }];
      netColours();
      return code;
    } catch (e) {
      if (e !== 'taken') throw e;
    }
  }
  throw 'taken';
}
async function netJoin(code) {
  netReset();
  const host = await rtcJoin(code);
  Object.assign(NET, { on: true, host: false, code, hostId: host });
  return new Promise((ok, bad) => {
    NET.joinWait = { ok, bad };
    NET.joinT = setTimeout(() => bad('NOROOM'), 15000);
  });
}
function netLeave() {
  if (NET.host) netAll({ t: 'end' });
  else if (NET.hostId) netSend(NET.hostId, { t: 'bye' });
  netEndMatch();
  setTimeout(rtcClose, 200);
  netReset();
}
// ===== MESSAGES =====
RTC.on.peer = id => {
  if (!NET.on) return;
  if (!NET.host) {
    // connected to the host: say hello with my fighter and game version
    netSend(id, { t: 'hello', v: GAME_VERSION, f: myFighter() });
    clearInterval(NET.pingT);
    NET.pingT = setInterval(
      () => netSend(NET.hostId, { t: 'ping', ts: performance.now(), rtt: NET.rtt || 0 }),
      1000
    );
  }
};
RTC.on.gone = id => {
  if (!NET.on) return;
  if (!NET.host) {
    if (id === NET.hostId) netLost('The host left the game.');
    return;
  }
  const p = NET.players.find(p => p.id === id);
  if (!p) return;
  if (NET.match) {
    p.left = true;
    txt(W / 2, 140, p.name + ' LEFT', '#e8212b', 26);
    netAll({ t: 'left', name: p.name });
  } else NET.players = NET.players.filter(q => q !== p);
  netRoomChanged();
  netFlush();
};
RTC.on.err = e => {
  if (NET.joinWait && e === 'NOROOM') {
    clearTimeout(NET.joinT);
    NET.joinWait.bad('NOROOM');
    NET.joinWait = null;
  } else if (typeof onlineMsg === 'function')
    onlineMsg(e === 'CONNECT' ? 'Couldn’t connect. Try again.' : '');
};
RTC.on.msg = (id, m) => {
  if (!NET.on) return;
  if (NET.host) netHostMsg(id, m);
  else netClientMsg(m);
};
function netHostMsg(id, m) {
  const p = NET.players.find(q => q.id === id);
  if (m.t === 'hello') {
    if (m.v !== GAME_VERSION) return netSend(id, { t: 'deny', why: 'VERSION', v: GAME_VERSION });
    if (NET.match) return netSend(id, { t: 'deny', why: 'PLAYING' });
    const live = NET.players.filter(q => !q.left);
    if (live.length >= MAX_ONLINE) return netSend(id, { t: 'deny', why: 'FULL' });
    let slot = 0;
    while (live.some(q => q.slot === slot)) slot++;
    const f = normFighter(m.f, true);
    NET.players = NET.players.filter(q => q.slot !== slot);
    NET.players.push({ slot, id, name: f.name, f, rtt: 0 });
    NET.players.sort((a, b) => a.slot - b.slot);
    netSend(id, { t: 'welcome', slot });
    sfx(700, 0.12, 'square', 0.04, 300);
    netRoomChanged();
  } else if (!p) return;
  else if (m.t === 'fighter' && !NET.match) {
    p.f = normFighter(m.f, true);
    p.name = p.f.name;
    netRoomChanged();
  } else if (m.t === 'ping') {
    netSend(id, { t: 'pong', ts: m.ts });
    if (typeof m.rtt === 'number') p.rtt = Math.round(m.rtt);
  } else if (m.t === 'i' && NET.match && m.e === NET.epoch) netInput(p.slot, m.f, m.m);
  else if (m.t === 'h' && NET.match && m.e === NET.epoch) {
    const mine = NET.hashes.get(m.f);
    if (mine !== undefined && mine !== m.h) netDesync();
  } else if (m.t === 'bye') RTC.on.gone(id);
}
function netClientMsg(m) {
  if (m.t === 'welcome') {
    NET.mySlot = m.slot;
    clearTimeout(NET.joinT);
    if (NET.joinWait) NET.joinWait.ok();
    NET.joinWait = null;
  } else if (m.t === 'deny') {
    clearTimeout(NET.joinT);
    if (NET.joinWait) NET.joinWait.bad(m.why);
    NET.joinWait = null;
  } else if (m.t === 'room') {
    NET.players = m.players;
    NET.mode = m.mode;
    if (typeof renderOnline === 'function') renderOnline();
  } else if (m.t === 'pong') NET.rtt = performance.now() - m.ts;
  else if (m.t === 'start') netStartLocal(m);
  else if (m.t === 'F' && NET.match && m.e === NET.epoch) NET.conf.set(m.f, m.m);
  else if (m.t === 'cmd') netCmdLocal(m);
  else if (m.t === 'desync') netDesyncLocal();
  else if (m.t === 'left') txt(W / 2, 140, m.name + ' LEFT', '#e8212b', 26);
  else if (m.t === 'end') netLost('The host left the game.');
}
// Lost the connection to the room: back to the title with a message
function netLost(why) {
  const was = NET.on;
  netEndMatch();
  rtcClose();
  netReset();
  if (was && typeof onlineGone === 'function') onlineGone(why);
}
// ===== MATCHES =====
// Host: start a match for everyone. The input delay comes from the slowest player's measured lag.
function netStart() {
  if (!NET.host || NET.match) return;
  const live = NET.players.filter(p => !p.left);
  if (NET.mode === 'vs' && live.length < 2) return false;
  const rtt = Math.max(0, ...live.map(p => p.rtt || 0)),
    D = Math.max(3, Math.min(12, Math.ceil(rtt / 16.67) + 2)),
    msg = {
      t: 'start',
      e: NET.epoch + 1,
      seed: (Math.random() * 4294967296) >>> 0,
      mode: NET.mode,
      D,
      feel: { ...FEEL },
      players: NET.players.filter(p => !p.left).map(p => ({ slot: p.slot, name: p.name, f: p.f, cid: p.cid }))
    };
  netAll(msg);
  netStartLocal(msg);
  return true;
}
function netStartLocal(m) {
  if (!NET.match) NET.feelKeep = { ...FEEL };
  // everyone plays with the host's feel settings, or the simulations would drift apart
  Object.assign(FEEL, m.feel);
  Object.assign(NET, {
    match: true,
    epoch: m.e,
    seed: m.seed,
    D: m.D,
    simF: 0,
    sendF: m.D,
    outF: 0,
    wait: 0
  });
  NET.mode = m.mode;
  NET.roster = m.players;
  NET.conf.clear();
  NET.tab.clear();
  NET.hashes.clear();
  NETIN.forEach((I, i) => (NETIN[i] = mkSlot()));
  // the first D frames have no buttons
  for (let f = 0; f < m.D; f++)
    NET.conf.set(
      f,
      m.players.map(() => 0)
    );
  if (NET.host) NET.outF = m.D;
  ROSTER = m.players.map(p => {
    const L = netLook(p);
    return { slot: p.slot, dev: 'net', col: L.col, d2: L.d2, name: L.name, look: L };
  });
  releaseAll();
  applyTouchVis();
  fr = 0;
  if (m.mode === 'vs') startVersus();
  else if (m.mode === 'level') startLevel('woods1');
  else start();
  fr = 0;
}
// Commands from the host after a match ends: play again, continue from the checkpoint, or back to the room
function netCmd(c) {
  if (!NET.host) return;
  if (c === 'again' || c === 'cont') {
    const m = { t: 'cmd', c, e: NET.epoch + 1, seed: (Math.random() * 4294967296) >>> 0, at: NET.simF };
    netAll(m);
    netCmdLocal(m);
  } else {
    netAll({ t: 'cmd', c: 'room' });
    netCmdLocal({ c: 'room' });
  }
}
function netCmdLocal(m) {
  // a client a few frames behind first plays up to where the host was, so everyone continues from the same spot
  if (!NET.host && m.at && NET.match)
    while (NET.simF < m.at && NET.conf.has(NET.simF) && state === 'play') netStep(NET.conf.get(NET.simF));
  if (m.c === 'room') {
    netEndMatch();
    if (typeof openOnline === 'function') openOnline();
    return;
  }
  Object.assign(NET, {
    epoch: m.e,
    seed: m.seed,
    simF: 0,
    sendF: NET.D,
    outF: NET.host ? NET.D : 0,
    wait: 0
  });
  NET.conf.clear();
  NET.tab.clear();
  NET.hashes.clear();
  for (let f = 0; f < NET.D; f++)
    NET.conf.set(
      f,
      NET.roster.map(() => 0)
    );
  NETIN.forEach((I, i) => (NETIN[i] = mkSlot()));
  fr = 0;
  if (m.c === 'cont') continueLevel();
  else if (NET.mode === 'vs') startVersus();
  else if (NET.mode === 'level') startLevel('woods1');
  else start();
  fr = 0;
}
function netEndMatch() {
  if (!NET.match) return;
  NET.match = false;
  if (NET.feelKeep) Object.assign(FEEL, NET.feelKeep);
  NET.feelKeep = null;
  ROSTER = [];
  applyTouchVis();
}
// ===== LOCKSTEP =====
// Host: a player's buttons for frame f arrived. Send out every frame that is now complete.
function netInput(slot, f, m) {
  if (f < NET.outF) return;
  if (!NET.tab.has(f)) NET.tab.set(f, {});
  NET.tab.get(f)[slot] = m | 0;
  netFlush();
}
function netFlush() {
  if (!NET.host || !NET.match) return;
  for (;;) {
    const row = NET.tab.get(NET.outF) || {},
      need = NET.roster.filter(p => NET.players.some(q => q.slot === p.slot && !q.left));
    if (!need.every(p => p.slot in row)) break;
    const m = NET.roster.map(p => row[p.slot] | 0);
    netAll({ t: 'F', e: NET.epoch, f: NET.outF, m });
    NET.conf.set(NET.outF, m);
    NET.tab.delete(NET.outF);
    NET.outF++;
  }
}
// Every 1/60 s during an online match: send my buttons, then simulate whatever frames have arrived.
function netTick() {
  if (state !== 'play') return;
  // my buttons for a frame D ahead (none while my pause menu is open); don't run too far ahead of the game
  if (NET.sendF < NET.simF + NET.D + 4) {
    const m = paused ? 0 : maskOf(INP[NET.mySlot].K);
    if (NET.host) netInput(NET.mySlot, NET.sendF, m);
    else netSend(NET.hostId, { t: 'i', e: NET.epoch, f: NET.sendF, m });
    NET.sendF++;
  }
  // catch up if several frames are waiting, otherwise one per tick
  let n = NET.conf.size > 3 ? 2 : 1;
  while (n-- > 0 && state === 'play') {
    const m = NET.conf.get(NET.simF);
    if (!m) {
      NET.wait++;
      return;
    }
    NET.wait = 0;
    netStep(m);
  }
}
// One simulation frame with everyone's buttons m
function netStep(m) {
  NET.conf.delete(NET.simF);
  NET.roster.forEach((p, i) => applyMask(NETIN[p.slot], m[i] | 0));
  fr++;
  update();
  NET.simF++;
  if (NET.simF % 120 === 0) {
    const h = simHash();
    if (NET.host) NET.hashes.set(NET.simF, h);
    else netSend(NET.hostId, { t: 'h', e: NET.epoch, f: NET.simF, h });
    if (NET.hashes.size > 20) NET.hashes.delete(NET.hashes.keys().next().value);
  }
}
function netDesync() {
  netAll({ t: 'desync' });
  netDesyncLocal();
}
function netDesyncLocal() {
  netEndMatch();
  if (typeof openOnline === 'function')
    openOnline('The games got out of sync, so the match stopped. Start it again!');
}
