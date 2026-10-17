import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import StateMachine04 from './StateMachine04';
import { OrbField, OrbTuner, TUNE0, type OrbTune } from './WorkflowOrb04';
import './workflow.css';

/* 04's Workflow page (Nitish, 15–16 Oct; named Craft until 16 Oct): "how I work" as a map of connected nodes with little text — the crafts at the
   centre, the tools as satellites of the craft each serves, the workflows chained to the right, and the model as a ring
   around all of it (brief → build → review), drawn lighter. The roots (photography, cinematography, editing) came off
   on 16 Oct: the page is about the current crafts and the workflow that joins them; the earlier career may get a tab
   of its own. A node opens into a card
   beside it (his choice, 15 Oct; on hover, 16 Oct): the pill itself grows into the card — anchored at the node's edge nearest the map's
   centre so it grows inward, the open card's grey, the standard radius — and shrinks back on close; one open at a time;
   the map does not move. The cards hold a line or two each and, where a live demo is to go, its stage — marked until
   it is built (the state machine is live, 16 Oct). Each card's height is measured ahead, off-screen, so it can grow to
   its exact size and be kept inside the map (pushed up or in from an edge when the node sits near one).
   Positions are percentages of the map's box, hand-laid; the lines join the nodes' centres under them. */
type Kind = 'core' | 'tool' | 'flow' | 'ai';
type Node = { id: string; label: string; kind: Kind; x: number; y: number; text: string; demo?: string; live?: () => React.ReactNode };

export const NODES: Node[] = [
  /* the crafts */
  { id: 'motion', label: 'Animation', kind: 'core', x: 45, y: 40, text: 'One animation playing, with its timing drawn as a strip underneath — where the holds and the overshoot are.', demo: 'an animation and its timing strip' },
  { id: 'interaction', label: 'Interaction design', kind: 'core', x: 30, y: 59, text: 'Two or three micro-interactions running live, the trigger named under each.', demo: 'micro-interactions, live' },
  { id: 'product', label: 'Product & UX design', kind: 'core', x: 53, y: 64, text: 'The product work — Lenskart’s B, Swiggy’s navigation, RideQuest — as tiles that jump to their project.' },
  /* the tools, each beside the craft it serves */
  { id: 'ae', label: 'After Effects', kind: 'tool', x: 52, y: 23, text: 'Where the motion is made.' },
  { id: 'lottie', label: 'Lottie', kind: 'tool', x: 61, y: 33, text: 'Delivery: animation as data. Coin Rig — a rig as a Creator plugin, on the LottieFiles Bazaar.' },
  { id: 'rive', label: 'Rive', kind: 'tool', x: 24, y: 36, text: 'State machines, drawn and run.' },
  { id: 'protopie', label: 'Protopie', kind: 'tool', x: 16, y: 49, text: 'Prototypes with real triggers and variables.' },
  { id: 'figma', label: 'Figma', kind: 'tool', x: 62, y: 72, text: 'Where the product work is designed.' },
  { id: 'code', label: 'Code', kind: 'tool', x: 42, y: 83, text: 'This site is the sample.' },
  /* the workflows */
  { id: 'script', label: 'Script-based motion', kind: 'flow', x: 75, y: 31, text: 'A Lottie built by script: change a parameter and the animation follows — it stays a Lottie, not a video.', demo: 'a parameter and the Lottie that follows it' },
  { id: 'sm', label: 'State-machine design', kind: 'flow', x: 80, y: 49, text: 'States, transitions, triggers: one system that holds for every case. Press the button or fire a trigger — the machine only allows what the state allows.', live: () => <StateMachine04 /> },
  { id: 'handoff', label: 'Prototype & handoff', kind: 'flow', x: 75, y: 77, text: 'The sheet of what moves, when, on what trigger, on which curve — beside the prototype it describes.', demo: 'the handoff sheet and its prototype' },
  { id: 'msys', label: 'Motion design system', kind: 'flow', x: 89, y: 64, text: 'Durations, easings and choreography as tokens a design system can hold. The system has its own page; the story, a project card.', demo: 'the tokens, moving' },
  /* the ring: with the model */
  { id: 'brief', label: 'Brief', kind: 'ai', x: 23.6, y: 20.5, text: 'The craft becomes the brief: the states, the timing, the curve, in its own terms.' },
  { id: 'build', label: 'Build', kind: 'ai', x: 76.4, y: 20.5, text: 'The model does the labour: the code, the Lottie JSON, the variants.' },
  { id: 'review', label: 'Review', kind: 'ai', x: 96, y: 50, text: 'The hand checks: the timing by eye, the states by walking them.' },
];

