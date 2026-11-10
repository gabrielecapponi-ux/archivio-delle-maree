import test from 'node:test';
import assert from 'node:assert/strict';
import * as second from '../src/chapter2.js';
import * as first from '../src/game.js';
import {newCampaign,restoreCampaign} from '../src/campaign.js';
const pours=[[0,1],[1,2],[2,0],[1,2],[0,1],[1,2],[2,0]];
const correctPipes=[0,2,0,1,3,1,0,0,3];
function run(){let state=second.newGame();const snapshots=[];return {get state(){return state;},snapshots,act(type,payload){const before=structuredClone(state),r=second.act(state,type,payload);assert.deepEqual(state,before);state=r.state;snapshots.push(structuredClone(state));return r;},water(){this.act('register');for(const[from,to]of pours)this.act('pour',{from,to});this.act('pumps');},echoes(){this.water();for(const n of second.MELODY)this.act('note',n);},pipes(){this.echoes();for(let i=0;i<9;i++)while(state.pipes[i]!==correctPipes[i])this.act('pipe',i);this.act('conduits');}};}
test('il secondo capitolo si completa in entrambe le diramazioni senza mutare gli input',()=>{
  for(const choice of ['custodire','liberare']){const g=run();g.act('start');g.pipes();assert.equal(second.progress(g.state),4);assert.ok(second.inventory(g.state).some(i=>i.id==='cylinder'));assert.equal(g.act('heart',choice).success,true);assert.equal(second.progress(g.state),5);assert.equal(g.state.choice,choice);assert.equal(g.act('heart',choice).success,false);assert.ok(!second.inventory(g.state).some(i=>i.id==='cylinder'));for(const s of g.snapshots)assert.deepEqual(second.restoreGame(s),s);}
});
test('ogni travaso conserva otto misure e rispetta le capacità per tutti gli stati raggiungibili',()=>{
  const firstState={...second.newGame(),register:true};const queue=[firstState],seen=new Set();
  while(queue.length){const s=queue.shift(),key=s.water.join();if(seen.has(key))continue;seen.add(key);for(let from=0;from<3;from++)for(let to=0;to<3;to++){const r=second.act(s,'pour',{from,to});assert.equal(r.state.water.reduce((a,b)=>a+b),8);r.state.water.forEach((v,i)=>assert.ok(v>=0&&v<=second.CAPACITIES[i]));if(r.success)queue.push(r.state);}}
  assert.ok(seen.has('4,4,0'));assert.ok(seen.size>10);
});
test('nessun enigma può essere saltato e le combinazioni sbagliate non danno premi',()=>{
  const s=second.newGame();for(const [t,p]of [['pumps'],['note',0],['pipe',0],['heart','liberare'],['conduits'],['pour',{from:0,to:1}],['secret']]){const r=second.act(s,t,p);assert.equal(r.success,false,t);assert.deepEqual(r.state,s);}
  const g=run();g.act('register');assert.equal(g.act('pumps').success,false);g.water();g.act('note',1);assert.deepEqual(g.state.notes,[]);assert.equal(g.state.echoes,false);
});
test('una nota errata azzera solo la sequenza e permette di riprovare',()=>{
  const g=run();g.water();g.act('note',0);g.act('note',1);assert.deepEqual(g.state.notes,[]);assert.equal(g.state.pumps,true);for(const n of second.MELODY)g.act('note',n);assert.equal(g.state.echoes,true);assert.deepEqual(g.state.notes,second.MELODY);assert.equal(g.act('note',0).success,false);
});
test('il circuito è verificato per connettività e rileva rotture, bordi e pietra',()=>{
  assert.deepEqual(second.tracePipes(correctPipes),{connected:true,path:[0,1,4,3,6,7,8,5],leak:null});
  for(const i of [0,1,3,4,5,6,7,8]){const broken=[...correctPipes];broken[i]=(broken[i]+1)%4;assert.equal(second.tracePipes(broken).connected,false,`tubo ${i}`);}
  assert.equal(second.tracePipes(second.newGame().pipes).connected,false);
});
test('la nota di Ada è facoltativa, richiede la lente e non aggiunge progresso obbligatorio',()=>{
  const g=run();g.act('register');assert.equal(g.act('secret').success,false);g.act('lens');assert.equal(g.act('secret').success,true);assert.equal(second.progress(g.state),1);assert.equal(g.act('secret').success,false);assert.equal(second.restoreGame(g.state).secret,true);
});
test('salvataggi malformati sono normalizzati senza impossibili salti di capitolo',()=>{
  for(const d of [null,[],{},false,{version:1,chapter:1}])assert.deepEqual(second.restoreGame(d),second.newGame());
  const s=second.restoreGame({...second.newGame(),register:false,pumps:true,echoes:true,conduits:true,heart:true,choice:'liberare',water:[8,8,8],notes:[3,9],pipes:[0],hints:-7});assert.equal(second.progress(s),0);assert.deepEqual(s.water,[8,0,0]);assert.deepEqual(s.notes,[]);assert.equal(s.choice,null);
});
test('input non validi non modificano il secondo capitolo',()=>{
  const g=run();g.water();for(const[type,payload]of [['note',NaN],['note',-1],['note','1'],['pipe',20],['pour',{from:9,to:0}],['heart','invalid'],['unknown']])assert.equal(g.act(type,payload).success,false);
});
test('la migrazione preserva il capitolo originale e avvia un archivio indipendente',()=>{
  let old=first.newGame();old=first.act(old,'start').state;old=first.act(old,'letter').state;
  const c=restoreCampaign(null,JSON.stringify(old));const {extension:firstExtension,investigation:firstInvestigation,...original}=c.chapters[1];const {extension:secondExtension,investigation:secondInvestigation,...archive}=c.chapters[2];assert.deepEqual(original,old);assert.deepEqual(archive,second.newGame());assert.deepEqual(firstInvestigation.found,[]);assert.deepEqual(secondInvestigation.found,[]);assert.equal(firstExtension.diary,false);assert.equal(secondExtension.catalog,false);assert.equal(c.activeChapter,1);
  c.chapters[2]=second.act(c.chapters[2],'register').state;c.activeChapter=2;c.settings={volume:.3,quality:'low',reduceMotion:true};assert.deepEqual(restoreCampaign(JSON.stringify(c)),c);
});
test('ricominciare l’archivio non cancella l’osservatorio o le impostazioni',()=>{
  const c=newCampaign();c.chapters[1]=first.act(c.chapters[1],'letter').state;c.chapters[2]=second.act(c.chapters[2],'register').state;c.settings.volume=.2;c.chapters[2]=second.newGame();assert.equal(c.chapters[1].letter,true);assert.equal(c.settings.volume,.2);assert.equal(second.progress(c.chapters[2]),0);
});
