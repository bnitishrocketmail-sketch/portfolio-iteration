# gen.py — builds sig3.json: "Product → Interaction → Motion" over the script "Designer", from his signature.json.
# Everything he drew is reused as it is (the letters of Product and Motion, the play head and its flag, Designer);
# "Interaction" is set in the same face (Inter SemiBold, measured: his outlines match it to 0.01), at the same size and
# tracking. Usage: python3 gen.py [out.json]
import json, copy, sys
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen

SRC = json.load(open('orig.json'))
OUT = sys.argv[1] if len(sys.argv) > 1 else 'sig3.json'
comps = {a['id']: a for a in SRC['assets']}
L = {l['nm']: l for l in SRC['layers']}

FR = 60
SWEEP, HOLD = 90, 120            # his: the wipe over 90 frames, the word held for 120
SEG = SWEEP + HOLD
E_O, E_I = {'x': [0.167], 'y': [0.167]}, {'x': [0], 'y': [1]}      # his easing on every key: out .167/.167, in 0/1
LS = 131.96                       # his letters' layer scale (%)
SC = 42.2 / 1490                  # Inter's units → his path units (cap height 42.2)
TRACK = 1.568                     # his tracking: each gap 1.568 path units tighter than Inter's own
X0 = 33.5                         # where a word's first letter sits (the P of Product, as it is now)
HEAD_R = 315.5                    # the play head's rest between a word and Designer (his)
HEAD_GAP = 12.5                   # …and left of a word: his 21 against the P at 33.5
GRAY = [0.458823529412, 0.458823529412, 0.458823529412, 1]
BASE_Y = 200.9                    # his letters' layer y in their comp
CW, CH = 1000, 360                # the word comps: wider than his 720, so the longer word is inside them
CX = 140                          # …his comp's x moved right by this inside the wider comp

# ---------- letters ----------
def letter_layers(comp_id):
    out = []
    for l in comps[comp_id]['layers']:
        g = l['shapes'][0]
        out.append({'nm': l['nm'], 'shapes': copy.deepcopy(l['shapes']), 'rest': l['ks']['p']['k'][0]['s'][0] if comp_id == 'comp_0' else l['ks']['p']['k'][1]['s'][0]})
    return out
PRODUCT = letter_layers('comp_0')   # rest x: 359 (c 362)
MOTION = letter_layers('comp_1')    # rest x: 374
P_C = [90, 80, 70, 60, 40, 17, 0]   # his: how far each letter of Product is carried right (c ends at 379)
M_C = [50, 40, 30, 20, 10, 0]       # his: Motion's letters start this far right
M_L = [0, -10, -20, -30, -40, -50]  # his: Motion's letters carried left on the way back

class Cubic(BasePen):
    def __init__(self, gs): super().__init__(gs); self.contours = []; self.cur = None
    def _moveTo(self, p): self.cur = [('M', p)]
    def _lineTo(self, p): self.cur.append(('L', p))
    def _curveToOne(self, a, b, c): self.cur.append(('C', a, b, c))
    def _closePath(self): self.contours.append(self.cur); self.cur = None
    def _endPath(self): self._closePath()

def glyph_paths(gs, gname, dx):
    pen = Cubic(gs); gs[gname].draw(pen); shapes = []
    for ct in pen.contours:
        pts = [ct[0][1]]; ins = [(0, 0)]; outs = []
        for seg in ct[1:]:
            if seg[0] == 'L': outs.append((0, 0)); pts.append(seg[1]); ins.append((0, 0))
            else:
                p0 = pts[-1]; outs.append((seg[1][0] - p0[0], seg[1][1] - p0[1])); pts.append(seg[3]); ins.append((seg[2][0] - seg[3][0], seg[2][1] - seg[3][1]))
        outs.append((0, 0))
        if len(pts) > 1 and abs(pts[-1][0] - pts[0][0]) < 1e-6 and abs(pts[-1][1] - pts[0][1]) < 1e-6:   # the closing point repeats the first
            ins[0] = ins[-1]; pts.pop(); ins.pop(); outs.pop()
        T = lambda p: [round(p[0] * SC + dx, 3), round(-p[1] * SC, 3)]; D = lambda p: [round(p[0] * SC, 3), round(-p[1] * SC, 3)]
        shapes.append({'ty': 'sh', 'ks': {'a': 0, 'k': {'v': [T(p) for p in pts], 'i': [D(p) for p in ins], 'o': [D(p) for p in outs], 'c': True}}, 'nm': gname, 'hd': False})
    return shapes

