import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CLIENTS, LINKS, PROJECTS } from '../../lib/data';
import { useTheme } from '../../lib/theme';
import { ThemeToggle } from '../../components/dock/Dock';
import { Like } from '../../components/micro/Widgets';
import { Lottie } from '../../components/micro/Lottie';
import { PhotoStack } from '../../components/tiles/Tiles';
/* B, Lenskart's AI assistant (Nitish's Lottie, hosted on lottie.host): all states back to back in one loop, a marker per state */
const bStates = 'https://lottie.host/9e427624-628c-46d0-a92d-fc7ca43e2836/VMVaaAYm3M.lottie';
/* the rupee coin, made with Nitish's Vector 3D plugin (hosted on lottie.host): one 2.8 s turn, looping. The card links to the plugin once he sends the link. */
const coinTurn = 'https://lottie.host/baf8073b-3068-48ed-9e57-7a55cd7c97ed/KOTff0Mhna.lottie';
/* Lenskart's loader (Nitish's Lottie, hosted): the infinity-glasses loader, 2.1 s loop. The file also carries the line
   "Hold on! We're looking out for you" as outlined shapes (two layers named TEXT Outlines) with an image shimmer across it;
   those three layers are dropped as it loads and the canvas is cropped to the loader (66 × 28 of 297 × 66, measured
   across every frame, +3px all round). */
const lkLoader = 'https://lottie.host/e331b8eb-11ac-466a-96da-98916b4052da/t7zZAGNw8i.lottie';
const dropLoaderText = (l: { nm?: string; ty?: number }) => (l.nm ?? '').startsWith('TEXT') || l.ty === 2;
import cutout from '../../assets/nitish-phone-cutout.webp';
import './field.css';

/* ---------- small pieces ---------- */

/* The title's rolling word (Nitish, 7 Oct, variant a): "Product" stays, the second word rolls
   designer → motion → interaction. Each word rises in as the last one leaves upward. */
const WORDS = ['designer', 'motion', 'interaction'];
function RollingWord() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI(n => (n + 1) % WORDS.length), 2400);
    return () => clearInterval(id);
  }, [reduce]);
  return (
    <motion.span className="rw" layout transition={{ duration: .5, ease: [.3, 1, .4, 1] }}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span key={WORDS[i]} className="rw-w"
          initial={{ y: '110%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-110%', opacity: 0 }}
          transition={{ duration: .5, ease: [.3, 1, .4, 1] }}>{WORDS[i]}</motion.span>
      </AnimatePresence>
    </motion.span>
  );
}


/* PLACEHOLDER thumbnails standing in for the Lotties the ticker will carry; colours come from the palette tokens */
const REEL = [
  { g1: 'var(--ocean)', g2: 'var(--sky)', label: 'Coin · loader' }, { g1: 'var(--coal)', g2: 'var(--sky)', label: 'B · assistant' },
  { g1: 'var(--sky)', g2: 'var(--tileB)', label: 'Blinkit · promo' }, { g1: 'var(--amber)', g2: 'var(--ocean)', label: 'Rupee · success' },
  { g1: 'var(--coal)', g2: 'var(--ocean)', label: 'Lenskart · launch' }, { g1: 'var(--acc3)', g2: 'var(--sky)', label: 'MobiKwik · loop' },
];

/* The stroke around the hero (02b). Measured on the hi-res ref by fitting circles to the pixels: the disc, the figure's
   mask and the stroke share ONE centre (on the figure, 48.3% down the tile); the disc/mask radius is .548 of the tile's
   height, the stroke's .593. The stroke is drawn as the two arcs that are visible in the ref: a long left arc from above
   the tile (it crosses the top edge at about 11 o'clock) round the left side to just before the bottom edge, and a short
   bottom-right piece that comes out under the card and into the gap. Angles are screen angles, clockwise from 3 o'clock. */
