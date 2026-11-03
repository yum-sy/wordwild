import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES,monsterArt} from '../src/monsters.js';
import {makeEnemy,newGame,nextStage,capture,activeMonster} from '../src/game.js';
import {existsSync} from 'node:fs';
test('64 distinct species have unique sprite slots and valid passive types',()=>{
 assert.equal(SPECIES.length,64);assert.equal(new Set(SPECIES.map(s=>s.id)).size,64);
 for(const s of SPECIES){assert.ok(['attack','heal','growth'].includes(s.passive));assert.ok(s.cell>=0&&s.cell<16);const art=monsterArt({speciesId:s.id,evolutionStage:2});assert.ok(art.includes(`atlas-${s.atlas||'original'}`));}
 for(const atlas of ['wildlands','mythwilds','deepwilds'])assert.ok(existsSync(new URL(`../assets/monsters-${atlas}.png`,import.meta.url)));
});
test('all eligible wild species can appear; bosses keep their dedicated encounter',()=>{
 for(const stage of [1,11,21,31]){
  const eligible=SPECIES.filter(s=>!s.isBoss&&(s.stageMin||1)<=stage);
  const seen=new Set();for(let i=0;i<eligible.length;i++)seen.add(makeEnemy(stage,()=>((i+.5)/eligible.length)).speciesId);
  assert.equal(seen.size,eligible.length);
 }
 assert.equal(makeEnemy(10,()=>.99).speciesId,'cinderwing');
});
test('recent wild species are avoided and captured newcomers keep their identity',()=>{
 const g=newGame('ember',null,()=>0);const recent=[];
 for(let i=0;i<8;i++){assert.ok(!recent.slice(-3).includes(g.enemy.speciesId));recent.push(g.enemy.speciesId);g.phase='camp';nextStage(g,()=>0);}
 g.enemy=makeEnemy(31,()=>.99);g.phase='capture';const id=g.enemy.speciesId;assert.equal(capture(g,()=>0),true);assert.ok(g.party.some(m=>m.speciesId===id));assert.ok(activeMonster(g));
});

test('ten distinct dragons appear in order and remain catchable with their own skills',()=>{
 const seen=new Set();for(let stage=10;stage<=100;stage+=10){const enemy=makeEnemy(stage,()=>0);seen.add(enemy.speciesId);assert.equal(enemy.isBoss,true);const species=SPECIES.find(s=>s.id===enemy.speciesId);assert.equal(species.bossStage,stage);assert.deepEqual(enemy.passiveTypes,species.bossPassives);const g=newGame('ember',null,()=>0);g.enemy=enemy;g.phase='capture';g.goldenNets=1;assert.equal(capture(g,()=>.999),true);assert.ok(g.party.some(m=>m.speciesId===enemy.speciesId));}assert.equal(seen.size,10);assert.equal(makeEnemy(100,()=>0).speciesId,'boss');
});
