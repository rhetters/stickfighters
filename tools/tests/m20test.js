const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M20: Ron's list. Your own levels end on the victory screen; the NO XP sticker leaves with the room; bodies land on
// the Skyscraper's floors; cars keep their model through a boss's entrance, take damage, double jump, bump with the
// hood and trunk, glow with Surge and have a ULT each; DELETE THIS FIGHTER under the polaroid; the Unicorn; a door
// two squares high; furniture by room, sitting and lying on it; Versus and Arcade stages; colours per item.
const {chromium,devices}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext(devices['iPad (gen 7) landscape']);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
// an old save (version 18): its fighter and things must come through, with no colours yet
await p.goto(GAME);await p.waitForTimeout(300);
await p.evaluate(()=>localStorage.setItem('orangeArmy.v1',JSON.stringify({saveVersion:18,set:{tut:1},eco:{stars:600,got:600,own:['hat-cap','trail-ice'],seen:[]},chr:{cur:0,list:[{name:'RHETT',col:'col-orange',eq:{hat:'hat-cap',surge:'trail-ice'},wheel:['pose-flex']},null,null,null]}})));
await p.reload();await p.waitForTimeout(400);
const ev=x=>p.evaluate(x);
ok(await ev("ECO.stars===600&&ECO.own.includes('hat-cap')&&CHR.list[0].name==='RHETT'&&JSON.stringify(ECO.tint)==='{}'&&JSON.stringify(normFighter(CHR.list[0]).tint)==='{}'"),'a version 18 save comes through whole, with no colours bought yet');
// ===== colours per item =====
ok(await ev("TINTS.length===16&&PAINTS.length===8&&PAINTS.map(p=>p.id).join()==='body,head,neck,upper,lower,surge,poses,pets'"),'COLORS: sixteen colours and eight kinds');
ok(await ev("(()=>{const s0=ECO.stars;const a=buyTint('hat-cap','blue'),again=buyTint('hat-cap','blue'),notMine=buyTint('hat-tophat','blue');return a&&!again&&!notMine&&ECO.stars===s0-TINT_PRICE&&tintOwns('hat-cap','blue')&&!tintOwns('face-ninja','blue')})()"),'a colour is bought for one item, once, only for an item you own');
ok(await ev("(()=>{const f=normFighter({...CHR.list[0],tint:{'hat-cap':'blue','trail-ice':'red'}});const L=lookRaw(f);return f.tint['hat-cap']==='blue'&&!f.tint['trail-ice']&&L.hat.c===TINT.blue.c&&L.hat.id==='hat-cap'})()"),'a fighter wears only colours bought; the look draws the item in it');
ok(await ev("(()=>{buyTint('trail-ice','pink');buyTint('pose-flex','gold');const L=lookRaw(normFighter({...CHR.list[0],tint:{'trail-ice':'pink','pose-flex':'gold'}}));return L.surge.tc===TINT.pink.c&&L.surge.fx==='snow'&&[0,1,2].every(i=>[TINT.pink.c,shade(TINT.pink.c,0.35)].includes(surgeCol(L,i)))&&L.ptint['pose-flex']===TINT.gold.c})()"),'a Surge style takes its colour (ice keeps its snowflakes); a pose\'s colour is its glow');
ok(await ev("ITEMS.filter(i=>i.sec==='surge'&&i.fx).length===8"),'Surge styles have effects that take a colour');
// the screen: eight kinds in two rows of four; a kind's colours; try on, then buy
await ev("(()=>{titleOpenAll();openChar();chGo('colors')})()");await p.waitForTimeout(200);
ok(await ev("$('ch-cats').classList.contains('paints')&&$('ch-cats').querySelectorAll('[data-k^=\"paint-\"]').length===8&&getComputedStyle($('ch-cats')).gridTemplateColumns.split(' ').length===4"),'COLORS shows the eight kinds, four to a row');
await ev("$('ch-cats').querySelector('[data-k=\"paint-head\"]').click()");await p.waitForTimeout(150);
await ev("$('ch-cats').querySelector('[data-k=\"sec-hat\"]').click()");await p.waitForTimeout(150);
ok(await ev("$('ch-grid').querySelectorAll('[data-id^=\"tint-\"]').length===17&&$('ch-grid').querySelector('[data-id=\"cur-hat-cap\"]')"),'a kind: the item you wear at the top, then Original and every colour');
const s1=await ev("ECO.stars");await ev("$('ch-grid').querySelector('[data-id=\"tint-red\"]').click()");
ok(await ev("ECO.stars")===s1&&await ev("!!CH.tryTint&&previewFighter().hat.c===TINT.red.c"),'the first tap tries a colour on');
await ev("$('ch-grid').querySelector('[data-id=\"tint-red\"]').click()");
ok(await ev("ECO.stars")===s1-30&&await ev("normFighter(CHR.list[0]).tint['hat-cap']==='red'"),'the second tap buys it and wears it');
await ev("$('ch-grid').querySelector('[data-id=\"tint-none\"]').click()");
ok(await ev("!normFighter(CHR.list[0]).tint['hat-cap']&&tintOwns('hat-cap','red')"),'Original takes it off again (it stays yours)');
// ===== the Character screen: DELETE THIS FIGHTER under the polaroid, everywhere =====
const del=await ev("(()=>{const r=[];for(const t of [null,'body','head']){CH.tab=t;CH.paint=null;renderChar();const d=$('ch-del').getBoundingClientRect(),q=document.querySelector('.chpolar').getBoundingClientRect();r.push(d.width>0&&d.top>=q.bottom-4&&d.left<q.right)}return r})()");
ok(del.every(Boolean),'DELETE THIS FIGHTER sits under the polaroid on every page '+JSON.stringify(del));
// ===== the Unicorn =====
ok(await ev("ITEM['pet-unicorn']&&ITEM['pet-unicorn'].k==='unicorn'&&ITEM['pet-unicorn'].price>0"),'a Unicorn pet in the store');
// ===== your own levels: the victory screen =====
await ev("startCustom(normLevel({name:'RHETT LAND',places:[{b:'woods'}]}),'menu');cineEnd();for(const e of LV.encs)e.st=2;E.length=0;levelClear()");
await p.waitForTimeout(2200);
ok(await ev("SHOWN==='s-victory'&&/RHETT LAND CLEAR/.test($('v-h1').textContent)&&/PLAY AGAIN/.test($('v-again').textContent)&&/no XP/.test($('v-st').textContent)"),'your own level ends on the victory screen: PLAY AGAIN, no XP or stars');
await ev("openOnline()");await p.waitForTimeout(150);
ok(await ev("$('on-nostar').hidden"),'the NO XP sticker is not on the MULTIPLAYER screen outside a room');
// ===== the Skyscraper: a knocked-down body stays on its floor =====
const rg=await ev(`(()=>{SET.seed='9';startRun('city');cineEnd();E.length=0;for(const t of LV.trans)t.done=1;for(const e of LV.encs)if(e.fy===undefined)e.st=2;const S=LV.shaft;CAM.x=S.x0;const P=PL[0];P.x=S.x0+300;P.y=S.fys[0]-2;
 for(let i=0;i<200;i++){P.hp=P.max;fr++;update()}const e=E.find(e=>!e.dying);if(!e)return 'none';e.x=P.x+60;e.y=S.fys[0];hurtE(e,{dmg:5,kb:8,lift:-9,ef:'kd'},1,null,P);
 let low=-1e9;for(let i=0;i<90;i++){P.hp=P.max;fr++;update();if(e.rag)for(const q of e.rag.p)low=Math.max(low,q.y)}return {low:Math.round(low),floor:S.fys[0]}})()`);
