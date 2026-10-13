import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { COPY, LINKS, NAV, PROJECTS, type ViewName } from '../../lib/data';
import { useTheme } from '../../lib/theme';
import Island from '../../components/island/Island';
import { PhotoStack } from '../../components/tiles/Tiles';
import illustration from '../../assets/nitish-desk-illustration.webp';
import desk from '../../assets/nitish-desk.webp';
import { faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { siLottiefiles } from 'simple-icons';
import './profile.css';

/* Iteration 04 — "Profile". One screen, after the hi-fi reference (ref 5) with Nitish's changes (13 Oct) and the lo-fi
   reference's right column (ref 4): a dark frame on the blurred picture; a narrow nav of names on the left with a travelling
   highlighter and the assistant's button at its foot; the picture fills the middle, the assistant's notch hangs into it
   from the top, a line about him sits in the cutout at its bottom-left, his name in a glass box at its bottom-right; on
   the right, the projects as a stack of cards with a column of dots beside it, and Off duty as fanned cards. Greys where the
   reference is yellow; the dark grey stays. Decisions and placeholders: LOG.md, "04 Profile". */

type Tab = Exclude<ViewName, 'project'>;
/* photo placeholders: close mid-greys, so in the fan the depth comes from the shading, not from the tints */
const GREYS: [string, string][] = [['var(--g5)', 'var(--g3)'], ['var(--g5)', 'var(--g4)'], ['var(--g6)', 'var(--g4)'], ['var(--g5)', 'var(--g3)'], ['var(--g6)', 'var(--g4)'], ['var(--g5)', 'var(--g4)']];
const SHOWN = 3; /* cards in view (ref 4 shows three) */
const OFFSET = .58; /* ref 4, measured: each card peeks 58% of a card's height above the one in front; a card is 46% of the stack */
const WORDS = ['Product', 'Interaction', 'Motion']; /* the title's rolling first word (02 v29) */

/* the notch's links: the brands' own marks (Nitish, 13 Oct) — LinkedIn and Instagram from Font Awesome's brand set,
   LottieFiles from Simple Icons (which no longer carries LinkedIn); the email one is an envelope glyph */
const SOCIAL: { label: string; href: string; path: string; box: string }[] = [
  { label: 'LinkedIn', href: LINKS.linkedin, path: String(faLinkedinIn.icon[4]), box: `0 0 ${faLinkedinIn.icon[0]} ${faLinkedinIn.icon[1]}` },
  { label: 'Instagram', href: LINKS.instagram, path: String(faInstagram.icon[4]), box: `0 0 ${faInstagram.icon[0]} ${faInstagram.icon[1]}` },
  { label: 'LottieFiles', href: LINKS.lottiefiles, path: siLottiefiles.path, box: '0 0 24 24' },
  { label: 'Email', href: '#', path: 'M2 5h20v14H2zm1 1v1.2l9 6 9-6V6zm18 2.4-9 6-9-6V18h18z', box: '0 0 24 24' },
];

/* ---- the projects stack: three cards in view, the front one at the bottom, the rest peeking above it (ref 4);
   a column of dots beside it, one per project, marks and moves the front card (Nitish, 13 Oct; the drag slider went) ---- */
function Card({ p, k, pos, onOpen }: { p: (typeof PROJECTS)[number]; k: number; pos: MotionValue<number>; onOpen: () => void }) {
  /* rank: 0 = furthest back (top), SHOWN-1 = front (bottom); fractional while moving. The front card is the one at the
     slider's position; the cards behind it are the next ones in the list. Going forward, the front card slips down and
     out, the one above it comes down into the front, and the next one enters at the top, behind (Nitish, 13 Oct). Every
     card is the same size — behind or in front. `pos` is a spring-smoothed follower of the slider, so a drag reads as
     motion rather than a jump. */
  const rank = useTransform(pos, v => SHOWN - 1 - (k - v));
  /* the cards sit on the deck's bottom edge: the front one flush with it, each one behind a step (58% of a card) higher —
     ref 4's stack; the back one may run past the deck's top, where the deck fades it out. A card arrives from a step above
     the back slot (already faded) and leaves by slipping a third of a step below the front, fading; the order follows the
     rank throughout. */
  const y = useTransform(rank, r => `${(Math.min(SHOWN - 1 + .35, r) - (SHOWN - 1)) * OFFSET * 100}%`);
  const opacity = useTransform(rank, r => (r < -.8 || r > SHOWN - .2 ? 0 : r < 0 ? 1 + r / .8 : r > SHOWN - 1 ? 1 - (r - (SHOWN - 1)) / .8 : 1)); /* the one beyond the back slot fades in as it arrives */
  const z = useTransform(rank, r => 10 + Math.round(r * 10));
  const shade = useTransform(rank, r => `var(--g${Math.max(2, Math.min(4, Math.round(4 - (SHOWN - 1 - r))))})`);
  const pe = useTransform(opacity, o => (o > .5 ? 'auto' : 'none'));
  return (
    <motion.button type="button" className="pcard4" style={{ y, opacity, zIndex: z, background: shade, pointerEvents: pe }} onClick={onOpen}>
      <i className="tab4" aria-hidden="true" />
      <span className="pc-name"><b>{p.title}</b><small>{p.client} · {p.year}</small></span>
    </motion.button>
  );
}

function RollingWord() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => { if (reduce) return; const id = setInterval(() => setI(n => (n + 1) % WORDS.length), 2400); return () => clearInterval(id); }, [reduce]);
  return (
    <motion.span className="rw4" layout transition={{ duration: .45, ease: [.3, 1, .4, 1] }}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span key={WORDS[i]} className="rw4-w" initial={{ y: '110%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-110%', opacity: 0 }} transition={{ duration: .45, ease: [.3, 1, .4, 1] }}>{WORDS[i]}</motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

function ProjectStack({ onOpen }: { onOpen: (id: string) => void }) {
  const n = PROJECTS.length, max = n - 1;
  const target = useMotionValue(0); /* which card is in front (fractional while a drag is on) */
  const pos = useSpring(target, { stiffness: 170, damping: 26, mass: .9 }); /* where the deck is: follows with a lag, settles without bounce */
  const [front, setFront] = useState(0);
  useEffect(() => target.on('change', v => setFront(Math.max(0, Math.min(max, Math.round(v))))), [target, max]);
  const dotsRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const settle = (v: number) => { const to = Math.max(0, Math.min(max, Math.round(v))); if (reduce) { target.jump(to); pos.jump(to); } else target.set(to); };
  /* the dots are a slider too (Nitish, 13 Oct): a drag along them maps their span to 0…max */
  const onDrag = (e: PointerEvent) => {
    const d = dotsRef.current; if (!d) return;
    const first = d.firstElementChild!.getBoundingClientRect(), last = d.lastElementChild!.getBoundingClientRect();
    const y0 = first.top + first.height / 2, y1 = last.top + last.height / 2;
    target.set(Math.max(-.25, Math.min(max + .25, ((e.clientY - y0) / (y1 - y0)) * max)));
  };
  const down = (e: React.PointerEvent) => { if (e.button !== 0) return; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); onDrag(e.nativeEvent); const move = (ev: PointerEvent) => onDrag(ev); const up = () => { settle(target.get()); removeEventListener('pointermove', move); removeEventListener('pointerup', up); }; addEventListener('pointermove', move); addEventListener('pointerup', up); };
  const wheel = (e: React.WheelEvent) => { settle(Math.round(target.get()) + (e.deltaY > 0 ? 1 : -1)); };
  return (
    <div className="stack4" onWheel={wheel}>
      <div className="deck4" style={{ '--n': SHOWN } as React.CSSProperties}>
        {PROJECTS.map((p, k) => <Card key={p.id} p={p} k={k} pos={pos} onOpen={() => onOpen(p.id)} />)}
      </div>
      {/* one dot per project, the front card's a little bigger; beside the cards, outside their column, so it takes none of
          their width (Nitish, 13 Oct) */}
      <div className="dots4" ref={dotsRef} role="tablist" aria-label="Projects" onPointerDown={down}
        onKeyDown={e => { if (e.key === 'ArrowDown') settle(front + 1); if (e.key === 'ArrowUp') settle(front - 1); }}>
        {PROJECTS.map((p, k) => <button key={p.id} type="button" role="tab" className={k === front ? 'on' : ''} aria-selected={k === front} aria-label={p.title} onClick={() => settle(k)} />)}
      </div>
    </div>
  );
}

