import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CLIENTS, LIFE, TOOLS, type ViewName } from '../../lib/data';
import { item } from '../../lib/motion';
import { Switch } from '../micro/Widgets';

type Go = (view: ViewName, pid?: string) => void;

/* ---- live micro tile: a switch with overshoot and squash ---- */
export function MicroTile({ onGo }: { onGo: Go }) {
  const [on, setOn] = useState(false);
  return (
    <motion.div className={`tile micro${on ? ' on' : ''}`} variants={item}>
      <div className="tile-head">
        <p className="eyebrow">Micro-interactions</p>
        <button className="more" type="button" onClick={() => onGo('micro')}>See all <span className="arr" aria-hidden="true">→</span></button>
      </div>
      <div className="sw-wrap">
        <Switch on={on} onChange={setOn} />
        <p className="mono-s">state · {on ? 'on' : 'off'}</p>
      </div>
    </motion.div>
  );
}

export function Tools() {
  return (
    <motion.div className="tile tools" variants={item}>
      <p className="eyebrow">Tools</p>
      <ul className="chips">{TOOLS.map(t => <li key={t}>{t}</li>)}</ul>
    </motion.div>
  );
}

/* ---- photo stack: drag or tap through ----
   PhotoStack is the stack itself (header with the count, the fanned photos, the hint); 01's LifeStack wraps it in its tile.
   `bleed` (02): the photos are anchored to the bottom and run past the tile's bottom edge, the tile hiding the lowest
   ~15% of each; the captions sit above the hidden part, and the hint moves up into the header.
   `tints` overrides the placeholder gradients so a page can colour them from its own palette (01's colours stay in 01). */
export function PhotoStack({ bleed = false, tints }: { bleed?: boolean; tints?: [string, string][] }) {
  const [i, setI] = useState(0);
  const [leaving, setLeaving] = useState<null | { idx: number; dir: number }>(null);
  const reduce = useReducedMotion();
  const n = LIFE.length;
  const dragged = useRef(false); /* a drag's release also fires a tap; this stops one gesture advancing twice */
  const advance = (dir: number) => {
    if (leaving) return;
    if (reduce) { setI(v => (v + 1) % n); return; }
    setLeaving({ idx: i, dir });
    window.setTimeout(() => { setI(v => (v + 1) % n); setLeaving(null); }, 260);
  };
  return (
    <>
      <div className="tile-head"><p className="eyebrow">Off duty</p><span className="mono-s dim">{bleed && <span className="hint-inline">drag or tap · </span>}{i + 1} / {n}</span></div>
      <div className={`stack${bleed ? ' bleed' : ''}`} aria-label="Photo stack">
        {LIFE.map((c, k) => {
          const pos = (k - i + n) % n;
          const isTop = pos === 0;
          const out = leaving && leaving.idx === k;
          return (
            <motion.figure key={c.caption} style={{ '--g1': tints ? tints[k % tints.length][0] : c.g1, '--g2': tints ? tints[k % tints.length][1] : c.g2, zIndex: n - pos } as React.CSSProperties}
              animate={out ? { x: leaving.dir * 420, rotate: leaving.dir * 14, opacity: 0 }
                : { x: 0, y: pos * -6, rotate: (pos % 2 ? -1 : 1) * pos * 2.4, scale: 1 - pos * .045, opacity: pos > 3 ? 0 : 1 }}
              transition={{ type: 'spring', bounce: .18, duration: .5 }}
              drag={isTop && !out ? 'x' : false} dragSnapToOrigin dragElastic={.9}
              onDragStart={() => { dragged.current = true; }}
              onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 56) advance(info.offset.x > 0 ? 1 : -1); window.setTimeout(() => { dragged.current = false; }, 0); }}
              onTap={() => { if (isTop && !dragged.current) advance(1); }}>
              <figcaption>{c.caption}</figcaption>
            </motion.figure>
          );
        })}
      </div>
      {!bleed && <p className="mono-s hint">drag or tap</p>}
    </>
  );
}

export function LifeStack() {
  return <motion.div className="tile life" variants={item}><PhotoStack /></motion.div>;
}

/* ---- clients: a wordmark cycle ---- */
export function Clients() {
  const [ci, setCi] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => { if (!document.hidden) setCi(c => (c + 1) % CLIENTS.length); }, 2600);
    return () => window.clearInterval(id);
  }, []);
  return (
    <motion.div className="tile clients" variants={item}>
      <p className="eyebrow">Worked with</p>
      <div className="cycle" aria-live="polite">
        <AnimatePresence initial={false}>
          <motion.span key={CLIENTS[ci]} initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: .42, ease: [.3, 1, .4, 1] }}>{CLIENTS[ci]}</motion.span>
        </AnimatePresence>
      </div>
      <div className="dots">{CLIENTS.map((c, k) => <i key={c} className={k === ci ? 'on' : ''} />)}</div>
    </motion.div>
  );
}

/* ---- fused campaign tile: coal panel with a faux-3D coin on canvas + amber copy ---- */
export function Fused({ onGo }: { onGo: Go }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    let t = 0, raf = 0;
    const size = () => { const r = cv.getBoundingClientRect(); cv.width = Math.max(1, r.width * devicePixelRatio); cv.height = Math.max(1, r.height * devicePixelRatio); };
    const draw = () => {
      const w = cv.width, h = cv.height; ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * .3, cx = w / 2, cy = h / 2, c = Math.cos(t), s = Math.sin(t);
      const sx = Math.max(Math.abs(c), .06), thick = R * .22, N = 8;
      const amber = getComputedStyle(document.documentElement).getPropertyValue('--amber').trim() || '#F5BD56';
      for (let i = N; i >= 1; i--) { const o = (thick * s) * (i / N); ctx.beginPath(); ctx.ellipse(cx - o, cy, R * sx, R, 0, 0, Math.PI * 2); ctx.fillStyle = i % 2 ? '#8A5A12' : '#A66F1C'; ctx.fill(); }
      const g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R); g.addColorStop(0, '#FFE39A'); g.addColorStop(.55, amber); g.addColorStop(1, '#B5801F');
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
  return (
    <motion.button className="tile fused hoverable" type="button" variants={item} onClick={() => onGo('campaign')}>
      <div className="fused-l"><canvas ref={ref} aria-hidden="true" /></div>
      <div className="fused-r">
        <p className="eyebrow">Campaign &amp; motion graphics</p>
        <h3>Brand and promotional motion — reels, banner sets, launch films.</h3>
        <span className="more">See the work <span className="arr" aria-hidden="true">→</span></span>
      </div>
      <i className="brk h" aria-hidden="true" />
    </motion.button>
  );
}
