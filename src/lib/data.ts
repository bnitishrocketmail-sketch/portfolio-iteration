/* Content. Everything marked PLACEHOLDER is to be replaced with real material. */

export type ViewName = 'home' | 'projects' | 'project' | 'workflow' | 'motion' | 'lab' | 'articles' | 'micro' | 'campaign' | 'writing' | 'experience';
export const VIEW_ORDER: ViewName[] = ['home', 'projects', 'project', 'micro', 'campaign', 'writing', 'experience'];

export type Project = {
  id: string; title: string; client: string; role: string; year: string;
  letter: string; m1: string; m2: string; wide?: boolean; blurb: string; tags: string[];
  features?: string[]; /* listed beside the visual where there's room (RideQuest's, 23 Oct) */
  featuresTitle?: string; /* the list's heading */
  cover?: { video: string; poster: string; side?: boolean; bg?: string } | { lottie: string; still?: number; bg?: string } | { comp: 'fintech' | 'launches' | 'motion' }; /* the home stack's card plays this on hover (22 Oct): a clip, a Lottie on a ground of its own, or a composed scene (Fintech3D) */
};

/* PLACEHOLDER set: these are projects I know exist; confirm which are showable. */
/* the order is the stack's and the row's: Magic Scale in front, B behind it, Coin Rig at the back for now (Nitish, 22 Oct;
   the other company projects to come) */
export const PROJECTS: Project[] = [
  { id: 'magic-scale', title: 'Magic Scale', client: 'Lenskart', role: 'Product designer — motion', year: '2025', letter: 'M', m1: '#5B8C85', m2: '#CFE0DC',
    blurb: 'A frame (glasses) size measuring tool — patent pending.', tags: ['App feature', 'UX/UI', 'Interaction/Motion'],
    cover: { video: '/cases/magic-scale/hero.mp4', poster: '/cases/magic-scale/hero-poster.webp' } },
  { id: 'lenskart-b', title: "B — Lenskart's AI assistant", client: 'Lenskart', role: 'Motion & interaction', year: '2026', letter: 'B', m1: '#7B7EE4', m2: '#DFB3F3', wide: true,
    blurb: 'State Lotties for an AI-assisted eyeglass-buying journey, with the transitions recorded end to end.', tags: ['Lottie', 'State machine', 'Product'],
    cover: { lottie: 'https://lottie.host/9e427624-628c-46d0-a92d-fc7ca43e2836/VMVaaAYm3M.lottie', still: 300, bg: '#fff' } }, /* B's states back to back (LOTTIES.b), on white, held listening (Nitish, 22 Oct) */
  { id: 'fintech-motion', title: 'Fintech motion', client: 'MobiKwik', role: 'Product designer — motion', year: '2025', letter: 'M', m1: '#2F55E6', m2: '#7A4DF0', wide: true,
    blurb: 'Adaptive loan-journey notifications: contextual motion for every stage of a loan.', tags: ['App feature', 'UX/UI', 'Interaction/Motion'],
    cover: { comp: 'fintech' } }, /* the two phones of its hero, in small (22 Oct) */
  { id: 'launches', title: 'Launches & campaigns', client: 'Lenskart', role: 'Product designer — motion', year: '2025', letter: 'L', m1: '#0B2A15', m2: '#0A1230', wide: true,
    blurb: 'Landing pages, campaign visuals, a 3D product guide and GenAI characters for launches.', tags: ['Promotional', 'Visual communication', 'UI', 'Interaction/Motion'],
    cover: { comp: 'launches' } }, /* the two phones of its hero, in small (22 Oct) */
  { id: 'ar-try-on', title: 'AR try-on', client: 'Lenskart', role: 'Product designer — motion', year: '2025', letter: 'A', m1: '#0E6B5C', m2: '#BFEDE2',
    blurb: 'A contact-lens try-on and frame removal: lens colours compared on your own eye, and an AR try-on for people already wearing glasses.', tags: ['App feature', 'AR', 'Interaction/Motion'] }, /* (26 Oct) its visual, here and in its hero, to come; the year to confirm */
  { id: 'coin-rig', title: 'Coin Rig', client: 'Lottie Creator plugin', role: 'Design & build', year: '2026', letter: 'C', m1: '#F5BD56', m2: '#C94A3A', /* the plugin named where the client was (23 Oct: "mention it is a Lottie Creator plugin") */
    blurb: 'A faux-3D rig as a native Lottie Creator plugin, published on the Bazaar.', tags: ['Lottie Creator plugin', 'Faux 3D', 'Tool'],
    /* his recording of the plugin in Creator, cropped to its panel at square pixels (the recording's are 571:640) (23 Oct) */
    cover: { video: '/cases/coin-rig/panel.mp4', poster: '/cases/coin-rig/panel-poster.webp', side: true, bg: '#111111' },
    featuresTitle: 'A Lottie Creator plugin',
    features: ['A live preview drawn with the projection the build uses', 'Any viewing angle: front, isometric, below', 'Spin or tumble, from any start to any end', 'Timing: once or ping-pong, duration and easing', 'Builds native, editable Creator layers; nothing is baked'] },
  { id: 'ridequest', title: 'RideQuest', client: 'Concept', role: 'Interaction & prototype', year: '2026', letter: 'R', m1: '#2E5E8E', m2: '#9A82D6',
    blurb: 'A gamified in-ride experience for a rideshare app, prototyped as a playable concept.', tags: ['Concept', 'Prototype'],
    cover: { video: '/cases/ridequest/thumb.mp4', poster: '/cases/ridequest/thumb-poster.webp', side: true, bg: '#fff' }, /* his screen recording of the prototype, cropped to the phone on white at its true proportion (the recording's pixels are not square: 27:32) (23 Oct) */
    /* its five parts, as he set them out for the case study (Aug) */
    featuresTitle: 'Gamified Uber ride experience', /* his heading for the list (23 Oct) */
    features: ['Your route as a 3D street-view world', 'A garage: choose, customise and flex your car', 'Riders nearby: wave, challenge, play', 'Route chat rooms: travel updates, nearby picks', 'Live ads: hoardings, banners and store signs from real locations'] },
  { id: 'swiggy-nav', title: 'Swiggy bottom navigation', client: 'Swiggy', role: 'Interaction design', year: '2026', letter: 'S', m1: '#4A4C56', m2: '#F5BD56',
    blurb: 'One hybrid nav across five sub-apps, made consistent through motion.', tags: ['Interaction', 'Navigation'],
    /* his recording of the case study's A1 card shuffle prototype, cropped to the phone on its frame's ground (23 Oct) */
    cover: { video: '/cases/swiggy-nav/nav.mp4', poster: '/cases/swiggy-nav/nav-poster.webp', side: true, bg: '#f3f5f9' },
    /* the case study's heading and its pieces: the hygiene base and the four explorations (A1, A2, B1, B2) */
    featuresTitle: 'One bar, five stores',
    features: ['Interaction hygiene first: the base every idea sits on', 'Card shuffle: the new bar comes forward from the stack', 'Directional slide: bars exchange the way you moved', 'Cavity ball: one element that never leaves', 'Colour drop: the store’s colour crosses the gap'] },
];

