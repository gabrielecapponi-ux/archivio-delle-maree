import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';

// WebKit's setOffline emulation rejects even cached SW navigations (Playwright
// #42775). Stopping this dedicated origin verifies offline loading without it.
export async function offlineTestSite(){
  const root=resolve('dist'),prefix='/archivio-delle-maree/';
  const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webmanifest':'application/manifest+json','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.woff':'font/woff'};
  const server=createServer(async(req,res)=>{
    try{
      const path=new URL(req.url,'http://localhost').pathname;
      if(!path.startsWith(prefix)){res.writeHead(404).end();return;}
      const file=resolve(root,decodeURIComponent(path.slice(prefix.length))||'index.html');
      if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
      const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream','Cache-Control':'no-cache'}).end(data);
    }catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let stopped=false;
  return {address:`http://127.0.0.1:${server.address().port}${prefix}`,async stop(){if(stopped)return;stopped=true;server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}};
}
