import test from 'node:test';import assert from 'node:assert/strict';
import {setupInstall,installInstructions} from '../src/install.js';
test('installation instructions distinguish iOS, iPad desktop mode and Android',()=>{
 for(const nav of [{userAgent:'iPhone'},{userAgent:'Macintosh',platform:'MacIntel',maxTouchPoints:5}])assert.match(installInstructions(nav),/Share/);
 assert.match(installInstructions({userAgent:'Android'}),/browser menu/);
});
test('install prompt is consumed once and standalone status follows installation',async()=>{
 const listeners={};const host={navigator:{},matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener:(n,f)=>listeners[n]=f};let prompts=0;
 const install=setupInstall(()=>{},host);assert.equal(await install.prompt(),false);
 listeners.beforeinstallprompt({preventDefault(){},prompt:async()=>prompts++,userChoice:Promise.resolve({outcome:'dismissed'})});
 assert.equal(await install.prompt(),true);assert.equal(await install.prompt(),false);assert.equal(prompts,1);assert.equal(install.isStandalone(),false);listeners.appinstalled();assert.equal(install.isStandalone(),true);
});
