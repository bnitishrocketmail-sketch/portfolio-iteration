import { useRef, useState, type MouseEvent } from 'react';

/* a control kept out of sight until it's asked for (28 Oct, Nitish, on Workflow: "the controls tab and the tune orb… on
   the same place where they are, but… hidden… only… appeared… once I tap 5 times or click 5 times… on the same area"):
   the button stays where it is, invisible, and swallows taps; five in a row (each within 700 ms of the last) bring it
   up, and from then it works. Once up it stays up until the page is loaded again. */
const shown = new Set<string>();
const GAP = 700, TAPS = 5;

export function useFiveTaps(key: string, on: boolean) {
  const [, bump] = useState(0);
  const taps = useRef({ n: 0, at: 0 });
  const hidden = on && !shown.has(key);
  const capture = (e: MouseEvent) => {
    if (!hidden) return;
    e.preventDefault(); e.stopPropagation();
    const now = performance.now(), t = taps.current;
    t.n = now - t.at < GAP ? t.n + 1 : 1; t.at = now;
    if (t.n >= TAPS) { shown.add(key); t.n = 0; bump(x => x + 1); }
  };
  return { hidden, capture };
}
