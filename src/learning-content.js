import { WORD_PICTURE_IDS } from './word-pictures.js';
import { sceneId, PALETTE, ACTIONS, PEOPLE } from './learning-scenes.js';
export const CURRICULUM_V2=['First words','More words','Colors, sizes & numbers','Actions','Places & pairs','Short sentences','Grammar: one & many','Grammar: people & actions','Read the scene','Stories & useful phrases'];
export const LEVEL_TARGETS=[160,200,200,180,200,240,240,240,200,240];
export const VOCABULARY_V2=WORD_PICTURE_IDS.map(word=>({word,meaning:word,pos:'noun',tag:['cat','dog','rabbit','bird','fish','elephant'].includes(word)?'animal':'object'}));
const words=WORD_PICTURE_IDS;
const image=(data,meaning)=>({imageId:sceneId(data),meaning});
const text=value=>({text:value});
const pool=[];
const pickOthers=(arr,value,n=3)=>{const i=arr.indexOf(value);return Array.from({length:n},(_,j)=>arr[(i+j+1)%arr.length]);};
function add(level,key,family,skill,prompt,options,meaning,scene=null,type='image-choice'){
 pool.push({id:`v2-${level}-${key}`,familyId:`L${level}-${family}`,skillId:skill,grammarLevel:level,stageMin:(level-1)*10+1,stageMax:100,vocabularyTags:[skill],questionType:type,prompt,options,correctIndex:0,meaning,scene});
}
// Keep old question IDs for saved records; early nouns now use isolated pictures.
// Both legacy layouts share one family so they are not counted as different contexts.
for(const level of [1])for(const word of words.slice(0,level===1?40:50))for(const context of [false,true])for(const reverse of [false,true]){
 const candidates=[word,...pickOthers(words,word)];const data={kind:'noun',word,context};
 add(level,`${word}-${context}-${reverse}`,`single-${reverse?'read':'picture'}`,`noun:${word}`,reverse?'What is this?':word,
 reverse?candidates.map(text):candidates.map(w=>image({...data,word:w},w)),word,reverse?sceneId(data):null,reverse?'word-choice':'image-choice');
}
for(const word of words)for(const offset of [7,17])for(const reverse of [false,true]){
 const companion=words[(words.indexOf(word)+offset)%words.length];
 const choices=[word,...pickOthers(words.filter(w=>w!==companion),word)];
 const label=w=>`${w} and ${companion}`;const data={kind:'pair',word,companion};
 add(2,`${word}-${companion}-${reverse}`,reverse?'pair-read':'pair-picture',`noun:${word}`,reverse?'Choose the words.':label(word),reverse?choices.map(w=>text(label(w))):choices.map(w=>image({...data,word:w},label(w))),label(word),reverse?sceneId(data):null,reverse?'word-choice':'image-choice');
}
const colors=Object.keys(PALETTE),objects=['ball','box','star','hat','cup','shirt','bag','car','boat','kite'];
for(const color of colors)for(const object of objects)for(const reverse of [false,true]){
 const data={kind:'color',color,object};const opts=[color,...pickOthers(colors,color)];
 add(3,`${color}-${object}-${reverse}`,reverse?'color-read':'color-picture',`color:${color}`,reverse?'Choose the color.':`${color} ${object}`,reverse?opts.map(text):opts.map(c=>image({...data,color:c},`${c} ${object}`)),`${color} ${object}`,reverse?sceneId(data):null,reverse?'word-choice':'image-choice');
}
for(const word of words.filter(w=>!['grapes','bread','fish'].includes(w)).slice(0,10))for(const count of [1,2,3,4]){
 add(3,`count-${word}-${count}`,'count','numbers',`Count the ${word==='fish'?'fish':word==='grapes'?'grapes':word+'s'}.`,[count,...[1,2,3,4].filter(n=>n!==count)].map(n=>text(String(n))),String(count),sceneId({kind:'count',word,count}),'word-choice');
}
// 40 extra size questions are retained beyond the 200-question minimum.
for(const object of objects)for(const size of ['big','small'])for(const reverse of [false,true]){
 const data={kind:'color',object,color:'blue',size};const combinations=[data,{...data,size:size==='big'?'small':'big'},{...data,object:objects[(objects.indexOf(object)+1)%objects.length]},{...data,object:objects[(objects.indexOf(object)+1)%objects.length],size:size==='big'?'small':'big'}];
 const label=d=>`${d.size} ${d.object}`;
 add(3,`size-${object}-${size}-${reverse}`,reverse?'size-read':'size-picture',`size:${size}`,reverse?'Choose the words.':label(data),reverse?combinations.map(d=>text(label(d))):combinations.map(d=>image(d,label(d))),label(data),reverse?sceneId(data):null,reverse?'word-choice':'image-choice');
}
const ing={run:'running',swim:'swimming',sleep:'sleeping',read:'reading',eat:'eating',dance:'dancing',jump:'jumping',sit:'sitting',stand:'standing',walk:'walking'};
const third=v=>v==='fly'?'flies':v+'s';
for(const action of ACTIONS)for(const person of PEOPLE)for(const mode of ['picture','word','pair']){
 const data={kind:'action',action,person,color:'blue'},opts=[action,...pickOthers(ACTIONS,action)];
 add(4,`${action}-${person}-${mode}`,mode,`action:${action}`,mode==='picture'?action:mode==='pair'?'Choose the action words.':'Choose the action.',mode==='picture'?opts.map(a=>image({...data,action:a},a)):opts.map(a=>text(mode==='pair'?`${person}: ${a}`:a)),action,mode==='picture'?null:sceneId(data),mode==='picture'?'image-choice':'word-choice');
}
const preps=['in','on','under','next to'];
const smallWords=words.filter(w=>!['elephant','tree','sun','moon','car','boat','plane','table','chair','cloud'].includes(w)).slice(0,25);
for(const prep of preps)for(const word of smallWords)for(const reverse of [false,true]){
 const data={kind:'position',word,prep,anchor:'box'};const opts=[prep,...preps.filter(p=>p!==prep)];
 add(5,`${prep}-${word}-${reverse}`,reverse?'place-read':'place-picture',`position:${prep}`,reverse?'Choose the place.':`${word}: ${prep} the box`,reverse?opts.map(p=>text(`${p} the box`)):opts.map(p=>image({...data,prep:p},`${word}: ${p} the box`)),`${word}: ${prep} the box`,reverse?sceneId(data):null,reverse?'word-choice':'image-choice');
}
for(const action of ACTIONS)for(const person of PEOPLE)for(const reverse of [false,true]){
 const data={kind:'action',action,person};const opts=[action,...pickOthers(ACTIONS,action)];const label=a=>`The ${person} is ${ing[a]}.`;
 add(6,`action-${action}-${person}-${reverse}`,reverse?'sentence-read':'sentence-picture',`action:${action}`,reverse?'Choose the sentence.':label(action),reverse?opts.map(a=>text(label(a))):opts.map(a=>image({...data,action:a},label(a))),label(action),reverse?sceneId(data):null,reverse?'sentence-choice':'image-choice');
}
for(const prep of preps)for(const word of smallWords.slice(0,15))for(const reverse of [false,true]){
 const data={kind:'position',word,prep};const opts=[prep,...preps.filter(p=>p!==prep)];const label=p=>`The ${word} ${word==='grapes'?'are':'is'} ${p} the box.`;
 add(6,`place-${prep}-${word}-${reverse}`,reverse?'place-sentence-read':'place-sentence-picture',`position:${prep}`,reverse?'Choose the sentence.':label(prep),reverse?opts.map(p=>text(label(p))):opts.map(p=>image({...data,prep:p},label(p))),label(prep),reverse?sceneId(data):null,reverse?'sentence-choice':'image-choice');
}
const plural=w=>w==='fish'?'fish':['cherry','strawberry'].includes(w)?w.slice(0,-1)+'ies':['potato','tomato'].includes(w)?w+'es':w==='box'?'boxes':w.endsWith('s')?w+'es':w+'s';
const article=w=>/^[aeiou]/.test(w)?'an':'a';
const countable=words.filter(w=>!['bread','grapes','fish'].includes(w)).slice(0,40);
for(const word of countable){
 const a=article(word),many=plural(word),single=sceneId({kind:'count',word,count:1}),pair=sceneId({kind:'count',word,count:2});
 const rows=[
 ['article',`This is ___ ${word}.`,[a,a==='a'?'an':'a','two','are'],`This is ${a} ${word}.`,single],
 ['is',`The ${word} ___ here.`,['is','are','am','be'],`The ${word} is here.`,single],
 ['are',`The ${many} ___ here.`,['are','is','am','be'],`The ${many} are here.`,pair],
 ['one',`One ___.`,[word,many,'is','are'],`One ${word}.`,single],
 ['many',`Two ___.`,[many,word,'is','a'],`Two ${many}.`,pair],
 ['this',`___ are ${many}.`,['These','This','He','It'],`These are ${many}.`,pair],
 ];
 for(const [key,prompt,opts,meaning,scene] of rows)add(7,`${word}-${key}`,key,`grammar:${key}`,prompt,opts.map(text),meaning,scene,'fill-blank');
}
const subjects=[['I','am','have'],['You','are','have'],['He','is','has'],['She','is','has'],['We','are','have'],['They','are','have']];
for(const [subject,be,have] of subjects)for(const [i,verb] of ACTIONS.entries()){
 const singular=['He','She'].includes(subject),form=singular?third(verb):verb,word=countable[i],a=article(word);
 const rows=[
 ['be',`${subject} ___ ${ing[verb]}.`,[be,...['am','is','are','be'].filter(x=>x!==be)],`${subject} ${be} ${ing[verb]}.`],
 ['present',`Every day, ${subject==='I'?'I':subject.toLowerCase()} ___.`,[form,...[verb,third(verb),ing[verb],'is','are'].filter((x,j,ar)=>x!==form&&ar.indexOf(x)===j).slice(0,3)],`Every day, ${subject==='I'?'I':subject.toLowerCase()} ${form}.`],
 ['can',`${subject} can ___.`,[verb,third(verb),ing[verb],'is'],`${subject} can ${verb}.`],
 ['have',`${subject} ___ ${a} ${word}.`,[have,have==='has'?'have':'has','having','is'],`${subject} ${have} ${a} ${word}.`],
 ];
 for(const [key,prompt,opts,meaning] of rows)add(8,`${subject}-${verb}-${key}`,key,`grammar:${key}`,prompt,opts.map(text),meaning,null,'fill-blank');
}
const names=['Mia','Leo','Sam','Ava','Ben','Zoe','Max','Lily','Tom','Ruby','Jack','Ella','Noah','Rose','Alex','Ivy','Finn','Amy','Owen','Lucy'];
const places=['home','school','the park','the beach'];
const belongings=['bag','hat','ball','cup','shirt'];
const animals=['cat','dog','rabbit','bird'];
function stories(level,count,offset=0){
 for(let i=0;i<count;i++){
  const n=names[(i+offset)%names.length],color=colors[(i+offset)%colors.length],item=belongings[i%5],animal=animals[(i+1)%4],prep=preps[(i+2)%4],place=places[(i+offset)%4],action=['read','eat','sleep','dance'][i%4],friend=names[(i+offset+7)%names.length];
  const passage=`${n} has ${article(color)} ${color} ${item}. The ${animal} is ${prep} the box. ${n} ${third(action)} at ${place}. ${friend} has a book.`;
  const tasks=[
   ['owner',`Choose the person with the ${item}.`,n,pickOthers(names,n)],
   ['color',`Choose the color of the ${item}.`,color,pickOthers(colors,color)],
   ['item',`Choose what ${n} has.`,item,pickOthers(belongings,item)],
   ['animal','Choose the animal in the story.',animal,pickOthers(animals,animal)],
   ['place-animal',`Choose where the ${animal} is.`,`${prep} the box`,preps.filter(p=>p!==prep).map(p=>`${p} the box`)],
   ['place-person',`Choose where ${n} ${third(action)}.`,place,places.filter(p=>p!==place)],
   ['action',`Choose what ${n} does.`,third(action),['read','eat','sleep','dance'].filter(a=>a!==action).map(third)],
   ['friend','Choose the person with a book.',friend,[n,...names.filter(x=>x!==n&&x!==friend).slice(0,2)]],
   ['true','Choose the true sentence.',`${n} has ${article(color)} ${color} ${item}.`,pickOthers(colors,color).map(c=>`${n} has ${article(c)} ${c} ${item}.`)],
   ['picture','Choose the animal’s place.',null,null],
  ];
  for(const [key,task,right,wrong] of tasks){
   const options=key==='picture'?[prep,...preps.filter(p=>p!==prep)].map(p=>image({kind:'position',word:animal,prep:p},`${animal}: ${p} the box`)):[right,...wrong].map(text);
   add(level,`story-${i}-${key}`,`story-${key}`,`reading:${key}`,task,options,key==='picture'?`${animal}: ${prep} the box`:right,null,'context');pool.at(-1).passage=level===9?passage.split('. ').filter((_,index)=>index===0||index===(key==='friend'?3:['action','place-person'].includes(key)?2:1)).join('. ').replace(/\.?$/,'.'):passage;
  }
 }
}
stories(9,20);stories(10,12,8);
// Each expression is paired with six authored situations; distractors have different intentions.
const expressions=[
 ['Thank you!','Someone helps you.',['A friend lends you a pencil.','A friend gives you water.','Your dad fixes your toy.','Your teacher helps you read.','A friend opens the door for you.','Your sister shares her snack.']],
 ['You’re welcome!','Reply kindly to thanks.',['A friend says thanks for your help.','Your mum thanks you for the flower.','Your teacher says thank you.','Your brother thanks you for the book.','A friend thanks you for the snack.','Your dad says thanks for the water.']],
 ['Sorry!','Say this after a mistake.',['You step on a friend’s foot.','You spill water on a book.','You break a friend’s pencil.','You bump into your teacher.','You drop your sister’s cake.','You take a friend’s hat by mistake.']],
 ['Excuse me.','Get someone’s attention politely.',['You want to ask the teacher for help.','Someone is in front of the door you need.','You need to pass a person in a narrow hall.','You want to ask a worker where the books are.','You need to speak while adults are talking.','You want to ask a stranger for directions.']],
 ['Good morning!','Greet someone early in the day.',['You meet your teacher before breakfast.','You see Dad when you wake up.','You meet a friend as school starts in the morning.','The sun is rising and Mum greets you.','You meet Grandma at breakfast.','You wake up and greet your brother.']],
 ['Good night!','Say this before sleep.',['Your sister is going to bed.','You are going to sleep.','Dad turns off your bedroom light.','Your friend is going to bed after a sleepover game.','Mum says it is bedtime.','Grandma is going to sleep.']],
 ['See you later!','Say goodbye for now.',['Your friend leaves and will return this afternoon.','You leave school and will see your friend tomorrow.','Dad goes to work and will come home later.','You finish playing and go home.','Your sister goes to the shop.','You leave a friend after lunch.']],
 ['Well done!','Praise someone’s success.',['Your friend finishes a hard puzzle.','Your sister reads a new word correctly.','Your brother wins a race.','Your team finishes a difficult game.','A friend draws a beautiful picture.','Your classmate solves a hard problem.']],
 ['Take care!','Wish someone safety when leaving.',['A friend leaves for a long trip.','Grandma goes home in the rain.','Your brother leaves for camp.','Dad leaves on a long drive.','A friend says goodbye before a journey.','Your sister leaves for a bike trip.']],
 ['Here you are.','Say this while handing something over.',['You hand a book to your friend.','You give Dad the cup he asked for.','You pass Mum her bag.','You give your teacher a pencil.','You hand your sister a plate.','You pass a ball to your brother.']],
 ['After you.','Let another person go first.',['You let a friend enter a door before you.','You let Grandma get on the bus first.','You let your sister take her turn first.','You let your teacher walk through the gate first.','You let Dad sit down before you.','You let a friend use the slide before you.']],
 ['No problem!','Agree that helping is easy for you.',['A friend asks you to carry a light bag.','Dad asks you to pass a spoon.','Mum asks you to close a window.','Your sister asks you to share a pencil.','A friend asks you to hold a book.','Your teacher asks you to move a chair.']],
 ['Be careful!','Warn someone about danger.',['A friend walks near broken glass.','Your brother runs near a hot pan.','Your sister stands close to a deep pool.','Dad is about to step on a toy.','A friend climbs a wet ladder.','Someone is about to touch a sharp knife.']],
 ['Hurry up!','Ask someone to move faster.',['The bus is leaving and your friend is slow.','School starts soon but your brother is still in bed.','The rain is coming and your friend is still outside.','Your game starts in one minute and your sister is not ready.','The train leaves soon and Dad is still packing.','Everyone is waiting for a slow teammate.']],
 ['Wait a moment.','Ask for a short pause.',['You need a second to tie your shoe.','You need a little time to find your bag.','You are finishing a sentence before leaving.','You need to wash your hands before eating.','You need to put your book away before playing.','You need to get your coat before going out.']],
 ['Give me a hand.','Ask someone to help.',['A box is too heavy for you to lift alone.','You need help moving a table.','You cannot carry all the books alone.','You need help putting up a tent.','You cannot push a stuck door alone.','You need help cleaning a big spill.']],
 ['Keep trying!','Encourage someone not to give up.',['Your friend cannot solve a puzzle yet.','Your sister misses the ball again.','Your brother finds a word hard to read.','A friend falls while learning to skate.','Your teammate cannot finish a level yet.','Your friend wants to stop practicing a song.']],
 ['It’s your turn.','Tell someone to play next.',['You finish a board game move and point to your friend.','You finish with the swing and give it to your sister.','You finish reading and your partner should read next.','You roll the dice and pass it to your brother.','You finish a race and your teammate goes next.','You finish drawing and pass the pencil to your partner.']],
 ['Let’s take a break.','Suggest a short rest.',['You have studied for a long time and feel tired.','Your team has practiced for an hour.','You and a friend are tired after running.','Your family is tired after a long walk.','You have read many pages and need a rest.','Your friends are tired after cleaning.']],
 ['A piece of cake!','Say that something is very easy.',['You finish a very easy puzzle in seconds.','You solve a simple sum with no trouble.','You win a very easy game.','You read a short familiar word easily.','You finish an easy drawing quickly.','You find a simple task very easy.']],
];
for(const [i,[phrase,meaning,situations]] of expressions.entries())for(const [j,passage] of situations.entries()){
 const wrong=[1,5,11].map(n=>expressions[(i+n)%expressions.length][0]);
 add(10,`phrase-${i}-${j}`,`phrase-${i}`,`expression:${i}`,meaning,[phrase,...wrong].map(text),`${phrase} ${meaning}`,null,'context');pool.at(-1).passage=passage;
}
// Transfer tasks: categories, changes in position, and everyday reading.
const categories=[['animal',['cat','dog','rabbit','bird','elephant']],['fruit',['apple','banana','orange','pear','lemon']],['clothes',['hat','shirt','coat','shoe','sock']],['vehicle',['car','boat','plane']]];
for(const [category,members] of categories)for(const word of members){
 const others=categories.filter(([c])=>c!==category).map(([,ws],i)=>ws[(members.indexOf(word)+i)%ws.length]);
 add(2,`category-${word}`,'category-picture',`category:${category}`,category==='clothes'?'Find clothes.':`Find ${category==='animal'?'an':'a'} ${category}.`,[word,...others].map(w=>image({kind:'noun',word:w},w)),word);
 add(2,`category-name-${word}`,'category-name',`category:${category}`,'Which group?',[category,...categories.map(([c])=>c).filter(c=>c!==category)].map(text),category,sceneId({kind:'noun',word}),'word-choice');
}
for(const word of smallWords)for(const prep of ['in','on','under','next to']){
 const options=['in','on','under','next to'];
 add(5,`move-${word}-${prep}`,'place-picture',`position:${prep}`,`Find the ${word} ${prep} the box.`,[prep,...options.filter(p=>p!==prep)].map(p=>image({kind:'position',word,prep:p,anchor:'box'},`${word} ${p} the box`)),`${word} ${prep} the box`,null);
}
const dailyReading=[
 ['The library closes at five. Sam arrives at four. He has one hour to read.','When must Sam leave?',['At five.','At four.','At six.','At seven.']],
 ['Bring a hat and water for the walk. Leave your toys at home.','What should you bring?',['Water.','A toy car.','A doll.','A game.']],
 ['The floor is wet. Please walk slowly.','What should you do?',['Walk slowly.','Run fast.','Jump on the floor.','Dance on the floor.']],
 ['Mia puts a seed in soil. She adds water. A small plant grows.','What happens first?',['She puts a seed in soil.','A plant grows.','She picks a flower.','She sees a tree.']],
 ['Leo cannot find his pencil. He looks in his bag. It is under his book.','Where is the pencil?',['Under his book.','On his desk.','Next to his shoe.','Under his chair.']],
 ['It is raining. Ava wants to stay dry on her walk.','What does Ava need?',['An umbrella.','A spoon.','A ball.','A clock.']],
 ['Ben has two apples. He gives one to his friend.','How many apples does Ben have now?',['One.','Two.','Three.','Four.']],
 ['The shop is shut today. It opens tomorrow.','When can you buy a book?',['Tomorrow.','Right now.','Yesterday.','Last night.']],
 ['No food in the pool. Eat your snack outside.','Where can you eat?',['Outside.','In the pool.','Under the water.','While swimming.']],
 ['Kim has a red bag. Jo has a blue bag. Kim lends her bag to Jo.','Which bag does Jo borrow?',['The red bag.','The blue bag.','The green bag.','The black bag.']],
 ['First wash your hands. Then eat your lunch. After lunch, put your plate away.','What comes after lunch?',['Put your plate away.','Start eating.','Make your lunch.','Wash the food.']],
 ['The bus leaves soon. Max is still at home. His dad says, “Hurry up!”','What does Dad want Max to do?',['Get ready quickly.','Go to sleep.','Wait a long time.','Eat slowly.']],
 ['Ella drops her books. Tom helps pick them up. Ella says, “Thank you.”','Why does Ella thank Tom?',['He helps her.','He takes her books.','He walks away.','He drops her bag.']],
 ['The puzzle looks hard. Nan says, “Give it a try.”','What does Nan mean?',['Try to do it.','Throw it away.','Give up now.','Hide the puzzle.']],
 ['Jay says, “I am all ears.” His friend has a story to tell.','What does Jay mean?',['I am ready to listen.','My ears are big.','I cannot hear you.','I want to leave.']],
 ['Lily says, “I feel under the weather.” She stays in bed.','How does Lily feel?',['Sick.','Excited.','Hungry.','Angry.']],
 ['A sign says: Keep the gate closed. The sheep must stay in the field.','Why should you close the gate?',['To keep the sheep inside.','To let the sheep out.','To bring rain.','To feed the birds.']],
 ['Owen wants to read. His room is dark. He turns on a lamp.','Why does Owen turn on the lamp?',['To see his book.','To cool his room.','To hear a song.','To close the door.']],
 ['The blue team has three points. The red team has two. Then the red team gets two more.','Which team has more points now?',['The red team.','The blue team.','Both have three.','Both have two.']],
 ['Zoe is building a tower. It falls twice. She tries again and it stands.','What helps Zoe finish?',['She keeps trying.','She stops building.','She hides the blocks.','She throws the blocks.']],
];
for(const [i,[passage,prompt,choices]] of dailyReading.entries()){
 const level=i<10?9:10;
 const skill=['detail','instruction','instruction','sequence','reference','inference','quantity','time','instruction','reference','sequence','intent','cause','intent','idiom','idiom','cause','cause','quantity','inference'][i];
 add(level,`daily-${i}`,`reading-${skill}`,`reading:${skill}`,prompt,choices.map(text),choices[0],null,'context');pool.at(-1).passage=passage;
}

