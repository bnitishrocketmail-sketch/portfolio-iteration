/* 04's design tokens under control (Nitish, 13–14 Oct): every value here is a custom property the screen reads. Two value
   sets — dark (`def`) and light (`light`; the dark one when none is given) — each kept apart in the browser as well, so
   edits on the design-system page carry to the profile and back. Grouped as the system page lays them out. */
export type Control = { key: string; label: string; def: string; light?: string; group: string; sub: string } &
  ({ kind: 'color' } | { kind: 'range'; min: number; max: number; step: number; unit?: string } | { kind: 'select'; options: [string, string][] });

/* the faces on offer: the ones already in use, a few display faces, and the sans-serifs product UI leans on now (all
   variable-weight from Google Fonts, fetched only when picked) */
export const FONTS: [string, string][] = ['Josefin Sans', 'Outfit', 'Inter', 'Geist', 'Manrope', 'DM Sans', 'Plus Jakarta Sans', 'Figtree', 'Onest', 'Albert Sans', 'Urbanist', 'Sora', 'Space Grotesk', 'Bricolage Grotesque', 'Syne', 'Unbounded', 'Instrument Sans', 'Krona One', 'Poiret One', 'Limelight', 'Marcellus', 'Marcellus SC', 'Bodoni Moda'].map(f => [f, `'${f}'`]);

const w = (key: string, label: string, def: string, light = def, sub = 'Weights'): Control => ({ group: 'Type', sub, kind: 'range', key, label, def, light, min: 100, max: 900, step: 100 });
const size = (key: string, label: string, def: string): Control => ({ group: 'Type', sub: 'Sizes (of the frame’s width, %)', kind: 'range', key, label, def, light: def, min: .6, max: 4, step: .05 });
const col = (sub: string, key: string, label: string, def: string, light = def): Control => ({ group: 'Colours', sub, kind: 'color', key, label, def, light });
const layer: [string, string][] = [['In front of me', '3'], ['Behind me', '1']];
const shown: [string, string][] = [['Shown', 'block'], ['Hidden', 'none']];
const card = (id: string, name: string, x: string, y: string, z: string, v: string): Control[] => [
  { group: 'Intro cards', sub: name, kind: 'range', key: `--c-${id}-x`, label: 'x', def: x, light: x, min: -20, max: 90, step: 1, unit: '%' },
  { group: 'Intro cards', sub: name, kind: 'range', key: `--c-${id}-y`, label: 'y', def: y, light: y, min: -20, max: 90, step: 1, unit: '%' },
  { group: 'Intro cards', sub: name, kind: 'select', key: `--c-${id}-z`, label: 'Layer', def: z, light: z, options: layer },
  { group: 'Intro cards', sub: name, kind: 'select', key: `--c-${id}-v`, label: 'Shown', def: v, light: v, options: shown },
];

