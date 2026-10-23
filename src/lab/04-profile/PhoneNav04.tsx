import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import type { ViewName } from '../../lib/data';

/* The phone's nav bar (Nitish, 19 Oct, from a screen recording of Instagram's bar: "create the interaction like this
   … the icons, icon states and style, the select state"). What the recording shows, frame by frame (60 fps):
   - a dark pill of a bar (about 6.3 : 1), the icons white and outlined, the selected one filled, on a lighter pill
     two-thirds of the bar's height;
   - on a tap the icons swap at once — the old one goes outline, the new one goes filled — before the pill moves;
   - the pill stretches toward the tapped icon: its leading edge leaves first and its trailing edge follows, so for
     ~100 ms it covers both icons, then it settles on the new one (~270 ms in all);
   - the bar is the same wherever it sits; it fades with the screen behind it.
   Here: the two edges of the pill are two springs — the near edge quick, the far edge a little behind it — which
   gives the stretch and the settle; the icons swap on the tap with no transition. Reduced motion: no stretch, the pill
   just appears on the new icon. Icon drawings are placeholders in the recording's line weight (his own to come).
   24 Oct (Nitish: "fix the bottom navigation with the new changes; the profile picture for Home, not the signature"):
   the bar takes the desktop column's system — the nav's light grey, its dark ink, the highlighter's dark pill with
   light ink on the selected tab — and Home is his photo, as on the desktop: selected, it shrinks a little inside the
   dark pill, so the pill rings it. */

type Item = { id: ViewName; label: string };
/* each icon: an outline (stroked) and a filled version, on a 24 box */
const ICON: Record<string, { line: React.ReactNode; fill: React.ReactNode }> = {
  home: {
    line: <><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20.5c.6-4 3.6-6 7.5-6s6.9 2 7.5 6" /></>,
    fill: <><circle cx="12" cy="8" r="4.2" /><path d="M3.8 21c.7-4.6 4-7 8.2-7s7.5 2.4 8.2 7z" /></>,
  },
  projects: {
    line: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M3.5 9.5h17M9 9.5v10" /></>,
    fill: <><path d="M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2H3z" /><path d="M3 10.5h5V20H6a3 3 0 0 1-3-3zM9.5 10.5H21V17a3 3 0 0 1-3 3H9.5z" /></>,
  },
  workflow: {
    line: <><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="12" cy="18" r="2.5" /><path d="M8 7.3 10.5 16M16 7.3 13.5 16M8.5 6h7" /></>,
    fill: <><path d="M6 6h12M6.8 7.6 11 15.2M17.2 7.6 13 15.2" className="k" /><circle cx="6" cy="6" r="3.2" /><circle cx="18" cy="6" r="3.2" /><circle cx="12" cy="18" r="3.2" /></>,
  },
  motion: {
    line: <><path d="M3.5 16.5c3-9 6-9 8.5 0s5.5 9 8.5 0" /></>,
    fill: <><path d="M3.5 16.5c3-9 6-9 8.5 0s5.5 9 8.5 0" className="k w" /></>,
  },
  lab: {
    line: <><path d="M9.5 3.5h5M10.5 3.5v6L5 19.5h14l-5.5-10v-6" /><path d="M7.5 15h9" /></>,
    fill: <><path d="M9 3h6v1.6h-1.2v5.2l5.9 10.4A1 1 0 0 1 18.8 21.5H5.2a1 1 0 0 1-.9-1.3l5.9-10.4V4.6H9z" /></>,
  },
  articles: {
    line: <><rect x="4.5" y="3.5" width="15" height="17" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    fill: <><path d="M6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5v-13A2.5 2.5 0 0 1 6.5 3zM8 8v1.6h8V8zm0 4v1.6h8V12zm0 4v1.6h5V16z" /></>,
  },
};

const LEAD = { type: 'spring', stiffness: 560, damping: 42, mass: 1 } as const;   // the edge heading for the target
const TRAIL = { type: 'spring', stiffness: 240, damping: 30, mass: 1 } as const;  // the edge leaving the old icon, behind it

export default function PhoneNav04({ items, tab, go, photo }: { items: Item[]; tab: ViewName; go: (v: ViewName) => void; photo: string }) {
  const reduce = useReducedMotion();
  const ul = useRef<HTMLUListElement>(null);
  const [box, setBox] = useState<Record<string, { left: number; width: number }> | null>(null);
  useLayoutEffect(() => {
    const el = ul.current; if (!el) return;
    const measure = () => { const u = el.getBoundingClientRect(); const b: Record<string, { left: number; width: number }> = {}; el.querySelectorAll<HTMLElement>('li[data-id] button').forEach(bt => { const r = bt.getBoundingClientRect(); b[bt.closest('li')!.dataset.id!] = { left: r.left - u.left, width: r.width }; }); setBox(b); };
    measure(); const ro = new ResizeObserver(measure); ro.observe(el); return () => ro.disconnect();
  }, []);
  /* the pill's two edges are two motion values; on a move the edge nearer the target takes the quick spring and the
     other the slower one, so the pill stretches across and then settles */
  const L = useMotionValue(0), R = useMotionValue(0);
  const width = useTransform([L, R], ([l, r]: number[]) => Math.max(0, r - l));
  const prev = useRef<string | null>(null);
  const b = box?.[tab];
  useEffect(() => {
    if (!b) return;
    const left = b.left, right = b.left + b.width;
    if (prev.current === null || reduce) { L.set(left); R.set(right); prev.current = tab; return; } // first paint, or reduced motion: no stretch
    const toRight = left >= L.get();
    const a1 = animate(L, left, toRight ? TRAIL : LEAD), a2 = animate(R, right, toRight ? LEAD : TRAIL);
    prev.current = tab;
    return () => { a1.stop(); a2.stop(); };
  }, [b?.left, b?.width, tab, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <nav className="pn4" aria-label="Sections">
      <ul ref={ul}>
        {b && <motion.i className="pn4-pill" aria-hidden="true" style={{ left: L, width }} />}
        {items.map(it => {
          const on = it.id === tab;
          return (
            <li key={it.id} data-id={it.id}>
              <button type="button" className={on ? 'on' : ''} aria-current={on ? 'page' : undefined} aria-label={it.label} onClick={() => go(it.id)}>
                {it.id === 'home'
                  ? <span className="pn4-me" aria-hidden="true"><img src={photo} alt="" /></span>
                  : <svg className={`pn4-ico${on ? ' fill' : ''}`} viewBox="0 0 24 24" aria-hidden="true">{on ? ICON[it.id]?.fill : ICON[it.id]?.line}</svg>}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
