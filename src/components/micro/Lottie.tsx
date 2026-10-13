import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import type { AnimationItem } from 'lottie-web';

/* A Lottie, from a hosted link (lottie.host) or a local JSON URL.
   - A `.lottie` link is a zipped package (manifest + animations/*.json): it's fetched, unzipped in the browser and the
     manifest's first animation is played. lottie.host serves these with open CORS and its own CDN caching.
   - Played with lottie-web's light SVG build (no effects, no expressions engine): Nitish's files are plain shapes —
     the B assistant's glow is a shape, not a blur effect. If a future file needs effects, switch to the 'lottie_svg' build.
   - The player and the unzipper load as their own chunk after the page paints.
   - Under reduced motion it holds at `still` (a frame) instead of playing.
   - A .lottie's image and font files are inlined as data URLs (the renderer cannot reach them by path once the package
     is unzipped in memory); the success-state card's confetti pieces are PNGs, the persuasion card's text uses a packaged
     font. Both package layouts are read: v1 (animations/, images/) and v2 (a/, i/, f/).
   - `drop` removes top-level layers (by a test on name/type) before playing, and `viewBox` crops the canvas to a region
     ("x y w h", in the file's own pixels) — so a hosted file can be trimmed without editing it. Image assets of dropped
     layers are removed too. */
const player = () => import('lottie-web/build/player/lottie_light').then(m => m.default);

async function animationData(src: string): Promise<unknown> {
  const res = await fetch(src); if (!res.ok) throw new Error(`Lottie ${res.status}: ${src}`);
  if (!/\.lottie(\?|$)/.test(src)) return res.json();
  const { unzipSync, strFromU8 } = await import('fflate');
  const files = unzipSync(new Uint8Array(await res.arrayBuffer()));
  const manifest = files['manifest.json'] ? JSON.parse(strFromU8(files['manifest.json'])) : null;
  const id: string | undefined = manifest?.animations?.[0]?.id;
  /* v1 packages keep animations under animations/, v2 (LottieFiles Creator) under a/ — with images under i/ and fonts under f/ */
  const path = [`animations/${id}.json`, `a/${id}.json`].find(f => id && files[f]) ?? Object.keys(files).find(f => /^(animations|a)\/.+\.json$/.test(f));
  if (!path) throw new Error(`Lottie: no animation in ${src}`);
  const anim = JSON.parse(strFromU8(files[path])) as Anim;
  const find = (...names: (string | undefined)[]) => { for (const n of names) { if (!n) continue; const k = n.replace(/^\//, ''); if (files[k]) return files[k]; } return undefined; };
  /* image assets: the package carries them as files; they are inlined as data URLs so the renderer can reach them */
  for (const a of anim.assets ?? []) {
    if (!a.p || a.p.startsWith('data:')) continue;
    const file = find((a.u ?? '') + a.p, 'images/' + a.p, 'i/' + a.p);
    if (!file) continue;
    const ext = a.p.split('.').pop()?.toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : ext === 'svg' ? 'image/svg+xml' : 'image/png';
    a.p = `data:${mime};base64,${toBase64(file)}`; a.u = ''; a.e = 1;
  }
  /* fonts the same way: the player makes an @font-face from fPath when origin is 3 */
  for (const f of anim.fonts?.list ?? []) {
    const file = find(f.fPath, 'f/' + f.fName + '.ttf', 'f/' + f.fName + '.otf', 'fonts/' + f.fName + '.ttf');
    if (!file) continue;
    const ext = (f.fPath ?? '').split('.').pop()?.toLowerCase();
    f.fPath = `data:${ext === 'otf' ? 'font/otf' : ext === 'woff2' ? 'font/woff2' : ext === 'woff' ? 'font/woff' : 'font/ttf'};base64,${toBase64(file)}`; f.origin = 3;
  }
  return anim;
}
function toBase64(bytes: Uint8Array): string {
  let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

type Layer = { nm?: string; ty?: number; refId?: string };
type Anim = { layers: Layer[]; assets?: { id: string; p?: string; u?: string; e?: number }[]; fonts?: { list?: { fName?: string; fPath?: string; origin?: number }[] } };

export function Lottie({ src, className, loop = true, speed = 1, still = 0, label, drop, viewBox }: {
  src: string; className?: string; loop?: boolean; speed?: number; still?: number; label?: string;
  drop?: (layer: Layer) => boolean; viewBox?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let anim: AnimationItem | undefined, gone = false;
    Promise.all([player(), animationData(src)]).then(([lottie, raw]) => {
      if (gone) return;
      const data = raw as Anim;
      if (drop) {
        const dropped = new Set(data.layers.filter(drop).map(l => l.refId).filter(Boolean));
        data.layers = data.layers.filter(l => !drop(l));
        if (data.assets) data.assets = data.assets.filter(a => !(dropped.has(a.id) && a.p));
      }
      anim = lottie.loadAnimation({ container: el, renderer: 'svg', loop, autoplay: !reduce, animationData: data,
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: true, ...(viewBox ? { viewBoxSize: viewBox } : {}) } });
      anim.setSpeed(speed);
      if (reduce) anim.addEventListener('DOMLoaded', () => anim?.goToAndStop(still, true));
    }).catch(err => console.warn(err)); /* a failed load leaves the card's label in place */
    return () => { gone = true; anim?.destroy(); };
  }, [src, loop, speed, still, reduce, drop, viewBox]);
  return <div ref={ref} className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} />;
}
