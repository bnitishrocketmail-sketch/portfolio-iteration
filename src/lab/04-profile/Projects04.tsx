import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { LINKS, PROJECTS } from '../../lib/data';

/* 04's project page, first iteration (Nitish, 14 Oct), after ref 7: "Projects" at the top-left, a line and the CV at the
   right; below, every project in one row — the selected one open wide, laid out as the reference's wide card (the cover,
   the title and blurb at the top-left, the tags in a panel at the bottom-left, a round arrow at the bottom-right corner),
   the others folded narrow to its right in their order, each with its title, client and year, and tags set vertically at
   its bottom-left (01's card's information, turned). What runs past the row's end goes under a fade. A selection brings
   that card to the front of the row and opens it; the others slide right and fold. The geometry is explicit — the row is
   measured, each card's x and width are animated on a spring — so nothing scales: covers are cropped by their cards and
   reveal as they widen. The arrow is to open the case study; where that goes is next. */
const OPEN = .58; /* the open card, of the row's width (ref 7: 66% with two folded; five here) */
const FOLD = .15; /* a folded card */
const SPRING = { type: 'spring', stiffness: 260, damping: 32, mass: 1 } as const;

export default function Projects04() {
  const reduce = useReducedMotion();
  const [sel, setSel] = useState(PROJECTS[0].id);
  const rowRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<{ w: number; gap: number } | null>(null);
  useLayoutEffect(() => {
    const row = rowRef.current; if (!row) return;
    const measure = () => setGeo({ w: row.clientWidth, gap: parseFloat(getComputedStyle(row).columnGap) || 0 });
    measure(); const ro = new ResizeObserver(measure); ro.observe(row); return () => ro.disconnect();
  }, []);
  const order = [PROJECTS.find(p => p.id === sel)!, ...PROJECTS.filter(p => p.id !== sel)];
  const tr = reduce ? { duration: 0 } : SPRING;
  const fade = reduce ? { duration: 0 } : { duration: .28, ease: 'easeOut' as const };
  let x = 0;
  const place = order.map(p => { const open = p.id === sel; const w = geo ? Math.round(geo.w * (open ? OPEN : FOLD)) : 0; const at = x; x += w + (geo?.gap ?? 0); return { p, open, x: at, w }; });
  return (
    <section className="pp4" aria-label="Projects">
      <header className="pp4-head">
        <h2 className="h2-4">Projects</h2>
        <div className="pp4-right">
          <p className="pp4-note">Product work, motion systems and the tools built along the way.</p>
          <a className="cv4" href={LINKS.cv}>View CV <span aria-hidden="true">↗</span></a>
        </div>
      </header>
      <div className="pp4-row" ref={rowRef}>
        {geo && place.map(({ p, open, x, w }) => (
          <motion.article key={p.id} className={`pp4-card${open ? ' open' : ''}`} style={{ '--m1': p.m1, '--m2': p.m2 } as React.CSSProperties}
            initial={false} animate={{ x, width: w }} transition={tr}>
            <div className="pp4-cover" aria-hidden="true"><span className="pletter">{p.letter}</span></div>
            {/* the open layout: ref 7's wide card */}
            <motion.div className="pp4-open" initial={false} animate={{ opacity: open ? 1 : 0 }} transition={open ? { ...fade, delay: reduce ? 0 : .16 } : { ...fade, duration: .14 }} style={{ pointerEvents: open ? 'auto' : 'none' }}>
              <div className="pp4-top"><h3 className="pp4-title">{p.title}</h3><p className="pp4-blurb">{p.blurb}</p></div>
              <ul className="pp4-chips">{p.tags.map(t => <li key={t}>{t}</li>)}</ul>
              <span className="pp4-meta">{p.client} · {p.role} · {p.year}</span>
              <button type="button" className="pp4-arrow" aria-label={`Open ${p.title}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
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
