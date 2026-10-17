import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import './motionv2.css';

/* Variant 2 of the Motion system tab (Nitish, 17 Oct: "keep this whole motion system version aside as variant 1 and
   let's build variant 2 … adapt the whole Drivetrain as is, without the context of Cars24 … we just need to change the
   names … the headings can be replaced with what we are talking about … in Drivetrain there were a lot of places to
   show what we are talking about in practicality, so that was better — let's take that route"). The Drivetrain page,
   section by section and in its words, with its three working pieces — the bottom drawer with and without the system,
   the token cascade you can trace, and the phone whose journey runs on three tokens (Without/With, Calm/Brisk) — and
   none of its names: no Drivetrain, no Cars24, no cars, no Suspension/Torque/Momentum/Shift. The easing primitives are
   named by what they do (settle, launch, carry, spring); "the Shift layer" is the component layer; booking.success is
   order.success. Same timings, easings and order of events as the original; 04's greys instead of its orange. */

const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/* play once, the first time it is mostly in view inside the tab's scroller (the original's IntersectionObserver) */
function useFirstView(el: RefObject<HTMLElement | null>, root: RefObject<HTMLElement | null>, delay: number, fn: () => void) {
  const f = useRef(fn); f.current = fn;
  useEffect(() => {
    const node = el.current; if (!node) return;
    let t = 0;
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); t = window.setTimeout(() => f.current(), delay); } }, { root: root.current, threshold: .4 });
    io.observe(node);
    return () => { io.disconnect(); clearTimeout(t); };
  }, [el, root, delay]);
}

/* ---- the app on the phones: a plain listing app (search, filters, two items, four tabs) ---- */
const Status = () => <div className="statusbar"><span>9:41</span><span>▮▮▮</span></div>;
const AppHeader = ({ q = 'Search 3,400 items' }: { q?: string }) => <div className="appheader"><div className="logo">◆</div><div className="search">{q}</div></div>;
const Item = ({ className = '' }: { className?: string }) => <div className={`card ${className}`}><div className="img" /><div className="meta"><div className="l1" /><div className="l2" /><div className="price" /></div></div>;
const Row = ({ s }: { s: string }) => <div className="srow"><i /><s className={s} /></div>;
/* the sheet's six children arrive in order (the stagger is by nth-child) */
const SheetBody = () => <><div className="grab" /><Row s="a" /><Row s="b" /><Row s="c" /><Row s="d" /><div className="sheetcta" /></>;

