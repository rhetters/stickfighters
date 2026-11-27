// Runs every test in this folder, one after another, and prints a summary. Needs Node and Playwright (with Chromium).
// usage: node tools/tests/run.js            all tests
//        node tools/tests/run.js net m10    only tests whose name contains "net" or "m10"
// Screenshots go to tools/tests/out/shots (not committed).
const {execFileSync}=require('child_process'),fs=require('fs'),path=require('path');
const TESTS=['names','selftest','m4test','m5test','m6test','m7test','m7ui','m8test','cptest','bindtest','m9lobby','m9vs','pm9test',
  'menu2test','m10test','navtest','m18test','m12test','m13test','m14test','m15test','m19test','m20test','m21test','m16test','m17test','airtest','devtest','spam','nettest','nettest2','nettest3','netview','nethouse','netready','mylevels','hitmodel','net6','netlag','netloss','m22test','m23test','m24test'];
const want=process.argv.slice(2),out=path.join(__dirname,'out');fs.mkdirSync(path.join(out,'shots'),{recursive:true});
let bad=[];
for(const t of TESTS.filter(t=>!want.length||want.some(w=>t.includes(w)))){
  let txt='';
  try{txt=execFileSync('node',[path.join(__dirname,t+'.js'),'.'],{cwd:out,timeout:300000,encoding:'utf8'})}catch(e){txt=(e.stdout||'')+(e.stderr||'')+'\nCRASHED'}
  const fl=txt.split('\n').filter(l=>/^FAIL|CRASHED/.test(l)),pass=!fl.length&&/ALL (PASS|OK|M\d CHECKS OK)/.test(txt);
  console.log((pass?'pass ':'FAIL ')+t+(pass?'':'\n  '+(fl.join('\n  ')||txt.trim().split('\n').slice(-3).join('\n  '))));
  if(!pass)bad.push(t);
}
console.log(bad.length?'\n'+bad.length+' test file(s) failed: '+bad.join(', '):'\nEverything passed.');process.exit(bad.length?1:0);
