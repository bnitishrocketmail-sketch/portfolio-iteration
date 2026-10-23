import numpy as np, cv2
from PIL import Image
O='/home/claude/portfolio-iteration/public/depth/'
for name in ['illustration','desk']:
    L=np.asarray(Image.open(O+name+'-layers.png')).copy(); him=L[...,1].astype(np.float32)/255
    n,lab,st,_=cv2.connectedComponentsWithStats((him>.5).astype(np.uint8),8)
    main=lab==(1+np.argmax(st[1:,4]))
    zone=cv2.dilate(main.astype(np.uint8),np.ones((3,3),np.uint8),iterations=4)>0
    him=np.where(zone,him,0)
    # his cutout is not quite opaque inside (the drawing's down to .8 in places, the photo's .988): inside, he is solid,
    # and his edges are scaled to reach 1, so nothing behind shows through him
    core=cv2.erode((him>.5).astype(np.uint8),np.ones((3,3),np.uint8),iterations=3)>0
    him=np.clip(him/.93,0,1); him[core]=1
    # small holes inside him (a seam's pinholes): filled
    n,lab,st,_=cv2.connectedComponentsWithStats((him<.9).astype(np.uint8),4)
    H,W=him.shape
    for i in range(1,n):
        x,y,w,h,a=st[i]
        if a<W*H*.0003 and x>0 and y>0 and x+w<W and y+h<H: him[lab==i]=1
    near=L[...,0].astype(np.float32)/255
    n,lab,st,_=cv2.connectedComponentsWithStats((near>.01).astype(np.uint8),8)
    for i in range(1,n):
        if st[i,4]<W*H*.0005: near[lab==i]=0
    L[...,0]=(near*255+.5).astype(np.uint8)
    L[...,1]=(him*255+.5).astype(np.uint8); Image.fromarray(L).save(O+name+'-layers.png',optimize=True); print(name,'him cleaned')
