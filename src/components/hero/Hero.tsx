import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import type { Project } from '../../lib/data';
import { COPY, LINKS, SKILLS } from '../../lib/data';
import './hero.css';

/* The notched top-left corner: a sheet-coloured cover with the label sitting in it. */
export function Notch() {
  return (
    <svg className="notch" viewBox="0 0 171 57" aria-hidden="true">
      <path d="M0 0H171Q160 1 151 10L119 45H13A12 12 0 0 0 1 57V0Z" fill="currentColor" />
    </svg>
  );
}

const CHIPS = [
  { label: 'Lottie', color: '#2BC48A', depth: 1.3, style: { top: '30%', right: '3%', '--dur': '5.6s', '--dl': '-1s' } },
  { label: 'Rive', color: '#F5BD56', depth: .6, behind: true, style: { top: '66%', left: '2%', '--dur': '6.4s', '--dl': '-2.5s' } },
  { label: 'After Effects', color: '#9A82D6', depth: 1.1, style: { top: '72%', right: '6%', '--dur': '5.1s', '--dl': '-.6s' } },
] as const;

type Props = { project?: Project | null; onBack?: () => void; onCv?: () => void };

export default function Hero({ project, onBack, onCv }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [flipped, setFlipped] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const reduce = useReducedMotion();
  const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
  const inProject = !!project;

  useEffect(() => { if (inProject) setFlipped(false); }, [inProject]);

  /* hover with intent: a short delay in, a slightly longer one out */
  const enter = () => { if (!canHover || inProject) return; window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setFlipped(true), 190); };
  const leave = () => { if (!canHover) return; window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setFlipped(false), 280); resetChips(); };

  /* depth chips follow the pointer by their depth factor */
  const move = (e: React.PointerEvent) => {
    if (!canHover || reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
    ref.current.querySelectorAll<HTMLElement>('.chip').forEach(c => {
      const d = Number(c.dataset.depth);
      c.style.setProperty('--px', (dx * 26 * d).toFixed(1) + 'px');
      c.style.setProperty('--py', (dy * 18 * d).toFixed(1) + 'px');
    });
  };
  const resetChips = () => ref.current?.querySelectorAll<HTMLElement>('.chip').forEach(c => { c.style.setProperty('--px', '0px'); c.style.setProperty('--py', '0px'); });

  const toggle = (e: React.MouseEvent) => { e.stopPropagation(); window.clearTimeout(timer.current); setFlipped(f => !f); };

  return (
    <aside ref={ref} className={`hero${flipped ? ' flipped' : ''}${inProject ? ' in-project' : ''}`} aria-label="Intro card"
      onPointerEnter={enter} onPointerLeave={leave} onPointerMove={move}
      onClick={() => { if (!canHover && !inProject) setFlipped(f => !f); }}>
      <div className="hero-card">
        {/* front */}
        <div className="face front">
          <Notch />
          <button className="notch-btn" type="button" aria-label="Flip to about" onClick={toggle}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z" /></svg>
            About me
          </button>
          <span className="tap-hint" aria-hidden="true">tap to flip</span>
          <div className="stage">
            <div className="portrait" aria-hidden="true">
              {/* PLACEHOLDER silhouette until the cutout photo arrives */}
              <svg viewBox="0 0 200 220"><g fill="#2B2C35"><circle cx="100" cy="78" r="46" /><path d="M28 220c0-50 30-82 72-82s72 32 72 82z" /></g><path d="M62 70c4-30 24-44 44-44 18 0 34 10 36 36-6-8-16-12-26-10-12 2-20 10-30 10-10 0-18-2-24 8z" fill="#1E1F27" /></svg>
            </div>
            {CHIPS.map(c => (
              <div key={c.label} className={`chip${'behind' in c && c.behind ? ' behind' : ''}`} data-depth={c.depth} style={c.style as React.CSSProperties}>
                <span className="chip-in"><span className="dot" style={{ '--c': c.color } as React.CSSProperties} />{c.label}</span>
              </div>
            ))}
            <div className="chip behind tilechip" data-depth=".7" style={{ top: '20%', left: '2%', '--dur': '7s', '--dl': '-3.4s' } as React.CSSProperties}>
              <span className="chip-in"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>coin rig</span>
            </div>
          </div>
          <div className="hero-text">
            <span className="lt">Hi, I'm</span>
            <div className="nm">Nitish<br />Bhardwaj</div>
            <p className="st"><span>Product designer.</span> <strong>I make UI move.</strong></p>
            <p className="hero-lede">{COPY.lede}</p>
            <div className="hero-cta">
              <button className="btn" type="button" onClick={e => { e.stopPropagation(); onCv?.(); }}>View CV <span className="arr" aria-hidden="true">↗</span></button>
              <a className="pill" href={LINKS.linkedin} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}>LinkedIn</a>
              <a className="pill" href={LINKS.lottiefiles} onClick={e => e.stopPropagation()}>LottieFiles</a>
              <a className="pill" href="#" onClick={e => e.stopPropagation()}>Email</a>
            </div>
          </div>
          <div className="badge" aria-hidden="true">
            <svg viewBox="0 0 80 80">
              <defs><path id="bp" d="M40,40 m-29,0 a29,29 0 1,1 58,0 a29,29 0 1,1 -58,0" /></defs>
              <circle cx="40" cy="40" r="40" style={{ fill: 'var(--coal)' }} />
              <text fontSize="8" letterSpacing="1" style={{ fill: '#fff', fontFamily: 'var(--mono)' }}><textPath href="#bp">MOTION · INTERACTION · CODE · </textPath></text>
              <circle cx="40" cy="40" r="7" style={{ fill: 'var(--amber)' }} />
            </svg>
          </div>
        </div>
        {/* back */}
        <div className="face back">
          <Notch />
          <button className="notch-btn" type="button" aria-label="Flip back to intro" onClick={toggle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
            Intro
          </button>
          <div className="back-in">
            <p className="eyebrow">About</p>
            <h3>{COPY.aboutTitle}</h3>
            <p>{COPY.about}</p>
            <ul className="skills">{SKILLS.map(s => <li key={s}>{s}</li>)}</ul>
          </div>
        </div>
      </div>

      {/* project mode of the same card */}
      <div className="hero-proj" aria-hidden={!inProject}>
        <Notch />
        <button className="notch-btn" type="button" onClick={e => { e.stopPropagation(); onBack?.(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
          Projects
        </button>
        {project && (
          <>
            <div className="hp-medal" style={{ '--m1': project.m1, '--m2': project.m2 } as React.CSSProperties}><span>{project.letter}</span></div>
            <div className="hp-body">
              <p className="eyebrow">{project.client}</p>
              <h3>{project.title}</h3>
              <p>{project.blurb}</p>
              <dl className="hp-meta"><div><dt>Role</dt><dd>{project.role}</dd></div><div><dt>Year</dt><dd>{project.year}</dd></div></dl>
              <ul className="skills">{project.tags.map(t => <li key={t}>{t}</li>)}</ul>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
