const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
const {chromium,devices}=require('playwright');const {PADS}=require('./mp.js');const S=process.argv[2];let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
for(const [nm,opt] of [['desk',{viewport:{width:1280,height:800}}],['ipad',devices['iPad (gen 7) landscape']]]){
const c=await b.newContext(opt);await c.addInitScript(PADS(['Pro Controller (Vendor: 057e Product: 2009)']));const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto(GAME);await p.waitForTimeout(400);
const ev=x=>p.evaluate(x),W=ms=>p.waitForTimeout(ms);const tap=async(i,ms=90)=>{await ev(`__pads[0].buttons[${i}].pressed=true`);await W(ms);await ev(`__pads[0].buttons[${i}].pressed=false`);await W(90)};
const geo=()=>ev("['s-title','b-char','b-train','b-set1','b-mp'].map(id=>{const e=id==='s-title'?document.querySelector('#s-title h1'):$(id);const r=e.getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)].join(',')}).join(' | ')");
ok(await p.isVisible('#press'),nm+': PRESS START');
await tap(9);await W(100);ok(await p.isVisible('#tmenu'),nm+': Start on the controller opens the menu');
const labels=await ev("[...document.querySelectorAll('#tmenu button')].filter(b=>b.offsetParent&&getComputedStyle(b).visibility!=='hidden').map(b=>b.textContent)");
ok(JSON.stringify(labels)==='["SOLO","MULTIPLAYER","CUSTOMIZE","TRAINING ROOM","SETTINGS"]',nm+': menu '+labels.join(', '));
const g0=await geo();await p.screenshot({path:S+'/shots/menu2-'+nm+'-a.png'});
await tap(1);await W(100);ok(await ev("!$('solorow').hidden&&document.activeElement.id==='b-level'"),nm+': A on SOLO shows CAMPAIGN | ARCADE');
const g1=await geo();ok(g0===g1,nm+': title and other buttons do not move or resize');
await p.screenshot({path:S+'/shots/menu2-'+nm+'-b.png'});
await tap(0);ok(await ev("$('solorow').hidden&&document.activeElement.id==='b-solo'"),nm+': B folds it back');
await tap(13);await tap(1);ok(await ev("document.querySelectorAll('.poof i').length>=6&&$('mprow').classList.contains('popin')"),nm+': an orange poof as the two buttons pop in');await W(800);ok(await ev("!document.querySelector('.poof')"),nm+': the poof cleans itself up');ok(await ev("!$('mprow').hidden&&document.activeElement.id==='b-multi'"),nm+': MULTIPLAYER shows LOCAL | ONLINE');
const g2=await geo().then(s=>s.split(' | ').slice(0,4).join(' | '));ok(g0.split(' | ').slice(0,4).join(' | ')===g2,nm+': still nothing moves');
await p.screenshot({path:S+'/shots/menu2-'+nm+'-c.png'});
await tap(15);await tap(1);await W(100);ok(await p.isVisible('#s-online'),nm+': ONLINE opens the placeholder');
await tap(0);await W(100);ok(await ev("!$('s-title').hidden&&!$('mprow').hidden"),nm+': B returns to the menu');
await tap(14);await tap(1);await W(150);ok(await p.isVisible('#s-lobby'),nm+': LOCAL opens the Players screen');
await tap(0);await W(150);
await c.close()}
// gamepadconnected on PRESS START opens the menu too
const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();await p.goto(GAME);await p.waitForTimeout(300);
await p.evaluate("window.dispatchEvent(new Event('gamepadconnected'))");await p.waitForTimeout(100);ok(await p.isVisible('#tmenu'),'a controller connecting on PRESS START opens the menu');
ok(errs.length===0,'no page errors '+errs.join('|'));await b.close();console.log(fails?fails+' FAILED':'ALL PASS')})();