const bridges=[
 ['detail','The cat is on the box. The dog is under the box.','Find the cat.',['On the box.','Under the box.','In the box.','Next to the box.']],
 ['reference','Mia has a red hat. She has a blue bag too.','Who has a blue bag?',['Mia.','Tom.','Ben.','Sam.']],
 ['sequence','First sit down. Then open your book.','What comes first?',['Sit down.','Open your book.','Close your book.','Stand up.']],
 ['instruction','You can read here. You cannot run here.','What can you do?',['Read.','Run.','Swim.','Dance.']],
 ['cause','The boy is cold. He puts on his coat.','Why does he put on his coat?',['He is cold.','He is hot.','He is hungry.','He is sleepy.']],
 ['time','The shop opens at nine. Come at nine to buy a hat.','When does the shop open?',['At nine.','At ten.','At six.','At two.']],
 ['quantity','There are three birds. One flies away. Two birds stay.','How many birds stay?',['Two.','One.','Three.','Four.']],
 ['inference','Rain falls on the girl. She opens her umbrella.','What keeps her dry?',['Her umbrella.','Her pencil.','Her ball.','Her book.']],
 ['intent','Sam cannot lift the box. He says, “Give me a hand.”','What does Sam want?',['Help with the box.','A new box.','A drink.','A hat.']],
 ['idiom','The game is a piece of cake. Ben wins easily.','What does “a piece of cake” mean?',['Very easy.','Very cold.','Very loud.','Very slow.']],
];
for(const [i,[skill,passage,prompt,choices]] of bridges.entries()){
 const level=i<4?8:i<8?9:10;
 add(level,`bridge-${i}`,`bridge-${skill}`,`reading:${skill}`,prompt,choices.map(text),choices[0],null,'context');pool.at(-1).passage=passage;
}
// Meet a few clear actions early; level 4 remains the full action unit.
for(const action of ['run','swim','sleep','eat'])for(const person of PEOPLE)for(const reverse of [false,true]){
 const opts=[action,...['run','swim','sleep','eat'].filter(a=>a!==action)];
 const data={kind:'action',action,person};
 add(2,`early-action-${action}-${person}-${reverse}`,reverse?'early-action-word':'early-action-picture',`action:${action}`,reverse?'Choose the action.':action,reverse?opts.map(text):opts.map(a=>image({...data,action:a},a)),action,reverse?sceneId(data):null,reverse?'word-choice':'image-choice');
}
export const CONTENT_V2=pool;
