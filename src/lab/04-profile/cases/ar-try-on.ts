import type { Case, Media } from './types';

/* Revolutionising AR try-on — Lenskart (Nitish, 26 Oct): from a page of an earlier portfolio of his
   (right-teams-858997.framer.app/works-2/weathy-weather-app), its words lightly edited, re-laid for reading: the context,
   the four gaps research found (each marked with the part of the study that answers it; the other two come later), then
   each answer — what it does and its result beside its recording, the flow step by step in stills from the recording,
   and for frame removal its two state Lotties. The recordings are his: both are full-screen phone recordings exported
   squashed (720 × 1080 and 888 × 1080; a round button measured 1.46 : 1), so they are re-encoded at the phone's 9 : 19.5
   (432 × 936, 30 fps, no sound) and the stills are taken from them. The Lotties are his page's own, on its black.
   The hero and the Projects card's visual are to come (Nitish: placeholders for now). */
const A = '/cases/ar-try-on';
const still = (name: string, label: string, cap: string): Media => ({ k: 'media', shape: 'phone', label, cap, src: `${A}/${name}.webp` });
const clip = (name: string, label: string, cap: string): Media => ({ k: 'media', shape: 'phone', label, cap, src: `${A}/${name}.mp4`, poster: `${A}/${name}-poster.webp` });
/* the words beside a recording (26 Oct, Nitish: "the body content… misaligned oddly in the center vertically, and then one
   line goes all the way to the right… the phone… too much on the corner"): the words from the top, in a column of a
   readable measure (~450 px, ~70 characters); the phone in the middle of the rest, with air either side */
const SIDE = 'minmax(0, 1.25fr) minmax(var(--ph-w), 1fr)';
const state = (name: string, label: string): Media => ({ k: 'media', shape: 'image', ratio: '2 / 1', label, lottie: `${A}/${name}.json`, bg: '#000' });

/* the contact-lens recording's slider handle: its x (a fraction of the screen) over the clip's seconds, measured by matching the
   handle in every third frame of his recording and thinned to the points that change its path (within 0.6% of the width) */
const LENS_HANDLE: [number, number][] = [[0.01, 0.126], [0.91, 0.125], [0.96, 0.127], [1.01, 0.149], [1.06, 0.206], [1.11, 0.293], [1.27, 0.66], [1.32, 0.757], [1.37, 0.828], [1.42, 0.863], [1.47, 0.87], [5.05, 0.87], [5.1, 0.863], [5.4, 0.674], [5.5, 0.629], [5.76, 0.483], [5.96, 0.387], [6.16, 0.317], [6.41, 0.264], [6.51, 0.252], [6.92, 0.254], [7.17, 0.311], [7.42, 0.427], [7.67, 0.528], [7.77, 0.582], [8.03, 0.739], [8.08, 0.762], [8.33, 0.826], [17.71, 0.827], [17.91, 0.71], [18.12, 0.58], [18.37, 0.469], [18.57, 0.361], [18.67, 0.317], [18.82, 0.291], [19.28, 0.249], [19.73, 0.24], [19.93, 0.334], [20.14, 0.467], [20.34, 0.615], [20.44, 0.733], [20.49, 0.783], [20.54, 0.815], [20.64, 0.856], [20.79, 0.875], [35.93, 0.875], [35.98, 0.872], [36.13, 0.652], [36.18, 0.594], [36.28, 0.498], [36.53, 0.213], [36.58, 0.184], [36.63, 0.171], [36.78, 0.16], [37.19, 0.16], [37.24, 0.179], [37.44, 0.323], [37.49, 0.37], [37.69, 0.589], [37.74, 0.638], [37.79, 0.672], [37.94, 0.734], [38.2, 0.791], [43.44, 0.794]];

