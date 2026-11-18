const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
const {chromium}=require('playwright');
const S=process.argv[2];let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const p=await b.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>errs.push(e.message));
await p.goto(GAME);await p.waitForTimeout(150);await p.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await p.click('#b-train');await p.waitForTimeout(300);
const ev=x=>p.evaluate(x),W=ms=>p.waitForTimeout(ms);
await p.check('#t-mortal');await ev("TR.mortal=1");
const one=async(x,hp=18)=>{await ev(`releaseAll();combo=0;P.x=${x-40};P.face=1;P.st='free';P.att=null;E.forEach(e=>e.gone=1);E=[];spawnDummy('g');Object.assign(E[0],{x:${x},y:G,vx:0,face:-1,hp:${hp}});`);await W(120)};
const waitPose=async()=>{for(let i=0;i<80;i++){await W(100);const r=await ev("E[0]&&E[0].rag&&E[0].rag.frozen?E[0].rag.pose:null");if(r)return r}return null};
// 1. death poses by cause
const cases=[
 ['light jab finishes a standing enemy','kneel',async()=>{await one(400,1);await p.keyboard.press('j')}],
 ['Flip Kick (launch) kill','back',async()=>{await one(400);await ev("hurtE(E[0],{dmg:99,kb:6,ef:'launch',w:'H'},1,P)")}],
 ['Leg Sweep (trip) kill','curl',async()=>{await one(400);await ev("hurtE(E[0],{dmg:99,kb:2,ef:'trip'},1,P)")}],
 ['Axe Kick (bounce) kill','plant',async()=>{await one(400);await ev("hurtE(E[0],{dmg:99,kb:2,ef:'bounce',w:'H'},1,P)")}],
 ['Meteor Kick kill','fold',async()=>{await one(400);await ev("hurtE(E[0],{dmg:99,kb:6,lift:-7,ef:'kd',fold:1},1,P)")}],
 ['knockdown kill mid-screen','sprawl',async()=>{await one(400);await ev("hurtE(E[0],{dmg:99,kb:5,ef:'kd',w:'H'},1,P)")}],
 ['splat kill into the wall','slump',async()=>{await one(800);await ev("hurtE(E[0],{dmg:99,kb:14,ef:'splat',w:'H'},1,P)")}],
 ['thrown into the wall','legsup',async()=>{await one(820);await ev("hurtE(E[0],{dmg:99,kb:14,ef:'kd',w:'H'},1,P)")}]];
