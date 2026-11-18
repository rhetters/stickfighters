const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
const {chromium,devices}=require('playwright');
const S=process.argv[2];let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
for(const [nm,opt] of [['desk',{viewport:{width:1280,height:800}}],['ipad',{...devices['iPad (gen 7) landscape']}],['phone',{...devices['iPhone 13 landscape']}]]){
const c=await b.newContext(opt);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto(GAME);await p.waitForTimeout(150);await p.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await p.waitForTimeout(300);
const ev=x=>p.evaluate(x),W=ms=>p.waitForTimeout(ms);
ok(!(await p.isVisible('#tbtns')),nm+': top buttons hidden on title');
if(nm==='desk')await p.click('#b-train');else await p.tap('#b-train');await W(400);
ok(await p.isVisible('#t-feel')&&await p.isVisible('#t-moves')&&await p.isVisible('#t-info'),nm+': Feel / Moves / Info buttons at the top in training');
const tl=await p.locator('#tbtns').boundingBox(),wr=await p.locator('#wrap').boundingBox();ok(tl.x+tl.width<wr.x+wr.width*.99&&tl.y<wr.y+wr.height*.1,nm+': buttons sit top-center-right ('+Math.round(tl.x-wr.x)+'..'+Math.round(tl.x+tl.width-wr.x)+' of '+Math.round(wr.width)+')');
const tap=async s=>{if(nm==='desk')await p.click(s);else await p.tap(s);await W(200)};
await tap('#t-info');ok(await p.isVisible('#info')&&(await p.locator('#info .card').count())===7,nm+': Info opens with 7 fighter cards');
const txt=await p.textContent('#info');ok(/Guard/.test(txt)&&/shield/.test(txt)&&/Height/.test(txt)&&/Speed/.test(txt)&&/Damage/.test(txt)&&/Health/.test(txt),nm+': info has tips, health, speed, damage, height');
await p.screenshot({path:S+'/shots/info-'+nm+'.png'});
await tap('#t-moves');ok(await p.isVisible('#moves')&&!(await p.isVisible('#info')),nm+': Moves replaces Info');
await tap('#t-feel');ok(await p.isVisible('#feel'),nm+': Feel opens');await p.screenshot({path:S+'/shots/tbtns-'+nm+'.png'});
await tap('#t-feel');await tap('#t-moves');
if(nm==='desk'){await p.keyboard.press('i');await W(150);ok(await p.isVisible('#info'),'I hotkey opens Info');await p.keyboard.press('f');await W(150);ok(await p.isVisible('#feel'),'F hotkey opens Feel');await p.keyboard.press('t');await W(150);ok(await p.isVisible('#feel'),'T no longer toggles Feel');await p.keyboard.press('m');await W(150);ok(await p.isVisible('#moves'),'M hotkey opens Moves');
 await ev("E.forEach(e=>e.gone=1);E=[]");await p.keyboard.press('4');await W(300);ok(await p.textContent('canvas').then(()=>true),'');}
await c.close()}
ok(errs.length===0,'no page errors '+errs.join('|'));await b.close();console.log(fails?fails+' FAILED':'ALL PASS')})();
