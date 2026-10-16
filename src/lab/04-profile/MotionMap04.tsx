import { Fragment, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FAMILY, ROLES, prim } from './motionTokens';

/* The Motion system tab's second view, "The system" (Nitish, 16 Oct): his framework's architecture
   (docs/motion-system-brief.md) at a glance — the eight layers and how they relate, without needing to play anything.
   Principles run across the top (they guide every decision); the chain in the middle, each link labelled with its
   relationship — personality tunes the foundations, the tokens parameterise the patterns and components, components
   apply the patterns, choreography coordinates the components; accessibility applies to every layer and delivery keeps
   design, code and verification on one version, as bands under it. Under those, the three concerns — shared core,
   product profile, platform delivery — not a sequence: pointing at one lights the layers it covers. A layer opens into a
   card on hover (focus, tap) with its substance from the brief; where the product view shows it working, the card says
   so and switches there. No relationship depends on colour or position alone: every one is written. */
type LayerId = 'principles' | 'personality' | 'tokens' | 'patterns' | 'components' | 'choreography' | 'access' | 'delivery';
type Layer = { id: LayerId; n: number; name: string; line: string; eg: string; body: () => ReactNode; product?: string };

const L: Record<LayerId, Layer> = {
  principles: { id: 'principles', n: 1, name: 'Principles and purpose', line: 'Consistent behaviour begins with clear intent.', eg: 'Acknowledge input · Preserve continuity · Represent real state · Keep people in control · Use attention deliberately', body: () => <>
    <ol className="mm4-list">
      <li><b>Acknowledge input.</b> Prompt feedback, so people know their action registered.</li>
      <li><b>Preserve continuity.</b> Show how states, objects and destinations relate.</li>
      <li><b>Represent real state.</b> Application events decide progress, success and failure.</li>
      <li><b>Keep people in control.</b> Interruption, reversal and cancellation are normal behaviour.</li>
      <li><b>Use attention deliberately.</b> Emphasise what matters; an instant update is a valid choice.</li>
    </ol>
    <p className="mm4-note">Every animation has a purpose it communicates. An animation finishing never means an operation did.</p>
  </> },
  personality: { id: 'personality', n: 2, name: 'Motion personality', line: 'A shared structure, a distinct product character.', eg: 'Everyday · Expressive', body: () => <>
    <p>Brand qualities become five concrete choices:</p>
    <dl className="mm4-dl"><dt>Response</dt><dd>how quickly feedback starts, how it settles</dd><dt>Elasticity</dt><dd>where overshoot is allowed, and how much</dd><dt>Travel</dt><dd>how compact or expansive movement is</dd><dt>Emphasis</dt><dd>which events deserve stronger expression</dd><dt>Frequency</dt><dd>how often expressive moments appear</dd></dl>
    <p className="mm4-note"><b>Everyday</b> — focused, efficient, familiar, for repeated tasks. <b>Expressive</b> — selective and memorable, for milestones. Both live in one product: processing restrained, confirmation clear, a reward more expressive.</p>
  </> },
  tokens: { id: 'tokens', n: 3, name: 'Foundations and tokens', line: 'From intent to reusable values.', eg: 'duration.240 → motion.surface.enter → sheet.open', product: 'Every moment in the product view shows its chain.', body: () => <>
    <p>A dependency hierarchy, not three animations:</p>
    <div className="mm4-chain"><span><small>primitive</small><code>duration.240</code></span><i>→</i><span><small>semantic role</small><code>motion.surface.enter</code></span><i>→</i><span><small>component mapping</small><code>sheet.open</code></span></div>
    <table className="mm4-t"><tbody>{ROLES.slice(0, 4).map(r => <tr key={r.id}><td><code>{r.id}</code></td><td>{prim(r.duration).label}</td><td>{r.purpose}</td></tr>)}</tbody></table>
    <p className="mm4-note">Timed transitions set duration and easing; springs set response and settling, so their length varies with the motion. Illustrative values, not production defaults.</p>
  </> },
  patterns: { id: 'patterns', n: 4, name: 'Behaviour patterns', line: 'A library organised by user need.', eg: 'Seven families, each a user question', product: 'Each moment in the product view is named by its question.', body: () => <>
    <dl className="mm4-dl q">{Object.values(FAMILY).map(f => <Fragment key={f.name}><dt>{f.name}</dt><dd>{f.q}</dd></Fragment>)}</dl>
    <p className="mm4-note">Fade, slide and scale are techniques. A pattern says which one serves an interaction, when not to use it, how it is interrupted, and its reduced-motion alternative.</p>
  </> },
  components: { id: 'components', n: 5, name: 'Component behaviour', line: 'Every transition has a contract.', eg: 'Save changes · five states', body: () => <>
    <p>A component's specification makes explicit: its purpose and states; the events that change them; what animates, from where; the tokens; coordination with others; repeated input, interruption, cancellation; loading, failure, uncertain outcomes, recovery; reduced motion; and acceptance criteria.</p>
    <p className="mm4-note">The example — <b>Save changes</b>: ready → saving → saved, or failed, or <b>checking status</b>, where an unknown outcome stays distinct from a failure. Live next.</p>
  </> },
  choreography: { id: 'choreography', n: 6, name: 'Screen and flow choreography', line: 'A screen moves as one system.', eg: 'Bottom sheet · three overlapping tracks', body: () => <>
    <p>How related behaviours work together: grouping, origins, overlap, sequence, interruption and focus.</p>
    <p className="mm4-note">The example — opening a bottom sheet: the scrim, the surface and its content start together and overlap; dismissal continues from wherever entry was interrupted; focus moves in and is restored. Its timeline is next.</p>
  </> },
  access: { id: 'access', n: 7, name: 'Accessibility and adaptation', line: 'Preserve meaning across conditions.', eg: 'Same state, outcome and next action — with motion reduced', body: () => <>
    <p>The reduced-motion version communicates the same state, outcome and next action — not just a faster animation.</p>
    <dl className="mm4-dl"><dt>Beyond movement</dt><dd>readable status, lasting outcomes, announcements</dd><dt>Platform conventions</dt><dd>native gestures, motion preferences, right-to-left</dd><dt>Runtime conditions</dt><dd>slow responses, backgrounding, repeated input, out-of-order results</dd><dt>Performance budgets</dt><dd>agreed targets, verified on real devices</dd></dl>
  </> },
  delivery: { id: 'delivery', n: 8, name: 'Delivery and governance', line: 'Build it into the product process.', eg: 'Map → Compose → Prototype → Verify → Evolve', body: () => <>
    <div className="mm4-chain steps">{['Map', 'Compose', 'Prototype', 'Verify', 'Evolve'].map((s, i) => <span key={s}><small>{i + 1}</small>{s}</span>)}</div>
    <p>Deliverables: guidelines and specimens; tokens and coded components with accessible defaults; ownership and change history. Standard motion lives in the coded component — developers connect state and configure options.</p>
    <p className="mm4-note">Released when outcomes match application events, interruption and reduced motion are verified, budgets are met, and design and code share one version.</p>
  </> },
};
const CHAIN: [LayerId, string?][] = [['personality', 'tunes'], ['tokens', 'parameterise'], ['patterns', 'applied by'], ['components', 'coordinated by'], ['choreography']];
const CONCERNS: { name: string; line: string; covers: LayerId[] }[] = [
  { name: 'Shared core', line: 'Reusable behavioural rules, patterns and specification structures.', covers: ['principles', 'tokens', 'patterns', 'components', 'choreography', 'access'] },
  { name: 'Product profile', line: 'Contextual choices: personality, emphasis, expressive range — and the token values.', covers: ['personality', 'tokens'] },
  { name: 'Platform delivery', line: 'Components, presets, accessibility behaviour and verification, per platform.', covers: ['components', 'access', 'delivery'] },
];

