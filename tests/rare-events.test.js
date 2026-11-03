import test from 'node:test';import assert from 'node:assert/strict';
import {rollRareForm,mergeCollection,RARE_CHANCE,RARE_FORMS} from '../src/rare-monsters.js';
import {newGame,beginBattle,claimLuckyEvent,capture,evolve,LUCKY_EVENT_CHANCE} from '../src/game.js';
import {saveRun,loadRun} from '../src/run-store.js';
const storage=()=>{let value=null;return {getItem:()=>value,setItem:(k,v)=>value=v,removeItem:()=>value=null};};
test('rare forms share the 1% total chance with disjoint intervals',()=>{
 assert.equal(RARE_CHANCE,.01);
 assert.ok(Math.abs(Object.values(RARE_FORMS).reduce((sum,f)=>sum+f.chance,0)-RARE_CHANCE)<1e-15);
 const gold=RARE_FORMS.gold.chance,silverEnd=gold+RARE_FORMS.silver.chance;
 for(const [n,expected] of [[0,'gold'],[gold-1e-12,'gold'],[gold,'silver'],[silverEnd-1e-12,'silver'],[silverEnd,'large'],[RARE_CHANCE-1e-12,'large'],[RARE_CHANCE,null],[.999999,null]])assert.equal(rollRareForm(()=>n),expected);
});
test('capture, evolution, collection and inheritance preserve a rare appearance',()=>{
 const g=newGame('ember',null,()=>.1);g.enemy.rareForm='gold';g.phase='capture';capture(g,()=>0);const caught=g.party[1];assert.equal(caught.rareForm,'gold');evolve(caught,'attack',true);assert.equal(caught.rareForm,'gold');assert.equal(mergeCollection(g.rareFinds,g.rareFinds).length,1);const fresh=newGame(caught.speciesId,caught,()=>.1);assert.equal(fresh.party[0].rareForm,'gold');
});
test('lucky stages give no question or learning exposure and cannot happen at bosses',()=>{
 const g=newGame('ember',null,()=>.1),seen=g.learning.sequence;g.stage=9;beginBattle(g,()=>0);assert.equal(g.phase,'lucky-event');assert.equal(g.question,null);assert.equal(g.learning.sequence,seen);g.stage=10;beginBattle(g,()=>0);assert.equal(g.phase,'battle');assert.equal(g.enemy.isBoss,true);assert.equal(LUCKY_EVENT_CHANCE,.0075);
});
test('event reward is claim-once and stays fixed after reload, including initial-stage events',()=>{
 const g=newGame('ember',null,()=>0),s=storage();assert.equal(g.phase,'lucky-event');saveRun(s,g);const r=loadRun(s);assert.ok(r);assert.deepEqual(r.luckyEvent,g.luckyEvent);assert.ok(claimLuckyEvent(r));assert.equal(r.goldenNets,1);assert.equal(claimLuckyEvent(r),false);saveRun(s,r);const resumed=loadRun(s);assert.equal(resumed.phase,'camp');assert.equal(resumed.goldenNets,1);
});
test('all gifts apply with no targeting; spring has value even at full health',()=>{
 for(const reward of ['golden-net','shield-all','restore-all']){const g=newGame('ember',null,()=>0);g.luckyEvent.reward=reward;assert.ok(claimLuckyEvent(g));assert.ok(['camp','evolution'].includes(g.phase));if(reward==='restore-all')assert.equal(g.goldenNets,1);}
});
