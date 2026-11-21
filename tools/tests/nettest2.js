const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// 3 players, arcade, host restarts, screenshots
const {chromium}=require('playwright');const {spawn}=require('child_process');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const srv=spawn('node',[__dirname+'/sigserver.js','9312']);await new Promise(r=>setTimeout(r,400));
const b=await chromium.launch();const url=GAME+(process.env.Q||('?signal='+encodeURIComponent('ws://127.0.0.1:9312/peerjs?key=peerjs')));const mq=spawn('node',[__dirname+'/mqttbroker.js','9320']);
const errs=[];const mk=async(n,col)=>{const c=await b.newContext({viewport:{width:1024,height:768}});const p=await c.newPage();p.on('pageerror',e=>errs.push(n+': '+e.message));await p.goto(url);await p.waitForTimeout(300);
 await p.evaluate(([n,col])=>{ECO.own.push('hat-top','hat-viking');saveFighter(0,{...FIGHTER0,name:n,col,eq:{...FIGHTER0.eq,hat:n==='DAD'?'hat-top':'hat-viking'}});titleOpenAll();},[n,col]);return p;};
const H=await mk('DAD','col-orange'),A=await mk('RHETT','col-orange'),B=await mk('RAELYNN','col-purple');
await H.evaluate(()=>{$('b-online').click()});await H.screenshot({path:'shots/on1.png'});
await H.evaluate(()=>$('on-host').click());await H.waitForTimeout(500);const code=await H.evaluate(()=>NET.code);
for(const P of [A,B]){await P.evaluate(code=>{$('b-online').click();const [w,n]=code.split('-');ONC.w=ROOM_WORDS.indexOf(w);ONC.a=+n[0];ONC.b=+n[1];renderOnline();$('on-join').click();},code);await P.waitForTimeout(1500);}
ok(await H.evaluate(()=>NET.players.length===3),'three in the room');
ok(await A.evaluate(()=>NET.players.find(p=>p.slot===1).cid!=='col-orange'),'second orange player gets a different color');
await A.waitForTimeout(1500);await H.screenshot({path:'shots/on2.png'});await A.screenshot({path:'shots/on3.png'});
await H.evaluate(()=>{NET.mode='arcade';netRoomChanged();netStart()});await H.waitForTimeout(800);
ok(await B.evaluate(()=>state==='play'&&PL.length===3&&MODE===ARCADE),'arcade with three');
await A.keyboard.down('d');await A.waitForTimeout(800);await A.keyboard.up('d');await A.waitForTimeout(500);await A.screenshot({path:'shots/on4.png'});
// guest pause menu
await A.evaluate(()=>pause(true));await A.waitForTimeout(200);
ok(await A.evaluate(()=>$('b-restart').hidden&&$('b-set2').hidden&&/LEAVE/.test($('b-quit').textContent)),'guest pause menu: no restart or settings');
const f0=await A.evaluate(()=>NET.simF);await A.waitForTimeout(500);ok(await A.evaluate(()=>NET.simF)>f0+15,'game keeps running while the guest menu is open');
await A.evaluate(()=>$('b-resume').click());
await H.evaluate(()=>netCmd('again'));await H.waitForTimeout(400);
ok(await B.evaluate(()=>NET.epoch===2&&NET.simF<60),'host restart restarts everyone');
await H.waitForTimeout(3000);
ok(await B.evaluate(()=>NET.match&&state==='play'),'still in sync after the restart');
ok(errs.length===0,'no errors '+errs.join(' | '));console.log(fails?fails+' FAILED':'ALL PASS');await b.close();srv.kill();mq.kill();})();
