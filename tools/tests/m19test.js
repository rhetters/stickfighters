const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M19: The City: the suburbs, the car park and a drive through Downtown (cars painted in each player's colour, ramming
// sends the army flying, cars can't be hurt), parking and climbing the Skyscraper, and Pink Kong on the roof
const {chromium,devices}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext(devices['iPad (gen 7) landscape']);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(GAME);await p.waitForTimeout(300);
const ev=x=>p.evaluate(x);
// the generator
ok(await ev("JSON.stringify(genRun('city',42))===JSON.stringify(genRun('city',42))"),'the same seed always makes the same city run');
ok(await ev("(()=>{for(let s=1;s<60;s++){const L=genRun('city',s),bo=L.encs[L.encs.length-1];if(L.segs.map(q=>q.b).join()!=='burbs,city,tower'||bo.boss!=='N'||L.trans[0].k!=='cars'||L.trans[1].k!=='park')return s}return true})()")===true,'The City: suburbs, then the car park into Downtown, then parking at the Skyscraper; Pink Kong at the top');
ok(await ev("CARS.length===10&&new Set(CARS.map(m=>m.name)).size===10&&CARS.every(m=>m.body.length>=6&&m.wheels.length===2&&m.seat.length===2)"),'ten car models, each with a shell, two wheels and a seat');
// the car park: everyone gets a car and drives out; the same seed gives the same cars
const park=async seed=>ev(`(()=>{SET.seed='${seed}';titleOpenAll();startRun('city');cineEnd();E.length=0;const tr=LV.trans[0];LV.encs.forEach(e=>{if(e.x<tr.x)e.st=2});CAM.x=tr.x-W+260;levelWalls();PL[0].x=tr.x-100;PL[0].y=G;let seen=0;setA('kb','r',1);for(let i=0;i<500;i++){fr++;update();if(LV.cine)seen=1}setA('kb','r',0);return {seen,car:PL[0].car&&PL[0].car.m,b:segAt(PL[0].x).b}})()`);
const a1=await park(5),a2=await park(5);
ok(a1.seen&&a1.car!==null&&a1.car!==undefined&&a1.b==='city','the car park scene gives you a car in Downtown '+JSON.stringify(a1));
ok(a1.car===a2.car,'the same seed gives the same car (so it plays the same online)');
const ms=await ev("(()=>{const s=new Set();for(let i=0;i<200;i++){const f={};carGive(f);s.add(f.car.m)}return s.size})()");
ok(ms>=8,'cars are picked from all the models ('+ms+' seen)');
// driving: cars hop, the turbo goes faster, ramming launches enemies and is credited to the driver; cars can't be hurt
const dr=await ev(`(()=>{const P=PL[0],run=(n,t)=>{P.x=WB.l+60;P.vx=0;P.car.tb=0;P.car.tc=0;E.length=0;let m=0;setA('kb','r',1);if(t)setA('kb','p',1);for(let i=0;i<n;i++){fr++;update();if(t)setA('kb','p',0);m=Math.max(m,Math.abs(P.vx))}setA('kb','r',0);return m};
 const hp0=P.hp;hurtP(P,{dmg:30,kb:10,ef:'kd'},1);const safe=P.hp===hp0&&!!P.car;
 const maxv=run(45,0),tmax=run(45,1);
 P.x=WB.l+60;P.vx=0;E.length=0;spawn({t:'g',x:P.x+300});spawn({t:'g',x:P.x+340});for(const e of E){e.y=G;e.st='free'}
 let flew=0;setA('kb','r',1);for(let i=0;i<60;i++){fr++;update();for(const e of E)if(e.st==='fly'||e.dying)flew|=1<<E.indexOf(e)}
 setA('kb','r',0);for(let i=0;i<30;i++){fr++;update()}
 setA('kb','j',1);fr++;update();setA('kb','j',0);let up=0;for(let i=0;i<20;i++){fr++;update();up=Math.max(up,G-P.y)}
 return {safe,flew,maxv,tmax,up}})()`);
ok(dr.safe,'a hit on a player in a car does nothing');
ok(dr.flew===3,'driving into the army sends them flying '+JSON.stringify(dr));
ok(dr.tmax>dr.maxv+1,'Punch is a turbo: faster than top speed');
ok(dr.up>20,'Jump hops the car');
const sg=await ev("(()=>{const P=PL[0];P.x=WB.l+60;P.vx=0;P.car.tb=0;E.length=0;let m=0;setA('kb','r',1);setA('kb','s',1);for(let i=0;i<45;i++){fr++;update();m=Math.max(m,Math.abs(P.vx))}setA('kb','r',0);setA('kb','s',0);return m})()");
ok(sg>dr.maxv+1,'holding Surge speeds the car up ('+sg.toFixed(1)+' against '+dr.maxv.toFixed(1)+')');
// parking: everyone gets out at the Skyscraper and the cars stay parked
const pk=await ev("(()=>{E.length=0;const tr=LV.trans[1];LV.trans[0].done=1;LV.encs.forEach(e=>{if(e.x<tr.x)e.st=2});CAM.x=tr.x-W+260;levelWalls();PL[0].x=tr.x-300;PL[0].y=G;let seen=0,parked=0;setA('kb','r',1);for(let i=0;i<600;i++){fr++;update();if(LV.cine){seen=1;parked=Math.max(parked,(LV.cine.parked||[]).length)}}setA('kb','r',0);return {seen,parked,car:!!PL[0].car,b:segAt(PL[0].x).b,st:PL[0].st}})()");
ok(pk.seen&&pk.parked===1&&!pk.car&&pk.b==='tower'&&pk.st==='free','at the Skyscraper everyone parks, hops out and goes in on foot '+JSON.stringify(pk));
// the Skyscraper is a climb straight up: platforms that each overlap the one below (a jump straight up gets you
// on), a ladder in each stretch, a solid floor for each ambush and the roof at the top with Pink Kong
const sh=await ev(`(()=>{const out={};for(let s=1;s<40;s++){const L=genRun('city',s),S=L.shaft,ts=L.terr.s.filter(q=>q.st==='fire'),fl=L.terr.s.filter(q=>q.solid);
 if(!S||S.fys.length!==3||S.roof!==G-4*SHAFT_FLOOR||fl.length!==4||L.terr.c.length!==4)return 'shape '+s;
 for(let i=1;i<ts.length;i++){const a=ts[i-1],b=ts[i];if(a.y1-b.y1===SHAFT_STEP&&(b.x1>a.x2-20||b.x2<a.x1+20))return 'gap '+s}
 if(ts.some(q=>q.x1<S.x0||q.x2>S.x0+W))return 'out '+s;
 const en=L.encs.slice(-4);if(!en.every((e,i)=>e.lock===S.x0&&e.fy===(i<3?S.fys[i]:S.roof))||en[3].boss!=='N')return 'fights '+s}
 return true})()`);
ok(sh===true,'the Skyscraper: one screen-wide climb, overlapping platforms and a ladder per stretch, three ambush floors and Pink Kong on the roof ('+sh+')');
// a player climbs it with the buttons alone (fights won at once), and a floor's fight starts only once you're on it
const toTower=seed=>`SET.seed='${seed}';titleOpenAll();startRun('city');cineEnd();E.length=0;for(const t of LV.trans)t.done=1;for(const e of LV.encs)if(e.fy===undefined)e.st=2;CAM.x=LV.shaft.x0-W;levelWalls();PL[0].x=LV.shaft.x0-300;PL[0].y=G;PL[0].vy=0;`;
const cl=await ev(`(()=>{${toTower(9)}const P=PL[0];let jt=0,early=0;
 for(let t=0;t<6000;t++){P.hp=P.max;
  const ae=LV.encs.find(e=>e.st===1);
  if(ae&&ae.fy!==undefined&&P.gy>ae.fy+1&&P.y>=P.gy-1)early=1;
  if(ae&&ae.boss)return {ok:1,t,early};
  if(ae){ae.q=[];for(const e of E)if(!e.dying){e.hp=0;hurtE(e,{dmg:1,kb:2,lift:-2,ef:'kd'},1,null,P)}}
  const tg=LV.terr.s.filter(s=>s.y1<P.gy-5&&s.y1>=P.gy-190).sort((a,b)=>b.y1-a.y1)[0];let dir=0,jump=0;
  if(tg){const tx=Math.max(tg.x1+30,Math.min(tg.x2-30,P.x));dir=Math.abs(tx-P.x)>8?Math.sign(tx-P.x):0;if(Math.abs(tx-P.x)<60&&P.y>=P.gy-1&&t>jt)jump=1}
  setA('kb','r',dir>0?1:0);setA('kb','l',dir<0?1:0);setA('kb','j',jump);if(jump)jt=t+20;fr++;update()}
 return {ok:0,y:P.y}})()`);
await ev("setA('kb','r',0);setA('kb','l',0);setA('kb','j',0)");
ok(cl.ok&&!cl.early,'a player climbs from the street to the roof jumping up the platforms, and each floor\'s ambush starts as they reach it '+JSON.stringify(cl));
// during an ambush the hatch above the floor stays shut: heads stay under it
const ht=await ev(`(()=>{${toTower(9)}const S=LV.shaft,P=PL[0];CAM.x=S.x0;P.x=S.x0+450;P.y=S.fys[0]-2;let m=1e9,on=0;
 for(let i=0;i<60;i++){P.hp=P.max;fr++;update()}on=LV.encs.findIndex(e=>e.st===1&&e.fy===S.fys[0])>=0;
 for(let k=0;k<4;k++){setA('kb','j',1);for(let i=0;i<5;i++){fr++;update()}setA('kb','j',0);for(let i=0;i<40;i++){P.hp=P.max;fr++;update();m=Math.min(m,P.y-80*P.s)}}
 return {on,head:Math.round(m),hatch:S.fys[0]-SHAFT_CEIL}})()`);
ok(ht.on&&ht.head>=ht.hatch-1,'during a floor\'s ambush its hatch keeps everyone below it '+JSON.stringify(ht));
// a continue after winning a floor starts on that floor
const ct=await ev(`(()=>{${toTower(9)}const S=LV.shaft;LV.cp=LV.encs.findIndex(e=>e.fy===S.fys[1]);for(let i=0;i<=LV.cp;i++)LV.encs[i].st=2;continueLevel();for(let i=0;i<30;i++){fr++;update()}return {gy:PL[0].gy,fy:S.fys[1]}})()`);
ok(ct.gy===ct.fy,'a continue puts you back on the floor you last won '+JSON.stringify(ct));
// Pink Kong leaps onto the roof; his air conditioner lands where he aimed, with a shadow first, and hurts
const kg=await ev(`(()=>{${toTower(9)}const S=LV.shaft,L=LV.encs[LV.encs.length-1];for(const e of LV.encs)if(e!==L)e.st=2;CAM.x=S.x0;const P=PL[0];P.x=S.x0+120;P.y=S.roof-2;
 let k=null;for(let i=0;i<300&&!k;i++){fr++;update();P.hp=P.max;k=E.find(e=>e.tk==='N')}if(!k)return 'no kong';
 for(let i=0;i<260;i++){fr++;update();P.hp=P.max}const onRoof=k.gy===S.roof&&P.gy===S.roof;k.x=P.x+330;k.face=-1;k.st='free';k.cd=0;k.tgx=P.x;startAtk(k,EA.kthrow);let rock=null,hp1=null,ry=null;
 for(let i=0;i<120;i++){P.x=k.tgx;P.vx=0;fr++;update();const r=LV.rk&&LV.rk.list.find(r=>r.k==='ac');if(r){rock=rock||r.x;ry=r.y}if(rock!==null&&hp1===null)hp1=P.hp}
 return {onRoof,rock,ry,roof:S.roof,tx:k.tgx,hp1,hp2:P.hp}})()`);
ok(kg&&kg.onRoof&&kg.rock!==null&&kg.ry===kg.roof&&Math.abs(kg.rock-kg.tx)<60&&kg.hp2<kg.hp1,'Pink Kong lands on the roof; his air conditioner lands on the roof where he aimed and hurts '+JSON.stringify(kg));
// Surge speeds the car up; in your own levels the Skyscraper is an ordinary place at street level
ok(await ev("BOSSPICK.N({tk:'N'},300)!==undefined&&EA.kthrow.drop==='ac'&&EA.kpound&&INFO.kthrow&&INFO.kpound"),'his moves are in the chart: Chest Pound and Air Conditioner Throw');
ok(await ev("(()=>{const L=normLevel({places:[{b:'tower'}]}),X=buildCustom(L,3);return !X.shaft})()"),'in your own levels the Skyscraper is at street level');
// everything is drawn without errors
for(const s of [3,8]){await ev(`(()=>{SET.seed='${s}';startRun('city');cineEnd()})()`);await p.waitForTimeout(400)}
ok(errs.length===0,'no errors '+errs.join(' | '));
console.log(fails?fails+' FAILED':'ALL PASS');await b.close();process.exit(fails?1:0)})();
