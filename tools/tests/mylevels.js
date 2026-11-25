const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// MY LEVELS: on the Story screen (Solo), the Players screen (Local) and in an online room, the stories can be swapped
// for your own levels from the level creator, with a red sticker: no XP or ninja stars. Online the host's levels go
// to everyone in the room, and the one picked is sent with the start so every device builds the same level.
const {chromium}=require('playwright');const {spawn}=require('child_process');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const srv=spawn('node',[__dirname+'/sigserver.js','9323']);await new Promise(r=>setTimeout(r,400));
const b=await chromium.launch();const url=GAME+'?signal='+encodeURIComponent('ws://127.0.0.1:9323/peerjs?key=peerjs');
const errs=[];const mk=async(n)=>{const c=await b.newContext({viewport:{width:1080,height:810}});const p=await c.newPage();p.on('pageerror',e=>errs.push(n+': '+e.message));p.on('console',m=>m.type()==='error'&&errs.push(n+': '+m.text()));await p.goto(url);await p.waitForTimeout(300);await p.evaluate(n=>{SET.tut=1;saveFighter(0,{...FIGHTER0,name:n});titleOpenAll()},n);return p};
const LEVELS="EDIT.levels=[normLevel({id:'aaa',name:'ROPE RUN',b:'woods',parts:[{w:1500,plats:[{x1:300,x2:600,h:2}],foes:[{t:'b',x:500}],at:700}]}),normLevel({id:'bbb',name:'ICE DASH',b:'peak',parts:[{w:1200,plats:[{x1:120,x2:360,h:1}]}]})];save()";
// ----- Solo: the Story screen -----
const S=await mk('SOLO');
await S.evaluate(LEVELS);
await S.evaluate(()=>$('b-level').click());await S.waitForTimeout(300);
const cards=()=>S.evaluate(()=>[...$('th-cards').children].map(c=>c.querySelector('b').textContent).join());
ok(await cards()==='CASTLE SIEGE,PIRATE COVE,MOUNTAIN,SPACE,VOLCANO,?,MY LEVELS'&&await S.evaluate(()=>$('th-nostar').hidden),'Solo Story screen: the stories, ?, and MY LEVELS (no sticker yet) '+await cards());
await S.evaluate(()=>[...$('th-cards').children].find(c=>/MY LEVELS/.test(c.textContent)).click());await S.waitForTimeout(200);
ok(await cards()==='STORIES,ROPE RUN,ICE DASH'&&await S.evaluate(()=>!$('th-nostar').hidden&&/NO XP OR\s*NINJA STARS/.test($('th-nostar').textContent)),'MY LEVELS swaps the stories for your levels, with the red NO XP OR NINJA STARS sticker');
ok(await S.evaluate(()=>/^url\("?data:image\/png/.test($('th-cards').children[1].querySelector('.thpic').style.backgroundImage)),'each level shows its own picture');
await S.evaluate(()=>$('th-cards').children[0].click());await S.waitForTimeout(100);
ok(await cards()==='CASTLE SIEGE,PIRATE COVE,MOUNTAIN,SPACE,VOLCANO,?,MY LEVELS'&&await S.evaluate(()=>$('th-nostar').hidden),'STORIES goes back');
await S.evaluate(()=>{[...$('th-cards').children].find(c=>/MY LEVELS/.test(c.textContent)).click();$('th-cards').children[2].click()});await S.waitForTimeout(400);
ok(await S.evaluate(()=>MODE===LEVEL&&LV.custom==='bbb'&&LV.from==='menu'&&LV.def.name==='ICE DASH'),'picking a level plays it');
const st0=await S.evaluate(()=>ECO.stars);
await S.evaluate(()=>{cineEnd();levelClear()});await S.waitForTimeout(2200);
ok(await S.evaluate(()=>SHOWN==='s-clear'&&/no XP or ninja stars/.test($('c-st').textContent)&&$('b-next').textContent==='PLAY AGAIN')&&await S.evaluate(()=>ECO.stars)===st0,'the end: no XP or ninja stars, and PLAY AGAIN');
await S.evaluate(()=>$('b-next').click());await S.waitForTimeout(300);
ok(await S.evaluate(()=>MODE===LEVEL&&LV.custom==='bbb'),'PLAY AGAIN plays it again');
// no levels yet: one tile saying so
await S.evaluate(()=>{openTitle();EDIT.levels=[];$('b-level').click();[...$('th-cards').children].find(c=>/MY LEVELS/.test(c.textContent)).click()});await S.waitForTimeout(200);
ok(await cards()==='STORIES,NONE YET','no levels yet: NONE YET');
// ----- Local: the Players screen -----
await S.evaluate(LEVELS);
await S.evaluate(()=>{openTitle();openLobby();lobbyJoin('kb');lobbyJoin('kb2');LB.mode='level';renderLobby()});await S.waitForTimeout(200);
ok(await S.evaluate(()=>!!$('lb-sub').querySelector('[data-theme="mine"]')&&$('lb-nostar').hidden),'Local: a MY LEVELS tile beside the stories');
await S.evaluate(()=>$('lb-sub').querySelector('[data-theme="mine"]').click());await S.waitForTimeout(200);
ok(await S.evaluate(()=>[...$('lb-sub').querySelectorAll('[data-lvl]')].map(t=>t.dataset.lvl).join()==='<,aaa,bbb'&&!$('lb-nostar').hidden&&$('lb-sub').querySelector('[data-lvl="aaa"]').classList.contains('on')),'it shows STORIES and your levels (the first one picked), with the sticker');
await S.evaluate(()=>$('lb-sub').querySelector('[data-lvl="bbb"]').click());await S.waitForTimeout(100);
await S.evaluate(()=>$('lb-start').click());await S.waitForTimeout(400);
ok(await S.evaluate(()=>MODE===LEVEL&&LV.custom==='bbb'&&PL.length===2),'START plays the level picked, for both players');
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
const shape=()=>JSON.stringify([LV.custom,LV.ch.map(c=>c.w),LV.encs.map(e=>e.list),LV.terr&&LV.terr.s]);
ok(await A.evaluate(()=>state==='play'&&MODE===LEVEL&&LV.custom==='aaa'&&NET.match)&&await A.evaluate(shape)===await H.evaluate(shape),'START: both devices build and play the same level');
await H.waitForTimeout(1500);
ok(await A.evaluate(()=>NET.match&&state==='play'&&fr>60)&&await H.evaluate(()=>NET.match&&state==='play'),'no desync');
ok(errs.length===0,'no errors '+errs.join(' | '));
console.log(fails?fails+' FAILED':'ALL PASS');await b.close();srv.kill();process.exit(fails?1:0)})();
