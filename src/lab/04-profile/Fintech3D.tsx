import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Lottie } from '../../components/micro/Lottie';
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
const SW = 600, SH = 1304; /* a screen's flat box, in the picture's pixels: ~9 : 19.5, the glass's own shape */
const R = SW * .11; /* the glass's corner, from the mock */

/* the homography from the flat box's corners to the four measured corners, as a CSS matrix3d (transform-origin 0 0) */
function project(quad: number[][]): string {
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
  const h = b.map((v, i) => v / M[i][i]); /* h11 h12 h13 h21 h22 h23 h31 h32 */
  const f = (v: number) => v.toFixed(6);
  return `matrix3d(${f(h[0])}, ${f(h[3])}, 0, ${f(h[6])}, ${f(h[1])}, ${f(h[4])}, 0, ${f(h[7])}, 0, 0, 1, 0, ${f(h[2])}, ${f(h[5])}, 0, 1)`;
}
const MAT = Q.quads.map(project);

/* the scene: the phones' picture on a ground, the two screens' content (drawn flat, SW × SH) carried onto the glass, the
   islands over them. `on` plays the clips and Lotties (in view, or the card's hover); `mini` is the stack card's version */
export function Phones3D({ on: onProp, mini, cls, bg, logo, label, left, right }: { on?: boolean; mini?: boolean; cls: string; bg: string; logo?: string; label: string; left: (on: boolean) => ReactNode; right: (on: boolean) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, .2);
  const on = onProp ?? inView;
  const [k, setK] = useState(.2);
  /* the picture scaled so the phones stand 115% of the card's height (his page cut the top and the foot the same way) */
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const set = () => setK((el.clientHeight * (mini ? 1.35 : 1.15)) / Q.H / Q.k);
    set(); const ro = new ResizeObserver(set); ro.observe(el); return () => ro.disconnect();
  }, [mini]);
  const W = Q.W * Q.k, H = Q.H * Q.k; /* the picture's pixels */
  return (
    <div ref={ref} className={`ft3d ${cls}${mini ? ' mini' : ''}`} style={{ background: bg }} aria-label={label}>
      {logo && <span className="ft3d-logo" aria-hidden="true">{logo}</span>}
      <div className="ft3d-stage" style={{ width: W, height: H, transform: `translate(-50%, 0) scale(${k.toFixed(4)})` }}>
        <img className="ft3d-phones" src="/cases/fintech/phones.webp" alt="" width={W} height={H} draggable={false} />
        <div className="ft3d-scr" style={{ width: SW, height: SH, borderRadius: R, transform: MAT[0] }}>{left(on)}</div>
        <div className="ft3d-scr" style={{ width: SW, height: SH, borderRadius: R, transform: MAT[1] }}>{right(on)}</div>
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

/* MobiKwik: the home screen with the loan nudge in the left phone, the card being prepared in the right */
export default function Fintech3D({ on, mini }: { on?: boolean; mini?: boolean }) {
  return (
    <Phones3D on={on} mini={mini} cls="fin" bg="linear-gradient(100deg, #2b56ec 0%, #4a4df0 55%, #7b3df2 100%)" logo="MobiKwik" label="MobiKwik: the home screen with the loan nudge, and a card being prepared, on two phones"
      left={on => <>
        <img src={`${A}/home.webp`} alt="" draggable={false} />
        <div className="ft3d-lot" style={{ left: '2%', top: '33.4%', width: '96%', height: `${(96 * (150 / 344) * SW / SH).toFixed(1)}%` }}><Lottie src={`${A}/first-user.lottie`} playing={on} /></div>
      </>}
      right={on => <>
        <div className="ft3d-lot" style={{ left: '5%', top: '26%', width: '90%', height: `${(90 * (1200 / 1600) * SW / SH).toFixed(1)}%` }}><Lottie src={`${A}/card.lottie`} playing={on} /></div>
        <div className="ft3d-copy"><b>Your card is being prepared and could take up to 10 minutes.</b><span>We will notify you once it’s ready</span></div>
        <div className="ft3d-lot" style={{ left: '42%', top: '66%', width: '16%', height: `${(16 * SW / SH).toFixed(1)}%` }}><Lottie src={`${A}/dots.lottie`} playing={on} /></div>
      </>} />
  );
}

/* Launches & campaigns (22 Oct): the Phonic guide scrolling in the left phone, the T20 × Hustlr landing in the right,
   on his page's dark ground (green at the left running to navy) */
const L = '/cases/launches';
export function Launches3D({ on, mini }: { on?: boolean; mini?: boolean }) {
  return (
    <Phones3D on={on} mini={mini} cls="lau" bg="linear-gradient(100deg, #07170c 0%, #0b2a15 38%, #0a1230 100%)" label="The Phonic smart-glasses guide and the T20 × Hustlr landing page, on two phones"
      left={on => <ScreenClip src={`${L}/phonic-guide`} on={on} />}
      right={() => <img src={`${L}/hustlr.webp`} alt="" draggable={false} />} />
  );
}
