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
// parking: everyone gets out at the Skyscraper and the cars stay parked
const pk=await ev("(()=>{E.length=0;const tr=LV.trans[1];LV.trans[0].done=1;LV.encs.forEach(e=>{if(e.x<tr.x)e.st=2});CAM.x=tr.x-W+260;levelWalls();PL[0].x=tr.x-300;PL[0].y=G;let seen=0,parked=0;setA('kb','r',1);for(let i=0;i<600;i++){fr++;update();if(LV.cine){seen=1;parked=Math.max(parked,(LV.cine.parked||[]).length)}}setA('kb','r',0);return {seen,parked,car:!!PL[0].car,b:segAt(PL[0].x).b,st:PL[0].st}})()");
ok(pk.seen&&pk.parked===1&&!pk.car&&pk.b==='tower'&&pk.st==='free','at the Skyscraper everyone parks, hops out and goes in on foot '+JSON.stringify(pk));
// Pink Kong: his air conditioner lands where he aimed, with a shadow first, and hurts whoever is under it
const kg=await ev(`(()=>{E.length=0;const L=LV.encs[LV.encs.length-1];for(const e of LV.encs)if(e!==L)e.st=2;LV.trans[1].done=1;CAM.x=L.x-W/2;levelWalls();const P=PL[0];P.x=L.x-400;P.y=G;
 let k=null;for(let i=0;i<300&&!k;i++){fr++;update();P.hp=P.max;k=E.find(e=>e.tk==='N')}if(!k)return 'no kong';
 for(let i=0;i<200;i++){fr++;update();P.hp=P.max}k.x=P.x+330;k.face=-1;k.st='free';k.cd=0;k.tgx=P.x;startAtk(k,EA.kthrow);let rock=null,hp1=null;
 for(let i=0;i<120;i++){P.x=k.tgx;P.vx=0;fr++;update();if(LV.rk&&LV.rk.list.some(r=>r.k==='ac'))rock=rock||LV.rk.list.find(r=>r.k==='ac').x;if(rock!==null&&hp1===null)hp1=P.hp}
 return {rock,tx:k.tgx,hp1,hp2:P.hp,look:!!T.N.look.fur}})()`);
ok(kg&&kg.rock!==null&&Math.abs(kg.rock-kg.tx)<60&&kg.hp2<kg.hp1,'Pink Kong throws an air conditioner that lands where he aimed and hurts '+JSON.stringify(kg));
ok(await ev("BOSSPICK.N({tk:'N'},300)!==undefined&&EA.kthrow.drop==='ac'&&EA.kpound&&INFO.kthrow&&INFO.kpound"),'his moves are in the chart: Chest Pound and Air Conditioner Throw');
// everything is drawn without errors
for(const s of [3,8]){await ev(`(()=>{SET.seed='${s}';startRun('city');cineEnd()})()`);await p.waitForTimeout(400)}
ok(errs.length===0,'no errors '+errs.join(' | '));
console.log(fails?fails+' FAILED':'ALL PASS');await b.close();process.exit(fails?1:0)})();
