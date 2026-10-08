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
   - `drop` removes top-level layers (by a test on name/type) before playing, and `viewBox` crops the canvas to a region
     ("x y w h", in the file's own pixels) — so a hosted file can be trimmed without editing it. Image assets of dropped
     layers are removed too (a .lottie's images aren't reachable by path once unzipped). */
const player = () => import('lottie-web/build/player/lottie_light').then(m => m.default);

async function animationData(src: string): Promise<unknown> {
  const res = await fetch(src); if (!res.ok) throw new Error(`Lottie ${res.status}: ${src}`);
  if (!/\.lottie(\?|$)/.test(src)) return res.json();
  const { unzipSync, strFromU8 } = await import('fflate');
  const files = unzipSync(new Uint8Array(await res.arrayBuffer()));
  const manifest = files['manifest.json'] ? JSON.parse(strFromU8(files['manifest.json'])) : null;
  const id: string | undefined = manifest?.animations?.[0]?.id;
  const path = (id && files[`animations/${id}.json`]) ? `animations/${id}.json` : Object.keys(files).find(f => f.startsWith('animations/') && f.endsWith('.json'));
  if (!path) throw new Error(`Lottie: no animation in ${src}`);
  return JSON.parse(strFromU8(files[path]));
}

type Layer = { nm?: string; ty?: number; refId?: string };
type Anim = { layers: Layer[]; assets?: { id: string; p?: string }[] };

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
