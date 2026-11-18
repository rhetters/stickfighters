const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
const {chromium}=require('playwright');const S=process.argv[2];let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];const p=await b.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>errs.push(e.message));
await p.goto(GAME);await p.waitForTimeout(150);await p.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await p.waitForTimeout(300);await p.click('#b-train');await p.waitForTimeout(300);
const ev=x=>p.evaluate(x),W=ms=>p.waitForTimeout(ms);
await ev("Object.assign(TR,{god:0,passive:1,inf:0});E.forEach(e=>e.gone=1);E=[];PL[0].x=400;PL[0].face=1;PL[0].hp=100;PL[0].stm.v=100;PL[0].stm.winded=0");
await p.keyboard.down('Shift');await p.keyboard.down('s');await W(300);
ok(await ev("PL[0].blk===1&&PL[0].st==='free'"),'Down + Surge while standing still = block');
await p.screenshot({path:S+'/shots/cp-block-full.png'});
const v0=await ev("PL[0].stm.v");await W(1000);const v1=await ev("PL[0].stm.v");ok(v0-v1>6&&v0-v1<11,'holding block drains Surge slowly ('+(v0-v1).toFixed(1)+' per second)');
await ev("hurtP(PL[0],{dmg:6,kb:5},-1)");ok(await ev("PL[0].hp")===100&&await ev("PL[0].stm.v")<v1-11,'a hit from the front is blocked: no damage, costs Surge');
ok(await ev("PL[0].st==='free'&&PL[0].blk===1&&!PL[0].dizzy"),'no stun from a blocked hit, still blocking');
await ev("PL[0].stm.v=22");await W(200);await p.screenshot({path:S+'/shots/cp-block-weak.png'});
await ev("hurtP(PL[0],{dmg:6,kb:5},1)");ok(await ev("PL[0].hp")<100,'a hit from behind lands');
await ev("PL[0].hp=100;PL[0].inv=0;PL[0].st='free';PL[0].stm.v=20;PL[0].stm.winded=0");await W(500);
console.log(await ev("JSON.stringify({blk:PL[0].blk,st:PL[0].st,inv:PL[0].inv,v:PL[0].stm.v,w:PL[0].stm.winded,hp:PL[0].hp,face:PL[0].face,K:inputOf(PL[0]).K})"));await ev("hurtP(PL[0],{dmg:14,kb:13},-1)");console.log(await ev("JSON.stringify({blk:PL[0].blk,st:PL[0].st,v:PL[0].stm.v,w:PL[0].stm.winded,hp:PL[0].hp})"));ok(await ev("PL[0].hp")===100&&await ev("PL[0].stm.winded>0"),'the hit that empties Surge is still blocked, then you are Winded');
await W(100);ok(await ev("PL[0].blk")===0,'block drops when Surge runs out');
await ev("hurtP(PL[0],{dmg:6,kb:5},-1)");ok(await ev("PL[0].hp")<100&&await ev("PL[0].st")==='hurt','after that, hits land (normal hit, no dizzy)');
await p.keyboard.up('s');await p.keyboard.up('Shift');await W(1800);
// ground hits
await ev("PL[0].hp=100;PL[0].inv=0;PL[0].st='free';PL[0].stm.v=100;PL[0].stm.winded=0;E.forEach(e=>e.gone=1);E=[];spawnDummy('g');Object.assign(E[0],{x:PL[0].x+45,y:G,vx:0,st:'down',dt:70,otgU:1});PL[0].face=1");
const hp0=await ev("E[0].hp");await p.keyboard.press('j');await W(250);
const g1=await ev("({hp:E[0].hp,st:E[0].st,dt:E[0].dt})");ok(g1.hp<hp0&&g1.st==='down','a downed enemy can be hit (hp '+hp0+' to '+g1.hp+', still down)');
ok(hp0-g1.hp===3,'ground hits do half damage (jab 6 -> 3)');
ok(g1.dt<70-10,'the hit did not add down time (dt '+g1.dt+')');
await p.keyboard.press('k');await W(200);await p.keyboard.press('j');await W(200);
let up=false;for(let i=0;i<20&&!up;i++){await W(100);up=await ev("E[0].st!=='down'")}ok(up,'it gets up when its original knockdown runs out');
await p.screenshot({path:S+'/shots/cp-ground.png'});
// kill on the ground uses normal death
await ev("Object.assign(E[0],{st:'down',dt:60,hp:2,otgU:1});TR.mortal=1");await p.keyboard.press('k');await W(400);ok(await ev("E[0].dying===1"),'a finishing hit on a downed enemy kills it normally');
ok(errs.length===0,'no page errors '+errs.join('|'));await b.close();console.log(fails?fails+' FAILED':'ALL PASS')})();
