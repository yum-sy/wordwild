// One permanent body per dragon. Stage order is fixed; captures keep this identity.
const rows = [
 ['cinderwing','Cinderwing','The fire dragon','FIRE','#ff9560','Four legs. Huge fire wings.',['attack','growth']],
 ['rainlong','Rainlong','The rain dragon','WATER','#76e4bf','Long body. Antlers. Rain clouds.',['heal','growth']],
 ['frostlance','Frostlance','The ice wyvern','ICE','#a0ddff','Two legs. Sharp ice wings.',['attack','heal']],
 ['shellmount','Shellmount','The turtle dragon','EARTH','#d7bc81','A mighty shell of stone.',['growth','heal']],
 ['plumeserpent','Plumeserpent','The feather dragon','SKY','#b7ed82','Bright feathers. A long tail.',['heal','growth']],
 ['dunecoil','Dunecoil','The sand dragon','SAND','#edbe71','Two claws. A tall sand sail.',['attack','growth']],
 ['deepcrown','Deepcrown','The sea dragon','WATER','#75cae8','Wide fins. Coral horns.',['heal','attack']],
 ['trihydra','Trihydra','The three-head dragon','NIGHT','#c4a0ee','Three heads. One mighty dragon.',['heal','attack']],
 ['stormlong','Stormlong','The thunder dragon','SPARK','#f7df87','A white mane. Thunder horns.',['attack','growth']],
 ['boss','Dreadcrown','The ancient dragon','NIGHT','#da9aff','Six wings. A crown of gold.',['attack','growth']],
];
export const BOSS_DRAGONS=rows.map(([id,name,title,type,color,note,bossPassives],cell)=>({id,name,title,type,color,dark:color,note,bossPassives,passive:bossPassives[0],isBoss:true,atlas:'dragons',cell,bossStage:(cell+1)*10}));
export const bossForStage=stage=>BOSS_DRAGONS[Math.min(9,Math.max(0,Math.floor(stage/10)-1))];