/* the nav: the section names run along the bar reading bottom to top (01's side nav), names only (Nitish, 13 Oct — the
   icons went); the selected one sits in a pill in the frame's colour that travels between the names. The items are fixed
   in size, so the pill simply animates to the selected item's measured box on a spring. It is drawn over the list and
   carries the selected name itself — the old name goes out quickly, the new one comes in on the way — so the name is
   always inside the pill, and the pill hides the names it passes. */
const NAV_SPRING = { type: 'spring', stiffness: 400, damping: 38, mass: 1 } as const;
function Nav({ tab, go }: { tab: Tab; go: (v: ViewName) => void }) {
  const reduce = useReducedMotion();
  const ulRef = useRef<HTMLUListElement>(null);
  const [boxes, setBoxes] = useState<Record<string, { top: number; height: number; width: number }> | null>(null);
  useLayoutEffect(() => {
    const ul = ulRef.current; if (!ul) return;
    const measure = () => {
      const b: Record<string, { top: number; height: number; width: number }> = {};
      ul.querySelectorAll<HTMLElement>('li[data-id]').forEach(li => { const btn = li.querySelector('button')!; b[li.dataset.id!] = { top: li.offsetTop, height: btn.offsetHeight, width: btn.offsetWidth }; });
      setBoxes(b);
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(ul); return () => ro.disconnect();
  }, []);
  const i = NAV.findIndex(n => n.id === tab);
  const pill = boxes?.[tab] ?? null;
  const tr = reduce ? { duration: 0 } : NAV_SPRING;
  const out = reduce ? { duration: 0 } : { duration: .1, ease: 'easeOut' as const }; /* the old name goes quickly … */
  const inn = reduce ? { duration: 0 } : { duration: .22, ease: 'easeOut' as const }; /* … the new one comes in while the pill is still arriving */
  return (
    <nav className="nav4" aria-label="Sections">
      <ul ref={ulRef}>
        {pill && (
          <motion.i className="hl4" initial={false} animate={pill} transition={tr} aria-hidden="true">
            <AnimatePresence initial={false} mode="wait">
              <motion.span key={tab} className="hltx4" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: inn }} exit={{ opacity: 0, transition: out }}>
                <span className="lbl4"><span>{NAV[i].label}</span></span>
              </motion.span>
            </AnimatePresence>
          </motion.i>
        )}
        {NAV.map(n => {
          const on = n.id === tab;
          return (
            <li key={n.id} data-id={n.id}>
              <button type="button" className={on ? 'on' : ''} aria-current={on ? 'page' : undefined} onClick={() => go(n.id)}>
                <span className="lbl4"><span>{n.label}</span></span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function Iteration04() {
  const { view } = useParams();
  const navigate = useNavigate();
  const { toggle } = useTheme();
  const tab: Tab = (NAV.some(n => n.id === view) ? view : 'home') as Tab;
  const go = (v: ViewName, pid?: string) => { if (v === 'project' && pid) { navigate(`/lab/04-profile/projects`); return; } navigate(v === 'home' ? '/lab/04-profile' : `/lab/04-profile/${v}`); };
  const [ask, setAsk] = useState(0);
  /* after the button's own click has finished bubbling — the island closes on any click outside itself */
  useEffect(() => { if (!ask) return; const id = window.setTimeout(() => document.querySelector<HTMLButtonElement>('.it04 .island-pill')?.click(), 0); return () => window.clearTimeout(id); }, [ask]);

  return (
    <div className="it04">
      <div className="bg4" aria-hidden="true" style={{ backgroundImage: `url(${illustration})` }} />
      <div className="frame4">
        {/* nav: the names, the highlighter travels; the assistant's button at the foot (ref 4's circle, moved down) */}
        <div className="navcol4">
          <Nav tab={tab} go={go} />
          <button type="button" className="ai4" aria-label="Ask the assistant" onClick={() => setAsk(a => a + 1)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 14 9l6.5 2L14 13l-2 6.5L10 13l-6.5-2L10 9z" fill="currentColor" /></svg>
          </button>
        </div>

        {/* the picture, with the notch hanging in from the top, the cutout at the bottom-left, the name box at the bottom-right */}
        <section className="pic4">
          <img className="pic4-img" src={illustration} alt="Nitish at his desk, drawn" />
          {/* the notch holds the links (Nitish, 13 Oct); the assistant lives behind the nav's button and opens here */}
          <div className="notch4">
            <div className="links4">
              {SOCIAL.map(l => <a key={l.label} href={l.href} aria-label={l.label} title={l.label} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener"><svg viewBox={l.box} aria-hidden="true"><path d={l.path} fill="currentColor" /></svg></a>)}
            </div>
            <Island onGo={go} onToggleTheme={toggle} />
          </div>
          {/* the cutout: the name, the title, the CV — the glass box: the line and the one-liner (swapped, Nitish, 13 Oct) */}
          <div className="cut4">
            <span className="nm4">Nitish<br /><b>Bhardwaj</b></span>
            {/* his photo in a disc beside the name (Nitish, 13 Oct); the desk photo stands in until he sends the one he means */}
            <span className="me4"><img src={desk} alt="" /></span>
            <span className="role4"><RollingWord /> designer</span>
            <p className="sub4">I design feedback{'\u00a0'}rich interfaces powered by motion.</p>
            <a className="cv4" href={LINKS.cv}>View CV <span aria-hidden="true">↗</span></a>
          </div>
          <div className="name4">
            <p className="st4"><strong>I make UI move.</strong></p>
            <p className="lede4">{COPY.lede}</p>
          </div>
        </section>

        {/* the right column: the lo-fi's widgets — a pill, the project stack with its dots, Off duty fanned */}
        <aside className="col4">
          <div className="pill4"><span>Projects</span><small>scroll · the dots</small></div>
          <ProjectStack onOpen={id => go('project', id)} />
          <section className="off4"><PhotoStack fan tints={GREYS} /></section>
        </aside>
      </div>
      <Link className="labtag" to="/lab">Lab · 04 Profile</Link>
    </div>
  );
}
