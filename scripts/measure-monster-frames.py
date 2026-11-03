"""Read alpha silhouettes and write CSS atlas windows; never modify image pixels."""
from pathlib import Path
from PIL import Image
import json
from collections import deque
frames={}
for atlas in ['wildlands','mythwilds','deepwilds','dragons']:
    im=Image.open(Path('assets')/f'monsters-{atlas}.png')
    alpha=im.getchannel('A').point(lambda v:255 if v>128 else 0)
    frames[atlas]=[]
    for i in range(10 if atlas=='dragons' else 16):
        x0=max(0,round(i%4*im.width/4)-24);y0=max(0,round(i//4*im.height/4)-24)
        x1=min(im.width,round((i%4+1)*im.width/4)+24);y1=min(im.height,round((i//4+1)*im.height/4)+24)
        region=alpha.crop((x0,y0,x1,y1));w,h=region.size
        pixels=bytearray(region.tobytes());best=[]
        for start in range(len(pixels)):
            if not pixels[start]:continue
            pixels[start]=0;queue=deque([start]);component=[]
            while queue:
                at=queue.popleft();component.append(at);cx=at%w;cy=at//w
                for nx,ny in [(cx-1,cy),(cx+1,cy),(cx,cy-1),(cx,cy+1)]:
                    if 0<=nx<w and 0<=ny<h and pixels[ny*w+nx]:
                        pixels[ny*w+nx]=0;queue.append(ny*w+nx)
            if len(component)>len(best):best=component
        left=min(i%w for i in best);right=max(i%w for i in best)+1
        top=min(i//w for i in best);bottom=max(i//w for i in best)+1
        side=max(right-left,bottom-top)*1.18
        x=x0+(left+right)/2-side/2;y=y0+bottom-side*.92
        clip=[max(0,(y0+top-6-y)/side*100),max(0,(x+side-(x0+right+6))/side*100),max(0,(y+side-(y0+bottom+6))/side*100),max(0,(x0+left-6-x)/side*100)]
        frames[atlas].append({'clip':' '.join(str(round(v,4))+'%' for v in clip),'x':round(x/(im.width-side)*100,5),'y':round(y/(im.height-side)*100,5),'zoom':round(im.width/side*100,5)})
Path('src/monster-frames.js').write_text('// CSS windows measured from sprite alpha. Source images remain unchanged.\nexport const MONSTER_FRAMES = '+json.dumps(frames,separators=(',',':'))+';\n')
