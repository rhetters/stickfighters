const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// Online campaign: each screen follows its own player, players can stay behind as far as they like, a fight brings
// stragglers into its arena, and the two games stay in step
const {chromium}=require('playwright');const {spawn}=require('child_process');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const srv=spawn('node',[__dirname+'/sigserver.js','9318']);await new Promise(r=>setTimeout(r,400));
const b=await chromium.launch();const url=GAME+'?signal='+encodeURIComponent('ws://127.0.0.1:9318/peerjs?key=peerjs');
const errs=[];const mk=async(n)=>{const c=await b.newContext();const p=await c.newPage();p.on('pageerror',e=>errs.push(n+': '+e.message));await p.goto(url);await p.waitForTimeout(300);await p.evaluate(n=>{saveFighter(0,{...FIGHTER0,name:n});titleOpenAll()},n);return p};
const H=await mk('DAD'),A=await mk('RHETT');
await H.evaluate(()=>{$('b-online').click();$('on-host').click()});await H.waitForTimeout(3000);const code=await H.evaluate(()=>NET.code);
await A.evaluate(code=>{$('b-online').click();const [w,n]=code.split('-');ONC.w=ROOM_WORDS.indexOf(w);ONC.a=+n[0];ONC.b=+n[1];renderOnline();$('on-join').click();},code);await A.waitForTimeout(3500);
await H.evaluate(()=>{NET.mode='level';NET.theme='castle';netRoomChanged();$('on-start').click()});await H.waitForTimeout(800);
ok(await A.evaluate(()=>state==='play'&&MODE===LEVEL&&PL.length===2),'online campaign started with two players');
await H.waitForTimeout(5500); // the opening draw-in
// DAD runs ahead; RHETT stands still
await H.keyboard.down('d');await H.waitForTimeout(3500);
const s=await H.evaluate(()=>({wl:WB.l,cam:CAM.x,me:PL.find(p=>p.slot===NET.mySlot).x,other:PL.find(p=>p.slot!==NET.mySlot).x,fight:LV.encs.some(e=>e.st===1)}));
const va=await A.evaluate(()=>{render();return {view:VIEW.x,cam:CAM.x}}),vh=await H.evaluate(()=>{render();return VIEW.x});
console.log(JSON.stringify({s,va,vh}));
ok(s.fight||(s.other<s.cam&&s.wl===0),'RHETT stays behind, off the group screen, and nothing pulls him along (left wall at the start of the run: '+s.wl+')');
ok(s.fight||Math.abs(va.view-vh)>100,'each screen follows its own player (views '+Math.round(va.view)+' and '+Math.round(vh)+')');
ok(await A.evaluate(()=>{const c=CAM.x;render();return CAM.x===c}),'drawing never changes the game camera');
// keep going until the first fight: everyone ends up inside its arena
for(let i=0;i<20&&!(await H.evaluate(()=>LV.encs.some(e=>e.st===1)));i++)await H.waitForTimeout(500);
await H.keyboard.up('d');await H.waitForTimeout(300);
ok(await H.evaluate(()=>LV.encs.some(e=>e.st===1)&&PL.every(p=>p.x>=CAM.x+20&&p.x<=CAM.x+W)),'a fight brings the straggler into the arena');
await H.waitForTimeout(1500);
ok(await A.evaluate(()=>NET.match&&state==='play')&&await H.evaluate(()=>NET.match&&state==='play'),'no desync');
ok(errs.length===0,'no errors '+errs.join(' | '));
console.log(fails?fails+' FAILED':'ALL PASS');await b.close();srv.kill();process.exit(fails?1:0)})();
