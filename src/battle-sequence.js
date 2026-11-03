// Presentation timing is separate from battle rules. No turn resolves twice.
export const TURN_TIMING = Object.freeze({ cue:400, cast:550, impact:600, settle:650 });
export function createBattleSequence({onFrame,onDone,setTimer=setTimeout,clearTimer=clearTimeout,now=()=>Date.now(),timing=TURN_TIMING}){
  let timer=null,version=0,step=0,remaining=0,due=0,paused=false,running=false;
  const frames=Object.keys(timing);
  function schedule(){due=now()+remaining;timer=setTimer(advance,remaining);}
  function advance(){
    timer=null;if(!running)return;
    step++;
    if(step===frames.length){running=false;onDone();return;}
    const id=version;onFrame(frames[step]);
    if(id!==version||!running)return;
    remaining=timing[frames[step]];if(!paused)schedule();
  }
  return {
    get running(){return running;},
    start(){
      if(running)return false;
      running=true;paused=false;step=0;version++;const id=version;
      onFrame(frames[0]);
      if(id!==version||!running)return false;
      remaining=timing[frames[0]];schedule();return true;
    },
    cancel(){version++;running=false;paused=false;if(timer!==null)clearTimer(timer);timer=null;},
    pause(){if(!running||paused)return;paused=true;remaining=Math.max(0,due-now());if(timer!==null)clearTimer(timer);timer=null;},
    resume(){if(!running||!paused)return;paused=false;schedule();},
  };
}
