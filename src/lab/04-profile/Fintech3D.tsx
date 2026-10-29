import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Lottie } from '../../components/micro/Lottie';
import { LottieCanvas } from '../../components/micro/LottieCanvas';
import { useInView } from './inview';
import Q from './cases/fintech-quads.json';

/* The fintech study's hero (Nitish, 22 Oct): his two phones in perspective — the picture from his page (the mock, with
   its own screens) — with the screens he meant to show drawn into them properly: the MobiKwik home screen with the
   loan nudge in the left phone, the card being prepared in the right one. His page laid flat pictures over the phones,
   so they sat off the screens and could not be clipped; here each screen is a flat box projected onto the screen's
   four corners, measured in the picture (fintech-quads.json: the straight edges of each screen fitted and intersected),
   by a homography written as a CSS matrix3d — so the content, its rounded corners and its motion all lie on the glass.
   The phones' islands are cut from the picture into an overlay drawn over the screens, so they stay on top as they do
   in the mock. The whole composition is drawn at the picture's own size and scaled to the card; in the home stack's
   card it is the same scene, small (`mini`). `on` plays the Lotties (in view, or the card's hover). */

const A = '/cases/fintech';
/* the two scenes' grounds (exported for the Projects page, which reads whether a visual is dark from them) */
export const FIN_BG = 'linear-gradient(100deg, #2b56ec 0%, #4a4df0 55%, #7b3df2 100%)';
export const LAU_BG = 'linear-gradient(100deg, #07170c 0%, #0b2a15 38%, #0a1230 100%)';
const SW = 600, SH = 1304; /* a screen's flat box, in the picture's pixels: ~9 : 19.5, the glass's own shape */
const R = SW * .11; /* the glass's corner, from the mock */

/* the homography from the flat box's corners to the four measured corners: h11 h12 h13 h21 h22 h23 h31 h32 (h33 = 1) */
function homography(quad: number[][]): number[] {
  const src = [[0, 0], [SW, 0], [SW, SH], [0, SH]];
  /* eight equations for the eight unknowns of H (h33 = 1), solved by elimination */
  const M: number[][] = [], b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [X, Y] = quad[i];
    M.push([x, y, 1, 0, 0, 0, -X * x, -X * y]); b.push(X);
    M.push([0, 0, 0, x, y, 1, -Y * x, -Y * y]); b.push(Y);
  }
  const n = 8;
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]]; [b[c], b[p]] = [b[p], b[c]];
    for (let r = 0; r < n; r++) { if (r === c) continue; const f = M[r][c] / M[c][c]; for (let k = c; k < n; k++) M[r][k] -= f * M[c][k]; b[r] -= f * b[c]; }
  }
  return b.map((v, i) => v / M[i][i]);
}
const f6 = (v: number) => v.toFixed(6);
/* as a CSS matrix3d (transform-origin 0 0) */
const project = (h: number[]) => `matrix3d(${f6(h[0])}, ${f6(h[3])}, 0, ${f6(h[6])}, ${f6(h[1])}, ${f6(h[4])}, 0, ${f6(h[7])}, 0, 0, 1, 0, ${f6(h[2])}, ${f6(h[5])}, 0, 1)`;
const map = (h: number[], x: number, y: number): [number, number] => { const w = h[6] * x + h[7] * y + 1; return [(h[0] * x + h[1] * y + h[2]) / w, (h[3] * x + h[4] * y + h[5]) / w]; };
const HS = Q.quads.map(homography);
const MAT = HS.map(project);

/* Safari (29 Oct, Nitish on the phone: "the lotties in the phone screens are actually misaligned"): WebKit can paint a
   perspective transform with its flat (affine) part only — the perspective dropped — so each screen landed a few
   percent off its glass, white spilling over the bezel at one corner (seen in WebKit, the engine of every iPhone
   browser; Chrome and Firefox draw it true). There, each screen is placed instead by the flat transform that fits the
   true projection best (least squares over a 9 × 17 grid of the screen's points), a hair larger (so it covers the glass
   everywhere), and cut to the glass's exact shape — the rounded screen, carried through the true projection, as a
   polygon in the picture's pixels. Both drawn the same in every engine; the content is off its true perspective by
   under 1% of the screen */
