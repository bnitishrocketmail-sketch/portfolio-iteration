import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import type { DotLottie } from '@lottiefiles/dotlottie-web';

/* A Lottie drawn by LottieFiles' own player (dotlottie-web: ThorVG, compiled to wasm, drawing on a canvas) — for a file made
   in LottieFiles Creator that lottie-web cannot draw. The fintech hero's loan card (Nitish's "100% Paperless" story, 25 Oct)
   is one: lottie-web draws it blank, while this player draws every frame, as his Framer page did.
   - The player and its wasm (~0.5 MB gzipped, served from this site) load as their own chunk. With a `poster` (a picture of
     the `still` frame) nothing loads until the Lottie first plays: the home stack's small card shows the picture and loads
     the player on hover; the hero, when it comes into view. Under reduced motion it stays the picture.
   - The player sizes its canvas from getBoundingClientRect, which inside a transformed parent (the hero's screens are carried
     onto the glass by a matrix3d) is the projected box, not the canvas's own: the drawing comes out squashed. That is what
     his Framer page showed (a canvas of 238 × 287 drawn into 228 × 201). So the canvas reports its own layout box instead.
   - The canvas is drawn at its layout size (devicePixelRatio 1): the hero shows it scaled down, so that is already finer
     than the screen needs, and it keeps the software renderer's work small.
   - `playing` false holds it on frame `still`; it does not pause itself off screen (the caller's `playing` follows the view). */
let ready: Promise<typeof DotLottie> | null = null;
const player = () => (ready ??= Promise.all([
  import('@lottiefiles/dotlottie-web'),
  import('@lottiefiles/dotlottie-web/dotlottie-player.wasm?url'),
]).then(([m, w]) => { m.DotLottie.setWasmUrl(w.default); return m.DotLottie; }));

const fill = { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' } as const;

export function LottieCanvas({ src, poster, className, loop = true, still = 0, label, playing = true }: {
  src: string; poster?: string; className?: string; loop?: boolean; still?: number; label?: string; playing?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<DotLottie | null>(null);
  const reduce = useReducedMotion();
  const play = playing && !reduce;
  const playRef = useRef(play); playRef.current = play;
  const stillRef = useRef(still); stillRef.current = still;
  const [want, setWant] = useState(!poster || play); /* load the player: at once without a poster, else on first play */
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { if (play) setWant(true); }, [play]);
  useEffect(() => {
    const a = animRef.current; if (!a || !a.isLoaded) return;
    if (play) a.play(); else { a.pause(); a.setFrame(still); }
  }, [play, still]);
  useEffect(() => {
    const c = ref.current; if (!c || !want) return;
    c.getBoundingClientRect = () => new DOMRect(0, 0, c.offsetWidth, c.offsetHeight);
    let gone = false, anim: DotLottie | undefined;
    player().then(DotLottie => {
      if (gone) return;
      const a = new DotLottie({ canvas: c, src, loop, autoplay: false, renderConfig: { devicePixelRatio: 1, autoResize: true, freezeOnOffscreen: false } });
      a.addEventListener('load', () => { if (gone) return; if (playRef.current) a.play(); else a.setFrame(stillRef.current); setDrawn(true); });
      anim = a; animRef.current = a;
    }).catch(err => console.warn(err));
    return () => { gone = true; animRef.current = null; anim?.destroy(); };
  }, [src, loop, want]);
  return (
    <div className={className} style={{ position: 'relative' }} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <canvas ref={ref} style={fill} />
      {poster && !drawn && <img src={poster} alt="" draggable={false} style={fill} />}
    </div>
  );
}
