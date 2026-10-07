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
| 1 | Bento portfolio (Dribbble-style, "Jon Daniel") | `docs/refs/ref-1-bento-portfolio.jpg` | sheet-on-field frame; large uniform radius; equal gutters; one colour per tile; corner-bracket glyph (now the hover/selected mark); the three-family type mix — a wide face with squared counters and cut terminals for display words and numbers (Krona One), a tight grotesque for the name (Instrument Sans, light lead-in over bold), a round geometric for labels, body and nav (Outfit); no monospace; the sheet's 1.69:1 aspect, the 35% hero, the 2.8% gaps and the type scale relative to the sheet; mono portrait over colour; the chamfered notch label on the hero card (now the flip affordance); the fused two-colour tile; **the rotated side nav in the sheet's left margin, as-is (Nitish), plus a travelling highlight** | giant "Portfolio" word; vanity stats; play-button media chrome |
| 3 | Dense agency bento on a black field ("CUBO", pink) | `docs/refs/ref-3-field-bento.jpg` | the whole layout: 4 columns (27/29/29/27) × 4 rows (24/18.5/19.5/20.5), 1200×900 field, 15px margins, ~17px gaps, radius ~2%; the person cut out in the centre tile with their head rising over the row above; floating UI cards around the person (the Adobe-style placement Nitish described); black statement pills; oval photos; big-number tiles; type hierarchy (big numbers ~5.5% of width, mid ~3.8%, pills ~2.5%, titles ~1.85%, labels ~1.35%); its named face Sk-Modernist (Outfit stands in until self-hosted) | the pink palette (ours: ocean green + sky blue, for Nitish's photo); the agency copy and stats |
| 2 | Old iOS notch, screen recording of an agent status (6 Oct) | `docs/refs/ref-2-notch-*.png` | shape hangs from the top edge with flared corners; two lines (muted context over bold status); 3×3 pixel icon that shuffles pattern and changes colour per state, with glow; blur-crossfade on text change; width follows content | the black top bar it hangs from (ours hangs from the sheet edge) |

## 01 Sheet — parked (7 Oct)

Route: `/lab/01-sheet`. Composition: Nitish's requirements + ref 1 styling.

**Tries:** a one-view app shell. Pale sheet on a grey field fills the viewport; the hero card is a permanent left column (a third of the width); the right column holds one view at a time — home bento, projects, project detail, micro, campaign, writing, experience — swapping with a staggered swipe (direction follows the rail order). Views scroll internally; the page never scrolls on desktop. Phones fall back to a scrolling column.

**Decisions so far (Nitish):**
- Build from scratch in code, not Framer. (6 Oct)
- Bento grid for the home; project pages are not bento: persistent card + one big container + one or two side tiles. (6 Oct)
- One view at a time on desktop; scrolling inside containers. (6 Oct)
- Nav: the reference's rotated-label side nav, exactly as designed, inside the centred layout (not pinned to the window edge); the only addition is the selected-state highlight. Phones keep a bottom bar. (6 Oct, supersedes the earlier icon rail)
- Island follows ref 2: notch, not floating pill. (6 Oct) One line only, merged into a thin grey bezel around the whole layout; on phones no bezel, island is a pill at the top-left. (7 Oct)
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
- v10 — (Nitish) proportions measured off ref 1 and applied: the sheet keeps the reference's 1.69:1 aspect and floats centred; hero 35% of the sheet; gaps and radii 2.1% of its width; type scales from the sheet's width (name 4.3%, lead-in 2.9%, labels 1.35%, nav 1.15%). Fonts re-identified against the crop: Krona One for display words and numbers (squared counters, cut terminals), Instrument Sans for the name, Outfit for labels/body. Right column re-split like the reference: wide media tile + narrow stat column, square + fused band below.
- v9 — (Nitish) nav centred vertically; pill travel fixed (the label rotates, not the button, so the shared-layout pill measures in normal space) and given a fixed-duration slide so far jumps are faster rather than longer; bezel 2px thinner and grey, island the same grey; phones drop the bezel and the island becomes a pill at the top-left.
- v8 — (Nitish) a thin device bezel around the sheet, in the island colour; the notch hangs from the bezel's inner edge so the two merge (the reference's black bar). Island cut to one line — the context line is gone; status still swaps in place.
- v7 — (Nitish) fonts re-assessed against ref 1 and matched: Unbounded / Inter / Outfit, mono dropped, sizes retuned for the wide display face. Nav rebuilt as the reference's rotated side nav inside the sheet, with the travelling pill; island re-centred over the sheet.
- v6 — (Nitish) title and short description moved into the intro card; the right column is tiles only. Re-laid as micro (wide) · photo stack (tall, suits phone photos) · clients · tools · campaign band full width. CV button and socials moved into the card with the text; the rotating badge moved to the card's top-right.

## 02 Field — exploring

Route: `/lab/02-field`. Composition: ref 3's grid, Nitish's content, ocean/sky palette.

**Tries:** everything on one grid, no sheet, no nav. Black field, 4:3, scaled to the viewport. The person cut out in the centre tile with live assets floating around them (coin on a glass card, a play card, an easing-bars card, the live switch); the head rises over the row above, as in the reference. Long tiles carry motion: the bottom-right tile runs a ticker of Lotties (placeholders now). The island hangs from the top of the field in the field's own black (ref 2, merged).

**What goes where (Claude's call, overridable):**
- top-left tall → Experience: a ring (years, placeholder) + "3 products shipped with…" + View CV
- bottom-left → the statement in black pills + two oval photos (life)
- top centre → Micro-interactions (count + live like) and Projects (count; opens its own bento later)
- centre → hero
- right tall → "Motion for products people use every day" + client avatars + a shipped count (placeholder)
- right small → brand mark + wordmark + LinkedIn / LottieFiles / Notes
- bottom centre → Stack with four animated swatches (the reference's "Font" tile)
- bottom right wide → headline + the Lottie ticker

**Decisions (Nitish, 7 Oct):** no navigation bar on this iteration; no bezel or border around the bento, only the sheet's shadow on the grey page; no island / notch on this version (the assistant's form here is undecided, revisit later); projects as a tile that opens a bento (later, not now); assets around the person are his own small animations, one on a glass background; palette ocean green + sky blue instead of pink; long horizontal tiles can carry a running ticker of Lotties.

**Placeholders:** all numbers (7+, 3, 32, 05/+2, 54/+40%, 26,807); the oval photos; the ticker thumbnails; links. Sk-Modernist to self-host (free licence) if Outfit isn't close enough.

**Open:** phone layout is a first pass (column, hero keeps its proportions); the projects bento and its transition; which real Lotties go in the ticker and around the person.

**History**
- v1 — first build of the home grid from ref 3.
- v2 — (Nitish) background and shadows as in 01: near-white sheet on the grey page, 01's shadow.
- v3 — (Nitish) bezel and island removed from this iteration. The real photo keyed off its green screen (despilled, edges softened) and placed at the reference's size, ~1.5× the hero tile, head over the row above; the frame's right cut fades out, the waist is clipped by the tile.
