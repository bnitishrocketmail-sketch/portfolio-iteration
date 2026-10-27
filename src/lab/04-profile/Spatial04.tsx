import { useEffect, useRef, useState, type RefObject } from 'react';

/* The intro picture as a spatial scene (Nitish, 23 Oct: "the iOS effect where tilting the phone moves the background and
   the foreground, a little 3D look"). It is Apple's Spatial Scenes (iOS 26): a depth map estimated from one photo, the
   subject held still while what is behind it shifts with the phone's tilt. Drawn by WebGL from layers made offline
   (public/depth, the scripts in LOG p147): depth by Depth Anything V2 (base, ONNX) at the pictures' own size; him from
   his cutout (made solid inside, its stray specks dropped); the near things (the bar, the camera, the pole, the desk)
   found on the depth and snapped to the picture's edges; the wall with both painted out by LaMa; his and their colours
   with the wall taken out of their edge pixels. Behind him the wall drifts with the pointer (or the tilt), the near
   things move against it, he stays put — each near thing moving as one rigid piece (a plane fitted to its depth), and his
   face too, so his nose no longer stretches (p151; the rest of him by his own smooth depth, as p147 built it). Subtle, like iOS, or pronounced (2.5×).
   The picture and his cutout (which lies over the cards behind him) are drawn by the same shader and the same offset,
   so they stay in register. Off under reduced motion or without WebGL: the plain images. */

export type Tilt = { x: number; y: number; tx: number; ty: number; frame: number };
const K = .024; /* the offset at full tilt, in the picture's width: a pixel half a depth-unit from the subject moves 1.2% */
/* the two strengths (23 Oct): subtle, like iOS; pronounced, clearly felt — 2.5 times, about 3% at most */
export const DEPTH_K = { subtle: K, pronounced: K * 2.5 } as const;
const FOCUS = .55; /* the subject's depth (him, ~.51–.57 in the maps), where nothing moves */

/* the pointer over the picture (or the phone's tilt) as a smoothed offset, -1…1 on each axis */
export function useTilt(area: RefObject<HTMLElement | null>, on: boolean) {
  const t = useRef<Tilt>({ x: 0, y: 0, tx: 0, ty: 0, frame: 0 });
  useEffect(() => {
    const el = area.current; if (!el || !on) return;
    const move = (e: PointerEvent) => { if (e.pointerType === 'touch') return; const r = el.getBoundingClientRect(); t.current.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - .5) * 2)); t.current.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - .5) * 2)); };
    const leave = () => { t.current.tx = 0; t.current.ty = 0; };
    /* the phone (24 Oct, Nitish: "the pronounced effect, working with my phone's gyro"): its tilt — turning it left or
       right (gamma), tipping its top toward or away (beta), turned with the screen if it is held sideways — from a
       resting position that slowly follows how it is held (a 3 s lag), as iOS's parallax does: a tilt moves the scene,
       holding still lets it settle back. ±16° is full. A jump of more than 60° (a wrap past upright) resets the rest.
       iPhones ask for motion access once, on the first tap on the intro (a tap, or a click, is what iOS accepts) */
    let base: { b: number; g: number } | null = null, last = 0;
    const orient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      const now = performance.now(), dt = last ? Math.min(.2, (now - last) / 1000) : 0; last = now;
      if (!base || Math.abs(e.beta - base.b) > 60 || Math.abs(e.gamma - base.g) > 60) base = { b: e.beta, g: e.gamma };
      const f = 1 - Math.exp(-dt / 3); base.b += (e.beta - base.b) * f; base.g += (e.gamma - base.g) * f;
      let x = (e.gamma - base.g) / 16, y = (e.beta - base.b) / 16;
      const ang = ((screen.orientation?.angle ?? 0) + 360) % 360; /* sideways: the screen's axes are the device's turned */
      if (ang === 90) [x, y] = [y, -x]; else if (ang === 270) [x, y] = [-y, x]; else if (ang === 180) [x, y] = [-x, -y];
      t.current.tx = Math.max(-1, Math.min(1, x)); t.current.ty = Math.max(-1, Math.min(1, y));
    };
    const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
    const ask = () => { el.removeEventListener('touchend', ask); el.removeEventListener('click', ask); DOE?.requestPermission?.().then(s => { if (s === 'granted') addEventListener('deviceorientation', orient); }).catch(() => {}); };
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
    if (DOE?.requestPermission) { el.addEventListener('touchend', ask); el.addEventListener('click', ask); } else addEventListener('deviceorientation', orient);
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => { const s = t.current, k = 1 - Math.exp(-(now - prev) / 190); prev = now; s.x += (s.tx - s.x) * k; s.y += (s.ty - s.y) * k; s.frame++; raf = requestAnimationFrame(tick); }; /* eased by time (~.08 a frame at 60fps), so a slow frame rate settles as soon */
    raf = requestAnimationFrame(tick);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); el.removeEventListener('touchend', ask); el.removeEventListener('click', ask); removeEventListener('deviceorientation', orient); cancelAnimationFrame(raf); t.current = { x: 0, y: 0, tx: 0, ty: 0, frame: 0 }; };
  }, [area, on]);
  return t;
}

