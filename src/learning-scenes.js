import { placedPictogram, subjectAction } from './pictogram-art.js';
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
export function learningScene(data){
 let body='';
 if(data.kind==='noun'){
  body=noun(data.word,9,0,182,164);
 }
 if(data.kind==='pair')body=noun(data.word,2,27,95,119)+noun(data.companion,103,27,95,119);
 if(data.kind==='color')body=colored(data.object,data.color,100,74,data.size==='small'?.48:1)+(data.size?'<path d="M34 141H166" stroke="#8593a3" stroke-width="3"/>':'');
 if(data.kind==='count'){const columns=data.count===4?2:data.count;const rows=data.count===4?2:1;const w=200/columns,h=160/rows;body=Array.from({length:data.count},(_,i)=>noun(data.word,4+(i%columns)*w,5+Math.floor(i/columns)*h,w-8,h-8,true)).join('');}
 if(data.kind==='action')body=subjectAction(data.person,data.action);
 if(data.kind==='position'){
  const anchor=data.anchor||'box';
  const box=(x,y,w,h)=>`<g data-anchor="box"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#dec49c" stroke="#806b50" stroke-width="3"/><path d="M${x} ${y+8}H${x+w}" stroke="#b79b74" stroke-width="2"/></g>`;
  const reference=(x,y,w,h)=>anchor==='box'?box(x,y,w,h):noun(anchor,x,y,w,h);
  const subject=(x,y,w,h)=>placedPictogram(data.word,x,y,w,h)||noun(data.word,x,y,w,h);
  if(data.prep==='between')body=reference(5,105,44,40)+reference(151,105,44,40)+subject(61,64,78,81);
  else if(data.prep==='next to')body=reference(13,99,64,46)+subject(100,64,87,81);
  else if(data.prep==='on')body=reference(59,99,82,44)+subject(54,19,92,80);
  else if(data.prep==='above')body=reference(59,123,82,36)+subject(54,17,92,80);
  else if(data.prep==='under')body=reference(59,12,82,36)+subject(54,76,92,80);
  else if(data.prep==='in'){
   body=reference(48,69,104,82)+subject(55,27,90,105);
   if(anchor==='box')body+='<path d="M48 114H152V151H48Z" fill="#dec49c" stroke="#806b50" stroke-width="3"/><path d="M48 114L37 102M152 114L163 102" fill="none" stroke="#806b50" stroke-width="3"/>';
  }
 }

 return `<svg class="scene-art learning-scene" viewBox="0 0 200 170" aria-hidden="true">${body}</svg>`;
}
