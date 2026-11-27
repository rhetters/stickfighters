const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M25: COLORS asks for a sub-category first (Upper Body: Shirts, Jackets, Gloves); the item being coloured has None
// beside it; tapping the item picks another of that sub-category to wear and colour.
const {chromium,devices}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext(devices['iPad (gen 7) landscape']);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(GAME);await p.waitForTimeout(300);
const ev=x=>p.evaluate(x),W=()=>p.waitForTimeout(150);
await ev("SET.tut=1;titleOpenAll();ECO.own.push('shirt-white','shirt-stripe','face-ninja','pants-jeans','shorts-blue','trail-gold');const f=fighterNow();f.eq.shirt='shirt-white';f.eq.face='face-ninja';f.eq.legs='shorts-blue';f.eq.surge='trail-gold';saveFighter(CHR.cur,f);openChar();chGo('colors')");
await ev("$('ch-cats').querySelector('[data-k=\"paint-upper\"]').click()");await W();
ok(await ev("$('ch-path').textContent==='COLORS › UPPER BODY'&&[...$('ch-cats').querySelectorAll('[data-k]')].map(b=>b.dataset.k).join()==='sec-shirt,sec-jacket,sec-gloves'&&$('ch-grid').hidden"),'Upper Body shows its sub-categories: Shirts, Jackets, Gloves');
await ev("$('ch-cats').querySelector('[data-k=\"sec-shirt\"]').click()");await W();
ok(await ev("$('ch-path').textContent==='COLORS › UPPER BODY › SHIRTS'&&(()=>{const k=[...$('ch-grid').querySelectorAll('.chitem')].map(b=>b.dataset.id);return k[0]==='cur-shirt-white'&&k[1]==='pnone'&&k[2]==='tint-none'})()"),'Shirts: the T-Shirt you wear, None beside it, then its colours');
await ev("$('ch-grid').querySelector('[data-id=\"cur-shirt-white\"]').click()");await W();
ok(await ev("(()=>{const k=[...$('ch-grid').querySelectorAll('.chitem')].map(b=>b.dataset.id);return k.join()==='pnone,pick-shirt-white,pick-shirt-stripe'})()"),'tapping the T-Shirt shows None and your other shirts (only shirts)');
await ev("$('ch-grid').querySelector('[data-id=\"pick-shirt-stripe\"]').click()");await W();
ok(await ev("fighterNow().eq.shirt==='shirt-stripe'&&!!$('ch-grid').querySelector('[data-id=\"cur-shirt-stripe\"]')&&!!$('ch-grid').querySelector('[data-id=\"tint-red\"]')"),'picking the Striped Tee wears it and shows its colours');
await ev("$('ch-grid').querySelector('[data-id=\"pnone\"]').click()");await W();
ok(await ev("fighterNow().eq.shirt===null&&$('ch-grid').querySelector('[data-id=\"pnone\"]').classList.contains('on')&&!$('ch-grid').querySelector('[data-id^=\"tint-\"]')"),'None takes the shirt off; then you pick one to wear (no colours until you do)');
await ev("chUp()");await W();
ok(await ev("$('ch-path').textContent==='COLORS › UPPER BODY'&&document.activeElement.dataset.k==='sec-shirt'"),'BACK goes to the sub-categories, on Shirts');
await ev("chUp()");await W();
ok(await ev("$('ch-path').textContent==='COLORS'&&document.activeElement.dataset.k==='paint-upper'"),'BACK again goes to the eight kinds');
// Lower Body › Pants while wearing shorts: None is on (no pants), and it doesn't take your shorts off
await ev("$('ch-cats').querySelector('[data-k=\"paint-lower\"]').click();$('ch-cats').querySelector('[data-k=\"sec-pants\"]').click()");await W();
ok(await ev("$('ch-grid').querySelector('[data-id=\"pnone\"]').classList.contains('on')&&(()=>{$('ch-grid').querySelector('[data-id=\"pnone\"]').click();return fighterNow().eq.legs==='shorts-blue'})()"),'Pants while wearing shorts: None is lit and leaves the shorts on');
// a kind with one sub-category (Surge) goes straight to it, with None
await ev("chUp();chUp();$('ch-cats').querySelector('[data-k=\"paint-surge\"]').click()");await W();
ok(await ev("$('ch-path').textContent==='COLORS › SURGE'&&!!$('ch-grid').querySelector('[data-id=\"cur-trail-gold\"]')&&!!$('ch-grid').querySelector('[data-id=\"pnone\"]')"),'Surge goes straight to your Surge, with None beside it');
// Poses: no None (a pose isn't worn)
await ev("chUp();$('ch-cats').querySelector('[data-k=\"paint-poses\"]').click()");await W();
ok(await ev("!$('ch-grid').querySelector('[data-id=\"pnone\"]')"),'Poses has no None');
ok(errs.length===0,'no errors '+errs.join('|'));console.log(fails?fails+' FAILED':'ALL PASS');await b.close();})();
