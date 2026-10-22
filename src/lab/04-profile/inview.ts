import { useEffect, useState } from 'react';

/* whether an element is on screen (the study scrolls in its own column; the observer's viewport root still accounts for
   that clipping) — clips and Lotties play only while they are */
export function useInView(ref: React.RefObject<HTMLElement | null>, threshold = .05) {
  const [on, setOn] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold }); io.observe(el); return () => io.disconnect(); }, [ref, threshold]);
  return on;
}
