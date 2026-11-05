import test from 'node:test';import assert from 'node:assert/strict';
import {createMonster,evolve} from '../src/game.js';
import {statPips,shieldIcon} from '../src/stat-art.js';
import {QUESTIONS} from '../src/learning.js';
import {learningScene} from '../src/learning-scenes.js';
test('shield awakening requires three complete permanent shields and the growth threshold',()=>{
 const m=createMonster('sprout');m.evolutionBaseline.shieldStat=1;m.maxShield=2;m.shieldFragments=3;assert.equal(evolve(m,'shield'),false);
 m.maxShield=3;m.shieldFragments=0;m.currentShield=0;assert.equal(evolve(m,'shield'),true);assert.equal(m.lastEvolution.before.shield,3);assert.equal(m.lastEvolution.after.shield,4);
 const n=createMonster('sprout');n.evolutionBaseline.shieldStat=8;n.maxShield=3;assert.equal(evolve(n,'shield'),false);
});
test('noun questions isolate the requested object and remove marked-picture instructions',()=>{
 assert.ok(QUESTIONS.every(q=>!q.prompt.includes('marked picture')));
 assert.equal(learningScene({kind:'noun',word:'sun',context:true}),learningScene({kind:'noun',word:'sun',context:false}));
});
test('shield quarters and large stats remain bounded with exact grouping labels',()=>{
 assert.equal((shieldIcon(2).match(/fill="#8cc8ff"/g)||[]).length,2);
 assert.match(statPips('hp',100,100),/×13/);
 assert.equal((statPips('shield',1,2,3).match(/class="stat-symbol shield"/g)||[]).length,3);
});
