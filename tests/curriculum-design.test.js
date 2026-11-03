import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTIONS,generateQuestion} from '../src/learning.js';
import {freshLearning,noteSeen,noteAnswer,normalizeLearning} from '../src/learning-record.js';
test('all learning goals have design metadata and no a-orange error remains',()=>{
 for(const q of QUESTIONS){assert.ok(q.objective&&q.contextId);assert.ok([1,2,3].includes(q.difficulty));assert.ok(Array.isArray(q.prerequisites));assert.ok(q.stageMin>=(q.grammarLevel-1)*10+1);assert.ok(!/\ba orange\b/.test(JSON.stringify(q)));}
});
test('new task demands are stage bounded and every stage can produce a question',()=>{
 for(let stage=1;stage<=100;stage++)for(const roll of [0,.4,.99]){const q=generateQuestion(stage,[],()=>roll,freshLearning());assert.ok(q.stageMin<=stage);assert.equal(q.grammarLevel,Math.ceil(stage/10));}
 assert.ok(QUESTIONS.filter(q=>q.id.includes('category-')).every(q=>q.stageMin>=14));
 assert.ok(QUESTIONS.filter(q=>q.grammarLevel===8&&q.passage).every(q=>q.stageMin>=77));
});
test('goal-first sampling covers all introductory nouns before repeating a goal on the new branch',()=>{
 const p=freshLearning(),goals=new Set(),recent=[];
 for(let i=0;i<40;i++){const q=generateQuestion(1,recent,()=>.1,p);goals.add(q.skillId);noteSeen(p,q);noteAnswer(p,q,true,1);recent.push(q.id);if(recent.length>8)recent.shift();}
 assert.equal(goals.size,40);
});
test('distant weak concepts remain reviewable at late stages',()=>{
 const p=freshLearning(),q=QUESTIONS[0];noteSeen(p,q);noteAnswer(p,q,false,1,1000);p.sequence+=5;
 const review=generateQuestion(100,[q.id],()=>.9,p);assert.equal(review.sourceType,'review');assert.equal(review.skillId,q.skillId);
});
test('reading tags match authored skills and new readings have transfer partners',()=>{
 const daily=QUESTIONS.filter(q=>q.id.includes('daily-'));
 assert.equal(daily.find(q=>q.id==='v2-9-daily-3').skillId,'reading:sequence');
 for(const q of daily)assert.ok(QUESTIONS.some(x=>x.id!==q.id&&x.skillId===q.skillId&&x.passage!==q.passage),q.id);
 assert.ok(QUESTIONS.filter(q=>q.id.includes('move-')).every(q=>!q.scene&&!/elephant|sun|moon|tree/.test(q.id)));
});
test('context and delay evidence survives save normalization without granting mastery for a correction',()=>{
 const p=freshLearning(),q=QUESTIONS[0];noteSeen(p,q);noteAnswer(p,q,false,1,1000);noteAnswer(p,q,true,2,1000);
 const restored=normalizeLearning(p);assert.equal(restored.skills[q.skillId].retryNeeded,1);assert.deepEqual(restored.skills[q.skillId].contexts,[]);
});
