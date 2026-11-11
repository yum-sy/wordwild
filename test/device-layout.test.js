import test from 'node:test';
import assert from 'node:assert/strict';
import {windowLayout,arenaBudget} from '../src/device-layout.js';
test('folding and rotating selects a layout from usable dimensions',()=>{
 for(const [w,h,expected] of [[344,882,'stack'],[691,829,'stack'],[829,691,'stack'],[882,344,'wide'],[768,1024,'stack'],[1024,768,'wide'],[507,1000,'stack'],[960,600,'wide']])assert.equal(windowLayout(w,h),expected);
});
test('learning gets space before arena; large screens still show a substantial battle',()=>{
 assert.ok(arenaBudget(504,360)+360+8<=504);
 assert.ok(arenaBudget(968,360)>400);
 assert.ok(arenaBudget(504,420)<arenaBudget(504,360));
 assert.equal(arenaBudget(300,400),60);
});
