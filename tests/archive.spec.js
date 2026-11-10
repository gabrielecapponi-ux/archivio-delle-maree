import {collectTool} from './search-path.js';
import {inspect,extendSecond} from './expanded-paths.js';
import {test,expect} from '@playwright/test';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {SAVE_KEY,newGame as newFirst} from '../src/game.js';
const close=page=>page.locator('#close-panel').click();
const action=(page,id)=>page.locator(`#panel-content [data-action="${id}"]`).click();
const location=inspect;
const pours=[[0,1],[1,2],[2,0],[1,2],[0,1],[1,2],[2,0]],turns=[3,2,0,2,2,1,2,3,3];
async function begin(page){await page.goto('/#capitolo-2');await page.locator('#start').click();await action(page,'close');}
async function collect(page){await location(page,'register');await action(page,'c2-register');await action(page,'toggle-lens');await action(page,'c2-secret');await close(page);await collectTool(page,'gallery');}
async function water(page){await location(page,'pumps');for(const[from,to]of pours)await page.locator(`[data-pour-from="${from}"][data-pour-to="${to}"]`).click();await action(page,'c2-pumps');await close(page);}
async function memory(page){await location(page,'echoes');await page.locator('.transcript summary').click();for(const n of [0,2,1,3,2])await page.locator(`[data-note="${n}"]`).click();await expect(page.locator('.memory-reveal')).toBeVisible();await close(page);}
async function pipes(page){await location(page,'conduits');for(let i=0;i<9;i++)for(let n=0;n<turns[i];n++)await page.locator(`[data-pipe="${i}"]`).click();await action(page,'c2-conduits');await expect(page.locator('#panel-content')).toContainText('Il cilindro di Elia');await close(page);}

for(const choice of ['liberare','custodire'])test(`capitolo II: percorso completo e finale ${choice}`,async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/#capitolo-2');await page.evaluate(()=>document.fonts.ready);await expect(page.locator('#world canvas')).toBeVisible();
  if(choice==='liberare')await page.screenshot({path:'artifacts/capitolo-2-titolo.png'});
  await page.locator('#start').click();await action(page,'close');await page.locator('#room-travel').click();await expect(page.locator('#toast')).toContainText('mosaico');
  await collect(page);await location(page,'pumps');await action(page,'c2-pumps');await expect(page.locator('#toast')).toContainText('quattro misure');await close(page);
  await water(page);await page.reload();await page.locator('#start').click();await expect(page.locator('#progress-text')).toHaveText('2 / 9');await location(page,'echoes');await page.locator('[data-note="1"]').click();await expect(page.locator('#toast')).toContainText('ricordo si interrompe');await close(page);
  await memory(page);await pipes(page);await extendSecond(page);await location(page,'heart');await page.locator(`[data-choice="${choice}"]`).click();await expect(page.locator('#panel-content')).toContainText('Capitolo II · Completato');await expect(page.locator('#progress-text')).toHaveText('9 / 9');
  await page.screenshot({path:`artifacts/capitolo-2-finale-${choice}.png`});await close(page);await page.locator('#overview').click();await page.screenshot({path:`artifacts/capitolo-2-archivio-${choice}.png`});
  expect(errors).toEqual([]);const d=await page.evaluate(()=>window.__MAREE_DIAGNOSTICS__());expect(d.world.renderer).toBe('cinematic-2.5d');expect(d.world.imageLoaded).toBe(true);console.log('Archivio verificato',d.world);
});

test('telefono: tre enigmi e finale restano utilizzabili a 390 px',async({page})=>{
  await page.setViewportSize({width:390,height:844});await begin(page);await collect(page);await location(page,'pumps');await page.screenshot({path:'artifacts/capitolo-2-mobile-pompe.png'});await close(page);await water(page);await memory(page);await pipes(page);await extendSecond(page);await location(page,'heart');await page.locator('[data-choice="liberare"]').click();await expect(page.locator('#panel-title')).toContainText('L’isola ritrova');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'artifacts/capitolo-2-mobile-finale.png'});
});

test('riproduzione del ricordo e interruzione non lasciano input bloccati',async({page})=>{
  await begin(page);await collect(page);await water(page);await location(page,'echoes');await action(page,'c2-listen');await expect(page.locator('#echo-window')).toContainText('1 / 5');await page.keyboard.press('Escape');await location(page,'register');await expect(page.locator('#panel-title')).toHaveText('Il registro dei nomi');await close(page);await location(page,'echoes');await expect(page.locator('[data-note="0"]')).toBeEnabled();
  await action(page,'c2-listen');await expect(page.locator('#echo-window')).toContainText('Ora tocca a te',{timeout:10000});await expect(page.locator('[data-note="0"]')).toBeFocused();
  await page.locator('.transcript summary').click();await page.locator('[data-note="0"]').click();await expect(page.locator('.transcript')).toHaveAttribute('open','');
});

test('migrazione e cambio capitolo conservano i vecchi progressi, le preferenze e il focus',async({page})=>{
  const old={...newFirst(),started:true,letter:true};await page.addInitScript(({key,old})=>localStorage.setItem(key,JSON.stringify(old)),{key:SAVE_KEY,old});
  await page.goto('/');await page.locator('#start').click();await expect(page.locator('#progress-text')).toHaveText('1 / 9');await page.locator('#menu').click();
  await page.locator('#quality-select').selectOption('low');await page.locator('#reduce-motion').check();await page.locator('#volume-range').fill('30');await action(page,'chapters');await page.locator('[data-chapter="2"]').click();await action(page,'close');await collect(page);
  await page.locator('#menu').click();await action(page,'restart-confirm');await action(page,'restart');await action(page,'close');await expect(page.locator('#progress-text')).toHaveText('0 / 9');await page.locator('#menu').click();await expect(page.locator('#quality-select')).toHaveValue('low');await expect(page.locator('#volume-range')).toHaveValue('30');await expect(page.locator('#reduce-motion')).toBeChecked();
  await action(page,'chapters');await page.locator('[data-chapter="1"]').click();await expect(page.locator('#progress-text')).toHaveText('1 / 9');
  await page.locator('#menu').click();await page.keyboard.press('Shift+Tab');await expect(page.locator('[data-action="restart-confirm"]')).toBeFocused();await page.keyboard.press('Tab');await expect(page.locator('#close-panel')).toBeFocused();
});

test('il secondo capitolo è disponibile nel file autonomo senza rete',async({page,context})=>{
  const external=[];page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url());});await context.setOffline(true);await page.goto(pathToFileURL(resolve('dist/GIOCA.html')).href+'#capitolo-2');await expect(page.locator('#world canvas')).toBeVisible();await page.locator('#start').click();await action(page,'close');await collect(page);await water(page);await expect(page.locator('#progress-text')).toHaveText('2 / 9');expect(external).toEqual([]);
});
