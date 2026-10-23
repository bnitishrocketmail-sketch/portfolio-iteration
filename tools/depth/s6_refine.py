# the near things' edges taken from the picture's own edges (guided filter), in a thin band around the mask's outline
import numpy as np, cv2
from PIL import Image
A='/home/claude/portfolio-iteration/src/assets/'; O='/home/claude/portfolio-iteration/public/depth/'
def guided(I, p, r, eps):
    b = lambda x: cv2.boxFilter(x, -1, (2*r+1, 2*r+1)); mI, mp = b(I), b(p); A_ = (b(I*p) - mI*mp) / (b(I*I) - mI*mI + eps); B = mp - A_*mI; return b(A_)*I + b(B)
for name, pic in [('illustration','nitish-desk-illustration.webp'),('desk','nitish-desk.webp')]:
    rgb=np.asarray(Image.open(A+pic).convert('RGB')); H,W=rgb.shape[:2]; g=cv2.cvtColor(rgb,cv2.COLOR_RGB2GRAY).astype(np.float32)/255
    L=np.asarray(Image.open(O+f'{name}-layers.png')).copy(); near=L[...,0].astype(np.float32)/255; him=L[...,1].astype(np.float32)/255
    hard=(near>.5).astype(np.float32)
    a=np.clip(guided(g,hard,2,1e-4),0,1)
    k=np.ones((3,3),np.uint8)
    band=(cv2.dilate(hard.astype(np.uint8),k,iterations=3)-cv2.erode(hard.astype(np.uint8),k,iterations=3))>0
    out=np.where(band,a,hard)
    out=out*(1-np.clip(him*2,0,1))
    n,lab,st,_=cv2.connectedComponentsWithStats((out>.05).astype(np.uint8),8)  # specks the filter made off the outline
    small=np.isin(lab,[i for i in range(1,n) if st[i,4]<W*H*.0005]) if n>1 else np.zeros_like(out,bool)
    out[small]=0
    L[...,0]=(np.clip(out,0,1)*255+.5).astype(np.uint8)
    Image.fromarray(L).save(O+f'{name}-layers.png',optimize=True)
    b=(700,1050,1254,1254) if name=='desk' else (560,40,1000,480)
    c=rgb[b[1]:b[3],b[0]:b[2]].astype(float); o=c*.5; o[...,0]+=L[b[1]:b[3],b[0]:b[2],0]*.5
    Image.fromarray(np.concatenate([c,o],0).astype(np.uint8)).save(f'../ref-{name}.png'); print(name)
