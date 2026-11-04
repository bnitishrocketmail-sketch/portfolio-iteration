import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react';
import { Lottie } from '../../components/micro/Lottie';
import { useInView } from './inview';

/* the Lottie showcase (4 Nov, Nitish: the old site's home had containers of Lotties under the hero; "we need to
   create a place for them… on this new portfolio"): a second state of the intro picture. On the tag, the floating cards
   zoom past — each drifts a little its own way (the loader to the bottom right, the persuasion animation to the right,
   the success state up and a little left, the assistant to the bottom left), growing as it goes, and fades — so the
   picture seems to come forward; the picture itself steps back 5%, blurs and stops leaning with the pointer. Then the
   showcase's containers float in over it (profile.css, "the showcase").
   The first (his design): a landscape card, no wider than the phone screen plus a quarter, with the screen standing out
   of its top — the screen's lower fifth inside the card, fading out downward so the card's words have their room. The
   card carries a few words only, as the floating cards do (4 Nov: "no heading and description… just a few words").
   The screen is the studies' phone (--ph-w, the island, the device's edge), and it shows the store app's home with a
   campaign banner at the top: Republic Day, Valentine's Day, Mother's Day — three screens taking turns in it, by the
   B study's hero rule (Carousel in Case04: one plays inside, the other two float at its sides, a fifth smaller, tilted,
   in black and white and held still; every few seconds the belt moves one step). The banner Lotties are his, hosted on
   lottie.host; the home page is his screenshot (public/cases/showcase/mb-home.webp), its foot on the screen's foot. The
   banner's empty top band — where the app lays its header — is cropped a little (4 Nov: "a lot of space above the logo…
   we can reduce that"), so the banner takes less of the screen and the categories show under it. */
const EASE_IN = [.2, .8, .2, 1] as const;
const HOME = '/cases/showcase/mb-home.webp';
const BANNERS = [
  { id: 'republic', src: 'https://lottie.host/882ccdef-e7c5-4e6f-aa21-30873a55f95c/nnXPUSinqR.lottie', still: 220, label: 'Republic Week Sale' },
  { id: 'valentine', src: 'https://lottie.host/a5549d2a-18ee-4921-b47e-b2e38c2df968/XYAwi7pLFJ.lottie', still: 307, label: 'Valentine’s Day' },
  { id: 'mother', src: 'https://lottie.host/ac24a6ad-8d75-4134-8c40-e115eeac12ae/nWXZCNoEkA.lottie', still: 399, label: 'Mother’s Day' },
];
/* the belt's rule, the B hero's (Case04 CAR): the hold, the step's length and ease, the sides' size and tilt */
const CAR = { hold: 3800, slide: 1, side: .92, tilt: 16, ease: [.3, .1, .25, 1] as [number, number, number, number] };

/* one screen: the home page, the banner over its top */
function Screen({ b, active }: { b: typeof BANNERS[number]; active: boolean }) {
  return (
    <div className="sc4-scr" role="img" aria-label={`The store app's home with the ${b.label} banner`}>
      <img src={HOME} alt="" draggable={false} />
      <div className="sc4-ban"><Lottie src={b.src} still={b.still} playing={active} /></div>
    </div>
  );
}

/* the three screens taking turns in the phone — the Carousel's loop, for these screens */
function Belt() {
  const ref = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const ghost = useRef<HTMLDivElement>(null);
  const on = useInView(ref, .3);
  const n = BANNERS.length;
  const first = [n - 1, 0, 1];
  const orderRef = useRef<number[]>(first);
  const [inPhone, setInPhone] = useState(first[1]);
  const [ghostOf, setGhostOf] = useState(first[2]);
  const still = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const places = () => {
    const el = ref.current; const w = el?.querySelector<HTMLElement>('.sc4-car-phone')?.offsetWidth ?? 150;
    const gap = w * .048; const off = w / 2 + gap + w * CAR.side / 2;
    return { off, L: -off, R: off };
  };
  const put = (el: HTMLElement, x: number, side: number, turn: number, opacity = 1) => {
    el.style.transform = `translateX(${x.toFixed(2)}px) scale(${(1 - (1 - CAR.side) * side).toFixed(4)}) rotateY(${(turn * CAR.tilt * side).toFixed(2)}deg)`;
    el.style.filter = `grayscale(${side.toFixed(3)})`; el.style.opacity = opacity.toFixed(3);
  };
  const settle = () => { const P = places(); const [l, c, r] = orderRef.current; const E = els.current; if (E[l]) put(E[l], P.L, 1, -1); if (E[c]) put(E[c], 0, 0, 0); if (E[r]) put(E[r], P.R, 1, 1); if (ghost.current) put(ghost.current, P.R, 1, 1, 0); };
  useLayoutEffect(() => { settle(); const ro = new ResizeObserver(settle); if (ref.current) ro.observe(ref.current); return () => ro.disconnect(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!on || still) return;
    let live = true; let t = 0;
    const step = async () => {
      if (!live) return;
      const P = places(); const [l, c, r] = orderRef.current; const E = els.current, G = ghost.current; if (!E[l] || !E[c] || !E[r] || !G) return;
      orderRef.current = [r, l, c]; setInPhone(l);
      await animate(0, 1, { duration: CAR.slide, ease: CAR.ease, onUpdate: p => {
        put(E[l]!, P.L + P.off * p, 1 - p, -1);
        put(E[c]!, P.off * p, p, 1);
        put(G, P.R + P.off * p, 1, 1, 1 - p);
        put(E[r]!, P.L - P.off + P.off * p, 1, -1, p);
      } });
      if (!live) return;
      put(G, P.R, 1, 1, 0); setGhostOf(c);
      t = window.setTimeout(step, CAR.hold);
    };
    t = window.setTimeout(step, CAR.hold);
    return () => { live = false; clearTimeout(t); };
  }, [on, still]);
  return (
    <div className="sc4-car" ref={ref}>
      {BANNERS.map((b, i) => <div key={b.id} ref={el => { els.current[i] = el; }} className="sc4-car-item" style={{ zIndex: inPhone === i ? 2 : 1 }}><Screen b={b} active={inPhone === i} /></div>)}
      <div ref={ghost} className="sc4-car-item ghost" aria-hidden="true"><Screen key={ghostOf} b={BANNERS[ghostOf]} active={false} /></div>
      <div className="sc4-car-phone" aria-hidden="true"><i className="sc4-island" /></div>
    </div>
  );
}

export default function Showcase04({ open }: { open: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="sc4" aria-hidden={!open} inert={!open}>
      <div className="sc4-in">
        <AnimatePresence>
          {open && (
            <motion.div key="camp" className="sc4-card sc4-camp" initial={reduce ? false : { opacity: 0, y: 28, scale: .92 }} animate={{ opacity: 1, y: 0, scale: 1, transition: reduce ? { duration: 0 } : { duration: .62, delay: .3, ease: EASE_IN } }} exit={{ opacity: 0, y: 14, scale: .95, transition: { duration: reduce ? 0 : .26, ease: [.4, 0, 1, 1] } }}>
              <Belt />
              <span className="cap">Campaign banners</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
