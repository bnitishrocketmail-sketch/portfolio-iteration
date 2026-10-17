import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { drawOrb, geodesic, projectOrb, type V3 } from './Orb04';
import './orb.css';

/* Variant 2 of the Workflow page (Nitish, 17 Oct). The point of the page: the skills and tools came before today's AI,
   and someone who has them gets more out of an assistant than someone who doesn't — so the assistant sits in the
   middle and the skills and tools are wired into it. The orb (80 faces) turns in the centre with "AI" inside it — the
   orb's far half drawn behind the word, its near half in front, so the word is in the orb. Each pill has one wire to a
   dot of the orb on the side facing it; a wire holds for a few seconds, lets go (it draws back into its pill), and
   after a short pause reaches out to another dot — at random intervals per pill, so the field never rewires all at
   once and never looks busy. A wire whose dot turns round to the back lets go early, which is what keeps the wiring
   tied to the orb's turning. No pill-to-pill wires in this variant ("first just … connected to the dots of this orb,
   not with each other"). The pills drift slowly. Reduced motion: the orb holds still, every pill wired to the dot that
   faces it, no drift.
   The panel (OrbTuner) is for tuning while we decide, at the side of the page; it goes once the values are settled. */

export type OrbTune = { size: number; freq: number; speedX: number; speedY: number; dot: number; line: number; fade: number; pace: number; float: boolean };
/* the orb's diameter is `size`% of the map's height; the dot and wire sizes are the ones he approved, at the default size,
   and scale with it — the whole orb scales as one, keeping its proportions */
export const TUNE0: OrbTune = { size: 34, freq: 2, speedX: 14, speedY: 22, dot: 2.2, line: 1, fade: .78, pace: 1, float: true };

export type Pin = { id: string; x: number; y: number }; // the pill's centre, in % of the map

type Wire = { v: number; phase: 'off' | 'out' | 'on' | 'in'; t0: number; dur: number };
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3), easeIn = (k: number) => k * k * k;

