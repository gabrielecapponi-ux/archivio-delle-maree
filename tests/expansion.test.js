import {test} from 'node:test';
import assert from 'node:assert/strict';
import {extendedAPI,restoreExtension,pressures} from '../src/expansion.js';
import {newCampaign,restoreCampaign} from '../src/campaign.js';
function ready(chapter){const api=extendedAPI(chapter);let s=api.newGame();if(chapter===1)Object.assign(s,{started:true,letter:true,keyUsed:true,safe:true,projection:true,astrolabe:true});else Object.assign(s,{started:true,register:true,pumps:true,echoes:true,conduits:true,water:[4,4,0]});return {api,get state(){return s;},act(type,payload){const before=structuredClone(s);const r=api.act(s,type,payload);assert.deepEqual(s,before);s=r.state;return r;}};}
test('officina: tutti i passaggi nuovi sono necessari e il percorso termina a nove scoperte',()=>{
  const g=ready(1);assert.equal(g.act('door').success,false);assert.equal(g.act('x-gears').success,false);
  g.act('x-room',1);g.act('x-diary');assert.equal(g.act('x-gears').success,false);
  g.act('x-gear',0);g.act('x-gear',0);g.act('x-gear',1);assert.equal(g.act('x-gears').success,true);
  g.act('x-star',0);g.act('x-star',2);assert.deepEqual(g.state.extension.stars,[]);
  [0,1,2,3].forEach(n=>g.act('x-star',n));assert.equal(g.state.extension.telescope,true);
  assert.equal(g.act('door').success,false);g.act('x-tide',0);g.act('x-tide',0);g.act('x-tide',1);g.act('x-tides');
  assert.equal(g.act('door').success,true);assert.equal(g.api.progress(g.state),9);
});
test('camera dei ricordi: ordine, pressione, voce e campana conducono a entrambi i finali',()=>{
  for(const choice of ['liberare','custodire']){const g=ready(2);assert.equal(g.act('heart',choice).success,false);
    [3,1,0,2].forEach(i=>g.act('x-record',i));g.act('x-catalog');assert.equal(g.state.extension.catalog,true);
    g.act('x-valve',0);g.act('x-valve',0);g.act('x-valve',1);assert.deepEqual(pressures(g.state.extension.valves),[2,3,1]);g.act('x-pressure');
    [1,3,0,2].forEach(i=>g.act('x-fragment',i));g.act('x-strips');g.act('x-lock',0);g.act('x-lock',2);g.act('x-airlock');
    assert.equal(g.act('heart',choice).success,true);assert.equal(g.api.progress(g.state),9);assert.equal(g.state.choice,choice);
  }
});
test('tutti gli stati delle valvole conservano un percorso risolvibile',()=>{
  for(let a=0;a<5;a++)for(let b=0;b<5;b++)for(let c=0;c<5;c++){const p=pressures([a,b,c]);assert.ok(p.every(n=>n>=0&&n<5));}
  const solutions=[];for(let a=0;a<5;a++)for(let b=0;b<5;b++)for(let c=0;c<5;c++)if(pressures([a,b,c]).join()==='2,3,1')solutions.push([a,b,c]);assert.deepEqual(solutions,[[2,1,0]]);
});
test('schede e frammenti si possono rimuovere e riposizionare senza perdere indizi',()=>{
  const g=ready(2);g.act('x-record',2);g.act('x-record',1);g.act('x-record',2);assert.deepEqual(g.state.extension.records,[1]);assert.equal(g.act('x-catalog').success,false);assert.equal(g.state.extension.catalog,false);
});
test('salvataggi parziali e vecchie partite completate restano leggibili',()=>{
  const c=newCampaign(),g=ready(1);g.act('x-room',1);g.act('x-diary');g.act('x-gear',0);c.chapters[1]=g.state;
  const migrated=restoreCampaign(JSON.stringify(c));const {investigation,...preserved}=migrated.chapters[1];assert.deepEqual(preserved,c.chapters[1]);assert.deepEqual(investigation.used,['key']);assert.deepEqual(restoreCampaign(JSON.stringify(migrated)),migrated);
  const old={...g.state,door:true};delete old.extension;c.chapters[1]=old;
  const restored=restoreCampaign(JSON.stringify(c));assert.equal(extendedAPI(1).progress(restored.chapters[1]),9);
  assert.equal(restored.chapters[1].door,true);
});
test('dati corrotti e comandi prematuri non consentono salti nelle nuove stanze',()=>{
  for(const n of [1,2]){const api=extendedAPI(n),s=api.newGame();for(const action of ['x-room','x-diary','x-catalog','x-pressure','x-tides','x-airlock'])assert.equal(api.act(s,action,1).success,false);
    const e=restoreExtension(n,{revision:1,room:1,diary:true,gears:true,telescope:true,tides:true,catalog:true,pressure:true,strips:true,airlock:true,gearTeeth:[0,999],valves:[-1,20,4],stars:[5,9],records:[1,1]},s);
    assert.equal(e.room,0);assert.equal(n===1?e.diary:e.catalog,false);
  }
});
