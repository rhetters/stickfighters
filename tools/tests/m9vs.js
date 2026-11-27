const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
const {chromium,devices}=require('playwright');const {PADS}=require('./mp.js');const S=process.argv[2];let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];const c=await b.newContext({viewport:{width:1280,height:800}});
await c.addInitScript(PADS(['Xbox Wireless Controller (Vendor: 045e)','Xbox Wireless Controller (Vendor: 045e)','Xbox Wireless Controller (Vendor: 045e)']));
const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(GAME);await p.evaluate("SET.tut=1");await p.waitForTimeout(150);await p.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await p.waitForTimeout(300);
const ev=x=>p.evaluate(x),W=ms=>p.waitForTimeout(ms);
const tap=async(pad,i,ms=90)=>{await ev(`__pads[${pad}].buttons[${i}].pressed=true`);await W(ms);await ev(`__pads[${pad}].buttons[${i}].pressed=false`);await W(90)};
await p.evaluate('openOnline()');await p.click('#b-multi');await tap(0,0);await W(50);await ev("document.querySelector('#lb-modes [data-mode=\"vs\"]').click()");ok(await ev("$('lb-start').disabled"),'Versus needs 2 players');
await tap(1,0);await p.click('#lb-start');await W(300);
ok(await ev("MODE===VERSUS&&PL.length===2&&E.length===0&&VS.phase==='count'"),'Versus starts: 2 players, no enemies, countdown');
const xa=await ev("PL[0].x");await ev("__pads[0].buttons[15].pressed=true");await W(500);await ev("__pads[0].buttons[15].pressed=false");
ok(Math.abs(await ev("PL[0].x")-xa)<1,'players hold still during the countdown');
await W(1200);ok(await ev("VS.phase==='fight'"),'FIGHT!');
await p.screenshot({path:S+'/shots/m9-vs.png'});
// put them face to face and punch
await ev("PL[0].x=400;PL[1].x=445;PL[0].face=1;PL[1].face=-1");await tap(0,2,60);await W(300);
ok(await ev("PL[1].hp<100&&PL[0].hp===100"),'P1 punches P2 (P2 health '+await ev("PL[1].hp")+')');
// block in versus
await ev("PL[1].hp=100;PL[1].inv=0;PL[1].st='free';PL[0].x=400;PL[1].x=445;PL[0].face=1;PL[1].face=-1;PL[0].att=null;PL[0].st='free'");
await ev("__pads[1].buttons[4].pressed=true;__pads[1].buttons[13].pressed=true");await W(200);await tap(0,2,60);await W(250);
ok(await ev("PL[1].hp===100&&PL[1].stm.v<95"),'P2 blocks with Down + Surge (costs Surge, no damage)');
await ev("__pads[1].buttons[4].pressed=false;__pads[1].buttons[13].pressed=false");await W(150);
// KO round
await ev("PL[0].x=400;PL[1].x=445;PL[0].face=1;PL[1].face=-1;PL[1].hp=2;PL[1].inv=0;PL[1].st='free';PL[0].att=null;PL[0].st='free'");await tap(0,2,60);await W(400);
ok(await ev("VS.phase==='ko'&&VS.wins.P0===1"),'KO: P1 wins round 1');
await W(3400);ok(await ev("VS.round===2&&VS.phase!=='ko'&&PL.every(p=>p.hp===100)"),'round 2 starts fresh');
await W(1500);await ev("PL[0].x=400;PL[1].x=445;PL[0].face=1;PL[1].face=-1;PL[1].hp=2;PL[1].inv=0;PL[1].st='free'");await tap(0,2,60);await W(4200);
await p.waitForSelector('#s-victory',{state:'visible',timeout:9000}).catch(()=>0);ok(await p.isVisible('#s-victory')&&/ORANGE WINS/.test(await p.textContent('#v-h1'))&&await ev("!!document.querySelector('#v-cards .vwin')"),'two rounds = the victory screen: ORANGE WINS!, a WINNER sticker');
await p.screenshot({path:S+'/shots/m9-vswin.png'});
ok(await ev("/REMATCH/.test($('v-again').textContent)&&$('v-again').disabled"),'REMATCH waits until everyone is ready');
await ev("$('v-cards').querySelectorAll('.vready').forEach(b=>b.click())");await p.click('#v-again');await W(300);ok(await ev("MODE===VERSUS&&VS.round===1&&!VS.wins.P0"),'REMATCH starts a new match');
// timer
await W(1500);await ev("VS.time=2;PL[0].hp=80;PL[1].hp=50");await W(300);ok(await ev("VS.phase==='ko'&&VS.wins.P0===1"),'time up: most health wins the round');
// co-op: revive
await ev("pause(true)");await p.click('#b-quit');await W(150);await p.evaluate('openOnline()');await p.click('#b-multi');await W(100);await ev("document.querySelector('#lb-modes [data-mode=\"level\"]').click()");await ev("document.querySelector('#lb-sub [data-theme=\"castle\"]').click()");await p.click('#lb-start');await W(300);await ev('cineEnd()');
ok(await ev("MODE===LEVEL&&PL.length===2"),'co-op campaign with 2 players');
await ev("hurtP(PL[1],{dmg:999,kb:5},-1)");await W(1500);
ok(await ev("PL[1].st==='dead'&&state==='play'"),'one player down: the game goes on');
await ev("PL[0].x=PL[1].x+20");await W(2600);ok(await ev("PL[1].st!=='dead'&&PL[1].hp===40"),'standing next to them for 2 s revives them at 40%');
await p.screenshot({path:S+'/shots/m9-coop.png'});
// co-op enemy scaling
await ev("CAM.x=LV.encs[0].lock-10;levelWalls();PL.forEach(p=>p.x=CAM.x+600)");await W(900);
ok(await ev("LV.encs[0].st===1&&(LV.encs[0].q.length+E.filter(e=>!e.dying).length)>=4"),'co-op fights add extra enemies (3 grunts became '+await ev("LV.encs[0].q.length+E.filter(e=>!e.dying).length")+')');
ok(await ev("E.length===0||E[0].max>T[E[0].tk].hp"),'and enemies have more health');
ok(errs.length===0,'no page errors '+errs.join('|'));await b.close();console.log(fails?fails+' FAILED':'ALL PASS')})();
