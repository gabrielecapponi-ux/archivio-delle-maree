import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-500-italic.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import './cinematic.css';
import { createCinematicWorld, SCENES } from './cinematic-world.js';
import { TOTAL_DISCOVERIES, canEnter, locationRoom } from './expansion.js';
import { renderExpansionPanel } from './expansion-ui.js';
import { HUNTS,TOOL_DEFS,huntFor,huntComplete } from './investigation.js';
import { createSearchScene } from './search-scene.js';
import { objectArt } from './object-art.js';
import { createItemViewer } from './item-viewer.js';
import { renderArchivePanel } from './chapter2-ui.js';
import { ECHOES, MELODY } from './chapter2.js';
import { CAMPAIGN_KEY, CHAPTERS, restoreCampaign, chapterAPI } from './campaign.js';
import { createAudio } from './audio.js';
import { SAVE_KEY, SYMBOLS } from './game.js';
import { setupOffline, offlineMessage } from './pwa.js';
import './phone.css';

const $ = (selector)=>document.querySelector(selector);
let campaign;
try { campaign=restoreCampaign(localStorage.getItem(CAMPAIGN_KEY),localStorage.getItem(SAVE_KEY)); } catch { campaign=restoreCampaign(null,null); }
if(location.hash==='#capitolo-2')campaign.activeChapter=2;
if(location.hash==='#capitolo-1')campaign.activeChapter=1;
let chapter=campaign.activeChapter,state=campaign.chapters[chapter],LOCATIONS=chapterAPI(chapter).LOCATIONS;
const progress=s=>chapterAPI(s.chapter??1).progress(s),objective=s=>chapterAPI(s.chapter??1).objective(s),inventory=s=>chapterAPI(s.chapter??1).inventory(s),hintsFor=s=>chapterAPI(s.chapter??1).hintsFor(s);
let playing=false, modal=null, selected=null, hintIndex=0, lastHintStage=-1, toastTimer, world, lastFocus, playbackToken=0, echoPlayback=false;
let searchView=null,searchId=null,selectedTool=null,combineSelection=[],itemViewer=null;
const audio=createAudio();
const compass=`<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="24"/><ellipse cx="32" cy="32" rx="11" ry="24"/><path d="M8 32h48M32 8v48M15 15l34 34M15 49l34-34"/><path class="solid" d="m32 17 4 15-4 15-4-15Z"/></svg>`;
const icon={sound:'♪',muted:'♩',book:'▤',help:'?',menu:'☰',back:'←',close:'×',lens:'◉'};

$('#app').innerHTML=`
  <main id="experience" aria-label="L’Archivio delle Maree, gioco di enigmi">
    <div id="world" role="img" aria-label="Osservatorio di Vespera. Esplora gli oggetti nella scena oppure apri la mappa."></div>
    <div class="atmosphere" aria-hidden="true"></div><div class="lens-vignette" aria-hidden="true"></div>
    <header class="topbar">
      <button class="brand" id="brand" aria-label="Apri il menu">${compass}<span>L’Archivio<br><b>delle Maree</b></span></button>
      <div class="chapter-label"><span>Capitolo I</span><i></i>Il respiro della luce</div>
      <div class="top-actions"><button class="icon-button" id="fullscreen" aria-label="Schermo intero" title="Schermo intero">⛶</button><button class="icon-button" id="sound" aria-label="Attiva audio" title="Attiva audio">${icon.muted}</button><button class="icon-button" id="menu" aria-label="Apri menu" title="Menu">${icon.menu}</button></div>
    </header>
    <section id="title-screen" class="title-screen" aria-labelledby="game-title">
      <div class="place-date"><span class="line"></span>Isola di Vespera, 1912</div>
      <h1 id="game-title">L’Archivio<br>delle <em>Maree</em></h1>
      <p class="title-quote">Il mare restituisce ogni cosa.<br>Tranne i suoi segreti.</p>
      <div class="chapter-intro"><span class="chapter-number">I</span><div><small>Primo capitolo</small><h2>Il respiro della luce</h2></div></div>
      <button class="primary start-button" id="start"><span>${state.started?'Continua il capitolo':'Entra nell’osservatorio'}</span><span aria-hidden="true">↗</span></button>
      <button class="chapter-select-link" data-action="chapters">Scegli un capitolo <span>Ⅰ / Ⅱ</span></button>
      <p class="start-meta">Trova gli oggetti. Ricomponi gli indizi. Ritrova Elia.</p>
    </section>
    <div class="opening-footer"><span>Esplora. Osserva. Ricomponi.</span><span>Una storia originale, in italiano</span></div>
    <div id="hud" hidden>
      <div class="location-caption"><span class="small-diamond">◇</span><div><small>Osservatorio di Vespera</small><span id="location-name">La sala delle maree</span></div></div>
      <div id="markers" aria-label="Oggetti nella stanza">${LOCATIONS.map(l=>`<button class="marker" data-location="${l.id}" aria-label="Esamina ${l.name.toLowerCase()}"><span class="target-ring"></span><b>${l.short}</b></button>`).join('')}</div>
      <aside class="objective"><small>La tua ricerca</small><p id="objective"></p><div class="progress-track" aria-label="Progresso capitolo">${Array.from({length:9},(_,i)=>`<i data-step="${i}"></i>`).join('')}<span id="progress-text"></span></div></aside>
      <div class="utility-bar"><button id="search" class="utility" aria-label="Cerca oggetti nella stanza">⌕<span>Cerca oggetti</span></button><button id="lens" class="utility" hidden>${icon.lens}<span>Lente</span><kbd>L</kbd></button><button id="journal" class="utility">${icon.book}<span>Taccuino</span><kbd>T</kbd></button><button id="map" class="utility" aria-label="Apri mappa degli oggetti">⌖<span>Mappa</span></button><button id="reveal" class="utility" aria-label="Mostra oggetti interattivi" aria-pressed="false">◎<span>Oggetti</span></button><button id="hint" class="utility">${icon.help}<span>Indizio</span></button></div>
      <div class="bottom-bar"><div class="inventory-block"><span class="inventory-label">Con te</span><div id="inventory"></div></div><button class="overview-button" id="overview">↶ <span>La stanza</span></button><span class="save-status" id="save-status">Progressi salvati</span></div>
      <button id="room-travel" class="room-travel"><span id="travel-name"></span><b>›</b></button><nav hidden class="location-nav" aria-label="Esplora gli oggetti">${LOCATIONS.map((l,i)=>`<button data-location="${l.id}"><span class="nav-number">0${i+1}</span>${l.short}<span class="nav-check" id="check-${l.id}"></span></button>`).join('')}</nav>
      <div class="drag-tip">Esamina gli oggetti nella stanza <span>·</span> Trascina per esplorare i lati</div>
    </div>
    <div id="search-layer" hidden></div><div id="selected-tool" hidden></div>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>
    <div id="modal-layer" hidden><section class="inspection-panel" role="dialog" aria-modal="true" aria-labelledby="panel-title" tabindex="-1"><button class="close-button" id="close-panel" aria-label="Chiudi e torna alla stanza">×</button><div id="panel-content"></div></section></div>
    <div id="load-message">La luce sta entrando nell’osservatorio…</div>
  </main>`;

