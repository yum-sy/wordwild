import {PICTOGRAMS} from './pictogram-catalog.js';
import {pictogramPicture} from './pictogram-art.js';
import {learningScene,ACTIONS,PEOPLE} from './learning-scenes.js';
const catalog=document.querySelector('#catalog');
catalog.innerHTML=Object.entries(PICTOGRAMS).map(([word,p])=>`<article>${pictogramPicture(word)}<h3>${word}</h3><p>${p.provider} · ${p.id}</p><p>${p.scope==='action-only'?'주체를 묻지 않는 동작 문제에만 사용':'사물·짝·개수·위치 문제에 사용'}</p><a href="${p.source}" target="_blank" rel="noopener">원본 보기</a></article>`).join('');
const cases=[...ACTIONS.flatMap(action=>PEOPLE.map(person=>({kind:'action',action,person}))),...['in','on','under','next to','above','between'].map(prep=>({kind:'position',word:'cat',prep,anchor:'box'})),{kind:'count',word:'watermelon',count:2}];
document.querySelector('#review').innerHTML=cases.map(data=>`<article>${learningScene(data)}<h3>${data.kind==='action'?`${data.person}: ${data.action}`:data.kind==='position'?`cat: ${data.prep}`:'two watermelons'}</h3><p>${data.kind==='action'?'주체와 동작을 모두 구분할 수 있는지 교육자 검수 필요. 기존 장면 유지.':data.kind==='position'?'사물의 위치와 가림 정도를 작은 화면에서 검수. 관계 도형 유지.':'통수박+조각 픽토그램 대신 한 조각씩 표시. 실제 학습자에게 수량 인식 확인 필요.'}</p></article>`).join('');