ok(rg.low<=rg.floor+2,'up the Skyscraper a knocked-down body stays on the floor '+JSON.stringify(rg));
// ===== cars =====
const cr=await ev(`(()=>{SET.seed='5';startRun('city');cineEnd();E.length=0;LV.trans[0].done=1;for(const e of LV.encs)e.st=2;CAM.x=LV.trans[0].nx+200;const P=PL[0];P.x=CAM.x+300;fr++;update();carGive(P);fr++;update();const m=P.car.m;
 // a boss's entrance keeps you in your car; a car handed back is the same model
 LV.cine={k:'pencil',t:0};P.st='cine';carsTick();const kept=!!P.car;LV.cine=null;P.st='free';P.car=null;carGive(P);const same=P.car.m===m;
 // double jump
 setA('kb','j',1);fr++;update();setA('kb','j',0);for(let i=0;i<10;i++){fr++;update()}const y1=P.y;setA('kb','j',1);fr++;update();setA('kb','j',0);let top=P.y;for(let i=0;i<20;i++){fr++;update();top=Math.min(top,P.y)}
 for(let i=0;i<90;i++){fr++;update()}
 // the hood: an enemy in front is sent flying
 P.x=(WB.l+WB.r)/2;P.vx=0;fr++;update();E.length=0;spawn({t:'g',x:P.x+P.face*110});const e=E[0];e.y=G;e.st='free';e.x=P.x+P.face*110;setA('kb','p',1);fr++;update();setA('kb','p',0);for(let i=0;i<8;i++){fr++;update()}const hood=e.st==='fly'||e.hp<e.max;
 // the trunk: one behind
 for(let i=0;i<60;i++){fr++;update()}P.x=(WB.l+WB.r)/2;P.vx=0;fr++;update();E.length=0;spawn({t:'g',x:P.x-P.face*110});const e2=E[0];e2.y=G;e2.st='free';e2.x=P.x-P.face*110;setA('kb','k',1);fr++;update();setA('kb','k',0);for(let i=0;i<8;i++){fr++;update()}const trunk=e2.st==='fly'||e2.hp<e2.max;
 // Surge: glow, and a ram hits harder
 setA('kb','s',1);for(let i=0;i<10;i++){fr++;update()}const glow=P.car.sg;setA('kb','s',0);fr++;update();
 return {kept,same,dj:y1-top>40,hood,trunk,glow,ults:CARS.every(M=>CAR_ULTS[M.ult])}})()`);
