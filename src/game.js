export const SAVE_KEY = 'archivio-maree-capitolo-1-v1';
export const SYMBOLS = [
  { glyph: '☼', name: 'Sole' }, { glyph: '☾', name: 'Luna' },
  { glyph: '✧', name: 'Stella' }, { glyph: '≋', name: 'Onda' },
  { glyph: '♜', name: 'Faro' }, { glyph: '〰', name: 'Vento' },
];
export const LOCATIONS = [
  {id:'letter',name:'Lo scrittoio',short:'La lettera'},
  {id:'safe',name:'Il cofanetto',short:'Il cofanetto'},
  {id:'projector',name:'Il lanternario',short:'Il lanternario'},
  {id:'astrolabe',name:'La macchina delle maree',short:'La macchina'},
  {id:'door',name:'La porta dell’archivio',short:'La porta'},
];
export function newGame() {
  return {version:1,started:false,letter:false,keyUsed:false,safe:false,projection:false,astrolabe:false,door:false,lensOn:false,safeDials:[0,0,0],mirrors:[0,0,0],rings:[0,0,0],hints:0};
}
export function restoreGame(raw) {
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return newGame();
    const s = newGame();
    for (const k of ['started','letter','keyUsed','safe','projection','astrolabe','door','lensOn']) s[k] = data[k] === true;
    for (const [key,mod] of [['safeDials',6],['mirrors',4],['rings',6]]) {
      if (Array.isArray(data[key]) && data[key].length===3 && data[key].every(n=>Number.isInteger(n)&&n>=0&&n<mod)) s[key]=[...data[key]];
    }
    s.hints = Number.isInteger(data.hints) ? Math.max(0,Math.min(999,data.hints)) : 0;
    s.keyUsed &&= s.letter; s.safe &&= s.keyUsed; s.projection &&= s.safe;
    s.astrolabe &&= s.projection; s.door &&= s.astrolabe; s.lensOn &&= s.safe;
    return s;
  } catch { return newGame(); }
}
export function progress(s) { return [s.letter,s.safe,s.projection,s.astrolabe,s.door].filter(Boolean).length; }
export function objective(s) {
  if(s.door) return 'Il passaggio è aperto. Il viaggio continua.';
  if(s.astrolabe) return 'Inserisci il sigillo nella porta dell’archivio.';
  if(s.projection) return 'Allinea gli anelli della macchina usando la carta celeste.';
  if(s.safe) return 'Usa la lente sul lanternario e ritrova la rotta della luce.';
  if(s.letter) return 'Apri il cofanetto seguendo le parole di Elia.';
  return 'Esamina la lettera sullo scrittoio.';
}
export function inventory(s) {
  const items=[];
  if(s.letter&&!s.keyUsed) items.push({id:'key',glyph:'⚿',name:'Chiave di rame',description:'Una piccola chiave con un’onda incisa. Appartiene al cofanetto sullo scaffale.'});
  if(s.safe) items.push({id:'lens',glyph:'◉',name:'Lente di marea',description:'Il vetro rivela scritte invisibili. Attivala con L oppure con il pulsante Lente.'});
  if(s.projection) items.push({id:'chart',glyph:'✧',name:'Carta celeste',description:'Anello esterno: Faro. Anello mediano: Onda. Anello interno: Luna. Porta questi simboli sotto il riferimento in alto.'});
  if(s.astrolabe&&!s.door) items.push({id:'seal',glyph:'❖',name:'Sigillo delle maree',description:'Il cuore della macchina. La sua forma coincide con l’incavo sulla porta dell’archivio.'});
  return items;
}
export function act(state,type,payload) {
  const s=structuredClone(state); let message=''; let success=false;
  const match=(a,b)=>a.every((v,i)=>v===b[i]);
  switch(type) {
    case 'start': s.started=true; success=true; break;
    case 'letter': if(!s.letter){s.letter=true;message='Hai raccolto la chiave di rame.';success=true;} break;
    case 'key': if(s.letter&&!s.keyUsed){s.keyUsed=true;message='La chiave gira. Ora puoi regolare i tre quadranti.';success=true;}else if(!s.letter)message='Manca una piccola chiave. Cerca sullo scrittoio.';break;
    case 'dial': {
      const {group,index,delta=1}=payload??{};
      const mod={safeDials:6,mirrors:4,rings:6}[group];
      const allowed=(group==='safeDials'&&s.keyUsed&&!s.safe)||(group==='mirrors'&&s.safe&&!s.projection)||(group==='rings'&&s.projection&&!s.astrolabe);
      if(mod&&allowed&&Number.isInteger(index)&&index>=0&&index<3&&[1,-1].includes(delta)) {s[group][index]=(s[group][index]+delta+mod)%mod;success=true;}break;
    }
    case 'safe': if(s.keyUsed&&!s.safe){if(match(s.safeDials,[3,1,4])){s.safe=true;message='Il cofanetto si apre. Hai trovato la lente di marea.';success=true;}else message='Gli ingranaggi resistono. Rileggi i tre versi della lettera.';}break;
    case 'lens': if(s.safe){s.lensOn=!s.lensOn;success=true;message=s.lensOn?'La lente rivela ciò che la luce nasconde.':'Hai riposto la lente.';}break;
    case 'projection': if(s.safe&&!s.projection){if(match(s.mirrors,[3,1,2])){s.projection=true;message='La luce raggiunge il ricevitore. Carta celeste aggiunta al taccuino.';success=true;}else message='Il fascio si disperde. Ogni prisma deve indicare la direzione dell’incisione.';}break;
    case 'astrolabe': if(s.projection&&!s.astrolabe){if(match(s.rings,[4,3,1])){s.astrolabe=true;message='La macchina respira di nuovo. Hai ottenuto il sigillo delle maree.';success=true;}else message='Le orbite non sono allineate. Confronta i simboli in alto con la carta celeste.';}break;
    case 'door': if(s.astrolabe&&!s.door){s.door=true;s.lensOn=false;message='Il primo capitolo è completo.';success=true;}else if(!s.astrolabe) message='L’incavo è vuoto. Serve il sigillo custodito nella macchina.';break;
    case 'hint': s.hints++;success=true;break;
  }
  return {state:s,message,success};
}
export function hintsFor(s) {
  if(!s.letter) return ['Una busta ti aspetta sullo scrittoio, a sinistra.','Apri «La lettera» e raccogli la chiave.'];
  if(!s.safe) return ['La lettera descrive onde, luna e lampi, in questo ordine.','Inserisci la chiave nel cofanetto. I numeri sono tre, uno e quattro.','Imposta i quadranti su 3 · 1 · 4, poi apri il cofanetto.'];
  if(!s.projection) return ['La lente di marea rivela un’incisione sul lanternario.','Tramonto = Ovest. Alba = Est. Fondale = Sud.','Imposta i prismi su O · E · S, poi accendi il lanternario.'];
  if(!s.astrolabe) return ['La carta celeste è nell’inventario e nel taccuino.','Allinea il simbolo di ogni anello al triangolo in alto.','Esterno: Faro ♜. Mediano: Onda ≋. Interno: Luna ☾.'];
  return ['Esamina la porta dell’archivio.','Inserisci il sigillo delle maree per completare il capitolo.'];
}
