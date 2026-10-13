/* Nitish's Lotties, hosted on lottie.host (open CORS; the .lottie archives are unzipped in the browser by the shared player).
   One source for every iteration that shows them. */
export const LOTTIES = {
  /* B, Lenskart's AI assistant: all states back to back in one loop, a marker per state */
  b: 'https://lottie.host/9e427624-628c-46d0-a92d-fc7ca43e2836/VMVaaAYm3M.lottie',
  /* the rupee coin, made with his Vector 3D plugin: one 2.8 s turn, looping. Its card links to the plugin once he sends the link. */
  coin: 'https://lottie.host/baf8073b-3068-48ed-9e57-7a55cd7c97ed/KOTff0Mhna.lottie',
  /* Lenskart's loader: the infinity-glasses loader, 2.1 s loop. The file also carries the line "Hold on! We're looking out
     for you" as outlined shapes (two layers named TEXT Outlines) with an image shimmer across it; those three layers are
     dropped as it loads (dropLoaderText) and the canvas is cropped to the loader (LOADER_VIEWBOX: 66 × 28 of 297 × 66,
     measured across every frame, +3px all round). */
  loader: 'https://lottie.host/e331b8eb-11ac-466a-96da-98916b4052da/t7zZAGNw8i.lottie',
  /* micro-interactions: a bottom navigation bar's tabs (home, category, basket, wallet, more) in turn — 1920 × 300, a
     10.5 s loop from frame 90; it draws its own background, so its card rounds its corners (04, 13 Oct) */
  micro: 'https://lottie.host/8fac2084-725c-4d96-85eb-5ebeda917340/FEazPvZ1dz.lottie',
  /* the Gold membership reveal: a rounded card comes in and gold confetti bursts around it — 720 × 720, 7.2 s; the card
     itself sits at x 26–697, y 280–432 of the canvas (measured on a render), and its floating card is padded to that
     rectangle, the confetti free to fly past the glass (04, 13 Oct) */
  gold: 'https://lottie.host/7ed2ea72-f586-467f-945c-a41825140bf3/EFyepJCYvm.lottie',
  /* the persuasion animation (04, 13–14 Oct): 360 × 80, 8 s, text in a packaged font (Cal Sans), a glow of Gaussian-blurred
     shapes behind the pill (so it plays with `effects`); its card takes the whole canvas with the standard padding, no rounding */
  persuasion: 'https://lottie.host/971688e7-4357-4b5e-9391-0e67f4580d49/zTwfKgZDXS.lottie',
};
/* the Gold card's rectangle, as fractions of its canvas: left, top, width, height */
export const GOLD_RECT = { x: 26 / 720, y: 280 / 720, w: 672 / 720, h: 153 / 720 };
export const dropLoaderText = (l: { nm?: string; ty?: number }) => (l.nm ?? '').startsWith('TEXT') || l.ty === 2;
export const LOADER_VIEWBOX = '113 34 72 34';
/* the frames held under reduced motion: B mid-state, the coin face-on, the loader at its widest */
export const STILL = { b: 150, coin: 84, loader: 60, micro: 240, gold: 400, persuasion: 240 };
