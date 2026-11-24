const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
const {chromium,devices}=require('playwright');const {PADS}=require('./mp.js');const S=process.argv[2];let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
for(const [nm,opt] of [['desk',{viewport:{width:1280,height:800}}],['ipad',devices['iPad (gen 7) landscape']]]){
const c=await b.newContext(opt);await c.addInitScript(PADS(['Pro Controller (Vendor: 057e Product: 2009)']));const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto(GAME);await p.evaluate("SET.tut=1");await p.waitForTimeout(400);
const ev=x=>p.evaluate(x),W=ms=>p.waitForTimeout(ms);const tap=async(i,ms=90)=>{await ev(`__pads[0].buttons[${i}].pressed=true`);await W(ms);await ev(`__pads[0].buttons[${i}].pressed=false`);await W(90)};
// PRESS START blinks (its visibility flips), so check it's shown rather than visible this instant
const shown=id=>ev(`(()=>{const e=$('${id}');return !!e&&!e.hidden&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0})()`);
ok(await shown('press')||await shown('tmenu'),nm+': PRESS START (or the menu, if the test controller already woke it)');
await tap(9);await W(100);ok(await p.isVisible('#tmenu'),nm+': Start on the controller opens the menu');
const labels=await ev("[...document.querySelectorAll('#tmenu button')].filter(b=>b.offsetParent&&getComputedStyle(b).visibility!=='hidden').map(b=>b.textContent)");
ok(JSON.stringify(labels)==='["SOLO","MULTIPLAYER","CUSTOMIZE","TRAINING","SETTINGS"]',nm+': menu '+labels.join(', '));
await p.screenshot({path:S+'/shots/menu2-'+nm+'-a.png'});
ok(await ev("getComputedStyle(document.querySelector('#b-solo .pimg')).backgroundImage.includes('menu-solo.svg')"),nm+': the tiles show their pictures');
await tap(1);await W(150);ok(await p.isVisible('#s-solo')&&await ev("document.activeElement.id==='b-level'"),nm+': A on SOLO opens its scene: STORY | ARCADE');
await p.screenshot({path:S+'/shots/menu2-'+nm+'-b.png'});
await tap(0);await W(150);ok(await p.isVisible('#s-title')&&await ev("document.activeElement.id==='b-solo'"),nm+': B returns to the title, SOLO highlighted');
await tap(15);await tap(1);await W(150);ok(await p.isVisible('#s-online')&&await p.isVisible('#b-multi')&&await p.isVisible('#on-host')&&await p.isVisible('#on-joinpick'),nm+': MULTIPLAYER opens LOCAL | HOST | JOIN');
ok(await ev("!document.querySelector('.poof')&&!document.querySelector('.split')"),nm+': no poof, no buttons popping up on the title');
await p.screenshot({path:S+'/shots/menu2-'+nm+'-c.png'});
await tap(0);await W(150);ok(await p.isVisible('#s-title')&&await ev("document.activeElement.id==='b-online'"),nm+': B returns to the title');
await tap(1);await W(150);await tap(14);await tap(1);await W(150);ok(await p.isVisible('#s-lobby'),nm+': LOCAL opens the Players screen');
await tap(0);await W(150);
await c.close()}
// gamepadconnected on PRESS START opens the menu too
const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();await p.goto(GAME);await p.evaluate("SET.tut=1");await p.waitForTimeout(300);
await p.evaluate("window.dispatchEvent(new Event('gamepadconnected'))");await p.waitForTimeout(100);ok(await p.isVisible('#tmenu'),'a controller connecting on PRESS START opens the menu');
// the title art loads, and a tall Settings screen scrolls from its top (nothing cut off above)
ok(await p.evaluate(()=>new Promise(r=>{const i=new Image();i.onload=()=>r(i.naturalWidth>1000);i.onerror=()=>r(false);i.src='img/title.jpg'})),'the title art loads');
ok(await p.evaluate(()=>getComputedStyle($('s-title')).backgroundImage.includes('title.jpg')),'the title screen shows it');
await p.evaluate(()=>{titleOpenAll();$('b-set1').click()});await p.waitForTimeout(200);
ok(await p.evaluate(()=>{const e=$('s-settings');return e.scrollHeight>e.clientHeight&&e.firstElementChild.getBoundingClientRect().top>=e.getBoundingClientRect().top}),'Settings scrolls and its heading is not cut off');
await p.keyboard.press('Escape');await p.waitForTimeout(150);ok(await p.evaluate(()=>$('s-settings').hidden&&!$('s-title').hidden),'Esc backs out of Settings');
await p.evaluate(()=>{$('b-start').click()});await p.waitForTimeout(300);await p.keyboard.press('Escape');await p.waitForTimeout(100);await p.evaluate(()=>$('b-set2')?$('b-set2').click():0);await p.waitForTimeout(100);
if(await p.evaluate(()=>!$('s-settings').hidden)){await p.keyboard.press('Escape');await p.waitForTimeout(150);ok(await p.evaluate(()=>$('s-settings').hidden&&!$('s-pause').hidden&&paused),'Esc backs out of Settings opened from pause, back to the pause menu')}else ok(false,'Settings opens from pause');
ok(await p.evaluate(()=>['s-lobby','s-online'].every(id=>getComputedStyle($(id)).backgroundImage.includes('multiplayer.jpg'))),'the multiplayer drawing is behind the Players and Online screens');
ok(await p.evaluate(()=>new Promise(r=>{const i=new Image();i.onload=()=>r(i.naturalWidth>1000);i.onerror=()=>r(false);i.src='img/multiplayer.jpg'})),'the multiplayer drawing loads');
ok(errs.length===0,'no page errors '+errs.join('|'));await b.close();console.log(fails?fails+' FAILED':'ALL PASS')})();
