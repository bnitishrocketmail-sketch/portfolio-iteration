import { useEffect, useRef } from 'react';
import type { AnimationItem } from 'lottie-web';

/* His written title, the Lottie from his old site's contact card (22 Oct): a word wipes to the next under a travelling
   line, over the script "Designer". Since 28 Nov the words are three — Product, Interaction, Motion (Nitish: "the third
   word that you're adding is interaction. That will come after product and before motion") — in public/title.json,
   built from his file (public/signature.json, kept) by the session's gen.py: his letters, line, flag and Designer as
   they were, "Interaction" set in the same face (Inter SemiBold: his outlines match it to 0.01), size and tracking,
   his easing on every key, 90 frames a wipe and 120 held, six wipes to the loop (the line turns round each time).
   The word's first letter sits on the name's left edge above it. That used to be done here — the two words began at
   different places in the file (33.5 and 64 of 593) and this component slid the drawing as the wipe ran. The new file
   holds it itself: every word's first letter is at X0 and Designer moves to make room, so the box is only set back by
   X0 once. Under reduced motion it holds the first frame, PRODUCT. */
const SRC = '/title.json';
const SIG_W = 665; /* the file's width, of 141 high (it was 593: Interaction and Designer need the room) — the CSS boxes carry the same ratio */
const X0 = 33.5; /* where every word's first letter stands in the file */

export default function Signature04({ className, label }: { className?: string; label: string }) {
  const box = useRef<HTMLDivElement>(null), stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const b = box.current, el = stage.current; if (!b || !el) return;
    let anim: AnimationItem | undefined, dead = false;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const place = () => { b.style.transform = `translateX(${(-X0 * b.clientWidth / SIG_W).toFixed(2)}px)`; };
    (async () => {
      const [lottie, res] = await Promise.all([import('lottie-web/build/player/lottie_light').then(m => m.default), fetch(SRC)]);
      if (dead || !res.ok) return;
      lottie.setIDPrefix('ll');
      anim = lottie.loadAnimation({ container: el, renderer: 'svg', loop: true, autoplay: !still, animationData: await res.json() });
      anim.addEventListener('DOMLoaded', () => { if (still) anim?.goToAndStop(0, true); place(); });
    })();
    place(); const ro = new ResizeObserver(place); ro.observe(b); /* the set-back follows the box's width */
    return () => { dead = true; ro.disconnect(); anim?.destroy(); };
  }, []);
  return <div ref={box} className={className} role="img" aria-label={label}><div ref={stage} className="sig-in" /></div>;
}
