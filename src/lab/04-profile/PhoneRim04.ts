import { useEffect, type RefObject } from 'react';

/* the phone's rims following the Light angle (24 Oct, Nitish: "the light angle control isn't affecting the rim light
   angle"). p179 / p184 drew the bar's and the containers' rims with a horizontal gradient, right only for 0°. Now each
   is drawn as the desktop container's is (p149): every part of the edge lit by the way it faces — cos(2 × (facing −
   the light's angle)), clamped, to the power 1.5, so both ends of the light's axis are lit, gone 45° off it — as a
   conic gradient round the box's centre, its stops at the angles (from the centre) of the outline's points: constant
   along each straight edge, swept through each corner in 7.5° steps. Built from the box's own size and corner radius
   (its own px, so a zoomed page draws it the same), again on a resize, on a page change, on the slider. */
const SEL = '.navcol4, .picwrap4, .deck4.rail .pcard4, .off4, .pp4 > :not(.pp4-head)';

export function rimConic(W: number, H: number, R: number, la: number) {
  R = Math.max(0, Math.min(R, W / 2, H / 2));
  const f = (th: number) => { const c = Math.cos(2 * ((th - la) * Math.PI) / 180); return c > 0 ? c ** 1.5 : 0; };
  const pts: { g: number; v: number }[] = [];
  const corners: [number, number, number][] = [[W / 2 - R, -H / 2 + R, 0], [W / 2 - R, H / 2 - R, 90], [-W / 2 + R, H / 2 - R, 180], [-W / 2 + R, -H / 2 + R, 270]];
  for (const [cx, cy, th0] of corners) for (let s = 0; s <= 90; s += 7.5) {
    const th = th0 + s, x = cx + R * Math.sin((th * Math.PI) / 180), y = cy - R * Math.cos((th * Math.PI) / 180);
    let g = (Math.atan2(x, -y) * 180) / Math.PI; if (g < 0) g += 360; if (th0 === 0 && s === 0) g = Math.min(g, 359.99);
    pts.push({ g, v: f(th) });
  }
  pts.sort((a, b) => a.g - b.g);
  const st = [{ g: 0, v: f(0) }, ...pts, { g: 360, v: f(0) }].map(p => `rgb(255 255 255 / calc(var(--rim-a) * ${p.v.toFixed(3)})) ${p.g.toFixed(2)}deg`);
  return `conic-gradient(from 0deg, ${st.join(', ')})`;
}

export function usePhoneRims(root: RefObject<HTMLElement | null>, deg: number) {
  useEffect(() => {
    const el = root.current; if (!el) return;
    const q = matchMedia('(max-width: 700px)');
    const seen = new Set<HTMLElement>();
    const paint = (b: HTMLElement) => { if (!q.matches) { b.style.removeProperty('--rim-img'); return; } const W = b.offsetWidth, H = b.offsetHeight; if (!W || !H) return; const R = parseFloat(getComputedStyle(b).borderTopLeftRadius) || 0; b.style.setProperty('--rim-img', rimConic(W, H, R, deg)); };
    const ro = new ResizeObserver(es => es.forEach(e => paint(e.target as HTMLElement)));
    const scan = () => el.querySelectorAll<HTMLElement>(SEL).forEach(b => { if (!seen.has(b)) { seen.add(b); ro.observe(b); } paint(b); });
    scan(); const mo = new MutationObserver(scan); mo.observe(el, { childList: true, subtree: true });
    q.addEventListener('change', scan);
    return () => { ro.disconnect(); mo.disconnect(); q.removeEventListener('change', scan); seen.forEach(b => b.style.removeProperty('--rim-img')); };
  }, [root, deg]);
}
