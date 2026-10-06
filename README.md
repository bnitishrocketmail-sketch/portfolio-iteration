# imakeuimove

Nitish Bhardwaj's portfolio, rebuilt in code. One view at a time: a persistent intro card, views that swap, a notch-style assistant, a left rail.

- `LOG.md` — the iteration log: brief, references, decisions, placeholders, history. Read it first.
- `/lab` — every iteration as a live page; `src/lab/iterations.ts` is the registry.
- `src/components` — shared parts (hero, island, dock, tiles, micro widgets). Iterations compose these; an element liked in one iteration is reused, not rebuilt.
- `src/lib/data.ts` — content. Items marked PLACEHOLDER are waiting for real material.
- `docs/refs` — the references each iteration draws from.

## Run

```
npm install
npm run dev       # local
npm run build     # type-check + production build
npm run preview   # serve the build
```

Deploys on Vercel; `vercel.json` rewrites every route to the app.

## Working rules

One change at a time, verified before the next. Every layout decision comes with its reason, so disagreements override a reason rather than a guess. Nitish keeps the judgement calls; the build is Claude's.