function save(){campaign.chapters[chapter]=state;campaign.activeChapter=chapter;try{localStorage.setItem(CAMPAIGN_KEY,JSON.stringify(campaign));localStorage.setItem(SAVE_KEY,JSON.stringify(campaign.chapters[1]));$('#save-status').textContent='Progressi salvati';}catch{$('#save-status').textContent='Salvataggio non disponibile';}}
function notify(message){if(!message)return;clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),4800);}
function update(){
  $('#objective').textContent=objective(state);
  const count=progress(state);$('#progress-text').textContent=`${count} / ${TOTAL_DISCOVERIES}`;
  document.querySelectorAll('[data-step]').forEach(el=>el.classList.toggle('done',Number(el.dataset.step)<count));
  $('#lens').hidden=chapter===1&&!state.safe;$('#lens').classList.toggle('active',state.lensOn);$('#lens').setAttribute('aria-pressed',state.lensOn);
  $('#experience').classList.toggle('lens-active',state.lensOn);
  const items=inventory(state);
  $('#inventory').innerHTML=items.length?items.map(i=>`<button class="inventory-item ${i.kind?'has-art':''} ${i.id===selectedTool?'selected':''}" data-item="${i.id}" aria-label="Esamina ${i.name.toLowerCase()}" title="${i.name}">${i.kind?objectArt(i.kind,`inventory-${i.id}`):`<span>${i.glyph}</span>`}<b>${i.name}</b></button>`).join(''):'<span class="empty-inventory">Ogni oggetto ha una storia.</span>';
  const completed=chapter===2?{register:state.register,pumps:state.pumps,echoes:state.echoes,conduits:state.conduits,heart:state.heart}:{letter:state.letter,safe:state.safe,projector:state.projection,astrolabe:state.astrolabe,door:state.door};
  for(const [id,done] of Object.entries(completed)) {const el=$(`#check-${id}`);if(el)el.textContent=done?'✓':'';document.querySelectorAll(`[data-location="${id}"]`).forEach(el=>el.classList.toggle('discovered',!!done));}
  world?.setProgress({...state,lens:chapter===2||state.safe});world?.setLens(state.lensOn);
  const room=state.extension.room;$('#location-name').textContent=SCENES[chapter][room].name;$('#travel-name').textContent=room?(chapter===1?'Torna all’osservatorio':'Torna alla galleria'):chapter===1?'L’officina astronomica':'La camera dei ricordi';$('#room-travel').classList.toggle('locked',!room&&!canEnter(chapter,state));
  for(const l of LOCATIONS)document.querySelectorAll(`[data-location="${l.id}"]`).forEach(el=>el.classList.toggle('discovered',!!state[l.id]||!!state.extension[l.id]));
  searchView?.update(state);updateSelectedTool();
  save();
}
function dispatch(type,payload){
  if(echoPlayback)cancelPlayback();
  const result=chapterAPI(chapter).act(state,type,payload);state=result.state;
  if(type==='note'){audio.note(ECHOES[payload].frequency);world?.pulseNote?.(payload);}
  if(type==='dial'||type==='pipe'||type==='pour')audio.tick();else if(result.success&&['x-gears','x-tides','x-catalog','x-pressure','x-strips','x-airlock','safe','projection','astrolabe','door','pumps','conduits','heart'].includes(type))audio.success();else if(result.success&&type!=='note')audio.tick();
  update();if(modal)renderPanel();if(result.success&&!result.message)$('#toast').classList.remove('show');notify(result.message);return result;
}
function setBackgroundInert(value){for(const selector of ['.topbar','#hud','#title-screen'])$(selector).inert=value;}
function openPanel(id){clearTimeout(toastTimer);$('#toast').classList.remove('show');cancelPlayback();if(!modal)lastFocus=document.activeElement;modal=id;$('#modal-layer').hidden=false;$('#experience').classList.add('panel-open');setBackgroundInert(true);world?.setInteractive(false);renderPanel();$('.inspection-panel').scrollTop=0;$('#close-panel').focus();}
function closePanel(){itemViewer?.dispose();itemViewer=null;cancelPlayback();modal=null;$('#modal-layer').hidden=true;$('#experience').classList.remove('panel-open');setBackgroundInert(false);world?.setInteractive(playing);world?.overview();if(lastFocus?.isConnected&&!lastFocus.closest('[hidden]'))lastFocus.focus();else if(selected)$(`.marker[data-location="${selected}"]`)?.focus();else if(!playing)$('#start').focus();}
function selectLocation(id){if(!playing||!LOCATIONS.some(l=>l.id===id))return;if(selectedTool){const result=dispatch('i-use',{item:selectedTool,target:id});if(!result.success)return;selectedTool=null;updateSelectedTool();}const room=locationRoom(chapter,id);if(room!==state.extension.room){const result=dispatch('x-room',room);if(!result.success)return;}selected=id;world?.focus(id);openPanel(id);}
function begin(){
  const fresh=!state.started;playing=true;dispatch('start');$('#title-screen').hidden=true;$('.opening-footer').hidden=true;$('#hud').hidden=false;$('#experience').classList.add('playing');world?.setInteractive(true);
  if(chapter===1?state.door:state.heart)openPanel('ending');else if(fresh)openPanel('intro');
}
function cancelPlayback(){playbackToken++;echoPlayback=false;}
async function playMemory(){
  dispatch('reset-notes');const token=++playbackToken;echoPlayback=true;
  document.querySelectorAll('[data-note],[data-action="c2-listen"]').forEach(b=>b.disabled=true);
  for(let i=0;i<MELODY.length;i++){
    if(token!==playbackToken||modal!=='echoes')return;
    const n=MELODY[i],note=ECHOES[n];$('#echo-window').innerHTML=`<span>${note.glyph}</span><p>${i+1} / 5 · ${note.name}</p>`;
    document.querySelectorAll('[data-note]').forEach(b=>b.classList.toggle('sounding',Number(b.dataset.note)===n));audio.note(note.frequency);world?.pulseNote?.(n);
    await new Promise(resolve=>setTimeout(resolve,850));
  }
  if(token!==playbackToken||modal!=='echoes')return;echoPlayback=false;renderPanel();$('#echo-window').innerHTML='<span>◉</span><p>Ora tocca a te. Nessuna fretta.</p>';$('#panel-content [data-note="0"]').focus();
}
function refreshChapterChrome(){
  const meta=CHAPTERS[chapter];LOCATIONS=chapterAPI(chapter).LOCATIONS;
  $('#experience').classList.toggle('underwater',chapter===2);document.title=`L’Archivio delle Maree — Capitolo ${meta.roman}`;
  $('.chapter-label').innerHTML=`<span>Capitolo ${meta.roman}</span><i></i>${meta.title}`;
  $('.place-date').innerHTML=`<span class="line"></span>${chapter===2?'Trentadue metri sotto Vespera':'Isola di Vespera, 1912'}`;
  $('#game-title').innerHTML=chapter===2?'L’Archivio<br><em>Sommerso</em>':'L’Archivio<br>delle <em>Maree</em>';
  $('.title-quote').innerHTML=chapter===2?'Ogni nome è una voce.<br>Ogni voce vuole tornare.':'Il mare restituisce ogni cosa.<br>Tranne i suoi segreti.';
  $('.chapter-intro').innerHTML=`<span class="chapter-number">${meta.roman}</span><div><small>${chapter===2?'Secondo capitolo':'Primo capitolo'}</small><h2>${meta.title}</h2></div>`;
  $('#start').innerHTML=`<span>${state.started?'Continua il capitolo':chapter===2?'Scendi nell’archivio':'Entra nell’osservatorio'}</span><span aria-hidden="true">↗</span>`;
  $('.location-caption small').textContent=meta.place;$('#location-name').textContent=meta.room;
  $('#world').setAttribute('aria-label',`${meta.place}, ambiente esplorabile. Usa anche la mappa degli oggetti.`);
  $('#markers').innerHTML=LOCATIONS.map(l=>`<button class="marker" data-location="${l.id}" aria-label="Esamina ${l.name.toLowerCase()}"><span class="target-ring"></span><b>${l.short}</b></button>`).join('');
  $('.location-nav').innerHTML=LOCATIONS.map((l,i)=>`<button data-location="${l.id}"><span class="nav-number">0${i+1}</span>${l.short}<span class="nav-check" id="check-${l.id}"></span></button>`).join('');
}
function mountWorld(){
  world?.dispose();world=null;$('#world').replaceChildren();$('#markers').hidden=false;
  try{world=createCinematicWorld($('#world'),{chapter,onSelect:selectLocation});world.setQuality?.(campaign.settings.quality);world.setMotion?.(campaign.settings.reduceMotion);world.setInteractive(playing&&!modal);$('#load-message')?.remove();}
  catch(error){console.error(error);$('#markers').hidden=true;let message=$('#load-message');if(!message){message=document.createElement('div');message.id='load-message';$('#experience').appendChild(message);}message.textContent='L’ambiente non è disponibile. Apri la mappa per esplorare gli oggetti e continuare.';message.classList.add('fallback');}
  $('#experience').classList.toggle('motion-reduced',campaign.settings.reduceMotion);
  audio.setChapter(chapter);audio.setVolume(campaign.settings.volume);update();
}
function switchChapter(number,launch=true){
  if(![1,2].includes(number))return;closeSearch();selectedTool=null;combineSelection=[];save();closePanel();playing=false;selected=null;chapter=number;state=campaign.chapters[chapter];hintIndex=0;lastHintStage=-1;
  $('#title-screen').hidden=false;$('.opening-footer').hidden=false;$('#hud').hidden=true;$('#experience').classList.remove('playing');
  refreshChapterChrome();mountWorld();history.replaceState(null,'',`#capitolo-${chapter}`);if(launch)begin();
}
function heading(kicker,title,body=''){return `<p class="panel-kicker">${kicker}</p><h2 id="panel-title">${title}</h2>${body?`<p class="panel-description">${body}</p>`:''}`;}
function button(action,label,cls='primary'){return `<button class="${cls}" data-action="${action}">${label}</button>`;}
const letterContent=`<div class="letter-paper"><span class="letter-date">Vespera, 17 novembre 1912</span><p>Nora,</p><p>se leggi queste righe, il faro si è già spento. Non cercarmi sulla costa. Ho seguito una voce sotto l’osservatorio.</p><p>Ho separato la chiave in due pezzi. Cercali tra gli oggetti sullo scrittoio.</p><p>La lente è al sicuro. Ricorda la filastrocca di quando eravamo bambini:</p><blockquote>Tre onde contro la scogliera.<br>Una luna sulla marea.<br>Quattro lampi per tornare a casa.</blockquote><p>Fa’ respirare la luce, poi chiedi al cielo di aprirti il mare.</p><p class="signature">Tuo fratello, Elia</p></div>`;
function safeVisual(){return `<div class="lock-face"><div class="lock-ornament">≋ &nbsp; ☾ &nbsp; ♜</div><div class="dials">${['Onde','Lune','Lampi'].map((label,i)=>`<div class="dial"><button data-dial="safeDials" data-index="${i}" data-delta="1" aria-label="Aumenta ${label.toLowerCase()}" ${!state.keyUsed||state.safe?'disabled':''}>⌃</button><span>${state.safeDials[i]}</span><button data-dial="safeDials" data-index="${i}" data-delta="-1" aria-label="Diminuisci ${label.toLowerCase()}" ${!state.keyUsed||state.safe?'disabled':''}>⌄</button><small>${label}</small></div>`).join('')}</div><div class="keyhole">${state.keyUsed?'◇':'⚿'}</div></div>`;}
function prismVisual(){
  const labels=['Nord','Est','Sud','Ovest'];
  return `<div class="prism-device ${state.lensOn?'spectral':''}"><svg viewBox="0 0 360 160" aria-hidden="true"><defs><filter id="glow"><feGaussianBlur stdDeviation="3"/></filter></defs><path class="beam dim" d="M10 80 H350"/><path class="beam" d="M10 80 H${state.mirrors[0]===3?state.mirrors[1]===1?state.mirrors[2]===2?350:280:180:80}"/><circle cx="12" cy="80" r="7" class="beam-source"/>${[80,180,280].map((x,i)=>`<g transform="translate(${x},80)"><circle r="32"/><circle r="25"/><path d="M-18 18L18-18" class="mirror" transform="rotate(${state.mirrors[i]*90})"/></g>`).join('')}<path d="m342 70 12 10-12 10Z" class="beam-source"/></svg><div class="prism-controls">${state.mirrors.map((v,i)=>`<button class="prism-dial" data-dial="mirrors" data-index="${i}" data-delta="1" aria-label="Ruota prisma ${i+1}" ${!state.safe||state.projection?'disabled':''}><span class="arrow" style="transform:rotate(${v*90}deg)">↑</span><b>${labels[v]}</b><small>Prisma ${['I','II','III'][i]} ↻</small></button>`).join('')}</div></div>`;
}
function orbitVisual(){
  const radii=[135,99,62];
  return `<div class="orbit-device"><svg viewBox="0 0 320 320" role="img" aria-label="Tre anelli con i simboli selezionati allineati al riferimento in alto"><defs><radialGradient id="orbit-glow"><stop stop-color="#336c72"/><stop offset="1" stop-color="#102b35"/></radialGradient></defs><circle cx="160" cy="160" r="152" fill="url(#orbit-glow)"/><path d="M160 6v304M6 160h308M52 52l216 216M52 268 268 52" class="orbit-grid"/>${radii.map((r,i)=>`<circle cx="160" cy="160" r="${r}" class="orbit-ring"/><circle cx="160" cy="160" r="${r+16}" class="orbit-track"/>${SYMBOLS.map((s,j)=>{const a=(j-state.rings[i])*Math.PI/3-Math.PI/2;return `<text x="${160+Math.cos(a)*r}" y="${167+Math.sin(a)*r}" class="orbit-symbol ${j===state.rings[i]?'selected':''}">${s.glyph}</text>`;}).join('')}`).join('')}<circle cx="160" cy="160" r="28" class="orbit-core"/><path d="m160 139 6 21-6 21-6-21Z" class="orbit-needle"/><path d="m154 3 6 11 6-11Z" class="orbit-needle"/></svg></div><div class="orbit-controls">${['Esterno','Mediano','Interno'].map((label,i)=>`<button data-dial="rings" data-index="${i}" data-delta="1" aria-label="Ruota anello ${label.toLowerCase()}" ${!state.projection||state.astrolabe?'disabled':''}><small>${label}</small><span>${SYMBOLS[state.rings[i]].glyph}</span><b>${SYMBOLS[state.rings[i]].name} ↻</b></button>`).join('')}</div>`;
}
function chart(){return `<div class="star-chart"><span class="chart-star">✧</span><h3>La rotta di Vespera</h3><div><p><span>♜</span><b>Faro</b><small>Anello esterno</small></p><p><span>≋</span><b>Onda</b><small>Anello mediano</small></p><p><span>☾</span><b>Luna</b><small>Anello interno</small></p></div><p>Tre orbite. Un solo punto d’incontro.<br>Allinea i simboli al riferimento in alto.</p></div>`;}
function renderPanel(){
  itemViewer?.dispose();itemViewer=null;
  const active=document.activeElement;
  const transcriptOpen=$('.transcript')?.open;
  const focusSelector=active?.dataset.combinePart?`[data-combine-part="${active.dataset.combinePart}"]`:active?.dataset.extra?`[data-extra="${active.dataset.extra}"][data-value="${active.dataset.value}"]`:active?.dataset.dial?`[data-dial="${active.dataset.dial}"][data-index="${active.dataset.index}"][data-delta="${active.dataset.delta}"]`:active?.dataset.pipe!==undefined?`[data-pipe="${active.dataset.pipe}"]`:active?.dataset.note!==undefined?`[data-note="${active.dataset.note}"]`:active?.dataset.pourFrom!==undefined?`[data-pour-from="${active.dataset.pourFrom}"][data-pour-to="${active.dataset.pourTo}"]`:active?.dataset.action?`[data-action="${active.dataset.action}"]`:null;
  let html='';
  if(modal==='intro')html=heading('Il tuo arrivo','Il faro ha smesso<br>di respirare.')+`<p class="story-text">Sei <strong>Nora Valenti</strong>, restauratrice di strumenti nautici. Tuo fratello Elia ti ha chiamata sull’isola con un telegramma di quattro parole: <em>«La marea ricorda tutto.»</em></p><p class="story-text">Ora l’osservatorio è deserto. Un ticchettio arriva dalla macchina al centro della sala. Sullo scrittoio, una lettera porta il tuo nome.</p><div class="control-guide"><p><b>Esplora</b> Tocca gli oggetti nella stanza. La mappa li raccoglie tutti.</p><p><b>Cerca</b> «Cerca oggetti» apre una scena con sei tracce da trovare. Apri anche gli astucci.</p><p><b>Ricomponi</b> Combina i pezzi nell’inventario, ruota l’utensile per esaminarlo e scegli «Usa nella stanza».</p></div>`+button('close','Cerca la lettera');
  if(modal==='letter')html=heading('Lo scrittoio','Una voce familiare')+letterContent+(state.letter?`<p class="solved-note">✓ Lettera trascritta nel taccuino</p>`:button('take-letter','Conserva la lettera'));
  if(modal==='safe')html=heading('Enigma I · Il cofanetto','La memoria del mare','Tre quadranti, una piccola serratura. Onde, lune e lampi: un ricordo condiviso protegge il contenuto.')+safeVisual()+(state.safe?`<div class="reward"><span>◉</span><div><h3>La lente di marea</h3><p>Un vetro azzurro che rivela l’inchiostro nascosto. Ora è nel tuo inventario.</p></div></div>`:!state.keyUsed?button('insert-key',state.letter?'Inserisci la chiave di rame':'Esamina la serratura'):button('solve-safe','Apri il cofanetto'))+button('read-letter','Rileggi la lettera','text-button');
  if(modal==='projector')html=heading('Enigma II · Il lanternario','La rotta della luce','Tre prismi orientano una luce che il tempo ha spento.')+prismVisual()+(state.projection?chart():!state.safe?`<p class="device-note">La targhetta sembra vuota. Qualcosa può renderne visibile l’incisione.</p>`:state.lensOn?`<div class="spectral-message"><small>Incisione rivelata dalla lente</small><p>«Il primo guarda il <b>tramonto</b>.<br>Il secondo saluta l’<b>alba</b>.<br>Il terzo cerca il <b>fondale</b>.»</p></div>`:`<p class="device-note">Sul rame affiorano tracce d’inchiostro. Prova a guardare attraverso la lente.</p>`)+(state.safe&&!state.projection?button('toggle-lens',state.lensOn?'Riponi la lente':'Guarda attraverso la lente','secondary')+button('solve-projector','Accendi il lanternario'):'');
  if(modal==='astrolabe')html=heading('Enigma III · La macchina','Un cielo da ricomporre','Ruota le tre orbite. Il triangolo in alto segna il punto di allineamento.')+orbitVisual()+(state.astrolabe?`<div class="reward"><span>❖</span><div><h3>Il sigillo delle maree</h3><p>Dal nucleo emerge un sigillo di vetro e rame. È la chiave dell’archivio.</p></div></div>`:state.projection?button('solve-astrolabe','Allinea le orbite')+button('chart','Consulta la carta celeste','text-button'):`<p class="device-note">La macchina è priva di una rotta. Il lanternario potrebbe proiettare la carta mancante.</p>`);
  if(modal==='door')html=heading('La soglia','Ciò che il mare custodisce')+`<div class="door-medallion ${state.astrolabe?'ready':''}">${compass}<span>${state.door?'✧':state.astrolabe?'❖':'◇'}</span></div><p class="story-text">${state.door?'La porta è aperta. Dalle profondità arriva il suono di una voce.':'Dietro la porta senti il mare, anche se questa stanza si trova trenta metri sopra la scogliera. Al centro, un incavo attende il suo sigillo.'}</p>`+button(state.door?'ending':'open-door',state.door?'Rileggi il finale':state.astrolabe?'Inserisci il sigillo e apri la porta':'Esamina l’incavo');
  if(modal==='journal')html=heading('Taccuino di Nora','Tracce nella luce')+`<p class="journal-objective">${objective(state)}</p><div class="journal-entries"><article><span>17 novembre · Il ritorno</span><p>Elia è scomparso. Il faro è spento e le barche non possono rientrare. Devo riattivare la macchina e scoprire dove conduce il passaggio.</p></article>${state.letter?`<article><span>La filastrocca di Elia</span><p>Tre onde. Una luna. Quattro lampi.<br>Il cofanetto ha gli stessi simboli, nello stesso ordine.</p></article>`:''}${state.safe?`<article><span>La lente di marea</span><p>Il vetro azzurro rivela le incisioni sul lanternario. Posso usarlo premendo L.</p></article>`:''}${state.projection?`<article><span>Il messaggio nascosto</span><p>«Non ho inventato questa macchina. L’ho trovata sotto il mare. Qualcuno ci aspettava.» — Elia</p></article>${chart()}`:''}${state.astrolabe?`<article><span>Un battito sotto la pietra</span><p>La macchina ha restituito il sigillo. La porta sul fondo ha un incavo della stessa forma.</p></article>`:''}</div>`;
  if(modal==='chart')html=heading('Il lanternario ha rivelato','La carta celeste')+chart()+button('back-machine','Torna alla macchina','secondary');
  if(modal==='hint'){const hints=hintsFor(state);html=heading('Un piccolo aiuto','Segui la corrente')+`<p class="hint-text">${hints[Math.min(hintIndex,hints.length-1)]}</p><p class="panel-description">Suggerimento ${Math.min(hintIndex+1,hints.length)} di ${hints.length}. Prenditi il tempo di osservare.</p>`+(hintIndex<hints.length-1?button('more-hint','Un indizio più preciso','secondary'):'')+button('close','Torna a esplorare','text-button');}
  if(modal?.startsWith('item:')){const item=inventory(state).find(i=>i.id===modal.slice(5));if(item)html=heading('Nel tuo inventario',item.name)+`<div class="item-large">${item.glyph}</div><p class="story-text">${item.description}</p>`+(item.id==='chart'?chart():item.id==='lens'?button('toggle-lens',state.lensOn?'Riponi la lente':'Attiva la lente'):item.id==='key'?button('go-safe','Esamina il cofanetto'):item.id==='seal'?button('go-door','Esamina la porta'):'');}
  if(modal==='install')html=heading('Gioca su iPhone','Porta le maree con te')+`<p class="story-text">Apri questo indirizzo in <strong>Safari</strong>. Tocca <strong>Condividi</strong>, poi <strong>Aggiungi alla schermata Home</strong>. Se compare l’opzione, attiva <strong>Apri come app web</strong>.</p><p class="story-text">Avvia il gioco dall’icona <em>Le Maree</em> e tieni l’iPhone in verticale. I comandi rispettano lo spazio della fotocamera e della barra Home.</p><p class="offline-status" id="offline-message">${offlineMessage()}</p>`+button('close','Torna al gioco');
  if(modal==='menu')html=heading('L’Archivio delle Maree','Il tuo viaggio')+`<p class="panel-description">Capitolo ${CHAPTERS[chapter].roman} · ${CHAPTERS[chapter].title}</p><div class="menu-progress">${progress(state)}<span>/ 9 scoperte</span></div><p class="story-text">Ogni capitolo conserva i propri progressi.</p><div class="settings"><label for="volume-range">Volume <span>${Math.round(campaign.settings.volume*100)}%</span></label><input id="volume-range" type="range" min="0" max="100" value="${Math.round(campaign.settings.volume*100)}"/><label for="quality-select">Qualità grafica</label><select id="quality-select"><option value="high" ${campaign.settings.quality==='high'?'selected':''}>Completa · atmosfera e particelle</option><option value="low" ${campaign.settings.quality==='low'?'selected':''}>Leggera · senza effetti decorativi</option></select><label class="motion-toggle"><input type="checkbox" id="reduce-motion" ${campaign.settings.reduceMotion?'checked':''}/>Riduci i movimenti decorativi</label></div><div class="control-guide"><p><kbd>Esc</kbd> Chiudi il dettaglio</p><p><kbd>T</kbd> Taccuino <kbd>L</kbd> Lente</p><p><kbd>Tab</kbd> Naviga con la tastiera</p></div>`+`<div class="phone-guide"><p><strong>Verticale · nitidezza Retina</strong><br>Interfaccia e oggetti 3D seguono la densità dello schermo, fino al limite di un fotogramma 4K. I fondali originali sono da 1672 × 941 pixel.</p><p class="offline-status" id="offline-message">${offlineMessage()}</p></div>`+button('install','Gioca dalla schermata Home','secondary')+button('close',playing?'Riprendi l’esplorazione':'Torna al titolo')+button('chapters','Scegli un capitolo','secondary')+button('restart-confirm','Ricomincia questo capitolo','text-button');
  if(modal==='chapters')html=heading('Due luoghi, una storia','Scegli il tuo capitolo')+`<p class="panel-description">Puoi continuare dall’osservatorio o entrare direttamente nell’archivio. I progressi restano separati.</p><div class="chapter-cards">${[1,2].map(n=>`<button data-chapter="${n}" class="chapter-card ${n===2?'submerged':''}"><span class="chapter-card-number">${CHAPTERS[n].roman}</span><div><small>${n===1?'L’osservatorio':'L’Archivio Sommerso'}</small><h3>${CHAPTERS[n].title}</h3><p>${n===1?'Accendi la luce. Apri il passaggio.':'Segui le voci. Ritrova Elia.'}</p><b>${progress(campaign.chapters[n])} / 9 scoperte · ${campaign.chapters[n].started?'Riprendi':'Inizia'}</b></div><span class="chapter-card-arrow">↗</span></button>`).join('')}</div>`;
  if(modal==='restart')html=heading('Un nuovo viaggio','Ricominciare dall’inizio?')+`<p class="story-text">I progressi di questo capitolo verranno azzerati. Potrai risolvere di nuovo tutti gli enigmi.</p>`+button('restart','Sì, ricomincia')+button('menu','Conserva i progressi','text-button');
  if(modal==='ending')html=`<div class="ending-emblem">${compass}</div>`+heading('Capitolo I · Completato','Il mare ha<br>una memoria.')+`<p class="story-text">Il sigillo ruota. L’ascensore scende nella scogliera, seguendo la marea calcolata nelle effemeridi. In alto, il faro torna a illuminare la baia.</p><p class="story-text">Poi una voce sale dal fondo. È quella di Elia, registrata su un cilindro di vetro.</p><blockquote class="ending-quote">«Nora, se hai riacceso la luce, ora anche loro sanno che sei qui.»</blockquote><p class="end-tease">Oltre la soglia, migliaia di nomi si accendono nell’acqua.<br>Uno è il tuo.</p><div class="chapter-complete"><span>9 / 9 scoperte</span><span>${state.hints} indizi consultati</span></div>`+button('next-chapter','Scendi nell’Archivio Sommerso')+button('close','Resta nell’osservatorio','secondary');
  if(chapter===2){const archiveHtml=renderArchivePanel(modal,state,{heading,button});if(archiveHtml!==null)html=archiveHtml;}
  if(modal==='map')html=heading('Esplorazione','I luoghi di Nora','Scegli un oggetto o torna alla stanza. I segni di spunta indicano le scoperte completate.')+`<div class="map-rooms">${SCENES[chapter].map((scene,r)=>`<section><img src="${scene.image}" alt="${scene.name}"/><h3>${scene.name}</h3>${r===1&&!canEnter(chapter,state)?'<p>La porta è ancora chiusa.</p>':''}<div class="map-objects">${LOCATIONS.filter(l=>locationRoom(chapter,l.id)===r).map(l=>`<button data-location="${l.id}" ${r===1&&!canEnter(chapter,state)?'disabled':''}><span>${l.name}</span><b>${state[l.id]||state.extension[l.id]?'✓':'›'}</b></button>`).join('')}</div></section>`).join('')}</div>`;
  const extended=renderExpansionPanel(modal,state,chapter,{heading,button});if(extended!==null)html=extended;
  if(modal==='journal'){html+=`<div class="journal-entries">${chapter===1?(state.extension.diary?'<article><span>Le istruzioni di Ada</span><p>Due motori da 12 denti, riduzione totale 6:1. La costellazione: Faro, Vela, Rondine, Conchiglia.</p></article>':'')+(state.extension.telescope?'<article><span>Le effemeridi</span><p>Ore 18: quattro tacche. Ore 20: tre. Il livello scende di una tacca ogni due ore.</p></article>':''):(state.extension.catalog?'<article><span>Il permesso della custode</span><p>Pressioni necessarie: 2 · 3 · 1. Le valvole alimentano due manometri alla volta.</p></article>':'')+(state.extension.strips?'<article><span>La voce intera</span><p>«Nora, cerca il mio nome dove nostra madre lasciò la luce, e il faro risponderà prima della prossima marea.»</p></article>':'')}</div>`;}
  if(modal==='combine')html=renderCombine();
  if(modal?.startsWith('item:')){const item=inventory(state).find(i=>i.id===modal.slice(5));if(item?.component||item?.tool||item?.kind){html=heading(item.component?'Un pezzo da ricomporre':'Il tuo equipaggiamento',item.name)+(['key','handle','valve','cylinder','compass'].includes(item.kind)?'<div id="item-turntable"></div>':`<div class="item-illustration">${objectArt(item.kind,'large-item')}</div>`)+`<p class="story-text">${item.description}</p>`+(item.component?button('combine','Combina con un altro pezzo'):item.tool?`<button class="primary" data-select-tool="${item.id}">Usa nella stanza</button>`:'');}}
  if(modal==='journal'){const evidence=HUNTS.filter(h=>h.chapter===chapter).flatMap(h=>h.items).filter(i=>!i.component&&state.investigation.found.includes(i.id));html+=`<div class="search-summary"><h3>Le prove raccolte</h3><p>${state.investigation.found.length} oggetti trovati nei due ambienti.</p>${evidence.map(i=>`<article class="evidence-card">${objectArt(i.kind,`proof-${i.id}`)}<div><h3>${i.name}</h3><p>${i.description}</p></div></article>`).join('')}</div>`;}
  html=html.replaceAll('5 / 5 scoperte','9 / 9 scoperte');

  const template=document.createElement('template');template.innerHTML=html;
  if(modal==='map'){for(const [r,section] of [...template.content.querySelectorAll('.map-rooms section')].entries()){const hunt=huntFor(chapter,r);const div=document.createElement('div');div.innerHTML=`<button class="map-search-button" data-start-search="${hunt.id}" ${r===1&&!canEnter(chapter,state)?'disabled':''}><span>⌕ ${hunt.title}</span><b>${hunt.items.filter(i=>state.investigation.found.includes(i.id)).length}/6</b></button>`;section.appendChild(div.firstElementChild);}}
  const tool=Object.values(TOOL_DEFS).find(t=>t.target===modal&&HUNTS.find(h=>h.id===t.hunt).chapter===chapter);
  if(tool&&!state.investigation.used.includes(tool.id)){
    const hunt=HUNTS.find(h=>h.id===tool.hunt),crafted=state.investigation.crafted.includes(tool.id);
    for(const b of template.content.querySelectorAll('button[data-dial="safeDials"],button[data-extra="gear"],button[data-extra="fragment"],button[data-pour-from],button[data-action="insert-key"],button[data-action="solve-safe"],button[data-action="x-gears"],button[data-action="x-strips"],button[data-action="c2-pumps"],button[data-action="c2-reset-water"]'))b.disabled=true;
    const gate=document.createElement('div');gate.className='tool-gate';gate.innerHTML=`<h3>Manca un pezzo del meccanismo</h3><p>${crafted?'L’utensile è pronto. Puoi montarlo qui.':huntComplete(state,hunt.id)?'Hai trovato tutti gli oggetti. Unisci i due componenti nel tuo inventario.':`Esamina la stanza e cerca i sei oggetti: ${hunt.title.toLowerCase()}.`}</p>${crafted?`<button class="primary" data-use-tool="${tool.id}" data-tool-target="${tool.target}">Usa ${tool.name.toLowerCase()}</button>`:huntComplete(state,hunt.id)?button('combine','Combina i pezzi'):`<button class="primary" data-start-search="${hunt.id}">Cerca gli oggetti nella stanza</button>`}`;template.content.appendChild(gate);
  }
  const physical=[...template.content.children].filter(el=>el.matches('.lock-face,.prism-device,.orbit-device,.orbit-controls,.water-puzzle,.echo-device,.echo-console,.echo-keys,.pipe-board,.gear-machine,.star-scope,.tide-board,.pressure-machine,.airlock-machine,.record-slots,.record-grid,.spool-sequence,.strip-pieces'));
  const hasPhysical=physical.length>0;
  $('.inspection-panel').classList.toggle('mechanism-open',hasPhysical);$('.inspection-panel').classList.toggle('map-open',modal==='map');
  html=template.innerHTML;
  if(hasPhysical){const art=physical.map(el=>{const out=el.outerHTML;el.remove();return out;}).join('');html=`<div class="inspection-device">${art}</div><div class="inspection-copy">${template.innerHTML}</div>`;}
  $('#panel-content').innerHTML=html;
  const turntable=$('#item-turntable');if(turntable){const item=inventory(state).find(i=>i.id===modal.slice(5));itemViewer=createItemViewer(turntable,{kind:item.kind,reduceMotion:campaign.settings.reduceMotion});}

  if(transcriptOpen&&$('.transcript'))$('.transcript').open=true;
  $('.inspection-panel').classList.toggle('ending-panel',modal==='ending');
  if(focusSelector){const next=$(`#panel-content ${focusSelector}`);if(next&&!next.disabled)next.focus();else $('#close-panel').focus();}
}


