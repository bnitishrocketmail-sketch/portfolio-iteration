import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CLIENTS, LINKS, PROJECTS, WRITING } from '../../lib/data';
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

/* Palettes: the iteration's own (ocean green + sky blue) and 01's (periwinkle, blush, mint, lilac, amber, coal) as a sub-iteration */
export type Palette = 'ocean' | '01';

/* ---------- the iteration ---------- */
export default function Iteration02({ palette = 'ocean' }: { palette?: Palette }) {
  const { isDark, toggle } = useTheme();
  const reduce = useReducedMotion();
  const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
  const heroRef = useRef<HTMLDivElement>(null);
  const [cols5, setCols5] = useState(false);

  /* the hero tile's size in px, for the circle geometry (02b): the disc, its rings and the figure's mask share it */
  useEffect(() => {
    const el = heroRef.current; if (!el) return;
    const ro = new ResizeObserver(() => { el.style.setProperty('--hw', el.offsetWidth + 'px'); el.style.setProperty('--hh', el.offsetHeight + 'px'); });
    ro.observe(el); return () => ro.disconnect();
  }, []);

  /* sheet sizing: width 1200–1440, aspect between 4:3 and 1.7:1, scaled down as one piece when the viewport can't hold it.
     02b (Nitish, 8 Oct): the field is the whole screen, end to end, like a dashboard — the grid takes the viewport's size,
     and when the screen is wide enough (≥1700px and wider than 1.7:1) it gets a fifth column of tiles rather than stretching four. */
  useEffect(() => {
    const root = document.documentElement, EDGE = 24, full = palette === '01';
    const fit = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      if (vw <= 700) { ['--W', '--H', '--s02'].forEach(v => root.style.removeProperty(v)); setCols5(false); return; }
      if (full) {
        /* the layout is designed between 1200 and 1920px; narrower or wider screens get it scaled as one piece, so
           type, gaps and radii keep the proportions measured off the reference instead of the type capping out */
        const W = Math.min(1920, Math.max(1200, vw)), s = vw / W, H = vh / s;
        root.style.setProperty('--W', W + 'px'); root.style.setProperty('--H', H + 'px'); root.style.setProperty('--s02', s.toFixed(4));
        setCols5(W >= 1700 && W / H > 1.7); return;
      }
      const W = Math.min(1440, Math.max(1200, vw - 2 * EDGE));
      let s = vw - 2 * EDGE < 1200 ? (vw - 32) / 1200 : 1;
      const availH = (vh - 2 * EDGE) / s;
      const H = Math.min(Math.max(availH, W / 1.7), W / 1.333);
      if (H > availH) s *= availH / H;
      root.style.setProperty('--W', W + 'px'); root.style.setProperty('--H', H + 'px'); root.style.setProperty('--s02', s.toFixed(4));
    };
    fit(); addEventListener('resize', fit);
    return () => { removeEventListener('resize', fit); ['--W', '--H', '--s02'].forEach(v => root.style.removeProperty(v)); };
  }, [palette]);

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
      <div className={`field${cols5 ? ' cols-5' : ''}`}>
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
          <section className="t hero02 b" ref={heroRef} onPointerMove={move} onPointerLeave={reset}>
            {/* 02b (ref 3, hi-res): a lighter disc behind the figure, clipped to the tile, with thin rings just outside it;
                the figure is masked by the disc's lower half only, so the head stays free above the tile */}
            {palette === '01' && <div className="disc-wrap" aria-hidden="true"><i className="disc" /><i className="ring1" /><i className="ring2" /></div>}
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

          {/* 02b, wide screens only: a fifth column — writing, and a way to get in touch */}
          {cols5 && (
            <section className="t writing">
              <p className="ttl">Writing</p>
              <ul className="wlist">
                {WRITING.map(w => <li key={w.title}><a href={w.href}><span className="wt">{w.title}</span><span className="wm">{w.meta}</span></a></li>)}
              </ul>
              <a className="cta02" href="#">All notes <span className="arr" aria-hidden="true">↗</span></a>
            </section>
          )}
          {cols5 && (
            <section className="t contact b">
              <p className="ttl">Say hi.</p>
              <p className="sm">{LINKS.email}</p>
              <a className="cta02" href="#">Email <span className="arr" aria-hidden="true">↗</span></a>
            </section>
          )}

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
