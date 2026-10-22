import type { Case, Media } from './types';

/* Designing motion for a fintech product — MobiKwik (22 Oct): read off his Framer page ("Designing Motion for a Fintech
   Product"). The hero is his two phones in perspective, with the screens drawn into them properly this time — the home
   screen with the loan nudge in the left one, the card being prepared in the right — projected onto the screens'
   measured corners and clipped to them (Fintech3D.tsx), which his page could not do. The six loan-journey notifications
   are his cut screens with their Lotties over the banner, under their labels (the FAQ panel's shape). */
const A = '/cases/fintech';
/* a cut home screen with a notification's Lottie over the banner row: the Lotties' canvases differ, so each box is
   sized from its canvas and placed so its card sits on the banner (the row at 43.7% of the screenshot's height) */
const cell = (name: string, w: number, h: number, label: string): Media => {
  const hh = (h / w) / (14.5 / 9) * 100, top = 57.2 - hh / 2;
  return { k: 'media', shape: 'screen', label, src: `${A}/home.webp`, layers: [{ kind: 'lottie', src: `${A}/${name}.lottie`, box: [0, +top.toFixed(1), 100, +hh.toFixed(1)] }] };
};

export const fintech: Case = {
  id: 'fintech-motion',
  title: 'Designing motion for a fintech product',
  sub: 'Adaptive loan-journey notifications for MobiKwik — contextual motion for every stage of a loan.',
  chips: ['App feature', 'UX/UI', 'Interaction/Motion'],
  facts: [
    { k: 'Role', v: 'Product designer — motion' },
    { k: 'Project type', v: 'Feature design' },
    { k: 'Team', v: 'Product design' },
    { k: 'Focus', v: 'UI/UX design collaboration, interaction & motion design ownership' },
  ],
  hero: { k: 'fintech' },
  sections: [
    { id: 'contribution', title: 'Nature of my contribution', blocks: [
      { k: 'p', t: ['I partnered with product designers, PMs and developers to design production-ready motion for multiple fintech journeys. My work included motion strategy, micro-interactions and Lottie optimisation for a smooth developer handoff.'] },
    ] },
    { id: 'loan', title: 'Adaptive loan journey notifications', blocks: [
      { k: 'p', t: ['Designing contextual motion to guide users through every stage of their loan lifecycle — one nudge on the home screen, its card and its motion changing with where the loan is.'] },
      { k: 'faq', of: [
        { m: cell('first-user', 344, 150, 'The loan offer nudge'), qs: [{ label: 'First user', q: ['Encourage eligible users to explore loan offerings.'] }] },
        { m: cell('loan-active', 344, 150, 'The active loan card'), qs: [{ label: 'Loan active', q: ['Keep users informed about their active loan and highlight the next EMI due date.'] }] },
        { m: cell('loan-closed', 340, 160, 'The loan closed card'), qs: [{ label: 'Loan closed', q: ['Celebrate the successful completion of the loan repayment cycle.'] }] },
        { m: cell('disbursed', 360, 240, 'The disbursed card'), qs: [{ label: 'Disbursed', q: ['Confirmation of the approved amount successfully credited to the user’s linked bank account.'] }] },
        { m: cell('emi-overdue', 340, 230, 'The EMI overdue card'), qs: [{ label: 'EMI overdue', q: ['Alert users that an EMI payment is overdue and requires immediate action.'] }] },
        { m: cell('disbursal-pending', 340, 200, 'The disbursal pending card'), qs: [{ label: 'Disbursal pending', q: ['The loan has been approved but the funds are still being processed.'] }] },
      ] },
      { k: 'p', t: ['More work is being added.'] },
    ] },
  ],
};
