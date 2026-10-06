# Iteration log

The record of what each iteration tries, where its elements came from, and what Nitish kept or rejected. Nitish owns the judgement calls; this file is how a future session picks the work up cold.

## Brief (settled 6 Oct 2026)

- Portfolio for a product designer with a niche in motion and interaction; replaces the Framer site. Built in code; Nitish directs, Claude builds.
- Sections: intro (photo, title, one–two lines, tool stack, CV, socials) · projects (tiles → dedicated case-study pages) · micro-interactions showcase · campaign / motion-graphics showcase (separate from micro, visibly different treatment) · about (now the back of the intro card) · workflow (parked, nice-to-have) · writing / research · experience (with a second CV button) · one personal moment (travel, treks, Spiti by bike, Vietnam, the Jimny, cooking and trying new dishes — the thread is "trying things").
- Must-haves: light and dark mode; a dynamic-island assistant that navigates and answers (scripted intents first, model later); a navigation bar with clear selection; **one view at a time on desktop** — the bento fits the viewport, scrolling happens inside containers; project pages keep the intro card (it becomes the project card) and swap the rest for one large case-study container plus one or two side tiles.
- Layout decisions are Claude's (hybrid: references inform styling, composition follows content). Nitish's veto is absolute.
- Working rules: one change at a time, verified before the next; say plainly when something isn't solved; every iteration gets a stated rationale so disagreements override reasons, not guesses.

## References

| # | What | File | Taken | Not taken |
|---|------|------|-------|-----------|
| 1 | Bento portfolio (Dribbble-style, "Jon Daniel") | `docs/refs/ref-1-bento-portfolio.jpg` | sheet-on-field frame; large uniform radius; equal gutters; one colour per tile; corner-bracket glyph (now the hover/selected mark); heavy-vs-light type contrast; mono portrait over colour; the chamfered notch label on the hero card (now the flip affordance); the fused two-colour tile | rotated side nav; giant "Portfolio" word; vanity stats; play-button media chrome |
| 2 | Old iOS notch, screen recording of an agent status (6 Oct) | `docs/refs/ref-2-notch-*.png` | shape hangs from the top edge with flared corners; two lines (muted context over bold status); 3×3 pixel icon that shuffles pattern and changes colour per state, with glow; blur-crossfade on text change; width follows content | the black top bar it hangs from (ours hangs from the sheet edge) |

## 01 Sheet — exploring

Route: `/lab/01-sheet`. Composition: Nitish's requirements + ref 1 styling.

**Tries:** a one-view app shell. Pale sheet on a grey field fills the viewport; the hero card is a permanent left column (a third of the width); the right column holds one view at a time — home bento, projects, project detail, micro, campaign, writing, experience — swapping with a staggered swipe (direction follows the rail order). Views scroll internally; the page never scrolls on desktop. Phones fall back to a scrolling column.

**Decisions so far (Nitish):**
- Build from scratch in code, not Framer. (6 Oct)
- Bento grid for the home; project pages are not bento: persistent card + one big container + one or two side tiles. (6 Oct)
- One view at a time on desktop; scrolling inside containers. (6 Oct)
- Nav on the left, icons with titles beneath, titles always visible for now (icon-only-with-label-on-select kept as a cheap toggle to compare later). (6 Oct)
- Island follows ref 2: notch, not floating pill. (6 Oct)
- About lives on the back of the intro card (hover flip with intent delay on desktop; tap on touch; mobile hint pending a feel test). (6 Oct)

**Decisions so far (Claude, overridable):**
- Hero spans all rows and carries the name, statement, one-liner and actions (v6); micro-interactions get the largest right-hand slot because interaction craft is the product; photo stack above the fold but small; phones: rail becomes a bottom bar; short viewports (~700px tall) scroll the home view ~60px inside the sheet rather than shrinking type further.
- Project mode of the hero is a crossfade for now; the real shared-element morph (card geometry sliding, tiles making way) is a later iteration once layout settles.
- Stack: Vite + React + TypeScript + Motion; plain CSS with tokens. Content as data files.

**Open / pending from Nitish:**
- Swiggy navbar rules ledger (selection and hygiene logic for the rail).
- Feel-test on the phone: swipe speed/stagger/direction; whether project-mode card reads as the same object; flip affordance on touch.
- Content: cutout photo; email; tool list; which projects are showable; campaign pieces; writing links; roles and dates; About copy (current text is a draft); 8–12 photos with one-line captions for the stack.

**Placeholders in the build:** silhouette portrait; `email · placeholder`; tool list; project set (Lenskart B, Coin Rig, Rupee coin, RideQuest, Swiggy nav); campaign reels; writing entries; experience rows; case-study copy; LottieFiles / Instagram / CV links.

**History**
- v1 — bento home as a scrolling page (artifact). Fixed: hairline at the notched corner; hero too tall; stack overlapping its header.
- v2 — restructured into the one-view shell with swapping views and a project detail view.
- v3 — nav moved to a left rail; sheet reclaimed the bottom space.
- v4 — island rebuilt as a notch (ref 2).
- v5 — ported from the single-file artifact into this repo as components; behaviour unchanged, transitions now on Motion (layout-animated rail pill, segmented pill and notch width).
- v6 — (Nitish) title and short description moved into the intro card; the right column is tiles only. Re-laid as micro (wide) · photo stack (tall, suits phone photos) · clients · tools · campaign band full width. CV button and socials moved into the card with the text; the rotating badge moved to the card's top-right.
