const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M15: the Volcano theme: steam vents, falling lava rocks, rock ledges the army follows you up and down, lava pools,
// the jump into the crater, the Pink Tiki and his last stand (the lava escape)
const {chromium,devices}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext(devices['iPad (gen 7) landscape']);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(GAME);await p.waitForTimeout(300);
const ev=x=>p.evaluate(x);
// the generator
ok(await ev("JSON.stringify(genRun('volcano',42))===JSON.stringify(genRun('volcano',42))"),'the same seed always makes the same volcano run');
ok(await ev("(()=>{const L=genRun('volcano',5),b=L.encs[L.encs.length-1];return L.segs.map(s=>s.b).join()==='jungle,ashslope,crater'&&b.boss==='K'&&b.intro==='erupt'&&!!b.esc&&b.esc.s.length===9&&L.haz.vents.length>=5&&L.haz.pools.length>=1&&!!L.ramps})()"),'Volcano: jungle, ashy slopes, crater; the Pink Tiki bursts out of the lava, with a lava escape; vents, pools and a climb');
const vk=await ev("(()=>{const o={};for(let s=1;s<200;s++){const T=genRun('volcano',s).trans;o[T[0].k]=(o[T[0].k]||0)+1;if(T[1].k!=='rim')o.bad=1}return o})()");
ok(vk.geyser>20&&vk.rope>20&&vk.balloon>20&&!vk.bad&&!vk.rim,'into the slopes: the geyser, the rope or the balloon; into the crater always the jump from the rim '+JSON.stringify(vk));
ok(await ev("(()=>{for(const id of ['castle','pirate','mountain','space'])for(let s=1;s<40;s++){const L=genRun(id,s);if(L.haz||L.encs.some(e=>e.esc))return false}return true})()"),'the other themes have no volcano hazards');
ok(await ev("(()=>{for(let s=1;s<60;s++){const L=genRun('volcano',s),cr=L.segs[2];for(const e of L.encs.filter(e=>e.x>cr.x0&&!e.boss))if(L.terr.s.filter(q=>q.x1>=e.lock&&q.x2<=e.lock+W).length<3)return false;for(const q of L.haz.pools)if(L.encs.some(e=>q.x1>e.lock&&q.x0<e.lock+W))return false}return true})()"),'every crater fight has rock ledges; no lava pool is inside a fight');
// play two runs through with every scene (the test beats the enemies; it lifts the player up to the rim)
const play=async seed=>{await ev(`SET.seed='${seed}';titleOpenAll();startRun('volcano')`);const seen={};
 for(let i=0;i<1400;i++){const st=await ev("(()=>{setA('kb','r',1);const P=PL[0];P.hp=P.max;let k='';if(LV.esc&&LV.esc.on&&!LV.cine&&!LV.fin&&P.gy>LV.esc.top+1){P.x=LV.esc.perch-150;P.y=LV.esc.top-2;P.vy=0}for(let n=0;n<30;n++){fr++;update();if(LV.cine)k=LV.cine.k;for(const e of E)if(!e.dying&&e.st!=='cine'&&LV.t%20===0&&(!e.perch||PL[0].gy===e.gy)){e.hp=0;hurtE(e,{dmg:1,kb:4,lift:-4,ef:'kd'},1,null,P)}}return {k,state}})()");if(st.k)seen[st.k]=1;if(st.state!=='play')return {seen,state:st.state}}
 return {seen,state:'stuck'}};
