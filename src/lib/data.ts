/* Content. Everything marked PLACEHOLDER is to be replaced with real material. */

export type ViewName = 'home' | 'projects' | 'project' | 'micro' | 'campaign' | 'writing' | 'experience';
export const VIEW_ORDER: ViewName[] = ['home', 'projects', 'project', 'micro', 'campaign', 'writing', 'experience'];

export type Project = {
  id: string; title: string; client: string; role: string; year: string;
  letter: string; m1: string; m2: string; wide?: boolean; blurb: string; tags: string[];
};

/* PLACEHOLDER set: these are projects I know exist; confirm which are showable. */
export const PROJECTS: Project[] = [
  { id: 'lenskart-b', title: "B — Lenskart's AI assistant", client: 'Lenskart', role: 'Motion & interaction', year: '2026', letter: 'B', m1: '#7B7EE4', m2: '#DFB3F3', wide: true,
    blurb: 'State Lotties for an AI-assisted eyeglass-buying journey, with the transitions recorded end to end.', tags: ['Lottie', 'State machine', 'Product'] },
  { id: 'coin-rig', title: 'Coin Rig', client: 'LottieFiles Bazaar', role: 'Design & build', year: '2026', letter: 'C', m1: '#F5BD56', m2: '#C94A3A',
    blurb: 'A faux-3D rig as a native Lottie Creator plugin, published on the Bazaar.', tags: ['Plugin', 'Faux 3D', 'Tool'] },
  { id: 'rupee-coin', title: 'Rupee coin flight', client: 'Loading & success state', role: 'Motion design', year: '2026', letter: '₹', m1: '#1F8A70', m2: '#BDE6D9',
    blurb: 'Loading and success states: a coin over a grid road, one rig, two outcomes.', tags: ['Loader', 'Lottie'] },
  { id: 'ridequest', title: 'RideQuest', client: 'Concept', role: 'Interaction & prototype', year: '2026', letter: 'R', m1: '#2E5E8E', m2: '#9A82D6',
    blurb: 'A gamified in-ride experience for a rideshare app, prototyped as a playable concept.', tags: ['Concept', 'Prototype'] },
  { id: 'swiggy-nav', title: 'Swiggy bottom navigation', client: 'Swiggy', role: 'Interaction design', year: '2026', letter: 'S', m1: '#4A4C56', m2: '#F5BD56',
    blurb: 'One hybrid nav across five sub-apps, made consistent through motion.', tags: ['Interaction', 'Navigation'] },
];

export const TOOLS = ['After Effects', 'Lottie', 'Rive', 'Figma', 'Framer', 'Blender', 'JavaScript', 'Spline']; // PLACEHOLDER list

export const SKILLS = ['Interaction design', 'State-machine motion', 'Lottie · Rive', 'Code-driven animation', 'Motion systems & tokens', 'Prototyping'];

export const CLIENTS = ['Blinkit', 'Lenskart', 'MobiKwik'];

/* PLACEHOLDER gradients until the photos arrive */
export const LIFE = [
  { g1: '#5A7BD6', g2: '#DFB3F3', caption: 'Spiti, by bike' },
  { g1: '#2E5E8E', g2: '#BDE6D9', caption: 'Summit day' },
  { g1: '#8CA6C9', g2: '#F4F1FA', caption: 'Snow trek' },
  { g1: '#1F8A70', g2: '#F5BD56', caption: 'Hanoi, on foot' },
  { g1: '#C94A3A', g2: '#F5BD56', caption: "A recipe I'd never tried" },
  { g1: '#4A4C56', g2: '#DFB3F3', caption: 'The trending dish, tried out' },
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
