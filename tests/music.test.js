import test from 'node:test';import assert from 'node:assert/strict';import {access} from 'node:fs/promises';
import {musicFor,TRACKS,createMusic} from '../src/music.js';
test('music follows chapters, battles and the final boss',()=>{
 for(const [stage,key] of [[1,'meadow'],[29,'meadow'],[31,'crystal'],[61,'stars'],[10,'boss'],[100,'final']])assert.equal(musicFor('game',{stage,phase:'battle'}),key);
 assert.equal(musicFor('game',{stage:30,phase:'capture'}),'meadow');assert.equal(musicFor('home',{stage:100,phase:'battle'}),'home');
});
test('all approved music and cue assets ship',async()=>{for(const [file] of Object.values(TRACKS))await access(new URL(`../assets/music/${file}.m4a`,import.meta.url));});
test('music does not create audio before a gesture and remembers mute',()=>{
 let creations=0,value='off';const storage={getItem:()=>value,setItem:(k,v)=>value=v};const events={};
 const host={addEventListener(){},AudioContext:class{constructor(){creations++;throw Error('not allowed before gesture');}}};
 const music=createMusic({host,doc:{hidden:false,addEventListener:(k,f)=>events[k]=f},storage});
 music.sync('game',{stage:1,phase:'battle',party:[{id:'one'}]});assert.equal(creations,0);assert.equal(music.enabled,false);
 music.toggle();assert.equal(value,'on');music.toggle();assert.equal(value,'off');assert.equal(music.enabled,false);
});
test('rapid renders start one current track and backgrounding suspends audio',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)});
 let starts=0,suspended=0;const events={};const doc={hidden:false,addEventListener:(k,f)=>events[k]=f};
 const param=()=>({value:1,cancelScheduledValues(){},setValueAtTime(){},linearRampToValueAtTime(){},setTargetAtTime(){}});
 class Context{currentTime=0;destination={};createGain(){return {gain:param(),connect(){},disconnect(){}};}createBufferSource(){return {connect(){},disconnect(){},start(){starts++;},stop(){}};}async resume(){}async suspend(){suspended++;}async decodeAudioData(){return {duration:50};}}
 try{const music=createMusic({host:{AudioContext:Context,addEventListener(){}},doc});const game={stage:1,phase:'battle',party:[{id:'one'}]};music.sync('game',game);await music.unlock();for(let i=0;i<5;i++)music.sync('game',game);await new Promise(r=>setImmediate(r));assert.equal(starts,1);doc.hidden=true;events.visibilitychange();assert.equal(suspended,1);doc.hidden=false;events.visibilitychange();await new Promise(r=>setImmediate(r));assert.equal(starts,1);}finally{globalThis.fetch=original;}
});

test('effects duck a shared music bus without altering track fades; mute cancels pending sounds',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)});
 const gains=[],sources=[],events={};let ctx;
 const param=()=>({value:1,calls:[],cancelScheduledValues(t){this.calls.push(['cancel',t]);},setValueAtTime(v,t){this.calls.push(['set',v,t]);},linearRampToValueAtTime(v,t){this.calls.push(['ramp',v,t]);},setTargetAtTime(){}});
 class Context{constructor(){ctx=this;}currentTime=0;destination={};createGain(){const g={gain:param(),connect(to){this.to=to;},disconnect(){}};gains.push(g);return g;}createBufferSource(){const s={connect(to){this.to=to;},disconnect(){},start(){this.started=true;},stop(){this.stopped=true;}};sources.push(s);return s;}async resume(){}async suspend(){}async decodeAudioData(){return {duration:50};}}
 const doc={hidden:false,addEventListener:(k,f)=>events[k]=f};const flush=()=>new Promise(r=>setImmediate(r));
 try{
  const music=createMusic({host:{AudioContext:Context,addEventListener(){}},doc});const game={stage:9,phase:'battle',party:[{id:'one'}]};music.sync('game',game);await music.unlock();await flush();
  const master=gains[0],duck=gains[1],track=sources.find(s=>s.loop).to;assert.equal(track.to,duck);assert.equal(duck.to,master);
  await music.cue('click');assert.equal(duck.gain.calls.length,0);
  await music.cue('boss-clear');const fadeCalls=track.gain.calls.length;ctx.currentTime=.3;await music.cue('hit');
  assert.equal(track.gain.calls.length,fadeCalls);assert.equal(duck.gain.calls.filter(c=>c[0]==='set').at(-1)[1],.22);
  game.stage=10;music.sync('game',game);await flush();assert.equal(sources.filter(s=>s.loop).at(-1).to.to,duck);
  ctx.currentTime=.4;await music.cue('click');assert.equal(duck.gain.calls.at(-1)[1],1);assert.ok(duck.gain.calls.at(-1)[2]>=4.5);
  const pending=music.cue('slash');music.toggle();await pending;assert.ok(sources.filter(s=>!s.loop).every(s=>s.stopped));assert.equal(duck.gain.calls.at(-1)[1],1);
  music.toggle();await flush();doc.hidden=true;events.visibilitychange();assert.equal(duck.gain.calls.at(-1)[1],1);
 }finally{globalThis.fetch=original;}
});

test('approved effects ship and reward sounds match their stats',async()=>{
 const {EFFECTS,rewardSound,levelAt}=await import('../src/sound-effects.js');
 assert.equal(Object.keys(EFFECTS).length,12);for(const p of Object.values(EFFECTS))await access(new URL(`../assets/sfx/${p.file}.m4a`,import.meta.url));
 assert.equal(rewardSound('attack'),'attack-up');assert.equal(rewardSound('shards'),'shield-up');assert.equal(rewardSound('heal'),'hp-up');
 const events=[{key:'boss-clear',at:0},{key:'click',at:1},{key:'hit',at:1}];assert.equal(levelAt(1.1,events,EFFECTS),.22);assert.equal(levelAt(5,events,EFFECTS),1);
});

test('WebKit audio fallback works and unavailable audio never blocks gameplay',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>({ok:false});let made=0,resumed=0;
 const doc={hidden:false,addEventListener(){}};
 class WebKitContext{constructor(){made++;}currentTime=0;destination={};createGain(){return {gain:{value:1},connect(){}};}async resume(){resumed++;}}
 try{
  const audio=createMusic({host:{webkitAudioContext:WebKitContext,addEventListener(){}},doc});audio.sync('home',null);assert.equal(made,0);await audio.unlock();await audio.cue('click');assert.equal(made,1);assert.equal(resumed,1);
  const unsupported=createMusic({host:{addEventListener(){}},doc});await unsupported.unlock();await unsupported.cue('hit');unsupported.sync('home',null);assert.equal(unsupported.enabled,true);
 }finally{globalThis.fetch=original;}
});
