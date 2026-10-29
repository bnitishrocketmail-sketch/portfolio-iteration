import type { Case } from './types';

const A = '/cases/swiggy-nav'; /* public/cases/swiggy-nav: his case study's media and prototypes (28 Oct) */

/* The multi-store bottom nav (Nitish, 28 Oct: "add the whole page of our project, what we've done for the Swiggy bottom
   navigation… we'll adapt this on a project page"): his case study, hosted as one page
   (harmonious-entremet-32783e.netlify.app), re-laid in 04 — its words as they are, its sequence of sections, and its five
   live prototypes, each served as its own page and framed beside its words (Proto in Case04.tsx). The reference recording
   of the app today, and the card shuffle's clip cropped to its screen, are the hero. */
export const swiggyNav: Case = {
  id: 'swiggy-nav',
  title: 'Multi-store bottom nav',
  sub: 'One bar, five stores. Two ends of the screen, finally connected.',
  chips: ['Interaction', 'Navigation', 'Motion system'],
  facts: [
    { k: 'Role', v: 'Product motion design' },
    { k: 'Project type', v: 'Interaction & motion redesign' },
    { k: 'Focus', v: 'Interaction hygiene & motion' },
  ],
  /* the app today beside the redesign's card shuffle, on his prototypes' light ground */
  hero: { k: 'phones', of: [
    { k: 'media', shape: 'phone', label: 'The app today: Food, Dineout, Scenes', cap: 'The app today', src: `${A}/today.mp4`, poster: `${A}/today-poster.webp` },
    { k: 'media', shape: 'phone', label: 'The redesign: the card shuffle', cap: 'The redesign', src: `${A}/shuffle.mp4`, poster: `${A}/shuffle-poster.webp` },
  ] },
  sections: [
    {
      id: 'problem', title: 'One bar, five stores',
      blocks: [
        { k: 'p', t: ["Swiggy's super-app runs five stores — Food, Instamart, Dineout, Scenes, Giftables — through a single frame. The store is picked from the tabs at the ", { b: "top" }, " of the screen, and the navigation at the ", { b: "bottom" }, " changes to match it: different items, a different count, sometimes no bar at all. Nothing connects the two ends. The action happens at the top; the bar at the bottom simply becomes something else — a cut, with nothing linking the tap to the result. That is what makes the switch read as jerky and inconsistent. It isn't the consequence of an action, it's a replacement."] },
        { k: 'p', t: ["The redesign makes motion that missing connection. ", { b: "Every switch shows the tab that was tapped producing the bar that answers it" }, " — the store's identity physically travels from the top of the screen to the bottom — so the change reads as cause and effect, carries the store's character, and never breaks the sense of place."] },
      ],
    },
    {
      id: 'architectures', title: 'Every idea is one of two architectures',
      blocks: [
        { k: 'p', t: ["Strip any switching concept to its bones and it answers one question: does ", { b: "each store own its own bar" }, " that replaces the last, or is the bar ", { b: "one persistent thing that transforms" }, "? Everything else is decoration on one of these two. Rather than betting early, both were taken seriously and built to their strongest versions — a usability-first foundation underneath, and expressive iterations on top of each."] },
        { k: 'cols', of: [
          { h: 'Exhibit A · Different bars exchange', p: [{ b: "The claim:" }, " each store really does own a different bar, so the switch should admit it rather than disguise it. ", { b: "The risk:" }, " replacement is precisely what reads as a cut today — it only earns its place if the exchange becomes one continuous physical motion between two bars that both visibly exist."] },
          { h: 'Exhibit B · One bar transforms', p: [{ b: "The claim:" }, " the bar is one object that survives the switch, so a store change is something that happens to it rather than instead of it — there is always something to follow across the gap. ", { b: "The risk:" }, " the stores genuinely do carry different items, so a transform that oversells the sameness can read as a costume change."] },
        ] },
      ],
    },
    {
      id: 'foundation', title: 'Interaction hygiene first',
      blocks: [
        { k: 'proto', n: '00', h: 'The base every idea sits on', p: [["Expression can't rescue a bar that behaves differently each time. So the first version fixes only behaviour: ", { b: "one order of events for every switch" }, ", so the change is learnable rather than surprising; slots that hold their logic whether a store shows five items, two, or none, so a changing item count never feels like a different product; and a select state quiet enough that it never competes with the switch itself. The placeholder squares are deliberate — ", { b: "if the structure only reads once it's dressed, it doesn't work." }, " Every iteration after this inherits this behaviour, which is what lets five different expressions still feel like one app."]], tips: [["Switch stores from the ", { b: "tabs at the top" }, " — that is the whole subject of this study"], ["Open ", { b: "Scenes" }, " — the bar drops away entirely for full-screen"]], src: `${A}/proto/p0.html`, hint: "Tap around — the active icon grows a touch.", title: 'Foundation: interaction hygiene', cap: 'Foundation · live prototype' },
      ],
    },
    {
      id: 'replace', title: 'Exhibit A: replacement as a physical exchange',
      blocks: [
        { k: 'proto', n: 'A1', h: 'Card shuffle', tag: 'depth', p: [["Exhibit A starts by accepting what the product actually does: each store really does have its own bar. The question is then not how to disguise the replacement but ", { b: "how to make it legible" }, " — and depth answers it. The bars are cards in a stack; one comes forward as the other tucks behind, so the swap reads as ", { b: "an exchange between two things that both exist" }, " rather than one thing blinking into another. Nothing is claimed to persist that doesn't, which makes it the most honest way to do a replacement. Its cost is that depth implies an order, and a stack of stores has no order more meaningful than what was opened last."]], tips: [["Switch stores to ", { b: "shuffle the deck" }, " — watch one card arrive as the other tucks away"]], src: `${A}/proto/a1.html`, hint: "Tab across stores — watch the selected bar come forward from the stack.", title: 'A1 card shuffle', cap: 'A1 · live prototype' },
        { k: 'proto', n: 'A2', h: 'Directional slide', tag: 'direction', p: [["The cheapest thing motion can add is orientation. The tabs sit in a row, so the bar can travel along that same row — ", { b: "a switch then also says which way it moved" }, ", and the store order becomes something felt rather than memorised. The reason this iteration matters most to the original problem is the second half: ", { b: "the page content travels with the bar" }, ", in the same direction on the same beat, so top and bottom stop behaving like two separate systems and the whole screen commits to one movement. Which direction is \"forward\" is a convention rather than a truth, so both conventions are built and left side by side to be judged."]], tips: [["Pick a tab to the ", { b: "right" }, " of the active one, then one to the ", { b: "left" }], ["Watch the ", { b: "bar and the page content" }, " travel together, same direction, same beat"]], src: `${A}/proto/a2.html`, hint: "Pick a tab to the right of the active one, then one to the left.", title: 'A2 directional slide', cap: 'A2 · live prototype' },
      ],
    },
    {
      id: 'continuity', title: 'Exhibit B: the continuity thread',
      blocks: [
        { k: 'proto', n: 'B1', h: 'Cavity ball', tag: 'continuity', p: [["If the bar is meant to be one object rather than five, the plainest way to prove it is ", { b: "one element that never leaves" }, ". A ball rides a groove in the bar's top edge, moving to whatever is active and taking the store's colour with it. Because it survives every change — selection, store switch, docked or floating — ", { b: "no switch ever starts from nothing" }, "; there is always a single object to follow, so continuity is carried by presence rather than by performance. That makes it the quietest idea here and the one that holds up best on the hundredth use rather than the first. It also asks the most of the layout: a groove that misses an icon's centre by two pixels is worse than no groove at all."]], tips: [["Tap items — the ball ", { b: "slides inside its groove" }, " instead of jumping"], ["Switch stores — it recolours but ", { b: "never disappears" }], ["Tap the ", { b: "first or last item" }, " — the corner radius flexes so the groove stays on the icon's exact centre"]], src: `${A}/proto/b1.html`, hint: "Tap items and switch stores — the ball slides in its groove and recolours.", title: 'B1 cavity ball', cap: 'B1 · live prototype' },
        { k: 'proto', n: 'B2', h: 'Colour drop', tag: 'gravity', p: [["The opposite argument to B1: instead of one element quietly persisting, ", { b: "one visible event that crosses the gap" }, ". The store's colour ", { b: "leaves the tab that was tapped and falls to the bar" }, ", which takes that colour on impact — and the page content enters on the same beat, so the whole screen changes because of one visible cause. Nothing has to be learned: the tap produced the thing that landed. It also keeps the expression ", { b: "contained to the moment of the switch" }, " — the colour arrives and is gone, never becoming furniture. The trade-off is that this is the loudest idea of the set, and the one that lives or dies on being fast."]], tips: [["Switch stores and watch the colour ", { b: "leave the tab and land on the bar" }]], src: `${A}/proto/b2.html`, hint: "Switch stores — watch the pop go above the tab, then the gravity fall onto the anchor.", title: 'B2 colour drop', cap: 'B2 · live prototype' },
      ],
    },
    {
      id: 'rules', title: 'Motion rules & choreography',
      blocks: [
        { k: 'p', t: ["These rules were written ", { b: "before the first prototype" }, " and every iteration above was built inside them — they are why five different expressions still feel like one product."] },
        { k: 'gaps', of: [
        { h: "One timeline, no seams", p: ["Every compound motion — arcs, shuffles, slides — is sampled as one set of keyframes on a single clock. Velocity never resets mid-flight; nothing reads as two tweens glued together."] },
        { h: "One choreography everywhere", p: ["On any store switch the home morphs first, then the rest fade-and-transform with a stagger — the same order, durations and easing in every version. Count changes (5 → 2 → 0 items) ride the same style, reflowing equal-width slots."] },
        { h: "Motion connects cause to effect", p: ["The disconnect is closed physically: the store's identity travels from the tab that was tapped into the bar that answers — a falling colour, a sliding ball, an exchanging card — never a cut between two unrelated states."] },
        { h: "Disruption is transient and contained", p: ["Expressive elements visit the switch moment and leave. Nothing persistent, nothing standing across the content — delight never taxes usability."] },
        { h: "Physics reads honest", p: ["Rises decelerate, falls accelerate, apexes have zero velocity. If an element pretends to have weight, it obeys it."] },
        { h: "Select state is quiet", p: ["The active icon grows 10%; the highlight never moves or resizes. Its Lottie plays once to its end frame and holds; deselection plays it in reverse. The promo slot loops at highlight size with no highlight — the animation is the content."] },
        { h: "Content joins the choreography", p: ["Page stacks load with the version's own motion — bottom-up with rise, right-to-left with glide, direction-matched with the slide — fade always present, ~70ms stagger between stacks."] },
        { h: "Direction, with capped travel", p: ["Indicators signal the direction of a jump without traversing it: skipping tabs shifts the highlight a few pixels in the travel direction and hands off — it never sweeps across the tabs in between."] },
        { h: "Layout is law", p: ["iPhone metrics, concentric radii, equal-width slots, one bar language (radius 22 · hairline stroke · soft shadow) in docked and floating. Motion bends to alignment — on edge items the cavity keeps the icon's exact centre by flexing the corner radius, never by drifting off-centre."] },
        { h: "One colour system", p: ["Each store is a single hue; base, deep and light tints are formula-generated — the ball, pill, tabs and icon sets all tint themselves from it."] },
        { h: "Reduced motion is honoured everywhere", p: ["Every animation has a snap-state; nothing is only communicated through movement."] },
        { h: "Built to hand off", p: ["Icons are Lottie rigs with explicit play/hold/reverse/loop rules; layout stays native; every motion is decomposed so Rive or Lottie can own the expressive layer without owning the structure."] },
        ] },
        { k: 'p', t: ["The rules came first; the ideas had to earn their place inside them."] },
      ],
    },
  ],
};
