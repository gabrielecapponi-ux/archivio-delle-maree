import {extendedAPI,canEnter} from './expansion.js';

const item=(hunt,kind,name,x,y,w,description,component=false,extra={})=>({
  id:`${hunt}-${kind}`,kind,name,x,y,w,description,component,...extra,
});

export const HUNTS=[
  {id:'desk',chapter:1,room:0,title:'I segreti dello scrittoio',reward:'key',target:'safe',
    clue:'L’orologio di Elia si è fermato alle due. Sulla cera è rimasto il simbolo di Ada: qualcuno ha aperto la lettera prima di te.',
    cover:{id:'desk-case',name:'Apri l’astuccio di rame',x:.33,y:.655,w:.083},
    items:[
      item('desk','key-shaft','Asta della chiave',.12,.785,.050,'L’asta è integra, ma il pettine della chiave è stato svitato.',true,{rotation:-24}),
      item('desk','key-bit','Pettine della chiave',.33,.655,.047,'Il piccolo pettine combacia con l’asta trovata sullo scrittoio.',true,{cover:'desk-case',rotation:12}),
      item('desk','compass','Bussola',.28,.74,.044,'L’ago indica l’officina, non il nord. Elia aveva già scoperto un campo magnetico sotto il pavimento.'),
      item('desk','pocketwatch','Orologio da tasca',.365,.665,.036,'Le lancette sono ferme alle due: l’ora segnata da Elia prima della discesa.',false,{rotation:16}),
      item('desk','feather','Penna di airone',.09,.69,.052,'È la penna di Ada. L’inchiostro ancora fresco non appartiene alla lettera di Elia.',false,{rotation:28}),
      item('desk','seal','Sigillo di cera',.217,.755,.030,'La cera porta una piccola conchiglia, lo stesso segno inciso sugli strumenti di tua madre.'),
    ]},
  {id:'workbench',chapter:1,room:1,title:'Il banco della custode',reward:'handle',target:'gears',
    clue:'La medaglia porta una dedica: «A Nora, che rimetterà in moto ciò che noi abbiamo fermato». Ada ha preparato questo ritorno molto tempo prima.',
    cover:{id:'workbench-case',name:'Apri la scatola degli attrezzi',x:.815,y:.66,w:.085},
    items:[
      item('workbench','crank-arm','Braccio della manovella',.22,.81,.076,'Un braccio di ottone. Sul foro manca ancora l’impugnatura di legno.',true,{rotation:23}),
      item('workbench','crank-grip','Impugnatura di noce',.815,.66,.055,'L’impugnatura è stata tolta per impedire al regolatore di girare da solo.',true,{cover:'workbench-case',rotation:-15}),
      item('workbench','caliper','Calibro',.115,.731,.067,'Ada aveva annotato due misure: dodici denti per entrambi i pignoni motori.',false,{rotation:-28}),
      item('workbench','gear','Ruota dentata',.375,.795,.054,'Una ruota di prova. I graffi mostrano che il meccanismo è stato smontato di recente.'),
      item('workbench','oilcan','Oliatore',.663,.695,.052,'L’olio ha lo stesso profumo di cedro che ricordavi nel laboratorio di tua madre.',false,{rotation:8}),
      item('workbench','medal','Medaglia di Ada',.738,.808,.047,'Sul retro: «A Nora, che rimetterà in moto ciò che noi abbiamo fermato».',false,{rotation:-8}),
    ]},
  {id:'gallery',chapter:2,room:0,title:'Le tracce sotto l’acqua',reward:'valve',target:'pumps',
    clue:'La targhetta della pompa è stata rimossa a mano. Elia ha tentato di fermare l’acqua prima di entrare nella camera dei ricordi.',
    cover:{id:'gallery-case',name:'Apri l’astuccio impermeabile',x:.835,y:.763,w:.08},
    items:[
      item('gallery','valve-rim','Corona della valvola',.117,.81,.065,'Alla corona manca il mozzo. Insieme possono riaprire l’alimentazione delle pompe.',true,{rotation:14}),
      item('gallery','valve-hub','Mozzo della valvola',.835,.763,.046,'Il perno quadrato è compatibile con la corona recuperata vicino al registro.',true,{cover:'gallery-case'}),
      item('gallery','shell','Conchiglia',.348,.743,.052,'La spirale è incisa con il nome di Ada. Era il suo contrassegno da custode.',false,{rotation:-18}),
      item('gallery','bottle','Ampolla di vetro',.066,.635,.043,'Nell’ampolla galleggia una striscia: «Nessuna voce appartiene al suo custode».',false,{rotation:17}),
      item('gallery','anchor','Piccola ancora',.66,.777,.053,'Un fermacarte che Nora aveva regalato a Elia. La corda è stata tagliata di fresco.',false,{rotation:24}),
      item('gallery','tag','Targhetta numerata',.917,.573,.055,'La targhetta appartiene alla pompa: otto misure devono diventare due respiri uguali.',false,{rotation:-10}),
    ]},
  {id:'memory',chapter:2,room:1,title:'Gli oggetti che ricordano',reward:'cylinder',target:'strips',
    clue:'Nella fotografia siete tutti e tre davanti al faro. Sul retro Ada ha scritto: «La memoria deve aiutare a tornare, mai impedire di partire».',
    cover:{id:'memory-case',name:'Apri il cofanetto del fonografo',x:.29,y:.77,w:.083},
    items:[
      item('memory','cylinder-core','Nucleo della bobina',.421,.724,.066,'Il nucleo conserva i solchi della voce. Per montarlo serve il cappuccio della custode.',true,{rotation:-14}),
      item('memory','cylinder-cap','Cappuccio della bobina',.29,.77,.048,'Il cappuccio tiene insieme il nucleo e il supporto del fonografo.',true,{cover:'memory-case',rotation:12}),
      item('memory','photograph','Fotografia di famiglia',.127,.76,.077,'Nora, Elia e Ada davanti al faro. Il messaggio sul retro parla di ritorni, non di prigionia.',false,{rotation:-8}),
      item('memory','ribbon','Nastro azzurro',.589,.615,.055,'Ada usava un nastro azzurro per contrassegnare i ricordi destinati a essere restituiti.',false,{rotation:20}),
      item('memory','tuningfork','Diapason d’argento',.887,.673,.046,'Una piccola incisione indica l’ordine della bobina: la Luna apre il messaggio.',false,{rotation:-24}),
      item('memory','locket','Medaglione aperto',.735,.862,.047,'Nel medaglione c’è un capello di Nora. Ada non ha mai smesso di aspettare i suoi figli.',false,{rotation:14}),
    ]},
];