export default function MotionMap04({ toProduct }: { toProduct: () => void }) {
  const reduce = useReducedMotion();
  const mapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<{ id: LayerId; box: DOMRect } | null>(null);
  const [lit, setLit] = useState<LayerId[] | null>(null);
  const leaveT = useRef(0), enterT = useRef(0);
  const show = (id: LayerId, el: HTMLElement) => { window.clearTimeout(leaveT.current); setOpen({ id, box: el.getBoundingClientRect() }); };
  const letGo = () => { window.clearTimeout(leaveT.current); leaveT.current = window.setTimeout(() => setOpen(null), 140); };
  const hov = (id: LayerId) => ({
    onPointerEnter: (e: React.PointerEvent<HTMLElement>) => { if (e.pointerType === 'touch') return; const el = e.currentTarget; window.clearTimeout(enterT.current); enterT.current = window.setTimeout(() => show(id, el), 80); },
    onPointerLeave: (e: React.PointerEvent) => { if (e.pointerType === 'touch') return; window.clearTimeout(enterT.current); letGo(); },
    onFocus: (e: React.FocusEvent<HTMLElement>) => show(id, e.currentTarget),
    onClick: (e: React.MouseEvent<HTMLElement>) => show(id, e.currentTarget),
  });
  const node = (id: LayerId, cls = '') => {
    const x = L[id], dim = lit && !lit.includes(id);
    return (
      <button key={id} type="button" className={`mm4-node ${cls}${open?.id === id ? ' on' : ''}${dim ? ' dim' : ''}${lit?.includes(id) ? ' lit' : ''}`} aria-expanded={open?.id === id} {...hov(id)}>
        <i className="mm4-n">{x.n}</i><b>{x.name}</b><span>{x.line}</span><em className="mm4-eg">{x.eg}</em>
      </button>
    );
  };
  return (
    <div className="mm4" ref={mapRef} onClick={e => { if (!(e.target as HTMLElement).closest('.mm4-node, .mm4-card')) setOpen(null); }}>
      {/* 1: across the top — it guides everything under it */}
      <div className="mm4-band top">{node('principles', 'wide')}<span className="mm4-rel">guide every decision below ↓</span></div>
      {/* 2–6: the chain, each link named */}
      <div className="mm4-chainrow">
        {CHAIN.map(([id, rel]) => <div key={id} className="mm4-link">{node(id)}{rel && <span className="mm4-arrow"><span>{rel}</span><i aria-hidden="true">→</i></span>}</div>)}
      </div>
      {/* 7, 8: under every layer, side by side */}
      <div className="mm4-pair">
        <div className="mm4-cell">{node('access')}<span className="mm4-rel">↑ applies to every layer, the demonstrations here included</span></div>
        <div className="mm4-cell">{node('delivery')}<span className="mm4-rel">↑ keeps design, code and verification on one version</span></div>
      </div>
      {/* the three concerns: related, not a sequence */}
      <div className="mm4-concerns" aria-label="Three concerns">
        <span className="mm4-rel">Three concerns, side by side — point at one to see the layers it covers</span>
        <div>{CONCERNS.map(c => <div key={c.name} className="mm4-concern" tabIndex={0} onPointerEnter={() => setLit(c.covers)} onPointerLeave={() => setLit(null)} onFocus={() => setLit(c.covers)} onBlur={() => setLit(null)}><b>{c.name}</b><span>{c.line}</span><small>Layers {c.covers.map(id => L[id].n).join(', ')}</small></div>)}</div>
      </div>
      <AnimatePresence>{open && <Card key={open.id} layer={L[open.id]} box={open.box} map={mapRef} reduce={!!reduce} onEnter={() => window.clearTimeout(leaveT.current)} onLeave={letGo} toProduct={toProduct} />}</AnimatePresence>
    </div>
  );
}

