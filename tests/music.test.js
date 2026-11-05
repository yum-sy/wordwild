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
