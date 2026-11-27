const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
const {chromium}=require('playwright');
const S=process.argv[2];let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const p=await b.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>errs.push(e.message));
await p.goto(GAME);await p.evaluate("SET.tut=1");await p.waitForTimeout(150);await p.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await p.click('#b-train');await p.waitForTimeout(300);
const ev=x=>p.evaluate(x),W=ms=>p.waitForTimeout(ms);
const one=async(t,x,face,extra='')=>{await ev(`releaseAll();combo=0;PL[0].x=400;PL[0].y=G;PL[0].face=1;PL[0].st='free';PL[0].att=null;PL[0].vx=0;E.forEach(e=>e.gone=1);E=[];spawnDummy('${t}');Object.assign(E[0],{x:${x},y:G,vx:0,face:${face}});${extra}`);await W(150)};
// spawns
for(const [k,t] of [['4','u'],['5','f'],['6','c']]){await ev("E.forEach(e=>e.gone=1);E=[]");await p.keyboard.press(k);await W(500);ok(await ev(`E.some(e=>e.tk==='${t}')`),`training hotkey ${k} spawns ${t}`)}
await ev("TR.passive=1");await p.check('#t-passive').catch(()=>{});
await ev("E.forEach(e=>e.gone=1);E=[];['u','f','c','b','g','r'].forEach((t,i)=>{spawnDummy(t);Object.assign(E[E.length-1],{x:150+i*190,y:G})})");await W(900);
await p.screenshot({path:S+'/shots/m7-roster.png'});
// guard blocks from the front
await ev("TR.passive=1");await one('u',440,-1);const hp0=await ev("E[0].hp");await p.keyboard.press('j');await W(400);
const g1=await ev("({hp:E[0].hp,gm:E[0].gm,max:E[0].T.guard})");ok(g1.hp===hp0&&g1.gm<g1.max,`Guard blocks a punch from the front (hp ${g1.hp}/${hp0}, meter ${g1.gm.toFixed(1)}/${g1.max})`);
await one('u',440,1);const hp1=await ev("E[0].hp");await p.keyboard.press('j');await W(400);ok(await ev("E[0].hp")<hp1,'punch from behind the Guard lands');
ok(await ev("!blocks(E[0]={...E[0],face:-1,st:'free',noShield:0},PL[0],{dmg:5,top:40})"),'low hits go under the shield');
ok(await ev("!blocks(E[0],PL[0],{dmg:5,pierce:1})"),'Tornado Kick (pierce) cuts through the shield');
await one('u',440,-1);ok(await ev("blocks(E[0],PL[0],{dmg:5})"),'front hit on a ready guard = blocked');
await ev("for(let i=0;i<10&&E[0].noShield<=0;i++){E[0].st='free';block(E[0],{dmg:8,w:'H'},1,PL[0])}");
ok(await ev("E[0].noShield>0&&E[0].broken>0&&!blocks(E[0],PL[0],{dmg:5})"),'heavy hits drain the meter -> GUARD BREAK: dizzy, shield dropped, hits land');
await W(300);await p.screenshot({path:S+'/shots/m7-guardbreak.png'});
// grab works on a guard (no poise)
await one('u',440,-1);await ev("tryGrab(PL[0])");await W(100);ok(await ev("PL[0].st==='grab'||E[0].st==='held'||!!PL[0].held||!!PL[0].gr"),'Guard can be grabbed (st '+await ev("PL[0].st+'/'+E[0].st")+')');
// flanker gets behind
await ev("TR.passive=0");await one('f',700,-1);let behind=false,atkBack=false;
for(let i=0;i<60;i++){await ev("PL[0].x=400;PL[0].face=1;PL[0].vx=0");await W(80);const r=await ev("({bx:E[0]?E[0].x:999,st:E[0]?E[0].st:''})");if(r.bx<400)behind=true;if(r.bx<400&&r.st==='atk')atkBack=true;if(atkBack)break}
ok(behind,'Flanker works its way behind a player facing it');ok(atkBack,'Flanker attacks from behind');
await p.screenshot({path:S+'/shots/m7-flank.png'});
// director: 7 grunts, at most 2 swinging
await ev("releaseAll();PL[0].x=640;PL[0].st='free';E.forEach(e=>e.gone=1);E=[];for(let i=0;i<7;i++){spawnDummy('g');Object.assign(E[E.length-1],{x:i<4?200+i*40:900+i*40,y:G})}");
let maxA=0,maxT=0,minFar=0;for(let i=0;i<40;i++){await W(100);const r=await ev("({a:E.filter(e=>e.st==='atk').length,t:E.filter(e=>e.tok).length,far:E.filter(e=>!e.tok&&Math.abs(e.x-PL[0].x)>95).length})");maxA=Math.max(maxA,r.a);maxT=Math.max(maxT,r.t);if(i>20)minFar=Math.max(minFar,r.far)}
ok(maxA<=2&&maxT<=2,`director: at most 2 attack tokens / swings at once (saw ${maxA} attacking, ${maxT} tokens)`);ok(minFar>=3,`enemies without a token hold a standoff ring (${minFar} waiting >95 px out)`);
await p.screenshot({path:S+'/shots/m7-ring.png'});
// phase through -> ?! + chase
await one('g',460,-1);await ev("E[0].lastSide=1;PL[0].phase=10;PL[0].x=430");await W(120);ok(await ev("E[0].chase>0"),'Surge-phasing through an enemy -> ?! then it chases faster');
// captain
await ev("TR.passive=1");await one('c',700,-1);await W(200);await p.screenshot({path:S+'/shots/m7-captain.png'});
ok(await ev("E[0].T.boss==='CAPTAIN'&&E[0].bp===1"),'Captain spawns in phase 1');
await ev("TR.passive=0;E[0].hp=E[0].max*.5");await W(300);ok(await ev("E[0].bp===2"),'Captain enters phase 2 (ENRAGED) below 55% hp');
await p.screenshot({path:S+'/shots/m7-enraged.png'});
// quake hits grounded, not airborne
await ev("window.HITS=[];const _h=hurtP;hurtP=function(q,d,dr){HITS.push(d.dmg);return _h(q,d,dr)}");
await ev("TR.passive=1;PL[0].x=400;PL[0].y=G;PL[0].st='free';E[0].x=600;E[0].st='free';E[0].att=null;startAtk(E[0],EA.cquake)");await W(1500);
const hg=await ev("HITS.length");ok(hg>0,'Quake Leap hits a player standing on the ground ('+hg+' hit)');
await ev("HITS=[];PL[0].st='free';PL[0].att=null;PL[0].x=400;E[0].x=600;E[0].st='free';E[0].att=null;startAtk(E[0],EA.cquake);window.HOLD=setInterval(()=>{PL[0].y=G-140;PL[0].vy=0},5)");await W(1500);await ev("clearInterval(HOLD)");
ok(await ev("HITS.length")===0,'Quake Leap misses a player who is in the air');
// waves
const qs=await ev("[1,2,3,5,10].map(n=>makeQueue(n).join(''))");
ok(!/[uf]/.test(qs[0]),'wave 1: only grunts');ok(/u/.test(qs[1]),'wave 2 adds Guards');ok(/f/.test(qs[2])&&/b/.test(qs[2]),'wave 3 adds Flankers and Brutes');ok(qs[3].endsWith('c')&&qs[4].endsWith('c')&&!qs[2].includes('c'),'Captain arrives on waves 5 and 10');
// full play run
await p.goto(GAME);await p.evaluate("SET.tut=1");await p.waitForTimeout(150);await p.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await p.evaluate('openSolo()');await p.click('#b-start');await p.evaluate("SHOWN==='s-themes'&&THS.kind==='stage'&&THS.go('?')");await W(300);
await ev("wave=4;queue=[];E.forEach(e=>e.gone=1);E=[]");for(let i=0;i<60;i++){await p.keyboard.press(i%3?'j':'k');await W(100)}
await p.screenshot({path:S+'/shots/m7-play.png'});ok(await ev("wave>=5"),'play mode reaches wave '+await ev("wave"));
ok(errs.length===0,'no page errors '+errs.slice(0,3).join(' | '));
await b.close();console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})();
