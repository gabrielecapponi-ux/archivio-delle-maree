import {collectTool} from './search-path.js';
import {expect} from '@playwright/test';
const close=page=>page.locator('#close-panel').click();
export async function inspect(page,id){await page.locator('#map').click();await page.locator(`#panel-content [data-location="${id}"]`).click();}
const action=(page,id)=>page.locator(`#panel-content [data-action="${id}"]`).click();
const extra=(page,type,n)=>page.locator(`[data-extra="${type}"][data-value="${n}"]`).click();
export async function extendFirst(page){
  await page.locator('#room-travel').click();await expect(page.locator('#location-name')).toHaveText('L’officina astronomica');
  await page.screenshot({path:'artifacts/revisione-officina.png'});
  await inspect(page,'diary');await action(page,'x-diary');await close(page);await collectTool(page,'workbench');
  await inspect(page,'gears');await action(page,'x-gears');await expect(page.locator('#toast')).toContainText('sei battiti');
  await extra(page,'gear',0);await extra(page,'gear',0);await extra(page,'gear',1);await page.screenshot({path:'artifacts/revisione-ingranaggi.png'});await action(page,'x-gears');await close(page);
  await inspect(page,'telescope');await extra(page,'star',0);await extra(page,'star',2);await expect(page.locator('#toast')).toContainText('non appartiene');for(const n of [0,1,2,3])await extra(page,'star',n);await page.screenshot({path:'artifacts/revisione-telescopio.png'});await close(page);
  await inspect(page,'tides');await extra(page,'tide',0);await extra(page,'tide',0);await extra(page,'tide',1);await action(page,'x-tides');await close(page);
}
export async function extendSecond(page){
  await page.locator('#room-travel').click();await expect(page.locator('#location-name')).toHaveText('La camera dei ricordi');await page.screenshot({path:'artifacts/revisione-camera.png'});
  await inspect(page,'catalog');for(const n of [3,1,0,2])await extra(page,'record',n);await action(page,'x-catalog');await close(page);
  await inspect(page,'pressure');await extra(page,'valve',0);await extra(page,'valve',0);await extra(page,'valve',1);await page.screenshot({path:'artifacts/revisione-pressione.png'});await action(page,'x-pressure');await close(page);
  await page.reload();await page.locator('#start').click();await expect(page.locator('#location-name')).toHaveText('La camera dei ricordi');await expect(page.locator('#progress-text')).toHaveText('6 / 9');await collectTool(page,'memory');
  await inspect(page,'strips');for(const n of [1,3,0,2])await extra(page,'fragment',n);await action(page,'x-strips');await close(page);
  await inspect(page,'airlock');await extra(page,'lock',0);await extra(page,'lock',2);await action(page,'x-airlock');await close(page);
}
