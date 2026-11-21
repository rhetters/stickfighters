const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M14: each theme's main boss has its own look (drawing only), standing, fighting and as a flying body
const {chromium}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];const p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
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
ok(await ev("selfTest().hash===SELFTEST_EXPECT.arcade"),'self-test unchanged (looks are drawing only)');
ok(errs.length===0,'no errors '+errs.join(' | '));console.log(fails?fails+' FAILED':'ALL PASS');await b.close()})();
