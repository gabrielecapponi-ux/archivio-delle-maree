import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

/** An original, self-contained coastal observatory. All assets are procedural. */
export function createWorld(container, { onSelect = () => {} } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#081e2a');
  scene.fog = new THREE.FogExp2('#123441', 0.024);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  renderer.domElement.setAttribute('aria-label', 'Osservatorio delle maree, ambiente tridimensionale esplorabile');
  container.appendChild(renderer.domElement);
  const pmrem=new THREE.PMREMGenerator(renderer),environmentRoom=new RoomEnvironment();
  const environment=pmrem.fromScene(environmentRoom,.05);scene.environment=environment.texture;scene.environmentIntensity=.3;environmentRoom.dispose();pmrem.dispose();

  const ownedTextures = [];
  const assets = new Set();
  const material = (color, metalness = 0, roughness = 0.7, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra });
    assets.add(m); return m;
  };
  function canvasTexture(draw, size = 512) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
    draw(canvas.getContext('2d'), size);
    const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    ownedTextures.push(t); return t;
  }
  let seed = 62191;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const stoneTex = canvasTexture((c, s) => {
    c.fillStyle = '#526a70'; c.fillRect(0, 0, s, s);
    for (let i = 0; i < 24000; i++) { const a = rand() * .13; c.fillStyle = `rgba(10,27,32,${a})`; c.fillRect(rand() * s, rand() * s, rand() * 4 + 1, rand() * 2 + 1); }
    for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(rand() * s, 0); c.bezierCurveTo(rand() * s, s / 3, rand() * s, s / 2, rand() * s, s); c.strokeStyle = '#819a9930'; c.lineWidth = .5 + rand() * 2; c.stroke(); }
  });
  const woodTex = canvasTexture((c, s) => {
    c.fillStyle = '#352b23'; c.fillRect(0, 0, s, s);
    for (let i = 0; i < 650; i++) { c.beginPath(); const y = rand() * s; c.moveTo(0, y); c.bezierCurveTo(s / 3, y + rand() * 7, s * .7, y - rand() * 8, s, y); c.strokeStyle = `rgba(${rand() > .45 ? '140,105,66' : '10,12,13'},${rand() * .24})`; c.lineWidth = rand() * 2; c.stroke(); }
  });
  const paperTex = canvasTexture((c, s) => {
    c.fillStyle = '#d7c49a'; c.fillRect(0, 0, s, s);
    c.fillStyle = '#655c4c'; c.font = 'italic 23px Georgia'; c.fillText('Nora,', 48, 80);
    c.font = 'italic 14px Georgia';
    ['quando il mare dimenticherà il suo nome,', 'cerca la luce fra le stelle.', '', 'La torre custodisce ancora la nostra voce.', 'Non fidarti del silenzio.', '', 'E.'].forEach((l, i) => c.fillText(l, 48, 128 + i * 34));
    c.strokeStyle = '#88785288'; c.strokeRect(24, 24, s - 48, s - 48);
  });
  const mats = {
    stone: material('#617b82', .02, .92, { map: stoneTex }),
    darkStone: material('#183c47', .05, .83, { map: stoneTex }),
    trim: material('#63959b', .2, .66),
    brass: material('#b49051', .72, .32),
    gold: material('#ddbc78', .65, .27),
    patina: material('#286b70', .62, .46),
    iron: material('#182d34', .65, .42),
    wood: material('#b49571', .07, .69, { map: woodTex }),
    walnut: material('#5b4430', .08, .58),
    paper: material('#fff5da', 0, .9, { map: paperTex }),
    dark: material('#091a22', .12, .6),
    warm: material('#f3d49c', .1, .5, { emissive: '#ffad4a', emissiveIntensity: 2.5 }),
    cyan: material('#98e0df', .3, .3, { emissive: '#4cb6be', emissiveIntensity: .8 }),
    glass: material('#549ca5', .55, .16, { transparent: true, opacity: .28 }),
  };
  const boxG = new THREE.BoxGeometry(1, 1, 1); assets.add(boxG);
  const sphereG = new THREE.SphereGeometry(1, 24, 16); assets.add(sphereG);
  const cylinderG = new THREE.CylinderGeometry(1, 1, 1, 32); assets.add(cylinderG);
  function mesh(geo, mat, parent = scene) { assets.add(geo); const m = new THREE.Mesh(geo, mat); parent.add(m); return m; }
  function box(w, h, d, x, y, z, mat = mats.stone, parent = scene) { const m = mesh(boxG, mat, parent); m.scale.set(w, h, d); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
  function cyl(r, h, x, y, z, mat = mats.brass, parent = scene) { const m = mesh(cylinderG, mat, parent); m.scale.set(r, h, r); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
  function ball(r, x, y, z, mat = mats.brass, parent = scene) { const m = mesh(sphereG, mat, parent); m.scale.setScalar(r); m.position.set(x, y, z); m.castShadow = true; return m; }
  function ring(r, tube, mat, parent = scene) { const m = mesh(new THREE.TorusGeometry(r, tube, 8, 80), mat, parent); m.castShadow = true; return m; }
  function line(points, mat, radius = .025, parent = scene) { const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))); return mesh(new THREE.TubeGeometry(curve, 24, radius, 6, false), mat, parent); }
  function instanced(geo, mat, transforms, parent = scene) {
    assets.add(geo); const m = new THREE.InstancedMesh(geo, mat, transforms.length); const dummy = new THREE.Object3D();
    transforms.forEach((t, i) => { dummy.position.set(...t.p); dummy.scale.set(...(t.s || [1, 1, 1])); dummy.rotation.set(...(t.r || [0, 0, 0])); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); });
    m.castShadow = m.receiveShadow = true; parent.add(m); return m;
  }

  scene.add(new THREE.HemisphereLight('#bbe8ed', '#213137', 2.2));
  const moonLight = new THREE.DirectionalLight('#98d7eb', 3.2); moonLight.position.set(-5, 11, -4); scene.add(moonLight);
  moonLight.castShadow = true; moonLight.shadow.mapSize.set(1536, 1536); moonLight.shadow.camera.left = -10; moonLight.shadow.camera.right = 10;
  moonLight.shadow.camera.top = 10; moonLight.shadow.camera.bottom = -10; moonLight.shadow.normalBias = .035; moonLight.shadow.bias = -.0004;
  const warmFill = new THREE.PointLight('#ffbd6c', 75, 19, 2); warmFill.position.set(1, 6.5, 4); scene.add(warmFill);
  const tableLight = new THREE.PointLight('#74e7ed', 20, 7, 2); tableLight.position.set(0, 3, 0); scene.add(tableLight);

  // Cutaway architecture: the missing front wall keeps every puzzle readable.
  cyl(8, .38, 0, -.24, .2, mats.darkStone);
  const floorTiles = [[], []];
  for (let x = -6; x <= 6; x++) for (let z = -5; z <= 5; z++) if (x*x + z*z < 54) floorTiles[(x + z + 30) % 2].push({ p:[x, -.025, z], s:[.975,.12,.975] });
  instanced(boxG, material('#8a9d9d', .15, .63, { map: stoneTex }), floorTiles[0]);
  instanced(boxG, material('#234956', .2, .55, { map: stoneTex }), floorTiles[1]);
  const floorBorder = ring(6.9, .035, mats.brass); floorBorder.rotation.x = -Math.PI / 2; floorBorder.position.y = .05;
  const floorInner = ring(3.4, .026, mats.brass); floorInner.rotation.x = -Math.PI / 2; floorInner.position.y = .05;

  // Back wall has two open arches with a sea view and a central sealed passage.
  box(2.6, 6.7, .45, 0, 3.25, -5.9, mats.darkStone);
  box(12.5, .8, .45, 0, .4, -5.9, mats.darkStone);
  box(12.5, .65, .5, 0, 6.4, -5.9, mats.darkStone);
  box(.7, 6.4, .6, -6, 3.2, -5.9, mats.darkStone);
  box(.7, 6.4, .6, 6, 3.2, -5.9, mats.darkStone);
  box(.45, 3.3, 7.8, -6.2, 1.6, -1.8, mats.darkStone);
  box(.5, 1.2, 6.8, 6.2, .6, -2.3, mats.darkStone);
  box(.5, .16, 7.9, -6.2, 3.3, -1.8, mats.brass);
  box(.5, .16, 6.9, 6.2, 1.25, -2.3, mats.brass);

  function archFrame(x, z, width, height) {
    const r = width / 2, bottom = .8, spring = bottom + height - r;
    const points = [[x-r,bottom,z],[x-r,spring,z]];
    for (let i=0;i<=24;i++) { const a = Math.PI - i/24*Math.PI; points.push([x+Math.cos(a)*r,spring+Math.sin(a)*r,z]); }
    points.push([x+r,bottom,z]); line(points,mats.trim,.14);
    const points2 = [[x-r+.17,bottom,z+.06],[x-r+.17,spring,z+.06]];
    for (let i=0;i<=24;i++) { const a = Math.PI - i/24*Math.PI; points2.push([x+Math.cos(a)*(r-.17),spring+Math.sin(a)*(r-.17),z+.06]); }
    points2.push([x+r-.17,bottom,z+.06]); line(points2,mats.brass,.035);
    box(width+.4,.18,.7,x,bottom,z,mats.stone);
    box(.055,height-.15,.08,x,bottom+height/2,z,mats.brass);
    box(width,.055,.08,x,spring-.6,z,mats.brass);
    const motif=ring(.38,.035,mats.brass);motif.position.set(x,spring+.28,z);
    const bars=[];
    for(let i=-1;i<=1;i+=2) bars.push({p:[x+i*width*.25,bottom+height*.42,z],s:[.04,height*.84,.06]});
    instanced(boxG,mats.brass,bars);
  }
  archFrame(-3.65,-5.58,3.9,5.2); archFrame(3.65,-5.58,3.9,5.2);
  for (const x of [-5.9,-1.45,1.45,5.9]) {
    cyl(.22,6.35,x,3.2,-5.45,mats.trim); cyl(.34,.18,x,.2,-5.45,mats.brass); cyl(.34,.22,x,6.25,-5.45,mats.brass);
    const rib=[]; for(let i=0;i<=18;i++){const t=i/18;rib.push([x*(1-t),6.3+Math.sin(t*Math.PI/2)*1.8,-5.45+4.8*t]);}line(rib,mats.patina,.065);
  }
  const upperRing=ring(2.2,.07,mats.brass); upperRing.rotation.x=-Math.PI/2; upperRing.position.set(0,7.6,-.65);
  // Hanging lamp and cables.
  cyl(.04,1.3,0,7.3,-.65,mats.iron);cyl(.62,.14,0,6.65,-.65,mats.brass);cyl(.43,.6,0,6.3,-.65,mats.glass);cyl(.55,.1,0,6,-.65,mats.brass);ball(.2,0,6.3,-.65,mats.warm);

  const skyMat = new THREE.ShaderMaterial({ depthWrite:false, uniforms:{}, vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader:'varying vec2 vUv; void main(){vec3 c=mix(vec3(.09,.24,.31),vec3(.015,.075,.14),vUv.y);gl_FragColor=vec4(c,1.);}' }); assets.add(skyMat);
  mesh(new THREE.PlaneGeometry(70,45),skyMat).position.set(0,8,-24);
  const moon = ball(1.5,-4,8,-20,material('#dfeddc',0,1,{emissive:'#dfeddc',emissiveIntensity:.8})); moon.castShadow=false;
  const seaUniforms={time:{value:0}};
  const seaMat=new THREE.ShaderMaterial({uniforms:seaUniforms,vertexShader:'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv; uniform float time; void main(){float w=sin(vUv.y*260.+sin(vUv.x*45.+time*.2)*2.-time*.5)*.5+.5; float glint=pow(max(0.,1.-abs(vUv.x-.4)*7.),8.)*pow(w,12.); vec3 c=mix(vec3(.045,.15,.2),vec3(.14,.33,.37),w*.35); c+=vec3(.23,.43,.43)*glint; gl_FragColor=vec4(c,1.);}' });assets.add(seaMat);
  const sea=mesh(new THREE.PlaneGeometry(70,35),seaMat);sea.rotation.x=-Math.PI/2;sea.position.set(0,-.55,-20);
  const farLand=[];for(let i=0;i<12;i++) farLand.push({p:[-30+i*5,rand()*.3-1,-23-rand()*4],s:[6,2+rand()*1.5,2],r:[0,rand(),0]});instanced(boxG,material('#13303b',0,1),farLand);

  // Centerpiece: tide computer, a marine armillary sphere in engraved brass.
  const astrolabe=new THREE.Group();scene.add(astrolabe);astrolabe.position.set(0,0,.1);
  cyl(2.25,.25,0,.18,0,mats.darkStone,astrolabe);cyl(2.13,.07,0,.35,0,mats.brass,astrolabe);
  cyl(1.45,.16,0,1.14,0,mats.wood,astrolabe);cyl(1.5,.065,0,1.25,0,mats.brass,astrolabe);
  for(let a=0;a<4;a++){const r=a*Math.PI/2+Math.PI/4;cyl(.12,.85,Math.cos(r)*1.12,.69,Math.sin(r)*1.12,mats.patina,astrolabe);ball(.18,Math.cos(r)*1.12,.32,Math.sin(r)*1.12,mats.brass,astrolabe);}
  cyl(.75,.18,0,1.38,0,mats.patina,astrolabe);cyl(.52,.3,0,1.59,0,mats.brass,astrolabe);cyl(.25,.35,0,1.86,0,mats.patina,astrolabe);
  const sphereGroup=new THREE.Group();sphereGroup.position.y=2.8;astrolabe.add(sphereGroup);
  const outer=ring(1.33,.085,mats.brass,sphereGroup);outer.rotation.y=.25;
  const middle=ring(1.14,.065,mats.patina,sphereGroup);middle.rotation.set(.65,.8,.4);
  const inner=ring(.93,.045,mats.gold,sphereGroup);inner.rotation.set(1.35,-.35,.2);
  const equator=ring(1.46,.035,mats.gold,sphereGroup);equator.rotation.set(Math.PI/2,.2,.1);
  const starCore=ball(.39,0,0,0,mats.cyan,sphereGroup);starCore.material=material('#2f929c',.6,.2,{emissive:'#287985',emissiveIntensity:.6});
  cyl(.045,2.9,0,2.8,0,mats.brass,astrolabe);ball(.12,0,4.3,0,mats.gold,astrolabe);
  const tickData=[];for(let i=0;i<48;i++){const a=i/48*Math.PI*2;tickData.push({p:[Math.cos(a)*1.33,Math.sin(a)*1.33,0],s:[i%4===0?.11:.065,.018,.028],r:[0,0,a]});}instanced(boxG,mats.gold,tickData,sphereGroup);
  const controlDial=cyl(.34,.08,.88,1.38,.6,mats.brass,astrolabe);controlDial.rotation.z=.16;
  for(let i=0;i<3;i++){const dial=cyl(.14,.07,-.55+i*.38,1.4,.9,mats.patina,astrolabe);dial.rotation.x=.1;}
  const floorCompass=[];for(let i=0;i<16;i++){let a=i/16*Math.PI*2;floorCompass.push({p:[Math.sin(a)*1.9,.38,Math.cos(a)*1.9],s:[.035,.015,i%4===0?.35:.16],r:[0,a,0]});}instanced(boxG,mats.brass,floorCompass,astrolabe);

  // Desk, paper letter, ink and a nautical chart.
  const desk=new THREE.Group();desk.position.set(-3.7,0,1.25);desk.rotation.y=-.18;scene.add(desk);
  box(2.3,.16,1.3,0,1.25,0,mats.wood,desk);box(2.4,.045,1.4,0,1.36,0,mats.brass,desk);
  for(const x of [-.94,.94])for(const z of [-.46,.46])cyl(.065,1.18,x,.62,z,mats.patina,desk);
  box(1.95,.3,.92,0,1.03,0,mats.wood,desk);ball(.045,0,1.03,.49,mats.gold,desk);
  const letter=box(.68,.012,.9,-.18,1.4,.15,mats.paper,desk);letter.rotation.y=.15;
  cyl(.12,.16,.6,1.48,.22,mats.iron,desk);line([[.6,1.55,.22],[.64,1.85,.25],[.82,2.02,.29]],mats.gold,.018,desk);
  const chartTex=canvasTexture((c,s)=>{c.fillStyle='#b5b59d';c.fillRect(0,0,s,s);c.strokeStyle='#476268';for(let i=0;i<12;i++){c.beginPath();c.moveTo(0,i*48);c.bezierCurveTo(100,i*48-80,300,i*48+40,512,i*48-20);c.stroke();}c.beginPath();c.arc(260,240,120,0,Math.PI*2);c.moveTo(140,240);c.lineTo(380,240);c.moveTo(260,120);c.lineTo(260,360);c.stroke();});
  const chart=box(.6,.012,.5,.55,1.4,-.33,material('#fff',0,.9,{map:chartTex}),desk);chart.rotation.y=-.2;
  cyl(.13,.07,-.82,1.45,-.27,mats.brass,desk);cyl(.025,.55,-.82,1.73,-.27,mats.brass,desk);const shade=mesh(new THREE.ConeGeometry(.3,.3,32,1,true),mats.patina,desk);shade.position.set(-.82,2,-.27);ball(.08,-.82,1.87,-.27,mats.warm,desk);
  const deskLamp=new THREE.PointLight('#ffc785',13,5,2);deskLamp.position.set(-.82,1.9,-.27);desk.add(deskLamp);

  // A small tide casket rests on a low archive cabinet.
  const vault=new THREE.Group();vault.position.set(-4.2,0,-3.2);vault.rotation.y=.25;scene.add(vault);
  box(1.95,1.02,1.04,0,.64,0,mats.wood,vault);box(2.08,.12,1.14,0,1.21,0,mats.brass,vault);
  for(const x of [-.47,.47]){box(.87,.78,.065,x,.65,.55,mats.walnut,vault);ball(.045,x*.25,.72,.61,mats.brass,vault);}
  const vaultFeet=[{p:[-.78,.12,.38],s:[.18,.24,.18]},{p:[.78,.12,.38],s:[.18,.24,.18]},{p:[-.78,.12,-.38],s:[.18,.24,.18]},{p:[.78,.12,-.38],s:[.18,.24,.18]}];instanced(boxG,mats.iron,vaultFeet,vault);
  box(1.36,.5,.8,0,1.54,0,mats.patina,vault);box(1.42,.055,.86,0,1.3,0,mats.brass,vault);
  box(1.2,.39,.035,0,1.54,.42,mats.brass,vault);box(1.1,.31,.035,0,1.54,.45,mats.darkStone,vault);
  const safeDoor=new THREE.Group();safeDoor.position.set(0,1.8,-.4);vault.add(safeDoor);
  box(1.44,.09,.86,0,0,.4,mats.patina,safeDoor);box(1.48,.025,.9,0,-.045,.4,mats.brass,safeDoor);
  const crest=ring(.22,.025,mats.gold,safeDoor);crest.rotation.x=Math.PI/2;crest.position.set(0,.055,.4);
  for(let i=0;i<3;i++){const dial=cyl(.115,.07,-.32+i*.32,1.56,.5,mats.brass,vault);dial.rotation.x=Math.PI/2;const groove=box(.018,.13,.01,-.32+i*.32,1.56,.54,mats.dark,vault);}
  const clasp=box(.14,.18,.035,0,1.38,.5,mats.gold,vault);ball(.028,0,1.36,.53,mats.dark,vault);
  for(const x of [-.59,.59]){box(.065,.54,.82,x,1.55,0,mats.brass,vault);}
  const shelves=new THREE.Group();shelves.position.set(-5.91,0,-.85);shelves.rotation.y=Math.PI/2;scene.add(shelves);
  box(2.4,3.0,.5,0,1.52,0,mats.wood,shelves);box(2.18,2.8,.44,0,1.52,.08,mats.dark,shelves);
  for(let y=.32;y<3;y+=.72)box(2.4,.08,.68,0,y,.15,mats.wood,shelves);
  const bookMats=[material('#4a6972'),material('#8b6245'),material('#436058'),material('#b29465')];const books=[[],[],[],[]];
  for(let row=0;row<4;row++)for(let i=0;i<11;i++){const h=.32+rand()*.23;books[i%4].push({p:[-.99+i*.19,.38+row*.72+h/2,.2],s:[.13+rand()*.035,h,.39],r:[0,0,(rand()-.5)*.08]});}books.forEach((t,i)=>instanced(boxG,bookMats[i],t,shelves));

  // Lantern projector aimed at a sea chart on the rear wall.
  const projector=new THREE.Group();projector.position.set(3.6,0,.8);projector.rotation.y=-.45;scene.add(projector);
  cyl(.93,.18,0,.18,0,mats.darkStone,projector);cyl(.42,1.05,0,.8,0,mats.patina,projector);cyl(.75,.09,0,1.36,0,mats.brass,projector);
  box(.95,.7,.65,0,1.82,0,mats.iron,projector);box(1.04,.08,.72,0,2.2,0,mats.brass,projector);box(1.04,.08,.72,0,1.45,0,mats.brass,projector);
  const barrel=cyl(.26,.5,0,1.84,-.5,mats.patina,projector);barrel.rotation.x=Math.PI/2;
  const lensMount=ring(.26,.045,mats.brass,projector);lensMount.position.set(0,1.84,-.78);
  const lensGlass=mesh(new THREE.CircleGeometry(.22,40),mats.cyan,projector);lensGlass.position.set(0,1.84,-.8);lensGlass.rotation.y=Math.PI;
  for(const x of [-.35,.35]){const gear=ring(.19,.045,mats.brass,projector);gear.position.set(x,1.85,.36);}
  const projectionBeam=mesh(new THREE.ConeGeometry(1.2,5.1,40,1,true),new THREE.MeshBasicMaterial({color:'#81dce6',transparent:true,opacity:.025,side:THREE.DoubleSide,depthWrite:false}));assets.add(projectionBeam.material);projectionBeam.position.set(3.25,2.25,-2);projectionBeam.rotation.x=-Math.PI/2;projectionBeam.visible=false;
  const projectionGraphic=new THREE.Group();projectionGraphic.position.set(3.5,3,-5.5);scene.add(projectionGraphic);projectionGraphic.visible=false;
  const projectionMat=new THREE.MeshBasicMaterial({color:'#93f3e8',transparent:true,opacity:.8});assets.add(projectionMat);
  for(let i=0;i<3;i++){const pr=ring(.38+i*.24,.012,projectionMat,projectionGraphic);pr.rotation.z=i*.3;}
  const pLine=line([[-.9,-.5,0],[-.4,.25,0],[.1,-.15,0],[.55,.65,0],[.9,.1,0]],projectionMat,.015,projectionGraphic);
  [[-.9,-.5],[-.4,.25],[.1,-.15],[.55,.65],[.9,.1]].forEach(([x,y])=>ball(.045,x,y,0,projectionMat,projectionGraphic));

  // Sealed circular archive door.
  const doorGroup=new THREE.Group();doorGroup.position.set(0,0,-5.54);scene.add(doorGroup);
  box(2.2,4.4,.2,0,2.25,0,mats.iron,doorGroup);box(1.88,4.1,.15,0,2.25,.15,mats.wood,doorGroup);
  for(const x of [-1.06,1.06])box(.1,4.5,.22,x,2.25,.23,mats.brass,doorGroup);
  box(2.2,.12,.22,0,4.5,.23,mats.brass,doorGroup);
  const doorMechanism=new THREE.Group();doorMechanism.position.set(0,2.65,.3);doorGroup.add(doorMechanism);
  ring(.69,.08,mats.brass,doorMechanism);ring(.51,.03,mats.patina,doorMechanism);
  const doorCenter=mesh(new THREE.CircleGeometry(.45,48),mats.darkStone,doorMechanism);doorCenter.position.z=.015;
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const spoke=box(.025,.46,.06,Math.sin(a)*.27,Math.cos(a)*.27,.05,mats.gold,doorMechanism);spoke.rotation.z=-a;}
  ball(.13,0,0,.1,mats.cyan,doorMechanism);
  box(.05,1.05,.06,0,1.1,.3,mats.brass,doorGroup);
  const doorGlow=new THREE.PointLight('#71cce6',0,7,2);doorGlow.position.set(0,2,-4.9);scene.add(doorGlow);
  const plaqueTexture=canvasTexture((c,s)=>{c.fillStyle='#1b3940';c.fillRect(0,0,s,s);c.strokeStyle='#b29662';c.lineWidth=8;c.strokeRect(20,130,472,250);c.fillStyle='#d3be89';c.textAlign='center';c.font='28px Georgia';c.fillText('ARCHIVIO',s/2,240);c.font='20px Georgia';c.fillText('DELLE MAREE',s/2,282);});
  const plaque=mesh(new THREE.PlaneGeometry(1.48,1.48),material('#fff',.1,.7,{map:plaqueTexture}));plaque.position.set(0,5.2,-5.48);

  // Small material cues ground the scale: jars, coils and a rain-wet apron.
  const crate=box(1.1,.65,.8,4.7,.35,-3.7,mats.wood);crate.rotation.y=.15;
  for(let i=0;i<3;i++){cyl(.14,.4,4.4+i*.25,.9,-3.7,mats.glass);cyl(.14,.04,4.4+i*.25,1.12,-3.7,mats.brass);}
  const rope=ring(.36,.04,mats.walnut);rope.rotation.x=Math.PI/2;rope.position.set(4.9,.14,2.1);
  for(let i=0;i<2;i++){const bottle=cyl(.09,.35,-2.8+i*.25,.2,-4.7,mats.glass);}
  // Floating sea mist/dust uses one draw call and no per-frame allocations.
  const particlePos=new Float32Array(165*3);for(let i=0;i<165;i++){particlePos[i*3]=(rand()-.5)*12;particlePos[i*3+1]=.4+rand()*6;particlePos[i*3+2]=(rand()-.5)*10;}
  const particleGeo=new THREE.BufferGeometry();particleGeo.setAttribute('position',new THREE.BufferAttribute(particlePos,3));assets.add(particleGeo);
  const particlesMat=new THREE.PointsMaterial({color:'#b4dfd3',size:.022,transparent:true,opacity:.38,depthWrite:false});assets.add(particlesMat);const particles=new THREE.Points(particleGeo,particlesMat);scene.add(particles);

  const hotspots = [
    {id:'letter',target:new THREE.Vector3(-3.7,1.7,1.25),camera:new THREE.Vector3(-2.3,3.2,4.35),objects:[desk]},
    {id:'safe',target:new THREE.Vector3(-4.2,1.65,-3.2),camera:new THREE.Vector3(-1.7,2.8,.4),objects:[vault]},
    {id:'projector',target:new THREE.Vector3(3.6,1.9,.8),camera:new THREE.Vector3(6.1,3.5,4.7),objects:[projector]},
    {id:'astrolabe',target:new THREE.Vector3(0,2.8,.1),camera:new THREE.Vector3(3.8,4.5,5.5),objects:[astrolabe]},
    {id:'door',target:new THREE.Vector3(0,2.7,-5.4),camera:new THREE.Vector3(2,3.5,-.4),objects:[doorGroup]},
  ];
  hotspots.forEach(h=>h.objects.forEach(root=>root.traverse(o=>{o.userData.hotspot=h.id;})));
  const clickable=hotspots.flatMap(h=>h.objects);const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();
  const overviewPos=new THREE.Vector3(8.4,7.1,12.4),overviewTarget=new THREE.Vector3(0,2.4,-.8);
  const desiredPos=overviewPos.clone(),desiredTarget=overviewTarget.clone(),lookAt=overviewTarget.clone();camera.position.copy(overviewPos);camera.lookAt(lookAt);
  let selected=null,interactive=true,activePointer=null,dragging=false,downX=0,downY=0,lastX=0,lastY=0,frame=0,disposed=false,previous=0,time=0;
  let orbitYaw=0,orbitPitch=0,zoom=1,focusYaw=0,focusPitch=0,lensEnabled=false;
  const progress={letter:false,safe:false,lens:false,projection:false,astrolabe:false,door:false};
  let reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function updateOverview(){const offset=overviewPos.clone().sub(overviewTarget);const sph=new THREE.Spherical().setFromVector3(offset);sph.theta+=orbitYaw;sph.phi+=orbitPitch;sph.radius*=zoom;desiredPos.copy(overviewTarget).add(new THREE.Vector3().setFromSpherical(sph));desiredTarget.copy(overviewTarget);}
  function updateFocusedCamera(){const h=hotspots.find(h=>h.id===selected);if(!h)return;const sph=new THREE.Spherical().setFromVector3(h.camera.clone().sub(h.target));sph.theta+=focusYaw;sph.phi+=focusPitch;desiredPos.copy(h.target).add(new THREE.Vector3().setFromSpherical(sph));desiredTarget.copy(h.target);}
  function onPointerDown(e){if(!interactive || e.button>0)return;activePointer=e.pointerId;downX=lastX=e.clientX;downY=lastY=e.clientY;dragging=false;renderer.domElement.setPointerCapture?.(e.pointerId);}
  function onPointerMove(e){if(!interactive)return;if(activePointer===e.pointerId){const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(e.clientX-downX)+Math.abs(e.clientY-downY)>7)dragging=true;if(dragging){if(selected){focusYaw=THREE.MathUtils.clamp(focusYaw-dx*.003,-.35,.35);focusPitch=THREE.MathUtils.clamp(focusPitch-dy*.002,-.12,.15);updateFocusedCamera();}else{orbitYaw=THREE.MathUtils.clamp(orbitYaw-dx*.003,-.65,.65);orbitPitch=THREE.MathUtils.clamp(orbitPitch-dy*.002,-.12,.2);updateOverview();}}lastX=e.clientX;lastY=e.clientY;}else{const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);renderer.domElement.style.cursor=raycaster.intersectObjects(clickable,true).length?'pointer':'grab';}}
  function onPointerUp(e){if(activePointer!==e.pointerId)return;activePointer=null;if(dragging||!interactive)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(clickable,true)[0];if(hit)onSelect(hit.object.userData.hotspot);}
  function onPointerCancel(){activePointer=null;dragging=false;}
  function onWheel(e){if(!interactive || selected)return;e.preventDefault();zoom=THREE.MathUtils.clamp(zoom+e.deltaY*.0005,.74,1.15);updateOverview();}
  renderer.domElement.addEventListener('pointerdown',onPointerDown);renderer.domElement.addEventListener('pointermove',onPointerMove);renderer.domElement.addEventListener('pointerup',onPointerUp);renderer.domElement.addEventListener('pointercancel',onPointerCancel);renderer.domElement.addEventListener('wheel',onWheel,{passive:false});
  function resize(){const w=container.clientWidth||window.innerWidth,h=container.clientHeight||window.innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<.8?62:45;camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  function render(ts){if(disposed)return;frame=requestAnimationFrame(render);if(document.hidden){previous=ts;return;}const dt=Math.min((ts-previous)/1000,.05);previous=ts;time+=dt;const ease=reduced?1:1-Math.exp(-dt*5);camera.position.lerp(desiredPos,ease);lookAt.lerp(desiredTarget,ease);camera.lookAt(lookAt);if(!reduced)seaUniforms.time.value=time;
    if(!reduced){particles.rotation.y=Math.sin(time*.025)*.025;inner.rotation.z=.2+Math.sin(time*.15)*.035;if(progress.astrolabe){middle.rotation.y+=dt*.12;equator.rotation.z+=dt*.08;}starCore.material.emissiveIntensity=.65+Math.sin(time*1.6)*.08;}
    const doorOpen=progress.door?-.75:0;doorGroup.rotation.y=THREE.MathUtils.lerp(doorGroup.rotation.y,doorOpen,ease*.4);safeDoor.rotation.x=THREE.MathUtils.lerp(safeDoor.rotation.x,progress.safe?-1.12:0,ease);
    renderer.render(scene,camera);
  }frame=requestAnimationFrame(render);

  return {
    focus(id){const h=hotspots.find(h=>h.id===id);if(!h)return;selected=id;focusYaw=focusPitch=0;desiredPos.copy(h.camera);desiredTarget.copy(h.target);},
    overview(){selected=null;updateOverview();},
    setInteractive(value){interactive=!!value;activePointer=null;renderer.domElement.style.cursor=value?'grab':'default';},
    setQuality(value){renderer.setPixelRatio(Math.min(devicePixelRatio,value==='low'?1:1.7));renderer.shadowMap.enabled=value!=='low';resize();},
    setMotion(value){reduced=!!value||matchMedia('(prefers-reduced-motion: reduce)').matches;},
    setProgress(next){Object.assign(progress,next);projectionBeam.visible=projectionGraphic.visible=!!progress.projection;doorGlow.intensity=progress.door?24:0;tableLight.intensity=progress.astrolabe?35:20;lensGlass.visible=!!progress.lens;},
    setLens(enabled){lensEnabled=!!enabled;scene.fog.color.set(enabled?'#164b56':'#123441');renderer.toneMappingExposure=enabled?1.65:1.35;projectionGraphic.visible=!!progress.projection||lensEnabled;projectionGraphic.children.forEach(o=>{if(o.material===projectionMat)o.material.opacity=enabled?1:.8;});},
    resize,
    getHotspots(){const p=new THREE.Vector3();return hotspots.map(h=>{p.copy(h.target);p.y+=h.id==='astrolabe'?1.25:.4;p.project(camera);return{id:h.id,x:(p.x+1)/2,y:(1-p.y)/2,visible:p.z<1&&p.z>-1&&Math.abs(p.x)<.96&&Math.abs(p.y)<.96};});},
    getDiagnostics(){return{drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,selected,interactive,webgl:!!renderer.getContext(),progress:{...progress}};},
    dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();renderer.domElement.removeEventListener('pointerdown',onPointerDown);renderer.domElement.removeEventListener('pointermove',onPointerMove);renderer.domElement.removeEventListener('pointerup',onPointerUp);renderer.domElement.removeEventListener('pointercancel',onPointerCancel);renderer.domElement.removeEventListener('wheel',onWheel);assets.forEach(a=>a.dispose());ownedTextures.forEach(t=>t.dispose());environment.dispose();renderer.dispose();renderer.domElement.remove();},
  };
}
