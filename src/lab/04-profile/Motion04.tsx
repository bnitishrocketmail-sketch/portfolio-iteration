import { useEffect, useState } from 'react';
import { animate, cubicBezier, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import './motion.css';

/* 04's Motion system tab (Nitish, 16 Oct): how a motion system works for a digital product — not Cars24's, none of its
   names. Three layers, left to right, the way a design system is read: the primitives (raw values nothing in the product
   uses directly), the semantic roles made of them (feedback, enter, exit, move, emphasis), and the components built only
   from the roles. This first pass builds the primitives as a palette of motion — every token shown moving, all of them
   on one beat so they can be compared the way colour swatches are; the other two layers are marked. The values are
   Claude's sensible defaults, his to replace with his own. */

type Ease = (t: number) => number;
const bezier = (v: [number, number, number, number]): Ease => cubicBezier(...v);
/* a damped spring as an easing (unit mass): stiffness k, damping c, read over `span` seconds */
const springEase = (k: number, c: number, span: number): Ease => {
  const w0 = Math.sqrt(k), z = c / (2 * w0), wd = w0 * Math.sqrt(1 - z * z);
  return t => { if (t >= 1) return 1; const s = t * span; return 1 - Math.exp(-z * w0 * s) * (Math.cos(wd * s) + (z * w0 / wd) * Math.sin(wd * s)); };
};

export const DURATION = [
  { name: 'instant', ms: 90, use: 'press, hover' },
  { name: 'quick', ms: 150, use: 'toggles, small changes' },
  { name: 'moderate', ms: 240, use: 'menus, cards' },
  { name: 'slow', ms: 360, use: 'sheets, screens' },
  { name: 'deliberate', ms: 560, use: 'the moments that matter' },
];
export const EASING: { name: string; value: string; f: Ease; use: string }[] = [
  { name: 'standard', value: '0.2, 0, 0, 1', f: bezier([.2, 0, 0, 1]), use: 'moving within the screen' },
  { name: 'enter', value: '0, 0, 0.2, 1', f: bezier([0, 0, .2, 1]), use: 'arriving — fast in, settling' },
  { name: 'exit', value: '0.4, 0, 1, 1', f: bezier([.4, 0, 1, 1]), use: 'leaving — gathering speed' },
  { name: 'linear', value: '0, 0, 1, 1', f: t => t, use: 'progress and loops' },
  { name: 'spring', value: '400 / 24', f: springEase(400, 24, .62), use: 'emphasis and gestures — overshoots, settles' },
];
export const DISTANCE = [
  { name: 'nudge', px: 4, use: 'feedback' },
  { name: 'small', px: 8, use: 'chips, toasts' },
  { name: 'medium', px: 16, use: 'cards, menus' },
  { name: 'large', px: 32, use: 'sheets, screens' },
];
export const STAGGER = [
  { name: 'tight', ms: 30, use: 'lists' },
  { name: 'loose', ms: 70, use: 'grids, hero moments' },
];
const STANDARD = EASING[0].f, ENTER = EASING[1].f, EXIT = EASING[2].f;
const EASE_SPAN = 700; /* every easing is shown over the same time, so only the curve differs */
const BEAT = 1800;

/* one beat for the whole palette: everything starts together, and goes back on the next */
function useBeat(on: boolean) {
  const [beat, setBeat] = useState(-1);
  useEffect(() => {
    if (!on) return;
    const first = window.setTimeout(() => setBeat(0), 400);
    const id = window.setInterval(() => { if (!document.hidden) setBeat(b => b + 1); }, BEAT);
    return () => { window.clearTimeout(first); window.clearInterval(id); };
  }, [on]);
  return beat;
}
/* the block's place on its track: 0 → 1 on even beats and back on odd, on the token's easing and time */
function useShuttle(beat: number, ms: number, f: Ease) {
  const p = useMotionValue(0);
  useEffect(() => { if (beat < 0) return; const c = animate(p, beat % 2 ? 0 : 1, { duration: ms / 1000, ease: f }); return () => c.stop(); }, [beat]); // eslint-disable-line react-hooks/exhaustive-deps
  return p;
}
/* time itself, 0 → 1 each beat, for the dot that rides an easing's curve */
function useClock(beat: number, ms: number) {
  const t = useMotionValue(0);
  useEffect(() => { if (beat < 0) return; t.set(0); const c = animate(t, 1, { duration: ms / 1000, ease: 'linear' }); return () => c.stop(); }, [beat]); // eslint-disable-line react-hooks/exhaustive-deps
  return t;
}

function Track({ p, reach }: { p: MotionValue<number>; reach?: number }) {
  /* the block travels the track (or `reach` px of it, for the distances, with the end marked) */
  const left = useTransform(p, v => (reach ? `${v * reach}px` : `calc(${v} * (100% - var(--blk)))`));
  return (
    <span className="ms4-trk">
      {reach != null && <i className="ms4-end" style={{ left: `calc(${reach}px + var(--blk))` }} />}
      <motion.i className="ms4-blk" style={{ left }} />
    </span>
  );
}

/* a token's name, its value under it */
const Key = ({ name, value }: { name: string; value: string }) => <span className="ms4-k"><b>{name}</b><span className="ms4-v">{value}</span></span>;

function DurationRow({ d, beat }: { d: typeof DURATION[number]; beat: number }) {
  const p = useShuttle(beat, d.ms, STANDARD);
  return <div className="ms4-row" title={d.use}><Key name={d.name} value={`${d.ms} ms`} /><Track p={p} /></div>;
}
function EasingRow({ e, beat }: { e: typeof EASING[number]; beat: number }) {
  const p = useShuttle(beat, EASE_SPAN, e.f), t = useClock(beat, EASE_SPAN);
  const X = (v: number) => 4 + v * 32, Y = (v: number) => 33 - v * 26;
  const pts = Array.from({ length: 41 }, (_, i) => `${X(i / 40).toFixed(2)},${Y(e.f(i / 40)).toFixed(2)}`).join(' ');
  const cx = useTransform(t, X), cy = useTransform(t, v => Y(e.f(v)));
  return (
    <div className="ms4-row ease" title={e.use}>
      <Key name={e.name} value={e.value} />
      <svg className="ms4-curve" viewBox="0 0 40 40" aria-hidden="true"><path className="ax" d="M4 33H36M4 7H36" /><polyline points={pts} /><motion.circle r="2.2" cx={cx} cy={cy} /></svg>
      <Track p={p} />
    </div>
  );
}
function DistanceRow({ d, beat }: { d: typeof DISTANCE[number]; beat: number }) {
  const p = useShuttle(beat, DURATION[2].ms, STANDARD);
  return <div className="ms4-row" title={d.use}><Key name={d.name} value={`${d.px} px`} /><Track p={p} reach={d.px} /></div>;
}
function StaggerRow({ s, beat }: { s: typeof STAGGER[number]; beat: number }) {
  const shown = beat >= 0 && beat % 2 === 0;
  return (
    <div className="ms4-row" title={s.use}>
      <Key name={s.name} value={`${s.ms} ms`} />
      <span className="ms4-dots">{Array.from({ length: 6 }, (_, i) => (
        <motion.i key={i} initial={false} animate={{ opacity: shown ? 1 : .15, y: shown ? 0 : 5 }} transition={{ duration: DURATION[1].ms / 1000, ease: shown ? ENTER : EXIT, delay: i * s.ms / 1000 }} />
      ))}</span>
    </div>
  );
}

export default function Motion04() {
  const reduce = !!useReducedMotion();
  const beat = useBeat(!reduce);
  return (
    <section className="pp4 ms4" aria-label="Motion system">
      <header className="pp4-head">
        <h2 className="h2-4">Motion system</h2>
        <div className="pp4-right"><p className="pp4-note">A motion system for a digital product: the primitives, the roles they make, and the components built from them.</p></div>
      </header>
      <div className="ms4-grid">
        <div className="ms4-panel prim">
          <div className="ms4-ph"><h3>Primitives</h3><p>The raw values. Nothing in the product uses them directly.</p></div>
          <div className="ms4-groups">
            <div className="ms4-col">
              <div className="ms4-g"><h4>Duration</h4>{DURATION.map(d => <DurationRow key={d.name} d={d} beat={beat} />)}</div>
              <div className="ms4-g"><h4>Distance</h4>{DISTANCE.map(d => <DistanceRow key={d.name} d={d} beat={beat} />)}</div>
            </div>
            <div className="ms4-col">
              <div className="ms4-g"><h4>Easing <span>over {EASE_SPAN} ms</span></h4>{EASING.map(e => <EasingRow key={e.name} e={e} beat={beat} />)}</div>
              <div className="ms4-g"><h4>Stagger</h4>{STAGGER.map(s => <StaggerRow key={s.name} s={s} beat={beat} />)}</div>
            </div>
          </div>
        </div>
        <div className="ms4-panel soon">
          <div className="ms4-ph"><h3>Semantic</h3><p>The roles a product needs — feedback, enter, exit, move, emphasis — each made of primitives.</p></div>
          <span className="ms4-next">Next</span>
        </div>
        <div className="ms4-panel soon">
          <div className="ms4-ph"><h3>Components</h3><p>Built only from the roles, running live. Change a token and watch it reach them.</p></div>
          <span className="ms4-next">Next</span>
        </div>
      </div>
    </section>
  );
}