/* a layer's card, beside its node and kept inside the map: placed before it is painted */
function Card({ layer, box, map, reduce, onEnter, onLeave, toProduct }: { layer: Layer; box: DOMRect; map: React.RefObject<HTMLDivElement | null>; reduce: boolean; onEnter: () => void; onLeave: () => void; toProduct: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  useLayoutEffect(() => {
    /* its layout size (offsetWidth/Height), not its box — it enters slightly scaled */
    const m = map.current!.getBoundingClientRect(), W = ref.current!.offsetWidth, H = ref.current!.offsetHeight;
    const nb = { left: box.left - m.left, top: box.top - m.top, right: box.right - m.left, bottom: box.bottom - m.top };
    /* below the node if there is room, else above; else beside; always inside */
    let top = nb.bottom + 8 + H <= m.height ? nb.bottom + 8 : nb.top - 8 - H >= 0 ? nb.top - 8 - H : Math.max(0, Math.min(nb.top, m.height - H));
    const left = Math.max(0, Math.min(nb.left, m.width - W));
    if (top < 0) top = 0;
    setPos({ left, top });
  }, [box, map]);
  return (
    <motion.div ref={ref} className="mm4-card" style={{ left: pos?.left ?? 0, top: pos?.top ?? 0, visibility: pos ? 'visible' : 'hidden' }} onPointerEnter={onEnter} onPointerLeave={e => { if (e.pointerType !== 'touch') onLeave(); }}
      initial={{ opacity: 0, y: reduce ? 0 : 6, scale: reduce ? 1 : .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, transition: { duration: reduce ? 0 : .12 } }} transition={reduce ? { duration: 0 } : { duration: .24, ease: [.2, 0, 0, 1] }}>
      <p className="mm4-k">Layer {layer.n}</p>
      <h4>{layer.name}</h4>
      <p className="mm4-line">{layer.line}</p>
      <div className="mm4-body">{layer.body()}</div>
      {layer.product && <button type="button" className="mm4-go" onClick={toProduct}>{layer.product} <span aria-hidden="true">→</span></button>}
    </motion.div>
  );
}
