const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M28: the Desert story. Sand Dunes, the Oasis and inside the Pyramid; quicksand; gaps in the Pyramid's floor with a
// rope to swing over each (hold Punch); wall torches lighting the dark; pink mummies; the Pink Pharaoh's scarabs.
const {chromium,devices}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext(devices['iPad (gen 7) landscape']);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(GAME);await p.waitForTimeout(400);
const ev=x=>p.evaluate(x);
ok(await ev("THEMES.desert&&THEMES.desert.biomes.join()==='sand,oasis,pyramid'&&THEMES.desert.boss.t==='H'&&BIOMES.sand.quick&&BIOMES.oasis.quick&&BIOMES.pyramid.pits&&BIOMES.pyramid.dark"),'the Desert story: Sand Dunes, the Oasis, the Pyramid, and the Pink Pharaoh at the end');
ok(await ev("['sand','oasis','pyramid','boss-desert'].every(k=>MUSIC[k])&&['sand','oasis','pyramid'].every(k=>LOOKS[k])"),'each place has its own look and song, and the Pharaoh his own boss song');
ok(await ev("T.w.col==='#ff6fae'&&T.w.look.extra.includes('mummy')&&T.H.look.extra.includes('nemes')&&ED_FOES.includes('w')&&ED_BOSSES.includes('H')"),'pink mummies and the Pharaoh, in the level creator too');
// a run: the layout
const L=await ev(`(()=>{SET.seed='3';startRun('desert');cineEnd();for(const t of LV.trans)t.done=1;for(const g of LV.gates)g.hp=0;for(const e of LV.encs)e.st=2;
 const D=LV.dz,seg=b=>LV.segs.find(s=>s.b===b),inS=(x,b)=>x>=seg(b).x0&&x<seg(b).x1;
 const pyr=LV.ch.filter(c=>BIOMES[THEMES.desert.biomes[c.biome]].dark);
 const gaps=pyr.every(c=>{const t=c.props.filter(p=>p.k==='walltorch').map(p=>p.x).sort((a,b)=>a-b);return t.length&&t[0]<=TORCH_GAP&&t.every((x,i)=>!i||x-t[i-1]<=TORCH_GAP)&&c.w-t[t.length-1]<=TORCH_GAP});
 const arenas=LV.encs.filter(e=>e.lock!==undefined).map(e=>[e.lock,e.lock+W]);
 return {pits:D.pits.length,ropes:D.ropes.length,pitsIn:D.pits.every(q=>inS(q.x0,'pyramid')),pitsFree:D.pits.every(q=>!arenas.some(a=>q.x1>a[0]&&q.x0<a[1])),
  qsSand:D.qs.some(q=>inS(q.x0,'sand')),qsOasis:D.qs.some(q=>inS(q.x0,'oasis')),qsNotPyr:!D.qs.some(q=>inS(q.x0,'pyramid')),gaps,dmax:DARK_MAX}})()`);
ok(L.pits>=2&&L.ropes===L.pits&&L.pitsIn&&L.pitsFree,'gaps in the Pyramid\'s floor between its fights, each with a rope '+JSON.stringify(L));
ok(L.qsSand&&L.qsOasis&&L.qsNotPyr,'quicksand in the Sand Dunes and at the Oasis');
ok(L.gaps&&L.dmax<=0.7,'a wall torch at least every '+320+' across the Pyramid, and the dark never goes past '+L.dmax);
// put player 1 at x (with the camera there and a frame for the walls to follow)
const put=`const put=(x)=>{const P=PL[0];CAM.x=x-300;fr++;update();P.x=x;P.y=G;P.vx=P.vy=0;P.st='free';P.rope=null;P.sink=0;P.hp=P.max;P.inv=0;fr++;update();P.x=x;P.y=G;P.vx=0;return P};`;
// the rope: run, jump, hold Punch to grab it; Right swings; let go to fly over
const R=await ev(`(()=>{${put}E.length=0;const D=LV.dz,pt=D.pits[0],r=D.ropes[0],P=put(pt.x0-60);
 setA('kb','r',1);for(let i=0;i<14;i++){fr++;update()}setA('kb','j',1);fr++;update();setA('kb','j',0);setA('kb','p',1);let grab=0,held=0,amax=0;
 for(let i=0;i<200;i++){fr++;update();if(P.rope){grab=1;held++;amax=Math.max(amax,r.a)}}
 const on=!!P.rope,by=r.by;setA('kb','p',0);for(let i=0;i<150;i++){fr++;update()}setA('kb','r',0);for(let i=0;i<20;i++){fr++;update()}
 return {grab,held,amax:+amax.toFixed(2),on,by,x:Math.round(P.x),x1:pt.x1,y:P.y,hp:P.hp,max:P.max,free:r.by<0}})()`);
