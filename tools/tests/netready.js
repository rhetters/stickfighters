const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// Online ready-up: everyone ready in the room lets the host press START, and changing an option means readying up
// again; after a theme's victory, everyone ready lets the host start the same theme one step harder on both devices
const {chromium}=require('playwright');const {spawn}=require('child_process');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const srv=spawn('node',[__dirname+'/sigserver.js','9319']);await new Promise(r=>setTimeout(r,400));
const b=await chromium.launch();const url=GAME+'?signal='+encodeURIComponent('ws://127.0.0.1:9319/peerjs?key=peerjs');
const errs=[];const mk=async(n)=>{const c=await b.newContext({viewport:{width:1080,height:810}});const p=await c.newPage();p.on('pageerror',e=>errs.push(n+': '+e.message));await p.goto(url);await p.waitForTimeout(300);await p.evaluate(n=>{saveFighter(0,{...FIGHTER0,name:n});titleOpenAll()},n);return p};
const H=await mk('DAD'),A=await mk('RHETT');
await H.evaluate(()=>{$('b-online').click();$('on-host').click()});await H.waitForTimeout(3000);const code=await H.evaluate(()=>NET.code);
await A.evaluate(code=>{$('b-online').click();const [w,n]=code.split('-');ONC.w=ROOM_WORDS.indexOf(w);ONC.a=+n[0];ONC.b=+n[1];renderOnline();$('on-join').click();},code);await A.waitForTimeout(3500);
await H.evaluate(()=>{NET.mode='level';NET.theme='castle';netRoomChanged()});await H.waitForTimeout(500);
ok(await A.evaluate(()=>document.querySelectorAll('.pready').length===2&&document.querySelectorAll('.pready:not(:disabled)').length===1),'each room card has a ready button; only your own can be pressed');
await A.evaluate(()=>document.querySelector('.pready:not(:disabled)').click());await A.waitForTimeout(600);
ok(await H.evaluate(()=>NET.players.find(q=>q.slot!==NET.mySlot).ready&&!NET.players.find(q=>q.slot===NET.mySlot).ready),'the host sees the guest ready');
ok(await H.evaluate(()=>!!document.querySelector('.pready.on'))&&await H.evaluate(()=>state!=='play'),'one ready player does not start the game');
ok(await H.evaluate(()=>$('on-start').disabled),'START is off until everyone is ready');
await H.evaluate(()=>document.querySelector('.pready:not(:disabled)').click());await H.waitForTimeout(1800);
ok(await H.evaluate(()=>state!=='play'&&!$('on-start').disabled),'everyone ready: START can be pressed, and nothing starts by itself');
await H.evaluate(()=>document.querySelector('#on-sub [data-theme="pirate"]').click());await H.waitForTimeout(600);
ok(await H.evaluate(()=>NET.players.every(q=>!q.ready)&&$('on-start').disabled)&&await A.evaluate(()=>NET.players.every(q=>!q.ready)&&NET.theme==='pirate'),'changing an option makes everyone ready up again');
await A.evaluate(()=>onlineFighter(1));await A.waitForTimeout(300);
await A.evaluate(()=>document.querySelector('.pready:not(:disabled)').click());await H.evaluate(()=>document.querySelector('.pready:not(:disabled)').click());await H.waitForTimeout(700);
await H.evaluate(()=>document.querySelector('#on-sub [data-theme="castle"]').click());await H.waitForTimeout(400);
await A.evaluate(()=>document.querySelector('.pready:not(:disabled)').click());await H.evaluate(()=>document.querySelector('.pready:not(:disabled)').click());await H.waitForTimeout(700);
await Promise.all([H,A].map(q=>q.evaluate(()=>{BURST_MS.on=true})));
// the host has a starred part from the level creator: it goes to everyone with the start
await H.evaluate(()=>{EDIT.levels=[normLevel({b:'woods',parts:[{w:1500,plats:[{x1:300,x2:600,h:2}],foes:[{t:'b',x:500}],at:700,pool:1}]})]});
await H.evaluate(()=>$('on-start').click());await H.waitForTimeout(700);
ok(await A.evaluate(()=>!!document.querySelector('.burst')&&state!=='play')&&await H.evaluate(()=>!!document.querySelector('.burst')&&state!=='play'),'START: the story tile bursts open on both devices first');
await H.waitForTimeout(2500);
ok(await A.evaluate(()=>state==='play'&&MODE===LEVEL)&&await H.evaluate(()=>state==='play'&&MODE===LEVEL),'START starts the game on both devices');
ok(await A.evaluate(()=>NET.match&&fr>30)&&await H.evaluate(()=>NET.match&&fr>30),'and the match runs on both');
const shape=()=>JSON.stringify([LV.ch.map(c=>c.w),LV.encs.map(e=>e.list),LV.terr&&LV.terr.s,LV.run.pool.length]);
ok(await A.evaluate(()=>LV.run.pool.length===1&&EDIT.levels.length===0)&&await A.evaluate(shape)===await H.evaluate(shape),'the host\'s level-creator parts reach the guest, and both build the same story');
ok(await H.evaluate(()=>NET.players.every(q=>!q.ready)),'nobody is ready any more once it starts');
// jump to the end of the run on both devices (a shortcut for the test): the victory screen
await Promise.all([H,A].map(q=>q.evaluate(()=>{LV.encs.forEach(e=>e.st=2);LV.trans.forEach(t=>t.done=1);levelClear()})));await H.waitForTimeout(3000);
ok(await H.evaluate(()=>!$('s-victory').hidden)&&await A.evaluate(()=>!$('s-victory').hidden),'both devices show the victory screen');
await A.evaluate(()=>document.querySelector('.vready:not(:disabled)').click());await A.waitForTimeout(700);
ok(await H.evaluate(()=>document.querySelectorAll('.vready.on').length===1),'the host’s screen shows the guest’s green check');
await H.evaluate(()=>document.querySelector('.vready:not(:disabled)').click());await H.waitForTimeout(1500);
ok(await H.evaluate(()=>!$('s-victory').hidden&&!$('v-again').disabled&&$('v-again').textContent.replace(/\s/g,'')==='CASTLESIEGE+1')&&await A.evaluate(()=>!$('s-victory').hidden&&$('v-again').disabled),'everyone ready: the host can press CASTLE SIEGE +1 (nothing starts by itself)');
await H.evaluate(()=>$('v-again').click());await H.waitForTimeout(2000);
const r=[await H.evaluate(()=>({state,ng:LV.run&&LV.run.ng,name:LV.def.name})),await A.evaluate(()=>({state,ng:LV.run&&LV.run.ng,name:LV.def.name}))];
ok(r.every(x=>x.state==='play'&&x.ng===1)&&r[0].name===r[1].name,'everyone ready starts the harder run on both devices '+JSON.stringify(r));
await H.waitForTimeout(1500);
ok(await A.evaluate(()=>NET.match&&state==='play')&&await H.evaluate(()=>NET.match&&state==='play'),'no desync');
ok(errs.length===0,'no errors '+errs.join(' | '));
console.log(fails?fails+' FAILED':'ALL PASS');await b.close();srv.kill();process.exit(fails?1:0)})();
