// Orange vs. the Pink Army: Online matches (M11): the room, and lockstep play over the connection in rtc.js
// ===== ONLINE SESSION (M11) =====
// Three layers, so matchmaking or Steam can replace one without the others (see docs/ARCHITECTURE.md):
//   connection  rtc.js: moves messages between devices
//   room        who's in (up to 4), their fighters, the mode; the host decides and tells everyone
//   lockstep    every device runs the same simulation (VISION.md rule R2) and only button presses travel.
// Lockstep (direct, M11 patch): each device sends its buttons for frame f + D straight to every other device
// (D = input delay, from the measured lag; one trip, not a round trip through the host). Guests connect to each
// other too; where two guests can't, the host passes their buttons along. A device simulates frame f once it has
// everyone's buttons for it. Every 2 seconds the guests send a fingerprint of the game state to the host, which
// checks that everyone still matches. The host still decides the room, starts and ends matches, and when a player
// leaves it announces the frame their buttons stop, so every device removes them at the same moment.
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
  tab: new Map(), // frame -> { slot: buttons } received so far
  hist: {}, // host: slot -> Map(frame -> buttons) of recent frames, to resend if a direct link breaks
  stop: {}, // slot -> first frame without that player (they left)
  links: new Set(), // guests: other guests I'm connected to directly
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
  NET.tab.clear();
  NET.hashes.clear();
  NET.links.clear();
  NET.hist = {};
  NET.stop = {};
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
  Object.assign(NET, { on: true, host: false, code });
  // the promise settles when the host welcomes us, or the connection layer reports NOROOM / BLOCKED
  const wait = new Promise((ok, bad) => {
    NET.joinWait = { ok, bad };
    NET.joinT = setTimeout(() => bad('BLOCKED'), 45000);
  });
  try {
    NET.hostId = await rtcJoin(code);
  } catch (e) {
    clearTimeout(NET.joinT);
    NET.joinWait = null;
    throw e;
  }
  return wait;
}
function netLeave() {
  if (NET.host) netAll({ t: 'end' });
  else {
    // tell everyone the last frame I sent, so they all stop using my buttons at the same frame
    const bye = { t: 'bye', f: NET.sendF - 1, e: NET.epoch };
    if (NET.hostId) netSend(NET.hostId, bye);
  }
  netEndMatch();
  setTimeout(rtcClose, 200);
  netReset();
}
// ===== MESSAGES =====
RTC.on.peer = id => {
  if (!NET.on) return;
  if (NET.host) return; // guests introduce themselves with 'hello'
  if (id === NET.hostId) {
    // connected to the host: say hello with my fighter and game version
    netSend(id, { t: 'hello', v: GAME_VERSION, f: myFighter() });
    clearInterval(NET.pingT);
    NET.pingT = setInterval(
      () => netSend(NET.hostId, { t: 'ping', ts: performance.now(), rtt: NET.rtt || 0 }),
      1000
    );
  } else {
    // a direct link to another guest
    NET.links.add(id);
    netLinks();
  }
};
RTC.on.gone = id => {
  if (!NET.on) return;
  if (!NET.host) {
    if (id === NET.hostId) netLost('The host left the game.');
    else {
      NET.links.delete(id);
      netLinks();
    }
    return;
  }
  netDrop(
    NET.players.find(p => p.id === id),
    null
  );
};
RTC.on.err = e => {
  if (NET.joinWait && (e === 'NOROOM' || e === 'BLOCKED')) {
    clearTimeout(NET.joinT);
    NET.joinWait.bad(e);
    NET.joinWait = null;
  } else if (typeof onlineMsg === 'function' && e === 'CONNECT' && NET.joinWait)
    onlineMsg('Couldn’t connect. Try again.');
};
RTC.on.stage = t => NET.joinWait && typeof onlineMsg === 'function' && onlineMsg(t);
RTC.on.msg = (id, m) => {
  if (!NET.on) return;
  if (NET.host) netHostMsg(id, m);
  else if (id === NET.hostId) netClientMsg(m);
  else if (m.t === 'i') netGotInput(m); // buttons straight from another guest
};
// Guests tell the host which guests they reach directly (the host passes buttons along for the others)
function netLinks() {
  if (!NET.host && NET.hostId)
    netSend(NET.hostId, { t: 'links', ids: [...NET.links], simF: NET.simF, e: NET.epoch });
}
// Host: a player left (p) at frame f (from their 'bye'), or their connection dropped (f = null)
function netDrop(p, f) {
  if (!p || p.left) return;
  if (!NET.match) {
    NET.players = NET.players.filter(q => q !== p);
    netRoomChanged();
    return;
  }
  p.left = true;
  const H = NET.hist[p.slot] || new Map(),
    last = f !== null && f !== undefined ? f : H.size ? Math.max(...H.keys()) : NET.simF - 1,
    stop = Math.max(last + 1, NET.D),
    hist = [];
  for (const [fr0, m] of H) if (fr0 < stop) hist.push([fr0, m]);
  const msg = { t: 'drop', e: NET.epoch, s: p.slot, f: stop, hist };
  netAll(msg);
  netDropLocal(msg);
  netRoomChanged();
}
function netDropLocal(m) {
  if (m.e !== NET.epoch || !NET.match) return;
  for (const [f, b] of m.hist || []) netStore(f, m.s, b);
  NET.stop[m.s] = m.f;
}
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
    NET.players.push({ slot, id, name: f.name, f, rtt: 0, links: [] });
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
  } else if (m.t === 'links') {
    const had = p.links || [];
    p.links = m.ids || [];
    // a link that just broke: resend what that guest may have missed from the other one
    if (NET.match && m.e === NET.epoch)
      for (const q of NET.players)
        if (q.id !== 'host' && had.includes(q.id) && !p.links.includes(q.id))
          for (const [f, b] of NET.hist[q.slot] || [])
            if (f >= m.simF) netSend(id, { t: 'i', e: NET.epoch, f, s: q.slot, m: b });
  } else if (m.t === 'i' && NET.match && m.e === NET.epoch) {
    netGotInput(m);
    // pass it along to guests who aren't connected to this guest directly
    for (const q of NET.players)
      if (q.id !== 'host' && q !== p && !q.left && !(q.links || []).includes(id)) netSend(q.id, m);
  } else if (m.t === 'h' && NET.match && m.e === NET.epoch) {
    // a guest can be a little ahead of the host: keep its fingerprint until the host gets to that frame
    const mine = NET.hashes.get(m.f);
    if (mine === undefined) (NET.gh[m.f] = NET.gh[m.f] || []).push(m.h);
    else if (mine !== m.h) netDesync();
  } else if (m.t === 'bye') netDrop(p, m.e === NET.epoch ? m.f : null);
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
    netMesh();
    if (typeof renderOnline === 'function') renderOnline();
  } else if (m.t === 'pong') NET.rtt = performance.now() - m.ts;
  else if (m.t === 'start') netStartLocal(m);
  else if (m.t === 'i') netGotInput(m);
  else if (m.t === 'drop') netDropLocal(m);
  else if (m.t === 'cmd') netCmdLocal(m);
  else if (m.t === 'desync') netDesyncLocal();
  else if (m.t === 'end') netLost('The host left the game.');
}
// Guests connect to each other: the newer player (higher slot) calls the older ones
function netMesh() {
  if (NET.host || !NET.hostId) return;
  for (const p of NET.players)
    if (p.id !== 'host' && !p.left && p.slot < NET.mySlot && !RTC.peers[p.id]) rtcConnect(p.id);
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
// Host: start a match for everyone. The input delay covers one trip between the two slowest players.
function netStart() {
  if (!NET.host || NET.match) return;
  const live = NET.players.filter(p => !p.left);
  if (NET.mode === 'vs' && live.length < 2) return false;
  const r = live.map(p => p.rtt || 0).sort((a, b) => b - a),
    oneWay = ((r[0] || 0) + (r[1] || 0)) / 2,
    D = Math.max(2, Math.min(10, Math.ceil(oneWay / 16.67) + 1)),
    msg = {
      t: 'start',
      e: NET.epoch + 1,
      seed: (Math.random() * 4294967296) >>> 0,
      mode: NET.mode,
      D,
      feel: { ...FEEL },
      players: live.map(p => ({ slot: p.slot, id: p.id, name: p.name, f: p.f, cid: p.cid }))
    };
  netAll(msg);
  netStartLocal(msg);
  return true;
}
// Fresh lockstep state for a match (start, play again, continue)
function netFresh(e) {
  Object.assign(NET, { epoch: e, simF: 0, sendF: NET.D, wait: 0 });
  NET.tab.clear();
  NET.hashes.clear();
  NET.hist = {};
  NET.stop = {};
  NET.gh = {};
  NETIN.forEach((I, i) => (NETIN[i] = mkSlot()));
  // the first D frames have no buttons
  for (let f = 0; f < NET.D; f++) for (const p of NET.roster) netStore(f, p.slot, 0);
}
function netStartLocal(m) {
  if (!NET.match) NET.feelKeep = { ...FEEL };
  // everyone plays with the host's feel settings, or the simulations would drift apart
  Object.assign(FEEL, m.feel);
  Object.assign(NET, { match: true, seed: m.seed, D: m.D });
  NET.mode = m.mode;
  NET.roster = m.players;
  netFresh(m.e);
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
  // a guest a few frames behind first plays up to where the host was, so everyone continues from the same spot
  if (!NET.host && m.at && NET.match) while (NET.simF < m.at && state === 'play' && netReady()) netStep();
  if (m.c === 'room') {
    netEndMatch();
    if (typeof openOnline === 'function') openOnline();
    return;
  }
  NET.seed = m.seed;
  netFresh(m.e);
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
function netStore(f, slot, m) {
  if (f < NET.simF) return;
  if (!NET.tab.has(f)) NET.tab.set(f, {});
  NET.tab.get(f)[slot] = m | 0;
  if (NET.host) {
    const H = NET.hist[slot] || (NET.hist[slot] = new Map());
    H.set(f, m | 0);
    if (H.size > 600) H.delete(H.keys().next().value);
  }
}
function netGotInput(m) {
  if (!NET.match || m.e !== NET.epoch) return;
  if (NET.stop[m.s] !== undefined && m.f >= NET.stop[m.s]) return;
  netStore(m.f, m.s, m.m);
}
// Players whose buttons a frame needs: everyone in the match except those who left before it
const netNeed = f => NET.roster.filter(p => !(NET.stop[p.slot] !== undefined && f >= NET.stop[p.slot]));
function netReady() {
  const row = NET.tab.get(NET.simF);
  return !!row && netNeed(NET.simF).every(p => p.slot in row);
}
// Send my buttons for a frame to everyone: the host to all guests; a guest to the host and the guests it reaches
function netSendInput(f, m) {
  const msg = { t: 'i', e: NET.epoch, f, s: NET.mySlot, m };
  netStore(f, NET.mySlot, m);
  if (NET.host) netAll(msg);
  else {
    netSend(NET.hostId, msg);
    for (const id of NET.links) netSend(id, msg);
  }
}
// Every 1/60 s during an online match: send my buttons, then simulate whatever frames are ready.
function netTick() {
  if (state !== 'play') return;
  // my buttons for a frame D ahead (none while my pause menu is open); don't run too far ahead of the game
  if (NET.sendF < NET.simF + NET.D + 4) {
    netSendInput(NET.sendF, paused ? 0 : maskOf(INP[NET.mySlot].K));
    NET.sendF++;
  }
  // catch up if several frames are waiting, otherwise one per tick
  let n = NET.tab.has(NET.simF + 3) ? 2 : 1;
  while (n-- > 0 && state === 'play') {
    if (!netReady()) {
      NET.wait++;
      return;
    }
    NET.wait = 0;
    netStep();
  }
}
// One simulation frame. A player whose buttons stop at this frame (they left) is taken out of the fight first:
// their fighter falls and dissolves like a defeated enemy (the same moment on every device).
function netStep() {
  const f = NET.simF,
    row = NET.tab.get(f) || {};
  NET.tab.delete(f);
  for (const s in NET.stop) if (NET.stop[s] === f) playerLeft(+s);
  for (const p of NET.roster)
    applyMask(NETIN[p.slot], NET.stop[p.slot] !== undefined && f >= NET.stop[p.slot] ? 0 : row[p.slot] | 0);
  fr++;
  update();
  // players who left are gone once their body has dissolved
  if (PL.some(p => p.left && p.gone)) {
    const out = PL.filter(p => p.left && p.gone).map(p => p.slot);
    PL = PL.filter(p => !out.includes(p.slot));
  }
  NET.simF++;
  if (NET.simF % 120 === 0) {
    const h = simHash();
    if (NET.host) {
      NET.hashes.set(NET.simF, h);
      const theirs = NET.gh[NET.simF] || [];
      delete NET.gh[NET.simF];
      if (theirs.some(x => x !== h)) return netDesync();
    } else netSend(NET.hostId, { t: 'h', e: NET.epoch, f: NET.simF, h });
    if (NET.hashes.size > 20) NET.hashes.delete(NET.hashes.keys().next().value);
  }
}
function playerLeft(slot) {
  const p = PL.find(q => q.slot === slot);
  if (!p || p.left) return;
  p.left = 1;
  // out of the match from now on (a new Versus round won't bring them back)
  ROSTER = ROSTER.filter(r => r.slot !== slot);
  NET.roster = NET.roster.filter(r => r.slot !== slot);
  txt(p.x, p.y - 140, p.name + ' LEFT', p.col, 22);
  if (p.st !== 'dead')
    Object.assign(p, {
      hp: 0,
      st: 'dead',
      dk: 'sprawl',
      ddir: -p.face,
      vx: 0,
      vy: -4,
      sp: 0,
      deadT: 0,
      att: null
    });
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
