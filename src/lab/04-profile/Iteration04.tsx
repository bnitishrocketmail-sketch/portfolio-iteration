import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { COPY, LINKS, NAV, PROJECTS, type ViewName } from '../../lib/data';
import { useTheme } from '../../lib/theme';
import Island from '../../components/island/Island';
import { PhotoStack } from '../../components/tiles/Tiles';
import illustration from '../../assets/nitish-desk-illustration.webp';
import desk from '../../assets/nitish-desk.webp';
import illustrationCutout from '../../assets/nitish-desk-illustration-cutout.webp';
import { Lottie } from '../../components/micro/Lottie';
import { GOLD_RECT, LOADER_VIEWBOX, LOTTIES, STILL, dropLoaderText } from '../../lib/lotties';
import { faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { siLottiefiles } from 'simple-icons';
import './profile.css';

/* Iteration 04 — "Profile". One screen, after the hi-fi reference (ref 5) with Nitish's changes (13 Oct) and the lo-fi
   reference's right column (ref 4): a dark frame on the blurred picture; a narrow nav of names on the left with a travelling
   highlighter and the assistant's button at its foot; the picture fills the middle, the assistant's notch hangs into it
   from the top, a line about him sits in the cutout at its bottom-left, his name in a glass box at its bottom-right; on
   the right, the projects as a stack of three cards, and Off duty as fanned cards. Greys where the
   reference is yellow; the dark grey stays. Decisions and placeholders: LOG.md, "04 Profile". */

type Tab = Exclude<ViewName, 'project'>;
/* photo placeholders: close mid-greys, so in the fan the depth comes from the shading, not from the tints */
const GREYS: [string, string][] = [['var(--g5)', 'var(--g3)'], ['var(--g5)', 'var(--g4)'], ['var(--g6)', 'var(--g4)'], ['var(--g5)', 'var(--g3)'], ['var(--g6)', 'var(--g4)'], ['var(--g5)', 'var(--g4)']];
const WORDS = ['Product', 'Interaction', 'Motion']; /* the title's rolling first word (02 v29) */

/* the notch's links: the brands' own marks (Nitish, 13 Oct) — LinkedIn and Instagram from Font Awesome's brand set,
   LottieFiles from Simple Icons (which no longer carries LinkedIn); the email one is an envelope glyph */
const SOCIAL: { label: string; href: string; path: string; box: string }[] = [
  { label: 'LinkedIn', href: LINKS.linkedin, path: String(faLinkedinIn.icon[4]), box: `0 0 ${faLinkedinIn.icon[0]} ${faLinkedinIn.icon[1]}` },
  { label: 'Instagram', href: LINKS.instagram, path: String(faInstagram.icon[4]), box: `0 0 ${faInstagram.icon[0]} ${faInstagram.icon[1]}` },
  { label: 'LottieFiles', href: LINKS.lottiefiles, path: siLottiefiles.path, box: '0 0 24 24' },
  { label: 'Email', href: '#', path: 'M2 5h20v14H2zm1 1v1.2l9 6 9-6V6zm18 2.4-9 6-9-6V18h18z', box: '0 0 24 24' },
];

/* ---- the projects stack, as ref 4 draws it (Nitish, 13 Oct — "adapt this as it is"): three cards the column's full
   width at 165 × 127, the front one at the bottom, each one behind stepped up by 58% of a card and in shade; a vertical
   pill 3.6% in from the left on every card, centred on the front card and higher (28% from the top) on the ones behind,
   so it shows whole above the card in front; ref 4's greys (dark at the back, light in front) and its soft shadow. Static
   for now — scrolling and the dots come later. ---- */
const SHOWN = 3;
const OFFSET = .58; /* ref 4, measured: each card peeks 58% of a card's height above the one in front */
function ProjectStack({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="stack4">
      <div className="deck4">
        {PROJECTS.slice(0, SHOWN).map((p, k) => {
          const r = SHOWN - 1 - k; /* 0 = front (bottom), 2 = back (top) */
          return (
            <button key={p.id} type="button" className={`pcard4${r ? ' back' : ''}`} style={{ bottom: `calc(${r * OFFSET} * ${100 / (1 + (SHOWN - 1) * OFFSET)}%)`, zIndex: 10 - r, background: `var(--card-${['front', 'mid', 'back'][r]})` }} onClick={() => onOpen(p.id)}>
              <i className="tab4" aria-hidden="true" />
              <span className="pc-name"><b>{p.title}</b><small>{p.client} · {p.year}</small></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RollingWord() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => { if (reduce) return; const id = setInterval(() => setI(n => (n + 1) % WORDS.length), 2400); return () => clearInterval(id); }, [reduce]);
  return (
    <motion.span className="rw4" layout transition={{ duration: .45, ease: [.3, 1, .4, 1] }}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span key={WORDS[i]} className="rw4-w" initial={{ y: '110%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-110%', opacity: 0 }} transition={{ duration: .45, ease: [.3, 1, .4, 1] }}>{WORDS[i]}</motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

/* the nav: the section names run along the bar reading bottom to top (01's side nav), names only (Nitish, 13 Oct — the
   icons went); the selected one sits in a pill in the frame's colour that travels between the names. The items are fixed
   in size, so the pill simply animates to the selected item's measured box on a spring. It is drawn over the list and
   carries the selected name itself — the old name goes out quickly, the new one comes in on the way — so the name is
   always inside the pill, and the pill hides the names it passes. */
const NAV_SPRING = { type: 'spring', stiffness: 400, damping: 38, mass: 1 } as const;
function Nav({ tab, go }: { tab: Tab; go: (v: ViewName) => void }) {
  const reduce = useReducedMotion();
  const ulRef = useRef<HTMLUListElement>(null);
  const [boxes, setBoxes] = useState<Record<string, { top: number; height: number; width: number }> | null>(null);
  useLayoutEffect(() => {
    const ul = ulRef.current; if (!ul) return;
    const measure = () => {
      const b: Record<string, { top: number; height: number; width: number }> = {};
      ul.querySelectorAll<HTMLElement>('li[data-id]').forEach(li => { const btn = li.querySelector('button')!; b[li.dataset.id!] = { top: li.offsetTop, height: btn.offsetHeight, width: btn.offsetWidth }; });
      setBoxes(b);
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(ul); return () => ro.disconnect();
  }, []);
  const i = NAV.findIndex(n => n.id === tab);
  const pill = boxes?.[tab] ?? null;
  const tr = reduce ? { duration: 0 } : NAV_SPRING;
  const out = reduce ? { duration: 0 } : { duration: .1, ease: 'easeOut' as const }; /* the old name goes quickly … */
  const inn = reduce ? { duration: 0 } : { duration: .22, ease: 'easeOut' as const }; /* … the new one comes in while the pill is still arriving */
  return (
    <nav className="nav4" aria-label="Sections">
      <ul ref={ulRef}>
        {pill && (
          <motion.i className="hl4" initial={false} animate={pill} transition={tr} aria-hidden="true">
            <AnimatePresence initial={false} mode="wait">
              <motion.span key={tab} className="hltx4" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: inn }} exit={{ opacity: 0, transition: out }}>
                <span className="lbl4"><span>{NAV[i].label}</span></span>
              </motion.span>
            </AnimatePresence>
          </motion.i>
        )}
        {NAV.map(n => {
          const on = n.id === tab;
          return (
            <li key={n.id} data-id={n.id}>
              <button type="button" className={on ? 'on' : ''} aria-current={on ? 'page' : undefined} onClick={() => go(n.id)}>
                <span className="lbl4"><span>{n.label}</span></span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* the intro tile's shape: its rectangle with two pieces cut out — the bottom-left corner to the cut-out's size and the
   notch at the top-centre to the links' — every convex corner rounded with the tile's radius (the notch's top ends with
   the notch's smaller one) and the inner corners rounded the other way; measured from the boxes, as a clip path, so the
   tile and its shadow follow it. On the phone the cut-out sits below the picture, so there is none. */
function useNotchClip(wrap: React.RefObject<HTMLDivElement | null>, cut: React.RefObject<HTMLDivElement | null>, links: React.RefObject<HTMLDivElement | null>) {
  const [clip, setClip] = useState<string | null>(null);
  useLayoutEffect(() => {
    const w = wrap.current, c = cut.current, l = links.current; if (!w || !c || !l) return;
    const measure = () => {
      if (getComputedStyle(c).position !== 'absolute') { setClip(null); return; }
      const W = w.clientWidth, H = w.clientHeight, cw = c.offsetWidth, ch = c.offsetHeight, r = parseFloat(getComputedStyle(c).borderTopRightRadius) || 0;
      const wr = w.getBoundingClientRect(), lr = l.getBoundingClientRect(); const nx = lr.left - wr.left, nw = lr.width, nh = lr.height, rn = parseFloat(getComputedStyle(l).borderBottomLeftRadius) || 0;
      const d = [
        `M ${r} 0 L ${nx - rn} 0 A ${rn} ${rn} 0 0 1 ${nx} ${rn} L ${nx} ${nh - rn} A ${rn} ${rn} 0 0 0 ${nx + rn} ${nh}`, /* the top edge to the notch, down its left side */
        `L ${nx + nw - rn} ${nh} A ${rn} ${rn} 0 0 0 ${nx + nw} ${nh - rn} L ${nx + nw} ${rn} A ${rn} ${rn} 0 0 1 ${nx + nw + rn} 0`, /* along its bottom, up its right side */
        `L ${W - r} 0 A ${r} ${r} 0 0 1 ${W} ${r} L ${W} ${H - r} A ${r} ${r} 0 0 1 ${W - r} ${H}`, /* the top-right and bottom-right corners */
        `L ${cw + r} ${H} A ${r} ${r} 0 0 1 ${cw} ${H - r} L ${cw} ${H - ch + r} A ${r} ${r} 0 0 0 ${cw - r} ${H - ch} L ${r} ${H - ch} A ${r} ${r} 0 0 1 0 ${H - ch - r}`, /* the cut-out */
        `L 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`,
      ].join(' ');
      setClip(`path("${d}")`);
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(w); ro.observe(c); ro.observe(l); return () => ro.disconnect();
  }, [wrap, cut, links]);
  return clip;
}

/* ---- temporary controls (Nitish, 13 Oct): an "Edit" pill at the page's corner opens a panel — colours, the name's and
   the copy's type, the floating cards' places and layers; every value goes on the screen as a custom property, stays in
   this browser between reloads, and "Copy values" puts them on the clipboard to send over. To go once settled. ---- */
type Control = { key: string; label: string; def: string; group: string } & ({ kind: 'color' } | { kind: 'range'; min: number; max: number; step: number; unit?: string } | { kind: 'select'; options: [string, string][] });
const FONTS: [string, string][] = [['Josefin Sans', "'Josefin Sans'"], ['Outfit', "'Outfit'"], ['Poiret One', "'Poiret One'"], ['Limelight', "'Limelight'"], ['Marcellus', "'Marcellus'"], ['Marcellus SC', "'Marcellus SC'"], ['Bodoni Moda', "'Bodoni Moda'"], ['Krona One', "'Krona One'"], ['Instrument Sans', "'Instrument Sans'"]];
const CONTROLS: Control[] = [
  { group: 'Colours', kind: 'color', key: '--frame', label: 'Main container', def: '#2b2b2e' },
  { group: 'Colours', kind: 'color', key: '--nav-bg', label: 'Nav background', def: '#d6d6db' },
  { group: 'Colours', kind: 'color', key: '--nav-ink', label: 'Nav names', def: '#5a5a61' },
  { group: 'Colours', kind: 'color', key: '--nav-hl', label: 'Nav highlight', def: '#2b2b2e' },
  { group: 'Colours', kind: 'color', key: '--nav-hl-ink', label: 'Highlight name', def: '#d6d6db' },
  { group: 'Colours', kind: 'color', key: '--ai-bg', label: 'AI button', def: '#2b2b2e' },
  { group: 'Colours', kind: 'color', key: '--ai-ink', label: 'AI icon', def: '#d6d6db' },
  { group: 'Colours', kind: 'color', key: '--glass-bg', label: 'Glass box', def: '#18181b' },
  { group: 'Colours', kind: 'range', key: '--glass-a', label: 'Glass opacity', def: '.55', min: 0, max: 1, step: .05 },
  { group: 'Colours', kind: 'color', key: '--glass-ink', label: 'Glass text', def: '#c9c9cc' },
  { group: 'Colours', kind: 'color', key: '--name-ink', label: 'Name', def: '#ffffff' },
  { group: 'Colours', kind: 'color', key: '--title-ink', label: 'Title', def: '#f2f2f4' },
  { group: 'Colours', kind: 'color', key: '--line-ink', label: 'Line about me', def: '#d6d6d8' },
  { group: 'Colours', kind: 'color', key: '--social-ink', label: 'Social icons', def: '#d6d6db' },
  { group: 'Colours', kind: 'color', key: '--cv-bg', label: 'View CV button', def: '#d6d6db' },
  { group: 'Colours', kind: 'color', key: '--cv-ink', label: 'View CV text & arrow', def: '#2b2b2e' },
  { group: 'Colours', kind: 'color', key: '--corner-ink', label: 'Corner bracket', def: '#8a8a92' },
  { group: 'Colours', kind: 'color', key: '--ink', label: 'Other text', def: '#f2f2f4' },
  { group: 'Colours', kind: 'color', key: '--muted', label: 'Secondary text', def: '#a7a7ae' },
  { group: 'Type', kind: 'select', key: '--name-font', label: 'Name font', def: "'Josefin Sans'", options: FONTS },
  { group: 'Type', kind: 'range', key: '--name-w1', label: 'First name weight', def: '300', min: 100, max: 900, step: 100 },
  { group: 'Type', kind: 'range', key: '--name-w2', label: 'Surname weight', def: '700', min: 100, max: 900, step: 100 },
  { group: 'Type', kind: 'select', key: '--copy-font', label: 'Copy font', def: "'Outfit'", options: FONTS },
  { group: 'Type', kind: 'range', key: '--copy-w', label: 'Copy weight', def: '400', min: 100, max: 900, step: 100 },
  { group: 'Cards', kind: 'range', key: '--c-ai-x', label: 'Assistant · x', def: '19%', min: -20, max: 90, step: 1, unit: '%' },
  { group: 'Cards', kind: 'range', key: '--c-ai-y', label: 'Assistant · y', def: '25%', min: -20, max: 90, step: 1, unit: '%' },
  { group: 'Cards', kind: 'select', key: '--c-ai-z', label: 'Assistant · layer', def: '3', options: [['In front of me', '3'], ['Behind me', '1']] },
  { group: 'Cards', kind: 'range', key: '--c-coin-x', label: 'Coin · x', def: '64%', min: -20, max: 90, step: 1, unit: '%' },
  { group: 'Cards', kind: 'range', key: '--c-coin-y', label: 'Coin · y', def: '18%', min: -20, max: 90, step: 1, unit: '%' },
  { group: 'Cards', kind: 'select', key: '--c-coin-z', label: 'Coin · layer', def: '1', options: [['In front of me', '3'], ['Behind me', '1']] },
  { group: 'Cards', kind: 'range', key: '--c-micro-x', label: 'Micro · x', def: '68%', min: -20, max: 90, step: 1, unit: '%' },
  { group: 'Cards', kind: 'range', key: '--c-micro-y', label: 'Micro · y', def: '44%', min: -20, max: 90, step: 1, unit: '%' },
  { group: 'Cards', kind: 'select', key: '--c-micro-z', label: 'Micro · layer', def: '3', options: [['In front of me', '3'], ['Behind me', '1']] },
  { group: 'Cards', kind: 'range', key: '--c-gold-x', label: 'Gold · x', def: '38%', min: -20, max: 90, step: 1, unit: '%' },
  { group: 'Cards', kind: 'range', key: '--c-gold-y', label: 'Gold · y', def: '6%', min: -20, max: 90, step: 1, unit: '%' },
  { group: 'Cards', kind: 'select', key: '--c-gold-z', label: 'Gold · layer', def: '3', options: [['In front of me', '3'], ['Behind me', '1']] },
  { group: 'Cards', kind: 'range', key: '--c-loader-x', label: 'Loader · x', def: '6%', min: -20, max: 90, step: 1, unit: '%' },
  { group: 'Cards', kind: 'range', key: '--c-loader-y', label: 'Loader · y', def: '44%', min: -20, max: 90, step: 1, unit: '%' },
  { group: 'Cards', kind: 'select', key: '--c-loader-z', label: 'Loader · layer', def: '1', options: [['In front of me', '3'], ['Behind me', '1']] },
];
const TWEAK_KEY = 'it04-colours';
function readTweaks(): Record<string, string> { try { return JSON.parse(localStorage.getItem(TWEAK_KEY) || '{}'); } catch { return {}; } }
function Tweaks({ values, onChange }: { values: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const set = (k: string, v: string) => { const next = { ...values, [k]: v }; onChange(next); try { localStorage.setItem(TWEAK_KEY, JSON.stringify(next)); } catch { /* fine */ } };
  const reset = () => { onChange({}); try { localStorage.removeItem(TWEAK_KEY); } catch { /* fine */ } };
  const copy = () => { const out = Object.fromEntries(CONTROLS.map(c => [`${c.group} · ${c.label}`, values[c.key] ?? c.def])); navigator.clipboard?.writeText(JSON.stringify(out, null, 2)).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1400); }); };
  const groups = [...new Set(CONTROLS.map(c => c.group))];
  return (
    <div className={`tweaks4${open ? ' open' : ''}`}>
      <button type="button" className="tw-toggle" onClick={() => setOpen(o => !o)}>{open ? 'Close' : 'Edit'}</button>
      {open && (
        <div className="tw-panel">
          {groups.map(g => (
            <section key={g}>
              <h4>{g}</h4>
              {CONTROLS.filter(c => c.group === g).map(c => {
                const v = values[c.key] ?? c.def;
                return (
                  <label key={c.key}><span>{c.label}</span>
                    {c.kind === 'color' && <input type="color" value={v} onChange={e => set(c.key, e.target.value)} />}
                    {c.kind === 'range' && <span className="tw-range"><input type="range" min={c.min} max={c.max} step={c.step} value={parseFloat(v)} onChange={e => set(c.key, e.target.value + (c.unit ?? ''))} /><output>{v}</output></span>}
                    {c.kind === 'select' && <select value={v} onChange={e => set(c.key, e.target.value)}>{c.options.map(([l, val]) => <option key={val} value={val}>{l}</option>)}</select>}
                  </label>
                );
              })}
            </section>
          ))}
          <div className="tw-row"><button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy values'}</button><button type="button" onClick={reset}>Reset</button></div>
        </div>
      )}
    </div>
  );
}

export default function Iteration04() {
  const { view } = useParams();
  const navigate = useNavigate();
  const { toggle } = useTheme();
  const tab: Tab = (NAV.some(n => n.id === view) ? view : 'home') as Tab;
  const go = (v: ViewName, pid?: string) => { if (v === 'project' && pid) { navigate(`/lab/04-profile/projects`); return; } navigate(v === 'home' ? '/lab/04-profile' : `/lab/04-profile/${v}`); };
  const [ask, setAsk] = useState(0);
  const [tweaks, setTweaks] = useState<Record<string, string>>(readTweaks);
  const wrapRef = useRef<HTMLDivElement>(null), cutRef = useRef<HTMLDivElement>(null), linksRef = useRef<HTMLDivElement>(null);
  const clip = useNotchClip(wrapRef, cutRef, linksRef);
  const reduce = useReducedMotion();
  /* the cards lean with the pointer by their depth (the hero's chips) */
  const lean = (e: React.PointerEvent) => {
    const w = wrapRef.current; if (!w || reduce || e.pointerType === 'touch') return;
    const r = w.getBoundingClientRect(); const dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
    w.querySelectorAll<HTMLElement>('.fl4').forEach(c => { const d = Number(c.dataset.depth); c.style.setProperty('--px', (dx * 26 * d).toFixed(1) + 'px'); c.style.setProperty('--py', (dy * 18 * d).toFixed(1) + 'px'); });
  };
  const unlean = () => wrapRef.current?.querySelectorAll<HTMLElement>('.fl4').forEach(c => { c.style.setProperty('--px', '0px'); c.style.setProperty('--py', '0px'); });
  /* after the button's own click has finished bubbling — the island closes on any click outside itself */
  useEffect(() => { if (!ask) return; const id = window.setTimeout(() => document.querySelector<HTMLButtonElement>('.it04 .island-pill')?.click(), 0); return () => window.clearTimeout(id); }, [ask]);

  return (
    <div className="it04" style={{ '--gx': GOLD_RECT.x, '--gy': GOLD_RECT.y, '--gw': GOLD_RECT.w, '--gh': GOLD_RECT.h, ...tweaks } as React.CSSProperties}>
      <div className="bg4" aria-hidden="true" style={{ backgroundImage: `url(${illustration})` }} />
      <div className="frame4">
        {/* nav: the names, the highlighter travels; the assistant's button at the foot (ref 4's circle, moved down) */}
        <div className="navcol4">
          <Nav tab={tab} go={go} />
          <button type="button" className="ai4" aria-label="Ask the assistant" onClick={() => setAsk(a => a + 1)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 14 9l6.5 2L14 13l-2 6.5L10 13l-6.5-2L10 9z" fill="currentColor" /></svg>
          </button>
        </div>

        {/* the picture, with the notch hanging in from the top and the name box at the bottom-right, is the intro tile; the
            area at its bottom-left — the name, the title, the line, the CV, the photo — is not part of it but the frame
            showing through a corner cut out of the tile (Nitish, 13 Oct). So the tile is clipped to that shape and casts its
            shadow as that shape — onto the frame around it and onto the cut-out area — and the cut-out sits beside it. */}
        <div className="picwrap4" ref={wrapRef} onPointerMove={lean} onPointerLeave={unlean}>
          <section className="pic4">
            <div className="pic4-in" style={clip ? { clipPath: clip } : undefined}>
              <img className="pic4-img" src={illustration} alt="Nitish at his desk, drawn" />
              {/* the floating Lottie cards (01/02b's three), in this page's glass (Nitish, 13 Oct): the coin and the loader
                  behind him — his cutout from the illustration lies over them, so they are a little masked — the assistant's
                  in front, over his hair; each one's place and layer are tokens (the Edit panel moves them). They float, and
                  lean with the pointer by their depth. */}
              <div className="fl4 coin-card" data-depth=".5" style={{ '--dur': '7s', '--dl': '-3.3s' } as React.CSSProperties}>
                <div className="fl4-in"><Lottie className="coin" src={LOTTIES.coin} still={STILL.coin} label="A rupee coin turning, made with the Vector 3D plugin" /><span className="cap">Vector 3D plugin</span></div>
              </div>
              <div className="fl4 loader-card" data-depth=".6" style={{ '--dur': '5.8s', '--dl': '-1.7s' } as React.CSSProperties}>
                <div className="fl4-in"><Lottie className="lk" src={LOTTIES.loader} drop={dropLoaderText} viewBox={LOADER_VIEWBOX} still={STILL.loader} label="Lenskart's infinity-glasses loader" /><span className="cap">Loader animation</span></div>
              </div>
              <img className="pic4-img pic4-me" src={illustrationCutout} alt="" aria-hidden="true" />
              <div className="fl4 ai-card" data-depth="1.3" style={{ '--dur': '5.6s', '--dl': '-1s' } as React.CSSProperties}>
                <div className="fl4-in"><Lottie className="bl" src={LOTTIES.b} still={STILL.b} label="B, Lenskart's AI assistant, cycling through its states" /><span className="cap">Lenskart's<br />AI assistant</span></div>
              </div>
              {/* the fifth card (Nitish, 13 Oct): the Gold membership reveal — the glass is padded to the rounded card inside the
                  Lottie (its canvas is laid with negative margins so that rectangle is the content box), and the confetti flies
                  past the glass; the Lottie's corners are its own */}
              <div className="fl4 gold-card" data-depth="1.15" style={{ '--dur': '6.1s', '--dl': '-3.8s' } as React.CSSProperties}>
                <div className="fl4-in"><Lottie className="gm" src={LOTTIES.gold} still={STILL.gold} label="A Gold membership card arriving in a burst of gold confetti" /><span className="cap">Gold membership</span></div>
              </div>
              {/* the fourth card (Nitish, 13 Oct): a wide Lottie with its own background, its corners rounded like the card's, the name below it */}
              <div className="fl4 micro-card" data-depth="1.1" style={{ '--dur': '6.4s', '--dl': '-2.4s' } as React.CSSProperties}>
                <div className="fl4-in"><Lottie className="mli" src={LOTTIES.micro} still={STILL.micro} label="A bottom navigation bar's tabs animating in turn" /><span className="cap">Micro interactions</span></div>
              </div>
              <div className="name4">
                {/* the one-liner only — the "I make UI move." line went (Nitish, 13 Oct: he may bring it back later) */}
                <p className="lede4">{COPY.lede}</p>
              </div>
            </div>
          </section>
          {/* the notch at the top: the links sit on the frame, in a second cut-out of the tile (Nitish, 13 Oct — no background
              of their own); the assistant lives behind the nav's button and opens here */}
          <div className="notch4">
            <div className="links4" ref={linksRef}>
              {SOCIAL.map(l => <a key={l.label} href={l.href} aria-label={l.label} title={l.label} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener"><svg viewBox={l.box} aria-hidden="true"><path d={l.path} fill="currentColor" /></svg></a>)}
            </div>
            <Island onGo={go} onToggleTheme={toggle} />
          </div>
          {/* the cut-out: the name, the title, the line, the CV, the photo */}
          <div className="cut4" ref={cutRef}>
            <i className="corner4" aria-hidden="true" /> {/* a small bracket on the blank area's bottom-left corner — the tile's corner, with its radius, round-capped (Nitish, 13 Oct) */}
            <span className="nm4">Nitish<br /><b>Bhardwaj</b></span>
            {/* his photo in a disc beside the name (Nitish, 13 Oct); the desk photo stands in until he sends the one he means */}
            <span className="me4"><img src={desk} alt="" /></span>
            <span className="role4"><RollingWord /> designer</span>
            <p className="sub4">I design feedback{'\u00a0'}rich interfaces powered by motion.</p>
            <a className="cv4" href={LINKS.cv}>View CV <span aria-hidden="true">↗</span></a>
          </div>
        </div>

        {/* the right column: the lo-fi's widgets — a pill, the three stacked cards, Off duty fanned */}
        <aside className="col4">
          <div className="pill4"><span>Projects</span></div>
          <ProjectStack onOpen={id => go('project', id)} />
          <section className="off4"><PhotoStack fan tints={GREYS} /></section>
        </aside>
      </div>
      <Tweaks values={tweaks} onChange={setTweaks} />
      <Link className="labtag" to="/lab">Lab · 04 Profile</Link>
    </div>
  );
}
