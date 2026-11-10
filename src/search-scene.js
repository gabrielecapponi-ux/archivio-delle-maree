import {uiIcon} from './ui-icons.js';
import {objectArt} from './object-art.js';
import {huntComplete,TOOL_DEFS} from './investigation.js';
import './search.css';
const caseArt=`<svg viewBox="0 0 150 90" aria-hidden="true"><path d="M7 14 126 6 145 30 145 73 24 85 7 63Z" fill="#4d3524" stroke="#a98b58" stroke-width="2"/><path d="m8 15 17 26 119-11M25 42v41" fill="none" stroke="#c8a66b" stroke-width="2"/><path d="m18 17 104-6M23 25l106-9M28 32l105-10M31 53l104-11M31 63l105-10" stroke="#b7955b" opacity=".23"/><path d="m76 41 14-1v17l-14 2Z" fill="#b59b62" stroke="#524629"/><circle cx="83" cy="48" r="2" fill="#252c26"/></svg>`;
export function createSearchScene(root,{hunt,image,imageWidth=1672,imageHeight=941,state,onAction,onClose,onCombine,onDeduce,onHint,reduceMotion=false}){
  let current=state,zoom=1,drag=null,disposed=false,signalTimer;
  root.innerHTML=`<section class="search-shell" role="dialog" aria-modal="true" aria-labelledby="search-title"><header class="search-heading"><button class="search-back" aria-label="Chiudi la ricerca e torna alla stanza">${uiIcon('back')} <span>La stanza</span></button><div><small>Ricerca di oggetti</small><h2 id="search-title">${hunt.title}</h2></div><div class="search-tools"><button class="search-zoom" aria-label="Ingrandisci la scena">${uiIcon('plus')}</button><button class="search-hint" aria-label="Mostra un indizio nella scena">${uiIcon('hint')}</button></div></header><div class="search-viewport" style="--search-background:url('${image}')"><div class="search-stage"><img src="${image}" alt="${hunt.title}: osserva gli oggetti sui mobili e tra gli strumenti" draggable="false"/><div class="search-case" style="left:${hunt.cover.x*100}%;top:${hunt.cover.y*100}%;width:${hunt.cover.w*100}%"><div class="case-interior"></div><button class="case-lid" data-search-cover="${hunt.cover.id}" aria-label="${hunt.cover.name}">${caseArt}</button></div>${hunt.items.map((item,i)=>`<button class="hidden-object" data-search-item="${item.id}" aria-label="Raccogli ${item.name.toLowerCase()}" style="left:${item.x*100}%;top:${item.y*100}%;width:${item.w*100}%;--item-rotation:${item.rotation??0}deg">${objectArt(item.kind,`hunt-${hunt.id}-${i}`)}</button>`).join('')}</div></div><footer class="search-footer"><div class="search-status"><p class="nora-observation" role="status" aria-live="polite">Nora: «Ogni traccia può dirmi dove è passato Elia.»</p><span class="search-counter"></span></div><div class="search-checklist" aria-label="Oggetti da trovare">${hunt.items.map(item=>`<span data-search-check="${item.id}">${objectArt(item.kind,`list-${item.id}`)}<b>${item.name}</b><i aria-hidden="true"></i></span>`).join('')}</div><div class="search-result" hidden><p></p><button class="primary search-assemble">Ricomponi l’oggetto</button><button class="text-button search-deduce">Collega le prove nel taccuino ${uiIcon('arrow')}</button></div><p class="search-instruction">Trova gli oggetti nell’immagine. Apri anche l’astuccio. Trascina la scena per esplorarla.</p></footer></section>`;
  const viewport=root.querySelector('.search-viewport'),stage=root.querySelector('.search-stage'),speech=root.querySelector('.nora-observation');
  const itemButtons=[...root.querySelectorAll('[data-search-item]')],cover=root.querySelector('[data-search-cover]');
  function fit(){const ratio=imageWidth/imageHeight,base=Math.max(ratio<1?620:960,viewport.clientWidth,viewport.clientHeight*ratio);stage.style.width=`${base*zoom}px`;stage.style.height=`${base*zoom/ratio}px`;}
  function update(s){
    current=s;const found=s.investigation.found,opened=s.investigation.opened.includes(hunt.cover.id);
    cover.hidden=opened;root.querySelector('.search-case').classList.toggle('opened',opened);
    itemButtons.forEach(b=>{const item=hunt.items.find(i=>i.id===b.dataset.searchItem);b.hidden=found.includes(item.id)||!!item.cover&&!s.investigation.opened.includes(item.cover);});
    root.querySelectorAll('[data-search-check]').forEach(el=>{const done=found.includes(el.dataset.searchCheck);el.classList.toggle('found',done);el.querySelector('i').textContent=done?'✓':'';});
    const count=hunt.items.filter(i=>found.includes(i.id)).length,complete=huntComplete(s,hunt.id);
    root.querySelector('.search-counter').textContent=`${count} / ${hunt.items.length} trovati`;
    root.querySelector('.search-result').hidden=!complete;root.querySelector('.search-result p').textContent=hunt.clue;
    root.querySelector('.search-assemble').textContent=s.investigation.crafted.includes(hunt.reward)?'Torna alla stanza':`Combina i pezzi: ${TOOL_DEFS[hunt.reward].name}`;
    root.querySelector('.search-instruction').hidden=complete;
  }
  function hint(){
    clearTimeout(signalTimer);root.querySelectorAll('.search-highlight').forEach(el=>el.classList.remove('search-highlight'));
    const item=hunt.items.find(i=>!current.investigation.found.includes(i.id));if(!item){speech.textContent='La ricerca è completa. Ora puoi combinare i due pezzi.';return;}
    const inCase=item.cover&&!current.investigation.opened.includes(item.cover),target=inCase?cover:root.querySelector(`[data-search-item="${item.id}"]`);
    target.classList.add('search-highlight');target.scrollIntoView({behavior:reduceMotion?'instant':'smooth',block:'center',inline:'center'});
    speech.textContent=inCase?'Nora: «L’astuccio è chiuso. Provo ad aprirlo.»':`Nora: «Lì vedo ${item.name.toLowerCase()}.»`;
    signalTimer=setTimeout(()=>target.classList.remove('search-highlight'),6500);
  }
  function onClick(event){
    const button=event.target.closest('button');if(!button)return;
    if(button.matches('.search-back')){onClose();return;}
    if(button.matches('.search-zoom')){zoom=zoom===1?1.4:1;fit();button.innerHTML=uiIcon(zoom===1?'plus':'minus');button.setAttribute('aria-label',zoom===1?'Ingrandisci la scena':'Riduci la scena');return;}
    if(button.matches('.search-hint')){onHint?.();hint();return;}
    if(button.matches('.search-deduce')){onDeduce?.();return;}
    if(button.matches('.search-assemble')){current.investigation.crafted.includes(hunt.reward)?onClose():onCombine(hunt);return;}
    if(button.dataset.searchCover){const result=onAction('i-open',button.dataset.searchCover);if(result?.success){speech.textContent='Nora: «C’è qualcosa sotto il coperchio.»';const item=hunt.items.find(i=>i.cover);root.querySelector(`[data-search-item="${item.id}"]`)?.focus({preventScroll:true});}return;}
    if(button.dataset.searchItem){const item=hunt.items.find(i=>i.id===button.dataset.searchItem),result=onAction('i-find',item.id);if(result?.success){speech.textContent=`${item.name}. ${item.description}`;root.querySelector('.search-counter').classList.remove('found-flash');void root.offsetWidth;root.querySelector('.search-counter').classList.add('found-flash');const next=stage.querySelector('.hidden-object:not([hidden])');(next??root.querySelector('.search-assemble')).focus({preventScroll:true});}}
  }
  const down=e=>{if(e.button===0&&!e.target.closest('button')){drag={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(e.pointerId);}};
  const move=e=>{if(drag){viewport.scrollLeft=drag.left+drag.x-e.clientX;viewport.scrollTop=drag.top+drag.y-e.clientY;}};
  const up=()=>{drag=null;};
  root.addEventListener('click',onClick);viewport.addEventListener('pointerdown',down);viewport.addEventListener('pointermove',move);viewport.addEventListener('pointerup',up);viewport.addEventListener('pointercancel',up);
  const observer=new ResizeObserver(fit);observer.observe(viewport);fit();update(state);const remaining=hunt.items.filter(item=>!state.investigation.found.includes(item.id));const targets=remaining.length?remaining:hunt.items;viewport.scrollLeft=targets.reduce((sum,item)=>sum+item.x,0)/targets.length*stage.clientWidth-viewport.clientWidth/2;viewport.scrollTop=targets.reduce((sum,item)=>sum+item.y,0)/targets.length*stage.clientHeight-viewport.clientHeight/2;root.querySelector('.search-back').focus({preventScroll:true});
  return {update,hint,dispose(){if(disposed)return;disposed=true;clearTimeout(signalTimer);observer.disconnect();root.removeEventListener('click',onClick);viewport.removeEventListener('pointerdown',down);viewport.removeEventListener('pointermove',move);viewport.removeEventListener('pointerup',up);viewport.removeEventListener('pointercancel',up);root.replaceChildren();}};
}
