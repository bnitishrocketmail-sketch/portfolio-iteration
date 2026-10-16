import { cubicBezier } from 'motion/react';

/* The motion system's tokens — his framework (docs/motion-system-brief.md, v0.1), layer 3, "from intent to reusable
   values": a dependency hierarchy, not three animations.
     1. primitives — raw values (durations, curves, springs, distances, scales), named here by their value;
     2. semantic roles — named presets that express purpose and reference primitives (`motion.surface.enter`);
     3. component mappings — a component's transition referencing a role, with documented contextual adjustments
        (`sheet.open` → `motion.surface.enter`, from the bottom edge, its full height).
   One role serves many components (the sheet and the toast both enter as a surface), which is how one change reaches
   them all. Every value is illustrative — his baseline where the brief gives one (press 120 ms at 0.98, surface enter
   240 ms over 24 px on cubic-bezier(0.2, 0, 0, 1), surface exit 180 ms, content change 160 ms), Claude's in the same
   spirit for the roles the example app adds (container, navigation, view). Not production defaults. */

export type Bezier = [number, number, number, number];
export type Prim = { id: string; kind: 'duration' | 'easing' | 'distance' | 'scale'; label: string; ms?: number; bezier?: Bezier; spring?: { k: number; c: number }; px?: number; v?: number };

export const PRIMS: Prim[] = [
  { id: 'duration.120', kind: 'duration', label: '120 ms', ms: 120 },
  { id: 'duration.160', kind: 'duration', label: '160 ms', ms: 160 },
  { id: 'duration.180', kind: 'duration', label: '180 ms', ms: 180 },
  { id: 'duration.240', kind: 'duration', label: '240 ms', ms: 240 },
  { id: 'duration.300', kind: 'duration', label: '300 ms', ms: 300 },
  { id: 'easing.standard', kind: 'easing', label: '0.2, 0, 0, 1', bezier: [.2, 0, 0, 1] },
  { id: 'easing.exit', kind: 'easing', label: '0.3, 0, 1, 1', bezier: [.3, 0, 1, 1] },
  { id: 'easing.linear', kind: 'easing', label: '0, 0, 1, 1', bezier: [0, 0, 1, 1] },
  { id: 'spring.expressive', kind: 'easing', label: 'stiffness 400 · damping 14', spring: { k: 400, c: 14 } },
  { id: 'distance.8', kind: 'distance', label: '8 px', px: 8 },
  { id: 'distance.24', kind: 'distance', label: '24 px', px: 24 },
  { id: 'scale.98', kind: 'scale', label: '1 → 0.98', v: .98 },
  { id: 'scale.92', kind: 'scale', label: '0.92 → 1', v: .92 },
];
export const prim = (id: string) => PRIMS.find(p => p.id === id)!;

/* a role: its purpose, and the primitives it references */
export type Role = { id: string; purpose: string; duration: string; easing: string; distance?: string; scale?: string; opacity?: boolean };
export const ROLES: Role[] = [
  { id: 'motion.feedback.press', purpose: 'Press and release acknowledgement', duration: 'duration.120', easing: 'easing.standard', scale: 'scale.98' },
  { id: 'motion.surface.enter', purpose: 'Reveal a surface from its origin', duration: 'duration.240', easing: 'easing.standard', distance: 'distance.24', opacity: true },
  { id: 'motion.surface.exit', purpose: 'Dismiss a surface', duration: 'duration.180', easing: 'easing.exit', distance: 'distance.8', opacity: true },
  { id: 'motion.content.change', purpose: 'Update a label or a small content area', duration: 'duration.160', easing: 'easing.standard', opacity: true },
  { id: 'motion.container.expand', purpose: 'Grow an element into the page it opens', duration: 'duration.300', easing: 'easing.standard' },
  { id: 'motion.container.collapse', purpose: 'Return a page to the element it came from', duration: 'duration.240', easing: 'easing.standard' },
  { id: 'motion.navigation.forward', purpose: 'Move deeper along a path', duration: 'duration.300', easing: 'easing.standard', distance: 'distance.24', opacity: true },
  { id: 'motion.navigation.back', purpose: 'Return along a path', duration: 'duration.240', easing: 'easing.standard', distance: 'distance.24', opacity: true },
  { id: 'motion.view.arrive', purpose: 'Bring in a sibling view', duration: 'duration.240', easing: 'easing.standard', scale: 'scale.92', opacity: true },
];
export const role = (id: string) => ROLES.find(r => r.id === id)!;

