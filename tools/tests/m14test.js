const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M14: each theme's main boss has its own look (drawing only), standing, fighting and as a flying body;
// the final blow, the victory screen, ready-up and harder replays
const {chromium}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];const p=await (await b.newContext({viewport:{width:1080,height:810}})).newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(GAME);await p.waitForTimeout(300);const ev=x=>p.evaluate(x);
const bosses=await ev("Object.values(THEMES).map(t=>t.boss.t)");
ok(bosses.length===4&&await ev(`${JSON.stringify(bosses)}.every(t=>T[t].look&&T[t].look.extra.length)`),'every theme’s boss has its own look: '+bosses.join(', '));
ok(await ev("(()=>{const s=Object.values(THEMES).map(t=>T[t.boss.t].look.extra.slice().sort().join());return new Set(s).size===s.length})()"),'no two bosses share their parts');
ok(await ev("(()=>{const e=F(300,'G'),m=F(300,'mw');return !!e.look&&e.look.extra.includes('generalcap')&&!m.look})()"),'bosses get their look when they appear; mini-bosses keep the crown');
ok(await ev("Object.values(T).every(t=>!t.look||Object.keys(t.look).every(k=>!EQ.includes(k)||ITEM[t.look[k]]))"),'every store item a boss wears exists');
// draw each standing, then as a flying body, in a run
await ev("titleOpenAll()");
const drew=await ev(`(()=>{SET.seed='3';startRun('castle');cineEnd();E.length=0;let n=0;const d0=drawBossParts;drawBossParts=(...a)=>{n++;return d0(...a)};
 ${JSON.stringify(bosses)}.forEach((t,i)=>{const e=F(CAM.x+200+i*150,t);e.y=G;E.push(e)});for(let i=0;i<5;i++){fr++;update()}render();const stand=n;
 E.forEach(e=>{e.hp=0;hurtE(e,{dmg:1,kb:6,lift:-8,ef:'launch'},1,null,PL[0])});for(let i=0;i<20;i++){fr++;update()}n=0;render();drawBossParts=d0;return {stand,fly:n,rag:E.filter(e=>e.rag).length}})()`);
ok(drew.stand>=16&&drew.fly>=4,'the bosses’ parts are drawn standing and as flying bodies '+JSON.stringify(drew));
// the final blow on a theme's boss: slow motion, every enemy left is beaten, then the victory screen
await ev("render()");
const fin=await ev(`(()=>{ROSTER.length=0;ROSTER.push({slot:0,dev:'kb',col:'#ff7a00',d2:'#c25a00',name:'RHETT'},{slot:1,dev:'kb2',col:'#3ec5ff',d2:'#1f8fc0',name:'DAD'});SET.seed='4';titleOpenAll();startRun('castle');cineEnd();
 const be=LV.encs[LV.encs.length-1];LV.encs.forEach(e=>{if(e!==be)e.st=2});LV.trans.forEach(t=>t.done=1);LV.gates.forEach(g=>g.hp=0);CAM.x=be.lock;levelWalls();PL.forEach((q,i)=>{q.x=CAM.x+200+i*60;q.y=G});
 for(let i=0;i<900&&!(E.some(e=>e.tk===be.boss)&&E.filter(e=>!e.dying).length>1);i++){fr++;update()}
 const hp0=PL[0].hp,g=E.find(e=>!e.dying&&e.tk!==be.boss);hurtE(g,{dmg:7,kb:2,ef:'stagger'},1,null,PL[0]);hurtP(PL[1],{dmg:12,kb:3},1);
 const B=E.find(e=>e.tk===be.boss);B.hp=1;hurtE(B,{dmg:5,kb:6,lift:-8,ef:'launch'},1,null,PL[1]);
 return {slow,left:E.filter(e=>!e.dying).length,st:JSON.parse(JSON.stringify(LV.stats))}})()`);
ok(fin.slow>=150&&fin.left===0,'the final blow slows time and beats every enemy still standing '+JSON.stringify({slow:fin.slow,left:fin.left}));
ok(fin.st[0].dealt>=7&&fin.st[1].taken>=12&&fin.st[1].kos>=1,'damage dealt, taken and enemies beaten are counted per player '+JSON.stringify(fin.st));
for(let i=0;i<200&&await ev("state==='play'");i++)await ev("(()=>{setA('kb','r',1);for(let n=0;n<10;n++){fr++;update()}})()");
await ev("setA('kb','r',0)");await p.waitForTimeout(2400);
ok(await ev("!$('s-victory').hidden&&$('v-cards').children.length===2&&/RHETT/.test($('v-cards').textContent)&&/Damage/.test($('v-cards').textContent)"),'the victory screen shows a card for each player with their stats');
ok(await ev("(()=>{const r=$('v-title').getBoundingClientRect(),f=$('s-victory').getBoundingClientRect();return r.bottom<=f.bottom+1&&r.height>30})()"),'the buttons fit on the screen');
await ev("document.querySelectorAll('.vready')[0].click()");await p.waitForTimeout(1200);
ok(await ev("!$('s-victory').hidden&&document.querySelector('.vready.on')&&state!=='play'"),'one player ready is not enough');
const hp0=await ev("T[THEMES.castle.boss.t].hp");
await ev("document.querySelectorAll('.vready')[1].click()");await p.waitForTimeout(1500);
const nx=await ev("({state,name:LV.def.name,ng:LV.run.ng,vic:!$('s-victory').hidden,hard:hardScale(),hp:F(0,'g').hp,hp0:T.g.hp})");
ok(nx.state==='play'&&nx.ng===1&&/\+1/.test(nx.name)&&!nx.vic,'everyone ready starts the theme again, one step harder '+JSON.stringify(nx));
ok(nx.hard===1&&nx.hp>nx.hp0,'enemies are tougher in the harder run');
await ev("startRun('castle');cineEnd();vicOpen();");await p.waitForTimeout(200);
await ev("$('v-title').click()");await p.waitForTimeout(300);
ok(await ev("$('s-victory').hidden&&state!=='play'"),'MAIN MENU leaves the victory screen');
ok(await ev("selfTest().hash===SELFTEST_EXPECT.arcade"),'self-test unchanged (looks are drawing only)');
ok(errs.length===0,'no errors '+errs.join(' | '));console.log(fails?fails+' FAILED':'ALL PASS');await b.close()})();
