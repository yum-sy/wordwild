import {writeFile,mkdir} from 'node:fs/promises';
import {QUESTIONS} from '../src/learning.js';
import {PICTOGRAMS} from '../src/pictogram-catalog.js';
import {isActionOnlyQuestion} from '../src/pictogram-art.js';
const inventory=new Map();
for(const q of QUESTIONS)for(const id of [q.scene,...q.options.map(o=>o.imageId)].filter(Boolean)){
 const data=id.startsWith('learn:')?JSON.parse(id.slice(6)):{kind:'legacy',id};
 const mode=data.kind==='action'?(isActionOnlyQuestion(q)?'action-only':'subject-specific'):data.kind;
 const key=JSON.stringify([id,mode]);
 if(!inventory.has(key))inventory.set(key,{imageId:id,mode,data,questions:[],review:mode==='subject-specific'||mode==='position'||(mode==='count'&&data.word==='watermelon')?'needs-review':'visual-reviewed',reason:mode==='subject-specific'?'Generic action pictograms cannot guarantee the required person/robot/bear. Retain subject-specific composition; educator review needed.':mode==='position'?'Keep explicit geometric relationship and review small-screen legibility, especially in/on/under/above.':mode==='count'&&data.word==='watermelon'?'Retain one code-drawn slice per item; ARASAAC whole fruit plus slice could imply two objects.':''});
 inventory.get(key).questions.push(q.id);
}
await mkdir('docs',{recursive:true});
await writeFile('docs/pictogram-audit.json',JSON.stringify({date:'2026-11-13',questions:QUESTIONS.length,mappings:PICTOGRAMS,images:[...inventory.values()]},null,2)+'\n');
console.log(JSON.stringify({questions:QUESTIONS.length,mapped:Object.keys(PICTOGRAMS).length,contexts:inventory.size,reviewContexts:[...inventory.values()].filter(x=>x.review==='needs-review').length}));
