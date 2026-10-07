import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ViewName } from '../../lib/data';
import './island.css';

/* 3×3 pixel patterns the status icon shuffles through (reference 2) */
const PATTERNS = [
  [0, 1, 0, 1, 1, 1, 0, 1, 0], [1, 0, 1, 0, 1, 0, 1, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 1, 0, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 1, 1, 1], [0, 0, 1, 0, 0, 1, 1, 1, 1], [1, 1, 1, 1, 0, 1, 1, 1, 1],
];
type Mode = 'idle' | 'open' | 'busy' | 'go' | 'theme' | 'done';
const COLOR: Record<Mode, string> = { idle: '#7FE3C2', open: '#C9B6F5', busy: '#F5BD56', go: '#F39AB8', theme: '#8FC7FF', done: '#7FE3C2' };

function Pixel({ mode }: { mode: Mode }) {
  const [p, setP] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) { setP(0); return; }
    const period = mode === 'busy' ? 130 : mode === 'idle' ? 1400 : 420;
    const id = window.setInterval(() => setP(prev => { let n; do { n = Math.floor(Math.random() * PATTERNS.length); } while (n === prev); return n; }), period);
    return () => window.clearInterval(id);
  }, [mode, reduce]);
  return (
    <span className="px" aria-hidden="true" style={{ '--pc': COLOR[mode] } as React.CSSProperties}>
      {PATTERNS[p].map((on, i) => <i key={i} className={on ? 'on' : ''} />)}
    </span>
  );
}

/* A line of text that swaps with a blur-crossfade */
function BlurText({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={className} style={{ display: 'inline-grid' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={text} style={{ gridArea: '1/1', whiteSpace: 'nowrap' }}
          initial={reduce ? false : { opacity: 0, filter: 'blur(5px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)', transition: { duration: .26, ease: 'easeOut' } }}
          exit={{ opacity: 0, filter: 'blur(5px)', transition: { duration: .16, ease: 'easeIn' } }}>
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

type Reply = { text: string; go?: ViewName; pid?: string; theme?: boolean };
/* Scripted intents. The real assistant replaces this in a later iteration. */
function route(q: string): Reply {
  q = q.toLowerCase();
  if (/dark|light|theme/.test(q)) return { text: 'Done. Theme switched.', theme: true };
  if (/lenskart|assistant/.test(q)) return { text: 'Opening the Lenskart project.', go: 'project', pid: 'lenskart-b' };
  if (/coin rig|plugin/.test(q)) return { text: 'Opening Coin Rig.', go: 'project', pid: 'coin-rig' };
  if (/project|work|case|ride|swiggy|rupee/.test(q)) return { text: 'Here are the projects.', go: 'projects' };
  if (/micro|interaction|button|toggle/.test(q)) return { text: 'Micro-interactions. Press things.', go: 'micro' };
  if (/campaign|motion graphic|banner|reel|film|promo/.test(q)) return { text: 'Campaign work is this way.', go: 'campaign' };
  if (/writ|article|blog|post|research|note|publish/.test(q)) return { text: 'Notes and write-ups.', go: 'writing' };
  if (/experience|cv|resume|job|role|hire|contact|email/.test(q)) return { text: 'Experience, with the CV and contact at the end.', go: 'experience' };
  if (/tool|stack|software|after effects|rive|lottie/.test(q)) return { text: 'Tools are in the mint tile on the home view.', go: 'home' };
  if (/travel|cook|food|spiti|jimny|hobby|fun|outside|mountain|trek/.test(q)) return { text: 'Off the clock: mountains, a Jimny, and a lot of recipes. The photo stack on the home view has some of it.', go: 'home' };
  if (/home|intro|start|back/.test(q)) return { text: 'Back to the start.', go: 'home' };
  return { text: "I'm a placeholder for now. The real assistant arrives in a later iteration." };
}

type Props = { onGo: (view: ViewName, pid?: string) => void; onToggleTheme: () => void };

export default function Island({ onGo, onToggleTheme }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<{ text: string; mode: Mode }>({ text: 'Ask about Nitish', mode: 'idle' });
  const [msgs, setMsgs] = useState<{ me: boolean; text: string }[]>([{ me: false, text: 'Hi. I can take you around. Try "show me the projects" or "switch to dark".' }]);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgsRef = useRef<HTMLDivElement>(null);

  const setOpenState = (o: boolean) => {
    setOpen(o);
    setStatus(o ? { text: 'Listening', mode: 'open' } : { text: 'Ask about Nitish', mode: 'idle' });
    if (o) window.setTimeout(() => inputRef.current?.focus(), 120);
  };

  useEffect(() => {
    const click = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpenState(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenState(false); };
    document.addEventListener('click', click); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('click', click); document.removeEventListener('keydown', key); };
  }, []);
  useEffect(() => { if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight; }, [msgs]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = q.trim(); if (!text) return;
    setMsgs(m => [...m, { me: true, text }]); setQ('');
    setStatus({ text: 'Thinking', mode: 'busy' });
    const r = route(text);
    window.setTimeout(() => {
      setMsgs(m => [...m, { me: false, text: r.text }]);
      if (r.go) { setStatus({ text: 'Taking you there', mode: 'go' }); onGo(r.go, r.pid); }
      else if (r.theme) { setStatus({ text: 'Switching theme', mode: 'theme' }); onToggleTheme(); }
      else setStatus({ text: 'Responding', mode: 'done' });
      window.setTimeout(() => setStatus(s => (s.mode === 'open' ? s : { text: 'Listening', mode: 'open' })), 1600);
    }, 620);
  };

  return (
    <div className="island-wrap">
      {/* `layout` lets the notch's width and height follow the content instead of jumping */}
      <motion.div ref={ref} layout className={`island${open ? ' open' : ''}`} style={{ borderRadius: '0 0 24px 24px' }}
        transition={{ layout: { type: 'spring', bounce: .12, duration: .55 } }}>
        <motion.div layout="position" className="island-top">
          <button className="island-pill" type="button" aria-expanded={open} aria-controls="islandPanel" onClick={() => setOpenState(!open)}>
            <span className="stat"><Pixel mode={status.mode} /><BlurText text={status.text} /></span>
          </button>
          <button className="island-x" type="button" aria-label="Close" onClick={() => setOpenState(false)}>×</button>
        </motion.div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div key="panel" layout className="island-panel" id="islandPanel"
              initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: .12 } }} exit={{ opacity: 0, transition: { duration: .12 } }}>
              <div className="msgs" ref={msgsRef}>
                {msgs.map((m, i) => <div key={i} className={`msg${m.me ? ' me' : ''}`}>{m.text}</div>)}
              </div>
              <form onSubmit={submit}>
                <input ref={inputRef} id="islandIn" type="text" placeholder="Ask anything…" autoComplete="off" aria-label="Ask the assistant" value={q} onChange={e => setQ(e.target.value)} />
                <button type="submit" aria-label="Send">↑</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
