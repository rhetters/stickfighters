const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
const {chromium}=require('playwright');const {PADS}=require('./mp.js');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1024,height:768}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.addInitScript(PADS(['Xbox Wireless Controller']));
await p.goto(GAME);await p.waitForTimeout(300);const ev=s=>p.evaluate(s);const W=t=>p.waitForTimeout(t);
const tap=async(btn)=>{await ev(`__pads[0].buttons[${btn}].pressed=true`);await W(60);await ev(`__pads[0].buttons[${btn}].pressed=false`);await W(60);};
ok(await ev("ECO.stars===0&&owns('col-orange')&&!owns('hat-cap')"),'fresh save: 0 stars, free colors owned');
ok(await ev("!buyItem('hat-cap')&&ECO.stars===0"),'cannot buy without stars');
await ev("grantStars(100,'test')");
ok(await ev("ECO.stars===100&&ECO.got===100"),'grantStars adds');
ok(await ev("!buyItem('hat-ranger')&&!buyItem('hat-viking')"),'unlock and gift items cannot be bought');
await ev("titleOpenAll();$('b-char').click()");await W(200);
ok(await ev("!$('s-char').hidden&&!!CHR.list[0]"),'Character opens and makes Fighter 1');
await ev("CH.tab='head';renderChar();itemTap('hat-cap')");
ok(await ev("ECO.stars===100&&CH.tryOn.hat==='hat-cap'&&/again to buy/.test($('ch-msg').textContent)"),'first tap tries on');
await ev("itemTap('hat-cap')");
ok(await ev("ECO.stars===60&&owns('hat-cap')&&fighter(0).eq.hat==='hat-cap'"),'second tap buys and wears (40 stars)');
await ev("noneTap('hat')");ok(await ev("fighter(0).eq.hat===null"),'None takes it off');
ok(await ev("CHR.list.length===4&&document.querySelectorAll('.chslot').length===4"),'four fighter slots');
await ev("CH.tab='poses';renderChar();itemTap('pose-wave')");ok(await ev("!fighter(0).wheel.includes('pose-wave')"),'tapping a pose on the wheel takes it off');
await ev("itemTap('pose-wave')");ok(await ev("fighter(0).wheel.join()==='pose-flex,pose-wave'"),'tapping it again puts it back');
await ev("charSlot(3);CH.tab='body';renderChar();$('ch-del').click()");ok(await ev("!!CHR.list[3]&&/again/.test($('ch-msg').textContent)"),'delete asks first');
await ev("$('ch-del').click()");ok(await ev("CHR.list[3]===null&&CHR.cur===0"),'second tap deletes and picks another fighter');
ok(await ev("JSON.stringify(normFighter({eq:{trail:'trail-fire',pose:'pose-dance'}}))").then(j=>{const f=JSON.parse(j);return f.eq.surge===null&&f.wheel[0]==='pose-flex'}),'old unowned trail/pose fall back');
await ev("ECO.own.push('trail-fire','pose-dance')");ok(await ev("(f=>f.eq.surge==='trail-fire'&&f.wheel[0]==='pose-dance')(normFighter({eq:{trail:'trail-fire',pose:'pose-dance'}}))"),'old trail becomes Surge style, old victory pose leads the wheel');
await ev("ECO.own=ECO.own.filter(x=>x!=='trail-fire'&&x!=='pose-dance')");
await ev("CH.tab='head';renderChar()");
await ev("itemTap('hat-wizard')");await ev("itemTap('hat-wizard')");ok(await ev("ECO.stars===60&&!owns('hat-wizard')&&/more stars/.test($('ch-msg').textContent)"),'too expensive: says how many more');
ok(await ev("normFighter({col:'col-slate',eq:{hat:'hat-wizard'}}).col==='col-orange'&&normFighter({eq:{hat:'hat-wizard'}}).eq.hat===null"),'unowned items come off a fighter');
await ev("charSlot(1)");ok(await ev("CHR.cur===1&&CHR.list[1].name==='FIGHTER 2'&&CHR.list[1].col!=='col-orange'"),'new fighter slot gets a fresh color');
await ev("$('ch-name').value='rhett!!<b>';$('ch-name').dispatchEvent(new Event('input'))");ok(await ev("fighter(1).name==='RHETT!!B'"),'names cleaned and uppercased');
// controller back closes
await tap(1);await W(100);ok(await ev("$('s-char').hidden&&!$('s-title').hidden"),'controller B leaves Character');
await p.reload();await W(300);
ok(await ev("ECO.stars===60&&owns('hat-cap')&&CHR.cur===1&&fighter(1).name==='RHETT!!B'"),'stars, items and fighters survive a reload');
ok(await ev("JSON.parse(localStorage.getItem('orangeArmy.v1')).saveVersion===SAVE_VERSION"),'save version is current');
// play: drops and HUD
await ev("SET.seed='7';start();PL[0].hp=PL[0].max=1e6");ok(await ev("PL[0].look&&PL[0].name==='RHETT!!B'"),'Player 1 uses the current fighter');
await ev("for(let i=0;i<400;i++){fr++;update();} for(const e of E){e.hp=1;hurtE(e,A.jab,1,PL[0]);} for(let i=0;i<500;i++){fr++;update();}");
ok(await ev("RUN.stars>0&&ECO.stars===60+RUN.stars"),'kills drop stars that reach the wallet ('+await ev('RUN.stars')+')');
ok(await ev("selfTest().hash==='c87c9470'"),'self-test unchanged while stars drop');
// pose wheel in a fight
await ev("start();PL[0].hp=PL[0].max=1e6;setA('kb','e',1,0);for(let i=0;i<5;i++){fr++;update();} setA('kb','l',1,0);for(let i=0;i<5;i++){fr++;update();}");
ok(await ev("PL[0].wheel&&PL[0].wheel.d===6&&Math.abs(PL[0].vx)<0.5"),'holding the pose button opens the wheel and stands still');
await ev("setA('kb','e',0,0);setA('kb','l',0,0);fr++;update()");ok(await ev("!PL[0].wheel&&PL[0].emote&&PL[0].emote.d===6"),'letting go strikes the pose');
await ev("setA('kb','r',1,0);fr++;update();setA('kb','r',0,0)");ok(await ev("!PL[0].emote"),'moving ends the pose');
ok(await ev("JSON.parse(localStorage.getItem('orangeArmy.v1')).eco.stars>=60"),'self-test does not touch the save');
// training: no drops
await ev("startTrain();spawnDummy('g');TR.mortal=1;for(const e of E){e.hp=1;hurtE(e,A.jab,1,PL[0]);} for(let i=0;i<200;i++){fr++;update();}");
ok(await ev("PK.length===0"),'no stars in the Training Room');
ok(errs.length===0,'no page errors '+errs.join('|'));
console.log(fails?fails+' FAILED':'ALL PASS');await b.close()})();
