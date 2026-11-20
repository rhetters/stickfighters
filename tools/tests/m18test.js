// House builder: Customize menu, everything costs stars per piece and erasing refunds it, floors and stairs, the land
// growing, the save (version 7, upgraded from 5 and 6), floors and stairs as terrain when walking around, walking around the house, and visiting the host's house online.
const GAME='file://'+require('path').resolve(__dirname,'../../index.html');
const {chromium,devices}=require('playwright');const {spawn}=require('child_process');const S=process.argv[2]||'.';let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext(devices['iPad (gen 7) landscape']);
// a version 5 save with a fighter and stars, from before houses existed
// the old save is written once, then the page reloads to pick it up (nothing rewrites it on later reloads)

const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(GAME);await p.waitForTimeout(300);await p.evaluate(()=>{localStorage.setItem('orangeArmy.v1',JSON.stringify({saveVersion:5,set:{},best:{score:5,wave:2,combo:3},prog:{},eco:{stars:500,got:500,own:[],seen:[]},chr:{cur:0,list:[{name:'RHETT',col:'col-orange'},null,null,null]}}));});await p.waitForTimeout(300);await p.reload();await p.waitForFunction(()=>typeof openHouse==='function');await p.waitForTimeout(400);
const ev=x=>p.evaluate(x);
ok(await ev("HOUSE.bg==='hbg-paper'&&ECO.stars===500&&CHR.list[0].name==='RHETT'"),'a version 5 save loads: stars and fighter kept, empty house');
await ev("titleReveal()");
const orange=()=>ev("[...document.querySelectorAll('#s-title .btn')].filter(b=>b.offsetParent&&getComputedStyle(b).backgroundColor==='rgb(255, 122, 0)').map(b=>b.id)");
ok((await orange()).length===0,'no menu button is lit up on its own '+JSON.stringify(await orange()));
await ev("navMove('d')");const lit=await orange();ok(lit.length===1&&lit[0]===await ev('document.activeElement.id'),'moving with a controller lights up just the chosen button '+JSON.stringify(lit));
await p.mouse.click(5,5);ok((await orange()).length===0,'touching the screen turns the highlight off');
await ev("titleReveal()");await ev("$('b-cust').click()");
ok(await ev("!$('custrow').hidden&&$('b-char').offsetParent&&$('b-house').offsetParent"),'CUSTOMIZE opens CHARACTER | HOUSE');
await ev("$('b-house').click()");ok(await p.isVisible('#s-house'),'HOUSE opens the house screen');
const box=await p.locator('#hs-cells').boundingBox();const cw=box.width/20,ch=box.height/6;
await p.mouse.move(box.x+cw*12.5,box.y+ch*5.5);await p.mouse.down();for(let i=12;i<17;i++)await p.mouse.move(box.x+cw*(i+.5),box.y+ch*5.5,{steps:2});await p.mouse.up();
ok(await ev("Object.keys(HOUSE.cells).length===5&&HOUSE.cells['12,0']==='wood'&&ECO.stars===490"),'dragging paints 5 wood squares on the bottom row for 2 stars each ('+await ev('ECO.stars')+')');
const card=n=>ev(`[...$('hs-pal').children].find(b=>b.textContent.includes('${n}')).click()`);
await ev("$('hs-tabs').children[0].click()");await card('Brick');await p.locator('.hcell').nth(5*20+12).tap();
ok(await ev("HOUSE.cells['12,0']==='brick'&&ECO.stars===489"),'painting brick over wood refunds the wood (2) and charges brick (3)');
await ev("$('hs-tabs').children[2].click()");await card('Bed');ok(await ev("HS.item==='hf-bed'&&ECO.stars===489"),'picking an item costs nothing yet');
await p.locator('.hcell').nth(5*20+2).tap();ok(await ev("HOUSE.items.some(i=>i.id==='hf-bed'&&i.x===2&&i.y===0)&&ECO.stars===389"),'placing a bed costs 100 stars');
await p.locator('.hcell').nth(4*20+6).tap();ok(await ev("HOUSE.items.filter(i=>i.id==='hf-bed').length===2&&ECO.stars===289"),'a second bed costs 100 again');
await ev("$('hs-tabs').children[5].click()");await p.locator('.hcell').nth(5*20+2).tap();
ok(await ev("HOUSE.items.filter(i=>i.id==='hf-bed').length===1&&ECO.stars===389"),'ERASE removes a bed and refunds all 100');
await p.locator('.hcell').nth(5*20+12).tap();ok(await ev("!HOUSE.cells['12,0']&&ECO.stars===392"),'ERASE refunds a brick square (3)');
await ev("$('hs-tabs').children[1].click()");await card('Floor');await p.locator('.hcell').nth(1*20+3).tap();
ok(await ev("HOUSE.floors['3,4']==='floor'&&ECO.stars===390"),'BARRIERS: a floor square costs 2');
// the land grows as you build
await ev("HS.ox=0;HS.oy=0;houseDraw()");const L0=await ev("houseLimits().x");await ev("$('hs-tabs').children[0].click();houseAct(30,0)");
ok(await ev("houseLimits().x")>L0,'building further out makes the land bigger ('+L0+' -> '+await ev("houseLimits().x")+')');
await ev("$('hs-right').click();$('hs-up').click()");ok(await ev("HS.ox===5&&HS.oy===3"),'the arrows move the view right and up');
await ev("$('hs-tabs').children[2].click()");await card('Bed');await p.locator('.hcell').nth(5*20+0).tap();
ok(await ev("HOUSE.items.some(i=>i.id==='hf-bed'&&i.x===5&&i.y===3)"),'placing while the view is moved uses the land position');
await ev("$('hs-tabs').children[4].click()");await card('Mint');await card('Mint');ok(await ev("HOUSE.bg==='hbg-mint'&&owns('hbg-mint')"),'a background is bought once and put up');
const sv=await ev("JSON.parse(localStorage.getItem('orangeArmy.v1'))");ok(sv.saveVersion===10&&sv.house.bg==='hbg-mint'&&sv.house.floors['3,4']==='floor','saved as version 10 with walls, barriers and items');
await p.waitForTimeout(600);await p.reload();await p.waitForFunction(()=>typeof openHouse==='function'&&typeof loop==='function');await p.waitForTimeout(400);ok(await ev("HOUSE.bg==='hbg-mint'&&HOUSE.floors['3,4']==='floor'&&CHR.list[0].name==='RHETT'"),'the house survives a reload '+await ev("JSON.stringify({bg:HOUSE.bg,s:HOUSE.floors,raw:(localStorage.getItem('orangeArmy.v1')||'').slice(0,160)})"));
// a version 6 house (rows counted from the top) is turned over
ok(await ev("JSON.stringify(normHouse({flip7:1,bg:'hbg-paper',cells:{'1,6':'wood','2,0':'roof'},items:[{id:'hf-shelf',x:4,y:4}]}))")==='{"bg":"hbg-paper","cells":{"1,0":"wood","2,6":"roof"},"solids":{},"floors":{},"fills":{},"climbs":{},"sides":{},"items":[{"id":"hf-shelf","x":4,"y":0}]}','a version 6 house is turned the right way up');
ok(await ev("JSON.stringify(normHouse({bg:'nope',cells:{'999,1':'wood','1,1':'lava','2,2':'brick'},solids:{'1,1':'trampoline','3,3':'stairR'},items:[{id:'hd-trophy',x:1,y:1},{id:'hf-shelf',x:500,y:-3}]}))")==='{"bg":"hbg-paper","cells":{"2,2":"brick"},"solids":{"3,3":"stairR"},"floors":{},"fills":{},"climbs":{},"sides":{},"items":[{"id":"hf-shelf","x":238,"y":0}]}','bad squares, solids and locked items are dropped; positions kept on the land');
// barriers and layering: wood wall, then stairs, then stone fills just the steps; erase goes stone, stairs, wood
await ev(`titleOpenAll();$('b-house').click();HS.ox=0;HS.oy=0;HS.zi=0;houseCells();houseDraw();HS.tab='walls';HS.tile='wood';houseAct(2,2);HS.tab='solids';HS.solid='stairR';houseAct(2,2);HS.tab='walls';HS.tile='stone';houseAct(2,2)`);
ok(await ev("HOUSE.cells['2,2']==='wood'&&HOUSE.solids['2,2']==='stairR'&&HOUSE.fills['2,2']==='stone'"),'a wall on stairs fills just the steps; the wall behind stays');
const st0=await ev('ECO.stars');await ev("HS.tab='erase';houseAct(2,2)");ok(await ev("!HOUSE.fills['2,2']&&HOUSE.solids['2,2']==='stairR'&&ECO.stars==="+(st0+3)),'erase takes the stone fill first (refund 3)');
await ev("houseAct(2,2)");ok(await ev("!HOUSE.solids['2,2']&&HOUSE.cells['2,2']==='wood'"),'then the stairs');
await ev("houseAct(2,2)");ok(await ev("!HOUSE.cells['2,2']"),'then the wood wall');
await ev("HS.tab='solids';HS.solid='side';houseAct(4,1);HS.solid='floor';houseAct(4,1)");ok(await ev("HOUSE.sides['4,1']==='side'&&HOUSE.floors['4,1']==='floor'"),'a square can hold a floor and a side wall');
await ev("HS.tab='erase';houseAct(4,1);houseAct(4,1)");ok(await ev("!HOUSE.sides['4,1']&&!HOUSE.floors['4,1']"),'erase takes the side wall, then the floor');
await ev("HS.tab='solids';HS.solid='stairR';houseAct(14,5);HS.solid='floor';houseAct(14,5)");ok(await ev("HOUSE.solids['14,5']==='stairR'&&HOUSE.floors['14,5']==='floor'"),'a floor and stairs can share a square');
await ev("HS.tab='erase';houseAct(14,5);houseAct(14,5)");ok(await ev("!HOUSE.solids['14,5']&&!HOUSE.floors['14,5']"),'erase takes the floor, then the stairs');
ok(await ev("$('hs-tabs').children[1].textContent==='BARRIERS'&&[...$('hs-pal').children].length>=0"),'the tab is called BARRIERS');
ok(await ev("getComputedStyle($('hs-cv')).position==='absolute'&&$('hs-cv').getBoundingClientRect().width>=$('s-house').getBoundingClientRect().width-2"),'the house fills the whole frame');
await ev("$('b-houseback').click();$('b-char').click()");ok(await ev("getComputedStyle(document.querySelector('.hsdpad')).display!=='none'?!document.querySelector('.hsdpad').offsetParent:true"),'the house buttons are gone on other screens');
await ev("$('b-charback').click();$('b-house').click()");
// Esc while walking around goes straight back to the builder
await ev("$('b-hvisit').click()");await p.waitForTimeout(200);await p.keyboard.press('Escape');await p.waitForTimeout(200);
ok(await ev("!$('s-house').hidden&&!paused&&state!=='play'"),'Esc in WALK AROUND returns to the house builder (no pause menu)');
// walking around: floors and stairs are terrain
await ev(`Object.assign(HOUSE,{cells:{},items:[],solids:{'8,0':'stairR','9,1':'stairR','10,2':'stairR','10,3':'stairL','9,4':'stairL','8,5':'stairL','11,3':'floor','12,3':'floor','13,3':'floor','14,3':'floor','15,3':'floor','21,4':'floor','23,4':'floor','24,4':'floor'},floors:{},sides:{'19,0':'side','19,1':'side'},fills:{},climbs:{'22,0':'ladder','22,1':'ladder','22,2':'spiral','22,3':'spiral'}});titleOpenAll();$('b-house').click();$('b-hvisit').click()`);
ok(await ev("state==='play'&&MODE.id==='house'&&E.length===0&&TERRAIN.n===20"),'WALK AROUND: your house with its floors and stairs, no enemies');
const run=(keys,n)=>ev(`(()=>{for(const b of ACT)setA('kb',b,0,0);for(const k of '${keys}')setA('kb',k,1,0);let lo=1e9;for(let i=0;i<${n};i++){fr++;update();lo=Math.min(lo,PL[0].y)}return {x:Math.round(PL[0].x),y:Math.round(PL[0].y),gy:Math.round(PL[0].gy),lo:Math.round(lo)}})()`);
await ev("PL[0].x=300");let r1=await run('r',60);
await ev("PL[0].x=300;PL[0].vx=0");await run('',10);const u1=await run('ru',50);ok(u1.gy<345,'holding Up while walking into stairs steps onto them '+JSON.stringify(u1));
const u2=await run('r',12);ok(u2.y===345-135,'and walks up them onto the floor '+JSON.stringify(u2));
await run('',20);await run('e',20);await run('',30);ok(await ev("!!PL[0].emote&&lookPose(PL[0])!==PL[0].pose&&PL[0].y===345-135"),'a pose shows while standing on an upper floor');
await run('dj',2);await run('',40);ok(r1.x>520&&r1.lo===345,'walking into the stairs from the floor passes through them '+JSON.stringify(r1));
await ev("PL[0].x=300;PL[0].vx=0");await run('',5);await run('rj',2);const r2=await run('r',40);ok(r2.gy<345,'jumping onto the stairs lands on them '+JSON.stringify(r2));
const r3=await run('r',60);ok(r3.y===345-135&&r3.x>520,'walking up the stairs onto the floor above '+JSON.stringify(r3));
const r4=await run('dj',2);const r5=await run('',40);ok(r5.y===345&&r5.gy===345,'Down + Jump drops through the floor '+JSON.stringify(r5));
await ev("PL[0].x=600");await run('',5);await run('j',2);await run('',14);await run('j',2);const r6=await run('',60);ok(r6.y===345-135,'jumping up through the floor from below (double jump) lands on top of it '+JSON.stringify(r6));
await p.screenshot({path:S+'/shots/m18-visit.png'});
// stairs: walking you stay on your level; Up takes stairs going up the way you walk, Down takes stairs going down
await run('',60);await ev("PL[0].x=300;PL[0].y=PL[0].gy=345;PL[0].vx=0");await run('',5);const sw0=await run('r',70);ok(sw0.lo===345&&sw0.x>495,'walking along the ground past stairs, without Up, you stay on the ground '+JSON.stringify(sw0));
await ev("PL[0].x=300;PL[0].vx=0");await run('',5);const sw1=await run('ru',50);const sw2=await run('r',20);ok(sw1.gy<345&&sw2.y===210,'holding Up while walking into stairs takes them up, then you walk on along the floor '+JSON.stringify([sw1,sw2]));
await run('',20);await ev("PL[0].x=600;PL[0].vx=0");await run('',5);const sw3=await run('ld',70);ok(sw3.y===345,'walking back holding Down takes the stairs down to the ground '+JSON.stringify(sw3));
await run('',20);await ev("PL[0].x=600;PL[0].y=PL[0].gy=210;PL[0].vx=0");await run('',5);const sw4=await run('lu',55);ok(sw4.y<210-20&&sw4.x<495,'walking back holding Up takes the other stairs, the ones going up that way '+JSON.stringify(sw4));
await run('',20);await ev("PL[0].x=500;PL[0].y=PL[0].gy=210;PL[0].vx=0;PL[0].face=-1");await run('',5);const sw5=await run('u',30);ok(sw5.y<210-20&&sw5.x<495,'Up alone where two staircases meet goes up the one going up (not back along the floor) '+JSON.stringify(sw5));
await run('',20);await ev("PL[0].x=500;PL[0].y=PL[0].gy=210;PL[0].vx=0");await run('',5);const sw6=await run('l',60);ok(sw6.lo>=210&&sw6.y===345,'walking off the end without Up or Down: no climbing, you go down '+JSON.stringify(sw6));
// ladder and spiral stairs: climbed straight up and down
await ev("PL[0].x=22*45+22;PL[0].y=PL[0].gy=345;PL[0].vx=0");await run('',5);const l1=await run('u',80);ok(l1.y===345-180&&Math.abs(l1.x-(22*45+22))<3,'holding Up climbs the ladder and spiral stairs to the top '+JSON.stringify(l1));
const l2=await run('',30);ok(l2.y===345-180,'letting go holds you on the ladder '+JSON.stringify(l2));
const l3=await run('r',30);ok(l3.y===345-180&&l3.x>22*45+45,'walking off the top onto the floor '+JSON.stringify(l3));
await run('',10);await ev("PL[0].x=22*45+22");await run('',5);const l4=await run('d',80);ok(l4.y===345,'holding Down climbs back down '+JSON.stringify(l4));
await run('u',20);const l5=await run('j',2);const l6=await run('',60);ok(l6.y===345&&true,'jumping gets you off the ladder '+JSON.stringify(l6));
await run('',60);await ev("PL[0].x=780;PL[0].y=PL[0].gy=345");const w1=await run('r',60);ok(w1.x===20*45-14,'a side wall stops you walking through it '+JSON.stringify(w1));
await ev("for(const b of ACT)setA('kb',b,0,0);pause(true);$('b-quit').click()");ok(await p.isVisible('#s-house'),'quitting goes back to the house screen');
// editor zoom
await ev("HS.zi=0;HS.ox=0;HS.oy=0;titleOpenAll();$('b-house').click();$('hs-zout').click()");
ok(await ev("$('hs-cells').children.length===40*12&&HS.zi===1"),'zoom out shows 40 x 12 squares');
await ev("$('hs-zout').click()");ok(await ev("$('hs-cells').children.length===60*18&&$('hs-zout').disabled"),'zoom out again: 60 x 18, the farthest');
await ev("$('hs-tabs').children[1].click()");await p.locator('.hcell').nth(17*60+30).tap();
ok(await ev("HOUSE.floors['30,0']==='floor'"),'tapping while zoomed out builds on the right square');
await p.screenshot({path:S+'/shots/m18-zoom.png'});
await ev("$('hs-zin').click();$('hs-zin').click()");ok(await ev("$('hs-cells').children.length===20*6"),'zoom back in');
// two players far apart: the camera zooms out to keep both on screen
await ev(`ROSTER=[{slot:0,dev:'kb',col:'#ff7a00',d2:'#d85f00',name:'A'},{slot:1,dev:'kb2',col:'#3ec5ff',d2:'#1d86c4',name:'B'}];HOUSE.solids={...HOUSE.solids,'150,30':'floor'};startHouse({...normHouse(HOUSE)});PL[0].x=100;PL[1].x=150*45+20;PL[1].y=PL[1].gy=345-30*45;for(let i=0;i<120;i++)render()`);
const cam=await ev("({z:CAM.z,x:CAM.x,y:CAM.y})");
const fits=await ev("PL.every(p=>{const sx=(p.x-CAM.x)*CAM.z,sy=345+(p.y-345-CAM.y)*CAM.z;return sx>0&&sx<900&&sy>0&&sy<=420})");
ok(cam.z<0.2&&fits,'players at both ends and up high are both on screen (zoom '+cam.z.toFixed(2)+')');
await p.screenshot({path:S+'/shots/m18-far.png'});
await ev("PL[1].x=PL[0].x+80;PL[1].y=PL[1].gy=345;for(let i=0;i<150;i++)render()");ok(await ev("CAM.z>0.95"),'together again: back to normal size');
await ev("ROSTER=[]");
ok(await ev("(()=>{const o={},o2={};drawFig(0,345,1,STANCES[0].p,1,'#f00','#f00',0,1,7,o,1);drawFig(0,345,1,STANCES[0].p,1,'#f00','#f00',0,1,10,o2,1);return limbK({...o,s:1})===1&&limbK({...o2,s:1})>1.4&&Math.abs(itemR({...o,s:1})-(o.hr+o.hw/2-1.1))<0.01})()"),'gloves and shoes grow with thicker limbs; head items reach the head\'s outer edge');
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
await H.evaluate(()=>{pause(true);$('b-quit').click()});await H.waitForTimeout(800);
await H.evaluate(()=>{NET.mode='vs';netRoomChanged();$('on-teams').click()});await H.waitForTimeout(500);
ok(await G.evaluate(()=>NET.teams&&!$('on-teams').hidden&&document.querySelectorAll('#on-cards .pteam').length===2),'online Versus: the host turns on teams and everyone sees team buttons');
ok(await H.evaluate(()=>{const e=$('s-online');return e.scrollHeight<=e.clientHeight+1&&document.documentElement.scrollHeight<=innerHeight+1}),'the online room fits without a scroll bar in Versus with teams');
ok(await H.evaluate(()=>$('on-start').disabled===false),'one player on each team: ready to start');
await G.evaluate(()=>netSetTeam(NET.mySlot));await G.waitForTimeout(500);ok(await H.evaluate(()=>NET.players.every(p=>!p.team)&&$('on-start').disabled),'a guest can switch their own team; both on one team cannot start');
await G.evaluate(()=>netSetTeam(NET.mySlot));await G.waitForTimeout(500);await H.evaluate(()=>$('on-start').click());await H.waitForTimeout(1500);
ok(await G.evaluate(()=>MODE===VERSUS&&VS.teams&&new Set(PL.map(p=>p.team)).size===2),'the match starts as teams on every device');
srv.kill();
ok(errs.length===0,'no errors '+errs.join(' | '));console.log(fails?fails+' FAILED':'ALL PASS');await b.close()})();
