const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M27: the level creator's bottom row fits without scroll bars (iPad and phone, every tab); the stage and arena
// pictures sit inside the tiles' rounded, outlined frame like the other tiles.
const {chromium,devices}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
for(const [dn,dev] of [['iPad',devices['iPad (gen 7) landscape']],['phone',devices['iPhone 13 landscape']]]){
const c=await b.newContext({...dev,colorScheme:dn==='iPad'?'dark':'light'});const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(GAME);await p.waitForTimeout(300);
const ev=x=>p.evaluate(x);
const fit=await ev("(()=>{SET.tut=1;titleOpenAll();openLevels();edNew('ashslope');const out={};for(const t of ['plat','foe','prop','flag','boss','erase','parts']){$('ed-tabs').querySelector('[data-k=\"'+t+'\"]').click();const e=$('ed-pal');out[t]=e.scrollHeight<=e.clientHeight+1&&getComputedStyle(e).overflowY==='hidden'&&[...e.children].every(x=>{const r=x.getBoundingClientRect(),q=e.getBoundingClientRect();return r.top>=q.top-1&&r.bottom<=q.bottom+1})}return out})()");
ok(Object.values(fit).every(Boolean),'['+dn+'] every tab\'s bottom row fits (no scroll bar, nothing cut off) '+JSON.stringify(fit));
ok(await ev("(()=>{EDS.boss='G';$('ed-tabs').querySelector('[data-k=\"boss\"]').click();const e=$('ed-pal');return e.scrollHeight<=e.clientHeight+1&&/PICKED/.test(e.textContent)})()"),'['+dn+'] the BOSS row fits, even with PICKED under a boss');
ok(await ev("(()=>{const bad=[];for(const t of ['foe','boss']){$('ed-tabs').querySelector('[data-k=\"'+t+'\"]').click();for(const b of $('ed-pal').querySelectorAll('.chitem')){const cv=b.querySelector('canvas'),k=cv.getContext('2d'),w=cv.width,h=cv.height,d=k.getImageData(0,0,w,h).data;let edge=0;for(let x=0;x<w;x++)edge+=d[x*4+3]+d[(w+x)*4+3];for(let y=0;y<h;y++)edge+=d[y*w*4+3]+d[(y*w+w-1)*4+3];if(edge)bad.push(b.textContent)}}return bad.length?bad.join(' | '):true})()")===true,'['+dn+'] every enemy and boss fits whole in its picture (nothing touches the edges: heads, hats and weapons show)');
ok(await ev("[...$('ed-pal').querySelectorAll('.chitem b')].every(b=>b.scrollWidth<=b.clientWidth+1&&!/…/.test(b.textContent))"),'['+dn+'] boss names show in full (two lines when they need it)');
if(dn==='iPad'){
ok(await ev("(()=>{const c=getComputedStyle($('ed-name')).color;return c==='rgb(28, 22, 38)'})()"),'the name is dark ink (on its light box, whatever the system colours)');
ok(await ev("(()=>{const u=stageThumbURL('rooftop');const i=new Image();i.src=u;return new Promise(r=>i.onload=()=>{const cv=document.createElement('canvas');cv.width=cv.height=200;const k=cv.getContext('2d');k.drawImage(i,0,0);const corner=k.getImageData(4,4,1,1).data[3],mid=k.getImageData(100,100,1,1).data[3];r(i.width===200&&i.height===200&&corner===0&&mid===255)})})()"),'a stage picture is a square with see-through corners (it sits inside the tile\'s frame)');
ok(await ev("(()=>{openStages(()=>{},'s-solo');const t=$('th-cards').querySelector('.th-mine');return /tile-frame\\.svg/.test(getComputedStyle(t).backgroundImage)})()"),'Solo Arcade\'s stage cards have the outlined frame');
ok(await ev("(()=>{openLobby();LB.mode='vs';renderLobby();const t=$('lb-sub').querySelector('[data-stage=\"rooftop\"] .pimg');return /tile-frame\\.svg/.test(getComputedStyle(t).backgroundImage)})()"),'the room\'s stage tiles have it too');
}
await c.close()}
ok(errs.length===0,'no errors '+errs.join('|'));console.log(fails?fails+' FAILED':'ALL PASS');await b.close();})();
