import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import './item-viewer.css';
import {renderScale} from './render-scale.js';

const LABELS={key:'Chiave di ottone',handle:'Manovella di noce e ottone',valve:'Ruota della valvola',cylinder:'Cilindro fonografico',compass:'Bussola di Vespera'};

/**
 * A self-contained object inspection. Rotation never unlocks a game action.
 * Mount once in an empty container; dispose before replacing its parent panel.
 */
export function createItemViewer(container,{kind='key',reduceMotion=false,onInspect=()=>{}}={}){
  if(!Object.hasOwn(LABELS,kind))kind='key';
  let disposed=false,frame=0,drag=null,inspected=false,contextLost=false;
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  let requestedMotion=reduceMotion,reduced=reduceMotion||media.matches;
  let renderer,environment,observer;
  const ownedGeometries=new Set(),ownedMaterials=new Set(),ownedTextures=new Set();
  const root=document.createElement('section');root.className='maree-item-viewer';root.setAttribute('aria-label',`Esamina: ${LABELS[kind]}`);
  root.innerHTML=`<div class="item-viewer-stage"></div><p class="item-viewer-guide">Trascina per ruotare. Scorri fuori dall’oggetto per continuare.</p><div class="item-viewer-controls" role="group" aria-label="Controlli dell’oggetto"><button type="button" data-inspect-control="left" aria-label="Ruota l’oggetto a sinistra">↶</button><button type="button" data-inspect-control="right" aria-label="Ruota l’oggetto a destra">↷</button><button type="button" data-inspect-control="near" aria-label="Avvicina l’oggetto">＋</button><button type="button" data-inspect-control="far" aria-label="Allontana l’oggetto">−</button><button type="button" data-inspect-control="reset">Ripristina vista</button></div><p class="item-viewer-status" role="status" aria-live="polite"></p>`;
  container.appendChild(root);
  const stage=root.querySelector('.item-viewer-stage'),status=root.querySelector('.item-viewer-status');
  function fallback(){
    if(disposed)return;
    stage.replaceChildren();
    const p=document.createElement('p');p.className='item-viewer-fallback';p.textContent='L’anteprima tridimensionale non è disponibile in questo browser. Puoi comunque leggere gli indizi e usare l’oggetto.';stage.appendChild(p);
    root.querySelector('.item-viewer-controls').hidden=true;root.querySelector('.item-viewer-guide').hidden=true;
  }
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(37,1,.05,35),pivot=new THREE.Group();
  scene.add(pivot);scene.background=new THREE.Color('#102125');
  const defaultRotation={x:kind==='compass'?.12:-.1,y:kind==='key'?-.37:.32};
  let targetX=defaultRotation.x,targetY=defaultRotation.y,targetDistance=5.6;
  camera.position.set(0,.12,targetDistance);camera.lookAt(0,0,0);
  pivot.rotation.set(targetX,targetY,0);
  function addMaterial(options){const m=new THREE.MeshStandardMaterial(options);ownedMaterials.add(m);return m;}
  function mesh(geometry,material,parent=pivot){ownedGeometries.add(geometry);const m=new THREE.Mesh(geometry,material);parent.add(m);return m;}
  function texture(draw,size=512,color=true){
    const c=document.createElement('canvas');c.width=c.height=size;
    const ctx=c.getContext('2d');if(!ctx)return null;draw(ctx,size);
    const t=new THREE.CanvasTexture(c);t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());ownedTextures.add(t);return t;
  }
  let seed=1812;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  function disposeResources(){
    for(const g of ownedGeometries)g.dispose();for(const m of ownedMaterials)m.dispose();for(const t of ownedTextures)t.dispose();
    ownedGeometries.clear();ownedMaterials.clear();ownedTextures.clear();environment?.dispose();environment=null;renderer?.dispose();renderer?.forceContextLoss();
  }
  try{
    renderer=new THREE.WebGLRenderer({alpha:false,antialias:true,powerPreference:'low-power'});
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
    const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`${LABELS[kind]}, oggetto tridimensionale. Trascina oppure usa le frecce per ruotare; più e meno per avvicinare o allontanare.`);stage.appendChild(canvas);
    const generator=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
    try{environment=generator.fromScene(room,.035);scene.environment=environment.texture;scene.environmentIntensity=.78;}finally{room.dispose();generator.dispose();}
    scene.add(new THREE.HemisphereLight('#d4eeee','#29261f',1.4));
    const keyLight=new THREE.DirectionalLight('#ffe2ad',3.1);keyLight.position.set(-3,5,4);scene.add(keyLight);
    const coolLight=new THREE.DirectionalLight('#92c6dc',2.2);coolLight.position.set(4,1,-2);scene.add(coolLight);
    const fill=new THREE.DirectionalLight('#e3aa5a',.65);fill.position.set(-2,-3,1);scene.add(fill);

    const grain=texture((c,s)=>{
      c.fillStyle='#766148';c.fillRect(0,0,s,s);
      for(let i=0;i<9500;i++){const v=Math.floor(90+random()*90);c.fillStyle=`rgba(${v},${Math.floor(v*.88)},${Math.floor(v*.62)},.15)`;c.fillRect(random()*s,random()*s,random()*3+.5,random()*2+.5);}
      for(let i=0;i<240;i++){c.strokeStyle=`rgba(240,220,170,${random()*.07})`;c.beginPath();const x=random()*s,y=random()*s;c.moveTo(x,y);c.lineTo(x+random()*55,y+random()*2);c.stroke();}
    });
    const roughness=texture((c,s)=>{c.fillStyle='#b0b0b0';c.fillRect(0,0,s,s);for(let i=0;i<6000;i++){const v=Math.floor(115+random()*90);c.fillStyle=`rgb(${v},${v},${v})`;c.fillRect(random()*s,random()*s,random()*4+1,random()*4+1);}},256,false);
    const woodTex=texture((c,s)=>{c.fillStyle='#4b3020';c.fillRect(0,0,s,s);for(let i=0;i<650;i++){const y=random()*s;c.beginPath();c.moveTo(0,y);c.bezierCurveTo(s*.3,y+random()*14,s*.7,y-random()*14,s,y);c.strokeStyle=random()>.5?'#aa744b38':'#1a171744';c.lineWidth=random()*2+.4;c.stroke();}});
    const brass=addMaterial({color:'#d7b875',metalness:1,roughness:.33,map:grain,roughnessMap:roughness});
    const polished=addMaterial({color:'#d7bb7b',metalness:1,roughness:.22});
    const darkMetal=addMaterial({color:'#293e3b',metalness:1,roughness:.5});
    const wood=addMaterial({color:'#b39370',metalness:0,roughness:.5,map:woodTex});
    const wax=addMaterial({color:'#644929',metalness:0,roughness:.4});
    const black=addMaterial({color:'#122024',metalness:0,roughness:.7});
    const ring=(r,tube,material=brass,parent=pivot)=>mesh(new THREE.TorusGeometry(r,tube,10,80),material,parent);
    const box=(x,y,z,material=brass,parent=pivot)=>mesh(new THREE.BoxGeometry(x,y,z),material,parent);
    const cylinder=(radius,length,material=brass,segments=48,parent=pivot)=>mesh(new THREE.CylinderGeometry(radius,radius,length,segments),material,parent);
    function beam(a,b,r,material=brass,parent=pivot){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);const m=cylinder(r,start.distanceTo(end),material,24,parent);m.position.copy(start.clone().add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());return m;}
    function screw(x,y,z,parent=pivot){const head=cylinder(.065,.04,polished,16,parent);head.rotation.x=Math.PI/2;head.position.set(x,y,z);const slot=box(.065,.013,.008,darkMetal,parent);slot.position.set(x,y,z+.022);slot.rotation.z=.3;}

    if(kind==='key'){
      const bow=ring(.53,.1);bow.scale.y=1.08;bow.position.y=.87;
      const inset=ring(.39,.024,polished);inset.scale.y=1.08;inset.position.set(0,.87,.05);
      for(let n=0;n<3;n++){const petal=ring(.095,.023,polished);const a=n*Math.PI*2/3;petal.position.set(Math.cos(a)*.48,.87+Math.sin(a)*.51,.04);}
      const shaft=cylinder(.092,1.75);shaft.position.y=-.32;
      for(const y of [.2,-.83]){const collar=cylinder(.145,.105,polished);collar.position.y=y;}
      const bit=box(.5,.35,.14);bit.position.set(.2,-1.02,0);
      for(const [x,y]of [[.17,-.82],[.4,-.83],[.4,-1.21]]){const tooth=box(.11,.17,.16,polished);tooth.position.set(x,y,0);}
      const end=cylinder(.11,.09,darkMetal);end.position.y=-1.26;
    }
    if(kind==='handle'){
      const hub=cylinder(.31,.48);hub.rotation.x=Math.PI/2;hub.position.set(-.77,-.26,0);
      for(const z of [-.25,.25]){const lip=ring(.3,.035,polished);lip.position.set(-.77,-.26,z);}
      beam([-.77,-.26,.1],[-.08,.35,.1],.13);beam([-.08,.35,.1],[.7,.35,.1],.13);
      const elbow=mesh(new THREE.SphereGeometry(.145,24,16),brass);elbow.position.set(-.08,.35,.1);
      beam([.7,.35,.1],[.7,.35,.83],.09,polished);
      const points=[new THREE.Vector2(.08,0),new THREE.Vector2(.14,.05),new THREE.Vector2(.2,.17),new THREE.Vector2(.22,.45),new THREE.Vector2(.18,.75),new THREE.Vector2(.13,.85),new THREE.Vector2(.08,.87)];
      const grip=mesh(new THREE.LatheGeometry(points,48),wood);grip.rotation.x=Math.PI/2;grip.position.set(.7,.35,.55);
      for(const z of [.57,1.38]){const rim=ring(.13,.025,polished);rim.position.set(.7,.35,z);}
      const pin=cylinder(.12,.03,polished);pin.rotation.x=Math.PI/2;pin.position.set(.7,.35,1.43);
      screw(-.77,-.26,.27);
    }
    if(kind==='valve'){
      ring(1.05,.105);ring(.95,.028,polished);ring(1.13,.02,darkMetal);
      for(let n=0;n<5;n++){const a=n*Math.PI*2/5;beam([Math.cos(a)*.23,Math.sin(a)*.23,0],[Math.cos(a)*1.03,Math.sin(a)*1.03,0],.065);}
      const hub=cylinder(.29,.27,polished,48);hub.rotation.x=Math.PI/2;
      const nut=cylinder(.16,.13,brass,6);nut.rotation.x=Math.PI/2;nut.position.z=.2;
      const shaft=cylinder(.105,.8,darkMetal);shaft.rotation.x=Math.PI/2;shaft.position.z=-.5;
      for(let n=0;n<12;n++){const thread=ring(.112,.015,polished);thread.position.z=-.18-n*.05;}
      const gasket=ring(.22,.045,darkMetal);gasket.position.z=-.14;
      const stamp=box(.36,.09,.023,darkMetal);stamp.position.set(0,-1.04,.09);
    }
    if(kind==='cylinder'){
      const barrel=cylinder(.52,1.6,wax,80);barrel.rotation.z=Math.PI/2;
      for(let i=0;i<38;i++){const groove=ring(.523,.006,darkMetal);groove.rotation.y=Math.PI/2;groove.position.x=-.72+i*.039;}
      for(const x of [-.85,.85]){
        const end=cylinder(.56,.1,brass,64);end.rotation.z=Math.PI/2;end.position.x=x;
        const lip=ring(.5,.032,polished);lip.rotation.y=Math.PI/2;lip.position.x=x+(x>0?.056:-.056);
        const axle=cylinder(.15,.17,polished,32);axle.rotation.z=Math.PI/2;axle.position.x=x+(x>0?.12:-.12);
      }
      const labelTex=texture((c,s)=>{c.fillStyle='#d7c79d';c.fillRect(0,0,s,s);c.strokeStyle='#665d42';c.lineWidth=5;c.strokeRect(20,20,s-40,s-40);c.fillStyle='#383d32';c.font='38px Georgia';c.textAlign='center';c.fillText('ARCHIVIO',s/2,145);c.font='italic 58px Georgia';c.fillText('Vespera',s/2,242);c.font='32px Georgia';c.fillText('Voce N. 17',s/2,340);c.font='24px Georgia';c.fillText('1912',s/2,410);});
      const labelMat=new THREE.MeshBasicMaterial({map:labelTex,color:'#e8d9b3',toneMapped:false});ownedMaterials.add(labelMat);
      const label=mesh(new THREE.PlaneGeometry(.73,.5),labelMat);label.position.z=.532;
    }
    if(kind==='compass'){
      const caseBody=cylinder(1.05,.27);caseBody.rotation.x=Math.PI/2;caseBody.position.z=-.05;
      const rim=ring(.98,.095,polished);rim.position.z=.12;
      const inner=ring(.86,.022,darkMetal);inner.position.z=.18;
      const dialTex=texture((c,s)=>{
        c.fillStyle='#d9cda9';c.fillRect(0,0,s,s);c.translate(s/2,s/2);c.strokeStyle='#6d644a';
        for(let i=0;i<120;i++){const a=i*Math.PI/60,r=s*.42,len=i%10===0?22:i%5===0?15:7;c.beginPath();c.moveTo(Math.sin(a)*r,Math.cos(a)*r);c.lineTo(Math.sin(a)*(r-len),Math.cos(a)*(r-len));c.lineWidth=i%10===0?2:1;c.stroke();}
        c.strokeStyle='#8f815b';c.beginPath();c.arc(0,0,s*.3,0,Math.PI*2);c.stroke();
        c.textAlign='center';c.textBaseline='middle';c.fillStyle='#3a443b';c.font='40px Georgia';for(const [t,x,y]of [['N',0,-.32],['E',.32,0],['S',0,.32],['O',-.32,0]])c.fillText(t,s*x,s*y);
        c.font='italic 21px Georgia';c.fillText('Vespera',0,s*.16);c.font='14px Georgia';c.fillText('Officina Valenti',0,s*.22);
      });
      const dialMat=new THREE.MeshBasicMaterial({map:dialTex,color:'#f3e5c3',toneMapped:false});ownedMaterials.add(dialMat);
      const dial=mesh(new THREE.CircleGeometry(.88,80),dialMat);dial.position.z=.105;
      const needleShape=new THREE.Shape();needleShape.moveTo(0,.69);needleShape.lineTo(.075,0);needleShape.lineTo(0,-.05);needleShape.lineTo(-.075,0);needleShape.closePath();
      const north=mesh(new THREE.ExtrudeGeometry(needleShape,{depth:.025,bevelEnabled:true,bevelSize:.007,bevelThickness:.006,bevelSegments:1,steps:1}),addMaterial({color:'#7b3631',metalness:.5,roughness:.35}));north.position.z=.19;north.rotation.z=-.28;
      const south=mesh(north.geometry,polished);south.position.z=.19;south.rotation.z=Math.PI-.28;
      const cap=mesh(new THREE.SphereGeometry(.09,24,16),polished);cap.scale.z=.5;cap.position.z=.23;
      const bail=ring(.18,.045);bail.position.y=1.22;
      for(const a of [Math.PI*.25,Math.PI*.75,Math.PI*1.25,Math.PI*1.75])screw(Math.cos(a)*.96,Math.sin(a)*.96,.2);
      // The clear protective crystal is intentionally omitted: the dial stays legible
      // on mobile, avoiding overlapping transparent surfaces and extra render passes.
    }
    pivot.rotation.set(0,0,0);
    const bounds=new THREE.Box3().setFromObject(pivot),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
    const model=new THREE.Group();while(pivot.children.length)model.add(pivot.children[0]);pivot.add(model);
    model.position.copy(center).multiplyScalar(-1);const normalization=2.55/Math.max(size.x,size.y,size.z);pivot.scale.setScalar(normalization);pivot.rotation.set(targetX,targetY,0);
    const shadowTex=texture((c,s)=>{const gradient=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s*.48);gradient.addColorStop(0,'rgba(0,0,0,.5)');gradient.addColorStop(.5,'rgba(0,0,0,.22)');gradient.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gradient;c.fillRect(0,0,s,s);},128);
    const shadowMat=new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false});ownedMaterials.add(shadowMat);
    const shadow=mesh(new THREE.PlaneGeometry(3.3,.45),shadowMat,scene);shadow.position.set(0,-1.52,-.5);
  }catch{
    disposeResources();fallback();return {dispose(){if(disposed)return;disposed=true;root.remove();},setMotion(){}};
  }

  const canvas=renderer.domElement;
  function notifyInspection(){if(inspected)return;inspected=true;status.textContent='Puoi ruotare l’oggetto e osservare ogni lato.';onInspect({kind});}
  function render(){
    frame=0;if(disposed||contextLost||document.hidden)return;
    const factor=reduced?1:.24;
    pivot.rotation.x+=(targetX-pivot.rotation.x)*factor;pivot.rotation.y+=(targetY-pivot.rotation.y)*factor;camera.position.z+=(targetDistance-camera.position.z)*factor;
    renderer.render(scene,camera);
    if(Math.abs(targetX-pivot.rotation.x)+Math.abs(targetY-pivot.rotation.y)+Math.abs(targetDistance-camera.position.z)>.002)requestRender();
  }
  function requestRender(){if(!disposed&&!contextLost&&!frame&&!document.hidden)frame=requestAnimationFrame(render);}
  function resize(){const width=Math.max(1,stage.clientWidth),height=Math.max(240,stage.clientHeight);renderer.setPixelRatio(renderScale(width,height,window.devicePixelRatio));renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();requestRender();}
  function pointerDown(event){if(event.button!==0||drag)return;event.preventDefault();drag={id:event.pointerId,x:event.clientX,y:event.clientY,travel:0};canvas.setPointerCapture?.(event.pointerId);canvas.classList.add('is-dragging');canvas.focus({preventScroll:true});}
  function pointerMove(event){if(!drag||event.pointerId!==drag.id)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;drag.travel+=Math.abs(dx)+Math.abs(dy);targetY+=dx*.012;targetX=THREE.MathUtils.clamp(targetX+dy*.012,-1.35,1.35);drag.x=event.clientX;drag.y=event.clientY;if(drag.travel>8)notifyInspection();requestRender();}
  function pointerUp(event){if(!drag||(event?.pointerId!==undefined&&event.pointerId!==drag.id))return;const id=drag.id;drag=null;canvas.classList.remove('is-dragging');if(canvas.hasPointerCapture?.(id))canvas.releasePointerCapture(id);}
  function control(name){
    if(name==='left')targetY-=Math.PI/5;if(name==='right')targetY+=Math.PI/5;
    if(name==='near')targetDistance=Math.max(4,targetDistance-.45);if(name==='far')targetDistance=Math.min(7,targetDistance+.45);
    if(name==='reset'){targetX=defaultRotation.x;targetY=defaultRotation.y;targetDistance=5.6;}
    else if(name==='left'||name==='right')notifyInspection();requestRender();
  }
  function click(event){const button=event.target.closest('[data-inspect-control]');if(button&&root.contains(button))control(button.dataset.inspectControl);}
  function keydown(event){
    const map={ArrowLeft:'left',ArrowRight:'right','+':'near','=':'near','-':'far',Home:'reset'};
    if(map[event.key]){event.preventDefault();event.stopPropagation();control(map[event.key]);}
    if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();event.stopPropagation();targetX=THREE.MathUtils.clamp(targetX+(event.key==='ArrowUp'?-.18:.18),-1.35,1.35);notifyInspection();requestRender();}
  }
  function wheel(event){if(document.activeElement!==canvas)return;event.preventDefault();targetDistance=THREE.MathUtils.clamp(targetDistance+Math.sign(event.deltaY)*.22,4,7);requestRender();}
  function visibility(){if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;pointerUp();}else requestRender();}
  function motionChanged(){reduced=requestedMotion||media.matches;requestRender();}
  function lostContext(event){event.preventDefault();contextLost=true;if(frame)cancelAnimationFrame(frame);frame=0;pointerUp();fallback();}
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('lostpointercapture',pointerUp);
  canvas.addEventListener('keydown',keydown);canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('webglcontextlost',lostContext);
  root.addEventListener('click',click);window.addEventListener('blur',pointerUp);document.addEventListener('visibilitychange',visibility);media.addEventListener?.('change',motionChanged);
  observer=new ResizeObserver(resize);observer.observe(stage);resize();
  return {
    setMotion(value){requestedMotion=!!value;motionChanged();},
    dispose(){
      if(disposed)return;disposed=true;if(frame)cancelAnimationFrame(frame);frame=0;pointerUp();observer.disconnect();
      canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerUp);canvas.removeEventListener('lostpointercapture',pointerUp);canvas.removeEventListener('keydown',keydown);canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('webglcontextlost',lostContext);
      root.removeEventListener('click',click);window.removeEventListener('blur',pointerUp);document.removeEventListener('visibilitychange',visibility);media.removeEventListener?.('change',motionChanged);
      disposeResources();root.remove();
    },
  };
}
