import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

/** Original underwater archive: generated geometry, light and textures, no remote assets. */
export function createArchiveWorld(container,{onSelect=()=>{}}={}){
  const scene=new THREE.Scene();scene.background=new THREE.Color('#061b29');scene.fog=new THREE.FogExp2('#0a2e3c',.025);
  const camera=new THREE.PerspectiveCamera(45,1,.1,100);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  container.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Archivio Sommerso: sala di vetro e rame sotto l’oceano');
  const owned=new Set(),textures=[];const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();const env=pmrem.fromScene(room,.05);scene.environment=env.texture;scene.environmentIntensity=.35;room.dispose();pmrem.dispose();
  const mat=(color,metalness=0,roughness=.6,extra={})=>{const m=new THREE.MeshStandardMaterial({color,metalness,roughness,...extra});owned.add(m);return m;};
  const glow=(color,opacity=1)=>{const m=new THREE.MeshBasicMaterial({color,transparent:opacity<1,opacity,depthWrite:opacity===1});owned.add(m);return m;};
  let seed=212;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  function texture(draw,size=512){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t;}
  const stone=texture((c,s)=>{c.fillStyle='#6d8786';c.fillRect(0,0,s,s);for(let i=0;i<22000;i++){c.fillStyle=`rgba(8,37,40,${rand()*.2})`;c.fillRect(rand()*s,rand()*s,rand()*4+1,rand()*3+1);}for(let i=0;i<16;i++){c.strokeStyle='#bcc7ad28';c.beginPath();c.moveTo(rand()*s,0);c.bezierCurveTo(rand()*s,160,rand()*s,310,rand()*s,s);c.stroke();}});
  const materials={stone:mat('#557c7b',.08,.8,{map:stone}),dark:mat('#0c2c38',.12,.72),tile:mat('#254853',.12,.45,{map:stone}),brass:mat('#b6a16b',.78,.28),gold:mat('#e5c58a',.7,.25),copper:mat('#567e78',.6,.36),iron:mat('#193941',.5,.45),glass:mat('#5aadb2',.25,.16,{transparent:true,opacity:.3}),cyan:mat('#99f1dc',.25,.2,{emissive:'#47baa5',emissiveIntensity:1.2}),amber:mat('#f2b768',.25,.3,{emissive:'#ffa951',emissiveIntensity:.9}),paper:mat('#dbd5b5',0,.9),light:glow('#9bebd9'),soft:glow('#7bc9c4',.12)};
  const boxG=new THREE.BoxGeometry(1,1,1),cylG=new THREE.CylinderGeometry(1,1,1,32),sphereG=new THREE.SphereGeometry(1,24,16);[boxG,cylG,sphereG].forEach(g=>owned.add(g));
  function mesh(g,m,parent=scene){owned.add(g);const o=new THREE.Mesh(g,m);parent.add(o);return o;}
  function box(w,h,d,x,y,z,m=materials.stone,parent=scene){const o=mesh(boxG,m,parent);o.scale.set(w,h,d);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;return o;}
  function cyl(r,h,x,y,z,m=materials.brass,parent=scene){const o=mesh(cylG,m,parent);o.scale.set(r,h,r);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;return o;}
  function ball(r,x,y,z,m=materials.cyan,parent=scene){const o=mesh(sphereG,m,parent);o.position.set(x,y,z);o.scale.setScalar(r);return o;}
  function ring(r,t,m=materials.brass,parent=scene){return mesh(new THREE.TorusGeometry(r,t,8,64),m,parent);}
  function tube(points,r,m=materials.brass,parent=scene){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),32,r,8,false),m,parent);}
  function instances(g,m,items){const o=new THREE.InstancedMesh(g,m,items.length),dummy=new THREE.Object3D();owned.add(g);items.forEach((t,i)=>{dummy.position.set(...t.p);dummy.scale.set(...(t.s??[1,1,1]));dummy.rotation.set(...(t.r??[0,0,0]));dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix);});o.castShadow=o.receiveShadow=true;scene.add(o);return o;}
  scene.add(new THREE.HemisphereLight('#a0dedc','#142e45',1.8));const key=new THREE.DirectionalLight('#8addd4',3.3);key.position.set(-5,12,-7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-13;key.shadow.camera.right=13;key.shadow.camera.top=13;key.shadow.camera.bottom=-13;key.shadow.normalBias=.035;scene.add(key);
  const coreLight=new THREE.PointLight('#6cead3',55,12,2);coreLight.position.set(0,4,.2);scene.add(coreLight);
  const warmLight=new THREE.PointLight('#ffb873',55,15,2);warmLight.position.set(-4,4,3);scene.add(warmLight);
  const exitLight=new THREE.PointLight('#b9e9ed',20,14,2);exitLight.position.set(1,4,-6);scene.add(exitLight);
  // Stone walkways sit inside a flooded, vaulted archive.
  box(22,.6,21,0,-.65,-2,materials.dark);box(5,.35,11,0,-.05,1,materials.tile);box(16,.35,2.6,0,-.05,-2,materials.tile);
  cyl(3.15,.4,0,.05,.3,materials.stone);cyl(3.08,.05,0,.27,.3,materials.brass);cyl(2.94,.05,0,.31,.3,materials.tile);
  const floorTicks=[];for(let i=0;i<64;i++){const a=i*Math.PI/32;floorTicks.push({p:[Math.cos(a)*2.8,.35,.3+Math.sin(a)*2.8],s:[.025,.015,i%4===0?.25:.11],r:[0,-a+Math.PI/2,0]});}instances(boxG,materials.gold,floorTicks);
  const tileItems=[];for(let x=-2;x<=2;x++)for(let z=-4;z<=6;z++){if(x*x+(z-.3)**2>10)tileItems.push({p:[x,.14,z],s:[.97,.025,.97]});}instances(boxG,materials.stone,tileItems);
  const seam=ring(2.55,.014,materials.copper);seam.rotation.x=-Math.PI/2;seam.position.set(0,.36,.3);
  // Staircase and monumental piers define the front and sides without hiding the view.
  for(let i=0;i<7;i++)box(2.1,.2+i*.14,.7,-6.5,.05+i*.07,4.5-i*.65,materials.stone);
  const columns=[];for(const x of [-8,8])for(const z of [-7,-2,3]){columns.push({p:[x,3.5,z],s:[.32,7,.32]});cyl(.55,.25,x,.2,z,materials.brass);cyl(.5,.18,x,6.8,z,materials.brass);}
  instances(cylG,materials.copper,columns);
  for(const z of [-7,-2,3]){const arch=[];for(let i=0;i<=32;i++){const a=i/32*Math.PI;arch.push([Math.cos(a)*8,6.8+Math.sin(a)*2.7,z]);}tube(arch,.11,materials.brass);tube(arch.map(p=>[p[0],p[1]+.2,p[2]]),.038,materials.copper);}
  box(18,1.2,.6,0,.5,-8.4,materials.stone);box(3.4,8,.65,-7,4,-8.4,materials.dark);box(3.4,8,.65,7,4,-8.4,materials.dark);
  box(18,.8,.65,0,8.4,-8.4,materials.dark);
  // The great oculus opens visually onto an ocean of suspended memories.
  const oculus=new THREE.Group();oculus.position.set(0,4.65,-8.15);scene.add(oculus);
  ring(3.75,.22,materials.stone,oculus);ring(3.53,.07,materials.brass,oculus);ring(3.36,.035,materials.copper,oculus);
  const windowMat=new THREE.ShaderMaterial({uniforms:{time:{value:0}},transparent:false,vertexShader:'varying vec2 uvv;void main(){uvv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 uvv;uniform float time;void main(){vec2 p=uvv-.5;float r=length(p);float beams=pow(max(0.,sin((uvv.x+uvv.y*.18)*30.+time*.08)),14.)*.11;float glow=exp(-r*4.);vec3 col=mix(vec3(.012,.06,.11),vec3(.06,.33,.37),glow);col+=vec3(.10,.30,.27)*beams*(1.-uvv.y);gl_FragColor=vec4(col,1.);}'});owned.add(windowMat);
  mesh(new THREE.CircleGeometry(3.48,96),windowMat,oculus).position.z=-.08;
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const spoke=box(.035,6.9,.065,0,0,.04,materials.brass,oculus);spoke.rotation.z=a;}
  ring(1.45,.04,materials.brass,oculus);ring(.4,.065,materials.gold,oculus);ball(.12,0,0,.15,materials.cyan,oculus);
  // Water surface and animated caustics are lightweight procedural shaders.
  const waterMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'varying vec3 pos;void main(){pos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 pos;uniform float time;void main(){float w=sin(pos.x*2.+sin(pos.y*3.+time*.3))*sin(pos.y*2.2-time*.25);float foam=pow(abs(w),8.);vec3 c=mix(vec3(.025,.14,.19),vec3(.13,.39,.39),w*.25+.4)+foam*vec3(.12,.3,.28);gl_FragColor=vec4(c,.78);}'});owned.add(waterMat);
  const water=mesh(new THREE.PlaneGeometry(21,20),waterMat);water.rotation.x=-Math.PI/2;water.position.set(0,.08,-2);
  const causticMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:{value:0}},vertexShader:'varying vec2 uvv;void main(){uvv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 uvv;uniform float time;void main(){float a=sin(uvv.x*52.+sin(uvv.y*43.+time*.3)*2.);float b=sin(uvv.y*48.-sin(uvv.x*39.-time*.2)*2.);float v=pow(max(0.,1.-abs(a+b)),10.);gl_FragColor=vec4(.22,.62,.55,v*.09);}'});owned.add(causticMat);
  const caustics=mesh(new THREE.PlaneGeometry(18,16),causticMat);caustics.rotation.x=-Math.PI/2;caustics.position.set(0,.37,-1);
  const beamMat=glow('#9befdc',.025);beamMat.side=THREE.DoubleSide;
  for(let i=0;i<3;i++){const beam=mesh(new THREE.ConeGeometry(1.9,11,32,1,true),beamMat);beam.position.set(-3+i*2,4,-4);beam.rotation.z=-.25;}
  // Banks of labelled memory cylinders, collected into instanced draws.
  const capsules=[],caps=[],bases=[];for(const side of [-1,1])for(let row=0;row<4;row++)for(let i=0;i<6;i++){
    const x=side*(5.6+i*.27),z=-6.9+row*1.3,y=1.1+(i%2)*.08;
    capsules.push({p:[x,y+1.25,z],s:[.105,2.25,.105]});caps.push({p:[x,y+2.39,z],s:[.125,.08,.125]},{p:[x,y+.1,z],s:[.125,.08,.125]});bases.push({p:[x,y+1.25,z],s:[.04,1.75,.04]});
  }instances(cylG,materials.glass,capsules);instances(cylG,materials.brass,caps);instances(cylG,materials.cyan,bases);
  for(const side of [-1,1])for(let row=0;row<4;row++){box(2.3,.2,.6,side*6.25,1,-6.9+row*1.3,materials.iron);box(2.3,.15,.6,side*6.25,3.6,-6.9+row*1.3,materials.brass);}
  // Central heart: a luminous crystal suspended inside rotating gimbals.
  const heart=new THREE.Group();heart.position.set(0,0,.3);scene.add(heart);
  cyl(1.6,.35,0,.55,0,materials.stone,heart);cyl(1.45,.12,0,.78,0,materials.brass,heart);cyl(1,.3,0,.98,0,materials.copper,heart);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;const x=Math.cos(a)*1.08,z=Math.sin(a)*1.08;cyl(.065,2.2,x,2.15,z,materials.brass,heart);ball(.095,x,3.3,z,materials.amber,heart);}
  const coreGroup=new THREE.Group();coreGroup.position.y=3.3;heart.add(coreGroup);
  const crystal=mesh(new THREE.IcosahedronGeometry(.84,0),materials.cyan,coreGroup);const wire=mesh(new THREE.IcosahedronGeometry(.86,0),new THREE.MeshBasicMaterial({color:'#d6f7d2',wireframe:true,transparent:true,opacity:.5}),coreGroup);owned.add(wire.material);
  const gimbal1=ring(1.32,.055,materials.gold,coreGroup);gimbal1.rotation.set(.55,.2,.2);const gimbal2=ring(1.7,.07,materials.copper,coreGroup);gimbal2.rotation.set(1.2,.4,.6);const gimbal3=ring(2,.025,materials.brass,coreGroup);gimbal3.rotation.set(.25,.6,-.4);
  const crown=ring(1.3,.055,materials.brass,heart);crown.rotation.x=Math.PI/2;crown.position.y=5.2;cyl(.035,2.9,0,6.75,0,materials.brass,heart);
  const coreHalo=mesh(new THREE.SphereGeometry(1.03,24,16),glow('#6eeedb',.07),coreGroup);
  const haloTexture=texture((c,s)=>{const gradient=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);gradient.addColorStop(0,'rgba(189,255,224,.8)');gradient.addColorStop(.18,'rgba(125,241,204,.3)');gradient.addColorStop(.55,'rgba(72,194,176,.06)');gradient.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gradient;c.fillRect(0,0,s,s);},128);
  const haloMaterial=new THREE.SpriteMaterial({map:haloTexture,color:'#a0efcd',transparent:true,opacity:.65,blending:THREE.AdditiveBlending,depthWrite:false});owned.add(haloMaterial);
  const haloSprite=new THREE.Sprite(haloMaterial);haloSprite.scale.set(3.8,3.8,1);coreGroup.add(haloSprite);
  // The registry desk and its mineral lamp.
  const register=new THREE.Group();register.position.set(-4.3,0,3.1);register.rotation.y=.22;scene.add(register);
  box(1.85,.12,1.2,0,1.2,0,materials.brass,register);box(1.65,.9,.8,0,.7,0,materials.copper,register);
  const bookTexture=texture((c,s)=>{c.fillStyle='#d9d1b4';c.fillRect(0,0,s,s);c.fillStyle='#34565a';c.font='32px Georgia';c.fillText('REGISTRO DEI NOMI',35,70);c.font='italic 25px Georgia';['Ada Valenti, 1889','La memoria non è una prigione.','','Elia Valenti, 1912','Nora, ricorda il mio nome.'].forEach((l,i)=>c.fillText(l,35,140+i*55));});
  const bookMat=mat('#fff',0,.9,{map:bookTexture});const book=box(1.3,.05,.9,0,1.31,0,bookMat,register);book.rotation.x=.12;
  cyl(.12,.3,.65,1.51,-.35,materials.amber,register);cyl(.22,.06,.65,1.68,-.35,materials.brass,register);
  // Three glass pressure tanks and linked copper plumbing.
  const pumps=new THREE.Group();pumps.position.set(-4.2,0,-1.8);pumps.rotation.y=.28;scene.add(pumps);
  box(2.75,.22,1.15,0,.5,0,materials.iron,pumps);const tankLiquids=[];
  for(let i=0;i<3;i++){const x=-.85+i*.85,h=[2.2,1.8,1.4][i];cyl(.31,h,x,.68+h/2,0,materials.glass,pumps);cyl(.36,.09,x,.65,0,materials.brass,pumps);cyl(.36,.1,x,.7+h,0,materials.brass,pumps);const liquid=cyl(.25,h*.9,x,.68+h*.45,0,materials.cyan,pumps);tankLiquids.push({object:liquid,height:h,base:.68,cap:[8,5,3][i]});const valve=ring(.18,.035,materials.gold,pumps);valve.position.set(x,.98,.65);box(.025,.32,.04,x,.98,.66,materials.brass,pumps);tube([[x,.7,0],[x,.7,.7],[x,.45,.9]],.055,materials.copper,pumps);}
  // Four bell resonators with distinct visible symbols.
  const echoes=new THREE.Group();echoes.position.set(4.1,0,2.2);echoes.rotation.y=-.35;scene.add(echoes);cyl(1.3,.2,0,.25,0,materials.stone,echoes);cyl(.6,1.2,0,.9,0,materials.copper,echoes);cyl(1.18,.1,0,1.55,0,materials.brass,echoes);
  const bells=[];for(let i=0;i<4;i++){const a=i*Math.PI/2+.35,x=Math.cos(a)*.7,z=Math.sin(a)*.7;const bellMat=mat('#6aa9aa',.35,.2,{emissive:'#458b92',emissiveIntensity:.4});const bell=mesh(new THREE.SphereGeometry(.27,24,16,0,Math.PI*2,0,Math.PI*.7),bellMat,echoes);bell.position.set(x,2.05,z);cyl(.028,.6,x,1.81,z,materials.gold,echoes);const rim=ring(.22,.018,materials.gold,echoes);rim.rotation.x=Math.PI/2;rim.position.set(x,1.9,z);bells.push(bell);}
  const cone=mesh(new THREE.ConeGeometry(.5,.65,32,1,true),materials.brass,echoes);cone.rotation.z=-.7;cone.position.set(.15,2.55,-.45);
  // Mosaic terminal on the right: actual 3×3 engraved stone plates.
  const conduits=new THREE.Group();conduits.position.set(4.5,0,-3.6);conduits.rotation.y=-.3;scene.add(conduits);box(2.6,3.5,.5,0,1.85,0,materials.iron,conduits);box(2.72,.13,.7,0,3.65,0,materials.brass,conduits);box(2.8,.2,1,0,.2,0,materials.stone,conduits);
  const pipeModels=[];for(let i=0;i<9;i++){const x=(i%3-1)*.72,y=2.8-Math.floor(i/3)*.72;box(.65,.65,.08,x,y,.31,materials.stone,conduits);const g=new THREE.Group();g.position.set(x,y,.38);conduits.add(g);if(i!==2){const straight=i===0||i===7;tube(straight?[[-.31,0,0],[0,0,0],[.31,0,0]]:[[0,.31,0],[0,.1,0],[.1,0,0],[.31,0,0]],.055,materials.gold,g);}else{const diamond=box(.23,.23,.05,0,0,0,materials.cyan,g);diamond.rotation.z=Math.PI/4;}pipeModels.push(g);}
  // Ambient life beyond the window, and a glass apparition for the ending.
  const motesG=new THREE.BufferGeometry(),positions=new Float32Array(180*3);for(let i=0;i<180;i++){positions[i*3]=(rand()-.5)*17;positions[i*3+1]=rand()*8;positions[i*3+2]=(rand()-.5)*14;}motesG.setAttribute('position',new THREE.BufferAttribute(positions,3));owned.add(motesG);const motesMat=new THREE.PointsMaterial({color:'#b5ead7',size:.025,transparent:true,opacity:.5,depthWrite:false});owned.add(motesMat);const motes=new THREE.Points(motesG,motesMat);scene.add(motes);
  const apparition=new THREE.Group();apparition.position.set(0,.4,-4.2);scene.add(apparition);const ghost=mat('#a6e9dd',.15,.35,{emissive:'#4baea8',emissiveIntensity:.8,transparent:true,opacity:.65});ball(.22,0,1.65,0,ghost,apparition);mesh(new THREE.CapsuleGeometry(.24,.7,6,12),ghost,apparition).position.y=.99;for(const x of [-.13,.13])cyl(.075,.65,x,.35,0,ghost,apparition);for(const x of [-.32,.32]){const arm=cyl(.06,.7,x,1.05,0,ghost,apparition);arm.rotation.z=x*.5;}apparition.visible=false;
  const hotspots=[
    {id:'register',root:register,target:new THREE.Vector3(-4.3,1.65,3.1),camera:new THREE.Vector3(-1.3,3.5,6.6)},
    {id:'pumps',root:pumps,target:new THREE.Vector3(-4.2,1.8,-1.8),camera:new THREE.Vector3(-.7,3.3,2.1)},
    {id:'echoes',root:echoes,target:new THREE.Vector3(4.1,2,2.2),camera:new THREE.Vector3(7.6,4,6.3)},
    {id:'conduits',root:conduits,target:new THREE.Vector3(4.5,2,-3.6),camera:new THREE.Vector3(7.1,3.4,.5)},
    {id:'heart',root:heart,target:new THREE.Vector3(0,3,.3),camera:new THREE.Vector3(5,4.5,6.8)},
  ];hotspots.forEach(h=>h.root.traverse(o=>o.userData.hotspot=h.id));
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),clickable=hotspots.map(h=>h.root),overviewPos=new THREE.Vector3(10.8,7.7,15),overviewTarget=new THREE.Vector3(0,2.6,-1.5),desiredPos=overviewPos.clone(),desiredTarget=overviewTarget.clone(),look=overviewTarget.clone();camera.position.copy(desiredPos);camera.lookAt(look);
  let selected=null,interactive=false,activePointer=null,dragging=false,downX=0,downY=0,lastX=0,lastY=0,yaw=0,pitch=0,zoom=1,frame,disposed=false,previous=0,time=0,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let progress={water:[8,0,0],pipes:[1,0,0,3,1,0,2,1,0]},notePulse=-1,pulseTime=0;
  function aim(){const h=hotspots.find(h=>h.id===selected),origin=h?h.camera:overviewPos,target=h?h.target:overviewTarget,sph=new THREE.Spherical().setFromVector3(origin.clone().sub(target));sph.theta+=yaw;sph.phi+=pitch;sph.radius*=zoom;desiredPos.copy(target).add(new THREE.Vector3().setFromSpherical(sph));desiredTarget.copy(target);}
  function cast(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(clickable,true)[0];}
  function down(e){if(!interactive||e.button>0)return;activePointer=e.pointerId;downX=lastX=e.clientX;downY=lastY=e.clientY;dragging=false;renderer.domElement.setPointerCapture?.(e.pointerId);}
  function move(e){if(!interactive)return;if(activePointer===e.pointerId){if(Math.abs(e.clientX-downX)+Math.abs(e.clientY-downY)>7)dragging=true;if(dragging){yaw=THREE.MathUtils.clamp(yaw-(e.clientX-lastX)*.003,-.55,.55);pitch=THREE.MathUtils.clamp(pitch-(e.clientY-lastY)*.002,-.15,.2);aim();}lastX=e.clientX;lastY=e.clientY;}else renderer.domElement.style.cursor=cast(e)?'pointer':'grab';}
  function up(e){if(activePointer!==e.pointerId)return;activePointer=null;if(!dragging&&interactive){const hit=cast(e);if(hit)onSelect(hit.object.userData.hotspot);}}
  function cancel(){activePointer=null;dragging=false;}
  function wheel(e){if(!interactive)return;e.preventDefault();zoom=THREE.MathUtils.clamp(zoom+e.deltaY*.0004,.8,1.16);aim();}
  const events={pointerdown:down,pointermove:move,pointerup:up,pointercancel:cancel,wheel};for(const [name,fn]of Object.entries(events))renderer.domElement.addEventListener(name,fn,{passive:name!=='wheel'});
  function resize(){const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<.8?66:45;camera.updateProjectionMatrix();}const observer=new ResizeObserver(resize);observer.observe(container);resize();
  function render(ts){if(disposed)return;frame=requestAnimationFrame(render);if(document.hidden){previous=ts;return;}const dt=Math.min((ts-previous)/1000,.05);previous=ts;time+=dt;const ease=reduced?1:1-Math.exp(-dt*5);camera.position.lerp(desiredPos,ease);look.lerp(desiredTarget,ease);camera.lookAt(look);if(!reduced){waterMat.uniforms.time.value=time;causticMat.uniforms.time.value=time;windowMat.uniforms.time.value=time;coreGroup.rotation.y=Math.sin(time*.15)*.15;gimbal2.rotation.z=.6+time*(progress.conduits?.15:.04);crystal.rotation.y=time*.12;wire.rotation.copy(crystal.rotation);motes.rotation.y=Math.sin(time*.03)*.03;coreHalo.scale.setScalar(1+Math.sin(time*1.4)*.035);}
    water.position.y=THREE.MathUtils.lerp(water.position.y,progress.pumps?-.32:.08,ease*.4);coreLight.intensity=THREE.MathUtils.lerp(coreLight.intensity,progress.heart?85:progress.conduits?65:42,ease);
    bells.forEach((bell,i)=>bell.material.emissiveIntensity=notePulse===i&&time-pulseTime<.7?3:progress.echoes?.8:.3);renderer.render(scene,camera);
  }frame=requestAnimationFrame(render);
  return {
    focus(id){const h=hotspots.find(h=>h.id===id);if(!h)return;selected=id;yaw=pitch=0;zoom=1;aim();},overview(){selected=null;yaw=pitch=0;zoom=1;aim();},
    setInteractive(value){interactive=!!value;activePointer=null;renderer.domElement.style.cursor=value?'grab':'default';},
    setProgress(next){progress={...progress,...next};tankLiquids.forEach((tank,i)=>{const amount=progress.water?.[i]??0;tank.object.scale.y=Math.max(.01,tank.height*amount/tank.cap);tank.object.position.y=tank.base+tank.object.scale.y/2;});pipeModels.forEach((o,i)=>o.rotation.z=-(progress.pipes?.[i]??0)*Math.PI/2);apparition.visible=!!progress.heart;materials.cyan.emissiveIntensity=progress.conduits?1.7:1;},
    setLens(enabled){renderer.toneMappingExposure=enabled?1.55:1.25;scene.fog.color.set(enabled?'#184c51':'#0a2e3c');},
    pulseNote(index){notePulse=index;pulseTime=time;},setQuality(value){renderer.setPixelRatio(Math.min(devicePixelRatio,value==='low'?1:1.6));renderer.shadowMap.enabled=value!=='low';resize();},setMotion(value){reduced=!!value||matchMedia('(prefers-reduced-motion: reduce)').matches;},resize,
    getHotspots(){return hotspots.map(h=>{const p=h.target.clone();p.y+=.6;p.project(camera);return {id:h.id,x:(p.x+1)/2,y:(1-p.y)/2,visible:p.z>-1&&p.z<1&&Math.abs(p.x)<.95&&Math.abs(p.y)<.95};});},
    getDiagnostics(){return {chapter:2,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,selected,interactive,webgl:!!renderer.getContext()};},
    dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();for(const [name,fn]of Object.entries(events))renderer.domElement.removeEventListener(name,fn);owned.forEach(x=>x.dispose());textures.forEach(t=>t.dispose());env.dispose();renderer.dispose();renderer.domElement.remove();},
  };
}
