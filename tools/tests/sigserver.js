// Minimal PeerJS-protocol signaling server for local tests (no npm). node sigserver.js PORT
const http = require('http'), crypto = require('crypto');
const port = +process.argv[2] || 9311, clients = new Map();
function send(sock, obj) {
  const data = Buffer.from(JSON.stringify(obj));
  let hdr;
  if (data.length < 126) hdr = Buffer.from([0x81, data.length]);
  else if (data.length < 65536) { hdr = Buffer.alloc(4); hdr[0] = 0x81; hdr[1] = 126; hdr.writeUInt16BE(data.length, 2); }
  else { hdr = Buffer.alloc(10); hdr[0] = 0x81; hdr[1] = 127; hdr.writeBigUInt64BE(BigInt(data.length), 2); }
  try { sock.write(Buffer.concat([hdr, data])); } catch (e) {}
}
const srv = http.createServer((q, r) => { r.writeHead(200); r.end('ok'); });
srv.on('upgrade', (req, sock) => {
  const key = req.headers['sec-websocket-key'], url = new URL(req.url, 'http://x'), id = url.searchParams.get('id');
  const acc = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + acc + '\r\n\r\n');
  if (clients.has(id)) { send(sock, { type: 'ID-TAKEN', payload: { msg: 'taken' } }); sock.end(); return; }
  clients.set(id, sock);
  send(sock, { type: 'OPEN' });
  let buf = Buffer.alloc(0);
  sock.on('data', d => {
    buf = Buffer.concat([buf, d]);
    for (;;) {
      if (buf.length < 2) return;
      const op = buf[0] & 15; let len = buf[1] & 127, off = 2;
      if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
      const masked = buf[1] & 128, mk = masked ? buf.slice(off, off + 4) : null; if (masked) off += 4;
      if (buf.length < off + len) return;
      const pl = buf.slice(off, off + len); if (masked) for (let i = 0; i < pl.length; i++) pl[i] ^= mk[i & 3];
      buf = buf.slice(off + len);
      if (op === 8) { sock.end(); return; }
      if (op !== 1) continue;
      let m; try { m = JSON.parse(pl.toString()); } catch (e) { continue; }
      if (m.type === 'HEARTBEAT') continue;
      const dst = clients.get(m.dst);
      if (dst) send(dst, { ...m, src: id });
      else setTimeout(() => send(sock, { type: 'EXPIRE', src: m.dst }), 300);
    }
  });
  const bye = () => { if (clients.get(id) === sock) clients.delete(id); };
  sock.on('close', bye); sock.on('error', bye);
});
srv.listen(port, () => console.log('signal on', port));
