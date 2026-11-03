// These are authored design bands, not validated CEFR levels or child ability scores.
export function designQuestion(q){
 const level=q.grammarLevel;
 q.objective=q.skillId;
 q.difficulty=1;
 q.prerequisites=[];
 if(level===2&&q.skillId.startsWith('category:')){q.difficulty=2;q.prerequisites=['familiar object names'];}
 if(level===6){q.difficulty=q.skillId.startsWith('action:')?1:2;q.prerequisites=['action or position words'];}
 if(level===7){q.prerequisites=['object names','one and two'];q.difficulty=q.skillId==='grammar:article'?1:2;}
 if(level===8&&q.questionType==='fill-blank'){
  const subject=q.prompt.match(/^(I|You|He|She|We|They)\b/)?.[1]||q.prompt.match(/day, (I|you|he|she|we|they)/)?.[1];
  q.skillId+=['he','she'].includes(subject?.toLowerCase())?':singular':':other';q.objective=q.skillId;
  q.difficulty=q.skillId.startsWith('grammar:present')?2:1;q.prerequisites=['short sentences','subject words'];
 }
 if(q.passage){
  q.prerequisites=['short sentences','familiar words in context'];
  q.difficulty=q.id.includes('bridge-')||level===9&&q.familyId.includes('story-')?1:2;
  if(['reading:cause','reading:reference','reading:inference','reading:quantity'].includes(q.skillId))q.difficulty=2;
  if(q.skillId==='reading:idiom')q.difficulty=q.id.includes('bridge-')?2:3;
 }
 if(q.skillId.startsWith('expression:')){const n=Number(q.skillId.split(':')[1]);q.difficulty=n<=7?1:n===19?3:2;}
 if(level===8&&q.passage)q.difficulty=3;
 // New task demands enter gradually, without requiring mastery to progress in the game.
 q.stageMin=(level-1)*10+1+({1:0,2:3,3:6}[q.difficulty]);
 q.contextId=q.passage||q.scene||q.id;
 q.supportWords=q.passage?[...new Set(q.passage.toLowerCase().match(/[a-z]+/g)||[])]:[];
 return q;
}
