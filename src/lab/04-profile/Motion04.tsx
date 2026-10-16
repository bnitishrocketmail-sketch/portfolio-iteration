import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import Phone04, { type PhoneHandle } from './Phone04';
import MotionMap04 from './MotionMap04';
import { CONTRACT, ContractPanel, NAMES, type ContractStatus, type Scenario } from './Contract04';
import { FAMILY, MOMENTS, PRIMS, easeFn, mappingOf, moment, prim, role, usersOf, type Dev, type Mapping, type Moment, type MomentId, type Phase, type Prim } from './motionTokens';
import './motion.css';

/* 04's Motion system tab (Nitish, 16 Oct; reframed the same evening: "hard to understand in relevance of the product …
   it should be understandable in the context of how a motion design system exists in a product"). One product and the
   system that moves it: a phone in the middle runs a small generic app; at the left, the product's moments, grouped by
   the pattern a mature system would name (Material's container transform, shared axis and fade through; the sheet, the
   toast, the press) — a tap plays one on the phone; at the right, the token cascade for whatever just moved — moment →
   semantic token → primitives, enter and exit side by side, so the asymmetry shows — and under it the primitives, of
   which only the ones that moment used light up, moving in step with the phone. General, not Cars24's: none of its names. */

/* ---- the primitives, as swatches: each one moves when the phone's moment uses it ---- */
function useShuttle(pulse: number, on: boolean, msDur: number, f: (t: number) => number) {
  const p = useMotionValue(0);
  useEffect(() => { if (!on || pulse < 1) return; p.set(0); const c = animate(p, 1, { duration: msDur / 1000, ease: f }); return () => c.stop(); }, [pulse]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!on) p.set(0); }, [on]); // eslint-disable-line react-hooks/exhaustive-deps -- a token not in use rests at the start
  return p;
}
function useClock(pulse: number, on: boolean, msDur: number) {
  const t = useMotionValue(0);
  useEffect(() => { if (!on || pulse < 1) return; t.set(0); const c = animate(t, 1, { duration: msDur / 1000, ease: 'linear' }); return () => c.stop(); }, [pulse]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!on) t.set(0); }, [on]); // eslint-disable-line react-hooks/exhaustive-deps
  return t;
}
function Track({ p, reach }: { p: MotionValue<number>; reach?: number }) {
  const left = useTransform(p, v => (reach ? `${v * reach}px` : `calc(${v} * (100% - var(--blk)))`));
  return <span className="ms4-trk">{reach != null && <i className="ms4-end" style={{ left: `calc(${reach}px + var(--blk))` }} />}<motion.i className="ms4-blk" style={{ left }} /></span>;
}
const Key = ({ name, value }: { name: string; value: string }) => <><b className="ms4-n">{name}</b><span className="ms4-v">{value}</span></>;

