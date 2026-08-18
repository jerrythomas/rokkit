# Sparkline demo + live chart gallery + e2e verification (#147)

**Date:** 2026-08-18
**Status:** Design approved
**Issue:** [#147](https://github.com/jerrythomas/rokkit/issues/147)
**App:** `apps/learn`

## Problem

The enriched `Sparkline` (spark line/bar/area + `baseline`/`highlight`/`trend`) shipped in **v1.3.14**
but has **no live surface** in the learn app: the chart demo mounts `ChartExplorer` (14 axis-based
geoms, no sparkline) and the authored snippet in `demos/chart/meta.ts` is inert metadata (chart has
no Code tab). Separately, the two chart e2e specs (`chart-metrics.e2e.ts`, `chart-select.e2e.ts`)
target a "Metrics/trend/highlight" showcase that `ChartExplorer` **replaced**, so they test removed
UI and would fail against live code.

## Goals

1. A **dedicated, chat-based Sparkline demo** at `/app/sparkline` — its own Koan catalog entry (the
   same exploration mechanism tabs/charts/etc. use), NOT a type folded under `/app/chart`.
2. A **live chart gallery in the guides** — guides currently render static markdown; make them able
   to embed live charts/sparklines by reusing the existing `@rokkit/blocks` plugin system.
3. **Playwright verification** — repurpose the two stale chart specs to the current `ChartExplorer`,
   and add a spec covering the sparkline demo + the guide gallery. Leave the e2e suite green and
   meaningful.

## Non-goals

- No change to `packages/chart` `Sparkline.svelte` (shipped in v1.3.14; feature-complete).
- Not folding sparkline into `ChartExplorer` (explicitly rejected — it's a sibling demo).
- Line/area negative-fill (#148) and the blocks/duplicate consolidation beyond the dead-code delete
  (#149) are separate.

---

## Part 1 — `/app/sparkline`: dedicated chat-based Sparkline demo

Mirror the chart demo's structure (`apps/learn/src/lib/koan/demos/chart/`). New folder
`apps/learn/src/lib/koan/demos/sparkline/`:

- **`meta.ts`** — a `DemoMeta` (`id: 'sparkline'`, `title: 'Sparkline'`, `category: 'data'`,
  keywords, `load: () => import('./index.svelte')`, an LLM `tool` (`mount_sparkline`), an `api`
  table for the `Sparkline` props (`data`, `type`, `baseline`, `highlight`, `trend`, `curve`,
  `color`, `pattern`, `width`, `height`), and `docs` from `./docs.md?raw`).
- **`index.svelte`** — default export mounted by the shell's generic dynamic-mount; renders
  `<SparklineExplorer />`.
- **`SparklineExplorer.svelte`** — the interactive canvas. Renders a primary `<Sparkline>` driven by
  the store settings, wrapped in `<div data-sparkline-demo>` for stable e2e targeting, plus a small
  "in a table row" KPI example so the inline use case reads. Uses one fixed mixed-sign sample series
  (e.g. `[12, -8, 23, -17, 34, 56, -9, 41]`) so `baseline` has negatives to anchor.
- **`store.svelte.ts`** — a small singleton store `sparkline` with
  `settings = { type: 'line'|'bar'|'area', baseline: boolean, highlight: 'none'|'minmax'|'last'|'all',
  trend: 'none'|'avg'|'linear' }`, `set(key, value)`, `describe()`, and `tips`. Simpler than the
  chart registry (a single component with variant settings, not a 14-type registry). The store maps
  its settings to real `Sparkline` props: `baseline` → `0` when on; `highlight: 'minmax'` →
  `['min','max']`, `'all'` → `['min','max','last']`; `trend: 'avg'|'linear'` → the method (or omit).
- **`SparklineControls.svelte`** — control rows (segmented buttons / checkbox) for type / baseline /
  highlight / trend, gated the same way `ChartControls` renders rows. Each control carries
  `data-sparkline-control="type|baseline|highlight|trend"` and buttons carry `data-active` for e2e.
- **`docs.md`** — the Docs tab / `/components/sparkline` content: what a sparkline is, the enriched
  props, table-cell/KPI usage.

**Registration & wiring:**
- `apps/learn/src/lib/koan/catalog.ts` — import `sparkline from './demos/sparkline/meta'`, add to
  `catalog[]`, add `sparkline: '/app/sparkline'` to `DEMO_ROUTE` (required — `routeFor` returns
  `null` for ids missing here).
- **Move** the `'sparkline'`, `'spark-line'`, `'inline-chart'` keywords **from** `demos/chart/meta.ts`
  **to** the new sparkline meta so a "sparkline" search resolves to the dedicated demo.
- `apps/learn/src/routes/app/sparkline/+page.svelte` — mirror `app/chart/+page.svelte`
  (`setShellResponse('sparkline')`, seed `shell.lastQuery`).
- Shell demo type: add `'sparkline'` to `ShellDemoType` in `shell.svelte.ts`.
- Tweak-drawer controls: wire `SparklineControls` into the composer "tweak" details slab in
  `routes/app/+layout.svelte` the same way `ChartControls` is wired for the chart demo, gated by the
  sparkline demo type (per the "controls in the toggled details slab" convention).

Once registered, the demo auto-gets: the Live canvas (generic dynamic mount), the **API** tab (from
`meta.api`), the **Docs** tab (from `docs.md`), a prerendered `/components/sparkline` page, and
catalog search/LLM discoverability — no extra layout work for those surfaces.

---

## Part 2 — live chart gallery in the guides

Guides render via `GuidePage.svelte` → `<MarkdownRenderer {markdown} />` with **no `plugins`**, so
fenced blocks are static. The chat demo already renders live charts from fences via the
`@rokkit/blocks` plugin list inlined in `chat-demo/components/BlockList.svelte`
(`PlotPlugin`, `TablePlugin`, …, `SparklinePlugin`, `MermaidPlugin`). `SparklinePlugin` parses a
` ```sparkline ` JSON fence and spreads it into `<Sparkline {...spec} />` — it already forwards the
enriched props (they're plain JSON: `baseline` number, `highlight` array, `trend` string/array).

**Design (reuse, don't fork):**
- Extract the plugin list to a **shared module** (e.g. `apps/learn/src/lib/koan/block-plugins.ts`
  exporting `BLOCK_PLUGINS`); import it in **both** `BlockList.svelte` and `GuidePage.svelte`.
- Pass `plugins={BLOCK_PLUGINS}` to `GuidePage`'s `MarkdownRenderer` → guides can now embed live
  charts/sparklines.
- Add a live **sparkline gallery** section to `apps/learn/src/lib/guides/charts/content.md` using
  ` ```sparkline ` fences covering: line / bar / area, **negative-baseline bars**, min/max/last
  markers, a trend line, and an in-table KPI example. The mechanism is general (`PlotPlugin` too), so
  a broader chart gallery can grow later without more plumbing.

---

## Part 3 — Playwright verification (repurpose in place)

`apps/learn/playwright.config.ts`: chromium, `baseURL http://localhost:4173`,
`webServer: bun run build && bun run preview`. Convention (from the existing specs): navigate with
`page.goto('/app/…')`, assert on emitted `data-plot-*` attributes, use `toBeAttached()` + `count()`
for 1px axis-aligned SVG shapes (Chromium `toBeVisible()` fails on degenerate boxes).

- **`chart-metrics.e2e.ts`** → rewrite to the current `ChartExplorer`: land on `/app/chart`, select a
  couple of types via `[data-chart-type="…"]`, assert the corresponding geom renders
  (`[data-plot-geom]` / `[data-plot-element]`). Drop all references to the removed "Metrics" section.
- **`chart-select.e2e.ts`** → rewrite to exercise the current explorer's live selection/toggles
  against `[data-plot-*]` on the live `PlotChart` (keep meaningful selection coverage; drop the dead
  showcase).
- **`sparkline.e2e.ts`** (new):
  - `/app/sparkline`: toggle each control via `[data-sparkline-control]`; assert
    `[data-plot-baseline]` appears when baseline is on and bars are selected, `[data-plot-highlight]`
    when highlight is on, `[data-plot-trend]` when trend is on — all scoped to `[data-sparkline-demo]`.
  - `/guides/charts`: assert the guide renders live sparklines — `[data-sparkline-plugin]` present,
    containing `[data-plot-baseline]`/`[data-plot-highlight]`/`[data-plot-trend]` marks.

---

## Also in scope

- **Delete the dead app-local duplicate** `apps/learn/src/lib/components/Sparkline.svelte` (imported
  nowhere; unrelated hand-rolled `<polyline>`). This is the trivial dead-code slice of #149; the full
  blocks/plugin consolidation stays in #149.

## Testability contract (data-attributes)

- Demo canvas wrapper: `data-sparkline-demo`.
- Controls: `data-sparkline-control="type|baseline|highlight|trend"`, active buttons `data-active`.
- Sparkline marks (already emitted by the component): `data-plot-baseline`, `data-plot-highlight`,
  `data-plot-trend`, `data-plot-geom="trend|highlight"`.
- Block-rendered sparkline in guides: `data-sparkline-plugin` (from `SparklinePlugin`).

## Acceptance criteria

1. `/app/sparkline` renders a live, interactive sparkline; toggling type/baseline/highlight/trend
   changes the rendered marks. API + Docs tabs and `/components/sparkline` exist.
2. The Charts guide renders live sparklines (negative bars, markers, trend) via fenced blocks.
3. `bun run build && playwright test` is **green**: the two repurposed chart specs pass against the
   current explorer, and `sparkline.e2e.ts` passes.
4. No dead app-local sparkline duplicate remains; a "sparkline" catalog search resolves to the new
   demo.

## Out of scope

- `packages/chart` changes; line/area negative-fill (#148); full blocks/duplicate consolidation
  beyond the dead-code delete (#149); multi-quadrant (#150).

## References

- Enriched Sparkline: `docs/superpowers/specs/2026-08-18-enriched-sparkline-design.md`, journal
  2026-08-18, shipped v1.3.14.
- Contracts: `demos/chart/{meta.ts,ChartExplorer.svelte,ChartControls.svelte,store.svelte.ts,registry.ts}`,
  `koan/catalog.ts` (`DEMO_ROUTE`), `chat-demo/components/BlockList.svelte` (`PLUGINS`),
  `koan/components/GuidePage.svelte`, `packages/blocks/src/SparklinePlugin.svelte`,
  `playwright.config.ts`.