ok(R.grab&&R.on&&R.by===0&&R.held>150,'holding Punch, a jump grabs the rope and you hang on '+JSON.stringify(R));
ok(R.amax>0.8,'Right swings the rope higher and higher');
ok(R.x>R.x1&&R.y===await ev('G')&&R.hp===R.max&&R.free,'letting go of Punch flies you over the gap, with the swing\'s speed');
// a fall: a heart lost, back on the last ledge
const PF=await ev(`(()=>{${put}const pt=LV.dz.pits[0];put(pt.x0-300);E.length=0;FX.length=0;spawn({t:'g',x:pt.x0+200});const e=E[0];e.x=(pt.x0+pt.x1)/2;e.y=G-20;e.st='fly';let big=0;for(let i=0;i<80;i++){fr++;update();big=Math.max(big,...FX.filter(o=>o.k==='s').map(o=>o.r),0)}return {ko:!!(e.dying||e.gone),big}})()`);
ok(PF.ko&&PF.big<100,'an enemy that falls into a gap is knocked out, with a normal-sized burst '+JSON.stringify(PF));
const F=await ev(`(()=>{${put}const pt=LV.dz.pits[0],P=put(pt.x0-40);setA('kb','r',1);let fell=0;for(let i=0;i<25;i++){fr++;update()}setA('kb','r',0);for(let i=0;i<90;i++){fr++;update();if(P.y>G+50)fell=1}
 return {fell,hp:P.hp,max:P.max,x:Math.round(P.x),x0:pt.x0,y:P.y}})()`);
ok(F.fell&&F.hp===F.max-F.max/5&&F.x<=F.x0&&F.x>F.x0-60&&F.y<=await ev('G'),'falling into a gap costs a heart and pops you back on the last ledge '+JSON.stringify(F));
ok(await ev(`(()=>{${put}const pt=LV.dz.pits[0],P=put(pt.x0-40);P.hp=10;P.x=(pt.x0+pt.x1)/2;P.y=G-10;for(let i=0;i<80;i++){fr++;update()}return P.hp===1&&P.st!=='dead'})()`),'a fall never knocks you out');
// an enemy walking about stops at a gap's edge
ok(await ev(`(()=>{${put}const pt=LV.dz.pits[0];put(pt.x0-500);E.length=0;spawn({t:'g',x:pt.x0-30});const e=E[0];e.y=G;e.st='free';e.x=pt.x0-30;for(let i=0;i<20;i++){e.st='free';e.vx=4;e.x+=0;fr++;update()}return e.x<pt.x0&&e.y===G})()`),'a pink fighter walking about doesn\'t step into a gap');
// quicksand: you sink slowly; taps of Jump climb out
const Q=await ev(`(()=>{${put}startRun('desert');cineEnd();for(const t of LV.trans)t.done=1;for(const g of LV.gates)g.hp=0;for(const e of LV.encs)e.st=2;E.length=0;const q=LV.dz.qs.reduce((a,b)=>b.x1-b.x0>a.x1-a.x0?b:a),P=put((q.x0+q.x1)/2);for(let i=0;i<60;i++){fr++;update()}const s1=P.sink;
 for(let k=0;k<6;k++){setA('kb','j',1);fr++;update();setA('kb','j',0);for(let i=0;i<6;i++){fr++;update()}}const s2=P.sink;
 P.x=(q.x0+q.x1)/2;P.y=G;let popped=0;for(let i=0;i<400&&!popped;i++){P.x=(q.x0+q.x1)/2;fr++;update();if(P.hp<P.max)popped=1}for(let i=0;i<4;i++){fr++;update()}
 return {s1:+s1.toFixed(1),s2:+s2.toFixed(1),popped,hp:P.hp,max:P.max,out:P.x<q.x0||P.x>q.x1,sink:P.sink}})()`);
