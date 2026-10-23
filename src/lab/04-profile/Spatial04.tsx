import { useEffect, useRef, type RefObject } from 'react';

/* The intro picture as a spatial scene (Nitish, 23 Oct: "the iOS effect where tilting the phone moves the background and
   the foreground, a little 3D look"). It is Apple's Spatial Scenes (iOS 26): a depth map estimated from one photo, the
   subject held still while what is behind it shifts with the phone's tilt. Version 1 here is the depth-map warp he chose:
   the picture is drawn by WebGL, every pixel moved by how far it is from the subject's depth — behind him it drifts with
   the pointer (or the tilt), in front of him (the camera, the ring light, his hands) against it, he stays put. The depth
   maps were estimated from the pictures by Depth Anything V2 (base, ONNX) and grown a little round near edges then
   softened (public/depth), so the warp stretches rather than tears. Subtle, like iOS: about 1% of the width at most.
   The picture and his cutout (which lies over the cards behind him) are warped by the same map and the same offset, so
   they stay in register. Off under reduced motion or without WebGL: the plain images. */

export type Tilt = { x: number; y: number; tx: number; ty: number; frame: number };
const K = .024; /* the offset at full tilt, in the picture's width: a pixel half a depth-unit from the subject moves 1.2% */
const FOCUS = .55; /* the subject's depth (him), where nothing moves */

/* the pointer over the picture (or the phone's tilt) as a smoothed offset, -1…1 on each axis */
export function useTilt(area: RefObject<HTMLElement | null>, on: boolean) {
  const t = useRef<Tilt>({ x: 0, y: 0, tx: 0, ty: 0, frame: 0 });
  useEffect(() => {
    const el = area.current; if (!el || !on) return;
    const move = (e: PointerEvent) => { if (e.pointerType === 'touch') return; const r = el.getBoundingClientRect(); t.current.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - .5) * 2)); t.current.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - .5) * 2)); };
    const leave = () => { t.current.tx = 0; t.current.ty = 0; };
    /* the phone: its tilt from where it was first held, ±20° to full; iPhones ask once, on the first touch of the picture */
    let base: { b: number; g: number } | null = null;
    const orient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      if (!base) base = { b: e.beta, g: e.gamma };
      t.current.tx = Math.max(-1, Math.min(1, (e.gamma - base.g) / 20)); t.current.ty = Math.max(-1, Math.min(1, (e.beta - base.b) / 20));
    };
    const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
    const ask = () => { DOE?.requestPermission?.().then(s => { if (s === 'granted') addEventListener('deviceorientation', orient); }).catch(() => {}); };
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
    if (DOE?.requestPermission) el.addEventListener('touchend', ask, { once: true }); else addEventListener('deviceorientation', orient);
    let raf = 0;
    const tick = () => { const s = t.current; s.x += (s.tx - s.x) * .08; s.y += (s.ty - s.y) * .08; s.frame++; raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); el.removeEventListener('touchend', ask); removeEventListener('deviceorientation', orient); cancelAnimationFrame(raf); t.current = { x: 0, y: 0, tx: 0, ty: 0, frame: 0 }; };
  }, [area, on]);
  return t;
}

const VS = `attribute vec2 p; varying vec2 v; void main(){ v = p * .5 + .5; v.y = 1. - v.y; gl_Position = vec4(p, 0., 1.); }`;
/* object-fit: cover, anchored at the bottom (the picture's own rule), then each pixel taken from where its depth says */
const FS = `precision mediump float; varying vec2 v; uniform sampler2D img, dep; uniform vec2 box, off; uniform float focus;
void main(){
  vec2 uv = (v - vec2(.5, 1.)) / box + vec2(.5, 1.);
  float d = texture2D(dep, uv).r;
  vec2 q = uv + off * (d - focus);
  gl_FragColor = texture2D(img, clamp(q, 0., 1.));
}`;

/* one picture drawn with the warp; `tilt` is shared, so the picture and the cutout move as one */
export function DepthImg({ src, depth, tilt, className, alt }: { src: string; depth: string; tilt: RefObject<Tilt>; className: string; alt: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cv.current; if (!c) return;
    const gl = c.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false }); if (!gl) return;
    const sh = (type: number, s: string) => { const o = gl.createShader(type)!; gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram()!; gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    const tex = (unit: number, im: HTMLImageElement) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(w => gl.texParameteri(gl.TEXTURE_2D, w, gl.CLAMP_TO_EDGE)); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); };
    const load = (u: string) => new Promise<HTMLImageElement>((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = u; });
    let raf = 0, ready = false, iw = 1, ih = 1, last = '';
    const uBox = gl.getUniformLocation(pr, 'box'), uOff = gl.getUniformLocation(pr, 'off');
    gl.uniform1i(gl.getUniformLocation(pr, 'img'), 0); gl.uniform1i(gl.getUniformLocation(pr, 'dep'), 1); gl.uniform1f(gl.getUniformLocation(pr, 'focus'), FOCUS);
    const size = () => { const r = c.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); c.width = Math.max(1, Math.round(r.width * dpr)); c.height = Math.max(1, Math.round(r.height * dpr)); last = ''; };
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!ready) return;
      const t = tilt.current, W = c.width, H = c.height;
      const key = `${W}x${H}:${t.x.toFixed(4)}:${t.y.toFixed(4)}`; if (key === last) return; last = key; /* draw only on change */
      const s = Math.max(W / iw, H / ih); /* cover: the picture's displayed size against the canvas */
      gl.viewport(0, 0, W, H); gl.uniform2f(uBox, (iw * s) / W, (ih * s) / H);
      gl.uniform2f(uOff, t.x * K, t.y * K * (iw / ih) * .6); /* up and down a little less than side to side */
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    Promise.all([load(src), load(depth)]).then(([a, b]) => { iw = a.naturalWidth; ih = a.naturalHeight; tex(0, a); tex(1, b); ready = true; }).catch(() => {});
    size(); const ro = new ResizeObserver(size); ro.observe(c); raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); gl.getExtension('WEBGL_lose_context')?.loseContext(); };
  }, [src, depth, tilt]);
  return <canvas ref={cv} className={className} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true} />;
}
