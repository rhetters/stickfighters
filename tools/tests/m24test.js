const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M24: the combo counter clear of its timer bar; the City's new songs (and its own boss song); the house builder's
// MOVE and DUPLICATE tools.
const {chromium,devices}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext(devices['iPad (gen 7) landscape']);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(GAME);await p.waitForTimeout(300);
const ev=x=>p.evaluate(x);
await ev("SET.tut=1;titleOpenAll()");
// the combo: its timer bar is below the words (not through them), and both are below Arcade's wave count
const cm=await ev("(()=>{MODE=ARCADE;STAGE_SEL='paper';start();PL[0].combo=24;PL[0].comboT=70;const t=[],r=[];const of=ctx.fillText.bind(ctx),or=ctx.fillRect.bind(ctx);ctx.fillText=(s,x,y)=>{t.push([s,y]);of(s,x,y)};ctx.fillRect=(x,y,w,h)=>{if(h===5&&x>W-130)r.push(y);or(x,y,w,h)};render();ctx.fillText=of;ctx.fillRect=or;return {hits:(t.find(a=>/HITS/.test(a[0]))||[])[1],wave:(t.find(a=>/^WAVE/.test(a[0]))||[])[1],bar:r[0]}})()");
ok(cm.bar>cm.hits&&cm.hits-50>cm.wave,'the combo\'s timer bar is under the words, and the combo is under the wave count '+JSON.stringify(cm));
// music: the City's songs, each bar the right length; the City's boss plays its own song
ok(await ev("['burbs','city','tower','boss-city'].every(id=>{const S=MUSIC[id],n=(S.beats||4)*(S.div||4);return S.parts.every(q=>(q.mel||q.pat.split('|')).every(bar=>bar.trim().split(/\\s+/).length===n))})"),'the City\'s four songs: every bar the right length');
ok(await ev("(()=>{SET.seed='9';startRun('city');cineEnd();LV.encs[LV.encs.length-1].st=1;const a=musWant()[0];SET.seed='9';startRun('castle');cineEnd();LV.encs[LV.encs.length-1].st=1;return a==='boss-city'&&musWant()[0]==='boss'&&musTrans('city','boss-city').sting==='bossin'})()"),'Pink Kong plays the City\'s boss song; other bosses keep theirs');
// MOVE and DUPLICATE
await ev("ECO.stars=1000;HOUSE.items=[{id:'hf-bed',x:2,y:0,f:1},{id:'hf-couch',x:8,y:0,r:1}];houseSave();openHouse();$('hs-tabs').children[5].click()");
const tool=t=>`[...$('hs-pal').children].find(b=>b.querySelector('b').textContent==='${t}').click()`;
ok(await ev("[...$('hs-pal').children].map(b=>b.querySelector('b').textContent).join()==='MOVE,DUPLICATE,ROTATE,FLIP,ERASE'"),'TOOLS: MOVE, DUPLICATE, ROTATE, FLIP, ERASE');
await ev(tool('MOVE'));
ok(await ev("houseAct(3,0);HS.hold&&HS.hold.i===0&&/Now tap/.test($('hs-msg').textContent)"),'MOVE: a tap picks the bed up');
ok(await ev("(()=>{const s0=ECO.stars;houseAct(12,2);const b=HOUSE.items[0];return HOUSE.items.length===2&&b.id==='hf-bed'&&b.x===12&&b.y===2&&b.f===1&&!HS.hold&&ECO.stars===s0})()"),'the next tap puts it there (still flipped, nothing paid)');
ok(await ev("houseAct(8,1);houseAct(8,1);!HS.hold&&HOUSE.items[1].x===8"),'tapping the thing you\'re holding puts it back');
ok(await ev("(()=>{houseAct(8,1);houseAct(30,0);const c=HOUSE.items[1];return c.x===30&&c.r===1})()"),'a turned couch moves and stays turned');
ok(await ev("(()=>{houseAct(4,10);return !HS.hold&&/Tap a piece/.test($('hs-msg').textContent)})()"),'tapping an empty square picks nothing up');
await ev(tool('DUPLICATE'));
ok(await ev("(()=>{const s0=ECO.stars;houseAct(13,2);houseAct(0,0);const n=HOUSE.items.filter(i=>i.id==='hf-bed');return n.length===2&&n[0].x===12&&n[1].x===0&&n[1].y===0&&n[1].f===1&&ECO.stars===s0-ITEM['hf-bed'].price})()"),'DUPLICATE: the bed stays and a copy goes down (flipped too), for the bed\'s price');
ok(await ev("(()=>{ECO.stars=5;houseAct(13,2);houseAct(20,0);const r=HOUSE.items.length===3&&/Not enough stars/.test($('hs-msg').textContent);ECO.stars=1000;HS.hold=null;return r})()"),'not enough stars: no copy');
ok(await ev("(()=>{houseAct(13,2);$('hs-tabs').children[2].click();return !HS.hold})()"),'changing tab drops what you\'re holding');
ok(await ev("(()=>{const s=JSON.parse((save(),localStorage.getItem('orangeArmy.v1')));return s.house.items.length===3})()"),'moves and copies are saved');
ok(errs.length===0,'no errors '+errs.join('|'));console.log(fails?fails+' FAILED':'ALL PASS');await b.close();})();
