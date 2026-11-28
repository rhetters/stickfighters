const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M27: the level creator's bottom row fits without scroll bars (iPad and phone, every tab); the stage and arena
// pictures sit inside the tiles' rounded, outlined frame like the other tiles.
const {chromium,devices}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
for(const [dn,dev] of [['iPad',devices['iPad (gen 7) landscape']],['phone',devices['iPhone 13 landscape']]]){
const c=await b.newContext(dev);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(GAME);await p.waitForTimeout(300);
const ev=x=>p.evaluate(x);
const fit=await ev("(()=>{SET.tut=1;titleOpenAll();openLevels();edNew('ashslope');const out={};for(const t of ['plat','foe','prop','flag','boss','erase','parts']){$('ed-tabs').querySelector('[data-k=\"'+t+'\"]').click();const e=$('ed-pal');out[t]=e.scrollHeight<=e.clientHeight+1&&getComputedStyle(e).overflowY==='hidden'&&[...e.children].every(x=>{const r=x.getBoundingClientRect(),q=e.getBoundingClientRect();return r.top>=q.top-1&&r.bottom<=q.bottom+1})}return out})()");
ok(Object.values(fit).every(Boolean),'['+dn+'] every tab\'s bottom row fits (no scroll bar, nothing cut off) '+JSON.stringify(fit));
if(dn==='iPad'){
ok(await ev("(()=>{const u=stageThumbURL('rooftop');const i=new Image();i.src=u;return new Promise(r=>i.onload=()=>{const cv=document.createElement('canvas');cv.width=cv.height=200;const k=cv.getContext('2d');k.drawImage(i,0,0);const corner=k.getImageData(4,4,1,1).data[3],mid=k.getImageData(100,100,1,1).data[3];r(i.width===200&&i.height===200&&corner===0&&mid===255)})})()"),'a stage picture is a square with see-through corners (it sits inside the tile\'s frame)');
ok(await ev("(()=>{openStages(()=>{},'s-solo');const t=$('th-cards').querySelector('.th-mine');return /tile-frame\\.svg/.test(getComputedStyle(t).backgroundImage)})()"),'Solo Arcade\'s stage cards have the outlined frame');
ok(await ev("(()=>{openLobby();LB.mode='vs';renderLobby();const t=$('lb-sub').querySelector('[data-stage=\"rooftop\"] .pimg');return /tile-frame\\.svg/.test(getComputedStyle(t).backgroundImage)})()"),'the room\'s stage tiles have it too');
}
await c.close()}
ok(errs.length===0,'no errors '+errs.join('|'));console.log(fails?fails+' FAILED':'ALL PASS');await b.close();})();
