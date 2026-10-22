import { useEffect, useRef } from 'react';

/* The assistant's mark (Nitish, 22 Oct): a wavy ring that never stops changing shape — three slow waves of different
   counts and speeds added to a circle — with its name in the middle. Drawn as one path, redrawn every frame; held
   still under reduced motion. Dots, or a second ring turning the other way, may follow. */
const N = 96, R = 40;
const outline = (t: number) => {
  let d = '';
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = R * (1 + .07 * Math.sin(3 * a + t * 1.1) + .05 * Math.sin(5 * a - t * .75 + 1) + .03 * Math.sin(8 * a + t * 1.6 + 2));
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
