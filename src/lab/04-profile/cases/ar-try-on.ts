import type { Case, Media } from './types';

/* Interactive experiences (was Revolutionising AR try-on) — Lenskart (Nitish, 26 Oct): from a page of an earlier portfolio of his
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

/* the slider's handle in the contact-lens clip while it is dragged (1.7–5.2 s): its x, a fraction of the screen, in every
   frame of the clip (30 a second), found by matching the handle in each frame — so its node keeps to the handle frame by frame */
const LENS_HANDLE: [number, number][] = [[1.7, 0.87], [1.73, 0.87], [1.77, 0.854], [1.8, 0.833], [1.83, 0.812], [1.87, 0.792], [1.9, 0.769], [1.93, 0.745], [1.97, 0.725], [2.0, 0.704], [2.03, 0.685], [2.07, 0.667], [2.1, 0.653], [2.13, 0.639], [2.17, 0.62], [2.2, 0.6], [2.23, 0.579], [2.27, 0.558], [2.3, 0.539], [2.33, 0.519], [2.37, 0.502], [2.4, 0.484], [2.43, 0.468], [2.47, 0.451], [2.5, 0.435], [2.53, 0.419], [2.57, 0.403], [2.6, 0.389], [2.63, 0.373], [2.67, 0.361], [2.7, 0.35], [2.73, 0.338], [2.77, 0.329], [2.8, 0.317], [2.83, 0.31], [2.87, 0.303], [2.9, 0.299], [2.93, 0.292], [2.97, 0.285], [3.0, 0.278], [3.03, 0.269], [3.07, 0.264], [3.1, 0.257], [3.13, 0.255], [3.17, 0.252], [3.53, 0.252], [3.57, 0.257], [3.6, 0.262], [3.63, 0.271], [3.67, 0.278], [3.7, 0.285], [3.73, 0.294], [3.77, 0.301], [3.8, 0.312], [3.83, 0.322], [3.87, 0.338], [3.9, 0.354], [3.93, 0.37], [3.97, 0.387], [4.0, 0.403], [4.03, 0.419], [4.07, 0.433], [4.1, 0.447], [4.13, 0.461], [4.17, 0.475], [4.2, 0.488], [4.23, 0.502], [4.27, 0.514], [4.3, 0.528], [4.33, 0.544], [4.37, 0.562], [4.4, 0.583], [4.43, 0.604], [4.47, 0.627], [4.5, 0.648], [4.53, 0.667], [4.57, 0.688], [4.6, 0.708], [4.63, 0.729], [4.67, 0.748], [4.7, 0.762], [4.73, 0.773], [4.77, 0.782], [4.8, 0.792], [4.83, 0.801], [4.87, 0.812], [4.9, 0.819], [4.93, 0.824], [4.97, 0.826], [5.2, 0.826]];

