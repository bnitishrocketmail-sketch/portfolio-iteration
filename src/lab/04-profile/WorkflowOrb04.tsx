import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { drawOrb, geodesic, projectOrb, type V3 } from './Orb04';
import './orb.css';

/* Variant 2 of the Workflow page (Nitish, 17 Oct). The point of the page: the skills and tools came before today's AI,
   and someone who has them gets more out of an assistant than someone who doesn't — so the assistant sits in the
   middle and the skills and tools are wired into it. The orb (80 faces) turns in the centre with "AI" inside it — the
   orb's far half drawn behind the word, its near half in front, so the word is in the orb.
   (17 Oct, second pass) The pills keep Variant 1's connections to each other — tools to their crafts, the workflows,
   Brief / Build / Review — drawn as before (solid, the model's dashed) and passing behind the orb, not across it. Only
   the skills are wired to the orb: Animation, Interaction design, Script-based motion, State-machine design, Motion
   design system, Prototype & handoff. Their wires never let go: each holds a dot on the side of the orb facing its
   pill for a few seconds, then its end slides across to another dot — each on its own random clock, so the field
   never rewires all at once. A wire whose dot turns round to the back slides on early, which keeps the wiring tied to
   the orb's turning. On first sight the wires reach out one by one. The pills drift slowly, their lines with them.
   Reduced motion: the orb holds still, each skill wired to the dot that faces it, no drift.
   The panel (OrbTuner) is for tuning while we decide, at the side of the page; it goes once the values are settled. */

export type OrbTune = { size: number; freq: number; speedX: number; speedY: number; dot: number; line: number; fade: number; pace: number; float: boolean };
/* the orb's diameter is `size`% of the map's height; the dot and wire sizes are the ones he approved, at the default size,
   and scale with it — the whole orb scales as one, keeping its proportions */
export const TUNE0: OrbTune = { size: 34, freq: 2, speedX: 14, speedY: 22, dot: 2.2, line: 1, fade: .78, pace: 1, float: true };

export type Pin = { id: string; x: number; y: number }; // the pill's centre, in % of the map

export type Link = [string, string, string?]; // two pills, and 'ai' for the model's lines (dashed, fainter)
type Wire = { i: number; v: number; from: number; phase: 'wait' | 'reach' | 'hold' | 'shift'; t0: number; dur: number };
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3), easeInOut = (k: number) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

