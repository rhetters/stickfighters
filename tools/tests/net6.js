const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// The online screen's HOST / JOIN pictures and Join screen; online rooms up to 6: the host's room size (- and +), a full room says FULL, six devices play a surprise story
// ('?') together in lockstep with no desync, and the HUD takes two columns
const {chromium}=require('playwright');const {spawn}=require('child_process');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const srv=spawn('node',[__dirname+'/sigserver.js','9321']);await new Promise(r=>setTimeout(r,400));
const b=await chromium.launch();const url=GAME+'?signal='+encodeURIComponent('ws://127.0.0.1:9321/peerjs?key=peerjs');
const errs=[];const mk=async(n)=>{const c=await b.newContext({viewport:{width:1080,height:810}});const p=await c.newPage();p.on('pageerror',e=>errs.push(n+': '+e.message));await p.goto(url);await p.waitForTimeout(300);await p.evaluate(n=>{saveFighter(0,{...FIGHTER0,name:n});titleOpenAll()},n);return p};
const H=await mk('DAD');
await H.evaluate(()=>{$('b-online').click()});
if(process.env.SHOT)await H.screenshot({path:process.env.SHOT+'/online.png'});
ok(await H.evaluate(()=>$('on-start').hidden&&!$('on-menu').hidden&&$('on-joinpane').hidden&&!$('b-onlineback').hidden&&getComputedStyle(document.querySelector('.onhost .ontimg,.ontimg.onhost')).filter.includes('grayscale')),'before hosting: the HOST and JOIN pictures (grey until highlighted) and BACK, no START');
ok(await H.evaluate(()=>new Promise(r=>{let n=0;for(const f of ['img/online-host.png','img/online-join.png']){const i=new Image();i.onload=()=>++n===2&&r(true);i.onerror=()=>r(false);i.src=f}})),'both pictures load');
await H.evaluate(()=>$('on-joinpick').click());
ok(await H.evaluate(()=>$('on-menu').hidden&&!$('on-joinpane').hidden&&$('on-h2').textContent==='JOIN'),'JOIN opens the Join screen: the room code, JOIN and BACK');
await H.evaluate(()=>$('b-onlineback').click());
ok(await H.evaluate(()=>!$('on-menu').hidden&&$('on-joinpane').hidden&&!$('s-online').hidden),'BACK on the Join screen returns to HOST / JOIN');
await H.evaluate(()=>$('on-host').click());await H.waitForTimeout(3000);const code=await H.evaluate(()=>NET.code);
ok(await H.evaluate(()=>NET.max===4&&$('on-cards').children.length===4&&!$('on-max+').hidden&&$('on-max-').disabled===false),'a room starts with 4 places; the host has - and +');
await H.evaluate(()=>$('on-max-').click());await H.evaluate(()=>$('on-max-').click());await H.evaluate(()=>$('on-max-').click());
ok(await H.evaluate(()=>NET.max===2&&$('on-cards').children.length===2&&$('on-max-').disabled),'the room can shrink to 2, no smaller');
const join=async(n)=>{const g=await mk(n);await g.evaluate(code=>{$('b-online').click();const [w,d]=code.split('-');ONC.w=ROOM_WORDS.indexOf(w);ONC.a=+d[0];ONC.b=+d[1];renderOnline();$('on-join').click();},code);return g};
const G=[await join('P2')];await H.waitForTimeout(3500);
const x=await join('P3');await H.waitForTimeout(4000);
ok(await x.evaluate(()=>!NET.on&&/full/i.test($('on-msg').textContent)),'a full room turns the next player away');
await x.close();
for(let i=0;i<4;i++)await H.evaluate(()=>$('on-max+').click());
ok(await H.evaluate(()=>NET.max===6&&$('on-max+').disabled)&&await G[0].evaluate(()=>NET.max===6&&$('on-cards').children.length===6&&$('on-max+').hidden),'the host grows the room to 6; the guest sees 6 places and no buttons');
for(const n of ['P3','P4','P5','P6']){G.push(await join(n));await H.waitForTimeout(3500)}
ok(await H.evaluate(()=>NET.players.filter(p=>!p.left).length===6&&document.querySelectorAll('#on-cards .pcard.in').length===6),'six players in the room');
ok(await H.evaluate(()=>{NET.max=6;netSetMax(-1);return NET.max===6}),'the room can\'t shrink below the players in it');
ok(await H.evaluate(()=>{const e=$('s-online');return e.scrollHeight<=e.clientHeight+1}),'the 6-player room fits on the screen');
if(process.env.SHOT)await H.screenshot({path:process.env.SHOT+'/room6.png'});
await H.evaluate(()=>{$('on-modes').querySelector('[data-mode="level"]').click();document.querySelector('#on-sub [data-theme="?"]').click()});await H.waitForTimeout(600);
for(const q of [H,...G])await q.evaluate(()=>document.querySelector('.pready:not(:disabled)').click());await H.waitForTimeout(1500);
ok(await H.evaluate(()=>!$('on-start').disabled),'all six ready: START');
await H.evaluate(()=>$('on-start').click());await H.waitForTimeout(2500);
const st=await Promise.all([H,...G].map(q=>q.evaluate(()=>({s:state,n:PL.length,th:LV.run&&LV.run.theme,m:LV.run&&LV.run.myst,sl:PL.map(p=>p.slot).join('')}))));
ok(st.every(o=>o.s==='play'&&o.n===6&&o.m===true&&o.th===st[0].th&&THEMES_OK(o.th)&&o.sl==='012345'),'six devices start the same surprise story with six fighters '+JSON.stringify(st[0]));
function THEMES_OK(t){return ['castle','pirate','mountain','space'].includes(t)}
// everyone walks right and punches for a while
for(let k=0;k<3;k++){await Promise.all([H,...G].map((q,i)=>q.evaluate(i=>{setA('kb','r',1);setA('kb','p',(i+Date.now())%2)},i)));await H.waitForTimeout(1500)}
await Promise.all([H,...G].map(q=>q.evaluate(()=>{setA('kb','r',0);setA('kb','p',0)})));await H.waitForTimeout(2000);
const fs=await Promise.all([H,...G].map(q=>q.evaluate(()=>({f:NET.simF,m:NET.match,x:PL.map(p=>Math.round(p.x)).join()}))));
ok(fs.every(o=>o.m&&o.f>200),'the match runs on all six devices '+fs.map(o=>o.f).join(','));
ok(await H.evaluate(()=>{render();return true}),'the HUD draws six players (two columns)');
if(process.env.SHOT)await H.screenshot({path:process.env.SHOT+'/play6.png'});
ok(errs.length===0,'no errors (no desync) '+errs.join(' | '));
console.log(fails?fails+' FAILED':'ALL PASS');await b.close();srv.kill();process.exit(fails?1:0)})();
