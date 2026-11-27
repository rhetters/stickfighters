const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// Wi-Fi packet loss: now and then a message on the reliable game channel is "lost" and resent 400 ms later, holding
// up everything behind it (that's what an ordered, reliable channel does). Buttons also travel on the fast channel,
// so the game should keep running smoothly instead of freezing and jumping.
const {chromium}=require('playwright');const {spawn}=require('child_process');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const srv=spawn('node',[__dirname+'/sigserver.js','9314']);await new Promise(r=>setTimeout(r,400));
const b=await chromium.launch();const url=GAME+'?signal='+encodeURIComponent('ws://127.0.0.1:9314/peerjs?key=peerjs');
const errs=[];const mk=async(n)=>{const c=await b.newContext();const p=await c.newPage();p.on('pageerror',e=>errs.push(n+': '+e.message));await p.goto(url);await p.waitForTimeout(300);await p.evaluate(()=>{SET.tut=1;titleOpenAll()});return p};
const H=await mk('H'),G=await mk('G');
// head-of-line blocking on the game channel: 1 message in 30 is held 400 ms, and everything sent after it waits too
const hol=`{const s=rtcSend;let until=0;rtcSend=(id,m)=>{const now=performance.now();if(now>until&&Math.random()<1/30)until=now+400;const d=Math.max(0,until-now);d?setTimeout(()=>s(id,m),d):s(id,m)};}`;
await H.evaluate(()=>{$('b-online').click();$('on-host').click()});await H.waitForTimeout(3000);const code=await H.evaluate(()=>NET.code);
await G.evaluate(code=>{$('b-online').click();const [w,n]=code.split('-');ONC.w=ROOM_WORDS.indexOf(w);ONC.a=+n[0];ONC.b=+n[1];renderOnline();$('on-join').click();},code);await G.waitForTimeout(2500);
ok(await G.evaluate(()=>{const P=RTC.peers[NET.hostId];return !!(P&&P.fast&&P.fast.readyState==='open')}),'the fast channel for buttons is open');
await H.evaluate(hol);await G.evaluate(hol);
await H.evaluate(()=>{NET.mode='vs';netRoomChanged();netStart()});await G.waitForTimeout(1000);
// count the longest freeze: frames in a row where the game had to wait for someone's buttons
const watch=`(()=>{window.__mx=0;const t=netTick;netTick=()=>{t();window.__mx=Math.max(window.__mx,NET.wait)}})()`;
await H.evaluate(watch);await G.evaluate(watch);
await G.keyboard.down('a');await H.keyboard.down('d');
const t0=Date.now(),f0=await G.evaluate(()=>NET.simF);await G.waitForTimeout(6000);const f1=await G.evaluate(()=>NET.simF);
await G.keyboard.up('a');await H.keyboard.up('d');
const mx=Math.max(await H.evaluate(()=>window.__mx),await G.evaluate(()=>window.__mx));
console.log('frames per second',Math.round((f1-f0)/((Date.now()-t0)/1000)),'longest wait (ticks)',mx);
ok((f1-f0)>320,'the game runs at full speed with packets held up');
ok(mx<12,'no long freezes (the longest wait was '+mx+' ticks; a held-up packet alone would be about 24)');
ok(await G.evaluate(()=>NET.match&&state==='play')&&await H.evaluate(()=>NET.match&&state==='play'),'no desync');
ok(errs.length===0,'no errors '+errs.join('|'));console.log(fails?fails+' FAILED':'ALL PASS');await b.close();srv.kill();})();
