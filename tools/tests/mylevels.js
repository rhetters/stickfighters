const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// MY LEVELS: on the Story screen (Solo), the Players screen (Local) and in an online room, the stories can be swapped
// for your own levels from the level creator, with a red sticker: no XP or ninja stars. Online the host's levels go
// to everyone in the room, and the one picked is sent with the start so every device builds the same level.
const {chromium}=require('playwright');const {spawn}=require('child_process');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const srv=spawn('node',[__dirname+'/sigserver.js','9323']);await new Promise(r=>setTimeout(r,400));
const b=await chromium.launch();const url=GAME+'?signal='+encodeURIComponent('ws://127.0.0.1:9323/peerjs?key=peerjs');
const errs=[];const mk=async(n)=>{const c=await b.newContext({viewport:{width:1080,height:810}});const p=await c.newPage();p.on('pageerror',e=>errs.push(n+': '+e.message));p.on('console',m=>m.type()==='error'&&errs.push(n+': '+m.text()));await p.goto(url);await p.waitForTimeout(300);await p.evaluate(n=>{SET.tut=1;saveFighter(0,{...FIGHTER0,name:n});titleOpenAll()},n);return p};
const LEVELS="EDIT.levels=[normLevel({id:'aaa',name:'ROPE RUN',places:[{b:'woods',parts:[{w:1500,plats:[{x1:300,x2:600,h:2}],foes:[{t:'b',x:500}],at:700}]},{b:'peak',parts:[{w:1200,props:[{k:'pine',x:200,l:'f'}]}]}],boss:{t:'Y',x:600}}),normLevel({id:'bbb',name:'ICE DASH',b:'peak',parts:[{w:1200,plats:[{x1:120,x2:360,h:1}]}]})];save()";
// ----- Solo: the Story screen -----
const S=await mk('SOLO');
await S.evaluate(LEVELS);
await S.evaluate(()=>$('b-level').click());await S.waitForTimeout(300);
const cards=()=>S.evaluate(()=>[...$('th-cards').querySelectorAll('.thcard')].map(c=>c.querySelector('b').textContent).join());
ok(await cards()==='CASTLE SIEGE,PIRATE COVE,MOUNTAIN,SPACE,VOLCANO,RANDOM,MY STORIES'&&await S.evaluate(()=>$('th-nostar').hidden),'Solo Story screen: the stories, ?, and MY LEVELS (no sticker yet) '+await cards());
await S.evaluate(()=>[...$('th-cards').children].find(c=>/MY STORIES/.test(c.textContent)).click());await S.waitForTimeout(200);
ok(await cards()==='ROPE RUN,ICE DASH,RANDOM,STORIES'&&await S.evaluate(()=>!$('th-nostar').hidden&&/NO XP OR\s*NINJA STARS/.test($('th-nostar').textContent)),'MY LEVELS swaps the stories for your levels, with the red NO XP OR NINJA STARS sticker');
ok(await S.evaluate(()=>/^\s*url\("?data:image\/png/.test($('th-cards').querySelector('.thcard').querySelector('.thpic').style.getPropertyValue('--ic'))),'each level shows its own picture (inside the tile frame)');
await S.evaluate(()=>$('th-cards').querySelector('.thmy').click());await S.waitForTimeout(100);
ok(await cards()==='CASTLE SIEGE,PIRATE COVE,MOUNTAIN,SPACE,VOLCANO,RANDOM,MY STORIES'&&await S.evaluate(()=>$('th-nostar').hidden),'STORIES goes back');
await S.evaluate(()=>{[...$('th-cards').children].find(c=>/MY STORIES/.test(c.textContent)).click();$('th-cards').querySelectorAll('.thcard')[1].click()});await S.waitForTimeout(400);
ok(await S.evaluate(()=>MODE===LEVEL&&LV.custom==='bbb'&&LV.from==='menu'&&LV.def.name==='ICE DASH'),'picking a level plays it');
const st0=await S.evaluate(()=>ECO.stars);
await S.evaluate(()=>{cineEnd();levelClear()});await S.waitForTimeout(2200);
ok(await S.evaluate(()=>SHOWN==='s-victory'&&/no XP or ninja stars/.test($('v-st').textContent)&&/PLAY AGAIN/.test($('v-again').textContent))&&await S.evaluate(()=>ECO.stars)===st0,'the end: the victory screen, no XP or ninja stars, and PLAY AGAIN');
await S.evaluate(()=>{vicReady(PL[0].slot);$('v-again').click()});await S.waitForTimeout(300);
ok(await S.evaluate(()=>MODE===LEVEL&&LV.custom==='bbb'),'PLAY AGAIN plays it again');
// no levels yet: one tile saying so
await S.evaluate(()=>{openTitle();EDIT.levels=[];$('b-level').click();[...$('th-cards').children].find(c=>/MY STORIES/.test(c.textContent)).click()});await S.waitForTimeout(200);
ok(await cards()==='NONE YET,RANDOM,STORIES'&&await S.evaluate(()=>$('th-cards').querySelector('.thq').disabled),'no levels yet: NONE YET (and no ?)');
// five at a time: up and down arrows page through twelve levels; '?' plays one of them
await S.evaluate(()=>{EDIT.levels=[];for(let i=0;i<12;i++)EDIT.levels.push(normLevel({id:'l'+i,name:'L'+i,places:[{b:'woods'}]}));openTitle();$('b-level').click();[...$('th-cards').children].find(c=>/MY STORIES/.test(c.textContent)).click()});await S.waitForTimeout(200);
const arr=()=>S.evaluate(()=>[...$('th-cards').querySelectorAll('.pgarrows button')].map(b=>b.disabled?0:1).join(''));
ok(await cards()==='L0,L1,L2,L3,L4,RANDOM,STORIES'&&await arr()==='01'&&await S.evaluate(()=>$('th-cards').firstElementChild.classList.contains('pgarrows')),'MY LEVELS: the first five, ? and STORIES; the arrows on the left (up greyed out)');
await S.evaluate(()=>$('th-cards').querySelector('.pgdn').click());await S.evaluate(()=>$('th-cards').querySelector('.pgdn').click());
ok(await cards()==='L10,L11,RANDOM,STORIES'&&await arr()==='10','down twice: the last page (down greyed out)');
await S.evaluate(()=>$('th-cards').querySelector('.pgup').click());
ok(await cards()==='L5,L6,L7,L8,L9,RANDOM,STORIES'&&await arr()==='11','up: back a page');
ok(await S.evaluate(()=>{const r=$('th-nostar').getBoundingClientRect(),f=$('s-themes').getBoundingClientRect();return r.right>f.right-60&&r.bottom>f.bottom-60}),'the sticker sits in the bottom-right corner');
await S.evaluate(()=>$('th-cards').querySelector('.thq').click());await S.waitForTimeout(300);
ok(await S.evaluate(()=>MODE===LEVEL&&/^l\d+$/.test(LV.custom)),'? plays one of your levels');
await S.evaluate(()=>{openTitle();$('b-level').click()});await S.waitForTimeout(100);
ok(await cards()==='CASTLE SIEGE,PIRATE COVE,MOUNTAIN,SPACE,VOLCANO,RANDOM,MY STORIES'&&await arr()==='01','the stories: five on a page, more below (down lit)');
// ----- Local: the Players screen -----
await S.evaluate(LEVELS);
await S.evaluate(()=>{openTitle();openLobby();lobbyJoin('kb');lobbyJoin('kb2');LB.mode='level';renderLobby()});await S.waitForTimeout(200);
ok(await S.evaluate(()=>!!$('lb-sub').querySelector('[data-theme="mine"]')&&$('lb-nostar').hidden),'Local: a MY LEVELS tile beside the stories');
await S.evaluate(()=>$('lb-sub').querySelector('[data-theme="mine"]').click());await S.waitForTimeout(200);
ok(await S.evaluate(()=>[...$('lb-sub').querySelectorAll('[data-lvl]')].map(t=>t.dataset.lvl).join()==='aaa,bbb,?,<'&&$('lb-sub').firstElementChild.classList.contains('pgarrows')&&!$('lb-nostar').hidden&&$('lb-sub').querySelector('[data-lvl="aaa"]').classList.contains('on')),'it shows STORIES and your levels (the first one picked), with the sticker');
await S.evaluate(()=>$('lb-sub').querySelector('[data-lvl="bbb"]').click());await S.waitForTimeout(100);
await S.evaluate(()=>$('lb-start').click());await S.waitForTimeout(400);
ok(await S.evaluate(()=>MODE===LEVEL&&LV.custom==='bbb'&&PL.length===2),'START plays the level picked, for both players');
await S.evaluate(()=>{openLobby();renderLobby();$('lb-sub').querySelector('[data-lvl="?"]').click();$('lb-start').click()});await S.waitForTimeout(400);
ok(await S.evaluate(()=>MODE===LEVEL&&['aaa','bbb'].includes(LV.custom)),'? on the Players screen plays one of them');
// ----- Online: the host's levels go to the guest -----
const H=await mk('DAD'),A=await mk('RHETT');
await H.evaluate(LEVELS);
await H.evaluate(()=>{$('b-online').click();$('on-host').click()});await H.waitForTimeout(3000);const code=await H.evaluate(()=>NET.code);
await A.evaluate(code=>{$('b-online').click();const [w,n]=code.split('-');ONC.w=ROOM_WORDS.indexOf(w);ONC.a=+n[0];ONC.b=+n[1];renderOnline();$('on-join').click();},code);await A.waitForTimeout(3500);
ok(await A.evaluate(()=>EDIT.levels.length===0&&NET.lvls.length===2&&NET.lvls[1].name==='ICE DASH'),'the guest gets a copy of the host\'s levels (its own aren\'t touched)');
await H.evaluate(()=>{NET.mode='level';netRoomChanged()});await H.waitForTimeout(300);
await H.evaluate(()=>$('on-sub').querySelector('[data-theme="mine"]').click());await H.waitForTimeout(500);
await H.evaluate(()=>$('on-sub').querySelector('[data-lvl="aaa"]').click());await H.waitForTimeout(600);
ok(await A.evaluate(()=>NET.theme==='mine'&&!$('on-nostar').hidden&&$('on-sub').querySelector('[data-lvl="aaa"]').classList.contains('on')&&$('on-sub').querySelector('[data-lvl="aaa"]').disabled),'the guest sees the host\'s levels and the one picked, with the sticker (only the host picks)');
for(const q of [A,H])await q.evaluate(()=>document.querySelector('.pready:not(:disabled)').click());await H.waitForTimeout(800);
await H.evaluate(()=>$('on-start').click());await H.waitForTimeout(1500);
const shape=()=>JSON.stringify([LV.custom,LV.ch.map(c=>c.w),LV.encs.map(e=>[e.list,e.boss,e.line]),LV.terr&&LV.terr.s,LV.trans.map(t=>t.k)]);
ok(await A.evaluate(()=>state==='play'&&MODE===LEVEL&&LV.custom==='aaa'&&NET.match&&LV.trans.length===1&&LV.encs[1].boss==='Y')&&await A.evaluate(shape)===await H.evaluate(shape),'START: both devices build and play the same level (the same transition into the second place, the same boss)');
await H.waitForTimeout(1500);
ok(await A.evaluate(()=>NET.match&&state==='play'&&fr>60)&&await H.evaluate(()=>NET.match&&state==='play'),'no desync');
ok(errs.length===0,'no errors '+errs.join(' | '));
console.log(fails?fails+' FAILED':'ALL PASS');await b.close();srv.kill();process.exit(fails?1:0)})();
