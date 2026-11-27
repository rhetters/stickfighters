const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M22: Versus ends on the victory screen; colours: no dot on the tiles, plain items stay plain, Rainbow can't be
// recoloured; items that were only a colour of another merge into it (save version 21 keeps everything); the
// treasure chest on the Customize page; car Surge uses the Surge bar; Pink Kong: framed whole, his bar only at the
// top, the view follows a scene up the Skyscraper, and the roof's ending plays out.
const {chromium,devices}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext(devices['iPad (gen 7) landscape']);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(GAME);await p.waitForTimeout(300);
// a version 20 save with colour items: they become the item they were a colour of, with that colour
await p.evaluate(()=>localStorage.setItem('orangeArmy.v1',JSON.stringify({saveVersion:20,set:{tut:1},best:{combo:3},eco:{stars:500,got:500,own:['shirt-red','band-black','scarf-gold','scarf-red','hat-cap','trail-rainbow'],seen:[],tint:{'shirt-red':['green'],'hat-cap':['blue']}},chr:{cur:0,list:[{name:'RON',col:'col-orange',eq:{shirt:'shirt-red',band:'band-black',scarf:'scarf-gold',hat:'hat-cap',surge:'trail-rainbow'},tint:{'hat-cap':'blue','shirt-red':'green'},wheel:['pose-flex']},null,null,null]}})));
await p.reload();await p.waitForTimeout(400);
const ev=x=>p.evaluate(x);
ok(await ev("JSON.stringify(ECO.own)==='[\"shirt-white\",\"band-red\",\"scarf-red\",\"hat-cap\",\"trail-rainbow\"]'&&ECO.tint['shirt-white'].join()==='red,green'&&ECO.tint['band-red'].join()==='black'&&ECO.tint['scarf-red'].join()==='gold'&&ECO.tint['hat-cap'].join()==='blue'"),'a version 20 save: colour items become their item, with every colour owned');
ok(await ev("(()=>{const f=normFighter(CHR.list[0]);return f.eq.shirt==='shirt-white'&&f.tint['shirt-white']==='green'&&f.eq.band==='band-red'&&f.tint['band-red']==='black'&&f.eq.scarf==='scarf-red'&&f.tint['scarf-red']==='gold'&&f.tint['hat-cap']==='blue'})()"),'the fighter looks the same: what they wore, in the same colours');
ok(await ev("Object.keys(ITEM_MERGED).every(id=>!ITEM[id])&&!ITEMS.some(i=>/^(Red|Blue|Green|Gold|White|Black|Yellow|Pink) /.test(i.name)&&i.sec!=='color'&&!/^h/.test(i.sec))"),'no item is named for its colour any more');
ok(await ev("ITEM['scarf-red'].name==='Traditional Scarf'&&ITEM['scarf-knit'].k==='knit'&&ITEM['scarf-long'].k==='long'&&ITEM['tie-red'].name==='Straight Tie'&&ITEM['tie-stripe']"),'scarves are styles: Traditional, Knitted, Long, Striped, Royal; ties: Straight, Striped, Bow');
// colours
ok(await ev("(()=>{const a=tinted(ITEM['shirt-white'],{'shirt-white':'red'}),s=tinted(ITEM['shirt-stripe'],{'shirt-stripe':'red'});return a.c===TINT.red.c&&!a.c2&&s.c2&&s.c===TINT.red.c})()"),'a plain item stays plain in a colour (no stripes); a striped one keeps its stripes');
ok(await ev("!tintable(ITEM['trail-rainbow'])&&!tintable(ITEM['band-rainbow'])&&!TINT.rainbow&&!buyTint('trail-rainbow','red')&&tinted(ITEM['trail-rainbow'],{'trail-rainbow':'red'})===ITEM['trail-rainbow']"),'Rainbow items can\'t be recoloured (and rainbow is never a colour)');
await ev("(()=>{openChar();chGo('colors');$('ch-cats').querySelector('[data-k=\"paint-surge\"]').click()})()");await p.waitForTimeout(150);
ok(await ev("/This item cannot be recolored\\./.test($('ch-grid').textContent)&&!$('ch-grid').querySelector('[data-id^=\"tint-\"]')"),'COLORS with Rainbow Surge: "This item cannot be recolored."');
await ev("(()=>{CH.paint=null;chGo('colors');$('ch-cats').querySelector('[data-k=\"paint-upper\"]').click();$('ch-cats').querySelector('[data-k=\"sec-shirt\"]').click()})()");await p.waitForTimeout(150);
ok(await ev("$('ch-grid').querySelectorAll('[data-id^=\"tint-\"]').length===17"),'a T-Shirt has Original and the 16 colours');
// the colour tiles have no dot: the corner where it was drawn is plain
ok(await ev("(()=>{const cv=$('ch-grid').querySelector('[data-id=\"tint-red\"] canvas');if(!cv)return 'no canvas';const k=cv.getContext('2d'),sx=cv.width/64,d=k.getImageData(Math.round(54*sx),Math.round(12*sx),1,1).data;return !(d[0]>200&&d[1]<80&&d[2]<80)})()"),'colour tiles show the item only, no coloured dot');
// a colour earned: Gold for the Headband at a 20-hit combo
ok(await ev("(()=>{const before=tintOwns('band-red','gold');checkUnlocks({combo:20});return !before&&tintOwns('band-red','gold')&&rewardName('tint:band-red:gold')==='Gold Headband'})()"),'a 20-hit combo earns Gold for the Headband');
// the chest
await ev("openTitle();openCust()");await p.waitForTimeout(150);
ok(await ev("(()=>{const c=$('cu-chest').getBoundingClientRect(),h=$('b-house').getBoundingClientRect();return c.width>0&&c.bottom<h.top&&Math.abs((c.left+c.right)/2-(h.left+h.right)/2)<10&&getComputedStyle($('cu-chest').querySelector('svg')).filter.includes('grayscale')})()"),'the treasure chest sits above HOUSE on the Customize page, grey until highlighted');
await ev("$('cu-chest').click()");ok(await ev("SHOWN==='s-codes'"),'it opens the code screen');
await ev("$('cd-back').click()");ok(await ev("SHOWN==='s-cust'"),'and BACK returns to Customize');
// Versus ends on the victory screen
await ev("(()=>{titleOpenAll();ROSTER=[{slot:0,dev:'kb',col:'#ff7a00',name:'RON'},{slot:1,dev:'pad0',col:'#3ec5ff',name:'RHETT'}];startVersus();VS.stats={0:{dealt:120,taken:40},1:{dealt:30,taken:120}};VS.wins={P0:2,P1:1};vsEnd(PL[0])})()");
await p.waitForTimeout(2200);
ok(await ev("SHOWN==='s-victory'&&$('v-h1').textContent==='RON WINS!'&&/REMATCH/.test($('v-again').textContent)&&$('v-cards').children.length===2&&$('v-cards').children[0].classList.contains('vwin')&&/120/.test($('v-cards').children[0].textContent)"),'Versus ends on the victory screen: the winner, WINNER sticker, rounds and damage, REMATCH');
await ev("$('v-cards').querySelectorAll('.vready').forEach(b=>b.click());$('v-again').click()");await p.waitForTimeout(200);
ok(await ev("MODE===VERSUS&&state==='play'&&VS.round===1&&!VS.champ"),'REMATCH starts a new match');
// car Surge uses the Surge bar
const cs=await ev("(()=>{SET.seed='5';startRun('city');cineEnd();E.length=0;LV.trans[0].done=1;for(const e of LV.encs)e.st=2;CAM.x=LV.trans[0].nx+200;const f=PL[0];f.x=CAM.x+300;fr++;update();carGive(f);fr++;update();const I=INP[0];f.stm.v=f.smax;I.K.s=1;I.K.r=1;const v0=f.stm.v;for(let i=0;i<60;i++){fr++;update()}const v1=f.stm.v;f.stm.v=0;f.stm.winded=200;for(let i=0;i<5;i++){fr++;update()}const sg=f.car&&f.car.sg;if(!f.car)return {nocar:1};I.K.s=0;I.K.r=0;return {v0,v1,sg}})()");
ok(cs.v1<cs.v0-5&&!cs.sg,'Surge in a car uses the Surge bar, and stops when you\'re winded '+JSON.stringify(cs));
// Pink Kong on the roof
const toTower=seed=>`SET.seed='${seed}';titleOpenAll();startRun('city');cineEnd();E.length=0;for(const t of LV.trans)t.done=1;for(const e of LV.encs)if(e.fy===undefined)e.st=2;CAM.x=LV.shaft.x0-W;levelWalls();PL[0].x=LV.shaft.x0-300;PL[0].y=G;PL[0].vy=0;`;
const kg=await ev(`(()=>{${toTower(9)}const S=LV.shaft,L=LV.encs[LV.encs.length-1];for(const e of LV.encs)if(e!==L)e.st=2;CAM.x=S.x0;CAM.y=0;const P=PL[0];P.x=S.x0+800;P.y=S.roof-2;
 for(let i=0;i<40;i++){fr++;update()}const sceneY=CAM.y,inScene=!!LV.cine;for(let i=0;i<900&&LV.cine;i++){fr++;update()}
 const k=E.find(e=>e.tk==='N');for(let i=0;i<60;i++){fr++;update();P.hp=P.max}
 const headOnScreen=G+(k.y-125*k.s-G-CAM.y)*CAM.z;
 k.inv=0;k.st='free';k.hp=1;P.x=S.x0+880;hurtE(k,{dmg:50,kb:5,lift:-5},1,null,P);let at=-1;for(let i=0;i<400;i++){fr++;update();P.x=S.x0+880;if(state!=='play'){at=i;break}}
 return {inScene,sceneY,roof:S.roof,headOnScreen,at,fin:LV.fin}})()`);
ok(kg.inScene&&kg.sceneY<kg.roof+300,'Pink Kong\'s leap: the view is already up on the roof during his scene '+JSON.stringify(kg));
ok(kg.headOnScreen>=100,'Pink Kong\'s head is on screen, under his health bar');
ok(kg.at>60,'beating Pink Kong plays the slow motion and poses before the end, even standing at the roof\'s edge ('+kg.at+' steps)');
ok(await ev("(()=>{const k=F(400,'N',0);k.hp=k.max/2;E.push(k);const calls=[];const o=ctx.fillRect.bind(ctx);ctx.fillRect=(x,y,w,h)=>{if(h===3&&Math.abs(y-(k.y-98*k.s))<2)calls.push(1);o(x,y,w,h)};render();ctx.fillRect=o;return calls.length===0})()"),'no small health bar over a boss\'s head (it\'s the big bar at the top)');
ok(errs.length===0,'no errors '+errs.join('|'));console.log(fails?fails+' FAILED':'ALL PASS');await b.close();})();
