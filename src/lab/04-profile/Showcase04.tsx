import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
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
/* the eight floating cards round the phone (4 Nov, Nitish: his hosted Lotties, "create them similarly as there are the rest
   of the floating containers on the first… side of the home page… the padding from the corners and everything… the same
   way like we did for the intro cards… the names… what kind of a Lottie visual it is… corner radiuses, if any of these
   doesn't have"): the intro cards' glass and caption, each Lottie in a box of its own shape with the micro card's corners
   (half the standard radius — the sale banner and the T20 page had square ones); their places are tokens (--sc-<id>-x/y,
   the centre, % of the picture; the phone's own, where two show by default). `lw` is the box's width */
const CARDS: { id: string; label: string; src: string; still: number; w: number; h: number; lw: number; plw: number; round?: boolean; crop?: string }[] = [ /* lw: the box's width in cqw, plw: on the phone in px; round: the file's corners are square, so the box rounds them; crop: the box is this part of the canvas ("x y w h") */
  { id: 'splash', label: 'Splash screen', src: 'https://lottie.host/eefce00b-b527-45d7-91c4-d9e9ff3b2bae/RLHZEVAu99.lottie', still: 266, w: 400, h: 500, lw: 9.6, plw: 70, round: true },
  { id: 't20', label: 'Campaign|landing page', src: 'https://lottie.host/bcf5542a-77a0-48aa-a743-ed79fb84d80a/1P6ByfieyT.lottie', still: 497, w: 360, h: 360, lw: 11, plw: 70, round: true },
  { id: 'avatars', label: '3D avatars', src: 'https://lottie.host/66b797f3-eccf-4de5-99dd-d2d166fe5f8b/ymFeJeiMZA.lottie', still: 270, w: 656, h: 245, lw: 14.4, plw: 115, crop: '0 56 656 245' }, /* the box is the dark card inside the canvas (y 56–301 of 328, measured); the characters' heads spill above it, as they do in the file */
  { id: 'insta', label: 'Instagram store', src: 'https://lottie.host/d8e6ae3a-09f6-4405-8d24-cffb5a303bf7/p5EAoC17eD.lottie', still: 358, w: 328, h: 164, lw: 14.4, plw: 115 },
  { id: 'view360', label: '360° view feature', src: 'https://lottie.host/124c7e10-cb74-4302-b5c5-730a7f0103d2/PZADq44JAU.lottie', still: 225, w: 324, h: 248, lw: 11, plw: 88 },
  { id: 'sale1', label: 'Sale banner', src: 'https://lottie.host/fd58bb53-7af6-44f1-84ee-3792ca7d898a/ZjKjPHjBUB.lottie', still: 179, w: 1126, h: 1126, lw: 9.2, plw: 58, round: true },
]; /* the offer banner (Stock Up) and the try-on feature were here, hidden; taken out (4 Nov, Nitish: "remove them for now… so that they don't take a lot of space on the memory") — their files: 1a9e93eb…/vtZFgfU7J2.lottie (600 × 600) and f1d3fb66…/pF3zSKEDC8.lottie (328 × 437) */
function Card({ c, i }: { c: typeof CARDS[number]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, 0);
  const reduce = useReducedMotion();
  return (
    <motion.div ref={ref} className={`sc4-flo ${c.id}`} initial={reduce ? false : { opacity: 0, y: 22, scale: .92 }} animate={{ opacity: 1, y: 0, scale: 1, transition: reduce ? { duration: 0 } : { duration: .58, delay: .42 + i * .06, ease: EASE_IN } }} exit={{ opacity: 0, y: 10, scale: .95, transition: { duration: reduce ? 0 : .22, ease: [.4, 0, 1, 1] } }}>
      <div className="fl4-in" style={{ '--dur': `${5.4 + (i % 4) * .5}s`, '--dl': `${-(i * .7)}s` } as CSSProperties}>
        <div className={`lot${c.round ? ' round' : ''}`} style={{ aspectRatio: `${c.w} / ${c.h}`, '--lw': c.lw, '--plw': `${c.plw}px` } as CSSProperties}><Lottie src={c.src} still={c.still} playing={on} viewBox={c.crop} label={c.label.replace('|', ' ')} /></div>
        <span className="cap">{c.label.split('|').map((t, k) => k ? <><br />{t}</> : t)}</span>
      </div>
    </motion.div>
  );
}

