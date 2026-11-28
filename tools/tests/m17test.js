const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M17: the level creator: the save, checks on loading, the editor's screens and tools, playing a level, and Rhett's
// parts in generated stories
const {chromium,devices}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext(devices['iPad (gen 7) landscape']);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(GAME);await p.waitForTimeout(300);await p.evaluate("SET.tut=1");
const ev=x=>p.evaluate(x),W=t=>p.waitForTimeout(t);
// the save
ok(await ev("(()=>{const m=migrate({saveVersion:16,set:{vol:0.4}});return m.saveVersion===SAVE_VERSION&&Array.isArray(m.edit.levels)&&!m.edit.levels.length&&m.set.vol===0.4})()"),'save version 17: an empty list of levels, nothing else changes');
ok(await ev("(()=>{const m=migrate({saveVersion:17,edit:{levels:[{id:'abc',name:'OLD',b:'peak',parts:[{w:900,foes:[{t:'g',x:100}],at:450}]}]}});const L=m.edit.levels[0],N=normLevel(L);return SAVE_VERSION>=18&&m.saveVersion===SAVE_VERSION&&L.places[0].b==='peak'&&L.places[0].parts[0].foes[0].t==='g'&&N.id==='abc'&&N.name==='OLD'&&N.places.length===1&&N.places[0].parts[0].at===450})()"),'save version 18: an old level becomes a level with one place, nothing lost');
// checks: only known places, enemies and scenery; sizes and counts limited; names cleaned
ok(await ev(`(()=>{const L=normLevel({id:'<x>',name:'alert(1)<b>',b:'nowhere',parts:Array(9).fill({w:99999,plats:[{x1:-50,x2:1e9,h:99},{x1:'a'}],props:[{k:'tree',x:10},{k:'rocket',x:5},{k:'tree',x:20,s:9}],foes:[{t:'g',x:5},{t:'G',x:6},{t:'mw',x:7},{t:'zz'}].concat(Array(20).fill({t:'r',x:1})),at:-4,evil:'x'})});
const P=L.places[0].parts[0];return L.places[0].b==='woods'&&/^[a-z0-9]+$/.test(L.id)&&L.name==='ALERT1B'&&L.places[0].parts.length===6&&P.w===2400&&P.plats.every(q=>q.x1>=0&&q.x2<=P.w&&q.h<=5&&q.h>=1)&&P.props.length===2&&P.props[1].s===1.4&&P.foes.length===10&&!P.foes.some(f=>f.t==='G')&&P.foes.some(f=>f.t==='mw')&&P.at===0&&!('pool' in P)&&!('evil' in P)&&JSON.stringify(normLevel(L))===JSON.stringify(L)})()`),'a level is checked: unknown places, enemies (a main boss too) and scenery dropped, sizes and counts limited, the name cleaned');
ok(await ev("normLevel(null).places[0].parts.length===1&&normPart({foes:[]},'woods').at===undefined&&normPart({foes:[{t:'g',x:1}]},'woods').at===600"),'a broken level becomes an empty one; only a part with a fight has a flag');
// Customize: LEVELS between CHARACTER and HOUSE
await ev("openCust()");await W(100);
ok(await ev("[...$('s-cust').querySelectorAll('.ptile')].map(b=>b.id).join()==='b-char,b-levels,b-house'"),'Customize: CHARACTER, LEVELS, HOUSE');
await p.click('#b-levels');await W(300);
ok(await ev("SHOWN==='s-levels'&&$('ed-list').children.length===2"),'MY LEVELS: NEW LEVEL, NEW MAP and no levels yet');
await p.click('#ed-list .ptile');await W(800);
ok(await ev("SHOWN==='s-edpick'&&$('ed-places').children.length===21"),'NEW LEVEL: pick one of the 21 places');
await p.click('#ed-places .ptile:nth-child(8)');await W(400); // row 2, column 1: the Sewer Tunnels
ok(await ev("SHOWN==='s-edit'&&EDIT.levels.length===1&&EDIT.levels[0].places[0].b==='sewer'"),'a new level in the Sewer Tunnels, and the editor opens');
// the editor: drag a platform along a row, enemies, scenery, the flag, erase
const box=await ev("(()=>{const r=$('ed-cells').getBoundingClientRect();return [r.x,r.y,r.width,r.height]})()");
const cell=(c,r)=>[box[0]+(c+0.5)*box[2]/15,box[1]+(5-r+0.5)*box[3]/6];
let q=cell(3,2);await p.mouse.move(...q);await p.mouse.down();for(let k=4;k<=7;k++){q=cell(k,2);await p.mouse.move(...q)}await p.mouse.up();
ok(await ev("JSON.stringify(EDIT.levels[0].places[0].parts[0].plats)==='[{\"x1\":180,\"x2\":480,\"h\":2}]'"),'dragging along a row lays one platform');
await p.click('#ed-tabs [data-k="foe"]');await W(50);
ok(await ev("[...$('ed-pal').querySelectorAll('.chitem b')].map(b=>b.textContent).join()==='Grunt,Runner,Guard,Brute,Flanker,Mummy,Captain,Sludge Brute'"),'ENEMIES: the seven pink army types and the sewer\'s mini-boss');
await p.click('#ed-pal .chitem:nth-child(4)');q=cell(5,3);await p.mouse.click(...q);q=cell(12,0);await p.mouse.click(...q);
ok(await ev("(()=>{const P=EDIT.levels[0].places[0].parts[0];return P.foes.length===2&&P.foes[0].t==='b'&&P.foes[0].x===330&&P.at===450&&edLand(P,330)===G-120&&edLand(P,750)===G})()"),'tap to drop in enemies (one lands on the platform), and the fight gets a flag');
await p.click('#ed-tabs [data-k="flag"]');q=cell(9,0);await p.mouse.click(...q);
ok(await ev("EDIT.levels[0].places[0].parts[0].at===570"),'FLAG moves where the fight stops the screen');
await p.click('#ed-tabs [data-k="prop"]');await p.click('#ed-pal .chitem >> nth=1');q=cell(1,0);await p.mouse.click(...q);
ok(await ev("EDIT.levels[0].places[0].parts[0].props[0].k===BIOMES.sewer.props[1][0]"),'SCENERY from the sewer\'s own');
await p.click('#ed-tabs [data-k="erase"]');q=cell(5,2);await p.mouse.click(...q);
ok(await ev("(()=>{const P=EDIT.levels[0].places[0].parts[0];return P.foes.length===1&&P.plats.length===2&&P.plats.every(q=>q.x2<=300||q.x1>=360)})()"),'ERASE takes the enemy and splits the platform');
// PARTS: add, width, delete (and nothing about stories)
await p.click('#ed-tabs [data-k="parts"]');await W(50);
ok(await ev("![...$('ed-pal').children].some(b=>/STOR/.test(b.textContent))"),'PARTS has no IN STORIES button');
await ev("[...$('ed-pal').children].find(b=>/ADD A PART/.test(b.textContent)).click()");
ok(await ev("EDIT.levels[0].places[0].parts.length===2&&EDS.part===1&&$('ed-part').textContent==='SEWER TUNNELS · PART 2 OF 2'"),'ADD A PART');
await ev("[...$('ed-pal').children].find(b=>/LONGER/.test(b.textContent)).click()");
ok(await ev("EDIT.levels[0].places[0].parts[1].w===1500&&!$('ed-right').disabled"),'LONGER, and the view scrolls along it');
await ev("const d=()=>[...$('ed-pal').children].find(b=>/DELETE THIS PART|TAP AGAIN/.test(b.textContent));d().click();d().click()");
ok(await ev("EDIT.levels[0].places[0].parts.length===1&&EDS.part===0"),'DELETE THIS PART (tap twice)');
await ev("$('ed-name').value='Rhett Run';$('ed-name').dispatchEvent(new Event('input'))");
ok(await ev("EDIT.levels[0].name==='RHETT RUN'&&JSON.parse(localStorage.getItem('orangeArmy.v1')).edit.levels[0].name==='RHETT RUN'"),'the name, and everything saved as you go');
// PLAY: the level, with a sign, the part and an arch; enemies drop in where they were put; no stars
await p.click('#ed-play');await W(400);
ok(await ev("MODE===LEVEL&&LV.custom===EDIT.levels[0].id&&LV.ch.length===3&&LV.ch[0].props[0].t==='RHETT RUN'&&LV.terr.s.length===2&&LV.terr.s[0].st==='stone'"),'PLAY: a sign with its name, the part (stone platforms in the sewer) and an arch at the end');
const st0=await ev("ECO.stars");
ok(await ev("(()=>{cineEnd();const e=LV.encs[0];CAM.x=e.lock;PL[0].x=e.x-60;for(let i=0;i<90;i++){fr++;update()}const ok1=e.st===1&&E.length===1&&Math.abs(E[0].x-(LV.ch[1].x0+750))<60;for(const f of E)hurtE(f,{dmg:999,kb:5,lift:-5,ef:'hit'},1,null,PL[0]);for(let i=0;i<200;i++){fr++;update()}return ok1&&e.st===2&&!PK.length})()"),'the enemy drops in where it was put; beating it drops no stars');
ok(await ev("ECO.stars")===st0,'playing your own level earns nothing');
await ev("pause(true);$('b-quit').click()");await W(200);
ok(await ev("SHOWN==='s-edit'&&EDS.i===0"),'QUIT goes back to the editor');
await p.click('#ed-play');await W(300);await ev("cineEnd();levelClear()");await W(2200);
ok(await ev("SHOWN==='s-edit'"),'clearing the level goes back to the editor');
await p.click('#ed-play');await W(300);await ev("cineEnd();levelFail()");await W(100);
ok(await ev("$('b-title').textContent==='EDIT'"),'knocked out: EDIT (or try again)');
await ev("$('b-title').click()");await W(200);ok(await ev("SHOWN==='s-edit'"),'EDIT goes back to the editor');
await p.keyboard.press('Escape');await W(200);ok(await ev("SHOWN==='s-levels'&&$('ed-list').children.length===3"),'Esc (DONE) goes back to MY LEVELS, with the level on it');
// stories are never changed by your levels
ok(await ev("typeof edPool==='undefined'&&genRun.length===2&&(()=>{SET.seed='9';startRun('castle');return !('pool' in LV.run)})()"),'stories are made as before: your levels never go into them');
ok(await ev("(()=>{startCustom(normLevel({b:'woods',parts:[{w:1200,plats:[{x1:120,x2:600,h:3}]}]}));cineEnd();CAM.x=900;CAM.y=0;let l=[];const a=[],b=[],o=ctx.translate.bind(ctx),hit=q=>q.some(y=>Math.abs(y-160*CAM.z)<1);ctx.translate=(x,y)=>{l.push(y);o(x,y)};l=a;drawLevelFg();CAM.y=-160;l=b;drawLevelFg();ctx.translate=o;CAM.y=0;return !hit(a)&&hit(b)})()"),'the foreground (the oaks in front) sinks with the camera too');
ok(await ev("(()=>{startCustom(normLevel({b:'meadow',parts:[{w:1200,plats:[{x1:120,x2:600,h:3}]}]}));cineEnd();PL[0].x=PL[0].sx=1000;const k=cv.getContext('2d'),T=k.getTransform();const dark=()=>{let m=999;for(let y=G-6;y<=G+6;y++){const q=k.getImageData(Math.round(800*T.a+T.e),Math.round(y*T.d+T.f),1,1).data;m=Math.min(m,q[0]+q[1]+q[2])}return m};CAM.x=900;CAM.y=0;render();const flat=dark();CAM.x=900;CAM.y=-160;render();const up=dark();CAM.y=0;return flat<250&&up>400})()"),'the ground line sinks with the camera over platforms (it isn\'t left behind at the old height)');
// ===== places, transitions, a boss, scenery layers =====
await ev("openLevels();openEdit(0)");await W(200);
await p.click('#ed-tabs [data-k="parts"]');await W(50);
const btn=t=>ev(`[...$('ed-pal').children].find(b=>/${t}/.test(b.textContent)).click()`);
await btn('ADD A PLACE');await W(600);
ok(await ev("SHOWN==='s-edpick'&&$('s-edpick').querySelector('h2').textContent==='ADD A PLACE'"),'ADD A PLACE picks a place');
await ev("$('ed-pback').click()");await W(200);ok(await ev("SHOWN==='s-edit'&&EDIT.levels[0].places.length===1"),'BACK from it goes back to the editor');
await btn('ADD A PLACE');await W(400);await p.click('#ed-places .ptile:nth-child(19)');await W(400); // row 3, column 5: the crater
ok(await ev("SHOWN==='s-edit'&&EDIT.levels[0].places.map(q=>q.b).join()==='sewer,crater'&&EDS.pl===1&&EDS.part===0&&$('ed-part').textContent==='PLACE 2: THE CRATER · PART 1 OF 1'"),'a second place, and the editor goes to it: '+await ev("$('ed-part').textContent"));
await p.click('#ed-tabs [data-k="parts"]');await W(50);
await btn('ADD A PART');await btn('◀ PART');await btn('◀ PART');
ok(await ev("EDIT.levels[0].places[1].parts.length===2&&EDS.pl===0&&EDS.part===0"),'◀ PART goes back across places');
await btn('ADD A PLACE');await W(400);await p.click('#ed-places .ptile:nth-child(1)');await W(400);
await p.click('#ed-tabs [data-k="parts"]');await W(50);
ok(await ev("EDIT.levels[0].places.map(q=>q.b).join()==='sewer,woods,crater'&&[...$('ed-pal').children].find(b=>/ADD A PLACE/.test(b.textContent)).disabled"),'a place goes after the one in view; three places at most');
await btn('DELETE THIS PLACE');await btn('TAP AGAIN');
ok(await ev("EDIT.levels[0].places.map(q=>q.b).join()==='sewer,crater'"),'DELETE THIS PLACE (tap twice)');
// the boss: only in the very last part
await ev("edGoTo(0,0)");await p.click('#ed-tabs [data-k="boss"]');await W(50);
ok(await ev("[...$('ed-pal').querySelectorAll('.chitem b')].map(b=>b.textContent).length===7&&[...$('ed-pal').children].some(b=>/GO TO THE LAST PART/.test(b.textContent))"),'BOSS: the seven main bosses, and a way to the last part');
await p.click('#ed-pal .chitem:nth-child(3)');q=cell(7,0);await p.mouse.click(...q);
ok(await ev("!EDIT.levels[0].boss&&/last part/.test($('ed-msg').textContent)"),'no boss outside the last part');
await btn('GO TO THE LAST PART');await W(50);q=cell(7,0);await p.mouse.click(...q);
ok(await ev("EDS.pl===1&&EDS.part===1&&JSON.stringify(EDIT.levels[0].boss)==='{\"t\":\"Y\",\"x\":450}'"),'the boss goes in the last part');
await p.click('#ed-pal .chitem:nth-child(5)');q=cell(9,0);await p.mouse.click(...q);
ok(await ev("EDIT.levels[0].boss.t==='K'&&EDIT.levels[0].boss.x===570&&!JSON.stringify(EDIT.levels[0].places).includes('\"K\"')"),'one boss only: another one replaces him');
ok(await ev("normLevel({places:[{b:'woods'}],boss:{t:'g',x:1}}).boss===undefined&&normLevel({places:[{b:'woods'}],boss:{t:'P',x:99999}}).boss.x===1170"),'a boss is checked: main bosses only, inside the last part');
// scenery layers
await p.click('#ed-tabs [data-k="prop"]');await W(50);
ok(await ev("[...$('ed-pal').querySelectorAll('.edlayers .chtab')].map(b=>b.textContent).join()==='FAR BACK,BACK,FRONT'"),'SCENERY: three layers');
await ev("$('ed-pal').querySelector('[data-l=\"f\"]').click()");await p.click('#ed-pal .chitem >> nth=1');q=cell(2,0);await p.mouse.click(...q);
await ev("$('ed-pal').querySelector('[data-l=\"z\"]').click()");q=cell(4,0);await p.mouse.click(...q);
ok(await ev("EDIT.levels[0].places[1].parts[1].props.map(q=>q.l||'b').join()==='f,z'"),'scenery goes on the layer picked');
ok(await ev("normPart({props:[{k:'tree',x:1,l:'f'},{k:'tree',x:2,l:'zz'}]},'woods').props.map(q=>q.l||'-').join()==='f,-'"),'a layer is checked too');
// playing it: a transition carries you into the crater (over its rim), and the boss fight is the last part's
await p.click('#ed-play');await W(300);
ok(await ev("LV.segs.map(s=>s.b).join()==='sewer,crater'&&LV.trans.length===1&&LV.trans[0].k==='rim'&&LV.trans[0].land>=0&&LV.encs[LV.encs.length-1].boss==='K'&&LV.encs[LV.encs.length-1].intro==='erupt'"),'PLAY: the rim carries you into the crater, and the Pink Tiki waits at the end');
ok(await ev("(()=>{const L=normLevel({places:[{b:'woods'},{b:'peak'},{b:'sewer'}]});for(let s=1;s<60;s++){const X=buildCustom(L,s);if(!X.trans.every(t=>TRANS_INTO[t.to].includes(t.k)))return false;if(JSON.stringify(buildCustom(L,s).trans)!==JSON.stringify(X.trans))return false}const ks=new Set();for(let s=1;s<60;s++)ks.add(buildCustom(L,s).trans[0].k);return ks.size>1})()"),'transitions: always one of the arriving place\'s, picked from the seed (the same seed, the same pick)');
ok(await ev("(()=>{const L=normLevel({places:[{b:'woods'},{b:'sewer'}]});for(let s=1;s<80;s++)if(buildCustom(L,s).trans[0].k!=='pipe')return false;return true})()"),'into the sewer: only the pipe (never a balloon)');
ok(await ev("(()=>{for(const id in THEMES)for(let s=1;s<60;s++)for(const t of genRun(id,s).trans)if(!TRANS_INTO[t.to].includes(t.k))return false;return Object.keys(BIOMES).every(b=>TRANS_INTO[b]&&TRANS_INTO[b].length)})()"),'stories use the same table, and every place has a way in');
// the far and front layers are drawn (front: see-through when someone is behind it)
ok(await ev("(()=>{startCustom(normLevel({places:[{b:'woods',parts:[{w:1200,props:[{k:'tree',x:600,l:'f'},{k:'pine',x:300,l:'z'},{k:'bush',x:900}]}]}]}));cineEnd();CAM.x=LV.ch[1].x0;const n=[];const o=drawProp;drawProp=(q,x,d)=>{n.push(q.k+(q.l||''));o(q,x,d)};drawLevelBg();drawLevelFg();drawProp=o;return n.join()==='pinez,bush,treef'})()"),'far, back and front scenery each drawn in their turn');
ok(await ev("(()=>{const pr=LV.ch[1].props[0];PL[0].x=LV.ch[1].x0+600;for(let i=0;i<40;i++)drawLevelFg();const a=PROPA.get(pr);PL[0].x=LV.ch[1].x0+100;for(let i=0;i<40;i++)drawLevelFg();return a<0.5&&PROPA.get(pr)>0.95})()"),'front scenery turns see-through while a fighter is behind it');
ok(await ev("(()=>{const L=normLevel({places:[{b:'woods',parts:[{w:1200}]}],boss:{t:'G',x:600}});const X=buildCustom(L,3);return X.encs.length===1&&X.encs[0].boss==='G'&&X.encs[0].list.length===0&&X.encs[0].intro==='pencil'})()"),'a boss alone makes the last part a boss fight');
ok(await ev("(()=>{startCustom(normLevel({places:[{b:'moon'}]}),'menu');cineEnd();PL[0].look={...PL[0].look,pet:ITEMS.find(i=>i.id==='pet-dog')};const n=[];const o=drawBubble;drawBubble=(x,y,r)=>{n.push(r);o(x,y,r)};render();drawBubble=o;return n.length>=2})()"),'on the moon a pet gets a space bubble too');
await ev("openTitle()");
ok(!errs.length,'no errors: '+errs.join(' | '));
console.log(fails?fails+' FAILED':'ALL PASS');await b.close();process.exit(fails?1:0)})();