export const TOOL_DEFS={
  key:{id:'key',name:'Chiave di rame',kind:'key',glyph:'⚿',target:'safe',hunt:'desk',parts:['desk-key-shaft','desk-key-bit'],description:'La chiave ricomposta apre la serratura del cofanetto. Selezionala e usala sul cofanetto.'},
  handle:{id:'handle',name:'Manovella restaurata',kind:'handle',glyph:'⚙',target:'gears',hunt:'workbench',parts:['workbench-crank-arm','workbench-crank-grip'],description:'Il braccio d’ottone e l’impugnatura di noce sono di nuovo uniti. Monta la manovella sul regolatore del faro.'},
  valve:{id:'valve',name:'Valvola ricomposta',kind:'valve',glyph:'✥',target:'pumps',hunt:'gallery',parts:['gallery-valve-rim','gallery-valve-hub'],description:'La corona e il mozzo combaciano. Installa la valvola sulla camera di compensazione per poter travasare l’acqua.'},
  cylinder:{id:'cylinder',name:'Bobina restaurata',kind:'cylinder',glyph:'⌬',target:'strips',hunt:'memory',parts:['memory-cylinder-core','memory-cylinder-cap'],description:'Il nucleo è protetto dal suo cappuccio. Inserisci la bobina nel fonografo per ricomporre i frammenti della voce di Elia.'},
};

