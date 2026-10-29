import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import { mdsvex } from 'mdsvex';
import { compile, preprocess } from 'svelte/compiler';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = process.cwd();
execFileSync(process.execPath, ['scripts/analyze.mjs'], {stdio:'inherit'});
const files = fs.readdirSync('src/routes/kb', {recursive:true}).filter(n=>n.endsWith('+page.svx')).map(n=>'src/routes/kb/'+n);
const styles = new Map();
fs.mkdirSync('.build', {recursive:true});
fs.writeFileSync('.build/entry.js', `import {render} from 'svelte/server';\n`+files.map((p,i)=>`import P${i} from '../${p}';`).join('\n')+`\nexport const pages = [${files.map((p,i)=>`{path:${JSON.stringify(p)}, body:render(P${i}).body, head:render(P${i}).head}`).join(',')}];`);
await build({configFile:false,logLevel:'warn',resolve:{alias:{'#lib':path.join(root,'src/lib')}},plugins:[{
 name:'kb-svelte', async transform(source,id){
  if(!/\.(svelte|svx)$/.test(id)) return;
  let code=source;
  if(id.endsWith('.svx')) code=(await preprocess(code,mdsvex({extensions:['.svx'],layout:{runbook:path.join(root,'src/lib/layouts/runbook.svelte')}}),{filename:id})).code;
  const result=compile(code,{filename:id,generate:'server',css:'external'});
  if(result.css?.code) styles.set(id,result.css.code);
  return {code:result.js.code,map:result.js.map};
 }
}],ssr:{noExternal:['svelte']},build:{ssr:'.build/entry.js',outDir:'.build/dist',minify:false}});
const {pages}=await import(pathToFileURL(path.join(root,'.build/dist/entry.js'))+'?t='+Date.now());
fs.mkdirSync('rendered',{recursive:true});
for(const page of pages){
 const slug=page.path.replace('src/routes/','').replace('/+page.svx','').replaceAll('/','-');
 const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+page.head+'<style>'+[...styles.values()].join('\n')+'</style></head><body>'+page.body+'</body></html>';
 fs.writeFileSync(`rendered/${slug}.html`,html);
 console.log(`Rendered ${slug}`);
}
const added=pages.find(p=>p.path.includes('0002-'));
for(const value of ['379','33','DR-','412','different causes — keep apart'])if(!added.body.includes(value))throw Error('Missing rendered evidence: '+value);
console.log('Verified counts, desk reference and dedupe verdict in rendered page.');