/* 04's two lists (Nitish, 23 Oct): Projects holds only the work done on products he worked for; the experiments move to
   the Lab, which takes the Projects page's layout and interaction as they are, in this order. The rupee coin is gone (no
   such project); the Motion system joins the Lab as a project (its page is the Motion system tab) */
const pick = (ids: string[]) => ids.map(id => PROJECTS.find(p => p.id === id)!);
export const PROJECTS04: Project[] = pick(['magic-scale', 'lenskart-b', 'fintech-motion', 'launches', 'ar-try-on']);
export const MOTION_SYSTEM: Project = { id: 'motion-system', title: 'Motion design system', client: 'Motion & interaction system', role: 'Design & build', year: '2026', letter: 'M', m1: '#2f2e30', m2: '#e0e0e0',
  blurb: 'One set of motion decisions, defined once and inherited by every screen.', tags: ['Motion tokens', 'Interaction', 'System'],
  cover: { comp: 'motion' } }; /* its open card plays the system's journey phone beside the three levels (MotionThumb) */
export const LAB04: Project[] = [pick(['swiggy-nav'])[0], MOTION_SYSTEM, ...pick(['coin-rig', 'ridequest'])];

export const TOOLS = ['After Effects', 'Lottie', 'Rive', 'Figma', 'Framer', 'Blender', 'JavaScript', 'Spline']; // PLACEHOLDER list

export const SKILLS = ['Interaction design', 'State-machine motion', 'Lottie · Rive', 'Code-driven animation', 'Motion systems & tokens', 'Prototyping'];

export const CLIENTS = ['Blinkit', 'Lenskart', 'MobiKwik'];

/* PLACEHOLDER gradients until the photos arrive */
/* Off duty (Nitish, 22 Oct): his own photos — the mountains and the road, Vietnam, the gang, the kitchen — cropped to the
   cards' 4:3 with the subject anchored (public/off-duty). The captions are first drafts to rename; the tints stay for
   the iterations that draw the cards as gradients. */
