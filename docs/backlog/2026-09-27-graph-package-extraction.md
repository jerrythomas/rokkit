# Extract dbd's ER-diagram viewer into `@rokkit/graph`

**Raised:** 2026-09-27, from issue #159
**Status:** OPEN — design agreed, plan pending
**Design:** `docs/design/23-graph.md`
**Upstream:** `sensei-hq/dbd` `site/src/lib/design/` · data contract in `sensei-hq/dbd#24`

## The ask

dbd's schema viewer (ER diagram + entity description table) lives inside the dbd website.
**dbd** and **sensei** both want to render the same thing from the same JSON, so it should
become a Rokkit package rather than be reimplemented twice.

2,860 lines in one cohesive, already-tested directory. Exactly one site coupling
(`Header.svelte` importing `$lib/assets/dbd.svg?raw`).

## Decisions taken

| Question            | Decision                                                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Which package?      | **New `@rokkit/graph`**, not `@rokkit/chart` — different abstraction (nodes/edges/layout vs scales/channels/marks), and a force layout's `d3-force` should not land on every chart consumer |
| Approach            | **Redesign now, port into the new shape** — not a 1:1 lift                                                                                                                                  |
| Data contract       | **Mapped input, canonical internals** — public API takes `nodes`/`edges`/`fields`; a normalizer resolves it once into concrete types                                                        |
| Boundary            | **Viewer core only** — ~1,170 lines of source + ~400 of existing tests. App-shell stays in dbd                                                                                              |
| Group / kind colour | **Semantic `data-node-kind` in CSS** for the closed vocabulary; a **brewer preset** (chart's `createChartPreset` shape, `using: color\|pattern\|symbol`) for open-ended group names         |
| Theme styles        | `base` + `rokkit` in slice 1; other four follow                                                                                                                                             |
| Force-directed      | **Design the layout interface now, build `cluster` first.** Force is slice 2                                                                                                                |
| Learn examples      | Ship **with** the implementation — they are the visual verification surface                                                                                                                 |

## Why this is worth doing

Three things the design fixes rather than carries across:

1. **Issue #159's top risk disappears.** `model.ts` is a hand-written mirror of
   `crates/dbd-core/src/schema_model.rs`, kept in step by hand; #159 worried that sensei as a
   third consumer makes that a real drift risk. Because the package speaks only its own
   canonical model, `SchemaModel` never enters Rokkit — dbd and sensei each map their own shape
   in, and the extraction adds no new consumer to drift against the Rust type.
2. **A live contrast bug gets fixed.** `.dg-row .ctype` and `.dg-fkicon` colour on `--faint` →
   `ink-soft`, inside a `<button>`. `ink-soft` (ink.500, 1.95–2.13:1 on paper) cannot carry an
   interactive control's label or icon. Translating to `ink-mute` fixes it and
   `interaction-contrast.e2e.ts` holds it.
3. **Hand-tuned oklch rules collapse.** Eight hardcoded hue angles, plus six hue-carrying
   cluster/card-head rules (three of them dark-mode duplicates) that sit entirely outside the
   skin system, are replaced by data-attributes plus the preset. The snapshot thumbnail's six
   equivalents stay in dbd with `SchemaSnapshot.svelte`.

Plus a contained cleanup: `chart/src/lib/palette.json`, the categorical half of `preset.js`, and
`brewing/patterns.js` move to `@rokkit/core` so charts and diagrams agree on categorical colour.
All three are internal-only (absent from chart's `exports`), pure data with zero imports, and
ship as a distinct `categoricalPalette` export so no chart baseline moves.

## Slices

1. **ER on a pluggable layout** — scaffold, normalizer, layout interface, `cluster` ported with
   its 344 lines of tests, `Graph`/`EntityDiagram`/`EntityView`/`EntitiesView`, palette move,
   `base` + `rokkit` themes, learn demo, dbd consuming it.
2. **Force-directed / call graph** — a second `LayoutFn` plus `d3-force`. Driven by sensei.
3. **dbd#24 v2 model** — non-table entity kinds and the dependency-edge list. `data-node-kind`
   and `data-edge-kind` already exist for it; lands as normalizer plus theme work.

## Next step

Write the slice 1 implementation plan to `docs/plans/`.
