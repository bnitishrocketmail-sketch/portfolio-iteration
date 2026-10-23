# Layered spatial scene: per-layer smooth depth fields (R wall, G near things, B him), decontaminated foreground colours
import numpy as np, cv2, sys, time
from PIL import Image
from pymatting import estimate_foreground_ml
A = '/home/claude/portfolio-iteration/src/assets/'; OUT = '/home/claude/portfolio-iteration/public/depth/'
def fill(v, hole):
    return cv2.inpaint(v.astype(np.float32), hole.astype(np.uint8), 5, cv2.INPAINT_TELEA)
def ext(d, m, sig):
    # the layer's depth inside its mask, carried smoothly outside it (a pyramid fill, then a blur)
    inside = m > .5
    v = d.copy(); w = inside.astype(np.float32)
    # normalised convolution at growing scales: each pixel outside takes the nearest inside depths
    out = np.where(inside, d, 0).astype(np.float32); have = inside.copy()
    s = 2.
    while not have.all():
        num = cv2.GaussianBlur(np.where(inside, d, 0).astype(np.float32), (0, 0), s); den = cv2.GaussianBlur(w, (0, 0), s)
        ok = (den > 1e-4) & ~have
        out[ok] = num[ok] / den[ok]; have |= ok; s *= 1.6
    # smooth: the inside weighted, so the outline stays put
    num = cv2.GaussianBlur(out * (.2 + .8 * w), (0, 0), sig); den = cv2.GaussianBlur(.2 + .8 * w, (0, 0), sig)
    return num / den
def planes(d, m, sig):
    # each near thing moves as one rigid piece: a plane fitted to its depth (a tilted plane is a perspective turn, so
    # nothing inside it bends); outside, the nearest piece's plane, smoothed
    H, W = d.shape; yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); xx /= W; yy /= H
    n, lab = cv2.connectedComponents((m > .5).astype(np.uint8), connectivity=8)
    P = np.zeros_like(d)
    for i in range(1, n):
        k = lab == i
        if k.sum() < 50: continue
        X = np.stack([np.ones(k.sum()), xx[k], yy[k]], 1); y = d[k]
        c = np.linalg.lstsq(X, y, rcond=None)[0]
        for _ in range(3):  # robust: the pixels far off the plane count less
            r = np.abs(X @ c - y); w = 1 / (1 + (r / (np.median(r) + 1e-3)) ** 2)
            c = np.linalg.lstsq(X * w[:, None], y * w, rcond=None)[0]
        P[k] = (np.stack([np.ones_like(xx), xx, yy], -1) @ c)[k]
        print('   piece', i, k.sum(), 'depth', np.round(c, 3))
    inside = lab > 0
    _, near_lab = cv2.distanceTransformWithLabels((~inside).astype(np.uint8), cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
    ys, xs = np.nonzero(inside); idx = np.zeros(near_lab.max() + 1, np.int64)
    # map each label (a zero pixel's index) back to that pixel
    zl = near_lab[inside]; idx[zl] = np.arange(len(zl))
    F = P[ys, xs][idx[near_lab]]
    F = cv2.GaussianBlur(F.astype(np.float32), (0, 0), sig)
    F[inside] = P[inside]
    return cv2.GaussianBlur(F, (0, 0), 1.)
for name, pic, cut in [('illustration', 'nitish-desk-illustration.webp', 'nitish-desk-illustration-cutout.webp'), ('desk', 'nitish-desk.webp', 'nitish-desk-cutout.webp')]:
    t0 = time.time()
    rgb = np.asarray(Image.open(A + pic).convert('RGB')); H, W = rgb.shape[:2]
    L = np.asarray(Image.open(OUT + f'{name}-layers.png')).astype(np.float32) / 255.
    near, him = L[..., 0], L[..., 1]
    d = np.load(f'{name}-d.npy').astype(np.float32)
    gone = cv2.dilate(((him > .02) | (near > .02)).astype(np.uint8), np.ones((3, 3), np.uint8), iterations=int(W * .008))
    bg = ext(d, 1 - gone, W * .03)
    nd = np.maximum(planes(d, near, W * .02), bg + .2)
    hd = np.maximum(ext(d, him, W * .03), bg + .12)
    dep = np.stack([bg, nd, hd], -1)
    Image.fromarray((np.clip(dep, 0, 1) * 255 + .5).astype(np.uint8)).save(OUT + f'{name}.png', optimize=True)
    # his colours, with the wall and the desk taken out of his edge pixels (ML foreground estimation)
    # from the picture as the page shows it: his cutout (whose colours differ a little from the picture's, the drawing's
    # arms most) laid over the picture
    cu = np.asarray(Image.open(A + cut).convert('RGBA')).astype(np.float64) / 255.
    seen = cu[..., :3] * cu[..., 3:] + rgb / 255. * (1 - cu[..., 3:])
    fh = estimate_foreground_ml(seen, him.astype(np.float64))
    Image.fromarray((np.clip(fh, 0, 1) * 255 + .5).astype(np.uint8)).save(OUT + f'{name}-fg.webp', quality=95)
    # the near things' layer, carried under him where they go on behind him (within reach of the largest gap that can open,
    # ~2% of the width), its colours there from the picture with him painted out
    reach = cv2.dilate((near > .5).astype(np.uint8), np.ones((3, 3), np.uint8), iterations=int(W * .03)) > 0
    under = reach & (cv2.dilate((him > .02).astype(np.uint8), np.ones((3, 3), np.uint8), iterations=3) > 0)  # over the seam with their own edge, so no crack
    ne = np.where(under, np.maximum(near, cv2.GaussianBlur(under.astype(np.float32), (0, 0), 1.)), near)
    behind = np.asarray(Image.open(f'{name}-behind.png')).astype(np.float64) / 255.
    hole = cv2.dilate((him > .02).astype(np.uint8), np.ones((3, 3), np.uint8), iterations=4) > 0  # as painted out (s5), his soft rim with it
    src = np.where(hole[..., None], behind, rgb / 255.)
    fn = estimate_foreground_ml(src, np.clip(ne, 0, 1).astype(np.float64))
    Image.fromarray((np.clip(fn, 0, 1) * 255 + .5).astype(np.uint8)).save(OUT + f'{name}-fgn.webp', quality=95)
    Lo = np.asarray(Image.open(OUT + f'{name}-layers.png')).copy(); Lo[..., 2] = (np.clip(ne, 0, 1) * 255 + .5).astype(np.uint8)
    Image.fromarray(Lo).save(OUT + f'{name}-layers.png', optimize=True)  # B: the near layer, carried under him
    print(name, W, H, 'bg', bg.min(), bg.max(), 'near', nd[near > .5].mean(), 'him', hd[him > .5].mean(), f'{time.time()-t0:.1f}s', flush=True)
