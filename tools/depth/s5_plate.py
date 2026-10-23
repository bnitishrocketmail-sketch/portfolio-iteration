import numpy as np, onnxruntime as ort, cv2
from PIL import Image
A = '/home/claude/portfolio-iteration/src/assets/'; OUT = '/home/claude/portfolio-iteration/public/depth/'
lama = ort.InferenceSession('lama.onnx', providers=['CPUExecutionProvider'])
def inpaint_lama(rgb, hole):
    H, W = hole.shape
    x = cv2.resize(rgb, (512, 512), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.
    m = (cv2.resize(hole.astype(np.uint8) * 255, (512, 512), interpolation=cv2.INTER_NEAREST) > 0).astype(np.float32)
    out = lama.run(None, {'image': x.transpose(2, 0, 1)[None], 'mask': m[None, None]})[0][0].transpose(1, 2, 0)
    if out.max() <= 1.5: out = out * 255.
    return cv2.resize(np.clip(out, 0, 255).astype(np.uint8), (W, H), interpolation=cv2.INTER_CUBIC)
k3 = np.ones((3, 3), np.uint8)
for name, pic in [('illustration', 'nitish-desk-illustration.webp'), ('desk', 'nitish-desk.webp')]:
    rgb = np.asarray(Image.open(A + pic).convert('RGB')); H, W = rgb.shape[:2]
    L = np.asarray(Image.open(OUT + f'{name}-layers.png')).astype(np.float32) / 255.
    gone = cv2.dilate(((L[..., 1] > .02) | (L[..., 0] > .02)).astype(np.uint8), k3, iterations=int(W * .008))
    filled = inpaint_lama(rgb, gone)
    soft = cv2.GaussianBlur(gone.astype(np.float32), (0, 0), 1.5)[..., None]
    plate = (rgb * (1 - soft) + filled * soft).astype(np.uint8)
    Image.fromarray(plate).save(OUT + f'{name}-plate.webp', quality=92)
    # what is behind him alone (the desk going on under his hands, the pole behind his shoulder): the near things' own
    # layer is carried under him from this, so a gap opening at his edge shows the desk, not the wall
    hole = cv2.dilate((L[..., 1] > .02).astype(np.uint8), k3, iterations=4)
    Image.fromarray(inpaint_lama(rgb, hole)).save(f'{name}-behind.png')
    print(name, 'plate', flush=True)
