import type { Case } from './types';

/* Magic Scale (Nitish, 21 Oct): the first company project, taken from his Framer portfolio
   (imakeuimove.framer.website → Works → Magic Scale) — its words and its sequence of sections, re-laid in 04. Every visual
   is an empty slot of the shape it had there (a wide video, a photo, a phone screen, a landscape phone), to be filled with
   what he sends separately. The text is his, as it was — one spelling fixed ("immediate"). */
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
  hero: { k: 'media', shape: 'wide', ratio: '2.5 / 1', label: 'Hero video' }, /* a band, so the strip shows under it in the page's height; the video's own ratio may change this */
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
          { k: 'media', shape: 'image', ratio: '1 / 1', label: 'Ring sizer photo' },
        ] },
      ],
    },
    {
      id: 'research', title: 'Research',
      blocks: [
        { k: 'p', t: ['We tested various positions and orientations of folded glasses on the phone screen with different ruler apps available online to determine the most ', { b: 'stable and intuitive placement' }, ' for ', { b: 'accurate measurements' }, ' and ', { b: 'seamless interaction' }, '.'] },
        { k: 'row', of: [
          { k: 'media', shape: 'image', ratio: '8 / 7', label: 'Photo', cap: 'Small phones' },
          { k: 'media', shape: 'image', ratio: '8 / 7', label: 'Photo', cap: 'Half measurement' },
          { k: 'media', shape: 'image', ratio: '8 / 7', label: 'Photo', cap: 'Glasses outside' },
          { k: 'media', shape: 'image', ratio: '8 / 7', label: 'Photo', cap: 'Glasses on top orientation' },
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
          { k: 'media', shape: 'image', ratio: '20 / 9', label: 'Zones diagram' },
          { k: 'media', shape: 'video', ratio: '20 / 11', label: 'Zones video' },
        ] },
        { k: 'legend', items: ['Less interactive elements', 'Place where the spec/frame is placed on screen', 'Main interactive elements'] },
        { k: 'figure', of: { k: 'media', shape: 'phone-land', label: 'Screen', cap: 'Final ruler design' } },
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
            media: [{ k: 'media', shape: 'phone', label: 'Video', cap: 'Intro video' }] },
          { title: 'Onboarding animations', media: [{ k: 'media', shape: 'phone-land', label: 'Video', cap: 'Step 1' }, { k: 'media', shape: 'phone-land', label: 'Video', cap: 'Step 2' }] },
          { title: 'Nudges to guide', media: [{ k: 'media', shape: 'phone-land', label: 'Screen', cap: 'Nudge 1' }, { k: 'media', shape: 'phone-land', label: 'Screen', cap: 'Nudge 2' }] },
          { title: 'Measuring mechanism', media: [{ k: 'media', shape: 'phone-land', label: 'Video', cap: 'Slider interaction' }],
            side: [
              { k: 'h', t: 'Interaction design that eased decision fatigue' },
              { k: 'ul', items: [
                ['Dynamic info bar: glows green when the slider is active and returns to grey when released.'],
                ['Animated CTA: the button becomes active after the slider stops → "Show M frames".'],
                ['Slider feedback: a semi-transparent expanding glasses image reinforces the "half-frame" logic.'],
                ['Onboarding CTA buttons with immediate visual feedback.'],
              ] },
              { k: 'figure', of: { k: 'media', shape: 'small', ratio: '5 / 2', label: 'CTA video' }, width: 'half' },
            ] },
        ] },
      ],
    },
    {
      id: 'found', title: 'Where users found it',
      blocks: [
        { k: 'p', t: ['Ensuring that the scale is discoverable in key user journeys:'] },
        { k: 'phones', of: [
          { k: 'media', shape: 'phone', label: 'Screen', cap: 'Welcome mat' },
          { k: 'media', shape: 'phone', label: 'Screen', cap: 'Home' },
          { k: 'media', shape: 'phone', label: 'Screen', cap: 'Profile section' },
          { k: 'media', shape: 'phone', label: 'Screen', cap: 'Product listing page' },
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
        { k: 'media', shape: 'wide', ratio: '2 / 1', label: 'Prototype video' },
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
