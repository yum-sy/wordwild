import {PICTOGRAMS} from './pictogram-catalog.js';
import {pictogramPicture} from './pictogram-art.js';
import {learningScene,ACTIONS,PEOPLE} from './learning-scenes.js';
const catalog=document.querySelector('#catalog');
catalog.innerHTML=Object.entries(PICTOGRAMS).map(([word,p])=>`<article>${pictogramPicture(word)}<h3>${word}</h3><p>${p.provider} · ${p.id}</p><p>${p.scope==='action-only'?'동작 표현':p.scope==='subject'?'주체의 전신 표현':'사물·짝·개수·위치 문제에 사용'}</p><a href="${p.source}" target="_blank" rel="noopener">원본 보기</a></article>`).join('');
const cases=[...ACTIONS.flatMap(action=>PEOPLE.map(person=>({kind:'action',action,person}))),...['in','on','under','next to','above','between'].map(prep=>({kind:'position',word:'cat',prep,anchor:'box'})),{kind:'count',word:'watermelon',count:2}];
document.querySelector('#review').innerHTML=cases.map(data=>`<article>${learningScene(data)}<h3>${data.kind==='action'?`${data.person}: ${data.action}`:data.kind==='position'?`cat: ${data.prep}`:'two watermelons'}</h3><p>${data.kind==='action'?'왼쪽: 누가 · 오른쪽: 무엇을 하는가. 전신 주체와 동작을 분리했습니다. 아동의 조합 이해도 확인 필요.':data.kind==='position'?'주어를 크게, 기준물을 작게 표시했습니다. 두 상자 사이·접촉·간격·가림을 확인해 주세요.':'통수박+조각 픽토그램 대신 한 조각씩 표시. 실제 학습자에게 수량 인식 확인 필요.'}</p></article>`).join('');