ok(cr.kept&&cr.same,'a boss\'s entrance leaves you in your car, and your car is always your model');
ok(cr.dj,'cars jump again in the air');
ok(cr.hood&&cr.trunk,'Punch bumps the hood into whoever is in front, Kick the trunk into whoever is behind '+JSON.stringify([cr.hood,cr.trunk]));
ok(cr.glow&&cr.ults,'Surge makes the car glow; every model has its own ULT');
const ul=await ev(`(()=>{const P=PL[0],out={};for(let m=0;m<CARS.length;m++){P.car.m=m;P.car.ut=0;P.car.rot=0;P.car.tilt=0;P.x=(WB.l+WB.r)/2;P.y=G;P.vx=P.vy=0;E.length=0;for(let i=0;i<6;i++)spawn({t:'g',x:WB.l+80+i*140});for(const e of E){e.y=G;e.st='free'}
 for(let i=0;i<60&&(stop>0||P.y<G-1);i++){fr++;update()}P.meter=100;setA('kb','x',1);let used=false;for(let i=0;i<30&&!used;i++){fr++;update();used=P.meter===0&&P.car.ut>0}setA('kb','x',0);for(let i=0;i<240;i++){fr++;update();P.hp=P.max}out[CARS[m].ult]=used&&E.some(e=>e.hp<e.max||e.dying)&&!P.car.ut}return out})()`);
ok(Object.values(ul).every(Boolean),'ULT in a car (full meter): each model\'s move hits '+JSON.stringify(ul));
// ===== the house: a door two squares high, furniture by room, sitting and lying =====
const hs=await ev(`(()=>{const out={};for(const gap of [1,2]){const h={bg:null,cells:{},solids:{},floors:{},fills:{},climbs:{},sides:{},items:[]};for(let r=gap;r<7;r++)h.sides['6,'+r]='side';startHouse(h);const P=PL[0];P.x=3*45;P.y=G;for(let i=0;i<150;i++){setA('kb','r',1);fr++;update()}setA('kb','r',0);out[gap]=P.x>7*45}return out})()`);
ok(!hs[1]&&hs[2],'a gap two squares high under a wall can be walked through; one square can\'t '+JSON.stringify(hs));
ok(await ev("(()=>{const F=ITEMS.filter(i=>i.sec==='hfurn');const rooms=['living','bedroom','kitchen','dining','bathroom','attic'];return F.length>=30&&rooms.every(r=>F.filter(i=>i.room===r).length>=3)&&F.every(i=>rooms.includes(i.room))})()"),'furniture for every room, each piece in one');
await ev("(()=>{openHouse();HS.tab='hfurn';HS.room='bathroom';housePal()})()");
ok(await ev("$('hs-pal').querySelectorAll('.hsrooms button').length===7&&[...$('hs-pal').querySelectorAll('.chitem b')].map(b=>b.textContent).every(n=>ITEMS.find(i=>i.name===n&&i.room==='bathroom'))"),'the Furniture tab room buttons show just that room');
const us=await ev(`(()=>{startHouse({bg:null,cells:{},solids:{},floors:{},fills:{},climbs:{},sides:{},items:[{id:'hf-couch',x:2,y:0},{id:'hf-bed',x:7,y:0}]});const P=PL[0],r={};
 const go=(x,k)=>{P.x=x;P.y=G;P.vx=0;for(let i=0;i<5;i++){fr++;update()}setA('kb',k,1);fr++;update();setA('kb',k,0);for(let i=0;i<20;i++){fr++;update()}return P.use&&P.use.k};
 r.sit=go(3.2*45,'p');setA('kb','r',1);for(let i=0;i<20;i++){fr++;update()}setA('kb','r',0);r.stays=!!P.use;setA('kb','k',1);fr++;update();setA('kb','k',0);for(let i=0;i<20;i++){fr++;update()}r.up=!P.use;
 r.lie=go(8.5*45,'k');r.flat=Math.abs(P.pose[9])===90;setA('kb','p',1);fr++;update();setA('kb','p',0);for(let i=0;i<20;i++){fr++;update()}r.up2=!P.use;
 P.x=600;P.y=G;setA('kb','p',1);fr++;update();setA('kb','p',0);r.punch=!P.use&&!!P.att;return r})()`);