def set_word(text, right_edge_path):
    """the word's letters in his face and tracking, its last letter's right edge at right_edge_path (path units)"""
    f = TTFont('font/inter-600.ttf'); gs = f.getGlyphSet(); data = open('font/inter-600.ttf', 'rb').read()
    font = hb.Font(hb.Face(data)); buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties(); hb.shape(font, buf, {})
    from fontTools.pens.boundsPen import BoundsPen
    x = 0; items = []
    for k, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
        gn = font.glyph_to_string(info.codepoint); bp = BoundsPen(gs); gs[gn].draw(bp)
        items.append([gn, x * SC - TRACK * k, bp.bounds]); x += pos.x_advance
    last = items[-1]; shift = right_edge_path - (last[1] + last[2][2] * SC)
    out = []
    for (gn, px, b), ch in zip(items, text):
        shapes = glyph_paths(gs, gn, px + shift)
        grp = {'ty': 'gr', 'it': shapes + [{'ty': 'fl', 'c': {'a': 0, 'k': GRAY}, 'o': {'a': 0, 'k': 100}, 'r': 1, 'bm': 0, 'nm': 'Fill 1', 'hd': False},
               {'ty': 'tr', 'p': {'a': 0, 'k': [0, 0]}, 'a': {'a': 0, 'k': [0, 0]}, 's': {'a': 0, 'k': [100, 100]}, 'r': {'a': 0, 'k': 0}, 'o': {'a': 0, 'k': 100}, 'sk': {'a': 0, 'k': 0}, 'sa': {'a': 0, 'k': 0}, 'nm': 'Transform'}], 'nm': ch, 'hd': False}
        out.append({'nm': ch.upper(), 'shapes': [grp], 'rest': 374, 'left': px + shift + b[0] * SC, 'right': px + shift + b[2] * SC})
    return out
INTER = set_word('Interaction', -37.38)        # its n where Motion's n is (his n's right edge, path units; layer x 374)
N_I = len(INTER)
I_C = [10 * (N_I - 1 - k) for k in range(N_I)]  # as his words: ten for each letter after it
I_L = [-10 * k for k in range(N_I)]
P_L = [-10 * k for k in range(len(PRODUCT))]

def canvas_x(rest, path_x): return rest - 24 + LS / 100 * path_x   # his comp sits 24 left of the canvas
def bbox_x(shapes):
    xs = []
    def walk(items):
        for it in items:
            if it['ty'] == 'gr': walk(it['it'])
            elif it['ty'] == 'sh':
                k = it['ks']['k']
                for v, i, o in zip(k['v'], k['i'], k['o']): xs.extend([v[0], v[0] + i[0], v[0] + o[0]])
    walk(shapes); return min(xs), max(xs)
LEFT = {'P': canvas_x(PRODUCT[0]['rest'], bbox_x(PRODUCT[0]['shapes'])[0]), 'M': canvas_x(MOTION[0]['rest'], bbox_x(MOTION[0]['shapes'])[0]), 'I': canvas_x(374, INTER[0]['left'])}
RIGHT = {'P': canvas_x(359, bbox_x(PRODUCT[-1]['shapes'])[1]), 'M': canvas_x(374, bbox_x(MOTION[-1]['shapes'])[1]), 'I': canvas_x(374, INTER[-1]['right'])}
ALIGN = {w: X0 - LEFT[w] for w in LEFT}          # how far the whole drawing moves so that word's first letter is at X0
WORDS = {'P': (PRODUCT, P_C, P_L), 'I': (INTER, I_C, I_L), 'M': (MOTION, M_C, M_L)}

def key(t, v, hold=False):
    k = {'t': t, 's': v}
    if not hold: k['o'] = E_O; k['i'] = E_I
    return k
def anim(a, b, y=None):
    """a → b over the sweep, his easing, then held"""
    mk = (lambda v: [v, y, 0]) if y is not None else (lambda v: [v])
    return {'a': 1, 'k': [dict(key(0, mk(a)), **({'to': [0, 0, 0], 'ti': [0, 0, 0]} if y is not None else {})), {'t': SWEEP, 's': mk(b)}]}
def static(v): return {'a': 0, 'k': v}

