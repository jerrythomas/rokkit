# Chart — Grid axis control + observation highlight

**Date:** 2026-08-13
**Status:** Backlog — agreed design, ready to plan
**Site Applicability:** Library work in `@rokkit/chart` (`Plot`, `Grid`, geoms, `AreaChart`/`LineChart`
wrappers). Showcase + e2e live in `apps/learn`. Design docs: `docs/design/20-chart.md`,
`21-charts.md`. Reference docs: `apps/learn/**/llms/components/{area-chart,line-chart,plot-chart}.txt`.

## Summary

Two additive, backward-compatible capabilities on the chart components, motivated by a
minimalist time-series mock (30-day daily line/area, faint horizontal grid, a single
highlighted "today" observation):

1. **Grid axis control** — a `grid` prop that selects which axes draw grid lines
   (`boolean | 'x' | 'y' | 'both'`), including **vertical grid lines on a continuous/time
   x-scale** (today they only render for band/bar scales), plus first-class CSS theming hooks.
2. **Observation highlight** — a `highlight` prop that marks a specific observation (or
   several) with a styled marker layered above the series, themed purely via CSS.

Both land on the composable primitives **and** the high-level wrappers, per the agreed scope.

Not in this item: a dashed **average/reference line** (a separate `ReferenceLine`/threshold
feature) and giving `<AreaChart>` a crisp top stroke — the showcase composes
`PlotChart + GeomArea + GeomLine` to reproduce the mock's outlined area.

---

## Feature 1 — Grid axis control

### Public API

On `<PlotChart>` (`Plot.svelte`), `<AreaChart>`, `<LineChart>`:

```ts
grid?: boolean | 'x' | 'y' | 'both'   // default: true
```

| Value            | Behaviour                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------- |
| `true` (default) | **Auto** — horizontal (y) lines always; vertical (x) lines only for band/bar scales. **Identical to today's behaviour → zero regression.** |
| `'y'`            | Horizontal lines only.                                                                         |
| `'x'`            | Vertical lines only.                                                                           |
| `'both'`         | Both. **New capability:** vertical lines on a continuous/time x-scale at the x-tick positions. |
| `false`          | No grid.                                                                                       |

Rationale for `true` = auto (not `'both'`): keeps every existing continuous chart
(line/area) horizontal-only and every existing bar chart both-axes — nothing changes unless a
consumer opts in. Forcing verticals on a time series (the mock) is the explicit `'both'`/`'x'`.

### Internals

- `Plot/Grid.svelte` gains an internal `lines: 'auto' | 'x' | 'y' | 'both'` prop and receives
  `xTicks` / `yTicks` from `Plot.svelte`.
- Vertical lines for a **continuous** scale are drawn at `xScale.ticks(xTicks ?? 6)`, mirroring
  `Axis.svelte`, so grid and axis ticks align. (Today `Grid` hardcodes `ticks(6)` independently;
  this removes that drift.) Band-scale verticals keep the existing band-center positions.
- `Plot.svelte` maps the public `grid` value → `Grid`'s `lines`, passes `xTicks`/`yTicks`, and
  toggles `Grid` on for any value other than `false`.
- `AreaChart`/`LineChart` widen their existing `grid` prop type from `boolean` to the union and
  forward it unchanged.

### Theming

