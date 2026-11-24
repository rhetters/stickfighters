const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
const {chromium}=require('playwright');const S=process.argv[2];let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
const PADJS=id=>`(()=>{const mk=()=>({id:${JSON.stringify(id)},index:0,connected:true,mapping:'standard',buttons:Array.from({length:17},()=>({pressed:false,value:0})),axes:[0,0,0,0]});window.__pad=mk();navigator.getGamepads=()=>[window.__pad];})()`;
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext({viewport:{width:1280,height:800}});await c.addInitScript(PADJS('Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)'));
const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(GAME);await p.evaluate("SET.tut=1");await p.waitForTimeout(150);await p.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await p.waitForTimeout(300);
const ev=x=>p.evaluate(x),W=ms=>p.waitForTimeout(ms);
const tap=async(i,ms=90)=>{await ev(`__pad.buttons[${i}].pressed=true`);await W(ms);await ev(`__pad.buttons[${i}].pressed=false`);await W(90)};
const vis=id=>p.isVisible('#'+id),foc=()=>ev("document.activeElement&&(document.activeElement.id||document.activeElement.textContent)");
// title navigation with controller
await tap(15);ok(await foc()==='b-online','title: d-pad right moves the highlight (SOLO to MULTIPLAYER, now on '+await foc()+')');
await tap(14);ok(await foc()==='b-solo','d-pad left moves back');
await tap(0);await W(200);ok(await vis('s-solo')&&await foc()==='b-level','A on SOLO opens its scene, STORY highlighted');
await tap(0);await W(200);ok(await vis('s-themes'),'A on STORY opens the Story screen');
await tap(0);await W(300);ok(await ev("state==='play'&&MODE===LEVEL"),'A on the first theme card starts the run');await ev('cineEnd()'); // skip the opening draw-in
// the reported bug: Start pauses, then the controller must still work
await tap(9);await W(150);ok(await ev("paused")&&await vis('s-pause'),'Start pauses');
ok(await foc()==='b-resume','RESUME is highlighted');
await tap(13);ok(await foc()==='b-restart','controller moves through the pause menu');
await tap(12);await tap(0);await W(150);ok(await ev("!paused&&state==='play'"),'A on RESUME resumes the game');
const x0=await ev("PL[0].x");await ev("__pad.buttons[15].pressed=true");await W(500);await ev("__pad.buttons[15].pressed=false");ok(await ev("PL[0].x")>x0+40,'after resuming, the controller moves Orange again');
await tap(9);await W(100);await tap(9);await W(100);ok(await ev("!paused"),'Start again on the pause menu resumes');
await tap(9);await W(100);await tap(1);await W(100);ok(await ev("!paused"),'B on the pause menu resumes');
// settings via controller
await tap(9);await W(100);await tap(13);await tap(13);await tap(13);await tap(0);await W(150);ok(await vis('s-settings'),'pause > SETTINGS (under MOVES) opens with the controller');
const v0=await ev("SET.mus");await tap(15);ok(await ev("SET.mus")>v0-1e-9&&await foc()==='o-mus','the music slider (first in Settings) is highlighted; right changes it ('+v0+' to '+await ev("SET.mus")+')');
await tap(1);await W(100);ok(await vis('s-pause'),'B in Settings goes back to the pause menu');
await tap(1);await W(100);
// keyboard binding
await ev("pause(true)");await p.click('#b-set2');await p.click('#o-binds');await W(100);ok(await vis('s-binds'),'Settings > Buttons opens the Buttons screen');
ok((await p.textContent('#bd-list')).includes('Punch'),'every action is listed');
await p.click('#bd-list .add[data-act="p"]');await p.keyboard.press('f');await W(100);
ok(await ev("KEYS.f==='p'"),'+ then F binds F to Punch');
await p.click('#bd-list .add[data-act="j"]');await p.keyboard.press('a');await W(100);
ok(await ev("KEYS.a==='j'&&!SET.binds.kb.l.includes('a')"),'binding A to Jump takes it away from Move left');
await p.click('#bd-list .add[data-act="k"]');await p.keyboard.press('Escape');await W(100);ok(/Cancelled/.test(await p.textContent('#bd-msg')),'Esc cancels');
// controller binding
await p.click('#bt-pad');await W(100);ok(/Xbox Wireless Controller/.test(await p.textContent('#bd-pad')),'Controller tab names the connected controller');
await p.click('#bd-list .add[data-act="p"]');await W(300);await tap(5,150);await W(100);
ok(await ev("padBinds(__pad).p.includes(5)&&!padBinds(__pad).s.includes(5)"),'pressing RB binds it to Punch (and takes it from Surge)');
ok((await p.textContent('#bd-list')).includes('RB'),'buttons show Xbox names');
// use them in game
await p.click('#bd-back');await p.click('#b-back');await W(100);await ev("pause(false)");await W(100);
await ev("releaseAll();E.forEach(e=>e.gone=1);E=[];LAST=null");await p.keyboard.press('f');await W(150);console.log(await ev("JSON.stringify({LAST,st:PL[0].st,state,paused,f:KEYS.f,K:inputOf(PL[0]).K,ui:$('ui').hidden})"));ok(await ev("PL[0].st==='atk'&&PL[0].att.b==='p'"),'F punches in the game');
await W(700);await ev("__pad.buttons[5].pressed=true");await W(60);const rb=await ev("PL[0].st==='atk'&&PL[0].att.b==='p'");await ev("__pad.buttons[5].pressed=false");ok(rb,'RB punches in the game');
// saved + migration
await p.reload();await p.waitForTimeout(150);await p.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await W(300);ok(await ev("KEYS.f==='p'&&padBinds(__pad).p.includes(5)&&JSON.parse(localStorage.getItem('orangeArmy.v1')).saveVersion>=3"),'bindings survive a reload (save version 3+)');
await ev("pause(true)");await ev("show('s-binds');BD.dev='kb';renderBinds()");await p.click('#bd-reset');ok(await ev("KEYS.j==='p'&&KEYS.a==='l'"),'Reset to default restores the keys');
await ev("localStorage.setItem('orangeArmy.v1',JSON.stringify({saveVersion:2,set:{vol:0.3},best:{score:77},prog:{woods1:{done:1,score:500,time:9000}}}))");await p.reload();await p.waitForTimeout(150);await p.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await W(300);
ok(await ev("SET.vol===0.3&&BEST.score===77&&PROG.woods1.done===1&&KEYS.j==='p'"),'a version 2 save loads intact with default buttons');
await p.screenshot({path:S+'/shots/binds-title.png'});await c.close();
// Switch controller: A (right button) confirms, B (bottom) goes back; names use Switch labels
const c2=await b.newContext({viewport:{width:1280,height:800}});await c2.addInitScript(PADJS('Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)'));
const q=await c2.newPage();q.on('pageerror',e=>errs.push(e.message));await q.goto(GAME);await q.evaluate("SET.tut=1");await q.waitForTimeout(150);await q.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await q.waitForTimeout(300);
const ev2=x=>q.evaluate(x);const tap2=async i=>{await ev2(`__pad.buttons[${i}].pressed=true`);await q.waitForTimeout(90);await ev2(`__pad.buttons[${i}].pressed=false`);await q.waitForTimeout(90)};
await tap2(13);await tap2(15);await tap2(1);await q.waitForTimeout(150);ok(await q.isVisible('#s-settings'),'Switch: A (right button) confirms');
await tap2(0);await q.waitForTimeout(100);ok(await q.isVisible('#s-title'),'Switch: B (bottom button) goes back');
await q.evaluate("show('s-binds');BD.dev='pad';renderBinds()");ok((await q.textContent('#bd-list')).includes('ZL'),'Switch buttons show Switch names (ZL, ZR, +)');
await q.screenshot({path:S+'/shots/binds-switch.png'});
ok(errs.length===0,'no page errors '+errs.join('|'));await b.close();console.log(fails?fails+' FAILED':'ALL PASS')})();
