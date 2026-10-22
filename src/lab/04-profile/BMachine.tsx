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

/* the row his page had under the map: the states left to right, what happens between them above the arrows, the B's
   scale over the states that scale it (his "Scale: 1.5" over Talking) */
const ROW: { s: State; name: string; scale?: string; to?: [string, string] }[] = [
  { s: 'connecting', name: 'Connecting state', to: ['dots dissolve 200 ms,', 'then the flip · 0.8 s'] },
  { s: 'connected', name: 'Connected state', to: ['exact cut', 'hold 150 ms'] },
  { s: 'default', name: 'Default state', scale: 'scale 100 %', to: ['rings expand from behind B', '700 ms'] },
  { s: 'listening', name: 'Listening state', scale: 'scale 95–100 % · a 1 s breath', to: ['ring blend 750 ms', 'ease-out, both ways'] },
  { s: 'thinking', name: 'Thinking state', scale: 'scale 90 % · held', to: ['dissolve 200 ms', 'over the Default B'] },
  { s: 'talking', name: 'Talking state', scale: 'scale +8 % · swells with the voice' },
];
function StatesRow() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref);
  return (
    <div className="bsr" ref={ref}>
      {ROW.map((r, i) => (
        <div key={r.s} className="bsr-item">
          <div className="bsr-cell" style={{ '--col': 2 * i + 1 } as React.CSSProperties}>
            <span className="bsr-scale">{r.scale ?? ''}</span>
            <BCell state={r.s} on={on} />
            <span className="bsr-name">{r.name}</span>
          </div>
          {r.to && i < ROW.length - 1 && (
            <div className="bsr-arrow" style={{ '--col': 2 * i + 2 } as React.CSSProperties} aria-label={`${r.to[0]} ${r.to[1]}`}>
              <span className="bsr-to">{r.to[0]}<br />{r.to[1]}</span>
              <svg viewBox="0 0 60 12" preserveAspectRatio="none" aria-hidden="true"><path d="M1 6H57" /><path className="head" d="M51.6 .1 L57 6 L51.6 11.9" /></svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---- the map: his page's drawing redrawn — rounded boxes for the states, lines with a dot at their label and an open
   chevron at their end — with the revamped states and the moves the rig makes (the gaps his map left: the hub, the
   way back from listening, thinking and talking, the exact timings) ---- */
type Box = [number, number, number, number, string, string?];
const N: Record<string, Box> = {
  start: [22, 206, 70, 40, 'Start'],
  connecting: [150, 206, 150, 40, 'Connecting state'],
  connected: [370, 198, 170, 56, 'Connected state', '(transition state)'],
  default: [608, 206, 140, 40, 'Default state', '(the hub)'],
  listening: [870, 206, 140, 40, 'Listening state'],
  thinking: [870, 366, 140, 40, 'Thinking state'],
  talking: [608, 366, 140, 40, 'Talking state'],
};
const f = (n: number) => n.toFixed(1);
/* a point on a cubic and its tangent angle */
const bez = (p: number[][], t: number) => { const u = 1 - t; const x = u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0], y = u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]; const dx = 3 * u * u * (p[1][0] - p[0][0]) + 6 * u * t * (p[2][0] - p[1][0]) + 3 * t * t * (p[3][0] - p[2][0]), dy = 3 * u * u * (p[1][1] - p[0][1]) + 6 * u * t * (p[2][1] - p[1][1]) + 3 * t * t * (p[3][1] - p[2][1]); return { x, y, a: Math.atan2(dy, dx) * 180 / Math.PI }; };
type Edge = { p: number[][]; label: string[]; at?: number; dy?: number; dx?: number; anchor?: 'start' | 'middle' | 'end' };
/* straight: a line from a to b; curved: a cubic through its two controls */
const line = (a: number[], b: number[], label: string[], o: Partial<Edge> = {}): Edge => ({ p: [a, [a[0] + (b[0] - a[0]) / 3, a[1] + (b[1] - a[1]) / 3], [a[0] + 2 * (b[0] - a[0]) / 3, a[1] + 2 * (b[1] - a[1]) / 3], b], label, ...o });
const curve = (a: number[], c1: number[], c2: number[], b: number[], label: string[], o: Partial<Edge> = {}): Edge => ({ p: [a, c1, c2, b], label, ...o });
const E: Edge[] = [
  line([92, 226], [150, 226], ['model loading'], { dy: -12 }),
  line([300, 226], [370, 226], ['model loaded'], { dy: -12 }),
  line([540, 226], [608, 226], ['flip lands', 'exact cut'], { dy: -24 }),
  line([748, 226], [870, 226], ['voice input', 'rings expand · 700 ms'], { dy: -24 }),
  line([940, 246], [940, 366], ['processing', 'ring blend · 750 ms'], { dx: 14, dy: -4, anchor: 'start' }),
  line([870, 386], [748, 386], ['response loaded', 'dissolve · 200 ms'], { dy: 18 }),
  line([678, 366], [678, 246], ['done talking', 'dissolve'], { dx: -14, dy: -4, anchor: 'end' }),
  curve([738, 366], [800, 330], [840, 290], [878, 246], ['voice input'], { at: .45, dx: 12, dy: 2, anchor: 'start' }),
  curve([930, 206], [900, 150], [740, 150], [708, 206], ['no voice input', 'dissolve'], { at: .5, dy: -20 }),
  curve([880, 366], [830, 320], [790, 290], [738, 246], ['no response', 'dissolve'], { at: .55, dx: -12, dy: 4, anchor: 'end' }),
  /* an unstable network, from every B state: the flip plays back */
  curve([636, 206], [636, 130], [560, 130], [520, 198], ['unstable network'], { at: .5, dy: -10 }),
  curve([970, 206], [990, 60], [560, 60], [480, 198], ['unstable network'], { at: .5, dy: -10 }),
  curve([648, 406], [640, 470], [560, 470], [500, 254], ['unstable network'], { at: .5, dy: 16 }),
  curve([960, 406], [980, 520], [500, 520], [460, 254], ['unstable network'], { at: .5, dy: 16 }),
  curve([400, 254], [380, 300], [300, 300], [230, 246], ['flip back · the dots dissolve in'], { at: .5, dy: 16 }),
];
function StateMap() {
  return (
    <div className="bmap-wrap">
      <svg className="bmap" viewBox="0 30 1040 510" aria-label="The state map: Start, Connecting, Connected, Default, Listening, Thinking and Talking, and the moves between them">
        {E.map((e, i) => {
          const d = `M${f(e.p[0][0])} ${f(e.p[0][1])} C${f(e.p[1][0])} ${f(e.p[1][1])}, ${f(e.p[2][0])} ${f(e.p[2][1])}, ${f(e.p[3][0])} ${f(e.p[3][1])}`;
          const end = bez(e.p, 1), mid = bez(e.p, e.at ?? .5);
          return (
            <g key={i}>
              <path d={d} />
              <path className="head" d="M-5.4 -5.9 L0 0 L-5.4 5.9" transform={`translate(${f(end.x)} ${f(end.y)}) rotate(${f(end.a)})`} />
              <circle className="dot" cx={f(mid.x)} cy={f(mid.y)} r="3.2" />
              <text className="lbl" x={f(mid.x + (e.dx ?? 0))} y={f(mid.y + (e.dy ?? 0))} textAnchor={e.anchor ?? 'middle'}>
                {e.label.map((l, k) => <tspan key={k} x={f(mid.x + (e.dx ?? 0))} dy={k ? '1.25em' : 0}>{l}</tspan>)}
              </text>
            </g>
          );
        })}
        {Object.entries(N).map(([k, b]) => (
          <g key={k} className={`node ${k}`}>
            <rect x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx="9" />
            <text x={b[0] + b[2] / 2} y={b[1] + b[3] / 2 + (b[5] ? -3 : 0)} textAnchor="middle" dominantBaseline="middle">{b[4]}</text>
            {b[5] && <text className="sub" x={b[0] + b[2] / 2} y={b[1] + b[3] / 2 + 13} textAnchor="middle" dominantBaseline="middle">{b[5]}</text>}
          </g>
        ))}
        {/* his cursor on the drawing: "Devs love me for this" */}
        <g className="cursor" transform="translate(262 330)">
          <path d="M0 0 L0 16 L4.4 12.4 L7.4 19 L10.2 17.8 L7.3 11.3 L12.6 10.8 Z" />
          <rect x="12" y="14" width="124" height="24" rx="8" />
          <text x="74" y="26.5" textAnchor="middle" dominantBaseline="middle">Devs love me for this</text>
        </g>
      </svg>
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
          <ul className="cs4-legend bm-notes" aria-label="Notes">
            <li>Default is the hub: the plain B, held 150 ms after the flip lands</li>
            <li>a gradient blob sits behind Listening, Thinking and Talking</li>
            <li>the labels under the B read Listening… and Talking…</li>
          </ul>
          <StatesRow />
        </div>
      ) : (
        <div className="bm-panel" role="tabpanel"><Rig host={host} /></div>
      )}
    </div>
  );
}
