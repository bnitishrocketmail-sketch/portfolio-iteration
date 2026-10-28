import { useEffect, useRef, useState, type RefObject } from 'react';
import { SlideGroup } from './SlidePill04';
import { createPortal } from 'react-dom';
import { drawOrb, geodesic, projectOrb, type V3 } from './Orb04';
import { useFiveTaps } from './secret';
import './orb.css';

/* Variant 2 of the Workflow page (Nitish, 17 Oct). The point of the page: the skills and tools came before today's AI,
   and someone who has them gets more out of an assistant than someone who doesn't — so the assistant sits in the
   middle and the skills and tools are wired into it. The orb (80 faces) turns in the centre with "AI" inside it — the
   orb's far half drawn behind the word, its near half in front, so the word is in the orb.
   (17 Oct, second pass) The pills keep Variant 1's connections to each other — tools to their crafts, the workflows,
   Brief / Build / Review — drawn as before (solid, the model's dashed) and bending round the orb, not across it.
   (Third pass) Only the tools are wired to the orb — After Effects, Lottie, Rive, Protopie, Figma, Code (the skills
   were, on the second pass); which pills are wired is the page's `wired` list. The wires never let go: each holds a dot on the side of the orb facing its
   pill for a few seconds, then its end slides across to another dot — each on its own random clock, so the field
   never rewires all at once. A wire whose dot turns round to the back slides on early, which keeps the wiring tied to
   the orb's turning. On first sight the wires reach out one by one. The pills drift slowly, their lines with them.
   (Fourth pass, "to look a little cleaner"; corrected the same afternoon — it had been pairs and trios, five at once)
   The orb's wires come and go in a fixed rhythm, at most three at a time, from tools and skills alike: two connect
   together and a third just after; then the two disconnect and two new ones connect; while those are connecting the
   third disconnects, and just after, a new third connects — and again. The pills are chosen at random each time (not
   the ones that just let go). A wire grows out of its pill to a dot facing it, holds it (sliding on only if the dot
   turns round to the back), and fades. Reduced motion: the orb holds still, three wires to the dots facing them.
   The panel (OrbTuner) is for tuning while we decide, at the side of the page; it goes once the values are settled. */

export type OrbTune = { size: number; freq: number; speedX: number; speedY: number; dot: number; line: number; fade: number; pace: number; float: boolean; drift?: number }; // drift: a scale on how far the pills float (the phone halves it)
/* the orb's diameter is `size`% of the map's height; the dot and wire sizes are the ones he approved, at the default size,
   and scale with it — the whole orb scales as one, keeping its proportions */
export const TUNE0: OrbTune = { size: 21, freq: 2, speedX: 14, speedY: 22, dot: 2.2, line: .5, fade: .78, pace: 1, float: true }; /* the wires .5 px by default (28 Oct, Nitish; was 1) */

export type Pin = { id: string; x: number; y: number }; // the pill's centre, in % of the map