export const arTryOn: Case = {
  id: 'ar-try-on',
  title: 'Revolutionising AR try-on',
  sub: 'Frame removal and a contact-lens try-on: an AR try-on that works for people already wearing glasses, and lets lens colours be compared on your own eye.',
  chips: ['App feature', 'AR', 'UX/UI', 'Interaction/Motion'],
  facts: [
    { k: 'Role', v: 'Product designer — motion' },
    { k: 'Project type', v: 'Feature design' },
    { k: 'Team', v: 'Product design' },
    { k: 'Focus', v: 'UI/UX design collaboration, interaction & motion design ownership' },
  ],
  hero: { k: 'media', shape: 'wide', ratio: '2.2 / 1', label: 'Hero — to come' },
  sections: [
    { id: 'about', title: 'About', blocks: [
      { k: 'p', t: ['Shopping for eyewear isn’t just about function — it’s about ', { b: 'style, personality and occasion' }, '. Customers in a Lenskart store browse by how glasses fit their ', { b: 'lifestyle' }, ', not just by brand or frame type. In the app, that context was ', { b: 'missing from the digital experience' }, '.'] },
      { k: 'p', t: ['This study covers two of the improvements made to the app’s AR try-on: ', { b: 'removing the glasses you are already wearing' }, ' before you try on a new pair, and ', { b: 'trying on colour contact lenses' }, ' with a slider.'] },
    ] },
    { id: 'gaps', title: 'Where AR try-on fell short', blocks: [
      { k: 'p', t: ['In ', { b: 'primary research' }, ' — ', { b: 'user-testing sessions' }, ', and conversations with customers on ', { b: 'store visits' }, ' — we found four gaps in the AR try-on:'] },
      { k: 'gaps', of: [
        { h: 'Overlapping frames', p: ['Users wearing glasses couldn’t get an accurate preview: the frame they tried sat on top of their own.'], to: 'Answered by frame removal' },
        { h: 'No interactive contact-lens try-on', p: ['No seamless way to compare lens colours.'], to: 'Answered by the contact-lens try-on' },
        { h: 'No quick access to AR try-on', p: ['Users had to go deep into a product page to try frames.'] },
        { h: 'Limited personalisation', p: ['No way to shop by style, occasion or personality.'] },
      ] },
      { k: 'p', t: ['These gaps led to ', { b: 'hesitation in purchases' }, ' and ', { b: 'reduced engagement' }, ' with AR try-on.'] },
    ] },
    { id: 'frame-removal', title: 'Frame removal for a more accurate try-on', blocks: [
      { k: 'row', ratio: SIDE, of: [
        { k: 'group', of: [
          { k: 'p', t: ['For people who already wear glasses, the try-on first takes their own pair away:'] },
          { k: 'ul', items: [
            [{ b: 'Detects and removes' }, ' the user’s existing glasses in real time.'],
            ['Uses ', { b: 'inpainting' }, ' to restore skin and eyebrows naturally.'],
            ['Prevents ', { b: 'reflections and double frames' }, ', for a realistic AR try-on.'],
          ] },
          { k: 'stats', title: 'Result', tone: 'dark', items: [{ n: '32%', l: 'increase in users completing a virtual try-on session' }] },
        ] },
        { k: 'figure', of: clip('frame-removal', 'Frame removal, recorded', 'The flow, end to end'), width: 'phone' },
      ] },
      { k: 'h', t: 'Step by step' },
      { k: 'phones', of: [
        still('fr-1', 'Two frames', '1 · Two frames at once'),
        still('fr-2', 'Align', '2 · Align: red turns green'),
        still('fr-3', 'Removing', '3 · Particles trace the frame'),
        still('fr-4', 'A new frame', '4 · A new frame, on a clean face'),
      ] },
      { k: 'h', t: 'Motion: from loading to success' },
      { k: 'successes', of: [
        { m: state('fr-loading', 'Loading state'), top: true, chip: 'Loading state', h: 'Particles gather on the frame', ul: [
          ['As the system ', { b: 'detects the existing glasses' }, ', small particles ', { b: 'gather around the frame’s outline' }, ', forming a subtle ', { b: 'white tracing effect' }, '.'],
          ['It builds ', { b: 'anticipation' }, ' and tells the user the removal is in progress.'],
          ['The particles ', { b: 'move dynamically' }, ', like an energy build-up: something is about to happen.'],
          ['A ', { b: 'soft pulse' }, ' gives the frame a sense of depth and interactivity.'],
        ] },
        { m: state('fr-success', 'Success state'), top: true, chip: 'Success state', h: 'Particles scatter, the glasses fade out', ul: [
          ['Once the removal is triggered, the particles ', { b: 'burst outward' }, ' in a quick, smooth burst: the old frame disappearing.'],
          ['At the same time the glasses ', { b: 'fade out in a gentle dissolve' }, ', not an instant cut, so the change stays smooth.'],
        ] },
      ] },
      { k: 'p', t: ['Both were built as ', { b: 'custom Lotties' }, '. With motion, frame removal turned from a ', { b: 'technical feature' }, ' into an ', { b: 'engaging, visually intuitive interaction' }, ', making virtual try-ons ', { b: 'more immersive and natural' }, ' for users.'] },
    ] },
    { id: 'contact-lens', title: 'Contact-lens try-on with a slider', blocks: [
      { k: 'p', t: ['Users ', { b: 'drag a slider across the screen' }, ' to compare one eye ', { b: 'with the lens and one without' }, ': a before and after, in real time. Around the slider, small animations draw the eye to the colour, teach the gesture and celebrate the look. Each one lights up as the recording reaches it; tap one to see it again.'] },
      { k: 'tour', src: `${A}/lens-tour.mp4`, poster: `${A}/lens-tour-poster.webp`, label: 'The contact-lens try-on, recorded: the slider, the nudges, zoom, the praise and the colours', track: LENS_HANDLE, ty: .602, of: [
        { chip: 'Nudge', h: 'The reveal', side: 'r', p: ['As the try-on opens, the line sweeps across the face and sparkles play over the side wearing the lens: the first thing seen is the colour.'],
          when: [{ t: [.85, 1.45], at: 'track' }, { t: [1.45, 3.45], at: [.58, .36] }] },
        { chip: 'Nudge', h: 'A hand shows the drag', side: 'r', p: ['Before the slider is touched, a hand drags its handle once: the gesture is taught without a word.'],
          when: [{ t: [3.5, 5], at: 'track' }] },
        { chip: 'Compare', h: 'With and without', side: 'r', p: ['Drag the line across the face: one side wears the lens, the other doesn’t, and the labels at the top follow the line.'],
          when: [{ t: [5.05, 8.6], at: 'track' }, { t: [17.6, 21], at: 'track' }, { t: [35.85, 38.5], at: 'track' }] },
        { chip: 'Zoom', h: 'Closer to the eyes', side: 'l', p: ['The bar at the side brings the eyes closer, to see the lens; a toast in the middle says how far.'],
          when: [{ t: [9.9, 12.4], at: [.045, .44] }, { t: [21.65, 24.75], at: [.045, .44] }, { t: [39.55, 43.4], at: [.045, .44] }] },
        { chip: 'Persuasion', h: 'A burst of praise', side: 'l', p: ['Hearts burst around the face with a line of praise, here “Absolutely stunning!”: a moment of delight that nudges towards the cart.'],
          when: [{ t: [12.7, 15.5], at: [[12.7, .5, .55], [13.3, .5, .59], [14.1, .5, .405], [14.9, .37, .23], [15.5, .36, .21]] }] },
        { chip: 'Explore', h: 'Every colour, on your eyes', side: 'l', p: ['Tap a colour in the row and the eyes change on the spot; the product card under it follows, one tap from the cart.'],
          when: [{ t: [25, 35.4], at: [.5, .705] }] },
      ] },
      { k: 'cols', of: [
        { h: 'What it is', p: ['An AR try-on for colour contact lenses: the lens is drawn on your own eyes, live, from the camera.'] },
        { h: 'Why a slider', p: ['A colour on an eye is easy to miss on its own. Split down the face, with and without, the difference is right in front of you.'] },
        { h: 'The motion', p: ['The nudges and the praise are custom-made animations: they draw the eye to the colour, teach the gesture and make choosing a lens feel like play.'] },
      ] },
      { k: 'p', t: ['More work is being added.'] },
    ] },
  ],
};
