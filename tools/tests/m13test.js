const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M13: campaign runs generated from a seed (Castle Siege and Pirate Cove), transitions, boss intros, mini-bosses
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
const play=async (seed,th='castle',again)=>{await ev(again?`$('b-again').click()`:`SET.seed='${seed}';titleOpenAll();startRun('${th}')`);await ev(`LV.encs[1].mini=BIOMES[LV.segs[0].b].mini.t;LV.encs[1].line='HI'`);const seen={};
 for(let i=0;i<900;i++){const st=await ev("(()=>{setA('kb','r',1);const P=PL[0];P.hp=P.max;let k='';const tw=nextTrans();if(tw&&tw.top&&!LV.cine&&P.x>tw.deck-500&&P.gy>tw.top+1&&!LV.encs.some(e=>e.st===1)){P.x=tw.deck+20;P.y=tw.top-2;P.vy=0}for(let n=0;n<30;n++){fr++;update();if(LV.cine)k=LV.cine.k;for(const e of E)if(!e.dying&&e.st!=='cine'&&LV.t%20===0){e.hp=0;hurtE(e,{dmg:1,kb:4,lift:-4,ef:'kd'},1,null,P)}for(const g of LV.gates)if(g.hp>0&&g.x-P.x<120)hurtGate(g,99)}return {k,state}})()");if(st.k)seen[st.k]=1;if(st.state!=='play')return {seen,state:st.state}}
 return {seen,state:'stuck'}};
