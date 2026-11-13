import { pictogramPicture } from './pictogram-art.js';
import { designQuestion } from './curriculum-design.js';
import { wordPicture } from './word-pictures.js';
import { BALANCE } from './balance.js';
import { CONTENT_V2, CURRICULUM_V2, VOCABULARY_V2 } from './learning-content.js';
import { learningScene } from './learning-scenes.js';
import { isDue, needsReview } from './learning-record.js';
export const CURRICULUM=CURRICULUM_V2;
export const VOCABULARY=VOCABULARY_V2;
export const shuffle = (items, rng = Math.random) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [result[i],result[j]] = [result[j],result[i]]; }
  return result;
};
export const QUESTIONS=CONTENT_V2.map(designQuestion);
export function validateQuestions(){
 const ids=new Set();
 for(const q of QUESTIONS){
  if(ids.has(q.id)||q.options.length!==4||new Set(q.options.map(o=>o.text||o.imageId)).size!==4||q.correctIndex!==0||!q.skillId||!q.familyId)throw new Error('Invalid question: '+q.id);
  ids.add(q.id);
 }
 return true;
}
export function generateQuestion(stage,recent=[],rng=Math.random,profile=null){
 const current=Math.min(10,Math.max(1,Math.ceil(stage/10)));
 const eligible=QUESTIONS.filter(q=>q.grammarLevel<=current&&q.stageMin<=stage);
 const available=eligible.filter(q=>!recent.includes(q.id));
 const currentPool=available.filter(q=>q.grammarLevel===current);
 let candidates=[],sourceType='new';
 if(profile&&rng()>=.7){
  sourceType='review';
  // Keep old weak concepts eligible; prefer a current-level transfer when available.
  const due=available.filter(q=>isDue(profile.skills[q.skillId],profile)||isDue(profile.items[q.id],profile));
  const weak=due.filter(q=>needsReview(profile.skills[q.skillId]));
  candidates=weak.length?weak:due;
  if(candidates.length){
   const oldest=Math.min(...candidates.map(q=>profile.skills[q.skillId]?.due??profile.items[q.id]?.due??Infinity));
   candidates=candidates.filter(q=>(profile.skills[q.skillId]?.due??profile.items[q.id]?.due??Infinity)===oldest);
   const near=candidates.filter(q=>q.grammarLevel>=current-2);if(near.length)candidates=near;
  }
 }
 if(!candidates.length){sourceType='new';candidates=currentPool.length?currentPool:eligible.filter(q=>q.grammarLevel===current);}
 // Early encounters mix a small action strand with the main object strand.
 if(current===2&&sourceType!=='review'){
  const actionBranch=rng()<.2;
  const strand=candidates.filter(q=>q.skillId.startsWith('action:')===actionBranch);
  if(strand.length)candidates=strand;
 }
 // Choose a learning objective before choosing its wording or illustration.
 const skills=[...new Set(candidates.map(q=>q.skillId))];
 const exposure=k=>profile?.skills[k]?.seen||0;
 const least=Math.min(...skills.map(exposure));
 const targets=skills.filter(k=>exposure(k)===least);
 const target=targets[Math.min(targets.length-1,Math.floor(rng()*targets.length))];
 candidates=candidates.filter(q=>q.skillId===target);
 const unseen=candidates.filter(q=>!profile?.items[q.id]?.seen);if(unseen.length)candidates=unseen;
 const diverse=candidates.filter(q=>!profile?.recentFamilies.slice(-2).includes(q.familyId));if(diverse.length)candidates=diverse;
 if(profile&&candidates.every(q=>profile.items[q.id]?.seen)){
  const oldest=Math.min(...candidates.map(q=>profile.items[q.id].lastSeen||0));candidates=candidates.filter(q=>(profile.items[q.id].lastSeen||0)===oldest);
 }
 const source=candidates[Math.min(candidates.length-1,Math.floor(rng()*candidates.length))];
 if(sourceType==='new'&&profile?.skills[source.skillId]?.seen)sourceType='practice';
 const options=shuffle(source.options.map((o,i)=>({...o,correct:i===0})),rng);
 return {...source,sourceType,options,correctIndex:options.findIndex(o=>o.correct)};
}

export function sceneArt(id,{actionOnly=false}={}) {
  if(!id) return '';
  if(id.startsWith('learn:')){const data=JSON.parse(id.slice(6));if(actionOnly&&data.kind==='action')return pictogramPicture(data.action)||learningScene(data);return learningScene(data);}
  const colors=[['red','red','#e66e60'],['blue','blue','#6a9fcc'],['yellow','yellow','#edc95c'],['green','green','#89ac75']];
  const [kind,value] = id.split(':');
  if(kind==='word') return wordPicture(value);
  if(kind==='emoji') return `<span class="picture-emoji" aria-hidden="true">${value}</span>`;
  const wrap = body => `<svg class="scene-art" viewBox="0 0 200 140" aria-hidden="true">${body}</svg>`;
  const emoji = (e,x,y,size=60) => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle">${e}</text>`;
  if(kind==='ball') return wrap(`<ellipse cx="100" cy="120" rx="40" ry="6" fill="#d7d9ce"/><circle cx="100" cy="69" r="42" fill="${colors.find(c=>c[0]===value)[2]}"/><path d="M71 41Q88 27 105 31" fill="none" stroke="white" stroke-width="8" opacity=".45" stroke-linecap="round"/>`);
  if(kind==='size') return wrap(emoji(value.endsWith('cat')?'🐱':'🐶',100,value.startsWith('big')?115:92,value.startsWith('big')?100:40));
  if(kind==='shape') return wrap(value==='triangle'?'<path d="M100 20L160 120H40Z" fill="#e7bc69"/>':'<rect x="54" y="27" width="92" height="92" rx="5" fill="#a49bc7"/>');
  if(kind==='position') {
    const [x,y]=({'in':[100,85],'on':[100,29],'under':[100,116],'next to':[164,95]})[value];
    return wrap(`<path d="M44 47H139V100H44Z" fill="#d1aa77" stroke="#b28a5a" stroke-width="3"/>${value==='under'?'<path d="M40 102H144" stroke="#7d6f59" stroke-width="5"/>':''}<circle cx="${x}" cy="${y}" r="15" fill="#dd7965"/>${value==='in'?'<path d="M44 85H139V101H44Z" fill="#e2bd8c"/>':''}<path d="M44 48L59 31H124L139 48" fill="none" stroke="#b28a5a" stroke-width="3"/>`);
  }
  if(kind==='action') {
    const bodies={run:emoji('🏃',100,108,86),swim:emoji('🏊',100,106,88),sleep:emoji('🛏️',100,111,74)+emoji('💤',103,42,36),read:emoji('👧',100,68,53)+emoji('📖',100,119,61),eat:emoji('👦',100,63,49)+emoji('🥄',143,88,32)+emoji('🍝',100,118,53),dance:emoji('💃',100,114,86)+emoji('♪',151,43,30)};
    return wrap(bodies[value]);
  }
  const contexts={rain:emoji('🌧️',48,45,46)+emoji('☂️',116,62,62)+emoji('🧍',104,132,71),bed:emoji('🌙',153,39,36)+emoji('🛏️',91,123,84),food:emoji('👧',60,85,65)+emoji('🍽️',143,106,66),cold:emoji('❄️',49,51,40)+emoji('🥶',108,111,71),water:emoji('👦',55,91,63)+emoji('💧',144,91,60),morning:emoji('🌅',100,123,118)};
  return wrap(contexts[value]||'');
}
validateQuestions();