const r1=await play(5),r2=await play(11);
ok(r1.state==='clear'&&r2.state==='clear','two volcano runs play through to the end ('+r1.state+', '+r2.state+')');
const all={...r1.seen,...r2.seen};
ok(['drawin','rim','erupt','jump','tiki'].every(k=>all[k]),'scenes seen: '+Object.keys(all).join(', '));
await ev("setA('kb','r',0)");
ok(/VOLCANO CLEAR/.test(await ev("$('c-h1').textContent")),'the results say VOLCANO CLEAR!');
// the geyser carries everyone into the slopes
ok(await ev("(()=>{let s=1;while(genRun('volcano',s).trans[0].k!=='geyser')s++;SET.seed=String(s);startRun('volcano');cineEnd();E.length=0;LV.encs.forEach(e=>{if(e.x<LV.trans[0].x)e.st=2});const tr=LV.trans[0];CAM.x=tr.x-W+260;levelWalls();PL[0].x=tr.x-100;PL[0].y=G;cineStart('geyser',{tr});let hi=G;while(LV.cine){fr++;update();hi=Math.min(hi,PL[0].y)}return hi<-100&&PL[0].x>tr.nx&&segAt(PL[0].x).b==='ashslope'&&PL[0].st==='free'&&PL[0].y===G})()"),'the geyser blasts you up and over into the Ashy Slopes');
// the jump from the rim lands you on the top ledge of the climb down; walking right takes you down over the lava
const dn=await ev("(()=>{SET.seed='5';startRun('volcano');cineEnd();E.length=0;const tr=LV.trans[1];LV.trans[0].done=1;LV.encs.forEach(e=>{if(e.x<tr.x)e.st=2});CAM.x=tr.x-W+260;levelWalls();PL[0].x=tr.x-100;PL[0].y=G;cineStart('rim',{tr});while(LV.cine){fr++;update()}const led=LV.terr.s[tr.land],on=PL[0].gy===led.y1&&PL[0].x>=led.x1&&PL[0].x<=led.x2,camUp=CAM.y<-100;const hs=[];setA('kb','r',1);for(let i=0;i<400;i++){fr++;update();PL[0].hp=PL[0].max;if(!hs.includes(PL[0].gy))hs.push(PL[0].gy)}setA('kb','r',0);return {on,camUp,hs,end:PL[0].gy===G&&PL[0].x>led.x1+950}})()");
ok(dn.on&&dn.camUp,'jumping into the crater lands you on the top ledge, the view raised to see you '+JSON.stringify(dn));
ok(dn.end&&dn.hs.filter(h=>h<345).length>=4,'walking on takes you down the ledges, one by one, to the crater floor');
// lava pools bounce you out, hurt a little, and never knock a player out
const pool=await ev("(()=>{SET.seed='5';startRun('volcano');cineEnd();E.length=0;const q=LV.haz.pools[0];LV.trans.forEach(t=>t.done=1);LV.encs.forEach(e=>{if(e.x<q.x1+600)e.st=2});CAM.x=q.x0-100;levelWalls();const P=PL[0];P.x=(q.x0+q.x1)/2;P.y=G;P.gy=G;P.surf=null;P.hp=3;let up=0,hpMin=3;for(let i=0;i<200;i++){fr++;update();if(P.vy<-15)up++;hpMin=Math.min(hpMin,P.hp)}return {up,hpMin,st:P.st}})()");
ok(pool.up>0&&pool.hpMin>=1&&pool.st!=='dead','a pool of lava bounces you out and never knocks you out '+JSON.stringify(pool));
// steam vents: a player rides it up; an enemy is knocked flying
const vent=await ev("(()=>{SET.seed='5';startRun('volcano');cineEnd();E.length=0;const v=LV.haz.vents[0];CAM.x=v.x-W/2;levelWalls();LV.encs.forEach(e=>e.st=2);const P=PL[0];P.x=v.x;P.y=G;const e=F(v.x+10,'g',0);e.y=G;E.push(e);let pu=G,eu=0;for(let i=0;i<260;i++){fr++;update();P.hp=P.max;pu=Math.min(pu,P.y);if(e.st==='fly'&&e.vy<-8)eu=1}return {pu:Math.round(G-pu),eu,ehp:e.hp>0}})()");
ok(vent.pu>200&&vent.eu&&vent.ehp,'a steam vent blasts a player high (a super jump) and knocks an enemy flying, without knocking it out '+JSON.stringify(vent));
// falling lava rocks during a fight on the slopes
const rk=await ev("(()=>{SET.seed='5';startRun('volcano');cineEnd();E.length=0;const s=LV.segs[1],ai=LV.encs.findIndex(e=>e.x>s.x0);LV.trans[0].done=1;LV.encs.forEach((e,i)=>{if(i<ai)e.st=2});const ae=LV.encs[ai];CAM.x=ae.lock;PL[0].x=ae.x;PL[0].y=G;let n=0,hit=0,h0=PL[0].hp;for(let i=0;i<900;i++){fr++;update();for(const e of E)e.inv=999;if(LV.rk&&LV.rk.list.some(r=>r.t===1))n++;if(PL[0].hp<h0)hit=1;h0=PL[0].hp;PL[0].hp=PL[0].max}return {n,hit,act:ae.st}})()");
ok(rk.n>=4&&rk.hit,'during a fight on the Ashy Slopes, lava rocks fall (with a warning mark) and hit '+JSON.stringify(rk));
// the pink army follows you up and down the ledges
const fol=await ev("(()=>{SET.seed='5';startRun('volcano');cineEnd();E.length=0;const cr=LV.segs[2],ai=LV.encs.findIndex(e=>e.x>cr.x0);LV.trans.forEach(t=>t.done=1);LV.encs.forEach((e,i)=>{if(i<ai)e.st=2;else e.st=e.st||0});const ae=LV.encs[ai];ae.st=2;CAM.x=ae.lock;levelWalls();const S=LV.terr.s.filter(q=>q.x1>=ae.lock&&q.x2<=ae.lock+W).sort((a,b)=>a.y1-b.y1),hi=S[0],P=PL[0];P.inv=99999;const e=F(hi.x1-160,'g',0);e.y=G;E.push(e);let up=0,down=0;for(let i=0;i<900;i++){P.x=(hi.x1+hi.x2)/2;P.y=hi.y1;P.gy=hi.y1;P.surf=hi;P.vy=0;fr++;update();P.hp=P.max;if(e.gy===hi.y1){up=i;break}}if(!up)return {up,gy:e.gy,hi:hi.y1};e.cd=999;for(let i=0;i<600;i++){P.x=ae.x+(e.x<ae.x?300:-300);P.y=G;P.gy=G;P.surf=null;fr++;update();P.hp=P.max;e.cd=Math.max(e.cd,5);if(e.gy===G&&e.y>=G-1){down=i;break}}return {up,down}})()");
ok(fol.up>0&&fol.down>0,'an enemy follows you up the ledges to the highest one, and back down to the floor '+JSON.stringify(fol));
ok(await ev("(()=>{SET.seed='5';startLevel('woods1');return TERRAIN.n===0})()"),'no ledges outside the theme (the Wooded Trail is flat)');
// the boss's last stand: at 1 health everything stops, he has his say, the lava rises; climb out and finish him
const esc=await ev(`(()=>{SET.seed='5';startRun('volcano');cineEnd();const bi=LV.encs.length-1;LV.encs.forEach((e,i)=>{if(i<bi)e.st=2});LV.cp=bi-1;LV.trans.forEach(t=>t.done=1);const be=LV.encs[bi];CAM.x=be.lock;PL[0].x=be.x-200;PL[0].y=G;levelWalls();const step=n=>{for(let i=0;i<n;i++){fr++;update()}};step(400);
 const B=E.find(e=>e.tk==='K');E.filter(e=>e!==B).forEach(e=>e.gone=1);B.hp=3;hurtE(B,{dmg:30,kb:5,ef:'kd'},1,null,PL[0]);const hp1=B.hp,dying=!!B.dying;step(3);
 const stun=LV.cine&&LV.cine.k==='tiki'&&PL[0].st==='cine',said=[];let ledges=0;while(LV.cine){fr++;update();if(LV.say&&!said.includes(LV.say.txt))said.push(LV.say.txt);ledges=Math.max(ledges,TERRAIN.n)}
 const L=LV.esc,y0=L.y;step(300);return {hp1,dying,stun,said,ledges:ledges>=LV.terr.s.length+9,perch:B.perch&&B.y===L.top,rise:y0-L.y,free:PL[0].st}})()`);