/* the primitives the playing mapping's role references: they light up, and move in its time and on its curve */
type Lit = { ids: string[]; ms: number; ease: string };
function Palette({ lit, pulse }: { lit: Lit; pulse: number }) {
  const f = easeFn(lit.ease), on = (id: string) => lit.ids.includes(id);
  const of = (k: Prim['kind']) => PRIMS.filter(p => p.kind === k);
  return (
    <div className="ms4-groups">
      <div className="ms4-col">
        <div className="ms4-g"><h4>Duration</h4>{of('duration').map(d => <DurRow key={d.id} p={d} on={on(d.id)} pulse={pulse} f={f} />)}</div>
        <div className="ms4-g"><h4>Distance</h4>{of('distance').map(d => <DistRow key={d.id} p={d} on={on(d.id)} pulse={pulse} f={f} durMs={lit.ms} />)}</div>
      </div>
      <div className="ms4-col">
        <div className="ms4-g"><h4>Easing</h4>{of('easing').map(e => <EaseRow key={e.id} p={e} on={on(e.id)} pulse={pulse} durMs={lit.ms} />)}</div>
        <div className="ms4-g"><h4>Scale</h4>{of('scale').map(d => <ScaleRow key={d.id} p={d} on={on(d.id)} pulse={pulse} f={f} durMs={lit.ms} />)}</div>
      </div>
    </div>
  );
}
function DurRow({ p, on, pulse, f }: { p: Prim; on: boolean; pulse: number; f: (t: number) => number }) {
  const v = useShuttle(pulse, on, p.ms!, f);
  return <div className={`ms4-row${on ? ' on' : ''}`}><Key name={p.id} value={p.label} /><Track p={v} /></div>;
}
function DistRow({ p, on, pulse, f, durMs }: { p: Prim; on: boolean; pulse: number; f: (t: number) => number; durMs: number }) {
  const v = useShuttle(pulse, on, durMs, f);
  return <div className={`ms4-row${on ? ' on' : ''}`}><Key name={p.id} value={p.label} /><Track p={v} reach={p.px} /></div>;
}
function ScaleRow({ p, on, pulse, f, durMs }: { p: Prim; on: boolean; pulse: number; f: (t: number) => number; durMs: number }) {
  /* a press scales down (1 → v); an arriving view scales up (v → 1) */
  const v = useShuttle(pulse, on, durMs, f), down = p.id === 'scale.98';
  const scale = useTransform(v, x => (down ? 1 - (1 - p.v!) * x : p.v! + (1 - p.v!) * x));
  return <div className={`ms4-row${on ? ' on' : ''}`}><Key name={p.id} value={p.label} /><span className="ms4-trk sc"><motion.i className="ms4-sq" style={{ scale }} /></span></div>;
}
function EaseRow({ p, on, pulse, durMs }: { p: Prim; on: boolean; pulse: number; durMs: number }) {
  const f = easeFn(p.id), v = useShuttle(pulse, on, durMs, f), t = useClock(pulse, on, durMs);
  const X = (q: number) => 4 + q * 32, Y = (q: number) => 33 - q * 26;
  const pts = Array.from({ length: 41 }, (_, i) => `${X(i / 40).toFixed(2)},${Y(f(i / 40)).toFixed(2)}`).join(' ');
  const cx = useTransform(t, X), cy = useTransform(t, q => Y(f(q)));
  return (
    <div className={`ms4-row ease${on ? ' on' : ''}`} title={p.label}>
      <b className="ms4-n">{p.id}</b>
      <svg className="ms4-curve" viewBox="0 0 40 40" aria-hidden="true"><path className="ax" d="M4 33H36M4 7H36" /><polyline points={pts} /><motion.circle r="2.2" cx={cx} cy={cy} /></svg>
      <Track p={v} />
    </div>
  );
}

/* ---- the cascade for the moment that just played: component mapping → role → primitives ---- */
function TokenLine({ x, label, live }: { x: Mapping; label: string; live: boolean }) {
  const R = role(x.role), others = usersOf(R.id).filter(u => u !== x.id);
  const chips = [R.duration, R.easing, R.distance, R.scale].filter(Boolean) as string[];
  return (
    <div className={`ms4-tl${live ? ' live' : ''}`}>
      <span className="ms4-ph-l">{label}</span>
      <span className="ms4-chain"><code>{x.id}</code><span className="ms4-arr" aria-hidden="true">→</span><code className="role">{R.id}</code></span>
      {/* the phase that just played shows its primitives; the other stays one line */}
      {live && <span className="ms4-chips">
        <span className="ms4-arr" aria-hidden="true">→</span>
        {chips.map(c => <span key={c}>{c}<small>{prim(c).label}</small></span>)}
        {R.opacity && <span>opacity<small>0 ↔ 1</small></span>}
        {x.adjust && <span className="note">{x.adjust}</span>}
      </span>}
      {live && others.length > 0 && <span className="ms4-also">Also uses this role: {others.map(o => <code key={o}>{o}</code>)}</span>}
    </div>
  );
}