/* who joins whom; the third value marks the ring's lines, drawn lighter */
const EDGES: [string, string, 'ai'?][] = [
  ['ae', 'motion'], ['lottie', 'motion'], ['rive', 'interaction'], ['protopie', 'interaction'], ['figma', 'product'], ['code', 'product'], ['code', 'interaction'],
  ['script', 'lottie'], ['script', 'ae'], ['sm', 'interaction'], ['sm', 'lottie'], ['sm', 'msys'], ['handoff', 'figma'], ['handoff', 'code'], ['msys', 'handoff'], ['msys', 'motion'],
  ['brief', 'motion', 'ai'], ['brief', 'interaction', 'ai'], ['brief', 'product', 'ai'], ['build', 'script', 'ai'], ['review', 'product', 'ai'],
];
/* Variant 2 (Nitish, 17 Oct; WorkflowOrb04.tsx): the assistant's orb takes the centre, so the pills are laid out around
   it, by group — Animation with After Effects and Lottie at the top left, Script-based motion and Build at the top
   right, interaction at the left (Interaction design, Rive, Protopie, State-machine design), product at the bottom
   (Product & UX design, Figma, Code, Prototype & handoff), the motion design system and Review at the right, Brief at
   the top left. Re-laid on the second pass so Variant 1's lines (EDGES, kept) don't run under other pills; lines that
   cross the middle pass behind the orb. Hand-laid against a map of about 1185 × 620 (1440 wide), clear of the orb at its
   default size. Fourth pass (Nitish: Lottie and Rive "near animation, interaction, state machine … not a curve all the
   way to state machine … till script-based motion a straight line"; the orb at about 21%): found by a small search
   from his moves — no pill on another or on the orb, no line or orb wire under another pill (with room for the drift),
   no line bending round the orb, at 1440 and at 1280 (scratchpad layout_opt.py). */
const POS2: Record<string, { x: number; y: number }> = {
  motion: { x: 33, y: 26.8 }, ae: { x: 44.3, y: 12.9 }, lottie: { x: 35.3, y: 39.1 }, script: { x: 72.5, y: 14.6 }, build: { x: 89.4, y: 21.9 }, brief: { x: 15.1, y: 15.2 },
  interaction: { x: 22.3, y: 56.7 }, rive: { x: 24.8, y: 44.9 }, protopie: { x: 11.7, y: 74.8 }, sm: { x: 28.4, y: 83.9 },
  product: { x: 53.3, y: 88 }, figma: { x: 71.4, y: 90.9 }, code: { x: 40.6, y: 82.8 }, handoff: { x: 82.6, y: 73.1 },
  msys: { x: 78.7, y: 43.2 }, review: { x: 91.2, y: 51 },
};
const PINS = NODES.map(n => ({ id: n.id, ...POS2[n.id] }));
/* who is wired to the orb: the tools (17 Oct, third pass — "let's do the opposite … the tools will now have the
   connections, shifted from one dot to the other"; the skills, wired on the second pass, keep only their lines to the
   tools) */
const WIRED = [...NODES.filter(n => n.kind === 'tool').map(n => n.id), 'motion', 'interaction', 'script', 'sm', 'msys', 'handoff']; /* fourth pass: tools and skills alike, in groups */
const RING = { cx: 50, cy: 50, rx: 46, ry: 36 }; /* tightened when the roots came off */
const CARD_W = 320, CARD_W_LIVE = 440; /* a card with a live demo is wider */
const SPRING = { type: 'spring', stiffness: 320, damping: 34, mass: 1 } as const;

/* the open card: the node's box in the map (where it grows from and shrinks back to) and the card's own box */
type Box = { left: number; top: number; width: number; height: number };
type Open = { id: string; from: Box; to: Box; bg: string; border: string; r: number; openBg: string };
const widthOf = (n: Node) => (n.live ? CARD_W_LIVE : CARD_W);

