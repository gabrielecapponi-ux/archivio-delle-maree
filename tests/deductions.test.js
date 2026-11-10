import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DEDUCTIONS,restoreDeductions} from '../src/deductions.js';
import {HUNTS,investigationAPI,restoreInvestigation} from '../src/investigation.js';

for(const d of DEDUCTIONS)test(`deduzione ${d.id}: prove, errore, soluzione e salvataggio`,()=>{
  const api=investigationAPI(d.chapter),hunt=HUNTS.find(h=>h.id===d.hunt);let s=api.newGame();
  if(hunt.room===1){if(d.chapter===1)Object.assign(s,{letter:true,keyUsed:true,safe:true,projection:true,astrolabe:true});else Object.assign(s,{register:true,pumps:true,echoes:true,conduits:true});s.extension.room=1;}
  assert.equal(api.act(s,'i-deduce',{id:d.id,selected:d.pair}).success,false);
  s=api.act(s,'i-open',hunt.cover.id).state;
  for(const item of hunt.items)s=api.act(s,'i-find',item.id).state;
  const before=structuredClone(s),wrong=hunt.items.filter(i=>!d.pair.includes(i.id)).slice(0,2).map(i=>i.id);
  assert.equal(api.act(s,'i-deduce',{id:d.id,selected:wrong}).success,false);assert.deepEqual(s,before);
  const result=api.act(s,'i-deduce',{id:d.id,selected:[...d.pair].reverse()});assert.equal(result.success,true);assert.deepEqual(s,before);
  assert.equal(api.progress(result.state),api.progress(s));assert.deepEqual(result.state.investigation.found,s.investigation.found);
  assert.equal(api.act(result.state,'i-deduce',{id:d.id,selected:d.pair}).success,false);
  const restored=restoreInvestigation(d.chapter,JSON.parse(JSON.stringify(result.state.investigation)),result.state);assert.deepEqual(restored.deductions,[d.id]);
});
test('le deduzioni scartano dati corrotti e prove di altri capitoli',()=>{
  assert.deepEqual(restoreDeductions(1,['ada','ada','elia','missing'],['desk-feather','desk-seal']),['ada']);
  assert.deepEqual(restoreDeductions(1,['ada'],[]),[]);
  const partial={version:1,found:['desk-feather','desk-seal'],deductions:['ada']};
  assert.deepEqual(restoreInvestigation(1,partial,investigationAPI(1).newGame()).deductions,[]);
  const api=investigationAPI(1),s=api.newGame();for(const value of [null,{}, {id:'elia',selected:[]},{id:'ada',selected:['desk-seal','desk-seal']}])assert.equal(api.act(s,'i-deduce',value).success,false);
  assert.deepEqual(restoreInvestigation(1,{version:1,found:[],opened:[],crafted:[],used:[]},s).deductions,[]);
});
