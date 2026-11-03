import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,rollRewards,REWARDS,chooseReward,reward,activeMonster,capture,createMonster} from '../src/game.js';
function seeded(){let s=91;return ()=>((s=(s*1664525+1013904223)>>>0)/2**32);}
function fixture(){const g=newGame('ember',null,()=>.1);g.party.push(createMonster('aqua'));for(const m of g.party){m.evolutionStage=2;m.maxHp=20;m.currentHp=3;m.maxShield=3;m.currentShield=0;m.shieldFragments=0;m.attack=2;}return g;}
function take(g,id){g.phase='reward-target';g.rewardChoices=[id];reward(g,id,g.party[0].id);}
test('20 rewards have the requested rarity counts and fixed distribution',()=>{
 assert.equal(Object.keys(REWARDS).length,20);
 const rng=seeded(),g=newGame('sprout',null,rng),counts={Common:0,Uncommon:0,Rare:0,Epic:0},bonus={Rare:0,Epic:0};g.growthCombo=5;
 for(const [rarity,n] of Object.entries({Common:5,Uncommon:6,Rare:5,Epic:4}))assert.equal(Object.values(REWARDS).filter(r=>r.rarity===rarity).length,n);
 for(let i=0;i<20000;i++){g.rewardChoices=[];const choices=rollRewards(g,rng);choices.slice(0,3).forEach(id=>counts[REWARDS[id].rarity]++);bonus[REWARDS[choices[3]].rarity]++;assert.deepEqual(rollRewards(g,()=>0),choices);}
 for(const [rarity,expected] of Object.entries({Common:.5,Uncommon:.3,Rare:.15,Epic:.05}))assert.ok(Math.abs(counts[rarity]/60000-expected)<.01);
 assert.ok(Math.abs(bonus.Rare/20000-.9)<.01);
});
test('normal and bonus slots allow duplicates even with full resources',()=>{
 const g=newGame('sprout');assert.deepEqual(rollRewards(g,()=>0),['hp','hp','hp','heal-all']);
 g.rewardChoices=[];g.growthCombo=5;assert.deepEqual(rollRewards(g,()=>.999),['golden-net','golden-net','golden-net','golden-net']);
});
test('single monster rewards grant exactly their listed base amounts',()=>{
 for(const [id,n] of [['hp',2],['hp-three',3],['hp-extra',5]]){const g=fixture();take(g,id);assert.equal(g.party[0].maxHp,20+n);assert.equal(g.party[0].currentHp,3+n);}
 for(const [id,n] of [['attack',1],['attack-two',2]]){const g=fixture();take(g,id);assert.equal(g.party[0].attack,2+n);}
 for(const [id,n] of [['shield',1],['shield-pair',2]]){const g=fixture();take(g,id);assert.equal(g.party[0].shieldFragments,n);}
 for(const [id,n] of [['shield-charge',1],['shield-charge-plus',2]]){const g=fixture();take(g,id);assert.equal(g.party[0].currentShield,n);assert.equal(g.party[0].maxShield,3);g.party[0].currentShield=3;take(g,id);assert.equal(g.party[0].currentShield,3);}
 const g=fixture();take(g,'heal');assert.equal(g.party[0].currentHp,13);take(g,'heal-full');assert.equal(g.party[0].currentHp,20);take(g,'shield-one');assert.equal(g.party[0].maxShield,4);assert.equal(g.party[0].currentShield,1);assert.equal(g.party[1].maxShield,3);
});
test('team effects apply to all members and restoration does not increase caps',()=>{
 const g=fixture();take(g,'heal-all');assert.ok(g.party.every(m=>m.currentHp===20));take(g,'shield-heal-all');assert.ok(g.party.every(m=>m.currentShield===3));take(g,'attack-all');assert.ok(g.party.every(m=>m.attack===3));take(g,'shield-all');assert.ok(g.party.every(m=>m.currentShield===4&&m.maxShield===4));
 for(const m of g.party){m.currentHp=0;m.currentShield=0;}take(g,'restore-all');assert.ok(g.party.every(m=>m.currentHp===20&&m.currentShield===4));
});
test('catch charms retain the run cap and golden nets guarantee exactly one attempt each',()=>{
 const g=fixture();take(g,'capture-up');assert.equal(g.captureBoost,.1);take(g,'capture-up-plus');assert.equal(g.captureBoost,.3);take(g,'capture-up-plus');take(g,'capture-up');assert.equal(g.captureBoost,.5);
 take(g,'golden-net');take(g,'golden-net');assert.equal(g.goldenNets,2);
 g.phase='battle';capture(g,()=>.999);assert.equal(g.goldenNets,2);
 g.phase='capture';g.enemy.isBoss=true;assert.equal(capture(g,()=>.999),true);assert.equal(g.goldenNets,1);capture(g,()=>.999);assert.equal(g.goldenNets,1);
 g.phase='capture';g.captureResult=null;g.attempts=0;assert.equal(capture(g,()=>.999),true);assert.equal(g.goldenNets,0);
 g.phase='capture';g.captureResult=null;g.attempts=0;assert.equal(capture(g,()=>.999),false);
});
test('unoffered rewards cannot be claimed',()=>{const g=fixture();g.phase='reward-target';g.rewardChoices=['hp'];reward(g,'attack',activeMonster(g).id);assert.equal(activeMonster(g).attack,2);assert.equal(g.phase,'reward-target');});

test('team and run rewards skip targeting while individual rewards wait for a target',()=>{
 for(const [id,item] of Object.entries(REWARDS)){
  const g=fixture();g.phase='reward';g.rewardChoices=[id];
  const before=structuredClone(g.party);chooseReward(g,id);
  if(item.scope){assert.equal(g.phase,'camp',id);const state=structuredClone(g);chooseReward(g,id);assert.deepEqual(g,state);}
  else {assert.equal(g.phase,'reward-target',id);assert.deepEqual(g.party,before);assert.equal(g.selectedReward,id);reward(g,id,g.party[0].id);assert.equal(g.phase,'camp');}
 }
 const g=fixture();g.phase='reward';g.rewardChoices=['hp'];chooseReward(g,'golden-net');assert.equal(g.phase,'reward');assert.equal(g.goldenNets,undefined);
});
test('instant team growth still shows evolution before camp',()=>{
 const g=fixture();const m=g.party[0];m.evolutionStage=0;m.attack=2;m.evolutionBaseline.attack=1;
 g.phase='reward';g.rewardChoices=['attack-all'];chooseReward(g,'attack-all');assert.equal(g.phase,'evolution');assert.ok(g.evolved.includes(m.id));
});