export function OrbField({ pins, links, wired, mapRef, openId, tune }: { pins: Pin[]; links: Link[]; wired: string[]; mapRef: RefObject<HTMLDivElement | null>; openId: string | null; tune: OrbTune }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const tuneR = useRef(tune); tuneR.current = tune;
  const openR = useRef(openId); openR.current = openId;
  const pinsR = useRef(pins), linksR = useRef(links), wiredR = useRef(wired);
  const geo = useRef(geodesic(tune.freq));
  const redraw = useRef<() => void>(() => {});
  useEffect(() => { geo.current = geodesic(tune.freq); redraw.current(); }, [tune.freq]);
  useEffect(() => { redraw.current(); }, [tune]);

  useEffect(() => {
    const cv = canvas.current!, ctx = cv.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const ps = pinsR.current, idx = Object.fromEntries(ps.map((p, i) => [p.id, i]));
    const links = linksR.current.filter(([a, b]) => a in idx && b in idx).map(([a, b, k]) => [idx[a], idx[b], k === 'ai'] as const);
    let W = 0, H = 0, dpr = 1, raf = 0, last = 0, t = 0, ax = .5, ay = .6, amp = tuneR.current.float ? 1 : 0, ink = '#e0e0e0', font = 'sans-serif';
    /* each pill's drift: a slow, small Lissajous, its own speed and phase */
    const drift = ps.map(() => ({ ax: rand(2.5, 4.5), ay: rand(3, 5), px: rand(7, 12), py: rand(8, 13), fx: rand(0, 6.28), fy: rand(0, 6.28), x: 0, y: 0 }));
    /* the skills' wires: each waits its own short delay, reaches out once, and from then on only slides from dot to dot */
    const wires: Wire[] = wiredR.current.filter(id => id in idx).map(id => ({ i: idx[id], v: -1, from: -1, phase: 'wait', t0: 0, dur: rand(.2, 1.8) }));
    const el = (id: string) => mapRef.current?.querySelector<HTMLElement>(`[data-id="${id}"]`);
    const fit = () => {
      const r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      frame(0);
    };
    /* a dot for a pill: on the near side, on the side of the orb facing the pill, not already taken — one of the best few */
    const pick = (P: V3[], i: number, cx: number, cy: number, R: number, best = false) => {
      const px = ps[i].x / 100 * W - cx, py = ps[i].y / 100 * H - cy, l = Math.hypot(px, py) || 1;
      const taken = new Set(wires.filter(w => w.i !== i && w.v >= 0).map(w => w.v)); // and its own dot, so a shift goes somewhere
      const own = wires.find(w => w.i === i); if (own && own.v >= 0 && !best) taken.add(own.v);
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
      for (const w of wires) {
        if (w.v >= P.length || w.from >= P.length) { w.v = pick(P, w.i, cx, cy, R, true); w.from = -1; w.phase = 'hold'; w.t0 = t; w.dur = rand(1, 3) * o.pace; } // the triangle size changed
        if (still) { if (w.v < 0 || w.phase !== 'hold') { w.v = pick(P, w.i, cx, cy, R, true); w.phase = 'hold'; } continue; }
        const e = t - w.t0;
        if (w.phase === 'wait' && e >= w.dur) { const v = pick(P, w.i, cx, cy, R); if (v >= 0) { w.v = v; w.phase = 'reach'; w.t0 = t; w.dur = .7; } else w.dur += .4; }
        else if (w.phase === 'reach' && e >= w.dur) { w.phase = 'hold'; w.t0 = t; w.dur = rand(2, 6) * o.pace; }
        else if (w.phase === 'hold' && (e >= w.dur || P[w.v][2] < -.05)) { const v = pick(P, w.i, cx, cy, R); if (v >= 0) { w.from = w.v; w.v = v; w.phase = 'shift'; w.t0 = t; w.dur = .9; } else w.dur += .5; }
        else if (w.phase === 'shift' && e >= w.dur) { w.phase = 'hold'; w.from = -1; w.t0 = t; w.dur = rand(3.5, 8) * o.pace; }
      }
      /* the pills' drift, written to the pills (the open one holds where it is, under its card) */
      amp = still ? 0 : amp + ((o.float ? 1 : 0) - amp) * Math.min(1, dt * 2.5);
      ps.forEach((p, i) => {
        const d = drift[i];
        if (openR.current !== p.id) { d.x = amp * d.ax * Math.sin(6.283 * t / d.px + d.fx); d.y = amp * d.ay * Math.sin(6.283 * t / d.py + d.fy); }
        const n = el(p.id); if (n) { n.style.setProperty('--fx', `${d.x.toFixed(2)}px`); n.style.setProperty('--fy', `${d.y.toFixed(2)}px`); }
      });
      /* the pills' own lines, as in Variant 1, under the pills. A line whose straight path would cross the orb bends
         round it instead — a curve through a point just outside the orb, where the line came closest to its centre —
         so it never reads as one of the orb's wires */
      const at = (i: number) => [ps[i].x / 100 * W + drift[i].x, ps[i].y / 100 * H + drift[i].y];
      const Rc = R * 1.3;
      ctx.strokeStyle = ink; ctx.lineWidth = 1;
      for (const [a, b, ai] of links) {
        const [x1, y1] = at(a), [x2, y2] = at(b), vx = x2 - x1, vy = y2 - y1, L2 = vx * vx + vy * vy || 1;
        const s = Math.max(0, Math.min(1, ((cx - x1) * vx + (cy - y1) * vy) / L2)), qx = x1 + vx * s, qy = y1 + vy * s, d = Math.hypot(qx - cx, qy - cy);
        ctx.globalAlpha = ai ? .16 : .28; ctx.setLineDash(ai ? [3, 4] : []);
        ctx.beginPath(); ctx.moveTo(x1, y1);
        if (d < Rc && s > .08 && s < .92) {
          const l = Math.sqrt(L2), nx = d > 1 ? (qx - cx) / d : -vy / l, ny = d > 1 ? (qy - cy) / d : vx / l;
          const px = cx + nx * Rc, py = cy + ny * Rc, u = Math.max(.15, Math.min(.85, s)), m = 2 * u * (1 - u);
          ctx.quadraticCurveTo((px - (1 - u) ** 2 * x1 - u * u * x2) / m, (py - (1 - u) ** 2 * y1 - u * u * y2) / m, x2, y2);
        } else ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      /* the orb, with "AI" between its halves */
      const lit = new Set(wires.filter(w => w.phase === 'hold').map(w => w.v));
      drawOrb(ctx, P, geo.current.edges, { dot: o.dot * k, line: o.line * k, fade: o.fade, ink, lit }, () => {
        ctx.fillStyle = ink; ctx.font = `600 ${Math.round(R * .34)}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('AI', cx, cy + R * .02);
      });
      /* the skills' wires, from the pill (under it — the canvas is below the pills) to the dot it holds, or sliding
         between two dots (both moving with the orb) */
      ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.lineCap = 'round';
      for (const w of wires) {
        if (w.v < 0 || w.phase === 'wait' || openR.current === ps[w.i].id) continue;
        const k = Math.min(1, (t - w.t0) / w.dur), [bx, by] = at(w.i);
        let [ex, ey, ez] = P[w.v];
        if (!still && w.phase === 'shift' && w.from >= 0) { const f = easeInOut(k), [fx, fy, fz] = P[w.from]; ex = fx + (ex - fx) * f; ey = fy + (ey - fy) * f; ez = fz + (ez - fz) * f; }
        const r = !still && w.phase === 'reach' ? easeOut(k) : 1;
        ctx.globalAlpha = .45 * (.55 + .45 * (ez + 1) / 2) * Math.min(1, r * 2.5);
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + (ex - bx) * r, by + (ey - by) * r); ctx.stroke();
      }
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
        <p className="ot4-note">Size is the orb’s diameter as a share of the map’s height; dots and wires scale with it. Rewiring: how long a wire holds a dot before it slides to another (×1 ≈ 3.5–8 s).</p>
      </div>
    ) : <button type="button" className="ot4-chip" onClick={() => setOpen(true)}>Tune orb</button>,
    host,
  );
}
