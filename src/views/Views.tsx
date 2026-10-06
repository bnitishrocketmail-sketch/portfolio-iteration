import { useState } from 'react';
import { motion } from 'motion/react';
import { EXPERIENCE, LINKS, PROJECTS, REELS, WRITING, type Project, type ViewName } from '../lib/data';
import { container, item } from '../lib/motion';
import { Clients, Fused, LifeStack, MicroTile, Statement, Tools } from '../components/tiles/Tiles';
import { Like, Segmented, Stepper } from '../components/micro/Widgets';
import './views.css';

type Go = (view: ViewName, pid?: string) => void;
type ViewProps = { onGo: Go; dir: number };

/* Every view is a motion.section driving the stagger; its items carry `variants={item}`. */
function View({ className, dir, children }: { className: string; dir: number; children: React.ReactNode }) {
  return (
    <motion.section className={`view ${className}`} variants={container} initial={dir > 0 ? 'initF' : 'initB'} animate="enter" exit="exit">
      {children}
    </motion.section>
  );
}

function Head({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
  return (
    <motion.header className="view-head" variants={item}>
      <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
      <p className="view-note">{note}</p>
    </motion.header>
  );
}

export function ProjectCard({ p, onGo, wide }: { p: Project; onGo: Go; wide?: boolean }) {
  return (
    <motion.button className={`proj hoverable${wide ? ' wide' : ''}`} type="button" variants={item}
      style={{ '--m1': p.m1, '--m2': p.m2 } as React.CSSProperties} onClick={() => onGo('project', p.id)}>
      <div className="pmedia"><span className="pletter">{p.letter}</span><i className="brk h" aria-hidden="true" /></div>
      <div className="pbody"><h3>{p.title}</h3><p>{p.blurb}</p><ul className="tags">{p.tags.map(t => <li key={t}>{t}</li>)}</ul></div>
    </motion.button>
  );
}

export function Home({ onGo, dir }: ViewProps) {
  return (
    <View className="home" dir={dir}>
      <Statement onGo={onGo} />
      <MicroTile onGo={onGo} />
      <Tools />
      <LifeStack />
      <Clients />
      <Fused onGo={onGo} />
    </View>
  );
}

export function Projects({ onGo, dir }: ViewProps) {
  return (
    <View className="projects" dir={dir}>
      <Head eyebrow="Selected work" title="Projects" note="Product work, motion systems and the tools built along the way. Open one and the intro card becomes the project card." />
      <div className="pgrid">{PROJECTS.map(p => <ProjectCard key={p.id} p={p} onGo={onGo} wide={p.wide} />)}</div>
    </View>
  );
}

export function ProjectDetail({ onGo, dir, project }: ViewProps & { project: Project }) {
  const i = PROJECTS.findIndex(p => p.id === project.id);
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const vars = { '--m1': project.m1, '--m2': project.m2 } as React.CSSProperties;
  return (
    <View className="project" dir={dir}>
      <motion.article className="article" variants={item}>
        <div className="article-in" style={vars}>
          <p className="eyebrow">{project.client} · case study</p>
          <h2>{project.title}</h2>
          <p>{project.blurb} Case-study copy comes later; this container is the reading column — it scrolls on its own while the project card on the left stays put.</p>
          <div className="media">hero video · lottie placeholder</div>
          <h3>Context</h3><p>What the product needed, who it was for, and where motion had to carry weight that layout and copy could not.</p>
          <h3>Problem</h3><p>The specific thing that was jerky, inconsistent or unclear — stated the way a user would feel it, not the way a system would describe it.</p>
          <div className="media tall">before · after placeholder</div>
          <h3>Approach</h3><p>The states, the rules between them, and what was prototyped before anything was built. Rigs, tokens and timings that other screens could inherit.</p>
          <h3>Outcome</h3><p>What shipped, what was measured, what was left on the table.</p>
          <div className="media">final · in-context placeholder</div>
        </div>
      </motion.article>
      <aside className="side">
        <motion.p className="eyebrow" variants={item} style={{ padding: '2px 4px 0' }}>Next project</motion.p>
        <ProjectCard p={next} onGo={onGo} />
        <motion.div className="side-cta" variants={item}>
          <p className="eyebrow">All projects</p>
          <button className="more" type="button" onClick={() => onGo('projects')}>Back to the grid <span className="arr" aria-hidden="true">→</span></button>
        </motion.div>
      </aside>
    </View>
  );
}

export function Micro({ dir }: ViewProps) {
  return (
    <View className="micro-view" dir={dir}>
      <Head eyebrow="Showcase" title="Micro-interactions" note="Small moments, built to be felt. Each one runs live — press, drag, switch." />
      <div className="mgrid">
        <motion.div className="mi" variants={item}><div className="bezel"><Like /></div><h3>Like, with a burst</h3><p>Overshoot on the press, particles on the release, a count that rolls.</p></motion.div>
        <motion.div className="mi" variants={item}><div className="bezel"><Stepper /></div><h3>Rolling stepper</h3><p>Digits roll in the direction they change, so the number reads as a quantity.</p></motion.div>
        <motion.div className="mi" variants={item}><div className="bezel"><Segmented /></div><h3>Segmented control</h3><p>The pill travels between states; it never teleports.</p></motion.div>
      </div>
    </View>
  );
}

export function Campaign({ dir }: ViewProps) {
  return (
    <View className="campaign" dir={dir}>
      <Head eyebrow="Showcase" title="Campaign & motion graphics" note="Brand and promotional motion — reels, banner sets, launch films. Wide, dark, full-bleed." />
      <div className="rgrid">
        {REELS.map(r => (
          <motion.figure key={r.name} className={`reel${r.wide ? ' wide' : ''}`} variants={item} style={{ '--a': r.a, '--b': r.b } as React.CSSProperties}>
            <div className="reel-art" /><span className="pletter">{r.letter}</span>
            <figcaption><span>{r.name}</span><span className="mono-s time">{r.meta}</span></figcaption>
          </motion.figure>
        ))}
      </div>
    </View>
  );
}

export function Writing({ dir }: ViewProps) {
  return (
    <View className="writing" dir={dir}>
      <Head eyebrow="Writing & research" title="Notes" note="Experiment write-ups, published tools and places the work has been featured." />
      <div className="rows">
        {WRITING.map(w => (
          <motion.a key={w.title} className="row" href={w.href} variants={item}>
            <span className="row-t">{w.title}</span><span className="row-m">{w.meta}</span><span className="row-y">{w.year}</span><span className="arr" aria-hidden="true">→</span>
          </motion.a>
        ))}
      </div>
    </View>
  );
}

export function Experience({ dir }: ViewProps) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const done = () => { setCopied(true); window.setTimeout(() => setCopied(false), 1400); };
    navigator.clipboard?.writeText(LINKS.email).then(done).catch(() => { /* selection fallback: the code element is user-select: all */ });
  };
  return (
    <View className="experience" dir={dir}>
      <Head eyebrow="Experience" title="Where the work shipped" note="Consumer products in India — grocery, eyewear, payments." />
      <div className="rows">
        {EXPERIENCE.map(x => (
          <motion.a key={x.company} className="row" href="#" variants={item}>
            <span className="row-t">{x.company}</span><span className="row-m">{x.role}</span><span className="row-y">{x.years}</span><span className="arr" aria-hidden="true">→</span>
          </motion.a>
        ))}
      </div>
      <motion.div className="xp-foot" variants={item}>
        <p className="view-note">The full timeline, tools and references are in the CV.</p>
        <a className="btn" href={LINKS.cv}>Download CV <span className="arr" aria-hidden="true">↓</span></a>
      </motion.div>
      <motion.div className="contact" variants={item}>
        <div className="foot-mail"><code>{LINKS.email}</code><button className="copy" type="button" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button></div>
        <div className="foot-soc">
          <a className="pill" href={LINKS.linkedin} target="_blank" rel="noopener">LinkedIn</a>
          <a className="pill" href={LINKS.lottiefiles}>LottieFiles</a>
          <a className="pill" href={LINKS.instagram}>Instagram</a>
        </div>
      </motion.div>
    </View>
  );
}
