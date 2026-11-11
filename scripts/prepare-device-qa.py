from pathlib import Path
s=Path('src/app.js').read_text().replace('window.localStorage','qaStorage').replace('localStorage','qaStorage')
s="const qaData=new Map();const qaStorage={getItem:k=>qaData.get(k),setItem:(k,v)=>qaData.set(k,v),removeItem:k=>qaData.delete(k),get length(){return qaData.size},key:i=>[...qaData.keys()][i]};\nimport {createMonster} from './game.js';\n"+s
fixture='''
const qaPhase=new URLSearchParams(location.search).get('phase')||'reward-target';
game=newGame('ember',null,()=>.5);game.party.push(createMonster('sprout'),createMonster('aqua'));game.party.forEach((m,i)=>{m.maxHp=24+i*25;m.currentHp=12;m.attack=9+i*12;m.maxShield=3+i*5;m.currentShield=1;m.shieldFragments=3;m.evolutionBaseline={hp:m.maxHp,attack:m.attack,shieldStat:m.maxShield*4+3};});
game.phase=qaPhase;game.rewardChoices=['hp','shield-pair','capture-up-plus','restore-all'];game.selectedReward='shield-pair';game.candidate=createMonster('aqua');game.evolved=[game.party[0].id];game.party[0].evolutionRoute='shield';game.party[0].evolutionStage=1;
if(qaPhase==='capture'){game.candidate=null;const q=new URLSearchParams(location.search);game.captureBoost=Number(q.get('boost')||0);if(q.get('frame')){catchFrame=q.get('frame');catchSuccess=q.get('outcome')==='success';game.captureResult=catchSuccess?'success':'failed';game.attempts=1;game.captureBall='poke-ball';}}
if(qaPhase==='reading'){game.phase='battle';game.question=QUESTIONS.filter(q=>q.passage).sort((a,b)=>(b.passage.length+b.prompt.length)-(a.passage.length+a.prompt.length))[0];}
const qaQuestion=new URLSearchParams(location.search).get('question');if(qaQuestion){game.phase='battle';game.question=QUESTIONS.find(q=>q.id===qaQuestion)||game.question;game.stage=game.question.stageMin;}
if(qaPhase==='game-over')game.party.forEach(m=>m.currentHp=0);
if(qaPhase==='lucky-event'){game.luckyEvent={reward:'golden-net',claimed:false};}
if(qaPhase==='failed'){game.phase='capture';game.attempts=3;game.captureResult='failed';}
view=['home','dex','party','parents','learning','hall'].includes(qaPhase)?qaPhase:'game';
if(qaPhase==='dex')game.phase='battle';
if(qaPhase==='boss'){game.phase='battle';game.stage=100;game.enemy=createMonster(SPECIES.find(s=>s.isBoss)?.id||SPECIES.at(-1).id,100);game.enemy.rareForm='shiny';}
'''
s=s.replace('\nrender();\n','\n'+fixture+'\nrender();\n')
Path('src/qa-device-app.js').write_text(s)
Path('audio-previews/device-qa').mkdir(parents=True,exist_ok=True)
Path('audio-previews/device-qa/index.html').write_text(Path('index.html').read_text().replace('/src/app.js','/src/qa-device-app.js'))
