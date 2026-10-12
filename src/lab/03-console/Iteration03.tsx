import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useReducedMotion, type Variants } from 'motion/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CLIENTS, COPY, EXPERIENCE, LINKS, PROJECTS, REELS, TOOLS, WRITING } from '../../lib/data';
import { useTheme } from '../../lib/theme';
import { Like, Segmented, Stepper, Switch } from '../../components/micro/Widgets';
import { PhotoStack } from '../../components/tiles/Tiles';
import { Lottie } from '../../components/micro/Lottie';
import { LOTTIES as L, dropLoaderText } from '../../lib/lotties';
import cutout from '../../assets/nitish-phone-cutout.webp';
import './console.css';

/* Iteration 03 — "Console". The portfolio as a product dashboard: a fixed app frame (sidebar · top bar · main) on
   the web, the same content as an app (large-title header · scrolling column · tab bar) on phones. One view at a
   time on desktop; nothing scrolls except inside a widget or an open project. Monochrome first; the accent slot
   (--acc) is empty until the theming pass. Decisions and the reasoning: LOG.md, "03 Console". */

/* ---------- sections ---------- */
type View = 'overview' | 'work' | 'play' | 'motion' | 'notes' | 'about';
const VIEWS: { id: View; label: string; short: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', short: 'Home', icon: 'M4 11 12 4l8 7v9H4z' },
  { id: 'work', label: 'Work', short: 'Work', icon: 'M4 7h16v12H4zM9 7V4h6v3' },
  { id: 'play', label: 'Playground', short: 'Play', icon: 'M8 5v14l11-7z' },
  { id: 'motion', label: 'Motion', short: 'Motion', icon: 'M3 12c3-6 6-6 9 0s6 6 9 0' },
  { id: 'notes', label: 'Notes', short: 'Notes', icon: 'M6 4h12v16H6zM9 9h6M9 13h6' },
  { id: 'about', label: 'About', short: 'Me', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c0-4 4-6 8-6s8 2 8 6' },
];
const isView = (s?: string): s is View => !!s && VIEWS.some(v => v.id === s);

/* the skills Nitish named (9 Oct) */
const SKILLS03 = ['Product design', 'UX design', 'UI design', 'Interaction design', 'Micro-interactions', 'UI animation', 'State-machine design', 'Custom AI workflows'];
/* monochrome placeholder tints for photos and thumbnails: greys only until the theming pass */
const GREYS: [string, string][] = [['var(--g5)', 'var(--g3)'], ['var(--g4)', 'var(--g2)'], ['var(--g6)', 'var(--g4)'], ['var(--g3)', 'var(--g1)'], ['var(--g5)', 'var(--g2)'], ['var(--g4)', 'var(--g3)']];

/* ---------- motion: view enter/exit and widget stagger ---------- */
const viewV: Variants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: { duration: .28, ease: [.2, .8, .2, 1], staggerChildren: .035, delayChildren: .02 } },
  exit: { opacity: 0, y: -6, transition: { duration: .12, ease: [.4, 0, .2, 1] } },
};
const wV: Variants = { initial: { opacity: 0, y: 10 }, enter: { opacity: 1, y: 0, transition: { duration: .32, ease: [.2, .8, .2, 1] } } };

/* ---------- small pieces ---------- */
function Widget({ title, action, onAction, className, children, span }: { title?: string; action?: string; onAction?: () => void; className?: string; children: React.ReactNode; span?: string }) {
  return (
    <motion.section className={`w ${className ?? ''}`} style={span ? { gridArea: span } : undefined} variants={wV}>
      {title && <header className="w-head"><h3>{title}</h3>{action && <button type="button" className="w-act" onClick={onAction}>{action}<span className="chev" aria-hidden="true">→</span></button>}</header>}
      {children}
    </motion.section>
  );
}

/* a number that counts up when its widget enters (tabular, no layout shift) */
function Stat({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (reduce) { el.textContent = String(value); return; }
    const c = animate(0, value, { duration: .9, ease: [.2, .8, .2, 1], onUpdate: v => { el.textContent = String(Math.round(v)); } });
    return () => c.stop();
  }, [value, reduce]);
  return <div className="stat"><div className="stat-n"><span ref={ref}>0</span>{suffix}</div><div className="stat-l">{label}</div></div>;
}

