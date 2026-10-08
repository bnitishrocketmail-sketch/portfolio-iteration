import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import type { AnimationItem } from 'lottie-web';

/* A Lottie, from a hosted link (lottie.host) or a local JSON URL.
   - A `.lottie` link is a zipped package (manifest + animations/*.json): it's fetched, unzipped in the browser and the
     manifest's first animation is played. lottie.host serves these with open CORS and its own CDN caching.
   - Played with lottie-web's light SVG build (no effects, no expressions engine): Nitish's files are plain shapes —
     the B assistant's glow is a shape, not a blur effect. If a future file needs effects, switch to the 'lottie_svg' build.
   - The player and the unzipper load as their own chunk after the page paints.
   - Under reduced motion it holds at `still` (a frame) instead of playing. */
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

export function Lottie({ src, className, loop = true, speed = 1, still = 0, label }: {
  src: string; className?: string; loop?: boolean; speed?: number; still?: number; label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let anim: AnimationItem | undefined, gone = false;
    Promise.all([player(), animationData(src)]).then(([lottie, data]) => {
      if (gone) return;
      anim = lottie.loadAnimation({ container: el, renderer: 'svg', loop, autoplay: !reduce, animationData: data,
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: true } });
      anim.setSpeed(speed);
      if (reduce) anim.addEventListener('DOMLoaded', () => anim?.goToAndStop(still, true));
    }).catch(err => console.warn(err)); /* a failed load leaves the card's label in place */
    return () => { gone = true; anim?.destroy(); };
  }, [src, loop, speed, still, reduce]);
  return <div ref={ref} className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} />;
}
