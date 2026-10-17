import { useEffect, useRef } from 'react';

/* The assistant's orb (Nitish, 17 Oct, for the Workflow page: "an AI assistant orb … animated continuously in a loop in
   the centre … a triangle-faced sphere, not a smooth sphere … the triangles a little bigger, not too big, not too small
   … rotating on both the axes, X and Y … just strokes, lines as triangles, wires — not solid, so it can be seen through
   … dots, connected with wires, making a triangle, which is every face of the sphere"). A geodesic sphere: the
   icosahedron's 20 faces, each cut into freq² triangles, pushed out onto the sphere. Every corner is a dot, every
   triangle edge a wire; it turns on X and Y at different rates, so over time every face comes round. The far side
   is fainter and thinner than the near side — the only depth cue, so it reads as a sphere and not a flat net.
   Chosen (17 Oct): 80 faces (freq 2) on the Workflow page. The geometry, projection and drawing are shared with the
   Workflow page's orb field (WorkflowOrb04.tsx), which draws the pills' wires to these dots. */

export type V3 = [number, number, number];

/* a class I geodesic sphere: vertices on the unit sphere, and the unique edges of its triangles */
export function geodesic(freq: number) {
  const t = (1 + Math.sqrt(5)) / 2;
  const ico: V3[] = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
  const faces = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  const verts: V3[] = [], index = new Map<string, number>(), seen = new Set<string>(), edges: [number, number][] = [];
  const vert = (p: V3) => {
    const l = Math.hypot(p[0], p[1], p[2]), q: V3 = [p[0] / l, p[1] / l, p[2] / l];
    const k = q.map(c => c.toFixed(5)).join(',');
    let i = index.get(k);
    if (i === undefined) { i = verts.length; verts.push(q); index.set(k, i); }
    return i;
  };
  const edge = (a: number, b: number) => { const k = a < b ? `${a}-${b}` : `${b}-${a}`; if (!seen.has(k)) { seen.add(k); edges.push([a, b]); } };
  for (const [a, b, c] of faces) {
    const A = ico[a], B = ico[b], C = ico[c], g: number[][] = [];
    for (let i = 0; i <= freq; i++) {
      g[i] = [];
      for (let j = 0; j <= freq - i; j++) { const k = freq - i - j; g[i][j] = vert([0, 1, 2].map(d => (A[d] * k + B[d] * i + C[d] * j) / freq) as V3); }
    }
    for (let i = 0; i < freq; i++) for (let j = 0; j < freq - i; j++) {
      const p = g[i][j], q = g[i + 1][j], r = g[i][j + 1];
      edge(p, q); edge(q, r); edge(r, p);
      if (j < freq - i - 1) { const s = g[i + 1][j + 1]; edge(q, s); edge(s, r); }
    }
  }
  return { verts, edges };
}

/* turn about Y, then X, and project with a little perspective (the camera 4 radii away); z is +1 nearest the viewer */
export function projectOrb(verts: V3[], ax: number, ay: number, cx: number, cy: number, R: number): V3[] {
  const sx = Math.sin(ax), cxs = Math.cos(ax), sy = Math.sin(ay), cys = Math.cos(ay), D = 4;
  return verts.map(([x, y, z]) => {
    const x1 = x * cys + z * sy, z1 = -x * sy + z * cys;
    const y2 = y * cxs - z1 * sx, z2 = y * sx + z1 * cxs;
    const k = D / (D - z2);
    return [cx + x1 * R * k, cy - y2 * R * k, z2];
  });
}

export type OrbLook = { dot: number; line: number; fade: number; ink: string; lit?: Set<number> };
/* the far half first, then `middle` (what sits inside the orb — the Workflow page's "AI"), then the near half; the far
   side fainter and thinner. Dots in `lit` (where a wire is attached) are drawn a little larger. */
