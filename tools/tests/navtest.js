const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
const {chromium}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:768}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(GAME);await p.waitForTimeout(300);const ev=s=>p.evaluate(s);
await ev("ECO.own=ITEMS.map(i=>i.id);saveFighter(0,{...FIGHTER0,name:'DAD'});saveFighter(1,{...FIGHTER0,name:'RHETT'});saveFighter(2,{...FIGHTER0,name:'RAELYNN'});titleOpenAll();$('b-char').click();CH.tab='neck';renderChar();document.querySelectorAll('.chslot')[1].focus()");
const name=()=>ev("document.activeElement.textContent.trim()");
await ev("navMove('d')");ok(/Head|Colors/.test(await name()),'down from RHETT goes to the tab row: '+await name());
await ev("document.querySelectorAll('.chslot')[1].focus();navMove('r')");ok(/RAELYNN/.test(await name()),'right from RHETT goes to RAELYNN');
await ev("navMove('l');navMove('l')");ok(/DAD/.test(await name()),'left twice goes to DAD');
await ev("$('ch-tabs').querySelector('.on').focus();navMove('d')");ok(/Scarf/.test(await name()),'down from Neck tab goes into the shelf below it: '+await name());
await ev("navMove('r')");ok(/Green Scarf/.test(await name()),'right goes along the shelf: '+await name());
// title menu
await ev("closeChar();titleOpenAll();backToTitle('b-solo');navMove('r')");ok(await ev("document.activeElement.id==='b-online'"),'title: right from SOLO to MULTIPLAYER '+await ev('document.activeElement.id+" "+navItems().map(e=>e.id).join()'));
// scroll kept
await ev("$('b-char').click();CH.tab='head';renderChar();$('ch-grid').scrollTop=200;itemTap('hair-pigtails')");
ok(await ev("$('ch-grid').scrollTop")>150,'tapping an item keeps the shelf scroll position ('+await ev("$('ch-grid').scrollTop")+')');
ok(errs.length===0,'no errors '+errs.join('|'));console.log(fails?fails+' FAILED':'ALL PASS');await b.close()})();
