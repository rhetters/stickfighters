const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
const {chromium,devices}=require('playwright');
const S=process.argv[2],URL=GAME;let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto(URL);await p.evaluate("SET.tut=1");await p.waitForTimeout(150);await p.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await p.waitForTimeout(300);
const ev=x=>p.evaluate(x),W=ms=>p.waitForTimeout(ms);
await p.click('#b-solo');ok(await p.isVisible('#b-level')&&await p.isVisible('#b-start'),'SOLO opens STORY and ARCADE');
await p.evaluate(()=>startLevel('woods1'));await W(400); // the fixed Wooded Trail (CAMPAIGN now starts a generated run: m13test)
ok(await ev("state==='play'&&MODE===LEVEL&&LV.len===6900"),'Wooded Trail starts (6,900 px long, 6 chunks)');
await p.screenshot({path:S+'/shots/m8-start.png'});
await p.keyboard.down('d');await W(2500);await p.keyboard.up('d');await W(700);
const e1=await ev("({cam:Math.round(CAM.x),lock:LV.encs[0].lock,st:LV.encs[0].st,px:Math.round(PL[0].x),wl:WB.l,wr:WB.r})");
ok(e1.cam===e1.lock&&e1.st===1,'camera follows, then stops at the first fight and the ambush starts '+JSON.stringify(e1));
await W(1500);ok(await ev("E.filter(e=>!e.dying).length>0"),'enemies drop in');
await p.screenshot({path:S+'/shots/m8-ambush.png'});
await p.keyboard.down('d');await W(800);await p.keyboard.up('d');
ok(await ev("PL[0].x<=WB.r-24+0.01&&CAM.x===LV.encs[0].lock"),'during a fight you cannot leave the screen and the camera stays put');
await ev("LV.encs[0].q=[];E.forEach(e=>e.gone=1)");await W(300);
ok(await ev("LV.encs[0].st===2&&LV.cp===0&&LV.go>0"),'clearing the fight sets the checkpoint and shows GO');
await W(300);await p.screenshot({path:S+'/shots/m8-go.png'});
// jump to the fallen log fight
await ev("LV.encs[1].st=2;LV.cp=1;CAM.x=LV.encs[2].lock-200;levelWalls();PL[0].x=CAM.x+760;E=[]");await W(1200);
ok(await ev("LV.encs[2].st===1"),'third fight (with a Guard) starts at the fallen log stretch');
await ev("LV.encs[2].q=[];E.forEach(e=>e.gone=1)");await W(200);
await p.keyboard.down('d');await W(3500);await p.keyboard.up('d');
const g=await ev("({cam:Math.round(CAM.x),gx:LV.gates[0].x,wr:WB.r,px:Math.round(PL[0].x),hp:LV.gates[0].hp})");
ok(g.wr===g.gx-44&&g.px<=g.gx-68+0.5&&g.hp===40,'the fallen log blocks the trail '+JSON.stringify(g));
await ev("LV.gates[0].hp=20");await W(100);await p.screenshot({path:S+'/shots/m8-log.png'});
for(let i=0;i<14&&await ev("LV.gates[0].hp>0");i++){await p.keyboard.press(i%2?'k':'j');await W(330)}
ok(await ev("LV.gates[0].hp<=0"),'punching and kicking the log smashes it');
await p.keyboard.down('d');await W(1500);await p.keyboard.up('d');
ok(await ev("PL[0].x>LV.gates[0].x&&WB.r===CAM.x+W"),'after the log, the trail opens up again');
// KO -> continue from checkpoint
await ev("hurtP(PL[0],{dmg:999,kb:6,lift:-6},-1)");await W(3200);
ok(await p.isVisible('#s-over')&&await p.isVisible('#b-cont'),'a KO in the level offers CONTINUE FROM CHECKPOINT');
const sc=await ev("score");await p.click('#b-cont');await W(400);
ok(await ev("state==='play'&&PL[0].hp===PL[0].max&&CAM.x===LV.encs[LV.cp].lock&&LV.gates[0].hp<=0")&&await ev("score")===sc,'continue: full health, back at the last cleared fight, score kept, the log stays smashed');
// dusk grove
await ev("LV.encs.forEach((e,i)=>{if(i<4)e.st=2});LV.cp=3;CAM.x=LV.encs[4].lock-150;levelWalls();PL[0].x=CAM.x+760;E=[]");await W(2500);
await p.screenshot({path:S+'/shots/m8-grove.png'});
ok(await ev("LV.encs[4].st===1&&LV.encs[4].list.includes('c')"),'final fight in the grove includes the Captain');
// finish
await ev("LV.encs[4].st=2;LV.cp=4;E=[];CAM.x=LV.len-W-50;levelWalls();PL[0].x=CAM.x+500");await p.keyboard.down('d');await W(2500);await p.keyboard.up('d');
await p.waitForTimeout(2000);ok(await p.isVisible('#s-victory')&&/CLEAR!/.test(await p.textContent('#v-h1')),'walking through the arch at the end shows the victory screen');
await p.screenshot({path:S+'/shots/m8-clear.png'});
const sv=await ev("JSON.parse(localStorage.getItem('orangeArmy.v1'))"),SV=await ev("SAVE_VERSION");
ok(sv.saveVersion===SV&&sv.prog.woods1&&sv.prog.woods1.done===1,'progress saved with saveVersion 2 '+JSON.stringify(sv.prog));
await p.click('#v-title');await W(300);ok(await p.isVisible('#s-title'),'MENU goes back to the title menu');
// arcade still works
await p.evaluate('openSolo()');await p.click('#b-start');await p.evaluate("SHOWN==='s-themes'&&THS.kind==='stage'&&THS.go('?')");await W(1500);ok(await ev("MODE===ARCADE&&state==='play'&&CAM.x===0&&WB.r===W&&wave===1"),'Arcade still plays on one screen');
await p.screenshot({path:S+'/shots/m8-arcade.png'});
// migration from an old (v1) save
await ev("localStorage.setItem('orangeArmy.v1',JSON.stringify({set:{vol:0.4,surge:'toggle'},best:{score:4321,wave:7,combo:22}}))");await p.reload();await p.waitForTimeout(150);await p.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await W(400);
ok(await ev("SET.vol===0.4&&SET.surge==='toggle'&&BEST.score===4321&&JSON.stringify(PROG)==='{}'"),'an old v1 save loads with settings and best score intact');
await ev("save()");ok(await ev("JSON.parse(localStorage.getItem('orangeArmy.v1')).saveVersion===SAVE_VERSION"),'and is written back at the current version');
await c.close();
// iPad
const c2=await b.newContext({...devices['iPad (gen 7) landscape']});const q=await c2.newPage();q.on('pageerror',e=>errs.push(e.message));
await q.goto(URL);await q.evaluate("SET.tut=1");await q.waitForTimeout(150);await q.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await q.waitForTimeout(300);await q.evaluate('openSolo()');await q.tap('#b-level');await q.waitForTimeout(300);await q.tap('.thcard');await q.waitForTimeout(500);
await q.evaluate("CAM.x=1500;PL[0].x=1900");await q.waitForTimeout(800);await q.screenshot({path:S+'/shots/m8-ipad.png'});
ok(await q.evaluate("MODE===LEVEL"),'level runs on iPad');
ok(errs.length===0,'no page errors '+errs.slice(0,3).join(' | '));
await b.close();console.log(fails?fails+' FAILED':'ALL PASS')})();
