# GraphState decomposition

**Status:** IMPLEMENT (2026-09-30). One of the hotspots to finish before the open issues from #165.
**Package:** `@rokkit/graph`

## Why

`src/GraphState.svelte.ts` has 767 lines and complexity 88. It combines four jobs:

- **Config:** about 25 `$state` fields, plus an `update` that is split across three helpers
  only to stay under the complexity bar.
- **Layout pipeline:** the model, the layout function and its result, overlay routing.
- **Selection:** value, expanded cards, related, entity, relationships, and the transitions.
- **View queries:** entities, legends, box attributes, content extent.

Its documentation has also drifted. The class's own JSDoc and `unique`'s JSDoc sit above
`floorLevels`, the cluster-key doc sits above `wedgePath`, and the `groupTint` doc sits above
`nodeShape`.

## Shape

`GraphState`'s public API is unchanged. It becomes the composition root.

| Part | Owns |
|---|---|
| `state/GraphConfig.svelte.ts` | every input, as a declarative field table: default plus normaliser (depth floor, levels floor, nestBy ≠ groupBy). `update` / `apply`, `setDensity` / `setGrouping` |
| `state/GraphSelection.svelte.ts` | value, expanded, related, entity, relationships; `select`, `clear`, `toggleExpanded`, `nodeState`, `edgeState` |
| `model/relationships.ts` (pure) | a node's relationship list over the canonical edges, with routed geometry attached when the layout placed it |
| `model/entities.ts` (pure) | entity rows (row and reference counts) |
| `layout/extent.ts` (pure) | the content extent of clusters, falling back to cards |

## Slices (test first)

1. The pure `relationships` / `entities` / `extent` modules.
2. `GraphConfig`.
3. `GraphSelection`, with the doc comments put back on their members.
4. Differential: the old vs new public surface (every getter, and every per-node / per-edge /
   per-cluster method) over a grid of layouts, options and fixtures, plus transition
   sequences. Plant bugs to prove it can fail. Then re-measure, docs, journal.

Invariants: the graph suite passes unchanged at 100% statement coverage; graph e2e;
lint 0/0; svelte-check.
