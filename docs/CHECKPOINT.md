# CHECKPOINT

**Slice:** #159 — extract dbd's ER-diagram viewer into a new **`@rokkit/graph`**.
Design agreed and committed (`0b023faa`): `docs/design/23-graph.md` +
`docs/backlog/2026-09-27-graph-package-extraction.md`. **No code yet.**

## Remains

1. Slice-1 plan → `docs/plans/2026-09-27-graph-package-extraction.md`
2. Slice 1: normalizer → `cluster` layout → components → theme → learn demo → dbd consumes it
3. Slice 2: force-directed (sensei's call graph) · Slice 3: dbd#24 v2 model

**Next command:** write the slice-1 plan, TDD-ordered. Port from `~/Developer/dbd/site/src/lib/design/`.

## Decisions locked — do not relitigate

New package, **not** `@rokkit/chart` (chart is scales/channels/marks; `d3-force` must not reach
bar-chart consumers). Entry points `.` + `./schema`. Contract = **mapped input, canonical
internals** (`nodes`/`edges`/`fields`, normalized once). Viewer core only — app-shell and
`SchemaModel` stay in dbd. Theming splits by vocabulary: `data-node-kind` in CSS for the closed
set, a brewer preset for open-ended groups. `base` + `rokkit` themes only. `LayoutFn` interface
now, `cluster` only. **Learn examples ship in slice 1** — they are the verification surface.

## Findings the plan must honour

- `chart/src/lib/palette.json` + categorical `preset.js` + `brewing/patterns.js` → `@rokkit/core`;
  safe (absent from chart's `exports`, zero imports, no d3). Ship as a distinct
  `categoricalPalette`, **not** merged — core's `tailwind.json` is a different palette, so merging
  would move chart baselines.
- `[data-graph-paper]` already exists and **is** the dotted canvas — delete `.dg-dots`.
  `Icon.svelte` does not port (icons-as-CSS-classes, 2026-02).
- **Two live defects to fix, not carry:** `styles.css:194,201` put `.ctype`/`.dg-fkicon` on
  `ink-soft` inside a `<button>` (forbidden → `ink-mute`); `styles.css:174` uses `accent`, whose
  on-color bakes a hex and can't react to a skin (→ `primary`/`on-primary`).
- Contrast sweep must use a **non-default** skin — default maps primary _and_ accent to `shu`.

## Open questions / known-broken

None blocking; nothing broken; `check:types` clean. Deferred: dbd adopting `createGraphPreset` for
`SchemaSnapshot`'s six hue rules. Other open repo item: TypeScript 7 (needs svelte-check > TS 6).
