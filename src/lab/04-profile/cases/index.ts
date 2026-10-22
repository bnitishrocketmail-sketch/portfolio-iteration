import type { Case } from './types';
import magicScale from './magic-scale';
import { lenskartB } from './lenskart-b';
import { fintech } from './fintech';
import { launches } from './launches';

/* the case studies by project id (PROJECTS in data.ts); a project without one opens as "to come" */
export const CASES: Record<string, Case> = { [magicScale.id]: magicScale, [lenskartB.id]: lenskartB, [fintech.id]: fintech, [launches.id]: launches };
export type { Case, Block, Layer, Media, Rich, Section, Step } from './types';
