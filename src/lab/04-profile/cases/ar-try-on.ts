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
      { k: 'row', ratio: SIDE, of: [
        { k: 'group', of: [
          { k: 'p', t: ['Users ', { b: 'drag a slider across the screen' }, ' to see:'] },
          { k: 'ul', items: [
            [{ b: 'One eye with, and one without' }, ' the contact lens.'],
            ['A ', { b: 'before and after' }, ', in real time.'],
          ] },
          { k: 'p', t: [{ b: 'Micro nudges, interactions and feedback animations' }, ', custom-made, draw the user’s focus to the changing eye colour and to the slider.'] },
        ] },
        { k: 'figure', of: clip('contact-lens', 'Contact-lens try-on, recorded', 'From colour lenses to the try-on'), width: 'phone' },
      ] },
      { k: 'h', t: 'Step by step' },
      { k: 'phones', of: [
        still('cl-1', 'Colour lenses', '1 · Colour lenses, zero power'),
        still('cl-2', 'The nudge', '2 · A nudge towards the slider'),
        still('cl-3', 'With and without', '3 · With and without, side by side'),
        still('cl-4', 'Every colour', '4 · Every colour, on your own eye'),
      ] },
      { k: 'p', t: ['More work is being added.'] },
    ] },
  ],
};