const WEBKIT = typeof navigator !== 'undefined' && /AppleWebKit/.test(navigator.userAgent) && !/Chrome\/|Chromium|Edg\/|Firefox/.test(navigator.userAgent);
function flatFit(h: number[]): { m: string; clip: string } {
  /* least squares: X = a x + c y + e, Y = b x + d y + f over the grid */
  const P: [number, number, number, number][] = [];
  for (let i = 0; i <= 8; i++) for (let j = 0; j <= 16; j++) { const x = SW * i / 8, y = SH * j / 16; const [X, Y] = map(h, x, y); P.push([x, y, X, Y]); }
  const solve3 = (A: number[][], r: number[]) => { /* 3 × 3, Cramer */
    const det = (m: number[][]) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const D = det(A); return [0, 1, 2].map(c => det(A.map((row, i) => row.map((v, k) => (k === c ? r[i] : v)))) / D);
  };
  const N = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], rx = [0, 0, 0], ry = [0, 0, 0];
  for (const [x, y, X, Y] of P) { const v = [x, y, 1]; for (let i = 0; i < 3; i++) { for (let k = 0; k < 3; k++) N[i][k] += v[i] * v[k]; rx[i] += v[i] * X; ry[i] += v[i] * Y; } }
  let [a, c, e] = solve3(N, rx), [b, d, f] = solve3(N, ry);
  /* a hair larger about the screen's middle, so the flat box covers the true screen everywhere: the true outline mapped
     back through the flat transform must fall inside the box */
  const det = a * d - b * c, inv = (X: number, Y: number) => { const x = X - e, y = Y - f; return [(d * x - c * y) / det, (-b * x + a * y) / det]; };
  let s = 1; const cx = SW / 2, cy = SH / 2;
  for (let i = 0; i <= 40; i++) for (const [x, y] of [[SW * i / 40, 0], [SW * i / 40, SH], [0, SH * i / 40], [SW, SH * i / 40]]) {
    const [X, Y] = map(h, x, y), [u, w] = inv(X, Y); s = Math.max(s, Math.abs(u - cx) / cx, Math.abs(w - cy) / cy);
  }
  s *= 1.004;
  /* the flat transform with that scale about the middle: T = A · (translate(c) · scale(s) · translate(−c)) */
  const tx = cx - s * cx, ty = cy - s * cy;
  const m = `matrix(${f6(a * s)}, ${f6(b * s)}, ${f6(c * s)}, ${f6(d * s)}, ${f6(a * tx + c * ty + e)}, ${f6(b * tx + d * ty + f)})`;
  /* the glass's exact shape: the rounded screen's outline, through the true projection */
  const pts: [number, number][] = [];
  const arc = (ox: number, oy: number, a0: number) => { for (let k = 0; k <= 8; k++) { const t = a0 + (Math.PI / 2) * k / 8; pts.push(map(h, ox + R * Math.cos(t), oy + R * Math.sin(t))); } };
  arc(SW - R, R, -Math.PI / 2); arc(SW - R, SH - R, 0); arc(R, SH - R, Math.PI / 2); arc(R, R, Math.PI);
  const clip = `polygon(${pts.map(([X, Y]) => `${X.toFixed(1)}px ${Y.toFixed(1)}px`).join(', ')})`;
  return { m, clip };
}
const FLAT = HS.map(flatFit);

/* the scene: the phones' picture on a ground, the two screens' content (drawn flat, SW × SH) carried onto the glass, the
   islands over them. `on` plays the clips and Lotties (in view, or the card's hover); `mini` is the stack card's version */
/* `fit` scales the phones' height against the card's (the default is 1.15, the mini 1.35); `at` is where their middle sits, as a percentage of the card's width (the Projects page's open card puts them right of its text) */
export function Phones3D({ on: onProp, mini, fit, at, cls, bg, logo, label, left, right }: { on?: boolean; mini?: boolean; fit?: number; at?: number; cls: string; bg: string; logo?: string; label: string; left: (on: boolean) => ReactNode; right: (on: boolean) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, .2);
  const on = onProp ?? inView;
  const [k, setK] = useState(.2);
  /* the picture scaled so the phones stand 115% of the card's height (his page cut the top and the foot the same way) */
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const set = () => setK((el.clientHeight * (fit ?? (mini ? 1.35 : 1.15))) / Q.H / Q.k);
    set(); const ro = new ResizeObserver(set); ro.observe(el); return () => ro.disconnect();
  }, [mini, fit]);
  const W = Q.W * Q.k, H = Q.H * Q.k; /* the picture's pixels */
  return (
    <div ref={ref} className={`ft3d ${cls}${mini ? ' mini' : ''}`} style={{ background: bg }} aria-label={label}>
      {logo && <span className="ft3d-logo" aria-hidden="true">{logo}</span>}
      <div className="ft3d-stage" style={{ width: W, height: H, transform: `translate(-50%, 0) scale(${k.toFixed(4)})`, ...(at != null ? { left: `${at}%` } : {}) }}>
        <img className="ft3d-phones" src="/cases/fintech/phones.webp" alt="" width={W} height={H} draggable={false} />
        {WEBKIT ? [left, right].map((draw, i) => (
          <div key={i} className="ft3d-cl" style={{ clipPath: FLAT[i].clip }}><div className="ft3d-scr" style={{ width: SW, height: SH, transform: FLAT[i].m }}>{draw(on)}</div></div>
        )) : <>
          <div className="ft3d-scr" style={{ width: SW, height: SH, borderRadius: R, transform: MAT[0] }}>{left(on)}</div>
          <div className="ft3d-scr" style={{ width: SW, height: SH, borderRadius: R, transform: MAT[1] }}>{right(on)}</div>
        </>}
        <img className="ft3d-island" src="/cases/fintech/island.webp" alt="" width={W} height={H} draggable={false} />
      </div>
    </div>
  );
}
/* a clip on a screen: plays with the scene, from its poster */
function ScreenClip({ src, on }: { src: string; on: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const still = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => { const v = ref.current; if (!v) return; if (on && !still) v.play().catch(() => {}); else v.pause(); }, [on, still]);
  return <video ref={ref} src={`${src}.mp4`} poster={`${src}-poster.webp`} muted loop playsInline preload="metadata" aria-hidden="true" />;
}

