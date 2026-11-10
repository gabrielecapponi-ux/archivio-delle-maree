import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HUNTS,TOOL_DEFS,huntFor,huntComplete,newInvestigation,restoreInvestigation,investigationAPI} from '../src/investigation.js';

function run(chapter,overrides={}){
  const api=investigationAPI(chapter);let s=api.newGame();Object.assign(s,overrides);
  return {api,get state(){return s;},act(type,payload){const previous=structuredClone(s);const result=api.act(s,type,payload);assert.deepEqual(s,previous,'Gli input restano immutati');s=result.state;return result;}};
}
function search(g,hunt){assert.equal(g.act('i-open',hunt.cover.id).success,true);for(const i of hunt.items)assert.equal(g.act('i-find',i.id).success,true);}
function combine(g,hunt){const [first,second]=TOOL_DEFS[hunt.reward].parts;return g.act('i-combine',{first,second});}
function roomReady(chapter){const api=investigationAPI(chapter),s=api.newGame();if(chapter===1)Object.assign(s,{letter:true,keyUsed:true,safe:true,projection:true,astrolabe:true});else Object.assign(s,{register:true,pumps:true,echoes:true,conduits:true});s.extension.room=1;s.extension.diary=chapter===1;s.extension.catalog=chapter===2;s.extension.pressure=chapter===2;return s;}

