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
| 3 | Dense agency bento on a black field ("CUBO", pink) | `docs/refs/ref-3-field-bento.jpg`; hi-res copy `ref-3-field-bento-hires.webp` (8 Oct) | the whole layout: 4 columns (27/29/29/27) × 4 rows (24/18.5/19.5/20.5), 1200×900 field, 15px margins, ~17px gaps, radius ~2%; the person cut out in the centre tile with their head rising over the row above (~47% of the tile), standing on a lighter disc ~1.1× the tile's height centred at 42% of it, clipped by the disc's lower half only, a thin ring ~7% outside the disc (seen on the hi-res copy; built on 02b); floating UI cards around the person (the Adobe-style placement Nitish described); black statement pills; oval photos; big-number tiles; type hierarchy (big numbers ~5.5% of width, mid ~3.8%, pills ~2.5%, titles ~1.85%, labels ~1.35%); its named face Sk-Modernist (Outfit stands in until self-hosted) | the pink palette (ours: ocean green + sky blue, for Nitish's photo); the agency copy and stats |
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

**Tries:** everything on one grid, no sheet, no nav. Black field, 4:3, scaled to the viewport. The person cut out in the centre tile, looking into his phone, with what he's looking at and what he's built floating close to the body (the assistant on liquid glass over his arm, the coin behind his shoulder, his name and a line about him over the shirt); the head rises over the row above, as in the reference. Long tiles carry motion: the bottom-right tile runs a ticker of Lotties (placeholders now). The island hangs from the top of the field in the field's own black (ref 2, merged).

**What goes where (Claude's call, overridable):**
- top-left tall → Experience: a ring (years, placeholder) + "3 products shipped with…" + View CV
- bottom-left → the statement in black pills + two oval photos (life)
- top centre → Micro-interactions (count + live like) and Projects (count; opens its own bento later)
- centre → hero
- right tall → "Motion for products people use every day" + client avatars + a shipped count (placeholder)
- right small → brand mark + wordmark + LinkedIn / LottieFiles / Notes
- bottom centre → Stack with four animated swatches (the reference's "Font" tile)
- bottom right wide → headline + the Lottie ticker

**Decisions (Nitish, 7 Oct):** desktop width 1200–1440 with safe margins (Studio Display in mind), no horizontal scroll, no vertical scroll; no navigation bar on this iteration; no bezel or border around the bento, only the sheet's shadow on the grey page; no island / notch on this version (the assistant's form here is undecided, revisit later); projects as a tile that opens a bento (later, not now); assets around the person are his own small animations, one on a glass background; palette ocean green + sky blue instead of pink; long horizontal tiles can carry a running ticker of Lotties.

**Placeholders:** all numbers (7+, 3, 32, 05/+2, 54/+40%); the oval photos; the ticker thumbnails; links; in the hero, the "B" assistant is a CSS stand-in that walks four states (idle → listening → thinking → replying) until the Lottie arrives, and the coin is the canvas rig from 01 until its Lottie arrives. Sk-Modernist to self-host (free licence) if Outfit isn't close enough.

**Open:** phone layout is a first pass (column, hero keeps its proportions); the projects bento and its transition; which real Lotties go in the ticker and around the person; the life tile's pills still say "Product designer." now that the hero's title card does too — decide whether the pills change; one or two more Lotties for the hero (slots left: top-centre-right above the shoulder, lower-left under the assistant).

### Hero card — spec (Nitish, 7 Oct; built in v6)

1. **Photo.** Body facing front, looking into the phone (as ref 3's person does); centre-aligned, no more right offset. Second photo received 7 Oct (`docs/refs/photo-2-phone-pose.jpg`): this pose on a dark grey studio background; the same pose on the green screen followed (`docs/refs/photo-2-phone-pose-green.png`) and was keyed for v6; since v7 the file in use is Nitish's own cutout of the pose (`docs/refs/photo-3-phone-pose-cutout.png`), bottom 20% trimmed, stored as WebP with alpha (`src/assets/nitish-phone-cutout.webp`, 685 × 996).
2. **Meaning.** The assets floating around him stand for what he's looking at on the phone and what he's built. No extra visual device to say so; the floating cards do it exactly as ref 3 does.
3. **Placement.** Cards sit close to the body, not far out: some behind him (masked by the body), some in front, overlapping the shirt. What to do with the card's remaining width is decided later.
4. **Glass.** The glass card becomes more transparent; preferred: liquid glass.
5. **The cards (Lotties to come from Nitish; placeholders until then):**
   - liquid-glass card: the "B" assistant Lottie, all states played back to back; a static label, e.g. "AI assistant interaction"; no dynamic text.
   - a card with the faux-3D coin turning (perspective, elevation, depth) — his Lottie; the canvas coin stands in.
   - title card: his name + the title with a rolling word. Two variants given: (a) "Product designer" → the second word rolls designer → motion → interaction; (b) "Product motion design" → the middle word rolls motion → interaction, "Product" and "design" static. **Nitish picked (a)** (7 Oct); built: "Product" static, the word rises in as the last one leaves upward, 2.4 s per word, ocean green, still under reduced motion.
   - description card: one or two lines on what he does (01's lede length), placed next to the title card.
   - one or two more Lotties later.
6. The current stand-in cards (play count, easing bars, switch) give way to this set.

### 02b — the same grid in 01's palette (sub-iteration, Nitish, 8 Oct)

Route: `/lab/02b-field`, same component as 02 with `palette="01"`; only colour tokens change (`.it02.pal-01` in field.css), so every layout change to 02 carries over. Role mapping (Claude's call, overridable): quiet tiles lilac, accent tiles (life, brand) mint, the hero tile periwinkle like 01's hero card, periwinkle as the accent (ring, rolling word, deltas, Lottie/Rive chips), blush and amber for the small shapes, coal pills; the projects tile reads as a quiet tile here. Dark mode uses 01's dark tokens. The placeholder colours in 02 (ticker thumbnails, avatars, swatches, ovals) became tokens so both palettes drive them.

**02b history**
- b2 — (Nitish, 8 Oct, from the hi-res ref 3) the hero's circle: a lighter disc behind the figure clipped to the tile, two thin rings just outside it (the second fainter), the figure masked by the disc's lower half only so the head stays free; the head now rises 45% of the tile (was 57%; the ref: ~47%), the figure 1.5× the tile and clipped at the circle. Geometry is driven by the tile's measured px size (`--hh`, `--rise`), phones use a smaller rise.
- b1 — the palette swap.

**History**
- v7 — (Nitish) his own cutout replaces the keyed one (`docs/refs/photo-3-phone-pose-cutout.png`, alpha included, softer edge); the figure's bottom 20% trimmed (hem and pocket go, the tile now cuts at the lower shirt) and the figure sized up: ~1.57× the tile's height, head to within ~30px of the sheet's top. Asked for 1.5× on the earlier size; that would put the head outside the sheet, so this is the most the top edge allows — `.person-clip { top }` and `.person { height }` in field.css are the two numbers. Side cards nudged outward for the wider figure. Phones: the figure is wider than the tile, so the sleeves clip at its sides.
- v6 — (Nitish) the hero card rebuilt to the spec above, in one pass: the green-screen phone pose keyed and centred (1.5× the tile, head over the row above, waist clipped by the tile); four cards close to the body — the assistant on liquid glass over his right arm (in front; the arm shows through blurred), the coin tucked behind his left shoulder (masked by the figure), the title card over the shirt bottom-left, the description card bottom-right; the play, easing-bars and switch cards gone. Liquid glass: near-clear fill, 18px blur with lifted saturation, a bright rim that catches light top-left, a soft inner glow; dark-mode variants. Phones: the same four cards, smaller; title above-left, description below-right so they never meet.
- v1 — first build of the home grid from ref 3.
- v2 — (Nitish) background and shadows as in 01: near-white sheet on the grey page, 01's shadow.
- v3 — (Nitish) bezel and island removed from this iteration.
- v5 — phone fixed: the size-contained container collapsed to its padding on phones (only the top tile showed); phones now use an inline-size container, hero first with the head rising into the top padding.
- v4 — (Nitish) sizing: width-driven 1200–1440px, no horizontal or vertical scroll; the sheet's aspect follows the screen between 4:3 and 1.7:1; narrower or shorter viewports scale the whole 1200px layout down instead of reflowing; tall pieces also capped by the sheet's height. Phones unchanged. The real photo keyed off its green screen (despilled, edges softened) and placed at the reference's size, ~1.5× the hero tile, head over the row above; the frame's right cut fades out, the waist is clipped by the tile.
