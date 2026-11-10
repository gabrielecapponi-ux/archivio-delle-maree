import {test,expect} from '@playwright/test';
import {HUNTS} from '../src/investigation.js';
for(const width of [390,1440])test(`mappa e deduzione: errori recuperabili e progresso persistente a ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:width===390?844:900});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.locator('#start').click();await page.locator('[data-action="close"]').click();
  await page.locator('#map').click();await expect(page.locator('.atlas-node[aria-current="location"]')).toContainText('Osservatorio');
  await expect(page.locator('.atlas-node').nth(1)).toBeDisabled();await page.screenshot({path:`artifacts/atlante-${width}.png`});
  await page.locator('[data-start-search="desk"]').click();const hunt=HUNTS[0];await page.locator('[data-search-cover]').click();for(const item of hunt.items)await page.locator(`[data-search-item="${item.id}"]`).click();
  await page.locator('.search-deduce').click();await expect(page.locator('#panel-title')).toContainText('presenza');
  await page.locator('[data-evidence="desk-compass"]').click();await page.locator('[data-evidence="desk-pocketwatch"]').click();await page.locator('[data-action="deduce"]').click();await expect(page.locator('#toast')).toContainText('non rispondono');
  await page.locator('[data-evidence="desk-feather"]').click();await page.locator('[data-evidence="desk-seal"]').click();await page.screenshot({path:`artifacts/deduzione-${width}.png`});await page.locator('[data-action="deduce"]').click();await expect(page.locator('.deduction-solved')).toContainText('inchiostro fresco');
  await page.reload();await page.locator('#start').click();await page.locator('#journal').click();await expect(page.locator('[data-deduction="ada"]')).toContainText('Pista ricostruita');await expect(page.locator('.section-heading>span')).toHaveText('1 / 2');
  expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
