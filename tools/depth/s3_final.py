import numpy as np, onnxruntime as ort, cv2
from PIL import Image
A = '/home/claude/portfolio-iteration/src/assets/'; OUT = '/home/claude/portfolio-iteration/public/depth/'
lama = ort.InferenceSession('lama.onnx', providers=['CPUExecutionProvider'])
def guided(I, p, r, eps):
    b = lambda x: cv2.boxFilter(x, -1, (2*r+1, 2*r+1)); mI, mp = b(I), b(p); A_ = (b(I*p) - mI*mp) / (b(I*I) - mI*mI + eps); B = mp - A_*mI; return b(A_)*I + b(B)
def fill(v, hole, sigma=0):
    f = cv2.inpaint(v.astype(np.float32), hole.astype(np.uint8), 5, cv2.INPAINT_TELEA)
    return cv2.GaussianBlur(f, (0, 0), sigma) if sigma else f
def inpaint_lama(rgb, hole):
    H, W = hole.shape
    x = cv2.resize(rgb, (512, 512), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.
    m = (cv2.resize(hole.astype(np.uint8) * 255, (512, 512), interpolation=cv2.INTER_NEAREST) > 0).astype(np.float32)
    out = lama.run(None, {'image': x.transpose(2, 0, 1)[None], 'mask': m[None, None]})[0][0].transpose(1, 2, 0)
    if out.max() <= 1.5: out = out * 255.
    return cv2.resize(np.clip(out, 0, 255).astype(np.uint8), (W, H), interpolation=cv2.INTER_CUBIC)
k3 = np.ones((3, 3), np.uint8)
for name, pic, cut in [('illustration', 'nitish-desk-illustration.webp', 'nitish-desk-illustration-cutout.webp'), ('desk', 'nitish-desk.webp', 'nitish-desk-cutout.webp')]:
    im = Image.open(A + pic).convert('RGB'); W, H = im.size; rgb = np.asarray(im)
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.
    him = np.asarray(Image.open(A + cut).convert('RGBA'))[..., 3].astype(np.float32) / 255.
    d = np.load(f'{name}-d.npy')
    # the near things: re-measured on their crops (s2b), joined with the whole picture's own near region (the pole and
    # the desk, which the crops miss), snapped to the picture's edges; a pixel grown, so their own edge pixels go with them
    glob = np.clip(guided(g, ((d > .35) & (him < .5)).astype(np.float32), 3, 1e-3), 0, 1)
    near = np.maximum(np.load(f'{name}-near.npy'), glob)
    near = (near > .5).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(near, 8)
    near = np.isin(lab, [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > W * H * .0005]).astype(np.uint8)
    near = cv2.morphologyEx(near, cv2.MORPH_CLOSE, k3, iterations=2)
    near = cv2.dilate(near, k3, iterations=1).astype(np.float32)
    near = cv2.GaussianBlur(near, (0, 0), .7) * (1 - (him > .5))
    # the plate: him and the near things painted out (LaMa) — the background layer, and what a moving edge uncovers
    gone = cv2.dilate(((him > .02) | (near > .02)).astype(np.uint8), k3, iterations=int(W * .008))
    filled = inpaint_lama(rgb, gone)
    soft = cv2.GaussianBlur(gone.astype(np.float32), (0, 0), 1.5)[..., None]
    plate = (rgb * (1 - soft) + filled * soft).astype(np.uint8)
    Image.fromarray(plate).save(OUT + f'{name}-plate.webp', quality=92)
    # the layers, for the shader to tell a pixel's own layer: R near, G him
    lay = np.zeros((H, W, 3), np.uint8); lay[..., 0] = (near * 255 + .5).astype(np.uint8); lay[..., 1] = (him * 255 + .5).astype(np.uint8)
    Image.fromarray(lay).save(OUT + f'{name}-layers.png', optimize=True)
    # the depth: the wall's smooth and filled under them; theirs carried a little past their outlines; laid in by the masks
    bg = fill(d, gone, 3)
    grow = lambda m: (m < .5).astype(np.uint8) & cv2.dilate((m >= .5).astype(np.uint8), k3, iterations=6)
    hd = np.maximum(fill(cv2.GaussianBlur(d, (0, 0), 1.5), grow(him)), bg + .12)
    nd = np.maximum(fill(cv2.GaussianBlur(d, (0, 0), 1.5), grow(near)), bg + .2)
    D = np.clip((bg * (1 - near) + nd * near) * (1 - him) + hd * him, 0, 1)
    Image.fromarray((D * 255 + .5).astype(np.uint8)).save(OUT + f'{name}.png', optimize=True)
    Image.fromarray((near * 255).astype(np.uint8)).resize((W // 2, H // 2)).save(f'{name}-near-final.png')
    Image.fromarray(plate).resize((W // 2, H // 2)).save(f'{name}-plate-s.png')
    print(name, 'done', flush=True)
