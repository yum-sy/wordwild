import { wordPicture } from './word-pictures.js';
export const PALETTE={red:'#df5757',blue:'#5797d7',yellow:'#eed05b',green:'#71ad69',orange:'#ed9a4f',purple:'#a07acc',pink:'#e598ba',black:'#424956'};
export const sceneId=data=>'learn:'+JSON.stringify(data);
const noun=(word,x,y,w=85,h=75,counting=false)=>wordPicture(word,{counting}).replace('class="word-picture scene-art"','').replace('<svg ',`<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
const colored=(shape,color,x=100,y=74,size=1)=>{
 const shapes={ball:'<circle r="36"/>',box:'<rect x="-34" y="-30" width="68" height="60"/>',star:'<path d="M0-40L12-13L42-11L20 9L26 39L0 24L-26 39L-20 9L-42-11L-12-13Z"/>',hat:'<path d="M-25 12V-30H25V12M-43 12H43V25H-43Z"/>',cup:'<path d="M-27-32H20V30H-27ZM20-21Q52-25 45 5Q37 20 20 11"/>',shirt:'<path d="M-18-33L-39-22L-48 0L-29 12L-23 0V37H23V0L29 12L48 0L39-22L18-33Q0-12-18-33Z"/>',bag:'<rect x="-30" y="-25" width="60" height="60" rx="6"/><path d="M-14-25V-39H14V-25" fill="none"/>',car:'<path d="M-44 2L-24-25H20L38 2H48V25H-48V2Z"/><path d="M-20-19H15L30 0H-33Z" fill="#e3f1f4"/><circle cx="-28" cy="26" r="9" fill="#323b48"/><circle cx="29" cy="26" r="9" fill="#323b48"/>',boat:'<path d="M-45 13H45L29 37H-27ZM0-42L-30 7H0Z"/><path d="M3-42V13"/>',kite:'<path d="M0-42L30-6L0 30L-30-6Z"/><path d="M0 30Q28 42 7 52" fill="none"/>'};
 return `<g transform="translate(${x} ${y}) scale(${size})" fill="${PALETTE[color]}" stroke="#303b48" stroke-width="3" stroke-linejoin="round">${shapes[shape]}</g>`;
};
export const ACTIONS=['run','swim','sleep','read','eat','dance','jump','sit','stand','walk'];
export const PEOPLE=['boy','girl','man','woman','robot','bear'];
function actor(person,action,color='blue'){
 const pose={run:[[-27,55],[23,30],[-25,126],[30,106]],walk:[[-22,65],[23,68],[-25,131],[22,130]],jump:[[-27,20],[28,20],[-26,110],[29,110]],dance:[[-34,34],[25,52],[-29,125],[30,101]],stand:[[-20,77],[20,77],[-12,135],[12,135]],sit:[[-17,77],[22,80],[27,106],[35,125]],read:[[-20,65],[20,65],[-13,135],[13,135]],eat:[[-22,68],[15,30],[-13,135],[13,135]],sleep:[[-20,76],[20,76],[-13,135],[13,135]],swim:[[-33,35],[33,35],[-22,125],[25,117]]}[action];
 const [a,b,c,d]=pose;const adult=person==='man'||person==='woman';
 const head=person==='robot'?'<rect x="-18" y="2" width="36" height="34" rx="5" fill="#b7cbd4"/><path d="M0 2V-7"/>':person==='bear'?'<circle cx="-16" cy="6" r="10" fill="#b88e67"/><circle cx="16" cy="6" r="10" fill="#b88e67"/><circle cy="20" r="22" fill="#b88e67"/>':`<circle cy="20" r="${adult?18:22}" fill="#e5b48f"/><path d="M-20 16Q-23-9 12 0L22 14" fill="#785440"/>${['girl','woman'].includes(person)?'<path d="M-20 10L-26 47L-13 37M20 10L26 47L13 37" fill="#785440"/>':''}`;
 let body=`<g transform="translate(100 8)" stroke="#303b48" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${head}${action==='sleep'?'<path d="M-11 20h7M4 20h7" stroke-width="2"/>':'<circle cx="-7" cy="19" r="2" stroke="none"/><circle cx="7" cy="19" r="2" stroke="none"/>'}<path d="M-12 43H12L17 88H-17Z" fill="${PALETTE[color]}"/><path d="M-12 48L${a}M12 48L${b}M-9 88L${c}M9 88L${d}" fill="none"/>${action==='read'?'<path d="M-30 60L0 67L30 60V88L0 96L-30 88Z" fill="#fff1c6"/>':''}${action==='eat'?'<path d="M23 44L16 33"/><circle cx="16" cy="33" r="8" fill="#e96a5d"/>':''}</g>`;
 if(action==='sleep')body=`<g transform="translate(145 -14) rotate(70)">${body}</g><path d="M28 110H177V133H28ZM34 132V151M169 132V151" fill="#a6b9d0" stroke="#303b48" stroke-width="3"/>`;
 if(action==='swim')body=`<g transform="translate(145 -12) rotate(70)">${body}</g><path d="M12 100Q27 86 42 100T72 100T102 100T132 100T162 100T192 100V160H12Z" fill="#a1d5e7" opacity=".9"/>`;
 if(action==='sit')body+='<path d="M79 104H146M86 104V151M139 104V151" fill="none" stroke="#8b7053" stroke-width="7"/>';
 if(action==='jump')body+='<path d="M55 155H147M61 126V146M139 126V146" stroke="#a2adbc" stroke-width="3"/>';
 if(action==='dance')body+='<g fill="#bb7aa7" stroke="#303b48" stroke-width="2"><path d="M37 50V23L54 18V44M37 25L54 20" fill="none" stroke-width="4"/><ellipse cx="32" cy="51" rx="7" ry="5"/><ellipse cx="49" cy="45" rx="7" ry="5"/><path d="M160 55V30L174 35" fill="none" stroke-width="4"/><ellipse cx="155" cy="57" rx="7" ry="5"/></g>';
 if(action==='run')body+='<path d="M29 61H55M21 77H48M32 94H52" fill="none" stroke="#8d9baa" stroke-width="4" stroke-linecap="round"/>';
 return body;
}
export function learningScene(data){
 let body='';
 if(data.kind==='noun'){
  body=noun(data.word,9,0,182,164);
 }
 if(data.kind==='pair')body=noun(data.word,2,27,95,119)+noun(data.companion,103,27,95,119);
 if(data.kind==='color')body=colored(data.object,data.color,100,74,data.size==='small'?.48:1)+(data.size?'<path d="M34 141H166" stroke="#8593a3" stroke-width="3"/>':'');
 if(data.kind==='count'){const columns=data.count===4?2:data.count;const rows=data.count===4?2:1;const w=200/columns,h=160/rows;body=Array.from({length:data.count},(_,i)=>noun(data.word,4+(i%columns)*w,5+Math.floor(i/columns)*h,w-8,h-8,true)).join('');}
 if(data.kind==='action')body=actor(data.person,data.action,data.color);
 if(data.kind==='position'){
  const xy={in:[84,67],on:[84,28],under:[84,122],'next to':[151,81],above:[84,-3],between:[84,67]}[data.prep];
  const anchor=data.anchor||'box';
  if(data.prep==='between')body=noun(anchor,0,65,65,85)+noun(anchor,135,65,65,85);
  else if(anchor==='box')body='<path d="M49 60H143V117H49Z" fill="#cda878" stroke="#816747" stroke-width="3"/>';
  else body=noun(anchor,35,45,125,90);
  body+=noun(data.word,xy[0]-16,xy[1],40,39);
  if(data.prep==='in')body+='<path d="M49 93H143V117H49Z" fill="#dfbc8f" stroke="#816747" stroke-width="2"/>';
 }
 return `<svg class="scene-art learning-scene" viewBox="0 0 200 170" aria-hidden="true">${body}</svg>`;
}
