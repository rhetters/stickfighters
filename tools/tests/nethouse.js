const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// The house camera follows: online each screen follows its own player around the host's house; locally one player
// is followed too (the camera is set while drawing and must stay set)
const {chromium}=require('playwright');const {spawn}=require('child_process');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const srv=spawn('node',[__dirname+'/sigserver.js','9317']);await new Promise(r=>setTimeout(r,400));
const b=await chromium.launch();const url=GAME+'?signal='+encodeURIComponent('ws://127.0.0.1:9317/peerjs?key=peerjs');
const errs=[];const mk=async(n)=>{const c=await b.newContext();const p=await c.newPage();p.on('pageerror',e=>errs.push(n+': '+e.message));await p.goto(url);await p.waitForTimeout(300);await p.evaluate(n=>{saveFighter(0,{...FIGHTER0,name:n});titleOpenAll()},n);return p};
const H=await mk('DAD'),A=await mk('RHETT');
await H.evaluate(()=>{$('b-online').click();$('on-host').click()});await H.waitForTimeout(3000);const code=await H.evaluate(()=>NET.code);
await A.evaluate(code=>{$('b-online').click();const [w,n]=code.split('-');ONC.w=ROOM_WORDS.indexOf(w);ONC.a=+n[0];ONC.b=+n[1];renderOnline();$('on-join').click();},code);await A.waitForTimeout(3500);
await H.evaluate(()=>{NET.mode='house';netRoomChanged();netStart()});await H.waitForTimeout(800);
ok(await A.evaluate(()=>state==='play'&&MODE===HOUSE_MODE&&PL.length===2),'online house visit started with two players');
await H.waitForTimeout(1500);
await H.evaluate(()=>{WB.r=WW.r=3000});await A.evaluate(()=>{WB.r=WW.r=3000}); // a wide house on both
await A.keyboard.down('d');await A.waitForTimeout(4000);await A.keyboard.up('d');await A.waitForTimeout(500);
const va=await A.evaluate(()=>{for(let i=0;i<40;i++)render();const me=PL.find(p=>p.slot===NET.mySlot);return {cam:CAM.x,me:me.x}}),vh=await H.evaluate(()=>{for(let i=0;i<40;i++)render();const me=PL.find(p=>p.slot===NET.mySlot);return {cam:CAM.x,me:me.x}});
ok(va.me>1000&&va.me>va.cam&&va.me<va.cam+900,'RHETT walked far into the house and his screen followed him '+JSON.stringify(va));
ok(vh.me>vh.cam&&vh.me<vh.cam+900,'DAD stayed put and his screen stayed on him '+JSON.stringify(vh));
// one player at home: the camera follows them too
const L=await mk('SOLO');
const solo=await L.evaluate(()=>{ROSTER.length=0;startHouse({...normHouse(HOUSE)});WB.r=WW.r=3000;PL[0].x=2000;for(let i=0;i<60;i++){fr++;update();render()}return {cam:CAM.x,x:PL[0].x}});
ok(solo.x>solo.cam&&solo.x<solo.cam+900,'at home alone, the camera follows you '+JSON.stringify(solo));
ok(errs.length===0,'no errors '+errs.join(' | '));
console.log(fails?fails+' FAILED':'ALL PASS');await b.close();srv.kill();process.exit(fails?1:0)})();
