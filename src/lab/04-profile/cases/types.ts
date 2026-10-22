/* A case study's content, as blocks (Case04.tsx lays them out). Text runs are strings with bold spans. */
export type Rich = (string | { b: string })[];
/* a layer over a slot's picture — a Lottie or an image — placed by its box in percent of the slot (left, top, width, height) */
export type Layer = { kind: 'lottie' | 'image'; src: string; box: [number, number, number, number] };
/* a slot: its shape, and once filled, its picture or clip (`src`: an image, or an .mp4 with a `poster`) and any layers */
export type Media = { k: 'media'; shape: 'wide' | 'video' | 'image' | 'phone' | 'phone-land' | 'small'; ratio?: string; label: string; cap?: string; src?: string; poster?: string; layers?: Layer[]; crop?: number /* percent of the slot the picture runs past its edges, to hide a clip's own border */ };
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
  | { k: 'flow'; steps: Step[] };
export type Section = { id: string; title: string; blocks: Block[]; tone?: 'white' /* a white card, for a clip whose own background is white (the floating phone) */ };
export type Case = {
  id: string; title: string; sub: string; chips: string[];
  facts: { k: string; v: string }[];
  hero?: Media;
  sections: Section[];
};
