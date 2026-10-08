import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import type { AnimationItem } from 'lottie-web';

/* A Lottie, played with lottie-web's SVG build (effects included — the B assistant uses Gaussian blur; the light build
   drops effects). The player is loaded on first use as its own chunk, so the page paints before it arrives.
   `src` is the JSON's URL (Vite's `?url` import). Under reduced motion it holds at `still` (a frame) instead of playing. */
const player = () => import('lottie-web/build/player/lottie_svg').then(m => m.default);

export function Lottie({ src, className, loop = true, speed = 1, still = 0, label }: {
  src: string; className?: string; loop?: boolean; speed?: number; still?: number; label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let anim: AnimationItem | undefined, gone = false;
    player().then(lottie => {
      if (gone) return;
      anim = lottie.loadAnimation({ container: el, renderer: 'svg', loop, autoplay: !reduce, path: src,
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: true } });
      anim.setSpeed(speed);
      if (reduce) anim.addEventListener('DOMLoaded', () => anim?.goToAndStop(still, true));
    });
    return () => { gone = true; anim?.destroy(); };
  }, [src, loop, speed, still, reduce]);
  return <div ref={ref} className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} />;
}