export function drawOrb(ctx: CanvasRenderingContext2D, P: V3[], edges: [number, number][], o: OrbLook, middle?: () => void) {
  const near = (z: number) => (z + 1) / 2, alpha = (z: number) => 1 - o.fade * (1 - near(z));
  ctx.strokeStyle = o.ink; ctx.fillStyle = o.ink; ctx.lineCap = 'round';
  const es = edges.map(e => [e[0], e[1], (P[e[0]][2] + P[e[1]][2]) / 2] as const).sort((a, b) => a[2] - b[2]);
  const vs = P.map((p, i) => [i, p[2]] as const).sort((a, b) => a[1] - b[1]);
  const half = (front: boolean) => {
    for (const [a, b, z] of es) {
      if ((z >= 0) !== front) continue;
      ctx.globalAlpha = alpha(z) * .9; ctx.lineWidth = o.line * (.55 + .45 * near(z));
      ctx.beginPath(); ctx.moveTo(P[a][0], P[a][1]); ctx.lineTo(P[b][0], P[b][1]); ctx.stroke();
    }
    if (o.dot > 0) for (const [i, z] of vs) {
      if ((z >= 0) !== front) continue;
      const lit = o.lit?.has(i);
      ctx.globalAlpha = lit ? 1 : alpha(z); ctx.beginPath(); ctx.arc(P[i][0], P[i][1], o.dot * (.5 + .5 * near(z)) * (lit ? 1.6 : 1), 0, Math.PI * 2); ctx.fill();
    }
  };
  half(false);
  if (middle) { ctx.globalAlpha = 1; middle(); }
  half(true);
  ctx.globalAlpha = 1;
}

export type OrbProps = {
  freq?: number;   // triangles per icosahedron edge: 2 → 80 faces (larger triangles), 3 → 180, 4 → 320 (smaller)
  speedX?: number; // degrees a second about X
  speedY?: number; // degrees a second about Y
  dot?: number;    // dot radius at the near side, px (0 hides them)
  line?: number;   // wire width at the near side, px
  fade?: number;   // how faint the far side is: 0 = all the same, 1 = the back almost gone
  size?: number;   // the sphere's diameter as a share of the smaller side of its box
  className?: string;
};

/* the orb on its own (the tuning page, /lab/04-orb) */
export default function Orb04({ freq = 2, speedX = 14, speedY = 22, dot = 2.2, line = 1, fade = .78, size = .86, className }: OrbProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const opts = useRef({ speedX, speedY, dot, line, fade, size });
  opts.current = { speedX, speedY, dot, line, fade, size };
  const geo = useRef(geodesic(freq));
  const redraw = useRef<() => void>(() => {});
  useEffect(() => { geo.current = geodesic(freq); redraw.current(); }, [freq]);
  useEffect(() => { redraw.current(); }, [speedX, speedY, dot, line, fade, size]);

  useEffect(() => {
    const cv = canvas.current!, ctx = cv.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let w = 0, h = 0, dpr = 1, raf = 0, last = 0, ax = .5, ay = .6, ink = '#e0e0e0';
    const fit = () => {
      const r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width; h = r.height; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      draw();
    };
    function draw() {
      const o = opts.current; ink = getComputedStyle(cv).color || ink;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      const P = projectOrb(geo.current.verts, ax, ay, w / 2, h / 2, Math.min(w, h) * o.size / 2);
      drawOrb(ctx, P, geo.current.edges, { dot: o.dot, line: o.line, fade: o.fade, ink });
    }
    const tick = (t: number) => {
      const dt = last ? Math.min(.05, (t - last) / 1000) : 0; last = t;
      ax += opts.current.speedX * Math.PI / 180 * dt; ay += opts.current.speedY * Math.PI / 180 * dt;
      draw(); raf = requestAnimationFrame(tick);
    };
    const run = () => { cancelAnimationFrame(raf); last = 0; if (reduce.matches) draw(); else raf = requestAnimationFrame(tick); };
    redraw.current = () => { if (reduce.matches) draw(); };
    const ro = new ResizeObserver(fit); ro.observe(cv);
    reduce.addEventListener('change', run);
    fit(); run();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); reduce.removeEventListener('change', run); };
  }, []);

  return <canvas ref={canvas} className={`orb4${className ? ` ${className}` : ''}`} aria-hidden="true" />;
}
