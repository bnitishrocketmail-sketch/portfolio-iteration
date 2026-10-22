import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { animate } from 'motion/react';
import { Lottie } from '../../components/micro/Lottie';
import Signature04 from './Signature04';
import BMachine from './BMachine';
import Fintech3D, { Launches3D } from './Fintech3D';
import { useInView } from './inview';
import desk from '../../assets/nitish-desk.webp';
import { PROJECTS } from '../../lib/data';
import { CASES, type Block, type Layer, type Media, type Rich, type Step } from './cases';
import { MAIL, SOCIAL } from './social';
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

const f2 = (n: number) => n.toFixed(1);
const text = (r: Rich): ReactNode => r.map((x, i) => (typeof x === 'string' ? x : <b key={i}>{x.b}</b>));
const RATIO: Record<Media['shape'], string> = { wide: '2 / 1', video: '16 / 9', image: '4 / 3', phone: '9 / 19.5', 'phone-land': '19.5 / 9', small: '3 / 2', screen: '9 / 14.5' };
function Clip({ src, poster, on, crop }: { src: string; poster?: string; on: boolean; crop?: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const still = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => { const v = ref.current; if (!v) return; if (on && !still) v.play().catch(() => {}); else v.pause(); }, [on, still]);
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" aria-hidden="true" style={crop ? { left: `-${crop}%`, top: `-${crop}%`, width: `${100 + 2 * crop}%`, height: `${100 + 2 * crop}%` } : undefined} />; /* a replaced element keeps its own size under inset alone, so the size is spelled out */
}
/* a slot: empty, it shows its shape and its name; filled (22 Oct), it holds the page's own picture or clip, with any
   Lotties layered over it where his page had them */
function Slot({ m, fl, active = true }: { m: Media; fl?: string; active?: boolean /* false holds a clip or Lottie still (the hero's screens at the sides) */ }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref) && active;
  const clip = !!m.src && /\.mp4$/.test(m.src);
  const filled = !!(m.src || m.lottie);
  return (
    <div ref={ref} className={`cs4-media ${m.shape}${filled ? ' filled' : ''}${m.lottie ? ' lot' : ''}`} data-fl={fl} style={{ aspectRatio: m.ratio ?? RATIO[m.shape] }} role="img" aria-label={filled ? `${m.cap ?? m.label}` : `${m.label} (to come)`}>
      {m.src ? (clip ? <Clip src={m.src} poster={m.poster} on={on} crop={m.crop} /> : <img src={m.src} alt="" loading="lazy" decoding="async" style={m.crop ? { left: `-${m.crop}%`, top: `-${m.crop}%`, width: `${100 + 2 * m.crop}%`, height: `${100 + 2 * m.crop}%` } : undefined} />) : m.lottie ? <Lottie className="cs4-lot" src={m.lottie} playing={on} /> : <span className="cs4-slot">{m.label}</span>}
      {m.layers?.filter(l => !l.over).map((l, i) => <LayerBox key={i} l={l} on={on} />)}
    </div>
  );
}
/* a layer by its box: a Lottie or a picture; a Lottie is fetched once its slot has been on screen (the fintech page's
   six cells carry 3 MB of them) */
function LayerBox({ l, on }: { l: Layer; on: boolean }) {
  const [seen, setSeen] = useState(on);
  useEffect(() => { if (on) setSeen(true); }, [on]);
  return (
    <div className="cs4-layer" style={{ left: `${l.box[0]}%`, top: `${l.box[1]}%`, width: `${l.box[2]}%`, height: `${l.box[3]}%` }}>
      {l.kind === 'lottie' ? (seen && <Lottie className="cs4-lot" src={l.src} playing={on} />) : <img src={l.src} alt="" />}
    </div>
  );
}

/* a figure: the slot and its caption; a layer that runs past the slot (`over`) sits beside the slot, outside its clipping */
function Fig({ m, cls, fl }: { m: Media; cls?: string; fl?: string }) {
  const over = m.layers?.filter(l => l.over);
  const ref = useRef<HTMLElement>(null);
  const on = useInView(ref);
  return (
    <figure ref={ref} className={`cs4-fig ${m.shape}${cls ? ' ' + cls : ''}`} data-fl={fl}>
      {over?.length ? <div className="cs4-over"><Slot m={m} fl={fl && fl + '.m'} />{over.map((l, i) => <LayerBox key={i} l={l} on={on} />)}</div> : <Slot m={m} fl={fl && fl + '.m'} />}
      {m.cap && <figcaption>{m.cap}</figcaption>}
    </figure>
  );
}

