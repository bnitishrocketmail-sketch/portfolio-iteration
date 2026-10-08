import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CLIENTS, LINKS, PROJECTS } from '../../lib/data';
import { useTheme } from '../../lib/theme';
import { ThemeToggle } from '../../components/dock/Dock';
import { Like } from '../../components/micro/Widgets';
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

/* PLACEHOLDER for the "B" assistant Lottie: a stand-in that walks the assistant's states back to back
   (idle → listening → thinking → replying) so the card reads as live until the real file arrives. */
const STATES = ['idle', 'listen', 'think', 'reply'] as const;
function BAssistant() {
  const reduce = useReducedMotion();
  const [s, setS] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setS(n => (n + 1) % STATES.length), 1500);
    return () => clearInterval(id);
  }, [reduce]);
  return (
    <div className={`bb s-${STATES[s]}`} aria-hidden="true">
      <i className="ring" /><i className="ring r2" />
      <b>B</b>
      <span className="dots"><i /><i /><i /></span>
      <span className="wave"><i /><i /><i /><i /></span>
    </div>
  );
}

/* the faux-3D coin from 01, as a floating hero asset */
function Coin({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const cv = ref.current; if (!cv) return; const ctx = cv.getContext('2d'); if (!ctx) return;
    let t = 0, raf = 0;
    const size = () => { const r = cv.getBoundingClientRect(); cv.width = Math.max(1, r.width * devicePixelRatio); cv.height = Math.max(1, r.height * devicePixelRatio); };
    const draw = () => {
      const w = cv.width, h = cv.height; ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * .4, cx = w / 2, cy = h / 2, c = Math.cos(t), s = Math.sin(t);
      const sx = Math.max(Math.abs(c), .06), thick = R * .22, N = 8;
      for (let i = N; i >= 1; i--) { const o = (thick * s) * (i / N); ctx.beginPath(); ctx.ellipse(cx - o, cy, R * sx, R, 0, 0, Math.PI * 2); ctx.fillStyle = i % 2 ? '#8A5A12' : '#A66F1C'; ctx.fill(); }
      const g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R); g.addColorStop(0, '#FFE39A'); g.addColorStop(.55, '#F5BD56'); g.addColorStop(1, '#B5801F');
      ctx.beginPath(); ctx.ellipse(cx, cy, R * sx, R, 0, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, cy, R * sx * .78, R * .78, 0, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(120,80,10,.45)'; ctx.lineWidth = Math.max(1, R * .03); ctx.stroke();
      ctx.save(); ctx.translate(cx, cy); ctx.scale(c, 1); ctx.fillStyle = 'rgba(90,58,6,.9)'; ctx.font = `700 ${R * .95}px Outfit, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('₹', 0, R * .04); ctx.restore();
      if (!reduce) { t += .022; raf = requestAnimationFrame(draw); }
    };
    size(); draw();
    const onResize = () => { size(); if (reduce) draw(); };
    addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', onResize); };
  }, [reduce]);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}

/* PLACEHOLDER thumbnails standing in for the Lotties the ticker will carry; colours come from the palette tokens */
const REEL = [
  { g1: 'var(--ocean)', g2: 'var(--sky)', label: 'Coin · loader' }, { g1: 'var(--coal)', g2: 'var(--sky)', label: 'B · assistant' },
  { g1: 'var(--sky)', g2: 'var(--tileB)', label: 'Blinkit · promo' }, { g1: 'var(--amber)', g2: 'var(--ocean)', label: 'Rupee · success' },
  { g1: 'var(--coal)', g2: 'var(--ocean)', label: 'Lenskart · launch' }, { g1: 'var(--acc3)', g2: 'var(--sky)', label: 'MobiKwik · loop' },
];

/* The stroke around the hero (02b): one circle centred on the figure (the tile's centre line) just below the tile's middle,
   radius ~0.58 of the tile's height (ref 3, measured; the ref's circles are centred on its figure, which sits right of its
   tile's centre — ours is centred, so the circles are too), drawn as two arcs. Angles are screen angles (clockwise from 3 o'clock). */
function strokeArcs(w: number, h: number) {
  const cx = w / 2, cy = .486 * h, r = .578 * h;
  const P = (deg: number) => { const a = deg * Math.PI / 180; return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`; };
  const arc = (a0: number, a1: number) => { const sweep = a1 > a0 ? 1 : 0, large = Math.abs(a1 - a0) > 180 ? 1 : 0; return `M ${P(a0)} A ${r} ${r} 0 ${large} ${sweep} ${P(a1)}`; };
  /* left: from 10 o'clock (above the tile) counter-clockwise down the left side to just before the bottom edge */
  const left = arc(-108, -236);
  /* bottom right: a short piece from behind the description card, out under the tile's bottom edge */
  const right = arc(28, 76);
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
              over the shirt (spec: LOG.md, "Hero card — spec") */}
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
            <div className="fc glass ai" data-depth="1.3" style={{ left: '6%', top: '2%', '--dur': '5.6s', '--dl': '-1s' } as React.CSSProperties}>
              <div className="fc-in"><BAssistant /><span className="cap">AI assistant interaction</span></div>
            </div>
            {/* the coin, behind his shoulder */}
            <div className="fc behind coin-card" data-depth=".6" style={{ right: '9%', top: '1%', '--dur': '7s', '--dl': '-3.3s' } as React.CSSProperties}>
              <div className="fc-in"><Coin className="coin" /><span className="cap">Rupee · faux 3D</span></div>
            </div>
            {/* the title: name + the rolling word */}
            <div className="fc title-card" data-depth="1.1" style={{ left: '5%', bottom: '8%', '--dur': '6.2s', '--dl': '-2.4s' } as React.CSSProperties}>
              <div className="fc-in"><span className="nm">Nitish Bhardwaj</span><span className="role">Product <RollingWord /></span></div>
            </div>
            {/* the description, beside it */}
            <div className="fc desc-card" data-depth="1.2" style={{ right: '5%', bottom: '11%', '--dur': '5.1s', '--dl': '-.6s' } as React.CSSProperties}>
              <div className="fc-in"><p>Motion, interaction and code-driven animation for products people use every day.</p></div>
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
          <section className="t brand b">
            <div className="mark" aria-hidden="true"><i /><i /><i /></div>
            <div className="word">imakeuimove</div>
            <div className="links">
              <a href={LINKS.linkedin} target="_blank" rel="noopener">LinkedIn</a>
              <a href={LINKS.lottiefiles}>LottieFiles</a>
              <a href="#">Notes</a>
            </div>
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