ok(Q.s1>10&&Q.s1<25,'standing in quicksand you sink, slowly '+JSON.stringify(Q));
ok(Q.s2<Q.s1,'tapping Jump climbs out');
ok(Q.popped&&Q.hp===Q.max-Q.max/5&&Q.out,'sinking all the way costs a heart and pops you out at the edge');
// an enemy knocked into quicksand is swallowed; the Pharaoh isn't
const S=await ev(`(()=>{${put}startRun('desert');cineEnd();for(const t of LV.trans)t.done=1;for(const g of LV.gates)g.hp=0;for(const e of LV.encs)e.st=2;E.length=0;const q=LV.dz.qs[LV.dz.qs.length-1],P=put(q.x0-300);spawn({t:'g',x:(q.x0+q.x1)/2});spawn({t:'H',x:(q.x0+q.x1)/2+20});const e=E[0],h=E[1];for(const f of E){f.y=G;f.x=(q.x0+q.x1)/2}
 hurtE(e,{dmg:1,kb:1,lift:-4,ef:'launch'},1,null,P);let gone=0,big=0;for(let i=0;i<240;i++){fr++;update();h.x=(q.x0+q.x1)/2;if(e.dying)gone=1;big=Math.max(big,...FX.filter(o=>o.k==='s').map(o=>o.r),0)}return {gone,big,boss:h.hp>0&&!(h.sink>0)}})()`);
ok(S.big<100,'being swallowed knocks it out with a normal-sized burst, not one that fills the screen');
ok(S.gone&&S.boss,'a pink fighter knocked into quicksand is swallowed; the Pharaoh doesn\'t sink '+JSON.stringify(S));
// the Pharaoh's scarabs: they chase you, sting, and a Surge run scatters them
const W2=await ev(`(()=>{${put}for(const t of LV.trans)t.done=1;for(const g of LV.gates)g.hp=0;for(const e of LV.encs)e.st=2;E.length=0;const s=LV.segs[2],P=put(s.x0+2700);spawn({t:'H',x:P.x+400});const h=E[0];h.y=G;h.st='free';h.face=-1;h.x=P.x+400;h.tgx=P.x;
 swarmSend(h);const n=swarmCount(),y0=LV.sw[0].x;let hit=0;for(let i=0;i<120;i++){h.st='free';h.cd=99;h.x=P.x+400;P.x=s.x0+2700;fr++;update();if(P.hp<P.max)hit=1}
 P.hp=P.max;P.st='free';P.inv=0;LV.sw=null;for(let i=0;i<30;i++){fr++;update()}swarmSend(h);const sw=LV.sw[LV.sw.length-1];sw.x=P.x+200;sw.y=P.y-45;setA('kb','r',1);setA('kb','s',1);let gone=0;for(let i=0;i<60&&!gone;i++){h.st='free';h.cd=99;fr++;update();gone=!LV.sw||!LV.sw.includes(sw)}
 setA('kb','r',0);setA('kb','s',0);return {n,hit,gone,pick:Object.keys(EA).includes('hswarm')}})()`);
ok(W2.n>=1&&W2.hit,'the Pharaoh sends a swarm of scarabs that chases you and stings '+JSON.stringify(W2));
ok(W2.gone,'a Surge run straight through the swarm scatters it');
// drawing: the three places, the mummies and the Pharaoh, the dark Pyramid
const D=await ev(`(()=>{${put}E.length=0;const out={};for(const b of ['sand','oasis','pyramid']){const s=LV.segs.find(q=>q.b===b);put(s.x0+1500);spawn({t:'w',x:s.x0+1650});spawn({t:'H',x:s.x0+1800});for(let i=0;i<20;i++){fr++;update()}render();out[b]=1}return out})()`);
ok(D.pyramid,'the Desert draws: dunes, the oasis, the Pyramid with its torches, mummies and the Pharaoh');
const lum=await ev(`(()=>{${put}E.length=0;const s=LV.segs.find(q=>q.b==='pyramid');put(s.x0+1500);for(let i=0;i<5;i++){fr++;update()}render();const cv=ctx.canvas,d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let t=0,n=0;for(let i=0;i<d.length;i+=4*97){t+=(d[i]+d[i+1]+d[i+2])/3;n++}return Math.round(t/n)})()`);
ok(lum>70,'inside the Pyramid it\'s dark, but never too dark to see (brightness '+lum+')');
ok(errs.length===0,'no errors '+JSON.stringify(errs.slice(0,3)));
await b.close();if(fails){console.log(fails+' FAILED');process.exit(1)}console.log('ALL PASS')})();
