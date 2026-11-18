// Orange vs. the Pink Army: Online connection layer (M11): WebRTC data channels between browsers
// ===== CONNECTION (M11) =====
// This file only moves messages between devices; it knows nothing about the game. The match code (session.js)
// talks to it through four calls and four callbacks, so a different connection (Steam networking, a relay server)
// can replace this file later without touching the game:
//   rtcHost(code)   become the host of room `code`          rtcJoin(code)  connect to the host of room `code`
//   rtcSend(id, m)  send message m (an object) to peer id   rtcClose()     hang up everything
//   RTC.on.peer(id) someone connected      RTC.on.msg(id, m) a message arrived
//   RTC.on.gone(id) someone left           RTC.on.err(text)  something went wrong (shown to the player)
//
// How devices find each other: a free public "signaling" server (the PeerJS cloud server, spoken to directly in
// plain JavaScript; no library) passes the first hello between them. A host registers as "orangearmy-<code>";
// a joiner sends it an offer. After that the devices talk directly (peer to peer), and STUN servers help them get
// through home routers. A few strict networks need a TURN relay; add one to NETCFG.ice if that ever happens.
const NETCFG = {
  signal: 'wss://0.peerjs.com/peerjs?key=peerjs',
  ice: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }],
  idPrefix: 'orangearmy-'
};
{
  // tests (and a future private server) can point the game at another signaling server: ?signal=ws://...
  const m = /[?&]signal=([^&]+)/.exec(location.search);
  if (m) NETCFG.signal = decodeURIComponent(m[1]);
}
const RTC = { ws: null, me: null, hb: 0, peers: {}, on: { peer() {}, msg() {}, gone() {}, err() {} } };
// The signaling socket: resolves once the server has accepted our id
function rtcSignal(id) {
  return new Promise((ok, bad) => {
    const tok = Math.random().toString(36).slice(2),
      sep = NETCFG.signal.includes('?') ? '&' : '?',
      ws = new WebSocket(
        NETCFG.signal + sep + 'id=' + encodeURIComponent(id) + '&token=' + tok + '&version=1.5.4'
      );
    let opened = false;
    RTC.ws = ws;
    RTC.me = id;
    ws.onmessage = ev => {
      let m;
      try {
        m = JSON.parse(ev.data);
      } catch (e) {
        return;
      }
      if (m.type === 'OPEN') {
        opened = true;
        clearInterval(RTC.hb);
        RTC.hb = setInterval(() => ws.readyState === 1 && ws.send('{"type":"HEARTBEAT"}'), 5000);
        ok();
      } else if (m.type === 'ID-TAKEN') bad('taken');
      else if (m.type === 'ERROR') bad((m.payload && m.payload.msg) || 'error');
      else if (m.type === 'EXPIRE') RTC.on.err('NOROOM');
      else if (m.src && m.payload) rtcSignalMsg(m);
    };
    ws.onerror = () => !opened && bad('offline');
    ws.onclose = () => {
      clearInterval(RTC.hb);
      if (!opened) bad('offline');
    };
  });
}
const sigSend = (dst, type, payload) =>
  RTC.ws && RTC.ws.readyState === 1 && RTC.ws.send(JSON.stringify({ type, dst, payload }));
function rtcPeer(id) {
  const pc = new RTCPeerConnection({ iceServers: NETCFG.ice }),
    P = { id, pc, ch: null, open: false };
  RTC.peers[id] = P;
  pc.onicecandidate = e =>
    e.candidate && sigSend(id, 'CANDIDATE', { cand: e.candidate.toJSON(), type: 'data' });
  pc.onconnectionstatechange = () => {
    if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) rtcDrop(id);
  };
  return P;
}
function rtcChannel(P, ch) {
  P.ch = ch;
  ch.onopen = () => {
    P.open = true;
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
// Messages from the signaling server: offers (to the host), answers (to joiners) and network candidates
async function rtcSignalMsg(m) {
  const pl = m.payload;
  let P = RTC.peers[m.src];
  try {
    if (m.type === 'OFFER') {
      if (P) rtcDrop(m.src);
      P = rtcPeer(m.src);
      P.pc.ondatachannel = e => rtcChannel(P, e.channel);
      await P.pc.setRemoteDescription(pl.sdp);
      await P.pc.setLocalDescription(await P.pc.createAnswer());
      sigSend(m.src, 'ANSWER', { sdp: P.pc.localDescription, type: 'data' });
      for (const c of P.wait || []) await P.pc.addIceCandidate(c);
      P.wait = null;
    } else if (m.type === 'ANSWER' && P) {
      await P.pc.setRemoteDescription(pl.sdp);
      for (const c of P.wait || []) await P.pc.addIceCandidate(c);
      P.wait = null;
    } else if (m.type === 'CANDIDATE' && pl.cand) {
      if (!P) return;
      if (!P.pc.remoteDescription) (P.wait = P.wait || []).push(pl.cand);
      else await P.pc.addIceCandidate(pl.cand);
    }
  } catch (e) {
    RTC.on.err('CONNECT');
  }
}
// Host a room: register as orangearmy-<code>. Rejects with 'taken' if that room exists.
function rtcHost(code) {
  rtcClose();
  return rtcSignal(NETCFG.idPrefix + code.toLowerCase());
}
// Join a room: register under a random id, then offer a connection to the host
async function rtcJoin(code) {
  rtcClose();
  await rtcSignal(NETCFG.idPrefix + 'p' + Math.random().toString(36).slice(2, 12));
  const host = NETCFG.idPrefix + code.toLowerCase(),
    P = rtcPeer(host);
  rtcChannel(P, P.pc.createDataChannel('game', { ordered: true }));
  await P.pc.setLocalDescription(await P.pc.createOffer());
  sigSend(host, 'OFFER', { sdp: P.pc.localDescription, type: 'data', connectionId: 'oa' + Date.now() });
  return host;
}
function rtcSend(id, m) {
  const P = RTC.peers[id];
  if (P && P.open && P.ch.readyState === 'open') P.ch.send(JSON.stringify(m));
}
function rtcClose() {
  for (const id in RTC.peers) {
    const P = RTC.peers[id];
    delete RTC.peers[id];
    try {
      P.pc.close();
    } catch (e) {}
  }
  clearInterval(RTC.hb);
  if (RTC.ws) {
    RTC.ws.onclose = null;
    try {
      RTC.ws.close();
    } catch (e) {}
  }
  RTC.ws = null;
}
