import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { PROJECTS } from '../../lib/data';
import { CASES, type Block, type Media, type Rich, type Step } from './cases';
import './case.css';

/* 04's case study (Nitish, 21 Oct): a company project opened from the Projects row or the home stack. His Framer site
   opened a project as a sheet over the home page; here it takes the page's place with the nav staying, as the other
   sections do. The page follows his old layout more closely than the first cut did (21 Oct, second pass: "I'm
   skeptical about the sticky bar … things are getting cramped … take a lot of reference from my initial portfolio"):
   no panel at the side — the page's head as on the other sections (the back link and the title at the left, the
   one-liner at the right), then, scrolling in full width, the hero slot with an information strip under it (the four
   facts his page listed there — role, type, team, focus — and the tags), then the sections as cards in the theme's light
   grey. Every visual is an empty slot of its shape — a wide video, a photo, a phone screen upright or on its side —
   labelled with what goes in it, to be filled with what he sends. The Final flow's screens are steps wired to each
   other with drawn curves, as his page had them, rather than stacked. One spacing scale runs through the page (the
   --s1…--s5 tokens in case.css). The text styles are the system's: H2 for the title, the open card's display size for a
   section's heading, body emphasised for a sub-heading, body for copy, meta for captions, labels and facts. */

const text = (r: Rich): ReactNode => r.map((x, i) => (typeof x === 'string' ? x : <b key={i}>{x.b}</b>));
const RATIO: Record<Media['shape'], string> = { wide: '2 / 1', video: '16 / 9', image: '4 / 3', phone: '9 / 19.5', 'phone-land': '19.5 / 9', small: '3 / 2' };

function Slot({ m, fl }: { m: Media; fl?: string }) {
  return (
    <div className={`cs4-media ${m.shape}`} data-fl={fl} style={{ aspectRatio: m.ratio ?? RATIO[m.shape] }} role="img" aria-label={`${m.label} (to come)`}>
      {m.src ? null : <span className="cs4-slot">{m.label}</span>}
    </div>
  );
}
const Fig = ({ m, cls, fl }: { m: Media; cls?: string; fl?: string }) => (
  <figure className={`cs4-fig ${m.shape}${cls ? ' ' + cls : ''}`} data-fl={fl}><Slot m={m} fl={fl && fl + '.m'} />{m.cap && <figcaption>{m.cap}</figcaption>}</figure>
);

/* the flow: steps in a column; a curve runs from each step's last screen to the next step's heading, and between two
   screens of one step — measured after layout (and on resize), drawn in the card's ink, faint, with a small head */