export function OrbField({ pins, mapRef, openId, tune }: { pins: Pin[]; mapRef: RefObject<HTMLDivElement | null>; openId: string | null; tune: OrbTune }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const tuneR = useRef(tune); tuneR.current = tune;
  const openR = useRef(openId); openR.current = openId;
  const pinsR = useRef(pins);
  const geo = useRef(geodesic(tune.freq));
  const redraw = useRef<() => void>(() => {});
  useEffect(() => { geo.current = geodesic(tune.freq); redraw.current(); }, [tune.freq]);
  useEffect(() => { redraw.current(); }, [tune]);

  useEffect(() => {
    const cv = canvas.current!, ctx = cv.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const ps = pinsR.current;
    let W = 0, H = 0, dpr = 1, raf = 0, last = 0, t = 0, ax = .5, ay = .6, amp = tuneR.current.float ? 1 : 0, ink = '#e0e0e0', font = 'sans-serif';
    /* each pill's drift: a slow, small Lissajous, its own speed and phase */
    const drift = ps.map(() => ({ ax: rand(2.5, 4.5), ay: rand(3, 5), px: rand(7, 12), py: rand(8, 13), fx: rand(0, 6.28), fy: rand(0, 6.28), x: 0, y: 0 }));
    /* each pill's wire starts unattached and reaches out after its own short delay, so they arrive one by one */
    const wires: Wire[] = ps.map(() => ({ v: -1, phase: 'off', t0: 0, dur: rand(.2, 2.6) }));
    const el = (id: string) => mapRef.current?.querySelector<HTMLElement>(`[data-id="${id}"]`);
    const fit = () => {
      const r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      frame(0);
    };
    /* a dot for a pill: on the near side, on the side of the orb facing the pill, not already taken — one of the best few */
    const pick = (P: V3[], i: number, cx: number, cy: number, R: number, best = false) => {
      const px = ps[i].x / 100 * W - cx, py = ps[i].y / 100 * H - cy, l = Math.hypot(px, py) || 1;
      const taken = new Set(wires.filter((w, j) => j !== i && w.v >= 0).map(w => w.v));
      const c = P.map((p, v) => ({ v, z: p[2], s: ((p[0] - cx) * px + (p[1] - cy) * py) / (R * l) + .3 * p[2] }))
        .filter(o => o.z > .1 && !taken.has(o.v)).sort((a, b) => b.s - a.s).slice(0, 5);
      return c.length ? (best ? c[0].v : c[Math.floor(Math.random() * c.length)].v) : -1;
    };
    function frame(dt: number) {
      const o = tuneR.current, still = reduce.matches;
      ink = getComputedStyle(cv).color || ink; font = getComputedStyle(cv).fontFamily || font;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, R = H * o.size / 200, k = o.size / TUNE0.size;
      const P = projectOrb(geo.current.verts, ax, ay, cx, cy, R);
      /* the wires' state */
      for (let i = 0; i < ps.length; i++) {
        const w = wires[i];
        if (w.v >= P.length) { w.v = -1; w.phase = 'off'; w.t0 = t; w.dur = rand(.2, 1); } // the triangle size changed
        if (still) { if (w.v < 0 || w.phase !== 'on') { w.v = pick(P, i, cx, cy, R, true); w.phase = 'on'; } continue; }
        const e = t - w.t0;
        if (w.phase === 'off' && e >= w.dur) { const v = pick(P, i, cx, cy, R); if (v >= 0) { w.v = v; w.phase = 'out'; w.t0 = t; w.dur = .65; } else w.dur += .4; }
        else if (w.phase === 'out' && e >= w.dur) { w.phase = 'on'; w.t0 = t; w.dur = rand(3.5, 8) * o.pace; }
        else if (w.phase === 'on' && (e >= w.dur || P[w.v][2] < -.05)) { w.phase = 'in'; w.t0 = t; w.dur = .45; }
        else if (w.phase === 'in' && e >= w.dur) { w.phase = 'off'; w.t0 = t; w.dur = rand(.4, 1.6) * o.pace; w.v = -1; }
      }
      /* the pills' drift, written to the pills (the open one holds where it is, under its card) */
      amp = still ? 0 : amp + ((o.float ? 1 : 0) - amp) * Math.min(1, dt * 2.5);
      ps.forEach((p, i) => {
        const d = drift[i];
        if (openR.current !== p.id) { d.x = amp * d.ax * Math.sin(6.283 * t / d.px + d.fx); d.y = amp * d.ay * Math.sin(6.283 * t / d.py + d.fy); }
        const n = el(p.id); if (n) { n.style.setProperty('--fx', `${d.x.toFixed(2)}px`); n.style.setProperty('--fy', `${d.y.toFixed(2)}px`); }
      });
      /* the orb, with "AI" between its halves */
      const lit = new Set(wires.filter(w => w.phase === 'on').map(w => w.v));
      drawOrb(ctx, P, geo.current.edges, { dot: o.dot * k, line: o.line * k, fade: o.fade, ink, lit }, () => {
        ctx.fillStyle = ink; ctx.font = `600 ${Math.round(R * .34)}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('AI', cx, cy + R * .02);
      });
      /* the wires, from the pill (under it — the canvas is below the pills) to its dot */
      ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.lineCap = 'round';
      ps.forEach((p, i) => {
        const w = wires[i]; if (w.v < 0 || w.phase === 'off' || openR.current === p.id) return;
        const e = t - w.t0, f = still || w.phase === 'on' ? 1 : w.phase === 'out' ? easeOut(Math.min(1, e / w.dur)) : 1 - easeIn(Math.min(1, e / w.dur));
        const bx = p.x / 100 * W + drift[i].x, by = p.y / 100 * H + drift[i].y, [dx, dy, dz] = P[w.v];
        ctx.globalAlpha = .4 * (.55 + .45 * (dz + 1) / 2) * Math.min(1, f * 2.5);
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + (dx - bx) * f, by + (dy - by) * f); ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }
    const tick = (now: number) => {
      const dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now; t += dt;
      ax += tuneR.current.speedX * Math.PI / 180 * dt; ay += tuneR.current.speedY * Math.PI / 180 * dt;
      frame(dt); raf = requestAnimationFrame(tick);
    };
    const run = () => { cancelAnimationFrame(raf); last = 0; if (reduce.matches) frame(0); else raf = requestAnimationFrame(tick); };
    redraw.current = () => { if (reduce.matches) frame(0); };
    const ro = new ResizeObserver(fit); ro.observe(cv);
    reduce.addEventListener('change', run);
    document.fonts?.ready.then(() => frame(0));
    fit(); run();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); reduce.removeEventListener('change', run); };
  }, [mapRef]);

  return <canvas ref={canvas} className="ow4" aria-hidden="true" />;
}

/* the tuning panel: a small button at the side of the page that opens the controls; values shown are the ones to keep */
export function OrbTuner({ tune, setTune, anchor }: { tune: OrbTune; setTune: (t: OrbTune) => void; anchor: RefObject<HTMLElement | null> }) {
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => { setHost(anchor.current?.closest<HTMLElement>('.it04') ?? document.body); }, [anchor]);
  if (!host) return null;
  const set = <K extends keyof OrbTune>(key: K, v: OrbTune[K]) => setTune({ ...tune, [key]: v });
  const slider = (label: string, key: 'size' | 'speedX' | 'speedY' | 'dot' | 'line' | 'fade' | 'pace', min: number, max: number, step: number, unit = '') => (
    <label className="orbl-row"><span>{label}</span><input type="range" min={min} max={max} step={step} value={tune[key]} onChange={e => set(key, +e.target.value)} /><b>{tune[key]}{unit}</b></label>
  );
  return createPortal(
    open ? (
      <div className="ot4 orbl-panel" role="group" aria-label="Tune the orb">
        <div className="ot4-head"><b>Tune the orb</b><button type="button" onClick={() => setTune(TUNE0)}>Reset</button><button type="button" aria-label="Close" onClick={() => setOpen(false)}>×</button></div>
        {slider('Size', 'size', 14, 70, 1, '%')}
        <div className="orbl-seg" role="group" aria-label="Triangle size">
          {([[2, 'Larger'], [3, 'Medium'], [4, 'Smaller']] as const).map(([f, l]) => <button key={f} type="button" aria-pressed={tune.freq === f} className={tune.freq === f ? 'on' : ''} onClick={() => set('freq', f)}>{l}<small>{20 * f * f} faces</small></button>)}
        </div>
        {slider('Turn on X', 'speedX', 0, 60, 1, '°/s')}
        {slider('Turn on Y', 'speedY', 0, 60, 1, '°/s')}
        {slider('Dots', 'dot', 0, 5, .1, 'px')}
        {slider('Wires', 'line', .3, 3, .1, 'px')}
        {slider('Back fades', 'fade', 0, .95, .01)}
        {slider('Rewiring', 'pace', .4, 2.5, .1, '×')}
        <div className="orbl-seg" role="group" aria-label="Pills drift">
          {[true, false].map(f => <button key={String(f)} type="button" aria-pressed={tune.float === f} className={tune.float === f ? 'on' : ''} onClick={() => set('float', f)}>{f ? 'Pills drift' : 'Pills still'}</button>)}
        </div>
        <p className="ot4-note">Size is the orb’s diameter as a share of the map’s height; dots and wires scale with it. Rewiring: how long a wire holds (×1 ≈ 3.5–8 s).</p>
      </div>
    ) : <button type="button" className="ot4-chip" onClick={() => setOpen(true)}>Tune orb</button>,
    host,
  );
}
