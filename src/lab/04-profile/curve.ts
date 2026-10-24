/* the system's corner curve (moved out of Iteration04.tsx, 24 Oct, for the case page's head too) */
/* a corner on the system's curve, for a drawn clip path (24 Oct, Nitish: "the curve is not the standard one"): the
   corner from the line coming in along d1 to the line going out along d2, meeting at V, as CSS draws a corner with
   corner-shape superellipse(K) — |x|^n + |y|^n = 1 with n = 2^K (K 1.6 for the iOS curve, 1 for round) — over a radius
   R (the base radius × --ios-k, as every radius in the system); sampled finely, as line segments */
export type P2 = [number, number];
export function sCorner(V: P2, d1: P2, d2: P2, R: number, K: number, steps = 14) {
  const n = 2 ** K, C: P2 = [V[0] - R * d1[0] + R * d2[0], V[1] - R * d1[1] + R * d2[1]], out: string[] = [];
  for (let i = 0; i <= steps; i++) { const t = (i / steps) * Math.PI / 2, a = Math.cos(t) ** (2 / n), b = Math.sin(t) ** (2 / n); out.push(`${(C[0] + R * (-a * d2[0] + b * d1[0])).toFixed(2)} ${(C[1] + R * (-a * d2[1] + b * d1[1])).toFixed(2)}`); }
  return 'L ' + out.join(' L ');
}
/* the system's curve as the page has it now: the radius factor and the superellipse's K (iOS corners on), or round */
export function sysCurve(el: Element) { const cs = getComputedStyle(el), k = parseFloat(cs.getPropertyValue('--ios-k')) || 1, m = cs.getPropertyValue('--ios-shape').match(/superellipse\(([\d.]+)\)/); return { k, K: m ? parseFloat(m[1]) : 1 }; }
