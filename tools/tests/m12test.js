const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M12: XP and levels, the skill tree (points, rows, free respec), locked moves, boosts, ultimates, the Skills screen
const {chromium,devices}=require('playwright');const S=process.argv[2];let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext(devices['iPad (gen 7) landscape']);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(GAME);await p.waitForTimeout(300);
const ev=x=>p.evaluate(x),W=ms=>p.waitForTimeout(ms);
// levels and points
ok(await ev("levelOf(0)===1&&XP_AT[2]===40&&levelOf(XP_AT[5])===5&&levelOf(XP_AT[5]-1)===4&&levelOf(XP_MAX)===30&&pointsAt(1)===0&&pointsAt(5)===5&&pointsAt(30)===35"),'levels: 40 XP for level 2, one point a level plus a bonus every fifth (35 at level 30)');
ok(await ev("SKN.reduce((n,k)=>n+k.max,0)>60&&SKB.filter(b=>b.ult).length===4&&SKB.every(b=>!b.ult||b.ult.every(u=>A[u]&&A[u].nm))"),'the tree holds more points than level 30 gives; four branches have three ultimate steps each');
ok(await ev("[...SK_LOCKED].every(k=>A[k].ul==='Tree')&&Object.keys(A).every(k=>A[k].ul!=='Tree'||SK_LOCKED.has(k))"),'every move marked Tree in data/moves.js has a node that unlocks it, and the other way round');
// a new fighter: only the basics, no ultimate
await ev("saveFighter(0,{...FIGHTER0,name:'RHETT'});CHR.cur=0;titleOpenAll();$('b-start').click()");await W(300);
ok(await ev("PL[0].bd.lv===1&&PL[0].bd.locked.has('haymaker')&&PL[0].bd.locked.has('barrage')&&!PL[0].bd.locked.has('jab')&&!PL[0].bd.ult"),'a new fighter is level 1 with the basic moves and no ultimate');
await ev("window.SEEN=[];const _s=startAtk;startAtk=function(f,d,b){if(f.pl)SEEN.push(d.n);return _s(f,d,b)};E.forEach(e=>e.gone=1);E=[];queue=[];spawnT=1e9");
for(const k of['j','j','j']){await p.keyboard.press(k);await W(200)}
ok(await ev("SEEN.slice(0,3).join()==='jab,cross,jab'"),'P, P, P without Haymaker: the string starts over instead ('+await ev('SEEN.join()')+')');
await ev("PL[0].meter=100");await p.keyboard.press('u');await W(100);
ok(await ev("!PL[0].att||PL[0].att.d.n!=='tornado'"),'ULT does nothing without an ultimate');
await ev("pause(true);$('b-quit').click()");await W(200);
// points: rows, take back, reset
const P0=v=>ev(`(()=>{const f=fighter(0);${v}})()`);
ok(await P0("return canAdd(f.prog,'f-hay')"),'no points at level 1: '+await P0("return canAdd(f.prog,'f-hay')"));
await ev("const f=fighter(0);f.prog.xp=XP_AT[5];saveFighter(0,f)");
ok(await P0("return canAdd(f.prog,'f-knee')!==''"),'row 2 stays shut until 3 points are spent lower in the branch');
await ev("const f=fighter(0);f.prog.sk={'f-hay':1,'f-dmg':2,'f-knee':1};saveFighter(0,f)");
ok(await P0("return normProg(f.prog).sk['f-knee']===1&&canTake(f.prog,'f-hay')!==''&&canTake(f.prog,'f-knee')===''"),'a point can be taken back unless a higher row needs it');
ok(await ev("normProg({xp:0,sk:{'f-hay':1}}).sk['f-hay']===undefined&&normProg({xp:XP_AT[5],sk:{'f-knee':1}}).sk['f-knee']===undefined&&normProg({xp:XP_AT[5],sk:{'f-hay':1},ult:'surge'}).ult===null"),'a tree with more points than the level, a shut row, or an ultimate without points is not trusted');
// boosts and the build
ok(await ev("(()=>{const b=buildOf({xp:XP_AT[30],sk:{'f-dmg':3,'s-max':3,'b-tough':3},ult:'fists'});const v=buildOf({xp:XP_AT[30],sk:{'f-dmg':3,'s-max':3,'b-tough':3},ult:'fists'},true);return Math.abs(b.mod.pd-0.09)<1e-9&&b.mod.smax===18&&Math.abs(b.mod.arm-0.09)<1e-9&&!v.mod.pd&&!v.mod.smax&&v.ult===b.ult&&b.ult===A.ucomet})()"),'boosts add up per rank; Versus keeps moves and the ultimate but not the boosts');
ok(await ev("(()=>{const f={pl:1,bd:buildOf({xp:XP_AT[30],sk:{'f-dmg':3},ult:null})};return Math.abs(boost(f,{dmg:10},'p').dmg-10.9)<1e-9&&boost(f,{dmg:10},'k').dmg===10&&boost(f,{dmg:10},'p').exact===1})()"),'+3% punch damage per rank keeps its fraction (10 becomes 10.9)');
ok(await ev("[4,5,14,15,29,30].map(l=>{const b=buildOf({xp:XP_AT[l],sk:{'l-dmg':1},ult:'legs'});return b.ult?b.ult.n:'-'}).join()==='-,uspin,uspin,utwist,utwist,tornado'"),'Legs ultimate: Spin Kick at 5, Twisting Kick at 15, Tornado Kick at 30');
// the ultimate in a fight, the Surge bar and Second Wind
await ev("const f=fighter(0);f.prog={xp:XP_AT[20],sk:{'f-hay':1,'f-dmg':2,'f-knee':1,'s-max':3,'b-tough':3,'b-throw':1,'b-rise':2,'b-thr':2,'b-tough2':3,'b-cap':1},ult:'fists'};saveFighter(0,f);titleOpenAll();$('b-start').click()");await W(300);
ok(await ev("PL[0].smax===118&&PL[0].stm.v===118&&!PL[0].bd.locked.has('haymaker')&&!PL[0].bd.locked.has('knee')"),'spent points open moves and a bigger Surge bar (118)');
await ev("E.forEach(e=>e.gone=1);E=[];queue=[];spawnT=1e9;E.push(F(PL[0].x+40,'g',0));E[0].y=G;E[0].hp=999;PL[0].meter=100");await p.keyboard.press('u');await W(150);
ok(await ev("PL[0].att&&PL[0].att.d.n==='uhundred'"),'level 20 with the Fists ultimate: ULT starts Hundred Fists');
await W(1500);
ok(await ev("(()=>{const q=PL[0];q.att=null;q.st='free';q.inv=0;q.hp=10;hurtP(q,{dmg:50,kb:5},1);return q.st!=='dead'&&q.hp===30&&q.swUsed===1})()"),'Second Wind: the first knockout leaves you with 30 health');
ok(await ev("(()=>{const q=PL[0];q.inv=0;q.st='free';q.hp=10;hurtP(q,{dmg:50,kb:5},1);return q.st==='dead'})()"),'only once a fight');
// XP is banked when the run ends
const x0=await P0("return f.prog.xp");
await ev("RUN.xp=100;runEnd('o-st',{wave:3})");
const x1=await P0("return f.prog.xp");
ok(x1-x0===120&&/\+120 XP/.test(await ev("$('o-st').textContent")),'a run banks its XP plus the wave bonus: +'+(x1-x0)+' ('+await ev("$('o-st').textContent")+')');
await ev("RUN.xp=0;E.forEach(e=>e.gone=1);E=[];E.push(F(400,'b',0));E[0].dying=1;xpScan();xpScan()");
ok(await ev("RUN.xp===XP_KILL.b"),'each beaten enemy counts once ('+await ev('RUN.xp')+' XP for a Brute)');
await ev("pause(true);$('b-quit').click()");await W(200);
// saves from before the tree
ok(await ev("(()=>{const m=migrate({saveVersion:11,chr:{cur:0,list:[{name:'A'},null]}});return m.saveVersion===SAVE_VERSION&&m.chr.list[0].prog.xp===0})()"),'save version 12: older fighters start at level 1');
// the Skills screen
await ev("const f=fighter(0);f.prog={xp:XP_AT[6],sk:{},ult:null};saveFighter(0,f);titleOpenAll();$('b-char').click()");await W(200);
ok(/LV 6/.test(await ev("$('ch-skills').textContent")),'the Character screen shows the level: '+await ev("$('ch-skills').textContent"));
await p.click('#ch-skills');await W(200);
ok(await p.isVisible('#s-skills'),'SKILLS opens the Skills screen');
const node=()=>p.locator('#sk-tree .sknode').first();
await node().tap();await W(100);await node().tap();await W(150);
ok(await P0("return f.prog.sk['f-hay']===1"),'tap a skill to see it, tap it again to spend a point');
await p.tap('#sk-take');await W(150);ok(await P0("return !f.prog.sk['f-hay']"),'TAKE BACK returns the point');
await p.tap('#sk-add');await W(100);await p.locator('#sk-tree .sknode').nth(1).tap();await W(100);await p.tap('#sk-add');await W(100);
await p.locator('#sk-ult button').first().tap();await W(150);
ok(await P0("return f.prog.sk['f-hay']===1&&f.prog.sk['f-dmg']===1&&f.prog.ult==='fists'"),'ADD spends points; the Fists ultimate can be picked');
ok(await ev("$('sk-ult').querySelectorAll('button')[2].disabled"),'a branch with no points can\'t be your ultimate');
await p.locator('#sk-tabs button').nth(1).tap();await W(100);ok(/Palm Thrust/.test(await ev("$('sk-tree').textContent")),'the branch tabs switch the tree (Legs)');
await p.tap('#sk-reset');await W(150);ok(await P0("return !Object.keys(f.prog.sk).length&&f.prog.ult===null"),'RESET returns every point (free)');
ok(await ev("(()=>{const e=$('s-skills');return e.scrollHeight<=e.clientHeight+1})()"),'the Skills screen fits without scrolling');
await p.screenshot({path:S+'/shots/m12-skills.png'});
await p.keyboard.press('Escape');await W(150);ok(await ev("!$('s-char').hidden"),'Esc goes back to the Character screen');
ok(await ev("selfTest().hash===SELFTEST_EXPECT.arcade"),'self-test unchanged');
ok(errs.length===0,'no errors '+errs.join(' | '));console.log(fails?fails+' FAILED':'ALL PASS');await b.close()})();
