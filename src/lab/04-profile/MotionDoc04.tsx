import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { animate, motion, useReducedMotion } from 'motion/react';
import { FAMILY, MOMENTS, PRIMS, ROLES, prim, role, type Family, type MomentId } from './motionTokens';
import { CONTRACT, ContractGraph, type CEvent, type CState } from './Contract04';
import Timeline04 from './Timeline04';

/* "The system" (Nitish, 17 Oct: the map was "very confusing … cards and text, too much text, all written together"; the
   reference is the Drivetrain page we made for Cars24, whose hierarchy was understandable). So this view reads like it:
   top to bottom, one idea per section, in his brief's reading order — an eyebrow, one headline that makes the claim, a
   line or two, and one visual that shows it. Nothing waits behind a hover. The eight layers are the sections; the
   intro's index jumps to them. His framework (docs/motion-system-brief.md, v0.1); values illustrative; in 04's greys. */

const LAYERS = [
  { id: 'principles', n: '01', name: 'Principles', line: 'Why motion is used' },
  { id: 'personality', n: '02', name: 'Personality', line: 'Character, in movement' },
  { id: 'tokens', n: '03', name: 'Tokens', line: 'Shared values, named' },
  { id: 'patterns', n: '04', name: 'Patterns', line: 'Solutions by user need' },
  { id: 'components', n: '05', name: 'Components', line: 'Every transition, a contract' },
  { id: 'choreography', n: '06', name: 'Choreography', line: 'A screen as one system' },
  { id: 'access', n: '07', name: 'Accessibility', line: 'Meaning, in any condition' },
  { id: 'delivery', n: '08', name: 'Delivery', line: 'Built into the process' },
] as const;

function Section({ id, eyebrow, title, children, lede }: { id: string; eyebrow: string; title: ReactNode; lede?: ReactNode; children: ReactNode }) {
  return (
    <section className="md4-sec" id={`md4-${id}`} aria-labelledby={`md4-h-${id}`}>
      <p className="md4-eye">{eyebrow}</p>
      <h3 className="md4-h" id={`md4-h-${id}`}>{title}</h3>
      {lede && <div className="md4-lede">{lede}</div>}
      {children}
    </section>
  );
}

/* 02: one confirmation, played in both modes */
function Modes() {
  const reduce = useReducedMotion();
  const [k, setK] = useState(0);
  return (
    <div className="md4-modes">
      <div className="md4-mode">
        <p className="md4-k">Everyday</p>
        <div className="md4-stage-s"><motion.span key={`e${k}`} className="md4-ok" initial={{ opacity: k ? 0 : 1 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : .16, ease: [.2, 0, 0, 1] }}>✓ Saved</motion.span></div>
        <p className="md4-tok"><code>motion.content.change</code> · 160 ms, opacity only</p>
        <p>Focused and familiar — for what people do a hundred times a day.</p>
      </div>
      <div className="md4-mode">
        <p className="md4-k">Expressive</p>
        <div className="md4-stage-s">
          <motion.span key={`x${k}`} className="md4-ok big" initial={k && !reduce ? { opacity: 0, scale: .6, y: 8 } : false} animate={{ opacity: 1, scale: 1, y: 0 }} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 14 }}>✓ Order placed</motion.span>
          {k > 0 && !reduce && <motion.i key={`r${k}`} className="md4-ring" initial={{ scale: .4, opacity: .6 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: .56, ease: [0, 0, .2, 1] }} />}
        </div>
        <p className="md4-tok"><code>spring.expressive</code> · overshoots, settles</p>
        <p>Selective and memorable — for the milestone, not the routine.</p>
      </div>
      <button type="button" className="md4-play" onClick={() => setK(x => x + 1)}>▸ Play both</button>
    </div>
  );
}