ok(us.sit==='sit'&&us.stays&&us.up,'Punch by the couch sits on it (you stay put), Kick gets up '+JSON.stringify(us));
ok(us.lie==='lie'&&us.flat&&us.up2,'Kick by the bed lies down on it, Punch gets up');
ok(us.punch,'away from furniture, Punch is a punch');
// ===== stages =====
ok(await ev("STAGES.length>=7&&new Set(STAGES.map(s=>s.id)).size===STAGES.length&&STAGES.every(s=>s.tag&&s.name&&(s.look==='paper'||LOOKS[s.look]))&&STAGES.filter(s=>s.move).length>=2"),'seven stages, two with a moving platform');
const st=await ev(`(()=>{const out={};ROSTER=[{slot:0,dev:'kb',col:'#ff7a00',name:'A'},{slot:1,dev:'pad0',col:'#3ec5ff',name:'B'}];for(const s of STAGES){STAGE_SEL=s.id;startVersus();for(let i=0;i<60;i++){fr++;update()}out[s.id]=STG.st.id===s.id&&TERRAIN.n===s.plats.length}ROSTER=[];return out})()`);
ok(Object.values(st).every(Boolean),'each stage builds in Versus '+JSON.stringify(st));
ok(await ev("(()=>{ROSTER=[{slot:0,dev:'kb',col:'#ff7a00',name:'A'},{slot:1,dev:'pad0',col:'#3ec5ff',name:'B'}];STAGE_SEL='?';SET.seed='12';startVersus();const a=STG.st.id;VS.round=2;vsRound();const b=STG.st.id;startVersus();const c2=STG.st.id;ROSTER=[];return a===b&&a===c2})()"),'a random stage comes from the seed, the same every round');
ok(await ev("(()=>{STAGE_SEL='rooftop';start();E.length=0;queue.length=0;const P=PL[0],s=STG.s[0];P.x=(s.x1+s.x2)/2;P.y=s.y1-2;P.vy=0;for(let i=0;i<5;i++){fr++;update()}const x0=P.x,s0=s.x1;for(let i=0;i<100;i++){fr++;update()}return P.surf===s&&Math.abs((P.x-x0)-(s.x1-s0))<1&&Math.abs(s.x1-s0)>50})()"),'Arcade on the Rooftop: whoever stands on the moving platform rides along');
ok(await ev("(()=>{openLobby();LB.mode='vs';renderLobby();const a=$('lb-sub').querySelectorAll('[data-stage]').length;LB.mode='arcade';renderLobby();const b=$('lb-sub').querySelectorAll('[data-stage]').length;$('lb-sub').querySelector('[data-stage=\"yard\"]').click();return a===7&&b===7&&STAGE_SEL==='yard'})()"),'the room picks a stage: five at a time, RANDOM and MY LEVELS (Versus and Arcade)');
ok(await ev("netRoomMsg().stage!==undefined"),'online, the room tells everyone the stage');
ok(errs.length===0,'no errors '+errs.join(' | '));
console.log(fails?fails+' FAILED':'ALL PASS');await b.close();process.exit(fails?1:0)})();
