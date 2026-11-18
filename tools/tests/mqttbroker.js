// Tiny MQTT 3.1.1 broker over WebSocket for local tests (QoS 0 only). node mqttbroker.js PORT
const http = require('http'), crypto = require('crypto');
const port = +process.argv[2] || 9320, subs = new Map(); // topic -> Set(sock)
function frame(sock, data) {
  let hdr;
  if (data.length < 126) hdr = Buffer.from([0x82, data.length]);
  else if (data.length < 65536) { hdr = Buffer.alloc(4); hdr[0] = 0x82; hdr[1] = 126; hdr.writeUInt16BE(data.length, 2); }
  else { hdr = Buffer.alloc(10); hdr[0] = 0x82; hdr[1] = 127; hdr.writeBigUInt64BE(BigInt(data.length), 2); }
  try { sock.write(Buffer.concat([hdr, data])); } catch (e) {}
}
const pkt = (type, body) => { const len = []; let n = body.length; do { let b = n % 128; n = Math.floor(n / 128); if (n) b |= 128; len.push(b); } while (n); return Buffer.concat([Buffer.from([type, ...len]), body]); };
const srv = http.createServer((q, r) => { r.writeHead(200); r.end('ok'); });
srv.on('upgrade', (req, sock) => {
  const acc = crypto.createHash('sha1').update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + acc + '\r\nSec-WebSocket-Protocol: mqtt\r\n\r\n');
  let wbuf = Buffer.alloc(0), mbuf = Buffer.alloc(0);
  const onMqtt = d => {
    mbuf = Buffer.concat([mbuf, d]);
    for (;;) {
      if (mbuf.length < 2) return;
      let len = 0, mul = 1, i = 1;
      for (;;) { if (i >= mbuf.length) return; const b = mbuf[i++]; len += (b & 127) * mul; mul *= 128; if (!(b & 128)) break; }
      if (mbuf.length < i + len) return;
      const type = mbuf[0] >> 4, body = mbuf.slice(i, i + len); mbuf = mbuf.slice(i + len);
      if (type === 1) frame(sock, pkt(0x20, Buffer.from([0, 0])));
      else if (type === 8) { const tl = body.readUInt16BE(2), t = body.slice(4, 4 + tl).toString(); if (!subs.has(t)) subs.set(t, new Set()); subs.get(t).add(sock); frame(sock, pkt(0x90, Buffer.from([body[0], body[1], 0]))); }
      else if (type === 3) { const tl = body.readUInt16BE(0), t = body.slice(2, 2 + tl).toString(); for (const s of subs.get(t) || []) frame(s, pkt(0x30, body)); }
      else if (type === 12) frame(sock, pkt(0xd0, Buffer.alloc(0)));
    }
  };
  sock.on('data', d => {
    wbuf = Buffer.concat([wbuf, d]);
    for (;;) {
      if (wbuf.length < 2) return;
      const op = wbuf[0] & 15; let len = wbuf[1] & 127, off = 2;
      if (len === 126) { if (wbuf.length < 4) return; len = wbuf.readUInt16BE(2); off = 4; } else if (len === 127) { if (wbuf.length < 10) return; len = Number(wbuf.readBigUInt64BE(2)); off = 10; }
      const mk = wbuf.slice(off, off + 4); off += 4; if (wbuf.length < off + len) return;
      const pl = Buffer.from(wbuf.slice(off, off + len)); for (let i = 0; i < pl.length; i++) pl[i] ^= mk[i & 3]; wbuf = wbuf.slice(off + len);
      if (op === 8) { sock.end(); return; }
      if (op === 2 || op === 0) onMqtt(pl);
    }
  });
  const bye = () => { for (const s of subs.values()) s.delete(sock); };
  sock.on('close', bye); sock.on('error', bye);
});
srv.listen(port, () => console.log('mqtt on', port));