export const LIFE = [
  { src: '/off-duty/husky.webp', g1: '#4A4C56', g2: '#DFB3F3', caption: 'A husky and the hill lights' }, /* first (Nitish, 24 Oct: "the one of me with the husky the default first") */
  { src: '/off-duty/spiti-road.webp', g1: '#5A7BD6', g2: '#DFB3F3', caption: 'A breather on the Spiti road' },
  { src: '/off-duty/chandratal.webp', g1: '#2E5E8E', g2: '#BDE6D9', caption: 'Chandratal, sat still' },
  { src: '/off-duty/summit.webp', g1: '#8CA6C9', g2: '#F4F1FA', caption: 'Summit, first light' },
  { src: '/off-duty/shimla-dusk.webp', g1: '#C94A3A', g2: '#F5BD56', caption: 'Tailing a bus at dusk, Shimla' },
  { src: '/off-duty/orchard.webp', g1: '#1F8A70', g2: '#F5BD56', caption: 'Chasing light in an orchard' },
  { src: '/off-duty/ninh-binh.webp', g1: '#5A7BD6', g2: '#BDE6D9', caption: 'Feet up, Ninh Bình' },
  { src: '/off-duty/non-la.webp', g1: '#2E5E8E', g2: '#F4F1FA', caption: 'Kung fu in a nón lá' },
  { src: '/off-duty/karst-cave.webp', g1: '#1F8A70', g2: '#DFB3F3', caption: 'Ducking through a karst cave' },
  { src: '/off-duty/the-gang.webp', g1: '#C94A3A', g2: '#F4F1FA', caption: 'The gang, one lazy afternoon' },
  { src: '/off-duty/cooking.webp', g1: '#F5BD56', g2: '#C94A3A', caption: 'Two bowls, one experiment' },
];

export const REELS = [ // PLACEHOLDER
  { a: '#F5BD56', b: '#7B7EE4', letter: 'B', name: 'Blinkit', meta: 'promotional set · 0:15', wide: true },
  { a: '#2BC48A', b: '#DFB3F3', letter: 'L', name: 'Lenskart', meta: 'launch film · 0:30' },
  { a: '#5A7BD6', b: '#C94A3A', letter: 'M', name: 'MobiKwik', meta: 'campaign loop · 0:12' },
];

export const WRITING = [ // PLACEHOLDER entries based on real items; links to add
  { title: 'Faux 3D inside Lottie', meta: 'Write-up · LinkedIn', year: '2026', href: '#' },
  { title: 'Coin Rig, a rig as a Creator plugin', meta: 'Published · LottieFiles Bazaar', year: '2026', href: '#' },
  { title: 'Featured on the LottieFiles showreel', meta: 'Feature · LottieFiles', year: '2026', href: '#' },
];

export const EXPERIENCE = [ // PLACEHOLDER roles and dates
  { company: 'Blinkit', role: 'Role · placeholder', years: '20xx–20xx' },
  { company: 'Lenskart', role: 'Role · placeholder', years: '20xx–20xx' },
  { company: 'MobiKwik', role: 'Role · placeholder', years: '20xx–20xx' },
];

export const LINKS = {
  linkedin: 'https://www.linkedin.com/in/nitish-bhardwaj92',
  lottiefiles: '#', // PLACEHOLDER
  instagram: '#',   // PLACEHOLDER
  email: 'email · placeholder', // PLACEHOLDER
  cv: '#',          // PLACEHOLDER
};

export const COPY = {
  eyebrow: 'Motion · Interaction · Code-driven animation',
  lede: 'Interaction, state-machine motion and code-driven animation for products people use every day.',
  aboutTitle: 'Motion is how a product talks.',
  about: "I'm a product designer who works in motion: the transitions, states and micro-interactions that make an interface feel like one thing. Most of it is scripted — expressions, state machines, code-driven rigs — so what ships is what was designed. Lately: faux-3D rigs inside Lottie, a Creator plugin, and assistants with states of their own.", // DRAFT copy
};

export const NAV: { id: Exclude<ViewName, 'project'>; label: string }[] = [
  { id: 'home', label: 'Intro' },
  { id: 'projects', label: 'Projects' },
  { id: 'micro', label: 'Micro' },
  { id: 'campaign', label: 'Campaign' },
  { id: 'writing', label: 'Writing' },
  { id: 'experience', label: 'Experience' },
];
/* 04's nav (Nitish, 16 Oct): Intro, Projects, Workflow (the how-I-work map), Motion system (in Micro's place — the
   micro-interactions are its components), Lab (experiments, the plugin, explorations you can play with) and Articles
   (what he wrote and what was written about him; was Writing). Campaign and Experience are off for now — the CV may
   open a page of where he has worked later. 04 only; the other iterations keep NAV. */
export const NAV04: typeof NAV = [NAV[0], NAV[1], { id: 'workflow', label: 'Workflow' }, { id: 'lab', label: 'Lab' }, { id: 'articles', label: 'Notes' }]; /* Articles renamed Notes (23 Oct): it holds his research, a how-to and the Blinkit feature */
/* (20 Oct) the Motion system left the nav, on both layouts: it is a Lab project now, its page opening from the Lab's card (/lab/04-profile/motion still works) */

export function contextFor(view: ViewName, pid?: string): string {
  if (view === 'project') { const p = PROJECTS.find(p => p.id === pid); return 'Project · ' + (p ? p.title : ''); }
  return ({
    home: 'Home · intro',
    projects: `Projects · ${PROJECTS.length} case studies`,
    micro: 'Micro-interactions · 3 live',
    campaign: `Campaign · ${REELS.length} reels`,
    writing: `Writing · ${WRITING.length} notes`,
    experience: `Experience · ${EXPERIENCE.length} roles`,
  } as Record<string, string>)[view] ?? 'Home';
}
