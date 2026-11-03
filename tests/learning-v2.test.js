import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, answer, continueBattle, createMonster, bossAttack } from '../src/game.js';
import { QUESTIONS, generateQuestion } from '../src/learning.js';
import { freshLearning, noteSeen, noteAnswer, loadLearning, saveLearning, LEARNING_KEY, isDue } from '../src/learning-record.js';
import { LEVEL_TARGETS } from '../src/learning-content.js';
const rng=()=>.1;
function battle(){const g=newGame('ember',null,rng);g.enemy.currentHp=g.enemy.maxHp=999;g.enemy.attack=2;g.enemy.currentShield=0;g.party[0].currentShield=0;g.party[0].currentHp=g.party[0].maxHp=100;return g;}
test('three wrong choices stay locked on the same question; only correct advances',()=>{
 const g=battle(),q=g.question;const wrong=[0,1,2,3].filter(i=>i!==q.correctIndex);
 for(let n=0;n<3;n++){
  const f=answer(g,wrong[n]);assert.equal(f.ultimate,n===2);assert.equal(g.rejected.length,n+1);const total=g.total;
  assert.equal(answer(g,q.correctIndex),undefined);continueBattle(g);assert.equal(g.question,q);
  assert.equal(answer(g,wrong[n]),undefined);assert.equal(g.total,total);
 }
 assert.equal(g.enemyCombo,3);assert.equal(g.learning.firstTotal,1);assert.equal(g.learning.firstRight,0);
 assert.equal(answer(g,q.correctIndex).correct,true);continueBattle(g);assert.notEqual(g.question.id,q.id);assert.deepEqual(g.rejected,[]);assert.equal(g.enemyCombo,0);
 assert.equal(g.learning.skills[q.skillId].firstRight,undefined);
});
test('replacement preserves question and exclusions; wipe ends the run without a new question',()=>{
 const g=battle(),q=g.question;g.party.push(createMonster('aqua'));g.party[0].currentHp=1;g.party[1].currentShield=0;g.party[1].currentHp=1;
 const wrong=[0,1,2,3].filter(i=>i!==q.correctIndex);answer(g,wrong[0]);assert.equal(g.feedback.switched,true);continueBattle(g);assert.equal(g.question,q);assert.deepEqual(g.rejected,[wrong[0]]);
 answer(g,wrong[1]);assert.equal(g.pending,'game-over');continueBattle(g);assert.equal(g.phase,'game-over');assert.equal(g.question,q);
});
test('third hit uses current HP, preserves lethal base damage, and shields block it once',()=>{
 for(const species of ['ember','boss']){
  const e=createMonster(species),p=createMonster('aqua');e.attack=20;e.passiveTypes=[];p.maxHp=1000;p.currentHp=100;p.currentShield=0;
  assert.equal(bossAttack(e,p,3,10).damage,90);assert.equal(p.currentHp,10);
  p.currentHp=20;assert.equal(bossAttack(e,p,3,10).damage,20);assert.equal(p.currentHp,0);
  p.currentHp=100;p.currentShield=1;assert.equal(bossAttack(e,p,3,10).blocked,true);assert.equal(p.currentHp,100);assert.equal(p.currentShield,0);
  p.currentHp=100;assert.equal(bossAttack(e,p,2,10).damage,20);
 }
});
test('all tiers reach targets with stable IDs, four unique choices and no duplicated content in a tier',()=>{
 for(let level=1;level<=10;level++){
  const qs=QUESTIONS.filter(q=>q.grammarLevel===level);assert.ok(qs.length>=LEVEL_TARGETS[level-1]);
  const keys=qs.map(q=>JSON.stringify([q.prompt,q.scene,q.passage,q.options]));assert.equal(new Set(keys).size,qs.length,`level ${level}`);
 }
 assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,QUESTIONS.length);
});
test('learning survives reload, ignores corrupt records and handles unavailable storage',()=>{
 const storage={value:null,getItem(){return this.value;},setItem(k,v){assert.equal(k,LEARNING_KEY);this.value=v;}};
 const p=freshLearning(),q=QUESTIONS[0];p.session=1;noteSeen(p,q);noteAnswer(p,q,false,1,100);noteAnswer(p,q,true,2,100);
 assert.equal(saveLearning(storage,p),true);const restored=loadLearning(storage);assert.deepEqual(restored,p);restored.session++;assert.equal(isDue(restored.skills[q.skillId],restored,100),true);
 storage.value='broken';assert.deepEqual(loadLearning(storage),freshLearning());assert.equal(saveLearning(null,p),false);assert.deepEqual(loadLearning(null),freshLearning());
 storage.value=JSON.stringify({version:2,items:{bad:{seen:'x'}},skills:[],sequence:-3});assert.equal(loadLearning(storage).sequence,0);
});
test('new runs prefer unseen questions and due reviews use another form of the failed concept',()=>{
 const p=freshLearning();p.session=1;const q=generateQuestion(1,[],()=>0,p);noteSeen(p,q);noteAnswer(p,q,false,1,Date.now());p.sequence+=4;
 const review=generateQuestion(1,[q.id],()=>.9,p);assert.equal(review.sourceType,'review');assert.equal(review.skillId,q.skillId);assert.notEqual(review.id,q.id);
 p.session++;const newQ=generateQuestion(1,[],()=>0,p);assert.notEqual(newQ.id,q.id);
});
test('exhausted pools still produce valid stage-bounded questions',()=>{
 const p=freshLearning();for(const q of QUESTIONS)p.items[q.id]={seen:1,lastSeen:1};
 for(let stage=1;stage<=100;stage++){const q=generateQuestion(stage,QUESTIONS.map(q=>q.id),rng,p);assert.equal(q.grammarLevel,Math.ceil(stage/10));assert.equal(q.options.length,4);}
});
test('a weak concept needs different contexts and delayed recall before recovery',()=>{
 const p=freshLearning(),q=QUESTIONS[0],other=QUESTIONS.find(x=>x.skillId===q.skillId&&x.contextId!==q.contextId);p.session=1;
 noteSeen(p,q);noteAnswer(p,q,false,1,1000);noteAnswer(p,q,true,2,1000);
 noteSeen(p,q);noteAnswer(p,q,true,1,2000);assert.equal(p.skills[q.skillId].retryNeeded,1);
 noteSeen(p,other);noteAnswer(p,other,true,1,3000);assert.equal(p.skills[q.skillId].retryNeeded,1);
 noteSeen(p,other);noteAnswer(p,other,true,1,86403000);assert.equal(p.skills[q.skillId].retryNeeded,0);
 p.session++;assert.equal(isDue(p.skills[q.skillId],p,86403000),false);
 assert.equal(isDue({wrong:1,last:1,due:21,dueAt:999999999,session:1},p,1000),false);
});
