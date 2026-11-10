import observatory from './assets/4k/observatory.webp';
import workshop from './assets/4k/workshop.webp';
import archive from './assets/4k/archive.webp';
import vault from './assets/4k/vault.webp';

export const PORTRAITS={
  1:[{image:observatory,spots:[['letter',.16,.672],['safe',.195,.43],['projector',.925,.43],['astrolabe',.76,.407]]},
    {image:workshop,spots:[['diary',.82,.692],['gears',.125,.354],['telescope',.53,.328],['tides',.835,.403],['door',.948,.45]]}],
  2:[{image:archive,spots:[['register',.485,.655],['pumps',.265,.433],['echoes',.815,.358],['conduits',.922,.507]]},
    {image:vault,spots:[['catalog',.115,.477],['pressure',.77,.392],['strips',.155,.617],['airlock',.925,.422],['heart',.49,.367]]}],
};
export const PORTRAIT_HUNTS={
  desk:{cover:[.83,.635,.15],items:[[.4,.64,.095],[.83,.635,.08],[.6,.68,.08],[.87,.69,.07],[.25,.625,.11],[.42,.69,.06]]},
  workbench:{cover:[.17,.69,.15],items:[[.43,.70,.13],[.17,.69,.09],[.35,.75,.12],[.59,.735,.095],[.68,.66,.09],[.89,.755,.08]]},
  gallery:{cover:[.2,.70,.15],items:[[.83,.666,.1],[.2,.70,.08],[.88,.706,.09],[.16,.63,.07],[.5,.695,.085],[.7,.648,.07]]},
  memory:{cover:[.88,.685,.15],items:[[.58,.67,.11],[.88,.685,.08],[.41,.71,.11],[.73,.66,.1],[.68,.724,.09],[.86,.73,.07]]},
};
export function portraitHunt(hunt){
  const positions=PORTRAIT_HUNTS[hunt.id],coords=([x,y,w])=>({x,y,w});
  return {...hunt,cover:{...hunt.cover,...coords(positions.cover)},items:hunt.items.map((item,i)=>({...item,...coords(positions.items[i])}))};
}
