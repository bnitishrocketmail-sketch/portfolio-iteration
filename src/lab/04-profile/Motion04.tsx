import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import Phone04, { type PhoneHandle } from './Phone04';
import { DISTANCE, DURATION, EASING, MOMENTS, STAGGER, easeFn, moment, ms, px, type EaseName, type MomentId, type Phase, type Sem } from './motionTokens';
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

type Lit = { duration?: string; easing?: string; distance?: string; use?: Sem['use'] };
function Palette({ lit, pulse }: { lit: Lit; pulse: number }) {
  const durMs = lit.use ? ms(lit.use.duration) : 240, f = easeFn((lit.use?.easing ?? 'standard') as EaseName);
  return (
    <div className="ms4-groups">
      <div className="ms4-col">
        <div className="ms4-g"><h4>Duration</h4>{DURATION.map(d => <DurRow key={d.name} name={d.name} msv={d.ms} on={lit.duration === d.name} pulse={pulse} f={f} />)}</div>
        <div className="ms4-g"><h4>Distance</h4>{DISTANCE.map(d => <DistRow key={d.name} name={d.name} pxv={d.px} on={lit.distance === d.name} pulse={pulse} f={f} durMs={durMs} />)}</div>
      </div>
      <div className="ms4-col">
        <div className="ms4-g"><h4>Easing</h4>{EASING.map(e => <EaseRow key={e.name} name={e.name} value={e.value} on={lit.easing === e.name} pulse={pulse} durMs={durMs} />)}</div>
        <div className="ms4-g"><h4>Stagger</h4>{STAGGER.map(s => <div key={s.name} className="ms4-row" title={s.use}><Key name={s.name} value={`${s.ms} ms`} /><span className="ms4-dots">{Array.from({ length: 6 }, (_, i) => <i key={i} />)}</span></div>)}</div>
      </div>
    </div>
  );
}
function DurRow({ name, msv, on, pulse, f }: { name: string; msv: number; on: boolean; pulse: number; f: (t: number) => number }) {
  const p = useShuttle(pulse, on, msv, f);
  return <div className={`ms4-row${on ? ' on' : ''}`}><Key name={name} value={`${msv} ms`} /><Track p={p} /></div>;
}
function DistRow({ name, pxv, on, pulse, f, durMs }: { name: string; pxv: number; on: boolean; pulse: number; f: (t: number) => number; durMs: number }) {
  const p = useShuttle(pulse, on, durMs, f);
  return <div className={`ms4-row${on ? ' on' : ''}`}><Key name={name} value={`${pxv} px`} /><Track p={p} reach={pxv} /></div>;
}
function EaseRow({ name, value, on, pulse, durMs }: { name: EaseName; value: string; on: boolean; pulse: number; durMs: number }) {
  const f = easeFn(name), p = useShuttle(pulse, on, durMs, f), t = useClock(pulse, on, durMs);
  const X = (v: number) => 4 + v * 32, Y = (v: number) => 33 - v * 26;
  const pts = Array.from({ length: 41 }, (_, i) => `${X(i / 40).toFixed(2)},${Y(f(i / 40)).toFixed(2)}`).join(' ');
  const cx = useTransform(t, X), cy = useTransform(t, v => Y(f(v)));
  return (
    <div className={`ms4-row ease${on ? ' on' : ''}`} title={value}>
      <b className="ms4-n">{name}</b>
      <svg className="ms4-curve" viewBox="0 0 40 40" aria-hidden="true"><path className="ax" d="M4 33H36M4 7H36" /><polyline points={pts} /><motion.circle r="2.2" cx={cx} cy={cy} /></svg>
      <Track p={p} />
    </div>
  );
}

/* ---- the cascade for the moment that just played ---- */
function TokenLine({ s, label, live }: { s: Sem; label: string; live: boolean }) {
  const u = s.use;
  return (
    <div className={`ms4-tl${live ? ' live' : ''}`}>
      <span className="ms4-ph-l">{label}</span>
      <code>{s.token}</code>
      <span className="ms4-chips"><span className="ms4-arr" aria-hidden="true">→</span>
        <span><small>duration</small>{u.duration} · {ms(u.duration)} ms</span>
        <span><small>easing</small>{u.easing}</span>
        {u.distance && <span><small>distance</small>{u.distance} · {px(u.distance)} px</span>}
        {u.note && <span className="note">{u.note}</span>}
      </span>
    </div>
  );
}

export default function Motion04() {
  const reduce = !!useReducedMotion();
  const phone = useRef<PhoneHandle>(null);
  const [sel, setSel] = useState<{ id: MomentId; phase: Phase }>({ id: 'sheet', phase: 'enter' });
  const [pulse, setPulse] = useState(0);
  const onMoment = (id: MomentId, phase: Phase) => { setSel({ id, phase }); setPulse(p => p + 1); };
  const m = moment(sel.id);
  const s = sel.phase === 'exit' && m.exit ? m.exit : m.enter;
  const lit: Lit = { duration: s.use.duration, easing: s.use.easing, distance: s.use.distance, use: s.use };
  /* the phone fits the stage's height */
  const stage = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useLayoutEffect(() => { const el = stage.current; if (!el) return; const fit = () => setK(Math.min(1, el.clientHeight / 582, el.clientWidth / 282)); fit(); const ro = new ResizeObserver(fit); ro.observe(el); return () => ro.disconnect(); }, []);
  const groups = [...new Set(MOMENTS.map(x => x.group))];
  return (
    <section className="pp4 ms4" aria-label="Motion system">
      <header className="pp4-head">
        <h2 className="h2-4">Motion system</h2>
        <div className="pp4-right"><p className="pp4-note">How motion lives in a product: every moment uses a named token, and every token is made of a few shared values.</p></div>
      </header>
      <div className="ms4-grid">
        {/* the product's moments */}
        <div className="ms4-panel ms4-moments">
          <div className="ms4-ph"><h3>Moments</h3><p>What the product does, by the pattern it uses. Tap one, or use the phone.</p></div>
          {groups.map(g => (
            <div key={g} className="ms4-mg">
              <h4>{g}</h4>
              {MOMENTS.filter(x => x.group === g).map(x => (
                <button key={x.id} type="button" className={`ms4-m${sel.id === x.id ? ' on' : ''}`} onClick={() => phone.current?.play(x.id)}>
                  <b>{x.name}</b><span>{x.pattern}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
        {/* the product */}
        <div className="ms4-stage" ref={stage}><div className="ms4-phone" style={{ width: 282 * k, height: 582 * k }}><Phone04 ref={phone} onMoment={onMoment} scale={k} /></div></div>
        {/* its tokens */}
        <div className="ms4-panel ms4-spec">
          <div className="ms4-sel">
            <h3>{m.name} <span>{m.pattern}</span></h3>
            <div className="ms4-tls">
              <TokenLine s={m.enter} label={m.labels[0]} live={sel.phase === 'enter'} />
              {m.exit && <TokenLine s={m.exit} label={m.labels[1] ?? 'Exit'} live={sel.phase === 'exit'} />}
            </div>
            <p className="ms4-why">{m.why}</p>
          </div>
          <div className="ms4-prims">
            <div className="ms4-ph"><h3>Primitives <span>the shared values; this moment’s light up</span></h3></div>
            <Palette lit={lit} pulse={reduce ? 0 : pulse} />
          </div>
        </div>
      </div>
    </section>
  );
}