ok(esc.hp1===1&&!esc.dying,'the Pink Tiki can only be beaten down to his last bit of health at the bottom');
ok(esc.stun&&esc.said.length===2,'then everything stops (you are stunned) and he says two lines: '+JSON.stringify(esc.said));
ok(esc.ledges&&esc.perch&&esc.rise>100&&esc.free==='free','ledges come out of the walls, he rides the lava up to the rim, and the lava rises '+JSON.stringify(esc));
const climb=await ev(`(()=>{const P=PL[0],L=LV.esc,S=[...L.s].sort((a,b)=>b.y1-a.y1),key=(k,v)=>setA('kb',k,v);const step=n=>{for(let i=0;i<n;i++){fr++;update();P.hp=P.max;for(const e of E)if(e.tk!=='K'&&!e.dying)e.gone=1}};const out=[];
 for(const s of S){let tries=0;const mid=(s.x1+s.x2)/2;while(Math.abs(P.gy-s.y1)>1&&tries++<6){const cu=P.surf,cx=cu?Math.max(cu.x1+12,Math.min(cu.x2-12,mid)):mid;
  for(let i=0;i<120&&Math.abs(P.x-cx)>8;i++){key(P.x<cx?'r':'l',1);key(P.x<cx?'l':'r',0);step(1)}key('l',0);key('r',0);step(3);
  key('j',1);step(2);key('j',0);for(let i=0;i<80;i++){const d=mid-P.x;key('r',d>6?1:0);key('l',d<-6?1:0);step(1);if(P.vy===0&&P.y>=P.gy-0.5&&i>5)break}key('l',0);key('r',0);step(2)}
  out.push(P.gy===s.y1?1:0)}
 const B=E.find(e=>e.tk==='K');return {out,said:L.said,lava:L.y>L.top+100,cam:CAM.y<-600}})()`);
