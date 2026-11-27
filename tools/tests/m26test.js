const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
// M26: the level creator's top bar (DONE, a name with a pencil, DELETE; the tabs and help underneath, nothing
// overlapping); stories and arenas (NEW STORY, NEW ARENA, MY STORIES, MY ARENAS); RANDOM on the story pickers; the
// online room: picking what's already picked keeps everyone ready, the host's pick is clear for guests, and the
// "Tap READY?" note only shows in a room with someone else in it.
const {chromium,devices}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
for(const [dn,dev] of [['iPad',devices['iPad (gen 7) landscape']],['phone',devices['iPhone 13 landscape']]]){
const c=await b.newContext(dev);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(GAME);await p.waitForTimeout(300);
const ev=x=>p.evaluate(x);
await ev("SET.tut=1;titleOpenAll();openLevels()");
const lay=await ev(`(()=>{const R=id=>$(id).getBoundingClientRect(),hit=(a,b)=>a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom;
 const out={};for(const t of ['NEW STORY','NEW ARENA'])out[t]=[...$('ed-list').children].some(x=>x.textContent.includes(t));out.title=$('s-levels').querySelector('h2').textContent;
 edNew('woods');const d=R('ed-back'),n=document.querySelector('.edname').getBoundingClientRect(),del=R('ed-del'),tabs=[...$('ed-tabs').children].map(x=>x.getBoundingClientRect()),m=R('ed-msg'),pl=R('ed-play'),pt=R('ed-part');
 out.name=$('ed-name').value;out.pen=!!document.querySelector('.edname .chpen');out.dash=getComputedStyle(document.querySelector('.edname')).borderBottomStyle;
 out.clear=!hit(d,m)&&!hit(n,m)&&!tabs.some(t=>hit(t,n)||hit(t,d)||hit(t,del)||hit(t,m)||hit(t,pl)||hit(t,pt))&&!hit(del,pl)&&!hit(n,del);return out})()`);
ok(lay['NEW STORY']&&lay['NEW ARENA']&&lay.title==='MY STORIES','['+dn+'] MY STORIES offers NEW STORY and NEW ARENA');
ok(lay.name==='STORY 1'&&lay.pen&&lay.dash==='dashed','['+dn+'] a new story is called STORY 1; its name has a pencil and a dashed line (tap to rename)');
ok(lay.clear,'['+dn+'] DONE, the name, DELETE, the tabs, the help and PLAY don\'t overlap '+JSON.stringify(lay));
if(dn==='iPad'){
ok(await ev("$('ed-del').textContent==='DELETE STORY'&&![...$('ed-pal').querySelectorAll('button')].some(x=>/DELETE STORY|DELETE LEVEL/.test(x.textContent))&&(()=>{$('ed-tabs').querySelector('[data-k=\"parts\"]').click();return ![...$('ed-pal').querySelectorAll('button')].some(x=>/DELETE LEVEL|DELETE STORY/.test(x.textContent))})()"),'DELETE STORY sits beside the name (not in PARTS any more)');
ok(await ev("(()=>{const n=EDIT.levels.length;$('ed-del').click();const a=$('ed-del').textContent==='TAP AGAIN TO DELETE'&&EDIT.levels.length===n;edAct(3,0);const kept=$('ed-del').textContent==='DELETE STORY'&&EDIT.levels.length===n;$('ed-del').click();$('ed-del').click();return a&&kept&&EDIT.levels.length===n-1&&SHOWN==='s-levels'})()"),'DELETE asks for a second tap; tapping anything else keeps it; the second tap deletes it');
ok(await ev("(()=>{edNew('castle',true);const a=$('ed-del').textContent==='DELETE ARENA'&&$('ed-name').value==='ARENA 1';openLevels();return a&&[...$('ed-list').children].some(x=>/ARENA: ARENA 1/.test(x.textContent))})()"),'an arena: DELETE ARENA, listed as ARENA: …');
// RANDOM and MY STORIES / MY ARENAS on the pickers
ok(await ev("(()=>{openThemes(()=>{});const t=[...$('th-cards').querySelectorAll('.thcard b')].map(x=>x.textContent);return t.includes('RANDOM')&&t.includes('MY STORIES')&&!t.includes('?')})()"),'Solo Story cards: RANDOM and MY STORIES');
ok(await ev("(()=>{openLobby();LB.mode='level';renderLobby();const t=[...$('lb-sub').querySelectorAll('b')].map(x=>x.textContent);return t.includes('RANDOM')&&t.includes('MY STORIES')&&!t.includes('?')})()"),'the local room\'s stories: RANDOM and MY STORIES');
ok(await ev("(()=>{LB.mode='vs';renderLobby();return [...$('lb-sub').querySelectorAll('b')].map(x=>x.textContent).includes('MY ARENAS')})()"),'the stage row: MY ARENAS');
// the online room (host): picking the same thing keeps everyone ready; a new pick unreadies
const sent=[];await p.exposeFunction('__sent',m=>sent.push(m));
await ev("(()=>{rtcSend=(id,m)=>window.__sent(m.t);show('s-online');Object.assign(NET,{on:true,host:true,code:'TIGER-12',mode:'level',theme:'castle',diff:1,players:[{id:'host',slot:0,name:'RON',f:curFighter(),ready:true},{id:'g1',slot:1,name:'RHETT',f:curFighter(),ready:true}],mySlot:0});netRoomChanged()})()");
ok(await ev("(()=>{$('on-sub').querySelector('[data-theme=\"castle\"]').click();$('on-diff').querySelector('[data-diff=\"1\"]').click();return NET.players.every(q=>q.ready)})()"),'the host tapping the story and difficulty already picked keeps everyone ready');
ok(await ev("(()=>{$('on-sub').querySelector('[data-theme=\"pirate\"]').click();return NET.players.every(q=>!q.ready)&&NET.theme==='pirate'})()"),'a different story unreadies everyone');
ok(await ev("(()=>{NET.players.forEach(q=>q.ready=true);$('on-modes').querySelector('[data-mode=\"vs\"]').click();return NET.players.every(q=>!q.ready)})()"),'a different mode does too');
// the READY note: only in a room, with someone else in it
ok(await ev("(()=>{NET.players[0].ready=false;renderOnline();const a=!$('on-wait').hidden;NET.players[1].left=1;renderOnline();const b=$('on-wait').hidden;NET.players[1].left=0;renderOnline();NET.on=false;NET.players=[];renderOnline();return a&&b&&$('on-wait').hidden})()"),'"Tap READY?" shows with someone else in the room, not once they\'ve left, and never outside a room');
// the guest sees the host's pick clearly
ok(await ev("(()=>{Object.assign(NET,{on:true,host:false,mode:'level',theme:'mountain',players:[{slot:0,name:'RHETT',f:curFighter(),ready:true},{slot:1,name:'RON',f:curFighter()}],mySlot:1});renderOnline();const on=$('on-sub').querySelector('[data-theme=\"mountain\"]'),off=$('on-sub').querySelector('[data-theme=\"castle\"]');const o=e=>+getComputedStyle(e.querySelector('.pimg')).opacity;const r=on.disabled&&o(on)===1&&o(off)<1;NET.on=false;NET.players=[];return r})()"),'a guest sees the host\'s pick at full strength (the others stay faded)');
}
await c.close()}
ok(errs.length===0,'no errors '+errs.join('|'));console.log(fails?fails+' FAILED':'ALL PASS');await b.close();})();
