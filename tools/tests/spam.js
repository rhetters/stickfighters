const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
const {chromium,devices}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices['iPad (gen 7) landscape']});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(GAME);await p.evaluate("SET.tut=1");await p.waitForTimeout(150);await p.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await p.waitForTimeout(300);await p.evaluate('openSolo()');await p.tap('#b-start');await p.evaluate("SHOWN==='s-themes'&&THS.kind==='stage'&&THS.go('?')");await p.waitForTimeout(400);
const ev=x=>p.evaluate(x),W=ms=>p.waitForTimeout(ms);
const bb=async s=>{const r=await p.locator(s).boundingBox();return{x:r.x+r.width/2,y:r.y+r.height/2,w:r.width}};
const st=await bb('#stick'),btn={p:await bb('.tb[data-a=p]'),k:await bb('.tb[data-a=k]'),j:await bb('.tb[data-a=j]'),s:await bb('.tb[data-a=s]')};
const cdp=await c.newCDPSession(p);const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
// 1. what Rhett did: thumb on the stick moving around, other thumb hammering punch/kick, for ~8 s, with ghost touches mixed in
await ev("ev_ok=1;PL[0].hp=9999");let ang=0;
await T('touchStart',[{x:st.x,y:st.y,id:1}]);
for(let i=0;i<220;i++){ang+=.35;const sx=st.x+Math.cos(ang)*st.w*.4,sy=st.y+Math.sin(ang)*st.w*.3;const k=['p','k','p','k','j'][i%5],q=btn[k];
 await T('touchMove',[{x:sx,y:sy,id:1}]);await T('touchStart',[{x:sx,y:sy,id:1},{x:q.x,y:q.y,id:2+i%3}]);await T('touchEnd',[{x:sx,y:sy,id:1}].map(t=>t));
 if(i%37===0)await ev(`document.getElementById('stick').dispatchEvent(new PointerEvent('pointerdown',{pointerId:${9000+i},pointerType:'touch',clientX:${st.x},clientY:${st.y},bubbles:true,cancelable:true}))`);
 if(i%53===0)await ev(`document.querySelector('.tb[data-a=p]').dispatchEvent(new PointerEvent('pointerdown',{pointerId:${8000+i},pointerType:'touch',clientX:${btn.p.x},clientY:${btn.p.y},bubbles:true,cancelable:true}))`);
 await W(12)}
await T('touchEnd',[]);await W(400);
const after=await ev("JSON.stringify({sid,K:INP[0].K,on:[...document.querySelectorAll('.tb.on')].map(b=>b.dataset.a)})");
ok(!/"[lrudjpk]":1/.test(after)&&after.includes('"on":[]'),'8 s of stick + button spamming with ghost touches: nothing left stuck after letting go '+after.slice(0,60));
await T('touchStart',[{x:st.x,y:st.y,id:1}]);await T('touchMove',[{x:st.x+st.w*.45,y:st.y,id:1}]);await W(60);const r1=await ev('INP[0].K.r');
await T('touchMove',[{x:st.x-st.w*.45,y:st.y,id:1}]);await W(60);const l1=await ev('INP[0].K.l');await T('touchEnd',[]);await W(60);
ok(r1===1&&l1===1&&await ev('INP[0].K.r+INP[0].K.l')===0,'stick still responds right / left / release afterwards');
await T('touchStart',[{x:btn.p.x,y:btn.p.y,id:7}]);await W(40);const pk=await ev('INP[0].K.p');await T('touchEnd',[]);await W(40);ok(pk===1&&await ev('INP[0].K.p')===0,'PUNCH still presses and releases');
// 2. Surge toggle (enemies cleared and player invulnerable so a hit cannot interrupt the run)
await ev("E.forEach(e=>e.gone=1);E=[];PL[0].inv=99999;PL[0].st='free'");
await ev("pause(true)");await p.tap('#b-set2');await W(100);
ok(await p.inputValue('#o-surge')==='hold','Surge button setting defaults to Hold');
await p.selectOption('#o-surge','toggle');await p.tap('#b-back');await W(80);await p.tap('#b-resume');await W(200);
await T('touchStart',[{x:btn.s.x,y:btn.s.y,id:5}]);await W(40);await T('touchEnd',[]);await W(150);
ok(await ev('INP[0].K.s')===1&&await ev("document.querySelector('.tb[data-a=s]').classList.contains('latched')"),'Toggle: tap SURGE once and it stays on (button stays lit)');
await T('touchStart',[{x:st.x,y:st.y,id:1}]);await T('touchMove',[{x:st.x+st.w*.45,y:st.y,id:1}]);await W(300);const run=await ev('PL[0].running');await T('touchEnd',[]);
ok(run===1,'Toggle: with Surge on, the stick alone does a Surge run');
await T('touchStart',[{x:btn.s.x,y:btn.s.y,id:5}]);await W(40);await T('touchEnd',[]);await W(100);ok(await ev('INP[0].K.s')===0,'Toggle: tap again and Surge turns off');
await p.keyboard.press('Shift');await W(80);ok(await ev('INP[0].K.s')===1,'Toggle works from the keyboard too (Shift tap = on)');
await ev("PL[0].stm.v=1");await T('touchStart',[{x:st.x,y:st.y,id:1}]);await T('touchMove',[{x:st.x+st.w*.45,y:st.y,id:1}]);await W(400);await T('touchEnd',[]);
ok(await ev('PL[0].stm.winded>0')&&await ev('INP[0].K.s')===0,'Toggle: running out of Surge switches it off');
await ev("SET.surge='hold';save()");await p.keyboard.down('Shift');await W(60);const h1=await ev('INP[0].K.s');await p.keyboard.up('Shift');await W(60);
ok(h1===1&&await ev('INP[0].K.s')===0,'Hold mode: on only while held');
console.log(fails?fails+' FAILURES':'ALL OK','| errors:',errs.length?errs:'none');await b.close()})();
