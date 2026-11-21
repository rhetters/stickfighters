const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// two (or three) browsers play online through the local signaling server
const {chromium}=require('playwright');const {spawn}=require('child_process');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const srv=spawn('node',[__dirname+'/sigserver.js','9311']);await new Promise(r=>setTimeout(r,400));
const b=await chromium.launch();const url=GAME+(process.env.Q||('?signal='+encodeURIComponent('ws://127.0.0.1:9311/peerjs?key=peerjs')));const mq=spawn('node',[__dirname+'/mqttbroker.js','9320']);
const errs=[];const mk=async(n)=>{const c=await b.newContext({viewport:{width:1024,height:768}});const p=await c.newPage();p.on('pageerror',e=>errs.push(n+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(n+' console: '+m.text())});await p.goto(url);await p.waitForTimeout(300);
 await p.evaluate(n=>{saveFighter(0,{...FIGHTER0,name:n});titleOpenAll();},n);return p;};
const H=await mk('HOSTY'),G=await mk('GUESTY');
await H.evaluate(()=>{$('b-online').click();$('on-host').click()});await H.waitForTimeout(3000);
const code=await H.evaluate(()=>NET.code);ok(/^[A-Z]+-\d\d$/.test(code),'host made room '+code);
// guest picks the code with the arrows
await G.evaluate(code=>{$('b-online').click();const [w,n]=code.split('-');ONC.w=ROOM_WORDS.indexOf(w);ONC.a=+n[0];ONC.b=+n[1];renderOnline();$('on-join').click();},code);
await G.waitForTimeout(2500);
ok(await G.evaluate(()=>NET.on&&NET.mySlot===1),'guest joined as P2');
ok(await H.evaluate(()=>NET.players.length===2&&NET.players[1].name==='GUESTY'),'host sees the guest');
ok(await G.evaluate(()=>NET.players.length===2&&$('on-cards').textContent.includes('HOSTY')),'guest sees the room');
// wrong code
const X=await mk('LOST');await X.evaluate(()=>{$('b-online').click();ONC.w=(ONC.w+3)%16;renderOnline();$('on-join').click()});
await X.waitForTimeout(16500);ok(await X.evaluate(()=>!NET.on&&/No room/.test($('on-msg').textContent)),'wrong code says no room: '+await X.evaluate(()=>$('on-msg').textContent));
// start co-op
await H.evaluate(()=>{Object.assign(FEEL,{hitstop:1.2,shake:1.5,body:8})});await H.evaluate(()=>{NET.mode='level';netRoomChanged();$('on-start').click()});await H.waitForTimeout(500);
ok(await G.evaluate(()=>FEEL.hitstop===0&&FEEL.shake===0&&FEEL.body===1)&&await H.evaluate(()=>FEEL.hitstop===0&&FEEL.body===1),'online: no hit-stop or shake and bodies clear in a second, whatever the host had set');
ok(await G.evaluate(()=>NET.match&&state==='play'&&MODE===LEVEL&&PL.length===2),'match started on the guest');
ok(await H.evaluate(()=>PL.map(p=>p.name).join()==='HOSTY,GUESTY'),'both fighters in the match');
// each plays with their own keyboard
const hold=async(p,keys,ms)=>{for(const k of keys)await p.keyboard.down(k);await p.waitForTimeout(ms);for(const k of keys)await p.keyboard.up(k);};
await Promise.all([hold(H,['d'],1200),hold(G,['a'],700)]);
await Promise.all([hold(H,['j'],300),hold(G,['k'],200)]);
await H.waitForTimeout(400);
const st=async p=>p.evaluate(()=>({f:NET.simF,x:PL.map(q=>Math.round(q.x))}));
const a=await st(H),g=await st(G);console.log('host',JSON.stringify(a),'guest',JSON.stringify(g));
ok(a.x[0]>a.x[1]+50,'host moved right and guest moved left');
// compare fingerprints at the same frame: pause input, let both reach the same frame
await H.waitForTimeout(500);
const hf=await H.evaluate(()=>[NET.simF,simHash()]),gf=await G.evaluate(()=>[NET.simF,simHash()]);
console.log('frames',hf,gf);
// run to a common frame via hashes table check: no desync message
await H.waitForTimeout(3000);
ok(await G.evaluate(()=>NET.match&&state==='play'),'no desync after a few seconds');
ok(await H.evaluate(()=>NET.match),'host still in the match');
// a deliberately broken guest game is caught by the fingerprint check
await G.evaluate(()=>{PL[1].x+=40});await H.waitForTimeout(2600);
ok(await G.evaluate(()=>!NET.match&&/out of sync/.test($('on-msg').textContent)),'a mismatch is caught and the match stops');
ok(await H.evaluate(()=>!NET.match&&!$('on-room').hidden),'host back in the room after the mismatch');
await H.evaluate(()=>{NET.mode='level';netRoomChanged();$('on-start').click()});await H.waitForTimeout(600);
ok(await G.evaluate(()=>NET.match&&state==='play'),'a new match starts fine after that');
// host ends match -> both back in room
await H.evaluate(()=>{pause(true);$('b-quit').click()});await H.waitForTimeout(500);
ok(await G.evaluate(()=>!NET.match&&!$('s-online').hidden&&!$('on-room').hidden),'END MATCH brings everyone back to the room');
// versus
await H.evaluate(()=>{NET.mode='vs';netRoomChanged();$('on-start').click()});await H.waitForTimeout(600);
ok(await G.evaluate(()=>MODE===VERSUS&&state==='play'),'versus started for the guest');
// guest leaves mid match
await G.evaluate(()=>{pause(true);$('b-quit').click()});await G.waitForTimeout(1200);
ok(await G.evaluate(()=>!NET.on&&!$('s-title').hidden),'guest left to the title');
ok(await H.evaluate(()=>NET.players.find(p=>p.slot===1).left===true),'host marks the guest as left');
const f1=await H.evaluate(()=>NET.simF);await H.waitForTimeout(800);ok(await H.evaluate(()=>NET.simF)>f1+30,'host game keeps running without the guest');
ok(errs.length===0,'no page errors '+errs.join(' | '));
console.log(fails?fails+' FAILED':'ALL PASS');await b.close();srv.kill();mq.kill();})();
