// Recorded music (music/*.ogg, .m4a): served over http the game plays the recordings, only loads the ones that can
// come up next, picks the boss's song by who the boss is, and swaps a synth song for its recording once it arrives;
// opened from disk it never tries to load them and the synth songs play.
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
const ROOT=path.resolve(__dirname,'../..'),TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.ogg':'audio/ogg','.m4a':'audio/mp4','.json':'application/json'};
const loads=[];
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);const f=path.join(ROOT,u==='/'?'index.html':u);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}if(u.startsWith('/music/'))loads.push(u);r.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(9341);
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const errs=[];
const p=await b.newPage({viewport:{width:1080,height:810}});p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('http://127.0.0.1:9341/index.html');await p.waitForTimeout(300);
await p.mouse.click(5,5);await p.evaluate(()=>{SET.tut=1;titleOpenAll();audUnlock()});
const W=t=>p.waitForTimeout(t);
await W(2000);
ok(await p.evaluate(()=>MUS.cur&&MUS.cur.id==='menu'&&!MUS.cur.buf&&musPath('menu')===null),'the title screen keeps its built-in song');
ok(loads.every(u=>/\/music\/Menus\/(Character Creation|House Editor)\.ogg$/.test(u))&&loads.length===2,'on the menus only the Character screen\'s and the house builder\'s songs are loaded (Ogg here): '+loads.join(' '));
await p.evaluate(()=>show('s-char'));for(let i=0;i<40&&!(await p.evaluate(()=>MUS.cur&&MUS.cur.buf));i++)await W(100);
ok(await p.evaluate(()=>MUS.cur&&MUS.cur.id==='dressup'&&MUS.cur.buf&&MUS.cur.path==='Menus/Character Creation'),'the Character screen plays its recording');
await p.evaluate(()=>openTitle());
await p.evaluate(()=>{SET.seed='4';startRun('castle')});
for(let i=0;i<60&&!(await p.evaluate(()=>MUS.cur&&MUS.cur.id==='woods'&&MUS.cur.buf));i++){await p.evaluate(()=>{if(LV.cine&&LV.cine.k==='drawin')cineEnd()});await W(100)}
ok(await p.evaluate(()=>MUS.cur&&MUS.cur.id==='woods'&&MUS.cur.buf&&MUS.cur.path==='Castle Siege/The Woodland Trail'),'in Castle Siege: the recorded Woodland Trail');
await W(4500);
ok(await p.evaluate(()=>{const k=Object.keys(MUS_BUF).sort().join();return k==='Castle Siege/King Boss,Castle Siege/The Castle,Castle Siege/The Sewers,Castle Siege/The Woodland Trail'}),'in a level only its places\' songs and its boss\'s are kept: '+await p.evaluate(()=>Object.keys(MUS_BUF).join()));
ok(await p.evaluate(()=>musKey('boss')==='boss-G'&&(()=>{const k=LV;LV={encs:[{boss:'Y',st:1}]};const r=musKey('boss');LV=k;return r==='boss-Y'})()),'the boss song goes by who the boss is (a Yeti in your own level gets the Yeti\'s)');
ok(await p.evaluate(()=>musKey('ashslope')==='ash'&&musPath('peak')==='Mountain/Snowy Peaks'&&musPath('tr-catapult')===null),'places go by their look; transitions stay synth');
// a synth song is swapped for its recording when it arrives
await p.evaluate(()=>{delete MUS_BUF['Castle Siege/The Woodland Trail'];MUS_LOAD['Castle Siege/The Woodland Trail']='loading';musFade(0.1);musPlay('woods',0)});
ok(await p.evaluate(()=>MUS.cur&&!MUS.cur.buf),'(the Woodland Trail playing as synth while its file loads)');
await p.evaluate(()=>{delete MUS_LOAD['Castle Siege/The Woodland Trail']});
for(let i=0;i<40&&!(await p.evaluate(()=>MUS.cur&&MUS.cur.buf));i++)await W(100);
ok(await p.evaluate(()=>MUS.cur&&MUS.cur.id==='woods'&&MUS.cur.buf),'the synth song cross-fades to the recording when it arrives');
await p.evaluate(()=>openTitle());await W(5000);
ok(await p.evaluate(()=>Object.keys(MUS_BUF).every(k=>k.startsWith('Menus/'))),'back on the menus the level\'s songs are let go');
// opened from disk: no loading at all
const q=await b.newPage();q.on('pageerror',e=>errs.push(e.message));await q.goto('file://'+ROOT+'/index.html');await q.waitForTimeout(300);
await q.mouse.click(5,5);await q.evaluate(()=>{SET.tut=1;titleOpenAll();audUnlock()});await q.waitForTimeout(1200);
await q.evaluate(()=>show('s-char'));await q.waitForTimeout(800);
ok(await q.evaluate(()=>MUS.cur&&MUS.cur.id==='dressup'&&!MUS.cur.buf&&Object.values(MUS_LOAD).every(v=>v==='failed')),'opened from disk: the synth songs play, nothing is fetched');
ok(errs.length===0,'no errors '+errs.join(' | '));
console.log(fails?fails+' FAILED':'ALL PASS');await b.close();srv.close();process.exit(fails?1:0)})();
