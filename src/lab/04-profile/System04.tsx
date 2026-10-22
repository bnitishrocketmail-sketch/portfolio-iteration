import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { siLottiefiles } from 'simple-icons';
import { COPY, LINKS, NAV04 as NAV, PROJECTS } from '../../lib/data';
import { useTheme } from '../../lib/theme';
import { readTweaks, tweakKey, writeTweaks } from './tokens';
import Controls04 from './Controls04';
import './profile.css';
import './system.css';

/* 04's design system (Nitish, 14 Oct): not a page of the portfolio — reached from the pill at the profile's corner. Two
   sheets, dark and light, each drawing the type scale and every element with the profile's own classes and tokens on a
   1320-wide frame zoomed to fit; at the right, the controls, grouped (type: faces, weights, sizes; colours: surfaces, text,
   controls and marks; the intro's cards), per mode. Values are kept in the browser per mode (tokens.ts) and the profile
   reads them — in another tab too, on the storage event. */
const SOCIAL = [
  { label: 'LinkedIn', path: String(faLinkedinIn.icon[4]), box: `0 0 ${faLinkedinIn.icon[0]} ${faLinkedinIn.icon[1]}` },
  { label: 'Instagram', path: String(faInstagram.icon[4]), box: `0 0 ${faInstagram.icon[0]} ${faInstagram.icon[1]}` },
  { label: 'LottieFiles', path: siLottiefiles.path, box: '0 0 24 24' },
  { label: 'Email', path: 'M2 5h20v14H2zm1 1v1.2l9 6 9-6V6zm18 2.4-9 6-9-6V18h18z', box: '0 0 24 24' },
];

