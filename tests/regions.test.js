import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {REGIONS,regionForStage,regionStyle} from '../src/regions.js';
test('ten regions map every stage including both sides of each boss boundary',()=>{
 assert.equal(REGIONS.length,10);assert.equal(new Set(REGIONS.map(r=>r.image)).size,10);
 for(let s=1;s<=100;s++){const r=regionForStage(s);assert.ok(s>=r.start&&s<=r.end);assert.equal(r,REGIONS[Math.floor((s-1)/10)]);assert.ok(regionStyle(s).includes(r.image));}
 assert.equal(regionForStage(0),REGIONS[0]);assert.equal(regionForStage(101),REGIONS[9]);
});
test('all region art is shipped with the project',()=>{for(const r of REGIONS)assert.ok(fs.existsSync(new URL('..'+r.image,import.meta.url)),r.image);});