/* 03: the three levels; tap a token to trace what it is made of and what inherits it */
const MAPS = MOMENTS.flatMap(m => [m.enter, ...(m.exit ? [m.exit] : [])]).filter((x, i, a) => a.findIndex(y => y.id === x.id) === i);
const roleUses = (r: string) => { const R = role(r); return [R.duration, R.easing, R.distance, R.scale].filter(Boolean) as string[]; };
function Cascade() {
  const [sel, setSel] = useState<string>('motion.surface.enter');
  const kind = PRIMS.some(p => p.id === sel) ? 'prim' : ROLES.some(r => r.id === sel) ? 'role' : 'map';
  const lit = new Set<string>([sel]);
  if (kind === 'prim') ROLES.filter(r => roleUses(r.id).includes(sel)).forEach(r => { lit.add(r.id); MAPS.filter(m => m.role === r.id).forEach(m => lit.add(m.id)); });
  if (kind === 'role') { roleUses(sel).forEach(p => lit.add(p)); MAPS.filter(m => m.role === sel).forEach(m => lit.add(m.id)); }
  if (kind === 'map') { const r = MAPS.find(m => m.id === sel)!.role; lit.add(r); roleUses(r).forEach(p => lit.add(p)); }
  const chip = (id: string, sub?: string) => <button key={id} type="button" className={`md4-chip${lit.has(id) ? ' lit' : ''}${sel === id ? ' sel' : ''}`} aria-pressed={sel === id} onClick={() => setSel(id)}><code>{id}</code>{sub && <small>{sub}</small>}</button>;
  const said = kind === 'prim' ? `${sel} is a raw value (${prim(sel).label}). ${[...lit].filter(x => ROLES.some(r => r.id === x)).length} roles and ${[...lit].filter(x => MAPS.some(m => m.id === x)).length} component transitions inherit it — retune it once and all of them follow.`
    : kind === 'role' ? `${sel} — ${role(sel).purpose.toLowerCase()}. Made of ${roleUses(sel).join(', ')}; used by ${MAPS.filter(m => m.role === sel).map(m => m.id).join(', ') || 'nothing yet'}.`
    : `${sel} is a component transition. It never names a number: it maps to ${MAPS.find(m => m.id === sel)!.role}${MAPS.find(m => m.id === sel)!.adjust ? `, adjusted — ${MAPS.find(m => m.id === sel)!.adjust}` : ''}.`;
  return (
    <div className="md4-casc">
      <div className="md4-lvl"><div className="md4-lh"><b>Level 1</b><span>Primitives</span><small>raw values, no opinions</small></div><div className="md4-chips">{PRIMS.map(p => chip(p.id, p.label))}</div></div>
      <p className="md4-arrow">↓ referenced by</p>
      <div className="md4-lvl"><div className="md4-lh"><b>Level 2</b><span>Semantic roles</span><small>decisions with a purpose</small></div><div className="md4-chips">{ROLES.map(r => chip(r.id))}</div></div>
      <p className="md4-arrow">↓ mapped to</p>
      <div className="md4-lvl"><div className="md4-lh"><b>Level 3</b><span>Component mappings</span><small>where tokens meet components</small></div><div className="md4-chips">{MAPS.map(m => chip(m.id))}</div></div>
      <p className="md4-said" aria-live="polite">{said}</p>
    </div>
  );
}

/* 04: the families, each headed by its question; the ones the product shows link there */
const APPLY: Record<Family, string> = { input: 'Press, select, toggle, validate', visibility: 'Open, close, expand, collapse', navigation: 'Forward, back, detail, tab change', content: 'Insert, remove, reorder, update', progress: 'Load, refresh, upload, process', outcome: 'Confirm, fail, retry, undo', attention: 'Guidance, achievements, rewards' };
const SEEN: Partial<Record<Family, MomentId>> = { input: 'press', visibility: 'sheet', navigation: 'card', outcome: 'pay' };

/* 05: his example, Save changes, stepped by its events */
const SAVE: Record<CState, string> = { ready: 'ready', processing: 'saving', done: 'saved', failed: 'failed', checking: 'checking status' };
const EVENT_LABEL: Record<CEvent, string> = { submit: 'Submit', confirmed: 'Confirmed save', rejected: 'Definite failure', unclear: 'Outcome uncertain', 'reconciled-done': 'Reconciled: saved', 'reconciled-failed': 'Reconciled: failed', retry: 'Retry', edit: 'A new edit' };
function SaveChanges() {
  const [s, setS] = useState<{ state: CState; last: CEvent | null; n: number }>({ state: 'ready', last: null, n: 0 });
  const next = CONTRACT.filter(([from]) => from === s.state);
  return (
    <div className="md4-save">
      <ContractGraph state={s.state} last={s.last} n={s.n} names={SAVE} />
      <div className="md4-events"><span>Application events{s.state !== 'ready' && <button type="button" className="md4-reset" onClick={() => setS({ state: 'ready', last: null, n: 0 })}>reset</button>}</span>
        <div>{next.map(([, e, to]) => <button key={e} type="button" onClick={() => setS(x => ({ state: to, last: e, n: x.n + 1 }))}>{EVENT_LABEL[e]} <small>→ {SAVE[to]}</small></button>)}</div>
      </div>
    </div>
  );
}

