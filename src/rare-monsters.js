// Total rare encounter chance: 1%, independently rolled per monster.
export const RARE_CHANCE=.01;
// Preserve the original Giant : Silver : Gold ratio of 6 : 2 : 1.
export const RARE_FORMS=Object.freeze({large:{name:'Giant',chance:RARE_CHANCE*6/9},silver:{name:'Silver',chance:RARE_CHANCE*2/9},gold:{name:'Gold',chance:RARE_CHANCE/9}});
export function rollRareForm(rng=Math.random){const n=rng();if(n<RARE_FORMS.gold.chance)return 'gold';if(n<RARE_FORMS.gold.chance+RARE_FORMS.silver.chance)return 'silver';if(n<RARE_CHANCE)return 'large';return null;}
export const rareLabel=m=>RARE_FORMS[m?.rareForm]?.name||'';
export function normalizeCollection(value){if(!Array.isArray(value))return [];const seen=new Set();return value.filter(x=>{if(!x||typeof x.speciesId!=='string'||!RARE_FORMS[x.rareForm])return false;const k=x.speciesId+':'+x.rareForm;if(seen.has(k))return false;seen.add(k);return true;}).map(x=>({speciesId:x.speciesId,rareForm:x.rareForm,evolutionStage:0}));}
export function mergeCollection(a,b){return normalizeCollection([...(a||[]),...(b||[])]);}