test('quattro ricerche hanno oggetti univoci e ricette di due pezzi',()=>{
  assert.equal(HUNTS.length,4);const ids=HUNTS.flatMap(h=>h.items.map(i=>i.id));assert.equal(new Set(ids).size,24);
  for(const hunt of HUNTS){assert.equal(hunt.items.length,6);assert.equal(hunt.items.filter(i=>i.component).length,2);assert.equal(hunt.items.filter(i=>i.cover).length,1);assert.equal(huntFor(hunt.chapter,hunt.room),hunt);for(const i of hunt.items)assert.ok(i.x>=0&&i.x<=1&&i.y>=0&&i.y<=1&&i.w>0&&i.w<.2);}
});
test('la chiave si trova, si ricompone e si usa; la lettera non regala una chiave',()=>{
  const g=run(1),hunt=huntFor(1,0);g.act('letter');assert.equal(g.api.inventory(g.state).some(i=>i.id==='key'),false);
  assert.equal(g.act('key').success,false);assert.equal(g.act('safe').success,false);search(g,hunt);assert.equal(huntComplete(g.state,hunt.id),true);
  assert.equal(g.api.inventory(g.state).filter(i=>i.component).length,2);assert.equal(combine(g,hunt).success,true);
  assert.equal(g.api.inventory(g.state).filter(i=>i.component).length,0);assert.equal(g.api.inventory(g.state).find(i=>i.id==='key').tool,true);
  assert.equal(g.act('i-use',{item:'key',target:'safe'}).success,true);assert.equal(g.state.keyUsed,true);assert.ok(g.state.investigation.used.includes('key'));
  assert.equal(g.api.inventory(g.state).some(i=>i.id==='key'),false);assert.equal(g.api.progress(g.state),1);
  assert.equal(g.act('dial',{group:'safeDials',index:0,delta:1}).success,true);
});
test('astuccio, unicità e ricerca completa sono requisiti reali',()=>{
  const g=run(1),h=huntFor(1,0),hidden=h.items.find(i=>i.cover);
  assert.equal(g.act('i-find',hidden.id).success,false);g.act('i-open',h.cover.id);assert.equal(g.act('i-open',h.cover.id).success,false);
  for(const i of h.items.filter(i=>i.component))g.act('i-find',i.id);assert.equal(combine(g,h).success,false);
  assert.equal(g.act('i-find',hidden.id).success,false);for(const i of h.items.filter(i=>!i.component))g.act('i-find',i.id);assert.equal(combine(g,h).success,true);assert.equal(combine(g,h).success,false);
});
test('oggetti sbagliati, uso errato e prerequisiti mancanti non consumano nulla',()=>{
  const g=run(1),h=huntFor(1,0);search(g,h);const [a,b]=TOOL_DEFS.key.parts;
  const before=structuredClone(g.state.investigation);assert.equal(g.act('i-combine',{first:a,second:'desk-compass'}).success,false);assert.deepEqual(g.state.investigation,before);
  assert.equal(g.act('i-combine',{first:a,second:a}).success,false);g.act('i-combine',{first:a,second:b});
  assert.equal(g.act('i-use',{item:'key',target:'projector'}).success,false);assert.equal(g.act('i-use',{item:'key',target:'safe'}).success,false);
  assert.deepEqual(g.state.investigation.used,[]);assert.ok(g.api.inventory(g.state).some(i=>i.id==='key'));g.act('letter');assert.equal(g.act('i-use',{item:'key',target:'safe'}).success,true);
});
test('le ricerche non attraversano capitoli o porte chiuse',()=>{
  const g=run(1);assert.equal(g.act('i-open','workbench-case').success,false);assert.equal(g.act('i-find','workbench-crank-arm').success,false);
  assert.equal(g.act('i-find','gallery-shell').success,false);assert.equal(g.act('i-open','gallery-case').success,false);
  const open=roomReady(1);open.extension.room=0;const h=run(1,open);assert.equal(h.act('i-find','workbench-crank-arm').success,false);
  h.act('x-room',1);assert.equal(h.act('i-find','workbench-crank-arm').success,true);
});
test('manovella, valvola e bobina sbloccano soltanto il loro meccanismo',()=>{
  for(const id of ['handle','valve','cylinder']){
    const tool=TOOL_DEFS[id],hunt=HUNTS.find(h=>h.id===tool.hunt),initial=hunt.room===1?roomReady(hunt.chapter):investigationAPI(hunt.chapter).newGame();
    if(id==='valve')initial.register=true;const g=run(hunt.chapter,initial);
    const action=id==='handle'?'x-gear':id==='valve'?'pour':'x-fragment',payload=id==='valve'?{from:0,to:1}:0;
    assert.equal(g.act(action,payload).success,false);search(g,hunt);assert.equal(combine(g,hunt).success,true);
    assert.equal(g.act('i-use',{item:id,target:tool.target}).success,true);assert.equal(g.act(action,payload).success,true);
  }
});
test('salvataggio parziale conserva oggetti e combinazioni e scarta salti impossibili',()=>{
  const g=run(1),hunt=huntFor(1,0);g.act('letter');g.act('i-find',hunt.items[0].id);g.act('i-open',hunt.cover.id);
  assert.deepEqual(restoreInvestigation(1,g.state.investigation,g.state),g.state.investigation);
  const raw={version:1,found:['desk-key-shaft','desk-key-shaft','desk-key-bit','memory-locket'],opened:[],crafted:['key','handle'],used:['key']};
  assert.deepEqual(restoreInvestigation(1,raw,g.state),{...newInvestigation(),found:['desk-key-shaft']});
  searchRemaining(g,hunt);combine(g,hunt);assert.deepEqual(restoreInvestigation(1,g.state.investigation,g.state),g.state.investigation);
});
function searchRemaining(g,hunt){for(const i of hunt.items)if(!g.state.investigation.found.includes(i.id))g.act('i-find',i.id);}
test('i vecchi meccanismi già superati mantengono accesso e avanzamento',()=>{
  for(const n of [1,2]){
    const s=roomReady(n);if(n===1)s.extension.gears=true;else s.extension.strips=true;
    const restored=restoreInvestigation(n,null,s);assert.equal(restored.found.length,12);assert.equal(restored.crafted.length,2);assert.equal(restored.used.length,2);
    assert.equal(restoreInvestigation(n,{version:999},s).used.length,2);
  }
});
test('obiettivi seguono ricerca, combinazione e uso senza alterare le nove scoperte',()=>{
  const g=run(2),hunt=huntFor(2,0);g.act('register');assert.match(g.api.objective(g.state),/Cerca i sei oggetti/);search(g,hunt);assert.match(g.api.objective(g.state),/Combina/);combine(g,hunt);assert.match(g.api.objective(g.state),/Seleziona/);g.act('i-use',{item:'valve',target:'pumps'});assert.match(g.api.objective(g.state),/otto misure/);assert.equal(g.api.progress(g.state),1);
});
test('il cilindro narrativo e la bobina restaurata hanno identità distinte',()=>{
  const initial=roomReady(2),g=run(2,initial),hunt=huntFor(2,1);search(g,hunt);combine(g,hunt);
  const inventory=g.api.inventory(g.state);assert.ok(inventory.find(i=>i.id==='voice'));assert.equal(inventory.find(i=>i.id==='cylinder').name,'Bobina restaurata');assert.equal(new Set(inventory.map(i=>i.id)).size,inventory.length);
});
test('input malformati e chiavi già usate incoerenti vengono respinti senza bloccare la partita',()=>{
  const g=run(1),hunt=huntFor(1,0);g.act('letter');search(g,hunt);combine(g,hunt);
  for(const item of ['constructor','toString',null,{},'missing'])assert.equal(g.act('i-use',{item,target:'safe'}).success,false);
  const raw={...g.state.investigation,used:['key']};const restored=restoreInvestigation(1,raw,g.state);
  assert.deepEqual(restored.used,[]);assert.deepEqual(restored.crafted,['key']);
  assert.equal(g.act('i-use',{item:'key',target:'safe'}).success,true);
});
