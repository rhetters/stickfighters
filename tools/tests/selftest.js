// Determinism check: opens index.html?selftest twice and passes if both runs match the fingerprints the game expects
// (SELFTEST_EXPECT in js/selftest.js). usage: node selftest.js
const GAME='file://'+require('path').resolve(__dirname,'../../index.html');
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();let fails=0;
for(let k=0;k<2;k++){const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(GAME+'?selftest');await p.waitForSelector('#selftest',{timeout:90000});const t=await p.textContent('#selftest');
const good=/MATCH/.test(t)&&!errs.length;if(!good)fails++;console.log((good?'ok  ':'FAIL')+' '+t+(errs.length?' ERRORS '+errs.join('|'):''));await p.close()}
console.log(fails?fails+' FAILED':'ALL PASS');await b.close()})();