export const CONTROLS: Control[] = [
  /* type */
  { group: 'Type', sub: 'Faces', kind: 'select', key: '--name-font', label: 'Headings (the name’s face)', def: "'Outfit'", light: "'Outfit'", options: FONTS },
  { group: 'Type', sub: 'Faces', kind: 'select', key: '--copy-font', label: 'Copy', def: "'Outfit'", light: "'Outfit'", options: FONTS },
  w('--name-w1', 'H1 (the first name)', '800'), w('--name-w2', 'The surname, the H1 light', '300'), w('--h2-w', 'H2', '500'),
  w('--copy-w', 'Body', '300'), w('--title-w', 'Title (and the title line’s rolling word)', '500'), w('--role-w2', 'The title line’s fixed word', '800'),
  size('--s-h1', 'H1 — the name (H2 is three-quarters of it)', '2.8'), size('--s-body', 'Body', '.94'), /* Title (13px) and Meta (11px) are fixed (21 Oct), so they have no slider; Body sits a step under Title at 1440 */
  /* colours: surfaces */
  col('Surfaces', '--bg', 'Page background', '#141416', '#d4d4d7'),
  col('Surfaces', '--frame', 'Main container', '#121212', '#b5b5b5'),
  col('Surfaces', '--nav-bg', 'Nav bar', '#e0e0e0'),
  col('Surfaces', '--glass-bg', 'Glass', '#000000'),
  { group: 'Colours', sub: 'Surfaces', kind: 'range', key: '--glass-a', label: 'Glass opacity', def: '0.2', light: '0.2', min: 0, max: 1, step: .05 },
  col('Surfaces', '--pcard-open', 'Project card, open', '#e0e0e0'),
  col('Surfaces', '--pcard-fold', 'Project card, folded', '#2f2e30'),
  /* colours: text */
  col('Text', '--name-ink', 'Name', '#dfdfdf', '#2f2e30'),
  col('Text', '--title-ink', 'Title word', '#e0e0e0', '#2f2e30'),
  col('Text', '--role-ink2', '“designer”', '#59575b', '#2f2e30'),
  col('Text', '--line-ink', 'Line about me', '#e0e0e0', '#2f2e30'),
  col('Text', '--glass-ink', 'Glass text', '#c9c9cc'),
  col('Text', '--ink', 'Headings and other text', '#f5f5f5', '#dbdbdb'),
  col('Text', '--muted', 'Secondary text', '#d1d1d6', '#e0e0e0'),
  col('Text', '--nav-ink', 'Nav names', '#2f2e30'),
  col('Text', '--nav-hl-ink', 'Nav name, highlighted', '#c9c9c9'),
  col('Text', '--pcard-open-ink', 'Project card, open', '#121212'),
  col('Text', '--pcard-fold-ink', 'Project card, folded', '#e0e0e0'),
  /* colours: controls and marks */
  col('Controls and marks', '--nav-hl', 'Nav highlight', '#2f2e30'),
  col('Controls and marks', '--ai-bg', 'Assistant button', '#2f2e30'),
  col('Controls and marks', '--ai-ink', 'Assistant icon', '#c9c9c9'),
  col('Controls and marks', '--cv-bg', 'View CV button', '#d6d6d6', '#2f2e30'),
  col('Controls and marks', '--cv-ink', 'View CV text and arrow', '#2b2b2e', '#b5b5b5'),
  col('Controls and marks', '--social-ink', 'Social icons', '#a6a6a6', '#2f2e30'),
  col('Controls and marks', '--corner-ink', 'Corner bracket', '#bababa', '#2f2e30'),
  /* the intro's floating cards */
  ...card('ai', 'Assistant', '11%', '38%', '3', 'block'), ...card('coin', 'Coin', '59%', '10%', '1', 'block'), ...card('micro', 'Micro', '3%', '51%', '3', 'none'),
  ...card('gold', 'Success', '18%', '12%', '3', 'block'), ...card('pers', 'Persuasion', '68%', '40%', '3', 'block'), ...card('loader', 'Loader', '60%', '59%', '1', 'block'),
  /* the name box — the one-liner on the picture (Nitish, 21 Oct: "a control to hide that tile") */
  { group: 'Intro cards', sub: 'Name box (the one-liner)', kind: 'select', key: '--name-box-v', label: 'Shown', def: 'flex', light: 'flex', options: [['Shown', 'flex'], ['Hidden', 'none']] },
  /* the intro's picture (Nitish, 22 Oct): the drawing as it is, the drawing in black and white, or his photo — the cutout
     and the cards in front and behind the same in each */
  { group: 'Intro picture', sub: 'Picture', kind: 'select', key: '--pic-v', label: 'Version', def: 'illo', light: 'illo', options: [['The drawing', 'illo'], ['The drawing, black and white', 'illo-bw'], ['The photo', 'photo']] },
  /* the picture as a spatial scene (23 Oct): the depth-map warp, or still; the layered version is to come */
  { group: 'Intro picture', sub: 'Picture', kind: 'select', key: '--pic-depth', label: 'Depth', def: 'warp', light: 'warp', options: [['Depth-map warp', 'warp'], ['Still', 'off']] },
  /* the first tab of the nav: his photo, or his signature from the Framer site (22 Oct) */
  { group: 'Nav bar', sub: 'Home tab', kind: 'select', key: '--home-tab', label: 'Version', def: 'photo', light: 'photo', options: [['The photo', 'photo'], ['The signature', 'sig']] },
  /* corners: plain round, or iOS's continuous curve (22 Oct) */
  { group: 'Main container', sub: 'Corners', kind: 'select', key: '--corners', label: 'Curve', def: 'ios', light: 'ios', options: [['iOS (continuous)', 'ios'], ['Round', 'round']] },
  /* the selection: the dark pill, or a ball in the bar's colour in a cavity (23 Oct) */
  { group: 'Nav bar', sub: 'Selection', kind: 'select', key: '--nav-sel', label: 'Version', def: 'pill', light: 'pill', options: [['The pill', 'pill'], ['Cavity ball', 'cavity']] },
  /* the main container solid, as it was, or glass: the picture behind showing through it, blurred (22 Oct) */
  { group: 'Main container', sub: 'Background', kind: 'select', key: '--frame-v', label: 'Version', def: 'solid', light: 'solid', options: [['Solid', 'solid'], ['Glass', 'glass']] },
];

export const tweakKey = (dark: boolean) => `it04-colours-${dark ? 'dark' : 'light'}`;
export function readTweaks(dark: boolean): Record<string, string> { try { return JSON.parse(localStorage.getItem(tweakKey(dark)) || '{}'); } catch { return {}; } }
export function writeTweaks(dark: boolean, v: Record<string, string>) { try { if (Object.keys(v).length) localStorage.setItem(tweakKey(dark), JSON.stringify(v)); else localStorage.removeItem(tweakKey(dark)); } catch { /* fine */ } }
export const defOf = (c: Control, dark: boolean) => (dark ? c.def : (c.light ?? c.def));
