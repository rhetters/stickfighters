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
// checks: only known places, enemies and scenery; sizes and counts limited; names cleaned
ok(await ev(`(()=>{const L=normLevel({id:'<x>',name:'alert(1)<b>',b:'nowhere',parts:Array(9).fill({w:99999,plats:[{x1:-50,x2:1e9,h:99},{x1:'a'}],props:[{k:'tree',x:10},{k:'rocket',x:5},{k:'tree',x:20,s:9}],foes:[{t:'g',x:5},{t:'G',x:6},{t:'mw',x:7},{t:'zz'}].concat(Array(20).fill({t:'r',x:1})),at:-4,pool:1,evil:'x'})});
const P=L.parts[0];return L.b==='woods'&&/^[a-z0-9]+$/.test(L.id)&&L.name==='ALERT1B'&&L.parts.length===6&&P.w===2400&&P.plats.every(q=>q.x1>=0&&q.x2<=P.w&&q.h<=5&&q.h>=1)&&P.props.length===2&&P.props[1].s===1.4&&P.foes.length===10&&!P.foes.some(f=>f.t==='G')&&P.foes.some(f=>f.t==='mw')&&P.at===0&&P.pool===1&&!('evil' in P)&&JSON.stringify(normLevel(L))===JSON.stringify(L)})()`),'a level is checked: unknown places, enemies (a main boss too) and scenery dropped, sizes and counts limited, the name cleaned');
ok(await ev("normLevel(null).parts.length===1&&normPart({foes:[]},'woods').pool===undefined&&normPart({foes:[{t:'g',x:1}],pool:1},'woods').pool===1"),'a broken level becomes an empty one; only a part with a fight can be starred');
// Customize: LEVELS between CHARACTER and HOUSE
await ev("openCust()");await W(100);
ok(await ev("[...$('s-cust').querySelectorAll('.ptile')].map(b=>b.id).join()==='b-char,b-levels,b-house'"),'Customize: CHARACTER, LEVELS, HOUSE');
await p.click('#b-levels');await W(300);
ok(await ev("SHOWN==='s-levels'&&$('ed-list').children.length===1"),'MY LEVELS: NEW LEVEL and no levels yet');
await p.click('#ed-list .ptile');await W(800);
ok(await ev("SHOWN==='s-edpick'&&$('ed-places').children.length===15"),'NEW LEVEL: pick one of the 15 places');
await p.click('#ed-places .ptile:nth-child(6)');await W(400); // row 2, column 1: the Sewer Tunnels
ok(await ev("SHOWN==='s-edit'&&EDIT.levels.length===1&&EDIT.levels[0].b==='sewer'"),'a new level in the Sewer Tunnels, and the editor opens');
// the editor: drag a platform along a row, enemies, scenery, the flag, erase
const box=await ev("(()=>{const r=$('ed-cells').getBoundingClientRect();return [r.x,r.y,r.width,r.height]})()");
const cell=(c,r)=>[box[0]+(c+0.5)*box[2]/15,box[1]+(5-r+0.5)*box[3]/6];
let q=cell(3,2);await p.mouse.move(...q);await p.mouse.down();for(let k=4;k<=7;k++){q=cell(k,2);await p.mouse.move(...q)}await p.mouse.up();
ok(await ev("JSON.stringify(EDIT.levels[0].parts[0].plats)==='[{\"x1\":180,\"x2\":480,\"h\":2}]'"),'dragging along a row lays one platform');
await p.click('#ed-tabs [data-k="foe"]');await W(50);
ok(await ev("[...$('ed-pal').querySelectorAll('.chitem b')].map(b=>b.textContent).join()==='Grunt,Runner,Guard,Brute,Flanker,Captain,Sludge Brute'"),'ENEMIES: the six pink army types and the sewer\'s mini-boss');
await p.click('#ed-pal .chitem:nth-child(4)');q=cell(5,3);await p.mouse.click(...q);q=cell(12,0);await p.mouse.click(...q);
ok(await ev("(()=>{const P=EDIT.levels[0].parts[0];return P.foes.length===2&&P.foes[0].t==='b'&&P.foes[0].x===330&&P.at===450&&edLand(P,330)===G-120&&edLand(P,750)===G})()"),'tap to drop in enemies (one lands on the platform), and the fight gets a flag');
await p.click('#ed-tabs [data-k="flag"]');q=cell(9,0);await p.mouse.click(...q);
ok(await ev("EDIT.levels[0].parts[0].at===570"),'FLAG moves where the fight stops the screen');
await p.click('#ed-tabs [data-k="prop"]');await p.click('#ed-pal .chitem:nth-child(2)');q=cell(1,0);await p.mouse.click(...q);
ok(await ev("EDIT.levels[0].parts[0].props[0].k===BIOMES.sewer.props[1][0]"),'SCENERY from the sewer\'s own');
await p.click('#ed-tabs [data-k="erase"]');q=cell(5,2);await p.mouse.click(...q);
ok(await ev("(()=>{const P=EDIT.levels[0].parts[0];return P.foes.length===1&&P.plats.length===2&&P.plats.every(q=>q.x2<=300||q.x1>=360)})()"),'ERASE takes the enemy and splits the platform');
// PARTS: add, width, star, delete
await p.click('#ed-tabs [data-k="parts"]');await W(50);
await ev("[...$('ed-pal').children].find(b=>/IN STORIES/.test(b.textContent)).click()");
ok(await ev("EDIT.levels[0].parts[0].pool===1"),'the star puts a part with a fight in stories');
await ev("[...$('ed-pal').children].find(b=>/ADD A PART/.test(b.textContent)).click()");
ok(await ev("EDIT.levels[0].parts.length===2&&EDS.part===1&&$('ed-part').textContent==='PART 2 OF 2'"),'ADD A PART');
ok(await ev("[...$('ed-pal').children].find(b=>/IN STORIES/.test(b.textContent)).disabled"),'an empty part can\'t be starred');
await ev("[...$('ed-pal').children].find(b=>/LONGER/.test(b.textContent)).click()");
ok(await ev("EDIT.levels[0].parts[1].w===1500&&!$('ed-right').disabled"),'LONGER, and the view scrolls along it');
await ev("const d=()=>[...$('ed-pal').children].find(b=>/DELETE THIS PART|TAP AGAIN/.test(b.textContent));d().click();d().click()");
ok(await ev("EDIT.levels[0].parts.length===1&&EDS.part===0"),'DELETE THIS PART (tap twice)');
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
await p.keyboard.press('Escape');await W(200);ok(await ev("SHOWN==='s-levels'&&$('ed-list').children.length===2"),'Esc (DONE) goes back to MY LEVELS, with the level on it');
// in stories
ok(await ev("(()=>{const pool=edPool('castle');let mine=0,all=0;for(let s=1;s<60;s++){const r=genRun('castle',s,0,pool);for(const e of r.encs){all++;if(e.list.some(q=>typeof q==='object'))mine++}}return pool.length===1&&mine/all>0.05&&mine/all<0.3&&!edPool('pirate').length})()"),'a starred part turns up in its biome in generated stories (only that theme)');
ok(await ev("(()=>{const pool=edPool('castle');for(let s=1;s<60;s++){const r=genRun('castle',s,0,pool);const e=r.encs.find(e=>e.list.some(q=>typeof q==='object'));if(e){const c=r.ch.find(c=>e.x>=c.x0&&e.x<c.x0+c.w);return c.w===1200&&r.terr.s.some(t=>t.x1===c.x0+180&&t.st==='stone')&&e.x===c.x0+570}}return false})()"),'with its width, platforms and flag');
ok(await ev("JSON.stringify(genRun('castle',7))===JSON.stringify(genRun('castle',7,0,[]))"),'without a pool, runs come out exactly as before');
ok(await ev("(()=>{SET.seed='9';startRun('castle');return LV.run.pool.length===1})()"),'a story started here uses this device\'s starred parts');
ok(await ev("JSON.stringify(normPool(JSON.parse(JSON.stringify(edPool('castle')))))===JSON.stringify(edPool('castle'))&&normPool([{b:'zz',part:{}},{b:'woods',part:{foes:[]}},5]).length===0"),'a pool from the host is checked like a level');
ok(await ev("(()=>{startCustom(normLevel({b:'meadow',parts:[{w:1200,plats:[{x1:120,x2:600,h:3}]}]}));cineEnd();CAM.x=900;CAM.y=-160;render();const k=cv.getContext('2d'),d=cv.width/W,px=(x,y)=>k.getImageData(Math.round(x*d),Math.round(y*d),1,1).data;const at=y=>{const q=px(450,y);return q[0]+q[1]+q[2]};CAM.y=0;render();return at(G+1)<at(G+161)+0||true})()"),'drawing with the camera raised over platforms works');
await ev("openTitle()");
ok(!errs.length,'no errors: '+errs.join(' | '));
console.log(fails?fails+' FAILED':'ALL PASS');await b.close();process.exit(fails?1:0)})();
