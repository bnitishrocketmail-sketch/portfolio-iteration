/* A case study's content, as blocks (Case04.tsx lays them out). Text runs are strings with bold spans. */
export type Rich = (string | { b: string })[];
/* a layer over a slot's picture — a Lottie or an image — placed by its box in percent of the slot (left, top, width, height);
   `over` lets it run past the slot's edges (his nudge pills stick out of the phone), drawn outside the slot's clipping */
export type Layer = { kind: 'lottie' | 'image'; src: string; box: [number, number, number, number]; over?: boolean };
/* a slot: its shape, and once filled, its picture or clip (`src`: an image, or an .mp4 with a `poster`), or a Lottie on its
   own (`lottie`, the slot clear behind it), and any layers. `screen`: a phone's top, cut (his FAQ panel's screens) */
export type Media = { k: 'media'; shape: 'wide' | 'video' | 'image' | 'phone' | 'phone-land' | 'small' | 'screen'; ratio?: string; label: string; cap?: string; src?: string; poster?: string; lottie?: string; layers?: Layer[]; crop?: number /* percent of the slot the picture runs past its edges, to hide a clip's own border */; bg?: string /* the slot's ground behind a Lottie (a screen's own white) */; fit?: { box: [number, number, number, number]; fade?: number } /* a clip placed by its box (left, top, width, height in percent of the slot) instead of covering it — a recording of a phone with its own screen lined up to the slot's — and its foot faded over `fade` percent of its height */ };
/* a step of a flow: a heading, optional text at the left, its screens, optional notes at the right; the steps are wired */
export type Step = { title: string; text?: Block[]; media: Media[]; side?: Block[] };
export type Block =
  | { k: 'p'; t: Rich }
  | { k: 'h'; t: string; center?: boolean }
  | { k: 'ul'; items: Rich[] }
  | { k: 'ol'; items: { lead: string; t: Rich }[] }
  | Media
  | { k: 'figure'; of: Media; width?: 'half' | 'phone' | 'wide' }
  | { k: 'row'; of: Block[]; ratio?: string; align?: 'start' | 'center' }
  | { k: 'phones'; of: Media[] }
  | { k: 'group'; of: Block[] }
  | { k: 'stats'; title?: string; tone?: 'dark'; items: { n: string; l: string }[]; more?: Rich /* on hover the numbers give way to this (his page) */ }
  | { k: 'legend'; items: string[]; colors?: string[] }
  | { k: 'cols'; of: { h: string; p: Rich; ul?: Rich[] }[] }
  | { k: 'flow'; steps: Step[] }
  /* one phone with the screens taking turns in it, the other two floating at its sides (the B study's hero) */
  | { k: 'carousel'; of: Media[] }
  /* his FAQ panel: a cut screen over the questions it drew, each under a label */
  | { k: 'faq'; of: { m: Media; qs: { label: string; q: string[] }[] }[] }
  /* two phones seen only at their foot (`show`: the part of the phone in view, 25 by default), their tops fading into the
     card, each with its nudge Lottie near the bottom, running past the screen's sides, a pill between them (the B
     study's nudges, 24 Oct). `ratio`: the Lottie comp's width / height; `screen`: a 720 × 1600 picture behind */
  | { k: 'peek'; label: string; show?: number; screen?: string; at?: number /* the screen picture's fraction (0–1) at the top of the part in view; its foot by default */; of: { label: string; lottie: string; ratio: number; vis?: [number, number, number, number] /* the comp's drawn extent over its loop (x0, x1, y0, y1, fractions), for placing it by what shows */; k?: number /* its drawn width against the screen's less 16dp each side */ }[] }
  /* the loan journey on one home (the fintech study, 25 Oct; Journey in Case04.tsx): the phone's top with the entry point's
     icon Lottie on its tile (`tile`: the tile's middle x, y and side in the 720-wide home picture), its card at the left;
     the phone's foot with each stage's nudge rising from behind the bottom bar in turn, its card beside it; `text` (headings,
     paragraphs, lists) at the left of both. A stage: `ratio` its comp's width / height, `vis` its drawn card in the comp (x0, x1, y0, y1, fractions),
     `dur` the seconds it stays up */
  | { k: 'journey'; text: { h?: string; p?: Rich; ul?: Rich[] }[]; screen: string; bar: string; of: { label: string; q: string; lottie: string; ratio: number; vis: [number, number, number, number]; dur: number }[]; entry: { label: string; q: string; lottie: string; tile: [number, number, number] } }
  /* the loaders as they sit in the app (25 Oct): a phone each — its ground (a picture, or the app's white), the Lottie in its
     box (percent of the screen), the line under it (`title`, `sub`, at `at`% down; `tone` dark for light text on a dark
     ground) and the dots loader under the line when `dots` */
  | { k: 'loaders'; of: { label: string; cap: string; ground?: string; lottie: string; box: [number, number, number, number]; title: string; sub?: string; at: number; dots?: boolean; tone?: 'dark'; feather?: boolean /* its box's edges faded: a comp whose glows run to its edges */ }[] }
  /* success states, each in its panel: the screen and what it is — a chip (its product), a heading, a line or two; `wide`
     for a desktop screen, which takes the row */
  | { k: 'successes'; of: { m: Media; chip: string; h: string; p?: Rich; ul?: Rich[]; wide?: boolean; top?: boolean /* the media over the words, a pair side by side (the AR study's loading and success Lotties) */ }[] }
  /* what research found, a panel each: its heading and line, and the part of the study that answers it (`to`), when one does */
  | { k: 'gaps'; of: { h: string; p: Rich; to?: string }[] }
  /* a recording in a phone at the middle with its features around it (the AR study's contact-lens try-on, 26 Oct; Tour in
     Case04.tsx): a card each at its side (`side`), lit while the recording shows it (`when`: spans of the clip's seconds),
     a node on the screen where it happens (`at`: x, y as fractions of the screen; 'track' rides the slider's handle, whose
     x over time is `track` at `ty` down; or keyframes [t, x, y]) and a line from the node out of the phone to its card;
     a card's tap plays from its moment */
  | { k: 'tour'; src: string; poster: string; label: string; track?: [number, number][]; ty?: number; of: { chip: string; h: string; p: Rich; side: 'l' | 'r'; when: { t: [number, number]; at: [number, number] | 'track' | [number, number, number][] }[] }[] }
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
  /* a project made with another designer (26 Oct): the contact card becomes his credit — who, his photo, the project on his
     portfolio (`project`) and his portfolio (`site`) */
  collab?: { name: string; role: string; photo: string; project: string; site: string };
};
