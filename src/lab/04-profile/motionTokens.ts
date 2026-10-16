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
export type MomentId = 'card' | 'page' | 'tab' | 'sheet' | 'toast' | 'press';
export type Phase = 'enter' | 'exit';
export type Moment = { id: MomentId; group: string; name: string; pattern: string; trigger: string; why: string; enter: Mapping; exit?: Mapping; labels: [string, string?] };

export const MOMENTS: Moment[] = [
  { id: 'card', group: 'The flow', name: 'Open a card', pattern: 'Container transform', trigger: 'Tap a card', labels: ['Open', 'Close'],
    why: 'The card becomes the page, so where you came from is never lost.',
    enter: { id: 'card.open', role: 'motion.container.expand', adjust: 'from the card’s own box' },
    exit: { id: 'card.close', role: 'motion.container.collapse', adjust: 'back to the card’s box' } },
  { id: 'sheet', group: 'The flow', name: 'Bottom sheet', pattern: 'Slide from its edge', trigger: 'Options', labels: ['Open', 'Close'],
    why: 'It arrives and settles; it leaves faster, getting out of the way.',
    enter: { id: 'sheet.open', role: 'motion.surface.enter', adjust: 'travels its full height, from the bottom edge' },
    exit: { id: 'sheet.close', role: 'motion.surface.exit', adjust: 'travels its full height, to the bottom edge' } },
  { id: 'toast', group: 'The flow', name: 'Toast', pattern: 'Rise and fade', trigger: 'Add to bag', labels: ['Show', 'Hide'],
    why: 'The same roles as the sheet, unadjusted: a short rise in, a shorter fall out.',
    enter: { id: 'toast.show', role: 'motion.surface.enter' },
    exit: { id: 'toast.hide', role: 'motion.surface.exit' } },
  { id: 'page', group: 'The flow', name: 'Go forward, go back', pattern: 'Shared axis — the page shift', trigger: 'Continue · back', labels: ['Forward', 'Back'],
    why: 'Forward comes in from the right and back from the left: the direction is the hierarchy.',
    enter: { id: 'page.forward', role: 'motion.navigation.forward' },
    exit: { id: 'page.back', role: 'motion.navigation.back' } },
  { id: 'tab', group: 'Anywhere', name: 'Switch tabs', pattern: 'Fade through', trigger: 'Tap a tab', labels: ['Arrive', 'Leave'],
    why: 'Tabs are siblings, not a path, so nothing slides: the old one fades out, the new one fades in — and each keeps its place.',
    enter: { id: 'tabs.arrive', role: 'motion.view.arrive' },
    exit: { id: 'tabs.leave', role: 'motion.content.change', adjust: 'fade only, before the next arrives' } },
  { id: 'press', group: 'Anywhere', name: 'Press', pattern: 'Scale down', trigger: 'Any tap', labels: ['Press'],
    why: 'The fastest role in the system: it answers the finger before anything else happens.',
    enter: { id: 'button.press', role: 'motion.feedback.press', adjust: 'returns to 1 on release' } },
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