/* a component mapping: the component's transition, the role it uses, and any documented adjustment */
export type Mapping = { id: string; role: string; adjust?: string };
export type MomentId = 'card' | 'page' | 'pay' | 'tab' | 'sheet' | 'toast' | 'press';
export type Phase = 'enter' | 'exit';
/* his pattern families, organised by the user's question (brief, layer 4) */
export const FAMILY = {
  input: { name: 'Input and feedback', q: 'Did my action register?' },
  visibility: { name: 'Visibility and disclosure', q: 'What became available?' },
  navigation: { name: 'Navigation and continuity', q: 'Where did I go?' },
  content: { name: 'Content and layout', q: 'What changed on this screen?' },
  progress: { name: 'Progress and waiting', q: 'Is something happening?' },
  outcome: { name: 'Outcomes and recovery', q: 'What happened? What next?' },
  attention: { name: 'Attention and expression', q: 'What deserves attention?' },
} as const;
export type Family = keyof typeof FAMILY;
/* the developer's view of a moment (brief, layers 5–7): the tracks — which element owns which properties, when each
   starts and how long it runs, on which token — what happens when it is interrupted, its reduced-motion version, and
   what can be checked */
export type Track = { name: string; owns: string; start: number; dur: number; ref: string };
export type Dev = { tracks: Track[]; note?: string; interrupt: string; reduced: string; accept: string[] };
export type Moment = { id: MomentId; group: string; family: Family; name: string; pattern: string; trigger: string; why: string; enter: Mapping; exit?: Mapping; labels: [string, string?]; dev: Dev };
const D = (r: string) => prim(role(r).duration).ms!;