for(const [name,want,act] of cases){await act();const got=await waitPose();ok(got===want,`${name} -> ${got}`);await p.screenshot({path:`${S}/shots/pose-${want}.png`})}
// 2. alive knockdown: ragdoll pinned to the body while flying/down, then hands back to animation on get-up
await ev("TR.mortal=0");await one(400,9999);await ev("hurtE(E[0],{dmg:5,kb:8,ef:'launch',w:'H'},1,P)");await W(260);
const fl=await ev("({rag:!!E[0].rag,st:E[0].st,pinDx:Math.abs(E[0].rag.p[3].x-E[0].x)})");ok(fl.rag&&fl.pinDx<1,'launched enemy tumbles as a ragdoll pinned to its body ('+fl.st+', mid offset '+fl.pinDx.toFixed(1)+' px)');
await p.screenshot({path:S+'/shots/alive-fly.png'});
let sawDown=false;for(let i=0;i<40;i++){await W(50);if(await ev("E[0].st==='down'&&!!E[0].rag")){sawDown=true;break}}ok(sawDown,'lands as a ragdoll on the floor');
await W(120);await p.screenshot({path:S+'/shots/alive-down-dazed.png'});
let back=false;for(let i=0;i<60;i++){await W(50);if(await ev("E[0].st==='free'&&!E[0].rag")){back=true;break}}ok(back,'gets up and the ragdoll fades back into animation');
// splat alive: pinned to wall
await one(800,9999);await ev("hurtE(E[0],{dmg:5,kb:14,ef:'splat',w:'H'},1,P)");let spl=false;for(let i=0;i<30;i++){await W(30);if(await ev("E[0].st==='splat'&&!!E[0].rag")){spl=true;break}}
ok(spl,'splat pins the ragdoll to the wall');await p.screenshot({path:S+'/shots/alive-splat.png'});await W(1500);
// pop lands on feet and returns to animation
await one(400,9999);await ev("hurtE(E[0],{dmg:5,kb:3,ef:'pop'},1,P)");await W(1200);ok(await ev("E[0].st")!=='down'&&!(await ev("!!E[0].rag")),'pop: brief limp ragdoll, lands on its feet');
// 3. cleanup: a settled body holds, then dissolves into confetti
await ev("TR.mortal=1");await one(400);await ev("hurtE(E[0],{dmg:99,kb:5,ef:'kd',w:'H'},1,P)");
let t0=Date.now(),dis=false;while(Date.now()-t0<9000){await W(100);if(await ev("E[0]&&E[0].rag&&E[0].rag.dis>8")){dis=true;break}}
const tDis=((Date.now()-t0)/1000).toFixed(1);await p.screenshot({path:S+'/shots/confetti.png'});
let gone=false;for(let i=0;i<30;i++){await W(100);if(await ev("E.length===0")){gone=true;break}}ok(dis&&gone,'body holds, then puffs into confetti and is removed (dissolve started after '+tDis+' s)');
// 4. body cap + 50 kills performance
await ev(`window.PERF=[];const _t=tick,_r=render;tick=function(){const a=performance.now();_t();PERF.push(['t',performance.now()-a])};render=function(){const a=performance.now();_r();PERF.push(['r',performance.now()-a])}`);
let maxBodies=0,kills=0;
for(let wv=0;wv<7;wv++){await ev("E.filter(e=>e.dying).length;for(let i=0;i<8;i++){spawnDummy(['g','r','b'][i%3])}E.filter(e=>!e.dying).forEach((e,i)=>{e.x=120+i*90;e.y=G})");await W(80);
 kills+=await ev("let n=0;for(const e of E.filter(e=>!e.dying)){hurtE(e,{dmg:999,kb:8+Math.random()*6,ef:['launch','kd','trip','bounce','splat'][Math.floor(Math.random()*5)],w:'H'},Math.random()<.5?1:-1,P);n++}n");
 for(let i=0;i<12;i++){await W(100);maxBodies=Math.max(maxBodies,await ev("E.filter(e=>e.corpse&&e.rag&&!e.rag.dis).length"))}}
await p.screenshot({path:S+'/shots/pileup.png'});
const perf=await ev("(()=>{const t=PERF.filter(x=>x[0]==='t').map(x=>x[1]),r=PERF.filter(x=>x[0]==='r').map(x=>x[1]);const av=a=>a.reduce((x,y)=>x+y,0)/a.length,mx=a=>Math.max(...a);return{tAvg:av(t),tMax:mx(t),rAvg:av(r),rMax:mx(r)}})()");
ok(kills>=50,kills+' kills in a row');ok(maxBodies<=12,'never more than 12 settled bodies on screen (peak '+maxBodies+')');
ok(perf.tAvg+perf.rAvg<6,`frame cost during the 50 kills: physics avg ${perf.tAvg.toFixed(2)} ms (max ${perf.tMax.toFixed(1)}), drawing avg ${perf.rAvg.toFixed(2)} ms (max ${perf.rMax.toFixed(1)}); 60 fps budget is 16.7 ms`);
// 5. player death ragdoll
await ev("tick=tick;openTitle();start()");await W(400);await ev("hurtP(P,{dmg:999,kb:13},1)");await W(400);
ok(await ev("P.st==='dead'&&!!P.rag"),'player death is a ragdoll too');await p.screenshot({path:S+'/shots/player-dead.png'});
let ko=false;for(let i=0;i<40;i++){await W(100);if(await p.isVisible('#s-over')){ko=true;break}}ok(ko,'KO screen still appears');
console.log(fails?fails+' FAILURES':'ALL M5 CHECKS OK','| errors:',errs.length?errs:'none');await b.close()})();
