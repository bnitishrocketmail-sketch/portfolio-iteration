# p151: only his face made one rigid piece (a plane fitted to its depth), the rest of him exactly as p149 — his nose, standing out from the
# cheek in the depth, had stretched in and out at the strong setting. Rewrites only the B channel (his depth) of the depth
# map, inside a soft ellipse round his face; the wall's (R) and the near things' (G) stay as they are.
import numpy as np, cv2, sys
from PIL import Image
src = open('s4_layers.py').read(); ns = {}; exec(src[:src.index('for name, pic, cut in')], ns); ext = ns['ext']
A = '/home/claude/portfolio-iteration/src/assets/'; OUT = '/home/claude/portfolio-iteration/public/depth/'
FACES = {'illustration': (495, 580, 175, 135), 'desk': (595, 780, 185, 150)}  # centre x, y, half-axes, in the picture's pixels
SAVE = len(sys.argv) > 1
for name in ['illustration', 'desk']:
    D = np.asarray(Image.open(OUT + f'{name}.png')).copy(); H, W = D.shape[:2]
    L = np.asarray(Image.open(OUT + f'{name}-layers.png')).astype(np.float32) / 255.; him = L[..., 1]
    d = np.load(f'{name}-d.npy').astype(np.float32)
    bg = D[..., 0].astype(np.float32) / 255.
    hd = np.maximum(ext(d, him, W * .03), bg + .12)            # his depth as p149 had it (float)
    cx, cy, ax, ay = FACES[name]
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    E = np.zeros((H, W), np.uint8); cv2.ellipse(E, (cx, cy), (int(ax * .8), int(ay * .8)), 0, 0, 360, 1, -1); core = (E > 0) & (him > .5)
    X = np.stack([np.ones(core.sum()), xx[core], yy[core]], 1); c = np.linalg.lstsq(X, hd[core], rcond=None)[0]
    flat = (c[0] + c[1] * xx + c[2] * yy).astype(np.float32)   # his face's own tilt, as a plane: it moves as one, nothing in it bends
    F = np.zeros((H, W), np.float32); cv2.ellipse(F, (cx, cy), (ax, ay), 0, 0, 360, 1., -1)
    F = cv2.GaussianBlur(F, (0, 0), W * .05)                   # feathered wide, so the face's edge eases into the rest
    F[F < .01] = 0                                             # and the rest of him exactly as before
    new = hd * (1 - F) + flat * F
    m = him > .5
    def stretch(f):
        gx = np.gradient(f, axis=1) * W; gy = np.gradient(f, axis=0) * H
        return np.maximum(np.abs(gx) * .06, np.abs(gy) * .036)
    fm = m & (F > .5); rest = m & (F < .02)
    s0, s1 = stretch(hd), stretch(new)
    print(name, 'face: stretch p50 %.3f p99 %.3f max %.3f -> p50 %.3f p99 %.3f max %.3f' % (np.median(s0[fm]), np.percentile(s0[fm], 99), s0[fm].max(), np.median(s1[fm]), np.percentile(s1[fm], 99), s1[fm].max()))
    band = m & (F > .02) & (F < .5)
    print('   band: max %.3f -> %.3f   rest unchanged: %s   max |B change| outside face %.4f' % (s0[band].max(), s1[band].max(), np.allclose(new[rest], hd[rest]), np.abs(new - hd)[F < .02].max()))
    # p149's own B, as stored, against this float version (so only the face changes)
    print('   stored B vs recomputed: max diff %d levels' % np.abs(D[..., 2].astype(int) - (np.clip(hd, 0, 1) * 255 + .5).astype(int)).max())
    if SAVE:
        D[..., 2] = (np.clip(new, 0, 1) * 255 + .5).astype(np.uint8)
        Image.fromarray(D).save(OUT + f'{name}.png', optimize=True); print('   saved')
