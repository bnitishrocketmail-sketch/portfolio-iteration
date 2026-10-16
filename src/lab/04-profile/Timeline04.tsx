import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import type { Dev } from './motionTokens';

/* ---- the developer's view of a moment: its tracks on a time axis, interruption, reduced motion, what can be checked ---- */
export default function Timeline04({ dev, pulse, reduce }: { dev: Pick<Dev, 'tracks' | 'note'>; pulse: number; reduce: boolean }) {
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
