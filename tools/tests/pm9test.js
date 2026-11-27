const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
const {chromium,devices}=require('playwright');const {PADS}=require('./mp.js');const S=process.argv[2];let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];const c=await b.newContext({viewport:{width:1280,height:800}});
await c.addInitScript(PADS(['Xbox Wireless Controller (Vendor: 045e)','Xbox Wireless Controller (Vendor: 045e)','Xbox Wireless Controller (Vendor: 045e)','Xbox Wireless Controller (Vendor: 045e)']));
const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(GAME);await p.evaluate("SET.tut=1");await p.waitForTimeout(400);
const ev=x=>p.evaluate(x),W=ms=>p.waitForTimeout(ms);
const tap=async(pad,i,ms=90)=>{await ev(`__pads[${pad}].buttons[${i}].pressed=true`);await W(ms);await ev(`__pads[${pad}].buttons[${i}].pressed=false`);await W(90)};
await ev("titleOpenAll()");
// settings feel sliders
await p.click('#b-set1');await W(150);ok(await ev("document.querySelectorAll('#o-feel input[type=range]').length===6"),'Settings has all 6 Feel sliders');
await p.fill('#o-f-hitstop','0.6');await ev("document.getElementById('o-f-hitstop').dispatchEvent(new Event('input'))");ok(await ev("FEEL.hitstop===0.6&&SET.feel.hitstop===0.6"),'moving a Settings Feel slider changes the game and saves');
await p.screenshot({path:S+'/shots/pm9-settings.png',fullPage:true});
await p.click('#o-feel button');ok(await ev("FEEL.hitstop===FEELDEF.hitstop&&FEEL.body===1"),'Reset feel');
await p.click('#b-back');await W(100);
// versus grab
await p.evaluate('openOnline()');await p.click('#b-multi');await W(100);await p.evaluate("document.querySelector('#lb-modes [data-mode=\"vs\"]').click()");await tap(0,0);await tap(1,0);await p.click('#lb-start');await W(1800);
await ev("PL[0].x=400;PL[1].x=440;PL[0].face=1;PL[1].face=-1;PL[0].st=PL[1].st='free';PL[0].inv=PL[1].inv=0");
await ev("__pads[0].buttons[2].pressed=true;__pads[0].buttons[1].pressed=true");await W(80);await ev("__pads[0].buttons[2].pressed=false;__pads[0].buttons[1].pressed=false");await W(150);
ok(await ev("PL[0].st==='grab'&&PL[1].st==='held'"),'Versus: P1 grabs P2 (punch + kick)');
await p.screenshot({path:S+'/shots/pm9-grab.png'});
await tap(0,2);await W(250);ok(await ev("PL[1].hp<100&&PL[1].st==='held'"),'knee while holding');
await W(300);await tap(0,1);await W(200);ok(await ev("PL[1].st==='fly'||PL[1].st==='down'"),'kick throws P2 (st '+await ev("PL[1].st")+')');
await W(2500);
await ev("PL[0].x=400;PL[1].x=440;PL[0].face=1;PL[1].face=-1;PL[0].st=PL[1].st='free';PL[0].inv=PL[1].inv=0;PL[0].att=PL[1].att=null");
await ev("__pads[0].buttons[2].pressed=true;__pads[0].buttons[1].pressed=true");await W(80);await ev("__pads[0].buttons[2].pressed=false;__pads[0].buttons[1].pressed=false");await W(150);
for(let i=0;i<7;i++)await tap(1,2,40);await W(100);ok(await ev("PL[1].st!=='held'&&PL[0].st!=='grab'"),'mashing punch breaks free');
// grab beats block
await W(800);await ev("PL[0].x=400;PL[1].x=440;PL[0].face=1;PL[1].face=-1;PL[0].st=PL[1].st='free';PL[0].inv=PL[1].inv=0;PL[0].att=PL[1].att=null;PL[1].stm.v=100;PL[1].stm.winded=0");
await ev("__pads[1].buttons[4].pressed=true;__pads[1].buttons[13].pressed=true");await W(200);
await ev("__pads[0].buttons[2].pressed=true;__pads[0].buttons[1].pressed=true");await W(80);await ev("__pads[0].buttons[2].pressed=false;__pads[0].buttons[1].pressed=false");await W(150);
ok(await ev("PL[1].st==='held'"),'a grab gets through a block');
await ev("__pads[1].buttons[4].pressed=false;__pads[1].buttons[13].pressed=false");
// teams
await ev("pause(true)");await p.click('#b-quit');await W(200);await ev("titleOpenAll()");await p.evaluate('openOnline()');await p.click('#b-multi');await W(100);
await tap(2,0);await tap(3,0);ok(await ev("LOBBY.length===4"),'4 players in the lobby');
await ev("document.querySelector('#lb-modes [data-mode=\"vs\"]').click()");await p.click('#lb-diff [data-teams="1"]');await W(100);ok(await ev("TEAMS")&&await ev("!!document.querySelector('#lb-diff [data-teams=\"1\"].on')"),'Teams switch on');
ok(await ev("JSON.stringify(LOBBY.map(r=>r.team))")==='[0,1,0,1]','default teams: P1+P3 vs P2+P4 (as online)');
await p.screenshot({path:S+'/shots/pm9-teams.png'});
await p.click('#lb-cards .pcard:nth-child(2) .pteam');ok(await ev("LOBBY[1].team===0"),'tap TEAM to switch sides');
await p.click('#lb-cards .pcard:nth-child(2) .pteam');
await p.click('#lb-start');await W(1800);
ok(await ev("VS.teams&&PL.map(p=>p.team).join()==='0,1,0,1'"),'team Versus starts');
ok(await ev("PL.filter(p=>p.team===0).every(p=>p.x<W/2)&&PL.filter(p=>p.team===1).every(p=>p.x>W/2)"),'team 1 starts left, team 2 right');
await ev("PL[0].x=400;PL[2].x=440;PL[0].face=1;PL[2].face=-1;PL[2].inv=0;PL[2].st='free';PL[1].x=150;PL[3].x=800");await tap(0,2,60);await W(300);ok(await ev("PL[2].hp===100"),'no friendly fire between teammates');
await ev("PL[0].x=400;PL[1].x=440;PL[0].face=1;PL[1].inv=0;PL[1].st='free';PL[2].x=150;PL[3].x=800");await tap(0,2,60);await W(300);ok(await ev("PL[1].hp<100"),'hits land on the other team');
await ev("for(const q of [PL[1],PL[3]]){q.hp=1;q.inv=0;q.st='free'}");await ev("pvpHit(PL[1],{dmg:20,kb:5},1,PL[0]);pvpHit(PL[3],{dmg:20,kb:5},1,PL[2])");await W(400);
ok(await ev("VS.phase==='ko'&&VS.wins.T0===1"),'both opponents down = TEAM 1 wins the round');
await W(300);await p.screenshot({path:S+'/shots/pm9-teamko.png'});
ok(errs.length===0,'no page errors '+errs.join('|'));await b.close();console.log(fails?fails+' FAILED':'ALL PASS')})();
