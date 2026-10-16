# Motion Design System: content architecture and creative brief

## 0. Instructions for Claude

Create a portfolio page or section that explains Nitish's motion design system framework for everyday digital products. Use this document as the content and structural source of truth. Give the presentation your own visual interpretation.

The intended audience includes design hiring managers, product designers, motion designers, engineers and design-system teams. A viewer should quickly understand the overall system, then be able to explore how it informs actual interaction design and implementation.

### What to preserve

- The eight conceptual layers and the relationships between them.
- The distinction between a shared core, a product-specific motion profile and platform implementations.
- Both the designer and developer perspectives.
- Application states, interruptions, recovery and accessibility as core system concerns.
- The distinction between established framework rules and illustrative parameter values.
- The explanations behind the diagrams. No relationship should depend on colour, position or animation alone.

### Creative freedom

- Choose typography, colour, layout, navigation, visual metaphors, diagrams and interaction design.
- Adapt to the existing portfolio's style and technology when those are available.
- Refine the wording and section titles while preserving their meaning.
- Use progressive disclosure or interactive demonstrations if they help understanding.
- Combine related sections visually or change their presentation order when the relationships remain clear.

The eight layers are conceptual categories, not eight mandatory screens or webpages. Do not reproduce the PDF's page breaks or card layouts by default. The PDF is an optional visual reference; this document is self-contained.

### Scope and factual boundaries

Present this as a motion-system framework and example interaction specifications. The supplied material does not establish a shipped component library, measured results, user research findings or implementation at a named company. Do not invent those claims.

The immediate deliverable is the portfolio presentation of the system. Production SDKs, platform adapters and complete component libraries are described as system deliverables, not supplied implementations. If you create a demonstration, identify it as an example implementation.

The presentation can have its own expressive visual identity. The system being explained is intended for utility-oriented digital products such as commerce, delivery, finance, productivity and services. Games are outside this framework's primary scope.

## 1. Overview and logical structure

**Title:** Motion design system

**Core description:** A reusable framework for how everyday digital products respond, change and guide.

**Positioning:** Clarity in the interaction. Consistency in the implementation.

**Author:** Nitish - Product Motion & Interaction

**Version:** Framework v0.1

### Eight conceptual layers

1. **Principles and purpose:** Why motion is used and what it helps people understand.
2. **Motion personality:** How a product's character translates into movement and contextual expression.
3. **Foundations and tokens:** Shared values and named presets for timing, easing, physics and visual changes.
4. **Behaviour patterns:** Reusable solutions to common interaction needs.
5. **Component behaviour:** States, triggers, transitions, outcomes and interruption rules for a specific component.
6. **Screen and flow choreography:** Coordination between components across a screen or journey.
7. **Accessibility and adaptation:** Preservation of meaning across motion preferences, platforms and runtime conditions.
8. **Delivery and governance:** Implementation, documentation, verification, ownership and versioning.

### Relationships between layers

- Principles guide every motion decision.
- The product motion profile tunes the foundations and defines where expression is appropriate.
- Tokens provide reusable parameters for behaviour patterns and component transitions.
- Patterns describe reusable interaction solutions; components apply those solutions to concrete states and events.
- Choreography coordinates multiple component behaviours within a larger interaction.
- Accessibility and adaptation apply to every layer, including the portfolio's own interactive demonstrations.
- Delivery and governance keep design specifications, code and verification aligned across versions.

### Three complementary system concerns

- **Shared core:** Reusable behavioural rules, patterns and specification structures.
- **Product profile:** Contextual choices about personality, emphasis and expressive range.
- **Platform delivery:** Components, presets, accessibility behaviour and verification for each target platform.

These are related concerns, not a user journey. A diagram may connect them, but should not imply that they are three sequential screens in an app.

## 2. Layer 1: Principles and purpose

Suggested display headline: **Consistent behaviour begins with clear intent.**

### Principles

