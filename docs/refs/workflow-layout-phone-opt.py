import json, math, random, sys
ALL=json.load(open(sys.argv[2] if len(sys.argv)>2 else 'wf-sizes.json'))  # pill and map sizes measured in the page at 360 and 390
def setsize(key):
  global W,H,SZ,R,Rc,CX,CY
  S=ALL[key]; W,H=S['map']; SZ=S['pills']; R=min(W,H)*24/200; Rc=R*1.3; CX,CY=W/2,H/2
setsize('390')
EDGES=[('ae','motion'),('lottie','motion'),('rive','interaction'),('protopie','interaction'),('figma','product'),('code','product'),('code','interaction'),
 ('script','lottie'),('script','ae'),('sm','interaction'),('sm','lottie'),('sm','msys'),('handoff','figma'),('handoff','code'),('msys','handoff'),('msys','motion'),
 ('brief','motion'),('brief','interaction'),('brief','product'),('build','script'),('review','product')]
WIRED=['ae','lottie','rive','protopie','figma','code','motion','interaction','script','sm','msys','handoff']
IDS=list(SZ)
cur={  # the current phone layout, %
 'brief':(18.8,4.5),'ae':(50,4.5),'build':(81.2,4.5),'motion':(22,14),'script':(70,14),'rive':(17,23.5),'lottie':(47.9,23.5),'review':(80,23.5),
 'interaction':(26.2,33),'msys':(72.9,33),'protopie':(18,69),'handoff':(66.4,69.5),'figma':(14.9,78.5),'sm':(50.8,78.5),'code':(86,78.5),'product':(50,88)}
def box(p,k,m=0):
  x,y=p[k]; w,h=SZ[k]; return (x-w/2-m,y-h/2-m,x+w/2+m,y+h/2+m)
def segbox(x1,y1,x2,y2,b):
  # does the segment cross the box (Liang–Barsky)
  dx,dy=x2-x1,y2-y1; t0,t1=0,1
  for p_,q_ in ((-dx,x1-b[0]),(dx,b[2]-x1),(-dy,y1-b[1]),(dy,b[3]-y1)):
    if p_==0:
      if q_<0: return False
    else:
      t=q_/p_
      if p_<0: t0=max(t0,t)
      else: t1=min(t1,t)
      if t0>t1: return False
  return True
def segdist(x1,y1,x2,y2):
  vx,vy=x2-x1,y2-y1; L2=vx*vx+vy*vy or 1; s=max(0,min(1,((CX-x1)*vx+(CY-y1)*vy)/L2)); return math.hypot(x1+vx*s-CX,y1+vy*s-CY), s
def cross(a,b,c,d):
  def o(p,q,r): return (q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0])
  return o(a,b,c)*o(a,b,d)<0 and o(c,d,a)*o(c,d,b)<0
