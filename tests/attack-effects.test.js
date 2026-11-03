import test from 'node:test';
import assert from 'node:assert/strict';
import {ATTACK_EFFECTS,chooseAttackEffect,effectArt,effectMarkup} from '../src/attack-effects.js';
test('sixteen distinct effect silhouettes form four answer-position families',()=>{
 assert.equal(ATTACK_EFFECTS.length,16);assert.equal(new Set(ATTACK_EFFECTS.map(e=>effectArt(e.id))).size,16);
 for(let p=0;p<4;p++){const drawn=new Set();for(const r of [0,.26,.51,.99])drawn.add(chooseAttackEffect(p,-1,()=>r));assert.deepEqual([...drawn],[p*4,p*4+1,p*4+2,p*4+3]);}
});
test('each answer position avoids its previous effect with stable family membership',()=>{
 for(let p=0;p<4;p++)for(let previous=p*4;previous<p*4+4;previous++)for(const r of [0,.5,1]){const id=chooseAttackEffect(p,previous,()=>r);assert.notEqual(id,previous);assert.equal(Math.floor(id/4),p);}
});
test('enemy, shield and power cues do not get lost in effect variations',()=>{
 for(const e of ATTACK_EFFECTS){const f={correct:false,blocked:true,ultimate:true,damage:99},before=JSON.stringify(f),html=effectMarkup(e.id,f);assert.ok(html.includes('to-player'));assert.ok(html.includes('shield-flare'));assert.ok(html.includes('BLOCK!'));assert.ok(html.includes('fx-ultimate'));assert.equal(JSON.stringify(f),before);assert.ok(effectMarkup(e.id,{correct:true}).includes('to-enemy'));}
});
