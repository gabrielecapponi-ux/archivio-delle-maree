export function createAudio() {
  let ctx,master,enabled=false,ambient,filter,volume=.5,chapter=1;
  function init(){
    if(ctx)return;
    const AudioContext=window.AudioContext||window.webkitAudioContext;
    if(!AudioContext)return;
    ctx=new AudioContext(); master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
    const length=ctx.sampleRate*4,buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);let last=0;
    for(let i=0;i<length;i++){last=(last+Math.random()*.04-.02)/1.02;data[i]=last;}
    ambient=ctx.createBufferSource();ambient.buffer=buffer;ambient.loop=true;
    filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=chapter===2?280:500;
    const ambienceGain=ctx.createGain();ambienceGain.gain.value=.45;ambient.connect(filter).connect(ambienceGain).connect(master);ambient.start();
    for(const frequency of [110,164.81,220.2]){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=frequency;g.gain.value=.008;o.connect(g).connect(master);o.start();}
  }
  function toggle(){init();if(!ctx)return false;enabled=!enabled;ctx.resume().catch(()=>{});master.gain.setTargetAtTime(enabled?volume:0,ctx.currentTime,.2);return enabled;}
  function tone(frequency=400,length=.08,delay=0){if(!ctx||!enabled)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(.08,ctx.currentTime+delay);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+delay+length);o.connect(g).connect(master);o.start(ctx.currentTime+delay);o.stop(ctx.currentTime+delay+length);}
  function visibility(){if(ctx)master.gain.setTargetAtTime(enabled&&!document.hidden?volume:0,ctx.currentTime,.15);}
  document.addEventListener('visibilitychange',visibility);
  return {toggle,setVolume(value){volume=Math.min(1,Math.max(0,value));if(ctx)master.gain.setTargetAtTime(enabled?volume:0,ctx.currentTime,.15);},setChapter(value){chapter=value;if(filter)filter.frequency.setTargetAtTime(chapter===2?280:500,ctx.currentTime,.6);},note:frequency=>tone(frequency,.7),tick:()=>tone(280,.06),success:()=>[440,554.37,659.25].forEach((f,i)=>tone(f,.8,i*.12)),dispose(){document.removeEventListener('visibilitychange',visibility);ctx?.close();}};
}
