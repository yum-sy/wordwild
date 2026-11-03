import test from 'node:test';
import assert from 'node:assert/strict';
import {createTapGate} from '../src/input-guard.js';
const setup=()=>{let t=0;return {gate:createTapGate({now:()=>t}),tick:n=>t+=n};};
test('a small finger wobble is a tap; a drag that returns to the start is cancelled',()=>{
 const {gate:g,tick}=setup(),a={};g.down(1,0,0,a);g.move(1,8,8);g.up(1,8,8,a);assert.ok(g.click(a));
 tick(400);g.down(1,0,0,a);g.move(1,30,0);g.up(1,0,0,a);assert.equal(g.click(a),false);
});
test('release on another control, long hold and pointer cancellation cannot activate',()=>{
 const {gate:g,tick}=setup(),a={},b={};g.down(1,0,0,a);g.up(1,0,0,b);assert.equal(g.click(b),false);
 g.down(1,0,0,a);tick(800);g.up(1,0,0,a);assert.equal(g.click(a),false);
 g.down(1,0,0,a);g.cancel(1);assert.equal(g.click(a),false);
});
test('two fingers cancel both taps and a fresh single tap still works',()=>{
 const {gate:g}=setup(),a={};g.down(1,0,0,a);g.down(2,10,10,a);g.up(1,0,0,a);assert.equal(g.click(a),false);g.up(2,10,10,a);assert.equal(g.click(a),false);
 g.down(3,0,0,a);g.up(3,0,0,a);assert.ok(g.click(a));
});
test('rapid follow-through cannot activate a replacement button; keyboard remains usable',()=>{
 const {gate:g,tick}=setup(),a={},b={};g.down(1,0,0,a);g.up(1,0,0,a);assert.ok(g.click(a));
 tick(100);g.down(2,0,0,b);g.up(2,0,0,b);assert.equal(g.click(b),false);
 tick(400);assert.ok(g.click(b,true));tick(400);g.down(3,0,0,a);g.up(3,0,0,a);assert.equal(g.click(b),false);
 g.reset();assert.equal(g.click(a),false);
});
