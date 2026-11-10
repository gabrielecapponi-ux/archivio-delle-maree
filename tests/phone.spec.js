import {test,expect} from '@playwright/test';
import {offlineTestSite} from './offline-server.js';
const address=process.env.MAREE_PUBLIC_URL||'http://127.0.0.1:4173/archivio-delle-maree/';
test('verticale: densità nativa, aree sicure, comandi touch e risorse nel percorso pubblico',async({page},info)=>{
  const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
  await page.goto(address);await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('#start')).toBeVisible();await expect.poll(()=>page.locator('.scene-image').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  expect(await page.locator('.scene-image').evaluate(img=>[img.naturalWidth,img.naturalHeight])).toEqual([2160,3840]);
  const manifest=await (await page.request.get(new URL('manifest.webmanifest',address).href)).json();expect(manifest.orientation).toBe('portrait-primary');expect(manifest.display).toBe('standalone');
  for(const icon of manifest.icons)expect((await page.request.get(new URL(icon.src,address).href)).status()).toBe(200);
  const dimensions=await page.locator('.scene-dust').evaluate(canvas=>({width:canvas.width,height:canvas.height,cssWidth:innerWidth,cssHeight:innerHeight,dpr:devicePixelRatio}));
  expect(dimensions.width).toBe(Math.round(dimensions.cssWidth*dimensions.dpr));expect(dimensions.height).toBe(Math.round(dimensions.cssHeight*dimensions.dpr));expect(dimensions.width*dimensions.height).toBeLessThanOrEqual(3840*2160);
  await page.screenshot({path:`artifacts/${info.project.name}-titolo.png`});await page.locator('#start').tap();await page.locator('[data-action="close"]').tap();
  await page.evaluate(()=>{document.documentElement.style.setProperty('--safe-top','59px');document.documentElement.style.setProperty('--safe-bottom','34px');});
  const top=await page.locator('#menu').boundingBox(),bottom=await page.locator('#search').boundingBox();expect(top.y).toBeGreaterThanOrEqual(59);expect(bottom.y+bottom.height).toBeLessThanOrEqual(page.viewportSize().height-34);
  for(const id of ['search','journal','map','hint','menu','sound']){const box=await page.locator(`#${id}`).boundingBox();expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);}
  await page.locator('.marker[data-location="letter"]').tap();await expect(page.locator('#panel-title')).toContainText('voce familiare');await page.locator('#close-panel').tap();
  await page.locator('#search').tap();await expect(page.locator('.search-counter')).toHaveText('0 / 6 trovati');await page.screenshot({path:`artifacts/${info.project.name}-ricerca.png`});
  expect(await page.locator('.search-stage img').evaluate(img=>[img.naturalWidth,img.naturalHeight])).toEqual([2160,3840]);
  await page.locator('.search-hint').tap();await page.locator('[data-search-item="desk-key-shaft"]').tap();await expect(page.locator('.search-counter')).toHaveText('1 / 6 trovati');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);expect(failed).toEqual([]);
});
test('installazione e copia offline conservano la ricerca anche senza rete',async({page,context,browserName})=>{
  const local=browserName==='webkit'?await offlineTestSite():null;
  try{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(local?.address??address);await page.locator('#menu').tap();
  await expect(page.locator('#offline-message')).toHaveText('Pronto anche senza connessione su questo dispositivo.',{timeout:30000});
  await page.locator('[data-action="install"]').tap();await expect(page.locator('#panel-content')).toContainText('Aggiungi alla schermata Home');await page.locator('[data-action="close"]').tap();
  await page.locator('#start').tap();await page.locator('[data-action="close"]').tap();await page.locator('#search').tap();await page.locator('[data-search-item="desk-key-shaft"]').tap();await page.locator('.search-back').tap();
  await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
  if(local)await local.stop();else await context.setOffline(true);
  await page.reload();await page.locator('#start').tap();await page.locator('#search').tap();await expect(page.locator('.search-counter')).toHaveText('1 / 6 trovati');
  await expect.poll(()=>page.locator('.search-stage img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);await page.locator('[data-search-cover="desk-case"]').tap();await page.locator('[data-search-item="desk-key-bit"]').tap();await expect(page.locator('.search-counter')).toHaveText('2 / 6 trovati');expect(errors).toEqual([]);
  }finally{await local?.stop();}
});
