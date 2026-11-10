import {test,expect} from '@playwright/test';
import {HUNTS} from '../src/investigation.js';
import {inspect} from './expanded-paths.js';
const close=page=>page.locator('#close-panel').click();
const action=(page,id)=>page.locator(`#panel-content [data-action="${id}"]`).click();
const find=(page,id)=>page.locator(`[data-search-item="${id}"]`).click();
async function start(page){await page.goto('/');await page.locator('#start').click();await action(page,'close');}

test('ricerca parziale, astuccio, combinazione, esame 3D e uso errato non perdono oggetti',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await start(page);
  await inspect(page,'letter');await action(page,'take-letter');await close(page);
  await inspect(page,'safe');await expect(page.locator('.tool-gate')).toContainText('sei oggetti');await expect(page.locator('[data-action="insert-key"]')).toBeDisabled();await page.locator('[data-start-search="desk"]').click();
  await expect(page.locator('[data-search-item="desk-key-bit"]')).toBeHidden();
  await find(page,'desk-key-shaft');await page.locator('[data-search-cover="desk-case"]').click();await find(page,'desk-key-bit');
  await expect(page.locator('.search-counter')).toHaveText('2 / 6 trovati');await page.reload();await page.locator('#start').click();await page.locator('#search').click();
  await expect(page.locator('.search-counter')).toHaveText('2 / 6 trovati');await expect(page.locator('[data-search-cover]')).toBeHidden();
  for(const kind of ['compass','pocketwatch','feather','seal'])await find(page,`desk-${kind}`);
  await page.locator('.search-assemble').click();for(const kind of ['key-shaft','key-bit'])await page.locator(`[data-combine-part="desk-${kind}"]`).click();await page.screenshot({path:'artifacts/combina-oggetti.png'});await action(page,'combine-confirm');
  await expect(page.locator('#item-turntable canvas')).toBeVisible();await page.locator('[data-inspect-control="right"]').click();await page.screenshot({path:'artifacts/ispezione-chiave-3d.png'});
  await page.locator('[data-select-tool="key"]').click();await page.locator('#map').click();await page.locator('#panel-content [data-location="letter"]').click();await expect(page.locator('#toast')).toContainText('non serve qui');await close(page);await expect(page.locator('#inventory [data-item="key"]')).toBeVisible();
  await inspect(page,'safe');await expect(page.locator('.tool-gate')).toHaveCount(0);await expect(page.locator('[data-action="solve-safe"]')).toBeEnabled();await close(page);await expect(page.locator('#inventory [data-item="key"]')).toHaveCount(0);
  await page.locator('#journal').click();await expect(page.locator('.search-summary')).toContainText('Orologio da tasca');expect(errors).toEqual([]);
});

test('ricerca mobile: indizio raggiunge l’oggetto fuori campo e la tastiera resta nella ricerca',async({page})=>{
  await page.setViewportSize({width:390,height:844});await start(page);await page.locator('#search').click();
  await expect(page.locator('.search-back')).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(page.locator('[data-search-item="desk-seal"]')).toBeFocused();await page.keyboard.press('Tab');await expect(page.locator('.search-back')).toBeFocused();
  await page.locator('.search-hint').click();await expect(page.locator('[data-search-item="desk-key-shaft"]')).toHaveClass(/search-highlight/);
  await find(page,'desk-key-shaft');await expect(page.locator('.search-counter')).toHaveText('1 / 6 trovati');await page.screenshot({path:'artifacts/ricerca-oggetti-mobile.png'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.keyboard.press('Escape');await expect(page.locator('#search')).toBeFocused();
});
