import json, math, random, sys
P = json.load(open(sys.argv[1]))
EDGES = [('ae','motion',0),('lottie','motion',0),('rive','interaction',0),('protopie','interaction',0),('figma','product',0),('code','product',0),('code','interaction',0),
 ('script','lottie',0),('script','ae',0),('sm','interaction',0),('sm','lottie',0),('sm','msys',0),('handoff','figma',0),('handoff','code',0),('msys','handoff',0),('msys','motion',0),
 ('brief','motion',1),('brief','interaction',1),('brief','product',1),('build','script',1),('review','product',1)]
POOL = ['ae','lottie','rive','protopie','figma','code','motion','interaction','script','sm','msys','handoff','product']
def seg_rect(p, q, r):  # does segment pq enter rect r (x0,y0,x1,y1)? Liang–Barsky
    x0, y0, x1, y1 = r; dx, dy = q[0]-p[0], q[1]-p[1]; t0, t1 = 0.0, 1.0
    for pk, qk in ((-dx, p[0]-x0), (dx, x1-p[0]), (-dy, p[1]-y0), (dy, y1-p[1])):
        if pk == 0:
            if qk < 0: return False
        else:
            t = qk/pk
            if pk < 0: t0 = max(t0, t)
            else: t1 = min(t1, t)
            if t0 > t1: return False
    return True
def score(pos, W, size, detail=False):
    m = P[str(W)]; MW, MH = m['map']; sz = m['pills']
    cx, cy, R = MW/2, MH/2, MH*size/200; Rc = 1.3*R
    ctr = {k: (v[0]/100*MW, v[1]/100*MH) for k, v in pos.items()}
    box = {k: (ctr[k][0]-sz[k][0]/2, ctr[k][1]-sz[k][1]/2, ctr[k][0]+sz[k][0]/2, ctr[k][1]+sz[k][1]/2) for k in pos}
    grow = lambda r, g: (r[0]-g, r[1]-g, r[2]+g, r[3]+g)
    bad, curves = [], []
    ks = list(pos)
    for i, a in enumerate(ks):
        A = box[a]
        if A[0] < 8 or A[1] < 6 or A[2] > MW-8 or A[3] > MH-6: bad.append(a+'~edge')
        nx, ny = max(A[0], min(cx, A[2])), max(A[1], min(cy, A[3]))
        if math.hypot(nx-cx, ny-cy) < R*1.05+18: bad.append(a+'~orb')
        for b in ks[i+1:]:
            B = box[b]
            if A[0] < B[2]+14 and B[0] < A[2]+14 and A[1] < B[3]+12 and B[1] < A[3]+12: bad.append(a+'~'+b)
    for a, b, ai in EDGES:
        p, q = ctr[a], ctr[b]; vx, vy = q[0]-p[0], q[1]-p[1]; L2 = vx*vx+vy*vy
        s = max(0, min(1, ((cx-p[0])*vx+(cy-p[1])*vy)/L2)); d = math.hypot(p[0]+vx*s-cx, p[1]+vy*s-cy)
        if d < Rc + 6 and .08 < s < .92: curves.append((a+'-'+b, ai))
        for k in ks:
            if k not in (a, b) and seg_rect(p, q, grow(box[k], 8)): bad.append(f'line {a}-{b}/{k}')
    for k in POOL:
        p = ctr[k]; d = math.hypot(cx-p[0], cy-p[1]); q = (cx-(cx-p[0])*R/d, cy-(cy-p[1])*R/d)
        for o in ks:
            if o != k and seg_rect(p, q, grow(box[o], 8)): bad.append(f'wire {k}/{o}')
    if detail: return bad, curves
    return 100*len(bad) + sum(15 if ai else 40 for _, ai in curves)
def total(pos, base, size):
    s = score(pos, 1440, size) + score(pos, 1280, size)
    s += sum(((pos[k][0]-base[k][0])**2 + (pos[k][1]-base[k][1])**2) for k in pos) * .04
    # Lottie and Rive by Animation, Interaction and State-machine design
    for k in ('lottie', 'rive'):
        s += .25 * sum(math.hypot((pos[k][0]-pos[o][0])*1.96, pos[k][1]-pos[o][1]) for o in ('motion', 'interaction', 'sm')) / 3
    return s
base = json.loads(sys.argv[2]); size = float(sys.argv[3]); random.seed(int(sys.argv[4]) if len(sys.argv) > 4 else 1)
cur = {k: list(v) for k, v in base.items()}; best = json.loads(json.dumps(cur)); fb = fc = total(cur, base, size)
T = 60.0
for it in range(14000):
    k = random.choice(list(cur)); old = cur[k][:]
    cur[k][0] = min(95, max(5, cur[k][0] + random.gauss(0, 2.2))); cur[k][1] = min(95, max(5, cur[k][1] + random.gauss(0, 3.2)))
    f = total(cur, base, size)
    if f < fc or random.random() < math.exp((fc-f)/T): fc = f
    else: cur[k] = old
    if fc < fb: fb = fc; best = json.loads(json.dumps(cur))
    T = max(.3, T*.9994)
best = {k: [round(v[0], 1), round(v[1], 1)] for k, v in best.items()}
print(json.dumps(best)); print('score', round(fb, 1))
for W in (1440, 1280): print(W, score(best, W, size, True))