/* the belt's rule, the B hero's (Case04 CAR): the hold, the step's length and ease, the sides' size and tilt */
const CAR = { hold: 3800, slide: 1, side: .92, sideA: .2, tilt: 16, ease: [.3, .1, .25, 1] as [number, number, number, number] };

/* one screen: the home page, the banner over its top */
function Screen({ b, active }: { b: typeof BANNERS[number]; active: boolean }) {
  return (
    <div className="sc4-scr" role="img" aria-label={`The store app's home with the ${b.label} banner`}>
      <img src={HOME} alt="" draggable={false} />
      <div className="sc4-ban"><Lottie src={b.src} still={b.still} playing={active} holdFrame /></div>
    </div>
  );
}

/* the three screens taking turns in the phone — the Carousel's loop, for these screens. The phone is a window (4 Nov,
   Nitish: "it should be 100 inside the mask… when it is outside and getting inside, there should not be any opacity
   fading"): the belt is drawn twice — once across the stage, every screen grey and at a fifth, and once inside a box
   the phone's exact shape that clips to it, every screen in colour and whole — moved as one. So whatever part of a
   screen is inside the phone is full, and whatever is outside is faint, with no fade along the way; a screen passes
   into the phone the way it passes under the B hero's bezel. A screen plays while it is in the phone, and while it is
   leaving; parked at a side it pauses where it is. */
