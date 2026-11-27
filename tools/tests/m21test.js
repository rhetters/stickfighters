const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M21: stage names (RANDOM, CITY, MEADOW); Meadow's plain platforms, two big oaks in the Woods, one castle window;
// low gravity and helmets on Moon Base; your own maps in the level creator, played in Arcade and Versus; Solo Arcade
// picks a stage; the room's stages under the polaroids with FREE-FOR-ALL / TEAMS on top; the wave count top right;
// online buttons that also travel on the fast channel.
const {chromium,devices}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext(devices['iPad (gen 7) landscape']);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
// a version 19 save with a level: it stays a level (not a map)
await p.goto(GAME);await p.waitForTimeout(300);
await p.evaluate(()=>localStorage.setItem('orangeArmy.v1',JSON.stringify({saveVersion:19,set:{tut:1},eco:{stars:50,got:50,own:[],seen:[]},edit:{levels:[{id:'a1',name:'OLD ONE',places:[{b:'woods',parts:[{w:900,plats:[],props:[],foes:[{t:'g',x:400}],at:300}]}]}]}})));
await p.reload();await p.waitForTimeout(400);
const ev=x=>p.evaluate(x);
ok(await ev("save(),JSON.parse(localStorage.getItem('orangeArmy.v1')).saveVersion===SAVE_VERSION&&SAVE_VERSION>=20&&EDIT.levels.length===1&&!EDIT.levels[0].map&&edLevels().length===1&&edMaps().length===0"),'a version 19 save: its level stays a level, and there are no maps yet');
// ===== stage names =====
ok(await ev("STAGE.rooftop.tag==='CITY'&&STAGE.treehouse.tag==='MEADOW'&&STAGE.moonbase.lowg<1&&STAGE.moonbase.helmet"),'CITY and MEADOW; Moon Base has low gravity and helmets');
ok(await ev("(()=>{openLobby();LB.mode='arcade';renderLobby();const q=$('lb-sub').querySelector('[data-stage=\"?\"]');return /RANDOM/.test(q.textContent)})()"),'the random stage says RANDOM');
// ===== Moon Base: low gravity and helmets, in Versus and Arcade =====
const g=await ev("(()=>{ROSTER=[{slot:0,dev:'kb',col:'#ff7a00',name:'A'},{slot:1,dev:'pad0',col:'#3ec5ff',name:'B'}];const r={};for(const s of ['moonbase','paper']){STAGE_SEL=s;startVersus();r[s==='paper'?'paper':'moon']=[lowG(PL[0]),helmAt(PL[0].x),helmOn]}MODE=ARCADE;STAGE_SEL='moonbase';start();r.arc=[lowG(PL[0]),helmAt(PL[0].x)];return r})()");
ok(g.moon[0]<1&&g.moon[1]&&g.paper[0]===1&&!g.paper[1]&&g.arc[0]<1&&g.arc[1],'low gravity and helmets on the Moon only (Versus and Arcade) '+JSON.stringify(g));
// ===== the stages draw (Meadow plain, two oaks in the Woods, one castle window) =====
const dr=await ev("(()=>{const r={};for(const s of STAGES){STAGE_SEL=s.id;startVersus();try{render();r[s.id]=true}catch(e){r[s.id]=e.message}}return r})()");
ok(Object.values(dr).every(v=>v===true),'every stage draws '+JSON.stringify(dr));
ok(await ev("STAGE_SEL='clearing';startVersus();render();[...OAKA.keys()].some(k=>k>=1000)&&[...OAKA.keys()].some(k=>k<1000)"),'the Woods has a big oak on each side');
// ===== the wave count: top right, under the pause button =====
await ev("MODE=ARCADE;STAGE_SEL='paper';start()");
const wv=await ev("(()=>{const o=ctx.fillText.bind(ctx),hits=[];ctx.fillText=(t,x,y)=>{if(/^WAVE/.test(t))hits.push([x,y,ctx.textAlign]);o(t,x,y)};render();ctx.fillText=o;return hits})()");
ok(wv.length&&wv[0][0]>860&&wv[0][1]<90&&wv[0][2]==='right','the wave count sits at the top right '+JSON.stringify(wv));
// ===== maps in the level creator =====
await ev("init();titleOpenAll();openLevels()");await p.waitForTimeout(150);
ok(await ev("[...$('ed-list').children].some(b=>/NEW MAP/.test(b.textContent))"),'the level creator offers NEW MAP');
await ev("edNew('castle',true)");await p.waitForTimeout(150);
ok(await ev("(()=>{const L=EDIT.levels[EDIT.levels.length-1];return L.map===1&&L.places.length===1&&L.places[0].parts.length===1&&L.places[0].parts[0].w===W&&!L.boss&&edMaps().length===1&&edLevels().length===1})()"),'a new map: one place one screen wide, no boss');
ok(await ev("edTabList().map(t=>t[0]).join()==='plat,prop,erase'"),'a map has platforms and scenery only (no enemies)');
ok(await ev("(()=>{const L=normLevel({name:'X',map:1,places:[{b:'woods',parts:[{w:3000,plats:[{x1:60,x2:300,h:2},{x1:800,x2:1500,h:1}],props:[{k:'tree',x:2000,s:1}],foes:[{t:'g',x:100}],at:200}]},{b:'cave'}],boss:{t:'G',x:100}});const q=L.places[0].parts[0];return L.map===1&&L.places.length===1&&q.w===W&&q.plats.length===1&&q.foes.length===0&&!q.at&&!L.boss&&q.props.length===0})()"),'a map that is too big is cut back to one screen, no enemies, flag or boss');
// put a platform on it and play it in Arcade; LEAVE goes back to the editor
await ev("(()=>{const L=EDIT.levels[EDIT.levels.length-1];L.places[0].parts[0].plats.push({x1:300,x2:600,h:2});edTryMap(L)})()");await p.waitForTimeout(300);
ok(await ev("state==='play'&&MODE===ARCADE&&STG.st.map&&STG.st.look==='castle'&&STG.s.some(s=>s.x1===300&&s.x2===600)"),'PLAY on a map plays it in Arcade with its platforms');
await ev("leaveGame()");await p.waitForTimeout(300);
ok(await ev("MODE===LEVEL&&SHOWN==='s-edit'&&!STG.edit"),'leaving goes back to the map in the level creator');
// a map in Versus, picked by the room's MY LEVELS
ok(await ev("(()=>{STAGE_SEL='?';openLobby();LB.mode='vs';renderLobby();$('lb-sub').querySelector('[data-stage=\"mine\"]').click();const a=STAGE_SEL.startsWith('my:')&&$('lb-sub').querySelectorAll('[data-stage^=\"my:\"]').length===2;$('lb-sub').querySelector('[data-stage=\"<\"]').click();const r=STAGE_SEL==='?';return a&&r})()"),'MY LEVELS shows your maps, their RANDOM and a way back to the stages');
ok(await ev("(()=>{STAGE_SEL='my:?';startVersus();return !!(STG.st.map&&edMaps().some(L=>STG.st.id==='my:'+L.id))})()"),'RANDOM among your maps plays one of them in Versus');
ok(await ev("(()=>{STAGE_SEL='my:gone';STAGE_SEL=stageOk(STAGE_SEL,edMaps());return STAGE_SEL==='?'})()"),'a map that was deleted falls back to RANDOM');
// ===== the room: stages under the polaroids, FREE-FOR-ALL / TEAMS on top =====
ok(await ev("(()=>{openLobby();LB.mode='vs';renderLobby();const v=$('lb-sub').querySelectorAll('[data-stage]').length>0&&$('lb-diff').querySelectorAll('[data-teams]').length===2;LB.mode='arcade';renderLobby();const a=$('lb-sub').querySelectorAll('[data-stage]').length>0&&$('lb-diff').querySelectorAll('[data-diff]').length===3;return v&&a})()"),'Versus: stages under the polaroids, FREE-FOR-ALL and TEAMS on top; Arcade: stages under, difficulty on top');
ok(await ev("(()=>{const t=[...$('lb-sub').querySelectorAll('[data-stage]')].map(e=>e.dataset.stage);return t.length===7&&t[5]==='?'&&t[6]==='mine'})()"),'five stages, then RANDOM, then MY LEVELS');
// ===== Solo Arcade picks a stage =====
await ev("init();titleOpenAll();show('s-solo');$('b-start').click()");await p.waitForTimeout(300);
ok(await ev("SHOWN==='s-themes'&&/ARCADE/.test($('s-themes').querySelector('h2').textContent)&&$('th-cards').querySelectorAll('.thcard').length===7"),'Solo Arcade opens the stage cards: five stages, RANDOM and MY LEVELS');
await ev("$('th-cards').querySelector('.thmy').click()");await p.waitForTimeout(150);
ok(await ev("THS.mine&&$('th-cards').querySelectorAll('.thcard').length===3"),'MY LEVELS on the cards shows your map, RANDOM and STAGES');
await ev("THS.go('clearing')");await p.waitForTimeout(300);
ok(await ev("state==='play'&&MODE===ARCADE&&STG.st.id==='clearing'"),'a stage card starts Arcade there');
// the story's MY LEVELS lists levels only, never maps
ok(await ev("(()=>{init();openThemes(()=>{});THS.mine=true;themeCards();const n=[...$('th-cards').querySelectorAll('.thcard')].filter(e=>/OLD ONE/.test(e.textContent)).length,m=[...$('th-cards').querySelectorAll('.thcard')].filter(e=>/MAP 1/.test(e.textContent)).length;return n===1&&m===0})()"),'the story MY LEVELS lists levels, not maps');
// ===== online: the fast channel's window of buttons =====
ok(await ev("(()=>{NET.match=1;NET.epoch=1;NET.stop={};const got=[];const o=netGotInput;netGotInput=m=>got.push(m.f+':'+m.m);netGotWindow({e:1,f:20,s:1,ms:[-1,5,6,7]});netGotWindow({e:1,f:20,s:1,ms:'bad'});netGotInput=o;NET.match=0;return got.join()==='18:5,19:6,20:7'})()"),'a window of buttons from the fast channel fills in the frames it carries');
ok(await ev("typeof rtcSendFast==='function'&&NET_WIN===8"),'buttons go out on the fast channel too, eight frames at a time');
ok(errs.length===0,'no errors '+errs.join('|'));console.log(fails?fails+' FAILED':'ALL PASS');await b.close();})();
