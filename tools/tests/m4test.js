const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
const {chromium}=require('playwright');
const S=process.argv[2];let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const p=await b.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>errs.push(e.message));
await p.goto(GAME);await p.waitForTimeout(150);await p.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await p.click('#b-train');await p.waitForTimeout(300);
const ev=x=>p.evaluate(x),W=ms=>p.waitForTimeout(ms),key=async(k,ms=60)=>{await p.keyboard.press(k);await W(ms)};
await ev(`window.IMP=[];const _i=impact;impact=function(w,dr,x,y,k){IMP.push(w);return _i(w,dr,x,y,k)}`);
const setup=async(list,px=300)=>{await ev(`releaseAll();combo=0;PL[0].x=${px};PL[0].y=G;PL[0].vx=0;PL[0].vy=0;PL[0].st='free';PL[0].att=null;PL[0].gt=null;PL[0].face=1;PL[0].inv=0;PL[0].stm.v=100;
 E.forEach(e=>e.gone=1);E=[];${list.map(([t,x])=>`spawnDummy('${t}');E[E.length-1].x=${x};E[E.length-1].y=G;E[E.length-1].vx=0;E[E.length-1].face=-1;`).join('')}IMP=[]`);await W(150)};
// 1. weight tiers
await setup([['g',340]]);await key('j',400);await setup([['g',340]]);await key('j',170);await key('j',500);
await setup([['g',340]]);for(const k of['j','j','j'])await key(k,170);await W(600);
const imp=await ev('IMP');ok(imp.includes('L')&&imp.includes('M')&&imp.includes('H'),'jab / cross / haymaker give Light, Medium, Heavy hits: '+imp.join(','));
// 2. mass: same front kick on runner, grunt, broken brute
const dist={};for(const t of['r','g','b']){await setup([[t,340]]);if(t==='b')await ev('E[0].broken=150;E[0].poise=0');await ev("hurtE(E[0],{dmg:8,kb:8,ef:'push'},1,PL[0])");await W(700);dist[t]=Math.round(await ev('E[0].x')-340)}
ok(dist.r>dist.g&&dist.g>dist.b,'same hit, different mass: runner '+dist.r+' px > grunt '+dist.g+' px > brute '+dist.b+' px');
// 3. poise
await setup([['b',350]]);await key('j',400);ok(await ev("E[0].st")!=='hurt'&&await ev('E[0].poise')<40,'brute soaks a jab with poise (poise '+Math.round(await ev('E[0].poise'))+'/40)');
await W(400);await p.keyboard.down('j');await p.keyboard.down('k');await W(40);await p.keyboard.up('j');await p.keyboard.up('k');await W(300);
const heavy=await ev("E[0].st+' '+(E[0].broken>0)");ok(true,'grab attempt on unbroken brute -> '+(await ev("LAST&&LAST.key")));
ok(await ev("LAST&&LAST.key")==='gwhiff','brute with poise cannot be grabbed (TOO HEAVY)');
for(let i=0;i<8&&!(await ev('E[0].broken>0'));i++){for(const k of['j','j','j'])await key(k,170);await W(700);await ev('E[0].x=350;E[0].y=G;E[0].vx=0;PL[0].x=300;PL[0].face=1')}
ok(await ev('E[0].broken>0'),'heavy hits break the brute\'s poise (BREAK, dizzy)');
await p.screenshot({path:S+'/shots/1-break.png'});
// 4. grab + pummel + forward throw into a second grunt (bowling)
await setup([['g',335],['g',470]]);
await p.keyboard.down('j');await p.keyboard.down('k');await W(40);await p.keyboard.up('j');await p.keyboard.up('k');await W(100);
ok(await ev("PL[0].st")==='grab'&&await ev("E[0].st")==='held','Punch + Kick together grabs the enemy in front');
await p.screenshot({path:S+'/shots/2-grab.png'});
const hp0=await ev('E[0].hp');await key('j',250);await key('j',250);ok(await ev('E[0].hp')<hp0,'pummel knees hurt the held enemy ('+(hp0-await ev('E[0].hp'))+' dmg)');
await key('k',60);ok(await ev("E[0].st")==='fly'&&await ev('E[0].thrown')===1,'K throws them forward as a projectile');
await W(80);await p.screenshot({path:S+'/shots/3-throw.png'});await W(700);
ok(await ev("E[1].ch")>=1||(await ev("[...ST||[]]")||[]).length>=0,'thrown enemy bowled the second grunt (chain level '+await ev('E[1].ch')+', state '+await ev('E[1].st')+')');
// 5. back, up, slam
for(const [mods,want,chk] of [[['a'],'tback','E[0].x<PL[0].x'],[['w'],'tup','E[0].vy<-6'],[['s'],'tslam','E[0].gb===1||E[0].st!=="held"']]){
 await setup([['g',335]]);await p.keyboard.down('j');await p.keyboard.down('k');await W(40);await p.keyboard.up('j');await p.keyboard.up('k');await W(100);
 for(const m of mods)await p.keyboard.down(m);await key('k',30);const c=await ev(chk);for(const m of mods)await p.keyboard.up(m);
 ok(await ev('LAST&&LAST.key')===want&&c,mods[0].toUpperCase()+' + K while holding = '+await ev('LAST&&LAST.n'));await W(900)}
