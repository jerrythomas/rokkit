# Interactive Chart Explorer demo

**Date:** 2026-08-17
**Status:** Design approved — build (TDD, on `develop`)
**Context:** The Koan `chart` demo mounts all chart shapes at once. Evolve it into a single-chart
explorer so users learn each type independently by tweaking its aesthetics, with leading guidance.

## Goal

Pick one chart type, tweak its settings live (orientation, position, color/fill, pattern, alpha,
legend + type-specifics), and get nudged toward variations and other types.

## Decisions

- **Placement:** evolve the Koan `chart` demo in place.
- **Controls:** chart-first; controls live in an **on-demand right drawer** (⚙ Customize toggles it),
  the chart fills the canvas otherwise. A guidance strip stays visible.
- **Types (14):** *Charts* — Bar, Line, Area, Pie, Scatter, Bubble, Box, Violin. *Geoms* — Heatmap,
  Hexbin, Candlestick, Waterfall, Ribbon, Rule.
- **AI tool:** `mount_charts` gains a `type` param → mounts the explorer pre-set to a requested type.

## Architecture (Component → State → Load)

- **State slice** `state.svelte.ts` — `{ type, settings, drawerOpen }`; getters/setters + a
  `guidanceFor(type)` selector. One source of truth; component + drawer + guidance read/write it.
- **Type registry** `registry.ts` — per-type config: `{ label, group, component, dataset, applies:
  Set<setting>, defaults, typeSpecifics, tips: Tip[] }`. Drives which settings show + the guidance.
  Pure data → unit-testable.
- **Datasets** `datasets.ts` — the existing three (product-series, cars, segments) + new shapes for
  the geoms (matrix→Heatmap, points→Hexbin, OHLC→Candlestick, steps→Waterfall, flows→Ribbon,
  reference values→Rule). Deterministic (no RNG).
- **Components:** `ChartExplorer.svelte` (canvas host) · `ControlDrawer.svelte` (type picker +
  context-aware settings) · `GuidanceStrip.svelte` (tips + one-tap actions that mutate state).

## Settings (context-aware, from `applies`)

`orientation` (Bar/Box/Violin) · `position` stack|dodge|fill|identity (Bar), stack|fill|identity
(Area) · `colorField`/`fillField` · `pattern` · `alpha` · `legend` · type-specifics (pie
`innerRadius`, bubble `size`, …). The drawer renders only settings in the type's `applies` set.

## Guidance

Per-type `tips` + cross-type nudges, each a one-tap action mutating state:
"grouped bars → **stack them**", "see the distribution as a **violin**", "try a **line** next".

## Testing

- Unit: `registry` (every type has a component + dataset + valid `applies`), `state` (set type →
  settings reset to type defaults; settings clamp to `applies`; `guidanceFor` returns tips),
  `datasets` (shapes match each type's field mapping).
- Component/e2e: mount explorer → pick a type → toggle a setting → chart updates; open/close drawer.

## Rollout

1. datasets + registry + state slice (pure, TDD) → commit.
2. ChartExplorer + ControlDrawer + GuidanceStrip → commit.
3. Wire into `demos/chart` (replace gallery) + `mount_charts` `type` param + docs → commit.
4. Playwright verify on the live app.
