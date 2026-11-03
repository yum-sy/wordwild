import test from 'node:test';
import assert from 'node:assert/strict';
import { createBattleSequence } from '../src/battle-sequence.js';
function clock(){let time=0,id=0;const jobs=new Map();return {now:()=>time,setTimer(fn,ms){jobs.set(++id,{fn,at:time+ms});return id;},clearTimer(id){jobs.delete(id);},tick(ms){const until=time+ms;for(;;){const next=[...jobs].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>until)break;time=next[1].at;jobs.delete(next[0]);next[1].fn();}time=until;}};}
test('answer animation gates input until the hit has landed and settled',()=>{
 const c=clock(),seen=[];let done=0;const turn=createBattleSequence({...c,onFrame:f=>seen.push(f),onDone:()=>done++});
 assert.equal(turn.start(),true);assert.equal(turn.start(),false);assert.deepEqual(seen,['cue']);
 c.tick(400);assert.deepEqual(seen,['cue','cast']);assert.equal(done,0);
 c.tick(549);assert.equal(seen.at(-1),'cast');c.tick(1);assert.equal(seen.at(-1),'impact');
 c.tick(600);assert.equal(seen.at(-1),'settle');assert.ok(turn.running);
 c.tick(649);assert.equal(done,0);c.tick(1);assert.equal(done,1);assert.equal(turn.running,false);
 c.tick(10000);assert.equal(done,1);
});
test('hidden tabs pause the remaining animation instead of skipping the attack',()=>{
 const c=clock(),seen=[];let done=0;const turn=createBattleSequence({...c,onFrame:f=>seen.push(f),onDone:()=>done++});
 turn.start();c.tick(200);turn.pause();c.tick(10000);assert.deepEqual(seen,['cue']);assert.equal(done,0);
 turn.resume();c.tick(199);assert.equal(seen.at(-1),'cue');c.tick(1);assert.equal(seen.at(-1),'cast');c.tick(1800);assert.equal(done,1);
});
test('cancelled sequences cannot advance or complete a later run',()=>{
 const c=clock(),seen=[];let done=0;const turn=createBattleSequence({...c,onFrame:f=>seen.push(f),onDone:()=>done++});
 turn.start();c.tick(400);turn.cancel();c.tick(10000);assert.equal(done,0);assert.equal(seen.at(-1),'cast');
 turn.start();c.tick(2200);assert.equal(done,1);
});
test('capture resolves once after struggling and holds the outcome before continuing',()=>{
 const c=clock(),seen=[];let attempts=0,done=0;
 const sequence=createBattleSequence({...c,timing:{throw:650,struggle:1300,result:1400},onFrame:f=>{seen.push(f);if(f==='result')attempts++;},onDone:()=>done++});
 sequence.start();assert.equal(sequence.start(),false);c.tick(650);assert.equal(seen.at(-1),'struggle');assert.equal(attempts,0);
 c.tick(1300);assert.equal(attempts,1);assert.equal(done,0);assert.ok(sequence.running);
 c.tick(1399);assert.equal(done,0);c.tick(1);assert.equal(done,1);assert.equal(attempts,1);
});