/* ---- the developer's view of a moment: its tracks on a time axis, interruption, reduced motion, what can be checked ---- */
function Timeline({ dev, pulse, reduce }: { dev: Dev; pulse: number; reduce: boolean }) {
  const end = Math.max(...dev.tracks.map(t => t.start + t.dur), 1);
  const span = Math.ceil(end / 100) * 100;
  const head = useMotionValue(0);
  useEffect(() => { if (reduce || pulse < 1) return; head.set(0); const c = animate(head, 1, { duration: span / 1000, ease: 'linear' }); return () => c.stop(); }, [pulse]); // eslint-disable-line react-hooks/exhaustive-deps
  const left = useTransform(head, v => `calc(${v} * (100% - 9.5em - 12.4em - 1.6em))`), op = useTransform(head, v => (v > 0 && v < 1 ? 1 : 0)); /* across the lane's width only */
  const ticks = Array.from({ length: 5 }, (_, i) => Math.round(span * i / 4));
  return (
    <div className="dv4-tl">
      <div className="dv4-rows">
        {dev.tracks.map(t => (
          <div key={t.name} className="dv4-row">
            <span className="dv4-name"><b>{t.name}</b><small>{t.owns}</small></span>
            <span className="dv4-lane"><i className={`dv4-bar${t.dur === 0 ? ' zero' : ''}`} style={{ left: `${t.start / span * 100}%`, width: t.dur ? `${t.dur / span * 100}%` : undefined }}><em>{t.dur ? `${Math.round(t.start)}–${Math.round(t.start + t.dur)} ms` : 'on change'}</em></i></span>
            <code className="dv4-ref">{t.ref}</code>
          </div>
        ))}
        <span className="dv4-axis" aria-hidden="true">{ticks.map(x => <i key={x} style={{ left: `${x / span * 100}%` }}>{x}</i>)}</span>
        <motion.i className="dv4-head" style={{ left, opacity: op }} aria-hidden="true" />
      </div>
      {dev.note && <p className="dv4-note">{dev.note}</p>}
    </div>
  );
}
function DevView({ m, pulse, reduce, extra, reduced }: { m: Moment; pulse: number; reduce: boolean; extra?: ReactNode; reduced: boolean }) {
  return (
    <div className="ms4-prims dv4">
      <div className="ms4-ph"><h3>Tracks <span>who owns what, when, on which token</span></h3></div>
      <Timeline dev={m.dev} pulse={pulse} reduce={reduce} />
      {extra}
      <dl className="dv4-dl">
        <dt>Interrupted</dt><dd>{m.dev.interrupt}</dd>
        <dt className={reduced ? 'hit' : ''}>Reduced motion{reduced ? ' · on' : ''}</dt><dd className={reduced ? 'hit' : ''}>{m.dev.reduced}</dd>
        <dt>Acceptance</dt><dd><ul>{m.dev.accept.map(x => <li key={x}>{x}</li>)}</ul></dd>
      </dl>
    </div>
  );
}