def word_comp(cid, word, mode):
    letters, C, Lf = WORDS[word]; layers = []
    for k, lt in enumerate(letters):
        r = lt['rest'] + CX
        a, b = {'in': (r + C[k], r), 'outR': (r, r + C[k]), 'outL': (r, r + Lf[k])}[mode]
        if word == 'P' and lt['nm'] == 'C':             # his c: rests 3 right of its place and ends at 379
            a, b = {'in': (379 + CX, r), 'outR': (r, 379 + CX), 'outL': (r, r + Lf[k])}[mode]
        layers.append({'ddd': 0, 'ind': k + 1, 'ty': 4, 'nm': lt['nm'], 'sr': 1, 'ks': {'o': static(100), 'r': static(0), 'p': anim(a, b, BASE_Y) if a != b else static([a, BASE_Y, 0]), 'a': static([0, 0, 0]), 's': static([LS, LS, 100])},
                       'ao': 0, 'shapes': copy.deepcopy(lt['shapes']), 'ip': 0, 'op': SEG + 1, 'st': 0, 'bm': 0})
    return {'id': cid, 'nm': cid, 'fr': FR, 'layers': layers}

assets = []
for w in 'PIM':
    for mode in ('in', 'outR', 'outL'): assets.append(word_comp(f'{w}_{mode}', w, mode))

# ---------- the main comp ----------
ORDER = 'PIM'
N_SEG = 6
segs = []
for s in range(N_SEG):
    out, inn, d = ORDER[s % 3], ORDER[(s + 1) % 3], (1 if s % 2 == 0 else -1)
    segs.append({'t0': s * SEG, 'out': out, 'in': inn, 'dir': d, 'h0': (LEFT[out] - HEAD_GAP) if d > 0 else HEAD_R, 'h1': HEAD_R if d > 0 else (LEFT[inn] - HEAD_GAP)})
TOTAL = N_SEG * SEG

def track(values, y=None, z=True):
    """keys across the whole loop: at each sweep a → b with his easing, held between"""
    ks = []
    for s, (a, b) in zip(segs, values):
        mk = (lambda v: [v, y, 0]) if y is not None else (lambda v: [v])
        k0 = key(s['t0'], mk(a)); k1 = {'t': s['t0'] + SWEEP, 's': mk(b), 'h': 1}
        if y is not None: k0['to'] = [0, 0, 0]; k0['ti'] = [0, 0, 0]
        ks += [k0, k1]
    ks.append({'t': TOTAL, 's': ks[0]['s']}); return {'a': 1, 'k': ks}

layers = []; ind = [0]
def add(l): ind[0] += 1; l['ind'] = ind[0]; layers.append(l); return ind[0]
def null(nm, p):
    return add({'ddd': 0, 'ty': 3, 'nm': nm, 'sr': 1, 'ks': {'o': static(0), 'r': static(0), 'p': p, 'a': static([0, 0, 0]), 's': static([100, 100, 100])}, 'ao': 0, 'ip': 0, 'op': TOTAL, 'st': 0, 'bm': 0})

ALIGN_N = null('align: the word\'s first letter stays at one x', track([(ALIGN[s['out']], ALIGN[s['in']]) for s in segs], y=0))
HEAD_N = null('head x', track([(s['h0'], s['h1']) for s in segs], y=0)); layers[-1]['parent'] = ALIGN_N

# the play head and its flag: his layers, on the head's null
head = copy.deepcopy(L['play head Outlines']); flag = copy.deepcopy(L['Shape Layer 4'])
head['ks']['p'] = static([0, 148.5, 0]); head['parent'] = HEAD_N; head['op'] = TOTAL; head['ip'] = 0
flag_i = add(flag); head_i = add(head); flag['parent'] = head_i; flag['op'] = TOTAL
# (flag is drawn above the head's line, as in his file)

