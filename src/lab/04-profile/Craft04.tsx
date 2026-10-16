import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import './craft.css';

/* 04's Craft page (Nitish, 15–16 Oct): "how I work" as a map of connected nodes with little text — the crafts at the
   centre, the roots small beside them, the tools as satellites of the craft each serves, the workflows chained to the
   right, and the model as a ring around all of it (brief → build → review), drawn lighter. A node opens into a card
   beside it (his choice, 15 Oct; on hover, 16 Oct): the pill itself grows into the card — anchored at the node's edge nearest the map's
   centre so it grows inward, the open card's grey, the standard radius — and shrinks back on close; one open at a time;
   the map does not move. The cards hold a line or two each for now and, where a live demo is to go, its stage marked.
   Positions are percentages of the map's box, hand-laid; the lines join the nodes' centres under them. */
type Kind = 'core' | 'root' | 'tool' | 'flow' | 'ai';
type Node = { id: string; label: string; kind: Kind; x: number; y: number; text: string; demo?: string };

export const NODES: Node[] = [
  /* the crafts */
  { id: 'motion', label: 'Motion design', kind: 'core', x: 45, y: 37, text: 'One animation playing, with its timing drawn as a strip underneath — where the holds and the overshoot are.', demo: 'an animation and its timing strip' },
  { id: 'interaction', label: 'Interaction design', kind: 'core', x: 30, y: 52, text: 'Two or three micro-interactions running live, the trigger named under each.', demo: 'micro-interactions, live' },
  { id: 'product', label: 'Product & UX design', kind: 'core', x: 53, y: 61, text: 'The product work — Lenskart’s B, Swiggy’s navigation, RideQuest — as tiles that jump to their project.' },
  /* the roots: content production, where the eye for timing came from */
  { id: 'photo', label: 'Photography', kind: 'root', x: 11, y: 77, text: 'Composition and light — where the eye came from.' },
  { id: 'cine', label: 'Cinematography', kind: 'root', x: 20, y: 88, text: 'The hold and the cut — where the sense of timing came from.' },
  { id: 'edit', label: 'Video & photo editing', kind: 'root', x: 33, y: 91, text: 'Rhythm: when a cut lands.' },
  /* the tools, each beside the craft it serves */
  { id: 'ae', label: 'After Effects', kind: 'tool', x: 52, y: 20, text: 'Where the motion is made.' },
  { id: 'lottie', label: 'Lottie', kind: 'tool', x: 61, y: 30, text: 'Delivery: animation as data. Coin Rig — a rig as a Creator plugin, on the LottieFiles Bazaar.' },
  { id: 'rive', label: 'Rive', kind: 'tool', x: 26, y: 31, text: 'State machines, drawn and run.' },
  { id: 'protopie', label: 'Protopie', kind: 'tool', x: 17, y: 40, text: 'Prototypes with real triggers and variables.' },
  { id: 'figma', label: 'Figma', kind: 'tool', x: 62, y: 69, text: 'Where the product work is designed.' },
  { id: 'code', label: 'Code', kind: 'tool', x: 46, y: 78, text: 'This site is the sample.' },
  /* the workflows */
  { id: 'script', label: 'Script-based motion', kind: 'flow', x: 74, y: 23, text: 'A Lottie built by script: change a parameter and the animation follows — it stays a Lottie, not a video.', demo: 'a parameter and the Lottie that follows it' },
  { id: 'sm', label: 'State-machine design', kind: 'flow', x: 80, y: 46, text: 'States, transitions, triggers: one system that holds for every variable. Press a trigger and the component changes state in step.', demo: 'a state machine, live' },
  { id: 'handoff', label: 'Prototype & handoff', kind: 'flow', x: 75, y: 74, text: 'The sheet of what moves, when, on what trigger, on which curve — beside the prototype it describes.', demo: 'the handoff sheet and its prototype' },
  { id: 'msys', label: 'Motion design system', kind: 'flow', x: 89, y: 61, text: 'Durations, easings and choreography as tokens a design system can hold. The system has its own page; the story, a project card.', demo: 'the tokens, moving' },
  /* the ring: with the model */
  { id: 'brief', label: 'Brief', kind: 'ai', x: 23.6, y: 16, text: 'The craft becomes the brief: the states, the timing, the curve, in its own terms.' },
  { id: 'build', label: 'Build', kind: 'ai', x: 76.4, y: 16, text: 'The model does the labour: the code, the Lottie JSON, the variants.' },
  { id: 'review', label: 'Review', kind: 'ai', x: 96, y: 52, text: 'The hand checks: the timing by eye, the states by walking them.' },
];

/* who joins whom; the third value marks the ring's lines, drawn lighter */
const EDGES: [string, string, 'ai'?][] = [
  ['photo', 'product'], ['cine', 'interaction'], ['edit', 'motion'],
  ['ae', 'motion'], ['lottie', 'motion'], ['rive', 'interaction'], ['protopie', 'interaction'], ['figma', 'product'], ['code', 'product'], ['code', 'interaction'],
  ['script', 'lottie'], ['script', 'ae'], ['sm', 'interaction'], ['sm', 'lottie'], ['sm', 'msys'], ['handoff', 'figma'], ['handoff', 'code'], ['msys', 'handoff'], ['msys', 'motion'],
  ['brief', 'motion', 'ai'], ['brief', 'interaction', 'ai'], ['brief', 'product', 'ai'], ['build', 'script', 'ai'], ['review', 'product', 'ai'],
];
const RING = { cx: 50, cy: 52, rx: 46, ry: 44 };
const CARD_W = 320;
const SPRING = { type: 'spring', stiffness: 320, damping: 34, mass: 1 } as const;