ok(climb.out.every(x=>x)&&climb.lava,'the ledges can be climbed with ordinary jumps, all the way to the rim, ahead of the lava '+JSON.stringify(climb));
ok(climb.said&&climb.cam,'at the rim he has something to say, and the view rose with you');
// near the rim the view shows the boss but never loses you (on each of the top ledges and jumping between them)
const cam=await ev(`(()=>{const P=PL[0],L=LV.esc,S=[...L.s].sort((a,b)=>b.y1-a.y1).slice(-4,-1),out=[];const on=p=>{const sx=(p.x-viewX())*CAM.z,sy=G+(p.y-G-CAM.y)*CAM.z,hy=G+(p.y-100-G-CAM.y)*CAM.z;return sx>0&&sx<W&&sy<H&&hy>0};
 for(const s of S){let ok=true;const put=()=>{P.x=(s.x1+s.x2)/2;P.y=s.y1;P.gy=s.y1;P.surf=s;P.vy=0};put();for(let i=0;i<150;i++){L.y=G+40;fr++;update();P.hp=P.max;if(i>60&&!on(P))ok=false}
  put();setA('kb','j',1);fr++;update();setA('kb','j',0);for(let i=0;i<40;i++){L.y=G+40;fr++;update();if(!on(P))ok=false}out.push(ok?1:0)}
 return out})()`);
