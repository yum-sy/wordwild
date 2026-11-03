// Cosmetic only: the chosen answer position selects a family, not damage or type.
export const ATTACK_EFFECTS=Object.freeze([
 ['Crescent','slash'],['Twin Claw','slash'],['Cross Cut','slash'],['Spiral Blade','slash'],
 ['Water Ring','wave'],['Triple Ripple','wave'],['Wave Fan','wave'],['Bubble Comet','wave'],
 ['Thunder Arrow','spark'],['Zigzag Bolt','spark'],['Spark Spear','spark'],['Thunder Fork','spark'],
 ['Star Shot','star'],['Crystal Lance','star'],['Meteor Trio','star'],['Nova Bloom','star'],
].map(([name,family],id)=>Object.freeze({id,name,family})));
export function chooseAttackEffect(position,previous=-1,rng=Math.random){
 const slot=Number.isInteger(position)&&position>=0&&position<4?position:0;
 const choices=ATTACK_EFFECTS.filter(e=>Math.floor(e.id/4)===slot&&e.id!==previous);
 return choices[Math.min(choices.length-1,Math.max(0,Math.floor(rng()*choices.length)))].id;
}
const shapes=[
 '<path d="M23 97Q105 94 94 16Q128 93 23 97Z"/>',
 '<path d="M17 85Q74 82 79 20Q101 80 17 85ZM43 108Q105 103 107 43Q127 105 43 108Z"/>',
 '<path d="M20 22L108 99L68 72L23 105L52 61ZM106 18L72 57L99 87L59 70L30 91L49 55Z"/>',
 '<path d="M25 93Q-2 38 59 18Q109 7 112 58Q111 99 68 97Q38 93 47 66Q59 42 80 57Q60 51 59 71Q65 87 86 76Q108 51 83 35Q30 14 25 93Z"/>',
 '<circle cx="67" cy="64" r="36" fill="none" stroke-width="12"/><path d="M8 52H37M2 70H30" fill="none"/>',
 '<ellipse cx="43" cy="64" rx="14" ry="32" fill="none"/><ellipse cx="68" cy="64" rx="17" ry="42" fill="none"/><ellipse cx="94" cy="64" rx="20" ry="51" fill="none"/>',
 '<path d="M14 82Q37 17 69 48Q88 76 112 36Q111 106 14 82Z"/><path d="M24 76Q44 41 64 63Q90 87 102 62" fill="none" stroke="#efffff"/>',
 '<circle cx="86" cy="64" r="27"/><circle cx="41" cy="45" r="13"/><circle cx="28" cy="85" r="9"/><circle cx="10" cy="61" r="5"/>',
 '<path d="M8 47H65V22L121 64L65 106V79H8L27 63Z"/>',
 '<path d="M77 6L19 70H59L46 122L111 48H72Z"/>',
 '<path d="M3 55L77 40L67 18L124 62L69 104L80 80L3 73L28 64Z"/>',
 '<path d="M10 62L48 46L36 19L96 42L119 64L94 87L37 109L49 81Z"/><path d="M38 62H102M69 39L91 62L69 85" fill="none" stroke="#fff8d1"/>',
 '<path d="M68 8L81 43L119 47L90 72L98 110L66 90L33 111L42 74L13 48L52 43Z"/>',
 '<path d="M18 63L58 21L119 63L58 106Z"/><path d="M58 21L71 63L58 106M18 63H119" fill="none" stroke="#faffff"/>',
 '<path d="M4 37L64 28L80 43L63 56ZM21 69L90 52L120 69L91 88ZM3 99L55 87L71 100L56 113Z"/>',
 '<path d="M64 7L75 43L104 22L85 52L122 64L85 76L105 107L76 86L64 122L52 85L22 107L43 76L6 64L43 52L22 22L52 43Z"/><circle cx="64" cy="64" r="15" fill="#fffbe5"/>',
];
export function effectArt(id){const safe=ATTACK_EFFECTS[id]?id:0;return `<svg viewBox="0 0 128 128" aria-hidden="true" focusable="false"><g fill="var(--fx-color)" stroke="var(--fx-light)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">${shapes[safe]}</g></svg>`;}
export function effectMarkup(id,{correct=true,blocked=false,ultimate=false}={}){
 const e=ATTACK_EFFECTS[id]||ATTACK_EFFECTS[0];
 return `<div class="attack-fx varied-fx fx-${e.family} ${correct?'to-enemy':'to-player'} ${blocked?'fx-blocked':''} ${ultimate?'fx-ultimate':''}" data-effect="${e.id}" aria-hidden="true"><span class="charge-ring"></span><span class="fx-projectile">${effectArt(e.id)}</span><span class="fx-impact">${effectArt(e.id)}</span><span class="fx-ripple"></span>${blocked?'<span class="shield-flare">⬡</span>':''}<span class="impact-word">${blocked?'BLOCK!':ultimate?'POWER HIT!':'HIT!'}</span></div>`;
}
