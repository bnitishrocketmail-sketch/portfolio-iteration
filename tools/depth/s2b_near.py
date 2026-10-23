import numpy as np, onnxruntime as ort, cv2
from PIL import Image
A = '/home/claude/portfolio-iteration/src/assets/'
dep = ort.InferenceSession('model.onnx', providers=['CPUExecutionProvider']); di = dep.get_inputs()[0].name
def depth(rgb, side=1022):
    H, W = rgb.shape[:2]; s = side / max(W, H); w = max(14, int(round(W*s/14))*14); h = max(14, int(round(H*s/14))*14)
    x = (cv2.resize(rgb, (w, h), interpolation=cv2.INTER_CUBIC).astype(np.float32)/255. - [0.485,0.456,0.406]) / [0.229,0.224,0.225]
    d = dep.run(None, {di: x.transpose(2,0,1)[None].astype(np.float32)})[0][0]
    d = cv2.resize(d, (W, H), interpolation=cv2.INTER_CUBIC); return ((d - d.min()) / (d.max() - d.min() + 1e-6)).astype(np.float32)
def guided(I, p, r, eps):
    b = lambda x: cv2.boxFilter(x, -1, (2*r+1, 2*r+1)); mI, mp = b(I), b(p); A_ = (b(I*p) - mI*mp) / (b(I*I) - mI*mI + eps); B = mp - A_*mI; return b(A_)*I + b(B)
for name, pic, cut in [('illustration', 'nitish-desk-illustration.webp', 'nitish-desk-illustration-cutout.webp'), ('desk', 'nitish-desk.webp', 'nitish-desk-cutout.webp')]:
    rgb = np.asarray(Image.open(A + pic).convert('RGB')); H, W = rgb.shape[:2]
    him = np.asarray(Image.open(A + cut).convert('RGBA'))[..., 3].astype(np.float32) / 255.
    d = np.load(f'{name}-d.npy')
    near0 = ((d > .35) & (him < .5)).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(near0, 8)
    keep = [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > W * H * .0005]
    zone = cv2.dilate(np.isin(lab, keep).astype(np.uint8), np.ones((3, 3), np.uint8), iterations=int(W * .015)).astype(np.float32)
    near = np.zeros((H, W), np.float32)
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.
    # each near thing re-measured on a crop round it at the model's full resolution (many more pixels per edge than the
    # whole picture gets), split from the wall at its own depth step (Otsu), then snapped to the picture's edges
    for i in keep:
        x, y, w, h = st[i, :4]; px, py = int(w * .12) + 10, int(h * .12) + 10
        x0, y0, x1, y1 = max(0, x - px), max(0, y - py), min(W, x + w + px), min(H, y + h + py)
        dc = depth(rgb[y0:y1, x0:x1])
        t, _ = cv2.threshold((dc * 255).astype(np.uint8), 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        m = (dc * 255 > t).astype(np.float32)
        m = np.clip(guided(g[y0:y1, x0:x1], m, 2, 1e-3), 0, 1)
        near[y0:y1, x0:x1] = np.maximum(near[y0:y1, x0:x1], m * zone[y0:y1, x0:x1])
        print(name, 'component', (x, y, w, h), 'otsu', t, flush=True)
    near = near * (1 - (him > .5))
    np.save(f'{name}-near.npy', near)
    Image.fromarray((near * 255).astype(np.uint8)).resize((W // 2, H // 2)).save(f'{name}-near.png')
