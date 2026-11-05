import { rollRareForm } from './rare-monsters.js';
import { freshLearning, noteSeen, noteAnswer } from './learning-record.js';
import { bossForStage } from './boss-dragons.js';
import { BALANCE, budgetAt } from './balance.js';
import { SPECIES } from './monsters.js';
import { generateQuestion, shuffle } from './learning.js';
export const shieldStat = m => m.maxShield*4+m.shieldFragments;
const baseline = m => ({ hp:m.maxHp, attack:m.attack, shieldStat:shieldStat(m) });
export function allocateStats(budget, rng=Math.random) {
  const candidates=[];
  for(let hp=Math.ceil(budget*.15);hp<=budget;hp++) {
    for(let attack=Math.ceil(budget*.15/1.5);attack*1.5+hp<=budget;attack++) {
      for(let shield=Math.ceil(budget*.15/3);hp+attack*1.5+shield*3<=budget;shield++) {
        const used=hp+attack*1.5+shield*3;
        if(used>=budget*.85) candidates.push({hp,attack,shield});
      }
    }
  }
  if(!candidates.length) throw new Error('No feasible stats');
  return candidates[Math.floor(rng()*candidates.length)];
}
let serial=0;
export function reserveMonsterIds(monsters){for(const m of monsters)serial=Math.max(serial,Number(m.id?.replace("m-",""))||0);}
export function createMonster(speciesId,stage=1,rng=Math.random) {
  const stats=allocateStats(budgetAt(stage),rng);
  const boss=!!SPECIES.find(s=>s.id===speciesId)?.isBoss;
  const m={id:`m-${++serial}`,speciesId,isBoss:boss,passiveTypes:boss?[...SPECIES.find(s=>s.id===speciesId).bossPassives]:[SPECIES.find(s=>s.id===speciesId).passive], evolutionStage:0,evolutionRoute:null,maxHp:stats.hp,currentHp:stats.hp,attack:stats.attack,maxShield:Math.floor(stats.shield/4),currentShield:Math.floor(stats.shield/4),shieldFragments:stats.shield%4};
  m.evolutionBaseline=baseline(m);
  return m;
}
export function addShield(m,fragments=0,whole=0) {
  const total=m.shieldFragments+fragments;
  const gain=Math.floor(total/4)+whole;
  m.shieldFragments=total%4; m.maxShield+=gain; m.currentShield+=gain;
}
export function evolve(m,route=null,force=false) {
  if(m.isBoss || m.evolutionStage>=2) return false;
  const b=m.evolutionBaseline;
  const eligible=[];
  if(m.maxHp>=b.hp*2) eligible.push('hp');
  if(m.attack>=b.attack*2) eligible.push('attack');
  if(m.maxShield>=3&&shieldStat(m)>=b.shieldStat*3) eligible.push('shield');
  route=route || BALANCE.evolutionPriority.find(r=>eligible.includes(r));
  if(!force&&!eligible.includes(route)) return false;
  const before={hp:m.maxHp,attack:m.attack,shield:m.maxShield};
  const threshold=route==='shield'?Math.max(12,b.shieldStat*3):b[route]*2;
  if(route==='hp') { m.maxHp+=Math.max(1,Math.ceil(m.maxHp*.2)); m.currentHp=m.maxHp; }
  if(route==='attack') { m.attack+=Math.max(1,Math.ceil(m.attack*.15)); m.currentHp=m.maxHp; }
  if(route==='shield') { addShield(m,0,1); m.currentShield=m.maxShield; }
  m.lastEvolution={route,before,threshold,after:{hp:m.maxHp,attack:m.attack,shield:m.maxShield}};
  m.evolutionStage++;m.evolutionRoute=route;m.evolutionBaseline=baseline(m);
  return true;
}
export function makeEnemy(stage,rng=Math.random,recent=[]) {
  const boss=stage%10===0;
  const available=SPECIES.filter(s=>!s.isBoss&&(s.stageMin||1)<=stage);
  const fresh=available.filter(s=>!recent.includes(s.id));
  const pool=fresh.length?fresh:available;
  const species=boss?bossForStage(stage).id:pool[Math.floor(rng()*pool.length)].id;
  const m=createMonster(species,stage,rng);
  if(!boss&&stage>=BALANCE.wildEvolutionStart&&rng()<((stage-30)/70)*BALANCE.wildEvolutionMaxChance) {
    evolve(m,['hp','attack','shield'][Math.floor(rng()*3)],true);
    if(stage>=71&&rng()<.3) evolve(m,['hp','attack','shield'][Math.floor(rng()*3)],true);
  }
  // Encounter HP tuning is separate from the valid initial stat allocation.
  // Persistent stats include this bonus, so captures keep this exact individual.
  m.maxHp=Math.max(m.maxHp,Math.ceil((BALANCE.encounterHpBase+stage*BALANCE.encounterHpPerStage)*(boss?BALANCE.bossHpMultiplier:1)));
  m.currentHp=m.maxHp;m.evolutionBaseline=baseline(m);m.rareForm=rollRareForm(rng);
  return m;
}
export function newGame(speciesId,inheritance=null,rng=Math.random,learning=freshLearning()) {
  const starter=createMonster(speciesId,1,rng);
  if(inheritance) { starter.evolutionStage=inheritance.evolutionStage;starter.evolutionRoute=inheritance.evolutionRoute;starter.rareForm=inheritance.rareForm||null; }
  learning.session++;
  const g={learning,firstRight:0,firstTotal:0,stage:1,party:[starter],activeMonsterId:starter.id,phase:'battle',recent:[],correct:0,total:0,captured:0,startedAt:Date.now()};
  beginBattle(g,rng);return g;
}
export const activeMonster = g => g.party.find(m=>m.id===g.activeMonsterId);
export function nextQuestion(g,rng=Math.random) {
  g.question=generateQuestion(g.stage,g.recent,rng,g.learning);g.recent.push(g.question.id);
  g.rejected=[];g.readingHelp=false;g.readingHelpUsed=false;g.questionAttempts=0;g.enemyCombo=0;noteSeen(g.learning,g.question);
  if(g.recent.length>BALANCE.recentQuestions) g.recent.shift();
}
export function beginBattle(g,rng=Math.random) {
  g.pending=null;g.luckyEvent=null;g.phase='battle';g.enemy=makeEnemy(g.stage,rng,g.recentSpecies||[]);
  g.recentSpecies=[...(g.recentSpecies||[]),g.enemy.speciesId].slice(-3);g.playerCombo=0;g.enemyCombo=0;g.highestCombo=0;g.growthCombo=0;g.attempts=0;g.feedback=null;g.captureResult=null;g.special=null;g.rewardChoices=[];g.evolved=[];
  if(g.stage%10!==0&&rng()<LUCKY_EVENT_CHANCE){g.phase='lucky-event';g.question=null;g.rejected=[];g.luckyEvent={reward:['golden-net','shield-all','restore-all'][Math.min(2,Math.floor(rng()*3))],claimed:false};return;}
  nextQuestion(g,rng);
}
export function hit(m,damage) {
  if(m.currentShield>0) {m.currentShield--;return {blocked:true,damage:0};}
  const actual=Math.min(m.currentHp,damage);m.currentHp=Math.max(0,m.currentHp-damage);return {blocked:false,damage:actual};
}
export const bossPassiveCount = stage => stage<40?0:stage<80?1:2;
export function bossAttack(enemy,player,combo,stage) {
  const passives=enemy.isBoss&&combo>=2?enemy.passiveTypes.slice(0,bossPassiveCount(stage)):[];
  const ultimate=combo===3;
  if(passives.includes('heal')) enemy.currentHp=Math.min(enemy.maxHp,enemy.currentHp+player.attack);
  if(passives.includes('growth')) enemy.currentShield=Math.min(enemy.maxShield,enemy.currentShield+BALANCE.bossShieldRegen);
  const baseDamage=Math.ceil(enemy.attack*(1+(passives.includes('attack')?.5:0)+(ultimate?.5:0)));
  const damage=ultimate&&baseDamage<player.currentHp?Math.max(baseDamage,Math.floor(player.currentHp*.9)):baseDamage;
  return {...hit(player,damage),ultimate,passives,baseDamage,rawDamage:damage};
}
export function answer(g,index,rng=Math.random) {
  if(g.phase!=='battle'||g.feedback||g.pending||!Number.isInteger(index)||index<0||index>=4||g.rejected.includes(index)) return;
  const p=activeMonster(g),enemy=g.enemy;
  const correct=index===g.question.correctIndex;g.total++;g.questionAttempts++;
  if(g.questionAttempts===1){g.firstTotal++;if(correct)g.firstRight++;}
  noteAnswer(g.learning,g.question,correct,g.questionAttempts,Date.now(),!!g.readingHelpUsed);
  let result;
  if(correct) {
    g.correct++;g.playerCombo++;g.enemyCombo=0;g.highestCombo=Math.max(g.highestCombo,g.playerCombo);
    if(p.passiveTypes.includes('growth')) g.growthCombo=Math.max(g.growthCombo,g.playerCombo);
    const bonus=p.passiveTypes.includes('attack')?Math.max(0,g.playerCombo-1)*BALANCE.attackCombo:0;
    result=hit(enemy,Math.ceil(p.attack*(1+bonus)));
    if(p.passiveTypes.includes('heal')&&g.playerCombo>=2) p.currentHp=Math.min(p.maxHp,p.currentHp+Math.ceil(p.maxHp*BALANCE.healCombo*(g.playerCombo-1)));
  } else { g.rejected.push(index);g.playerCombo=0;g.enemyCombo=g.rejected.length;result=bossAttack(enemy,p,g.enemyCombo,g.stage); }
  g.feedback={correct,selected:index,...result};
  if(enemy.currentHp===0) {
    g.pending='capture';
    rollRewards(g,rng);
  } else if(p.currentHp===0) {
    const next=g.party.find(m=>m.currentHp>0);
    if(next) {g.activeMonsterId=next.id;g.playerCombo=0;g.feedback.switched=true;}
    else g.pending='game-over';
  }
  return g.feedback;
}
export function continueBattle(g,rng=Math.random) {
  if(!g.feedback) return;
  const correct=g.feedback.correct;g.feedback=null;
  if(g.pending) {g.phase=g.pending;g.pending=null;} else if(correct) nextQuestion(g,rng);
}
export function capture(g,rng=Math.random) {
  if(g.phase!=='capture'||g.attempts>=3||g.captureResult==='success') return false;
  g.attempts++;
  const chance=Math.min(.95,(g.enemy.isBoss?BALANCE.captureBoss:BALANCE.captureNormal)+(g.captureBoost||0));
  const golden=(g.goldenNets||0)>0;
  if(golden)g.goldenNets--;
  if(golden||rng()<chance) {
    const m=structuredClone(g.enemy);m.currentHp=BALANCE.captureHealHp?m.maxHp:Math.max(1,m.currentHp);
    if(m.rareForm)g.rareFinds=[...(g.rareFinds||[]),{speciesId:m.speciesId,rareForm:m.rareForm,evolutionStage:0}];
    g.captured++;g.captureResult='success';g.candidate=m;
    if(g.party.length<3) {g.party.push(m);g.candidate=null;} else g.phase='party-management';
    return true;
  }
  g.captureResult='failed';return false;
}
export function replaceCapture(g,id=null) {
  if(g.phase!=='party-management') return;
  if(id) {const index=g.party.findIndex(m=>m.id===id);if(index<0)return;g.party[index]=g.candidate;if(g.activeMonsterId===id)g.activeMonsterId=g.candidate.id;}
  g.candidate=null;g.phase='capture';
}
export const REWARDS={
  hp:{name:'HP Berry',description:'Max HP and HP +2',icon:'❤️',rarity:'Common',effect:'hp',value:2},
  shield:{name:'Shield Shard',description:'+1 shield piece. 4 make a shield!',icon:'🛡️',rarity:'Common',effect:'shards',value:1},
  heal:{name:'Heal Berry',description:'Heal half of your full HP',icon:'❤️',rarity:'Common',effect:'half-heal'},
  'shield-charge':{name:'Shield Charge',description:'Restore 1 used shield',icon:'🛡️',rarity:'Common',effect:'charge',value:1},
  'capture-up':{name:'Catch Charm',description:'Catch chance +10% this run',icon:'◎',rarity:'Common',effect:'catch',value:.1,scope:'run'},
  'hp-three':{name:'Big HP Berry',description:'Max HP and HP +3',icon:'❤️',rarity:'Uncommon',effect:'hp',value:3},
  'shield-pair':{name:'Shard Pair',description:'+2 shield pieces',icon:'🛡️',rarity:'Uncommon',effect:'shards',value:2},
  'heal-full':{name:'Full Heal',description:'Fill one monster’s HP',icon:'❤️',rarity:'Uncommon',effect:'heal'},
  'shield-charge-plus':{name:'Shield Charge Plus',description:'Restore 2 used shields',icon:'🛡️',rarity:'Uncommon',effect:'charge',value:2},
  'capture-up-plus':{name:'Big Catch Charm',description:'Catch chance +20% this run',icon:'◎',rarity:'Uncommon',effect:'catch',value:.2,scope:'run'},
  attack:{name:'Power Stone',description:'Attack +1',icon:'💪',rarity:'Uncommon',effect:'attack',value:1},
  'heal-all':{name:'Team Heal',description:'Fill your team’s HP',icon:'❤️',rarity:'Rare',effect:'heal',scope:'team'},
  'shield-one':{name:'New Shield',description:'Max shield and shield +1',icon:'🛡️',rarity:'Rare',effect:'shield',value:1},
  'hp-extra':{name:'Life Berry',description:'Max HP and HP +5',icon:'❤️',rarity:'Rare',effect:'hp',value:5},
  'shield-heal-all':{name:'Team Shield Repair',description:'Fill your team’s shields',icon:'🛡️',rarity:'Rare',effect:'repair',scope:'team'},
  'attack-all':{name:'Power Song',description:'Team attack +1',icon:'💪',rarity:'Rare',effect:'attack',value:1,scope:'team'},
  'attack-two':{name:'Great Power Stone',description:'Attack +2',icon:'💪',rarity:'Epic',effect:'attack',value:2},
  'shield-all':{name:'Team Shield',description:'Team max shield and shield +1',icon:'🛡️',rarity:'Epic',effect:'shield',value:1,scope:'team'},
  'restore-all':{name:'Team Full Restore',description:'Fill all team HP and shields',icon:'❤️ 🛡️',rarity:'Epic',effect:'restore',scope:'team'},
  'golden-net':{name:'Golden Net',description:'Your next catch always works!',icon:'🥅',rarity:'Epic',effect:'golden-net',scope:'run'},
};
export function rollRewards(g,rng=Math.random){
  // Roll once per victory. Backing out of the target screen keeps the same loot.
  if(g.rewardChoices?.length)return g.rewardChoices;
  const pool=Object.keys(REWARDS);
  const pick=rates=>{
    const groups=Object.entries(rates).map(([rarity,chance])=>({chance,ids:pool.filter(id=>REWARDS[id].rarity===rarity)})).filter(group=>group.ids.length);
    let n=rng()*groups.reduce((sum,group)=>sum+group.chance,0);
    const group=groups.find(group=>(n-=group.chance)<0)||groups.at(-1);
    return group.ids[Math.floor(rng()*group.ids.length)];
  };
  // Independent slots allow duplicates, including the bonus slot.
  g.rewardChoices=Array.from({length:3},()=>pick(BALANCE.lootRarity));
  g.special=null;
  if(g.growthCombo>=5||rng()<BALANCE.specialChance){
    g.special=pick(BALANCE.bonusLootRarity);g.rewardChoices.push(g.special);
  }
  return g.rewardChoices;
}
export const rewardMultiplier = g => 1+Math.max(0,g.growthCombo-1)*BALANCE.growthCombo;
export function chooseReward(g,type) {
  if(g.phase!=='reward'||!g.rewardChoices?.includes(type)||!REWARDS[type])return;
  g.selectedReward=type;
  g.phase='reward-target';
  if(REWARDS[type].scope)reward(g,type);
}
export function reward(g,type,targetId) {
  if(g.phase!=='reward-target'||!g.rewardChoices?.includes(type)) return;
  const item=REWARDS[type];if(!item)return;
  const m=g.party.find(m=>m.id===targetId);if(!item.scope&&!m)return;
  const targets=item.scope==='team'?g.party:item.scope==='run'?[]:[m];
  const amount=n=>Math.ceil(n*rewardMultiplier(g));
  const grows=['hp','attack','shards','shield'].includes(item.effect);
  const changed=grows?targets:[];
  if(item.effect==='catch')g.captureBoost=Math.min(.5,Number(((g.captureBoost||0)+item.value).toFixed(2)));
  else if(item.effect==='golden-net')g.goldenNets=(g.goldenNets||0)+1;
  else for(const target of targets){
    if(item.effect==='hp'){const n=amount(item.value);target.maxHp+=n;target.currentHp+=n;}
    if(item.effect==='attack')target.attack+=amount(item.value);
    if(item.effect==='shards')addShield(target,amount(item.value));
    if(item.effect==='shield')addShield(target,0,amount(item.value));
    if(item.effect==='half-heal')target.currentHp=Math.min(target.maxHp,target.currentHp+Math.ceil(target.maxHp/2));
    if(item.effect==='charge')target.currentShield=Math.min(target.maxShield,target.currentShield+item.value);
    if(['heal','restore'].includes(item.effect))target.currentHp=target.maxHp;
    if(['repair','restore'].includes(item.effect))target.currentShield=target.maxShield;
  }
  g.evolved=changed.filter(p=>evolve(p)).map(p=>p.id);
  if(g.evolved.length) g.phase='evolution';else g.phase='camp';
}
export function nextStage(g,rng=Math.random) {
  if(g.phase!=='camp')return;
  if(g.stage===100) {g.phase='clear';return;}
  g.stage++;beginBattle(g,rng);
}

export const LUCKY_EVENT_CHANCE=.0075;
export function claimLuckyEvent(g){
 if(g.phase!=='lucky-event'||!g.luckyEvent||g.luckyEvent.claimed)return false;
 const type=g.luckyEvent.reward;
 if(!['golden-net','shield-all','restore-all'].includes(type))return false;
 g.luckyEvent.claimed=true;g.growthCombo=0;g.rewardChoices=[type];g.selectedReward=type;g.phase='reward-target';
 // The spring always gives a net too, so arriving with full resources still helps.
 if(type==='restore-all')g.goldenNets=(g.goldenNets||0)+1;
 reward(g,type);return true;
}