export const arTryOn: Case = {
  id: 'ar-try-on',
  title: 'Interactive experiences', /* (26 Oct, Nitish: a name for the interactions he worked on and built, so more can join the AR try-on here; was Revolutionising AR try-on) */
  sub: 'Interactions I worked on and built at Lenskart — starting with the AR try-on: a contact-lens try-on with a slider, and frame removal for people already wearing glasses.',
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
      { k: 'p', t: ['This page collects the interactive experiences I worked on and built: ', { b: 'trying on colour contact lenses' }, ' with a slider, the ', { b: 'Hustlr frame’s highlights in 3D' }, ', ', { b: 'snap-on skins' }, ' tried on the frame you chose, and ', { b: 'removing the glasses you are already wearing' }, ' before you try on a new pair.'] },
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
      /* the tour, paced (Nitish, 26 Oct): the clip starts at the hand's nudge (the sparkles cut). At each stop the recording
         pauses on the frame named (`t`), the node marks the spot (`at`), the card comes in — one plain line, no heading
         ("just some text that tells the viewer what we are showing him"); then the node goes and the feature plays to `end`.
         The slider's plays with its node riding the handle. The colours: paused before the first switch (22.3 s, the white
         selection still on Spicy Gray), then again on the third switch's sparkles (26.85 s), the node on an eye */
      { k: 'tour', src: `${A}/lens-tour.mp4`, poster: `${A}/lens-tour-poster.webp`, label: 'The contact-lens try-on, recorded: the slider with its nudge, zoom, the praise and the colours', track: LENS_HANDLE, ty: .602, of: [
        { p: ['Drag the slider to see the lens on and off. A hand nudges it first, so you know it moves.'], side: 'r', t: .05, end: 5.2, at: 'track', ride: true },
        { p: ['Zoom in for a closer look at the lens.'], side: 'l', t: 6.45, end: 8.7, at: [.045, .44] },
        { p: ['A burst of praise, to delight — and persuade.'], side: 'l', t: 10, end: 12.3, at: [.312, .572] },
        { p: ['Tap a colour to switch lenses.'], side: 'l', t: 22.3, end: 26.5, at: [.405, .684] },
        { p: ['Sparkles on the eyes, each time the lens changes.'], side: 'r', t: 26.85, end: 32.4, at: [.681, .396] },
      ] },
      /* his part in it (26 Oct: "ideated and worked on the interaction and prototyping and accurate handoff to the devs… ProtoPie") */
      { k: 'cols', of: [
        { h: 'My part', p: ['I ideated and designed the interaction: the slider, the nudges, the praise and the lens switching.'] },
        { h: 'Prototyped in ProtoPie', p: ['Every interaction was built as a working prototype in ProtoPie, so it could be felt and tuned before a line of code.'] },
        { h: 'Handed off, accurately', p: ['The prototype became the handoff: the developers had every timing, trigger and curve to build from.'] },
      ] },
    ] },
    /* the Hustlr frame's product highlights (Nitish, 26 Oct, from his recording: "a 3D experience, where the 3D glasses
       rotates and shows the emphasis on the screen on whatever feature"): the recording in a phone with the four highlights
       beside it, lit in time; the stills are the stage's four views, cut from the recording */
    { id: 'hustlr-3d', title: 'Hustlr frames: product highlights in 3D', blocks: [
      { k: 'p', t: ['On the Hustlr frame’s product page, the highlights are a ', { b: '3D card' }, ': tap a feature — the material, the hinge, the nose pads, the temples — and the frame ', { b: 'turns to show it' }, ', its line fading in alongside. One model and four views, in place of four photos.'] },
      { k: 'synced', src: `${A}/hustlr-3d.mp4`, poster: `${A}/hustlr-3d-poster.webp`, label: 'The Hustlr product page: the 3D highlights card, tapped through its four features', of: [
        { t: 0, thumb: `${A}/h3-1.webp`, name: 'TR 90', p: ['Made with lightweight TR90: the whole frame, three-quarter on.'] },
        { t: 3.5, thumb: `${A}/h3-2.webp`, name: 'Hinge', p: ['Flexible spring hinges: the frame swings round and in, to the hinge.'] },
        { t: 6.5, thumb: `${A}/h3-3.webp`, name: 'Nose pads', p: ['Comfortable built-in nose pads: in to the bridge, from the front.'] },
        { t: 9.6, thumb: `${A}/h3-4.webp`, name: 'Temples', p: ['Rubberised temples for comfort and grip: the temple’s tip, from above.'] },
      ] },
    ] },
    /* the snap-on skins (Nitish, 26–27 Oct: "a snap-on skin for your glasses… it just snaps on from the top"; "we are focusing
       on the flow and a bit on the interaction… create a PLP before it… on the cart… how snap-on looks… with the frame";
       "three screens side by side… focus a little more on the interaction… add a node there with a text container"):
       three screens in a row — his Lenskart product page with the way in drawn in, his recording toured (one stop: the skin
       half-way down over the frame, 3.1 s), his Lenskart cart with the skinned frame and the skin's lines drawn in */
    { id: 'snap-on', title: 'Snap-on skins: dress the frame you chose', blocks: [
      { k: 'p', t: ['A ', { b: 'snap-on skin' }, ' is a printed cover that clips over the front of a Lenskart frame. On the product page there is a row to add one; the try-on shows it ', { b: 'snapping onto your own frame' }, '; the cart carries the frame with its skin.'] },
      { k: 'trio', cap: 'The try-on: the skin snaps on from the top',
        before: { k: 'media', shape: 'phone', label: 'The product page with the snap-on entry', cap: 'The way in: a row under the frame’s chips', src: `${A}/snap-pdp.webp` },
        tour: { src: `${A}/snap-on.mp4`, poster: `${A}/snap-on-poster.webp`, label: 'The snap-on try-on, recorded: a skin tapped in the row drops onto the frame; another takes its place; plus adds it to the set', of: [
          { p: ['The skin drops from above and settles over the front of the frame — the way a real snap-on clips on.'], side: 'l', t: 3.1, end: 7.2, at: [.19, .22] },
        ] },
        after: { k: 'media', shape: 'phone', label: 'The cart with the skinned frame and the snap-on line', cap: 'The cart: the frame with its skin, the skin on the bill', src: `${A}/snap-cart.webp` } },
    ] },
    /* frame removal (27 Oct, Nitish: "remove the result container… remove the step-by-step screens… two screens… particles being
       gathered… particles scattering… the third… when the glasses are removed and the new glasses are placed… talk a little
       bit about the problem first… put this project in the end"): the problem, the three states as stills from his recording
       (the API's mask behind the particles), the two state Lotties, the recording */
    { id: 'frame-removal', title: 'Frame removal for a more accurate try-on', blocks: [
      { k: 'p', t: ['People who ', { b: 'already wear glasses' }, ' couldn’t use the AR try-on: the frame they tried sat on top of their own, with ', { b: 'two frames, double reflections' }, ' and no way to judge the look. The try-on had to take their glasses off first.'] },
      { k: 'p', t: ['It does that with a ', { b: 'mask' }, ': an API finds the glasses on the face, masks them out and ', { b: 'inpaints the skin and eyebrows' }, ' behind them. The motion on top tells the user what is happening while it works.'] },
      { k: 'phones', of: [
        still('fr-gather', 'Particles gather on the frame', 'Analysing: particles gather on the frame'),
        still('fr-scatter', 'Particles scatter, the glasses fade out', 'Removed: the particles scatter, the frame fades'),
        still('fr-clean', 'A new frame on a clean face', 'Try on: a new frame, on a clean face'),
      ] },
      { k: 'h', t: 'The two states, as Lotties' },
      { k: 'successes', of: [
        { m: state('fr-loading', 'Loading state'), top: true, chip: 'Loading state', h: 'Particles gather on the frame', ul: [
          ['As the API ', { b: 'analyses the glasses' }, ', small particles ', { b: 'gather round the frame’s outline' }, ' in a subtle white trace: the removal is in progress.'],
          ['They ', { b: 'move dynamically' }, ', like an energy build-up, and a ', { b: 'soft pulse' }, ' gives the frame depth: something is about to happen.'],
        ] },
        { m: state('fr-success', 'Success state'), top: true, chip: 'Success state', h: 'Particles scatter, the glasses fade out', ul: [
          ['Once the mask is ready, the particles ', { b: 'burst outward' }, ' in a quick, smooth burst: the old frame disappearing.'],
          ['The glasses ', { b: 'fade out in a gentle dissolve' }, ', not an instant cut, so the change stays smooth.'],
        ] },
      ] },
      { k: 'row', ratio: SIDE, of: [
        { k: 'p', t: ['Both are ', { b: 'custom Lotties' }, '. With motion, frame removal turned from a technical feature into an ', { b: 'engaging, visually intuitive interaction' }, ': the wait reads as something happening, and the removal as a reveal. The whole flow, recorded, at the right.'] },
        { k: 'figure', of: clip('frame-removal', 'Frame removal, recorded', 'The flow, end to end'), width: 'phone' },
      ] },
      { k: 'p', t: ['More work is being added.'] },
    ] },
  ],
};