/* 06 and 07: a bottom sheet, opened on his tracks — in default motion, and reduced */
const SHEET_TRACKS = MOMENTS.find(m => m.id === 'sheet')!.dev;
function MiniSheet({ k, reduced, label }: { k: number; reduced?: boolean; label: string }) {
  const R = useReducedMotion(), still = reduced || R;
  return (
    <div className="md4-mini">
      <div className="md4-mini-s">
        <i className="md4-mini-l" /><i className="md4-mini-l s" /><i className="md4-mini-b" />
        <motion.i key={`sc${k}`} className="md4-mini-scrim" initial={{ opacity: k ? 0 : 1 }} animate={{ opacity: 1 }} transition={{ duration: R ? 0 : .16, ease: [.2, 0, 0, 1] }} />
        <motion.div key={`sf${k}`} className="md4-mini-sheet" initial={k ? { opacity: 0, y: still ? 0 : 24 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: R ? 0 : .24, ease: [.2, 0, 0, 1] }}>
          <motion.div key={`ct${k}`} initial={{ opacity: k ? 0 : 1 }} animate={{ opacity: 1 }} transition={{ duration: R ? 0 : .16 }}><i /><i /><i /><b /></motion.div>
        </motion.div>
      </div>
      <p className="md4-k">{label}</p>
    </div>
  );
}
function Choreo() {
  const [k, setK] = useState(0);
  const reduce = !!useReducedMotion();
  return (
    <div className="md4-choreo">
      <div className="md4-stages">{[['1', 'Trigger', 'The tap starts it.'], ['2', 'Transition', 'Scrim, surface and content move together.'], ['3', 'Available', 'The sheet settles, already usable.']].map(([n, t, d]) => <div key={n} className="md4-card"><p className="md4-k">{n}</p><b>{t}</b><span>{d}</span></div>)}</div>
      <div className="md4-choreo-row">
        <MiniSheet k={k} label="Default" />
        <div className="md4-tl-wrap"><Timeline04 dev={SHEET_TRACKS} pulse={k} reduce={reduce} /><button type="button" className="md4-play" onClick={() => setK(x => x + 1)}>▸ Play</button></div>
      </div>
    </div>
  );
}
function Access() {
  const [k, setK] = useState(0);
  return (
    <div className="md4-acc">
      <div className="md4-pair2"><MiniSheet k={k} label="Default — rises 24 px" /><MiniSheet k={k} reduced label="Reduced — appears in place" /></div>
      <button type="button" className="md4-play" onClick={() => setK(x => x + 1)}>▸ Play both</button>
    </div>
  );
}

