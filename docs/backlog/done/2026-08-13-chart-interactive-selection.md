# Chart — interactive select event + opt-in click-to-highlight

**Date:** 2026-08-13
**Status:** Backlog — agreed design, ready to plan
**Site Applicability:** `@rokkit/chart` (`PlotState`, geoms `Line`/`Point`/`Area`/`Bar`, `Highlight`,
`Plot.svelte`, `AreaChart`/`LineChart` wrappers). Showcase + e2e in `apps/learn`. Design docs:
`docs/design/20-chart.md`, `21-charts.md`. Builds on the grid/highlight/trend work (2026-08-13).

## Summary

Make chart observations interactive so a developer can drill or act on a clicked point, and
optionally let clicks build a highlighted selection:

1. **Select event** — `onselect(detail)` on `Plot`/`PlotChart`/`AreaChart`/`LineChart`, fired when
   an observation is clicked (or activated via keyboard). `detail` is a rich object with the datum,
   its index, series, value, x/y, geom type, and the DOM event — enough to drill.
2. **Opt-in click-to-highlight** — `selectable` toggles a multi-selection: clicking a point adds/
   removes it from the selection, rendered through the existing **Highlight** overlay (merged with
   any static `highlight`).
3. **Bindable selection** — `bind:selected` exposes/controls the selected set.

All cartesian geoms (Line, Point, Area, Bar) are clickable. Backward compatible — geoms keep their
existing `onselect(data)` behaviour; nothing changes unless `onselect`/`selectable` is set.

## Key design decisions

