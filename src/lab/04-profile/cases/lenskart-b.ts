import type { Case, Media } from './types';

/* Lenskart Copilot — B (22 Oct): read off his Framer site's "Lenskart Copilot (Assisted→Lensa→Claire AI)" page and
   adapted: the screens in their containers as he placed them, the hero's old B clip replaced by the revamped B (the
   showreel Lottie the home page plays), a line added to each version's container where the page had only screens, and
   the state machine section rebuilt around the revamped states (BMachine.tsx). Every picture and clip is the page's own
   (public/cases/lenskart-b). */
const A = '/cases/lenskart-b';
const phone = (src: string, label: string, more: Partial<Media> = {}): Media => ({ k: 'media', shape: 'phone', label, src: `${A}/${src}`, ...more });
const clip = (name: string, label: string, more: Partial<Media> = {}): Media => ({ k: 'media', shape: 'phone', label, src: `${A}/${name}.mp4`, poster: `${A}/${name}-poster.webp`, ...more });
/* Lensa's face, blinking over the chat screen (his page: a 320 × 320 Lottie at a third of the screen's width) */
const lensa = (label: string) => phone('chat-lensa.webp', label, { layers: [{ kind: 'lottie', src: `${A}/lensa-face.json`, box: [32.5, 19.6, 35.1, 15.8] }] });
/* the help menu opening over the lens package screen */
const help = phone('help-lens.webp', 'The help menu over the lens package', { layers: [{ kind: 'image', src: `${A}/help-menu.webp`, box: [18.6, 40.5, 77.4, 40.7] }] });

