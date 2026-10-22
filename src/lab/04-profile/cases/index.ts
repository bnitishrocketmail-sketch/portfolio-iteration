import type { Case } from './types';
import magicScale from './magic-scale';

/* the case studies by project id (PROJECTS in data.ts); a project without one opens as "to come" */
export const CASES: Record<string, Case> = { [magicScale.id]: magicScale };
export type { Case, Block, Layer, Media, Rich, Section, Step } from './types';