- **Selection is keyed by row reference, not index.** `PlotState` already owns `hovered`; it gains a
  `SvelteSet` of selected **row references**. Reference keying is robust across multi-series and
  aggregated (`stat != 'identity'`) charts where a rendered datum may not sit in the raw `data`
  array or share a global index. (During design we considered indices; refs win for robustness.
  `detail.index` — index within the geom's rendered data — is still provided for drill.)
- **`bind:selected` holds row references** (`Row[]`), sourced from clicks / the chart's data. Two-way
  synced with `PlotState`; `PlotState` is the source of truth.
- **Area selection = top-edge vertex hit targets** (same pattern as Line), so clicking a filled area
  maps to the nearest observation rather than an ambiguous whole-region select.
- **Geoms become interactivity-aware via context** — they render hit targets when
  `plotState.interactive` is true (a Plot-level `onselect`/`selectable` is set), not only when their
  own local `onselect`/`keyboard` prop is set. This lets `<LineChart onselect=…>` work without the
  consumer wiring the inner `<Line>`.

---

## API

### Select detail

```ts
type SelectDetail = {
	datum: Row                       // the clicked row (from the geom's rendered data)
	index: number                    // index within the geom's rendered dataset
	series?: unknown                 // color/group value for multi-series, else undefined
	value: unknown                   // row[y]
	x: unknown
	y: unknown                       // the x / y field values
	geom: 'line' | 'point' | 'area' | 'bar'
	event: MouseEvent | KeyboardEvent
}
```

### On `Plot` / `PlotChart` / `AreaChart` / `LineChart`

```ts
onselect?: (detail: SelectDetail) => void   // fired on every observation click/activation
selectable?: boolean                        // opt-in: clicks toggle a highlighted selection (default false)
selected?: Row[]                            // bindable ($bindable) — the selected rows
```

### `PlotState` (new surface)

- `#selected = $state(new SvelteSet())` (row refs); config accepts `onselect`, `selectable`, `selected`.
- `get interactive()` → `!!onselect || selectable`
- `handleSelect(detail)` → always `onselect?.(detail)`; if `selectable`, toggle `detail.datum` in `#selected`
- `isSelected(row)`, `get selectedRows()` (array), `setSelected(rows)`, `clearSelected()`

## Rendering & theming

- **Highlight overlay** renders `resolveHighlight(highlight)` marks ∪ `plotState.selectedRows`, deduped
  by row reference. Selected marks carry `data-plot-selected="true"`.
- Plot renders `<Highlight>` when `highlight != null` **or** selection is active (`selectable` or a
  non-empty `selected`).
- Theming: `[data-plot-highlight][data-plot-selected="true"]` gets an optional emphasis ring via
  `--chart-selected-ring` (default: a visible stroke); base marker styling reuses `--chart-highlight-*`.
- Hit targets set `style:cursor:pointer` and `role="button"`/`tabindex="0"` + Enter/Space activation
  (reusing the geoms' existing `keyboardNav` idiom) so selection is keyboard-accessible.

---

## Scope / files

**Library (`packages/chart`):**

- `src/PlotState.svelte.js` — selection state + `handleSelect`/`interactive`/`selectedRows`/`isSelected`/
  `setSelected`/`clearSelected`; config wiring for `onselect`/`selectable`/`selected`.
- `src/lib/select.js` *(new)* — pure helper `buildSelectDetail(rows, geomData, datum, i, channels, geomType, event)`
  (assembles the `SelectDetail`; unit-testable, no DOM).
- `src/geoms/Line.svelte`, `Point.svelte`, `Bar.svelte`, `Area.svelte` — interactivity-aware hit
  targets that call `plotState.handleSelect(buildSelectDetail(...))`; Area gains top-edge vertex hits;
  keep existing local `onselect(data)`.
- `src/lib/brewing/marks/points.js` — include the row index `i` in `buildPoints` output (for detail).
- `src/geoms/Highlight.svelte` — union static highlight with `plotState.selectedRows`; `data-plot-selected`.
- `src/Plot.svelte` — `onselect`/`selectable`/`selected` props (`selected` `$bindable`); wire into
  PlotState; render `<Highlight>` when selection active; two-way sync `selected`.
- `src/charts/AreaChart.svelte`, `LineChart.svelte` — forward `onselect`/`selectable`/`bind:selected`.

**Tests (`packages/chart/spec/`):**

- `lib/select.spec.js` *(new)* — `buildSelectDetail` assembles datum/index/series/value/x/y/geom.
- `PlotState.spec.js` (extend) — `handleSelect` fires `onselect`; `selectable` toggles; `isSelected`/
  `selectedRows`/`setSelected`/`clearSelected`; `interactive` derivation.
- `selection.spec.js` *(new)* — render `LineChart`/`AreaChart` with `onselect` + `selectable`;
  simulate a click on a hit target → `onselect` called with the right detail; a `data-plot-highlight`
  appears (via `data-plot-selected`); second click toggles it off. Point + Bar covered too.
- Extend `Highlight.spec.js` — renders selection rows unioned with static highlight; dedup.

**Showcase + e2e (`apps/learn`):**

- Extend the "last 30 days" showcase: add `selectable` + `onselect` that records the clicked day's
  value into a small caption ("Selected: day −6 · 84"). Keep it deterministic.
- Playwright: click a point → a `[data-plot-selected="true"]` mark appears and the caption updates.

## Docs

- `docs/design/21-charts.md` (Interaction section: select event, selectable, bindable selected),
  `20-chart.md` (exports/props). Chart demo `meta.ts` — `onselect`/`selectable`/`selected` props +
  `[data-plot-selected]` attr. (llms `*.txt` regenerate from these.)

## Out of scope

- Rubber-band / brush multi-select, lasso, or drag-select (a future `brush` feature; CrossFilter
  already covers coordinated filtering).
- Hover-driven selection, right-click menus, or built-in drill UIs (the `onselect` detail is the hook;
  the app builds the drill).
- Pie/Arc, Box, Violin, Heatmap selection (v1 is cartesian Line/Point/Area/Bar).
- Range/programmatic selection by predicate (dev can `setSelected` from their own logic).

## Deliverable

`onselect(detail)`, `selectable`, and `bind:selected` on the primitives + `AreaChart`/`LineChart`;
all cartesian geoms clickable + keyboard-accessible; selection rendered via the Highlight overlay with
`data-plot-selected` theming; learn showcase (click-to-drill) + Playwright guard; docs. Backward
compatible. Gate: lint 0 errors + `bun run test:ci` green.

## Acceptance criteria

- [ ] Clicking an observation on Line/Point/Bar/Area fires `onselect(detail)` with a correct
      `{ datum, index, series, value, x, y, geom, event }`.
- [ ] `onselect` works when set on the wrapper (`<LineChart onselect=…>`) — no inner-geom wiring needed.
- [ ] With `selectable`, clicking toggles the point in/out of the selection, rendered via the Highlight
      overlay with `data-plot-selected="true"`; multiple points can be selected.
- [ ] `bind:selected` reflects and controls the selection (two-way); `PlotState` is the source of truth.
- [ ] Selection is keyboard-accessible (Enter/Space on a focused hit target).
- [ ] No regression: charts without `onselect`/`selectable` render and behave exactly as before;
      geoms' existing local `onselect(data)` still fires.
- [ ] Learn showcase drill works; Playwright guards click → selected mark + caption.
- [ ] Design + reference docs updated. Lint 0 errors; `bun run test:ci` green.
