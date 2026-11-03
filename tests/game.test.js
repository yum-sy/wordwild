import test from 'node:test';
import assert from 'node:assert/strict';
import { budgetAt } from '../src/balance.js';
import { claimLuckyEvent, allocateStats, createMonster, addShield, shieldStat, evolve, bossAttack, bossPassiveCount, newGame, answer, continueBattle, capture, replaceCapture, reward, nextStage, activeMonster } from '../src/game.js';
import { QUESTIONS, generateQuestion, validateQuestions } from '../src/learning.js';
function seeded(seed=43){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};}
test('every stage allocates integer stats within budget and minimum shares',()=>{
  const rng=seeded();
  for(let stage=1;stage<=100;stage++) for(let i=0;i<12;i++) {
    const b=budgetAt(stage),s=allocateStats(b,rng),used=s.hp+1.5*s.attack+3*s.shield;
    assert.ok([s.hp,s.attack,s.shield].every(Number.isInteger));
    assert.ok(s.hp>=b*.15&&s.attack*1.5>=b*.15&&s.shield*3>=b*.15);
    assert.ok(used>=b*.85&&used<=b);
  }
});
test('fragments complete permanent and current shields; special +2 adds both',()=>{
  const m=createMonster('sprout');m.maxShield=2;m.currentShield=0;m.shieldFragments=3;
  addShield(m,1);assert.equal(m.maxShield,3);assert.equal(m.currentShield,1);assert.equal(m.shieldFragments,0);
  addShield(m,0,2);assert.equal(m.maxShield,5);assert.equal(m.currentShield,3);
});
test('shield evolution uses permanent stat even when all shields spent',()=>{
  const m=createMonster('sprout');m.evolutionBaseline.shieldStat=2;m.maxShield=1;m.shieldFragments=2;m.currentShield=0;
  assert.equal(shieldStat(m),6);assert.ok(evolve(m,'shield'));assert.equal(m.maxShield,2);assert.equal(m.currentShield,2);
});
test('evolution baseline includes bonus and one reward cannot evolve twice',()=>{
  const m=createMonster('sprout');m.maxHp=10;m.evolutionBaseline.hp=5;
  assert.ok(evolve(m,'hp'));assert.equal(m.maxHp,12);assert.equal(m.evolutionBaseline.hp,12);
  m.maxHp=23;assert.equal(evolve(m,'hp'),false);m.maxHp=24;assert.ok(evolve(m,'hp'));
  assert.equal(m.evolutionStage,2);assert.equal(evolve(m,'hp',true),false);
  const g=newGame('ember',null,()=>.1);const p=g.party[0];p.attack=100;g.phase='reward-target';g.rewardChoices=['attack'];reward(g,'attack',p.id);assert.equal(p.evolutionStage,1);assert.equal(p.evolutionBaseline.attack,p.attack);
});
test('boss base damage retains its 2x passive formula before the ultimate HP floor',()=>{
  const e=createMonster('boss'),p=createMonster('sprout');e.attack=10;e.passiveTypes=['attack','heal'];p.maxHp=200;p.currentHp=200;p.currentShield=0;
  assert.equal(bossAttack(e,p,1,80).rawDamage,10);
  assert.equal(bossAttack(e,p,2,80).rawDamage,15);
  assert.equal(bossAttack(e,p,3,80).baseDamage,20);
  assert.equal(bossAttack(e,p,3,10).baseDamage,15);
  assert.deepEqual([10,30,40,70,80,100].map(bossPassiveCount),[0,0,1,1,2,2]);
});
test('boss heal and shield regen never exceed caps',()=>{
  const e=createMonster('boss'),p=createMonster('sprout');e.passiveTypes=['heal','growth'];e.maxShield=2;e.currentShield=2;e.currentHp=e.maxHp;
  bossAttack(e,p,2,80);assert.equal(e.currentHp,e.maxHp);assert.equal(e.currentShield,2);
});
test('growth combo 5 guarantees special even with unlucky random',()=>{
  const g=newGame('sprout',null,()=>.1);g.enemy.currentHp=5;g.enemy.maxHp=5;g.enemy.currentShield=0;g.party[0].attack=1;
  for(let i=0;i<5;i++){answer(g,g.question.correctIndex,()=>.999);continueBattle(g,()=>.999);}
  assert.equal(g.phase,'capture');assert.equal(g.growthCombo,5);assert.ok(g.special);
});
test('capture has three attempts; new capture can receive this victory reward',()=>{
  const g=newGame('sprout',null,()=>.1);g.phase='capture';
  for(let i=0;i<5;i++)capture(g,()=>.999);assert.equal(g.attempts,3);assert.equal(g.party.length,1);
  g.attempts=0;capture(g,()=>0);assert.equal(g.party.length,2);
  const m=g.party[1],old=m.maxHp;g.phase='reward-target';g.rewardChoices=['hp'];reward(g,'hp',m.id);assert.ok(m.maxHp>=old+2);
});
test('full party capture replacement and release preserve party size',()=>{
  const g=newGame('sprout',null,()=>.1);g.party.push(createMonster('ember'),createMonster('aqua'));g.phase='capture';capture(g,()=>0);
  assert.equal(g.phase,'party-management');const old=g.party[0].id;replaceCapture(g,old);assert.equal(g.party.length,3);assert.notEqual(g.activeMonsterId,old);
});
test('wrong answer resets combo; shield blocks all damage; defeated party switches',()=>{
  const g=newGame('sprout',null,()=>.1);g.party.push(createMonster('aqua'));const p=activeMonster(g);p.currentShield=1;p.currentHp=1;g.playerCombo=4;
  answer(g,(g.question.correctIndex+1)%4);assert.equal(p.currentHp,1);assert.equal(p.currentShield,0);assert.equal(g.playerCombo,0);
  continueBattle(g);answer(g,(g.question.correctIndex+2)%4);assert.equal(p.currentHp,0);assert.equal(g.activeMonsterId,g.party[1].id);
});
test('all ten curriculum tiers provide unique four-way questions and shuffled correct answer',()=>{
  assert.ok(validateQuestions());const rng=seeded();const positions=new Set();
  for(let stage=1;stage<=100;stage++)for(let i=0;i<30;i++) {
    const q=generateQuestion(stage,[],rng);assert.equal(q.options.length,4);assert.equal(q.options.filter(o=>o.correct).length,1);assert.ok(q.options[q.correctIndex].correct);assert.ok(q.grammarLevel<=Math.ceil(stage/10));positions.add(q.correctIndex);
  }
  assert.equal(positions.size,4);for(let i=1;i<=10;i++)assert.ok(QUESTIONS.some(q=>q.grammarLevel===i));
});
test('recent questions avoided when unseen questions remain',()=>{
  const recent=[];const rng=seeded();for(let i=0;i<15;i++){const q=generateQuestion(1,recent,rng);assert.ok(!recent.includes(q.id));recent.push(q.id);}
});
test('100-stage complete run exercises battle, rewards, bosses, evolution and clear',()=>{
  const rng=seeded(921);const g=newGame('ember',null,rng);let turns=0;
  for(let stage=1;stage<=100;stage++) {
    assert.equal(g.stage,stage);assert.equal(g.playerCombo,0);
    while(g.phase==='battle') {answer(g,g.question.correctIndex,rng);continueBattle(g,rng);assert.ok(++turns<3000);}
    if(g.phase==='lucky-event'){claimLuckyEvent(g);if(g.phase==='evolution')g.phase='camp';nextStage(g,rng);continue;}
    assert.equal(g.phase,'capture');g.phase='reward-target';reward(g,g.rewardChoices.includes('attack')?'attack':g.rewardChoices[0],g.party[0].id);
    if(g.phase==='evolution')g.phase='camp';nextStage(g,rng);
  }
  assert.equal(g.phase,'clear');assert.equal(g.party[0].evolutionStage,2);
});
