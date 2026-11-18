// All game scripts share one global scope, so a top-level name defined in two files silently replaces the first.
// This checks every top-level function / const / let / var (including comma lists) is defined only once.
const fs=require('fs'),path=require('path'),R=path.resolve(__dirname,'../..');
const files=[...fs.readFileSync(R+'/index.html','utf8').matchAll(/src="(js\/[^"?]+)/g)].map(m=>m[1]);
const seen={};let fails=0;
for(const f of files){
  const lines=fs.readFileSync(R+'/'+f,'utf8').split('\n');let decl=false;
  for(const l of lines){
    let m=/^(?:async\s+)?function\s+(\w+)/.exec(l)||/^(?:const|let|var)\s+(\w+)/.exec(l);
    const names=[];if(m)names.push(m[1]);
    if(/^(const|let|var)\s/.test(l))decl=!/;\s*$/.test(l);
    else if(decl&&/^  (\w+)\s*(=|,|;|$)/.test(l)){names.push(/^  (\w+)/.exec(l)[1]);if(/;\s*$/.test(l))decl=false}
    else if(decl&&/^\S/.test(l))decl=false;
    for(const n of names){if(seen[n]&&seen[n]!==f){console.log('FAIL '+n+' is defined in both '+seen[n]+' and '+f);fails++}seen[n]=seen[n]||f}
  }
}
console.log(fails?fails+' FAILED':'ALL PASS ('+Object.keys(seen).length+' names in '+files.length+' files)');