/* ---- the bottom drawer, without and with the system (the original's playSheet, step for step) ---- */
function DrawerDemo({ root }: { root: RefObject<HTMLElement | null> }) {
  const [s, setS] = useState({ pressed: false, today: false, sys: false, closing: false });
  const [busy, setBusy] = useState(false);
  const busyR = useRef(false), alive = useRef(true), box = useRef<HTMLDivElement>(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const set = (p: Partial<typeof s>) => { if (alive.current) setS(o => ({ ...o, ...p })); };
  const play = async () => {
    if (busyR.current) return;
    busyR.current = true; setBusy(true);
    try {
      set({ pressed: true }); await wait(140); set({ pressed: false });
      set({ sys: true }); await wait(260); // the system answers the tap at once; without it, a beat of nothing, then a snap
      set({ today: true }); await wait(1900);
      set({ closing: true, today: false, sys: false }); await wait(320);
      set({ closing: false });
    } finally { busyR.current = false; if (alive.current) setBusy(false); }
  };
  useFirstView(box, root, 450, play);
  const phone = (sys: boolean) => (
    <div className={`phone ph-sheet ${sys ? 'with' : 'today'}${(sys ? s.sys : s.today) ? ' open' : ''}${sys && s.closing ? ' closing' : ''}`}>
      <div className="screen">
        <Status /><AppHeader />
        <div className={`chip${s.pressed ? ' pressed' : ''}`}>Filters ↓</div>
        <div className="cards" style={{ marginTop: 62 }}><Item /><Item /></div>
        <div className="scrim" />
        <div className="drawer"><SheetBody /></div>
      </div>
      <div className="homebar" />
    </div>
  );
  return (
    <div className="demo" ref={box} aria-label="Example: a bottom drawer, with and without the system">
      <div className="dstage">
        <div className="column">
          <div className="tag">Without the system</div>
          {phone(false)}
          <div className="caption">Waits, then snaps. The background jumps to dark. Your eye has to catch up.</div>
        </div>
        <div className="playwrap">
          <button type="button" className="playbtn" disabled={busy} onClick={play}><span className="tri" />Play both</button>
          <div className="playnote">Watch three things: whether the tap is acknowledged, how the drawer arrives, and what the background does.</div>
        </div>
        <div className="column">
          <div className="tag with">With the system</div>
          {phone(true)}
          <div className="caption">Responds instantly, rises, settles. The background eases back. Nothing to catch up on.</div>
        </div>
      </div>
    </div>
  );
}

/* ---- the three levels; a token lists what it is made of (uses) ---- */
type Tok = { id: string; small?: string; uses?: string[] };
const LEVELS: { n: string; name: string; note: string; toks: Tok[] }[] = [
  { n: 'Level 1', name: 'Primitives', note: 'raw values, no opinions', toks: [
    { id: 'dur.xs', small: '120ms' }, { id: 'dur.s', small: '200ms' }, { id: 'dur.m', small: '300ms' }, { id: 'dur.l', small: '420ms' },
    { id: 'ease.settle', small: 'settle in' }, { id: 'ease.launch', small: 'launch out' }, { id: 'ease.carry', small: 'carry through' }, { id: 'ease.spring', small: 'celebrate' },
  ] },
  { n: 'Level 2', name: 'Semantic tokens', note: 'decisions with meaning', toks: [
    { id: 'motion.feedback', small: 'acknowledge every touch', uses: ['dur.xs', 'ease.settle'] },
    { id: 'motion.enter', small: 'arrive & settle', uses: ['dur.l', 'ease.settle'] },
    { id: 'motion.exit', small: 'leave without ceremony', uses: ['dur.s', 'ease.launch'] },
    { id: 'motion.continuity', small: 'carry context across screens', uses: ['dur.m', 'ease.carry'] },
    { id: 'motion.celebrate', small: 'pivotal moments only', uses: ['dur.l', 'ease.spring'] },
  ] },
  { n: 'Level 3', name: 'Component specs', note: 'where tokens meet states', toks: [
    { id: 'drawer.open', small: '+ stagger', uses: ['motion.enter'] }, { id: 'drawer.dismiss', uses: ['motion.exit'] },
    { id: 'nav.switch', small: '× 0.75', uses: ['motion.enter'] }, { id: 'page.push', small: '+ parallax', uses: ['motion.continuity'] },
    { id: 'touch.press', uses: ['motion.feedback'] }, { id: 'order.success', uses: ['motion.celebrate'] },
  ] },
];
const UP: Record<string, string[]> = {}, DOWN: Record<string, string[]> = {};
LEVELS.forEach(l => l.toks.forEach(t => (t.uses ?? []).forEach(d => { (UP[t.id] ??= []).push(d); (DOWN[d] ??= []).push(t.id); })));
const walk = (start: string, g: Record<string, string[]>) => { const seen = new Set<string>(), q = [start]; while (q.length) (g[q.shift()!] ?? []).forEach(m => { if (!seen.has(m)) { seen.add(m); q.push(m); } }); return seen; };

function Cascade() {
  const [cur, setCur] = useState<string | null>(null);
  const lit = cur ? new Set([cur, ...walk(cur, DOWN), ...walk(cur, UP)]) : null;
  return (
    <div className={`cascade${cur ? ' sel' : ''}`} onClick={() => setCur(null)}>
      {LEVELS.map((l, i) => (
        <div key={l.n}>
          {i > 0 && <div className="bandsep"><span className="arr">↓</span> {i === 1 ? 'compose into' : 'applied by'}</div>}
          <div className="band">
            <div className="bandlabel"><b>{l.n}</b>{l.name}<br />{l.note}</div>
            <div className="chipset">
              {l.toks.map(t => (
                <button key={t.id} type="button" aria-pressed={cur === t.id} className={`ctok${lit?.has(t.id) ? ' lit' : ''}${cur === t.id ? ' on' : ''}`}
                  onClick={e => { e.stopPropagation(); setCur(c => (c === t.id ? null : t.id)); }}>
                  {t.id}{t.small && <> <small>{t.small}</small></>}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
      <p className="cascadehint"><b>Tap any token</b> to trace what it’s made of and everything that inherits it. Every component spec also defines its loading, success, failure, interruption and reduced-motion behaviour — specified once, not improvised per screen.</p>
    </div>
  );
}

/* ---- one journey on three tokens: the drawer, the tabs, opening an item (the original's tokenisation demo) ---- */
const V = {
  raw: { enter: '150ms · 0ms · 160ms — varies', exit: 'instant — varies', fb: 'missing' },
  sys: { enterCalm: '420ms · settle', enterBrisk: '300ms · settle', exit: '260ms · ease-out', fb: 'acknowledge < 100ms' },
};
type Mode = 'raw' | 'sys';
const REST = { chip: false, card: false, open: false, closing: false, tab: 0, pushed: false, popping: false };

function TokenDemo({ root }: { root: RefObject<HTMLElement | null> }) {
  const [mode, setMode] = useState<Mode>('raw');
  const [pace, setPace] = useState<'calm' | 'brisk'>('calm');
  const [ph, setPh] = useState(REST);
  const [noanim, setNoanim] = useState(false);
  const [running, setRunning] = useState(false);
  const [gen, setGen] = useState(0); // the values re-enter on every change, as the original's chips did
  const run = useRef(0), modeR = useRef<Mode>('raw'), startAfter = useRef(false);
  const phone = useRef<HTMLDivElement>(null), sec = useRef<HTMLElement>(null);
  useEffect(() => () => { run.current++; }, []); // leaving the tab stops the journey
  const set = (p: Partial<typeof REST>) => setPh(o => ({ ...o, ...p }));
  const seq = async () => {
    const id = ++run.current;
    const w = (ms: number) => wait(ms).then(() => id === run.current);
    const lag = (ms: number) => (modeR.current === 'raw' ? ms : 0);
    setRunning(true);
    try {
      // 1 · the drawer
      set({ chip: true }); if (!await w(150)) return; set({ chip: false });
      if (!await w(80 + lag(240))) return;
      set({ open: true }); if (!await w(1500)) return;
      set({ closing: true, open: false }); if (!await w(350)) return;
      set({ closing: false }); if (!await w(350)) return;
      // 2 · the tabs
      if (!await w(lag(180))) return; set({ tab: 1 });
      if (!await w(1200)) return;
      if (!await w(lag(180))) return; set({ tab: 0 });
      if (!await w(650)) return;
      // 3 · opening an item
      set({ card: true }); if (!await w(160)) return; set({ card: false });
      if (!await w(60 + lag(260))) return;
      set({ pushed: true }); if (!await w(1600)) return;
      set({ popping: true, pushed: false }); if (!await w(450)) return;
      set({ popping: false });
    } finally { if (id === run.current) setRunning(false); }
  };
  /* a change resets the phone without animating the reset, then plays the journey again */
  const go = () => { run.current++; setRunning(false); setPh(REST); setNoanim(true); setGen(g => g + 1); startAfter.current = true; };
  useLayoutEffect(() => { if (!noanim) return; void phone.current?.offsetWidth; setNoanim(false); }, [noanim]);
  useEffect(() => { if (!noanim && startAfter.current) { startAfter.current = false; seq(); } }, [noanim]); // eslint-disable-line react-hooks/exhaustive-deps
  useFirstView(sec, root, 500, () => { if (run.current === 0) seq(); });
  const pick = (m: Mode) => { if (m === modeR.current) return; modeR.current = m; setMode(m); go(); };
  const pickPace = (p: 'calm' | 'brisk') => { if (p === pace) return; setPace(p); go(); };
  const sys = mode === 'sys';
  const vals = sys ? [pace === 'calm' ? V.sys.enterCalm : V.sys.enterBrisk, V.sys.exit, V.sys.fb] : [V.raw.enter, V.raw.exit, V.raw.fb];
  const rows: [string, string][] = [['motion.enter', 'how anything arrives — drawers, pages, tabs'], ['motion.exit', 'how anything leaves'], ['motion.feedback', 'acknowledging every touch']];
  const cls = ['phone tokphone', sys && 'sysmode', pace === 'brisk' && 'brisk', ph.open && 'sheet-open', ph.closing && 'sheet-closing', ph.pushed && 'pushed', ph.popping && 'popping', noanim && 'noanim'].filter(Boolean).join(' ');
  return (
    <section id="tokdemo" ref={sec}>
      <div className="eye">See the mechanism run</div>
      <h2>One definition. Every screen follows.</h2>
      <p className="body">The same structure, running. This phone plays one journey — drawer, tabs, opening an item. The panel holds three of the system’s semantic tokens. <strong>Without</strong> them, every surface answers on its own: mixed timings, no acknowledgment. <strong>With</strong> them, one shared definition tunes every surface at once — and retuning a single token re-tunes the whole app.</p>
      <div className="tokstage">
        <div className={cls} data-tab={ph.tab} ref={phone}>
          <div className="screen">
            <div className="list-wrap">
              <div className={`page pageA${ph.tab === 0 ? ' active' : ''}`}>
                <div className="pagegut">
                  <Status /><AppHeader />
                  <div className={`chip${ph.chip ? ' pressed' : ''}`}>Filters ↓</div>
                  <div className="cards" style={{ marginTop: 62 }}><Item className={`tapcard${ph.card ? ' press' : ''}`} /><Item /></div>
                </div>
              </div>
              <div className={`page pageB${ph.tab !== 0 ? ' active' : ''}`}>
                <div className="pagegut"><Status /><AppHeader q="Saved for later" /><div className="pgB-hero" /><div className="pgB-row" /><div className="pgB-row" /><div className="pgB-row" /></div>
              </div>
            </div>
            <div className="bnav">
              <div className="navind"><i /></div>
              {[0, 1, 2, 3].map(i => <div key={i} className={`item${ph.tab === i ? ' on' : ''}`}><div className="ic" /><div className="lb" /></div>)}
            </div>
            <div className="dimmer" />
            <div className="detail">
              <div className="d-img"><div className="d-back" /></div>
              <div className="d-body">
                <div className="l1" style={{ width: '80%' }} /><div className="l2" style={{ width: '55%' }} /><div className="price" style={{ width: '42%' }} />
                <div className="srow" style={{ marginTop: 14 }}><i /><s className="a" /></div>
                <div className="srow"><i /><s className="c" /></div>
              </div>
              <div className="d-cta" />
            </div>
            <div className="scrim" />
            <div className="drawer"><SheetBody /></div>
          </div>
          <div className="homebar" />
        </div>
        <div className={`tokpanel${sys ? ' with' : ''}`}>
          <div className="segs" role="group" aria-label="The system">
            <button type="button" aria-pressed={!sys} className={!sys ? 'on' : ''} onClick={() => pick('raw')}>Without the system</button>
            <button type="button" aria-pressed={sys} className={`sysbtn${sys ? ' on' : ''}`} onClick={() => pick('sys')}>With the system</button>
          </div>
          {rows.map(([name, desc], i) => (
            <div className="tokrow" key={name}>
              <div className="tokmeta"><div className="tokname">{name}</div><div className="tokdesc">{desc}</div></div>
              <div key={`${gen}-${vals[i]}`} className={`tokval${sys ? ' good' : ''}${gen ? ' swap' : ''}`}>{vals[i]}</div>
            </div>
          ))}
          <div className="pacectl">
            <span>Retune one token — everything follows:</span>
            <div className="pacebtns" role="group" aria-label="Pace">
              {(['calm', 'brisk'] as const).map(p => <button key={p} type="button" disabled={!sys} aria-pressed={pace === p} className={pace === p ? 'on' : ''} onClick={() => pickPace(p)}>{p === 'calm' ? 'Calm' : 'Brisk'}</button>)}
            </div>
          </div>
          <button type="button" className="playbtn" disabled={running} onClick={go}><span className="tri" />Replay the journey</button>
        </div>
      </div>
      <p className="footnote">This is the point of tokenisation: quality is tuned in one place and inherited everywhere — including on screens that haven’t been designed yet.</p>
    </section>
  );
}

const Rule = () => <div className="rule" />;
const Card = ({ k, h, children }: { k: string; h: string; children: ReactNode }) => <div className="tcard"><div className="k">{k}</div><h4>{h}</h4><p>{children}</p></div>;
const Step = ({ n, h, children }: { n: string; h: string; children: ReactNode }) => <div className="fstep"><div className="fnum">{n}</div><h4>{h}</h4><p>{children}</p></div>;
const Arrow = () => <div className="farrow" aria-hidden="true">→</div>;

export default function MotionV2_04({ variantSwitch }: { variantSwitch: ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  return (
    <section className="pp4 ms4" aria-label="Motion system">
      <header className="pp4-head">
        <div className="ms4-title"><h2 className="h2-4">Motion system</h2></div>
        <div className="pp4-right">{variantSwitch}<p className="pp4-note">One set of motion decisions, defined once and inherited by every screen.</p></div>
      </header>
      <div className="dt4" ref={scroller}>
        {/* 1 · title */}
        <section className="dhero">
          <div className="eye">Product motion &amp; interaction</div>
          <h1>A motion &amp; interaction system</h1>
          <p className="sub">Mobile-first, for everyday products. It carries one set of motion decisions from a single definition to every screen — starting where an app feels rough today.</p>
          <div className="byline"><b>Nitish Bhardwaj</b> · Product Motion / Interaction Design</div>
          <div className="scrollhint"><span className="dot" /> Scroll — a few moments on this page move on purpose.</div>
        </section>
        <Rule />

        {/* 2 · the problem */}
        <section>
          <div className="eye">Why motion matters</div>
          <h2>How an app moves is part of how it works.</h2>
          <p className="body">Screens arrive abruptly. The bottom drawer snaps instead of settling. Tabs cut instead of glide. None of these are bugs — each is a <strong>small missing decision about time and easing</strong>. Together, they read as lag and roughness, and the user can’t say why.</p>
          <p className="body">You don’t need motion vocabulary to notice it. One moment, felt twice, is enough — here’s a bottom drawer, same tap and same content, with and without the system’s logic behind it:</p>
          <DrawerDemo root={scroller} />
          <p className="footnote">Note: the “Without the system” column recreates the patterns being described so the comparison is honest — an illustration of the behaviour, not a capture of a live app. In both columns the screens and the speed of use are identical. Only the motion decisions changed. The same logic applies to every other rough moment — tabs, page changes, touch feedback — and they all appear in the working demo further down.</p>
        </section>
        <Rule />

        {/* 3 · why */}
        <section>
          <div className="eye">Where the roughness comes from</div>
          <h2>Not all lag is the same lag.</h2>
          <p className="body">“The app feels slow” is really three different problems wearing the same face. The first job of this work is an audit of the key journeys that separates them — because each one has a different fix:</p>
          <div className="triple">
            <Card k="Real delay" h="The app is actually waiting">Data, load times, engineering constraints. Genuine performance work — motion can’t fix it, but it can make the wait feel shorter and honest.</Card>
            <Card k="Missing feedback" h="The app didn’t say “got it”">You tap, and for a beat — nothing. Even when nothing is slow, silence reads as lag. Immediate acknowledgment is a design decision, not a performance one.</Card>
            <Card k="Inconsistent behaviour" h="Every screen answers differently">Easing, navigation, drawers and components each behaving their own way — abrupt here, floaty there. Individually reasonable, together it reads as roughness.</Card>
          </div>
          <p className="body" style={{ marginTop: '2.2em' }}><strong>Only the first needs engineering horsepower.</strong> The other two are design decisions — and they account for most of what users call “lag”. That’s the opportunity: a large share of perceived smoothness is ours to claim without waiting on performance work.</p>
        </section>
        <Rule />

        {/* 4 · the vision */}
        <section>
          <div className="eye">The vision</div>
          <h2>Give motion the same treatment we give colour.</h2>
          <p className="body">Colour and type used to have the every-screen-decides-for-itself problem too — until they became tokens: named, shared decisions everyone reuses instead of re-inventing. Motion never got its tokens. This system gives it that, in four layers:</p>
          <div className="triple">
            <Card k="Principles" h="The shared point of view">What motion is for in the product, and what it never does. The taste, written down — so quality stops depending on who’s in the room.</Card>
            <Card k="Semantic tokens" h="Named decisions">How long, with what character — picked by intent (“settle”, “exit”, “celebrate”), not by numbers. Designers choose meanings; developers apply names, not guesses.</Card>
            <Card k="Components" h="Behaviours, built once">The drawer, the nav, the page push, touch feedback — reusable interaction components that are correct everywhere they appear.</Card>
            <Card k="States" h="Specified, not improvised">Loading, success, failure, interruption, gestures, reduced motion — every component knows what to do in every state, as a written spec.</Card>
          </div>
          <p className="body" style={{ marginTop: '2.2em' }}>So the system defines not just <strong>how things move</strong>, but <strong>what triggers motion</strong>, what leads and what follows, what happens when the user interrupts it midway — and when motion should step aside entirely.</p>
        </section>
        <Rule />

        {/* 4b · the structure */}
        <section>
          <div className="eye">The tokenisation structure</div>
          <h2>Three levels. Everything inherits.</h2>
          <p className="body">This is the core structure: <strong>primitives</strong> hold raw values with no opinions; <strong>semantic tokens</strong> turn them into decisions with meaning; <strong>component specs</strong> apply those decisions to real surfaces — including what happens on loading, success, failure and interruption. Nobody downstream ever invents a number.</p>
          <Cascade />
          <p className="body" style={{ marginTop: '2.2em' }}>Why this matters structurally: retune <strong>one primitive</strong> and the change propagates through every semantic token and component that inherits it — the whole app shifts together, coherently. That’s the difference between polishing screens and owning a system.</p>
        </section>
        <Rule />

        {/* 4c · the mechanism, running */}
        <TokenDemo root={scroller} />
        <Rule />

        {/* 5 · depth */}
        <section>
          <div className="eye">Depth by relevance · frequency · consequence</div>
          <h2>Motion depth is budgeted, not sprinkled.</h2>
          <p className="body">Not every moment deserves the same investment. How much motion a moment gets is decided by three questions: how relevant is it, how often does it happen, and how much does it matter?</p>
          <div className="tiers">
            <div className="tier"><div className="n">FREQUENT</div><div><h4>Navigation, selection, scrolling — subtle and efficient</h4><p>Things a user does hundreds of times stay quick and quiet. At this frequency, restraint <em>is</em> the delight — motion you feel but never notice.</p></div></div>
            <div className="tier"><div className="n">PIVOTAL</div><div><h4>Checkout, verification, payment or order completion — emphasis and delight</h4><p>The rare, high-consequence moments where a customer commits. These earn celebration — and because everything else is restrained, it actually lands.</p></div></div>
            <div className="tier"><div className="n">THE REST</div><div><h4>Correct by default</h4><p>Every other moment simply inherits the system’s hygiene — right duration, right easing, right feedback — without anyone spending effort on it.</p></div></div>
          </div>
          <p className="body" style={{ marginTop: '1.7em' }}>The app is the primary environment. The web inherits the <strong>behavioural principles</strong> where they’re relevant — same intent, not identical animations forced across platforms.</p>
        </section>
        <Rule />

        {/* 6 · the build flow */}
        <section>
          <div className="eye">The build flow</div>
          <h2>How the system gets built.</h2>
          <p className="body">A path, not a big bang — each stage produces something the product uses immediately:</p>
          <div className="flow">
            <Step n="01" h="Audit">Map key journeys; separate real performance delay from missing feedback and inconsistent behaviour. Each bucket gets a different fix — and a different owner.</Step><Arrow />
            <Step n="02" h="Principles">The shared point of view, written down — what motion is for in the product, what it never does.</Step><Arrow />
            <Step n="03" h="Tokens">Primitives, then semantic tokens on top. Small on purpose — a vocabulary, not a library.</Step><Arrow />
            <Step n="04" h="Components & states">The component layer: drawers, nav, transitions, feedback as reusable specs with loading, success, failure and interruption defined.</Step><Arrow />
            <Step n="05" h="Pilot">Apply to the highest-traffic hygiene surfaces first. Measure the before/after feel, prove the process.</Step><Arrow />
            <Step n="06" h="Govern & grow">Docs, defaults, review habits. Then depth where frequency and consequence earn it — and web adaptation where relevant.</Step>
          </div>
        </section>
        <Rule />

        {/* 7 · the daily flow */}
        <section>
          <div className="eye">The daily flow</div>
          <h2>How it ships, day to day.</h2>
          <p className="body">Once the system exists, this is what making motion looks like for every feature, forever:</p>
          <div className="flow">
            <Step n="DESIGN" h="Picks an intent">“This sheet should settle.” No numbers, no guessing — a decision by meaning.</Step><Arrow />
            <Step n="SPEC" h="Names a token">The handoff is <code>motion.enter</code> — not a video someone has to interpret frame by frame.</Step><Arrow />
            <Step n="CODE" h="Applies the name">Engineering references the token that already exists in the codebase. Correct by construction.</Step><Arrow />
            <Step n="REVIEW" h="Checks against the system">“Does this match the system?” — a question anyone can answer. Quality stops depending on one person’s taste being in the room.</Step><Arrow />
            <Step n="EVERY RELEASE" h="Inherits">New screens get the right feel by default — including ones nobody has designed yet.</Step>
          </div>
          <p className="close">The goal was never a more animated app.<br />It’s one that feels <em>responsive, continuous and intentional</em> — and stays that way.</p>
        </section>
      </div>
    </section>
  );
}
