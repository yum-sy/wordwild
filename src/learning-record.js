export const LEARNING_KEY='wordwild-learning-v2';
export function freshLearning(){return {version:2,sequence:0,session:0,items:{},skills:{},levels:{},recentFamilies:[],firstRight:0,firstTotal:0};}
export function normalizeLearning(value){
 const p=freshLearning();if(!value||value.version!==2)return p;
 for(const key of ['sequence','session','firstRight','firstTotal'])if(Number.isSafeInteger(value[key])&&value[key]>=0)p[key]=value[key];
 for(const key of ['items','skills','levels'])if(value[key]&&typeof value[key]==='object'&&!Array.isArray(value[key]))for(const [id,r] of Object.entries(value[key])){
  if(id==='__proto__'||id==='constructor'||!r||typeof r!=='object')continue;
  const safe={};for(const field of ['firstTotal','seen','firstRight','wrong','last','due','dueAt','session','lastSeen','attempts','retryNeeded','successAt','delayedRight'])if(Number.isFinite(r[field])&&r[field]>=0)safe[field]=r[field];
  if(Array.isArray(r.contexts))safe.contexts=r.contexts.filter(x=>typeof x==='string').slice(-8);
  p[key][id]=safe;
 }
 p.recentFamilies=Array.isArray(value.recentFamilies)?value.recentFamilies.filter(x=>typeof x==='string').slice(-5):[];
 return p;
}
export function loadLearning(storage){try{return normalizeLearning(JSON.parse(storage.getItem(LEARNING_KEY)));}catch{return freshLearning();}}
export function saveLearning(storage,p){try{storage.setItem(LEARNING_KEY,JSON.stringify(p));return true;}catch{return false;}}
export function noteSeen(p,q){p.sequence++;const r=p.items[q.id]||={};const s=p.skills[q.skillId]||={};s.seen=(s.seen||0)+1;r.seen=(r.seen||0)+1;r.lastSeen=p.sequence;p.recentFamilies=[...p.recentFamilies,q.familyId].slice(-5);}
export function noteAnswer(p,q,correct,attempt,now=Date.now(),assisted=false){
 const r=p.items[q.id]||={};const s=p.skills[q.skillId]||={};
 r.attempts=(r.attempts||0)+1;
 if(attempt===1){p.firstTotal++;if(correct)p.firstRight++;const level=(p.levels||={})[q.grammarLevel]||={firstTotal:0,firstRight:0};level.firstTotal++;if(correct)level.firstRight++;}
 for(const entry of [r,s]){
  entry.last=p.sequence;entry.session=p.session;
  if(!correct){entry.retryNeeded=1;entry.contexts=[];entry.successAt=0;entry.delayedRight=0;entry.wrong=(entry.wrong||0)+1;entry.due=p.sequence+4;entry.dueAt=now+86400000;}
  else if(attempt===1&&!assisted){const context=q.contextId||q.id;entry.contexts=[...new Set([...(entry.contexts||[]),context])].slice(-8);
   if(entry.successAt&&now-entry.successAt>=86400000)entry.delayedRight=(entry.delayedRight||0)+1;
   if(!entry.successAt)entry.successAt=now;
   entry.retryNeeded=(entry.wrong||0)>0&&!((entry===r||entry.contexts.length>=2)&&entry.delayedRight>0)?1:0;entry.firstRight=(entry.firstRight||0)+1;entry.due=p.sequence+Math.min(80,20*(entry.firstRight||1));entry.dueAt=now+86400000*Math.min(7,entry.firstRight||1);}
  // A corrected answer is not independent recall; retain its short review deadline.
 }
}
export const needsReview=r=>!!r&&(r.retryNeeded!==undefined?r.retryNeeded===1:(r.wrong||0)>0&&(r.due??Infinity)-(r.last||0)<=4);
export function isDue(r,p,now=Date.now()){return !!r&&((r.due??Infinity)<=p.sequence||(r.dueAt??Infinity)<=now||(needsReview(r)&&(r.session??p.session)<p.session));}
