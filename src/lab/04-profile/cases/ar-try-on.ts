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

/* the slider's handle in the contact-lens clip while it is dragged (5–8.6 s): its x, a fraction of the screen, in every frame of
   the clip (30 a second), found by matching the handle in each frame — so its node keeps to the handle frame by frame */
const LENS_HANDLE: [number, number][] = [[4.9, 0.871], [4.933, 0.871], [4.967, 0.871], [5.0, 0.871], [5.033, 0.871], [5.067, 0.854], [5.1, 0.833], [5.133, 0.812], [5.167, 0.792], [5.2, 0.769], [5.233, 0.746], [5.267, 0.725], [5.3, 0.704], [5.333, 0.685], [5.367, 0.667], [5.4, 0.654], [5.433, 0.64], [5.467, 0.621], [5.5, 0.6], [5.533, 0.579], [5.567, 0.558], [5.6, 0.54], [5.633, 0.521], [5.667, 0.502], [5.7, 0.483], [5.733, 0.469], [5.767, 0.452], [5.8, 0.438], [5.833, 0.421], [5.867, 0.404], [5.9, 0.388], [5.933, 0.375], [5.967, 0.36], [6.0, 0.35], [6.033, 0.34], [6.067, 0.329], [6.1, 0.319], [6.133, 0.31], [6.167, 0.304], [6.2, 0.298], [6.233, 0.292], [6.267, 0.285], [6.3, 0.277], [6.333, 0.269], [6.367, 0.263], [6.4, 0.258], [6.433, 0.254], [6.467, 0.254], [6.5, 0.254], [6.533, 0.254], [6.567, 0.254], [6.6, 0.254], [6.633, 0.254], [6.667, 0.254], [6.7, 0.254], [6.733, 0.254], [6.767, 0.254], [6.8, 0.254], [6.833, 0.254], [6.867, 0.258], [6.9, 0.263], [6.933, 0.271], [6.967, 0.279], [7.0, 0.285], [7.033, 0.294], [7.067, 0.302], [7.1, 0.312], [7.133, 0.323], [7.167, 0.338], [7.2, 0.354], [7.233, 0.371], [7.267, 0.388], [7.3, 0.404], [7.333, 0.421], [7.367, 0.433], [7.4, 0.448], [7.433, 0.463], [7.467, 0.475], [7.5, 0.49], [7.533, 0.502], [7.567, 0.515], [7.6, 0.529], [7.633, 0.544], [7.667, 0.562], [7.7, 0.583], [7.733, 0.604], [7.767, 0.627], [7.8, 0.648], [7.833, 0.667], [7.867, 0.688], [7.9, 0.71], [7.933, 0.729], [7.967, 0.748], [8.0, 0.762], [8.033, 0.773], [8.067, 0.781], [8.1, 0.792], [8.133, 0.802], [8.167, 0.812], [8.2, 0.821], [8.233, 0.825], [8.267, 0.827], [8.3, 0.827], [8.333, 0.827], [8.367, 0.827], [8.4, 0.827], [8.433, 0.827], [8.467, 0.827], [8.5, 0.827], [8.533, 0.827], [8.567, 0.827], [8.6, 0.827], [8.633, 0.827], [8.667, 0.827], [8.7, 0.827], [8.733, 0.827], [8.767, 0.827], [8.8, 0.827]];

