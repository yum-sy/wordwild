import {EFFECTS,levelAt} from './sound-effects.js';
export const TRACKS={home:['01-home-first-adventure',88],meadow:['02-meadow-little-steps',104],crystal:['03-crystal-hidden-path',90],stars:['04-stars-brave-journey',102],boss:['05-boss-dragon-dance',124],final:['06-final-crown-of-light',116],victory:['07-victory'],caught:['08-caught'],awakening:['09-awakening']};
export function musicFor(view,game){if(view!=='game'||!game||['clear','game-over'].includes(game.phase))return 'home';if(game.phase==='battle'&&game.stage%10===0)return game.stage===100?'final':'boss';return game.stage<=30?'meadow':game.stage<=60?'crystal':'stars';}
export function createMusic({host=window,doc=document,storage,onChange=()=>{}}={}){
 let enabled=true;try{enabled=storage?.getItem('wordwild-music')!=='off';}catch{}
 let ctx,master,duck,bg,cueSource,desired='home',generation=0,unlocked=false,previous=null,loading=null;
 const cache=new Map(),effects=new Set();let duckEvents=[],audioEpoch=0;
 function context(){if(!ctx){const AudioContext=host.AudioContext||host.webkitAudioContext;if(!AudioContext)return null;ctx=new AudioContext();master=ctx.createGain();master.gain.value=enabled?.55:0;master.connect(ctx.destination);duck=ctx.createGain();duck.connect(master);}return ctx;}
 function stop(node,fade=.45){if(!node)return;const now=ctx.currentTime;node.gain.gain.cancelScheduledValues(now);node.gain.gain.setValueAtTime(node.gain.gain.value,now);node.gain.gain.linearRampToValueAtTime(0,now+fade);try{node.source.stop(now+fade+.03);}catch{}}
 async function buffer(key){if(!cache.has(key)){const url=new URL(EFFECTS[key]?`../assets/sfx/${EFFECTS[key].file}.m4a`:`../assets/music/${TRACKS[key][0]}.m4a`,import.meta.url);cache.set(key,fetch(url).then(r=>{if(!r.ok)throw new Error('Audio unavailable');return r.arrayBuffer();}).then(b=>ctx.decodeAudioData(b)).catch(e=>{cache.delete(key);throw e;}));}return cache.get(key);}
 async function play(){if(!enabled||!unlocked||doc.hidden||!context())return;if(bg?.key===desired||loading?.key===desired)return;const key=desired,ticket=++generation;loading={key,ticket};try{const data=await buffer(key);if(ticket!==generation||!enabled||doc.hidden)return;const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=data;source.loop=true;source.loopEnd=Math.min(data.duration,64*60/TRACKS[key][1]);source.connect(gain);gain.connect(duck);gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(.43,ctx.currentTime+.7);stop(bg);bg={source,gain,key};source.start();source.onended=()=>{source.disconnect();gain.disconnect();};}catch{/* Gameplay remains usable if audio is unavailable. */}finally{if(loading?.ticket===ticket)loading=null;}}
 function attenuate(key,duration){
  const now=ctx.currentTime;
  duckEvents=duckEvents.filter(e=>now<e.at+e.policy.duration+e.policy.release);
  const policy=EFFECTS[key]||{level:.34,attack:.035,release:.6,duration};
  if(policy.level===1)return;
  const policies=Object.fromEntries(duckEvents.map(e=>[e.key,e.policy]));policies[key]=policy;
  const before=levelAt(now,duckEvents,policies);
  duckEvents.push({at:now,key,policy});
  const end=Math.max(...duckEvents.map(e=>e.at+e.policy.duration+e.policy.release));
  const param=duck.gain;param.cancelScheduledValues(now);param.setValueAtTime(before,now);
  for(let t=now+.02;t<end;t+=.02)param.linearRampToValueAtTime(levelAt(t,duckEvents,policies),t);
  param.linearRampToValueAtTime(1,end);
 }
 function clearEffects(){audioEpoch++;for(const node of effects)stop(node,0);effects.clear();cueSource=null;duckEvents=[];if(duck){duck.gain.cancelScheduledValues(ctx.currentTime);duck.gain.setValueAtTime(1,ctx.currentTime);}}
 async function cue(key){
  if(!enabled||!unlocked||doc.hidden||!context()||(!EFFECTS[key]&&!TRACKS[key]))return;
  const ticket=audioEpoch,requested=ctx.currentTime;
  try{const data=await buffer(key);if(!enabled||doc.hidden||ticket!==audioEpoch||ctx.currentTime-requested>.35)return;
   if(effects.size>=12)return;
   if(!EFFECTS[key])stop(cueSource,.08);
   const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=data;gain.gain.value=EFFECTS[key]?.65:.7;
   source.connect(gain);gain.connect(master);const node={source,gain};effects.add(node);if(!EFFECTS[key])cueSource=node;
   attenuate(key,data.duration);source.start();source.onended=()=>{effects.delete(node);source.disconnect();gain.disconnect();};
  }catch{/* Missing sound never interrupts play. */}
 }
 function sync(view,game){const next=musicFor(view,game),state=game?`${game.party[0].id}:${game.stage}:${game.phase}`:view;const prior=previous;previous={state,phase:game?.phase,view};if(next!==desired){desired=next;generation++;play();}else if(!bg)play();if(prior&&prior.state!==state&&view==='game'){if(game?.phase==='capture'&&prior.phase==='battle')cue(game.stage%10===0?'boss-clear':'victory');if(game?.phase==='evolution')cue('awakening');}}
 async function unlock(){unlocked=true;if(!enabled||doc.hidden)return;try{if(context()){await ctx.resume();play();for(const key of [...Object.keys(EFFECTS),'victory','caught','awakening'])buffer(key).catch(()=>{});}}catch{}}
 function toggle(){enabled=!enabled;generation++;loading=null;try{storage?.setItem('wordwild-music',enabled?'on':'off');}catch{}if(!enabled){stop(bg,.15);bg=null;clearEffects();if(master)master.gain.setTargetAtTime(0,ctx.currentTime,.03);}else{if(master)master.gain.setTargetAtTime(.55,ctx.currentTime,.05);unlock();}onChange();}
 doc.addEventListener('visibilitychange',()=>{generation++;loading=null;if(doc.hidden){clearEffects();ctx?.suspend().catch(()=>{});}else if(enabled&&unlocked){ctx?.resume().then(()=>play()).catch(()=>{});}});
 host.addEventListener('pagehide',()=>{generation++;loading=null;clearEffects();ctx?.suspend().catch(()=>{});});
 host.addEventListener('pageshow',()=>{if(enabled&&unlocked&&!doc.hidden)unlock();});
 return {get enabled(){return enabled;},sync,unlock,toggle,cue};
}