export const lenskartB: Case = {
  id: 'lenskart-b',
  title: 'Lenskart Copilot',
  sub: 'An AI copilot for smarter eyewear decisions and an assisted flow.', /* one line, so the bar keeps the height Magic Scale's has (22 Oct) */
  chips: ['App feature', 'AI', 'UX/UI', 'Interaction/Motion'],
  facts: [
    { k: 'Role', v: 'Product designer — motion' },
    { k: 'Project type', v: 'Feature design' },
    { k: 'Team', v: 'Product design' },
    { k: 'Focus', v: 'UI/UX design collaboration, interaction & motion design ownership' },
  ],
  /* the hero (Nitish, 22 Oct): one phone in the middle with the three screens taking turns in it — B (the revamped
     states, the showreel Lottie, where his page ran the old states' clip), Lensa's chat, Claire greeting — the other
     two floating at its sides, smaller, still and in black and white, until they slide in */
  hero: { k: 'carousel', of: [
    phone('plp-empty.webp', 'B on the product list', { layers: [{ kind: 'lottie', src: 'https://lottie.host/9e427624-628c-46d0-a92d-fc7ca43e2836/VMVaaAYm3M.lottie', box: [24, 35.5, 52.7, 23.8] }] }),
    lensa('Chat with Lensa'),
    clip('claire', 'Claire greeting on the product list'),
  ] },
  sections: [
    { id: 'start', title: 'Where it started?', blocks: [
      { k: 'row', ratio: '2fr 1fr', of: [
        { k: 'p', t: ['Customers often hesitated at PDP, lens selection and Cart because of unanswered questions. ', { b: 'Lenskart Copilot (Lensa)' }, ', now evolving into Claire and B, was built to handhold users through these stages — clearing doubts, guiding lens choices and connecting them to experts when needed.'] },
        { k: 'stats', title: 'Impact', tone: 'dark', items: [{ n: '3×', l: 'higher conversions than the regular online flow' }] },
      ] },
    ] },
    { id: 'problem', title: 'The problem: scattered queries, unanswered questions = drop-offs', blocks: [
      { k: 'p', t: ['Before Copilot, customer queries came through the app’s ', { b: 'Help section' }, ' and ', { b: 'WhatsApp flows' }, '.'] },
      { k: 'ul', items: [
        [{ b: 'Repetitive FAQs:' }, ' frame durability, lens options, size mismatch, returns, delivery time, AR issues.'],
        [{ b: 'Problem:' }, ' fragmented support experience, delayed responses, and no real-time help at the decision point (PDP/Cart).'],
      ] },
      /* his FAQ panel: where the questions came up, and the questions */
      { k: 'faq', of: [
        { m: { k: 'media', shape: 'screen', label: 'Product list', src: `${A}/faq-plp.webp` }, qs: [{ label: 'Style specific', q: ['Do you have more similar styles?'] }, { label: 'Aesthetic appeal', q: ['I don’t want old and boring frame designs'] }] },
        { m: { k: 'media', shape: 'screen', label: 'Product page', src: `${A}/faq-pdp.webp` }, qs: [{ label: 'Frame specific', q: ['Is this frame durable?', 'Does this frame come with warranty?'] }, { label: 'Frame size', q: ['What is my frame size?'] }] },
        { m: { k: 'media', shape: 'screen', label: 'Lens packages', src: `${A}/faq-lens.webp` }, qs: [{ label: 'Lens package', q: ['Do I really need blue light protection?'] }, { label: 'Power related', q: ['Will this frame support my power? > ±10'] }] },
        { m: { k: 'media', shape: 'screen', label: 'Cart', src: `${A}/faq-cart.webp` }, qs: [{ label: 'Delivery time', q: ['Will this be delivered tomorrow?'] }, { label: 'Return / exchange', q: ['Can I exchange this frame later?'] }] },
      ] },
    ] },
    { id: 'nudges', title: 'Nudges at the hesitation points', blocks: [
      /* his strip (24 Oct, rebuilt): the two nudges on the foot of their phones, B's at the left, Copilot's at the right
         (Nitish's order), the label in a pill between them */
      { k: 'peek', label: 'Copilot motion nudges', of: [
        { label: 'B’s nudge: Talk to B in 8 languages', lottie: `${A}/nudge-talk.json`, ratio: 360 / 80 },
        { label: 'Copilot’s nudge: Curious? Just ask me', lottie: `${A}/nudge-curious.json`, ratio: 1032 / 192 },
      ] },
      { k: 'p', t: ['Copilot solved this by ', { b: 'intervening at exactly these hesitation points' }, ', guiding users step by step, and making decision-making effortless.'] },
      /* the nudges on the three screens, meeting at the help menu — the pills run past the phone, as on his page */
      { k: 'converge', of: [
        phone('nudge-plp.webp', 'Product list with a nudge', { cap: 'PLP', layers: [{ kind: 'image', src: `${A}/pill-fit.webp`, box: [-16.3, 82.1, 132, 17.3], over: true }] }),
        phone('nudge-pdp.webp', 'Product page with a nudge', { cap: 'PDP', layers: [{ kind: 'image', src: `${A}/pill-light.webp`, box: [-16.3, 72.5, 132, 17.1], over: true }] }),
        phone('nudge-lens.webp', 'Lens packages with a nudge', { cap: 'Lens package', layers: [{ kind: 'image', src: `${A}/pill-lens.webp`, box: [-15.8, 69.7, 132, 17.1], over: true }] }),
      ], to: help },
    ] },
    { id: 'versions', title: 'From an assisted flow to B', blocks: [
      { k: 'version', v: 'V1', name: 'Assisted flow',
        text: ['The first Copilot put a person on the line. A help menu over the lens packages offered a video call with a stylist, a voice call or a chat with an eyecare expert; the expert joined over the product page, in a small window the customer could keep open while going through colour and size options, and could share the screen with a code.'],
        of: [help, clip('ringing', 'Finding an eyewear expert'), phone('pdp-expert.webp', 'The expert on the product page'), phone('chat-expert.webp', 'Chat with an expert'), phone('call-expert.webp', 'A video call with the expert'), phone('pdp-pip.webp', 'The expert in a small window over the colour and size options')] },
      { k: 'version', v: 'V2', name: 'Lensa AI',
        text: ['Lensa took the repetitive questions off the experts: an AI buddy in the chat answered them on the spot — power support, the return period, similar frames, weight, warranty — and handed over to a chat, voice or video call with an eyewear expert when a person was needed.'],
        of: [lensa('Hi, I’m Lensa'), phone('chat-lensa-2.webp', 'Lensa’s suggested questions'), clip('ringing', 'Finding an eyewear expert'), phone('pdp-expert.webp', 'The expert on the product page')] },
      { k: 'version', v: 'V1', name: 'Claire AI',
        text: ['Claire moved Copilot from typing to talking: a voice-first assistant with Lenskart’s infinity mark for a face, greeting the customer on the product list, listening and answering — with the expert still a tap away.'],
        of: [clip('claire', 'Claire greeting'), clip('ringing', 'Finding an eyewear expert'), phone('pdp-expert.webp', 'The expert on the product page'), phone('chat-expert.webp', 'Chat with an expert')] },
      { k: 'version', v: 'V2', name: 'B AI',
        text: ['B is Copilot today: a character with states of its own — it connects, listens, thinks and talks. It greets, hears the question, and shows what it found as results that slide up as a sheet while B steps aside, taking the customer to the frame and the cart by voice.'],
        of: [clip('b-intro', 'B connecting and greeting'), phone('b-hi.webp', 'Hi there! I’m B'), phone('b-results.webp', 'B’s results'), phone('b-card.webp', 'A frame B found')] },
    ] },
    { id: 'machine', title: 'State machine: framework for B AI interaction', blocks: [
      { k: 'p', t: ['To ensure smooth development and reduce developer handoff time — every state, every transition between them and how long each takes, in one map, with the rig the developers could run to see each move.'] },
      { k: 'machine' },
    ] },
  ],
};
