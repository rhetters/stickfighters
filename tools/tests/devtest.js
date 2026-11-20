const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// The TEMPORARY TEST row on the Skills screen (js/devtools.js). Delete this file with it.
const {chromium}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];const p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto(GAME);await p.waitForTimeout(300);const ev=x=>p.evaluate(x);
await ev("saveFighter(0,{...FIGHTER0});CHR.cur=0;titleOpenAll();$('b-char').click();$('ch-skills').click()");
const lv=()=>ev("levelOf(fighter(0).prog.xp)"),btn=i=>ev(`document.querySelectorAll('#dev-test button')[${i}].click()`);
await btn(0);ok(await lv()===2,'+1 LEVEL');await btn(3);ok(await lv()===30,'LEVEL 30');await btn(4);ok(await lv()===1,'BACK TO 1');
ok(errs.length===0,'no errors '+errs.join(' | '));console.log(fails?fails+' FAILED':'ALL PASS');await b.close()})();
