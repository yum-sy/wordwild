// Mobile browser toolbars can obscure part of the layout viewport.
// Use the visible viewport, without resizing the game during pinch zoom.
export function visibleHeight(host){
 const viewport=host.visualViewport;
 return Math.floor(viewport&&Math.abs((viewport.scale||1)-1)<.01?Math.min(host.innerHeight,viewport.height):host.innerHeight);
}
export function installViewportSize(host=window,doc=document){
 let frame;
 const update=()=>{if(host.visualViewport&&Math.abs(host.visualViewport.scale-1)>.01)return;const h=visibleHeight(host);if(h>0){doc.documentElement.style.setProperty('--app-height',`${h}px`);doc.documentElement.classList.toggle('short-viewport',h<620);}};
 const schedule=()=>{host.cancelAnimationFrame(frame);frame=host.requestAnimationFrame(update);};
 update();host.addEventListener('resize',schedule);host.addEventListener('pageshow',schedule);host.visualViewport?.addEventListener('resize',schedule);host.visualViewport?.addEventListener('scroll',schedule);
}
