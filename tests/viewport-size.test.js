import test from 'node:test';import assert from 'node:assert/strict';
import {visibleHeight} from '../src/viewport-size.js';
test('visible browser height excludes toolbars even when layout height is larger',()=>{
 assert.equal(visibleHeight({innerHeight:844,visualViewport:{height:660,scale:1}}),660);
 assert.equal(visibleHeight({innerHeight:660,visualViewport:{height:844,scale:1}}),660);
 assert.equal(visibleHeight({innerHeight:844}),844);
 assert.equal(visibleHeight({innerHeight:844,visualViewport:{height:422,scale:2}}),844);
});

test('page minimum height cannot override a smaller visible viewport',async()=>{
 const {readFile}=await import('node:fs/promises');
 const styles=await readFile(new URL('../src/style.css',import.meta.url),'utf8');
 const screens=await readFile(new URL('../src/screens.css',import.meta.url),'utf8');
 assert.doesNotMatch(styles,/min-height:\s*100vh/);
 assert.match(screens,/height:var\(--app-height\);min-height:0;max-height:var\(--app-height\)/);
});