const r1=await play(7),r2=await play(39);
ok(r1.state==='clear'&&r2.state==='clear','two runs play through to the end ('+r1.state+', '+r2.state+')');
const all={...r1.seen,...r2.seen};
ok(['drawin','rope','pipe','catapult','jump','pencil'].every(k=>all[k]),'scenes seen: '+Object.keys(all).join(', ')+' (and a gate smashed)');
await ev("setA('kb','r',0)");
ok(/CASTLE SIEGE CLEAR/.test(await ev("$('c-h1').textContent")),'the results say CASTLE SIEGE CLEAR!');
ok(await ev("PROG.woods1&&PROG.woods1.done"),'getting through the woods counts as the Wooded Trail (Ranger Hat)');
// PLAY AGAIN after clearing a run: a fresh run, and every scene plays again (opening draw-in, transitions, boss intro)
const r3=await play(0,'castle',1);
ok(r3.state==='clear'&&r3.seen.drawin&&r3.seen.jump&&r3.seen.pencil,'after a clear, PLAY AGAIN plays every scene again: '+Object.keys(r3.seen).join(', '));
// Pirate Cove: beach, ship, cave; Captain Pinkbeard leaps in; the cannon only on the ship's side; no castle gate
ok(await ev("(()=>{const L=genRun('pirate',5);return L.segs.map(s=>s.b).join()==='beach,ship,cave'&&L.encs[15].boss==='P'&&L.encs[15].intro==='jump'})()"),'Pirate Cove: beach, ship, cave and Captain Pinkbeard at the end');
const pk=await ev("(()=>{const o={};for(let s=1;s<200;s++)for(const t of genRun('pirate',s).trans){o[t.k]=(o[t.k]||0)+1;if(t.k==='cannon'&&t.from!=='ship'&&t.to!=='ship')o.bad=1}for(let s=1;s<200;s++)for(const t of genRun('castle',s).trans)if(t.k==='cannon')o.bad=1;return o})()");
ok(pk.cannon>10&&!pk.bad&&!pk.gate&&!pk.pipe,'pirate transitions (cannon only next to the ship; no gate or pipe): '+JSON.stringify(pk));
const r4=await play(1,'pirate');
ok(r4.state==='clear'&&r4.seen.cannon&&r4.seen.jump,'a Pirate Cove run plays through with the cannon and the leap-in: '+Object.keys(r4.seen).join(', '));
await ev("setA('kb','r',0)");
ok(/PIRATE COVE CLEAR/.test(await ev("$('c-h1').textContent")),'the results say PIRATE COVE CLEAR!');
// Mountain: meadow, mountainside, peak; the Pink Yeti; its own transitions (each theme draws from its own list)
ok(await ev("(()=>{const L=genRun('mountain',5);return L.segs.map(s=>s.b).join()==='meadow,slope,peak'&&L.encs[L.encs.length-1].boss==='Y'&&L.encs[L.encs.length-1].intro==='jump'})()"),'Mountain: meadow, mountainside, snowy peak and the Pink Yeti at the end');
ok(await ev("(()=>{for(const id in THEMES)for(let s=1;s<150;s++)for(const t of genRun(id,s).trans)if(!THEMES[id].trans.includes(t.k))return id+' '+t.k;return true})()")===true,'every theme only uses the transitions on its own list');
const mk=await ev("(()=>{const o={};for(let s=1;s<200;s++)for(const t of genRun('mountain',s).trans)o[t.k]=(o[t.k]||0)+1;return o})()");
ok(['gondola','balloon','climb','rope'].every(k=>mk[k]>10),'Mountain transitions all come up: '+JSON.stringify(mk));
// the mountainside climbs: slopes only there, starting a screen in, and every fight on a flat ledge
ok(await ev("(()=>{for(let s=1;s<60;s++){const L=genRun('mountain',s),sg=L.segs[1];if(!L.ramps||!L.ramps.every(r=>r.x0>=sg.x0+900&&r.x1<=sg.x1&&r.x1>r.x0))return false;for(const e of L.encs)if(L.ramps.some(r=>r.x1>e.lock&&r.x0<e.lock+W))return false;if(genRun('castle',s).ramps||genRun('pirate',s).ramps)return false}return true})()"),'slopes only on the mountainside, a screen in from its start, never under a fight');
ok(await ev("(()=>{const L=genRun('mountain',6);return L.ramps.reduce((a,r)=>a+(r.x1-r.x0)*r.k,0)>400})()"),'and you climb a long way up it');
for(const sd of [6,10]){const r=await play(sd,'mountain');ok(r.state==='clear','a Mountain run plays through (seed '+sd+'): '+Object.keys(r.seen).join(', '));Object.assign(all,r.seen)}
ok(['gondola','balloon','climb'].every(k=>all[k]),'the gondola, the balloon and the cliff climb all played');
await ev("setA('kb','r',0)");
// the slope is drawing only: the same fight on the mountainside plays the same with or without it
const flat=await ev("(()=>{const go=keep=>{SET.seed='6';startRun('mountain');cineEnd();if(!keep)LV.ramps=null;const s=LV.segs[1];CAM.x=s.x0+1500;PL[0].x=CAM.x+200;setA('kb','r',1);for(let n=0;n<400;n++){fr++;update();render()}setA('kb','r',0);return Math.round(PL[0].x)+','+E.length+','+rnd()};return go(1)===go(0)})()");
ok(flat,'the climb is only drawn: the game plays the same on the slope as on flat ground');
// Space: launch base, the rocket, the moon; the Pink Alien beamed down; the launch tower's platforms
ok(await ev("(()=>{const L=genRun('space',5);return L.segs.map(s=>s.b).join()==='base,rocket,moon'&&L.trans.map(t=>t.k).join()==='launch,landing'&&L.encs[L.encs.length-1].boss==='Z'&&L.encs[L.encs.length-1].intro==='beam'&&L.terr&&L.terr.s.length===4&&!genRun('castle',5).terr})()"),'Space: launch base, rocket, moon, the launch then the landing, the Pink Alien, and platforms only there');
// climbing the tower with ordinary jumps: from the ground to each platform and onto the top deck, which starts the launch
const climb=await ev(`(()=>{SET.seed='3';titleOpenAll();startRun('space');cineEnd();LV.encs.forEach((e,i)=>{if(i<5)e.st=2});const tw=LV.trans[0],o=tw.x-1110;CAM.x=tw.x-W+260;levelWalls();const P=PL[0];P.x=o+520;P.y=G;
 const S=LV.terr.s,out=[];let cy=0;const step=n=>{for(let i=0;i<n;i++){fr++;update();cy=Math.min(cy,CAM.y)}};const key=(k,v)=>setA('kb',k,v);
 for(const s of S){let tries=0;const mid=(s.x1+s.x2)/2,last=s===S[3];while(Math.abs(P.gy-s.y1)>1&&tries++<6){const cu=P.surf,cx=cu?Math.max(cu.x1+12,Math.min(cu.x2-12,mid)):Math.min(mid,o+735);
   for(let i=0;i<120&&Math.abs(P.x-cx)>8;i++){key(P.x<cx?'r':'l',1);key(P.x<cx?'l':'r',0);step(1)}key('l',0);key('r',0);step(4);
   key('j',1);step(2);key('j',0);const tx=last?s.x1+90:mid;for(let i=0;i<80;i++){const d=tx-P.x;key('r',d>6?1:0);key('l',d<-6?1:0);step(1);if(P.vy===0&&P.y>=P.gy-0.5&&i>5)break}key('l',0);key('r',0);step(2)}
   out.push(P.gy===s.y1)}
 const camUp=cy<-150;key('r',1);step(30);key('r',0);return {out,camUp,cine:LV.cine&&LV.cine.k}})()`);
