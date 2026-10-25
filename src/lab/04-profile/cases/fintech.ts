import type { Case } from './types';

/* Designing motion for a fintech product — MobiKwik (22 Oct): read off his Framer page ("Designing Motion for a Fintech
   Product"). The hero is his two phones in perspective, with the screens drawn into them properly this time — the home
   screen with the loan nudge in the left one, the card being prepared in the right — projected onto the screens'
   measured corners and clipped to them (Fintech3D.tsx), which his page could not do. The six loan-journey notifications
   rise in turn from behind the bottom bar of one home, under its entry point's flipping icon (25 Oct). */
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
      { k: 'journey', text: [
          { p: ['Designing contextual motion to guide users through every stage of their loan lifecycle.'] },
          { h: 'One slot, six states', p: ['A single nudge lives on the home screen, just above the bottom bar. Its card, its message and its motion change with where the user’s loan is.'] },
          { h: 'Through the lifecycle', ul: [
            [{ b: 'Before a loan' }, ' — First user: an invitation to explore the loans they are eligible for.'],
            [{ b: 'Getting the money' }, ' — Disbursal pending while the funds are processed, then Disbursed when they reach the bank account.'],
            [{ b: 'Repaying' }, ' — Loan active with the next EMI date, and EMI overdue when a payment is due and missed.'],
            [{ b: 'Closing' }, ' — Loan closed, celebrating the end of the repayment cycle.'],
          ] },
          { h: 'Motion that carries the tone', p: ['Each state moves its own way: a clock while the funds are on their way, cash arriving when they land, an EMI schedule for an active loan, a siren for an overdue EMI, a bar filling to 100% when the loan closes.'] },
          { h: 'An entry point up top', p: ['Before any of it, the home’s top grid has a way in: the Pay Mobile / UPI ID icon flips over to show “Get ₹100”.'] },
        ],
        screen: `${A}/home.webp`, bar: `${A}/home-nav.webp`,
        entry: { label: 'Entry point', q: 'One of the entry points: on the home screen, the Pay Mobile / UPI ID icon flips over to show “Get ₹100”.', lottie: `${A}/entry-upi.lottie`, tile: [119, 303, 109] },
        of: [
          /* each comp's drawn card (vis), measured over its loop where it is solid (alpha over 95%), so the card is placed, not the comp; up for one play of its Lottie, kept to 4.5–6.5 s; in the loan's order */
          { label: 'First user', q: 'Encourage eligible users to explore loan offerings.', lottie: `${A}/first-user.lottie`, ratio: 344 / 150, vis: [.003, .997, .2, .8], dur: 4.5 },
          { label: 'Disbursal pending', q: 'The loan has been approved but the funds are still being processed.', lottie: `${A}/disbursal-pending.lottie`, ratio: 340 / 200, vis: [0, 1, 0, .84], dur: 5 },
          { label: 'Disbursed', q: 'Confirmation of the approved amount successfully credited to the user’s linked bank account.', lottie: `${A}/disbursed.lottie`, ratio: 360 / 240, vis: [.04, .969, .321, .685], dur: 6.5 },
          { label: 'Loan active', q: 'Keep users informed about their active loan and highlight the next EMI due date.', lottie: `${A}/loan-active.lottie`, ratio: 344 / 150, vis: [.003, .997, .2, .8], dur: 6.5 },
          { label: 'EMI overdue', q: 'Alert users that an EMI payment is overdue and requires immediate action.', lottie: `${A}/emi-overdue.lottie`, ratio: 340 / 230, vis: [0, 1, 0, .835], dur: 4.5 },
          { label: 'Loan closed', q: 'Celebrate the successful completion of the loan repayment cycle.', lottie: `${A}/loan-closed.lottie`, ratio: 340 / 160, vis: [0, 1, .25, .75], dur: 6.5 },
        ] },
      { k: 'p', t: ['More work is being added.'] },
    ] },
  ],
};
