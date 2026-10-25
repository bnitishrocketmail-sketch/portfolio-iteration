/* A case study's content, as blocks (Case04.tsx lays them out). Text runs are strings with bold spans. */
export type Rich = (string | { b: string })[];
/* a layer over a slot's picture — a Lottie or an image — placed by its box in percent of the slot (left, top, width, height);
   `over` lets it run past the slot's edges (his nudge pills stick out of the phone), drawn outside the slot's clipping */
export type Layer = { kind: 'lottie' | 'image'; src: string; box: [number, number, number, number]; over?: boolean };
/* a slot: its shape, and once filled, its picture or clip (`src`: an image, or an .mp4 with a `poster`), or a Lottie on its
   own (`lottie`, the slot clear behind it), and any layers. `screen`: a phone's top, cut (his FAQ panel's screens) */
export type Media = { k: 'media'; shape: 'wide' | 'video' | 'image' | 'phone' | 'phone-land' | 'small' | 'screen'; ratio?: string; label: string; cap?: string; src?: string; poster?: string; lottie?: string; layers?: Layer[]; crop?: number /* percent of the slot the picture runs past its edges, to hide a clip's own border */ };
/* a step of a flow: a heading, optional text at the left, its screens, optional notes at the right; the steps are wired */
export type Step = { title: string; text?: Block[]; media: Media[]; side?: Block[] };
export type Block =
  | { k: 'p'; t: Rich }
  | { k: 'h'; t: string; center?: boolean }
  | { k: 'ul'; items: Rich[] }
  | { k: 'ol'; items: { lead: string; t: Rich }[] }
  | Media
  | { k: 'figure'; of: Media; width?: 'half' | 'phone' }
  | { k: 'row'; of: Block[]; ratio?: string; align?: 'start' | 'center' }
  | { k: 'phones'; of: Media[] }
  | { k: 'group'; of: Block[] }
  | { k: 'stats'; title?: string; tone?: 'dark'; items: { n: string; l: string }[]; more?: Rich /* on hover the numbers give way to this (his page) */ }
  | { k: 'legend'; items: string[]; colors?: string[] }
  | { k: 'cols'; of: { h: string; p: Rich; ul: Rich[] }[] }
  | { k: 'flow'; steps: Step[] }
  /* one phone with the screens taking turns in it, the other two floating at its sides (the B study's hero) */
  | { k: 'carousel'; of: Media[] }
  /* his FAQ panel: a cut screen over the questions it drew, each under a label */
  | { k: 'faq'; of: { m: Media; qs: { label: string; q: string[] }[] }[] }
  /* two phones seen only at their foot (`show`: the part of the phone in view, 25 by default), their tops fading into the
     card, each with its nudge Lottie near the bottom, running past the screen's sides, a pill between them (the B
     study's nudges, 24 Oct). `ratio`: the Lottie comp's width / height; `screen`: a 720 × 1600 picture behind */
  | { k: 'peek'; label: string; show?: number; screen?: string; at?: number /* the screen picture's fraction (0–1) at the top of the part in view; its foot by default */; of: { label: string; lottie: string; ratio: number; vis?: [number, number, number, number] /* the comp's drawn extent over its loop (x0, x1, y0, y1, fractions), for placing it by what shows */; k?: number /* its drawn width against the screen's less 16dp each side */ }[] }
  /* his ticker (the fintech study's loan journey, 25 Oct): the stages running right to left, slowly, each a phone cut at the
     panel's top with its nudge over the home screen, its card under it. `ratio`: the Lottie comp's width / height; `vis`:
     its drawn card within the comp (x0, x1, y0, y1, fractions), for placing the card itself with the product's padding */
  | { k: 'ticker'; label: string; screen: string; bar: string; of: { label: string; q: string; lottie: string; ratio: number; vis: [number, number, number, number] }[] }
  /* screens in a row, their wires converging on one screen under them (his nudges meeting the help menu) */
  | { k: 'converge'; of: Media[]; to: Media }
  /* a version of the feature: its number and name as chips, a line about it, its screens */
  | { k: 'version'; v: string; name: string; text: Rich; of: Media[] }
  /* the B study's state machine (BMachine.tsx): the framework and the rig, in tabs */
  | { k: 'machine' }
  /* a hero of his two phones in perspective, the screens drawn into them (Fintech3D.tsx: the fintech study's, the campaigns') */
  | { k: 'fintech' } | { k: 'launches' };
export type Section = { id: string; title: string; blocks: Block[]; tone?: 'white' /* a white card, for a clip whose own background is white (the floating phone) */ };
export type Case = {
  id: string; title: string; sub: string; chips: string[];
  facts: { k: string; v: string }[];
  hero?: Media | Block;
  sections: Section[];
};
