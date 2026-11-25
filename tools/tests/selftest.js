// Determinism check: opens index.html?selftest twice and passes if both runs match the fingerprints the game expects
// (SELFTEST_EXPECT in js/selftest.js). usage: node selftest.js
const GAME='file://'+require('path').resolve(__dirname,'../../index.html');
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();let fails=0;
for(let k=0;k<2;k++){const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(GAME+'?selftest');await p.waitForSelector('#selftest',{timeout:90000});const t=await p.textContent('#selftest');
const good=/MATCH/.test(t)&&!errs.length;if(!good)fails++;console.log((good?'ok  ':'FAIL')+' '+t+(errs.length?' ERRORS '+errs.join('|'):''));await p.close()}
// Effects (particles, sounds) never change the game: the same run with them switched off (SIM.mute, as a rollback
// re-play will do) gives the same fingerprints
{const p=await b.newPage();await p.goto(GAME);await p.waitForTimeout(300);
const r=await p.evaluate(()=>{const a=selfTest();SIM.mute=1;const m=selfTest();SIM.mute=0;return {a,m,fx:FX.length}});
const good=r.a.hash===r.m.hash&&r.a.hashL===r.m.hashL;if(!good)fails++;console.log((good?'ok  ':'FAIL')+' effects off, same game: '+r.a.hash+'/'+r.a.hashL+' vs '+r.m.hash+'/'+r.m.hashL);await p.close()}
console.log(fails?fails+' FAILED':'ALL PASS');await b.close()})();
