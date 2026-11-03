import { BOSS_DRAGONS } from './boss-dragons.js';
import { MONSTER_FRAMES } from './monster-frames.js';
import { EXPANSION_SPECIES } from './monster-expansion.js';
export const SPECIES = [
  { id:'sprout', name:'Thornix', title:'The leaf raptor', passive:'growth', color:'#9be569', dark:'#4d9d59', type:'LEAF', cell:0, note:'Fast claws. Big growth.' },
  { id:'ember', name:'Pyrofang', title:'The fire wolf', passive:'attack', color:'#ffac57', dark:'#d8623e', type:'FIRE', cell:1, note:'A brave heart. A fierce bite.' },
  { id:'aqua', name:'Riptide', title:'The steel shark', passive:'heal', color:'#74d8ed', dark:'#4d97cb', type:'WATER', cell:2, note:'Strong armor. A kind heart.' },
  { id:'mush', name:'Shroomshade', title:'The hidden hunter', passive:'heal', color:'#c7a1ed', dark:'#8d6fb7', type:'SPORE', cell:3, note:'Small steps. Sharp blades.' },
  { id:'sun', name:'Voltusk', title:'The thunder beetle', passive:'attack', color:'#f8d365', dark:'#bd983d', type:'SPARK', cell:7, note:'Gold armor. Thunder horns.' },
  { id:'cloud', name:'Stormwing', title:'The sky hunter', passive:'growth', color:'#9cbbff', dark:'#6589db', type:'SKY', cell:11, note:'Ride the wind. Rule the sky.' },
  ...BOSS_DRAGONS,
  ...EXPANSION_SPECIES,
];
export const speciesOf = m => SPECIES.find(s=>s.id===m.speciesId)||SPECIES[0];
export const monsterName = m => speciesOf(m).name;
export const PASSIVES = {
  attack:{name:'Power',icon:'✦',description:'Get 2 right. Hit harder!'},
  heal:{name:'Heal',icon:'♥',description:'Get 2 right. Gain HP!'},
  growth:{name:'Grow',icon:'◆',description:'Get 2 right. Get more loot!'},
};
// One base sprite per species. Evolution reuses it with CSS scale, tint and aura only.
export function monsterArt(m,size=160) {
  const s=typeof m==='string'?SPECIES.find(s=>s.id===m):speciesOf(m);
  const evo=typeof m==='object'?m.evolutionStage||0:0;
  const sparkles=typeof m==='object'&&['gold','silver','large'].includes(m.rareForm)?'<i class="rare-sparkles">'+Array.from({length:6},(_,i)=>`<i class="rare-sparkle sparkle-${i}"></i>`).join('')+'</i>':'';
  const atlas=s.atlas||'original';
  const cell=s.cell,col=cell%4,row=Math.floor(cell/4);
  const frame=MONSTER_FRAMES[atlas]?.[cell];
  return `<span class="monster-art rare-${typeof m==='object'?m.rareForm||'normal':'normal'} atlas-${atlas} evo-${evo} ${typeof m==='object'?m.evolutionRoute||'':''}" style="--sprite-x:${frame?.x??col*100/3}%;--sprite-y:${frame?.y??row*100/3}%;--sprite-sheet-size:${frame?.zoom||400}%;--sprite-clip:${frame?.clip||'0%'};--sprite-size:${size}px;--aura:${s.color}" aria-hidden="true"><span class="sprite-pixels"></span>${sparkles}</span>`;
}
