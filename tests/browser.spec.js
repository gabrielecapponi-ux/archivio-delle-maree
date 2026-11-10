import {collectTool} from './search-path.js';
import {inspect,extendFirst} from './expanded-paths.js';
import {test,expect} from '@playwright/test';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const close=page=>page.getByRole('button',{name:'Chiudi e torna alla stanza',exact:true}).click();
const location=inspect;
const action=(page,id)=>page.locator(`[data-action="${id}"]`).click();
async function turn(page,group,values){for(let i=0;i<3;i++)for(let n=0;n<values[i];n++)await page.locator(`[data-dial="${group}"][data-index="${i}"][data-delta="1"]`).click();}
async function start(page){await page.goto('/');await page.locator('#start').click();await action(page,'close');}

test('il capitolo si completa attraverso i comandi visibili, con salvataggio e nessun errore',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('#world canvas')).toBeVisible();
  await page.screenshot({path:'artifacts/titolo-desktop.png'});
  await page.locator('#start').click();await action(page,'close');
  await page.locator('#room-travel').click();await expect(page.locator('#toast')).toContainText('Serve il sigillo');
  await location(page,'letter');await action(page,'take-letter');await close(page);await collectTool(page,'desk');
  await expect(page.locator('#inventory [data-item="key"]')).toHaveCount(0);
  await location(page,'safe');await action(page,'solve-safe');await expect(page.locator('#toast')).toContainText('ingranaggi resistono');
  await turn(page,'safeDials',[3,1,4]);await action(page,'solve-safe');await expect(page.locator('#panel-content')).toContainText('La lente di marea');await close(page);
  await page.reload();await expect(page.locator('#start')).toContainText('Continua');await page.locator('#start').click();await expect(page.locator('#progress-text')).toHaveText('2 / 9');
  await location(page,'projector');await action(page,'toggle-lens');await expect(page.locator('.spectral-message')).toContainText('tramonto');
  await turn(page,'mirrors',[3,1,2]);await action(page,'solve-projector');await expect(page.locator('.star-chart')).toBeVisible();await close(page);
  await location(page,'astrolabe');await turn(page,'rings',[4,3,1]);await page.screenshot({path:'artifacts/enigma-macchina.png'});await action(page,'solve-astrolabe');await close(page);
  await expect(page.getByRole('button',{name:'Esamina sigillo delle maree',exact:true})).toBeVisible();
  await extendFirst(page);await location(page,'door');await action(page,'open-door');await expect(page.locator('#panel-content')).toContainText('Capitolo I · Completato');
  await expect(page.locator('#progress-text')).toHaveText('9 / 9');await page.screenshot({path:'artifacts/finale.png'});
  await close(page);await page.locator('#overview').click();await page.screenshot({path:'artifacts/osservatorio.png'});
  expect(errors).toEqual([]);
  const diagnostics=await page.evaluate(()=>window.__MAREE_DIAGNOSTICS__());expect(diagnostics.world.renderer).toBe('cinematic-2.5d');expect(diagnostics.world.imageLoaded).toBe(true);
  console.log('Rendering verificato:',JSON.stringify(diagnostics.world));
  await location(page,'door');await action(page,'ending');await action(page,'next-chapter');
  await expect(page.locator('#panel-title')).toContainText('Sotto il mare');await action(page,'close');await expect(page.locator('#progress-text')).toHaveText('0 / 9');
  await page.locator('#menu').click();await page.locator('#panel-content [data-action="chapters"]').click();await expect(page.locator('[data-chapter="1"]')).toContainText('9 / 9 scoperte');
});

test('telefono: pulsanti raggiungibili, dettagli scorrevoli e nessun overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'artifacts/titolo-mobile.png'});
  await page.locator('#start').click();await action(page,'close');await location(page,'letter');await action(page,'take-letter');await close(page);await collectTool(page,'desk');
  await location(page,'safe');await turn(page,'safeDials',[3,1,4]);await action(page,'solve-safe');await page.screenshot({path:'artifacts/enigma-mobile.png'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const panel=page.locator('.inspection-panel');const box=await panel.boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(390);
  await close(page);await page.locator('#hint').click();await expect(page.locator('.hint-text')).toBeVisible();
});

test('tastiera: focus confinato al dettaglio e ritorno al comando di apertura',async({page})=>{
  await start(page);await location(page,'safe');await expect(page.locator('#close-panel')).toBeFocused();
  await page.keyboard.press('Shift+Tab');await expect(page.locator('[data-start-search="desk"]')).toBeFocused();
  await page.keyboard.press('Tab');await expect(page.locator('#close-panel')).toBeFocused();
  await page.keyboard.press('Escape');await expect(page.locator('#map')).toBeFocused();
  await page.keyboard.press('t');await expect(page.locator('#panel-title')).toHaveText('Tracce nella luce');await page.keyboard.press('Escape');
});

test('senza WebGL gli enigmi rimangono accessibili',async({page})=>{
  await page.addInitScript(()=>{const getContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.includes('webgl'))return null;return getContext.call(this,type,...args);};});
  await start(page);await expect(page.locator('#world .scene-image')).toBeVisible();await location(page,'letter');await action(page,'take-letter');await expect(page.locator('#progress-text')).toHaveText('1 / 9');
  await close(page);await collectTool(page,'desk',{use:false});await page.locator('#inventory [data-item="key"]').click();
  await expect(page.locator('.item-viewer-fallback')).toBeVisible();await expect(page.locator('#item-turntable canvas')).toHaveCount(0);
  await page.locator('[data-select-tool="key"]').click();await location(page,'safe');await turn(page,'safeDials',[3,1,4]);await action(page,'solve-safe');await expect(page.locator('#progress-text')).toHaveText('2 / 9');
});

test('il file HTML autonomo funziona offline con grafica, font e interazioni',async({page,context})=>{
  const errors=[];const external=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url());});
  await context.setOffline(true);
  await page.goto(pathToFileURL(resolve('dist/GIOCA.html')).href);
  await expect(page.locator('#world canvas')).toBeVisible();await expect(page.locator('#load-message')).toHaveCount(0);
  await page.locator('#sound').click();await expect(page.locator('#sound')).toHaveAttribute('aria-label','Disattiva audio');
  await page.locator('#start').click();await action(page,'close');await location(page,'letter');await action(page,'take-letter');await close(page);await collectTool(page,'desk');
  await location(page,'safe');await turn(page,'safeDials',[3,1,4]);await action(page,'solve-safe');await expect(page.locator('#progress-text')).toHaveText('2 / 9');
  expect(errors).toEqual([]);expect(external).toEqual([]);
});

test('gli oggetti si aprono nella scena; il trascinamento rivela i lati sul telefono',async({page})=>{
  await page.setViewportSize({width:390,height:844});await start(page);
  await page.locator('#reveal').click();await expect(page.locator('#reveal')).toHaveAttribute('aria-pressed','true');
  await page.mouse.move(180,360);await page.mouse.down();await page.mouse.move(370,360,{steps:10});await page.mouse.up();
  const d=await page.evaluate(()=>window.__MAREE_DIAGNOSTICS__());expect(d.world.pan).toBeGreaterThan(0);
  await page.locator('.marker[data-location="safe"]').click();await expect(page.locator('#panel-title')).toHaveText('La memoria del mare');await close(page);
  await page.locator('#menu').click();await page.locator('#reduce-motion').check();await close(page);
  expect((await page.evaluate(()=>window.__MAREE_DIAGNOSTICS__())).world.particles).toBe(0);
  await page.screenshot({path:'artifacts/revisione-esplorazione-mobile.png'});
});
