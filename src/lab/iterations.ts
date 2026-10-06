/* The iteration registry. Each entry is a page under /lab; status drives the index. */
export type Status = 'exploring' | 'shortlisted' | 'parked' | 'adopted';

export type Iteration = {
  id: string;        // route segment under /lab
  name: string;
  status: Status;
  tries: string;     // one line on what it's testing
  refs: string[];    // references it draws from (see LOG.md)
};

export const ITERATIONS: Iteration[] = [
  {
    id: '01-sheet',
    name: '01 Sheet',
    status: 'exploring',
    tries: 'One-view app shell: a pale sheet on a grey field, persistent hero card on the left, views swapping on the right; left rail nav; notch-style assistant.',
    refs: ['ref-1 bento portfolio', 'ref-2 iOS notch recording'],
  },
];
