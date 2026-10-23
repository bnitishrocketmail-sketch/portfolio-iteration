import { useLayoutEffect, type RefObject } from 'react';

/* the main container's edge light (p153, profile.css "the edge light"): the rim's brightness along the frame's outline,
   as one conic gradient for .edge4 (--rim).

   The pattern, from his iPhone's widgets at rest: the top edge lit evenly along its whole length, fading out round each
   corner (cos(2φ)^1.5 of the angle φ into the corner's curve, gone at 45°), and the same on the bottom edge. Rotating
   (the slider) slides that pattern along the outline, clockwise — its two lit stretches keep their length and their fades
   wherever they are, so at 90° they lie on the sides and wrap round the corners onto the top and bottom. 180° brings it
   back (the two stretches have swapped). The slider's degrees go evenly along the outline: 180° is half of it.

   A conic gradient is constant along rays from the frame's centre and the rim is a pixel wide, so placing each stop at
   the angle of the outline point it belongs to paints the outline exactly. The corners are taken as circular arcs of the
   frame's radius (the iOS corner bends a little tighter; the light's position on it differs by under a pixel). */
export function rimGradient(W: number, H: number, cr: number, deg: number) {
  cr = Math.max(0, Math.min(cr, W / 2, H / 2));
  const a = W - 2 * cr, b = H - 2 * cr, q = (Math.PI * cr) / 2, L = 2 * a + 2 * b + 4 * q;
  /* the point at distance t along the outline, clockwise from the top edge's middle, relative to the frame's centre */
  const at = (t: number): [number, number] => {
    let u = (((t + a / 2) % L) + L) % L; const x0 = -W / 2, y0 = -H / 2, x1 = W / 2, y1 = H / 2;
    if (u < a) return [x0 + cr + u, y0]; u -= a;
    if (u < q) { const g = u / cr; return [x1 - cr + cr * Math.sin(g), y0 + cr - cr * Math.cos(g)]; } u -= q;
    if (u < b) return [x1, y0 + cr + u]; u -= b;
    if (u < q) { const g = u / cr; return [x1 - cr + cr * Math.cos(g), y1 - cr + cr * Math.sin(g)]; } u -= q;
    if (u < a) return [x1 - cr - u, y1]; u -= a;
    if (u < q) { const g = u / cr; return [x0 + cr - cr * Math.sin(g), y1 - cr + cr * Math.cos(g)]; } u -= q;
    if (u < b) return [x0, y1 - cr - u]; u -= b;
    const g = u / cr; return [x0 + cr - cr * Math.cos(g), y0 + cr - cr * Math.sin(g)];
  };
  const h0 = a / 2, fade = (cr * Math.PI) / 4; /* each stretch: the top edge's half-length lit, then the corner's fade */
  const c1 = ((((deg / 180) * (L / 2)) % L) + L) % L, cs = [c1, (c1 + L / 2) % L];
  const lum = (t: number) => {
    let d = Infinity; for (const c of cs) { const e = Math.abs(t - c) % L; d = Math.min(d, e, L - e); }
    if (d <= h0) return 1; const f = (d - h0) / (cr || 1); return f >= Math.PI / 4 ? 0 : Math.pow(Math.cos(2 * f), 1.5);
  };
  /* sample along the outline (every 2px, and exactly at each stretch's ends and fades' ends); keep the points where the
     light changes, drop the long even runs */
  const ts = new Set<number>(); for (let t = 0; t < L; t += 2) ts.add(t);
  for (const c of cs) for (const k of [-h0 - fade, -h0, h0, h0 + fade]) ts.add((((c + k) % L) + L) % L);
  const pts = [...ts].sort((x, y) => x - y).map(t => { const [x, y] = at(t); let g = (Math.atan2(x, -y) * 180) / Math.PI; if (g < 0) g += 360; if (t === 0) g = 0; return { g, v: lum(t) }; });
  pts.push({ g: 360, v: lum(L) });
  const keep = pts.filter((p, i) => i === 0 || i === pts.length - 1 || p.v !== pts[i - 1].v || p.v !== pts[i + 1].v);
  return `conic-gradient(from 0deg, ${keep.map(p => `rgb(255 255 255 / calc(var(--rim-a) * ${p.v.toFixed(3)})) ${p.g.toFixed(3)}deg`).join(', ')})`;
}

/* set on the layer from the frame's size and corner, again whenever it resizes or the slider moves */
export function useEdgeRim(frame: RefObject<HTMLElement | null>, layer: RefObject<HTMLElement | null>, deg: number, on: boolean) {
  useLayoutEffect(() => {
    const fr = frame.current, ly = layer.current; if (!fr || !ly || !on) return;
    const set = () => { const cr = parseFloat(getComputedStyle(fr).borderTopLeftRadius) || 0; ly.style.setProperty('--rim', rimGradient(fr.offsetWidth, fr.offsetHeight, cr, deg)); };
    set(); const ro = new ResizeObserver(set); ro.observe(fr);
    return () => { ro.disconnect(); ly.style.removeProperty('--rim'); };
  }, [frame, layer, deg, on]);
}