1. **Acknowledge input.** Give prompt feedback so people know their action registered.
2. **Preserve continuity.** Show relationships between states, objects and destinations.
3. **Represent real state.** Let application events determine progress, success and failure.
4. **Keep people in control.** Define interruption, reversal and cancellation as normal behaviour.
5. **Use attention deliberately.** Emphasise meaningful changes. An instant update is a valid choice.

### Operational consequences

- Every animation has an identifiable communication purpose.
- Feedback starts promptly; decorative sequences do not unnecessarily block progress.
- Completion of an animation does not establish completion of a business operation.
- Repeated input, dismissal during entry and navigation away are specified explicitly.
- Considering motion is mandatory; animating every state change is not.

## 3. Layer 2: Motion personality

Suggested display headline: **A shared structure. A distinct product character.**

Translate broad brand qualities into concrete choices:

- **Response:** How quickly feedback begins and how the movement settles.
- **Elasticity:** Where overshoot is permitted and how much is appropriate.
- **Travel:** How compact or expansive spatial movement can be in different contexts.
- **Emphasis:** Which events deserve stronger expression.
- **Frequency:** How often expressive moments appear.

### Two contextual modes

- **Everyday:** Focused, efficient and familiar. Suitable for frequently repeated tasks and routine feedback.
- **Expressive:** Selective, contextual and memorable. Suitable for meaningful milestones, rewards or moments that benefit from emphasis.

Both modes can exist within the same product. For example, processing can be restrained, confirmation clear and a reward reveal more expressive. These are illustrative product contexts, not claims about a particular company's system.

## 4. Layer 3: Foundations and tokens

Suggested display headline: **From intent to reusable values.**

### Token hierarchy

1. **Primitive values:** Raw values such as durations, easing curves, spring parameters, opacity endpoints, scale factors and movement distances.
2. **Semantic roles:** Named presets that express purpose and reference primitive values.
3. **Component mappings:** Specific component transitions that reference semantic roles, with documented contextual adjustments.

Example dependency:

- `duration.240` is a primitive whose illustrative value is `240 ms`.
- `motion.surface.enter` is a semantic role that may reference this duration plus a curve and other values.
- `sheet.open` is a component transition that maps to `motion.surface.enter`.

This is a dependency hierarchy, not three separate animations.

### Illustrative baseline

These are example starting values, not universal standards or validated production defaults.

| Semantic role | Example duration | Intended use |
| --- | --- | --- |
| `motion.feedback.press` | 120 ms | Press and release acknowledgement |
| `motion.surface.enter` | 240 ms | Reveal a surface from its origin |
| `motion.surface.exit` | 180 ms | Dismiss a surface |
| `motion.content.change` | 160 ms | Update a label or small content area |

Supporting example values:

- Opacity endpoints: 0 and 1.
- Press scale: 1 to 0.98, returning to 1 on release.
- Surface travel: 24 px to its final position.
- Example easing curve: `cubic-bezier(0.2, 0, 0, 1)`.

Timing, curves and movement values must be paired explicitly in a component specification. The example curve is not a requirement for every role.

### Timing curves and springs

- Timed transitions define duration and easing.
- Springs define response and settling through physics parameters; their effective duration can vary with the motion and interruption.
- Keep spatial movement and visual effects independently tunable.
- Translate behaviour appropriately for each platform. Pixel values in these examples should not silently become universal native-platform units.

## 5. Layer 4: Reusable behaviour patterns

Suggested display headline: **A library organised by user need.**

| Pattern family | User question | Common applications |
| --- | --- | --- |
| Input and feedback | Did my action register? | Press, select, toggle, validate |
| Visibility and disclosure | What became available? | Open, close, expand, collapse |
| Navigation and continuity | Where did I go? | Forward, back, detail, tab change |
| Content and layout | What changed on this screen? | Insert, remove, reorder, update |
| Progress and waiting | Is something happening? | Load, refresh, upload, process |
| Outcomes and recovery | What happened? What next? | Confirm, fail, retry, undo |
| Attention and expression | What deserves attention? | Guidance, achievements, rewards |

### Required information for a pattern

