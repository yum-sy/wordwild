// Classify usable windows, not model names: also handles folding and split view.
export function windowLayout(width,height){
 return height<500&&width>height || width>=900&&width/height>=1.12?'wide':'stack';
}
export function arenaBudget(total,learning,gap=8){return Math.floor(Math.max(60,Math.min(total*.52,total-learning-gap-6)));}
let queued=false;
export function scheduleDeviceLayout(){
 if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;fitDeviceLayout();});
}
export function fitDeviceLayout(){
 const doc=document.documentElement,w=doc.clientWidth,h=window.visualViewport?.scale===1?Math.min(innerHeight,visualViewport.height):innerHeight;
 doc.dataset.layout=windowLayout(w,h);doc.dataset.compact=h<500?'true':'false';
 doc.dataset.installed=matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true?'true':'false';
 const column=document.querySelector('.play-column:has(.question-panel)');
 if(!column)return;
 const panel=column.querySelector('.question-panel'),content=panel.querySelector('.question-content'),answers=content.querySelector('.answers');
 column.style.setProperty('--fit-step','0');
 // First preserve generous learning type. Only exceptionally constrained windows
 // step down to 22px, never scale the whole app or clip answer text.
 for(let step=0;step<=4;step++){
  column.style.setProperty('--fit-step',String(step));
  if(doc.dataset.layout==='stack'){
   const css=getComputedStyle(content),kids=[...content.children];
   const needed=kids.reduce((sum,e)=>sum+e.getBoundingClientRect().height,0)+Math.max(0,kids.length-1)*(parseFloat(css.rowGap)||0)+parseFloat(css.paddingTop)+parseFloat(css.paddingBottom);
   const chrome=panel.offsetHeight-content.offsetHeight;
   column.style.setProperty('--device-arena-height',arenaBudget(column.clientHeight,needed+chrome,parseFloat(getComputedStyle(column).rowGap)||0)+'px');
  }
  const fits=content.scrollHeight<=content.clientHeight+2&&answers.scrollHeight<=answers.clientHeight+2&&[...answers.children].every(e=>e.scrollHeight<=e.clientHeight+2);
  if(fits)break;
 }
 const arena=column.querySelector('.arena');
 if(arena){
  const hud=Math.max(...[...arena.querySelectorAll('.fighter-hud')].map(e=>e.offsetTop+e.offsetHeight),32);
  const size=Math.max(28,Math.min(300,arena.clientWidth*.46,(arena.clientHeight*.85-hud)/.88));
  column.style.setProperty('--device-sprite-size',Math.floor(size)+'px');
 }
}
export function installDeviceLayout(){
 window.addEventListener('resize',scheduleDeviceLayout);
 window.addEventListener('orientationchange',scheduleDeviceLayout);
 window.addEventListener('pageshow',scheduleDeviceLayout);
 window.visualViewport?.addEventListener('resize',scheduleDeviceLayout);
 matchMedia('(display-mode: standalone)').addEventListener('change',scheduleDeviceLayout);
 document.fonts?.ready.then(scheduleDeviceLayout);
 // Observe the stable outer surface, not children altered by the fitter.
 const surface=document.querySelector('#app');if(surface)new ResizeObserver(scheduleDeviceLayout).observe(surface);
 scheduleDeviceLayout();
}
