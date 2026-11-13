import { PICTOGRAMS } from './pictogram-catalog.js';
export function pictogramPicture(word){
 const entry=PICTOGRAMS[word];if(!entry)return '';
 return `<svg class="word-picture scene-art" viewBox="0 0 200 170" aria-hidden="true" focusable="false"><image href="/assets/learning-pictograms/${entry.file}" x="5" y="5" width="190" height="160" preserveAspectRatio="xMidYMid meet"/></svg>`;
}
export function isActionOnlyQuestion(q){
 return PICTOGRAMS[q.prompt]?.scope==='action-only'||q.prompt==='Choose the action.';
}
