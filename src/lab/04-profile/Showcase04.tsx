import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

/* the Lottie showcase (4 Nov, Nitish: the old site's home had containers of three and five Lotties each; "we need to
   create a place for them… on this new portfolio"): a second state of the intro picture. On the tag, the floating cards
   zoom past — each drifts a little its own way (the loader to the bottom right, the persuasion animation to the right,
   the success state up and a little left, the assistant to the bottom left), growing as it goes, and fades — so the
   picture seems to come forward; the picture itself steps back 5%, blurs and stops leaning with the pointer. Then the
   showcase's containers float in over it (profile.css, "the showcase").
   The first (his design): a landscape card, no wider than the phone screen plus a quarter, with the screen standing out
   of its top — the screen's lower fifth inside the card, fading out downward so the card's words have their room. The
   screen will carry the store app's home with three campaign banners (Republic Day, Valentine's, Mother's Day — the
   Lotties and the home page's picture are to come); for now three dashed slots mark their places. */
const EASE_IN = [.2, .8, .2, 1] as const;
export default function Showcase04({ open }: { open: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="sc4" aria-hidden={!open} inert={!open}>
      <div className="sc4-in">
        <AnimatePresence>
          {open && (
            <motion.div key="camp" className="sc4-card sc4-camp" initial={reduce ? false : { opacity: 0, y: 28, scale: .92 }} animate={{ opacity: 1, y: 0, scale: 1, transition: reduce ? { duration: 0 } : { duration: .62, delay: .3, ease: EASE_IN } }} exit={{ opacity: 0, y: 14, scale: .95, transition: { duration: reduce ? 0 : .26, ease: [.4, 0, 1, 1] } }}>
              <div className="sc4-screen" aria-hidden="true">
                <span className="sc4-slot">Campaign Lottie</span>
                <span className="sc4-slot">Campaign Lottie</span>
                <span className="sc4-slot">Campaign Lottie</span>
              </div>
              <div className="sc4-text">
                <b className="sc4-h">Campaign banners</b>
                <p className="sc4-p">Lotties for the top of the store app’s home — one for each occasion: Republic Day, Valentine’s Day, Mother’s Day.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
