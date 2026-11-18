// House builder: Customize menu, everything costs stars per piece and erasing refunds it, floors and stairs, the land
// growing, the save (version 7, upgraded from 5 and 6), floors and stairs as terrain when walking around, walking around the house, and visiting the host's house online.
const GAME='file://'+require('path').resolve(__dirname,'../../index.html');
const {chromium,devices}=require('playwright');const {spawn}=require('child_process');const S=process.argv[2]||'.';let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext(devices['iPad (gen 7) landscape']);
// a version 5 save with a fighter and stars, from before houses existed
await c.addInitScript(()=>{if(!localStorage.getItem('orangeArmy.v1'))localStorage.setItem('orangeArmy.v1',JSON.stringify({saveVersion:5,set:{},best:{score:5,wave:2,combo:3},prog:{},eco:{stars:500,got:500,own:[],seen:[]},chr:{cur:0,list:[{name:'RHETT',col:'col-orange'},null,null,null]}}))});
const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(GAME);await p.waitForTimeout(400);
const ev=x=>p.evaluate(x);
ok(await ev("HOUSE.bg==='hbg-paper'&&ECO.stars===500&&CHR.list[0].name==='RHETT'"),'a version 5 save loads: stars and fighter kept, empty house');
await ev("titleReveal()");await ev("$('b-cust').click()");
ok(await ev("!$('custrow').hidden&&$('b-char').offsetParent&&$('b-house').offsetParent"),'CUSTOMIZE opens CHARACTER | HOUSE');
await ev("$('b-house').click()");ok(await p.isVisible('#s-house'),'HOUSE opens the house screen');
const box=await p.locator('#hs-cells').boundingBox();const cw=box.width/20,ch=box.height/7;
await p.mouse.move(box.x+cw*12.5,box.y+ch*6.5);await p.mouse.down();for(let i=12;i<17;i++)await p.mouse.move(box.x+cw*(i+.5),box.y+ch*6.5,{steps:2});await p.mouse.up();
ok(await ev("Object.keys(HOUSE.cells).length===5&&HOUSE.cells['12,0']==='wood'&&ECO.stars===490"),'dragging paints 5 wood squares on the bottom row for 2 stars each ('+await ev('ECO.stars')+')');
const card=n=>ev(`[...$('hs-pal').children].find(b=>b.textContent.includes('${n}')).click()`);
await ev("$('hs-tabs').children[0].click()");await card('Brick');await p.locator('.hcell').nth(6*20+12).tap();
ok(await ev("HOUSE.cells['12,0']==='brick'&&ECO.stars===489"),'painting brick over wood refunds the wood (2) and charges brick (3)');
await ev("$('hs-tabs').children[2].click()");await card('Bed');ok(await ev("HS.item==='hf-bed'&&ECO.stars===489"),'picking an item costs nothing yet');
await p.locator('.hcell').nth(6*20+2).tap();ok(await ev("HOUSE.items.some(i=>i.id==='hf-bed'&&i.x===2&&i.y===0)&&ECO.stars===389"),'placing a bed costs 100 stars');
await p.locator('.hcell').nth(5*20+6).tap();ok(await ev("HOUSE.items.filter(i=>i.id==='hf-bed').length===2&&ECO.stars===289"),'a second bed costs 100 again');
await ev("$('hs-tabs').children[5].click()");await p.locator('.hcell').nth(6*20+2).tap();
ok(await ev("HOUSE.items.filter(i=>i.id==='hf-bed').length===1&&ECO.stars===389"),'ERASE removes a bed and refunds all 100');
await p.locator('.hcell').nth(6*20+12).tap();ok(await ev("!HOUSE.cells['12,0']&&ECO.stars===392"),'ERASE refunds a brick square (3)');
await ev("$('hs-tabs').children[1].click()");await card('Floor');await p.locator('.hcell').nth(2*20+3).tap();
ok(await ev("HOUSE.solids['3,4']==='floor'&&ECO.stars===390"),'FLOORS & STAIRS: a floor square costs 2');
// the land grows as you build
await ev("HS.ox=0;HS.oy=0;houseDraw()");const L0=await ev("houseLimits().x");await ev("$('hs-tabs').children[0].click();houseAct(30,0)");
ok(await ev("houseLimits().x")>L0,'building further out makes the land bigger ('+L0+' -> '+await ev("houseLimits().x")+')');
await ev("$('hs-right').click();$('hs-up').click()");ok(await ev("HS.ox===5&&HS.oy===3"),'the arrows move the view right and up');
await ev("$('hs-tabs').children[2].click()");await card('Bed');await p.locator('.hcell').nth(6*20+0).tap();
ok(await ev("HOUSE.items.some(i=>i.id==='hf-bed'&&i.x===5&&i.y===3)"),'placing while the view is moved uses the land position');
await ev("$('hs-tabs').children[4].click()");await card('Mint');await card('Mint');ok(await ev("HOUSE.bg==='hbg-mint'&&owns('hbg-mint')"),'a background is bought once and put up');
const sv=await ev("JSON.parse(localStorage.getItem('orangeArmy.v1'))");ok(sv.saveVersion===7&&sv.house.bg==='hbg-mint'&&sv.house.solids['3,4']==='floor','saved as version 7 with walls, floors and items');
await p.reload();await p.waitForTimeout(400);ok(await ev("HOUSE.bg==='hbg-mint'&&HOUSE.solids['3,4']==='floor'&&CHR.list[0].name==='RHETT'"),'the house survives a reload');
// a version 6 house (rows counted from the top) is turned over
ok(await ev("JSON.stringify(normHouse({flip7:1,bg:'hbg-paper',cells:{'1,6':'wood','2,0':'roof'},items:[{id:'hf-shelf',x:4,y:4}]}))")==='{"bg":"hbg-paper","cells":{"1,0":"wood","2,6":"roof"},"solids":{},"items":[{"id":"hf-shelf","x":4,"y":0}]}','a version 6 house is turned the right way up');
ok(await ev("JSON.stringify(normHouse({bg:'nope',cells:{'999,1':'wood','1,1':'lava','2,2':'brick'},solids:{'1,1':'trampoline','3,3':'stairR'},items:[{id:'hd-trophy',x:1,y:1},{id:'hf-shelf',x:500,y:-3}]}))")==='{"bg":"hbg-paper","cells":{"2,2":"brick"},"solids":{"3,3":"stairR"},"items":[{"id":"hf-shelf","x":238,"y":0}]}','bad squares, solids and locked items are dropped; positions kept on the land');
// walking around: floors and stairs are terrain
await ev(`Object.assign(HOUSE,{cells:{},items:[],solids:{'8,0':'stairR','9,1':'stairR','10,2':'stairR','11,3':'floor','12,3':'floor','13,3':'floor','14,3':'floor','15,3':'floor'}});titleOpenAll();$('b-house').click();$('b-hvisit').click()`);
ok(await ev("state==='play'&&MODE.id==='house'&&E.length===0&&TERRAIN.n===8"),'WALK AROUND: your house with its floors and stairs, no enemies');
const run=(keys,n)=>ev(`(()=>{for(const b of ACT)setA('kb',b,0,0);for(const k of '${keys}')setA('kb',k,1,0);let lo=1e9;for(let i=0;i<${n};i++){fr++;update();lo=Math.min(lo,PL[0].y)}return {x:Math.round(PL[0].x),y:Math.round(PL[0].y),gy:Math.round(PL[0].gy),lo:Math.round(lo)}})()`);
await ev("PL[0].x=300");let r1=await run('r',60);ok(r1.x>520&&r1.lo===345,'walking into the stairs from the floor passes through them '+JSON.stringify(r1));
await ev("PL[0].x=300;PL[0].vx=0");await run('',5);await run('rj',2);const r2=await run('r',40);ok(r2.gy<345,'jumping onto the stairs lands on them '+JSON.stringify(r2));
const r3=await run('r',60);ok(r3.y===345-135&&r3.x>520,'walking up the stairs onto the floor above '+JSON.stringify(r3));
const r4=await run('dj',2);const r5=await run('',40);ok(r5.y===345&&r5.gy===345,'Down + Jump drops through the floor '+JSON.stringify(r5));
await ev("PL[0].x=600");await run('',5);await run('j',2);await run('',14);await run('j',2);const r6=await run('',60);ok(r6.y===345-135,'jumping up through the floor from below (double jump) lands on top of it '+JSON.stringify(r6));
await p.screenshot({path:S+'/shots/m18-visit.png'});
await ev("for(const b of ACT)setA('kb',b,0,0);pause(true);$('b-quit').click()");ok(await p.isVisible('#s-house'),'quitting goes back to the house screen');
ok(await ev("selfTest().hash===SELFTEST_EXPECT.arcade"),'self-test unchanged');
// online: a guest visits the host's house
const srv=spawn('node',[__dirname+'/sigserver.js','9316']);await new Promise(r=>setTimeout(r,400));
const url=GAME+'?signal='+encodeURIComponent('ws://127.0.0.1:9316/peerjs?key=peerjs');
const mk=async n=>{const cx=await b.newContext();const q=await cx.newPage();q.on('pageerror',e=>errs.push(n+': '+e.message));await q.goto(url);await q.waitForTimeout(300);return q};
const H=await mk('host'),G=await mk('guest');
await H.evaluate(()=>{ECO.own.push('hf-tv');HOUSE.items=[{id:'hf-tv',x:5,y:0}];HOUSE.solids={'4,2':'floor'};HOUSE.bg='hbg-paper';titleOpenAll();$('b-online').click();$('on-host').click()});await H.waitForTimeout(3000);
const code=await H.evaluate(()=>NET.code);
await G.evaluate(code=>{titleOpenAll();$('b-online').click();const [w,n]=code.split('-');ONC.w=ROOM_WORDS.indexOf(w);ONC.a=+n[0];ONC.b=+n[1];renderOnline();$('on-join').click()},code);await G.waitForTimeout(3500);
await H.evaluate(()=>{NET.mode='house';netRoomChanged();$('on-start').click()});await H.waitForTimeout(1500);
ok(await G.evaluate(()=>state==='play'&&MODE.id==='house'&&HVIEW.items.some(i=>i.id==='hf-tv')&&TERRAIN.n===1),'the guest is in the host\'s house, floors included');
ok(await G.evaluate(()=>PL.length===2&&NET.match),'both fighters are there');
srv.kill();
ok(errs.length===0,'no errors '+errs.join(' | '));console.log(fails?fails+' FAILED':'ALL PASS');await b.close()})();