def score(p, detail=False):
  sc=0; info={}
  # edges of the map
  for k in IDS:
    b=box(p,k)
    for v in (8-b[0], 8-b[1], b[2]-(W-8), b[3]-(H-8)):
      if v>0: sc+=1000*v
  # pills apart; the gap (box distance) wanted ≥ G
  G=26; ks=IDS; gaps=[]
  for i,a in enumerate(ks):
    A=box(p,a)
    # orb clearance
    nx,ny=max(A[0],min(CX,A[2])),max(A[1],min(CY,A[3])); d=math.hypot(nx-CX,ny-CY)
    if d<R+16: sc+=400*(R+16-d)
    for b_ in ks[i+1:]:
      B=box(p,b_)
      gx=max(B[0]-A[2],A[0]-B[2],0); gy=max(B[1]-A[3],A[1]-B[3],0)
      if gx==0 and gy==0:
        ox=min(A[2],B[2])-max(A[0],B[0]); oy=min(A[3],B[3])-max(A[1],B[1]); sc+=2000+50*min(ox,oy)
        g=0
      else: g=math.hypot(gx,gy)
      gaps.append(g)
      if g<G: sc+=(G-g)**2*1.5
  # links: bending round the orb, under other pills, crossings
  segs=[]
  bends=0; under=0
  for a,b_ in EDGES:
    (x1,y1),(x2,y2)=p[a],p[b_]; d,s=segdist(x1,y1,x2,y2)
    if d<Rc and .08<s<.92:
      bends+=1; sc+=(300 if 'lottie' in (a,b_) else 120)+3*(Rc-d)
    for k in IDS:
      if k in (a,b_): continue
      if segbox(x1,y1,x2,y2,box(p,k,3)): under+=1; sc+=90
    segs.append(((x1,y1),(x2,y2),a,b_))
  # the orb's wires (centre to pill) under other pills
  for a in WIRED:
    x1,y1=p[a]
    for k in IDS:
      if k==a: continue
      if segbox(CX,CY,x1,y1,box(p,k,2)): sc+=35
  nc=0
  for i,(a1,a2,ia,ib) in enumerate(segs):
    for (b1,b2,ja,jb) in segs[i+1:]:
      if len({ia,ib,ja,jb})<4: continue
      if cross(a1,a2,b1,b2): nc+=1; sc+=14
  # lines short: a little pull
  sc+=0.02*sum(math.dist(p[a],p[b_]) for a,b_ in EDGES)
  # his placements (27 Oct): interaction and msys beside the orb, lower, out at the sides; lottie to the right; the
  # model's steps at the top corners, product at the foot
  def win(k,ax,lo,hi,wgt=40):
    v=p[k][ax]/(W if ax==0 else H)
    nonlocal_add=0
    if v<lo: return wgt*((lo-v)*100)**2
    if v>hi: return wgt*((v-hi)*100)**2
    return 0
  sc+=win('interaction',1,.47,.56)+win('interaction',0,.0,.21)
  sc+=win('msys',1,.47,.56)+win('msys',0,.79,1)
  sc+=win('lottie',0,.72,1)
  sc+=win('brief',0,0,.25)+win('brief',1,0,.08)+win('build',0,.75,1)+win('build',1,0,.08)
  sc+=win('product',0,.42,.58)+win('product',1,.9,1)
  # an even spread down the map: the pills' heights spread over the bands, so the top and the foot are not crowded
  ys=sorted(p[k][1]/H for k in IDS)
  bands=[sum(1 for y in ys if lo<=y<lo+.2) for lo in (0,.2,.4,.6,.8)]
  sc+=8*sum((c-3.2)**2 for c in bands)
  if detail: return sc, dict(bends=bends, under=under, crossings=nc, mingap=round(min(gaps),1), bands=bands)
  return sc
def mscore(pp, detail=False):
  tot=0; dets={}
  for key in ('360','390'):
    setsize(key); p={k:(pp[k][0]*W, pp[k][1]*H) for k in pp}
    r=score(p, detail)
    if detail: tot+=r[0]; dets[key]=r[1]
    else: tot+=r
  setsize('390')
  return (tot, dets) if detail else tot
def run(seed, iters=60000):
  random.seed(seed)
  start=json.load(open('best.json'))
  p={k:((start[k][0] if start else cur[k][0])/100, (start[k][1] if start else cur[k][1])/100) for k in IDS}
  if not start: p['interaction']=(0.17,0.51); p['msys']=(0.81,0.51); p['lottie']=(0.78,0.3)
  s=mscore(p); best=(s,dict(p)); T=30
  for it in range(iters):
    k=random.choice(IDS); x,y=p[k]; st=max(.004,.03*(1-it/iters))
    q=dict(p); q[k]=(x+random.gauss(0,st), y+random.gauss(0,st*.75))
    if False:
      a,b_=random.sample(IDS,2); q[a],q[b_]=p[b_],p[a]
    s2=mscore(q)
    if s2<s or random.random()<math.exp((s-s2)/T): p,s=q,s2
    if s<best[0]: best=(s,dict(p))
    T=max(.5,T*0.99985)
  return best
res=[run(sd, 40000) for sd in range(int(sys.argv[1]) if len(sys.argv)>1 else 6)]
res.sort(key=lambda r:r[0])
for sc,p in res[:3]:
  print(round(sc,1), mscore(p,True)[1])
best=res[0][1]
out={k:[round(best[k][0]*100,1), round(best[k][1]*100,1)] for k in IDS}
json.dump(out, open('best3.json','w')); print(json.dumps(out))