ok(climb.out.every(x=>x),'the launch tower can be climbed with ordinary jumps, platform by platform: '+JSON.stringify(climb.out));
ok(climb.camUp&&climb.cine==='launch','the camera rises with you, and stepping onto the top deck starts the launch '+JSON.stringify(climb));
ok(await ev("(()=>{SET.seed='3';startRun('space');cineEnd();const tw=LV.trans[0],o=tw.x-1110;CAM.x=tw.x-W+260;levelWalls();const P=PL[0];P.x=o+700;P.y=G;setA('kb','r',1);for(let i=0;i<60;i++){fr++;update()}setA('kb','r',0);return P.x<o+750&&!LV.cine})()"),'you cannot walk in under the tower from the ground');
const r5=await play(3,'space');
ok(r5.state==='clear'&&r5.seen.launch&&r5.seen.landing&&r5.seen.beam,'a Space run plays through: '+Object.keys(r5.seen).join(', '));
await ev("setA('kb','r',0)");
ok(await ev("BIOMES.moon.helmet===1&&!BIOMES.base.helmet&&!BIOMES.rocket.helmet"),'bubble helmets on the moon only');
ok(await ev("(()=>{const all=[...Object.values(BIOMES).map(b=>b.mini.lines),...Object.values(THEMES).map(t=>t.boss.lines)].flat();return all.length>10&&all.every(l=>!/ORANGE/i.test(l))})()"),'no line says ORANGE (players rename their fighters)');
// the opening draw-in: every player is drawn by the pencil, then the sketches are gone for good
await ev("SET.seed='7';titleOpenAll();startRun('castle');for(let n=0;n<30;n++){fr++;update()}");
ok(await ev("LV.cine&&LV.cine.k==='drawin'&&PL.every(p=>p.st==='cine'&&p.draw!==undefined)"),'a run opens with the pencil drawing everyone in');
await ev("for(let n=0;n<300&&LV.cine;n++){fr++;update()}");
ok(await ev("!LV.cine&&PL.every(p=>p.st!=='cine'&&p.draw===undefined&&p.ink===undefined)"),'then everyone can move and no sketch is left behind');
// the Campaign screen: one card a theme, a card starts that theme, BACK goes home
await ev("show('s-title');$('b-level').click()");
ok(await ev("!$('s-themes').hidden&&$('th-cards').querySelectorAll('.thcard').length===Object.keys(THEMES).length"),'CAMPAIGN opens a screen with a card for each theme');
await ev("$('th-back').click()");
ok(await ev("!$('s-title').hidden&&$('s-themes').hidden"),'BACK returns to the title');
await ev("$('b-level').click();$('th-cards').querySelectorAll('.thcard')[1].click()");
ok(await ev("MODE===LEVEL&&LV.run&&LV.run.theme==='pirate'"),'picking the second card starts Pirate Cove');
// the pencil intro: everyone frozen, the boss can't be hit until it ends
await ev("SET.seed='7';startRun('castle');cineEnd();const ne=LV.encs[15];LV.encs.forEach((e,i)=>{if(i<15)e.st=2});LV.trans.forEach(t=>t.done=1);CAM.x=ne.lock;PL[0].x=CAM.x+300;LV.gates.forEach(g=>g.hp=0)");
await ev("for(let n=0;n<5;n++){fr++;update()}");
ok(await ev("LV.cine&&LV.cine.k==='pencil'&&PL[0].st==='cine'&&E[0].tk==='G'&&E[0].inv>100"),'the Pink General is drawn in while everyone waits (and cannot be hit)');
await ev("for(let n=0;n<160;n++){fr++;update()}");
ok(await ev("PL[0].st!=='cine'&&LV.say&&LV.say.txt.length>3"),'then he comes to life and talks: '+await ev("LV.say&&LV.say.txt"));
await ev("for(let n=0;n<80;n++){fr++;update()}");
ok(await ev("!LV.cine&&E[0].st!=='cine'&&E[0].inv===0"),'and the fight starts');
// the jump intro knocks everyone down
await ev("SET.seed='7';startRun('castle');cineEnd();const ne=LV.encs[0];ne.mini='mw';ne.line='HI';CAM.x=ne.lock;PL[0].x=CAM.x+200;for(let n=0;n<40;n++){fr++;update()}");
ok(await ev("E.some(e=>e.tk==='mw')&&['fly','down','getup'].includes(PL[0].st)"),'a mini-boss leaps in and knocks everyone down ('+await ev('PL[0].st')+')');
// a slippery sewer floor
const slide=await ev("(()=>{const r={};for(const b of ['woods','sewer']){SET.seed='7';startRun('castle');const s=LV.segs.find(x=>x.b===b);CAM.x=s.x0+1200;PL[0].x=CAM.x+100;E=[];const e=F(CAM.x+400,'g',0);e.y=G;E.push(e);e.st='down';e.dt=60;e.vx=10;WB.l=WW.l=-1e9;WB.r=WW.r=1e9;for(let n=0;n<20;n++){e.st='down';e.dt=60;updE(e)}r[b]=+e.vx.toFixed(2)}return r})()");
ok(slide.sewer>slide.woods*1.5,'bodies keep sliding on the sewer floor (speed after 20 frames): '+JSON.stringify(slide));
// a new run each time (no fixed seed)
ok(await ev("(()=>{SET.seed='';startRun('castle');const a=LV.run.seed;replayLevel();return a!==LV.run.seed})()"),'PLAY AGAIN makes a new run');
await p.screenshot({path:S+'/shots/m13.png'});
{const st=await ev('JSON.stringify(selfTest())');ok(JSON.parse(st).hash===await ev('SELFTEST_EXPECT.arcade'),'self-test unchanged '+st)}
ok(errs.length===0,'no errors '+errs.join(' | '));console.log(fails?fails+' FAILED':'ALL PASS');await b.close()})();