- Purpose and user need.
- When to use it and when an alternative is preferable.
- Behaviour, triggers and applicable parameters.
- Relationships to other components or events.
- Interruption and exception handling.
- Reduced-motion and other accessible alternatives.
- References to supported component implementations.

Fade, slide and scale are visual techniques. A pattern explains which technique supports a particular interaction and why.

## 6. Layer 5: Component behaviour

Suggested display headline: **Every transition has a contract.**

Each component specification should make these details explicit:

1. Purpose.
2. Available states.
3. Events that trigger state changes.
4. Animated properties, endpoints and origins.
5. Token references, timing, easing or spring parameters.
6. Coordination with other components.
7. Repeated-input, interruption and cancellation behaviour.
8. Loading, failure, uncertain outcomes and recovery.
9. Reduced-motion behaviour and accessible feedback.
10. Implementation reference and observable acceptance criteria.

### Example component: Save changes

Application events drive the state. Motion communicates that state.

#### States

- `ready`: An editable form is available.
- `saving`: A request is in progress.
- `saved`: The application has confirmed the save.
- `failed`: A definite failure is known; recovery is available.
- `checking_status`: The outcome is unresolved and needs reconciliation.

#### State-transition relationships

| Current state | Event | Next state |
| --- | --- | --- |
| `ready` | Submit | `saving` |
| `saving` | Confirmed save | `saved` |
| `saving` | Definite rejection or failure | `failed` |
| `saving` | Outcome becomes uncertain | `checking_status` |
| `checking_status` | Confirmed save after reconciliation | `saved` |
| `checking_status` | Definite failure after reconciliation | `failed` |
| `failed` | Retry | `saving` |
| `saved` | User makes a new edit | `ready` |

Unknown outcome must remain distinct from definite failure. A timeout alone must not automatically be presented as proof that the operation failed.

#### Example motion and interaction rules

- Press acknowledgement scales the visual button from 1 to 0.98 over an illustrative 120 ms.
- Release restores the visual scale to 1.
- Label changes use an illustrative 160 ms opacity transition.
- Keep the button's hit area and layout width stable.
- Prevent duplicate submission while the same save request is pending.
- If the user leaves the screen, stop local animation; the application remains responsible for save status.
- With reduced motion, remove scaling and decorative loops while retaining readable status and meaningful announcements.
- Never infer a successful save from an animation finishing.

The table above is the authoritative description of the state diagram. Any visualisation should preserve its branching and recovery paths.

## 7. Layer 6: Screen and flow choreography

Suggested display headline: **A screen moves as one system.**

Choreography defines how related component behaviours work together. It includes grouping, origins, overlap, sequencing, interruption and focus behaviour.

### Example interaction: Open a bottom sheet

#### Three explanatory stages

1. **Trigger:** The user action initiates the transition.
2. **Transition:** The surface, background scrim and sheet content enter in coordination.
3. **Available:** The sheet settles into its usable state.

These are explanatory snapshots of one interaction, not three screens requiring separate user actions.

#### Illustrative timeline

All three tracks start at the same trigger time. They overlap; they do not play sequentially.

| Track | Start | Duration | Finish |
| --- | --- | --- | --- |
| Background scrim | 0 ms | 160 ms | 160 ms |
| Sheet surface | 0 ms | 240 ms | 240 ms |
| Sheet content | 0 ms | 160 ms | 160 ms |

Example surface properties: translation from 24 px below its resting position to 0, with opacity from 0 to 1.

If the content is inside the animated surface, account for inherited movement and opacity. Avoid accidentally applying the same translation twice or stacking opacity fades unintentionally. Specify which properties each track owns.

### Coordination rules

- Group related changes so the surface and its contents share a coherent origin.
- Let dismissal continue from the current visual position if entry is interrupted.
- Manage modal focus, keyboard interaction and focus restoration on dismissal.
- Define when controls become usable; decorative completion should not introduce unnecessary delay.
- Keep several unrelated elements from competing for attention.

## 8. Layer 7: Accessibility and adaptation

