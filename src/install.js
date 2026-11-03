export function installInstructions(nav=navigator){
 const ios=/iPad|iPhone|iPod/.test(nav.userAgent)||(nav.platform==='MacIntel'&&nav.maxTouchPoints>1);
 return ios?'<ol><li>Tap <strong>Share ↑</strong> in your browser.</li><li>Tap <strong>Add to Home Screen</strong>.</li><li>Keep <strong>Open as Web App</strong> on, if shown. Tap <strong>Add</strong>.</li></ol>':/Android/.test(nav.userAgent)?'<ol><li>Open the browser menu <strong>⋮</strong>.</li><li>Tap <strong>Add to Home screen</strong> or <strong>Install app</strong>.</li><li>Tap <strong>Install</strong> or <strong>Add</strong>.</li></ol>':'<p>Open your browser menu and choose <strong>Install Wordwild</strong> or <strong>Install this page as an app</strong>, if available.</p>';
}
export function setupInstall(onChange,host=window){
 let pending=null,installed=false;
 const mode=host.matchMedia('(display-mode: standalone)');
 host.addEventListener('beforeinstallprompt',e=>{e.preventDefault();pending=e;onChange();});
 host.addEventListener('appinstalled',()=>{installed=true;pending=null;onChange();});
 mode.addEventListener('change',onChange);
 return {isStandalone:()=>installed||mode.matches||host.navigator.standalone===true,
 async prompt(){if(!pending)return false;const event=pending;pending=null;try{await event.prompt();await event.userChoice;return true;}catch{return false;}finally{onChange();}}};
}