export const huntFor=(chapter,room)=>HUNTS.find(h=>h.chapter===chapter&&h.room===room);
export function newInvestigation(){return {version:1,found:[],opened:[],crafted:[],used:[]};}
export function huntComplete(state,huntId){
  const hunt=HUNTS.find(h=>h.id===huntId);
  return !!hunt&&hunt.items.every(item=>state.investigation?.found?.includes(item.id));
}
const roomAccessible=(chapter,state,hunt)=>hunt.chapter===chapter&&(hunt.room===0||canEnter(chapter,state));
const atHunt=(chapter,state,hunt)=>roomAccessible(chapter,state,hunt)&&(state.extension?.room??0)===hunt.room;
const requirementMet=(tool,state)=>tool==='key'?state.letter===true:tool==='handle'?state.extension?.diary===true:tool==='valve'?state.register===true:state.extension?.pressure===true;
const gatePassed=(tool,state)=>tool==='key'?state.keyUsed===true:tool==='handle'?state.extension?.gears===true:tool==='valve'?state.pumps===true:state.extension?.strips===true;
const validStrings=(value,allowed)=>Array.isArray(value)?[...new Set(value.filter(x=>typeof x==='string'&&allowed.has(x)))]:[];
const add=(array,value)=>{if(!array.includes(value))array.push(value);};

export function restoreInvestigation(chapter,raw,baseState){
  const data=newInvestigation(),hunts=HUNTS.filter(h=>roomAccessible(chapter,baseState,h));
  const covers=new Set(hunts.map(h=>h.cover.id)),items=hunts.flatMap(h=>h.items),tools=new Set(hunts.map(h=>h.reward));
  if(raw?.version===1){
    data.opened=validStrings(raw.opened,covers);
    data.found=validStrings(raw.found,new Set(items.filter(i=>!i.cover||data.opened.includes(i.cover)).map(i=>i.id)));
    data.crafted=validStrings(raw.crafted,tools).filter(id=>huntComplete({investigation:data},TOOL_DEFS[id].hunt));
    data.used=validStrings(raw.used,new Set(data.crafted)).filter(id=>requirementMet(id,baseState)&&(id!=='key'||baseState.keyUsed===true));
  }
  // Preserve mechanisms already solved in older saves without forcing a replay.
  for(const hunt of hunts){if(gatePassed(hunt.reward,baseState)){
    add(data.opened,hunt.cover.id);for(const item of hunt.items)add(data.found,item.id);
    add(data.crafted,hunt.reward);add(data.used,hunt.reward);
  }}
  return data;
}

function investigationOf(chapter,state){return state.investigation??restoreInvestigation(chapter,null,state);}
function pendingTool(chapter,state){
  const used=investigationOf(chapter,state).used;
  if(chapter===1){
    if(state.letter&&!state.safe&&!used.includes('key'))return TOOL_DEFS.key;
    if(state.extension?.diary&&!state.extension?.gears&&!used.includes('handle'))return TOOL_DEFS.handle;
  }else{
    if(state.register&&!state.pumps&&!used.includes('valve'))return TOOL_DEFS.valve;
    if(state.extension?.pressure&&!state.extension?.strips&&!used.includes('cylinder'))return TOOL_DEFS.cylinder;
  }
  return null;
}
function gateFor(chapter,type,payload){
  if(chapter===1){
    if(type==='key'||type==='safe'||(type==='dial'&&payload?.group==='safeDials'))return TOOL_DEFS.key;
    if(['x-gear','x-gears'].includes(type))return TOOL_DEFS.handle;
  }else{
    if(['pour','reset-water','pumps'].includes(type))return TOOL_DEFS.valve;
    if(['x-fragment','x-strips'].includes(type))return TOOL_DEFS.cylinder;
  }
  return null;
}
const missingToolMessage=tool=>`Prima trova gli oggetti della ricerca, combina i due pezzi e usa ${tool.name.toLowerCase()} sul meccanismo.`;

