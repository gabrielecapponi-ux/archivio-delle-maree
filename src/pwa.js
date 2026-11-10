export let offlineState='online';
export function offlineMessage(){
  if(location.protocol==='file:')return 'Questa copia contiene già tutto il gioco.';
  return offlineState==='ready'?'Pronto anche senza connessione su questo dispositivo.':offlineState==='loading'?'Preparazione della copia offline in corso…':offlineState==='unavailable'?'Gioca online. La copia offline non è disponibile in questo browser.':'Apri il gioco online una prima volta per prepararlo su questo dispositivo.';
}
export function setupOffline(onChange){
  if(!import.meta.env.PROD||location.protocol==='file:')return;
  if(!('serviceWorker' in navigator)){offlineState='unavailable';return;}
  offlineState='loading';
  navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='MAREE_OFFLINE_READY'){offlineState='ready';onChange?.();}});
  navigator.serviceWorker.register(new URL('sw.js',document.baseURI).href,{scope:'./'}).then(async registration=>{
    const active=await navigator.serviceWorker.ready;
    (active.active??registration.active)?.postMessage({type:'MAREE_CACHE_STATUS'});
  }).catch(()=>{offlineState='unavailable';onChange?.();});
}
