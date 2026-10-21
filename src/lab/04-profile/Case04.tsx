import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PROJECTS } from '../../lib/data';
import { CASES, type Block, type Media, type Rich } from './cases';
import './case.css';

/* 04's case study (Nitish, 21 Oct): a company project opened from the Projects row or the home stack. His Framer site
   opened a project as a sheet over the home page; here it takes the page's place with the nav staying, as the other
   sections do, and the page is two parts — the project's panel at the left, which stays put, and the case study
   scrolling beside it. The panel is the open project card's information carried over (title, one-liner, tags, client
   and year) with the four facts his page listed under the hero (role, type, team, focus) and the sections as a list
   that follows the scroll and jumps on a click. The case study is his page's sequence of sections, each a card in the
   theme's light grey, every visual an empty slot of its shape — a wide video, a photo, a phone screen upright or on
   its side — labelled with what goes in it, to be filled with what he sends. On the phone the panel sits first and the
   whole page scrolls. The text styles are the system's: H2 for the title, the open card's display size for a section's
   heading, body (emphasised) for a sub-heading, body for copy, meta for captions, labels and facts. */

const text = (r: Rich): ReactNode => r.map((x, i) => (typeof x === 'string' ? x : <b key={i}>{x.b}</b>));
const RATIO: Record<Media['shape'], string> = { wide: '2 / 1', video: '16 / 9', image: '4 / 3', phone: '9 / 19.5', 'phone-land': '19.5 / 9', small: '3 / 2' };

function Slot({ m }: { m: Media }) {
  return (
    <div className={`cs4-media ${m.shape}`} style={{ aspectRatio: m.ratio ?? RATIO[m.shape] }} role="img" aria-label={`${m.label} (to come)`}>
      {m.src ? null : <span className="cs4-slot">{m.label}</span>}
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
    case 'figure': return <figure className={`cs4-fig${b.width ? ' ' + b.width : ''}`}><Slot m={b.of} />{b.of.cap && <figcaption>{b.of.cap}</figcaption>}</figure>;
    case 'row': return <div className={`cs4-row${b.align === 'center' ? ' center' : ''}${b.of.every(x => x.k === 'figure' && x.of.shape === 'phone') ? ' phones' : ''}`} style={{ gridTemplateColumns: b.ratio ?? `repeat(${b.of.length}, minmax(0, 1fr))` }}>{b.of.map((x, i) => <Render key={i} b={x} />)}</div>;
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
  }
}

export default function Case04({ id, back }: { id: string; back: () => void }) {
  const p = PROJECTS.find(p => p.id === id);
  const c = CASES[id];
  const body = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState<string>(c?.sections[0]?.id ?? '');
  /* the list follows the scroll: the last section whose top has passed a third of the way down the scrolling part */
  useEffect(() => {
    const el = body.current; if (!el || !c) return;
    const pick = () => {
      const r = el.getBoundingClientRect(); const line = r.top + r.height * .33;
      let best = c.sections[0].id;
      el.querySelectorAll<HTMLElement>('[data-sec]').forEach(s => { if (s.getBoundingClientRect().top <= line) best = s.dataset.sec!; });
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) best = c.sections[c.sections.length - 1].id; /* at the end, the last */
      setCur(best);
    };
    pick(); el.addEventListener('scroll', pick, { passive: true }); return () => el.removeEventListener('scroll', pick);
  }, [c]);
  const jump = (sid: string) => { const el = body.current?.querySelector<HTMLElement>(`[data-sec="${sid}"]`); el?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); };
  if (!p) return null;
  return (
    <section className="cs4" aria-label={p.title}>
      <aside className="cs4-side">
        <button type="button" className="cs4-back" onClick={back}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H6M12 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Projects</button>
        <div className="cs4-head">
          <h2 className="h2-4">{c?.title ?? p.title}</h2>
          <p className="cs4-lede">{c?.sub ?? p.blurb}</p>
          <span className="cs4-meta">{p.client} · {p.year}</span>
        </div>
        <ul className="cs4-chips">{(c?.chips ?? p.tags).map(t => <li key={t}>{t}</li>)}</ul>
        {c && (
          <dl className="cs4-facts">{c.facts.map(f => <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>)}</dl>
        )}
        {c && (
          <nav className="cs4-toc" aria-label="Sections">
            <ol>{c.sections.map((s, i) => <li key={s.id} className={cur === s.id ? 'on' : ''}><button type="button" onClick={() => jump(s.id)}><span className="cs4-n">{String(i + 1).padStart(2, '0')}</span>{s.title}</button></li>)}</ol>
          </nav>
        )}
      </aside>
      <div className="cs4-body" ref={body}>
        {c ? (<>
          {c.hero && <div className="cs4-hero"><Slot m={c.hero} /></div>}
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
