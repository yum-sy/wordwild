import { normalizeLearning } from './learning-record.js';
import { SPECIES } from './monsters.js';
import { continueBattle, reserveMonsterIds, REWARDS } from './game.js';
export const RUN_KEY='wordwild-run-v1';
const phases=['lucky-event','battle','capture','party-management','reward','reward-target','evolution','camp','clear'];
export function saveRun(storage,game){try{if(!game||game.phase==='game-over'||game.pending==='game-over'){storage.removeItem(RUN_KEY);}else storage.setItem(RUN_KEY,JSON.stringify({version:1,game}));return true;}catch{return false;}}
export function loadRun(storage){try{
 const data=JSON.parse(storage.getItem(RUN_KEY)),g=data?.game;
 if(data?.version!==1||!g||!phases.includes(g.phase)||g.pending==='game-over'||!Number.isInteger(g.stage)||g.stage<1||g.stage>100) return null;
 const valid=m=>m&&SPECIES.some(s=>s.id===m.speciesId)&&typeof m.id==='string'&&['maxHp','currentHp','attack','maxShield','currentShield','shieldFragments'].every(k=>Number.isFinite(m[k])&&m[k]>=0)&&m.maxHp>0&&Array.isArray(m.passiveTypes)&&m.evolutionBaseline;
 if(!Array.isArray(g.party)||g.party.length<1||g.party.length>3||!g.party.every(valid)||!valid(g.enemy)||!g.party.some(m=>m.id===g.activeMonsterId&&m.currentHp>0))return null;
 if(g.luckyEvent&&(!['golden-net','shield-all','restore-all'].includes(g.luckyEvent.reward)||typeof g.luckyEvent.claimed!=='boolean'))return null;
 if(g.phase==='lucky-event'&&(!g.luckyEvent||g.stage%10===0||g.luckyEvent.claimed))return null;
 if(!(g.luckyEvent&&['lucky-event','camp','evolution'].includes(g.phase))&&(!g.question||!Array.isArray(g.question.options)||g.question.options.length!==4||!Number.isInteger(g.question.correctIndex)||g.question.correctIndex<0||g.question.correctIndex>3||!Array.isArray(g.rejected)||!Array.isArray(g.recent)))return null;
 if(!Array.isArray(g.rewardChoices)||g.rewardChoices.some(id=>!REWARDS[id])||g.phase==='reward-target'&&!REWARDS[g.selectedReward]||g.phase==='party-management'&&!valid(g.candidate))return null;
 g.learning=normalizeLearning(g.learning);reserveMonsterIds([...g.party,g.enemy,g.candidate].filter(Boolean));
 // Damage and learning were committed before animation. Finish presentation only.
 if(g.feedback)continueBattle(g);
 return g;
 }catch{return null;}}
