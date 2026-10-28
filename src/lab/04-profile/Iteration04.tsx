import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { COPY, LAB04, LINKS, NAV04 as NAV, PROJECTS04 as PROJECTS, type ViewName } from '../../lib/data';
import { useTheme } from '../../lib/theme';
import Island from '../../components/island/Island';
import { PhotoStack } from '../../components/tiles/Tiles';
import illustration from '../../assets/nitish-desk-illustration.webp';
import desk from '../../assets/nitish-desk.webp';
import illustrationCutout from '../../assets/nitish-desk-illustration-cutout.webp';
import deskCutout from '../../assets/nitish-desk-cutout.webp';
import { Arrow04 } from './Arrow04';
import Controls04 from './Controls04';
import { Lottie } from '../../components/micro/Lottie';
import Projects04 from './Projects04';
import Workflow04 from './Workflow04';
import Notes04 from './Notes04';
import { DEPTH_K, DepthImg, useTilt, V147 } from './Spatial04';
import { usePhoneRims } from './PhoneRim04';
import { sCorner, sysCurve } from './curve';
import Case04 from './Case04';
import Signature04 from './Signature04';
import { NavIcon } from './NavIcons04';
import Fintech3D, { Launches3D } from './Fintech3D';
import Motion04 from './Motion04';
import PhoneNav04 from './PhoneNav04';
import { SigWall } from './Sig4';
import { GOLD_RECT, LOADER_VIEWBOX, LOTTIES, STILL, dropLoaderText } from '../../lib/lotties';
import { readTweaks, tweakKey } from './tokens';
import { SOCIAL } from './social';
import './profile.css';

/* Iteration 04 — "Profile". One screen, after the hi-fi reference (ref 5) with Nitish's changes (13 Oct) and the lo-fi
   reference's right column (ref 4): a dark frame on the blurred picture; a narrow nav of icons on the left with a travelling
   highlighter (the assistant's button at its foot went on 27 Oct — not sure it is being built); the picture fills the middle, the assistant's notch hangs into it
   from the top, a line about him sits in the cutout at its bottom-left, his name in a glass box at its bottom-right; on
   the right, the projects as a stack of three cards, and Off duty as fanned cards. Greys where the
   reference is yellow; the dark grey stays. Decisions and placeholders: LOG.md, "04 Profile". */

type Tab = Exclude<ViewName, 'project'>;
/* a tab's container arriving (the pages since 22 Oct, the home's two since 27 Oct): in over .32 s, lifting from 8 px down.
   Nothing more (27 Oct, Nitish): a cross-fade with the leaving tab, and the home kept mounted under the pages, were tried
   and rolled back the same evening — "very weirdly glitchy… the transition that used to exist then was very simple" */
const PAGE_IN = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: .32, ease: [.3, 1, .4, 1] as const } };
/* photo placeholders: close mid-greys, so in the fan the depth comes from the shading, not from the tints */
const GREYS: [string, string][] = [['var(--g5)', 'var(--g3)'], ['var(--g5)', 'var(--g4)'], ['var(--g6)', 'var(--g4)'], ['var(--g5)', 'var(--g3)'], ['var(--g6)', 'var(--g4)'], ['var(--g5)', 'var(--g4)']];

/* ---- the projects stack, as ref 4 draws it (Nitish, 13 Oct — "adapt this as it is"): three cards the column's full
   width at 165 × 127, the front one at the bottom, each one behind stepped up by 58% of a card and in shade; a vertical
   pill 3.6% in from the left on every card, centred on the front card and higher (28% from the top) on the ones behind,
   so it shows whole above the card in front; ref 4's greys (dark at the back, light in front) and its soft shadow. Static
   for now — scrolling and the dots come later. ---- */
const SHOWN = 3;
const OFFSET = .575; /* each card peeks 57.5% of a card above the one in front (ref 4 had 58%; compressed to 50% on 21 Oct, then spread 15% the same day) */
const HOLE = true; /* the pill as a hole punched through the card (Nitish, 22 Oct: "not sure — if it looks good we keep it"); false draws it as a shape */
/* the pill's geometry, in the card's 165 × 113: 3.6% in, 9.7% wide (12.1% less a fifth, 22 Oct), 25.2% tall, at the middle of the
   front card and 28% down the ones behind. As a hole it is a mask on the card's face: everything but the pill */
const PILL = { x: 165 * .036, w: 165 * .097, h: 113 * .252 };
/* the hole's place (22 Oct): its left edge on the name's (the name sits 1.4cqw in, measured on the card and handed in as a
   fraction of the card's width); on the front card at the card's middle, on the ones behind at the middle of the strip
   they show under their name — from the name's foot (measured: the name's lines are fixed sizes, so where it ends moves
   with the frame) to where the next card begins (OFFSET of the height) */