export const arTryOn: Case = {
  id: 'ar-try-on',
  title: 'Revolutionising AR try-on',
  sub: 'A contact-lens try-on and frame removal: an AR try-on that lets lens colours be compared on your own eye, and works for people already wearing glasses.',
  chips: ['App feature', 'AR', 'UX/UI', 'Interaction/Motion'],
  facts: [
    { k: 'Role', v: 'Product designer — motion' },
    { k: 'Project type', v: 'Feature design' },
    { k: 'Team', v: 'Product design' },
    { k: 'Focus', v: 'UI/UX design collaboration, interaction & motion design ownership' },
  ],
  hero: { k: 'media', shape: 'wide', ratio: '2.2 / 1', label: 'Hero — to come' },
  collab: { name: 'Ashish Sharma', role: 'Senior product designer', photo: '/cases/ashish.webp', project: 'https://ashishsharmaportfolio.framer.website/work-5/ar-on-colour-lenses', site: 'https://ashishsharmaportfolio.framer.website/' }, /* made with Ashish (26 Oct): his case study of it, and his portfolio */
  sections: [
    { id: 'about', title: 'About', blocks: [
      { k: 'p', t: ['Shopping for eyewear isn’t just about function — it’s about ', { b: 'style, personality and occasion' }, '. Customers in a Lenskart store browse by how glasses fit their ', { b: 'lifestyle' }, ', not just by brand or frame type. In the app, that context was ', { b: 'missing from the digital experience' }, '.'] },
      { k: 'p', t: ['This study covers two of the improvements made to the app’s AR try-on: ', { b: 'trying on colour contact lenses' }, ' with a slider, and ', { b: 'removing the glasses you are already wearing' }, ' before you try on a new pair.'] },
    ] },
    { id: 'gaps', title: 'Where AR try-on fell short', blocks: [
      { k: 'p', t: ['In ', { b: 'primary research' }, ' — ', { b: 'user-testing sessions' }, ', and conversations with customers on ', { b: 'store visits' }, ' — we found four gaps in the AR try-on:'] },
      { k: 'gaps', of: [
        { h: 'No interactive contact-lens try-on', p: ['No seamless way to compare lens colours.'], to: 'Answered by the contact-lens try-on' },
        { h: 'Overlapping frames', p: ['Users wearing glasses couldn’t get an accurate preview: the frame they tried sat on top of their own.'], to: 'Answered by frame removal' },
        { h: 'No quick access to AR try-on', p: ['Users had to go deep into a product page to try frames.'] },
        { h: 'Limited personalisation', p: ['No way to shop by style, occasion or personality.'] },
      ] },
      { k: 'p', t: ['These gaps led to ', { b: 'hesitation in purchases' }, ' and ', { b: 'reduced engagement' }, ' with AR try-on.'] },
    ] },
    { id: 'contact-lens', title: 'Contact-lens try-on with a slider', blocks: [
      { k: 'p', t: ['Users ', { b: 'drag a slider across the screen' }, ' to compare one eye ', { b: 'with the lens and one without' }, ': a before and after, in real time. Around the slider, small animations draw the eye to the colour, teach the gesture and celebrate the look. Each one lights up as the recording reaches it; tap one to see it again.'] },
      /* each feature once, at its first showing (Nitish, 26 Oct: "once we show a feature… we don't have to repeat it"); a node rides
         only the slider's handle, frame by frame; the rest sit still where their feature is ("either do it in synchronization… or
         don't do it") */
      { k: 'tour', src: `${A}/lens-tour.mp4`, poster: `${A}/lens-tour-poster.webp`, label: 'The contact-lens try-on, recorded: the slider, the nudges, zoom, the praise and the colours', track: LENS_HANDLE, ty: .602, of: [
        { chip: 'Nudge', h: 'The reveal', side: 'r', p: ['As the try-on opens, the line sweeps across the face and sparkles play over the side wearing the lens: the first thing seen is the colour.'],
          when: [{ t: [.85, 3.45], at: [.58, .36] }] },
        { chip: 'Nudge', h: 'A hand shows the drag', side: 'r', p: ['Before the slider is touched, a hand drags its handle once: the gesture is taught without a word.'],
          when: [{ t: [3.5, 5], at: [.871, .602] }] },
        { chip: 'Compare', h: 'With and without', side: 'r', p: ['Drag the line across the face: one side wears the lens, the other doesn’t, and the labels at the top follow the line.'],
          when: [{ t: [5.05, 8.6], at: 'track' }] },
        { chip: 'Zoom', h: 'Closer to the eyes', side: 'l', p: ['The bar at the side brings the eyes closer, to see the lens; a toast in the middle says how far.'],
          when: [{ t: [9.9, 12.4], at: [.045, .44] }] },
        { chip: 'Persuasion', h: 'A burst of praise', side: 'l', p: ['Hearts burst around the face with a line of praise, here “Absolutely stunning!”: a moment of delight that nudges towards the cart.'],
          when: [{ t: [12.7, 15.5], at: [.5, .46] }] },
        { chip: 'Explore', h: 'Every colour, on your eyes', side: 'l', p: ['Tap a colour in the row and the eyes change on the spot; the product card under it follows, one tap from the cart.'],
          when: [{ t: [25, 35.4], at: [.405, .684] }] },
      ] },
      { k: 'cols', of: [
        { h: 'What it is', p: ['An AR try-on for colour contact lenses: the lens is drawn on your own eyes, live, from the camera.'] },
        { h: 'Why a slider', p: ['A colour on an eye is easy to miss on its own. Split down the face, with and without, the difference is right in front of you.'] },
        { h: 'The motion', p: ['The nudges and the praise are custom-made animations: they draw the eye to the colour, teach the gesture and make choosing a lens feel like play.'] },
      ] },
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
      { k: 'p', t: ['More work is being added.'] },
    ] },
  ],
};
