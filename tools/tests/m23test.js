const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M23: the House screen's TOOLS tab (where ERASE was): ROTATE turns a thing a quarter turn, FLIP mirrors it, ERASE
// as before. Turned and mirrored things are kept in the save (version 22) and shared when friends visit.
const {chromium,devices}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext(devices['iPad (gen 7) landscape']);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(GAME);await p.waitForTimeout(300);
// a version 21 save with a house: its things come through as they were
await p.evaluate(()=>localStorage.setItem('orangeArmy.v1',JSON.stringify({saveVersion:21,set:{tut:1},eco:{stars:1000,got:1000,own:[],seen:[],tint:{}},house:{bg:'hbg-paper',cells:{},items:[{id:'hf-chair',x:2,y:0},{id:'hf-bed',x:5,y:0},{id:'hf-couch',x:12,y:0}]}})));
await p.reload();await p.waitForTimeout(400);
const ev=x=>p.evaluate(x);
ok(await ev("HOUSE.items.length===3&&HOUSE.items.every(i=>!i.r&&!i.f)"),'a version 21 house comes through: nothing turned or flipped');
await ev("titleOpenAll();openHouse()");await p.waitForTimeout(150);
ok(await ev("[...$('hs-tabs').children].map(b=>b.textContent).join()==='WALLS,BARRIERS,FURNITURE,DECORATIONS,BACKGROUND,TOOLS'"),'the last tab is TOOLS (where ERASE was)');
await ev("$('hs-tabs').children[5].click()");await p.waitForTimeout(100);
ok(await ev("['ROTATE','FLIP','ERASE'].every(t=>[...$('hs-pal').children].some(b=>b.querySelector('b').textContent===t))"),'TOOLS: ROTATE, FLIP and ERASE');
const tool=t=>`[...$('hs-pal').children].find(b=>b.querySelector('b').textContent==='${t}').click()`;
// rotate the couch (3 x 1): it stands on end (1 x 3), and four turns bring it back
await ev(tool('ROTATE'));
const v=c0=>`[...document.querySelectorAll('.hcell')].find(b=>b.dataset.v==='${c0},0')`;
await p.evaluate(`${v(12)}.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:${v(12)}.getBoundingClientRect().x+5,clientY:${v(12)}.getBoundingClientRect().y+5}))`);
ok(await ev("(()=>{const it=HOUSE.items.find(i=>i.id==='hf-couch');const [w,h]=houseFoot(it,ITEM[it.id]);return it.r===1&&w===1&&h===3})()"),'ROTATE turns the couch a quarter turn: one square wide, three high');
ok(await ev("houseItemAt(12,2)>=0&&houseItemAt(13,0)<0"),'it covers its new squares (tapping above it finds it; beside it, nothing)');
await ev("for(let i=0;i<3;i++)houseAct(12,0)");
ok(await ev("!('r' in HOUSE.items.find(i=>i.id==='hf-couch'))"),'four turns bring it back');
// flip the bed: lie down with the head on the right
await ev(tool('FLIP')+";houseAct(6,0)");
ok(await ev("HOUSE.items.find(i=>i.id==='hf-bed').f===1"),'FLIP mirrors the bed');
await ev("houseAct(6,0);houseAct(6,0)");
ok(await ev("HOUSE.items.find(i=>i.id==='hf-bed').f===1"),'flipping twice puts it back, a third time mirrors it again');
ok(await ev("(()=>{const s0=ECO.stars;houseAct(18,4);return ECO.stars===s0})()"),'tapping an empty square does nothing (no stars)');
// erase still works and refunds
await ev(tool('ERASE'));
ok(await ev("(()=>{const s0=ECO.stars;houseAct(2,0);return !HOUSE.items.some(i=>i.id==='hf-chair')&&ECO.stars===s0+(ITEM['hf-chair'].price||0)})()"),'ERASE removes a thing and gives its stars back');
// saved and shared
ok(await ev("(()=>{save();const s=JSON.parse(localStorage.getItem('orangeArmy.v1'));return s.saveVersion===SAVE_VERSION&&SAVE_VERSION>=22&&s.house.items.find(i=>i.id==='hf-bed').f===1&&normHouse({items:[{id:'hf-bed',x:1,y:0,r:7,f:'x'}]},true).items[0].r===undefined})()"),'turned and flipped things are saved; a visitor\'s house is checked (bad turns dropped)');
// walking around: the flipped bed puts your head on its right; a turned chair can't be sat on
await ev("HOUSE.items.push({id:'hf-chair',x:10,y:0,r:1});houseSave();startHouse({...normHouse(HOUSE),name:'MY HOUSE'})");
const lie=await ev("(()=>{const f=PL[0],s=HGRID.cell,bed=HVIEW.items.find(i=>i.id==='hf-bed');f.x=(bed.x+1.5)*s;f.y=f.gy=G;f.st='free';setA('kb','p',1);fr++;update();setA('kb','p',0);for(let i=0;i<10;i++){fr++;update()}const r={use:f.use&&f.use.k,face:f.use&&f.use.face};setA('kb','p',1);fr++;update();setA('kb','p',0);for(let i=0;i<30;i++){fr++;update()}f.x=10.5*s;f.y=G;setA('kb','p',1);fr++;update();setA('kb','p',0);fr++;update();r.chair=!!f.use;return r})()");
ok(lie.use==='lie'&&lie.face===1,'on a flipped bed you lie with your head on its right '+JSON.stringify(lie));
ok(!lie.chair,'a chair on its side can\'t be sat on');
ok(errs.length===0,'no errors '+errs.join('|'));console.log(fails?fails+' FAILED':'ALL PASS');await b.close();})();
