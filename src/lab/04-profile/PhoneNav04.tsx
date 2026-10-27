import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import type { ViewName } from '../../lib/data';
import { NavIcon } from './NavIcons04';

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
   24 Oct (Nitish: "fix the bottom navigation with the new changes"): the bar takes the desktop column's system — the
   nav's light grey, its dark ink, the highlighter's dark pill with light ink on the selected tab. 27 Oct: the desktop's
   icons, Home the house (his photo was Home before). */

type Item = { id: ViewName; label: string };
/* the icons (27 Oct, Nitish: "these new icons… adapting them the same way on phone as well… just replacing those icons"):
   the desktop bar's Heroicons (NavIcons04), solid, Home the house — in place of the outline/fill placeholders and his
   photo. The selection is the phone's own: the stretching pill */

const LEAD = { type: 'spring', stiffness: 560, damping: 42, mass: 1 } as const;   // the edge heading for the target
const TRAIL = { type: 'spring', stiffness: 240, damping: 30, mass: 1 } as const;  // the edge leaving the old icon, behind it

export default function PhoneNav04({ items, tab, go }: { items: Item[]; tab: ViewName; go: (v: ViewName) => void }) {
  const reduce = useReducedMotion();
  const ul = useRef<HTMLUListElement>(null);
  const [box, setBox] = useState<Record<string, { left: number; width: number }> | null>(null);
  useLayoutEffect(() => {
    const el = ul.current; if (!el) return;
    const measure = () => {
      /* the pill a perfect circle at rest (24 Oct, Nitish: "the selection pill a perfect ellipse"): as wide as it is tall (the
         bar less its inset above and below), centred on its tab; it still stretches between two tabs as it moves */
      const u = el.getBoundingClientRect(), cs = getComputedStyle(el), d = el.clientHeight - 2 * (parseFloat(cs.getPropertyValue('--inset')) || 10);
      const b: Record<string, { left: number; width: number }> = {}; el.querySelectorAll<HTMLElement>('li[data-id] button').forEach(bt => { const r = bt.getBoundingClientRect(); b[bt.closest('li')!.dataset.id!] = { left: r.left - u.left + (r.width - d) / 2, width: d }; }); setBox(b);
    };
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
                <NavIcon id={it.id} className="pn4-ico" />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
