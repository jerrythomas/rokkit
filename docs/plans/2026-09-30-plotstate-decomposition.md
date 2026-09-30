# PlotState decomposition

**Status:** IMPLEMENT (agreed 2026-09-30 — option A: `Plot.svelte` keeps using one composed
`PlotState`)
**Package:** `@rokkit/chart`

## Why

`PlotState.svelte.js` is rokkit's top hotspot: 614 lines, ~157 decision points, 28 dependents,
41 commits (`apps/learn/scripts/build-architecture-metrics.mjs`). It does nine jobs in one class,
duplicates its geom registry in `SparkState` ("same bug, same fix, both classes"), and carries
geom-specific domain rules (stack, waterfall) that re-implement their builders.

## Shape

Job-specific `.svelte.js` classes, each owning its `$state`/`$derived`, composed by `PlotState`
in dependency order. `PlotState` becomes the composition root: its public surface (the
`GEOM_CONTRACT` and every getter/method consumers use) is preserved as one-line delegations, so
geoms, axes, legend, tooltip, `Spark`, `FacetPlot`, `AnimatedPlot` and `Plot.svelte` are
unchanged. The job classes are public members (`plotState.scales`, …) for new code.

| Class | Owns | Reads |
|---|---|---|
| `PlotConfig` | every input; the only thing `update()` writes (declarative keep/reset table); helper passthroughs | — |
| `GeomRegistry` | geom list, register/update/unregister, `geomData` | config |
| `PlotFrame` | effective margin, inner width/height | config |
| `ChannelState` | effective channels, shared colour values, field getters, geom types | config, registry |
| `OrientationState` | orientation, band-is-x, flipped, `place` | config, channels, registry |
| `InteractionState` | hover, selection, `handleSelect`, `interactive`, zoom | config |
| `ScaleState` | x/y scales, band/value scale; domains from pure per-geom resolvers | config, registry, channels, orientation, frame, interaction |
| `AestheticState` | colours, patterns, symbols, colour-scale type, continuous colour | config, channels |
| `AxisState` | axis crossing (`xAxisY`, `yAxisX`) | scales, config |

`SparkState` reuses `GeomRegistry`.

## Slices (one commit each, test first)

1. Characterisation: `update()` keep/reset semantics per field; `data` / `geomData` identity.
2. `PlotConfig` + the keep/reset table.
3. `GeomRegistry`, adopted by `PlotState` and `SparkState`.
4. `PlotFrame` + `ChannelState`.
5. `OrientationState`.
6. `InteractionState`.
7. `ScaleState` + pure `lib/plot/domains.js` (stack / waterfall rules shared with their builders).
8. `AestheticState` + `AxisState`; `PlotState` left as the composition root.
9. Re-measure (hotspot must leave the corner); docs 20-chart, charts skill, llms; journal.

## Invariants at every slice

Existing `PlotState*.spec.js` and `spark-contract.spec.js` unchanged and green; chart suite;
100% statement gate on chart JS; `check:svelte`; lint 0/0; chart e2e.