export function investigationAPI(chapter){
  const base=extendedAPI(chapter);
  return {...base,
    newGame(){return {...base.newGame(),investigation:newInvestigation(chapter)};},
    inventory(state){
      const data=investigationOf(chapter,state);
      const result=base.inventory(state).filter(i=>i.id!=='key').map(i=>chapter===2&&i.id==='cylinder'?{...i,id:'voice',kind:'cylinder'}:i);
      for(const hunt of HUNTS.filter(h=>h.chapter===chapter)){
        if(!data.crafted.includes(hunt.reward))for(const item of hunt.items){if(item.component&&data.found.includes(item.id))result.push({...item,glyph:'◇',component:true});}
        if(data.crafted.includes(hunt.reward)&&!data.used.includes(hunt.reward))result.push({...TOOL_DEFS[hunt.reward],tool:true});
      }
      return result;
    },
    objective(state){
      const tool=pendingTool(chapter,state);if(!tool)return base.objective(state);
      const hunt=HUNTS.find(h=>h.id===tool.hunt),data=investigationOf(chapter,state);
      if(data.crafted.includes(tool.id))return `Seleziona ${tool.name.toLowerCase()} nell’inventario e usala sul meccanismo.`;
      if(huntComplete({investigation:data},hunt.id))return `Hai trovato le sei tracce. Combina i due pezzi per ottenere ${tool.name.toLowerCase()}.`;
      return `Cerca i sei oggetti: ${hunt.title.toLowerCase()}. Ti serviranno per ricostruire ${tool.name.toLowerCase()}.`;
    },
    hintsFor(state){
      const tool=pendingTool(chapter,state);if(!tool){if(chapter===1&&!state.letter)return ['Leggi la lettera sullo scrittoio.','La lettera spiega quale meccanismo protegge la lente; gli oggetti sparsi nella stanza ti aiuteranno ad aprirlo.'];return base.hintsFor(state);}
      const hunt=HUNTS.find(h=>h.id===tool.hunt),data=investigationOf(chapter,state),parts=tool.parts.map(id=>hunt.items.find(i=>i.id===id).name);
      if(data.crafted.includes(tool.id))return [`${tool.name} è pronta nell’inventario.`,`Esaminala, scegli «Usa», poi tocca ${tool.target==='safe'?'il cofanetto':tool.target==='gears'?'il regolatore':tool.target==='pumps'?'le pompe':'il fonografo'}.`];
      if(huntComplete({investigation:data},hunt.id))return ['La ricerca è completa. Due degli oggetti sono parti dello stesso utensile.',`Combina ${parts[0].toLowerCase()} e ${parts[1].toLowerCase()}.`];
      return [`Apri «Cerca oggetti» nella stanza: ${hunt.title.toLowerCase()}.`,'Tocca gli oggetti riconoscibili. Un pezzo è nascosto dentro un astuccio che puoi aprire.','Il suggerimento della ricerca evidenzia una traccia ancora da trovare, anche sui lati della scena.'];
    },
    act(state,type,payload){
      const s=structuredClone(state);s.investigation=structuredClone(investigationOf(chapter,state));const data=s.investigation;
      const fail=message=>({state:s,success:false,message});
      if(typeof type!=='string')return fail('');
      if(!type.startsWith('i-')){
        const tool=gateFor(chapter,type,payload);
        if(tool&&!data.used.includes(tool.id))return fail(missingToolMessage(tool));
        const result=base.act(s,type,payload);
        if(result.success&&type==='letter')result.message='Lettera raccolta. La chiave è smontata: cerca i suoi pezzi e le altre tracce sullo scrittoio.';
        if(result.success&&type==='register')result.message='Registro trascritto e lamina raccolta. Cerca i pezzi della valvola nella galleria sommersa.';
        return result;
      }
      if(type==='i-open'){
        const hunt=HUNTS.find(h=>h.cover.id===payload&&h.chapter===chapter);
        if(!hunt||!atHunt(chapter,s,hunt))return fail('Raggiungi prima la stanza che contiene questo astuccio.');
        if(data.opened.includes(payload))return fail('L’astuccio è già aperto.');
        data.opened.push(payload);return {state:s,success:true,message:'L’astuccio si apre. All’interno c’è un pezzo da recuperare.'};
      }
      if(type==='i-find'){
        const hunt=HUNTS.find(h=>h.chapter===chapter&&h.items.some(i=>i.id===payload));
        if(!hunt||!atHunt(chapter,s,hunt))return fail('Questo oggetto si trova in un’altra stanza.');
        const item=hunt.items.find(i=>i.id===payload);
        if(data.found.includes(item.id))return fail('Hai già raccolto questo oggetto.');
        if(item.cover&&!data.opened.includes(item.cover))return fail('L’oggetto è dentro l’astuccio. Aprilo prima di raccoglierlo.');
        data.found.push(item.id);
        const complete=huntComplete(s,hunt.id);
        return {state:s,success:true,message:complete?`Sei oggetti ritrovati. ${hunt.clue} Ora puoi combinare i due pezzi.`:`${item.name} ${item.component?'aggiunto all’inventario':'annotato nel taccuino'}.`};
      }
      if(type==='i-combine'){
        const {first,second}=payload??{};
        if(typeof first!=='string'||typeof second!=='string'||first===second)return fail('Seleziona due oggetti diversi da combinare.');
        const tool=Object.values(TOOL_DEFS).find(t=>t.parts.includes(first)&&t.parts.includes(second));
        const hunt=tool&&HUNTS.find(h=>h.id===tool.hunt);
        if(!tool||hunt.chapter!==chapter)return fail('Questi due oggetti non combaciano. Nessun oggetto è stato consumato.');
        if(data.crafted.includes(tool.id))return fail('Hai già ricomposto questo utensile.');
        if(!tool.parts.every(id=>data.found.includes(id)))return fail('Devi prima raccogliere entrambi i pezzi.');
        if(!huntComplete(s,hunt.id))return fail('Completa la ricerca dei sei oggetti prima di ricomporre l’utensile.');
        data.crafted.push(tool.id);return {state:s,success:true,message:`Hai ottenuto ${tool.name.toLowerCase()}. Esaminala nell’inventario e usala sul meccanismo giusto.`};
      }
      if(type==='i-use'){
        const {item:toolId,target}=payload??{},tool=typeof toolId==='string'&&Object.hasOwn(TOOL_DEFS,toolId)?TOOL_DEFS[toolId]:null,hunt=tool&&HUNTS.find(h=>h.id===tool.hunt);
        if(!tool||!hunt||hunt.chapter!==chapter||!data.crafted.includes(toolId))return fail('Prima trova i pezzi e combina l’utensile nell’inventario.');
        if(data.used.includes(toolId))return fail('Questo utensile è già montato.');
        if(target!==tool.target)return fail('Questo oggetto non serve qui. È ancora nel tuo inventario.');
        if(!atHunt(chapter,s,hunt))return fail('Raggiungi prima il meccanismo nella sua stanza.');
        if(!requirementMet(toolId,s))return fail(toolId==='key'?'Leggi prima la lettera di Elia.':toolId==='handle'?'Leggi prima il diario di Ada sul tavolo.':toolId==='valve'?'Leggi prima il registro e raccogli la lamina.':'Stabilizza prima le pressioni della campana.');
        if(toolId==='key'){
          const result=base.act(s,'key');if(!result.success)return result;
          add(result.state.investigation.used,toolId);return {...result,message:'La chiave gira nel cofanetto. I tre quadranti sono pronti.'};
        }
        data.used.push(toolId);
        return {state:s,success:true,message:toolId==='handle'?'Manovella montata. Ora puoi regolare le due ruote del faro.':toolId==='valve'?'Valvola installata. Le pompe possono trasferire l’acqua.':'Bobina inserita. Puoi ricomporre i frammenti della voce di Elia.'};
      }
      return fail('');
    },
  };
}
