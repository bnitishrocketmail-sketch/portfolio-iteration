import { createElement, useLayoutEffect, useRef, type RefObject } from 'react';
import { animate } from 'motion/react';

/* a switch's selection as one pill that moves (25 Oct, Nitish: "the switch between the rig and the framework should be
   interactive the same way as the navigation bar — the selection pill moves across … and the same wherever we've used
   a switch like it"): the bar's motion (PhoneNav04) — the pill's two edges two springs, the edge heading for the target
   the quick one and the other the slow, so it stretches across and settles. The pill takes the selected button's own
   ground (read off it, so each switch keeps its colours, and a button with its own — With the system — keeps its own)
   and that button's ground goes clear while the pill is there. Any group of buttons whose selected one is .on or
   aria-selected; it follows the class as the component changes it. */
const LEAD = { type: 'spring', stiffness: 560, damping: 42, mass: 1 } as const;   // the edge heading for the target
const TRAIL = { type: 'spring', stiffness: 240, damping: 30, mass: 1 } as const;  // the edge leaving the old one
export function useSlidePill(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const pill = document.createElement('i'); pill.className = 'seg-pill'; pill.setAttribute('aria-hidden', 'true'); el.append(pill); el.classList.add('slide');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let L = 0, R = 0, first = true, cur: HTMLElement | null = null, stops: (() => void)[] = [];
    const paint = () => { pill.style.left = `${L}px`; pill.style.width = `${Math.max(0, R - L)}px`; };
    const pick = () => el.querySelector<HTMLElement>(':scope > button.on, :scope > button[aria-selected="true"]');
    const update = (instant = false) => {
      const b = pick(); if (!b) { pill.style.opacity = '0'; return; }
      const t0 = b.style.transition; b.style.transition = 'none'; el.classList.remove('slide'); const cs = getComputedStyle(b), bg = cs.backgroundColor, rad = cs.borderRadius; el.classList.add('slide'); void getComputedStyle(b).backgroundColor; b.style.transition = t0; /* its own ground, as styled — read with its transition held (mid-fade it reads clear) */
      pill.style.background = bg; pill.style.borderRadius = rad; pill.style.opacity = '1'; pill.style.top = `${b.offsetTop}px`; pill.style.height = `${b.offsetHeight}px`;
      const l = b.offsetLeft, r = l + b.offsetWidth;
      if (first || instant || reduce.matches) { stops.forEach(s => s()); stops = []; L = l; R = r; paint(); first = false; cur = b; return; }
      if (b === cur && Math.abs(l - L) < .5 && Math.abs(r - R) < .5) return;
      stops.forEach(s => s()); const toRight = l >= L; cur = b;
      const a1 = animate(L, l, { ...(toRight ? TRAIL : LEAD), onUpdate: (v: number) => { L = v; paint(); } });
      const a2 = animate(R, r, { ...(toRight ? LEAD : TRAIL), onUpdate: (v: number) => { R = v; paint(); } });
      stops = [() => a1.stop(), () => a2.stop()];
    };
    update(true);
    const mo = new MutationObserver(ms => { if (ms.some(m => m.target !== el && m.target !== pill)) update(); }); /* the buttons' own changes, not this hook's */
    mo.observe(el, { subtree: true, attributes: true, attributeFilter: ['class', 'aria-selected', 'aria-pressed'] });
    const ro = new ResizeObserver(() => update(true)); ro.observe(el);
    return () => { mo.disconnect(); ro.disconnect(); stops.forEach(s => s()); pill.remove(); el.classList.remove('slide'); };
  }, [ref]);
}
/* the same as a wrapper, for a group that mounts later (a panel opened, a portal) */
export function SlideGroup(props: React.HTMLAttributes<HTMLDivElement>) {
  const r = useRef<HTMLDivElement>(null); useSlidePill(r);
  return createElement('div', { ...props, ref: r });
}
