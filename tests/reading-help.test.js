import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTIONS,generateQuestion} from '../src/learning.js';
import {freshLearning} from '../src/learning-record.js';
import {readingHint,readingPassage} from '../src/reading-help.js';
import {newGame,answer,continueBattle} from '../src/game.js';
test('early action strand starts at 11 with four clear verbs and unique contexts',()=>{
 const qs=QUESTIONS.filter(q=>q.id.includes('early-action-'));assert.equal(qs.length,48);assert.deepEqual([...new Set(qs.map(q=>q.skillId))],['action:run','action:swim','action:sleep','action:eat']);assert.ok(qs.every(q=>q.stageMin===11));
 assert.ok(generateQuestion(11,[],()=>.1,freshLearning()).skillId.startsWith('action:'));
 assert.ok(!generateQuestion(1,[],()=>.1,freshLearning()).skillId.startsWith('action:'));
});
test('reading help depends on the question and passage, never the chosen or correct answer',()=>{
 const q={prompt:'Where is Mia?',passage:'Mia is at home. Ben is at school.',skillId:'reading:detail',correctIndex:0,options:[{text:'home'}]};
 const changed={...q,correctIndex:3,options:[{text:'school'}]};assert.equal(readingPassage(q,true),readingPassage(changed,true));assert.equal(readingHint(q),readingHint(changed));assert.ok(readingPassage(q,true).includes('<mark>Mia</mark>'));assert.ok(!readingPassage(q,true).includes('<mark>home'));
 assert.equal(readingPassage({...q,passage:'<script>'}), '&lt;script&gt;');
});
test('reading support is available for every passage and never carries to the next question',()=>{
 for(const q of QUESTIONS.filter(q=>q.passage))assert.ok(readingHint(q));
 const g=newGame('ember',null,()=>.1);g.readingHelp=true;g.enemy.currentHp=999;g.enemy.currentShield=0;answer(g,g.question.correctIndex);continueBattle(g);assert.equal(g.readingHelp,false);
});
test('helped first-try answers do not count as independent review recovery',async()=>{
 const {noteSeen,noteAnswer}=await import('../src/learning-record.js');const p=freshLearning(),q=QUESTIONS[0];noteSeen(p,q);noteAnswer(p,q,false,1,1000);noteAnswer(p,q,true,1,86401000,true);assert.equal(p.skills[q.skillId].retryNeeded,1);assert.equal(p.skills[q.skillId].firstRight,undefined);assert.equal(p.firstRight,1);
});
