import {DEDUCTIONS} from './deductions.js';
import {HUNTS,huntComplete} from './investigation.js';
import {objectArt} from './object-art.js';
import {uiIcon} from './ui-icons.js';

export function deductionIndex(chapter,state){
  const puzzles=DEDUCTIONS.filter(d=>d.chapter===chapter),solved=state.investigation.deductions??[];
  return `<section class="deduction-index"><div class="section-heading"><div><small>Le connessioni di Nora</small><h3>Tra una traccia e l’altra</h3></div><span>${puzzles.filter(d=>solved.includes(d.id)).length} / 2</span></div><p>Collega due prove e ricostruisci ciò che è successo.</p>${puzzles.map((d,i)=>{const ready=huntComplete(state,d.hunt),done=solved.includes(d.id);return `<button class="deduction-link" data-deduction="${d.id}" ${ready?'':'disabled'}><span class="deduction-number">0${i+1}</span><span><strong>${d.title}</strong><small>${done?'Pista ricostruita':ready?'Le prove sono pronte':'Completa la ricerca nella stanza'}</small></span>${uiIcon(done?'check':ready?'arrow':'lock')}</button>`;}).join('')}</section>`;
}
export function deductionPanel(id,state,selection,{heading,button}){
  const d=DEDUCTIONS.find(d=>d.id===id&&d.chapter===(state.chapter??1));
  if(!d||!huntComplete(state,d.hunt))return heading('Il taccuino','Una pista ancora incompleta');
  const done=state.investigation.deductions?.includes(id),items=HUNTS.find(h=>h.id===d.hunt).items.filter(i=>!i.component);
  return heading('Deduzione · Collega le prove',d.title,done?'Hai ricostruito questa parte della storia.':d.question)+(done?`<div class="deduction-solved">${uiIcon('check')}<p>${d.reveal}</p></div>`:`<div class="deduction-board">${items.map(i=>`<button data-evidence="${i.id}" class="evidence-choice ${selection.includes(i.id)?'selected':''}" aria-pressed="${selection.includes(i.id)}">${objectArt(i.kind,`deduction-${i.id}`)}<strong>${i.name}</strong><span>${i.description}</span><i>${selection.includes(i.id)?uiIcon('check'):uiIcon('plus')}</i></button>`).join('')}</div><p class="deduction-selected" aria-live="polite">${selection.length} di 2 prove selezionate</p><button class="primary" data-action="deduce" ${selection.length===2?'':'disabled'}>Collega le due prove</button><details class="deduction-hint"><summary>Mi serve un indizio</summary><p>${d.hint}</p></details>`)+button('journal','Torna al taccuino','text-button');
}
