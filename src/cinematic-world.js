import {renderScale} from './render-scale.js';
import observatory from './assets/observatory.jpg';
import workshop from './assets/workshop.jpg';
import archive from './assets/archive.jpg';
import vault from './assets/vault.jpg';

export const SCENES = {
  1:[{name:'La sala delle maree',image:observatory,spots:[['letter',.215,.74],['safe',.193,.455],['projector',.754,.49],['astrolabe',.601,.468]]},
    {name:'L’officina astronomica',image:workshop,spots:[['diary',.724,.703],['gears',.166,.526],['telescope',.485,.334],['tides',.633,.434],['door',.897,.448]]}],
  2:[{name:'La galleria sommersa',image:archive,spots:[['register',.201,.64],['pumps',.349,.413],['echoes',.794,.448],['conduits',.841,.66]]},
    {name:'La camera dei ricordi',image:vault,spots:[['catalog',.144,.339],['pressure',.886,.532],['strips',.222,.825],['airlock',.764,.405],['heart',.492,.455]]}],
};

// The environments are original pre-rendered art. Real-time camera transforms,
// inspection zoom, drifting particles and water light sit above the scene plate.
export function createCinematicWorld(container,{chapter}){
  let room=0,interactive=false,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,low=false;
  let width=innerWidth,height=innerHeight,pan=0,focus=null,disposed=false,frame=0,then=0,down=null,state={};
  container.innerHTML='<div class="scene-stage"><img class="scene-image" alt="" draggable="false"/><div class="scene-waterlight"></div></div><canvas class="scene-dust" aria-hidden="true"></canvas>';
  const stage=container.querySelector('.scene-stage'),img=container.querySelector('img'),canvas=container.querySelector('canvas'),ctx=canvas.getContext('2d');
  const particles=Array.from({length:30},(_,i)=>({x:(Math.sin(i*72.6)*.5+.5),y:(Math.cos(i*39.1)*.5+.5),size:i%3*.45+.6}));
  const scene=()=>SCENES[chapter][room];
  function layout(){
    const scale=Math.max(width/1672,height/941),w=1672*scale,h=941*scale;
    stage.style.width=`${w}px`;stage.style.height=`${h}px`;
    const shift=Math.max(0,(w-width)/2),left=(width-w)/2+pan*shift;
    stage.style.left=`${left}px`;stage.style.top=`${(height-h)/2}px`;
    if(focus){const spot=scene().spots.find(x=>x[0]===focus);if(spot){stage.style.transformOrigin=`${spot[1]*100}% ${spot[2]*100}%`;stage.style.transform='scale(1.32)';}}
    else{stage.style.transform='scale(1)';stage.style.transformOrigin='50% 50%';}
    return {w,h,left,top:(height-h)/2};
  }
  function loadScene(){img.src=scene().image;container.dataset.room=room;container.dataset.worldChapter=chapter;layout();}
  function resize(){width=container.clientWidth;height=container.clientHeight;const ratio=renderScale(width,height,devicePixelRatio,low);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;ctx?.setTransform(ratio,0,0,ratio,0,0);layout();}
  function draw(now){
    if(disposed)return;frame=requestAnimationFrame(draw);
    if(document.hidden||now-then<40)return;then=now;
    if(!ctx)return;ctx.clearRect(0,0,width,height);
    if(reduced||low)return;
    for(const p of particles){const x=((p.x+now*.0000013)%1)*width,y=((p.y-now*.000003+10)%1)*height;ctx.beginPath();ctx.fillStyle=chapter===2?'rgba(180,224,221,.25)':'rgba(255,223,166,.35)';ctx.arc(x,y,p.size,0,Math.PI*2);ctx.fill();}
  }
  const pointerdown=e=>{if(interactive&&e.button===0){down={x:e.clientX,pan};container.setPointerCapture?.(e.pointerId);}};
  const pointermove=e=>{if(down){pan=Math.max(-1,Math.min(1,down.pan+(e.clientX-down.x)/Math.max(160,width*.35)));layout();}};
  const pointerup=()=>{down=null;};
  container.addEventListener('pointerdown',pointerdown);container.addEventListener('pointermove',pointermove);container.addEventListener('pointerup',pointerup);container.addEventListener('pointercancel',pointerup);
  const observer=new ResizeObserver(resize);observer.observe(container);resize();loadScene();frame=requestAnimationFrame(draw);
  return {
    focus(id){focus=id;layout();},overview(){focus=null;layout();},setInteractive(v){interactive=v;},
    setProgress(s){state=s;const next=s.extension?.room??0;if(next!==room){room=next;focus=null;pan=0;loadScene();}},
    setLens(v){container.classList.toggle('spectral-scene',v);},
    setQuality(q){low=q==='low';container.classList.toggle('light-render',low);resize();},
    setMotion(v){reduced=v||matchMedia('(prefers-reduced-motion: reduce)').matches;container.classList.toggle('still-scene',reduced);},
    pulseNote(n){container.style.setProperty('--echo-hue',`${n*25}deg`);},
    getHotspots(){const {w,h,left,top}=layout();return scene().spots.map(([id,x,y])=>({id,x:(left+x*w)/width,y:(top+y*h)/height,visible:!focus}));},
    getDiagnostics(){return {renderer:'cinematic-2.5d',room,scene:scene().name,imageLoaded:img.complete&&img.naturalWidth>0,imageWidth:img.naturalWidth,frameWidth:canvas.width,frameHeight:canvas.height,pixelRatio:canvas.width/Math.max(width,1),particles:low||reduced?0:particles.length,pan,reducedMotion:reduced};},
    resize,dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();container.removeEventListener('pointerdown',pointerdown);container.removeEventListener('pointermove',pointermove);container.removeEventListener('pointerup',pointerup);container.removeEventListener('pointercancel',pointerup);container.replaceChildren();},
  };
}
