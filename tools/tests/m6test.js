const GAME='file://'+require('path').resolve(__dirname,'../../index.html'); // the game, opened from disk
const {chromium,devices}=require('playwright');
const S=process.argv[2];let fails=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext({...devices['iPad (gen 7) landscape']});const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto(GAME);await p.evaluate("SET.tut=1");await p.waitForTimeout(150);await p.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await p.waitForTimeout(400);
const ev=x=>p.evaluate(x),W=ms=>p.waitForTimeout(ms),bb=sel=>p.locator(sel).boundingBox();
// default layout = same spots as before (stick bottom-left, buttons bottom-right)
const st0=await bb('#stick'),pk0=await bb('.tb[data-a=p]'),wr=await bb('#wrap');
ok(st0.x-wr.x<40&&pk0.x>wr.x+wr.width*.75,'Default layout: stick bottom-left, buttons bottom-right (stick '+Math.round(st0.width)+' px, buttons '+Math.round(pk0.width)+' px)');
// settings row replaced
await p.tap('#b-set1');await W(200);
ok(!(await p.locator('#o-mirror').count())&&await p.isVisible('#o-prof')&&await p.isVisible('#o-edit'),'Settings: "Left-hand layout" replaced by Touch layout picker + Customize, right under Touch opacity');
const order=await ev("[...document.querySelectorAll('#s-settings .set label')].map(l=>l.textContent)");ok(order.indexOf('Touch layout')===order.indexOf('Touch opacity')+1,'row order: '+order.join(' / '));
await p.screenshot({path:S+'/shots/1-settings.png'});
// open editor
await p.tap('#o-edit');await W(250);ok(await p.isVisible('#layed')&&await ev("EDITING()"),'Customize opens the layout editor');
await p.screenshot({path:S+'/shots/2-editor.png'});
// drag PUNCH to the middle-left
const pb=await bb('.tb[data-a=p]');const tx=wr.x+wr.width*.35,ty=wr.y+wr.height*.7;
await p.mouse.move(pb.x+pb.width/2,pb.y+pb.height/2);await p.mouse.down();for(let i=1;i<=10;i++){await p.mouse.move(pb.x+pb.width/2+(tx-pb.x-pb.width/2)*i/10,pb.y+pb.height/2+(ty-pb.y-pb.height/2)*i/10);await W(16)}await p.mouse.up();await W(100);
const pb2=await bb('.tb[data-a=p]');ok(Math.abs(pb2.x+pb2.width/2-tx)<6&&Math.abs(pb2.y+pb2.height/2-ty)<6,'drag moves PUNCH to where you drop it');
ok(await ev("ED.sel")==='p'&&await p.isVisible('#rh'),'the dragged control is selected and shows the yellow resize corner');
// resize with the corner handle
const rh=await bb('#rh');await p.mouse.move(rh.x+rh.width/2,rh.y+rh.height/2);await p.mouse.down();await p.mouse.move(rh.x+rh.width/2+40,rh.y+rh.height/2+40,{steps:8});await p.mouse.up();await W(100);
const pb3=await bb('.tb[data-a=p]');ok(pb3.width>pb2.width+40,'dragging the corner makes it bigger ('+Math.round(pb2.width)+' -> '+Math.round(pb3.width)+' px)');
// resize KICK with the slider
await p.tap('.tb[data-a=k]');await W(80);await p.locator('#le-size').fill('50');await p.locator('#le-size').dispatchEvent('input');await W(80);
ok(Math.round((await bb('.tb[data-a=k]')).width)===50,'size slider resizes the selected control (KICK -> 50 px)');
// drag the stick off-screen: it stays inside
const sb=await bb('#stick');await p.mouse.move(sb.x+sb.width/2,sb.y+sb.height/2);await p.mouse.down();await p.mouse.move(wr.x-200,wr.y+wr.height+200,{steps:6});await p.mouse.up();await W(100);
const sb2=await bb('#stick');ok(sb2.x>=wr.x&&sb2.y+sb2.height<=wr.y+wr.height,'controls can\'t be dragged off the screen');
await p.screenshot({path:S+'/shots/3-edited.png'});
// save: Default is built-in, so it asks for a name
await p.tap('#le-save');await W(100);ok(await p.isVisible('#le-namebox'),'saving over a built-in profile asks for a name');
await p.locator('#le-name').fill('Rhett');await p.tap('#le-name-ok');await W(200);
ok(!(await ev("EDITING()"))&&await p.isVisible('#s-settings')&&await ev("LAY.active")==='Rhett'&&await p.inputValue('#o-prof')==='Rhett','saved as profile "Rhett", now active, back in Settings');
// play with it: the button is where it was placed and works by touch
await p.tap('#b-back');await W(100);await p.evaluate('openSolo()');await p.tap('#b-start');await p.evaluate("SHOWN==='s-themes'&&THS.kind==='stage'&&THS.go('?')");await W(500);
const gp=await bb('.tb[data-a=p]');ok(Math.abs(gp.x+gp.width/2-tx)<8&&Math.abs(gp.y+gp.height/2-ty)<8,'in the game, PUNCH sits where it was placed');
const cdp=await c.newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:gp.x+gp.width/2,y:gp.y+gp.height/2,id:1}]});await W(60);
const kp=await ev("INP[0].K.p");await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});ok(kp===1,'tapping the moved PUNCH button punches');
await p.screenshot({path:S+'/shots/4-ingame.png'});
// persists after reload
await p.reload();await p.waitForTimeout(150);await p.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await W(400);const gr=await bb('.tb[data-a=p]');ok(await ev("LAY.active")==='Rhett'&&Math.abs(gr.x+gr.width/2-tx)<8,'layout and profile survive a reload');
// switch profiles in Settings: Left-handed mirrors the default
await p.tap('#b-set1');await W(150);await p.selectOption('#o-prof','Left-handed');await W(100);
const sl=await bb('#stick');ok(sl.x>wr.x+wr.width*.7,'Left-handed profile puts the stick on the right');
await p.selectOption('#o-prof','Default');await W(100);const sd=await bb('#stick');ok(Math.abs(sd.x-st0.x)<2,'Default profile restores the original spots');
// editor: Default positions button, then delete the custom profile (two taps)
await p.selectOption('#o-prof','Rhett');await p.tap('#o-edit');await W(150);await p.tap('#le-reset');await W(80);
const rp=await bb('.tb[data-a=p]');ok(Math.abs(rp.x-pk0.x)<2,'"Default positions" puts everything back (not saved until Save)');
await p.tap('#le-del');await W(60);ok((await p.textContent('#le-del')).includes('again'),'Delete asks for a second tap');
await p.tap('#le-del');await W(100);ok(!(await ev("'Rhett' in LAY.custom"))&&await ev("ED.prof")==='Default','second tap deletes the profile and falls back to Default');
ok(await p.locator('#le-del').isDisabled(),'built-in profiles can\'t be deleted');
await p.tap('#le-cancel');await W(100);ok(await p.isVisible('#s-settings')&&!(await ev('EDITING()')),'Cancel closes the editor without saving');
// phone: editor fits
const c2=await b.newContext({...devices['iPhone 13 landscape']});const q=await c2.newPage();q.on('pageerror',e=>errs.push('phone '+e.message));
await q.goto(GAME);await q.evaluate("SET.tut=1");await q.waitForTimeout(150);await q.evaluate("typeof titleOpenAll==='function'&&titleOpenAll()");await q.waitForTimeout(300);await q.tap('#b-set1');await q.waitForTimeout(150);await q.tap('#o-edit');await q.waitForTimeout(200);
await q.tap('.tb[data-a=j]');await q.waitForTimeout(100);await q.screenshot({path:S+'/shots/5-phone-editor.png'});
const tb=await q.locator('#layed').boundingBox(),w2=await q.locator('#wrap').boundingBox();ok(tb.height<w2.height*.6,'phone: editor toolbar leaves room to arrange ('+Math.round(tb.height)+' of '+Math.round(w2.height)+' px)');
console.log(fails?fails+' FAILURES':'ALL M6 CHECKS OK','| errors:',errs.length?errs:'none');await b.close()})();
