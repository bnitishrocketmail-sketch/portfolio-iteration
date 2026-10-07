import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CLIENTS, LINKS, PROJECTS, type ViewName } from '../../lib/data';
import { useTheme } from '../../lib/theme';
import Island from '../../components/island/Island';
import { ThemeToggle } from '../../components/dock/Dock';
import { Like, Switch } from '../../components/micro/Widgets';
import './field.css';

/* ---------- small pieces ---------- */

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

/* PLACEHOLDER thumbnails standing in for the Lotties the ticker will carry */
const REEL = [
  { g1: '#159e8c', g2: '#2f9ee5', label: 'Coin · loader' }, { g1: '#0f1416', g2: '#2f9ee5', label: 'B · assistant' },
  { g1: '#2f9ee5', g2: '#dcf4ee', label: 'Blinkit · promo' }, { g1: '#f5bd56', g2: '#159e8c', label: 'Rupee · success' },
  { g1: '#0f1416', g2: '#159e8c', label: 'Lenskart · launch' }, { g1: '#7b7ee4', g2: '#2f9ee5', label: 'MobiKwik · loop' },
];

/* ---------- the iteration ---------- */
export default function Iteration02() {
  const { isDark, toggle } = useTheme();
  const reduce = useReducedMotion();
  const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
  const heroRef = useRef<HTMLDivElement>(null);
  const [sw, setSw] = useState(false);

  /* floating assets follow the pointer by depth, as in 01 */
  const move = (e: React.PointerEvent) => {
    if (!canHover || reduce || !heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
    heroRef.current.querySelectorAll<HTMLElement>('.fc').forEach(c => { const d = Number(c.dataset.depth); c.style.setProperty('--px', (dx * 28 * d).toFixed(1) + 'px'); c.style.setProperty('--py', (dy * 20 * d).toFixed(1) + 'px'); });
  };
  const reset = () => heroRef.current?.querySelectorAll<HTMLElement>('.fc').forEach(c => { c.style.setProperty('--px', '0px'); c.style.setProperty('--py', '0px'); });

  /* the island's navigation intents have nowhere to go yet on this one-grid home; they just answer */
  const go = (_v: ViewName) => { /* 02 has no views yet; projects bento comes later */ };

  const ringPct = 75; // PLACEHOLDER
  const C = 2 * Math.PI * 45;

  return (
    <div className="it02">
      <ThemeToggle isDark={isDark} onToggle={toggle} />
      <Link className="labtag" to="/lab">Lab · 02 Field</Link>
      <div className="field">
        <Island onGo={go} onToggleTheme={toggle} />
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

          {/* hero: the person, with live assets floating around */}
          <section className="t hero02 b" ref={heroRef} onPointerMove={move} onPointerLeave={reset}>
            <div className="person" aria-hidden="true">
              {/* PLACEHOLDER silhouette until the cutout photo arrives */}
              <svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMax meet"><g fill="var(--ink)"><circle cx="100" cy="64" r="44" /><rect x="84" y="96" width="32" height="40" rx="12" /><path d="M14 260c0-70 36-108 86-108s86 38 86 108z" /></g></svg>
            </div>
            <span className="shape" style={{ left: '8%', top: '20%', borderColor: 'var(--sky)' }} />
            <span className="shape" style={{ right: '10%', top: '34%' }} />
            <span className="shape tri" style={{ left: '18%', bottom: '10%' }} />
            {/* glass card: the coin */}
            <div className="fc glass" data-depth="1.2" style={{ left: '6%', top: '22%', '--dur': '5.6s', '--dl': '-1s' } as React.CSSProperties}>
              <div className="fc-in"><span className="cap">Rupee · loader</span><Coin className="coin" /></div>
            </div>
            {/* play card */}
            <div className="fc" data-depth="1.4" style={{ left: '4%', bottom: '18%', '--dur': '6.2s', '--dl': '-2.4s' } as React.CSSProperties}>
              <div className="fc-in play"><i /><div><span className="big">26,807</span><span className="cap">Lottie plays</span></div></div>
            </div>
            {/* bars card, behind */}
            <div className="fc behind" data-depth=".6" style={{ right: '4%', top: '-4%', '--dur': '7s', '--dl': '-3.3s' } as React.CSSProperties}>
              <div className="fc-in"><span className="cap">Easing · states</span><div className="bars">{[.1, .4, .7, 1.0, .55, .3].map((d, i) => <i key={i} style={{ '--d': `${-d * 2}s` } as React.CSSProperties} />)}</div></div>
            </div>
            {/* switch card */}
            <div className="fc" data-depth="1.1" style={{ right: '5%', bottom: '10%', '--dur': '5.1s', '--dl': '-.6s' } as React.CSSProperties}>
              <div className="fc-in"><span className="cap">state · {sw ? 'on' : 'off'}</span><div style={{ marginTop: 6, transform: 'scale(.62)', transformOrigin: 'left top', height: 44 }}><Switch on={sw} onChange={setSw} /></div></div>
            </div>
          </section>

          {/* team → worked with */}
          <section className="t team">
            <p className="ttl">Motion for products people use every day.</p>
            <div className="avatars" aria-label="Clients">
              {CLIENTS.map((c, i) => <i key={c} style={{ background: ['#159e8c', '#2f9ee5', '#0f1416'][i % 3] }} title={c}>{c[0]}</i>)}
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
              <figure className="oval a" style={{ '--g1': '#5a7bd6', '--g2': '#dcf4ee' } as React.CSSProperties}><figcaption>Spiti, by bike</figcaption></figure>
              <figure className="oval b" style={{ '--g1': '#c94a3a', '--g2': '#f5bd56' } as React.CSSProperties}><figcaption>A recipe I'd never tried</figcaption></figure>
              <span className="avchip one" aria-hidden="true" /><span className="avchip two" aria-hidden="true" />
            </div>
          </section>

          {/* tools */}
          <section className="t tools02">
            <p className="ttl">Stack</p>
            <p className="sm">After Effects · Lottie · Rive · JavaScript</p>
            <div className="swatches" aria-hidden="true">
              {[['AE', '#0f1416'], ['Lottie', '#159e8c'], ['Rive', '#2f9ee5'], ['JS', '#8fa3aa']].map(([l, c], i) => <div key={l} className="sw" style={{ background: c, '--d': `${-i * .9}s` } as React.CSSProperties}>{l}</div>)}
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
