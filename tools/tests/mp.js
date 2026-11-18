// shared helpers: up to 4 mock controllers
module.exports.PADS=ids=>`(()=>{const ids=${JSON.stringify(ids)};window.__pads=ids.map((id,i)=>({id,index:i,connected:true,mapping:'standard',buttons:Array.from({length:17},()=>({pressed:false,value:0})),axes:[0,0,0,0]}));navigator.getGamepads=()=>window.__pads;})()`;
