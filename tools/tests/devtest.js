const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// The TEMPORARY TEST row on the Skills screen (js/devtools.js): fighter levels and ADMIN mode. Delete this file with it.
const {chromium}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];const p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto(GAME);await p.waitForTimeout(300);const ev=x=>p.evaluate(x);
await ev("saveFighter(0,{...FIGHTER0});CHR.cur=0;titleOpenAll();$('b-char').click();$('ch-skills').click()");
const lv=()=>ev("levelOf(fighter(0).prog.xp)"),btn=i=>ev(`document.querySelectorAll('#dev-test button')[${i}].click()`);
await btn(0);ok(await lv()===2,'+1 LEVEL');await btn(3);ok(await lv()===30,'LEVEL 30');await btn(4);ok(await lv()===1,'BACK TO 1');
// ADMIN: one hit from a player beats even a mini-boss; off again, it doesn't; never online
const hit=()=>ev("(()=>{SET.seed='4';startRun('castle');cineEnd();const e=F(PL[0].x+40,'mc',-1);e.y=G;E.push(e);hurtE(e,{dmg:5,kb:2,lift:0,ef:'hit'},1,null,PL[0]);return e.hp<=0})()");
ok(await ev("$('dev-admin').textContent")==='ADMIN: OFF','ADMIN starts off');
ok(!(await hit()),'without admin a punch does not beat a mini-boss');
await ev("$('dev-admin').click()");ok(await ev("$('dev-admin').textContent")==='ADMIN: ON'&&await ev("localStorage.getItem('sfAdmin')")==='1','ADMIN turns on and is remembered');
ok(await hit(),'with admin one punch beats a mini-boss');
ok(!(await ev("(()=>{NET.on=true;SET.seed='4';startRun('castle');cineEnd();const e=F(PL[0].x+40,'mc',-1);e.y=G;E.push(e);hurtE(e,{dmg:5,kb:2,lift:0,ef:'hit'},1,null,PL[0]);NET.on=false;return e.hp<=0})()")),'admin never works online');
await ev("$('dev-admin').click()");ok(!(await hit())&&await ev("localStorage.getItem('sfAdmin')")==='0','and off again');
ok(errs.length===0,'no errors '+errs.join(' | '));console.log(fails?fails+' FAILED':'ALL PASS');await b.close()})();
