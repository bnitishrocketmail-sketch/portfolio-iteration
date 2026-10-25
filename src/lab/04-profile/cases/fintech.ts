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
          { h: 'One slot, six states', p: ['A single nudge above the home’s bottom bar changes its card, message and motion with where the loan is.'] },
          { h: 'Through the lifecycle', ul: [
            [{ b: 'Before a loan' }, ' — First user: an invitation to explore eligible loans.'],
            [{ b: 'Getting the money' }, ' — Disbursal pending, then Disbursed.'],
            [{ b: 'Repaying' }, ' — Loan active, and EMI overdue when a payment is missed.'],
            [{ b: 'Closing' }, ' — Loan closed.'],
          ] },
          { h: 'A reminder up top', p: ['For users who saw the First user nudge but didn’t act on it, the Pay Mobile / UPI ID icon flips over to “Get ₹100” — a reminder, if they want it.'] },
        ],
        screen: `${A}/home.webp`, bar: `${A}/home-nav.webp`,
        entry: { label: 'Entry point', q: 'For users who saw the First user nudge but didn’t act on it: the Pay Mobile / UPI ID icon flips over to show “Get ₹100”.', lottie: `${A}/entry-upi.lottie`, tile: [119, 303, 109] },
        of: [
          /* each comp's drawn card (vis), measured over its loop where it is solid (alpha over 95%), so the card is placed, not the comp; up for one play of its Lottie, kept to 4.5–6.5 s; in the loan's order */
          { label: 'First user', q: 'Encourage eligible users to explore loan offerings.', lottie: `${A}/first-user.lottie`, ratio: 344 / 150, vis: [.003, .997, .2, .8], dur: 4.5 },
          { label: 'Disbursal pending', q: 'The loan has been approved but the funds are still being processed.', lottie: `${A}/disbursal-pending.lottie`, ratio: 340 / 200, vis: [0, 1, 0, .84], dur: 5 },
          { label: 'Disbursed', q: 'Confirmation of the approved amount successfully credited to the user’s linked bank account.', lottie: `${A}/disbursed.lottie`, ratio: 360 / 240, vis: [.04, .969, .321, .685], dur: 6.5 },
          { label: 'Loan active', q: 'Keep users informed about their active loan and highlight the next EMI due date.', lottie: `${A}/loan-active.lottie`, ratio: 344 / 150, vis: [.003, .997, .2, .8], dur: 6.5 },
          { label: 'EMI overdue', q: 'Alert users that an EMI payment is overdue and requires immediate action.', lottie: `${A}/emi-overdue.lottie`, ratio: 340 / 230, vis: [0, 1, 0, .835], dur: 4.5 },
          { label: 'Loan closed', q: 'Celebrate the successful completion of the loan repayment cycle.', lottie: `${A}/loan-closed.lottie`, ratio: 340 / 160, vis: [0, 1, .25, .75], dur: 6.5 },
        ] },
    ] },
    /* the loaders and success states (25 Oct, Nitish: "loaders that I've made throughout the app journeys … also success
       states … built for flows when I worked with MobiKwik"; then: "the verifying documents loader … inside a phone screen
       … similar to the card loader in the hero … put that one here too … the bank fetch loader will also have content
       written below it … write a little bit about every success state … a different structure"): the loaders in phones as
       the app shows them — the card being prepared (the hero's right-hand screen), verifying documents laid out the same,
       bank fetch on the ground taken from his other export of it with its line on the dark below the tiles; then the
       success states in panels with what each is — the Zaakpay payment on desktop (the coin from the 3D coin thread played
       straight from loading into success, its jerks smoothed out), the UPI pinless clip and the rocket from his old page's
       Motion creatives. Each Lottie set to cover its screen where the comp is shorter than the phone (360 × 760 / 700); the documents scanner a little wider than the card (its bed runs to the comp's edges, so they sit off the screen). */
    { id: 'states', title: 'Loaders and success states', blocks: [
      { k: 'p', t: ['Loaders for the waits in the app’s journeys — finding banks, verifying documents, preparing a card, confirming a payment — and the success states that close them.'] },
      { k: 'h', t: 'Loaders' },
      { k: 'loaders', of: [
        { label: 'Card being prepared: a machine printing the card', cap: 'Card being prepared', lottie: `${A}/card.lottie`, box: [5, 26, 90, 31.15], title: 'Your card is being prepared and could take up to 10 minutes.', sub: 'We will notify you once it’s ready', at: 55, dots: true },
        { label: 'Verifying documents: a scanner passing over the documents', cap: 'Verifying documents', lottie: `${A}/verify-docs.lottie`, box: [-3, 23.2, 106, 36.69], title: 'Verifying your documents. This could take up to 10 minutes.', sub: 'We will notify you once it’s ready', at: 55, dots: true },
        { label: 'Bank fetch: bank tiles running past while the app finds the user’s banks', cap: 'Bank fetch', ground: `${A}/bank-fetch-bg.webp`, lottie: `${A}/bank-fetch.lottie`, box: [-1.316, 0, 102.632, 100], title: 'Fetching your bank details', at: 74, tone: 'dark' },
      ] },
      { k: 'h', t: 'Success states' },
      { k: 'successes', of: [
        { wide: true, chip: 'Zaakpay', h: 'Payment confirmed, on desktop', m: { k: 'media', shape: 'video', label: 'Zaakpay payment on desktop: the rupee coin flying while the payment is confirmed, then launching into the success mark', lottie: `${A}/coin-payment.lottie`, bg: '#fcfcfe' },
          p: ['While the payment is confirmed, a rupee coin flies over the road. When it goes through, the coin winds up, launches into the distance and becomes the tick — the wait and the win as one motion. Built as a Lottie state machine, so the loading loop hands over to the success whenever the payment goes through.'] },
        { chip: 'UPI pinless', h: 'Face ID payments switched on', m: { k: 'media', shape: 'phone', label: 'UPI pinless: the fingerprint turning into a shield and tick, then the account to activate', src: `${A}/upi-pinless.mp4`, poster: `${A}/upi-pinless-poster.webp` },
          p: ['Enabling pinless UPI payments: the fingerprint resolves into a shield and a tick, then the sheet rises to pick the account to activate Face ID on.'] },
        { chip: 'Lens Pro', h: 'Benefits unlocked', m: { k: 'media', shape: 'phone', label: 'A rocket lifting off into the congratulations', bg: '#03301a', layers: [{ kind: 'lottie', src: `${A}/rocket-success.lottie`, box: [-5.714, 0, 111.429, 100] }] },
          p: ['A rocket lifts off and bursts into the congratulations: the member can now use the exclusive benefits of Lens Pro.'] },
      ] },
      { k: 'p', t: ['More work is being added.'] },
    ] },
  ],
};
