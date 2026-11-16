// Orange vs. the Pink Army: Game shell (screens, settings), screen fit, simulation step update(), main loop and boot. Loads last.
// ===== GAME SHELL (M0): title, pause, settings, save =====
let paused=false,back='s-title',curSeed=0,sawTouch=false,DPR=1,gridDPR=0;
const gridC=document.createElement('canvas'),coarseMQ=matchMedia('(pointer:coarse)'),portraitMQ=matchMedia('(orientation:portrait) and (pointer:coarse)');
const SCREENS=['s-title','s-pause','s-settings','s-over'];
function show(id){
 for(const s of SCREENS)$(s).hidden=s!==id;
 $('ui').hidden=!id;
 if(id){const b=$(id).querySelector('button');if(b&&id!=='s-settings')b.focus({preventScroll:true})}
 else if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
 $('wrap').classList.toggle('playing',!id&&(state==='play'||state==='train'));$('wrap').classList.toggle('training',!id&&state==='train')}
function newSeed(){const s=String(SET.seed||'').trim();
 curSeed=s?(/^\d+$/.test(s)?(+s>>>0):[...s].reduce((h,c)=>(Math.imul(h,31)+c.charCodeAt(0))>>>0,7)):((Date.now()^Math.floor(Math.random()*4294967296))>>>0);
 reseed(curSeed)}
function openTitle(){$('moves').hidden=true;$('feel').hidden=true;$('info').hidden=true;document.querySelectorAll('#tbtns button').forEach(b=>b.classList.remove('on'));state='menu';paused=false;releaseAll();document.body.classList.remove('train');$('trainpanel').hidden=true;newSeed();init();
 $('best').textContent=BEST.score?'Best: '+BEST.score+' pts · wave '+BEST.wave+' · '+BEST.combo+'-hit combo':'No runs yet. Pick a mode.';show('s-title')}
function start(){$('moves').hidden=true;$('info').hidden=true;$('feel').hidden=true;document.querySelectorAll('#tbtns button').forEach(b=>b.classList.remove('on'));newSeed();init();state='play';paused=false;releaseAll();show(null);nextWave()}
function startTrain(){newSeed();init();state='train';paused=false;LAST=null;TR.freeze=0;TR.ts=1;syncTrain();releaseAll();
 document.body.classList.add('train');$('trainpanel').hidden=false;show(null);gridDPR=0;resize();requestAnimationFrame(()=>{gridDPR=0;resize()});spawnDummy('g')}
function pause(on){if(state!=='play'&&state!=='train')return;paused=on;if(on){releaseAll();$('p-seed').textContent='Seed '+curSeed+' (enter it in Settings to replay the same spawns)';show('s-pause')}else show(null)}
const togglePause=()=>pause(!paused);
function over(){if(state!=='play')return;state='over';const nb=score>BEST.score;
 BEST.score=Math.max(BEST.score,score);BEST.wave=Math.max(BEST.wave,wave);BEST.combo=Math.max(BEST.combo,maxc);save();
 $('o-l1').textContent='Wave '+wave+' · Score '+score+' · Best combo '+maxc;$('o-l2').textContent=nb?'New best score!':'Best: '+BEST.score;show('s-over')}
function applyTouchVis(){$('wrap').classList.toggle('touch-on',SET.touch==='on'||(SET.touch==='auto'&&(coarseMQ.matches||sawTouch)))}
function applySet(){const w=$('wrap');w.style.setProperty('--ts',SET.tsize);w.style.setProperty('--to',SET.topac);applyTouchVis();applyLayout()}
addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&!sawTouch){sawTouch=true;applyTouchVis()}},{passive:true});
function bindSettings(){
 const vol=$('o-vol');vol.value=Math.round(SET.vol*100);vol.oninput=()=>{SET.vol=vol.value/100;save()};vol.onchange=()=>sfx(260,.12,'square',.06);
 const sel=$('o-touch');sel.value=SET.touch;sel.onchange=()=>{SET.touch=sel.value;applySet();save()};
 for(const[id,key]of[['o-tsize','tsize'],['o-topac','topac']]){const el=$(id);el.value=SET[key];el.oninput=()=>{SET[key]=parseFloat(el.value);applySet();save()}}
 fillProfiles();$('o-prof').onchange=()=>{LAY.active=$('o-prof').value;saveLay();applyLayout()};$('o-edit').onclick=openEditor;
 {const el=$('o-surge');el.value=SET.surge||'hold';el.onchange=()=>{SET.surge=el.value;for(const I of INP){I.sl=false;I.K.s=0}document.querySelector('.tb[data-a=s]').classList.remove('on');save()}}
 for(const[id,key]of[['o-hist','hist'],['o-calm','calm']]){const el=$(id);el.checked=!!SET[key];el.onchange=()=>{SET[key]=el.checked?1:0;applySet();save()}}
 const sd=$('o-seed');sd.value=SET.seed;sd.oninput=()=>{SET.seed=sd.value;save()}}
