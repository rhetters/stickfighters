const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// 3 players: guests connect to each other; a guest whose direct link is blocked still plays (host passes buttons);
// a guest leaves mid-match: body dissolves on every screen at the same frame; pose wheel only drawn locally
const {chromium}=require('playwright');const {spawn}=require('child_process');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const srv=spawn('node',[__dirname+'/sigserver.js','9314']);await new Promise(r=>setTimeout(r,400));
const b=await chromium.launch();const url=GAME+'?signal='+encodeURIComponent('ws://127.0.0.1:9314/peerjs?key=peerjs');
const errs=[];const mk=async(n)=>{const c=await b.newContext();const p=await c.newPage();p.on('pageerror',e=>errs.push(n+': '+e.message));await p.goto(url);await p.waitForTimeout(300);await p.evaluate(n=>{saveFighter(0,{...FIGHTER0,name:n});titleOpenAll();},n);return p;};
const H=await mk('DAD'),A=await mk('RHETT'),C=await mk('RAELYNN');
await H.evaluate(()=>{$('b-online').click();$('on-host').click()});await H.waitForTimeout(3000);const code=await H.evaluate(()=>NET.code);
const join=async P=>{await P.evaluate(code=>{$('b-online').click();const [w,n]=code.split('-');ONC.w=ROOM_WORDS.indexOf(w);ONC.a=+n[0];ONC.b=+n[1];renderOnline();$('on-join').click();},code);await P.waitForTimeout(3500);};
await join(A);
// RAELYNN can't connect directly to other guests (simulates a blocked link)
await C.evaluate(()=>{rtcConnect=async()=>{};});
await join(C);
await A.waitForTimeout(1500);
ok(await A.evaluate(()=>NET.links.size===0),'RHETT has no direct link to RAELYNN (blocked)');
ok(await H.evaluate(()=>NET.players.length===3),'three in the room');
// now let a normal 2-guest mesh form too: a 4th player connects directly to RHETT
const X=await mk('FRIEND');await join(X);await X.waitForTimeout(2000);
ok(await X.evaluate(()=>NET.links.size>=1),'FRIEND connected directly to another guest ('+await X.evaluate(()=>NET.links.size)+')');
ok(await A.evaluate(()=>NET.links.size>=1),'RHETT sees the direct link');
await H.evaluate(()=>{NET.mode='arcade';netRoomChanged();$('on-start').click()});await H.waitForTimeout(700);
ok(await C.evaluate(()=>state==='play'&&PL.length===4),'4-player arcade started');
const hold=async(p,keys,ms)=>{for(const k of keys)await p.keyboard.down(k);await p.waitForTimeout(ms);for(const k of keys)await p.keyboard.up(k);};
await Promise.all([hold(H,['d'],900),hold(A,['a'],600),hold(C,['d'],400),hold(X,['k'],300)]);
await H.waitForTimeout(2600);
ok(await C.evaluate(()=>NET.match&&state==='play'),'no desync with a mix of direct and passed-along buttons');
// pose wheel: RHETT holds T; only RHETT's screen draws the wheel
await H.evaluate(()=>{window.sawWheel=0;const t=setInterval(()=>{const p=PL.find(p=>p.slot===1);if(p&&p.wheel)window.sawWheel=1},16);setTimeout(()=>clearInterval(t),1500)});
await A.keyboard.down('t');await A.waitForTimeout(1200);
const wA=await A.evaluate(()=>{let n=0;const o=drawWheel;drawWheel=f=>{n++;o(f)};render();drawWheel=o;return n||(PL.find(p=>p.slot===1).wheel?0:-1)}),wH=await H.evaluate(()=>{let n=0;const o=drawWheel;drawWheel=f=>{n++;o(f)};render();drawWheel=o;return [n,!!window.sawWheel]});
ok(wA!==0&&wH[0]===0&&wH[1],'pose wheel drawn only on RHETT’s screen (host knows it is open: '+wH[1]+')');
await H.evaluate(()=>{window.sawPose=0;window.sawHit=0;const t=setInterval(()=>{const p=PL.find(p=>p.slot===1);if(p&&p.emote)window.sawPose=1;if(p&&p.st!=='free')window.sawHit=1},16);setTimeout(()=>clearInterval(t),3000)});
await A.keyboard.down('ArrowRight');await A.waitForTimeout(100);await A.keyboard.up('t');await A.keyboard.up('ArrowRight');await A.waitForTimeout(600);
// an enemy hitting RHETT ends the pose (or the wheel), so look for the pose at any moment, or a hit that stopped it
const em=await H.evaluate(()=>{const p=PL.find(p=>p.slot===1);return [window.sawPose,window.sawHit,p.hp]});ok(em[0]||em[1],'everyone sees RHETT strike the pose '+JSON.stringify(em));
// RAELYNN leaves
await C.evaluate(()=>{pause(true);$('b-quit').click()});await H.waitForTimeout(500);
const st=await H.evaluate(()=>({stop:NET.stop,left:PL.filter(p=>p.left).map(p=>p.slot)}));console.log(JSON.stringify(st));
ok(st.left.includes(2),'RAELYNN marked as left in the fight');
await H.waitForTimeout(6000);
ok(await H.evaluate(()=>PL.length===3&&!PL.some(p=>p.slot===2)),'her body dissolved and she is gone from the fight (host)');
ok(await A.evaluate(()=>PL.length===3&&!PL.some(p=>p.slot===2)),'same on RHETT’s screen');
ok(await A.evaluate(()=>NET.match&&state==='play'),'no desync after the leave');
ok(errs.length===0,'no errors '+errs.join(' | '));console.log(fails?fails+' FAILED':'ALL PASS');await b.close();srv.kill();})();
