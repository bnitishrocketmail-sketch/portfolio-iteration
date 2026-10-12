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
};
export const dropLoaderText = (l: { nm?: string; ty?: number }) => (l.nm ?? '').startsWith('TEXT') || l.ty === 2;
export const LOADER_VIEWBOX = '113 34 72 34';
/* the frames held under reduced motion: B mid-state, the coin face-on, the loader at its widest */
export const STILL = { b: 150, coin: 84, loader: 60 };