/* screens in a row, their wires meeting at one screen under them (his nudges converging on the help menu): a node on
   each screen's bottom edge, the three curves dropping to one chevron over the screen below */
function Converge({ of, to }: { of: Media[]; to: Media }) {
  const ref = useRef<HTMLDivElement>(null);
  const [wires, setWires] = useState<{ d: string; node: [number, number] }[]>([]);
  const [head, setHead] = useState<[number, number] | null>(null);
  const [size, setSize] = useState<[number, number]>([0, 0]);
  useLayoutEffect(() => {
    const root = ref.current; if (!root) return;
    const draw = () => {
      const R = root.getBoundingClientRect(); const box = (sel: string) => { const el = root.querySelector<HTMLElement>(`[data-fl="${sel}"]`); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left - R.left, y: r.top - R.top, w: r.width, h: r.height }; };
      const t = box('to.m'); if (!t) return;
      const tx = t.x + t.w / 2, ty = t.y - 8, GAP = 1.5;
      const out: typeof wires = [];
      of.forEach((_, i) => {
        const a = box(`${i}.m`); if (!a) return;
        const sx = a.x + a.w / 2, sy = a.y + a.h; const my = sy + (ty - sy) * .55;
        out.push({ d: `M${f2(sx)} ${f2(sy)} C${f2(sx)} ${f2(my)}, ${f2(tx)} ${f2(my - (ty - sy) * .15)}, ${f2(tx)} ${f2(ty - GAP)}`, node: [sx, sy] });
      });
      setWires(out); setHead([tx, ty]); setSize([R.width, R.height]);
    };
    draw(); const ro = new ResizeObserver(draw); ro.observe(root); root.querySelectorAll('[data-fl]').forEach(el => ro.observe(el)); return () => ro.disconnect();
  }, [of, to]);
  return (
    <div className="cs4-conv" ref={ref}>
      <svg className="cs4-wires" width={size[0]} height={size[1]} viewBox={`0 0 ${size[0]} ${size[1]}`} aria-hidden="true">
        {wires.map((w, i) => <g key={i}><path d={w.d} /><circle className="ring" cx={w.node[0]} cy={w.node[1]} r="5" /><circle className="core" cx={w.node[0]} cy={w.node[1]} r="3" /></g>)}
        {head && <path className="head" d="M-5.4 -5.9 L0 0 L-5.4 5.9" transform={`translate(${f2(head[0])} ${f2(head[1])}) rotate(90)`} />}
      </svg>
      <div className="cs4-conv-row">{of.map((m, i) => <Fig key={i} m={m} fl={`${i}`} />)}</div>
      <div className="cs4-conv-to"><Fig m={to} fl="to" /></div>
    </div>
  );
}

/* the flow: steps in a column, wired as his page drew them (21 Oct, "the knots should be exactly as they are seen"):
   from a step's last screen to the next step's first screen a 2px line that leaves a ring node inside the screen near
   its bottom, drops, sweeps across above the next heading and drops again to an open chevron just over the next
   screen; between two screens of one step a shorter S from a node in the first's lower right to the second's left
   edge. Measured after layout and on resize; drawn in the card's ink, faint, like his light grey on white. */
