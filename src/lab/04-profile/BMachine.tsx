import { useEffect, useRef, useState } from 'react';
import type { AnimationItem } from 'lottie-web';
import { useInView } from './inview';

/* The B study's state machine section (22 Oct), in two tabs: the framework his old page carried — the map of states and
   transitions, redrawn in the page's own ink with the revamped states, and the states in a row with what happens
   between them — and the rig: the phone and its controls built to drive B through its states, as the developers and he
   used it (public/cases/lenskart-b/rig, the same files the row plays).

   The revamped model (the rig, v30): Connecting is the goggles scanning for a network (a loop); Connected is the flip of
   the goggles into the B (its own Lottie, 0.8 s), which lands on Default with an exact cut; Default is the hub — the
   plain B, held only briefly; Listening (rings behind the B, expanding out from behind it), Thinking (the outer ring
   blended into a twisting loop with a travelling dot) and Talking (the voice filling the B) are entered from and left
   through Default by dissolves over the Default B, except Listening ⇄ Thinking, a 750 ms ease-out blend of the ring.
   The B itself scales by state — a 1 s breath of 5% while listening, held at 90% while thinking, swelling up to 8% with
   the voice while talking — and a soft gradient blob sits behind Listening, Thinking and Talking. An unstable network
   plays the flip back to Connecting. */

const A = '/cases/lenskart-b';
type Name = 'connecting' | 'connected' | 'default' | 'listening' | 'thinking' | 'talking' | 'gradient';
type State = Exclude<Name, 'gradient'>;
const files = new Map<Name, Promise<unknown>>();
const data = (n: Name) => { let p = files.get(n); if (!p) { p = fetch(`${A}/b/${n}.json`).then(r => r.json()); files.set(n, p); } return p; };
/* the full SVG build: the gradient blob is three Gaussian-blurred shapes (the light build draws them solid) */
/* the part of the 646 × 800 canvas the B, its rings and its blob use (x, y, w, h); the cells are this shape */
const CROP = '93 150 460 500';
const player = () => import('lottie-web/build/player/lottie_svg').then(m => { m.default.setIDPrefix('lf'); return m.default; });

/* each state as the rig stacks it: the gradient under, the rings or the voice, the Default B above the rings (the B
   itself scaled by CSS as the rig scales it: breath, held, swell) */
type LayerSpec = { n: Name; loop: boolean; cls?: string; flip?: boolean };
const STACK: Record<State, LayerSpec[]> = {
  connecting: [{ n: 'connecting', loop: true }],
  connected: [{ n: 'connected', loop: false, flip: true }],
  default: [{ n: 'default', loop: false }],
  listening: [{ n: 'gradient', loop: true, cls: 'bg' }, { n: 'listening', loop: true }, { n: 'default', loop: false, cls: 'b breath' }],
  thinking: [{ n: 'gradient', loop: true, cls: 'bg' }, { n: 'thinking', loop: true }, { n: 'default', loop: false, cls: 'b held' }],
  talking: [{ n: 'gradient', loop: true, cls: 'bg' }, { n: 'talking', loop: true, cls: 'b swell' }],
};
function BCell({ state, on }: { state: State; on: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const anims = useRef<AnimationItem[]>([]);
  const onRef = useRef(on); onRef.current = on;
  useEffect(() => {
    const root = ref.current; if (!root) return; let dead = false; const timers: number[] = [];
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    (async () => {
      const [lottie, ...ds] = await Promise.all([player(), ...STACK[state].map(l => data(l.n))]);
      if (dead) return;
      STACK[state].forEach((l, i) => {
        const el = root.children[i] as HTMLElement;
        const a = lottie.loadAnimation({ container: el, renderer: 'svg', loop: l.loop, autoplay: false, animationData: structuredClone(ds[i]), rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: false } });
        anims.current.push(a);
        a.addEventListener('DOMLoaded', () => { const svg = el.querySelector('svg'); if (svg) { svg.setAttribute('viewBox', CROP); svg.style.overflow = 'visible'; } }); /* the canvas cropped to the B and its rings, every layer alike, so the cells show the B at a readable size */
        const frames = a.totalFrames;
        if (still || frames <= 1) { a.addEventListener('DOMLoaded', () => a.goToAndStop(0, true)); return; }
        if (l.flip) { /* the flip, a hold, the flip back (an unstable network), a hold — over and over */
          a.addEventListener('complete', () => { timers.push(window.setTimeout(() => { if (!onRef.current) return; if (a.playDirection === 1) { a.setDirection(-1); a.play(); } else { a.setDirection(1); a.goToAndPlay(0, true); } }, a.playDirection === 1 ? 1400 : 900)); });
        }
        if (onRef.current) a.play(); else a.goToAndStop(0, true);
      });
    })();
    return () => { dead = true; timers.forEach(clearTimeout); anims.current.forEach(a => a.destroy()); anims.current = []; };
  }, [state]);
  useEffect(() => { /* plays only on screen; a flip that was waiting resumes from where it stopped */
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches; if (still) return;
    anims.current.forEach(a => { if (a.totalFrames <= 1) return; if (on) { if (a.isPaused) a.play(); } else a.pause(); });
  }, [on]);
  return <div ref={ref} className={`bst ${state}`} aria-hidden="true">{STACK[state].map((l, i) => <div key={i} className={`bst-l${l.cls ? ' ' + l.cls : ''}`} />)}</div>;
}