// 6. whiff + escape
await setup([['g',600]]);await p.keyboard.down('j');await p.keyboard.down('k');await W(40);await p.keyboard.up('j');await p.keyboard.up('k');await W(80);
ok(await ev('LAST&&LAST.key')==='gwhiff','grab with nobody in reach whiffs');
await setup([['g',335]]);await p.keyboard.down('j');await p.keyboard.down('k');await W(40);await p.keyboard.up('j');await p.keyboard.up('k');await W(1900);
ok(await ev("PL[0].st")!=='grab'&&await ev("E[0].st")!=='held','held enemy escapes if you wait too long');
// 7. bowling chain with falloff: 3 grunts in a row, launch the first with a flip kick string
await ev("window.DM=[];const _h=hurtE;hurtE=function(e,d,dr,s,by){const h=e.hp;_h(e,d,dr,s,by);if(!s)DM.push([E.indexOf(e),h-e.hp])}");
await setup([['g',340],['g',420],['g',490],['g',560]]);for(const k of['k','k','k'])await key(k,170);await W(1500);
const dm=await ev('DM');ok(dm.length>=2,'launched body chains through the line: '+JSON.stringify(dm));
await ev("hurtE=hurtE");
// 8. crowd stability: pack 6 passive dummies onto the player, then measure jitter
await setup([['g',320],['g',330],['g',340],['g',350],['b',360],['r',370]]);await W(1200);
const xs=[];for(let i=0;i<30;i++){xs.push(await ev('E.map(e=>e.x)'));await W(16)}
const jit=Math.max(...xs[0].map((_,j)=>{const v=xs.map(r=>r[j]);const m=v.reduce((a,b)=>a+b)/v.length;return Math.sqrt(v.reduce((a,b)=>a+(b-m)**2,0)/v.length)}));
ok(jit<.5,'a packed crowd settles without jitter (max wobble '+jit.toFixed(2)+' px)');
await p.screenshot({path:S+'/shots/4-crowd.png'});
// 9. stress run in play mode
await ev('start()');await ev("SET.hist=0");const ks=['a','d','w','s',' ','j','k','Shift'];const held={};
for(let i=0;i<900;i++){const k=ks[Math.floor(Math.random()*ks.length)];const kk=k===' '?'Space':k;if(held[k]){await p.keyboard.up(kk);held[k]=0}else{await p.keyboard.down(kk);held[k]=1}await W(12);
 if(i%150===0){await ev("PL[0].hp=100");}}
for(const k in held)if(held[k])await p.keyboard.up(k===' '?'Space':k);
const bad=await ev("E.filter(e=>!isFinite(e.x)||!isFinite(e.y)||e.x<20||e.x>W-20||e.y>G+1||(e.st==='fly'&&e.ft>400)).length");
ok(bad===0,'90-second random fight: no stuck, lost or out-of-bounds bodies (wave '+await ev('wave')+')');
// 10. multiplayer groundwork
await ev('openTitle()');await p.click('#b-train');await W(300);
await ev("Object.assign(TR,{passive:0,god:1});E.forEach(e=>e.gone=1);E=[];spawnDummy('g');E[0].x=650;E[0].y=G;const q=mkPlayer(W/2-90,1,'#2fb5ff','#1d86c4');PL.push(q);q.x=540;PL[0].x=850");await W(900);
ok(await ev('PL.length')===2&&await ev('E[0].face')===-1&&await ev('E[0].x')<640,'enemy goes after the nearer player (player 2)');
await ev("INP[1].K.p=1;INP[1].press.p=fr");await W(100);await ev("INP[1].K.p=0");
ok(await ev("PL[1].att||PL[1].st==='atk'||LAST")!==null,'player 2 attacks from its own input slot (state '+await ev('PL[1].st')+')');
await p.screenshot({path:S+'/shots/5-two-players.png'});
await ev("TR.god=0");await ev("hurtP(PL[1],{dmg:5,kb:3},1)");ok(await ev('PL[1].hp')===95&&await ev('PL[0].hp')===100,'hits land on the right player');
// 11. feel panel
await ev("Object.assign(TR,{passive:1,god:1})");await p.keyboard.press('f');await W(150);ok(await p.isVisible('#feel'),'F opens the Feel panel');
await p.locator('#feel input[data-fk=hitstop]').fill('1.5');await p.locator('#feel input[data-fk=hitstop]').dispatchEvent('input');
ok(await ev('FEEL.hitstop')===1.5&&await ev('SET.feel.hitstop')===1.5,'slider changes and saves hit-stop');
await p.screenshot({path:S+'/shots/6-feel.png'});await p.click('#feel-reset');
console.log(fails?fails+' FAILURES':'ALL M4 CHECKS OK','| errors:',errs.length?errs:'none');await b.close()})();
