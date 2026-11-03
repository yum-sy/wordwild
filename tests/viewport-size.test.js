import test from 'node:test';import assert from 'node:assert/strict';
import {visibleHeight} from '../src/viewport-size.js';
test('visible browser height excludes toolbars even when layout height is larger',()=>{
 assert.equal(visibleHeight({innerHeight:844,visualViewport:{height:660,scale:1}}),660);
 assert.equal(visibleHeight({innerHeight:660,visualViewport:{height:844,scale:1}}),660);
 assert.equal(visibleHeight({innerHeight:844}),844);
 assert.equal(visibleHeight({innerHeight:844,visualViewport:{height:422,scale:2}}),844);
});
