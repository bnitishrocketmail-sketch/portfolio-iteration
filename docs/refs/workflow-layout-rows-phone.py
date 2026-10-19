import json, math, sys
P = json.load(open(sys.argv[1]))['390']; MW, MH = P['map']; sz = P['pills']
size = 24; cx, cy, R = MW/2, MH/2, min(MW, MH)*size/200
# rows, top to bottom, each a list of pill ids laid out left-to-right with equal gaps across the width (or centred)
rows = [
  (4.5,  ['brief', 'ae', 'build']),
  (13.0, ['motion', 'script']),
  (21.5, ['rive', 'lottie', 'review']),
  (30.0, ['interaction', 'msys']),
  # the orb at 50%
  (70.0, ['protopie', 'handoff']),
  (78.5, ['figma', 'sm', 'code']),
  (88.0, ['product']),
]
# single-pill rows: the skill alternates sides so the column reads as a path, not a stack
side = {'product': .5}
pos = {}
for y, ids in rows:
    widths = [sz[i][0] for i in ids]; free = MW - sum(widths); gap = free/(len(ids)+1)
    if len(ids) == 1: pos[ids[0]] = [round(side[ids[0]]*100, 1), y]; continue
    x = gap
    for i, w in zip(ids, widths): pos[i] = [round((x + w/2)/MW*100, 1), y]; x += w + gap
# hard checks
box = {k: (v[0]/100*MW - sz[k][0]/2, v[1]/100*MH - sz[k][1]/2, v[0]/100*MW + sz[k][0]/2, v[1]/100*MH + sz[k][1]/2) for k, v in pos.items()}
bad = []
ks = list(pos)
for i, a in enumerate(ks):
    A = box[a]
    if A[0] < 2 or A[1] < 2 or A[2] > MW-2 or A[3] > MH-2: bad.append(a+'~edge')
    nx, ny = max(A[0], min(cx, A[2])), max(A[1], min(cy, A[3]))
    if math.hypot(nx-cx, ny-cy) < R*1.05+14: bad.append(f'{a}~orb({math.hypot(nx-cx, ny-cy)-R:.0f})')
    for b in ks[i+1:]:
        B = box[b]
        if A[0] < B[2]+10 and B[0] < A[2]+10 and A[1] < B[3]+10 and B[1] < A[3]+10: bad.append(a+'~'+b)
print(json.dumps(pos)); print('bad', bad, 'orb R', round(R), 'rows y px', [round(y/100*MH) for y, _ in rows])