/* MobiKwik: the home screen with the loan nudge in the left phone, the card being prepared in the right.
   The left phone as his page had it (25 Oct): the home with its bottom bar laid over the foot (his page's own overlay), and
   his loan card's Lottie — "Get loan up to ₹15 lakh", then higher amount, lower rate, 100% paperless — in his box: centred,
   88.5% of the screen's width at its own 340 : 300, from 48.8% down, its foot meeting the bar's top edge, under the bar
   (the scan button's bump overlaps it, as there). Measured from his page's layout (a 228 × 201 box in a 265 × 560 screen at
   18.5, 273.4), carried into this box (the home is cut 1.5% at each side by the cover fit; the bar is cut the same way).
   The file is his, made in LottieFiles Creator, which lottie-web draws blank, so it plays in LottieFiles' own player
   (LottieCanvas); the copy here drops the layers hidden in it and the assets only they used (503 → 82 KB, every frame the
   same). Held on the finished card (frame 1000) when not playing; until it first plays, that frame is a picture
   (paperless-poster.webp), so the home stack's small card does not load the player until it is hovered. */
export default function Fintech3D({ on, mini, fit, at }: { on?: boolean; mini?: boolean; fit?: number; at?: number }) {
  return (
    <Phones3D on={on} mini={mini} fit={fit} at={at} cls="fin" bg={FIN_BG} logo="MobiKwik" label="MobiKwik: the home screen with the loan nudge, and a card being prepared, on two phones"
      left={on => <>
        <img src={`${A}/home.webp`} alt="" draggable={false} />
        <div className="ft3d-lot" style={{ left: '5.75%', top: '48.8%', width: '88.5%', height: `${(88.5 * (300 / 340) * SW / SH).toFixed(2)}%` }}><LottieCanvas src={`${A}/paperless.lottie`} poster={`${A}/paperless-poster.webp`} playing={on} still={1000} /></div>
        <img className="ft3d-nav" src={`${A}/home-nav.webp`} alt="" draggable={false} />
      </>}
      right={on => <>
        <div className="ft3d-fill" />
        <div className="ft3d-lot" style={{ left: '5%', top: '26%', width: '90%', height: `${(90 * (1200 / 1600) * SW / SH).toFixed(1)}%` }}><Lottie src={`${A}/card.lottie`} playing={on} /></div>
        <div className="ft3d-copy"><b>Your card is being prepared and could take up to 10 minutes.</b><span>We will notify you once it’s ready</span></div>
        <div className="ft3d-lot" style={{ left: '42%', top: '66%', width: '16%', height: `${(16 * SW / SH).toFixed(1)}%` }}><Lottie src={`${A}/dots.lottie`} playing={on} /></div>
      </>} />
  );
}

/* Launches & campaigns (22 Oct): the Phonic guide scrolling in the left phone, the T20 × Hustlr landing in the right,
   on his page's dark ground (green at the left running to navy).
   The right phone plays the landing's hero (Nitish, 26 Oct: the left one plays, so the right one should too): his T20 Fan
   Mania Lottie, from his old home page's Hero Frame (a 360 × 360 square — the dark ground, its arcs turning, the logo, the
   wickets and the line), laid over the landing's picture where it was: the square across the screen's width at its top
   (its first frame matches the picture to 2/255). Its arcs turn, so the picture's top bar — the status bar and the back,
   search, wishlist and bag buttons — is lifted out of the picture onto its own transparent layer (hustlr-top.webp: the
   picture against the Lottie's matching frame, the white parts' alpha recovered at their edges) and drawn over it. */
const L = '/cases/launches';
export function Launches3D({ on, mini, fit, at }: { on?: boolean; mini?: boolean; fit?: number; at?: number }) {
  return (
    <Phones3D on={on} mini={mini} fit={fit} at={at} cls="lau" bg={LAU_BG} label="The Phonic smart-glasses guide and the T20 × Hustlr landing page, on two phones"
      left={on => <ScreenClip src={`${L}/phonic-guide`} on={on} />}
      right={on => <>
        <img src={`${L}/hustlr.webp`} alt="" draggable={false} />
        <div className="ft3d-lot" style={{ left: 0, top: 0, width: '100%', height: `${(SW / SH * 100).toFixed(2)}%` }}><Lottie src={`${L}/t20-hero.lottie`} playing={on} /></div>
        <img className="ft3d-top" src={`${L}/hustlr-top.webp`} alt="" draggable={false} />
      </>} />
  );
}