Formalize per-orientation attributes and add CSS-var hooks (defaults preserve today's look):

```
data-plot-grid-line="x"   /* vertical   */
data-plot-grid-line="y"   /* horizontal */
```

```css
[data-plot-grid-line] {
  stroke: var(--chart-grid-color, currentColor);
  stroke-width: var(--chart-grid-width, 1);
  stroke-dasharray: var(--chart-grid-dash, 2 4);
  opacity: var(--chart-grid-opacity, 0.15);
}
```

Consumers restyle all lines via the vars, or target one orientation (e.g. solid horizontals,
no verticals) via the attribute. Existing `--chart-grid-color` continues to work unchanged.

---

## Feature 2 — Observation highlight

### Public API

On `<PlotChart>`, `<AreaChart>`, `<LineChart>`:

```ts
highlight?: 'last' | 'first' | 'min' | 'max' | number | ((row: Row, i: number) => boolean)
```

| Selector                | Resolves to                                             |
| ----------------------- | ------------------------------------------------------- |
| `'first'` / `'last'`    | First / last datum in **data order**.                   |
| `'min'` / `'max'`       | Datum with the min / max **y** value.                   |
| `number`                | Datum at that **index**.                                |
| `(row, i) => boolean`   | **Every** matching datum (supports multi-highlight).    |

### Rendering — new primitive

- New geom `geoms/Highlight.svelte`, exported as `GeomHighlight` and as `Plot.Highlight`.
- Reads `data`, `xScale`, `yScale` from plot-state; takes `x` / `y` channel names and the
  `highlight` selector. Draws a marker `<circle>` at each selected datum, layered **above** the
  line/area. Standalone (not bolted onto `<Line>`/`<Area>`) so an area+line combo does not
  double-render and so it composes onto any geom.
- Optional `label?: boolean | string | ((row) => string)` (default **off**) renders a text
  callout beside the marker.
- Does **not** `registerGeom` for domain — highlighted points already sit inside the series
  domain; it is a pure overlay.
- Wrappers add a `highlight` prop and render `<Highlight>` internally using their own `x`/`y`.

### Theming (CSS only — no color/size props)

```
data-plot-highlight        /* the marker circle */
data-plot-highlight-label  /* optional callout  */
```

```css
[data-plot-highlight] {
  fill: var(--chart-highlight-color, rgb(var(--color-accent-500, 194 65 12)));
  stroke: var(--chart-highlight-ring, none);
  r: var(--chart-highlight-radius, 4);
}
```

Appearance is entirely theme CSS, consistent with the library's data-attribute house style.

---

## Scope / files

**Library (`packages/chart`):**

- `src/Plot/Grid.svelte` — `lines` prop, tick alignment, per-orientation attrs + CSS vars.
- `src/geoms/Highlight.svelte` *(new)* + a selector-resolution helper in `src/lib/` (e.g.
  `lib/highlight.js`) with unit-testable pure logic.
- `src/Plot.svelte` — widen `grid`, add `highlight`, render `Grid` (mapped) + `Highlight`.
- `src/charts/AreaChart.svelte`, `src/charts/LineChart.svelte` — widen `grid`, add `highlight`,
  forward both.
- `src/index.js` — export `Plot.Highlight` and `GeomHighlight`.

**Tests (`packages/chart/spec/`):**

- `Grid.spec.js` *(new)* — `grid='x'` renders verticals on a continuous scale; `'y'` horizontals
  only; `'both'` both; `true` = auto (y + band-x, no continuous verticals); `false` = none; grid
  x-line positions equal axis x-tick positions.
- `highlight.spec.js` *(new)* — each selector resolves to the correct index/coordinates; predicate
  matches multiple; `data-plot-highlight` present; label toggles.
- Extend `Plot.spec.js` — wrappers forward `grid` + `highlight` through to primitives.

**Showcase + e2e (`apps/learn`):**

- Add a **"Last 30 days" showcase** on the chart page reproducing the mock: `PlotChart` +
  `GeomArea` + `GeomLine` + `grid="both"` + `highlight="last"` + custom `xFormat` (`-29d … today`).
  Also show the one-liner `<AreaChart grid="both" highlight="max" />` variant and a
  per-orientation CSS-themed grid example.
- Playwright e2e asserting the showcase renders the highlight marker and the horizontal +
  vertical grid lines.

## Docs & references (post-implementation)

- Update `docs/design/20-chart.md` and `docs/design/21-charts.md` — document the `grid` union,
  the `Highlight` primitive, and the new CSS-var theming hooks.
- Refresh the reference/"skill" docs the library ships:
  `apps/learn/**/llms/components/{area-chart,line-chart,plot-chart}.txt` (props, data-attributes,
  CSS vars). Add a `highlight.txt` primitive entry if the llms index lists geoms individually.
- Audit chart-facing skills for staleness: `.claude/skills/rokkit-components/SKILL.md` and the
  semantic-styles-rokkit token vocabulary — add the `--chart-grid-*` / `--chart-highlight-*`
  tokens if those skills enumerate chart tokens. (Grep during implementation; only touch if
  they currently mention chart props/tokens.)
- `docs/design/12-priority.md`, `agents/journal.md` — per the completion checklist.

## Out of scope

- Dashed **average / reference / threshold line** — separate `ReferenceLine` (`Plot.Rule`)
  feature; file as its own backlog item.
- A crisp top stroke on the `<AreaChart>` wrapper — the showcase composes `Area + Line` instead.
- Grid line **count** as a prop — grid density derives from `xTicks`/`yTicks`; no separate knob.
- Interactive/hover highlighting — this is a **static, data-driven** marker only.

## Deliverable

`grid: boolean | 'x' | 'y' | 'both'` and `highlight: selector` on the composable primitives and
the `AreaChart`/`LineChart` wrappers, CSS-var theming for both, unit + e2e coverage, a learn-app
showcase reproducing the mock, and refreshed design/reference/skill docs. Backward compatible;
ships on the normal patch cadence. Gate: lint 0 errors + `bun run test:ci` green.

## Acceptance criteria

- [ ] `grid='both'` draws vertical grid lines on a continuous x-scale at x-tick positions; `true`
      leaves every existing chart visually unchanged.
- [ ] Grid x-line positions equal the x-axis tick positions (alignment).
- [ ] `[data-plot-grid-line="x"]` / `="y"` and `--chart-grid-{color,width,dash,opacity}` restyle
      grid lines; per-orientation targeting works.
- [ ] `highlight` resolves `first`/`last`/`min`/`max`/index/predicate to the correct
      observation(s) and renders a marker above the series with `data-plot-highlight`.
- [ ] `--chart-highlight-{color,radius,ring}` restyle the marker; no color/size component props.
- [ ] Both features work via the wrappers **and** the composable `Plot.*` primitives.
- [ ] Learn showcase reproduces the mock; Playwright guards grid + highlight render.
- [ ] Design docs, llms reference docs, and any chart-facing skills updated.
- [ ] Lint 0 errors; `bun run test:ci` green.
