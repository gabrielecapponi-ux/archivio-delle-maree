// Engraved gear face, with a real tooth count matching the chosen ratio.
export function gearSVG(teeth,id){
  const points=[];
  for(let t=0;t<teeth;t++)for(let corner=0;corner<4;corner++){
    const a=(t+corner/4)*Math.PI*2/teeth,r=corner===1||corner===2?93:83;
    points.push(`${(100+Math.cos(a)*r).toFixed(2)},${(100+Math.sin(a)*r).toFixed(2)}`);
  }
  return `<svg viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="metal-${id}" x2=".7" y2="1"><stop stop-color="#e2c280"/><stop offset=".23" stop-color="#8c6a35"/><stop offset=".48" stop-color="#d0ad65"/><stop offset=".75" stop-color="#806133"/><stop offset="1" stop-color="#c0a368"/></linearGradient><radialGradient id="hub-${id}"><stop stop-color="#cfb57c"/><stop offset=".8" stop-color="#9d814c"/><stop offset="1" stop-color="#4d412c"/></radialGradient></defs><polygon points="${points.join(' ')}" fill="url(#metal-${id})" stroke="#e6c588" stroke-width="1.2"/><circle cx="100" cy="100" r="71" fill="#1c2823" stroke="#ddc28b" stroke-width="2"/><circle cx="100" cy="100" r="62" fill="none" stroke="#806a41" stroke-width="1"/>${Array.from({length:6},(_,i)=>`<path d="M91 31h18l-2 40H93Z" transform="rotate(${i*60} 100 100)" fill="url(#metal-${id})" stroke="#a78b54"/><circle cx="100" cy="23" r="2" transform="rotate(${i*60} 100 100)" fill="#483a28"/>`).join('')}<circle cx="100" cy="100" r="33" fill="url(#hub-${id})" stroke="#e1c791" stroke-width="2"/><circle cx="100" cy="100" r="27" fill="none" stroke="#4d4029"/><text x="100" y="110" text-anchor="middle" fill="#28281d" font-family="Cormorant Garamond,serif" font-size="32">${teeth}</text></svg>`;
}
