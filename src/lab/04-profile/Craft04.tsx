import './craft.css';

/* 04's Craft page, first pass (Nitish, 15–16 Oct): "how I work" as a map of connected nodes with little text — the crafts
   at the centre, the roots small beside them, the tools as satellites of the craft each serves, the workflows chained to
   the right, and the model as a ring around all of it (brief → build → review), drawn lighter. Nothing opens yet: this
   pass is the map alone, to be looked at and moved around; a node will open into a card beside it next. Positions are
   percentages of the map's box, hand-laid; the lines join the nodes' centres under them, so they need no edge maths. */
type Kind = 'core' | 'root' | 'tool' | 'flow' | 'ai';
type Node = { id: string; label: string; kind: Kind; x: number; y: number };

export const NODES: Node[] = [
  /* the crafts */
  { id: 'motion', label: 'Motion design', kind: 'core', x: 45, y: 37 },
  { id: 'interaction', label: 'Interaction design', kind: 'core', x: 30, y: 52 },
  { id: 'product', label: 'Product & UX design', kind: 'core', x: 53, y: 61 },
  /* the roots: content production, where the eye for timing came from */
  { id: 'photo', label: 'Photography', kind: 'root', x: 11, y: 77 },
  { id: 'cine', label: 'Cinematography', kind: 'root', x: 20, y: 88 },
  { id: 'edit', label: 'Video & photo editing', kind: 'root', x: 33, y: 91 },
  /* the tools, each beside the craft it serves */
  { id: 'ae', label: 'After Effects', kind: 'tool', x: 52, y: 20 },
  { id: 'lottie', label: 'Lottie', kind: 'tool', x: 61, y: 30 },
  { id: 'rive', label: 'Rive', kind: 'tool', x: 26, y: 31 },
  { id: 'protopie', label: 'Protopie', kind: 'tool', x: 17, y: 40 },
  { id: 'figma', label: 'Figma', kind: 'tool', x: 66, y: 70 },
  { id: 'code', label: 'Code', kind: 'tool', x: 46, y: 78 },
  /* the workflows */
  { id: 'script', label: 'Script-based motion', kind: 'flow', x: 74, y: 23 },
  { id: 'sm', label: 'State-machine design', kind: 'flow', x: 80, y: 46 },
  { id: 'handoff', label: 'Prototype & handoff', kind: 'flow', x: 75, y: 74 },
  { id: 'msys', label: 'Motion design system', kind: 'flow', x: 89, y: 61 },
  /* the ring: with the model */
  { id: 'brief', label: 'Brief', kind: 'ai', x: 23.6, y: 16 },
  { id: 'build', label: 'Build', kind: 'ai', x: 76.4, y: 16 },
  { id: 'review', label: 'Review', kind: 'ai', x: 96, y: 52 },
];

/* who joins whom; the third value marks the ring's lines, drawn lighter */
const EDGES: [string, string, 'ai'?][] = [
  ['photo', 'product'], ['cine', 'interaction'], ['edit', 'motion'],
  ['ae', 'motion'], ['lottie', 'motion'], ['rive', 'interaction'], ['protopie', 'interaction'], ['figma', 'product'], ['code', 'product'], ['code', 'interaction'],
  ['script', 'lottie'], ['script', 'ae'], ['sm', 'interaction'], ['sm', 'lottie'], ['sm', 'msys'], ['handoff', 'figma'], ['handoff', 'code'], ['msys', 'handoff'], ['msys', 'motion'],
  ['brief', 'motion', 'ai'], ['brief', 'interaction', 'ai'], ['brief', 'product', 'ai'], ['build', 'script', 'ai'], ['review', 'product', 'ai'],
];
const RING = { cx: 50, cy: 52, rx: 46, ry: 44 };

export default function Craft04() {
  const at = Object.fromEntries(NODES.map(n => [n.id, n]));
  return (
    <section className="pp4 cr4" aria-label="Craft">
      <header className="pp4-head">
        <h2 className="h2-4">Craft</h2>
        <div className="pp4-right"><p className="pp4-note">How I work — the crafts, the tools that serve them, the workflows, and where the model fits.</p></div>
      </header>
      <div className="cm4-wrap">
        <div className="cm4">
          <svg className="cm4-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <ellipse className="ring" cx={RING.cx} cy={RING.cy} rx={RING.rx} ry={RING.ry} />
            {EDGES.map(([a, b, k]) => <line key={a + b} className={k} x1={at[a].x} y1={at[a].y} x2={at[b].x} y2={at[b].y} />)}
          </svg>
          <span className="cm4-cap" style={{ left: `${RING.cx}%`, top: `${RING.cy - RING.ry}%` }}>With AI</span>
          {NODES.map(n => <span key={n.id} className={`cn4 ${n.kind}`} style={{ left: `${n.x}%`, top: `${n.y}%` }}>{n.label}</span>)}
        </div>
      </div>
    </section>
  );
}
