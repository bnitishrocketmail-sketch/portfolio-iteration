import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { PROJECTS } from '../../lib/data';

/* 04's project page, first iteration (Nitish, 14 Oct), after ref 7: "Projects" at the top-left, a line and the CV at the
   right; below, every project in one row — the selected one open wide, laid out as the reference's wide card (the cover,
   the title and blurb at the top-left, the tags in a panel at the bottom-left, a round arrow at the bottom-right corner),
   the others folded narrow to its right in their order, each with its title, client and year, and tags set vertically at
   its bottom-left (01's card's information, turned). The rules (Nitish, 14 Oct): the cards keep their sequence; the
   selected one opens in place and the one that was open folds — the open card in the theme's light grey with dark text,
   the folded ones in its dark grey with light text (no pictures or colours yet). With the first card open, the two after it show whole
   and the third half, fading under the mask at the right end — three and a half cards in view; so the folded width
   follows from the viewport: open + 2½ folded + 3 gaps = the width. The row stays put for the first two cards; from the
   third, the card two before the open one goes half into the left edge (see `shift`). The
   geometry is explicit — the row is measured, each card's x and width are animated on a spring — so nothing scales:
   covers are cropped by their cards and reveal as they widen. The arrow opens the case study (Case04.tsx), in the page's place. */
const OPEN = .58; /* the open card, of the viewport's width (ref 7: 66% with two folded; five here) */
const SPRING = { type: 'spring', stiffness: 260, damping: 32, mass: 1 } as const;

export default function Projects04({ onOpen }: { onOpen: (id: string) => void }) {
  const reduce = useReducedMotion();
  const [sel, setSel] = useState(PROJECTS[0].id);
  const rowRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<{ w: number; gap: number } | null>(null);
  useLayoutEffect(() => {
    const row = rowRef.current; if (!row) return;
    const measure = () => setGeo({ w: row.clientWidth, gap: parseFloat(getComputedStyle(row).columnGap) || 0 });
    measure(); const ro = new ResizeObserver(measure); ro.observe(row); return () => ro.disconnect();
  }, []);
  const tr = reduce ? { duration: 0 } : SPRING;
  const fade = reduce ? { duration: 0 } : { duration: .28, ease: 'easeOut' as const };
  /* widths from the rule: open + 2.5 folded + 3 gaps = the viewport */
  const E = geo ? Math.round(geo.w * OPEN) : 0, C = geo ? Math.round((geo.w - E - 3 * geo.gap) / 2.5) : 0;
  let x = 0; const k = PROJECTS.findIndex(p => p.id === sel);
  const laid = PROJECTS.map((p, i) => { const open = i === k; const w = open ? E : C; const at = x; x += w + (geo?.gap ?? 0); return { p, open, x: at, w }; });
  /* where the row sits (Nitish, 14 Oct, second rule): with the first or second card open the row stays at its start;
     from the third on, the card two before the open one goes half into the left edge — so the one before it shows whole,
     then the open one, then what follows — and never further than the row's end (the last cards back-fill from the left) */
  const total = x - (geo?.gap ?? 0);
  const shift = geo ? Math.max(0, Math.min(k < 2 ? 0 : laid[k - 2].x + C / 2, total - geo.w)) : 0;
  const place = laid.map(c => ({ ...c, x: c.x - shift }));
  return (
    <section className="pp4" aria-label="Projects">
      <header className="pp4-head">
        <h2 className="h2-4">Projects</h2>
        <div className="pp4-right">
          <p className="pp4-note">Product work, motion systems and the tools built along the way.</p>
        </div>
      </header>
      <div className="pp4-row" ref={rowRef}>
        {geo && place.map(({ p, open, x, w }) => (
          <motion.article key={p.id} className={`pp4-card${open ? ' open' : ''}`} initial={false} animate={{ x, width: w }} transition={tr}>
            <div className="pp4-cover" aria-hidden="true"><span className="pletter">{p.letter}</span></div>
            {/* the open layout: ref 7's wide card */}
            <motion.div className="pp4-open" initial={false} animate={{ opacity: open ? 1 : 0 }} transition={open ? { ...fade, delay: reduce ? 0 : .16 } : { ...fade, duration: .14 }} style={{ pointerEvents: open ? 'auto' : 'none' }}>
              <div className="pp4-top"><h3 className="pp4-title">{p.title}</h3><p className="pp4-blurb">{p.blurb}</p></div>
              <ul className="pp4-chips">{p.tags.map(t => <li key={t}>{t}</li>)}</ul>
              <span className="pp4-meta">{p.client} · {p.role} · {p.year}</span>
              <button type="button" className="pp4-arrow" aria-label={`Open ${p.title}`} onClick={() => onOpen(p.id)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            </motion.div>
            {/* the folded layout: 01's card's lines, set vertically at the bottom-left */}
            <motion.div className="pp4-fold" initial={false} animate={{ opacity: open ? 0 : 1 }} transition={open ? { ...fade, duration: .14 } : { ...fade, delay: reduce ? 0 : .12 }} aria-hidden={open}>
              <span className="pp4-vt">{p.title}</span>
              <span className="pp4-vm">{p.client} · {p.year}</span>
              <span className="pp4-vm dim">{p.tags.join(' · ')}</span>
            </motion.div>
            {!open && <button type="button" className="pp4-hit" aria-label={`Show ${p.title}`} onClick={() => setSel(p.id)} />}
          </motion.article>
        ))}
      </div>
    </section>
  );
}
