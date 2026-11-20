// StickFighters: Online connection layer: WebRTC data channels between browsers
// ===== CONNECTION =====
// This file only moves messages between devices; it knows nothing about the game. The match code (session.js)
// talks to it through four calls and a few callbacks, so a different connection (Steam networking, our own
// server) can replace this file later without touching the game:
//   rtcHost(code)   become the host of room `code`          rtcJoin(code)  connect to the host of room `code`
//   rtcSend(id, m)  send message m (an object) to peer id   rtcClose()     hang up everything
//   RTC.on.peer(id) someone connected      RTC.on.msg(id, m) a message arrived      RTC.on.gone(id) someone left
//   RTC.on.err(code) something went wrong  RTC.on.stage(text) progress for the screen
//
// How devices find each other ("signaling"): the first hello between two devices goes through free public
// servers. Several kinds are used at once and whichever gets through first wins, so one being down or blocked
// doesn't stop play (after the first real test failed):
//   PeerJS cloud server   a host registers as "orangearmy-<code>", a joiner sends it an offer
//   MQTT brokers          public message boards; a host listens on "orangearmy/v1/orangearmy-<code>"
// Both are spoken to in plain JavaScript (no libraries). After the hello the devices talk directly (peer to
// peer); STUN servers help them through home routers, and a TURN relay carries the game when two networks
// won't connect directly.
const NETCFG = {
  peerjs: ['wss://0.peerjs.com/peerjs?key=peerjs'],
  mqtt: [
    'wss://broker.emqx.io:8084/mqtt',
    'wss://broker.hivemq.com:8884/mqtt',
    'wss://test.mosquitto.org:8081/mqtt'
  ],
  ice: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
    { urls: 'stun:stun.cloudflare.com:3478' }
  ],
  // relay (TURN) for networks that won't connect directly: the Open Relay Project's public server. Its login is
  // made from a shared secret (coturn's time-limited scheme, see turnLogin below). If it ever stops working, a free
  // Metered account (20 GB a month) gives our own; put it here.
  relay: {
    urls: [
      'turn:staticauth.openrelay.metered.ca:80',
      'turn:staticauth.openrelay.metered.ca:443',
      'turn:staticauth.openrelay.metered.ca:443?transport=tcp'
    ],
    secret: 'openrelayprojectsecret'
  },
  idPrefix: 'orangearmy-',
  topic: 'orangearmy/v1/'
};
{
  // tests (and a future private server) can point the game at other servers: ?signal=ws://... (PeerJS-style),
  // ?mqtt=ws://a,ws://b (MQTT brokers; when only ?signal is given, no MQTT is used)
  const q = k => {
    const m = new RegExp('[?&]' + k + '=([^&]*)').exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  };
  if (q('signal') !== null) {
    NETCFG.peerjs = q('signal') ? q('signal').split(',') : [];
    NETCFG.mqtt = [];
  }
  if (q('mqtt') !== null) NETCFG.mqtt = q('mqtt') ? q('mqtt').split(',') : [];
  if (q('relay') === '0') NETCFG.relay = null;
}
// TURN login from a shared secret: username = expiry time, password = HMAC-SHA1 of it (coturn's REST scheme)
(async function turnLogin() {
  const R = NETCFG.relay;
  if (!R || !window.crypto || !crypto.subtle) return;
  try {
    const user = Math.floor(Date.now() / 1000) + 24 * 3600 + ':orangearmy',
      key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(R.secret),
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
      ),
      sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(user)));
    NETCFG.ice.push({ urls: R.urls, username: user, credential: btoa(String.fromCharCode(...sig)) });
  } catch (e) {}
})();
const RTC = {
  me: null,
  sig: [], // signaling connections that are up
  seen: new Set(), // messages already handled (the same one can arrive by several routes)
  peers: {},
  diag: {}, // which signaling servers answered, for the screen
  on: { peer() {}, msg() {}, gone() {}, err() {}, stage() {} }
};
// ===== SIGNALING: PEERJS CLOUD =====
function sigPeerjs(url, id) {
  return new Promise((ok, bad) => {
    const tok = Math.random().toString(36).slice(2),
      ws = new WebSocket(
        url +
          (url.includes('?') ? '&' : '?') +
          'id=' +
          encodeURIComponent(id) +
          '&token=' +
          tok +
          '&version=1.5.4'
      );
    let hb = 0,
      up = false;
    const S = {
      name: 'peerjs',
      send: m => ws.readyState === 1 && ws.send(JSON.stringify(m)),
      close() {
        clearInterval(hb);
        ws.onclose = null;
        try {
          ws.close();
        } catch (e) {}
      }
    };
    ws.onmessage = ev => {
      let m;
      try {
        m = JSON.parse(ev.data);
      } catch (e) {
        return;
      }
      if (m.type === 'OPEN') {
        up = true;
        hb = setInterval(() => ws.readyState === 1 && ws.send('{"type":"HEARTBEAT"}'), 5000);
        ok(S);
      } else if (m.type === 'ID-TAKEN') bad('taken');
      else if (m.type === 'ERROR') bad('error');
      else if (m.src && m.payload) rtcSignalMsg(m);
    };
    ws.onerror = () => !up && bad('offline');
    ws.onclose = () => {
      clearInterval(hb);
      if (!up) bad('offline');
    };
  });
}
// ===== SIGNALING: MQTT (3.1.1 over a websocket, the few packets we need) =====
const utf8 = s => new TextEncoder().encode(s);
function mqttPacket(type, body) {
  const len = [];
  let n = body.length;
  do {
    let b = n % 128;
    n = Math.floor(n / 128);
    if (n) b |= 128;
    len.push(b);
  } while (n);
  const out = new Uint8Array(1 + len.length + body.length);
  out[0] = type;
  out.set(len, 1);
  out.set(body, 1 + len.length);
  return out;
}
const mqttStr = s => {
  const b = utf8(s);
  return [b.length >> 8, b.length & 255, ...b];
};
function sigMqtt(url, id) {
  return new Promise((ok, bad) => {
    let ws;
    try {
      ws = new WebSocket(url, 'mqtt');
    } catch (e) {
      return bad('offline');
    }
    ws.binaryType = 'arraybuffer';
    let ping = 0,
      up = false,
      buf = new Uint8Array(0);
    const S = {
      name: 'mqtt',
      send: m =>
        ws.readyState === 1 &&
        ws.send(
          mqttPacket(
            0x30,
            Uint8Array.from([...mqttStr(NETCFG.topic + m.dst), ...utf8(JSON.stringify({ ...m, src: id }))])
          )
        ),
      close() {
        clearInterval(ping);
        ws.onclose = null;
        try {
          ws.close();
        } catch (e) {}
      }
    };
    ws.onopen = () => {
      const cid = 'oa' + Math.random().toString(36).slice(2, 14);
      ws.send(mqttPacket(0x10, Uint8Array.from([...mqttStr('MQTT'), 4, 2, 0, 60, ...mqttStr(cid)])));
    };
    ws.onmessage = ev => {
      const add = new Uint8Array(ev.data),
        all = new Uint8Array(buf.length + add.length);
      all.set(buf);
      all.set(add, buf.length);
      buf = all;
      for (;;) {
        if (buf.length < 2) return;
        let len = 0,
          mul = 1,
          i = 1;
        for (;;) {
          if (i >= buf.length) return;
          const b = buf[i++];
          len += (b & 127) * mul;
          mul *= 128;
          if (!(b & 128)) break;
        }
        if (buf.length < i + len) return;
        const type = buf[0] >> 4,
          qos = (buf[0] >> 1) & 3,
          body = buf.slice(i, i + len);
        buf = buf.slice(i + len);
        if (type === 2) {
          // CONNACK: listen on my own topic
          if (body[1] !== 0) return bad('error');
          ws.send(mqttPacket(0x82, Uint8Array.from([0, 1, ...mqttStr(NETCFG.topic + id), 0])));
        } else if (type === 9) {
          up = true;
          ping = setInterval(() => ws.readyState === 1 && ws.send(Uint8Array.from([0xc0, 0])), 30000);
          ok(S);
        } else if (type === 3) {
          const tl = (body[0] << 8) | body[1];
          let m;
          try {
            m = JSON.parse(new TextDecoder().decode(body.slice(2 + tl + (qos ? 2 : 0))));
          } catch (e) {
            continue;
          }
          if (m && m.src && m.payload) rtcSignalMsg(m);
        }
      }
    };
    ws.onerror = () => !up && bad('offline');
    ws.onclose = () => {
      clearInterval(ping);
      if (!up) bad('offline');
    };
  });
}
// Connect to every signaling server at once. Resolves when the first is ready (the rest join as they come);
// rejects if none can be reached. A host whose code is already taken on the PeerJS server gets 'taken'.
function rtcSignal(id) {
  RTC.me = id;
  RTC.diag = {};
  const all = [
    ...NETCFG.peerjs.map(u => ['PeerJS', sigPeerjs(u, id)]),
    ...NETCFG.mqtt.map((u, i) => ['MQTT ' + (i + 1), sigMqtt(u, id)])
  ];
  return new Promise((ok, bad) => {
    let settled = 0,
      done = false,
      taken = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(t1);
      clearTimeout(t2);
      if (RTC.sig.length) ok();
      else bad(taken ? 'taken' : 'offline');
    };
    // ready when every server has answered or failed; or 2.5 s after the first one is up; or after 9 s
    const t1 = setTimeout(finish, 9000);
    let t2 = 0;
    if (!all.length) return finish();
    for (const [name, p] of all) {
      RTC.diag[name] = '\u2026';
      p.then(
        S => {
          if (RTC.me !== id) return S.close();
          RTC.diag[name] = 'ok';
          RTC.sig.push(S);
          if (RTC.sig.length === 1) t2 = setTimeout(finish, 2500);
          if (++settled === all.length) finish();
        },
        e => {
          RTC.diag[name] = 'no';
          if (e === 'taken') taken = true;
          if (++settled === all.length) finish();
        }
      );
    }
  });
}
// Send a signaling message by every route; the receiver drops copies (n = the same nonce on each copy)
function sigSend(dst, type, payload) {
  const m = { type, dst, payload: { ...payload, n: Math.random().toString(36).slice(2) } };
  for (const S of RTC.sig) S.send(m);
}
// ===== PEER CONNECTIONS =====
function rtcPeer(id) {
  const pc = new RTCPeerConnection({ iceServers: NETCFG.ice }),
    P = { id, pc, ch: null, open: false, wait: [] };
  RTC.peers[id] = P;
  pc.onicecandidate = e => e.candidate && sigSend(id, 'CANDIDATE', { cand: e.candidate.toJSON() });
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
      if (!P.open && P.answered) RTC.on.err('BLOCKED');
      rtcDrop(id);
    }
  };
  return P;
}
function rtcChannel(P, ch) {
  P.ch = ch;
  ch.onopen = () => {
    P.open = true;
    clearTimeout(RTC.joinT);
    RTC.on.peer(P.id);
  };
  ch.onmessage = e => {
    let m;
    try {
      m = JSON.parse(e.data); // messages are data only, never code
    } catch (err) {
      return;
    }
    if (m && typeof m === 'object') RTC.on.msg(P.id, m);
  };
  ch.onclose = () => rtcDrop(P.id);
}
function rtcDrop(id) {
  const P = RTC.peers[id];
  if (!P) return;
  delete RTC.peers[id];
  try {
    P.pc.close();
  } catch (e) {}
  if (P.open) RTC.on.gone(id);
}
// Signaling messages: offers (to the host), answers (to joiners) and network candidates
async function rtcSignalMsg(m) {
  const pl = m.payload,
    key = m.src + m.type + (pl.n || '');
  if (RTC.seen.has(key)) return;
  RTC.seen.add(key);
  if (RTC.seen.size > 2000) RTC.seen.clear();
  let P = RTC.peers[m.src];
  try {
    if (m.type === 'OFFER') {
      if (P && P.cid === pl.cid) return;
      if (P) rtcDrop(m.src);
      P = rtcPeer(m.src);
      P.cid = pl.cid;
      P.answered = true;
      P.pc.ondatachannel = e => rtcChannel(P, e.channel);
      await P.pc.setRemoteDescription(pl.sdp);
      await P.pc.setLocalDescription(await P.pc.createAnswer());
      sigSend(m.src, 'ANSWER', { sdp: P.pc.localDescription, cid: pl.cid });
      for (const c of P.wait) await P.pc.addIceCandidate(c).catch(() => {});
      P.wait = [];
    } else if (m.type === 'ANSWER' && P && !P.answered && pl.cid === P.cid) {
      P.answered = true;
      RTC.on.stage('Found the room. Connecting…');
      // found the host; now the direct connection has 25 seconds to open
      clearTimeout(RTC.joinT);
      RTC.joinT = setTimeout(() => !P.open && RTC.on.err('BLOCKED'), 25000);
      await P.pc.setRemoteDescription(pl.sdp);
      for (const c of P.wait) await P.pc.addIceCandidate(c).catch(() => {});
      P.wait = [];
    } else if (m.type === 'CANDIDATE' && pl.cand && P) {
      if (!P.pc.remoteDescription) P.wait.push(pl.cand);
      else await P.pc.addIceCandidate(pl.cand).catch(() => {});
    }
  } catch (e) {
    RTC.on.err('CONNECT');
  }
}
// Host a room: listen as orangearmy-<code> everywhere. Rejects with 'taken' if that room exists.
function rtcHost(code) {
  rtcClose();
  return rtcSignal(NETCFG.idPrefix + code.toLowerCase());
}
// Join a room: listen under a random id, then offer a connection to the host by every route
async function rtcJoin(code) {
  rtcClose();
  RTC.on.stage('Reaching the online services…');
  await rtcSignal(NETCFG.idPrefix + 'p' + Math.random().toString(36).slice(2, 12));
  RTC.on.stage('Looking for room ' + code + '…');
  const host = NETCFG.idPrefix + code.toLowerCase(),
    P = rtcPeer(host);
  P.cid = 'c' + Math.random().toString(36).slice(2, 10);
  rtcChannel(P, P.pc.createDataChannel('game', { ordered: true }));
  await P.pc.setLocalDescription(await P.pc.createOffer());
  const offer = () =>
    !P.answered &&
    RTC.peers[host] === P &&
    sigSend(host, 'OFFER', { sdp: P.pc.localDescription, cid: P.cid });
  offer();
  // say it again a few times, in case a message board dropped the first one
  setTimeout(offer, 2500);
  setTimeout(offer, 6000);
  // no answer from the room at all: there's no room with that code (or the host can't be reached)
  clearTimeout(RTC.joinT);
  RTC.joinT = setTimeout(() => !P.answered && RTC.on.err('NOROOM'), 14000);
  return host;
}
// Connect directly to another device in the same room (guests connecting to each other)
async function rtcConnect(id) {
  if (RTC.peers[id]) return;
  const P = rtcPeer(id);
  P.cid = 'c' + Math.random().toString(36).slice(2, 10);
  rtcChannel(P, P.pc.createDataChannel('game', { ordered: true }));
  await P.pc.setLocalDescription(await P.pc.createOffer());
  const offer = () =>
    !P.answered && RTC.peers[id] === P && sigSend(id, 'OFFER', { sdp: P.pc.localDescription, cid: P.cid });
  offer();
  setTimeout(offer, 2500);
  setTimeout(offer, 6000);
}
function rtcSend(id, m) {
  const P = RTC.peers[id];
  if (P && P.open && P.ch.readyState === 'open') P.ch.send(JSON.stringify(m));
}
function rtcClose() {
  clearTimeout(RTC.joinT);
  for (const id in RTC.peers) {
    const P = RTC.peers[id];
    delete RTC.peers[id];
    try {
      P.pc.close();
    } catch (e) {}
  }
  for (const S of RTC.sig) S.close();
  RTC.sig = [];
  RTC.me = null;
}
// Which online services answered, for the screen (helps find what's blocked)
const rtcDiag = () =>
  Object.entries(RTC.diag)
    .map(([k, v]) => k + ' ' + v)
    .join(' · ');