export type Link = [string, string, string?]; // two pills, and 'ai' for the model's lines (dashed, fainter)
type Wire = { i: number; v: number; from: number; phase: 'idle' | 'reach' | 'hold' | 'shift' | 'fade'; t0: number; dur: number };
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
    /* one wire per wired pill, idle until its pill is chosen for a group */
    const wires: Wire[] = wiredR.current.filter(id => id in idx).map(id => ({ i: idx[id], v: -1, from: -1, phase: 'idle', t0: 0, dur: 0 }));
    /* the rhythm, as a queue of timed steps: the pair, the third, and each cycle's swaps */
    let pair: number[] = [], third = -1, recent = new Set<number>();
    const queue: { at: number; run: () => void }[] = [];
    const step = Math.ceil(wires.length / 3), stillSet = new Set(wires.map((_, j) => j).filter(j => j % step === 0)); // reduced motion's three
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
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * o.size / 200, k = o.size / TUNE0.size; // the orb's diameter: `size`% of the map's smaller side (its height on the desktop; its width on the phone's tall map)
      const P = projectOrb(geo.current.verts, ax, ay, cx, cy, R);
      /* the wires' state */
      for (const w of wires) if (w.v >= P.length || w.from >= P.length) { w.from = -1; w.v = w.phase === 'idle' ? -1 : pick(P, w.i, cx, cy, R, true); if (w.phase === 'shift') w.phase = 'hold'; } // the triangle size changed
      if (still) wires.forEach((w, j) => {
        if (!stillSet.has(j)) { w.phase = 'idle'; w.v = -1; return; }
        if (w.v < 0 || w.phase !== 'hold') { w.v = pick(P, w.i, cx, cy, R, true); w.from = -1; w.phase = 'hold'; }
      });
      else {
        /* the rhythm — never more than three: two connect together and a third just after; each cycle the two let go
           and two new ones connect, the third lets go while they are connecting, and a new third connects just after */
        const choose = (n: number) => {
          const free = wires.map((_, j) => j).filter(j => wires[j].phase === 'idle' && openR.current !== ps[wires[j].i].id);
          const fresh = free.filter(j => !recent.has(j)), from = fresh.length >= n ? fresh : free;
          for (let a = from.length - 1; a > 0; a--) { const b = Math.floor(Math.random() * (a + 1)); [from[a], from[b]] = [from[b], from[a]]; }
          return from.slice(0, n);
        };
        const grow = (js: number[]) => js.forEach((j, q) => { const w = wires[j]; w.v = -1; w.from = -1; w.phase = 'reach'; w.t0 = t + q * .06; w.dur = .6; });
        const letGo = (js: number[]) => js.forEach(j => { const w = wires[j]; if (w.phase !== 'idle') { w.phase = 'fade'; w.t0 = t; w.dur = .45; } });
        const cycle = (c: number) => queue.push(
          { at: c, run: () => { recent = new Set([...pair, third]); letGo(pair); } },             // the two let go
          { at: c + .45, run: () => { pair = choose(2); grow(pair); } },                          // two new ones connect
          { at: c + .75, run: () => { if (third >= 0) letGo([third]); } },                        // the third lets go, while they connect
          { at: c + 1.2, run: () => { third = choose(1)[0] ?? -1; if (third >= 0) grow([third]); if (!queue.length) cycle(t + rand(2.2, 3.2) * tuneR.current.pace); } },
        );
        if (!queue.length && !pair.length) queue.push(                                           // the start: two, then the third
          { at: t + .4, run: () => { pair = choose(2); grow(pair); } },
          { at: t + 1, run: () => { third = choose(1)[0] ?? -1; if (third >= 0) grow([third]); cycle(t + rand(2.2, 3.2) * tuneR.current.pace); } },
        );
        for (const w of wires) {
          const e = t - w.t0;
          if (w.phase === 'reach') {
            if (w.v < 0 && e >= 0) { w.v = pick(P, w.i, cx, cy, R); if (w.v < 0) { w.phase = 'idle'; continue; } }
            if (e >= w.dur) w.phase = 'hold';
          } else if (w.phase === 'hold' && w.v >= 0 && P[w.v][2] < -.05) { const v = pick(P, w.i, cx, cy, R); if (v >= 0) { w.from = w.v; w.v = v; w.phase = 'shift'; w.t0 = t; w.dur = .9; } }
          else if (w.phase === 'shift' && e >= w.dur) { w.phase = 'hold'; w.from = -1; }
          else if (w.phase === 'fade' && e >= w.dur) { w.phase = 'idle'; w.v = -1; w.from = -1; }
        }
        while (queue.length && queue[0].at <= t) queue.shift()!.run(); // after the wires settle, so a wire that has faded is gone before its successor starts
      }
      /* the pills' drift, written to the pills (the open one holds where it is, under its card) */
      amp = still ? 0 : amp + ((o.float ? (o.drift ?? 1) : 0) - amp) * Math.min(1, dt * 2.5);
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
        ctx.fillStyle = ink; ctx.font = `600 ${Math.round(R * .425)}px ${font}`; /* a quarter bigger (28 Oct, Nitish: "1.5x bigger"; was .34 of the radius) */ ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('AI', cx, cy + R * .02);
      });
      /* the wires, from the pill (under it — the canvas is below the pills) to the dot it holds, growing out, sliding
         between two dots (both moving with the orb) or fading */
      ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.lineCap = 'round';
      let shown = 0;
      for (const w of wires) {
        if (w.v < 0 || w.phase === 'idle' || openR.current === ps[w.i].id || t < w.t0) continue;
        shown++;
        const k = Math.min(1, (t - w.t0) / w.dur), [bx, by] = at(w.i);
        let [ex, ey, ez] = P[w.v];
        if (!still && w.phase === 'shift' && w.from >= 0) { const f = easeInOut(k), [fx, fy, fz] = P[w.from]; ex = fx + (ex - fx) * f; ey = fy + (ey - fy) * f; ez = fz + (ez - fz) * f; }
        const r = !still && w.phase === 'reach' ? easeOut(k) : 1;
        ctx.globalAlpha = .45 * (.55 + .45 * (ez + 1) / 2) * Math.min(1, r * 2.5) * (!still && w.phase === 'fade' ? 1 - k : 1);
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + (ex - bx) * r, by + (ey - by) * r); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (cv.dataset.wires !== String(shown)) cv.dataset.wires = String(shown); // how many orb wires show (for checking the rhythm)
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
  const five = useFiveTaps('tune', !open); /* hidden in place until tapped five times (28 Oct; secret.ts) */
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
        <SlideGroup className="orbl-seg" role="group" aria-label="Triangle size">
          {([[2, 'Larger'], [3, 'Medium'], [4, 'Smaller']] as const).map(([f, l]) => <button key={f} type="button" aria-pressed={tune.freq === f} className={tune.freq === f ? 'on' : ''} onClick={() => set('freq', f)}>{l}<small>{20 * f * f} faces</small></button>)}
        </SlideGroup>
        {slider('Turn on X', 'speedX', 0, 60, 1, '°/s')}
        {slider('Turn on Y', 'speedY', 0, 60, 1, '°/s')}
        {slider('Dots', 'dot', 0, 5, .1, 'px')}
        {slider('Wires', 'line', .3, 3, .1, 'px')}
        {slider('Back fades', 'fade', 0, .95, .01)}
        {slider('Rewiring', 'pace', .4, 2.5, .1, '×')}
        <SlideGroup className="orbl-seg" role="group" aria-label="Pills drift">
          {[true, false].map(f => <button key={String(f)} type="button" aria-pressed={tune.float === f} className={tune.float === f ? 'on' : ''} onClick={() => set('float', f)}>{f ? 'Pills drift' : 'Pills still'}</button>)}
        </SlideGroup>
        <p className="ot4-note">Size is the orb’s diameter as a share of the map’s height; dots and wires scale with it. Rewiring: how long the three hold before the next swap (×1 ≈ 2.2–3.2 s).</p>
      </div>
    ) : <button type="button" className={`ot4-chip${five.hidden ? ' secret4' : ''}`} tabIndex={five.hidden ? -1 : undefined} onClickCapture={five.capture} onClick={() => setOpen(true)}>Tune orb</button>,
    host,
  );
}
