import type { Case } from './types';

const A = '/cases/magic-scale'; /* public/cases/magic-scale — his page's media, pulled from it on 22 Oct (see LOG p87) */

/* Magic Scale (Nitish, 21 Oct): the first company project, taken from his Framer portfolio
   (imakeuimove.framer.website → Works → Magic Scale) — its words and its sequence of sections, re-laid in 04. Every visual
   is a slot of the shape it had there (a wide video, a photo, a phone screen, a landscape phone), filled (22 Oct) with
   the page's own media — its clips, pictures and the Lotties layered over its screens, placed as the page placed them. The text is his, as it was — one spelling fixed ("immediate"). */
const magicScale: Case = {
  id: 'magic-scale',
  title: 'Magic Scale',
  sub: 'A frame (glasses) size measuring tool — patent pending',
  chips: ['App feature', 'UX/UI', 'Interaction/Motion'],
  facts: [
    { k: 'Role', v: 'Product designer — motion' },
    { k: 'Project type', v: 'Feature design' },
    { k: 'Team', v: 'Product design' },
    { k: 'Focus', v: 'UI/UX design collaboration, interaction & motion design ownership' },
  ],
  hero: { k: 'media', shape: 'wide', ratio: '2.2 / 1', label: 'Hero video', src: `${A}/hero.mp4`, poster: `${A}/hero-poster.webp` }, /* a band (the clip is 16:9, cropped as his page cropped it), so the strip shows under it in the page's height */
  sections: [
    {
      id: 'what', title: 'What is a Magic Scale?',
      blocks: [
        { k: 'p', t: ['A guided tool allowing users to ', { b: 'measure their glasses by placing them on their phone screen' }, ' & measuring half the frame, users can accurately determine their frame size (XS, S, M, L, XL) in millimeters. This approach ', { b: 'empowers users to trust the results' }, ', as they measure their glasses themselves.'] },
        { k: 'stats', title: 'Impact of the feature', tone: 'dark', items: [{ n: '3.3%', l: 'Conversion increase' }, { n: '9.5%', l: 'Adoptions' }, { n: '38%', l: 'Completion' }, { n: '98%', l: 'Frame sizing accuracy' }] },
        { k: 'stats', title: 'Why a new sizing tool?', items: [{ n: '5.6%', l: 'Returns due to sizing' }, { n: '80%', l: 'AR-compatible devices' }, { n: '50–60%', l: 'AR sizing accuracy' }, { n: '98%', l: 'Frame sizing accuracy' }] },
      ],
    },
    {
      id: 'inspiration', title: 'Inspiration: the ring sizer tool',
      blocks: [
        { k: 'row', ratio: '3fr 2fr', of: [
          { k: 'group', of: [
            { k: 'p', t: ['We started by looking at the initial inspiration of the ring sizing tool on the phone. With the same philosophy we tried to find a way to measure something as big and complex as glasses on a phone screen.'] },
            { k: 'ul', items: [
              ['A UI design ensuring no information being obscured by the physical glasses placed on the screen.'],
              ['Glasses should be placed upside down on the phone screen — shown in the image on the right.'],
              ['Only half of the frame needs to be measured to get the size — the system will double it.'],
            ] },
          ] },
          { k: 'media', shape: 'image', ratio: '1 / 1', label: 'Ring sizer photo', src: `${A}/ring.webp` },
        ] },
      ],
    },
    {
      id: 'research', title: 'Research',
      blocks: [
        { k: 'p', t: ['We tested various positions and orientations of folded glasses on the phone screen with different ruler apps available online to determine the most ', { b: 'stable and intuitive placement' }, ' for ', { b: 'accurate measurements' }, ' and ', { b: 'seamless interaction' }, '.'] },
        { k: 'row', of: [
          { k: 'media', shape: 'image', ratio: '8 / 7', label: 'Photo', cap: 'Small phones', src: `${A}/research-1.webp` },
          { k: 'media', shape: 'image', ratio: '8 / 7', label: 'Photo', cap: 'Half measurement', src: `${A}/research-2.webp` },
          { k: 'media', shape: 'image', ratio: '8 / 7', label: 'Photo', cap: 'Glasses outside', src: `${A}/research-3.webp` },
          { k: 'media', shape: 'image', ratio: '8 / 7', label: 'Photo', cap: 'Glasses on top orientation', src: `${A}/research-4.webp` },
        ] },
        { k: 'h', t: 'Insights' },
        { k: 'ol', items: [
          { lead: 'Glasses too large to fit on screen:', t: ['Most glasses were larger than the phone screen, causing alignment issues. ', { b: 'Measuring only half of the frame and doubling it' }, ' ensured greater accuracy while addressing the size limitation of the phone screen.'] },
          { lead: 'Difficulty in placement:', t: ['It was difficult to determine the correct way to position their folded glasses on the phone screen. Through hands-on research, we found that placing the folded glasses upside down provided ', { b: 'better stability' }, ' on the screen and created a ', { b: 'clear reference point for measurement' }, '.'] },
        ] },
      ],
    },
    {
      id: 'direction', title: 'Final direction: a 3-part scale experience',
      blocks: [
        { k: 'ul', items: [
          ['A UI design ensuring no information being obscured by the physical glasses placed on the screen.'],
          ['Glasses should be placed upside down on the phone screen — shown in the image on the right.'],
          ['Only half of the frame needs to be measured to get the size — the system will double it.'],
        ] },
        { k: 'row', ratio: '1fr 1fr', align: 'center', of: [
          { k: 'media', shape: 'image', ratio: '20 / 9', label: 'Zones diagram', src: `${A}/zones.webp` },
          { k: 'media', shape: 'video', ratio: '20 / 11', label: 'Zones video', src: `${A}/zones.mp4`, poster: `${A}/zones-poster.webp` },
        ] },
        { k: 'legend', items: ['Less interactive elements', 'Place where the spec/frame is placed on screen', 'Main interactive elements'] },
        { k: 'figure', of: { k: 'media', shape: 'phone-land', label: 'Screen', cap: 'Final ruler design', src: `${A}/ruler.webp` } },
      ],
    },
    {
      id: 'flow', title: 'Final flow',
      blocks: [
        { k: 'flow', steps: [
          { title: 'Educating with motion',
            text: [
              { k: 'p', t: ['We knew onboarding was everything for this unfamiliar flow. So we…'] },
              { k: 'ul', items: [
                ['Created a quick intro video with a real person demonstrating the tool.'],
                ['Designed 3D motion graphics showing correct placement and orientation.'],
                ['Added contextual nudges to guide and correct user behaviour (e.g. "Keep glasses parallel").'],
              ] },
            ],
            media: [{ k: 'media', shape: 'phone', ratio: '1014 / 1808', label: 'Video', cap: 'Intro video', src: `${A}/intro.webp` }] /* a still on his page too: a frame of the video with the widget over it */ },
          { title: 'Onboarding animations', media: [{ k: 'media', shape: 'phone-land', label: 'Video', cap: 'Step 1', src: `${A}/step-1.mp4`, poster: `${A}/step-1-poster.webp` }, { k: 'media', shape: 'phone-land', label: 'Video', cap: 'Step 2', src: `${A}/step-2.mp4`, poster: `${A}/step-2-poster.webp` }] },
          { title: 'Nudges to guide', media: [{ k: 'media', shape: 'phone-land', label: 'Screen', cap: 'Nudge 1', src: `${A}/nudge-1.webp`, layers: [{ kind: 'lottie', src: `${A}/nudge-1.json`, box: [15.3, 39.3, 57, 56.8] }] }, { k: 'media', shape: 'phone-land', label: 'Screen', cap: 'Nudge 2', src: `${A}/nudge-2.webp`, layers: [{ kind: 'lottie', src: `${A}/nudge-2.json`, box: [13.9, 70.7, 36, 27.5] }, { kind: 'lottie', src: `${A}/chevron.json`, box: [52.8, 77.7, 7.1, 14.4] }] }] },
          { title: 'Measuring mechanism', media: [{ k: 'media', shape: 'phone-land', label: 'Video', cap: 'Slider interaction', src: `${A}/slider.mp4`, poster: `${A}/slider-poster.webp` }],
            side: [
              { k: 'h', t: 'Interaction design that eased decision fatigue' },
              { k: 'ul', items: [
                ['Dynamic info bar: glows green when the slider is active and returns to grey when released.'],
                ['Animated CTA: the button becomes active after the slider stops → "Show M frames".'],
                ['Slider feedback: a semi-transparent expanding glasses image reinforces the "half-frame" logic.'],
                ['Onboarding CTA buttons with immediate visual feedback.'],
              ] },
              { k: 'figure', of: { k: 'media', shape: 'small', ratio: '5 / 2', label: 'CTA video', src: `${A}/cta.mp4`, poster: `${A}/cta-poster.webp` }, width: 'half' },
            ] },
        ] },
      ],
    },
    {
      id: 'found', title: 'Where users found it',
      blocks: [
        { k: 'p', t: ['Ensuring that the scale is discoverable in key user journeys:'] },
        { k: 'phones', of: [
          { k: 'media', shape: 'phone', label: 'Screen', cap: 'Welcome mat', src: `${A}/welcome.webp`, layers: [{ kind: 'lottie', src: `${A}/welcome.json`, box: [0, 53, 100, 44.2] }] },
          { k: 'media', shape: 'phone', label: 'Screen', cap: 'Home', src: `${A}/home.webp`, layers: [{ kind: 'lottie', src: `${A}/home.json`, box: [0, 44.6, 100, 31.4] }] },
          { k: 'media', shape: 'phone', label: 'Screen', cap: 'Profile section', src: `${A}/profile.webp`, layers: [{ kind: 'lottie', src: `${A}/hand-a.json`, box: [66.5, 19.8, 27.6, 12.4] }] },
          { k: 'media', shape: 'phone', label: 'Screen', cap: 'Product listing page', src: `${A}/plp.webp`, layers: [{ kind: 'lottie', src: `${A}/hand-a.json`, box: [4.5, 68.2, 28.8, 10.3] }, { kind: 'lottie', src: `${A}/hand-b.json`, box: [5, 82, 27.5, 12.1] }] },
        ] },
      ],
    },
    {
      id: 'handoff', title: 'Prototype & handoff',
      blocks: [
        { k: 'cols', of: [
          { h: 'Interactive prototype', p: ['To ensure a seamless transition from design to development, I created a ', { b: 'fully functional prototype of Magic Scale in ProtoPie' }, ', replicating all key interactions:'],
            ul: [['Real-time slider feedback'], ['Pressed states for buttons and CTA'], ['Dynamic transitions in the onboarding flow'], ['Visual scale expansion tied to user input']] },
          { h: 'Dev handoff', p: ['This prototype allowed stakeholders and engineers to ', { b: 'experience the feature exactly as intended' }, ', leaving no ambiguity in interaction behaviour.'],
            ul: [['Easing curves, durations and delays'], ['Motion specs (bounce, overshoot, slider behaviour)'], ['CTA transition rules and responsive states'], ['UI spacing and sizing for accurate implementation across screens']] },
        ] },
        { k: 'media', shape: 'wide', ratio: '16 / 9', label: 'Prototype video', src: `${A}/prototype.mp4`, poster: `${A}/prototype-poster.webp` },
      ],
    },
    {
      id: 'observations', title: 'Final observations',
      blocks: [
        { k: 'p', t: ['Implementing a reliable ruler experience taught me the significant impact of tailoring content to individual user needs. By creating dynamic, relevant interactions, we can turn Magic Scale into a powerful engagement tool that not only enhances user satisfaction but also builds long-term loyalty.'] },
      ],
    },
  ],
};
export default magicScale;