function Flow({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  /* a wire: its line (ending short of the head), its node on the screen's border, its head at the end, turned along the line */
  const [wires, setWires] = useState<{ d: string; node: [number, number]; head: [number, number, number] }[]>([]);
  const [size, setSize] = useState<[number, number]>([0, 0]);
  useLayoutEffect(() => {
    const root = ref.current; if (!root) return;
    const draw = () => {
      const R = root.getBoundingClientRect(); const box = (sel: string) => { const el = root.querySelector<HTMLElement>(`[data-fl="${sel}"]`); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left - R.left, y: r.top - R.top, w: r.width, h: r.height }; };
      const f = (n: number) => n.toFixed(1);
      const out: typeof wires = [];
      const GAP = 1.5; /* the line runs up to the head's point (his drawings: the line ends at the chevron's vertex, the arms wide and short) */
      /* drop, sweep across, drop — the two cubics of his big connectors; the line ends GAP above the head, which points down */
      const dropAcross = (sx: number, sy: number, tx: number, ty: number) => { const my = sy + (ty - sy) * .5, ey = ty - GAP; return { d: `M${f(sx)} ${f(sy)} C${f(sx)} ${f(sy)}, ${f(sx)} ${f(my)}, ${f((sx + tx) / 2)} ${f(my)} C${f(tx)} ${f(my)}, ${f(tx)} ${f(ey)}, ${f(tx)} ${f(ey)}`, head: [tx, ty, 90] as [number, number, number] }; };
      /* the short S between two screens; the line ends GAP before the head, which points right */
      const across = (sx: number, sy: number, tx: number, ty: number) => { const ex = tx - GAP, mx = (sx + ex) / 2; return { d: `M${f(sx)} ${f(sy)} C${f(mx)} ${f(sy)}, ${f(mx)} ${f(ty)}, ${f(ex)} ${f(ty)}`, head: [tx, ty, 0] as [number, number, number] }; };
      steps.forEach((s, i) => {
        for (let j = 1; j < s.media.length; j++) {
          const a = box(`${i}.${j - 1}.m`), b = box(`${i}.${j}.m`); if (!a || !b) continue;
          if (b.y >= a.y + a.h - 2) { const sx = a.x + a.w * .7, sy = a.y + a.h; out.push({ ...dropAcross(sx, sy, b.x + b.w * .5, b.y - 6), node: [sx, sy] }); } /* one under the other (the phone): the node on the bottom edge, right of the caption; the head just over the next */
          else { const sx = a.x + a.w, sy = a.y + a.h * .78; out.push({ ...across(sx, sy, b.x - 4, b.y + b.h * .58), node: [sx, sy] }); } /* side by side: the node on the right edge, the head at the next one's left edge */
        }
        if (i < steps.length - 1) {
          const a = box(`${i}.${s.media.length - 1}.m`), b = box(`${i + 1}.0.m`), t = box(`${i + 1}.t`); if (!a || !b || !t) return;
          const sx = a.x + a.w * (a.h > a.w ? .86 : .7), sy = a.y + a.h; /* the node on the screen's bottom edge, right of the caption under it (further right on an upright phone, whose caption fills more of its width) */
          const column = Math.abs((a.x + a.w / 2) - (b.x + b.w / 2)) < 40; /* the phone: the screens in one column, the heading between — the line ends above the heading */
          out.push({ ...(column ? dropAcross(sx, sy, t.x + t.w / 2, t.y - 8) : dropAcross(sx, sy, b.x + b.w * .53, b.y - 8)), node: [sx, sy] });
        }
      });
      setWires(out); setSize([R.width, R.height]);
    };
    draw(); const ro = new ResizeObserver(draw); ro.observe(root); root.querySelectorAll('[data-fl]').forEach(el => ro.observe(el)); return () => ro.disconnect();
  }, [steps]);
  return (
    <div className="cs4-flow" ref={ref}>
      <svg className="cs4-wires" width={size[0]} height={size[1]} viewBox={`0 0 ${size[0]} ${size[1]}`} aria-hidden="true">
        {wires.map((w, i) => (
          <g key={i}>
            <path d={w.d} />
            {/* the head: an open chevron at the line's end — his: arms about 8 long, 96° apart, the line meeting the vertex */}
            <path className="head" d="M-5.4 -5.9 L0 0 L-5.4 5.9" transform={`translate(${f2(w.head[0])} ${f2(w.head[1])}) rotate(${w.head[2]})`} />
            <circle className="ring" cx={w.node[0]} cy={w.node[1]} r="5" /><circle className="core" cx={w.node[0]} cy={w.node[1]} r="3" />
          </g>
        ))}
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

/* the hero (Nitish, 22 Oct): a flat, front-facing phone in the middle — a bezel and its island, nothing more — and the
   three screens taking turns in it. One plays inside; the other two float at its sides, a fifth smaller, in black and
   white and held still. Every few seconds the left one slides into the phone, growing and turning to colour as it goes,
   the one inside slides out to the right, and the right one fades away to come back in at the left — round and round.
   The phone is drawn over the screens, so a screen passes under its bezel on its way in and out. */
const CAR = { hold: 3800, slide: 1, side: .92, tilt: 16, ease: [.3, .1, .25, 1] as [number, number, number, number] };
function Carousel({ of }: { of: Media[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const ghost = useRef<HTMLDivElement>(null);
  const on = useInView(ref, .3);
  /* which screen is at the left, in the phone, at the right — kept in a ref for the loop, in state for what plays and
     for the ghost: a second copy of the right screen, which is what leaves the stage, while the screen itself comes
     back in at the left in the same move (22 Oct: both the leaving and the arriving travel a whole step, together) */
  const first = [of.length - 1, 0, 1].map(i => (i + of.length) % of.length);
  const orderRef = useRef<number[]>(first);
  const [inPhone, setInPhone] = useState(first[1]);
  const [ghostOf, setGhostOf] = useState(first[2]);
  const still = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* the places, a belt of equal steps: further left (unseen), left, the phone, right, further right (unseen); the sides
     a little smaller, close to the phone (22 Oct: the gap halved again, the sides 15% bigger) */
  const places = () => {
    const el = ref.current; const w = el?.querySelector<HTMLElement>('.cs4-car-phone')?.offsetWidth ?? 160;
    const gap = (el?.offsetWidth ?? 900) < w * 2.9 ? w * .03 : w * .048;
    const off = w / 2 + gap + w * CAR.side / 2; /* phone's half, the gap, the side screen's half */
    return { off, L: -off, R: off };
  };
  /* a screen's look, written straight to its style: its place on the belt (x), its size, its turn in perspective — the
     sides turned 16° with their inner edge back — its colour, opacity */
  const put = (el: HTMLElement, x: number, side: number /* 0 in the phone … 1 at a side */, turn: number /* -1 left, 1 right */, opacity = 1) => {
    el.style.transform = `translateX(${x.toFixed(2)}px) scale(${(1 - (1 - CAR.side) * side).toFixed(4)}) rotateY(${(turn * CAR.tilt * side).toFixed(2)}deg)`;
    el.style.filter = `grayscale(${side.toFixed(3)})`; el.style.opacity = opacity.toFixed(3);
  };
  /* put the screens in their places without motion (first paint, a resize); the ghost waits at the right, unseen */
  const settle = () => { const P = places(); const [l, c, r] = orderRef.current; const E = els.current; if (E[l]) put(E[l], P.L, 1, -1); if (E[c]) put(E[c], 0, 0, 0); if (E[r]) put(E[r], P.R, 1, 1); if (ghost.current) put(ghost.current, P.R, 1, 1, 0); };
  useLayoutEffect(() => { settle(); const ro = new ResizeObserver(settle); if (ref.current) ro.observe(ref.current); return () => ro.disconnect(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  /* the ghost shows the right screen's clip at the frame the screen itself stopped at, so the two read as one */
  const syncGhost = () => { const a = els.current[orderRef.current[2]]?.querySelector('video'), g = ghost.current?.querySelector('video'); if (a && g && Math.abs(a.currentTime - g.currentTime) > .05) g.currentTime = a.currentTime; };
  useEffect(() => { const t = setTimeout(syncGhost, 150); return () => clearTimeout(t); }, [ghostOf]); // eslint-disable-line react-hooks/exhaustive-deps
  /* the loop, while on screen: every few seconds the whole belt moves one step to the right as one motion (22 Oct: "the
     same velocity, keeping the same gap") — the left screen into the phone, turning flat and to colour; the one inside
     out to the right, turning away and grey; the right one's ghost further right, fading out; and the right screen
     itself in from further left, fading in — every one of them a whole step */
  useEffect(() => {
    if (!on || still || of.length < 3) return;
    let live = true; let t = 0;
    const step = async () => {
      if (!live) return;
      const P = places(); const [l, c, r] = orderRef.current; const E = els.current, G = ghost.current; if (!E[l] || !E[c] || !E[r] || !G) return;
      syncGhost();
      orderRef.current = [r, l, c]; setInPhone(l); /* the one sliding in starts playing as it goes */
      await animate(0, 1, { duration: CAR.slide, ease: CAR.ease, onUpdate: p => {
        put(E[l]!, P.L + P.off * p, 1 - p, -1);
        put(E[c]!, P.off * p, p, 1);
        put(G, P.R + P.off * p, 1, 1, 1 - p);
        put(E[r]!, P.L - P.off + P.off * p, 1, -1, p);
      } });
      if (!live) return;
      put(G, P.R, 1, 1, 0); setGhostOf(c); /* the ghost takes the new right screen, unseen, with the hold to load it */
      t = window.setTimeout(step, CAR.hold);
    };
    t = window.setTimeout(step, CAR.hold);
    return () => { live = false; clearTimeout(t); };
  }, [on, still, of.length]);
  return (
    <div className="cs4-car" ref={ref}>
      {of.map((m, i) => <div key={i} ref={el => { els.current[i] = el; }} className="cs4-car-item" style={{ zIndex: inPhone === i ? 2 : 1 }}><Slot m={m} active={inPhone === i} /></div>)}
      <div ref={ghost} className="cs4-car-item ghost" aria-hidden="true"><Slot key={ghostOf} m={of[ghostOf]} active={false} /></div>
      {/* the phone: the study's device edge, as every other phone on the page, with an island inside it */}
      <div className="cs4-car-phone" aria-hidden="true"><i className="cs4-island" /></div>
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
      <div className={`cs4-stats${b.tone ? ' ' + b.tone : ''}${b.more ? ' has-more' : ''}`} tabIndex={b.more ? 0 : undefined}>
        {b.title && <h4 className="cs4-sub">{b.title}</h4>}
        <div className="cs4-stats-body">
          <ul>{b.items.map(s => <li key={s.l}><span className="n">{s.n}</span><span className="l">{s.l}</span></li>)}</ul>
          {b.more && <p className="cs4-stats-more">{text(b.more)}</p>} {/* his page's hover: the numbers give way to this */}
        </div>
      </div>
    );
    case 'legend': return <ul className="cs4-legend">{b.items.map((t, i) => <li key={t}><i className={`sw s${i}`} style={b.colors ? { background: b.colors[i] } : undefined} aria-hidden="true" />{t}</li>)}</ul>;
    case 'cols': return (
      <div className="cs4-cols">
        {b.of.map(c => <div key={c.h} className="cs4-col"><h4 className="cs4-sub">{c.h}</h4><p className="cs4-p">{text(c.p)}</p><ul className="cs4-ul">{c.ul.map((it, i) => <li key={i}>{text(it)}</li>)}</ul></div>)}
      </div>
    );
    case 'flow': return <Flow steps={b.steps} />;
    case 'carousel': return <Carousel of={b.of} />;
    /* his FAQ panel: a cut screen, then the questions it raised under their labels */
    case 'faq': return (
      <div className={`cs4-faq n${b.of.length}`}>
        {b.of.map((c, i) => (
          <div key={i} className="cs4-faq-col">
            <Slot m={c.m} />
            {c.qs.map(q => <div key={q.label} className="cs4-faq-q"><span className="cs4-faq-label">{q.label}</span>{q.q.map(t => <p key={t} className="cs4-faq-ask"><i aria-hidden="true" />{t}</p>)}</div>)}
          </div>
        ))}
      </div>
    );
    case 'converge': return <Converge of={b.of} to={b.to} />;
    /* a version: its number and its name as chips, a line, its screens */
    case 'version': return (
      <div className="cs4-ver">
        <div className="cs4-ver-head"><span className="cs4-ver-chip">{b.v}</span><span className="cs4-ver-chip name">{b.name}</span></div>
        <p className="cs4-p">{text(b.text)}</p>
        <div className="cs4-phones ver">{b.of.map((m, i) => <Fig key={i} m={m} />)}</div>
      </div>
    );
    case 'machine': return <BMachine />;
    case 'fintech': return <Fintech3D />;
    case 'launches': return <Launches3D />;
  }
}

export default function Case04({ id, back, onOpen }: { id: string; back: () => void; onOpen: (id: string) => void }) {
  const k = PROJECTS.findIndex(p => p.id === id); const p = PROJECTS[k];
  const c = CASES[id];
  const next = PROJECTS[(k + 1) % PROJECTS.length]; /* the column's top card: the next project (what else it holds, later) */
  /* the head's height, handed to the page: the study starts under it, the column level with the study's first container;
     and the hero's, so the column's first card is as tall as the hero beside it (Nitish, 22 Oct) */
  const root = useRef<HTMLElement>(null), headRef = useRef<HTMLElement>(null), heroRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = root.current, h = headRef.current; if (!el || !h) return;
    const set = () => { el.style.setProperty('--head-h', `${h.offsetHeight}px`); const hero = heroRef.current; if (hero) el.style.setProperty('--hero-h', `${hero.offsetHeight}px`); else el.style.removeProperty('--hero-h'); };
    set(); const ro = new ResizeObserver(set); ro.observe(h); if (heroRef.current) ro.observe(heroRef.current); return () => ro.disconnect();
  }, [id]);
  if (!p) return null;
  return (
    <section className="pp4 cs4" aria-label={p.title} ref={root}>
      {/* the head floats over the scrolling study (22 Oct): the containers pass under it, seen through its glass; the
          one-liner and the tags at its far right */}
      <header className="pp4-head cs4-head" ref={headRef}>
        {/* the bar floats (22 Oct): a card with the standard radius, room above it, and the home page's glass behind it — a
            backdrop blur alone, no tint, so it is seen only when something scrolls under it */}
        <div className="cs4-glass" aria-hidden="true" />
        <div className="cs4-head-in">
        <div className="cs4-title">
          <button type="button" className="cs4-back" onClick={back}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H6M12 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Projects</button>
          <h2 className="h2-4">{c?.title ?? p.title}</h2>
        </div>
        <div className="cs4-side"><p className="pp4-note">{c?.sub ?? p.blurb}</p>{c && <ul className="cs4-chips">{c.chips.map(t => <li key={t}>{t}</li>)}</ul>}</div>
        </div>
      </header>
      <div className="cs4-main">
      <div className="cs4-body">
        {c ? (<>
          {c.hero && <div ref={heroRef} className={`cs4-hero${c.hero.k === 'media' ? '' : c.hero.k === 'fintech' || c.hero.k === 'launches' ? ' fill' : ' block'}`}>{c.hero.k === 'media' ? <Slot m={c.hero} /> : <Render b={c.hero} />}</div>}
          {/* the information strip under the hero, as his page had it: the facts in a row (22 Oct: no tags — the facts say it) */}
          <dl className="cs4-strip">
            <div><dt>Client</dt><dd>{p.client} · {p.year}</dd></div>
            {c.facts.map(f => <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>)}
          </dl>
          {c.sections.map(s => (
            <section key={s.id} data-sec={s.id} className={`cs4-sec${s.tone ? ' ' + s.tone : ''}`} aria-label={s.title}>
              <h3 className="cs4-h">{s.title}</h3>
              {s.blocks.map((b, i) => <Render key={i} b={b} />)}
            </section>
          ))}
        </>) : (
          <div className="cs4-soon">Case study to come</div>
        )}
      </div>
      {/* the column at the right (21 Oct): the home page's column width, level with the first container — the next
          project in a card 70% of the height, and the rest for a second card, its content to come */}
      <aside className="cs4-aside">
        <article className="cs4-next">
          <span className="cs4-eyebrow">Next project</span>
          <h3 className="cs4-next-title">{next.title}</h3>
          <p className="cs4-next-blurb">{next.blurb}</p>
          <span className="cs4-next-meta">{next.client} · {next.year}</span>
          <span className="cs4-next-letter" aria-hidden="true">{next.letter}</span>
          <button type="button" className="pp4-arrow cs4-next-arrow" aria-label={`Open ${next.title}`} onClick={() => onOpen(next.id)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        </article>
        {/* the second card (21 Oct): his old site's contact card, at the foot of its project pages — the photo, the name, a
            line, "Let's talk!" and the links — in 04's parts (the intro's photo disc, its CV button's style, the notch's marks) */}
        <article className="cs4-talk" aria-label="Contact">
          <div className="cs4-talk-head">
            <span className="me4 cs4-me"><img src={desk} alt="" /></span> {/* the portfolio's own photo (22 Oct), as the intro has it */}
            <div className="cs4-talk-who"><b className="cs4-talk-name">Nitish Bhardwaj</b><Signature04 className="cs4-sign" label="Product, motion designer" /></div> {/* his written title, aligned to the name (Signature04.tsx) */}
          </div>
          <p className="cs4-talk-line">If you like what you see or have any questions, feel free to connect anytime.</p> {/* his line, reworded for the handles beside it (22 Oct) */}
          <div className="cs4-talk-row">
            <a className="cv4 cs4-talk-btn" href={MAIL}>Let's talk!</a>
            <div className="links4 cs4-links">{SOCIAL.filter(l => l.label !== 'Email').map(l => <a key={l.label} href={l.href} aria-label={l.label} title={l.label} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener"><svg viewBox={l.box} aria-hidden="true"><path d={l.path} fill="currentColor" /></svg></a>)}</div>
          </div>
        </article>
      </aside>
      </div>
    </section>
  );
}
