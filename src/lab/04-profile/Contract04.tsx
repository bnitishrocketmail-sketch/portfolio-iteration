import { useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';

/* Layer 5, a component's contract, live (Nitish's brief, "Every transition has a contract"; his example is Save changes —
   the same contract runs the product's Pay button, which is the point of a system: one contract, any submit). Application
   events drive the state; motion only communicates it. Five states — ready, processing, done, failed, and checking
   status, where an unclear outcome stays distinct from a failure (a timeout is not proof that it failed). The table is
   the authority; the diagram keeps its branching and recovery paths. The viewer picks what the server will answer, then
   presses Pay on the phone. */
export type CState = 'ready' | 'processing' | 'done' | 'failed' | 'checking';
export type CEvent = 'submit' | 'confirmed' | 'rejected' | 'unclear' | 'reconciled-done' | 'reconciled-failed' | 'retry' | 'edit';
export const CONTRACT: [CState, CEvent, CState, string][] = [
  ['ready', 'submit', 'processing', 'Submit'],
  ['processing', 'confirmed', 'done', 'Confirmed'],
  ['processing', 'rejected', 'failed', 'Definite rejection or failure'],
  ['processing', 'unclear', 'checking', 'Outcome becomes uncertain'],
  ['checking', 'reconciled-done', 'done', 'Confirmed after reconciliation'],
  ['checking', 'reconciled-failed', 'failed', 'Definite failure after reconciliation'],
  ['failed', 'retry', 'processing', 'Retry'],
  ['done', 'edit', 'ready', 'A new edit'],
];
export const NAMES: Record<CState, string> = { ready: 'ready', processing: 'paying', done: 'paid', failed: 'failed', checking: 'checking status' };
export type Scenario = 'confirmed' | 'rejected' | 'unclear-done' | 'unclear-failed';
export const SCENARIOS: [Scenario, string][] = [['confirmed', 'Confirmed'], ['rejected', 'Rejected'], ['unclear-done', 'Unclear → confirmed'], ['unclear-failed', 'Unclear → failed']];
export type ContractStatus = { state: CState; last: CEvent | null; n: number; ignored: number };

/* the diagram: states as pills, every transition from the table as a labelled arrow */
const POS: Record<CState, [number, number, number]> = { ready: [44, 84, 64], processing: [152, 84, 70], checking: [286, 84, 108], done: [398, 30, 60], failed: [398, 138, 62] };
const EDGE: Record<CEvent, { d: string; lx: number; ly: number; label: string }> = {
  submit: { d: 'M 77 84 L 114 84', lx: 96, ly: 77, label: 'submit' },
  unclear: { d: 'M 188 84 L 229 84', lx: 209, ly: 77, label: 'unclear' },
  confirmed: { d: 'M 152 72 C 166 34, 300 28, 365 30', lx: 262, ly: 27, label: 'confirmed' },
  rejected: { d: 'M 152 96 C 166 134, 300 140, 364 138', lx: 262, ly: 149, label: 'rejected' },
  'reconciled-done': { d: 'M 318 72 L 376 42', lx: 364, ly: 63, label: 'reconciled' },
  'reconciled-failed': { d: 'M 318 96 L 376 126', lx: 364, ly: 113, label: 'reconciled' },
  retry: { d: 'M 398 151 C 384 180, 178 182, 158 98', lx: 270, ly: 178, label: 'retry' },
  edit: { d: 'M 398 17 C 350 -12, 74 -12, 48 70', lx: 220, ly: -4, label: 'new edit' },
};

/* the diagram, on its own: every transition in the table, the ways out of the current state darker, the one just
   taken drawing itself; `names` relabels the states (the system page shows his Save changes names) */
export function ContractGraph({ state, last, n, names = NAMES }: { state: CState; last: CEvent | null; n: number; names?: Record<CState, string> }) {
  const reduce = useReducedMotion();
  const arrow = useId().replace(/:/g, '');
  const live = new Set(CONTRACT.filter(([from]) => from === state).map(([, e]) => e));
  return (
    <svg className="ct4-graph" viewBox="0 -14 440 204" role="img" aria-label={`State: ${names[state]}`}>
        <defs><marker id={arrow} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0.5 L8 4 L0 7.5 z" className="ct4-head" /></marker></defs>
        {(Object.keys(EDGE) as CEvent[]).map(e => (
          <g key={e} className={`ct4-e${live.has(e) ? ' live' : ''}`}>
            <path d={EDGE[e].d} markerEnd={`url(#${arrow})`} />
            <text x={EDGE[e].lx} y={EDGE[e].ly}>{EDGE[e].label}</text>
          </g>
        ))}
        {last && !reduce && <motion.path key={n} className="ct4-took" d={EDGE[last].d} initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: [1, 1, 0] }} transition={{ pathLength: { duration: .34, ease: 'easeOut' }, opacity: { duration: 1.2, times: [0, .6, 1] } }} />}
        {(Object.keys(POS) as CState[]).map(k => (
          <g key={k} className={`ct4-s${k === state ? ' on' : ''}${k === 'checking' ? ' unk' : ''}`} transform={`translate(${POS[k][0]} ${POS[k][1]})`}>
            <rect x={-POS[k][2] / 2} y={-12} width={POS[k][2]} height={24} rx={12} />
            <text y="0.5" dominantBaseline="middle" textAnchor="middle">{names[k]}</text>
          </g>
        ))}
    </svg>
  );
}

export function ContractPanel({ status, scenario, setScenario }: { status: ContractStatus; scenario: Scenario; setScenario: (s: Scenario) => void }) {
  return (
    <div className="ct4">
      <div className="ct4-scn" role="group" aria-label="What the server will answer">
        <span>The server will answer</span>
        <div>{SCENARIOS.map(([k, label]) => <button key={k} type="button" className={scenario === k ? 'on' : ''} aria-pressed={scenario === k} onClick={() => setScenario(k)}>{label}</button>)}</div>
      </div>
      <ContractGraph state={status.state} last={status.last} n={status.n} />
      <ul className="ct4-rules">
        <li className={status.ignored ? 'hit' : ''}>Repeat taps while it is pending are ignored — no duplicate payment{status.ignored ? <b> · {status.ignored} ignored so far</b> : null}.</li>
        <li className={status.state === 'checking' ? 'hit' : ''}>Application events drive the state. An unclear outcome is its own state, not a failure: a timeout alone is not proof it failed.</li>
        <li>Press on <code>motion.feedback.press</code>; the label changes on <code>motion.content.change</code>; width and hit area stay.</li>
        <li>Leave the page mid-payment: the animation stops, the status carries on. Success comes from the application’s event, never from an animation finishing.</li>
        <li>Reduced motion: no scaling or spinner loop; the status stays readable and is announced.</li>
      </ul>
    </div>
  );
}
