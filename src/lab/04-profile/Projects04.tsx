import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { PROJECTS04, type Project } from '../../lib/data';
import { Lottie } from '../../components/micro/Lottie';
import Fintech3D, { FIN_BG, LAU_BG, Launches3D } from './Fintech3D';
import { MotionThumb } from './MotionV2_04';
import './lab.css';

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
/* the open card's visual (Nitish, 23 Oct): the project's main visual — the one its card in the home stack plays, or
   the Lab's for the coin projects — in the background of the open card, under everything (the text, the chips, the big
   letter, the arrow), playing while the card is open. A clip fills the card; a Lottie or the two-phone scene sits in
   its right part, clear of the text; RideQuest and the Swiggy nav have no visual of their own yet, so they keep the
   letter alone. */
function Visual({ p, on }: { p: Project; on: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const c = p.cover;
  useEffect(() => { const v = ref.current; if (!v) return; if (on && !reduce) v.play().catch(() => {}); else v.pause(); }, [on, reduce]);
  /* a clip of a phone on its own ground (RideQuest's, `side`) sits whole at the right on that ground, clear of the text */
  if (c && 'video' in c) return c.side
    ? <div className="pp4-vl" style={{ background: c.bg }}><video ref={ref} className="pp4-vid side" src={c.video} poster={c.poster} muted loop playsInline preload="metadata" /></div>
    : <video ref={ref} className="pp4-vid" src={c.video} poster={c.poster} muted loop playsInline preload="metadata" />;
  if (c && 'lottie' in c) return <div className="pp4-vl" style={{ background: c.bg }}><Lottie className="pp4-vl-in" src={c.lottie} still={c.still} playing={on && !reduce} /></div>;
  if (c && 'comp' in c && c.comp === 'motion') return <div className="pp4-vms"><MotionThumb on={on} /></div>;
  if (c && 'comp' in c) return <div className="pp4-vc">{c.comp === 'fintech' ? <Fintech3D on={on} fit={.95} at={66} /> : <Launches3D on={on} fit={.95} at={66} />}</div>;
  return null;
}

/* is the visual dark? (Nitish, 23 Oct: on a dark visual the card's text, chips, letter and arrow go to the lighter,
   inverted colours, automatically.) Read from the visual itself: a ground's colours (the scenes' gradients, a Lottie's
   ground) averaged, or a clip's poster averaged in a small canvas; dark when the relative luminance is under .35. A
   visual with no ground of its own sits on the card's light grey. */
const lum = (hex: string) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const lumOf = (css: string) => { const hs = css.match(/#[0-9a-f]{6}/gi) ?? []; return hs.length ? hs.reduce((a, h) => a + lum(h), 0) / hs.length : 1; };
function useDark(p: Project) {
  const c = p.cover;
  const known = c && 'comp' in c ? c.comp !== 'motion' && lumOf(c.comp === 'fintech' ? FIN_BG : LAU_BG) < .35 : c && 'lottie' in c && c.bg ? lumOf(c.bg) < .35 : false;
  const [dark, setDark] = useState(known);
  useEffect(() => {
    if (!(c && 'video' in c)) return;
    const img = new Image(); img.src = c.poster;
    img.onload = () => { try { const cv = document.createElement('canvas'); cv.width = cv.height = 16; const g = cv.getContext('2d')!; g.drawImage(img, 0, 0, 16, 16); const d = g.getImageData(0, 0, 16, 16).data; let L = 0; for (let i = 0; i < d.length; i += 4) { const h = '#' + [d[i], d[i + 1], d[i + 2]].map(v => v.toString(16).padStart(2, '0')).join(''); L += lum(h); } setDark(L / (d.length / 4) < .35); } catch { /* a cross-origin poster can't be read: keep light */ } };
  }, [c]);
  return dark;
}
function Card({ children, p, open, ...rest }: { children: React.ReactNode; p: Project; open: boolean } & React.ComponentProps<typeof motion.article>) {
  const dark = useDark(p);
  return <motion.article {...rest} className={`pp4-card${open ? ' open' : ''}${open && dark ? ' inv' : ''}`}>{children}</motion.article>;
}

const OPEN = .58; /* the open card, of the viewport's width (ref 7: 66% with two folded; five here) */
const SPRING = { type: 'spring', stiffness: 260, damping: 32, mass: 1 } as const;

/* the Lab uses this page as it is (23 Oct): `items`, `title` and `note` are its list and its words */
export default function Projects04({ onOpen, items = PROJECTS04, title = 'Projects', note = 'Product work: features, motion and campaigns for the companies I’ve worked with.' }: { onOpen: (id: string) => void; items?: Project[]; title?: string; note?: string }) {
  const PROJECTS = items;
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
    <section className="pp4" aria-label={title}>
      <header className="pp4-head">
        <h2 className="h2-4">{title}</h2>
        <div className="pp4-right">
          <p className="pp4-note">{note}</p>
        </div>
      </header>
      <div className="pp4-row" ref={rowRef}>
        {geo && place.map(({ p, open, x, w }) => (
          <Card key={p.id} p={p} open={open} initial={false} animate={{ x, width: w }} transition={tr}>
            <div className="pp4-cover" aria-hidden="true">
              <motion.div className="pp4-vis" initial={false} animate={{ opacity: open ? 1 : 0 }} transition={open ? { ...fade, delay: reduce ? 0 : .16 } : { ...fade, duration: .14 }}>{open && <Visual p={p} on={open} />}</motion.div>
              <span className="pletter">{p.letter}</span>
            </div>
            {/* the open layout: ref 7's wide card */}
            <motion.div className="pp4-open" initial={false} animate={{ opacity: open ? 1 : 0 }} transition={open ? { ...fade, delay: reduce ? 0 : .16 } : { ...fade, duration: .14 }} style={{ pointerEvents: open ? 'auto' : 'none' }}>
              <div className="pp4-top"><h3 className="pp4-title">{p.title}</h3><p className="pp4-blurb">{p.blurb}</p></div>
              {p.features && <div className="pp4-feat">{p.featuresTitle && <b>{p.featuresTitle}</b>}<ol>{p.features.map(f => <li key={f}>{f}</li>)}</ol></div>} {/* the project's parts, at the left beside its visual (RideQuest's, 23 Oct) */}
              {/* the meta above the chips' panel, stacked from the foot, so the gap holds however many rows the chips take (23 Oct) */}
              <div className="pp4-foot">
                <span className="pp4-meta">{p.client} · {p.role} · {p.year}</span>
                <ul className="pp4-chips">{p.tags.map(t => <li key={t}>{t}</li>)}</ul>
              </div>
              <button type="button" className="pp4-arrow" aria-label={`Open ${p.title}`} onClick={() => onOpen(p.id)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            </motion.div>
            {/* the folded layout: 01's card's lines, set vertically at the bottom-left */}
            <motion.div className="pp4-fold" initial={false} animate={{ opacity: open ? 0 : 1 }} transition={open ? { ...fade, duration: .14 } : { ...fade, delay: reduce ? 0 : .12 }} aria-hidden={open}>
              <span className="pp4-vt">{p.title}</span>
              <span className="pp4-vm">{p.client} · {p.year}</span>
              <span className="pp4-vm dim">{p.tags.join(' · ')}</span>
            </motion.div>
            {!open && <button type="button" className="pp4-hit" aria-label={`Show ${p.title}`} onClick={() => setSel(p.id)} />}
          </Card>
        ))}
      </div>
    </section>
  );
}
