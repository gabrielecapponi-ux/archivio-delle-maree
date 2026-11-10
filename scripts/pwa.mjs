import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
const files=[];
async function scan(path=''){for(const entry of await readdir(join('dist',path),{withFileTypes:true})){const name=join(path,entry.name);if(entry.isDirectory())await scan(name);else if(!['GIOCA.html','sw.js','.nojekyll'].includes(name))files.push(name);}}
await scan();files.sort();const hash=createHash('sha256');for(const name of files)hash.update(await readFile(join('dist',name)));
const version=hash.digest('hex').slice(0,16);
await writeFile('dist/sw.js',`const CACHE='maree-${version}';
const FILES=${JSON.stringify(files)};
const ROOT=new URL('./',self.location.href);
const LOCAL=new Set(FILES.map(path=>new URL(path,ROOT).href));
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(FILES.map(path=>new Request(new URL(path,ROOT),{cache:'reload'})));await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('maree-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();for(const client of await self.clients.matchAll())client.postMessage({type:'MAREE_OFFLINE_READY'});})()));
self.addEventListener('message',event=>{if(event.data?.type==='MAREE_CACHE_STATUS')event.source?.postMessage({type:'MAREE_OFFLINE_READY'});});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==ROOT.origin)return;const entry=event.request.mode==='navigate'&&(url.pathname===ROOT.pathname||url.pathname===ROOT.pathname+'index.html');if(entry||LOCAL.has(url.href))event.respondWith((async()=>{const cache=await caches.open(CACHE);return (await cache.match(entry?new URL('index.html',ROOT).href:event.request))??fetch(event.request);})());});
`);
await writeFile('dist/.nojekyll','');
console.log(`Copia offline: ${files.length} risorse, versione ${version}`);
