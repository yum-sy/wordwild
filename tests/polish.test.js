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

test('compact target stats distinguish current resources, maxima and shield fragments',async()=>{
 const {compactStats}=await import('../src/stat-art.js');
 const markup=compactStats({currentHp:12,maxHp:74,attack:33,currentShield:1,maxShield:13,shieldFragments:3});
 assert.match(markup,/aria-label="HP 12 of 74"/);assert.match(markup,/aria-label="Attack 33"/);assert.match(markup,/aria-label="Shield 1 of 13, 3 of 4 pieces"/);
 assert.equal((markup.match(/class="stat-symbol/g)||[]).length,4);
 const large=compactStats({currentHp:999,maxHp:999,attack:999,currentShield:99,maxShield:99,shieldFragments:0});assert.equal((large.match(/class="stat-symbol/g)||[]).length,3);
});
