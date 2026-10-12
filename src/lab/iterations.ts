/* The iteration registry. Each entry is a page under /lab; status drives the index. */
export type Status = 'exploring' | 'shortlisted' | 'parked' | 'adopted';

export type Iteration = {
  id: string;        // route segment under /lab
  name: string;
  status: Status;
  tries: string;     // one line on what it's testing
  refs: string[];    // references it draws from (see LOG.md)
  parent?: string;   // set on a sub-iteration: the id of the iteration it varies
};

export const ITERATIONS: Iteration[] = [
  {
    id: '01-sheet',
    name: '01 Sheet',
    status: 'exploring',
    tries: 'One-view app shell: a pale sheet on a grey field, persistent hero card on the left, views swapping on the right; rotated side nav; notch-style assistant.',
    refs: ['ref-1 bento portfolio', 'ref-2 iOS notch recording'],
  },
  {
    id: '01b-sheet',
    name: '01b Sheet · v2 intro card',
    status: 'exploring',
    parent: '01-sheet',
    tries: "01's shell with the intro card rebuilt on his desk photo: the cutout free above the circle, the photo itself inside it, the same photo blurred as the card's ground, the text on glass, the composition 1.5× larger.",
    refs: ['01 Sheet', '02b hero geometry', 'photo-4 desk (b&w)'],
  },
  {
    id: '02-field',
    name: '02 Field',
    status: 'exploring',
    tries: 'Dense bento on a black field, no sheet and no nav: the person cut out in the centre with live assets floating around; every section is a tile; a ticker of Lotties in the long tile. Ocean green + sky blue.',
    refs: ['ref-3 field bento (pink agency shot)', 'ref-2 iOS notch recording'],
  },
  {
    id: '02b-field',
    name: '02b Field · 01 palette',
    status: 'exploring',
    parent: '02-field',
    tries: "02's grid in 01's palette; the hero as ref 3 does it, measured off the hi-res shot: a lighter disc, one thin broken stroke crossing into the gaps, the figure hanging a little below the tile.",
    refs: ['02 Field', '01 Sheet palette (tokens.css)'],
  },
  {
    id: '03-console',
    name: '03 Console',
    status: 'exploring',
    tries: "The portfolio as a product dashboard: a fixed app frame (sidebar, top bar with a command bar, widgets per section) on the web; the same content as an app (large titles, a scrolling column, a tab bar) on phones. Monochrome first; transitions built to lower cognitive load.",
    refs: ['Nitish\'s brief, 12 Oct (dashboard on web, app on mobile; Claude\'s layout decisions)'],
  },
];
