import numpy as np, onnxruntime as ort, cv2
from PIL import Image
A = '/home/claude/portfolio-iteration/src/assets/'
dep = ort.InferenceSession('model.onnx', providers=['CPUExecutionProvider']); di = dep.get_inputs()[0].name
for name, pic in [('illustration', 'nitish-desk-illustration.webp'), ('desk', 'nitish-desk.webp')]:
    im = Image.open(A + pic).convert('RGB'); W, H = im.size; s = 1022 / max(W, H); w = int(round(W*s/14))*14; h = int(round(H*s/14))*14
    x = (np.asarray(im.resize((w, h), Image.BICUBIC)).astype(np.float32)/255. - [0.485,0.456,0.406]) / [0.229,0.224,0.225]
    d = dep.run(None, {di: x.transpose(2,0,1)[None].astype(np.float32)})[0][0]
    d = cv2.resize(d, (W, H), interpolation=cv2.INTER_CUBIC); d = ((d - d.min()) / (d.max() - d.min())).astype(np.float32)
    np.save(f'{name}-d.npy', d); print(name)
