import {mkdir,readdir,readFile,writeFile,rm,copyFile} from 'node:fs/promises';
import path from 'node:path';
const base=process.env.BASE_PATH||'/';
if(!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(base))throw new Error('Invalid BASE_PATH');
await rm('dist',{recursive:true,force:true});
async function copy(source){
 const dest=path.join('dist',source);
 await mkdir(path.dirname(dest),{recursive:true});
 if(/\.(html|css|js)$/.test(source)){
  const text=await readFile(source,'utf8');
  await writeFile(dest,text.replace(/(["'(])\/(assets|src)\//g,`$1${base}$2/`));
 }else await copyFile(source,dest);
}
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else if(dir.startsWith('src')?/\.(js|css)$/.test(p)&&!e.name.startsWith('qa-'):/\.(png|svg)$/.test(p))await copy(p);}}
await copy('index.html');await walk('src');await walk('assets');await writeFile('dist/.nojekyll','');
console.log(`Built Pages site for ${base}`);
