import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SPECIES, monsterArt, monsterName } from '../src/monsters.js';
import { QUESTIONS } from '../src/learning.js';

test('evolution preserves the species sprite and name at every rank and route',()=>{
  for(const species of SPECIES){
    const positions=new Set();
    for(const evolutionStage of [0,1,2])for(const evolutionRoute of [null,'hp','attack','shield']){
      const monster={speciesId:species.id,evolutionStage,evolutionRoute};
      positions.add(monsterArt(monster).match(/--sprite-x:[^;]+;--sprite-y:[^;]+;/)[0]);
      assert.equal(monsterName(monster),species.name);
    }
    assert.equal(positions.size,1,`${species.name} must reuse one base sprite`);
  }
  assert.equal(new Set(SPECIES.map(s=>(s.atlas||'original')+':'+s.cell)).size,SPECIES.length);
});

test('all shipped UI, learning feedback and accessibility labels are English-only',async()=>{
  for(const file of ['index.html','src/app.js','src/learning.js','src/monsters.js','src/game.js']){
    assert.doesNotMatch(await readFile(new URL('../'+file,import.meta.url),'utf8'),/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/,file);
  }
  for(const q of QUESTIONS){
    assert.doesNotMatch(q.prompt,/\ba bread\b/);
    assert.ok(q.meaning.length>0);
    for(const option of q.options)assert.ok(option.text||option.meaning);
  }
});