function Belt({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const wins = useRef<(HTMLDivElement | null)[]>([]);
  const ghost = useRef<HTMLDivElement>(null);
  const on = useInView(ref, .3);
  const n = BANNERS.length;
  const first = [n - 1, 0, 1];
  const orderRef = useRef<number[]>(first);
  const [inPhone, setInPhone] = useState(first[1]);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [ghostOf, setGhostOf] = useState(first[2]);
  const still = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const places = () => {
    const el = ref.current; const w = el?.parentElement?.querySelector<HTMLElement>('.sc4-car-phone')?.offsetWidth ?? 150;
    const gap = w * .048; const off = w / 2 + gap + w * CAR.side / 2;
    return { off, L: -off, R: off };
  };
  /* a screen's place on the belt (x), its size and its turn, written to both its copies; the stage copy grey and faint
     (the extra factor is the ghost's and the arriving screen's fade at the belt's far ends), the window copy as it is */
  const put = (i: number | HTMLElement, x: number, side: number, turn: number, opacity = 1) => {
    const t = `translateX(${x.toFixed(2)}px) scale(${(1 - (1 - CAR.side) * side).toFixed(4)}) rotateY(${(turn * CAR.tilt * side).toFixed(2)}deg)`;
    const o = typeof i === 'number' ? els.current[i] : i, w = typeof i === 'number' ? wins.current[i] : null;
    if (o) { o.style.transform = t; o.style.opacity = (CAR.sideA * opacity).toFixed(3); }
    if (w) { w.style.transform = t; }
  };
  const settle = () => { const P = places(); const [l, c, r] = orderRef.current; put(l, P.L, 1, -1); put(c, 0, 0, 0); put(r, P.R, 1, 1); if (ghost.current) put(ghost.current, P.R, 1, 1, 0); };
  useLayoutEffect(() => { settle(); const ro = new ResizeObserver(settle); if (ref.current) ro.observe(ref.current); return () => ro.disconnect(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!on || still) return;
    let live = true; let t = 0;
    const step = async () => {
      if (!live) return;
      const P = places(); const [l, c, r] = orderRef.current; const G = ghost.current; if (!G) return;
      orderRef.current = [r, l, c]; setInPhone(l); setLeaving(c);
      await animate(0, 1, { duration: CAR.slide, ease: CAR.ease, onUpdate: p => {
        put(l, P.L + P.off * p, 1 - p, -1);
        put(c, P.off * p, p, 1);
        put(G, P.R + P.off * p, 1, 1, 1 - p);
        put(r, P.L - P.off + P.off * p, 1, -1, p);
      } });
      if (!live) return;
      put(G, P.R, 1, 1, 0); setGhostOf(c); setLeaving(null);
      t = window.setTimeout(step, CAR.hold);
    };
    t = window.setTimeout(step, CAR.hold);
    return () => { live = false; clearTimeout(t); };
  }, [on, still]);
  const playing = (i: number) => inPhone === i || leaving === i;
  /* two stages of the same geometry: the faint copies behind the card (4 Nov, Nitish: "keep them behind the container"),
     the window and the phone's edge in the card, over its glass; the card's words under the fade */
  return (<>
    <div className="sc4-car back" ref={ref} aria-hidden="true">
      {BANNERS.map((b, i) => <div key={b.id} ref={el => { els.current[i] = el; }} className="sc4-car-item"><Screen b={b} active={playing(i)} /></div>)}
      <div ref={ghost} className="sc4-car-item ghost"><Screen key={ghostOf} b={BANNERS[ghostOf]} active={false} /></div>
    </div>
    <div className="sc4-card sc4-camp">
      <div className="sc4-car front">
        {/* the window: the phone's shape, clipping; the same belt inside it, whole */}
        <div className="sc4-win">
          {BANNERS.map((b, i) => <div key={b.id} ref={el => { wins.current[i] = el; }} className="sc4-car-item win" style={{ zIndex: inPhone === i ? 2 : 1 }}><Screen b={b} active={playing(i)} /></div>)}
        </div>
        <div className="sc4-car-phone" aria-hidden="true"><i className="sc4-island" /></div>
      </div>
      {children}
    </div>
  </>);
}

export default function Showcase04({ open }: { open: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="sc4" aria-hidden={!open} inert={!open}>
      <div className="sc4-in">
        <AnimatePresence>
          {open && (
            <motion.div key="camp" className="sc4-cardwrap camp" initial={reduce ? false : { opacity: 0, y: 28, scale: .92 }} animate={{ opacity: 1, y: 0, scale: 1, transition: reduce ? { duration: 0 } : { duration: .62, delay: .3, ease: EASE_IN } }} exit={{ opacity: 0, y: 14, scale: .95, transition: { duration: reduce ? 0 : .26, ease: [.4, 0, 1, 1] } }}>
              <Belt><span className="cap">Campaign banners</span></Belt>
            </motion.div>
          )}
          {open && CARDS.map((c, i) => <Card key={c.id} c={c} i={i} />)}
          {/* the note on the work (4 Nov, Nitish: "a text container talking about a little bit about the workflow… all these visual
              motion assets… the process, as well as how I made sure these assets were optimized and not more than 250 KB") */}
          {open && (
            <motion.div key="note" className="sc4-flo note" initial={reduce ? false : { opacity: 0, y: 22, scale: .94 }} animate={{ opacity: 1, y: 0, scale: 1, transition: reduce ? { duration: 0 } : { duration: .58, delay: .4, ease: EASE_IN } }} exit={{ opacity: 0, y: 10, scale: .96, transition: { duration: reduce ? 0 : .22, ease: [.4, 0, 1, 1] } }}>
              <div className="sc4-note"><p>The animations round my drawing are functional: feedback, loaders, states. These are the ones that sell — campaign banners, splash screens, feature stories, each a Lottie. Made in After Effects and trimmed layer by layer until every file sits under 250{'\u00a0'}KB, so the app stays light.</p></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
