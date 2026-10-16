import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react';

/* The state-machine card's demo (Nitish, 16 Oct: the discipline itself — states, transitions, triggers; one system that
   holds for every case). A component and its machine side by side: an order button with four states, the diagram of
   them under it, and the triggers below. The machine is the only thing that moves the button: the button's own press
   is the `tap` trigger, and a trigger that the current state has no transition for is off — so the rules show. One
   transition is a timer, not a trigger (success leaves on its own after 1.6 s), the way Rive's and Lottie's machines
   have exit times. The last transition taken draws itself on the diagram. In the theme's greys only. */
type S = 'idle' | 'loading' | 'success' | 'error';
type T = 'tap' | 'succeed' | 'fail' | 'after';
const MACHINE: Record<S, Partial<Record<T, S>>> = {
  idle: { tap: 'loading' },
  loading: { succeed: 'success', fail: 'error' },
  success: { after: 'idle' },
  error: { tap: 'loading' },
};
const AFTER = 1600;
const TRIGGERS: T[] = ['tap', 'succeed', 'fail'];
const NAME: Record<S, string> = { idle: 'Idle', loading: 'Loading', success: 'Success', error: 'Error' };

/* the diagram, in a 400-wide box: the states as pills, the transitions as arrows between their edges */
const POS: Record<S, [number, number]> = { idle: [46, 75], loading: [172, 75], success: [322, 34], error: [322, 116] };
const PW = 78, PH = 26;
const EDGES: { id: `${S}-${T}`; d: string; lx: number; ly: number; label: string }[] = [
  { id: 'idle-tap', d: 'M 87 75 L 130 75', lx: 109, ly: 67, label: 'tap' },
  { id: 'loading-succeed', d: 'M 213 68 L 280 44', lx: 236, ly: 47, label: 'succeed' },
  { id: 'loading-fail', d: 'M 213 82 L 280 106', lx: 236, ly: 111, label: 'fail' },
  { id: 'success-after', d: 'M 300 20 C 252 -5, 92 -3, 50 60', lx: 172, ly: 7, label: 'after 1.6 s' },
  { id: 'error-tap', d: 'M 302 131 C 262 156, 186 150, 173 92', lx: 236, ly: 153, label: 'tap · retry' },
];
const SPRING = { type: 'spring', stiffness: 420, damping: 32, mass: 1 } as const;
const WIDTH: Record<S, number> = { idle: 150, loading: 44, success: 120, error: 150 };

function OrderButton({ s, onTap, reduce }: { s: S; onTap: () => void; reduce: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  /* the error state arrives with a shake */
  useEffect(() => { if (s === 'error' && ref.current && !reduce) animate(ref.current, { x: [0, -7, 7, -5, 5, -2, 0] }, { duration: .42, ease: 'easeOut' }); }, [s, reduce]);
  const fade = reduce ? { duration: 0 } : { duration: .16, ease: 'easeOut' as const };
  return (
    <motion.button ref={ref} type="button" className={`smb4 ${s}`} initial={false} animate={{ width: WIDTH[s] }} transition={reduce ? { duration: 0 } : SPRING}
      onClick={onTap} aria-label={s === 'loading' ? 'Placing order' : s === 'success' ? 'Order placed' : s === 'error' ? 'Try again' : 'Place order'}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span key={s} className="smb4-c" initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .8 }} transition={fade}>
          {s === 'idle' && 'Place order'}
          {s === 'loading' && <svg className="smb4-spin" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeDasharray="34 100" strokeLinecap="round" /></svg>}
          {s === 'success' && <><svg viewBox="0 0 24 24" aria-hidden="true"><motion.path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduce ? 0 : .3, delay: reduce ? 0 : .1 }} /></svg>Placed</>}
          {s === 'error' && 'Try again'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export default function StateMachine04() {
  const reduce = !!useReducedMotion();
  const [s, setS] = useState<S>('idle');
  const [last, setLast] = useState<{ id: string; n: number } | null>(null);
  const now = useRef<S>('idle');
  const fire = (t: T) => { const cur = now.current, to = MACHINE[cur][t]; if (!to) return; now.current = to; setS(to); setLast(l => ({ id: `${cur}-${t}`, n: (l?.n ?? 0) + 1 })); };
  useEffect(() => { if (s !== 'success') return; const id = window.setTimeout(() => fire('after'), AFTER); return () => window.clearTimeout(id); }, [s]);
  const arrow = useId().replace(/:/g, '');
  return (
    <div className="sm4">
      <div className="sm4-stage">
        <div className="sm4-ui"><OrderButton s={s} onTap={() => fire('tap')} reduce={reduce} /></div>
        <svg className="sm4-graph" viewBox="0 -10 400 172" aria-label={`State: ${NAME[s]}`} role="img">
          <defs><marker id={arrow} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0.5 L8 4 L0 7.5 z" className="sm4-head" /></marker></defs>
          {EDGES.map(e => {
            const from = e.id.split('-')[0] as S;
            return (
              <g key={e.id} className={`sm4-e${from === s ? ' live' : ''}`}>
                <path d={e.d} markerEnd={`url(#${arrow})`} />
                <text x={e.lx} y={e.ly}>{e.label}</text>
              </g>
            );
          })}
          {/* the transition just taken, drawing itself */}
          {last && !reduce && <motion.path key={last.n} className="sm4-took" d={EDGES.find(e => e.id === last.id)!.d} initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: [1, 1, 0] }} transition={{ pathLength: { duration: .34, ease: 'easeOut' }, opacity: { duration: 1.1, times: [0, .6, 1] } }} />}
          {(Object.keys(POS) as S[]).map(k => (
            <g key={k} className={`sm4-s${k === s ? ' on' : ''}`} transform={`translate(${POS[k][0]} ${POS[k][1]})`}>
              <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} rx={PH / 2} />
              <text y="0.5" dominantBaseline="middle" textAnchor="middle">{NAME[k]}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="sm4-trig" role="group" aria-label="Triggers">
        <span>Triggers</span>
        {TRIGGERS.map(t => <button key={t} type="button" disabled={!MACHINE[s][t]} onClick={() => fire(t)}>{t}</button>)}
      </div>
    </div>
  );
}
