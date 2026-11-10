import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname,dirname} from 'node:path';
const root=resolve('dist');
let html=await readFile(resolve(root,'index.html'),'utf8');
const js=html.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/);
const css=html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/);
if(!js||!css)throw new Error('Bundle non trovato. Esegui prima vite build.');
const pathFor=(url,base=root)=>url.startsWith('/')?resolve(root,url.slice(1)):resolve(base,url);
const mimeFor=url=>({'.woff2':'font/woff2','.woff':'font/woff','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'})[extname(url)]??'application/octet-stream';
async function embed(url,base=root){return `data:${mimeFor(url)};base64,${(await readFile(pathFor(url,base))).toString('base64')}`;}
const cssPath=pathFor(css[1]),jsPath=pathFor(js[1]);
let styles=await readFile(cssPath,'utf8');
for(const asset of new Set([...styles.matchAll(/url\(([^)]+)\)/g)].map(m=>m[1].replace(/["']/g,'')))){
  if(!asset.startsWith('data:'))styles=styles.split(asset).join(await embed(asset,dirname(cssPath)));
}
let code=await readFile(jsPath,'utf8');
// Relative Vite bundles resolve images beside the JavaScript file. Embed the
// whole URL expression so an inline module also works directly from file://.
for(const match of [...code.matchAll(/new URL\([`"']([^`"']+\.(?:png|webp|jpg))[`"'],\s*import\.meta\.url\)\.href/g)]){
  code=code.split(match[0]).join(JSON.stringify(await embed(match[1],dirname(jsPath))));
}
html=html.replace(js[0],()=>`<script type="module">${code.replace(/<\/script/gi,'<\\/script')}</script>`).replace(css[0],()=>`<style>${styles}</style>`);
html=html.replace(/<link[^>]+rel="manifest"[^>]*>/g,'');
for(const match of [...html.matchAll(/<link[^>]+rel="(?:icon|apple-touch-icon)"[^>]+href="([^"]+)"[^>]*>/g)]){
  html=html.replace(match[0],match[0].replace(match[1],await embed(match[1])));
}
const licenses=await Promise.all(['three','@fontsource/cormorant-garamond','@fontsource/manrope'].map(async name=>`${name}\n${await readFile(resolve('node_modules',name,'LICENSE'),'utf8')}`));
const notice=licenses.join('\n\n────────────────────────────────────────\n\n');
await writeFile(resolve(root,'LICENZE.txt'),notice);
await writeFile(resolve(root,'GIOCA.html'),html+`\n<!--\nLicenze dei componenti inclusi:\n${notice.replace(/-->/g,'—>')}\n-->\n`);
console.log(`Versione autonoma creata: dist/GIOCA.html (${Math.round(Buffer.byteLength(html)/1024)} KB)`);