function updateSelectedTool(){const tool=selectedTool&&TOOL_DEFS[selectedTool];$('#selected-tool').hidden=!tool;$('#experience').classList.toggle('tool-chosen',!!tool);if(tool)$('#selected-tool').innerHTML=`${objectArt(tool.kind,'selected-tool')}<span>${tool.name}: tocca un oggetto nella stanza.</span><button data-action="cancel-tool" aria-label="Riponi l’oggetto">×</button>`;}
function openSearch(id){const hunt=HUNTS.find(h=>h.id===id&&h.chapter===chapter);if(!hunt)return;if(hunt.room!==state.extension.room){if(!dispatch('x-room',hunt.room).success)return;}closePanel();selectedTool=null;updateSelectedTool();searchId=id;$('#search-layer').hidden=false;setBackgroundInert(true);world?.setInteractive(false);searchView?.dispose();searchView=createSearchScene($('#search-layer'),{hunt,image:SCENES[chapter][hunt.room].image,state,onAction:dispatch,onClose:closeSearch,onCombine:()=>{closeSearch();combineSelection=[];openPanel('combine');},onHint:()=>dispatch('hint'),reduceMotion:campaign.settings.reduceMotion});}
function closeSearch(){if(!searchId)return;searchView?.dispose();searchView=null;searchId=null;$('#search-layer').hidden=true;setBackgroundInert(false);world?.setInteractive(playing);world?.overview();if(playing)$('#search').focus();}
function renderCombine(){const pieces=inventory(state).filter(i=>i.component);combineSelection=combineSelection.filter(id=>pieces.some(p=>p.id===id));return heading('Il banco di Nora','Due pezzi, una funzione','Scegli due componenti che possono combaciare. Gli abbinamenti sbagliati lasciano intatti gli oggetti.')+`<div class="combine-slots">${[0,1].map(index=>{const piece=pieces.find(i=>i.id===combineSelection[index]);return `<div class="combine-slot">${piece?objectArt(piece.kind,`slot-${index}`):'<span>?</span>'}<span>${piece?piece.name:'Scegli un pezzo'}</span></div>`;}).join('')}</div><div class="combine-pieces">${pieces.map(i=>`<button class="${combineSelection.includes(i.id)?'selected':''}" data-combine-part="${i.id}" aria-pressed="${combineSelection.includes(i.id)}">${objectArt(i.kind,`part-${i.id}`)}<span>${i.name}</span></button>`).join('')}</div>${pieces.length?`<button class="primary" data-action="combine-confirm" ${combineSelection.length!==2?'disabled':''}>Combina i due pezzi</button>`:'<p class="device-note">Non hai componenti da combinare. Cercali nella stanza.</p>'}`;}