export const MOMENTS: Moment[] = [
  { id: 'card', group: 'The flow', family: 'navigation', name: 'Open a card', pattern: 'Container transform', trigger: 'Tap a card', labels: ['Open', 'Close'],
    why: 'The card becomes the page, so where you came from is never lost.',
    enter: { id: 'card.open', role: 'motion.container.expand', adjust: 'from the card’s own box' },
    exit: { id: 'card.close', role: 'motion.container.collapse', adjust: 'back to the card’s box' },
    dev: { tracks: [
      { name: 'Container', owns: 'position, size, corner radius', start: 0, dur: D('motion.container.expand'), ref: 'motion.container.expand' },
      { name: 'Page content', owns: 'opacity', start: D('motion.container.expand') * .4, dur: D('motion.container.expand') * .5, ref: 'duration.300 × 0.4–0.9' },
    ], interrupt: 'Closed while opening: it shrinks back from wherever it has grown to.', reduced: 'The page appears in place; the card does not grow.', accept: ['The page grows from the tapped card’s own box, and returns to it.', 'That card stays hidden until its page has fully returned.', 'Back is usable as soon as the page appears.'] } },
  { id: 'sheet', group: 'The flow', family: 'visibility', name: 'Bottom sheet', pattern: 'Slide from its edge', trigger: 'Options', labels: ['Open', 'Close'],
    why: 'It arrives and settles; it leaves faster, getting out of the way. The same roles as the toast — a surface is a surface.',
    enter: { id: 'sheet.open', role: 'motion.surface.enter' },
    exit: { id: 'sheet.close', role: 'motion.surface.exit' },
    dev: { tracks: [
      { name: 'Scrim', owns: 'opacity 0 → 0.38', start: 0, dur: 160, ref: 'duration.160' },
      { name: 'Surface', owns: 'translate 24 px → 0, opacity 0 → 1', start: 0, dur: D('motion.surface.enter'), ref: 'motion.surface.enter' },
      { name: 'Content', owns: 'opacity only', start: 0, dur: D('motion.content.change'), ref: 'motion.content.change' },
    ], note: 'All three start on the trigger and overlap. The content sits inside the surface: it owns only its opacity and inherits the movement, so nothing is translated twice; its fade multiplies with the surface’s, so it finishes first.',
    interrupt: 'Dismissed while entering: it leaves from where it is, not from its resting place.', reduced: 'Appears in place with no travel; the scrim and content fade.', accept: ['Focus moves into the sheet, and back to Options when it closes; Escape closes it.', 'Its controls work from the first frame — nothing waits for the motion.', 'A tap on the scrim closes it.'] } },
  { id: 'toast', group: 'The flow', family: 'outcome', name: 'Toast', pattern: 'Rise and fade', trigger: 'Add to bag', labels: ['Show', 'Hide'],
    why: 'The same roles as the sheet, unadjusted: a short rise in, a shorter fall out.',
    enter: { id: 'toast.show', role: 'motion.surface.enter' },
    exit: { id: 'toast.hide', role: 'motion.surface.exit' },
    dev: { tracks: [
      { name: 'Toast', owns: 'translate 24 px → 0, opacity 0 → 1', start: 0, dur: D('motion.surface.enter'), ref: 'motion.surface.enter' },
      { name: 'Held', owns: 'nothing moves', start: D('motion.surface.enter'), dur: 1700 - D('motion.surface.enter'), ref: '1.7 s on screen' },
      { name: 'Toast leaves', owns: 'translate 0 → 8 px, opacity 1 → 0', start: 1700, dur: D('motion.surface.exit'), ref: 'motion.surface.exit' },
    ], interrupt: 'A second toast replaces the first; it does not queue behind it.', reduced: 'Appears and leaves without rising.', accept: ['It is announced politely, once.', 'It never covers the action that caused it.', 'The outcome stays visible elsewhere — the count on Bag.'] } },
  { id: 'page', group: 'The flow', family: 'navigation', name: 'Go forward, go back', pattern: 'Shared axis — the page shift', trigger: 'Continue · back', labels: ['Forward', 'Back'],
    why: 'Forward comes in from the right and back from the left: the direction is the hierarchy.',
    enter: { id: 'page.forward', role: 'motion.navigation.forward' },
    exit: { id: 'page.back', role: 'motion.navigation.back' },
    dev: { tracks: [
      { name: 'Leaving page', owns: 'translate 0 → −24 px; opacity out early', start: 0, dur: D('motion.navigation.forward'), ref: 'motion.navigation.forward' },
      { name: 'Arriving page', owns: 'translate 24 px → 0; opacity in late', start: 0, dur: D('motion.navigation.forward'), ref: 'motion.navigation.forward' },
    ], note: 'Both move together along one axis; the leaving page fades in the first third, the arriving one after it, so they never compete.',
    interrupt: 'Back while going forward reverses from the current position.', reduced: 'A cross-fade, with no travel.', accept: ['Forward arrives from the right, back from the left.', 'Back is available from the first frame.', 'Each page keeps its place when returned to.'] } },
  { id: 'pay', group: 'The flow', family: 'outcome', name: 'Pay', pattern: 'A component contract', trigger: 'Pay', labels: ['Press', 'Label'],
    why: 'Application events drive the state; motion only says what the state is.',
    enter: { id: 'pay.press', role: 'motion.feedback.press', adjust: 'returns to 1 on release' },
    exit: { id: 'pay.label', role: 'motion.content.change', adjust: 'opacity only; width and hit area stay' },
    dev: { tracks: [
      { name: 'Button', owns: 'scale 1 → 0.98, back on release', start: 0, dur: D('motion.feedback.press'), ref: 'motion.feedback.press' },
      { name: 'Label', owns: 'opacity, old out and new in', start: 0, dur: D('motion.content.change'), ref: 'motion.content.change' },
    ], interrupt: 'Taps while paying or checking are ignored; leaving stops the animation, not the payment.', reduced: 'No scale, no spinner loop; the label and the announced status line still change.', accept: ['Each state change matches an application event — never an animation ending.', 'An unclear outcome shows as checking, never as failed.'] } },
  { id: 'tab', group: 'Anywhere', family: 'navigation', name: 'Switch tabs', pattern: 'Fade through', trigger: 'Tap a tab', labels: ['Arrive', 'Leave'],
    why: 'Tabs are siblings, not a path, so nothing slides: the old one fades out, the new one fades in — and each keeps its place.',
    enter: { id: 'tabs.arrive', role: 'motion.view.arrive' },
    exit: { id: 'tabs.leave', role: 'motion.content.change', adjust: 'fade only, before the next arrives' },
    dev: { tracks: [
      { name: 'Leaving tab', owns: 'opacity 1 → 0', start: 0, dur: D('motion.content.change'), ref: 'motion.content.change' },
      { name: 'Arriving tab', owns: 'opacity 0 → 1, scale 0.92 → 1', start: D('motion.content.change'), dur: D('motion.view.arrive'), ref: 'motion.view.arrive' },
    ], interrupt: 'Another tab chosen mid-switch replaces the arriving one.', reduced: 'Switches at once.', accept: ['Each tab keeps its place — an open card is still open on return.', 'The tab bar stays; the selected tab is marked and announced.'] } },
  { id: 'press', group: 'Anywhere', family: 'input', name: 'Press', pattern: 'Scale down', trigger: 'Any tap', labels: ['Press'],
    why: 'The fastest role in the system: it answers the finger before anything else happens.',
    enter: { id: 'button.press', role: 'motion.feedback.press', adjust: 'returns to 1 on release' },
    dev: { tracks: [
      { name: 'Pressed element', owns: 'scale 1 → 0.98, back on release', start: 0, dur: D('motion.feedback.press'), ref: 'motion.feedback.press' },
    ], interrupt: 'Released early: it returns from its current scale.', reduced: 'No scale; the action still responds at once.', accept: ['Feedback starts on touch, before anything else.', 'The hit area does not change.'] } },
];
export const moment = (id: MomentId) => MOMENTS.find(m => m.id === id)!;
export const mappingOf = (id: MomentId, phase: Phase) => { const m = moment(id); return phase === 'exit' && m.exit ? m.exit : m.enter; };
/* every mapping that uses a role — the reach of one change */
export const usersOf = (roleId: string) => MOMENTS.flatMap(m => [m.enter, ...(m.exit ? [m.exit] : [])]).filter(x => x.role === roleId).map(x => x.id);

