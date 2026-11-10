import * as first from './game.js';
import * as second from './chapter2.js';
import {restoreExtension} from './expansion.js';
import {investigationAPI,restoreInvestigation} from './investigation.js';
export const CAMPAIGN_KEY='archivio-maree-campagna-v2';
export const CHAPTERS={1:{roman:'I',title:'Il respiro della luce',place:'Osservatorio di Vespera',room:'La sala delle maree'},2:{roman:'II',title:'I nomi che il mare ricorda',place:'Archivio Sommerso',room:'La sala delle voci'}};
export function newCampaign(){return {version:2,activeChapter:1,chapters:{1:investigationAPI(1).newGame(),2:investigationAPI(2).newGame()},settings:{volume:.5,quality:'high',reduceMotion:false}};}
export function restoreCampaign(raw,legacy){
  const c=newCampaign();
  try{const d=JSON.parse(raw);if(d?.version===2){c.activeChapter=d.activeChapter===2?2:1;c.chapters[1]=first.restoreGame(JSON.stringify(d.chapters?.[1]));c.chapters[2]=second.restoreGame(d.chapters?.[2]);for(const n of [1,2]){c.chapters[n].extension=restoreExtension(n,d.chapters?.[n]?.extension,c.chapters[n]);c.chapters[n].investigation=restoreInvestigation(n,d.chapters?.[n]?.investigation,c.chapters[n]);}const prefs=d.settings??{};if(Number.isFinite(prefs.volume))c.settings.volume=Math.max(0,Math.min(1,prefs.volume));if(['high','low'].includes(prefs.quality))c.settings.quality=prefs.quality;c.settings.reduceMotion=prefs.reduceMotion===true;return c;}}catch{}
  c.chapters[1]=first.restoreGame(legacy);c.chapters[1].extension=restoreExtension(1,null,c.chapters[1]);c.chapters[1].investigation=restoreInvestigation(1,null,c.chapters[1]);return c;
}
export const chapterAPI=n=>investigationAPI(n);