const WORDS = ['Product', 'Interaction', 'Motion'];
function RollingWord() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => { if (reduce) return; const id = setInterval(() => setI(n => (n + 1) % WORDS.length), 2400); return () => clearInterval(id); }, [reduce]);
  return (
    <motion.span className="rw3" layout transition={{ duration: .45, ease: [.3, 1, .4, 1] }}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span key={WORDS[i]} className="rw3-w" initial={{ y: '110%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-110%', opacity: 0 }} transition={{ duration: .45, ease: [.3, 1, .4, 1] }}>{WORDS[i]}</motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

function Icon({ d }: { d: string }) { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" /></svg>; }

/* ---------- command bar: the assistant's seat in a dashboard (scripted for now) ---------- */
type Cmd = { id: string; label: string; hint: string; run: () => void };
function CommandBar({ open, onClose, cmds, onAsk }: { open: boolean; onClose: () => void; cmds: Cmd[]; onAsk: (q: string) => string }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const [reply, setReply] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useMemo(() => { const s = q.trim().toLowerCase(); return s ? cmds.filter(c => (c.label + ' ' + c.hint).toLowerCase().includes(s)) : cmds; }, [q, cmds]);
  useEffect(() => { if (open) { setQ(''); setSel(0); setReply(null); setTimeout(() => input.current?.focus(), 30); } }, [open]);
  useEffect(() => { setSel(0); }, [q]);
  const go = (c?: Cmd) => { if (c) { c.run(); onClose(); } else if (q.trim()) { setReply(onAsk(q)); } };
  const key = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, list.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(list[sel]); }
    else if (e.key === 'Escape') onClose();
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="cmd-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .16 }} onClick={onClose}>
          <motion.div className="cmd" role="dialog" aria-label="Ask or jump to" onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, y: -8, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: .99 }} transition={{ duration: .2, ease: [.2, .8, .2, 1] }}>
            <input ref={input} value={q} onChange={e => setQ(e.target.value)} onKeyDown={key} placeholder="Ask about Nitish, or jump to a section…" aria-label="Ask or jump to" />
            {reply && <p className="cmd-reply">{reply}</p>}
            <ul className="cmd-list" role="listbox">
              {list.map((c, i) => <li key={c.id} role="option" aria-selected={i === sel} className={i === sel ? 'on' : ''} onMouseEnter={() => setSel(i)} onClick={() => go(c)}><span>{c.label}</span><small>{c.hint}</small></li>)}
              {!list.length && <li className="cmd-empty">Press Enter to ask</li>}
            </ul>
            <footer className="cmd-foot"><span>↑↓ move</span><span>↵ go</span><span>esc close</span></footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- views ---------- */
type Go = (v: View, pid?: string) => void;

function Overview({ go }: { go: Go }) {
  const [sw, setSw] = useState(true);
  return (
    <motion.div className="grid ov" variants={viewV} initial="initial" animate="enter" exit="exit">
      <Widget className="hero3" span="hero">
        <div className="hero3-text">
          <p className="eyebrow3">Nitish Bhardwaj</p>
          <h2 className="hero3-title"><RollingWord /> designer</h2>
          <p className="hero3-lede">I design feedback{' '}rich interfaces powered by motion.</p>
          <div className="hero3-cta"><button type="button" className="btn3" onClick={() => go('work')}>View work <span className="chev" aria-hidden="true">→</span></button><a className="btn3 ghost" href={LINKS.cv}>CV</a></div>
        </div>
        <div className="hero3-fig" aria-hidden="true"><img src={cutout} alt="" /></div>
      </Widget>
      <Widget span="s1"><Stat value={7} suffix="+" label="years in motion" /></Widget>
      <Widget span="s2"><Stat value={3} label="products shipped" /></Widget>
      <Widget span="s3"><Stat value={54} label="Lotties shipped" /></Widget>
      <Widget span="s4"><Stat value={32} label="micro-interactions, live" /></Widget>
      <Widget title="Latest work" action="All work" onAction={() => go('work')} span="work">
        <ul className="plist">
          {PROJECTS.slice(0, 4).map(p => <li key={p.id}><button type="button" onClick={() => go('work', p.id)}><i className="thumb" style={{ '--t1': GREYS[0][0], '--t2': GREYS[0][1] } as React.CSSProperties} /><span><b>{p.title}</b><small>{p.client} · {p.role}</small></span><span className="chev" aria-hidden="true">→</span></button></li>)}
        </ul>
      </Widget>
      <Widget title="Playground" action="Open" onAction={() => go('play')} span="play">
        <div className="live"><Like /><Switch on={sw} onChange={setSw} /><span className="live-cap">press things</span></div>
      </Widget>
      <Widget title="Motion" action="Reels" onAction={() => go('motion')} span="motion">
        <div className="lot-row"><Lottie className="lot b" src={L.b} still={150} label="B, Lenskart's AI assistant" /><Lottie className="lot ld" src={L.loader} drop={dropLoaderText} viewBox="113 34 72 34" still={60} label="Lenskart's loader" /></div>
      </Widget>
      <Widget title="Skills" span="skills" className="sk">
        <ul className="pills3">{SKILLS03.map(s => <li key={s}>{s}</li>)}</ul>
        <h3 className="sub3">Tools</h3>
        <ul className="pills3 soft">{TOOLS.map(s => <li key={s}>{s}</li>)}</ul>
      </Widget>
      <Widget className="off" span="off">
        <PhotoStack bleed tints={GREYS} />
      </Widget>
    </motion.div>
  );
}