/* values, for the phone */
export const msOf = (x: Mapping | string) => prim(role(typeof x === 'string' ? x : x.role).duration).ms!;
export const pxOf = (id: string) => prim(id).px!;
export const scaleOf = (id: string) => prim(id).v!;

/* a curve or spring as a function, for drawing curves and driving swatches; a spring read over `span` seconds */
export function easeFn(id: string, span = .62): (t: number) => number {
  const P = prim(id);
  if (P.bezier) return P.bezier.join() === '0,0,1,1' ? t => t : cubicBezier(...P.bezier);
  const { k, c } = P.spring!; const w0 = Math.sqrt(k), z = c / (2 * w0), wd = w0 * Math.sqrt(1 - z * z);
  return t => { if (t >= 1) return 1; const s = t * span; return 1 - Math.exp(-z * w0 * s) * (Math.cos(wd * s) + (z * w0 / wd) * Math.sin(wd * s)); };
}

/* a mapping as a motion transition */
export function tr(x: Mapping, reduce = false) {
  if (reduce) return { duration: 0 };
  const R = role(x.role), E = prim(R.easing);
  if (E.spring) return { type: 'spring' as const, stiffness: E.spring.k, damping: E.spring.c };
  return { duration: prim(R.duration).ms! / 1000, ease: E.bezier! };
}
