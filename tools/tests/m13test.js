const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M13: campaign runs generated from a seed (Castle Siege: woods, sewer, castle), transitions, boss intros, mini-bosses
const {chromium,devices}=require('playwright');const S=process.argv[2];let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext(devices['iPad (gen 7) landscape']);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(GAME);await p.waitForTimeout(300);
const ev=x=>p.evaluate(x);
// the generator
ok(await ev("JSON.stringify(genRun('castle',42))===JSON.stringify(genRun('castle',42))&&JSON.stringify(genRun('castle',42))!==JSON.stringify(genRun('castle',43))"),'the same seed always makes the same run; another seed makes another');
ok(await ev("(()=>{const L=genRun('castle',5);return L.segs.map(s=>s.b).join()==='woods,sewer,castle'&&L.trans.length===2&&L.encs.length===16&&L.encs[15].boss==='G'&&L.encs[15].intro==='pencil'&&L.segs.every((s,i)=>s.x1>s.x0&&(!i||s.x0>=L.segs[i-1].x1))})()"),'Castle Siege: woods, sewer, castle in order, two transitions, five fights a biome and the Pink General at the end');
const kinds=await ev("(()=>{const o={};for(let s=1;s<200;s++)for(const t of genRun('castle',s).trans)o[t.k]=(o[t.k]||0)+1;return o})()");
ok(['catapult','gate','pipe','rope'].every(k=>kinds[k]>10),'all four transitions come up: '+JSON.stringify(kinds));
ok(await ev("(()=>{for(let s=1;s<300;s++)for(const t of genRun('castle',s).trans)if(t.k==='pipe'&&t.from!=='sewer'&&t.to!=='sewer')return false;return true})()"),'the pipe slide only goes into or out of the sewer');
const minis=await ev("(()=>{let m=0;for(let s=1;s<500;s++)m+=genRun('castle',s).encs.filter(e=>e.mini).length;return m/499})()");
ok(minis>0.3&&minis<1,'mini-bosses are rare: '+minis.toFixed(2)+' per run (15 fights)');
// play two runs through (enemies beaten and gates smashed by the test) with every scene
const play=async seed=>{await ev(`SET.seed='${seed}';titleOpenAll();startRun('castle');LV.encs[1].mini='mw';LV.encs[1].line='HI'`);const seen={};
 for(let i=0;i<900;i++){const st=await ev("(()=>{setA('kb','r',1);const P=PL[0];P.hp=P.max;let k='';for(let n=0;n<30;n++){fr++;update();if(LV.cine)k=LV.cine.k;for(const e of E)if(!e.dying&&e.st!=='cine'&&LV.t%20===0){e.hp=0;hurtE(e,{dmg:1,kb:4,lift:-4,ef:'kd'},1,null,P)}for(const g of LV.gates)if(g.hp>0&&g.x-P.x<120)hurtGate(g,99)}return {k,state}})()");if(st.k)seen[st.k]=1;if(st.state!=='play')return {seen,state:st.state}}
 return {seen,state:'stuck'}};
const r1=await play(7),r2=await play(39);
ok(r1.state==='clear'&&r2.state==='clear','two runs play through to the end ('+r1.state+', '+r2.state+')');
const all={...r1.seen,...r2.seen};
ok(['rope','pipe','catapult','jump','pencil'].every(k=>all[k]),'scenes seen: '+Object.keys(all).join(', ')+' (and a gate smashed)');
await ev("setA('kb','r',0)");
ok(/CASTLE SIEGE CLEAR/.test(await ev("$('c-h1').textContent")),'the results say CASTLE SIEGE CLEAR!');
ok(await ev("PROG.woods1&&PROG.woods1.done"),'getting through the woods counts as the Wooded Trail (Ranger Hat)');
// the pencil intro: everyone frozen, the boss can't be hit until it ends
await ev("SET.seed='7';startRun('castle');const ne=LV.encs[15];LV.encs.forEach((e,i)=>{if(i<15)e.st=2});LV.trans.forEach(t=>t.done=1);CAM.x=ne.lock;PL[0].x=CAM.x+300;LV.gates.forEach(g=>g.hp=0)");
await ev("for(let n=0;n<5;n++){fr++;update()}");
ok(await ev("LV.cine&&LV.cine.k==='pencil'&&PL[0].st==='cine'&&E[0].tk==='G'&&E[0].inv>100"),'the Pink General is drawn in while everyone waits (and cannot be hit)');
await ev("for(let n=0;n<160;n++){fr++;update()}");
ok(await ev("PL[0].st!=='cine'&&LV.say&&LV.say.txt.length>3"),'then he comes to life and talks: '+await ev("LV.say&&LV.say.txt"));
await ev("for(let n=0;n<80;n++){fr++;update()}");
ok(await ev("!LV.cine&&E[0].st!=='cine'&&E[0].inv===0"),'and the fight starts');
// the jump intro knocks everyone down
await ev("SET.seed='7';startRun('castle');const ne=LV.encs[0];ne.mini='mw';ne.line='HI';CAM.x=ne.lock;PL[0].x=CAM.x+200;for(let n=0;n<40;n++){fr++;update()}");
ok(await ev("E.some(e=>e.tk==='mw')&&['fly','down','getup'].includes(PL[0].st)"),'a mini-boss leaps in and knocks everyone down ('+await ev('PL[0].st')+')');
// a slippery sewer floor
const slide=await ev("(()=>{const r={};for(const b of ['woods','sewer']){SET.seed='7';startRun('castle');const s=LV.segs.find(x=>x.b===b);CAM.x=s.x0+1200;PL[0].x=CAM.x+100;E=[];const e=F(CAM.x+400,'g',0);e.y=G;E.push(e);e.st='down';e.dt=60;e.vx=10;WB.l=WW.l=-1e9;WB.r=WW.r=1e9;for(let n=0;n<20;n++){e.st='down';e.dt=60;updE(e)}r[b]=+e.vx.toFixed(2)}return r})()");
ok(slide.sewer>slide.woods*1.5,'bodies keep sliding on the sewer floor (speed after 20 frames): '+JSON.stringify(slide));
// a new run each time (no fixed seed)
ok(await ev("(()=>{SET.seed='';startRun('castle');const a=LV.run.seed;replayLevel();return a!==LV.run.seed})()"),'PLAY AGAIN makes a new run');
await p.screenshot({path:S+'/shots/m13.png'});
ok(await ev("selfTest().hash===SELFTEST_EXPECT.arcade"),'self-test unchanged');
ok(errs.length===0,'no errors '+errs.join(' | '));console.log(fails?fails+' FAILED':'ALL PASS');await b.close()})();
