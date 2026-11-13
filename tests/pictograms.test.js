import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PICTOGRAMS} from '../src/pictogram-catalog.js';
import {isActionOnlyQuestion} from '../src/pictogram-art.js';
import {QUESTIONS,sceneArt,VOCABULARY} from '../src/learning.js';
import {sceneId} from '../src/learning-scenes.js';
test('all vocabulary has local reviewed art with provenance and matching bytes',()=>{
 for(const {word} of VOCABULARY){const p=PICTOGRAMS[word];assert.equal(p.scope,'noun',word);assert.ok(p.source&&p.license&&p.author);assert.equal(p.review,'visual-reviewed');}
 for(const p of Object.values(PICTOGRAMS)){const bytes=readFileSync(`assets/learning-pictograms/${p.file}`);assert.equal(createHash('sha256').update(bytes).digest('hex'),p.sha256,p.file);}
});
test('subject-specific actions retain their identity; generic actions use curated pictograms',()=>{
 for(const q of QUESTIONS){const opts={actionOnly:isActionOnlyQuestion(q)};for(const id of [q.scene,...q.options.map(o=>o.imageId)].filter(Boolean)){
  const art=sceneArt(id,opts);assert.ok(!art.includes('undefined'));assert.ok(!art.includes('<text'));
  for(const [,file] of art.matchAll(/href="\/assets\/learning-pictograms\/([^"?]+)"/g))assert.ok(existsSync(`assets/learning-pictograms/${file}`),q.id);
  const data=JSON.parse(id.slice(6));if(data.kind==='action'){assert.ok(art.includes('/learning-pictograms/'));if(opts.actionOnly)assert.ok(!art.includes('data-subject='),q.id);else {assert.ok(art.includes(`data-subject="${data.person}"`),q.id);assert.ok(art.includes(PICTOGRAMS[data.person].file),q.id);}}
 }}
});
test('counting preserves multiplicity and avoids whole-melon-plus-slice ambiguity',()=>{
 for(const n of [1,2,3,4])assert.equal((sceneArt(sceneId({kind:'count',word:'apple',count:n})).match(/<image /g)||[]).length,n);
 assert.ok(!sceneArt(sceneId({kind:'count',word:'watermelon',count:2})).includes('arasaac-2557'));
 assert.ok(sceneArt(sceneId({kind:'noun',word:'watermelon'})).includes('arasaac-2557'));
 assert.equal(new Set(Object.values(PICTOGRAMS).map(p=>p.file)).size,66);
});

test('between always shows two boxes with a larger subject between them',()=>{
 const art=sceneArt(sceneId({kind:'position',word:'cat',prep:'between',anchor:'box'}));
 assert.equal((art.match(/data-anchor="box"/g)||[]).length,2);
 assert.ok(art.includes('x="61" y="64" width="78" height="81"'));
 assert.ok(art.includes('viewBox="15 72 469 357"'));
});
test('subjects are full-body assets and children are visibly smaller than adults',()=>{
 for(const person of ['boy','girl','man','woman','robot','bear']){
  const art=sceneArt(sceneId({kind:'action',person,action:'sit'}));
  assert.ok(art.includes(PICTOGRAMS[person].file));assert.ok(art.includes('arasaac-25083.png'));
  assert.ok(art.includes(`height="${['boy','girl'].includes(person)?93:125}"`));
 }
});
