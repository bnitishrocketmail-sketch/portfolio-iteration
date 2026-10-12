import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { COPY, NAV, PROJECTS, type ViewName } from '../../lib/data';
import { useTheme } from '../../lib/theme';
import Island from '../../components/island/Island';
import { PhotoStack } from '../../components/tiles/Tiles';
import illustration from '../../assets/nitish-desk-illustration.webp';
import './profile.css';

/* Iteration 04 — "Profile". One screen, after the hi-fi reference (ref 5) with Nitish's changes (13 Oct) and the lo-fi
   reference's right column (ref 4): a dark frame on the blurred picture; a narrow icon nav on the left with a travelling
   highlighter and the assistant's button at its foot; the picture fills the middle, the assistant's notch hangs into it
   from the top, a line about him sits in the cutout at its bottom-left, his name in a glass box at its bottom-right; on
   the right, the projects as a stack of cards with a drag slider, and Off duty as fanned cards. Greys where the
   reference is yellow; the dark grey stays. Decisions and placeholders: LOG.md, "04 Profile". */

type Tab = Exclude<ViewName, 'project'>;
const ICONS: Record<Tab, string> = {
  home: 'M4 11 12 4l8 7v9H4z',
  projects: 'M4 7h16v12H4zM9 7V4h6v3',
  micro: 'M8 5v14l11-7z',
  campaign: 'M4 6h16v12H4zM4 10h16M8 6v12M16 6v12',
  writing: 'M6 4h12v16H6zM9 9h6M9 13h6',
  experience: 'M4 19h16M7 16V9M12 16V5M17 16v-6',
};
/* photo placeholders: close mid-greys, so in the fan the depth comes from the shading, not from the tints */
const GREYS: [string, string][] = [['var(--g5)', 'var(--g3)'], ['var(--g5)', 'var(--g4)'], ['var(--g6)', 'var(--g4)'], ['var(--g5)', 'var(--g3)'], ['var(--g6)', 'var(--g4)'], ['var(--g5)', 'var(--g4)']];
const SHOWN = 3; /* cards in view (ref 4 shows three) */
const OFFSET = .58; /* ref 4, measured: each card peeks 58% of a card's height above the one in front; a card is 46% of the stack */
const WORDS = ['Product', 'Interaction', 'Motion']; /* the title's rolling first word (02 v29) */

function Icon({ d }: { d: string }) { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" /></svg>; }

/* ---- the projects stack: three cards in view, the front one at the bottom, the rest peeking above it (ref 4);
   a drag slider at the right scrolls the list — the deck follows the thumb continuously and settles on a card ---- */
function Card({ p, k, pos, onOpen }: { p: (typeof PROJECTS)[number]; k: number; pos: MotionValue<number>; onOpen: () => void }) {
  /* rank: 0 = furthest back (top), SHOWN-1 = front (bottom); fractional while moving. The front card is the one at the
     slider's position; the cards behind it are the next ones in the list. Going forward, the front card slips down and
     out, the one above it comes down into the front, and the next one enters at the top, behind (Nitish, 13 Oct). Every
     card is the same size — behind or in front. `pos` is a spring-smoothed follower of the slider, so a drag reads as
     motion rather than a jump. */
  const rank = useTransform(pos, v => SHOWN - 1 - (k - v));
  const y = useTransform(rank, r => `${r * OFFSET * 100}%`);
  const opacity = useTransform(rank, r => (r < -.8 || r > SHOWN - .2 ? 0 : r < 0 ? 1 + r / .8 : r > SHOWN - 1 ? 1 - (r - (SHOWN - 1)) / .8 : 1));
  /* behind in order of rank; a card past the front goes under everything as it leaves */
  const z = useTransform(rank, r => (r > SHOWN - 1 + .02 ? 0 : 10 + Math.round(r * 10)));
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
  const n = PROJECTS.length, max = n - SHOWN;
  const target = useMotionValue(0); /* where the slider is */
  const pos = useSpring(target, { stiffness: 170, damping: 26, mass: .9 }); /* where the deck is: follows with a lag, settles without bounce */
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const thumbH = SHOWN / n; /* of the track */
  const thumbY = useTransform(target, v => `${Math.max(0, Math.min(1, v / max)) * (1 - thumbH) * 100}%`); /* the thumb travels the track less its own height, and never leaves it */
  const settle = (v: number) => { const to = Math.max(0, Math.min(max, Math.round(v))); if (reduce) { target.jump(to); pos.jump(to); } else target.set(to); };
  /* the thumb: its travel is the track minus its own height; drag maps that travel to 0…max */
  const onDrag = (e: PointerEvent) => {
    const t = trackRef.current; if (!t) return;
    const r = t.getBoundingClientRect(); const thumb = r.height * (SHOWN / n); const travel = r.height - thumb;
    const v = ((e.clientY - r.top - thumb / 2) / travel) * max; target.set(Math.max(-.25, Math.min(max + .25, v)));
  };
  const down = (e: React.PointerEvent) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); onDrag(e.nativeEvent); const move = (ev: PointerEvent) => onDrag(ev); const up = () => { settle(target.get()); removeEventListener('pointermove', move); removeEventListener('pointerup', up); }; addEventListener('pointermove', move); addEventListener('pointerup', up); };
  const wheel = (e: React.WheelEvent) => { settle(Math.round(target.get()) + (e.deltaY > 0 ? 1 : -1)); };
  return (
    <div className="stack4" onWheel={wheel}>
      <div className="deck4" style={{ '--n': SHOWN } as React.CSSProperties}>
        {PROJECTS.map((p, k) => <Card key={p.id} p={p} k={k} pos={pos} onOpen={() => onOpen(p.id)} />)}
      </div>
      <div className="slider4" ref={trackRef} onPointerDown={down} role="slider" aria-label="Scroll projects" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(target.get())} tabIndex={0}
        onKeyDown={e => { if (e.key === 'ArrowDown') settle(Math.round(target.get()) + 1); if (e.key === 'ArrowUp') settle(Math.round(target.get()) - 1); }}>
        <motion.i className="thumb4" style={{ top: thumbY, height: `${thumbH * 100}%` }} />
      </div>
    </div>
  );
}

