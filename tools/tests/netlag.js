const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// internet-like lag: every message from the guest (and to it) is delayed 40 ms each way, with jitter
const {chromium}=require('playwright');const {spawn}=require('child_process');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const srv=spawn('node',[__dirname+'/sigserver.js','9313']);await new Promise(r=>setTimeout(r,400));
const b=await chromium.launch();const url=GAME+(process.env.Q||('?signal='+encodeURIComponent('ws://127.0.0.1:9313/peerjs?key=peerjs')));const mq=spawn('node',[__dirname+'/mqttbroker.js','9320']);
const errs=[];const mk=async(n)=>{const c=await b.newContext();const p=await c.newPage();p.on('pageerror',e=>errs.push(n+': '+e.message));await p.goto(url);await p.waitForTimeout(300);await p.evaluate(n=>{saveFighter(0,{...FIGHTER0,name:n});titleOpenAll();},n);return p;};
const H=await mk('H'),G=await mk('G');
const lag=`{const s=rtcSend;rtcSend=(id,m)=>setTimeout(()=>s(id,m),40+Math.random()*15);const o=RTC.on.msg;RTC.on.msg=(id,m)=>setTimeout(()=>o(id,m),40+Math.random()*15);}`;
await H.evaluate(()=>{$('b-online').click();$('on-host').click()});await H.waitForTimeout(3000);const code=await H.evaluate(()=>NET.code);
await G.evaluate(code=>{$('b-online').click();const [w,n]=code.split('-');ONC.w=ROOM_WORDS.indexOf(w);ONC.a=+n[0];ONC.b=+n[1];renderOnline();$('on-join').click();},code);await G.waitForTimeout(1500);
await G.evaluate(lag);await G.waitForTimeout(3500);
console.log('guest rtt',await G.evaluate(()=>Math.round(NET.rtt)),'host sees',await H.evaluate(()=>NET.players[1].rtt));
await H.evaluate(()=>{NET.mode='vs';netRoomChanged();$('on-start').click()});await G.waitForTimeout(800);
const D=await H.evaluate(()=>NET.D);ok(D>=4&&D<=6,'input delay covers one trip: D='+D);
await G.keyboard.down('a');await H.keyboard.down('d');await G.waitForTimeout(1500);await G.keyboard.up('a');await H.keyboard.up('d');
const t0=Date.now(),f0=await G.evaluate(()=>NET.simF);await G.waitForTimeout(3000);const f1=await G.evaluate(()=>NET.simF);
console.log('guest frames per second',Math.round((f1-f0)/((Date.now()-t0)/1000)));
ok((f1-f0)>150,'guest game runs at full speed with lag');
ok(await G.evaluate(()=>NET.match&&state==='play'),'no desync with lag');
ok(errs.length===0,'no errors '+errs.join('|'));console.log(fails?fails+' FAILED':'ALL PASS');await b.close();srv.kill();mq.kill();})();