/* the row his page had under the drawing, as he laid it out (25 Oct, Nitish: "the Lotties in the bottom area … the exact
   same visualization, with our text … the one you made had a lot of cramped text … the names of the states in a
   container with a background"): his five states left to right — Connecting, Connected, Talking, Listening, Thinking —
   the B's Lotties for each; over each arrow what happens there, in his words: the time (0 ms, his cut marked by two
   bars; 250 ms) and the two opacities crossing, in the system's marking pills, staggered as his were; his "Scale 1.5"
   over Talking; each state's name in a chip under it */
const ROW: { s: State; name: string; scale?: string; to?: { t: string; cut?: boolean; tags?: [string, string] } }[] = [
  { s: 'connecting', name: 'Connecting state', to: { t: '0 ms', cut: true } },
  { s: 'connected', name: 'Connected state', to: { t: '250 ms', tags: ['opacity 0 → 1', 'opacity 1 → 0'] } },
  { s: 'talking', name: 'Talking state', scale: 'Scale 1.5', to: { t: '250 ms', tags: ['opacity 0 → 1', 'opacity 1 → 0'] } },
  { s: 'listening', name: 'Listening state', to: { t: '250 ms', tags: ['opacity 0 → 1', 'opacity 1 → 0'] } },
  { s: 'thinking', name: 'Thinking state' },
];
function StatesRow() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref);
  return (
    <div className="bsr-wrap">
      <div className="bsr2" ref={ref}>
        {ROW.map((r, i) => (
          <div key={r.s} className="bsr2-item">
            <span className="bsr2-scale" style={{ gridColumn: 2 * i + 1 }}>{r.scale ?? ''}</span>
            <div className="bsr2-cell" style={{ gridColumn: 2 * i + 1 }}><BCell state={r.s} on={on} /></div>
            <span className="bsr2-name" style={{ gridColumn: 2 * i + 1 }}>{r.name}</span>
            {r.to && (
              <div className="bsr2-to" style={{ gridColumn: 2 * i + 2 }} aria-label={`${r.name}, then ${r.to.t}${r.to.tags ? ', ' + r.to.tags.join(', ') : ''}`}>
                <span className="bsr2-t">{r.to.t}</span>
                {r.to.cut && <span className="bsr2-cut" aria-hidden="true"><i /><i /></span>}
                {r.to.tags && <span className="bsr2-tags"><span>{r.to.tags[0]}</span><span>{r.to.tags[1]}</span></span>}
                <svg className="bsr2-arrow" viewBox="0 0 60 12" preserveAspectRatio="none" aria-hidden="true"><path d="M1 6H57" /><path d="M51.6 .6 L57 6 L51.6 11.4" /></svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- the framework: his page's drawing, as he drew it (25 Oct, Nitish: "the framework … doesn't look better than what I
   initially made … the texts are all getting merged, the arrows are not proper. Use it as it is … the text and the
   corner radius of the containers the ones we follow"): his states — Start, Connecting, Connected (the transition
   state), Talking, Idle, Thinking, Listening — and his moves, each a line with a dot at its label and an open chevron
   at its end, traced off his image (Interaction framework, 1921 × 1082) and checked over it. The lines are drawn in
   an SVG in his image's own px; the states and the labels are HTML laid over it at the same places, so they take the
   system's type, radius and curve (case.css .bfw) ---- */
const VB = { x: 40, y: 100, w: 1840, h: 870 }; /* the part of his image the drawing uses */
const px = (x: number) => `${(((x - VB.x) / VB.w) * 100).toFixed(3)}%`, py = (y: number) => `${(((y - VB.y) / VB.h) * 100).toFixed(3)}%`;
type Pt = [number, number];
const FW_NODES: { k: string; b: [number, number, number, number]; t: string; sub?: string }[] = [
  { k: 'start', b: [65, 360, 132, 80], t: 'Start' },
  { k: 'connecting', b: [413, 360, 292, 80], t: 'Connecting state' },
  { k: 'connected', b: [895, 360, 285, 115], t: 'Connected state', sub: '(Transition state)' },
  { k: 'talking', b: [1435, 360, 226, 77], t: 'Talking state' },
  { k: 'idle', b: [1600, 118, 187, 80], t: 'Idle state' },
  { k: 'thinking', b: [1402, 552, 246, 77], t: 'Thinking state' },
  { k: 'listening', b: [1547, 776, 253, 79], t: 'Listening state' },
];
const seg = (a: Pt, b: Pt): Pt[] => [a, [a[0] + (b[0] - a[0]) / 3, a[1] + (b[1] - a[1]) / 3], [a[0] + 2 * (b[0] - a[0]) / 3, a[1] + 2 * (b[1] - a[1]) / 3], b];
/* each move: its cubic, where his dot sits (snapped to the curve), its label — where his was, anchored at its middle
   ('c'), its left ('l') or its right ('r') */
const FW_EDGES: { p: Pt[]; dot: Pt; t: string[]; at: Pt; an: 'c' | 'l' | 'r' }[] = [
  { p: seg([205, 398], [388, 398]), dot: [290, 398], t: ['Model loading'], at: [298, 366], an: 'c' },
  { p: seg([712, 398], [878, 398]), dot: [790, 398], t: ['Model loaded'], at: [798, 366], an: 'c' },
  { p: seg([1213, 398], [1413, 398]), dot: [1313, 398], t: ['Trigger intro'], at: [1306, 366], an: 'c' },
  { p: [[1492, 342], [1490, 290], [1600, 300], [1610, 228]], dot: [1548, 285], t: ['no voice', 'input'], at: [1472, 266], an: 'l' },
  { p: [[1749, 228], [1750, 290], [1640, 280], [1635, 342]], dot: [1687, 285], t: ['Voice', 'input'], at: [1712, 320], an: 'l' },
  { p: [[1583, 151], [1100, 162], [700, 186], [670, 343]], dot: [1002, 184], t: ['unstable network'], at: [1003, 150], an: 'c' },
  { p: [[1677, 396], [1760, 410], [1815, 620], [1778, 752]], dot: [1786, 573], t: ['Voice', 'input'], at: [1806, 571], an: 'l' },
  { p: [[1736, 750], [1730, 630], [1628, 525], [1590, 450]], dot: [1610, 493], t: ['response', 'loaded'], at: [1640, 490], an: 'l' },
  { p: seg([1562, 762], [1562, 640]), dot: [1562, 701], t: ['processing', 'response'], at: [1542, 713], an: 'r' },
  { p: seg([1622, 640], [1622, 762]), dot: [1622, 701], t: ['Voice', 'input'], at: [1645, 706], an: 'l' },
  { p: [[1462, 445], [1250, 665], [505, 716], [505, 469]], dot: [940, 627], t: ['unstable network'], at: [940, 667], an: 'c' },
  { p: [[1440, 645], [1350, 760], [471, 780], [471, 469]], dot: [1086, 727], t: ['unstable network'], at: [1095, 761], an: 'c' },
  { p: [[1564, 873], [1450, 960], [435, 960], [435, 471]], dot: [1304, 915], t: ['unstable network'], at: [1312, 948], an: 'c' },
];
const bz = (p: Pt[], t: number): Pt => { const u = 1 - t; return [u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0], u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]]; };
const snap = (p: Pt[], d: Pt): Pt => { let best = p[0], bd = Infinity; for (let i = 0; i <= 200; i++) { const q = bz(p, i / 200), e = (q[0] - d[0]) ** 2 + (q[1] - d[1]) ** 2; if (e < bd) { bd = e; best = q; } } return best; };
const g1 = (n: number) => n.toFixed(1);
function StateMap() {
  return (
    <div className="bfw-wrap">
      <div className="bfw" role="img" aria-label="The state machine: Start, Connecting, Connected (the transition state), Talking, Idle, Thinking and Listening, and the moves between them">
        <svg className="bfw-lines" viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} aria-hidden="true">
          {FW_EDGES.map((e, i) => {
            const [a, b, c, d] = e.p, dot = snap(e.p, e.dot), ang = Math.atan2(d[1] - c[1], d[0] - c[0]) * 180 / Math.PI;
            return (
              <g key={i}>
                <path d={`M${g1(a[0])} ${g1(a[1])} C${g1(b[0])} ${g1(b[1])} ${g1(c[0])} ${g1(c[1])} ${g1(d[0])} ${g1(d[1])}`} />
                <path className="head" d="M-12 -11.5 L0 0 L-12 11.5" transform={`translate(${g1(d[0])} ${g1(d[1])}) rotate(${g1(ang)})`} />
                <circle className="dot" cx={g1(dot[0])} cy={g1(dot[1])} r="9" />
              </g>
            );
          })}
        </svg>
        {FW_NODES.map(n => (
          <div key={n.k} className="bfw-node" style={{ left: px(n.b[0]), top: py(n.b[1]), width: `${((n.b[2] / VB.w) * 100).toFixed(3)}%`, height: `${((n.b[3] / VB.h) * 100).toFixed(3)}%` }}>
            <b>{n.t}</b>{n.sub && <small>{n.sub}</small>}
          </div>
        ))}
        {FW_EDGES.map((e, i) => <span key={i} className={`bfw-lbl ${e.an}`} style={{ left: px(e.at[0]), top: py(e.at[1]) }}>{e.t.map((l, k) => <span key={k}>{l}</span>)}</span>)}
        {/* his cursor on the drawing, as his page had it: "Devs love me for this" */}
        <span className="bfw-cursor" style={{ left: px(470), top: py(758) }} aria-hidden="true"><svg viewBox="0 0 14 20"><path d="M1 1 L1 16.4 L5 12.8 L8 19 L10.8 17.8 L7.9 11.7 L13.2 11.2 Z" /></svg></span>
        <span className="bfw-tag" style={{ left: px(337), top: py(830) }}>Devs love me for this</span>
      </div>
    </div>
  );
}

/* ---- the rig, in a frame: the page the developers ran, kept as it was, its colours handed down from the page ---- */
const hex = (c: string) => { const m = c.trim().match(/^#([0-9a-f]{6})$/i); return m ? [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16)) : null; };
const mix = (a: string, b: string, t: number) => { const A = hex(a), B = hex(b); if (!A || !B) return a; return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
function Rig({ host }: { host: React.RefObject<HTMLElement | null> }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState(800);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const el = host.current, fr = frame.current; if (!el || !fr) return;
    /* the page's greys, read off the card, mixed as its panels are (color-mix in case.css); sent whenever the theme turns */
    const send = () => {
      const cs = getComputedStyle(el); const open = cs.getPropertyValue('--pcard-open').trim(), ink = cs.getPropertyValue('--pcard-open-ink').trim(), hl = cs.getPropertyValue('--nav-hl').trim(), hlInk = cs.getPropertyValue('--nav-hl-ink').trim();
      const t = { ground: 'transparent', panel: mix(open, ink, .05), line: mix(open, ink, .14), ink, 'ink-2': mix(open, ink, .7), 'ink-3': mix(open, ink, .5), chip: mix(open, ink, .09), 'chip-on': hl, accent: hl, 'accent-ink': hlInk, focus: hl, 'phone-shadow': '0 24px 48px -20px rgba(0,0,0,.3), 0 0 0 1px rgba(0,0,0,.06)' };
      fr.contentWindow?.postMessage({ tokens: t }, location.origin);
    };
    const onLoad = () => { setReady(true); send(); };
    fr.addEventListener('load', onLoad);
    const it04 = el.closest('.it04'); const mo = it04 ? new MutationObserver(send) : null; if (it04 && mo) mo.observe(it04, { attributes: true, attributeFilter: ['class', 'style'] });
    const onMsg = (e: MessageEvent) => { if (e.source === fr.contentWindow && e.data && typeof e.data.rigHeight === 'number') setH(Math.max(400, Math.min(2200, e.data.rigHeight))); };
    addEventListener('message', onMsg);
    return () => { fr.removeEventListener('load', onLoad); mo?.disconnect(); removeEventListener('message', onMsg); };
  }, [host]);
  return (
    <div className={`brig${ready ? ' ready' : ''}`}>
      <iframe ref={frame} className="brig-frame" src={`${A}/rig/index.html?embed`} title="B's state rig: the phone and the controls that drive it through its states" style={{ height: h }} loading="lazy" />
      <p className="brig-hint">Keys drive it too: 1–5 and 0 for the states, Q/W/E/R for the results sheet, P plays the scripted conversation.</p>
    </div>
  );
}

export default function BMachine() {
  const [tab, setTab] = useState<'framework' | 'rig'>('framework');
  const host = useRef<HTMLDivElement>(null);
  return (
    <div className="bm" ref={host}>
      <div className="bm-tabs" role="tablist" aria-label="State machine">
        <button type="button" role="tab" aria-selected={tab === 'framework'} className={tab === 'framework' ? 'on' : ''} onClick={() => setTab('framework')}>The framework</button>
        <button type="button" role="tab" aria-selected={tab === 'rig'} className={tab === 'rig' ? 'on' : ''} onClick={() => setTab('rig')}>The rig</button>
      </div>
      {tab === 'framework' ? (
        <div className="bm-panel" role="tabpanel">
          <StateMap />
          <StatesRow />
        </div>
      ) : (
        <div className="bm-panel" role="tabpanel"><Rig host={host} /></div>
      )}
    </div>
  );
}
