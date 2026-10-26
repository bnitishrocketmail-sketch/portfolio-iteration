import type { Case, Media } from './types';

/* Visual design for launches & campaigns — Lenskart (22 Oct): read off his Framer page. The hero is his two phones in
   perspective with the screens drawn into them (Launches3D in Fintech3D.tsx): the Phonic smart-glasses guide scrolling
   in the left one, the T20 × Hustlr landing page in the right. Then his three pieces, each with his line and its clips. */
const A = '/cases/launches';
/* the hero's recording (Nitish, 26 Oct: "placed inside a phone… of the standard size… corner to corner… where it is
   cropping a little above, we'll fade that out"): the clip (720 × 1136) is a phone drawn on black, cut at its foot. Its
   screen (x 95–637, from y 138, measured in a frame) is lined up with the phone's — 2 px inside its edge, so its outline
   and bezel fall outside the screen, and the phone's rounder corners (18% of the width to its 11%) cut inside its own —
   which runs it 85% of the way down the screen, on black, its last 12% faded */
const T20_FIT = ((x0: number, x1: number, y0: number): [number, number, number, number] => {
  const w = x1 - x0, H = 19.5 / 9; /* the slot's height, in widths */
  return [-x0 / w * 100, -y0 / w / H * 100, 720 / w * 100, 1136 / w / H * 100];
})(97, 635, 140);
const clip = (name: string, label: string, more: Partial<Media> = {}): Media => ({ k: 'media', shape: 'phone', label, src: `${A}/${name}.mp4`, poster: `${A}/${name}-poster.webp`, ...more });

export const launches: Case = {
  id: 'launches',
  title: 'Visual design for launches & campaigns',
  sub: 'Landing pages, campaign visuals, a 3D product guide and GenAI characters for Lenskart’s launches.',
  chips: ['Promotional', 'Visual communication', 'UI', 'Interaction/Motion'],
  facts: [
    { k: 'Role', v: 'Product designer — motion' },
    { k: 'Project type', v: 'Feature design' },
    { k: 'Team', v: 'Product design' },
    { k: 'Focus', v: 'UI/UX design collaboration, interaction & motion design ownership' },
  ],
  hero: { k: 'launches' },
  sections: [
    { id: 'about', title: 'About', blocks: [
      { k: 'p', t: ['A collection of visual design explorations for product launches, promotional campaigns and themed experiences at Lenskart, combining 3D visualisation, motion, generative AI and landing-page design to make product communication more engaging and easier to understand.'] },
    ] },
    { id: 'phonic', title: 'Lenskart Phonic — smart glasses user guide', blocks: [
      { k: 'p', t: ['Created 3D product visualisations and interaction demos to explain the features of Phonic smart glasses — covering button locations, controls and interactions for different functions in a more intuitive, visual format.'] },
      { k: 'phones', of: [
        { k: 'media', shape: 'phone', label: 'Know your Phonic', src: `${A}/phonic.webp`, cap: 'The guide' },
        clip('phonic-guide', 'The guide, scrolling', { cap: 'Buttons, controls and gestures, demonstrated' }),
      ] },
    ] },
    { id: 'hustlr', title: 'T20 × Hustlr campaign', blocks: [
      { k: 'p', t: ['Designed a cricket-themed promotional landing experience for Hustlr, with team-specific colour treatments and campaign visuals. The experience opened with a ', { b: 'Lottie-powered hero animation' }, ', creating an energetic entry point into the campaign.'] },
      { k: 'row', ratio: '1fr 1fr', align: 'center', of: [
        { k: 'figure', of: { k: 'media', shape: 'phone', label: 'The hero animation', src: `${A}/t20-hero.mp4`, poster: `${A}/t20-hero-poster.webp`, cap: 'The Lottie hero, opening the page', bg: '#000', fit: { box: T20_FIT, fade: 12 } }, width: 'phone' },
        { k: 'figure', of: clip('t20-landing', 'The landing page, scrolling', { cap: 'Cheer for your team: a colour for each' }), width: 'phone' },
      ] },
    ] },
    { id: 'genai', title: 'GenAI 3D characters', blocks: [
      { k: 'p', t: ['Developed a consistent ', { b: 'prompting framework for generating stylised 3D characters' }, ' with distinct personalities, occasions and expressions. Characters were paired with suitable eyewear and extended across frame recommendations, discovery flows and campaign communication, creating a flexible visual system for different use cases.'] },
      { k: 'media', shape: 'wide', ratio: '1262 / 640', label: 'The characters', src: `${A}/genai.mp4`, poster: `${A}/genai-poster.webp` },
      { k: 'p', t: ['More work is being added.'] },
    ] },
  ],
};
