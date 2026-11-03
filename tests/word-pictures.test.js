import test from 'node:test';
import assert from 'node:assert/strict';
import {VOCABULARY,QUESTIONS,sceneArt} from '../src/learning.js';
import {WORD_PICTURE_IDS,wordPicture} from '../src/word-pictures.js';
test('every first-word answer has a dedicated platform-independent illustration',()=>{
 assert.deepEqual(new Set(WORD_PICTURE_IDS),new Set(VOCABULARY.map(v=>v.word)));
 for(const q of QUESTIONS)for(const id of [q.scene,...q.options.map(o=>o.imageId)].filter(Boolean)){const art=sceneArt(id);assert.ok(art.startsWith('<svg'),q.id);assert.ok(!art.includes('<text'),q.id);assert.ok(!art.includes('undefined'),q.id);}
 assert.equal(wordPicture('missing'),'');
});
