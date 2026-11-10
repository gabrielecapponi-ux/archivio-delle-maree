import {expect} from '@playwright/test';
import {HUNTS,TOOL_DEFS} from '../src/investigation.js';
export async function collectTool(page,id,{use=true}={}){
  const hunt=HUNTS.find(h=>h.id===id);
  await page.locator('#map').click();await page.locator(`[data-start-search="${id}"]`).click();
  await page.locator(`[data-search-cover="${hunt.cover.id}"]`).click();
  await page.screenshot({path:`artifacts/ricerca-${id}-${page.viewportSize().width}.png`});
  for(const item of hunt.items)await page.locator(`[data-search-item="${item.id}"]`).click();
  await expect(page.locator('.search-counter')).toHaveText('6 / 6 trovati');
  await page.locator('.search-assemble').click();
  for(const item of hunt.items.filter(i=>i.component))await page.locator(`[data-combine-part="${item.id}"]`).click();
  await page.locator('[data-action="combine-confirm"]').click();
  await expect(page.locator('#panel-title')).toHaveText(TOOL_DEFS[hunt.reward].name);
  await expect(page.locator('#item-turntable')).toBeVisible();
  await page.screenshot({path:`artifacts/oggetto-${hunt.reward}-${page.viewportSize().width}.png`});
  if(use){await page.locator(`[data-select-tool="${hunt.reward}"]`).click();await page.locator('#map').click();await page.locator(`#panel-content [data-location="${hunt.target}"]`).click();await expect(page.locator('.tool-gate')).toHaveCount(0);}
  await page.locator('#close-panel').click();
}