export default function MotionDoc04({ toProduct }: { toProduct: (m?: MomentId) => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const jump = (id: string) => { const el = scroller.current?.querySelector<HTMLElement>(`#md4-${id}`); if (!el || !scroller.current) return; const sc = scroller.current, top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 16; if (reduce) sc.scrollTop = top; else animate(sc.scrollTop, top, { duration: .5, ease: [.2, 0, 0, 1], onUpdate: v => { if (scroller.current) scroller.current.scrollTop = v; } }); };
  useEffect(() => { scroller.current?.scrollTo({ top: 0 }); }, []);
  return (
    <div className="md4" ref={scroller}>
      <div className="md4-col">
        {/* the intro */}
        <header className="md4-hero">
          <p className="md4-eye">Motion design system · Framework v0.1</p>
          <h3 className="md4-h big">How everyday products respond, change and guide.</h3>
          <div className="md4-lede"><p>A reusable framework for utility products — commerce, delivery, finance, productivity, services — so that motion is decided once, named, and inherited, instead of re-invented on every screen.</p><p className="md4-by"><b>Clarity in the interaction. Consistency in the implementation.</b> · Nitish — Product Motion &amp; Interaction</p></div>
          <p className="md4-eye sm">Eight layers — jump to one</p>
          <nav className="md4-index" aria-label="Layers">{LAYERS.map(l => <button key={l.id} type="button" onClick={() => jump(l.id)}><small>{l.n}</small><b>{l.name}</b><span>{l.line}</span></button>)}</nav>
          <p className="md4-note">Principles guide every layer; accessibility applies to every layer; delivery keeps design and code on one version. Three concerns run through them — a <b>shared core</b> of rules and patterns, a <b>product profile</b> of character and values, and <b>platform delivery</b> of coded components.</p>
        </header>

        <Section id="principles" eyebrow="01 · Principles and purpose" title="Consistent behaviour begins with clear intent." lede={<p>Every animation has a purpose it communicates. Considering motion is mandatory; animating every change is not.</p>}>
          <div className="md4-grid five">{[['Acknowledge input', 'Prompt feedback, so people know it registered.'], ['Preserve continuity', 'Show how states, objects and places relate.'], ['Represent real state', 'Events decide progress, success and failure.'], ['Keep people in control', 'Interrupting and reversing are normal.'], ['Use attention deliberately', 'Emphasise what matters; instant is valid.']].map(([t, d], i) => <div key={t} className="md4-card"><p className="md4-k">{i + 1}</p><b>{t}</b><span>{d}</span></div>)}</div>
        </Section>

        <Section id="personality" eyebrow="02 · Motion personality" title="A shared structure. A distinct product character." lede={<p>Brand qualities become five choices — <b>response, elasticity, travel, emphasis, frequency</b> — and two modes that live in the same product.</p>}>
          <Modes />
        </Section>

        <Section id="tokens" eyebrow="03 · Foundations and tokens" title="Three levels. Everything inherits." lede={<p>Primitives hold raw values; roles turn them into decisions; components map to roles and never name a number. Tap any token to trace it.</p>}>
          <Cascade />
        </Section>

        <Section id="patterns" eyebrow="04 · Behaviour patterns" title="A library organised by user need." lede={<p>Fade, slide and scale are techniques. A pattern answers a question the user has — and says which technique serves it, and why.</p>}>
          <div className="md4-grid four">{(Object.keys(FAMILY) as Family[]).map(f => (
            <div key={f} className="md4-card q"><p className="md4-k">{FAMILY[f].name}</p><b>{FAMILY[f].q}</b><span>{APPLY[f]}</span>
              {SEEN[f] && <button type="button" className="md4-link" onClick={() => toProduct(SEEN[f])}>See it in the product →</button>}</div>
          ))}</div>
        </Section>

        <Section id="components" eyebrow="05 · Component behaviour" title="Every transition has a contract." lede={<p>Application events drive the state; motion communicates it. The example, <b>Save changes</b> — where an unknown outcome stays distinct from a failure. Step it through its events.</p>}>
          <div className="md4-split">
            <SaveChanges />
            <ol className="md4-spec">{['Purpose', 'States', 'Triggering events', 'Animated properties and origins', 'Tokens and parameters', 'Coordination', 'Repeated input and interruption', 'Loading, failure, uncertainty, recovery', 'Reduced motion', 'Acceptance criteria'].map(x => <li key={x}>{x}</li>)}</ol>
          </div>
          <button type="button" className="md4-link" onClick={() => toProduct('pay')}>The same contract runs Pay in the product →</button>
        </Section>

        <Section id="choreography" eyebrow="06 · Screen and flow choreography" title="A screen moves as one system." lede={<p>Opening a bottom sheet: three tracks start on the same tap and overlap. The content sits inside the surface, so it owns only its opacity — nothing travels twice.</p>}>
          <Choreo />
        </Section>

        <Section id="access" eyebrow="07 · Accessibility and adaptation" title="Preserve meaning across conditions." lede={<p>Reduced motion is not a faster animation: it says the same thing — what appeared, and what you can do next — without the travel.</p>}>
          <Access />
          <div className="md4-grid four">{[['Beyond movement', 'Readable status, lasting outcomes, announcements.'], ['Platform conventions', 'Native gestures, motion preferences, right-to-left.'], ['Runtime conditions', 'Slow responses, interruption, out-of-order results.'], ['Performance budgets', 'Agreed targets, checked on real devices.']].map(([t, d]) => <div key={t} className="md4-card"><b>{t}</b><span>{d}</span></div>)}</div>
        </Section>

        <Section id="delivery" eyebrow="08 · Delivery and governance" title="Build it into the product process." lede={<p>Standard motion lives inside the coded component. Developers connect state and choose options; design and code share one name, and one version.</p>}>
          <div className="md4-flow">{[['Map', 'States, relationships, needs'], ['Compose', 'Existing patterns and components'], ['Prototype', 'Unfamiliar behaviour, with engineering'], ['Verify', 'Real devices, edge cases, accessibility'], ['Evolve', 'Review new patterns, version changes']].map(([t, d], i, a) => <Fragment key={t}><div className="md4-card"><p className="md4-k">{String(i + 1).padStart(2, '0')}</p><b>{t}</b><span>{d}</span></div>{i < a.length - 1 && <i className="md4-to" aria-hidden="true">→</i>}</Fragment>)}</div>
          <div className="md4-split two">
            <div><p className="md4-k">Deliverables</p><ul className="md4-list"><li>Guidelines and specimens</li><li>Tokens and coded components, with accessible defaults</li><li>Ownership and change history</li></ul></div>
            <div><p className="md4-k">Released when</p><ul className="md4-list check"><li>Outcomes match application events</li><li>Interruption and repeated input are verified</li><li>Reduced motion and non-visual feedback are verified</li><li>Performance meets the agreed budgets</li><li>Design and code use the same version</li></ul></div>
          </div>
        </Section>

        <footer className="md4-end">
          <h3 className="md4-h big">The goal is not a more animated product.</h3>
          <p className="md4-lede">It is one that responds, changes and guides — clearly, and the same way everywhere.</p>
          <button type="button" className="md4-cta" onClick={() => toProduct()}>See it working in a product →</button>
          <p className="md4-fine">A framework and example specifications. Values are illustrative; the product is an example implementation.</p>
        </footer>
      </div>
    </div>
  );
}
