import type { Variants } from 'motion/react';

/* View transitions: the outgoing view's items swipe out with a stagger, the incoming
   view's items swipe in from the other side.
   Enter direction is chosen by variant label (initF / initB) at render time;
   exit direction comes from AnimatePresence's `custom` (+1 forward, -1 back),
   which Motion hands to exiting elements after the fact. */
export const container: Variants = {
  initF: {}, initB: {},
  enter: { transition: { staggerChildren: .026, delayChildren: .02 } },
  exit: { transition: { staggerChildren: .018 } },
};

export const item: Variants = {
  initF: { x: 44, opacity: 0 },
  initB: { x: -44, opacity: 0 },
  enter: { x: 0, opacity: 1, transition: { duration: .38, ease: [.2, .8, .2, 1] } },
  exit: (dir: number = 1) => ({ x: -dir * 44, opacity: 0, transition: { duration: .23, ease: [.4, 0, .2, 1] } }),
};
