import * as first from './game.js';
import * as second from './chapter2.js';

export const TOTAL_DISCOVERIES = 9;
export const STARS = [
  {name:'Il faro',x:19,y:69}, {name:'La vela',x:38,y:46},
  {name:'La rondine',x:59,y:23}, {name:'La conchiglia',x:82,y:52},
  {name:'La corona',x:68,y:79}, {name:'La bussola',x:30,y:18},
];
export const STAR_ROUTE = [0,1,2,3];
export const RECORDS = [
  {name:'Lina Ferri',date:1906,glyph:'✿',description:'La botanica: «Al mio arrivo Ada custodiva già la sala.»'},
  {name:'Ada Valenti',date:1889,glyph:'◉',description:'La custode: «Entrai sette anni dopo il cartografo.»'},
  {name:'Elia Valenti',date:1912,glyph:'♜',description:'Il visitatore: «Sono arrivato sei anni dopo Lina.»'},
  {name:'Pietro Riva',date:1882,glyph:'✧',description:'Il cartografo: «Il mio è il primo nome: 1882.»'},
];
export const STRIPS = [
  {first:'○',last:'◇',text:'e il faro risponderà'},
  {first:'☾',last:'△',text:'Nora, cerca il mio nome'},
  {first:'◇',last:'✧',text:'prima della prossima marea.'},
  {first:'△',last:'○',text:'dove nostra madre lasciò la luce,'},
];
const extraLocations = {
  1:[['diary','Il diario di Ada'],['gears','Il regolatore del faro'],['telescope','Il telescopio'],['tides','Il tavolo delle maree']],
  2:[['catalog','Lo schedario dei custodi'],['pressure','Il quadro di pressione'],['strips','I frammenti di voce'],['airlock','La campana di Elia']],
};
const stages = {1:['diary','gears','telescope','tides'],2:['catalog','pressure','strips','airlock']};
export function newExtension(chapter) {
  return chapter===1 ? {revision:1,room:0,diary:false,gears:false,telescope:false,tides:false,gearTeeth:[12,12],stars:[],tideLevels:[0,0,0]}
    : {revision:1,room:0,catalog:false,pressure:false,strips:false,airlock:false,records:[],valves:[0,0,0],fragments:[],locks:[false,false,false]};
}
export function restoreExtension(chapter,raw,base) {
  const e=newExtension(chapter), unlocked=chapter===1?base.astrolabe:base.conduits;
  // Completed legacy chapters stay complete; all extra locations remain replayable after restarting.
  if(!raw){if(chapter===1?base.door:base.heart){for(const k of stages[chapter])e[k]=true;}return e;}
  if(raw.revision!==1)return e;
  e.room=raw.room===1&&unlocked?1:0;
  let predecessor=unlocked;
  for(const k of stages[chapter]){e[k]=raw[k]===true&&predecessor;predecessor=e[k];}
  const ints=(key,len,max)=>{if(Array.isArray(raw[key])&&raw[key].length===len&&raw[key].every(x=>Number.isInteger(x)&&x>=0&&x<=max))e[key]=[...raw[key]];};
  const unique=(key,max)=>{if(Array.isArray(raw[key])&&raw[key].length<=max&&new Set(raw[key]).size===raw[key].length&&raw[key].every(x=>Number.isInteger(x)&&x>=0&&x<max))e[key]=[...raw[key]];};
  if(chapter===1){
    if(Array.isArray(raw.gearTeeth)&&raw.gearTeeth.length===2&&[12,24,36].includes(raw.gearTeeth[0])&&[12,24,48].includes(raw.gearTeeth[1]))e.gearTeeth=[...raw.gearTeeth];
    if(Array.isArray(raw.stars)&&raw.stars.length<=4&&raw.stars.every((x,i)=>x===STAR_ROUTE[i]))e.stars=[...raw.stars];
    ints('tideLevels',3,4);
  }else{unique('records',4);ints('valves',3,4);unique('fragments',4);if(Array.isArray(raw.locks)&&raw.locks.length===3&&raw.locks.every(x=>typeof x==='boolean'))e.locks=[...raw.locks];}
  return e;
}
export function pressures(valves){return [(valves[0]+valves[2])%5,(valves[0]+valves[1])%5,(valves[1]+valves[2])%5];}
export function extensionReady(chapter,s){return stages[chapter].every(k=>s.extension[k]);}
export function canEnter(chapter,s){return chapter===1?s.astrolabe:s.conduits;}
export function locationRoom(chapter,id){return extraLocations[chapter].some(x=>x[0]===id)||id===(chapter===1?'door':'heart')?1:0;}
export function extendedAPI(chapter){
  const base=chapter===1?first:second;
  return {...base,
    LOCATIONS:[...base.LOCATIONS.filter(x=>x.id!==(chapter===1?'door':'heart')), ...extraLocations[chapter].map(([id,name])=>({id,name,short:name})),base.LOCATIONS.at(-1)],
    newGame(){return {...base.newGame(),extension:newExtension(chapter)};},
    progress(s){return base.progress(s)+stages[chapter].filter(k=>s.extension?.[k]).length;},
    objective(s){
      if(!canEnter(chapter,s)||(chapter===1?s.door:s.heart))return base.objective(s);
      const e=s.extension;
      if(chapter===1){if(!e.diary)return 'Attraversa la porta e cerca il diario nell’officina.';if(!e.gears)return 'Ripara il regolatore seguendo gli appunti di Ada.';if(!e.telescope)return 'Ricostruisci la costellazione del ritorno nel telescopio.';if(!e.tides)return 'Prevedi la bassa marea per sbloccare la discesa.';return 'Il faro è acceso. Scendi con l’ascensore dell’officina.';}
      if(!e.catalog)return 'Entra nella camera dei ricordi e riordina i custodi.';if(!e.pressure)return 'Ristabilisci le tre pressioni nel quadro della campana.';if(!e.strips)return 'Ricomponi il messaggio spezzato di Elia.';if(!e.airlock)return 'Apri la campana senza interrompere il respiro di Elia.';return 'Porta la voce di Elia al cuore e scegli il futuro dell’archivio.';
    },
    inventory(s){const items=base.inventory(s);if(chapter===1&&s.extension?.diary)items.push({id:'diary',glyph:'▤',name:'Diario di Ada',description:'Il regolatore riduce sei battiti a uno. I due pignoni motori hanno 12 denti. La costellazione del ritorno: faro, vela, rondine, conchiglia.'});if(chapter===1&&s.extension?.telescope)items.push({id:'tidechart',glyph:'≋',name:'Effemeridi di Vespera',description:'La marea scende di una tacca ogni due ore: alle 18 è a 4, alle 20 a 3. Completa le ore 22, 24 e 02.'});if(chapter===2&&s.extension?.catalog)items.push({id:'permit',glyph:'⚿',name:'Permesso della custode',description:'Ada ha lasciato un messaggio: «Compensa 2 · 3 · 1. Ogni valvola alimenta due manometri.»'});return items;},
    hintsFor(s){if(!canEnter(chapter,s)||extensionReady(chapter,s))return base.hintsFor(s);const e=s.extension;if(chapter===1){if(!e.diary)return ['La porta accanto al lanternario conduce all’officina.','Entra nell’officina e apri il diario sul tavolo.'];if(!e.gears)return ['Due riduzioni in serie: ogni pignone motore ha 12 denti.','Il prodotto dei due rapporti deve essere 6:1.','Monta 36 denti sul primo asse e 24 sul secondo.'];if(!e.telescope)return ['La costellazione segue il viaggio descritto nel diario.','Collega Faro, Vela, Rondine, Conchiglia, in quest’ordine.'];return ['Le effemeridi seguono una discesa regolare: una tacca ogni due ore.','Alle 22: 2 tacche. Alle 24: 1. Alle 02: 0.'];}if(!e.catalog)return ['Ordina i custodi dal più antico al più recente. Le schede contengono tutte le date.','Pietro, Ada, Lina, Elia.'];if(!e.pressure)return ['La valvola A modifica i manometri sinistro e centrale; B il centrale e destro; C il sinistro e destro.','I valori ripartono da 0 dopo il 4. Devi ottenere 2, 3, 1.','Dalla posizione iniziale ruota A due volte, B una volta, C zero volte.'];if(!e.strips)return ['Ogni frammento termina col simbolo che apre il successivo. Inizia dalla Luna.','Luna → triangolo → cerchio → rombo → stella.'];return ['Ogni leva cambia anche quella subito a destra; l’ultima cambia solo se stessa.','Servono tutte e tre le lampade accese insieme.','Dalla posizione iniziale: leva sinistra, poi leva destra.'];},
    act(s,type,payload){
      if(type==='door'&&chapter===1&&!extensionReady(chapter,s))return {state:structuredClone(s),success:false,message:'La discesa è bloccata. Completa l’indagine nell’officina astronomica.'};
      if(type==='heart'&&chapter===2&&!extensionReady(chapter,s))return {state:structuredClone(s),success:false,message:'Elia è ancora nella campana. Esplora la camera dei ricordi e riattiva il suo respiro.'};
      if(!type.startsWith('x-'))return base.act(s,type,payload);
      const next=structuredClone(s),e=next.extension;let success=false,message='';
      if(type==='x-room'){if(payload===0||(payload===1&&canEnter(chapter,s))){e.room=payload;next.lensOn=false;success=true;}else message=chapter===1?'Serve il sigillo della macchina per entrare nell’officina.':'Il mosaico deve alimentare la porta della camera dei ricordi.';return {state:next,success,message};}
      if(!canEnter(chapter,s))return {state:next,success:false,message:'Questo meccanismo è oltre la porta ancora chiusa.'};
      if(chapter===1){
        if(type==='x-diary'&&!e.diary){e.diary=true;success=true;message='Il diario di tua madre è nel taccuino. La sua ricerca non era finita.';}
        if(type==='x-gear'&&e.diary&&!e.gears&&[0,1].includes(payload)){const choices=payload===0?[12,24,36]:[12,24,48];e.gearTeeth[payload]=choices[(choices.indexOf(e.gearTeeth[payload])+1)%3];success=true;}
        if(type==='x-gears'&&e.diary&&!e.gears){if(e.gearTeeth[0]*e.gearTeeth[1]===864){e.gears=true;success=true;message='Sei battiti per un giro. Il telescopio segue di nuovo il cielo.';}else message='Il faro deve compiere sei battiti per un giro dell’uscita. Controlla entrambi i rapporti.';}
        if(type==='x-star'&&e.gears&&!e.telescope&&Number.isInteger(payload)&&payload>=0&&payload<6){if(payload===STAR_ROUTE[e.stars.length]){e.stars.push(payload);success=true;if(e.stars.length===4){e.telescope=true;message='La costellazione rivela le effemeridi della notte. La marea aprirà la strada.';}}else{e.stars=[];message='Questa stella non appartiene al percorso. Riparti dal faro.';}}
        if(type==='x-tide'&&e.telescope&&!e.tides&&[0,1,2].includes(payload)){e.tideLevels[payload]=(e.tideLevels[payload]+1)%5;success=true;}
        if(type==='x-tides'&&e.telescope&&!e.tides){if(e.tideLevels.join()=== '2,1,0'){e.tides=true;success=true;message='Bassa marea alle due. L’ascensore può scendere in sicurezza.';}else message='Ogni due ore il livello scende di una tacca. Continua la serie delle effemeridi.';}
      }else{
        if(type==='x-record'&&!e.catalog&&[0,1,2,3].includes(payload)){const i=e.records.indexOf(payload);if(i>=0)e.records.splice(i,1);else e.records.push(payload);success=true;}
        if(type==='x-catalog'&&!e.catalog){if(e.records.join()==='3,1,0,2'){e.catalog=true;success=true;message='Lo schedario riconosce Ada. Il suo permesso sblocca il quadro di pressione.';}else message='I custodi vanno dal primo arrivo al più recente. Confronta le quattro testimonianze.';}
        if(type==='x-valve'&&e.catalog&&!e.pressure&&[0,1,2].includes(payload)){e.valves[payload]=(e.valves[payload]+1)%5;success=true;}
        if(type==='x-pressure'&&e.catalog&&!e.pressure){if(pressures(e.valves).join()==='2,3,1'){e.pressure=true;success=true;message='La campana è stabile. Il fonografo restituisce quattro frammenti.';}else message='Le pressioni non sono ancora 2, 3, 1. Ogni valvola modifica due manometri.';}
        if(type==='x-fragment'&&e.pressure&&!e.strips&&[0,1,2,3].includes(payload)){const i=e.fragments.indexOf(payload);if(i>=0)e.fragments.splice(i,1);else e.fragments.push(payload);success=true;}
        if(type==='x-strips'&&e.pressure&&!e.strips){if(e.fragments.join()==='1,3,0,2'){e.strips=true;success=true;message='«Nora, cerca il mio nome…» La voce è intera. Elia ti sente.';}else message='La bobina comincia con la Luna. Unisci i simboli alle estremità dei frammenti.';}
        if(type==='x-lock'&&e.strips&&!e.airlock&&[0,1,2].includes(payload)){e.locks[payload]=!e.locks[payload];if(payload<2)e.locks[payload+1]=!e.locks[payload+1];success=true;}
        if(type==='x-airlock'&&e.strips&&!e.airlock){if(e.locks.every(Boolean)){e.airlock=true;success=true;message='Tre respiri allineati. La campana si apre: Elia è vivo.';}else message='Tutte e tre le spie devono essere accese. Le leve sono collegate a destra.';}
      }
      return {state:next,success,message};
    },
  };
}