const VS = `attribute vec2 p; varying vec2 v; void main(){ v = p * .5 + .5; v.y = 1. - v.y; gl_Position = vec4(p, 0., 1.); }`;
/* object-fit: cover, anchored at the bottom (the picture's own rule). Third pass (23 Oct, "seamlessly and flawlessly
   accurate"): the scene as three layers, each moved by its own smooth depth and cut by its own mask, so an edge is
   always exactly the mask's edge — the second pass searched one depth map per pixel, and wherever the map's steps and the
   picture's edges disagreed by a pixel, slivers of the wall were dragged along with the camera (the "spilling").
   The layers: the wall (the plate — the picture with him and the near things painted out by LaMa; its depth a broad,
   smooth surface, so the ring light moves as one with the wall), him (his cutout's alpha), the near things (the bar, the
   camera, the pole, the desk). Each layer's depth is carried smoothly past its outline, so a source pixel s moves to
   s + off·(d(s) − focus) and the pixel landing on uv is found by a fixed-point walk, s = uv + off·(focus − d(s)), which
   converges in a few steps because the fields are smooth. Their colours come from the foreground texture, with the wall
   taken out of their edge pixels (ML foreground estimation), so an edge carries no rim of the wall when it moves.
   He is drawn over the near things (the camera and the bar never meet him; his hands lie on the desk, his shoulder in
   front of the pole), and their layer is carried on under him from the picture with him painted out, so a gap opening at
   his edge shows the desk going on behind his hands, not the wall. */
const FS = `precision highp float; varying vec2 v; uniform sampler2D img, dep, plate, lay, fgc, fgn; uniform vec2 box, off; uniform float focus, mode;
vec2 at(vec2 uv, vec3 ch){ vec2 s = uv; for (int i = 0; i < 6; i++) s = uv + off * (focus - dot(texture2D(dep, clamp(s, 0., 1.)).rgb, ch)); return clamp(s, 0., 1.); }
void main(){
  vec2 uv = (v - vec2(.5, 1.)) / box + vec2(.5, 1.);
  /* the edges: a layer moved inward would show past the picture's edge (smeared edge pixels), so the view closes in
     just enough as it moves — nothing at rest, about 6% at the pronounced setting's corners. The most any layer moves
     is .48 of the offset (the wall and the desk); the slack the crop already leaves at the sides is counted. */
  vec2 hs = .5 / box, c = vec2(.5, 1. - hs.y), m = .48 * abs(off);
  float f = 1. - max(max(m.x - (.5 - hs.x), 0.) / hs.x, m.y / hs.y);
  uv = c + (uv - c) * f;
  vec2 sh = at(uv, vec3(0., 0., 1.));
  if (mode < .5) { gl_FragColor = texture2D(img, sh); return; } /* a cutout without layers: as it is */
  float ah = texture2D(lay, sh).g;
  if (mode > 1.5) { gl_FragColor = vec4(texture2D(fgc, sh).rgb * ah, ah); return; } /* the cutout over the cards: exactly his layer of the scene below it */
  vec2 sb = at(uv, vec3(1., 0., 0.)), sn = at(uv, vec3(0., 1., 0.));
  vec3 col = texture2D(plate, sb).rgb;
  col = mix(col, texture2D(fgn, sn).rgb, texture2D(lay, sn).b); /* the near things, carried under him */
  col = mix(col, texture2D(fgc, sh).rgb, ah); /* him, on top */
  gl_FragColor = vec4(col, 1.);
}`;

