import { useEffect, useRef } from 'react';

/* The assistant's mark (Nitish, 22 Oct): a ring that never stops changing shape, with its name in the middle. A circle
   leaning into ovals (second pass, his note: "smooth bends, a circle changing into different ovals, not crumbled little
   waves"): the biggest bend is a two-lobed wave turning slowly, so the ring reads as an oval wandering round; a gentler
   three-lobed one turning the other way keeps it from ever being the same oval twice; a faint four-lobed one under
   them. Slow speeds, nothing finer. Drawn as one path, redrawn every frame; held still under reduced motion. */
const N = 128, R = 40;
const outline = (t: number) => {
  let d = '';
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = R * (1 + .11 * Math.sin(2 * a + t * .7) + .055 * Math.sin(3 * a - t * .45 + 1) + .025 * Math.sin(4 * a + t * .3 + 2));
    d += (i ? 'L' : 'M') + (50 + r * Math.cos(a)).toFixed(2) + ' ' + (50 + r * Math.sin(a)).toFixed(2);
  }
  return d + 'Z';
};
export default function Blob4({ label = 'n.ai' }: { label?: string }) {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0; const t0 = performance.now();
    const tick = (now: number) => { el.setAttribute('d', outline((now - t0) / 1000)); if (!still) raf = requestAnimationFrame(tick); };
    tick(t0);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <svg className="blob4" viewBox="0 0 100 100" aria-hidden="true">
      <path ref={ref} d={outline(0)} />
      <text x="50" y="51" textAnchor="middle" dominantBaseline="central">{label}</text>
    </svg>
  );
}
