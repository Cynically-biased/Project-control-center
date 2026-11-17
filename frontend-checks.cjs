const ts=require('./validators/typescript.js');
const supported=new Set(['.php','.phtml','.php5','.php7','.php8','.html','.htm','.css','.xml','.svg','.yaml','.yml','.toml','.vue','.svelte','.jsonc','.webmanifest']);
function check(text,ext){
 const findings=[];let skipped=false;const add=(check,line,code)=>findings.push({check,line:line||null,code:String(code||'syntax').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80)});
 const css=(value,offset=0)=>{try{require('postcss').parse(value,{from:undefined});}catch(e){if(e.name!=='CssSyntaxError')throw e;add('CSS syntax',offset+(e.line||1),(/Unclosed block/i.test(e.reason)?'unclosed-block':/Unclosed comment/i.test(e.reason)?'unclosed-comment':/Unclosed string/i.test(e.reason)?'unclosed-string':/Unknown word/i.test(e.reason)?'unexpected-css-token':'css-syntax'));}};
 const script=(value,type,offset)=>{try{if(/json/i.test(type))JSON.parse(value);else if(/typescript|\bts\b/i.test(type)){const tree=ts.createSourceFile('inline.ts',value,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);if(tree.parseDiagnostics.length)add('Embedded TypeScript syntax',offset+tree.getLineAndCharacterOfPosition(tree.parseDiagnostics[0].start||0).line+1,'typescript-syntax');}else require('acorn').parse(value,{ecmaVersion:'latest',sourceType:type==='module'?'module':'script'});}catch(e){add('Embedded script syntax',offset+(e.loc?.line||1),'script-syntax');}};
 const embedded=(markup,base=0,moduleScript=false)=>{const regex=/<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi;for(const match of markup.matchAll(regex)){const attrs=match[2],value=match[3],offset=base+markup.slice(0,match.index+match[0].indexOf(value)).split('\n').length-1;if(value.includes('<?')){skipped=true;continue;}if(match[1].toLowerCase()==='style'){if(!/\blang\s*=\s*["'](?!css["'])/i.test(attrs)&&!/\btype\s*=\s*["'](?!text\/css["'])/i.test(attrs))css(value,offset);else skipped=true;}else if(!/\bsrc\s*=/i.test(attrs)){const type=attrs.match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1]||attrs.match(/\blang\s*=\s*["']([^"']+)["']/i)?.[1]||(moduleScript?'module':'');if(!type||/^(module|text\/javascript|application\/javascript|application\/ld\+json|application\/json|typescript|ts)$/i.test(type))script(value,type,offset);else skipped=true;}}};
 if(/^\.(?:php[578]?|phtml)$/.test(ext)){embedded(text);return {findings,skipped:'Only static embedded script/style blocks were inspected. Dynamic PHP-generated markup and template directives are not evaluated.'};}
 else if(ext==='.css')css(text);
 else if(ext==='.html'||ext==='.htm'){
  const {HtmlValidate,StaticConfigLoader}=require('html-validate');const validator=new HtmlValidate(new StaticConfigLoader({root:true,elements:['html5'],rules:{'close-order':'error','element-permitted-content':'error','no-dup-attr':'error'}}));
  const report=validator.validateStringSync(text);for(const result of report.results)for(const item of result.messages.slice(0,20))if(item.severity===2)add('HTML structure',item.line,item.ruleId);
  embedded(text);
 }else if((ext==='.xml'||ext==='.svg')){
  // Validate well-formedness only. Never resolve DTDs, external entities or remote schemas.
  if(/<!DOCTYPE|<!ENTITY/i.test(text))return {findings:[],skipped:'XML with DTD/entity declarations is not processed.'};
  const result=require('fast-xml-parser').XMLValidator.validate(text);if(result!==true)add('XML well-formedness',result.err.line,result.err.code);
 }else if(ext==='.yaml'||ext==='.yml'){
  const docs=require('yaml').parseAllDocuments(text,{customTags:[],uniqueKeys:true});for(const doc of docs)for(const e of doc.errors)add('YAML syntax',text.slice(0,e.pos?.[0]||0).split('\n').length,e.code);
 }else if(ext==='.toml'){try{require('smol-toml').parse(text);}catch(e){add('TOML syntax',e.line,'toml-syntax');}}
 else if(ext==='.jsonc'){const tree=ts.parseJsonText('config.json',text);for(const e of tree.parseDiagnostics)add('JSONC syntax',tree.getLineAndCharacterOfPosition(e.start||0).line+1,'jsonc-syntax');}
 else if(ext==='.webmanifest'){try{JSON.parse(text);}catch{add('Web manifest JSON',1,'json-syntax');}}
 else if(ext==='.vue'){
  const compiler=require('@vue/compiler-sfc');const parsed=compiler.parse(text,{filename:'component.vue'});for(const e of parsed.errors)add('Vue component syntax',e.loc?.start?.line,'vue-syntax');const d=parsed.descriptor;
  if(d.template&&!d.template.src&&(!d.template.lang||d.template.lang==='html')){const compiled=compiler.compileTemplate({source:d.template.content,filename:'component.vue',id:'monitoring',compilerOptions:{expressionPlugins:['typescript']}});for(const e of compiled.errors)add('Vue template syntax',(d.template.loc.start.line||1)+(e.loc?.start?.line||1)-1,'vue-template');}
  for(const block of [d.script,d.scriptSetup].filter(Boolean))if(!block.src&&(!block.lang||['ts','js'].includes(block.lang)))script(block.content,block.lang==='ts'?'ts':'module',block.loc.start.line-1);
  for(const block of d.styles)if(!block.src&&(!block.lang||block.lang==='css'))css(block.content,block.loc.start.line-1);
  if([d.template,d.script,d.scriptSetup,...d.styles].some(b=>b&&(b.src||(b.lang&&!['ts','js','html','css'].includes(b.lang)))))return {findings,skipped:'External blocks and preprocessors were not checked.'};
 }else if(ext==='.svelte'){try{require('svelte/compiler').parse(text,{modern:true});embedded(text,0,true);}catch(e){add('Svelte component syntax',e.start?.line,'svelte-syntax');}}
 return {findings:findings.slice(0,30),...(skipped?{skipped:'Some embedded blocks use dynamic code or an unsupported preprocessor and were not checked.'}:{})};
}
module.exports={supported,check};
