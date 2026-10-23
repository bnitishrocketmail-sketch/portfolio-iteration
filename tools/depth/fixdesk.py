import numpy as np, cv2, sys
from PIL import Image
A='/home/claude/portfolio-iteration/src/assets/';O='/home/claude/portfolio-iteration/public/depth/'
TH=float(sys.argv[1])
rgb=np.asarray(Image.open(A+'nitish-desk.webp').convert('RGB')); H,W=rgb.shape[:2]
g=cv2.cvtColor(rgb,cv2.COLOR_RGB2GRAY).astype(np.float32)/255
L=np.asarray(Image.open(O+'desk-layers.png')).copy()
near=L[...,0].astype(np.float32)/255; him=L[...,1].astype(np.float32)/255
yy=np.mgrid[0:H,0:W][0]
n,lab,st,_=cv2.connectedComponentsWithStats((near>.5).astype(np.uint8),8)
desk=lab==np.argmax([0]+[st[i,1] for i in range(1,n)])  # the piece lowest down: the desk on the right
take=(cv2.erode(desk.astype(np.uint8),np.ones((3,3),np.uint8),iterations=3)>0)&(g<TH)  # not the desk's own soft edge, a grey line joined to the hand
n2,lab2,st2,_=cv2.connectedComponentsWithStats(take.astype(np.uint8),8)
hb=cv2.dilate((him>.5).astype(np.uint8),np.ones((3,3),np.uint8),iterations=5)>0
keep=np.zeros_like(take)
for i in range(1,n2):
    if (hb&(lab2==i)).any(): keep|=lab2==i
free=(near<.5)&(him<.5)&(g>.22)&(yy>H*.78)
n3,lab3,st3,_=cv2.connectedComponentsWithStats(free.astype(np.uint8),8)
hb2=cv2.dilate(((him>.5)|keep).astype(np.uint8),np.ones((3,3),np.uint8),iterations=2)>0
for i in range(1,n3):
    k=lab3==i
    if (hb2&k).any() and st3[i,4]<W*H*.002: keep|=k
keep=cv2.morphologyEx(keep.astype(np.uint8),cv2.MORPH_CLOSE,np.ones((3,3),np.uint8),iterations=2)>0
# give back the rim the erosion took, but only where it is the hand (dark), within the desk
keep|=(cv2.dilate(keep.astype(np.uint8),np.ones((3,3),np.uint8),iterations=3)>0)&desk&(g<TH)&(cv2.dilate((take&keep).astype(np.uint8),np.ones((3,3),np.uint8),iterations=3)>0)
kk=(cv2.dilate(keep.astype(np.uint8),np.ones((3,3),np.uint8),iterations=3)>0)&((him>.02)|keep)  # reaching into his own edge, so the seam is closed
k=cv2.GaussianBlur(kk.astype(np.float32),(0,0),.7)*(1-((him<.02)&~keep)).astype(np.float32)
k=np.maximum(k,cv2.GaussianBlur(keep.astype(np.float32),(0,0),.7))
him2=np.maximum(him,k); near2=near*(1-k)
crop=(slice(980,1254),slice(480,1200))
im=rgb[crop].astype(float); o=im*.5; o[...,0]+=near2[crop]*120; o[...,1]+=him2[crop]*120
Image.fromarray(np.concatenate([im,np.clip(o,0,255)],0).astype(np.uint8)).save('../phone3.png')
if len(sys.argv)>2:
    L[...,0]=(near2*255+.5).astype(np.uint8); L[...,1]=(him2*255+.5).astype(np.uint8); Image.fromarray(L).save(O+'desk-layers.png',optimize=True); print('saved')
