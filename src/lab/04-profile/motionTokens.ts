import { cubicBezier } from 'motion/react';

/* The motion system's tokens (Nitish, 16 Oct): a general system for a digital product, in three levels as the mature
   systems have them (Material, Carbon, Atlassian, Fluent): primitives — raw values nothing uses directly; semantic tokens
   — `motion.[surface].[action]`, each naming the primitives it is made of; and the product's moments, which use only
   semantic tokens. The values are Claude's defaults, his to replace. */

export type Bezier = [number, number, number, number];
export type DurName = 'instant' | 'quick' | 'moderate' | 'slow' | 'deliberate';
export type EaseName = 'standard' | 'enter' | 'exit' | 'linear' | 'spring';
export type DistName = 'nudge' | 'small' | 'medium' | 'large';
export type StagName = 'tight' | 'loose';

export const DURATION: { name: DurName; ms: number; use: string }[] = [
  { name: 'instant', ms: 90, use: 'press, hover' },
  { name: 'quick', ms: 150, use: 'leaving, small changes' },
  { name: 'moderate', ms: 240, use: 'menus, toasts, going back' },
  { name: 'slow', ms: 360, use: 'sheets, pages, cards opening' },
  { name: 'deliberate', ms: 560, use: 'the moments that matter' },
];
export const EASING: { name: EaseName; value: string; bezier?: Bezier; spring?: { k: number; c: number }; use: string }[] = [
  { name: 'standard', value: '0.2, 0, 0, 1', bezier: [.2, 0, 0, 1], use: 'starts and ends on screen' },
  { name: 'enter', value: '0, 0, 0.2, 1', bezier: [0, 0, .2, 1], use: 'arriving — fast in, settling' },
  { name: 'exit', value: '0.4, 0, 1, 1', bezier: [.4, 0, 1, 1], use: 'leaving — gathering speed' },
  { name: 'linear', value: '0, 0, 1, 1', bezier: [0, 0, 1, 1], use: 'progress and loops' },
  { name: 'spring', value: '400 / 24', spring: { k: 400, c: 24 }, use: 'emphasis and gestures' },
];
export const DISTANCE: { name: DistName; px: number; use: string }[] = [
  { name: 'nudge', px: 4, use: 'feedback' },
  { name: 'small', px: 8, use: 'leaving in place' },
  { name: 'medium', px: 16, use: 'toasts, menus' },
  { name: 'large', px: 32, use: 'pages' },
];
export const STAGGER: { name: StagName; ms: number; use: string }[] = [
  { name: 'tight', ms: 30, use: 'lists' },
  { name: 'loose', ms: 70, use: 'grids, hero moments' },
];

export const ms = (d: DurName) => DURATION.find(x => x.name === d)!.ms;
export const px = (d: DistName) => DISTANCE.find(x => x.name === d)!.px;
export const ease = (e: EaseName) => EASING.find(x => x.name === e)!;

/* an easing as a function, for drawing curves and driving swatches; the spring read over `span` seconds */
export function easeFn(e: EaseName, span = .62): (t: number) => number {
  const E = ease(e);
  if (E.bezier) return E.bezier.join() === '0,0,1,1' ? t => t : cubicBezier(...E.bezier);
  const { k, c } = E.spring!; const w0 = Math.sqrt(k), z = c / (2 * w0), wd = w0 * Math.sqrt(1 - z * z);
  return t => { if (t >= 1) return 1; const s = t * span; return 1 - Math.exp(-z * w0 * s) * (Math.cos(wd * s) + (z * w0 / wd) * Math.sin(wd * s)); };
}

/* a semantic token: its name, and the primitives it is made of */
export type Use = { duration: DurName; easing: EaseName; distance?: DistName; note?: string };
export type Sem = { token: string; use: Use };
export type MomentId = 'card' | 'page' | 'tab' | 'sheet' | 'toast' | 'press';
export type Phase = 'enter' | 'exit';
export type Moment = { id: MomentId; group: string; name: string; pattern: string; trigger: string; why: string; enter: Sem; exit?: Sem; labels: [string, string?] };

export const MOMENTS: Moment[] = [
  { id: 'card', group: 'Navigation', name: 'Open a card', pattern: 'Container transform', trigger: 'Tap a card', labels: ['Open', 'Close'],
    why: 'The card becomes the page, so where you came from is never lost.',
    enter: { token: 'motion.card.open', use: { duration: 'slow', easing: 'standard' } },
    exit: { token: 'motion.card.close', use: { duration: 'moderate', easing: 'standard' } } },
  { id: 'page', group: 'Navigation', name: 'Go forward, go back', pattern: 'Shared axis — the page shift', trigger: 'Continue · back', labels: ['Forward', 'Back'],
    why: 'Forward comes in from the right and back from the left: the direction is the hierarchy.',
    enter: { token: 'motion.page.forward', use: { duration: 'slow', easing: 'standard', distance: 'large' } },
    exit: { token: 'motion.page.back', use: { duration: 'moderate', easing: 'standard', distance: 'large' } } },
  { id: 'tab', group: 'Navigation', name: 'Switch tabs', pattern: 'Fade through', trigger: 'Tap a tab', labels: ['New tab in', 'Old tab out'],
    why: 'Tabs are siblings, not a path, so nothing slides: the old one fades out, the new one fades in.',
    enter: { token: 'motion.tab.in', use: { duration: 'moderate', easing: 'standard', note: 'scale from 92%' } },
    exit: { token: 'motion.tab.out', use: { duration: 'quick', easing: 'exit' } } },
  { id: 'sheet', group: 'Surfaces', name: 'Bottom sheet', pattern: 'Slide from its edge', trigger: 'Options', labels: ['Enter', 'Exit'],
    why: 'It arrives slower and settles; it leaves faster, getting out of the way.',
    enter: { token: 'motion.sheet.enter', use: { duration: 'slow', easing: 'enter', note: 'its full height' } },
    exit: { token: 'motion.sheet.exit', use: { duration: 'moderate', easing: 'exit', note: 'its full height' } } },
  { id: 'toast', group: 'Surfaces', name: 'Toast', pattern: 'Rise and fade', trigger: 'Add to bag', labels: ['Enter', 'Exit'],
    why: 'A short distance in a short time: it tells you, then steps aside.',
    enter: { token: 'motion.toast.enter', use: { duration: 'moderate', easing: 'enter', distance: 'medium' } },
    exit: { token: 'motion.toast.exit', use: { duration: 'quick', easing: 'exit', distance: 'small' } } },
  { id: 'press', group: 'Feedback', name: 'Press', pattern: 'Scale down', trigger: 'Any tap', labels: ['Press'],
    why: 'The fastest token in the system: it answers the finger before anything else happens.',
    enter: { token: 'motion.press', use: { duration: 'instant', easing: 'standard', note: 'scale to 96%' } } },
];
export const moment = (id: MomentId) => MOMENTS.find(m => m.id === id)!;

/* a semantic token as a motion transition */
export function tr(s: Sem, reduce = false) {
  if (reduce) return { duration: 0 };
  const E = ease(s.use.easing);
  if (E.spring) return { type: 'spring' as const, stiffness: E.spring.k, damping: E.spring.c };
  return { duration: ms(s.use.duration) / 1000, ease: E.bezier! };
}