/* the milestone (Nitish, 23 Oct: "keep the first pronounced build as a milestone I can select and make the default — nothing
   after it in that version"): p147 as it shipped — this shader text, its strengths and focus, and its files frozen in
   public/depth/v147 (copied from commit 4cf892d). Later changes go to FS and /depth only, never here. */
export const V147 = { fs: `precision highp float; varying vec2 v; uniform sampler2D img, dep, plate, lay, fgc, fgn; uniform vec2 box, off; uniform float focus, mode;
vec2 at(vec2 uv, vec3 ch){ vec2 s = uv; for (int i = 0; i < 6; i++) s = uv + off * (focus - dot(texture2D(dep, clamp(s, 0., 1.)).rgb, ch)); return clamp(s, 0., 1.); }
void main(){
  vec2 uv = (v - vec2(.5, 1.)) / box + vec2(.5, 1.);
  /* the edges: a layer moved inward would show past the picture's edge (smeared edge pixels), so the view closes in
     just enough as it moves — nothing at rest, about 6% at the pronounced setting's corners. The most any layer moves
     is .48 of the offset (the wall and the desk); the slack the crop already leaves at the sides is counted. */
  vec2 hs = .5 / box, c = vec2(.5, 1. - hs.y), m = .48 * abs(off);
  float f = 1. - max(max(m.x - (.5 - hs.x), 0.) / hs.x, m.y / hs.y);
  uv = c + (uv - c) * f;
  vec2 sh = at(uv, vec3(0., 0., 1.));
  if (mode < .5) { gl_FragColor = texture2D(img, sh); return; } /* a cutout without layers: as it is */
  float ah = texture2D(lay, sh).g;
  if (mode > 1.5) { gl_FragColor = vec4(texture2D(fgc, sh).rgb * ah, ah); return; } /* the cutout over the cards: exactly his layer of the scene below it */
  vec2 sb = at(uv, vec3(1., 0., 0.)), sn = at(uv, vec3(0., 1., 0.));
  vec3 col = texture2D(plate, sb).rgb;
  col = mix(col, texture2D(fgn, sn).rgb, texture2D(lay, sn).b); /* the near things, carried under him */
  col = mix(col, texture2D(fgc, sh).rgb, ah); /* him, on top */
  gl_FragColor = vec4(col, 1.);
}`, k: { subtle: .024, pronounced: .06 }, focus: .55, dir: '/depth/v147/' } as const;


/* one picture drawn with the warp; `tilt` is shared, so the picture and the cutout move as one */
/* the scene's pictures, loaded once and kept (the picture, its depth map and layers: six files), so a return to the tab
   uploads them without fetching and decoding again; a failed load is not kept */
