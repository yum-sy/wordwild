// A tap must start and finish on the same control without becoming a gesture.
export function createTapGate({now=()=>performance.now(),distance=18,hold=700,cooldown=350}={}){
 const pointers=new Map();let completed=null,lastClick=-Infinity;
 return {
  down(id,x,y,target){
   if(!pointers.size)completed=null;
   const p={x,y,target,time:now(),cancelled:pointers.size>0};
   if(pointers.size)for(const other of pointers.values())other.cancelled=true;
   pointers.set(id,p);
  },
  move(id,x,y){const p=pointers.get(id);if(p&&Math.hypot(x-p.x,y-p.y)>distance)p.cancelled=true;},
  up(id,x,y,target){const p=pointers.get(id);if(!p)return;this.move(id,x,y);pointers.delete(id);completed={target:p.target,valid:!p.cancelled&&p.target===target&&!!target&&now()-p.time<hold};},
  cancel(id){pointers.delete(id);completed={valid:false};},
  reset(){pointers.clear();completed={valid:false};},
  click(target,keyboard=false){
   const ok=now()-lastClick>=cooldown&&(keyboard||(completed?.valid&&completed.target===target));completed=null;
   if(ok)lastClick=now();return !!ok;
  },
 };
}
export function installInputGuard(root){
 const gate=createTapGate();const control=e=>e.target.closest?.('[data-action]');
 const editable=e=>e.target.closest?.('input,textarea,[contenteditable="true"]');
 root.addEventListener('pointerdown',e=>{if(!editable(e))gate.down(e.pointerId,e.clientX,e.clientY,control(e));},true);
 document.addEventListener('pointermove',e=>gate.move(e.pointerId,e.clientX,e.clientY),{capture:true,passive:true});
 document.addEventListener('pointerup',e=>gate.up(e.pointerId,e.clientX,e.clientY,control(e)),true);
 document.addEventListener('pointercancel',e=>gate.cancel(e.pointerId),true);
 root.addEventListener('click',e=>{
  if(editable(e))return;
  const button=control(e),modal=root.querySelector('[role="dialog"]');
  if(!button||button.disabled||(modal&&!modal.contains(button))||!gate.click(button,e.detail===0)){
   e.preventDefault();e.stopImmediatePropagation();
  }
 },true);
 for(const type of ['dragstart','drop','contextmenu','selectstart'])root.addEventListener(type,e=>{if(!editable(e))e.preventDefault();});
 root.addEventListener('wheel',e=>{if(!e.ctrlKey&&!editable(e))e.preventDefault();},{passive:false});
 root.addEventListener('keydown',e=>{if(!editable(e)&&e.repeat&&['Enter',' '].includes(e.key))e.preventDefault();});
 window.addEventListener('blur',()=>gate.reset());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)gate.reset();});
}