$('b-start').onclick=start;$('b-train').onclick=startTrain;
$('b-set1').onclick=()=>{back='s-title';show('s-settings')};
$('b-resume').onclick=()=>pause(false);
$('b-restart').onclick=()=>{if(state==='train')startTrain();else start()};
$('b-set2').onclick=()=>{back='s-pause';show('s-settings')};
$('b-quit').onclick=openTitle;$('b-back').onclick=()=>show(back);
$('b-again').onclick=start;$('b-title').onclick=openTitle;$('pausebtn').onclick=()=>pause(true);
// training panel + hotkeys (1/2/3 spawn, 0 clear, H boxes, [ ] speed, \ freeze, . step)
function syncTrain(){document.querySelectorAll('[data-ts]').forEach(b=>b.classList.toggle('on',parseFloat(b.dataset.ts)===TR.ts));$('t-freeze').classList.toggle('on',!!TR.freeze)}
document.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>spawnDummy(b.dataset.sp));
$('t-clear').onclick=clearDummies;$('t-moves').onclick=toggleMoves;$('t-feel').onclick=toggleFeel;$('t-info').onclick=toggleInfo;$('t-exit').onclick=openTitle;
['boxes','frames','hist','god','passive','inf','mortal'].forEach(k=>{const el=$('t-'+k);el.onchange=()=>{TR[k]=el.checked?1:0}});
document.querySelectorAll('[data-ts]').forEach(b=>b.onclick=()=>{TR.ts=parseFloat(b.dataset.ts);syncTrain()});
$('t-freeze').onclick=()=>{TR.freeze^=1;syncTrain()};
$('t-step').onclick=()=>{TR.freeze=1;TR.step=1;syncTrain()};
$('trainpanel').addEventListener('click',e=>{if(e.target.blur)e.target.blur()});
addEventListener('keydown',e=>{if(state!=='train'||paused||e.repeat)return;const k=e.key;
 if(k==='m'||k==='M')toggleMoves();else if(k==='f'||k==='F')toggleFeel();else if(k==='i'||k==='I')toggleInfo();else if(k==='1')spawnDummy('g');else if(k==='2')spawnDummy('r');else if(k==='3')spawnDummy('b');else if(k==='4')spawnDummy('u');else if(k==='5')spawnDummy('f');else if(k==='6')spawnDummy('c');else if(k==='0')clearDummies();
 else if(k==='h'||k==='H'){TR.boxes^=1;$('t-boxes').checked=!!TR.boxes}
 else if(k==='['){TR.ts=TR.ts>.25?TR.ts/2:.25;syncTrain()}else if(k===']'){TR.ts=TR.ts<1?TR.ts*2:1;syncTrain()}
 else if(k==='\\'){TR.freeze^=1;syncTrain()}else if(k==='.'){TR.freeze=1;TR.step=1;syncTrain()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&live())pause(true)});