const imageCache = new Map<string, Promise<HTMLImageElement>>();
function loadImage(u: string): Promise<HTMLImageElement> {
  let p = imageCache.get(u);
  if (!p) { p = new Promise<HTMLImageElement>((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = u; }); p.catch(() => imageCache.delete(u)); imageCache.set(u, p); }
  return p;
}
export function DepthImg({ src, depth, plate, layers, fg, fgn, tilt, className, alt, k = K, fs = FS, focus = FOCUS }: { src: string; depth: string; plate?: string; layers?: string; fg?: string; fgn?: string; fs?: string; focus?: number; tilt: RefObject<Tilt>; className: string; alt: string; k?: number }) {
  const cv = useRef<HTMLCanvasElement>(null);
  /* the still under the canvas until the textures are up (27 Oct, Nitish: coming back to the home tab "the center image
     takes a bit of time to load… a few milliseconds"): the canvas is clear until its pictures are loaded and uploaded,
     which on a return to the tab is a few frames of nothing; the plain picture, which the browser has, shows at once in
     its place and goes when the canvas draws (the cut-out of him too — its warped copy would double it otherwise) */
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const c = cv.current; if (!c) return;
    setReady(false);
    const gl = c.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false }); if (!gl) return;
    const sh = (type: number, s: string) => { const o = gl.createShader(type)!; gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram()!; gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    const tex = (unit: number, im: HTMLImageElement) => /* layer masks must not be premultiplied (alpha is 1 there anyway) */ { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(w => gl.texParameteri(gl.TEXTURE_2D, w, gl.CLAMP_TO_EDGE)); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); };
    const load = loadImage; /* the pictures kept for the session (27 Oct): a return to the home tab decoded them all again */
    let raf = 0, ready = false, iw = 1, ih = 1, last = '';
    const uBox = gl.getUniformLocation(pr, 'box'), uOff = gl.getUniformLocation(pr, 'off');
    gl.uniform1i(gl.getUniformLocation(pr, 'img'), 0); gl.uniform1i(gl.getUniformLocation(pr, 'dep'), 1); gl.uniform1i(gl.getUniformLocation(pr, 'plate'), 2); gl.uniform1i(gl.getUniformLocation(pr, 'lay'), 3); gl.uniform1i(gl.getUniformLocation(pr, 'fgc'), 4); gl.uniform1i(gl.getUniformLocation(pr, 'fgn'), 5); gl.uniform1f(gl.getUniformLocation(pr, 'mode'), layers && fg ? (plate && fgn ? 1 : 2) : 0); gl.uniform1f(gl.getUniformLocation(pr, 'focus'), focus);
    const size = () => { const r = c.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); c.width = Math.max(1, Math.round(r.width * dpr)); c.height = Math.max(1, Math.round(r.height * dpr)); last = ''; };
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!ready) return;
      const t = tilt.current, W = c.width, H = c.height;
      const key = `${W}x${H}:${k}:${t.x.toFixed(4)}:${t.y.toFixed(4)}`; if (key === last) return; last = key; /* draw only on change */
      const s = Math.max(W / iw, H / ih); /* cover: the picture's displayed size against the canvas */
      gl.viewport(0, 0, W, H); gl.uniform2f(uBox, (iw * s) / W, (ih * s) / H);
      gl.uniform2f(uOff, t.x * k, t.y * k * (iw / ih) * .6); /* up and down a little less than side to side */
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    Promise.all([load(src), load(depth), layers && fg ? load(layers) : null, layers && fg ? load(fg) : null, plate && layers && fg && fgn ? load(plate) : null, plate && layers && fg && fgn ? load(fgn) : null]).then(([a, b, e, f, c, n]) => { iw = a.naturalWidth; ih = a.naturalHeight; tex(0, a); tex(1, b); if (e && f) { tex(3, e); tex(4, f); } if (c && n) { tex(2, c); tex(5, n); } ready = true; setReady(true); }).catch(() => {});
    size(); const ro = new ResizeObserver(size); ro.observe(c); raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); gl.getExtension('WEBGL_lose_context')?.loseContext(); };
  }, [src, depth, plate, layers, fg, fgn, tilt, k, fs, focus]);
  return <>
    {!ready && <img className={className} src={src} alt="" aria-hidden="true" draggable={false} />}
    <canvas ref={cv} className={className} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true} />
  </>;
}