export default function Motion04() {
  const reduce = !!useReducedMotion();
  /* two views of one system (Nitish, 16 Oct): the product first, its structure a switch away; kept in the address */
  const [params, setParams] = useSearchParams();
  const view = params.get('view') === 'system' ? 'system' : 'product';
  const setView = (v: 'system' | 'product') => setParams(v === 'system' ? { view: 'system' } : {}, { replace: true });
  const phone = useRef<PhoneHandle>(null);
  const [sel, setSel] = useState<{ id: MomentId; phase: Phase }>({ id: 'sheet', phase: 'enter' });
  const [pulse, setPulse] = useState(0);
  const onMoment = (id: MomentId, phase: Phase) => { setSel({ id, phase }); setPulse(p => p + 1); };
  const [flowing, setFlowing] = useState(false);
  /* whose view the right column takes (brief: both the designer's and the developer's) */
  const [persp, setPersp] = useState<'designer' | 'developer'>('designer');
  /* the phone's motion setting (brief, layer 7): default, or reduced — the same meaning without travel */
  const [reduced, setReduced] = useState(false);
  /* the Pay contract: what the server will answer (the viewer's choice), and where the contract is */
  const [scenario, setScenario] = useState<Scenario>('unclear-done');
  const [contract, setContract] = useState<ContractStatus>({ state: 'ready', last: null, n: 0, ignored: 0 });
  const flow = () => { if (flowing) { phone.current?.stop(); setFlowing(false); } else { setFlowing(true); phone.current?.flow(); } };
  const playOne = (id: MomentId) => { setFlowing(false); phone.current?.play(id); };
  const m = moment(sel.id);
  const R = role(mappingOf(sel.id, sel.phase).role);
  const lit: Lit = { ids: [R.duration, R.easing, R.distance, R.scale].filter(Boolean) as string[], ms: prim(R.duration).ms!, ease: R.easing };
  /* the phone fits the stage's height */
  const stage = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useLayoutEffect(() => { const el = stage.current; if (!el) return; const fit = () => setK(Math.min(1, (el.clientHeight - 44) / 582, el.clientWidth / 282)); fit(); const ro = new ResizeObserver(fit); ro.observe(el); return () => ro.disconnect(); }, []);
  const groups = [...new Set(MOMENTS.map(x => x.group))];
  return (
    <section className="pp4 ms4" aria-label="Motion system">
      <header className="pp4-head">
        <div className="ms4-title">
          <h2 className="h2-4">Motion system</h2>
          <div className="ms4-views" role="tablist" aria-label="View">
            <button type="button" role="tab" aria-selected={view === 'product'} className={view === 'product' ? 'on' : ''} onClick={() => setView('product')}>In a product</button>
            <button type="button" role="tab" aria-selected={view === 'system'} className={view === 'system' ? 'on' : ''} onClick={() => setView('system')}>The system</button>
          </div>
        </div>
        <div className="pp4-right"><p className="pp4-note">{view === 'product' ? 'How motion lives in a product: each component maps to a shared role, and each role is made of a few shared values.' : 'A reusable framework for how everyday digital products respond, change and guide. Clarity in the interaction; consistency in the implementation.'}</p></div>
      </header>
      {view === 'system' ? <MotionMap04 toProduct={id => { if (id) setSel({ id, phase: 'enter' }); setView('product'); }} /> : <div className="ms4-grid">
        {/* the product's moments */}
        <div className="ms4-panel ms4-moments">
          <div className="ms4-ph"><h3>Moments</h3><p>One app, one journey; each moment answers a user’s question.</p></div>
          <button type="button" className={`ms4-flow${flowing ? ' on' : ''}`} onClick={flow}>
            <svg viewBox="0 0 24 24" aria-hidden="true">{flowing ? <path d="M7 6h3v12H7zM14 6h3v12h-3z" fill="currentColor" /> : <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />}</svg>
            {flowing ? 'Stop' : 'Play the journey'}
          </button>
          {groups.map(g => (
            <div key={g} className={`ms4-mg${g === 'The flow' ? ' steps' : ''}`}>
              <h4>{g}</h4>
              {MOMENTS.filter(x => x.group === g).map((x, i) => (
                <button key={x.id} type="button" className={`ms4-m${sel.id === x.id ? ' on' : ''}`} onClick={() => playOne(x.id)}>
                  {g === 'The flow' && <i className="ms4-num">{i + 1}</i>}
                  <b>{x.name}</b><span>{FAMILY[x.family].q}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
        {/* the product */}
        <div className="ms4-stage" ref={stage}><div className="ms4-phone" style={{ width: 282 * k, height: 582 * k }}><Phone04 ref={phone} onMoment={onMoment} onFlowEnd={() => setFlowing(false)} scale={k} scenario={scenario} onContract={setContract} reduced={reduced} /></div><div className="ms4-under"><span className="ms4-ex">Example implementation</span>
          <div className="ms4-views sm" role="group" aria-label="The phone’s motion">{([false, true] as const).map(r => <button key={String(r)} type="button" aria-pressed={reduced === r} className={reduced === r ? 'on' : ''} onClick={() => setReduced(r)}>{r ? 'Reduced motion' : 'Default'}</button>)}</div></div></div>
        {/* its tokens */}
        <div className="ms4-panel ms4-spec">
          <div className="ms4-sel">
            <div className="ms4-top"><p className="ms4-tag">Illustrative values · Framework v0.1</p>
              <div className="ms4-views sm" role="tablist" aria-label="Perspective">{(['designer', 'developer'] as const).map(p => <button key={p} type="button" role="tab" aria-selected={persp === p} className={persp === p ? 'on' : ''} onClick={() => setPersp(p)}>{p === 'designer' ? 'Designer' : 'Developer'}</button>)}</div>
            </div>
            <h3>{m.name} <span>{m.pattern} · {m.trigger}</span></h3>
            <p className="ms4-q"><b>{FAMILY[m.family].q}</b><span>{FAMILY[m.family].name}</span></p>
            {/* a contract's tokens are in its rules (the press, the label), so the contract takes the room */}
            {sel.id !== 'pay' && persp === 'designer' && <div className="ms4-tls">
              <TokenLine x={m.enter} label={m.labels[0]} live={sel.phase === 'enter'} />
              {m.exit && <TokenLine x={m.exit} label={m.labels[1] ?? 'Exit'} live={sel.phase === 'exit'} />}
            </div>}
            {persp === 'designer' && sel.id !== 'pay' && <p className="ms4-why">{m.why}</p>}
            {reduced && persp === 'designer' && <p className="ms4-red"><b>Reduced motion</b>{m.dev.reduced}</p>}
          </div>
          {persp === 'developer'
            ? <DevView m={m} pulse={pulse} reduce={reduce} reduced={reduced} extra={sel.id === 'pay' ? <table className="dv4-ct"><thead><tr><th>Current state</th><th>Event</th><th>Next state</th></tr></thead><tbody>{CONTRACT.map(([a, e, b, label]) => <tr key={e} className={contract.state === a ? 'live' : ''}><td><code>{NAMES[a]}</code></td><td>{label}</td><td><code>{NAMES[b]}</code></td></tr>)}</tbody></table> : undefined} />
            : sel.id === 'pay'
            ? <div className="ms4-prims"><div className="ms4-ph"><h3>The contract <span>states and the events that move them</span></h3></div><ContractPanel status={contract} scenario={scenario} setScenario={setScenario} /></div>
            : <div className="ms4-prims"><div className="ms4-ph"><h3>Primitives <span>the shared values; this moment’s light up</span></h3></div><Palette lit={lit} pulse={reduce ? 0 : pulse} /></div>}
        </div>
      </div>}
    </section>
  );
}