const holeMask = (back: boolean, nx = .036, nb = .24) => { const r = PILL.w / 2, cy = 113 * (back ? (nb + OFFSET) / 2 : .5), top = cy - PILL.h / 2 + r, x = 165 * nx; const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 165 113'><path fill-rule='evenodd' d='M0 0H165V113H0Z M${x.toFixed(2)} ${top.toFixed(2)} a${r} ${r} 0 0 1 ${PILL.w} 0 v${(PILL.h - 2 * r).toFixed(2)} a${r} ${r} 0 0 1 -${PILL.w} 0 z'/></svg>`; return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`; };
/* the hover (Nitish, 22 Oct), by a card's place: the front one stays put and only comes alive — its clip plays and turns from
   black and white to colour; the middle one rises by half of what the front card hides of it; the back one cannot rise, so
   the middle one sinks instead, by 40% of what it shows, and more of the back card is seen */
const RISE = -(1 - OFFSET) * .5 * 100, SINK = OFFSET * .4 * 100;
function ProjectStack({ onOpen }: { onOpen: (id: string) => void }) {
  const [hov, setHov] = useState<number | null>(null);
  const reduce = useReducedMotion();
  /* the phone (24 Oct, Nitish: "the three projects in a grid with a little horizontal scroll, as apps do"): the deck
     becomes a row that scrolls sideways, a card and a quarter in view, snapping card by card; the card in view comes
     alive as a hovered one does on the desktop (its clip plays, in colour) */
  const [rail, setRail] = useState(() => typeof window !== 'undefined' && matchMedia('(max-width: 700px)').matches);
  useEffect(() => { const q = matchMedia('(max-width: 700px)'), on = () => setRail(q.matches); q.addEventListener('change', on); return () => q.removeEventListener('change', on); }, []);
  useEffect(() => {
    const d = deck.current; if (!d || !rail) return;
    const seen = new Map<Element, number>();
    const io = new IntersectionObserver(es => { es.forEach(e => seen.set(e.target, e.intersectionRatio)); let best = -1, k = -1; [...d.querySelectorAll('.pcard4')].forEach((c, i) => { const v = seen.get(c) ?? 0; if (v > best) { best = v; k = i; } }); setHov(best > .6 ? k : null); }, { root: d, threshold: [0, .25, .5, .6, .75, .9, 1] });
    d.querySelectorAll('.pcard4').forEach(c => io.observe(c)); return () => io.disconnect();
  }, [rail]);
  /* where a card's name ends, handed to the card (--name-b): B's Lottie is centred in the band from there to the card's
     foot, the same room above it as below (Nitish, 22 Oct) */
  const deck = useRef<HTMLDivElement>(null);
  const [nm, setNm] = useState<{ x: number; b: number }>({ x: .036, b: .24 }); /* the name's left edge and foot, as fractions of the card, for the hole */
  useLayoutEffect(() => {
    const d = deck.current; if (!d) return;
    const set = () => {
      const cards = d.querySelectorAll<HTMLElement>('.pcard4');
      cards.forEach(c => { const n = c.querySelector<HTMLElement>('.pc-name'); if (n) c.style.setProperty('--name-b', `${n.offsetTop + n.offsetHeight}px`); });
      const c = cards[0], n = c?.querySelector<HTMLElement>('.pc-name'); if (c && n && c.offsetWidth) setNm({ x: n.offsetLeft / c.offsetWidth, b: (n.offsetTop + n.offsetHeight) / c.offsetHeight });
    };
    set(); const ro = new ResizeObserver(set); ro.observe(d); return () => ro.disconnect();
  }, []);
  return (
    <div className="stack4">
      <div className={`deck4${rail ? ' rail' : ''}`} ref={deck} onPointerLeave={() => { if (!rail) setHov(null); }}>
        {PROJECTS.slice(0, SHOWN).map((p, k) => {
          const r = k; /* 0 = front (bottom), 2 = back (top): the list's first is the front card, as it is the row's first (22 Oct) */
          const y = rail ? '0%' : r === 1 ? (hov === 1 ? `${RISE}%` : hov === 2 ? `${SINK}%` : '0%') : '0%';
          return (
            <motion.button key={p.id} type="button" className={`pcard4${r ? ' back' : ''}${hov === r ? ' hov' : ''}${p.cover && 'bg' in p.cover ? ' lit' : ''}`} style={rail ? undefined : { bottom: `calc(${r * OFFSET} * ${100 / (1 + (SHOWN - 1) * OFFSET)}%)`, zIndex: 10 - r }}
              animate={{ y }} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}
              onPointerEnter={e => { if (e.pointerType !== 'touch' && !rail) setHov(r); }} onClick={() => onOpen(p.id)}>
              <span className="pc-face" style={{ background: `var(--card-${['front', 'mid', 'back'][r]})`, ...(HOLE && !rail ? { WebkitMaskImage: holeMask(r > 0, nm.x, nm.b), maskImage: holeMask(r > 0, nm.x, nm.b) } : {}) /* no hole on the phone (24 Oct, Nitish) */ }} aria-hidden="true">
                {p.cover && ('video' in p.cover ? <Cover src={p.cover.video} poster={p.cover.poster} on={hov === r} /> : 'lottie' in p.cover ? <span className="pc-video pc-lot" style={{ background: p.cover.bg }}><Lottie className="pc-lot-in" src={p.cover.lottie} still={p.cover.still} playing={hov === r} /></span> : <span className="pc-video pc-comp">{p.cover.comp === 'fintech' ? <Fintech3D mini on={hov === r} /> : <Launches3D mini on={hov === r} />}</span>)}
              </span>
              {!HOLE && !rail && <i className="tab4" aria-hidden="true" />}
              <span className="pc-name"><b>{p.title}</b><small>{p.client} · {p.year}</small></span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
/* a card's clip: held on its first frame in black and white; on hover it plays and turns to colour (the filter eases in CSS) */
function Cover({ src, poster, on }: { src: string; poster: string; on: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => { const v = ref.current; if (!v) return; if (on && !reduce) v.play().catch(() => {}); else v.pause(); }, [on, reduce]);
  return <video ref={ref} className="pc-video" src={src} poster={poster} muted loop playsInline preload="metadata" />;
}

/* the nav: the section names run along the bar reading bottom to top (01's side nav), names only (Nitish, 13 Oct — the
   icons went); the selected one sits in a pill in the frame's colour that travels between the names. The items are fixed
   in size, so the pill simply animates to the selected item's measured box on a spring. It is drawn over the list and
   carries the selected name itself — the old name goes out quickly, the new one comes in on the way — so the name is
   always inside the pill, and the pill hides the names it passes. */
const NAV_SPRING = { type: 'spring', stiffness: 400, damping: 38, mass: 1 } as const;
/* the cavity-ball selection (Nitish, 23 Oct; a control) — his Swiggy bottom nav's B1 "Cavity ball", turned to run down
   the bar: the bar's edge facing the page (the right; the Swiggy bar's top) dips into a smooth valley beside the selected
   tab and a small ball rides in it, sliding along the edge to the next tab, the highlight pill staying on the tab. The
   valley is his: two cubics, half-width HW, depth DP, handles at .45 / .55 of HW; the ball's centre 7.35 in from the
   edge, radius 5.75; the slide 340ms on an ease-out cubic. His sizes were for a 93.5-tall floating bar; here they scale
   by the bar's width / 93.5. The ball is the bar's colour (his ask here; on Swiggy it took the store's), lifted by a
   small shadow. The bar is drawn as this path, so the column's own fill and shadow step aside. */
const CAV = { HW: 19.5, DP: 15.6, BALLR: 5.75, BALLIN: 7.35, REF: 93.5, SLIDE: .34 };
/* on this bar (Nitish, 23 Oct: "the cavity is very small for the bar, and cramped round the ball"): the valley 1.7 × as
   long and 1.45 × as deep, the ball 1.3 ×, and the ball set so its gap to the valley's floor is a quarter of the depth
   (Swiggy's was a sixth) — more room round it */
const CAVX = { HW: 1.7, DP: 1.45, BALLR: 1.3, FLOOR: .26 };
function CavityBar({ w, h, x, y, cy }: { w: number; h: number; x: number; y: number; cy: number }) {
  const reduce = useReducedMotion();
  const k = w / CAV.REF, HW = CAV.HW * k * CAVX.HW, DP = CAV.DP * k * CAVX.DP, BR = CAV.BALLR * k * CAVX.BALLR, BIN = DP * (1 - CAVX.FLOOR) - BR, R = w / 2;
  /* his edge-item rule: the valley stays on the tab's exact centre and the bar's corner on that side flexes smaller as
     it comes near, rather than the valley drifting off-centre */
  const clamp = (v: number) => Math.max(HW + 2, Math.min(h - HW - 2, v));
  const mv = useMotionValue(clamp(cy));
  useEffect(() => { const c = animate(mv, clamp(cy), reduce ? { duration: 0 } : { duration: CAV.SLIDE, ease: [.33, 1, .68, 1] }); return () => c.stop(); }, [cy, h, w]); // eslint-disable-line react-hooks/exhaustive-deps
  const f = (n: number) => n.toFixed(2);
  const d = useTransform(mv, c => {
    const Rt = Math.min(R, Math.max(0, c - HW - 2)), Rb = Math.min(R, Math.max(0, h - c - HW - 2));
    return `M0 ${f(R)} A${f(R)} ${f(R)} 0 0 1 ${f(R)} 0 H${f(w - Rt)} A${f(Rt)} ${f(Rt)} 0 0 1 ${f(w)} ${f(Rt)} V${f(c - HW)}`
      + ` C${f(w)} ${f(c - HW * .45)} ${f(w - DP)} ${f(c - HW * .55)} ${f(w - DP)} ${f(c)}`
      + ` C${f(w - DP)} ${f(c + HW * .55)} ${f(w)} ${f(c + HW * .45)} ${f(w)} ${f(c + HW)}`
      + ` V${f(h - Rb)} A${f(Rb)} ${f(Rb)} 0 0 1 ${f(w - Rb)} ${f(h)} H${f(R)} A${f(R)} ${f(R)} 0 0 1 0 ${f(h - R)} Z`;
  });
  const pad = 12;
  return (
    <svg className="cav4" style={{ left: x - pad, top: y - pad }} width={w + 2 * pad} height={h + 2 * pad} viewBox={`${-pad} ${-pad} ${w + 2 * pad} ${h + 2 * pad}`} aria-hidden="true">
      <motion.path className="cav4-bar" d={d} />
      <motion.circle className="cav4-ball" cx={w - BIN} cy={mv} r={BR} />
    </svg>
  );
}

/* the nav bar (27 Oct, Nitish: his reference — a dark bar of solid icons, the selected one on a rounded square; then
   "two of the icons, the home and the works one… take that as it is… consider the spacing around it in the select
   state… center aligned… the corner radius based on our design system… a pill… sliding in from left to right… the name of
   that icon"): five Heroicons (NavIcons04: the house and the folder read off his page, the share nodes, the beaker, the
   document from the same set), each on a square tile at the reference's proportions — the icon 24 of the tile's 52, the
   tile 52 of the bar's 92, 20 between tiles — the tile's corners the system's (--r × --ios-k, continuous), not the
   reference's 14. The selection: the tile in the nav highlight's colour, sliding to the tab on the spring the pill had.
   On hover a tag with the tab's name slides in from the bar's right edge and fades, as his page's does. The words and
   the signature are gone from the bar. The cavity version keeps its ball, the icons stepping back when not selected */
function Nav({ tab, go, cav }: { tab: Tab; go: (v: ViewName) => void; cav?: boolean }) {
  const reduce = useReducedMotion();
  const ulRef = useRef<HTMLUListElement>(null);
  const [boxes, setBoxes] = useState<Record<string, { top: number; height: number; width: number; left: number }> | null>(null);
  const [bar, setBar] = useState<{ w: number; h: number; x: number; y: number } | null>(null); /* the bar's box, from the list's corner (the cavity version draws the bar) */
  const [hov, setHov] = useState<string | null>(null);
  useLayoutEffect(() => {
    const ul = ulRef.current; if (!ul) return;
    const measure = () => {
      const b: Record<string, { top: number; height: number; width: number; left: number }> = {};
      const u = ul.getBoundingClientRect();
      ul.querySelectorAll<HTMLElement>('li[data-id]').forEach(li => { const r = li.querySelector('button')!.getBoundingClientRect(); b[li.dataset.id!] = { top: r.top - u.top, height: r.height, width: r.width, left: r.left - u.left }; });
      setBoxes(b);
      const col = ul.closest<HTMLElement>('.navcol4'); if (col) { const c = col.getBoundingClientRect(); setBar({ w: c.width, h: c.height, x: c.left - u.left, y: c.top - u.top }); }
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(ul); const col = ul.closest('.navcol4'); if (col) ro.observe(col); return () => ro.disconnect();
  }, []);
  const box = boxes?.[tab] ?? null;
  const tile = box ? { top: box.top, height: box.height, width: box.width } : null;
  const tr = reduce ? { duration: 0 } : cav ? { duration: .34, ease: [.22, 1, .36, 1] as const } : NAV_SPRING;
  const tag = reduce ? { duration: 0 } : { duration: .28, ease: [.22, 1, .36, 1] as const };
  return (
    <nav className={`nav4 icons${cav ? ' cav' : ''}`} aria-label="Sections">
      <ul ref={ulRef}>
        {cav && bar && box && <CavityBar w={bar.w} h={bar.h} x={bar.x} y={bar.y} cy={box.top + box.height / 2 - bar.y} />}
        {tile && !cav && <motion.i className="hl4 tile" initial={false} animate={tile} transition={tr} aria-hidden="true" />}
        {NAV.map(n => {
          const on = n.id === tab;
          return (
            <li key={n.id} data-id={n.id} onMouseEnter={() => setHov(n.id)} onMouseLeave={() => setHov(h => (h === n.id ? null : h))}>
              <button type="button" className={on ? 'on' : ''} aria-current={on ? 'page' : undefined} aria-label={n.label} onClick={() => go(n.id)} onFocus={() => setHov(n.id)} onBlur={() => setHov(h => (h === n.id ? null : h))}>
                <NavIcon id={n.id} className="navico4" />
              </button>
              <AnimatePresence>
                {hov === n.id && <motion.span className="navtag4" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6, transition: { duration: .16 } }} transition={tag} aria-hidden="true">{n.label}</motion.span>}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* the intro tile's shape: its rectangle with two pieces cut out — the bottom-left corner to the cut-out's size and the
   notch at the top-centre to the links' — every convex corner rounded with the tile's radius (the notch's top ends with
   the notch's smaller one) and the inner corners rounded the other way; measured from the boxes, as a clip path, so the
   tile and its shadow follow it. On the phone the cut-out sits below the picture, so there is none. */
function useNotchClip(wrap: React.RefObject<HTMLDivElement | null>, cut: React.RefObject<HTMLDivElement | null>, links: React.RefObject<HTMLDivElement | null>, key: string) {
  const [clip, setClip] = useState<string | null>(null);
  useLayoutEffect(() => { /* re-run when the tile comes back after another tab (key) */
    const w = wrap.current, c = cut.current, l = links.current; if (!w || !c || !l) return;
    const measure = () => {
      if (getComputedStyle(c).position !== 'absolute') { setClip(null); return; }
      const W = w.clientWidth, H = w.clientHeight, cw = c.offsetLeft + c.offsetWidth, ch = H - c.offsetTop, r = parseFloat(getComputedStyle(c).borderTopRightRadius) || 0; /* the cut runs from the tile's left edge and foot to the box's right and top: the box may sit in from both (the light plate version lifts it with the plate's own edges, 27 Oct) */
      const wr = w.getBoundingClientRect(), lr = l.getBoundingClientRect(); const nx = lr.left - wr.left, nw = lr.width, nh = lr.height, rn = parseFloat(getComputedStyle(l).borderBottomLeftRadius) || 0;
      const { K } = sysCurve(w); /* the radii are already the system's (× --ios-k, computed); the curve too (24 Oct: they were round arcs) */
      const d = [
        `M ${r} 0`,
        sCorner([nx, 0], [1, 0], [0, 1], rn, K), sCorner([nx, nh], [0, 1], [1, 0], rn, K), /* the top edge to the notch, down its left side */
        sCorner([nx + nw, nh], [1, 0], [0, -1], rn, K), sCorner([nx + nw, 0], [0, -1], [1, 0], rn, K), /* along its bottom, up its right side */
        sCorner([W, 0], [1, 0], [0, 1], r, K), sCorner([W, H], [0, 1], [-1, 0], r, K), /* the top-right and bottom-right corners */
        sCorner([cw, H], [-1, 0], [0, -1], r, K), sCorner([cw, H - ch], [0, -1], [-1, 0], r, K), sCorner([0, H - ch], [-1, 0], [0, -1], r, K), /* the cut-out */
        sCorner([0, 0], [0, -1], [1, 0], r, K), 'Z',
      ].join(' ');
      setClip(`path("${d}")`);
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(w); ro.observe(c); ro.observe(l); return () => ro.disconnect();
  }, [wrap, cut, links, key]);
  return clip;
}

/* sCorner and sysCurve: the system's corner curve as a path (curve.ts — the case page's head uses them too, 24 Oct) */

/* the phone's notch (24 Oct, Nitish: "on the phone the handles sit where they do on the desktop, but with no cavity —
   add one on the centre right of the image container and align the icons vertically"): the desktop's notch turned onto
   the picture's right edge — a pocket cut into the picture, vertically centred, its inner corners rounded and its joins
   curving out as the desktop's do, the links stacked in it on the container's own ground. */
function usePhoneNotch(wrap: React.RefObject<HTMLDivElement | null>, key: string) {
  /* drawn once, not measured (24 Oct, for the phone's scale): the pocket's shape as a mask image of a fixed size — the
     links' column (48 × 158px: 36px targets, 6px each side; four 34px rows, 2px apart, 8px above and below) and the
     curves at its ends (16 × --ios-k) — laid at the picture's right, centred on its height (profile.css) */
  useLayoutEffect(() => {
    const w = wrap.current; if (!w) return;
    const { k, K } = sysCurve(w), R = 16 * k, D = 48, NH = 158, HH = NH + 2 * R;
    const d = `M ${D} 0 ${sCorner([D, R], [0, 1], [-1, 0], R, K)} ${sCorner([0, R], [-1, 0], [0, 1], R, K)} ${sCorner([0, R + NH], [0, 1], [1, 0], R, K)} ${sCorner([D, R + NH], [1, 0], [0, 1], R, K)} Z`;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${D}' height='${HH.toFixed(2)}' viewBox='0 0 ${D} ${HH.toFixed(2)}'><path d='${d}'/></svg>`;
    w.style.setProperty('--pic-notch', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`); w.style.setProperty('--pic-notch-h', `${HH.toFixed(2)}px`);
    return () => { w.style.removeProperty('--pic-notch'); w.style.removeProperty('--pic-notch-h'); };
  }, [wrap, key]);
}


export default function Iteration04() {
  const { view: v0, pid: ppid, lid } = useParams();
  const view = v0 ?? (ppid ? 'projects' : lid ? 'lab' : undefined); /* /projects/:pid is a case study on the Projects tab, /lab/:lid one on the Lab tab (23 Oct) */
  const pid = ppid;
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  /* the Motion system has no nav entry (20 Oct: a Lab project) but keeps its route; while it is open the nav shows Lab */
  const tab: Tab = (NAV.some(n => n.id === view) || view === 'motion' ? view : 'home') as Tab;
  const navTab: Tab = tab === 'motion' ? 'lab' : tab;
  const home = tab === 'home'; /* a class on the page (the plate version's spacing and inks on the home tab) */
  const go = (v: ViewName, id?: string) => { if (v === 'project' && id) { navigate(`/lab/04-profile/projects/${id}`); return; } if (v === 'lab' && id) { navigate(`/lab/04-profile/lab/${id}`); return; } navigate(v === 'home' ? '/lab/04-profile' : `/lab/04-profile/${v}`); };
  /* the design system's values for this mode (tokens.ts; edited on /lab/04-system, kept in the browser) — read on mount, on a
     mode change, and when the system page writes them from another tab */
  const [tweaks, setTweaks] = useState<Record<string, string>>(() => readTweaks(isDark));
  const picV = tweaks['--pic-v'] ?? 'illo';
  const depthOn = (tweaks['--pic-depth'] ?? 'warp') === 'warp' && !(typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches); /* the spatial picture (Spatial04, 23 Oct; a control) */
  const ios = (tweaks['--corners'] ?? 'ios') === 'ios'; /* iOS corners (a control, 22 Oct) */
  const glass = tweaks['--frame-v'] === 'glass'; /* the main container as glass (a control, 22 Oct) */
  const edge = tweaks['--edge-light'] ?? 'rim'; /* the container's edge light, iOS's rim or off (a control, 23 Oct) */
  const introCard = (tweaks['--intro-v'] ?? 'card') === 'card'; /* the name area as a light card in the cut-out (a control, 27 Oct) */
  const plateDark = tweaks['--plate'] === 'dark'; /* the plate in the selection's dark, what is on it inverted (a control, 27 Oct) */
  const navFloat = (tweaks['--nav-bar'] ?? 'float') === 'float'; /* the other pages' nav: the icons on the frame, no bar (a control, 27 Oct) */
  const sigBg = (tweaks['--sig-bg'] ?? 'on') === 'on'; /* his signature on the picture's wall, behind him (a control, 27 Oct) */
  const frameRef = useRef<HTMLDivElement>(null);
  usePhoneRims(frameRef, parseFloat(tweaks['--edge-angle'] ?? '24') || 0); /* the phone's rims, at the Light angle (24 Oct) */
  useEffect(() => { setTweaks(readTweaks(isDark)); const on = (e: StorageEvent) => { if (e.key === tweakKey(isDark)) setTweaks(readTweaks(isDark)); }; addEventListener('storage', on); return () => removeEventListener('storage', on); }, [isDark]);
  const wrapRef = useRef<HTMLDivElement>(null), cutRef = useRef<HTMLDivElement>(null), linksRef = useRef<HTMLDivElement>(null);
  const clip = useNotchClip(wrapRef, cutRef, linksRef, tab);
  usePhoneNotch(wrapRef, `${tab}${ios}`);
  const tilt = useTilt(wrapRef, depthOn && tab === 'home');
  /* the build: the latest, or the milestone — p147 as it shipped, frozen (a control, 23 Oct) */
  const m147 = tweaks['--pic-depth-ver'] === 'v147';
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && matchMedia('(max-width: 700px)').matches);
  useEffect(() => { const q = matchMedia('(max-width: 700px)'), on = () => setPhone(q.matches); q.addEventListener('change', on); return () => q.removeEventListener('change', on); }, []);
  const depthK = (m147 ? V147.k : DEPTH_K)[(tweaks['--pic-depth-k'] ?? (phone ? 'pronounced' : 'subtle')) === 'pronounced' ? 'pronounced' : 'subtle']; /* the strength (a control); unset, the phone takes the pronounced one — driven by the phone's tilt (24 Oct) */
  const dd = m147 ? V147.dir : '/depth/', dn = picV === 'photo' ? 'desk' : 'illustration'; /* the depth files' folder and name */
  const dfs = m147 ? { fs: V147.fs, focus: V147.focus } : {};
  const reduce = useReducedMotion();
  /* the cards lean with the pointer by their depth (the hero's chips) */
  const lean = (e: React.PointerEvent) => {
    const w = wrapRef.current; if (!w || reduce || e.pointerType === 'touch') return;
    const r = w.getBoundingClientRect(); const dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
    w.querySelectorAll<HTMLElement>('.fl4').forEach(c => { const d = Number(c.dataset.depth); c.style.setProperty('--px', (dx * 26 * d).toFixed(1) + 'px'); c.style.setProperty('--py', (dy * 18 * d).toFixed(1) + 'px'); });
  };
  /* the Off duty box is a size container of its own, so the frame's type tokens (cqw) shrink inside it; the title and meta
     sizes the cards resolve to are measured on the column and handed to the box in pixels (21 Oct) */
  const colRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const col = colRef.current; if (!col) return;
    const set = () => { const cs = getComputedStyle(col); col.style.setProperty('--off-title', cs.getPropertyValue('--t-title') && `${parseFloat(getComputedStyle(col.querySelector('.pc-name b') ?? col).fontSize)}px`); col.style.setProperty('--off-meta', `${parseFloat(getComputedStyle(col.querySelector('.pc-name small') ?? col).fontSize)}px`); };
    set(); const ro = new ResizeObserver(set); ro.observe(col); return () => ro.disconnect();
  }, [tab]);
  const unlean = () => wrapRef.current?.querySelectorAll<HTMLElement>('.fl4').forEach(c => { c.style.setProperty('--px', '0px'); c.style.setProperty('--py', '0px'); });
  /* after the button's own click has finished bubbling — the island closes on any click outside itself */

  return (
    <div className={`it04${isDark ? '' : ' light'}${glass ? ' glassframe' : ''}${ios ? ' ios' : ''}${edge !== 'off' ? ' edgelit' : ''}${introCard ? ' intro-card' : ''}${plateDark ? ' plate-dark' : ''}${navFloat ? ' nav-float' : ''}${home ? ' home' : ''}`} style={{ '--gx': GOLD_RECT.x, '--gy': GOLD_RECT.y, '--gw': GOLD_RECT.w, '--gh': GOLD_RECT.h, ...tweaks } as React.CSSProperties}>
      <div className="bg4" aria-hidden="true" style={{ backgroundImage: `url(${picV === 'photo' ? desk : illustration})`, filter: picV === 'illo-bw' ? `blur(${glass ? 14 : 44}px) brightness(${glass && isDark ? .66 : isDark ? .45 : 1.02}) grayscale(1)` : undefined }} />
      <div className="frame4" ref={frameRef}>
        <span className="edge4" aria-hidden="true" /> {/* the edge light (profile.css, 23 Oct) */}
        {/* nav: the icons, the highlighter travels, the tiles centred on the bar's height (27 Oct, Nitish: they started from
            the top). The assistant's button that sat at the foot is gone (27 Oct: not sure it is being built) */}
        <div className="navcol4">
          <Nav tab={navTab} go={go} cav={tweaks['--nav-sel'] === 'cavity'} />
          <PhoneNav04 items={NAV} tab={navTab} go={go} />
        </div>

        {/* the picture, with the notch hanging in from the top and the name box at the bottom-right, is the intro tile; the
            area at its bottom-left — the name, the title, the line, the CV, the photo — is not part of it but the frame
            showing through a corner cut out of the tile (Nitish, 13 Oct). So the tile is clipped to that shape and casts its
            shadow as that shape — onto the frame around it and onto the cut-out area — and the cut-out sits beside it. */}
        {tab === 'projects' ? (
          /* the project page takes the picture's and the column's place (Projects04.tsx); the nav stays */
          <motion.div key={pid ? `case-${pid}` : 'projects'} className="page4" {...PAGE_IN}>
            {pid ? <Case04 id={pid} card={tweaks[`--card-${pid}`]} back={() => go('projects')} onOpen={id => go('project', id)} /> : <Projects04 onOpen={id => go('project', id)} />}
          </motion.div>
        ) : tab === 'motion' ? (
          /* the motion system (Motion04.tsx), in the same place */
          <motion.div key="motion" className="page4" {...PAGE_IN}>
            <Motion04 />
          </motion.div>
        ) : tab === 'lab' ? (
          /* the experiments (Lab04.tsx); the Motion system's card opens its page */
          <motion.div key={lid ? `lab-${lid}` : 'lab'} className="page4" {...PAGE_IN}>
            {/* the Lab is the Projects page with the Lab's list (23 Oct); the Motion system's arrow opens its page */}
            {lid ? <Case04 id={lid} items={LAB04} backTo="Lab" back={() => go('lab')} onOpen={id => (id === 'motion-system' ? go('motion') : go('lab', id))} />
              : <Projects04 items={LAB04} title="Lab" note="Experiments: the rigs, the plugin, the systems and the concepts, built to be played with." onOpen={id => (id === 'motion-system' ? go('motion') : go('lab', id))} />}
          </motion.div>
        ) : tab === 'articles' ? (
          <motion.div key={tab} className="page4" {...PAGE_IN}>
            <Notes04 /> {/* the old site's recent articles, as Notes (23 Oct) */}
          </motion.div>
        ) : tab === 'workflow' ? (
          /* the "how I work" map (Workflow04.tsx), in the same place */
          <motion.div key="workflow" className="page4" {...PAGE_IN}>
            <Workflow04 />
          </motion.div>
        ) : (<>
        {/* the home's two containers arrive as the other tabs' pages do — a short fade, lifting a little (27 Oct, Nitish:
            coming back to Home "the white background… just appears just like that… adding a little fade in can work") */}
        <motion.div className="picwrap4" ref={wrapRef} onPointerMove={lean} onPointerLeave={unlean} {...PAGE_IN}>
          <section className={`pic4${picV === 'illo-bw' ? ' bw' : ''}`}> {/* the picture's version (22 Oct): the drawing, the drawing in black and white, or the photo — a control */}
            <div className="pic4-in" style={clip ? { clipPath: clip } : undefined}>
              {depthOn
                ? <DepthImg className="pic4-img" src={picV === 'photo' ? desk : illustration} depth={`${dd}${dn}.png`} plate={`${dd}${dn}-plate.webp`} layers={`${dd}${dn}-layers.png`} fg={`${dd}${dn}-fg.webp`} fgn={`${dd}${dn}-fgn.webp`} {...dfs} tilt={tilt} k={depthK} alt={picV === 'photo' ? 'Nitish at his desk' : 'Nitish at his desk, drawn'} />
                : <img className="pic4-img" src={picV === 'photo' ? desk : illustration} alt={picV === 'photo' ? 'Nitish at his desk' : 'Nitish at his desk, drawn'} />}
              {/* the floating Lottie cards (01/02b's three), in this page's glass (Nitish, 13 Oct): the coin and the loader
                  behind him — his cutout from the illustration lies over them, so they are a little masked — the assistant's
                  in front, over his hair; each one's place and layer are tokens (the Edit panel moves them). They float, and
                  lean with the pointer by their depth. */}
              {/* his signature on the wall behind him (27 Oct, Nitish: "the SVG… that we removed from the left navigation… in the
                  illustration container background, even behind my picture… like a silhouette… a little darker than the
                  background… not dominating"): the nav's old "Nitish", wide across the wall at his head's height, in the
                  dark at a low opacity so it reads as the wall a shade darker; behind him and the cards, leaning least */}
              {sigBg && <div className="fl4 sig-bg" data-depth=".2" aria-hidden="true"><SigWall /></div>}
              <div className="fl4 coin-card" data-depth=".5" style={{ '--dur': '7s', '--dl': '-3.3s' } as React.CSSProperties}>
                <div className="fl4-in"><Lottie className="coin" src={LOTTIES.coin} still={STILL.coin} label="A rupee coin turning, made with the Vector 3D plugin" /><span className="cap">Vector 3D plugin</span></div>
              </div>
              <div className="fl4 loader-card" data-depth=".6" style={{ '--dur': '5.8s', '--dl': '-1.7s' } as React.CSSProperties}>
                <div className="fl4-in"><Lottie className="lk" src={LOTTIES.loader} drop={dropLoaderText} viewBox={LOADER_VIEWBOX} still={STILL.loader} label="Lenskart's infinity-glasses loader" /><span className="cap">Loader animation</span></div>
              </div>
              {depthOn
                ? <DepthImg className="pic4-img pic4-me" src={picV === 'photo' ? deskCutout : illustrationCutout} depth={`${dd}${dn}.png`} layers={`${dd}${dn}-layers.png`} fg={`${dd}${dn}-fg.webp`} {...dfs} tilt={tilt} k={depthK} alt="" />
                : <img className="pic4-img pic4-me" src={picV === 'photo' ? deskCutout : illustrationCutout} alt="" aria-hidden="true" />}
              <div className="fl4 ai-card" data-depth="1.3" style={{ '--dur': '5.6s', '--dl': '-1s' } as React.CSSProperties}>
                <div className="fl4-in"><Lottie className="bl" src={LOTTIES.b} still={STILL.b} label="B, Lenskart's AI assistant, cycling through its states" /><span className="cap">Lenskart's<br />AI assistant</span></div>
              </div>
              {/* the fifth card (Nitish, 13 Oct): the Gold membership reveal — the glass is padded to the rounded card inside the
                  Lottie (its canvas is laid with negative margins so that rectangle is the content box), and the confetti flies
                  past the glass; the Lottie's corners are its own */}
              <div className="fl4 gold-card" data-depth="1.15" style={{ '--dur': '6.1s', '--dl': '-3.8s' } as React.CSSProperties}>
                <div className="fl4-in"><Lottie className="gm" src={LOTTIES.gold} still={STILL.gold} label="A Gold membership card arriving in a burst of gold confetti" /><span className="cap">Success state animation</span></div>
              </div>
              {/* the sixth card (Nitish, 13 Oct): the persuasion animation, the whole canvas in the glass with the standard padding and
                  no rounding of its own */}
              <div className="fl4 pers-card" data-depth="1.2" style={{ '--dur': '6.6s', '--dl': '-.9s' } as React.CSSProperties}>
                <div className="fl4-in"><Lottie className="pa" src={LOTTIES.persuasion} still={STILL.persuasion} effects label="The persuasion animation" /><span className="cap">Persuasion animation</span></div>
              </div>
              {/* the fourth card (Nitish, 13 Oct): a wide Lottie with its own background, its corners rounded like the card's, the name below it */}
              <div className="fl4 micro-card" data-depth="1.1" style={{ '--dur': '6.4s', '--dl': '-2.4s' } as React.CSSProperties}>
                <div className="fl4-in"><Lottie className="mli" src={LOTTIES.micro} still={STILL.micro} label="A bottom navigation bar's tabs animating in turn" /><span className="cap">Micro interactions</span></div>
              </div>
              <div className="name4">
                {/* the one-liner only — the "I make UI move." line went (Nitish, 13 Oct: he may bring it back later) */}
                <p className="lede4">{COPY.lede}<span className="lede4-more"> I design feedback{'\u00a0'}rich interfaces powered by motion.</span></p> {/* the phone (24 Oct): the one-liner joins the description as one paragraph; hidden on the desktop, where it sits under the title */}
              </div>
            </div>
          </section>
          {/* the notch at the top: the links sit on the frame, in a second cut-out of the tile (Nitish, 13 Oct — no background
              of their own); the assistant lives behind the nav's button and opens here */}
          <div className="notch4">
            <div className="links4" ref={linksRef}>
              {SOCIAL.map(l => <a key={l.label} href={l.href} aria-label={l.label} title={l.label} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener"><svg viewBox={l.box} aria-hidden="true"><path d={l.path} fill="currentColor" /></svg></a>)}
            </div>
            <Island onGo={go} onToggleTheme={toggle} />
          </div>
          {/* the cut-out: the name, the title, the line, the CV, the photo */}
          <div className="cut4" ref={cutRef}>
            <i className="corner4" aria-hidden="true" /> {/* a small bracket on the blank area's bottom-left corner — the tile's corner, with its radius, round-capped (Nitish, 13 Oct) */}
            <span className="nm4">Nitish<br /><b>Bhardwaj</b></span>
            {/* his photo in a disc beside the name (Nitish, 13 Oct); the desk photo stands in until he sends the one he means */}
            <span className="me4"><img src={desk} alt="" /></span>
            <Signature04 className="sig4" label="Product, motion designer" /> {/* his written title (22 Oct), in the rolling word's place — the word's first letter on the name's edge, as on the case study's card */}
            <p className="sub4">I design feedback{'\u00a0'}rich interfaces powered by motion.</p>
            <a className="cv4" href={LINKS.cv}>View CV <Arrow04 out /></a>
          </div>
        </motion.div>
        {/* the right column: the lo-fi's widgets — a pill, the three stacked cards, Off duty fanned */}
        <motion.aside className="col4" ref={colRef} {...PAGE_IN}>
          <div className="pill4">
            <h2 className="h2-4">Projects</h2>
            <button type="button" className="seeall4" onClick={() => go('projects')}>See all <span aria-hidden="true">→</span></button> {/* the phone only (24 Oct): a row that scrolls sideways gets an app's "See all", to the Projects tab */}
            <i className="corner4 tr" aria-hidden="true" /> {/* the bracket's mirror at the top right (Nitish, 21 Oct): its top leg on the picture's top line, its right leg on the column's right edge, the cards' */}
          </div>
          <ProjectStack onOpen={id => go('project', id)} />
          <i className="sep4" aria-hidden="true" /> {/* the separation between the two sections: whatever the column has left */}
          <div className="pill4 off"><h2 className="h2-4">Off duty</h2></div> {/* the heading outside the box, an H2 like Projects (Nitish, 21 Oct) */}
          <section className="off4"><PhotoStack fan tints={GREYS} caption /></section>
        </motion.aside>
        </>)}
      </div>
      {/* the design system — the type, the colours, the cards' places, in both modes, with their controls — is its own page */}
      {/* the control centre (22 Oct, back from the first cut): a panel at the side of the page, with the way to the whole design-system page at its top */}
      <Controls04 values={tweaks} onChange={setTweaks} dark={isDark} toggle={toggle} />
      <Link className="labtag" to="/lab">Lab · 04 Profile</Link>
    </div>
  );
}