def rect_matte(nm, x0, x1, t0, t1):
    return {'ddd': 0, 'ty': 4, 'nm': nm, 'td': 1, 'sr': 1, 'parent': HEAD_N, 'ks': {'o': static(100), 'r': static(0), 'p': static([0, 0, 0]), 'a': static([0, 0, 0]), 's': static([100, 100, 100])}, 'ao': 0,
            'shapes': [{'ty': 'gr', 'it': [{'ty': 'rc', 'd': 1, 's': static([x1 - x0, 400]), 'p': static([(x0 + x1) / 2, 70]), 'r': static(0), 'nm': 'Rect', 'hd': False},
                                            {'ty': 'fl', 'c': static([1, 0, 0, 1]), 'o': static(100), 'r': 1, 'bm': 0, 'nm': 'Fill', 'hd': False},
                                            {'ty': 'tr', 'p': static([0, 0]), 'a': static([0, 0]), 's': static([100, 100]), 'r': static(0), 'o': static(100), 'sk': static(0), 'sa': static(0), 'nm': 'Transform'}], 'nm': 'side', 'hd': False}],
            'ip': t0, 'op': t1, 'st': 0, 'bm': 0}
def word_layer(nm, cid, parent, px, t0, t1):
    return {'ddd': 0, 'ty': 0, 'nm': nm, 'refId': cid, 'tt': 1, 'sr': 1, 'parent': parent, 'ks': {'o': static(100), 'r': static(0), 'p': static([px, 70.5, 0]), 'a': static([360 + CX, 180, 0]), 's': static([100, 100, 100])}, 'ao': 0, 'w': CW, 'h': CH, 'ip': t0, 'op': t1, 'st': t0, 'bm': 0}

FAR = 1200
for n, s in enumerate(segs):
    t0 = s['t0']; d = s['dir']; out, inn = s['out'], s['in']
    # Which side of the head a word is on decides what it is fixed to. Left of the head: to the name's edge — it does not
    # move with the drawing, its first letter stays at X0. Right of the head: to Designer — it rides with the drawing as
    # that makes room for the longer or shorter word. (His file had both words fixed to Designer and the page shifted
    # the whole drawing; with a word as long as Interaction that carried letters past the head before it reached them.)
    def place(word, side):   # → (parent, x)
        return (None, 336 + ALIGN[word]) if side == 'left' else (ALIGN_N, 336)
    # the word leaving: ahead of the head, bunching the way it travels, until the head has passed all of it
    out_side, in_side = ('right', 'left') if d > 0 else ('left', 'right')
    add(rect_matte(f'{n + 1} side of {out}', 0 if d > 0 else -FAR, FAR if d > 0 else 0, t0, t0 + SWEEP))
    parent, px = place(out, out_side); wl = word_layer(f'{n + 1} {out} leaving', f'{out}_{"outR" if d > 0 else "outL"}', parent, px, t0, t0 + SWEEP)
    if parent is None: del wl['parent']
    add(wl)
    # the word arriving: behind the head, its letters settling; then held until the next sweep
    add(rect_matte(f'{n + 1} side of {inn}', -FAR if d > 0 else 0, 0 if d > 0 else FAR, t0, t0 + SEG))
    parent, px = place(inn, in_side); wl = word_layer(f'{n + 1} {inn} arriving', f'{inn}_in', parent, px, t0, t0 + SEG)
    if parent is None: del wl['parent']
    add(wl)

des = copy.deepcopy(L['Designer 3 Outlines']); des['parent'] = ALIGN_N; des['op'] = TOTAL; add(des)

# the canvas: his height; wide enough for the longest word with Designer after it
des_right = 0
k = des['ks']
for g in des['shapes']:
    lo, hi = bbox_x([g]); des_right = max(des_right, k['p']['k'][0] + hi * k['s']['k'][0] / 100)
W = int(des_right + max(ALIGN.values()) + 14)
doc = {'v': SRC['v'], 'fr': FR, 'ip': 0, 'op': TOTAL, 'w': W, 'h': SRC['h'], 'nm': 'Product · Interaction · Motion — Designer', 'ddd': 0, 'assets': assets, 'layers': layers, 'markers': []}
json.dump(doc, open(OUT, 'w'), separators=(',', ':'))
info = {'W': W, 'H': SRC['h'], 'frames': TOTAL, 'LEFT': {k: round(v, 2) for k, v in LEFT.items()}, 'RIGHT': {k: round(v, 2) for k, v in RIGHT.items()}, 'ALIGN': {k: round(v, 2) for k, v in ALIGN.items()}, 'segs': [{k: (round(v, 2) if isinstance(v, float) else v) for k, v in s.items()} for s in segs]}
json.dump(info, open('sig3-info.json', 'w'), indent=1); print(json.dumps(info))
import os; print(OUT, os.path.getsize(OUT), 'bytes', len(layers), 'layers')
