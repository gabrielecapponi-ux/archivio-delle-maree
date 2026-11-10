export const LOCATIONS = [
  {id:'register',name:'Il registro dei nomi',short:'Il registro'},
  {id:'pumps',name:'La camera di compensazione',short:'Le pompe'},
  {id:'echoes',name:'Il carillon delle voci',short:'Le voci'},
  {id:'conduits',name:'Il mosaico delle correnti',short:'Il mosaico'},
  {id:'heart',name:'Il cuore dell’archivio',short:'Il cuore'},
];
export const ECHOES=[{glyph:'♜',name:'Faro',frequency:261.63},{glyph:'≋',name:'Onda',frequency:329.63},{glyph:'◔',name:'Conchiglia',frequency:392},{glyph:'◇',name:'Abisso',frequency:523.25}];
export const MELODY=[0,2,1,3,2];
export const CAPACITIES=[8,5,3];
export const PIPE_TYPES=['straight','elbow','stone','elbow','elbow','elbow','elbow','straight','elbow'];
export function newGame(){return {version:1,chapter:2,started:false,register:false,pumps:false,echoes:false,conduits:false,heart:false,secret:false,lensOn:false,water:[8,0,0],notes:[],pipes:[1,0,0,3,1,0,2,1,0],choice:null,hints:0};}
export function restoreGame(data){
  if(!data||data.version!==1||data.chapter!==2)return newGame();
  const s=newGame();for(const key of ['started','register','pumps','echoes','conduits','heart','secret','lensOn'])s[key]=data[key]===true;
  if(Array.isArray(data.water)&&data.water.length===3&&data.water.every((n,i)=>Number.isInteger(n)&&n>=0&&n<=CAPACITIES[i])&&data.water.reduce((a,b)=>a+b,0)===8)s.water=[...data.water];
  if(Array.isArray(data.pipes)&&data.pipes.length===9&&data.pipes.every(n=>Number.isInteger(n)&&n>=0&&n<4))s.pipes=[...data.pipes];
  if(Array.isArray(data.notes)&&data.notes.length<=5&&data.notes.every((n,i)=>n===MELODY[i]))s.notes=[...data.notes];
  s.pumps&&=s.register;s.echoes&&=s.pumps;s.conduits&&=s.echoes;s.heart&&=s.conduits;s.secret&&=s.register;
  if(['custodire','liberare'].includes(data.choice)&&s.heart)s.choice=data.choice;else s.heart=false;
  if(s.pumps)s.water=[4,4,0];if(!s.pumps)s.notes=[];
  s.hints=Number.isInteger(data.hints)?Math.min(999,Math.max(0,data.hints)):0;
  return s;
}
export function progress(s){return [s.register,s.pumps,s.echoes,s.conduits,s.heart].filter(Boolean).length;}
export function objective(s){
  if(s.heart)return 'Elia è salvo. L’archivio ricorderà la tua scelta.';
  if(s.conduits)return 'Porta il cilindro di Elia al cuore dell’archivio.';
  if(s.echoes)return 'Ricostruisci una corrente continua nel mosaico.';
  if(s.pumps)return 'Ascolta e ripeti il ricordo nel carillon delle voci.';
  if(s.register)return 'Dividi le otto misure d’acqua in due parti uguali.';
  return 'Leggi il registro lasciato ai piedi della scala.';
}
export function inventory(s){return [
  {id:'lens',glyph:'◉',name:'Lente di marea',description:'La lente recuperata nell’osservatorio rivela ancora ciò che il tempo ha cancellato. Provala sul registro dei nomi.'},
  ...(s.register?[{id:'plate',glyph:'▥',name:'Lamina di compensazione',description:'Otto misure in totale. Due serbatoi devono contenere quattro misure ciascuno; il terzo deve rimanere vuoto. Versa finché la sorgente si svuota o il recipiente è pieno.'}]:[]),
  ...(s.pumps?[{id:'fork',glyph:'♧',name:'Diapason di vetro',description:'Il carillon risponde alle immagini oltre che ai suoni. Ripeti il ricordo nell’ordine in cui appare; non c’è un limite di tempo.'}]:[]),
  ...(s.echoes?[{id:'memory',glyph:'◈',name:'Ricordo di Ada',description:'Tua madre ha fondato l’archivio per conservare le voci dei dispersi. Ma Elia è vivo: bisogna riportare il suo ricordo alla sorgente.'}]:[]),
  ...(s.conduits&&!s.heart?[{id:'cylinder',glyph:'⌬',name:'Cilindro di Elia',description:'La sua voce pulsa nel vetro. Inseriscilo nel cuore dell’archivio per riportare tuo fratello alla realtà.'}]:[]),
];}
export function connections(index,rotation){return (PIPE_TYPES[index]==='straight'?[1,3]:PIPE_TYPES[index]==='elbow'?[0,1]:[]).map(n=>(n+rotation)%4);}
export function tracePipes(pipes){
  const path=[];let index=0,entry=3;
  for(let guard=0;guard<10;guard++){
    if(path.includes(index))return {connected:false,path,leak:index};
    const ports=connections(index,pipes[index]);if(!ports.includes(entry))return {connected:false,path,leak:index};path.push(index);
    const exit=ports.find(p=>p!==entry);
    if(index===5&&exit===1)return {connected:true,path,leak:null};
    const x=index%3,y=Math.floor(index/3),nx=x+[0,1,0,-1][exit],ny=y+[-1,0,1,0][exit];
    if(nx<0||nx>2||ny<0||ny>2)return {connected:false,path,leak:index};
    index=ny*3+nx;entry=(exit+2)%4;
  }
  return {connected:false,path,leak:index};
}
export function act(state,type,payload){
  const s=structuredClone(state);let success=false,message='';
  switch(type){
    case 'start':s.started=true;success=true;break;
    case 'register':if(!s.register){s.register=true;success=true;message='Lamina raccolta. Il sistema di compensazione può essere riattivato.';}break;
    case 'lens':s.lensOn=!s.lensOn;success=true;message=s.lensOn?'La lente svela le tracce sommerse.':'Hai riposto la lente.';break;
    case 'secret':if(s.register&&s.lensOn&&!s.secret){s.secret=true;success=true;message='Una nota di tua madre è stata aggiunta al taccuino.';}break;
    case 'pour':{
      const {from,to}=payload??{};
      if(!s.register||s.pumps||![0,1,2].includes(from)||![0,1,2].includes(to)||from===to)break;
      const amount=Math.min(s.water[from],CAPACITIES[to]-s.water[to]);
      if(amount===0){message='Nessun travaso possibile: la sorgente è vuota o il recipiente è pieno.';break;}
      s.water[from]-=amount;s.water[to]+=amount;success=true;message=`Travasate ${amount} ${amount===1?'misura':'misure'} d’acqua.`;break;
    }
    case 'reset-water':if(s.register&&!s.pumps){s.water=[8,0,0];success=true;message='L’acqua è tornata nel serbatoio da otto misure.';}break;
    case 'pumps':if(s.register&&!s.pumps){if(s.water.join(',')==='4,4,0'){s.pumps=true;success=true;message='Pressioni equilibrate. L’acqua si ritira e un diapason emerge dal pavimento.';}else message='Servono quattro misure nel primo e nel secondo serbatoio, zero nel terzo.';}break;
    case 'note':if(s.pumps&&!s.echoes&&Number.isInteger(payload)&&payload>=0&&payload<4){
      if(payload===MELODY[s.notes.length]){s.notes.push(payload);success=true;if(s.notes.length===MELODY.length){s.echoes=true;message='Il carillon restituisce il ricordo di Ada Valenti, tua madre.';}}
      else{s.notes=[];message='Il ricordo si interrompe. Puoi riascoltarlo o leggere la trascrizione e riprovare.';}}break;
    case 'reset-notes':if(s.pumps&&!s.echoes){s.notes=[];success=true;}break;
    case 'pipe':if(s.echoes&&!s.conduits&&Number.isInteger(payload)&&payload>=0&&payload<9&&PIPE_TYPES[payload]!=='stone'){s.pipes[payload]=(s.pipes[payload]+1)%4;success=true;}break;
    case 'conduits':if(s.echoes&&!s.conduits){if(tracePipes(s.pipes).connected){s.conduits=true;success=true;message='La corrente torna alla sorgente. Il cilindro di Elia emerge dal mosaico.';}else message='La corrente si interrompe. Segui il tratto luminoso e ruota la tessera successiva.';}break;
    case 'heart':if(s.conduits&&!s.heart&&['custodire','liberare'].includes(payload)){s.heart=true;s.choice=payload;s.lensOn=false;success=true;message='Elia è tornato. Il secondo capitolo è completo.';}else if(!s.conduits)message='La voce di Elia è ancora dispersa. Ripara il mosaico delle correnti.';break;
    case 'hint':s.hints=Math.min(999,s.hints+1);success=true;break;
  }
  return {state:s,success,message};
}
export function hintsFor(s){
  if(!s.register)return ['Il registro è sul leggio vicino alla scala.','Apri Il registro e raccogli la lamina.'];
  if(!s.pumps)return ['Puoi solo versare fino a riempire un recipiente o svuotare la sorgente. Le otto misure non si perdono.','Usa il recipiente da tre per sottrarre tre misure al recipiente da cinque. Ti rimarranno due misure.','Dall’inizio: 8→5, 5→3, 3→8, 5→3, 8→5, 5→3, 3→8. Poi equilibra le pressioni.'];
  if(!s.echoes)return ['Il ricordo è una sequenza di cinque immagini. Ascoltarlo attiva anche un’indicazione visiva.','Puoi leggere la trascrizione: l’udito e la velocità non sono necessari.','Premi Faro, Conchiglia, Onda, Abisso, Conchiglia.'];
  if(!s.conduits)return ['La sorgente entra a sinistra, nella prima riga. L’uscita è a destra, nella seconda riga.','Unisci i due estremi di ogni tubo. La tessera in alto a destra è una pietra e non si attraversa.','Il percorso passa per: alto sinistra → alto centro → centro → centro sinistra → basso sinistra → basso centro → basso destra → centro destra.'];
  return ['Il cilindro di Elia è completo. Portalo al cuore centrale.','Le due scelte salvano Elia, ma decidono il destino dei ricordi: custodirli oppure restituirli all’isola.'];
}