function Work({ go, pid }: { go: Go; pid?: string }) {
  const open = PROJECTS.find(p => p.id === pid);
  return (
    <motion.div className="grid wk" variants={viewV} initial="initial" animate="enter" exit="exit">
      <motion.header className="vhead" variants={wV}><h2>Work</h2><p>{PROJECTS.length} projects · product, motion and interaction</p></motion.header>
      <div className="pgrid">
        {PROJECTS.map((p, i) => (
          <motion.div key={p.id} className="pcell" variants={wV}>
            {open?.id === p.id ? <div className="pcard ghost" aria-hidden="true" /> : (
              <motion.button type="button" className="pcard" layoutId={`p-${p.id}`} onClick={() => go('work', p.id)} whileHover={{ y: -2 }} whileTap={{ scale: .985 }} transition={{ type: 'spring', bounce: .2, duration: .5 }}>
                <motion.i className="thumb" layoutId={`pt-${p.id}`} style={{ '--t1': GREYS[i % GREYS.length][0], '--t2': GREYS[i % GREYS.length][1] } as React.CSSProperties} />
                <motion.span className="pcard-t" layoutId={`pn-${p.id}`}><b>{p.title}</b><small>{p.client} · {p.year}</small></motion.span>
                <span className="chev" aria-hidden="true">→</span>
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {open && (
          <motion.article key={open.id} className="pdetail" layoutId={`p-${open.id}`} transition={{ type: 'spring', bounce: .1, duration: .55 }}>
            <header className="pd-head">
              <button type="button" className="back" onClick={() => go('work')} aria-label="Back to work"><span className="chev" aria-hidden="true">←</span> Work</button>
              <motion.i className="thumb" layoutId={`pt-${open.id}`} style={{ '--t1': GREYS[0][0], '--t2': GREYS[0][1] } as React.CSSProperties} />
              <motion.div className="pd-title" layoutId={`pn-${open.id}`}><h2>{open.title}</h2><p>{open.client} · {open.role} · {open.year}</p></motion.div>
            </header>
            <motion.div className="pd-body" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: .2, duration: .3 } }} exit={{ opacity: 0, transition: { duration: .1 } }}>
              <div className="pd-main">
                <p className="pd-lede">{open.blurb}</p>
                {['Context', 'What I did', 'States and motion', 'Outcome'].map(h => <section key={h} className="pd-sec"><h4>{h}</h4><div className="ph" aria-hidden="true" /><p className="dim3">Case-study content · placeholder</p></section>)}
              </div>
              <aside className="pd-side">
                <dl><dt>Client</dt><dd>{open.client}</dd><dt>Role</dt><dd>{open.role}</dd><dt>Year</dt><dd>{open.year}</dd></dl>
                <ul className="pills3">{open.tags.map(t => <li key={t}>{t}</li>)}</ul>
              </aside>
            </motion.div>
          </motion.article>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Play() {
  const [sw, setSw] = useState(false);
  return (
    <motion.div className="grid pl" variants={viewV} initial="initial" animate="enter" exit="exit">
      <motion.header className="vhead" variants={wV}><h2>Playground</h2><p>Small moments, built to be felt. Each one runs live.</p></motion.header>
      <Widget title="Like" span="a"><div className="demo"><Like /></div><p className="dim3">Overshoot on press, particles on release, a count that rolls.</p></Widget>
      <Widget title="Switch" span="b"><div className="demo"><Switch on={sw} onChange={setSw} /></div><p className="dim3">Squash on the way, settle with a small bounce.</p></Widget>
      <Widget title="Stepper" span="c"><div className="demo"><Stepper /></div><p className="dim3">Digits roll in the direction of the change.</p></Widget>
      <Widget title="Segmented" span="d"><div className="demo"><Segmented /></div><p className="dim3">The highlight travels; it never blinks.</p></Widget>
    </motion.div>
  );
}

function MotionView() {
  return (
    <motion.div className="grid mo" variants={viewV} initial="initial" animate="enter" exit="exit">
      <motion.header className="vhead" variants={wV}><h2>Motion</h2><p>Lotties and reels — what shipped, running.</p></motion.header>
      <Widget title="B, Lenskart's AI assistant" span="a"><Lottie className="lot big" src={L.b} still={150} label="B, cycling through its states" /><p className="dim3">All states, back to back.</p></Widget>
      <Widget title="Vector 3D plugin" span="b"><Lottie className="lot coin" src={L.coin} still={84} label="A rupee coin turning in faux 3D" /><p className="dim3">A faux-3D coin, one turn.</p></Widget>
      <Widget title="Lenskart loader" span="c"><Lottie className="lot ld big" src={L.loader} drop={dropLoaderText} viewBox="113 34 72 34" still={60} label="Lenskart's loader" /><p className="dim3">The infinity loader.</p></Widget>
      {REELS.map((r, i) => <Widget key={r.name} title={r.name} span={`r${i + 1}`}><div className="reel-ph" aria-hidden="true"><span>{r.letter}</span></div><p className="dim3">{r.meta} · placeholder</p></Widget>)}
    </motion.div>
  );
}

function Notes() {
  return (
    <motion.div className="grid no" variants={viewV} initial="initial" animate="enter" exit="exit">
      <motion.header className="vhead" variants={wV}><h2>Notes</h2><p>Write-ups, experiments and the odd feature.</p></motion.header>
      <Widget span="list">
        <ul className="nlist big">{WRITING.map(w => <li key={w.title}><a href={w.href}><b>{w.title}</b><small>{w.meta} · {w.year}</small><span className="chev" aria-hidden="true">→</span></a></li>)}</ul>
      </Widget>
    </motion.div>
  );
}

function About() {
  return (
    <motion.div className="grid ab" variants={viewV} initial="initial" animate="enter" exit="exit">
      <motion.header className="vhead" variants={wV}><h2>About</h2><p>{COPY.aboutTitle}</p></motion.header>
      <Widget span="copy"><p className="about-p">{COPY.about}</p><ul className="pills3 mt">{SKILLS03.map(s => <li key={s}>{s}</li>)}</ul></Widget>
      <Widget title="Experience" action="CV" onAction={() => { location.href = LINKS.cv; }} span="xp">
        <ol className="xp3">{EXPERIENCE.map(e => <li key={e.company}><b>{e.company}</b><span>{e.role}</span><small>{e.years}</small></li>)}</ol>
        <p className="dim3 mt">Clients: {CLIENTS.join(', ')}</p>
      </Widget>
      <Widget className="off" span="off"><PhotoStack bleed tints={GREYS} /></Widget>
      <Widget title="Contact" span="ct"><p className="about-p">{LINKS.email}</p><div className="hero3-cta"><a className="btn3" href={LINKS.linkedin} target="_blank" rel="noopener">LinkedIn</a><a className="btn3 ghost" href={LINKS.lottiefiles}>LottieFiles</a></div></Widget>
    </motion.div>
  );
}

/* ---------- the iteration ---------- */
export default function Iteration03() {
  const nav = useNavigate();
  const params = useParams<{ view?: string; pid?: string }>();
  const view: View = isView(params.view) ? params.view : 'overview';
  const pid = view === 'work' ? params.pid : undefined;
  const { isDark, toggle } = useTheme();
  const [cmd, setCmd] = useState(false);
  const reduce = useReducedMotion();

  const go: Go = useCallback((v, p) => { nav(`/lab/03-console${v === 'overview' ? '' : '/' + v}${p ? '/' + p : ''}`); }, [nav]);

  /* ⌘K / ctrl+K / "/" open the command bar; Esc closes an open project */
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA';
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmd(o => !o); }
      else if (e.key === '/' && !typing) { e.preventDefault(); setCmd(true); }
      else if (e.key === 'Escape' && !cmd && pid) go('work');
    };
    addEventListener('keydown', on); return () => removeEventListener('keydown', on);
  }, [cmd, pid, go]);

  const cmds: Cmd[] = useMemo(() => [
    ...VIEWS.map(v => ({ id: v.id, label: v.label, hint: 'Section', run: () => go(v.id) })),
    ...PROJECTS.map(p => ({ id: 'p' + p.id, label: p.title, hint: 'Project', run: () => go('work', p.id) })),
    { id: 'theme', label: isDark ? 'Switch to light' : 'Switch to dark', hint: 'Theme', run: toggle },
    { id: 'cv', label: 'Open CV', hint: 'Link', run: () => { location.href = LINKS.cv; } },
  ], [go, isDark, toggle]);
  /* scripted answers for free text; the real assistant replaces this */
  const ask = (q: string) => {
    const s = q.toLowerCase();
    if (/travel|cook|food|spiti|jimny|trek|mountain/.test(s)) return 'Off the clock: mountains, a Jimny, and a lot of recipes. The photo stack in About has some of it.';
    if (/tool|stack|after effects|rive|lottie/.test(s)) return 'After Effects, Lottie, Rive and JavaScript, mostly. The Motion section shows what comes out of them.';
    if (/hire|contact|email|available|open/.test(s)) return 'Contact is in About — email and LinkedIn.';
    return "I'm scripted for now — try a section or a project name. The real assistant arrives in a later iteration.";
  };

  const page = VIEWS.find(v => v.id === view)!;
  const title = pid ? PROJECTS.find(p => p.id === pid)?.title ?? page.label : page.label;

  return (
    <div className="it03">
      {/* sidebar (desktop) */}
      <aside className="side">
        <button type="button" className="me" onClick={() => go('overview')}>
          <span className="me-av"><img src={cutout} alt="" /></span>
          <span className="me-t"><b>Nitish Bhardwaj</b><small>Product designer</small></span>
        </button>
        <nav className="snav" aria-label="Sections">
          {VIEWS.map(v => (
            <button key={v.id} type="button" className={v.id === view ? 'on' : ''} aria-current={v.id === view ? 'page' : undefined} onClick={() => go(v.id)}>
              {v.id === view && <motion.span className="snav-ind" layoutId="snav-ind" transition={reduce ? { duration: 0 } : { type: 'spring', bounce: .15, visualDuration: .32 }} />}
              <Icon d={v.icon} /><span>{v.label}</span>
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <a className="btn3 small" href={LINKS.cv}><span className="lbl">View CV</span> <span className="chev" aria-hidden="true">↗</span></a>
          <button type="button" className="tbtn" onClick={toggle} aria-label={isDark ? 'Switch to light' : 'Switch to dark'}><Icon d={isDark ? 'M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' : 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z'} /><span className="lbl">{isDark ? 'Light' : 'Dark'}</span></button>
        </div>
      </aside>

      {/* top bar */}
      <header className="top">
        <div className="crumb"><span className="dim3">Console</span><span className="sep" aria-hidden="true">/</span><b>{title}</b></div>
        <button type="button" className="ask" onClick={() => setCmd(true)}><span className="ask-ic" aria-hidden="true">⌕</span><span>Ask or jump to…</span><kbd>⌘K</kbd></button>
        <div className="status"><i className="dot" aria-hidden="true" /><span>Open to work</span></div>
      </header>

      {/* main */}
      <main className="main">
        <div className="mhead"><h1>{title}</h1></div>
        <AnimatePresence mode="wait" initial={false}>
          {view === 'overview' && <Overview key="overview" go={go} />}
          {view === 'work' && <Work key="work" go={go} pid={pid} />}
          {view === 'play' && <Play key="play" />}
          {view === 'motion' && <MotionView key="motion" />}
          {view === 'notes' && <Notes key="notes" />}
          {view === 'about' && <About key="about" />}
        </AnimatePresence>
      </main>

      {/* tab bar (phones) */}
      <nav className="tabs" aria-label="Sections">
        {VIEWS.filter(v => v.id !== 'notes').map(v => (
          <button key={v.id} type="button" className={v.id === view ? 'on' : ''} aria-current={v.id === view ? 'page' : undefined} onClick={() => go(v.id)}>
            {v.id === view && <motion.span className="tab-ind" layoutId="tab-ind" transition={reduce ? { duration: 0 } : { type: 'spring', bounce: .15, visualDuration: .32 }} />}
            <Icon d={v.icon} /><span>{v.short}</span>
          </button>
        ))}
      </nav>

      <CommandBar open={cmd} onClose={() => setCmd(false)} cmds={cmds} onAsk={ask} />
      <Link className="labtag" to="/lab">Lab · 03 Console</Link>
    </div>
  );
}
