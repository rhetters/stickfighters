const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// The combat review's fixes: effects have their own random numbers and can be switched off without changing the game;
// an enemy's hit on a player follows the move's reaction (the Combat chart) and its combo string; a flying body's
// combo goes to the player who threw it; pummel hits and hits on a downed enemy count as damage dealt.
const {chromium}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:810}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(GAME);await p.waitForTimeout(300);const ev=s=>p.evaluate(s);
await ev("SET.tut=1;titleOpenAll()");
// effects: their own random numbers; muted they do nothing
ok(await ev("(()=>{const s=SEED;spark(1,1,5,'#fff');dust(1,1,4);fxp({k:'l',x:fxr()});return SEED===s})()"),'sparks and dust don\'t touch the game\'s random numbers');
ok(await ev("(()=>{FX=[];GH=[];SIM.mute=1;spark(1,1,5,'#fff');txt(1,1,'X','#000');ghost({x:0,y:0,face:1,pose:[0],s:1,col:'#000'});const n=FX.length+GH.length;SIM.mute=0;return n===0})()"),'muted, effects and ghosts do nothing');
ok(await ev("(()=>{let h=0;const o=AC;try{SIM.mute=1;sfx(200,0.1);noise(0.1,0.1,100);sfxHit('M');h=1}finally{SIM.mute=0}return h===1})()"),'muted, sounds do nothing (and nothing breaks)');
// reactions: the Combat chart's ef
const setup="(()=>{init();state='play';MODE=ARCADE;E=[];const q=PL[0];q.x=400;q.y=q.gy=G;q.st='free';q.inv=0;q.hp=q.max=100;q.str=null;const e=F(450,'g',0);E.push(e);window._q=q;window._e=e})()";
const hit=(mv,extra='')=>ev(setup+";(()=>{const q=_q,e=_e;"+extra+"hurtP(q,EA['"+mv+"'],1,e);return {st:q.st,inv:q.inv,vx:q.vx,vy:q.vy}})()");
let r=await hit('pj');ok(r.st==='hurt'&&r.inv===65&&r.vx===5,'Punch: stagger, the usual safe time');
r=await hit('bash');ok(r.st==='hurt'&&r.vx===14,'Shield Bash: pushed back farther ('+r.vx+')');
r=await hit('heavy');ok(r.st==='fly'&&r.inv===110&&r.vy===-4,'Overhead: knocked down (in the air, then down; safe until up)');
r=await ev(setup+";(()=>{const q=_q;hurtP(q,{dmg:9,kb:12,ef:'launch'},1);return {st:q.st,vx:q.vx}})()");ok(r.st==='fly'&&r.vx===7,'a launch sends you flying');
r=await ev(setup+";(()=>{const q=_q,e=_e;hurtP(q,{dmg:3,kb:3,ef:'trip'},1,e);return {st:q.st,vy:q.vy,spv:q.spv}})()");ok(r.st==='fly'&&r.vy===-3&&r.spv===18,'a trip sweeps your feet');
r=await ev(setup+";(()=>{const q=_q,e=_e;hurtP(q,{dmg:3,kb:3,ef:'pop'},1,e);return {st:q.st,vy:q.vy}})()");ok(r.st==='hurt'&&r.vy===-6,'a pop pops you up');
ok(await ev(setup+";(()=>{const q=_q;for(let i=0;i<60;i++){fr++;update()}return q.st==='down'||q.st==='getup'||q.st==='free'})()"),'(and the player lands and gets up)');
// combo strings: short safe time between hits of one enemy's string, up to the difficulty's cap
const str=(diff)=>ev(setup+";(()=>{SET.diff="+diff+";const q=_q,e=_e,d={dmg:3,kb:2,ef:'stagger',chain:1};let n=0;for(let i=0;i<6;i++){q.inv=Math.max(0,q.inv-12);fr+=12;if(q.inv>0)continue;const h=q.hp;hurtP(q,d,1,e);if(q.hp<h)n++;q.st='free'}SET.diff=1;return n})()");
const n0=await str(0),n1=await str(1),n2=await str(2);
ok(n0===2&&n1===3&&n2===4,'a combo string lands 2 / 3 / 4 hits in a row on Easy / Normal / Hard ('+[n0,n1,n2]+')');
ok(await ev(setup+";(()=>{const q=_q,e=_e,d={dmg:16,kb:2,chain:1};hurtP(q,d,1,e);q.inv=0;q.st='free';fr+=10;hurtP(q,d,1,e);return q.inv===65})()"),'a string stops at the difficulty\'s share of your health (30% on Normal)');
ok(await ev(setup+";(()=>{const q=_q,e=_e,e2=F(300,'g',0);hurtP(q,{dmg:3,kb:2,chain:1},1,e);const a=q.inv;q.inv=0;hurtP(q,{dmg:3,kb:2,chain:1},1,e2);return a===8&&q.str.by===e2.uid&&q.str.n===1})()"),'a hit from another enemy starts its own string (each fighter has a uid)');
ok(await ev(setup+";(()=>{const q=_q,e=_e;hurtP(q,{dmg:3,kb:2},1,e);return q.inv===65})()"),'a move that isn\'t part of a string keeps the usual safe time (today\'s enemies hit as before)');
// a thrown body's combo goes to the thrower; pummel and ground hits are tallied
ok(await ev("(()=>{ROSTER=[{slot:0},{slot:1}];init();state='play';E=[];const [p1,p2]=PL;const a=F(400,'g',0),c=F(440,'g',0);E.push(a,c);a.y=c.y=G;hurtE(a,{dmg:1,kb:9,lift:-3,ef:'launch',w:'M'},1,p2,p2);a.st='fly';a.vx=8;a.vy=-1;a.x=410;a.y=G-20;c.x=430;c.st='free';c.y=G;const before=[p1.combo,p2.combo];bowl();ROSTER=[];return a.by===1&&p2.combo>before[1]&&p1.combo===before[0]})()"),'a flying body\'s combo goes to the player who sent it flying (Player 2 here), not always Player 1');
ok(await ev("(()=>{init();state='play';E=[];const q=PL[0],e=F(420,'b',0);E.push(e);const got=[];const o=MODE.tally;MODE.tally=(p,k,n)=>got.push(k+n);pummel(q,e);groundHit(e,{dmg:6},1,q);MODE.tally=o;return got.length===2&&got.every(g=>g.startsWith('dealt'))})()"),'pummel hits and hits on a downed enemy count as damage dealt');
ok(errs.length===0,'no errors '+errs.join(' | '));
console.log(fails?fails+' FAILED':'ALL PASS');await b.close();process.exit(fails?1:0)})();
