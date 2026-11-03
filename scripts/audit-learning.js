import fs from 'node:fs';
import {QUESTIONS,CURRICULUM,generateQuestion,sceneArt} from '../src/learning.js';
import {freshLearning,noteSeen,noteAnswer} from '../src/learning-record.js';
let seed=9321;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
const p=freshLearning(),runs=[];
for(let run=1;run<=5;run++){
 p.session++;let fresh=0,review=0,practice=0;const recent=[];
 for(let stage=1;stage<=100;stage++)for(let n=0;n<3;n++){
  const q=generateQuestion(stage,recent,rng,p);if(!p.items[q.id]?.seen)fresh++;if(q.sourceType==='review')review++;if(q.sourceType==='practice')practice++;
  noteSeen(p,q);recent.push(q.id);if(recent.length>8)recent.shift();
  // Synthetic responses exercise the engine; they do not measure child learning.
  const correct=rng()<.7;noteAnswer(p,q,correct,1,Date.now());if(!correct)noteAnswer(p,q,true,2,Date.now());
 }
 runs.push({run,questions:300,unseen:fresh,review,practice,firstRight:p.firstRight,firstTotal:p.firstTotal});
}
const unique=new Set(QUESTIONS.map(q=>JSON.stringify([q.prompt,q.scene,q.passage,q.options]))).size;
const report={note:'Seeded software simulation, not a child study. 3 questions per stage, synthetic 70% first-try correctness. Scheduling uses real wall-clock time.',total:QUESTIONS.length,unique,levels:CURRICULUM.map((name,i)=>({stages:`${i*10+1}-${i*10+10}`,name,count:QUESTIONS.filter(q=>q.grammarLevel===i+1).length,families:new Set(QUESTIONS.filter(q=>q.grammarLevel===i+1).map(q=>q.familyId)).size})),runs};
for(const q of QUESTIONS)for(const id of [q.scene,...q.options.map(o=>o.imageId)].filter(Boolean))if(!sceneArt(id)||sceneArt(id).includes('undefined'))throw Error(q.id);
fs.writeFileSync('docs/curriculum/v2-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
