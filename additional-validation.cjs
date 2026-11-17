const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),policy=require('./scan-policy.cjs'),frontend=require('./frontend-checks.cjs');
function validate(p){
 p.errors=p.errors.filter(e=>e.origin!=='frontend-scan');p.tests=p.tests.filter(e=>e.origin!=='frontend-scan');const date=p.lastScanned,start=Date.now(),root=p.path||p.folderPath;let checked=0,failed=0,notRun=0;
 const cache=p._frontendCache||{},next={};const parserIdentity=crypto.createHash('sha256').update(fs.readFileSync(__filename)).update(fs.readFileSync(require.resolve('./frontend-checks.cjs'))).update(JSON.stringify(['html-validate','postcss','fast-xml-parser','yaml','smol-toml','@vue/compiler-sfc','svelte/compiler'].map(name=>fs.statSync(require.resolve(name)).mtimeMs))).digest('hex');
 for(const file of p.inventory||[]){const ext=path.extname(file.file).toLowerCase();if(!frontend.supported.has(ext)||/(^|[\\/])(node_modules|vendor|dist|build|coverage)([\\/])/i.test(file.file))continue;
  const row={projectId:p.id,projectName:p.name,date,origin:'frontend-scan',category:'Code',file:file.file,name:ext.slice(1).toUpperCase()+' validation'};
  if(checked>=2000||Date.now()-start>45000){notRun++;continue;}checked++;
  try{const text=policy.read(root,file.file);if(/^\.(?:php[578]?|phtml)$/.test(ext)&&!/<(?:script|style)\b/i.test(text))continue;const digest=crypto.createHash('sha256').update(parserIdentity).update(text).digest('hex');const result=cache[file.file]?.digest===digest?cache[file.file].result:frontend.check(text,ext);next[file.file]={digest,result};
   for(const finding of result.findings){failed++;const reasons={'unclosed-block':'a closing brace is missing','unclosed-comment':'a comment is not closed','unclosed-string':'a string is not closed','unexpected-css-token':'unexpected text in a CSS declaration','close-order':'HTML tags are closed in the wrong order','no-dup-attr':'an attribute is duplicated','InvalidTag':'an XML tag is malformed or mismatched','script-syntax':'an embedded script contains invalid syntax'};const message=finding.check+' failed: '+(reasons[finding.code]||finding.code)+(finding.line?' at line '+finding.line:'')+'. Source and raw diagnostics are withheld.';p.errors.push({...row,line:finding.line,check:finding.check,status:'Open',severity:'High',message});}
   p.tests.push({...row,status:result.findings.length?'Failed':result.skipped?'Not run':'Passed',message:result.findings.length?result.findings.length+' validation finding(s); see Errors.':result.skipped||'Bundled parser accepted this file. This does not establish runtime behavior or full framework correctness.'});
   if(result.skipped&&result.findings.length)p.tests.push({...row,status:'Not run',message:result.skipped});if(result.skipped)notRun++;
  }catch{notRun++;p.tests.push({...row,status:'Not run',message:'File could not be safely validated, is too large (1 MB limit), or the parser could not complete. Validity is unknown.'});}
 }
 p._frontendCache=next;p.scanSummary.frontend={checked,findings:failed,notRun,partial:notRun>0};
}
module.exports=validate;
