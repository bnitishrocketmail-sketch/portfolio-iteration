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
    status: 'parked',
    tries: 'One-view app shell: a pale sheet on a grey field, persistent hero card on the left, views swapping on the right; rotated side nav; notch-style assistant.',
    refs: ['ref-1 bento portfolio', 'ref-2 iOS notch recording'],
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
    tries: "02's grid with 01's palette in light mode (dark mode is 02's own); the hero as ref 3 does it, measured off the hi-res shot: a lighter disc, one thin broken stroke crossing into the gaps, the figure hanging a little below the tile.",
    refs: ['02 Field', '01 Sheet palette (tokens.css)'],
  },
];