/* a card's content — the same for the open card and for the off-screen copy that measures it */
function CardBody({ node, onClose }: { node: Node; onClose?: () => void }) {
  return (<>
    <h3 className="cc4-title">{node.label}</h3>
    {node.live ? node.live() : node.demo && <div className="cc4-stage" aria-hidden="true"><span>{node.demo} — next</span></div>}
    <p className="cc4-text">{node.text}</p>
    <button type="button" className="cc4-x" aria-label="Close" onClick={onClose} tabIndex={onClose ? 0 : -1}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
  </>);
}

export default function Workflow04() {
  const at = Object.fromEntries(NODES.map(n => [n.id, n]));
  const mapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Open | null>(null);
  /* two variants (17 Oct): 1 is the map as it was, 2 the orb; 2 opens first, ?v=1 keeps 1 in the address */
  const [params, setParams] = useSearchParams();
  const v2 = params.get('v') !== '1';
  const setVariant = (n: 1 | 2) => { setOpen(null); setParams(n === 1 ? { v: '1' } : {}, { replace: true }); };
  const [tune, setTune] = useState<OrbTune>(TUNE0);
  const pos = (n: Node) => (v2 ? POS2[n.id] : n);
  const reduce = useReducedMotion();
  /* every card's height, measured off-screen at its width */
  const measureRef = useRef<HTMLDivElement>(null);
  const heights = useRef<Record<string, number>>({});
  useLayoutEffect(() => {
    const el = measureRef.current; if (!el) return;
    const read = () => el.querySelectorAll<HTMLElement>('[data-m]').forEach(c => { heights.current[c.dataset.m!] = c.offsetHeight; });
    read(); const ro = new ResizeObserver(read); ro.observe(el); return () => ro.disconnect();
  }, []);
  /* hover opens (Nitish, 16 Oct: a click has no nudge); a short wait so a sweep across the map does not open everything,
     and a short grace on leaving so the edge does not flicker. Touch has no hover, so a tap opens there; focus opens too. */
  const enterT = useRef(0), leaveT = useRef(0);
  const hold = () => window.clearTimeout(leaveT.current);
  const letGo = () => { hold(); leaveT.current = window.setTimeout(() => setOpen(null), 120); };
  const show = (id: string) => {
    const map = mapRef.current; const el = map?.querySelector<HTMLElement>(`[data-id="${id}"]`); if (!map || !el) return;
    hold(); if (open?.id === id) return;
    const m = map.getBoundingClientRect(), b = el.getBoundingClientRect(), cs = getComputedStyle(el), ms = getComputedStyle(map);
    const from = { left: b.left - m.left, top: b.top - m.top, width: b.width, height: b.height };
    const W = widthOf(at[id]), H = heights.current[id] ?? 200;
    /* it grows toward the map's centre from the node's nearer corner, and is kept inside the map */
    const toRight = from.left + from.width / 2 < m.width / 2, down = from.top + from.height / 2 < m.height / 2;
    const clamp = (v: number, hi: number) => Math.max(0, Math.min(v, Math.max(0, hi)));
    const to = { left: clamp(toRight ? from.left : from.left + from.width - W, m.width - W), top: clamp(down ? from.top : from.top + from.height - H, m.height - H), width: W, height: H };
    setOpen({ id, from, to, bg: cs.backgroundColor, border: cs.borderColor, r: parseFloat(ms.getPropertyValue('--r')) || 20, openBg: ms.getPropertyValue('--pcard-open').trim() || '#e0e0e0' });
  };
  useEffect(() => { if (!open) return; const on = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); }; addEventListener('keydown', on); return () => removeEventListener('keydown', on); }, [open]);
  useEffect(() => () => { window.clearTimeout(enterT.current); window.clearTimeout(leaveT.current); }, []);
  const tr = reduce ? { duration: 0 } : SPRING;
  const node = open ? at[open.id] : null;
  return (
    <section className="pp4 cr4" aria-label="Workflow">
      <header className="pp4-head">
        <h2 className="h2-4">Workflow</h2>
        <div className="pp4-right">
          <div className="vs4" role="tablist" aria-label="Variant">{([1, 2] as const).map(n => <button key={n} type="button" role="tab" aria-selected={v2 === (n === 2)} className={v2 === (n === 2) ? 'on' : ''} onClick={() => setVariant(n)}>Variant {n}</button>)}</div>
          <p className="pp4-note">{v2 ? 'The skills and tools I work with, wired into the assistant. Knowing the craft is what makes the AI useful.' : 'How I work — the skills, the tools that serve them, the workflows that join them, and where the model fits.'}</p>
        </div>
      </header>
      <div className="cm4-wrap">
        {/* a click on the map's floor closes the card. A tap's click can arrive with the floor as its target even though it
            landed on a node — the node opened its card on the tap's focus, so the tap's down and up targets differ and the
            click goes to their common ancestor — so the point is checked, not the target. */}
        <div className={`cm4${v2 ? ' v2' : ''}`} ref={mapRef} onClick={e => { if (!document.elementFromPoint(e.clientX, e.clientY)?.closest('.cc4, .cn4')) setOpen(null); }}>
          {v2 ? <OrbField key="orb" pins={PINS} links={EDGES} wired={WIRED} mapRef={mapRef} openId={open?.id ?? null} tune={tune} /> : <>
            <svg className="cm4-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <ellipse className="ring" cx={RING.cx} cy={RING.cy} rx={RING.rx} ry={RING.ry} />
              {EDGES.map(([a, b, k]) => <line key={a + b} className={k} x1={at[a].x} y1={at[a].y} x2={at[b].x} y2={at[b].y} />)}
            </svg>
            <span className="cm4-cap" style={{ left: `${RING.cx}%`, top: `${RING.cy - RING.ry}%` }}>With AI</span>
          </>}
          {NODES.map(n => (
            <button key={n.id} type="button" data-id={n.id} className={`cn4 ${n.kind}${open?.id === n.id ? ' on' : ''}`} style={{ left: `${pos(n).x}%`, top: `${pos(n).y}%` }} aria-expanded={open?.id === n.id}
              onPointerEnter={e => { if (e.pointerType === 'touch') return; hold(); window.clearTimeout(enterT.current); enterT.current = window.setTimeout(() => show(n.id), 70); }}
              onPointerLeave={e => { if (e.pointerType === 'touch') return; window.clearTimeout(enterT.current); letGo(); }}
              onFocus={() => show(n.id)} onClick={() => show(n.id)}>{n.label}</button>
          ))}
          {/* the card: grows out of the node's box, anchored at the edges nearest the map's centre, and shrinks back — the
              node shows again as soon as it closes, and the card fades out over it in the last stretch of the shrink */}
          <AnimatePresence>
            {open && node && (
              <motion.div key={open.id} className="cc4"
                onPointerEnter={hold} onPointerLeave={e => { if (e.pointerType !== 'touch') letGo(); }}
                initial={{ ...open.from, borderRadius: open.from.height / 2, backgroundColor: open.bg, borderColor: open.border }}
                animate={{ ...open.to, borderRadius: open.r, backgroundColor: open.openBg, borderColor: 'rgba(0,0,0,0)', transition: tr }}
                exit={{ ...open.from, borderRadius: open.from.height / 2, backgroundColor: open.bg, borderColor: open.border, opacity: 0, transition: reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 36, opacity: { delay: .18, duration: .14 } } }}>
                <motion.div className="cc4-in" style={{ width: open.to.width }} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: reduce ? 0 : .1, duration: reduce ? 0 : .22 } }} exit={{ opacity: 0, transition: { duration: reduce ? 0 : .08 } }}>
                  <CardBody node={node} onClose={() => setOpen(null)} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {v2 && <OrbTuner tune={tune} setTune={setTune} anchor={mapRef} />}
        {/* the cards, off-screen, to be measured */}
        <div className="cc4-measure" ref={measureRef} aria-hidden="true" inert>
          {NODES.map(n => <div key={n.id} data-m={n.id} className="cc4-in" style={{ width: widthOf(n) }}><CardBody node={n} /></div>)}
        </div>
      </div>
    </section>
  );
}
