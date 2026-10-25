import type { Case } from './types';

/* Designing motion for a fintech product — MobiKwik (22 Oct): read off his Framer page ("Designing Motion for a Fintech
   Product"). The hero is his two phones in perspective, with the screens drawn into them properly this time — the home
   screen with the loan nudge in the left one, the card being prepared in the right — projected onto the screens'
   measured corners and clipped to them (Fintech3D.tsx), which his page could not do. The six loan-journey notifications
   run right to left in his ticker (25 Oct), each a phone with its nudge over the home and its card under it. */
const A = '/cases/fintech';

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
      { k: 'ticker', label: 'The loan journey’s six notifications, running right to left', screen: `${A}/home-blur.webp`, bar: `${A}/home-nav.webp`, of: [
        /* each comp's drawn card (vis), measured over its loop where it is solid (alpha over 95%), so the card is placed, not the comp */
        { label: 'First user', q: 'Encourage eligible users to explore loan offerings.', lottie: `${A}/first-user.lottie`, ratio: 344 / 150, vis: [.003, .997, .2, .8] },
        { label: 'Loan active', q: 'Keep users informed about their active loan and highlight the next EMI due date.', lottie: `${A}/loan-active.lottie`, ratio: 344 / 150, vis: [.003, .997, .2, .8] },
        { label: 'Loan closed', q: 'Celebrate the successful completion of the loan repayment cycle.', lottie: `${A}/loan-closed.lottie`, ratio: 340 / 160, vis: [0, 1, .25, .75] },
        { label: 'Disbursed', q: 'Confirmation of the approved amount successfully credited to the user’s linked bank account.', lottie: `${A}/disbursed.lottie`, ratio: 360 / 240, vis: [.04, .969, .321, .685] },
        { label: 'EMI overdue', q: 'Alert users that an EMI payment is overdue and requires immediate action.', lottie: `${A}/emi-overdue.lottie`, ratio: 340 / 230, vis: [0, 1, 0, .835] },
        { label: 'Disbursal pending', q: 'The loan has been approved but the funds are still being processed.', lottie: `${A}/disbursal-pending.lottie`, ratio: 340 / 200, vis: [0, 1, 0, .84] },
      ] },
      { k: 'p', t: ['More work is being added.'] },
    ] },
  ],
};
