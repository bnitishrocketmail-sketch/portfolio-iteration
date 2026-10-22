import { useEffect, useRef } from 'react';
import type { AnimationItem } from 'lottie-web';

/* His written title, the Lottie from his old site's contact card (22 Oct): "Product" wipes to "Motion" and back, over
   the script "Designer". Nitish: the first letter of the word should sit on the name's left edge above it — and the P
   of PRODUCT and the M of MOTION are at different places in the file (33.5 and 64 of its 593 width, read off its
   layers), so the drawing shifts left as the wipe runs, by the difference, and back. The wipe's play head travels over
   frames 0–90 and returns over 210–300 (60 fps, 421 frames); the shift follows it with a smooth step. Under reduced
   motion it holds the first frame, PRODUCT, at that word's offset. */
const SRC = '/signature.json'; /* public/signature.json — his, not a project's */
const W = 593, P = 33.5, M = 64;
const ease = (t: number) => t * t * (3 - 2 * t);
const shiftAt = (f: number) => P + (M - P) * (f < 90 ? ease(f / 90) : f < 210 ? 1 : f < 300 ? 1 - ease((f - 210) / 90) : 0);

export default function Signature04({ className, label }: { className?: string; label: string }) {
  const box = useRef<HTMLDivElement>(null), stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const b = box.current, el = stage.current; if (!b || !el) return;
    let anim: AnimationItem | undefined, dead = false;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const place = (f: number) => { b.style.transform = `translateX(${(-shiftAt(f) * b.clientWidth / W).toFixed(2)}px)`; };
    (async () => {
      const [lottie, res] = await Promise.all([import('lottie-web/build/player/lottie_light').then(m => m.default), fetch(SRC)]);
      if (dead || !res.ok) return;
      lottie.setIDPrefix('ll');
      anim = lottie.loadAnimation({ container: el, renderer: 'svg', loop: true, autoplay: !still, animationData: await res.json() });
      anim.addEventListener('enterFrame', () => anim && place(anim.currentFrame));
      if (still) anim.addEventListener('DOMLoaded', () => { anim?.goToAndStop(0, true); place(0); });
    })();
    place(0);
    return () => { dead = true; anim?.destroy(); };
  }, []);
  return <div ref={box} className={className} role="img" aria-label={label}><div ref={stage} className="sig-in" /></div>;
}
