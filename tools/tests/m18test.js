// House builder: Customize menu, walls cost stars per square, buying and placing furniture, backgrounds, the save
// (version 6, upgraded from version 5), walking around the house, and visiting the host's house online.
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
ok(await ev("Object.keys(HOUSE.cells).length===5&&ECO.stars===490"),'dragging paints 5 wood squares for 2 stars each ('+await ev('ECO.stars')+')');
await ev("$('hs-tabs').children[1].click()");const card=n=>ev(`[...$('hs-pal').children].find(b=>b.textContent.includes('${n}')).click()`);
await card('Bed');ok(await ev("!owns('hf-bed')&&ECO.stars===490"),'first tap on an item asks, nothing bought');
await card('Bed');ok(await ev("owns('hf-bed')&&ECO.stars===390"),'second tap buys it for 100 stars');
await p.locator('.hcell').nth(6*20+2).tap();ok(await ev("HOUSE.items.some(i=>i.id==='hf-bed'&&i.x===2&&i.y===6)"),'tapping a square places the bed there');
await card('Bookshelf');await card('Bookshelf');await p.locator('.hcell').nth(6*20+19).tap();
ok(await ev("HOUSE.items.some(i=>i.id==='hf-shelf'&&i.x===18&&i.y===4)"),'a tall item placed at the edge stays on the grid');
await ev("$('hs-tabs').children[4].click()");await p.locator('.hcell').nth(6*20+2).tap();
ok(await ev("!HOUSE.items.some(i=>i.id==='hf-bed')&&owns('hf-bed')"),'ERASE removes the bed (still owned)');
await p.locator('.hcell').nth(6*20+12).tap();ok(await ev("!HOUSE.cells['12,6']"),'ERASE removes a wall square');
await ev("$('hs-tabs').children[3].click()");await card('Mint');await card('Mint');ok(await ev("HOUSE.bg==='hbg-mint'"),'buying a background puts it up');
const sv=await ev("JSON.parse(localStorage.getItem('orangeArmy.v1'))");ok(sv.saveVersion===6&&sv.house.bg==='hbg-mint'&&sv.house.items.length===1&&Object.keys(sv.house.cells).length===4,'saved as version 6 with the house');
await p.reload();await p.waitForTimeout(400);ok(await ev("HOUSE.bg==='hbg-mint'&&HOUSE.items.length===1&&CHR.list[0].name==='RHETT'"),'the house survives a reload');
// tampered data is cleaned up, never trusted
ok(await ev("JSON.stringify(normHouse({bg:'nope',cells:{'99,1':'wood','1,1':'lava','2,2':'brick'},items:[{id:'hf-tv',x:1,y:1},{id:'hf-shelf',x:50,y:-3}]}))")==='{"bg":"hbg-paper","cells":{"2,2":"brick"},"items":[{"id":"hf-shelf","x":18,"y":0}]}','bad squares, unknown or unowned items are dropped; positions clamped');
await ev("titleOpenAll();$('b-house').click()");await p.screenshot({path:S+'/shots/m18-house.png'});
await ev("$('b-hvisit').click()");await p.waitForTimeout(300);ok(await ev("state==='play'&&MODE.id==='house'&&E.length===0"),'WALK AROUND: your fighter in your house, no enemies');
await p.keyboard.down('d');await p.waitForTimeout(500);await p.keyboard.up('d');ok(await ev("PL[0].x>200"),'you can walk around');
await p.screenshot({path:S+'/shots/m18-visit.png'});
await ev("pause(true);$('b-quit').click()");ok(await p.isVisible('#s-house'),'quitting goes back to the house screen');
ok(await ev("selfTest().hash===SELFTEST_EXPECT.arcade"),'self-test unchanged');
// online: a guest visits the host's house
const srv=spawn('node',[__dirname+'/sigserver.js','9316']);await new Promise(r=>setTimeout(r,400));
const url=GAME+'?signal='+encodeURIComponent('ws://127.0.0.1:9316/peerjs?key=peerjs');
const mk=async n=>{const cx=await b.newContext();const q=await cx.newPage();q.on('pageerror',e=>errs.push(n+': '+e.message));await q.goto(url);await q.waitForTimeout(300);return q};
const H=await mk('host'),G=await mk('guest');
await H.evaluate(()=>{ECO.own.push('hf-tv');HOUSE.items=[{id:'hf-tv',x:5,y:5}];HOUSE.bg='hbg-paper';titleOpenAll();$('b-online').click();$('on-host').click()});await H.waitForTimeout(3000);
const code=await H.evaluate(()=>NET.code);
await G.evaluate(code=>{titleOpenAll();$('b-online').click();const [w,n]=code.split('-');ONC.w=ROOM_WORDS.indexOf(w);ONC.a=+n[0];ONC.b=+n[1];renderOnline();$('on-join').click()},code);await G.waitForTimeout(3500);
await H.evaluate(()=>{NET.mode='house';netRoomChanged();$('on-start').click()});await H.waitForTimeout(1500);
ok(await G.evaluate(()=>state==='play'&&MODE.id==='house'&&HVIEW.items.some(i=>i.id==='hf-tv')&&!owns('hf-tv')),'the guest is in the host\'s house (seeing a TV the guest doesn\'t own)');
ok(await G.evaluate(()=>PL.length===2&&NET.match),'both fighters are there');
srv.kill();
ok(errs.length===0,'no errors '+errs.join(' | '));console.log(fails?fails+' FAILED':'ALL PASS');await b.close()})();