function strokeArcs(w: number, h: number) {
  const cx = w / 2, cy = .483 * h, r = .593 * h;
  const P = (deg: number) => { const a = deg * Math.PI / 180; return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`; };
  const arc = (a0: number, a1: number) => { const sweep = a1 > a0 ? 1 : 0, large = Math.abs(a1 - a0) > 180 ? 1 : 0; return `M ${P(a0)} A ${r} ${r} 0 ${large} ${sweep} ${P(a1)}`; };
  const left = arc(-116, -238);   /* ref: -117.5° → 121.5°, counter-clockwise through 180° */
  const right = arc(55, 76);      /* ref: 57.5° → 76° */
  return `${left} ${right}`;
}

/* Palettes: the iteration's own (ocean green + sky blue) and 01's (periwinkle, blush, mint, lilac, amber, coal) as a sub-iteration */
export type Palette = 'ocean' | '01';

/* ---------- the iteration ---------- */
export default function Iteration02({ palette = 'ocean' }: { palette?: Palette }) {
  const { isDark, toggle } = useTheme();
  const reduce = useReducedMotion();
  const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
  const heroRef = useRef<HTMLDivElement>(null);

  /* the hero tile's size in px, for the circle geometry (02b): the disc, the stroke and the figure's mask share it.
     Set on the grid (so the halo, a sibling in the same cell, reads it) and kept in state for the stroke's path. */
  const [hsize, setHsize] = useState<[number, number]>([0, 0]);
  useEffect(() => {
    const el = heroRef.current; if (!el) return;
    const grid = el.parentElement as HTMLElement;
    const ro = new ResizeObserver(() => { grid.style.setProperty('--hw', el.offsetWidth + 'px'); grid.style.setProperty('--hh', el.offsetHeight + 'px'); setHsize([el.offsetWidth, el.offsetHeight]); });
    ro.observe(el); return () => ro.disconnect();
  }, []);

  /* sheet sizing: width 1200–1440, aspect between 4:3 and 1.7:1, scaled down as one piece when the viewport can't hold it */
  useEffect(() => {
    const root = document.documentElement, EDGE = 24;
    const fit = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      if (vw <= 700) { ['--W', '--H', '--s02'].forEach(v => root.style.removeProperty(v)); return; }
      const W = Math.min(1440, Math.max(1200, vw - 2 * EDGE));
      let s = vw - 2 * EDGE < 1200 ? (vw - 32) / 1200 : 1;
      const availH = (vh - 2 * EDGE) / s;
      const H = Math.min(Math.max(availH, W / 1.7), W / 1.333);
      if (H > availH) s *= availH / H;
      root.style.setProperty('--W', W + 'px'); root.style.setProperty('--H', H + 'px'); root.style.setProperty('--s02', s.toFixed(4));
    };
    fit(); addEventListener('resize', fit);
    return () => { removeEventListener('resize', fit); ['--W', '--H', '--s02'].forEach(v => root.style.removeProperty(v)); };
  }, []);

  /* floating assets follow the pointer by depth, as in 01 */
  const move = (e: React.PointerEvent) => {
    if (!canHover || reduce || !heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
    heroRef.current.querySelectorAll<HTMLElement>('.fc').forEach(c => { const d = Number(c.dataset.depth); c.style.setProperty('--px', (dx * 28 * d).toFixed(1) + 'px'); c.style.setProperty('--py', (dy * 20 * d).toFixed(1) + 'px'); });
  };
  const reset = () => heroRef.current?.querySelectorAll<HTMLElement>('.fc').forEach(c => { c.style.setProperty('--px', '0px'); c.style.setProperty('--py', '0px'); });

  const ringPct = 75; // PLACEHOLDER
  const C = 2 * Math.PI * 45;

  return (
    <div className={`it02${palette === '01' ? ' pal-01' : ''}`}>
      <ThemeToggle isDark={isDark} onToggle={toggle} />
      <Link className="labtag" to="/lab">{palette === '01' ? 'Lab · 02b Field · 01 palette' : 'Lab · 02 Field'}</Link>
      <div className="field">
        <div className="bento02">

          {/* experience: ring + shipped count + CV */}
          <section className="t xp">
            <p className="lbl" style={{ textAlign: 'center' }}>Years in motion</p>
            <div className="ring" aria-hidden="true">
              <svg viewBox="0 0 100 100"><circle className="track" cx="50" cy="50" r="45" /><circle className="arc" cx="50" cy="50" r="45" strokeDasharray={`${C * ringPct / 100} ${C}`} /></svg>
              <div className="in"><b>7+</b><small>in product teams</small></div>
            </div>
            <div className="xpstat"><div className="num mid">3</div><p className="lbl">products shipped with Blinkit, Lenskart &amp; MobiKwik</p></div>
            <a className="cta02" href={LINKS.cv}>View CV <span className="arr" aria-hidden="true">↗</span></a>
          </section>

          {/* micro-interactions: a live like beside the count */}
          <section className="t micro02">
            <div className="row1"><div className="num">32</div><Like /></div>
            <p className="lbl">micro-interactions,<br />all of them live</p>
          </section>

          {/* projects: a tile now, a bento of its own later */}
          <button className="t projects b" type="button">
            <p className="lbl">Projects</p>
            <div className="num">{String(PROJECTS.length).padStart(2, '0')}</div>
            <p className="delta">+2 in progress</p>
          </button>

          {/* hero: the person, centred, looking into the phone; what he's looking at and what he's built float
              close to the body — the coin behind his shoulder, the assistant over his arm, title and description
              over the shirt (spec: LOG.md, "Hero card — spec"). Positions are ref 3's, as fractions of the tile (hi-res, measured):
              B ↔ its chart card, title ↔ its play pill, coin ↔ its segmentation card (behind), description ↔ its engagement card */}
          {/* 02b (ref 3, hi-res, measured): the hero's fill and the lighter disc (clipped to the tile), plus one thin circle drawn
              as two broken arcs that cross the tile's edge into the gaps — in the hero's cell but under the other tiles
              (field.css, .halo); the tile above it is transparent. The arcs: a long one from the gap above, down the left
              side, ending before the bottom edge; a short one at the bottom right spilling into the gap below. */}
          {palette === '01' && (
            <div className="halo" aria-hidden="true">
              <div className="disc-clip"><i className="disc" /></div>
              {hsize[1] > 0 && <svg className="stroke" width={hsize[0]} height={hsize[1]} overflow="visible"><path d={strokeArcs(hsize[0], hsize[1])} /></svg>}
            </div>
          )}
          <section className="t hero02 b" ref={heroRef} onPointerMove={move} onPointerLeave={reset}>
            <div className="person-clip" aria-hidden="true"><img className="person" src={cutout} alt="" /></div>
            <span className="shape alt" style={{ left: '6%', top: '38%' }} />
            <span className="shape" style={{ right: '7%', top: '48%' }} />
            <span className="shape tri" style={{ left: '15%', top: '52%' }} />
            {/* the assistant: liquid glass, over his arm, as if it had come off the phone */}
            <div className="fc glass ai" data-depth="1.3" style={{ left: '16%', top: '10%', '--dur': '5.6s', '--dl': '-1s' } as React.CSSProperties}>
              <div className="fc-in"><Lottie className="bl" src={bStates} still={150} label="B, Lenskart's AI assistant, cycling through its states" /><span className="cap">Lenskart's<br />AI assistant</span></div>
            </div>
            {/* the coin, behind his shoulder */}
            <div className="fc behind coin-card" data-depth=".6" style={{ left: '63%', top: '-11%', '--dur': '7s', '--dl': '-3.3s' } as React.CSSProperties}>
              <div className="fc-in"><Lottie className="coin" src={coinTurn} still={84} label="A rupee coin turning, made with the Vector 3D plugin" /><span className="cap">Vector 3D plugin</span></div>
            </div>
            {/* Lenskart's loader: a small wide card, in front, beside his right arm (the ref's yellow ring sits here) */}
            <div className="fc loader-card" data-depth="1.25" style={{ left: '72%', top: '38%', '--dur': '5.8s', '--dl': '-1.7s' } as React.CSSProperties}>
              <div className="fc-in"><Lottie className="lk" src={lkLoader} drop={dropLoaderText} viewBox="113 34 72 34" still={60} label="Lenskart's infinity-glasses loader" /><span className="cap">Loader animation</span></div>
            </div>
            {/* the title: name + the rolling word */}
            <div className="fc title-card" data-depth="1.1" style={{ left: '8.5%', top: '58%', '--dur': '6.2s', '--dl': '-2.4s' } as React.CSSProperties}>
              <div className="fc-in"><span className="nm">Nitish Bhardwaj</span><span className="role">Product <RollingWord /></span></div>
            </div>
            {/* the description, beside it */}
            <div className="fc desc-card" data-depth="1.2" style={{ left: '58%', bottom: '5%', '--dur': '5.1s', '--dl': '-.6s' } as React.CSSProperties}>
              <div className="fc-in"><p>I design feedback{"\u00a0"}rich interfaces powered by motion.</p></div>
            </div>
          </section>

          {/* team → worked with */}
          <section className="t team">
            <p className="ttl">Motion for products people use every day.</p>
            <div className="avatars" aria-label="Clients">
              {CLIENTS.map((c, i) => <i key={c} style={{ background: ['var(--ocean)', 'var(--sky)', 'var(--coal)'][i % 3] }} title={c}>{c[0]}</i>)}
              <i style={{ background: 'var(--muted)' }}>+2</i>
            </div>
            <p className="lbl">Lotties<br />shipped</p>
            <div className="num">54</div>
            <p className="delta o">+40%</p>
          </section>

          {/* brand */}
          {/* off duty (Nitish, 9 Oct): replaces the brand card in its slot — 01's photo stack, drag or tap through,
              anchored to the bottom and running past the card's edge (the card hides the lowest ~15% of each photo) */}
          <section className="t offduty b">
            <PhotoStack bleed />
          </section>

          {/* life: the statement in pills, two oval photos */}
          <section className="t life02 b">
            <div className="pillrow"><span>Product designer.</span><span>I make UI move.</span></div>
            <div className="ovals">
              <figure className="oval a" style={{ '--g1': 'var(--acc3)', '--g2': 'var(--tileB)' } as React.CSSProperties}><figcaption>Spiti, by bike</figcaption></figure>
              <figure className="oval b" style={{ '--g1': 'var(--warm)', '--g2': 'var(--amber)' } as React.CSSProperties}><figcaption>A recipe I'd never tried</figcaption></figure>
              <span className="avchip one" aria-hidden="true" /><span className="avchip two" aria-hidden="true" />
            </div>
          </section>

          {/* tools */}
          <section className="t tools02">
            <p className="ttl">Stack</p>
            <p className="sm">After Effects · Lottie · Rive · JavaScript</p>
            <div className="swatches" aria-hidden="true">
              {[['AE', 'var(--coal)'], ['Lottie', 'var(--ocean)'], ['Rive', 'var(--sky)'], ['JS', 'var(--muted)']].map(([l, c], i) => <div key={l} className="sw" style={{ background: c, '--d': `${-i * .9}s` } as React.CSSProperties}>{l}</div>)}
            </div>
          </section>

          {/* reel: headline + ticker */}
          <section className="t reel02">
            <div className="head">
              <div><p className="ttl">Motion that ships, not just moves.</p><p className="sm">Campaign &amp; product reels, running.</p></div>
            </div>
            <div className="ticker" aria-label="Reel">
              <div className="track">
                {[...REEL, ...REEL].map((r, i) => <div key={i} className="card" style={{ '--g1': r.g1, '--g2': r.g2 } as React.CSSProperties}><i /><span>{r.label}</span></div>)}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