$('#start').onclick=begin;
$('#menu').onclick=$('#brand').onclick=()=>openPanel('menu');
$('#sound').onclick=()=>{const enabled=audio.toggle();$('#sound').textContent=enabled?icon.sound:icon.muted;$('#sound').setAttribute('aria-label',enabled?'Disattiva audio':'Attiva audio');$('#sound').title=enabled?'Disattiva audio':'Attiva audio';$('#sound').classList.toggle('active',enabled);};
$('#search').onclick=()=>openSearch(huntFor(chapter,state.extension.room).id);
$('#map').onclick=()=>openPanel('map');
$('#reveal').onclick=()=>{const on=$('#experience').classList.toggle('show-hotspots');$('#reveal').setAttribute('aria-pressed',String(on));};
$('#room-travel').onclick=()=>{const result=dispatch('x-room',state.extension.room===0?1:0);if(result.success){selected=null;world?.overview();notify(SCENES[chapter][state.extension.room].name);}};
$('#journal').onclick=()=>openPanel('journal');
$('#hint').onclick=()=>{if(lastHintStage!==progress(state)){hintIndex=0;lastHintStage=progress(state);}dispatch('hint');openPanel('hint');};
$('#lens').onclick=()=>dispatch('lens');
$('#close-panel').onclick=closePanel;
$('#overview').onclick=()=>{closePanel();selected=null;world?.overview();$('#location-name').textContent=SCENES[chapter][state.extension.room].name;};
document.addEventListener('click',e=>{
  if(e.target.closest('#search-layer'))return;
  const search=e.target.closest('[data-start-search]');if(search&&!search.disabled){openSearch(search.dataset.startSearch);return;}
  const choose=e.target.closest('[data-select-tool]');if(choose){selectedTool=choose.dataset.selectTool;closePanel();update();notify('Tocca il meccanismo su cui vuoi usare questo oggetto.');return;}
  const use=e.target.closest('[data-use-tool]');if(use){dispatch('i-use',{item:use.dataset.useTool,target:use.dataset.toolTarget});return;}
  const part=e.target.closest('[data-combine-part]');if(part){const id=part.dataset.combinePart;combineSelection=combineSelection.includes(id)?combineSelection.filter(x=>x!==id):[...combineSelection.slice(-1),id];renderPanel();return;}

  const extra=e.target.closest('[data-extra]');if(extra&&!extra.disabled){dispatch(`x-${extra.dataset.extra}`,Number(extra.dataset.value));return;}
  const chapterButton=e.target.closest('button[data-chapter]');if(chapterButton){switchChapter(Number(chapterButton.dataset.chapter));return;}
  const pour=e.target.closest('[data-pour-from]');if(pour&&!pour.disabled){dispatch('pour',{from:Number(pour.dataset.pourFrom),to:Number(pour.dataset.pourTo)});return;}
  const pipe=e.target.closest('[data-pipe]');if(pipe&&!pipe.disabled){dispatch('pipe',Number(pipe.dataset.pipe));return;}
  const note=e.target.closest('[data-note]');if(note&&!note.disabled){dispatch('note',Number(note.dataset.note));return;}
  const choice=e.target.closest('[data-choice]');if(choice){if(dispatch('heart',choice.dataset.choice).success)openPanel('ending');return;}

  const location=e.target.closest('[data-location]');if(location){selectLocation(location.dataset.location);return;}
  const item=e.target.closest('[data-item]');if(item){openPanel(`item:${item.dataset.item}`);return;}
  const dial=e.target.closest('[data-dial]');if(dial&&!dial.disabled){dispatch('dial',{group:dial.dataset.dial,index:Number(dial.dataset.index),delta:Number(dial.dataset.delta)});return;}
  const action=e.target.closest('[data-action]')?.dataset.action;
  if(!action)return;
  if(action.startsWith('x-')){dispatch(action);return;}
  switch(action){
    case 'close':closePanel();break;
    case 'take-letter':dispatch('letter');break;
    case 'insert-key':dispatch('i-use',{item:'key',target:'safe'});break;
    case 'combine':combineSelection=[];openPanel('combine');break;
    case 'combine-confirm':{const parts=[...combineSelection],tool=Object.values(TOOL_DEFS).find(t=>t.parts.includes(parts[0]));const r=dispatch('i-combine',{first:parts[0],second:parts[1]});if(r.success&&tool){combineSelection=[];openPanel(`item:${tool.id}`);}break;}
    case 'cancel-tool':selectedTool=null;updateSelectedTool();break;
    case 'solve-safe':dispatch('safe');break;
    case 'read-letter':openPanel('letter');break;
    case 'toggle-lens':dispatch('lens');break;
    case 'solve-projector':dispatch('projection');break;
    case 'solve-astrolabe':dispatch('astrolabe');break;
    case 'chart':openPanel('chart');break;
    case 'back-machine':selectLocation('astrolabe');break;
    case 'go-safe':selectLocation('safe');break;
    case 'go-door':selectLocation('door');break;
    case 'open-door':if(dispatch('door').success)openPanel('ending');break;
    case 'ending':openPanel('ending');break;
    case 'more-hint':hintIndex++;dispatch('hint');break;
    case 'menu':openPanel('menu');break;
    case 'chapters':openPanel('chapters');break;
    case 'next-chapter':switchChapter(2);break;
    case 'c2-register':dispatch('register');break;
    case 'c2-secret':dispatch('secret');break;
    case 'c2-pumps':dispatch('pumps');break;
    case 'c2-reset-water':dispatch('reset-water');break;
    case 'c2-listen':playMemory();break;
    case 'c2-reset-notes':dispatch('reset-notes');break;
    case 'c2-conduits':dispatch('conduits');break;
    case 'c2-heart-locked':dispatch('heart');break;
    case 'install':openPanel('install');break;
    case 'restart-confirm':openPanel('restart');break;
    case 'restart':selectedTool=null;combineSelection=[];state=chapterAPI(chapter).newGame();hintIndex=0;lastHintStage=-1;selected=null;world?.overview();closePanel();update();begin();break;
  }
});
document.addEventListener('keydown',e=>{
  if(searchId){if(e.key==='Escape'){e.preventDefault();closeSearch();return;}if(e.key==='Tab'){const buttons=[...$('#search-layer').querySelectorAll('button:not(:disabled):not([hidden])')].filter(b=>b.offsetParent!==null);if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0]?.focus();}}return;}
  if(e.key==='Escape'){closePanel();return;}
  if(modal&&e.key==='Tab'){
    const buttons=[...$('.inspection-panel').querySelectorAll('button:not(:disabled),input,select,summary,[tabindex="0"]')];
    if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1)?.focus();}
    else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0]?.focus();}
  }
  if(!playing||e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.target.matches('input,select'))return;
  if(e.key.toLowerCase()==='l'&&(chapter===2||state.safe)){e.preventDefault();dispatch('lens');}
  if(e.key.toLowerCase()==='t'){e.preventDefault();modal==='journal'?closePanel():openPanel('journal');}
});
document.addEventListener('input',e=>{if(e.target.id==='volume-range'){campaign.settings.volume=Number(e.target.value)/100;audio.setVolume(campaign.settings.volume);$('label[for="volume-range"] span').textContent=`${e.target.value}%`;save();}});
document.addEventListener('change',e=>{if(e.target.id==='quality-select'){campaign.settings.quality=e.target.value;world?.setQuality?.(e.target.value);save();}if(e.target.id==='reduce-motion'){campaign.settings.reduceMotion=e.target.checked;world?.setMotion?.(e.target.checked);$('#experience').classList.toggle('motion-reduced',e.target.checked);save();}});
if(!document.fullscreenEnabled){$('#fullscreen').setAttribute('aria-label','Gioca dalla schermata Home');$('#fullscreen').title='Gioca dalla schermata Home';}
$('#fullscreen').onclick=async()=>{if(!document.fullscreenEnabled){openPanel('install');return;}try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#experience').requestFullscreen();}catch{notify('Lo schermo intero non è disponibile in questa finestra.');}};
refreshChapterChrome();mountWorld();
setupOffline(()=>{const status=$('#offline-message');if(status)status.textContent=offlineMessage();});
let frame=0,lastMarkerUpdate=0;
function markers(now){frame=requestAnimationFrame(markers);if(!world||!playing||modal||document.hidden||now-lastMarkerUpdate<65)return;lastMarkerUpdate=now;const spots=world.getHotspots?.()??[];document.querySelectorAll('.marker').forEach(el=>el.hidden=true);for(const spot of spots){const el=$(`.marker[data-location="${spot.id}"]`);if(!el)continue;el.style.left=`${spot.x*100}%`;el.style.top=`${spot.y*100}%`;el.hidden=!spot.visible;}}
frame=requestAnimationFrame(markers);
window.addEventListener('pagehide',e=>{if(!e.persisted){cancelAnimationFrame(frame);cancelPlayback();searchView?.dispose();itemViewer?.dispose();world?.dispose();audio.dispose();} });
window.addEventListener('hashchange',()=>{const requested=location.hash==='#capitolo-2'?2:location.hash==='#capitolo-1'?1:null;if(requested&&requested!==chapter)switchChapter(requested,false);});
window.__MAREE_DIAGNOSTICS__=()=>({chapter,progress:progress(state),playing,modal,search:searchId,found:state.investigation.found.length,world:world?.getDiagnostics?.()??null});
