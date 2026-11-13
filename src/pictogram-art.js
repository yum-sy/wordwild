import { PICTOGRAMS } from './pictogram-catalog.js';
export function pictogramPicture(word){
 const entry=PICTOGRAMS[word];if(!entry)return '';
 return `<svg class="word-picture scene-art" viewBox="0 0 200 170" aria-hidden="true" focusable="false"><image href="/assets/learning-pictograms/${entry.file}" x="5" y="5" width="190" height="160" preserveAspectRatio="xMidYMid meet"/></svg>`;
}
export function isActionOnlyQuestion(q){
 return PICTOGRAMS[q.prompt]?.scope==='action-only'||q.prompt==='Choose the action.';
}

// Fit the visible subject, not its transparent canvas, into the requested box.
export function placedPictogram(word,x,y,width,height){
 const p=PICTOGRAMS[word];if(!p)return '';
 const view=p.bounds?.join(' ')||'0 0 500 500';const size=p.size||[500,500];
 return `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${view}" preserveAspectRatio="xMidYMax meet" overflow="hidden"><image href="/assets/learning-pictograms/${p.file}" width="${size[0]}" height="${size[1]}"/></svg>`;
}
export function subjectAction(person,action){
 const child=person==='boy'||person==='girl';
 const height=child?93:125;
 return `<g data-subject="${person}" data-action-symbol="${action}"><path d="M83 24V153" stroke="#ccd3d9" stroke-width="2"/>${placedPictogram(person,3,150-height,72,height)}<path d="M87 88H100M95 83L100 88L95 93" fill="none" stroke="#536579" stroke-width="3" stroke-linejoin="round"/>${placedPictogram(action,107,25,89,125)}</g>`;
}