/* the open card's anchor: the node's box in the map, and which edges it grows from */
type Open = { id: string; left: number; top: number; right: number; bottom: number; w: number; h: number; toRight: boolean; down: boolean; bg: string; border: string; r: number; openBg: string };

export default function Craft04() {
  const at = Object.fromEntries(NODES.map(n => [n.id, n]));
  const mapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Open | null>(null);
  const reduce = useReducedMotion();
  /* hover opens (Nitish, 16 Oct: a click has no nudge); a short wait so a sweep across the map does not open everything,
     and a short grace on leaving so the edge does not flicker. Touch has no hover, so a tap opens there; focus opens too. */
  const enterT = useRef(0), leaveT = useRef(0);
  const hold = () => window.clearTimeout(leaveT.current);
  const letGo = () => { hold(); leaveT.current = window.setTimeout(() => setOpen(null), 120); };
  const show = (id: string) => {
    const map = mapRef.current; const el = map?.querySelector<HTMLElement>(`[data-id="${id}"]`); if (!map || !el) return;
    hold(); if (open?.id === id) return;
    const m = map.getBoundingClientRect(), b = el.getBoundingClientRect(), cs = getComputedStyle(el), ms = getComputedStyle(map);
    setOpen({
      id, left: b.left - m.left, top: b.top - m.top, right: m.right - b.right, bottom: m.bottom - b.bottom, w: b.width, h: b.height,
      toRight: (b.left + b.right) / 2 - m.left < m.width / 2, down: (b.top + b.bottom) / 2 - m.top < m.height / 2,
      bg: cs.backgroundColor, border: cs.borderColor, r: parseFloat(ms.getPropertyValue('--r')) || 20, openBg: ms.getPropertyValue('--pcard-open').trim() || '#e0e0e0',
    });
  };
  useEffect(() => { if (!open) return; const on = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); }; addEventListener('keydown', on); return () => removeEventListener('keydown', on); }, [open]);
  useEffect(() => () => { window.clearTimeout(enterT.current); window.clearTimeout(leaveT.current); }, []);
  const tr = reduce ? { duration: 0 } : SPRING;
  const node = open ? at[open.id] : null;
  return (
    <section className="pp4 cr4" aria-label="Craft">
      <header className="pp4-head">
        <h2 className="h2-4">Craft</h2>
        <div className="pp4-right"><p className="pp4-note">How I work — the crafts, the tools that serve them, the workflows, and where the model fits.</p></div>
      </header>
      <div className="cm4-wrap">
        {/* a click on the map's floor closes the card. A tap's click can arrive with the floor as its target even though it
            landed on a node — the node opened its card on the tap's focus, so the tap's down and up targets differ and the
            click goes to their common ancestor — so the point is checked, not the target. */}
        <div className="cm4" ref={mapRef} onClick={e => { if (!document.elementFromPoint(e.clientX, e.clientY)?.closest('.cc4, .cn4')) setOpen(null); }}>
          <svg className="cm4-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <ellipse className="ring" cx={RING.cx} cy={RING.cy} rx={RING.rx} ry={RING.ry} />
            {EDGES.map(([a, b, k]) => <line key={a + b} className={k} x1={at[a].x} y1={at[a].y} x2={at[b].x} y2={at[b].y} />)}
          </svg>
          <span className="cm4-cap" style={{ left: `${RING.cx}%`, top: `${RING.cy - RING.ry}%` }}>With AI</span>
          {NODES.map(n => (
            <button key={n.id} type="button" data-id={n.id} className={`cn4 ${n.kind}${open?.id === n.id ? ' on' : ''}`} style={{ left: `${n.x}%`, top: `${n.y}%` }} aria-expanded={open?.id === n.id}
              onPointerEnter={e => { if (e.pointerType === 'touch') return; hold(); window.clearTimeout(enterT.current); enterT.current = window.setTimeout(() => show(n.id), 70); }}
              onPointerLeave={e => { if (e.pointerType === 'touch') return; window.clearTimeout(enterT.current); letGo(); }}
              onFocus={() => show(n.id)} onClick={() => show(n.id)}>{n.label}</button>
          ))}
          {/* the card: grows out of the node's box, anchored at the edges nearest the map's centre, and shrinks back — the
              node shows again as soon as it closes, and the card fades out over it in the last stretch of the shrink */}
          <AnimatePresence>
            {open && node && (
              <motion.div key={open.id} className="cc4" style={{ [open.toRight ? 'left' : 'right']: open.toRight ? open.left : open.right, [open.down ? 'top' : 'bottom']: open.down ? open.top : open.bottom }}
                onPointerEnter={hold} onPointerLeave={e => { if (e.pointerType !== 'touch') letGo(); }}
                initial={{ width: open.w, height: open.h, borderRadius: open.h / 2, backgroundColor: open.bg, borderColor: open.border }}
                animate={{ width: CARD_W, height: 'auto', borderRadius: open.r, backgroundColor: open.openBg, borderColor: 'rgba(0,0,0,0)', transition: tr }}
                exit={{ width: open.w, height: open.h, borderRadius: open.h / 2, backgroundColor: open.bg, borderColor: open.border, opacity: 0, transition: reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 36, opacity: { delay: .18, duration: .14 } } }}>
                <motion.div className="cc4-in" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: reduce ? 0 : .1, duration: reduce ? 0 : .22 } }} exit={{ opacity: 0, transition: { duration: reduce ? 0 : .08 } }}>
                  <h3 className="cc4-title">{node.label}</h3>
                  {node.demo && <div className="cc4-stage" aria-hidden="true"><span>{node.demo} — next</span></div>}
                  <p className="cc4-text">{node.text}</p>
                  <button type="button" className="cc4-x" aria-label="Close" onClick={() => setOpen(null)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
