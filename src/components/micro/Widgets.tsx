import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

/* A number that rolls in the direction it changes */
const rollVariants = {
  initial: (d: number) => ({ y: d * 100 + '%', opacity: 0 }),
  animate: { y: 0, opacity: 1 },
  exit: (d: number) => ({ y: -d * 100 + '%', opacity: 0 }),
};
export function Roll({ value, dir, className }: { value: number; dir: number; className: string }) {
  const reduce = useReducedMotion();
  return (
    <div className={className}>
      <AnimatePresence initial={false} custom={dir}>
        <motion.span key={value} custom={dir} variants={rollVariants}
          initial={reduce ? false : 'initial'} animate="animate" exit="exit"
          transition={{ duration: .34, ease: [.3, 1, .4, 1] }}>{value}</motion.span>
      </AnimatePresence>
    </div>
  );
}

/* Like: overshoot on press, particles on release, a count that rolls */
export function Like() {
  const [liked, setLiked] = useState(false);
  const [dir, setDir] = useState(1);
  const burst = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const click = () => {
    const next = !liked; setLiked(next); setDir(next ? 1 : -1);
    if (reduce || !next || !burst.current) return;
    for (let i = 0; i < 10; i++) {
      const p = document.createElement('i'); burst.current.appendChild(p);
      const a = (i / 10) * Math.PI * 2, d = 34 + Math.random() * 14;
      p.style.background = ['#F5BD56', '#E5484D', '#7B7EE4', '#2BC48A'][i % 4];
      p.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(.2)`, opacity: 0 }],
        { duration: 620, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => p.remove();
    }
  };
  return (
    <div className="like-wrap">
      <motion.button className="like" aria-pressed={liked} aria-label="Like" onClick={click}
        whileTap={{ scale: .9 }} animate={liked ? { scale: [1, .72, 1.28, 1] } : { scale: 1 }} transition={{ duration: .52, ease: [.3, 1.3, .5, 1] }}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.6-9.3-9A5.2 5.2 0 0 1 12 6.3 5.2 5.2 0 0 1 21.3 12C19 16.4 12 21 12 21z" fill="currentColor" /></svg>
        <span className="burst" ref={burst} aria-hidden="true" />
      </motion.button>
      <Roll className="like-count" value={128 + (liked ? 1 : 0)} dir={dir} />
    </div>
  );
}

/* Rolling stepper */
export function Stepper() {
  const [n, setN] = useState(4);
  const [dir, setDir] = useState(1);
  const set = (v: number, d: number) => { v = Math.max(0, Math.min(99, v)); if (v === n) return; setDir(d); setN(v); };
  return (
    <div className="stepper">
      <button type="button" aria-label="Decrease" onClick={() => set(n - 1, -1)}>−</button>
      <Roll className="roll" value={n} dir={dir} />
      <button type="button" aria-label="Increase" onClick={() => set(n + 1, 1)}>+</button>
    </div>
  );
}

/* Segmented control: the pill is a shared-layout element, it travels */
export function Segmented() {
  const opts = ['Enter', 'Loop', 'Exit'];
  const [on, setOn] = useState(0);
  return (
    <div className="seg">
      {opts.map((o, i) => (
        <button key={o} type="button" className={i === on ? 'on' : ''} onClick={() => setOn(i)}>
          {i === on && <motion.span layoutId="seg-ind" className="seg-ind" transition={{ type: 'spring', bounce: .22, duration: .5 }} />}
          <span>{o}</span>
        </button>
      ))}
    </div>
  );
}
