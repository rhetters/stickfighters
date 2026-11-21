const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// Air moves: a Surge hop out of a double-jump flip stands you upright; Dive Kicks chain at most three times before a
// backflip (and none until you land); the Bicycle Kick (air K+K) hangs in the air and drives forward
const {chromium}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];const p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto(GAME);await p.waitForTimeout(300);const ev=x=>p.evaluate(x);
await ev("titleOpenAll()");await p.click('#b-train');await p.waitForTimeout(300);
// in the Training Room: one player with every move, frames stepped by hand
await ev(`(()=>{window.T_=()=>{releaseAll();const P=PL[0];P.bd=FULL_BUILD;P.hp=P.max=1e6;P.x=300;P.y=G;P.vx=P.vy=0;P.st='free';P.att=null;P.face=1;P.flip=0;P.pose[9]=0;P.stm.v=100;P.dvc=P.dvl=0;E.forEach(e=>e.gone=1);E=[]};
 window.step=n=>{for(let i=0;i<n;i++){fr++;update()}};window.tap=(k,n=2)=>{setA('kb',k,1);step(n);setA('kb',k,0);step(1)}})()`);
// 1. jump, jump (flip), then Surge + direction + jump while flipping
const fl=await ev(`(()=>{T_();const P=PL[0];tap('j');step(6);tap('j');step(6);const mid=P.pose[9];setA('kb','s',1);setA('kb','r',1);tap('j');setA('kb','s',0);setA('kb','r',0);step(40);return {mid,after:P.pose[9],st:P.st}})()`);
ok(fl.mid!==0&&fl.after===0,'a Surge hop out of a flip leaves you upright, not stuck tilted '+JSON.stringify(fl));
// 2. Dive Kicks on top of a big enemy
const dv=await ev(`(()=>{T_();const P=PL[0];spawnDummy('mc');const e=E[E.length-1];e.x=P.x+50;e.y=G;e.vx=0;e.face=-1;e.hp=e.max=1e6;let n=0,mx=0,moves=[];
 P.y=G-160;P.vy=0;
 for(let i=0;i<8;i++){setA('kb','d',1);tap('k');setA('kb','d',0);moves.push(P.att?P.att.d.n:'-');for(let j=0;j<40&&P.att;j++)step(1);if(P.dvc>n)n=P.dvc;step(2);if(P.dvl)mx=1;if(P.y>=P.gy-1)break}
 return {n,dvl:mx,moves}})()`);
ok(dv.n===3&&dv.dvl===1,'three Dive Kicks in a row at most, then a backflip away '+JSON.stringify(dv));
ok(dv.moves.slice(3).every(m=>m!=='dive'),'and no more Dive Kicks until you land');
ok(await ev(`(()=>{const P=PL[0];for(let i=0;i<200&&P.y<P.gy-1;i++)step(1);step(3);return P.dvl===0&&P.dvc===0})()`),'landing lets you Dive Kick again');
// 3. Bicycle Kick: air K then K
const bk=await ev(`(()=>{T_();const P=PL[0];P.y=G-200;P.vy=0;P.face=1;tap('k');step(3);tap('k');for(let i=0;i<30&&!(P.att&&P.att.d.n==='scissor');i++)step(1);const y0=P.y,x0=P.x,n0=P.att&&P.att.d.n;step(12);return {n0,drop:P.y-y0,dx:P.x-x0}})()`);
ok(bk.n0==='scissor'&&bk.drop<15&&bk.dx>40,'the Bicycle Kick hangs in the air and drives forward '+JSON.stringify(bk));
ok(errs.length===0,'no errors '+errs.join(' | '));console.log(fails?fails+' FAILED':'ALL PASS');await b.close()})();
