import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import type { Project } from '../../lib/data';
import { COPY, LINKS, SKILLS } from '../../lib/data';
import { LOADER_VIEWBOX, LOTTIES, STILL, dropLoaderText } from '../../lib/lotties';
import { Lottie } from '../micro/Lottie';
import cutout from '../../assets/nitish-phone-cutout.webp';
import './hero.css';

/* The notched top-left corner: a sheet-coloured cover with the label sitting in it. */
export function Notch() {
  return (
    <svg className="notch" viewBox="0 0 171 57" aria-hidden="true">
      <path d="M0 0H171Q160 1 151 10L119 45H13A12 12 0 0 0 1 57V0Z" fill="currentColor" />
    </svg>
  );
}

/* 02b's circle (LOG, 02b history b8), carried over as is: one centre on the figure, the disc r = .548 of the tile's
   height, a concentric stroke r = .593 drawn as two broken arcs. Here the "tile" is a virtual box inside the stage
   (hero.css, --T); the arcs are drawn in a unit box and scaled by CSS. Screen angles, clockwise from 3 o'clock. */
function strokeArcs() {
  const c = 50, r = 50;
  const P = (deg: number) => { const a = deg * Math.PI / 180; return `${(c + r * Math.cos(a)).toFixed(2)} ${(c + r * Math.sin(a)).toFixed(2)}`; };
  const arc = (a0: number, a1: number) => { const sweep = a1 > a0 ? 1 : 0, large = Math.abs(a1 - a0) > 180 ? 1 : 0; return `M ${P(a0)} A ${r} ${r} 0 ${large} ${sweep} ${P(a1)}`; };
  return `${arc(-116, -238)} ${arc(55, 76)}`; /* ref: -117.5° → 121.5° counter-clockwise through 180°; 57.5° → 76° */
}
const ARCS = strokeArcs();

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
    ref.current.querySelectorAll<HTMLElement>('.fcd').forEach(c => {
      const d = Number(c.dataset.depth);
      c.style.setProperty('--px', (dx * 26 * d).toFixed(1) + 'px');
      c.style.setProperty('--py', (dy * 18 * d).toFixed(1) + 'px');
    });
  };
  const resetChips = () => ref.current?.querySelectorAll<HTMLElement>('.fcd').forEach(c => { c.style.setProperty('--px', '0px'); c.style.setProperty('--py', '0px'); });

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
          {/* the figure: 02b's hero composition (Nitish, 12 Oct — "as is"): the lighter disc, the broken stroke, his cutout masked by
              the disc's lower half, and the three Lottie cards at 02b's positions. The title and description cards stay out: the
              name and the line are the text below. */}
          <div className="stage" aria-hidden="true">
            <i className="fg-disc" />
            <svg className="fg-stroke" viewBox="0 0 100 100"><path d={ARCS} vectorEffect="non-scaling-stroke" /></svg>
            <div className="fg-clip"><img className="fg-person" src={cutout} alt="" /></div>
            <span className="fg-shape alt" style={{ left: '6%', '--ty': .38 } as React.CSSProperties} />
            <span className="fg-shape" style={{ right: '7%', '--ty': .48 } as React.CSSProperties} />
            <span className="fg-shape tri" style={{ left: '15%', '--ty': .52 } as React.CSSProperties} />
            <div className="fcd glass ai" data-depth="1.3" style={{ left: '16%', '--ty': .10, '--dur': '5.6s', '--dl': '-1s' } as React.CSSProperties}>
              <div className="fcd-in"><Lottie className="bl" src={LOTTIES.b} still={STILL.b} label="B, Lenskart's AI assistant, cycling through its states" /><span className="cap">Lenskart's<br />AI assistant</span></div>
            </div>
            <div className="fcd behind coin-card" data-depth=".6" style={{ left: '63%', '--ty': -.11, '--dur': '7s', '--dl': '-3.3s' } as React.CSSProperties}>
              <div className="fcd-in"><Lottie className="coin" src={LOTTIES.coin} still={STILL.coin} label="A rupee coin turning, made with the Vector 3D plugin" /><span className="cap">Vector 3D plugin</span></div>
            </div>
            <div className="fcd loader-card" data-depth="1.25" style={{ left: '72%', '--ty': .38, '--dur': '5.8s', '--dl': '-1.7s' } as React.CSSProperties}>
              <div className="fcd-in"><Lottie className="lk" src={LOTTIES.loader} drop={dropLoaderText} viewBox={LOADER_VIEWBOX} still={STILL.loader} label="Lenskart's infinity-glasses loader" /><span className="cap">Loader animation</span></div>
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