function Sheet({ dark, values }: { dark: boolean; values: Record<string, string> }) {
  const p = PROJECTS[0];
  return (
    <section className="sys-sheet">
      <h2>{dark ? 'Dark' : 'Light'}</h2>
      <div className={`it04 sys${dark ? '' : ' light'}`} style={values as React.CSSProperties}>
        <div className="sys-page-in sys-grid">
          {/* type */}
          <div className="sys-block">
            <h3>Type</h3>
            <div className="sys-type">
              {/* five styles, each one size and one weight (21 Oct: "some were too specific"); the home page's compositions
                  are built from them and shown under their own heading, so a style can be reused on its own */}
              <div><span className="sys-cap">H1 · a name, a page</span><span className="nm4">Nitish</span></div>
              <div><span className="sys-cap">H2 · a section's heading</span><span className="h2-4">Projects</span></div>
              <div><span className="sys-cap">Title · a card's or an item's name</span><b className="pc-name" style={{ position: 'static' }}><b>{p.title}</b></b></div>
              <div><span className="sys-cap">Body · copy</span><p className="sub4" style={{ margin: 0 }}>I design feedback rich interfaces powered by motion.</p></div>
              <div><span className="sys-cap">Meta · under a title, counts, labels</span><b className="pc-name" style={{ position: 'static' }}><small>{p.client} · {p.year}</small></b></div>
            </div>
            <h4 className="sys-sub">Compositions on the home page, from the styles above</h4>
            <div className="sys-type">
              <div><span className="sys-cap">The name · two H1 lines, the surname light</span><span className="nm4">Nitish<br /><b>Bhardwaj</b></span></div>
              <div><span className="sys-cap">The title line · Meta size, Title weight; the rolling word in its own shade</span><span className="role4"><span className="rw4" style={{ width: 'auto' }}><span className="rw4-w" style={{ position: 'static' }}>Interaction</span></span> designer</span></div>
              <div><span className="sys-cap">A card's head · Title over Meta (the project cards, Off duty)</span><b className="pc-name" style={{ position: 'static' }}><b>{p.title}</b><small>{p.client} · {p.year}</small></b></div>
              <div><span className="sys-cap">Glass text · Body on the glass ink</span><p className="lede4" style={{ margin: 0 }}>{COPY.lede}</p></div>
              <div><span className="sys-cap">Nav names · Meta weight at 13px</span><span style={{ font: '500 13px/1 var(--f-copy)', color: 'var(--nav-ink)', background: 'var(--nav-bg)', padding: '8px 12px', borderRadius: 999 }}>{NAV.map(n => n.label).join('   ')}</span></div>
            </div>
          </div>
          {/* elements */}
          <div className="sys-block">
            <h3>Elements</h3>
            <div className="sys-row">
              <div className="sys-nav">
                <div className="navcol4">
                  <nav className="nav4"><ul>
                    <i className="hl4" aria-hidden="true"><span className="hltx4"><span className="lbl4"><span>Intro</span></span></span></i>
                    {NAV.slice(0, 3).map((n, i) => <li key={n.id}><button type="button" className={i === 0 ? 'on' : ''}><span className="lbl4"><span>{n.label}</span></span></button></li>)}
                  </ul></nav>
                  <button type="button" className="ai4" aria-label="Assistant"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 14 9l6.5 2L14 13l-2 6.5L10 13l-6.5-2L10 9z" fill="currentColor" /></svg></button>
                </div>
                <span className="sys-cap">Nav bar, highlight,<br />assistant</span>
              </div>
              <div className="sys-block">
                <a className="cv4" href={LINKS.cv} onClick={e => e.preventDefault()}>View CV <span aria-hidden="true">↗</span></a>
                <div className="links4">{SOCIAL.map(l => <a key={l.label} href="#" onClick={e => e.preventDefault()} aria-label={l.label}><svg viewBox={l.box} aria-hidden="true"><path d={l.path} fill="currentColor" /></svg></a>)}</div>
                <div className="sys-corner"><i className="corner4" aria-hidden="true" /></div>
                <span className="sys-cap">CV button · social icons · corner bracket</span>
              </div>
              <div className="sys-glass"><div className="name4"><p className="lede4">{COPY.lede}</p></div><span className="sys-cap">Glass box</span></div>
              <div className="sys-block">
                <div className="fl4-in" style={{ width: 'max-content' }}><i className="sys-lottie" aria-hidden="true" /><span className="cap">Lenskart's<br />AI assistant</span></div>
                <span className="sys-cap">Floating card (glass)</span>
              </div>
            </div>
          </div>
          {/* the cards, at nearer their real sizes, across the sheet */}
          <div className="sys-block sys-wide">
            <h3>Cards</h3>
            <div className="sys-row">
              <div className="sys-block">
                <div className="sys-pcards">
                  <article className="pp4-card open"><div className="pp4-cover" aria-hidden="true"><span className="pletter">{p.letter}</span></div><div className="pp4-open">
                    <div className="pp4-top"><h3 className="pp4-title">{p.title}</h3><p className="pp4-blurb">{p.blurb}</p></div>
                    <ul className="pp4-chips">{p.tags.map(t => <li key={t}>{t}</li>)}</ul><span className="pp4-meta">{p.client} · {p.role} · {p.year}</span>
                    <button type="button" className="pp4-arrow" aria-label="Open"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                  </div></article>
                  <article className="pp4-card fold"><div className="pp4-cover" aria-hidden="true"><span className="pletter">{PROJECTS[1].letter}</span></div><div className="pp4-fold"><span className="pp4-vt">{PROJECTS[1].title}</span><span className="pp4-vm">{PROJECTS[1].client} · {PROJECTS[1].year}</span><span className="pp4-vm dim">{PROJECTS[1].tags.join(' · ')}</span></div></article>
                </div>
                <span className="sys-cap">Project cards, open and folded</span>
              </div>
              <div className="sys-block">
                <div className="sys-stack">
                  {PROJECTS.slice(0, 3).map((q, k) => { const r = 2 - k; return <button key={q.id} type="button" className={`pcard4${r ? ' back' : ''}`} style={{ bottom: `calc(${r * .58} * ${100 / 2.16}%)`, zIndex: 10 - r, background: `var(--card-${['front', 'mid', 'back'][r]})` }}><i className="tab4" aria-hidden="true" /><span className="pc-name"><b>{q.title}</b><small>{q.client} · {q.year}</small></span></button>; })}
                </div>
                <span className="sys-cap">The intro's stack</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function System04() {
  const { isDark, toggle } = useTheme();
  const sheetsRef = useRef<HTMLDivElement>(null);
  const [z, setZ] = useState(.6);
  useEffect(() => { const el = sheetsRef.current; if (!el) return; const fit = () => setZ(Math.min(1, (el.clientWidth - 56) / 1320)); fit(); const ro = new ResizeObserver(fit); ro.observe(el); return () => ro.disconnect(); }, []);
  const mode = isDark; /* the panel edits the mode the site is in, as on the profile */
  const [dark, setDarkV] = useState<Record<string, string>>(() => readTweaks(true));
  const [light, setLightV] = useState<Record<string, string>>(() => readTweaks(false));
  useEffect(() => { const on = (e: StorageEvent) => { if (e.key === tweakKey(true)) setDarkV(readTweaks(true)); if (e.key === tweakKey(false)) setLightV(readTweaks(false)); }; addEventListener('storage', on); return () => removeEventListener('storage', on); }, []);
  const values = mode ? dark : light;
  const setValues = (v: Record<string, string>) => { (mode ? setDarkV : setLightV)(v); writeTweaks(mode, v); };
  return (
    <div className="sys">
      <header className="sys-head">
        <div><h1>04 · Design system</h1><p>The type scale and every element of the profile, in both modes, drawn with the page's own tokens. The controls are in the panel at the side (Controls); edits go straight to the profile, and each mode keeps its own set. The site is in {isDark ? 'dark' : 'light'} mode right now.</p></div>
        <Link className="sys-back" to="/lab/04-profile">← Back to the profile</Link>
      </header>
      <Controls04 values={values} onChange={setValues} dark={mode} toggle={toggle} onSystem />
      <div className="sys-body">
        <div className="sys-sheets" ref={sheetsRef}>
          <div className="sys-page" style={{ '--bg': dark['--bg'] ?? '#141416', '--z': z } as React.CSSProperties}><Sheet dark values={dark} /></div>
          <div className="sys-page" style={{ '--bg': light['--bg'] ?? '#d4d4d7', '--z': z } as React.CSSProperties}><Sheet dark={false} values={light} /></div>
        </div>
        {/* the controls live in the control centre (Controls04.tsx) now, the panel at the side of this page as of the profile (22 Oct); the sheets have the page */}
      </div>
    </div>
  );
}