ok(cam.every(x=>x),'near the rim the view never loses you: on each of the last ledges and jumping from them '+JSON.stringify(cam));
const fin=await ev(`(()=>{const B=E.find(e=>e.tk==='K');PL[0].x=B.x-60;PL[0].face=1;hurtE(B,{dmg:5,kb:5,ef:'kd'},1,null,PL[0]);const d=!!B.dying;for(let i=0;i<600&&state==='play';i++){fr++;update()}return {d,fin:LV.fin,state}})()`);
ok(fin.d&&fin.fin&&fin.state==='clear','one more hit at the rim finishes him (the slow-motion finale) and the run is won '+JSON.stringify(fin));
// the lava: it bounces you up, never knocks you out, and brings back a knocked-out player
const lava=await ev(`(()=>{ROSTER.length=0;ROSTER.push({slot:0,col:'#ff7a00',d2:'#c25a00'},{slot:1,col:'#3ec5ff',d2:'#1f8fc0'});SET.seed='5';startRun('volcano');cineEnd();const bi=LV.encs.length-1;LV.encs.forEach((e,i)=>{if(i<bi)e.st=2});LV.trans.forEach(t=>t.done=1);const be=LV.encs[bi];CAM.x=be.lock;PL.forEach(p=>{p.x=be.x-200;p.y=G});levelWalls();for(let i=0;i<400;i++){fr++;update()}
 const B=E.find(e=>e.tk==='K');E.filter(e=>e!==B).forEach(e=>e.gone=1);B.hp=1;hurtE(B,{dmg:30,kb:5,ef:'kd'},1,null,PL[0]);while(LV.escPend||LV.cine){fr++;update()}
 const [A,D]=PL;D.hp=0;D.st='dead';D.deadT=0;D.y=G;A.hp=2;let bounce=0,minHp=2;for(let i=0;i<500;i++){A.x=be.x;for(const e of E)if(e!==B)e.gone=1;fr++;update();if(A.vy<-18)bounce++;minHp=Math.min(minHp,A.hp)}const r={bounce,minHp,a:A.st,d:D.st};ROSTER.length=0;return r})()`);
ok(lava.bounce>0&&lava.minHp>=1&&lava.a!=='dead'&&lava.d!=='dead','the rising lava bounces you out (never a knockout) and brings a knocked-out teammate back up '+JSON.stringify(lava));
// a continue after the boss fight starts it over, lava and all
ok(await ev("(()=>{SET.seed='5';startRun('volcano');cineEnd();LV.esc={on:1,y:0,s:[]};LV.fin=1;continueLevel();return !LV.esc&&!LV.fin&&TERRAIN.n===LV.terr.s.length})()"),'a continue starts the boss fight over (no lava, no escape ledges)');
// the same inputs play the same (lockstep online): a run through the hazards twice gives the same result
const det=await ev("(()=>{const go=()=>{SET.seed='9';startRun('volcano');cineEnd();setA('kb','r',1);for(let i=0;i<5000;i++){fr++;update();PL[0].hp=PL[0].max;if(i%7===0){setA('kb','p',1)}else setA('kb','p',0)}setA('kb','r',0);setA('kb','p',0);return Math.round(PL[0].x)+','+Math.round(PL[0].y)+','+E.length+','+rnd()+','+LV.t};return go()===go()})()");
ok(det,'the same seed and inputs play out the same (vents, rocks, lava and climbing enemies are part of the game)');
// the story picture
await ev("openSolo&&openSolo()");await p.waitForTimeout(100);
ok(await ev("(()=>{const t=storyRow({cur:'volcano',levels:[],pages:newPages(),pick(){},redraw(){}}).find(o=>o.data[1]==='volcano');return !!t&&t.on&&t.img==='i-volcano'&&getComputedStyle(Object.assign(document.createElement('span'),{className:'pimg i-volcano'})).backgroundImage!==undefined})()"),'Volcano is on the Story choices with its picture');
ok(!errs.length,'no errors: '+errs.slice(0,3).join(' | '));
console.log(fails?fails+' FAILED':'ALL PASS');await b.close();process.exit(fails?1:0)})();