Suggested display headline: **Preserve meaning across conditions.**

Accessibility applies to every pattern and component. It is not a final visual polish step.

### Default and reduced-motion behaviours

- A default interaction may use small spatial movement to explain a change.
- A reduced-motion alternative may use an immediate update or another suitable low-motion treatment.
- Both variants communicate the same state, outcome and available next action.
- Making every animation faster is not a sufficient general reduced-motion strategy.

### Four adaptation concerns

1. **Communication beyond movement:** Readable status, persistent outcomes and appropriate assistive-technology announcements.
2. **Platform conventions:** Native navigation, gestures, motion preferences and right-to-left layouts where relevant.
3. **Runtime conditions:** Slow responses, backgrounding, repeated input, interruption and out-of-order results.
4. **Measurable performance budgets:** Agreed device targets and budgets for responsiveness, frame stability and asset cost, verified on actual hardware.

The interaction must remain understandable when motion is reduced, interrupted or unavailable.

## 9. Layer 8: Delivery and governance

Suggested display headline: **Build it into the product process.**

### Product process

1. **Map:** Identify states, relationships and user needs.
2. **Compose:** Apply existing patterns and components.
3. **Prototype:** Resolve unfamiliar behaviour with engineering.
4. **Verify:** Check real devices, edge cases and accessibility.
5. **Evolve:** Review new patterns and version changes.

### System deliverables

- **Guidelines and specimens:** Purpose, usage rules, state maps and visual references.
- **Tokens and coded components:** Shared definitions, platform mappings and accessible defaults.
- **Ownership and change history:** Versioned decisions, responsibilities and contribution rules.

Standard component motion should be built into the coded component. Developers connect application state and configure supported options. Documentation explains defaults, composition and exceptions.

### Ownership model

- Motion design and engineering maintain the foundations together.
- Product designers and engineers apply established patterns and contribute unmet requirements.
- Shared changes are reviewed, documented and versioned.
- Design specifications and production implementations reference the same named definitions and version.

### Release criteria for an implementation

- State changes and displayed outcomes match application events.
- Interruption and repeated-input behaviour are verified.
- Reduced motion and nonvisual feedback are verified.
- Performance meets agreed platform budgets.
- Design specifications and code use the same version.

These are criteria for a future or actual implementation, not a claim that the supplied framework has passed production verification.

## 10. Suggested portfolio reading sequence

1. Introduce what the system is, whom it serves and the problem it addresses.
2. Show the eight-layer architecture in a quickly understandable overview.
3. Explain principles and product personality together.
4. Show how values become semantic tokens and component behaviour.
5. Introduce the reusable pattern families.
6. Demonstrate one fully explained component with states and interruptions.
7. Demonstrate how components coordinate in a larger interaction.
8. Explain accessibility and platform/runtime adaptation.
9. Close with implementation, ownership and verification.

This is an information sequence, not a fixed layout. A reader should be able to understand the system without playing any animation. Interactive demonstrations can provide additional depth.

## 11. Reference frameworks

These sources inform the approach. The eight-layer architecture is a synthesis, not a claim that any one source prescribes this exact structure.

- IBM Carbon, motion principles and modes: https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview
- Material 3, motion physics and tokens: https://m3.material.io/styles/motion/overview/how-it-works
- Adobe Spectrum, motion and direction: https://spectrum.adobe.com/foundations/behavior/motion
- W3C, animation from interactions: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- W3C, respecting reduced-motion preferences: https://www.w3.org/WAI/WCAG22/Techniques/css/C39

## 12. Final review for the portfolio presentation

- Are all eight conceptual layers represented and their relationships clear?
- Can a reader distinguish shared rules, product choices and illustrative values?
- Does the developer perspective include state, parameters, interruptions, accessibility and implementation?
- Do the Save changes diagram and bottom-sheet timeline preserve the explicit relationships above?
- Is the portfolio presentation understandable without animation or colour alone?
- Does the visual interpretation feel original while preserving the system's meaning?
- Are all claims supported by the supplied material, with examples identified appropriately?