export default function Iteration04() {
  const { view } = useParams();
  const navigate = useNavigate();
  const { toggle } = useTheme();
  const tab: Tab = (NAV.some(n => n.id === view) ? view : 'home') as Tab;
  const go = (v: ViewName, pid?: string) => { if (v === 'project' && pid) { navigate(`/lab/04-profile/projects`); return; } navigate(v === 'home' ? '/lab/04-profile' : `/lab/04-profile/${v}`); };
  const reduce = useReducedMotion();
  const [ask, setAsk] = useState(0);
  /* after the button's own click has finished bubbling — the island closes on any click outside itself */
  useEffect(() => { if (!ask) return; const id = window.setTimeout(() => document.querySelector<HTMLButtonElement>('.it04 .island-pill')?.click(), 0); return () => window.clearTimeout(id); }, [ask]);

  return (
    <div className="it04">
      <div className="bg4" aria-hidden="true" style={{ backgroundImage: `url(${illustration})` }} />
      <div className="frame4">
        {/* nav: icons only, the highlighter travels; the assistant's button at the foot (ref 4's circle, moved down) */}
        <nav className="nav4" aria-label="Sections">
          <ul>
            {NAV.map(n => (
              <li key={n.id}>
                <button type="button" className={n.id === tab ? 'on' : ''} aria-current={n.id === tab ? 'page' : undefined} aria-label={n.label} title={n.label} onClick={() => go(n.id)}>
                  {n.id === tab && <motion.i className="hl4" layoutId="hl4" transition={reduce ? { duration: 0 } : { type: 'spring', bounce: .15, visualDuration: .32 }} />}
                  <Icon d={ICONS[n.id]} />
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="ai4" aria-label="Ask the assistant" onClick={() => setAsk(a => a + 1)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 14 9l6.5 2L14 13l-2 6.5L10 13l-6.5-2L10 9z" fill="currentColor" /></svg>
          </button>
        </nav>

        {/* the picture, with the notch hanging in from the top, the cutout at the bottom-left, the name box at the bottom-right */}
        <section className="pic4">
          <img className="pic4-img" src={illustration} alt="Nitish at his desk, drawn" />
          <div className="notch4"><Island onGo={go} onToggleTheme={toggle} /></div>
          <div className="cut4">
            <p className="st4"><strong>I make UI move.</strong></p>
            <p className="lede4">{COPY.lede}</p>
          </div>
          <div className="name4">
            <span className="nm4">Nitish<br />Bhardwaj</span>
            <span className="role4"><RollingWord /> designer</span>
          </div>
        </section>

        {/* the right column: the lo-fi's widgets — a pill, the project stack with its slider, Off duty fanned */}
        <aside className="col4">
          <div className="pill4"><span>Projects</span><small>drag the bar · scroll</small></div>
          <ProjectStack onOpen={id => go('project', id)} />
          <section className="off4"><PhotoStack fan tints={GREYS} /></section>
        </aside>
      </div>
      <Link className="labtag" to="/lab">Lab · 04 Profile</Link>
    </div>
  );
}
