const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M16: music and sound, difficulty, the tutorial, the new character screen, colour help, bigger text, the save
const {chromium,devices}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const errs=[];
const c=await b.newContext(devices['iPad (gen 7) landscape']);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(GAME);await p.waitForTimeout(300);
const ev=x=>p.evaluate(x),W=t=>p.waitForTimeout(t);
// the save
ok(await ev("(()=>{const m=migrate({saveVersion:13,set:{vol:0.4}});return m.saveVersion===SAVE_VERSION&&m.set.mus===0.6&&m.set.diff===1&&m.set.tut===1&&m.set.vol===0.4})()"),'save version 14: Music volume, Normal difficulty, and an older save never gets the tutorial offer');
ok(await ev("SET.tut===0&&SET.diff===1&&SET.mus===0.6"),'a new player: Normal, music on, the tutorial not offered yet');
// music: every song is well formed, and the right one plays for what's on screen
ok(await ev("Object.values(MUSIC).every(s=>{const bar=(s.beats||4)*(s.div||4);return s.parts.every(q=>(q.mel||q.pat.split('|')).every(x=>x.trim().split(/\\s+/).length===bar)&&(!q.mel||q.mel.length===s.prog.length))})"),'every song: each bar has the right number of steps, each tune one bar per chord');
ok(await ev("Object.keys(BIOMES).every(b=>MUSIC[b])&&new Set(Object.keys(BIOMES).map(b=>JSON.stringify(MUSIC[b].prog)+MUSIC[b].bpm)).size===Object.keys(BIOMES).length&&!!(MUSIC.menu&&MUSIC.boss&&MUSIC.victory&&MUSIC.arcade&&MUSIC.training&&MUSIC.over)"),'a different song for every biome (all 15), the menus, bosses, Arcade and Versus, training, victory and game over');
await p.mouse.click(600,400);await W(400);
ok(await ev("AUD.on&&AC.state==='running'&&MUS.cur&&MUS.cur.id==='menu'"),'the first tap starts the sound; the menu tune plays');
await ev("SET.tut=1;titleOpenAll();startRun('pirate');cineEnd()");await W(500);
ok(await ev("MUS.cur&&MUS.cur.id==='go'&&MUS.cur.then==='beach'"),'starting a game: the "here we go" jingle, then straight into the place\'s song');
await W(3000);
ok(await ev("MUS.cur.id==='beach'&&MUS.lvl===0&&AMBS.look==='beach'"),'then the Sunny Beach plays its own song (calm while walking) and its background sound');
await ev("const ae=LV.encs[0];CAM.x=ae.lock;PL[0].x=ae.x;for(let i=0;i<5;i++){fr++;update()}");await W(300);
ok(await ev("LV.encs.some(e=>e.st===1)&&MUS.lvl===1"),'a fight turns the music up');
await ev("const sg=LV.segs[1];LV.encs.forEach(e=>{if(e.x<sg.x0+1500)e.st=2});const tr=LV.trans[0];window._tk=tr.k;cineStart(tr.k,{tr})");await W(300);
ok(await ev("MUS.cur.id==='tr-'+_tk&&MUS.cur.then==='ship'"),'the scene to the Pirate Ship plays its own little jingle');
await ev("cineEnd();LV.trans[0].done=1;const sg=LV.segs[1];CAM.x=sg.x0+300;PL[0].x=CAM.x+300;for(let i=0;i<3;i++){fr++;update()}");await W(3200);
ok(await ev("MUS.cur.id==='ship'&&MUS.want==='ship'"),'then straight into the Pirate Ship\'s own song');
ok(await ev("Object.keys(TRANSITIONS).every(k=>MUSIC['tr-'+k]&&MUSIC['tr-'+k].sting&&MUSIC['tr-'+k].end*60/MUSIC['tr-'+k].bpm/(MUSIC['tr-'+k].div||4)<3.6)&&new Set(Object.keys(TRANSITIONS).map(k=>JSON.stringify(MUSIC['tr-'+k].parts[0].mel))).size===Object.keys(TRANSITIONS).length"),'every transition (catapult, pipe, rope…) has its own short jingle');
await ev("const bi=LV.encs.length-1;LV.encs.forEach((e,i)=>{if(i<bi)e.st=2});LV.trans.forEach(t=>t.done=1);CAM.x=LV.encs[bi].lock;PL[0].x=LV.encs[bi].x-200;for(let i=0;i<10;i++){fr++;update()}");await W(400);
ok(await ev("MUS.cur.id==='bossin'&&MUS.cur.then==='boss'"),'a boss arrives: a dark drum roll first');
await W(5600);ok(await ev("MUS.cur.id==='boss'&&MUS.lvl===2"),'then the boss has his own music');
await ev("show('s-victory')");await W(1600);ok(await ev("MUS.cur.id==='victory'"),'the victory fanfare');
ok(await ev("!musTrans('boss','beach').sting&&(()=>{LV.encs[LV.encs.length-1].st=2;return musTrans('boss','beach').sting==='bosswin'})()"),'after a boss: a "ta-da" when he was beaten, none when you were knocked out');
await ev("openChar()");await W(3200);ok(await ev("MUS.want==='dressup'&&MUS.cur&&MUS.cur.id==='dressup'"),'the Character screen has its own song');
await ev("closeChar();openHouse()");await W(2000);ok(await ev("MUS.want==='house'&&MUS.cur&&MUS.cur.id==='house'&&musWant()[0]==='house'"),'and so does the house builder');
await ev("closeHouse()");
ok(await ev("(()=>{const t=['beach','menu','dressup','arcade','over'].flatMap(a=>['menu','house','beach','arcade'].map(b=>musTrans(a,b)));return t.every(x=>!('gap' in x))&&musTrans('menu','arcade').sting==='go'&&musTrans('beach','ship').sting==='tr-gate'})()"),'never a silent gap between songs; Arcade starts with the "here we go" jingle; a smashed gate has its own');
await ev("pause(false);openTitle()");await W(300);
ok(await ev("selfTest().hash===SELFTEST_EXPECT.arcade"),'self-test unchanged with sound on (sound only watches the game)');
// difficulty
const d=await ev("(()=>{const r=[];for(const v of [0,1,2]){SET.diff=v;init();MODE=ARCADE;const e=F(300,'g',0);r.push(e.hp)}SET.diff=1;return r})()");
ok(d[0]<d[1]&&d[1]<d[2],'Easy, Normal, Hard: enemy health '+d.join(' / '));
ok(await ev("DIFFS[0].dmg<1&&DIFFS[0].rv<DIFFS[1].rv&&DIFFS[0].heal>DIFFS[1].heal&&DIFFS[0].tok<0&&DIFFS[2].dmg>1&&JSON.stringify(DIFFS[1])==JSON.stringify({id:'normal',name:'NORMAL',hp:1,dmg:1,cd:1,spd:1,tok:0,rv:120,heal:25})"),'Easy is more than weaker enemies (less damage, fewer attackers, quicker revives, more health back); Normal is the game as before');
await ev("openSolo()");await W(150);
ok(await ev("$('solo-diff').children.length===3&&$('solo-diff').querySelector('.on').dataset.diff==='1'"),'the Solo screen has EASY / NORMAL / HARD tiles');
await ev("$('solo-diff').children[0].click()");ok(await ev("SET.diff===0&&$('solo-diff').querySelector('.on').dataset.diff==='0'"),'tapping EASY picks it (and keeps it)');
ok(await ev("(()=>{MODE=VERSUS;const v=diffOf().id;MODE=ARCADE;return v==='normal'&&diffOf().id==='easy'})()"),'Versus is always Normal');
ok(await ev("(()=>{NET.diff=2;const r=netRoomMsg().diff===2;NET.diff=1;return r})()"),'the room tells everyone the host\'s difficulty');
ok(await ev("(()=>{NET.match=true;NET.diff=2;const v=diffOf().id;NET.match=false;NET.diff=1;return v==='hard'})()"),'online, everyone plays the host\'s difficulty');
await ev("SET.diff=1;openLobby();LB.mode='level';renderLobby()");await W(150);
ok(await ev("$('lb-diff').children.length===3"),'the local room has the difficulty tiles for Story');
await ev("LB.mode='vs';renderLobby()");ok(await ev("$('lb-diff').children.length===0"),'and none for Versus');
// the tutorial
await ev("SET.tut=0;openSolo();$('b-start').click()");await W(150);
ok(await ev("!$('s-learn').hidden&&SET.tut===1"),'the first time Story or Arcade is started, it offers to learn the moves first');
await ev("$('ln-learn').click()");await W(300);
ok(await ev("TUT.on&&state==='train'&&document.body.classList.contains('tut')"),'LEARN THE MOVES opens the tutorial in the Training Room');
const tap=async(k,n=70)=>{await ev(`setA('kb','${k}',1)`);await W(n);await ev(`setA('kb','${k}',0)`);await W(110)};
const near="PL[0].x=E[0].x-50;PL[0].face=1;PL[0].y=G";
await ev("setA('kb','r',1)");await W(1400);await ev("setA('kb','r',0)");await W(1100);
ok(await ev("TUT.i===1"),'moving does the first step');
await tap('j',120);await W(1200);ok(await ev("TUT.i===2"),'jumping the next');
for(let i=0;i<4;i++){await ev(near);await tap('p')}await W(1200);ok(await ev("TUT.i===3"),'punching the dummy');
for(let i=0;i<3;i++){await ev(near);await tap('k')}await W(1300);ok(await ev("TUT.i===4"),'kicking it (and a combo isn\'t counted before its step)');
for(let i=0;i<6;i++){await ev(near);await tap('p',50)}await W(1300);ok(await ev("TUT.i===5"),'a combo');
await ev("PL[0].x=200;setA('kb','s',1);setA('kb','r',1)");await W(1300);await ev("setA('kb','s',0);setA('kb','r',0)");await W(1300);ok(await ev("TUT.i===6"),'a Surge run');
await ev(near);await ev("setA('kb','p',1);setA('kb','k',1)");await W(100);await ev("setA('kb','p',0);setA('kb','k',0)");await W(1400);
ok(await ev("TUT.i===7"),'and a grab: YOU\'RE READY!');
ok(await ev("tutDev()==='touch'&&tutKey('p')==='PUNCH'&&(()=>{$('wrap').classList.remove('touch-on');const k=tutKey('p')==='J'&&tutKey('j')==='Space';applyTouchVis();return k})()"),'the card names the buttons you play with (touch buttons on the iPad, your keys on a keyboard)');
await ev("pause(true)");ok(await ev("!!$('b-moves')"),'Pause has MOVES');await ev("$('b-moves').click()");await W(150);
ok(await ev("!$('s-moves').hidden&&$('pm-list').querySelectorAll('tr').length>20"),'MOVES shows the move list');
await ev("$('pm-back').click()");ok(await ev("!$('s-pause').hidden"),'and BACK returns to Pause');
await ev("pause(false);openTitle()");await W(200);ok(await ev("!TUT.on&&!document.body.classList.contains('tut')"),'leaving the Training Room ends the tutorial');
// the character screen
await ev("saveFighter(0,{...FIGHTER0});CHR.cur=0;openChar()");await W(200);
ok(await ev("!!document.querySelector('#s-char .chpolar #ch-prev')&&!!document.querySelector('.chpolar #ch-name')&&!!document.querySelector('.chpolar #ch-skills')"),'the fighter, their name and the skills badge are on a polaroid');
ok(await ev("$('ch-cats').children.length===TABS.length&&[...$('ch-cats').querySelectorAll('.pimg')].every(i=>/url\\(data:image/.test(i.style.getPropertyValue('--ic')))"),'the store opens on a picture tile for every part of the body, each with its picture');
await ev("document.querySelector('[data-k=tab-lower]').click()");
ok(await ev("CH.tab==='lower'&&!CH.sec&&$('ch-cats').children.length===5&&/LOWER BODY/.test($('ch-path').textContent)&&!$('ch-nav').hidden"),'LOWER BODY opens its kinds: pants, shorts, skirts, dresses, shoes');
await ev("document.querySelector('[data-k=sec-shorts]').click()");
ok(await ev("CH.sec==='shorts'&&!$('ch-grid').hidden&&$('ch-grid').querySelectorAll('.chitem').length===ITEMS.filter(i=>i.sec==='shorts').length+1"),'SHORTS opens a shelf of every pair of shorts (and None)');
await ev("chUp()");ok(await ev("CH.tab==='lower'&&!CH.sec"),'BACK goes up to the kinds');await ev("chUp()");ok(await ev("!CH.tab&&!$('ch-nav').hidden===false"),'and up to the parts of the body');
await ev("chGo('colors')");ok(await ev("!$('ch-grid').hidden&&$('ch-grid').querySelectorAll('.chitem').length===ITEMS.filter(i=>i.sec==='color').length"),'a part with only one kind (Colors) goes straight to its shelf');
await ev("chGo('body')");ok(await ev("!$('ch-body').hidden&&$('ch-grid').hidden"),'BODY opens the body settings');
ok(await ev("(()=>{const c=fighterNow();c.prog.xp=0;saveFighter(0,c);renderChar();const a=!$('ch-skills').classList.contains('has');c.prog.xp=5000;saveFighter(0,c);renderChar();return a&&$('ch-skills').classList.contains('has')&&!$('ch-pts').hidden&&getComputedStyle($('ch-skills')).animationName==='skglow'})()"),'the skills badge glows when there are points to spend');
await ev("$('ch-skills').click()");await W(150);ok(await ev("!$('s-skills').hidden"),'and opens the skills');
// colour help and bigger text
await ev("SET.cb=1;SET.big=1;applySet();ROSTER.length=0;ROSTER.push({slot:0,dev:'kb',col:'#ff7a00',d2:'#c25a00',team:0},{slot:1,dev:'pad0',col:'#3ec5ff',d2:'#1f8fc0',team:1});TEAMS=true;startVersus()");await W(600);
ok(await ev("document.body.classList.contains('big')"),'Bigger text');
ok(await ev("(()=>{let n=0;const k=drawTag;drawTag=q=>{n++;k(q)};render();drawTag=k;return n===2})()"),'Colour help: a number tag over each player');
await ev("SET.cb=0;SET.big=0;applySet();ROSTER.length=0;openTitle()");
// the woods stay at dusk to the end of the trail (no quick sunrise before the next place)
ok(await ev("(()=>{TEAMS=false;startRun('castle');cineEnd();const s=LV.segs[1],v=[];for(let x=s.x0-1200;x<=s.x0+300;x+=100)v.push(chunkVal(x,'dusk'));return v.every((d,i)=>i===0||d>=v[i-1]-1e-9)&&v[v.length-1]>0.8})()"),'the Wooded Trail stays at dusk right to the end');
// the wind: puffs now and then, not a steady hiss
ok(await ev("['woods','meadow','slope','peak','ash'].every(k=>AMB_LOOK[k].puff)"),'the windy places blow in puffs');
// the Snowy Peak's gusts: a warning, then everyone is blown back for a few seconds; rnd() only there
ok(await ev("(()=>{startRun('mountain');cineEnd();for(let i=0;i<5;i++){fr++;update()}const a=!LV.gu;startRun('mountain');cineEnd();const sg=LV.segs[2];LV.encs.forEach(e=>{if(e.x<sg.x0+2000)e.st=2});LV.trans.forEach(t=>t.done=1);CAM.x=sg.x0+1200;PL[0].x=CAM.x+W*0.6;PL[0].y=PL[0].gy=G;for(let i=0;i<3;i++){fr++;update()}CAM.x=PL[0].x-W*0.6;LV.gu.next=LV.t+1;fr++;update();const x0=PL[0].x;for(let i=0;i<GUST_WARN;i++){fr++;update()}const warn=Math.abs(PL[0].x-x0)<1&&gustAmt()>0.3;for(let i=0;i<100;i++){fr++;update()}const push=x0-PL[0].x;for(let i=0;i<GUST_LEN;i++){fr++;update()}return a&&warn&&push>150&&gustAmt()===0&&LV.gu.next>LV.t})()"),'the Snowy Peak: a gust warns first, then blows you back, then dies down (and not in the meadow)');
ok(await ev("(()=>{const n=AMB.filter(q=>q.k==='gust').length;LV.gu.next=LV.t+1;for(let i=0;i<GUST_WARN+40;i++){fr++;update()}render();render();return n>=0&&AMB.some(q=>q.k==='gust')})()"),'snow streaks sideways in a gust');
await ev("openTitle()");
// a story's tile bursts open as it starts (the Story screen; the rooms use the same burst)
await ev("BURST_MS.on=true;openTitle();openThemes((id,m)=>startRun(id,0,m),'s-solo')");await W(200);
await p.click('.thcard');await W(900);
ok(await ev("!!document.querySelector('.burst.on .burst-mv.shake')&&state!=='play'&&MUS.cur&&MUS.cur.id==='go'"),'picking a story: the tile flies to the middle and shakes, with the jingle; the game waits');
if(process.env.SHOT)await p.screenshot({path:process.env.SHOT});
await W(1100);ok(await ev("state==='play'&&LV.run&&LV.run.theme==='castle'"),'then it bursts into the story');
await W(700);ok(await ev("!document.querySelector('.burst')&&!BURST"),'and the burst clears away');
await ev("openTitle();openLobby();LB.mode='level';LB.theme='pirate';renderLobby()");await W(200);
ok(await ev("!!$('s-lobby').querySelector('[data-theme=\"pirate\"] .pimg')"),'the Players screen has the story tile to burst');
await ev("openTitle()");
// the Face kind on the Head: glasses, shades and masks; the Ninja Mask only from the chest (four ninja stars)
ok(await ev("(()=>{const m=migrate({saveVersion:14,chr:{cur:0,list:[{name:'A',eq:{hat:'hat-cap'}},null]}});return m.saveVersion===SAVE_VERSION&&m.chr.list[0].eq.face===null&&m.chr.list[0].eq.hat==='hat-cap'})()"),'save version 15: fighters gain a face slot, nothing else changes');
ok(await ev("TABS.find(t=>t.id==='head').secs.includes('face')&&EQ.includes('face')&&ITEMS.filter(i=>i.slot==='face'&&!i.how).length>=12&&ITEM['face-ninja'].how.code"),'HEAD has a FACE kind with a dozen or more things to buy, and the Ninja Mask is secret');
ok(await ev("(()=>{let n=0;for(const it of ITEMS.filter(i=>i.slot==='face')){const L=lookRaw(normFighter(FIGHTER0));L.face=it;const f={look:L,face:1,s:1,slot:0,vx:0},o={};drawFig(300,300,1,STANCES[0].p,1,L.col,L.d2,0,1,7,o,1,lookLayers(f,{face:1,s:1},1));drawItemIcon(it,100,100,100,'#ff7a00');n++}return n>=15})()"),'every face item draws, on a fighter and as a shelf picture');
ok(await ev("(()=>{openChar();chGo('head');return [...$('ch-cats').querySelectorAll('button')].some(b=>/FACE/i.test(b.textContent))})()"),'the Head part opens onto a FACE tile');
ok(await ev("(()=>{openCodes();CD.code=[1,1,1,1];const had=owns('face-ninja');const ok=redeemCode();return !had&&ok&&owns('face-ninja')&&$('cd-name').textContent==='Ninja Mask'})()"),'four ninja stars in the treasure chest give the Ninja Mask');
ok(await ev("(()=>{const c=fighterNow();c.eq.face='face-ninja';saveFighter(CHR.cur,c);return normFighter(fighterNow()).eq.face==='face-ninja'})()"),'and you can wear it');
await ev("openTitle()");
// the victory photo keeps the fighter's proportions (it was squashed flat)
await ev("startRun('mountain');cineEnd();LV.encs.forEach(e=>e.st=2);LV.trans.forEach(t=>t.done=1);levelClear()");await W(3500);
ok(await ev("(()=>{const c=document.querySelector('#s-victory canvas'),r=c.getBoundingClientRect();return !$('s-victory').hidden&&Math.abs(r.width/r.height-c.width/c.height)<0.03})()"),'the victory photo is not squashed');
await ev("openTitle()");
// testing round: pets, crouch, oaks, Esc, the Join screen, Local house, no scroll bars, no enemy count
ok(await ev("(()=>{if(owns('pet-frog'))return false;openCodes();CD.code=[3,2,2,3];const r=redeemCode();return ITEM['pet-frog'].how.code&&r&&owns('pet-frog')})()"),'Froggy is secret: crown, heart, heart, crown in the treasure chest');
ok(await ev("(()=>{const m=migrate({saveVersion:15,chr:{cur:0,list:[{name:'A',eq:{face:'face-shades'}}]}});return m.saveVersion===SAVE_VERSION&&m.chr.list[0].eq.pet===null&&m.chr.list[0].eq.face==='face-shades'})()"),'save version 16: fighters gain a pet slot, nothing else changes');
ok(await ev("TABS.some(t=>t.id==='pets'&&t.secs[0]==='pet')&&EQ.includes('pet')&&ITEMS.filter(i=>i.slot==='pet').length>=8&&['dog','cat','armadillo','wolf'].every(k=>ITEMS.some(i=>i.slot==='pet'&&i.k===k))"),'a PETS part with a puppy, a kitty, an armadillo, a wolf pup and more');
ok(await ev("(()=>{for(const it of ITEMS.filter(i=>i.slot==='pet')){drawItemIcon(it,100,100,100,'#ff7a00');drawPet(it,200,200,1,1,1,true,false);drawPet(it,200,200,1,-1,0,false,true)}return true})()"),'every pet draws walking, sitting and as a shelf picture');
ok(await ev("(()=>{grantItem('pet-dog','test');const c=fighterNow();c.eq.pet='pet-dog';saveFighter(CHR.cur,c);startRun('castle');cineEnd();const s0=JSON.stringify([PL[0].x,PL[0].y,rnd.s||0]);PL[0].x+=300;for(let i=0;i<90;i++){fr++;render()}const q=PETF.get(PL[0]);const near=q&&Math.abs(q.x-PL[0].x)<80;return near&&q.y===q.y})()"),'your pet follows you along the trail');
ok(await ev("(()=>{const f=PL[0];f.look.pet=null;return !petOf(f)})()"),'no pet, nothing follows');
// crouch: Down alone kneels (and doesn't block); Down + Surge still blocks
ok(await ev("(()=>{startTrain();const p=PL[0],I=inputOf(p);for(const k in I.K)I.K[k]=0;I.K.d=1;for(let i=0;i<20;i++){fr++;update()}const c=p.crch===1&&!p.blk&&p.st==='free';I.K.s=1;for(let i=0;i<5;i++){fr++;update()}const b=p.blk===1&&!p.crch;I.K.d=0;I.K.s=0;for(let i=0;i<5;i++){fr++;update()}return c&&b&&!p.crch})()"),'holding Down crouches (no block); Down + Surge still blocks');
// crouch walk: Down + left or right, slower; with Surge it's the Surge run
ok(await ev("(()=>{startTrain();const p=PL[0],I=inputOf(p);for(const k in I.K)I.K[k]=0;I.K.d=1;I.K.r=1;for(let i=0;i<30;i++){fr++;update()}const cw=p.cw===1&&!p.crch&&Math.abs(p.vx-2.2)<0.2;I.K.s=1;p.stm.v=p.smax;for(let i=0;i<10;i++){fr++;update()}const run=p.running===1&&!p.cw;for(const k in I.K)I.K[k]=0;for(let i=0;i<5;i++){fr++;update()}return cw&&run&&!p.cw})()"),'Down + right crouch-walks slowly; adding Surge switches to the Surge run');
await ev("openTitle()");
// big oaks in front on the Wooded Trail (a story), see-through while you're behind one; the meadow has none
ok(await ev("LOOKS.woods.fg.toString().includes('drawOaksFg')&&!LOOKS.meadow.fg.toString().includes('drawOaksFg')"),'the Wooded Trail has big oaks in front, the Alpine Meadow doesn\'t');
ok(await ev("(()=>{startRun('castle');cineEnd();let hit=null;for(let s=0;s<60&&hit===null;s++){CAM.x=s*120;layer(1.35,1300,131,(x,r,i)=>{if(r>=0.35&&x>W*0.3&&x<W*0.7)hit=[x,i]})}const [x,i]=hit;PL[0].x=viewX()+x/CAM.z;for(let k=0;k<40;k++)drawOaksFg();const a=OAKA.get(i);PL[0].x+=600;for(let k=0;k<40;k++)drawOaksFg();return a<0.6&&OAKA.get(i)>0.9})()"),'an oak goes see-through while you walk behind it');
await ev("openTitle()");
// no enemy count in the corner (it ran into the pause button)
ok(await ev("!levelHud.toString().includes(\"' LEFT'\")"),'no "LEFT" count under the pause button in a story');
// Esc backs out of every menu screen
await ev("openOnline();ONC.join=true;renderOnline()");await W(100);
ok(await ev("$('s-online').classList.contains('joining')"),'the Join screen: the room code in the middle, JOIN under it, BACK at the bottom');
await p.keyboard.press('Escape');await W(100);ok(await ev("SHOWN==='s-online'&&!ONC.join"),'Esc on Join goes back to Multiplayer');
await p.keyboard.press('Escape');await W(100);ok(await ev("SHOWN==='s-title'"),'Esc on Multiplayer goes back to the title');
await ev("openLobby()");await W(100);await p.keyboard.press('Escape');await W(100);ok(await ev("SHOWN==='s-online'"),'Esc on Local goes back to Multiplayer');
// House on the Local screen
await ev("openLobby();lobbyJoin('kb');lobbyJoin('kb2');LB.mode='house';renderLobby()");await W(100);
ok(await ev("!!$('lb-modes').querySelector('[data-mode=\"house\"]')"),'the Local screen has HOUSE');
await p.click('#lb-start');await W(300);ok(await ev("MODE===HOUSE_MODE&&state==='play'&&PL.length===2"),'and everyone walks round your house');
await p.keyboard.press('Escape');await W(200);ok(await ev("SHOWN==='s-house'"),'Esc walking round the house (Local too) goes back to the house builder');
await ev("openLobby();LB.mode='house';renderLobby()");await W(100);await p.click('#lb-start');await W(300);
await ev("pause(true);$('b-quit').click()");await W(100);ok(await ev("SHOWN==='s-lobby'"),'QUIT on the pause menu goes back to the Local screen');
await ev("openTitle()");
// no scroll bars on Solo and the victory screen
await ev("openSolo()");await W(200);ok(await ev("(()=>{const s=$('s-solo');return s.scrollHeight<=s.clientHeight+1})()"),'the Solo screen fits without a scroll bar');
await ev("startRun('castle');cineEnd();LV.encs.forEach(e=>e.st=2);levelClear()");await W(3300);
ok(await ev("(()=>{RUN.last=[{xp:1735,from:1,to:1}];vicRewards();const s=$('s-victory');return s.scrollHeight<=s.clientHeight+1})()"),'the victory screen fits without a scroll bar, XP and all');
await ev("openTitle()");
ok(!errs.length,'no errors: '+errs.slice(0,3).join(' | '));
console.log(fails?fails+' FAILED':'ALL PASS');await b.close();process.exit(fails?1:0)})();