function Flow({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const [size, setSize] = useState<[number, number]>([0, 0]);
  useLayoutEffect(() => {
    const root = ref.current; if (!root) return;
    const draw = () => {
      const R = root.getBoundingClientRect(); const box = (sel: string) => { const el = root.querySelector<HTMLElement>(`[data-fl="${sel}"]`); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left - R.left, y: r.top - R.top, w: r.width, h: r.height }; };
      const out: string[] = [];
      const vS = (x1: number, y1: number, x2: number, y2: number) => `M${x1.toFixed(1)} ${y1.toFixed(1)} C${x1.toFixed(1)} ${((y1 + y2) / 2).toFixed(1)}, ${x2.toFixed(1)} ${((y1 + y2) / 2).toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
      const hS = (x1: number, y1: number, x2: number, y2: number) => `M${x1.toFixed(1)} ${y1.toFixed(1)} C${((x1 + x2) / 2).toFixed(1)} ${y1.toFixed(1)}, ${((x1 + x2) / 2).toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
      steps.forEach((s, i) => {
        /* between the screens of one step: side by side, or one under the other on the phone */
        for (let j = 1; j < s.media.length; j++) {
          const a = box(`${i}.${j - 1}.m`), b = box(`${i}.${j}.m`), af = box(`${i}.${j - 1}`); if (!a || !b || !af) continue;
          if (b.y >= a.y + a.h - 2) out.push(vS(af.x + af.w / 2, af.y + af.h, b.x + b.w / 2, b.y - 6)); /* under the caption, to the next screen's top */
          else out.push(hS(a.x + a.w, a.y + a.h / 2, b.x - 6, b.y + b.h / 2)); /* screen to screen, at mid height */
        }
        /* to the next step's heading */
        if (i < steps.length - 1) { const a = box(`${i}.${s.media.length - 1}`), t = box(`${i + 1}.t`); if (a && t) out.push(vS(a.x + a.w / 2, a.y + a.h, t.x + t.w / 2, t.y - 8)); } /* from under the caption to above the heading */
      });
      setPaths(out); setSize([R.width, R.height]);
    };
    draw(); const ro = new ResizeObserver(draw); ro.observe(root); root.querySelectorAll('[data-fl]').forEach(el => ro.observe(el)); return () => ro.disconnect();
  }, [steps]);
  return (
    <div className="cs4-flow" ref={ref}>
      <svg className="cs4-wires" width={size[0]} height={size[1]} viewBox={`0 0 ${size[0]} ${size[1]}`} aria-hidden="true">
        <defs><marker id="cs4-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1 L8 5 L1 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></marker></defs>
        {paths.map((d, i) => <path key={i} d={d} markerEnd="url(#cs4-head)" />)}
      </svg>
      {steps.map((s, i) => (
        <div key={s.title} className={`cs4-step${s.text ? ' with-text' : ''}${s.side ? ' with-side' : ''}`}>
          <h4 className="cs4-sub step" data-fl={`${i}.t`}>{s.title}</h4>
          {s.text && <div className="cs4-group">{s.text.map((b, k) => <Render key={k} b={b} />)}</div>}
          <div className="cs4-screens">{s.media.map((m, j) => <Fig key={j} m={m} fl={`${i}.${j}`} />)}</div>
          {s.side && <div className="cs4-group side">{s.side.map((b, k) => <Render key={k} b={b} />)}</div>}
        </div>
      ))}
    </div>
  );
}

function Render({ b }: { b: Block }) {
  switch (b.k) {
    case 'p': return <p className="cs4-p">{text(b.t)}</p>;
    case 'h': return <h4 className={`cs4-sub${b.center ? ' center' : ''}`}>{b.t}</h4>;
    case 'ul': return <ul className="cs4-ul">{b.items.map((it, i) => <li key={i}>{text(it)}</li>)}</ul>;
    case 'ol': return <ol className="cs4-ol">{b.items.map((it, i) => <li key={i}><b>{it.lead}</b> {text(it.t)}</li>)}</ol>;
    case 'media': return <Slot m={b} />;
    case 'figure': return <Fig m={b.of} cls={b.width} />;
    case 'row': return <div className={`cs4-row${b.align === 'center' ? ' center' : ''}`} style={{ gridTemplateColumns: b.ratio ?? `repeat(${b.of.length}, minmax(0, 1fr))` }}>{b.of.map((x, i) => <Render key={i} b={x} />)}</div>;
    case 'phones': return <div className="cs4-phones">{b.of.map((m, i) => <Fig key={i} m={m} />)}</div>;
    case 'group': return <div className="cs4-group">{b.of.map((x, i) => <Render key={i} b={x} />)}</div>;
    case 'stats': return (
      <div className={`cs4-stats${b.tone ? ' ' + b.tone : ''}`}>
        {b.title && <h4 className="cs4-sub">{b.title}</h4>}
        <ul>{b.items.map(s => <li key={s.l}><span className="n">{s.n}</span><span className="l">{s.l}</span></li>)}</ul>
      </div>
    );
    case 'legend': return <ul className="cs4-legend">{b.items.map((t, i) => <li key={t}><i className={`sw s${i}`} aria-hidden="true" />{t}</li>)}</ul>;
    case 'cols': return (
      <div className="cs4-cols">
        {b.of.map(c => <div key={c.h} className="cs4-col"><h4 className="cs4-sub">{c.h}</h4><p className="cs4-p">{text(c.p)}</p><ul className="cs4-ul">{c.ul.map((it, i) => <li key={i}>{text(it)}</li>)}</ul></div>)}
      </div>
    );
    case 'flow': return <Flow steps={b.steps} />;
  }
}

export default function Case04({ id, back }: { id: string; back: () => void }) {
  const p = PROJECTS.find(p => p.id === id);
  const c = CASES[id];
  if (!p) return null;
  return (
    <section className="pp4 cs4" aria-label={p.title}>
      <header className="pp4-head cs4-head">
        <div className="cs4-title">
          <button type="button" className="cs4-back" onClick={back}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H6M12 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Projects</button>
          <h2 className="h2-4">{c?.title ?? p.title}</h2>
        </div>
        <div className="pp4-right"><p className="pp4-note">{c?.sub ?? p.blurb}</p></div>
      </header>
      <div className="cs4-body">
        {c ? (<>
          {c.hero && <div className="cs4-hero"><Slot m={c.hero} /></div>}
          {/* the information strip under the hero, as his page had it: the facts in columns, the tags at the end */}
          <dl className="cs4-strip">
            <div><dt>Client</dt><dd>{p.client} · {p.year}</dd></div>
            {c.facts.map(f => <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>)}
            <div className="cs4-tags"><dt>Tags</dt><dd><ul className="cs4-chips">{c.chips.map(t => <li key={t}>{t}</li>)}</ul></dd></div>
          </dl>
          {c.sections.map(s => (
            <section key={s.id} data-sec={s.id} className="cs4-sec" aria-label={s.title}>
              <h3 className="cs4-h">{s.title}</h3>
              {s.blocks.map((b, i) => <Render key={i} b={b} />)}
            </section>
          ))}
        </>) : (
          <div className="cs4-soon">Case study to come</div>
        )}
      </div>
    </section>
  );
}
