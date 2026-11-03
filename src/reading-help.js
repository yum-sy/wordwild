const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hints={sequence:'Look for first, then, and after.',reference:'Look at the names. Who has each thing?',cause:'Read what happened before the action.',inference:'Read all the clues together.',quantity:'Read the numbers and what changes.',time:'Look for when things happen.',instruction:'Look for what you can or cannot do.',intent:'What does the person want?',idiom:'Read the whole scene. Think about the meaning.'};
export function readingHint(q){
 if(!q.passage)return '';
 const key=q.skillId?.split(':')[1];
 if(hints[key])return hints[key];
 if(q.skillId?.startsWith('expression:'))return 'How does the person feel? What do they need?';
 return 'Find the person or thing in the question. Read that line.';
}
export function readingPassage(q,help=false){
 if(!help)return escape(q.passage||'');
 // Highlight question anchors only. Never inspect the answer or eliminate a choice.
 const stop=new Set('a an the is are am do does did what which who where when why how choose find with of in on at to for has have can should must it this that story person sentence true'.split(' '));
 const anchors=new Set((q.prompt.toLowerCase().match(/[a-z]+/g)||[]).filter(w=>w.length>1&&!stop.has(w)));
 return (q.passage||'').split(/([A-Za-z]+(?:['’][A-Za-z]+)?)/).map(word=>anchors.has(word.toLowerCase())?`<mark>${escape(word)}</mark>`:escape(word)).join('');
}