function update(){
 const hold=()=>{for(const I of INP)for(const a in I.press)I.press[a]++;for(const p of PL)if(p.att)p.att.pf++};   // input buffers don't expire during hit-stop
 for(const f of[...PL,...E])if(f.hs>0)f.hs--;
 if(stop>0){stop--;hold();return}
 if(slow>0){slow--;if(fr%3){hold();return}}
 for(const p of PL){use(p);updP()}use(PL[0]);
 director();
 for(const e of E)updE(e);
 bowl();sep();
 E=E.filter(e=>!e.gone);
 {const cs=E.filter(e=>e.corpse&&e.rag&&!e.rag.dis);if(cs.length>12){cs.sort((a,b)=>b.ct-a.ct);for(const c of cs.slice(0,cs.length-12))c.rag.dis=1}}   // body cap
 for(const e of E){if(e.corpse)continue;if(!isFinite(e.x)||!isFinite(e.y)){e.x=W/2;e.y=G;e.vx=e.vy=0;e.st='down';e.dt=20}if(e.st==='fly'){if(++e.ft>400){e.st='down';e.dt=20;e.y=G}}else e.ft=0}   // safety net: nothing stays stuck
 if(PL.some(p=>p.st!=='dead')&&state==='play'){
  if(queue.length&&--spawnT<=0&&E.filter(e=>!e.dying).length<Math.min(8,4+(wave>>1))){spawn(queue.shift());spawnT=45}
  if(!queue.length&&!E.some(e=>!e.dying)){if(!cl){cl=110;bn('WAVE CLEAR!');for(const p of PL)if(p.st!=='dead')p.hp=Math.min(p.max,p.hp+30);score+=wave*50;sfx(600,.3,'square',.05,400)}else if(--cl<=0)nextWave()}
 }
 for(const x of FX){x.l--;if(x.k==='sh'){x.x+=x.vx;x.vy+=.5;x.y=Math.min(G-6,x.y+x.vy);x.a+=x.va;if(x.y>=G-6){x.vx*=.8;x.va*=.7}}
  if(x.k==='d'){x.x+=x.vx;x.y+=x.vy}else if(x.k==='c'){x.x+=x.vx;x.y+=x.vy;x.vy+=.08;x.vx*=.97;x.a+=x.va}}FX=FX.filter(x=>x.l>0);
 for(const g of GH)g.l--;GH=GH.filter(g=>g.l>0);
}
// ===== SCREEN FIT (M1): sharp canvas on retina, cached grid layer =====
function buildGrid(){gridC.width=cv.width;gridC.height=cv.height;const g=gridC.getContext('2d');g.setTransform(DPR,0,0,DPR,0,0);
 g.strokeStyle='#e3e9f2';g.lineWidth=1;g.beginPath();for(let x=0;x<=W;x+=30){g.moveTo(x,0);g.lineTo(x,H)}for(let y=0;y<=H;y+=30){g.moveTo(0,y);g.lineTo(W,y)}g.stroke()}
function resize(){const w=$('wrap');w.style.setProperty('--wh',w.clientHeight+'px');applyLayout(ED?ED.draft:null);
 if(document.body.classList.contains('train')){const tp=$('trainpanel');document.body.style.setProperty('--ph',(tp.offsetHeight+28)+'px')}
const d=Math.max(1,Math.min(2,(cv.clientWidth/W)*(window.devicePixelRatio||1)));
 if(d!==gridDPR){DPR=d;cv.width=Math.round(W*d);cv.height=Math.round(H*d);buildGrid();gridDPR=d}}
addEventListener('resize',resize);if(window.ResizeObserver){const ro=new ResizeObserver(()=>{gridDPR=0;resize()});ro.observe(cv);ro.observe($('trainpanel'))}
// ===== MAIN LOOP: fixed 60 Hz simulation =====
let last=performance.now(),acc=0;
function tick(){
 if(state==='train'&&TR.freeze&&!TR.step)return;
 TR.step=0;fr++;
 if(state==='play'||state==='train')update()}
function loop(now){
 const dt=Math.min(100,now-last);last=now;
 pollPad();
 if(portraitMQ.matches&&live())pause(true);
 if(!paused){acc+=dt*(state==='train'?TR.ts:1);while(acc>=16.67){acc-=16.67;tick()}}
 render();requestAnimationFrame(loop)}
applySet();resize();bindSettings();syncTrain();openTitle();
if(/[?&]selftest/.test(location.search)){const R=selfTest(),d=document.createElement('pre');d.id='selftest';d.textContent='SELFTEST '+R.hash+'  (ticks '+R.ticks+', wave '+R.wave+', score '+R.score+')';
 d.style.cssText='position:fixed;left:8px;top:8px;z-index:99;background:#1c1626;color:#ffd400;padding:8px 12px;font:14px monospace;border-radius:6px';document.body.appendChild(d);console.log(d.textContent)}
requestAnimationFrame(loop);

